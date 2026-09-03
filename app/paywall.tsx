import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { deriveSubscriptionPlan } from '../src/lib/purchases/customerInfo';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { BottomTabBar } from '../src/components/BottomTabBar';
import { colors, radius, shadows, spacing } from '../src/theme/colors';
import {
  Crown,
  Check,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Infinity as InfinityIcon,
  Bot,
  Palette,
  CheckCircle2,
  Lock,
  AlertCircle
} from 'lucide-react-native';

// Lazily load react-native-purchases only on native platforms
// (the package has no web implementation and will crash Metro on web)
function getPurchases() {
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-purchases').default;
  } catch {
    return null;
  }
}

function getPurchasesErrorCode() {
  if (Platform.OS === 'web') return null;
  try {
    return require('react-native-purchases').PURCHASES_ERROR_CODE;
  } catch {
    return null;
  }
}

export default function PaywallScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    subscriptionPlan,
    setSubscriptionPlan,
    setPurchaseError,
    purchaseError,
    isCheckingEntitlement
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const checkEntitlement = async () => {
      try {
        const RC = getPurchases();
        if (!RC) return;
        const info = await RC.getCustomerInfo();
        setSubscriptionPlan(deriveSubscriptionPlan(info));
      } catch (e) {
        // Non-fatal: keep showing current cached plan
      }
    };
    checkEntitlement();
  }, []);

  const isCurrentPro = subscriptionPlan !== 'free';

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
  };

  const handleSubscribe = async () => {
    triggerHaptic();
    setPurchaseError(null);
    if (Platform.OS === 'web') {
      // Demo mode for web: simulate activation
      setSubscriptionPlan('premium_annual');
      setSuccessMessage('🎉 Subscription activated! Welcome to PACT Pro.');
      setTimeout(() => { setSuccessMessage(''); router.back(); }, 1500);
      return;
    }
    setIsLoading(true);
    try {
      const RC = getPurchases();
      if (!RC) throw new Error('Purchases not available.');
      const offerings = await RC.getOfferings();
      const currentOffering = offerings.current;
      if (!currentOffering) throw new Error('No offerings available. Please try again later.');
      const pkg = billingCycle === 'annual' ? currentOffering.annual : currentOffering.monthly;
      if (!pkg) throw new Error('Selected billing plan not available.');
      const { customerInfo } = await RC.purchasePackage(pkg);
      setSubscriptionPlan(deriveSubscriptionPlan(customerInfo));
      setSuccessMessage('🎉 Subscription activated! Welcome to PACT Pro.');
      setTimeout(() => { setSuccessMessage(''); router.back(); }, 1500);
    } catch (e: any) {
      const ERRORS = getPurchasesErrorCode();
      if (ERRORS && e?.code === ERRORS.PURCHASE_CANCELLED_ERROR) {
        // User cancelled — no error message
      } else {
        setPurchaseError(e?.message ?? 'Purchase failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    triggerHaptic();
    setPurchaseError(null);
    if (Platform.OS === 'web') {
      setSuccessMessage('✓ Restore not available on web.');
      setTimeout(() => setSuccessMessage(''), 2000);
      return;
    }
    setIsLoading(true);
    try {
      const RC = getPurchases();
      if (!RC) throw new Error('Purchases not available.');
      const info = await RC.restorePurchases();
      setSubscriptionPlan(deriveSubscriptionPlan(info));
      setSuccessMessage('✓ Purchases restored successfully.');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (e: any) {
      setPurchaseError(e?.message ?? 'Restore failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Note: subscription cancellation is managed through App Store / Google Play settings

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top PACT Brand Header */}
        <ScreenHeader
          title="PACT Pro"
          subtitle={isCurrentPro ? 'PRO ACTIVE' : 'UNLIMITED CONSENSUS'}
          onBack={() => router.back()}
          isDarkMode={isDarkMode}
          rightSlot={
            <TouchableOpacity onPress={handleRestore} disabled={isLoading} style={{ paddingHorizontal: 4 }}>
              <Text style={[styles.restoreText, { color: theme.primary }]}>
                Restore
              </Text>
            </TouchableOpacity>
          }
        />

        {/* Success Banner */}
        {Boolean(successMessage) && (
          <View style={[styles.toastBox, { backgroundColor: theme.primary }]}>
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{successMessage}</Text>
          </View>
        )}

        {/* Error Banner */}
        {Boolean(purchaseError) && (
          <View style={[styles.toastBox, { backgroundColor: isDarkMode ? '#2D1515' : '#FEE2E2', borderColor: '#F87171', borderWidth: 1 }]}>
            <AlertCircle size={16} color={theme.danger} />
            <Text style={[styles.toastText, { color: theme.danger }]}>{purchaseError}</Text>
          </View>
        )}

        {/* Hero Document Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.surface, borderColor: theme.border }
          ]}
        >
          <View style={[styles.crownBox, { backgroundColor: theme.primaryLight }]}>
            <Crown size={24} color={theme.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
            Unlimited Circles & AI Compromise Engine
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Power up your group trips with automatic bottleneck negotiation and unlimited shared travel pacts.
          </Text>

          {isCurrentPro && (
            <View style={[styles.proActiveBadge, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
              <CheckCircle2 size={13} color={theme.success} />
              <Text style={[styles.proActiveBadgeText, { color: theme.success }]}>
                PRO ENTITLEMENT ACTIVE ({subscriptionPlan.toUpperCase()})
              </Text>
            </View>
          )}
        </View>

        {/* Feature Highlights Grid (Document Motif) */}
        <View style={styles.featuresList}>
          <View
            style={[
              styles.featureItem,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={[styles.featureIconBox, { backgroundColor: theme.surfaceSubtle }]}>
              <InfinityIcon size={18} color={theme.primary} />
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
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={[styles.featureIconBox, { backgroundColor: theme.surfaceSubtle }]}>
              <Bot size={18} color={theme.secondary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                AI Compromise Whisperer
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Auto-negotiate shoulder season dates and budget ceilings for 100% group fit.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.featureItem,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
          >
            <View style={[styles.featureIconBox, { backgroundColor: theme.surfaceSubtle }]}>
              <Palette size={18} color={theme.primary} />
            </View>
            <View style={styles.featureTextCol}>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                Custom Circle Themes & Brief Export
              </Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Export sealed travel documents with .ics calendar syncing and shareable social story cards.
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
          disabled={isLoading}
          style={[
            styles.ctaBtn,
            { backgroundColor: theme.primary },
            isLoading && { opacity: 0.6 }
          ]}
        >
          <Crown size={18} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>
            {isCurrentPro ? 'Switch Billing Plan' : 'Upgrade to PACT Pro'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Guarantee footer */}
        <View style={styles.guaranteeRow}>
          <ShieldCheck size={15} color={theme.success} />
          <Text style={[styles.guaranteeText, { color: theme.textSecondary }]}>
            Secured via Google Play & App Store. Cancel anytime in Store settings.
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  restoreText: {
    fontSize: 12.5,
    fontWeight: '800'
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.sm,
    marginBottom: 12
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800'
  },
  heroCard: {
    alignItems: 'center',
    padding: 18,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14
  },
  crownBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 6,
    lineHeight: 23
  },
  heroSub: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 17
  },
  proActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.btn,
    borderWidth: 1,
    marginTop: 10
  },
  proActiveBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  featuresList: {
    gap: 8,
    marginBottom: 14
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  featureTextCol: {
    flex: 1
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 1
  },
  featureDesc: {
    fontSize: 11.5,
    lineHeight: 15
  },
  planSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  planCard: {
    flex: 1,
    padding: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
    position: 'relative'
  },
  saveBadge: {
    position: 'absolute',
    top: -9,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.btn
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 2
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 1
  },
  planSub: {
    fontSize: 11
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginBottom: 8
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
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
    fontWeight: '700'
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