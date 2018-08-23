import React, { Component } from 'react';
import { createBottomTabNavigator, createDrawerNavigator, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { Image, Text } from "react-native";
import { Root, Button, Icon } from "native-base";
import { Ionicons } from '@expo/vector-icons'; 

import RegistroScreen from '../screens/RegistroScreen';
import ValidacionScreen from '../screens/ValidacionScreen';
import SolicitudScreen from '../screens/SolicitudScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import HomeScreen from '../screens/HomeScreen';

import BeneficioScreen from '../screens/BeneficioScreen';
import DetalleBeneficioScreen from '../screens/DetalleBeneficioScreen';
import LectorBeneficioScreen from '../screens/LectorBeneficioScreen';

import DrawerContainer from '../screens/DrawerContainer';

import PublicScreen from '../screens/PublicScreen';
import PrivateScreen from '../screens/PrivateScreen';
import DetalleActivityScreen from '../screens/DetalleActivityScreen';
import ScannerActivityScreen from '../screens/ScannerActivityScreen';

import ProgramaBeneficiosScreen from '../screens/ProgramaBeneficiosScreen';
import ProgramaPuntosScreen from '../screens/ProgramaPuntosScreen';
import InvitadosScreen from '../screens/InvitadosScreen';

import ScannerScreen from '../screens/ScannerScreen';
import AgregarInvitadoModal from '../screens/AgregarInvitadoModal';
import EditarModalScreen from '../screens/EditarModalScreen';

const HomeStack = createStackNavigator({
    Home: HomeScreen,
    ProgramaBeneficios: { screen: ProgramaBeneficiosScreen },
    ProgramaPuntos: { screen: ProgramaPuntosScreen },
    Invitados: { screen: InvitadosScreen }
},{
    navigationOptions: ({ navigation }) => ({
        headerLeft: (<Image style={{marginLeft: 20, height:180, width:120 }} resizeMode='contain' source={require('../assets/img/HeaderLogo.png')} />),
        headerStyle:{
            backgroundColor: '#0A1040',
        },
        headerBackTitle: null,
        headerTitleStyle:{
            textAlign: 'center',
            color: '#FFFFFF'
        },
        headerTintColor:'#FFF',
        headerRight:<Button transparent light onPress={() => navigation.openDrawer()}>
                    <Icon style={{ color: 'white' }} name='menu' />
        </Button>
    })
});

const RootHomeStack = createStackNavigator({
    Home: {
        screen: HomeStack,
    },
    ScannerModal: {
        screen: ScannerScreen,
    },
    InvitadoModal: {
        screen: AgregarInvitadoModal,
    },
    EditarModal:{
        screen: EditarModalScreen,
    },
},
{
    mode: 'modal',
    headerMode: 'none',
}
);

const BeneficioStack = createStackNavigator({
    Beneficio: { screen: BeneficioScreen },
    DetalleBeneficio: { screen: DetalleBeneficioScreen },
    Lector: LectorBeneficioScreen,
},{
    cardStyle:{
        backgroundColor: '#FFF'
    },
    navigationOptions: ({ navigation }) => ({
        //headerTitle: 'Agexport+',
        headerTitle: (<Image style={{marginLeft: 20, height:180, width:120 }} resizeMode='contain' source={require('../assets/img/HeaderLogo.png')} />),
        headerStyle:{
            backgroundColor: '#0A1040',
        },
        headerBackTitle: null,
        headerTitleStyle:{
            textAlign: 'center'
        },
        headerTintColor:'#FFF',
        headerRight:<Button transparent light onPress={() => navigation.openDrawer()}>
                    <Icon style={{ color: 'white' }} name='menu' />
        </Button>
    })
});

const AuthStack = createStackNavigator({
    Registro: RegistroScreen,
    Validacion: ValidacionScreen,
    Solicitud: SolicitudScreen,
},{
    navigationOptions: ({ navigation }) => ({
        //headerTitle: 'Agexport+',
        headerLeft: (<Image style={{ marginLeft: 20, height:180, width:120 }} resizeMode='contain' source={require('../assets/img/HeaderLogo.png')} />),
        headerStyle:{
            backgroundColor: '#0A1040',
        },
        headerTitleStyle:{
            textAlign: 'center',
            color: '#FFFFFF'
        }
    })
});

const ListActivities = createBottomTabNavigator({
    Public: { screen: PublicScreen },
    Private: { screen: PrivateScreen }
},{
    tabBarPosition: 'top',
    swipeEnabled: false,
    tabBarOptions: {
        activeTintColor: '#FFF',
        inactiveTintColor: '#bdc3c7',
        style: {
            backgroundColor: '#101474',
        },
        indicatorStyle:{
            backgroundColor: '#FFFFFF'
        }
    },
});

const ActivitiesStack = createStackNavigator({
    ListActivities,
    DetalleActivity: { screen: DetalleActivityScreen }
},{
    cardStyle:{
        backgroundColor: '#FFFFFF'
    },
    navigationOptions: ({ navigation }) => ({
        //headerTitle: 'Agexport+',
        headerTitle: (<Image style={{marginLeft: 20, height:180, width:120 }} resizeMode='contain' source={require('../assets/img/HeaderLogo.png')} />),
        //headerTitle: 'Actividades',
        headerStyle:{
            backgroundColor: '#0A1040',
        },
        headerTitleStyle:{
            textAlign: 'center'
        },
        headerTintColor:'#FFFFFF',
        headerRight:<Button transparent light onPress={() => navigation.openDrawer()}>
                    <Icon style={{ color: 'white' }} name='menu' />
        </Button>,
    })
});

const RootActivitiesStack = createStackNavigator({
        Activities: {
            screen: ActivitiesStack,
        },
        ScannerModalActivity: {
            screen: ScannerActivityScreen,
        },
    },
    {
        mode: 'modal',
        headerMode: 'none',
    }
);


let listadoTabs = {
    RootHomeStack,
    BeneficioStack,
    RootActivitiesStack,
};

const AppStack = createBottomTabNavigator(listadoTabs, {
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    tabBarOptions: {
        showIcon:true,
        activeTintColor: '#FFFFFF',
        inactiveTintColor: '#bdc3c7',
        style: {
            backgroundColor: '#0A1040',
        },
        indicatorStyle:{
            backgroundColor: '#FFFFFF'
        },
        iconStyle:{
            color: '#FFFFFF',
        }
    },
    navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
           
            let iconName;
            if (routeName === 'RootHomeStack') {
                iconName = `ios-qr-scanner${focused ? '' : '-outline'}`;
            } else if (routeName === 'BeneficioStack') {
                iconName = `ios-pricetags${focused ? '' : '-outline'}`;
            }else if(routeName === 'RootActivitiesStack'){
                iconName = `ios-calendar${focused ? '' : '-outline'}`;
            }
            return <Ionicons name={iconName} size={25} color={tintColor} />;
        },
        tabBarLabel: ({ focused }) => {
            const { routeName } = navigation.state;
            //const { tabname } = nametabbar;
            
            //console.log(tabname);
            let lblName;
            if(routeName == 'RootHomeStack'){
                lblName = 'Inicio';
            }else if(routeName == 'BeneficioStack'){
                lblName = 'Beneficios';
            }else if(routeName == 'RootActivitiesStack'){
                lblName = 'Actividades';
            }
            return <Text style={{ textAlign: 'center', color: '#FFFFFF' }}>{lblName}</Text>
        }
    })
});

const AppDrawer = createDrawerNavigator({
    ContainerApp: { screen: AppStack },
}, {
    drawerPosition: 'right',
    contentComponent: DrawerContainer
});

const RootTabNavigator = createSwitchNavigator({
    AuthLoading: AuthLoadingScreen,
    App: AppDrawer,
    Auth: AuthStack,
},{
    initialRouteName: 'AuthLoading',
});

export default () =>(
    <Root>
        <RootTabNavigator />
    </Root>
)
