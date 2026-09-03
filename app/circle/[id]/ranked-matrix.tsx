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
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Sparkles, AlertTriangle, Check, ChevronRight, X, Calendar, DollarSign, Vote } from 'lucide-react-native';

export default function PactConsensusResults() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groups = [], getConsensusResults } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'Goa trip',
      inviteCode: 'GOA-4F82',
      totalMembersCount: 5
    };

  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const checklist = [
    'Dates: 100% date window overlap',
    'Budget: fits all 5 members privately',
    'Vibes: beach, nightlife & seafood matched'
  ];

  const handleProceedToSilentVoting = () => {
    triggerHaptic();
    router.push(`/circle/${currentGroup.id}/silent-ballot` as any);
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Consensus results</Text>
            </View>

            <TouchableOpacity
              onPress={() => Alert.alert('Consensus Matrix', 'All 5 members have 100% date overlap on mid-October windows.')}
              activeOpacity={0.7}
              style={styles.gridIconBtn}
            >
              <Svg width="15" height="15" viewBox="0 0 15 15">
                <Rect x="1.5" y="1.5" width="5" height="5" rx="1" fill="none" stroke="#8B8D98" strokeWidth="1.2" />
                <Rect x="8.5" y="1.5" width="5" height="5" rx="1" fill="none" stroke="#8B8D98" strokeWidth="1.2" />
                <Rect x="1.5" y="8.5" width="5" height="5" rx="1" fill="none" stroke="#8B8D98" strokeWidth="1.2" />
                <Rect x="8.5" y="8.5" width="5" height="5" rx="1" fill="none" stroke="#8B8D98" strokeWidth="1.2" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* AI Deadlock & Compromise Whisperer Alert Banner */}
          <View style={styles.deadlockBanner}>
            <View style={styles.deadlockHeaderRow}>
              <Svg width="16" height="16" viewBox="0 0 16 16">
                <Path d="M8 1.5l7 12.5H1z" fill="none" stroke="#F59E0B" strokeWidth="1.3" strokeLinejoin="round" />
                <Path d="M8 6.3v3.4" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" />
                <Circle cx="8" cy="11.8" r="0.9" fill="#F59E0B" />
              </Svg>
              <Text style={styles.deadlockTitle}>Budget overlap tight</Text>
            </View>

            <Text style={styles.deadlockDesc}>
              2 members capped budget at $600. 3 members capped at $1,200.
            </Text>

            {/* AI Suggestion Box */}
            <View style={styles.aiSuggestionBox}>
              <Text style={styles.aiSparkleIcon}>✨</Text>
              <Text style={styles.aiSuggestionText}>
                <Text style={styles.aiSuggestionBold}>AI suggestion: </Text>
                South Goa boutique stays fit 100% of member budgets.
              </Text>
            </View>
          </View>

          {/* #1 Top Compromise Ticket Card */}
          <View style={styles.topTicketCard}>
            <View style={styles.topTicketInner}>
              <View style={styles.topBadgeRow}>
                <View style={styles.topPickBadge}>
                  <Text style={styles.topPickBadgeText}>#1 TOP COMPROMISE</Text>
                </View>
              </View>

              <View style={styles.destMatchRow}>
                <Text style={styles.destTitleText}>Goa, India</Text>
                <Text style={styles.destMatchPercentText}>
                  96% <Text style={styles.destMatchLabel}>MATCH</Text>
                </Text>
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
                {checklist.map((c) => (
                  <View key={c} style={styles.checklistItemRow}>
                    <Svg width="13" height="13" viewBox="0 0 13 13">
                      <Circle cx="6.5" cy="6.5" r="6.5" fill="#3DE0A0" fillOpacity={0.15} />
                      <Path
                        d="M3.5 6.7l2 2 4-4.2"
                        fill="none"
                        stroke="#3DE0A0"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.checklistItemText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Ticket Notches & Perforation */}
            <View style={styles.perforationWrapper}>
              <View style={styles.notchLeft} />
              <View style={styles.notchRight} />
              <View style={styles.dashedLine} />
            </View>

            {/* Ticket Action Buttons */}
            <View style={styles.ticketActionsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setSelectedDetails({
                    name: 'Goa, India',
                    dates: 'Oct 14 - Oct 19, 2026',
                    cost: '$540 / person',
                    match: '96%',
                    reasons: [
                      '100% of 5 travelers available for this date window',
                      'Average budget target $650; actual cost $540 saves $110/traveler',
                      'No dealbreakers triggered (no dorms, no long drives)',
                      'Beach & seafood cuisine preferred by 4/5 members'
                    ]
                  })
                }
                style={styles.viewDetailsBtn}
              >
                <Text style={styles.viewDetailsBtnText}>View details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleProceedToSilentVoting}
                style={styles.selectForVoteBtn}
              >
                <Text style={styles.selectForVoteBtnText}>Select for vote</Text>
              </TouchableOpacity>
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
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleProceedToSilentVoting}
            style={styles.proceedButton}
          >
            <Text style={styles.proceedButtonText}>
              Proceed to silent voting (3 options)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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

            <Text style={styles.modalSectionLabel}>CONSENSUS BREAKDOWN</Text>
            <View style={styles.modalReasonsList}>
              {(selectedDetails?.reasons || []).map((r: string, i: number) => (
                <View key={i} style={styles.modalReasonRow}>
                  <Check size={14} color="#3DE0A0" style={{ marginTop: 2 }} />
                  <Text style={styles.modalReasonText}>{r}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                setSelectedDetails(null);
                handleProceedToSilentVoting();
              }}
              style={styles.modalSelectBtn}
            >
              <Vote size={16} color="#090A0F" />
              <Text style={styles.modalSelectBtnText}>Select & Cast Silent Vote</Text>
            </TouchableOpacity>
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
    marginBottom: 18
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
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
    color: '#F4F3F0'
  },
  gridIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deadlockBanner: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  deadlockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  deadlockTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F0B547'
  },
  deadlockDesc: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#B4915A',
    lineHeight: 18,
    marginBottom: 12
  },
  aiSuggestionBox: {
    backgroundColor: 'rgba(255,90,95,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,90,95,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  aiSparkleIcon: {
    fontSize: 13,
    marginTop: 1
  },
  aiSuggestionText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#F4F3F0',
    lineHeight: 17,
    flex: 1
  },
  aiSuggestionBold: {
    color: '#FF8A8D',
    fontWeight: '600',
    fontFamily: fontUIBold
  },
  topTicketCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14
  },
  topTicketInner: {
    paddingHorizontal: 18,
    paddingTop: 18
  },
  topBadgeRow: {
    marginBottom: 14
  },
  topPickBadge: {
    backgroundColor: '#FF5A5F',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start'
  },
  topPickBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#2E0805',
    letterSpacing: 0.5
  },
  destMatchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  destTitleText: {
    fontFamily: fontDisplay,
    fontSize: 26,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  destMatchPercentText: {
    fontFamily: fontUIBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  destMatchLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fontUI
  },
  matchProgressBarBg: {
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
    overflow: 'hidden'
  },
  matchProgressBarFill: {
    height: '100%',
    backgroundColor: '#3DE0A0',
    borderRadius: 6
  },
  metaTagsRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 16
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaItemText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#B4B6C0'
  },
  checklistContainer: {
    gap: 8,
    marginBottom: 16
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  checklistItemText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#B4B6C0',
    lineHeight: 17,
    flex: 1
  },
  perforationWrapper: {
    position: 'relative',
    height: 1,
    justifyContent: 'center'
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#090A0F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  notchRight: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#090A0F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  dashedLine: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(255,255,255,0.16)',
    marginHorizontal: 22
  },
  ticketActionsRow: {
    padding: 16,
    flexDirection: 'row',
    gap: 10
  },
  viewDetailsBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewDetailsBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  selectForVoteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectForVoteBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2E0805'
  },
  subOptionCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  subOptionName: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F3F0',
    marginBottom: 3
  },
  subOptionMeta: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A'
  },
  subOptionScore: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#8B8D98'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  proceedButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F4F3F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  proceedButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#090A0F'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5,6,8,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#13151E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 22
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  modalCloseBtn: {
    padding: 4
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  modalMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F1017',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  modalMetaBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#F4F3F0'
  },
  modalSectionLabel: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6C6F7A',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  modalReasonsList: {
    gap: 8,
    marginBottom: 20
  },
  modalReasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  modalReasonText: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#B4B6C0',
    lineHeight: 18,
    flex: 1
  },
  modalSelectBtn: {
    backgroundColor: '#F4F3F0',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  modalSelectBtnText: {
    color: '#090A0F',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: fontUIBold
  }
});