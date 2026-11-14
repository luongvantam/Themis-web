import { useState, useEffect } from 'react';
import { ColorMode } from '../types';

export function useColorMode() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const saved = localStorage.getItem('themis_color_mode') as ColorMode | null;
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  });

  const [resolvedDark, setResolvedDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (colorMode === 'dark') return true;
    if (colorMode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      const isDark = colorMode === 'dark' || (colorMode === 'system' && mediaQuery.matches);
      setResolvedDark(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateResolved();

    const handler = () => {
      if (colorMode === 'system') {
        updateResolved();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [colorMode]);

  const setMode = (mode: ColorMode) => {
    setColorMode(mode);
    localStorage.setItem('themis_color_mode', mode);
  };

  return { colorMode, setColorMode: setMode, isDark: resolvedDark };
}
