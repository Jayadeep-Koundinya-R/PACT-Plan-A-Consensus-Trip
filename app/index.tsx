import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { RankedOptionCard } from '../src/components/RankedOptionCard';
import { TripBriefModal } from '../src/components/TripBriefModal';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { DemoTourModal } from '../src/components/DemoTourModal';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  Compass,
  Users,
  Copy,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Check,
  Plus,
  Crown,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    currentUserId,
    setCurrentUser,
    groups,
    createGroup,
    activeGroupId,
    setActiveGroup,
    members,
    getConsensusResults,
    votes,
    castVote,
    getOptionApprovalCount,
    finalizeTrip,
    finalizedBrief,
    subscriptionPlan,
    resetDemoState
  } = useGatherlyStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [briefModalVisible, setBriefModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [demoTourVisible, setDemoTourVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const consensus = getConsensusResults();
  const currentUser = members.find((m) => m.userId === currentUserId) || members[0];
  const isOrganizer = currentGroup.organizerId === currentUserId;
  const isPro = subscriptionPlan !== 'free';

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

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const group = createGroup(newGroupName.trim());
    setNewGroupName('');
    setCreateModalVisible(false);
    router.push(`/groups/${group.id}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Brand Logo + ThemeToggle + Pro Badge + Tour */}
        <View style={styles.navBar}>
          <View style={styles.brandRow}>
            <View
              style={[
                styles.logoIcon,
                { backgroundColor: theme.primary },
                shadows.glowPrimary
              ]}
            >
              <Compass size={22} color="#FFFFFF" strokeWidth={2.5} />
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
              onPress={() => setDemoTourVisible(true)}
              style={[
                styles.tourPill,
                {
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primary
                }
              ]}
            >
              <Sparkles size={13} color={theme.primary} />
              <Text style={[styles.tourPillText, { color: theme.primary }]}>
                TOUR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/paywall')}
              style={[
                styles.proPill,
                {
                  backgroundColor: isPro ? theme.secondaryLight : theme.surfaceElevated,
                  borderColor: isPro ? theme.secondary : theme.border
                }
              ]}
            >
              <Crown size={14} color={isPro ? theme.secondary : theme.textSecondary} />
              <Text
                style={[
                  styles.proPillText,
                  { color: isPro ? theme.secondary : theme.textSecondary }
                ]}
              >
                {isPro ? 'PRO' : 'UPGRADE'}
              </Text>
            </TouchableOpacity>

            <ThemeToggle />
          </View>
        </View>

        {/* Section: Active Circles Cards */}
        <View style={styles.circlesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Active Trip Circles ({groups.length})
            </Text>
            <TouchableOpacity
              onPress={() => setCreateModalVisible(true)}
              style={styles.newCircleLink}
            >
              <Plus size={14} color={theme.primary} />
              <Text style={[styles.newCircleLinkText, { color: theme.primary }]}>
                New Circle
              </Text>
            </TouchableOpacity>
          </View>

          {groups.map((grp) => {
            const isSelected = grp.id === activeGroupId;
            const statusDotColor =
              grp.status === 'finalized'
                ? theme.success
                : grp.status === 'voting'
                ? theme.primary
                : theme.warning;

            return (
              <TouchableOpacity
                key={grp.id}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveGroup(grp.id);
                  router.push(`/groups/${grp.id}`);
                }}
                style={[
                  styles.circleCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isSelected ? theme.primary : theme.glassBorder,
                    borderWidth: isSelected ? 2 : 1
                  },
                  shadows.md
                ]}
              >
                <View style={styles.circleTopRow}>
                  <View style={styles.circleTitleCol}>
                    <View style={styles.circleHeaderRow}>
                      <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
                      <Text style={[styles.circleName, { color: theme.textPrimary }]}>
                        {grp.name}
                      </Text>
                    </View>
                    <Text style={[styles.circleSub, { color: theme.textSecondary }]}>
                      Code: <Text style={{ fontWeight: '800', color: theme.primary }}>{grp.inviteCode}</Text> • 5 of {grp.totalMembersCount} responded
                    </Text>
                  </View>

                  <ChevronRight size={18} color={theme.textMuted} />
                </View>

                {/* Member Avatars Row */}
                <View style={styles.avatarRosterRow}>
                  <View style={styles.avatarsGroup}>
                    {members.map((m) => (
                      <View
                        key={m.userId}
                        style={[
                          styles.avatarDot,
                          {
                            backgroundColor: theme.primaryLight,
                            borderColor: theme.surface
                          }
                        ]}
                      >
                        <Text style={[styles.avatarDotText, { color: theme.primaryDark }]}>
                          {m.userName.charAt(0)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.circleStatusBadge,
                      { backgroundColor: `${statusDotColor}20` }
                    ]}
                  >
                    <Text style={[styles.circleStatusBadgeText, { color: statusDotColor }]}>
                      {grp.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Persona Simulation Switcher (Judging/Testing Tool) */}
        <View
          style={[
            styles.personaBox,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.sm
          ]}
        >
          <View style={styles.personaHeader}>
            <ShieldCheck size={14} color={theme.primary} />
            <Text style={[styles.personaLabel, { color: theme.textSecondary }]}>
              SIMULATE PRIVATE VIEW AS:
            </Text>
          </View>

          <View style={styles.personaGrid}>
            {members.map((m) => (
              <TouchableOpacity
                key={m.userId}
                onPress={() => setCurrentUser(m.userId)}
                activeOpacity={0.7}
                style={[
                  styles.personaPill,
                  {
                    backgroundColor:
                      m.userId === currentUserId ? theme.primary : theme.surfaceElevated,
                    borderColor:
                      m.userId === currentUserId ? theme.primary : theme.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.personaText,
                    {
                      color:
                        m.userId === currentUserId ? '#FFFFFF' : theme.textPrimary,
                      fontWeight: m.userId === currentUserId ? '800' : '600'
                    }
                  ]}
                >
                  {m.userName} {m.userId === 'user-maya-001' ? '(Org)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Engine Status Banner */}
        {consensus.consensusReached ? (
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: theme.successLight, borderColor: 'rgba(16, 185, 129, 0.3)' },
              shadows.glowSuccess
            ]}
          >
            <CheckCircle2 size={20} color={theme.success} />
            <View style={styles.statusBannerTextCol}>
              <Text style={[styles.statusBannerTitle, { color: theme.success }]}>
                Consensus Unlocked! (100% Agreement)
              </Text>
              <Text style={[styles.statusBannerSub, { color: theme.textPrimary }]}>
                "{consensus.winningOption?.option.name}" matches all constraints. Ready to finalize.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.statusBanner, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
            <AlertCircle size={20} color={theme.warning} />
            <View style={styles.statusBannerTextCol}>
              <Text style={[styles.statusBannerTitle, { color: theme.warning }]}>
                Deadlock Alert: {consensus.deadlockDiagnosis.diagnosisText}
              </Text>
            </View>
          </View>
        )}

        {/* Section: Ranked Trip Options */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Ranked Trip Options
            </Text>
            <Text style={[styles.sectionSubHeading, { color: theme.textSecondary }]}>
              Deterministic Score: Date (35%) + Budget (35%) + Tags (25%)
            </Text>
          </View>

          {isOrganizer && consensus.winningOption && (
            <TouchableOpacity
              onPress={handleFinalize}
              activeOpacity={0.8}
              style={[
                styles.finalizeBtn,
                { backgroundColor: theme.success },
                shadows.glowSuccess
              ]}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.finalizeBtnText}>Finalize Trip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Option Cards List */}
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

      {/* Floating Bottom Navigation Bar */}
      <BottomTabBar />

      {/* Create New Group Modal */}
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.glassBorder },
              shadows.lg
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Create a Trip Circle
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Give your trip group a name. We will generate a private shareable invite code.
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border
                }
              ]}
              placeholder="e.g. Goa New Year's Getaway"
              placeholderTextColor={theme.textMuted}
              value={newGroupName}
              onChangeText={setNewGroupName}
              autoFocus
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateGroup}
              style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.modalSubmitBtnText}>Create Circle & Invite Friends</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
      {/* Demo Tour Modal */}
      <DemoTourModal
        visible={demoTourVisible}
        isDarkMode={isDarkMode}
        onClose={() => setDemoTourVisible(false)}
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
    paddingBottom: 110, // Account for floating bottom bar
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
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
  tourPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  tourPillText: {
    fontSize: 11,
    fontWeight: '800'
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  proPillText: {
    fontSize: 11,
    fontWeight: '800'
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  circlesSection: {
    marginBottom: 16
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  newCircleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  newCircleLinkText: {
    fontSize: 13,
    fontWeight: '700'
  },
  circleCard: {
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 10
  },
  circleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  circleTitleCol: {
    flex: 1
  },
  circleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  circleName: {
    fontSize: 16,
    fontWeight: '700'
  },
  circleSub: {
    fontSize: 12,
    marginTop: 3
  },
  avatarRosterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatarsGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -6
  },
  avatarDotText: {
    fontSize: 10,
    fontWeight: '800'
  },
  circleStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  circleStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  personaBox: {
    borderRadius: radius.card,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  personaLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  personaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  personaPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  personaText: {
    fontSize: 11
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 16
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800'
  },
  sectionSubHeading: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  modalSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
