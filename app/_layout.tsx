import React, { Component, ReactNode, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_700Bold
} from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold
} from '@expo-google-fonts/manrope';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../src/theme/colors';
import { initPurchases } from '../src/lib/purchases/config';
import { supabase } from '../src/lib/supabase/client';
import { SyncBadge } from '../src/components/common';
import ErrorBoundary from '../src/components/ErrorBoundary';

// Keep splash visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isDarkMode = useGatherlyStore((state) => state.isDarkMode);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    Manrope_400Regular,
    Manrope_700Bold,
    Manrope_800ExtraBold
  });

  useEffect(() => {
    if (fontsLoaded) {
      useGatherlyStore.getState().initThemeFromStorage();
      SplashScreen.hideAsync();
      initPurchases();
    }
  }, [fontsLoaded]);

  // Return null while fonts load — splash screen stays visible
  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SyncBadge />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom'
        }}
      />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center'
  },
  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center'
  },
  errorDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20
  },
  reloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.btn,
    width: '100%'
  },
  reloadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
