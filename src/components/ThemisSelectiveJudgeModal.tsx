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
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden text-xs select-none font-sans transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Tuỳ chọn chấm bài (Chấm có chọn lọc)
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {contest.title}
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

        {/* Info Banner */}
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-800/40 px-4 py-2.5 text-neutral-700 dark:text-neutral-300 flex items-start space-x-2.5 shrink-0 text-xs">
          <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11.5px] leading-relaxed">
            Mặc định Themis sẽ chấm cho <strong>toàn bộ bài toán</strong> và <strong>toàn bộ thí sinh</strong>. 
            Bạn có thể bỏ tick bất kỳ bài toán hoặc thí sinh nào để <strong>chỉ chấm riêng</strong> những mục cần thiết.
          </div>
        </div>

        {/* Main Body - 2 Columns */}
        <div className="flex-1 grid grid-cols-2 gap-3 p-4 overflow-hidden bg-neutral-100/50 dark:bg-[#151518]">
          {/* Column 1: Problems List */}
          <div className="flex flex-col bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-neutral-50/80 dark:bg-[#252529]/80 px-3.5 py-2 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-semibold text-neutral-900 dark:text-white">
                <FileCode2 className="w-4 h-4 text-blue-500" />
                <span>Bài toán ({selectedProblemCodes.size}/{contest.problems.length})</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onSelectAllProblems(true)}
                  className="px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded text-[10px] font-medium"
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllProblems(false)}
                  className="px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded text-[10px] font-medium"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="p-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center bg-black/[0.03] dark:bg-white/[0.05] rounded-lg px-2.5 py-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  placeholder="Lọc mã hoặc tên bài..."
                  className="bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 text-xs focus:outline-none w-full"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredProblems.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 italic">
                  Không tìm thấy bài toán nào
                </div>
              ) : (
                filteredProblems.map((prob) => {
                  const isChecked = selectedProblemCodes.has(prob.code.toUpperCase());
                  return (
                    <label
                      key={prob.id}
                      className={`flex items-center justify-between px-3 py-2 hover:bg-neutral-50 dark:hover:bg-white/[0.03] cursor-pointer rounded-lg transition select-none ${
                        isChecked ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleProblem(prob.code)}
                          className="w-4 h-4 text-blue-600 rounded border-neutral-300 dark:border-neutral-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white text-[12px]">
                            {prob.code} - {prob.title}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {prob.testCases.length} test cases &bull; {prob.points} điểm
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isChecked ? (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 rounded-full flex items-center space-x-0.5">
                            <Check className="w-2.5 h-2.5" />
                            <span>Sẽ chấm</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-white/[0.06] text-neutral-400 rounded-full">
                            Bỏ qua
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Students List */}
          <div className="flex flex-col bg-white dark:bg-[#1E1E22] border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-neutral-50/80 dark:bg-[#252529]/80 px-3.5 py-2 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-semibold text-neutral-900 dark:text-white">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Thí sinh ({selectedStudentNames.size}/{allStudentNames.length})</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onSelectAllStudents(true)}
                  className="px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded text-[10px] font-medium"
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllStudents(false)}
                  className="px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded text-[10px] font-medium"
                >
                  Bỏ chọn
                </button>
                <button
                  type="button"
                  onClick={onInvertStudentSelection}
                  className="px-2 py-0.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-300 rounded text-[10px] font-medium"
                >
                  Đảo
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="p-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center bg-black/[0.03] dark:bg-white/[0.05] rounded-lg px-2.5 py-1">
                <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Lọc tên thí sinh..."
                  className="bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 text-xs focus:outline-none w-full"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 italic">
                  Không tìm thấy thí sinh nào
                </div>
              ) : (
                filteredStudents.map((name) => {
                  const isChecked = selectedStudentNames.has(name);
                  const studentSubs = submissions.filter((s) => s.contestantName === name);
                  const totalScore = studentSubs.reduce((sum, s) => sum + s.totalScore, 0);

                  return (
                    <label
                      key={name}
                      className={`flex items-center justify-between px-3 py-2 hover:bg-neutral-50 dark:hover:bg-white/[0.03] cursor-pointer rounded-lg transition select-none ${
                        isChecked ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleStudent(name)}
                          className="w-4 h-4 text-blue-600 rounded border-neutral-300 dark:border-neutral-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white text-[12px]">
                            {name}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {studentSubs.length} bài nộp &bull; Hiện tại: {totalScore.toFixed(1)}đ
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isChecked ? (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 rounded-full flex items-center space-x-0.5">
                            <Check className="w-2.5 h-2.5" />
                            <span>Sẽ chấm</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-white/[0.06] text-neutral-400 rounded-full">
                            Bỏ qua
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Summary & Actions */}
        <div className="bg-neutral-50/90 dark:bg-[#18181B]/95 border-t border-black/[0.06] dark:border-white/[0.08] px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-[12px] flex items-center space-x-2">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Kế hoạch:</span>
            <span>
              {matchingSubmissions.length > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Sẽ chấm {matchingSubmissions.length} bài nộp ({selectedStudentNames.size} thí sinh &bull; {selectedProblemCodes.size} bài toán)
                </span>
              ) : (
                <span className="text-rose-500 font-semibold">
                  Chưa chọn bài nộp nào! (0 bài nộp được chấm)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onResetToDefault}
              className="px-3 py-1.5 bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium transition text-xs flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
              <span>Mặc định</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
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
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm ${
                matchingSubmissions.length === 0
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed opacity-50'
                  : 'bg-[#0071E3] hover:bg-[#0077ED] text-white active:scale-[0.98]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chấm ngay ({matchingSubmissions.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
