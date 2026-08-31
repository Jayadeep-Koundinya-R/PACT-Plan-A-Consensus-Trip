import React, { useState, useEffect } from 'react';
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
import { ConsensusMatrix } from '../src/components/ConsensusMatrix';
import { BottlenecksSection } from '../src/components/BottlenecksSection';
import { TripBriefModal } from '../src/components/TripBriefModal';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  Compass,
  Users,
  ChevronRight,
  Plus,
  Lock,
  LogOut,
  X
} from 'lucide-react-native';

const FALLBACK_GROUP = {
  id: 'circle-college-reunion-2026',
  name: 'College Reunion Trip',
  inviteCode: 'GOA-2026',
  organizerId: 'user-maya-001',
  status: 'voting' as const,
  totalMembersCount: 5
};

export default function DashboardScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    currentUserId = 'user-maya-001',
    userEmail,
    userName,
    initAuthSession,
    logout,
    groups = [],
    activeGroupId,
    setActiveGroup,
    members = [],
    createGroup,
    getConsensusResults,
    votes = {},
    castVote,
    getOptionApprovalCount,
    finalizeTrip,
    finalizedBrief,
    subscriptionPlan
  } = useGatherlyStore();

  const [briefModalVisible, setBriefModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    try {
      initAuthSession();
    } catch (e) {
      console.warn('Auth init failed:', e);
    }
  }, []);

  const theme = isDarkMode ? colors.dark : colors.light;
  const safeGroups = Array.isArray(groups) && groups.length > 0 ? groups : [FALLBACK_GROUP];
  const currentGroup = safeGroups.find((g) => g.id === activeGroupId) || safeGroups[0] || FALLBACK_GROUP;

  let consensus;
  try {
    consensus = getConsensusResults();
  } catch (e) {
    console.warn('Consensus calc fallback:', e);
    consensus = {
      groupId: currentGroup.id,
      totalMembersCount: 5,
      respondedMembersCount: 5,
      rankedOptions: [],
      winningOption: undefined,
      deadlockDiagnosis: { isDeadlocked: false, topOptionConsensus: 0, primaryCause: 'none' as const, diagnosisText: '', organizerSuggestions: [] },
      consensusReached: false
    };
  }

  const isOrganizer = currentGroup ? currentGroup.organizerId === currentUserId : false;
  const isPro = subscriptionPlan !== 'free';
  const topOption = consensus?.winningOption || consensus?.rankedOptions?.[0] || null;

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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    if (!isPro && safeGroups.length >= 1 && currentUserId.startsWith('user-')) {
      setCreateModalVisible(false);
      router.push('/paywall');
      return;
    }
    setIsCreating(true);
    try {
      const group = await createGroup(newGroupName.trim());
      setNewGroupName('');
      setCreateModalVisible(false);
      router.push(`/groups/${group.id}`);
    } catch (err: any) {
      alert(err?.message || 'Error creating group');
    } finally {
      setIsCreating(false);
    }
  };

  // Bottlenecks list
  const bottleneckIssues = [];
  if (consensus?.deadlockDiagnosis?.isDeadlocked) {
    const dType = consensus.deadlockDiagnosis.primaryCause === 'budget_gap' ? 'budget' : consensus.deadlockDiagnosis.primaryCause === 'date_conflict' ? 'dates' : 'dealbreaker';
    bottleneckIssues.push({
      type: dType as 'budget' | 'dates' | 'dealbreaker',
      title: dType === 'budget' ? 'Budget Gap Detected' : dType === 'dates' ? 'Date Conflict Detected' : 'Dealbreaker Flagged',
      description: consensus.deadlockDiagnosis.diagnosisText
    });
  } else if (consensus?.rankedOptions?.some((o) => o.budgetGapFlag)) {
    const affected = (members || []).filter((m) => m.budgetMax < 700).map((m) => m.userName || (m as any).name);
    bottleneckIssues.push({
      type: 'budget' as const,
      title: 'Budget Gap Detected',
      description: `${affected.join(' and ') || 'Some travelers'} prefer $650, while the rest are okay with $900.`
    });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation / Header */}
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
                PACT <Text style={{ fontSize: 11, fontWeight: '800', color: theme.secondary }}>v1.1</Text>
              </Text>
              <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
                Plan A Consensus Trip
              </Text>
            </View>
          </View>

          <View style={styles.navActions}>
            {userEmail ? (
              <TouchableOpacity
                onPress={() => {
                  logout();
                  router.replace('/auth');
                }}
                style={[
                  styles.iconButton,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                ]}
                title="Log Out"
              >
                <LogOut size={15} color={theme.danger || '#EF4444'} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/auth')}
                style={[
                  styles.iconButton,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                ]}
                title="Sign In"
              >
                <Users size={15} color={theme.textSecondary} />
              </TouchableOpacity>
            )}

            <ThemeToggle />
          </View>
        </View>

        {/* Section: Spaces / Circles */}
        <View style={styles.circlesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Spaces
            </Text>
            <TouchableOpacity
              onPress={() => setCreateModalVisible(true)}
              style={[styles.plusCircleBtn, { backgroundColor: isDarkMode ? '#341D12' : '#FDE8DC' }]}
            >
              <Plus size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {safeGroups.map((grp) => {
            const isSelected = grp.id === activeGroupId;

            return (
              <TouchableOpacity
                key={grp.id}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveGroup(grp.id);
                  router.push(`/groups/${grp.id}`);
                }}
                style={[
                  styles.circleCard,
                  isSelected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                  shadows.md
                ]}
              >
                <View style={styles.circleLeft}>
                  <View
                    style={[
                      styles.circleIconBox,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255,255,255,0.2)'
                          : isDarkMode
                          ? 'rgba(234, 88, 12, 0.15)'
                          : '#FDEEE5'
                      }
                    ]}
                  >
                    <Users size={18} color={isSelected ? '#FFFFFF' : theme.primary} />
                  </View>

                  <View style={styles.circleTextCol}>
                    <Text
                      style={[
                        styles.circleName,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                      ]}
                    >
                      {grp.name}
                    </Text>
                    <Text
                      style={[
                        styles.circleSub,
                        { color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                      ]}
                    >
                      {grp.totalMembersCount || 5} members • Active now
                    </Text>
                  </View>
                </View>

                <ChevronRight
                  size={18}
                  color={isSelected ? '#FFFFFF' : theme.textMuted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 1. Consensus Matrix */}
        <ConsensusMatrix
          destinationTitle={topOption?.option?.name || currentGroup?.name || 'Trip Circle'}
          members={members || []}
          totalMembersCount={currentGroup?.totalMembersCount || (members || []).length || 5}
          isOrganizer={isOrganizer}
          isDarkMode={isDarkMode}
          onNudge={(name) => alert(`Nudge reminder sent to ${name}!`)}
        />

        {/* Section: Top Pick / Ranked Options */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Top Picks
          </Text>
          {consensus?.consensusReached && (
            <View style={[styles.unlockedTag, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5' }]}>
              <Text style={[styles.unlockedTagText, { color: theme.success }]}>
                CONSENSUS UNLOCKED
              </Text>
            </View>
          )}
        </View>

        {/* Ranked Option Cards with Hero Photos */}
        <View style={styles.cardsList}>
          {consensus?.rankedOptions?.map((scoredOption) => {
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
        </View>

        {/* 2. Bottlenecks Section */}
        {bottleneckIssues.length > 0 && (
          <BottlenecksSection
            issues={bottleneckIssues}
            isDarkMode={isDarkMode}
            onResolve={() => router.push(`/groups/${currentGroup.id}/options`)}
          />
        )}

        {/* Lock It In Action for Organizer */}
        {isOrganizer && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFinalize}
            style={[styles.lockItInBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
          >
            <Lock size={18} color="#FFFFFF" />
            <Text style={styles.lockItInBtnText}>Lock It In</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <BottomTabBar />

      {/* Finalized Trip Brief Modal */}
      {finalizedBrief && (
        <TripBriefModal
          visible={briefModalVisible}
          brief={finalizedBrief}
          isDarkMode={isDarkMode}
          onClose={() => setBriefModalVisible(false)}
        />
      )}

      {/* Create Circle Modal */}
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.createModalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.lg
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Create Trip Circle
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              CIRCLE NAME
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
              ]}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="e.g. Goa Reunion 2026"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateGroup}
              disabled={isCreating || !newGroupName.trim()}
              style={[
                styles.createSubmitBtn,
                { backgroundColor: theme.primary, opacity: isCreating || !newGroupName.trim() ? 0.6 : 1 }
              ]}
            >
              <Text style={styles.createSubmitBtnText}>
                {isCreating ? 'Creating...' : 'Create & Invite Friends'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 140,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500'
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  circlesSection: {
    marginBottom: 18
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  plusCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 10
  },
  circleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  circleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleTextCol: {
    flex: 1
  },
  circleName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2
  },
  circleSub: {
    fontSize: 11
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  unlockedTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  unlockedTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  cardsList: {
    gap: 6
  },
  lockItInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 10,
    marginBottom: 20
  },
  lockItInBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  createModalCard: {
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
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  modalInput: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 18
  },
  createSubmitBtn: {
    paddingVertical: 14,
    borderRadius: radius.btn,
    alignItems: 'center'
  },
  createSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});