import React, { Component } from 'react';
import { ListView, View } from 'react-native';
import { Button, Body, Fab, Left, Right, Container, Content, Form, Item, Icon, Input, Label, List, ListItem, Spinner, Text, Toast, Thumbnail } from 'native-base';
import { SQLite } from 'expo';
import Styles from '../utils/Styles';

import axios from 'axios';

const db = SQLite.openDatabase('agexportplus.db');

class InvitadosScreen extends Component {

    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            loading: false,
            error: false,
            messageError: '',
            active: 'true',
            listaInvitados: [],
            session_id: '',
            basic: true,
        };
    }

    componentWillMount(){
        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { session_id } = item;
                    console.log(item);
                    _that.setState({ session_id });
                }
            );
        });
    }

    componentWillReceiveProps(nextProps) {
        const { listaInvitados } = nextProps;
        this.setState({ listaInvitados });
    }   

    deleteRow(secId, rowId, rowMap) {
        const that = this;
        const { listaInvitados, session_id } = this.state;
        that.setState({ loading: true })
        rowMap[`${secId}${rowId}`].props.closeRow();
        const newData = [...this.state.listaInvitados];
        newData.splice(rowId, 1);
        const currentItemDelete = listaInvitados[rowId];
        const { c_contact_id } = currentItemDelete;
        const urlEliminarInvitado = `http://aeapi.iflexsoftware.com/contact.json`;
        axios.delete(urlEliminarInvitado, {
            params:{
                c_contact_id,
                session_id
            }
        })
  		.then(function (response) {
            const urlWS = `http://aeapi.iflexsoftware.com/contact.json/${session_id}/profile`;
            axios.get(urlWS)
            .then(function (responseDataInvitado) {
                Toast.show({
                    text: 'Se elimino correctamente',
                    position: 'top',
                    buttonText: 'Ok',
                    type:'success',
                    duration:5000
                });
                const { data } = responseDataInvitado;
                // that.props.dispatch(updateDataValidation(data));
                that.setState({ loading: false});
            })
            .catch(function (errorDataInvitado) {
                that.setState({ loading: false })
                if(errorDataInvitado.response){
                    const { error } = errorDataInvitado.response.data;
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
  		})
  		.catch(function (errorEliminar) {
            that.setState({ loading: false })
            if(errorEliminar.response){
                const { error } = errorEliminar.response.data;
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
        this.setState({ listaInvitados: newData });
    }

    addItem = () => {
        const { navigation } = this.props;
        navigation.navigate('InvitadoModal');
    }

    itemListInvitado = (item, key) => {
        return (
            <ListItem key={key} icon style={{ paddingLeft:30, paddingRight: 30 }}>
                <Left>
                    <Icon name="md-person" />
                </Left>
                <Body>
                    <Text>{ item.firstname1 } { item.lastname1 }</Text>
                </Body>
                <Right />
            </ListItem>
        );
    }

    render (){
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        const { loading, error, messageError, listaInvitados } = this.state;
        let showFabButton = true;
        if(listaInvitados.length == 5){
            showFabButton = false;
        }
		if (loading) {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Spinner color='blue' />
				</View>
			)
		}

		if (error) {
			return (
				<View style={styles.center}>
					<Text>
						{ messageError }
					</Text>
				</View>
			)
		}
        return(
            <Container>
                <Content style={Styles.backgroundContainer}>
                    <View style={{ padding: 10 }}>
                        <Text style={{ textAlign:'center' }}>
                            Mis Invitados
                        </Text>
                    </View>
                    <View>
                        <List
                            dataSource={this.ds.cloneWithRows(this.state.listaInvitados)}
                            renderRow={this.itemListInvitado}
                            renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                                <Button full danger onPress={_ => this.deleteRow(secId, rowId, rowMap)}>
                                    <Icon active name="trash" />
                                </Button>}
                            disableRightSwipe={true}
                            rightOpenValue={-75}
                        />
                    </View>
                </Content>
                { showFabButton && 
                    <Fab
                        style={{ backgroundColor: '#34A34F' }}
                        position="bottomRight"
                        onPress={this.addItem}>
                            <Icon name="ios-add" />
                    </Fab>
                }                
            </Container>
        )
    }
}

export default InvitadosScreen;