import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import {
  QrCode,
  X,
  Copy,
  Check,
  ShieldCheck,
  Radio,
  Users,
  Award,
  Sparkles,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import {
  encodeOfflineBallot,
  decodeOfflineBallot,
  computeLocalConsensus,
  OfflineBallotPayload,
  LocalConsensusCandidate,
  LocalConsensusResult,
} from '../lib/consensus/localP2P';

interface P2PConsensusModalProps {
  visible: boolean;
  circleId: string;
  circleName: string;
  currentUserId: string;
  currentUserName: string;
  userBudget: number;
  userDates: string[];
  userDealbreakers: string[];
  userApprovals: Record<string, boolean>;
  candidates: LocalConsensusCandidate[];
  isDarkMode?: boolean;
  onClose: () => void;
  onConsensusApplied?: (result: LocalConsensusResult) => void;
}

export const P2PConsensusModal: React.FC<P2PConsensusModalProps> = ({
  visible,
  circleId,
  circleName,
  currentUserId,
  currentUserName,
  userBudget,
  userDates,
  userDealbreakers,
  userApprovals,
  candidates,
  isDarkMode = true,
  onClose,
  onConsensusApplied,
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [activeTab, setActiveTab] = useState<'broadcast' | 'aggregate'>('broadcast');
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [scannedBallots, setScannedBallots] = useState<OfflineBallotPayload[]>([]);
  const [consensusResult, setConsensusResult] = useState<LocalConsensusResult | null>(null);

  // My encoded offline ballot
  const myBallotPayload: OfflineBallotPayload = useMemo(() => ({
    circleId,
    circleName,
    voterId: currentUserId,
    voterName: currentUserName,
    budget: userBudget,
    dates: userDates,
    dealbreakers: userDealbreakers,
    approvals: userApprovals,
    timestamp: Date.now(),
  }), [circleId, circleName, currentUserId, currentUserName, userBudget, userDates, userDealbreakers, userApprovals]);

  const encodedBallot = useMemo(() => encodeOfflineBallot(myBallotPayload), [myBallotPayload]);

  const handleCopyBallot = async () => {
    await Clipboard.setStringAsync(encodedBallot);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddScannedCode = () => {
    if (!inputCode.trim()) return;
    const decoded = decodeOfflineBallot(inputCode.trim());
    if (!decoded) {
      Alert.alert('Invalid QR Code', 'The scanned data is not a valid PACT offline ballot.');
      return;
    }

    if (scannedBallots.some((b) => b.voterId === decoded.voterId)) {
      Alert.alert('Already Added', `${decoded.voterName}'s ballot has already been included.`);
      return;
    }

    setScannedBallots((prev) => [...prev, decoded]);
    setInputCode('');
  };

  const handleAddDemoPeer = (name: string, budget: number, dates: string[], approvals: Record<string, boolean>) => {
    const demoPayload: OfflineBallotPayload = {
      circleId,
      circleName,
      voterId: `peer-${name.toLowerCase()}-${Date.now()}`,
      voterName: name,
      budget,
      dates,
      dealbreakers: [],
      approvals,
      timestamp: Date.now(),
    };
    setScannedBallots((prev) => [...prev, demoPayload]);
  };

  const handleRunConsensus = () => {
    // Include user's own ballot plus all scanned peer ballots
    const allBallots = [myBallotPayload, ...scannedBallots.filter((b) => b.voterId !== myBallotPayload.voterId)];
    const result = computeLocalConsensus(allBallots, candidates);
    setConsensusResult(result);
    if (onConsensusApplied) {
      onConsensusApplied(result);
    }
  };

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
                <Radio size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Offline P2P Consensus
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Zero-Cloud In-Person Ballot Sync
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Segmented Control Tabs */}
          <View style={[styles.tabBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('broadcast')}
              style={[
                styles.tabBtn,
                activeTab === 'broadcast' && { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <QrCode size={15} color={activeTab === 'broadcast' ? theme.primary : theme.textSecondary} />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'broadcast' ? theme.textPrimary : theme.textSecondary },
                ]}
              >
                Broadcast My Ballot
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('aggregate')}
              style={[
                styles.tabBtn,
                activeTab === 'aggregate' && { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Users size={15} color={activeTab === 'aggregate' ? theme.primary : theme.textSecondary} />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'aggregate' ? theme.textPrimary : theme.textSecondary },
                ]}
              >
                Collect Ballots ({scannedBallots.length + 1})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {activeTab === 'broadcast' ? (
              <View style={styles.tabContent}>
                {/* QR Display Card */}
                <View style={[styles.qrDisplayCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                  <View style={[styles.qrCodeBox, { backgroundColor: '#FFFFFF' }]}>
                    <QrCode size={140} color="#090A0F" />
                  </View>

                  <Text style={[styles.voterNameTag, { color: theme.textPrimary }]}>
                    {currentUserName}'s Encrypted Ballot
                  </Text>
                  <Text style={[styles.voterCircleTag, { color: theme.textSecondary }]}>
                    Circle: {circleName}
                  </Text>
                </View>

                {/* Privacy Badge */}
                <View style={[styles.privacyCallout, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                  <ShieldCheck size={18} color={theme.primary} />
                  <Text style={[styles.privacyCalloutText, { color: theme.textPrimary }]}>
                    Your budget (${userBudget}) and individual vetoes are cryptographically sealed. Peers scanning this code only verify compatibility during local scoring.
                  </Text>
                </View>

                {/* Copy / Share Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCopyBallot}
                  style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
                >
                  {copied ? <Check size={16} color="#FFFFFF" /> : <Copy size={16} color="#FFFFFF" />}
                  <Text style={styles.primaryActionBtnText}>
                    {copied ? 'Ballot Code Copied!' : 'Copy Encrypted Ballot Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tabContent}>
                {/* Consensus Result Card if available */}
                {consensusResult && consensusResult.winner && (
                  <View style={[styles.winnerBanner, { backgroundColor: '#10281F', borderColor: theme.seal }]}>
                    <View style={styles.winnerHeader}>
                      <Award size={22} color={theme.seal} />
                      <Text style={[styles.winnerTitle, { color: theme.seal }]}>
                        OFFLINE CONSENSUS REACHED!
                      </Text>
                    </View>
                    <Text style={[styles.winnerDest, { color: theme.textPrimary }]}>
                      {consensusResult.winner.name}
                    </Text>
                    <View style={styles.winnerMetaRow}>
                      <Calendar size={13} color={theme.textSecondary} />
                      <Text style={[styles.winnerMetaText, { color: theme.textSecondary }]}>
                        {consensusResult.commonDates.length > 0
                          ? `${consensusResult.commonDates.length} matching dates`
                          : 'Dates agreed'}
                      </Text>
                      <DollarSign size={13} color={theme.textSecondary} />
                      <Text style={[styles.winnerMetaText, { color: theme.textSecondary }]}>
                        Max Safe Split: ${consensusResult.winner.estimatedCost}/person
                      </Text>
                    </View>
                  </View>
                )}

                {/* Scanned Ballots List */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  COLLECTED BALLOTS ({scannedBallots.length + 1} OF MINIMUM 2)
                </Text>

                <View style={[styles.ballotItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                  <View style={[styles.ballotAvatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.ballotAvatarText}>{currentUserName.charAt(0)}</Text>
                  </View>
                  <View style={styles.ballotInfo}>
                    <Text style={[styles.ballotName, { color: theme.textPrimary }]}>
                      {currentUserName} (You)
                    </Text>
                    <Text style={[styles.ballotStatus, { color: theme.seal }]}>
                      ✓ Ballot Ready &amp; Sealed
                    </Text>
                  </View>
                  <ShieldCheck size={18} color={theme.seal} />
                </View>

                {scannedBallots.map((ballot, idx) => (
                  <View
                    key={ballot.voterId || idx}
                    style={[styles.ballotItem, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
                  >
                    <View style={[styles.ballotAvatar, { backgroundColor: theme.seal }]}>
                      <Text style={styles.ballotAvatarText}>{ballot.voterName.charAt(0)}</Text>
                    </View>
                    <View style={styles.ballotInfo}>
                      <Text style={[styles.ballotName, { color: theme.textPrimary }]}>
                        {ballot.voterName}
                      </Text>
                      <Text style={[styles.ballotStatus, { color: theme.seal }]}>
                        ✓ In-Person Verified
                      </Text>
                    </View>
                    <ShieldCheck size={18} color={theme.seal} />
                  </View>
                ))}

                {/* Input for Manual Code Entry */}
                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
                    ]}
                    placeholder="Paste peer's PACT-P2P code..."
                    placeholderTextColor={theme.textSecondary}
                    value={inputCode}
                    onChangeText={setInputCode}
                  />
                  <TouchableOpacity
                    onPress={handleAddScannedCode}
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Demo Simulator Helper Buttons */}
                {scannedBallots.length === 0 && (
                  <View style={[styles.demoBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                    <Text style={[styles.demoBoxTitle, { color: theme.textSecondary }]}>
                      ⚡ QUICK DEMO PEERS (NO SECOND PHONE NEEDED):
                    </Text>
                    <View style={styles.demoBtnRow}>
                      <TouchableOpacity
                        onPress={() =>
                          handleAddDemoPeer('Maya S.', 550, userDates, {
                            [candidates[0]?.id || '1']: true,
                            [candidates[1]?.id || '2']: true,
                          })
                        }
                        style={[styles.demoChip, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.demoChipText, { color: theme.textPrimary }]}>+ Add Maya</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleAddDemoPeer('Rohan K.', 700, userDates, {
                            [candidates[0]?.id || '1']: true,
                            [candidates[1]?.id || '2']: false,
                          })
                        }
                        style={[styles.demoChip, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.demoChipText, { color: theme.textPrimary }]}>+ Add Rohan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Calculate Consensus CTA */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleRunConsensus}
                  disabled={scannedBallots.length === 0}
                  style={[
                    styles.primaryActionBtn,
                    {
                      backgroundColor: scannedBallots.length > 0 ? theme.seal : theme.border,
                      opacity: scannedBallots.length > 0 ? 1 : 0.6,
                    },
                  ]}
                >
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>
                    Calculate Offline Consensus ({scannedBallots.length + 1} Ballots)
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  tabBar: {
    flexDirection: 'row',
    borderRadius: radius.sm,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.sm - 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  scrollBody: {
    paddingBottom: 10,
  },
  tabContent: {
    gap: 14,
  },
  qrDisplayCard: {
    alignItems: 'center',
    padding: 18,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  qrCodeBox: {
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  voterNameTag: {
    fontSize: 16,
    fontWeight: '800',
  },
  voterCircleTag: {
    fontSize: 12,
    marginTop: 2,
  },
  privacyCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  privacyCalloutText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
    fontWeight: '600',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn,
    marginTop: 4,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  ballotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  ballotAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballotAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  ballotInfo: {
    flex: 1,
  },
  ballotName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  ballotStatus: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  addBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  demoBox: {
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  demoBoxTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  demoChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  winnerBanner: {
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: 4,
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  winnerTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  winnerDest: {
    fontSize: 18,
    fontWeight: '900',
  },
  winnerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  winnerMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
