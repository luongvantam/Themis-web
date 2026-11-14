import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderOpen, Save, Play, Pause, Square, RotateCcw, 
  Settings, HelpCircle, FileText, FolderPlus, FolderArchive, Users, Upload,
  FileSpreadsheet, Filter, CheckSquare, Square as EmptySquare, Trash2
} from 'lucide-react';
import { UITheme } from '../types';

export interface ThemisMenuBarProps {
  contestTitle: string;
  isJudging: boolean;
  theme?: UITheme;
  onNewContest: () => void;
  onOpenTaskFolder: () => void;
  onOpenZip: () => void;
  onOpenSubmissionFolder: () => void;
  onAddSubmissions: () => void;
  onSaveContest: () => void;
  onSaveContestZip?: () => void;
  onStartJudging: () => void;
  onPauseJudging: () => void;
  onStopJudging: () => void;
  onRejudgeAll: () => void;
  onOpenTasksConfig: () => void;
  onOpenStudentManager?: () => void;
  onOpenSelectiveJudging?: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportTXT: () => void;
  onSelectAllTasks?: () => void;
  onDeselectAllTasks?: () => void;
  onInvertTasks?: () => void;
  onSelectAllStudents?: () => void;
  onDeselectAllStudents?: () => void;
  onInvertStudents?: () => void;
  onClearScores?: () => void;
  onShowDocs?: () => void;
}

