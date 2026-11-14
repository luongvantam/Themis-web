import React from 'react';

interface ThemisWindowTitleBarProps {
  title: string;
}

export const ThemisWindowTitleBar: React.FC<ThemisWindowTitleBarProps> = ({ title }) => {
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
    </div>
  );
};
