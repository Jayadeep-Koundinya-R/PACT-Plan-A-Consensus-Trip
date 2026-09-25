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
import { radius } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { useTheme } from '../src/hooks/useTheme';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { useUserStore } from '../src/store/useUserStore';
import {
  GROUP_TIERS,
  GroupTierId,
  formatTierPrice
} from '../src/lib/pricing/groupPricing';
import {
  X,
  Sparkles,
  Check,
  Users,
  ShieldCheck,
  Lock
} from 'lucide-react-native';

export default function PactPaywall() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const subscriptionPlan = useGatherlyStore((s) => s.subscriptionPlan);
  const isPro = subscriptionPlan && subscriptionPlan !== 'free';
  const [isPurchasing, setIsPurchasing] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // noop
      }
    }
  };

  const handleActivatePass = async () => {
    triggerHaptic();

    if (Platform.OS !== 'web') {
      setIsPurchasing(true);
      try {
        const Purchases = require('react-native-purchases').default;
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages?.length > 0) {
          const pkg = offerings.current.availablePackages[0];
          const { customerInfo } = await Purchases.purchasePackage(pkg);
          const hasProEntitlement = Boolean(
            customerInfo?.entitlements?.active?.['pro_access'] ||
            customerInfo?.entitlements?.active?.['pact_pro']
          );
          if (hasProEntitlement) {
            useGatherlyStore.getState().setSubscriptionPlan('premium_monthly');
            useUserStore.getState().setSubscriptionPlan('premium_monthly');
            Alert.alert(
              'Organizer Pass Active!',
              'Purchase confirmed via RevenueCat. You can now organize circles of up to 24 members.',
              [{ text: 'Continue Planning', onPress: () => router.back() }]
            );
            setIsPurchasing(false);
            return;
          } else {
            setIsPurchasing(false);
            Alert.alert(
              'Purchase Failed',
              'Payment was processed, but the pro entitlement (pro_access or pact_pro) is not active. Please restore purchases or try again.'
            );
            return;
          }
        } else {
          setIsPurchasing(false);
          Alert.alert(
            'Purchase Failed',
            'Unable to load store packages from RevenueCat. Please check your network connection and try again.'
          );
          return;
        }
      } catch (e: any) {
        setIsPurchasing(false);
        if (!e?.userCancelled) {
          Alert.alert(
            'Purchase Failed',
            e?.message || 'Purchase failed, please try again or restore purchases.'
          );
        }
        return;
      }
    }

    // Web demo preview only — only reachable when Platform.OS === 'web'
    if (Platform.OS === 'web') {
      useGatherlyStore.getState().setSubscriptionPlan('premium_monthly');
      useUserStore.getState().setSubscriptionPlan('premium_monthly');
      Alert.alert(
        'Preview PACT Pro in Web Demo',
        'Unlocked Organizer Pass for this web demo session. Real in-app purchases run on native iOS and Android via RevenueCat.',
        [{ text: 'Continue Planning', onPress: () => router.back() }]
      );
      return;
    }
  };

  const handleRestorePurchases = async () => {
    triggerHaptic();
    if (Platform.OS !== 'web') {
      try {
        const Purchases = require('react-native-purchases').default;
        const customerInfo = await Purchases.restorePurchases();
        if (customerInfo?.entitlements?.active?.['pro_access']) {
          useGatherlyStore.getState().setSubscriptionPlan('premium_monthly');
          useUserStore.getState().setSubscriptionPlan('premium_monthly');
          Alert.alert('Purchases Restored', 'Your PACT Organizer Pass has been restored.');
          return;
        } else {
          Alert.alert('No Purchases Found', 'No active RevenueCat entitlements were found for this account.');
          return;
        }
      } catch (e: any) {
        Alert.alert('Restore Failed', e?.message || 'Unable to restore purchases');
        return;
      }
    } else {
      Alert.alert('Web Preview', 'Purchases are active on iOS & Android native devices.');
    }
  };

  const organizerPass = GROUP_TIERS.organizer_pass;

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: '#050608' }]}>
      <View style={[styles.phoneFrame, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={{ width: 36 }} />
            <View style={styles.proPill}>
              <Sparkles size={13} color="#D4AF37" />
              <Text style={styles.proPillText}>ORGANIZER PASS</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}
              accessibilityLabel="Close Paywall"
            >
              <X size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Hero Pitch */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Plan Together, Never Pay Per Seat.
            </Text>
            <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
              One flat pass per trip circle. Free for up to 8 members; one organizer pass covers up to 24 members.
            </Text>
          </View>

          {/* Comparison Cards: Free vs Organizer Pass */}
          <View style={styles.cardsContainer}>
            {/* Free Tier Card */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Free Circle</Text>
                  <Text style={[styles.cardCapacity, { color: theme.textSecondary }]}>Up to 8 members</Text>
                </View>
                <Text style={[styles.cardPrice, { color: '#3DE0A0' }]}>Free</Text>
              </View>
              <View style={styles.featuresList}>
                {GROUP_TIERS.free.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={14} color="#3DE0A0" />
                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>{feat}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Flat Organizer Pass Card */}
            <View style={[styles.card, styles.highlightCard, { backgroundColor: theme.surface, borderColor: '#FF5A5F' }]}>
              <View style={styles.badgeRow}>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>SINGLE FLAT PASS</Text>
                </View>
              </View>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{organizerPass.name}</Text>
                  <Text style={[styles.cardCapacity, { color: theme.textSecondary }]}>Up to 24 members • USD only</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.cardPrice, { color: '#FF5A5F' }]}>$9.99</Text>
                  <Text style={[styles.cardPriceSub, { color: theme.textSecondary }]}>one-time / trip</Text>
                </View>
              </View>
              <View style={styles.featuresList}>
                {organizerPass.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={14} color="#3DE0A0" />
                    <Text style={[styles.featureText, { color: theme.textPrimary }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              {isPro ? (
                <View style={styles.activePassBanner}>
                  <Check size={16} color="#3DE0A0" />
                  <Text style={styles.activePassText}>
                    Active Organizer Pass (Up to 24 Members)
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleActivatePass}
                  disabled={isPurchasing}
                  activeOpacity={0.85}
                  style={[styles.actionBtn, { backgroundColor: '#FF5A5F' }]}
                >
                  <Text style={styles.actionBtnText}>
                    {isPurchasing
                      ? 'Connecting to Store...'
                      : Platform.OS === 'web'
                      ? 'Preview PACT Pro in Web Demo'
                      : 'Unlock Organizer Pass • $9.99'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          {/* Enterprise Custom Plan Note */}
          <View style={[styles.card, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, marginTop: 12 }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Enterprise Custom Plan</Text>
                <Text style={[styles.cardCapacity, { color: theme.textSecondary }]}>25+ members • Tailored for Large Groups</Text>
              </View>
              <Text style={[styles.cardPrice, { color: '#F59E0B' }]}>Custom</Text>
            </View>
            <Text style={[styles.featureText, { color: theme.textSecondary, marginTop: 8 }]}>
              Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.
            </Text>
          </View>
        </View>
        {/* Privacy & Guarantee Note */}
          <View style={[styles.guaranteeBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <ShieldCheck size={18} color="#3DE0A0" />
            <Text style={[styles.guaranteeText, { color: theme.textSecondary }]}>
              Free: 1–8 members | Organizer Pass: 9–24 members | Custom: 25+ members. Sealed consensus and anti-herd voting remain completely private across all tiers.
            </Text>
          </View>

          {/* Restore and Legal Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={handleRestorePurchases} activeOpacity={0.7}>
              <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Restore Purchases</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: theme.textSecondary }]}>•</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Privacy Policy', 'PACT does not sell user data. Private votes and budgets are never shared with peers or advertisers.')}
              activeOpacity={0.7}
            >
              <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: theme.textSecondary }]}>•</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Terms of Service', 'PACT Organizer Pass covers 1 trip circle of 9 to 24 members. Circles larger than 24 members require an Enterprise Custom Plan.')}
              activeOpacity={0.7}
            >
              <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Terms</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 440,
    flex: 1,
    overflow: 'hidden'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  proPillText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroSection: {
    marginBottom: 24,
    alignItems: 'center'
  },
  heroTitle: {
    fontFamily: fontDisplay,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8
  },
  heroSub: {
    fontFamily: fontUI,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18
  },
  highlightCard: {
    borderWidth: 2,
    position: 'relative'
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  popularBadge: {
    backgroundColor: 'rgba(255, 90, 95, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF5A5F'
  },
  popularBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5A5F',
    letterSpacing: 0.5
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  cardTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2
  },
  cardCapacity: {
    fontFamily: fontUI,
    fontSize: 12
  },
  cardPrice: {
    fontFamily: fontDisplay,
    fontSize: 24,
    fontWeight: '800'
  },
  cardPriceSub: {
    fontFamily: fontUI,
    fontSize: 10,
    marginTop: -2
  },
  featuresList: {
    gap: 10,
    marginBottom: 16
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  featureText: {
    fontFamily: fontUI,
    fontSize: 13,
    lineHeight: 18
  },
  activePassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: '#3DE0A0',
  },
  activePassText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#3DE0A0',
  },
  actionBtn: {
    paddingVertical: 13,
    borderRadius: radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  actionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#050608'
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24
  },
  guaranteeText: {
    fontFamily: fontUI,
    fontSize: 12,
    flex: 1,
    lineHeight: 17
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  footerLink: {
    fontFamily: fontUI,
    fontSize: 12
  },
  footerDot: {
    fontSize: 12
  }
});
