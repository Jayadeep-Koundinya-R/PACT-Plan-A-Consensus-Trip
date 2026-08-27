import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#0EA5E9', // Sky
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#38BDF8', // Light blue
  '#F43F5E'  // Rose
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
}

export const ConfettiEffect: React.FC<{ durationMs?: number }> = ({ durationMs = 3500 }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Generate 45 randomized confetti particles
    const initialParticles: Particle[] = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * (SCREEN_WIDTH || 400),
      y: -20 - Math.random() * 80,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speedY: 2.5 + Math.random() * 4.5,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1
    }));

    setParticles(initialParticles);

    let animationFrameId: number;
    let startTime = Date.now();

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
          x: p.x + p.speedX + Math.sin(p.y / 20) * 0.8,
          rotation: p.rotation + p.rotSpeed,
          opacity: Math.max(0, 1 - elapsed / durationMs)
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
  }, [durationMs]);

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
              height: p.size * 1.4,
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
    zIndex: 999,
    overflow: 'hidden'
  },
  particle: {
    position: 'absolute',
    borderRadius: 2
  }
});
