import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { Compass, Users, Sparkles, Sliders } from 'lucide-react-native';

interface EmptyStateProps {
  icon?: 'compass' | 'users' | 'sparkles' | 'sliders';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isDarkMode?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'compass',
  title,
  description,
  actionLabel,
  onAction,
  isDarkMode = false
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  const renderIcon = () => {
    switch (icon) {
      case 'users':
        return <Users size={32} color={theme.primary} />;
      case 'sparkles':
        return <Sparkles size={32} color={theme.secondary} />;
      case 'sliders':
        return <Sliders size={32} color={theme.success} />;
      default:
        return <Compass size={32} color={theme.primary} />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
        shadows.sm
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.surfaceSubtle }]}>
        {renderIcon()}
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {description}
      </Text>

      {actionLabel && onAction ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAction}
          style={[styles.actionBtn, { backgroundColor: theme.primary }, shadows.sm]}
        >
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 12
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
    marginBottom: 16
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
