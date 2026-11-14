import React from 'react';
import { Server, Activity, CheckCircle2, FileCode, Users } from 'lucide-react';
import { UITheme } from '../types';

interface ThemisStatusBarProps {
  statusText: string;
  isJudging: boolean;
  progressPercent: number;
  totalSubmissions: number;
  totalProblems: number;
  theme?: UITheme;
}

export const ThemisStatusBar: React.FC<ThemisStatusBarProps> = ({
  statusText,
  isJudging,
  progressPercent,
  totalSubmissions,
  totalProblems,
  theme = 'apple',
}) => {
  if (theme === 'apple') {
    return (
      <footer className="bg-white/75 dark:bg-[#1A1A1E]/80 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] px-4 py-2 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center justify-between select-none transition-colors">
        {/* Status text */}
        <div className="flex items-center space-x-2 min-w-[220px] max-w-md truncate">
          {isJudging ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          )}
          <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
            {statusText}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center space-x-3 w-56">
          <div className="flex-1 bg-black/[0.06] dark:bg-white/[0.08] h-2 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isJudging
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  : progressPercent > 0
                  ? 'bg-emerald-500'
                  : 'bg-transparent'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 w-8 text-right font-medium">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Stats badges */}
        <div className="flex items-center space-x-4 text-[11px] text-neutral-500 dark:text-neutral-400">
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
  }

  // Classic Delphi 200x Windows mode
  return (
    <div className="bg-[#F0F0F0] border-t border-[#D0D0D0] px-1 py-0.5 text-[11px] font-sans text-slate-700 flex items-center justify-between select-none">
      {/* Panel 1: Status text */}
      <div className="flex-1 min-w-[200px] max-w-lg px-2 py-0.5 mr-1 border-t border-l border-[#808080] border-b border-r border-white bg-[#F8F8F8] flex items-center space-x-1.5 truncate">
        {isJudging ? (
          <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        )}
        <span className="truncate text-black font-medium">{statusText}</span>
      </div>

      {/* Panel 2: Progress bar */}
      <div className="w-48 px-2 py-0.5 mr-1 border-t border-l border-[#808080] border-b border-r border-white bg-[#F8F8F8] flex items-center space-x-2">
        <div className="flex-1 bg-[#E0E0E0] h-2.5 rounded-none border border-[#B0B0B0] overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isJudging
                ? 'bg-gradient-to-r from-[#008000] to-[#22C55E]'
                : progressPercent > 0
                ? 'bg-[#008000]'
                : 'bg-transparent'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] w-7 text-right font-mono text-slate-600">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Panel 3: Problem count */}
      <div className="px-2 py-0.5 mr-1 border-t border-l border-[#808080] border-b border-r border-white bg-[#F8F8F8] text-slate-700">
        Đề thi: <strong className="text-black">{totalProblems}</strong> bài
      </div>

      {/* Panel 4: Submissions count */}
      <div className="px-2 py-0.5 mr-1 border-t border-l border-[#808080] border-b border-r border-white bg-[#F8F8F8] text-slate-700">
        Bài nộp: <strong className="text-black">{totalSubmissions}</strong> bài
      </div>

      {/* Panel 5: Backend status */}
      <div className="px-2 py-0.5 border-t border-l border-[#808080] border-b border-r border-white bg-[#F8F8F8] flex items-center space-x-1 text-emerald-700 font-medium">
        <Server className="w-3 h-3 text-emerald-600" />
        <span>Judge0: Sẵn sàng</span>
      </div>
    </div>
  );
};
