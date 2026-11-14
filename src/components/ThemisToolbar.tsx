import React, { useState, useRef, useEffect } from 'react';
import { 
  Pause, Square, Download, FileText, 
  FileSpreadsheet, ChevronDown, Filter, Settings, Play,
  FolderOpen, FolderArchive, Users, Plus, Upload
} from 'lucide-react';

interface ThemisToolbarProps {
  isJudging: boolean;
  isSelectiveJudging?: boolean;
  selectedSubmissionsCount?: number;
  onOpenSelectiveModal?: () => void;
  onStartJudging: () => void;
  onPauseJudging: () => void;
  onStopJudging: () => void;
  onOpenTaskFolder: () => void;
  onOpenZip: () => void;
  onOpenSubmissionFolder: () => void;
  onAddSubmissions?: () => void;
  onOpenTasksModal: () => void;
  onOpenStudentManager?: () => void;
  onOpenSettingsModal: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportTXT: () => void;
  onExportJSON: () => void;
  onNewContest: () => void;
  onSaveContestZip?: () => void;
}

export const ThemisToolbar: React.FC<ThemisToolbarProps> = ({
  isJudging,
  isSelectiveJudging,
  selectedSubmissionsCount,
  onOpenSelectiveModal,
  onStartJudging,
  onPauseJudging,
  onStopJudging,
  onOpenTaskFolder,
  onOpenZip,
  onOpenSubmissionFolder,
  onAddSubmissions,
  onOpenTasksModal,
  onOpenStudentManager,
  onOpenSettingsModal,
  onExportCSV,
  onExportExcel,
  onExportTXT,
  onExportJSON,
  onNewContest,
  onSaveContestZip,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-neutral-100/60 dark:bg-[#141417]/60 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none transition-colors">
      <div className="flex items-center space-x-2">
        {/* GROUP 1: KỲ THI */}
        <div className="bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl p-0.5 flex items-center space-x-0.5">
          <button
            onClick={onNewContest}
            title="Tạo mới một kỳ thi trống (Ctrl+N)"
            className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>Kỳ thi mới</span>
          </button>
          <button
            onClick={onOpenZip}
            title="Mở gói kỳ thi có sẵn: .themis hoặc file zip đề thi (Ctrl+O)"
            className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Mở kỳ thi</span>
          </button>
          <button
            onClick={onExportJSON}
            title="Lưu toàn bộ đề thi, test cases & kết quả nộp bài ra file .themis (Ctrl+S)"
            className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Lưu .themis</span>
          </button>
          {onSaveContestZip && (
            <button
              onClick={onSaveContestZip}
              title="Xuất file nén chuẩn gói kỳ thi Themis"
              className="flex items-center space-x-1.5 px-2 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-700 dark:text-neutral-300 font-medium text-[11px]"
            >
              <span>Ghi đề</span>
            </button>
          )}
        </div>

        {/* GROUP 2: ĐỀ THI & TEST CASES */}
        <div className="bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl p-0.5 flex items-center space-x-0.5">
          <button
            onClick={onOpenTaskFolder}
            title="Nạp thư mục chứa các bài thi & bộ test (F2)"
            className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Nạp Đề & Test</span>
          </button>
          <button
            onClick={onOpenTasksModal}
            title="Mở bảng danh sách bài thi và cấu hình từng bài (F4)"
            className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cấu hình Đề</span>
          </button>
        </div>

        {/* GROUP 3: THÍ SINH & BÀI LÀM */}
        <div className="bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-xl p-0.5 flex items-center space-x-0.5">
          <button
            onClick={onOpenSubmissionFolder}
            title="Nạp thư mục chứa toàn bộ bài nộp của học sinh (F3)"
            className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Nạp Thí sinh</span>
          </button>
          {onAddSubmissions && (
            <button
              onClick={onAddSubmissions}
              title="Nạp file lẻ (.cpp, .pas, .py, .java, .c, .zip) bổ sung cho thí sinh"
              className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
            >
              <Upload className="w-3.5 h-3.5 text-teal-500" />
              <span>Nạp file lẻ</span>
            </button>
          )}
          {onOpenStudentManager && (
            <button
              onClick={onOpenStudentManager}
              title="Quản lý danh sách học sinh: đổi tên, xóa, sửa mã nguồn (F6)"
              className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/[0.08] active:scale-[0.98] rounded-lg transition-all text-neutral-800 dark:text-neutral-200 font-medium text-[11px]"
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Quản lý HS</span>
            </button>
          )}
        </div>

        {/* GROUP 4: CHẤM BÀI (PRIMARY ACTION) */}
        <div className="flex items-center space-x-1.5 pl-1">
          <button
            onClick={onStartJudging}
            disabled={isJudging}
            title={isSelectiveJudging ? `Chấm có chọn lọc: ${selectedSubmissionsCount ?? 0} bài nộp (F9)` : 'Bắt đầu chấm bài (F9)'}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl font-semibold text-[11px] shadow-sm transition-all active:scale-[0.98] ${
              isJudging
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed opacity-60'
                : isSelectiveJudging
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-blue-500/20'
            }`}
          >
            {isJudging ? (
              <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>
              {isSelectiveJudging ? `Chấm chọn lọc (${selectedSubmissionsCount ?? 0})` : 'Chấm bài (F9)'}
            </span>
          </button>

          {/* Pause */}
          <button
            onClick={onPauseJudging}
            disabled={!isJudging}
            title="Tạm dừng chấm"
            className={`p-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-sm transition-all active:scale-[0.98] ${
              !isJudging
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 opacity-40 cursor-not-allowed'
                : 'bg-white dark:bg-[#1E1E22] hover:bg-amber-50 text-amber-600'
            }`}
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Stop */}
          <button
            onClick={onStopJudging}
            disabled={!isJudging}
            title="Dừng chấm bài"
            className={`p-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-sm transition-all active:scale-[0.98] ${
              !isJudging
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 opacity-40 cursor-not-allowed'
                : 'bg-white dark:bg-[#1E1E22] hover:bg-rose-50 text-rose-600'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Filter Toggle */}
          {onOpenSelectiveModal && (
            <button
              onClick={onOpenSelectiveModal}
              title="Tuỳ chọn chỉ chấm cho bài nào hoặc thí sinh nào (F7)"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-[11px] font-medium shadow-sm active:scale-[0.98] ${
                isSelectiveJudging
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-[#1E1E22] border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/[0.06]'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${isSelectiveJudging ? 'text-amber-600 fill-amber-600' : 'text-neutral-500'}`} />
              <span>Bộ lọc</span>
            </button>
          )}
        </div>

        {/* GROUP 5: BÁO CÁO & XUẤT EXCEL */}
        <div className="flex items-center space-x-1 pl-1">
          <button
            onClick={onExportExcel}
            title="Xuất bảng điểm ra file Excel (.xls) đầy đủ định dạng (F11)"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50 rounded-xl text-[11px] font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Xuất Excel</span>
          </button>

          {/* Export Dropdown */}
          <div ref={exportMenuRef} className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Các định dạng xuất khác"
              className="flex items-center space-x-1 px-2 py-1.5 bg-white dark:bg-[#1E1E22] hover:bg-neutral-50 dark:hover:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-neutral-700 dark:text-neutral-300 shadow-sm transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 shadow-2xl rounded-xl p-1.5 text-xs text-neutral-800 dark:text-neutral-100 z-50">
                <button
                  onClick={() => { onExportCSV(); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#0071E3] hover:text-white rounded-lg transition-colors group"
                >
                  <span className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500 group-hover:text-white" />
                    <span>Xuất bảng điểm CSV (.csv)</span>
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">F12</span>
                </button>
                <button
                  onClick={() => { onExportTXT(); setShowExportMenu(false); }}
                  className="w-full text-left px-3 py-1.5 flex items-center space-x-2 hover:bg-[#0071E3] hover:text-white rounded-lg transition-colors group"
                >
                  <FileText className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                  <span>Xuất bảng điểm TXT (.txt)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Tools: Settings */}
      <div className="flex items-center">
        <button
          onClick={onOpenSettingsModal}
          title="Cấu hình hệ thống & máy chủ chấm bài Judge0"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1E1E22] hover:bg-neutral-50 dark:hover:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-neutral-700 dark:text-neutral-300 font-medium text-[11px] shadow-sm transition-all active:scale-[0.98]"
        >
          <Settings className="w-3.5 h-3.5 text-neutral-500" />
          <span>Cấu hình</span>
        </button>
      </div>
    </div>
  );
};
