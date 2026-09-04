import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { usePactHaptics } from '../../hooks/usePactHaptics';
import { radius } from '../../theme/colors';
import { fontUI, fontUIBold } from '../../theme/typography';

export type PactChipVariant = 'emerald' | 'coral' | 'neutral';
export type PactChipSize = 'sm' | 'md';

export interface PactChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: ReactNode;
  badge?: ReactNode;
  showCheckmark?: boolean;
  variant?: PactChipVariant;
  size?: PactChipSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  disabled?: boolean;
}

/**
 * PactChip - Reusable chip with active/inactive visual states + checkmark badge.
 * Automatically triggers usePactHaptics.tap() on press.
 */
export const PactChip: React.FC<PactChipProps> = ({
  label,
  active,
  onPress,
  icon,
  badge,
  showCheckmark = true,
  variant = 'emerald',
  size = 'md',
  style,
  textStyle,
  testID,
  disabled = false
}) => {
  const haptics = usePactHaptics();

  const handlePress = () => {
    if (disabled) return;
    haptics.tap();
    onPress();
  };

  const getContainerStyles = () => {
    return [
      styles.base,
      styles[size],
      active ? styles[`active_${variant}`] : styles.inactive,
      disabled && styles.disabled,
      style
    ];
  };

  const getTextStyles = () => {
    return [
      styles.baseText,
      styles[`${size}Text`],
      active ? styles[`activeText_${variant}`] : styles.inactiveText,
      textStyle
    ];
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={getContainerStyles()}
      testID={testID}
    >
      {icon && <View style={styles.iconBox}>{icon}</View>}

      <Text style={getTextStyles()}>{label}</Text>

      {badge && <View style={styles.badgeBox}>{badge}</View>}

      {active && showCheckmark && (
        <View
          style={[
            styles.checkBadge,
            variant === 'emerald' && styles.checkBadgeEmerald,
            variant === 'coral' && styles.checkBadgeCoral,
            variant === 'neutral' && styles.checkBadgeNeutral
          ]}
        >
          <Svg width="8" height="8" viewBox="0 0 10 8" fill="none">
            <Path
              d="M1 4.2L3.8 7L9 1"
              stroke={variant === 'neutral' ? '#090A0F' : '#0B3B22'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1
  },
  sm: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 5
  },
  md: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6
  },
  inactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  active_emerald: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderColor: '#3DE0A0'
  },
  active_coral: {
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderColor: '#FF5A5F'
  },
  active_neutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.35)'
  },
  baseText: {
    letterSpacing: 0.1
  },
  smText: {
    fontSize: 12
  },
  mdText: {
    fontSize: 13
  },
  inactiveText: {
    fontFamily: fontUI,
    color: '#8B8D98'
  },
  activeText_emerald: {
    fontFamily: fontUIBold,
    color: '#F4F3F0'
  },
  activeText_coral: {
    fontFamily: fontUIBold,
    color: '#F4F3F0'
  },
  activeText_neutral: {
    fontFamily: fontUIBold,
    color: '#FFFFFF'
  },
  iconBox: {
    marginRight: 2
  },
  badgeBox: {
    marginLeft: 4
  },
  checkBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2
  },
  checkBadgeEmerald: {
    backgroundColor: '#3DE0A0'
  },
  checkBadgeCoral: {
    backgroundColor: '#FF5A5F'
  },
  checkBadgeNeutral: {
    backgroundColor: '#F4F3F0'
  },
  disabled: {
    opacity: 0.45
  }
});
