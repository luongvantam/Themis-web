import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Server, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      {/* Windows Dialog Frame */}
      <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] max-w-lg w-full flex flex-col overflow-hidden text-xs font-sans">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shadow-sm">
          <div className="flex items-center space-x-2">
            <img src="/icons/btnsettings.png" alt="Settings" className="w-4 h-4 object-contain" />
            <span className="font-bold text-[12px] tracking-wide">
              Themis - Cấu hình hệ thống & Máy chủ chấm
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Judge0 Sandbox Engine */}
          <div className="p-3 bg-white border border-[#808080] win-border-inset space-y-3">
            <div className="flex items-center space-x-1.5 border-b border-[#E0E0E0] pb-1.5 font-bold text-[#003366]">
              <Server className="w-4 h-4 text-[#0078D7]" />
              <span>Máy chủ biên dịch & chấm bài (Judge0 API)</span>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold text-[11px]">
                Địa chỉ máy chủ (Endpoint URL):
              </label>
              <input
                type="text"
                value={settings.judge0Url}
                onChange={(e) => setSettings({ ...settings, judge0Url: e.target.value })}
                placeholder="https://ce.judge0.com"
                className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-black font-mono text-[11px] focus:outline-none focus:border-[#0078D7]"
                required
              />
              <p className="text-[10px] text-slate-500">
                Mặc định máy chủ miễn phí: <code>https://ce.judge0.com</code> hoặc máy chủ tự dựng.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold text-[11px]">
                Khóa xác thực API Key (Tùy chọn):
              </label>
              <input
                type="password"
                value={settings.judge0Key}
                onChange={(e) => setSettings({ ...settings, judge0Key: e.target.value })}
                placeholder="Để trống nếu máy chủ không yêu cầu key"
                className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-black font-mono text-[11px] focus:outline-none focus:border-[#0078D7]"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-[#E5F1FB] border border-[#808080] hover:border-[#70C0E7] text-slate-800 rounded-sm font-medium shadow-sm transition active:scale-95"
              >
                {isTesting ? <Loader2 className="w-3 h-3 animate-spin text-amber-600" /> : <Server className="w-3 h-3 text-[#0078D7]" />}
                <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
              </button>

              {testResult && (
                <div
                  className={`flex items-center space-x-1 text-[11px] ${
                    testResult.ok ? 'text-[#008000] font-semibold' : 'text-[#CC0000]'
                  }`}
                >
                  {testResult.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span className="truncate max-w-[200px]" title={testResult.message}>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compilation & Compatibility Settings */}
          <div className="p-3 bg-white border border-[#808080] win-border-inset space-y-2.5">
            <div className="font-bold text-[#003366] border-b border-[#E0E0E0] pb-1">
              Tùy chọn tương thích mã nguồn Themis
            </div>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-800">
              <input
                type="checkbox"
                checked={settings.autoRedirectFreopen}
                onChange={(e) =>
                  setSettings({ ...settings, autoRedirectFreopen: e.target.checked })
                }
                className="rounded-none border-[#7F9DB9]"
              />
              <span className="font-medium text-[11px]">
                Tự động chuyển hướng tập tin <code>freopen / assign</code> sang Standard I/O
              </span>
            </label>
            <p className="text-[10px] text-slate-500 pl-5">
              Cho phép code của thí sinh dù dùng <code>freopen("BAI1.INP", "r", stdin)</code> vẫn chạy hoàn hảo trên Sandbox trực tuyến.
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Độ lệch sai số số thực (Float Epsilon):</span>
              <input
                type="number"
                step="0.000001"
                value={settings.floatEpsilon}
                onChange={(e) =>
                  setSettings({ ...settings, floatEpsilon: parseFloat(e.target.value) || 0.000001 })
                }
                className="w-24 px-2 py-0.5 bg-white border border-[#7F9DB9] text-black font-mono text-[11px] text-right"
              />
            </div>
          </div>

          {/* Danger Zone: Clear Cache */}
          {onClearData && (
            <div className="flex items-center justify-between p-2 bg-[#FFF5F5] border border-[#F87171]">
              <span className="text-[11px] text-rose-700">Xóa toàn bộ lịch sử điểm & bài nộp của kỳ thi:</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ các bài nộp của kỳ thi này?')) {
                    onClearData();
                    onClose();
                  }
                }}
                className="flex items-center space-x-1 px-2 py-0.5 bg-white hover:bg-[#FEE2E2] text-rose-700 border border-[#F87171] rounded-sm text-[11px] shadow-sm transition"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Xóa sạch bài nộp</span>
              </button>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-[#D0D0D0]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-semibold shadow-[1px_1px_0_#404040] transition active:translate-y-px"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-black font-bold shadow-[1px_1px_0_#404040] rounded-none transition active:translate-y-px"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
