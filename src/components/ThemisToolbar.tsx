import React, { useState, useRef, useEffect } from 'react';
import { 
  Pause, Square, Download, FileText, 
  FileSpreadsheet, FileCode, ChevronDown, Filter, Settings, Play
} from 'lucide-react';
import { UITheme } from '../types';

interface ThemisToolbarProps {
  isJudging: boolean;
  isSelectiveJudging?: boolean;
  selectedSubmissionsCount?: number;
  theme?: UITheme;
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
  theme = 'apple',
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
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isApple = theme === 'apple';

  if (isApple) {
    return (
      <div className="bg-[#FBFBFD] px-3.5 py-1.5 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        {/* Left Toolbar Groups */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          {/* GROUP 1: KỲ THI */}
          <div className="bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-lg p-0.5 flex items-center space-x-0.5">
            <button
              onClick={onNewContest}
              title="Tạo kỳ thi mới (Ctrl+N)"
              className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-neutral-800 font-medium text-[11px]"
            >
              <img src="/icons/btnnewcontest.png" alt="Tạo kỳ thi" className="w-4 h-4 object-contain" />
              <span>Tạo mới</span>
            </button>
            <button
              onClick={onOpenZip}
              title="Mở gói kỳ thi (.contest, .themis, .zip) (Ctrl+O)"
              className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-neutral-800 font-medium text-[11px]"
            >
              <img src="/icons/btnopencontest.png" alt="Mở kỳ thi" className="w-4 h-4 object-contain" />
              <span>Mở đề</span>
            </button>
            {onSaveContestZip && (
              <button
                onClick={onSaveContestZip}
                title="Ghi kỳ thi ra file .contest chuẩn (Ctrl+S)"
                className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-[#0071E3] font-medium text-[11px]"
              >
                <img src="/icons/btnsavecontest.png" alt="Ghi kỳ thi" className="w-4 h-4 object-contain" />
                <span>Ghi đề</span>
              </button>
            )}
          </div>

          {/* GROUP 2: ĐỀ THI & TEST CASES */}
          <div className="bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-lg p-0.5 flex items-center space-x-0.5">
            <button
              onClick={onOpenTaskFolder}
              title="Nạp thư mục chứa các bài thi & bộ test (F2)"
              className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-neutral-800 font-medium text-[11px]"
            >
              <img src="/icons/btnrefreshtasks.png" alt="Nạp Đề" className="w-4 h-4 object-contain" />
              <span>Nạp Đề & Test</span>
            </button>
            <button
              onClick={onOpenTasksModal}
              title="Mở bảng danh sách bài thi và cấu hình từng bài (F6)"
              className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-neutral-800 font-medium text-[11px]"
            >
              <img src="/icons/btncompilerconfig.png" alt="Cấu hình Đề" className="w-4 h-4 object-contain" />
              <span>Cấu hình Đề</span>
            </button>
          </div>

          {/* GROUP 3: THÍ SINH & BÀI LÀM */}
          <div className="bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.03)] rounded-lg p-0.5 flex items-center space-x-0.5">
            <button
              onClick={onOpenSubmissionFolder}
              title="Nạp thư mục hoặc file ZIP chứa toàn bộ bài nộp của học sinh (F3)"
              className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-neutral-800 font-medium text-[11px]"
            >
              <img src="/icons/btnrefreshcontestants.png" alt="Nạp Bài thi" className="w-4 h-4 object-contain" />
              <span>Nạp Thí sinh</span>
            </button>
            {onAddSubmissions && (
              <button
                onClick={onAddSubmissions}
                title="Nạp file lẻ độc lập cho một hoặc nhiều thí sinh mà không ghi đè bài khác"
                className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-neutral-800 font-medium text-[11px]"
              >
                <img src="/icons/btnrefreshcontestants.png" alt="Nạp file lẻ" className="w-4 h-4 object-contain" />
                <span>Nạp file lẻ</span>
              </button>
            )}
            {onOpenStudentManager && (
              <button
                onClick={onOpenStudentManager}
                title="Quản lý danh sách học sinh: đổi tên, xóa, sửa mã nguồn"
                className="flex items-center space-x-1.5 px-2.5 py-1 hover:bg-neutral-100/80 active:bg-neutral-200/60 rounded-md transition-all text-neutral-800 font-medium text-[11px]"
              >
                <span>Quản lý HS</span>
              </button>
            )}
          </div>

          {/* GROUP 4: CHẤM BÀI (PRIMARY ACTION) */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onStartJudging}
              disabled={isJudging}
              title={isSelectiveJudging ? `Chấm có chọn lọc: ${selectedSubmissionsCount ?? 0} bài nộp (F9)` : 'Bắt đầu chấm bài (F9)'}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-[11px] shadow-sm transition-all active:scale-[0.98] ${
                isJudging
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
                  : isSelectiveJudging
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#0071E3] hover:bg-[#0077ED] text-white'
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
              title="Tạm dừng chấm (F6)"
              className={`p-1.5 rounded-lg border border-black/[0.08] shadow-sm transition-all active:scale-[0.98] ${
                !isJudging
                  ? 'bg-neutral-100 text-neutral-300 opacity-40 cursor-not-allowed'
                  : 'bg-white hover:bg-amber-50 text-amber-700'
              }`}
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Stop */}
            <button
              onClick={onStopJudging}
              disabled={!isJudging}
              title="Dừng chấm bài (F7)"
              className={`p-1.5 rounded-lg border border-black/[0.08] shadow-sm transition-all active:scale-[0.98] ${
                !isJudging
                  ? 'bg-neutral-100 text-neutral-300 opacity-40 cursor-not-allowed'
                  : 'bg-white hover:bg-rose-50 text-rose-600'
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Filter Toggle */}
            {onOpenSelectiveModal && (
              <button
                onClick={onOpenSelectiveModal}
                title="Tuỳ chọn chỉ chấm cho bài nào hoặc thí sinh nào"
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border transition-all text-[11px] font-medium shadow-sm ${
                  isSelectiveJudging
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-black/[0.08] text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Filter className={`w-3.5 h-3.5 ${isSelectiveJudging ? 'text-amber-600 fill-amber-600' : 'text-neutral-500'}`} />
                <span>Bộ lọc</span>
              </button>
            )}
          </div>

          {/* GROUP 5: BÁO CÁO & XUẤT EXCEL */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onExportExcel}
              title="Xuất bảng điểm ra Excel đầy đủ (Shift+F9)"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 rounded-lg text-[11px] font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Xuất Excel</span>
            </button>

            {/* Export Dropdown */}
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Các định dạng xuất khác"
                className="flex items-center space-x-1 px-2 py-1.5 bg-white hover:bg-neutral-50 border border-black/[0.08] rounded-lg text-neutral-700 shadow-sm transition-all active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showExportMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white/95 backdrop-blur-2xl border border-black/10 shadow-2xl rounded-xl p-1 text-xs text-neutral-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => { onExportCSV(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0071E3] hover:text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Xuất CSV (KetQua.csv)</span>
                  </button>
                  <button
                    onClick={() => { onExportTXT(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0071E3] hover:text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <span>Xuất Text (.txt căn lề)</span>
                  </button>
                  <div className="h-px bg-black/[0.06] my-1" />
                  <button
                    onClick={() => { onExportJSON(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#0071E3] hover:text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    <span>Xuất Gói Kỳ Thi (.themis)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Tool Group: Settings */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSettingsModal}
            title="Mở thiết lập môi trường & bộ dịch (F11)"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-black/[0.08] text-neutral-700 rounded-lg shadow-sm transition-all text-[11px] font-medium active:scale-[0.98]"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-600" />
            <span>Thiết lập</span>
          </button>
        </div>
      </div>
    );
  }

  // Classic 200x Delphi Windows Mode
  return (
    <div className="bg-gradient-to-b from-[#FAF9F5] via-[#EFECE1] to-[#E3DFCE] px-2 py-1 border-b border-[#919B9C] flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#1E1E1E] select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      {/* Primary Toolbar Action Groups */}
      <div className="flex items-center space-x-1 flex-wrap gap-y-1">
        
        {/* GROUP 1: KỲ THI (CONTEST FILE) */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={onNewContest}
            title="Tạo kỳ thi mới (Ctrl+N)"
            className="flex items-center space-x-1.5 px-2 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
          >
            <img src="/icons/btnnewcontest.png" alt="Tạo kỳ thi" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-slate-900">Tạo mới</span>
          </button>

          <button
            onClick={onOpenZip}
            title="Mở gói kỳ thi (.contest, .themis, .zip) (Ctrl+O)"
            className="flex items-center space-x-1.5 px-2 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
          >
            <img src="/icons/btnopencontest.png" alt="Mở kỳ thi" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-slate-900">Mở đề</span>
          </button>

          {onSaveContestZip && (
            <button
              onClick={onSaveContestZip}
              title="Ghi kỳ thi ra file .contest chuẩn (Ctrl+S)"
              className="flex items-center space-x-1.5 px-2 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
            >
              <img src="/icons/btnsavecontest.png" alt="Ghi kỳ thi" className="w-5 h-5 object-contain" />
              <span className="font-semibold text-blue-900">Ghi (.contest)</span>
            </button>
          )}
        </div>

        {/* Separator 3D Groove */}
        <div className="h-6 w-[2px] border-l border-[#808080] border-r border-white mx-1" />

        {/* GROUP 2: ĐỀ THI & TEST CASES (TASKS) */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={onOpenTaskFolder}
            title="Nạp thư mục chứa các bài thi & bộ test (F2)"
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
          >
            <img src="/icons/btnrefreshtasks.png" alt="Nạp Đề & Test" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-slate-900">Nạp Đề & Test</span>
          </button>

          <button
            onClick={onOpenTasksModal}
            title="Mở bảng danh sách bài thi và cấu hình từng bài (F6)"
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
          >
            <img src="/icons/btncompilerconfig.png" alt="Cấu hình Đề" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-slate-900">Cấu hình Đề</span>
          </button>
        </div>

        {/* Separator 3D Groove */}
        <div className="h-6 w-[2px] border-l border-[#808080] border-r border-white mx-1" />

        {/* GROUP 3: THÍ SINH & BÀI LÀM (CONTESTANTS & SUBMISSIONS) */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={onOpenSubmissionFolder}
            title="Nạp thư mục hoặc file ZIP chứa toàn bộ bài nộp của học sinh (F3)"
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
          >
            <img src="/icons/btnrefreshcontestants.png" alt="Nạp Bài thi" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-slate-900">Nạp Thí sinh</span>
          </button>

          {onAddSubmissions && (
            <button
              onClick={onAddSubmissions}
              title="Nạp file lẻ độc lập cho một hoặc nhiều thí sinh mà không ghi đè bài khác"
              className="flex items-center space-x-1.5 px-2 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
            >
              <img src="/icons/btnrefreshcontestants.png" alt="Nạp file lẻ" className="w-5 h-5 object-contain" />
              <span className="font-semibold text-indigo-900">Nạp file lẻ</span>
            </button>
          )}

          {onOpenStudentManager && (
            <button
              onClick={onOpenStudentManager}
              title="Quản lý danh sách học sinh: đổi tên, xóa, sửa mã nguồn"
              className="flex items-center space-x-1.5 px-2 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
            >
              <img src="/icons/btnrefreshcontestants.png" alt="Quản lý HS" className="w-5 h-5 object-contain" />
              <span className="font-semibold text-slate-900">Quản lý HS</span>
            </button>
          )}
        </div>

        {/* Separator 3D Groove */}
        <div className="h-6 w-[2px] border-l border-[#808080] border-r border-white mx-1" />

        {/* GROUP 4: CHẤM BÀI (JUDGE ENGINE) */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={onStartJudging}
            disabled={isJudging}
            title={isSelectiveJudging ? `Chấm có chọn lọc: ${selectedSubmissionsCount ?? 0} bài nộp (F9)` : 'Bắt đầu chấm bài (F9)'}
            className={`flex items-center space-x-2 px-3 py-1 rounded-none font-bold border-t border-l border-white border-b border-r border-[#808080] shadow-[1px_1px_0_#404040] transition active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white active:translate-y-px ${
              isJudging
                ? 'bg-[#ECE9D8] text-slate-400 cursor-not-allowed opacity-60'
                : isSelectiveJudging
                ? 'bg-[#FFF8E7] hover:bg-[#FFEFC4] text-amber-900'
                : 'bg-[#EBF7EB] hover:bg-[#DCF3DC] text-[#006600]'
            }`}
          >
            <img src="/icons/btnjudge.png" alt="Chấm bài" className={`w-5 h-5 object-contain ${isJudging ? 'animate-spin' : ''}`} />
            {isSelectiveJudging ? (
              <span>Chấm chọn lọc ({selectedSubmissionsCount ?? 0}) (F9)</span>
            ) : (
              <span>Chấm bài (F9)</span>
            )}
          </button>

          {/* Pause */}
          <button
            onClick={onPauseJudging}
            disabled={!isJudging}
            title="Tạm dừng chấm (F6)"
            className={`p-1.5 rounded-none border-t border-l border-white border-b border-r border-[#808080] shadow-[1px_1px_0_#404040] transition active:translate-y-px ${
              !isJudging
                ? 'bg-[#ECE9D8] text-slate-300 opacity-50 cursor-not-allowed'
                : 'bg-[#ECE9D8] hover:bg-[#FFF8E7] text-amber-700 active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white'
            }`}
          >
            <Pause className="w-4 h-4 fill-amber-600 text-amber-700" />
          </button>

          {/* Stop */}
          <button
            onClick={onStopJudging}
            disabled={!isJudging}
            title="Dừng chấm bài (F7)"
            className={`p-1.5 rounded-none border-t border-l border-white border-b border-r border-[#808080] shadow-[1px_1px_0_#404040] transition active:translate-y-px ${
              !isJudging
                ? 'bg-[#ECE9D8] text-slate-300 opacity-50 cursor-not-allowed'
                : 'bg-[#ECE9D8] hover:bg-[#FFF5F5] text-rose-700 active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white'
            }`}
          >
            <Square className="w-4 h-4 fill-rose-600 text-rose-700" />
          </button>

          {/* Selective modal */}
          {onOpenSelectiveModal && (
            <button
              onClick={onOpenSelectiveModal}
              title="Tuỳ chọn chỉ chấm cho bài nào hoặc thí sinh nào"
              className={`flex items-center space-x-1 px-2 py-1 rounded-none border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] active:translate-y-px transition ${
                isSelectiveJudging
                  ? 'bg-[#FFF8E7] text-amber-900 font-bold'
                  : 'bg-[#ECE9D8] hover:bg-[#F5F4EB] text-slate-900 font-semibold'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${isSelectiveJudging ? 'text-amber-700 fill-amber-700' : 'text-blue-700'}`} />
              <span>Bộ lọc</span>
            </button>
          )}
        </div>

        {/* Separator 3D Groove */}
        <div className="h-6 w-[2px] border-l border-[#808080] border-r border-white mx-1" />

        {/* GROUP 5: BÁO CÁO & XUẤT KẾT QUẢ (EXPORT) */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={onExportExcel}
            title="Xuất bảng điểm ra Excel đầy đủ 2 trang tính Tổng hợp và Chi tiết (Shift+F9)"
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] rounded-none active:translate-y-px transition"
          >
            <img src="/icons/btnexport.png" alt="Xuất Excel" className="w-5 h-5 object-contain" />
            <span className="font-bold text-[#1B5E20]">Xuất Excel</span>
          </button>

          {/* Export Dropdown for CSV / TXT / JSON */}
          <div ref={exportMenuRef} className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Các định dạng xuất khác (CSV, TXT, JSON)"
              className="flex items-center space-x-1 px-2 py-1.5 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-800 rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <ChevronDown className="w-3 h-3 text-slate-600" />
            </button>

            {showExportMenu && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#FFFFFF] border border-[#7A7A7A] shadow-xl py-1 text-xs text-black z-50 rounded-none">
                <button
                  onClick={() => {
                    onExportCSV();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất CSV (KetQua.csv)</span>
                </button>
                <button
                  onClick={() => {
                    onExportTXT();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Xuất Text (.txt căn lề)</span>
                </button>
                <div className="h-px bg-[#D0D0D0] my-1" />
                <button
                  onClick={() => {
                    onExportJSON();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#B6BDD2] flex items-center space-x-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Xuất Gói Kỳ Thi (.themis / JSON)</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Tool Group: Settings */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenSettingsModal}
          title="Mở thiết lập môi trường & bộ dịch (F11)"
          className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px"
        >
          <img src="/icons/btnsettings.png" alt="Thiết lập" className="w-5 h-5 object-contain" />
          <span className="font-semibold text-slate-900">Thiết lập</span>
        </button>
      </div>
    </div>
  );
};
