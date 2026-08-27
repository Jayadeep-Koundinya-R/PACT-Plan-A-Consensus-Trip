import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { RankedOptionCard } from '../src/components/RankedOptionCard';
import { TripBriefModal } from '../src/components/TripBriefModal';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  Compass,
  Moon,
  Sun,
  Users,
  Copy,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Check,
  ArrowRight,
  Vote,
  Sliders,
  Award
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    toggleDarkMode,
    currentUserId,
    setCurrentUser,
    groups,
    activeGroupId,
    members,
    getConsensusResults,
    votes,
    castVote,
    getOptionApprovalCount,
    finalizeTrip,
    finalizedBrief,
    resetDemoState
  } = useGatherlyStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [briefModalVisible, setBriefModalVisible] = useState(false);

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const consensus = getConsensusResults();
  const currentUser = members.find((m) => m.userId === currentUserId) || members[0];
  const isOrganizer = currentGroup.organizerId === currentUserId;

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleVote = (optionId: string) => {
    const isApproved = votes[`${optionId}_${currentUserId}`] === true;
    castVote(optionId, !isApproved);
  };

  const handleFinalize = () => {
    try {
      const brief = finalizeTrip(currentUserId);
      if (brief) {
        setBriefModalVisible(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <View style={styles.brandRow}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
              <Compass size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
                PACT
              </Text>
              <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
                Plan A Consensus Trip
              </Text>
            </View>
          </View>

          <View style={styles.navActions}>
            <TouchableOpacity
              onPress={resetDemoState}
              style={[styles.iconButton, { backgroundColor: theme.surfaceSubtle }]}
              title="Reset Demo"
            >
              <RotateCcw size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleDarkMode}
              style={[styles.iconButton, { backgroundColor: theme.surfaceSubtle }]}
            >
              {isDarkMode ? (
                <Sun size={18} color={theme.warning} />
              ) : (
                <Moon size={18} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Flow Navigation Bar */}
        <View
          style={[
            styles.flowNavCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <Text style={[styles.flowNavTitle, { color: theme.textSecondary }]}>
            WEEK 2 APP SCREENS & FLOW
          </Text>
          <View style={styles.flowNavButtons}>
            <TouchableOpacity
              onPress={() => router.push('/groups')}
              style={[styles.flowNavBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Users size={14} color={theme.primary} />
              <Text style={[styles.flowNavBtnText, { color: theme.textPrimary }]}>
                Circles List
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/groups/${currentGroup.id}/preferences`)}
              style={[styles.flowNavBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Sliders size={14} color={theme.secondary} />
              <Text style={[styles.flowNavBtnText, { color: theme.textPrimary }]}>
                Preferences
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/groups/${currentGroup.id}/options`)}
              style={[styles.flowNavBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Sparkles size={14} color={theme.primary} />
              <Text style={[styles.flowNavBtnText, { color: theme.textPrimary }]}>
                Rankings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/groups/${currentGroup.id}/vote`)}
              style={[styles.flowNavBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Vote size={14} color={theme.success} />
              <Text style={[styles.flowNavBtnText, { color: theme.textPrimary }]}>
                Silent Vote
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/groups/${currentGroup.id}/brief`)}
              style={[styles.flowNavBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              <Award size={14} color={theme.primary} />
              <Text style={[styles.flowNavBtnText, { color: theme.textPrimary }]}>
                Trip Brief
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Info Header */}
        <View
          style={[
            styles.groupHeaderCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.groupMetaRow}>
            <View>
              <Text style={[styles.groupName, { color: theme.textPrimary }]}>
                {currentGroup.name}
              </Text>
              <Text style={[styles.groupOrganizer, { color: theme.textSecondary }]}>
                Organizer: Maya (Creator)
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCopyCode}
              activeOpacity={0.7}
              style={[styles.inviteBadge, { backgroundColor: theme.primaryLight }]}
            >
              {copiedCode ? (
                <Check size={14} color={theme.primary} />
              ) : (
                <Copy size={14} color={theme.primary} />
              )}
              <Text style={[styles.inviteCodeText, { color: theme.primaryDark }]}>
                {currentGroup.inviteCode}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Member Responded Status */}
          <View style={styles.memberStatusRow}>
            <View style={styles.memberCountBadge}>
              <Users size={14} color={theme.success} />
              <Text style={[styles.memberCountText, { color: theme.textPrimary }]}>
                {members.length} of {currentGroup.totalMembersCount} Responded
              </Text>
            </View>

            <View style={styles.avatarsRow}>
              {members.map((m) => (
                <View
                  key={m.userId}
                  style={[
                    styles.avatarBubble,
                    {
                      backgroundColor:
                        m.userId === currentUserId ? theme.primary : theme.surfaceSubtle,
                      borderColor: theme.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color:
                          m.userId === currentUserId ? '#FFFFFF' : theme.textPrimary
                      }
                    ]}
                  >
                    {m.userName.charAt(0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* User Persona Switcher (Demo Feature) */}
          <View style={[styles.userSwitcherBox, { backgroundColor: theme.surfaceSubtle }]}>
            <Text style={[styles.userSwitcherLabel, { color: theme.textSecondary }]}>
              Simulate View as:
            </Text>
            <View style={styles.userPillWrap}>
              {members.map((m) => (
                <TouchableOpacity
                  key={m.userId}
                  onPress={() => setCurrentUser(m.userId)}
                  style={[
                    styles.userPill,
                    {
                      backgroundColor:
                        m.userId === currentUserId ? theme.primary : theme.surface,
                      borderColor:
                        m.userId === currentUserId ? theme.primary : theme.border
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.userPillText,
                      {
                        color:
                          m.userId === currentUserId ? '#FFFFFF' : theme.textPrimary
                      }
                    ]}
                  >
                    {m.userName} {m.userId === 'user-maya-001' ? '(Org)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Engine Status Banner */}
        {consensus.consensusReached ? (
          <View style={[styles.statusBanner, { backgroundColor: theme.successLight }]}>
            <CheckCircle size={20} color={theme.success} />
            <View style={styles.statusBannerTextCol}>
              <Text style={[styles.statusBannerTitle, { color: theme.success }]}>
                Consensus Unlocked! (100% Agreement)
              </Text>
              <Text style={[styles.statusBannerSub, { color: theme.textPrimary }]}>
                "{consensus.winningOption?.option.name}" meets all constraints. Ready to finalize.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.statusBanner, { backgroundColor: theme.secondaryLight }]}>
            <AlertCircle size={20} color={theme.secondary} />
            <View style={styles.statusBannerTextCol}>
              <Text style={[styles.statusBannerTitle, { color: theme.secondary }]}>
                Deadlock Alert: {consensus.deadlockDiagnosis.diagnosisText}
              </Text>
            </View>
          </View>
        )}

        {/* Ranked Options Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Ranked Trip Options
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Deterministic Score (Date 35% + Budget 35% + Tags 25%)
            </Text>
          </View>

          {isOrganizer && consensus.winningOption && (
            <TouchableOpacity
              onPress={handleFinalize}
              activeOpacity={0.8}
              style={[styles.finalizeBtn, { backgroundColor: theme.success }]}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.finalizeBtnText}>Finalize Trip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Option Cards */}
        {consensus.rankedOptions.map((scoredOption) => {
          const isApproved = votes[`${scoredOption.option.id}_${currentUserId}`] === true;
          const count = getOptionApprovalCount(scoredOption.option.id);

          return (
            <RankedOptionCard
              key={scoredOption.option.id}
              scoredOption={scoredOption}
              isDarkMode={isDarkMode}
              isApprovedByUser={isApproved}
              approvalCount={count}
              onToggleVote={handleToggleVote}
            />
          );
        })}
      </ScrollView>

      {/* Trip Brief Finalization Modal */}
      <TripBriefModal
        visible={briefModalVisible || Boolean(finalizedBrief)}
        brief={finalizedBrief || (consensus.winningOption ? {
          groupId: activeGroupId,
          winningOption: consensus.winningOption,
          finalizedAt: new Date().toISOString(),
          confirmedParticipants: members.map((m) => m.userName),
          totalBudgetRange: `$${Math.min(...members.map((m) => m.budgetMin))} - $${Math.max(...members.map((m) => m.budgetMax))}`,
          travelWindow: `${consensus.winningOption.option.dateStart} to ${consensus.winningOption.option.dateEnd}`
        } : null)}
        isDarkMode={isDarkMode}
        onClose={() => setBriefModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingTop: Platform.OS === 'android' ? 10 : 0
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flowNavCard: {
    borderRadius: radius.card,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  flowNavTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  flowNavButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  flowNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill
  },
  flowNavBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  groupHeaderCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  groupMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700'
  },
  groupOrganizer: {
    fontSize: 12,
    marginTop: 2
  },
  inviteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill
  },
  inviteCodeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  memberStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600'
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  avatarBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800'
  },
  userSwitcherBox: {
    padding: 10,
    borderRadius: radius.md
  },
  userSwitcherLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  userPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  userPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  userPillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  statusBannerTextCol: {
    flex: 1
  },
  statusBannerTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  statusBannerSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  sectionSubtitle: {
    fontSize: 11
  },
  finalizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill
  },
  finalizeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
