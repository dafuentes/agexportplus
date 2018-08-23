import React, { Component } from 'react';
import { Dimensions, Linking, ScrollView, Platform, View } from 'react-native';
import { SQLite } from 'expo';

import {Image} from "react-native-expo-image-cache";
import {    Button, 
            Container, 
            Content, 
            Icon, 
            Text, 
            Card, 
            CardItem,
            Body 
} from 'native-base';

const db = SQLite.openDatabase('agexportplus.db');

class DetalleBeneficioScreen extends Component {

    static navigationOptions = {
        //title: 'Detalle Beneficio',
        headerTitleStyle: Platform.OS === 'ios' ? { color: 'white' } : { textAlign: 'center', alignSelf: 'center', marginLeft: 115, fontWeight: 'normal', fontSize: 12, color: 'white' }
    };

    state = {
        loading: false,
        error: false,
        messageError: '',
        session_id: '',
        rol: '',
        detalleBeneficio: [],
        assist: false,
    }

    componentWillMount(){
        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { rol, session_id } = item;
                    console.log(item);
                    _that.setState({ rol, session_id });
                }
            );
        });
    }

    OpenLink(url) {
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
              console.log('Can\'t handle url: ' + url);
            } else {
              return Linking.openURL(url);
            }
          }).catch(err => console.error('An error occurred', err));
      }

    openQr(){
        //console.log(this.props.navigation.state.params.detalle);
        this.props.navigation.navigate('Lector', {
            //activity_code
            record_id: this.props.navigation.state.params.detalle.a001_offer_id,
            type: 'Beneficio'
        });
        /*this.props.navigation.navigate('Lector', {
            record_id: this.props.navigation.state.params.detalle.a001_offer_id,
            type: 'Beneficio'
        });*/
    }

    callFriendTapped(phone) {
        // Add the telephone num to call
          Linking.openURL(`tel:${phone}`)
            .catch(err => {
              console.log(err)
            });
        }

    render (){
        const { width } = Dimensions.get('window');
        const { params } = this.props.navigation.state;
        const { rol } = this.state;
        const { detalle } = params;
        const { name, description, conditions, vendor_category, dateto, observations, external_url, contact_phone } = detalle;
        let imagenActividad = detalle.images[1].url;
        const preview = { uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" };
        const uri = imagenActividad;
        return(
            <ScrollView
                contentContainerStyle={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingVertical: 20
            }}>
            <Container>
            <Content>
              <Card>
              
              <View style={{ flex:2, paddingTop:20, paddingLeft:20, paddingRight: 20 }}>
                    <Image style={{ flex:1, height:200, width:undefined }} {...{preview, uri}} />
                   
                </View>
            
                <CardItem>
                    <Body>

                        { rol != 'Regular' && 
                            <Button success iconLeft onPress={() => this.openQr()}
                            style={{ alignSelf: 'flex-end',  marginTop: 20}}>
                                <Icon name='ios-qr-scanner' /><Text>QR</Text>
                            </Button>
                        }
                         <Text><Text style={{fontWeight: 'bold'}}>Comercio: </Text>{ name }</Text>
                        
                         <Text><Text style={{fontWeight: 'bold'}}>Categoría: </Text>{ vendor_category }</Text>

                        <Text><Text style={{fontWeight: 'bold'}}>Beneficio: </Text> { description } {"\n"}</Text>

                         <Text><Text style={{fontWeight: 'bold'}}>Descripción: </Text> { observations } {"\n"}</Text>

                        <Text><Text style={{fontWeight: 'bold'}}>Expira: </Text>{ dateto}  {"\n"} </Text>

                        <Text><Text style={{fontWeight: 'bold'}}>Restricciones: </Text>{ conditions }</Text>

                        <Text button onPress={() => this.callFriendTapped(contact_phone)} ><Text style={{fontWeight: 'bold'}}>Teléfono: </Text>{contact_phone}</Text>
                       

                        <Button onPress={() => this.OpenLink(external_url)} success style={{alignSelf: 'flex-end'}} ><Text> Enlace externo </Text></Button>
                    </Body>
                </CardItem>
                
             </Card>
            </Content>
          </Container>
          </ScrollView>
        )
    }
}

export default DetalleBeneficioScreen;
