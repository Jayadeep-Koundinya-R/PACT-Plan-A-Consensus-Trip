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
import { ThemeToggle } from '../../../src/components/ThemeToggle';
import { InviteQRModal } from '../../../src/components/InviteQRModal';
import { NudgeModal } from '../../../src/components/NudgeModal';
import { AICompromiseModal } from '../../../src/components/AICompromiseModal';
import { colors, radius, shadows, spacing } from '../../../src/theme/colors';
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
  Compass,
  CheckCircle2,
  Clock
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
  const [showAIModal, setShowAIModal] = useState(false);

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

  const respondedCount = (members || []).filter((m) => Boolean(m?.submittedAt)).length;
  const totalCount = currentGroup.totalMembersCount || members.length || 5;

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
        {/* Top PACT Brand Header Frame Box - Document Style */}
        <View
          style={[
            styles.brandHeaderBox,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
            accessibilityLabel="Back to Dashboard"
          >
            <ArrowLeft size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandTextCol}>
            <View style={styles.brandTitleRow}>
              <View style={[styles.brandLogoCircle, { backgroundColor: theme.primary }]}>
                <Compass size={13} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={[styles.brandTitleText, { color: theme.textPrimary }]} numberOfLines={1}>
                {currentGroup.name}
              </Text>
            </View>
            <Text style={[styles.brandSubtitleText, { color: theme.primary }]}>
              PLAN A CONSENSUS TRIP
            </Text>
          </View>

          <View style={styles.headerActions}>
            <ThemeToggle />
            <TouchableOpacity
              onPress={() => setShowQRModal(true)}
              style={[styles.qrHeaderBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              accessibilityLabel="Show QR Code"
            >
              <QrCode size={15} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Responded Tracker Banner (Always Visible near top) */}
        <View
          style={[
            styles.respondedTrackerCard,
            {
              backgroundColor: theme.surface,
              borderColor: respondedCount === totalCount ? theme.success : theme.border
            }
          ]}
        >
          <View style={styles.respondedLeft}>
            <View
              style={[
                styles.respondedIconCircle,
                { backgroundColor: respondedCount === totalCount ? theme.successLight : theme.primaryLight }
              ]}
            >
              <Users size={16} color={respondedCount === totalCount ? theme.success : theme.primary} />
            </View>
            <View style={styles.respondedTextCol}>
              <Text style={[styles.respondedTitle, { color: theme.textPrimary }]}>
                {respondedCount} of {totalCount} Travelers Responded
              </Text>
              <Text style={[styles.respondedSub, { color: theme.textSecondary }]}>
                {respondedCount === totalCount
                  ? 'All constraints collected. Ready for consensus calculation.'
                  : `${totalCount - respondedCount} friends still need to enter dates & budgets.`}
              </Text>
            </View>
          </View>
          {respondedCount < totalCount && (
            <TouchableOpacity
              onPress={() => setShowNudgeModal(true)}
              style={[styles.nudgeBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
            >
              <Text style={[styles.nudgeBtnText, { color: theme.primary }]}>Nudge</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. Invite Code / Share Card (Document Motif) */}
        <View
          style={[
            styles.inviteCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={styles.inviteHeader}>
            <Text style={[styles.inviteLabel, { color: theme.textSecondary }]}>
              INVITE CODE
            </Text>
            <View style={[styles.statusTag, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.statusTagText, { color: theme.primary }]}>
                {currentGroup.status?.toUpperCase() || 'ACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.codeRow}>
            <Text style={[styles.codeText, { color: theme.textPrimary }]}>
              {currentGroup.inviteCode || 'GOA-2026'}
            </Text>

            <View style={styles.codeActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCopyCode}
                style={[
                  styles.copyCodeBtn,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                {copiedCode ? (
                  <Check size={14} color={theme.success} />
                ) : (
                  <Copy size={14} color={theme.textPrimary} />
                )}
                <Text style={[styles.copyCodeText, { color: copiedCode ? theme.success : theme.textPrimary }]}>
                  {copiedCode ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleShareInvite}
                style={[styles.iconActionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                accessibilityLabel="Share Circle"
              >
                <Share2 size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. Consensus Matrix & Bottlenecks */}
        <ConsensusMatrix
          groupId={currentGroup.id}
          isDarkMode={isDarkMode}
        />

        {bottleneckIssues.length > 0 && (
          <BottlenecksSection
            issues={bottleneckIssues}
            isDarkMode={isDarkMode}
            onResolve={() => setShowAIModal(true)}
          />
        )}

        {/* 4. Action Center Cards (Document Motif) */}
        <View style={styles.actionCenter}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/groups/${currentGroup.id}/preferences` as any)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: theme.surfaceSubtle }]}>
              <Sliders size={18} color={theme.primary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionCardTitle, { color: theme.textPrimary }]}>
                {userHasSubmitted ? 'Edit Your Private Constraints' : 'Submit Private Constraints'}
              </Text>
              <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
                {userHasSubmitted
                  ? 'Your dates & budget are sealed • Tap to adjust'
                  : 'Enter budget, flexible dates, and vibes securely'}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/groups/${currentGroup.id}/options` as any)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: theme.surfaceSubtle }]}>
              <Sparkles size={18} color={theme.primary} />
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
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: theme.surfaceSubtle }]}>
              <Lock size={18} color={theme.primary} />
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
              <Trash2 size={14} color="#EF4444" />
            ) : (
              <LogOut size={14} color={theme.textSecondary} />
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

      {/* AI Compromise Modal */}
      <AICompromiseModal
        visible={showAIModal}
        groupId={currentGroup.id}
        isDarkMode={isDarkMode}
        onClose={() => setShowAIModal(false)}
        onApplied={() => router.push(`/groups/${currentGroup.id}/options` as any)}
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
    paddingBottom: 130,
    maxWidth: 600,
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
    flex: 1,
    paddingHorizontal: 8
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  qrHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  respondedTrackerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 12
  },
  respondedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  respondedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  respondedTextCol: {
    flex: 1
  },
  respondedTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  respondedSub: {
    fontSize: 11,
    marginTop: 1
  },
  nudgeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '800'
  },
  inviteCard: {
    borderRadius: radius.sm,
    padding: 14,
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
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.btn
  },
  statusTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  codeText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1
  },
  copyCodeText: {
    fontSize: 12,
    fontWeight: '800'
  },
  actionCenter: {
    gap: 8,
    marginTop: 6
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: 12
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionTextCol: {
    flex: 1
  },
  actionCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 1
  },
  actionCardSub: {
    fontSize: 11.5
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.btn,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 20
  },
  leaveBtnText: {
    fontSize: 12.5,
    fontWeight: '700'
  }
});