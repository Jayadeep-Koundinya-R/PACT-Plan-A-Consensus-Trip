import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/hooks/useTheme';
import { useCircleStore } from '../../../src/store/useCircleStore';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { useCircleChat } from '../../../src/hooks/useCircleChat';
import { CircleMessage } from '../../../src/store/useCircleChatStore';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import {
  ArrowLeft,
  Send,
  Users,
  ShieldCheck,
  Radio,
  CheckCheck,
  Sparkles,
  MessageSquare,
  Lock
} from 'lucide-react-native';
import { CircleRouteGuard } from '../../../src/components/common';

export default function PactCircleChatScreen() {
  const { theme, isDarkMode } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }

  const router = useRouter();
  const haptics = usePactHaptics();
  const { groups = [], currentUserId: storeUserId = 'user-maya-001' } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: (id && id !== 'undefined') ? id : 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82'
    };

  const isFinalized = currentGroup?.status === 'finalized';

  // Switchable sender persona for live 2-account interaction testing
  const [activeSenderId, setActiveSenderId] = useState<string>('user-maya-001');
  const [activeSenderName, setActiveSenderName] = useState<string>('Alex (You)');
  const [inputText, setInputText] = useState<string>('');

  const { messages, sendMessage, isConnected, isSending } = useCircleChat(
    currentGroup.id,
    activeSenderId,
    activeSenderName
  );

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendMessage(textToSend, activeSenderId, activeSenderName);
  };

  const personas = [
    { id: 'user-maya-001', name: 'Alex (You)', role: 'Organizer' },
    { id: 'user-jordan-002', name: 'Jordan Lee', role: 'Member' },
    { id: 'user-sam-003', name: 'Sam Patel', role: 'Member' }
  ];

  return (
    <CircleRouteGuard id={id}>
      <SafeAreaView style={[styles.outerContainer, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          {/* Header Bar */}
          <View style={[styles.headerBar, { backgroundColor: isDarkMode ? '#0B0F17' : '#FFFFFF', borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                router.push(`/circle/${currentGroup.id}/hub` as any);
              }}
              activeOpacity={0.7}
              style={styles.backBtn}
              accessibilityLabel="Back to Circle Hub"
            >
              <ArrowLeft size={16} color="#FF5A5F" strokeWidth={2.5} />
              <Text style={styles.backBtnText}>Hub</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.textPrimary }]}>
                {currentGroup.name || 'Goa Beach Escape 2026'}
              </Text>
              <View style={styles.headerSubtitleRow}>
                <View style={[styles.liveDot, { backgroundColor: isConnected ? '#3DE0A0' : '#8B8D98' }]} />
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {isConnected ? 'Circle Chat · Live Realtime' : 'Circle Chat · Offline Sync'}
                </Text>
              </View>
            </View>

            <View style={styles.headerCapacityBadge}>
              <Users size={12} color="#3DE0A0" />
              <Text style={styles.headerCapacityText}>20 cap</Text>
            </View>
          </View>

          {/* Privacy Transparency Notice */}
          <View style={[styles.noticeBanner, { backgroundColor: isDarkMode ? '#13151E' : '#F4F3F0', borderColor: theme.border }]}>
            <ShieldCheck size={14} color="#3DE0A0" style={{ marginTop: 1 }} />
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              <Text style={{ fontFamily: fontUIBold, color: theme.textPrimary }}>Circle-wide chat: </Text>
              Visible to all invited members. Private budgets, dealbreakers, and votes remain sealed.
            </Text>
          </View>

          {/* Interactive 2-Account Switcher (for live dual-persona testing) */}
          <View style={[styles.personaSwitcherBar, { backgroundColor: isDarkMode ? '#0E1019' : '#EDE8DC' }]}>
            <Text style={[styles.personaSwitcherLabel, { color: theme.textSecondary }]}>Speaking as:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {personas.map((p) => {
                const isSelected = activeSenderId === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      haptics.tap();
                      setActiveSenderId(p.id);
                      setActiveSenderName(p.name);
                    }}
                    activeOpacity={0.75}
                    style={[
                      styles.personaPill,
                      isSelected ? styles.personaPillActive : { backgroundColor: isDarkMode ? '#1B1D27' : '#FFFFFF', borderColor: theme.border }
                    ]}
                  >
                    <Text style={[styles.personaPillText, isSelected && { color: '#050608', fontWeight: '700' }]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Message History Feed */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesScroll}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MessageSquare size={36} color="#8B8D98" style={{ marginBottom: 8, opacity: 0.5 }} />
                <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>No messages yet</Text>
                <Text style={[styles.emptyStateDesc, { color: theme.textSecondary }]}>
                  Start coordinating trip dates, villas, and activities with your circle!
                </Text>
              </View>
            ) : (
              messages.map((msg: CircleMessage, index: number) => {
                const isSelf = msg.userId === activeSenderId;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <View
                    key={msg.id || index}
                    style={[
                      styles.messageRow,
                      isSelf ? styles.messageRowSelf : styles.messageRowPeer
                    ]}
                  >
                    {!isSelf && (
                      <View style={styles.peerAvatar}>
                        <Text style={styles.peerAvatarText}>
                          {msg.userDisplayName ? msg.userDisplayName[0].toUpperCase() : 'M'}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.bubble,
                        isSelf
                          ? [styles.bubbleSelf, { backgroundColor: isDarkMode ? '#241416' : '#FFEBEB', borderColor: '#FF5A5F' }]
                          : [styles.bubblePeer, { backgroundColor: isDarkMode ? '#13151E' : '#FFFFFF', borderColor: theme.border }]
                      ]}
                    >
                      {!isSelf && (
                        <Text style={[styles.peerSenderName, { color: '#3DE0A0' }]}>
                          {msg.userDisplayName}
                        </Text>
                      )}
                      <Text style={[styles.messageContent, { color: theme.textPrimary }]}>
                        {msg.content}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={[styles.timestampText, { color: theme.textSecondary }]}>
                          {formattedTime}
                        </Text>
                        {isSelf && (
                          <CheckCheck size={11} color="#FF5A5F" style={{ marginLeft: 4 }} />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {isFinalized ? (
  <View style={[styles.archivedFooterBar, { backgroundColor: isDarkMode ? "#13151E" : "#F0EFEA", borderTopColor: theme.border }]}>
    <View style={styles.archivedFooterInfo}>
      <Lock size={14} color="#D4AF37" />
      <Text style={[styles.archivedFooterText, { color: theme.textPrimary }]}>
        Trip finalized • Chat is preserved in Memory Library
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => {
        haptics.tap();
        router.push(("/circle/" + currentGroup.id + "/memories") as any);
      }}
      activeOpacity={0.8}
      style={styles.archivedMemoriesBtn}
    >
      <Text style={styles.archivedMemoriesBtnText}>View Archive</Text>
    </TouchableOpacity>
  </View>
) : (
  <View style={[styles.inputBar, { backgroundColor: isDarkMode ? "#0B0F17" : "#FFFFFF", borderTopColor: theme.border }]}>
    <TextInput
      style={[
        styles.textInput,
        {
          backgroundColor: isDarkMode ? "#13151E" : "#F4F3F0",
          color: theme.textPrimary,
          borderColor: theme.border
        }
      ]}
      placeholder={"Message circle as " + activeSenderName + "..."}
      placeholderTextColor="#6C6F7A"
      value={inputText}
      onChangeText={setInputText}
      multiline
      maxLength={500}
    />
    <TouchableOpacity
      onPress={handleSend}
      disabled={!inputText.trim() || isSending}
      activeOpacity={0.8}
      style={[
        styles.sendBtn,
        Boolean(inputText.trim()) ? styles.sendBtnActive : styles.sendBtnDisabled
      ]}
      accessibilityLabel="Send Message"
    >
      <Send size={15} color={inputText.trim() ? "#050608" : "#8B8D98"} />
    </TouchableOpacity>
  </View>
)}
</KeyboardAvoidingView>
      </SafeAreaView>
    </CircleRouteGuard>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1
  },
  keyboardAvoid: {
    flex: 1
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 90, 95, 0.08)'
  },
  backBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#FF5A5F'
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 14,
    fontWeight: '700'
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  headerSubtitle: {
    fontFamily: fontUI,
    fontSize: 10
  },
  headerCapacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.25)'
  },
  headerCapacityText: {
    fontFamily: fontUIBold,
    fontSize: 10,
    color: '#3DE0A0'
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  noticeText: {
    flex: 1,
    fontFamily: fontUI,
    fontSize: 11,
    lineHeight: 15
  },
  personaSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    marginTop: 6
  },
  personaSwitcherLabel: {
    fontFamily: fontUIBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  personaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1
  },
  personaPillActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F'
  },
  personaPillText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  messagesScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyStateTitle: {
    fontFamily: fontDisplay,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  emptyStateDesc: {
    fontFamily: fontUI,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8
  },
  messageRowSelf: {
    justifyContent: 'flex-end'
  },
  messageRowPeer: {
    justifyContent: 'flex-start'
  },
  peerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1B1D27',
    borderWidth: 1,
    borderColor: '#3DE0A0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  peerAvatarText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#3DE0A0'
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1
  },
  bubbleSelf: {
    borderBottomRightRadius: 2
  },
  bubblePeer: {
    borderBottomLeftRadius: 2
  },
  peerSenderName: {
    fontFamily: fontUIBold,
    fontSize: 10,
    marginBottom: 2
  },
  messageContent: {
    fontFamily: fontUI,
    fontSize: 13,
    lineHeight: 18
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  timestampText: {
    fontFamily: fontUI,
    fontSize: 9
  },
  archivedFooterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10
  },
  archivedFooterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  archivedFooterText: {
    fontFamily: fontUI,
    fontSize: 12,
    flex: 1
  },
  archivedMemoriesBtn: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },
  archivedMemoriesBtnText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: "#1B1D27"
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8
  },
  textInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    fontFamily: fontUI,
    fontSize: 13
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBtnActive: {
    backgroundColor: '#FF5A5F'
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  }
});
