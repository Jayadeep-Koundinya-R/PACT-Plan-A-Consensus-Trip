import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

const LUXURY_GOLD_COLORS = [
  '#F0B24A', // Vibrant Gold
  '#C99A5B', // Warm Brass
  '#FFDF88', // Pale Champagne
  '#FDF9EF', // Warm White Sparkle
  '#D4952B', // Deep Amber Gold
  '#C1503F', // Sealing Wax Red
  '#E6BE75', // Golden Sand
  '#B8860B'  // Rich Bronze
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  isCircle: boolean;
}

export const ConfettiEffect: React.FC<{ durationMs?: number; count?: number; triggerKey?: any }> = ({
  durationMs = 4500,
  count = 65,
  triggerKey
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setIsActive(true);
    const width = windowWidth && windowWidth > 0 ? windowWidth : 480;
    const initialParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: -20 - Math.random() * 120,
      size: 6 + Math.random() * 8,
      color: LUXURY_GOLD_COLORS[Math.floor(Math.random() * LUXURY_GOLD_COLORS.length)],
      speedY: 2.2 + Math.random() * 4.5,
      speedX: (Math.random() - 0.5) * 3.4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      isCircle: Math.random() > 0.65
    }));

    setParticles(initialParticles);

    let animationFrameId: number;
    const startTime = Date.now();

    const updatePhysics = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > durationMs) {
        setIsActive(false);
        return;
      }

      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y + p.speedY,
          x: p.x + p.speedX + Math.sin((p.y + p.id * 8) / 28) * 1.2,
          rotation: p.rotation + p.rotSpeed,
          opacity: Math.max(0, 1 - (elapsed / durationMs) * 0.92)
        }))
      );

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    const timer = setTimeout(() => {
      setIsActive(false);
    }, durationMs);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [durationMs, count, triggerKey, windowWidth]);

  if (!isActive) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.isCircle ? p.size : p.size * 1.6,
              borderRadius: p.isCircle ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [{ rotate: `${p.rotation}deg` }]
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    overflow: 'hidden'
  },
  particle: {
    position: 'absolute',
    shadowColor: '#F0B24A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2
  }
});
