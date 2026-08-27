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
    // Secondary aesthetic (Clean Slate)
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    surfaceSubtle: '#F8FAFC',
    primary: '#0EA5E9',
    primaryDark: '#0284C7',
    primaryLight: '#E0F2FE',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: 'rgba(0, 0, 0, 0.08)',
    glassBorder: 'rgba(0, 0, 0, 0.06)',
    card: '#FFFFFF',
    meterTrack: '#E2E8F0',
    navBg: 'rgba(255, 255, 255, 0.92)'
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 8
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
  }
} as const;
