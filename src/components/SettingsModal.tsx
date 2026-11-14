import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Server, Trash2, X, Settings } from 'lucide-react';
import { AppSettings } from '../types';
import { storage } from '../storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onClearData }) => {
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
          message: `Kết nối trả về mã lỗi HTTP ${res.status}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Không thể kết nối đến máy chủ: ${err.message}.`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden text-xs font-sans text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Cấu hình hệ thống & Máy chủ chấm
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Judge0 Sandbox Engine
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

        {/* Dialog Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Judge0 Sandbox Engine */}
          <div className="p-3.5 bg-neutral-50/80 dark:bg-[#252529]/80 rounded-xl border border-black/[0.06] dark:border-white/[0.06] space-y-3">
            <div className="flex items-center space-x-1.5 border-b border-black/[0.06] dark:border-white/[0.06] pb-2 font-semibold text-neutral-900 dark:text-white">
              <Server className="w-4 h-4 text-blue-500" />
              <span>Máy chủ biên dịch & chấm bài (Judge0 API)</span>
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                Địa chỉ máy chủ (Endpoint URL):
              </label>
              <input
                type="text"
                value={settings.judge0Url}
                onChange={(e) => setSettings({ ...settings, judge0Url: e.target.value })}
                placeholder="https://ce.judge0.com"
                className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1E22] border border-black/10 dark:border-white/10 rounded-lg text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-[10px] text-neutral-400">
                Mặc định: <code>https://ce.judge0.com</code> hoặc máy chủ tự dựng qua Docker.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                Khóa xác thực API Key (Tùy chọn):
              </label>
              <input
                type="password"
                value={settings.judge0Key}
                onChange={(e) => setSettings({ ...settings, judge0Key: e.target.value })}
                placeholder="Để trống nếu máy chủ không yêu cầu key"
                className="w-full px-3 py-1.5 bg-white dark:bg-[#1E1E22] border border-black/10 dark:border-white/10 rounded-lg text-neutral-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#1E1E22] hover:bg-neutral-100 dark:hover:bg-white/[0.08] border border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium shadow-sm transition active:scale-95"
              >
                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <Server className="w-3.5 h-3.5 text-blue-500" />}
                <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
              </button>

              {testResult && (
                <div
                  className={`flex items-center space-x-1 text-[11px] ${
                    testResult.ok ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {testResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span className="truncate max-w-[220px]" title={testResult.message}>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compilation & Compatibility Settings */}
          <div className="p-3.5 bg-neutral-50/80 dark:bg-[#252529]/80 rounded-xl border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
            <div className="font-semibold text-neutral-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.06] pb-1.5">
              Tùy chọn tương thích mã nguồn Themis
            </div>

            <label className="flex items-center space-x-2.5 cursor-pointer text-neutral-800 dark:text-neutral-200">
              <input
                type="checkbox"
                checked={settings.autoRedirectFreopen}
                onChange={(e) =>
                  setSettings({ ...settings, autoRedirectFreopen: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded border-neutral-300 dark:border-neutral-600 focus:ring-0 cursor-pointer"
              />
              <span className="font-medium text-[11.5px]">
                Tự động chuyển hướng tập tin <code>freopen / assign</code> sang Standard I/O
              </span>
            </label>
            <p className="text-[10px] text-neutral-400 pl-6.5">
              Cho phép code của thí sinh dù dùng <code>freopen("BAI1.INP", "r", stdin)</code> vẫn chạy hoàn hảo trên Sandbox trực tuyến.
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">Độ lệch sai số số thực (Float Epsilon):</span>
              <input
                type="number"
                step="0.000001"
                value={settings.floatEpsilon}
                onChange={(e) =>
                  setSettings({ ...settings, floatEpsilon: parseFloat(e.target.value) || 0.000001 })
                }
                className="w-24 px-2.5 py-1 bg-white dark:bg-[#1E1E22] border border-black/10 dark:border-white/10 rounded-lg text-neutral-900 dark:text-white font-mono text-xs text-right focus:outline-none"
              />
            </div>
          </div>

          {/* Danger Zone: Clear Cache */}
          {onClearData && (
            <div className="flex items-center justify-between p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 rounded-xl">
              <span className="text-[11px] text-rose-700 dark:text-rose-400">Xóa toàn bộ lịch sử điểm & bài nộp:</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ các bài nộp của kỳ thi này?')) {
                    onClearData();
                    onClose();
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1 bg-white dark:bg-[#2C2C2E] hover:bg-rose-50 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-lg text-[11px] font-medium shadow-sm transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa sạch bài nộp</span>
              </button>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-medium rounded-xl text-xs shadow-sm transition"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
