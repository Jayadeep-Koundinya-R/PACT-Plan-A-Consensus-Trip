import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { radius } from '../../theme/colors';

interface PerspectiveCard3DProps {
  children: React.ReactNode;
  tiltAngleX?: number; // degrees around X axis
  tiltAngleY?: number; // degrees around Y axis
  glowColor?: string;
  depthOffset?: number;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
}

export const PerspectiveCard3D: React.FC<PerspectiveCard3DProps> = ({
  children,
  tiltAngleX = 2,
  tiltAngleY = -3,
  glowColor = 'rgba(255, 90, 95, 0.25)',
  depthOffset = 8,
  style,
}) => {
  return (
    <View style={[styles.perspectiveRoot, style]}>
      {/* 3D Depth Shadow Underlay */}
      <View
        style={[
          styles.depthUnderlay,
          {
            backgroundColor: glowColor,
            top: depthOffset,
            left: depthOffset / 2,
          },
        ]}
      />

      {/* 3D Tilted Foreground Card Container */}
      <View
        style={[
          styles.card3dBody,
          {
            transform: [
              { perspective: 1200 },
              { rotateX: `${tiltAngleX}deg` },
              { rotateY: `${tiltAngleY}deg` },
            ],
          },
        ]}
      >
        {/* Specular 3D Bevel Lighting Highlight */}
        <View style={styles.specularHighlight} />

        {/* Card Content */}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  perspectiveRoot: {
    position: 'relative',
    marginVertical: 4,
  },
  depthUnderlay: {
    position: 'absolute',
    right: 0,
    bottom: -6,
    borderRadius: radius.card,
    opacity: 0.45,
    filter: Platform.OS === 'web' ? 'blur(16px)' : undefined,
    zIndex: 0,
  } as ViewStyle,
  card3dBody: {
    zIndex: 1,
    borderRadius: radius.card,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderBottomWidth: 2,
    borderRightWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomColor: 'rgba(0, 0, 0, 0.45)',
    borderRightColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
    overflow: 'hidden',
  },
  specularHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 2,
  },
});
