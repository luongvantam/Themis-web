import React, { useState } from 'react';
import { Search, Trophy, Edit2, Trash2, Users, Filter } from 'lucide-react';
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
  onOpenStudentManager?: () => void;
  onOpenSelectiveJudgeModal?: () => void;
  onToggleStudent?: (name: string) => void;
  onToggleAllStudents?: () => void;
  onToggleProblem?: (code: string) => void;
  onRenameStudent?: (oldName: string, newName: string) => Promise<void>;
  onDeleteStudent?: (studentName: string) => Promise<void>;
}

export const ThemisScoreboardGrid: React.FC<ThemisScoreboardGridProps> = ({
  contest,
  submissions,
  selectedStudentNames,
  selectedProblemCodes,
  onSelectSubmissionDetail,
  onOpenStudentManager,
  onOpenSelectiveJudgeModal,
  onToggleStudent,
  onToggleAllStudents,
  onToggleProblem,
  onRenameStudent,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  if (!contest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F0F0F0] text-slate-500 text-xs border border-[#808080] win-border-inset">
        <div className="text-sm font-semibold text-slate-700 mb-1">Chưa mở kỳ thi nào</div>
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

  const handleInlineRename = async (oldName: string) => {
    const newName = prompt(`Nhập tên mới cho học sinh "${oldName}":`, oldName);
    if (newName && newName.trim() && newName.trim() !== oldName && onRenameStudent) {
      await onRenameStudent(oldName, newName.trim());
    }
  };

  const handleInlineDelete = async (name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${name}" và toàn bộ bài nộp của em này?`)) {
      if (onDeleteStudent) {
        await onDeleteStudent(name);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] border border-[#808080] win-border-inset overflow-hidden text-xs select-none">
      {/* Table Sub-header / Filter */}
      <div className="px-2 py-1 bg-[#F0F0F0] border-b border-[#D0D0D0] flex items-center justify-between text-[11px] text-slate-700">
        <div className="flex items-center space-x-2">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold text-[#003366] uppercase">
            Bảng kết quả chấm ({contest.title})
          </span>
          <span className="text-slate-500">
            — {rows.length} thí sinh &bull; {contest.problems.length} bài toán
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenSelectiveJudgeModal && (
            <button
              type="button"
              onClick={onOpenSelectiveJudgeModal}
              title="Mở bảng tuỳ chọn chỉ chấm cho bài nào hoặc thí sinh nào"
              className={`flex items-center space-x-1 px-2 py-0.5 border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white rounded-none font-semibold text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px ${
                selectedStudentNames &&
                (selectedStudentNames.size < rows.length ||
                  (selectedProblemCodes && selectedProblemCodes.size < contest.problems.length))
                  ? 'bg-[#FFF8E7] hover:bg-[#FFEFC4] text-[#B78103]'
                  : 'bg-[#ECE9D8] hover:bg-[#F5F4EB] text-slate-900'
              }`}
            >
              <Filter className="w-3 h-3 text-amber-700" />
              <span>
                Lọc chấm ({selectedStudentNames ? selectedStudentNames.size : rows.length}/{rows.length} người &bull;{' '}
                {selectedProblemCodes ? selectedProblemCodes.size : contest.problems.length}/{contest.problems.length} bài)
              </span>
            </button>
          )}

          {onOpenStudentManager && (
            <button
              onClick={onOpenStudentManager}
              title="Mở bảng quản lý đổi tên, xóa học sinh"
              className="flex items-center space-x-1.5 px-2 py-0.5 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-semibold text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px"
            >
              <Users className="w-3.5 h-3.5 text-indigo-700" />
              <span>Quản lý Thí sinh ({rows.length})</span>
            </button>
          )}

          <div className="flex items-center space-x-1">
            <span className="text-slate-600">Lọc:</span>
            <div className="flex items-center bg-white border border-[#7F9DB9] px-1.5 py-0.5 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)]">
              <Search className="w-3 h-3 text-slate-400 mr-1" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên..."
                className="bg-transparent text-black text-[11px] focus:outline-none w-24 font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Windows DataGridView Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          {/* Windows 3D Column Header */}
          <thead className="sticky top-0 z-10 select-none shadow-sm font-semibold text-[#1E1E1E]">
            <tr className="bg-[#ECE9D8] text-[11px]">
              {/* STT Header with Master Checkbox */}
              <th className="py-1 px-1.5 w-14 text-center border-t border-l border-white border-r border-b border-[#999999] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE]">
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
                      className="cursor-pointer w-3 h-3 text-blue-600 rounded border-slate-300"
                    />
                  )}
                  <span>STT</span>
                </div>
              </th>
              {/* Thí sinh Header */}
              <th className="py-1 px-3 border-t border-l border-white border-r border-b border-[#999999] min-w-[180px] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE]">
                Thí sinh
              </th>
              {/* Problem Headers */}
              {contest.problems.map((p) => {
                const isProbChecked = !selectedProblemCodes || selectedProblemCodes.has(p.code.toUpperCase());
                return (
                  <th
                    key={p.id}
                    className={`py-1 px-2 text-center border-t border-l border-white border-r border-b border-[#999999] min-w-[90px] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE] transition-opacity ${
                      !isProbChecked ? 'opacity-50 bg-[#E8E8E8]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {onToggleProblem && (
                        <input
                          type="checkbox"
                          checked={isProbChecked}
                          onChange={() => onToggleProblem(p.code)}
                          title={`Tick để chấm bài ${p.code} (bỏ tick để tắt chấm)`}
                          className="cursor-pointer w-3 h-3 text-blue-600 rounded border-slate-300"
                        />
                      )}
                      <span className="font-bold text-[#003366]">{p.code}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      ({p.points}đ)
                      {!isProbChecked && <span className="ml-1 text-rose-600 font-bold">(tắt)</span>}
                    </div>
                  </th>
                );
              })}
              {/* Tổng điểm Header */}
              <th className="py-1 px-3 text-right border-t border-l border-white border-r border-b border-[#999999] min-w-[100px] bg-gradient-to-b from-[#FAF8F5] to-[#E3DFCE]">
                Tổng điểm
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="text-[12px] font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={contest.problems.length + 3}
                  className="py-10 text-center text-slate-500 text-xs italic bg-white"
                >
                  {rows.length === 0
                    ? 'Chưa có dữ liệu bài nộp. Hãy bấm "Nạp folder Học sinh" hoặc "Bắt đầu chấm".'
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
                      !isStudentChecked ? 'opacity-60 bg-[#FAFAFA]' : ''
                    } ${
                      isSelected
                        ? '!bg-[#CCE8FF] text-black font-medium'
                        : index % 2 === 1
                        ? 'bg-[#F9FAFB] hover:bg-[#EDF5FD]'
                        : 'bg-white hover:bg-[#EDF5FD]'
                    }`}
                  >
                    {/* STT with Checkbox */}
                    <td className="py-1 px-1.5 text-center text-slate-500 border-r border-b border-[#E0E0E0] font-mono text-[11px] bg-[#F7F7F7]">
                      <div className="flex items-center justify-center space-x-1">
                        {onToggleStudent && (
                          <input
                            type="checkbox"
                            checked={isStudentChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              onToggleStudent(row.contestantName);
                            }}
                            title={`Tick để chấm cho thí sinh ${row.contestantName} (bỏ tick để không chấm)`}
                            className="cursor-pointer w-3 h-3 text-blue-600 rounded border-slate-300"
                          />
                        )}
                        <span>{index + 1}</span>
                      </div>
                    </td>

                    {/* Contestant Name with inline quick actions */}
                    <td className="py-1 px-3 border-r border-b border-[#E0E0E0] font-semibold text-[#000000]">
                      <div className="flex items-center justify-between">
                        <span className="truncate flex items-center space-x-1">
                          <span>{row.contestantName}</span>
                          {!isStudentChecked && (
                            <span className="text-[10px] font-normal text-rose-500 italic">
                              (bỏ qua)
                            </span>
                          )}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInlineRename(row.contestantName);
                            }}
                            title={`Đổi tên học sinh "${row.contestantName}"`}
                            className="p-0.5 text-slate-400 hover:text-[#0078D7] rounded transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInlineDelete(row.contestantName);
                            }}
                            title={`Xóa học sinh "${row.contestantName}"`}
                            className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Problem Scores */}
                    {contest.problems.map((prob) => {
                      const isProbChecked = !selectedProblemCodes || selectedProblemCodes.has(prob.code.toUpperCase());
                      const willBeJudged = isStudentChecked && isProbChecked;
                      const score = row.problemScores[prob.code];
                      const hasSubmitted = submissions.some(
                        (s) => s.contestantName === row.contestantName && s.problemCode === prob.code
                      );
                      const isGraded = hasSubmitted && score !== undefined && score !== null;

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
                              ? `Bài này sẽ BỎ QUA khi bấm Chấm bài (do ${!isStudentChecked ? 'thí sinh' : 'bài toán'} đang tắt tick)`
                              : hasSubmitted
                              ? `Nhấn để xem / sửa bài làm ${prob.code} của ${row.contestantName}`
                              : `Chưa nộp bài ${prob.code}. Nhấn để xem chẩn đoán file!`
                          }
                          className={`py-1 px-2 text-center border-r border-b border-[#E0E0E0] font-mono text-[11px] cursor-pointer hover:underline ${
                            !willBeJudged
                              ? 'bg-[#F3F4F6] text-slate-400'
                              : !hasSubmitted
                              ? 'text-slate-400 hover:text-slate-700 bg-slate-50'
                              : !isGraded
                              ? 'text-amber-600 font-bold'
                              : score === prob.points
                              ? 'text-[#008000] font-bold'
                              : score > 0
                              ? 'text-[#0000CC] font-bold'
                              : 'text-[#CC0000] font-bold'
                          }`}
                        >
                          {isGraded ? score.toFixed(1) : hasSubmitted ? '?' : '-'}
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td className="py-1 px-3 text-right border-r border-b border-[#E0E0E0] font-mono font-bold text-[12px] text-[#003366]">
                      {row.totalScore.toFixed(2)}
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
