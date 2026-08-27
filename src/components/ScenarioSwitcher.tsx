import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { colors, radius, shadows } from '../theme/colors';
import { CheckCircle2, AlertTriangle, Ban, Sparkles, RotateCcw, Check } from 'lucide-react-native';

export const ScenarioSwitcher: React.FC = () => {
  const { isDarkMode, activeGroupId, setDemoScenario, resetDemoState } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  const [resetSuccess, setResetSuccess] = useState(false);

  const scenarios = [
    {
      id: 'consensus_winner',
      label: '1. Winner (Goa)',
      icon: CheckCircle2,
      color: theme.success,
      badge: '100% Agreement'
    },
    {
      id: 'budget_deadlock',
      label: '2. Budget Gap',
      icon: AlertTriangle,
      color: theme.warning,
      badge: 'Budget Division'
    },
    {
      id: 'dealbreaker_deadlock',
      label: '3. Dealbreaker',
      icon: Ban,
      color: theme.danger,
      badge: '0% Override'
    }
  ] as const;

  const handleReset = () => {
    resetDemoState();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.glassBorder },
        shadows.sm
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={14} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
            EDGE-CASE ENGINE (JUDGE TOOL)
          </Text>
        </View>

        {/* M1: Reset Demo State Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleReset}
          style={[
            styles.resetBtn,
            {
              backgroundColor: resetSuccess ? theme.successLight : theme.surfaceElevated,
              borderColor: resetSuccess ? theme.success : theme.border
            }
          ]}
        >
          {resetSuccess ? (
            <Check size={12} color={theme.success} />
          ) : (
            <RotateCcw size={12} color={theme.textSecondary} />
          )}
          <Text
            style={[
              styles.resetBtnText,
              { color: resetSuccess ? theme.success : theme.textSecondary }
            ]}
          >
            {resetSuccess ? 'Reset!' : 'Reset Demo'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scenariosRow}>
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.7}
              onPress={() => setDemoScenario(s.id as any)}
              style={[
                styles.scenarioBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border
                }
              ]}
            >
              <Icon size={14} color={s.color} />
              <View style={styles.scenarioTextContainer}>
                <Text
                  style={[styles.scenarioLabel, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
                <Text style={[styles.scenarioBadge, { color: s.color }]}>
                  {s.badge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1
  },
  resetBtnText: {
    fontSize: 10,
    fontWeight: '700'
  },
  scenariosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  scenarioBtn: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1
  },
  scenarioTextContainer: {
    flex: 1
  },
  scenarioLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  scenarioBadge: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1
  }
});
