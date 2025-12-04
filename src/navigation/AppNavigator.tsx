import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, GeoPointScreen, GeoTraceScreen, GeoShapeScreen, DataListScreen, MapViewScreen } from '../screens';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="GeoPoint"
          component={GeoPointScreen}
          options={{
            title: 'Capture GeoPoint',
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
          }}
        />
        <Stack.Screen
          name="GeoTrace"
          component={GeoTraceScreen}
          options={{
            title: 'Record GeoTrace',
            headerStyle: {
              backgroundColor: '#FF9800',
            },
          }}
        />
        <Stack.Screen
          name="GeoShape"
          component={GeoShapeScreen}
          options={{
            title: 'Record GeoShape',
            headerStyle: {
              backgroundColor: '#9C27B0',
            },
          }}
        />
        <Stack.Screen
          name="DataList"
          component={DataListScreen}
          options={{
            title: 'Collected Data',
          }}
        />
        <Stack.Screen
          name="MapView"
          component={MapViewScreen}
          options={{
            title: 'Map View',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
