import { useTheme } from '../hooks/useTheme';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Sparkles, X, Send, Bot, Trash2, ArrowRight, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAIChatStore } from '../store/useAIChatStore';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { FREE_DAILY_PROMPT_LIMIT, remainingPrompts } from '../lib/ai/dailyQuota';
import { fontDisplay } from '../theme/typography';

const QUICK_PROMPTS = [
  '🏖️ 5-day itinerary for Goa',
  '💰 Budget per person for Goa',
  '🤝 How to resolve budget clash?',
  '🎒 Packing list for beach trip'
];

export const PactAIChatModal: React.FC = () => {
  const router = useRouter();
  const { isOpen, closeAIChat, messages, isLoading, sendMessage, clearChat, promptsUsedToday } = useAIChatStore();
  const { theme, isDarkMode } = useTheme();
  const { subscriptionPlan } = useGatherlyStore();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const isPro = subscriptionPlan !== 'free';
  const quotaRemaining = remainingPrompts(promptsUsedToday, subscriptionPlan);
  const quotaReached = !isPro && quotaRemaining <= 0;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading || quotaReached) return;
    const q = inputText;
    setInputText('');
    sendMessage(q);
  };

  const handleChip = (promptText: string) => {
    if (quotaReached) return;
    const cleanText = promptText.replace(/^[^\w]+/, '').trim();
    sendMessage(cleanText);
  };

  const goUpgrade = () => {
    closeAIChat();
    router.push('/paywall');
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={closeAIChat}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={[styles.chatCard, { backgroundColor: isDarkMode ? '#0C1120' : '#F6EFDE' }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDarkMode ? 'rgba(253, 249, 239, 0.1)' : 'rgba(0,0,0,0.08)' }]}>
              <View style={styles.headerLeft}>
                <View style={styles.botAvatar}>
                  <Sparkles size={18} color="#0C1120" strokeWidth={2.5} />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#FDF9EF' : '#1E1A14' }]}>
                      PACT AI Advisor
                    </Text>
                    <View style={styles.onlineDot} />
                  </View>
                  {isPro ? (
                    <Text style={styles.headerSubtitle}>Powered by Gemini · Pro: unlimited AI</Text>
                  ) : (
                    <Text style={[styles.headerSubtitle, { color: quotaReached ? '#D99836' : '#A9A08C' }]}>
                      {quotaReached
                        ? `${FREE_DAILY_PROMPT_LIMIT}/${FREE_DAILY_PROMPT_LIMIT} used — daily limit reached`
                        : `Powered by Gemini · ${quotaRemaining} free prompts left today`}
                    </Text>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={clearChat}
                  style={styles.headerActionBtn}
                  activeOpacity={0.7}
                  
                >
                  <Trash2 size={16} color="#A9A08C" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={closeAIChat}
                  style={[styles.headerActionBtn, { backgroundColor: 'rgba(240, 178, 74, 0.12)' }]}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#F0B24A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Suggestion Chips */}
            <View style={styles.chipsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
                {QUICK_PROMPTS.map((chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleChip(chip)}
                    disabled={quotaReached}
                    style={[styles.chipPill, { backgroundColor: isDarkMode ? '#192038' : '#EDE4D0', borderColor: isDarkMode ? 'rgba(240, 178, 74, 0.2)' : 'rgba(0,0,0,0.1)' }, quotaReached && { opacity: 0.45 }]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, { color: isDarkMode ? '#FDF9EF' : '#1E1A14' }]}>
                      {chip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Messages Thread */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesScroll}
              contentContainerStyle={{ padding: 16, gap: 14 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <View
                    key={m.id}
                    style={[
                      styles.messageRow,
                      isUser ? styles.messageRowUser : styles.messageRowModel
                    ]}
                  >
                    {!isUser && (
                      <View style={styles.modelAvatar}>
                        <Sparkles size={14} color="#F0B24A" />
                      </View>
                    )}

                    <View
                      style={[
                        styles.messageBubble,
                        isUser
                          ? styles.bubbleUser
                          : [
                              styles.bubbleModel,
                              { backgroundColor: isDarkMode ? '#192038' : '#FFFFFF', borderColor: isDarkMode ? 'rgba(253, 249, 239, 0.1)' : 'rgba(0,0,0,0.08)' },
                              (m.isError || m.quotaBlocked) && styles.bubbleWarning,
                              m.truncated && styles.bubbleTruncated
                            ]
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isUser ? styles.messageTextUser : [styles.messageTextModel, { color: isDarkMode ? '#FDF9EF' : '#1E1A14' }]
                        ]}
                      >
                        {m.text}
                      </Text>
                      <Text
                        style={[
                          styles.timestamp,
                          { color: isUser ? '#6B5018' : '#A9A08C', alignSelf: isUser ? 'flex-end' : 'flex-start' }
                        ]}
                      >
                        {m.timestamp}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {isLoading && (
                <View style={[styles.messageRow, styles.messageRowModel]}>
                  <View style={styles.modelAvatar}>
                    <Sparkles size={14} color="#F0B24A" />
                  </View>
                  <View style={[styles.bubbleModel, { backgroundColor: isDarkMode ? '#192038' : '#FFFFFF', paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                    <ActivityIndicator size="small" color="#F0B24A" />
                    <Text style={{ fontSize: 13, color: isDarkMode ? '#A9A08C' : '#6B6252', fontStyle: 'italic' }}>
                      Gemini is generating recommendation...
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {quotaReached && (
              <View style={[styles.quotaBanner, { backgroundColor: isDarkMode ? 'rgba(240, 178, 74, 0.12)' : '#FFF3D6', borderTopColor: isDarkMode ? 'rgba(253, 249, 239, 0.1)' : 'rgba(0,0,0,0.08)' }]}>
                <Text style={[styles.quotaBannerText, { color: isDarkMode ? '#FDF9EF' : '#6A4A12' }]}>
                  You've used all {FREE_DAILY_PROMPT_LIMIT} free AI prompts today.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={goUpgrade}
                  style={styles.upgradeChip}
                >
                  <Crown size={14} color="#0C1120" />
                  <Text style={styles.upgradeChipText}>Upgrade for unlimited</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Input Bar */}
            <View style={[styles.inputBar, { backgroundColor: isDarkMode ? '#12182B' : '#EAE0CB', borderTopColor: isDarkMode ? 'rgba(253, 249, 239, 0.1)' : 'rgba(0,0,0,0.08)' }]}>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDarkMode ? '#192038' : '#FFFFFF', color: isDarkMode ? '#FDF9EF' : '#1E1A14' }]}
                placeholder={quotaReached ? 'Daily limit reached — upgrade to continue' : 'Ask Gemini anything about your trip...'}
                placeholderTextColor="#A9A08C"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline={false}
                editable={!quotaReached}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading || quotaReached}
                style={[styles.sendBtn, (!inputText.trim() || isLoading || quotaReached) && { opacity: 0.5 }]}
                activeOpacity={0.8}
              >
                <Send size={16} color="#0C1120" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end'
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  chatCard: {
    height: '86%',
    maxHeight: 700,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0B24A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontDisplay
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25C9A0'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#A9A08C'
  },
  headerActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chipsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(253, 249, 239, 0.06)'
  },
  chipPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600'
  },
  messagesScroll: {
    flex: 1
  },
  messageRow: {
    flexDirection: 'row',
    gap: 10,
    maxWidth: '88%'
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  messageRowModel: {
    alignSelf: 'flex-start'
  },
  modelAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(240, 178, 74, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  bubbleUser: {
    backgroundColor: '#F0B24A',
    borderBottomRightRadius: 4
  },
  bubbleModel: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
    maxWidth: 340
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  messageTextUser: {
    color: '#0C1120',
    fontWeight: '600'
  },
  messageTextModel: {
    lineHeight: 21
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0B24A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bubbleWarning: {
    borderColor: 'rgba(211, 80, 63, 0.55)',
    borderWidth: 1
  },
  bubbleTruncated: {
    borderColor: 'rgba(240, 178, 74, 0.65)',
    borderWidth: 1
  },
  quotaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1
  },
  quotaBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17
  },
  upgradeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0B24A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  upgradeChipText: {
    color: '#0C1120',
    fontSize: 12,
    fontWeight: '800'
  }
});
