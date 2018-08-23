import React, { Component } from 'react';
import { Button,  Icon, Spinner, Text, Toast } from 'native-base';
import {
  View,
  StyleSheet,
} from 'react-native';

import { BarCodeScanner, Permissions, SQLite } from 'expo';
//import Styles from '../utils/Styles';

import axios from 'axios';

const db = SQLite.openDatabase('agexportplus.db');

class LectorScreen extends Component {
  
    state = {
        loading: false,
        error: false,
        messageError: '',
        hasCameraPermission: null,
        session_id : null
    }

    async componentWillMount() {
        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { session_id } = item;
                    _that.setState({ session_id });
                }
            );
        });
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPermission: status === 'granted'});
    }

    _handleBarCodeRead = ({ type, data }) => {   
        const that = this;
        //console.log(that.props);
        const { params } = that.props.navigation.state;
        const { activity_code } = params;
        that.setState({ loading: true })
        const urlWS = `http://aeapi.iflexsoftware.com/transaction.json`
        const { session_id } = that.state;
        const navParams = this.props.navigation.state.params.record_id;
        axios.post(urlWS, {
        type: 'Beneficio',
        record_id: navParams, //activity_code,
        session_id: data
        }).then(function (responseScanner) {
            that.setState({ loading: false })
            const { message } = responseScanner.data;
            Toast.show({
                text: message,
                position: 'top',
                buttonText: 'Ok',
                type:'success',
                duration:5000
            });
            that.props.navigation.goBack()
        }).catch(function(errorScanner){
            that.setState({ loading: false })
            if(errorScanner.response){
                const { error } = errorScanner.response.data;
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
                    text: 'Ocurrió un problema, intenta más tarde ',
                    position: 'top',
                    buttonText: 'Ok',
                    type:'danger',
                    duration:5000
                });   
            }
        })
    }

    render() {
        const { loading, error, messageError, hasCameraPermission, session_id } = this.state
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
        console.log('hasCameraPermission ', hasCameraPermission)
        if (hasCameraPermission === null) {
            return <Text>Requesting for camera permission</Text>;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            return (
                <View style={{flex: 1, flexDirection: 'column'}}>
                    <View style={{flex:1, backgroundColor: 'skyblue'}}>
                        <BarCodeScanner
                            onBarCodeRead={this._handleBarCodeRead}
                            style={StyleSheet.absoluteFill}
                        >
                            <Button success rounded style={{ alignSelf: 'flex-end', marginTop:25, marginRight: 25 }}
                                onPress={() => this.props.navigation.goBack()}
                            >
                                <Icon name='ios-close' />
                            </Button>
                        </BarCodeScanner>
                    </View>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 15,
      flexDirection: 'row',
    },
    url: {
      flex: 1,
    },
    urlText: {
      color: '#FFFFFF',
      fontSize: 20,
    },
    cancelButton: {
      marginLeft: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 18,
    },
  })

export default LectorScreen;
