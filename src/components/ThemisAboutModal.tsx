import React from 'react';
import { Heart, Globe, GitBranch, X } from 'lucide-react';
import { UITheme } from '../types';

interface ThemisAboutModalProps {
  isOpen: boolean;
  theme?: UITheme;
  onClose: () => void;
}

export const ThemisAboutModal: React.FC<ThemisAboutModalProps> = ({
  isOpen,
  theme = 'apple',
  onClose,
}) => {
  if (!isOpen) return null;

  if (theme === 'apple') {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-md w-full flex flex-col overflow-hidden text-neutral-800 dark:text-neutral-100 font-sans">
          {/* Header */}
          <div className="relative pt-6 pb-4 px-6 flex flex-col items-center border-b border-black/[0.06] dark:border-white/[0.08]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-[#1E1E22] rounded-[14px] flex items-center justify-center overflow-hidden">
                <img
                  src="/icons/btnjudge.png"
                  alt="Themis Scale Icon"
                  className="w-11 h-11 object-contain filter drop-shadow"
                />
              </div>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Themis Web
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              Hệ thống chấm thi lập trình tự động trên nền tảng Web
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 text-xs">
            <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl border border-black/[0.04] space-y-1">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Tác giả phần mềm Themis nguyên bản
              </span>
              <p className="font-semibold text-neutral-900 dark:text-white text-[13px]">
                Thầy Lê Minh Hoàng &bull; Thầy Đỗ Đức Đông
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Đại học Sư phạm Hà Nội & Đại học Công nghệ - ĐHQGHN
              </p>
            </div>

            <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl border border-black/[0.04] space-y-2">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Người viết lại cho bản Web
                </span>
                <p className="font-semibold text-neutral-900 dark:text-white text-[13px]">
                  Lương Văn Tâm (THPT Trần Phú - Quảng Ninh)
                </p>
              </div>

              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1.5 text-[11px]">
                <a
                  href="https://themis-tranphuquangninh.pages.dev/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">https://themis-tranphuquangninh.pages.dev/</span>
                </a>
                <a
                  href="https://github.com/luongvantam/Themis-web"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white font-medium"
                >
                  <GitBranch className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">github.com/luongvantam/Themis-web</span>
                </a>
              </div>
            </div>

            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/[0.04] text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong className="text-neutral-800 dark:text-neutral-200">Mục đích: </strong>
              Phục vụ học tập, giảng dạy môn Tin học và tổ chức các kỳ thi học sinh giỏi các cấp tại Việt Nam.
            </div>

            <div className="flex items-center justify-center space-x-1.5 text-neutral-500 dark:text-neutral-400 text-xs pt-1">
              <span>Dành tặng với</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>cho cộng đồng giáo viên & học sinh Tin học</span>
            </div>
          </div>

          {/* Footer button */}
          <div className="px-6 pb-6 pt-1 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Classic Delphi 200x Windows mode
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      {/* Windows 200x Dialog Frame */}
      <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] max-w-md w-full flex flex-col overflow-hidden text-xs font-sans">
        {/* Windows 200x Classic Title Bar */}
        <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shadow-sm">
          <div className="flex items-center space-x-2">
            <img src="/icons/themis.png" alt="Themis" className="w-4 h-4 object-contain" />
            <span className="font-bold text-[12px] tracking-wide text-white drop-shadow">
              Giới thiệu Themis Web
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition"
          >
            ✕
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-3 bg-white p-3 border-t border-l border-[#808080] border-b border-r border-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]">
            <img
              src="/icons/btnjudge.png"
              alt="Themis Original Icon"
              className="w-12 h-12 object-contain shrink-0 filter drop-shadow"
            />
            <div>
              <h2 className="text-sm font-bold text-[#003366] tracking-tight">THEMIS AUTOMATIC JUDGE</h2>
              <p className="text-[11px] text-slate-700 font-mono font-semibold">Phiên bản Web (Themis-web)</p>
              <p className="text-[10px] text-slate-500">Phần mềm chấm bài thi học sinh giỏi Tin học trên trình duyệt web</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-800 space-y-2 bg-white p-3 border-t border-l border-[#808080] border-b border-r border-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] leading-relaxed">
            <div>
              <span className="text-[#003366] block font-bold text-[11px] uppercase">Tác giả phần mềm Themis nguyên bản:</span>
              <p className="text-black font-semibold mt-0.5">Thầy Lê Minh Hoàng &bull; Thầy Đỗ Đức Đông</p>
              <p className="text-slate-500 text-[10px]">Trường Đại học Sư phạm Hà Nội & Trường Đại học Công nghệ - ĐHQGHN</p>
            </div>
            <div className="pt-2 border-t border-[#D0D0D0]">
              <span className="text-[#003366] block font-bold text-[11px] uppercase">Người viết lại cho bản Web:</span>
              <p className="text-black font-semibold mt-0.5">Lương Văn Tâm (THPT Trần Phú - Quảng Ninh)</p>
              <p className="text-slate-600 text-[10px] mt-0.5">
                Trang web: <a href="https://themis-tranphuquangninh.pages.dev/" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">https://themis-tranphuquangninh.pages.dev/</a>
              </p>
              <p className="text-slate-600 text-[10px] mt-0.5">
                Mã nguồn GitHub: <a href="https://github.com/luongvantam/Themis-web" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">https://github.com/luongvantam/Themis-web</a>
              </p>
            </div>
            <div className="pt-2 border-t border-[#D0D0D0]">
              <span className="text-[#003366] block font-bold text-[11px] uppercase">Mục đích:</span>
              <p className="text-slate-700 text-[10px]">
                Phục vụ học tập, giảng dạy môn Tin học và tổ chức các kỳ thi học sinh giỏi các cấp tại Việt Nam.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-1 text-slate-600 text-[11px]">
            <span>Dành tặng với</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>cho cộng đồng giáo viên và học sinh Tin học Việt Nam</span>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-6 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-black font-bold shadow-[1px_1px_0_#404040] rounded-none transition active:translate-y-px"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
