import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Platform, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePactHaptics } from '../hooks/usePactHaptics';
import { fontUI, fontUIBold } from '../theme/typography';
import { X, Mic, ChevronDown, Sparkles } from 'lucide-react-native';

export interface VoiceMemoriesDrawerProps {
  visible: boolean;
  onClose: () => void;
  circleId: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.5;

export const VoiceMemoriesDrawer: React.FC<VoiceMemoriesDrawerProps> = ({
  visible,
  onClose,
  circleId
}) => {
  const { theme } = useTheme();
  const haptics = usePactHaptics();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.drawer, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <View style={styles.titleRow}>
              <Sparkles size={14} color="#FF5A5F" />
              <Text style={[styles.title, { color: theme.textPrimary }]}>Voice Memories</Text>
            </View>
          </View>
          
          <View style={[styles.content, { backgroundColor: theme.surfaceSubtle }]}>
            <Mic size={40} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Recordings Yet</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Record voice messages to capture trip moments.
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={() => { haptics.tap(); onClose(); }} style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}>
            <ChevronDown size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  drawer: { height: DRAWER_HEIGHT, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  handleContainer: { alignItems: 'center', marginBottom: 16 },
  handle: { width: 36, height: 4, borderRadius: 2, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fontUIBold, fontSize: 18, fontWeight: '800' },
  content: { flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontFamily: fontUIBold, fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyDesc: { fontFamily: fontUI, fontSize: 13, textAlign: 'center', marginTop: 6 },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }
});

export default VoiceMemoriesDrawer;