import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Sparkles, Send, Bot, Trash2, Crown, Zap, Compass, RefreshCw, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAIChatStore } from '../../src/store/useAIChatStore';
import { useGatherlyStore } from '../../src/store/useGatherlyStore';
import { FREE_DAILY_PROMPT_LIMIT, remainingPrompts } from '../../src/lib/ai/dailyQuota';
import { fontDisplay, fontUI, fontUIBold } from '../../src/theme/typography';
import { radius, shadows } from '../../src/theme/colors';
import { usePactHaptics } from '../../src/hooks/usePactHaptics';

const QUICK_PROMPTS = [
  '🏖️ 5-day itinerary for Goa',
  '💰 Budget per person for Goa',
  '🤝 How to resolve group budget clash?',
  '🎒 Packing list for 5 friends beach trip',
  '✈️ Best time to visit Kyoto for spring'
];

export default function TabAIAdvisorScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const haptics = usePactHaptics();
  const { messages, isLoading, sendMessage, clearChat, promptsUsedToday } = useAIChatStore();
  const { subscriptionPlan } = useGatherlyStore();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const isPro = subscriptionPlan !== 'free';
  const quotaRemaining = remainingPrompts(promptsUsedToday, subscriptionPlan);
  const quotaReached = !isPro && quotaRemaining <= 0;

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading || quotaReached) return;
    haptics.action();
    const q = inputText.trim();
    setInputText('');
    sendMessage(q);
  };

  const handleChip = (promptText: string) => {
    if (quotaReached) return;
    haptics.tap();
    const cleanText = promptText.replace(/^[^\w]+/, '').trim();
    sendMessage(cleanText);
  };

  const handleClear = () => {
    haptics.tap();
    clearChat();
  };

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: theme.backgroundDeep }]}>
      <View style={[styles.phoneFrame, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Top App Header */}
          <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarBox, { backgroundColor: theme.primary }]}>
                <Sparkles size={18} color="#050608" strokeWidth={2.5} />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    PACT AI Advisor
                  </Text>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Gemini 1.5</Text>
                  </View>
                </View>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {isPro
                    ? 'Organizer Pass · Unlimited AI prompts active'
                    : `${quotaRemaining} free prompts left today`}
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {messages.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  activeOpacity={0.7}
                  style={[styles.headerBtn, { borderColor: theme.border }]}
                  accessibilityLabel="Clear chat history"
                >
                  <Trash2 size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quota Banner */}
          {!isPro ? (
            <View style={[styles.quotaBanner, { backgroundColor: quotaReached ? 'rgba(239, 68, 68, 0.12)' : 'rgba(61, 224, 160, 0.08)', borderColor: quotaReached ? 'rgba(239, 68, 68, 0.3)' : 'rgba(61, 224, 160, 0.2)' }]}>
              <View style={styles.quotaInfo}>
                <Zap size={14} color={quotaReached ? '#EF4444' : '#3DE0A0'} />
                <Text style={[styles.quotaText, { color: quotaReached ? '#EF4444' : theme.textSecondary }]}>
                  {quotaReached
                    ? `Daily free quota reached (${FREE_DAILY_PROMPT_LIMIT}/${FREE_DAILY_PROMPT_LIMIT}). Resets midnight.`
                    : `Free Plan: ${promptsUsedToday}/${FREE_DAILY_PROMPT_LIMIT} prompts used today`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  haptics.tap();
                  router.push('/paywall');
                }}
                activeOpacity={0.8}
                style={[styles.upgradeBadge, { backgroundColor: theme.primary }]}
              >
                <Crown size={11} color="#050608" />
                <Text style={styles.upgradeBadgeText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.quotaBanner, { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.25)' }]}>
              <View style={styles.quotaInfo}>
                <Crown size={14} color="#D4AF37" />
                <Text style={[styles.quotaText, { color: '#D4AF37', fontWeight: '700' }]}>
                  PACT Pro Organizer Pass Active · Unlimited Advisor Access
                </Text>
              </View>
            </View>
          )}

          {/* Chat Messages List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={[styles.welcomeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.welcomeIconBox, { backgroundColor: 'rgba(255, 90, 95, 0.12)' }]}>
                    <Compass size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>
                    Plan trips with consensus & intelligence
                  </Text>
                  <Text style={[styles.welcomeBody, { color: theme.textSecondary }]}>
                    Ask for realistic travel budgets, destination recommendations, deadlock compromise proposals, or custom itineraries for your circle.
                  </Text>
                </View>

                <Text style={[styles.quickHeading, { color: theme.textSecondary }]}>
                  Try asking:
                </Text>
                <View style={styles.quickChipsList}>
                  {QUICK_PROMPTS.map((prompt) => (
                    <TouchableOpacity
                      key={prompt}
                      onPress={() => handleChip(prompt)}
                      activeOpacity={0.75}
                      style={[styles.quickChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                      <Text style={[styles.quickChipText, { color: theme.textPrimary }]}>
                        {prompt}
                      </Text>
                      <ArrowRight size={13} color={theme.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <>
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgRow,
                      msg.role === 'user' ? styles.msgRowUser : styles.msgRowModel
                    ]}
                  >
                    {msg.role === 'model' && (
                      <View style={[styles.msgAvatar, { backgroundColor: theme.primaryLight }]}>
                        <Bot size={14} color={theme.primary} />
                      </View>
                    )}
                    <View
                      style={[
                        styles.msgBubble,
                        msg.role === 'user'
                          ? [styles.msgBubbleUser, { backgroundColor: theme.primary }]
                          : [styles.msgBubbleModel, { backgroundColor: theme.surface, borderColor: theme.border }],
                        msg.isError && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.12)' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.msgText,
                          msg.role === 'user'
                            ? styles.msgTextUser
                            : [styles.msgTextModel, { color: theme.textPrimary }],
                          msg.isError && { color: '#EF4444' }
                        ]}
                        selectable
                      >
                        {msg.text}
                      </Text>
                      <Text
                        style={[
                          styles.msgTime,
                          msg.role === 'user' ? styles.msgTimeUser : { color: theme.textMuted }
                        ]}
                      >
                        {msg.timestamp}
                      </Text>
                    </View>
                  </View>
                ))}

                {isLoading && (
                  <View style={[styles.msgRow, styles.msgRowModel]}>
                    <View style={[styles.msgAvatar, { backgroundColor: theme.primaryLight }]}>
                      <Bot size={14} color={theme.primary} />
                    </View>
                    <View style={[styles.msgBubble, styles.msgBubbleModel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator size="small" color={theme.primary} />
                        <Text style={[styles.msgTextModel, { color: theme.textSecondary }]}>
                          Gemini is thinking...
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Quick Prompts strip when chatting */}
          {messages.length > 0 && !quotaReached && (
            <View style={[styles.quickBarMini, { borderTopColor: theme.border, backgroundColor: theme.surfaceSubtle }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBarContent}>
                {QUICK_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => handleChip(p)}
                    activeOpacity={0.7}
                    style={[styles.miniChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <Text style={[styles.miniChipText, { color: theme.textSecondary }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bottom Input Area */}
          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.background,
                  color: theme.textPrimary,
                  borderColor: theme.border
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                quotaReached
                  ? 'Daily limit reached. Upgrade for unlimited prompts.'
                  : 'Ask PACT AI about destinations, budgets, compromises...'
              }
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={1000}
              editable={!quotaReached && !isLoading}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading || quotaReached}
              activeOpacity={0.8}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: (!inputText.trim() || isLoading || quotaReached)
                    ? (isDarkMode ? '#282C3E' : '#E0DDD5')
                    : theme.primary
                }
              ]}
            >
              <Send
                size={16}
                color={(!inputText.trim() || isLoading || quotaReached) ? '#6C6F7A' : '#050608'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    overflow: 'hidden'
  },
  keyboardContainer: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 16,
    fontWeight: '700'
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3DE0A0'
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quotaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1
  },
  quotaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1
  },
  quotaText: {
    fontSize: 11.5,
    fontWeight: '600'
  },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  upgradeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#050608'
  },
  messagesScroll: {
    flex: 1
  },
  messagesContent: {
    padding: 16,
    gap: 14
  },
  emptyStateContainer: {
    paddingTop: 10,
    gap: 16
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    alignItems: 'center'
  },
  welcomeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  welcomeTitle: {
    fontFamily: fontDisplay,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6
  },
  welcomeBody: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center'
  },
  quickHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 6
  },
  quickChipsList: {
    gap: 9
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '85%'
  },
  msgRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  msgRowModel: {
    alignSelf: 'flex-start'
  },
  msgAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4
  },
  msgBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  msgBubbleUser: {
    borderBottomRightRadius: 4
  },
  msgBubbleModel: {
    borderBottomLeftRadius: 4,
    borderWidth: 1
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 19
  },
  msgTextUser: {
    color: '#050608',
    fontWeight: '600'
  },
  msgTextModel: {
    fontWeight: '400'
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  msgTimeUser: {
    color: 'rgba(5, 6, 8, 0.6)'
  },
  quickBarMini: {
    borderTopWidth: 1,
    paddingVertical: 6
  },
  quickBarContent: {
    paddingHorizontal: 12,
    gap: 8
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1
  },
  miniChipText: {
    fontSize: 11,
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13.5,
    borderWidth: 1
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
