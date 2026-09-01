import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname, useSegments } from 'expo-router';
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
  const segments = useSegments();
  const { isDarkMode, activeGroupId, groups = [] } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;

  // Extract current group ID from route segments if present, or store
  let currentGroupId = activeGroupId;
  if (segments && segments[0] === 'groups' && segments[1] && segments[1] !== 'undefined') {
    currentGroupId = segments[1] as string;
  }
  if (!currentGroupId || !groups.some((g) => g.id === currentGroupId)) {
    currentGroupId = groups[0]?.id || 'circle-college-reunion-2026';
  }

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const isHomeActive =
    pathname === '/' ||
    pathname === '/groups' ||
    (segments && segments.length === 2 && segments[0] === 'groups');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Compass,
      route: '/',
      isActive: isHomeActive
    },
    {
      id: 'preferences',
      label: 'Input',
      icon: Sliders,
      route: `/groups/${currentGroupId}/preferences`,
      isActive: pathname.includes('/preferences')
    },
    {
      id: 'options',
      label: 'Rankings',
      icon: Trophy,
      route: `/groups/${currentGroupId}/options`,
      isActive: pathname.includes('/options')
    },
    {
      id: 'vote',
      label: 'Vote',
      icon: Heart,
      route: `/groups/${currentGroupId}/vote`,
      isActive: pathname.includes('/vote')
    },
    {
      id: 'brief',
      label: 'Brief',
      icon: Award,
      route: `/groups/${currentGroupId}/brief`,
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
            backgroundColor: isDarkMode ? 'rgba(21, 29, 42, 0.95)' : 'rgba(255, 255, 255, 0.97)',
            borderColor: theme.border
          },
          shadows.md
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
                  { backgroundColor: isDarkMode ? 'rgba(234, 88, 12, 0.2)' : '#FFEDD5' }
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
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 6,
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
    paddingHorizontal: 8,
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