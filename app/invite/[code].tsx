import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { colors, radius, shadows, spacing } from '../../src/theme/colors';
import {
  Compass,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  X
} from 'lucide-react-native';

export default function InviteCodeScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    currentUserId = 'user-maya-001',
    userEmail,
    groups = [],
    joinGroupByCode
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const inviteCode = (code || '').toUpperCase();

  const [status, setStatus] = useState<'loading' | 'preview' | 'joining' | 'joined' | 'error' | 'already_member'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [groupPreview, setGroupPreview] = useState<{
    id: string;
    name: string;
    invite_code: string;
    member_count: number;
    organizer_name?: string;
  } | null>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!inviteCode) {
      setStatus('error');
      setErrorMsg('No invite code provided.');
      return;
    }

    checkAuthAndLoadPreview();
  }, [inviteCode]);

  const checkAuthAndLoadPreview = async () => {
    setStatus('loading');
    setErrorMsg('');

    // Check if user is already a member locally
    const localMatch = groups.find((g) => g?.inviteCode?.toUpperCase() === inviteCode);
    if (localMatch) {
      setGroupPreview({
        id: localMatch.id,
        name: localMatch.name,
        invite_code: localMatch.inviteCode,
        member_count: localMatch.totalMembersCount || 5,
        organizer_name: 'Maya'
      });
      setStatus('already_member');
      return;
    }

    // Load preview mock/supabase
    setTimeout(() => {
      if (inviteCode === 'GOA-2026' || inviteCode === 'PACT26' || inviteCode.length >= 4) {
        setGroupPreview({
          id: 'circle-college-reunion-2026',
          name: inviteCode === 'GOA-2026' ? 'College Reunion Trip' : 'Goa Reunion 2026',
          invite_code: inviteCode,
          member_count: 5,
          organizer_name: 'Maya'
        });
        setStatus('preview');
      } else {
        setStatus('error');
        setErrorMsg('Invalid or expired invite code. Please check with your group organizer.');
      }
    }, 400);
  };

  const handleJoin = async () => {
    triggerHaptic();
    setStatus('joining');

    try {
      const res = await joinGroupByCode(inviteCode);
      if (res.success && res.group) {
        setStatus('joined');
        setTimeout(() => {
          router.replace(`/groups/${res.group.id}`);
        }, 1200);
      } else {
        setStatus('error');
        setErrorMsg(res.message || 'Failed to join group circle.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Network error while joining.');
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
            onPress={() => router.push('/groups')}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
            accessibilityLabel="Back to Circles"
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

        {/* Loading State */}
        {status === 'loading' && (
          <View style={[styles.documentCard, styles.centerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Verifying invite code...
            </Text>
          </View>
        )}

        {/* Already a Member State */}
        {status === 'already_member' && (
          <View style={[styles.documentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.successLight }]}>
              <CheckCircle2 size={32} color={theme.success} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              You're Already in this Circle!
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              "{groupPreview?.name}" is already active in your PACT dashboard.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.replace(`/groups/${groupPreview?.id}` as any)}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.primaryBtnText}>Open Trip Circle</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Joined Success State */}
        {status === 'joined' && (
          <View style={[styles.documentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.successLight }]}>
              <CheckCircle2 size={32} color={theme.success} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Joined Successfully!
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              You are now part of "{groupPreview?.name}". Redirecting to private constraints...
            </Text>
          </View>
        )}

        {/* Error State */}
        {status === 'error' && (
          <View style={[styles.documentCard, { backgroundColor: theme.surface, borderColor: theme.danger }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.dangerLight }]}>
              <AlertCircle size={32} color={theme.danger} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Invalid or Expired Invite
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {errorMsg || 'This invite code could not be verified. Please check the code with your organizer.'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.replace('/invite')}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.primaryBtnText}>Try Another Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Normal Preview & Join State (Document Motif) */}
        {status === 'preview' && (
          <View style={[styles.documentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primaryLight }]}>
              <Compass size={30} color={theme.primary} />
            </View>

            <Text style={[styles.title, { color: theme.textPrimary }]}>
              You're Invited to a Trip Circle!
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Join privately to share your available dates and budget with zero peer pressure.
            </Text>

            <View style={[styles.previewInnerBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Text style={[styles.codeBadge, { color: theme.primary }]}>
                INVITE CODE: {inviteCode}
              </Text>
              <Text style={[styles.groupName, { color: theme.textPrimary }]}>
                {groupPreview?.name || 'Trip Circle'}
              </Text>
              <View style={styles.groupMetaRow}>
                <Users size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {groupPreview?.member_count || 5} Confirmed Travelers
                </Text>
              </View>
              {Boolean(groupPreview?.organizer_name) && (
                <Text style={[styles.organizerText, { color: theme.textSecondary }]}>
                  Organized by {groupPreview?.organizer_name}
                </Text>
              )}
            </View>

            <View style={[styles.privacyBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <ShieldCheck size={16} color={theme.success} />
              <Text style={[styles.privacyBoxText, { color: theme.textSecondary }]}>
                Your individual dates and budget are strictly confidential. Only the consensus overlap is shared.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleJoin}
              disabled={status === 'joining'}
              style={[
                styles.joinBtn,
                { backgroundColor: theme.primary, opacity: status === 'joining' ? 0.7 : 1 }
              ]}
            >
              {status === 'joining' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.joinBtnText}>Join Circle & Submit Constraints</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/auth')}
              style={styles.switchAccountBtn}
            >
              <Text style={[styles.switchAccountText, { color: theme.textSecondary }]}>
                Not your account? Sign In / Switch Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130,
    maxWidth: 560,
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
  centerCard: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: { fontSize: 13.5, marginTop: 14 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  logoIcon: {
    width: 52,
    height: 52,
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
  previewInnerBox: {
    width: '100%',
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14
  },
  codeBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  groupName: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6
  },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  metaText: { fontSize: 12, fontWeight: '600' },
  organizerText: { fontSize: 11.5 },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%'
  },
  privacyBoxText: { fontSize: 11.5, lineHeight: 16, flex: 1 },
  joinBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    width: '100%',
    marginBottom: 10
  },
  joinBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: radius.btn,
    width: '100%',
    marginTop: 6
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  switchAccountBtn: { paddingVertical: 6 },
  switchAccountText: { fontSize: 11.5, fontWeight: '700' }
});