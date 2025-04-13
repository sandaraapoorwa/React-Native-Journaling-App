// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/Details';
import LoginScreen from './screens/Login';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">

      <Stack.Screen name ="Login" component={LoginScreen}/>
      <Stack.Screen name ="SplashScreen" component={SplashScreen}/>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
