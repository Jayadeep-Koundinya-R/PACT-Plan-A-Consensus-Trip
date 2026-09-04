import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Users,
  Compass,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react-native';
import { useCircleStore } from '../../src/store/useCircleStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../src/hooks/usePactHaptics';
import { PactCard, PactButton, PactTicketCard } from '../../src/components/common';
import { colors, radius, shadows, spacing } from '../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../src/theme/typography';

export default function JoinConfirmationScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const haptics = usePactHaptics();

  const inviteCode = (code || '').toUpperCase().trim();

  // Stores
  const { circles, getCircleByInviteCode, addMember } = useCircleStore();
  const { profile, ensureGuestSession } = useUserStore();
  const { groups = [], joinGroupByCode } = useGatherlyStore();

  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Look up circle by code in Zustand circleStore first, then gatherlyStore fallback
  const foundCircle = getCircleByInviteCode(inviteCode) || circles[0];
  const legacyGroup = groups.find(
    (g) => (g.inviteCode || '').toUpperCase() === inviteCode
  ) || groups[0];

  const tripTitle = foundCircle?.name || legacyGroup?.name || 'Goa Beach Escape 2026';
  const organizerName = foundCircle?.organizerName || 'Alex Rivers';
  const memberCount = foundCircle?.totalMembersCount || foundCircle?.members?.length || legacyGroup?.totalMembersCount || 5;
  const circleId = foundCircle?.id || legacyGroup?.id || 'circle-college-reunion-2026';

  const isAlreadyMember = Boolean(
    foundCircle?.members?.some((m) => m.userId === profile.userId)
  );

  const handleJoinTrip = async () => {
    setIsJoining(true);
    try {
      // 1. Ensure zero-friction guest session
      const guestProfile = ensureGuestSession(profile.displayName || 'Guest Explorer');

      // 2. Add to circle members in useCircleStore
      if (foundCircle) {
        addMember(foundCircle.id, {
          userId: guestProfile.userId,
          name: guestProfile.displayName || 'You (Guest)',
          status: 'waiting',
          nudgedAt: null
        });
      }

      // 3. Sync legacy store if present
      if (inviteCode && joinGroupByCode) {
        try {
          joinGroupByCode(inviteCode);
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
            <Text style={styles.inviteCodeLabel}>INVITE CODE</Text>
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
                  YOU HAVE BEEN INVITED TO JOIN
                </Text>
              </View>

              <Text style={styles.tripTitleHeading} numberOfLines={2}>
                {tripTitle}
              </Text>

              {/* Trip Metadata Grid */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>ORGANIZER</Text>
                  <Text style={styles.metaValue}>{organizerName}</Text>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>MEMBERS</Text>
                  <View style={styles.memberCountRow}>
                    <Users size={14} color="#3DE0A0" />
                    <Text style={styles.metaValueHighlight}>
                      {memberCount} friends
                    </Text>
                  </View>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>STATUS</Text>
                  <Text style={styles.metaValueStatus}>Voting</Text>
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

        {/* Member Preview Avatars */}
        <PactCard style={styles.membersPreviewCard}>
          <Text style={styles.membersCardTitle}>Current Circle Members</Text>
          <View style={styles.avatarList}>
            {(foundCircle?.members || [
              { name: 'Alex (Host)' },
              { name: 'Sam' },
              { name: 'Jordan' },
              { name: 'Maya' }
            ]).map((m, idx) => (
              <View key={idx} style={styles.memberChip}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {(m.name || 'M').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberName}>{m.name}</Text>
              </View>
            ))}
          </View>
        </PactCard>

        {/* Primary CTA */}
        <View style={styles.ctaContainer}>
          <PactButton
            variant="solid"
            size="lg"
            title={
              hasJoined
                ? 'Opening Circle...'
                : isAlreadyMember
                ? `Enter ${tripTitle}`
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
            No password or credit card required. Free guest pass included.
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
    borderColor: 'rgba(255, 255, 255, 0.12)'
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
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  metaItem: {
    flex: 1
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E2235',
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
  }
});