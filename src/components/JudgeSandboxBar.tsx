import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { Crown, Zap, RotateCcw, FileText, ChevronDown, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows } from '../theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { useUserStore } from '../store/useUserStore';
import { useCircleStore } from '../store/useCircleStore';
import { updateActiveUserName } from '../lib/user/identity';
import { DemoScriptModal } from './DemoScriptModal';

export interface JudgePersona {
  id: string;
  name: string;
  role: string;
  badge: string;
  description: string;
  budget: string;
  tagline: string;
}

export const JUDGE_PERSONAS: JudgePersona[] = [
  {
    id: 'user-maya-001',
    name: 'Maya',
    role: 'Organizer',
    badge: '👑 ORGANIZER',
    description: 'Circle creator, controls finalization & Organizer Pass.',
    budget: '$800 – $1,800',
    tagline: 'Wants consensus without drama'
  },
  {
    id: 'user-jake-002',
    name: 'Jake',
    role: 'Dealbreaker Veto',
    badge: '🚫 DEALBREAKER',
    description: 'Strict veto on cold & mountain destinations. Tests Pareto filter.',
    budget: '$600 – $1,200',
    tagline: 'Vetoes cold weather'
  },
  {
    id: 'user-priya-003',
    name: 'Priya',
    role: 'Strict Budget',
    badge: '💰 BUDGET CAP',
    description: 'Firm $700 cap. Tests financial overlap & AI Compromise Whisperer.',
    budget: '$300 – $700',
    tagline: 'Tight budget ceiling'
  },
  {
    id: 'user-alex-004',
    name: 'Alex',
    role: 'High-Budget Explorer',
    badge: '🏔️ LUXURY / VIBE',
    description: 'High budget ($2,500), prioritizes nightlife & beach luxury.',
    budget: '$1,500 – $3,000',
    tagline: 'Prefers premium stays'
  },
  {
    id: 'user-sam-005',
    name: 'Sam',
    role: 'Flexible Traveler',
    badge: '✨ FLEXIBLE',
    description: 'Open to any destination. Tests silent ballot voting speed.',
    budget: '$500 – $1,500',
    tagline: 'Goes with the flow'
  }
];

interface JudgeSandboxBarProps {
  circleId?: string;
  onFastForward?: () => void;
  onReset?: () => void;
}

