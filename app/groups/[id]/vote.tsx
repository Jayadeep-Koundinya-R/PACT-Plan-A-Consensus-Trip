import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { ConsensusMeter } from '../../../src/components/ConsensusMeter';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { formatFriendlyDateRange } from '../../../src/lib/format/dateFormatter';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Award
} from 'lucide-react-native';

export default function VoteScreen() {
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
    finalizeTrip,
    reopenVoting
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
  const consensus = getConsensusResults();
  const isOrganizer = currentGroup.organizerId === currentUserId;

  const topOption = consensus.winningOption || consensus.rankedOptions[0];
  const isThresholdMet = (topOption?.consensusPercent || 0) >= 70;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handleToggleVote = (optionId: string) => {
    triggerHaptic();
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  const handleFinalize = () => {
    try {
      finalizeTrip(currentUserId);
      triggerHaptic();
      router.push(`/groups/${currentGroup.id}/brief`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar currentStep={3} groupId={currentGroup.id} isDarkMode={isDarkMode} />

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
            Silent Voting Room
          </Text>

          <View style={{ width: 38 }} />
        </View>

        {/* Privacy Promise Banner */}
        <View
          style={[
            styles.privacyBanner,
            { backgroundColor: theme.primaryLight, borderColor: theme.primary }
          ]}
        >
          <Lock size={16} color={theme.primary} />
          <Text style={[styles.privacyText, { color: theme.textPrimary }]}>
            <Text style={{ fontWeight: '800' }}>Truly Silent Voting:</Text> Individual ballots are strictly confidential. Only live aggregate approval totals are broadcast.
          </Text>
        </View>

        {/* Hero Consensus Meter Card */}
        <View
          style={[
            styles.heroMeterCard,
            {
              backgroundColor: theme.surface,
              borderColor: isThresholdMet ? theme.success : theme.glassBorder
            },
            isThresholdMet ? shadows.glowSuccess : shadows.md
          ]}
        >
          <View style={styles.heroMeterTopRow}>
            <View>
              <Text style={[styles.leadingLabel, { color: theme.textSecondary }]}>
                LEADING CANDIDATE
              </Text>
              <Text style={[styles.leadingDestination, { color: theme.textPrimary }]}>
                {topOption?.option.name}
              </Text>
            </View>

            <View
              style={[
                styles.consensusBadge,
                { backgroundColor: isThresholdMet ? theme.successLight : theme.warningLight }
              ]}
            >
              <Text
                style={[
                  styles.consensusBadgeText,
                  { color: isThresholdMet ? theme.success : theme.warning }
                ]}
              >
                {topOption?.consensusPercent || 0}% Group Consensus
              </Text>
            </View>
          </View>

          <ConsensusMeter
            percentage={topOption?.consensusPercent || 0}
            threshold={70}
            isDarkMode={isDarkMode}
          />

          {/* Organizer Actions */}
          {isOrganizer ? (
            <View style={styles.organizerActionsCol}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!isThresholdMet}
                onPress={handleFinalize}
                style={[
                  styles.finalizeButton,
                  {
                    backgroundColor: isThresholdMet ? theme.success : theme.surfaceElevated,
                    opacity: isThresholdMet ? 1 : 0.6
                  },
                  isThresholdMet ? shadows.glowSuccess : {}
                ]}
              >
                <Sparkles size={18} color={isThresholdMet ? '#FFFFFF' : theme.textMuted} />
                <Text
                  style={[
                    styles.finalizeButtonText,
                    { color: isThresholdMet ? '#FFFFFF' : theme.textMuted }
                  ]}
                >
                  {isThresholdMet ? 'Finalize & Issue Trip Brief' : 'Reach 70% Consensus to Finalize'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  reopenVoting(currentGroup.id, currentUserId);
                  triggerHaptic();
                  alert('Voting round has been reopened for all members.');
                }}
                style={styles.reopenVotingBtn}
              >
                <Text style={[styles.reopenVotingText, { color: theme.textSecondary }]}>
                  ↺ Re-open Voting Round
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.memberNotice, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.memberNoticeText, { color: theme.textSecondary }]}>
                {isThresholdMet
                  ? '70% Threshold reached! Waiting for organizer Maya to finalize.'
                  : 'Voting active. Tap the heart icons below to approve candidate destinations.'}
              </Text>
            </View>
          )}
        </View>

        {/* Deadlock Detection Card */}
        {!isThresholdMet && consensus.deadlockDiagnosis && (
          <View
            style={[
              styles.deadlockCard,
              { backgroundColor: theme.warningLight, borderColor: theme.warning }
            ]}
          >
            <View style={styles.deadlockHeader}>
              <AlertTriangle size={16} color={theme.warning} />
              <Text style={[styles.deadlockTitle, { color: theme.warning }]}>
                Consensus Deadlock Diagnosis
              </Text>
            </View>
            <Text style={[styles.deadlockBody, { color: theme.textPrimary }]}>
              {consensus.deadlockDiagnosis.diagnosisText}
            </Text>
            {consensus.deadlockDiagnosis.organizerSuggestions &&
              consensus.deadlockDiagnosis.organizerSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={[styles.deadlockSuggestionTitle, { color: theme.warning }]}>
                    💡 Organizer Suggestions:
                  </Text>
                  {consensus.deadlockDiagnosis.organizerSuggestions.map((sug, i) => (
                    <Text key={i} style={[styles.deadlockSuggestionItem, { color: theme.textSecondary }]}>
                      • {sug}
                    </Text>
                  ))}
                </View>
              )}
          </View>
        )}

        {/* Voting Ballots List */}
        <View style={styles.ballotSection}>
          <Text style={[styles.ballotSectionTitle, { color: theme.textPrimary }]}>
            Candidate Destinations
          </Text>

          {consensus.rankedOptions.map((scoredOption) => {
            const isApproved = votes[`${scoredOption.option.id}_${currentUserId}`] === true;
            const count = getOptionApprovalCount(scoredOption.option.id);

            return (
              <View
                key={scoredOption.option.id}
                style={[
                  styles.ballotCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isApproved ? theme.primary : theme.glassBorder,
                    borderWidth: isApproved ? 2 : 1
                  },
                  shadows.sm
                ]}
              >
                <View style={styles.ballotInfoCol}>
                  <View style={styles.ballotTitleRow}>
                    <Text style={[styles.ballotName, { color: theme.textPrimary }]}>
                      #{scoredOption.rank} {scoredOption.option.name}
                    </Text>
                    <View
                      style={[
                        styles.matchScorePill,
                        {
                          backgroundColor:
                            scoredOption.rank === 1 ? theme.successLight : theme.primaryLight,
                          borderColor:
                            scoredOption.rank === 1 ? theme.success : theme.primary
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.matchScorePillText,
                          {
                            color:
                              scoredOption.rank === 1 ? theme.success : theme.primary
                          }
                        ]}
                      >
                        {scoredOption.totalScore}% Match
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.ballotMeta, { color: theme.textSecondary }]}>
                    {formatFriendlyDateRange(scoredOption.option.dateStart, scoredOption.option.dateEnd)} • ${scoredOption.option.budgetPerPerson}/person
                  </Text>
                  <Text style={[styles.ballotApprovalStatus, { color: theme.textSecondary }]}>
                    Live Ballots: <Text style={{ fontWeight: '800', color: theme.textPrimary }}>{count} of 5</Text> approved ({((count / 5) * 100).toFixed(0)}%)
                  </Text>
                </View>

                {/* Tactile Heart Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleVote(scoredOption.option.id)}
                  style={[
                    styles.heartBtn,
                    {
                      backgroundColor: isApproved ? theme.primaryLight : theme.surfaceElevated,
                      borderColor: isApproved ? theme.primary : theme.border
                    }
                  ]}
                >
                  <Heart
                    size={22}
                    color={isApproved ? theme.primary : theme.textMuted}
                    fill={isApproved ? theme.primary : 'none'}
                  />
                  <Text
                    style={[
                      styles.heartBtnLabel,
                      { color: isApproved ? theme.primary : theme.textSecondary }
                    ]}
                  >
                    {isApproved ? 'Approved' : 'Vote'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <BottomTabBar />
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
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 16
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1
  },
  heroMeterCard: {
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16
  },
  heroMeterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  leadingLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  leadingDestination: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2
  },
  consensusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  consensusBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  organizerActionsCol: {
    marginTop: 16,
    gap: 8
  },
  finalizeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  finalizeButtonText: {
    fontSize: 14,
    fontWeight: '800'
  },
  reopenVotingBtn: {
    paddingVertical: 6,
    alignItems: 'center'
  },
  reopenVotingText: {
    fontSize: 12,
    fontWeight: '600'
  },
  memberNotice: {
    padding: 12,
    borderRadius: radius.md,
    marginTop: 14
  },
  memberNoticeText: {
    fontSize: 12,
    textAlign: 'center'
  },
  deadlockCard: {
    borderRadius: radius.card,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16
  },
  deadlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  deadlockTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  deadlockBody: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
  },
  suggestionsContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)'
  },
  deadlockSuggestionTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4
  },
  deadlockSuggestionItem: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2
  },
  ballotSection: {
    marginTop: 8
  },
  ballotSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12
  },
  ballotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 10
  },
  ballotInfoCol: {
    flex: 1
  },
  ballotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  ballotName: {
    fontSize: 16,
    fontWeight: '800'
  },
  matchScorePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  matchScorePillText: {
    fontSize: 10,
    fontWeight: '800'
  },
  ballotMeta: {
    fontSize: 12,
    marginTop: 2
  },
  ballotApprovalStatus: {
    fontSize: 12,
    marginTop: 6
  },
  heartBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 2
  },
  heartBtnLabel: {
    fontSize: 11,
    fontWeight: '700'
  }
});
