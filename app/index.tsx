import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect, G, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';

export default function PactLandingScreen() {
  const router = useRouter();

  // Animation values for the 2.6s consensus loop
  const animProgress = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 2.6s converging nodes + stamp cycle
    const loop = Animated.loop(
      Animated.timing(animProgress, {
        toValue: 1,
        duration: 2600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true
      })
    );
    loop.start();

    // Subtle breathing chevron animation
    const chevronLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(chevronAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    chevronLoop.start();

    return () => {
      loop.stop();
      chevronLoop.stop();
    };
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleContinue = (method: 'apple' | 'google' | 'email') => {
    triggerHaptic();
    router.push('/create-circle' as any);
  };

  const scrollToSteps = () => {
    triggerHaptic();
    scrollViewRef.current?.scrollTo({ y: 340, animated: true });
  };

  // Node 1: (-58, -34) -> (0, 0)
  const node1TranslateX = animProgress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [-58, 0, 0]
  });
  const node1TranslateY = animProgress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [-34, 0, 0]
  });
  const node1Scale = animProgress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.4, 0.3]
  });
  const node1Opacity = animProgress.interpolate({
    inputRange: [0, 0.7, 0.9, 1],
    outputRange: [1, 0.6, 0, 0]
  });

  // Node 2: (58, -30) -> (0, 0)
  const node2TranslateX = animProgress.interpolate({
    inputRange: [0, 0.1, 0.75, 1],
    outputRange: [58, 58, 0, 0]
  });
  const node2TranslateY = animProgress.interpolate({
    inputRange: [0, 0.1, 0.75, 1],
    outputRange: [-30, -30, 0, 0]
  });
  const node2Scale = animProgress.interpolate({
    inputRange: [0, 0.1, 0.75, 1],
    outputRange: [1, 1, 0.4, 0.3]
  });
  const node2Opacity = animProgress.interpolate({
    inputRange: [0, 0.1, 0.75, 0.9, 1],
    outputRange: [1, 1, 0.6, 0, 0]
  });

  // Node 3: (0, 50) -> (0, 0)
  const node3TranslateY = animProgress.interpolate({
    inputRange: [0, 0.15, 0.8, 1],
    outputRange: [50, 50, 0, 0]
  });
  const node3Scale = animProgress.interpolate({
    inputRange: [0, 0.15, 0.8, 1],
    outputRange: [1, 1, 0.4, 0.3]
  });
  const node3Opacity = animProgress.interpolate({
    inputRange: [0, 0.15, 0.8, 0.95, 1],
    outputRange: [1, 1, 0.6, 0, 0]
  });

  // Stamp: pops in at 0.55 -> 0.72 -> 0.85 -> 1.0
  const stampScale = animProgress.interpolate({
    inputRange: [0, 0.55, 0.72, 0.85, 1],
    outputRange: [0.6, 0.6, 1.08, 1, 1]
  });
  const stampOpacity = animProgress.interpolate({
    inputRange: [0, 0.55, 0.72, 1],
    outputRange: [0, 0, 1, 1]
  });

  const chevronTranslateY = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5]
  });
  const chevronOpacity = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1]
  });

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.brandTitle}>PACT</Text>
            <TouchableOpacity
              onPress={scrollToSteps}
              activeOpacity={0.7}
              style={styles.howItWorksPill}
            >
              <Text style={styles.howItWorksText}>How it works</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Card with Animated Consensus Canvas */}
          <View style={styles.heroCard}>
            <View style={styles.canvasWrapper}>
              {/* Converging Node 1 */}
              <Animated.View
                style={[
                  styles.nodeLayer,
                  {
                    opacity: node1Opacity,
                    transform: [
                      { translateX: node1TranslateX },
                      { translateY: node1TranslateY },
                      { scale: node1Scale }
                    ]
                  }
                ]}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" fill="#2A2D3A" stroke="#454857" strokeWidth="1" />
                  <Path d="M8 10v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#8B8D98" strokeWidth="1.2" />
                  <Rect x="7" y="9.5" width="10" height="7" rx="1.5" fill="#8B8D98" />
                </Svg>
              </Animated.View>

              {/* Converging Node 2 */}
              <Animated.View
                style={[
                  styles.nodeLayer,
                  {
                    opacity: node2Opacity,
                    transform: [
                      { translateX: node2TranslateX },
                      { translateY: node2TranslateY },
                      { scale: node2Scale }
                    ]
                  }
                ]}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" fill="#2A2D3A" stroke="#454857" strokeWidth="1" />
                  <Path d="M8 10v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#8B8D98" strokeWidth="1.2" />
                  <Rect x="7" y="9.5" width="10" height="7" rx="1.5" fill="#8B8D98" />
                </Svg>
              </Animated.View>

              {/* Converging Node 3 */}
              <Animated.View
                style={[
                  styles.nodeLayer,
                  {
                    opacity: node3Opacity,
                    transform: [
                      { translateY: node3TranslateY },
                      { scale: node3Scale }
                    ]
                  }
                ]}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" fill="#2A2D3A" stroke="#454857" strokeWidth="1" />
                  <Path d="M8 10v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#8B8D98" strokeWidth="1.2" />
                  <Rect x="7" y="9.5" width="10" height="7" rx="1.5" fill="#8B8D98" />
                </Svg>
              </Animated.View>

              {/* Animated 100% Match Stamp */}
              <Animated.View
                style={[
                  styles.stampLayer,
                  {
                    opacity: stampOpacity,
                    transform: [
                      { scale: stampScale },
                      { rotate: '-8deg' }
                    ]
                  }
                ]}
              >
                <Svg width="140" height="140" viewBox="0 0 140 140">
                  <Circle
                    cx="70"
                    cy="60"
                    r="32"
                    fill="#0D2A20"
                    fillOpacity="0.8"
                    stroke="#22C58B"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                  />
                  <Path
                    d="M57 60l9 9 17-19"
                    fill="none"
                    stroke="#3DE0A0"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <SvgText
                    x="70"
                    y="108"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#3DE0A0"
                    letterSpacing="0.5"
                  >
                    100% match
                  </SvgText>
                </Svg>
              </Animated.View>
            </View>

            <Text style={styles.heroHeading}>
              Group travel, minus the deadlock.
            </Text>
            <Text style={styles.heroSubheading}>
              Set private constraints. Vote anonymously. Lock in the plan.
            </Text>
          </View>

          {/* Scroll Down Chevron */}
          <TouchableOpacity onPress={scrollToSteps} activeOpacity={0.7} style={styles.scrollDownWrapper}>
            <Animated.View
              style={{
                transform: [{ translateY: chevronTranslateY }],
                opacity: chevronOpacity
              }}
            >
              <Svg width="18" height="10" viewBox="0 0 18 10">
                <Path
                  d="M1 1l8 7 8-7"
                  fill="none"
                  stroke="#454857"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Animated.View>
          </TouchableOpacity>

          {/* How PACT Works 3-Step Breakdown */}
          <View style={styles.stepsSection}>
            <Text style={styles.stepsSectionTitle}>How PACT works</Text>

            {[
              {
                n: '1',
                t: 'Set your constraints, privately',
                d: 'Budget, dates, and vibe — only you see what you enter.'
              },
              {
                n: '2',
                t: 'Vote without the group watching',
                d: 'Everyone reacts to AI-picked options anonymously, no pressure.'
              },
              {
                n: '3',
                t: 'Lock the plan the moment you match',
                d: 'AI books the stay and splits the cost the second consensus lands.'
              }
            ].map((step, idx) => (
              <View
                key={step.n}
                style={[
                  styles.stepRow,
                  idx === 0 && { borderTopWidth: 0 }
                ]}
              >
                <Text style={styles.stepNumber}>{step.n}</Text>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>{step.t}</Text>
                  <Text style={styles.stepDesc}>{step.d}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom CTA Actions */}
        <View style={styles.bottomCtaBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleContinue('apple')}
            style={styles.appleBtn}
          >
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleContinue('google')}
            style={styles.googleBtn}
          >
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleContinue('email')}
            style={styles.emailBtn}
          >
            <Text style={styles.emailBtnText}>Continue with email</Text>
          </TouchableOpacity>

          <Text style={styles.termsFooterText}>
            By continuing you agree to PACT's Terms and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22
  },
  brandTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: 0.3,
    color: '#FF5A5F'
  },
  howItWorksPill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  howItWorksText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#6C6F7A'
  },
  heroCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24
  },
  canvasWrapper: {
    width: 180,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  nodeLayer: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stampLayer: {
    position: 'absolute',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroHeading: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 30,
    color: '#F4F3F0',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8
  },
  heroSubheading: {
    fontFamily: fontUI,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#8B8D98',
    textAlign: 'center',
    maxWidth: 270
  },
  scrollDownWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    paddingVertical: 4
  },
  stepsSection: {
    paddingBottom: 20
  },
  stepsSectionTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '600',
    color: '#6C6F7A',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  stepNumber: {
    fontFamily: fontDisplay,
    fontSize: 19,
    color: '#FF5A5F',
    minWidth: 20
  },
  stepTextCol: {
    flex: 1
  },
  stepTitle: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F3F0',
    marginBottom: 3
  },
  stepDesc: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#6C6F7A',
    lineHeight: 18
  },
  bottomCtaBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  appleBtn: {
    width: '100%',
    paddingVertical: 13,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#F4F3F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  appleBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#090A0F'
  },
  googleBtn: {
    width: '100%',
    paddingVertical: 13,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#13151E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  emailBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emailBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  termsFooterText: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#454857',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 15
  }
});