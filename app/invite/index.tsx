import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../../src/theme/colors';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react-native';

export default function InviteIndexScreen() {
  const router = useRouter();
  const { isDarkMode } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  const [manualCode, setManualCode] = useState('');

  const handleSubmitCode = () => {
    const clean = manualCode.trim().toUpperCase();
    if (clean.length >= 4) {
      router.push('/invite/' + clean);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
        >
          <ArrowLeft size={18} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={[styles.logoIcon, { backgroundColor: theme.primary }, shadows.md]}>
          <Compass size={36} color="#FFFFFF" />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Enter Invite Code
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Paste the 6-character code shared by your friend to join their trip circle.
        </Text>

        <TextInput
          style={[
            styles.codeInput,
            { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
          ]}
          value={manualCode}
          onChangeText={(t) => setManualCode(t.toUpperCase())}
          placeholder="e.g. X7K2QM"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="characters"
          maxLength={8}
          autoFocus
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmitCode}
          disabled={manualCode.trim().length < 4}
          style={[
            styles.submitBtn,
            { backgroundColor: theme.primary, opacity: manualCode.trim().length < 4 ? 0.5 : 1 }
          ]}
        >
          <Text style={styles.submitBtnText}>Join Circle</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center',
    maxWidth: 500, width: '100%', alignSelf: 'center'
  },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1
  },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 24, lineHeight: 18 },
  codeInput: {
    width: '100%', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16,
    borderWidth: 1, fontSize: 24, fontWeight: '800', textAlign: 'center',
    letterSpacing: 4, marginBottom: 20
  },
  submitBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%'
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' }
});
