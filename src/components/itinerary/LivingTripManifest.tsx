import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pin, MapPin, Calendar, DollarSign, ShieldCheck, Sparkles, Plane, Building2 } from 'lucide-react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import { CURRENCIES, CurrencyCode } from '../../store/useGatherlyStore';

export interface LivingTripManifestProps {
  destination?: string;
  dates?: string;
  budget?: number;
  currencyCode?: CurrencyCode | string;
  status?: string;
  totalMembers?: number;
  lockedMembers?: number;
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
  onPress
}: LivingTripManifestProps) {
  const curr = CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.USD;
  const formattedBudget = `${curr.symbol}${Math.round(budget * curr.rate).toLocaleString()}`;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={styles.container}
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
  );
}

export default LivingTripManifest;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
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
  }
});
