import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { X, Sparkles, Check, Star, Smartphone, ExternalLink, ShieldCheck } from 'lucide-react-native';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { useUserStore } from '../src/store/useUserStore';

export default function PactPaywall() {
  const router = useRouter();
  const [plan, setPlan] = useState<'annual' | 'single'>('annual');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const features = [
    {
      title: 'AI Compromise Whisperer',
      desc: 'Automatically resolves budget & date deadlocks.'
    },
    {
      title: 'Unlimited trip circles',
      desc: 'Organize multiple group trips simultaneously.'
    },
    {
      title: 'Integrated group expense sync',
      desc: 'Convert trip brief into split payment tracking.'
    },
    {
      title: 'Custom dealbreaker tags',
      desc: 'Add hyper-specific veto rules for your circle.'
    }
  ];

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const isWeb = Platform.OS === 'web';

  const handleWebDemoUnlock = () => {
    triggerHaptic();
    useGatherlyStore.getState().setSubscriptionPlan('premium_monthly');
    useUserStore.getState().setSubscriptionPlan('premium_monthly');
    Alert.alert('PACT Pro Demo Mode', 'Pro features unlocked for web evaluation!');
    router.back();
  };

  const handleSubscribe = () => {
    triggerHaptic();
    if (isWeb) {
      handleWebDemoUnlock();
      return;
    }
    setIsPurchasing(true);
    setTimeout(() => {
      setIsPurchasing(false);
      Alert.alert('PACT Pro Activated', 'Your 7-day free trial has started! All circles are unlocked.');
      router.back();
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeBtn}>
              <X size={20} color="#C3BAA6" />
            </TouchableOpacity>
            <View style={styles.proPillBadge}>
              <Text style={styles.proPillText}>PACT PRO</Text>
            </View>
          </View>

          {/* Pro Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Text style={styles.heroTitle}>Unlock PACT Pro</Text>
              <Text style={styles.heroSub}>
                Only <Text style={{ color: '#FFD98A', fontWeight: '700' }}>one</Text> person needs Pro. Your entire trip circle gets all Pro benefits for free.
              </Text>
            </View>

            {/* Perforation */}
            <View style={styles.perforationWrapper}>
              <View style={styles.notchLeft} />
              <View style={styles.notchRight} />
              <View style={styles.dashedLine} />
            </View>

            <View style={styles.heroBottom}>
              <Text style={styles.heroPassLabel}>
                ONE PASS  •  WHOLE CIRCLE COVERED
              </Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            {features.map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={styles.starIconBox}>
                  <Svg width="14" height="14" viewBox="0 0 14 14">
                    <Path
                      d="M7 1.3l1.6 3.9 4.1.4-3.1 2.8.9 4.1L7 10.4l-3.5 2.1.9-4.1-3.1-2.8 4.1-.4z"
                      fill="none"
                      stroke="#FFD98A"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Plan Options Selector */}
          <View style={styles.plansContainer}>
            {/* Annual Plan Card */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                triggerHaptic();
                setPlan('annual');
              }}
              style={[
                styles.planCard,
                plan === 'annual' ? styles.planCardActive : styles.planCardInactive
              ]}
            >
              <View style={styles.popularTag}>
                <Text style={styles.popularTagText}>MOST POPULAR — SAVE 50%</Text>
              </View>

              <View style={styles.planCardContent}>
                <View style={styles.planLeft}>
                  <View
                    style={[
                      styles.radioOuter,
                      plan === 'annual' && { borderColor: '#F0B24A', borderWidth: 5 }
                    ]}
                  />
                  <Text style={styles.planNameText}>Annual organizer pass</Text>
                </View>

                <View style={styles.planRight}>
                  <Text style={styles.planPriceText}>$29.99</Text>
                  <Text style={styles.planMonthlyRate}>$2.50/mo</Text>
                </View>
              </View>
              <Text style={styles.trialNote}>Includes 7-day free trial</Text>
            </TouchableOpacity>

            {/* Single Trip Pass Card */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                triggerHaptic();
                setPlan('single');
              }}
              style={[
                styles.planCard,
                plan === 'single' ? styles.planCardActive : styles.planCardInactive
              ]}
            >
              <View style={styles.planCardContent}>
                <View style={styles.planLeft}>
                  <View
                    style={[
                      styles.radioOuter,
                      plan === 'single' && { borderColor: '#F0B24A', borderWidth: 5 }
                    ]}
                  />
                  <Text style={styles.planNameText}>Single trip pass</Text>
                </View>
                <Text style={styles.planPriceText}>$3.99</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Testimonial Card */}
          <View style={styles.testimonialCard}>
            <View style={styles.starsRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={13} fill="#FFD98A" color="#FFD98A" style={{ marginRight: 2 }} />
              ))}
            </View>
            <Text style={styles.testimonialQuote}>
              "PACT saved our 6-person group from giving up on our annual beach trip."
            </Text>
            <Text style={styles.testimonialAuthor}>— Sarah T.</Text>
          </View>
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={styles.bottomBar}>
          {isWeb ? (
            <View style={styles.webNoticeContainer}>
              <View style={styles.webNoticeHeader}>
                <Smartphone size={16} color="#25C9A0" />
                <Text style={styles.webNoticeTitle}>Pro purchases available in the iOS/Android app</Text>
              </View>
              <Text style={styles.webNoticeDesc}>
                Native StoreKit & Google Play billing operate in mobile app builds. For web evaluation, preview all Pro features below.
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleWebDemoUnlock}
                style={styles.webDemoUnlockBtn}
              >
                <Sparkles size={15} color="#0A2A1F" />
                <Text style={styles.webDemoUnlockBtnText}>Preview PACT Pro in Web Demo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSubscribe}
                disabled={isPurchasing}
                style={styles.proUnlockBtn}
              >
                <Text style={styles.proUnlockBtnText}>
                  {isPurchasing ? 'Unlocking PACT Pro...' : 'Start 7-day free trial & unlock circle'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.billingFooterText}>
                Recurring billing. Cancel anytime in App Store settings.
              </Text>
            </>
          )}
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
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#12182B',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(253, 249, 239, 0.11)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  closeBtn: {
    padding: 4
  },
  proPillBadge: {
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  proPillText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFD98A',
    letterSpacing: 0.5
  },
  heroCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20
  },
  heroTop: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center'
  },
  heroTitle: {
    fontFamily: fontDisplay,
    fontSize: 25,
    fontWeight: '700',
    color: '#FDF9EF',
    marginBottom: 10
  },
  heroSub: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#D8D0BC',
    lineHeight: 19,
    textAlign: 'center'
  },
  perforationWrapper: {
    position: 'relative',
    height: 1,
    justifyContent: 'center'
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#12182B'
  },
  notchRight: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#12182B'
  },
  dashedLine: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(212,175,55,0.3)',
    marginHorizontal: 22
  },
  heroBottom: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  heroPassLabel: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#B58722',
    letterSpacing: 0.8
  },
  featuresList: {
    gap: 14,
    marginBottom: 22
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12
  },
  starIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureTextCol: {
    flex: 1
  },
  featureTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FDF9EF'
  },
  featureDesc: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#9C947F',
    lineHeight: 18,
    marginTop: 3
  },
  plansContainer: {
    gap: 10,
    marginBottom: 18
  },
  planCard: {
    backgroundColor: '#1E2742',
    borderRadius: 16,
    padding: 16,
    position: 'relative'
  },
  planCardActive: {
    borderWidth: 1.5,
    borderColor: '#F0B24A'
  },
  planCardInactive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  popularTag: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#F0B24A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  popularTagText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#231A0C',
    letterSpacing: 0.3
  },
  planCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  planNameText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#FDF9EF'
  },
  planRight: {
    alignItems: 'flex-end'
  },
  planPriceText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FDF9EF'
  },
  planMonthlyRate: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#9C947F'
  },
  trialNote: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#25C9A0',
    marginTop: 10,
    marginLeft: 28
  },
  testimonialCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  testimonialQuote: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#D8D0BC',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 8
  },
  testimonialAuthor: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#9C947F'
  },
  webNoticeContainer: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(37, 201, 160, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 4
  },
  webNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  webNoticeTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#25C9A0',
    fontWeight: '700'
  },
  webNoticeDesc: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#C3BAA6',
    lineHeight: 16,
    marginBottom: 12
  },
  webDemoUnlockBtn: {
    backgroundColor: '#F0B24A',
    borderRadius: 10,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  webDemoUnlockBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#0A2A1F',
    fontWeight: '700'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#12182B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(253, 249, 239, 0.11)'
  },
  proUnlockBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0B24A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  proUnlockBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#231A0C'
  },
  billingFooterText: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#7A7263',
    textAlign: 'center',
    lineHeight: 15
  }
});