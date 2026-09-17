import { useGatherlyStore } from '../store/useGatherlyStore';
import { colors, pactThemes, ThemeId, PactThemeDefinition } from '../theme/colors';

/**
 * useTheme — Dynamically supports Obsidian Dark and Obsidian Light modes
 * with AsyncStorage persistence.
 */
export function useTheme() {
  const isDarkMode = useGatherlyStore((s) => s.isDarkMode);
  const toggleDarkMode = useGatherlyStore((s) => s.toggleDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;
  const themeDef: PactThemeDefinition = pactThemes.obsidian_dark;

  return {
    theme,
    themeId: 'obsidian_dark' as ThemeId,
    themeDefinition: themeDef,
    isDarkMode,
    toggleDarkMode,
    colors
  };
}
