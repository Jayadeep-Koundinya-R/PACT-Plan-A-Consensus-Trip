import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { RankedOptionCard } from '../../../src/components/RankedOptionCard';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { generateAIEnhancedExplanation } from '../../../src/lib/revenuecat/entitlements';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Sparkles,
  Bot,
  Vote,
  ShieldCheck,
  Crown,
  X
} from 'lucide-react-native';

export default function OptionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    currentUserId,
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

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedAIInsight, setSelectedAIInsight] = useState('');

  const handleToggleVote = (optionId: string) => {
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  const handleShowAIInsight = (optionName: string, score: number, consensusPct: number, reason: string) => {
    if (!isPro) {
      router.push('/paywall');
      return;
    }
    const insight = generateAIEnhancedExplanation(optionName, score, consensusPct, reason);
    setSelectedAIInsight(insight);
    setAiModalVisible(true);
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
            Ranked Trip Options
          </Text>

          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}/vote`)}
            style={[styles.voteHeaderBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
          >
            <Vote size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Formula Explainer Hero Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.md
          ]}
        >
          <View style={styles.heroHeaderRow}>
            <Sparkles size={18} color={theme.primary} />
            <Text style={[styles.heroHeading, { color: theme.textPrimary }]}>
              Deterministic Ranking Engine
            </Text>
          </View>
          <Text style={[styles.heroDesc, { color: theme.textSecondary }]}>
            Scored mathematically from all 5 members' private dates (35%), budget (35%), and tags (25%). Any member dealbreaker triggers an instant 0% compatibility override.
          </Text>
        </View>

        {/* List of Ranked Option Cards */}
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
                    {isPro ? '✨ View AI Conflict Analysis' : '👑 Unlock AI Conflict Analysis (Pro)'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
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
    paddingBottom: 120,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14
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
    marginHorizontal: 12
  },
  voteHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  heroCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  heroHeading: {
    fontSize: 15,
    fontWeight: '800'
  },
  heroDesc: {
    fontSize: 12,
    lineHeight: 17
  },
  cardsList: {
    gap: 8
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
    marginBottom: 16
  },
  aiInsightBtnText: {
    fontSize: 12,
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
