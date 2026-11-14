import React from 'react';
import { Square, CheckCircle2, AlertCircle, Clock, Cpu, X, Eye } from 'lucide-react';

export interface JudgingHUDProps {
  isOpen: boolean;
  isJudging: boolean;
  progressPercent: number;
  currentContestant: string;
  currentProblemCode: string;
  currentTestCase: string;
  currentIndex: number;
  totalCount: number;
  lastVerdict?: {
    testCaseName: string;
    verdict: string;
    score: number;
    timeUsedMs: number;
    memoryUsedKb: number;
  } | null;
  onStopJudging: () => void;
  onClose: () => void;
  isCompleted?: boolean;
}

export const ThemisJudgingHUD: React.FC<JudgingHUDProps> = ({
  isOpen,
  isJudging,
  progressPercent,
  currentContestant,
  currentProblemCode,
  currentTestCase,
  currentIndex,
  totalCount,
  lastVerdict,
  onStopJudging,
  onClose,
  isCompleted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-16 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="pointer-events-auto bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl w-full max-w-lg p-5 text-xs text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            {isJudging ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
              </span>
            ) : isCompleted ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            )}
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
              {isJudging
                ? 'Themis — Đang chấm bài thi'
                : isCompleted
                ? 'Themis — Đã hoàn thành chấm bài!'
                : 'Themis — Trạng thái chấm bài'}
            </h3>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onClose}
              title="Ẩn khung thông báo"
              className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="py-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            <span>Tiến độ tổng thể</span>
            <span className="font-mono font-semibold text-neutral-900 dark:text-white">
              {Math.min(currentIndex, totalCount)} / {totalCount} bài ({Math.round(progressPercent)}%)
            </span>
          </div>

          <div className="w-full bg-black/[0.06] dark:bg-white/[0.08] h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
              }`}
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Current Grading Target Card */}
        {isJudging && (
          <div className="bg-neutral-50 dark:bg-[#252529] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-3 space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Đang chấm:</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-semibold text-[11px]">
                {currentProblemCode || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between font-medium">
              <span className="text-neutral-900 dark:text-white text-xs truncate max-w-[280px]">
                👤 Thí sinh: <strong>{currentContestant || 'N/A'}</strong>
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                {currentTestCase ? `Test: ${currentTestCase}` : 'Đang khởi chạy...'}
              </span>
            </div>

            {/* Last Test Verdict live ticker */}
            {lastVerdict && (
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                      lastVerdict.verdict === 'AC'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {lastVerdict.verdict === 'AC' ? 'ĐÚNG' : lastVerdict.verdict}
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    +{lastVerdict.score.toFixed(1)}đ
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">
                  <span className="flex items-center space-x-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{lastVerdict.timeUsedMs}ms</span>
                  </span>
                  <span className="flex items-center space-x-0.5">
                    <Cpu className="w-3 h-3" />
                    <span>{lastVerdict.memoryUsedKb}KB</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-3 mb-3 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-xs">Đã hoàn thành toàn bộ bài thi!</div>
              <div className="text-[11px] opacity-80 mt-0.5">
                Bảng điểm đã được cập nhật trực tiếp theo thời gian thực.
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-1 px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] rounded-xl text-neutral-700 dark:text-neutral-300 font-medium transition text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ẩn khung (Xem bảng điểm)</span>
          </button>

          {isJudging ? (
            <button
              type="button"
              onClick={onStopJudging}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-medium rounded-xl text-xs shadow-sm transition"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Dừng chấm</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-medium rounded-xl text-xs shadow-sm transition"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
