export const lightTheme = {
  colors: {
    primary: '#C9673A',
    primaryLight: '#E8845A',
    background: '#FFFBF7',
    backgroundSecondary: '#FFF5EC',
    card: '#FFFFFF',
    text: '#2C1A0E',
    textSecondary: '#8C6A52',
    textHint: '#B89880',
    border: '#E8D5C4',
    success: '#4CAF50',
    error: '#D64C2A',
    brandGold: '#C9A84C',
    instagram: '#C13584',
    maps: '#34A853',
    manual: '#8C6A52',
    tabBarBackground: '#FFFBF7',
    tabBarBorder: '#E8D5C4',
    chipActive: '#C9673A',
    chipInactive: '#FFFFFF',
    chipTextActive: '#FFFFFF',
    chipTextInactive: '#8C6A52',
    modalBackground: '#FFFBF7',
    inputBackground: '#FFF5EC',
    inputBorder: '#E8D5C4',
    placeholder: '#B89880',
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    small: { fontSize: 13, fontWeight: '400' as const },
    label: { fontSize: 12, fontWeight: '500' as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  borderRadius: { sm: 8, md: 12, lg: 16, full: 999 },
  shadows: {
    card: {
      shadowColor: '#8C6A52',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    }
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#E07848',
    primaryLight: '#F09060',
    background: '#1A0F0A',
    backgroundSecondary: '#26160E',
    card: '#26160E',
    text: '#F5ECD8',
    textSecondary: '#A07858',
    textHint: '#6B4A32',
    border: '#3D2214',
    success: '#4CAF50',
    error: '#E05535',
    brandGold: '#C9A84C',
    instagram: '#E1306C',
    maps: '#34A853',
    manual: '#A07858',
    tabBarBackground: '#1A0F0A',
    tabBarBorder: '#3D2214',
    chipActive: '#E07848',
    chipInactive: '#26160E',
    chipTextActive: '#F5ECD8',
    chipTextInactive: '#A07858',
    modalBackground: '#1A0F0A',
    inputBackground: '#26160E',
    inputBorder: '#3D2214',
    placeholder: '#6B4A32',
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }
  }
};

export type Theme = typeof lightTheme;
