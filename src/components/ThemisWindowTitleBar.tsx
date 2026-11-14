import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { ColorMode } from '../types';

interface ThemisWindowTitleBarProps {
  title: string;
  colorMode: ColorMode;
  onSetColorMode: (mode: ColorMode) => void;
}

export const ThemisWindowTitleBar: React.FC<ThemisWindowTitleBarProps> = ({
  title,
  colorMode,
  onSetColorMode,
}) => {
  return (
    <header className="bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/[0.08] text-neutral-900 dark:text-neutral-100 h-10 px-4 flex items-center justify-between select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-xs transition-colors">
      {/* Left: App Logo & Contest Title */}
      <div className="flex items-center space-x-2.5 truncate">
        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
          <img
            src="/icons/themis.png"
            alt="Themis Scale"
            className="w-4 h-4 object-contain filter drop-shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-2 truncate">
          <span className="font-semibold text-[13px] tracking-tight text-neutral-900 dark:text-white">
            Themis Web
          </span>
          <span className="text-neutral-300 dark:text-neutral-600 font-normal">&bull;</span>
          <span className="text-neutral-600 dark:text-neutral-400 font-medium text-[12px] truncate max-w-md">
            {title ? title : 'Chưa mở kỳ thi'}
          </span>
        </div>
      </div>

      {/* Right: Color Scheme Switcher (Light / Dark / Auto System) */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center bg-black/[0.05] dark:bg-white/[0.08] p-0.5 rounded-xl text-[11px] font-medium border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => onSetColorMode('light')}
            title="Giao diện Sáng (Light Mode)"
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
              colorMode === 'light'
                ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Sáng</span>
          </button>

          <button
            type="button"
            onClick={() => onSetColorMode('dark')}
            title="Giao diện Tối (Dark Mode)"
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
              colorMode === 'dark'
                ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span>Tối</span>
          </button>

          <button
            type="button"
            onClick={() => onSetColorMode('system')}
            title="Tự động theo cài đặt trình duyệt / hệ thống"
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
              colorMode === 'system'
                ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Hệ thống</span>
          </button>
        </div>
      </div>
    </header>
  );
};
