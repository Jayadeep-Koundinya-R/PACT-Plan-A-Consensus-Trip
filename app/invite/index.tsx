import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck
} from 'lucide-react-native';

export default function InviteIndexScreen() {
  const router = useRouter();
  const { isDarkMode } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  const [manualCode, setManualCode] = useState('');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleSubmitCode = () => {
    triggerHaptic();
    const clean = manualCode.trim().toUpperCase();
    if (clean.length >= 4) {
      router.push(`/invite/${clean}` as any);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top PACT Brand Header Frame Box */}
        <View
          style={[
            styles.brandHeaderBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          >
            <ArrowLeft size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandTextCol}>
            <View style={styles.brandTitleRow}>
              <View style={[styles.brandLogoCircle, { backgroundColor: theme.primary }]}>
                <Compass size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={[styles.brandTitleText, { color: theme.textPrimary }]}>
                PACT
              </Text>
            </View>
            <Text style={[styles.brandSubtitleText, { color: theme.primary }]}>
              Plan A Consensus Trip
            </Text>
          </View>

          <View style={{ width: 32 }} />
        </View>

        {/* Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.md
          ]}
        >
          <View style={[styles.logoIcon, { backgroundColor: theme.primary }, shadows.glowPrimary]}>
            <KeyRound size={28} color="#FFFFFF" />
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Join Trip Circle
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Paste the 6-character code shared by your friend to join their consensus circle.
          </Text>

          <TextInput
            style={[
              styles.codeInput,
              { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
            ]}
            value={manualCode}
            onChangeText={(t) => setManualCode(t.toUpperCase())}
            placeholder="e.g. GOA-2026"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="characters"
            maxLength={12}
            autoFocus
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmitCode}
            disabled={manualCode.trim().length < 4}
            style={[
              styles.submitBtn,
              { backgroundColor: theme.primary, opacity: manualCode.trim().length < 4 ? 0.5 : 1 },
              shadows.glowPrimary
            ]}
          >
            <Text style={styles.submitBtnText}>Join Circle</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <View style={[styles.privacyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ShieldCheck size={16} color={theme.success} />
          <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
            Joining a circle allows you to submit your private dates and budget anonymously.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center'
  },
  brandHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: 16
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  brandTextCol: {
    alignItems: 'center',
    flex: 1
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandLogoCircle: {
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2
  },
  brandSubtitleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1
  },
  card: {
    padding: 24,
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 14
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18
  },
  codeInput: {
    width: '100%',
    borderRadius: radius.md,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 18
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: radius.btn,
    width: '100%'
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1
  },
  privacyText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1
  }
});