

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

type Theme = 'light' | 'slate' | 'midnight';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  light: {
    '--color-bg': '#FDFDFD',
    '--color-panel-bg': '#FFFFFF',
    '--color-panel-bg-translucent': 'rgba(255, 255, 255, 0.75)',
    '--color-canvas-bg': '#FDFDFD',
    '--color-node-bg': '#FFFFFF',
    '--color-button-bg': '#FEF2F2',
    '--color-button-bg-hover': '#FEE2E2',
    '--color-bg-input': '#FDFDFD',
    '--color-text-primary': '#1F2937',
    '--color-text-secondary': '#6B7280',
    '--color-text-tertiary': '#E5E7EB',
    '--color-border': '#FEE2E2',
    '--color-border-translucent': 'rgba(254, 226, 226, 0.7)',
    '--color-link': '#E11D48',
    '--color-grid-dot': 'rgba(244, 63, 94, 0.1)',
    '--color-accent': '#F43F5E',
    '--color-accent-soft': '#FFE4E6',
    '--color-accent-text': '#E11D48',
    '--color-accent-text-strong': '#FFFFFF',
    '--color-shadow': '#444444',
    '--color-tier-1': 'rgba(254, 226, 226, 0.4)',
    '--color-tier-2': 'rgba(219, 234, 254, 0.4)',
    '--color-tier-3': 'rgba(209, 250, 229, 0.4)',
    '--color-tier-4': 'rgba(254, 243, 199, 0.4)',
    '--color-tier-5': 'rgba(233, 213, 255, 0.4)',
    '--color-tier-6': 'rgba(243, 244, 246, 0.5)',
    '--color-tier-default': 'rgba(243, 244, 246, 0.5)',
    '--color-glow-highlight': 'rgba(255, 255, 255, 0.2)',
    '--color-aurora-1': 'rgba(251, 113, 133, 0.8)',
    '--color-aurora-2': 'rgba(147, 197, 253, 0.8)',
    '--color-aurora-3': 'rgba(221, 214, 254, 0.7)',
  },
  slate: {
    '--color-bg': '#1A202C',
    '--color-panel-bg': '#2D3748',
    '--color-panel-bg-translucent': 'rgba(45, 55, 72, 0.7)',
    '--color-canvas-bg': '#1A202C',
    '--color-node-bg': '#2D3748',
    '--color-button-bg': '#4A5568',
    '--color-button-bg-hover': '#718096',
    '--color-bg-input': '#4A5568',
    '--color-text-primary': '#F7FAFC',
    '--color-text-secondary': '#A0AEC0',
    '--color-text-tertiary': '#4A5568',
    '--color-border': '#4A5568',
    '--color-border-translucent': 'rgba(74, 85, 104, 0.7)',
    '--color-link': '#A0AEC0',
    '--color-grid-dot': 'rgba(113, 128, 150, 0.3)',
    '--color-accent': '#06B6D4',
    '--color-accent-soft': 'rgba(6, 182, 212, 0.1)',
    '--color-accent-text': '#06B6D4',
    '--color-accent-text-strong': '#FFFFFF',
    '--color-shadow': '#000000',
    '--color-tier-1': 'rgba(6, 182, 212, 0.05)',
    '--color-tier-2': 'rgba(59, 130, 246, 0.05)',
    '--color-tier-3': 'rgba(16, 185, 129, 0.05)',
    '--color-tier-4': 'rgba(245, 158, 11, 0.05)',
    '--color-tier-5': 'rgba(139, 92, 246, 0.05)',
    '--color-tier-6': 'rgba(107, 114, 128, 0.08)',
    '--color-tier-default': 'rgba(107, 114, 128, 0.08)',
    '--color-glow-highlight': 'rgba(255, 255, 255, 0.05)',
    '--color-aurora-1': 'rgba(6, 182, 212, 0.5)',
    '--color-aurora-2': 'rgba(59, 130, 246, 0.4)',
    '--color-aurora-3': 'rgba(16, 185, 129, 0.4)',
  },
  midnight: {
    '--color-bg': '#0B0F19',
    '--color-panel-bg': '#171E2C',
    '--color-panel-bg-translucent': 'rgba(23, 30, 44, 0.7)',
    '--color-canvas-bg': '#0B0F19',
    '--color-node-bg': '#171E2C',
    '--color-button-bg': '#252E42',
    '--color-button-bg-hover': '#343F56',
    '--color-bg-input': '#252E42',
    '--color-text-primary': '#E2E8F0',
    '--color-text-secondary': '#94A3B8',
    '--color-text-tertiary': '#334155',
    '--color-border': '#334155',
    '--color-border-translucent': 'rgba(51, 65, 85, 0.7)',
    '--color-link': '#94A3B8',
    '--color-grid-dot': 'rgba(148, 163, 184, 0.2)',
    '--color-accent': '#8B5CF6',
    '--color-accent-soft': 'rgba(139, 92, 246, 0.1)',
    '--color-accent-text': '#A78BFA',
    '--color-accent-text-strong': '#FFFFFF',
    '--color-shadow': '#000000',
    '--color-tier-1': 'rgba(139, 92, 246, 0.05)',
    '--color-tier-2': 'rgba(59, 130, 246, 0.05)',
    '--color-tier-3': 'rgba(217, 70, 239, 0.05)',
    '--color-tier-4': 'rgba(245, 158, 11, 0.05)',
    '--color-tier-5': 'rgba(20, 184, 166, 0.05)',
    '--color-tier-6': 'rgba(100, 116, 139, 0.08)',
    '--color-tier-default': 'rgba(100, 116, 139, 0.08)',
    '--color-glow-highlight': 'rgba(255, 255, 255, 0.05)',
    '--color-aurora-1': 'rgba(45, 2, 89, 0.5)',   // Deep Indigo/Purple
    '--color-aurora-2': 'rgba(217, 70, 239, 0.4)', // Vibrant Magenta/Fuchsia
    '--color-aurora-3': 'rgba(20, 184, 166, 0.3)', // Ethereal Teal
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