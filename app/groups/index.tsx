import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function GroupsRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings' as any);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#090A0F', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#FF5A5F" />
    </View>
  );
}