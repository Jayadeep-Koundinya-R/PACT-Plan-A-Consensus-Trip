import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScoredTripOption } from '../lib/consensus/types';
import { ConsensusMeter } from './ConsensusMeter';
import { colors, radius, shadows } from '../theme/colors';
import {
  Calendar,
  DollarSign,
  Heart,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  Tag
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
  isDarkMode = true,
  isApprovedByUser,
  approvalCount,
  onToggleVote
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = isDarkMode ? colors.dark : colors.light;
  const { option, rank, totalScore, consensusPercent, budgetGapFlag, plainEnglishReason, memberBreakdowns } = scoredOption;

  const isWinner = rank === 1 && consensusPercent >= 70;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isWinner ? theme.success : theme.glassBorder,
          borderWidth: isWinner ? 2 : 1,
          shadowColor: isWinner ? theme.success : '#000'
        },
        isWinner ? shadows.glowSuccess : shadows.md
      ]}
    >
      {/* Header Row: Rank Badge + Type + Heart Vote */}
      <View style={styles.header}>
        <View style={styles.rankContainer}>
          {isWinner ? (
            <View
              style={[
                styles.winnerBadge,
                {
                  backgroundColor: theme.success,
                  shadowColor: theme.success,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 4
                }
              ]}
            >
              <Award size={12} color="#FFFFFF" />
              <Text style={styles.winnerText}>TOP PICK #1</Text>
            </View>
          ) : (
            <View style={[styles.rankBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <Text style={[styles.rankText, { color: theme.textSecondary }]}>
                #{rank}
              </Text>
            </View>
          )}

          <Text style={[styles.destinationType, { color: theme.textSecondary }]}>
            {option.destinationType}
          </Text>
        </View>

        {/* Tactile Silent Vote Heart Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggleVote(option.id)}
          style={[
            styles.voteButton,
            {
              backgroundColor: isApprovedByUser ? theme.primaryLight : theme.surfaceElevated,
              borderColor: isApprovedByUser ? theme.primary : theme.border
            }
          ]}
        >
          <Heart
            size={18}
            color={isApprovedByUser ? theme.primary : theme.textMuted}
            fill={isApprovedByUser ? theme.primary : 'none'}
          />
          <Text
            style={[
              styles.voteCount,
              { color: isApprovedByUser ? theme.primary : theme.textSecondary }
            ]}
          >
            {approvalCount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Destination Title & Description */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>{option.name}</Text>
      {option.description ? (
        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {option.description}
        </Text>
      ) : null}

      {/* Meta Row: Dates | Price | Tags */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={13} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {option.dateStart} → {option.dateEnd}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <DollarSign size={13} color={theme.success} />
          <Text style={[styles.metaText, { color: theme.textPrimary, fontWeight: '700' }]}>
            ${option.budgetPerPerson} / person
          </Text>
        </View>
      </View>

      {/* Tags Chips */}
      <View style={styles.tagsContainer}>
        {option.tags.map((tag) => (
          <View
            key={tag}
            style={[styles.tagPill, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          >
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>
              #{tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Score Box */}
      <View style={[styles.scoreBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
            Consensus Match Score
          </Text>
          <Text style={[styles.scoreValue, { color: isWinner ? theme.success : theme.primary }]}>
            {totalScore}%
          </Text>
        </View>
        <ConsensusMeter percentage={consensusPercent} isDarkMode={isDarkMode} />
      </View>

      {/* Plain English Reason Box */}
      <View
        style={[
          styles.reasonBox,
          {
            backgroundColor: isWinner
              ? theme.successLight
              : budgetGapFlag
              ? theme.warningLight
              : theme.surfaceElevated,
            borderColor: isWinner ? 'rgba(16, 185, 129, 0.3)' : theme.border
          }
        ]}
      >
        <View style={styles.reasonHeader}>
          <Sparkles
            size={13}
            color={isWinner ? theme.success : theme.warning}
          />
          <Text
            style={[
              styles.reasonTitle,
              { color: isWinner ? theme.success : theme.warning }
            ]}
          >
            Why this rank:
          </Text>
        </View>
        <Text style={[styles.reasonText, { color: theme.textPrimary }]}>
          {plainEnglishReason}
        </Text>
      </View>

      {/* Budget Gap Warning Banner */}
      {budgetGapFlag && (
        <View style={[styles.warningBanner, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
          <AlertTriangle size={14} color={theme.warning} />
          <Text style={[styles.warningText, { color: theme.warning }]}>
            Budget Division: &gt;30% of members cannot afford this price.
          </Text>
        </View>
      )}

      {/* Expand / Collapse Member Breakdown */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.expandToggle}
      >
        <Text style={[styles.expandText, { color: theme.primary }]}>
          {isExpanded ? 'Hide Member Overlap Grid' : 'View Per-Member Overlap Details'}
        </Text>
        {isExpanded ? (
          <ChevronUp size={16} color={theme.primary} />
        ) : (
          <ChevronDown size={16} color={theme.primary} />
        )}
      </TouchableOpacity>

      {/* Expanded Per-Member Grid */}
      {isExpanded && (
        <View style={[styles.breakdownContainer, { borderTopColor: theme.border }]}>
          <Text style={[styles.breakdownTitle, { color: theme.textSecondary }]}>
            Anonymous Group Match Details:
          </Text>
          {memberBreakdowns.map((m) => (
            <View key={m.userId} style={styles.memberRow}>
              <View style={styles.memberNameCol}>
                {m.isViable ? (
                  <CheckCircle2 size={13} color={theme.success} />
                ) : (
                  <XCircle size={13} color={theme.danger} />
                )}
                <Text style={[styles.memberName, { color: theme.textPrimary }]}>
                  {m.userName}
                </Text>
              </View>

              <View style={styles.memberScoreCol}>
                {m.dealbreakerHit ? (
                  <Text style={[styles.dealbreakerAlert, { color: theme.danger }]}>
                    ❌ Dealbreaker Triggered
                  </Text>
                ) : (
                  <Text style={[styles.memberScoreDetails, { color: theme.textSecondary }]}>
                    Date: {(m.dateScore * 100).toFixed(0)}% • Budget: {(m.budgetScore * 100).toFixed(0)}% • Tags: {(m.tagScore * 100).toFixed(0)}%
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: 20,
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  winnerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800'
  },
  destinationType: {
    fontSize: 12,
    fontWeight: '500'
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  voteCount: {
    fontSize: 12,
    fontWeight: '700'
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  metaText: {
    fontSize: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600'
  },
  scoreBox: {
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  scoreValue: {
    fontSize: 19,
    fontWeight: '900'
  },
  reasonBox: {
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4
  },
  reasonTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500'
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 10
  },
  warningText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1
  },
  expandToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700'
  },
  breakdownContainer: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  memberNameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 85
  },
  memberName: {
    fontSize: 12,
    fontWeight: '700'
  },
  memberScoreCol: {
    flex: 1,
    alignItems: 'flex-end'
  },
  memberScoreDetails: {
    fontSize: 11,
    fontWeight: '500'
  },
  dealbreakerAlert: {
    fontSize: 11,
    fontWeight: '800'
  }
});
