import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows } from '../theme/colors';
import { AlertTriangle, Sparkles, ChevronRight, DollarSign, Calendar, ShieldAlert } from 'lucide-react-native';

export interface BottleneckIssue {
  type: 'budget' | 'dates' | 'dealbreaker';
  title: string;
  description: string;
}

interface BottlenecksSectionProps {
  issues: BottleneckIssue[];
  isDarkMode?: boolean;
  onResolve?: () => void;
}

export const BottlenecksSection: React.FC<BottlenecksSectionProps> = ({
  issues,
  isDarkMode = false,
  onResolve
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  if (!issues || issues.length === 0) return null;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handleResolvePress = () => {
    triggerHaptic();
    if (onResolve) onResolve();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1E293B' : '#FFF7ED', borderColor: isDarkMode ? 'rgba(234, 88, 12, 0.3)' : '#FED7AA' },
        shadows.sm
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(234, 88, 12, 0.2)' : '#FFEDD5' }]}>
          <AlertTriangle size={18} color={theme.primary} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            AI Conflict Detection
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {issues.length} {issues.length === 1 ? 'constraint conflict' : 'constraint conflicts'} surfaced privately
          </Text>
        </View>
      </View>

      {/* Issues List */}
      <View style={styles.issuesList}>
        {issues.map((issue, idx) => (
          <View
            key={`issue-${idx}`}
            style={[
              styles.issueCard,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={styles.issueIconCircle}>
              {issue.type === 'budget' ? (
                <DollarSign size={14} color="#F59E0B" />
              ) : issue.type === 'dates' ? (
                <Calendar size={14} color="#3B82F6" />
              ) : (
                <ShieldAlert size={14} color="#EF4444" />
              )}
            </View>
            <View style={styles.issueTextCol}>
              <Text style={[styles.issueTitle, { color: theme.textPrimary }]}>
                {issue.title}
              </Text>
              <Text style={[styles.issueDesc, { color: theme.textSecondary }]}>
                {issue.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action: Quick AI Resolve */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleResolvePress}
        style={[styles.resolveBtn, { backgroundColor: theme.primary }]}
      >
        <Sparkles size={16} color="#FFFFFF" />
        <Text style={styles.resolveBtnText}>AI Resolve: View Compromise Options</Text>
        <ChevronRight size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTextCol: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  issuesList: {
    gap: 8,
    marginBottom: 14
  },
  issueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1
  },
  issueIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1
  },
  issueTextCol: {
    flex: 1
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  issueDesc: {
    fontSize: 12,
    lineHeight: 16
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md
  },
  resolveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});