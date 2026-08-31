import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { lookupGroupByInviteCode, GroupPreview } from '../../src/lib/supabase/service';
import { supabase } from '../../src/lib/supabase/client';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  Compass, Users, ArrowRight, ShieldCheck, AlertCircle,
  CheckCircle2, XCircle, UserPlus
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
    isDarkMode, currentUserId, joinGroupByCode, setActiveGroup, setPendingInviteCode
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

    // Check if user is authenticated
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      // Save invite code for after auth and redirect
      if (setPendingInviteCode) setPendingInviteCode(inviteCode);
      setStatus('auth_required');
      return;
    }

    // Fetch group preview from Supabase
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
        router.replace('/groups/' + (result.group?.id || groupPreview.id) + '/preferences');
      } else {
        // Parse specific error
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
    router.push('/auth?redirect=invite&code=' + inviteCode);
  };

  const handleGoToGroup = () => {
    if (groupPreview) {
      setActiveGroup(groupPreview.id);
      router.replace('/groups/' + groupPreview.id);
    } else {
      router.replace('/groups');
    }
  };

  // --- RENDER ---

  // Loading
  if (status === 'loading') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Looking up invite code...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Auth required
  if (status === 'auth_required') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
            <UserPlus size={36} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Sign In to Join
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Create an account or sign in to join this trip circle with code {inviteCode}.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoToAuth}
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.primaryBtnText}>Sign In / Sign Up</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Invalid code
  if (status === 'invalid_code') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <XCircle size={36} color="#EF4444" />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Invalid Invite Code
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            The code "{inviteCode}" doesn't match any active trip circle. Please check the code and try again.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/groups')}
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Go to My Groups</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Already a member
  if (status === 'already_member') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <CheckCircle2 size={36} color="#10B981" />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            You're Already a Member!
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            You're already in "{groupPreview?.name || 'this group'}". Head to the group to continue.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoToGroup}
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.primaryBtnText}>Go to Group</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Group full
  if (status === 'group_full') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <AlertCircle size={36} color="#F59E0B" />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            This Circle is Full
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            "{groupPreview?.name}" has reached the maximum of 10 members. Ask the organizer to create a new circle.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/groups')}
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Go to My Groups</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Group cancelled
  if (status === 'group_cancelled') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
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
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.textPrimary }]}>Go to My Groups</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Generic error
  if (status === 'error') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
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
            activeOpacity={0.8}
            onPress={checkAuthAndLoadPreview}
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.primaryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Preview & Join ---
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.centerContainer}>
        <View style={[styles.logoIcon, { backgroundColor: theme.primary }, shadows.md]}>
          <Compass size={40} color="#FFFFFF" />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          You're Invited to a PACT Trip Circle!
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Join privately to share your available dates and budget without peer pressure.
        </Text>

        <View
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.codeBadge, { color: theme.primary }]}>
              INVITE CODE: {inviteCode}
            </Text>
          </View>

          <Text style={[styles.groupName, { color: theme.textPrimary }]}>
            {groupPreview?.name || 'Trip Circle'}
          </Text>

          <View style={styles.groupMetaRow}>
            <View style={styles.metaItem}>
              <Users size={14} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {groupPreview?.member_count || 1} / 10 Members
              </Text>
            </View>
          </View>

          {groupPreview?.organizer_name && (
            <Text style={[styles.organizerText, { color: theme.textSecondary }]}>
              Organized by {groupPreview.organizer_name}
            </Text>
          )}

          <View style={[styles.privacyBox, { backgroundColor: theme.surfaceSubtle }]}>
            <ShieldCheck size={16} color={theme.success} />
            <Text style={[styles.privacyBoxText, { color: theme.textSecondary }]}>
              Your individual constraints are 100% private. Only shared group consensus is surfaced.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleJoin}
            disabled={status === 'joining'}
            style={[styles.joinBtn, { backgroundColor: theme.primary, opacity: status === 'joining' ? 0.7 : 1 }]}
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
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/auth')}
          style={styles.switchAccountBtn}
        >
          <Text style={[styles.switchAccountText, { color: theme.textSecondary }]}>
            Not your account? Sign in / Switch Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centerContainer: {
    flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center',
    maxWidth: 500, width: '100%', alignSelf: 'center'
  },
  loadingText: { fontSize: 14, marginTop: 16 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  logoIcon: {
    width: 68, height: 68, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  title: {
    fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 24, lineHeight: 18
  },
  primaryBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, marginTop: 8
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12,
    borderWidth: 1, marginTop: 8
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
  card: {
    width: '100%', borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 16
  },
  cardHeader: { marginBottom: 6 },
  codeBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  groupName: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  groupMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  organizerText: { fontSize: 12, marginBottom: 14 },
  privacyBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 10, borderRadius: 10, marginBottom: 16
  },
  privacyBoxText: { fontSize: 11, lineHeight: 15, flex: 1 },
  joinBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12
  },
  joinBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchAccountBtn: { paddingVertical: 8 },
  switchAccountText: { fontSize: 12, fontWeight: '600' }
});
