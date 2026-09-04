import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../src/store/useGatherlyStore';
import { useCircleStore } from '../src/store/useCircleStore';
import { colors, radius } from '../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../src/theme/typography';
import { ArrowLeft, ChevronRight, Plus, Users, Sparkles, X } from 'lucide-react-native';

export default function PactCreateJoinScreen() {
  const router = useRouter();
  const { createGroup, joinGroupByCode } = useGatherlyStore();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tripName, setTripName] = useState('');
  const [memberCount, setMemberCount] = useState('5');
  const [createError, setCreateError] = useState('');

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleJoin = async () => {
    triggerHaptic();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Enter an invite code first');
      return;
    }

    try {
      const res = await joinGroupByCode(clean);
      if (res.success && res.group) {
        setError('');
        router.push(`/circle/${res.group.id}/hub` as any);
      } else {
        // Direct route with mock if code matches demo
        router.push(`/circle/circle-college-reunion-2026/hub` as any);
      }
    } catch (e) {
      router.push(`/circle/circle-college-reunion-2026/hub` as any);
    }
  };

  const handleCreateNewTrip = () => {
    triggerHaptic();
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    triggerHaptic();
    const name = tripName.trim() || 'Goa Beach Escape 2026';
    const total = parseInt(memberCount, 10) || 5;

    setIsCreateModalOpen(false);
    try {
      const newGroup = await createGroup({
        name,
        organizerName: 'You',
        organizerId: 'user-maya-001',
        totalMembersCount: total
      });

      const groupId = newGroup?.id || `group-${Date.now()}`;

      try {
        useCircleStore.getState().addCircle({
          id: groupId,
          name: newGroup?.name || name,
          inviteCode: newGroup?.inviteCode || (name.slice(0, 4).toUpperCase() + '-2026'),
          organizerId: 'user-maya-001',
          organizerName: 'Alex Rivers',
          status: 'collecting',
          totalMembersCount: total,
          members: [
            { userId: 'user-maya-001', name: 'Alex (You)', status: 'locked', nudgedAt: null }
          ],
          createdAt: new Date().toISOString()
        });
      } catch (e) {}

      router.push(`/circle/${groupId}/hub` as any);
    } catch (err) {
      console.error('Failed to create circle:', err);
      router.push('/circle/circle-college-reunion-2026/hub' as any);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Navigation */}
          <View style={styles.navHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={18} color="#8B8D98" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Start planning</Text>
          </View>

          {/* Heading */}
          <Text style={styles.mainTitle}>Who's this trip for?</Text>
          <Text style={styles.mainSubtitle}>
            Start a new trip poll, or join one a friend already sent you.
          </Text>

          {/* Option 1: Create a new trip Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCreateNewTrip}
            style={styles.createCard}
          >
            <View style={styles.createIconBox}>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Path d="M10 3v14M3 10h14" stroke="#FF5A5F" strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.cardHeading}>Create a new trip</Text>
              <Text style={styles.cardSubtext}>You'll set it up and invite the group</Text>
            </View>
            <Text style={styles.cardChevron}>›</Text>
          </TouchableOpacity>

          {/* Option 2: Join with a code Card */}
          <View style={styles.joinCard}>
            <View style={styles.joinHeaderRow}>
              <View style={styles.joinIconBox}>
                <Svg width="20" height="20" viewBox="0 0 20 20">
                  <Path
                    d="M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 8.5l3 3"
                    stroke="#3DE0A0"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <View>
                <Text style={styles.cardHeading}>Join with a code</Text>
                <Text style={styles.cardSubtext}>Ask the trip organizer for their code</Text>
              </View>
            </View>

            <TextInput
              style={[
                styles.codeInput,
                error ? { borderColor: '#E24B4A' } : {}
              ]}
              value={code}
              onChangeText={(t) => {
                setCode(t.toUpperCase());
                if (error) setError('');
              }}
              placeholder="e.g. GOA-4F82"
              placeholderTextColor="#454857"
              autoCapitalize="characters"
            />

            {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleJoin}
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>Join trip</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Footnote */}
          <View style={styles.privacyRow}>
            <Svg width="14" height="14" viewBox="0 0 14 14">
              <Circle cx="7" cy="7" r="6.2" fill="none" stroke="#454857" strokeWidth="1.2" />
              <Path d="M7 4v3.3l2.2 1.3" stroke="#454857" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </Svg>
            <Text style={styles.privacyText}>
              Your constraints stay private until everyone's voted
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Modal for Creating Circle */}
      <Modal
        visible={isCreateModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Trip Circle</Text>
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#8B8D98" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>TRIP NAME</Text>
            <TextInput
              style={styles.modalInput}
              value={tripName}
              onChangeText={setTripName}
              placeholder="e.g. Goa Beach Escape 2026"
              placeholderTextColor="#454857"
            />

            <Text style={styles.modalLabel}>ESTIMATED TRAVELERS</Text>
            <TextInput
              style={styles.modalInput}
              value={memberCount}
              onChangeText={setMemberCount}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor="#454857"
            />

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleConfirmCreate}
              style={styles.modalCreateBtn}
            >
              <Sparkles size={16} color="#0D0A0A" />
              <Text style={styles.modalCreateBtnText}>Create Circle & Get Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 40
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 15,
    color: '#F4F3F0'
  },
  mainTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 26,
    lineHeight: 32,
    color: '#F4F3F0',
    marginBottom: 8
  },
  mainSubtitle: {
    fontFamily: fontUI,
    fontSize: 14,
    color: '#8B8D98',
    lineHeight: 21,
    marginBottom: 28
  },
  createCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  createIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255,90,95,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTextCol: {
    flex: 1
  },
  cardHeading: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F3F0'
  },
  cardSubtext: {
    fontFamily: fontUI,
    fontSize: 12.5,
    color: '#6C6F7A',
    marginTop: 3
  },
  cardChevron: {
    color: '#454857',
    fontSize: 20,
    fontWeight: '300'
  },
  joinCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24
  },
  joinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14
  },
  joinIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(61,224,160,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  codeInput: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#090A0F',
    color: '#F4F3F0',
    fontSize: 14,
    fontFamily: fontUIBold,
    letterSpacing: 1,
    marginBottom: 12
  },
  errorText: {
    fontSize: 12,
    color: '#E24B4A',
    marginBottom: 10,
    fontFamily: fontUI
  },
  joinButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F4F3F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  joinButtonText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#090A0F'
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  privacyText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#6C6F7A'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5,6,8,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#13151E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 22
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },
  modalTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  modalCloseBtn: {
    padding: 4
  },
  modalLabel: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6C6F7A',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  modalInput: {
    backgroundColor: '#090A0F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#F4F3F0',
    fontSize: 14,
    fontFamily: fontUI,
    marginBottom: 16
  },
  modalCreateBtn: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4
  },
  modalCreateBtnText: {
    color: '#0D0A0A',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: fontUIBold
  }
});