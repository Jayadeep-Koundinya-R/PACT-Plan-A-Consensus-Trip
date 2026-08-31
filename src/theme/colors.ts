export const colors = {
  dark: {
    // Primary aesthetic: Obsidian Slate & Sunset Coral Flame
    background: '#0B0F17',         // Deep Obsidian Slate Canvas
    surface: '#151D2A',            // Clean Slate Card
    surfaceElevated: '#1E293B',    // Elevated Slate Box
    surfaceSubtle: '#111827',      // Subtle Slate Tint
    primary: '#EA580C',            // Sunset Coral / Terracotta Flame
    primaryDark: '#C2410C',
    primaryLight: 'rgba(234, 88, 12, 0.18)',
    secondary: '#F97316',          // Bright Amber Flame
    secondaryDark: '#EA580C',
    secondaryLight: 'rgba(249, 115, 22, 0.18)',
    accentPeach: '#1E293B',
    accentTerracotta: '#EA580C',
    success: '#10B981',            // Emerald Glow
    successLight: 'rgba(16, 185, 129, 0.18)',
    warning: '#F59E0B',            // Radiant Amber
    warningLight: 'rgba(245, 158, 11, 0.18)',
    danger: '#EF4444',             // Coral Red
    dangerLight: 'rgba(239, 68, 68, 0.18)',
    textPrimary: '#F8FAFC',        // Crisp White-Slate
    textSecondary: '#94A3B8',      // Slate Muted
    textMuted: '#64748B',          // Dark Slate Placeholder
    border: 'rgba(248, 250, 252, 0.08)',
    glassBorder: 'rgba(248, 250, 252, 0.12)',
    card: '#151D2A',
    meterTrack: '#1E293B',
    navBg: 'rgba(15, 23, 42, 0.96)'
  },
  light: {
    // Primary aesthetic: Luxury Warm Cream Canvas & Vibrant Sunset Coral
    background: '#FAF8F5',         // Plain Soft Luxury Cream Canvas
    surface: '#FFFFFF',            // Pure White Card
    surfaceElevated: '#F5F2EC',    // Warm Elevated Cream Tint
    surfaceSubtle: '#F6F3EE',      // Neutral Soft Cream Background
    primary: '#EA580C',            // Energetic Sunset Coral / Terracotta
    primaryDark: '#C2410C',
    primaryLight: 'rgba(234, 88, 12, 0.10)',
    secondary: '#F97316',          // Vivid Amber Flame
    secondaryDark: '#C2410C',
    secondaryLight: 'rgba(249, 115, 22, 0.10)',
    accentPeach: '#FFEDD5',        // Soft Apricot Pill
    accentTerracotta: '#EA580C',
    success: '#10B981',            // Emerald Green
    successLight: 'rgba(16, 185, 129, 0.10)',
    warning: '#F59E0B',            // Amber Warning
    warningLight: 'rgba(245, 158, 11, 0.10)',
    danger: '#EF4444',             // Coral Red
    dangerLight: 'rgba(239, 68, 68, 0.10)',
    textPrimary: '#1C1917',        // Deep Charcoal Black
    textSecondary: '#57534E',      // Warm Slate Grey
    textMuted: '#A8A29E',          // Soft Muted Warm Grey
    border: '#E7E2D9',             // Ultra-Fine Crisp Warm Border
    glassBorder: 'rgba(28, 25, 23, 0.06)',
    card: '#FFFFFF',
    meterTrack: '#E7E2D9',
    navBg: 'rgba(250, 248, 245, 0.96)'
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
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  lg: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4
  },
  glowPrimary: {
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3
  },
  glowSuccess: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3
  },
  glowSecondary: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3
  }
} as const;