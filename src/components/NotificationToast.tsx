import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import { useNotificationStore } from '../store/useNotificationStore';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { colors } from '../theme/colors';
import { Sparkles, Bell, Zap, Shield, X } from 'lucide-react-native';

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast, openNotificationCenter } = useNotificationStore();
  const { isDarkMode } = useGatherlyStore();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeToast) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 12,
          useNativeDriver: Platform.OS !== 'web',
          tension: 80,
          friction: 9
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start(() => {
      dismissToast();
    });
  };

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
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
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: isDarkMode ? '#192038' : '#FFFFFF',
          borderColor: isDarkMode ? 'rgba(255, 90, 95, 0.4)' : 'rgba(212, 149, 43, 0.5)'
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          handleDismiss();
          openNotificationCenter();
        }}
        style={styles.toastContent}
      >
        <View style={[styles.iconBadge, { backgroundColor: isDarkMode ? 'rgba(255, 90, 95, 0.15)' : '#FFF3D6' }]}>
          {getIcon()}
        </View>

        <View style={styles.textCol}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: isDarkMode ? '#F4F3F0' : '#1E1A14' }]} numberOfLines={1}>
              {activeToast.title}
            </Text>
            <Text style={styles.badgeText}>AI NOTIFY</Text>
          </View>
          <Text style={[styles.body, { color: isDarkMode ? '#8B8D98' : '#5C5446' }]} numberOfLines={2}>
            {activeToast.body}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn} activeOpacity={0.7}>
        <X size={14} color={isDarkMode ? '#6C6F7A' : '#8A8068'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 14 : 48,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textCol: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2
  },
  title: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    flex: 1
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#FF5A5F',
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  body: {
    fontFamily: 'System',
    fontSize: 12,
    lineHeight: 16
  },
  closeBtn: {
    padding: 6,
    marginLeft: 6
  }
});
