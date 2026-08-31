import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { colors, radius, shadows } from '../theme/colors';
import {
  Compass,
  Sliders,
  Trophy,
  Heart,
  Award,
  Crown
} from 'lucide-react-native';

export const BottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, activeGroupId, groups } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;

  const currentGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const targetGroupId = currentGroup?.id || 'circle-college-reunion-2026';

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const tabs = [
    {
      id: 'circles',
      label: 'Circles',
      icon: Compass,
      route: '/groups',
      isActive: pathname === '/groups' || pathname === '/'
    },
    {
      id: 'preferences',
      label: 'Input',
      icon: Sliders,
      route: `/groups/${targetGroupId}/preferences`,
      isActive: pathname.includes('/preferences')
    },
    {
      id: 'options',
      label: 'Rankings',
      icon: Trophy,
      route: `/groups/${targetGroupId}/options`,
      isActive: pathname.includes('/options')
    },
    {
      id: 'vote',
      label: 'Vote',
      icon: Heart,
      route: `/groups/${targetGroupId}/vote`,
      isActive: pathname.includes('/vote')
    },
    {
      id: 'brief',
      label: 'Brief',
      icon: Award,
      route: `/groups/${targetGroupId}/brief`,
      isActive: pathname.includes('/brief')
    },
    {
      id: 'pro',
      label: 'Pro',
      icon: Crown,
      route: '/paywall',
      isActive: pathname === '/paywall'
    }
  ];

  const handleTabPress = (route: string) => {
    triggerHaptic();
    router.push(route as any);
  };

  return (
    <View pointerEvents="box-none" style={styles.outerContainer}>
      <View
        style={[
          styles.pillContainer,
          {
            backgroundColor: isDarkMode ? 'rgba(28, 19, 13, 0.95)' : 'rgba(255, 248, 243, 0.95)',
            borderColor: theme.border
          },
          shadows.lg
        ]}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.route)}
              style={[
                styles.tabBtn,
                tab.isActive && [
                  styles.activeTabBtn,
                  { backgroundColor: isDarkMode ? 'rgba(234, 88, 12, 0.2)' : '#FDE8DC' }
                ]
              ]}
            >
              <Icon
                size={18}
                color={tab.isActive ? theme.primary : theme.textMuted}
                strokeWidth={tab.isActive ? 2.5 : 2}
              />
              {tab.isActive && (
                <Text
                  numberOfLines={1}
                  style={[styles.activeLabel, { color: theme.primary }]}
                >
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 8,
    borderWidth: 1,
    maxWidth: 480,
    width: '92%'
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.pill
  },
  activeTabBtn: {
    paddingHorizontal: 12
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700'
  }
});