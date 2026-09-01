import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { ThemeToggle } from '../../../src/components/ThemeToggle';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Compass,
  Calendar,
  DollarSign,
  Tag,
  Ban,
  ShieldCheck,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react-native';

const AVAILABLE_TAGS = [
  { id: 'beach', label: 'Beach / Coastal', emoji: '🏖️' },
  { id: 'mountains', label: 'Mountains / Nature', emoji: '🏔️' },
  { id: 'city', label: 'City / Culture', emoji: '🏙️' },
  { id: 'relaxed', label: 'Relaxed / Low-key', emoji: '🌴' },
  { id: 'active', label: 'Active / Adventure', emoji: '🏃' },
  { id: 'budget-conscious', label: 'Budget-conscious', emoji: '💰' }
];

const BUDGET_PRESETS = [500, 750, 1000, 1500, 2500];

const DEALBREAKER_PRESETS = [
  'no camping',
  'no flights',
  'no cold',
  'no hostels',
  'strict budget'
];

export default function PreferencesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups = [],
    currentUserId = 'user-maya-001',
    members = [],
    savePreferenceDraft,
    submitPreferences
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'Trip Circle',
      inviteCode: 'PACT26',
      organizerId: currentUserId,
      status: 'voting' as const,
      totalMembersCount: 5
    };

  const existingMember = members.find((m) => m?.userId === currentUserId);

  // Form State
  const [dateStart, setDateStart] = useState(
    existingMember?.dateRanges?.[0]?.start || '2026-07-15'
  );
  const [dateEnd, setDateEnd] = useState(
    existingMember?.dateRanges?.[0]?.end || '2026-07-28'
  );
  const [budgetMin, setBudgetMin] = useState(existingMember?.budgetMin || 600);
  const [budgetMax, setBudgetMax] = useState(existingMember?.budgetMax || 1500);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingMember?.tags || ['beach', 'active', 'relaxed']
  );
  const [dealbreakers, setDealbreakers] = useState(
    existingMember?.dealbreakers?.join(', ') || ''
  );

  const [dateQuickChip, setDateQuickChip] = useState<'this' | 'next' | 'custom'>('custom');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const toggleTag = (tagId: string) => {
    triggerHaptic();
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      if (selectedTags.length >= 3) {
        Alert.alert('Limit Reached', 'You can select up to 3 preferred vibes.');
        return;
      }
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSelectBudgetPreset = (presetMax: number) => {
    triggerHaptic();
    setBudgetMax(presetMax);
    if (budgetMin >= presetMax) {
      setBudgetMin(Math.max(300, presetMax - 400));
    }
  };

  const handleToggleDealbreakerChip = (chip: string) => {
    triggerHaptic();
    const list = dealbreakers.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (list.includes(chip)) {
      setDealbreakers(list.filter((s) => s !== chip).join(', '));
    } else {
      setDealbreakers([...list, chip].join(', '));
    }
  };

  const handleQuickDateSelect = (type: 'this' | 'next') => {
    triggerHaptic();
    setDateQuickChip(type);
    if (type === 'this') {
      setDateStart('2026-07-10');
      setDateEnd('2026-07-20');
    } else {
      setDateStart('2026-08-01');
      setDateEnd('2026-08-15');
    }
  };

  const validate = () => {
    if (!dateStart || !dateEnd) {
      setValidationError('Please select valid start and end dates.');
      return false;
    }
    if (new Date(dateStart) > new Date(dateEnd)) {
      setValidationError('Start date must be before end date.');
      return false;
    }
    if (budgetMax < budgetMin) {
      setValidationError('Max budget must be greater than min budget.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSaveDraft = () => {
    triggerHaptic();
    savePreferenceDraft(currentGroup.id, {
      userId: currentUserId,
      dateRanges: [{ start: dateStart, end: dateEnd }],
      budgetMin,
      budgetMax,
      tags: selectedTags,
      dealbreakers: dealbreakers.split(',').map((s) => s.trim()).filter(Boolean)
    });
    setToastMessage('Draft constraints saved privately.');
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    triggerHaptic();
    setIsSubmitting(true);

    try {
      await submitPreferences({
        userId: currentUserId,
        userName: existingMember?.userName || 'Traveler',
        groupId: currentGroup.id,
        dateRanges: [{ start: dateStart, end: dateEnd }],
        budgetMin,
        budgetMax,
        tags: selectedTags,
        dealbreakers: dealbreakers.split(',').map((s) => s.trim()).filter(Boolean),
        submittedAt: new Date().toISOString()
      });

      router.push(`/groups/${currentGroup.id}/options` as any);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to submit preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* 4-Step Progress Journey */}
      <StepProgressBar currentStep={1} groupId={currentGroup.id} isDarkMode={isDarkMode} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top PACT Brand Header Frame Box */}
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

        {/* Privacy Shield Banner */}
        <View
          style={[
            styles.privacyShieldBanner,
            { backgroundColor: isDarkMode ? '#151D2A' : '#FFFFFF', borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={[styles.shieldIconCircle, { backgroundColor: theme.primaryLight }]}>
            <ShieldCheck size={20} color={theme.primary} />
          </View>
          <View style={styles.privacyTextCol}>
            <Text style={[styles.privacyTitle, { color: theme.textPrimary }]}>
              Zero-Peer-Pressure Shield Active
            </Text>
            <Text style={[styles.privacyDesc, { color: theme.textSecondary }]}>
              Your exact budget and dates are 100% private. Friends only see the resulting overlap consensus.
            </Text>
          </View>
        </View>

        {/* Toast / Validation Notice */}
        {Boolean(toastMessage) && (
          <View style={[styles.toastBox, { backgroundColor: theme.success }]}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {Boolean(validationError) && (
          <View style={[styles.errorBox, { backgroundColor: isDarkMode ? '#2D1515' : '#FEE2E2' }]}>
            <AlertCircle size={16} color={theme.danger} />
            <Text style={[styles.errorText, { color: theme.danger }]}>{validationError}</Text>
          </View>
        )}

        {/* Section 1: Availability Dates */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Calendar size={18} color={theme.primary} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Your Travel Window
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Any dates you could possibly make work
              </Text>
            </View>
          </View>

          {/* Quick Date Chips */}
          <View style={styles.quickChipRow}>
            <TouchableOpacity
              onPress={() => handleQuickDateSelect('this')}
              style={[
                styles.quickChip,
                dateQuickChip === 'this'
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: dateQuickChip === 'this' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                July 10–20
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickDateSelect('next')}
              style={[
                styles.quickChip,
                dateQuickChip === 'next'
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: dateQuickChip === 'next' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                August 1–15
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Inputs */}
          <View style={styles.dateInputsRow}>
            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                EARLIEST DEPARTURE
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={dateStart}
                onChangeText={(t) => {
                  setDateStart(t);
                  setDateQuickChip('custom');
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                LATEST RETURN
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={dateEnd}
                onChangeText={(t) => {
                  setDateEnd(t);
                  setDateQuickChip('custom');
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Section 2: Budget Ceiling */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <DollarSign size={18} color={theme.primary} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Comfortable Budget Range
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Per-person total for stay, food & transport
              </Text>
            </View>
          </View>

          {/* Budget Presets */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 6 }]}>
            QUICK MAX CEILING PRESETS
          </Text>
          <View style={styles.budgetPresetsRow}>
            {BUDGET_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => handleSelectBudgetPreset(preset)}
                style={[
                  styles.budgetPresetChip,
                  budgetMax === preset
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                <Text
                  style={[
                    styles.budgetPresetText,
                    { color: budgetMax === preset ? '#FFFFFF' : theme.textPrimary }
                  ]}
                >
                  ${preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateInputsRow}>
            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                MIN TARGET ($)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={String(budgetMin)}
                onChangeText={(t) => setBudgetMin(Number(t) || 0)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                HARD MAXIMUM ($)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={String(budgetMax)}
                onChangeText={(t) => setBudgetMax(Number(t) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Section 3: Vibe Preferences */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Tag size={18} color={theme.primary} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Trip Vibes ({selectedTags.length}/3)
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Select up to 3 preferred travel styles
              </Text>
            </View>
          </View>

          <View style={styles.tagsGrid}>
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  activeOpacity={0.8}
                  onPress={() => toggleTag(tag.id)}
                  style={[
                    styles.tagChip,
                    isSelected
                      ? { backgroundColor: theme.primary, borderColor: theme.primary }
                      : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                  ]}
                >
                  <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                  <Text
                    style={[
                      styles.tagLabel,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 4: Absolute Dealbreakers */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Ban size={18} color={theme.danger} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Non-Negotiable Vetoes
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Strict hard-stops that would prevent you from joining
              </Text>
            </View>
          </View>

          {/* Quick Dealbreaker Chips */}
          <View style={styles.dealbreakerChipsRow}>
            {DEALBREAKER_PRESETS.map((preset) => {
              const isSelected = dealbreakers.toLowerCase().includes(preset);
              return (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleToggleDealbreakerChip(preset)}
                  style={[
                    styles.dealbreakerChip,
                    isSelected
                      ? { backgroundColor: theme.danger, borderColor: theme.danger }
                      : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                  ]}
                >
                  <Text
                    style={[
                      styles.dealbreakerChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surfaceSubtle,
                color: theme.textPrimary,
                borderColor: theme.border,
                marginTop: 8
              }
            ]}
            value={dealbreakers}
            onChangeText={setDealbreakers}
            placeholder="e.g. no camping, no long drives, strict budget"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsCol}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[
              styles.submitBtn,
              { backgroundColor: theme.primary },
              shadows.glowPrimary
            ]}
          >
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Calculating Consensus...' : 'Submit & View Rankings'}
            </Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSaveDraft}
            style={[
              styles.draftBtn,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <BookmarkCheck size={16} color={theme.textSecondary} />
            <Text style={[styles.draftBtnText, { color: theme.textSecondary }]}>
              Save Draft Only
            </Text>
          </TouchableOpacity>
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
  privacyShieldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 14
  },
  shieldIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  privacyTextCol: {
    flex: 1
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  privacyDesc: {
    fontSize: 11,
    lineHeight: 15
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 12
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 12
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700'
  },
  card: {
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardHeaderTextCol: {
    flex: 1
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  cardSubtitle: {
    fontSize: 11
  },
  quickChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700'
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10
  },
  dateCol: {
    flex: 1
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  textInput: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  budgetPresetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  budgetPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  budgetPresetText: {
    fontSize: 11,
    fontWeight: '700'
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  tagEmoji: {
    fontSize: 14
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  dealbreakerChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6
  },
  dealbreakerChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  dealbreakerChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  actionButtonsCol: {
    gap: 10,
    marginTop: 4,
    marginBottom: 20
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  draftBtnText: {
    fontSize: 13,
    fontWeight: '700'
  }
});