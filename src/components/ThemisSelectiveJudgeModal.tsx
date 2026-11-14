import React, { useState } from 'react';
import { 
  Search, Play, RotateCcw, 
  HelpCircle, Users, FileCode2, Check, Filter, X
} from 'lucide-react';
import { Contest, Submission } from '../types';

interface ThemisSelectiveJudgeModalProps {
  isOpen: boolean;
  contest: Contest | null;
  submissions: Submission[];
  selectedStudentNames: Set<string>;
  selectedProblemCodes: Set<string>;
  onClose: () => void;
  onToggleStudent: (name: string) => void;
  onToggleProblem: (code: string) => void;
  onSelectAllStudents: (select: boolean) => void;
  onSelectAllProblems: (select: boolean) => void;
  onInvertStudentSelection: () => void;
  onResetToDefault: () => void;
  onStartJudging: () => void;
}

export const ThemisSelectiveJudgeModal: React.FC<ThemisSelectiveJudgeModalProps> = ({
  isOpen,
  contest,
  submissions,
  selectedStudentNames,
  selectedProblemCodes,
  onClose,
  onToggleStudent,
  onToggleProblem,
  onSelectAllStudents,
  onSelectAllProblems,
  onInvertStudentSelection,
  onResetToDefault,
  onStartJudging,
}) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [problemSearch, setProblemSearch] = useState('');

  if (!isOpen || !contest) return null;

  // Unique students from submissions
  const allStudentNames = Array.from(new Set(submissions.map((s) => s.contestantName))).sort();

  const filteredStudents = allStudentNames.filter((name) =>
    name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredProblems = contest.problems.filter(
    (p) =>
      p.code.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.title.toLowerCase().includes(problemSearch.toLowerCase())
  );

  // Submissions that match the current selection
  const matchingSubmissions = submissions.filter(
    (s) =>
      selectedStudentNames.has(s.contestantName) &&
      selectedProblemCodes.has(s.problemCode.toUpperCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden text-xs select-none font-sans text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-[14px] text-neutral-900 dark:text-white">
                Bộ lọc & Tùy chọn bài thi cần chấm
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {contest.title} • Chọn riêng bài toán hoặc thí sinh muốn chấm điểm
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

        {/* Info Banner & Quick stats */}
        <div className="bg-neutral-50/90 dark:bg-[#252529]/90 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-2.5 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-[11.5px] text-neutral-600 dark:text-neutral-300">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Đã chọn <strong>{matchingSubmissions.length}</strong> / {submissions.length} bài thi để chấm.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onResetToDefault}
              className="flex items-center space-x-1 px-3 py-1 bg-white dark:bg-[#1E1E22] hover:bg-neutral-100 dark:hover:bg-white/[0.08] border border-black/10 dark:border-white/10 rounded-lg text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition"
            >
              <RotateCcw className="w-3 h-3 text-neutral-400" />
              <span>Mặc định (Chọn tất cả)</span>
            </button>
          </div>
        </div>

        {/* Main Body - 2 Columns */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden bg-[#F5F5F7] dark:bg-[#141416]">
          {/* Column 1: Problems List */}
          <div className="flex flex-col bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-neutral-50/80 dark:bg-[#252529]/80 px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-neutral-900 dark:text-white">
                <FileCode2 className="w-4 h-4 text-blue-500" />
                <span>Danh sách bài toán ({selectedProblemCodes.size}/{contest.problems.length})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => onSelectAllProblems(true)}
                  className="px-2.5 py-1 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded-lg text-[10.5px] font-medium transition"
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllProblems(false)}
                  className="px-2.5 py-1 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded-lg text-[10.5px] font-medium transition"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="p-2.5 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.05] rounded-xl px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  placeholder="Tìm kiếm mã hoặc tên bài toán..."
                  className="bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 text-xs focus:outline-none w-full"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredProblems.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  Không tìm thấy bài toán phù hợp
                </div>
              ) : (
                filteredProblems.map((prob) => {
                  const isChecked = selectedProblemCodes.has(prob.code.toUpperCase());
                  return (
                    <div
                      key={prob.id}
                      onClick={() => onToggleProblem(prob.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/70 dark:bg-blue-950/25 border border-blue-200/50 dark:border-blue-800/40'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-[#0071E3] text-white'
                              : 'border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-[#252529]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-neutral-900 dark:text-white text-xs">
                              {prob.code}
                            </span>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                              {prob.title}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center space-x-2 mt-0.5">
                            <span>{prob.testCases?.length || 0} tests</span>
                            <span>•</span>
                            <span>{prob.points} điểm</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] font-mono text-neutral-500 dark:text-neutral-400 shrink-0">
                        {(prob.timeLimitMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Students List */}
          <div className="flex flex-col bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-neutral-50/80 dark:bg-[#252529]/80 px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2 font-semibold text-neutral-900 dark:text-white">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Thí sinh ({selectedStudentNames.size}/{allStudentNames.length})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => onSelectAllStudents(true)}
                  className="px-2.5 py-1 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded-lg text-[10.5px] font-medium transition"
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllStudents(false)}
                  className="px-2.5 py-1 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded-lg text-[10.5px] font-medium transition"
                >
                  Bỏ chọn
                </button>
                <button
                  type="button"
                  onClick={onInvertStudentSelection}
                  className="px-2.5 py-1 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded-lg text-[10.5px] font-medium transition"
                >
                  Đảo chọn
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="p-2.5 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.05] rounded-xl px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm kiếm tên thí sinh..."
                  className="bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 text-xs focus:outline-none w-full"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  Không có thí sinh nào
                </div>
              ) : (
                filteredStudents.map((name) => {
                  const isChecked = selectedStudentNames.has(name);
                  const subCount = submissions.filter((s) => s.contestantName === name).length;

                  return (
                    <div
                      key={name}
                      onClick={() => onToggleStudent(name)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/50 dark:border-emerald-800/40'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-[#252529]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {name.slice(0, 2).toUpperCase()}
                        </div>

                        <span className="font-medium text-neutral-900 dark:text-white text-xs truncate">
                          {name}
                        </span>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-neutral-500 dark:text-neutral-400 shrink-0">
                        {subCount} bài nộp
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-white dark:bg-[#1E1E22]">
          <div className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
            Tổng cộng: <strong className="text-neutral-900 dark:text-white">{matchingSubmissions.length}</strong> bài thi sẵn sàng chấm
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartJudging();
              }}
              disabled={matchingSubmissions.length === 0}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-medium text-xs shadow-md transition ${
                matchingSubmissions.length === 0
                  ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#0071E3] hover:bg-[#0077ED] text-white active:scale-95 shadow-blue-500/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Chấm {matchingSubmissions.length} bài đã chọn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
