import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Shield, BrainCircuit, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react-native';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  cardMetric: string;
  cardMetricSub: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    tag: 'PRIVACY SHIELD',
    tagColor: '#58A68C',
    title: 'Your Budget & Dates Are Sealed',
    description: 'Nobody sees what you earn or can afford. Input your private constraints — PACT only searches for the hidden group overlap.',
    icon: Shield,
    iconColor: '#58A68C',
    iconBg: 'rgba(88, 166, 140, 0.12)',
    cardMetric: '100% Confidential',
    cardMetricSub: 'Zero peer pressure or awkward budget talks'
  },
  {
    tag: 'CONSENSUS ENGINE',
    tagColor: '#D99A3F',
    title: 'Math Resolves Group Deadlocks',
    description: 'No more 47-message WhatsApp debates that go nowhere. Our Pareto engine computes the exact compromise where every friend wins.',
    icon: BrainCircuit,
    iconColor: '#D99A3F',
    iconBg: 'rgba(217, 154, 63, 0.12)',
    cardMetric: 'Pareto Optimal',
    cardMetricSub: 'Automatically diagnoses budget & date collisions'
  },
  {
    tag: 'SEALED BALLOT',
    tagColor: '#C99A5B',
    title: 'Vote Privately · Export to WhatsApp',
    description: 'Approve or veto options with a tactile wax-seal stamp. Once locked, 1-tap exports the confirmed brief and .ics calendar invite.',
    icon: CheckCircle2,
    iconColor: '#C99A5B',
    iconBg: 'rgba(201, 154, 91, 0.12)',
    cardMetric: '1-Tap Export',
    cardMetricSub: 'The 5 minutes before the WhatsApp chat starts'
  }
];

interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleNext = () => {
    triggerHaptic();
    if (currentIdx < SLIDES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete();
    }
  };

  const slide = SLIDES[currentIdx];
  const IconComponent = slide.icon;

  return (
    <View style={styles.container}>
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>STEP {currentIdx + 1} OF 3</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
          <X size={14} color="#A9A08C" />
        </TouchableOpacity>
      </View>

      {/* Main Slide Card */}
      <View style={styles.slideContent}>
        <View style={[styles.iconContainer, { backgroundColor: slide.iconBg, borderColor: slide.tagColor }]}>
          <IconComponent size={42} color={slide.iconColor} strokeWidth={2} />
        </View>

        <View style={[styles.tagBadge, { borderColor: slide.tagColor }]}>
          <Text style={[styles.tagText, { color: slide.tagColor }]}>{slide.tag}</Text>
        </View>

        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.description}</Text>

        {/* Feature Visual Callout Card */}
        <View style={styles.visualCard}>
          <View style={styles.visualCardDot} />
          <View style={styles.visualCardTextCol}>
            <Text style={styles.visualMetricTitle}>{slide.cardMetric}</Text>
            <Text style={styles.visualMetricSub}>{slide.cardMetricSub}</Text>
          </View>
        </View>
      </View>

      {/* Dots and Navigation Buttons */}
      <View style={styles.bottomSection}>
        {/* Carousel Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                triggerHaptic();
                setCurrentIdx(idx);
              }}
              style={[
                styles.dot,
                idx === currentIdx && styles.dotActive
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleNext}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>
            {currentIdx === SLIDES.length - 1 ? 'Enter PACT' : 'Continue'}
          </Text>
          <ArrowRight size={16} color="#16301E" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#12182B',
    borderRadius: Platform.OS === 'web' ? 32 : 0,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    padding: 24,
    justifyContent: 'space-between',
    minHeight: 540
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  stepIndicator: {
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  stepText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#A9A08C',
    letterSpacing: 0.8
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4
  },
  skipText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#A9A08C'
  },
  slideContent: {
    alignItems: 'center',
    paddingVertical: 10
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10
  },
  tagBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 12,
    backgroundColor: 'rgba(12, 17, 32, 0.6)'
  },
  tagText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    letterSpacing: 1
  },
  slideTitle: {
    fontFamily: fontDisplay,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28
  },
  slideDesc: {
    fontFamily: fontUI,
    fontSize: 13.5,
    color: '#A9A08C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8
  },
  visualCard: {
    width: '100%',
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  visualCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#58A68C'
  },
  visualCardTextCol: {
    flex: 1
  },
  visualMetricTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2
  },
  visualMetricSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#A9A08C'
  },
  bottomSection: {
    marginTop: 20
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(243, 238, 226, 0.17)'
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#58A68C'
  },
  actionBtn: {
    backgroundColor: '#58A68C',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  actionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#16301E',
    fontWeight: '800'
  }
});
