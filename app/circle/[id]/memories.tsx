import React, { useState } from 'react';
import {
  View,
  Image,
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
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { EmptyState } from '../../../src/components/EmptyState';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Share2, Plus, Download, Sparkles, Image as ImageIcon, Check, Copy, RefreshCw } from 'lucide-react-native';
import { MemoryPhotoSkeleton } from '../../../src/components/SkeletonLoader';

export default function PactMemoryLibrary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], finalizedBrief, memoryPhotos = {} } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: (id && id !== 'undefined') ? id : (groups[0]?.id || 'circle-college-reunion-2026'),
      name: 'Goa',
      inviteCode: 'GOA-4F82'
    };

  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncMemories = () => {
    haptics.tap();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      haptics.success();
    }, 1200);
  };

  // Seeded photos from central store — never blank in offline or preview mode
  const storePhotos = memoryPhotos[currentGroup.id] || memoryPhotos['circle-college-reunion-2026'] || [];
  const curatedPhotos = [
    {
      id: 'p1',
      uri: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
      by: 'Alex',
      caption: 'Goa Sunset Beach',
      bg: '#1A1820'
    },
    {
      id: 'p2',
      uri: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      by: 'Maya',
      caption: 'Luxury South Goa Villa',
      bg: '#181E24'
    },
    {
      id: 'p3',
      uri: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
      by: 'Sam',
      caption: 'Coastal Scooter Ride',
      bg: '#16241E'
    },
    {
      id: 'p4',
      uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      by: 'Jordan',
      caption: 'Beachside Dinner',
      bg: '#251C1C'
    }
  ];
  const photos = curatedPhotos;

  const hasMemories = finalizedBrief !== null || photos.length > 0;

  const recap = '5 days, 5 friends, 100% consensus maintained. Favorite memory: South Goa sunset cruise.';

  const handleCopy = async () => {
    haptics.success();
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
              
              <Text style={styles.headerTitle} numberOfLines={1}>
                {currentGroup.name ? (currentGroup.name.toLowerCase().includes('memories') ? currentGroup.name : currentGroup.name.replace(/\s*trip$/i, '') + ' Memories') : 'Goa Beach Escape Memories'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSyncMemories}
                style={[styles.shareBtn, { paddingHorizontal: 10, width: 'auto', gap: 5, flexDirection: 'row' }]}
              >
                <RefreshCw size={12} color="#8B8D98" />
                <Text style={{ fontFamily: fontUI, fontSize: 11, color: '#8B8D98' }}>Sync</Text>
              </TouchableOpacity>

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
          </View>

          {isSyncing ? (
            <View style={{ marginBottom: 20 }}>
              <View style={styles.countCard}>
                <Text style={styles.countText}>SYNCING SHARED ALBUM & CLOUD MEMORIES...</Text>
              </View>
              <MemoryPhotoSkeleton count={4} />
            </View>
          ) : !hasMemories ? (
            /* Empty State — No memories yet */
            <EmptyState
              icon="camera"
              title="No memories yet"
              description="Once your trip wraps up, upload photos and clips here to build your shared memory album."
              actionLabel="Add first photo"
              onAction={() => Alert.alert('Add Photos', 'Opening device gallery...')}
              isDarkMode={true}
            />
          ) : (
            <>
              {/* Memories Count Bar */}
              <View style={styles.countCard}>
                <Text style={styles.countText}>
                  <Text style={styles.countBold}>{photos.length > 0 ? '128 shared memories' : '0 memories'}</Text>  ·  {currentGroup.name || 'Goa beach escape 2026'}
                </Text>
              </View>

              {/* 2x2 Photo Grid */}
              <View style={styles.photoGrid}>
                {photos.map((p) => (
                  <TouchableOpacity
                    key={p.id || p.by}
                    activeOpacity={0.88}
                    onPress={() => {
                      haptics.tap();
                      Alert.alert(p.caption || 'Shared Memory', `Captured by ${p.by} during the trip.`);
                    }}
                    style={[styles.photoTile, { backgroundColor: p.bg || '#13151E' }]}
                  >
                    {p.uri ? (
                      <Image
                        source={{ uri: p.uri }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.photoOverlayGradient} />
                    <View style={styles.photoTag}>
                      <Text style={styles.photoTagText}>By {p.by}</Text>
                    </View>
                    <View style={styles.captionPill}>
                      <Text style={styles.captionText} numberOfLines={1}>{p.caption}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Add Photos Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  haptics.tap();
                  Alert.alert('Add Photos', 'Opening device gallery...');
                }}
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
                    <View style={styles.aiGoldTag}>
                      <Text style={styles.aiGoldTagText}>PRO</Text>
                    </View>
                  </View>

                  <Text style={styles.aiDigestText}>{recap}</Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCopy}
                    style={[
                      styles.aiCopyBtn,
                      copied ? { backgroundColor: '#0F6E56' } : { backgroundColor: '#D4AF37' }
                    ]}
                  >
                    {copied ? <Check size={13} color="#CFF3E4" /> : <Copy size={13} color="#3E2C0E" />}
                    <Text
                      style={[
                        styles.aiCopyBtnText,
                        copied ? { color: '#CFF3E4' } : { color: '#3E2C0E' }
                      ]}
                    >
                      {copied ? 'Copied!' : 'Copy recap to clipboard'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              haptics.action();
              Alert.alert('Download Album', 'Downloading full ZIP album to device...');
            }}
            style={styles.downloadFullBtn}
          >
            <Download size={16} color="#2E0805" />
            <Text style={styles.downloadFullBtnText}>Download entire album (.ZIP)</Text>
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
    marginRight: 10
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
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  countCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16
  },
  countText: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#8B8D98'
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
    marginBottom: 14
  },
  photoOverlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 10, 15, 0.25)'
  },
  captionPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(9, 10, 15, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8
  },
  captionText: {
    fontFamily: fontUI,
    fontSize: 9.5,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  photoTile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  photoCenterIcon: {
    opacity: 0.4
  },
  photoTag: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  photoTagText: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#B4B6C0'
  },
  addPhotosBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  addPhotosBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '600',
    color: '#8B8D98'
  },
  aiDigestOuter: {
    marginBottom: 20
  },
  aiDigestInner: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    borderRadius: 18,
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
    color: '#F4F3F0',
    flex: 1
  },
  aiGoldTag: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  aiGoldTagText: {
    fontFamily: fontUIBold,
    fontSize: 9,
    fontWeight: '700',
    color: '#3E2C0E',
    letterSpacing: 0.5
  },
  aiDigestText: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#B4B6C0',
    lineHeight: 19,
    marginBottom: 14
  },
  aiCopyBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  aiCopyBtnText: {
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
  downloadFullBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  downloadFullBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2E0805'
  }
});