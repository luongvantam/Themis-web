import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Copy } from 'lucide-react';
import { UITheme } from '../types';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ThemisLogConsoleProps {
  logs: LogEntry[];
  theme?: UITheme;
  onClearLogs: () => void;
}

export const ThemisLogConsole: React.FC<ThemisLogConsoleProps> = ({ logs, theme = 'apple', onClearLogs }) => {
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

  const isApple = theme === 'apple';

  const getTextColor = (type: LogEntry['type'], msg: string) => {
    if (isApple) {
      if (msg.startsWith('===') || msg.includes('Đang chấm')) {
        return 'text-[#64D2FF] font-semibold'; // Cupertino Sky Blue
      }
      if (msg.startsWith('=> Kết quả')) {
        return 'text-[#30D158] font-bold'; // Cupertino Green
      }
      switch (type) {
        case 'success':
          return 'text-[#30D158] font-medium';
        case 'warning':
          return 'text-[#FFD60A] font-medium';
        case 'error':
          return 'text-[#FF453A] font-medium';
        default:
          return 'text-[#E5E5EA]';
      }
    }

    // Classic Delphi 200x colors
    if (msg.startsWith('===') || msg.includes('Đang chấm')) {
      return 'text-[#000080] font-bold';
    }
    if (msg.startsWith('=> Kết quả')) {
      return 'text-[#003366] font-bold';
    }
    switch (type) {
      case 'success':
        return 'text-[#008000] font-semibold';
      case 'warning':
        return 'text-[#B8860B]';
      case 'error':
        return 'text-[#CC0000] font-semibold';
      default:
        return 'text-[#1E1E1E]';
    }
  };

  return (
    <div
      className={`flex flex-col h-full overflow-hidden font-mono text-xs select-text ${
        isApple
          ? 'bg-[#18181B] border border-black/[0.08] rounded-2xl shadow-sm text-neutral-200'
          : 'bg-[#FFFFFF] border border-[#808080] win-border-inset text-black'
      }`}
    >
      {/* Console Sub-header */}
      <div
        className={
          isApple
            ? 'px-4 py-2 bg-[#27272A] border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-300 select-none'
            : 'px-2 py-1 bg-[#F0F0F0] border-b border-[#D0D0D0] flex items-center justify-between text-[11px] text-slate-700 select-none'
        }
      >
        <div className="flex items-center space-x-2">
          <Terminal className={`w-3.5 h-3.5 ${isApple ? 'text-[#0071E3]' : 'text-[#005A9E]'}`} />
          <span className={`font-semibold ${isApple ? 'text-white' : 'text-[#003366] uppercase font-bold'}`}>
            Nhật ký chấm bài
          </span>
          <span className={isApple ? 'text-neutral-400 font-normal' : 'text-slate-500'}>
            ({logs.length} dòng)
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopyLogs}
            title="Sao chép toàn bộ nhật ký"
            className={
              isApple
                ? 'flex items-center space-x-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-neutral-200 rounded-md text-[11px] font-medium transition active:scale-[0.98]'
                : 'flex items-center space-x-1 px-2 py-0.5 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px'
            }
          >
            <Copy className="w-3 h-3 text-neutral-400" />
            <span>Sao chép</span>
          </button>
          <button
            onClick={onClearLogs}
            title="Xóa sạch nhật ký"
            className={
              isApple
                ? 'flex items-center space-x-1.5 px-2.5 py-1 bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-200 rounded-md text-[11px] font-medium transition active:scale-[0.98]'
                : 'flex items-center space-x-1 px-2 py-0.5 bg-[#ECE9D8] hover:bg-[#FFF5F5] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-rose-700 rounded-none text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px'
            }
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Xóa log</span>
          </button>
        </div>
      </div>

      {/* Log Text View */}
      <div
        ref={scrollRef}
        className={`flex-1 p-3 overflow-y-auto space-y-0.5 font-mono text-[11px] leading-relaxed ${
          isApple ? 'bg-[#18181B] text-neutral-200' : 'bg-white text-black'
        }`}
      >
        {logs.length === 0 ? (
          <div className={`${isApple ? 'text-neutral-500' : 'text-slate-400'} italic select-none`}>
            [Sẵn sàng] Nhật ký quá trình chấm và kết quả chi tiết từng test sẽ hiển thị tại đây...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="leading-tight whitespace-pre-wrap flex items-start space-x-2">
              <span className={`${isApple ? 'text-neutral-500' : 'text-slate-500'} select-none shrink-0`}>
                [{log.timestamp}]
              </span>
              <span className={getTextColor(log.type, log.message)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
