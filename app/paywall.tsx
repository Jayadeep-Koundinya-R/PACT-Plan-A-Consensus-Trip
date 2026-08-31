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
  CheckCircle2
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
      <View style={[styles.topBorderLine, { backgroundColor: theme.primary }]} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <X size={18} color={theme.textPrimary} />
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
            { backgroundColor: isDarkMode ? '#151D2A' : '#FFFFFF', borderColor: theme.border },
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
                Exportable Social Story Cards
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Generate verified Instagram/WhatsApp story cards with official trip consensus stats.
              </Text>
            </View>
          </View>
        </View>

        {/* Billing Cycle Switcher */}
        <View style={styles.planSection}>
          <View style={styles.cycleToggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic();
                setBillingCycle('annual');
              }}
              style={[
                styles.cycleCard,
                billingCycle === 'annual'
                  ? { backgroundColor: theme.surface, borderColor: theme.primary, borderWidth: 2 }
                  : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, borderWidth: 1 }
              ]}
            >
              <View style={[styles.discountBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.discountBadgeText}>SAVE 33%</Text>
              </View>
              <Text style={[styles.cycleName, { color: theme.textPrimary }]}>Annual</Text>
              <Text style={[styles.cyclePrice, { color: theme.primary }]}>$29.99<Text style={styles.cyclePer}>/year</Text></Text>
              <Text style={[styles.cycleSub, { color: theme.textSecondary }]}>$2.50 / month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic();
                setBillingCycle('monthly');
              }}
              style={[
                styles.cycleCard,
                billingCycle === 'monthly'
                  ? { backgroundColor: theme.surface, borderColor: theme.primary, borderWidth: 2 }
                  : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, borderWidth: 1 }
              ]}
            >
              <Text style={[styles.cycleName, { color: theme.textPrimary }]}>Monthly</Text>
              <Text style={[styles.cyclePrice, { color: theme.primary }]}>$3.99<Text style={styles.cyclePer}>/month</Text></Text>
              <Text style={[styles.cycleSub, { color: theme.textSecondary }]}>Billed monthly</Text>
            </TouchableOpacity>
          </View>

          {/* Action CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubscribe}
            style={[styles.subscribeBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
          >
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.subscribeBtnText}>
              {isCurrentPro ? 'Switch Plan' : 'Start 7-Day Free Trial'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {isCurrentPro && (
            <TouchableOpacity
              onPress={handleCancelSubscription}
              style={styles.cancelBtn}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                Revert to Free Tier
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.guaranteeRow}>
            <ShieldCheck size={14} color={theme.success} />
            <Text style={[styles.guaranteeText, { color: theme.textSecondary }]}>
              Secured by RevenueCat • Cancel anytime in Google Play
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  topBorderLine: {
    height: 3,
    width: '100%'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    maxWidth: 600,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800'
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
    fontSize: 18,
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
    gap: 8,
    marginBottom: 18
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
    fontSize: 12,
    lineHeight: 16
  },
  planSection: {
    marginTop: 4
  },
  cycleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  cycleCard: {
    flex: 1,
    padding: 14,
    borderRadius: radius.card,
    alignItems: 'center',
    position: 'relative'
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  cycleName: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4
  },
  cyclePrice: {
    fontSize: 18,
    fontWeight: '900'
  },
  cyclePer: {
    fontSize: 11,
    fontWeight: '600'
  },
  cycleSub: {
    fontSize: 11,
    marginTop: 2
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 6
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
    marginTop: 12
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '500'
  }
});