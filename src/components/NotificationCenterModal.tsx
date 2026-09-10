import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform
} from 'react-native';
import { useNotificationStore, PactNotification } from '../store/useNotificationStore';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { colors } from '../theme/colors';
import { usePactHaptics } from '../hooks/usePactHaptics';
import {
  Bell,
  Sparkles,
  Zap,
  Shield,
  X,
  CheckCheck,
  Trash2,
  Lock,
  ArrowUpRight
} from 'lucide-react-native';

export const NotificationCenterModal: React.FC = () => {
  const {
    notifications,
    isOpen,
    closeNotificationCenter,
    markAllAsRead,
    clearNotifications,
    simulateAINotification,
    simulateNudgeNotification
  } = useNotificationStore();

  const { isDarkMode } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  const haptics = usePactHaptics();

  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'circle'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'ai') return n.type === 'ai';
    if (activeTab === 'circle') return n.type === 'circle' || n.type === 'nudge' || n.type === 'consensus';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: PactNotification['type']) => {
    switch (type) {
      case 'ai':
        return <Sparkles size={16} color="#FF5A5F" />;
      case 'consensus':
        return <Zap size={16} color="#3DE0A0" />;
      case 'nudge':
        return <Bell size={16} color="#FF5A5F" />;
      default:
        return <Shield size={16} color="#3DE0A0" />;
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeNotificationCenter}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDarkMode ? '#090A0F' : '#F6EFDE',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.1)'
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.bellBox, { backgroundColor: isDarkMode ? 'rgba(255, 90, 95, 0.15)' : '#FFEFC9' }]}>
                <Bell size={18} color="#FF5A5F" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.headerTitle, { color: isDarkMode ? '#F4F3F0' : '#1E1A14' }]}>
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadCountPill}>
                      <Text style={styles.unreadCountText}>{unreadCount} new</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#8B8D98' : '#6B6252' }]}>
                  AI insights, circle updates & gentle nudges
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                closeNotificationCenter();
              }}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={18} color={isDarkMode ? '#8B8D98' : '#5C5446'} />
            </TouchableOpacity>
          </View>

          {/* Interactive Simulation Bar for Judges & Testers */}
          <View style={[styles.simulationBar, { backgroundColor: isDarkMode ? '#192038' : '#ECE4D0' }]}>
            <View style={styles.simLabelRow}>
              <Sparkles size={13} color="#FF5A5F" />
              <Text style={[styles.simLabelText, { color: isDarkMode ? '#F4F3F0' : '#1E1A14' }]}>
                Interactive Demo Triggers
              </Text>
            </View>
            <View style={styles.simBtnRow}>
              <TouchableOpacity
                onPress={() => {
                  haptics.action();
                  simulateAINotification();
                }}
                style={styles.simBtnPrimary}
                activeOpacity={0.8}
              >
                <Sparkles size={12} color="#050608" />
                <Text style={styles.simBtnPrimaryText}>+ AI Advisor Insight</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  haptics.tap();
                  simulateNudgeNotification('Sam');
                }}
                style={[styles.simBtnSecondary, { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0,0,0,0.15)' }]}
                activeOpacity={0.8}
              >
                <Zap size={12} color={isDarkMode ? '#F4F3F0' : '#1E1A14'} />
                <Text style={[styles.simBtnSecondaryText, { color: isDarkMode ? '#F4F3F0' : '#1E1A14' }]}>
                  + Circle Response
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.tabRow}>
            {[
              { key: 'all', label: `All (${notifications.length})` },
              { key: 'ai', label: `AI Insights (${notifications.filter(n => n.type === 'ai').length})` },
              { key: 'circle', label: `Circle Updates (${notifications.filter(n => n.type !== 'ai').length})` }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  haptics.tap();
                  setActiveTab(tab.key as any);
                }}
                style={[
                  styles.tabChip,
                  activeTab === tab.key
                    ? { backgroundColor: '#FF5A5F' }
                    : { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.05)' }
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    activeTab === tab.key
                      ? { color: '#050608', fontWeight: '700' }
                      : { color: isDarkMode ? '#8B8D98' : '#6B6252' }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notifications Scroll List */}
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <Bell size={28} color={isDarkMode ? '#3A4260' : '#8B8D98'} />
                <Text style={[styles.emptyTitle, { color: isDarkMode ? '#F4F3F0' : '#1E1A14' }]}>
                  No notifications
                </Text>
                <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#8B8D98' : '#6B6252' }]}>
                  Tap "+ AI Advisor Insight" above to test live AI alerts.
                </Text>
              </View>
            ) : (
              filtered.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: isDarkMode ? '#192038' : '#FFFFFF',
                      borderColor: !item.read
                        ? (isDarkMode ? 'rgba(255, 90, 95, 0.45)' : 'rgba(212, 149, 43, 0.55)')
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)')
                    }
                  ]}
                >
                  <View style={styles.notifTopRow}>
                    <View style={styles.notifTypeRow}>
                      <View
                        style={[
                          styles.notifIconBox,
                          {
                            backgroundColor: item.type === 'ai'
                              ? 'rgba(255, 90, 95, 0.15)'
                              : 'rgba(61, 224, 160, 0.15)'
                          }
                        ]}
                      >
                        {getIcon(item.type)}
                      </View>
                      <View>
                        <Text style={[styles.notifTitle, { color: isDarkMode ? '#F4F3F0' : '#1E1A14' }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.notifTimestamp, { color: isDarkMode ? '#8B8D98' : '#8A8068' }]}>
                          {item.timestamp}
                        </Text>
                      </View>
                    </View>

                    {!item.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.notifBody, { color: isDarkMode ? '#8B8D98' : '#473F33' }]}>
                    {item.body}
                  </Text>

                  {/* Privacy Badge */}
                  <View style={styles.privacyShieldRow}>
                    <Shield size={11} color="#3DE0A0" />
                    <Text style={styles.privacyShieldText}>
                      {item.privacyTag || 'Zero individual budgets disclosed'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footerRow, { borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                markAllAsRead();
              }}
              style={styles.footerActionBtn}
              activeOpacity={0.7}
            >
              <CheckCheck size={14} color={isDarkMode ? '#8B8D98' : '#5C5446'} />
              <Text style={[styles.footerActionText, { color: isDarkMode ? '#8B8D98' : '#5C5446' }]}>
                Mark all read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                clearNotifications();
              }}
              style={styles.footerActionBtn}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color="#EF4444" />
              <Text style={[styles.footerActionText, { color: '#EF4444' }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  bellBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700'
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1
  },
  unreadCountPill: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8
  },
  unreadCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#050608'
  },
  closeBtn: {
    padding: 6
  },
  simulationBar: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14
  },
  simLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  simLabelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  simBtnRow: {
    flexDirection: 'row',
    gap: 8
  },
  simBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF5A5F',
    paddingVertical: 8,
    borderRadius: 8
  },
  simBtnPrimaryText: {
    color: '#050608',
    fontSize: 11,
    fontWeight: '700'
  },
  simBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8
  },
  simBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '600'
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  tabChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  tabChipText: {
    fontSize: 11
  },
  listScroll: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10
  },
  notifCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  notifTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  notifIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  notifTimestamp: {
    fontSize: 10,
    marginTop: 1
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5F'
  },
  notifBody: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8
  },
  privacyShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  privacyShieldText: {
    fontSize: 10,
    color: '#3DE0A0',
    fontWeight: '500'
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '600'
  }
});
