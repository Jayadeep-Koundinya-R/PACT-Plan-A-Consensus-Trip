import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { colors, radius, shadows } from '../../src/theme/colors';
import { Compass, Users, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const {
    isDarkMode,
    groups,
    joinGroupByCode,
    currentUserId
  } = useGatherlyStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  const inviteCode = String(code || '').toUpperCase();
  const matchedGroup = groups.find(
    (g) => g.inviteCode.toUpperCase() === inviteCode
  );

  const handleJoin = () => {
    if (matchedGroup) {
      joinGroupByCode(matchedGroup.inviteCode);
      router.replace(`/groups/${matchedGroup.id}/preferences`);
    } else {
      router.replace('/groups');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={[styles.logoIcon, { backgroundColor: theme.primary }, shadows.md]}>
          <Compass size={40} color="#FFFFFF" />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          You're Invited to a PACT Trip Circle!
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Join privately to share your available dates and budget without peer pressure.
        </Text>

        {/* Group Preview Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            shadows.md
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.codeBadge, { color: theme.primary }]}>
              INVITE CODE: {inviteCode}
            </Text>
          </View>

          <Text style={[styles.groupName, { color: theme.textPrimary }]}>
            {matchedGroup ? matchedGroup.name : 'College Reunion Trip'}
          </Text>

          <View style={styles.groupMetaRow}>
            <View style={styles.metaItem}>
              <Users size={14} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {matchedGroup ? matchedGroup.totalMembersCount : 5} Travelers Invited
              </Text>
            </View>
          </View>

          <View style={[styles.privacyBox, { backgroundColor: theme.surfaceSubtle }]}>
            <ShieldCheck size={16} color={theme.success} />
            <Text style={[styles.privacyBoxText, { color: theme.textSecondary }]}>
              Your individual constraints are 100% private. Only shared group consensus is surfaced.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleJoin}
            style={[styles.joinBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.joinBtnText}>Join Circle & Submit Constraints</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.replace('/auth')}
          style={styles.switchAccountBtn}
        >
          <Text style={[styles.switchAccountText, { color: theme.textSecondary }]}>
            Not logged in? Sign in / Switch Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center'
  },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18
  },
  card: {
    width: '100%',
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16
  },
  cardHeader: {
    marginBottom: 6
  },
  codeBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  groupName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8
  },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 16
  },
  privacyBoxText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1
  },
  joinBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.btn
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  switchAccountBtn: {
    paddingVertical: 8
  },
  switchAccountText: {
    fontSize: 12,
    fontWeight: '600'
  }
});
