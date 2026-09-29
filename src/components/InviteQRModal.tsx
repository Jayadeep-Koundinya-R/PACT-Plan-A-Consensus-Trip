import { useShareInvite } from '../hooks/useShareInvite';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
  StatusBar
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { QrCode, X, Copy, Check, Share2, Compass, ShieldCheck } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface InviteQRModalProps {
  visible: boolean;
  groupName: string;
  inviteCode: string;
  isDarkMode?: boolean;
  onClose: () => void;
}

export const InviteQRModal: React.FC<InviteQRModalProps> = ({
  visible,
  groupName,
  inviteCode,
  isDarkMode = false,
  onClose
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [copied, setCopied] = useState(false);
  const { copyInviteLink, shareInvite } = useShareInvite();

  const inviteLink = `https://pact.travel/join/${inviteCode}`;
  const shareText = `🌴 You're invited to join "${groupName}" on PACT!\n\nJoin privately to submit your dates, budget, and tags:\n👉 Code: ${inviteCode}\n👉 Link: ${inviteLink}`;

  const handleCopyLink = async () => {
    const url = `https://pact.travel/join/${inviteCode}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        await Clipboard.setStringAsync(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (e) {
      const success = await copyInviteLink(inviteCode);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }
    }
  };

  const handleNativeShare = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Share.share({
          title: `Join ${groupName} on PACT`,
          message: shareText,
          url: inviteLink
        }, {
          dialogTitle: `Invite friends to ${groupName}`
        });
      } catch (e) {
        await shareInvite({ groupName, inviteCode });
      }
    } else {
      await shareInvite({ groupName, inviteCode });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 20
            },
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
              <View style={[styles.brandIconBox, { backgroundColor: theme.primary }]}>
                <Compass size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Circle Invite Pass
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {groupName}
              </Text>
            </View>

            {/* Visual QR Code Badge Representation */}
            <View
              style={[
                styles.qrCard,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
              ]}
            >
              <View style={[styles.qrCodeBox, { backgroundColor: '#FFFFFF' }]}>
                {/* SVG/Vector-styled QR representation */}
                <QrCode size={130} color="#090A0F" />
              </View>

              <View style={styles.codeRow}>
                <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>
                  SHARE CODE:
                </Text>
                <Text style={[styles.codeValue, { color: theme.primary }]}>
                  {inviteCode}
                </Text>
              </View>
            </View>

            {/* Privacy Promise */}
            <View style={[styles.privacyBox, { backgroundColor: theme.primaryLight }]}>
              <ShieldCheck size={16} color={theme.primary} />
              <Text style={[styles.privacyText, { color: theme.primaryDark }]}>
                Friends submit privately. No one sees individual budgets or dealbreakers.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCopyLink}
                style={[styles.actionBtn, { backgroundColor: theme.primary }, shadows.md]}
              >
                {copied ? (
                  <Check size={16} color="#FFFFFF" />
                ) : (
                  <Copy size={16} color="#FFFFFF" />
                )}
                <Text style={styles.actionBtnText}>
                  {copied ? 'Copied Link!' : 'Copy Invite Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNativeShare}
                accessibilityLabel="Share invite via device sheet"
                style={[styles.secondaryActionBtn, { backgroundColor: theme.surfaceSubtle }]}
              >
                <Share2 size={16} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {copied && (
              <View style={styles.copyToastBadge}>
                <Check size={12} color="#3DE0A0" />
                <Text style={styles.copyToastText}>Invite link copied to clipboard!</Text>
              </View>
            )}
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
    maxWidth: 420,
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
  brandIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2
  },
  qrCard: {
    borderRadius: radius.md,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 14
  },
  qrCodeBox: {
    padding: 14,
    borderRadius: radius.md,
    marginBottom: 12
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 16
  },
  privacyText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
    fontWeight: '600'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtn: {
    flex: 1,
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
  },
  secondaryActionBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.btn,
    justifyContent: 'center',
    alignItems: 'center'
  },
  copyToastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.35)',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 10
  },
  copyToastText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3DE0A0'
  }
});
