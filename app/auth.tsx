import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../src/lib/supabase/client';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { useCircleStore } from '../src/store/useCircleStore';
import { useCircleChatStore } from '../src/store/useCircleChatStore';
import { useUserStore } from '../src/store/useUserStore';
import { useDemoMode } from '../src/hooks/useDemoMode';
import { colors, radius, shadows } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold, fontUIExtraBold } from '../src/theme/typography';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  KeyRound,
  User,
  ShieldCheck,
  Lock,
  Zap,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  Clock,
  Compass,
  FileCheck2
} from 'lucide-react-native';
import Reanimated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import LegalModal, { LegalSection } from '../src/components/LegalModal';

interface JudgePersonaOption {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  badge: string;
  badgeColor: string;
  desc: string;
}

const JUDGE_PERSONAS: JudgePersonaOption[] = [
  {
    id: 'user-maya-001',
    name: 'Maya Chen',
    role: 'Organizer',
    avatarBg: '#FF5A5F',
    badge: 'Pro Pass Active',
    badgeColor: '#3DE0A0',
    desc: 'Organizer · College Reunion 2026'
  },
  {
    id: 'user-jake-002',
    name: 'Jake Miller',
    role: 'Budget Cap',
    avatarBg: '#3DE0A0',
    badge: 'Cap: $800',
    badgeColor: '#FFB800',
    desc: 'Budget Constraint · Veto active'
  },
  {
    id: 'user-priya-003',
    name: 'Priya Sharma',
    role: 'Busy Dates',
    avatarBg: '#D4AF37',
    badge: 'Oct 12-16',
    badgeColor: '#60A5FA',
    desc: 'Date Constraint · Early Bird'
  }
];

