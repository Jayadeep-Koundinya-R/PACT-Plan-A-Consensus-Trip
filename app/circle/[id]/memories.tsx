import { useTheme } from '../../../src/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';
import { CircleRouteGuard } from '../../../src/components/common';
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
import * as Clipboard from 'expo-clipboard';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { EmptyState } from '../../../src/components/EmptyState';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Share2, Plus, Download, Sparkles, Image as ImageIcon, Check, Copy, RefreshCw, MessageSquare, Lock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useCircleChatStore } from '../../../src/store/useCircleChatStore';
import { useCircleStore } from '../../../src/store/useCircleStore';
import { MemoryPhotoSkeleton } from '../../../src/components/SkeletonLoader';
import { getActiveUserName } from '../../../src/lib/user/identity';

export default function PactMemoryLibrary() {
  const { theme, isDarkMode } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }
  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], finalizedBrief, memoryPhotos = {} } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: (id && id !== 'undefined') ? id : 'circle-college-reunion-2026',
      name: 'Goa',
      inviteCode: 'GOA-4F82'
    };

  const [copied, setCopied] = useState(false);
  const { getArchivedChatLog, getMessages } = useCircleChatStore();
  const archivedLog = getArchivedChatLog(currentGroup.id);
  const chatMessages = archivedLog ? archivedLog.messages : getMessages(currentGroup.id);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatCopied, setChatCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncMemories = () => {
    haptics.tap();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      haptics.success();
    }, 1200);
  };

  const isDemoCircle = currentGroup?.id === 'circle-college-reunion-2026';
  const circleFromStore = id ? useCircleStore.getState().getCircle(id as string) : null;
  const memberCount = circleFromStore?.members?.length || 1;
  const storePhotos = memoryPhotos[currentGroup.id] || (isDemoCircle ? memoryPhotos['circle-college-reunion-2026'] : []) || [];
  const curatedPhotos = [
    {
      id: 'p1',
      uri: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
      by: getActiveUserName(),
      caption: 'Goa Sunset Beach',
      bg: '#1B1D27'
    },
    {
      id: 'p2',
      uri: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      by: 'Maya',
      caption: 'Luxury South Goa Villa',
      bg: '#1B1D27'
    },
    {
      id: 'p3',
      uri: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
      by: 'Sam',
      caption: 'Coastal Scooter Ride',
      bg: '#052E20'
    },
    {
      id: 'p4',
      uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      by: 'Jordan',
      caption: 'Beachside Dinner',
      bg: '#3A241E'
    }
  ];
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const photos = [...uploadedPhotos, ...storePhotos, ...(isDemoCircle && storePhotos.length === 0 && uploadedPhotos.length === 0 ? curatedPhotos : [])];

  const hasMemories = finalizedBrief !== null || photos.length > 0;

  const recap = isDemoCircle
    ? '5 days, 5 friends, 100% consensus maintained. Favorite memory: South Goa sunset cruise.'
    : `Consensus trip finalized with ${memberCount} friends. 100% alignment maintained.`;

    const handleAddPhotos = async () => {
    haptics.tap();
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt: any) => {
              const uri = evt.target ? evt.target.result : '';
              const newPhoto = {
                id: 'up_' + Date.now(),
                uri,
                by: `${getActiveUserName()} (You)`,
                caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                bg: '#13151E'
              };
              setUploadedPhotos((prev: any[]) => [newPhoto, ...prev]);
              haptics.success();
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo gallery permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newPhoto = {
          id: 'up_' + Date.now(),
          uri: asset.uri,
          by: 'You',
          caption: 'Trip Memory',
          bg: '#13151E'
        };
        setUploadedPhotos((prev: any[]) => [newPhoto, ...prev]);
        haptics.success();
      }
    } catch (err: any) {
      Alert.alert('Image Picker', 'Could not open photo picker: ' + (err.message || 'unknown error'));
    }
  };

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
              <TouchableOpacity onPress={() => { haptics.tap(); if (router.canGoBack()) { router.back(); } else { router.push('/circle/' + currentGroup.id + '/hub'); } }} activeOpacity={0.7} style={styles.backBtn} accessibilityLabel="Go back to Circle Hub"><ArrowLeft size={18} color="#F4F3F0" /></TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={2}>
                {currentGroup.name ? currentGroup.name.replace(/\s*trip$/i, '') : 'Goa Beach Escape'} Memories
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

            </View>
          </View>

          {isSyncing ? (
            <View style={{ marginBottom: 20 }}>
              <View style={styles.countCard}>
                <Text style={styles.countText}>Syncing shared album & cloud memories…</Text>
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
              onAction={handleAddPhotos}
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              {/* Memories Count Bar */}
              <View style={styles.countCard}>
                <Text style={styles.countText}>
                  <Text style={styles.countBold}>{`${photos.length} shared ${photos.length === 1 ? 'memory' : 'memories'}`}</Text>  ·  {currentGroup.name || 'Goa beach escape 2026'}
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
                onPress={handleAddPhotos}
                style={styles.addPhotosBtn}
              >
                <Text style={styles.addPhotosBtnText}>+ Add photos / clips</Text>
              </TouchableOpacity>

              {/* Gold AI Trip Digest Card */}
              <View style={styles.aiDigestOuter}>
                <View style={styles.aiDigestInner}>
                  <View style={styles.aiDigestHeader}>
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
                      copied ? { backgroundColor: '#22C58B' } : { backgroundColor: '#D4AF37' }
                    ]}
                  >
                    {copied ? <Check size={13} color="#CFF3E4" /> : <Copy size={13} color="#4A3A14" />}
                    <Text
                      style={[
                        styles.aiCopyBtnText,
                        copied ? { color: '#CFF3E4' } : { color: '#4A3A14' }
                      ]}
                    >
                      {copied ? 'Copied!' : 'Copy recap to clipboard'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Trip Chat Log (Archived to Memory Library) */}
              <View style={styles.chatArchiveOuter}>
                <View style={styles.chatArchiveInner}>
                  <View style={styles.chatArchiveHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={styles.chatArchiveIconBox}>
                        <MessageSquare size={16} color="#3DE0A0" />
                      </View>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.chatArchiveTitle}>Trip Chat Log</Text>
                          <View style={styles.chatArchiveBadge}>
                            <Lock size={10} color="#D4AF37" />
                            <Text style={styles.chatArchiveBadgeText}>Archived</Text>
                          </View>
                        </View>
                        <Text style={styles.chatArchiveSubtitle}>
                          {chatMessages.length + ' circle messages preserved (read-only)'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        haptics.tap();
                        setIsChatExpanded(!isChatExpanded);
                      }}
                      style={styles.chatExpandBtn}
                      accessibilityLabel="Toggle Chat Transcript"
                    >
                      {isChatExpanded ? (
                        <ChevronUp size={16} color="#8B8D98" />
                      ) : (
                        <ChevronDown size={16} color="#8B8D98" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {isChatExpanded && (
                    <View style={styles.chatTranscriptContainer}>
                      {chatMessages.map((msg, i) => (
                        <View key={msg.id || i} style={styles.chatTranscriptRow}>
                          <Text style={styles.chatTranscriptTime}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Text style={styles.chatTranscriptSender}>{msg.userDisplayName}:</Text>
                          <Text style={styles.chatTranscriptContent}>{msg.content}</Text>
                        </View>
                      ))}

                      <View style={styles.chatActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={async () => {
                            haptics.success();
                            const transcriptText = chatMessages
                              .map((m) => '[' + new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '] ' + m.userDisplayName + ': ' + m.content)
                              .join('\n');
                            await Clipboard.setStringAsync(transcriptText);
                            setChatCopied(true);
                            setTimeout(() => setChatCopied(false), 1800);
                          }}
                          style={[styles.chatCopyBtn, chatCopied ? { backgroundColor: '#22C58B' } : null]}
                        >
                          {chatCopied ? <Check size={12} color="#CFF3E4" /> : <Copy size={12} color="#F4F3F0" />}
                          <Text style={styles.chatCopyBtnText}>{chatCopied ? 'Copied Transcript' : 'Copy Transcript'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            haptics.tap();
                            router.push(('/circle/' + currentGroup.id + '/chat') as any);
                          }}
                          style={styles.chatJumpBtn}
                        >
                          <Text style={styles.chatJumpBtnText}>{'Open Live Chat →'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
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
  chatArchiveOuter: {
    backgroundColor: "#13151E",
    borderWidth: 1,
    borderColor: "rgba(61, 224, 160, 0.25)",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    marginBottom: 20
  },
  chatArchiveInner: {
    gap: 10
  },
  chatArchiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  chatArchiveIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(61, 224, 160, 0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  chatArchiveTitle: {
    fontFamily: fontDisplay,
    fontSize: 14,
    fontWeight: '700',
    color: "#F4F3F0"
  },
  chatArchiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)"
  },
  chatArchiveBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 9.5,
    color: "#D4AF37"
  },
  chatArchiveSubtitle: {
    fontFamily: fontUI,
    fontSize: 11,
    color: "#8B8D98",
    marginTop: 2
  },
  chatExpandBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center"
  },
  chatTranscriptContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    gap: 8
  },
  chatTranscriptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6
  },
  chatTranscriptTime: {
    fontFamily: fontUI,
    fontSize: 9.5,
    color: "#6C6F7A",
    width: 48,
    marginTop: 2
  },
  chatTranscriptSender: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: "#3DE0A0"
  },
  chatTranscriptContent: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: "#F4F3F0",
    flex: 1,
    lineHeight: 16
  },
  chatActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8
  },
  chatCopyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1B1D27",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  chatCopyBtnText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: "#F4F3F0"
  },
  chatJumpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  chatJumpBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: "#3DE0A0"
  },
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
    borderColor: 'rgba(255, 255, 255, 0.11)',
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
    borderColor: 'rgba(255, 255, 255, 0.14)',
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
    color: '#4A3A14',
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
    borderTopColor: 'rgba(255, 255, 255, 0.11)'
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