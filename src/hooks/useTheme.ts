import { useGatherlyStore } from '../store/useGatherlyStore';
import { colors, pactThemes, ThemeId, PactThemeDefinition } from '../theme/colors';

/**
 * useTheme — Locked to single Obsidian Midnight dark theme.
 * No theme switching. PRD item #12.
 */
export function useTheme() {
  const isDarkMode = useGatherlyStore((s) => s.isDarkMode);
  const toggleDarkMode = useGatherlyStore((s) => s.toggleDarkMode);
  const themeDef: PactThemeDefinition = pactThemes.obsidian_dark;
  const theme = themeDef.colors;

  return {
    theme,
    themeId: 'obsidian_dark' as ThemeId,
    themeDefinition: themeDef,
    isDarkMode: true, // locked dark
    toggleDarkMode,
    colors
  };
}
