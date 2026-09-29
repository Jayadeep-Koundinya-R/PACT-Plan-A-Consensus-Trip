import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import { Mic, Square, Check } from 'lucide-react-native';
import { usePactHaptics } from '../../hooks/usePactHaptics';
import { getActiveUserName } from '../../lib/user/identity';

export interface VoiceCapsuleRecorderProps {
  onRecordingComplete: (capsule: {
    id: string;
    authorName: string;
    durationSeconds: number;
    createdAt: string;
    audioUri?: string;
    displayMeta?: string;
    note?: string;
  }) => void;
}

export const VoiceCapsuleRecorder: React.FC<VoiceCapsuleRecorderProps> = ({
  onRecordingComplete
}) => {
  const haptics = usePactHaptics();
  const [isRecording, setIsRecording] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pulsating ring animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // 8-bar equalizer oscillating heights
  const barHeights = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(6))
  ).current;
  const barLoopsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pulseLoopRef.current) pulseLoopRef.current.stop();
      barLoopsRef.current.forEach((anim) => anim.stop());
    };
  }, []);

  const startWaveformAnimation = () => {
    // Pulsating ring animation
    pulseAnim.setValue(1);
    pulseOpacity.setValue(0.7);
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.45,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false
        })
      ])
    );
    pulseLoopRef.current = pulseLoop;
    pulseLoop.start();

    // 8-bar equalizer random / staggered oscillating heights
    const maxHeights = [24, 32, 20, 36, 28, 34, 18, 26];
    const durations = [320, 260, 380, 290, 340, 270, 360, 310];

    barLoopsRef.current = barHeights.map((bar, idx) => {
      const maxH = maxHeights[idx] || 24;
      const dur = durations[idx] || 300;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: maxH,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          }),
          Animated.timing(bar, {
            toValue: 6,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false
          })
        ])
      );
      loop.start();
      return loop;
    });
  };

  const stopWaveformAnimation = () => {
    if (pulseLoopRef.current) {
      pulseLoopRef.current.stop();
      pulseLoopRef.current = null;
    }
    pulseAnim.setValue(1);
    pulseOpacity.setValue(0);

    barLoopsRef.current.forEach((anim) => anim.stop());
    barLoopsRef.current = [];
    barHeights.forEach((bar) => {
      Animated.timing(bar, {
        toValue: 6,
        duration: 200,
        useNativeDriver: false
      }).start();
    });
  };

  const startRecording = async () => {
    haptics.action();
    setIsRecording(true);
    setRemainingSeconds(30);
    startWaveformAnimation();

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isRecording) return;

    haptics.success();
    setIsRecording(false);
    stopWaveformAnimation();

    const recordedDuration = 30 - remainingSeconds;
    const durationToReport = recordedDuration > 0 ? recordedDuration : 5;

    const authorName = getActiveUserName() || 'You';
    const mins = Math.floor(durationToReport / 60);
    const secs = durationToReport % 60;
    const displayMeta = `${mins}:${secs < 10 ? '0' : ''}${secs} • Recorded by ${authorName}`;

    onRecordingComplete({
      id: `capsule_${Date.now()}`,
      authorName,
      durationSeconds: durationToReport,
      displayMeta,
      createdAt: new Date().toISOString()
    });

    setRemainingSeconds(30);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topInfoRow}>
        <View style={styles.titleGroup}>
          <Mic size={16} color="#FF5A5F" />
          <Text style={styles.titleText}>Micro-Voice Capsule (30s max)</Text>
        </View>

        <Text style={[styles.timerText, isRecording && styles.timerTextActive]}>
          {formatTimer(remainingSeconds)}
        </Text>
      </View>

      <Text style={styles.subtext}>
        {isRecording
          ? 'Recording in progress... Tap to lock capsule.'
          : 'Record 30s tactile audio moment for your circle.'}
      </Text>

      {/* 8-Bar Equalizer Live Waveform Simulation */}
      <View style={styles.equalizerRow}>
        {barHeights.map((h, i) => (
          <Animated.View
            key={i}
            style={[
              styles.equalizerBar,
              {
                height: h,
                backgroundColor: isRecording ? '#FF5A5F' : '#262938'
              }
            ]}
          />
        ))}
      </View>

      {/* Main Hold / Tap to Record Circular Button with Pulsating Ring */}
      <View style={styles.recordBtnWrapper}>
        {isRecording && (
          <Animated.View
            style={[
              styles.pulsatingRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseOpacity
              }
            ]}
          />
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          }}
          style={[
            styles.recordCircleBtn,
            isRecording && styles.recordCircleBtnActive
          ]}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Stop Recording' : 'Start 30s Voice Capsule Recording'}
        >
          {isRecording ? (
            <Square size={22} color="#050608" fill="#050608" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.btnInstructionText}>
        {isRecording ? 'Tap center or Save below to lock capsule' : 'Tap to Start Recording (30s Limit)'}
      </Text>

      {/* Dedicated Save Voice Capsule CTA when recording */}
      {isRecording && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={stopRecording}
          style={styles.saveCapsuleBtn}
          accessibilityRole="button"
          accessibilityLabel="Save Voice Capsule"
        >
          <Check size={16} color="#050608" />
          <Text style={styles.saveCapsuleBtnText}>Save Voice Capsule</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  topInfoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  titleText: {
    fontFamily: fontDisplay,
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  timerText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#8B8D98'
  },
  timerTextActive: {
    color: '#FF5A5F',
    fontWeight: '800'
  },
  subtext: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98',
    marginBottom: 12,
    textAlign: 'center'
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    marginBottom: 14
  },
  equalizerBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 6
  },
  recordBtnWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8
  },
  pulsatingRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#FF5A5F'
  },
  recordCircleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  recordCircleBtnActive: {
    backgroundColor: '#3DE0A0',
    shadowColor: '#3DE0A0'
  },
  btnInstructionText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98',
    marginBottom: 8
  },
  saveCapsuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3DE0A0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#3DE0A0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  saveCapsuleBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#050608',
    fontWeight: '800'
  }
});
