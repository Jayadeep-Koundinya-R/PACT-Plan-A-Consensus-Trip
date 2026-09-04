import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PARTICLE_COLORS = [
  '#3DE0A0', // Emerald
  '#FF5A5F', // Coral
  '#D4AF37', // Gold
  '#3DE0A0',
  '#FF5A5F'
];

interface ParticleConfig {
  id: number;
  size: number;
  color: string;
  startX: number;
  targetX: number;
  targetY: number;
  targetRotate: number;
  delayMs: number;
}

const PARTICLE_COUNT = 18;

// Deterministic particle layout around center
const PARTICLES: ParticleConfig[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + (Math.sin(i * 3) * 0.4);
  const distance = 90 + ((i * 17) % 80);
  return {
    id: i,
    size: 7 + (i % 5),
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    startX: ((i - PARTICLE_COUNT / 2) * 8),
    targetX: Math.cos(angle) * distance,
    targetY: Math.sin(angle) * distance - 30,
    targetRotate: ((i % 2 === 0 ? 1 : -1) * (180 + i * 40)),
    delayMs: (i * 20) % 120
  };
});

const SingleParticle: React.FC<{
  config: ParticleConfig;
  progress: Animated.SharedValue<number>;
}> = ({ config, progress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    const translateX = interpolate(p, [0, 1], [config.startX, config.targetX]);
    const translateY = interpolate(
      p,
      [0, 0.35, 1],
      [0, config.targetY * 0.7 - 20, config.targetY + 40]
    );
    const rotation = interpolate(p, [0, 1], [0, config.targetRotate]);
    const opacity = interpolate(p, [0, 0.15, 0.7, 1], [0, 1, 0.9, 0]);
    const scale = interpolate(p, [0, 0.2, 0.8, 1], [0.3, 1.1, 0.9, 0.4]);

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotation}deg` },
        { scale }
      ]
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          borderRadius: 2
        },
        animatedStyle
      ]}
    />
  );
};

export interface ParticleBurstProps {
  active?: boolean;
  durationMs?: number;
}

/**
 * ParticleBurst - Lightweight Reanimated 3 particle burst
 * 18 Emerald/Coral/Gold square tiles with randomized trajectory, rotation, and fade.
 * Runs 100% on the UI thread with zero JS re-renders.
 */
export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  active = true,
  durationMs = 1200
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: durationMs,
        easing: Easing.bezier(0.16, 1, 0.3, 1)
      });
    }
  }, [active, durationMs]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {PARTICLES.map((p) => (
        <SingleParticle key={p.id} config={p} progress={progress} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  particle: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3
  }
});