export const ThemisMenuBar: React.FC<ThemisMenuBarProps> = ({
  contestTitle: _contestTitle,
  isJudging,
  theme = 'apple',
  onNewContest,
  onOpenTaskFolder,
  onOpenZip,
  onOpenSubmissionFolder,
  onAddSubmissions,
  onSaveContest,
  onSaveContestZip,
  onStartJudging,
  onPauseJudging,
  onStopJudging,
  onRejudgeAll,
  onOpenTasksConfig,
  onOpenStudentManager,
  onOpenSelectiveJudging,
  onOpenSettings,
  onOpenAbout,
  onExportCSV,
  onExportExcel,
  onExportTXT,
  onSelectAllTasks,
  onDeselectAllTasks,
  onInvertTasks,
  onSelectAllStudents,
  onDeselectAllStudents,
  onInvertStudents,
  onClearScores,
  onShowDocs,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isApple = theme === 'apple';

  const menuBtnClass = (menuName: string) =>
    isApple
      ? `px-3 py-1 rounded-md text-[12px] font-medium transition ${
          openMenu === menuName
            ? 'bg-black/[0.08] text-neutral-900'
            : 'text-neutral-700 hover:text-neutral-900 hover:bg-black/[0.04]'
        }`
      : `px-3 py-1 hover:bg-[#B6BDD2] hover:text-[#000000] border border-transparent hover:border-[#0A246A] rounded-none transition ${
          openMenu === menuName ? 'bg-[#B6BDD2] border-[#0A246A] text-black' : ''
        }`;

  const dropdownClass = isApple
    ? 'absolute left-0 top-full mt-1 bg-white/95 backdrop-blur-2xl border border-black/10 shadow-2xl rounded-xl p-1 text-[12px] text-neutral-800 animate-in fade-in zoom-in-95 duration-150 z-50'
    : 'absolute left-0 top-full w-72 bg-[#FFFFFF] border border-[#7A7A7A] shadow-xl py-1 text-[12px] text-black rounded-none z-50';

  const itemHoverClass = isApple
    ? 'hover:bg-[#0071E3] hover:text-white rounded-lg transition-colors'
    : 'hover:bg-[#B6BDD2]';

  return (
    <div
      ref={menuRef}
      className={
        isApple
          ? 'bg-white/70 backdrop-blur-md text-neutral-800 select-none text-[12px] font-medium border-b border-black/[0.06] relative z-50 px-2'
          : 'bg-[#ECE9D8] text-[#1E1E1E] select-none text-[12px] border-b border-[#D8D8D8] relative z-50'
      }
    >
      <div className="flex items-center px-1">
        {/* 1. Menu Kỳ thi (F) */}
        <div className="relative">
          <button onClick={() => handleMenuClick('contest')} className={menuBtnClass('contest')}>
            Kỳ thi {isApple ? '' : '(F)'}
          </button>
          {openMenu === 'contest' && (
            <div className={`${dropdownClass} w-72`}>
              <button
                onClick={() => { onNewContest(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FolderPlus className="w-4 h-4 text-[#0078D7]" />
                  <span>Tạo kỳ thi mới...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+N</span>
              </button>

              <button
                onClick={() => { onOpenZip(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FolderArchive className="w-4 h-4 text-amber-600" />
                  <span>Mở kỳ thi (.contest, .themis)...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+O</span>
              </button>

              <button
                onClick={() => { onOpenTaskFolder(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                  <span>Nạp thư mục Đề & Test...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F2</span>
              </button>

              <button
                onClick={() => { onOpenSubmissionFolder(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Nạp thư mục bài làm Học sinh...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F3</span>
              </button>

              <button
                onClick={() => { onAddSubmissions(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span>Nạp file lẻ (bổ sung/cập nhật)...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Shift+F3</span>
              </button>

              <div className="h-px bg-black/[0.06] my-1" />

              <button
                onClick={() => { onSaveContest(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Save className="w-4 h-4 text-blue-600" />
                  <span>Lưu trạng thái kỳ thi</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+S</span>
              </button>

              {onSaveContestZip && (
                <button
                  onClick={() => { onSaveContestZip(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <FolderArchive className="w-4 h-4 text-purple-600" />
                    <span>Xuất file gói kỳ thi (.contest)...</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+Shift+S</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Menu Đề thi & Test Cases (T) */}
        <div className="relative">
          <button onClick={() => handleMenuClick('tasks')} className={menuBtnClass('tasks')}>
            Đề thi {isApple ? '' : '(T)'}
          </button>
          {openMenu === 'tasks' && (
            <div className={`${dropdownClass} w-72`}>
              <button
                onClick={() => { onOpenTasksConfig(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-[#0078D7]" />
                  <span>Cấu hình danh sách bài & bộ test...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F6</span>
              </button>

              <div className="h-px bg-black/[0.06] my-1" />

              {onSelectAllTasks && (
                <button
                  onClick={() => { onSelectAllTasks(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Chọn tất cả bài toán để chấm</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+Shift+A</span>
                </button>
              )}

              {onDeselectAllTasks && (
                <button
                  onClick={() => { onDeselectAllTasks(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <EmptySquare className="w-4 h-4 text-slate-400" />
                    <span>Bỏ chọn tất cả bài toán</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+Shift+D</span>
                </button>
              )}

              {onInvertTasks && (
                <button
                  onClick={() => { onInvertTasks(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-amber-600" />
                    <span>Đảo ngược lựa chọn bài toán</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+Shift+I</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Menu Thí sinh (C) */}
        <div className="relative">
          <button onClick={() => handleMenuClick('students')} className={menuBtnClass('students')}>
            Thí sinh {isApple ? '' : '(C)'}
          </button>
          {openMenu === 'students' && (
            <div className={`${dropdownClass} w-72`}>
              {onOpenStudentManager && (
                <button
                  onClick={() => { onOpenStudentManager(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Quản lý danh sách thí sinh...</span>
                </button>
              )}

              <div className="h-px bg-black/[0.06] my-1" />

              {onSelectAllStudents && (
                <button
                  onClick={() => { onSelectAllStudents(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Chọn tất cả thí sinh để chấm</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+A</span>
                </button>
              )}

              {onDeselectAllStudents && (
                <button
                  onClick={() => { onDeselectAllStudents(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <EmptySquare className="w-4 h-4 text-slate-400" />
                    <span>Bỏ chọn tất cả thí sinh</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+D</span>
                </button>
              )}

              {onInvertStudents && (
                <button
                  onClick={() => { onInvertStudents(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-amber-600" />
                    <span>Đảo ngược lựa chọn thí sinh</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+I</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Menu Chấm bài & Kết quả (J) */}
        <div className="relative">
          <button onClick={() => handleMenuClick('judge')} className={menuBtnClass('judge')}>
            Chấm bài {isApple ? '' : '(J)'}
          </button>
          {openMenu === 'judge' && (
            <div className={`${dropdownClass} w-72`}>
              <button
                onClick={() => { onStartJudging(); setOpenMenu(null); }}
                disabled={isJudging}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass} ${
                  isJudging ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span className="font-semibold text-emerald-800">Chấm bài (F9)</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F9</span>
              </button>

              <button
                onClick={() => { onPauseJudging(); setOpenMenu(null); }}
                disabled={!isJudging}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass} ${
                  !isJudging ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Pause className="w-4 h-4 text-amber-600" />
                  <span>Tạm dừng</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F6</span>
              </button>

              <button
                onClick={() => { onStopJudging(); setOpenMenu(null); }}
                disabled={!isJudging}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass} ${
                  !isJudging ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Square className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>Dừng chấm</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F7</span>
              </button>

              <button
                onClick={() => { onRejudgeAll(); setOpenMenu(null); }}
                disabled={isJudging}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass} ${
                  isJudging ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-indigo-600" />
                  <span>Chấm lại toàn bộ</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+F9</span>
              </button>

              <div className="h-px bg-black/[0.06] my-1" />

              {onOpenSelectiveJudging && (
                <button
                  onClick={() => { onOpenSelectiveJudging(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Chấm có chọn lọc (Học sinh & Bài thi)...</span>
                </button>
              )}

              {onClearScores && (
                <button
                  onClick={() => { onClearScores(); setOpenMenu(null); }}
                  className={`w-full text-left px-3.5 py-1.5 flex items-center space-x-2 text-rose-600 ${itemHoverClass}`}
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Xóa toàn bộ điểm</span>
                </button>
              )}

              <div className="h-px bg-black/[0.06] my-1" />

              <button
                onClick={() => { onExportExcel(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold text-emerald-900">Xuất kết quả ra Excel</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Shift+F9</span>
              </button>

              <button
                onClick={() => { onExportTXT(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
              >
                <FileText className="w-4 h-4 text-neutral-500" />
                <span>Xuất kết quả ra Text (.txt)</span>
              </button>

              <button
                onClick={() => { onExportCSV(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span>Xuất kết quả ra CSV (.csv)</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Menu Thiết lập & Trợ giúp (H) */}
        <div className="relative">
          <button onClick={() => handleMenuClick('help')} className={menuBtnClass('help')}>
            Trợ giúp {isApple ? '' : '(H)'}
          </button>
          {openMenu === 'help' && (
            <div className={`${dropdownClass} w-64`}>
              <button
                onClick={() => { onShowDocs?.(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Hướng dẫn sử dụng Themis</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F1</span>
              </button>

              <button
                onClick={() => { onOpenSettings(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-neutral-600" />
                  <span>Thiết lập môi trường (F11)</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F11</span>
              </button>

              <div className="h-px bg-black/[0.06] my-1" />

              <button
                onClick={() => { onOpenAbout(); setOpenMenu(null); }}
                className={`w-full text-left px-3.5 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
              >
                <HelpCircle className="w-4 h-4 text-[#0078D7]" />
                <span>Thông tin về sản phẩm Themis...</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
