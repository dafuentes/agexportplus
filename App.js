import React from 'react';
import { AppLoading, Font, SQLite } from 'expo';
import RootNavigation from './navigation/RootNavigation';

const db = SQLite.openDatabase('agexportplus.db');

export default class App extends React.Component {

	state = {
    	isLoadingComplete: false,
	};
	  
	updateTable = (data) => {
		if(data.length == 0){
			db.transaction(tx => {
				tx.executeSql('insert into usuario (session_id, phone, rol, code_qr, area, code, isLoggedIn) values (?, ?, ?, ?, ?, ?, ?)', ['', '', '', '', '', '', 0]);
			});
		}
	}
	  
	_loadResourcesAsync = async () => {
		let _that = this;
		let registros = 0;
		db.transaction(tx => {
            tx.executeSql(
            	'create table if not exists usuario (id integer primary key not null, session_id text, phone text, rol text, code_qr text, area text, code text, isLoggedIn int);'
			);
			tx.executeSql('select * from usuario', [], 
				(_, { rows }) => _that.updateTable(rows)
			);
		});
    	return Promise.all([
      		Font.loadAsync({
        		'Roboto': require('native-base/Fonts/Roboto.ttf'),
				'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
				Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf"),
      		}),
    	]);
  	};
	
	_handleLoadingError = error => {
    	// In this case, you might want to report the error to your error
    	// reporting service, for example Sentry
    	console.warn(error);
  	};

  	_handleFinishLoading = () => {
    	this.setState({ isLoadingComplete: true });
  	};

	render() {
		if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      		return (
        		<AppLoading
          			startAsync={this._loadResourcesAsync}
          			onError={this._handleLoadingError}
          			onFinish={this._handleFinishLoading}
        		/>
      		);
    	} else {
			return (
				<RootNavigation />
			);
		}
  	}
}