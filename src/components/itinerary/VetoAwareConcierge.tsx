import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import {
  Sparkles,
  ShieldCheck,
  Sun,
  Sunset,
  Moon,
  Clock,
  CheckCircle2
} from 'lucide-react-native';
import {
  getVetoAwareItineraryAnchors,
  ItineraryAnchor,
  VetoAwareConciergeResult
} from '../../lib/ai/aiAdvisorClient';

export interface VetoAwareConciergeProps {
  destination: string;
  tags?: string[];
  budgetTier?: string;
  anonymizedVetoCategories?: string[];
}

export const VetoAwareConcierge: React.FC<VetoAwareConciergeProps> = ({
  destination,
  tags = ['relaxed', 'coastal'],
  budgetTier = '$400–$800',
  anonymizedVetoCategories = ['dietary_restrictions', 'late_night_noise']
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VetoAwareConciergeResult | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getVetoAwareItineraryAnchors({
      destination,
      tags,
      budgetTier,
      anonymizedVetoCategories
    })
      .then((res) => {
        if (mounted) {
          setResult(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [destination]);

  const getTimeIcon = (timeOfDay: 'Morning' | 'Afternoon' | 'Evening') => {
    switch (timeOfDay) {
      case 'Morning':
        return <Sun size={15} color="#F59E0B" />;
      case 'Afternoon':
        return <Sunset size={15} color="#FF5A5F" />;
      case 'Evening':
        return <Moon size={15} color="#3DE0A0" />;
      default:
        return <Sun size={15} color="#F59E0B" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Sparkles size={16} color="#3DE0A0" />
            <Text style={styles.titleText}>Veto-Aware AI Concierge</Text>
          </View>
          <View style={styles.badgeAnonymized}>
            <ShieldCheck size={11} color="#3DE0A0" />
            <Text style={styles.badgeAnonymizedText}>Sealed Veto Clearance</Text>
          </View>
        </View>

        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#3DE0A0" />
          <Text style={styles.loadingText}>Synthesizing 3 conflict-free itinerary anchors...</Text>
        </View>
      </View>
    );
  }

  const anchors = result?.anchors || [];

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Sparkles size={16} color="#3DE0A0" />
          <Text style={styles.titleText}>Veto-Aware AI Concierge</Text>
        </View>
        <View style={styles.badgeAnonymized}>
          <ShieldCheck size={11} color="#3DE0A0" />
          <Text style={styles.badgeAnonymizedText}>Sealed Veto Clearance</Text>
        </View>
      </View>

      <Text style={styles.subtitleText}>
        Conflict-free itinerary anchors mathematically verified against all sealed member constraints.
      </Text>

      {/* 3 Anchor Cards (Morning, Afternoon, Evening) */}
      <View style={styles.cardsList}>
        {anchors.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.timeTag}>
                {getTimeIcon(item.timeOfDay)}
                <Text style={styles.timeTagText}>{item.timeOfDay}</Text>
              </View>

              <Text style={styles.costText}>{item.costPerPerson}</Text>
            </View>

            <Text style={styles.venueName}>{item.venueName}</Text>
            <Text style={styles.description}>{item.description}</Text>

            {/* Green Constraint Clearance Shield Pill */}
            <View style={styles.shieldPill}>
              <CheckCircle2 size={12} color="#052E20" />
              <Text style={styles.shieldPillText}>{item.satisfiedConstraintBadge}</Text>
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
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  titleText: {
    fontFamily: fontDisplay,
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  badgeAnonymized: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  badgeAnonymizedText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  subtitleText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98',
    marginBottom: 14,
    lineHeight: 16
  },
  loadingBox: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  loadingText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98'
  },
  cardsList: {
    gap: 12
  },
  card: {
    backgroundColor: '#090A0F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 14
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  timeTagText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  costText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  venueName: {
    fontFamily: fontDisplay,
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F3F0',
    marginBottom: 4
  },
  description: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#B4B6C0',
    lineHeight: 17,
    marginBottom: 10
  },
  shieldPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#3DE0A0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12
  },
  shieldPillText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '800',
    color: '#052E20'
  }
});
