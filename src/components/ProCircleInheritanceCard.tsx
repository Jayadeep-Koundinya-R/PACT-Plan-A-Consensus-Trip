import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, Crown, Users, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { radius, shadows } from '../theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';

interface ProCircleInheritanceCardProps {
  hasPro: boolean;
  organizerName?: string;
  totalMembersCount: number;
}

export const ProCircleInheritanceCard: React.FC<ProCircleInheritanceCardProps> = ({
  hasPro,
  organizerName = 'Organizer',
  totalMembersCount
}) => {
  const router = useRouter();

  const handleOpenPaywall = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    router.push('/paywall');
  };

  if (hasPro) {
    return (
      <View style={styles.proCard}>
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <View style={styles.crownBox}>
              <Crown size={14} color="#D4AF37" fill="#D4AF37" />
            </View>
            <Text style={styles.proTitle}>PRO CIRCLE INHERITANCE</Text>
          </View>
          <View style={styles.rcBadge}>
            <Sparkles size={11} color="#D4AF37" />
            <Text style={styles.rcBadgeText}>RevenueCat Active</Text>
          </View>
        </View>

        <Text style={styles.proDescription}>
          Organizer Pass active. All {totalMembersCount} travelers in this circle inherit Pro capabilities for free — unlocked by {organizerName}.
        </Text>

        <View style={styles.perksRow}>
          <View style={styles.perkPill}>
            <Text style={styles.perkPillText}>✓ 24-Member Cap</Text>
          </View>
          <View style={styles.perkPill}>
            <Text style={styles.perkPillText}>✓ AI Whisperer</Text>
          </View>
          <View style={styles.perkPill}>
            <Text style={styles.perkPillText}>✓ Guest Pro Pass</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.freeCard}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Users size={14} color="#8B8D98" />
          <Text style={styles.freeTitle}>FREE CIRCLE (UP TO 8 MEMBERS)</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenPaywall}
          style={styles.upgradeBtn}
          accessibilityRole="button"
          accessibilityLabel="Upgrade Organizer Pass"
        >
          <Text style={styles.upgradeBtnText}>Upgrade Pass</Text>
          <ArrowRight size={12} color="#052E20" />
        </TouchableOpacity>
      </View>

      <Text style={styles.freeDescription}>
        One flat Organizer Pass ($4.99) unlocks up to 24 seats and the AI Compromise Whisperer for every guest in this circle.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  proCard: {
    backgroundColor: '#151722',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderWidth: 1.5,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 16,
    ...shadows.md
  },
  freeCard: {
    backgroundColor: '#13151E',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 16
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  crownBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  proTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#D4AF37',
    letterSpacing: 0.6
  },
  freeTitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98',
    letterSpacing: 0.5
  },
  rcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1
  },
  rcBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#D4AF37'
  },
  proDescription: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#E0DFDC',
    lineHeight: 17,
    marginBottom: 10
  },
  freeDescription: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    lineHeight: 16
  },
  perksRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap'
  },
  perkPill: {
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderColor: 'rgba(61, 224, 160, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  perkPillText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#3DE0A0'
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  upgradeBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#052E20'
  }
});
