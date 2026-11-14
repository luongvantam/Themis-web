import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, Loader2, Server, Trash2, X, Settings, 
  Sliders, ShieldCheck, KeyRound, Globe, FileCode, Sun, Moon
} from 'lucide-react';
import { AppSettings, ColorMode } from '../types';
import { storage } from '../storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData?: () => void;
  onSaveNotification?: () => void;
  colorMode: ColorMode;
  onSetColorMode: (mode: ColorMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onClearData,
  onSaveNotification,
  colorMode,
  onSetColorMode,
}) => {
  const [settings, setSettings] = useState<AppSettings>({
    judge0Url: 'https://ce.judge0.com',
    judge0Key: '',
    autoRedirectFreopen: true,
    floatEpsilon: 0.000001,
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      storage.getSettings().then(setSettings);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await storage.saveSettings(settings);
    if (onSaveNotification) {
      onSaveNotification();
    }
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const targetUrl = settings.judge0Url.replace(/\/+$/, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (settings.judge0Key) {
      if (targetUrl.includes('rapidapi.com')) {
        headers['X-RapidAPI-Key'] = settings.judge0Key;
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
      } else {
        headers['X-Auth-Token'] = settings.judge0Key;
      }
    }

    try {
      const res = await fetch(`${targetUrl}/about`, { headers });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setTestResult({
          ok: true,
          message: `Kết nối thành công! Phiên bản: ${data.version || 'Judge0 CE'}`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `Lỗi phản hồi HTTP ${res.status}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Không thể kết nối máy chủ: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden text-xs font-sans text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-[14px] text-neutral-900 dark:text-white">
                Cấu hình hệ thống & Máy chủ chấm
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Judge0 Sandbox • Tương thích Themis • Sai số chấm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Section 0: Appearance / Theme (Chủ đề màu: Sáng / Tối) */}
          <div className="bg-neutral-50/80 dark:bg-[#252529]/80 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
              <div className="flex items-center space-x-2 font-semibold text-neutral-900 dark:text-white text-[12.5px]">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Giao diện & Chủ đề màu</span>
              </div>
              <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/10 text-neutral-700 dark:text-neutral-300 font-medium">
                {colorMode === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng (Mặc định)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Option 1: Sáng (Nền trắng mặc định) */}
              <button
                type="button"
                onClick={() => onSetColorMode('light')}
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                  colorMode === 'light'
                    ? 'bg-white dark:bg-[#1E1E22] border-[#0071E3] ring-2 ring-[#0071E3]/20 shadow-sm'
                    : 'bg-white/60 dark:bg-[#1E1E22]/60 border-black/10 dark:border-white/10 hover:border-black/20'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-neutral-900 dark:text-white text-xs">
                    Giao diện Sáng
                  </div>
                  <div className="text-[10.5px] text-neutral-500 dark:text-neutral-400">
                    Nền trắng (Mặc định)
                  </div>
                </div>
              </button>

              {/* Option 2: Tối */}
              <button
                type="button"
                onClick={() => onSetColorMode('dark')}
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                  colorMode === 'dark'
                    ? 'bg-white dark:bg-[#1E1E22] border-[#0071E3] ring-2 ring-[#0071E3]/20 shadow-sm'
                    : 'bg-white/60 dark:bg-[#1E1E22]/60 border-black/10 dark:border-white/10 hover:border-black/20'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-neutral-900 dark:text-white text-xs">
                    Giao diện Tối
                  </div>
                  <div className="text-[10.5px] text-neutral-500 dark:text-neutral-400">
                    Nền tối Apple Dark
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 1: Server Config */}
          <div className="bg-neutral-50/80 dark:bg-[#252529]/80 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
              <div className="flex items-center space-x-2 font-semibold text-neutral-900 dark:text-white text-[12.5px]">
                <Server className="w-4 h-4 text-blue-500" />
                <span>Máy chủ Judge0 Sandbox Engine</span>
              </div>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                Online API
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center space-x-1.5 text-neutral-700 dark:text-neutral-300 font-medium text-[11.5px]">
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                <span>Địa chỉ máy chủ (Endpoint URL):</span>
              </label>
              <input
                type="text"
                value={settings.judge0Url}
                onChange={(e) => setSettings({ ...settings, judge0Url: e.target.value })}
                placeholder="https://ce.judge0.com"
                className="w-full px-3 py-2 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                required
              />
              <div className="flex items-center justify-between text-[10.5px] text-neutral-500 dark:text-neutral-400 px-0.5">
                <span>Mặc định máy chủ công cộng: <code>https://ce.judge0.com</code></span>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, judge0Url: 'https://ce.judge0.com' })}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Đặt lại mặc định
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center space-x-1.5 text-neutral-700 dark:text-neutral-300 font-medium text-[11.5px]">
                <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                <span>Khóa xác thực API Key (Tùy chọn):</span>
              </label>
              <input
                type="password"
                value={settings.judge0Key}
                onChange={(e) => setSettings({ ...settings, judge0Key: e.target.value })}
                placeholder="Để trống nếu máy chủ Judge0 không yêu cầu Token/Key"
                className="w-full px-3 py-2 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              />
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center space-x-2 px-3.5 py-1.5 bg-white dark:bg-[#1C1C1E] hover:bg-neutral-100 dark:hover:bg-white/[0.08] border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium shadow-sm transition active:scale-95 text-xs"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>{isTesting ? 'Đang kiểm tra kết nối...' : 'Kiểm tra máy chủ'}</span>
              </button>

              {testResult && (
                <div
                  className={`flex items-center space-x-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg ${
                    testResult.ok 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {testResult.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate max-w-[210px]" title={testResult.message}>
                    {testResult.message}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Compatibility & Compiler */}
          <div className="bg-neutral-50/80 dark:bg-[#252529]/80 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-3.5">
            <div className="flex items-center space-x-2 font-semibold text-neutral-900 dark:text-white text-[12.5px] border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Tùy chọn tương thích mã nguồn Themis</span>
            </div>

            {/* Apple style toggle switch */}
            <div className="flex items-start justify-between space-x-3 pt-1">
              <div className="space-y-1">
                <div className="font-semibold text-neutral-900 dark:text-white text-[12px] flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tự động chuyển hướng freopen / assign</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Tự động phát hiện và chuyển các lệnh đọc ghi file trong code của thí sinh thành Standard I/O để chạy trực tuyến an toàn.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, autoRedirectFreopen: !settings.autoRedirectFreopen })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.autoRedirectFreopen ? 'bg-[#0071E3]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.autoRedirectFreopen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Float epsilon */}
            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11.5px] font-semibold text-neutral-800 dark:text-neutral-200">
                  Độ lệch sai số thực (Float Epsilon):
                </span>
                <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400">
                  Ngưỡng sai số tuyệt đối khi so sánh số thực (mặc định 10⁻⁶)
                </p>
              </div>
              <input
                type="number"
                step="0.000001"
                value={settings.floatEpsilon}
                onChange={(e) =>
                  setSettings({ ...settings, floatEpsilon: parseFloat(e.target.value) || 0.000001 })
                }
                className="w-28 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl text-neutral-900 dark:text-white font-mono text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>
          </div>

          {/* Section 3: Danger Zone */}
          {onClearData && (
            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  Xóa sạch bài nộp & điểm số
                </span>
                <p className="text-[10.5px] text-rose-600/80 dark:text-rose-400/70">
                  Đặt lại toàn bộ bài làm của thí sinh về trạng thái ban đầu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ các bài nộp của kỳ thi này?')) {
                    onClearData();
                    onClose();
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#252529] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium shadow-sm transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa bài nộp</span>
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end space-x-2.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-medium rounded-xl text-xs shadow-md shadow-blue-500/20 transition"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
