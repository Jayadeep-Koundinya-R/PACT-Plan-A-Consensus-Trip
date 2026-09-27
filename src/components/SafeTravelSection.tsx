import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { Phone, ShieldCheck, Car, Bus, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';

export interface TransportContact {
  id: string;
  name: string;
  type: 'car' | 'van' | 'bus';
  phone: string;
  displayPhone: string;
  rating: string;
  vehicleTypes: string;
  verified: boolean;
}

export interface SafeTravelSectionProps {
  destinationName?: string;
  isDarkMode?: boolean;
}

export const SafeTravelSection: React.FC<SafeTravelSectionProps> = ({
  destinationName = 'Goa',
  isDarkMode = true
}) => {
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleDial = (phoneNumber: string, name: string) => {
    triggerHaptic();
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Call Contact', `Dialing ${name} at ${phoneNumber}`);
      }
    });
  };

  const contacts: TransportContact[] = [
    {
      id: 't1',
      name: `${destinationName} Royal Travels & Cabs`,
      type: 'car',
      phone: '+18005550199',
      displayPhone: '1800-555-0199 (Toll Free)',
      rating: '4.9 ★',
      vehicleTypes: 'Sedans, SUVs, 7-Seater Ertiga',
      verified: true
    },
    {
      id: 't2',
      name: `${destinationName} Coastal Group Vans & Minibus`,
      type: 'van',
      phone: '+18005550288',
      displayPhone: '1800-555-0288 (Toll Free)',
      rating: '4.8 ★',
      vehicleTypes: '12-Seater & 17-Seater Tempo Traveller',
      verified: true
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <ShieldCheck size={18} color="#3DE0A0" />
          <Text style={styles.headerTitle}>Verified Safe Travel & Transport</Text>
        </View>
        <View style={styles.backboneBadge}>
          <Text style={styles.backboneBadgeText}>SAFE PACT</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        24/7 Verified local car & van operators with direct toll-free hotline support for {destinationName}.
      </Text>

      {/* Hotline Card */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handleDial('+1800112026', 'PACT 24/7 Safety Hotline')}
        style={styles.hotlineCard}
      >
        <View style={styles.hotlineLeft}>
          <View style={styles.hotlineIconBox}>
            <Phone size={18} color="#FF5A5F" />
          </View>
          <View style={styles.hotlineTextCol}>
            <Text style={styles.hotlineTitle}>PACT 24/7 Emergency & Safety Hotline</Text>
            <Text style={styles.hotlinePhone}>1800-112-026 (Toll-Free Helpline)</Text>
          </View>
        </View>
        <View style={styles.callNowBtn}>
          <Text style={styles.callNowText}>Call Now</Text>
        </View>
      </TouchableOpacity>

      {/* Verified Transport Partners List */}
      <View style={styles.contactsList}>
        {contacts.map((item) => (
          <View key={item.id} style={styles.contactCard}>
            <View style={styles.contactTopRow}>
              <View style={styles.contactInfoCol}>
                <View style={styles.contactNameRow}>
                  {item.type === 'car' ? (
                    <Car size={15} color="#3DE0A0" />
                  ) : (
                    <Bus size={15} color="#D4AF37" />
                  )}
                  <Text style={styles.contactName}>{item.name}</Text>
                </View>
                <Text style={styles.vehicleSub}>{item.vehicleTypes} • {item.rating}</Text>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>✓ VERIFIED</Text>
              </View>
            </View>

            <View style={styles.contactBottomRow}>
              <Text style={styles.displayPhoneText}>{item.displayPhone}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleDial(item.phone, item.name)}
                style={styles.dialBtn}
              >
                <Phone size={12} color="#052E20" />
                <Text style={styles.dialBtnText}>Dial</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#13151E',
    borderColor: '#262938',
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 16,
    marginVertical: 12
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 15,
    fontWeight: '800',
    color: '#F4F3F0'
  },
  backboneBadge: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  backboneBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#3DE0A0',
    letterSpacing: 0.5
  },
  subtitle: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    lineHeight: 16,
    marginBottom: 12
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    borderColor: 'rgba(255, 90, 95, 0.3)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12
  },
  hotlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  hotlineIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 90, 95, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hotlineTextCol: {
    flex: 1
  },
  hotlineTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0'
  },
  hotlinePhone: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#FF5A5F',
    fontWeight: '700',
    marginTop: 1
  },
  callNowBtn: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  callNowText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#050608'
  },
  contactsList: {
    gap: 8
  },
  contactCard: {
    backgroundColor: '#181A24',
    borderColor: '#262938',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10
  },
  contactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  contactInfoCol: {
    flex: 1
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  contactName: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F4F3F0'
  },
  vehicleSub: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98',
    marginTop: 2
  },
  verifiedTag: {
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  verifiedTagText: {
    fontFamily: fontUIBold,
    fontSize: 8.5,
    color: '#3DE0A0'
  },
  contactBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    marginTop: 2
  },
  displayPhoneText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#D4AF37'
  },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  dialBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#052E20'
  }
});
