import { useGatherlyStore } from '../store/useGatherlyStore';
import { useUserStore } from '../store/useUserStore';
import { colors, pactThemes, getThemeById, ThemeId, PactThemeDefinition } from '../theme/colors';

/**
 * useTheme - Unified, Persistent Multi-Theme Hook for PACT
 * Provides reactive access to the active theme, theme switcher, and persistence.
 * Supports at least 4 predefined themes (2 Dark, 2 Light).
 */
export function useTheme() {
  const currentThemeId = useGatherlyStore((s) => s.currentThemeId || 'obsidian_dark');
  const isDarkModeGatherly = useGatherlyStore((s) => s.isDarkMode);
  const setThemeStore = useGatherlyStore((s) => s.setTheme);
  const toggleGatherly = useGatherlyStore((s) => s.toggleDarkMode);

  const isDarkModeUser = useUserStore((s) => s.isDarkMode);
  const toggleUser = useUserStore((s) => s.toggleDarkMode);

  const themeDef: PactThemeDefinition = getThemeById(currentThemeId);
  const theme = themeDef.colors;
  const isDarkMode = isDarkModeGatherly;

  const setTheme = (id: ThemeId) => {
    setThemeStore(id);
    const newDef = getThemeById(id);
    const isDark = newDef.category === 'dark';
    if (isDarkModeUser !== isDark) {
      toggleUser();
    }
  };

  const toggleDarkMode = () => {
    toggleGatherly();
    if (isDarkModeUser === isDarkModeGatherly) {
      toggleUser();
    }
  };

  return {
    theme,
    themeId: currentThemeId,
    themeDefinition: themeDef,
    allThemes: Object.values(pactThemes),
    isDarkMode,
    setTheme,
    toggleDarkMode,
    colors
  };
}
