import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import { Mic, Square, Sparkles } from 'lucide-react-native';
import { usePactHaptics } from '../../hooks/usePactHaptics';
import { getActiveUserName } from '../../lib/user/identity';

export interface VoiceCapsuleRecorderProps {
  onRecordingComplete: (capsule: {
    id: string;
    authorName: string;
    durationSeconds: number;
    createdAt: string;
    audioUri?: string;
  }) => void;
}

export const VoiceCapsuleRecorder: React.FC<VoiceCapsuleRecorderProps> = ({
  onRecordingComplete
}) => {
  const haptics = usePactHaptics();
  const [isRecording, setIsRecording] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    haptics.action();
    setIsRecording(true);
    setRemainingSeconds(30);

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

    const recordedDuration = 30 - remainingSeconds;
    const durationToReport = recordedDuration > 0 ? recordedDuration : 5;

    const authorName = getActiveUserName() || 'Traveler';

    onRecordingComplete({
      id: `capsule_${Date.now()}`,
      authorName,
      durationSeconds: durationToReport,
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

      {/* Main Hold / Tap to Record Circular Button */}
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

      <Text style={styles.btnInstructionText}>
        {isRecording ? 'Tap to Lock Capsule' : 'Tap to Start Recording (30s Limit)'}
      </Text>
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
    marginBottom: 14,
    textAlign: 'center'
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
    elevation: 6,
    marginBottom: 8
  },
  recordCircleBtnActive: {
    backgroundColor: '#3DE0A0',
    shadowColor: '#3DE0A0'
  },
  btnInstructionText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98'
  }
});
