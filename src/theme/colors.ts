export const colors = {
  dark: {
    background:      '#12182B',
    surface:         '#1A2138',
    surfaceElevated: '#1E293B',
    surfaceSubtle:   '#161D33',
    primary:         '#C99A5B',
    primaryDark:     '#A97C3D',
    primaryLight:    'rgba(201, 154, 91, 0.18)',
    secondary:       '#2D7A75',
    secondaryDark:   '#1E5C58',
    secondaryLight:  'rgba(45, 122, 117, 0.18)',
    accentPeach:     '#1E293B',
    accentTerracotta:'#C99A5B',
    success:         '#5E9A64',
    successLight:    'rgba(94, 154, 100, 0.18)',
    warning:         '#F59E0B',
    warningLight:    'rgba(245, 158, 11, 0.18)',
    danger:          '#C1503F',
    dangerLight:     'rgba(193, 80, 63, 0.18)',
    seal:            '#C1503F',
    textPrimary:     '#F3EEE2',
    textSecondary:   '#A9A08C',
    textMuted:       '#64748B',
    border:          'rgba(243, 238, 226, 0.10)',
    glassBorder:     'rgba(243, 238, 226, 0.12)',
    card:            '#1A2138',
    meterTrack:      '#1E293B',
    navBg:           'rgba(22, 29, 51, 0.96)'
  },
  light: {
    background:      '#F6EFDE',
    surface:         '#FFFFFF',
    surfaceElevated: '#F5F2EC',
    surfaceSubtle:   '#EFE7D4',
    primary:         '#A97C3D',
    primaryDark:     '#8A6230',
    primaryLight:    'rgba(169, 124, 61, 0.10)',
    secondary:       '#1E5C58',
    secondaryDark:   '#164845',
    secondaryLight:  'rgba(30, 92, 88, 0.10)',
    accentPeach:     '#FFEDD5',
    accentTerracotta:'#A97C3D',
    success:         '#4B7A51',
    successLight:    'rgba(75, 122, 81, 0.10)',
    warning:         '#F59E0B',
    warningLight:    'rgba(245, 158, 11, 0.10)',
    danger:          '#A63D2F',
    dangerLight:     'rgba(166, 61, 47, 0.10)',
    seal:            '#A63D2F',
    textPrimary:     '#1E1A14',
    textSecondary:   '#5C5445',
    textMuted:       '#A8A29E',
    border:          '#E3D9C2',
    glassBorder:     'rgba(28, 25, 23, 0.06)',
    card:            '#FFFFFF',
    meterTrack:      '#E3D9C2',
    navBg:           'rgba(246, 239, 222, 0.96)'
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
    shadowColor: '#1E1A14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#1E1A14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  lg: {
    shadowColor: '#1E1A14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4
  },
  glowPrimary: {
    shadowColor: '#C99A5B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3
  },
  glowSuccess: {
    shadowColor: '#5E9A64',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3
  },
  glowSecondary: {
    shadowColor: '#2D7A75',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3
  }
} as const;
