import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  isDarkMode?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('PACT ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconBox}>
              <AlertTriangle size={32} color="#EF4444" />
            </View>

            <Text style={styles.errorTitle}>Something Went Wrong</Text>
            <Text style={styles.errorDesc}>
              PACT encountered an unexpected state. Your saved data and trip preferences are secure.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={this.handleReload}
              style={styles.homeBtn}
              accessibilityRole="button"
              accessibilityLabel="Reload application"
            >
              <RefreshCw size={18} color="#050608" />
              <Text style={styles.homeBtnText}>Reload PACT</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#13151E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    padding: 24,
    alignItems: 'center'
  },
  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  errorTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 8,
    textAlign: 'center'
  },
  errorDesc: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20
  },
  homeBtn: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#3DE0A0'
  },
  homeBtnText: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '800',
    color: '#050608'
  }
});
