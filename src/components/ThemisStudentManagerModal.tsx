import React, { useState, useEffect } from 'react';
import { Users, Search, Edit2, Trash2, RotateCcw, Plus, Check, X } from 'lucide-react';
import { Contest, Submission } from '../types';
import { calculateScoreboard, ScoreboardRow } from '../utils/csvExporter';

interface ThemisStudentManagerModalProps {
  isOpen: boolean;
  contest: Contest | null;
  submissions: Submission[];
  onClose: () => void;
  onRenameStudent: (oldName: string, newName: string) => Promise<void>;
  onDeleteStudent: (studentName: string) => Promise<void>;
  onRejudgeStudent: (studentName: string) => void;
  onAddStudent: (studentName: string) => void;
  onClearAllStudents: () => Promise<void>;
  initialStudentName?: string | null;
}

export const ThemisStudentManagerModal: React.FC<ThemisStudentManagerModalProps> = ({
  isOpen,
  contest,
  submissions,
  onClose,
  onRenameStudent,
  onDeleteStudent,
  onRejudgeStudent,
  onAddStudent,
  onClearAllStudents,
  initialStudentName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [newNameInput, setNewNameInput] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [showAddBox, setShowAddBox] = useState(false);

  useEffect(() => {
    if (isOpen && initialStudentName) {
      setSearchTerm(initialStudentName);
      setEditingStudent(initialStudentName);
      setNewNameInput(initialStudentName);
    } else if (isOpen && !initialStudentName) {
      setSearchTerm('');
      setEditingStudent(null);
    }
  }, [isOpen, initialStudentName]);

  if (!isOpen || !contest) return null;

  const rows: ScoreboardRow[] = calculateScoreboard(contest, submissions);
  const filtered = rows.filter((r) =>
    r.contestantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRename = (name: string) => {
    setEditingStudent(name);
    setNewNameInput(name);
  };

  const submitRename = async () => {
    if (!editingStudent || !newNameInput.trim() || editingStudent === newNameInput.trim()) {
      setEditingStudent(null);
      return;
    }
    await onRenameStudent(editingStudent, newNameInput.trim());
    setEditingStudent(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    onAddStudent(newStudentName.trim());
    setNewStudentName('');
    setShowAddBox(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      {/* Windows Dialog Frame */}
      <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] max-w-4xl w-full flex flex-col max-h-[88vh] overflow-hidden text-xs font-sans">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shadow-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-bold text-[12px] tracking-wide">
              Themis - Quản lý danh sách Thí sinh & Học sinh ({contest.title})
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition"
          >
            ✕
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-3 space-y-3 flex flex-col flex-1 overflow-hidden">
          {/* Top Actions & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white border border-[#808080] win-border-inset">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">Tìm kiếm:</span>
              <div className="flex items-center bg-white border border-[#7F9DB9] px-2 py-0.5">
                <Search className="w-3 h-3 text-slate-400 mr-1" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập tên học sinh..."
                  className="bg-transparent text-black text-[11px] focus:outline-none w-36"
                />
              </div>
              <span className="text-[11px] text-slate-500">
                Tổng cộng: <strong className="text-black">{rows.length}</strong> học sinh
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddBox(!showAddBox)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-bold shadow-[1px_1px_0_#404040] transition active:translate-y-px"
              >
                <Plus className="w-3.5 h-3.5 text-blue-700" />
                <span>Thêm học sinh</span>
              </button>

              {rows.length > 0 && (
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        'Bạn có chắc chắn muốn xóa TOÀN BỘ học sinh và bài nộp trong kỳ thi này không?'
                      )
                    ) {
                      await onClearAllStudents();
                    }
                  }}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#FFF5F5] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-rose-700 rounded-none font-bold text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Xóa tất cả</span>
                </button>
              )}
            </div>
          </div>

          {/* Add Student Box */}
          {showAddBox && (
            <form
              onSubmit={handleAddSubmit}
              className="flex items-center space-x-2 p-2 bg-[#EAF3FB] border border-[#70C0E7]"
            >
              <span className="font-semibold text-[#003366]">Tên học sinh mới:</span>
              <input
                type="text"
                required
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="px-2 py-1 bg-white border border-[#7F9DB9] text-black w-48 text-[11px] font-sans"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#0078D7] hover:bg-[#106EBE] text-white font-semibold rounded-sm shadow-sm"
              >
                Lưu học sinh
              </button>
              <button
                type="button"
                onClick={() => setShowAddBox(false)}
                className="px-2 py-1 bg-white border border-[#808080] text-slate-700 rounded-sm"
              >
                Hủy
              </button>
            </form>
          )}

          {/* Students Table */}
          <div className="flex-1 overflow-y-auto bg-white border border-[#808080] win-border-inset">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#ECE9D8] text-[#1E1E1E] font-semibold text-[11px] border-b border-[#B0B0B0]">
                <tr>
                  <th className="py-1 px-2 w-10 text-center border-r border-[#D0D0D0]">STT</th>
                  <th className="py-1 px-3 border-r border-[#D0D0D0] min-w-[200px]">
                    Tên Học sinh / Thí sinh
                  </th>
                  <th className="py-1 px-2 text-center border-r border-[#D0D0D0] w-28">
                    Số bài đã nộp
                  </th>
                  {contest.problems.map((p) => (
                    <th key={p.id} className="py-1 px-2 text-center border-r border-[#D0D0D0] w-20">
                      {p.code}
                    </th>
                  ))}
                  <th className="py-1 px-3 text-right border-r border-[#D0D0D0] w-24">
                    Tổng điểm
                  </th>
                  <th className="py-1 px-2 text-center w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[12px]">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={contest.problems.length + 5}
                      className="py-10 text-center text-slate-400 italic"
                    >
                      {rows.length === 0
                        ? 'Chưa có học sinh nào trong danh sách. Hãy nạp folder học sinh hoặc bấm "Thêm học sinh".'
                        : 'Không tìm thấy học sinh nào phù hợp từ khóa tìm kiếm.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => {
                    const submittedCount = contest.problems.filter(
                      (p) =>
                        row.problemScores[p.code] !== undefined &&
                        submissions.some(
                          (s) =>
                            s.contestantName.toLowerCase() === row.contestantName.toLowerCase() &&
                            s.problemCode === p.code
                        )
                    ).length;

                    const isEditing = editingStudent === row.contestantName;

                    return (
                      <tr key={row.contestantName} className="hover:bg-[#F9FAFB]">
                        <td className="py-1 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-[#EAEAEA]">
                          {idx + 1}
                        </td>

                        {/* Student Name & Rename in-place */}
                        <td className="py-1 px-3 font-semibold text-black border-r border-[#EAEAEA]">
                          {isEditing ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="text"
                                value={newNameInput}
                                onChange={(e) => setNewNameInput(e.target.value)}
                                className="px-1.5 py-0.5 bg-white border border-[#0078D7] text-black text-xs font-semibold w-full focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') submitRename();
                                  if (e.key === 'Escape') setEditingStudent(null);
                                }}
                              />
                              <button
                                onClick={submitRename}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Lưu tên"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingStudent(null)}
                                className="p-0.5 text-rose-600 hover:bg-rose-50 rounded"
                                title="Hủy"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <span className="font-semibold text-[#003366]">
                                {row.contestantName}
                              </span>
                              <button
                                onClick={() => startRename(row.contestantName)}
                                title="Đổi tên học sinh này"
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-[#0078D7] transition"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Submitted count */}
                        <td className="py-1 px-2 text-center font-mono text-[11px] border-r border-[#EAEAEA]">
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold ${
                              submittedCount === contest.problems.length
                                ? 'text-emerald-700 bg-emerald-50'
                                : submittedCount > 0
                                ? 'text-blue-700 bg-blue-50'
                                : 'text-slate-400'
                            }`}
                          >
                            {submittedCount} / {contest.problems.length}
                          </span>
                        </td>

                        {/* Problem scores */}
                        {contest.problems.map((prob) => {
                          const score = row.problemScores[prob.code];
                          const isGraded = row.problemGraded?.[prob.code] ?? (score !== undefined);
                          const hasSub = submissions.some(
                            (s) =>
                              s.contestantName.toLowerCase() === row.contestantName.toLowerCase() &&
                              s.problemCode === prob.code
                          );
                          return (
                            <td
                              key={prob.id}
                              className="py-1 px-2 text-center font-mono text-[11px] border-r border-[#EAEAEA]"
                            >
                              {!hasSub || !isGraded || score === undefined ? (
                                <span className="text-slate-300">-</span>
                              ) : score === prob.points ? (
                                <span className="text-[#008000] font-bold">{score.toFixed(1)}</span>
                              ) : score > 0 ? (
                                <span className="text-[#0000CC] font-bold">{score.toFixed(1)}</span>
                              ) : (
                                <span className="text-[#CC0000] font-bold">{score.toFixed(1)}</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Total Score */}
                        <td className="py-1 px-3 text-right font-mono font-bold text-[12px] text-[#003366] border-r border-[#EAEAEA]">
                          {row.hasAnyGraded ? row.totalScore.toFixed(2) : '-'}
                        </td>

                        {/* Actions */}
                        <td className="py-1 px-2 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => startRename(row.contestantName)}
                              title="Đổi tên học sinh"
                              className="p-1 text-slate-500 hover:text-[#0078D7] hover:bg-[#E5F1FB] rounded transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onRejudgeStudent(row.contestantName)}
                              title="Chấm lại các bài của học sinh này"
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    `Bạn có chắc chắn muốn xóa học sinh "${row.contestantName}" và toàn bộ bài nộp của em này?`
                                  )
                                ) {
                                  await onDeleteStudent(row.contestantName);
                                }
                              }}
                              title="Xóa học sinh này khỏi kỳ thi"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Dialog Bottom */}
          <div className="flex justify-end pt-2 border-t border-[#D0D0D0]">
            <button
              onClick={onClose}
              className="px-6 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] text-black rounded-none font-bold shadow-[1px_1px_0_#404040] transition active:translate-y-px"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
