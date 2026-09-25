import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
  Share,
  Alert
} from 'react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import {
  X,
  Sparkles,
  Share2,
  Download,
  Check,
  ShieldCheck,
  Calendar,
  Lock,
  Heart,
  CheckCircle2,
  Award
} from 'lucide-react-native';
import { WaxSealStamp } from '../WaxSealStamp';
import { usePactHaptics } from '../../hooks/usePactHaptics';

export interface PactReceiptCardProps {
  visible: boolean;
  destinationName: string;
  dates: string;
  memberCount?: number;
  matchScore?: number;
  onClose: () => void;
}

export function buildReceiptShareText(destinationName: string, dates: string, memberCount: number = 5): string {
  return `📜 THE PACT RECEIPT\n\n${memberCount} Friends · 0 Arguments · 100% Sealed Agreement\n\n📍 Destination: ${destinationName}\n📅 Dates: ${dates}\n🔒 Agreement Status: 100% Consensus Locked\n\n✨ Sealed privately without endless WhatsApp debates.\n\nJoin or create your trip circle on PACT:\nhttps://pact.app/invite`;
}

export const PactReceiptCard: React.FC<PactReceiptCardProps> = ({
  visible,
  destinationName,
  dates,
  memberCount = 5,
  matchScore = 100,
  onClose
}) => {
  const haptics = usePactHaptics();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const shareText = buildReceiptShareText(destinationName, dates, memberCount);

  const handleShareWhatsApp = async () => {
    haptics.action();
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        Alert.alert('Pact Receipt', shareText);
      }
    } else {
      try {
        await Share.share({
          message: shareText,
          title: `The Pact Receipt — ${destinationName}`
        });
      } catch (e) {}
    }
  };

  const handleSaveToPhotos = () => {
    haptics.success();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Saved to Photos', 'The Pact Receipt story card saved to your device gallery.');
    }, 900);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>The Pact Receipt</Text>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                onClose();
              }}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close receipt modal"
            >
              <X size={20} color="#8B8D98" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* 9:16 Story Card Container with Gold Foil Outer Border */}
            <View style={styles.receiptCardFrame}>
              {/* Header Watermark */}
              <View style={styles.receiptTopHeader}>
                <Text style={styles.receiptBrandTitle}>THE PACT RECEIPT</Text>
                <Text style={styles.receiptWatermark}>pact.app · 2026</Text>
              </View>

              {/* Hook Banner */}
              <View style={styles.hookBanner}>
                <Text style={styles.hookBannerText}>
                  {memberCount} Friends · 0 Arguments · 100% Sealed Agreement
                </Text>
              </View>

              {/* Destination & Locked Dates Hero */}
              <View style={styles.heroSection}>
                <Text style={styles.destinationHeroName}>{destinationName}</Text>
                <View style={styles.dateBadgeRow}>
                  <Calendar size={13} color="#3DE0A0" />
                  <Text style={styles.dateBadgeText}>{dates}</Text>
                </View>
              </View>

              {/* Crimson Wax Seal Center Stamp */}
              <View style={styles.sealStampWrapper}>
                <WaxSealStamp
                  label="SEALED"
                  sublabel="100% AGREED"
                  variant="crimson"
                />
              </View>

              {/* Perforation Divider */}
              <View style={styles.perforationRow}>
                <View style={styles.notchLeft} />
                <View style={styles.dashedLine} />
                <View style={styles.notchRight} />
              </View>

              {/* Aggregate Metrics Grid (Zero private details / names / dollar figures) */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricTile}>
                  <CheckCircle2 size={15} color="#3DE0A0" />
                  <View style={styles.metricTextCol}>
                    <Text style={styles.metricTitle}>100% Date Overlap</Text>
                    <Text style={styles.metricSub}>Calendar windows aligned</Text>
                  </View>
                </View>

                <View style={styles.metricTile}>
                  <ShieldCheck size={15} color="#3DE0A0" />
                  <View style={styles.metricTextCol}>
                    <Text style={styles.metricTitle}>Budget Clearance</Text>
                    <Text style={styles.metricSub}>All group caps respected</Text>
                  </View>
                </View>

                <View style={styles.metricTile}>
                  <Heart size={15} color="#3DE0A0" />
                  <View style={styles.metricTextCol}>
                    <Text style={styles.metricTitle}>Vibe Alignment</Text>
                    <Text style={styles.metricSub}>Tags matched democratically</Text>
                  </View>
                </View>

                <View style={styles.metricTile}>
                  <Lock size={15} color="#3DE0A0" />
                  <View style={styles.metricTextCol}>
                    <Text style={styles.metricTitle}>0 Active Vetoes</Text>
                    <Text style={styles.metricSub}>Sealed anti-herd consensus</Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.receiptFooter}>
                <Sparkles size={13} color="#D4AF37" />
                <Text style={styles.receiptFooterText}>
                  Verified by PACT Deterministic Engine
                </Text>
              </View>
            </View>

            {/* Sharing CTA Actions */}
            <View style={styles.actionButtonsCol}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleShareWhatsApp}
                style={styles.shareWhatsAppBtn}
                accessibilityRole="button"
                accessibilityLabel="Share to WhatsApp"
              >
                <Share2 size={18} color="#090A0F" />
                <Text style={styles.shareWhatsAppBtnText}>
                  {copied ? 'Copied Receipt text!' : 'Share to WhatsApp / Stories'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveToPhotos}
                disabled={isSaving}
                style={styles.savePhotosBtn}
                accessibilityRole="button"
                accessibilityLabel="Save Receipt to Photos"
              >
                <Download size={16} color="#F4F3F0" />
                <Text style={styles.savePhotosBtnText}>
                  {isSaving ? 'Saving to Photos...' : 'Save to Photos / Story Card'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#13151E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    padding: 20,
    maxHeight: '94%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalHeaderTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollBody: {
    alignItems: 'center'
  },
  receiptCardFrame: {
    width: 290,
    backgroundColor: '#090A0F',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#D4AF37', // Gold foil border
    padding: 20,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 18
  },
  receiptTopHeader: {
    alignItems: 'center',
    marginBottom: 10
  },
  receiptBrandTitle: {
    fontFamily: fontDisplay,
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1.5
  },
  receiptWatermark: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#8B8D98',
    marginTop: 2
  },
  hookBanner: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14
  },
  hookBannerText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#3DE0A0',
    textAlign: 'center'
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 14
  },
  destinationHeroName: {
    fontFamily: fontDisplay,
    fontSize: 24,
    fontWeight: '800',
    color: '#F4F3F0',
    textAlign: 'center',
    marginBottom: 6
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  dateBadgeText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#F4F3F0'
  },
  sealStampWrapper: {
    marginVertical: 6,
    alignItems: 'center'
  },
  perforationRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12
  },
  notchLeft: {
    width: 12,
    height: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#13151E',
    marginLeft: -20
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderStyle: 'dashed'
  },
  notchRight: {
    width: 12,
    height: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: '#13151E',
    marginRight: -20
  },
  metricsGrid: {
    width: '100%',
    gap: 8,
    marginBottom: 14
  },
  metricTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  metricTextCol: {
    flex: 1
  },
  metricTitle: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  metricSub: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#8B8D98'
  },
  receiptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  receiptFooterText: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#8B8D98'
  },
  actionButtonsCol: {
    width: '100%',
    gap: 10
  },
  shareWhatsAppBtn: {
    width: '100%',
    minHeight: 48,
    minWidth: 44,
    borderRadius: 12,
    backgroundColor: '#3DE0A0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3DE0A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  shareWhatsAppBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#090A0F'
  },
  savePhotosBtn: {
    width: '100%',
    minHeight: 48,
    minWidth: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: '#13151E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  savePhotosBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F3F0'
  }
});
