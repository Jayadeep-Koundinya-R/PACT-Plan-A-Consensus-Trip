import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Share
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
  Share2
} from 'lucide-react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    members,
    currentUserId,
    getConsensusResults
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
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
  }
});