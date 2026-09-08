import { useGatherlyStore } from '../store/useGatherlyStore';
import { useUserStore } from '../store/useUserStore';
import { colors } from '../theme/colors';

/**
 * useTheme - Unified theme hook for PACT
 * Provides a single source of truth for dark/light mode across the application.
 * Automatically synchronizes both useGatherlyStore and useUserStore.
 */
export function useTheme() {
  const isDarkModeGatherly = useGatherlyStore((s) => s.isDarkMode);
  const toggleGatherly = useGatherlyStore((s) => s.toggleDarkMode);
  
  const isDarkModeUser = useUserStore((s) => s.isDarkMode);
  const toggleUser = useUserStore((s) => s.toggleDarkMode);

  // Use GatherlyStore as the primary state
  const isDarkMode = isDarkModeGatherly;
  const theme = isDarkMode ? colors.dark : colors.light;

  const toggleDarkMode = () => {
    toggleGatherly();
    if (isDarkModeUser === isDarkModeGatherly) {
      toggleUser();
    }
  };

  return {
    isDarkMode,
    toggleDarkMode,
    theme,
    colors
  };
}
