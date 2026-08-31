import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Share,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { ConfettiEffect } from '../../../src/components/ConfettiEffect';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { SocialStoryModal } from '../../../src/components/SocialStoryModal';
import { downloadICSFile } from '../../../src/lib/export/icsGenerator';
import { formatFriendlyDateRange } from '../../../src/lib/format/dateFormatter';
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
  CheckCircle2,
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
  const currentGroup =
    groups.find((g) => g.id === id) ||
    groups[0] || {
      id: id || 'demo',
      name: 'College Reunion Trip',
      inviteCode: 'GOA-2026',
      organizerId: 'user-maya-001',
      status: 'finalized' as const,
      totalMembersCount: 5
    };

  const consensus = getConsensusResults();
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

  const winningScored = finalizedBrief?.winningOption || consensus.winningOption || consensus.rankedOptions[0];
  const option = winningScored ? winningScored.option : {
    id: 'demo-opt',
    groupId: currentGroup.id,
    name: 'Goa Beach Weekend',
    destinationType: 'Beach',
    dateStart: '2026-07-10',
    dateEnd: '2026-07-15',
    budgetPerPerson: 650,
    tags: ['beach', 'relaxed', 'active']
  };

  const memberNames = members.map((m) => m.userName || (m as any).name || 'Traveler').join(', ');
  const vibesText = (option.tags || []).map((t) => `#${t}`).join(' ');

  const briefText = `📋 OFFICIAL PACT TRIP BRIEF: ${currentGroup.name}\n\n🏖️ Finalized Destination: ${option.name}\n📅 Confirmed Dates: ${option.dateStart} to ${option.dateEnd}\n💰 Target Budget: $${option.budgetPerPerson} / person (100% group fit)\n👥 Confirmed Travelers: ${memberNames}\n🏷️ Matched Vibes: ${vibesText}\n\n(Generated with 100% consensus in PACT!)`;

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
      Alert.alert('Notice', 'Calendar export is supported on web & native calendars.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ConfettiEffect active={true} />

      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar currentStep={4} groupId={currentGroup.id} isDarkMode={isDarkMode} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}`)}
            style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            Final Confirmed Trip Brief
          </Text>

          <View style={{ width: 36 }} />
        </View>

        {/* Celebration Banner */}
        <View
          style={[
            styles.celebrationCard,
            { backgroundColor: isDarkMode ? '#151D2A' : '#FFFFFF', borderColor: theme.border },
            shadows.md
          ]}
        >
          <View style={[styles.celebrationIconBox, { backgroundColor: theme.primary }]}>
            <Award size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.celebrationTitle, { color: theme.textPrimary }]}>
            Trip Locked In! 🎉
          </Text>
          <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>
            All travelers have reached 100% consensus. Zero compromises ignored.
          </Text>
        </View>

        {/* The Brief Document Card */}
        <View
          style={[
            styles.briefCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.briefHeaderRow}>
            <View style={[styles.briefTag, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5' }]}>
              <Text style={[styles.briefTagText, { color: theme.success }]}>CONFIRMED PLAN</Text>
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
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>TRAVEL DATES</Text>
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
                  ${option.budgetPerPerson} / person
                </Text>
              </View>
            </View>

            <View style={[styles.detailItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Users size={16} color={theme.secondary} />
              <View style={styles.detailTextCol}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>CONFIRMED TRAVELERS</Text>
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
                  {vibesText}
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
            style={[styles.primaryShareBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
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
                {icsDownloaded ? 'Added to Calendar!' : 'Add to Calendar (.ics)'}
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
        membersCount={members.length}
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
    paddingBottom: 140,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.2
  },
  celebrationCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 14
  },
  celebrationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.3
  },
  celebrationSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  briefCard: {
    padding: 18,
    borderRadius: radius.card,
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
    borderRadius: radius.pill
  },
  briefTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  briefCircleName: {
    fontSize: 12,
    fontWeight: '600'
  },
  destinationHeading: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 14,
    letterSpacing: -0.4
  },
  detailGrid: {
    gap: 10
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1
  },
  detailTextCol: {
    flex: 1
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700'
  },
  actionSection: {
    gap: 10,
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
    fontSize: 15,
    fontWeight: '800'
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 10
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
    fontSize: 13,
    fontWeight: '700'
  }
});