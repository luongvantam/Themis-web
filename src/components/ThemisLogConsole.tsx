import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Copy } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ThemisLogConsoleProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const ThemisLogConsole: React.FC<ThemisLogConsoleProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const getTextColor = (type: LogEntry['type'], msg: string) => {
    if (msg.startsWith('===') || msg.includes('Đang chấm')) {
      return 'text-[#64D2FF] dark:text-[#70D7FF] font-semibold'; // Cupertino Sky Blue
    }
    if (msg.startsWith('=> Kết quả')) {
      return 'text-[#30D158] dark:text-[#32D74B] font-bold'; // Cupertino Green
    }
    switch (type) {
      case 'success':
        return 'text-[#30D158] dark:text-[#32D74B] font-medium';
      case 'warning':
        return 'text-[#FFD60A] dark:text-[#FFD60A] font-medium';
      case 'error':
        return 'text-[#FF453A] dark:text-[#FF453A] font-medium';
      default:
        return 'text-[#E5E5EA] dark:text-[#E5E5EA]';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono text-xs select-text bg-[#18181B] dark:bg-[#121215] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-sm text-neutral-200 transition-colors">
      {/* Console Sub-header */}
      <div className="px-4 py-2 bg-[#27272A] dark:bg-[#1C1C20] border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-300 select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#64D2FF]" />
          <span className="font-semibold text-white">
            Nhật ký chấm bài
          </span>
          <span className="text-neutral-400 font-normal">
            ({logs.length} dòng)
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopyLogs}
            title="Sao chép toàn bộ nhật ký ra clipboard"
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white rounded-lg text-[11px] transition"
          >
            <Copy className="w-3 h-3 text-neutral-300" />
            <span>Sao chép</span>
          </button>

          <button
            onClick={onClearLogs}
            title="Xóa trắng màn hình nhật ký"
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/10 hover:bg-rose-500/30 text-rose-300 hover:text-white active:scale-[0.98] rounded-lg text-[11px] transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xoá log</span>
          </button>
        </div>
      </div>

      {/* Terminal logs list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#18181B] dark:bg-[#121215] text-[11.5px] leading-relaxed select-text"
      >
        {logs.length === 0 ? (
          <div className="text-neutral-500 italic py-6 text-center select-none font-sans">
            Chưa có thông tin nhật ký chấm. Bấm F9 hoặc nút "Chấm bài" để bắt đầu quá trình chấm tự động.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2.5 hover:bg-white/[0.04] px-1 rounded">
              <span className="text-neutral-500 shrink-0 font-mono text-[11px] select-none pt-0.5">
                [{log.timestamp}]
              </span>
              <span className={`break-all ${getTextColor(log.type, log.message)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
