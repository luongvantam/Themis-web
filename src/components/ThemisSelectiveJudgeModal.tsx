import React, { useState } from 'react';
import { 
  CheckSquare, Square, Search, Play, RotateCcw, 
  HelpCircle, Users, FileCode2, Check, Filter
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden text-xs win-border-outset select-none font-sans">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-1.5 font-bold text-[12px]">
            <Filter className="w-3.5 h-3.5 text-white" />
            <span>Themis - Tuỳ chọn chấm bài (Chấm có chọn lọc)</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition"
          >
            ✕
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#FFFDE7] border-b border-[#FFE082] px-3 py-2 text-slate-700 flex items-start space-x-2 shrink-0">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            Mặc định Themis sẽ tick chọn chấm cho <strong>toàn bộ bài toán</strong> và <strong>toàn bộ thí sinh</strong>. 
            Thầy/Cô có thể bỏ tick bất kỳ bài toán hoặc thí sinh nào để <strong>chỉ chấm riêng</strong> những bài hoặc thí sinh cần chấm.
          </div>
        </div>

        {/* Main Body - 2 Columns */}
        <div className="flex-1 grid grid-cols-2 gap-2 p-3 overflow-hidden bg-[#ECE9D8]">
          {/* Column 1: Problems List */}
          <div className="flex flex-col bg-white border border-[#7F9DB9] rounded-sm overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-[#EBEBEB] px-2.5 py-1.5 border-b border-[#D0D0D0] flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold text-[#003366]">
                <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Bài toán ({selectedProblemCodes.size}/{contest.problems.length})</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onSelectAllProblems(true)}
                  title="Chọn tất cả bài toán"
                  className="px-1.5 py-0.5 bg-white hover:bg-[#E5F1FB] text-[10px] text-blue-700 border border-[#B0D0F0] rounded flex items-center space-x-0.5"
                >
                  <CheckSquare className="w-2.5 h-2.5" />
                  <span>Tất cả</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllProblems(false)}
                  title="Bỏ chọn tất cả bài toán"
                  className="px-1.5 py-0.5 bg-white hover:bg-[#FFF0F0] text-[10px] text-rose-700 border border-[#F0C0C0] rounded flex items-center space-x-0.5"
                >
                  <Square className="w-2.5 h-2.5" />
                  <span>Bỏ chọn</span>
                </button>
              </div>
            </div>

            {/* Quick search */}
            <div className="p-1.5 bg-[#F8F9FA] border-b border-[#E0E0E0]">
              <div className="flex items-center bg-white border border-[#B0C0D0] px-1.5 py-0.5">
                <Search className="w-3 h-3 text-slate-400 mr-1" />
                <input
                  type="text"
                  placeholder="Lọc mã bài..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className="bg-transparent w-full text-[11px] focus:outline-none"
                />
              </div>
            </div>

            {/* Problems list */}
            <div className="flex-1 overflow-y-auto p-1 divide-y divide-[#F0F0F0]">
              {filteredProblems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  Không tìm thấy bài toán nào
                </div>
              ) : (
                filteredProblems.map((prob) => {
                  const isChecked = selectedProblemCodes.has(prob.code.toUpperCase());
                  const probSubsCount = submissions.filter(
                    (s) => s.problemCode.toUpperCase() === prob.code.toUpperCase()
                  ).length;

                  return (
                    <label
                      key={prob.id}
                      className={`flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F7FF] cursor-pointer rounded transition select-none ${
                        isChecked ? 'bg-[#F2F8FD]' : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleProblem(prob.code)}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-[#003366] text-[12px] flex items-center space-x-1.5">
                            <span>{prob.code}</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              ({prob.points} điểm)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                            {prob.title || 'Không có tiêu đề'} &bull; {prob.testCases.length} tests
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                          {probSubsCount} bài nộp
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Students List */}
          <div className="flex flex-col bg-white border border-[#7F9DB9] rounded-sm overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-[#EBEBEB] px-2.5 py-1.5 border-b border-[#D0D0D0] flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold text-[#003366]">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thí sinh ({selectedStudentNames.size}/{allStudentNames.length})</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onSelectAllStudents(true)}
                  title="Chọn tất cả thí sinh"
                  className="px-1.5 py-0.5 bg-white hover:bg-[#E5F1FB] text-[10px] text-blue-700 border border-[#B0D0F0] rounded flex items-center space-x-0.5"
                >
                  <CheckSquare className="w-2.5 h-2.5" />
                  <span>Tất cả</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAllStudents(false)}
                  title="Bỏ chọn tất cả thí sinh"
                  className="px-1.5 py-0.5 bg-white hover:bg-[#FFF0F0] text-[10px] text-rose-700 border border-[#F0C0C0] rounded flex items-center space-x-0.5"
                >
                  <Square className="w-2.5 h-2.5" />
                  <span>Bỏ chọn</span>
                </button>
                <button
                  type="button"
                  onClick={onInvertStudentSelection}
                  title="Đảo lựa chọn"
                  className="px-1.5 py-0.5 bg-white hover:bg-[#F0F0F0] text-[10px] text-slate-700 border border-slate-300 rounded"
                >
                  Đảo
                </button>
              </div>
            </div>

            {/* Quick search */}
            <div className="p-1.5 bg-[#F8F9FA] border-b border-[#E0E0E0]">
              <div className="flex items-center bg-white border border-[#B0C0D0] px-1.5 py-0.5">
                <Search className="w-3 h-3 text-slate-400 mr-1" />
                <input
                  type="text"
                  placeholder="Lọc tên thí sinh..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="bg-transparent w-full text-[11px] focus:outline-none"
                />
              </div>
            </div>

            {/* Students list */}
            <div className="flex-1 overflow-y-auto p-1 divide-y divide-[#F0F0F0]">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  {allStudentNames.length === 0
                    ? 'Chưa có dữ liệu thí sinh nào'
                    : 'Không tìm thấy thí sinh phù hợp'}
                </div>
              ) : (
                filteredStudents.map((name) => {
                  const isChecked = selectedStudentNames.has(name);
                  const studentSubs = submissions.filter((s) => s.contestantName === name);
                  const totalScore = studentSubs.reduce((sum, s) => sum + s.totalScore, 0);

                  return (
                    <label
                      key={name}
                      className={`flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F7FF] cursor-pointer rounded transition select-none ${
                        isChecked ? 'bg-[#F2F8FD]' : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleStudent(name)}
                          className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 text-[12px]">
                            {name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {studentSubs.length} bài nộp &bull; Hiện tại: {totalScore.toFixed(1)}đ
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isChecked ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center space-x-0.5">
                            <Check className="w-2.5 h-2.5" />
                            <span>Sẽ chấm</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded">
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
        <div className="bg-[#EBEBEB] border-t border-[#D0D0D0] px-3 py-2 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-700 flex items-center space-x-1.5">
            <span className="font-semibold text-[#003366]">Kế hoạch chấm:</span>
            <span>
              {matchingSubmissions.length > 0 ? (
                <span className="text-emerald-700 font-bold">
                  Sẽ chấm {matchingSubmissions.length} bài nộp ({selectedStudentNames.size} thí sinh &bull; {selectedProblemCodes.size} bài toán)
                </span>
              ) : (
                <span className="text-rose-600 font-bold">
                  Chưa chọn bài nộp nào! (0 bài nộp được chấm)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onResetToDefault}
              className="px-3 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-semibold transition text-[11px] flex items-center space-x-1 shadow-[1px_1px_0_#404040]"
            >
              <RotateCcw className="w-3 h-3 text-slate-700" />
              <span>Mặc định (Chọn tất cả)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-semibold transition text-[11px] shadow-[1px_1px_0_#404040]"
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
              className={`px-4 py-1 rounded-none text-[11px] font-bold flex items-center space-x-1.5 transition border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white shadow-[1px_1px_0_#404040] ${
                matchingSubmissions.length === 0
                  ? 'bg-[#ECE9D8] text-slate-400 opacity-50 cursor-not-allowed'
                  : 'bg-[#EBF7EB] hover:bg-[#DCF3DC] text-[#006600]'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Bắt đầu chấm ngay ({matchingSubmissions.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

