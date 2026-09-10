import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { radius } from '../theme/colors';
import { Sun, Moon } from 'lucide-react-native';

export const ThemeToggle: React.FC = () => {
  const { theme, isDarkMode, toggleDarkMode } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleDarkMode}
      style={[
        styles.button,
        {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0,0,0,0.05)',
          borderColor: theme.border,
        },
      ]}
    >
      {isDarkMode ? (
        <Sun size={18} color="#F0B547" />
      ) : (
        <Moon size={18} color={theme.textPrimary} />
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
    borderWidth: 1,
  },
});
