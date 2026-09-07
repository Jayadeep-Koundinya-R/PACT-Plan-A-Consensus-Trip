import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useCircleStore } from '../../src/store/useCircleStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../src/hooks/usePactHaptics';
import { colors, radius, shadows } from '../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../src/theme/typography';
import {
  Compass,
  Plus,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Archive,
  RotateCcw,
  FolderArchive
} from 'lucide-react-native';

export default function MyCirclesScreen() {
  const router = useRouter();
  const haptics = usePactHaptics();

  const { circles = [], activeCircleId, setActiveCircle, archiveCircle, unarchiveCircle } = useCircleStore();
  const [circleTab, setCircleTab] = useState<'active' | 'archived'>('active');
  const { profile, subscriptionPlan } = useUserStore();
  const { groups = [] } = useGatherlyStore();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Combine circles from useCircleStore and gatherlyStore to ensure full coverage
  const allCircles = circles.length > 0 ? circles : [
    {
      id: 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82',
      organizerId: 'user-maya-001',
      organizerName: 'Alex Rivers',
      status: 'voting' as const,
      totalMembersCount: 5,
      members: [
        { userId: 'user-maya-001', name: 'Alex', status: 'locked' as const, nudgedAt: null },
        { userId: 'user-jake-002', name: 'You', status: 'locked' as const, nudgedAt: null },
        { userId: 'user-priya-003', name: 'Sam', status: 'locked' as const, nudgedAt: null },
        { userId: 'user-alex-004', name: 'Jordan', status: 'waiting' as const, nudgedAt: null },
        { userId: 'user-sam-005', name: 'Maya', status: 'waiting' as const, nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  // Ensure baseline circles with default archived flag
  const baseCircles = allCircles.length === 1 ? [
    ...allCircles,
    {
      id: 'circle-kyoto-2027',
      name: 'Kyoto Spring 2027',
      inviteCode: 'KYO-9X21',
      organizerId: 'user-kenji-099',
      organizerName: 'Kenji Sato',
      status: 'collecting' as const,
      totalMembersCount: 4,
      archived: false,
      members: [
        { userId: 'user-kenji-099', name: 'Kenji', status: 'locked' as const, nudgedAt: null },
        { userId: 'user-maya-001', name: 'Alex', status: 'waiting' as const, nudgedAt: null },
        { userId: 'user-lisa-102', name: 'Lisa', status: 'waiting' as const, nudgedAt: null },
        { userId: 'user-tomo-103', name: 'Tomo', status: 'waiting' as const, nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    }
  ] : allCircles;

  const activeCircles = baseCircles.filter((c) => !c.archived);
  const archivedCircles = baseCircles.filter((c) => !!c.archived);
  const displayCircles = circleTab === 'active' ? activeCircles : archivedCircles;

  const handleCopy = async (code: string) => {
    haptics.tap();
    try {
      if (Clipboard && Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(code);
      }
    } catch {}
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleOpenCircle = (circleId: string) => {
    haptics.action();
    setActiveCircle(circleId);
    router.push(`/circle/${circleId}/hub` as any);
  };

  
  // Smart destination cover photo matcher
  const getDestinationCoverImage = (c: { id?: string; name?: string }) => {
    const text = ((c.name || '') + ' ' + (c.id || '')).toLowerCase();
    if (text.includes('goa') || text.includes('beach') || text.includes('coast') || text.includes('ocean')) {
      return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=240&fit=crop&q=80';
    }
    if (text.includes('kyoto') || text.includes('japan') || text.includes('tokyo')) {
      return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=240&fit=crop&q=80';
    }
    if (text.includes('bali') || text.includes('island') || text.includes('tropical')) {
      return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=240&fit=crop&q=80';
    }
    if (text.includes('paris') || text.includes('europe') || text.includes('rome') || text.includes('london')) {
      return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=240&fit=crop&q=80';
    }
    if (text.includes('mountain') || text.includes('ski') || text.includes('trek') || text.includes('manali')) {
      return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=240&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=240&fit=crop&q=80';
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Compass size={18} color="#FF5A5F" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.brandTitle}>PACT</Text>
                <Text style={styles.brandSubtitle}>CONSENSUS TRIP PLATFORM</Text>
              </View>
            </View>

            {/* Profile Avatar Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.profilePill}
            >
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>AR</Text>
              </View>
              <View style={styles.proMiniBadge}>
                <Text style={styles.proMiniBadgeText}>PRO</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{displayCircles.length}</Text>
              <Text style={styles.metricLabel}>ACTIVE CIRCLES</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#3DE0A0' }]}>80%</Text>
              <Text style={styles.metricLabel}>SUPERMAJORITY</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: '#FF5A5F' }]}>100%</Text>
              <Text style={styles.metricLabel}>SEALED PRIVACY</Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                haptics.action();
                router.push('/(tabs)/create');
              }}
              style={styles.primaryActionBtn}
            >
              <Plus size={16} color="#050608" strokeWidth={2.5} />
              <Text style={styles.primaryActionBtnText}>New Trip Circle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptics.tap();
                router.push('/invite');
              }}
              style={styles.secondaryActionBtn}
            >
              <KeyRound size={15} color="#F4F3F0" />
              <Text style={styles.secondaryActionBtnText}>Join Code</Text>
            </TouchableOpacity>
          </View>

          {/* Circles Section with Active / Archived Tabs */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>YOUR TRIP CIRCLES</Text>
            </View>
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  haptics.tap();
                  setCircleTab('active');
                }}
                style={[styles.tabButton, circleTab === 'active' && styles.tabButtonActive]}
                accessibilityLabel={`Active circles, ${activeCircles.length} available`}
              >
                <Text style={[styles.tabButtonText, circleTab === 'active' && styles.tabButtonTextActive]}>
                  Active ({activeCircles.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  haptics.tap();
                  setCircleTab('archived');
                }}
                style={[styles.tabButton, circleTab === 'archived' && styles.tabButtonActive]}
                accessibilityLabel={`Archived circles, ${archivedCircles.length} available`}
              >
                <Archive size={11} color={circleTab === 'archived' ? '#FF5A5F' : '#8B8D98'} />
                <Text style={[styles.tabButtonText, circleTab === 'archived' && styles.tabButtonTextActive]}>
                  Archived ({archivedCircles.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {displayCircles.length === 0 && (
            <View style={styles.emptyTabCard}>
              <FolderArchive size={28} color="#2D3144" />
              <Text style={styles.emptyTabTitle}>
                {circleTab === 'archived' ? 'No Archived Circles' : 'No Active Circles'}
              </Text>
              <Text style={styles.emptyTabDesc}>
                {circleTab === 'archived'
                  ? 'Trips you archive will be stored here for future reference.'
                  : 'Start a new circle or join with an invite code.'}
              </Text>
            </View>
          )}

          {displayCircles.map((circle) => {
            const isOrganizer = circle.organizerId === 'user-maya-001' || circle.organizerName === 'Alex Rivers';
            const lockedCount = circle.members?.filter((m) => m.status === 'locked').length || 0;
            const totalCount = circle.totalMembersCount || circle.members?.length || 5;
            const progressPercent = Math.round((lockedCount / totalCount) * 100);

            return (
              <TouchableOpacity
                key={circle.id}
                activeOpacity={0.88}
                onPress={() => handleOpenCircle(circle.id)}
                style={styles.circleCard}
              >
                {/* Flush Destination Cover Banner */}
                <View style={styles.cardCoverContainer}>
                  <Image
                    source={{ uri: getDestinationCoverImage(circle) }}
                    style={styles.cardCoverImage}
                    resizeMode="cover"
                    defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }}
                  />
                  <View style={styles.cardCoverGradient} />
                  <View style={styles.coverTagRow}>
                    <Text style={styles.coverTagText}>DESTINATION</Text>
                  </View>
                </View>

                {/* Card Content Area */}
                <View style={styles.cardContentPadding}>
                {/* Card Top Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.circleName} numberOfLines={1}>
                      {circle.name}
                    </Text>
                    <View style={styles.metaBadgeRow}>
                      <View style={[styles.roleBadge, isOrganizer ? styles.organizerBadge : styles.memberBadge]}>
                        <Text style={[styles.roleBadgeText, isOrganizer ? styles.organizerBadgeText : styles.memberBadgeText]}>
                          {isOrganizer ? 'Organizer' : 'Member'}
                        </Text>
                      </View>

                      <View style={styles.statusPill}>
                        {circle.status === 'voting' ? (
                          <>
                            <Sparkles size={11} color="#FF5A5F" />
                            <Text style={[styles.statusPillText, { color: '#FF5A5F' }]}>Voting Open</Text>
                          </>
                        ) : (
                          <>
                            <Clock size={11} color="#F59E0B" />
                            <Text style={[styles.statusPillText, { color: '#F59E0B' }]}>Collecting</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardHeaderActions}>
                    {/* Invite Code Pill with Copy */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleCopy(circle.inviteCode)}
                      style={styles.invitePill}
                      accessibilityLabel={`Copy invite code ${circle.inviteCode}`}
                    >
                      {copiedCode === circle.inviteCode ? (
                        <Check size={11} color="#3DE0A0" />
                      ) : (
                        <Copy size={11} color="#8B8D98" />
                      )}
                      <Text style={[styles.invitePillText, copiedCode === circle.inviteCode && { color: '#3DE0A0' }]}>
                        {copiedCode === circle.inviteCode ? 'COPIED' : circle.inviteCode}
                      </Text>
                    </TouchableOpacity>

                    {/* Archive / Unarchive Action Button */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        haptics.action();
                        if (circle.archived) {
                          unarchiveCircle(circle.id);
                        } else {
                          archiveCircle(circle.id);
                        }
                      }}
                      style={[styles.archiveBtn, circle.archived && styles.archiveBtnRestoring]}
                      accessibilityLabel={circle.archived ? 'Restore circle from archive' : 'Archive circle'}
                    >
                      {circle.archived ? (
                        <RotateCcw size={11} color="#3DE0A0" />
                      ) : (
                        <Archive size={11} color="#8B8D98" />
                      )}
                      <Text style={[styles.archiveBtnText, circle.archived && { color: '#3DE0A0' }]}>
                        {circle.archived ? 'Restore' : 'Archive'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Response Meter */}
                <View style={styles.meterContainer}>
                  <View style={styles.meterLabelsRow}>
                    <Text style={styles.meterLabelText}>Consensus Responses</Text>
                    <Text style={styles.meterValueText}>
                      {lockedCount}/{totalCount} members ({progressPercent}%)
                    </Text>
                  </View>
                  <View style={styles.meterTrack}>
                    <View
                      style={[
                        styles.meterFill,
                        {
                          width: `${progressPercent}%`,
                          backgroundColor: progressPercent >= 80 ? '#3DE0A0' : progressPercent >= 40 ? '#F59E0B' : '#60A5FA'
                        }
                      ]}
                    />
                  </View>
                </View>

                {/* Card Footer CTA */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.membersAvatarStrip}>
                    {circle.members?.slice(0, 5).map((m, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.memberMiniDot,
                          {
                            backgroundColor: m.status === 'locked' ? '#3DE0A0' : '#2D3144',
                            zIndex: 10 - idx
                          }
                        ]}
                      >
                        <Text style={styles.memberMiniDotText}>
                          {m.name.substring(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    ))}
                    <Text style={styles.membersCountText}>
                      {circle.members?.length || 5} friends
                    </Text>
                  </View>

                  <View style={styles.openLinkRow}>
                    <Text style={styles.openLinkText}>Open Hub</Text>
                    <ArrowRight size={13} color="#FF5A5F" />
                  </View>
                </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Privacy Guarantee Note */}
          <View style={styles.privacyNoteBox}>
            <ShieldCheck size={16} color="#3DE0A0" />
            <Text style={styles.privacyNoteText}>
              All participant constraints and vetoes are mathematically sealed with zero group peer pressure.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050608',
    alignItems: 'center'
  },
  tabSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13151E',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#1F2232',
    gap: 2
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 90, 95, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.35)'
  },
  tabButtonText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98',
    letterSpacing: 0.2
  },
  tabButtonTextActive: {
    color: '#FF5A5F'
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#181B26',
    borderWidth: 1,
    borderColor: '#262938'
  },
  archiveBtnRestoring: {
    borderColor: 'rgba(61, 224, 160, 0.3)',
    backgroundColor: 'rgba(61, 224, 160, 0.08)'
  },
  archiveBtnText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#8B8D98',
    letterSpacing: 0.2
  },
  emptyTabCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#0F111A',
    borderWidth: 1,
    borderColor: '#1F2232',
    marginBottom: 16
  },
  emptyTabTitle: {
    fontFamily: fontDisplay,
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F3F0',
    marginTop: 10,
    marginBottom: 4
  },
  emptyTabDesc: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 440,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#1F2232'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.25)'
  },
  brandTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5A5F',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontFamily: fontUI,
    fontSize: 9,
    fontWeight: '700',
    color: '#8B8D98',
    letterSpacing: 0.8
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#1F2232'
  },
  avatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarMiniText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  proMiniBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  proMiniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37'
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#13151E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2232',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  metricItem: {
    alignItems: 'center',
    flex: 1
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F4F3F0',
    marginBottom: 2
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8B8D98',
    letterSpacing: 0.4
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1F2232'
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24
  },
  primaryActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    borderRadius: 12
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#050608'
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#1F2232',
    paddingVertical: 12,
    borderRadius: 12
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B8D98',
    letterSpacing: 0.8
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5A5F'
  },
  circleCard: {
    backgroundColor: '#13151E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2232',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  cardCoverContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#161926'
  },
  cardCoverImage: {
    width: '100%',
    height: '100%'
  },
  cardCoverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 6, 8, 0.35)'
  },
  coverTagRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: 'rgba(5, 6, 8, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  coverTagText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#3DE0A0',
    letterSpacing: 0.8
  },
  cardContentPadding: {
    padding: 16
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  cardTitleCol: {
    flex: 1,
    marginRight: 10
  },
  circleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 6
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  organizerBadge: {
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.25)'
  },
  organizerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5A5F'
  },
  memberBadge: {
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.2)'
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#181A26',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600'
  },
  invitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#181A26',
    borderWidth: 1,
    borderColor: '#2D3144',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  invitePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B8D98',
    letterSpacing: 0.5
  },
  meterContainer: {
    marginBottom: 14
  },
  meterLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  meterLabelText: {
    fontSize: 11,
    color: '#8B8D98'
  },
  meterValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  meterTrack: {
    height: 6,
    backgroundColor: '#1F2232',
    borderRadius: 3,
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    borderRadius: 3
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1F2232'
  },
  membersAvatarStrip: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  memberMiniDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -6,
    borderWidth: 1.5,
    borderColor: '#13151E'
  },
  memberMiniDotText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#050608'
  },
  membersCountText: {
    fontSize: 11,
    color: '#8B8D98',
    marginLeft: 12
  },
  openLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  openLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5A5F'
  },
  privacyNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(61, 224, 160, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8
  },
  privacyNoteText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8B8D98',
    flex: 1
  }
});
