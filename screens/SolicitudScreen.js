import React, { Component } from 'react';
import { Dimensions, StyleSheet, Platform, View } from 'react-native';
import { Button, Container, H3, Content, Form, Item, Input, Label, Spinner, Text, Toast, Thumbnail } from 'native-base';
import Styles from '../utils/Styles';

import axios from 'axios';

class SolicitudScreen extends Component {

    static navigationOptions = {
        headerTitleStyle: Platform.OS === 'ios' ? { color: 'white' } : { textAlign: 'center', alignSelf: 'center', marginLeft: 115, fontWeight: 'normal', fontSize: 12, color: 'white' },
        headerBackTitle: null,
    };

    state = {
        loading: false,
        error: false,
        messageError: '',
        email: '',
        phone_number: '',
        nit: ''
    }

    makeRequest = () => {
        const that = this;
        that.setState({ loading: true })
        const { email, phone_number, nit } = this.state;
        if(!email || !phone_number || !nit){
            Toast.show({
              text: 'Todos los campos son requeridos!',
              position: 'top',
              buttonText: 'Ok',
              type:'warning',
              duration:5000
            });
            that.setState({ loading: false })
            return;
        }
        that.setState({ loading: false });
        Toast.show({
            text: 'Solicitud enviada!',
            position: 'top',
            buttonText: 'Ok',
            type:'success',
            duration:5000
        });
    }

    solicitarCodigoAqui = () => {
        const that = this;
        that.setState({ loading: true })
        const { email, phone_number, nit } = this.state;
        const urlWS = `http://aeapi.iflexsoftware.com/contact/helpLogin.json`;
        console.log(email, phone_number, nit);
        if(!email || !phone_number || !nit){
            Toast.show({
                text: 'Todos los campos son requeridos!',
                position: 'top',
                buttonText: 'Ok',
                type:'warning',
                duration:5000
              });
              that.setState({ loading: false })
              return;
        }else{
            axios.post(urlWS, {
                email,
                phone: phone_number,
                tax_id: nit
            }).then(function (response) {
                that.setState({ loading: false })
                that.props.navigation.navigate('Registro');
            }).catch(function (errorInvite) {
                that.setState({ loading: false })
                if(errorValidate.response){
                    const { error } = errorValidate.response.data;
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
    }

    render (){
        const { width } = Dimensions.get('window');
        const { loading, error, messageError } = this.state

		if (loading) {
			return (
				<View style={{ flex: 1, justifyContent: 'center',alignItems: 'center' }}>
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
                    <View style={{ alignItems:'center' }} >
                        <Thumbnail style={{flex:1, width:280, height:100 }} resizeMode='contain' source={require('../assets/img/logo.png')} />
                    </View>
                    <View style={{ marginTop:20, alignItems:'center' }}>
                        <H3>Solicitud de Código de Invitación</H3>
                    </View>
                    <View style={ Styles.paddingLRT20 }>
                        <Form>
                            <Item stackedLabel>
                                <Label>Email</Label>
                                <Input
                                    onChangeText={(email)=> this.setState({ email })}
                                    value={this.state.email}
                                    keyboardType={"email-address"} />
                            </Item>
                            <Item stackedLabel last>
                                <Label>Teléfono</Label>
                                <Input
                                    onChangeText={(phone_number)=> this.setState({ phone_number })}
                                    value={this.state.phone_number}
                                    keyboardType={"phone-pad"} />
                            </Item>
                            <Item stackedLabel last>
                                <Label>Nit de empresa</Label>
                                <Input
                                    onChangeText={(nit)=> this.setState({ nit })}
                                    value={this.state.nit}
                                    keyboardType={"numeric"} />
                            </Item>
                            <Button 
                                onPress={this.solicitarCodigoAqui}
                                style={Styles.btnActivar} full>
                                <Text>Solicitar</Text>
                            </Button>
                        </Form>
                    </View>
                </Content>
            </Container>
        )
    }
}

export default SolicitudScreen;