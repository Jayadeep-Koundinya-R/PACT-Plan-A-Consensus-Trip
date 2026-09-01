import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  ImageBackground,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { ConsensusMeter } from '../../../src/components/ConsensusMeter';
import { ConsensusMatrix } from '../../../src/components/ConsensusMatrix';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { ThemeToggle } from '../../../src/components/ThemeToggle';
import { formatFriendlyDateRange } from '../../../src/lib/format/dateFormatter';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Award,
  Calendar,
  DollarSign,
  ChevronRight,
  Compass,
  Sliders
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

        {/* 1. Consensus Matrix Card */}
        <ConsensusMatrix
          destinationTitle={topOption?.option?.name || currentGroup.name || 'Trip Options'}
          members={members}
          totalMembersCount={currentGroup.totalMembersCount || members.length}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={(name) => Alert.alert('Nudge Sent', `Sent a reminder to ${name}.`)}
        />

        {/* 2. Top Pick Hero Card with Image */}
        {topOption && topOption.option ? (
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
                      <Text style={styles.heroPickBadgeText}>TOP COMPROMISE</Text>
                    </View>
                    <View
                      style={[
                        styles.heroMatchPill,
                        { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)' }
                      ]}
                    >
                      <Text style={[styles.heroMatchPillText, { color: theme.primary }]}>
                        {topOption.totalScore}% MATCH
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text style={styles.heroTitleText}>{topOption.option.name}</Text>
                    <View style={styles.heroMetaRow}>
                      <View style={styles.heroMetaItem}>
                        <Calendar size={13} color="#FFFFFF" />
                        <Text style={styles.heroMetaText}>
                          {formatFriendlyDateRange(topOption.option.dateStart, topOption.option.dateEnd)}
                        </Text>
                      </View>
                      <View style={styles.heroMetaItem}>
                        <DollarSign size={13} color="#FFFFFF" />
                        <Text style={styles.heroMetaText}>
                          ${topOption.option.budgetPerPerson} / person
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* Voting Toggle Row */}
            <View style={styles.heroBottomRow}>
              <View style={styles.heroAgreementCol}>
                <Text style={[styles.heroAgreementLabel, { color: theme.textSecondary }]}>
                  GROUP CONSENSUS
                </Text>
                <Text style={[styles.heroAgreementValue, { color: isThresholdMet ? theme.success : theme.primary }]}>
                  {topOption.consensusPercent}% Agreement ({getOptionApprovalCount(topOption.option.id)}/{currentGroup.totalMembersCount || members.length} votes)
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleToggleVote(topOption.option.id)}
                style={[
                  styles.voteHeartBtn,
                  votes[`${topOption.option.id}_${currentUserId}`]
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                <Heart
                  size={18}
                  color={votes[`${topOption.option.id}_${currentUserId}`] ? '#FFFFFF' : theme.textSecondary}
                  fill={votes[`${topOption.option.id}_${currentUserId}`] ? '#FFFFFF' : 'none'}
                />
                <Text
                  style={[
                    styles.voteHeartBtnText,
                    { color: votes[`${topOption.option.id}_${currentUserId}`] ? '#FFFFFF' : theme.textPrimary }
                  ]}
                >
                  {votes[`${topOption.option.id}_${currentUserId}`] ? 'Approved' : 'Approve'}
                </Text>
              </TouchableOpacity>
            </View>
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
              <Sliders size={16} color="#FFFFFF" />
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
        <View style={[styles.privacyBox, { backgroundColor: isDarkMode ? '#151D2A' : '#FFFFFF', borderColor: theme.border }]}>
          <ShieldCheck size={16} color={theme.success} />
          <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
            Silent Voting is aggregate-only. Friends only see the total approval count, never who voted for what.
          </Text>
        </View>

        {/* Organizer Lock It In Button */}
        {isOrganizer ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleFinalize}
            style={[styles.finalizeBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
          >
            <Lock size={18} color="#FFFFFF" />
            <Text style={styles.finalizeBtnText}>Lock It In & Generate Brief</Text>
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
  heroPickCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14
  },
  heroImageWrapper: {
    height: 140,
    width: '100%'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroImageRadius: {
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card
  },
  heroScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 14,
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
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  heroPickBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  heroMatchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  heroMatchPillText: {
    fontSize: 11,
    fontWeight: '900'
  },
  heroTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 4
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 14
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroMetaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14
  },
  heroAgreementCol: {
    flex: 1
  },
  heroAgreementLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  heroAgreementValue: {
    fontSize: 13,
    fontWeight: '800'
  },
  voteHeartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  voteHeartBtnText: {
    fontSize: 13,
    fontWeight: '700'
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
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 14
  },
  privacyText: {
    fontSize: 11,
    lineHeight: 15,
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
    fontSize: 15,
    fontWeight: '800'
  },
  waitingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: radius.btn,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 20
  },
  waitingNoticeText: {
    fontSize: 12,
    fontWeight: '600'
  }
});