import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Share,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../../../src/components/BottlenecksSection';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { InviteQRModal } from '../../../src/components/InviteQRModal';
import { NudgeModal } from '../../../src/components/NudgeModal';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Share2,
  QrCode,
  Copy,
  Check,
  Users,
  UserPlus,
  Sliders,
  Sparkles,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
  Compass
} from 'lucide-react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups = [],
    activeGroupId,
    setActiveGroup,
    currentUserId = 'user-maya-001',
    members = [],
    getConsensusResults,
    leaveGroup,
    deleteGroup
  } = useGatherlyStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showNudgeModal, setShowNudgeModal] = useState(false);

  const theme = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (id && id !== activeGroupId) {
      try {
        setActiveGroup(id);
      } catch (e) {}
    }
  }, [id, activeGroupId]);

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups.find((g) => g && g.id === activeGroupId) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'College Reunion Trip',
      inviteCode: 'GOA-2026',
      organizerId: 'user-maya-001',
      status: 'voting' as const,
      totalMembersCount: 5
    };

  let consensus;
  try {
    consensus = getConsensusResults();
  } catch (e) {
    consensus = {
      groupId: currentGroup.id,
      totalMembersCount: currentGroup.totalMembersCount || 5,
      respondedMembersCount: members.length,
      rankedOptions: [],
      winningOption: undefined,
      deadlockDiagnosis: { isDeadlocked: false, topOptionConsensus: 0, primaryCause: 'none' as const, diagnosisText: '', organizerSuggestions: [] },
      consensusReached: false
    };
  }

  const isOrganizer = currentGroup.organizerId === currentUserId;
  const topOption = consensus?.winningOption || consensus?.rankedOptions?.[0] || null;

  // Determine current step
  const userHasSubmitted = (members || []).some(
    (m) => m?.userId === currentUserId && Boolean(m?.submittedAt)
  );

  let currentStepNumber: 1 | 2 | 3 | 4 = 1;
  if (currentGroup.status === 'finalized') {
    currentStepNumber = 4;
  } else if (currentGroup.status === 'voting') {
    currentStepNumber = 3;
  } else if (userHasSubmitted) {
    currentStepNumber = 2;
  }

  const pendingNames = (members || [])
    .filter((m) => !m?.submittedAt)
    .map((m) => m?.userName || (m as any)?.name || 'Friend');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleCopyCode = async () => {
    triggerHaptic();
    try {
      await Clipboard.setStringAsync(currentGroup.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {}
  };

  const handleShareInvite = async () => {
    triggerHaptic();
    const shareMessage = `Join our trip circle "${currentGroup.name}" on PACT!\nEnter invite code: ${currentGroup.inviteCode}\n\nDownload PACT to submit your private dates and budget: https://pact.app/invite/${currentGroup.inviteCode}`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(shareMessage);
        Alert.alert('Invite Link Copied', 'Share this link with your friends in WhatsApp.');
      } catch (e) {
        Alert.alert('Invite Code', currentGroup.inviteCode);
      }
    } else {
      try {
        await Share.share({
          message: shareMessage,
          title: `Join ${currentGroup.name} on PACT`
        });
      } catch (e) {}
    }
  };

  const handleLeaveOrDelete = () => {
    triggerHaptic();
    if (isOrganizer) {
      Alert.alert(
        'Delete Trip Circle',
        `Are you sure you want to delete "${currentGroup.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteGroup(currentGroup.id);
              router.replace('/groups');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Leave Trip Circle',
        `Are you sure you want to leave "${currentGroup.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              await leaveGroup(currentGroup.id);
              router.replace('/groups');
            }
          }
        ]
      );
    }
  };

  // Bottleneck issues
  const bottleneckIssues = [];
  if (consensus?.deadlockDiagnosis?.isDeadlocked) {
    bottleneckIssues.push({
      type: (consensus.deadlockDiagnosis.primaryCause === 'budget_gap'
        ? 'budget'
        : consensus.deadlockDiagnosis.primaryCause === 'date_conflict'
        ? 'dates'
        : 'dealbreaker') as 'budget' | 'dates' | 'dealbreaker',
      title: 'Constraint Conflict Detected',
      description: consensus.deadlockDiagnosis.diagnosisText
    });
  }

  const isSoloGroup = members.length <= 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar
        currentStep={currentStepNumber}
        groupId={currentGroup.id}
        isDarkMode={isDarkMode}
      />

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
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          >
            <ArrowLeft size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandTextCol}>
            <View style={styles.brandTitleRow}>
              <View style={[styles.brandLogoCircle, { backgroundColor: theme.primary }]}>
                <Compass size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={[styles.brandTitleText, { color: theme.textPrimary }]} numberOfLines={1}>
                {currentGroup.name}
              </Text>
            </View>
            <Text style={[styles.brandSubtitleText, { color: theme.primary }]}>
              Plan A Consensus Trip
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              setShowQRModal(true);
            }}
            style={[styles.qrHeaderBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          >
            <QrCode size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Empty Group State Prompt (Solo Circle) */}
        {isSoloGroup && (
          <View
            style={[
              styles.emptyStateCard,
              { backgroundColor: isDarkMode ? '#1E293B' : '#FFF7ED', borderColor: isDarkMode ? 'rgba(234, 88, 12, 0.3)' : '#FED7AA' },
              shadows.sm
            ]}
          >
            <View style={styles.emptyStateTop}>
              <View style={[styles.emptyIconBox, { backgroundColor: theme.primary }]}>
                <UserPlus size={18} color="#FFFFFF" />
              </View>
              <View style={styles.emptyTextCol}>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  You're the first one here! 🎉
                </Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  Share your 6-digit code with friends so they can submit their private dates and budget.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleShareInvite}
              style={[styles.emptyInviteBtn, { backgroundColor: theme.primary }]}
            >
              <Share2 size={14} color="#FFFFFF" />
              <Text style={styles.emptyInviteBtnText}>Invite Friends</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. Consensus Matrix Card */}
        <ConsensusMatrix
          destinationTitle={topOption?.option?.name || currentGroup.name || 'Trip Circle'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={() => setShowNudgeModal(true)}
        />

        {/* Invite Code & Share Card */}
        <View
          style={[
            styles.inviteCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.inviteHeader}>
            <Text style={[styles.inviteLabel, { color: theme.textSecondary }]}>
              CIRCLE INVITE CODE
            </Text>
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor:
                    currentGroup.status === 'finalized'
                      ? theme.successLight
                      : currentGroup.status === 'voting'
                      ? theme.primaryLight
                      : theme.warningLight
                }
              ]}
            >
              <Text
                style={[
                  styles.statusTagText,
                  {
                    color:
                      currentGroup.status === 'finalized'
                        ? theme.success
                        : currentGroup.status === 'voting'
                        ? theme.primary
                        : theme.warning
                  }
                ]}
              >
                {currentGroup.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.codeRow}>
            <Text style={[styles.codeText, { color: theme.primary }]}>
              {currentGroup.inviteCode}
            </Text>
            <View style={styles.codeActions}>
              <TouchableOpacity
                onPress={handleShareInvite}
                activeOpacity={0.7}
                style={[styles.iconActionBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              >
                <Share2 size={16} color={theme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setShowQRModal(true);
                }}
                activeOpacity={0.7}
                style={[styles.iconActionBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              >
                <QrCode size={16} color={theme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyCode}
                activeOpacity={0.7}
                style={[styles.copyCodeBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              >
                {copiedCode ? (
                  <Check size={16} color={theme.success} />
                ) : (
                  <Copy size={16} color={theme.textSecondary} />
                )}
                <Text
                  style={[
                    styles.copyCodeText,
                    { color: copiedCode ? theme.success : theme.textPrimary }
                  ]}
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. Bottlenecks Section */}
        {bottleneckIssues.length > 0 && (
          <BottlenecksSection
            issues={bottleneckIssues}
            isDarkMode={isDarkMode}
            onResolve={() => router.push(`/groups/${currentGroup.id}/options` as any)}
          />
        )}

        {/* Action Center Buttons */}
        <View style={styles.actionCenter}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/groups/${currentGroup.id}/preferences` as any)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Sliders size={20} color={theme.primary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionCardTitle, { color: theme.textPrimary }]}>
                {userHasSubmitted ? 'Edit My Constraints' : 'Submit My Constraints'}
              </Text>
              <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
                {userHasSubmitted
                  ? 'Update your dates, budget, and tags privately'
                  : 'Share your private availability & preferences'}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/groups/${currentGroup.id}/options` as any)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Sparkles size={20} color={theme.primary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionCardTitle, { color: theme.textPrimary }]}>
                View Ranked Options
              </Text>
              <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
                See deterministic scores & top matches
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/groups/${currentGroup.id}/vote` as any)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Lock size={20} color={theme.primary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionCardTitle, { color: theme.textPrimary }]}>
                Voting & Lock It In
              </Text>
              <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
                Cast silent approval votes & finalize trip
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Leave or Delete Group Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLeaveOrDelete}
            style={[
              styles.leaveBtn,
              { borderColor: theme.border, backgroundColor: theme.surface }
            ]}
          >
            {isOrganizer ? (
              <Trash2 size={15} color="#EF4444" />
            ) : (
              <LogOut size={15} color={theme.textSecondary} />
            )}
            <Text
              style={[
                styles.leaveBtnText,
                { color: isOrganizer ? '#EF4444' : theme.textSecondary }
              ]}
            >
              {isOrganizer ? 'Delete Trip Circle' : 'Leave Circle'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <BottomTabBar />

      {/* QR Code Modal */}
      <InviteQRModal
        visible={showQRModal}
        groupName={currentGroup.name}
        inviteCode={currentGroup.inviteCode}
        isDarkMode={isDarkMode}
        onClose={() => setShowQRModal(false)}
      />

      {/* Nudge Modal */}
      <NudgeModal
        visible={showNudgeModal}
        groupName={currentGroup.name}
        pendingMembers={pendingNames}
        isDarkMode={isDarkMode}
        onClose={() => setShowNudgeModal(false)}
      />
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
    paddingBottom: 140,
    maxWidth: 640,
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
    flex: 1,
    paddingHorizontal: 8
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
  qrHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  emptyStateCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  emptyStateTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
  },
  emptyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTextCol: {
    flex: 1
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    lineHeight: 17
  },
  emptyInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md
  },
  emptyInviteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  inviteCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  inviteLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  codeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1
  },
  copyCodeText: {
    fontSize: 13,
    fontWeight: '700'
  },
  actionCenter: {
    gap: 8,
    marginTop: 4
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 12
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionTextCol: {
    flex: 1
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  actionCardSub: {
    fontSize: 12
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 20
  },
  leaveBtnText: {
    fontSize: 13,
    fontWeight: '700'
  }
});