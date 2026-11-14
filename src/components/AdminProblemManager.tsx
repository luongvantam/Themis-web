import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, FileArchive, CheckCircle2, AlertCircle, 
  FolderOpen, Sliders, Save, Eye, X
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
      const { problems, warnings } = await parseThemisTaskFolder(files);

      if (problems.length === 0) {
        setStatusMsg({
          type: 'error',
          text: 'Không tìm thấy cấu trúc thư mục bài thi / test case hợp lệ!',
        });
        return;
      }

      onUpdateContest({
        ...contest,
        problems: [...contest.problems, ...problems],
      });

      setStatusMsg({
        type: 'success',
        text: `Đã nạp thành công ${problems.length} bài thi từ thư mục!`,
      });

      if (warnings.length > 0) {
        console.warn('Warnings:', warnings);
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Lỗi xử lý thư mục đề: ${err.message}`,
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
          text: 'Không tìm thấy bài thi hoặc test case nào trong file zip!',
        });
        return;
      }

      onUpdateContest({
        ...contest,
        title: contest.title || contestTitle || file.name.replace(/\.[^/.]+$/, ''),
        problems: [...contest.problems, ...problems],
      });

      setStatusMsg({
        type: 'success',
        text: `Đã giải nén và nạp thành công ${problems.length} bài toán!`,
      });

      if (warnings.length > 0) {
        console.warn('Warnings:', warnings);
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `Lỗi giải nén zip: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleCreateManualProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const code = newCode.trim().toUpperCase();
    const title = newTitle.trim() || code;

    const newProblem: Problem = {
      id: `prob-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      code,
      title,
      timeLimitMs: newTimeLimit,
      memoryLimitMb: newMemoryLimit,
      ioMode: newIoMode,
      fileInpName: newIoMode === 'FILE' ? `${code}.INP` : undefined,
      fileOutName: newIoMode === 'FILE' ? `${code}.OUT` : undefined,
      testCases: [
        {
          id: `tc-${code}-1`,
          name: 'Test01',
          input: '1 2\n',
          output: '3\n',
          score: 1.0,
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

  const handleDeleteTestCase = (testId: string) => {
    if (!editingProblem) return;
    setEditingProblem({
      ...editingProblem,
      testCases: editingProblem.testCases.filter((tc) => tc.id !== testId),
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs text-neutral-800 dark:text-neutral-100">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#1E1E22] rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
        <div>
          <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">Danh sách các bài toán trong đề</h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
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
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs shadow-sm transition active:scale-[0.98]"
          >
            <FolderOpen className="w-3.5 h-3.5" />
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
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 font-medium rounded-xl text-xs transition active:scale-[0.98]"
          >
            <FileArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Nạp Zip Đề</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 font-medium rounded-xl text-xs transition active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>Thêm bài thủ công</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center space-x-2 p-3 rounded-xl border text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Problem Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {contest.problems.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-neutral-400 text-xs bg-white dark:bg-[#1E1E22] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] italic">
            Chưa có bài thi nào trong kỳ thi này. Hãy nạp thư mục test case hoặc file zip đề.
          </div>
        ) : (
          contest.problems.map((prob) => (
            <div
              key={prob.id}
              className="bg-white dark:bg-[#1E1E22] p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] space-y-3 hover:border-blue-500/50 transition shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs rounded-lg border border-blue-200/60 dark:border-blue-800/40">
                    {prob.code}
                  </span>
                  <h3 className="font-semibold text-xs text-neutral-900 dark:text-white">{prob.title}</h3>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setEditingProblem({ ...prob, testCases: [...prob.testCases] })}
                    title="Chỉnh sửa thông số, điểm test và nội dung test cases"
                    className="flex items-center space-x-1 px-2.5 py-1 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-700 dark:text-neutral-200 rounded-lg text-[11px] font-medium transition"
                  >
                    <Sliders className="w-3 h-3 text-blue-500" />
                    <span>Sửa bài & Điểm</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProblem(prob.id)}
                    title="Xóa bài thi này"
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                <div className="bg-neutral-50 dark:bg-[#252529] p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="block text-[10px] text-neutral-400 uppercase">Thời gian</span>
                  <span className="text-neutral-900 dark:text-white font-semibold">{prob.timeLimitMs}ms</span>
                </div>
                <div className="bg-neutral-50 dark:bg-[#252529] p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="block text-[10px] text-neutral-400 uppercase">Bộ nhớ</span>
                  <span className="text-neutral-900 dark:text-white font-semibold">{prob.memoryLimitMb}MB</span>
                </div>
                <div className="bg-neutral-50 dark:bg-[#252529] p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="block text-[10px] text-neutral-400 uppercase">Số Tests</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{prob.testCases.length}</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                <span>
                  I/O: <strong className="text-neutral-900 dark:text-white font-mono">{prob.ioMode === 'FILE' ? `${prob.code}.INP` : 'Standard I/O'}</strong>
                </span>
                <span>
                  Tổng điểm: <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">{prob.points}đ</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: Powerful Problem & Test Cases Editor */}
      {editingProblem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-xs">
            {/* Title Bar */}
            <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                  Chỉnh sửa thông số & Điểm test: {editingProblem.code}
                </span>
              </div>
              <button
                onClick={() => setEditingProblem(null)}
                className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-neutral-100/50 dark:bg-[#151518]">
              {/* Problem Parameters Box */}
              <div className="bg-white dark:bg-[#1E1E22] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] space-y-3">
                <h5 className="font-semibold text-neutral-900 dark:text-white text-xs border-b border-black/[0.06] dark:border-white/[0.06] pb-1.5">
                  1. Thông số giới hạn & Chế độ nộp bài
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">Mã bài (Code):</label>
                    <input
                      type="text"
                      value={editingProblem.code}
                      onChange={(e) =>
                        setEditingProblem({ ...editingProblem, code: e.target.value.toUpperCase() })
                      }
                      className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg p-2 font-mono font-bold text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">Tên bài thi:</label>
                    <input
                      type="text"
                      value={editingProblem.title}
                      onChange={(e) =>
                        setEditingProblem({ ...editingProblem, title: e.target.value })
                      }
                      className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg p-2 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">Thời gian (ms):</label>
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
                      className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg p-2 font-mono text-neutral-900 dark:text-white text-right focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">Bộ nhớ (MB):</label>
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
                      className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg p-2 font-mono text-neutral-900 dark:text-white text-right focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">Chế độ I/O:</label>
                    <select
                      value={editingProblem.ioMode}
                      onChange={(e) =>
                        setEditingProblem({
                          ...editingProblem,
                          ioMode: e.target.value as any,
                        })
                      }
                      className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg p-2 text-neutral-900 dark:text-white focus:outline-none"
                    >
                      <option value="FILE">File I/O (Chuẩn Themis: TASK.INP / TASK.OUT)</option>
                      <option value="STANDARD">Standard I/O (stdin / stdout)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
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
                      className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg p-2 font-mono font-bold text-blue-600 dark:text-blue-400 text-right focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleDistributePointsEqually}
                      className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-800/50 rounded-xl font-medium transition active:scale-[0.98]"
                    >
                      Chia đều điểm cho {editingProblem.testCases.length} tests
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Cases Table Box */}
              <div className="bg-white dark:bg-[#1E1E22] p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2">
                  <div>
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-xs">
                      2. Danh sách Test Cases ({editingProblem.testCases.length} tests)
                    </h5>
                    <span className="text-[11px] text-neutral-500">
                      Tổng điểm hiện tại:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
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
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 text-neutral-800 dark:text-neutral-100 rounded-xl font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    <span>Thêm test case</span>
                  </button>
                </div>

                <div className="max-h-[340px] overflow-y-auto rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-neutral-50/90 dark:bg-[#252529]/90 backdrop-blur-md text-neutral-600 dark:text-neutral-400 font-medium text-[11px] border-b border-black/[0.06] dark:border-white/[0.06]">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">STT</th>
                        <th className="py-2 px-3 w-32">Tên Test</th>
                        <th className="py-2 px-3 w-28 text-center">Điểm (Score)</th>
                        <th className="py-2 px-3">Input preview</th>
                        <th className="py-2 px-3">Output preview</th>
                        <th className="py-2 px-3 w-20 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[12px]">
                      {editingProblem.testCases.map((tc, idx) => (
                        <tr key={tc.id} className="hover:bg-neutral-50/80 dark:hover:bg-white/[0.02]">
                          <td className="py-2 px-3 text-center text-neutral-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
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
                              className="w-full px-2 py-1 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg font-mono text-xs text-neutral-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
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
                              className="w-20 px-2 py-1 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono text-neutral-500 text-[11px] truncate max-w-[140px]">
                            {tc.input.trim() ? (
                              <span title={tc.input}>{tc.input.trim().replace(/\n/g, ' ')}</span>
                            ) : (
                              <span className="italic text-neutral-400">(Trống)</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-neutral-500 text-[11px] truncate max-w-[140px]">
                            {tc.output.trim() ? (
                              <span title={tc.output}>{tc.output.trim().replace(/\n/g, ' ')}</span>
                            ) : (
                              <span className="italic text-neutral-400">(Trống)</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => setViewingTestCase(tc)}
                                title="Xem và sửa nội dung Input/Output của test này"
                                className="p-1.5 text-neutral-500 hover:text-blue-600 rounded-lg transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTestCase(tc.id)}
                                title="Xóa test này"
                                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 max-w-lg w-full p-5 shadow-2xl space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                      <strong className="text-sm font-semibold text-neutral-900 dark:text-white font-mono">
                        Xem / Chỉnh sửa nội dung {viewingTestCase.name}
                      </strong>
                      <button
                        onClick={() => setViewingTestCase(null)}
                        className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
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
                          className="w-full bg-neutral-50 dark:bg-[#161618] border border-black/10 dark:border-white/10 rounded-xl p-3 font-mono text-xs text-neutral-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
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
                          className="w-full bg-neutral-50 dark:bg-[#161618] border border-black/10 dark:border-white/10 rounded-xl p-3 font-mono text-xs text-neutral-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setViewingTestCase(null)}
                        className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs transition"
                      >
                        Đồng ý
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/80 dark:bg-[#1E1E22]/80 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingProblem(null)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveProblemEdit}
                className="flex items-center space-x-1.5 px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl font-medium text-xs shadow-sm transition active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi bài toán</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Manual Problem */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-md w-full flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none">
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">Thêm bài tập mới</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateManualProblem} className="p-5 space-y-3">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Mã bài (Code):</label>
                <input
                  type="text"
                  required
                  placeholder="VD: BAI1"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Tên bài:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tính tổng hai số"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Thời gian (ms):</label>
                  <input
                    type="number"
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Bộ nhớ (MB):</label>
                  <input
                    type="number"
                    value={newMemoryLimit}
                    onChange={(e) => setNewMemoryLimit(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Chế độ vào/ra (I/O):</label>
                <select
                  value={newIoMode}
                  onChange={(e) => setNewIoMode(e.target.value as any)}
                  className="w-full bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="FILE">File I/O (Chuẩn Themis: TASK.INP / TASK.OUT)</option>
                  <option value="STANDARD">Standard I/O (stdin / stdout)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs shadow-sm transition"
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
