import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { RankedOptionCard } from '../../../src/components/RankedOptionCard';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../../../src/components/BottlenecksSection';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { generateAIEnhancedExplanation } from '../../../src/lib/ai/pitchGenerator';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Sparkles,
  Bot,
  Crown,
  X,
  Vote,
  Lock,
  ArrowRight
} from 'lucide-react-native';

export default function OptionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    currentUserId,
    members,
    getConsensusResults,
    votes,
    castVote,
    getOptionApprovalCount,
    subscriptionPlan
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
  const consensus = getConsensusResults();
  const isPro = subscriptionPlan !== 'free';
  const isOrganizer = currentGroup.organizerId === currentUserId;

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedAIInsight, setSelectedAIInsight] = useState<string>('');

  const topOption = consensus.winningOption || consensus.rankedOptions[0];

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

  const handleShowAIInsight = (
    optionName: string,
    score: number,
    consensusPct: number,
    reason: string
  ) => {
    triggerHaptic();
    if (!isPro) {
      router.push('/paywall');
      return;
    }
    const insight = generateAIEnhancedExplanation(optionName, score, consensusPct, reason);
    setSelectedAIInsight(insight);
    setAiModalVisible(true);
  };

  // Build list of bottleneck issues if any
  const bottleneckIssues = [];
  if (consensus.deadlocks && consensus.deadlocks.length > 0) {
    consensus.deadlocks.forEach((d) => {
      bottleneckIssues.push({
        type: (d.type === 'budget' ? 'budget' : d.type === 'dates' ? 'dates' : 'dealbreaker') as 'budget' | 'dates' | 'dealbreaker',
        title: d.type === 'budget' ? 'Budget Gap Detected' : d.type === 'dates' ? 'Date Conflict Detected' : 'Dealbreaker Flagged',
        description: d.description
      });
    });
  } else if (consensus.rankedOptions.some((o) => o.budgetGapFlag)) {
    const affected = members.filter((m) => m.budgetMax < 700).map((m) => m.name);
    bottleneckIssues.push({
      type: 'budget' as const,
      title: 'Budget Gap Detected',
      description: `${affected.join(' and ') || 'Some travelers'} prefer lower budgets, while the rest are flexible.`
    });
  }

  const handleNudgeMember = (pendingName: string) => {
    Alert.alert(
      'Nudge Sent! 🔔',
      `A friendly notification was sent to ${pendingName} to submit their travel constraints.`
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar currentStep={2} groupId={currentGroup.id} isDarkMode={isDarkMode} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}`)}
            style={[styles.backBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {currentGroup.name}
          </Text>

          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}/vote`)}
            style={[styles.voteHeaderBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
          >
            <Vote size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 1. Consensus Matrix Component */}
        <ConsensusMatrix
          destinationTitle={topOption?.option.name || 'Trip Options'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={handleNudgeMember}
        />

        {/* Section Heading: Top Picks */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Top Picks
          </Text>
          {topOption && (topOption.consensusPercent >= 70) && (
            <View style={[styles.unlockedTag, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5' }]}>
              <Text style={[styles.unlockedTagText, { color: theme.success }]}>
                CONSENSUS UNLOCKED
              </Text>
            </View>
          )}
        </View>

        {/* List of Ranked Option Cards with Image Hero */}
        <View style={styles.cardsList}>
          {consensus.rankedOptions.map((scoredOption) => {
            const isApproved = votes[`${scoredOption.option.id}_${currentUserId}`] === true;
            const count = getOptionApprovalCount(scoredOption.option.id);

            return (
              <View key={scoredOption.option.id}>
                <RankedOptionCard
                  scoredOption={scoredOption}
                  isDarkMode={isDarkMode}
                  isApprovedByUser={isApproved}
                  approvalCount={count}
                  onToggleVote={handleToggleVote}
                />

                {/* AI Explanation Trigger Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    handleShowAIInsight(
                      scoredOption.option.name,
                      scoredOption.totalScore,
                      scoredOption.consensusPercent,
                      scoredOption.plainEnglishReason
                    )
                  }
                  style={[
                    styles.aiInsightBtn,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: isPro ? theme.secondary : theme.border
                    }
                  ]}
                >
                  <Bot size={14} color={isPro ? theme.secondary : theme.textSecondary} />
                  <Text
                    style={[
                      styles.aiInsightBtnText,
                      { color: isPro ? theme.secondary : theme.textSecondary }
                    ]}
                  >
                    {isPro ? '✨ View AI Conflict Analysis' : '🔒 Unlock AI Conflict Analysis (Pro)'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* 2. Bottlenecks Section */}
        <BottlenecksSection
          issues={bottleneckIssues}
          isDarkMode={isDarkMode}
          onResolve={() => {
            if (topOption) {
              handleShowAIInsight(topOption.option.name, topOption.totalScore, topOption.consensusPercent, topOption.plainEnglishReason);
            }
          }}
        />

        {/* Vote / Lock In CTA Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/groups/${currentGroup.id}/vote`)}
          style={[styles.primaryCtaBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
        >
          <Lock size={16} color="#FFFFFF" />
          <Text style={styles.primaryCtaBtnText}>Go to Voting & Finalize</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <BottomTabBar />

      {/* AI Insight Modal */}
      <Modal
        visible={aiModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.secondary },
              shadows.lg
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Crown size={18} color={theme.secondary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  PACT Pro AI Diagnosis
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.aiInsightBody, { color: theme.textPrimary }]}>
              {selectedAIInsight}
            </Text>

            <TouchableOpacity
              onPress={() => setAiModalVisible(false)}
              style={[styles.closeModalBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.closeModalBtnText}>Got it</Text>
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
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
    letterSpacing: -0.3
  },
  voteHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  unlockedTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  unlockedTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  cardsList: {
    gap: 4
  },
  aiInsightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: -8,
    marginBottom: 14
  },
  aiInsightBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 8,
    marginBottom: 20
  },
  primaryCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 2
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  aiInsightBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18
  },
  closeModalBtn: {
    paddingVertical: 12,
    borderRadius: radius.btn,
    alignItems: 'center'
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});