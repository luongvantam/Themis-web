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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-4xl w-full flex flex-col max-h-[88vh] overflow-hidden text-xs text-neutral-800 dark:text-neutral-100 font-sans transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Quản lý danh sách Thí sinh & Học sinh
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

        {/* Dialog Content */}
        <div className="p-5 space-y-3.5 flex flex-col flex-1 overflow-hidden">
          {/* Top Search & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm học sinh..."
                className="pl-8 pr-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-neutral-900 dark:text-white text-[12px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 transition-all"
              />
              <span className="ml-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                Tổng số: <strong className="text-neutral-800 dark:text-neutral-200">{rows.length}</strong> học sinh
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddBox(!showAddBox)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl font-medium shadow-sm active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl font-medium text-[11px] active:scale-[0.98] transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa tất cả</span>
                </button>
              )}
            </div>
          </div>

          {/* Add Student Box */}
          {showAddBox && (
            <form
              onSubmit={handleAddSubmit}
              className="flex items-center space-x-2 p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl animate-in fade-in"
            >
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Tên học sinh mới:</span>
              <input
                type="text"
                required
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="px-3 py-1.5 bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-lg text-neutral-900 dark:text-white w-60 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-lg text-xs shadow-sm transition"
              >
                Lưu học sinh
              </button>
              <button
                type="button"
                onClick={() => setShowAddBox(false)}
                className="px-3 py-1.5 bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs transition"
              >
                Hủy
              </button>
            </form>
          )}

          {/* Table */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1A1A1E]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-neutral-50/90 dark:bg-[#242428]/90 backdrop-blur-md text-neutral-600 dark:text-neutral-400 font-medium text-[11px] border-b border-black/[0.06] dark:border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Tên Học sinh / Thí sinh</th>
                  <th className="py-2.5 px-2 text-center w-28">Số bài đã nộp</th>
                  {contest.problems.map((p) => (
                    <th key={p.id} className="py-2.5 px-2 text-center w-20">
                      {p.code}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right w-24">Tổng điểm</th>
                  <th className="py-2.5 px-2 text-center w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[12px]">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={contest.problems.length + 5}
                      className="py-12 text-center text-neutral-400 italic"
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
                      <tr
                        key={row.contestantName}
                        className="hover:bg-neutral-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-2 px-3 text-center text-neutral-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-white">
                          {isEditing ? (
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                value={newNameInput}
                                onChange={(e) => setNewNameInput(e.target.value)}
                                className="px-2 py-1 bg-white dark:bg-[#2C2C2E] border border-blue-500 rounded-lg text-neutral-900 dark:text-white text-xs font-semibold w-full focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') submitRename();
                                  if (e.key === 'Escape') setEditingStudent(null);
                                }}
                              />
                              <button
                                onClick={submitRename}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Lưu tên"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingStudent(null)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Hủy"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <span className="font-medium text-neutral-900 dark:text-white">
                                {row.contestantName}
                              </span>
                              <button
                                onClick={() => startRename(row.contestantName)}
                                title="Đổi tên học sinh này"
                                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-blue-600 rounded-lg transition"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-2 px-2 text-center font-mono text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium ${
                              submittedCount === contest.problems.length
                                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300'
                                : submittedCount > 0
                                ? 'text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300'
                                : 'text-neutral-400'
                            }`}
                          >
                            {submittedCount} / {contest.problems.length}
                          </span>
                        </td>

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
                              className="py-2 px-2 text-center font-mono text-[11px]"
                            >
                              {!hasSub || !isGraded || score === undefined ? (
                                <span className="text-neutral-300 dark:text-neutral-600">-</span>
                              ) : score === prob.points ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {score.toFixed(1)}
                                </span>
                              ) : score > 0 ? (
                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                  {score.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400 font-bold">
                                  {score.toFixed(1)}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-2 px-3 text-right font-mono font-bold text-[13px] text-neutral-900 dark:text-white">
                          {row.hasAnyGraded ? row.totalScore.toFixed(2) : '-'}
                        </td>

                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => startRename(row.contestantName)}
                              title="Đổi tên học sinh"
                              className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onRejudgeStudent(row.contestantName)}
                              title="Chấm lại các bài của học sinh này"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
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
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
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

          {/* Bottom button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 font-medium rounded-xl text-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
