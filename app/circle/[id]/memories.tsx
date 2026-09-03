import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Share2, Plus, Download, Sparkles, Image as ImageIcon } from 'lucide-react-native';

export default function PactMemoryLibrary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groups = [] } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
      name: 'Goa',
      inviteCode: 'GOA-4F82'
    };

  const [copied, setCopied] = useState(false);

  const recap = '5 days, 5 friends, 100% consensus maintained. Favorite memory: South Goa sunset cruise.';

  const photos = [
    { bg: '#3A1F1F', by: 'Alex' },
    { bg: '#2A2416', by: 'Maya' },
    { bg: '#16241F', by: 'Sam' },
    { bg: '#1E1A2A', by: 'Jordan' }
  ];

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleCopy = async () => {
    triggerHaptic();
    try {
      await Clipboard.setStringAsync(recap);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {currentGroup.name || 'Goa'} trip memories
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert('Share Album', 'Shared private album link created.')}
              style={styles.shareBtn}
            >
              <Svg width="14" height="14" viewBox="0 0 14 14">
                <Circle cx="10.5" cy="3" r="1.8" fill="none" stroke="#8B8D98" strokeWidth="1.1" />
                <Circle cx="3" cy="7" r="1.8" fill="none" stroke="#8B8D98" strokeWidth="1.1" />
                <Circle cx="10.5" cy="11" r="1.8" fill="none" stroke="#8B8D98" strokeWidth="1.1" />
                <Path d="M4.6 6.1l4.3-2.2M4.6 7.9l4.3 2.2" stroke="#8B8D98" strokeWidth="1.1" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Memories Count Bar */}
          <View style={styles.countCard}>
            <Text style={styles.countText}>
              <Text style={styles.countBold}>128 shared memories</Text>  •  {currentGroup.name || 'Goa beach escape 2026'}
            </Text>
          </View>

          {/* 2x2 Photo Grid */}
          <View style={styles.photoGrid}>
            {photos.map((p) => (
              <View key={p.by} style={[styles.photoTile, { backgroundColor: p.bg }]}>
                <Svg width="26" height="26" viewBox="0 0 26 26" style={styles.photoCenterIcon}>
                  <Rect x="2" y="5" width="22" height="17" rx="2.5" fill="none" stroke="#F4F3F0" strokeWidth="1.3" />
                  <Circle cx="9" cy="11" r="2.3" fill="none" stroke="#F4F3F0" strokeWidth="1.3" />
                  <Path d="M2 19l6-5 4 3.5 5-5 7 6.5" fill="none" stroke="#F4F3F0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <View style={styles.photoTag}>
                  <Text style={styles.photoTagText}>By {p.by}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Add Photos Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert('Add Photos', 'Opening device gallery...')}
            style={styles.addPhotosBtn}
          >
            <Text style={styles.addPhotosBtnText}>+ Add photos / clips</Text>
          </TouchableOpacity>

          {/* Gold AI Trip Digest Card */}
          <View style={styles.aiDigestOuter}>
            <View style={styles.aiDigestInner}>
              <View style={styles.aiDigestHeader}>
                <Text style={{ fontSize: 13 }}>✨</Text>
                <Text style={styles.aiDigestTitle}>AI trip digest</Text>
              </View>

              <Text style={styles.aiDigestRecap}>"{recap}"</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCopy}
                style={[
                  styles.copyDigestBtn,
                  copied && { backgroundColor: 'rgba(212,175,55,0.18)' }
                ]}
              >
                <Text
                  style={[
                    styles.copyDigestBtnText,
                    copied ? { color: '#D4AF37' } : { color: '#F4F3F0' }
                  ]}
                >
                  {copied ? 'Copied to clipboard' : 'Copy AI trip recap text'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => Alert.alert('Export ZIP', 'Compressing 128 high-res photos to Goa_Trip_Album.zip...')}
            style={styles.downloadZipBtn}
          >
            <Text style={styles.downloadZipBtnText}>
              Download entire circle album (.ZIP)
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
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24
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
  headerTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 16,
    color: '#F4F3F0',
    flex: 1
  },
  shareBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  countCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16
  },
  countText: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#B4B6C0'
  },
  countBold: {
    fontFamily: fontUIBold,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12
  },
  photoTile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  photoCenterIcon: {
    opacity: 0.35
  },
  photoTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(9,10,15,0.7)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  photoTagText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  addPhotosBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  addPhotosBtnText: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98'
  },
  aiDigestOuter: {
    borderRadius: 18,
    padding: 1,
    backgroundColor: '#D4AF37',
    marginBottom: 20
  },
  aiDigestInner: {
    backgroundColor: '#13151E',
    borderRadius: 17,
    padding: 18
  },
  aiDigestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  aiDigestTitle: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  aiDigestRecap: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#D4D5DA',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 14
  },
  copyDigestBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  copyDigestBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  downloadZipBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  downloadZipBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2E0805'
  }
});