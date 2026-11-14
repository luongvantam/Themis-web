import React from 'react';
import { Heart, Globe, GitBranch, X } from 'lucide-react';

interface ThemisAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemisAboutModal: React.FC<ThemisAboutModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-md w-full flex flex-col overflow-hidden text-neutral-800 dark:text-neutral-100 font-sans">
        {/* Header */}
        <div className="relative pt-6 pb-4 px-6 flex flex-col items-center border-b border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
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
          <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl border border-black/[0.04] dark:border-white/[0.06] space-y-1">
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

          <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl border border-black/[0.04] dark:border-white/[0.06] space-y-2">
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

          <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/[0.04] dark:border-white/[0.06] text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
};
