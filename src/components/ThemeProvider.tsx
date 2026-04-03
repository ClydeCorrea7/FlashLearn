import React, { createContext, useContext, useEffect, useState } from 'react';

export type ColorTheme = 'red' | 'blue' | 'purple' | 'green' | 'yellow' | 'grey';

export interface NeonPalette {
  blue: string;
  purple: string;
  cyan: string;
}

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  colorPalette: NeonPalette;
  toggleTheme: () => void;
  updateColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const PRESETS: Record<Theme, Record<ColorTheme, NeonPalette>> = {
  dark: {
    blue: { blue: '#60a5fa', purple: '#a78bfa', cyan: '#22d3ee' },
    red: { blue: '#ef4444', purple: '#7f1d1d', cyan: '#f87171' }, // Blood Red
    purple: { blue: '#8b5cf6', purple: '#4c1d95', cyan: '#c084fc' },
    green: { blue: '#22c55e', purple: '#064e3b', cyan: '#4ade80' },
    yellow: { blue: '#eab308', purple: '#713f12', cyan: '#fde047' },
    grey: { blue: '#94a3b8', purple: '#334155', cyan: '#cbd5e1' }
  },
  light: {
    blue: { blue: '#3b82f6', purple: '#8b5cf6', cyan: '#06b6d4' },
    red: { blue: '#dc2626', purple: '#991b1b', cyan: '#ef4444' }, // Blood Red
    purple: { blue: '#7c3aed', purple: '#5b21b6', cyan: '#a78bfa' },
    green: { blue: '#16a34a', purple: '#14532d', cyan: '#22c55e' },
    yellow: { blue: '#ca8a04', purple: '#854d0e', cyan: '#eab308' },
    grey: { blue: '#475569', purple: '#1e293b', cyan: '#64748b' }
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('blue');

  // Load persisted theme and palette from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('flashlearn-theme') as Theme | null;
    if (storedTheme) setTheme(storedTheme);

    const storedColorTheme = localStorage.getItem('flashlearn-color-theme') as ColorTheme | null;
    if (storedColorTheme) setColorTheme(storedColorTheme);
  }, []);

  const colorPalette = PRESETS[theme][colorTheme];

  // Apply theme class, inject CSS variables, and persist changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Inject Custom Neon Colors from Preset
    root.style.setProperty('--neon-blue', colorPalette.blue);
    root.style.setProperty('--neon-purple', colorPalette.purple);
    root.style.setProperty('--neon-cyan', colorPalette.cyan);
    
    localStorage.setItem('flashlearn-theme', theme);
    localStorage.setItem('flashlearn-color-theme', colorTheme);
  }, [theme, colorTheme, colorPalette]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateColorTheme = (newTheme: ColorTheme) => {
    setColorTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, colorPalette, toggleTheme, updateColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};