import React, { Component } from 'react';
import { KeyboardAvoidingView, View, Platform } from 'react-native';
import { Button, Body, Left, Right, Picker, Header, Title, Container, Content, Form, Item, Icon, Input,  List, ListItem, Spinner, Text, Toast } from 'native-base';
import { SQLite } from 'expo';
import Styles from '../utils/Styles';
import axios from 'axios';

const db = SQLite.openDatabase('agexportplus.db');

class AgregarInvitadoModal extends Component {
    state = {
        loading: false,
        error: false,
        messageError: '',
        txtNombre: '',
        txtApellido: '',
        txtCelular: '',
        txtEmail: '',
        selectedArea: (Platform.OS === 'ios') ? "" : 0,
        selectedPuesto: (Platform.OS === 'ios') ? "" : 0,
        listadoAreas: [],
        listadoPuestos: [],
        session_id: null,
        c_bpartner_id: null,
        listaInvitados: this.props.listaInvitados || []
    }

    componentWillMount(){
        const _that = this;
        db.transaction(tx => {
            tx.executeSql('select * from usuario', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { session_id } = item;
                    _that.setState({ session_id });
                }
            );
            tx.executeSql('select * from contact', [], 
                (_, { rows: { _array } }) => {
                    const item = _array[0];
                    const { c_bpartner_id } = item;
                    _that.setState({ c_bpartner_id });
                }
            );
        });
        const urlCatalogo = `http://aeapi.iflexsoftware.com/contact/catalog.json`;
        axios.get(urlCatalogo)
  		.then(function (response) {
            if(response.status == 200){
                const { AREAS, PUESTOS } = response.data;
                _that.setState({ listadoAreas: AREAS, listadoPuestos: PUESTOS });
            }
  		})
  		.catch(function (errorCatalogo) {
            _that.setState({ loading: false })
            if(errorCatalogo.response){
                const { error } = errorCatalogo.response.data;
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

    onValueChangedArea = (itemSelected) => {
        this.setState({ selectedArea: itemSelected });
    }

    onValueChangedPuesto = (itemSelected) => {
        this.setState({ selectedPuesto: itemSelected });
    }

    guardarInvitado = () => {
        const that = this;
        const { listaInvitados, session_id, c_bpartner_id, txtNombre, txtApellido, txtCelular, txtEmail, selectedArea, selectedPuesto } = this.state;
        if(!txtNombre || !txtApellido || !txtCelular || !txtEmail){
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
        if(!selectedArea || selectedArea == 0){
            Toast.show({
              text: 'Debes seleccionar un área valida',
              position: 'top',
              buttonText: 'Ok',
              type:'warning',
              duration:5000
            });
            that.setState({ loading: false })
            return;
        }
        if(!selectedPuesto || selectedPuesto == 0){
            Toast.show({
                text: 'Debes seleccionar un puesto valido',
                position: 'top',
                buttonText: 'Ok',
                type:'warning',
                duration:5000
            });
            that.setState({ loading: false })
            return;
        }
        that.setState({ loading: true });
        const urlAddInvitado = `http://aeapi.iflexsoftware.com/contact/add.json`;
        const listaDefault = [1, 2, 3, 4, 5];
        let listaIndex = [];
        let listaIndexInvitados = [];
        for(let i = 0; i < listaInvitados.length; i++){
            listaIndexInvitados.push(parseInt(listaInvitados[i].index));
        }
        listaIndex = listaDefault.filter( function( el ) {
            return listaIndexInvitados.indexOf( el ) < 0;
        });

        axios.post(urlAddInvitado, {
    		c_bpartner_id,
            firstname: txtNombre,
            lastname: txtApellido,
            phone: txtCelular,
            email: txtEmail,
            area: selectedArea,
            position: selectedPuesto,
            session_id,
            index: listaIndex[0]
  		})
  		.then(function (responseInvitado) {
            const urlWS = `http://aeapi.iflexsoftware.com/contact.json/${session_id}/profile`;
            axios.get(urlWS)
            .then(function (responseDataInvitado) {
                Toast.show({
                    text: 'Contacto guardado',
                    position: 'top',
                    buttonText: 'Ok',
                    type:'success',
                    duration:5000
                });
                const { data } = responseDataInvitado;
                // that.props.dispatch(updateDataValidation(data));
                that.setState({ loading: false, selectedArea: null, selectedPuesto: null });
                that.props.navigation.goBack();
            })
            .catch(function (errorDataInvitado) {
                that.setState({ loading: false })
                if(errorDataInvitado.response){
                    const { error } = errorDataInvitado.response.data;
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
        .catch(function(errorInvitado){
            that.setState({ loading: false })
            if(errorInvitado.response){
                const { error } = errorInvitado.response.data;
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

    render() {
        const { loading, error, messageError, listadoAreas, listadoPuestos } = this.state
        const _thatR = this;
        const aListadoAreas = [];
        const aListadoPuestos = [];
        aListadoAreas.push(<Picker.Item key={0} value={0} label={"Selecciona tu área"} />)
        for (var i = 0; i < listadoAreas.length; i++){ 
            s = listadoAreas[i]; 
            aListadoAreas.push(<Picker.Item key={ i + 1 } value={s.value} label={s.name} />); 
        }
        aListadoPuestos.push(<Picker.Item key={0} value={0} label={"Selecciona tu puesto"} />)
        for (var i = 0; i < listadoPuestos.length; i++){ 
            s = listadoPuestos[i]; 
            aListadoPuestos.push(<Picker.Item key={ i + 1 } value={s.value} label={s.name} />); 
        }
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
        return (
            <Container>
                <Header style={{ backgroundColor: '#0A1040', marginTop: (Platform.OS === 'ios') ? 0 : Expo.Constants.statusBarHeight}}>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon style={Styles.closeButtonHeader} name='ios-close' />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={Styles.colorStyle}>Agexport+</Title>
                    </Body>
                    <Right />
                </Header>
                <KeyboardAvoidingView style={Styles.keyboardAvoidContainer} behavior="padding" enabled> 
                <Content style={Styles.backgroundContainer}>
                        <View style={ Styles.paddingLRT20 }>
                            <List>
                                <ListItem itemDivider>
                                    <Text>Información general:</Text>
                                </ListItem>
                                <Form>
                                    <Item>
                                        <Input 
                                            onChangeText={( txtNombre )=> this.setState({ txtNombre })}
                                            value={this.state.txtNombre}
                                            placeholder="Nombre"
                                            blurOnSubmit={ false }
                                            onSubmitEditing={() => { this._txtApellido._root.focus() }}
                                        />
                                    </Item>
                                    <Item>
                                        <Input
                                            ref={ (c) => this._txtApellido = c }
                                            onChangeText={( txtApellido )=> this.setState({ txtApellido })}
                                            value={this.state.txtApellido}
                                            placeholder="Apellido"
                                            blurOnSubmit={ false }
                                            onSubmitEditing={() => { this._txtCelular._root.focus() }}
                                        />
                                    </Item>
                                    <Item>
                                        <Input
                                            ref={ (c) => this._txtCelular = c }
                                            onChangeText={( txtCelular )=> this.setState({ txtCelular })}
                                            value={this.state.txtCelular}
                                            keyboardType="phone-pad"
                                            placeholder="Celular"
                                            blurOnSubmit={ false }
                                            onSubmitEditing={() => { this._txtCorreoElectronico._root.focus() }}
                                        />
                                    </Item>
                                </Form>
                                <ListItem itemDivider style={Styles.mt20}>
                                    <Text>Información laboral:</Text>
                                </ListItem>
                                <Form>
                                    <Item>
                                        <Input
                                            ref={ (c) => this._txtCorreoElectronico = c }
                                            onChangeText={( txtEmail )=> this.setState({ txtEmail })}
                                            value={this.state.txtEmail}
                                            autoCapitalize="none"
                                            blurOnSubmit={ false }
                                            keyboardType="email-address"
                                            placeholder="Correo electrónico" />
                                    </Item>
                                    <View>
                                        <Picker
                                            mode="dialog"
                                            iosHeader="Selecciona tu área"
                                            placeholder="Selecciona tu área"
                                            placeholderStyle={Styles.pickerStyle}
                                            iosIcon={<Icon name="ios-arrow-down-outline" />}
                                            style={{ width: undefined }}
                                            selectedValue={this.state.selectedArea}
                                            onValueChange={this.onValueChangedArea}
                                        >
                                            { aListadoAreas }
                                            
                                        </Picker>
                                    </View>
                                    <View>
                                        <Picker
                                            mode="dialog"
                                            iosHeader="Selecciona tu puesto"
                                            iosIcon={<Icon name="ios-arrow-down-outline" />}
                                            placeholder="Selecciona tu puesto"
                                            placeholderStyle={Styles.pickerStyle}
                                            style={{ width: undefined }}
                                            selectedValue={this.state.selectedPuesto}
                                            onValueChange={this.onValueChangedPuesto}
                                        >   
                                            { aListadoPuestos }
                                        </Picker>
                                    </View>
                                    <Button 
                                        onPress={this.guardarInvitado}
                                        style={Styles.btnActivar} full>
                                        <Text>Guardar</Text>
                                    </Button>
                                </Form>
                            </List>
                        </View>
                </Content>
                </KeyboardAvoidingView>
            </Container>
        );
    }
}

export default AgregarInvitadoModal;