import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../../../src/theme/colors';
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Vote,
  Sliders,
  ChevronRight
} from 'lucide-react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    members,
    currentUserId,
    getConsensusResults
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const currentGroup = groups.find((g) => g.id === id) || groups[0];
  const consensus = getConsensusResults();

  const [copiedCode, setCopiedCode] = useState(false);

  const currentUser = members.find((m) => m.userId === currentUserId) || members[0];
  const isOrganizer = currentGroup.organizerId === currentUserId;
  const userHasSubmitted = members.some((m) => m.userId === currentUserId);

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.push('/groups')}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle }]}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {currentGroup.name}
          </Text>

          <TouchableOpacity
            onPress={handleCopyCode}
            style={[styles.shareBtn, { backgroundColor: theme.primaryLight }]}
          >
            {copiedCode ? (
              <Check size={16} color={theme.primary} />
            ) : (
              <Share2 size={16} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Invite Code Hero Card */}
        <View
          style={[
            styles.inviteCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.inviteHeader}>
            <Text style={[styles.inviteLabel, { color: theme.textSecondary }]}>
              CIRCLE INVITE CODE
            </Text>
            <View style={[styles.statusTag, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.statusTagText, { color: theme.primaryDark }]}>
                {currentGroup.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.codeRow}>
            <Text style={[styles.codeText, { color: theme.primary }]}>
              {currentGroup.inviteCode}
            </Text>
            <TouchableOpacity
              onPress={handleCopyCode}
              activeOpacity={0.7}
              style={[styles.copyCodeBtn, { backgroundColor: theme.surfaceSubtle }]}
            >
              {copiedCode ? (
                <Check size={16} color={theme.success} />
              ) : (
                <Copy size={16} color={theme.textSecondary} />
              )}
              <Text style={[styles.copyCodeText, { color: theme.textSecondary }]}>
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.inviteHint, { color: theme.textSecondary }]}>
            Share this code with friends so they can submit their private dates, budget, and dealbreakers.
          </Text>
        </View>

        {/* Quick Action Navigation Grid */}
        <View style={styles.actionsGrid}>
          {/* Action 1: Submit / Review Preferences */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/groups/${currentGroup.id}/preferences`)}
            style={[
              styles.actionTile,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: theme.secondaryLight }]}>
              <Sliders size={20} color={theme.secondary} />
            </View>
            <View style={styles.tileTextCol}>
              <Text style={[styles.tileTitle, { color: theme.textPrimary }]}>
                My Private Constraints
              </Text>
              <Text style={[styles.tileSub, { color: theme.textSecondary }]}>
                {userHasSubmitted ? 'Dates, budget & tags submitted' : 'Not submitted yet'}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Action 2: Ranked Options */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/groups/${currentGroup.id}/options`)}
            style={[
              styles.actionTile,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: theme.primaryLight }]}>
              <Sparkles size={20} color={theme.primary} />
            </View>
            <View style={styles.tileTextCol}>
              <Text style={[styles.tileTitle, { color: theme.textPrimary }]}>
                Ranked Options
              </Text>
              <Text style={[styles.tileSub, { color: theme.textSecondary }]}>
                Deterministic scoring & reasons
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Action 3: Silent Voting Hub */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/groups/${currentGroup.id}/vote`)}
            style={[
              styles.actionTile,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: theme.successLight }]}>
              <Vote size={20} color={theme.success} />
            </View>
            <View style={styles.tileTextCol}>
              <Text style={[styles.tileTitle, { color: theme.textPrimary }]}>
                Silent Vote & Consensus
              </Text>
              <Text style={[styles.tileSub, { color: theme.textSecondary }]}>
                {consensus.winningOption
                  ? `Consensus: ${consensus.winningOption.consensusPercent}%`
                  : 'Voting active'}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Members Status Roster */}
        <View style={styles.rosterSection}>
          <View style={styles.rosterHeader}>
            <View style={styles.rosterHeaderLeft}>
              <Users size={18} color={theme.textPrimary} />
              <Text style={[styles.rosterTitle, { color: theme.textPrimary }]}>
                Circle Members ({members.length}/{currentGroup.totalMembersCount})
              </Text>
            </View>
            <Text style={[styles.rosterSubtitle, { color: theme.success }]}>
              {members.length === currentGroup.totalMembersCount
                ? 'All Responded'
                : `Waiting for ${currentGroup.totalMembersCount - members.length} more`}
            </Text>
          </View>

          <View style={styles.membersList}>
            {members.map((m) => {
              const isSelf = m.userId === currentUserId;
              const isGroupOrganizer = m.userId === currentGroup.organizerId;

              return (
                <View
                  key={m.userId}
                  style={[
                    styles.memberCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    shadows.sm
                  ]}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.memberAvatarText, { color: theme.primaryDark }]}>
                      {m.userName.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={[styles.memberNameText, { color: theme.textPrimary }]}>
                        {m.userName} {isSelf ? '(You)' : ''}
                      </Text>
                      {isGroupOrganizer && (
                        <View style={[styles.roleBadge, { backgroundColor: theme.secondaryLight }]}>
                          <Text style={[styles.roleBadgeText, { color: theme.secondary }]}>
                            Organizer
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.memberMetaText, { color: theme.textSecondary }]}>
                      Preferences submitted • {m.tags.length} tags selected
                    </Text>
                  </View>

                  <View style={styles.submittedBadge}>
                    <CheckCircle2 size={16} color={theme.success} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inviteCard: {
    borderRadius: radius.card,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  inviteLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800'
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6
  },
  codeText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill
  },
  copyCodeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  inviteHint: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16
  },
  actionsGrid: {
    gap: 10,
    marginBottom: 20
  },
  actionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: 12
  },
  tileIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tileTextCol: {
    flex: 1
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  tileSub: {
    fontSize: 12,
    marginTop: 2
  },
  rosterSection: {
    marginTop: 4
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  rosterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rosterTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  rosterSubtitle: {
    fontSize: 12,
    fontWeight: '600'
  },
  membersList: {
    gap: 8
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 12
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '800'
  },
  memberInfo: {
    flex: 1
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  memberNameText: {
    fontSize: 14,
    fontWeight: '700'
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  memberMetaText: {
    fontSize: 11,
    marginTop: 2
  },
  submittedBadge: {
    padding: 4
  }
});
