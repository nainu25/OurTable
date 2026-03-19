export const lightTheme = {
  colors: {
    primary: '#FF6B6B',
    background: '#FFFFFF',
    backgroundSecondary: '#F7F7F7',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#888888',
    textHint: '#AAAAAA',
    border: '#EEEEEE',
    success: '#4CAF50',
    error: '#FF3B30',
    instagram: '#C13584',
    maps: '#34A853',
    manual: '#888888',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#EEEEEE',
    chipActive: '#FF6B6B',
    chipInactive: '#FFFFFF',
    chipTextActive: '#FFFFFF',
    chipTextInactive: '#888888',
    modalBackground: '#FFFFFF',
    inputBackground: '#F7F7F7',
    inputBorder: '#EEEEEE',
    placeholder: '#AAAAAA',
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    }
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#FF6B6B',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    card: '#1E1E1E',
    text: '#F1F1F1',
    textSecondary: '#AAAAAA',
    textHint: '#666666',
    border: '#2C2C2C',
    success: '#4CAF50',
    error: '#FF453A',
    instagram: '#E1306C',
    maps: '#34A853',
    manual: '#888888',
    tabBarBackground: '#1A1A1A',
    tabBarBorder: '#2C2C2C',
    chipActive: '#FF6B6B',
    chipInactive: '#1E1E1E',
    chipTextActive: '#FFFFFF',
    chipTextInactive: '#AAAAAA',
    modalBackground: '#1E1E1E',
    inputBackground: '#2C2C2C',
    inputBorder: '#3C3C3C',
    placeholder: '#666666',
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }
  }
};

export type Theme = typeof lightTheme;
