import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AlertsListScreen from './screens/AlertsListScreen';
import CreateAlertScreen from './screens/CreateAlertScreen';
import FilterScreen from './screens/FilterScreen';
import BookingScreen from './screens/BookingScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (token) => {
    AsyncStorage.setItem('authToken', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    AsyncStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="AlertsList"
              component={AlertsListScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="CreateAlert"
              component={CreateAlertScreen}
            />
            <Stack.Screen
        name="Filter"
        component={FilterScreen}
      />
            <Stack.Screen
        name="Booking"
        component={BookingScreen}
      />
      
      
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              initialParams={{ onLogin: handleLogin }}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              initialParams={{ onLogin: handleLogin }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
