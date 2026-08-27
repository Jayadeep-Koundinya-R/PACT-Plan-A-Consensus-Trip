export const colors = {
  light: {
    primary: '#0EA5E9',       // Sky 500
    primaryDark: '#0284C7',   // Sky 600
    primaryLight: '#E0F2FE',  // Sky 100
    secondary: '#F59E0B',     // Amber 500
    secondaryLight: '#FEF3C7',
    success: '#10B981',       // Emerald 500
    successLight: '#D1FAE5',
    danger: '#EF4444',        // Red 500
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    background: '#F8FAFC',    // Slate 50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9', // Slate 100
    border: '#E2E8F0',        // Slate 200
    textPrimary: '#0F172A',   // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8',     // Slate 400
    card: '#FFFFFF',
    meterTrack: '#E2E8F0'
  },
  dark: {
    primary: '#38BDF8',       // Sky 400
    primaryDark: '#0EA5E9',
    primaryLight: '#075985',
    secondary: '#FBBF24',     // Amber 400
    secondaryLight: '#78350F',
    success: '#34D399',       // Emerald 400
    successLight: '#064E3B',
    danger: '#F87171',        // Red 400
    dangerLight: '#7F1D1D',
    warning: '#FBBF24',
    background: '#0F172A',    // Slate 900
    surface: '#1E293B',       // Slate 800
    surfaceSubtle: '#334155', // Slate 700
    border: '#334155',        // Slate 700
    textPrimary: '#F8FAFC',   // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B',     // Slate 500
    card: '#1E293B',
    meterTrack: '#334155'
  }
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

export const radius = {
  sm: 8,
  md: 12,
  card: 16,
  btn: 24,
  pill: 9999
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 6
  }
} as const;
