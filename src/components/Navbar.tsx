import React from 'react';
import { Award, Settings as SettingsIcon, FolderPlus } from 'lucide-react';
import { Contest } from '../types';

interface NavbarProps {
  contests: Contest[];
  activeContestId: string;
  onSelectContest: (id: string) => void;
  onOpenSettings: () => void;
  onNewContest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  contests,
  activeContestId,
  onSelectContest,
  onOpenSettings,
  onNewContest,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                THEMIS WEB JUDGE
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Dành cho Giáo viên
              </span>
            </div>
            <p className="text-xs text-slate-400">Trạm chấm thi tự động &bull; Judge0 Engine</p>
          </div>
        </div>

        {/* Contest Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-slate-400">Kỳ thi:</label>
          <select
            value={activeContestId}
            onChange={(e) => onSelectContest(e.target.value)}
            className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs truncate"
          >
            {contests.length === 0 ? (
              <option value="">Chưa có kỳ thi nào</option>
            ) : (
              contests.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.problems.length} bài)
                </option>
              ))
            )}
          </select>
          <button
            onClick={onNewContest}
            title="Tạo kỳ thi mới"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Settings */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            title="Cài đặt hệ thống & Judge0"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition text-xs font-medium"
          >
            <SettingsIcon className="w-4 h-4 text-emerald-400" />
            <span>Cài đặt Judge0</span>
          </button>
        </div>
      </div>
    </header>
  );
};

