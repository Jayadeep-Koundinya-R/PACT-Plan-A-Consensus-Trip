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
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../src/store/useUserStore';
import { supabase } from '../src/lib/supabase/client';
import { colors, radius } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react-native';
import { OnboardingCarousel } from '../src/components/OnboardingCarousel';

export default function PactLandingScreen() {
  const router = useRouter();

  // Animation values for the 2.6s consensus loop
  const animProgress = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // 1. Auth Gate Verification
    const checkAuth = async () => {
      try {
        const { isAuthenticated, profile } = useUserStore.getState();
        if (isAuthenticated && profile?.userId) {
          router.replace('/(tabs)/home');
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          useUserStore.getState().setAuthenticated(true);
          router.replace('/(tabs)/home');
          return;
        }
      } catch (e) {
        // Fall through to display landing hero
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // 2. 2.6s converging nodes + stamp cycle
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

  const handleGetStarted = () => {
    triggerHaptic();
    setShowOnboarding(true);
  };

  const handleInstantDemo = () => {
    triggerHaptic();
    useUserStore.getState().setAuthenticated(true);
    router.replace('/(tabs)/home');
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

  if (isCheckingAuth) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: '#0C1120' }]}>
        <View style={styles.loadingLogoBadge}>
          <Text style={styles.loadingBrandText}>PACT</Text>
        </View>
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <OnboardingCarousel
          onComplete={() => {
            setShowOnboarding(false);
            router.push('/auth' as any);
          }}
          onSkip={() => {
            setShowOnboarding(false);
            router.push('/auth' as any);
          }}
        />
      </SafeAreaView>
    );
  }

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
                  <Circle cx="12" cy="12" r="10" fill="#6B6455" stroke="#6B6455" strokeWidth="1" />
                  <Path d="M8 10v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#A9A08C" strokeWidth="1.2" />
                  <Rect x="7" y="9.5" width="10" height="7" rx="1.5" fill="#A9A08C" />
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
                  <Circle cx="12" cy="12" r="10" fill="#6B6455" stroke="#6B6455" strokeWidth="1" />
                  <Path d="M8 10v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#A9A08C" strokeWidth="1.2" />
                  <Rect x="7" y="9.5" width="10" height="7" rx="1.5" fill="#A9A08C" />
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
                  <Circle cx="12" cy="12" r="10" fill="#6B6455" stroke="#6B6455" strokeWidth="1" />
                  <Path d="M8 10v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#A9A08C" strokeWidth="1.2" />
                  <Rect x="7" y="9.5" width="10" height="7" rx="1.5" fill="#A9A08C" />
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
                    fill="#16301E"
                    fillOpacity="0.8"
                    stroke="#58A68C"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                  />
                  <Path
                    d="M57 60l9 9 17-19"
                    fill="none"
                    stroke="#58A68C"
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
                    fill="#58A68C"
                    letterSpacing="0.5"
                  >
                    100% match
                  </SvgText>
                </Svg>
              </Animated.View>
            </View>

            <Text style={styles.heroHeading}>
              5 friends. 47 messages. Zero plan.
            </Text>
            <Text style={styles.heroSubheading}>
              Set budget and dates privately. Sealed votes. Zero peer pressure.
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
                  stroke="#6B6455"
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
                d: 'Budget, dates, and vibe - only you see what you enter.'
              },
              {
                n: '2',
                t: 'Vote without the group watching',
                d: 'Everyone reacts to AI-picked options anonymously, no pressure.'
              },
              {
                n: '3',
                t: 'Lock the plan the moment you match',
                d: 'Consensus engine finalizes itinerary the second agreement lands.'
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
          {/* Primary High-Converting CTA */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleGetStarted}
            style={styles.primaryCtaBtn}
          >
            <Text style={styles.primaryCtaBtnText}>Get Started / Log In</Text>
            <ArrowRight size={18} color="#0C1120" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Secondary Demo Mode CTA */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleInstantDemo}
            style={styles.demoCtaBtn}
          >
            <Sparkles size={15} color="#F3EEE2" />
            <Text style={styles.demoCtaBtnText}>Explore Demo Mode (5 Members)</Text>
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
    backgroundColor: '#0C1120',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingLogoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#0E1424',
    borderWidth: 1,
    borderColor: '#262E48',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingBrandText: {
    fontFamily: fontDisplay,
    fontSize: 22,
    fontWeight: '800',
    color: '#C99A5B',
    letterSpacing: 1
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#12182B',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(243, 238, 226, 0.07)',
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
    color: '#C99A5B'
  },
  howItWorksPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262E48',
    backgroundColor: '#1A2138'
  },
  howItWorksText: {
    fontSize: 12,
    color: '#A9A08C',
    fontWeight: '600'
  },
  heroCard: {
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: '#262E48',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16
  },
  canvasWrapper: {
    width: 200,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12
  },
  nodeLayer: {
    position: 'absolute'
  },
  stampLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroHeading: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 26,
    lineHeight: 32,
    color: '#F3EEE2',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8
  },
  heroSubheading: {
    fontSize: 13,
    color: '#A9A08C',
    textAlign: 'center',
    lineHeight: 18
  },
  scrollDownWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10
  },
  stepsSection: {
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: '#262E48',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  stepsSectionTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 15,
    color: '#F3EEE2',
    marginBottom: 14
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#262E48'
  },
  stepNumber: {
    fontFamily: fontDisplay,
    fontSize: 15,
    fontWeight: '700',
    color: '#C99A5B',
    width: 18,
    marginTop: 1
  },
  stepTextCol: {
    flex: 1
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F3EEE2',
    marginBottom: 3
  },
  stepDesc: {
    fontSize: 12,
    color: '#A9A08C',
    lineHeight: 16
  },
  bottomCtaBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#12182B',
    borderTopWidth: 1,
    borderTopColor: '#262E48',
    gap: 8
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#C99A5B',
    paddingVertical: 14,
    borderRadius: 14
  },
  primaryCtaBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0C1120',
    letterSpacing: -0.2
  },
  demoCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: '#262E48',
    paddingVertical: 12,
    borderRadius: 14
  },
  demoCtaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F3EEE2'
  },
  termsFooterText: {
    fontSize: 10,
    color: '#6B6455',
    textAlign: 'center',
    marginTop: 4
  }
});
