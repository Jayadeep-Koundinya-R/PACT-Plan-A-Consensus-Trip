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
  const { option, rank, totalScore, consensusPercent, budgetGapFlag, plainEnglishReason, memberBreakdowns } = scoredOption;

  const isWinner = rank === 1 && consensusPercent >= 70;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isWinner ? theme.success : theme.border,
          borderWidth: isWinner ? 2 : 1
        },
        shadows.md
      ]}
    >
      {/* Header with Rank Badge & Voting Button */}
      <View style={styles.header}>
        <View style={styles.rankContainer}>
          <View
            style={[
              styles.rankBadge,
              {
                backgroundColor: isWinner
                  ? theme.success
                  : rank === 2
                  ? theme.primary
                  : theme.secondaryLight
              }
            ]}
          >
            <Text
              style={[
                styles.rankText,
                { color: isWinner || rank === 2 ? '#FFFFFF' : theme.textPrimary }
              ]}
            >
              {isWinner ? '🏆 #1 TOP PICK' : `#${rank}`}
            </Text>
          </View>
          <Text style={[styles.destinationType, { color: theme.textSecondary }]}>
            {option.destinationType}
          </Text>
        </View>

        {/* Silent Vote Heart Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggleVote(option.id)}
          style={[
            styles.voteButton,
            {
              backgroundColor: isApprovedByUser ? theme.primaryLight : theme.surfaceSubtle,
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
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {option.description}
        </Text>
      ) : null}

      {/* Meta Info: Dates & Cost */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Calendar size={14} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {option.dateStart} → {option.dateEnd}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <DollarSign size={14} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary, fontWeight: '700' }]}>
            ${option.budgetPerPerson} / person
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {option.tags.map((tag) => (
          <View
            key={tag}
            style={[styles.tagPill, { backgroundColor: theme.surfaceSubtle }]}
          >
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>
              #{tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Score Summary */}
      <View style={[styles.scoreBox, { backgroundColor: theme.surfaceSubtle }]}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
            Consensus Match Score
          </Text>
          <Text style={[styles.scoreValue, { color: theme.primary }]}>
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
              ? theme.secondaryLight
              : theme.surfaceSubtle
          }
        ]}
      >
        <View style={styles.reasonHeader}>
          <Sparkles
            size={14}
            color={isWinner ? theme.success : theme.secondary}
          />
          <Text
            style={[
              styles.reasonTitle,
              { color: isWinner ? theme.success : theme.textPrimary }
            ]}
          >
            Why this rank:
          </Text>
        </View>
        <Text style={[styles.reasonText, { color: theme.textPrimary }]}>
          {plainEnglishReason}
        </Text>
      </View>

      {/* Budget Gap Warning Banner if applicable */}
      {budgetGapFlag && (
        <View style={[styles.warningBanner, { backgroundColor: theme.dangerLight }]}>
          <AlertTriangle size={14} color={theme.danger} />
          <Text style={[styles.warningText, { color: theme.danger }]}>
            Budget Division: &gt;30% of members cannot afford this option.
          </Text>
        </View>
      )}

      {/* Expand / Collapse Member Breakdown Toggle */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.expandToggle}
      >
        <Text style={[styles.expandText, { color: theme.primary }]}>
          {isExpanded ? 'Hide Member Breakdown' : 'View Per-Member Overlap'}
        </Text>
        {isExpanded ? (
          <ChevronUp size={16} color={theme.primary} />
        ) : (
          <ChevronDown size={16} color={theme.primary} />
        )}
      </TouchableOpacity>

      {/* Collapsible Member Breakdown */}
      {isExpanded && (
        <View style={[styles.breakdownContainer, { borderTopColor: theme.border }]}>
          <Text style={[styles.breakdownTitle, { color: theme.textSecondary }]}>
            Anonymous Group Match Details:
          </Text>
          {memberBreakdowns.map((m) => (
            <View key={m.userId} style={styles.memberRow}>
              <View style={styles.memberNameCol}>
                {m.isViable ? (
                  <CheckCircle2 size={14} color={theme.success} />
                ) : (
                  <XCircle size={14} color={theme.danger} />
                )}
                <Text style={[styles.memberName, { color: theme.textPrimary }]}>
                  {m.userName}
                </Text>
              </View>

              <View style={styles.memberScoreCol}>
                {m.dealbreakerHit ? (
                  <Text style={[styles.dealbreakerAlert, { color: theme.danger }]}>
                    Dealbreaker Triggered
                  </Text>
                ) : (
                  <Text style={[styles.memberScoreDetails, { color: theme.textSecondary }]}>
                    Date: {(m.dateScore * 100).toFixed(0)}% | Budget: {(m.budgetScore * 100).toFixed(0)}% | Tags: {(m.tagScore * 100).toFixed(0)}%
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
    padding: 16,
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 10
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600'
  },
  scoreBox: {
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 10
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800'
  },
  reasonBox: {
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 10
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  reasonTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500'
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: radius.sm,
    marginBottom: 10
  },
  warningText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  expandToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 4
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600'
  },
  breakdownContainer: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '600',
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
    width: 90
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600'
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
    fontWeight: '700'
  }
});
