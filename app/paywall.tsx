import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { useTheme } from '../src/hooks/useTheme';
import { useGatherlyStore, CurrencyCode, CURRENCIES } from '../src/store/useGatherlyStore';
import { useUserStore } from '../src/store/useUserStore';
import {
  GROUP_TIERS,
  GroupTierId,
  getTierForMemberCount,
  formatTierPrice,
  getOperatorEmailLink
} from '../src/lib/pricing/groupPricing';
import {
  X,
  Sparkles,
  Check,
  Star,
  Users,
  Building2,
  Mail,
  Copy,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react-native';

export default function PactPaywall() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { currency, setCurrency } = useGatherlyStore();
  const [billingPeriod, setBillingPeriod] = useState<'single' | 'annual'>('single');
  const [selectedTier, setSelectedTier] = useState<GroupTierId>('tier_10');
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleCopyEmail = async () => {
    triggerHaptic();
    try {
      if (Clipboard && Clipboard.setStringAsync) {
        await Clipboard.setStringAsync('concierge@pact.travel');
      }
    } catch {}
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenEmail = () => {
    triggerHaptic();
    const mailto = getOperatorEmailLink('Community Trip', 60);
    Linking.openURL(mailto).catch(() => {
      Alert.alert('Email Concierge', 'Please write to: concierge@pact.travel');
    });
  };

  const handleActivatePass = (tierId: GroupTierId) => {
    triggerHaptic();
    if (tierId === 'tier_community') {
      setIsOperatorModalOpen(true);
      return;
    }
    useGatherlyStore.getState().setSubscriptionPlan('premium_monthly');
    useUserStore.getState().setSubscriptionPlan('premium_monthly');
    Alert.alert(
      'Pass Activated!',
      `${GROUP_TIERS[tierId].name} unlocked! Only you pay — all your friends join 100% free.`,
      [{ text: 'Continue Planning', onPress: () => router.back() }]
    );
  };

  const tiersList: GroupTierId[] = ['free', 'tier_10', 'tier_19', 'tier_50', 'tier_community'];

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: theme.backgroundDeep }]}>
      <View style={[styles.phoneFrame, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Navigation */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={18} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={[styles.proPillBadge, { backgroundColor: isDarkMode ? 'rgba(240, 178, 74, 0.15)' : '#FFF3D6' }]}>
              <Sparkles size={12} color="#F0B24A" />
              <Text style={styles.proPillText}>GROUP PASSES & TIERS</Text>
            </View>
          </View>

          {/* Golden Hero Card */}
          <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Only 1 Person Pays.</Text>
            <Text style={[styles.heroHighlight, { color: '#F0B24A' }]}>Everyone Else Joins 100% Free.</Text>
            <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
              Invite 5, 10, 19, or 50+ friends. Only the trip organizer activates the group pass — all participants enter constraints and vote with zero paywalls.
            </Text>
          </View>

          {/* Currency Selector Bar */}
          <View style={styles.currencySection}>
            <Text style={[styles.currencyLabel, { color: theme.textSecondary }]}>SELECT YOUR CURRENCY</Text>
            <View style={[styles.currencyBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              {(['USD', 'EUR', 'INR', 'GBP'] as CurrencyCode[]).map((c) => {
                const isSelected = currency === c;
                const symbols = { USD: '$', EUR: '€', INR: '₹', GBP: '£' };
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => {
                      triggerHaptic();
                      setCurrency(c);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.currencyTab,
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                  >
                    <Text style={[styles.currencyTabSymbol, isSelected ? { color: '#0C1120' } : { color: theme.primary }]}>
                      {symbols[c]}
                    </Text>
                    <Text style={[styles.currencyTabCode, isSelected ? { color: '#0C1120', fontWeight: '800' } : { color: theme.textSecondary }]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Billing Switcher (Single Trip vs Annual Pass) */}
          <View style={[styles.billingSwitcher, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                setBillingPeriod('single');
              }}
              activeOpacity={0.8}
              style={[
                styles.billingTab,
                billingPeriod === 'single' && [styles.billingTabActive, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]
              ]}
            >
              <Text style={[styles.billingTabText, { color: theme.textSecondary }, billingPeriod === 'single' && { color: theme.textPrimary, fontWeight: '700' }]}>
                Single Trip Pass
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                setBillingPeriod('annual');
              }}
              activeOpacity={0.8}
              style={[
                styles.billingTab,
                billingPeriod === 'annual' && [styles.billingTabActive, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]
              ]}
            >
              <View style={styles.saveTag}>
                <Text style={styles.saveTagText}>SAVE 50%</Text>
              </View>
              <Text style={[styles.billingTabText, { color: theme.textSecondary }, billingPeriod === 'annual' && { color: theme.textPrimary, fontWeight: '700' }]}>
                Annual Unlimited
              </Text>
            </TouchableOpacity>
          </View>

          {/* Group Tiers List */}
          <View style={styles.tiersContainer}>
            {tiersList.map((tierId) => {
              const tier = GROUP_TIERS[tierId];
              const isSelected = selectedTier === tierId;
              const priceDisplay = formatTierPrice(tier, currency, billingPeriod);

              return (
                <TouchableOpacity
                  key={tierId}
                  activeOpacity={0.9}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedTier(tierId);
                  }}
                  style={[
                    styles.tierCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isSelected && { borderColor: '#F0B24A', borderWidth: 2 }
                  ]}
                >
                  {/* Top Badge & Capacity */}
                  <View style={styles.tierHeader}>
                    <View style={styles.tierNameCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {tierId === 'tier_community' ? (
                          <Building2 size={16} color="#25C9A0" />
                        ) : (
                          <Users size={16} color="#F0B24A" />
                        )}
                        <Text style={[styles.tierName, { color: theme.textPrimary }]}>{tier.name}</Text>
                      </View>
                      <Text style={[styles.capacityTag, { color: theme.textSecondary }]}>{tier.capacityLabel}</Text>
                    </View>

                    <View style={styles.tierPriceCol}>
                      <Text style={[styles.tierPrice, { color: tierId === 'free' ? '#25C9A0' : '#F0B24A' }]}>
                        {priceDisplay}
                      </Text>
                      <Text style={[styles.tierPriceSub, { color: theme.textSecondary }]}>
                        {tier.isCustomQuote ? 'Invoiced' : billingPeriod === 'single' ? 'per trip' : 'per year'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.recommendedText, { color: theme.textSecondary }]}>
                    • Ideal for: {tier.recommendedFor}
                  </Text>

                  {/* Features list */}
                  <View style={styles.tierFeatures}>
                    {tier.features.map((feat, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Check size={13} color="#25C9A0" strokeWidth={2.5} />
                        <Text style={[styles.featureText, { color: theme.textPrimary }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleActivatePass(tierId)}
                    style={[
                      styles.tierActionBtn,
                      tierId === 'tier_community'
                        ? { backgroundColor: '#1E2742', borderWidth: 1, borderColor: '#25C9A0' }
                        : tierId === 'free'
                        ? { backgroundColor: theme.surfaceSubtle, borderWidth: 1, borderColor: theme.border }
                        : { backgroundColor: '#F0B24A' }
                    ]}
                  >
                    {tierId === 'tier_community' ? (
                      <>
                        <Mail size={15} color="#25C9A0" />
                        <Text style={[styles.tierActionBtnText, { color: '#25C9A0' }]}>Contact Operator</Text>
                      </>
                    ) : tierId === 'free' ? (
                      <Text style={[styles.tierActionBtnText, { color: theme.textPrimary }]}>Current Free Tier (≤5)</Text>
                    ) : (
                      <>
                        <Sparkles size={15} color="#0C1120" />
                        <Text style={[styles.tierActionBtnText, { color: '#0C1120' }]}>
                          Activate {tier.name} Pass
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Privacy & Operator Guarantee */}
          <View style={[styles.guaranteeCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <ShieldCheck size={18} color="#25C9A0" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.guaranteeTitle, { color: theme.textPrimary }]}>No Per-Person Seat Fees</Text>
              <Text style={[styles.guaranteeDesc, { color: theme.textSecondary }]}>
                Unlike conventional planning software, PACT charges a single flat group pass. Invited guests never encounter paywalls, ads, or seat upcharges.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Community Operator Modal */}
        <Modal
          visible={isOperatorModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsOperatorModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.operatorModalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Building2 size={20} color="#25C9A0" />
                  <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>
                    Building & Community Concierge
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsOperatorModalOpen(false)} style={styles.modalCloseBtn}>
                  <X size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
                For residential apartment societies, company offsites, or 50+ member communities, our dedicated operator provides customized multi-coach logistics, building committee voting protocols, and bespoke invoicing.
              </Text>

              <View style={[styles.operatorEmailBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                <Mail size={16} color="#F0B24A" />
                <Text style={[styles.operatorEmailText, { color: theme.textPrimary }]}>
                  concierge@pact.travel
                </Text>
                <TouchableOpacity onPress={handleCopyEmail} activeOpacity={0.7} style={styles.copyBtn}>
                  <Text style={{ color: copiedEmail ? '#25C9A0' : '#F0B24A', fontSize: 12, fontWeight: '700' }}>
                    {copiedEmail ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleOpenEmail}
                  style={styles.primaryEmailBtn}
                >
                  <Mail size={16} color="#0C1120" />
                  <Text style={styles.primaryEmailBtnText}>Open Email to Operator</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsOperatorModalOpen(false);
                    Alert.alert('Inquiry Registered', 'Our concierge operator will contact you via email within 2 hours!');
                  }}
                  style={[styles.secondaryConfirmBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.secondaryConfirmBtnText, { color: theme.textPrimary }]}>
                    Request Callback in App
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    maxWidth: 480,
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
    paddingBottom: 40
  },
  headerRow: {
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
    alignItems: 'center'
  },
  proPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  proPillText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#F0B24A',
    letterSpacing: 0.8
  },
  heroCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16
  },
  heroTitle: {
    fontFamily: fontDisplay,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28
  },
  heroHighlight: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 18
  },
  currencySection: {
    marginBottom: 14
  },
  currencyLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  currencyBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4
  },
  currencyTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8
  },
  currencyTabSymbol: {
    fontSize: 14,
    fontWeight: '800'
  },
  currencyTabCode: {
    fontSize: 12,
    fontWeight: '600'
  },
  billingSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4
  },
  billingTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    position: 'relative'
  },
  billingTabActive: {
    borderWidth: 1
  },
  billingTabText: {
    fontSize: 13,
    fontWeight: '600'
  },
  saveTag: {
    backgroundColor: '#25C9A0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4
  },
  saveTagText: {
    color: '#0C1120',
    fontSize: 9,
    fontWeight: '800'
  },
  tiersContainer: {
    gap: 14,
    marginBottom: 20
  },
  tierCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  tierNameCol: {
    flex: 1
  },
  tierName: {
    fontFamily: fontDisplay,
    fontSize: 17,
    fontWeight: '700'
  },
  capacityTag: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  tierPriceCol: {
    alignItems: 'flex-end'
  },
  tierPrice: {
    fontFamily: fontDisplay,
    fontSize: 19,
    fontWeight: '800'
  },
  tierPriceSub: {
    fontSize: 10,
    fontWeight: '600'
  },
  recommendedText: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic'
  },
  tierFeatures: {
    gap: 6,
    marginBottom: 14
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  featureText: {
    fontSize: 12,
    lineHeight: 16
  },
  tierActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10
  },
  tierActionBtnText: {
    fontSize: 13,
    fontWeight: '800'
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  guaranteeDesc: {
    fontSize: 11,
    lineHeight: 15
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  operatorModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalHeaderTitle: {
    fontFamily: fontDisplay,
    fontSize: 16,
    fontWeight: '700'
  },
  modalCloseBtn: {
    padding: 4
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18
  },
  operatorEmailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1
  },
  operatorEmailText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    flex: 1
  },
  copyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(240, 178, 74, 0.15)'
  },
  modalActions: {
    gap: 10,
    marginTop: 6
  },
  primaryEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0B24A',
    paddingVertical: 12,
    borderRadius: 10
  },
  primaryEmailBtnText: {
    color: '#0C1120',
    fontSize: 14,
    fontWeight: '800'
  },
  secondaryConfirmBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1
  },
  secondaryConfirmBtnText: {
    fontSize: 13,
    fontWeight: '600'
  }
});
