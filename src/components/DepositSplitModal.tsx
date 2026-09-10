import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import {
  DollarSign,
  X,
  Copy,
  Check,
  CreditCard,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import {
  calculateDepositSplit,
  PayeeProfile,
  DepositSplitPlan,
} from '../lib/payments/depositSplitter';

interface DepositSplitModalProps {
  visible: boolean;
  circleId: string;
  circleName: string;
  totalDeposit: number;
  currency: string;
  members: Array<{ id: string; name: string; isOrganizer?: boolean }>;
  payee: PayeeProfile;
  isDarkMode?: boolean;
  onClose: () => void;
}

export const DepositSplitModal: React.FC<DepositSplitModalProps> = ({
  visible,
  circleId,
  circleName,
  totalDeposit,
  currency,
  members,
  payee,
  isDarkMode = true,
  onClose,
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [copied, setCopied] = useState(false);
  const [memberStatuses, setMemberStatuses] = useState<Record<string, 'pending' | 'paid'>>(() => {
    const initial: Record<string, 'pending' | 'paid'> = {};
    members.forEach((m) => {
      initial[m.id] = m.isOrganizer ? 'paid' : 'pending';
    });
    return initial;
  });

  const plan: DepositSplitPlan = useMemo(
    () =>
      calculateDepositSplit(
        circleId,
        circleName,
        totalDeposit,
        currency,
        members,
        payee
      ),
    [circleId, circleName, totalDeposit, currency, members, payee]
  );

  const handleCopySummary = async () => {
    await Clipboard.setStringAsync(plan.shareableSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDeepLink = async (url?: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fall back to copying link
        await Clipboard.setStringAsync(url);
        Alert.alert('Link Copied', 'Payment link copied to clipboard. Open your payment app to complete.');
      }
    } catch (_err) {
      await Clipboard.setStringAsync(url);
      Alert.alert('Link Copied', 'Payment link copied to clipboard.');
    }
  };

  const toggleStatus = (id: string) => {
    setMemberStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'paid' ? 'pending' : 'paid',
    }));
  };

  const paidCount = Object.values(memberStatuses).filter((s) => s === 'paid').length;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.lg,
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconBox, { backgroundColor: theme.primaryLight }]}>
                <CreditCard size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Deposit Split Sheet
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Instant Settlement &amp; Deep Links
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Total Deposit Overview Banner */}
            <View style={[styles.overviewCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <View style={styles.overviewCol}>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>
                  TOTAL BOOKING DEPOSIT
                </Text>
                <Text style={[styles.overviewAmount, { color: theme.textPrimary }]}>
                  {currency} {totalDeposit.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
              <View style={styles.overviewCol}>
                <Text style={[styles.overviewLabel, { color: theme.textSecondary }]}>
                  PER PERSON SHARE
                </Text>
                <Text style={[styles.overviewAmount, { color: theme.seal }]}>
                  {currency} {plan.sharePerPerson.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Payee Info Banner */}
            <View style={[styles.payeeCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <Text style={[styles.payeeLabel, { color: theme.textSecondary }]}>
                ORGANIZER PAYEE:
              </Text>
              <Text style={[styles.payeeName, { color: theme.textPrimary }]}>
                {payee.name} {payee.upiVpa ? `• ${payee.upiVpa}` : ''}
              </Text>
            </View>

            {/* 1-Tap Instant Payment Deep Link Actions */}
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              1-TAP DIRECT PAYMENT OPTIONS
            </Text>

            <View style={styles.deepLinksCol}>
              {plan.deepLinks.upiUri && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleOpenDeepLink(plan.deepLinks.upiUri)}
                  style={[styles.deepLinkBtn, { backgroundColor: '#1E293B', borderColor: '#3B82F6' }]}
                >
                  <View style={styles.deepLinkLeft}>
                    <Text style={styles.deepLinkIcon}>⚡</Text>
                    <View>
                      <Text style={[styles.deepLinkTitle, { color: '#FFFFFF' }]}>
                        Pay via UPI (GPay / PhonePe)
                      </Text>
                      <Text style={[styles.deepLinkSub, { color: '#94A3B8' }]}>
                        {currency} {plan.sharePerPerson.toFixed(2)} to {payee.upiVpa}
                      </Text>
                    </View>
                  </View>
                  <ExternalLink size={16} color="#60A5FA" />
                </TouchableOpacity>
              )}

              {plan.deepLinks.revolutUrl && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleOpenDeepLink(plan.deepLinks.revolutUrl)}
                  style={[styles.deepLinkBtn, { backgroundColor: '#1E293B', borderColor: '#06B6D4' }]}
                >
                  <View style={styles.deepLinkLeft}>
                    <Text style={styles.deepLinkIcon}>💳</Text>
                    <View>
                      <Text style={[styles.deepLinkTitle, { color: '#FFFFFF' }]}>
                        Pay via Revolut
                      </Text>
                      <Text style={[styles.deepLinkSub, { color: '#94A3B8' }]}>
                        {currency} {plan.sharePerPerson.toFixed(2)} to @{payee.revolutHandle}
                      </Text>
                    </View>
                  </View>
                  <ExternalLink size={16} color="#38BDF8" />
                </TouchableOpacity>
              )}

              {plan.deepLinks.venmoUri && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleOpenDeepLink(plan.deepLinks.venmoUri)}
                  style={[styles.deepLinkBtn, { backgroundColor: '#1E293B', borderColor: '#38BDF8' }]}
                >
                  <View style={styles.deepLinkLeft}>
                    <Text style={styles.deepLinkIcon}>💸</Text>
                    <View>
                      <Text style={[styles.deepLinkTitle, { color: '#FFFFFF' }]}>
                        Pay via Venmo
                      </Text>
                      <Text style={[styles.deepLinkSub, { color: '#94A3B8' }]}>
                        {currency} {plan.sharePerPerson.toFixed(2)} to @{payee.venmoHandle}
                      </Text>
                    </View>
                  </View>
                  <ExternalLink size={16} color="#38BDF8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Member Settlement Progress */}
            <View style={styles.progressHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                COLLECTION PROGRESS
              </Text>
              <Text style={[styles.progressCounter, { color: theme.seal }]}>
                {paidCount} of {members.length} Paid
              </Text>
            </View>

            <View style={styles.memberList}>
              {plan.shares.map((share) => {
                const isPaid = memberStatuses[share.memberId] === 'paid';
                return (
                  <TouchableOpacity
                    key={share.memberId}
                    activeOpacity={0.8}
                    onPress={() => toggleStatus(share.memberId)}
                    style={[
                      styles.memberItem,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.memberLeft}>
                      <View
                        style={[
                          styles.memberAvatar,
                          { backgroundColor: isPaid ? theme.seal : theme.primary },
                        ]}
                      >
                        <Text style={styles.memberAvatarText}>{share.memberName.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={[styles.memberName, { color: theme.textPrimary }]}>
                          {share.memberName} {share.isOrganizer ? '(Organizer)' : ''}
                        </Text>
                        <Text style={[styles.memberAmount, { color: theme.textSecondary }]}>
                          {currency} {share.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: isPaid ? '#10281F' : '#2A1E14' }]}>
                      {isPaid ? (
                        <>
                          <CheckCircle2 size={13} color={theme.seal} />
                          <Text style={[styles.statusBadgeText, { color: theme.seal }]}>Paid</Text>
                        </>
                      ) : (
                        <>
                          <Clock size={13} color="#F59E0B" />
                          <Text style={[styles.statusBadgeText, { color: '#F59E0B' }]}>Pending</Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Copy WhatsApp Breakdown CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCopySummary}
              style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
            >
              {copied ? <Check size={16} color="#FFFFFF" /> : <Copy size={16} color="#FFFFFF" />}
              <Text style={styles.primaryActionBtnText}>
                {copied ? 'Copied WhatsApp Breakdown!' : 'Copy WhatsApp Deposit Sheet'}
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
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    gap: 14,
    paddingBottom: 10,
  },
  overviewCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  overviewCol: {
    flex: 1,
    alignItems: 'center',
  },
  overviewDivider: {
    width: 1,
    height: '100%',
  },
  overviewLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  payeeCard: {
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  payeeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  payeeName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  deepLinksCol: {
    gap: 8,
  },
  deepLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  deepLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deepLinkIcon: {
    fontSize: 18,
  },
  deepLinkTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  deepLinkSub: {
    fontSize: 11,
    marginTop: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCounter: {
    fontSize: 12,
    fontWeight: '800',
  },
  memberList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
  },
  memberAmount: {
    fontSize: 11.5,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 6,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
