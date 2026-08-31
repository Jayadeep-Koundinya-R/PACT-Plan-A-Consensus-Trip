import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { signInUser, signUpUser } from '../src/lib/supabase/client';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  AlertCircle,
  BrainCircuit,
  Lock,
  FileCheck2,
  ChevronLeft
} from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string; code?: string }>();
  const { isDarkMode, setCurrentUser, members, setPendingInviteCode } = useGatherlyStore();

  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const theme = isDarkMode ? colors.dark : colors.light;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handleAuthSubmit = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    triggerHaptic();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { user } = await signUpUser(email.trim(), password.trim(), name.trim());
        if (user) {
          setCurrentUser(user.id, user.email || email, name.trim());
          handlePostAuthRedirect();
        }
      } else {
        const { user } = await signInUser(email.trim(), password.trim());
        if (user) {
          const displayName = user.user_metadata?.display_name || email.split('@')[0];
          setCurrentUser(user.id, user.email || email, displayName);
          handlePostAuthRedirect();
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostAuthRedirect = () => {
    if (params.redirect === 'invite' && params.code) {
      setPendingInviteCode(params.code);
      router.replace(`/invite/${params.code}`);
    } else {
      router.replace('/');
    }
  };

  const handleSelectDemoPersona = (userId: string) => {
    triggerHaptic();
    const persona = members.find((m) => m.userId === userId);
    if (persona) {
      setCurrentUser(persona.userId, `${persona.name.toLowerCase()}@pact.demo`, persona.name);
      handlePostAuthRedirect();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.topBorderLine, { backgroundColor: theme.primary }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.replace('/')}
              style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <ChevronLeft size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Hero Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.logoIcon,
                { backgroundColor: theme.primary },
                shadows.glowPrimary
              ]}
            >
              <Compass size={32} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              PACT
            </Text>
            <Text style={[styles.brandDefinition, { color: theme.primary }]}>
              Plan A Consensus Trip
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isSignUp ? 'Turn "we should go somewhere" into confirmed trips.' : 'Welcome back to your travel spaces.'}
            </Text>
          </View>

          {/* 4-Pillar Feature Showcase (Why PACT is Worth Using) */}
          <View style={styles.featuresGrid}>
            <View
              style={[
                styles.featureCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                shadows.sm
              ]}
            >
              <View style={[styles.featureIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
                <ShieldCheck size={18} color={theme.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  Private Constraint Shield
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                  Share your true budget & available dates privately with zero peer pressure.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                shadows.sm
              ]}
            >
              <View style={[styles.featureIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
                <BrainCircuit size={18} color={theme.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  AI Consensus Scoring
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                  Instantly calculates the exact compromise where everyone is included.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                shadows.sm
              ]}
            >
              <View style={[styles.featureIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
                <Lock size={18} color={theme.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  Silent Voting Ballots
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                  Vote without group chat blame or endless indecisive debates.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                shadows.sm
              ]}
            >
              <View style={[styles.featureIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
                <FileCheck2 size={18} color={theme.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  1-Tap Confirmed Brief
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                  Generates an exportable itinerary summary ready to share in WhatsApp.
                </Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.md
            ]}
          >
            {/* Tab Selector */}
            <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setIsSignUp(true);
                  setErrorMessage('');
                }}
                style={[
                  styles.tabBtn,
                  isSignUp && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isSignUp ? theme.primary : theme.textMuted }
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
                  styles.tabBtn,
                  !isSignUp && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: !isSignUp ? theme.primary : theme.textMuted }
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Banner */}
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
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Your Full Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      color: theme.textPrimary,
                      borderColor: theme.border
                    }
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Maya Chen"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAuthSubmit}
              disabled={isLoading}
              style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {isSignUp ? 'Create Account & Start' : 'Sign In'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <ShieldCheck size={14} color={theme.success} />
              <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
                End-to-end private constraints & silent voting ballots.
              </Text>
            </View>
          </View>

          {/* Quick Demo Personas (Only in __DEV__ mode) */}
          {__DEV__ && (
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
                  DEV Quick-Test Personas
                </Text>
              </View>
              <Text style={[styles.demoSub, { color: theme.textSecondary }]}>
                Select a member to test local views instantly:
              </Text>

              <View style={styles.personaGrid}>
                {members.slice(0, 3).map((m) => (
                  <TouchableOpacity
                    key={m.userId}
                    onPress={() => handleSelectDemoPersona(m.userId)}
                    activeOpacity={0.7}
                    style={[
                      styles.personaBtn,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                    ]}
                  >
                    <View style={[styles.avatarCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
                      <Text style={[styles.avatarLetter, { color: theme.primary }]}>
                        {m.name ? m.name.charAt(0) : 'U'}
                      </Text>
                    </View>
                    <View style={styles.personaTextCol}>
                      <Text style={[styles.personaName, { color: theme.textPrimary }]}>
                        {m.name} {m.userId === 'user-maya-001' ? '(Organizer)' : ''}
                      </Text>
                      <Text style={[styles.personaBudget, { color: theme.textSecondary }]}>
                        Budget: ${m.budgetMin}-${m.budgetMax}
                      </Text>
                    </View>
                    <UserCheck size={16} color={theme.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  topBorderLine: {
    height: 3,
    width: '100%'
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center'
  },
  topBar: {
    marginBottom: 8
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  brandDefinition: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 4,
    fontWeight: '900',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18
  },
  featuresGrid: {
    gap: 8,
    marginBottom: 20
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  featureTextCol: {
    flex: 1
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  featureDesc: {
    fontSize: 11,
    lineHeight: 15
  },
  card: {
    borderRadius: radius.card,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 18,
    borderBottomWidth: 1
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  tabText: {
    fontSize: 14,
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
  formGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    fontSize: 14
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 6
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '500'
  },
  demoCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1
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
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarLetter: {
    fontSize: 12,
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