export const JudgeSandboxBar: React.FC<JudgeSandboxBarProps> = ({
  circleId,
  onFastForward,
  onReset
}) => {
  const currentUserId = useGatherlyStore((s) => s.currentUserId) || 'user-maya-001';
  const setDemoScenario = useGatherlyStore((s) => s.setDemoScenario);
  const [isPersonaModalVisible, setIsPersonaModalVisible] = useState(false);
  const [isScriptModalVisible, setIsScriptModalVisible] = useState(false);

  const activePersona =
    JUDGE_PERSONAS.find((p) => p.id === currentUserId) || JUDGE_PERSONAS[0];

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
    }
  };

  const handleSelectPersona = (persona: JudgePersona) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    // 1. Sync useGatherlyStore
    useGatherlyStore.setState({
      currentUserId: persona.id,
      userName: persona.name
    });

    // 2. Sync useUserStore
    const userProfile = useUserStore.getState().profile;
    useUserStore.getState().setProfile({
      ...userProfile,
      userId: persona.id,
      displayName: persona.name
    });

    // 3. Update unified identity resolver
    updateActiveUserName(persona.name);

    setIsPersonaModalVisible(false);

    if (Platform.OS !== 'web') {
      Alert.alert(
        `Switched to ${persona.name}`,
        `Now testing as ${persona.name} (${persona.role}). Your private constraints and silent votes reflect this persona.`
      );
    }
  };

  const handleTriggerFastForward = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setDemoScenario('consensus');

    if (onFastForward) {
      onFastForward();
    } else {
      Alert.alert(
        '⚡ Consensus Fast-Forward Active',
        'Simulated 100% agreement across all 5 travelers. Goa Beach Escape reaches supermajority!'
      );
    }
  };

  const handleTriggerReset = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    useCircleStore.getState().loadDemoCircle();
    useGatherlyStore.getState().resetDemoState();

    if (onReset) {
      onReset();
    } else {
      Alert.alert('🔄 Demo Reset', 'Circle restored to initial early-bird state.');
    }
  };

  return (
    <>
      <View style={styles.barContainer}>
        {/* Left: Judge Mode Pill & Active Persona */}
        <View style={styles.leftSection}>
          <View style={styles.judgeBadge}>
            <Zap size={11} color="#D4AF37" fill="#D4AF37" />
            <Text style={styles.judgeBadgeText}>JUDGE SANDBOX</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic();
              setIsPersonaModalVisible(true);
            }}
            style={styles.personaSelectorPill}
            accessibilityRole="button"
            accessibilityLabel={`Active Persona: ${activePersona.name}, tap to switch persona`}
          >
            <Text style={styles.personaNameText}>{activePersona.name}</Text>
            <Text style={styles.personaRoleSub}>({activePersona.role})</Text>
            <ChevronDown size={13} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Right: 1-Click Fast Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTriggerFastForward}
            style={styles.actionBtnConsensus}
            accessibilityRole="button"
            accessibilityLabel="Fast Forward to Consensus"
          >
            <Zap size={12} color="#052E20" fill="#052E20" />
            <Text style={styles.actionBtnConsensusText}>Consensus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic();
              setIsScriptModalVisible(true);
            }}
            style={styles.actionBtnIcon}
            accessibilityRole="button"
            accessibilityLabel="Open Judge Teleprompter Script"
          >
            <FileText size={13} color="#D4AF37" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleTriggerReset}
            style={styles.actionBtnIcon}
            accessibilityRole="button"
            accessibilityLabel="Reset Demo Circle"
          >
            <RotateCcw size={12} color="#8B8D98" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Persona Switching Modal */}
      <Modal
        visible={isPersonaModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPersonaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Crown size={18} color="#D4AF37" />
                <Text style={styles.modalTitle}>Switch Traveler Persona</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPersonaModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close Persona Switcher"
              >
                <X size={18} color="#8B8D98" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Test multi-user consensus from each traveler’s perspective with zero setup.
            </Text>

            <View style={styles.personasList}>
              {JUDGE_PERSONAS.map((persona) => {
                const isSelected = persona.id === activePersona.id;
                return (
                  <TouchableOpacity
                    key={persona.id}
                    activeOpacity={0.85}
                    onPress={() => handleSelectPersona(persona)}
                    style={[
                      styles.personaCard,
                      isSelected && styles.personaCardSelected
                    ]}
                  >
                    <View style={styles.personaCardTop}>
                      <View style={styles.personaCardInfo}>
                        <View style={styles.personaNameRow}>
                          <Text style={[styles.personaCardName, isSelected && { color: '#3DE0A0' }]}>
                            {persona.name}
                          </Text>
                          <View style={styles.personaBadge}>
                            <Text style={styles.personaBadgeText}>{persona.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.personaBudget}>Budget: {persona.budget}</Text>
                      </View>
                      {isSelected ? (
                        <View style={styles.activeCheckCircle}>
                          <Check size={14} color="#052E20" strokeWidth={3} />
                        </View>
                      ) : (
                        <View style={styles.inactiveCircle} />
                      )}
                    </View>
                    <Text style={styles.personaDescription}>{persona.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Judge Pitch Teleprompter Modal */}
      <DemoScriptModal
        visible={isScriptModalVisible}
        isDarkMode={true}
        onClose={() => setIsScriptModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: '#12141D',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  judgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  judgeBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#D4AF37',
    letterSpacing: 0.5
  },
  personaSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  personaNameText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0'
  },
  personaRoleSub: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#8B8D98'
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionBtnConsensus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  actionBtnConsensusText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#052E20'
  },
  actionBtnIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#13151E',
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 18,
    ...shadows.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  modalTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    color: '#F4F3F0'
  },
  modalCloseBtn: {
    padding: 4
  },
  modalSubtitle: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    marginBottom: 14,
    lineHeight: 16
  },
  personasList: {
    gap: 8
  },
  personaCard: {
    backgroundColor: '#1A1C26',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12
  },
  personaCardSelected: {
    borderColor: '#3DE0A0',
    backgroundColor: 'rgba(61, 224, 160, 0.06)'
  },
  personaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  personaCardInfo: {
    flex: 1
  },
  personaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  personaCardName: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#F4F3F0'
  },
  personaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  personaBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#D4AF37'
  },
  personaBudget: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#3DE0A0',
    marginTop: 2
  },
  personaDescription: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    lineHeight: 15
  },
  activeCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3DE0A0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inactiveCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1
  }
});
