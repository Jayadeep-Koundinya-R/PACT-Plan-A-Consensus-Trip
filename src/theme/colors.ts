export const colors = {
  // PACT "travel document" palette — see DESIGN_SYSTEM.md (source of truth).
  // Dark = Ink (deep blue-black). Light = Parchment. Accents: Brass, Petrol, Sealing Red only.
  dark: {
    background:      '#12182B',
    backgroundDeep:  '#0C1120',
    surface:         '#1A2138',
    surfaceElevated: '#222B45',
    surfaceSubtle:   '#161D33',
    primary:         '#C99A5B',
    primaryDark:     '#B98A4E',
    primaryLight:    'rgba(201, 154, 91, 0.14)',
    primaryContrast: '#231A0C',
    secondary:       '#58A68C',
    secondaryDark:   '#3E7D63',
    secondaryLight:  'rgba(88, 166, 140, 0.12)',
    secondaryContrast:'#1E3A30',
    accentPeach:     '#D8B27A',
    accentTerracotta:'#C99A5B',
    success:         '#58A68C',
    successLight:    'rgba(88, 166, 140, 0.12)',
    warning:         '#D99A3F',
    warningLight:    'rgba(217, 154, 63, 0.12)',
    warningText:     '#E3B25E',
    warningSub:      '#A98B5F',
    danger:          '#C1503F',
    dangerLight:     'rgba(193, 80, 63, 0.12)',
    dangerBorder:    'rgba(193, 80, 63, 0.35)',
    seal:            '#C1503F',
    gold:            '#E0C286',
    textPrimary:     '#F3EEE2',
    textSecondary:   '#A9A08C',
    textMuted:       '#6B6455',
    textSubtle:      '#8B8474',
    textLight:       '#C9C0AC',
    border:          'rgba(243, 238, 226, 0.1)',
    borderSubtle:    'rgba(243, 238, 226, 0.07)',
    glassBorder:     'rgba(243, 238, 226, 0.12)',
    card:            '#1A2138',
    meterTrack:      'rgba(243, 238, 226, 0.1)',
    navBg:           'rgba(18, 24, 43, 0.96)'
  },
  light: {
    background:      '#F6EFDE',
    backgroundDeep:  '#EFE5CE',
    surface:         '#FFFFFF',
    surfaceElevated: '#FBF7EC',
    surfaceSubtle:   '#EFE7D4',
    primary:         '#A97C3D',
    primaryDark:     '#8A6530',
    primaryLight:    'rgba(169, 124, 61, 0.12)',
    primaryContrast: '#FFFFFF',
    secondary:       '#1E5C58',
    secondaryDark:   '#174A47',
    secondaryLight:  'rgba(30, 92, 88, 0.1)',
    secondaryContrast:'#FFFFFF',
    accentPeach:     '#C99A5B',
    accentTerracotta:'#A97C3D',
    success:         '#4B7A51',
    successLight:    'rgba(75, 122, 81, 0.1)',
    warning:         '#B0782A',
    warningLight:    'rgba(176, 120, 42, 0.1)',
    warningText:     '#8A5F22',
    warningSub:      '#5C3E16',
    danger:          '#A63D2F',
    dangerLight:     'rgba(166, 61, 47, 0.1)',
    dangerBorder:    'rgba(166, 61, 47, 0.3)',
    seal:            '#A63D2F',
    gold:            '#8A5F22',
    textPrimary:     '#1E1A14',
    textSecondary:   '#5C5445',
    textMuted:       '#8B8474',
    textSubtle:      '#6B6455',
    textLight:       '#3A342A',
    border:          '#E3D9C2',
    borderSubtle:    '#EBE1CC',
    glassBorder:     'rgba(0, 0, 0, 0.06)',
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
  cardLarge: 20,
  phone: 40,
  btn: 12,
  pill: 20
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 1
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 2
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4
  },
  glowPrimary: {
    shadowColor: '#C99A5B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2
  },
  glowSuccess: {
    shadowColor: '#58A68C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2
  }
} as const;