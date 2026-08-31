import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  ImageBackground
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { ConsensusMeter } from '../../../src/components/ConsensusMeter';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
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
  Lock,
  Award,
  Calendar,
  DollarSign
} from 'lucide-react-native';

const DESTINATION_IMAGES: Record<string, string> = {
  'Goa Beach Weekend': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
  'Coastal Getaway': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
  'Manali High Altitude Adventure': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
  'Mountain Retreat': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
  'Kerala Backwaters Chill': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
  'Nature & Houseboat': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop';

export default function VoteScreen() {
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
    finalizeTrip,
    reopenVoting
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0] || { id: id || 'demo', name: 'Trip Circle', inviteCode: 'PACT26', organizerId: currentUserId, status: 'voting', totalMembersCount: 5 };
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

  const topImageUrl = topOption ? (DESTINATION_IMAGES[topOption.option.name] || DEFAULT_IMAGE) : DEFAULT_IMAGE;

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

        {/* 1. Consensus Matrix Card */}
        <ConsensusMatrix
          destinationTitle={topOption?.option.name || 'Trip Options'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
        />

        {/* 2. Top Pick Hero Card with Image */}
        {topOption && (
          <View
            style={[
              styles.heroPickCard,
              { backgroundColor: theme.surface, borderColor: isThresholdMet ? theme.primary : theme.border },
              shadows.md
            ]}
          >
            <View style={styles.heroImageWrapper}>
              <ImageBackground
                source={{ uri: topImageUrl }}
                style={styles.heroImage}
                imageStyle={styles.heroImageRadius}
              >
                <View style={styles.heroScrim}>
                  <View style={styles.heroTopTagRow}>
                    <View style={[styles.heroPickBadge, { backgroundColor: theme.primary }]}>
                      <Award size={12} color="#FFFFFF" />
                      <Text style={styles.heroPickBadgeText}>TOP PICK</Text>
                    </View>
                    <View style={[styles.heroMatchPill, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)' }]}>
                      <Text style={[styles.heroMatchPillText, { color: theme.primary }]}>
                        {topOption.totalScore}% MATCH
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text style={styles.heroTitleText}>{topOption.option.name}</Text>
                    <View style={styles.heroMetaRow}>
                      <View style={styles.heroMetaItem}>
                        <Calendar size={11} color="#FFFFFF" />
                        <Text style={styles.heroMetaText}>
                          {formatFriendlyDateRange(topOption.option.dateStart, topOption.option.dateEnd)}
                        </Text>
                      </View>
                      <Text style={{ color: '#94A3B8' }}>•</Text>
                      <View style={styles.heroMetaItem}>
                        <DollarSign size={11} color="#10B981" />
                        <Text style={[styles.heroMetaText, { color: '#FFFFFF', fontWeight: '700' }]}>
                          ${topOption.option.budgetPerPerson}/person
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* Agreement & Lock It In Button */}
            <View style={styles.heroBottomBody}>
              <View style={styles.agreementRow}>
                <Text style={[styles.agreementLabel, { color: theme.textSecondary }]}>
                  Group Agreement
                </Text>
                <Text style={[styles.agreementValue, { color: isThresholdMet ? theme.success : theme.secondary }]}>
                  {topOption.consensusPercent >= 70 ? 'High' : 'Collecting'} ({topOption.consensusPercent}%)
                </Text>
              </View>

              <ConsensusMeter
                percentage={topOption.consensusPercent}
                threshold={70}
                isDarkMode={isDarkMode}
              />

              {/* Lock It In Action */}
              {isOrganizer ? (
                <View style={styles.organizerBox}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!isThresholdMet}
                    onPress={handleFinalize}
                    style={[
                      styles.lockItInBtn,
                      {
                        backgroundColor: isThresholdMet ? theme.primary : theme.surfaceSubtle,
                        opacity: isThresholdMet ? 1 : 0.6
                      },
                      isThresholdMet ? shadows.glowPrimary : {}
                    ]}
                  >
                    <Lock size={18} color={isThresholdMet ? '#FFFFFF' : theme.textMuted} />
                    <Text
                      style={[
                        styles.lockItInBtnText,
                        { color: isThresholdMet ? '#FFFFFF' : theme.textMuted }
                      ]}
                    >
                      {isThresholdMet ? 'Lock It In' : '70% Consensus Required to Lock In'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.memberStatusBox, { backgroundColor: theme.surfaceSubtle }]}>
                  <ShieldCheck size={16} color={theme.success} />
                  <Text style={[styles.memberStatusText, { color: theme.textSecondary }]}>
                    {isThresholdMet
                      ? 'Consensus reached! Waiting for organizer to Lock It In.'
                      : 'Voting in progress. 70% approval needed to unlock.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Section: Cast Your Votes */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Cast Your Votes
        </Text>

        <View style={styles.ballotList}>
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
                    borderColor: isApproved ? theme.primary : theme.border
                  },
                  shadows.sm
                ]}
              >
                <View style={styles.ballotCardLeft}>
                  <View style={styles.ballotRankPill}>
                    <Text style={[styles.ballotRankText, { color: theme.textSecondary }]}>
                      #{scoredOption.rank}
                    </Text>
                  </View>

                  <View style={styles.ballotInfo}>
                    <Text style={[styles.ballotTitle, { color: theme.textPrimary }]}>
                      {scoredOption.option.name}
                    </Text>
                    <Text style={[styles.ballotSub, { color: theme.textSecondary }]}>
                      ${scoredOption.option.budgetPerPerson} • {scoredOption.totalScore}% match
                    </Text>
                  </View>
                </View>

                {/* Tactile Vote Toggle */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleVote(scoredOption.option.id)}
                  style={[
                    styles.voteHeartBtn,
                    {
                      backgroundColor: isApproved ? theme.primaryLight : theme.surfaceSubtle,
                      borderColor: isApproved ? theme.primary : theme.border
                    }
                  ]}
                >
                  <Heart
                    size={20}
                    color={isApproved ? theme.primary : theme.textMuted}
                    fill={isApproved ? theme.primary : 'none'}
                  />
                  <Text
                    style={[
                      styles.voteHeartCount,
                      { color: isApproved ? theme.primary : theme.textSecondary }
                    ]}
                  >
                    {count}
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
  heroPickCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20
  },
  heroImageWrapper: {
    width: '100%',
    height: 140
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroImageRadius: {
    borderTopLeftRadius: radius.card - 1,
    borderTopRightRadius: radius.card - 1
  },
  heroScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'space-between',
    padding: 12
  },
  heroTopTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroPickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  heroPickBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  heroMatchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  heroMatchPillText: {
    fontSize: 11,
    fontWeight: '800'
  },
  heroTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroMetaText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '500'
  },
  heroBottomBody: {
    padding: 16
  },
  agreementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  agreementLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  agreementValue: {
    fontSize: 12,
    fontWeight: '800'
  },
  organizerBox: {
    marginTop: 14
  },
  lockItInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  lockItInBtnText: {
    fontSize: 15,
    fontWeight: '800'
  },
  memberStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginTop: 12
  },
  memberStatusText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3
  },
  ballotList: {
    gap: 8,
    marginBottom: 24
  },
  ballotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1
  },
  ballotCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  ballotRankPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ballotRankText: {
    fontSize: 12,
    fontWeight: '800'
  },
  ballotInfo: {
    flex: 1
  },
  ballotTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2
  },
  ballotSub: {
    fontSize: 11
  },
  voteHeartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  voteHeartCount: {
    fontSize: 13,
    fontWeight: '800'
  }
});