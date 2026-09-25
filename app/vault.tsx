import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import {
  ArrowLeft,
  Key,
  Calendar,
  Users,
  ScrollText,
  FileText,
  Bell,
  Sparkles
} from 'lucide-react-native';
import { useGatherlyStore, PastTripItem } from '../src/store/useGatherlyStore';
import { PactReceiptCard } from '../src/components/export/PactReceiptCard';
import { WaxSealStamp } from '../src/components/WaxSealStamp';
import { usePactHaptics } from '../src/hooks/usePactHaptics';

export default function PastTripsVaultScreen() {
  const router = useRouter();
  const haptics = usePactHaptics();
  const { pastTrips = [], toggleAnniversaryReminder } = useGatherlyStore();

  const [selectedReceipt, setSelectedReceipt] = useState<PastTripItem | null>(null);

  const handleToggleReminder = (trip: PastTripItem) => {
    haptics.tap();
    toggleAnniversaryReminder(trip.id);
    const nextState = !trip.anniversaryReminder;
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Anniversary Reminder',
        nextState
          ? `Scheduled annual anniversary reminder for ${trip.name}!`
          : `Disabled anniversary reminder for ${trip.name}.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/(tabs)/home');
                }
              }}
              activeOpacity={0.7}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ArrowLeft size={18} color="#F4F3F0" />
            </TouchableOpacity>

            <View style={styles.titleGroup}>
              <Key size={18} color="#D4AF37" />
              <Text style={styles.headerTitle}>The PACT Vault</Text>
            </View>

            <View style={styles.headerRightPlaceholder} />
          </View>

          {/* Subtitle Banner */}
          <View style={styles.subtitleBanner}>
            <Sparkles size={14} color="#D4AF37" />
            <Text style={styles.subtitleBannerText}>
              Historical archive of sealed group consensus trips & receipts.
            </Text>
          </View>

          {/* Past Trips List */}
          <View style={styles.tripsListCol}>
            {pastTrips.map((trip) => (
              <View key={trip.id} style={styles.pastTripCard}>
                {/* Top Badge & Title Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.tripName}>{trip.name}</Text>
                    <Text style={styles.destinationName}>{trip.destinationName}</Text>
                  </View>

                  <View style={styles.sealedStatusBadge}>
                    <Text style={styles.sealedStatusBadgeText}>Sealed & Completed</Text>
                  </View>
                </View>

                {/* Details Row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Calendar size={13} color="#3DE0A0" />
                    <Text style={styles.metaText}>{trip.dates}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Users size={13} color="#3DE0A0" />
                    <Text style={styles.metaText}>{trip.memberCount} Travelers</Text>
                  </View>
                </View>

                {/* Wax Seal Stamp Decoration */}
                <View style={styles.stampWrapper}>
                  <WaxSealStamp
                    label="SEALED"
                    sublabel="100% CONSENSUS"
                    variant="emerald"
                  />
                </View>

                {/* Anniversary Reminder Switch */}
                <View style={styles.reminderRow}>
                  <View style={styles.reminderTextCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Bell size={13} color="#D4AF37" />
                      <Text style={styles.reminderTitle}>Annual Anniversary Reminder</Text>
                    </View>
                    <Text style={styles.reminderSub}>Recur annual notification for annual trip</Text>
                  </View>

                  <Switch
                    value={trip.anniversaryReminder}
                    onValueChange={() => handleToggleReminder(trip)}
                    trackColor={{ false: 'rgba(255,255,255,0.12)', true: '#3DE0A0' }}
                    thumbColor={trip.anniversaryReminder ? '#052E20' : '#8B8D98'}
                  />
                </View>

                {/* Action CTAs */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.tap();
                      router.push('/circle/circle-college-reunion-2026/brief' as any);
                    }}
                    style={styles.briefActionBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`View Brief for ${trip.name}`}
                  >
                    <FileText size={14} color="#F4F3F0" />
                    <Text style={styles.briefActionBtnText}>View Brief</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      haptics.action();
                      setSelectedReceipt(trip);
                    }}
                    style={styles.receiptActionBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`View Receipt for ${trip.name}`}
                  >
                    <ScrollText size={14} color="#090A0F" />
                    <Text style={styles.receiptActionBtnText}>View Receipt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Pact Receipt Card Modal */}
        {selectedReceipt && (
          <PactReceiptCard
            visible={Boolean(selectedReceipt)}
            destinationName={selectedReceipt.destinationName}
            dates={selectedReceipt.dates}
            memberCount={selectedReceipt.memberCount}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    backgroundColor: '#050608'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  headerRightPlaceholder: {
    width: 44
  },
  subtitleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16
  },
  subtitleBannerText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#D4AF37',
    flex: 1
  },
  tripsListCol: {
    gap: 16
  },
  pastTripCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    padding: 18,
    position: 'relative'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  tripName: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 2
  },
  destinationName: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#3DE0A0'
  },
  sealedStatusBadge: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  sealedStatusBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3DE0A0'
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#B4B6C0'
  },
  stampWrapper: {
    marginVertical: 4,
    alignItems: 'center'
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 10
  },
  reminderTextCol: {
    flex: 1,
    paddingRight: 10
  },
  reminderTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0'
  },
  reminderSub: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#8B8D98',
    marginTop: 2
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6
  },
  briefActionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  briefActionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  receiptActionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  receiptActionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '800',
    color: '#090A0F'
  }
});
