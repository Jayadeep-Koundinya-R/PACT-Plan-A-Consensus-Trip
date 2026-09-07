import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { Check } from 'lucide-react-native';

export type StepRoute = 'hub' | 'preferences' | 'ranked-matrix' | 'silent-ballot' | 'brief';

interface StepProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | number;
  groupId: string;
  isDarkMode?: boolean;
}

const STEPS = [
  { step: 1, label: 'Hub', route: 'hub' },
  { step: 2, label: 'Constraints', route: 'preferences' },
  { step: 3, label: 'Matrix', route: 'ranked-matrix' },
  { step: 4, label: 'Vote', route: 'silent-ballot' },
  { step: 5, label: 'Brief', route: 'brief' }
] as const;

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  groupId,
  isDarkMode = true
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
    router.push(`/circle/${groupId}/${route}` as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: '#0E1424',
          borderBottomColor: '#262E48',
          borderTopWidth: 1,
          borderTopColor: '#262E48'
        }
      ]}
    >
      <View style={styles.stepsRow}>
        {STEPS.map((s, idx) => {
          const isCompleted = s.step < currentStep || currentStep === 5;
          const isCurrent = s.step === currentStep;

          return (
            <React.Fragment key={s.step}>
              {/* Step item */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleStepPress(s.route)}
                style={styles.stepItem}
                accessibilityLabel={`Go to step ${s.step}: ${s.label}`}
              >
                <View
                  style={[
                    styles.circle,
                    isCurrent && {
                      backgroundColor: '#C99A5B',
                      borderColor: '#C99A5B',
                      shadowColor: '#C99A5B',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.45,
                      shadowRadius: 6,
                      elevation: 3
                    },
                    isCompleted && !isCurrent && {
                      backgroundColor: '#58A68C',
                      borderColor: '#58A68C'
                    },
                    !isCompleted && !isCurrent && {
                      backgroundColor: '#1F2840',
                      borderColor: '#303A55'
                    }
                  ]}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={10} color="#16301E" strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        {
                          color: isCurrent
                            ? '#FFFFFF'
                            : isCompleted
                            ? '#16301E'
                            : '#A9A08C'
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
                        ? '#F3EEE2'
                        : isCompleted
                        ? '#58A68C'
                        : '#A9A08C',
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
                          ? '#58A68C'
                          : '#262E48'
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
    height: 52,
    paddingHorizontal: 12,
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
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumber: {
    fontSize: 9,
    fontWeight: '800'
  },
  label: {
    fontSize: 10,
    letterSpacing: -0.2
  },
  connectingLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    borderRadius: 1
  }
});
