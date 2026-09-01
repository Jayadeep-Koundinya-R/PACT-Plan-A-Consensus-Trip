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
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Filter,
  Sparkles,
  Trophy,
  ChevronRight,
  Vote,
  Compass,
  Sliders
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
        {/* Top PACT Brand Header Frame */}
        <View
          style={[
            styles.brandHeaderBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}` as any)}
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

        {/* 1. Consensus Matrix */}
        <ConsensusMatrix
          destinationTitle={topOption?.option?.name || currentGroup.name || 'Trip Circle'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={(name) => Alert.alert('Nudge Sent', `Sent a reminder to ${name}.`)}
        />

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
              High Agreement (&gt;70%)
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
              No Budget Gaps
            </Text>
          </TouchableOpacity>
        </View>

        {/* Options Cards */}
        {filteredOptions.length > 0 ? (
          <View style={styles.cardsList}>
            {filteredOptions.map((scoredOption) => {
              const isApproved = votes[`${scoredOption.option.id}_${currentUserId}`] === true;
              const count = getOptionApprovalCount(scoredOption.option.id);

              return (
                <RankedOptionCard
                  key={scoredOption.option.id}
                  scoredOption={scoredOption}
                  isDarkMode={isDarkMode}
                  isApprovedByUser={isApproved}
                  approvalCount={count}
                  onToggleVote={handleToggleVote}
                />
              );
            })}
          </View>
        ) : (
          <View
            style={[
              styles.emptyStateCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <Sparkles size={24} color={theme.primary} />
            <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
              No Options Available Yet
            </Text>
            <Text style={[styles.emptyStateSub, { color: theme.textSecondary }]}>
              Submit dates and budget constraints to let the AI score and rank compromises.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/groups/${currentGroup.id}/preferences` as any)}
              style={[styles.emptyActionBtn, { backgroundColor: theme.primary }]}
            >
              <Sliders size={16} color="#FFFFFF" />
              <Text style={styles.emptyActionBtnText}>Submit Constraints</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottlenecks Section */}
        {bottleneckIssues.length > 0 && (
          <BottlenecksSection
            issues={bottleneckIssues}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Next Step Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/groups/${currentGroup.id}/vote` as any)}
          style={[styles.primaryActionBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
        >
          <Vote size={18} color="#FFFFFF" />
          <Text style={styles.primaryActionBtnText}>Proceed to Silent Voting</Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />
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
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  aiEngineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: 14,
    gap: 12
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiTextCol: {
    flex: 1
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2
  },
  aiCardTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  aiPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  aiPillText: {
    fontSize: 9,
    fontWeight: '800'
  },
  aiCardSub: {
    fontSize: 11,
    lineHeight: 15
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap'
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700'
  },
  cardsList: {
    gap: 8,
    marginBottom: 14
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 14
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4
  },
  emptyStateSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.btn
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 8,
    marginBottom: 20
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});