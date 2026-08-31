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
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
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
    groups,
    currentUserId,
    members,
    savePreferenceDraft,
    submitPreferences
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup =
    groups.find((g) => g.id === id) ||
    groups[0] || {
      id: id || 'demo',
      name: 'Trip Circle',
      inviteCode: 'PACT26',
      organizerId: currentUserId,
      status: 'voting' as const,
      totalMembersCount: 5
    };

  const existingMember = members.find((m) => m.userId === currentUserId);

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

  const handleQuickDateChip = (type: 'this' | 'next' | 'custom') => {
    triggerHaptic();
    setDateQuickChip(type);
    if (type === 'this') {
      setDateStart('2026-07-10');
      setDateEnd('2026-07-15');
    } else if (type === 'next') {
      setDateStart('2026-07-18');
      setDateEnd('2026-07-25');
    }
  };

  const handleSaveDraft = () => {
    triggerHaptic();
    savePreferenceDraft(currentGroup.id, {
      userId: currentUserId,
      budgetMin,
      budgetMax,
      tags: selectedTags,
      dealbreakers: dealbreakers.split(',').map((s) => s.trim()).filter(Boolean)
    });
    setToastMessage('Draft saved locally.');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleSubmit = async () => {
    setValidationError(null);

    // Form Validations
    if (!dateStart || !dateEnd) {
      setValidationError('Please select your available start and end dates.');
      return;
    }
    if (new Date(dateStart) > new Date(dateEnd)) {
      setValidationError('Start date cannot be after end date.');
      return;
    }
    if (budgetMin > budgetMax) {
      setValidationError('Minimum budget cannot exceed maximum budget.');
      return;
    }
    if (selectedTags.length === 0) {
      setValidationError('Please select at least 1 vibe tag.');
      return;
    }

    triggerHaptic();
    setIsSubmitting(true);

    try {
      await submitPreferences({
        userId: currentUserId,
        userName: existingMember?.userName || (existingMember as any)?.name || 'You',
        dateRanges: [{ start: dateStart, end: dateEnd }],
        budgetMin,
        budgetMax,
        tags: selectedTags,
        dealbreakers: dealbreakers.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
        submittedAt: new Date().toISOString()
      });

      setToastMessage('Preferences submitted privately!');
      setTimeout(() => {
        setToastMessage('');
        router.push(`/groups/${currentGroup.id}/options`);
      }, 1000);
    } catch (e: any) {
      setValidationError(e?.message || 'Failed to submit preferences. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.topBorderLine, { backgroundColor: theme.primary }]} />
      {/* 4-Step Consensus Journey Progress Bar */}
      <StepProgressBar currentStep={1} groupId={currentGroup.id} isDarkMode={isDarkMode} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push(`/groups/${currentGroup.id}`)}
            style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            Your Private Constraints
          </Text>

          <View style={{ width: 36 }} />
        </View>

        {/* Privacy Promise Banner */}
        <View
          style={[
            styles.privacyBanner,
            { backgroundColor: isDarkMode ? '#151D2A' : '#FFFFFF', borderColor: theme.border },
            shadows.sm
          ]}
        >
          <ShieldCheck size={18} color={theme.primary} />
          <Text style={[styles.privacyBannerText, { color: theme.textSecondary }]}>
            Your real budget and dates are <Text style={{ fontWeight: '800', color: theme.textPrimary }}>never shown</Text> to the group. AI only uses them to find the winning compromise.
          </Text>
        </View>

        {/* Validation Error Banner */}
        {Boolean(validationError) && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        {/* Toast Feedback */}
        {Boolean(toastMessage) && (
          <View style={[styles.toastBox, { backgroundColor: theme.primary }]}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* 1. Date Constraints Card */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Calendar size={18} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              When are you free?
            </Text>
          </View>

          {/* Quick Date Chips */}
          <View style={styles.chipRow}>
            <TouchableOpacity
              onPress={() => handleQuickDateChip('this')}
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
                Jul 10 - Jul 15
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickDateChip('next')}
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
                Jul 18 - Jul 25
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickDateChip('custom')}
              style={[
                styles.quickChip,
                dateQuickChip === 'custom'
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: dateQuickChip === 'custom' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                Custom Range
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Inputs */}
          <View style={styles.inputPairRow}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>START DATE</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
                ]}
                value={dateStart}
                onChangeText={setDateStart}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>END DATE</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
                ]}
                value={dateEnd}
                onChangeText={setDateEnd}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
        </View>

        {/* 2. Budget Range Card */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <DollarSign size={18} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              What's your comfortable budget?
            </Text>
          </View>

          {/* Budget Presets */}
          <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginBottom: 8 }]}>
            QUICK CEILING PRESETS
          </Text>
          <View style={styles.chipRow}>
            {BUDGET_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => handleSelectBudgetPreset(preset)}
                style={[
                  styles.quickChip,
                  budgetMax === preset
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    { color: budgetMax === preset ? '#FFFFFF' : theme.textSecondary }
                  ]}
                >
                  ${preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Budget Inputs */}
          <View style={styles.inputPairRow}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>MIN BUDGET ($)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
                ]}
                value={String(budgetMin)}
                onChangeText={(t) => setBudgetMin(Number(t) || 0)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>MAX BUDGET ($)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
                ]}
                value={String(budgetMax)}
                onChangeText={(t) => setBudgetMax(Number(t) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* 3. Vibe Preferences Card */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Tag size={18} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Preferred Vibes (Max 3)
            </Text>
          </View>

          <View style={styles.tagGrid}>
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
                      styles.tagChipText,
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

        {/* 4. Dealbreakers Card */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Ban size={18} color="#EF4444" />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Dealbreakers (Automatic Veto)
            </Text>
          </View>
          <Text style={[styles.fieldSub, { color: theme.textSecondary }]}>
            Options violating any of your dealbreakers are scored zero for you.
          </Text>

          <View style={styles.chipRow}>
            {DEALBREAKER_PRESETS.map((preset) => {
              const isChecked = dealbreakers.toLowerCase().includes(preset);
              return (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleToggleDealbreakerChip(preset)}
                  style={[
                    styles.quickChip,
                    isChecked
                      ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }
                      : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                  ]}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      { color: isChecked ? '#EF4444' : theme.textSecondary }
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
              { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border, marginTop: 10 }
            ]}
            value={dealbreakers}
            onChangeText={setDealbreakers}
            placeholder="e.g. no overnight buses, strict budget"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSaveDraft}
            style={[styles.draftBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <BookmarkCheck size={16} color={theme.textSecondary} />
            <Text style={[styles.draftBtnText, { color: theme.textSecondary }]}>Save Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.submitBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Calculating...' : 'Submit Privately'}
            </Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
  topBorderLine: {
    height: 3,
    width: '100%'
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
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 14
  },
  privacyBannerText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: 14
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    flex: 1
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  formCard: {
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 14
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  fieldSub: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700'
  },
  inputPairRow: {
    flexDirection: 'row',
    gap: 10
  },
  inputCol: {
    flex: 1
  },
  textInput: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1
  },
  tagEmoji: {
    fontSize: 14
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 20
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  draftBtnText: {
    fontSize: 14,
    fontWeight: '700'
  },
  submitBtn: {
    flex: 1,
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
  }
});