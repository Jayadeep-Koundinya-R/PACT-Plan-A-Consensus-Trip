import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
import { ConsensusMeter } from '../../../src/components/ConsensusMeter';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { ThemeToggle } from '../../../src/components/ThemeToggle';
import { formatFriendlyDateRange } from '../../../src/lib/format/dateFormatter';
import { colors, radius, shadows, spacing } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Heart,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  Sliders,
  Compass,
  Vote
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
    groups = [],
    activeGroupId,
    setActiveGroup,
    currentUserId = 'user-maya-001',
    members = [],
    tripOptions = [],
    getConsensusResults,
    votes = {},
    castVote,
    getOptionApprovalCount,
    finalizeTrip
  } = useGatherlyStore();

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

  const isOrganizer = currentGroup.organizerId === currentUserId;
  const topOption = consensus?.winningOption || consensus?.rankedOptions?.[0] || null;
  const isThresholdMet = (topOption?.consensusPercent || 0) >= 70;
  const hasUserVoted = topOption && votes[`${topOption.option?.id}_${currentUserId}`] === true;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handleToggleVote = (optionId: string) => {
    if (!optionId) return;
    triggerHaptic();
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  const handleFinalize = () => {
    triggerHaptic();
    try {
      finalizeTrip(currentUserId);
      router.push(`/groups/${currentGroup.id}/brief` as any);
    } catch (err: any) {
      Alert.alert('Notice', err?.message || 'Could not finalize trip yet.');
    }
  };

  const topImageUrl =
    topOption && topOption.option?.name
      ? DESTINATION_IMAGES[topOption.option.name] || DEFAULT_IMAGE
      : DEFAULT_IMAGE;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar currentStep={3} groupId={currentGroup.id} isDarkMode={isDarkMode} />

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

        {/* Silent Vote Confirmation Banner (When Voted) */}
        {hasUserVoted && (
          <View
            style={[
              styles.votedConfirmationCard,
              { backgroundColor: theme.surface, borderColor: theme.success }
            ]}
          >
            <CheckCircle2 size={18} color={theme.success} />
            <View style={styles.votedTextCol}>
              <Text style={[styles.votedTitle, { color: theme.success }]}>
                Your Vote Is Recorded
              </Text>
              <Text style={[styles.votedSub, { color: theme.textSecondary }]}>
                Ballots are private. Only the aggregate approval percentage is shared.
              </Text>
            </View>
          </View>
        )}

        {/* 1. Consensus Matrix Card */}
        <ConsensusMatrix
          groupId={currentGroup.id}
          destinationTitle={topOption?.option?.name || currentGroup.name || 'Trip Options'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={(name) => Alert.alert('Nudge Sent', `Sent a reminder to ${name}.`)}
        />

        {/* 2. Top Pick Ticket Card (Ticket Motif: Perforation, Stub & Top-Right Radius) */}
        {topOption && topOption.option ? (
          <View
            style={[
              styles.ticketCard,
              {
                backgroundColor: theme.surface,
                borderColor: isThresholdMet ? theme.primary : theme.border
              }
            ]}
          >
            {/* Top Ticket Hero Header */}
            <View style={styles.ticketHeroHeader}>
              <ImageBackground
                source={{ uri: topImageUrl }}
                style={styles.heroImage}
                imageStyle={styles.heroImageRadius}
              >
                <View style={styles.heroScrim}>
                  <View style={styles.heroTopTagRow}>
                    <View style={[styles.heroPickBadge, { backgroundColor: theme.primary }]}>
                      <Award size={12} color="#FFFFFF" />
                      <Text style={styles.heroPickBadgeText}>LEAD COMPROMISE</Text>
                    </View>
                    <View
                      style={[
                        styles.heroMatchPill,
                        { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.94)' }
                      ]}
                    >
                      <Text style={[styles.heroMatchPillText, { color: theme.primary }]}>
                        {topOption.totalScore}% CONSENSUS
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text style={styles.heroTitleText}>{topOption.option.name}</Text>
                    <View style={styles.heroMetaRow}>
                      <View style={styles.heroMetaItem}>
                        <Calendar size={12} color="#FFFFFF" />
                        <Text style={styles.heroMetaText}>
                          {formatFriendlyDateRange(topOption.option.dateStart, topOption.option.dateEnd)}
                        </Text>
                      </View>
                      <View style={styles.heroMetaItem}>
                        <DollarSign size={12} color="#FFFFFF" />
                        <Text style={styles.heroMetaText}>
                          ${topOption.option.budgetPerPerson} / traveler
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* Perforation Line (Dashed) */}
            <View style={[styles.perforationLine, { borderColor: theme.border }]} />

            {/* Ticket Stub & Vote Action Row */}
            <View style={styles.ticketBottomRow}>
              {/* Left Stub: Score / Consensus */}
              <View style={[styles.ticketStub, { backgroundColor: theme.surfaceSubtle }]}>
                <Text style={[styles.stubScoreText, { color: isThresholdMet ? theme.success : theme.primary }]}>
                  {topOption.consensusPercent}%
                </Text>
                <Text style={[styles.stubLabelText, { color: theme.textSecondary }]}>
                  AGREEMENT
                </Text>
              </View>

              {/* Right Content & Vote Heart Button */}
              <View style={styles.ticketRightCol}>
                <Text style={[styles.ticketVoteCount, { color: theme.textSecondary }]}>
                  {getOptionApprovalCount(topOption.option.id)} of {currentGroup.totalMembersCount || members.length} votes cast
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggleVote(topOption.option.id)}
                  style={[
                    styles.voteHeartBtn,
                    {
                      backgroundColor: votes[`${topOption.option.id}_${currentUserId}`]
                        ? theme.primaryLight
                        : theme.surfaceSubtle,
                      borderColor: votes[`${topOption.option.id}_${currentUserId}`]
                        ? theme.primary
                        : theme.border
                    }
                  ]}
                >
                  <Heart
                    size={16}
                    color={
                      votes[`${topOption.option.id}_${currentUserId}`]
                        ? theme.primary
                        : theme.textMuted
                    }
                    fill={
                      votes[`${topOption.option.id}_${currentUserId}`]
                        ? theme.primary
                        : 'none'
                    }
                  />
                  <Text
                    style={[
                      styles.voteHeartBtnText,
                      {
                        color: votes[`${topOption.option.id}_${currentUserId}`]
                          ? theme.primary
                          : theme.textSecondary
                      }
                    ]}
                  >
                    {votes[`${topOption.option.id}_${currentUserId}`] ? 'Voted Yes' : 'Cast Silent Vote'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.emptyStateCard,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <Sparkles size={24} color={theme.primary} />
            <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
              No Trip Options Ranked Yet
            </Text>
            <Text style={[styles.emptyStateSub, { color: theme.textSecondary }]}>
              Submit dates and budget constraints so AI can rank compromise destinations.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/groups/${currentGroup.id}/preferences` as any)}
              style={[styles.emptyActionBtn, { backgroundColor: theme.primary }]}
            >
              <Sliders size={15} color="#FFFFFF" />
              <Text style={styles.emptyActionBtnText}>Submit Constraints</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Realtime Consensus Meter */}
        <ConsensusMeter
          destinationTitle={topOption?.option?.name || 'Trip Destination'}
          consensusScore={topOption?.totalScore || 85}
          isConsensusReached={isThresholdMet}
          threshold={70}
          isDarkMode={isDarkMode}
        />

        {/* Privacy Note */}
        <View style={[styles.privacyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ShieldCheck size={16} color={theme.success} />
          <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
            Silent Voting is aggregate-only. Friends only see the total approval percentage, never who voted for what.
          </Text>
        </View>

        {/* Organizer Lock It In Button */}
        {isOrganizer ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleFinalize}
            style={[styles.finalizeBtn, { backgroundColor: theme.primary }]}
          >
            <Lock size={18} color="#FFFFFF" />
            <Text style={styles.finalizeBtnText}>Lock It In & Seal PACT</Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.waitingNotice, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <CheckCircle2 size={16} color={theme.success} />
            <Text style={[styles.waitingNoticeText, { color: theme.textSecondary }]}>
              {topOption && votes[`${topOption.option?.id}_${currentUserId}`]
                ? 'Your vote is recorded! Waiting for organizer to lock it in.'
                : 'Cast your silent approval above.'}
            </Text>
          </View>
        )}
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
  votedConfirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderLeftWidth: 3.5,
    marginBottom: 12
  },
  votedTextCol: {
    flex: 1
  },
  votedTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  votedSub: {
    fontSize: 11,
    marginTop: 1
  },
  ticketCard: {
    borderTopRightRadius: radius.md,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14
  },
  ticketHeroHeader: {
    height: 135,
    width: '100%'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroImageRadius: {
    borderTopRightRadius: radius.md,
    borderTopLeftRadius: 0
  },
  heroScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    justifyContent: 'space-between'
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
    paddingVertical: 3.5,
    borderRadius: radius.btn
  },
  heroPickBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  heroMatchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.btn
  },
  heroMatchPillText: {
    fontSize: 10.5,
    fontWeight: '900'
  },
  heroTitleText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 3
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 12
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroMetaText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600'
  },
  perforationLine: {
    borderWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
    marginVertical: 0
  },
  ticketBottomRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ticketStub: {
    width: '28%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.06)'
  },
  stubScoreText: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  stubLabelText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 1
  },
  ticketRightCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  ticketVoteCount: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1
  },
  voteHeartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  voteHeartBtnText: {
    fontSize: 12,
    fontWeight: '800'
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4
  },
  emptyStateSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.btn
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14
  },
  privacyText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1
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
  waitingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 20
  },
  waitingNoticeText: {
    fontSize: 12,
    fontWeight: '600'
  }
});