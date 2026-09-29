import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Shield } from 'lucide-react-native';
import { fontDisplay, fontUIBold } from '../theme/typography';
import * as Haptics from 'expo-haptics';

interface WaxSealStampProps {
  label?: string;
  sublabel?: string;
  variant?: 'crimson' | 'emerald';
  size?: 'normal' | 'large';
  onImpact?: () => void;
}

export const WaxSealStamp: React.FC<WaxSealStampProps> = ({
  label = 'SEALED',
  sublabel = 'APPROVED',
  variant = 'crimson',
  size = 'normal',
  onImpact
}) => {
  const scaleAnim = useRef(new Animated.Value(2.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(-28)).current;
  const shockwaveScale = useRef(new Animated.Value(0.8)).current;
  const shockwaveOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isCancelled = false;

    // 1. Heavy slam descent
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(rotateAnim, {
        toValue: -8,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start(({ finished }) => {
      if (!finished || isCancelled) return;

      // Tactile heavy impact trigger
      try {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      } catch (_e) {}

      if (onImpact && !isCancelled) onImpact();

      // 2. Shockwave burst + Spring recoil settle
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          friction: 4,
          tension: 160,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.spring(rotateAnim, {
          toValue: -12,
          friction: 5,
          tension: 140,
          useNativeDriver: Platform.OS !== 'web'
        }),
        // Shockwave expansion
        Animated.sequence([
          Animated.timing(shockwaveOpacity, {
            toValue: 0.8,
            duration: 40,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(shockwaveScale, {
            toValue: 1.9,
            duration: 320,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(shockwaveOpacity, {
            toValue: 0,
            duration: 160,
            useNativeDriver: Platform.OS !== 'web'
          })
        ])
      ]).start();
    });

    return () => {
      isCancelled = true;
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
      rotateAnim.stopAnimation();
      shockwaveScale.stopAnimation();
      shockwaveOpacity.stopAnimation();
    };
  }, []);


  const spin = rotateAnim.interpolate({
    inputRange: [-28, 0],
    outputRange: ['-28deg', '0deg']
  });

  const isEmerald = variant === 'emerald';
  const outerBg = isEmerald ? '#1E3A2F' : '#6B1123';
  const outerBorder = isEmerald ? '#3DE0A0' : '#EF4444';
  const shadowCol = isEmerald ? '#3DE0A0' : '#DC2626';
  const accentColor = isEmerald ? '#3DE0A0' : '#F59E0B';

  const isLarge = size === 'large';
  const ringSize = isLarge ? 92 : 68;
  const ringRadius = ringSize / 2;
  const innerSize = isLarge ? 80 : 58;

  return (
    <View style={styles.sealWrapper} pointerEvents="none">
      {/* Expanding shockwave ring on heavy impact */}
      <Animated.View
        style={[
          styles.shockwaveRing,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringRadius,
            borderColor: outerBorder,
            opacity: shockwaveOpacity,
            transform: [{ scale: shockwaveScale }]
          }
        ]}
      />

      <Animated.View
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.stampBody,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { rotate: spin }]
          }
        ]}
      >

        <View
          style={[
            styles.outerWaxRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringRadius,
              backgroundColor: outerBg,
              borderColor: outerBorder,
              shadowColor: shadowCol
            }
          ]}
        >
          <View
            style={[
              styles.dashedRing,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                borderColor: accentColor
              }
            ]}
          >
            <View style={styles.centerSeal}>
              <Shield size={isLarge ? 16 : 12} color={accentColor} strokeWidth={2.5} />
              <Text style={[styles.sealMainText, { color: accentColor, fontSize: isLarge ? 12 : 9.5 }]}>
                {label}
              </Text>
              <Text style={[styles.sealSubText, { fontSize: isLarge ? 8.5 : 7.2 }]}>
                {sublabel}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sealWrapper: {
    position: 'absolute',
    top: 6,
    right: 10,
    zIndex: 40,
    pointerEvents: 'none',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shockwaveRing: {
    position: 'absolute',
    borderWidth: 2
  },
  stampBody: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  outerWaxRing: {
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 10
  },
  dashedRing: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)'
  },
  centerSeal: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  sealMainText: {
    fontFamily: fontDisplay,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 2
  },
  sealSubText: {
    fontFamily: fontUIBold,
    color: '#FDE68A',
    letterSpacing: 0.9,
    fontWeight: '700',
    marginTop: 1
  }
});
