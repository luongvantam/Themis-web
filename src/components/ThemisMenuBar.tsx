import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderOpen, Save, Play, Pause, Square, RotateCcw, 
  Settings, HelpCircle, FileText, FolderPlus, FolderArchive, Users, Upload,
  FileSpreadsheet, Filter, CheckSquare, Square as EmptySquare, Trash2
} from 'lucide-react';

export interface ThemisMenuBarProps {
  contestTitle: string;
  isJudging: boolean;
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleMouseEnter = (menuName: string) => {
    if (openMenu !== null) {
      setOpenMenu(menuName);
    }
  };

  const menuBtnClass = (menuName: string) =>
    `px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
      openMenu === menuName
        ? 'bg-black/[0.08] dark:bg-white/[0.12] text-neutral-900 dark:text-white'
        : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
    }`;

  const dropdownClass =
    'absolute left-0 top-full mt-1 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 shadow-2xl rounded-xl p-1.5 text-[12px] text-neutral-800 dark:text-neutral-100 z-50';

  const itemHoverClass =
    'hover:bg-[#0071E3] hover:text-white rounded-lg transition-colors group';

  return (
    <nav
      ref={menuRef}
      className="bg-white/70 dark:bg-[#18181B]/70 backdrop-blur-md text-neutral-800 dark:text-neutral-200 select-none text-[12px] font-medium border-b border-black/[0.06] dark:border-white/[0.08] relative z-40 px-2 py-0.5 transition-colors"
    >
      <div className="flex items-center space-x-0.5">
        {/* 1. Menu Kỳ thi */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('contest')}
            onMouseEnter={() => handleMouseEnter('contest')}
            className={menuBtnClass('contest')}
          >
            Kỳ thi
          </button>
          {openMenu === 'contest' && (
            <div className={`${dropdownClass} w-72`}>
              <button
                onClick={() => { onNewContest(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FolderPlus className="w-4 h-4 text-blue-500 group-hover:text-white" />
                  <span>Tạo kỳ thi mới...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+N</span>
              </button>

              <button
                onClick={() => { onOpenZip(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FolderArchive className="w-4 h-4 text-amber-500 group-hover:text-white" />
                  <span>Mở kỳ thi (.contest, .themis)...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+O</span>
              </button>

              <button
                onClick={() => { onOpenTaskFolder(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                  <span>Nạp thư mục Đề & Test...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F2</span>
              </button>

              <button
                onClick={() => { onOpenSubmissionFolder(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-500 group-hover:text-white" />
                  <span>Nạp thư mục bài làm Học sinh...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F3</span>
              </button>

              <button
                onClick={() => { onAddSubmissions(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-teal-500 group-hover:text-white" />
                  <span>Nạp file lẻ (bổ sung/cập nhật)...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Shift+F3</span>
              </button>

              <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-1" />

              <button
                onClick={() => { onSaveContest(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Save className="w-4 h-4 text-blue-500 group-hover:text-white" />
                  <span>Lưu trạng thái kỳ thi</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+S</span>
              </button>

              {onSaveContestZip && (
                <button
                  onClick={() => { onSaveContestZip(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <FolderArchive className="w-4 h-4 text-violet-500 group-hover:text-white" />
                    <span>Xuất gói kỳ thi (.themis)</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">Ctrl+Shift+S</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Menu Chấm bài */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('judge')}
            onMouseEnter={() => handleMouseEnter('judge')}
            className={menuBtnClass('judge')}
          >
            Chấm bài
          </button>
          {openMenu === 'judge' && (
            <div className={`${dropdownClass} w-64`}>
              <button
                onClick={() => { onStartJudging(); setOpenMenu(null); }}
                disabled={isJudging}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  isJudging ? 'opacity-40 cursor-not-allowed' : itemHoverClass
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-emerald-500 group-hover:text-white fill-emerald-500 group-hover:fill-white" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-white">Bắt đầu chấm</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F9</span>
              </button>

              <button
                onClick={() => { onPauseJudging(); setOpenMenu(null); }}
                disabled={!isJudging}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  !isJudging ? 'opacity-40 cursor-not-allowed' : itemHoverClass
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Pause className="w-4 h-4 text-amber-500 group-hover:text-white" />
                  <span>Tạm dừng</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Pause</span>
              </button>

              <button
                onClick={() => { onStopJudging(); setOpenMenu(null); }}
                disabled={!isJudging}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                  !isJudging ? 'opacity-40 cursor-not-allowed' : itemHoverClass
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Square className="w-4 h-4 text-rose-500 group-hover:text-white" />
                  <span>Dừng chấm</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Escape</span>
              </button>

              <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-1" />

              <button
                onClick={() => { onRejudgeAll(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-blue-500 group-hover:text-white" />
                  <span>Chấm lại toàn bộ</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Shift+F9</span>
              </button>

              {onClearScores && (
                <button
                  onClick={() => { onClearScores(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4 text-rose-500 group-hover:text-white" />
                    <span className="text-rose-600 dark:text-rose-400 group-hover:text-white">Xoá toàn bộ điểm</span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Menu Quản lý */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('manage')}
            onMouseEnter={() => handleMouseEnter('manage')}
            className={menuBtnClass('manage')}
          >
            Quản lý
          </button>
          {openMenu === 'manage' && (
            <div className={`${dropdownClass} w-64`}>
              <button
                onClick={() => { onOpenTasksConfig(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-500 group-hover:text-white" />
                  <span>Danh sách Đề thi & Test cases...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F4</span>
              </button>

              {onOpenStudentManager && (
                <button
                  onClick={() => { onOpenStudentManager(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500 group-hover:text-white" />
                    <span>Danh sách Thí sinh...</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">F6</span>
                </button>
              )}

              {onOpenSelectiveJudging && (
                <button
                  onClick={() => { onOpenSelectiveJudging(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-amber-500 group-hover:text-white" />
                    <span>Chọn lọc bài thi & thí sinh cần chấm...</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">F7</span>
                </button>
              )}

              <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-1" />

              {onSelectAllTasks && (
                <button
                  onClick={() => { onSelectAllTasks(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <CheckSquare className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                  <span>Đánh dấu chọn tất cả bài thi</span>
                </button>
              )}

              {onDeselectAllTasks && (
                <button
                  onClick={() => { onDeselectAllTasks(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <EmptySquare className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                  <span>Bỏ chọn tất cả bài thi</span>
                </button>
              )}

              {onInvertTasks && (
                <button
                  onClick={() => { onInvertTasks(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <RotateCcw className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                  <span>Đảo dấu chọn bài thi</span>
                </button>
              )}

              <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-1" />

              {onSelectAllStudents && (
                <button
                  onClick={() => { onSelectAllStudents(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <CheckSquare className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                  <span>Đánh dấu chọn tất cả thí sinh</span>
                </button>
              )}

              {onDeselectAllStudents && (
                <button
                  onClick={() => { onDeselectAllStudents(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <EmptySquare className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                  <span>Bỏ chọn tất cả thí sinh</span>
                </button>
              )}

              {onInvertStudents && (
                <button
                  onClick={() => { onInvertStudents(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
                >
                  <RotateCcw className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                  <span>Đảo dấu chọn thí sinh</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Menu Kết quả & Báo cáo */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('export')}
            onMouseEnter={() => handleMouseEnter('export')}
            className={menuBtnClass('export')}
          >
            Kết quả
          </button>
          {openMenu === 'export' && (
            <div className={`${dropdownClass} w-60`}>
              <button
                onClick={() => { onExportExcel(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                  <span>Xuất bảng điểm Excel (.xls)</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F11</span>
              </button>

              <button
                onClick={() => { onExportCSV(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-500 group-hover:text-white" />
                  <span>Xuất bảng điểm CSV (.csv)</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">F12</span>
              </button>

              <button
                onClick={() => { onExportTXT(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                  <span>Xuất bảng điểm Text (.txt)</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Menu Cấu hình & Trợ giúp */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            onMouseEnter={() => handleMouseEnter('help')}
            className={menuBtnClass('help')}
          >
            Trợ giúp
          </button>
          {openMenu === 'help' && (
            <div className={`${dropdownClass} w-56`}>
              {onShowDocs && (
                <button
                  onClick={() => { onShowDocs(); setOpenMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-blue-500 group-hover:text-white" />
                    <span>Hướng dẫn sử dụng</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">F1</span>
                </button>
              )}

              <button
                onClick={() => { onOpenSettings(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${itemHoverClass}`}
              >
                <span className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-neutral-500 group-hover:text-white" />
                  <span>Cấu hình máy chủ chấm...</span>
                </span>
                <span className="text-[11px] opacity-60 font-mono">Ctrl+,</span>
              </button>

              <div className="h-px bg-black/[0.06] dark:bg-white/[0.08] my-1" />

              <button
                onClick={() => { onOpenAbout(); setOpenMenu(null); }}
                className={`w-full text-left px-3 py-1.5 flex items-center space-x-2 ${itemHoverClass}`}
              >
                <HelpCircle className="w-4 h-4 text-amber-500 group-hover:text-white" />
                <span>Giới thiệu Themis Web</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
