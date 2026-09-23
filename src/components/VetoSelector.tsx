import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Bed, Plane, Bath, ShieldAlert, Ban, Check } from 'lucide-react-native';
import { fontUI, fontUIBold } from '../theme/typography';
import { radius } from '../theme/colors';

export interface DealbreakerMeta {
  label: string;
  sub: string;
  Icon: any;
}

export const DEFAULT_DEALBREAKER_METADATA: Record<string, DealbreakerMeta> = {
  'No dorm hostels': {
    label: 'No dorms',
    sub: 'Private rooms only',
    Icon: Bed
  },
  'Flight time > 5 hrs': {
    label: 'No red-eye flights',
    sub: 'Max 5h / direct',
    Icon: Plane
  },
  'Shared bathrooms': {
    label: 'No shared bath',
    sub: 'Ensuite required',
    Icon: Bath
  }
};

export interface VetoSelectorProps {
  dealbreakers: Record<string, boolean>;
  onToggleDealbreaker: (key: string) => void;
  metadata?: Record<string, DealbreakerMeta>;
}

export function VetoSelector({
  dealbreakers,
  onToggleDealbreaker,
  metadata = DEFAULT_DEALBREAKER_METADATA
}: VetoSelectorProps) {
  const activeVetoCount = Object.values(dealbreakers).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.cardLabel}>Strict dealbreakers</Text>
          <Text style={styles.dealbreakerSub}>
            Any option with these is removed, no exceptions.
          </Text>
        </View>
        <View
          style={[
            styles.vetoCountBadge,
            activeVetoCount > 0 && styles.vetoCountBadgeActive
          ]}
        >
          <Text
            style={[
              styles.vetoCountText,
              activeVetoCount > 0 && styles.vetoCountTextActive
            ]}
          >
            {activeVetoCount} Active {activeVetoCount === 1 ? 'Veto' : 'Vetoes'}
          </Text>
        </View>
      </View>

      <View style={styles.dealbreakerGrid}>
        {Object.keys(dealbreakers).map((k) => {
          const isVetoed = Boolean(dealbreakers[k]);
          const meta = metadata[k] || {
            label: k,
            sub: 'Strict constraint',
            Icon: ShieldAlert
          };
          const IconComponent = meta.Icon;

          return (
            <TouchableOpacity
              key={k}
              activeOpacity={0.82}
              onPress={() => onToggleDealbreaker(k)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isVetoed }}
              accessibilityLabel={`Dealbreaker: ${meta.label}. ${meta.sub}. ${
                isVetoed
                  ? 'Veto active. Tap to allow option.'
                  : 'Option allowed. Tap to trigger veto constraint.'
              }`}
              accessibilityHint="Toggles strict dealbreaker veto constraint"
              style={[
                styles.dealbreakerTile,
                isVetoed
                  ? styles.dealbreakerTileVetoed
                  : styles.dealbreakerTileAllowed
              ]}
            >
              {/* Top Tile Row: Icon Box + Status Badge */}
              <View style={styles.tileHeaderRow}>
                <View
                  style={[
                    styles.tileIconBox,
                    isVetoed
                      ? styles.tileIconBoxVetoed
                      : styles.tileIconBoxAllowed
                  ]}
                >
                  <IconComponent
                    size={18}
                    color={isVetoed ? '#FF5A5F' : '#8B8D98'}
                  />
                </View>

                <View
                  style={[
                    styles.tileStatusBadge,
                    isVetoed
                      ? styles.tileStatusBadgeVetoed
                      : styles.tileStatusBadgeAllowed
                  ]}
                >
                  {isVetoed ? (
                    <Ban size={10} color="#FF5A5F" style={styles.badgeIcon} />
                  ) : (
                    <Check size={10} color="#3DE0A0" style={styles.badgeIcon} />
                  )}
                  <Text
                    style={[
                      styles.tileStatusText,
                      isVetoed
                        ? styles.tileStatusTextVetoed
                        : styles.tileStatusTextAllowed
                    ]}
                  >
                    {isVetoed ? 'VETO' : 'ALLOWED'}
                  </Text>
                </View>
              </View>

              {/* Tile Title & Subtitle */}
              <Text
                style={[
                  styles.tileTitle,
                  isVetoed ? styles.tileTitleVetoed : styles.tileTitleAllowed
                ]}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
              <Text
                style={[
                  styles.tileSubtitle,
                  isVetoed
                    ? styles.tileSubtitleVetoed
                    : styles.tileSubtitleAllowed
                ]}
                numberOfLines={1}
              >
                {meta.sub}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  titleWrapper: {
    flex: 1,
    marginRight: 10
  },
  cardLabel: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 2
  },
  dealbreakerSub: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98'
  },
  vetoCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  vetoCountBadgeActive: {
    backgroundColor: 'rgba(255, 90, 95, 0.14)',
    borderColor: 'rgba(255, 90, 95, 0.35)'
  },
  vetoCountText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#8B8D98',
    letterSpacing: 0.3
  },
  vetoCountTextActive: {
    color: '#FF5A5F',
    fontWeight: '700'
  },
  dealbreakerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  dealbreakerTile: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 88,
    minWidth: 120,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    justifyContent: 'center'
  },
  dealbreakerTileVetoed: {
    backgroundColor: 'rgba(255, 90, 95, 0.14)',
    borderColor: '#FF5A5F',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5A5F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      },
      web: {
        boxShadow: '0 0 12px rgba(255, 90, 95, 0.35)'
      }
    })
  },
  dealbreakerTileAllowed: {
    backgroundColor: '#13151E',
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  tileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  tileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileIconBoxVetoed: {
    backgroundColor: 'rgba(255, 90, 95, 0.22)'
  },
  tileIconBoxAllowed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  tileStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: radius.pill
  },
  tileStatusBadgeVetoed: {
    backgroundColor: 'rgba(255, 90, 95, 0.22)'
  },
  tileStatusBadgeAllowed: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)'
  },
  badgeIcon: {
    marginRight: 3
  },
  tileStatusText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    letterSpacing: 0.6
  },
  tileStatusTextVetoed: {
    color: '#FF5A5F',
    fontWeight: '700'
  },
  tileStatusTextAllowed: {
    color: '#3DE0A0',
    fontWeight: '600'
  },
  tileTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    marginBottom: 2
  },
  tileTitleVetoed: {
    color: '#F4F3F0',
    fontWeight: '700'
  },
  tileTitleAllowed: {
    color: '#F4F3F0'
  },
  tileSubtitle: {
    fontFamily: fontUI,
    fontSize: 11
  },
  tileSubtitleVetoed: {
    color: '#FF8A8D'
  },
  tileSubtitleAllowed: {
    color: '#8B8D98'
  }
});
