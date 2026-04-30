'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('blue');

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedAccent = localStorage.getItem('accent') || 'blue';
    
    setTheme(savedTheme);
    setAccent(savedAccent);
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedAccent !== 'blue') {
      document.documentElement.setAttribute('data-theme', savedAccent);
    }
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // If we switch to light/dark, we should re-apply the accent if it's not default
    if (accent !== 'blue') {
      // Small delay to ensure light/dark is applied first
      setTimeout(() => {
        document.documentElement.setAttribute('data-theme', accent);
      }, 10);
    }
  };

  const changeAccent = (newAccent) => {
    setAccent(newAccent);
    localStorage.setItem('accent', newAccent);
    
    if (newAccent === 'blue') {
      // Re-apply base theme
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.setAttribute('data-theme', newAccent);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, changeTheme, changeAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
