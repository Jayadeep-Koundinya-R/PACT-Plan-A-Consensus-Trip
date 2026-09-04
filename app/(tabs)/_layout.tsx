import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Compass, PlusCircle, Sparkles, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF5A5F',
        tabBarInactiveTintColor: '#8B8D98',
        tabBarStyle: {
          backgroundColor: '#0D0E15',
          borderTopColor: '#1F2232',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
          left: 0,
          right: 0,
          marginHorizontal: 'auto'
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: -0.2
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'My Circles',
          tabBarLabel: 'My Circles',
          tabBarIcon: ({ color, size }) => (
            <Compass size={size || 22} color={color} strokeWidth={2.2} />
          )
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'New Trip',
          tabBarLabel: 'New Trip',
          tabBarIcon: ({ color, size }) => (
            <PlusCircle size={size || 22} color={color} strokeWidth={2.2} />
          )
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: 'PACT Pro',
          tabBarLabel: 'PACT Pro',
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size || 22} color={color} strokeWidth={2.2} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size || 22} color={color} strokeWidth={2.2} />
          )
        }}
      />
    </Tabs>
  );
}
