import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Users,
  Compass,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  UserPlus,
  Check,
  AlertCircle
} from 'lucide-react-native';
import { useCircleStore } from '../../src/store/useCircleStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../src/hooks/usePactHaptics';
import { PactCard, PactButton, PactTicketCard } from '../../src/components/common';
import { colors, radius, shadows, spacing } from '../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../src/theme/typography';
import { getActiveUserName } from '../../src/lib/user/identity';

export default function JoinConfirmationScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const haptics = usePactHaptics();

  // Sanitize deep links: strip protocol, trailing slashes, and query params
  const rawCode = Array.isArray(code) ? code[0] : code || '';
  const sanitizedCode = rawCode
    .replace(/^pact:\/\/(join\/|invite\/)?/i, '')
    .split('?')[0]
    .replace(/\/+$/, '')
    .trim();
  const inviteCode = sanitizedCode.toUpperCase();

  // Stores
  const { circles, getCircleByInviteCode, addMember } = useCircleStore();
  const { profile, ensureGuestSession } = useUserStore();
  const { groups = [], joinGroupByCode } = useGatherlyStore();

  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const activeName = getActiveUserName();
  const [travelerName, setTravelerName] = useState(activeName !== 'Traveler' ? activeName : '');

  // Look up circle by code in Zustand circleStore first, then gatherlyStore fallback
  const foundCircle = getCircleByInviteCode(inviteCode) || circles.find((c) => (c.inviteCode || '').toUpperCase() === inviteCode);
  const legacyGroup = groups.find(
    (g) => (g.inviteCode || '').toUpperCase() === inviteCode
  );

  const tripTitle = foundCircle?.name || legacyGroup?.name || '';
  const organizerName = foundCircle?.organizerName || legacyGroup?.organizerName || 'Organizer';
  const circleId = foundCircle?.id || legacyGroup?.id || '';

  const currentMembers = (foundCircle?.members && foundCircle.members.length > 0)
    ? foundCircle.members
    : [{ userId: 'org', name: `${organizerName} (Organizer)`, status: 'locked' as const, nudgedAt: null }];
  const realMemberCount = currentMembers.length;

  const targetCapacity = foundCircle?.totalMembersCount || legacyGroup?.totalMembersCount || 5;
  const isAlreadyMember = Boolean(
    foundCircle?.members?.some((m) => m.userId === profile.userId)
  );
  const isFull = realMemberCount >= targetCapacity;

  const cleanEnteredName = travelerName.replace(/\s*\(You\)/gi, '').replace(/\s*\(Organizer\)/gi, '').trim().toLowerCase();
  const matchingReservedMember = foundCircle?.members?.find(
    (m) => m.name.replace(/\s*\(You\)/gi, '').replace(/\s*\(Organizer\)/gi, '').trim().toLowerCase() === cleanEnteredName
  );
  const isClaimingSlot = Boolean(matchingReservedMember);
  const isJoinBlocked = isFull && !isAlreadyMember && !isClaimingSlot;

  const handleJoinTrip = async () => {
    if (isJoinBlocked) {
      haptics.warning();
      return;
    }
    setIsJoining(true);
    try {
      // 1. Ensure zero-friction guest session with explicit entered name
      const cleanGuestName = travelerName.trim() || (activeName && activeName !== 'Traveler' ? activeName : profile.displayName) || `Friend ${realMemberCount + 1}`;
      const guestProfile = ensureGuestSession(cleanGuestName);

      // 2. Claim reserved slot if pre-added by organizer, or add new member to circle
      if (foundCircle) {
        const claimed = useCircleStore.getState().claimMemberSlot(foundCircle.id, cleanGuestName, guestProfile.userId);
        if (!claimed && !isFull) {
          addMember(foundCircle.id, {
            userId: guestProfile.userId,
            name: cleanGuestName,
            status: 'waiting',
            nudgedAt: null
          });
        }
      }

      // 3. Sync legacy store if present
      if (inviteCode && joinGroupByCode) {
        try {
          await joinGroupByCode(inviteCode);
        } catch {}
      }

      haptics.success();
      setHasJoined(true);

      // Brief delay for success animation before navigating
      setTimeout(() => {
        router.replace(`/circle/${circleId}/hub` as any);
      }, 350);
    } catch (e) {
      console.error('Failed to join circle:', e);
      haptics.warning();
      router.replace(`/circle/${circleId}/hub` as any);
    } finally {
      setIsJoining(false);
    }
  };

  if (!foundCircle && !legacyGroup) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={[styles.avatarCircle, { width: 64, height: 64, borderRadius: 32, marginBottom: 16, backgroundColor: 'rgba(255, 90, 95, 0.15)' }]}>
            <Compass size={28} color="#FF5A5F" />
          </View>
          <Text style={[styles.tripTitleHeading, { textAlign: 'center', marginBottom: 8 }]}>Circle Not Found</Text>
          <Text style={{ fontFamily: fontUI, fontSize: 14, color: '#8B8D98', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
            We could not find any active trip circle with code "{inviteCode}". Please verify the code with your organizer.
          </Text>
          <PactButton
            title="Return to Home"
            variant="solid"
            onPress={() => router.replace('/(tabs)/home')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Branding Pill */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Compass size={18} color="#FF5A5F" />
            <Text style={styles.brandText}>PACT</Text>
          </View>
          <View style={styles.inviteCodeBadge}>
            <Text style={styles.inviteCodeLabel}>Invite code</Text>
            <Text style={styles.inviteCodeValue}>{inviteCode || 'GOA-4F82'}</Text>
          </View>
        </View>

        {/* Main Ticket Card Preview */}
        <PactTicketCard
          style={styles.ticketCard}
          topContent={
            <View style={styles.ticketTopContent}>
              <View style={styles.invitationHeader}>
                <Sparkles size={14} color="#D4AF37" />
                <Text style={styles.invitationSubtitle}>
                  You have been invited to join
                </Text>
              </View>

              <Text style={styles.tripTitleHeading} numberOfLines={2}>
                {tripTitle}
              </Text>

              {/* Trip Metadata Grid */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Organizer</Text>
                  <Text style={styles.metaValue}>{organizerName}</Text>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Joined</Text>
                  <View style={styles.memberCountRow}>
                    <Users size={14} color="#3DE0A0" />
                    <Text style={styles.metaValueHighlight}>
                      {realMemberCount} {realMemberCount === 1 ? 'traveler' : 'travelers'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Status</Text>
                  <Text style={styles.metaValueStatus}>
                    {foundCircle?.status === 'voting' ? 'Voting' : 'Collecting'}
                  </Text>
                </View>
              </View>
            </View>
          }
          bottomContent={
            <View style={styles.ticketBottomContent}>
              <View style={styles.securityBanner}>
                <ShieldCheck size={16} color="#3DE0A0" />
                <View style={styles.securityTextCol}>
                  <Text style={styles.securityTitle}>Zero-Signup Joining</Text>
                  <Text style={styles.securitySub}>
                    Join as a guest instantly. Your budget, dates, and dealbreakers stay private until consensus is reached.
                  </Text>
                </View>
              </View>
            </View>
          }
        />

        {/* Member Preview Avatars: Shows all previously joined members */}
        <PactCard style={styles.membersPreviewCard}>
          <Text style={styles.membersCardTitle}>
            Current Circle Members ({realMemberCount})
          </Text>
          <View style={styles.avatarList}>
            {currentMembers.map((m, idx) => (
              <View key={idx} style={styles.memberChip}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {(m.name || 'M').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberName}>
                  {m.name.replace(/\s*\(You\)/gi, '')}
                </Text>
              </View>
            ))}
          </View>
        </PactCard>

        {/* Traveler Name Input */}
        {!isAlreadyMember && (
          <View style={styles.nameInputContainer}>
            <Text style={styles.nameInputLabel}>YOUR NAME (AS IT APPEARS TO THE GROUP)</Text>
            <TextInput
              style={styles.nameInput}
              value={travelerName}
              onChangeText={setTravelerName}
              placeholder="e.g. Sarah Patel"
              placeholderTextColor="#454857"
              autoCapitalize="words"
              accessibilityLabel="Your traveler name"
            />
          </View>
        )}

        {/* If already joined notice with option to switch */}
        {isAlreadyMember && (
          <View style={styles.alreadyMemberNotice}>
            <Text style={styles.alreadyMemberText}>
              You are currently recognized as a member of this circle.
            </Text>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                ensureGuestSession(`Friend ${realMemberCount + 1}`);
                setTravelerName('');
              }}
              style={styles.switchFriendLink}
              accessibilityLabel="Join as a different traveler"
            >
              <Text style={styles.switchFriendLinkText}>+ Join as a different friend / device</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reserved slot notification */}
        {isClaimingSlot && !isAlreadyMember && (
          <View style={styles.reservedSlotNotice}>
            <Check size={15} color="#3DE0A0" />
            <Text style={styles.reservedSlotText}>
              Reserved seat found for "{matchingReservedMember?.name.replace(/\s*\(Organizer\)/gi, '')}". Ready to claim!
            </Text>
          </View>
        )}

        {/* Full capacity notification */}
        {isJoinBlocked && (
          <View style={styles.fullCapacityNotice}>
            <View style={styles.fullCapacityHeader}>
              <AlertCircle size={15} color="#F59E0B" />
              <Text style={styles.fullCapacityTitle}>Circle at Capacity ({realMemberCount}/{targetCapacity} Seats Filled)</Text>
            </View>
            <Text style={styles.fullCapacityText}>
              All {targetCapacity} seats for this circle are filled. If a seat was reserved for you by the organizer, enter your name above to claim it.
            </Text>
          </View>
        )}

        {/* Primary CTA */}
        <View style={styles.ctaContainer}>
          <PactButton
            variant="solid"
            size="lg"
            disabled={isJoinBlocked}
            title={
              hasJoined
                ? 'Opening Circle...'
                : isAlreadyMember
                ? `Enter ${tripTitle}`
                : isClaimingSlot
                ? `Claim Seat & Enter ${tripTitle}`
                : isJoinBlocked
                ? `Circle Full (${realMemberCount}/${targetCapacity})`
                : `Join ${tripTitle}`
            }
            loading={isJoining}
            onPress={
              isAlreadyMember
                ? () => router.replace(`/circle/${circleId}/hub` as any)
                : handleJoinTrip
            }
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            iconPosition="right"
          />

          <Text style={styles.ctaFooterNote}>
            {isJoinBlocked
              ? 'Ask the organizer to expand the circle size in settings to add more travelers.'
              : 'No password or credit card required. Free guest pass included.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090A0F'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 24,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)'
  },
  brandText: {
    fontFamily: fontDisplay,
    fontSize: 16,
    color: '#FF5A5F',
    letterSpacing: 1.5
  },
  inviteCodeBadge: {
    alignItems: 'flex-end'
  },
  inviteCodeLabel: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#6C6F7A',
    letterSpacing: 0.8
  },
  inviteCodeValue: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#D4AF37',
    letterSpacing: 1
  },
  ticketCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)'
  },
  ticketTopContent: {
    padding: 20
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  invitationSubtitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#D4AF37',
    letterSpacing: 0.8
  },
  tripTitleHeading: {
    fontFamily: fontDisplay,
    fontSize: 26,
    color: '#F4F3F0',
    lineHeight: 32,
    marginBottom: 20
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1017',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.11)'
  },
  metaItem: {
    flex: 1
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    marginHorizontal: 10
  },
  metaLabel: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#6C6F7A',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  metaValue: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F4F3F0'
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  metaValueHighlight: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#3DE0A0'
  },
  metaValueStatus: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#FF5A5F'
  },
  ticketBottomContent: {
    padding: 16,
    backgroundColor: '#0F1017'
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  securityTextCol: {
    flex: 1
  },
  securityTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#3DE0A0',
    marginBottom: 2
  },
  securitySub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98',
    lineHeight: 16
  },
  membersPreviewCard: {
    marginBottom: 28,
    backgroundColor: '#13151E'
  },
  membersCardTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#8B8D98',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  avatarList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)'
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1B1D27',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitial: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#3DE0A0'
  },
  memberName: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#F4F3F0'
  },
  ctaContainer: {
    gap: 12,
    alignItems: 'center'
  },
  ctaFooterNote: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A',
    textAlign: 'center'
  },
  nameInputContainer: {
    width: '100%',
    marginBottom: 20
  },
  nameInputLabel: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  nameInput: {
    height: 48,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.card,
    paddingHorizontal: 16,
    fontFamily: fontUI,
    fontSize: 14,
    color: '#F4F3F0'
  },
  alreadyMemberNotice: {
    width: '100%',
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.2)',
    borderRadius: radius.card,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center'
  },
  alreadyMemberText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#3DE0A0',
    textAlign: 'center',
    marginBottom: 6
  },
  switchFriendLink: {
    paddingVertical: 4
  },
  switchFriendLinkText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#FF5A5F'
  },
  fullCapacityNotice: {
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 16
  },
  fullCapacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  fullCapacityTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F59E0B'
  },
  fullCapacityText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    lineHeight: 18
  },
  reservedSlotNotice: {
    width: '100%',
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: radius.card,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  reservedSlotText: {
    fontFamily: fontUIBold,
    fontSize: 12.5,
    color: '#3DE0A0',
    flex: 1
  }
});