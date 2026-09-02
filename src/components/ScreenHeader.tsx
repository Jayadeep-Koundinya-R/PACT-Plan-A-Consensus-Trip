import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Compass } from 'lucide-react-native';
import { ThemeToggle } from './ThemeToggle';
import { fontUIBold, fontUIExtraBold } from '../theme/typography';
import { colors, radius } from '../theme/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  isDarkMode: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightSlot,
  isDarkMode
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border
        }
      ]}
    >
      {/* Left slot: back button or spacer */}
      {onBack ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.border
            }
          ]}
        >
          <ArrowLeft size={16} color={theme.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {/* Center: logo + title + subtitle */}
      <View style={styles.center}>
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: theme.primary }
          ]}
        >
          <Compass size={13} color="#FFFFFF" />
        </View>
        <Text
          style={[
            styles.title,
            { color: theme.textPrimary }
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              { color: theme.primary }
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right slot: custom or default ThemeToggle */}
      <View style={styles.rightSlot}>
        {rightSlot !== undefined ? rightSlot : <ThemeToggle />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 14,
    height: 52
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  spacer: {
    width: 32,
    height: 32
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  logoCircle: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: fontUIExtraBold
  },
  subtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1,
    fontFamily: fontUIBold
  },
  rightSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  }
});
