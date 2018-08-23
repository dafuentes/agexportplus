import React, { Component } from 'react';
import { AppState,  View } from 'react-native';
import { Body, Left, Right, Container, Content, Icon, List, ListItem, Spinner, Text, Toast, Thumbnail } from 'native-base';
import { SQLite } from 'expo';
import Styles from '../utils/Styles';

import axios from 'axios';
import QRCode from 'react-native-qrcode';

const db = SQLite.openDatabase('agexportplus.db');

class HomeScreen extends Component {

    state = {
        appState: AppState.currentState,
        loading: false,
        error: false,
        messageError: '',
        contact_id: null,
        session_id: '',
        firstname1: '',
        firstname2: '',
        lastname1: '',
        lastname2: '',
        company: '',
        rol: '',
        type: '',
    }

    componentWillMount() {
        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from contact', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { firstname1, firstname2, lastname1, lastname2, type } = item;
                    _that.setState({ firstname1, firstname2, lastname1, lastname2, type });
                }
            );

            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { rol, session_id } = item;
                    _that.setState({ rol, session_id });
                }
            );

            tx.executeSql('select * from info', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];                    
                    const { company, c_contact_id } = item;
                    _that.setState({ company, contact_id: c_contact_id });
                }
            );
        });
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this._newSessionID();
        }else{
            console.log('App has gone to background!');
            // save stuff to storagethis.storeState(); 
        }
        this.setState({ appState: nextAppState }); 
    }

    _newSessionID = () => {
        const that = this;
        that.setState({ loading: true });
        let urlConfirmDevice = `http://aeapi.iflexsoftware.com/device/confirm.json`;
        const { contact_id } = this.state;
        const device_id = Expo.Constants.deviceId;
        axios.get(urlConfirmDevice, {
            params: {
                c_contact_id: contact_id,
                device_id,
                serial: device_id
            }
        }).then(function(confirmData){
            const { session_id } = confirmData.data;
            db.transaction(tx => {
                tx.executeSql(`update usuario set session_id = ? where id = 1`, [session_id]);
                tx.executeSql('select * from usuario', [], 
                    (_, { rows: { _array } }) => {
                        const item = _array[0];
                        const { session_id } = item;
                    }
                );
            });
            that.setState({ loading: false, session_id });
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

    _goUpModalInfo(typeUser){
        const { contact_id, session_id } = this.state;
        this.props.navigation.navigate('EditarModal', {
            contact_id,
            session_id,
            typeUser,
        });
        
    }
    

    render (){
        const { loading, error, messageError, firstname1, firstname2, lastname1, lastname2, company, session_id, rol, type } = this.state;
        const customFullName = ` ${firstname1 === null ? '' : firstname1} ${firstname2 === null ? '' : firstname2} ${lastname1 === null ? '': lastname1} ${ lastname2 === null ? '' : lastname2 }`;
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
                    <View style={{ alignItems:'center', marginTop:5 }}>
                        <QRCode
                            value={session_id}
                            size={200}
                        />
                    </View>
                    <View style={ Styles.paddingLRT20 }>
                        <List>
                            <ListItem icon>
                                <Left>
                                    <Icon style={Styles.colorText} name="md-person" />
                                </Left>
                                <Body>
                                    <Text style={Styles.colorText}>{customFullName}</Text>
                                </Body>
                                { rol == 'Regular' &&
                                    <Icon style={Styles.colorText} name="md-create"
                                    onPress={() => this._goUpModalInfo('contact')}
                                    ></Icon>
                                }
                                <Right />
                            </ListItem>
                            <ListItem icon>
                                <Left>
                                    <Icon style={Styles.colorText} name="md-people" />
                                </Left>
                                <Body>
                                    <Text style={Styles.colorText}>{company}</Text>
                                </Body>
                                
                                { rol == 'Regular' && type == 'Principal' &&
                                    <Icon style={Styles.colorText} name="md-create"
                                    onPress={() => this._goUpModalInfo('company')}
                                    ></Icon>
                                }
                                <Right />
                            </ListItem>
                        </List>
                    </View>
                </Content>
            </Container>
        )
    }
}

export default HomeScreen;
