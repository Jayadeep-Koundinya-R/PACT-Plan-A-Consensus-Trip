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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { RankedOptionCard } from '../src/components/RankedOptionCard';
import { ConsensusMatrix } from '../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../src/components/BottlenecksSection';
import { TripBriefModal } from '../src/components/TripBriefModal';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  Compass,
  Users,
  ChevronRight,
  Plus,
  Lock,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Vote
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
      >
        {/* Top PACT Brand Header Frame Box */}
        <View
          style={[
            styles.brandHeaderBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.brandRow}>
            <View
              style={[
                styles.logoIcon,
                { backgroundColor: theme.primary },
                shadows.glowPrimary
              ]}
            >
              <Compass size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
                PACT
              </Text>
              <Text style={[styles.brandSubtitle, { color: theme.primary }]}>
                Plan A Consensus Trip
              </Text>
            </View>
          </View>

          <View style={styles.navActions}>
            {userEmail ? (
              <TouchableOpacity
                onPress={() => {
                  logout();
                  router.replace('/auth');
                }}
                style={[
                  styles.iconButton,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
                accessibilityLabel="Log Out"
              >
                <LogOut size={16} color={theme.danger} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/auth')}
                style={[
                  styles.iconButton,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
                accessibilityLabel="Sign In"
              >
                <Users size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}

            <ThemeToggle />
          </View>
        </View>

        {/* Section: Spaces / Circles */}
        <View style={styles.circlesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Your Spaces
            </Text>
            <TouchableOpacity
              onPress={() => setCreateModalVisible(true)}
              style={[styles.plusCircleBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}
            >
              <Plus size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {safeGroups.map((grp) => {
            const isSelected = grp.id === activeGroupId;

            return (
              <TouchableOpacity
                key={grp.id}
                activeOpacity={0.85}
                onPress={() => {
                  triggerHaptic();
                  setActiveGroup(grp.id);
                  router.push(`/groups/${grp.id}`);
                }}
                style={[
                  styles.circleCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border
                  },
                  shadows.sm
                ]}
              >
                <View style={styles.circleLeft}>
                  <View
                    style={[
                      styles.circleAvatarBox,
                      {
                        backgroundColor: isDarkMode
                          ? '#1E293B'
                          : '#FFEDD5'
                      }
                    ]}
                  >
                    <Users size={18} color={theme.primary} />
                  </View>
                  <View style={styles.circleTextCol}>
                    <Text style={[styles.circleName, { color: theme.textPrimary }]}>
                      {grp.name}
                    </Text>
                    <Text style={[styles.circleMeta, { color: theme.textSecondary }]}>
                      {grp.totalMembersCount || 5} members • Code: {grp.inviteCode}
                    </Text>
                  </View>
                </View>

                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Private Constraint Prompt */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/groups/${currentGroup.id}/preferences`)}
          style={[
            styles.constraintStatusCard,
            {
              backgroundColor: theme.surface,
              borderColor: currentUserSubmitted ? theme.success : theme.primary
            },
            shadows.sm
          ]}
        >
          <View style={styles.constraintStatusLeft}>
            {currentUserSubmitted ? (
              <ShieldCheck size={20} color={theme.success} />
            ) : (
              <Clock size={20} color={theme.primary} />
            )}
            <View style={styles.constraintTextCol}>
              <Text style={[styles.constraintTitle, { color: theme.textPrimary }]}>
                {currentUserSubmitted
                  ? 'Constraints Submitted (Private) ✅'
                  : 'Share Your Dates & Budget (Private)'}
              </Text>
              <Text style={[styles.constraintSub, { color: theme.textSecondary }]}>
                {currentUserSubmitted
                  ? 'Tap to update dates or budget. Invisible to friends.'
                  : 'Submit privately so AI can rank options for everyone.'}
              </Text>
            </View>
          </View>
          <ArrowRight size={16} color={currentUserSubmitted ? theme.success : theme.primary} />
        </TouchableOpacity>

        {/* 1. Consensus Matrix */}
        <ConsensusMatrix
          destinationTitle={topOption?.option?.name || currentGroup.name}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={(name) => Alert.alert('Nudge Sent', `Sent a push reminder to ${name}.`)}
        />

        {/* 2. Top Ranked Options */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Top Ranked Compromises
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}/options`)}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>
              View All ({consensus?.rankedOptions?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ranked Option Cards */}
        <View style={styles.cardsList}>
          {topOption ? (
            <RankedOptionCard
              key={topOption.option.id}
              scoredOption={topOption}
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
            onResolve={() => router.push(`/groups/${currentGroup.id}/options`)}
          />
        )}

        {/* 4. Action CTA ("Lock It In" / "Go to Silent Voting") */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGoToVoting}
          style={[
            styles.finalizeBtn,
            { backgroundColor: theme.primary },
            shadows.glowPrimary
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
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.lg
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 140,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center'
  },
  brandHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: 16
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 20
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  circlesSection: {
    marginBottom: 14
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 8
  },
  circleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  circleAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleTextCol: {
    flex: 1
  },
  circleName: {
    fontSize: 14,
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
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 14
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
    marginTop: 2
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700'
  },
  cardsList: {
    gap: 12,
    marginBottom: 14
  },
  emptyCard: {
    padding: 18,
    borderRadius: radius.card,
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
    marginTop: 6,
    marginBottom: 20
  },
  finalizeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
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
    borderRadius: radius.card,
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
    fontSize: 18,
    fontWeight: '800'
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  modalInput: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 18
  },
  createSubmitBtn: {
    paddingVertical: 14,
    borderRadius: radius.btn,
    alignItems: 'center'
  },
  createSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});