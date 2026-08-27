import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
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
  Palette
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

  const handleSubscribe = () => {
    const selectedPlan = billingCycle === 'annual' ? 'premium_annual' : 'premium_monthly';
    setSubscriptionPlan(selectedPlan);
    setSuccessMessage('🎉 Subscription activated! Welcome to PACT Pro.');
    setTimeout(() => {
      setSuccessMessage('');
      router.back();
    }, 1500);
  };

  const handleRestore = () => {
    setSuccessMessage('✓ Purchases restored successfully.');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleCancelSubscription = () => {
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
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}
          >
            <X size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
            PACT Pro
          </Text>

          <TouchableOpacity onPress={handleRestore}>
            <Text style={[styles.restoreText, { color: theme.primary }]}>
              Restore
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Header */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.crownBox,
              { backgroundColor: theme.secondaryLight, borderColor: theme.secondary },
              shadows.glowSecondary
            ]}
          >
            <Crown size={38} color={theme.secondary} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
            Unlock Unlimited Trips & AI Insights
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Turn every group idea into an agreed reality with advanced conflict AI and unlimited circles.
          </Text>
        </View>

        {successMessage ? (
          <View style={[styles.successBanner, { backgroundColor: theme.successLight }]}>
            <Check size={16} color={theme.success} />
            <Text style={[styles.successText, { color: theme.success }]}>
              {successMessage}
            </Text>
          </View>
        ) : null}

        {/* Plan Selector (Annual vs Monthly) */}
        <View style={styles.planSelectorRow}>
          {/* Annual Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setBillingCycle('annual')}
            style={[
              styles.planCard,
              {
                backgroundColor: theme.surface,
                borderColor: billingCycle === 'annual' ? theme.primary : theme.border,
                borderWidth: billingCycle === 'annual' ? 2 : 1
              },
              billingCycle === 'annual' ? shadows.glowPrimary : shadows.sm
            ]}
          >
            <View style={[styles.discountBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
              <Text style={[styles.discountText, { color: theme.primary }]}>
                ⭐ BEST VALUE • SAVE 33%
              </Text>
            </View>
            <Text style={[styles.planCardName, { color: theme.textPrimary }]}>
              Annual Plan
            </Text>
            <Text style={[styles.planCardPrice, { color: theme.primary }]}>
              $39.99
            </Text>
            <Text style={[styles.planCardPeriod, { color: theme.textSecondary }]}>
              $3.33 / month, billed yearly
            </Text>
          </TouchableOpacity>

          {/* Monthly Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setBillingCycle('monthly')}
            style={[
              styles.planCard,
              {
                backgroundColor: theme.surface,
                borderColor: billingCycle === 'monthly' ? theme.primary : theme.border,
                borderWidth: billingCycle === 'monthly' ? 2 : 1
              },
              shadows.sm
            ]}
          >
            <View style={[styles.discountBadge, { backgroundColor: theme.surfaceSubtle }]}>
              <Text style={[styles.discountText, { color: theme.textSecondary }]}>
                FLEXIBLE
              </Text>
            </View>
            <Text style={[styles.planCardName, { color: theme.textPrimary }]}>
              Monthly Plan
            </Text>
            <Text style={[styles.planCardPrice, { color: theme.textPrimary }]}>
              $4.99
            </Text>
            <Text style={[styles.planCardPeriod, { color: theme.textSecondary }]}>
              Billed monthly, cancel anytime
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Comparison List */}
        <View
          style={[
            styles.featuresCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <Text style={[styles.featuresTitle, { color: theme.textPrimary }]}>
            Everything included in Pro:
          </Text>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: theme.primaryLight }]}>
              <InfinityIcon size={18} color={theme.primaryDark} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureName, { color: theme.textPrimary }]}>
                Unlimited Trip Circles & Decisions
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Free tier is limited to 1 circle. Pro members can organize unlimited reunions and getaways.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: theme.secondaryLight }]}>
              <Bot size={18} color={theme.secondary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureName, { color: theme.textPrimary }]}>
                AI-Powered Conflict Explanation Layer
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Deep LLM natural language analysis diagnosing date bottlenecks, budget gaps, and compromise advice.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: theme.successLight }]}>
              <Palette size={18} color={theme.success} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureName, { color: theme.textPrimary }]}>
                Premium Trip Brief Themes & Export
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Generate high-resolution social story cards formatted for Instagram, WhatsApp, and iMessage.
              </Text>
            </View>
          </View>
        </View>

        {/* Primary Purchase Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubscribe}
          style={[styles.subscribeBtn, { backgroundColor: theme.primary }, shadows.md]}
        >
          <Sparkles size={18} color="#FFFFFF" />
          <Text style={styles.subscribeBtnText}>
            {billingCycle === 'annual'
              ? 'Start PACT Pro Annual ($39.99/yr)'
              : 'Start PACT Pro Monthly ($4.99/mo)'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {isCurrentPro && (
          <TouchableOpacity
            onPress={handleCancelSubscription}
            style={styles.cancelPlanBtn}
          >
            <Text style={[styles.cancelPlanText, { color: theme.danger }]}>
              Switch back to Free Standard Plan
            </Text>
          </TouchableOpacity>
        )}

        {/* Security & Legal Footer */}
        <View style={styles.legalFooter}>
          <View style={styles.secureRow}>
            <ShieldCheck size={14} color={theme.textSecondary} />
            <Text style={[styles.secureText, { color: theme.textSecondary }]}>
              Secured by RevenueCat • Cancel anytime in App Store settings
            </Text>
          </View>
          <Text style={[styles.termsText, { color: theme.textMuted }]}>
            Payment will be charged to your account upon confirmation. Subscriptions auto-renew unless cancelled at least 24h before the end of current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center'
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600'
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 10
  },
  crownBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5
  },
  heroSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14
  },
  successText: {
    fontSize: 13,
    fontWeight: '700'
  },
  planSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14
  },
  planCard: {
    flex: 1,
    borderRadius: radius.card,
    padding: 14,
    position: 'relative'
  },
  discountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 6
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800'
  },
  planCardName: {
    fontSize: 14,
    fontWeight: '700'
  },
  planCardPrice: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 2
  },
  planCardPeriod: {
    fontSize: 11,
    lineHeight: 14
  },
  featuresCard: {
    borderRadius: radius.card,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  featureTextCol: {
    flex: 1
  },
  featureName: {
    fontSize: 13,
    fontWeight: '700'
  },
  featureDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15
  },
  subscribeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius.btn,
    marginBottom: 12
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  cancelPlanBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  cancelPlanText: {
    fontSize: 12,
    fontWeight: '600'
  },
  legalFooter: {
    marginTop: 10,
    alignItems: 'center',
    gap: 6
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  secureText: {
    fontSize: 11,
    fontWeight: '600'
  },
  termsText: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    maxWidth: 400
  }
});
