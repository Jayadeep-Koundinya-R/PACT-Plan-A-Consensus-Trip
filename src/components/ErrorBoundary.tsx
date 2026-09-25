import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

/**
 * ErrorBoundary — catches unhandled React errors anywhere in the component tree
 * and renders a recovery screen instead of a white-screen crash.
 *
 * Styled with the Obsidian Midnight palette:
 *   Background: #090A0F, Card: #13151E, Coral: #FF5A5F, Emerald: #3DE0A0, Text: #F4F3F0
 */

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional callback invoked when the user taps "Return to Home" */
  onReset?: () => void;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development; in production this could report to a service
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Your data is safe — tap below to return home.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorBox} contentContainerStyle={styles.errorBoxContent}>
                <Text style={styles.errorText} selectable>
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.stackText} selectable numberOfLines={12}>
                    {this.state.error.stack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={this.handleReset}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Return to Home"
            >
              <Text style={styles.resetButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: 24,
  },
  card: {
    backgroundColor: '#13151E',
    borderRadius: 20,
    padding: 32,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.15)',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F4F3F0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(244, 243, 240, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 90, 95, 0.08)',
    borderRadius: 12,
    padding: 14,
    maxHeight: 160,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.2)',
  },
  errorBoxContent: {
    paddingBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#FF5A5F',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  stackText: {
    fontSize: 11,
    color: 'rgba(255, 90, 95, 0.5)',
    fontFamily: 'monospace',
    marginTop: 6,
    lineHeight: 16,
  },
  resetButton: {
    backgroundColor: '#3DE0A0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#090A0F',
    letterSpacing: 0.3,
  },
});

export default ErrorBoundary;
