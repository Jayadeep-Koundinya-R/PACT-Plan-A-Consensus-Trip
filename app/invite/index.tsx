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
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { colors, radius, shadows, spacing } from '../../src/theme/colors';
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
        {/* Top PACT Brand Header Frame Box - Document Style */}
        <View
          style={[
            styles.brandHeaderBox,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
            accessibilityLabel="Back to Dashboard"
          >
            <ArrowLeft size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandTextCol}>
            <View style={styles.brandTitleRow}>
              <View style={[styles.brandLogoCircle, { backgroundColor: theme.primary }]}>
                <Compass size={13} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={[styles.brandTitleText, { color: theme.textPrimary }]}>
                PACT
              </Text>
            </View>
            <Text style={[styles.brandSubtitleText, { color: theme.primary }]}>
              PLAN A CONSENSUS TRIP
            </Text>
          </View>

          <ThemeToggle />
        </View>

        {/* Join Card (Document Motif) */}
        <View
          style={[
            styles.documentCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={[styles.logoIcon, { backgroundColor: theme.primaryLight }]}>
            <KeyRound size={24} color={theme.primary} />
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
              { backgroundColor: theme.primary, opacity: manualCode.trim().length < 4 ? 0.5 : 1 }
            ]}
          >
            <Text style={styles.submitBtnText}>Join Circle</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Privacy Note */}
        <View style={[styles.privacyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ShieldCheck size={16} color={theme.success} />
          <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
            Joining a circle allows you to submit your private dates and budget anonymously with zero peer pressure.
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
    paddingBottom: 130,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  brandHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
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
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2
  },
  brandSubtitleText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1
  },
  documentCard: {
    padding: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 14
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17
  },
  codeInput: {
    width: '100%',
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 14
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.btn,
    width: '100%'
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800'
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1
  },
  privacyText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1
  }
});