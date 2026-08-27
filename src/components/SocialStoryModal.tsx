import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
  Share
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import {
  X,
  Sparkles,
  Download,
  Share2,
  Check,
  Compass,
  Calendar,
  DollarSign,
  Users,
  Award
} from 'lucide-react-native';

interface SocialStoryModalProps {
  visible: boolean;
  groupName: string;
  destinationName: string;
  dates: string;
  budget: string;
  participants: string[];
  tags: string[];
  isDarkMode?: boolean;
  onClose: () => void;
}

export const SocialStoryModal: React.FC<SocialStoryModalProps> = ({
  visible,
  groupName,
  destinationName,
  dates,
  budget,
  participants,
  tags,
  isDarkMode = true,
  onClose
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [copied, setCopied] = useState(false);

  const storyText = `🌴 WE ARE GOING TO ${destinationName.toUpperCase()}! ✈️\n\nGroup: ${groupName}\nDates: ${dates}\nTarget: ${budget}\nCrew: ${participants.join(', ')}\n\n✨ Planned with 100% consensus in PACT!`;

  const handleCopyOrShare = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(storyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        alert(storyText);
      }
    } else {
      try {
        await Share.share({
          message: storyText,
          title: `Trip to ${destinationName}`
        });
      } catch (e) {}
    }
  };

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
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Text style={[styles.topTitle, { color: theme.textPrimary }]}>
              Social Story Card (9:16)
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 9:16 Story Card Frame */}
            <View
              style={[
                styles.storyFrame,
                {
                  backgroundColor: '#0B0F17',
                  borderColor: theme.primary
                },
                shadows.glowPrimary
              ]}
            >
              {/* Card Header */}
              <View style={styles.storyHeader}>
                <View style={styles.brandRow}>
                  <View style={[styles.iconCircle, { backgroundColor: '#0EA5E9' }]}>
                    <Compass size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.brandText}>PACT</Text>
                </View>
                <View style={styles.consensusSeal}>
                  <Award size={12} color="#10B981" />
                  <Text style={styles.consensusSealText}>100% CONSENSUS</Text>
                </View>
              </View>

              {/* Group Name */}
              <Text style={styles.groupLabel}>{groupName.toUpperCase()}</Text>

              {/* Destination Highlight */}
              <Text style={styles.destinationTitle}>{destinationName}</Text>

              {/* Stats Box */}
              <View style={styles.statsBox}>
                <View style={styles.statItem}>
                  <Calendar size={14} color="#0EA5E9" />
                  <Text style={styles.statText}>{dates}</Text>
                </View>
                <View style={styles.statItem}>
                  <DollarSign size={14} color="#10B981" />
                  <Text style={styles.statText}>{budget} / person</Text>
                </View>
              </View>

              {/* Crew Row */}
              <View style={styles.crewSection}>
                <Text style={styles.crewLabel}>CONFIRMED CREW:</Text>
                <View style={styles.crewChipsRow}>
                  {participants.map((p) => (
                    <View key={p} style={styles.crewChip}>
                      <Text style={styles.crewChipText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tag Vibes */}
              <View style={styles.tagsRow}>
                {tags.map((t) => (
                  <Text key={t} style={styles.tagText}>
                    #{t}
                  </Text>
                ))}
              </View>

              {/* Footer */}
              <View style={styles.storyFooter}>
                <Sparkles size={14} color="#F59E0B" />
                <Text style={styles.footerText}>Made with PACT • Plan A Consensus Trip</Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopyOrShare}
              style={[styles.shareBtn, { backgroundColor: theme.primary }, shadows.glowPrimary]}
            >
              {copied ? (
                <Check size={18} color="#FFFFFF" />
              ) : (
                <Share2 size={18} color="#FFFFFF" />
              )}
              <Text style={styles.shareBtnText}>
                {copied ? 'Story Copied!' : 'Share to Instagram / WhatsApp'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    maxHeight: '92%'
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  scrollBody: {
    alignItems: 'center'
  },
  storyFrame: {
    width: 280,
    height: 440,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    justifyContent: 'space-between',
    marginBottom: 16
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1
  },
  consensusSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  consensusSealText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800'
  },
  groupLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8
  },
  destinationTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30
  },
  statsBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700'
  },
  crewSection: {
    marginTop: 4
  },
  crewLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  crewChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  crewChip: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  crewChipText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700'
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6
  },
  tagText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600'
  },
  storyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  footerText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600'
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.btn,
    width: '100%'
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
