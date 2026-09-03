export const colors = {
  dark: {
    background:      '#090A0F',
    backgroundDeep:  '#050608',
    surface:         '#13151E',
    surfaceElevated: '#1B1D27',
    surfaceSubtle:   '#0F1017',
    primary:         '#FF5A5F',
    primaryDark:     '#E0484D',
    primaryLight:    'rgba(255, 90, 95, 0.12)',
    primaryContrast: '#2E0805',
    secondary:       '#3DE0A0',
    secondaryDark:   '#22C58B',
    secondaryLight:  'rgba(61, 224, 160, 0.12)',
    secondaryContrast:'#0B3B22',
    accentPeach:     '#FF8A8D',
    accentTerracotta:'#FF5A5F',
    success:         '#3DE0A0',
    successLight:    'rgba(61, 224, 160, 0.12)',
    warning:         '#F59E0B',
    warningLight:    'rgba(245, 158, 11, 0.12)',
    warningText:     '#F0B547',
    warningSub:      '#B4915A',
    danger:          '#EF4444',
    dangerLight:     'rgba(239, 68, 68, 0.12)',
    dangerBorder:    'rgba(239, 68, 68, 0.35)',
    seal:            '#3DE0A0',
    gold:            '#D4AF37',
    textPrimary:     '#F4F3F0',
    textSecondary:   '#8B8D98',
    textMuted:       '#454857',
    textSubtle:      '#6C6F7A',
    textLight:       '#B4B6C0',
    border:          'rgba(255, 255, 255, 0.08)',
    borderSubtle:    'rgba(255, 255, 255, 0.06)',
    glassBorder:     'rgba(255, 255, 255, 0.10)',
    card:            '#13151E',
    meterTrack:      'rgba(255, 255, 255, 0.08)',
    navBg:           'rgba(9, 10, 15, 0.96)'
  },
  light: {
    background:      '#F4F3F0',
    backgroundDeep:  '#EBE9E4',
    surface:         '#FFFFFF',
    surfaceElevated: '#F9F8F6',
    surfaceSubtle:   '#F0ECE4',
    primary:         '#FF5A5F',
    primaryDark:     '#E0484D',
    primaryLight:    'rgba(255, 90, 95, 0.10)',
    primaryContrast: '#FFFFFF',
    secondary:       '#16A34A',
    secondaryDark:   '#15803D',
    secondaryLight:  'rgba(22, 163, 74, 0.10)',
    secondaryContrast:'#FFFFFF',
    accentPeach:     '#FF8A8D',
    accentTerracotta:'#FF5A5F',
    success:         '#16A34A',
    successLight:    'rgba(22, 163, 74, 0.10)',
    warning:         '#D97706',
    warningLight:    'rgba(217, 119, 6, 0.10)',
    warningText:     '#B45309',
    warningSub:      '#78350F',
    danger:          '#DC2626',
    dangerLight:     'rgba(220, 38, 38, 0.10)',
    dangerBorder:    'rgba(220, 38, 38, 0.30)',
    seal:            '#16A34A',
    gold:            '#B45309',
    textPrimary:     '#090A0F',
    textSecondary:   '#454857',
    textMuted:       '#8B8D98',
    textSubtle:      '#6C6F7A',
    textLight:       '#2A2D3A',
    border:          '#E5E3DC',
    borderSubtle:    '#ECEAE4',
    glassBorder:     'rgba(0, 0, 0, 0.06)',
    card:            '#FFFFFF',
    meterTrack:      '#E5E3DC',
    navBg:           'rgba(244, 243, 240, 0.96)'
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
  cardLarge: 20,
  phone: 40,
  btn: 12,
  pill: 20
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 2
  },
  glowPrimary: {
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3
  },
  glowSuccess: {
    shadowColor: '#3DE0A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3
  }
} as const;