import React, { Component } from 'react';
import {  View, Image } from 'react-native';
import { Container, Spinner, Text } from 'native-base';


class ProgramaPuntosScreen extends Component {
    state = {
        loading: false,
        error: false,
        messageError: '',
    }

    render (){
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
            <Container style={{backgroundColor: 'white'}} >
                <View style={{alignItems: 'center', height: 400}}>
                    <Image 
                        style={{flex: 1, resizeMode: 'contain'}}
                        source={ require('../assets/programapuntos.png') }

                        />
                </View>
            </Container>
        )
    }
}

export default ProgramaPuntosScreen;