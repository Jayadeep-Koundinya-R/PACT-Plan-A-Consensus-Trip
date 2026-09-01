import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { CompromiseProposal } from '../lib/ai/compromiseEngine';
import { colors, radius, shadows } from '../theme/colors';
import {
  Sparkles,
  X,
  Compass,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Zap,
  Tag
} from 'lucide-react-native';

interface AICompromiseModalProps {
  visible: boolean;
  groupId: string;
  isDarkMode?: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export const AICompromiseModal: React.FC<AICompromiseModalProps> = ({
  visible,
  groupId,
  isDarkMode = false,
  onClose,
  onApplied
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const { generateAICompromise, applyAICompromise } = useGatherlyStore();

  const [stage, setStage] = useState<'analyzing' | 'proposal' | 'applied'>('analyzing');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [proposal, setProposal] = useState<CompromiseProposal | null>(null);

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (visible) {
      setStage('analyzing');
      setAnalysisStep(0);
      
      const t1 = setTimeout(() => setAnalysisStep(1), 700);
      const t2 = setTimeout(() => setAnalysisStep(2), 1400);
      const t3 = setTimeout(() => {
        const prop = generateAICompromise(groupId);
        setProposal(prop);
        setStage('proposal');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      }, 2100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [visible, groupId]);

  const handleApply = () => {
    if (!proposal) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    applyAICompromise(proposal);
    setStage('applied');
    setTimeout(() => {
      onClose();
      if (onApplied) onApplied();
    }, 1500);
  };

  const stepsText = [
    'Extracting hidden budget ceilings & available date ranges...',
    'Evaluating 120+ constraint combinations & dealbreaker filters...',
    'Synthesizing optimal shoulder-season bridge compromise...'
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.lg
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.aiBadge, { backgroundColor: theme.primary }]}>
                <Sparkles size={14} color="#FFFFFF" />
              </View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                AI Compromise Whisperer
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 1. Analyzing Animation State */}
          {stage === 'analyzing' && (
            <View style={styles.analyzingBox}>
              <View style={[styles.pulseCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }, shadows.glowPrimary]}>
                <BrainCircuit size={36} color={theme.primary} />
              </View>
              <Text style={[styles.analyzingTitle, { color: theme.textPrimary }]}>
                AI Solving Group Deadlock...
              </Text>
              <Text style={[styles.analyzingSubtitle, { color: theme.textSecondary }]}>
                Cross-referencing all members' private preferences without revealing sensitive data.
              </Text>

              {/* Progress Steps */}
              <View style={styles.stepsList}>
                {stepsText.map((txt, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    {idx <= analysisStep ? (
                      <CheckCircle2 size={16} color={theme.primary} />
                    ) : (
                      <ActivityIndicator size="small" color={theme.textMuted} />
                    )}
                    <Text
                      style={[
                        styles.stepText,
                        { color: idx <= analysisStep ? theme.textPrimary : theme.textMuted }
                      ]}
                    >
                      {txt}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 2. Proposal State */}
          {stage === 'proposal' && proposal && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.proposalScroll}>
              {/* Match Score Banner */}
              <View style={[styles.matchBanner, { backgroundColor: isDarkMode ? '#14291E' : '#DCFCE7', borderColor: '#22C55E' }]}>
                <Sparkles size={16} color="#16A34A" />
                <Text style={styles.matchBannerText}>
                  {proposal.projectedConsensusPercent}% Projected Group Consensus
                </Text>
              </View>

              {/* Destination Card */}
              <View style={[styles.destCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                <Text style={[styles.destName, { color: theme.textPrimary }]}>
                  {proposal.option.name}
                </Text>
                <Text style={[styles.destDesc, { color: theme.textSecondary }]}>
                  {proposal.option.description}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={theme.primary} />
                    <Text style={[styles.metaText, { color: theme.textPrimary }]}>
                      {proposal.option.dateStart} to {proposal.option.dateEnd}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <DollarSign size={14} color={theme.success} />
                    <Text style={[styles.metaText, { color: theme.success, fontWeight: '800' }]}>
                      ${proposal.option.budgetPerPerson} / person
                    </Text>
                  </View>
                </View>
              </View>

              {/* The Trade-Off Rationale */}
              <View style={[styles.tradeOffCard, { backgroundColor: isDarkMode ? '#1A202C' : '#FFF7ED', borderColor: theme.primary }]}>
                <View style={styles.tradeOffHeader}>
                  <Zap size={15} color={theme.primary} />
                  <Text style={[styles.tradeOffTitle, { color: theme.primary }]}>
                    The Mathematical Compromise
                  </Text>
                </View>
                <Text style={[styles.tradeOffText, { color: theme.textPrimary }]}>
                  {proposal.tradeOffSummary}
                </Text>
              </View>

              {/* Member Breakdown */}
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Why This Works for Every Traveler
              </Text>
              <View style={styles.membersBreakdown}>
                {proposal.memberSatisfactions.map((m) => (
                  <View
                    key={m.userId}
                    style={[styles.memberItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                  >
                    <View style={styles.memberTop}>
                      <Text style={[styles.memberName, { color: theme.textPrimary }]}>
                        {m.userName}
                      </Text>
                      <View style={[styles.memberScoreBadge, { backgroundColor: theme.primaryLight }]}>
                        <Text style={[styles.memberScoreText, { color: theme.primary }]}>
                          {m.satisfactionPercent}% fit
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.memberReason, { color: theme.textSecondary }]}>
                      {m.reason}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleApply}
                style={[styles.applyBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
              >
                <Sparkles size={18} color="#FFFFFF" />
                <Text style={styles.applyBtnText}>
                  Add to Group Ballot & Vote Yes
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* 3. Applied Confirmation State */}
          {stage === 'applied' && (
            <View style={styles.appliedBox}>
              <View style={[styles.successCircle, { backgroundColor: '#22C55E' }]}>
                <CheckCircle2 size={40} color="#FFFFFF" />
              </View>
              <Text style={[styles.appliedTitle, { color: theme.textPrimary }]}>
                Compromise Added to Ballot!
              </Text>
              <Text style={[styles.appliedSubtitle, { color: theme.textSecondary }]}>
                The AI compromise has been added to the ranked destination list with your approval vote cast.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  aiBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  analyzingBox: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  pulseCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  analyzingTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6
  },
  analyzingSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 20,
    marginBottom: 24
  },
  stepsList: {
    width: '100%',
    gap: 12
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  },
  proposalScroll: {
    width: '100%'
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginBottom: 12
  },
  matchBannerText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800'
  },
  destCard: {
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 12
  },
  destName: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4
  },
  destDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700'
  },
  tradeOffCard: {
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 14
  },
  tradeOffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  tradeOffTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  tradeOffText: {
    fontSize: 12,
    lineHeight: 17
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8
  },
  membersBreakdown: {
    gap: 8,
    marginBottom: 16
  },
  memberItem: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1
  },
  memberTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  memberName: {
    fontSize: 12,
    fontWeight: '800'
  },
  memberScoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  memberScoreText: {
    fontSize: 10,
    fontWeight: '800'
  },
  memberReason: {
    fontSize: 11,
    lineHeight: 15
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginBottom: 8
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  appliedBox: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  appliedTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6
  },
  appliedSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 20
  }
});
