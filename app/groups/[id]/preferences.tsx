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
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { BottomTabBar } from '../../../src/components/BottomTabBar';
import { colors, radius, shadows, spacing } from '../../../src/theme/colors';
import {
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
  { id: 'relaxed', label: 'Relaxed / Low-key', emoji: '☕' },
  { id: 'active', label: 'Active / Adventure', emoji: '🏄' },
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
  const isEditing = Boolean(existingMember?.submittedAt);

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

  const isDateInvalid = Boolean(dateStart && dateEnd && new Date(dateStart) > new Date(dateEnd));
  const isBudgetInvalid = Boolean(budgetMax < budgetMin);

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
        {/* Top PACT Brand Header */}
        <ScreenHeader
          title="PACT"
          subtitle="PLAN A CONSENSUS TRIP"
          onBack={() => router.push(`/groups/${currentGroup.id}` as any)}
          isDarkMode={isDarkMode}
        />

        {/* Privacy Shield Banner (Document Style) */}
        <View
          style={[
            styles.privacyShieldBanner,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={[styles.shieldIconCircle, { backgroundColor: theme.successLight }]}>
            <ShieldCheck size={18} color={theme.success} />
          </View>
          <View style={styles.privacyTextCol}>
            <Text style={[styles.privacyTitle, { color: theme.textPrimary }]}>
              {isEditing ? 'Editing Your Private Pact' : 'Zero Peer Pressure Guarantee'}
            </Text>
            <Text style={[styles.privacyDesc, { color: theme.textSecondary }]}>
              {isEditing
                ? 'Your edits will immediately update group consensus rankings without notifying others of your exact limits.'
                : 'Your exact dates and numbers are encrypted. Friends only see the calculated group overlap.'}
            </Text>
          </View>
        </View>

        {toastMessage ? (
          <View style={[styles.toastBox, { backgroundColor: theme.success }]}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}

        {validationError ? (
          <View style={[styles.errorBox, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
            <AlertCircle size={16} color={theme.danger} />
            <Text style={[styles.errorText, { color: theme.danger }]}>{validationError}</Text>
          </View>
        ) : null}

        {/* 1. Date Flexibility Document Card */}
        <View
          style={[
            styles.documentCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
              <Calendar size={18} color={theme.primary} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                When can you travel?
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Select the widest window you are open to
              </Text>
            </View>
          </View>

          {/* Quick Date Presets */}
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
                  { color: dateQuickChip === 'this' ? '#FFFFFF' : theme.textPrimary }
                ]}
              >
                Mid July 2026
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
                  { color: dateQuickChip === 'next' ? '#FFFFFF' : theme.textPrimary }
                ]}
              >
                Early Aug 2026
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputsRow}>
            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>EARLIEST START</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: isDateInvalid ? theme.danger : theme.border
                  }
                ]}
                value={dateStart}
                onChangeText={(val) => {
                  setDateStart(val);
                  setDateQuickChip('custom');
                  if (validationError) setValidationError(null);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>LATEST END</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: isDateInvalid ? theme.danger : theme.border
                  }
                ]}
                value={dateEnd}
                onChangeText={(val) => {
                  setDateEnd(val);
                  setDateQuickChip('custom');
                  if (validationError) setValidationError(null);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          {isDateInvalid && (
            <Text style={[styles.inlineError, { color: theme.danger }]}>
              Start date must be before end date.
            </Text>
          )}
        </View>

        {/* 2. Budget Range Document Card */}
        <View
          style={[
            styles.documentCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
              <DollarSign size={18} color={theme.primary} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                What is your target budget?
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Strict ceiling per traveler (never shared directly)
              </Text>
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.budgetPresetsRow}>
            {BUDGET_PRESETS.map((p) => {
              const isSelected = budgetMax === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => handleSelectBudgetPreset(p)}
                  style={[
                    styles.budgetPresetChip,
                    isSelected
                      ? { backgroundColor: theme.primary, borderColor: theme.primary }
                      : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                  ]}
                >
                  <Text
                    style={[
                      styles.budgetPresetText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                    ]}
                  >
                    ${p} Max
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.dateInputsRow}>
            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>MIN ($)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: isBudgetInvalid ? theme.danger : theme.border
                  }
                ]}
                value={String(budgetMin)}
                onChangeText={(val) => {
                  setBudgetMin(Number(val) || 0);
                  if (validationError) setValidationError(null);
                }}
                keyboardType="numeric"
                placeholder="400"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>MAX CEILING ($)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: isBudgetInvalid ? theme.danger : theme.border
                  }
                ]}
                value={String(budgetMax)}
                onChangeText={(val) => {
                  setBudgetMax(Number(val) || 0);
                  if (validationError) setValidationError(null);
                }}
                keyboardType="numeric"
                placeholder="1200"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          {isBudgetInvalid && (
            <Text style={[styles.inlineError, { color: theme.danger }]}>
              Max budget must be greater than min budget.
            </Text>
          )}
        </View>

        {/* 3. Preferred Vibes Document Card */}
        <View
          style={[
            styles.documentCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
              <Tag size={18} color={theme.primary} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                What vibe do you want?
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Pick up to 3 ({selectedTags.length}/3 selected)
              </Text>
            </View>
          </View>

          <View style={styles.tagsGrid}>
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
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

        {/* 4. Dealbreakers Document Card */}
        <View
          style={[
            styles.documentCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.dangerLight }]}>
              <Ban size={18} color={theme.danger} />
            </View>
            <View style={styles.cardHeaderTextCol}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Any Dealbreakers?
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
              { backgroundColor: theme.primary }
            ]}
          >
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting
                ? 'Calculating Consensus...'
                : isEditing
                ? 'Update Constraints & Recalculate'
                : 'Submit & View Rankings'}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  privacyShieldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14
  },
  shieldIconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
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
    fontSize: 11.5,
    lineHeight: 16
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    marginBottom: 12
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 12
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  documentCard: {
    padding: 18,
    borderRadius: radius.sm,
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
    width: 34,
    height: 34,
    borderRadius: radius.sm,
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
    fontSize: 11.5
  },
  quickChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '800'
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
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  inlineError: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6
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
    borderRadius: radius.btn,
    borderWidth: 1
  },
  budgetPresetText: {
    fontSize: 11,
    fontWeight: '800'
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
    borderRadius: radius.btn,
    borderWidth: 1
  },
  tagEmoji: {
    fontSize: 14
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '800'
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
    borderRadius: radius.btn,
    borderWidth: 1
  },
  dealbreakerChipText: {
    fontSize: 11,
    fontWeight: '800'
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
    fontSize: 14.5,
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