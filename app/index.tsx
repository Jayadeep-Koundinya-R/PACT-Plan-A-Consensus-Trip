import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { RankedOptionCard } from '../src/components/RankedOptionCard';
import { ConsensusMatrix } from '../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../src/components/BottlenecksSection';
import { TripBriefModal } from '../src/components/TripBriefModal';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { colors, radius, shadows, spacing } from '../src/theme/colors';
import {
  Users,
  ChevronRight,
  Plus,
  Lock,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  Vote,
  Compass
} from 'lucide-react-native';

const FALLBACK_GROUP = {
  id: 'circle-college-reunion-2026',
  name: 'College Reunion Trip',
  inviteCode: 'GOA-2026',
  organizerId: 'user-maya-001',
  status: 'voting' as const,
  totalMembersCount: 5
};

export default function DashboardScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    currentUserId = 'user-maya-001',
    userEmail,
    userName,
    initAuthSession,
    logout,
    groups = [],
    activeGroupId,
    setActiveGroup,
    members = [],
    createGroup,
    getConsensusResults,
    votes = {},
    castVote,
    getOptionApprovalCount,
    finalizeTrip,
    finalizedBrief,
    subscriptionPlan
  } = useGatherlyStore();

  const [briefModalVisible, setBriefModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    try {
      initAuthSession();
    } catch (e) {
      console.warn('Auth init failed:', e);
    }
  }, []);

  const theme = isDarkMode ? colors.dark : colors.light;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    triggerHaptic();
    try {
      initAuthSession();
    } catch (e) {}
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  // Resolve safe groups list
  const safeGroups = Array.isArray(groups) && groups.length > 0 ? groups : [FALLBACK_GROUP];
  const currentGroup = safeGroups.find((g) => g && g.id === activeGroupId) || safeGroups[0];

  // Resolve consensus
  let consensus;
  try {
    consensus = getConsensusResults();
  } catch (e) {
    consensus = {
      groupId: currentGroup.id,
      totalMembersCount: 5,
      respondedMembersCount: 5,
      rankedOptions: [],
      winningOption: undefined,
      deadlockDiagnosis: { isDeadlocked: false, topOptionConsensus: 0, primaryCause: 'none' as const, diagnosisText: '', organizerSuggestions: [] },
      consensusReached: false
    };
  }

  const isOrganizer = currentGroup ? currentGroup.organizerId === currentUserId : false;
  const isPro = subscriptionPlan !== 'free';
  const topOption = consensus?.winningOption || consensus?.rankedOptions?.[0] || null;

  // Check if current user submitted constraints
  const currentUserSubmitted = (members || []).some(
    (m) => m?.userId === currentUserId && Boolean(m?.submittedAt)
  );

  const handleToggleVote = (optionId: string) => {
    triggerHaptic();
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  const handleGoToVoting = () => {
    triggerHaptic();
    router.push(`/groups/${currentGroup.id}/vote` as any);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    triggerHaptic();
    if (!isPro && safeGroups.length >= 1 && currentUserId.startsWith('user-')) {
      setCreateModalVisible(false);
      router.push('/paywall');
      return;
    }
    setIsCreating(true);
    try {
      const group = await createGroup(newGroupName.trim());
      setNewGroupName('');
      setCreateModalVisible(false);
      router.push(`/groups/${group.id}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Error creating group');
    } finally {
      setIsCreating(false);
    }
  };

  // Bottlenecks list
  const bottleneckIssues = [];
  if (consensus?.deadlockDiagnosis?.isDeadlocked) {
    const dType = consensus.deadlockDiagnosis.primaryCause === 'budget_gap' ? 'budget' : consensus.deadlockDiagnosis.primaryCause === 'date_conflict' ? 'dates' : 'dealbreaker';
    bottleneckIssues.push({
      type: dType as 'budget' | 'dates' | 'dealbreaker',
      title: dType === 'budget' ? 'Budget Gap Detected' : dType === 'dates' ? 'Date Conflict Detected' : 'Dealbreaker Flagged',
      description: consensus.deadlockDiagnosis.diagnosisText
    });
  } else if (consensus?.rankedOptions?.some((o) => o.budgetGapFlag)) {
    const affected = (members || []).filter((m) => m.budgetMax < 700).map((m) => m.userName || (m as any).name);
    bottleneckIssues.push({
      type: 'budget' as const,
      title: 'Budget Gap Detected',
      description: `${affected.join(' and ') || 'Some travelers'} prefer $650, while the rest are okay with $900.`
    });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Top Accent Line & Gap */}
      <View style={[styles.topBorderLine, { backgroundColor: theme.primary }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Top PACT Brand Header */}
        <ScreenHeader
          title="PACT"
          subtitle="PLAN A CONSENSUS TRIP"
          isDarkMode={isDarkMode}
          rightSlot={
            <View style={styles.navActions}>
              <ThemeToggle />
              <TouchableOpacity
                onPress={() => router.push('/auth')}
                style={[styles.iconButton, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                accessibilityLabel="Switch Account"
              >
                <Users size={16} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          }
        />

        {/* 1. Circles Selection Section */}
        <View style={styles.circlesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Your Travel Circles
            </Text>
            <TouchableOpacity
              onPress={() => setCreateModalVisible(true)}
              style={[styles.plusCircleBtn, { backgroundColor: theme.primary }]}
              accessibilityLabel="Create Circle"
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {safeGroups.map((g) => {
            const isSelected = g.id === currentGroup.id;
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => {
                  triggerHaptic();
                  setActiveGroup(g.id);
                }}
                activeOpacity={0.8}
                style={[
                  styles.circleCard,
                  {
                    backgroundColor: isSelected ? theme.surface : theme.surfaceSubtle,
                    borderColor: isSelected ? theme.primary : theme.border,
                    borderWidth: isSelected ? 1.5 : 1
                  }
                ]}
              >
                <View style={styles.circleLeft}>
                  <View
                    style={[
                      styles.circleAvatarBox,
                      { backgroundColor: isSelected ? theme.primaryLight : theme.border }
                    ]}
                  >
                    <Compass size={18} color={isSelected ? theme.primary : theme.textSecondary} />
                  </View>
                  <View style={styles.circleTextCol}>
                    <Text style={[styles.circleName, { color: theme.textPrimary }]}>
                      {g.name}
                    </Text>
                    <Text style={[styles.circleMeta, { color: theme.textSecondary }]}>
                      Invite: {g.inviteCode || 'PACT-TRIP'} • {g.totalMembersCount || members.length || 5} travelers
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={isSelected ? theme.primary : theme.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Private Preferences Banner Card (Document Motif) */}
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            router.push(`/groups/${currentGroup.id}/preferences` as any);
          }}
          activeOpacity={0.85}
          style={[
            styles.constraintStatusCard,
            {
              backgroundColor: currentUserSubmitted ? theme.surfaceSubtle : theme.surface,
              borderColor: currentUserSubmitted ? theme.success : theme.primary,
              borderLeftWidth: 4,
              borderLeftColor: currentUserSubmitted ? theme.success : theme.primary
            }
          ]}
        >
          <View style={styles.constraintStatusLeft}>
            {currentUserSubmitted ? (
              <CheckCircle2 size={20} color={theme.success} />
            ) : (
              <Clock size={20} color={theme.primary} />
            )}
            <View style={styles.constraintTextCol}>
              <Text style={[styles.constraintTitle, { color: theme.textPrimary }]}>
                {currentUserSubmitted ? 'Your Travel Pact Sealed' : 'Submit Private Constraints'}
              </Text>
              <Text style={[styles.constraintSub, { color: theme.textSecondary }]}>
                {currentUserSubmitted
                  ? 'Your dates, budget, and vibes are securely factored into the consensus.'
                  : 'Tap here to enter your hidden budget & dates without peer pressure.'}
              </Text>
            </View>
          </View>
          <ArrowRight size={16} color={currentUserSubmitted ? theme.success : theme.primary} />
        </TouchableOpacity>

        {/* 2. Top Ranked Destination / Consensus Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Current Consensus Lead
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}/options` as any)}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>
              View All Options ({consensus?.rankedOptions?.length || 3}) →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsList}>
          {topOption ? (
            <RankedOptionCard
              scoredOption={topOption}
              index={0}
              isDarkMode={isDarkMode}
              isApprovedByUser={votes[`${topOption.option.id}_${currentUserId}`] === true}
              approvalCount={getOptionApprovalCount(topOption.option.id)}
              onToggleVote={handleToggleVote}
            />
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Waiting for members to submit their dates and budgets.
              </Text>
            </View>
          )}
        </View>

        {/* 3. Bottlenecks Section */}
        {bottleneckIssues.length > 0 && (
          <BottlenecksSection
            issues={bottleneckIssues}
            isDarkMode={isDarkMode}
            onResolve={() => router.push(`/groups/${currentGroup.id}/options` as any)}
          />
        )}

        {/* 4. Action CTA ("Lock It In" / "Go to Silent Voting") */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGoToVoting}
          style={[
            styles.finalizeBtn,
            { backgroundColor: theme.primary }
          ]}
        >
          <Vote size={18} color="#FFFFFF" />
          <Text style={styles.finalizeBtnText}>
            {isOrganizer ? 'Lock It In & Silent Voting' : 'Cast Silent Vote'}
          </Text>
          <Lock size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />

      {/* Trip Brief Modal */}
      <TripBriefModal
        visible={briefModalVisible}
        finalizedBrief={finalizedBrief}
        isDarkMode={isDarkMode}
        onClose={() => setBriefModalVisible(false)}
      />

      {/* Create Group Modal */}
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.createModalCard,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Create Trip Circle
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              CIRCLE NAME
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
              ]}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="e.g. Goa Reunion 2026"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCreateGroup}
              disabled={isCreating || !newGroupName.trim()}
              style={[
                styles.createSubmitBtn,
                { backgroundColor: theme.primary, opacity: isCreating || !newGroupName.trim() ? 0.6 : 1 }
              ]}
            >
              <Text style={styles.createSubmitBtnText}>
                {isCreating ? 'Creating...' : 'Create Circle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 90,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  circlesSection: {
    marginBottom: 16
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  plusCircleBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.sm,
    marginBottom: 8
  },
  circleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  circleAvatarBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleTextCol: {
    flex: 1
  },
  circleName: {
    fontSize: 13.5,
    fontWeight: '800'
  },
  circleMeta: {
    fontSize: 11,
    marginTop: 1
  },
  constraintStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 16
  },
  constraintStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  constraintTextCol: {
    flex: 1
  },
  constraintTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  constraintSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  cardsList: {
    gap: 10,
    marginBottom: 14
  },
  emptyCard: {
    padding: 18,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center'
  },
  finalizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 4,
    marginBottom: 20
  },
  finalizeBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  createModalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.sm,
    padding: 20,
    borderWidth: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  modalInput: {
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 16
  },
  createSubmitBtn: {
    paddingVertical: 13,
    borderRadius: radius.btn,
    alignItems: 'center'
  },
  createSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});