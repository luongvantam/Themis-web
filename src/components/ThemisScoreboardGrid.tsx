import React, { useState } from 'react';
import { Search, Trophy, Users, Filter } from 'lucide-react';
import { Contest, Submission } from '../types';
import { calculateScoreboard, ScoreboardRow } from '../utils/csvExporter';

interface ThemisScoreboardGridProps {
  contest: Contest | null;
  submissions: Submission[];
  selectedStudentNames?: Set<string>;
  selectedProblemCodes?: Set<string>;
  onSelectSubmissionDetail: (
    submission: Submission | null,
    contestantName: string,
    problemCode: string
  ) => void;
  onOpenStudentManager?: (studentName?: string) => void;
  onOpenProblemConfig?: (problemCode?: string) => void;
  onOpenSelectiveJudgeModal?: () => void;
  onToggleStudent?: (name: string) => void;
  onToggleAllStudents?: () => void;
  onToggleProblem?: (code: string) => void;
}

export const ThemisScoreboardGrid: React.FC<ThemisScoreboardGridProps> = ({
  contest,
  submissions,
  selectedStudentNames,
  selectedProblemCodes,
  onSelectSubmissionDetail,
  onOpenStudentManager,
  onOpenProblemConfig,
  onOpenSelectiveJudgeModal,
  onToggleStudent,
  onToggleAllStudents,
  onToggleProblem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  if (!contest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-xs bg-white/80 dark:bg-[#1A1A1E]/80 backdrop-blur-md rounded-2xl border border-black/[0.08] dark:border-white/[0.08] text-neutral-500 shadow-sm transition-colors">
        <div className="text-sm font-semibold mb-1 text-neutral-900 dark:text-neutral-100">
          Chưa mở kỳ thi nào
        </div>
        <p className="text-neutral-500 dark:text-neutral-400">
          Vui lòng vào <strong>Kỳ thi → Tạo kỳ thi mới</strong> hoặc bấm <strong>Nạp Đề & Test</strong> trên thanh công cụ.
        </p>
      </div>
    );
  }

  const rows: ScoreboardRow[] = calculateScoreboard(contest, submissions);

  const filtered = rows.filter((r) =>
    r.contestantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCellClick = (contestantName: string, problemCode: string) => {
    const candidateSubs = submissions.filter(
      (s) => s.contestantName === contestantName && s.problemCode === problemCode
    );
    if (candidateSubs.length > 0) {
      candidateSubs.sort((a, b) => b.totalScore - a.totalScore);
      onSelectSubmissionDetail(candidateSubs[0], contestantName, problemCode);
    } else {
      onSelectSubmissionDetail(null, contestantName, problemCode);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs select-none bg-white/80 dark:bg-[#1E1E22]/90 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-sm transition-colors">
      {/* Table Sub-header / Filter */}
      <div className="px-4 py-2.5 bg-[#FBFBFD] dark:bg-[#18181B] border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 transition-colors">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-neutral-900 dark:text-white">
            Bảng kết quả chấm ({contest.title})
          </span>
          <span className="text-neutral-400 dark:text-neutral-500 font-normal">
            — {rows.length} thí sinh &bull; {contest.problems.length} bài toán
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenSelectiveJudgeModal && (
            <button
              type="button"
              onClick={onOpenSelectiveJudgeModal}
              title="Mở bảng tuỳ chọn chỉ chấm cho bài nào hoặc thí sinh nào (F7)"
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border font-medium text-[11px] shadow-sm transition active:scale-[0.98] ${
                selectedStudentNames &&
                (selectedStudentNames.size < rows.length ||
                  (selectedProblemCodes && selectedProblemCodes.size < contest.problems.length))
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-[#2C2C2E] border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/[0.06]'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                Lọc chấm ({selectedStudentNames ? selectedStudentNames.size : rows.length}/{rows.length} người &bull;{' '}
                {selectedProblemCodes ? selectedProblemCodes.size : contest.problems.length}/{contest.problems.length} bài)
              </span>
            </button>
          )}

          {onOpenStudentManager && (
            <button
              onClick={() => onOpenStudentManager()}
              title="Mở bảng quản lý đổi tên, xóa học sinh (F6)"
              className="flex items-center space-x-1.5 px-3 py-1 bg-white dark:bg-[#2C2C2E] hover:bg-neutral-50 dark:hover:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 rounded-xl font-medium text-[11px] shadow-sm transition active:scale-[0.98]"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quản lý Thí sinh ({rows.length})</span>
            </button>
          )}

          <div className="flex items-center space-x-1">
            <div className="flex items-center bg-white dark:bg-[#2C2C2E] border border-black/[0.1] dark:border-white/[0.1] rounded-full px-2.5 py-1 shadow-sm">
              <Search className="w-3.5 h-3.5 text-neutral-400 mr-1.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên thí sinh..."
                className="bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 text-[11px] focus:outline-none w-32 font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#1A1A1E] transition-colors">
        <table className="w-full text-left text-xs border-collapse">
          {/* Column Header */}
          <thead className="sticky top-0 z-10 select-none shadow-sm font-semibold">
            <tr className="bg-neutral-50/90 dark:bg-[#242428]/95 text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md">
              {/* STT Header */}
              <th className="py-2.5 px-2 w-14 text-center border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center justify-center space-x-1">
                  {onToggleAllStudents && (
                    <input
                      type="checkbox"
                      checked={
                        rows.length > 0 &&
                        (!selectedStudentNames || rows.every((r) => selectedStudentNames.has(r.contestantName)))
                      }
                      onChange={onToggleAllStudents}
                      title="Chọn / Bỏ chọn chấm tất cả thí sinh"
                      className="cursor-pointer w-3.5 h-3.5 text-blue-600 rounded border-neutral-300 dark:border-neutral-600"
                    />
                  )}
                  <span>STT</span>
                </div>
              </th>

              {/* Thí sinh Header */}
              <th className="py-2.5 px-4 border-b border-black/[0.06] dark:border-white/[0.08] min-w-[180px]">
                Thí sinh
              </th>

              {/* Problem Headers */}
              {contest.problems.map((p) => {
                const isProbChecked = !selectedProblemCodes || selectedProblemCodes.has(p.code.toUpperCase());
                return (
                  <th
                    key={p.id}
                    className={`py-2.5 px-2 text-center border-b border-black/[0.06] dark:border-white/[0.08] min-w-[95px] transition-opacity ${
                      !isProbChecked ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {onToggleProblem && (
                        <input
                          type="checkbox"
                          checked={isProbChecked}
                          onChange={() => onToggleProblem(p.code)}
                          title={`Tick để chấm bài ${p.code} (bỏ tick để tắt chấm)`}
                          className="cursor-pointer w-3.5 h-3.5 text-blue-600 rounded border-neutral-300 dark:border-neutral-600"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProblemConfig?.(p.code);
                        }}
                        title={`Bấm vào để cấu hình, chỉnh sửa bài ${p.code} và bộ test`}
                        className="font-semibold cursor-pointer focus:outline-none hover:underline text-neutral-900 dark:text-neutral-100 hover:text-[#0071E3] dark:hover:text-[#64D2FF]"
                      >
                        {p.code}
                      </button>
                    </div>
                    <div
                      onClick={() => onOpenProblemConfig?.(p.code)}
                      title={`Bấm vào để cấu hình, chỉnh sửa bài ${p.code}`}
                      className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal cursor-pointer hover:underline"
                    >
                      ({p.points}đ)
                      {!isProbChecked && <span className="ml-1 text-rose-500 font-medium">(tắt)</span>}
                    </div>
                  </th>
                );
              })}

              {/* Tổng điểm Header */}
              <th className="py-2.5 px-4 text-right border-b border-black/[0.06] dark:border-white/[0.08] min-w-[100px]">
                Tổng điểm
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="text-[12px] font-sans divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={contest.problems.length + 3}
                  className="py-12 text-center text-neutral-400 text-xs italic bg-white dark:bg-[#1A1A1E]"
                >
                  {rows.length === 0
                    ? 'Chưa có dữ liệu bài nộp. Hãy bấm "Nạp Thí sinh" hoặc "Bắt đầu chấm".'
                    : 'Không tìm thấy thí sinh nào phù hợp.'}
                </td>
              </tr>
            ) : (
              filtered.map((row, index) => {
                const isSelected = selectedRowIndex === index;
                const isStudentChecked = !selectedStudentNames || selectedStudentNames.has(row.contestantName);

                return (
                  <tr
                    key={row.contestantName}
                    onClick={() => setSelectedRowIndex(index)}
                    className={`cursor-pointer transition-colors group ${
                      !isStudentChecked ? 'opacity-50' : ''
                    } ${
                      isSelected
                        ? '!bg-[#0071E3]/[0.08] dark:!bg-[#0071E3]/[0.18]'
                        : 'hover:bg-[#0071E3]/[0.03] dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* STT with Checkbox */}
                    <td className="py-2.5 px-2 text-center text-neutral-400 dark:text-neutral-500 font-mono text-[11px]">
                      <div className="flex items-center justify-center space-x-1">
                        {onToggleStudent && (
                          <input
                            type="checkbox"
                            checked={isStudentChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              onToggleStudent(row.contestantName);
                            }}
                            title={`Tick để chấm cho thí sinh ${row.contestantName}`}
                            className="cursor-pointer w-3.5 h-3.5 text-blue-600 rounded border-neutral-300 dark:border-neutral-600"
                          />
                        )}
                        <span>{index + 1}</span>
                      </div>
                    </td>

                    {/* Contestant Name */}
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRowIndex(index);
                        onOpenStudentManager?.(row.contestantName);
                      }}
                      title={`Bấm vào để mở bảng quản lý / sửa thông tin thí sinh "${row.contestantName}"`}
                      className="py-2.5 px-4 font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer hover:underline hover:text-[#0071E3] dark:hover:text-[#64D2FF] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex items-center space-x-1">
                          <span>{row.contestantName}</span>
                          {!isStudentChecked && (
                            <span className="text-[10px] font-normal text-rose-500 italic">
                              (bỏ qua)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Problem Scores */}
                    {contest.problems.map((prob) => {
                      const isProbChecked = !selectedProblemCodes || selectedProblemCodes.has(prob.code.toUpperCase());
                      const willBeJudged = isStudentChecked && isProbChecked;
                      const score = row.problemScores[prob.code];
                      const isGraded = row.problemGraded?.[prob.code] ?? (score !== undefined && score !== null);
                      const hasSubmitted = submissions.some(
                        (s) => s.contestantName === row.contestantName && s.problemCode === prob.code
                      );

                      return (
                        <td
                          key={prob.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRowIndex(index);
                            handleCellClick(row.contestantName, prob.code);
                          }}
                          title={
                            !willBeJudged
                              ? `Bài này sẽ BỎ QUA khi bấm Chấm bài`
                              : isGraded && score !== undefined
                              ? `Điểm: ${score.toFixed(1)} / ${prob.points}. Nhấn để xem chi tiết`
                              : hasSubmitted
                              ? `Chưa chấm bài ${prob.code} của ${row.contestantName}. Nhấn để xem file`
                              : `Chưa nộp bài ${prob.code}. Nhấn để nạp file mã nguồn hoặc chẩn đoán!`
                          }
                          className="py-2.5 px-2 text-center font-mono text-[11px] cursor-pointer hover:bg-[#0071E3]/[0.06] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          {isGraded && score !== undefined ? (
                            <span
                              className={`inline-flex items-center justify-center min-w-[38px] px-2 py-0.5 rounded-full text-[11px] font-semibold transition-transform hover:scale-105 ${
                                score === prob.points
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
                                  : score > 0
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50'
                              }`}
                            >
                              {score.toFixed(1)}
                            </span>
                          ) : (
                            ''
                          )}
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[13px] text-neutral-900 dark:text-white">
                      {row.hasAnyGraded ? row.totalScore.toFixed(2) : ''}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
