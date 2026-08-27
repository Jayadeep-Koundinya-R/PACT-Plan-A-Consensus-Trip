import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  ShieldAlert,
  Check,
  Sparkles,
  Save
} from 'lucide-react-native';

const ALLOWED_TAGS = [
  'beach',
  'mountains',
  'city',
  'relaxed',
  'active',
  'budget-conscious'
] as const;

export default function PreferencesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    currentUserId,
    members,
    submitPreferences,
    savePreferenceDraft
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentMember = members.find((m) => m.userId === currentUserId);

  // Form State
  const [startDate, setStartDate] = useState(currentMember?.dateRanges[0]?.start || '2026-07-10');
  const [endDate, setEndDate] = useState(currentMember?.dateRanges[0]?.end || '2026-07-15');
  const [budgetMin, setBudgetMin] = useState(String(currentMember?.budgetMin || '400'));
  const [budgetMax, setBudgetMax] = useState(String(currentMember?.budgetMax || '900'));
  const [selectedTags, setSelectedTags] = useState<string[]>(currentMember?.tags || ['beach', 'relaxed']);
  const [dealbreakers, setDealbreakers] = useState(
    currentMember?.dealbreakers ? currentMember.dealbreakers.join(', ') : 'hiking, cold'
  );
  const [savedBanner, setSavedBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 3) {
        setErrorMsg('You can select a maximum of 3 preference tags.');
        setTimeout(() => setErrorMsg(''), 3000);
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveDraft = () => {
    savePreferenceDraft(id || 'default', {
      dateRanges: [{ start: startDate, end: endDate }],
      budgetMin: Number(budgetMin) || 400,
      budgetMax: Number(budgetMax) || 900,
      tags: selectedTags,
      dealbreakers: dealbreakers.split(',').map((s) => s.trim()).filter(Boolean)
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleSubmit = () => {
    const minVal = Number(budgetMin);
    const maxVal = Number(budgetMax);

    if (isNaN(minVal) || isNaN(maxVal) || minVal < 0 || maxVal < minVal) {
      setErrorMsg('Please enter a valid budget range (Min ≤ Max).');
      return;
    }

    if (selectedTags.length === 0) {
      setErrorMsg('Please choose at least 1 preference tag.');
      return;
    }

    submitPreferences({
      userId: currentUserId,
      userName: currentMember?.userName || 'User',
      avatarUrl: currentMember?.avatarUrl,
      dateRanges: [{ start: startDate, end: endDate }],
      budgetMin: minVal,
      budgetMax: maxVal,
      tags: selectedTags,
      dealbreakers: dealbreakers.split(',').map((s) => s.trim()).filter(Boolean),
      submittedAt: new Date().toISOString()
    });

    setSavedBanner(true);
    setTimeout(() => {
      router.push(`/groups/${id}/options`);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
            Submit Private Constraints
          </Text>

          <TouchableOpacity
            onPress={handleSaveDraft}
            style={[styles.saveDraftBtn, { backgroundColor: theme.surfaceSubtle }]}
          >
            <Save size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Privacy Assurance Banner */}
        <View style={[styles.privacyBanner, { backgroundColor: theme.primaryLight }]}>
          <Sparkles size={18} color={theme.primary} />
          <View style={styles.privacyBannerText}>
            <Text style={[styles.privacyBannerTitle, { color: theme.primaryDark }]}>
              Zero Peer Pressure & Private
            </Text>
            <Text style={[styles.privacyBannerSub, { color: theme.textSecondary }]}>
              Your individual constraints are NEVER visible to other members. The engine uses them only to rank shared compromises.
            </Text>
          </View>
        </View>

        {errorMsg ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight }]}>
            <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text>
          </View>
        ) : null}

        {savedBanner ? (
          <View style={[styles.successBanner, { backgroundColor: theme.successLight }]}>
            <Check size={16} color={theme.success} />
            <Text style={[styles.successText, { color: theme.success }]}>
              Preferences submitted successfully!
            </Text>
          </View>
        ) : null}

        {/* Section 1: Travel Dates */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <Calendar size={18} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Available Date Range
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Select the window of dates you could realistically travel:
          </Text>

          <View style={styles.dateInputsRow}>
            <View style={styles.dateField}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Earliest Departure
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.dateField}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Latest Return
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {/* Quick Preset Buttons */}
          <View style={styles.presetRow}>
            <TouchableOpacity
              onPress={() => {
                setStartDate('2026-07-10');
                setEndDate('2026-07-15');
              }}
              style={[styles.presetPill, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Text style={[styles.presetText, { color: theme.textSecondary }]}>
                Jul 10 - Jul 15
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStartDate('2026-07-12');
                setEndDate('2026-07-20');
              }}
              style={[styles.presetPill, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Text style={[styles.presetText, { color: theme.textSecondary }]}>
                Jul 12 - Jul 20
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStartDate('2026-07-15');
                setEndDate('2026-07-28');
              }}
              style={[styles.presetPill, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Text style={[styles.presetText, { color: theme.textSecondary }]}>
                Jul 15 - Jul 28
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Budget Range */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <DollarSign size={18} color={theme.success} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Budget Range Per Person ($USD)
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Options priced above your maximum will automatically be flagged.
          </Text>

          <View style={styles.budgetRow}>
            <View style={styles.budgetField}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Minimum ($)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={budgetMin}
                onChangeText={setBudgetMin}
                keyboardType="numeric"
                placeholder="400"
              />
            </View>

            <View style={styles.budgetField}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Maximum Cap ($)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.textPrimary,
                    borderColor: theme.border
                  }
                ]}
                value={budgetMax}
                onChangeText={setBudgetMax}
                keyboardType="numeric"
                placeholder="900"
              />
            </View>
          </View>
        </View>

        {/* Section 3: Preference Tags */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <Tag size={18} color={theme.secondary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Activity & Style Tags (Pick 2–3)
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            What kind of experience do you want? (Selected: {selectedTags.length}/3)
          </Text>

          <View style={styles.tagsGrid}>
            {ALLOWED_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  activeOpacity={0.7}
                  onPress={() => handleToggleTag(tag)}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surfaceSubtle,
                      borderColor: isSelected ? theme.primary : theme.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                    ]}
                  >
                    {isSelected ? '✓ ' : ''}#{tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 4: Non-Negotiable Dealbreakers */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.cardHeader}>
            <ShieldAlert size={18} color={theme.danger} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Dealbreakers (Optional)
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Non-negotiable dealbreakers that would prevent you from attending (comma separated).
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceSubtle,
                color: theme.textPrimary,
                borderColor: theme.border
              }
            ]}
            value={dealbreakers}
            onChangeText={setDealbreakers}
            placeholder="e.g. hiking, cold, camping, isolated"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Submit CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: theme.primary }, shadows.md]}
        >
          <Check size={18} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Submit My Constraints</Text>
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
  saveDraftBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    marginBottom: 16
  },
  privacyBannerText: {
    flex: 1
  },
  privacyBannerTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  privacyBannerSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16
  },
  errorBanner: {
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700'
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  successText: {
    fontSize: 13,
    fontWeight: '700'
  },
  card: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 14
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  dateField: {
    flex: 1
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  input: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600'
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 12
  },
  budgetField: {
    flex: 1
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '700'
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.btn,
    marginTop: 8
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
