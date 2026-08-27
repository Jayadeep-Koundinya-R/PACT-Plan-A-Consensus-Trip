import React, { useState } from 'react';
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
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Heart,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Award,
  Calendar,
  DollarSign,
  ChevronRight,
  Info
} from 'lucide-react-native';

export default function SilentVoteScreen() {
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
    finalizeTrip
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
  const consensus = getConsensusResults();
  const isOrganizer = currentGroup.organizerId === currentUserId;

  const [finalizeError, setFinalizeError] = useState('');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        // Haptics fallback on web
      }
    }
  };

  const handleToggleVote = (optionId: string) => {
    triggerHaptic();
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  const handleFinalize = () => {
    try {
      setFinalizeError('');
      finalizeTrip(currentUserId);
      triggerHaptic();
      router.push(`/groups/${id}/brief`);
    } catch (err: any) {
      setFinalizeError(err.message || 'Unable to finalize trip.');
    }
  };

  const topOption = consensus.rankedOptions[0];
  const isThresholdMet = topOption && topOption.consensusPercent >= 70;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${id}/options`)}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
            Silent Voting Room
          </Text>

          <View style={[styles.privacyBadge, { backgroundColor: theme.successLight }]}>
            <ShieldCheck size={14} color={theme.success} />
            <Text style={[styles.privacyBadgeText, { color: theme.success }]}>
              Silent
            </Text>
          </View>
        </View>

        {/* Voting Explanation Banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.surfaceSubtle }]}>
          <Info size={16} color={theme.primary} />
          <Text style={[styles.infoBannerText, { color: theme.textSecondary }]}>
            Tap the heart on any trip options you support. Only aggregated group percentages are shown — individual ballots are 100% anonymous.
          </Text>
        </View>

        {/* Top Consensus Hero Meter */}
        {topOption && (
          <View
            style={[
              styles.heroMeterCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.md
            ]}
          >
            <View style={styles.heroMeterHeader}>
              <View style={styles.heroMeterTitleRow}>
                <Award size={20} color={theme.primary} />
                <Text style={[styles.heroMeterTitle, { color: theme.textPrimary }]}>
                  Leading Candidate
                </Text>
              </View>
              <Text style={[styles.heroMeterScore, { color: theme.primary }]}>
                {topOption.totalScore}% Fit
              </Text>
            </View>

            <Text style={[styles.leadingOptionName, { color: theme.textPrimary }]}>
              {topOption.option.name}
            </Text>
            <Text style={[styles.leadingOptionSub, { color: theme.textSecondary }]}>
              {topOption.option.destinationType} • ${topOption.option.budgetPerPerson}/person
            </Text>

            <View style={styles.meterWrap}>
              <ConsensusMeter percentage={topOption.consensusPercent} isDarkMode={isDarkMode} />
            </View>

            {/* Finalize Button */}
            {isOrganizer ? (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!isThresholdMet}
                onPress={handleFinalize}
                style={[
                  styles.finalizeButton,
                  {
                    backgroundColor: isThresholdMet ? theme.success : theme.surfaceSubtle,
                    opacity: isThresholdMet ? 1 : 0.6
                  },
                  isThresholdMet ? shadows.md : {}
                ]}
              >
                <Sparkles size={18} color={isThresholdMet ? '#FFFFFF' : theme.textMuted} />
                <Text
                  style={[
                    styles.finalizeButtonText,
                    { color: isThresholdMet ? '#FFFFFF' : theme.textMuted }
                  ]}
                >
                  {isThresholdMet ? 'Finalize & Create Trip Brief' : 'Reach 70% Consensus to Finalize'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.memberNotice, { backgroundColor: theme.surfaceSubtle }]}>
                <Text style={[styles.memberNoticeText, { color: theme.textSecondary }]}>
                  {isThresholdMet
                    ? 'Consensus reached! Waiting for organizer (Maya) to finalize.'
                    : 'Vote on options below to help reach the 70% consensus goal.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {finalizeError ? (
          <View style={[styles.errorBox, { backgroundColor: theme.dangerLight }]}>
            <AlertTriangle size={16} color={theme.danger} />
            <Text style={[styles.errorBoxText, { color: theme.danger }]}>
              {finalizeError}
            </Text>
          </View>
        ) : null}

        {/* Deadlock Diagnostic Alert (if stalled) */}
        {consensus.deadlockDiagnosis.isDeadlocked && (
          <View
            style={[
              styles.deadlockCard,
              { backgroundColor: theme.secondaryLight, borderColor: theme.secondary }
            ]}
          >
            <View style={styles.deadlockHeader}>
              <AlertTriangle size={18} color={theme.secondary} />
              <Text style={[styles.deadlockTitle, { color: theme.textPrimary }]}>
                Consensus Deadlock Detected
              </Text>
            </View>
            <Text style={[styles.deadlockDiagnosis, { color: theme.textPrimary }]}>
              {consensus.deadlockDiagnosis.diagnosisText}
            </Text>

            <Text style={[styles.suggestionsLabel, { color: theme.textSecondary }]}>
              Organizer Suggestions:
            </Text>
            {consensus.deadlockDiagnosis.organizerSuggestions.map((sug, i) => (
              <Text key={i} style={[styles.suggestionItem, { color: theme.textPrimary }]}>
                • {sug}
              </Text>
            ))}
          </View>
        )}

        {/* Options Ballots List */}
        <View style={styles.ballotHeader}>
          <Text style={[styles.ballotHeaderTitle, { color: theme.textPrimary }]}>
            Cast Your Silent Ballot
          </Text>
        </View>

        <View style={styles.optionsList}>
          {consensus.rankedOptions.map((scoredOption) => {
            const isApproved = votes[`${scoredOption.option.id}_${currentUserId}`] === true;
            const count = getOptionApprovalCount(scoredOption.option.id);

            return (
              <View
                key={scoredOption.option.id}
                style={[
                  styles.ballotCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isApproved ? theme.primary : theme.border,
                    borderWidth: isApproved ? 2 : 1
                  },
                  shadows.sm
                ]}
              >
                <View style={styles.ballotTopRow}>
                  <View style={styles.ballotInfoCol}>
                    <View style={styles.rankPillRow}>
                      <View
                        style={[
                          styles.rankPill,
                          {
                            backgroundColor:
                              scoredOption.rank === 1
                                ? theme.successLight
                                : theme.surfaceSubtle
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankPillText,
                            {
                              color:
                                scoredOption.rank === 1
                                  ? theme.success
                                  : theme.textSecondary
                            }
                          ]}
                        >
                          Rank #{scoredOption.rank}
                        </Text>
                      </View>
                      <Text style={[styles.ballotType, { color: theme.textSecondary }]}>
                        {scoredOption.option.destinationType}
                      </Text>
                    </View>

                    <Text style={[styles.ballotName, { color: theme.textPrimary }]}>
                      {scoredOption.option.name}
                    </Text>

                    <View style={styles.ballotMetaRow}>
                      <View style={styles.ballotMetaItem}>
                        <Calendar size={13} color={theme.textSecondary} />
                        <Text style={[styles.ballotMetaText, { color: theme.textSecondary }]}>
                          {scoredOption.option.dateStart} → {scoredOption.option.dateEnd}
                        </Text>
                      </View>

                      <View style={styles.ballotMetaItem}>
                        <DollarSign size={13} color={theme.textSecondary} />
                        <Text style={[styles.ballotMetaText, { color: theme.textSecondary }]}>
                          ${scoredOption.option.budgetPerPerson} / person
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Heart Vote Button */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleToggleVote(scoredOption.option.id)}
                    style={[
                      styles.heartButton,
                      {
                        backgroundColor: isApproved
                          ? theme.primaryLight
                          : theme.surfaceSubtle,
                        borderColor: isApproved ? theme.primary : theme.border
                      }
                    ]}
                  >
                    <Heart
                      size={24}
                      color={isApproved ? theme.primary : theme.textMuted}
                      fill={isApproved ? theme.primary : 'none'}
                    />
                    <Text
                      style={[
                        styles.heartCountText,
                        { color: isApproved ? theme.primary : theme.textSecondary }
                      ]}
                    >
                      {count} Votes
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Meter Bar */}
                <View style={styles.ballotMeterContainer}>
                  <ConsensusMeter
                    percentage={scoredOption.consensusPercent}
                    isDarkMode={isDarkMode}
                    showLabel={false}
                  />
                  <View style={styles.ballotMeterSubRow}>
                    <Text style={[styles.ballotMeterSubText, { color: theme.textSecondary }]}>
                      Group Support: {scoredOption.consensusPercent}%
                    </Text>
                    <Text style={[styles.ballotMeterSubText, { color: theme.primary, fontWeight: '700' }]}>
                      Score: {scoredOption.totalScore}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
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
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700'
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  privacyBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  infoBannerText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1
  },
  heroMeterCard: {
    borderRadius: radius.card,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  heroMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  heroMeterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  heroMeterTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  heroMeterScore: {
    fontSize: 16,
    fontWeight: '800'
  },
  leadingOptionName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2
  },
  leadingOptionSub: {
    fontSize: 13,
    marginBottom: 12
  },
  meterWrap: {
    marginBottom: 16
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
    fontSize: 15,
    fontWeight: '700'
  },
  memberNotice: {
    padding: 12,
    borderRadius: radius.md,
    alignItems: 'center'
  },
  memberNoticeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  errorBoxText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1
  },
  deadlockCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  deadlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  deadlockTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  deadlockDiagnosis: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  suggestionItem: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 4
  },
  ballotHeader: {
    marginBottom: 10
  },
  ballotHeaderTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  optionsList: {
    gap: 12
  },
  ballotCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1
  },
  ballotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  ballotInfoCol: {
    flex: 1
  },
  rankPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  rankPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  rankPillText: {
    fontSize: 10,
    fontWeight: '800'
  },
  ballotType: {
    fontSize: 11,
    fontWeight: '500'
  },
  ballotName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  ballotMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  ballotMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ballotMetaText: {
    fontSize: 11
  },
  heartButton: {
    width: 68,
    height: 68,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    gap: 4
  },
  heartCountText: {
    fontSize: 11,
    fontWeight: '700'
  },
  ballotMeterContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  ballotMeterSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  ballotMeterSubText: {
    fontSize: 11,
    fontWeight: '600'
  }
});
