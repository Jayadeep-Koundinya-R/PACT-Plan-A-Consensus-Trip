import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Share,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { ConfettiEffect } from '../../../src/components/ConfettiEffect';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  Sparkles,
  Share2,
  CheckCircle,
  Calendar,
  DollarSign,
  Users,
  Award,
  ArrowLeft,
  Check,
  Compass
} from 'lucide-react-native';

export default function TripBriefScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    members,
    finalizedBrief,
    getConsensusResults
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
  const consensus = getConsensusResults();

  const brief =
    finalizedBrief ||
    (consensus.winningOption
      ? {
          groupId: currentGroup.id,
          winningOption: consensus.winningOption,
          finalizedAt: new Date().toISOString(),
          confirmedParticipants: members.map((m) => m.userName),
          totalBudgetRange: `$${Math.min(...members.map((m) => m.budgetMin))} - $${Math.max(...members.map((m) => m.budgetMax))}`,
          travelWindow: `${consensus.winningOption.option.dateStart} to ${consensus.winningOption.option.dateEnd}`
        }
      : null);

  const [copiedShare, setCopiedShare] = useState(false);
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!brief) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No finalized trip brief found for this circle yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${id}/options`)}
            style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.emptyBtnText}>Go to Ranked Options</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { winningOption, confirmedParticipants, totalBudgetRange, travelWindow } = brief;

  const handleShare = async () => {
    const shareMessage = `🎉 PACT Consensus Reached!\n\nDestination: ${winningOption.option.name} (${winningOption.option.destinationType})\nDates: ${travelWindow}\nBudget: $${winningOption.option.budgetPerPerson}/person\nGoing: ${confirmedParticipants.join(', ')}\n\nPlan A Consensus Trip with PACT!`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(shareMessage);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3000);
      } catch (e) {
        alert(shareMessage);
      }
    } else {
      try {
        await Share.share({
          message: shareMessage,
          title: `Trip Brief: ${winningOption.option.name}`
        });
      } catch (error) {
        // Share dismissed
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ConfettiEffect durationMs={4500} />
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
            Trip Brief
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            style={[styles.shareIconBtn, { backgroundColor: theme.primaryLight }]}
          >
            <Share2 size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Celebration Header */}
        <View style={styles.celebrationHero}>
          <View style={[styles.heroIconCircle, { backgroundColor: theme.successLight }]}>
            <CheckCircle size={36} color={theme.success} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
            Consensus Locked & Confirmed! 🌴
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            The group reached 100% agreement. Here is your official Trip Brief ready for bookings.
          </Text>
        </View>

        {/* Confetti Banner on first load */}
        {showCelebration && (
          <View style={[styles.confettiBanner, { backgroundColor: theme.secondaryLight }]}>
            <Sparkles size={16} color={theme.secondary} />
            <Text style={[styles.confettiText, { color: theme.secondary }]}>
              🎉 3-second celebration burst! Everyone's dates & budget honored.
            </Text>
          </View>
        )}

        {/* Official Trip Brief Card */}
        <View
          style={[
            styles.briefCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.lg
          ]}
        >
          {/* Header */}
          <View style={styles.briefCardHeader}>
            <View style={styles.briefBadgeRow}>
              <Award size={18} color={theme.primary} />
              <Text style={[styles.briefBadgeText, { color: theme.primary }]}>
                OFFICIAL TRIP BRIEF
              </Text>
            </View>
            <View style={[styles.consensusBadge, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.consensusBadgeText, { color: theme.success }]}>
                100% Agreement
              </Text>
            </View>
          </View>

          {/* Destination Info */}
          <Text style={[styles.destinationName, { color: theme.textPrimary }]}>
            {winningOption.option.name}
          </Text>
          <Text style={[styles.destinationType, { color: theme.textSecondary }]}>
            {winningOption.option.destinationType}
          </Text>
          {winningOption.option.description && (
            <Text style={[styles.destinationDesc, { color: theme.textSecondary }]}>
              "{winningOption.option.description}"
            </Text>
          )}

          <View style={styles.divider} />

          {/* Detail 1: Dates */}
          <View style={styles.briefDetailRow}>
            <View style={[styles.detailIconCircle, { backgroundColor: theme.primaryLight }]}>
              <Calendar size={18} color={theme.primaryDark} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Confirmed Travel Window
              </Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {travelWindow}
              </Text>
            </View>
          </View>

          {/* Detail 2: Budget */}
          <View style={styles.briefDetailRow}>
            <View style={[styles.detailIconCircle, { backgroundColor: theme.successLight }]}>
              <DollarSign size={18} color={theme.success} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Cost Estimate Per Person
              </Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                ${winningOption.option.budgetPerPerson} / person
              </Text>
              <Text style={[styles.detailSubtext, { color: theme.textSecondary }]}>
                Within all 5 members' private limits ({totalBudgetRange})
              </Text>
            </View>
          </View>

          {/* Detail 3: Participants */}
          <View style={styles.briefDetailRow}>
            <View style={[styles.detailIconCircle, { backgroundColor: theme.secondaryLight }]}>
              <Users size={18} color={theme.secondary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Confirmed Travelers ({confirmedParticipants.length})
              </Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {confirmedParticipants.join(' • ')}
              </Text>
            </View>
          </View>

          {/* Honored Tags */}
          <View style={styles.tagsSection}>
            <Text style={[styles.tagsSectionLabel, { color: theme.textSecondary }]}>
              Group Preferences Satisfied:
            </Text>
            <View style={styles.tagsRow}>
              {winningOption.option.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagBadge, { backgroundColor: theme.surfaceSubtle }]}
                >
                  <Text style={[styles.tagBadgeText, { color: theme.textPrimary }]}>
                    ✓ #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Reason Summary */}
          <View style={[styles.reasonHighlight, { backgroundColor: theme.successLight }]}>
            <Text style={[styles.reasonHighlightText, { color: theme.success }]}>
              💡 Plain-English Summary: "{winningOption.plainEnglishReason}"
            </Text>
          </View>
        </View>

        {/* Share CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={[styles.primaryShareBtn, { backgroundColor: theme.primary }, shadows.md]}
        >
          {copiedShare ? (
            <Check size={18} color="#FFFFFF" />
          ) : (
            <Share2 size={18} color="#FFFFFF" />
          )}
          <Text style={styles.primaryShareBtnText}>
            {copiedShare ? 'Brief Copied to Clipboard!' : 'Share Brief to WhatsApp / SMS'}
          </Text>
        </TouchableOpacity>

        {/* Return to Circles Link */}
        <TouchableOpacity
          onPress={() => router.push('/groups')}
          style={styles.returnBtn}
        >
          <Compass size={16} color={theme.textSecondary} />
          <Text style={[styles.returnBtnText, { color: theme.textSecondary }]}>
            Return to Trip Circles
          </Text>
        </TouchableOpacity>
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
  shareIconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyText: {
    fontSize: 15,
    marginBottom: 16
  },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  celebrationHero: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center'
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18
  },
  confettiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    marginVertical: 10
  },
  confettiText: {
    fontSize: 12,
    fontWeight: '700'
  },
  briefCard: {
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16
  },
  briefCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  briefBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  briefBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  consensusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  consensusBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  destinationName: {
    fontSize: 24,
    fontWeight: '800'
  },
  destinationType: {
    fontSize: 13,
    marginTop: 2
  },
  destinationDesc: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 14,
    opacity: 0.4
  },
  briefDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14
  },
  detailIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailTextCol: {
    flex: 1
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2
  },
  detailSubtext: {
    fontSize: 11,
    marginTop: 2
  },
  tagsSection: {
    marginTop: 6
  },
  tagsSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  reasonHighlight: {
    padding: 10,
    borderRadius: radius.md
  },
  reasonHighlightText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600'
  },
  primaryShareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.btn,
    marginBottom: 12
  },
  primaryShareBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  returnBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10
  },
  returnBtnText: {
    fontSize: 13,
    fontWeight: '600'
  }
});
