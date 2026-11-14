import React from 'react';
import { Server, Activity, CheckCircle2 } from 'lucide-react';

interface ThemisStatusBarProps {
  statusText: string;
  isJudging: boolean;
  progressPercent: number;
  totalSubmissions: number;
  totalProblems: number;
}

export const ThemisStatusBar: React.FC<ThemisStatusBarProps> = ({
  statusText,
  isJudging,
  progressPercent,
  totalSubmissions,
  totalProblems,
}) => {
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
