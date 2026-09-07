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
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { colors, radius } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { ArrowLeft, Shield, MoreVertical, Plus, Check } from 'lucide-react-native';

export default function PactSettings() {
  const router = useRouter();
  const { groups = [], currentUserId = 'user-maya-001' } = useGatherlyStore();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    maskBudget: true,
    autoDelete: true
  });

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

  const ToggleSwitch = ({ on, onPress }: { on: boolean; onPress: () => void }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.toggleTrack,
        on ? { backgroundColor: '#25C9A0' } : { backgroundColor: 'rgba(253, 249, 239, 0.18)' }
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          on ? { backgroundColor: '#0A2A1F', transform: [{ translateX: 16 }] } : { backgroundColor: '#C3BAA6', transform: [{ translateX: 0 }] }
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                <ArrowLeft size={18} color="#C3BAA6" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Settings & circles</Text>
            </View>

            <View style={styles.shieldIconBox}>
              <Svg width="14" height="14" viewBox="0 0 14 14">
                <Path
                  d="M7 1.3l5 1.8v3.7c0 3-2 5.3-5 6-3-.7-5-3-5-6V3.1z"
                  fill="none"
                  stroke="#C3BAA6"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarInitials}>AR</Text>
              </View>
              <View style={styles.proMiniBadge}>
                <Text style={styles.proMiniBadgeText}>PRO</Text>
              </View>
            </View>

            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>Alex Rivers</Text>
              <Text style={styles.profileHandle}>@alex_travels</Text>
              <View style={styles.proStatusPill}>
                <Svg width="10" height="10" viewBox="0 0 10 10">
                  <Path d="M1 3.5l2 1.5 2-3 2 3 2-1.5-.7 4.5H1.7z" fill="#FFD98A" />
                </Svg>
                <Text style={styles.proStatusPillText}>PACT Pro organizer pass active</Text>
              </View>
            </View>
          </View>

          {/* Active Trip Circles Section */}
          <Text style={styles.sectionHeading}>Active trip circles (2)</Text>
          <View style={styles.circlesList}>
            {/* Circle 1 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/circle/circle-college-reunion-2026/hub' as any)}
              style={styles.circleItemCard}
            >
              <View style={styles.circleHeaderRow}>
                <Text style={styles.circleTitle}>Goa beach escape 2026</Text>
                <MoreVertical size={16} color="#9C947F" />
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
              style={styles.circleItemCard}
            >
              <Text style={styles.circleTitle}>Kyoto spring 2027</Text>
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
            style={styles.createCircleBtn}
          >
            <Text style={styles.createCircleBtnText}>+ Create new circle</Text>
          </TouchableOpacity>

          {/* Privacy Shield Defaults */}
          <Text style={styles.sectionHeading}>Privacy shield defaults</Text>
          <View style={styles.settingsGroupCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Mask exact budget numbers</Text>
                <Text style={styles.settingDesc}>
                  Only the engine sees your cap; group never sees your raw budget.
                </Text>
              </View>
              <ToggleSwitch on={toggles.maskBudget} onPress={() => flip('maskBudget')} />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Auto-delete veto history after vote</Text>
              </View>
              <ToggleSwitch on={toggles.autoDelete} onPress={() => flip('autoDelete')} />
            </View>
          </View>

          {/* Circle Nudges Section */}
          <Text style={styles.sectionHeading}>Circle nudges</Text>
          <View style={styles.settingsGroupCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>WhatsApp nudges</Text>
              <View style={styles.connectedRow}>
                <Check size={12} color="#25C9A0" />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <Text style={styles.settingLabel}>Voting deadline reminders</Text>
              <Text style={styles.remindersSub}>Push & SMS</Text>
            </View>
          </View>

          {/* Account & Plan Section */}
          <Text style={styles.sectionHeading}>Account & plan</Text>
          <View style={styles.settingsGroupCard}>
            <View style={styles.planInfoRow}>
              <Text style={styles.settingLabel}>PACT Pro annual ($29.99/yr)</Text>
              <Text style={styles.renewsDate}>Renews Oct 12</Text>
            </View>

            <View style={styles.dangerBox}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert('Leave Circle', 'Are you sure you want to leave this circle?')}
                style={styles.dangerBtn}
              >
                <Text style={styles.dangerBtnText}>Leave active circle</Text>
              </TouchableOpacity>
              <View style={styles.dangerDivider} />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Alert.alert('Purge Data', 'All private constraints and voting history will be purged.')}
                style={styles.dangerBtn}
              >
                <Text style={styles.purgeBtnText}>Delete account & purge all private data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    color: '#FDF9EF'
  },
  shieldIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
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
    backgroundColor: '#7A7263',
    borderWidth: 2,
    borderColor: '#FFD98A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    fontFamily: fontUIBold,
    fontSize: 17,
    fontWeight: '700',
    color: '#D8D0BC'
  },
  proMiniBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: '#FFD98A',
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
    color: '#FDF9EF'
  },
  profileHandle: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#9C947F',
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
    color: '#FFD98A'
  },
  sectionHeading: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#9C947F',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  circlesList: {
    gap: 10,
    marginBottom: 12
  },
  circleItemCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
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
    color: '#FDF9EF',
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
    color: '#25C9A0'
  },
  circleStatusAmber: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#FFC55C'
  },
  roleBadge: {
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3
  },
  roleBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#D8D0BC'
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
    color: '#C3BAA6'
  },
  settingsGroupCard: {
    backgroundColor: '#1E2742',
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
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
    borderTopColor: 'rgba(253, 249, 239, 0.11)'
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 12
  },
  settingLabel: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FDF9EF'
  },
  settingDesc: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#9C947F',
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
    color: '#25C9A0'
  },
  remindersSub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#9C947F'
  },
  planInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(253, 249, 239, 0.11)'
  },
  renewsDate: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#9C947F'
  },
  dangerBox: {
    backgroundColor: 'rgba(225, 71, 51,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(225, 71, 51,0.2)',
    borderRadius: 12,
    paddingVertical: 6,
    marginVertical: 14
  },
  dangerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  dangerBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#E14733'
  },
  dangerDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(225, 71, 51,0.15)',
    marginHorizontal: 8
  },
  purgeBtnText: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#A97C3D'
  }
});