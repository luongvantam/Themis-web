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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden text-xs font-sans text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Title Bar - standard across all Themis modals */}
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                isJudging
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isJudging ? (
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500" />
                </span>
              ) : isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[14px] text-neutral-900 dark:text-white">
                {isJudging
                  ? 'Tiến trình chấm bài thi'
                  : isCompleted
                  ? 'Đã hoàn thành chấm bài!'
                  : 'Trạng thái chấm bài'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {isJudging ? 'Đang thực thi các test case qua Sandbox...' : 'Themis Sandbox Engine'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Thu nhỏ / Đóng để xem bảng điểm"
            className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Progress Bar & Counter Card */}
          <div className="bg-neutral-50/80 dark:bg-[#252529]/80 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-[11.5px] font-medium text-neutral-700 dark:text-neutral-300">
              <span>Tiến độ tổng thể</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {Math.min(currentIndex, totalCount)} / {totalCount} bài ({Math.round(progressPercent)}%)
              </span>
            </div>

            <div className="w-full bg-black/[0.06] dark:bg-white/[0.08] h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                }`}
                style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
              />
            </div>
          </div>

          {/* Current Grading Target Card */}
          {isJudging && (
            <div className="bg-neutral-50/80 dark:bg-[#252529]/80 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
                <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400 font-medium">Bài thi đang chấm:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-[12px]">
                  {currentProblemCode || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-900 dark:text-white text-xs font-semibold truncate max-w-[280px]">
                  👤 Thí sinh: {currentContestant || 'N/A'}
                </span>
                <span className="text-[11px] text-neutral-600 dark:text-neutral-300 font-mono font-medium">
                  {currentTestCase ? `Test: ${currentTestCase}` : 'Đang nạp test...'}
                </span>
              </div>

              {/* Last Test Verdict live ticker */}
              {lastVerdict && (
                <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10.5px] ${
                        lastVerdict.verdict === 'AC'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {lastVerdict.verdict === 'AC' ? 'ĐÚNG' : lastVerdict.verdict}
                    </span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      +{lastVerdict.score.toFixed(1)}đ
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lastVerdict.timeUsedMs}ms</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{lastVerdict.memoryUsedKb}KB</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-4 text-emerald-800 dark:text-emerald-300 flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-xs">Đã hoàn thành toàn bộ bài thi!</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Bảng điểm đã được cập nhật trực tiếp theo thời gian thực.
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 font-medium transition text-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Thu nhỏ (Xem bảng điểm)</span>
            </button>

            {isJudging ? (
              <button
                type="button"
                onClick={onStopJudging}
                className="flex items-center space-x-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-medium rounded-xl text-xs shadow-sm transition"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Dừng chấm</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-medium rounded-xl text-xs shadow-sm transition"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
