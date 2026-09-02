import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { ScoredTripOption } from '../lib/consensus/types';
import { formatFriendlyDateRange } from '../lib/format/dateFormatter';
import { colors, radius } from '../theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';
import {
  Calendar,
  DollarSign,
  Heart,
  ChevronDown,
  ChevronUp,
  Award,
  XCircle
} from 'lucide-react-native';

interface RankedOptionCardProps {
  scoredOption: ScoredTripOption;
  isDarkMode?: boolean;
  isApprovedByUser: boolean;
  approvalCount: number;
  onToggleVote: (optionId: string) => void;
}

export const RankedOptionCard: React.FC<RankedOptionCardProps> = ({
  scoredOption,
  isDarkMode = false,
  isApprovedByUser,
  approvalCount,
  onToggleVote
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = isDarkMode ? colors.dark : colors.light;

  if (!scoredOption || !scoredOption.option) return null;

  const {
    option,
    rank = 1,
    totalScore = 0,
    consensusPercent = 0,
    plainEnglishReason = '',
    memberBreakdowns = []
  } = scoredOption;

  const isWinner = rank === 1;
  const agreementColor = consensusPercent >= 70 ? theme.success : theme.primary;

  return (
    <View
      style={[
        styles.card,
        {
          borderTopRightRadius: radius.md,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderWidth: 1,
          borderColor: isWinner ? theme.primary : theme.border,
          backgroundColor: theme.surface
        }
      ]}
    >
      {/* Top Header Row */}
      <View style={[styles.headerRow, { backgroundColor: theme.surfaceSubtle }]}>
        {/* Rank Badge */}
        {isWinner ? (
          <View style={[styles.rankBadge, { backgroundColor: theme.primary }]}>
            <Award size={11} color="#FFFFFF" />
            <Text style={[styles.rankBadgeText, { fontFamily: fontUIBold, color: '#FFFFFF' }]}>
              TOP PICK #1
            </Text>
          </View>
        ) : (
          <View style={[styles.rankBadge, { backgroundColor: theme.surfaceSubtle, borderWidth: 1, borderColor: theme.border }]}>
            <Text style={[styles.rankBadgeText, { fontFamily: fontUIBold, color: theme.textSecondary }]}>
              #{rank}
            </Text>
          </View>
        )}

        {/* Destination Name */}
        <Text
          style={[styles.destinationName, { fontFamily: fontUIBold, color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {option.name || 'Trip Option'}
        </Text>

        {/* Match % Pill */}
        <View style={[styles.matchPill, { backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.border }]}>
          <Text style={[styles.matchPillText, { fontFamily: fontUIBold, color: theme.primary }]}>
            {totalScore}% MATCH
          </Text>
        </View>
      </View>

      {/* Dashed Perforation Line */}
      <View style={[styles.perforation, { borderColor: theme.border }]} />

      {/* Bottom Section: Stub + Content */}
      <View style={styles.bottomSection}>
        {/* Left Stub (28%) */}
        <View
          style={[
            styles.stub,
            {
              backgroundColor: theme.surfaceSubtle,
              borderRightWidth: 1,
              borderRightColor: theme.border
            }
          ]}
        >
          <Text style={[styles.stubScore, { fontFamily: fontDisplay, color: agreementColor }]}>
            {consensusPercent}%
          </Text>
          <Text style={[styles.stubLabel, { fontFamily: fontUI, color: theme.textSecondary }]}>
            AGREEMENT
          </Text>
        </View>

        {/* Right Content (72%) */}
        <View style={styles.rightContent}>
          {/* Date Row */}
          <View style={styles.metaRow}>
            <Calendar size={13} color={theme.secondary} />
            <Text style={[styles.metaText, { fontFamily: fontUI, color: theme.textSecondary }]}>
              {formatFriendlyDateRange(option.dateStart, option.dateEnd)}
            </Text>
          </View>

          {/* Budget Row */}
          <View style={styles.metaRow}>
            <DollarSign size={13} color={theme.success} />
            <Text style={[styles.metaText, { fontFamily: fontUI, color: theme.textSecondary }]}>
              ${option.budgetPerPerson || 0}/person
            </Text>
          </View>

          {/* Reason (if present) */}
          {plainEnglishReason ? (
            <Text style={[styles.reasonText, { fontFamily: fontUI, color: theme.textMuted }]} numberOfLines={2}>
              {plainEnglishReason}
            </Text>
          ) : null}

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onToggleVote(option.id)}
              style={[
                styles.voteBtn,
                {
                  backgroundColor: isApprovedByUser ? theme.primaryLight : theme.surfaceSubtle,
                  borderColor: isApprovedByUser ? theme.primary : theme.border
                }
              ]}
            >
              <Heart
                size={14}
                color={isApprovedByUser ? theme.primary : theme.textMuted}
                fill={isApprovedByUser ? theme.primary : 'none'}
              />
              <Text style={[styles.voteBtnText, { fontFamily: fontUIBold, color: isApprovedByUser ? theme.primary : theme.textSecondary }]}>
                {approvalCount || 0} {(approvalCount || 0) === 1 ? 'Vote' : 'Votes'}
              </Text>
            </TouchableOpacity>

            {memberBreakdowns.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsExpanded(!isExpanded)}
                style={[styles.expandBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.expandBtnText, { fontFamily: fontUI, color: theme.textSecondary }]}>
                  {isExpanded ? 'Hide Details' : 'View Breakdown'}
                </Text>
                {isExpanded ? (
                  <ChevronUp size={13} color={theme.textSecondary} />
                ) : (
                  <ChevronDown size={13} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Expanded Member Breakdowns */}
      {isExpanded && memberBreakdowns.length > 0 && (
        <View style={[styles.breakdownContainer, { borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.breakdownHeading, { fontFamily: fontUIBold, color: theme.textPrimary }]}>
            Individual Traveler Compatibility
          </Text>

          {memberBreakdowns.map((mb, idx) => {
            const name = mb?.userName || (mb as any)?.memberName || `Traveler ${idx + 1}`;
            const dScore = Math.round((mb?.dateScore || 0) * 100);
            const bScore = Math.round((mb?.budgetScore || 0) * 100);
            const tScore = Math.round((mb?.tagScore || 0) * 100);
            const mScore = Math.round((mb?.memberScore || 0) * 100);
            const isDealbreaker = Boolean(mb?.dealbreakerHit || (mb as any)?.dealbreakerTriggered);

            return (
              <View
                key={mb?.userId || `mb-${idx}`}
                style={[
                  styles.memberRow,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                <View style={styles.memberLeft}>
                  <View style={[styles.memberAvatar, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.memberAvatarText, { fontFamily: fontUIBold, color: theme.textPrimary }]}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.memberName, { fontFamily: fontUIBold, color: theme.textPrimary }]}>
                      {name}
                    </Text>
                    <Text style={[styles.memberScoreBreakdown, { fontFamily: fontUI, color: theme.textSecondary }]}>
                      Dates {dScore}% • Budget {bScore}% • Tags {tScore}%
                    </Text>
                  </View>
                </View>

                <View style={styles.memberRight}>
                  {isDealbreaker ? (
                    <View style={[styles.dealbreakerPill, { backgroundColor: theme.dangerLight }]}>
                      <XCircle size={12} color={theme.danger} />
                      <Text style={[styles.dealbreakerPillText, { fontFamily: fontUIBold, color: theme.danger }]}>VETO</Text>
                    </View>
                  ) : (
                    <Text style={[styles.memberScorePill, { fontFamily: fontUIBold, color: theme.success }]}>
                      {mScore}%
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: 14
  },
  // Top header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  destinationName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    paddingHorizontal: 4
  },
  matchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  matchPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  // Dashed perforation
  perforation: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%'
  },
  // Bottom section
  bottomSection: {
    flexDirection: 'row'
  },
  stub: {
    width: '28%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stubScore: {
    fontSize: 22,
    fontWeight: '900'
  },
  stubLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2
  },
  rightContent: {
    flex: 1,
    padding: 12,
    gap: 6
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16
  },
  reasonText: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap'
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  voteBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: '600'
  },
  // Member breakdown
  breakdownContainer: {
    padding: 12,
    gap: 6
  },
  breakdownHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  memberAvatarText: {
    fontSize: 10,
    fontWeight: '800'
  },
  memberName: {
    fontSize: 12,
    fontWeight: '700'
  },
  memberScoreBreakdown: {
    fontSize: 10
  },
  memberRight: {},
  dealbreakerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  dealbreakerPillText: {
    fontSize: 9,
    fontWeight: '800'
  },
  memberScorePill: {
    fontSize: 12,
    fontWeight: '800'
  }
});
