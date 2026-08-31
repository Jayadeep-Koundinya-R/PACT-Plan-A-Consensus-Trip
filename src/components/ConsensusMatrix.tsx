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
import { Check, HelpCircle, BellRing, Sparkles } from 'lucide-react-native';
import { MemberPreference } from '../lib/consensus/types';

interface ConsensusMatrixProps {
  destinationTitle: string;
  members: MemberPreference[];
  totalMembersCount: number;
  isOrganizer: boolean;
  isDarkMode?: boolean;
  onNudge?: (pendingName: string) => void;
}

export const ConsensusMatrix: React.FC<ConsensusMatrixProps> = ({
  destinationTitle,
  members,
  totalMembersCount,
  isOrganizer,
  isDarkMode = false,
  onNudge
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  const submittedMembers = members.filter((m) => Boolean(m.submittedAt));
  const pendingCount = Math.max(0, totalMembersCount - submittedMembers.length);
  const pendingNames = members.filter((m) => !m.submittedAt).map((m) => m.name);
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
        `A friendly reminder was sent to ${firstPendingName} to submit their dates and budget.`
      );
    }
  };

  return (
    <View
      style={[
        styles.matrixCard,
        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
        shadows.md
      ]}
    >
      {/* Top Row: Title + Leading Badge */}
      <View style={styles.headerRow}>
        <Text style={[styles.destinationText, { color: theme.textPrimary }]} numberOfLines={1}>
          {destinationTitle}
        </Text>
        <View style={[styles.leadingBadge, { backgroundColor: isDarkMode ? 'rgba(234, 88, 12, 0.25)' : '#FDEEE5' }]}>
          <Text style={[styles.leadingText, { color: theme.secondary }]}>LEADING</Text>
        </View>
      </View>

      {/* Split Matrix Columns */}
      <View style={styles.splitRow}>
        {/* Yes Column */}
        <View style={[styles.columnBox, { backgroundColor: isDarkMode ? '#22160F' : '#FDF6F0', borderColor: theme.border }]}>
          <View style={styles.colHeaderRow}>
            <View style={[styles.miniCheckCircle, { backgroundColor: theme.success }]}>
              <Check size={10} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={[styles.colTitle, { color: theme.textPrimary }]}>
              Yes ({submittedMembers.length})
            </Text>
          </View>

          <View style={styles.avatarGrid}>
            {submittedMembers.map((m, idx) => (
              <View
                key={m.userId || idx}
                style={[
                  styles.avatarBubble,
                  { backgroundColor: theme.primaryLight, borderColor: theme.secondary }
                ]}
              >
                <Text style={[styles.avatarText, { color: theme.textPrimary }]}>
                  {(m.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pending Column */}
        <View style={[styles.columnBox, { backgroundColor: isDarkMode ? '#22160F' : '#FDF6F0', borderColor: theme.border }]}>
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
                  { borderColor: theme.textMuted, backgroundColor: theme.surfaceSubtle }
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
            {firstPendingName} needs to confirm constraints.
          </Text>

          {isOrganizer && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleNudgePress}
              style={[styles.nudgeBtn, { backgroundColor: isDarkMode ? '#3A2012' : '#FDE8DC' }]}
            >
              <Text style={[styles.nudgeBtnText, { color: theme.secondary }]}>NUDGE</Text>
              <BellRing size={12} color={theme.secondary} />
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
  destinationText: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.3
  },
  leadingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  leadingText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 11,
    fontWeight: '500',
    flex: 1
  },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});