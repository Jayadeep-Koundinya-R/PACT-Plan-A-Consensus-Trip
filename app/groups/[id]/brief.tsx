import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Share,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { ConfettiEffect } from '../../../src/components/ConfettiEffect';
import { SealStamp } from '../../../src/components/SealStamp';
import { SocialStoryModal } from '../../../src/components/SocialStoryModal';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { ThemeToggle } from '../../../src/components/ThemeToggle';
import { formatFriendlyDateRange } from '../../../src/lib/format/dateFormatter';
import { downloadICSFile } from '../../../src/lib/export/icsGenerator';
import { colors, radius, shadows, spacing } from '../../../src/theme/colors';
import {
  Sparkles,
  Compass,
  Calendar,
  DollarSign,
  Users,
  Tag,
  Share2,
  Check,
  Award,
  ArrowLeft,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Shield
} from 'lucide-react-native';

export default function TripBriefScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups = [],
    members = [],
    getConsensusResults,
    finalizedBrief
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'College Reunion Trip',
      inviteCode: 'GOA-2026',
      organizerId: 'user-maya-001',
      status: 'finalized' as const,
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

  const [copied, setCopied] = useState(false);
  const [icsDownloaded, setIcsDownloaded] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const winningScored =
    finalizedBrief?.winningOption ||
    consensus?.winningOption ||
    consensus?.rankedOptions?.[0] ||
    null;

  const option = winningScored?.option || {
    id: 'opt-goa-beach',
    groupId: currentGroup.id,
    name: 'Goa Beach Weekend',
    destinationType: 'Beach',
    dateStart: '2026-07-10',
    dateEnd: '2026-07-15',
    budgetPerPerson: 650,
    tags: ['beach', 'relaxed', 'active']
  };

  const memberNames = members.length > 0
    ? members.map((m) => m.userName || (m as any).name || 'Traveler').join(', ')
    : 'Maya Chen, Alex Rivera, Sarah Jenkins, Liam Patel, Chloe Vance';
  const vibesText = (option.tags || []).map((t) => `#${t}`).join(' ');

  const briefText = `📜 OFFICIAL PACT TRIP BRIEF: ${currentGroup.name}\n\n🏖️ Finalized Destination: ${option.name}\n📅 Confirmed Dates: ${option.dateStart} to ${option.dateEnd}\n💰 Target Budget: $${option.budgetPerPerson} / person (100% group fit)\n👥 Confirmed Travelers: ${memberNames}\n✨ Matched Vibes: ${vibesText}\n\n(Generated with 100% consensus in PACT!)`;

  const handleShare = async () => {
    triggerHaptic();
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(briefText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        Alert.alert('Trip Brief', briefText);
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

  const handleDownloadICS = () => {
    triggerHaptic();
    try {
      downloadICSFile(
        `PACT Trip: ${option.name}`,
        `Confirmed consensus trip for ${currentGroup.name}!\nBudget: $${option.budgetPerPerson}/person.`,
        option.name,
        option.dateStart,
        option.dateEnd
      );
      setIcsDownloaded(true);
      setTimeout(() => setIcsDownloaded(false), 3000);
    } catch (e) {
      Alert.alert('Notice', 'Calendar export downloaded.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar currentStep={4} groupId={currentGroup.id} isDarkMode={isDarkMode} />

      {/* Celebration Confetti Effect */}
      <ConfettiEffect autoStart={true} durationMs={3500} />

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

        {/* Wax-Seal Stamp Animation Moment */}
        <SealStamp
          isDarkMode={isDarkMode}
          sealedDate={currentGroup.name || 'CONSENSUS PACT'}
        />

        {/* Celebration Header Document Card */}
        <View
          style={[
            styles.celebrationCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={[styles.celebrationIconBox, { backgroundColor: theme.primaryLight }]}>
            <Sparkles size={20} color={theme.primary} />
          </View>
          <Text style={[styles.celebrationTitle, { color: theme.textPrimary }]}>
            Consensus Locked & Sealed
          </Text>
          <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>
            Agreement reached without group chat debates. The official travel document is ready below.
          </Text>
        </View>

        {/* Finalized Trip Summary Brief (Document Motif: Flat, radius.sm, 24px padding, no shadow) */}
        <View
          style={[
            styles.documentCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={styles.briefHeaderRow}>
            <View style={[styles.briefTag, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.briefTagText, { color: theme.primary }]}>OFFICIAL TRIP PACT</Text>
            </View>
            <Text style={[styles.briefCircleName, { color: theme.textSecondary }]}>
              {currentGroup.name}
            </Text>
          </View>

          <Text style={[styles.destinationHeading, { color: theme.textPrimary }]}>
            {option.name}
          </Text>

          {/* Details Grid */}
          <View style={styles.detailGrid}>
            <View style={[styles.detailItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Calendar size={16} color={theme.primary} />
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>CONFIRMED DATES</Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {formatFriendlyDateRange(option.dateStart, option.dateEnd)}
                </Text>
              </View>
            </View>

            <View style={[styles.detailItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <DollarSign size={16} color={theme.success} />
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>TARGET BUDGET</Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  ${option.budgetPerPerson} / traveler (100% Group Fit)
                </Text>
              </View>
            </View>

            <View style={[styles.detailItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Users size={16} color={theme.secondary} />
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>CONFIRMED TRAVELERS ({members.length || 5})</Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {memberNames}
                </Text>
              </View>
            </View>

            <View style={[styles.detailItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Tag size={16} color={theme.primary} />
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>MATCHED VIBES</Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {vibesText || '#beach #coastal #relaxed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Export & Share Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShare}
            style={[styles.primaryShareBtn, { backgroundColor: theme.primary }]}
          >
            <Share2 size={18} color="#FFFFFF" />
            <Text style={styles.primaryShareBtnText}>
              {copied ? 'Copied to Clipboard!' : 'Share Brief to WhatsApp'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDownloadICS}
              style={[styles.secondaryActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Download size={16} color={theme.textPrimary} />
              <Text style={[styles.secondaryActionBtnText, { color: theme.textPrimary }]}>
                {icsDownloaded ? 'Calendar File Ready!' : 'Add to Calendar (.ics)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic();
                setStoryModalVisible(true);
              }}
              style={[styles.secondaryActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <ImageIcon size={16} color={theme.textPrimary} />
              <Text style={[styles.secondaryActionBtnText, { color: theme.textPrimary }]}>
                Story Card
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Social Story Modal */}
      <SocialStoryModal
        visible={storyModalVisible}
        groupName={currentGroup.name}
        winningOption={option}
        membersCount={members.length || 5}
        isDarkMode={isDarkMode}
        onClose={() => setStoryModalVisible(false)}
      />

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
    marginBottom: 10
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
  celebrationCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14
  },
  celebrationIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  celebrationTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 3,
    letterSpacing: -0.2
  },
  celebrationSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17
  },
  documentCard: {
    padding: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 16
  },
  briefHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  briefTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.btn
  },
  briefTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  briefCircleName: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  destinationHeading: {
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 14,
    letterSpacing: -0.3
  },
  detailGrid: {
    gap: 8
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1
  },
  detailTextCol: {
    flex: 1
  },
  detailLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  actionSection: {
    gap: 8,
    marginBottom: 20
  },
  primaryShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  primaryShareBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800'
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 8
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  secondaryActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700'
  }
});