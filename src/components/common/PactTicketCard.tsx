import React, { ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp
} from 'react-native';
import { radius } from '../../theme/colors';

export interface PactTicketDividerProps {
  notchSize?: number;
  notchColor?: string;
  notchBorderColor?: string;
  dashedBorderColor?: string;
  marginHorizontal?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * PactTicketDivider - The signature notch cutout & dashed perforation divider
 */
export const PactTicketDivider: React.FC<PactTicketDividerProps> = ({
  notchSize = 20,
  notchColor = '#090A0F',
  notchBorderColor = 'rgba(255, 255, 255, 0.08)',
  dashedBorderColor = 'rgba(255, 255, 255, 0.16)',
  marginHorizontal = 20,
  style
}) => {
  const half = notchSize / 2;
  return (
    <View style={[styles.perforationWrapper, style]}>
      <View
        style={[
          styles.notch,
          {
            left: -half,
            top: -half,
            width: notchSize,
            height: notchSize,
            borderRadius: half,
            backgroundColor: notchColor,
            borderColor: notchBorderColor
          }
        ]}
      />
      <View
        style={[
          styles.notch,
          {
            right: -half,
            top: -half,
            width: notchSize,
            height: notchSize,
            borderRadius: half,
            backgroundColor: notchColor,
            borderColor: notchBorderColor
          }
        ]}
      />
      <View
        style={[
          styles.dashedLine,
          {
            borderTopColor: dashedBorderColor,
            marginHorizontal: marginHorizontal
          }
        ]}
      />
    </View>
  );
};

export interface PactTicketCardProps {
  topContent?: ReactNode;
  bottomContent?: ReactNode;
  children?: ReactNode;
  notchSize?: number;
  notchColor?: string;
  notchBorderColor?: string;
  dashedBorderColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  topStyle?: StyleProp<ViewStyle>;
  bottomStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  testID?: string;
}

/**
 * PactTicketCard - Reusable ticket stub card with notch cutouts + dashed divider motif.
 * Consolidates duplicate ticket stub patterns used across Hub, Matrix, Brief, and Paywall.
 */
export const PactTicketCard: React.FC<PactTicketCardProps> = ({
  topContent,
  bottomContent,
  children,
  notchSize = 20,
  notchColor = '#090A0F',
  notchBorderColor = 'rgba(255, 255, 255, 0.08)',
  dashedBorderColor = 'rgba(255, 255, 255, 0.16)',
  backgroundColor = '#13151E',
  borderColor = 'rgba(255, 255, 255, 0.08)',
  borderRadius: cardRadius = radius.card,
  style,
  topStyle,
  bottomStyle,
  onPress,
  activeOpacity = 0.88,
  testID
}) => {
  const content = children ? (
    children
  ) : (
    <>
      {topContent && <View style={[styles.topSection, topStyle]}>{topContent}</View>}
      <PactTicketDivider
        notchSize={notchSize}
        notchColor={notchColor}
        notchBorderColor={notchBorderColor}
        dashedBorderColor={dashedBorderColor}
      />
      {bottomContent && (
        <View style={[styles.bottomSection, bottomStyle]}>{bottomContent}</View>
      )}
    </>
  );

  const containerStyle = [
    styles.card,
    {
      backgroundColor,
      borderColor,
      borderRadius: cardRadius
    },
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={containerStyle}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  topSection: {
    padding: 16
  },
  bottomSection: {
    padding: 16
  },
  perforationWrapper: {
    position: 'relative',
    height: 1,
    justifyContent: 'center'
  },
  notch: {
    position: 'absolute',
    borderWidth: 1,
    zIndex: 2
  },
  dashedLine: {
    borderTopWidth: 1.5,
    borderStyle: 'dashed'
  }
});
