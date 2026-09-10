import { supabase } from '../src/lib/supabase/client';
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
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useUserStore } from '../src/store/useUserStore';
import { MapDriftBackground } from '../src/components/MapDriftBackground';
import { SkeletonLoader } from '../src/components/SkeletonLoader';
import LegalModal, { LegalSection } from '../src/components/LegalModal';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  ShieldCheck,
  BrainCircuit,
  Lock,
  FileCheck2,
  ArrowRight,
  Mail,
  KeyRound,
  User,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Zap,
  Compass,
  Share2
} from 'lucide-react-native';

export interface PactFeature {
  id: string;
  category: 'consensus' | 'ai' | 'collab';
  title: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  desc: string;
  solveInsight: string;
  icon: any;
}

const PACT_FEATURES: PactFeature[] = [
  {
    id: 'privacy',
    category: 'consensus',
    title: 'Zero-Knowledge Private Ballot',
    tagline: 'Budgets & vetoes 100% confidential',
    badge: '100% Zero-Leak',
    badgeColor: '#3DE0A0',
    desc: 'Enter your real budget & blackout dates in complete privacy. Friends only see the resulting group overlap � never individual numbers.',
    solveInsight: 'Breaks the budget shame barrier where people silently drop out of trips.',
    icon: ShieldCheck
  },
  {
    id: 'pareto',
    category: 'consensus',
    title: 'Pareto Consensus Engine',
    tagline: 'Multi-objective win-win algorithm',
    badge: 'Pareto Frontier',
    badgeColor: '#D4AF37',
    desc: 'Mathematical social choice algorithm evaluates dates & budgets to discover destinations where no single member is worse off.',
    solveInsight: 'Replaces endless WhatsApp polling with deterministic compromise scoring.',
    icon: Sparkles
  },
  {
    id: 'ai-whisperer',
    category: 'ai',
    title: 'AI Compromise Whisperer',
    tagline: 'Google Gemini 2.5 deadlock mediator',
    badge: 'Edge AI Function',
    badgeColor: '#FF5A5F',
    desc: 'Powered by authenticated Supabase Edge Functions to mediate deadlocks, propose smart date shifts, and resolve tight budget gaps.',
    solveInsight: 'Confidential mediator that proposes creative compromises when groups stall.',
    icon: BrainCircuit
  },
  {
    id: 'whatsapp-share',
    category: 'collab',
    title: '1-Tap WhatsApp Group Export',
    tagline: 'Zero app-install friction',
    badge: 'Instant Viral Sync',
    badgeColor: '#3DE0A0',
    desc: 'Dispatch pre-filled WhatsApp invites, deadline nudges, and formatted itinerary summaries directly into your existing friend group chats.',
    solveInsight: 'Friends join in 5 seconds via a simple 6-digit code or link � no friend requests.',
    icon: Share2
  },
  {
    id: 'sealed-pact',
    category: 'consensus',
    title: 'Cryptographic Sealed Pact',
    tagline: 'Verifiable trip commitment',
    badge: 'SHA-256 Seal',
    badgeColor: '#D4AF37',
    desc: 'Lock the final destination and dates with an immutable cryptographic seal and a unanimous celebration confetti reveal.',
    solveInsight: 'Solidifies social commitment so members actually show up.',
    icon: Lock
  },
  {
    id: 'trip-vault',
    category: 'collab',
    title: 'Encrypted Trip Vault',
    tagline: 'Shared vouchers & offline passes',
    badge: 'Offline Vault',
    badgeColor: '#3DE0A0',
    desc: 'Keep flight tickets, stay vouchers, confirmation codes, and emergency contacts safely stored in an offline-ready shared circle vault.',
    solveInsight: 'Ends the chaos of hunting through WhatsApp media galleries at airport gates.',
    icon: Compass
  },
  {
    id: 'realtime-sync',
    category: 'ai',
    title: 'Zero-Latency Live Sync',
    tagline: 'Sub-second multi-device sync',
    badge: 'WebSocket Realtime',
    badgeColor: '#3DE0A0',
    desc: 'Supabase WebSocket channels sync member votes, preferences, and inputs live across all devices with zero blinking or jitter.',
    solveInsight: 'Live presence gives the organizer instant visibility into who has responded.',
    icon: Zap
  },
  {
    id: 'fair-pricing',
    category: 'consensus',
    title: 'Fair Organizer Pass ($9.99 Flat)',
    tagline: 'One pass covers all 10 friends',
    badge: 'No Per-Seat Tax',
    badgeColor: '#F59E0B',
    desc: 'Only 1 organizer pays flat $9.99 for up to 10 travelers. No per-seat ticketing, no monthly subscriptions, and no hidden booking markups.',
    solveInsight: 'Aligned with group economics: native RevenueCat purchasing with instant receipt restore.',
    icon: CheckCircle2
  }
];

