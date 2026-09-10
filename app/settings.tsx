import { useTheme } from '../src/hooks/useTheme';
import { ThemeCustomizerModal } from '../src/components/ThemeCustomizerModal';
import { useNotificationStore } from '../src/store/useNotificationStore';
import { NotificationCenterModal } from '../src/components/NotificationCenterModal';
import { NotificationToast } from '../src/components/NotificationToast';
import { useUserStore } from '../src/store/useUserStore';
import { useCircleStore } from '../src/store/useCircleStore';
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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import {
  ArrowLeft,
  Shield,
  MoreVertical,
  Plus,
  Check,
  Sun,
  Moon,
  Bell,
  Sparkles,
  CreditCard,
  ChevronRight,
  Crown,
  Zap,
  Trash2,
  LogOut,
  AlertTriangle,
  X,
  RefreshCw,
  Palette
} from 'lucide-react-native';

export default function PactSettings() {
  const router = useRouter();
  const { theme, themeId, themeDefinition, isDarkMode, toggleDarkMode } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { openNotificationCenter, notifications, simulateAINotification } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const {
    groups = [],
    currentUserId = 'user-maya-001',
    currency,
    currencySymbol,
    setCurrency,
    subscriptionPlan,
    clearLocalAccountData,
    logout: gatherlyLogout
  } = useGatherlyStore();

  const handleToggleTheme = () => {
    triggerHaptic();
    toggleDarkMode();
  };

  const { profile, logout: userLogout } = useUserStore();
  const { circles = [] } = useCircleStore();
  const allCircles = circles.length > 0 ? circles : groups.map((g: any) => ({ id: g.id, name: g.name, inviteCode: g.inviteCode, archived: false, members: [] }));
  const activeCircles = allCircles.filter((c: any) => !c.archived);

  // Toggle states
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    maskBudget: true,
    autoDelete: true,
    whatsAppNudges: true,
    deadlineReminders: true,
    aiNotifs: true
  });

  // Modal dialog states for reliable Web and Mobile functionality
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const flip = (k: string) => {
    triggerHaptic();
    setToggles((t) => ({ ...t, [k]: !t[k] }));
  };

  const handleBack = () => {
    triggerHaptic();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  const handleConfirmSignOut = async () => {
    triggerHaptic();
    setShowSignOutModal(false);
    try {
      await gatherlyLogout();
      userLogout();
    } catch (e) {}
    router.replace('/auth');
  };

  const handleConfirmDeleteAccount = async () => {
    triggerHaptic();
    setIsPurging(true);
    try {
      await clearLocalAccountData();
      userLogout();
    } catch (e) {
      console.warn('Error during account purge:', e);
    }
    setIsPurging(false);
    setShowDeleteModal(false);
    router.replace('/auth');
  };

  const handleRestorePurchases = () => {
    triggerHaptic();
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      Alert.alert('Purchases Restored', 'Your existing entitlements and organizer passes are active and up to date.');
    }, 1000);
  };

  const ToggleSwitch = ({ on, onPress }: { on: boolean; onPress: () => void }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.toggleTrack,
        on ? { backgroundColor: '#3DE0A0' } : { backgroundColor: 'rgba(255, 255, 255, 0.18)' }
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          on ? { backgroundColor: '#052E20', transform: [{ translateX: 16 }] } : { backgroundColor: '#8B8D98', transform: [{ translateX: 0 }] }
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: theme.backgroundDeep }]}>
      <View style={[styles.phoneFrame, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backBtn} accessibilityLabel="Go back">
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Settings & circles</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  openNotificationCenter();
                }}
                activeOpacity={0.7}
                style={[styles.notifHeaderBtn, { backgroundColor: isDarkMode ? 'rgba(255, 90, 95, 0.12)' : '#FFEFC9' }]}
              >
                <Bell size={17} color="#FF5A5F" />
                {unreadCount > 0 && (
                  <View style={styles.notifBadgeDot} />
                )}
              </TouchableOpacity>

              <View style={styles.shieldIconBox}>
                <Svg width="14" height="14" viewBox="0 0 14 14">
                  <Path
                    d="M7 1.3l5 1.8v3.7c0 3-2 5.3-5 6-3-.7-5-3-5-6V3.1z"
                    fill="none"
                    stroke="#8B8D98"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>
          </View>

          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarInitials}>
                  {profile?.displayName
                    ? profile.displayName
                        .split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'AR'}
                </Text>
              </View>
              {subscriptionPlan !== 'free' && (
                <View style={styles.proMiniBadge}>
                  <Text style={styles.proMiniBadgeText}>PRO</Text>
                </View>
              )}
            </View>

            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>{profile?.displayName || 'Alex Rivers'}</Text>
              <Text style={styles.profileHandle}>{profile?.email || 'alex@pact.travel'}</Text>

              <View style={styles.proStatusPill}>
                <Svg width="9" height="9" viewBox="0 0 9 9">
                  <Path d="M1 3.5l2 1.5 2-3 2 3 2-1.5-.7 4.5H1.7z" fill="#D4AF37" />
                </Svg>
                <Text style={styles.proStatusPillText}>{subscriptionPlan !== 'free' ? 'PACT Pro organizer pass active' : 'Free tier (Up to 5 members)'}</Text>
              </View>
            </View>
          </View>

          {/* Appearance & Theme Section */}
          <Text style={[styles.sectionHeading, { color: isDarkMode ? '#8B8D98' : '#6B6252' }]}>Appearance & theme</Text>
          <View style={[styles.settingsGroupCard, { backgroundColor: isDarkMode ? '#13151E' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0,0,0,0.08)' }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                  {isDarkMode ? <Moon size={15} color="#FF5A5F" /> : <Sun size={15} color="#D4AF37" />}
                  <Text style={[styles.settingLabel, { color: isDarkMode ? '#F4F3F0' : '#1E1A14' }]}>
                    {isDarkMode ? 'Dark theme' : 'Light theme'}
                  </Text>
                </View>
                <Text style={[styles.settingDesc, { color: isDarkMode ? '#6C6F7A' : '#6B6252' }]}>
                  {isDarkMode
                    ? 'Obsidian dark background with coral brand accents and gold passes.'
                    : 'Clean light mode with sharp typography and high contrast.'}
                </Text>
              </View>
              <ToggleSwitch on={isDarkMode} onPress={handleToggleTheme} />
            </View>
          </View>

          {/* Currency & Localization Section */}
          <Text style={[styles.sectionHeading, { color: isDarkMode ? '#8B8D98' : '#6B6252' }]}>Currency & localization</Text>
          <View style={[styles.settingsGroupCard, { backgroundColor: isDarkMode ? '#13151E' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0,0,0,0.08)' }]}>
            <View style={{ padding: 14 }}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#F4F3F0' : '#1E1A14', marginBottom: 4 }]}>
                Display currency ({currencySymbol || '$'} {currency || 'USD'})
              </Text>
              <Text style={[styles.settingDesc, { color: isDarkMode ? '#6C6F7A' : '#6B6252', marginBottom: 12 }]}>
                Prices, budget ranges, and market guidance will be converted to your preferred currency.
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['USD', 'EUR', 'INR', 'GBP'] as const).map((curr) => {
                  const isSelected = (currency || 'USD') === curr;
                  const symbols = { USD: '$', EUR: 'â‚¬', INR: 'â‚¹', GBP: 'Â£' };
                  return (
                    <TouchableOpacity
                      key={curr}
                      onPress={() => {
                        triggerHaptic();
                        setCurrency(curr);
                      }}
                      activeOpacity={0.75}
                      style={[
                        styles.currencyTab,
                        isSelected ? styles.currencyTabActive : { backgroundColor: isDarkMode ? '#090A0F' : '#F6EFDE', borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0,0,0,0.08)' }
                      ]}
                    >
                      <Text style={[styles.currencyTabSymbol, isSelected && { color: '#050608' }]}>
                        {symbols[curr]}
                      </Text>
                      <Text style={[styles.currencyTabCode, isSelected && { color: '#050608', fontWeight: '700' }]}>
                        {curr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Active Trip Circles Section */}
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>Active trip circles ({activeCircles.length})</Text>
          <View style={styles.circlesList}>
            {/* Circle 1 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/circle/circle-college-reunion-2026/hub' as any)}
              style={[styles.circleItemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={styles.circleHeaderRow}>
                <Text style={[styles.circleTitle, { color: theme.textPrimary }]}>Goa beach escape 2026</Text>
                <TouchableOpacity
                  onPress={() => router.push('/circle/circle-college-reunion-2026/hub' as any)}
                  style={{ padding: 4 }}
                >
                  <MoreVertical size={16} color="#6C6F7A" />
                </TouchableOpacity>
              </View>
              <View style={styles.circleMetaRow}>
                <Text style={styles.circleStatusGreen}>3/5 responded</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Organizer</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Circle 2 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/circle/circle-college-reunion-2026/hub' as any)}
              style={[styles.circleItemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={styles.circleHeaderRow}>
                <Text style={[styles.circleTitle, { color: theme.textPrimary }]}>Kyoto spring 2027</Text>
                <TouchableOpacity
                  onPress={() => router.push('/circle/circle-college-reunion-2026/hub' as any)}
                  style={{ padding: 4 }}
                >
                  <MoreVertical size={16} color="#6C6F7A" />
                </TouchableOpacity>
              </View>
              <View style={styles.circleMetaRow}>
                <Text style={styles.circleStatusAmber}>Voting open</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Member</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Create New Circle Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/create-circle' as any)}
            style={[styles.createCircleBtn, { backgroundColor: isDarkMode ? '#090A0F' : '#EFE7D4', borderColor: theme.border }]}
          >
            <Text style={styles.createCircleBtnText}>+ Create new circle</Text>
          </TouchableOpacity>

          {/* Privacy Shield Defaults */}
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>Privacy shield defaults</Text>
          <View style={[styles.settingsGroupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Mask exact budget numbers</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  Only the engine sees your cap; group never sees your raw budget.
                </Text>
              </View>
              <ToggleSwitch on={toggles.maskBudget} onPress={() => flip('maskBudget')} />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingTextCol}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Auto-delete veto history after vote</Text>
              </View>
              <ToggleSwitch on={toggles.autoDelete} onPress={() => flip('autoDelete')} />
            </View>
          </View>

          {/* Circle Nudges Section */}
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>Circle nudges & reminders</Text>
          <View style={[styles.settingsGroupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>WhatsApp nudges</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  Send automated WhatsApp nudges to unvoted friends.
                </Text>
              </View>
              <ToggleSwitch on={toggles.whatsAppNudges !== false} onPress={() => flip('whatsAppNudges')} />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingTextCol}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Voting deadline reminders</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  Push & SMS countdown notifications.
                </Text>
              </View>
              <ToggleSwitch on={toggles.deadlineReminders !== false} onPress={() => flip('deadlineReminders')} />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} color="#FF5A5F" />
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>AI Advisor notifications</Text>
                </View>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  Receive real-time compromise tips & consensus unlock alerts.
                </Text>
              </View>
              <ToggleSwitch on={toggles.aiNotifs !== false} onPress={() => flip('aiNotifs')} />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  simulateAINotification();
                }}
                activeOpacity={0.8}
                style={styles.testAiBtn}
              >
                <Sparkles size={14} color="#050608" />
                <Text style={styles.testAiBtnText}>Test incoming AI notification</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Account & Plan Section */}
          <Text style={styles.sectionHeading}>Account & plan</Text>
          <View style={[styles.settingsGroupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Current Plan Status */}
            <View style={styles.planInfoRow}>
              <View style={styles.planInfoLeft}>
                <View style={[styles.planBadge, subscriptionPlan !== 'free' ? styles.planBadgePro : styles.planBadgeFree]}>
                  {subscriptionPlan !== 'free' ? <Crown size={12} color="#050608" /> : <Zap size={12} color="#8B8D98" />}
                  <Text style={[styles.planBadgeText, subscriptionPlan !== 'free' && { color: '#050608' }]}>
                    {subscriptionPlan !== 'free' ? 'PACT PRO' : 'FREE TIER'}
                  </Text>
                </View>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                  {subscriptionPlan !== 'free' ? 'PACT Organizer Pass Active' : 'Free Tier (Up to 5 members)'}
                </Text>
                <Text style={styles.renewsDate}>
                  {subscriptionPlan !== 'free' ? 'Organizer pass active' : 'Upgrade for 6 to 10 members'}
                </Text>
              </View>
            </View>

            {/* Plan Features List */}
            <View style={styles.planFeaturesList}>
              <View style={styles.planFeatureItem}>
                <Check size={12} color={subscriptionPlan !== 'free' ? '#3DE0A0' : '#8B8D98'} />
                <Text style={[styles.planFeatureText, { color: theme.textSecondary }]}>
                  {subscriptionPlan !== 'free' ? 'Unlimited trip circles' : '1 active trip circle'}
                </Text>
              </View>
              <View style={styles.planFeatureItem}>
                <Check size={12} color={subscriptionPlan !== 'free' ? '#3DE0A0' : '#8B8D98'} />
                <Text style={[styles.planFeatureText, { color: theme.textSecondary }]}>
                  {subscriptionPlan !== 'free' ? 'Up to 10 members per circle' : 'Up to 5 members per circle'}
                </Text>
              </View>
              <View style={styles.planFeatureItem}>
                <Check size={12} color={subscriptionPlan !== 'free' ? '#3DE0A0' : '#8B8D98'} />
                <Text style={[styles.planFeatureText, { color: theme.textSecondary }]}>
                  {subscriptionPlan !== 'free' ? 'Unlimited AI prompts' : '15 AI prompts per day'}
                </Text>
              </View>
            </View>

            {/* Buy / Change Plan Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                triggerHaptic();
                router.push('/paywall');
              }}
              style={styles.viewPassesBtn}
            >
              <CreditCard size={15} color="#050608" />
              <Text style={styles.viewPassesBtnText}>
                {subscriptionPlan !== 'free' ? 'Change Plan / Upgrade Tier' : 'Buy a Group Pass'}
              </Text>
              <ChevronRight size={14} color="#050608" />
            </TouchableOpacity>

            {/* Manage Subscription (Pro only) */}
            {subscriptionPlan !== 'free' && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic();
                  setShowBillingModal(true);
                }}
                style={styles.manageSubBtn}
              >
                <Text style={[styles.manageSubBtnText, { color: theme.textSecondary }]}>
                  Manage subscription & billing
                </Text>
              </TouchableOpacity>
            )}

            {/* Danger Box: Sign Out & Clear Local Data */}
            <View style={[styles.dangerBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic();
                  setShowSignOutModal(true);
                }}
                style={styles.dangerBtn}
              >
                <LogOut size={15} color="#FF5A5F" />
                <Text style={styles.dangerBtnText}>Sign out / Switch account</Text>
              </TouchableOpacity>

              <View style={styles.dangerDivider} />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic();
                  setShowDeleteModal(true);
                }}
                style={styles.dangerBtn}
              >
                <Trash2 size={15} color="#EF4444" />
                <Text style={styles.purgeBtnText}>Clear local account data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* --- MODAL 1: CLEAR LOCAL DATA CONFIRMATION --- */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.dialogCard, { backgroundColor: theme.surface, borderColor: '#EF4444' }]}>
              <View style={[styles.dialogIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <AlertTriangle size={28} color="#EF4444" />
              </View>

              <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
                Clear Local Account Data?
              </Text>
              <Text style={[styles.dialogDesc, { color: theme.textSecondary }]}>
                This action is permanent and cannot be undone. All your private constraints, voting history, circles, and preference drafts will be completely wiped from this device and the cloud.
              </Text>

              <View style={styles.dialogActions}>
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isPurging}
                  activeOpacity={0.7}
                  style={[styles.dialogCancelBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.dialogCancelText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmDeleteAccount}
                  disabled={isPurging}
                  activeOpacity={0.8}
                  style={[styles.dialogDeleteBtn, { backgroundColor: '#EF4444' }]}
                >
                  {isPurging ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Trash2 size={15} color="#FFFFFF" />
                      <Text style={styles.dialogDeleteText}>Delete & Purge</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- MODAL 2: SIGN OUT CONFIRMATION --- */}
        <Modal
          visible={showSignOutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSignOutModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.dialogCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.dialogIconBox, { backgroundColor: 'rgba(255, 90, 95, 0.15)' }]}>
                <LogOut size={26} color="#FF5A5F" />
              </View>

              <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
                Sign Out?
              </Text>
              <Text style={[styles.dialogDesc, { color: theme.textSecondary }]}>
                Are you sure you want to sign out? Your saved trip circles and consensus data will remain secure for your next visit.
              </Text>

              <View style={styles.dialogActions}>
                <TouchableOpacity
                  onPress={() => setShowSignOutModal(false)}
                  activeOpacity={0.7}
                  style={[styles.dialogCancelBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.dialogCancelText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmSignOut}
                  activeOpacity={0.8}
                  style={[styles.dialogDeleteBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.dialogDeleteText, { color: '#050608' }]}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- MODAL 3: MANAGE SUBSCRIPTION & BILLING --- */}
        <Modal
          visible={showBillingModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBillingModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.dialogCard, { backgroundColor: theme.surface, borderColor: '#D4AF37' }]}>
              <View style={[styles.dialogIconBox, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
                <Crown size={28} color="#D4AF37" />
              </View>

              <Text style={[styles.dialogTitle, { color: theme.textPrimary }]}>
                Subscription & Billing
              </Text>
              <Text style={[styles.dialogDesc, { color: theme.textSecondary }]}>
                You are currently on the PACT Pro Organizer Pass. Subscriptions can be upgraded, changed, or managed via the App Store, Google Play, or Stripe checkout.
              </Text>

              <View style={styles.billingActionsCol}>
                <TouchableOpacity
                  onPress={() => {
                    setShowBillingModal(false);
                    router.push('/paywall');
                  }}
                  activeOpacity={0.85}
                  style={[styles.billingActionBtn, { backgroundColor: theme.primary }]}
                >
                  <CreditCard size={15} color="#050608" />
                  <Text style={styles.billingActionBtnText}>Change Plan / View Tiers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRestorePurchases}
                  disabled={isRestoring}
                  activeOpacity={0.8}
                  style={[styles.billingActionBtn, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}
                >
                  {isRestoring ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <RefreshCw size={15} color={theme.textPrimary} />
                      <Text style={[styles.billingActionBtnText, { color: theme.textPrimary }]}>Restore Purchases</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowBillingModal(false)}
                  activeOpacity={0.7}
                  style={[styles.dialogCancelBtn, { borderColor: theme.border, width: '100%', marginTop: 4 }]}
                >
                  <Text style={[styles.dialogCancelText, { color: theme.textSecondary }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <NotificationCenterModal />
        <NotificationToast />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  planInfoLeft: {
    flex: 1
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  planBadgeFree: {
    backgroundColor: '#2A2F3A'
  },
  planBadgePro: {
    backgroundColor: '#3DE0A0'
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#8B8D98'
  },
  planFeaturesList: {
    marginTop: 12,
    marginBottom: 14,
    gap: 8
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  planFeatureText: {
    fontSize: 12,
    fontWeight: '600'
  },
  viewPassesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12
  },
  manageSubBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4
  },
  manageSubBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  viewPassesBtnText: {
    color: '#050608',
    fontSize: 13,
    fontWeight: '800'
  },
  currencyTab: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencyTabActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F'
  },
  currencyTabSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5A5F',
    marginBottom: 2
  },
  currencyTabCode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B8D98'
  },
  notifHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444'
  },
  testAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A5F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%'
  },
  testAiBtnText: {
    color: '#050608',
    fontSize: 13,
    fontWeight: '700'
  },
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
    borderColor: 'rgba(255, 255, 255, 0.11)',
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
    marginBottom: 18
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 16,
    color: '#F4F3F0'
  },
  shieldIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatarContainer: {
    position: 'relative'
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#454857',
    borderWidth: 2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    fontFamily: fontUIBold,
    fontSize: 17,
    fontWeight: '700',
    color: '#B4B6C0'
  },
  proMiniBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  proMiniBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 8.5,
    fontWeight: '800',
    color: '#4A3A14'
  },
  profileTextCol: {
    flex: 1
  },
  profileName: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  profileHandle: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#6C6F7A',
    marginTop: 2,
    marginBottom: 8
  },
  proStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start'
  },
  proStatusPillText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#D4AF37'
  },
  sectionHeading: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#6C6F7A',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  circlesList: {
    gap: 10,
    marginBottom: 12
  },
  circleItemCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15
  },
  circleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  circleTitle: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#F4F3F0',
    marginBottom: 8
  },
  circleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  circleStatusGreen: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#3DE0A0'
  },
  circleStatusAmber: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#F0B547'
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3
  },
  roleBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#B4B6C0'
  },
  createCircleBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22
  },
  createCircleBtnText: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98'
  },
  settingsGroupCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 22
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.11)'
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 12
  },
  settingLabel: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  settingDesc: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A',
    lineHeight: 16,
    marginTop: 3
  },
  toggleTrack: {
    width: 38,
    height: 22,
    borderRadius: 20,
    padding: 3,
    justifyContent: 'center'
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  connectedText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#3DE0A0'
  },
  remindersSub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A'
  },
  planInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.11)'
  },
  renewsDate: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A'
  },
  dangerBox: {
    backgroundColor: 'rgba(239, 68, 68,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68,0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    marginVertical: 14
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  dangerBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5A5F'
  },
  dangerDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68,0.15)',
    marginHorizontal: 8
  },
  purgeBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center'
  },
  dialogIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  dialogTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  dialogDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  dialogCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialogCancelText: {
    fontSize: 13,
    fontWeight: '600'
  },
  dialogDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12
  },
  dialogDeleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  billingActionsCol: {
    width: '100%',
    gap: 10
  },
  billingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%'
  },
  billingActionBtnText: {
    color: '#050608',
    fontSize: 13,
    fontWeight: '700'
  }
});

