import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { colors, radius } from '../theme/colors';
import { Sun, Moon } from 'lucide-react-native';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useGatherlyStore();
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleDarkMode}
      style={[
        styles.button,
        {
          backgroundColor: isDarkMode ? 'rgba(253, 249, 239, 0.11)' : 'rgba(0,0,0,0.05)',
          borderColor: theme.border
        }
      ]}
    >
      {isDarkMode ? (
        <Sun size={18} color="#FFC55C" />
      ) : (
        <Moon size={18} color="#12182B" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  }
});
