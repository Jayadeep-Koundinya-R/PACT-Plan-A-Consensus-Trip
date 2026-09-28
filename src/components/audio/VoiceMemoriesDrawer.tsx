import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { X, Mic, Volume2 } from 'lucide-react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import { VoiceCapsuleRecorder } from './VoiceCapsuleRecorder';
import { VoiceCapsuleList, VoiceCapsuleItem } from './VoiceCapsuleList';

export interface VoiceMemoriesDrawerProps {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
}

export function VoiceMemoriesDrawer({ visible, onClose, groupId }: VoiceMemoriesDrawerProps) {
  const [voiceCapsules, setVoiceCapsules] = useState<VoiceCapsuleItem[]>([]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.drawerCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Mic size={18} color="#FF5A5F" />
              </View>
              <View>
                <Text style={styles.title}>Voice Memories</Text>
                <Text style={styles.subtitle}>Micro-audio moments for this circle</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#8B8D98" />
            </TouchableOpacity>
          </View>

          {/* Web Helper Pill */}
          {Platform.OS === 'web' && (
            <View style={styles.webHelperPill}>
              <Mic size={12} color="#FF5A5F" />
              <Text style={styles.webHelperText}>
                Voice capsules optimized for mobile devices
              </Text>
            </View>
          )}

          {/* Recorder */}
          <VoiceCapsuleRecorder
            onRecordingComplete={(newCap) => {
              setVoiceCapsules((prev) => [
                {
                  id: newCap.id,
                  authorName: newCap.authorName,
                  durationSeconds: newCap.durationSeconds,
                  createdAt: newCap.createdAt
                },
                ...prev
              ]);
            }}
          />

          {/* List */}
          <VoiceCapsuleList capsules={voiceCapsules} />
        </View>
      </View>
    </Modal>
  );
}

export default VoiceMemoriesDrawer;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 6, 8, 0.75)'
  },
  backdrop: {
    flex: 1
  },
  drawerCard: {
    backgroundColor: '#090A0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#262938',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '80%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  subtitle: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  webHelperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    marginBottom: 12,
    alignSelf: 'center'
  },
  webHelperText: {
    fontSize: 11,
    fontFamily: fontUIBold,
    color: '#FF5A5F'
  }
});
