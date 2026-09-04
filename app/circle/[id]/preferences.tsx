import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Path } from 'react-native-svg';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { useVoteStore, bandToMax, bandToMin } from '../../../src/store/useVoteStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { colors, radius } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Lock,
  Plus,
  Check,
  Sliders,
  ChevronDown,
  ChevronUp,
  Bed,
  Plane,
  Bath,
  ShieldAlert,
  Ban
} from 'lucide-react-native';
import { PactButton } from '../../../src/components/common';

interface DealbreakerMeta {
  label: string;
  sub: string;
  Icon: any;
}

const DEALBREAKER_METADATA: Record<string, DealbreakerMeta> = {
  'No dorm hostels': {
    label: 'No dorms',
    sub: 'Private rooms only',
    Icon: Bed
  },
  'Flight time > 5 hrs': {
    label: 'No red-eye flights',
    sub: 'Max 5h / direct',
    Icon: Plane
  },
  'Shared bathrooms': {
    label: 'No shared bath',
    sub: 'Ensuite required',
    Icon: Bath
  }
};

const BUDGET_PRESETS = [400, 600, 800, 1200, 1800, 2500];

const BUDGET_BANDS = [
  { key: 'under500' as const, label: 'Under $500', emoji: '💰', sub: 'Budget-friendly' },
  { key: '500to1000' as const, label: '$500 – $1,000', emoji: '✈️', sub: 'Mid-range' },
  { key: 'over1000' as const, label: '$1,000+', emoji: '🏝️', sub: 'Premium' }
];

