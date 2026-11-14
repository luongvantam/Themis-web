import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Cpu, AlertTriangle, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { TestResult, Verdict } from '../types';

interface TestVerdictListProps {
  results: TestResult[];
  totalScore: number;
  maxScore: number;
  isJudging: boolean;
  currentTestIndex?: number;
  totalTests?: number;
}

export const TestVerdictList: React.FC<TestVerdictListProps> = ({
  results,
  totalScore,
  maxScore,
  isJudging,
  currentTestIndex = 0,
  totalTests = 0,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (results.length === 0 && !isJudging) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-medium">Chưa có kết quả chấm nào.</p>
        <p className="text-xs text-slate-500 mt-1">
          Nhấn nút &ldquo;Nộp bài & Chấm điểm&rdquo; để gửi mã nguồn tới Judge0.
        </p>
      </div>
    );
  }

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case 'AC':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ĐÚNG (AC)</span>
          </span>
        );
      case 'WA':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>SAI (WA)</span>
          </span>
        );
      case 'TLE':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>QUÁ GIỜ (TLE)</span>
          </span>
        );
      case 'MLE':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>QUÁ BỘ NHỚ (MLE)</span>
          </span>
        );
      case 'CE':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>LỖI BIÊN DỊCH (CE)</span>
          </span>
        );
      case 'RTE':
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-red-600/20 text-red-400 border border-red-600/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>LỖI CHẠY (RTE)</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400">
            {verdict}
          </span>
        );
    }
  };

  const isFullScore = totalScore === maxScore && maxScore > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header Summary */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>Kết quả chấm chi tiết</span>
            {isJudging && (
              <span className="text-xs font-normal text-amber-400 animate-pulse">
                (Đang chấm test {currentTestIndex}/{totalTests}...)
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hoàn thành: {results.length} / {totalTests || results.length} test cases
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Tổng điểm</div>
          <div
            className={`text-xl font-bold font-mono ${
              isFullScore
                ? 'text-emerald-400'
                : totalScore > 0
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {totalScore.toFixed(2)} / {maxScore.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Progress Bar while judging */}
      {isJudging && totalTests > 0 && (
        <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${(results.length / totalTests) * 100}%` }}
          />
        </div>
      )}

      {/* Test List */}
      <div className="divide-y divide-slate-800 max-h-[420px] overflow-y-auto">
        {results.map((r, index) => {
          const isExpanded = expandedId === r.testCaseId;
          return (
            <div key={r.testCaseId || index} className="text-xs">
              <div
                onClick={() => setExpandedId(isExpanded ? null : r.testCaseId)}
                className="p-3 flex items-center justify-between hover:bg-slate-800/50 cursor-pointer transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                  <span className="font-mono font-semibold text-slate-300">
                    {r.testCaseName || `Test ${index + 1}`}
                  </span>
                  {getVerdictBadge(r.verdict)}
                </div>

                <div className="flex items-center space-x-4 font-mono text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{r.timeUsedMs}ms</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-slate-500" />
                    <span>{(r.memoryUsedKb / 1024).toFixed(1)}MB</span>
                  </span>
                  <span
                    className={`font-bold ${
                      r.score > 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    +{r.score.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800/60 space-y-2 text-slate-300 font-mono">
                  {r.statusDescription && (
                    <div>
                      <span className="text-slate-500">Trạng thái: </span>
                      <span className="text-slate-200">{r.statusDescription}</span>
                    </div>
                  )}
                  {r.compileOutput && (
                    <div>
                      <span className="text-amber-400 font-semibold">Thông báo biên dịch:</span>
                      <pre className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 text-amber-300 text-[11px] whitespace-pre-wrap overflow-x-auto">
                        {r.compileOutput}
                      </pre>
                    </div>
                  )}
                  {r.stderr && (
                    <div>
                      <span className="text-rose-400 font-semibold">Lỗi thực thi (stderr):</span>
                      <pre className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 text-rose-300 text-[11px] whitespace-pre-wrap overflow-x-auto">
                        {r.stderr}
                      </pre>
                    </div>
                  )}
                  {r.stdout && (
                    <div>
                      <span className="text-slate-400 font-semibold">Đầu ra của chương trình:</span>
                      <pre className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 text-slate-300 text-[11px] whitespace-pre-wrap max-h-28 overflow-y-auto">
                        {r.stdout}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

