import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform
} from 'react-native';
import {
  Pin,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Plane,
  Building2,
  Clock,
  ExternalLink,
  X,
  Compass,
  CheckCircle2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import { CURRENCIES, CurrencyCode } from '../../store/useGatherlyStore';

export interface AISpotItem {
  id: string;
  name: string;
  emoji: string;
  vibeMatch: string;
  curatedTag: string;
  whyItFits: string;
  distance: string;
  duration: string;
  estimatedCost: string;
  mapQuery?: string;
}

export const DEFAULT_AI_SPOTS: AISpotItem[] = [
  {
    id: 'spot-palolem',
    name: 'Palolem Beach Sunset Session',
    emoji: '🏖️',
    vibeMatch: 'Matches group "Beach & Relaxation" vibe • Free entry',
    curatedTag: 'Curated by Gemini AI',
    whyItFits: 'Selected because 100% of circle members favored coastal relaxation. Free public beach access eliminates budget drag, perfectly respecting Maya and Jake\'s conservative caps.',
    distance: '4.2 km from villa',
    duration: '2 – 3 hours',
    estimatedCost: 'Free entry',
    mapQuery: 'Palolem Beach South Goa'
  },
  {
    id: 'spot-wharf',
    name: "Fisherman's Wharf Seafood Feast",
    emoji: '🦞',
    vibeMatch: 'Group dining reserved • Under $25/person',
    curatedTag: 'Curated by Gemini AI',
    whyItFits: 'Gemini identified this spot to resolve the seafood lover vs vegetarian conflict. Features separate kitchens, seaside open-air seating, and fits well below the group per-meal cap.',
    distance: '6.8 km riverside',
    duration: '1.5 – 2 hours',
    estimatedCost: '$22 / person',
    mapQuery: "Fisherman's Wharf Mobor Goa"
  },
  {
    id: 'spot-oldgoa',
    name: 'Old Goa Heritage Scooter Convoy',
    emoji: '🛵',
    vibeMatch: 'Verified rental partner on call',
    curatedTag: 'Curated by Gemini AI',
    whyItFits: 'Combines cultural sightseeing with relaxed pacing. Partner provides helmets, insurance, and road assistance at a pre-negotiated group discount.',
    distance: '11.5 km historic quarter',
    duration: '3 – 4 hours',
    estimatedCost: '$12 / vehicle',
    mapQuery: 'Old Goa Churches'
  }
];

export interface TransportCardItem {
  id: string;
  name: string;
  vehicleTypes: string;
  phone: string;
  displayPhone: string;
  rating: string;
}

export const DEFAULT_TRANSPORT_CARDS: TransportCardItem[] = [
  {
    id: 'tp-1',
    name: 'Goa Coastal Cabs & Airport Shuttles',
    vehicleTypes: 'Innova Crysta & 7-Seater SUVs',
    phone: '+18005550199',
    displayPhone: '1800-555-0199 (Toll-Free)',
    rating: '4.9 ★'
  },
  {
    id: 'tp-2',
    name: 'Royal Heritage Minibus & Vans',
    vehicleTypes: '12-Seater Tempo Traveller',
    phone: '+18005550288',
    displayPhone: '1800-555-0288 (Toll-Free)',
    rating: '4.8 ★'
  }
];

export interface LivingTripManifestProps {
  destination?: string;
  dates?: string;
  budget?: number;
  currencyCode?: CurrencyCode | string;
  status?: string;
  totalMembers?: number;
  lockedMembers?: number;
  showAISpots?: boolean;
  aiSpots?: AISpotItem[];
  showTransportCards?: boolean;
  transportCards?: TransportCardItem[];
  onPress?: () => void;
}

export function LivingTripManifest({
  destination = 'Goa, India',
  dates = 'Oct 14 – Oct 19, 2026',
  budget = 850,
  currencyCode = 'USD',
  status = 'Consensus Locked',
  totalMembers = 5,
  lockedMembers = 5,
  showAISpots = true,
  aiSpots = DEFAULT_AI_SPOTS,
  showTransportCards = false,
  transportCards = DEFAULT_TRANSPORT_CARDS,
  onPress
}: LivingTripManifestProps) {
  const curr = CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.USD;
  const formattedBudget = `${curr.symbol}${Math.round(budget * curr.rate).toLocaleString()}`;

  const [selectedSpot, setSelectedSpot] = useState<AISpotItem | null>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleSpotPress = (spot: AISpotItem) => {
    triggerHaptic();
    setSelectedSpot(spot);
  };

  const handleOpenMap = (query?: string) => {
    triggerHaptic();
    const cleanQuery = query || destination;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQuery)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.rootWrapper}>
      {/* Manifest Core Card */}
      <TouchableOpacity
        activeOpacity={onPress ? 0.85 : 1}
        onPress={onPress}
        style={styles.container}
        accessibilityLabel={`Living Trip Manifest for ${destination}`}
      >
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Pin size={12} color="#3DE0A0" />
            <Text style={styles.badgeText}>LIVING TRIP MANIFEST</Text>
          </View>
          <View style={styles.statusPill}>
            <ShieldCheck size={11} color="#3DE0A0" />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{destination}</Text>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <MapPin size={14} color="#FF5A5F" />
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Destination</Text>
              <Text style={styles.itemValue} numberOfLines={1}>{destination}</Text>
            </View>
          </View>

          <View style={styles.gridItem}>
            <Calendar size={14} color="#3DE0A0" />
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Target Travel Window</Text>
              <Text style={styles.itemValue} numberOfLines={1}>{dates}</Text>
            </View>
          </View>

          <View style={styles.gridItem}>
            <DollarSign size={14} color="#D4AF37" />
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Budget Ceiling</Text>
              <Text style={styles.itemValue}>{formattedBudget} / person ({currencyCode})</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerSpec}>
            <Plane size={12} color="#8B8D98" />
            <Text style={styles.footerSpecText}>Flight Specs Synchronized</Text>
          </View>
          <View style={styles.footerSpec}>
            <Building2 size={12} color="#8B8D98" />
            <Text style={styles.footerSpecText}>Villa Hold Active</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* AI-Selected Consensus Highlights */}
      {showAISpots && (
        <View style={styles.curatedSpotsCard}>
          <View style={styles.curatedHeaderRow}>
            <Sparkles size={16} color="#3DE0A0" />
            <Text style={styles.curatedSpotsTitle}>AI-Selected Consensus Highlights</Text>
          </View>
          <Text style={styles.curatedSpotsSubtitle}>
            Tap any activity to inspect Gemini's group preference & budget alignment rationale.
          </Text>

          {aiSpots.map((spot, index) => {
            const isLast = index === aiSpots.length - 1;
            return (
              <TouchableOpacity
                key={spot.id}
                activeOpacity={0.7}
                onPress={() => handleSpotPress(spot)}
                style={[styles.spotItemRow, isLast && { borderBottomWidth: 0 }]}
                accessibilityRole="button"
                accessibilityLabel={`${spot.name}, ${spot.vibeMatch}`}
                accessibilityHint="Opens AI rationale and location metrics modal"
              >
                <Text style={styles.spotEmoji}>{spot.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spotName}>{spot.name}</Text>
                  <Text style={styles.spotMeta}>{spot.vibeMatch}</Text>
                </View>
                <View style={[styles.curatedTagPill, index === 0 && styles.topCuratedTagPill]}>
                  {index === 0 ? (
                    <Text style={styles.topCuratedTagText}>✦ CURATED BY GEMINI</Text>
                  ) : (
                    <>
                      <Sparkles size={10} color="#3DE0A0" />
                      <Text style={styles.curatedTagText}>AI Insight</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Verified Local Transport Partners */}
      {showTransportCards && (
        <View style={styles.transportSectionCard}>
          <View style={styles.curatedHeaderRow}>
            <ShieldCheck size={16} color="#3DE0A0" />
            <Text style={styles.curatedSpotsTitle}>Verified Local Transport</Text>
          </View>
          <Text style={styles.curatedSpotsSubtitle}>
            Pre-vetted local transit providers with fixed group pricing and verified safety credentials.
          </Text>

          {transportCards.map((partner) => (
            <View key={partner.id} style={styles.transportCard}>
              <View style={styles.transportCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transportCardName}>{partner.name}</Text>
                  <Text style={styles.transportCardSub}>{partner.vehicleTypes} • {partner.rating}</Text>
                </View>
                <View style={styles.localPartnerBadge}>
                  <ShieldCheck size={11} color="#3DE0A0" />
                  <Text style={styles.localPartnerBadgeText}>100% LOCAL PARTNER</Text>
                </View>
              </View>
              <View style={styles.transportCardBottom}>
                <Text style={styles.transportPhone}>{partner.displayPhone}</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${partner.phone}`).catch(() => {})}
                  style={styles.transportCallBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${partner.name}`}
                >
                  <Text style={styles.transportCallBtnText}>Call / Inquire</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Sleek AI Travel Spot Details Modal / Bottom Sheet */}
      {selectedSpot && (
        <Modal
          visible={!!selectedSpot}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedSpot(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedSpot(null)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close spot details"
              >
                <X size={18} color="#8B8D98" />
              </TouchableOpacity>

              {/* Header Badge */}
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalEmoji}>{selectedSpot.emoji}</Text>
                <View style={styles.geminiBadge}>
                  <Sparkles size={11} color="#3DE0A0" />
                  <Text style={styles.geminiBadgeText}>{selectedSpot.curatedTag}</Text>
                </View>
              </View>

              <Text style={styles.modalSpotTitle}>{selectedSpot.name}</Text>
              <Text style={styles.modalSpotVibe}>{selectedSpot.vibeMatch}</Text>

              {/* Why It Fits Your Group Box */}
              <View style={styles.rationaleCard}>
                <View style={styles.rationaleTitleRow}>
                  <Compass size={13} color="#FF5A5F" />
                  <Text style={styles.rationaleTitle}>Why it fits your group</Text>
                </View>
                <Text style={styles.rationaleText}>{selectedSpot.whyItFits}</Text>
              </View>

              {/* Quick Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <MapPin size={14} color="#FF5A5F" />
                  <Text style={styles.metricLabel}>Distance</Text>
                  <Text style={styles.metricValue}>{selectedSpot.distance}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Clock size={14} color="#3DE0A0" />
                  <Text style={styles.metricLabel}>Recommended</Text>
                  <Text style={styles.metricValue}>{selectedSpot.duration}</Text>
                </View>

                <View style={styles.metricItem}>
                  <DollarSign size={14} color="#D4AF37" />
                  <Text style={styles.metricLabel}>Est. Cost</Text>
                  <Text style={styles.metricValue}>{selectedSpot.estimatedCost}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleOpenMap(selectedSpot.mapQuery || selectedSpot.name)}
                style={styles.mapActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Explore Location in Maps"
                accessibilityHint="Opens external maps location"
              >
                <ExternalLink size={16} color="#052E20" />
                <Text style={styles.mapActionBtnText}>Explore Location in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

export default LivingTripManifest;

const styles = StyleSheet.create({
  rootWrapper: {
    marginBottom: 16
  },
  container: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.28)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  badgeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3DE0A0',
    letterSpacing: 0.5
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  statusText: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#3DE0A0',
    fontWeight: '600'
  },
  title: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 12
  },
  grid: {
    gap: 10,
    marginBottom: 12
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  itemTextCol: {
    flex: 1
  },
  itemLabel: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#8B8D98'
  },
  itemValue: {
    fontFamily: fontUIBold,
    fontSize: 12.5,
    color: '#F4F3F0'
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  footerSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  footerSpecText: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98'
  },
  curatedSpotsCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 16,
    padding: 14
  },
  curatedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  curatedSpotsTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F4F3F0'
  },
  curatedSpotsSubtitle: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    marginBottom: 10
  },
  spotItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  spotEmoji: {
    fontSize: 22
  },
  spotName: {
    fontFamily: fontUIBold,
    fontSize: 12.5,
    color: '#F4F3F0'
  },
  spotMeta: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98',
    marginTop: 2
  },
  curatedTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  curatedTagText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    color: '#3DE0A0'
  },
  topCuratedTagPill: {
    backgroundColor: 'rgba(61, 224, 160, 0.15)',
    borderColor: '#3DE0A0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  topCuratedTagText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3DE0A0',
    letterSpacing: 0.5
  },
  transportSectionCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 16,
    padding: 14,
    marginTop: 12
  },
  transportCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  transportCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  transportCardName: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#FFFFFF'
  },
  transportCardSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    marginTop: 2
  },
  localPartnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.28)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  localPartnerBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#3DE0A0'
  },
  transportCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#262938',
    paddingTop: 8
  },
  transportPhone: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98'
  },
  transportCallBtn: {
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  transportCallBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#052E20'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: '#262938',
    borderRadius: 20,
    padding: 22,
    position: 'relative'
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  modalEmoji: {
    fontSize: 26
  },
  geminiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.28)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  geminiBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#3DE0A0',
    fontWeight: '700'
  },
  modalSpotTitle: {
    fontFamily: fontDisplay,
    fontSize: 17,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 3
  },
  modalSpotVibe: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98',
    marginBottom: 14
  },
  rationaleCard: {
    backgroundColor: '#090A0F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  rationaleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6
  },
  rationaleTitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FF5A5F',
    letterSpacing: 0.3
  },
  rationaleText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#F4F3F0',
    lineHeight: 18
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 3
  },
  metricLabel: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: '#8B8D98'
  },
  metricValue: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#F4F3F0',
    textAlign: 'center'
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3DE0A0',
    borderRadius: 12,
    paddingVertical: 14
  },
  mapActionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#052E20'
  }
});
