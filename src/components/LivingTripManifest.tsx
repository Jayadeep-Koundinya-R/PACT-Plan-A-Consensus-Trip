import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePactHaptics } from '../hooks/usePactHaptics';
import { useGatherlyStore, CurrencyCode, CURRENCIES } from '../store/useGatherlyStore';
import { fontUI, fontUIBold } from '../theme/typography';
import { MapPin, Calendar, DollarSign, Sparkles, Phone, Star, Waves, Mountain, Coffee, Zap } from 'lucide-react-native';

export interface LivingTripManifestProps {
  circleId: string;
  destination?: string;
  dates?: string;
  budgetPerPerson?: number;
  currencyCode?: CurrencyCode;
}

const MOCK_AI_SPOTS = [
  { id: 'spot-1', name: 'Sunset Beach Point', type: 'Photo Viewpoint', description: 'Best sunset views', rating: 4.9 },
  { id: 'spot-2', name: 'Adventure Watersports Hub', type: 'Adventure', description: 'Jet skiing, parasailing', rating: 4.7 },
  { id: 'spot-3', name: 'Hidden Cafe Alley', type: 'Trending Cafe', description: 'Artisanal coffee', rating: 4.8 }
];

const MOCK_PARTNERS = [
  { id: 'partner-1', name: 'Rajasthan Cabs', type: 'Verified Driver', phone: '+919876543210', rating: 4.8, verified: true },
  { id: 'partner-2', name: 'Goa Bike Rentals', type: 'Two-Wheeler', phone: '+919876543211', rating: 4.6, verified: true }
];

export const LivingTripManifest: React.FC<LivingTripManifestProps> = ({
  destination = 'Goa, India',
  dates = 'Oct 14 - Oct 19, 2026',
  budgetPerPerson = 850,
  currencyCode = 'USD'
}) => {
  const { theme } = useTheme();
  const haptics = usePactHaptics();
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '$';

  const handleCall = (phone: string) => {
    haptics.tap();
    const url = Platform.OS === 'android' ? 'tel:' + phone : 'telprompt:' + phone;
    Linking.openURL(url).catch(() => {});
  };

  const getIcon = (type: string) => {
    if (type === 'Photo Viewpoint') return <Waves size={16} color="#3DE0A0" />;
    if (type === 'Adventure') return <Mountain size={16} color="#FF5A5F" />;
    return <Coffee size={16} color="#D4AF37" />;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(61, 224, 160, 0.12)' }]}>
            <Sparkles size={12} color="#3DE0A0" />
            <Text style={styles.badgeText}>PINNED TRIP SPECS</Text>
          </View>
        </View>
        <View style={styles.specs}>
          <View style={styles.specItem}><MapPin size={14} color="#FF5A5F" /><View><Text style={[styles.label, { color: theme.textSecondary }]}>Destination</Text><Text style={[styles.value, { color: theme.textPrimary }]}>{destination}</Text></View></View>
          <View style={styles.specItem}><Calendar size={14} color="#3DE0A0" /><View><Text style={[styles.label, { color: theme.textSecondary }]}>Target Dates</Text><Text style={[styles.value, { color: theme.textPrimary }]}>{dates}</Text></View></View>
          <View style={styles.specItem}><DollarSign size={14} color="#D4AF37" /><View><Text style={[styles.label, { color: theme.textSecondary }]}>Budget</Text><Text style={[styles.value, { color: theme.textPrimary }]}>{currencySymbol}{budgetPerPerson}/person</Text></View></View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(255, 90, 95, 0.12)' }]}>
            <Zap size={12} color="#FF5A5F" />
            <Text style={styles.badgeTextRed}>AI CURATED</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MOCK_AI_SPOTS.map((spot) => (
            <TouchableOpacity key={spot.id} activeOpacity={0.8} onPress={() => haptics.tap()} style={[styles.spotCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              {getIcon(spot.type)}
              <Text style={[styles.spotName, { color: theme.textPrimary }]}>{spot.name}</Text>
              <Text style={[styles.spotType, { color: theme.textSecondary }]}>{spot.type}</Text>
              <View style={styles.rating}><Star size={10} color="#D4AF37" fill="#D4AF37" /><Text style={styles.ratingText}>{spot.rating}</Text></View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.badge, { backgroundColor: 'rgba(61, 224, 160, 0.12)', alignSelf: 'flex-start' }]}>
          <Star size={12} color="#3DE0A0" />
          <Text style={styles.badgeText}>PARTNERS</Text>
        </View>
        {MOCK_PARTNERS.map((partner) => (
          <View key={partner.id} style={[styles.partnerRow, { borderBottomColor: theme.border }]}>
            <View style={styles.partnerInfo}>
              <Text style={[styles.partnerName, { color: theme.textPrimary }]}>{partner.name}</Text>
              <Text style={[styles.partnerType, { color: theme.textSecondary }]}>{partner.type}</Text>
              <View style={styles.rating}><Star size={10} color="#D4AF37" fill="#D4AF37" /><Text style={styles.ratingText}>{partner.rating}</Text></View>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleCall(partner.phone)} style={[styles.callBtn, { backgroundColor: theme.primary }]}>
              <Phone size={14} color="#050608" />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16, marginVertical: 8 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontFamily: fontUIBold, fontSize: 10, fontWeight: '800', color: '#3DE0A0', letterSpacing: 0.5 },
  badgeTextRed: { fontFamily: fontUIBold, fontSize: 10, fontWeight: '800', color: '#FF5A5F', letterSpacing: 0.5 },
  specs: { gap: 12 },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontFamily: fontUI, fontSize: 10, color: '#8B8D98', marginBottom: 2 },
  value: { fontFamily: fontUIBold, fontSize: 14, fontWeight: '700' },
  spotCard: { width: 140, borderRadius: 14, borderWidth: 1, padding: 12, marginRight: 12 },
  spotName: { fontFamily: fontUIBold, fontSize: 13, fontWeight: '700', marginTop: 8 },
  spotType: { fontFamily: fontUI, fontSize: 11, color: '#3DE0A0', marginBottom: 4 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: fontUIBold, fontSize: 11, color: '#D4AF37' },
  partnerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  partnerInfo: { flex: 1 },
  partnerName: { fontFamily: fontUIBold, fontSize: 14, fontWeight: '700' },
  partnerType: { fontFamily: fontUI, fontSize: 12, marginBottom: 4 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  callBtnText: { fontFamily: fontUIBold, fontSize: 12, fontWeight: '800', color: '#050608' }
});

export default LivingTripManifest;