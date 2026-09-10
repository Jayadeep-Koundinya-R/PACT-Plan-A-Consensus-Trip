import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';

interface Visual3DConsensusOrbProps {
  size?: number;
  primaryColor?: string;
  sealColor?: string;
  glowIntensity?: number;
}

export const Visual3DConsensusOrb: React.FC<Visual3DConsensusOrbProps> = ({
  size = 110,
  primaryColor = '#FF5A5F',
  sealColor = '#3DE0A0',
  glowIntensity = 1,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous subtle 3D gyroscopic rotation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();

    // Subtle breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.orbContainer, { width: size, height: size }]}>
      {/* 3D Deep Ambient Glow Sphere */}
      <View
        style={[
          styles.glowBackdrop,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: (size * 0.9) / 2,
            backgroundColor: primaryColor,
            opacity: 0.25 * glowIntensity,
            filter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
          },
        ]}
      />

      {/* Outer 3D Gyro Ring 1 (Tilted 60 deg X) */}
      <Animated.View
        style={[
          styles.ring3d,
          {
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: (size * 0.95) / 2,
            borderColor: primaryColor,
            transform: [
              { perspective: 800 },
              { rotateX: '65deg' },
              { rotateZ: spin },
            ],
          },
        ]}
      />

      {/* Inner 3D Counter-Gyro Ring 2 (Tilted 65 deg Y) */}
      <Animated.View
        style={[
          styles.ring3dInner,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: (size * 0.8) / 2,
            borderColor: sealColor,
            transform: [
              { perspective: 800 },
              { rotateY: '60deg' },
              { rotateZ: spin },
            ],
          },
        ]}
      />

      {/* Central 3D Core Sphere with Gradient */}
      <Animated.View
        style={[
          styles.coreSphere,
          {
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: (size * 0.5) / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 60 60">
          <Defs>
            <RadialGradient id="coreGrad" cx="35%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="40%" stopColor={sealColor} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.95" />
            </RadialGradient>
          </Defs>
          <Circle cx="30" cy="30" r="28" fill="url(#coreGrad)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  orbContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowBackdrop: {
    position: 'absolute',
    zIndex: 0,
  },
  ring3d: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    opacity: 0.75,
    zIndex: 1,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  ring3dInner: {
    position: 'absolute',
    borderWidth: 1.8,
    borderStyle: 'dashed',
    opacity: 0.85,
    zIndex: 2,
    shadowColor: '#3DE0A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
  },
  coreSphere: {
    position: 'absolute',
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
});
