import React, { ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp
} from 'react-native';
import { colors, radius, shadows } from '../../theme/colors';

export type PactCardVariant = 'default' | 'elevated' | 'subtle' | 'interactive' | 'dashed';

export interface PactCardProps {
  children?: ReactNode;
  variant?: PactCardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  testID?: string;
  noPadding?: boolean;
}

/**
 * PactCard - Reusable core card container for PACT design system
 * Features #1E2742 background, rounded card corners, and subtle border token.
 */
export const PactCard: React.FC<PactCardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  activeOpacity = 0.85,
  testID,
  noPadding = false
}) => {
  const containerStyles = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'subtle' && styles.subtle,
    variant === 'dashed' && styles.dashed,
    noPadding && styles.noPadding,
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={containerStyles}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#1E2742',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(253, 249, 239, 0.14)',
    padding: 16
  },
  elevated: {
    backgroundColor: '#28324F',
    ...shadows.md
  },
  subtle: {
    backgroundColor: '#182036',
    borderColor: 'rgba(253, 249, 239, 0.1)'
  },
  dashed: {
    borderStyle: 'dashed',
    borderColor: 'rgba(253, 249, 239, 0.22)'
  },
  noPadding: {
    padding: 0
  }
});
