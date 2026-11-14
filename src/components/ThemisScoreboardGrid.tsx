import React, { useState } from 'react';
import { Search, Trophy, Users, Filter } from 'lucide-react';
import { Contest, Submission, UITheme } from '../types';
import { calculateScoreboard, ScoreboardRow } from '../utils/csvExporter';

interface ThemisScoreboardGridProps {
  contest: Contest | null;
  submissions: Submission[];
  selectedStudentNames?: Set<string>;
  selectedProblemCodes?: Set<string>;
  theme?: UITheme;
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
  theme = 'apple',
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

  const isApple = theme === 'apple';

  if (!contest) {
    return (
      <div
        className={`flex-1 flex flex-col items-center justify-center p-8 text-xs ${
          isApple
            ? 'bg-white/80 backdrop-blur-md rounded-2xl border border-black/[0.08] text-neutral-500 shadow-sm'
            : 'bg-[#F0F0F0] text-slate-500 border border-[#808080] win-border-inset'
        }`}
      >
        <div className={`text-sm font-semibold mb-1 ${isApple ? 'text-neutral-900' : 'text-slate-700'}`}>
          Chưa mở kỳ thi nào
        </div>
        <p>
          Vui lòng vào <strong>Tệp → Tạo kỳ thi mới</strong> hoặc bấm <strong>Nạp folder Đề & Test</strong> trên thanh công cụ.
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
    <div
      className={`flex flex-col h-full overflow-hidden text-xs select-none ${
        isApple
          ? 'bg-white/80 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-sm'
          : 'bg-[#FFFFFF] border border-[#808080] win-border-inset'
      }`}
    >
      {/* Table Sub-header / Filter */}
      <div
        className={
          isApple
            ? 'px-4 py-2.5 bg-[#FBFBFD] border-b border-black/[0.06] flex items-center justify-between text-xs text-neutral-700'
            : 'px-2 py-1 bg-[#F0F0F0] border-b border-[#D0D0D0] flex items-center justify-between text-[11px] text-slate-700'
        }
      >
        <div className="flex items-center space-x-2">
          <Trophy className={`w-4 h-4 ${isApple ? 'text-amber-500' : 'text-amber-600'}`} />
          <span className={`font-semibold ${isApple ? 'text-neutral-900' : 'font-bold text-[#003366] uppercase'}`}>
            Bảng kết quả chấm ({contest.title})
          </span>
          <span className={isApple ? 'text-neutral-400 font-normal' : 'text-slate-500'}>
            — {rows.length} thí sinh &bull; {contest.problems.length} bài toán
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenSelectiveJudgeModal && (
            <button
              type="button"
              onClick={onOpenSelectiveJudgeModal}
              title="Mở bảng tuỳ chọn chỉ chấm cho bài nào hoặc thí sinh nào"
              className={
                isApple
                  ? `flex items-center space-x-1.5 px-3 py-1 rounded-lg border font-medium text-[11px] shadow-sm transition active:scale-[0.98] ${
                      selectedStudentNames &&
                      (selectedStudentNames.size < rows.length ||
                        (selectedProblemCodes && selectedProblemCodes.size < contest.problems.length))
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-black/[0.08] text-neutral-700 hover:bg-neutral-50'
                    }`
                  : `flex items-center space-x-1 px-2 py-0.5 border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white rounded-none font-semibold text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px ${
                      selectedStudentNames &&
                      (selectedStudentNames.size < rows.length ||
                        (selectedProblemCodes && selectedProblemCodes.size < contest.problems.length))
                        ? 'bg-[#FFF8E7] hover:bg-[#FFEFC4] text-[#B78103]'
                        : 'bg-[#ECE9D8] hover:bg-[#F5F4EB] text-slate-900'
                    }`
              }
            >
              <Filter className={`w-3.5 h-3.5 ${isApple ? 'text-amber-600' : 'text-amber-700'}`} />
              <span>
                Lọc chấm ({selectedStudentNames ? selectedStudentNames.size : rows.length}/{rows.length} người &bull;{' '}
                {selectedProblemCodes ? selectedProblemCodes.size : contest.problems.length}/{contest.problems.length} bài)
              </span>
            </button>
          )}

          {onOpenStudentManager && (
            <button
              onClick={() => onOpenStudentManager()}
              title="Mở bảng quản lý đổi tên, xóa học sinh"
              className={
                isApple
                  ? 'flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-neutral-50 border border-black/[0.08] text-neutral-700 rounded-lg font-medium text-[11px] shadow-sm transition active:scale-[0.98]'
                  : 'flex items-center space-x-1.5 px-2 py-0.5 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-semibold text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px'
              }
            >
              <Users className={`w-3.5 h-3.5 ${isApple ? 'text-indigo-600' : 'text-indigo-700'}`} />
              <span>Quản lý Thí sinh ({rows.length})</span>
            </button>
          )}

          <div className="flex items-center space-x-1">
            <div
              className={
                isApple
                  ? 'flex items-center bg-white border border-black/[0.1] rounded-full px-2.5 py-1 shadow-sm'
                  : 'flex items-center bg-white border border-[#7F9DB9] px-1.5 py-0.5 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)]'
              }
            >
              <Search className="w-3.5 h-3.5 text-neutral-400 mr-1.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên..."
                className="bg-transparent text-neutral-900 text-[11px] focus:outline-none w-28 font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          {/* Column Header */}
          <thead className="sticky top-0 z-10 select-none shadow-sm font-semibold">
            <tr
              className={
                isApple
                  ? 'bg-neutral-50/90 text-[11px] text-neutral-500 uppercase tracking-wider border-b border-black/[0.06] backdrop-blur-md'
                  : 'bg-[#ECE9D8] text-[11px] text-[#1E1E1E]'
              }
            >
              {/* STT Header */}
              <th
                className={
                  isApple
                    ? 'py-2 px-2 w-14 text-center border-b border-black/[0.06]'
                    : 'py-1 px-1.5 w-14 text-center border-t border-l border-white border-r border-b border-[#999999] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE]'
                }
              >
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
                      className="cursor-pointer w-3.5 h-3.5 text-blue-600 rounded border-neutral-300"
                    />
                  )}
                  <span>STT</span>
                </div>
              </th>

              {/* Thí sinh Header */}
              <th
                className={
                  isApple
                    ? 'py-2 px-4 border-b border-black/[0.06] min-w-[180px]'
                    : 'py-1 px-3 border-t border-l border-white border-r border-b border-[#999999] min-w-[180px] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE]'
                }
              >
                Thí sinh
              </th>

              {/* Problem Headers */}
              {contest.problems.map((p) => {
                const isProbChecked = !selectedProblemCodes || selectedProblemCodes.has(p.code.toUpperCase());
                return (
                  <th
                    key={p.id}
                    className={
                      isApple
                        ? `py-2 px-2 text-center border-b border-black/[0.06] min-w-[95px] transition-opacity ${
                            !isProbChecked ? 'opacity-40' : ''
                          }`
                        : `py-1 px-2 text-center border-t border-l border-white border-r border-b border-[#999999] min-w-[90px] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE] transition-opacity select-none ${
                            !isProbChecked ? 'opacity-50 bg-[#E8E8E8]' : ''
                          }`
                    }
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {onToggleProblem && (
                        <input
                          type="checkbox"
                          checked={isProbChecked}
                          onChange={() => onToggleProblem(p.code)}
                          title={`Tick để chấm bài ${p.code} (bỏ tick để tắt chấm)`}
                          className="cursor-pointer w-3.5 h-3.5 text-blue-600 rounded border-neutral-300"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProblemConfig?.(p.code);
                        }}
                        title={`Bấm vào để cấu hình, chỉnh sửa bài ${p.code} và bộ test`}
                        className={`font-semibold cursor-pointer focus:outline-none hover:underline ${
                          isApple ? 'text-neutral-900 hover:text-[#0071E3]' : 'font-bold text-[#003366] hover:text-[#0055EA]'
                        }`}
                      >
                        {p.code}
                      </button>
                    </div>
                    <div
                      onClick={() => onOpenProblemConfig?.(p.code)}
                      title={`Bấm vào để cấu hình, chỉnh sửa bài ${p.code}`}
                      className="text-[10px] text-neutral-400 font-normal cursor-pointer hover:underline"
                    >
                      ({p.points}đ)
                      {!isProbChecked && <span className="ml-1 text-rose-500 font-medium">(tắt)</span>}
                    </div>
                  </th>
                );
              })}

              {/* Tổng điểm Header */}
              <th
                className={
                  isApple
                    ? 'py-2 px-4 text-right border-b border-black/[0.06] min-w-[100px]'
                    : 'py-1 px-3 text-right border-t border-l border-white border-r border-b border-[#999999] min-w-[100px] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE]'
                }
              >
                Tổng điểm
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={isApple ? 'text-[12px] font-sans divide-y divide-black/[0.04]' : 'text-[12px] font-sans'}>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={contest.problems.length + 3}
                  className="py-12 text-center text-neutral-400 text-xs italic bg-white"
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
                    className={
                      isApple
                        ? `cursor-pointer transition-colors group ${
                            !isStudentChecked ? 'opacity-50' : ''
                          } ${
                            isSelected
                              ? '!bg-[#0071E3]/[0.08]'
                              : 'hover:bg-[#0071E3]/[0.03]'
                          }`
                        : `cursor-pointer transition-colors group ${
                            !isStudentChecked ? 'opacity-60 bg-[#FAFAFA]' : ''
                          } ${
                            isSelected
                              ? '!bg-[#CCE8FF] text-black font-medium'
                              : index % 2 === 1
                              ? 'bg-[#F9FAFB] hover:bg-[#EDF5FD]'
                              : 'bg-white hover:bg-[#EDF5FD]'
                          }`
                    }
                  >
                    {/* STT with Checkbox */}
                    <td
                      className={
                        isApple
                          ? 'py-2 px-2 text-center text-neutral-400 font-mono text-[11px]'
                          : 'py-1 px-1.5 text-center text-slate-500 border-r border-b border-[#E0E0E0] font-mono text-[11px] bg-[#F7F7F7] group-hover:bg-[#EDF5FD] transition-colors'
                      }
                    >
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
                            className="cursor-pointer w-3.5 h-3.5 text-blue-600 rounded border-neutral-300"
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
                      className={
                        isApple
                          ? 'py-2 px-4 font-medium text-neutral-900 cursor-pointer hover:underline hover:text-[#0071E3] transition-colors'
                          : 'py-1 px-3 border-r border-b border-[#E0E0E0] font-semibold text-[#003366] cursor-pointer hover:underline hover:text-[#0055EA] hover:bg-[#D4E8FF] transition-colors'
                      }
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
                          className={
                            isApple
                              ? 'py-2 px-2 text-center font-mono text-[11px] cursor-pointer hover:bg-[#0071E3]/[0.06] transition-colors'
                              : `py-1 px-2 text-center border-r border-b border-[#E0E0E0] font-mono text-[11px] cursor-pointer hover:bg-[#D4E8FF] hover:underline transition-colors ${
                                  !willBeJudged
                                    ? 'text-slate-400'
                                    : !hasSubmitted
                                    ? 'text-slate-400 hover:text-slate-800'
                                    : !isGraded || score === undefined
                                    ? 'text-slate-400'
                                    : score === prob.points
                                    ? 'text-[#008000] font-bold'
                                    : score > 0
                                    ? 'text-[#0000CC] font-bold'
                                    : 'text-[#CC0000] font-bold'
                                }`
                          }
                        >
                          {isApple ? (
                            isGraded && score !== undefined ? (
                              <span
                                className={`inline-flex items-center justify-center min-w-[38px] px-2 py-0.5 rounded-full text-[11px] font-semibold transition-transform hover:scale-105 ${
                                  score === prob.points
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                    : score > 0
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                                }`}
                              >
                                {score.toFixed(1)}
                              </span>
                            ) : (
                              ''
                            )
                          ) : (
                            isGraded && score !== undefined ? score.toFixed(1) : ''
                          )}
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td
                      className={
                        isApple
                          ? 'py-2 px-4 text-right font-mono font-semibold text-[13px] text-neutral-900'
                          : 'py-1 px-3 text-right border-r border-b border-[#E0E0E0] font-mono font-bold text-[12px] text-[#003366]'
                      }
                    >
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
