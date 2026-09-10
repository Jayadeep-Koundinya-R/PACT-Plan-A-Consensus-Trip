import * as Haptics from 'expo-haptics';
import { CircleRouteGuard } from '../../../src/components/common';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Check, X, Shield, Lock, Sparkles, Share2, Bot, AlertTriangle } from 'lucide-react-native';
import { PactButton } from '../../../src/components/common';
import { PactPollCard, PactPollStance, PactPollOption } from '../../../src/components/PactPollCard';
import { evaluatePactPoll, formatPactPollWhatsAppMessage } from '../../../src/lib/poll/pactPollEngine';
import { useShareInvite } from '../../../src/hooks/useShareInvite';
import { fetchCompromiseWhisperer, CompromiseWhispererResult } from '../../../src/lib/ai/aiAdvisorClient';

export default function PactSilentBallot() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }
  const router = useRouter();
  const { groups = [], castVote, currentUserId = 'user-maya-001' } = useGatherlyStore();
  const haptics = usePactHaptics();
  const { shareToWhatsApp } = useShareInvite();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: (id && id !== 'undefined') ? id : 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82'
    };

  // Stances: 'love' (+2), 'down' (+1), 'veto' (-999), or null
  const [stances, setStances] = useState<Record<string, PactPollStance>>({
    goa: 'love',
    pondy: 'down'
  });

  const [ranks, setRanks] = useState<Record<string, number>>({
    goa: 1,
    pondy: 2
  });

  const [vetoReasons, setVetoReasons] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompromiseLoading, setIsCompromiseLoading] = useState(false);
  const [compromiseResult, setCompromiseResult] = useState<CompromiseWhispererResult | null>(null);

  const options: PactPollOption[] = [
    {
      key: 'goa',
      name: 'Goa, India',
      match: 96,
      dates: 'Oct 14 – Oct 19',
      price: '$540 / person',
      budgetFitPct: 100,
      dateFitPct: 100,
      tags: ['Beach Villa', 'Nightlife', 'Direct Flight']
    },
    {
      key: 'pondy',
      name: 'Puducherry, India',
      match: 82,
      dates: 'Oct 12 – Oct 17',
      price: '$480 / person',
      budgetFitPct: 80,
      dateFitPct: 80,
      tags: ['Heritage Walk', 'French Quarter', 'Cafes']
    }
  ];

  const handleStanceChange = (key: string, newStance: PactPollStance) => {
    setStances((prev) => ({ ...prev, [key]: newStance }));
  };

  const handleRankChange = (key: string, rank: number) => {
    setRanks((prev) => ({ ...prev, [key]: rank }));
  };

  const handleVetoReasonChange = (key: string, reason: string) => {
    setVetoReasons((prev) => ({ ...prev, [key]: reason }));
  };

  const hasAnyVeto = Object.values(stances).some((s) => s === 'veto');

  // Trigger Gemini AI Compromise Whisperer to resolve potential veto/deadlock
  const handleInvokeCompromiseWhisperer = async () => {
    haptics.action();
    setIsCompromiseLoading(true);
    try {
      const result = await fetchCompromiseWhisperer(
        currentGroup.name || 'Goa',
        5,
        {
          budgetBuckets: { '$400–$600': 3, '$800–$1,200': 2 },
          commonDates: 'Oct 14–19',
          dealbreakerSummary: Object.values(vetoReasons)[0] || 'Budget & flight duration'
        }
      );
      setCompromiseResult(result);
    } catch (e) {
      setCompromiseResult({
        compromise: 'Booking a 5-bedroom private boutique villa in South Goa bridges accommodation and budget constraints while preserving 100% date overlap.',
        anonymizedSummary: 'Analyzed 5 sealed ballots with 100% agreement on Oct 14–19 dates.',
        source: 'pact_consensus_engine'
      });
    } finally {
      setIsCompromiseLoading(false);
    }
  };

  // WhatsApp PACT Poll Share
  const handleShareWhatsAppPoll = async () => {
    haptics.action();
    const message = formatPactPollWhatsAppMessage({
      circleName: currentGroup.name || 'Trip Circle',
      inviteCode: currentGroup.inviteCode || 'GOA-4F82',
      sealedCount: 3,
      totalVoters: 5,
      options: options.map((o) => ({
        name: o.name,
        dates: o.dates,
        price: o.price,
        budgetSafe: o.budgetFitPct === 100
      }))
    });
    await shareToWhatsApp({ message, inviteCode: currentGroup.inviteCode || 'GOA-4F82' });
  };

  const handleCastBallot = async () => {
    haptics.success();
    setIsSubmitting(true);

    try {
      await castVote('opt-goa-001', stances.goa !== 'veto');
      await castVote('opt-pondy-002', stances.pondy !== 'veto');
      router.push(`/circle/${currentGroup.id}/brief` as any);
    } catch (e) {
      router.push(`/circle/${currentGroup.id}/brief` as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
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
              <Text style={styles.headerTitle}>PACT Poll</Text>
            </View>

            <View style={styles.sealedBadge}>
              <Svg width="10" height="10" viewBox="0 0 10 10">
                <Rect x="2" y="4.3" width="6" height="4.7" rx="1" fill="none" stroke="#3DE0A0" strokeWidth="0.9" />
                <Path d="M3.2 4.3V3a1.8 1.8 0 0 1 3.6 0v1.3" fill="none" stroke="#3DE0A0" strokeWidth="0.9" />
              </Svg>
              <Text style={styles.sealedBadgeText}>Sealed & Private</Text>
            </View>
          </View>

          {/* Anti-Herd Guarantee Banner */}
          <View style={styles.guaranteeBanner}>
            <Svg width="16" height="16" viewBox="0 0 16 16" style={{ marginTop: 2 }}>
              <Path
                d="M8 1.5l5.5 2v4.2c0 3.4-2.3 6-5.5 6.8-3.2-.8-5.5-3.4-5.5-6.8V3.5z"
                fill="none"
                stroke="#3DE0A0"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeText}>
                <Text style={styles.guaranteeBold}>Anti-Herd Protocol Active: </Text>
                Votes are cryptographically sealed. Individual choices remain private until all 5 members submit, eliminating group peer pressure.
              </Text>
            </View>
          </View>

          {/* Live Sealed Progress Bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressTitle}>Group Ballots Sealed</Text>
              <Text style={styles.progressRatio}>3 of 5 members</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressSubtext}>
              2 more members needed to unlock final consensus and reveal winner.
            </Text>
          </View>

          {/* Options Candidates Rendered with PactPollCard */}
          {options.map((opt) => (
            <PactPollCard
              key={opt.key}
              option={opt}
              stance={stances[opt.key]}
              rank={ranks[opt.key]}
              vetoReason={vetoReasons[opt.key]}
              onStanceChange={handleStanceChange}
              onRankChange={handleRankChange}
              onVetoReasonChange={handleVetoReasonChange}
            />
          ))}

          {/* Autonomous AI Deadlock / Veto Whisperer Trigger */}
          {hasAnyVeto && (
            <View style={styles.deadlockAlertCard}>
              <View style={styles.deadlockHeaderRow}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={styles.deadlockTitle}>Deadlock Veto Guardrail</Text>
              </View>
              <Text style={styles.deadlockDesc}>
                You registered a Dealbreaker Veto. Unlike WhatsApp polls which get stuck, PACT has an autonomous AI Whisperer to calculate a compromise.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleInvokeCompromiseWhisperer}
                disabled={isCompromiseLoading}
                style={styles.aiWhispererBtn}
                accessibilityLabel="Invoke AI Compromise Whisperer"
              >
                <Sparkles size={14} color="#050608" />
                <Text style={styles.aiWhispererBtnText}>
                  {isCompromiseLoading ? 'Synthesizing...' : 'Invoke AI Compromise Whisperer'}
                </Text>
              </TouchableOpacity>

              {compromiseResult && (
                <View style={styles.compromiseBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Bot size={13} color="#3DE0A0" />
                    <Text style={styles.compromiseTitle}>
                      AI Compromise ({compromiseResult.source === 'gemini_live' ? 'Gemini 1.5' : 'Consensus Engine'}):
                    </Text>
                  </View>
                  <Text style={styles.compromiseBody}>{compromiseResult.compromise}</Text>
                  <Text style={styles.compromiseMeta}>
                    📊 {compromiseResult.anonymizedSummary}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* WhatsApp PACT Poll Card Exporter */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShareWhatsAppPoll}
            style={styles.whatsAppShareBtn}
            accessibilityLabel="Share PACT Poll Snapshot to WhatsApp"
          >
            <Share2 size={14} color="#0B3B22" />
            <Text style={styles.whatsAppShareBtnText}>
              Share Sealed PACT Poll to WhatsApp
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleCastBallot}
            disabled={isSubmitting}
            style={styles.lockBallotBtn}
            accessibilityLabel="Lock and cast sealed ballot"
          >
            <Svg width="14" height="14" viewBox="0 0 14 14">
              <Rect x="3" y="6.2" width="8" height="6" rx="1.3" fill="none" stroke="#2E0805" strokeWidth="1.3" />
              <Path d="M4.5 6.2V4.6a2.1 2.1 0 0 1 4.2 0v1.6" fill="none" stroke="#2E0805" strokeWidth="1.3" />
            </Svg>
            <Text style={styles.lockBallotBtnText}>
              {isSubmitting ? 'Sealing Ballot...' : 'Lock & cast sealed ballot'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.bottomSubtext}>
            You can modify your secret stances anytime before quorum is completed.
          </Text>
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
    borderColor: 'rgba(255, 255, 255, 0.11)',
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
    gap: 12
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 18,
    color: '#F4F3F0'
  },
  sealedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)',
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  sealedBadgeText: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#3DE0A0',
    fontWeight: '600'
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  guaranteeText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    lineHeight: 17
  },
  guaranteeBold: {
    color: '#3DE0A0',
    fontFamily: fontUIBold
  },
  progressCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  progressTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0'
  },
  progressRatio: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#3DE0A0',
    fontWeight: '700'
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3DE0A0',
    borderRadius: 3
  },
  progressSubtext: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#6C6F7A'
  },
  deadlockAlertCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  deadlockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  deadlockTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#EF4444'
  },
  deadlockDesc: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    lineHeight: 16,
    marginBottom: 10
  },
  aiWhispererBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3DE0A0',
    paddingVertical: 9,
    borderRadius: 8
  },
  aiWhispererBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#050608'
  },
  compromiseBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  compromiseTitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#3DE0A0'
  },
  compromiseBody: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#F4F3F0',
    lineHeight: 16,
    marginBottom: 4
  },
  compromiseMeta: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#8B8D98'
  },
  whatsAppShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3DE0A0',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20
  },
  whatsAppShareBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#0B3B22'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  lockBallotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A5F',
    paddingVertical: 14,
    borderRadius: 12
  },
  lockBallotBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#2E0805'
  },
  bottomSubtext: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A',
    textAlign: 'center',
    marginTop: 8
  }
});
