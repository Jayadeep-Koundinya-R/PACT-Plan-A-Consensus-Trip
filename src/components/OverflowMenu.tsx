import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  StyleSheet,
  Alert
} from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { colors, radius } from '../theme/colors';
import { fontUI, fontUIBold } from '../theme/typography';

export interface OverflowMenuAction {
  label: string;
  icon?: React.ReactNode;
  isDestructive?: boolean;
  onPress: () => void;
}

interface OverflowMenuProps {
  actions: OverflowMenuAction[];
  isDarkMode: boolean;
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({ actions, isDarkMode }) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const openMenu = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true
    }).start(() => setVisible(false));
  };

  const handleAction = (action: OverflowMenuAction) => {
    if (action.isDestructive) {
      Alert.alert(
        action.label,
        'Are you sure? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: action.label,
            style: 'destructive',
            onPress: () => {
              closeMenu();
              action.onPress();
            }
          }
        ]
      );
    } else {
      closeMenu();
      action.onPress();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={openMenu}
        activeOpacity={0.7}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.surfaceSubtle,
            borderColor: theme.border
          }
        ]}
        accessibilityLabel="More options"
      >
        <MoreHorizontal size={16} color={theme.textPrimary} />
      </TouchableOpacity>

      {/* Modal Bottom Sheet */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {actions.map((action, index) => (
            <React.Fragment key={action.label}>
              {index > 0 && (
                <View style={[styles.separator, { backgroundColor: theme.border }]} />
              )}
              <TouchableOpacity
                onPress={() => handleAction(action)}
                activeOpacity={0.7}
                style={styles.actionRow}
              >
                {action.icon && <View style={styles.actionIcon}>{action.icon}</View>}
                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color: action.isDestructive ? theme.danger : theme.textPrimary,
                      fontFamily: action.isDestructive ? fontUIBold : fontUI
                    }
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}

          {/* Cancel Row */}
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            onPress={closeMenu}
            activeOpacity={0.7}
            style={styles.cancelRow}
          >
            <Text style={[styles.cancelLabel, { color: theme.textSecondary, fontFamily: fontUI }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  actionIcon: {
    width: 24,
    alignItems: 'center'
  },
  actionLabel: {
    fontSize: 15
  },
  separator: {
    height: 1,
    marginHorizontal: 16
  },
  cancelRow: {
    padding: 16,
    alignItems: 'center'
  },
  cancelLabel: {
    fontSize: 15
  }
});
