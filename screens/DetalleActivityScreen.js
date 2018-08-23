import React, { Component } from 'react';
import { Dimensions, Linking, ScrollView, Switch, Platform, View } from 'react-native';
import {Image} from "react-native-expo-image-cache";
import { Button, Container, Content, Icon, ListItem, Text, Toast, Card, CardItem, Body } from 'native-base';
import { SQLite } from 'expo';

import axios from 'axios';

const db = SQLite.openDatabase('agexportplus.db');

class DetalleActivityScreen extends Component {

    static navigationOptions = {
        title: 'Detalle Actividad',
        headerTitleStyle: Platform.OS === 'ios' ? { color: 'white' } : { textAlign: 'center', alignSelf: 'center', marginLeft: 115, fontWeight: 'normal', fontSize: 12, color: 'white' },        
        tabBarLabel: 'Actividades'
    };

    state ={
        loading: false,
        error: false,
        messageError: '',
        session_id: null,
        rol: '',
        detalleActividad: [],
        assist: false
    }

    onChangeFunction(activity_code, value) {
        const { session_id, assist } = this.state;
        const that = this;
        const urlWS = `http://aeapi.iflexsoftware.com/activity/assist.json`; 
		axios.post(urlWS, {
    		session_id,
            activity_code,
            assist: value
  		})
  		.then(function (response) {
            //response.data.activity_code;
            //response.data.session_id;
            const urlActivity = `http://aeapi.iflexsoftware.com/activity.json/${session_id}/myActivities`;
            that.setState({ loading: true });
            axios.get(urlActivity)
            .then(function (responseActivities) {
                that.setState({ loading: false });
                const { data } = responseActivities;
                // that.props.dispatch(newActivities(data));
            })
            .catch(function (errorActivities) {
                console.log(errorActivities);
                that.setState({ loading: false })
                if(errorActivities.response){
                    const { error } = errorActivities.response.data;
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
            
            that.setState({ assist: value });
        })
        .catch(function(errorAsistire){
            that.setState({ loading: false })
            console.log(errorAsistire.response);
            if(errorAsistire.response){
                const { error } = errorAsistire.response.data;
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
    }

    componentWillMount(){

        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { rol, session_id } = item;
                    console.log(item);
                    _that.setState({ rol, sessionID: session_id });
                }
            );
        });

        const { params } = this.props.navigation.state;
        const { detalle } = params;
        const { confirmation } = detalle;
        let activeSwitch = (confirmation == 'Confirmado') ? true : false;
        this.setState({ assist: activeSwitch });
        console.log('estado ', activeSwitch);
    }

    openMap = (lat, long) => {
        if(Platform.OS === 'ios'){
            let url = `http://maps.apple.com/maps?q=Actividad,ll=${lat},${long}`;
            Linking.openURL(url).catch(err => console.error('An error occurred', err));
        }else{
            let url = `http://maps.google.com/maps?q=${lat},${long}`;
            Linking.openURL(url).catch(err => console.error('An error occurred', err));
        }
    }

    _goDetalle (index){
        const { listaActividades } = this.state;
        console.log('index ', index);
        console.log(listaActividades[index]);
        let detalleActividad = listaActividades[index] || [];
        this.props.navigation.navigate('DetalleActivity', {
            detalle: detalleActividad
        });
    };

    openQr(activity_code){
        this.props.navigation.navigate('ScannerModalActivity', {
            activity_code
        });
    }

    render (){
        const { width } = Dimensions.get('window');
        const { params } = this.props.navigation.state;
        const { rol } = this.state;
        const { detalle } = params;
        let imagenActividad = detalle.images[1].url;
        const {activity_code, datetrx, location, latitude, longitude, subject, type, activity_contactname, activity_contactemail, activity_contactphone, cost_type, cost_description, rate, summary, datefinish } = detalle;
        const preview = { uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" };
        const uri = imagenActividad;
        console.log(this.state.assist);
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
                
                <View style={{ flex:1 }}>

                        { rol == 'Agexport' && 
                            <Button iconLeft success style={{ alignSelf: 'flex-end', marginTop:10, marginBottom: 10}} onPress={() => this.openQr(activity_code)}>
                                <Icon name='ios-qr-scanner' /><Text>QR</Text>
                            </Button>
                        }

                        <Text><Text style={{fontWeight: 'bold'}} >Nombre de la Actividad: </Text>{ subject }</Text>

                        <Text><Text style={{fontWeight: 'bold'}} >Descripción de la Actividad: </Text>{ summary }</Text>                        
                        
                        <Text><Text style={{fontWeight: 'bold'}} >Fecha y hora de inicio: </Text>{ datetrx } </Text>

                        <Text><Text style={{fontWeight: 'bold'}} >Fecha y hora de Final: </Text>{ datefinish } </Text>
                        
                        <Text><Text style={{fontWeight: 'bold'}} >Lugar: </Text>{ location }</Text>
                        
                        { cost_type != null  &&
                                <Text style={{fontWeight: 'bold'}} ><Text>Costo: </Text>{ cost_type }</Text>
                        }
                        { cost_description != null  &&
                                <Text style={{fontWeight: 'bold'}} ><Text>Descripción: </Text>{ cost_description }</Text>
                        }
                       
                        <Text><Text style={{fontWeight: 'bold'}} >Tipo: </Text>{ type }</Text>
                      
                        <Text><Text style={{fontWeight: 'bold'}} >Persona Contacto: </Text>{ activity_contactname }</Text>
                      
                        <Text><Text style={{fontWeight: 'bold'}} >Correo Contacto: </Text>{ activity_contactemail }</Text>
                       
                        <Text><Text style={{fontWeight: 'bold'}}>Telefono Contacto:</Text>{ activity_contactphone }</Text>
                        
                        { rate != null &&
                            <Text style={{fontWeight: 'bold'}} ><Text>Puntos: </Text>{ rate }</Text>
                        }

                        { rol != 'Establecimiento' || rol != 'Agexport' &&
                            <ListItem style={{ alignSelf: 'flex-end', borderBottomWidth:0 }}>
                                <Text>Asistiré</Text>
                                <Switch
                                    style={{ marginLeft:10 }}
                                    onValueChange={(value) => this.onChangeFunction(activity_code, value)}
                                    value={this.state.assist}
                                />
                            </ListItem>
                        }
                        { rol == 'Regular' &&
                            <ListItem style={{ alignSelf: 'flex-end', borderBottomWidth:0 }}>
                                <Text>Asistiré</Text>
                                <Switch
                                    style={{ marginLeft:10 }}
                                    onValueChange={(value) => this.onChangeFunction(activity_code, value)}
                                    value={this.state.assist}
                                />
                            </ListItem>
                        }
                        { rol != 'Establecimiento' && 
                            <Button success style={{ alignSelf: 'flex-end', marginTop:10 }}
                                onPress={() => this.openMap(latitude, longitude)}
                            >
                                <Text>Llevarme allí</Text>
                            </Button>
                        }
                        
                </View>
                
                </Body>
                </CardItem>
                </Card>
            </Content>
          </Container>
            </ScrollView>
        )
    }
}

export default DetalleActivityScreen;