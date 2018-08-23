import React, { Component } from 'react';
import { Dimensions, View } from 'react-native';
import { Button, Container, Content, Form, Item, Input, Label, Spinner, Text, Toast, Thumbnail } from 'native-base';
import { SQLite } from 'expo';
import Styles from '../utils/Styles';

const db = SQLite.openDatabase('agexportplus.db');

import axios from 'axios';

class ValidacionScreen extends Component {

    static navigationOptions = {
        headerBackTitle: null
    };

    state = {
        loading: false,
        error: false,
        messageError: '',
        code_sms: null,
        fullname: '',
        session: '',
        contact_id: '',
        phone: '',
        code: '',
        code_sms_local: null
    }

    updateTableContact = (data) => {
		if(data.length == 0){
			db.transaction(tx => {
				tx.executeSql('insert into contact (area, firstname1, firstname2, lastname1, lastname2, c_bpartner_id, c_contact_id, type, genere, personal_id_type, personal_id, e_today, e_sector, e_ece, e_competivity, e_vupe, e_urgent, phone1, email1) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )', ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
            });
		}
    }
    
    updateTableCompania = (data) => {
        if(data.length == 0){
			db.transaction(tx => {
				tx.executeSql('insert into compania (address, c_bpartner_id, email, mail_review, name, phone, phone2) values (?, ?, ?, ?, ?, ?, ? )', ['', '', '', '', '', '', '']);
            });
		}
    }

    componentWillMount() {
        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from info', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { c_contact_id, concat_ws, session_id, sms_code} = item;
                    _that.setState({ contact_id: c_contact_id, fullname: concat_ws, session: session_id, code_sms_local: sms_code });
                }
            );

            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { phone, code} = item;
                    _that.setState({ phone, code });
                }
            );
        });

        db.transaction(tx => {
            tx.executeSql(
                'create table if not exists contact (id integer primary key not null, area text, firstname1 text, firstname2 text, lastname1 text, lastname2 text, c_bpartner_id text, c_contact_id text, type text, genere text, personal_id_type text, personal_id text, e_today text, e_sector text, e_ece text, e_competivity text, e_vupe text, e_urgent text, phone1 text, email1 text);'
            );
            tx.executeSql(
                'create table if not exists compania (id integer primary key not null, address text, c_bpartner_id text, email text, mail_review text, name text, phone text, phone2 text);'
            );
            tx.executeSql('select * from contact', [], 
				(_, { rows }) => _that.updateTableContact(rows)
            );
            tx.executeSql('select * from compania', [], 
				(_, { rows }) => _that.updateTableCompania(rows)
			);
        });
    }

    goProfile = () => {
        const that = this;
        that.setState({ loading: true });
        const { code_sms, code_sms_local, phone, contact_id, fullname } = this.state;
        const device_id = Expo.Constants.deviceId;
        if(!code_sms || !fullname){
            Toast.show({
              text: 'Todos los campos son requeridos!',
              position: 'top',
              buttonText: 'Ok',
              type:'warning'
            });
            that.setState({ loading: false });
            return;
        }
        
        if(code_sms != code_sms_local){
            Toast.show({
              text: 'Código SMS no concuerda, verifica',
              position: 'top',
              buttonText: 'Ok',
              type:'warning'
            });
            that.setState({ loading: false });
            return;
        }

        let urlConfirmDevice = `http://aeapi.iflexsoftware.com/device/confirm.json`;
        axios.get(urlConfirmDevice, {
            params: {
                c_contact_id: contact_id,
                device_id,
                serial: device_id
            }
        }).then(function(confirmData){
            const { session_id } = confirmData.data;
            const urlWS = `http://aeapi.iflexsoftware.com/contact.json/${session_id}/profile`;
            axios.get(urlWS)
            .then(function (response) {
                const { data } = response;
                const { Company, role, area, firstname1, firstname2, lastname1, lastname2, c_bpartner_id, c_contact_id, type, genere, personal_id_type, personal_id, e_today, e_sector, e_ece, e_competivity, e_vupe, e_urgent, phone1, email1 } = data.data;
                const company_address = Company.address || '';
                const company_c_bpartner_id = Company.c_bpartner_id || '';
                const company_email = Company.email || '';
                const company_mail_review = Company.mail_review || '';
                const company_name = Company.name || '';
                const company_phone = Company.phone || '';
                const company_phone2 = Company.phone2 || '';
                db.transaction(tx => {
                    tx.executeSql(`update usuario set session_id = ?, rol = ?, isLoggedIn = ? where id = 1`, [session_id, role, 1]);
                    tx.executeSql(`update contact set area = ?, firstname1 = ?, firstname2 = ?, lastname1 = ?, lastname2 = ?, c_bpartner_id = ?, c_contact_id = ?, type = ?, genere = ?, personal_id_type = ?, personal_id = ?, e_today = ?, e_sector = ?, e_ece = ?, e_competivity = ?, e_vupe = ?, e_urgent = ?, phone1 = ?, email1 = ?  where id = 1`, [area, firstname1, firstname2, lastname1, lastname2, c_bpartner_id, c_contact_id, type, genere, personal_id_type, personal_id, e_today, e_sector, e_ece, e_competivity, e_vupe, e_urgent, phone1, email1 ]);
                    tx.executeSql(`update compania set address = ?, c_bpartner_id = ?, email = ?, mail_review = ?, name = ?, phone = ?, phone2 = ? where id = 1`, [company_address, company_c_bpartner_id, company_email, company_mail_review, company_name, company_phone, company_phone2]);
                });
                that.setState({ loading: false});
                that.props.navigation.navigate('App');
            })
            .catch(function (errorProfile) {
                that.setState({ loading: false })
                if(errorProfile.response){
                    const { error } = errorProfile.response.data;
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
        .catch(function(errorConfirm){
            that.setState({ loading: false })
            if(errorConfirm.response){
                const { error } = errorConfirm.response.data;
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

    sendCodeAgain = () =>{
        const that = this;
        that.setState({ loading: true });
        const { phone, code } = this.state;
        const urlWS = `http://aeapi.iflexsoftware.com/contact/invite.json/${code}` 
		axios.post(urlWS, {
    		phone
  		})
  		.then(function (response) {
            const { contact } = response.data;
            const { session_id } = contact;
			that.setState({ loading: false });
            let sqlUpdate = `update usuario set code = '${code}', phone='${phone}', session_id='${session_id}' where id = ?;`;
            db.transaction(tx => {
                tx.executeSql(sqlUpdate, [1]);
                tx.executeSql(`update info set c_contact_id = ?, company = ?, concat_ws = ?, invitation_code = ?, phone1 = ?, session_id = ?, sms_code = ?, status = ?, tax_id = ? where id = 1;`, [contact.c_contact_id, contact.company, contact.concat_ws, contact.invitation_code, contact.phone1, contact.session_id, contact.sms_code, contact.status, contact.tax_id]);
            });
            Toast.show({
              text: 'Se envio el código SMS nuevamente',
              position: 'top',
              buttonText: 'Ok',
              type:'success',
              duration:5000
            });
  		})
  		.catch(function (error) {
            const { message } = error.response.data.error;
            that.setState({ loading: false })
            Toast.show({
              text: message,
              position: 'top',
              buttonText: 'Ok',
              type:'danger',
              duration:5000
            });
  		});
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
                    <View style={ Styles.paddingLR20 }>
                        <Form>
                            <Item stackedLabel>
                                <Label>Nombre:</Label>
                                <Input
                                    editable={false}
                                    onChangeText={(fullname)=> this.setState({fullname})}
                                    value={this.state.fullname} />
                            </Item>
                            <Item stackedLabel last>
                                <Label>Código SMS</Label>
                                <Input
                                    onChangeText={(code_sms)=> this.setState({ code_sms })}
                                    value={this.state.code_sms}
                                    keyboardType={"numeric"}
                                />
                            </Item>
                            <Button 
                                onPress={this.goProfile}
                                style={Styles.btnActivar} full>
                                <Text>Activar</Text>
                            </Button>
                            <Button 
                                onPress={this.sendCodeAgain}
                                style={Styles.btnActivar} full>
                                <Text>Reenviar Codigo SMS</Text>
                            </Button>
                        </Form>
                    </View>
                </Content>
            </Container>
        )
    }
}

export default ValidacionScreen;