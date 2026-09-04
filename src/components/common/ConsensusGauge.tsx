import React, { ReactNode, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { fontDisplay, fontUIBold } from '../../theme/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ConsensusGaugeProps {
  /** Value as a percentage 0-100 */
  value?: number;
  /** Progress as a 0-1 fraction (alternative to value) */
  progress?: number;
  /** Outer square dimension in pixels (default 84) */
  size?: number;
  /** Thickness of the progress ring (default 7) */
  strokeWidth?: number;
  /** Active stroke color (default #3DE0A0) */
  strokeColor?: string;
  /** Background track circle color (default rgba(255,255,255,0.08)) */
  trackColor?: string;
  /** Animatable or explicit strokeDashoffset prop */
  strokeDashoffset?: number;
  /** Whether to animate on mount (default true) */
  animated?: boolean;
  /** Animation duration in ms (default 800) */
  animationDuration?: number;
  /** Main center text (e.g. "4/5" or "96%") */
  centerText?: string;
  /** Small subtext below main text (e.g. "responded" or "consensus") */
  centerSubtext?: string;
  /** Custom inner center content */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  subtextStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/**
 * ConsensusGauge - SVG consensus donut component with animatable strokeDashoffset prop.
 * Animates strokeDashoffset from full circumference down to target value over 800ms using withTiming.
 */
export const ConsensusGauge: React.FC<ConsensusGaugeProps> = ({
  value,
  progress,
  size = 84,
  strokeWidth = 7,
  strokeColor = '#3DE0A0',
  trackColor = 'rgba(255, 255, 255, 0.08)',
  strokeDashoffset: explicitDashOffset,
  animated = true,
  animationDuration = 800,
  centerText,
  centerSubtext,
  children,
  style,
  textStyle,
  subtextStyle,
  testID
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const targetPct =
    progress !== undefined
      ? Math.min(Math.max(progress, 0), 1)
      : value !== undefined
      ? Math.min(Math.max(value / 100, 0), 1)
      : 0;

  const animatedProgress = useSharedValue(animated ? 0 : targetPct);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = 0;
      animatedProgress.value = withTiming(targetPct, {
        duration: animationDuration,
        easing: Easing.out(Easing.cubic)
      });
    } else {
      animatedProgress.value = targetPct;
    }
  }, [targetPct, animated, animationDuration]);

  const animatedProps = useAnimatedProps(() => {
    const currentPct = animated ? animatedProgress.value : targetPct;
    const dashOffset =
      explicitDashOffset !== undefined
        ? explicitDashOffset
        : circumference * (1 - currentPct);
    return {
      strokeDashoffset: dashOffset
    };
  });

  return (
    <View
      style={[styles.container, { width: size, height: size }, style]}
      testID={testID}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Active Progress Donut */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center Label Overlay */}
      <View style={styles.centerOverlay} pointerEvents="none">
        {children ? (
          children
        ) : (
          <>
            {centerText && (
              <Text style={[styles.mainText, textStyle]}>{centerText}</Text>
            )}
            {centerSubtext && (
              <Text style={[styles.subText, subtextStyle]}>{centerSubtext}</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  mainText: {
    fontFamily: fontDisplay,
    fontSize: 18,
    color: '#F4F3F0',
    lineHeight: 22,
    textAlign: 'center'
  },
  subText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: '#8B8D98',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'lowercase'
  }
});
