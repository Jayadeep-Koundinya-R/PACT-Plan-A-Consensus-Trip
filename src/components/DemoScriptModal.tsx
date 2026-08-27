import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { X, Video, Play, Clock, CheckCircle2, Crown, Sparkles } from 'lucide-react-native';

interface DemoScriptModalProps {
  visible: boolean;
  isDarkMode?: boolean;
  onClose: () => void;
}

const TIMELINE = [
  {
    time: '0:00 — 0:20',
    title: '1. The Problem Hook',
    script: '"We\'ve all experienced the WhatsApp trip spiral: 8 friends want to travel, but negotiating budgets and dates publicly causes awkwardness and stalling. Most group trips die before they even start."'
  },
  {
    time: '0:20 — 0:50',
    title: '2. Private Constraints',
    script: '"PACT fixes this by collecting real constraints privately. Notice how Maya, Jake, and Priya set their dates, budgets ($300-$3000), and hard dealbreakers without peer pressure. Raw numbers are never leaked to friends."'
  },
  {
    time: '0:50 — 1:20',
    title: '3. Deterministic Consensus Math',
    script: '"PACT\'s scoring engine mathematically weighs Date Fit (35%), Budget (35%), and Tags (25%). Goa Beach Weekend emerges as the #1 winner at 74.24% with 100% consensus, while Manali is disqualified because of Jake\'s dealbreaker."'
  },
  {
    time: '1:20 — 1:40',
    title: '4. Truly Silent Voting & Brief',
    script: '"In the Silent Voting Room, friends vote with hearts. Individual ballots stay private—only live aggregate totals are shown. Maya finalizes the trip, producing an official Boarding Pass Trip Brief with confetti and 1-tap calendar export."'
  },
  {
    time: '1:40 — 2:00',
    title: '5. RevenueCat Pro Monetization',
    script: '"With RevenueCat, free users get 1 active circle. PACT Pro ($4.99/mo or $39.99/yr) unlocks unlimited circles, calendar exports, and AI-powered natural language conflict diagnoses."'
  }
];

export const DemoScriptModal: React.FC<DemoScriptModalProps> = ({
  visible,
  isDarkMode = true,
  onClose
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
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
            <View style={styles.titleRow}>
              <Video size={20} color={theme.primary} />
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                2-Minute Demo Pitch Teleprompter
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Use this exact script and timestamp sequence when recording your Shipathon 2026 submission video.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timelineList}>
            {TIMELINE.map((item, idx) => (
              <View
                key={item.time}
                style={[
                  styles.timelineCard,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border }
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.timeBadge}>
                    <Clock size={12} color={theme.primary} />
                    <Text style={styles.timeBadgeText}>{item.time}</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    {item.title}
                  </Text>
                </View>

                <Text style={[styles.scriptText, { color: theme.textSecondary }]}>
                  {item.script}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeActionBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
          >
            <Text style={styles.closeActionBtnText}>Ready to Record</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 17,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16
  },
  timelineList: {
    gap: 12,
    paddingBottom: 16
  },
  timelineCard: {
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    gap: 6
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  timeBadgeText: {
    color: '#0EA5E9',
    fontSize: 10,
    fontWeight: '800'
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  scriptText: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic'
  },
  closeActionBtn: {
    paddingVertical: 14,
    borderRadius: radius.btn,
    alignItems: 'center'
  },
  closeActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
