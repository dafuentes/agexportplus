import React, { Component } from 'react';
import { Dimensions, TouchableHighlight, Image, FlatList, View, Platform } from 'react-native';
import {    Button, 
            Body, 
            Left, 
            Right,  
            Icon, 
            Spinner, 
            Text, 
            Toast,
            Card, 
            CardItem,
            Thumbnail } from 'native-base';

import { SQLite } from 'expo';
import Styles from '../utils/Styles';

const db = SQLite.openDatabase('agexportplus.db');

import axios from 'axios';

class BeneficioScreen extends Component {
    
    static navigationOptions = {
        headerTitleStyle: Platform.OS === 'ios' ? { color: 'white' } : { textAlign: 'center', alignSelf: 'center', marginLeft: 115, fontWeight: 'normal', fontSize: 12, color: 'white' } 
    };

    state = {
        loading: false,
        error: false,
        messageError: '',
        isFetching: false,
        listaDeBeneficios: [],
        sessionID: null,
        rol: '',
    }

    componentWillMount(){
        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { rol, sessionID: session_id } = item;
                    _that.setState({ rol, session_id });
                }
            );
        });
        this.loadBeneficios();
    }

    _goDetalle (index){
        const { listaDeBeneficios } = this.state;
        let detalleBeneficio = listaDeBeneficios[index] || [];
        this.props.navigation.navigate('DetalleBeneficio', {
            detalle: detalleBeneficio
        });
    };

    loadBeneficios = () => {
        const { sessionID, rol } = this.state;
        let urlBeneficios = (rol != 'Regular') ? `http://aeapi.iflexsoftware.com/offer.json/${sessionID}/myOffers` : `http://aeapi.iflexsoftware.com/offer.json`;
        const that = this;
        that.setState({ loading: true });
		axios.get(urlBeneficios)
  		.then(function (responseBeneficios) {
            //console.log(responseBeneficios, 'bug bug');
            console.log(responseBeneficios.data);
            that.setState({ loading: false });
            const { data } = responseBeneficios;
            const { offer } = data;
            const lOfertas = offer || [];
            that.setState({ listaDeBeneficios: lOfertas});
            that.props.navigation.goBack()
  		})
  		.catch(function (errorBeneficios) {
            that.setState({ loading: false })
            if(errorBeneficios.response){
                const { error } = errorBeneficios.response.data;
                const { message } = error;                    
                Toast.show({
                    text: message,
                    position: 'top',
                    buttonText: 'Ok',
                    type:'danger',
                    duration:5000
                });
            }else{
                Toast.show({
                    text: 'Ocurrió un problema, intenta más tarde',
                    position: 'top',
                    buttonText: 'Ok',
                    type:'danger',
                    duration:5000
                });   
            }
  		});
    };

    openQr(offerid){
        this.props.navigation.navigate('Lector', {
            record_id: offerid,
            type: 'Beneficio'
        });
    }

    _onRefresh(){
        this.loadBeneficios();
    }

    _keyExtractor = (item, index) => index.toString();

    _emptyList = () => {
        return(
            <View style={Styles.center}>
                <Text>
                    No hay eventos 
                </Text>
            </View>
        );
    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#CED0CE',
                }}
            />
        );
    };

    _renderItem = ({item, index}) => {
        const screenWidth = Dimensions.get('window').width;
        const { rol } = this.state;
        //const { onGoDetalle } = this.props
        return(
            
            <TouchableHighlight>
              <Card>
                <CardItem>
                  <Left>
                    <Thumbnail square small source={{uri: item.images[0].url}} />
                    <Body>
                      <Text>{item.name}</Text>
                      <Text note>{item.description}</Text>
                    </Body>
                  </Left>
                </CardItem>
                <CardItem button onPress={() => this._goDetalle(index)} cardBody>
                    <Image source={{uri: item.images[1].url }} style={{height: 250, width: null, flex: 1}} />
                 </CardItem>
                 <CardItem>
                    <Left>
                        <Button transparent  onPress={() => this._goDetalle(index)}>
                        <Icon active name="thumbs-up" />
                        <Text>Favoritos</Text>
                        </Button>
                    </Left>
                    <Right>
                    { rol != 'Regular' && 
                        <Button iconLeft transparent primary onPress={() => this.openQr(item.a001_offer_id)}
                            style={{ alignSelf: 'flex-end', marginLeft:10 }}>
                           <Icon name='ios-qr-scanner' /><Text>QR</Text>
                        </Button>
                    }
                    </Right>
                </CardItem>
              </Card>
          </TouchableHighlight>
        );
    };

    render (){
        const { loading, error, messageError, listaDeBeneficios } = this.state

		if (loading) {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Spinner color='blue' />
				</View>
			)
		}

		if (error) {
			return (
				<View style={Styles.center}>
					<Text>
						{ messageError }
					</Text>
				</View>
			)
		}
        return(
            <FlatList
                data={listaDeBeneficios}
                renderItem={this._renderItem}
                keyExtractor={this._keyExtractor}
                ItemSeparatorComponent={this.renderSeparator}
                onRefresh={() => this._onRefresh()}
                refreshing={this.state.isFetching}
                ListEmptyComponent={this._emptyList()}
            />
        ) 
    }
}

export default BeneficioScreen;
