import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  X,
  Compass
} from 'lucide-react-native';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';
import { colors, radius, shadows } from '../theme/colors';

interface TutorialSlide {
  step: string;
  tagColor: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  iconColor: string;
  iconBg: string;
}

const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    step: 'STEP 1 · ZERO BUDGET SHAME',
    tagColor: '#3DE0A0',
    title: 'Your Constraints Stay Sealed',
    subtitle: 'Enter your real budget cap, dates, and unspoken dealbreakers. They are encrypted and never shown to peers.',
    badge: '100% Confidential Vault',
    icon: ShieldCheck,
    iconColor: '#3DE0A0',
    iconBg: 'rgba(61, 224, 160, 0.14)'
  },
  {
    step: 'STEP 2 · MATH OVER OPINIONS',
    tagColor: '#FF5A5F',
    title: 'Pareto Scoring Engine',
    subtitle: 'Our deterministic consensus engine calculates group overlap across budgets and dates to eliminate 40-message chat debates.',
    badge: 'Deterministic Matrix',
    icon: Sparkles,
    iconColor: '#FF5A5F',
    iconBg: 'rgba(255, 90, 95, 0.14)'
  },
  {
    step: 'STEP 3 · SILENT VOTING',
    tagColor: '#D4AF37',
    title: 'Tactile Wax-Seal Ballot',
    subtitle: 'Vote privately with our signature digital wax seal. Real-time supermajority (70%) or unanimity binds the group decision.',
    badge: 'Zero Peer Pressure',
    icon: CheckCircle2,
    iconColor: '#D4AF37',
    iconBg: 'rgba(212, 175, 55, 0.14)'
  },
  {
    step: 'STEP 4 · ITINERARY PAYOFF',
    tagColor: '#3DE0A0',
    title: 'Trip Brief & .ICS Export',
    subtitle: 'Consensus unlocks your confirmed itinerary, lodging receipts, and RFC-compliant calendar invite in 1 tap.',
    badge: 'Ready for Takeoff',
    icon: Calendar,
    iconColor: '#3DE0A0',
    iconBg: 'rgba(61, 224, 160, 0.14)'
  }
];

interface FirstTimeTutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FirstTimeTutorialModal: React.FC<FirstTimeTutorialModalProps> = ({
  visible,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
    }
  };

  const handleNext = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (currentSlide < TUTORIAL_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setCurrentSlide(0);
    onClose();
  };

  const slide = TUTORIAL_SLIDES[currentSlide];
  const IconComponent = slide.icon;
  const isLast = currentSlide === TUTORIAL_SLIDES.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleComplete}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Compass size={14} color="#FF5A5F" strokeWidth={2.5} />
              </View>
              <Text style={styles.brandText}>PACT GUIDE</Text>
            </View>

            <TouchableOpacity
              onPress={handleComplete}
              activeOpacity={0.7}
              style={styles.skipBtn}
              accessibilityLabel="Skip tutorial"
            >
              <Text style={styles.skipBtnText}>Skip</Text>
              <X size={15} color="#8B8D98" />
            </TouchableOpacity>
          </View>

          {/* Icon Stage */}
          <View style={styles.stage}>
            <View style={[styles.iconBox, { backgroundColor: slide.iconBg, borderColor: slide.tagColor }]}>
              <IconComponent size={36} color={slide.iconColor} strokeWidth={2} />
            </View>

            <View style={[styles.stepTag, { borderColor: slide.tagColor + '40', backgroundColor: slide.iconBg }]}>
              <Text style={[styles.stepTagText, { color: slide.tagColor }]}>{slide.step}</Text>
            </View>

            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{slide.badge}</Text>
            </View>
          </View>

          {/* Interactive Dots Indicator */}
          <View style={styles.dotsRow}>
            {TUTORIAL_SLIDES.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentSlide(idx);
                }}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                style={[
                  styles.dot,
                  idx === currentSlide ? styles.dotActive : styles.dotInactive
                ]}
                accessibilityLabel={`Go to slide ${idx + 1}`}
              />
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {currentSlide > 0 && (
              <TouchableOpacity
                onPress={handlePrev}
                activeOpacity={0.7}
                style={styles.secondaryBtn}
                accessibilityLabel="Previous slide"
              >
                <ArrowLeft size={16} color="#8B8D98" strokeWidth={2} />
                <Text style={styles.secondaryBtnText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              style={[styles.primaryBtn, currentSlide > 0 && { flex: 1 }]}
              accessibilityLabel={isLast ? 'Start Planning' : 'Next slide'}
            >
              <Text style={styles.primaryBtnText}>
                {isLast ? 'Start Planning' : 'Next'}
              </Text>
              <ArrowRight size={16} color="#050608" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.cardLarge,
    padding: 24,
    ...shadows.lg
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 90, 95, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#FF5A5F',
    letterSpacing: 1.2
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  skipBtnText: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98',
    fontWeight: '600'
  },
  stage: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 10
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  stepTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  stepTagText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  slideTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0',
    textAlign: 'center',
    marginBottom: 8
  },
  slideSubtitle: {
    fontFamily: fontUI,
    fontSize: 14,
    color: '#8B8D98',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  badgePillText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#F4F3F0',
    fontWeight: '700'
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20
  },
  dot: {
    height: 6,
    borderRadius: 3
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FF5A5F'
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.16)'
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48
  },
  secondaryBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#8B8D98'
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A5F',
    borderRadius: radius.md,
    paddingVertical: 14,
    minHeight: 48,
    width: '100%'
  },
  primaryBtnText: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '800',
    color: '#050608'
  }
});
