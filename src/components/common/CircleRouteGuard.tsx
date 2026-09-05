import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';

interface CircleRouteGuardProps {
  id: string | string[] | undefined;
  children: React.ReactNode;
}

export const CircleRouteGuard: React.FC<CircleRouteGuardProps> = ({ id, children }) => {
  const router = useRouter();

  const isInvalid = !id || id === 'undefined' || id === '[id]' || (typeof id === 'string' && id.trim().length === 0);

  if (isInvalid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <AlertCircle size={28} color="#FF5A5F" />
          </View>
          <Text style={styles.title}>Circle Not Found</Text>
          <Text style={styles.description}>
            This trip circle link appears to be missing an identifier or has expired.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <ArrowLeft size={16} color="#0D0E15" strokeWidth={2.5} />
            <Text style={styles.backButtonText}>Return to My Circles</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F1017',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fontDisplay,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: fontUI,
    fontSize: 14,
    color: '#8B8D98',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3DE0A0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  backButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#052E20',
    fontWeight: '700',
  },
});
