import React, { Component } from 'react';
import { ActivityIndicator, View, StatusBar, StyleSheet } from 'react-native';
import { SQLite } from 'expo';

const db = SQLite.openDatabase('agexportplus.db');

class AuthLoadingScreen extends Component{
    
    componentWillMount(){
        this._bootstrapAsync();
    }

    validateLogin = (data) => {
        //const userToken = await AsyncStorage.getItem('userToken');
        let userToken = 0;
        const { _array } = data;
        if(_array.length > 0){
            const row = _array[0];
            userToken = parseInt(row.isLoggedIn);
        }
        
        console.log(userToken);

        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        this.props.navigation.navigate(userToken ? 'App' : 'Auth');
	}

    // Fetch the token from storage then navigate to our appropriate place
    _bootstrapAsync = () => {
        const _that = this;
        db.transaction(tx => {
            // tx.executeSql('insert into usuario (session_id, phone, rol, code_qr, area, code, isLoggedIn) values (?, ?, ?, ?, ?, ?, ?)', ['34234214342342', '34009810', 'Regular', '34234242342', 'Mercadeo', '714243', 0]);
            // tx.executeSql('delete from usuario');
            // tx.executeSql('select * from usuario', [], (_, { rows }) => {
            //     // console.log('rows ', JSON.stringify(rows))
            // });
            tx.executeSql('select * from usuario', [], (_, { rows }) => _that.validateLogin(rows));
        });
    };

    // Render any loading content that you like here
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default AuthLoadingScreen;