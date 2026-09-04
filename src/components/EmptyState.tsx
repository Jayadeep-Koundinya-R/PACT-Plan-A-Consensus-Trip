import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { fontUI, fontUIBold, fontDisplay } from '../theme/typography';
import { Compass, Users, Sparkles, Sliders, FileText, Image as ImageIcon, FolderOpen, Camera } from 'lucide-react-native';

export type EmptyStateIcon = 'compass' | 'users' | 'sparkles' | 'sliders' | 'file' | 'image' | 'folder' | 'camera';

interface EmptyStateProps {
  icon?: EmptyStateIcon;
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
  isDarkMode = true
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  const renderIcon = () => {
    const iconColor = icon === 'sparkles' ? theme.secondary : theme.primary;
    const size = 28;
    switch (icon) {
      case 'users': return <Users size={size} color={iconColor} />;
      case 'sparkles': return <Sparkles size={size} color={iconColor} />;
      case 'sliders': return <Sliders size={size} color={theme.success} />;
      case 'file': return <FileText size={size} color={iconColor} />;
      case 'image': return <ImageIcon size={size} color={theme.secondary} />;
      case 'folder': return <FolderOpen size={size} color={theme.warning} />;
      case 'camera': return <Camera size={size} color={theme.secondary} />;
      default: return <Compass size={size} color={iconColor} />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border }
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
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
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
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 12
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    fontFamily: fontUIBold,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6
  },
  description: {
    fontFamily: fontUI,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 18
  },
  actionBtn: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: radius.pill
  },
  actionBtnText: {
    fontFamily: fontUIBold,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});