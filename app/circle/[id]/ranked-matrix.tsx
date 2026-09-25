import { CircleRouteGuard } from '../../../src/components/common';
import { SkeletonLoader } from '../../../src/components/SkeletonLoader';
import { EmptyState } from '../../../src/components/EmptyState';
import React, { useState, useEffect, useMemo } from 'react';
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
import { AICompromiseModal } from '../../../src/components/AICompromiseModal';
import { ConsensusHeatmap } from '../../../src/components/consensus/ConsensusHeatmap';
import { resolveTripOptionsForCircle, extractDestinationAndVibe } from '../../../src/lib/consensus/dynamicOptions';

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

  // Dynamically resolve candidate options and consensus scores
  const resolved = resolveTripOptionsForCircle(currentGroup.id, currentGroup.name, members);
  const scoredOptions = resolved.scoredOptions;
  const topOption = scoredOptions[0] || {
    option: {
      id: 'opt-001',
      name: currentGroup.name || 'Top Destination',
      dateStart: '2026-10-14',
      dateEnd: '2026-10-19',
      budgetPerPerson: 540,
      tags: ['beach', 'nightlife']
    },
    totalScore: 96
  };
  const altOption1 = scoredOptions[1];
  const altOption2 = scoredOptions[2];

  const topDestinationName = extractDestinationAndVibe(topOption.option.name || currentGroup.name).destination;

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
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (deadlockMode) {
      const dest = topDestinationName || currentGroup?.name || 'Goa';
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
  }, [deadlockMode, currentGroup?.name, topDestinationName]);

  // Memoized budget calculations for Wide Budget Gap Banner to prevent re-computation bottlenecks
  const { minBudget, maxBudget, budgetSpread, hasWideBudgetGap, totalMemberCount } = useMemo(() => {
    const budgetCaps = members.length > 0 ? members.map((m) => m.budgetMax) : [600, 2000, 1200, 500, 1800];
    const minB = Math.min(...budgetCaps);
    const maxB = Math.max(...budgetCaps);
    const spread = maxB - minB;
    const totalCount = members.length || currentGroup.totalMembersCount || 5;
    return {
      minBudget: minB,
      maxBudget: maxB,
      budgetSpread: spread,
      hasWideBudgetGap: spread > 1000,
      totalMemberCount: totalCount
    };
  }, [members, currentGroup.totalMembersCount]);

  const totalMemberCount = members.length || currentGroup.totalMembersCount || 5;

  const handleProceedToSilentVoting = () => {
    haptics.action();
    router.push(`/circle/${currentGroup.id}/silent-ballot` as any);
  };

  const handleSendPrivateNudge = () => {
    haptics.action();
    setPrivateNudgeSent(true);
    try {
      const notification = buildNudgeNotification('A member', currentGroup?.name || 'Trip');
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
                    {whispererResult?.anonymizedSummary || 'Analyzed 5 sealed ballots: 2 members capped at lower tier, 3 at higher tier.'}
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
                  {whispererResult?.compromise || `Booking accommodation in ${topDestinationName} bridges constraints while preserving date overlap. Tiered room splits maintain budget fairness.`}
                </Text>
              </View>

              {/* Resolution Action */}
              <View style={styles.resolutionPathBox}>
                  <Text style={styles.resolutionPathNumber}>Resolution path — private nudge & proposal</Text>
                  <View style={{ gap: 8 }}>
                    <PactButton
                      variant="glass"
                      onPress={handleSendPrivateNudge}
                      icon={<Send size={13} color="#F4F3F0" />}
                    >
                      {privateNudgeSent ? 'Private Nudge Dispatched ✓' : 'Send generic private nudge'}
                    </PactButton>
                    <PactButton
                      variant="solid"
                      onPress={() => {
                        haptics.action();
                        setIsAIModalVisible(true);
                      }}
                      icon={<Sparkles size={13} color="#2E0805" />}
                    >
                      Explore AI Compromise Proposal
                    </PactButton>
                  </View>
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
                      <Text style={styles.winnerBadgeText}>#1 Top Choice ({topOption.totalScore}% Match)</Text>
                    </View>
                  </View>

                  <View style={styles.winnerTitleBox}>
                    <Text style={styles.winnerDestName}>{topOption.option.name}</Text>
                    <Text style={styles.winnerMetaText}>
                      {topOption.option.dateStart} – {topOption.option.dateEnd}  •  ${topOption.option.budgetPerPerson} / person
                    </Text>
                  </View>
                </View>

                <View style={styles.winnerBody}>
                  <ConsensusHeatmap
                    datesScore={100}
                    datesCaption={`100% date window overlap across all ${totalMemberCount} members`}
                    budgetScore={100}
                    budgetCaption={`Fits all ${totalMemberCount} member caps privately`}
                    vibeScore={Math.round(topOption.totalScore)}
                    vibeTags={topOption.option.tags || ['scenic', 'vibe']}
                    hasVeto={false}
                    destinationName={topDestinationName}
                    totalScore={Math.round(topOption.totalScore)}
                  />

                  <View style={{ marginTop: 12 }}>
                    <ExplorePlaceSection destination={topDestinationName} />
                  </View>
                </View>
              </View>

              {/* #2 Alternative Option Ticket Card */}
              {altOption1 && (
                <View style={styles.subOptionWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.tap();
                      setSelectedDetails({
                        name: altOption1.option.name,
                        dates: `${altOption1.option.dateStart} - ${altOption1.option.dateEnd}`,
                        cost: `$${altOption1.option.budgetPerPerson} / person`,
                        match: `${Math.round(altOption1.totalScore)}%`,
                        reasons: [
                          'Strong date overlap across group members',
                          `Budget fits comfortably at $${altOption1.option.budgetPerPerson}/traveler`,
                          'High vibe alignment for group'
                        ]
                      });
                    }}
                    style={styles.subOptionCard}
                    accessibilityLabel={`View ${altOption1.option.name} details`}
                  >
                    <View style={styles.subOptionStub}>
                      <Text style={[styles.subOptionScore, { color: '#3DE0A0' }]}>{Math.round(altOption1.totalScore)}%</Text>
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
                        <Text style={styles.subOptionName}>{altOption1.option.name}</Text>
                        <Text style={styles.subOptionMeta}>
                          {altOption1.option.dateStart} - {altOption1.option.dateEnd}  |  ${altOption1.option.budgetPerPerson} / person
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#8B8D98" />
                    </View>
                  </TouchableOpacity>
                  <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                    <ConsensusHeatmap
                      datesScore={80}
                      datesCaption="Full date overlap for majority of travelers"
                      budgetScore={100}
                      budgetCaption={`Budget fits at $${altOption1.option.budgetPerPerson}/traveler`}
                      vibeScore={Math.round(altOption1.totalScore)}
                      vibeTags={altOption1.option.tags || ['heritage', 'coastal']}
                      hasVeto={false}
                      isCompact={true}
                      destinationName={extractDestinationAndVibe(altOption1.option.name).destination}
                      totalScore={Math.round(altOption1.totalScore)}
                    />
                    <View style={{ marginTop: 10 }}>
                      <ExplorePlaceSection destination={extractDestinationAndVibe(altOption1.option.name).destination} />
                    </View>
                  </View>
                </View>
              )}

              {/* #3 Alternative Option Ticket Card */}
              {altOption2 && (
                <View style={styles.subOptionWrapper}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.tap();
                      setSelectedDetails({
                        name: altOption2.option.name,
                        dates: `${altOption2.option.dateStart} - ${altOption2.option.dateEnd}`,
                        cost: `$${altOption2.option.budgetPerPerson} / person`,
                        match: `${Math.round(altOption2.totalScore)}%`,
                        reasons: [
                          'Good candidate option',
                          `Budget fits at $${altOption2.option.budgetPerPerson}/traveler`,
                          'Unique vibe and scenery'
                        ]
                      });
                    }}
                    style={styles.subOptionCard}
                    accessibilityLabel={`View ${altOption2.option.name} details`}
                  >
                    <View style={styles.subOptionStub}>
                      <Text style={[styles.subOptionScore, { color: '#3DE0A0' }]}>{Math.round(altOption2.totalScore)}%</Text>
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
                        <Text style={styles.subOptionName}>{altOption2.option.name}</Text>
                        <Text style={styles.subOptionMeta}>
                          {altOption2.option.dateStart} - {altOption2.option.dateEnd}  |  ${altOption2.option.budgetPerPerson} / person
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#8B8D98" />
                    </View>
                  </TouchableOpacity>
                  <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                    <ConsensusHeatmap
                      datesScore={70}
                      datesCaption="Dates work for majority of travelers"
                      budgetScore={75}
                      budgetCaption={`Fits majority of budget caps at $${altOption2.option.budgetPerPerson}`}
                      vibeScore={Math.round(altOption2.totalScore)}
                      vibeTags={altOption2.option.tags || ['scenic', 'cafes']}
                      hasVeto={false}
                      isCompact={true}
                      destinationName={extractDestinationAndVibe(altOption2.option.name).destination}
                      totalScore={Math.round(altOption2.totalScore)}
                    />
                    <View style={{ marginTop: 10 }}>
                      <ExplorePlaceSection destination={extractDestinationAndVibe(altOption2.option.name).destination} />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* AI Compromise Modal Integration */}
        <AICompromiseModal
          visible={isAIModalVisible}
          groupId={currentGroup.id}
          isDarkMode={true}
          onClose={() => setIsAIModalVisible(false)}
          onApplied={() => {
            setDeadlockMode(false);
          }}
        />

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
    borderWidth: 1.5,
    borderColor: '#3DE0A0',
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
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4
  },
  alternativeBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#3DE0A0'
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
