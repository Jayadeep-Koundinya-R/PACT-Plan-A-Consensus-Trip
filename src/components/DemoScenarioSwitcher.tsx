import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { usePactHaptics } from '../hooks/usePactHaptics';
import { fontUI, fontUIBold } from '../theme/typography';
import {
  Sparkles,
  Users,
  Scale,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';

interface ScenarioOption {
  id: 'early_bird' | 'budget_gap' | 'deadlock' | 'consensus';
  label: string;
  sub: string;
  Icon: any;
  color: string;
  accentBg: string;
}

const SCENARIOS: ScenarioOption[] = [
  {
    id: 'early_bird',
    label: 'Early Bird',
    sub: '1/5 Responded',
    Icon: Users,
    color: '#38BDF8',
    accentBg: 'rgba(56, 189, 248, 0.12)'
  },
  {
    id: 'budget_gap',
    label: 'Budget Gap',
    sub: '$700 vs $2500',
    Icon: Scale,
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.12)'
  },
  {
    id: 'deadlock',
    label: 'Deadlock',
    sub: 'Veto Active',
    Icon: Ban,
    color: '#EF4444',
    accentBg: 'rgba(239, 68, 68, 0.12)'
  },
  {
    id: 'consensus',
    label: 'Consensus',
    sub: '100% Locked',
    Icon: CheckCircle2,
    color: '#3DE0A0',
    accentBg: 'rgba(61, 224, 160, 0.12)'
  }
];

export const DemoScenarioSwitcher: React.FC = () => {
  const haptics = usePactHaptics();
  const activeScenario = useGatherlyStore((s) => s.activeDemoScenario || 'early_bird');
  const setDemoScenario = useGatherlyStore((s) => s.setDemoScenario);

  const [isExpanded, setIsExpanded] = useState(true);

  const handleSelect = (scenarioId: ScenarioOption['id']) => {
    haptics.action();
    setDemoScenario(scenarioId as any);
  };

  const currentScenario = SCENARIOS.find((s) => s.id === activeScenario) || SCENARIOS[0];

  return (
    <View style={styles.outerContainer}>
      <View style={styles.floatingBar}>
        {/* Header Bar / Pill Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.pulseDot, { backgroundColor: currentScenario.color }]} />
            <Sparkles size={13} color="#FF5A5F" />
            <Text style={styles.headerTitle}>DEMO CONTROLLER</Text>
            <View style={[styles.activeTag, { backgroundColor: currentScenario.accentBg, borderColor: currentScenario.color }]}>
              <Text style={[styles.activeTagText, { color: currentScenario.color }]}>
                {currentScenario.label}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              haptics.tap();
              setIsExpanded((prev) => !prev);
            }}
            style={styles.collapseToggle}
            accessibilityLabel={isExpanded ? 'Collapse demo controller' : 'Expand demo controller'}
          >
            <Text style={styles.collapseToggleText}>
              {isExpanded ? 'Hide' : 'Presets'}
            </Text>
            {isExpanded ? (
              <ChevronUp size={13} color="#8B8D98" />
            ) : (
              <ChevronDown size={13} color="#8B8D98" />
            )}
          </TouchableOpacity>
        </View>

        {/* 4 1-Tap Presets Grid */}
        {isExpanded && (
          <View style={styles.presetsRow}>
            {SCENARIOS.map((sc) => {
              const isActive = activeScenario === sc.id;
              const Icon = sc.Icon;
              return (
                <TouchableOpacity
                  key={sc.id}
                  activeOpacity={0.75}
                  onPress={() => handleSelect(sc.id)}
                  style={[
                    styles.presetBtn,
                    isActive && {
                      backgroundColor: sc.accentBg,
                      borderColor: sc.color,
                      borderWidth: 1.5
                    }
                  ]}
                >
                  <View style={styles.btnTopRow}>
                    <Icon size={13} color={isActive ? sc.color : '#8B8D98'} />
                    <Text
                      style={[
                        styles.presetLabel,
                        isActive && { color: sc.color, fontWeight: '800' }
                      ]}
                      numberOfLines={1}
                    >
                      {sc.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.presetSub,
                      isActive && { color: '#F4F3F0' }
                    ]}
                    numberOfLines={1}
                  >
                    {sc.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
    backgroundColor: '#0D0E15'
  },
  floatingBar: {
    backgroundColor: '#13151E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2232',
    padding: 8
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  headerTitle: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '800',
    color: '#8B8D98',
    letterSpacing: 0.8
  },
  activeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  activeTagText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    fontWeight: '800'
  },
  collapseToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#181A26'
  },
  collapseToggleText: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#8B8D98',
    fontWeight: '600'
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#181A26',
    borderWidth: 1,
    borderColor: '#25293A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  btnTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2
  },
  presetLabel: {
    fontFamily: fontUI,
    fontSize: 10,
    fontWeight: '700',
    color: '#8B8D98'
  },
  presetSub: {
    fontFamily: fontUI,
    fontSize: 8.5,
    color: '#555866',
    textAlign: 'center'
  }
});
