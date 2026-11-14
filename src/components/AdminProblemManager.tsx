import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, FileArchive, CheckCircle2, AlertCircle, 
  FolderOpen, Sliders, Save, Eye
} from 'lucide-react';
import { Contest, Problem, TestCase } from '../types';
import { parseThemisZip, parseThemisTaskFolder } from '../utils/zipParser';

interface AdminProblemManagerProps {
  contest: Contest;
  onUpdateContest: (updated: Contest) => void;
  initialProblemCode?: string | null;
}

export const AdminProblemManager: React.FC<AdminProblemManagerProps> = ({
  contest,
  onUpdateContest,
  initialProblemCode,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Manual problem creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(1000);
  const [newMemoryLimit, setNewMemoryLimit] = useState(256);
  const [newIoMode, setNewIoMode] = useState<'STANDARD' | 'FILE'>('FILE');

  // Problem & Test Case Editor state
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);

  useEffect(() => {
    if (initialProblemCode) {
      const found = contest.problems.find(
        (p) => p.code.toUpperCase() === initialProblemCode.toUpperCase()
      );
      if (found) {
        setEditingProblem(found);
      }
    }
  }, [initialProblemCode, contest.problems]);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const { contestTitle, problems, warnings } = await parseThemisTaskFolder(files);

      if (problems.length === 0) {
        setStatusMsg({
          type: 'error',
          text: 'Không tìm thấy bộ test hợp lệ trong thư mục. Cấu trúc chuẩn: TASK/Test01/TASK.INP & TASK.OUT.',
        });
        return;
      }

      const updatedProblems = [...contest.problems];
      for (const p of problems) {
        const existingIdx = updatedProblems.findIndex((ep) => ep.code === p.code);
        if (existingIdx >= 0) {
          updatedProblems[existingIdx] = p;
        } else {
          updatedProblems.push(p);
        }
      }

      onUpdateContest({
        ...contest,
        title: contestTitle || contest.title,
        problems: updatedProblems,
      });

      setStatusMsg({
        type: 'success',
        text: `Đã nạp thành công ${problems.length} bài thi từ thư mục! ${
          warnings.length > 0 ? `(${warnings.join(', ')})` : ''
        }`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Lỗi đọc thư mục: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const { contestTitle, problems, warnings } = await parseThemisZip(file);

      if (problems.length === 0) {
        setStatusMsg({
          type: 'error',
          text: 'Không tìm thấy bộ test hợp lệ trong file zip. Hãy kiểm tra cấu trúc thư mục.',
        });
        return;
      }

      const updatedProblems = [...contest.problems];
      for (const p of problems) {
        const existingIdx = updatedProblems.findIndex((ep) => ep.code === p.code);
        if (existingIdx >= 0) {
          updatedProblems[existingIdx] = p;
        } else {
          updatedProblems.push(p);
        }
      }

      onUpdateContest({
        ...contest,
        title: contestTitle || contest.title,
        problems: updatedProblems,
      });

      setStatusMsg({
        type: 'success',
        text: `Đã nạp thành công ${problems.length} bài thi từ file zip! ${
          warnings.length > 0 ? `(${warnings.join(', ')})` : ''
        }`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Lỗi đọc file zip: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleCreateManualProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;

    const code = newCode.trim().toUpperCase();
    const newProblem: Problem = {
      id: `prob-${code}-${Date.now()}`,
      code,
      title: newTitle.trim(),
      timeLimitMs: newTimeLimit,
      memoryLimitMb: newMemoryLimit,
      ioMode: newIoMode,
      fileInpName: `${code}.INP`,
      fileOutName: `${code}.OUT`,
      testCases: [
        {
          id: `tc-${code}-1`,
          name: 'Test01',
          input: '1 2\n',
          output: '3\n',
          score: 10,
        },
      ],
      points: 10,
    };

    onUpdateContest({
      ...contest,
      problems: [...contest.problems, newProblem],
    });

    setShowAddModal(false);
    setNewCode('');
    setNewTitle('');
    setStatusMsg({
      type: 'success',
      text: `Đã tạo bài tập ${code} thành công.`,
    });
  };

  const handleDeleteProblem = (problemId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài thi này khỏi kỳ thi?')) {
      onUpdateContest({
        ...contest,
        problems: contest.problems.filter((p) => p.id !== problemId),
      });
    }
  };

  /**
   * Updates points equally among all test cases
   */
  const handleDistributePointsEqually = () => {
    if (!editingProblem || editingProblem.testCases.length === 0) return;
    const count = editingProblem.testCases.length;
    const ptPerTest = Number((editingProblem.points / count).toFixed(2));

    const updatedTests = editingProblem.testCases.map((tc) => ({
      ...tc,
      score: ptPerTest,
    }));

    setEditingProblem({
      ...editingProblem,
      testCases: updatedTests,
    });
  };

  /**
   * Saves the edited problem back to the contest
   */
  const handleSaveProblemEdit = () => {
    if (!editingProblem) return;

    const updatedProblems = contest.problems.map((p) =>
      p.id === editingProblem.id ? editingProblem : p
    );

    onUpdateContest({
      ...contest,
      problems: updatedProblems,
    });

    setStatusMsg({
      type: 'success',
      text: `Đã lưu cập nhật cho bài toán ${editingProblem.code} thành công!`,
    });
    setEditingProblem(null);
  };

  /**
   * Adds a new test case to editing problem
   */
  const handleAddTestCase = () => {
    if (!editingProblem) return;
    const idx = editingProblem.testCases.length + 1;
    const name = `Test${idx.toString().padStart(2, '0')}`;
    const newTest: TestCase = {
      id: `tc-${editingProblem.code}-${Date.now()}`,
      name,
      input: '',
      output: '',
      score: 1.0,
    };

    setEditingProblem({
      ...editingProblem,
      testCases: [...editingProblem.testCases, newTest],
    });
  };

  /**
   * Deletes a test case from editing problem
   */
  const handleDeleteTestCase = (testId: string) => {
    if (!editingProblem) return;
    setEditingProblem({
      ...editingProblem,
      testCases: editingProblem.testCases.filter((tc) => tc.id !== testId),
    });
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white border border-[#808080] win-border-inset">
        <div>
          <h4 className="font-bold text-[#003366] text-xs">Danh sách các bài toán trong đề</h4>
          <p className="text-[11px] text-slate-500">
            Kỳ thi: <strong>{contest.title}</strong> &bull; Tổng số: {contest.problems.length} bài
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Folder input */}
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderUpload}
            className="hidden"
          />
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-[#004080] font-bold rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>{isLoading ? 'Đang đọc...' : 'Nạp folder Đề & Test'}</span>
          </button>

          {/* Zip input */}
          <input
            type="file"
            ref={zipInputRef}
            onChange={handleZipUpload}
            accept=".zip"
            className="hidden"
          />
          <button
            onClick={() => zipInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 font-semibold rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px"
          >
            <FileArchive className="w-3.5 h-3.5 text-amber-700" />
            <span>Nạp Zip Đề</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 font-semibold rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px"
          >
            <Plus className="w-3.5 h-3.5 text-[#0078D7]" />
            <span>Thêm bài thủ công</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center space-x-2 p-2 text-[11px] border ${
            statusMsg.type === 'success'
              ? 'bg-[#EAF5EA] border-[#A3D7A3] text-[#008000]'
              : 'bg-[#FDE8E8] border-[#F87171] text-[#CC0000]'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Problem Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contest.problems.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-slate-500 text-xs bg-white border border-[#808080] win-border-inset italic">
            Chưa có bài thi nào trong kỳ thi này. Hãy nạp thư mục test case (VD: thư mục chứa CHUYENDE, MAVE...) hoặc nạp file .zip.
          </div>
        ) : (
          contest.problems.map((prob) => (
            <div
              key={prob.id}
              className="bg-white p-3 border border-[#808080] win-border-inset space-y-2 hover:border-[#0078D7] transition shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-[#E5F1FB] text-[#005A9E] font-mono font-bold text-xs rounded border border-[#70C0E7]">
                    {prob.code}
                  </span>
                  <h3 className="font-bold text-xs text-black">{prob.title}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingProblem({ ...prob, testCases: [...prob.testCases] })}
                    title="Chỉnh sửa thông số, điểm test và nội dung test cases"
                    className="flex items-center space-x-1 px-2 py-0.5 bg-[#EAF3FB] hover:bg-[#D5E8F8] text-[#005A9E] rounded border border-[#70C0E7] text-[11px] font-semibold transition"
                  >
                    <Sliders className="w-3 h-3 text-[#0078D7]" />
                    <span>Sửa bài & Điểm</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProblem(prob.id)}
                    title="Xóa bài thi này"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-slate-600">
                <div className="bg-[#F8F8F8] p-1.5 border border-[#E0E0E0]">
                  <span className="block text-[10px] text-slate-400 uppercase">Thời gian</span>
                  <span className="text-black font-semibold">{prob.timeLimitMs}ms</span>
                </div>
                <div className="bg-[#F8F8F8] p-1.5 border border-[#E0E0E0]">
                  <span className="block text-[10px] text-slate-400 uppercase">Bộ nhớ</span>
                  <span className="text-black font-semibold">{prob.memoryLimitMb}MB</span>
                </div>
                <div className="bg-[#F8F8F8] p-1.5 border border-[#E0E0E0]">
                  <span className="block text-[10px] text-slate-400 uppercase">Số Tests</span>
                  <span className="text-[#008000] font-bold">{prob.testCases.length}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-[#F0F0F0]">
                <span>
                  I/O: <strong className="text-black font-mono">{prob.ioMode === 'FILE' ? `${prob.code}.INP` : 'Standard I/O'}</strong>
                </span>
                <span>
                  Tổng điểm: <strong className="text-[#003366] font-mono font-bold">{prob.points}đ</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: Powerful Problem & Test Cases Editor */}
      {editingProblem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-xs">
            {/* Title Bar */}
            <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shadow-sm">
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-bold text-[12px]">
                  Themis - Chỉnh sửa thông số & Điểm test: {editingProblem.code}
                </span>
              </div>
              <button
                onClick={() => setEditingProblem(null)}
                className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 overflow-y-auto flex-1 space-y-3 bg-[#F5F6F7]">
              {/* Problem Parameters Box */}
              <div className="bg-white p-3 border border-[#808080] win-border-inset space-y-2.5">
                <h5 className="font-bold text-[#003366] text-xs border-b border-[#E0E0E0] pb-1">
                  1. Thông số giới hạn & Chế độ nộp bài
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-0.5">Mã bài (Code):</label>
                    <input
                      type="text"
                      value={editingProblem.code}
                      onChange={(e) =>
                        setEditingProblem({ ...editingProblem, code: e.target.value.toUpperCase() })
                      }
                      className="w-full bg-white border border-[#7F9DB9] p-1 font-mono font-bold text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-0.5">Tên bài thi:</label>
                    <input
                      type="text"
                      value={editingProblem.title}
                      onChange={(e) =>
                        setEditingProblem({ ...editingProblem, title: e.target.value })
                      }
                      className="w-full bg-white border border-[#7F9DB9] p-1 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-0.5">Thời gian tối đa (ms):</label>
                    <input
                      type="number"
                      step="100"
                      value={editingProblem.timeLimitMs}
                      onChange={(e) =>
                        setEditingProblem({
                          ...editingProblem,
                          timeLimitMs: Math.max(100, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-[#7F9DB9] p-1 font-mono text-black text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-0.5">Bộ nhớ tối đa (MB):</label>
                    <input
                      type="number"
                      step="32"
                      value={editingProblem.memoryLimitMb}
                      onChange={(e) =>
                        setEditingProblem({
                          ...editingProblem,
                          memoryLimitMb: Math.max(16, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-[#7F9DB9] p-1 font-mono text-black text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 border-t border-[#F0F0F0]">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-0.5">Chế độ I/O:</label>
                    <select
                      value={editingProblem.ioMode}
                      onChange={(e) =>
                        setEditingProblem({
                          ...editingProblem,
                          ioMode: e.target.value as any,
                        })
                      }
                      className="w-full bg-white border border-[#7F9DB9] p-1 text-black"
                    >
                      <option value="FILE">File I/O (Chuẩn Themis: TASK.INP / TASK.OUT)</option>
                      <option value="STANDARD">Standard I/O (stdin / stdout)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-0.5">
                      Tổng điểm bài toán:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingProblem.points}
                      onChange={(e) =>
                        setEditingProblem({
                          ...editingProblem,
                          points: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-[#7F9DB9] p-1 font-mono font-bold text-[#003366] text-right"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleDistributePointsEqually}
                      className="w-full py-1 px-2 bg-[#EAF3FB] hover:bg-[#D5E8F8] text-[#005A9E] border border-[#70C0E7] rounded-sm font-semibold transition active:scale-95 shadow-sm"
                    >
                      Chia đều điểm cho {editingProblem.testCases.length} tests
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Cases Table Box */}
              <div className="bg-white p-3 border border-[#808080] win-border-inset space-y-2">
                <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-1">
                  <div>
                    <h5 className="font-bold text-[#003366] text-xs">
                      2. Danh sách Test Cases ({editingProblem.testCases.length} tests)
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      Tổng điểm hiện tại của các test:{' '}
                      <strong className="text-emerald-700 font-mono">
                        {editingProblem.testCases
                          .reduce((s, t) => s + (Number(t.score) || 0), 0)
                          .toFixed(2)}
                      </strong>{' '}
                      / {editingProblem.points}đ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="flex items-center space-x-1 px-3 py-1 bg-white hover:bg-[#E5F1FB] text-slate-800 border border-[#808080] hover:border-[#70C0E7] rounded-sm font-medium shadow-sm transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0078D7]" />
                    <span>Thêm test case</span>
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto border border-[#D0D0D0]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#ECE9D8] text-[#1E1E1E] font-semibold text-[11px] border-b border-[#B0B0B0]">
                      <tr>
                        <th className="py-1 px-2 w-10 text-center border-r border-[#D0D0D0]">STT</th>
                        <th className="py-1 px-2 w-28 border-r border-[#D0D0D0]">Tên Test</th>
                        <th className="py-1 px-2 w-28 text-center border-r border-[#D0D0D0]">
                          Điểm (Score)
                        </th>
                        <th className="py-1 px-3 border-r border-[#D0D0D0]">Dữ liệu vào (Input preview)</th>
                        <th className="py-1 px-3 border-r border-[#D0D0D0]">Đáp án ra (Output preview)</th>
                        <th className="py-1 px-2 w-16 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA] text-[12px]">
                      {editingProblem.testCases.map((tc, idx) => (
                        <tr key={tc.id} className="hover:bg-[#F9FAFB]">
                          <td className="py-1 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-[#EAEAEA]">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2 border-r border-[#EAEAEA]">
                            <input
                              type="text"
                              value={tc.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProblem({
                                  ...editingProblem,
                                  testCases: editingProblem.testCases.map((t, i) =>
                                    i === idx ? { ...t, name: val } : t
                                  ),
                                });
                              }}
                              className="w-full px-1.5 py-0.5 bg-white border border-[#7F9DB9] font-mono text-[11px] text-black"
                            />
                          </td>
                          <td className="py-1 px-2 text-center border-r border-[#EAEAEA]">
                            <input
                              type="number"
                              step="0.1"
                              value={tc.score}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setEditingProblem({
                                  ...editingProblem,
                                  testCases: editingProblem.testCases.map((t, i) =>
                                    i === idx ? { ...t, score: val } : t
                                  ),
                                });
                              }}
                              className="w-20 px-1.5 py-0.5 bg-white border border-[#7F9DB9] font-mono font-bold text-emerald-700 text-right text-[11px]"
                            />
                          </td>
                          <td className="py-1 px-3 font-mono text-slate-600 text-[11px] border-r border-[#EAEAEA] truncate max-w-[150px]">
                            {tc.input.trim() ? (
                              <span title={tc.input}>{tc.input.trim().replace(/\n/g, ' ')}</span>
                            ) : (
                              <span className="italic text-slate-400">(Trống)</span>
                            )}
                          </td>
                          <td className="py-1 px-3 font-mono text-slate-600 text-[11px] border-r border-[#EAEAEA] truncate max-w-[150px]">
                            {tc.output.trim() ? (
                              <span title={tc.output}>{tc.output.trim().replace(/\n/g, ' ')}</span>
                            ) : (
                              <span className="italic text-slate-400">(Trống)</span>
                            )}
                          </td>
                          <td className="py-1 px-2 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => setViewingTestCase(tc)}
                                title="Xem và sửa nội dung Input/Output của test này"
                                className="p-1 text-slate-500 hover:text-[#0078D7] rounded transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTestCase(tc.id)}
                                title="Xóa test này"
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* View / Edit specific test case modal */}
              {viewingTestCase && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] max-w-lg w-full p-3 shadow-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-[#D0D0D0] pb-2">
                      <strong className="text-black font-mono">
                        Xem / Chỉnh sửa nội dung {viewingTestCase.name}
                      </strong>
                      <button
                        onClick={() => setViewingTestCase(null)}
                        className="text-slate-600 hover:text-black font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-0.5">
                          Dữ liệu vào (Input):
                        </label>
                        <textarea
                          rows={4}
                          value={viewingTestCase.input}
                          onChange={(e) => {
                            const val = e.target.value;
                            setViewingTestCase({ ...viewingTestCase, input: val });
                            setEditingProblem({
                              ...editingProblem,
                              testCases: editingProblem.testCases.map((t) =>
                                t.id === viewingTestCase.id ? { ...t, input: val } : t
                              ),
                            });
                          }}
                          className="w-full bg-white border border-[#7F9DB9] p-1.5 font-mono text-[11px] text-black"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-0.5">
                          Đáp án đúng (Output):
                        </label>
                        <textarea
                          rows={4}
                          value={viewingTestCase.output}
                          onChange={(e) => {
                            const val = e.target.value;
                            setViewingTestCase({ ...viewingTestCase, output: val });
                            setEditingProblem({
                              ...editingProblem,
                              testCases: editingProblem.testCases.map((t) =>
                                t.id === viewingTestCase.id ? { ...t, output: val } : t
                              ),
                            });
                          }}
                          className="w-full bg-white border border-[#7F9DB9] p-1.5 font-mono text-[11px] text-black"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setViewingTestCase(null)}
                        className="px-6 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] text-black font-bold shadow-[1px_1px_0_#404040] rounded-none transition active:translate-y-px"
                      >
                        Đồng ý
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#ECE9D8] border-t border-[#D0D0D0] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingProblem(null)}
                className="px-5 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-semibold shadow-[1px_1px_0_#404040] transition active:translate-y-px"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveProblemEdit}
                className="flex items-center space-x-1.5 px-6 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-black rounded-none font-bold shadow-[1px_1px_0_#404040] transition active:translate-y-px"
              >
                <Save className="w-3.5 h-3.5 text-blue-700" />
                <span>Lưu thay đổi bài toán</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Manual Problem */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] max-w-md w-full flex flex-col overflow-hidden text-xs">
            <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shadow-sm">
              <span className="font-bold text-[12px]">Themis - Thêm bài tập mới</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateManualProblem} className="p-4 space-y-3 bg-white border border-[#808080] win-border-inset m-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mã bài (Code):</label>
                <input
                  type="text"
                  required
                  placeholder="VD: BAI1"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-[#7F9DB9] p-1.5 text-black font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên bài:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tính tổng hai số"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#7F9DB9] p-1.5 text-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Thời gian (ms):</label>
                  <input
                    type="number"
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    className="w-full bg-white border border-[#7F9DB9] p-1.5 text-black font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bộ nhớ (MB):</label>
                  <input
                    type="number"
                    value={newMemoryLimit}
                    onChange={(e) => setNewMemoryLimit(Number(e.target.value))}
                    className="w-full bg-white border border-[#7F9DB9] p-1.5 text-black font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chế độ vào/ra (I/O):</label>
                <select
                  value={newIoMode}
                  onChange={(e) => setNewIoMode(e.target.value as any)}
                  className="w-full bg-white border border-[#7F9DB9] p-1.5 text-black focus:outline-none"
                >
                  <option value="FILE">File I/O (Chuẩn Themis: TASK.INP / TASK.OUT)</option>
                  <option value="STANDARD">Standard I/O (stdin / stdout)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] text-black font-semibold shadow-[1px_1px_0_#404040] rounded-none transition active:translate-y-px"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] text-black font-bold shadow-[1px_1px_0_#404040] rounded-none transition active:translate-y-px"
                >
                  Tạo bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
