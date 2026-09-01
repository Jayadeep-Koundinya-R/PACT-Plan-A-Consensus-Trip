import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { RankedOptionCard } from '../../../src/components/RankedOptionCard';
import { SkeletonLoader } from '../../../src/components/SkeletonLoader';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../../../src/components/BottlenecksSection';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { ThemeToggle } from '../../../src/components/ThemeToggle';
import { AICompromiseModal } from '../../../src/components/AICompromiseModal';
import { colors, radius, shadows, spacing } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Filter,
  Sparkles,
  Trophy,
  ChevronRight,
  Vote,
  Compass,
  Sliders,
  AlertTriangle,
  Lock,
  DollarSign
} from 'lucide-react-native';

export default function OptionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups = [],
    members = [],
    activeGroupId,
    setActiveGroup,
    currentUserId = 'user-maya-001',
    getConsensusResults,
    votes = {},
    castVote,
    getOptionApprovalCount
  } = useGatherlyStore();

  const [showAICompromise, setShowAICompromise] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_agreement' | 'budget'>('all');

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

  const topOption = consensus?.winningOption || consensus?.rankedOptions?.[0] || null;
  const isOrganizer = currentGroup.organizerId === currentUserId;
  const isDeadlocked = Boolean(consensus?.deadlockDiagnosis?.isDeadlocked);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleToggleVote = (optionId: string) => {
    if (!optionId) return;
    triggerHaptic();
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  // Filtered options
  let filteredOptions = consensus?.rankedOptions || [];
  if (activeFilter === 'high_agreement') {
    filteredOptions = filteredOptions.filter((o) => o.consensusPercent >= 70);
  } else if (activeFilter === 'budget') {
    filteredOptions = filteredOptions.filter((o) => !o.budgetGapFlag);
  }

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Progress Journey */}
      <StepProgressBar
        currentStep={2}
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
            onPress={() => router.push(`/groups/${currentGroup.id}` as any)}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
            accessibilityLabel="Back to Group Hub"
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

        {/* Explicit Deadlock / Budget Division Diagnosis State Card */}
        {isDeadlocked && (
          <View
            style={[
              styles.deadlockAlertCard,
              { backgroundColor: theme.surface, borderColor: theme.danger }
            ]}
          >
            <View style={styles.deadlockHeaderRow}>
              <View style={[styles.deadlockIconBox, { backgroundColor: theme.dangerLight }]}>
                <AlertTriangle size={18} color={theme.danger} />
              </View>
              <View style={styles.deadlockTextCol}>
                <Text style={[styles.deadlockTitle, { color: theme.danger }]}>
                  Group Deadlock Detected ({consensus?.deadlockDiagnosis?.primaryCause?.toUpperCase()})
                </Text>
                <Text style={[styles.deadlockDesc, { color: theme.textSecondary }]}>
                  {consensus?.deadlockDiagnosis?.diagnosisText ||
                    'Private budgets and dates do not have an exact natural overlap across all 5 travelers.'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowAICompromise(true)}
              style={[styles.resolveDeadlockBtn, { backgroundColor: theme.danger }]}
            >
              <Sparkles size={14} color="#FFFFFF" />
              <Text style={styles.resolveDeadlockBtnText}>
                Generate AI Bridge Compromise Option →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. Consensus Matrix */}
        <ConsensusMatrix
          groupId={currentGroup.id}
          destinationTitle={topOption?.option?.name || currentGroup.name || 'Trip Circle'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={(name) => Alert.alert('Nudge Sent', `Sent a reminder to ${name}.`)}
        />

        {/* AI Compromise Engine Card (Ticket/Document Motif) */}
        {!isDeadlocked && (
          <TouchableOpacity
            onPress={() => setShowAICompromise(true)}
            activeOpacity={0.85}
            style={[
              styles.aiBannerCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.secondary
              }
            ]}
          >
            <View style={styles.aiBannerLeft}>
              <View style={[styles.aiBannerIconBox, { backgroundColor: theme.secondaryLight }]}>
                <Sparkles size={18} color={theme.secondary} />
              </View>
              <View style={styles.aiBannerTextCol}>
                <Text style={[styles.aiBannerTitle, { color: theme.textPrimary }]}>
                  AI Compromise Whisperer
                </Text>
                <Text style={[styles.aiBannerSub, { color: theme.textSecondary }]}>
                  Auto-negotiate dates & rates to create an optimal option for all 5 members.
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.secondary} />
          </TouchableOpacity>
        )}

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              setActiveFilter('all');
            }}
            style={[
              styles.filterChip,
              activeFilter === 'all'
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: activeFilter === 'all' ? '#FFFFFF' : theme.textSecondary }
              ]}
            >
              All Ranked ({consensus?.rankedOptions?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              setActiveFilter('high_agreement');
            }}
            style={[
              styles.filterChip,
              activeFilter === 'high_agreement'
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: activeFilter === 'high_agreement' ? '#FFFFFF' : theme.textSecondary }
              ]}
            >
              High Match (&gt;70%)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic();
              setActiveFilter('budget');
            }}
            style={[
              styles.filterChip,
              activeFilter === 'budget'
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: activeFilter === 'budget' ? '#FFFFFF' : theme.textSecondary }
              ]}
            >
              No Budget Gap
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Ranked Options List (Ticket Cards) */}
        <View style={styles.optionsList}>
          {filteredOptions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Matching Destinations</Text>
              <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                Try adjusting the filters above or adding new candidate destinations.
              </Text>
            </View>
          ) : (
            filteredOptions.map((item, index) => (
              <RankedOptionCard
                key={item.option?.id || index}
                item={item}
                index={index}
                isDarkMode={isDarkMode}
                isApprovedByUser={votes[`${item.option.id}_${currentUserId}`] === true}
                approvalCount={getOptionApprovalCount(item.option.id)}
                onToggleVote={handleToggleVote}
              />
            ))
          )}
        </View>

        {/* 3. Bottlenecks Section */}
        {bottleneckIssues.length > 0 && (
          <BottlenecksSection
            issues={bottleneckIssues}
            isDarkMode={isDarkMode}
            onResolve={() => setShowAICompromise(true)}
          />
        )}

        {/* 4. Action CTA: Go to Voting */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/groups/${currentGroup.id}/vote` as any)}
          style={[
            styles.finalizeBtn,
            { backgroundColor: theme.primary }
          ]}
        >
          <Vote size={18} color="#FFFFFF" />
          <Text style={styles.finalizeBtnText}>
            Proceed to Silent Voting & Lock In
          </Text>
          <Lock size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />

      {/* AI Compromise Engine Modal */}
      <AICompromiseModal
        visible={showAICompromise}
        groupId={currentGroup.id}
        isDarkMode={isDarkMode}
        onClose={() => setShowAICompromise(false)}
        onApplied={() => {
          setShowAICompromise(false);
          router.push(`/groups/${currentGroup.id}/vote` as any);
        }}
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
  deadlockAlertCard: {
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderLeftWidth: 4,
    marginBottom: 14
  },
  deadlockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10
  },
  deadlockIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deadlockTextCol: {
    flex: 1
  },
  deadlockTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2
  },
  deadlockDesc: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16
  },
  resolveDeadlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.btn
  },
  resolveDeadlockBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800'
  },
  aiBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 12
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  aiBannerIconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiBannerTextCol: {
    flex: 1
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  aiBannerSub: {
    fontSize: 11,
    marginTop: 1
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '800'
  },
  optionsList: {
    gap: 10,
    marginBottom: 14
  },
  emptyCard: {
    padding: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  emptyDesc: {
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
  }
});