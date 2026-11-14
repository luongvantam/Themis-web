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
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div ref={menuRef} className="bg-[#ECE9D8] text-[#1E1E1E] select-none text-[12px] border-b border-[#D8D8D8] relative z-50">
      <div className="flex items-center px-1">
        {/* 1. Menu Kỳ thi (F) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('contest')}
            className={`px-3 py-1 hover:bg-[#B6BDD2] hover:text-[#000000] border border-transparent hover:border-[#0A246A] rounded-none transition ${
              openMenu === 'contest' ? 'bg-[#B6BDD2] border-[#0A246A] text-black' : ''
            }`}
          >
            Kỳ thi (<u>F</u>)
          </button>
          {openMenu === 'contest' && (
            <div className="absolute left-0 top-full w-72 bg-[#FFFFFF] border border-[#7A7A7A] shadow-xl py-1 text-[12px] text-black rounded-none">
              <button
                onClick={() => { onNewContest(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <FolderPlus className="w-3.5 h-3.5 text-[#0078D7]" />
                  <span>Tạo kỳ thi mới...</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+N</span>
              </button>

              <button
                onClick={() => { onOpenZip(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <FolderArchive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mở kỳ thi (.contest, .themis)...</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+O</span>
              </button>

              <button
                onClick={() => { if (onSaveContestZip) onSaveContestZip(); else onSaveContest(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Save className="w-3.5 h-3.5 text-blue-700" />
                  <span className="font-semibold text-blue-900">Ghi kỳ thi (.contest)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+S</span>
              </button>

              <button
                onClick={() => { onSaveContest(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lưu gói dạng JSON (.themis)</span>
                </span>
              </button>

              <div className="h-px bg-[#D0D0D0] my-1" />

              <button
                onClick={() => { onOpenSettings(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cấu hình bộ dịch & Compiler...</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F10</span>
              </button>

              <button
                onClick={() => { onOpenSettings(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Settings className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Các thiết lập môi trường...</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F11</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Menu Bài thi (E) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('exams')}
            className={`px-3 py-1 hover:bg-[#B6BDD2] hover:text-[#000000] border border-transparent hover:border-[#0A246A] rounded-none transition ${
              openMenu === 'exams' ? 'bg-[#B6BDD2] border-[#0A246A] text-black' : ''
            }`}
          >
            Bài thi (<u>E</u>)
          </button>
          {openMenu === 'exams' && (
            <div className="absolute left-0 top-full w-72 bg-[#FFFFFF] border border-[#7A7A7A] shadow-xl py-1 text-[12px] text-black rounded-none">
              <button
                onClick={() => { onOpenTaskFolder(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-[#005A9E]">Nạp danh sách bài thi (Folder)...</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F2</span>
              </button>

              <button
                onClick={() => { onOpenTasksConfig(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cấu hình bài thi & Điểm số...</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F6</span>
              </button>

              <div className="h-px bg-[#D0D0D0] my-1" />

              <button
                onClick={() => { onSelectAllTasks?.(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chọn tất cả bài thi</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+Shift+A</span>
              </button>

              <button
                onClick={() => { onDeselectAllTasks?.(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <EmptySquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bỏ chọn tất cả bài thi</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+Shift+D</span>
              </button>

              <button
                onClick={() => { onInvertTasks?.(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Filter className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chọn / Bỏ chọn bài thi</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+Shift+I</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Menu Thí sinh (C) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('contestants')}
            className={`px-3 py-1 hover:bg-[#B6BDD2] hover:text-[#000000] border border-transparent hover:border-[#0A246A] rounded-none transition ${
              openMenu === 'contestants' ? 'bg-[#B6BDD2] border-[#0A246A] text-black' : ''
            }`}
          >
            Thí sinh (<u>C</u>)
          </button>
          {openMenu === 'contestants' && (
            <div className="absolute left-0 top-full w-72 bg-[#FFFFFF] border border-[#7A7A7A] shadow-xl py-1 text-[12px] text-black rounded-none">
              <button
                onClick={() => { onOpenSubmissionFolder(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-[#0078D7]" />
                  <span className="font-semibold text-[#003366]">Nạp danh sách thí sinh (Folder)...</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F3</span>
              </button>

              {onOpenStudentManager && (
                <button
                  onClick={() => { onOpenStudentManager(); setOpenMenu(null); }}
                  className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Quản lý học sinh (Sửa code, Đổi tên, Xóa)...</span>
                </button>
              )}

              <button
                onClick={() => { onAddSubmissions(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Nạp thêm tệp bài nộp lẻ (.cpp, .pas)...</span>
              </button>

              <div className="h-px bg-[#D0D0D0] my-1" />

              <button
                onClick={() => { onSelectAllStudents?.(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chọn tất cả thí sinh</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+A</span>
              </button>

              <button
                onClick={() => { onDeselectAllStudents?.(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <EmptySquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bỏ chọn tất cả thí sinh</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+D</span>
              </button>

              <button
                onClick={() => { onInvertStudents?.(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <Filter className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chọn / Bỏ chọn thí sinh</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+I</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Menu Chấm bài (J) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('judge')}
            className={`px-3 py-1 hover:bg-[#B6BDD2] hover:text-[#000000] border border-transparent hover:border-[#0A246A] rounded-none transition ${
              openMenu === 'judge' ? 'bg-[#B6BDD2] border-[#0A246A] text-black' : ''
            }`}
          >
            Chấm bài (<u>J</u>)
          </button>
          {openMenu === 'judge' && (
            <div className="absolute left-0 top-full w-72 bg-[#FFFFFF] border border-[#7A7A7A] shadow-xl py-1 text-[12px] text-black rounded-none">
              <button
                onClick={() => { onStartJudging(); setOpenMenu(null); }}
                disabled={isJudging}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between disabled:opacity-50"
              >
                <span className="flex items-center space-x-2">
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span className="font-semibold text-emerald-800">Chấm bài</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F9</span>
              </button>

              <button
                onClick={() => { onPauseJudging(); setOpenMenu(null); }}
                disabled={!isJudging}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between disabled:opacity-50"
              >
                <span className="flex items-center space-x-2">
                  <Pause className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tạm dừng</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F6</span>
              </button>

              <button
                onClick={() => { onStopJudging(); setOpenMenu(null); }}
                disabled={!isJudging}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between disabled:opacity-50"
              >
                <span className="flex items-center space-x-2">
                  <Square className="w-3.5 h-3.5 text-rose-600 fill-current" />
                  <span>Dừng chấm</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F7</span>
              </button>

              <button
                onClick={() => { onRejudgeAll(); setOpenMenu(null); }}
                disabled={isJudging}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between disabled:opacity-50"
              >
                <span className="flex items-center space-x-2">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chấm lại toàn bộ</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Ctrl+F9</span>
              </button>

              <div className="h-px bg-[#D0D0D0] my-1" />

              {onOpenSelectiveJudging && (
                <button
                  onClick={() => { onOpenSelectiveJudging(); setOpenMenu(null); }}
                  className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
                >
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chấm có chọn lọc (Học sinh & Bài thi)...</span>
                </button>
              )}

              {onClearScores && (
                <button
                  onClick={() => { onClearScores(); setOpenMenu(null); }}
                  className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2 text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa toàn bộ điểm</span>
                </button>
              )}

              <div className="h-px bg-[#D0D0D0] my-1" />

              <button
                onClick={() => { onExportExcel(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-semibold text-emerald-900">Xuất kết quả ra Excel</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Shift+F9</span>
              </button>

              <button
                onClick={() => { onExportTXT(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Xuất kết quả ra Text (.txt)</span>
              </button>

              <button
                onClick={() => { onExportCSV(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                <span>Xuất kết quả ra CSV (.csv)</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Menu Trợ giúp (H) */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-3 py-1 hover:bg-[#B6BDD2] hover:text-[#000000] border border-transparent hover:border-[#0A246A] rounded-none transition ${
              openMenu === 'help' ? 'bg-[#B6BDD2] border-[#0A246A] text-black' : ''
            }`}
          >
            Trợ giúp (<u>H</u>)
          </button>
          {openMenu === 'help' && (
            <div className="absolute left-0 top-full w-64 bg-[#FFFFFF] border border-[#7A7A7A] shadow-xl py-1 text-[12px] text-black rounded-none">
              <button
                onClick={() => { onShowDocs?.(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hướng dẫn sử dụng Themis</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">F1</span>
              </button>

              <div className="h-px bg-[#D0D0D0] my-1" />

              <button
                onClick={() => { onOpenAbout(); setOpenMenu(null); }}
                className="w-full text-left px-4 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#0078D7]" />
                <span>Thông tin về sản phẩm Themis...</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
