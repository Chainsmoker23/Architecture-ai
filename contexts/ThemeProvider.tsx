

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

type Theme = 'light' | 'slate' | 'midnight';

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
    '--color-glow-highlight': 'rgba(255, 255, 255, 0.2)',
    '--color-aurora-1': 'rgba(252, 228, 236, 1)',
    '--color-aurora-2': 'rgba(224, 236, 255, 1)',
    '--color-aurora-3': 'rgba(233, 213, 255, 0.9)',
  },
  slate: {
    '--color-bg': '#1F2937',
    '--color-panel-bg': '#273444',
    '--color-panel-bg-translucent': 'rgba(39, 52, 68, 0.7)',
    '--color-canvas-bg': '#1F2937',
    '--color-node-bg': '#273444',
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
    '--color-accent': '#22D3EE',
    '--color-accent-soft': 'rgba(34, 211, 238, 0.1)',
    '--color-accent-text': '#22D3EE',
    '--color-accent-text-strong': '#111827',
    '--color-shadow': '#000000',
    '--color-tier-1': 'rgba(34, 211, 238, 0.05)',
    '--color-tier-2': 'rgba(96, 165, 250, 0.05)',
    '--color-tier-3': 'rgba(52, 211, 153, 0.05)',
    '--color-tier-4': 'rgba(251, 191, 36, 0.05)',
    '--color-tier-5': 'rgba(167, 139, 250, 0.05)',
    '--color-tier-6': 'rgba(107, 114, 128, 0.08)',
    '--color-tier-default': 'rgba(107, 114, 128, 0.08)',
    '--color-glow-highlight': 'rgba(255, 255, 255, 0.05)',
    '--color-aurora-1': 'rgba(34, 211, 238, 0.45)',
    '--color-aurora-2': 'rgba(96, 165, 250, 0.35)',
    '--color-aurora-3': 'rgba(52, 211, 153, 0.35)',
  },
  midnight: {
    '--color-bg': '#0D1117',
    '--color-panel-bg': '#161B22',
    '--color-panel-bg-translucent': 'rgba(22, 27, 34, 0.7)',
    '--color-canvas-bg': '#0D1117',
    '--color-node-bg': '#161B22',
    '--color-button-bg': '#21262D',
    '--color-button-bg-hover': '#30363D',
    '--color-bg-input': '#21262D',
    '--color-text-primary': '#F0F6FC',
    '--color-text-secondary': '#8B949E',
    '--color-text-tertiary': '#30363D',
    '--color-border': '#30363D',
    '--color-border-translucent': 'rgba(48, 54, 61, 0.7)',
    '--color-link': '#8B949E',
    '--color-grid-dot': 'rgba(139, 148, 158, 0.2)',
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
    '--color-glow-highlight': 'rgba(255, 255, 255, 0.05)',
    '--color-aurora-1': 'rgba(255, 0, 110, 0.45)',   // Hot Pink
    '--color-aurora-2': 'rgba(128, 0, 255, 0.4)',  // Electric Purple
    '--color-aurora-3': 'rgba(0, 238, 255, 0.35)',  // Cyan
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