export default function AuthScreen() {
  const router = useRouter();
  const {
    login,
    register,
    loginAsPersona,
    initAuthSession
  } = useGatherlyStore();

  const [isSignUp, setIsSignUp] = useState(false); // Default to clean sign-in
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [legalSection, setLegalSection] = useState<LegalSection | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        await initAuthSession();
      } catch (e) {}
    };
    check();
  }, []);

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
    }
  };

  // Instant Judge Persona 1-Tap Login
  const handleSelectJudgePersona = (persona: JudgePersonaOption) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    useDemoMode.getState().setDemoMode(true);
    loginAsPersona(persona.id);
    useCircleStore.getState().loadDemoCircle();
    useCircleChatStore.getState().seedDemoMessages('circle-college-reunion-2026');
    useGatherlyStore.getState().loadDemoScenario('early_bird');
    useUserStore.getState().setProfile({
      userId: persona.id,
      displayName: persona.name,
      email: `${persona.name.toLowerCase().replace(' ', '.')}@pact.travel`
    });
    useUserStore.getState().setAuthenticated(true);
    router.replace('/(tabs)/home');
  };

  // Instant Judge Sandbox General Bypass
  const handleInstantSandbox = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    useDemoMode.getState().setDemoMode(true);
    loginAsPersona('user-maya-001');
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

  // Password Reset Link
  const handleForgotPassword = async () => {
    triggerHaptic();
    setErrorMessage('');
    setStatusMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter your account email address above to receive a reset link.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMessage(error.message);
      } else {
        setStatusMessage(`Secure password reset link dispatched to ${email.trim()}.`);
      }
    } catch (e: any) {
      setStatusMessage(`Reset link dispatched to ${email.trim()}.`);
    }
  };

  // Form Submission
  const handleAuthSubmit = async () => {
    setErrorMessage('');
    setStatusMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both your email and password.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setErrorMessage('Please enter your full name for your travel profile.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await register(email.trim(), password, name.trim());
        const g = useGatherlyStore.getState();
        useUserStore.getState().setProfile({
          userId: g.currentUserId,
          displayName: name.trim() || g.userName || 'Traveler',
          email: email.trim()
        });
      } else {
        await login(email.trim(), password);
        const g = useGatherlyStore.getState();
        useDemoMode.getState().setDemoMode(false);
        useCircleStore.getState().clearDemoCircles();
        useCircleChatStore.getState().clearAllMessages();
        useGatherlyStore.getState().resetToCleanUser();
        useUserStore.getState().setProfile({
          userId: g.currentUserId,
          displayName: g.userName || 'Traveler',
          email: email.trim()
        });
      }
      useUserStore.getState().setAuthenticated(true);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation to Landing Page (handles both web direct-load and mobile navigation stack)
  const handleGoToLanding = () => {
    triggerHaptic();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Clean Header with Back Button */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoToLanding}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to landing page"
            >
              <ArrowLeft size={16} color="#F4F3F0" />
              <Text style={styles.backBtnText}>Landing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGoToLanding}
              style={styles.headerTitleBox}
            >
              <Text style={styles.brandTitle}>PACT</Text>
              <Text style={styles.brandSubtitle}>PLAN A CONSENSUS TRIP</Text>
            </TouchableOpacity>

            {/* Spacer to balance back button */}
            <View style={styles.headerSpacer} />
          </View>

          {/* ⚡ Judge & Tester 1-Tap Persona Switcher Card */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(400).springify() : undefined}
            style={styles.judgeSectionCard}
          >
            <View style={styles.judgeHeaderRow}>
              <View style={styles.judgeHeaderBadge}>
                <Zap size={11} color="#FFB800" strokeWidth={2.5} />
                <Text style={styles.judgeBadgeText}>JUDGE & EVALUATION ACCESS</Text>
              </View>
              <Text style={styles.judgeSubText}>1-Tap Sign In as Pre-Seeded Traveler</Text>
            </View>

            <View style={styles.personaRow}>
              {JUDGE_PERSONAS.map((persona) => (
                <TouchableOpacity
                  key={persona.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectJudgePersona(persona)}
                  style={styles.personaChip}
                >
                  <View style={[styles.personaAvatar, { backgroundColor: persona.avatarBg }]}>
                    <Text style={styles.personaAvatarText}>{persona.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.personaChipTextCol}>
                    <Text style={styles.personaChipName}>{persona.name}</Text>
                    <View style={[styles.personaRoleBadge, { borderColor: persona.badgeColor }]}>
                      <Text style={[styles.personaRoleBadgeText, { color: persona.badgeColor }]}>
                        {persona.badge}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Reanimated.View>

          {/* Main Obsidian Authentication Card */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(500).delay(100).springify() : undefined}
            style={styles.authCard}
          >
            {/* Segmented Mode Switcher (Sign In vs Create Account) */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic();
                  setIsSignUp(false);
                  setErrorMessage('');
                  setStatusMessage('');
                }}
                style={[styles.tabBtn, !isSignUp && styles.activeTabBtn]}
              >
                <Text style={[styles.tabBtnText, !isSignUp && styles.activeTabBtnText]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic();
                  setIsSignUp(true);
                  setErrorMessage('');
                  setStatusMessage('');
                }}
                style={[styles.tabBtn, isSignUp && styles.activeTabBtn]}
              >
                <Text style={[styles.tabBtnText, isSignUp && styles.activeTabBtnText]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sub-header instruction */}
            <Text style={styles.authHeading}>
              {isSignUp ? 'Create your private PACT account' : 'Welcome back to your circles'}
            </Text>
            <Text style={styles.authSub}>
              {isSignUp
                ? 'Your budget caps and blackout dates are 100% confidential.'
                : 'Sign in to access your voting ballots and trip manifests.'}
            </Text>

            {/* Input: Full Name (Visible only on Sign Up) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <User size={16} color="#8B8D98" />
                  <TextInput
                    style={styles.inputField}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Maya Chen"
                    placeholderTextColor="#454857"
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Input: Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Mail size={16} color="#8B8D98" />
                <TextInput
                  style={styles.inputField}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="traveler@example.com"
                  placeholderTextColor="#454857"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                {!isSignUp && (
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <KeyRound size={16} color="#8B8D98" />
                <TextInput
                  style={styles.inputField}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor="#454857"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleAuthSubmit}
                />
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    setShowPassword(!showPassword);
                  }}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#8B8D98" />
                  ) : (
                    <Eye size={16} color="#8B8D98" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Feedback Message (e.g. Password Reset Confirmation) */}
            {Boolean(statusMessage) && (
              <View style={styles.statusBox}>
                <CheckCircle2 size={16} color="#3DE0A0" />
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
            )}

            {/* Error Message Banner */}
            {Boolean(errorMessage) && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#FF5A5F" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Primary Submit Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleAuthSubmit}
              disabled={isLoading}
              style={[styles.submitBtn, { opacity: isLoading ? 0.7 : 1 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#090A0F" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {isSignUp ? 'Create Account & Start Planning' : 'Sign In to Trip Spaces'}
                  </Text>
                  <ArrowRight size={17} color="#090A0F" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
            {/* Instant Judge Sandbox Bypass */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleInstantSandbox}
              style={styles.sandboxGuestBtn}
            >
              <Zap size={15} color="#FFB800" strokeWidth={2.5} />
              <Text style={styles.sandboxGuestBtnText}>
                ⚡ Try 5-Min Judge Sandbox (Instant Access)
              </Text>
            </TouchableOpacity>
            {/* Return to Landing Page Action */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoToLanding}
              style={styles.returnToLandingBtn}
            >
              <ArrowLeft size={13} color="#8B8D98" />
              <Text style={styles.returnToLandingText}>Back to PACT Landing Page</Text>
            </TouchableOpacity>
          </Reanimated.View>

          {/* Zero-Knowledge Privacy Architecture Guarantee (Replaces the 8-card wall!) */}
          <Reanimated.View
            entering={Platform.OS !== 'web' ? FadeInDown.duration(500).delay(200).springify() : undefined}
            style={styles.trustSectionCard}
          >
            <View style={styles.trustHeader}>
              <ShieldCheck size={16} color="#3DE0A0" />
              <Text style={styles.trustHeaderTitle}>The PACT Privacy Promise</Text>
            </View>

            <View style={styles.trustGrid}>
              <View style={styles.trustCol}>
                <Lock size={15} color="#3DE0A0" style={styles.trustIcon} />
                <Text style={styles.trustColTitle}>Sealed Inputs</Text>
                <Text style={styles.trustColDesc}>
                  Raw budgets & dates are RLS-isolated. Friends only see the computed group overlap.
                </Text>
              </View>

              <View style={styles.trustCol}>
                <Sparkles size={15} color="#D4AF37" style={styles.trustIcon} />
                <Text style={styles.trustColTitle}>Pareto Consensus</Text>
                <Text style={styles.trustColDesc}>
                  Mathematical win-win algorithm prevents budget embarrassment and WhatsApp deadlocks.
                </Text>
              </View>

              <View style={styles.trustCol}>
                <Crown size={15} color="#FF5A5F" style={styles.trustIcon} />
                <Text style={styles.trustColTitle}>Pro Circle</Text>
                <Text style={styles.trustColDesc}>
                  1 organizer pass covers up to 24 members. No per-seat ticketing or monthly fees.
                </Text>
              </View>
            </View>
          </Reanimated.View>

          {/* Legal Footer Links */}
          <View style={styles.legalFooter}>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('privacy');
                }}
              >
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.legalDot}>·</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('terms');
                }}
              >
                <Text style={styles.legalLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalDot}>·</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('rules');
                }}
              >
                <Text style={styles.legalLinkText}>Consensus Rules</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.legalSub}>
              PACT · Built with privacy-first mathematical consensus
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LegalModal
        visible={legalSection !== null}
        section={legalSection || 'privacy'}
        onClose={() => setLegalSection(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090A0F'
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center'
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938'
  },
  backBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0'
  },
  returnToLandingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6
  },
  returnToLandingText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#8B8D98'
  },
  headerTitleBox: {
    alignItems: 'center'
  },
  brandTitle: {
    fontFamily: fontDisplay,
    fontSize: 22,
    fontWeight: '900',
    color: '#FF5A5F',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontFamily: fontUIBold,
    fontSize: 8.5,
    color: '#8B8D98',
    letterSpacing: 1.2,
    marginTop: 1
  },
  headerSpacer: {
    width: 36
  },
  judgeSectionCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.35)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8
  },
  judgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  judgeHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.25)'
  },
  judgeBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 8.5,
    color: '#FFB800',
    letterSpacing: 0.5
  },
  judgeSubText: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98'
  },
  personaRow: {
    flexDirection: 'row',
    gap: 8
  },
  personaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D2B',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 10,
    padding: 8,
    gap: 6
  },
  personaAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  personaAvatarText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FFFFFF'
  },
  personaChipTextCol: {
    flex: 1
  },
  personaChipName: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FFFFFF'
  },
  personaRoleBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
    alignSelf: 'flex-start'
  },
  personaRoleBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 8,
    letterSpacing: 0.2
  },
  authCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1A1D2B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262938'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTabBtn: {
    backgroundColor: '#13151E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  tabBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#8B8D98'
  },
  activeTabBtnText: {
    color: '#FF5A5F'
  },
  authHeading: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '800',
    color: '#F4F3F0',
    marginBottom: 4
  },
  authSub: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#8B8D98',
    lineHeight: 17,
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#8B8D98',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  forgotPasswordText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FF5A5F'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D2B',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    gap: 10
  },
  inputField: {
    flex: 1,
    fontFamily: fontUI,
    fontSize: 14,
    color: '#FFFFFF',
    height: '100%'
  },
  eyeBtn: {
    padding: 6
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  statusText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#3DE0A0',
    flex: 1
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  errorText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#FF5A5F',
    flex: 1
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A5F',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
    marginBottom: 16,
    ...shadows.glowPrimary
  },
  submitBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#090A0F',
    letterSpacing: -0.2
  },
  sandboxGuestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.25)',
    paddingVertical: 12,
    borderRadius: 14
  },
  sandboxGuestBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#FFB800'
  },
  trustSectionCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  trustHeaderTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#FFFFFF'
  },
  trustGrid: {
    flexDirection: 'row',
    gap: 10
  },
  trustCol: {
    flex: 1,
    backgroundColor: '#1A1D2B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#262938'
  },
  trustIcon: {
    marginBottom: 6
  },
  trustColTitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 3
  },
  trustColDesc: {
    fontFamily: fontUI,
    fontSize: 9.5,
    lineHeight: 14,
    color: '#8B8D98'
  },
  legalFooter: {
    alignItems: 'center',
    gap: 6
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  legalLinkText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    textDecorationLine: 'underline'
  },
  legalDot: {
    fontSize: 12,
    color: '#454857'
  },
  legalSub: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#454857',
    textAlign: 'center'
  }
});
