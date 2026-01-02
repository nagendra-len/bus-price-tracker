import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import store from './store';

// Placeholder screen components
const DashboardScreen = () => {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <h1>Dashboard - Price Tracking</h1>
      <p>Coming soon: Real-time bus price tracking interface</p>
    </div>
  );
};

const AlertsScreen = () => {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <h1>My Alerts</h1>
      <p>Coming soon: Manage your price alerts</p>
    </div>
  );
};

const SettingsScreen = () => {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <h1>Settings</h1>
      <p>Coming soon: User preferences and configuration</p>
    </div>
  );
};

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              headerTitle: 'Bus Price Tracker',
            }}
          />
          <Tab.Screen 
            name="Alerts" 
            component={AlertsScreen}
            options={{
              headerTitle: 'My Alerts',
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              headerTitle: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
