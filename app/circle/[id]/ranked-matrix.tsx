import { CircleRouteGuard } from '../../../src/components/common';
import { SkeletonLoader } from '../../../src/components/SkeletonLoader';
import { EmptyState } from '../../../src/components/EmptyState';
import React, { useState, useEffect } from 'react';
import { fetchCompromiseWhisperer, CompromiseWhispererResult } from '../../../src/lib/ai/aiAdvisorClient';
import { sendPactNotification, buildNudgeNotification } from '../../../src/lib/notifications/pactNotifications';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { ExplorePlaceSection } from '../../../src/components/ExplorePlaceSection';
import { PactButton } from '../../../src/components/common';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { generateConsensusExplanation } from '../../../src/lib/consensus/engine';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import {
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Check,
  ChevronRight,
  X,
  Calendar,
  DollarSign,
  Vote,
  ShieldAlert,
  Send,
  Trophy,
  Layers,
  RefreshCw
} from 'lucide-react-native';

export default function PactConsensusResults() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }
  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], members = [], activeDemoScenario = "early_bird" } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: (id && id !== 'undefined') ? id : 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82',
      totalMembersCount: 5
    };

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  // Deadlock state management
  const [deadlockModeLocal, setDeadlockModeLocal] = useState<boolean | null>(null);
  const deadlockMode = deadlockModeLocal !== null ? deadlockModeLocal : (activeDemoScenario === 'deadlock');
  const setDeadlockMode = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      setDeadlockModeLocal((prev) => val(prev !== null ? prev : (activeDemoScenario === 'deadlock')));
    } else {
      setDeadlockModeLocal(val);
    }
  };

  const [privateNudgeSent, setPrivateNudgeSent] = useState(false);
  const [whispererResult, setWhispererResult] = useState<CompromiseWhispererResult | null>(null);

  useEffect(() => {
    let mounted = true;
    if (deadlockMode) {
      const dest = currentGroup?.name || 'Goa';
      // Strictly anonymized, aggregated group data only — NEVER individual entries or names
      fetchCompromiseWhisperer(dest, 5, {
        budgetBuckets: { '$400–$600': 2, '$800–$1,200': 3 },
        commonDates: 'Oct 14–16 (100% overlap)',
        dealbreakerSummary: '1 member requested private en-suite room'
      })
        .then((res) => {
          if (mounted) setWhispererResult(res);
        })
        .catch(() => {
          if (mounted) setLoadError('Unable to refresh AI Compromise. Displaying fallback resolution.');
        });
    }
    return () => {
      mounted = false;
    };
  }, [deadlockMode, currentGroup?.name]);

  // Budget calculations for Wide Budget Gap Banner
  const budgetCaps = members.length > 0 ? members.map((m) => m.budgetMax) : [600, 2000, 1200, 500, 1800];
  const minBudget = Math.min(...budgetCaps);
  const maxBudget = Math.max(...budgetCaps);
  const budgetSpread = maxBudget - minBudget;
  const hasWideBudgetGap = budgetSpread > 1000;

  const totalMemberCount = members.length || currentGroup.totalMembersCount || 5;
  const checklist = [
    `Dates: 100% date window overlap across all ${totalMemberCount} members`,
    `Budget: fits all ${totalMemberCount} member caps privately`,
    'Vibes: beach, nightlife & seafood matched'
  ];

  const handleProceedToSilentVoting = () => {
    haptics.action();
    router.push(`/circle/${currentGroup.id}/silent-ballot` as any);
  };

  const handleSendPrivateNudge = () => {
    haptics.action();
    setPrivateNudgeSent(true);
    try {
      const notification = buildNudgeNotification('A member', currentGroup?.name || 'Goa trip');
      sendPactNotification(notification);
    } catch {}
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Private Nudge Sent',
        "An anonymous notification was dispatched: \"A member hasn't responded yet.\" Zero names, budgets, or personal veto details revealed."
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <View style={styles.phoneFrame}>
          <View style={styles.scrollContent}>
            <View style={styles.headerRow}>
              <View style={styles.backBtn}>
                <ArrowLeft size={18} color="#F4F3F0" />
              </View>
              <Text style={styles.headerTitle}>Calculating Consensus...</Text>
            </View>
            <SkeletonLoader count={3} height={130} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push(`/circle/${currentGroup.id}/hub` as any);
                }
              }}
              activeOpacity={0.7}
              style={styles.backBtn}
              accessibilityLabel="Go back to Circle Hub"
            >
              <ArrowLeft size={18} color="#F4F3F0" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>Ranked Matrix</Text>
              <Text style={styles.headerSub}>Deterministic Group Consensus</Text>
            </View>

            {/* Simulation toggle button for testers */}
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                setDeadlockMode((prev) => !prev);
              }}
              activeOpacity={0.7}
              style={styles.simulationBtn}
              accessibilityLabel="Toggle deadlock simulation"
            >
              <RefreshCw size={11} color={deadlockMode ? '#EF4444' : '#8B8D98'} />
              <Text style={[styles.simulationBtnText, { color: deadlockMode ? '#EF4444' : '#8B8D98' }]}>
                {deadlockMode ? 'Deadlock' : 'Simulate'}
              </Text>
            </TouchableOpacity>
          </View>

          {loadError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{loadError}</Text>
            </View>
          )}

          {/* Wide Budget Gap Banner */}
          {hasWideBudgetGap && !deadlockMode && (
            <View style={styles.wideBudgetBanner}>
              <View style={styles.wideBudgetHeaderRow}>
                <View style={styles.wideBudgetIconBox}>
                  <AlertTriangle size={15} color="#F59E0B" />
                </View>
                <Text style={styles.wideBudgetTitle}>
                  Wide Budget Spread (${minBudget} – ${maxBudget})
                </Text>
              </View>
              <Text style={styles.wideBudgetDesc}>
                A ${budgetSpread} spread exists between individual caps. Consensus engine automatically adjusted room allocations.
              </Text>
            </View>
          )}

          {/* Deadlock / Vetoed Fallback Card OR Normal Ranked Destinations */}
          {deadlockMode ? (
            <View style={styles.deadlockCard}>
              <View style={styles.deadlockHeaderRow}>
                <View style={styles.deadlockAlertIcon}>
                  <ShieldAlert size={20} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.deadlockTitle}>AI Compromise Whisperer</Text>
                    {whispererResult?.source === 'gemini_live' && (
                      <View style={styles.whispererLiveBadge}>
                        <Text style={styles.whispererLiveBadgeText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.deadlockSubtitle}>
                    {whispererResult?.anonymizedSummary || 'Analyzed 5 sealed ballots: 2 members capped at $600, 3 at $1,200.'}
                  </Text>
                </View>
              </View>

              {/* Anonymized Privacy Policy Note */}
              <View style={styles.privacyGuaranteeBadge}>
                <Text style={styles.privacyGuaranteeText}>
                  🔒 Privacy Boundary: Individual member names and exact budget caps are sealed.
                </Text>
              </View>

              {/* AI Whisperer Recommendation */}
              <View style={styles.whispererBox}>
                <View style={styles.whispererBoxHeader}>
                  <Sparkles size={13} color="#3DE0A0" />
                  <Text style={styles.whispererBoxTag}>Recommended compromise</Text>
                </View>
                <Text style={styles.whispererBoxText}>
                  {whispererResult?.compromise || 'Booking a 5-bedroom private villa with en-suite bathrooms in South Goa bridges accommodation constraints while preserving 100% date overlap (Oct 14–16). Tiered room splits maintain budget fairness.'}
                </Text>
              </View>

              {/* Resolution Action */}
              <View style={styles.resolutionPathBox}>
                <Text style={styles.resolutionPathNumber}>Resolution path — private nudge</Text>
                <PactButton
                  variant="glass"
                  onPress={handleSendPrivateNudge}
                  icon={<Send size={13} color="#F4F3F0" />}
                >
                  {privateNudgeSent ? 'Private Nudge Dispatched ✓' : 'Send generic private nudge'}
                </PactButton>
                <Text style={styles.resolutionPathDetail}>
                  Anonymously nudges members with pending room constraints. Zero names, budgets, or personal veto details revealed.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* #1 Winner Hero Card */}
              <View style={styles.winnerCard}>
                <View style={styles.winnerCardCoverBox}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800' }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                  <View style={styles.winnerCardCoverOverlay} />
                  <View style={styles.winnerBadgeRow}>
                    <View style={styles.winnerBadge}>
                      <Trophy size={13} color="#052E20" />
                      <Text style={styles.winnerBadgeText}>#1 Top Choice (96% Match)</Text>
                    </View>
                  </View>

                  <View style={styles.winnerTitleBox}>
                    <Text style={styles.winnerDestName}>Goa, India</Text>
                    <Text style={styles.winnerMetaText}>Oct 14 – Oct 19  •  $540 / person</Text>
                  </View>
                </View>

                <View style={styles.winnerBody}>
{(() => {
                    const topScoredOption = {
                      option: {
                        id: 'opt-goa-01',
                        groupId: currentGroup.id,
                        name: 'Goa',
                        destinationType: 'Beach & Culture',
                        dateStart: '2026-10-14',
                        dateEnd: '2026-10-19',
                        budgetPerPerson: 540,
                        tags: ['beach', 'nightlife', 'seafood']
                      },
                      rank: 1,
                      totalScore: 96,
                      consensusPercent: 100,
                      budgetGapFlag: false,
                      budgetGapCount: 0,
                      dateConflictCount: 0,
                      dealbreakerHitCount: 0,
                      memberBreakdowns: members.map((m) => ({
                        userId: m.userId,
                        userName: m.userName,
                        dateScore: 1.0,
                        dateOverlapDays: 5,
                        tripDurationDays: 5,
                        budgetScore: 1.0,
                        tagScore: 1.0,
                        matchedTags: ['beach'],
                        dealbreakerHit: false,
                        memberScore: 1.0,
                        isViable: true
                      })),
                      plainEnglishReason: 'Unanimous 100% agreement across all members.'
                    };

                    const explanation = generateConsensusExplanation(topScoredOption);

                    return (
                      <View style={styles.explanationBox} accessibilityRole="summary">
                        <Text style={styles.explanationHeadline}>{explanation.headline}</Text>
                        <Text style={styles.explanationSummary}>{explanation.summary}</Text>
                        <View style={styles.checklistContainer}>
                          {explanation.keyFactors.map((factor, idx) => (
                            <View key={idx} style={styles.checkRow}>
                              <View style={styles.checkCircle}>
                                <Check size={11} color="#3DE0A0" />
                              </View>
                              <Text style={styles.checkItemText}>{factor}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })()}

                  <View style={{ marginTop: 12 }}>
                    <ExplorePlaceSection destination="Goa" />
                  </View>
                </View>
              </View>

              {/* #2 Alternative Option Ticket Card */}
              <View style={styles.subOptionWrapper}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.tap();
                    setSelectedDetails({
                      name: 'Puducherry, India',
                      dates: 'Oct 12 - Oct 17, 2026',
                      cost: '$480 / person',
                      match: '82%',
                      reasons: [
                        'Full date overlap for 4 of 5 travelers',
                        'Budget fits comfortably at $480/traveler',
                        'French colonial heritage and coastal cafes'
                      ]
                    });
                  }}
                  style={styles.subOptionCard}
                  accessibilityLabel="View Puducherry details"
                >
                  <View style={styles.subOptionStub}>
                    <Text style={[styles.subOptionScore, { color: '#3DE0A0' }]}>82%</Text>
                    <Text style={styles.subOptionStubLabel}>match</Text>
                  </View>

                  <View style={styles.subOptionPerforation} />

                  <View style={styles.subOptionMain}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300' }}
                      style={styles.subOptionThumb}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.alternativeBadge}>
                        <Text style={styles.alternativeBadgeText}>#2 Alternative</Text>
                      </View>
                      <Text style={styles.subOptionName}>Puducherry, India</Text>
                      <Text style={styles.subOptionMeta}>Oct 12 - Oct 17  |  $480 / person</Text>
                    </View>
                    <ChevronRight size={16} color="#8B8D98" />
                  </View>
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                  <ExplorePlaceSection destination="Puducherry" />
                </View>
              </View>

              {/* #3 Alternative Option Ticket Card */}
              <View style={styles.subOptionWrapper}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    haptics.tap();
                    setSelectedDetails({
                      name: 'Manali, Himachal Pradesh',
                      dates: 'Oct 15 - Oct 20, 2026',
                      cost: '$620 / person',
                      match: '74%',
                      reasons: [
                        'Mountain adventure vibe matched',
                        'Flights + mountain transfers fit 4 of 5 members',
                        'Snow valley views and high-altitude cafes'
                      ]
                    });
                  }}
                  style={styles.subOptionCard}
                  accessibilityLabel="View Manali details"
                >
                  <View style={styles.subOptionStub}>
                    <Text style={[styles.subOptionScore, { color: '#3DE0A0' }]}>74%</Text>
                    <Text style={styles.subOptionStubLabel}>match</Text>
                  </View>

                  <View style={styles.subOptionPerforation} />

                  <View style={styles.subOptionMain}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300' }}
                      style={styles.subOptionThumb}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.alternativeBadge}>
                        <Text style={styles.alternativeBadgeText}>#3 Alternative</Text>
                      </View>
                      <Text style={styles.subOptionName}>Manali, Himachal</Text>
                      <Text style={styles.subOptionMeta}>Oct 15 - Oct 20  |  $620 / person</Text>
                    </View>
                    <ChevronRight size={16} color="#8B8D98" />
                  </View>
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                  <ExplorePlaceSection destination="Manali" />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleProceedToSilentVoting}
            disabled={deadlockMode}
            style={[
              styles.proceedButton,
              deadlockMode && { opacity: 0.4 }
            ]}
            accessibilityLabel="Proceed to Silent Voting"
          >
            <Vote size={18} color="#2E0805" />
            <Text style={styles.proceedButtonText}>
              Proceed to Silent Voting
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Details Breakdown Modal */}
      <Modal
        visible={Boolean(selectedDetails)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedDetails(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDetails?.name}</Text>
              <TouchableOpacity
                onPress={() => setSelectedDetails(null)}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close details"
              >
                <X size={18} color="#8B8D98" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalMetaRow}>
              <View style={styles.modalMetaBadge}>
                <Calendar size={13} color="#3DE0A0" />
                <Text style={styles.modalMetaBadgeText}>{selectedDetails?.dates}</Text>
              </View>

              <View style={styles.modalMetaBadge}>
                <DollarSign size={13} color="#3DE0A0" />
                <Text style={styles.modalMetaBadgeText}>{selectedDetails?.cost}</Text>
              </View>
            </View>

            <View style={styles.modalChecklist}>
              {selectedDetails?.reasons?.map((r: string, i: number) => (
                <View key={i} style={styles.modalCheckRow}>
                  <Check size={14} color="#3DE0A0" />
                  <Text style={styles.modalCheckText}>{r}</Text>
                </View>
              ))}
            </View>

            <PactButton
              variant="glass"
              onPress={() => setSelectedDetails(null)}
            >
              Close
            </PactButton>
          </View>
        </View>
      </Modal>
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
    height: '100%',
    backgroundColor: '#050608'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  headerSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  simulationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  simulationBtnText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '700'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14
  },
  errorText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#EF4444',
    textAlign: 'center'
  },
  wideBudgetBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  wideBudgetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  wideBudgetIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  wideBudgetTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F59E0B'
  },
  wideBudgetDesc: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#B4B6C0',
    lineHeight: 17
  },
  deadlockCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12
  },
  deadlockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  deadlockAlertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deadlockTitle: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#EF4444'
  },
  deadlockSubtitle: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98',
    marginTop: 2
  },
  whispererLiveBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#3DE0A0'
  },
  whispererLiveBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 8,
    color: '#050608'
  },
  privacyGuaranteeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  privacyGuaranteeText: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98'
  },
  whispererBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)'
  },
  whispererBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  whispererBoxTag: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#3DE0A0',
    letterSpacing: 0.8
  },
  whispererBoxText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#F4F3F0',
    lineHeight: 18
  },
  resolutionPathBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 12,
    gap: 8
  },
  resolutionPathNumber: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#8B8D98',
    letterSpacing: 0.8
  },
  resolutionPathDetail: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    lineHeight: 15
  },
  winnerCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.4)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16
  },
  winnerCardCoverBox: {
    height: 140,
    width: '100%',
    position: 'relative',
    padding: 14,
    justifyContent: 'space-between'
  },
  winnerCardCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 10, 15, 0.55)'
  },
  winnerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  winnerBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#052E20'
  },
  winnerTitleBox: {
    zIndex: 2
  },
  winnerDestName: {
    fontFamily: fontDisplay,
    fontSize: 24,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  winnerMetaText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#E8ECF2',
    marginTop: 2
  },
  winnerBody: {
    padding: 16
  },
  checklistContainer: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkItemText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#F4F3F0'
  },
  explanationBox: {
    marginBottom: 8
  },
  explanationHeadline: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '800',
    color: '#3DE0A0',
    marginBottom: 4
  },
  explanationSummary: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    lineHeight: 17,
    marginBottom: 10
  },
  subOptionWrapper: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12
  },
  subOptionCard: {
    backgroundColor: '#13151E',
    flexDirection: 'row',
    overflow: 'hidden'
  },
  subOptionStub: {
    width: 64,
    backgroundColor: '#0F1017',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14
  },
  subOptionStubLabel: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#8B8D98',
    marginTop: 2
  },
  subOptionScore: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700'
  },
  subOptionPerforation: {
    width: 0,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderLeftColor: 'rgba(255, 255, 255, 0.2)'
  },
  subOptionMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12
  },
  subOptionThumb: {
    width: 52,
    height: 52,
    borderRadius: 8
  },
  alternativeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3
  },
  alternativeBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#8B8D98'
  },
  subOptionName: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#F4F3F0'
  },
  subOptionMeta: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    marginTop: 2
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: '#050608',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.11)',
    alignItems: 'center'
  },
  proceedButton: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  proceedButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E0805'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#13151E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    gap: 14
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: 10
  },
  modalMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  modalMetaBadgeText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#F4F3F0'
  },
  modalChecklist: {
    gap: 8
  },
  modalCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  modalCheckText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#B4B6C0'
  }
});
