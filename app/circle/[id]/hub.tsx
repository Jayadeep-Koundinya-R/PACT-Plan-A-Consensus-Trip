import { AddPeopleModal } from '../../../src/components/AddPeopleModal';
import { InviteQRModal } from '../../../src/components/InviteQRModal';
import { useShareInvite, formatInviteMessage } from '../../../src/hooks/useShareInvite';
import { useNotificationStore } from '../../../src/store/useNotificationStore';
import { NotificationCenterModal } from '../../../src/components/NotificationCenterModal';
import { NotificationToast } from '../../../src/components/NotificationToast';
import { CircleRouteGuard } from '../../../src/components/common';
import { SkeletonLoader } from '../../../src/components/SkeletonLoader';
import { EmptyState } from '../../../src/components/EmptyState';
import React, { useState, useEffect } from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { useCircleStore } from '../../../src/store/useCircleStore';
import { getActiveUserName, getActiveUserId, isDemoPersona } from '../../../src/lib/user/identity';
import { JudgeSandboxBar } from '../../../src/components/JudgeSandboxBar';
import { ProCircleInheritanceCard } from '../../../src/components/ProCircleInheritanceCard';
import { useCircleRealtime } from '../../../src/hooks/useCircleRealtime';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { PactButton } from '../../../src/components/common';
import {
  ArrowLeft,
  MessageSquare,
  Vote,
  Share2,
  Sparkles,
  Bell,
  Settings,
  Zap,
  Send,
  UserPlus,
  QrCode,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Mic
} from 'lucide-react-native';
import { VoiceCapsuleRecorder } from '../../../src/components/audio/VoiceCapsuleRecorder';
import { VoiceCapsuleList, VoiceCapsuleItem } from '../../../src/components/audio/VoiceCapsuleList';

