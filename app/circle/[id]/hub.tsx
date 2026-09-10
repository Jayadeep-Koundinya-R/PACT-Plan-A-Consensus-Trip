import { AddPeopleModal } from '../../../src/components/AddPeopleModal';
import { InviteQRModal } from '../../../src/components/InviteQRModal';
import { P2PConsensusModal } from '../../../src/components/P2PConsensusModal';
import { useShareInvite, formatInviteMessage } from '../../../src/hooks/useShareInvite';
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
  Vote,
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
  Users,
  UserPlus,
  QrCode,
  Radio
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
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isP2POpen, setIsP2POpen] = useState(false);
  const { shareInvite, shareToWhatsApp, shareNudge, copyInviteCode, copyInviteLink } = useShareInvite();
  const { openNotificationCenter, notifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Awaiting dot is kept calm and steady to prevent visual jitter

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
    await shareNudge({
      groupName: currentGroup.name || 'Trip Circle',
      inviteCode: code,
      lockedCount,
      neededCount: needed
    });
  };

  const handleCopyCode = async () => {
    const code = currentGroup.inviteCode || 'GOA-4F82';
    await copyInviteCode(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = async () => {
    haptics.action();
    const code = currentGroup.inviteCode || 'GOA-4F82';
    const message = formatInviteMessage(currentGroup.name || 'Trip Circle', code);
    await shareToWhatsApp({ message, inviteCode: code });
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    router.push('/(tabs)/home');
                  }}
                  activeOpacity={0.7}
                  style={styles.backHomeBtn}
                  accessibilityLabel="Back to My Circles"
                >
                  <ArrowLeft size={18} color="#F4F3F0" />
                </TouchableOpacity>
                <Text style={styles.tripTitle} numberOfLines={2}>
                  {currentGroup.name || 'Goa Beach Escape 2026'}
                </Text>
              </View>

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
                  <Bell size={16} color="#FF5A5F" />
                  {unreadCount > 0 && <View style={styles.hubNotifDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/settings' as any)}
                  activeOpacity={0.7}
                  style={styles.settingsBtn}
                >
                  <Settings size={16} color="#8B8D98" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Status and Live Event Bar */}
            <View style={styles.headerMetaRow}>
              <View
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
              </View>

              {lastEvent && (
                <View style={styles.realtimeEventBadge}>
                  <Zap size={11} color="#3DE0A0" />
                  <Text style={styles.realtimeEventText} numberOfLines={1}>
                    {lastEvent}
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
                  <Zap size={13} color="#3DE0A0" fill="#3DE0A0" />
                  <Text style={styles.earlyBirdTagText}>Early bird activated</Text>
                </View>
                <Text style={styles.earlyBirdCountText}>{lockedCount} of {totalCount} locked in</Text>
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
                    stroke="rgba(255, 255, 255, 0.14)"
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
                  <Text style={styles.statusHeaderLabel}>Group consensus status</Text>
                  <Text style={{ fontFamily: fontUI, fontSize: 10, color: '#6C6F7A' }}>{lockedCount}/{totalCount} locked</Text>
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
              <View>
                <Text style={styles.membersCardTitle}>Member responses</Text>
                <Text style={styles.membersCardSubtitle}>{totalCount - lockedCount} pending</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  haptics.tap();
                  setIsAddPeopleOpen(true);
                }}
                activeOpacity={0.8}
                style={styles.addPeopleHeaderBtn}
                accessibilityLabel="Add people to trip circle"
              >
                <UserPlus size={13} color="#3DE0A0" />
                <Text style={styles.addPeopleHeaderBtnText}>+ Add People</Text>
              </TouchableOpacity>
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
                      <View style={styles.awaitingDot} />
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
                      nudged[m.name] && { borderColor: 'rgba(255, 255, 255, 0.11)' }
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
                      fill="#0B3B22"
                    />
                  </Svg>
                  <Text style={styles.whatsAppButtonText}>Share to WhatsApp group</Text>
                </TouchableOpacity>

                <View style={styles.ticketSecondaryActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.tap();
                      setIsAddPeopleOpen(true);
                    }}
                    style={styles.ticketSecondaryBtn}
                  >
                    <Share2 size={13} color="#E8ECF2" />
                    <Text style={styles.ticketSecondaryBtnText}>Invite Sheet</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.tap();
                      setIsQROpen(true);
                    }}
                    style={styles.ticketSecondaryBtn}
                  >
                    <QrCode size={13} color="#D4AF37" />
                    <Text style={[styles.ticketSecondaryBtnText, { color: '#D4AF37' }]}>QR Pass</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.tap();
                      setIsP2POpen(true);
                    }}
                    style={styles.ticketSecondaryBtn}
                  >
                    <Radio size={13} color="#3DE0A0" />
                    <Text style={[styles.ticketSecondaryBtnText, { color: '#3DE0A0' }]}>P2P Sync</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* PACT Poll Quick Action Card */}
          <TouchableOpacity
            onPress={() => router.push(`/circle/${currentGroup.id}/silent-ballot` as any)}
            activeOpacity={0.85}
            style={styles.pactPollCard}
            accessibilityLabel="Open PACT Poll: Sealed Anti-Herd Voting"
          >
            <View style={styles.pactPollLeft}>
              <View style={styles.pactPollIconBox}>
                <Vote size={18} color="#3DE0A0" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.pactPollTitle}>Active PACT Poll</Text>
                  <View style={styles.pactPollBadge}>
                    <Text style={styles.pactPollBadgeText}>SEALED</Text>
                  </View>
                </View>
                <Text style={styles.pactPollSub}>
                  Cast Love (+2), Down (+1), or Veto (-999) stance without peer pressure
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#3DE0A0" />
          </TouchableOpacity>

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
        {/* Add People Lightweight Share Sheet */}
        <AddPeopleModal
          visible={isAddPeopleOpen}
          groupName={currentGroup.name || 'Trip Circle'}
          inviteCode={currentGroup.inviteCode || 'GOA-4F82'}
          onClose={() => setIsAddPeopleOpen(false)}
          onOpenQR={() => setIsQROpen(true)}
        />

        {/* In-Person QR Pass Modal */}
        <InviteQRModal
          visible={isQROpen}
          groupName={currentGroup.name || 'Trip Circle'}
          inviteCode={currentGroup.inviteCode || 'GOA-4F82'}
          onClose={() => setIsQROpen(false)}
        />

        {/* In-Person P2P Consensus Modal */}
        <P2PConsensusModal
          visible={isP2POpen}
          circleId={currentGroup.id}
          circleName={currentGroup.name || 'Trip Circle'}
          currentUserId={members[0]?.userId || 'user-organizer'}
          currentUserName={members[0]?.userName || 'You'}
          userBudget={750}
          userDates={['2026-10-15', '2026-10-16', '2026-10-17']}
          userDealbreakers={[]}
          userApprovals={{ 'dest-goa': true, 'dest-coorg': true }}
          candidates={[
            {
              id: 'dest-goa',
              name: 'Goa Coastal Villa',
              estimatedCost: 550,
              availableDates: ['2026-10-15', '2026-10-16', '2026-10-17'],
              tags: ['beach', 'nightlife'],
            },
            {
              id: 'dest-coorg',
              name: 'Coorg Coffee Estate',
              estimatedCost: 450,
              availableDates: ['2026-10-15', '2026-10-16'],
              tags: ['nature', 'mountains'],
            },
          ]}
          isDarkMode={true}
          onClose={() => setIsP2POpen(false)}
          onConsensusApplied={() => {
            haptics.success();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backHomeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pactPollCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12
  },
  pactPollLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  pactPollIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pactPollTitle: {
    fontFamily: fontDisplay,
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  pactPollBadge: {
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  pactPollBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#3DE0A0'
  },
  pactPollSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    marginTop: 2
  },
  hubNotifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444'
  },
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
    color: '#F4F3F0',
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
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.28)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5
  },
  realtimePillOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.18)'
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B8D98'
  },
  realtimeDotConnected: {
    backgroundColor: '#3DE0A0',
    shadowColor: '#3DE0A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4
  },
  realtimeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#3DE0A0',
    fontWeight: '700',
    letterSpacing: 0.5
  },
  realtimeTextOffline: {
    color: '#8B8D98'
  },
  realtimeEventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    maxWidth: 240
  },
  realtimeEventText: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#8B8D98'
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  inviteCodeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  inviteCodeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FF5A5F'
  },
  settingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
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
    borderColor: 'rgba(255, 255, 255, 0.14)',
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
    borderColor: 'rgba(255, 255, 255, 0.14)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.1)'
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
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
  awaitingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B'
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B'
  },
  awaitingStatusText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#FF5A5F'
  },
  nudgeButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.11)',
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
    borderColor: 'rgba(255, 255, 255, 0.14)',
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
    borderColor: 'rgba(255, 255, 255, 0.18)',
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
    borderColor: 'rgba(255, 255, 255, 0.14)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.11)'
  },
  primaryActionButton: {
    backgroundColor: '#FF5A5F',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center'
  },
  primaryActionButtonText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    color: '#2E0805'
  },
  addPeopleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.28)'
  },
  addPeopleHeaderBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#3DE0A0',
    letterSpacing: 0.4
  },
  ticketSecondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%'
  },
  ticketSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.btn,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  ticketSecondaryBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#E8ECF2'
  },
});

