import React from 'react';
import { Heart } from 'lucide-react';

interface ThemisAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemisAboutModal: React.FC<ThemisAboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
              <p className="text-black font-semibold mt-0.5">Lương Văn Tâm (Học sinh)</p>
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
