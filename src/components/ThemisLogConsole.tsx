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
      return 'text-[#000080] font-bold'; // Navy blue for major headers
    }
    if (msg.startsWith('=> Kết quả')) {
      return 'text-[#003366] font-bold';
    }
    switch (type) {
      case 'success':
        return 'text-[#008000] font-semibold'; // Classic Windows Green
      case 'warning':
        return 'text-[#B8860B]'; // Dark Goldenrod
      case 'error':
        return 'text-[#CC0000] font-semibold'; // Classic Windows Red
      default:
        return 'text-[#1E1E1E]'; // Black text
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] border border-[#808080] win-border-inset overflow-hidden font-mono text-xs select-text">
      {/* Console Sub-header */}
      <div className="px-2 py-1 bg-[#F0F0F0] border-b border-[#D0D0D0] flex items-center justify-between text-[11px] text-slate-700 select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[#005A9E]" />
          <span className="font-bold text-[#003366] uppercase">
            Nhật ký chấm bài (Grading Log Console)
          </span>
          <span className="text-slate-500">({logs.length} dòng)</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopyLogs}
            title="Sao chép toàn bộ nhật ký"
            className="flex items-center space-x-1 px-2 py-0.5 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px"
          >
            <Copy className="w-3 h-3 text-slate-700" />
            <span>Sao chép</span>
          </button>
          <button
            onClick={onClearLogs}
            title="Xóa sạch nhật ký"
            className="flex items-center space-x-1 px-2 py-0.5 bg-[#ECE9D8] hover:bg-[#FFF5F5] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-rose-700 rounded-none text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px"
          >
            <Trash2 className="w-3 h-3 text-rose-600" />
            <span>Xóa log</span>
          </button>
        </div>
      </div>

      {/* Log Text View */}
      <div
        ref={scrollRef}
        className="flex-1 p-2 overflow-y-auto space-y-0.5 font-mono text-[12px] bg-white text-black leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-slate-400 italic select-none">
            [Sẵn sàng] Nhật ký quá trình chấm và kết quả chi tiết từng test sẽ hiển thị tại đây...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="leading-tight whitespace-pre-wrap flex items-start space-x-1.5">
              <span className="text-slate-500 select-none shrink-0">[{log.timestamp}]</span>
              <span className={getTextColor(log.type, log.message)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
