import React, { useState } from 'react';
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
import { ThemeToggle } from '../src/components/ThemeToggle';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  Compass,
  ShieldCheck,
  BrainCircuit,
  Lock,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  User,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Zap
} from 'lucide-react-native';

const VALUE_PILLARS = [
  {
    id: 'privacy',
    title: 'Private Shield',
    tagline: 'Zero peer pressure',
    desc: 'Your real budget & available dates remain 100% private. Friends only see the resulting overlap.',
    icon: ShieldCheck
  },
  {
    id: 'ai',
    title: 'AI Consensus',
    tagline: 'Deterministic scoring',
    desc: 'Algorithms instantly score hundreds of dates & budgets to pinpoint the exact compromise where everyone wins.',
    icon: BrainCircuit
  },
  {
    id: 'voting',
    title: 'Silent Voting',
    tagline: 'No group chat debates',
    desc: 'Approve destinations privately. The organizer only sees total aggregate counts, never individual votes.',
    icon: Lock
  },
  {
    id: 'brief',
    title: '1-Tap WhatsApp Brief',
    tagline: 'Instant alignment',
    desc: 'Generate a confirmed itinerary summary with calendar .ics download ready to share with friends.',
    icon: FileCheck2
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
    groups = []
  } = useGatherlyStore();

  const [isSignUp, setIsSignUp] = useState(true);
  const [activePillar, setActivePillar] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const theme = isDarkMode ? colors.dark : colors.light;

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
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
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoPersona = (userId: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    loginAsPersona(userId);
    router.replace('/');
  };

  const handleInstantGuest = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    loginAsPersona('user-maya-001');
    router.replace('/');
  };

  const ActiveIcon = VALUE_PILLARS[activePillar].icon;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

            <ThemeToggle />
          </View>

          {/* Hero Welcome Banner */}
          <View
            style={[
              styles.heroBanner,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.md
            ]}
          >
            <View style={[styles.heroLogoCircle, { backgroundColor: theme.primary }, shadows.glowPrimary]}>
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

          {/* Interactive 4-Pillar Value Showcase */}
          <View style={styles.pillarsContainer}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Why Groups Plan on PACT
            </Text>

            {/* Pillar Selector Tabs */}
            <View style={styles.pillarTabsRow}>
              {VALUE_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isSelected = idx === activePillar;
                return (
                  <TouchableOpacity
                    key={pillar.id}
                    onPress={() => {
                      triggerHaptic();
                      setActivePillar(idx);
                    }}
                    style={[
                      styles.pillarTabChip,
                      isSelected
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { backgroundColor: theme.surface, borderColor: theme.border }
                    ]}
                  >
                    <Icon size={14} color={isSelected ? '#FFFFFF' : theme.textSecondary} />
                    <Text
                      style={[
                        styles.pillarTabChipText,
                        { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                      ]}
                    >
                      {pillar.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Active Pillar Card */}
            <View
              style={[
                styles.pillarCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                shadows.sm
              ]}
            >
              <View style={styles.pillarCardHeader}>
                <View style={[styles.pillarIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
                  <ActiveIcon size={20} color={theme.primary} />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                    {VALUE_PILLARS[activePillar].title}
                  </Text>
                  <Text style={[styles.pillarTagline, { color: theme.primary }]}>
                    {VALUE_PILLARS[activePillar].tagline}
                  </Text>
                </View>
              </View>
              <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                {VALUE_PILLARS[activePillar].desc}
              </Text>
            </View>
          </View>

          {/* Authentication Card */}
          <View
            style={[
              styles.authCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.md
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
                  { backgroundColor: isDarkMode ? '#2D1515' : '#FEE2E2', borderColor: '#F87171' }
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
                  YOUR FULL NAME
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
                EMAIL ADDRESS
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
                PASSWORD
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

          {/* Quick Demo Personas (Development & Testing) */}
          <View
            style={[
              styles.demoCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
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
                  <View style={[styles.avatarCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    maxWidth: 560,
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
    marginBottom: 14
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
    color: '#FFFFFF',
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
  }
});