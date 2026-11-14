import React from 'react';
import { Settings } from 'lucide-react';

interface ThemisWindowTitleBarProps {
  title: string;
  onOpenSettings?: () => void;
}

export const ThemisWindowTitleBar: React.FC<ThemisWindowTitleBarProps> = ({
  title,
  onOpenSettings,
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
      {/* Right: Quick Settings */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          title="Cài đặt hệ thống (Ctrl+,)"
          className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </header>
  );
};
