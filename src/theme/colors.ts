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
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4
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

export type ThemeId = 'obsidian_dark' | 'cyber_dark' | 'parchment_light' | 'nordic_light';

export type ThemePalette = {
  [K in keyof typeof colors.dark]: string;
};

export interface PactThemeDefinition {
  id: ThemeId;
  name: string;
  category: 'dark' | 'light';
  description: string;
  previewBg: string;
  previewCard: string;
  previewPrimary: string;
  previewSeal: string;
  colors: ThemePalette;
}

export const pactThemes: Record<ThemeId, PactThemeDefinition> = {
  obsidian_dark: {
    id: 'obsidian_dark',
    name: 'Obsidian Midnight',
    category: 'dark',
    description: 'Deep obsidian black with coral energy and gold seals. The signature PACT aesthetic.',
    previewBg: '#090A0F',
    previewCard: '#13151E',
    previewPrimary: '#FF5A5F',
    previewSeal: '#3DE0A0',
    colors: colors.dark
  },
  cyber_dark: {
    id: 'cyber_dark',
    name: 'Cyber Horizon',
    category: 'dark',
    description: 'Futuristic deep space navy with glowing cyber cyan accents and neon emerald pulses.',
    previewBg: '#080B14',
    previewCard: '#111827',
    previewPrimary: '#00F0FF',
    previewSeal: '#10B981',
    colors: {
      ...colors.dark,
      background: '#080B14',
      backgroundDeep: '#04060B',
      surface: '#111827',
      surfaceElevated: '#1A2234',
      surfaceSubtle: '#0D1322',
      card: '#111827',
      primary: '#00F0FF',
      primaryDark: '#00C4D4',
      primaryLight: 'rgba(0, 240, 255, 0.14)',
      primaryContrast: '#041E26',
      secondary: '#10B981',
      secondaryDark: '#059669',
      secondaryLight: 'rgba(16, 185, 129, 0.14)',
      seal: '#10B981',
      gold: '#8B5CF6',
      border: 'rgba(0, 240, 255, 0.12)',
      glassBorder: 'rgba(0, 240, 255, 0.16)'
    }
  },
  parchment_light: {
    id: 'parchment_light',
    name: 'Parchment Luxe',
    category: 'light',
    description: 'Warm archival cream with crisp typography and coral seal marks. Elegant daytime clarity.',
    previewBg: '#F4F3F0',
    previewCard: '#FFFFFF',
    previewPrimary: '#FF5A5F',
    previewSeal: '#16A34A',
    colors: colors.light
  },
  nordic_light: {
    id: 'nordic_light',
    name: 'Nordic Glacier',
    category: 'light',
    description: 'Crisp arctic ice white with deep ocean azure and fresh mint accents.',
    previewBg: '#F0F4F8',
    previewCard: '#FFFFFF',
    previewPrimary: '#0284C7',
    previewSeal: '#059669',
    colors: {
      ...colors.light,
      background: '#F0F4F8',
      backgroundDeep: '#E2E8F0',
      surface: '#FFFFFF',
      surfaceElevated: '#F8FAFC',
      surfaceSubtle: '#E8EEF5',
      card: '#FFFFFF',
      primary: '#0284C7',
      primaryDark: '#0369A1',
      primaryLight: 'rgba(2, 132, 199, 0.12)',
      primaryContrast: '#FFFFFF',
      secondary: '#059669',
      secondaryDark: '#047857',
      secondaryLight: 'rgba(5, 150, 105, 0.12)',
      seal: '#059669',
      gold: '#D97706',
      border: '#D9E2EC',
      borderSubtle: '#E2E8F0'
    }
  }
};

export const DEFAULT_THEME_ID: ThemeId = 'obsidian_dark';

export function getThemeById(themeId?: string): PactThemeDefinition {
  if (themeId && themeId in pactThemes) {
    return pactThemes[themeId as ThemeId];
  }
  return pactThemes[DEFAULT_THEME_ID];
}

