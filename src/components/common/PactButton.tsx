import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { usePactHaptics } from '../../hooks/usePactHaptics';
import { colors, radius, shadows } from '../../theme/colors';
import { fontUIBold } from '../../theme/typography';

export type PactButtonVariant = 'solid' | 'glass' | 'danger' | 'gradient';
export type PactButtonSize = 'sm' | 'md' | 'lg';

export interface PactButtonProps {
  title?: string;
  children?: ReactNode;
  variant?: PactButtonVariant;
  size?: PactButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/**
 * PactButton - Unified button component for PACT design system
 * Supports variants: solid (coral), glass (translucent), danger (crimson), gradient.
 * Automatically triggers usePactHaptics.action() on press.
 */
export const PactButton: React.FC<PactButtonProps> = ({
  title,
  children,
  variant = 'solid',
  size = 'md',
  icon,
  iconPosition = 'left',
  onPress,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  testID
}) => {
  const haptics = usePactHaptics();

  const handlePress = () => {
    if (disabled || loading) return;
    haptics.action();
    if (onPress) {
      onPress();
    }
  };

  const getContainerStyles = () => {
    return [
      styles.base,
      styles[size],
      variant === 'solid' && styles.solid,
      variant === 'glass' && styles.glass,
      variant === 'danger' && styles.danger,
      variant === 'gradient' && styles.gradientContainer,
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style
    ];
  };

  const getTextStyles = () => {
    return [
      styles.baseText,
      styles[`${size}Text`],
      variant === 'solid' && styles.solidText,
      variant === 'glass' && styles.glassText,
      variant === 'danger' && styles.dangerText,
      variant === 'gradient' && styles.gradientText,
      disabled && styles.disabledText,
      textStyle
    ];
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled || loading}
      style={getContainerStyles()}
      testID={testID}
    >
      {variant === 'gradient' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <SvgGradient id="pactBtnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FF5A5F" />
                <Stop offset="100%" stopColor="#D4AF37" />
              </SvgGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={radius.btn} fill="url(#pactBtnGrad)" />
          </Svg>
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'glass' ? '#F4F3F0' : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          {title ? (
            <Text style={getTextStyles()}>{title}</Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  fullWidth: {
    width: '100%'
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconLeft: {
    marginRight: 8
  },
  iconRight: {
    marginLeft: 8
  },
  // Sizes
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    minHeight: 56
  },
  // Variant styles
  solid: {
    backgroundColor: '#FF5A5F',
    ...shadows.glowPrimary
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)'
  },
  danger: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3
  },
  gradientContainer: {
    backgroundColor: '#FF5A5F',
    ...shadows.glowPrimary
  },
  // Text styles
  baseText: {
    fontFamily: fontUIBold,
    textAlign: 'center',
    letterSpacing: 0.2
  },
  smText: {
    fontSize: 13
  },
  mdText: {
    fontSize: 15
  },
  lgText: {
    fontSize: 16
  },
  solidText: {
    color: '#FFFFFF'
  },
  glassText: {
    color: '#F4F3F0'
  },
  dangerText: {
    color: '#FFFFFF'
  },
  gradientText: {
    color: '#FFFFFF'
  },
  // Disabled
  disabled: {
    opacity: 0.5
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.6)'
  }
});
