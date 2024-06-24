import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AvailabilityScreen from './screens/AvailabilityScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Availability" component={AvailabilityScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
