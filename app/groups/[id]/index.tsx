import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Share,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../../../src/components/BottlenecksSection';
import { NudgeModal } from '../../../src/components/NudgeModal';
import { InviteQRModal } from '../../../src/components/InviteQRModal';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  CheckCircle2,
  Sparkles,
  Vote,
  Sliders,
  ChevronRight,
  QrCode,
  BellRing,
  Award,
  Lock,
  Share2,
  UserPlus,
  Trash2,
  LogOut
} from 'lucide-react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    members,
    currentUserId,
    getConsensusResults,
    leaveGroup,
    deleteGroup
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0] || { id: id || 'demo', name: 'Trip Circle', inviteCode: 'PACT26', organizerId: currentUserId, status: 'voting', totalMembersCount: 5 };
  const consensus = getConsensusResults();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showNudgeModal, setShowNudgeModal] = useState(false);

  const currentUser = members.find((m) => m.userId === currentUserId) || members[0];
  const isOrganizer = currentGroup.organizerId === currentUserId;
  const userHasSubmitted = members.some((m) => m.userId === currentUserId && Boolean(m.submittedAt));

  const pendingMembers = members.filter((m) => !m.submittedAt);
  const pendingNames = pendingMembers.map((m) => m.name);

  const currentStepNumber =
    currentGroup.status === 'finalized'
      ? 4
      : currentGroup.status === 'voting'
      ? 3
      : consensus.rankedOptions.length > 0
      ? 2
      : 1;

  const topOption = consensus.winningOption || consensus.rankedOptions[0];

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(currentGroup.inviteCode);
    } catch (e) {}
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareInvite = async () => {
    const deepLink = `pact://invite/${currentGroup.inviteCode}`;
    const shareText = `You're invited to join "${currentGroup.name}" on PACT!\n\nCode: ${currentGroup.inviteCode}\nLink: ${deepLink}`;
    try {
      await Share.share({ message: shareText, title: `Invite to ${currentGroup.name}` });
    } catch (e) {}
  };

  const handleLeaveOrDelete = () => {
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
  if (consensus.deadlocks && consensus.deadlocks.length > 0) {
    consensus.deadlocks.forEach((d) => {
      bottleneckIssues.push({
        type: (d.type === 'budget' ? 'budget' : d.type === 'dates' ? 'dates' : 'dealbreaker') as 'budget' | 'dates' | 'dealbreaker',
        title: d.type === 'budget' ? 'Budget Gap Detected' : d.type === 'dates' ? 'Date Conflict Detected' : 'Dealbreaker Flagged',
        description: d.description
      });
    });
  }

  const isSoloGroup = members.length <= 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar
        currentStep={currentStepNumber as 1 | 2 | 3 | 4}
        groupId={currentGroup.id}
        isDarkMode={isDarkMode}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push('/groups')}
            style={[styles.backBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {currentGroup.name}
          </Text>

          <TouchableOpacity
            onPress={() => setShowQRModal(true)}
            style={[styles.qrHeaderBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
          >
            <QrCode size={18} color={theme.primary} />
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
                  You're the first one here! 🚀
                </Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  Share your 6-digit code with friends so they can submit their private dates and budget.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
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
          destinationTitle={topOption?.option.name || 'Trip Circle'}
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
            shadows.md
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
                style={[styles.iconActionBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              >
                <Share2 size={16} color={theme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowQRModal(true)}
                activeOpacity={0.7}
                style={[styles.iconActionBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              >
                <QrCode size={16} color={theme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyCode}
                activeOpacity={0.7}
                style={[styles.copyCodeBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
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

        {/* 2. Bottlenecks Section if any */}
        <BottlenecksSection
          issues={bottleneckIssues}
          isDarkMode={isDarkMode}
          onResolve={() => router.push(`/groups/${currentGroup.id}/options`)}
        />

        {/* Action Center Buttons */}
        <View style={styles.actionCenter}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/groups/${currentGroup.id}/preferences`)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: theme.primaryLight }]}>
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
            activeOpacity={0.8}
            onPress={() => router.push(`/groups/${currentGroup.id}/options`)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: theme.secondaryLight }]}>
              <Sparkles size={20} color={theme.secondary} />
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
            activeOpacity={0.8}
            onPress={() => router.push(`/groups/${currentGroup.id}/vote`)}
            style={[
              styles.actionCard,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: theme.primaryLight }]}>
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
              { borderColor: theme.border }
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
    padding: 16,
    paddingBottom: 140,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
    letterSpacing: -0.3
  },
  qrHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  emptyStateCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
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
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
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
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  iconActionBtn: {
    width: 38,
    height: 38,
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
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1
  },
  copyCodeText: {
    fontSize: 13,
    fontWeight: '700'
  },
  actionCenter: {
    gap: 10,
    marginTop: 8
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 12
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionTextCol: {
    flex: 1
  },
  actionCardTitle: {
    fontSize: 15,
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
    marginTop: 6
  },
  leaveBtnText: {
    fontSize: 13,
    fontWeight: '700'
  }
});