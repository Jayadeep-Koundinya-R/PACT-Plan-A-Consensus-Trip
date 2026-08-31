import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme/colors';
import { Check } from 'lucide-react-native';

interface StepProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
  groupId: string;
  isDarkMode?: boolean;
}

const STEPS = [
  { step: 1, label: 'Constraints', route: 'preferences' },
  { step: 2, label: 'Rankings', route: 'options' },
  { step: 3, label: 'Silent Vote', route: 'vote' },
  { step: 4, label: 'Trip Brief', route: 'brief' }
] as const;

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  groupId,
  isDarkMode = false
}) => {
  const router = useRouter();
  const theme = isDarkMode ? colors.dark : colors.light;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleStepPress = (route: string) => {
    triggerHaptic();
    router.push(`/groups/${groupId}/${route}` as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          borderTopWidth: 2,
          borderTopColor: theme.primary
        }
      ]}
    >
      <View style={styles.stepsRow}>
        {STEPS.map((s, idx) => {
          const isCompleted = s.step < currentStep || currentStep === 4;
          const isCurrent = s.step === currentStep;

          return (
            <React.Fragment key={s.step}>
              {/* Step item */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleStepPress(s.route)}
                style={styles.stepItem}
              >
                <View
                  style={[
                    styles.circle,
                    isCurrent && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                      shadowColor: theme.primary,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.35,
                      shadowRadius: 6,
                      elevation: 3
                    },
                    isCompleted && !isCurrent && {
                      backgroundColor: theme.success,
                      borderColor: theme.success
                    },
                    !isCompleted && !isCurrent && {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border
                    }
                  ]}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        {
                          color: isCurrent
                            ? '#FFFFFF'
                            : isCompleted
                            ? '#FFFFFF'
                            : theme.textMuted
                        }
                      ]}
                    >
                      {s.step}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      color: isCurrent
                        ? theme.textPrimary
                        : isCompleted
                        ? theme.textSecondary
                        : theme.textMuted,
                      fontWeight: isCurrent ? '800' : '600'
                    }
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>

              {/* Connecting line between steps */}
              {idx < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connectingLine,
                    {
                      backgroundColor:
                        s.step < currentStep
                          ? theme.success
                          : theme.border
                    }
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    width: '100%'
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: '800'
  },
  label: {
    fontSize: 11,
    letterSpacing: -0.2
  },
  connectingLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 6,
    borderRadius: 1
  }
});