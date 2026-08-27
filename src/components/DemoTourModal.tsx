import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import {
  X,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Compass,
  ShieldCheck,
  Calculator,
  Vote,
  Crown
} from 'lucide-react-native';

interface DemoTourModalProps {
  visible: boolean;
  isDarkMode?: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'The Real-World Group Problem',
    icon: Compass,
    color: '#0EA5E9',
    summary: '5 friends (Maya, Jake, Priya, Alex, Sam) want to travel together, but negotiate for weeks on WhatsApp with incompatible budgets ($300-$3000), conflicting dates, and unvoiced dealbreakers.'
  },
  {
    step: 2,
    title: '100% Private Constraints',
    icon: ShieldCheck,
    color: '#10B981',
    summary: 'Everyone submits their dates, budget caps, and hard dealbreakers privately. Raw individual numbers are strictly hidden from peers, preventing peer pressure and resentment.'
  },
  {
    step: 3,
    title: 'Deterministic Consensus Scoring',
    icon: Calculator,
    color: '#F59E0B',
    summary: 'Pure mathematical evaluation: Date (35%) + Budget (35%) + Tags (25%) with instant dealbreaker override (-100%). Goa Beach Weekend emerges as #1 with 74.24% compatibility and 100% group consensus.'
  },
  {
    step: 4,
    title: 'Truly Silent Voting Room',
    icon: Vote,
    color: '#EC4899',
    summary: 'Members vote silently. Individual ballots are never broadcast—only live aggregate consensus percentages are displayed. When 70% threshold is reached, organizer Maya finalizes the trip.'
  },
  {
    step: 5,
    title: 'RevenueCat In-App Monetization',
    icon: Crown,
    color: '#8B5CF6',
    summary: 'Free tier allows 1 active circle. PACT Pro ($4.99/mo or $39.99/yr) unlocks unlimited circles, calendar exports, and AI-powered natural language conflict diagnoses.'
  }
];

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  visible,
  isDarkMode = true,
  onClose
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const step = TOUR_STEPS[currentStepIdx];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      onClose();
      setCurrentStepIdx(0);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.surface, borderColor: theme.glassBorder },
            shadows.lg
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                STEP {step.step} OF {TOUR_STEPS.length}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Step Icon */}
          <View style={[styles.iconBox, { backgroundColor: `${step.color}20` }]}>
            <Icon size={32} color={step.color} />
          </View>

          {/* Title & Body */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {step.title}
          </Text>
          <Text style={[styles.summary, { color: theme.textSecondary }]}>
            {step.summary}
          </Text>

          {/* Step Dots */}
          <View style={styles.dotsRow}>
            {TOUR_STEPS.map((s, idx) => (
              <View
                key={s.step}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      idx === currentStepIdx
                        ? theme.primary
                        : theme.surfaceElevated,
                    width: idx === currentStepIdx ? 20 : 6
                  }
                ]}
              />
            ))}
          </View>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            {currentStepIdx > 0 ? (
              <TouchableOpacity
                onPress={handlePrev}
                style={[styles.navBtn, { backgroundColor: theme.surfaceElevated }]}
              >
                <ChevronLeft size={16} color={theme.textPrimary} />
                <Text style={[styles.navBtnText, { color: theme.textPrimary }]}>
                  Back
                </Text>
              </TouchableOpacity>
            ) : <View style={{ flex: 1 }} />}

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
            >
              <Text style={styles.primaryBtnText}>
                {currentStepIdx === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}
              </Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 460,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16
  },
  stepBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  stepBadgeText: {
    color: '#0EA5E9',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  closeBtn: {
    padding: 4
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20
  },
  dot: {
    height: 6,
    borderRadius: 3
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: radius.btn
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  primaryBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.btn
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
