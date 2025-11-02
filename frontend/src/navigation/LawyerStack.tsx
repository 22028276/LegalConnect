import setupAxiosInterceptors from '../services/axiosConfig';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { MainStackNames, MainStackRoutes } from './routes';

const AppStack = createNativeStackNavigator();

setupAxiosInterceptors();

export default function LawyerStack() {
  // For lawyers, always start at HomeTabs
  // Profile completion should be optional, not blocking
  // Users can complete profile from Settings if needed
  return (
    <AppStack.Navigator initialRouteName={MainStackNames.HomeTabs}>
      {MainStackRoutes.map(route => (
        <AppStack.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={route.options}
        />
      ))}
    </AppStack.Navigator>
  );
}