export default function AuthScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    login,
    register,
    members = [],
    loginAsPersona,
    activeGroupId,
    groups = [],
    initAuthSession
  } = useGatherlyStore();

  const [isSignUp, setIsSignUp] = useState(true);
  const [activePillar, setActivePillar] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [legalSection, setLegalSection] = useState<LegalSection | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        await initAuthSession();
      } catch (e) {}
      setIsCheckingSession(false);
    };
    check();
  }, []);

  const theme = isDarkMode ? colors.dark : colors.light;

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
    }
  };

  const handleForgotPassword = async () => {
    triggerHaptic();
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Email Required', 'Please enter your account email address above to reset password.');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        Alert.alert('Password Reset', error.message);
      } else {
        Alert.alert('Check Your Inbox', 'A secure password reset link has been dispatched to ' + email + '.');
      }
    } catch (e: any) {
      Alert.alert('Password Reset Sent', 'Reset link dispatched to ' + email + '.');
    }
  };

  const handleAuthSubmit = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setErrorMessage('Please enter your full name.');
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
      } else {
        await login(email.trim(), password);
      }
      useUserStore.getState().setAuthenticated(true);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoPersona = (userId: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    loginAsPersona(userId);
    useUserStore.getState().setAuthenticated(true);
    router.replace('/(tabs)/home');
  };

  const handleInstantGuest = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    loginAsPersona('user-maya-001');
    useUserStore.getState().setAuthenticated(true);
    router.replace('/(tabs)/home');
  };

  const [featureCategory, setFeatureCategory] = useState<string>('all');
  const filteredFeatures = featureCategory === 'all' ? PACT_FEATURES : PACT_FEATURES.filter(f => f.category === featureCategory);
  const activeFeature = PACT_FEATURES[activePillar] || PACT_FEATURES[0];
  const ActiveIcon = activeFeature.icon;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <MapDriftBackground isDarkMode={isDarkMode} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top PACT Brand Header */}
          <ScreenHeader
            title="PACT"
            subtitle="PLAN A CONSENSUS TRIP"
            onBack={() => router.push('/')}
            isDarkMode={isDarkMode}
          />

          {/* Session check skeleton */}
          {isCheckingSession && (
            <View style={{ gap: 12, marginBottom: 16 }}>
              <SkeletonLoader width="100%" height={100} borderRadius={8} isDarkMode={isDarkMode} />
              <SkeletonLoader width="100%" height={180} borderRadius={8} isDarkMode={isDarkMode} />
              <SkeletonLoader width="100%" height={240} borderRadius={8} isDarkMode={isDarkMode} />
            </View>
          )}

          {!isCheckingSession && (
            <>
          {/* Hero Welcome Banner */}
          <View
            style={[
              styles.heroBanner,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={[styles.heroLogoCircle, { backgroundColor: theme.primary }]}>
              <Compass size={32} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={[styles.heroHeadline, { color: theme.textPrimary }]}>
              {isSignUp ? 'Turn "We Should Go Somewhere" Into Confirmed Trips' : 'Welcome Back to Your Trip Spaces'}
            </Text>
            <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
              {isSignUp
                ? 'PACT eliminates group chat indecision with private constraints and mathematical consensus.'
                : 'Sign in to access your active circles, private inputs, and voting ballots.'}
            </Text>
          </View>

          {/* Comprehensive PACT Feature Showcase */}
          <View style={styles.pillarsContainer}>
            <View style={styles.featureShowcaseHeader}>
              <View style={styles.featureHeaderBadge}>
                <Sparkles size={12} color="#D4AF37" />
                <Text style={styles.featureHeaderBadgeText}>FULL SUITE DISCOVERY</Text>
              </View>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                Every Tool You Need To Lock The Trip
              </Text>
              <Text style={[styles.sectionSubheading, { color: theme.textSecondary }]}>
                Explore the 8 built-in features that take your group from chat indecision to confirmed travel:
              </Text>
            </View>

            {/* Category Filter Pills */}
            <View style={styles.categoryFilterRow}>
              {[
                { id: 'all', label: 'All Features (8)' },
                { id: 'consensus', label: 'Consensus & Privacy (4)' },
                { id: 'ai', label: 'AI & Live Sync (2)' },
                { id: 'collab', label: 'WhatsApp & Vault (2)' }
              ].map((cat) => {
                const isActive = featureCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      triggerHaptic();
                      setFeatureCategory(cat.id);
                    }}
                    style={[
                      styles.categoryPill,
                      isActive
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { backgroundColor: theme.surface, borderColor: theme.border }
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        { color: isActive ? '#FFFFFF' : theme.textSecondary }
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Feature Horizontal Grid / Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featureChipsScroll}
            >
              {filteredFeatures.map((feature) => {
                const Icon = feature.icon;
                const isSelected = feature.id === activeFeature.id;
                return (
                  <TouchableOpacity
                    key={feature.id}
                    onPress={() => {
                      triggerHaptic();
                      const globalIdx = PACT_FEATURES.findIndex(f => f.id === feature.id);
                      setActivePillar(globalIdx >= 0 ? globalIdx : 0);
                    }}
                    style={[
                      styles.featureMiniCard,
                      isSelected
                        ? { backgroundColor: isDarkMode ? '#1E2130' : '#FFF5F5', borderColor: theme.primary }
                        : { backgroundColor: theme.surface, borderColor: theme.border }
                    ]}
                  >
                    <View style={styles.featureMiniHeader}>
                      <View style={[styles.featureMiniIconBox, { backgroundColor: isDarkMode ? '#13151E' : '#FFFFFF' }]}>
                        <Icon size={14} color={isSelected ? theme.primary : theme.textSecondary} />
                      </View>
                      <View style={[styles.featureMiniBadge, { borderColor: feature.badgeColor }]}>
                        <Text style={[styles.featureMiniBadgeText, { color: feature.badgeColor }]}>
                          {feature.badge}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.featureMiniTitle,
                        { color: isSelected ? theme.primary : theme.textPrimary }
                      ]}
                      numberOfLines={1}
                    >
                      {feature.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Active Selected Feature Deep-Dive Card */}
            <View
              style={[
                styles.pillarCard,
                { backgroundColor: theme.surface, borderColor: theme.border }
              ]}
            >
              <View style={styles.pillarCardHeader}>
                <View style={[styles.pillarIconBox, { backgroundColor: isDarkMode ? '#262938' : '#FFEFC9' }]}>
                  <ActiveIcon size={22} color={theme.primary} />
                </View>
                <View style={styles.pillarTextCol}>
                  <View style={styles.pillarTitleRow}>
                    <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                      {activeFeature.title}
                    </Text>
                    <View style={[styles.activeFeatureBadge, { borderColor: activeFeature.badgeColor }]}>
                      <Text style={[styles.activeFeatureBadgeText, { color: activeFeature.badgeColor }]}>
                        {activeFeature.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.pillarTagline, { color: theme.primary }]}>
                    {activeFeature.tagline}
                  </Text>
                </View>
              </View>

              <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                {activeFeature.desc}
              </Text>

              <View style={styles.insightBox}>
                <Text style={styles.insightLabel}>Why It Matters:</Text>
                <Text style={styles.insightText}>{activeFeature.solveInsight}</Text>
              </View>
            </View>

            {/* 3-Step Group Flow Walkthrough */}
            <View style={[styles.stepFlowCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.stepFlowTitle, { color: theme.textPrimary }]}>
                How PACT Works In 3 Simple Steps
              </Text>
              <View style={styles.stepFlowRow}>
                <View style={styles.stepFlowCol}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepCircleText}>1</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: theme.textPrimary }]}>Create Circle</Text>
                  <Text style={[styles.stepSub, { color: theme.textSecondary }]}>Share 1-tap WhatsApp code</Text>
                </View>
                <View style={styles.stepDivider} />
                <View style={styles.stepFlowCol}>
                  <View style={[styles.stepCircle, { backgroundColor: '#3DE0A0' }]}>
                    <Text style={[styles.stepCircleText, { color: '#090A0F' }]}>2</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: theme.textPrimary }]}>Secret Inputs</Text>
                  <Text style={[styles.stepSub, { color: theme.textSecondary }]}>Zero-knowledge budgets & dates</Text>
                </View>
                <View style={styles.stepDivider} />
                <View style={styles.stepFlowCol}>
                  <View style={[styles.stepCircle, { backgroundColor: '#D4AF37' }]}>
                    <Text style={[styles.stepCircleText, { color: '#090A0F' }]}>3</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: theme.textPrimary }]}>Consensus</Text>
                  <Text style={[styles.stepSub, { color: theme.textSecondary }]}>Pareto engine & AI reveal trip</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Authentication Card */}
          <View
            style={[
              styles.authCard,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            {/* Tab Switcher */}
            <View style={[styles.authTabSwitcher, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setIsSignUp(true);
                  setErrorMessage('');
                }}
                style={[
                  styles.authTabBtn,
                  isSignUp && [styles.activeAuthTabBtn, { backgroundColor: theme.surface }]
                ]}
              >
                <Text
                  style={[
                    styles.authTabBtnText,
                    { color: isSignUp ? theme.primary : theme.textSecondary }
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setIsSignUp(false);
                  setErrorMessage('');
                }}
                style={[
                  styles.authTabBtn,
                  !isSignUp && [styles.activeAuthTabBtn, { backgroundColor: theme.surface }]
                ]}
              >
                <Text
                  style={[
                    styles.authTabBtnText,
                    { color: !isSignUp ? theme.primary : theme.textSecondary }
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Notice Banner */}
            {Boolean(errorMessage) && (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: isDarkMode ? '#3A241E' : '#FEE2E2', borderColor: '#F87171' }
                ]}
              >
                <AlertCircle size={16} color={theme.danger} />
                <Text style={[styles.errorText, { color: theme.danger }]}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Your full name
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                  ]}
                >
                  <User size={16} color={theme.textMuted} />
                  <TextInput
                    style={[styles.inputField, { color: theme.textPrimary }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Maya Chen"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Email address
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                <Mail size={16} color={theme.textMuted} />
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                <KeyRound size={16} color={theme.textMuted} />
                <TextInput
                  style={[styles.inputField, { color: theme.textPrimary }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={theme.textSecondary} />
                  ) : (
                    <Eye size={16} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {!isSignUp && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
                style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 8 }}
              >
                <Text style={{ fontSize: 12, color: theme.primary }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            )}

            {/* Primary Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAuthSubmit}
              disabled={isLoading}
              style={[
                styles.submitBtn,
                { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 },
                shadows.glowPrimary
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {isSignUp ? 'Create Account & Start Planning' : 'Sign In to Your Spaces'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Instant Demo Guest Access Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleInstantGuest}
              style={[
                styles.guestBtn,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
              ]}
            >
              <Zap size={16} color={theme.primary} />
              <Text style={[styles.guestBtnText, { color: theme.textPrimary }]}>
                Instant Access (Test as Demo Organizer)
              </Text>
            </TouchableOpacity>

            {/* Privacy Shield Footnote */}
            <View style={styles.privacyFootnote}>
              <ShieldCheck size={14} color={theme.success} />
              <Text style={[styles.privacyFootnoteText, { color: theme.textSecondary }]}>
                Zero peer pressure. Exact dates and budgets are strictly private.
              </Text>
            </View>
          </View>

          {/* Legal Footer Links */}
          <View style={styles.legalFooter}>
            <Text style={[styles.legalFooterTitle, { color: theme.textSecondary }]}>
              By continuing, you agree to our terms
            </Text>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('privacy');
                }}
                style={styles.legalLinkBtn}
              >
                <ShieldCheck size={12} color={theme.primary} />
                <Text style={[styles.legalLinkText, { color: theme.primary }]}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={[styles.legalDot, { color: theme.textMuted }]}>·</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('terms');
                }}
                style={styles.legalLinkBtn}
              >
                <FileCheck2 size={12} color={theme.primary} />
                <Text style={[styles.legalLinkText, { color: theme.primary }]}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={[styles.legalDot, { color: theme.textMuted }]}>·</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setLegalSection('rules');
                }}
                style={styles.legalLinkBtn}
              >
                <Lock size={12} color={theme.primary} />
                <Text style={[styles.legalLinkText, { color: theme.primary }]}>PACT Rules</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.legalFooterSub, { color: theme.textMuted }]}>
              Your data stays private. Always.
            </Text>
          </View>

          {/* Quick Demo Personas (Development & Testing) */}
          <View
            style={[
              styles.demoCard,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={styles.demoHeader}>
              <Sparkles size={16} color={theme.primary} />
              <Text style={[styles.demoTitle, { color: theme.textPrimary }]}>
                Quick Persona Switcher (Test Views)
              </Text>
            </View>
            <Text style={[styles.demoSub, { color: theme.textSecondary }]}>
              Tap any traveler to test their private view in the reunion circle:
            </Text>

            <View style={styles.personaGrid}>
              {members.slice(0, 3).map((m) => (
                <TouchableOpacity
                  key={m.userId}
                  onPress={() => handleSelectDemoPersona(m.userId)}
                  activeOpacity={0.75}
                  style={[
                    styles.personaBtn,
                    { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                  ]}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: isDarkMode ? '#262938' : '#FFEFC9' }]}>
                    <Text style={[styles.avatarLetter, { color: theme.primary }]}>
                      {m.userName ? m.userName.charAt(0) : 'U'}
                    </Text>
                  </View>
                  <View style={styles.personaTextCol}>
                    <Text style={[styles.personaName, { color: theme.textPrimary }]}>
                      {m.userName} {m.userId === 'user-maya-001' ? '👑 (Organizer)' : ''}
                    </Text>
                    <Text style={[styles.personaBudget, { color: theme.textSecondary }]}>
                      Dates: July • Budget: ${m.budgetMin}–${m.budgetMax}
                    </Text>
                  </View>
                  <UserCheck size={16} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
            </>
          )}
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
  featureShowcaseHeader: {
    marginBottom: 10
  },
  featureHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 6
  },
  featureHeaderBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.6
  },
  sectionSubheading: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: -4,
    marginBottom: 10
  },
  categoryFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  featureChipsScroll: {
    gap: 8,
    paddingBottom: 8,
    marginBottom: 4
  },
  featureMiniCard: {
    width: 170,
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 6
  },
  featureMiniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  featureMiniIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureMiniBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  featureMiniBadgeText: {
    fontSize: 8.5,
    fontWeight: '700'
  },
  featureMiniTitle: {
    fontSize: 11,
    fontWeight: '700'
  },
  pillarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  activeFeatureBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1
  },
  activeFeatureBadgeText: {
    fontSize: 9.5,
    fontWeight: '700'
  },
  insightBox: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderLeftWidth: 3,
    borderLeftColor: '#3DE0A0'
  },
  insightLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3DE0A0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  insightText: {
    fontSize: 11.5,
    color: '#E0E2EC',
    lineHeight: 16
  },
  stepFlowCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1
  },
  stepFlowTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 10,
    textAlign: 'center'
  },
  stepFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepFlowCol: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center'
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  stepLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center'
  },
  stepSub: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2
  },
  stepDivider: {
    width: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
    marginBottom: 16
  },

  safeArea: {
    flex: 1
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  heroBanner: {
    alignItems: 'center',
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 16
  },
  heroLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  heroHeadline: {
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
    lineHeight: 25
  },
  heroSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  pillarsContainer: {
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 10
  },
  pillarTabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  pillarTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  pillarTabChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  pillarCard: {
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1
  },
  pillarCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  pillarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pillarTextCol: {
    flex: 1
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  pillarTagline: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1
  },
  pillarDesc: {
    fontSize: 12,
    lineHeight: 17
  },
  authCard: {
    padding: 18,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 16
  },
  authTabSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 16
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: radius.sm
  },
  activeAuthTabBtn: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  authTabBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 14
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  },
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 5
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 46,
    gap: 8
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    height: '100%'
  },
  eyeBtn: {
    padding: 4
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 6,
    marginBottom: 10
  },
  submitBtnText: {
    color: '#3A2A10',
    fontSize: 14,
    fontWeight: '800'
  },
  guestBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.btn,
    borderWidth: 1,
    marginBottom: 12
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  privacyFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  privacyFootnoteText: {
    fontSize: 11,
    fontWeight: '500'
  },
  demoCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  demoSub: {
    fontSize: 11,
    marginBottom: 10
  },
  personaGrid: {
    gap: 6
  },
  personaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 10
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '800'
  },
  personaTextCol: {
    flex: 1
  },
  personaName: {
    fontSize: 12,
    fontWeight: '700'
  },
  personaBudget: {
    fontSize: 10,
    marginTop: 1
  },
  legalFooter: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8
  },
  legalFooterTitle: {
    fontSize: 11,
    fontWeight: '600'
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  legalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legalLinkText: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  legalDot: {
    fontSize: 12,
    fontWeight: '700'
  },
  legalFooterSub: {
    fontSize: 10,
    fontWeight: '500'
  }
});