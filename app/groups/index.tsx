import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  Users,
  Plus,
  KeyRound,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  X,
  Compass
} from 'lucide-react-native';

export default function GroupsScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    groups = [],
    activeGroupId,
    setActiveGroup,
    createGroup,
    joinGroupByCode,
    subscriptionPlan,
    currentUserId = 'user-maya-001'
  } = useGatherlyStore();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = isDarkMode ? colors.dark : colors.light;
  const isPro = subscriptionPlan !== 'free';

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    if (!isPro && groups.length >= 1 && currentUserId.startsWith('user-')) {
      setCreateModalVisible(false);
      router.push('/paywall');
      return;
    }

    triggerHaptic();
    setIsSubmitting(true);
    try {
      const created = await createGroup(newGroupName.trim());
      setNewGroupName('');
      setCreateModalVisible(false);
      router.push(`/groups/${created.id}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Error creating group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    setJoinError('');
    if (!joinCode.trim()) {
      setJoinError('Please enter a 6-digit invite code.');
      return;
    }

    triggerHaptic();
    setIsSubmitting(true);
    try {
      const res = await joinGroupByCode(joinCode.trim().toUpperCase());
      if (res.success && res.group) {
        setJoinCode('');
        router.push(`/groups/${res.group.id}`);
      } else {
        setJoinError(res.message);
      }
    } catch (err: any) {
      setJoinError('Failed to join circle. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top PACT Brand Header Frame Box */}
        <View
          style={[
            styles.brandHeaderBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          >
            <ArrowLeft size={16} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandTextCol}>
            <View style={styles.brandTitleRow}>
              <View style={[styles.brandLogoCircle, { backgroundColor: theme.primary }]}>
                <Compass size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={[styles.brandTitleText, { color: theme.textPrimary }]}>
                PACT
              </Text>
            </View>
            <Text style={[styles.brandSubtitleText, { color: theme.primary }]}>
              Plan A Consensus Trip
            </Text>
          </View>

          <ThemeToggle />
        </View>

        {/* Join Circle with Code Card */}
        <View
          style={[
            styles.joinCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.joinHeaderRow}>
            <View style={[styles.joinIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
              <KeyRound size={18} color={theme.primary} />
            </View>
            <View style={styles.joinTextCol}>
              <Text style={[styles.joinTitle, { color: theme.textPrimary }]}>
                Join with an Invite Code
              </Text>
              <Text style={[styles.joinSub, { color: theme.textSecondary }]}>
                Got a 6-character code from a friend?
              </Text>
            </View>
          </View>

          <View style={styles.joinInputRow}>
            <TextInput
              style={[
                styles.joinInput,
                { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
              ]}
              value={joinCode}
              onChangeText={(t) => setJoinCode(t.toUpperCase())}
              placeholder="e.g. GOA-2026"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
              maxLength={12}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleJoinGroup}
              disabled={isSubmitting}
              style={[styles.joinSubmitBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.joinSubmitBtnText}>Join</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {Boolean(joinError) && (
            <Text style={styles.errorText}>{joinError}</Text>
          )}
        </View>

        {/* Section: Your Circles */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Active Spaces ({groups.length})
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCreateModalVisible(true)}
            style={[styles.createPillBtn, { backgroundColor: theme.primary }]}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.createPillBtnText}>New Circle</Text>
          </TouchableOpacity>
        </View>

        {/* Circles List */}
        <View style={styles.circlesList}>
          {groups.map((grp) => {
            const isSelected = grp.id === activeGroupId;

            return (
              <TouchableOpacity
                key={grp.id}
                activeOpacity={0.85}
                onPress={() => {
                  triggerHaptic();
                  setActiveGroup(grp.id);
                  router.push(`/groups/${grp.id}`);
                }}
                style={[
                  styles.circleCard,
                  { backgroundColor: theme.surface, borderColor: isSelected ? theme.primary : theme.border },
                  shadows.sm
                ]}
              >
                <View style={styles.circleLeft}>
                  <View style={[styles.circleIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFEDD5' }]}>
                    <Users size={20} color={theme.primary} />
                  </View>
                  <View style={styles.circleTextCol}>
                    <Text style={[styles.circleName, { color: theme.textPrimary }]}>
                      {grp.name}
                    </Text>
                    <Text style={[styles.circleMeta, { color: theme.textSecondary }]}>
                      Code: {grp.inviteCode} • {grp.totalMembersCount || 5} members
                    </Text>
                  </View>
                </View>

                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Tab Bar */}
      <BottomTabBar />

      {/* Create Modal */}
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.createModalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.lg
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Create Trip Circle
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              CIRCLE NAME
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border }
              ]}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="e.g. Goa Reunion 2026"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCreateGroup}
              disabled={isSubmitting || !newGroupName.trim()}
              style={[
                styles.createSubmitBtn,
                { backgroundColor: theme.primary, opacity: isSubmitting || !newGroupName.trim() ? 0.6 : 1 }
              ]}
            >
              <Text style={styles.createSubmitBtnText}>
                {isSubmitting ? 'Creating...' : 'Create & Invite Friends'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center'
  },
  brandHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: 14
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  brandTextCol: {
    alignItems: 'center',
    flex: 1
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandLogoCircle: {
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2
  },
  brandSubtitleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1
  },
  joinCard: {
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: 16
  },
  joinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  joinIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  joinTextCol: {
    flex: 1
  },
  joinTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  joinSub: {
    fontSize: 12,
    marginTop: 2
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 8
  },
  joinInput: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1
  },
  joinSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md
  },
  joinSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  createPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill
  },
  createPillBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  circlesList: {
    gap: 8,
    marginBottom: 20
  },
  circleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1
  },
  circleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  circleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleTextCol: {
    flex: 1
  },
  circleName: {
    fontSize: 14,
    fontWeight: '800'
  },
  circleMeta: {
    fontSize: 11,
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  createModalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  modalInput: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 18
  },
  createSubmitBtn: {
    paddingVertical: 14,
    borderRadius: radius.btn,
    alignItems: 'center'
  },
  createSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});