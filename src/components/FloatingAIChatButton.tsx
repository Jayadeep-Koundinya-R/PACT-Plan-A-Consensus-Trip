import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAIChatStore } from '../store/useAIChatStore';
import { usePactHaptics } from '../hooks/usePactHaptics';

export const FloatingAIChatButton: React.FC = () => {
  const { openAIChat, isOpen } = useAIChatStore();
  const haptics = usePactHaptics();

  if (isOpen) return null;

  return (
    <TouchableOpacity
      onPress={() => {
        haptics.action();
        openAIChat();
      }}
      activeOpacity={0.85}
      style={styles.floatingContainer}
    >
      <View style={styles.glowAura} />
      <View style={styles.fabButton}>
        <Sparkles size={18} color="#0C1120" strokeWidth={2.5} />
        <Text style={styles.fabText}>Ask Gemini</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 9998,
    alignItems: 'center',
    justifyContent: 'center'
  },
  glowAura: {
    position: 'absolute',
    width: 130,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(240, 178, 74, 0.35)',
    shadowColor: '#F0B24A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0B24A',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FFECC2',
    elevation: 8
  },
  fabText: {
    color: '#0C1120',
    fontSize: 14,
    fontWeight: '800'
  }
});
