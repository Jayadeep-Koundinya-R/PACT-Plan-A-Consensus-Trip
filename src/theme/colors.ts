export const colors = {
  // PACT "travel document" palette — see DESIGN_SYSTEM.md (source of truth).
  // Dark = Ink (deep blue-black). Light = Parchment. Accents: Brass, Petrol, Sealing Red only.
  dark: {
    background:      '#12182B',
    backgroundDeep:  '#0C1120',
    surface:         '#1E2742',
    surfaceElevated: '#28324F',
    surfaceSubtle:   '#182036',
    primary:         '#F0B24A',
    primaryDark:     '#D99836',
    primaryLight:    'rgba(240, 178, 74, 0.14)',
    primaryContrast: '#2A1A05',
    secondary:       '#25C9A0',
    secondaryDark:   '#0FA47F',
    secondaryLight:  'rgba(37, 201, 160, 0.14)',
    secondaryContrast:'#0B3327',
    accentPeach:     '#F3C878',
    accentTerracotta:'#F0B24A',
    success:         '#25C9A0',
    successLight:    'rgba(37, 201, 160, 0.14)',
    warning:         '#FFB224',
    warningLight:    'rgba(255, 178, 36, 0.14)',
    warningText:     '#FFC55C',
    warningSub:      '#C9A25E',
    danger:          '#E14733',
    dangerLight:     'rgba(225, 71, 51, 0.12)',
    dangerBorder:    'rgba(225, 71, 51, 0.35)',
    seal:            '#E14733',
    gold:            '#FFD98A',
    textPrimary:     '#FDF9EF',
    textSecondary:   '#C3BAA6',
    textMuted:       '#7A7263',
    textSubtle:      '#9C947F',
    textLight:       '#D8D0BC',
    border:          'rgba(253, 249, 239, 0.14)',
    borderSubtle:    'rgba(253, 249, 239, 0.1)',
    glassBorder:     'rgba(253, 249, 239, 0.16)',
    card:            '#1E2742',
    meterTrack:      'rgba(253, 249, 239, 0.12)',
    navBg:           'rgba(18, 24, 43, 0.96)'
  },
  light: {
    background:      '#F6EFDE',
    backgroundDeep:  '#EFE5CE',
    surface:         '#FFFFFF',
    surfaceElevated: '#FBF7EC',
    surfaceSubtle:   '#EFE7D4',
    primary:         '#C88A1F',
    primaryDark:     '#A8700F',
    primaryLight:    'rgba(200, 138, 31, 0.12)',
    primaryContrast: '#3A2A10',
    secondary:       '#0FA47F',
    secondaryDark:   '#0C7A5E',
    secondaryLight:  'rgba(15, 164, 127, 0.1)',
    secondaryContrast:'#FFFFFF',
    accentPeach:     '#C88A1F',
    accentTerracotta:'#C88A1F',
    success:         '#0FA47F',
    successLight:    'rgba(15, 164, 127, 0.1)',
    warning:         '#E08A00',
    warningLight:    'rgba(224, 138, 0, 0.1)',
    warningText:     '#B86E00',
    warningSub:      '#8A5500',
    danger:          '#D6432B',
    dangerLight:     'rgba(214, 67, 43, 0.1)',
    dangerBorder:    'rgba(214, 67, 43, 0.3)',
    seal:            '#D6432B',
    gold:            '#B86E00',
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
    shadowColor: '#F0B24A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2
  },
  glowSuccess: {
    shadowColor: '#25C9A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2
  }
} as const;