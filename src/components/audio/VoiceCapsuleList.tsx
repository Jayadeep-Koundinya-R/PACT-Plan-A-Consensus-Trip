import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';
import { Play, Pause, Volume2, Mic } from 'lucide-react-native';
import { usePactHaptics } from '../../hooks/usePactHaptics';

export interface VoiceCapsuleItem {
  id: string;
  authorName: string;
  durationSeconds: number;
  createdAt: string;
  note?: string;
}

export interface VoiceCapsuleListProps {
  capsules: VoiceCapsuleItem[];
}

export const PRESEEDED_DEMO_CAPSULES: VoiceCapsuleItem[] = [
  {
    id: 'demo_c1',
    authorName: 'Maya',
    durationSeconds: 12,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    note: 'Excited for the private pool villa!'
  },
  {
    id: 'demo_c2',
    authorName: 'Sam',
    durationSeconds: 18,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    note: 'Check the airport transfer receipt in vault.'
  }
];

export const VoiceCapsuleList: React.FC<VoiceCapsuleListProps> = ({
  capsules
}) => {
  const haptics = usePactHaptics();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const displayList =
    capsules && capsules.length > 0 ? capsules : PRESEEDED_DEMO_CAPSULES;

  const handlePlayToggle = (id: string) => {
    haptics.tap();
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const formatTimeAgo = (isoStr: string) => {
    try {
      const diffMs = Date.now() - new Date(isoStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 60) return `${Math.max(1, mins)}m ago`;
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Shared Voice Capsules</Text>

      <View style={styles.listCol}>
        {displayList.map((item) => {
          const isPlaying = playingId === item.id;
          return (
            <View key={item.id} style={styles.capsuleCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePlayToggle(item.id)}
                style={[
                  styles.playBtn,
                  isPlaying && { backgroundColor: '#3DE0A0' }
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Play voice capsule by ${item.authorName}`}
              >
                {isPlaying ? (
                  <Pause size={14} color="#052E20" fill="#052E20" />
                ) : (
                  <Play size={14} color="#F4F3F0" fill="#F4F3F0" />
                )}
              </TouchableOpacity>

              <View style={styles.capsuleInfoCol}>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{item.authorName}</Text>
                  <Text style={styles.timeMeta}>
                    {item.durationSeconds}s · {formatTimeAgo(item.createdAt)}
                  </Text>
                </View>

                {/* Tactile Audio Waveform Graphic */}
                <View style={styles.waveformRow}>
                  <Text
                    style={[
                      styles.waveformGraphic,
                      isPlaying && styles.waveformGraphicPlaying
                    ]}
                  >
                    ılı.lıllılı.ıllı.lıllı
                  </Text>
                </View>

                {item.note && (
                  <Text style={styles.noteText} numberOfLines={1}>
                    "{item.note}"
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16
  },
  sectionTitle: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#8B8D98',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  listCol: {
    gap: 10
  },
  capsuleCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  playBtn: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center'
  },
  capsuleInfoCol: {
    flex: 1
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3
  },
  authorName: {
    fontFamily: fontUIBold,
    fontSize: 13,
    color: '#F4F3F0'
  },
  timeMeta: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98'
  },
  waveformRow: {
    paddingVertical: 2
  },
  waveformGraphic: {
    fontFamily: fontUIBold,
    fontSize: 14,
    color: '#8B8D98',
    letterSpacing: 1
  },
  waveformGraphicPlaying: {
    color: '#3DE0A0'
  },
  noteText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A',
    marginTop: 2
  }
});