export default function PactCirclesHub() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }

  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], activeGroupId, activeDemoScenario = 'early_bird', fetchGroupDataFromCloud, setDemoScenario } = useGatherlyStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [voiceCapsules, setVoiceCapsules] = useState<VoiceCapsuleItem[]>([]);
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);

  const activeUserId = getActiveUserId();
  const activeUserName = getActiveUserName();

  useEffect(() => {
    let mounted = true;
    if (id && id !== 'undefined' && id !== '[id]') {
      setIsLoading(true);
      setLoadError(null);
      fetchGroupDataFromCloud(id)
        .then(() => {
          if (mounted) setIsLoading(false);
        })
        .catch((err) => {
          if (mounted) {
            setIsLoading(false);
            setLoadError('Failed to sync circle data. Using cached offline state.');
          }
        });
    } else {
      setIsLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [id]);

  const circleFromStore = useCircleStore((s) => s.getCircle(id as string || 'circle-college-reunion-2026'));
  const { isConnected, lastEvent, simulateSecondDeviceSubmission } = useCircleRealtime(id as string || 'circle-college-reunion-2026');

  const rawId = (id && id !== 'undefined') ? id : undefined;
  const currentGroup =
    (rawId ? groups.find((g) => g && g.id === rawId) : undefined) ||
    (rawId && circleFromStore ? {
      id: circleFromStore.id,
      name: circleFromStore.name,
      inviteCode: circleFromStore.inviteCode,
      organizerId: circleFromStore.organizerId,
      organizerName: circleFromStore.organizerName,
      status: circleFromStore.status,
      totalMembersCount: circleFromStore.totalMembersCount,
      hasPro: circleFromStore.hasPro
    } : undefined) ||
    (activeGroupId && activeGroupId !== 'undefined' ? groups.find((g) => g && g.id === activeGroupId) : undefined) ||
    (circleFromStore ? {
      id: circleFromStore.id,
      name: circleFromStore.name,
      inviteCode: circleFromStore.inviteCode,
      organizerId: circleFromStore.organizerId,
      organizerName: circleFromStore.organizerName,
      status: circleFromStore.status,
      totalMembersCount: circleFromStore.totalMembersCount,
      hasPro: circleFromStore.hasPro
    } : undefined) ||
    (groups.length > 0 ? groups[0] : undefined) || {
      id: (rawId && rawId !== 'undefined') ? rawId : 'circle-college-reunion-2026',
      name: 'Trip Circle',
      inviteCode: 'PACT-CODE',
      organizerId: activeUserId || 'user-maya-001',
      status: 'collecting' as const,
      totalMembersCount: 5,
      hasPro: false
    };

  const isProCircle = Boolean((currentGroup as any)?.hasPro || (currentGroup as any)?.has_pro || circleFromStore?.hasPro || useGatherlyStore.getState().subscriptionPlan !== 'free');

  const [nudged, setNudged] = useState<Record<string, boolean>>({});
  const [bulkNudged, setBulkNudged] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const { shareToWhatsApp, shareNudge, copyInviteCode } = useShareInvite();
  const { openNotificationCenter, notifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isDemoCircle = currentGroup?.id === 'circle-college-reunion-2026';

  const storeMembers = circleFromStore?.members?.map(m => {
    const isCurrentUser = m.userId === activeUserId || m.name.toLowerCase() === activeUserName.toLowerCase();
    const isOrganizer = m.userId === (circleFromStore.organizerId || currentGroup.organizerId) || m.name.includes('(Organizer)');
    let cleanName = m.name.replace(/\s*\(You\)/gi, '').replace(/\s*\(Organizer\)/gi, '').trim();
    let displayName = cleanName;
    if (isOrganizer && isCurrentUser) {
      displayName = `${cleanName} (Organizer, You)`;
    } else if (isOrganizer) {
      displayName = `${cleanName} (Organizer)`;
    } else if (isCurrentUser) {
      displayName = `${cleanName} (You)`;
    }
    return {
      userId: m.userId,
      name: displayName,
      rawName: cleanName,
      status: m.status
    };
  });

  const [localMembersOverride, setLocalMembersOverride] = useState<any[] | null>(null);

  const demoMembers: any[] = localMembersOverride || (storeMembers && storeMembers.length > 0 ? storeMembers : (isDemoCircle ? (activeDemoScenario === 'early_bird' ? [
    { name: `${activeUserName} (You)`, status: 'locked' as const },
    { name: 'Alex P.', status: 'waiting' as const },
    { name: 'Sam', status: 'waiting' as const },
    { name: 'Jordan', status: 'waiting' as const },
    { name: 'Maya', status: 'waiting' as const }
  ] : [
    { name: `${activeUserName} (You)`, status: 'locked' as const },
    { name: 'Alex P.', status: 'locked' as const },
    { name: 'Sam', status: 'locked' as const },
    { name: 'Jordan', status: 'locked' as const },
    { name: 'Maya', status: 'locked' as const }
  ]) : [
    { name: `${currentGroup?.organizerName || activeUserName} (Organizer, You)`, status: 'locked' as const }
  ]));

  const currentUserMember = demoMembers.find((m: any) =>
    (m.userId && m.userId === activeUserId) ||
    m.name.includes('(You)') ||
    m.name === `${activeUserName} (You)` ||
    m.name === activeUserName
  ) || demoMembers[0];
  const isCurrentUserLocked = currentUserMember?.status === 'locked';

  const lockedCount = demoMembers.filter((m: any) => m.status === 'locked').length;
  const targetCapacity = circleFromStore?.totalMembersCount || currentGroup?.totalMembersCount || 5;
  const totalCount = Math.max(targetCapacity, demoMembers.length);
  const isEarlyBird = lockedCount <= 2;
  const pct = Math.min(1, lockedCount / totalCount);
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const waitingMembers = demoMembers.filter((m: any) => m.status === 'waiting');
  const openSeatsCount = Math.max(0, targetCapacity - demoMembers.length);

  const initials = (name: string) => name.slice(0, 2).toUpperCase();

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
    haptics.tap();
    const code = currentGroup.inviteCode || 'GOA-4F82';
    try {
      await copyInviteCode(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.warn('[Hub] Failed to copy invite code:', err);
    }
  };

  const handleShareWhatsApp = async () => {
    haptics.action();
    const code = currentGroup.inviteCode || 'GOA-4F82';
    const message = formatInviteMessage(currentGroup.name || 'Trip Circle', code);
    await shareToWhatsApp({ message, inviteCode: code });
  };

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

  const handleFastForwardConsensus = () => {
    haptics.success();
    setDemoScenario('consensus');
    Alert.alert(
      '⚡ Fast-Forward Consensus Active',
      'Circle primed with 5 members, 100% agreement, and top option locked. Proceed to Silent Ballot or Ranked Matrix!'
    );
  };

  // State-Dependent Dominant Action Handler
  const renderDominantCTA = () => {
    const tripStatus = currentGroup.status || 'collecting';

    if (tripStatus === 'finalized') {
      return (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              haptics.action();
              router.push(`/circle/${currentGroup.id}/brief` as any);
            }}
            style={[styles.primaryActionButton, { backgroundColor: '#3DE0A0', borderColor: '#3DE0A0' }]}
            accessibilityLabel="View Final Trip Brief"
          >
            <FileText size={18} color="#052E20" />
            <Text style={[styles.primaryActionButtonText, { color: '#052E20' }]}>
              View Final Trip Brief
            </Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>Trip consensus is locked and sealed.</Text>
        </View>
      );
    }

    if (!isCurrentUserLocked) {
      return (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              haptics.tap();
              router.push(`/circle/${currentGroup.id}/preferences` as any);
            }}
            style={styles.primaryActionButton}
            accessibilityLabel="Set My Preferences"
          >
            <SlidersHorizontal size={18} color="#2E0805" />
            <Text style={styles.primaryActionButtonText}>
              Set / Update My Preferences
            </Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>Your constraints remain 100% private and sealed.</Text>
        </View>
      );
    }

    if (isEarlyBird) {
      return (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleBulkWhatsAppNudge}
            style={[styles.primaryActionButton, { backgroundColor: '#3DE0A0', borderColor: '#3DE0A0' }]}
            accessibilityLabel="Nudge Group on WhatsApp"
          >
            <Send size={18} color="#0B3B22" />
            <Text style={[styles.primaryActionButtonText, { color: '#0B3B22' }]}>
              {bulkNudged ? 'Nudge Dispatched on WhatsApp' : 'Nudge Group on WhatsApp'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>You've locked in. {3 - lockedCount} more response(s) needed to unlock consensus.</Text>
        </View>
      );
    }

    return (
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            haptics.action();
            router.push(`/circle/${currentGroup.id}/silent-ballot` as any);
          }}
          style={styles.primaryActionButton}
          accessibilityLabel="Proceed to Silent Ballot"
        >
          <Vote size={18} color="#2E0805" />
          <Text style={styles.primaryActionButtonText}>
            Proceed to Silent Ballot
          </Text>
        </TouchableOpacity>
        <Text style={styles.ctaSubtext}>Consensus match ready. Cast your anonymous vote.</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <View style={styles.phoneFrame}>
          <View style={styles.scrollContent}>
            <View style={styles.loadingHeaderPlaceholder}>
              <View style={styles.backHomeBtn}>
                <ArrowLeft size={18} color="#F4F3F0" />
              </View>
              <Text style={styles.tripTitle}>Loading Trip Circle...</Text>
            </View>
            <SkeletonLoader count={3} height={110} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentGroup && !isLoading) {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <View style={styles.phoneFrame}>
          <View style={styles.scrollContent}>
            <EmptyState
              icon="compass"
              title="Circle Not Found"
              description="This trip circle does not exist or may have been deleted."
              actionLabel="Return to My Circles"
              onAction={() => router.push('/(tabs)/home')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        {(isDemoCircle || isDemoPersona(activeUserId)) && (
          <JudgeSandboxBar
            circleId={currentGroup.id}
            onFastForward={handleFastForwardConsensus}
            onReset={() => {
              useCircleStore.getState().loadDemoCircle();
              useGatherlyStore.getState().resetDemoState();
            }}
          />
        )}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleGroup}>
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
                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    setShowVoiceDrawer((prev) => !prev);
                  }}
                  activeOpacity={0.7}
                  style={[styles.headerIconBtn, showVoiceDrawer && { backgroundColor: 'rgba(255, 90, 95, 0.2)' }]}
                  accessibilityLabel="Voice Capsules Drawer"
                >
                  <Mic size={16} color="#FF5A5F" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    openNotificationCenter();
                  }}
                  activeOpacity={0.7}
                  style={[styles.headerIconBtn, { position: 'relative' }]}
                  accessibilityLabel="Notification Center"
                >
                  <Bell size={16} color="#FF5A5F" />
                  {unreadCount > 0 && <View style={styles.hubNotifDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    router.push(`/circle/${currentGroup.id}/chat` as any);
                  }}
                  activeOpacity={0.7}
                  style={styles.headerIconBtn}
                  accessibilityLabel="Circle Chat"
                >
                  <MessageSquare size={16} color="#3DE0A0" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/settings' as any)}
                  activeOpacity={0.7}
                  style={styles.headerIconBtn}
                  accessibilityLabel="Circle Settings"
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

              {lastEvent ? (
                <View style={styles.realtimeEventBadge}>
                  <Zap size={11} color="#3DE0A0" />
                  <Text style={styles.realtimeEventText} numberOfLines={1}>
                    {lastEvent}
                  </Text>
                </View>
              ) : (
                <View style={styles.realtimeEventBadge}>
                  <Clock size={11} color="#8B8D98" />
                  <Text style={styles.realtimeEventText}>
                    {isEarlyBird ? 'Phase 1: Collecting Preferences' : 'Phase 2: Silent Voting Open'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Pro Circle Inheritance Card by RevenueCat */}
          <ProCircleInheritanceCard
            hasPro={isProCircle}
            organizerName={currentGroup.organizerName || 'Maya'}
            totalMembersCount={totalCount}
          />

          {loadError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{loadError}</Text>
            </View>
          )}

          {/* Voice Capsules Section */}
          {showVoiceDrawer && (
            <View style={styles.voiceSectionBox}>
              {Platform.OS === 'web' && (
                <View style={styles.webVoiceHelperPill}>
                  <Mic size={12} color="#FF5A5F" />
                  <Text style={styles.webVoiceHelperText}>
                    Voice capsules optimized for mobile devices
                  </Text>
                </View>
              )}
              <VoiceCapsuleRecorder
                onRecordingComplete={(newCap) => {
                  setVoiceCapsules((prev) => [
                    {
                      id: newCap.id,
                      authorName: newCap.authorName,
                      durationSeconds: newCap.durationSeconds,
                      createdAt: newCap.createdAt
                    },
                    ...prev
                  ]);
                }}
              />
              <VoiceCapsuleList capsules={voiceCapsules} />
            </View>
          )}

          {/* Phase Hero Status Banner */}
          {isEarlyBird ? (
            <View style={styles.earlyBirdCard}>
              <View style={styles.earlyBirdBadgeRow}>
                <View style={styles.earlyBirdTag}>
                  <Zap size={13} color="#3DE0A0" fill="#3DE0A0" />
                  <Text style={styles.earlyBirdTagText}>Early bird phase</Text>
                </View>
                <Text style={styles.earlyBirdCountText}>{lockedCount} of {totalCount} locked in</Text>
              </View>

              <Text style={styles.earlyBirdTitle}>
                {isCurrentUserLocked ? 'Your inputs are sealed' : 'Lead the charge'}
              </Text>
              <Text style={styles.earlyBirdDesc}>
                Consensus calculations unlock once 3 members lock in their preferences. Nudge remaining friends on WhatsApp!
              </Text>

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
                  <Text style={styles.progressSubLabel}>locked</Text>
                </View>
              </View>

              <View style={styles.statusTextCol}>
                <Text style={styles.statusHeaderLabel}>Consensus Status</Text>
                <Text style={styles.statusSubtext}>
                  {lockedCount >= totalCount
                    ? `All ${totalCount} members locked in! Unanimous consensus calculated.`
                    : `${lockedCount} of ${totalCount} members locked in. Consensus engine active.`}
                </Text>
              </View>
            </View>
          )}

          {/* Member Responses Card */}
          <View style={styles.membersCard}>
            <View style={styles.membersCardHeader}>
              <View>
                <Text style={styles.membersCardTitle}>Member responses</Text>
                <Text style={styles.membersCardSubtitle}>
                  {waitingMembers.length > 0
                    ? `${waitingMembers.length} pending`
                    : (demoMembers.length <= 1
                      ? `${openSeatsCount} open seats remaining`
                      : 'All responses locked')}
                </Text>
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

            {demoMembers.length === 0 ? (
              <EmptyState
                icon="users"
                title="No Members Yet"
                description="Invite friends to your trip circle using your private code."
                actionLabel="+ Invite Friends"
                onAction={() => setIsAddPeopleOpen(true)}
              />
            ) : (
              demoMembers.map((m: any, i: number) => (
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
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      {isProCircle && !m.name.toLowerCase().includes('organizer') && (
                        <View style={styles.proGuestBadge}>
                          <Sparkles size={9} color="#3DE0A0" />
                          <Text style={styles.proGuestBadgeText}>Pro Guest</Text>
                        </View>
                      )}
                    </View>
                    {m.status === 'locked' ? (
                      <View style={styles.statusBadgeRow}>
                        <CheckCircle2 size={12} color="#3DE0A0" />
                        <Text style={styles.lockedStatusText}>Inputs locked</Text>
                      </View>
                    ) : (
                      <View style={styles.statusBadgeRow}>
                        <View style={styles.awaitingDot} />
                        <Text style={styles.awaitingStatusText}>Awaiting inputs</Text>
                      </View>
                    )}
                  </View>

                  {!isEarlyBird && m.status === 'waiting' && (
                    <TouchableOpacity
                      onPress={() => handleNudge(m.name)}
                      activeOpacity={0.7}
                      style={[
                        styles.nudgeButton,
                        nudged[m.name] && { borderColor: 'rgba(255, 255, 255, 0.11)' }
                      ]}
                      accessibilityLabel={`Nudge ${m.name}`}
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
              ))
            )}

            {openSeatsCount > 0 && (
              <View style={styles.openSeatsRow}>
                <View style={styles.openSeatsAvatar}>
                  <UserPlus size={15} color="#8B8D98" />
                </View>
                <View style={styles.memberInfoCol}>
                  <Text style={styles.openSeatsTitle}>
                    {openSeatsCount} open seat{openSeatsCount > 1 ? 's' : ''} awaiting friends
                  </Text>
                  <Text style={styles.openSeatsSubtext}>
                    Share code {currentGroup.inviteCode || '...'} to join
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    setIsAddPeopleOpen(true);
                  }}
                  activeOpacity={0.8}
                  style={styles.openSeatsActionBtn}
                  accessibilityLabel="Invite friends to open seat"
                >
                  <Text style={styles.openSeatsActionBtnText}>+ Invite</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Unified Invite Ticket Card */}
          <View style={styles.ticketCardContainer}>
            <View style={styles.ticketCard}>
              <View style={styles.ticketTopSection}>
                <Text style={styles.ticketCodeLabel}>Circle invite code</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCopyCode}
                  style={styles.codeCopyTouchable}
                  accessibilityLabel="Copy invite code"
                >
                  <Text style={styles.ticketCodeHeading}>
                    {currentGroup.inviteCode || 'GOA-4F82'}
                  </Text>
                  <Text style={styles.copyBadgeText}>{copiedCode ? 'COPIED!' : 'Tap to copy'}</Text>
                </TouchableOpacity>
              </View>

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
                  accessibilityLabel="Share to WhatsApp group"
                >
                  <Send size={15} color="#0B3B22" />
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
                    accessibilityLabel="Invite options"
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
                    accessibilityLabel="QR Pass"
                  >
                    <QrCode size={13} color="#D4AF37" />
                    <Text style={[styles.ticketSecondaryBtnText, { color: '#D4AF37' }]}>QR Pass</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Core Decision Navigation Cards */}
          <TouchableOpacity
            onPress={() => {
              haptics.tap();
              router.push(`/circle/${currentGroup.id}/ranked-matrix` as any);
            }}
            activeOpacity={0.85}
            style={styles.navCard}
            accessibilityLabel="Open Ranked Matrix"
          >
            <View style={styles.navCardLeft}>
              <View style={styles.navCardIconBox}>
                <Sparkles size={18} color="#3DE0A0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navCardTitle}>Ranked Matrix</Text>
                <Text style={styles.navCardSub}>
                  View deterministic ranked destinations and overlap
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#8B8D98" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              haptics.tap();
              router.push(`/circle/${currentGroup.id}/silent-ballot` as any);
            }}
            activeOpacity={0.85}
            style={styles.navCard}
            accessibilityLabel="Open Silent Ballot"
          >
            <View style={styles.navCardLeft}>
              <View style={[styles.navCardIconBox, { backgroundColor: 'rgba(255, 90, 95, 0.12)' }]}>
                <Vote size={18} color="#FF5A5F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navCardTitle}>Silent Ballot</Text>
                <Text style={styles.navCardSub}>
                  Cast private Approve / Reject votes with zero peer pressure
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#8B8D98" />
          </TouchableOpacity>

          {/* Visually Isolated Demo / Tester Controls */}
          <View style={styles.demoControlsContainer}>
            <Text style={styles.demoControlsTitle}>DEMO & SIMULATION CONTROLS</Text>

            <TouchableOpacity
              onPress={handleFastForwardConsensus}
              activeOpacity={0.8}
              style={styles.fastForwardBtn}
              accessibilityLabel="Judge Sandbox: Fast-Forward Consensus"
            >
              <Zap size={13} color="#052E20" fill="#052E20" />
              <Text style={styles.fastForwardBtnText}>
                ⚡ Judge Sandbox: Fast-Forward Consensus
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleDemoSimulation}
              activeOpacity={0.8}
              style={styles.demoSimulationBtn}
              accessibilityLabel="Simulate 3rd Member Locking In"
            >
              <RefreshCw size={12} color="#8B8D98" />
              <Text style={styles.demoSimulationBtnText}>
                {lockedCount <= 2 ? 'Simulate 3rd Member Lock-In (Unlock Match)' : 'Reset to Early Bird State'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.watermarkText}>
              Built for RevenueCat Shipathon 2026 · Next Gen Track
            </Text>
          </View>
        </ScrollView>

        <NotificationCenterModal />
        <NotificationToast />

        {/* State-Dependent Dominant Action Sticky Bottom Bar */}
        {renderDominantCTA()}

        <AddPeopleModal
          visible={isAddPeopleOpen}
          groupName={currentGroup.name || 'Trip Circle'}
          inviteCode={currentGroup.inviteCode || 'GOA-4F82'}
          circleId={currentGroup.id}
          onClose={() => setIsAddPeopleOpen(false)}
          onOpenQR={() => setIsQROpen(true)}
        />

        <InviteQRModal
          visible={isQROpen}
          groupName={currentGroup.name || 'Trip Circle'}
          inviteCode={currentGroup.inviteCode || 'GOA-4F82'}
          onClose={() => setIsQROpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  voiceSectionBox: {
    marginBottom: 16
  },
  webVoiceHelperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    marginBottom: 10,
    alignSelf: 'center'
  },
  webVoiceHelperText: {
    fontSize: 11,
    fontFamily: fontUIBold,
    fontWeight: '600',
    color: '#FF5A5F'
  },
  fastForwardBtn: {
    width: '100%',
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#3DE0A0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  fastForwardBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '800',
    color: '#052E20'
  },
  watermarkText: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#6C6F7A',
    textAlign: 'center',
    marginTop: 4
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
    paddingBottom: 110
  },
  loadingHeaderPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  backHomeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tripTitle: {
    fontFamily: fontDisplay,
    fontSize: 21,
    fontWeight: '700',
    color: '#F4F3F0',
    flex: 1,
    lineHeight: 26
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  hubNotifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444'
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10
  },
  proCircleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  proCircleBannerText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#3DE0A0',
    letterSpacing: 0.3
  },
  realtimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.28)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 5
  },
  realtimePillOffline: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B8D98'
  },
  realtimeDotConnected: {
    backgroundColor: '#3DE0A0'
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
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1
  },
  realtimeEventText: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#8B8D98'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14
  },
  errorBannerText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#EF4444',
    textAlign: 'center'
  },
  earlyBirdCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
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
    color: '#8B8D98'
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    position: 'relative',
    marginBottom: 6
  },
  earlyBirdProgressFill: {
    height: '100%',
    backgroundColor: '#3DE0A0',
    borderRadius: 3
  },
  unlockThresholdMarker: {
    position: 'absolute',
    left: '60%',
    top: 9,
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
    fontWeight: '700',
    color: '#F4F3F0'
  },
  progressSubLabel: {
    fontFamily: fontUI,
    fontSize: 8.5,
    color: '#8B8D98'
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
    fontSize: 12.5,
    color: '#F4F3F0',
    lineHeight: 18
  },
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
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3
  },
  proGuestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6
  },
  proGuestBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#3DE0A0'
  },
  memberName: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#F4F3F0'
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
  awaitingStatusText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#FF5A5F'
  },
  nudgeButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    paddingHorizontal: 14
  },
  nudgeButtonText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#F4F3F0'
  },
  addPeopleHeaderBtn: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
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
  openSeatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed'
  },
  openSeatsAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  openSeatsTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#8B8D98'
  },
  openSeatsSubtext: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A',
    marginTop: 1
  },
  openSeatsActionBtn: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  openSeatsActionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5A5F'
  },
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
  codeCopyTouchable: {
    alignItems: 'center',
    paddingVertical: 4
  },
  ticketCodeHeading: {
    fontFamily: fontDisplay,
    fontSize: 26,
    color: '#F4F3F0',
    letterSpacing: 2
  },
  copyBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#FF5A5F',
    marginTop: 2
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
    minHeight: 46,
    backgroundColor: '#3DE0A0',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  whatsAppButtonText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0B3B22'
  },
  ticketSecondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  ticketSecondaryBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  navCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12
  },
  navCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  navCardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navCardTitle: {
    fontFamily: fontDisplay,
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  navCardSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    marginTop: 2
  },
  demoControlsContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    gap: 8
  },
  demoControlsTitle: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#6C6F7A',
    letterSpacing: 0.8
  },
  demoSimulationBtn: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  demoSimulationBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98'
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
  primaryActionButton: {
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
  primaryActionButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E0805'
  },
  ctaSubtext: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98',
    marginTop: 6,
    textAlign: 'center'
  }
});
