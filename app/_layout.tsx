import React, { Component, ReactNode, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
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

// Keep splash visible on native only until fonts are loaded
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function RootLayout() {
  const isDarkMode = useGatherlyStore((state) => state.isDarkMode);

  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    Manrope_400Regular,
    Manrope_700Bold,
    Manrope_800ExtraBold
  });

  useEffect(() => {
    useGatherlyStore.getState().initThemeFromStorage();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        document.body.style.backgroundColor = '#050608';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        if (document.documentElement) {
          document.documentElement.style.backgroundColor = '#050608';
        }
      } catch (_e) {}
    }
    if (fontsLoaded || fontError || Platform.OS === 'web') {
      SplashScreen.hideAsync().catch(() => {});
      initPurchases();
    }
  }, [fontsLoaded, fontError]);

  // Return null on native while fonts load — on web, render immediately with system font fallbacks
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') return null;

  return (
    <ErrorBoundary>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <SyncBadge />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#050608' }
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
