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
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { colors, radius, shadows } from '../src/theme/colors';
import {
  X,
  Sparkles,
  Check,
  Crown,
  ShieldCheck,
  ArrowRight,
  Infinity as InfinityIcon,
  Bot,
  Palette,
  CheckCircle2,
  Compass
} from 'lucide-react-native';

export default function PaywallScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    subscriptionPlan,
    setSubscriptionPlan
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [successMessage, setSuccessMessage] = useState('');

  const isCurrentPro = subscriptionPlan !== 'free';

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handleSubscribe = () => {
    triggerHaptic();
    const selectedPlan = billingCycle === 'annual' ? 'premium_annual' : 'premium_monthly';
    setSubscriptionPlan(selectedPlan);
    setSuccessMessage('🎉 Subscription activated! Welcome to PACT Pro.');
    setTimeout(() => {
      setSuccessMessage('');
      router.back();
    }, 1500);
  };

  const handleRestore = () => {
    triggerHaptic();
    setSuccessMessage('✅ Purchases restored successfully.');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleCancelSubscription = () => {
    triggerHaptic();
    setSubscriptionPlan('free');
    setSuccessMessage('Subscription reverted to Free tier.');
    setTimeout(() => setSuccessMessage(''), 1500);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top PACT Brand Header Frame Box */}
        <View
          style={[
            styles.brandHeaderBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          >
            <X size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandTextCol}>
            <View style={styles.brandTitleRow}>
              <View style={[styles.brandLogoCircle, { backgroundColor: theme.primary }]}>
                <Crown size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={[styles.brandTitleText, { color: theme.textPrimary }]}>
                PACT Pro
              </Text>
            </View>
            <Text style={[styles.brandSubtitleText, { color: theme.primary }]}>
              Plan A Consensus Trip
            </Text>
          </View>

          <TouchableOpacity onPress={handleRestore}>
            <Text style={[styles.restoreText, { color: theme.primary }]}>
              Restore
            </Text>
          </TouchableOpacity>
        </View>

        {/* Success Banner */}
        {Boolean(successMessage) && (
          <View style={[styles.toastBox, { backgroundColor: theme.primary }]}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{successMessage}</Text>
          </View>
        )}

        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.md
          ]}
        >
          <View style={[styles.crownBox, { backgroundColor: theme.primary }]}>
            <Crown size={28} color="#FFFFFF" />
          </View>
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
            Unlock Unlimited Trips & AI Pitch Engine
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Power up group trip planning with automatic conflict resolution and unlimited shared circles.
          </Text>
        </View>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresList}>
          <View
            style={[
              styles.featureItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.featureIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <InfinityIcon size={20} color={theme.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                Unlimited Trip Circles
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Organize as many trip groups as you want with unlimited friends and collaborators.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.featureItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.featureIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Bot size={20} color={theme.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                AI Compromise Pitch Engine
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Get AI-generated personalized explanations convincing hesitant travelers to say Yes.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.featureItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.sm
            ]}
          >
            <View style={[styles.featureIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <Palette size={20} color={theme.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                Custom Circle Themes
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Personalize your trip circles with custom colors and custom destination photos.
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Plan Selector */}
        <View style={styles.planSelectorRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic();
              setBillingCycle('annual');
            }}
            style={[
              styles.planCard,
              billingCycle === 'annual'
                ? { backgroundColor: theme.surface, borderColor: theme.primary, borderWidth: 2 }
                : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, borderWidth: 1 }
            ]}
          >
            <View style={[styles.saveBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.saveBadgeText}>SAVE 40%</Text>
            </View>
            <Text style={[styles.planPeriod, { color: theme.textPrimary }]}>Annual</Text>
            <Text style={[styles.planPrice, { color: theme.primary }]}>$29.99</Text>
            <Text style={[styles.planSub, { color: theme.textSecondary }]}>$2.50 / month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic();
              setBillingCycle('monthly');
            }}
            style={[
              styles.planCard,
              billingCycle === 'monthly'
                ? { backgroundColor: theme.surface, borderColor: theme.primary, borderWidth: 2 }
                : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, borderWidth: 1 }
            ]}
          >
            <Text style={[styles.planPeriod, { color: theme.textPrimary }]}>Monthly</Text>
            <Text style={[styles.planPrice, { color: theme.primary }]}>$4.99</Text>
            <Text style={[styles.planSub, { color: theme.textSecondary }]}>Billed monthly</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubscribe}
          style={[
            styles.ctaBtn,
            { backgroundColor: theme.primary },
            shadows.glowPrimary
          ]}
        >
          <Crown size={18} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>
            {isCurrentPro ? 'Switch Billing Cycle' : 'Upgrade to PACT Pro'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Revert / Cancel Button if already pro */}
        {isCurrentPro && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCancelSubscription}
            style={[styles.cancelBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
              Revert to Free Plan
            </Text>
          </TouchableOpacity>
        )}

        {/* Guarantee footer */}
        <View style={styles.guaranteeRow}>
          <ShieldCheck size={16} color={theme.success} />
          <Text style={[styles.guaranteeText, { color: theme.textSecondary }]}>
            Secured via Google Play. Cancel anytime in Store settings.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center'
  },
  brandHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: 14
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  brandTextCol: {
    alignItems: 'center',
    flex: 1
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandLogoCircle: {
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2
  },
  brandSubtitleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '700'
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  heroCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 16
  },
  crownBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6
  },
  heroSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  featuresList: {
    gap: 10,
    marginBottom: 16
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  featureTextCol: {
    flex: 1
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  featureDesc: {
    fontSize: 11,
    lineHeight: 15
  },
  planSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18
  },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: radius.card,
    alignItems: 'center',
    position: 'relative'
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  planPeriod: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 4
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2
  },
  planSub: {
    fontSize: 11
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.btn,
    marginBottom: 10
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.btn,
    borderWidth: 1,
    marginBottom: 12
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600'
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20
  },
  guaranteeText: {
    fontSize: 11
  }
});