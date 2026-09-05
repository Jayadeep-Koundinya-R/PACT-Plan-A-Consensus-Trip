import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, usePathname } from 'expo-router';
import { useCircleStore } from '../../../src/store/useCircleStore';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { StepProgressBar } from '../../../src/components/StepProgressBar';
import { DemoScenarioSwitcher } from '../../../src/components/DemoScenarioSwitcher';
import { colors, radius, shadows } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Lock, Image as ImageIcon, Sparkles } from 'lucide-react-native';
import { CircleRouteGuard } from '../../../src/components/common';

export default function CircleDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const haptics = usePactHaptics();

  const rawId = (id && id !== 'undefined') ? id : undefined;
  const legacyGroups = useGatherlyStore((s) => s.groups || []);
  const activeGroupId = useGatherlyStore((s) => s.activeGroupId);
  const circleId = rawId || (activeGroupId && activeGroupId !== 'undefined' ? activeGroupId : undefined) || legacyGroups[0]?.id || 'circle-college-reunion-2026';
  const circle = useCircleStore((s) => s.getCircle(circleId));
  const legacyGroup = legacyGroups.find((g) => g.id === circleId);
  const circleName = circle?.name || legacyGroup?.name || 'Goa Beach Escape 2026';

  const isVault = pathname.includes('/vault');
  const isMemories = pathname.includes('/memories');

  let currentStep = 1;
  if (pathname.includes('/preferences')) currentStep = 2;
  else if (pathname.includes('/ranked-matrix')) currentStep = 3;
  else if (pathname.includes('/silent-ballot')) currentStep = 4;
  else if (pathname.includes('/brief')) currentStep = 5;

  const showStepBar = !isVault && !isMemories;

  return (
    <CircleRouteGuard id={id}>
    <View style={styles.container}>
      {/* Top Header Bar */}
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.headerBar}>
          {/* Header Left: "← My Circles" */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              haptics.tap();
              router.replace('/(tabs)/home');
            }}
            style={styles.backButton}
            accessibilityLabel="Back to My Circles"
          >
            <ArrowLeft size={15} color="#FF5A5F" strokeWidth={2.5} />
            <Text style={styles.backButtonText}>My Circles</Text>
          </TouchableOpacity>

          {/* Header Center: Displays circle name */}
          <View style={styles.centerCol}>
            <Text numberOfLines={1} style={styles.circleTitle}>
              {circleName}
            </Text>
          </View>

          {/* Header Right: Secondary post-trip tab options (Vault & Memories) */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                haptics.tap();
                router.push(`/circle/${circleId}/vault` as any);
              }}
              style={[
                styles.tabPill,
                isVault && styles.activeTabPill
              ]}
              accessibilityLabel="Vault"
            >
              <Lock size={12} color={isVault ? '#3DE0A0' : '#8B8D98'} />
              <Text style={[styles.tabPillText, isVault && styles.activeTabPillText]}>Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                haptics.tap();
                router.push(`/circle/${circleId}/memories` as any);
              }}
              style={[
                styles.tabPill,
                isMemories && styles.activeTabPill
              ]}
              accessibilityLabel="Memories"
            >
              <ImageIcon size={12} color={isMemories ? '#3DE0A0' : '#8B8D98'} />
              <Text style={[styles.tabPillText, isMemories && styles.activeTabPillText]}>Memories</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticky Top Horizontal Step Progress Bar */}
        {showStepBar && (
          <StepProgressBar
            currentStep={currentStep}
            groupId={circleId}
            isDarkMode={true}
          />
        )}

        {/* 1-Tap Demo Scenario Controller for judges and video pitch */}
        <DemoScenarioSwitcher />
      </SafeAreaView>

      {/* Screen Sub-Stack */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#090A0F' }
        }}
      />
    </View>
    </CircleRouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F'
  },
  safeHeader: {
    backgroundColor: '#0D0E15',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2232',
    zIndex: 50
  },
  headerBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 90, 95, 0.08)'
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5A5F'
  },
  centerCol: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center'
  },
  circleTitle: {
    fontFamily: fontDisplay,
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F3F0',
    textAlign: 'center'
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#181A26',
    borderWidth: 1,
    borderColor: '#2D3144'
  },
  activeTabPill: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderColor: 'rgba(61, 224, 160, 0.3)'
  },
  tabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B8D98'
  },
  activeTabPillText: {
    color: '#3DE0A0',
    fontWeight: '700'
  }
});
