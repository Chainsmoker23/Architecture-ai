

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

type Theme = 'light' | 'medium' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  light: {
    '--color-bg': '#FFF9FB',
    '--color-panel-bg': '#FFFFFF',
    '--color-panel-bg-translucent': 'rgba(255, 255, 255, 0.75)',
    '--color-canvas-bg': '#FFF9FB',
    '--color-node-bg': '#FFFFFF',
    '--color-button-bg': '#FCE4EC',
    '--color-button-bg-hover': '#F8BBD0',
    '--color-bg-input': '#FFF9FB',
    '--color-text-primary': '#2B2B2B',
    '--color-text-secondary': '#555555',
    '--color-text-tertiary': '#D1D5DB',
    '--color-border': '#F8BBD0',
    '--color-border-translucent': 'rgba(248, 187, 208, 0.5)',
    '--color-link': '#D6336C',
    '--color-grid-dot': 'rgba(240, 98, 146, 0.15)',
    '--color-accent': '#F06292',
    '--color-accent-soft': '#FCE4EC',
    '--color-accent-text': '#D6336C',
    '--color-accent-text-strong': '#FFFFFF',
    '--color-shadow': '#444444',
    '--color-tier-1': 'rgba(252, 228, 236, 0.4)',
    '--color-tier-2': 'rgba(224, 236, 255, 0.4)',
    '--color-tier-3': 'rgba(209, 250, 229, 0.4)',
    '--color-tier-4': 'rgba(255, 243, 205, 0.4)',
    '--color-tier-5': 'rgba(233, 213, 255, 0.4)',
    '--color-tier-6': 'rgba(241, 243, 245, 0.5)',
    '--color-tier-default': 'rgba(241, 243, 245, 0.5)',
    '--color-aurora-1': 'rgba(252, 228, 236, 1)',
    '--color-aurora-2': 'rgba(224, 236, 255, 1)',
    '--color-aurora-3': 'rgba(233, 213, 255, 0.9)',
  },
  medium: {
    '--color-bg': '#DFD8D7',
    '--color-panel-bg': '#EDE9E8',
    '--color-panel-bg-translucent': 'rgba(237, 233, 232, 0.8)',
    '--color-canvas-bg': '#DFD8D7',
    '--color-node-bg': '#EDE9E8',
    '--color-button-bg': '#D2C9C7',
    '--color-button-bg-hover': '#C5B9B7',
    '--color-bg-input': '#DFD8D7',
    '--color-text-primary': '#3D3534',
    '--color-text-secondary': '#6E605E',
    '--color-text-tertiary': '#A99DA1',
    '--color-border': '#D2C9C7',
    '--color-border-translucent': 'rgba(210, 201, 199, 0.5)',
    '--color-link': '#6E605E',
    '--color-grid-dot': 'rgba(180, 168, 166, 0.7)',
    '--color-accent': '#E57373',
    '--color-accent-soft': '#FFEBEE',
    '--color-accent-text': '#D32F2F',
    '--color-accent-text-strong': '#FFFFFF',
    '--color-shadow': '#3D3534',
    '--color-tier-1': 'rgba(255, 235, 238, 0.3)',
    '--color-tier-2': 'rgba(227, 242, 253, 0.3)',
    '--color-tier-3': 'rgba(232, 245, 233, 0.3)',
    '--color-tier-4': 'rgba(255, 248, 225, 0.3)',
    '--color-tier-5': 'rgba(243, 229, 245, 0.3)',
    '--color-tier-6': 'rgba(236, 239, 241, 0.4)',
    '--color-tier-default': 'rgba(236, 239, 241, 0.4)',
    '--color-aurora-1': 'rgba(255, 235, 238, 0.9)',
    '--color-aurora-2': 'rgba(255, 224, 178, 0.8)',
    '--color-aurora-3': 'rgba(229, 206, 202, 0.9)',
  },
  dark: {
    '--color-bg': '#111827',
    '--color-panel-bg': '#1F2937',
    '--color-panel-bg-translucent': 'rgba(31, 41, 55, 0.7)',
    '--color-canvas-bg': '#111827',
    '--color-node-bg': '#1F2937',
    '--color-button-bg': '#374151',
    '--color-button-bg-hover': '#4B5563',
    '--color-bg-input': '#374151',
    '--color-text-primary': '#F9FAFB',
    '--color-text-secondary': '#9CA3AF',
    '--color-text-tertiary': '#4B5563',
    '--color-border': '#374151',
    '--color-border-translucent': 'rgba(55, 65, 81, 0.7)',
    '--color-link': '#9CA3AF',
    '--color-grid-dot': 'rgba(75, 85, 99, 0.5)',
    '--color-accent': '#F472B6',
    '--color-accent-soft': 'rgba(244, 114, 182, 0.1)',
    '--color-accent-text': '#F472B6',
    '--color-accent-text-strong': '#111827',
    '--color-shadow': '#000000',
    '--color-tier-1': 'rgba(244, 114, 182, 0.05)',
    '--color-tier-2': 'rgba(96, 165, 250, 0.05)',
    '--color-tier-3': 'rgba(52, 211, 153, 0.05)',
    '--color-tier-4': 'rgba(251, 191, 36, 0.05)',
    '--color-tier-5': 'rgba(167, 139, 250, 0.05)',
    '--color-tier-6': 'rgba(107, 114, 128, 0.08)',
    '--color-tier-default': 'rgba(107, 114, 128, 0.08)',
    '--color-aurora-1': 'rgba(244, 114, 182, 0.45)',
    '--color-aurora-2': 'rgba(96, 165, 250, 0.35)',
    '--color-aurora-3': 'rgba(167, 139, 250, 0.35)',
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
      // FIX: Explicitly cast value to string to satisfy setProperty's type requirement.
      root.style.setProperty(key, value as string);
    });

    try {
      window.localStorage.setItem('app-theme', theme);
    } catch (error) {
      // FIX: The error object in a catch block is of type 'unknown' and must be explicitly cast to a string to be used in a template literal.
      console.error(`Could not access localStorage to save theme: ${String(error)}`);
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