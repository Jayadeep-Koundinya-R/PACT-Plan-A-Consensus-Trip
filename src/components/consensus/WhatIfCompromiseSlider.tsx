import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Zap, ShieldCheck, Sparkles, PartyPopper } from 'lucide-react-native';

interface WhatIfCompromiseSliderProps {
  currentScore: number;
  onSimulateShift?: (deltaBudget: number) => void;
}

export const WhatIfCompromiseSlider: React.FC<WhatIfCompromiseSliderProps> = ({
  currentScore = 58,
  onSimulateShift
}) => {
  const [selectedDelta, setSelectedDelta] = useState<number>(0);

  const deltaOptions = [-100, -50, 0, 50, 100];

  // Modulate simulated score based on delta selected (+15% score shift per +$50 elasticity)
  const scoreBoost = Math.round((selectedDelta / 50) * 12);
  const simulatedScore = Math.min(100, Math.max(0, currentScore + scoreBoost));
  const isSupermajority = simulatedScore >= 70;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleSelectDelta = (delta: number) => {
    triggerHaptic();
    setSelectedDelta(delta);
    if (onSimulateShift) {
      onSimulateShift(delta);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Zap size={16} color="#3DE0A0" />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>⚡ What-If Compromise Simulator</Text>
          <Text style={styles.subtitle}>
            Test how small compromises unlock circle consensus without revealing private numbers.
          </Text>
        </View>
      </View>

      {/* Delta Pill Controls */}
      <Text style={styles.sectionLabel}>Budget Elasticity Shift:</Text>
      <View style={styles.pillsRow}>
        {deltaOptions.map((delta) => {
          const isSelected = selectedDelta === delta;
          const labelStr = delta === 0 ? '+$0' : delta > 0 ? `+$${delta}` : `-$${Math.abs(delta)}`;

          return (
            <TouchableOpacity
              key={delta}
              activeOpacity={0.8}
              onPress={() => handleSelectDelta(delta)}
              style={[
                styles.pill,
                isSelected && styles.pillSelected
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Budget elasticity shift ${labelStr}`}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextSelected
                ]}
              >
                {labelStr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dynamic Progress Gauge Meter */}
      <View style={styles.meterContainer}>
        <View style={styles.meterHeader}>
          <Text style={styles.meterLabel}>Projected Consensus Score</Text>
          <Text
            style={[
              styles.meterScore,
              { color: isSupermajority ? '#3DE0A0' : '#F59E0B' }
            ]}
          >
            {simulatedScore}%
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${simulatedScore}%`,
                backgroundColor: isSupermajority ? '#3DE0A0' : '#F59E0B'
              }
            ]}
          />
        </View>

        <View style={styles.statusBadgeRow}>
          {isSupermajority ? (
            <View style={styles.supermajorityBadge}>
              <PartyPopper size={13} color="#052E20" />
              <Text style={styles.supermajorityText}>
                🎉 Supermajority Unlocked! ({simulatedScore}%)
              </Text>
            </View>
          ) : (
            <View style={styles.deadlockedBadge}>
              <Text style={styles.deadlockedText}>
                Deadlocked ({simulatedScore}%) — Adjust slider to unlock agreement
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Zero-Knowledge Security Badge */}
      <View style={styles.zkPill}>
        <ShieldCheck size={13} color="#3DE0A0" />
        <Text style={styles.zkPillText}>
          🔒 Zero-Knowledge Differential Analysis
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTextCol: {
    flex: 1
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F4F3F0',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 11.5,
    color: '#8B8D98',
    lineHeight: 16
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B8D98',
    marginBottom: 8
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14
  },
  pill: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pillSelected: {
    backgroundColor: '#3DE0A0',
    borderColor: '#3DE0A0'
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B8D98'
  },
  pillTextSelected: {
    color: '#052E20',
    fontWeight: '800'
  },
  meterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  meterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  meterScore: {
    fontSize: 14,
    fontWeight: '800'
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 10
  },
  fill: {
    height: '100%',
    borderRadius: 4
  },
  statusBadgeRow: {
    alignItems: 'flex-start'
  },
  supermajorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  supermajorityText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#052E20'
  },
  deadlockedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  deadlockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B'
  },
  zkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  zkPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3DE0A0'
  }
});
