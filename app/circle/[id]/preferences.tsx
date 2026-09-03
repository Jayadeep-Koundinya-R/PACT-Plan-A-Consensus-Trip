import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Lock, Plus, Check, Sliders } from 'lucide-react-native';

const BUDGET_PRESETS = [400, 600, 800, 1200, 1800, 2500];

export default function PactConstraintsForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    groups = [],
    currentUserId = 'user-maya-001',
    members = [],
    submitPreferences
  } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'Goa trip',
      inviteCode: 'GOA-4F82',
      organizerId: currentUserId,
      status: 'voting' as const,
      totalMembersCount: 5
    };

  const existingMember = members.find((m) => m?.userId === currentUserId);

  const [dateWindows, setDateWindows] = useState([
    { label: 'Oct 12 – Oct 18', active: true, start: '2026-10-12', end: '2026-10-18' },
    { label: 'Nov 02 – Nov 08', active: false, start: '2026-11-02', end: '2026-11-08' }
  ]);

  const [budget, setBudget] = useState(existingMember?.budgetMax || 800);

  const [vibes, setVibes] = useState<Record<string, boolean>>({
    'Beach & Coast': true,
    'Nightlife': false,
    'Mountain Trek': false,
    'Food & Dining': true,
    'Relaxing Spa': false
  });

  const [dealbreakers, setDealbreakers] = useState<Record<string, boolean>>({
    'No dorm hostels': true,
    'Flight time > 5 hrs': true,
    'Shared bathrooms': true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const addWindow = () => {
    triggerHaptic();
    setDateWindows((w) => [
      ...w,
      { label: 'Nov 16 – Nov 22', active: true, start: '2026-11-16', end: '2026-11-22' }
    ]);
  };

  const toggleDateWindow = (index: number) => {
    triggerHaptic();
    setDateWindows((w) =>
      w.map((item, i) => (i === index ? { ...item, active: !item.active } : item))
    );
  };

  const toggleVibe = (k: string) => {
    triggerHaptic();
    setVibes((v) => ({ ...v, [k]: !v[k] }));
  };

  const toggleDeal = (k: string) => {
    triggerHaptic();
    setDealbreakers((d) => ({ ...d, [k]: !d[k] }));
  };

  const handleBudgetAdjust = (delta: number) => {
    triggerHaptic();
    setBudget((b) => Math.max(200, Math.min(3000, b + delta)));
  };

  const sliderPct = Math.max(0, Math.min(100, ((budget - 200) / (3000 - 200)) * 100));

  const handleSubmit = async () => {
    triggerHaptic();
    setIsSubmitting(true);

    const activeDates = dateWindows.filter((w) => w.active).map((w) => ({ start: w.start, end: w.end }));
    const selectedVibes = Object.keys(vibes).filter((k) => vibes[k]);
    const selectedDeals = Object.keys(dealbreakers).filter((k) => dealbreakers[k]);

    try {
      await submitPreferences({
        userId: currentUserId,
        userName: existingMember?.userName || 'You',
        groupId: currentGroup.id,
        dateRanges: activeDates.length > 0 ? activeDates : [{ start: '2026-10-12', end: '2026-10-18' }],
        budgetMin: Math.max(200, budget - 400),
        budgetMax: budget,
        tags: selectedVibes,
        dealbreakers: selectedDeals,
        submittedAt: new Date().toISOString()
      });

      router.push(`/circle/${currentGroup.id}/ranked-matrix` as any);
    } catch (e: any) {
      router.push(`/circle/${currentGroup.id}/ranked-matrix` as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {currentGroup.name || 'Goa'} trip constraints
              </Text>
            </View>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Step 1 of 3</Text>
            </View>
          </View>

          {/* Privacy Guarantee Banner */}
          <View style={styles.privacyBanner}>
            <Svg width="15" height="15" viewBox="0 0 15 15">
              <Rect x="3.5" y="6.5" width="8" height="6.5" rx="1.5" fill="none" stroke="#3DE0A0" strokeWidth="1.3" />
              <Path d="M5.2 6.5V4.8a2.3 2.3 0 0 1 4.6 0v1.7" fill="none" stroke="#3DE0A0" strokeWidth="1.3" />
            </Svg>
            <Text style={styles.privacyBannerText}>
              100% private — individual budgets and dates are never shown to the group.
            </Text>
          </View>

          {/* 1. Date Windows Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Your available date windows</Text>
            <View style={styles.dateChipsRow}>
              {dateWindows.map((w, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.8}
                  onPress={() => toggleDateWindow(i)}
                  style={[
                    styles.dateChip,
                    w.active && { borderColor: '#3DE0A0', backgroundColor: 'rgba(61,224,160,0.08)' }
                  ]}
                >
                  <Text style={[styles.dateChipText, w.active && { color: '#3DE0A0' }]}>{w.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={addWindow}
                activeOpacity={0.7}
                style={styles.addDateChip}
              >
                <Text style={styles.addDateChipText}>+ Add alternate date window</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Maximum Budget Limit Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Maximum budget limit</Text>
            <View style={styles.budgetDisplayRow}>
              <Text style={styles.budgetNumber}>${budget.toLocaleString()}</Text>
              <Text style={styles.perPersonSub}> / person</Text>
            </View>

            {/* Custom Interactive Stepper / Preset Chips */}
            <View style={styles.budgetPresetsRow}>
              {BUDGET_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  activeOpacity={0.75}
                  onPress={() => {
                    triggerHaptic();
                    setBudget(p);
                  }}
                  style={[
                    styles.budgetPresetChip,
                    budget === p && { backgroundColor: '#FF5A5F', borderColor: '#FF5A5F' }
                  ]}
                >
                  <Text
                    style={[
                      styles.budgetPresetText,
                      budget === p && { color: '#2E0805', fontWeight: '700' }
                    ]}
                  >
                    ${p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Visual Budget Meter Bar */}
            <View style={styles.sliderTrackWrapper}>
              <View style={styles.sliderTrackBg}>
                <View style={[styles.sliderTrackFill, { width: `${sliderPct}%` }]} />
              </View>
              <View style={styles.budgetRangeRow}>
                <Text style={styles.rangeLimitText}>$200</Text>
                <Text style={styles.rangeLimitText}>$3,000</Text>
              </View>
            </View>

            <Text style={styles.budgetExplainerText}>
              The engine hides options above your limit without revealing this number.
            </Text>
          </View>

          {/* 3. Vibes Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>What's the vibe?</Text>
            <View style={styles.vibesGrid}>
              {Object.keys(vibes).map((v) => (
                <TouchableOpacity
                  key={v}
                  activeOpacity={0.8}
                  onPress={() => toggleVibe(v)}
                  style={[
                    styles.vibeChip,
                    vibes[v] && {
                      backgroundColor: '#FF5A5F',
                      borderColor: '#FF5A5F'
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.vibeChipText,
                      vibes[v] && { color: '#2E0805', fontWeight: '700' }
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 4. Strict Dealbreakers Card */}
          <View style={[styles.card, styles.dealbreakerCard]}>
            <Text style={styles.cardLabel}>Strict dealbreakers</Text>
            <Text style={styles.dealbreakerSub}>Any option with these is removed, no exceptions.</Text>

            <View style={styles.dealbreakersList}>
              {Object.keys(dealbreakers).map((k) => (
                <TouchableOpacity
                  key={k}
                  activeOpacity={0.8}
                  onPress={() => toggleDeal(k)}
                  style={[
                    styles.dealbreakerRow,
                    dealbreakers[k] && {
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      borderColor: 'rgba(239,68,68,0.35)'
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.dealSquare,
                      dealbreakers[k] && { backgroundColor: '#EF4444', borderWidth: 0 }
                    ]}
                  >
                    {dealbreakers[k] && (
                      <Svg width="10" height="10" viewBox="0 0 10 10">
                        <Path d="M2 2l6 6M8 2l-6 6" stroke="#2E0805" strokeWidth="1.6" strokeLinecap="round" />
                      </Svg>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dealLabel,
                      dealbreakers[k] ? { color: '#F4F3F0' } : { color: '#6C6F7A' }
                    ]}
                  >
                    {k}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Sticky Lock in Constraints Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.lockInButton}
          >
            <Svg width="14" height="14" viewBox="0 0 14 14">
              <Rect x="3" y="6.2" width="8" height="6" rx="1.3" fill="none" stroke="#2E0805" strokeWidth="1.3" />
              <Path d="M4.5 6.2V4.6a2.1 2.1 0 0 1 4.2 0v1.6" fill="none" stroke="#2E0805" strokeWidth="1.3" />
            </Svg>
            <Text style={styles.lockInButtonText}>
              {isSubmitting ? 'Calculating Consensus...' : 'Lock in constraints privately'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 16,
    color: '#F4F3F0',
    flex: 1
  },
  stepBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  stepBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#6C6F7A'
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(61,224,160,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(61,224,160,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 18
  },
  privacyBannerText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#3DE0A0',
    lineHeight: 16,
    flex: 1
  },
  card: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14
  },
  cardLabel: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F4F3F0',
    marginBottom: 12
  },
  dateChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  dateChip: {
    backgroundColor: '#0F1017',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  dateChipText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  addDateChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  addDateChipText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98'
  },
  budgetDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14
  },
  budgetNumber: {
    fontFamily: fontDisplay,
    fontSize: 32,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  perPersonSub: {
    fontFamily: fontUI,
    fontSize: 15,
    color: '#6C6F7A',
    marginLeft: 4
  },
  budgetPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  budgetPresetChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0F1017',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  budgetPresetText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#8B8D98'
  },
  sliderTrackWrapper: {
    marginBottom: 12
  },
  sliderTrackBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  sliderTrackFill: {
    height: '100%',
    backgroundColor: '#FF5A5F',
    borderRadius: 3
  },
  budgetRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  rangeLimitText: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#454857'
  },
  budgetExplainerText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A',
    lineHeight: 16,
    marginTop: 4
  },
  vibesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  vibeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)'
  },
  vibeChipText: {
    fontFamily: fontUIBold,
    fontSize: 12.5,
    color: '#8B8D98'
  },
  dealbreakerCard: {
    borderColor: 'rgba(239,68,68,0.3)',
    marginBottom: 20
  },
  dealbreakerSub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A',
    marginTop: -6,
    marginBottom: 14
  },
  dealbreakersList: {
    gap: 8
  },
  dealbreakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  dealSquare: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dealLabel: {
    fontFamily: fontUI,
    fontSize: 13
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  lockInButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  lockInButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2E0805'
  }
});