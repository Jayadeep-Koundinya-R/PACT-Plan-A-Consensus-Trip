import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../src/theme/colors';
import { Compass, RefreshCw, AlertTriangle } from 'lucide-react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  isDarkMode: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('PACT RootErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const theme = this.props.isDarkMode ? colors.dark : colors.light;
      return (
        <SafeAreaView style={[styles.errorContainer, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.errorCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.md
            ]}
          >
            <View style={[styles.errorIconBox, { backgroundColor: theme.primaryLight }]}>
              <AlertTriangle size={32} color={theme.primary} />
            </View>

            <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
              Something Went Wrong
            </Text>
            <Text style={[styles.errorDesc, { color: theme.textSecondary }]}>
              PACT encountered an unexpected state. Your saved data and trip preferences are secure.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={this.handleReload}
              style={[styles.reloadBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
            >
              <RefreshCw size={18} color="#FFFFFF" />
              <Text style={styles.reloadBtnText}>Reload PACT</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const isDarkMode = useGatherlyStore((state) => state.isDarkMode);

  return (
    <RootErrorBoundary isDarkMode={isDarkMode}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom'
        }}
      />
    </RootErrorBoundary>
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