export default function PactConstraintsForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = usePactHaptics();

  const {
    groups = [],
    currentUserId = 'user-maya-001',
    members = [],
    submitPreferences
  } = useGatherlyStore();

  const circleId = id || 'circle-college-reunion-2026';
  const draft = useVoteStore((s) => s.getDraft(circleId));
  const toggleDateWindow = useVoteStore((s) => s.toggleDateWindow);
  const addDateWindow = useVoteStore((s) => s.addDateWindow);
  const setBudgetBand = useVoteStore((s) => s.setBudgetBand);
  const setBudgetCustom = useVoteStore((s) => s.setBudgetCustom);
  const toggleFineTune = useVoteStore((s) => s.toggleFineTune);
  const toggleVibe = useVoteStore((s) => s.toggleVibe);
  const toggleDealbreaker = useVoteStore((s) => s.toggleDealbreaker);
  const markSubmitted = useVoteStore((s) => s.markSubmitted);

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: circleId,
      name: 'Goa trip',
      inviteCode: 'GOA-4F82',
      organizerId: currentUserId,
      status: 'voting' as const,
      totalMembersCount: 5
    };

  const existingMember = members.find((m) => m?.userId === currentUserId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute display budget from band or custom
  const displayBudget = bandToMax(draft.budgetBand, draft.budgetCustom);
  const sliderPct = Math.max(0, Math.min(100, ((draft.budgetCustom - 200) / (3000 - 200)) * 100));

  const handleAddWindow = () => {
    haptics.tap();
    addDateWindow(circleId, {
      label: 'Nov 16 – Nov 22',
      start: '2026-11-16',
      end: '2026-11-22',
      active: true
    });
  };

  // Reanimated 3 constraint lock-in bounce values
  const cardScale = useSharedValue(1);
  const borderFlash = useSharedValue(0);
  const checkmarkProgress = useSharedValue(0);

  const triggerPeakHaptic = () => {
    haptics.success();
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      borderColor: interpolateColor(
        borderFlash.value,
        [0, 1],
        ['transparent', '#3DE0A0']
      )
    };
  });

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: checkmarkProgress.value,
      transform: [{ scale: checkmarkProgress.value }]
    };
  });

  const handleBudgetAdjust = (delta: number) => {
    haptics.slider();
    setBudgetCustom(circleId, draft.budgetCustom + delta);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // 1. Reanimated 3 spring animation: scale 1 -> 0.96 -> 1 withSpring
    // Fire haptics.success() exactly at the peak of the spring bounce (at compression finished)
    cardScale.value = withSequence(
      withSpring(0.96, { damping: 10, stiffness: 280 }, (finished) => {
        if (finished) {
          runOnJS(triggerPeakHaptic)();
        }
      }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    // 2. Flash card border to Emerald (#3DE0A0)
    borderFlash.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(0, { duration: 500 })
    );

    // 3. Morph in checkmark
    checkmarkProgress.value = withSpring(1, { damping: 10, stiffness: 200 });

    const activeDates = draft.dateWindows
      .filter((w) => w.active)
      .map((w) => ({ start: w.start, end: w.end }));
    const selectedVibes = Object.keys(draft.vibes).filter((k) => draft.vibes[k]);
    const selectedDeals = Object.keys(draft.dealbreakers).filter((k) => draft.dealbreakers[k]);

    const budgetMax = bandToMax(draft.budgetBand, draft.budgetCustom);
    const budgetMin = bandToMin(draft.budgetBand, draft.budgetCustom);

    try {
      await submitPreferences({
        userId: currentUserId,
        userName: existingMember?.userName || 'You',
        groupId: currentGroup.id,
        dateRanges: activeDates.length > 0 ? activeDates : [{ start: '2026-10-12', end: '2026-10-18' }],
        budgetMin,
        budgetMax,
        tags: selectedVibes,
        dealbreakers: selectedDeals,
        submittedAt: new Date().toISOString()
      });
      markSubmitted(circleId);
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

          {/* Morphed-in Sealed Checkmark Banner */}
          <Animated.View style={[styles.successCheckmarkBanner, animatedCheckmarkStyle]} pointerEvents="none">
            <View style={styles.successCheckmarkCircle}>
              <Check size={16} color="#0B3B22" />
            </View>
            <Text style={styles.successCheckmarkText}>Constraints Locked & Sealed Privately</Text>
          </Animated.View>

          {/* Animated Main Cards Container */}
          <Animated.View style={[styles.mainCardWrapper, animatedCardStyle]}>
          {/* Privacy Guarantee Banner */}
          <View style={styles.privacyBanner}>
            <Svg width="15" height="15" viewBox="0 0 15 15">
              <Rect x="3.5" y="6.5" width="8" height="6.5" rx="1.5" fill="none" stroke="#3DE0A0" strokeWidth="1.3" />
              <Path d="M5.2 6.5V4.8a2.3 2.3 0 0 1 4.6 0v1.7" fill="none" stroke="#3DE0A0" strokeWidth="1.3" />
            </Svg>
            <Text style={styles.privacyBannerText}>
              100% private – individual budgets and dates are never shown to the group.
            </Text>
          </View>

          {/* 1. Date Windows — Horizontal Tap-to-Select Strip */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Your available date windows</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateStripContent}
            >
              {draft.dateWindows.map((w, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.tap();
                    toggleDateWindow(circleId, i);
                  }}
                  style={[
                    styles.dateStripCard,
                    w.active && styles.dateStripCardActive
                  ]}
                >
                  <View style={styles.dateStripTopRow}>
                    {w.active && (
                      <View style={styles.dateCheckCircle}>
                        <Check size={10} color="#0B3B22" />
                      </View>
                    )}
                    <Text style={[styles.dateStripMonth, w.active && { color: '#3DE0A0' }]}>
                      {w.label.split(' ')[0]}
                    </Text>
                  </View>
                  <Text style={[styles.dateStripRange, w.active && { color: '#F4F3F0' }]}>
                    {w.label}
                  </Text>
                  <Text style={[styles.dateStripDuration, w.active && { color: '#8B8D98' }]}>
                    7 nights
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={handleAddWindow}
                activeOpacity={0.7}
                style={styles.dateStripAdd}
              >
                <Plus size={16} color="#8B8D98" />
                <Text style={styles.dateStripAddText}>Add dates</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 2. Budget — Tap-to-Select Price Band Chips */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Maximum budget limit</Text>

            {/* Price Band Chips */}
            <View style={styles.bandChipsRow}>
              {BUDGET_BANDS.map((band) => {
                const isActive = draft.budgetBand === band.key;
                return (
                  <TouchableOpacity
                    key={band.key}
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.action();
                      setBudgetBand(circleId, band.key);
                    }}
                    style={[
                      styles.bandChip,
                      isActive && styles.bandChipActive
                    ]}
                  >
                    <Text style={styles.bandEmoji}>{band.emoji}</Text>
                    <View>
                      <Text style={[styles.bandLabel, isActive && { color: '#F4F3F0', fontWeight: '700' }]}>
                        {band.label}
                      </Text>
                      <Text style={[styles.bandSub, isActive && { color: '#8B8D98' }]}>
                        {band.sub}
                      </Text>
                    </View>
                    {isActive && (
                      <View style={styles.bandCheckCircle}>
                        <Check size={12} color="#0B3B22" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Fine-tune toggle */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                haptics.tap();
                toggleFineTune(circleId);
              }}
              style={styles.fineTuneToggle}
            >
              <Sliders size={13} color="#8B8D98" />
              <Text style={styles.fineTuneText}>Fine-tune exact amount</Text>
              {draft.showFineTune ? (
                <ChevronUp size={14} color="#8B8D98" />
              ) : (
                <ChevronDown size={14} color="#8B8D98" />
              )}
            </TouchableOpacity>

            {/* Collapsible fine-tune section */}
            {draft.showFineTune && (
              <View style={styles.fineTunePanel}>
                <View style={styles.budgetDisplayRow}>
                  <Text style={styles.budgetNumber}>${draft.budgetCustom.toLocaleString()}</Text>
                  <Text style={styles.perPersonSub}> / person</Text>
                </View>

                <View style={styles.budgetPresetsRow}>
                  {BUDGET_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      activeOpacity={0.75}
                      onPress={() => {
                        haptics.slider();
                        setBudgetCustom(circleId, p);
                      }}
                      style={[
                        styles.budgetPresetChip,
                        draft.budgetCustom === p && { backgroundColor: '#FF5A5F', borderColor: '#FF5A5F' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.budgetPresetText,
                          draft.budgetCustom === p && { color: '#2E0805', fontWeight: '700' }
                        ]}
                      >
                        ${p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.sliderTrackWrapper}>
                  <View style={styles.sliderTrackBg}>
                    <View style={[styles.sliderTrackFill, { width: `${sliderPct}%` }]} />
                  </View>
                  <View style={styles.budgetRangeRow}>
                    <Text style={styles.rangeLimitText}>$200</Text>
                    <Text style={styles.rangeLimitText}>$3,000</Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.budgetExplainerText}>
              The engine hides options above your limit without revealing this number.
            </Text>
          </View>

          {/* 3. Vibes Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>What's the vibe?</Text>
            <View style={styles.vibesGrid}>
              {Object.keys(draft.vibes).map((v) => (
                <TouchableOpacity
                  key={v}
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.tap();
                    toggleVibe(circleId, v);
                  }}
                  style={[
                    styles.vibeChip,
                    draft.vibes[v] && {
                      backgroundColor: '#FF5A5F',
                      borderColor: '#FF5A5F'
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.vibeChipText,
                      draft.vibes[v] && { color: '#2E0805', fontWeight: '700' }
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
            <View style={styles.dealbreakerHeaderRow}>
              <View>
                <Text style={styles.cardLabel}>Strict dealbreakers</Text>
                <Text style={styles.dealbreakerSub}>
                  Any option with these is removed, no exceptions.
                </Text>
              </View>
              <View style={styles.vetoCountBadge}>
                <Text style={styles.vetoCountText}>
                  {Object.values(draft.dealbreakers).filter(Boolean).length} Active Vetoes
                </Text>
              </View>
            </View>

            {/* Interactive Icon Tile Grid */}
            <View style={styles.dealbreakerGrid}>
              {Object.keys(draft.dealbreakers).map((k) => {
                const isVetoed = Boolean(draft.dealbreakers[k]);
                const meta = DEALBREAKER_METADATA[k] || {
                  label: k,
                  sub: 'Strict constraint',
                  Icon: ShieldAlert
                };
                const IconComponent = meta.Icon;

                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.82}
                    onPress={() => {
                      if (isVetoed) {
                        haptics.tap();
                      } else {
                        haptics.warning();
                      }
                      toggleDealbreaker(circleId, k);
                    }}
                    style={[
                      styles.dealbreakerTile,
                      isVetoed
                        ? styles.dealbreakerTileVetoed
                        : styles.dealbreakerTileAllowed
                    ]}
                  >
                    {/* Top Tile Row: Icon Box + Status Pill */}
                    <View style={styles.tileHeaderRow}>
                      <View
                        style={[
                          styles.tileIconBox,
                          isVetoed
                            ? styles.tileIconBoxVetoed
                            : styles.tileIconBoxAllowed
                        ]}
                      >
                        <IconComponent
                          size={18}
                          color={isVetoed ? '#EF4444' : '#3DE0A0'}
                        />
                      </View>

                      <View
                        style={[
                          styles.tileStatusBadge,
                          isVetoed
                            ? styles.tileStatusBadgeVetoed
                            : styles.tileStatusBadgeAllowed
                        ]}
                      >
                        {isVetoed ? (
                          <Ban size={9} color="#EF4444" style={{ marginRight: 3 }} />
                        ) : (
                          <Check size={9} color="#3DE0A0" style={{ marginRight: 3 }} />
                        )}
                        <Text
                          style={[
                            styles.tileStatusText,
                            isVetoed
                              ? styles.tileStatusTextVetoed
                              : styles.tileStatusTextAllowed
                          ]}
                        >
                          {isVetoed ? 'VETO' : 'ALLOWED'}
                        </Text>
                      </View>
                    </View>

                    {/* Tile Label & Subtitle */}
                    <Text
                      style={[
                        styles.tileTitle,
                        isVetoed ? styles.tileTitleVetoed : styles.tileTitleAllowed
                      ]}
                      numberOfLines={1}
                    >
                      {meta.label}
                    </Text>
                    <Text
                      style={[
                        styles.tileSubtitle,
                        isVetoed
                          ? styles.tileSubtitleVetoed
                          : styles.tileSubtitleAllowed
                      ]}
                      numberOfLines={1}
                    >
                      {meta.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          </Animated.View>
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

  /* === Date Strip === */
  dateStripContent: {
    gap: 10,
    paddingRight: 4
  },
  dateStripCard: {
    width: 130,
    backgroundColor: '#0F1017',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center'
  },
  dateStripCardActive: {
    borderColor: '#3DE0A0',
    backgroundColor: 'rgba(61,224,160,0.06)'
  },
  dateStripTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  dateCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3DE0A0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateStripMonth: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#6C6F7A',
    letterSpacing: 0.4
  },
  dateStripRange: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#8B8D98',
    marginBottom: 2
  },
  dateStripDuration: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#454857'
  },
  dateStripAdd: {
    width: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14
  },
  dateStripAddText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },

  /* === Budget Bands === */
  bandChipsRow: {
    gap: 8,
    marginBottom: 12
  },
  bandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F1017',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 14
  },
  bandChipActive: {
    borderColor: '#FF5A5F',
    backgroundColor: 'rgba(255,90,95,0.08)'
  },
  bandEmoji: {
    fontSize: 20
  },
  bandLabel: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8B8D98'
  },
  bandSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#454857',
    marginTop: 1
  },
  bandCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto'
  },

  /* === Fine-tune toggle === */
  fineTuneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 4
  },
  fineTuneText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    flex: 1
  },
  fineTunePanel: {
    marginTop: 4
  },

  /* === Budget fine-tune (existing stepper) === */
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

  /* === Vibes === */
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

  /* === Dealbreakers Icon Tile Grid === */
  dealbreakerCard: {
    borderColor: 'rgba(239,68,68,0.25)',
    marginBottom: 20
  },
  dealbreakerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  dealbreakerSub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A',
    marginTop: 2
  },
  vetoCountBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  vetoCountText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#EF4444',
    letterSpacing: 0.3
  },
  dealbreakerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  dealbreakerTile: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5
  },
  dealbreakerTileVetoed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#EF4444'
  },
  dealbreakerTileAllowed: {
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderColor: 'rgba(61, 224, 160, 0.35)'
  },
  tileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  tileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileIconBoxVetoed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)'
  },
  tileIconBoxAllowed: {
    backgroundColor: 'rgba(61, 224, 160, 0.15)'
  },
  tileStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: radius.pill
  },
  tileStatusBadgeVetoed: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)'
  },
  tileStatusBadgeAllowed: {
    backgroundColor: 'rgba(61, 224, 160, 0.18)'
  },
  tileStatusText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    letterSpacing: 0.6
  },
  tileStatusTextVetoed: {
    color: '#EF4444'
  },
  tileStatusTextAllowed: {
    color: '#3DE0A0'
  },
  tileTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    marginBottom: 2
  },
  tileTitleVetoed: {
    color: '#F4F3F0'
  },
  tileTitleAllowed: {
    color: '#F4F3F0'
  },
  tileSubtitle: {
    fontFamily: fontUI,
    fontSize: 11
  },
  tileSubtitleVetoed: {
    color: 'rgba(239, 68, 68, 0.9)'
  },
  tileSubtitleAllowed: {
    color: '#8B8D98'
  },

  /* === Bottom Bar === */
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