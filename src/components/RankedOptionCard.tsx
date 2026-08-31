import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Platform
} from 'react-native';
import { ScoredTripOption } from '../lib/consensus/types';
import { formatFriendlyDateRange } from '../lib/format/dateFormatter';
import { colors, radius, shadows } from '../theme/colors';
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

const DESTINATION_IMAGES: Record<string, string> = {
  'Goa Beach Weekend': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
  'Coastal Getaway': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
  'Manali High Altitude Adventure': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
  'Mountain Retreat': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
  'Kerala Backwaters Chill': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
  'Nature & Houseboat': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
  'Bangalore Craft Brewery Tour': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop';

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

  const { option, rank = 1, totalScore = 0, consensusPercent = 0, plainEnglishReason = '', memberBreakdowns = [] } = scoredOption;

  const isWinner = rank === 1;
  const imageUrl = DESTINATION_IMAGES[option.name] || DESTINATION_IMAGES[option.destinationType] || DEFAULT_IMAGE;

  // Segmented agreement bars (10 segments)
  const activeSegments = Math.max(0, Math.min(10, Math.round(((consensusPercent || 0) / 100) * 10)));

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isWinner ? (isDarkMode ? 'rgba(234, 88, 12, 0.4)' : '#FED7AA') : theme.border
        },
        shadows.md
      ]}
    >
      {/* Top Hero Image (Height 135px with overlay) */}
      <View style={styles.imageWrapper}>
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          {/* Gradient Scrim Overlay */}
          <View style={styles.scrimOverlay}>
            {/* Top Row: Rank/Winner Tag + Match Pill */}
            <View style={styles.imageTopRow}>
              {isWinner ? (
                <View style={[styles.topPickBadge, { backgroundColor: theme.primary }]}>
                  <Award size={12} color="#FFFFFF" />
                  <Text style={styles.topPickBadgeText}>TOP PICK #1</Text>
                </View>
              ) : (
                <View style={[styles.rankPill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Text style={styles.rankPillText}>#{rank}</Text>
                </View>
              )}

              <View style={[styles.matchBadge, { backgroundColor: isDarkMode ? 'rgba(28, 19, 13, 0.85)' : 'rgba(255, 255, 255, 0.92)' }]}>
                <Text style={[styles.matchPercentText, { color: theme.primary }]}>
                  {totalScore}%
                </Text>
                <Text style={[styles.matchLabelText, { color: theme.textSecondary }]}>
                  MATCH
                </Text>
              </View>
            </View>

            {/* Bottom Row on Image: Title, Date, Budget */}
            <View style={styles.imageBottomRow}>
              <Text style={styles.imageTitleText} numberOfLines={1}>
                {option.name || 'Trip Option'}
              </Text>
              <View style={styles.imageSubRow}>
                <View style={styles.imageMetaItem}>
                  <Calendar size={11} color="#FFFFFF" />
                  <Text style={styles.imageMetaText}>
                    {formatFriendlyDateRange(option.dateStart, option.dateEnd)}
                  </Text>
                </View>
                <Text style={styles.imageDot}>•</Text>
                <View style={styles.imageMetaItem}>
                  <DollarSign size={11} color="#10B981" />
                  <Text style={[styles.imageMetaText, { color: '#FFFFFF', fontWeight: '700' }]}>
                    ${option.budgetPerPerson || 0}/person
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Body Content */}
      <View style={styles.bodyContent}>
        {/* Segmented Group Agreement Meter */}
        <View style={styles.agreementRow}>
          <Text style={[styles.agreementLabel, { color: theme.textSecondary }]}>
            Group Agreement
          </Text>
          <Text style={[styles.agreementStatus, { color: consensusPercent >= 70 ? theme.success : theme.secondary }]}>
            {consensusPercent >= 70 ? 'High' : consensusPercent >= 40 ? 'Moderate' : 'Low'} ({consensusPercent}%)
          </Text>
        </View>

        <View style={styles.segmentedMeter}>
          {Array.from({ length: 10 }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.meterSegment,
                {
                  backgroundColor:
                    idx < activeSegments
                      ? theme.primary
                      : theme.meterTrack
                }
              ]}
            />
          ))}
        </View>

        {/* Reason Explainer */}
        {plainEnglishReason ? (
          <View style={[styles.reasonBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Text style={[styles.reasonText, { color: theme.textSecondary }]}>
              {plainEnglishReason}
            </Text>
          </View>
        ) : null}

        {/* Action Row: Silent Vote Heart + Expand Button */}
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
              size={16}
              color={isApprovedByUser ? theme.primary : theme.textMuted}
              fill={isApprovedByUser ? theme.primary : 'none'}
            />
            <Text style={[styles.voteBtnText, { color: isApprovedByUser ? theme.primary : theme.textSecondary }]}>
              {approvalCount || 0} {(approvalCount || 0) === 1 ? 'Vote' : 'Votes'}
            </Text>
          </TouchableOpacity>

          {memberBreakdowns.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsExpanded(!isExpanded)}
              style={[styles.expandBtn, { borderColor: theme.border }]}
            >
              <Text style={[styles.expandBtnText, { color: theme.textSecondary }]}>
                {isExpanded ? 'Hide Details' : 'View Breakdown'}
              </Text>
              {isExpanded ? (
                <ChevronUp size={14} color={theme.textSecondary} />
              ) : (
                <ChevronDown size={14} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Expanded Member Breakdowns */}
        {isExpanded && memberBreakdowns.length > 0 && (
          <View style={[styles.breakdownContainer, { borderTopColor: theme.border }]}>
            <Text style={[styles.breakdownHeading, { color: theme.textPrimary }]}>
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
                      <Text style={[styles.memberAvatarText, { color: theme.textPrimary }]}>
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.memberName, { color: theme.textPrimary }]}>
                        {name}
                      </Text>
                      <Text style={[styles.memberScoreBreakdown, { color: theme.textSecondary }]}>
                        Dates {dScore}% • Budget {bScore}% • Tags {tScore}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.memberRight}>
                    {isDealbreaker ? (
                      <View style={styles.dealbreakerPill}>
                        <XCircle size={12} color="#EF4444" />
                        <Text style={styles.dealbreakerPillText}>VETO</Text>
                      </View>
                    ) : (
                      <Text style={[styles.memberScorePill, { color: theme.success }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16
  },
  imageWrapper: {
    width: '100%',
    height: 135
  },
  imageBackground: {
    width: '100%',
    height: '100%'
  },
  imageStyle: {
    borderTopLeftRadius: radius.card - 1,
    borderTopRightRadius: radius.card - 1
  },
  scrimOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'space-between',
    padding: 12
  },
  imageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  topPickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  topPickBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  rankPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  rankPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  matchPercentText: {
    fontSize: 12,
    fontWeight: '800'
  },
  matchLabelText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  imageBottomRow: {
    gap: 2
  },
  imageTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  imageSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  imageMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  imageMetaText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '500'
  },
  imageDot: {
    color: '#94A3B8',
    fontSize: 10
  },
  bodyContent: {
    padding: 14
  },
  agreementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  agreementLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  agreementStatus: {
    fontSize: 12,
    fontWeight: '800'
  },
  segmentedMeter: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12
  },
  meterSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3
  },
  reasonBox: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 12
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: '600'
  },
  breakdownContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
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
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  dealbreakerPillText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800'
  },
  memberScorePill: {
    fontSize: 12,
    fontWeight: '800'
  }
});