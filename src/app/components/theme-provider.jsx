'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('blue');
  const [globalLoading, setGlobalLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedAccent = localStorage.getItem('accent') || 'blue';
    
    setTheme(savedTheme);
    setAccent(savedAccent);
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-accent', savedAccent);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const changeAccent = (newAccent) => {
    setAccent(newAccent);
    localStorage.setItem('accent', newAccent);
    document.documentElement.setAttribute('data-accent', newAccent);
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, changeTheme, changeAccent, globalLoading, setGlobalLoading }}>
      {children}
      {globalLoading && (
        <div className="global-loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">İşlem Yapılıyor...</div>
        </div>
      )}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
