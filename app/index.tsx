import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../src/store/useUserStore';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { useCircleStore } from '../src/store/useCircleStore';
import { useCircleChatStore } from '../src/store/useCircleChatStore';
import { useDemoMode } from '../src/hooks/useDemoMode';
import { supabase } from '../src/lib/supabase/client';
import { colors, radius, shadows } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold, fontUIExtraBold } from '../src/theme/typography';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Compass,
  CheckCircle2,
  Users,
  Calendar,
  DollarSign,
  Share2,
  Award,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react-native';
import Reanimated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat
} from 'react-native-reanimated';
import LegalModal, { LegalSection } from '../src/components/LegalModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Interactive Mock Traveler Constraints for the Live Simulator
interface MockConstraint {
  name: string;
  role: string;
  avatarBg: string;
  avatarText: string;
  budgetCap: string;
  dates: string;
  dealbreaker: string;
  status: 'locked' | 'compromised';
}

const SIMULATOR_PERSONAS: MockConstraint[] = [
  {
    name: 'Maya',
    role: 'Organizer',
    avatarBg: '#FF5A5F',
    avatarText: 'M',
    budgetCap: '$1,200',
    dates: 'Oct 12 – 18',
    dealbreaker: 'No hostels',
    status: 'locked'
  },
  {
    name: 'Jake',
    role: 'Budget Cap',
    avatarBg: '#3DE0A0',
    avatarText: 'J',
    budgetCap: '$800',
    dates: 'Flexible Oct',
    dealbreaker: 'Max 1 layover',
    status: 'locked'
  },
  {
    name: 'Priya',
    role: 'Busy Dates',
    avatarBg: '#D4AF37',
    avatarText: 'P',
    budgetCap: '$1,100',
    dates: 'Oct 12 – 16',
    dealbreaker: 'Strict Veg options',
    status: 'locked'
  },
  {
    name: 'You (Alex)',
    role: 'Consensus Vote',
    avatarBg: '#60A5FA',
    avatarText: 'A',
    budgetCap: '$950',
    dates: 'Oct 11 – 17',
    dealbreaker: 'Beachfront only',
    status: 'locked'
  }
];

