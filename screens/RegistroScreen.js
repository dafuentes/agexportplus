import React, { Component } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { Button, Container, Content, Form, Item, Input, Label, Spinner, Text, Toast, Thumbnail } from 'native-base';
import { SQLite } from 'expo';
import Styles from '../utils/Styles';

const db = SQLite.openDatabase('agexportplus.db');

import axios from 'axios';

class RegistroScreen extends Component {

    state = {
        loading: false,
        error: false,
        messageError: '',
        invitation_code: null,
        phone_number:null,
    }

    updateTableInfo = (data) => {
		if(data.length == 0){
			db.transaction(tx => {
				tx.executeSql('insert into info (c_contact_id, company, concat_ws, invitation_code, phone1, session_id, sms_code, status, tax_id) values (?, ?, ?, ?, ?, ?, ?, ?, ? )', ['', '', '', '', '', '', '', '', '']);
			});
		}
	}

    componentDidMount() {
        const _that = this;
        db.transaction(tx => {
            tx.executeSql(
                'create table if not exists info (id integer primary key not null, c_contact_id text, company text, concat_ws text, invitation_code text, phone1 text, session_id text, sms_code text, status text, tax_id text);'
            );
            tx.executeSql('select * from info', [], 
				(_, { rows }) => _that.updateTableInfo(rows)
			);
        });
    }

    makeValidation = () => {
        const that = this;
        that.setState({ loading: true })
        const { invitation_code, phone_number } = this.state;
        if(!invitation_code || !phone_number){
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
        const codInvitation = parseInt(invitation_code);
        const urlWS = `http://aeapi.iflexsoftware.com/contact/invite.json/${codInvitation}` 
		axios.post(urlWS, {
    		phone: phone_number
  		})
  		.then(function (response) {
            const { contact } = response.data;
            const { session_id, c_contact_id } = contact;
            let device_id = Expo.Constants.deviceId;
            let manufacturer = Expo.Constants.deviceName;
            let platform = Platform.OS === 'ios' ? 'ios' : 'android';
            const urlInsertValidate = `http://aeapi.iflexsoftware.com/contact/validate.json`;
            let sqlUpdate = `update usuario set code = '${codInvitation}', phone='${phone_number}', session_id='${session_id}' where id = ?;`;
            db.transaction(tx => {
                tx.executeSql(sqlUpdate, [1]);
                tx.executeSql(`update info set c_contact_id = ?, company = ?, concat_ws = ?, invitation_code = ?, phone1 = ?, session_id = ?, sms_code = ?, status = ?, tax_id = ? where id = 1;`, [contact.c_contact_id, contact.company, contact.concat_ws, contact.invitation_code, contact.phone1, contact.session_id, contact.sms_code, contact.status, contact.tax_id]);
            });
            axios.post(urlInsertValidate, {
                c_contact_id,
                device_id,
                serial: device_id,
                manufacturer,
                platform,
                validated_phone: phone_number
            }).then(function(responseInsert){
                that.setState({ loading: false })
                that.props.navigation.navigate('Validacion');
            }).catch(function(errorValidate){
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
  		})
  		.catch(function (errorInvite) {
            console.log(errorInvite);
            that.setState({ loading: false })
            if(errorInvite.response){
                const { error } = errorInvite.response.data;
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
                    text: 'Ocurrió un problema, intenta más tarde 2',
                    position: 'top',
                    buttonText: 'Ok',
                    type:'danger',
                    duration:5000
                });   
            } 
  		});
    }

    onChange(field, text) {
        let newText = '';
        let numbers = '0123456789';

        for (var i = 0; i < text.length; i++) {
            if ( numbers.indexOf(text[i]) > -1 ) {
                newText = newText + text[i];
            }
        }
        if(field == 'invitation_code'){
            this.setState({invitation_code: newText})
        }else{
            this.setState({phone_number: newText})
        }
    }

    render (){
        const { width } = Dimensions.get('window');
        const { loading, error, messageError } = this.state
        let nameDevice = Expo.Constants.deviceName;
        let sessionId  = Expo.Constants.sessionId; 

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
                    <View style={ Styles.paddingLR20 }>
                        <Form>
                            <Item stackedLabel>
                                <Label>Código de invitación</Label>
                                <Input
                                    onChangeText={(invitation_code)=> this.onChange('invitation_code', invitation_code)}
                                    value={this.state.invitation_code}
                                    keyboardType={"numeric"} />
                            </Item>
                            <Item stackedLabel last>
                                <Label>No. celular</Label>
                                <Input
                                    onChangeText={(phone_number)=> this.onChange('phone_number', phone_number)}
                                    value={this.state.phone_number}
                                    keyboardType={"numeric"} />
                            </Item>
                            <Button 
                                onPress={this.makeValidation}
                                style={Styles.btnActivar} full>
                                <Text>Activar</Text>
                            </Button>
                            <View style={ Styles.btnRequest }>
                                <Button
                                    style={Styles.btnActivarhere} full
                                    onPress={() => this.props.navigation.navigate('Solicitud')}>
                                    <Text style={{ textAlign: 'center' }} >¿No tiene código? {'\n'} Solicitar Código aquí </Text>
                                </Button>
                            </View>
                        </Form>
                    </View>
                </Content>
            </Container>
        )
    }
}

export default RegistroScreen;