export const lightTheme = {
  colors: {
    primary: '#4b88a2', // Air Force Blue
    brandGold: '#C9A84C',
    background: '#fff9fb', // Snow
    backgroundSecondary: '#f0f1f4', // Lighter Alabaster
    card: '#ffffff',
    text: '#252627', // Carbon Black
    textSecondary: '#666666',
    textHint: '#AAAAAA',
    border: '#d3d4d9', // Alabaster Grey
    success: '#4CAF50',
    error: '#bb0a21', // Brick Red
    instagram: '#C13584',
    maps: '#34A853',
    manual: '#888888',
    tabBarBackground: '#fff9fb', // Snow
    tabBarBorder: '#d3d4d9', // Alabaster Grey
    chipActive: '#4b88a2', // Air Force Blue
    chipInactive: '#ffffff',
    chipTextActive: '#fff9fb', // Snow
    chipTextInactive: '#252627', // Carbon Black
    modalBackground: '#fff9fb', // Snow
    inputBackground: '#ffffff',
    inputBorder: '#d3d4d9', // Alabaster Grey
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
    primary: '#4b88a2', // Air Force Blue
    brandGold: '#C9A84C',
    background: '#252627', // Carbon Black
    backgroundSecondary: '#1c1d1e', // Darker Carbon
    card: '#1c1d1e',
    text: '#fff9fb', // Snow
    textSecondary: '#d3d4d9', // Alabaster Grey
    textHint: '#888888',
    border: '#3f4143', // Carbon Border
    success: '#4CAF50',
    error: '#bb0a21', // Brick Red
    instagram: '#E1306C',
    maps: '#34A853',
    manual: '#888888',
    tabBarBackground: '#252627', // Carbon Black
    tabBarBorder: '#3f4143',
    chipActive: '#4b88a2', // Air Force Blue
    chipInactive: '#1c1d1e',
    chipTextActive: '#fff9fb', // Snow
    chipTextInactive: '#d3d4d9', // Alabaster Grey
    modalBackground: '#252627', // Carbon Black
    inputBackground: '#1c1d1e',
    inputBorder: '#3f4143',
    placeholder: '#888888',
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
