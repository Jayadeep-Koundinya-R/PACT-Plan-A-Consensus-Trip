import { useNotificationStore } from '../../../src/store/useNotificationStore';
import { NotificationCenterModal } from '../../../src/components/NotificationCenterModal';
import { NotificationToast } from '../../../src/components/NotificationToast';
import { CircleRouteGuard } from '../../../src/components/common';
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
import { useCircleStore } from '../../../src/store/useCircleStore';
import { useCircleRealtime } from '../../../src/hooks/useCircleRealtime';
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
  Bell,
  Settings,
  Zap,
  Send,
  Users
} from 'lucide-react-native';

export default function PactCirclesHub() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }
  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], members = [], activeGroupId, setActiveGroup, activeDemoScenario = "early_bird", fetchGroupDataFromCloud } = useGatherlyStore();

  useEffect(() => {
    if (id && id !== 'undefined' && id !== '[id]') {
      fetchGroupDataFromCloud(id);
    }
  }, [id]);
  const circleFromStore = useCircleStore((s) => s.getCircle(id as string || 'circle-college-reunion-2026'));
  const { isConnected, lastEvent, lastUpdated, simulateSecondDeviceSubmission } = useCircleRealtime(id as string || 'circle-college-reunion-2026');

  const rawId = (id && id !== 'undefined') ? id : undefined;
  const currentGroup =
    (rawId ? groups.find((g) => g && g.id === rawId) : undefined) ||
    (activeGroupId && activeGroupId !== 'undefined' ? groups.find((g) => g && g.id === activeGroupId) : undefined) ||
    groups[0] || {
      id: 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82',
      organizerId: 'user-maya-001',
      status: 'voting' as const,
      totalMembersCount: 5
    };

  const [nudged, setNudged] = useState<Record<string, boolean>>({});
  const [bulkNudged, setBulkNudged] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { openNotificationCenter, notifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Pulse animation for awaiting dot
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web'
        })
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // Dynamic circle members connected to live Supabase Realtime & Store
  const storeMembers = circleFromStore?.members?.map(m => ({
    name: m.name,
    status: m.status
  }));

  const [localMembersOverride, setLocalMembersOverride] = useState<any[] | null>(null);

  const demoMembers = localMembersOverride || (storeMembers && storeMembers.length > 0 ? storeMembers : (activeDemoScenario === 'early_bird' ? [
    { name: 'You', status: 'locked' as const },
    { name: 'Alex', status: 'waiting' as const },
    { name: 'Sam', status: 'waiting' as const },
    { name: 'Jordan', status: 'waiting' as const },
    { name: 'Maya', status: 'waiting' as const }
  ] : [
    { name: 'You', status: 'locked' as const },
    { name: 'Alex', status: 'locked' as const },
    { name: 'Sam', status: 'locked' as const },
    { name: 'Jordan', status: 'locked' as const },
    { name: 'Maya', status: 'locked' as const }
  ]));

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
    haptics.success();
    simulateSecondDeviceSubmission('Sam');
    setLocalMembersOverride((prev) => {
      const base = prev || demoMembers;
      if (base.filter((m: any) => m.status === 'locked').length <= 2) {
        return base.map((m: any, idx: number) => (idx === 2 ? { ...m, status: 'locked' as const } : m));
      } else {
        return base.map((m: any, idx: number) => (idx >= 2 ? { ...m, status: 'waiting' as const } : m));
      }
    });
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row: Dedicated Title Row + Secondary Meta Row */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
              <Text style={styles.tripTitle} numberOfLines={2}>
                {currentGroup.name || 'Goa Beach Escape 2026'}
              </Text>

              <View style={styles.headerRightActions}>
                <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.7} style={styles.inviteCodeBadge}>
                  <Text style={styles.inviteCodeText}>{copiedCode ? 'COPIED!' : currentGroup.inviteCode || 'GOA-4F82'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    openNotificationCenter();
                  }}
                  activeOpacity={0.7}
                  style={[styles.settingsBtn, { position: 'relative' }]}
                >
                  <Bell size={16} color="#F0B24A" />
                  {unreadCount > 0 && <View style={styles.hubNotifDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/settings' as any)}
                  activeOpacity={0.7}
                  style={styles.settingsBtn}
                >
                  <Settings size={16} color="#C3BAA6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Status and Live Event Bar */}
            <View style={styles.headerMetaRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={toggleDemoSimulation}
                style={[
                  styles.realtimePill,
                  !isConnected && styles.realtimePillOffline
                ]}
                accessibilityLabel="Live Realtime Sync Indicator"
              >
                <View style={[
                  styles.realtimeDot,
                  isConnected && styles.realtimeDotConnected
                ]} />
                <Text style={[
                  styles.realtimeText,
                  !isConnected && styles.realtimeTextOffline
                ]}>
                  {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
                </Text>
              </TouchableOpacity>

              {lastEvent && (
                <View style={styles.realtimeEventBadge}>
                  <Text style={styles.realtimeEventText} numberOfLines={1}>
                    ·· {lastEvent}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Early Bird State Banner (when <= 2 responded) OR Standard Ring Meter (when > 2 responded) */}
          {isEarlyBird ? (
            <View style={styles.earlyBirdCard}>
              <View style={styles.earlyBirdBadgeRow}>
                <View style={styles.earlyBirdTag}>
                  <Zap size={13} color="#25C9A0" fill="#25C9A0" />
                  <Text style={styles.earlyBirdTagText}>Early bird activated</Text>
                </View>
                <TouchableOpacity onPress={toggleDemoSimulation} activeOpacity={0.7}>
                  <Text style={styles.earlyBirdCountText}>{lockedCount} of {totalCount} locked in</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.earlyBirdTitle}>You're leading the charge</Text>
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
                    stroke="rgba(253, 249, 239, 0.14)"
                    strokeWidth="7"
                  />
                  <Circle
                    cx="42"
                    cy="42"
                    r={r}
                    fill="none"
                    stroke="#25C9A0"
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
                  <Text style={styles.statusHeaderLabel}>Group consensus status</Text>
                  <TouchableOpacity onPress={toggleDemoSimulation} activeOpacity={0.7}>
                    <Text style={{ fontFamily: fontUI, fontSize: 10, color: '#9C947F' }}>toggle</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.statusSubtext}>
                  {lockedCount >= totalCount ? `All ${totalCount} members locked in! Unanimous consensus ready.` : `${lockedCount} of ${totalCount} members locked in! Consensus algorithms active.`}
                </Text>
              </View>
            </View>
          )}

          {/* Members Response List */}
          <View style={styles.membersCard}>
            <View style={styles.membersCardHeader}>
              <Text style={styles.membersCardTitle}>Member responses</Text>
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
                        <Circle cx="6" cy="6" r="6" fill="#25C9A0" fillOpacity={0.15} />
                        <Path
                          d="M3.3 6.2l1.8 1.8 3.6-3.8"
                          fill="none"
                          stroke="#25C9A0"
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
                      nudged[m.name] && { borderColor: 'rgba(253, 249, 239, 0.11)' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.nudgeButtonText,
                        nudged[m.name] && { color: '#9C947F' }
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
                  icon={<Send size={14} color="#0C1120" />}
                >
                  {bulkNudged ? 'WhatsApp nudge sent' : 'Nudge everyone on WhatsApp'}
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
                <Text style={styles.ticketCodeLabel}>Circle invite code</Text>
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
                      fill="#0B3327"
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
                <Sparkles size={16} color="#25C9A0" />
              </View>
              <View>
                <Text style={styles.matrixQuickTitle}>Live Consensus Engine</Text>
                <Text style={styles.matrixQuickSub}>Preview ranked destinations & overlap</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#9C947F" />
          </TouchableOpacity>
        </ScrollView>
        <NotificationCenterModal />
        <NotificationToast />

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
  hubNotifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#C1503F'
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#0C1120',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    backgroundColor: '#0C1120'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90
  },
  headerContainer: {
    marginBottom: 16
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  tripTitle: {
    fontFamily: fontDisplay,
    fontSize: 22,
    color: '#FDF9EF',
    flex: 1,
    lineHeight: 28
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  realtimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 201, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 201, 160, 0.28)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5
  },
  realtimePillOffline: {
    backgroundColor: 'rgba(253, 249, 239, 0.1)',
    borderColor: 'rgba(253, 249, 239, 0.18)'
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C3BAA6'
  },
  realtimeDotConnected: {
    backgroundColor: '#25C9A0',
    shadowColor: '#25C9A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4
  },
  realtimeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#25C9A0',
    fontWeight: '700',
    letterSpacing: 0.5
  },
  realtimeTextOffline: {
    color: '#C3BAA6'
  },
  realtimeEventBadge: {
    backgroundColor: 'rgba(253, 249, 239, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    maxWidth: 240
  },
  realtimeEventText: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#C3BAA6'
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  inviteCodeBadge: {
    backgroundColor: 'rgba(253, 249, 239, 0.11)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  inviteCodeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#F0B24A'
  },
  settingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(253, 249, 239, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Early Bird Encouraging Banner Styles
  earlyBirdCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(37, 201, 160, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#25C9A0',
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
    backgroundColor: 'rgba(37, 201, 160, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12
  },
  earlyBirdTagText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#25C9A0',
    letterSpacing: 0.5
  },
  earlyBirdCountText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#C3BAA6',
    letterSpacing: 0.5
  },
  earlyBirdTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    color: '#FDF9EF',
    marginBottom: 6
  },
  earlyBirdDesc: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#C3BAA6',
    lineHeight: 18,
    marginBottom: 14
  },
  earlyBirdProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(253, 249, 239, 0.14)',
    borderRadius: 3,
    position: 'relative',
    marginBottom: 8
  },
  earlyBirdProgressFill: {
    height: '100%',
    backgroundColor: '#25C9A0',
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
    backgroundColor: '#25C9A0'
  },
  thresholdText: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#25C9A0'
  },
  // Standard Status Card Styles
  statusCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
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
    color: '#FDF9EF'
  },
  progressSubLabel: {
    fontFamily: fontUI,
    fontSize: 8.5,
    color: '#9C947F',
    textTransform: 'lowercase'
  },
  statusTextCol: {
    flex: 1
  },
  statusHeaderLabel: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#C3BAA6',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  statusSubtext: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#FDF9EF',
    lineHeight: 18
  },
  // Members List Styles
  membersCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
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
    color: '#C3BAA6',
    letterSpacing: 0.8
  },
  membersCardSubtitle: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#9C947F'
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(253, 249, 239, 0.1)'
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(253, 249, 239, 0.11)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitials: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#D8D0BC'
  },
  memberInfoCol: {
    flex: 1
  },
  memberName: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#FDF9EF',
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
    color: '#25C9A0'
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0B24A'
  },
  awaitingStatusText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#F0B24A'
  },
  nudgeButton: {
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  nudgeButtonText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#FDF9EF'
  },
  bulkNudgeContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(253, 249, 239, 0.11)',
    gap: 8
  },
  bulkNudgeSubtext: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#9C947F',
    textAlign: 'center',
    lineHeight: 15
  },
  // Ticket Card Styles
  ticketCardContainer: {
    marginBottom: 16
  },
  ticketCard: {
    backgroundColor: '#1E2742',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
    overflow: 'hidden'
  },
  ticketTopSection: {
    padding: 16,
    alignItems: 'center'
  },
  ticketCodeLabel: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#C3BAA6',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  ticketCodeHeading: {
    fontFamily: fontDisplay,
    fontSize: 26,
    color: '#FDF9EF',
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
    backgroundColor: '#0C1120',
    marginLeft: -10
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0C1120',
    marginRight: -10,
    marginLeft: 'auto'
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.18)',
    borderStyle: 'dashed'
  },
  ticketBottomSection: {
    padding: 16
  },
  whatsAppButton: {
    backgroundColor: '#25C9A0',
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
    color: '#0B3327'
  },
  // Matrix Quick Card Styles
  matrixQuickCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
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
    backgroundColor: 'rgba(37, 201, 160, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  matrixQuickTitle: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#FDF9EF',
    marginBottom: 2
  },
  matrixQuickSub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#C3BAA6'
  },
  // Bottom Sticky Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(12, 17, 32, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(253, 249, 239, 0.11)'
  },
  primaryActionButton: {
    backgroundColor: '#F0B24A',
    borderWidth: 1,
    borderColor: '#F0B24A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center'
  },
  primaryActionButtonText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    color: '#2A1A05'
  }
});