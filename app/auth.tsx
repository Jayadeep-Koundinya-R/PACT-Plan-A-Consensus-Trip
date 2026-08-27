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
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../src/theme/colors';
import { Compass, Sparkles, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const { isDarkMode, setCurrentUser, members } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('maya@gatherly.app');
  const [password, setPassword] = useState('password123');

  const handleLogin = () => {
    // Default to Maya (Organizer) on direct login or match member email
    setCurrentUser('user-maya-001');
    router.replace('/groups');
  };

  const handleSelectDemoPersona = (userId: string) => {
    setCurrentUser(userId);
    router.replace('/groups');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Brand Header */}
          <View style={styles.header}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }, shadows.md]}>
              <Compass size={36} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Gatherly</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Turn "we should go somewhere" into a real confirmed trip plan.
            </Text>
          </View>

          {/* Auth Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.md
            ]}
          >
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => setIsSignUp(false)}
                style={[
                  styles.tabBtn,
                  !isSignUp && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: !isSignUp ? theme.primary : theme.textSecondary }
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSignUp(true)}
                style={[
                  styles.tabBtn,
                  isSignUp && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isSignUp ? theme.primary : theme.textSecondary }
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

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
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.submitBtnText}>
                {isSignUp ? 'Get Started' : 'Sign In'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <ShieldCheck size={14} color={theme.success} />
              <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
                End-to-end private constraints & silent voting ballots.
              </Text>
            </View>
          </View>

          {/* Quick Demo Personas (One-tap Tester) */}
          <View
            style={[
              styles.demoCard,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
            ]}
          >
            <View style={styles.demoHeader}>
              <Sparkles size={16} color={theme.secondary} />
              <Text style={[styles.demoTitle, { color: theme.textPrimary }]}>
                Hackathon Demo: Switch Personas in 1-Tap
              </Text>
            </View>
            <Text style={[styles.demoSub, { color: theme.textSecondary }]}>
              Select a demo member to experience their private view:
            </Text>

            <View style={styles.personaGrid}>
              {members.map((m) => (
                <TouchableOpacity
                  key={m.userId}
                  onPress={() => handleSelectDemoPersona(m.userId)}
                  activeOpacity={0.7}
                  style={[
                    styles.personaBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    shadows.sm
                  ]}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.avatarLetter, { color: theme.primaryDark }]}>
                      {m.userName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.personaTextCol}>
                    <Text style={[styles.personaName, { color: theme.textPrimary }]}>
                      {m.userName} {m.userId === 'user-maya-001' ? '(Organizer)' : ''}
                    </Text>
                    <Text style={[styles.personaBudget, { color: theme.textSecondary }]}>
                      ${m.budgetMin}-${m.budgetMax} • [{m.tags.join(', ')}]
                    </Text>
                  </View>
                  <UserCheck size={16} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 20,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center'
  },
  header: {
    alignItems: 'center',
    marginVertical: 24
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20
  },
  card: {
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 15
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 8
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '500'
  },
  demoCard: {
    borderRadius: radius.card,
    padding: 18,
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
    fontSize: 12,
    marginBottom: 12
  },
  personaGrid: {
    gap: 8
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
    fontSize: 14,
    fontWeight: '800'
  },
  personaTextCol: {
    flex: 1
  },
  personaName: {
    fontSize: 13,
    fontWeight: '700'
  },
  personaBudget: {
    fontSize: 11,
    marginTop: 2
  }
});
