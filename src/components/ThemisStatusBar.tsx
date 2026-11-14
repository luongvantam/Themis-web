import React from 'react';
import { Server, FileCode, Users } from 'lucide-react';

interface ThemisStatusBarProps {
  statusText: string;
  isJudging: boolean;
  progressPercent?: number;
  totalSubmissions: number;
  totalProblems: number;
}

export const ThemisStatusBar: React.FC<ThemisStatusBarProps> = ({
  statusText,
  isJudging,
  totalSubmissions,
  totalProblems,
}) => {
  return (
    <footer className="bg-white/80 dark:bg-[#1A1A1E]/80 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] px-4 py-2 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center justify-between select-none transition-colors">
      {/* Status text */}
      <div className="flex items-center space-x-2.5 min-w-0 max-w-lg truncate">
        {isJudging ? (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
        )}
        <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
          {statusText}
        </span>
      </div>

      {/* Stats badges */}
      <div className="flex items-center space-x-4 text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
        <div className="flex items-center space-x-1.5">
          <FileCode className="w-3.5 h-3.5 text-neutral-400" />
          <span>Đề thi: <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">{totalProblems}</strong></span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-neutral-400" />
          <span>Bài nộp: <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">{totalSubmissions}</strong></span>
        </div>

        <div className="flex items-center space-x-1.5 pl-2 border-l border-black/[0.08] dark:border-white/[0.08]">
          <Server className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Judge0: Sẵn sàng</span>
        </div>
      </div>
    </footer>
  );
};
