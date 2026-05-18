'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ThemeContext = createContext();

const CUSTOM_COLOR_VARS = ['--accent-primary', '--accent-hover', '--accent-gradient', '--shadow-glow'];

function clearCustomColorVars() {
  if (typeof document === 'undefined') return;
  CUSTOM_COLOR_VARS.forEach((name) => document.documentElement.style.removeProperty(name));
}

function applyCustomColor(hex) {
  if (typeof document === 'undefined' || !hex) return;
  const root = document.documentElement;
  root.style.setProperty('--accent-primary', hex);
  root.style.setProperty('--accent-hover', hex);
  root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${hex} 0%, ${hex} 100%)`);
  root.style.setProperty('--shadow-glow', `0 0 20px ${hex}55`);
}

function applyAccentToDom(accent, customColor) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-accent', accent || 'blue');
  if (accent === 'custom' && customColor) {
    applyCustomColor(customColor);
  } else {
    clearCustomColorVars();
  }
}

function applyThemeToDom(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme || 'dark');
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('blue');
  const [customColor, setCustomColor] = useState(null);
  const [savedTheme, setSavedTheme] = useState('dark');
  const [savedAccent, setSavedAccent] = useState('blue');
  const [savedCustomColor, setSavedCustomColor] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const lsTheme = localStorage.getItem('theme') || 'dark';
    const lsAccent = localStorage.getItem('accent') || 'blue';
    const lsCustom = localStorage.getItem('custom-accent-color') || null;
    setTheme(lsTheme);
    setAccent(lsAccent);
    setCustomColor(lsCustom);
    setSavedTheme(lsTheme);
    setSavedAccent(lsAccent);
    setSavedCustomColor(lsCustom);
    applyThemeToDom(lsTheme);
    applyAccentToDom(lsAccent, lsCustom);
  }, []);

  const hydrateAppearance = useCallback((settings) => {
    if (!settings) return;
    const nextTheme = settings.theme || 'dark';
    const nextAccent = settings.accent || 'blue';
    const nextCustom = settings.customColor || null;

    setTheme(nextTheme);
    setAccent(nextAccent);
    setCustomColor(nextCustom);
    setSavedTheme(nextTheme);
    setSavedAccent(nextAccent);
    setSavedCustomColor(nextCustom);

    localStorage.setItem('theme', nextTheme);
    localStorage.setItem('accent', nextAccent);
    if (nextCustom) {
      localStorage.setItem('custom-accent-color', nextCustom);
    } else {
      localStorage.removeItem('custom-accent-color');
    }

    applyThemeToDom(nextTheme);
    applyAccentToDom(nextAccent, nextCustom);
    hydratedRef.current = true;
  }, []);

  const previewTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    applyThemeToDom(newTheme);
  }, []);

  const previewAccent = useCallback((newAccent, newCustomColor = null) => {
    setAccent(newAccent);
    setCustomColor(newCustomColor);
    applyAccentToDom(newAccent, newCustomColor);
  }, []);

  const commitTheme = useCallback((newTheme) => {
    setSavedTheme(newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyThemeToDom(newTheme);
  }, []);

  const commitAccent = useCallback((newAccent, newCustomColor = null) => {
    setSavedAccent(newAccent);
    setSavedCustomColor(newCustomColor);
    setAccent(newAccent);
    setCustomColor(newCustomColor);
    localStorage.setItem('accent', newAccent);
    if (newCustomColor) {
      localStorage.setItem('custom-accent-color', newCustomColor);
    } else {
      localStorage.removeItem('custom-accent-color');
    }
    applyAccentToDom(newAccent, newCustomColor);
  }, []);

  // Geriye dönük uyumluluk: eski çağrıları kırmamak için kalıyor (instant kayıt davranışını korur).
  const changeTheme = commitTheme;
  const changeAccent = (newAccent) => commitAccent(newAccent, null);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accent,
        customColor,
        savedTheme,
        savedAccent,
        savedCustomColor,
        hydrateAppearance,
        previewTheme,
        previewAccent,
        commitTheme,
        commitAccent,
        changeTheme,
        changeAccent,
        globalLoading,
        setGlobalLoading,
      }}
    >
      {children}
      {globalLoading && (
        <div className="global-loading-overlay">
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-inner"></div>
          </div>
          <div className="loading-text">İşlem Yapılıyor...</div>
        </div>
      )}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
