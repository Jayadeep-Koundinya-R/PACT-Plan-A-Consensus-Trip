import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated , Platform } from 'react-native';
import { Shield } from 'lucide-react-native';
import { fontDisplay, fontUIBold } from '../theme/typography';

interface WaxSealStampProps {
  label?: string;
  sublabel?: string;
  variant?: 'crimson' | 'emerald';
}

export const WaxSealStamp: React.FC<WaxSealStampProps> = ({
  label = 'SEALED',
  sublabel = 'APPROVED',
  variant = 'crimson'
}) => {
  const scaleAnim = useRef(new Animated.Value(2.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(-24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 70,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 5,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.spring(rotateAnim, {
        toValue: -10,
        tension: 130,
        friction: 6,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [-24, 0],
    outputRange: ['-24deg', '0deg']
  });

  const isEmerald = variant === 'emerald';
  const outerBg = isEmerald ? '#3A241E' : '#8A2E1C';
  const outerBorder = isEmerald ? '#0FA47F' : '#E14733';
  const shadowCol = isEmerald ? '#0FA47F' : '#D6432B';

  return (
    <Animated.View
      style={[
        styles.sealWrapper,
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
            backgroundColor: outerBg,
            borderColor: outerBorder,
            shadowColor: shadowCol
          }
        ]}
      >
        <View style={styles.dashedRing}>
          <View style={styles.centerSeal}>
            <Shield size={11} color="#FFB224" strokeWidth={2.5} />
            <Text style={styles.sealMainText}>{label}</Text>
            <Text style={styles.sealSubText}>{sublabel}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sealWrapper: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 30,
    pointerEvents: 'none'
  },
  outerWaxRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8
  },
  dashedRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#FFB224',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)'
  },
  centerSeal: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  sealMainText: {
    fontFamily: fontDisplay,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFB224',
    letterSpacing: 1.1,
    marginTop: 1
  },
  sealSubText: {
    fontFamily: fontUIBold,
    fontSize: 7,
    color: '#FDE68A',
    letterSpacing: 0.8,
    fontWeight: '700'
  }
});
