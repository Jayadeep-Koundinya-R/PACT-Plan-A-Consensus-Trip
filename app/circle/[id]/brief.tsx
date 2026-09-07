import { CircleRouteGuard } from '../../../src/components/common';
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Share,
  Alert
} from 'react-native';
import { ConsensusGauge, ParticleBurst } from '../../../src/components/common';
import { ConfettiEffect } from '../../../src/components/ConfettiEffect';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Share2, Calendar, Lock, Sparkles, FolderArchive, Image as ImageIcon } from 'lucide-react-native';

export default function PactTripBrief() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }
  const router = useRouter();
  const { groups = [] } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: (id && id !== 'undefined') ? id : 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82'
    };

  const haptics = usePactHaptics();

  useEffect(() => {
    // 3-stage rhythmic celebration haptics for consensus payoff
    haptics.success();
    const t1 = setTimeout(() => {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {}
      }
    }, 280);
    const t2 = setTimeout(() => {
      haptics.success();
    }, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const details = [
    { label: 'DATES', value: 'Oct 14 - Oct 19, 2026' },
    { label: 'TARGET BUDGET', value: '~$540 / person' },
    { label: 'ATTENDEES', value: 'Alex, Sam, Jordan, Maya, You' },
    { label: 'STAY TYPE', value: 'Private beach villa (fits 5)' }
  ];

  const itinerary = [
    { day: 'Day 1', text: 'Arrival, villa check-in & sunset cocktails' },
    { day: 'Day 2', text: 'South Goa heritage tour & spice plantation' },
    { day: 'Day 3', text: 'Catamaran cruise & beach nightlife' }
  ];

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleShareWhatsApp = async () => {
    triggerHaptic();
    const briefMsg = `🏖️ *PACT Consensus Brief: Goa, India*\n🗓️ Oct 14 - Oct 19, 2026\n💰 ~$540 / person\n👥 5 members locked\n📍 Private beach villa\n\nView itinerary & vouchers: https://pact.app/circle/${currentGroup.id}/brief`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(briefMsg);
        Alert.alert('Copied!', 'WhatsApp brief copied to clipboard.');
      } catch (e) {}
    } else {
      try {
        await Share.share({ message: briefMsg, title: 'PACT Trip Brief' });
      } catch (e) {}
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <ConfettiEffect durationMs={5000} count={75} />
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              
              <Text style={styles.briefCodeTitle} numberOfLines={1}>
                Trip brief #PACT-8821
              </Text>
            </View>

            <TouchableOpacity onPress={handleShareWhatsApp} activeOpacity={0.7} style={styles.shareTopBtn}>
              <Svg width="13" height="13" viewBox="0 0 13 13">
                <Circle cx="10" cy="2.8" r="1.6" fill="none" stroke="#F3EEE2" strokeWidth="1.1" />
                <Circle cx="3" cy="6.5" r="1.6" fill="none" stroke="#F3EEE2" strokeWidth="1.1" />
                <Circle cx="10" cy="10.2" r="1.6" fill="none" stroke="#F3EEE2" strokeWidth="1.1" />
                <Path d="M4.4 5.7l4.2-2.1M4.4 7.3l4.2 2.1" stroke="#F3EEE2" strokeWidth="1.1" />
              </Svg>
              <Text style={styles.shareTopBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Reanimated 3 Particle Burst */}
          <ParticleBurst active={true} durationMs={2200} />

          {/* Consensus Reached Banner with Animated ConsensusGauge */}
          <View style={styles.consensusBanner}>
            <ConsensusGauge
              value={100}
              size={84}
              strokeColor="#58A68C"
              centerText="100%"
              centerSubtext="locked"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.consensusTitle}>Consensus locked — 100%</Text>
            <Text style={styles.consensusSub}>All 5 members approved this plan.</Text>
          </View>

          {/* Official Sealed Ticket Card */}
          <View style={styles.sealedTicketContainer}>
            {/* 100% Consensus Locked Stamp */}
            <View style={styles.stampBadge}>
              <Text style={styles.stampBadgeText}>100% CONSENSUS LOCKED</Text>
            </View>

            <View style={styles.ticketBody}>
              <View style={styles.ticketMainPadding}>
                <Text style={styles.destMainHeading}>Goa, India</Text>

                <View style={styles.detailsList}>
                  {details.map((d) => (
                    <View key={d.label}>
                      <Text style={styles.detailLabel}>{d.label}</Text>
                      <Text style={styles.detailValue}>{d.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Perforation */}
              <View style={styles.perforationWrapper}>
                <View style={styles.notchLeft} />
                <View style={styles.notchRight} />
                <View style={styles.dashedLine} />
              </View>

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketFooterText}>
                  PACT-8821  •  ISSUED BY GROUP CONSENSUS
                </Text>
              </View>
            </View>
          </View>

          {/* Share & Export Buttons */}
          <View style={styles.actionsStack}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleShareWhatsApp}
              style={styles.whatsAppBriefBtn}
            >
              <Svg width="15" height="15" viewBox="0 0 15 15">
                <Path d="M7.5 1.3A6.2 6.2 0 0 0 2.2 10.8L1.3 13.7l3-1a6.2 6.2 0 1 0 3.2-11.4z" fill="#1E3A30" />
              </Svg>
              <Text style={styles.whatsAppBriefBtnText}>Send WhatsApp group brief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Alert.alert('Calendar Sync', 'Added 5 days to your Google & Apple Calendar.')}
              style={styles.secondaryActionBtn}
            >
              <Svg width="15" height="15" viewBox="0 0 15 15">
                <Rect x="1.5" y="2.7" width="12" height="10.5" rx="1.5" fill="none" stroke="#A9A08C" strokeWidth="1.1" />
                <Path d="M1.5 5.5h12M4.3 1.3v2.3M10.7 1.3v2.3" stroke="#A9A08C" strokeWidth="1.1" strokeLinecap="round" />
              </Svg>
              <Text style={styles.secondaryActionBtnText}>Add to Apple / Google calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Alert.alert('Story Export', 'High-res Instagram Story card saved to photos!')}
              style={styles.secondaryActionBtn}
            >
              <Svg width="15" height="15" viewBox="0 0 15 15">
                <Rect x="1.5" y="1.5" width="12" height="12" rx="3.5" fill="none" stroke="#C99A5B" strokeWidth="1.1" />
                <Circle cx="7.5" cy="7.5" r="3" fill="none" stroke="#C99A5B" strokeWidth="1.1" />
                <Circle cx="10.8" cy="4.2" r="0.7" fill="#C99A5B" />
              </Svg>
              <Text style={styles.secondaryActionBtnText}>Export story card (Instagram / Snap)</Text>
            </TouchableOpacity>
          </View>

          {/* Suggested 5-day Itinerary Outline */}
          <View style={styles.itineraryCard}>
            <Text style={styles.itineraryCardTitle}>Suggested 5-day outline</Text>
            <View style={styles.itineraryList}>
              {itinerary.map((it) => (
                <View key={it.day} style={styles.itineraryRow}>
                  <Text style={styles.dayBadge}>{it.day}</Text>
                  <Text style={styles.dayText}>{it.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Nav to Vault and Memories */}
          <View style={styles.quickNavRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/circle/${currentGroup.id}/vault` as any)}
              style={styles.quickNavTile}
            >
              <FolderArchive size={16} color="#C99A5B" />
              <Text style={styles.quickNavTileText}>Trip Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/circle/${currentGroup.id}/memories` as any)}
              style={styles.quickNavTile}
            >
              <ImageIcon size={16} color="#58A68C" />
              <Text style={styles.quickNavTileText}>Memories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/paywall' as any)}
              style={styles.quickNavTile}
            >
              <Sparkles size={16} color="#E0C286" />
              <Text style={styles.quickNavTileText}>PACT Pro</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push(`/circle/${currentGroup.id}/vault` as any)}
            style={styles.primaryCtaBtn}
          >
            <Text style={styles.primaryCtaBtnText}>
              Explore flight & villa options
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0C1120',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#12182B',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(243, 238, 226, 0.07)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 120
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  briefCodeTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#A9A08C',
    flex: 1
  },
  shareTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  shareTopBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#F3EEE2'
  },
  consensusBanner: {
    position: 'relative',
    backgroundColor: 'rgba(88, 166, 140,0.12)',
    shadowColor: '#58A68C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(88, 166, 140,0.45)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
    overflow: 'hidden'
  },
  confettiSvg: {
    position: 'absolute',
    top: 6,
    right: 14
  },
  consensusTitle: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#58A68C'
  },
  consensusSub: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8FB8A4',
    marginTop: 3
  },
  sealedTicketContainer: {
    position: 'relative',
    marginBottom: 18
  },
  stampBadge: {
    position: 'absolute',
    top: -10,
    right: 4,
    transform: [{ rotate: '-9deg' }],
    borderWidth: 2,
    borderColor: '#58A68C',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(18, 24, 43,0.92)',
    zIndex: 2
  },
  stampBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '700',
    color: '#58A68C',
    letterSpacing: 0.5
  },
  ticketBody: {
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    borderRadius: 18,
    overflow: 'hidden',
    paddingTop: 22
  },
  ticketMainPadding: {
    paddingHorizontal: 20,
    paddingBottom: 18
  },
  destMainHeading: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 26,
    color: '#F3EEE2',
    marginBottom: 18
  },
  detailsList: {
    gap: 12
  },
  detailLabel: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8B8474',
    letterSpacing: 0.6,
    marginBottom: 3
  },
  detailValue: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F3EEE2'
  },
  perforationWrapper: {
    position: 'relative',
    height: 1,
    justifyContent: 'center'
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#12182B',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.07)'
  },
  notchRight: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#12182B',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.07)'
  },
  dashedLine: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(243, 238, 226, 0.18)',
    marginHorizontal: 22
  },
  ticketFooter: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  ticketFooterText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#6B6455',
    letterSpacing: 0.8
  },
  actionsStack: {
    gap: 10,
    marginBottom: 18
  },
  whatsAppBriefBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  whatsAppBriefBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A30'
  },
  secondaryActionBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.14)',
    backgroundColor: '#1A2138',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  secondaryActionBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#F3EEE2'
  },
  itineraryCard: {
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16
  },
  itineraryCardTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F3EEE2',
    marginBottom: 14
  },
  itineraryList: {
    gap: 12
  },
  itineraryRow: {
    flexDirection: 'row',
    gap: 8
  },
  dayBadge: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C99A5B',
    minWidth: 42
  },
  dayText: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#C9C0AC',
    lineHeight: 18,
    flex: 1
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  quickNavTile: {
    flex: 1,
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  quickNavTileText: {
    fontFamily: fontUIBold,
    fontSize: 11.5,
    color: '#F3EEE2'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#12182B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(243, 238, 226, 0.07)'
  },
  primaryCtaBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#C99A5B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryCtaBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#231A0C'
  }
});