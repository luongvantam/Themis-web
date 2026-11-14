import { useState, useEffect } from 'react';
import { ColorMode } from '../types';

export function useColorMode() {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const saved = localStorage.getItem('themis_color_mode') as ColorMode | null;
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  });

  const isDark = colorMode === 'dark';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const setMode = (mode: ColorMode) => {
    setColorMode(mode);
    localStorage.setItem('themis_color_mode', mode);
  };

  return { colorMode, setColorMode: setMode, isDark };
}
