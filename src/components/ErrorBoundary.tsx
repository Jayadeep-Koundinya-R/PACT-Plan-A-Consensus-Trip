import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle, Home } from 'lucide-react-native';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled React Error in ErrorBoundary:', error, errorInfo);
  }

  handleReturnHome = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <AlertTriangle size={32} color="#FF5A5F" />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Don't worry — your sealed constraints and trip votes are safely saved.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={this.handleReturnHome}
              style={styles.homeBtn}
              accessibilityLabel="Return to Home"
            >
              <Home size={18} color="#050608" />
              <Text style={styles.homeBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center'
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 90, 95, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  homeBtn: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#3DE0A0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  homeBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#050608'
  }
});
