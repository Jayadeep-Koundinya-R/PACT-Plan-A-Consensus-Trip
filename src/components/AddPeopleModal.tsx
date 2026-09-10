import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';
import {
  UserPlus,
  X,
  Copy,
  Check,
  Share2,
  MessageSquare,
  Mail,
  QrCode,
  ShieldCheck,
  Send,
  ExternalLink
} from 'lucide-react-native';
import { colors, radius, shadows } from '../theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';
import { useShareInvite, formatInviteMessage } from '../hooks/useShareInvite';
import { usePactHaptics } from '../hooks/usePactHaptics';

interface AddPeopleModalProps {
  visible: boolean;
  groupName: string;
  inviteCode: string;
  isDarkMode?: boolean;
  onClose: () => void;
  onOpenQR?: () => void;
}

export const AddPeopleModal: React.FC<AddPeopleModalProps> = ({
  visible,
  groupName,
  inviteCode,
  isDarkMode = true,
  onClose,
  onOpenQR
}) => {
  const haptics = usePactHaptics();
  const {
    shareInvite,
    shareToWhatsApp,
    shareViaSMS,
    shareViaEmail,
    copyInviteLink,
    copyInviteCode,
    copiedCode
  } = useShareInvite();

  const [copiedLink, setCopiedLink] = useState(false);
  const joinUrl = `pact://join/${inviteCode}`;

  const handleCopyLink = async () => {
    haptics.tap();
    const success = await copyInviteLink(inviteCode);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    }
  };

  const handleCopyCodeOnly = async () => {
    haptics.tap();
    await copyInviteCode(inviteCode);
  };

  const handleWhatsApp = async () => {
    haptics.action();
    const message = formatInviteMessage(groupName, inviteCode);
    await shareToWhatsApp({ message, inviteCode });
  };

  const handleSMS = async () => {
    haptics.action();
    await shareViaSMS({ groupName, inviteCode });
  };

  const handleEmail = async () => {
    haptics.action();
    await shareViaEmail({ groupName, inviteCode });
  };

  const handleNativeShare = async () => {
    haptics.action();
    await shareInvite({ groupName, inviteCode });
  };

  const handleLaunchQR = () => {
    haptics.tap();
    onClose();
    if (onOpenQR) {
      setTimeout(() => onOpenQR(), 150);
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
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              haptics.tap();
              onClose();
            }}
            accessibilityLabel="Close add people sheet"
          >
            <X size={20} color="#8A8F9E" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInside}>
            {/* Header Badge & Title */}
            <View style={styles.header}>
              <View style={styles.iconBox}>
                <UserPlus size={24} color="#3DE0A0" />
              </View>
              <Text style={styles.title}>Add People to Circle</Text>
              <Text style={styles.subtitle}>
                Invite friends to &ldquo;{groupName}&rdquo;. Anyone with the invite link locks their dates &amp; budget 100% confidentially.
              </Text>
            </View>

            {/* Invite Code & Join Link Card */}
            <View style={styles.codeCard}>
              <View style={styles.codeRow}>
                <View>
                  <Text style={styles.codeLabel}>INVITE CODE</Text>
                  <Text style={styles.codeValue}>{inviteCode}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCopyCodeOnly}
                  style={styles.codeCopyPill}
                >
                  {copiedCode === inviteCode ? (
                    <>
                      <Check size={13} color="#3DE0A0" />
                      <Text style={[styles.codeCopyPillText, { color: '#3DE0A0' }]}>COPIED</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={13} color="#D4AF37" />
                      <Text style={styles.codeCopyPillText}>COPY CODE</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.linkRow}>
                <View style={styles.linkTextWrapper}>
                <Text style={styles.linkLabel}>APP LINK (CODE IS THE FALLBACK)</Text>
                  <Text style={styles.linkUrl} numberOfLines={1} ellipsizeMode="middle">
                    {joinUrl}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCopyLink}
                  style={[styles.linkCopyBtn, copiedLink && styles.linkCopyBtnActive]}
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} color="#090A0F" />
                      <Text style={styles.linkCopyBtnTextActive}>COPIED!</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={14} color="#090A0F" />
                      <Text style={styles.linkCopyBtnText}>COPY LINK</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Fast Native Share Channels */}
            <Text style={styles.sectionHeading}>SHARE PRE-FILLED INVITE</Text>
            <View style={styles.channelsGrid}>
              {/* WhatsApp */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleWhatsApp}
                style={styles.channelTile}
              >
                <View style={[styles.channelIconBox, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                  <Send size={18} color="#25D366" />
                </View>
                <View style={styles.channelTextCol}>
                  <Text style={styles.channelTitle}>WhatsApp</Text>
                  <Text style={styles.channelSub}>1-tap chat / group share</Text>
                </View>
              </TouchableOpacity>

              {/* SMS / Messages */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleSMS}
                style={styles.channelTile}
              >
                <View style={[styles.channelIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <MessageSquare size={18} color="#60A5FA" />
                </View>
                <View style={styles.channelTextCol}>
                  <Text style={styles.channelTitle}>Messages (SMS)</Text>
                  <Text style={styles.channelSub}>Send text invitation</Text>
                </View>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleEmail}
                style={styles.channelTile}
              >
                <View style={[styles.channelIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                  <Mail size={18} color="#C084FC" />
                </View>
                <View style={styles.channelTextCol}>
                  <Text style={styles.channelTitle}>Email</Text>
                  <Text style={styles.channelSub}>Pre-filled email draft</Text>
                </View>
              </TouchableOpacity>

              {/* Native Device Share Sheet */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleNativeShare}
                style={styles.channelTile}
              >
                <View style={[styles.channelIconBox, { backgroundColor: 'rgba(255, 90, 95, 0.15)' }]}>
                  <Share2 size={18} color="#FF5A5F" />
                </View>
                <View style={styles.channelTextCol}>
                  <Text style={styles.channelTitle}>Device Share Sheet</Text>
                  <Text style={styles.channelSub}>AirDrop, Slack, Telegram, etc.</Text>
                </View>
              </TouchableOpacity>

              {/* QR Code Pass */}
              {onOpenQR && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleLaunchQR}
                  style={[styles.channelTile, { borderStyle: 'dashed' }]}
                >
                  <View style={[styles.channelIconBox, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
                    <QrCode size={18} color="#D4AF37" />
                  </View>
                  <View style={styles.channelTextCol}>
                    <Text style={styles.channelTitle}>In-Person QR Pass</Text>
                    <Text style={styles.channelSub}>Scan directly from screen</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Privacy Guarantee Box */}
            <View style={styles.privacyCard}>
              <ShieldCheck size={18} color="#3DE0A0" style={{ marginTop: 1 }} />
              <View style={styles.privacyTextCol}>
                <Text style={styles.privacyTitle}>Private constraints</Text>
                <Text style={styles.privacyText}>
                  Member budgets, dates, and dealbreakers are protected by access policies. No member is shown another member&rsquo;s raw numbers.
                </Text>
              </View>
            </View>

            {/* Architecture note / Non-goal explanation */}
            <Text style={styles.roadmapDisclaimer}>
              PACT uses private links instead of a public directory to keep your trip confidential.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 10, 15, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#13151E',
    borderRadius: radius.card,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollInside: {
    paddingBottom: 8
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)'
  },
  title: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3
  },
  subtitle: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8A8F9E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 380
  },
  codeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.md,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    padding: 14,
    marginBottom: 20
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  codeLabel: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '800',
    color: '#8A8F9E',
    letterSpacing: 1.2
  },
  codeValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1.5,
    marginTop: 2
  },
  codeCopyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)'
  },
  codeCopyPillText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.6
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  linkTextWrapper: {
    flex: 1
  },
  linkLabel: {
    fontFamily: fontUIBold,
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8F9E',
    letterSpacing: 1.1
  },
  linkUrl: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#E8ECF2',
    marginTop: 2
  },
  linkCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill
  },
  linkCopyBtnActive: {
    backgroundColor: '#3DE0A0'
  },
  linkCopyBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#090A0F',
    letterSpacing: 0.5
  },
  linkCopyBtnTextActive: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#090A0F',
    letterSpacing: 0.5
  },
  sectionHeading: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '800',
    color: '#8A8F9E',
    letterSpacing: 1.1,
    marginBottom: 10
  },
  channelsGrid: {
    gap: 8,
    marginBottom: 18
  },
  channelTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12
  },
  channelIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  channelTextCol: {
    flex: 1
  },
  channelTitle: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  channelSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8A8F9E',
    marginTop: 1
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.18)',
    padding: 12,
    gap: 10,
    marginBottom: 14
  },
  privacyTextCol: {
    flex: 1
  },
  privacyTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    fontWeight: '700',
    color: '#3DE0A0',
    marginBottom: 2
  },
  privacyText: {
    fontFamily: fontUI,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  roadmapDisclaimer: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#6C6F7A',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 12
  }
});
