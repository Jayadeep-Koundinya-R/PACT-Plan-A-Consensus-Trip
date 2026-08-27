import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Share,
  Platform
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { BellRing, X, Copy, Check, Send, Sparkles, Users } from 'lucide-react-native';

interface NudgeModalProps {
  visible: boolean;
  groupName: string;
  inviteCode: string;
  respondedCount: number;
  totalCount: number;
  pendingMemberNames: string[];
  isDarkMode?: boolean;
  onClose: () => void;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({
  visible,
  groupName,
  inviteCode,
  respondedCount,
  totalCount,
  pendingMemberNames,
  isDarkMode = false,
  onClose
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [copied, setCopied] = useState(false);

  const missingNames = pendingMemberNames.length > 0
    ? pendingMemberNames.join(' & ')
    : 'friends';

  const defaultNudgeMessage = `Hey ${missingNames}! 👋\n\n${respondedCount}/${totalCount} of us have submitted our dates & budgets for "${groupName}".\n\nDrop your private constraints in PACT so the consensus engine can rank the best options for everyone:\n👉 Join Code: ${inviteCode}\n👉 App link: https://pact.app/invite/${inviteCode}\n\n(Everything is 100% private — no peer pressure!)`;

  const handleCopy = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(defaultNudgeMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        alert(defaultNudgeMessage);
      }
    } else {
      try {
        await Share.share({
          message: defaultNudgeMessage,
          title: `Friendly Reminder: ${groupName}`
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
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.lg
          ]}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconBox, { backgroundColor: theme.secondaryLight }]}>
                <BellRing size={24} color={theme.secondary} />
              </View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Zero-Guilt Nudge
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Send a friendly reminder to members who haven't submitted their private constraints yet.
              </Text>
            </View>

            {/* Status Pill */}
            <View style={[styles.statusBox, { backgroundColor: theme.surfaceSubtle }]}>
              <Users size={16} color={theme.primary} />
              <Text style={[styles.statusBoxText, { color: theme.textPrimary }]}>
                <Text style={{ fontWeight: '800' }}>{respondedCount}/{totalCount} Responded</Text> • Waiting on: {pendingMemberNames.join(', ') || 'Pending members'}
              </Text>
            </View>

            {/* Pre-written message box */}
            <View style={styles.messageSection}>
              <View style={styles.messageHeaderRow}>
                <Sparkles size={14} color={theme.primary} />
                <Text style={[styles.messageHeaderTitle, { color: theme.primary }]}>
                  PRE-WRITTEN GENTLE NUDGE
                </Text>
              </View>

              <View
                style={[
                  styles.messageCard,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
                ]}
              >
                <Text style={[styles.messageText, { color: theme.textPrimary }]}>
                  {defaultNudgeMessage}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopy}
              style={[styles.actionBtn, { backgroundColor: theme.primary }, shadows.md]}
            >
              {copied ? (
                <Check size={18} color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" />
              )}
              <Text style={styles.actionBtnText}>
                {copied ? 'Copied to Clipboard!' : 'Send Nudge to WhatsApp / Group'}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radius.card,
    padding: 24,
    borderWidth: 1,
    maxHeight: '90%'
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4
  },
  header: {
    alignItems: 'center',
    marginBottom: 16
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 16
  },
  statusBoxText: {
    fontSize: 12
  },
  messageSection: {
    marginBottom: 20
  },
  messageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  messageHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  messageCard: {
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