export default function PactLandingScreen() {
  const router = useRouter();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoiningCode, setIsJoiningCode] = useState(false);
  const [legalSection, setLegalSection] = useState<LegalSection | null>(null);

  // Interactive Simulator State: toggles between initial win-win and AI mediated solution
  const [simScenario, setSimScenario] = useState<'standard' | 'whisperer'>('standard');
  const sealScale = useSharedValue(1);
  const pulseAnim = useSharedValue(1);

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Subtle breathing pulse for consensus seal badge (native only for web stability)
    if (Platform.OS !== 'web') {
      try {
        pulseAnim.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1400 }),
            withTiming(1.0, { duration: 1400 })
          ),
          -1,
          true
        );
      } catch (e) {}
    }
  }, []);

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
    }
  };

  // 1-Tap Judge Sandbox Launcher (Instant Demo)
  const handleLaunchJudgeSandbox = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    useDemoMode.getState().setDemoMode(true);
    useGatherlyStore.getState().loginAsPersona('user-maya-001');
    useCircleStore.getState().loadDemoCircle();
    useCircleChatStore.getState().seedDemoMessages('circle-college-reunion-2026');
    useGatherlyStore.getState().loadDemoScenario('consensus');
    useUserStore.getState().setProfile({
      userId: 'user-maya-001',
      displayName: 'Maya Chen',
      email: 'maya@pact.travel'
    });
    useUserStore.getState().setAuthenticated(true);
    router.replace('/circle/circle-college-reunion-2026/hub' as any);
  };

  // Join Circle with 6-character shortcode
  const handleJoinWithCode = async () => {
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Trip Code Required', 'Please enter a 6-character code (e.g. GOA-4F82).');
      return;
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsJoiningCode(true);

    try {
      // Navigate to the join screen with the sanitized code
      router.push(`/join/${cleanCode}` as any);
    } catch (err: any) {
      Alert.alert('Unable to Join', err?.message || 'Invalid trip invite code.');
    } finally {
      setIsJoiningCode(false);
    }
  };

  // Toggle Live Simulator Scenario (Shows interactive Pareto & Gemini unblocker)
  const toggleSimulatorScenario = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    sealScale.value = withSequence(withSpring(1.2), withSpring(1.0));
    setSimScenario((prev) => (prev === 'standard' ? 'whisperer' : 'standard'));
  };

  const sealAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sealScale.value }]
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }]
  }));

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        {/* Top Floating Glass Navigation Header */}
        <View style={styles.headerBar}>
          <View style={styles.brandCol}>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>PACT</Text>
              <View style={styles.engineStatusBadge}>
                <View style={styles.statusDotActive} />
                <Text style={styles.statusDotText}>CONSENSUS ENGINE</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActionsRow}>
            {/* Quick 1-tap Judge Sandbox Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLaunchJudgeSandbox}
              style={styles.judgeHeaderPill}
            >
              <Zap size={13} color="#FFB800" strokeWidth={2.5} />
              <Text style={styles.judgeHeaderPillText}>Judge Sandbox</Text>
            </TouchableOpacity>

            {/* Sign In / My Circles Link */}
            {isAuthenticated ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic();
                  router.push('/(tabs)/home' as any);
                }}
                style={[styles.signInPill, { backgroundColor: 'rgba(61, 224, 160, 0.12)', borderColor: 'rgba(61, 224, 160, 0.35)' }]}
                accessibilityLabel="Go to My Circles"
              >
                <Text style={[styles.signInPillText, { color: '#3DE0A0' }]}>My Circles →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic();
                  router.push('/auth' as any);
                }}
                style={styles.signInPill}
                accessibilityLabel="Sign In"
              >
                <Text style={styles.signInPillText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Track Ribbon */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(400).springify() : undefined}
            style={styles.trackRibbon}
          >
            <Award size={13} color="#D4AF37" />
            <Text style={styles.trackRibbonText}>REVENUECAT SHIPATHON 2026 · NEXT GEN AWARD TRACK</Text>
          </Reanimated.View>

          {/* Hero Statement */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(500).delay(80).springify() : undefined}
            style={styles.heroSection}
          >
            <Text style={styles.heroPreTitle}>PRIVATE CONSTRAINTS · ZERO GUILT</Text>
            <Text style={styles.heroTitle}>
              5 Friends. 47 Messages.{'\n'}
              <Text style={styles.heroTitleAccent}>Zero Plan.</Text>
            </Text>
            <Text style={styles.heroDescription}>
              PACT collects sealed budgets and blackout dates from your group, deterministically computes the Pareto win-win, and locks the trip with an irreversible wax seal.
            </Text>
          </Reanimated.View>

          {/* Primary Call-to-Action Deck (Visible within 2 seconds) */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(500).delay(150).springify() : undefined}
            style={styles.ctaDeck}
          >
            {/* Primary Action Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                if (isAuthenticated) {
                  router.push('/(tabs)/home' as any);
                } else {
                  router.push('/auth' as any);
                }
              }}
              style={styles.primaryActionBtn}
              accessibilityLabel={isAuthenticated ? "Open My Circles" : "Start a Consensus Circle"}
            >
              <View style={styles.primaryActionBtnContent}>
                <Text style={styles.primaryActionBtnText}>
                  {isAuthenticated ? 'Open Your Circles' : 'Start a Consensus Circle'}
                </Text>
                <Text style={styles.primaryActionBtnSub}>
                  {isAuthenticated ? 'Return to your active trips' : 'Free for up to 8 friends · No credit card'}
                </Text>
              </View>
              <View style={styles.primaryArrowBox}>
                <ArrowRight size={20} color="#090A0F" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            {/* Special Judge Sandbox Hero Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLaunchJudgeSandbox}
              style={styles.judgeSandboxHeroCard}
            >
              <View style={styles.judgeSandboxLeft}>
                <View style={styles.judgeIconCircle}>
                  <Zap size={18} color="#FFB800" strokeWidth={2.5} />
                </View>
                <View style={styles.judgeTextBox}>
                  <View style={styles.judgeTitleRow}>
                    <Text style={styles.judgeCardTitle}>⚡ 5-Minute Judge Sandbox</Text>
                    <View style={styles.instantBadge}>
                      <Text style={styles.instantBadgeText}>INSTANT ACCESS</Text>
                    </View>
                  </View>
                  <Text style={styles.judgeCardDesc}>
                    Pre-loaded with 5 mock travelers, active voting ballot, and live AI Compromise Whisperer.
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#8B8D98" />
            </TouchableOpacity>
          </Reanimated.View>

          {/* Quick Invite Code Join Field (Utility directly on Landing!) */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(500).delay(200).springify() : undefined}
            style={styles.inviteCodeCard}
          >
            <View style={styles.inviteCodeHeader}>
              <Users size={15} color="#3DE0A0" />
              <Text style={styles.inviteCodeTitle}>Have an invite code from a friend?</Text>
            </View>

            <View style={styles.inviteInputRow}>
              <View style={styles.inviteInputWrap}>
                <TextInput
                  style={styles.inviteTextInput}
                  value={joinCodeInput}
                  onChangeText={(txt) => setJoinCodeInput(txt.toUpperCase())}
                  placeholder="e.g. GOA-4F82"
                  placeholderTextColor="#454857"
                  autoCapitalize="characters"
                  maxLength={12}
                  returnKeyType="go"
                  onSubmitEditing={handleJoinWithCode}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleJoinWithCode}
                disabled={isJoiningCode}
                style={styles.inviteJoinBtn}
              >
                <Text style={styles.inviteJoinBtnText}>
                  {isJoiningCode ? 'Joining...' : 'Join Trip'}
                </Text>
                <ArrowRight size={14} color="#090A0F" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </Reanimated.View>

          {/* Interactive Live Consensus Simulator (The Showcase "Aha!" Element) */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(500).delay(250).springify() : undefined}
            style={styles.simulatorCard}
          >
            <View style={styles.simulatorHeader}>
              <View style={styles.simBadge}>
                <Sparkles size={13} color="#3DE0A0" />
                <Text style={styles.simBadgeText}>INTERACTIVE SIMULATOR</Text>
              </View>

              <TouchableOpacity
                onPress={toggleSimulatorScenario}
                activeOpacity={0.7}
                style={styles.simToggleBtn}
              >
                <RefreshCw size={12} color="#8B8D98" />
                <Text style={styles.simToggleBtnText}>
                  {simScenario === 'standard' ? 'Simulate AI Compromise' : 'Reset to Pareto Win'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.simulatorTitle}>
              {simScenario === 'standard'
                ? 'How PACT Uncovers the True Group Win-Win'
                : 'How Gemini 2.5 Whispers a Deadlock Resolution'}
            </Text>
            <Text style={styles.simulatorSub}>
              {simScenario === 'standard'
                ? '4 friends input secret budgets & dates. Watch the consensus engine mathematically compute the overlap where nobody overpays:'
                : 'Jake has a strict $800 cap while Maya wanted luxury. AI whisperer shifted dates by 48h to secure off-peak beachfront rates:'}
            </Text>

            {/* 4 Traveler Constraint Bubbles Grid */}
            <View style={styles.personasGrid}>
              {SIMULATOR_PERSONAS.map((person) => (
                <View key={person.name} style={styles.personaCard}>
                  <View style={styles.personaTopRow}>
                    <View style={[styles.personaAvatar, { backgroundColor: person.avatarBg }]}>
                      <Text style={styles.personaAvatarLetter}>{person.avatarText}</Text>
                    </View>
                    <View style={styles.personaNameCol}>
                      <Text style={styles.personaName}>{person.name}</Text>
                      <Text style={styles.personaRole}>{person.role}</Text>
                    </View>
                    <Lock size={12} color="#3DE0A0" />
                  </View>

                  <View style={styles.constraintRow}>
                    <DollarSign size={11} color="#8B8D98" />
                    <Text style={styles.constraintText}>Cap: {person.budgetCap}</Text>
                  </View>
                  <View style={styles.constraintRow}>
                    <Calendar size={11} color="#8B8D98" />
                    <Text style={styles.constraintText}>{person.dates}</Text>
                  </View>
                  <View style={styles.dealbreakerPill}>
                    <Text style={styles.dealbreakerPillText}>Veto: {person.dealbreaker}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* The Mathematical Consensus Solution Box */}
            <Reanimated.View style={[styles.consensusResultBox, sealAnimatedStyle]}>
              <View style={styles.resultLeftCol}>
                <View style={styles.resultMatchRow}>
                  <View style={styles.matchScoreBadge}>
                    <Text style={styles.matchScoreText}>
                      {simScenario === 'standard' ? '100% UNANIMOUS' : '96% SUPERMAJORITY'}
                    </Text>
                  </View>
                  <Text style={styles.overlapDates}>Oct 12 – 16 · 4 Nights</Text>
                </View>

                <Text style={styles.resultDestination}>📍 Goa Beachfront Villa</Text>
                <Text style={styles.resultBudgetCap}>
                  Fair Share: <Text style={styles.budgetAmount}>$780 / person</Text>
                  <Text style={styles.budgetNote}> (Strictly below Jake's $800 cap)</Text>
                </Text>
              </View>

              {/* Glowing Emerald Wax Seal Stamp */}
              <Reanimated.View style={[styles.waxSealEmblem, pulseAnimatedStyle]}>
                <Svg width="54" height="54" viewBox="0 0 54 54">
                  <Circle cx="27" cy="27" r="24" fill="#0A3826" stroke="#3DE0A0" strokeWidth="2.5" />
                  <Path
                    d="M18 28l6 6 12-14"
                    fill="none"
                    stroke="#3DE0A0"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.waxSealLabel}>SEALED</Text>
              </Reanimated.View>
            </Reanimated.View>
          </Reanimated.View>

          {/* 4 Core Pillars of PACT (Crisp, High-Impact Architecture) */}
          <View style={styles.pillarsSection}>
            <View style={styles.pillarsHeader}>
              <Text style={styles.pillarsPre}>THE PACT ARCHITECTURE</Text>
              <Text style={styles.pillarsTitle}>Engineered for Zero Travel Friction</Text>
            </View>

            <View style={styles.pillarsList}>
              {/* Pillar 1 */}
              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(61, 224, 160, 0.12)' }]}>
                  <ShieldCheck size={20} color="#3DE0A0" />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarCardTitle}>Zero-Knowledge Sealed Constraints</Text>
                  <Text style={styles.pillarCardDesc}>
                    Individual budgets and blackout dates are cryptographically protected via Supabase RLS. Friends never see your personal numbers—only the computed group intersection.
                  </Text>
                </View>
              </View>

              {/* Pillar 2 */}
              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(212, 175, 55, 0.12)' }]}>
                  <TrendingUp size={20} color="#D4AF37" />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarCardTitle}>Deterministic Pareto Engine</Text>
                  <Text style={styles.pillarCardDesc}>
                    Mathematical social choice theory replaces endless WhatsApp polling. Ranks destinations where no member is worse off, automatically preventing budget resentment.
                  </Text>
                </View>
              </View>

              {/* Pillar 3 */}
              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(255, 90, 95, 0.12)' }]}>
                  <Zap size={20} color="#FF5A5F" />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarCardTitle}>Gemini 2.5 Compromise Whisperer</Text>
                  <Text style={styles.pillarCardDesc}>
                    When groups stall, our authenticated Supabase Edge AI analyzes aggregated constraint buckets to calculate off-peak villa shifts and deadlock-breaking proposals.
                  </Text>
                </View>
              </View>

              {/* Pillar 4 */}
              <View style={styles.pillarCard}>
                <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(96, 165, 250, 0.12)' }]}>
                  <Compass size={20} color="#60A5FA" />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarCardTitle}>Living Manifest & Offline Vault</Text>
                  <Text style={styles.pillarCardDesc}>
                    Once the wax seal stamps consensus, PACT generates an offline trip manifest with emergency contacts (112), flight vouchers, and verified spots—ready without WiFi.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* RevenueCat Group Economics Pass */}
          <View style={styles.pricingBannerCard}>
            <View style={styles.pricingBadge}>
              <Award size={12} color="#3DE0A0" />
              <Text style={styles.pricingBadgeText}>FAIR GROUP PRICING</Text>
            </View>
            <Text style={styles.pricingTitle}>One Flat Organizer Pass ($9.99)</Text>
            <Text style={styles.pricingSub}>
              Only the organizer pays. Unlocks up to 24 travelers in the circle with Pro features inherited by all invited friends. Zero per-seat ticketing. Zero monthly subscriptions.
            </Text>
            <View style={styles.pricingPerksRow}>
              <View style={styles.pricingPerkItem}>
                <CheckCircle2 size={13} color="#3DE0A0" />
                <Text style={styles.pricingPerkText}>Up to 24 Travelers</Text>
              </View>
              <View style={styles.pricingPerkItem}>
                <CheckCircle2 size={13} color="#3DE0A0" />
                <Text style={styles.pricingPerkText}>AI Whisperer</Text>
              </View>
              <View style={styles.pricingPerkItem}>
                <CheckCircle2 size={13} color="#3DE0A0" />
                <Text style={styles.pricingPerkText}>Offline Vault</Text>
              </View>
            </View>
          </View>

          {/* Bottom Fast Track CTA Button */}
          <View style={styles.finalCtaWrap}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                if (isAuthenticated) {
                  router.push('/(tabs)/home' as any);
                } else {
                  router.push('/auth' as any);
                }
              }}
              style={styles.primaryActionBtn}
              accessibilityLabel={isAuthenticated ? "Open My Circles" : "Plan Your Next Trip With PACT"}
            >
              <View style={styles.primaryActionBtnContent}>
                <Text style={styles.primaryActionBtnText}>
                  {isAuthenticated ? 'Open Your Circles' : 'Plan Your Next Trip With PACT'}
                </Text>
                <Text style={styles.primaryActionBtnSub}>
                  {isAuthenticated ? 'Return to your active trips' : 'Create account or sign in'}
                </Text>
              </View>
              <View style={styles.primaryArrowBox}>
                <ArrowRight size={20} color="#090A0F" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLaunchJudgeSandbox}
              style={styles.judgeSandboxFooterBtn}
            >
              <Zap size={14} color="#FFB800" />
              <Text style={styles.judgeSandboxFooterBtnText}>
                ⚡ Launch 5-Min Judge Sandbox (Instant Test Circle)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal and Privacy Footer */}
          <View style={styles.footerSection}>
            <View style={styles.footerLinksRow}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('privacy');
                }}
              >
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>·</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('terms');
                }}
              >
                <Text style={styles.footerLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>·</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('rules');
                }}
              >
                <Text style={styles.footerLinkText}>PACT Consensus Rules</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerCopyright}>
              PACT (Plan A Consensus Trip) · Shipathon 2026 Next Gen Track
            </Text>
          </View>
        </ScrollView>
      </View>

      <LegalModal
        visible={legalSection !== null}
        section={legalSection || 'privacy'}
        onClose={() => setLegalSection(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14
  },
  loadingLogoBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glowPrimary
  },
  loadingBrandText: {
    fontFamily: fontDisplay,
    fontSize: 26,
    fontWeight: '800',
    color: '#FF5A5F',
    letterSpacing: 1
  },
  loadingSub: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 440,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Platform.OS === 'web' ? 36 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(9, 10, 15, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D2B',
    zIndex: 10
  },
  brandCol: {
    flexDirection: 'column'
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandTitle: {
    fontFamily: fontDisplay,
    fontSize: 22,
    fontWeight: '900',
    color: '#FF5A5F',
    letterSpacing: 0.5
  },
  engineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)'
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3DE0A0'
  },
  statusDotText: {
    fontFamily: fontUIBold,
    fontSize: 8.5,
    color: '#3DE0A0',
    letterSpacing: 0.5
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  judgeHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12
  },
  judgeHeaderPillText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FFB800'
  },
  signInPill: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  signInPillText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  },
  trackRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14
  },
  trackRibbonText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#D4AF37',
    letterSpacing: 0.6
  },
  heroSection: {
    marginBottom: 20
  },
  heroPreTitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FF5A5F',
    letterSpacing: 1.2,
    marginBottom: 6
  },
  heroTitle: {
    fontFamily: fontDisplay,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 10
  },
  heroTitleAccent: {
    color: '#FF5A5F'
  },
  heroDescription: {
    fontFamily: fontUI,
    fontSize: 14,
    lineHeight: 21,
    color: '#8B8D98'
  },
  ctaDeck: {
    gap: 12,
    marginBottom: 20
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF5A5F',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    ...shadows.glowPrimary
  },
  primaryActionBtnContent: {
    flex: 1
  },
  primaryActionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 16,
    fontWeight: '800',
    color: '#090A0F',
    letterSpacing: -0.2
  },
  primaryActionBtnSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: 'rgba(9, 10, 15, 0.75)',
    marginTop: 2
  },
  primaryArrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  judgeSandboxHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.35)',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  judgeSandboxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8
  },
  judgeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  judgeTextBox: {
    flex: 1
  },
  judgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3
  },
  judgeCardTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    color: '#F4F3F0'
  },
  instantBadge: {
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)'
  },
  instantBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 8,
    color: '#3DE0A0',
    letterSpacing: 0.5
  },
  judgeCardDesc: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98',
    lineHeight: 16
  },
  inviteCodeCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20
  },
  inviteCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  inviteCodeTitle: {
    fontFamily: fontUIBold,
    fontSize: 12.5,
    color: '#F4F3F0'
  },
  inviteInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  inviteInputWrap: {
    flex: 1,
    height: 42,
    backgroundColor: '#1A1D2B',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  inviteTextInput: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1,
    height: '100%',
    width: '100%'
  },
  inviteJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 42,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center'
  },
  inviteJoinBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#090A0F',
    fontWeight: '800'
  },
  simulatorCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24
  },
  simulatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  simBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  simBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#3DE0A0',
    letterSpacing: 0.6
  },
  simToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1A1D2B',
    borderWidth: 1,
    borderColor: '#262938',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8
  },
  simToggleBtnText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  simulatorTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '800',
    color: '#F4F3F0',
    marginBottom: 4
  },
  simulatorSub: {
    fontFamily: fontUI,
    fontSize: 12,
    lineHeight: 17,
    color: '#8B8D98',
    marginBottom: 14
  },
  personasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  personaCard: {
    width: Platform.OS === 'web' ? '48%' : (SCREEN_WIDTH > 440 ? 440 : SCREEN_WIDTH - 76) / 2,
    flexGrow: 1,
    backgroundColor: '#1A1D2B',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 12,
    padding: 10
  },
  personaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  personaAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  personaAvatarLetter: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FFFFFF'
  },
  personaNameCol: {
    flex: 1,
    marginLeft: 6
  },
  personaName: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#FFFFFF'
  },
  personaRole: {
    fontFamily: fontUI,
    fontSize: 9,
    color: '#8B8D98'
  },
  constraintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3
  },
  constraintText: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#F4F3F0'
  },
  dealbreakerPill: {
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 4
  },
  dealbreakerPillText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#FF5A5F'
  },
  consensusResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1714',
    borderWidth: 1.5,
    borderColor: '#3DE0A0',
    borderRadius: 14,
    padding: 14
  },
  resultLeftCol: {
    flex: 1,
    marginRight: 10
  },
  resultMatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  matchScoreBadge: {
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  matchScoreText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    fontWeight: '900',
    color: '#090A0F',
    letterSpacing: 0.4
  },
  overlapDates: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#3DE0A0'
  },
  resultDestination: {
    fontFamily: fontDisplay,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3
  },
  resultBudgetCap: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  budgetAmount: {
    fontFamily: fontUIBold,
    color: '#3DE0A0',
    fontWeight: '800'
  },
  budgetNote: {
    fontSize: 9.5,
    color: '#8B8D98'
  },
  waxSealEmblem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  waxSealLabel: {
    position: 'absolute',
    fontFamily: fontUIBold,
    fontSize: 7.5,
    fontWeight: '900',
    color: '#3DE0A0',
    bottom: -3,
    letterSpacing: 0.5
  },
  pillarsSection: {
    marginBottom: 24
  },
  pillarsHeader: {
    marginBottom: 14
  },
  pillarsPre: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#FF5A5F',
    letterSpacing: 1.2,
    marginBottom: 4
  },
  pillarsTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  pillarsList: {
    gap: 10
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 16,
    padding: 14,
    gap: 12
  },
  pillarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  pillarTextCol: {
    flex: 1
  },
  pillarCardTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 4
  },
  pillarCardDesc: {
    fontFamily: fontUI,
    fontSize: 12,
    lineHeight: 17,
    color: '#8B8D98'
  },
  pricingBannerCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24
  },
  pricingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8
  },
  pricingBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#3DE0A0',
    letterSpacing: 0.6
  },
  pricingTitle: {
    fontFamily: fontDisplay,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4
  },
  pricingSub: {
    fontFamily: fontUI,
    fontSize: 12,
    lineHeight: 17,
    color: '#8B8D98',
    marginBottom: 12
  },
  pricingPerksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#262938'
  },
  pricingPerkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  pricingPerkText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#F4F3F0'
  },
  finalCtaWrap: {
    gap: 10,
    marginBottom: 24
  },
  judgeSandboxFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    borderRadius: 14,
    paddingVertical: 12
  },
  judgeSandboxFooterBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#FFB800'
  },
  footerSection: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1D2B',
    gap: 8
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  footerLinkText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    textDecorationLine: 'underline'
  },
  footerDot: {
    fontSize: 12,
    color: '#454857'
  },
  footerCopyright: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#454857',
    textAlign: 'center'
  }
});
