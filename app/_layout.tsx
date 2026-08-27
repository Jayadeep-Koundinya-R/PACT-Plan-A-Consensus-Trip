import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useGatherlyStore } from '../src/store/useGatherlyStore';

export default function RootLayout() {
  const isDarkMode = useGatherlyStore((state) => state.isDarkMode);

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false
        }}
      />
    </>
  );
}
