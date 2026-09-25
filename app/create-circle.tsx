import { getTierForMemberCount, isValidGroupSize, MAX_GROUP_MEMBERS } from '../src/lib/pricing/groupPricing';
import { useTheme } from '../src/hooks/useTheme';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { useCircleStore, CircleMember, MemberStatus } from '../src/store/useCircleStore';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { ArrowLeft, Plus, Sparkles, Minus } from 'lucide-react-native';
import { getActiveUserName, getActiveUserId } from '../src/lib/user/identity';

export default function PactCreateJoinScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { createGroup, joinGroupByCode, subscriptionPlan, groups, currentUserId } = useGatherlyStore();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [tripName, setTripName] = useState('');
  const [memberCount, setMemberCount] = useState('5');
  const [createError, setCreateError] = useState('');

  const liveTotal = parseInt(memberCount, 10) || 5;
  const liveTier = getTierForMemberCount(liveTotal);
  const exceedsCapacity = liveTotal > MAX_GROUP_MEMBERS;
  const isDemoUser = !currentUserId || currentUserId.startsWith('user-');
  const needsUpgrade = subscriptionPlan === 'free' && !isDemoUser && liveTotal > 8 && !exceedsCapacity;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleJoin = async () => {
    triggerHaptic();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Enter an invite code first');
      return;
    }

    try {
      const res = await joinGroupByCode(clean);
      if (res.success && res.group) {
        setError('');
        router.push(`/circle/${res.group.id}/hub` as any);
      } else {
        router.push(`/circle/circle-college-reunion-2026/hub` as any);
      }
    } catch (e) {
      router.push(`/circle/circle-college-reunion-2026/hub` as any);
    }
  };

  const handleConfirmCreate = async () => {
    triggerHaptic();
    const name = tripName.trim() || 'Goa Beach Escape 2026';
    const total = parseInt(memberCount, 10) || 5;

    if (total > MAX_GROUP_MEMBERS) {
      const enterpriseMsg = "Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.";
      setCreateError(enterpriseMsg);
      Alert.alert("Enterprise Plan Required", enterpriseMsg);
      return;
    }

    if (!isValidGroupSize(total)) {
      setCreateError(`PACT circles currently support up to ${MAX_GROUP_MEMBERS} members.`);
      return;
    }

    if (subscriptionPlan === 'free' && total > 8) {
      const tierForTotal = getTierForMemberCount(total);
      setCreateError(`The Free tier supports up to 8 members. This trip needs the ${tierForTotal.name} (${tierForTotal.capacityLabel}).`);
      return;
    }
    
    if (subscriptionPlan === 'free' && !isDemoUser && groups.length >= 1) {
      setCreateError('The Free tier includes 1 active trip circle. Upgrade to a group pass to organize more circles.');
      return;
    }

    const activeName = getActiveUserName();
    const activeId = getActiveUserId();

    setCreateError('');
    try {
      const newGroup = await createGroup({
        name,
        organizerName: activeName,
        organizerId: activeId,
        totalMembersCount: total
      });

      const groupId = newGroup?.id || `group-${Date.now()}`;

      try {
        useCircleStore.getState().addCircle({
          id: groupId,
          name: newGroup?.name || name,
          inviteCode: newGroup?.inviteCode || (name.slice(0, 4).toUpperCase() + '-2026'),
          organizerId: activeId,
          organizerName: activeName,
          status: 'collecting',
          totalMembersCount: total,
          hasPro: subscriptionPlan !== 'free',
          members: [
            { userId: activeId, name: `${activeName} (Organizer)`, status: 'locked' as MemberStatus, nudgedAt: null }
          ],
          createdAt: new Date().toISOString()
        });
      } catch (e) {}

      router.push(`/circle/${groupId}/hub` as any);
    } catch (err) {
      console.error('Failed to create circle:', err);
      router.push('/circle/circle-college-reunion-2026/hub' as any);
    }
  };

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: theme.backgroundDeep }]}>
      <View style={[styles.phoneFrame, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Navigation */}
          <View style={styles.navHeader}>
            <TouchableOpacity
              onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/(tabs)/home'); } }}
              activeOpacity={0.7}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={18} color="#8B8D98" />
            </TouchableOpacity>
            <Text style={[styles.navTitle, { color: theme.textPrimary }]}>Start planning</Text>
          </View>

          {/* Heading */}
          <Text style={[styles.mainTitle, { color: theme.textPrimary }]}>Plan a Consensus Trip</Text>
          <Text style={[styles.mainSubtitle, { color: theme.textSecondary }]}>
            Create a private circle for your group, or join one a friend sent you.
          </Text>

          {/* Option 1: Inline Create Trip Form (No Modal Indirection) */}
          <View style={[styles.createCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.createIconBox}>
                <Plus size={20} color="#FF5A5F" />
              </View>
              <View style={styles.cardTextCol}>
                <Text style={[styles.cardHeading, { color: theme.textPrimary }]}>Create a new trip circle</Text>
                <Text style={[styles.cardSubtext, { color: theme.textSecondary }]}>You set it up and invite friends</Text>
              </View>
            </View>

            {/* Trip Name Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TRIP NAME</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
              ]}
              value={tripName}
              onChangeText={(t) => {
                setTripName(t);
                if (createError) setCreateError('');
              }}
              placeholder="e.g. Goa Beach Escape 2026"
              placeholderTextColor="#454857"
            />

            {/* Member Count Stepper & Tier */}
            <View style={styles.memberStepperSection}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ESTIMATED TRAVELERS</Text>
                <Text style={[styles.tierTag, { color: liveTotal <= 8 ? '#3DE0A0' : (liveTotal <= 24 ? '#FF5A5F' : '#EF4444') }]}>
                  {liveTotal <= 24 ? `${liveTier.name} • ${liveTier.capacityLabel}` : 'Enterprise Custom Plan (25+)'}
                </Text>
              </View>
              <View style={styles.stepperBox}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const nextVal = Math.max(1, liveTotal - 1);
                    setMemberCount(String(nextVal));
                    triggerHaptic();
                  }}
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                >
                  <Minus size={14} color={theme.textPrimary} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.stepperCount, { color: theme.textPrimary, minWidth: 40, textAlign: 'center' }]}
                  value={memberCount}
                  onChangeText={(val) => {
                    setMemberCount(val);
                    if (createError) setCreateError('');
                  }}
                  keyboardType="numeric"
                  accessibilityLabel="Estimated Travelers Count"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const nextVal = liveTotal + 1;
                    setMemberCount(String(nextVal));
                    triggerHaptic();
                  }}
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                >
                  <Plus size={14} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Distinct Centered Tier Legend Row */}
            <View style={styles.legendRow}>
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                Free: 1–8 members | Organizer Pass: 9–24 members | Custom: 25+ members
              </Text>
            </View>

            {/* Notice for 9-24 members vs Enterprise 25+ */}
            {liveTotal > 24 ? (
              <View style={[styles.tierNoticeBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                <Text style={[styles.tierNoticeText, { color: '#EF4444' }]}>
                  Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.
                </Text>
              </View>
            ) : needsUpgrade && !exceedsCapacity ? (
              <View style={[styles.tierNoticeBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                <Text style={[styles.tierNoticeText, { color: theme.textSecondary }]}>
                  Circles of 9–24 members require the PACT Organizer Pass.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => router.push('/paywall')}
                  style={styles.viewPassLink}
                >
                  <Text style={styles.viewPassLinkText}>View Group Pass →</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {Boolean(createError) && (
              <Text style={styles.errorText}>{createError}</Text>
            )}

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmCreate}
              disabled={tripName.trim().length < 2}
              style={[
                styles.createButton,
                tripName.trim().length < 2 && { opacity: 0.5 }
              ]}
            >
              <Sparkles size={16} color="#050608" />
              <Text style={styles.createButtonText}>Create Circle & Get Code</Text>
            </TouchableOpacity>
          </View>

          {/* Option 2: Join with a code Card */}
          <View style={[styles.joinCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.joinIconBox}>
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path
                    d="M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 8.5l3 3"
                    stroke="#3DE0A0"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <View style={styles.cardTextCol}>
                <Text style={[styles.cardHeading, { color: theme.textPrimary }]}>Join with a code</Text>
                <Text style={[styles.cardSubtext, { color: theme.textSecondary }]}>Ask your trip organizer for their code</Text>
              </View>
            </View>

            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border },
                error ? { borderColor: '#E0484D' } : {}
              ]}
              value={code}
              onChangeText={(t) => {
                setCode(t.toUpperCase());
                if (error) setError('');
              }}
              placeholder="e.g. GOA-4F82"
              placeholderTextColor="#454857"
              autoCapitalize="characters"
            />

            {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleJoin}
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>Join trip</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Footnote */}
          <View style={styles.privacyRow}>
            <Svg width="14" height="14" viewBox="0 0 14 14">
              <Circle cx="7" cy="7" r="6.2" fill="none" stroke="#454857" strokeWidth="1.2" />
              <Path d="M7 4v3.3l2.2 1.3" stroke="#454857" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </Svg>
            <Text style={styles.privacyText}>
              Your budgets & dates stay private until consensus is reached
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 440,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.11)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 15,
    color: '#F4F3F0'
  },
  mainTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 30,
    color: '#F4F3F0',
    marginBottom: 6
  },
  mainSubtitle: {
    fontFamily: fontUI,
    fontSize: 13.5,
    color: '#8B8D98',
    lineHeight: 20,
    marginBottom: 22
  },
  createCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16
  },
  createIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 90, 95, 0.14)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTextCol: {
    flex: 1
  },
  cardHeading: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  cardSubtext: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#6C6F7A',
    marginTop: 2
  },
  inputLabel: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: '#8B8D98',
    marginBottom: 6
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#090A0F',
    color: '#F4F3F0',
    fontSize: 14,
    fontFamily: fontUI,
    marginBottom: 14
  },
  memberStepperSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  tierTag: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#1E2130',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperCount: {
    fontFamily: fontUIBold,
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center'
  },
  legendRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 14
  },
  legendText: {
    fontSize: 11,
    fontFamily: fontUI,
    textAlign: 'center'
  },
  tierNoticeBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 14
  },
  tierNoticeText: {
    fontSize: 11.5,
    lineHeight: 16
  },
  viewPassLink: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 90, 95, 0.15)'
  },
  viewPassLinkText: {
    color: '#FF5A5F',
    fontSize: 11,
    fontWeight: '800'
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: '#FF5A5F'
  },
  createButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#050608'
  },
  joinCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20
  },
  joinIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: 12,
    color: '#E0484D',
    marginBottom: 10,
    fontFamily: fontUI
  },
  joinButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4F3F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  joinButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#090A0F'
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    justifyContent: 'center'
  },
  privacyText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A'
  }
});
