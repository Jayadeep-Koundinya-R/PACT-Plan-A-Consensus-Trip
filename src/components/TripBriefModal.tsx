import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { TripBrief } from '../store/useGatherlyStore';
import { colors, radius, shadows } from '../theme/colors';
import { CheckCircle, Share2, Calendar, DollarSign, Users, Award, X } from 'lucide-react-native';

interface TripBriefModalProps {
  visible: boolean;
  brief: TripBrief | null;
  isDarkMode?: boolean;
  onClose: () => void;
}

export const TripBriefModal: React.FC<TripBriefModalProps> = ({
  visible,
  brief,
  isDarkMode = false,
  onClose
}) => {
  if (!brief) return null;
  const theme = isDarkMode ? colors.dark : colors.light;
  const { winningOption, confirmedParticipants, totalBudgetRange, travelWindow } = brief;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
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
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header / Celebration Badge */}
            <View style={styles.celebrationHeader}>
              <View style={[styles.iconRing, { backgroundColor: theme.successLight }]}>
                <CheckCircle size={32} color={theme.success} />
              </View>
              <Text style={[styles.celebrationTitle, { color: theme.textPrimary }]}>
                Consensus Reached!
              </Text>
              <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>
                Gatherly generated your official Trip Brief
              </Text>
            </View>

            {/* Official Brief Card */}
            <View
              style={[
                styles.briefCard,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
              ]}
            >
              <View style={styles.winnerHeader}>
                <Award size={20} color={theme.primary} />
                <Text style={[styles.winnerLabel, { color: theme.primary }]}>
                  OFFICIAL DESTINATION
                </Text>
              </View>

              <Text style={[styles.destinationTitle, { color: theme.textPrimary }]}>
                {winningOption.option.name}
              </Text>
              <Text style={[styles.destinationSub, { color: theme.textSecondary }]}>
                {winningOption.option.destinationType}
              </Text>

              <View style={styles.divider} />

              {/* Travel Window */}
              <View style={styles.infoRow}>
                <Calendar size={18} color={theme.primary} />
                <View style={styles.infoCol}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Confirmed Dates
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                    {travelWindow}
                  </Text>
                </View>
              </View>

              {/* Budget */}
              <View style={styles.infoRow}>
                <DollarSign size={18} color={theme.success} />
                <View style={styles.infoCol}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Budget Band Per Person
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                    ${winningOption.option.budgetPerPerson} (Group Band: {totalBudgetRange})
                  </Text>
                </View>
              </View>

              {/* Participants */}
              <View style={styles.infoRow}>
                <Users size={18} color={theme.secondary} />
                <View style={styles.infoCol}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Participants ({confirmedParticipants.length})
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                    {confirmedParticipants.join(', ')}
                  </Text>
                </View>
              </View>

              {/* Honored Tags */}
              <View style={styles.tagWrap}>
                {winningOption.option.tags.map((t) => (
                  <View
                    key={t}
                    style={[styles.tagBadge, { backgroundColor: theme.primaryLight }]}
                  >
                    <Text style={[styles.tagBadgeText, { color: theme.primaryDark }]}>
                      ✓ {t}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Share / Export Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.shareBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                alert('Trip Brief copied & ready to share to WhatsApp / Group Chat!');
                onClose();
              }}
            >
              <Share2 size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share Brief to Group Chat</Text>
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
    maxHeight: '90%',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  iconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4
  },
  celebrationSubtitle: {
    fontSize: 13,
    textAlign: 'center'
  },
  briefCard: {
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  winnerLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  destinationTitle: {
    fontSize: 20,
    fontWeight: '800'
  },
  destinationSub: {
    fontSize: 13,
    marginBottom: 12
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 12,
    opacity: 0.5
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
  },
  infoCol: {
    flex: 1
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
