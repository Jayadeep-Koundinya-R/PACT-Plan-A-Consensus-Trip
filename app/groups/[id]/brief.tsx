import React, { useState } from 'react';
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
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { SocialStoryModal } from '../../../src/components/SocialStoryModal';
import { downloadICSFile } from '../../../src/lib/export/icsGenerator';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  Tag,
  Share2,
  Check,
  Award,
  ArrowLeft,
  Compass,
  CheckCircle2,
  Plus,
  Download,
  Image as ImageIcon
} from 'lucide-react-native';

export default function TripBriefScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    members,
    getConsensusResults,
    finalizedBrief
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
  const consensus = getConsensusResults();

  const [copied, setCopied] = useState(false);
  const [icsDownloaded, setIcsDownloaded] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);

  const winningScored = finalizedBrief?.winningOption || consensus.winningOption || consensus.rankedOptions[0];
  const option = winningScored.option;

  const briefText = `🌴 OFFICIAL PACT TRIP BRIEF: ${currentGroup.name}\n\n🏆 Finalized Destination: ${option.name}\n📅 Confirmed Dates: ${option.dateStart} to ${option.dateEnd}\n💰 Target Budget: $${option.budgetPerPerson} / person (100% group fit)\n👥 Confirmed Travelers: ${members.map((m) => m.userName).join(', ')}\n🏷️ Matched Vibes: ${option.tags.map((t) => `#${t}`).join(' ')}\n\n(Generated with 100% consensus in PACT!)`;

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(briefText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        alert(briefText);
      }
    } else {
      try {
        await Share.share({
          message: briefText,
          title: `Trip Brief: ${option.name}`
        });
      } catch (e) {}
    }
  };

  const handleExportICS = () => {
    const success = downloadICSFile({
      title: `${currentGroup.name}: ${option.name}`,
      description: `Official PACT Trip Plan for ${option.name}.\nBudget: $${option.budgetPerPerson}/person.\nCrew: ${members.map((m) => m.userName).join(', ')}`,
      location: option.name,
      startDate: option.dateStart,
      endDate: option.dateEnd,
      attendees: members.map((m) => m.userName)
    });

    if (success) {
      setIcsDownloaded(true);
      setTimeout(() => setIcsDownloaded(false), 2500);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Dynamic Confetti Explosion */}
      <ConfettiEffect durationMs={4500} />

      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar currentStep={4} groupId={currentGroup.id} isDarkMode={isDarkMode} />

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
            Official Trip Brief
          </Text>

          <TouchableOpacity
            onPress={() => setStoryModalVisible(true)}
            style={[styles.shareHeaderBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
          >
            <ImageIcon size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Boarding Pass / Ticket Card */}
        <View
          style={[
            styles.ticketCard,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.lg
          ]}
        >
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.ticketBrandRow}>
              <Compass size={18} color={theme.primary} />
              <Text style={[styles.ticketBrandText, { color: theme.primary }]}>
                PACT BOARDING PASS
              </Text>
            </View>
            <View style={[styles.consensusPill, { backgroundColor: theme.successLight }]}>
              <Award size={13} color={theme.success} />
              <Text style={[styles.consensusPillText, { color: theme.success }]}>
                CONSENSUS REACHED
              </Text>
            </View>
          </View>

          {/* Perforated Divider */}
          <View style={styles.perforationRow}>
            <View style={[styles.cutoutLeft, { backgroundColor: theme.background }]} />
            <View style={[styles.dashedLine, { borderColor: theme.border }]} />
            <View style={[styles.cutoutRight, { backgroundColor: theme.background }]} />
          </View>

          {/* Ticket Body */}
          <View style={styles.ticketBody}>
            <Text style={[styles.circleNameLabel, { color: theme.textSecondary }]}>
              {currentGroup.name.toUpperCase()}
            </Text>
            <Text style={[styles.destinationTitle, { color: theme.textPrimary }]}>
              {option.name}
            </Text>
            <Text style={[styles.destinationSub, { color: theme.textSecondary }]}>
              {option.description}
            </Text>

            {/* Dates & Budget Metadata Grid */}
            <View style={styles.metaGrid}>
              <View
                style={[
                  styles.metaCard,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                ]}
              >
                <Calendar size={18} color={theme.primary} />
                <Text style={[styles.metaCardLabel, { color: theme.textSecondary }]}>
                  DATES
                </Text>
                <Text style={[styles.metaCardValue, { color: theme.textPrimary }]}>
                  {option.dateStart}
                </Text>
                <Text style={[styles.metaCardSub, { color: theme.textMuted }]}>
                  to {option.dateEnd}
                </Text>
              </View>

              <View
                style={[
                  styles.metaCard,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                ]}
              >
                <DollarSign size={18} color={theme.success} />
                <Text style={[styles.metaCardLabel, { color: theme.textSecondary }]}>
                  TARGET BUDGET
                </Text>
                <Text style={[styles.metaCardValue, { color: theme.success }]}>
                  ${option.budgetPerPerson}
                </Text>
                <Text style={[styles.metaCardSub, { color: theme.textMuted }]}>
                  per traveler
                </Text>
              </View>
            </View>

            {/* Confirmed Participants Roster */}
            <View style={styles.participantsSection}>
              <View style={styles.participantsHeader}>
                <Users size={16} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Confirmed Travelers ({members.length})
                </Text>
              </View>

              <View style={styles.participantsChips}>
                {members.map((m) => (
                  <View
                    key={m.userId}
                    style={[
                      styles.participantChip,
                      { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                    ]}
                  >
                    <CheckCircle2 size={14} color={theme.success} />
                    <Text style={[styles.participantChipText, { color: theme.textPrimary }]}>
                      {m.userName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Matched Tags */}
            <View style={styles.tagsSection}>
              <View style={styles.tagsHeader}>
                <Tag size={16} color={theme.secondary} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Honored Group Vibes
                </Text>
              </View>
              <View style={styles.tagsRow}>
                {option.tags.map((t) => (
                  <View
                    key={t}
                    style={[
                      styles.tagBadge,
                      { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                    ]}
                  >
                    <Text style={[styles.tagBadgeText, { color: theme.primary }]}>
                      #{t}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons Grid */}
        <View style={styles.actionsContainer}>
          {/* Primary Share */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShare}
            style={[styles.primaryShareBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
          >
            {copied ? (
              <Check size={18} color="#FFFFFF" />
            ) : (
              <Share2 size={18} color="#FFFFFF" />
            )}
            <Text style={styles.primaryShareBtnText}>
              {copied ? 'Copied to Clipboard!' : 'Share Brief to WhatsApp / Group'}
            </Text>
          </TouchableOpacity>

          {/* Social Story Card 9:16 Modal Trigger */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setStoryModalVisible(true)}
            style={[
              styles.secondaryActionBtn,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
            ]}
          >
            <ImageIcon size={18} color={theme.primary} />
            <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>
              Generate 9:16 Social Story Card
            </Text>
          </TouchableOpacity>

          {/* Calendar ICS Export */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleExportICS}
            style={[
              styles.secondaryActionBtn,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
            ]}
          >
            {icsDownloaded ? (
              <Check size={18} color={theme.success} />
            ) : (
              <Calendar size={18} color={theme.success} />
            )}
            <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>
              {icsDownloaded ? 'Calendar Event (.ICS) Downloaded!' : 'Add to Calendar (.ICS Export)'}
            </Text>
          </TouchableOpacity>

          {/* Plan Another Circle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/groups')}
            style={[
              styles.secondaryActionBtn,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
            ]}
          >
            <Plus size={16} color={theme.textSecondary} />
            <Text style={[styles.secondaryActionText, { color: theme.textSecondary }]}>
              Plan Another Trip Circle
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <BottomTabBar />

      {/* Social Story 9:16 Preview Modal */}
      <SocialStoryModal
        visible={storyModalVisible}
        groupName={currentGroup.name}
        destinationName={option.name}
        dates={`${option.dateStart} - ${option.dateEnd}`}
        budget={`$${option.budgetPerPerson}`}
        participants={members.map((m) => m.userName)}
        tags={option.tags}
        isDarkMode={isDarkMode}
        onClose={() => setStoryModalVisible(false)}
      />
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
  shareHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  ticketCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18
  },
  ticketBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  ticketBrandText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  consensusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  consensusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2
  },
  cutoutLeft: {
    width: 16,
    height: 32,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16
  },
  dashedLine: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  cutoutRight: {
    width: 16,
    height: 32,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16
  },
  ticketBody: {
    padding: 20
  },
  circleNameLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  destinationTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5
  },
  destinationSub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18
  },
  metaCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1
  },
  metaCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 6
  },
  metaCardValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2
  },
  metaCardSub: {
    fontSize: 11,
    marginTop: 1
  },
  participantsSection: {
    marginBottom: 16
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  participantsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  participantChipText: {
    fontSize: 12,
    fontWeight: '700'
  },
  tagsSection: {
    marginTop: 4
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  actionsContainer: {
    gap: 10
  },
  primaryShareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.btn
  },
  primaryShareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700'
  }
});
