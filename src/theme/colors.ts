export const colors = {
  dark: {
    // Primary aesthetic: Obsidian Espresso & Warm Terracotta Flame
    background: '#120B07',
    surface: '#1C130D',
    surfaceElevated: '#281B13',
    surfaceSubtle: '#160E09',
    primary: '#EA580C',            // Warm Terracotta Flame
    primaryDark: '#C2410C',
    primaryLight: 'rgba(234, 88, 12, 0.18)',
    secondary: '#F97316',          // Bright Amber Flame
    secondaryDark: '#EA580C',
    secondaryLight: 'rgba(249, 115, 22, 0.18)',
    accentPeach: '#2D1B11',
    accentTerracotta: '#7C2D12',
    success: '#10B981',            // Emerald Glow
    successLight: 'rgba(16, 185, 129, 0.18)',
    warning: '#F59E0B',            // Radiant Amber
    warningLight: 'rgba(245, 158, 11, 0.18)',
    danger: '#EF4444',             // Coral Red
    dangerLight: 'rgba(239, 68, 68, 0.18)',
    textPrimary: '#FDF6F0',        // Warm Ivory
    textSecondary: '#C4ADA0',      // Warm Muted Sand
    textMuted: '#8A7367',
    border: 'rgba(255, 237, 213, 0.09)',
    glassBorder: 'rgba(255, 237, 213, 0.12)',
    card: '#1C130D',
    meterTrack: '#281B13',
    navBg: 'rgba(28, 19, 13, 0.96)'
  },
  light: {
    // Primary aesthetic: Warm Almond Cream & Rich Terracotta
    background: '#FAF5F0',         // Warm Almond Cream
    surface: '#FFFFFF',            // Pure White Card
    surfaceElevated: '#FFF3EA',    // Soft Peach Tint
    surfaceSubtle: '#F6ECE2',      // Warm Muted Tint
    primary: '#7C2D12',            // Deep Rich Terracotta
    primaryDark: '#5F200A',
    primaryLight: 'rgba(124, 45, 18, 0.12)',
    secondary: '#C2410C',          // Warm Amber
    secondaryDark: '#9A3412',
    secondaryLight: 'rgba(194, 65, 12, 0.12)',
    accentPeach: '#FFEDD5',        // Soft Apricot Pill
    accentTerracotta: '#7C2D12',
    success: '#059669',            // Rich Emerald
    successLight: 'rgba(5, 150, 105, 0.12)',
    warning: '#D97706',            // Amber
    warningLight: 'rgba(217, 119, 6, 0.12)',
    danger: '#DC2626',             // Ruby Red
    dangerLight: 'rgba(220, 38, 38, 0.12)',
    textPrimary: '#2A1810',        // Deep Espresso Coffee
    textSecondary: '#6E4E42',      // Warm Walnut
    textMuted: '#A48275',
    border: 'rgba(124, 45, 18, 0.08)',
    glassBorder: 'rgba(124, 45, 18, 0.12)',
    card: '#FFFFFF',
    meterTrack: '#F0DEC8',
    navBg: 'rgba(250, 245, 240, 0.96)'
  }
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
} as const;

export const radius = {
  sm: 8,
  md: 12,
  card: 18,
  btn: 14,
  pill: 9999
} as const;

export const shadows = {
  sm: {
    shadowColor: '#2A1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#2A1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  lg: {
    shadowColor: '#2A1810',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6
  },
  glowPrimary: {
    shadowColor: '#7C2D12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4
  },
  glowSuccess: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6
  },
  glowSecondary: {
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6
  }
} as const;