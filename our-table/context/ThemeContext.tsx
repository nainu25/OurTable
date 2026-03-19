import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, lightTheme, darkTheme } from '../constants/styles';

const THEME_STORAGE_KEY = 'ourtable_theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(Appearance.getColorScheme() === 'dark');

  // Load persisted theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          // Use system default if no preference saved
          setIsDark(Appearance.getColorScheme() === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  // Listen for system theme changes (if user hasn't overridden?)
  // For now, let's keep it simple: follow system until changed.
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
       // Only follow system if user didn't save a preference?
       // Let's just follow system for now unless we implementation stickiness.
       // User explicitly says persist, so let's stick once changed.
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const nextValue = !isDark;
    setIsDark(nextValue);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextValue ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
