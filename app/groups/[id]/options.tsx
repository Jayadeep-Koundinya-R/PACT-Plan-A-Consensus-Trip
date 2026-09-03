import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function GroupOptRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/circle/${id || 'circle-college-reunion-2026'}/ranked-matrix` as any);
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: '#090A0F', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#FF5A5F" />
    </View>
  );
}