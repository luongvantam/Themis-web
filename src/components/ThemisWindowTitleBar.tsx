import React from 'react';
import { UITheme } from '../types';

interface ThemisWindowTitleBarProps {
  title: string;
  theme?: UITheme;
  onToggleTheme?: (newTheme: UITheme) => void;
}

export const ThemisWindowTitleBar: React.FC<ThemisWindowTitleBarProps> = ({
  title,
  theme = 'apple',
  onToggleTheme,
}) => {
  const isApple = theme === 'apple';

  if (isApple) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border-b border-black/[0.08] text-neutral-900 h-9 px-3.5 flex items-center justify-between select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-xs transition-colors">
        {/* Left: macOS Traffic Lights */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 group cursor-default">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-sm flex items-center justify-center text-[8px] text-black/60 group-hover:text-black">
              <span className="opacity-0 group-hover:opacity-100">✕</span>
            </span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm flex items-center justify-center text-[8px] text-black/60 group-hover:text-black">
              <span className="opacity-0 group-hover:opacity-100">−</span>
            </span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-sm flex items-center justify-center text-[8px] text-black/60 group-hover:text-black">
              <span className="opacity-0 group-hover:opacity-100">+</span>
            </span>
          </div>

          <div className="h-3.5 w-px bg-black/[0.1] mx-1" />

          {/* Title & App Icon */}
          <div className="flex items-center space-x-2">
            <img
              src="/icons/themis.png"
              alt="Themis Scale"
              className="w-4 h-4 object-contain filter drop-shadow-sm"
            />
            <span className="font-semibold text-[12px] tracking-tight text-neutral-900">
              Themis Web
            </span>
            <span className="text-neutral-400 font-normal">&bull;</span>
            <span className="text-neutral-600 font-medium text-[12px] truncate max-w-sm">
              {title ? title : 'Chưa mở kỳ thi'}
            </span>
          </div>
        </div>

        {/* Right: Apple / Delphi Theme Switcher */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-black/[0.05] p-0.5 rounded-full text-[11px] font-medium border border-black/[0.04] shadow-inner">
            <button
              type="button"
              onClick={() => onToggleTheme?.('apple')}
              title="Giao diện hiện đại Apple Cupertino đang bật"
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white text-neutral-900 shadow-sm font-semibold transition-all"
            >
              <span>🍏 Apple</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleTheme?.('classic')}
              title="Chuyển sang giao diện cổ điển Themis Delphi 200x"
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-neutral-500 hover:text-neutral-900 transition-all"
            >
              <span>🪟 Delphi 200x</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Classic 200x Delphi Windows Mode
  return (
    <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-3 flex items-center justify-between select-none shadow-sm text-xs font-semibold">
      {/* Icon & Title */}
      <div className="flex items-center space-x-2 truncate">
        <img
          src="/icons/themis.png"
          alt="Themis Scale"
          className="w-4 h-4 object-contain filter drop-shadow"
        />
        <span className="truncate tracking-wide text-[12px] font-bold text-white drop-shadow-sm font-sans">
          Themis Web - {title ? `[${title}]` : '[Chưa mở kỳ thi]'}
        </span>
      </div>

      {/* Right: Theme Switcher & Classic Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-white/20 p-0.5 rounded text-[10px] font-sans border border-white/30">
          <button
            type="button"
            onClick={() => onToggleTheme?.('apple')}
            title="Chuyển sang giao diện hiện đại Apple Cupertino"
            className="px-1.5 py-0.5 rounded transition text-white hover:text-amber-200"
          >
            🍏 Apple
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme?.('classic')}
            title="Giao diện cổ điển Delphi 200x đang bật"
            className="px-1.5 py-0.5 rounded transition bg-white text-[#0A246A] font-bold"
          >
            🪟 200x
          </button>
        </div>

        {/* Windows Classic Min/Max/Close */}
        <div className="flex items-center space-x-1 pl-2">
          <button
            type="button"
            title="Thu nhỏ"
            className="w-4 h-4 bg-[#ECE9D8] hover:bg-[#D4D0C8] active:bg-[#B0ACA4] text-black font-bold flex items-center justify-center text-[10px] border-t border-l border-white border-b border-r border-[#404040]"
          >
            _
          </button>
          <button
            type="button"
            title="Phóng to"
            className="w-4 h-4 bg-[#ECE9D8] hover:bg-[#D4D0C8] active:bg-[#B0ACA4] text-black font-bold flex items-center justify-center text-[10px] border-t border-l border-white border-b border-r border-[#404040]"
          >
            □
          </button>
          <button
            type="button"
            title="Đóng"
            className="w-4 h-4 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white text-black font-bold flex items-center justify-center text-[10px] border-t border-l border-white border-b border-r border-[#404040]"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
