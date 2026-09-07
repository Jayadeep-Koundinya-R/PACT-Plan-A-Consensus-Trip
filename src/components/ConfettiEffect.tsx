import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#3DE0A0', // PACT Emerald
  '#FF5A5F', // Coral
  '#F59E0B', // Warm Amber
  '#38BDF8', // Sky Blue
  '#A855F7', // Violet
  '#EC4899', // Rose Pink
  '#FFD700', // Gold
  '#FFFFFF'  // White Sparkle
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

export const ConfettiEffect: React.FC<{ durationMs?: number; count?: number }> = ({
  durationMs = 4500,
  count = 65
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const width = SCREEN_WIDTH && SCREEN_WIDTH > 0 ? SCREEN_WIDTH : 420;
    const initialParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: -25 - Math.random() * 120,
      size: 6 + Math.random() * 9,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speedY: 2.2 + Math.random() * 4.8,
      speedX: (Math.random() - 0.5) * 3.6,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      opacity: 1
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
          x: p.x + p.speedX + Math.sin((p.y + p.id * 10) / 25) * 1.1,
          rotation: p.rotation + p.rotSpeed,
          opacity: Math.max(0, 1 - (elapsed / durationMs) * 0.95)
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
  }, [durationMs, count]);

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
              height: p.size * 1.5,
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
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2
  }
});
