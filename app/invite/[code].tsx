import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { lookupGroupByInviteCode, GroupPreview } from '../../src/lib/supabase/service';
import { supabase } from '../../src/lib/supabase/client';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  Compass,
  Users,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserPlus
} from 'lucide-react-native';

type InviteStatus =
  | 'loading'
  | 'preview'
  | 'joining'
  | 'already_member'
  | 'group_full'
  | 'invalid_code'
  | 'group_cancelled'
  | 'auth_required'
  | 'error';

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    currentUserId,
    joinGroupByCode,
    setActiveGroup,
    setPendingInviteCode
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const inviteCode = String(code || '').toUpperCase();

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [groupPreview, setGroupPreview] = useState<GroupPreview | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkAuthAndLoadPreview();
  }, [inviteCode]);

  const checkAuthAndLoadPreview = async () => {
    if (!inviteCode || inviteCode.length < 4) {
      setStatus('invalid_code');
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      if (setPendingInviteCode) setPendingInviteCode(inviteCode);
      setStatus('auth_required');
      return;
    }

    try {
      const preview = await lookupGroupByInviteCode(inviteCode);
      if (!preview) {
        setStatus('invalid_code');
        return;
      }

      if (preview.status === 'cancelled') {
        setStatus('group_cancelled');
        setGroupPreview(preview);
        return;
      }

      if (preview.member_count >= 10) {
        setStatus('group_full');
        setGroupPreview(preview);
        return;
      }

      setGroupPreview(preview);
      setStatus('preview');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to load group info.');
      setStatus('error');
    }
  };

  const handleJoin = async () => {
    if (!groupPreview) return;
    setStatus('joining');

    try {
      const result = await joinGroupByCode(inviteCode);
      if (result.success) {
        if (result.group) setActiveGroup(result.group.id);
        router.replace(('/groups/' + (result.group?.id || groupPreview.id) + '/preferences') as any);
      } else {
        if (result.message.includes('ALREADY_MEMBER') || result.message.includes('already')) {
          setStatus('already_member');
        } else if (result.message.includes('GROUP_FULL') || result.message.includes('full')) {
          setStatus('group_full');
        } else {
          setErrorMsg(result.message);
          setStatus('error');
        }
      }
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg === 'ALREADY_MEMBER') {
        setStatus('already_member');
      } else if (msg === 'GROUP_FULL') {
        setStatus('group_full');
      } else if (msg === 'INVALID_CODE') {
        setStatus('invalid_code');
      } else {
        setErrorMsg(msg || 'Failed to join group.');
        setStatus('error');
      }
    }
  };

  const handleGoToAuth = () => {
    if (setPendingInviteCode) setPendingInviteCode(inviteCode);
    router.push(('/auth?redirect=invite&code=' + inviteCode) as any);
  };

  const handleGoToGroup = () => {
    if (groupPreview) {
      setActiveGroup(groupPreview.id);
      router.replace(('/groups/' + groupPreview.id) as any);
    } else {
      router.replace('/groups');
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
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
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

        {/* Loading State */}
        {status === 'loading' && (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Looking up invite code {inviteCode}...
            </Text>
          </View>
        )}

        {/* Auth Required State */}
        {status === 'auth_required' && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
              <UserPlus size={36} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Sign In to Join
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Create a free account or sign in to submit your private trip preferences.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleGoToAuth}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
            >
              <Text style={styles.primaryBtnText}>Sign In / Create Account</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Invalid Code State */}
        {status === 'invalid_code' && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <XCircle size={36} color="#EF4444" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Invalid Invite Code
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Code "{inviteCode}" was not found or has expired. Double check with the trip organizer.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace('/invite')}
              style={[styles.secondaryBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Enter Different Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Already Member State */}
        {status === 'already_member' && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <CheckCircle2 size={36} color="#22C55E" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              You're Already in this Circle!
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              You have already joined "{groupPreview?.name || 'this trip circle'}".
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleGoToGroup}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.primaryBtnText}>Open Trip Circle</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Group Full State */}
        {status === 'group_full' && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <AlertCircle size={36} color="#F59E0B" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              This Circle is Full
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              "{groupPreview?.name}" has reached the maximum of 10 members.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace('/groups')}
              style={[styles.secondaryBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Go to My Spaces</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancelled State */}
        {status === 'group_cancelled' && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <XCircle size={36} color="#EF4444" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Trip Cancelled
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              This trip circle has been cancelled by the organizer.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace('/groups')}
              style={[styles.secondaryBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Go to My Spaces</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error State */}
        {status === 'error' && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <AlertCircle size={36} color="#EF4444" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Something Went Wrong
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {errorMsg || 'An unexpected error occurred. Please try again.'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={checkAuthAndLoadPreview}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.primaryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Normal Preview & Join State */}
        {status === 'preview' && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }, shadows.glowPrimary]}>
              <Compass size={36} color="#FFFFFF" />
            </View>

            <Text style={[styles.title, { color: theme.textPrimary }]}>
              You're Invited to a PACT Circle!
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
                  {groupPreview?.member_count || 1} / 10 Confirmed Members
                </Text>
              </View>
              {Boolean(groupPreview?.organizer_name) && (
                <Text style={[styles.organizerText, { color: theme.textSecondary }]}>
                  Organized by {groupPreview?.organizer_name}
                </Text>
              )}
            </View>

            <View style={[styles.privacyBox, { backgroundColor: isDarkMode ? '#151D2A' : '#FFFFFF', borderColor: theme.border }]}>
              <ShieldCheck size={16} color={theme.success} />
              <Text style={[styles.privacyBoxText, { color: theme.textSecondary }]}>
                Your individual dates and budget are 100% private. Only the aggregate consensus is shared.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleJoin}
              disabled={status === 'joining'}
              style={[styles.joinBtn, { backgroundColor: theme.primary, opacity: status === 'joining' ? 0.7 : 1 }, shadows.glowPrimary]}
            >
              {status === 'joining' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.joinBtnText}>Join Circle & Submit Constraints</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
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
    paddingBottom: 140,
    maxWidth: 540,
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
  centerCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: { fontSize: 14, marginTop: 14 },
  card: {
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
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
    marginBottom: 18,
    lineHeight: 18
  },
  previewInnerBox: {
    width: '100%',
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 14
  },
  codeBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  groupName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6
  },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  metaText: { fontSize: 12 },
  organizerText: { fontSize: 12 },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%'
  },
  privacyBoxText: { fontSize: 11, lineHeight: 15, flex: 1 },
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.btn,
    width: '100%',
    marginTop: 6
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.btn,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 6
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '700' },
  switchAccountBtn: { paddingVertical: 8 },
  switchAccountText: { fontSize: 11, fontWeight: '600' }
});