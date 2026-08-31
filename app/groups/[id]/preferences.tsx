import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  Sparkles
} from 'lucide-react-native';

const AVAILABLE_TAGS = [
  { id: 'beach', label: 'Beach / Coastal', emoji: 'ðŸ–ï¸' },
  { id: 'mountains', label: 'Mountains / Nature', emoji: 'â›°ï¸' },
  { id: 'city', label: 'City / Culture', emoji: 'ðŸ™ï¸' },
  { id: 'relaxed', label: 'Relaxed / Low-key', emoji: 'ðŸ˜Œ' },
  { id: 'active', label: 'Active / Adventure', emoji: 'ðŸƒ' },
  { id: 'budget-conscious', label: 'Budget-conscious', emoji: 'ðŸ’°' }
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
  const currentGroup = groups.find((g) => g.id === id) || groups[0] || { id: id || 'demo', name: 'Trip Circle', inviteCode: 'PACT26', organizerId: currentUserId, status: 'voting', totalMembersCount: 5 };
  const existingMember = members.find((m) => m.userId === currentUserId);

  // Form State
  const [dateStart, setDateStart] = useState(
    existingMember?.dateRanges[0]?.start || '2026-07-15'
  );
  const [dateEnd, setDateEnd] = useState(
    existingMember?.dateRanges[0]?.end || '2026-07-28'
  );
  const [budgetMin, setBudgetMin] = useState(existingMember?.budgetMin || 600);
  const [budgetMax, setBudgetMax] = useState(existingMember?.budgetMax || 1500);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingMember?.tags || ['beach', 'active', 'relaxed']
  );
  const [dealbreakers, setDealbreakers] = useState(
    existingMember?.dealbreakers.join(', ') || ''
  );

  const [dateQuickChip, setDateQuickChip] = useState<'this' | 'next' | 'custom'>('custom');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      if (selectedTags.length >= 3) {
        alert('You can select a maximum of 3 tags.');
        return;
      }
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSelectBudgetPreset = (presetMax: number) => {
    setBudgetMax(presetMax);
    if (budgetMin >= presetMax) {
      setBudgetMin(Math.max(300, presetMax - 400));
    }
  };

  const handleToggleDealbreakerChip = (chip: string) => {
    const list = dealbreakers.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (list.includes(chip)) {
      setDealbreakers(list.filter((s) => s !== chip).join(', '));
    } else {
      setDealbreakers([...list, chip].join(', '));
    }
  };

  const handleQuickDateChip = (type: 'this' | 'next' | 'custom') => {
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
    savePreferenceDraft(currentGroup.id, {
      userId: currentUserId,
      budgetMin,
      budgetMax,
      tags: selectedTags,
      dealbreakers: dealbreakers.split(',').map((s) => s.trim()).filter(Boolean)
    });
    setToastMessage('âœ“ Draft saved locally.');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleSubmit = async () => {
    await submitPreferences({
      userId: currentUserId,
      name: existingMember?.name || (existingMember as any)?.userName || 'Member',
      startDate: dateStart,
      endDate: dateEnd,
      budgetMin,
      budgetMax,
      preferredTags: selectedTags,
      dealbreakers: dealbreakers.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
      isFlexible: true,
      submittedAt: new Date().toISOString()
    });

    setToastMessage('ðŸŽ‰ Preferences submitted privately!');
    setTimeout(() => {
      setToastMessage('');
      router.push(`/groups/${currentGroup.id}/options`);
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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
            style={[styles.backBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            My Private Constraints
          </Text>

          <View style={{ width: 38 }} />
        </View>

        {/* Privacy Promise Banner */}
        <View
          style={[
            styles.privacyBanner,
            { backgroundColor: theme.primaryLight, borderColor: theme.primary }
          ]}
        >
          <ShieldCheck size={18} color={theme.primary} />
          <Text style={[styles.privacyBannerText, { color: theme.textPrimary }]}>
            <Text style={{ fontWeight: '800' }}>100% Private:</Text> Friends only see aggregated trip rankings. Your individual budget and dealbreakers are never revealed.
          </Text>
        </View>

        {toastMessage ? (
          <View style={[styles.toastBanner, { backgroundColor: theme.successLight }]}>
            <CheckCircle2 size={16} color={theme.success} />
            <Text style={[styles.toastText, { color: theme.success }]}>{toastMessage}</Text>
          </View>
        ) : null}

        {/* Section 1: Travel Dates */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.md
          ]}
        >
          <View style={styles.cardHeader}>
            <Calendar size={18} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              1. When are you free?
            </Text>
          </View>

          {/* Quick Date Chips */}
          <View style={styles.quickChipsRow}>
            <TouchableOpacity
              onPress={() => handleQuickDateChip('this')}
              style={[
                styles.quickChip,
                {
                  backgroundColor:
                    dateQuickChip === 'this' ? theme.primary : theme.surfaceElevated,
                  borderColor: dateQuickChip === 'this' ? theme.primary : theme.border
                }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: dateQuickChip === 'this' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                July Mid (10-15)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickDateChip('next')}
              style={[
                styles.quickChip,
                {
                  backgroundColor:
                    dateQuickChip === 'next' ? theme.primary : theme.surfaceElevated,
                  borderColor: dateQuickChip === 'next' ? theme.primary : theme.border
                }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: dateQuickChip === 'next' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                July Late (18-25)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setDateQuickChip('custom');
                setDateStart('2026-08-01');
                setDateEnd('2026-08-10');
              }}
              style={[
                styles.quickChip,
                {
                  backgroundColor:
                    dateStart === '2026-08-01' ? theme.primary : theme.surfaceElevated,
                  borderColor: dateStart === '2026-08-01' ? theme.primary : theme.border
                }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: dateStart === '2026-08-01' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                August (1-10)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDateQuickChip('custom')}
              style={[
                styles.quickChip,
                {
                  backgroundColor:
                    dateQuickChip === 'custom' && dateStart !== '2026-08-01'
                      ? theme.primary
                      : theme.surfaceElevated,
                  borderColor:
                    dateQuickChip === 'custom' && dateStart !== '2026-08-01'
                      ? theme.primary
                      : theme.border
                }
              ]}
            >
              <Text
                style={[
                  styles.quickChipText,
                  {
                    color:
                      dateQuickChip === 'custom' && dateStart !== '2026-08-01'
                        ? '#FFFFFF'
                        : theme.textSecondary
                  }
                ]}
              >
                Custom Range
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Input Fields */}
          <View style={styles.dateInputsRow}>
            <View style={styles.dateCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                EARLIEST DEPARTURE
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceElevated,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={dateStart}
                onChangeText={(val) => {
                  setDateStart(val);
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
                    backgroundColor: theme.surfaceElevated,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={dateEnd}
                onChangeText={(val) => {
                  setDateEnd(val);
                  setDateQuickChip('custom');
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Section 2: Budget */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.md
          ]}
        >
          <View style={styles.cardHeader}>
            <DollarSign size={18} color={theme.success} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              2. What's your budget range?
            </Text>
          </View>

          {/* Large Budget Display */}
          <View style={styles.budgetDisplayRow}>
            <Text style={[styles.budgetRangeText, { color: theme.primary }]}>
              ${budgetMin} â€” ${budgetMax}
            </Text>
            <Text style={[styles.perPersonLabel, { color: theme.textSecondary }]}>
              per person
            </Text>
          </View>

          {/* Interactive Min & Max Steppers */}
          <View style={styles.stepperContainer}>
            {/* Min Budget Control */}
            <View style={styles.stepperCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                MINIMUM BUDGET
              </Text>
              <View
                style={[
                  styles.stepperBox,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                ]}
              >
                <TouchableOpacity
                  onPress={() => setBudgetMin(Math.max(200, budgetMin - 50))}
                  style={styles.stepBtn}
                >
                  <Text style={[styles.stepBtnText, { color: theme.textPrimary }]}>âˆ’</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.stepperInput, { color: theme.textPrimary }]}
                  keyboardType="numeric"
                  value={String(budgetMin)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setBudgetMin(num);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setBudgetMin(Math.min(budgetMax - 50, budgetMin + 50))}
                  style={styles.stepBtn}
                >
                  <Text style={[styles.stepBtnText, { color: theme.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Max Budget Control */}
            <View style={styles.stepperCol}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                MAXIMUM BUDGET
              </Text>
              <View
                style={[
                  styles.stepperBox,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                ]}
              >
                <TouchableOpacity
                  onPress={() => setBudgetMax(Math.max(budgetMin + 50, budgetMax - 50))}
                  style={styles.stepBtn}
                >
                  <Text style={[styles.stepBtnText, { color: theme.textPrimary }]}>âˆ’</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.stepperInput, { color: theme.textPrimary }]}
                  keyboardType="numeric"
                  value={String(budgetMax)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setBudgetMax(num);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setBudgetMax(budgetMax + 50)}
                  style={styles.stepBtn}
                >
                  <Text style={[styles.stepBtnText, { color: theme.textPrimary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Preset Chips */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 8, marginTop: 12 }]}>
            QUICK MAX BUDGET PRESETS:
          </Text>
          <View style={styles.quickChipsRow}>
            {BUDGET_PRESETS.map((preset) => {
              const isSelected = budgetMax === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleSelectBudgetPreset(preset)}
                  style={[
                    styles.budgetPresetChip,
                    {
                      backgroundColor:
                        isSelected ? theme.success : theme.surfaceElevated,
                      borderColor: isSelected ? theme.success : theme.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.budgetPresetText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                    ]}
                  >
                    ${preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Tags */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.md
          ]}
        >
          <View style={styles.cardHeader}>
            <Tag size={18} color={theme.secondary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              3. What vibe do you want? (Pick up to 3)
            </Text>
          </View>

          <View style={styles.tagsGrid}>
            {AVAILABLE_TAGS.map((t) => {
              const isSelected = selectedTags.includes(t.id);
              return (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.7}
                  onPress={() => toggleTag(t.id)}
                  style={[
                    styles.tagCard,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surfaceElevated,
                      borderColor: isSelected ? theme.primary : theme.border
                    },
                    isSelected ? shadows.glowPrimary : {}
                  ]}
                >
                  <Text style={styles.tagEmoji}>{t.emoji}</Text>
                  <Text
                    style={[
                      styles.tagCardLabel,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        fontWeight: isSelected ? '800' : '600'
                      }
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 4: Dealbreakers with Quick Preset Chips */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.md
          ]}
        >
          <View style={styles.cardHeader}>
            <Ban size={18} color={theme.danger} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              4. Any hard no's or dealbreakers?
            </Text>
          </View>

          <Text style={[styles.dealbreakerHint, { color: theme.textSecondary }]}>
            Trips matching these will trigger an instant 0% score override.
          </Text>

          {/* Quick Dealbreaker Chips */}
          <View style={styles.quickChipsRow}>
            {DEALBREAKER_PRESETS.map((preset) => {
              const isChipActive = dealbreakers.toLowerCase().includes(preset);
              return (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleToggleDealbreakerChip(preset)}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: isChipActive ? theme.dangerLight : theme.surfaceElevated,
                      borderColor: isChipActive ? theme.danger : theme.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      { color: isChipActive ? theme.danger : theme.textSecondary }
                    ]}
                  >
                    ðŸš« #{preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surfaceElevated,
                color: theme.textPrimary,
                borderColor: theme.border
              }
            ]}
            value={dealbreakers}
            onChangeText={setDealbreakers}
            placeholder="e.g. no cold, no camping, no long flights"
            placeholderTextColor={theme.textMuted}
            maxLength={100}
          />
        </View>

        {/* Footer Actions: Save Draft & Submit */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveDraft}
            style={[
              styles.secondaryBtn,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
            ]}
          >
            <BookmarkCheck size={16} color={theme.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>
              Save Draft
            </Text>
          </TouchableOpacity>

          {validationError && (
            <View style={{ backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ban size={16} color="#EF4444" />
              <Text style={{ color: '#991B1B', fontSize: 13, fontWeight: '600', flex: 1 }}>{validationError}</Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[
              styles.submitBtn,
              { backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 },
              shadows.glowPrimary
            ]}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>{isSubmitting ? 'Submitting...' : 'Submit Constraints Privately'}</Text>
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
    padding: 16,
    paddingBottom: 140,
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
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 16
  },
  privacyBannerText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 16
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700'
  },
  formCard: {
    borderRadius: radius.card,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    gap: 12
  },
  dateCol: {
    flex: 1
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  textInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600'
  },
  budgetDisplayRow: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6
  },
  budgetRangeText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  perPersonLabel: {
    fontSize: 12,
    marginTop: 2
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  stepperCol: {
    flex: 1
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden'
  },
  stepBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '800'
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 8
  },
  budgetPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  budgetPresetText: {
    fontSize: 12,
    fontWeight: '700'
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1
  },
  tagEmoji: {
    fontSize: 16
  },
  tagCardLabel: {
    fontSize: 13
  },
  dealbreakerHint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.btn,
    borderWidth: 1
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
