import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Compass, PlusCircle, Settings } from 'lucide-react-native';
import { useTheme } from '../../src/hooks/useTheme';

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDarkMode ? '#C3BAA6' : '#5C5445',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#0E1424' : '#F6EFDE',
          borderTopColor: theme.border,
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
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size || 22} color={color} strokeWidth={2.2} />
          )
        }}
      />
      {/* Hidden from bottom navigation bar per user request — accessible via Settings & Home buttons */}
      <Tabs.Screen
        name="pro"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
