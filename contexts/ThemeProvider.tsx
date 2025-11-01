
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

type Theme = 'light' | 'medium' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  light: {
    '--color-bg': '#FFFFFF',
    '--color-panel-bg': '#FFFFFF',
    '--color-panel-bg-translucent': 'rgba(255,255,255,0.8)',
    '--color-canvas-bg': '#F9FAFB',
    '--color-node-bg': '#FFFFFF',
    '--color-button-bg': '#F3F4F6',
    '--color-button-bg-hover': '#E5E7EB',
    '--color-bg-input': '#F9FAFB',
    '--color-text-primary': '#333333',
    '--color-text-secondary': '#6B7280',
    '--color-text-tertiary': '#D1D5DB',
    '--color-border': '#E5E5E5',
    '--color-link': '#9ca3af',
    '--color-grid-dot': 'rgba(209, 213, 219, 0.7)',
    '--color-accent': '#F9D7E3',
    '--color-accent-soft': '#F9D7E3',
    '--color-accent-text': '#D6336C',
    '--color-accent-text-strong': '#A61E4D',
    '--color-shadow': '#000000',
    '--color-tier-1': 'rgba(249, 215, 227, 0.3)',
    '--color-tier-2': 'rgba(219, 234, 254, 0.4)',
    '--color-tier-3': 'rgba(209, 250, 229, 0.4)',
    '--color-tier-4': 'rgba(254, 240, 169, 0.4)',
    '--color-tier-5': 'rgba(233, 213, 255, 0.4)',
    '--color-tier-6': 'rgba(229, 231, 235, 0.5)',
    '--color-tier-default': 'rgba(229, 231, 235, 0.5)',
  },
  medium: {
    '--color-bg': '#F2E5E9',
    '--color-panel-bg': '#F8F1F3',
    '--color-panel-bg-translucent': 'rgba(248, 241, 243, 0.8)',
    '--color-canvas-bg': '#F2E5E9',
    '--color-node-bg': '#F8F1F3',
    '--color-button-bg': '#E8DCE0',
    '--color-button-bg-hover': '#DED0D5',
    '--color-bg-input': '#F2E5E9',
    '--color-text-primary': '#222222',
    '--color-text-secondary': '#5C4A50',
    '--color-text-tertiary': '#A99DA1',
    '--color-border': '#E8DCE0',
    '--color-link': '#8b7a80',
    '--color-grid-dot': 'rgba(198, 184, 188, 0.7)',
    '--color-accent': '#F9D7E3',
    '--color-accent-soft': '#F9D7E3',
    '--color-accent-text': '#D6336C',
    '--color-accent-text-strong': '#A61E4D',
    '--color-shadow': '#000000',
    '--color-tier-1': 'rgba(249, 215, 227, 0.4)',
    '--color-tier-2': 'rgba(210, 222, 241, 0.4)',
    '--color-tier-3': 'rgba(201, 236, 219, 0.4)',
    '--color-tier-4': 'rgba(240, 229, 163, 0.4)',
    '--color-tier-5': 'rgba(224, 204, 242, 0.4)',
    '--color-tier-6': 'rgba(220, 222, 225, 0.5)',
    '--color-tier-default': 'rgba(220, 222, 225, 0.5)',
  },
  dark: {
    '--color-bg': '#1E1E1E',
    '--color-panel-bg': '#2A2A2A',
    '--color-panel-bg-translucent': 'rgba(42, 42, 42, 0.8)',
    '--color-canvas-bg': '#1E1E1E',
    '--color-node-bg': '#2A2A2A',
    '--color-button-bg': '#333333',
    '--color-button-bg-hover': '#444444',
    '--color-bg-input': '#333333',
    '--color-text-primary': '#E5E5E5',
    '--color-text-secondary': '#9E9E9E',
    '--color-text-tertiary': '#616161',
    '--color-border': '#424242',
    '--color-link': '#888888',
    '--color-grid-dot': 'rgba(97, 97, 97, 0.5)',
    '--color-accent': '#FF9BB2',
    '--color-accent-soft': '#FF9BB2',
    '--color-accent-text': '#FF9BB2',
    '--color-accent-text-strong': '#FFC2D1',
    '--color-shadow': '#000000',
    '--color-tier-1': 'rgba(255, 155, 178, 0.07)',
    '--color-tier-2': 'rgba(147, 197, 253, 0.07)',
    '--color-tier-3': 'rgba(110, 231, 183, 0.07)',
    '--color-tier-4': 'rgba(252, 211, 77, 0.07)',
    '--color-tier-5': 'rgba(196, 181, 253, 0.07)',
    '--color-tier-6': 'rgba(107, 114, 128, 0.1)',
    '--color-tier-default': 'rgba(107, 114, 128, 0.1)',
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const storedTheme = window.localStorage.getItem('app-theme') as Theme;
      return storedTheme || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const themeProperties = themes[theme];
    
    Object.entries(themeProperties).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    try {
      window.localStorage.setItem('app-theme', theme);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Could not save theme to localStorage: ${error.message}`);
      } else {
        // Explicitly convert the unknown error to a string for logging to prevent type errors.
        console.error(`An unknown error occurred while saving theme to localStorage: ${String(error)}`);
      }
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
