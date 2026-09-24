import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function InviteCodeScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const rawCode = Array.isArray(code) ? code[0] : code || '';
  const sanitizedCode = rawCode
    .replace(/^pact:\/\/(join\/|invite\/)?/i, '')
    .split('?')[0]
    .replace(/\/+$/, '')
    .trim();
  const inviteCode = sanitizedCode.toUpperCase();

  useEffect(() => {
    if (inviteCode) {
      router.replace(`/join/${inviteCode}` as any);
    } else {
      router.replace('/(tabs)/home');
    }
  }, [inviteCode]);

  return (
    <View style={{ flex: 1, backgroundColor: '#090A0F', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF5A5F" />
    </View>
  );
}