import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { RankedOptionCard } from '../../../src/components/RankedOptionCard';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../../../src/components/BottlenecksSection';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Filter,
  Sparkles,
  Trophy,
  ChevronRight,
  Vote,
  Compass
} from 'lucide-react-native';

export default function OptionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    members,
    currentUserId,
    getConsensusResults,
    votes,
    castVote,
    getOptionApprovalCount
  } = useGatherlyStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'high_agreement' | 'budget'>('all');

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup =
    groups.find((g) => g.id === id) ||
    groups[0] || {
      id: id || 'demo',
      name: 'College Reunion Trip',
      inviteCode: 'GOA-2026',
      organizerId: 'user-maya-001',
      status: 'voting' as const,
      totalMembersCount: 5
    };

  const consensus = getConsensusResults();
  const topOption = consensus.winningOption || consensus.rankedOptions[0];
  const isOrganizer = currentGroup.organizerId === currentUserId;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleToggleVote = (optionId: string) => {
    triggerHaptic();
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  // Filtered options
  let filteredOptions = consensus.rankedOptions || [];
  if (activeFilter === 'high_agreement') {
    filteredOptions = filteredOptions.filter((o) => o.consensusPercent >= 70);
  } else if (activeFilter === 'budget') {
    filteredOptions = filteredOptions.filter((o) => !o.budgetGapFlag);
  }

  // Bottleneck issues
  const bottleneckIssues = [];
  if (consensus.deadlockDiagnosis && consensus.deadlockDiagnosis.isDeadlocked) {
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
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}`)}
            style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            Ranked Compromise Options
          </Text>

          <View style={styles.emptyRight} />
        </View>

        {/* 1. Consensus Matrix */}
        <ConsensusMatrix
          destinationTitle={topOption?.option.name || 'Trip Circle'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={(name) => alert(`Nudge sent to ${name}!`)}
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
              All Ranked ({consensus.rankedOptions.length})
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
          onPress={() => router.push(`/groups/${currentGroup.id}/vote`)}
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
    letterSpacing: -0.2
  },
  emptyRight: {
    width: 36
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
    gap: 6,
    marginBottom: 14
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