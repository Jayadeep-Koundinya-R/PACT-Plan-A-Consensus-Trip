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
import { AlertTriangle, Sparkles, ArrowRight } from 'lucide-react-native';

interface BottleneckIssue {
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleResolvePress = () => {
    triggerHaptic();
    if (onResolve) onResolve();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
        Bottlenecks
      </Text>

      {issues.map((issue, idx) => (
        <View
          key={idx}
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? '#22140F' : '#FFF3EB', borderColor: isDarkMode ? 'rgba(234, 88, 12, 0.2)' : '#FED7AA' },
            shadows.sm
          ]}
        >
          <View style={styles.topRow}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}>
              <AlertTriangle size={18} color="#EF4444" />
            </View>

            <View style={styles.textContent}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {issue.title}
              </Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {issue.description}
              </Text>
            </View>
          </View>

          {onResolve && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleResolvePress}
              style={[
                styles.resolveBtn,
                { backgroundColor: isDarkMode ? '#341D12' : '#FDE0D0', borderColor: isDarkMode ? 'rgba(234, 88, 12, 0.3)' : '#FDBA74' }
              ]}
            >
              <Sparkles size={14} color={theme.secondary} />
              <Text style={[styles.resolveBtnText, { color: theme.secondary }]}>
                Quick AI Resolve
              </Text>
              <ArrowRight size={13} color={theme.secondary} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.3
  },
  card: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textContent: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  description: {
    fontSize: 12,
    lineHeight: 17
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1
  },
  resolveBtnText: {
    fontSize: 12,
    fontWeight: '800'
  }
});