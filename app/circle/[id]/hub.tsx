import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Share,
  Alert,
  Animated,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { PactButton } from '../../../src/components/common';
import {
  ArrowLeft,
  Check,
  Copy,
  Share2,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Settings,
  Zap,
  Send,
  Users
} from 'lucide-react-native';

export default function PactCirclesHub() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], members = [], activeGroupId, setActiveGroup } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups.find((g) => g && g.id === activeGroupId) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82',
      organizerId: 'user-maya-001',
      status: 'voting' as const,
      totalMembersCount: 5
    };

  const [nudged, setNudged] = useState<Record<string, boolean>>({});
  const [bulkNudged, setBulkNudged] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Pulse animation for awaiting dot
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true
        })
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // Demo members: default to 2 locked (Early Bird State) so safety net is immediately visible
  const [demoMembers, setDemoMembers] = useState([
    { name: 'You', status: 'locked' as const },
    { name: 'Alex', status: 'locked' as const },
    { name: 'Sam', status: 'waiting' as const },
    { name: 'Jordan', status: 'waiting' as const },
    { name: 'Maya', status: 'waiting' as const }
  ]);

  const lockedCount = demoMembers.filter((m) => m.status === 'locked').length;
  const totalCount = demoMembers.length;
  const isEarlyBird = lockedCount <= 2;
  const pct = lockedCount / totalCount;
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const waitingMembers = demoMembers.filter((m) => m.status === 'waiting');

  const initials = (name: string) => name.slice(0, 2).toUpperCase();

  const triggerHaptic = () => {
    haptics.tap();
  };

  const handleNudge = (name: string) => {
    haptics.action();
    setNudged((prev) => ({ ...prev, [name]: true }));
    if (Platform.OS !== 'web') {
      Alert.alert('Nudge Sent', `Sent a private reminder notification to ${name}!`);
    }
  };

  const handleBulkWhatsAppNudge = async () => {
    haptics.action();
    setBulkNudged(true);
    const code = currentGroup.inviteCode || 'GOA-4F82';
    const needed = Math.max(1, 3 - lockedCount);
    const message = `Hey team! ✈️ ${lockedCount} of us locked in our trip preferences on PACT. We need ${needed} more to reveal the consensus match!\n\nLock in your dates & budget here (100% private):\npact://join/${code}\nInvite code: ${code}`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    if (Platform.OS === 'web') {
      try {
        await Clipboard.setStringAsync(message);
        window.open(waUrl, '_blank');
      } catch (e) {
        Alert.alert('WhatsApp Reminder', message);
      }
    } else {
      try {
        const canOpen = await Linking.canOpenURL(waUrl);
        if (canOpen) {
          await Linking.openURL(waUrl);
        } else {
          await Share.share({
            message,
            title: `Nudge: ${currentGroup.name} on PACT`
          });
        }
      } catch (e) {
        Alert.alert('Nudge Copied', message);
      }
    }
  };

  const handleCopyCode = async () => {
    haptics.tap();
    const code = currentGroup.inviteCode || 'GOA-4F82';
    try {
      await Clipboard.setStringAsync(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareWhatsApp = async () => {
    haptics.action();
    const code = currentGroup.inviteCode || 'GOA-4F82';
    const message = `✨ Join our private trip poll on PACT: "${currentGroup.name}"!\n\nEnter code: ${code}\nYour dates and budget stay 100% confidential.`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(message);
        Alert.alert('Copied to Clipboard', 'Share link and code copied to clipboard!');
      } catch (e) {
        Alert.alert('Invite Code', message);
      }
    } else {
      try {
        await Share.share({
          message,
          title: `Join ${currentGroup.name} on PACT`
        });
      } catch (e) {}
    }
  };

  const handleProceedToPreferences = () => {
    haptics.tap();
    router.push(`/circle/${currentGroup.id}/preferences` as any);
  };

  // Helper toggle for demo tester to simulate 3rd member locking in
  const toggleDemoSimulation = () => {
    haptics.tap();
    setDemoMembers((prev) => {
      if (prev.filter((m) => m.status === 'locked').length <= 2) {
        return prev.map((m, idx) => (idx === 2 ? { ...m, status: 'locked' as const } : m));
      } else {
        return prev.map((m, idx) => (idx >= 2 ? { ...m, status: 'waiting' as const } : m));
      }
    });
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => router.push('/settings' as any)}
                activeOpacity={0.7}
                style={styles.backBtn}
              >
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.tripTitle} numberOfLines={1}>
                {currentGroup.name || 'Goa Beach Escape 2026'}
              </Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.7} style={styles.inviteCodeBadge}>
                <Text style={styles.inviteCodeText}>{copiedCode ? 'COPIED!' : currentGroup.inviteCode || 'GOA-4F82'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/settings' as any)}
                activeOpacity={0.7}
                style={styles.settingsBtn}
              >
                <Settings size={16} color="#8B8D98" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Early Bird State Banner (when <= 2 responded) OR Standard Ring Meter (when > 2 responded) */}
          {isEarlyBird ? (
            <View style={styles.earlyBirdCard}>
              <View style={styles.earlyBirdBadgeRow}>
                <View style={styles.earlyBirdTag}>
                  <Zap size={13} color="#3DE0A0" fill="#3DE0A0" />
                  <Text style={styles.earlyBirdTagText}>EARLY BIRD ACTIVATED</Text>
                </View>
                <TouchableOpacity onPress={toggleDemoSimulation} activeOpacity={0.7}>
                  <Text style={styles.earlyBirdCountText}>{lockedCount}/{totalCount} LOCKED IN</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.earlyBirdTitle}>You're leading the charge! ⚡</Text>
              <Text style={styles.earlyBirdDesc}>
                Consensus calculations unlock once 3 members lock in. Nudge remaining friends to reveal your group's match!
              </Text>

              {/* Progress bar towards consensus unlock */}
              <View style={styles.earlyBirdProgressTrack}>
                <View style={[styles.earlyBirdProgressFill, { width: `${(lockedCount / totalCount) * 100}%` }]} />
                <View style={styles.unlockThresholdMarker}>
                  <View style={styles.thresholdDot} />
                  <Text style={styles.thresholdText}>3 unlocks match</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.statusCard}>
              <View style={styles.svgWrapper}>
                <Svg width="84" height="84" viewBox="0 0 84 84">
                  <Circle
                    cx="42"
                    cy="42"
                    r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="7"
                  />
                  <Circle
                    cx="42"
                    cy="42"
                    r={r}
                    fill="none"
                    stroke="#3DE0A0"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${circumference * (1 - pct)}`}
                    transform="rotate(-90 42 42)"
                  />
                </Svg>
                <View style={styles.svgCenterText}>
                  <Text style={styles.progressFractionText}>
                    {lockedCount}/{totalCount}
                  </Text>
                  <Text style={styles.progressSubLabel}>responded</Text>
                </View>
              </View>

              <View style={styles.statusTextCol}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.statusHeaderLabel}>GROUP CONSENSUS STATUS</Text>
                  <TouchableOpacity onPress={toggleDemoSimulation} activeOpacity={0.7}>
                    <Text style={{ fontFamily: fontUI, fontSize: 10, color: '#6C6F7A' }}>toggle</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.statusSubtext}>
                  3+ members locked in! Consensus algorithms active.
                </Text>
              </View>
            </View>
          )}

          {/* Members Response List */}
          <View style={styles.membersCard}>
            <View style={styles.membersCardHeader}>
              <Text style={styles.membersCardTitle}>MEMBER RESPONSES</Text>
              <Text style={styles.membersCardSubtitle}>{totalCount - lockedCount} pending</Text>
            </View>

            {demoMembers.map((m, i) => (
              <View
                key={m.name}
                style={[
                  styles.memberRow,
                  i === 0 && { borderTopWidth: 0 }
                ]}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{initials(m.name)}</Text>
                </View>

                <View style={styles.memberInfoCol}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  {m.status === 'locked' ? (
                    <View style={styles.statusBadgeRow}>
                      <Svg width="12" height="12" viewBox="0 0 12 12">
                        <Circle cx="6" cy="6" r="6" fill="#3DE0A0" fillOpacity={0.15} />
                        <Path
                          d="M3.3 6.2l1.8 1.8 3.6-3.8"
                          fill="none"
                          stroke="#3DE0A0"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text style={styles.lockedStatusText}>Inputs locked</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgeRow}>
                      <Animated.View
                        style={[
                          styles.pulseDot,
                          { opacity: pulseAnim }
                        ]}
                      />
                      <Text style={styles.awaitingStatusText}>Awaiting inputs</Text>
                    </View>
                  )}
                </View>

                {/* Individual nudge buttons: only shown if NOT early bird mode */}
                {!isEarlyBird && m.status === 'waiting' && (
                  <TouchableOpacity
                    onPress={() => handleNudge(m.name)}
                    activeOpacity={0.7}
                    style={[
                      styles.nudgeButton,
                      nudged[m.name] && { borderColor: 'rgba(255,255,255,0.06)' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.nudgeButtonText,
                        nudged[m.name] && { color: '#6C6F7A' }
                      ]}
                    >
                      {nudged[m.name] ? 'Nudged' : 'Nudge'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* In Early Bird state: Replace individual nudge buttons with a single primary bulk action */}
            {isEarlyBird && (
              <View style={styles.bulkNudgeContainer}>
                <PactButton
                  variant="gradient"
                  onPress={handleBulkWhatsAppNudge}
                  icon={<Send size={14} color="#050608" />}
                >
                  {bulkNudged ? 'WhatsApp Nudge Sent ✓' : 'Nudge Everyone on WhatsApp'}
                </PactButton>
                <Text style={styles.bulkNudgeSubtext}>
                  Sends a single private group reminder with your invite link to all {waitingMembers.length} remaining friends.
                </Text>
              </View>
            )}
          </View>

          {/* Dashed Ticket Perforation Card for Circle Invite */}
          <View style={styles.ticketCardContainer}>
            <View style={styles.ticketCard}>
              <View style={styles.ticketTopSection}>
                <Text style={styles.ticketCodeLabel}>CIRCLE INVITE CODE</Text>
                <Text style={styles.ticketCodeHeading}>
                  {currentGroup.inviteCode || 'GOA-4F82'}
                </Text>
              </View>

              {/* Ticket Notches & Perforation */}
              <View style={styles.perforationWrapper}>
                <View style={styles.notchLeft} />
                <View style={styles.notchRight} />
                <View style={styles.dashedLine} />
              </View>

              <View style={styles.ticketBottomSection}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleShareWhatsApp}
                  style={styles.whatsAppButton}
                >
                  <Svg width="16" height="16" viewBox="0 0 16 16">
                    <Path
                      d="M8 1.3A6.7 6.7 0 0 0 2.3 11.6L1.3 14.7l3.2-1a6.7 6.7 0 1 0 3.5-12.4z"
                      fill="#0B3B22"
                    />
                  </Svg>
                  <Text style={styles.whatsAppButtonText}>Share to WhatsApp group</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Access to Consensus Matrix Preview */}
          <TouchableOpacity
            onPress={() => router.push(`/circle/${currentGroup.id}/ranked-matrix` as any)}
            activeOpacity={0.8}
            style={styles.matrixQuickCard}
          >
            <View style={styles.matrixQuickLeft}>
              <View style={styles.matrixIconBox}>
                <Sparkles size={16} color="#3DE0A0" />
              </View>
              <View>
                <Text style={styles.matrixQuickTitle}>Live Consensus Engine</Text>
                <Text style={styles.matrixQuickSub}>Preview ranked destinations & overlap</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#6C6F7A" />
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleProceedToPreferences}
            style={styles.primaryActionButton}
          >
            <Text style={styles.primaryActionButtonText}>
              Set / Update My Preferences
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
    gap: 10,
    flex: 1
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tripTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    color: '#F4F3F0',
    flex: 1
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  inviteCodeBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  inviteCodeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#C9924A'
  },
  settingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Early Bird Encouraging Banner Styles
  earlyBirdCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#3DE0A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10
  },
  earlyBirdBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  earlyBirdTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12
  },
  earlyBirdTagText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#3DE0A0',
    letterSpacing: 0.5
  },
  earlyBirdCountText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98',
    letterSpacing: 0.5
  },
  earlyBirdTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    color: '#F4F3F0',
    marginBottom: 6
  },
  earlyBirdDesc: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#8B8D98',
    lineHeight: 18,
    marginBottom: 14
  },
  earlyBirdProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    position: 'relative',
    marginBottom: 8
  },
  earlyBirdProgressFill: {
    height: '100%',
    backgroundColor: '#3DE0A0',
    borderRadius: 3
  },
  unlockThresholdMarker: {
    position: 'absolute',
    left: '60%',
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  thresholdDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3DE0A0'
  },
  thresholdText: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#3DE0A0'
  },
  // Standard Status Card Styles
  statusCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16
  },
  svgWrapper: {
    position: 'relative',
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center'
  },
  svgCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressFractionText: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  progressSubLabel: {
    fontFamily: fontUI,
    fontSize: 8.5,
    color: '#6C6F7A',
    textTransform: 'lowercase'
  },
  statusTextCol: {
    flex: 1
  },
  statusHeaderLabel: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#8B8D98',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  statusSubtext: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#F4F3F0',
    lineHeight: 18
  },
  // Members List Styles
  membersCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  membersCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  membersCardTitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98',
    letterSpacing: 0.8
  },
  membersCardSubtitle: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A'
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitials: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#B4B6C0'
  },
  memberInfoCol: {
    flex: 1
  },
  memberName: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#F4F3F0',
    marginBottom: 3
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  lockedStatusText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#3DE0A0'
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9924A'
  },
  awaitingStatusText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#C9924A'
  },
  nudgeButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  nudgeButtonText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#F4F3F0'
  },
  bulkNudgeContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 8
  },
  bulkNudgeSubtext: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A',
    textAlign: 'center',
    lineHeight: 15
  },
  // Ticket Card Styles
  ticketCardContainer: {
    marginBottom: 16
  },
  ticketCard: {
    backgroundColor: '#13151E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden'
  },
  ticketTopSection: {
    padding: 16,
    alignItems: 'center'
  },
  ticketCodeLabel: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#8B8D98',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  ticketCodeHeading: {
    fontFamily: fontDisplay,
    fontSize: 26,
    color: '#F4F3F0',
    letterSpacing: 2
  },
  perforationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative'
  },
  notchLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#050608',
    marginLeft: -10
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#050608',
    marginRight: -10,
    marginLeft: 'auto'
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'dashed'
  },
  ticketBottomSection: {
    padding: 16
  },
  whatsAppButton: {
    backgroundColor: '#3DE0A0',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  whatsAppButtonText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    color: '#0B3B22'
  },
  // Matrix Quick Card Styles
  matrixQuickCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  matrixQuickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  matrixIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  matrixQuickTitle: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#F4F3F0',
    marginBottom: 2
  },
  matrixQuickSub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98'
  },
  // Bottom Sticky Bar
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
  primaryActionButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center'
  },
  primaryActionButtonText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    color: '#F4F3F0'
  }
});