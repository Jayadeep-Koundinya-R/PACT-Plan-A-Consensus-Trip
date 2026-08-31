import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows } from '../theme/colors';
import { Check, HelpCircle, BellRing, Users } from 'lucide-react-native';
import { MemberPreference } from '../lib/consensus/types';

interface ConsensusMatrixProps {
  destinationTitle?: string;
  members?: MemberPreference[];
  totalMembersCount?: number;
  isOrganizer?: boolean;
  isDarkMode?: boolean;
  onNudge?: (pendingName: string) => void;
}

export const ConsensusMatrix: React.FC<ConsensusMatrixProps> = ({
  destinationTitle = 'Trip Circle',
  members = [],
  totalMembersCount = 5,
  isOrganizer = false,
  isDarkMode = false,
  onNudge
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  const safeMembers = Array.isArray(members) ? members : [];
  const submittedMembers = safeMembers.filter((m) => Boolean(m?.submittedAt));
  const pendingCount = Math.max(0, (totalMembersCount || 5) - submittedMembers.length);
  const pendingNames = safeMembers
    .filter((m) => !m?.submittedAt)
    .map((m) => m?.userName || (m as any)?.name || 'Traveler');
  const firstPendingName = pendingNames.length > 0 ? pendingNames[0] : 'Pending travelers';

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handleNudgePress = () => {
    triggerHaptic();
    if (onNudge) {
      onNudge(firstPendingName);
    } else {
      Alert.alert(
        'Nudge Sent! 🔔',
        `A friendly reminder was sent to ${firstPendingName} to submit their constraints.`
      );
    }
  };

  return (
    <View
      style={[
        styles.matrixCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        shadows.sm
      ]}
    >
      {/* Top Row: Title + Leading Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Users size={16} color={theme.primary} />
          <Text style={[styles.destinationText, { color: theme.textPrimary }]} numberOfLines={1}>
            {destinationTitle || 'Trip Circle'}
          </Text>
        </View>
        <View style={[styles.leadingBadge, { backgroundColor: isDarkMode ? 'rgba(234, 88, 12, 0.2)' : '#FFEDD5' }]}>
          <Text style={[styles.leadingText, { color: theme.primary }]}>LEADING OPTION</Text>
        </View>
      </View>

      {/* Split Matrix Columns */}
      <View style={styles.splitRow}>
        {/* Yes Column */}
        <View style={[styles.columnBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: theme.border }]}>
          <View style={styles.colHeaderRow}>
            <View style={[styles.miniCheckCircle, { backgroundColor: theme.success }]}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={[styles.colTitle, { color: theme.textPrimary }]}>
              Submitted ({submittedMembers.length})
            </Text>
          </View>

          <View style={styles.avatarGrid}>
            {submittedMembers.map((m, idx) => {
              const name = m?.userName || (m as any)?.name || `Traveler ${idx + 1}`;
              return (
                <View
                  key={m?.userId || `member-${idx}`}
                  style={[
                    styles.avatarBubble,
                    { backgroundColor: isDarkMode ? '#334155' : '#FFFFFF', borderColor: theme.primary }
                  ]}
                >
                  <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pending Column */}
        <View style={[styles.columnBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: theme.border }]}>
          <View style={styles.colHeaderRow}>
            <HelpCircle size={13} color={theme.textMuted} />
            <Text style={[styles.colTitle, { color: theme.textSecondary }]}>
              Pending ({pendingCount})
            </Text>
          </View>

          <View style={styles.avatarGrid}>
            {Array.from({ length: Math.min(pendingCount, 4) }).map((_, idx) => (
              <View
                key={`pending-${idx}`}
                style={[
                  styles.avatarBubble,
                  styles.pendingAvatarBubble,
                  { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }
                ]}
              >
                <Text style={[styles.avatarText, { color: theme.textMuted }]}>?</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Footer: Inline Nudge Row */}
      {pendingCount > 0 && (
        <View style={[styles.nudgeFooter, { borderTopColor: theme.border }]}>
          <Text style={[styles.nudgeText, { color: theme.textSecondary }]} numberOfLines={1}>
            {firstPendingName} hasn't shared constraints yet.
          </Text>

          {isOrganizer && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleNudgePress}
              style={[styles.nudgeBtn, { backgroundColor: isDarkMode ? '#334155' : '#FFEDD5' }]}
            >
              <Text style={[styles.nudgeBtnText, { color: theme.primary }]}>NUDGE</Text>
              <BellRing size={12} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  matrixCard: {
    width: '100%',
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1
  },
  destinationText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  leadingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  leadingText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  columnBox: {
    flex: 1,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1
  },
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  miniCheckCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  colTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  avatarBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pendingAvatarBubble: {
    borderStyle: 'dashed'
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '800'
  },
  nudgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8
  },
  nudgeText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});