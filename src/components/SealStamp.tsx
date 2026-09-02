import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Award, Check, Shield } from 'lucide-react-native';
import { colors, radius } from '../theme/colors';

interface SealStampProps {
  isDarkMode?: boolean;
  onAnimationComplete?: () => void;
  sealedDate?: string;
}

export function SealStamp({ isDarkMode = false, onAnimationComplete, sealedDate = 'CONSENSUS PACT' }: SealStampProps) {
  const theme = isDarkMode ? colors.dark : colors.light;
  const sealColor = (theme as any).seal ?? theme.danger; // Use explicit seal token

  const scaleAnim = useRef(new Animated.Value(2.0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(-20)).current;
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true
      }),
      Animated.timing(rotateAnim, {
        toValue: -6,
        duration: 350,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [-20, 0],
    outputRange: ['-20deg', '0deg']
  });

  return (
    <Animated.View
      style={[
        styles.sealContainer,
        {
          borderColor: sealColor,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { rotate: spin }]
        }
      ]}
    >
      <View style={[styles.innerRing, { borderColor: sealColor }]}>
        <View style={styles.contentCol}>
          <Shield size={18} color={sealColor} />
          <Text style={[styles.sealTitle, { color: sealColor }]}>SEALED</Text>
          <Text style={[styles.sealSubtitle, { color: sealColor }]}>{sealedDate.toUpperCase()}</Text>
          <View style={[styles.checkBadge, { backgroundColor: sealColor }]}>
            <Check size={10} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sealContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(193, 80, 63, 0.08)',
    alignSelf: 'center',
    marginVertical: 12
  },
  innerRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentCol: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  sealTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2
  },
  sealSubtitle: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1
  },
  checkBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3
  }
});