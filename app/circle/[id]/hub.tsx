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
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Check, Copy, Share2, Sparkles, SlidersHorizontal, ChevronRight, Settings } from 'lucide-react-native';

export default function PactCirclesHub() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  const demoMembers = [
    { name: 'Alex', status: 'locked' as const },
    { name: 'You', status: 'locked' as const },
    { name: 'Sam', status: 'locked' as const },
    { name: 'Jordan', status: 'waiting' as const },
    { name: 'Maya', status: 'waiting' as const }
  ];

  const lockedCount = demoMembers.filter((m) => m.status === 'locked').length;
  const totalCount = demoMembers.length;
  const pct = lockedCount / totalCount;
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const waitingNames = demoMembers.filter((m) => m.status === 'waiting').map((m) => m.name);

  const initials = (name: string) => name.slice(0, 2).toUpperCase();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleNudge = (name: string) => {
    triggerHaptic();
    setNudged((prev) => ({ ...prev, [name]: true }));
    if (Platform.OS !== 'web') {
      Alert.alert('Nudge Sent', `Sent a reminder notification to ${name}!`);
    }
  };

  const handleCopyCode = async () => {
    triggerHaptic();
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
    triggerHaptic();
    const code = currentGroup.inviteCode || 'GOA-4F82';
    const message = `🏖️ Join our private trip poll on PACT: "${currentGroup.name}"!\n\nEnter code: ${code}\nYour dates and budget stay 100% confidential.`;

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
    triggerHaptic();
    router.push(`/circle/${currentGroup.id}/preferences` as any);
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

          {/* Group Consensus Status Ring Card */}
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
              <Text style={styles.statusHeaderLabel}>GROUP CONSENSUS STATUS</Text>
              <Text style={styles.statusSubtext}>
                Once everyone's in, PACT reveals the match.
              </Text>
            </View>
          </View>

          {/* Members Response List */}
          <View style={styles.membersCard}>
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

                {m.status === 'waiting' && (
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
    marginBottom: 22
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
  tripTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 16,
    color: '#F4F3F0',
    flex: 1
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  inviteCodeBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  inviteCodeText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8B8D98',
    letterSpacing: 0.5
  },
  settingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18
  },
  svgWrapper: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
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
    marginTop: -1
  },
  statusTextCol: {
    flex: 1
  },
  statusHeaderLabel: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#6C6F7A',
    letterSpacing: 0.6,
    marginBottom: 4
  },
  statusSubtext: {
    fontFamily: fontUI,
    fontSize: 13.5,
    color: '#8B8D98',
    lineHeight: 19
  },
  membersCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 16
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2A2D3A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    fontFamily: fontUIBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#B4B6C0'
  },
  memberInfoCol: {
    flex: 1
  },
  memberName: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F3F0',
    marginBottom: 2
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFA600'
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
    fontWeight: '600',
    color: '#F4F3F0'
  },
  ticketCardContainer: {
    position: 'relative',
    marginBottom: 14
  },
  ticketCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden'
  },
  ticketTopSection: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  ticketCodeLabel: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#6C6F7A',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  ticketCodeHeading: {
    fontFamily: fontDisplay,
    fontSize: 22,
    fontWeight: '700',
    color: '#FF5A5F',
    letterSpacing: 1.5
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
  ticketBottomSection: {
    padding: 16
  },
  whatsAppButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  whatsAppButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#0B3B22'
  },
  matrixQuickCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  matrixQuickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  matrixIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(61,224,160,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  matrixQuickTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  matrixQuickSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A',
    marginTop: 1
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  primaryActionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryActionButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0D0A0A'
  }
});