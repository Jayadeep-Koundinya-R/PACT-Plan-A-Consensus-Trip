import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../../src/theme/colors';
import {
  Plus,
  Compass,
  Users,
  ChevronRight,
  Sparkles,
  KeyRound,
  X,
  LogOut,
  Moon,
  Sun
} from 'lucide-react-native';

export default function GroupsScreen() {
  const router = useRouter();
  const {
    isDarkMode,
    toggleDarkMode,
    groups,
    createGroup,
    joinGroupByCode,
    setActiveGroup,
    currentUserId,
    members
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const currentUser = members.find((m) => m.userId === currentUserId) || members[0];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const group = createGroup(newGroupName.trim());
    setNewGroupName('');
    setCreateModalVisible(false);
    router.push(`/groups/${group.id}`);
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) return;
    const res = joinGroupByCode(joinCode.trim());
    if (res.success && res.group) {
      setJoinCode('');
      setJoinError('');
      router.push(`/groups/${res.group.id}`);
    } else {
      setJoinError(res.message);
    }
  };

  const handleSelectGroup = (groupId: string) => {
    setActiveGroup(groupId);
    router.push(`/groups/${groupId}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with User Info & Actions */}
        <View style={styles.headerRow}>
          <View style={styles.userProfileRow}>
            <View style={[styles.avatarBox, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.avatarLetter, { color: theme.primaryDark }]}>
                {currentUser?.userName.charAt(0) || 'U'}
              </Text>
            </View>
            <View>
              <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                Logged in as
              </Text>
              <Text style={[styles.userNameText, { color: theme.textPrimary }]}>
                {currentUser?.userName} {currentUserId === 'user-maya-001' ? '(Organizer)' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={toggleDarkMode}
              style={[styles.headerIconButton, { backgroundColor: theme.surfaceSubtle }]}
            >
              {isDarkMode ? (
                <Sun size={18} color={theme.warning} />
              ) : (
                <Moon size={18} color={theme.textSecondary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/auth')}
              style={[styles.headerIconButton, { backgroundColor: theme.surfaceSubtle }]}
            >
              <LogOut size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.sm
          ]}
        >
          <View style={styles.heroTextCol}>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Your Trip Circles
            </Text>
            <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
              Private groups where dates, budgets, and dealbreakers align without friction.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCreateModalVisible(true)}
            style={[styles.createCircleBtn, { backgroundColor: theme.primary }]}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.createCircleBtnText}>New Circle</Text>
          </TouchableOpacity>
        </View>

        {/* Join Group with Code Box */}
        <View
          style={[
            styles.joinBox,
            { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }
          ]}
        >
          <KeyRound size={18} color={theme.primary} />
          <TextInput
            style={[
              styles.joinInput,
              { color: theme.textPrimary, backgroundColor: theme.surface, borderColor: theme.border }
            ]}
            placeholder="Enter Invite Code (e.g. GOA-2026)"
            placeholderTextColor={theme.textMuted}
            value={joinCode}
            onChangeText={(text) => {
              setJoinCode(text);
              setJoinError('');
            }}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            onPress={handleJoinGroup}
            activeOpacity={0.7}
            style={[styles.joinBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>
        {joinError ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{joinError}</Text>
        ) : null}

        {/* Groups List */}
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.textPrimary }]}>
            Active Circles ({groups.length})
          </Text>
        </View>

        <View style={styles.groupsContainer}>
          {groups.map((group) => {
            const isOrganizer = group.organizerId === currentUserId;
            const statusColor =
              group.status === 'finalized'
                ? theme.success
                : group.status === 'voting'
                ? theme.primary
                : theme.secondary;

            return (
              <TouchableOpacity
                key={group.id}
                activeOpacity={0.7}
                onPress={() => handleSelectGroup(group.id)}
                style={[
                  styles.groupCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  shadows.sm
                ]}
              >
                <View style={styles.groupMainRow}>
                  <View style={[styles.groupIconBox, { backgroundColor: theme.primaryLight }]}>
                    <Compass size={22} color={theme.primaryDark} />
                  </View>

                  <View style={styles.groupInfoCol}>
                    <View style={styles.groupTitleRow}>
                      <Text style={[styles.groupName, { color: theme.textPrimary }]}>
                        {group.name}
                      </Text>
                      {isOrganizer && (
                        <View style={[styles.organizerBadge, { backgroundColor: theme.secondaryLight }]}>
                          <Text style={[styles.organizerBadgeText, { color: theme.secondary }]}>
                            Organizer
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.groupMeta, { color: theme.textSecondary }]}>
                      Code: <Text style={{ fontWeight: '700' }}>{group.inviteCode}</Text> • 5 Responded
                    </Text>
                  </View>

                  <View style={styles.rightActionCol}>
                    <View style={[styles.statusPill, { backgroundColor: `${statusColor}20` }]}>
                      <Text style={[styles.statusPillText, { color: statusColor }]}>
                        {group.status.toUpperCase()}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={theme.textMuted} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Create New Group Modal */}
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              shadows.lg
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Create a Trip Circle
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Give your trip group a name. We will generate a private shareable invite code.
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceSubtle,
                  color: theme.textPrimary,
                  borderColor: theme.border
                }
              ]}
              placeholder="e.g. Goa New Year's Getaway"
              placeholderTextColor={theme.textMuted}
              value={newGroupName}
              onChangeText={setNewGroupName}
              autoFocus
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateGroup}
              style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.modalSubmitBtnText}>Create Circle & Invite Friends</Text>
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
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800'
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '500'
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '700'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroCard: {
    borderRadius: radius.card,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12
  },
  heroTextCol: {
    flex: 1,
    minWidth: 200
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  heroSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16
  },
  createCircleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill
  },
  createCircleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  joinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: 6
  },
  joinInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  errorText: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4
  },
  listHeader: {
    marginTop: 16,
    marginBottom: 10
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  groupsContainer: {
    gap: 10
  },
  groupCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1
  },
  groupMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  groupIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  groupInfoCol: {
    flex: 1
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700'
  },
  organizerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  organizerBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  groupMeta: {
    fontSize: 12,
    marginTop: 4
  },
  rightActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
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
    marginBottom: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  modalSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
