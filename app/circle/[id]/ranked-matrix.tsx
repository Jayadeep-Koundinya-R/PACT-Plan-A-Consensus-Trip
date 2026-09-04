import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { ConsensusGauge, ParticleBurst, PactButton } from '../../../src/components/common';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
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
  Sliders,
  Users
} from 'lucide-react-native';

export default function PactConsensusResults() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], getConsensusResults, members = [] } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'Goa trip',
      inviteCode: 'GOA-4F82',
      totalMembersCount: 5
    };

  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [showFlexibleSplitModal, setShowFlexibleSplitModal] = useState(false);

  // Deadlock state management
  const [deadlockMode, setDeadlockMode] = useState(false);
  const [softOverrideActive, setSoftOverrideActive] = useState(false);
  const [privateNudgeSent, setPrivateNudgeSent] = useState(false);

  // Budget calculations for Wide Budget Gap Banner
  const budgetCaps = members.length > 0 ? members.map((m) => m.budgetMax) : [600, 2000, 1200, 500, 1800];
  const minBudget = Math.min(...budgetCaps);
  const maxBudget = Math.max(...budgetCaps);
  const budgetSpread = maxBudget - minBudget;
  const hasWideBudgetGap = budgetSpread > 1000;

  const triggerHaptic = () => {
    haptics.tap();
  };

  const checklist = [
    'Dates: 100% date window overlap',
    'Budget: fits all 5 members privately',
    'Vibes: beach, nightlife & seafood matched'
  ];

  const handleProceedToSilentVoting = () => {
    haptics.action();
    router.push(`/circle/${currentGroup.id}/silent-ballot` as any);
  };

  const handleSendPrivateNudge = () => {
    haptics.action();
    setPrivateNudgeSent(true);
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Private Nudge Sent',
        'We sent an anonymous message to Sam: "Your dealbreaker is blocking group consensus for Goa. Would you consider softening it?"'
      );
    }
  };

  const handleSoftOverride = () => {
    haptics.success();
    setSoftOverrideActive(true);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 2000);
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {showBurst && <ParticleBurst active={true} durationMs={1400} />}

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Consensus results</Text>
            </View>

            {/* Simulation toggle button for testers */}
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                setDeadlockMode((prev) => !prev);
                setSoftOverrideActive(false);
              }}
              activeOpacity={0.7}
              style={styles.gridIconBtn}
              accessibilityLabel="Toggle deadlock simulation"
            >
              <Text style={{ fontFamily: fontUIBold, fontSize: 10, color: deadlockMode ? '#EF4444' : '#8B8D98' }}>
                {deadlockMode ? 'DEADLOCK ON' : 'SIMULATE'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 1. Wide Budget Gap Banner (High-visibility Amber banner if spread > $1,000) */}
          {hasWideBudgetGap && (
            <View style={styles.wideBudgetBanner}>
              <View style={styles.wideBudgetHeaderRow}>
                <View style={styles.wideBudgetIconBox}>
                  <AlertTriangle size={15} color="#F59E0B" />
                </View>
                <Text style={styles.wideBudgetTitle}>
                  Wide Budget Gap Detected (${minBudget} – ${maxBudget})
                </Text>
              </View>

              <Text style={styles.wideBudgetDesc}>
                A ${budgetSpread} spread exists between individual caps. A standard flat split will strain 2 members.
              </Text>

              <TouchableOpacity
                onPress={() => {
                  haptics.tap();
                  setShowFlexibleSplitModal(true);
                }}
                activeOpacity={0.8}
                style={styles.flexibleSplitPill}
              >
                <Sliders size={12} color="#F59E0B" />
                <Text style={styles.flexibleSplitPillText}>Suggest flexible budget split</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 2. Veto / Total Deadlock Fallback Card OR Normal Destinations */}
          {deadlockMode && !softOverrideActive ? (
            <View style={styles.deadlockCard}>
              <View style={styles.deadlockHeaderRow}>
                <View style={styles.deadlockAlertIcon}>
                  <ShieldAlert size={20} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deadlockTitle}>Consensus Blocked by Strict Dealbreaker</Text>
                  <Text style={styles.deadlockSubtitle}>0 of 3 destinations eligible under strict rules</Text>
                </View>
              </View>

              <Text style={styles.deadlockDesc}>
                Sam's strict dealbreaker ("No shared bath") disqualified all 3 top destinations. The rest of the group is 100% aligned on dates and budget.
              </Text>

              {/* Resolution Path 1 */}
              <View style={styles.resolutionPathBox}>
                <Text style={styles.resolutionPathNumber}>RESOLUTION PATH 1</Text>
                <PactButton
                  variant="glass"
                  onPress={handleSendPrivateNudge}
                  icon={<Send size={13} color="#F4F3F0" />}
                >
                  {privateNudgeSent ? 'Private Nudge Sent to Sam ✓' : 'Send private nudge to Sam'}
                </PactButton>
                <Text style={styles.resolutionPathDetail}>
                  Anonymously asks Sam to relax "No shared bath" to allow private en-suite villa rooms.
                </Text>
              </View>

              {/* Resolution Path 2 */}
              <View style={styles.resolutionPathBox}>
                <Text style={styles.resolutionPathNumber}>RESOLUTION PATH 2 (SUPERMAJORITY)</Text>
                <PactButton
                  variant="gradient"
                  onPress={handleSoftOverride}
                  icon={<Users size={14} color="#050608" />}
                >
                  Soft Override (4 of 5 members approve)
                </PactButton>
                <Text style={styles.resolutionPathDetail}>
                  Supermajority consensus rule: 80% approval proceeds with private en-suite room guarantee for Sam.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Soft Override Banner if override was triggered */}
              {softOverrideActive && (
                <View style={styles.overrideBanner}>
                  <Check size={14} color="#3DE0A0" />
                  <Text style={styles.overrideBannerText}>
                    Supermajority Override Active: 4 of 5 members approved Goa. En-suite suite reserved for Sam.
                  </Text>
                </View>
              )}

              {/* #1 Top Compromise Ticket Card */}
              <View style={styles.topTicketCard}>
                <View style={styles.topTicketInner}>
                  <View style={styles.topBadgeRow}>
                    <View style={styles.topPickBadge}>
                      <Text style={styles.topPickBadgeText}>
                        {softOverrideActive ? '#1 TOP COMPROMISE (OVERRIDE)' : '#1 TOP COMPROMISE'}
                      </Text>
                    </View>
                    {softOverrideActive && (
                      <View style={styles.overridePill}>
                        <Text style={styles.overridePillText}>4/5 APPROVED</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.destMatchRow}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.destTitleText}>Goa, India</Text>
                      <Text style={{ fontFamily: fontUI, fontSize: 12, color: '#3DE0A0', marginTop: 2 }}>
                        96% Consensus match across all 5 members
                      </Text>
                    </View>
                    <ConsensusGauge
                      value={96}
                      size={74}
                      strokeColor="#3DE0A0"
                      centerText="96%"
                      centerSubtext="match"
                      animated={true}
                    />
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.matchProgressBarBg}>
                    <View style={[styles.matchProgressBarFill, { width: '96%' }]} />
                  </View>

                  {/* Meta Tags Row */}
                  <View style={styles.metaTagsRow}>
                    <View style={styles.metaItem}>
                      <Svg width="13" height="13" viewBox="0 0 13 13">
                        <Rect x="1.5" y="2.5" width="10" height="9" rx="1.3" fill="none" stroke="#8B8D98" strokeWidth="1.1" />
                        <Path d="M1.5 5h10M4 1.3v2M9 1.3v2" stroke="#8B8D98" strokeWidth="1.1" strokeLinecap="round" />
                      </Svg>
                      <Text style={styles.metaItemText}>Oct 14 - Oct 19</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Svg width="13" height="13" viewBox="0 0 13 13">
                        <Path
                          d="M1.5 6.5L6.5 1.5h5v5l-5 5z"
                          fill="none"
                          stroke="#8B8D98"
                          strokeWidth="1.1"
                          strokeLinejoin="round"
                        />
                        <Circle cx="9" cy="4" r="0.9" fill="#8B8D98" />
                      </Svg>
                      <Text style={styles.metaItemText}>$540 / person</Text>
                    </View>
                  </View>

                  {/* Checklist Breakdown */}
                  <View style={styles.checklistContainer}>
                    {checklist.map((item, idx) => (
                      <View key={idx} style={styles.checkRow}>
                        <View style={styles.checkCircle}>
                          <Check size={11} color="#3DE0A0" />
                        </View>
                        <Text style={styles.checkItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* #2 Ranked Destination Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
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
                  })
                }
                style={styles.subOptionCard}
              >
                <View>
                  <Text style={styles.subOptionName}>Puducherry, India</Text>
                  <Text style={styles.subOptionMeta}>Oct 12 - Oct 17  |  $480 / person</Text>
                </View>
                <Text style={styles.subOptionScore}>82%</Text>
              </TouchableOpacity>

              {/* #3 Ranked Destination Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setSelectedDetails({
                    name: 'Manali, Himachal Pradesh',
                    dates: 'Oct 15 - Oct 20, 2026',
                    cost: '$620 / person',
                    match: '74%',
                    reasons: [
                      'Mountain adventure vibe matched',
                      'Flights + mountain cab transfers fit 4 of 5 members',
                      'Snow valley views and high-altitude cafes'
                    ]
                  })
                }
                style={styles.subOptionCard}
              >
                <View>
                  <Text style={styles.subOptionName}>Manali, Himachal Pradesh</Text>
                  <Text style={styles.subOptionMeta}>Oct 15 - Oct 20  |  $620 / person</Text>
                </View>
                <Text style={styles.subOptionScore}>74%</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleProceedToSilentVoting}
            disabled={deadlockMode && !softOverrideActive}
            style={[
              styles.proceedButton,
              deadlockMode && !softOverrideActive && { opacity: 0.4 }
            ]}
          >
            <Text style={styles.proceedButtonText}>
              {softOverrideActive
                ? 'Proceed to silent voting (Supermajority)'
                : 'Proceed to silent voting (3 options)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flexible Budget Split Modal */}
      <Modal
        visible={showFlexibleSplitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFlexibleSplitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Flexible Budget Split</Text>
              <TouchableOpacity onPress={() => setShowFlexibleSplitModal(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#8B8D98" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Instead of an equal $540/person flat split, PACT recommends room-tier allocations so all 5 members stay within their private limits:
            </Text>

            <View style={styles.tierCard}>
              <Text style={styles.tierName}>Private Master Suite (Maya & Alex)</Text>
              <Text style={styles.tierCost}>$680 / person</Text>
              <Text style={styles.tierNote}>Higher budget cap — includes private terrace & en-suite bath</Text>
            </View>

            <View style={styles.tierCard}>
              <Text style={styles.tierName}>Standard Villa Rooms (Jordan, Sam & You)</Text>
              <Text style={styles.tierCost}>$440 / person</Text>
              <Text style={styles.tierNote}>Well within $500 cap — full access to shared infinity pool & beach</Text>
            </View>

            <View style={styles.tierSummary}>
              <Check size={14} color="#3DE0A0" />
              <Text style={styles.tierSummaryText}>
                Result: 100% of 5 members funded within private caps!
              </Text>
            </View>

            <PactButton
              variant="gradient"
              onPress={() => {
                haptics.success();
                setShowFlexibleSplitModal(false);
              }}
            >
              Apply Split Recommendation
            </PactButton>
          </View>
        </View>
      </Modal>

      {/* Destination Breakdown Modal */}
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
              <TouchableOpacity onPress={() => setSelectedDetails(null)} style={styles.modalCloseBtn}>
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
    paddingBottom: 90
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    color: '#F4F3F0'
  },
  gridIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  // Wide Budget Gap Banner Styles
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
    color: '#D1D5DB',
    lineHeight: 17,
    marginBottom: 10
  },
  flexibleSplitPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  flexibleSplitPillText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#F59E0B'
  },
  // Deadlock Diagnostics Card Styles
  deadlockCard: {
    backgroundColor: '#161824',
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
  deadlockDesc: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#D1D5DB',
    lineHeight: 18
  },
  resolutionPathBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
  overrideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14
  },
  overrideBannerText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#3DE0A0',
    flex: 1,
    lineHeight: 16
  },
  overridePill: {
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  overridePillText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#3DE0A0'
  },
  // Top Ticket Card Styles
  topTicketCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16
  },
  topTicketInner: {
    padding: 16
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  topPickBadge: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12
  },
  topPickBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#3DE0A0',
    letterSpacing: 0.5
  },
  destMatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  destTitleText: {
    fontFamily: fontDisplay,
    fontSize: 22,
    color: '#F4F3F0'
  },
  matchProgressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    marginBottom: 14
  },
  matchProgressBarFill: {
    height: '100%',
    backgroundColor: '#3DE0A0',
    borderRadius: 2
  },
  metaTagsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaItemText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98'
  },
  checklistContainer: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkItemText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#F4F3F0'
  },
  // Sub options
  subOptionCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  subOptionName: {
    fontFamily: fontUIBold,
    fontSize: 15,
    color: '#F4F3F0',
    marginBottom: 3
  },
  subOptionMeta: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98'
  },
  subOptionScore: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#8B8D98'
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(5, 6, 8, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  proceedButton: {
    backgroundColor: '#3DE0A0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  proceedButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#0B3B22'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    borderColor: 'rgba(255,255,255,0.1)',
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
    color: '#F4F3F0'
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalDesc: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#8B8D98',
    lineHeight: 18
  },
  tierCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 12,
    gap: 3
  },
  tierName: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F4F3F0'
  },
  tierCost: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#F59E0B'
  },
  tierNote: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  tierSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderRadius: 8,
    padding: 10
  },
  tierSummaryText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#3DE0A0',
    flex: 1
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: 10
  },
  modalMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: '#D1D5DB'
  }
});