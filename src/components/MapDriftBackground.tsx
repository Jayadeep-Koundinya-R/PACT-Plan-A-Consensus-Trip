import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ~8 topographic contour paths spread across a 400×800 viewBox
// These represent concentric elevation lines at different screen positions
const TOPO_PATHS = [
  'M -20 120 Q 60 80 140 130 Q 220 175 310 120 Q 390 68 460 115',
  'M -20 200 Q 80 155 170 210 Q 255 262 350 195 Q 420 140 470 190',
  'M -20 300 Q 50 260 150 315 Q 240 365 330 290 Q 410 225 470 275',
  'M -20 400 Q 70 355 160 410 Q 250 462 340 385 Q 415 320 470 380',
  'M -20 490 Q 90 450 180 500 Q 265 548 360 472 Q 430 415 470 470',
  'M -20 580 Q 55 535 155 595 Q 245 648 345 565 Q 420 510 470 560',
  'M 30 680 Q 110 640 200 690 Q 285 738 375 655 Q 438 605 470 650',
  'M 10 760 Q 100 720 195 775 Q 280 825 370 742 Q 435 695 470 740'
];

interface MapDriftBackgroundProps {
  isDarkMode: boolean;
}

export function MapDriftBackground({ isDarkMode }: MapDriftBackgroundProps) {
  const theme = isDarkMode ? colors.dark : colors.light;
  const driftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim, {
          toValue: 1,
          duration: 35000,   // 35s forward
          useNativeDriver: true
        }),
        Animated.timing(driftAnim, {
          toValue: 0,
          duration: 35000,   // 35s back — total ~70s loop
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateX = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12]   // Max 12px horizontal drift
  });

  const translateY = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6]    // Max 6px vertical drift
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { transform: [{ translateX }, { translateY }] }
      ]}
      pointerEvents="none"
    >
      <Svg
        width={SCREEN_W + 20}
        height={SCREEN_H + 20}
        viewBox="0 0 400 800"
        style={StyleSheet.absoluteFillObject}
      >
        {TOPO_PATHS.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke={theme.primary}
            strokeWidth={1}
            fill="none"
            opacity={0.07}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
