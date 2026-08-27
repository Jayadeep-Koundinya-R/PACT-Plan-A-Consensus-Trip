export const colors = {
  dark: {
    // Primary aesthetic (Obsidian & Frosted Midnight)
    background: '#0B0F17',         // Obsidian
    surface: '#131B2E',            // Frosted Midnight
    surfaceElevated: '#1A2542',    // Elevated cards / hover
    surfaceSubtle: '#101726',
    primary: '#0EA5E9',            // Electric Sky
    primaryDark: '#0284C7',
    primaryLight: 'rgba(14, 165, 233, 0.15)',
    secondary: '#F59E0B',          // Radiant Amber / Gold
    secondaryDark: '#D97706',
    secondaryLight: 'rgba(245, 158, 11, 0.15)',
    success: '#10B981',            // Emerald Glow
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',            // Radiant Amber
    warningLight: 'rgba(245, 158, 11, 0.15)',
    danger: '#EF4444',             // Coral Red
    dangerLight: 'rgba(239, 68, 68, 0.15)',
    textPrimary: '#F1F5F9',        // Slate 100
    textSecondary: '#94A3B8',      // Slate 400
    textMuted: '#64748B',          // Slate 500
    border: 'rgba(255, 255, 255, 0.08)', // Glass Border
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    card: '#131B2E',
    meterTrack: '#1A2542',
    navBg: 'rgba(19, 27, 46, 0.92)'
  },
  light: {
    // Secondary aesthetic (Clean Slate with Rich Accents)
    background: '#F1F5F9',         // Crisp Slate 100
    surface: '#FFFFFF',            // Pure White Card
    surfaceElevated: '#F8FAFC',    // Subtle elevation
    surfaceSubtle: '#F1F5F9',
    primary: '#0284C7',            // Deep Sky Blue (high contrast WCAG AAA)
    primaryDark: '#0369A1',
    primaryLight: 'rgba(2, 132, 199, 0.12)',
    secondary: '#D97706',          // Warm Amber
    secondaryDark: '#B45309',
    secondaryLight: 'rgba(217, 119, 6, 0.12)',
    success: '#059669',            // Rich Emerald
    successLight: 'rgba(5, 150, 105, 0.12)',
    warning: '#D97706',            // Amber
    warningLight: 'rgba(217, 119, 6, 0.12)',
    danger: '#DC2626',             // Ruby Red
    dangerLight: 'rgba(220, 38, 38, 0.12)',
    textPrimary: '#0F172A',        // Slate 900
    textSecondary: '#475569',      // Slate 600
    textMuted: '#94A3B8',          // Slate 400
    border: 'rgba(15, 23, 42, 0.08)',
    glassBorder: 'rgba(15, 23, 42, 0.09)',
    card: '#FFFFFF',
    meterTrack: '#E2E8F0',
    navBg: 'rgba(255, 255, 255, 0.94)'
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
  card: 16,
  btn: 12,
  pill: 9999
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6
  },
  glowPrimary: {
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6
  },
  glowSuccess: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6
  },
  glowSecondary: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6
  }
} as const;
