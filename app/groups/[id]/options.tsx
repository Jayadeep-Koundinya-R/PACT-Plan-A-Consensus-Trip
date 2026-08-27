import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { RankedOptionCard } from '../../../src/components/RankedOptionCard';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Vote,
  Users,
  Info,
  Sliders,
  CheckCircle2
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

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
  const consensus = getConsensusResults();

  const handleToggleVote = (optionId: string) => {
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  const pendingCount = currentGroup.totalMembersCount - members.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${id}`)}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
            Ranked Options
          </Text>

          <TouchableOpacity
            onPress={() => router.push(`/groups/${id}/preferences`)}
            style={[styles.editPrefBtn, { backgroundColor: theme.surfaceSubtle }]}
          >
            <Sliders size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Status / Pending Banner */}
        {pendingCount > 0 ? (
          <View style={[styles.statusBanner, { backgroundColor: theme.secondaryLight }]}>
            <Users size={18} color={theme.secondary} />
            <Text style={[styles.statusText, { color: theme.secondary }]}>
              {members.length} of {currentGroup.totalMembersCount} responded. Waiting for {pendingCount} more member{pendingCount > 1 ? 's' : ''} to submit constraints.
            </Text>
          </View>
        ) : (
          <View style={[styles.statusBanner, { backgroundColor: theme.successLight }]}>
            <CheckCircle2 size={18} color={theme.success} />
            <Text style={[styles.statusText, { color: theme.success }]}>
              All 5 members responded! Consensus scores are fully calculated.
            </Text>
          </View>
        )}

        {/* Engine Formula Explainer */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.infoHeader}>
            <Info size={16} color={theme.primary} />
            <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>
              Deterministic Ranking Breakdown
            </Text>
          </View>
          <Text style={[styles.infoBody, { color: theme.textSecondary }]}>
            Each option is scored mathematically based on <Text style={{ fontWeight: '700' }}>Date overlap (35%)</Text>, <Text style={{ fontWeight: '700' }}>Budget affordability (35%)</Text>, and <Text style={{ fontWeight: '700' }}>Activity tag matches (25%)</Text>. Dealbreakers trigger an immediate 0 score.
          </Text>
        </View>

        {/* CTA to Enter Silent Voting */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/groups/${id}/vote`)}
          style={[styles.voteCtaBtn, { backgroundColor: theme.primary }, shadows.md]}
        >
          <Vote size={18} color="#FFFFFF" />
          <Text style={styles.voteCtaText}>Enter Silent Voting Room</Text>
        </TouchableOpacity>

        {/* List of Scored Options */}
        <View style={styles.optionsList}>
          {consensus.rankedOptions.map((scoredOption) => {
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
  editPrefBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1
  },
  infoCard: {
    borderRadius: radius.card,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  infoBody: {
    fontSize: 12,
    lineHeight: 17
  },
  voteCtaBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginBottom: 16
  },
  voteCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  optionsList: {
    gap: 14
  }
});
