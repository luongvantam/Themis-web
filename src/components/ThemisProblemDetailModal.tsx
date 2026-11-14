import React, { useState, useEffect } from 'react';
import { 
  FileCode2, X, Plus, Trash2, Save, 
  Sliders, FileText
} from 'lucide-react';
import { Problem, TestCase } from '../types';

interface ThemisProblemDetailModalProps {
  isOpen: boolean;
  problem: Problem | null;
  onClose: () => void;
  onSaveProblem: (updated: Problem) => void;
}

export const ThemisProblemDetailModal: React.FC<ThemisProblemDetailModalProps> = ({
  isOpen,
  problem,
  onClose,
  onSaveProblem,
}) => {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  useEffect(() => {
    if (problem) {
      setCurrentProblem({
        ...problem,
        testCases: problem.testCases.map((tc) => ({ ...tc })),
      });
      setSelectedTestId(problem.testCases[0]?.id || null);
    } else {
      setCurrentProblem(null);
      setSelectedTestId(null);
    }
  }, [problem, isOpen]);

  if (!isOpen || !currentProblem) return null;

  const currentTest = currentProblem.testCases.find((tc) => tc.id === selectedTestId) || null;

  // Calculate current sum of test points
  const currentTotalTestPoints = currentProblem.testCases
    .reduce((sum, tc) => sum + (Number(tc.score) || 0), 0)
    .toFixed(2);

  // Distribute points equally among test cases
  const handleDistributePoints = () => {
    if (currentProblem.testCases.length === 0) return;
    const count = currentProblem.testCases.length;
    const perTest = Number((currentProblem.points / count).toFixed(2));
    const updated = currentProblem.testCases.map((tc) => ({
      ...tc,
      score: perTest,
    }));
    setCurrentProblem({
      ...currentProblem,
      testCases: updated,
    });
  };

  // Add new test case
  const handleAddTest = () => {
    const idx = currentProblem.testCases.length + 1;
    const testName = `Test${idx.toString().padStart(2, '0')}`;
    const newTest: TestCase = {
      id: `tc-${currentProblem.code}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: testName,
      input: '',
      output: '',
      score: 1.0,
    };
    setCurrentProblem({
      ...currentProblem,
      testCases: [...currentProblem.testCases, newTest],
    });
    setSelectedTestId(newTest.id);
  };

  // Delete test case
  const handleDeleteTest = (testId: string) => {
    const nextTests = currentProblem.testCases.filter((tc) => tc.id !== testId);
    setCurrentProblem({
      ...currentProblem,
      testCases: nextTests,
    });
    if (selectedTestId === testId) {
      setSelectedTestId(nextTests[0]?.id || null);
    }
  };

  // Save changes
  const handleSave = () => {
    const code = currentProblem.code.trim().toUpperCase() || 'BAI';
    const finalProblem: Problem = {
      ...currentProblem,
      code,
      title: currentProblem.title.trim() || code,
      fileInpName: currentProblem.ioMode === 'FILE' ? `${code}.INP` : undefined,
      fileOutName: currentProblem.ioMode === 'FILE' ? `${code}.OUT` : undefined,
    };
    onSaveProblem(finalProblem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-xs font-sans text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[14px] text-neutral-900 dark:text-white font-mono">
                  {currentProblem.code}
                </span>
                <span className="text-[13px] text-neutral-600 dark:text-neutral-300 font-medium truncate max-w-md">
                  — {currentProblem.title}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Cấu hình chi tiết đề bài • Giới hạn thời gian, bộ nhớ & Bộ test cases
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-[#F5F5F7] dark:bg-[#141416]">
          {/* Section 1: Problem Parameters Card */}
          <div className="bg-white dark:bg-[#1E1E22] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
              <div className="flex items-center space-x-2 font-semibold text-neutral-900 dark:text-white text-[12.5px]">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>1. Thông số giới hạn & Chế độ nộp bài</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-semibold">
                {currentProblem.points} điểm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">
                  Mã bài (Problem Code):
                </label>
                <input
                  type="text"
                  value={currentProblem.code}
                  onChange={(e) =>
                    setCurrentProblem({
                      ...currentProblem,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl font-mono font-bold text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">
                  Tên bài toán:
                </label>
                <input
                  type="text"
                  value={currentProblem.title}
                  onChange={(e) =>
                    setCurrentProblem({ ...currentProblem, title: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">
                  Thời gian tối đa (ms):
                </label>
                <input
                  type="number"
                  step="100"
                  value={currentProblem.timeLimitMs}
                  onChange={(e) =>
                    setCurrentProblem({
                      ...currentProblem,
                      timeLimitMs: Math.max(100, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl font-mono text-xs text-right text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">
                  Bộ nhớ tối đa (MB):
                </label>
                <input
                  type="number"
                  step="32"
                  value={currentProblem.memoryLimitMb}
                  onChange={(e) =>
                    setCurrentProblem({
                      ...currentProblem,
                      memoryLimitMb: Math.max(16, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl font-mono text-xs text-right text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
              <div className="space-y-1">
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">
                  Chế độ đọc/ghi dữ liệu (I/O):
                </label>
                <select
                  value={currentProblem.ioMode}
                  onChange={(e) =>
                    setCurrentProblem({
                      ...currentProblem,
                      ioMode: e.target.value as 'FILE' | 'STANDARD',
                    })
                  }
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FILE">File I/O (Chuẩn Themis: {currentProblem.code}.INP / .OUT)</option>
                  <option value="STANDARD">Standard I/O (stdin / stdout)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">
                  Tổng điểm bài toán (Points):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={currentProblem.points}
                  onChange={(e) =>
                    setCurrentProblem({
                      ...currentProblem,
                      points: Math.max(0.5, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl font-mono font-bold text-xs text-right text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleDistributePoints}
                  className="w-full py-1.5 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 rounded-xl font-medium transition active:scale-95 text-xs"
                >
                  Chia đều điểm cho {currentProblem.testCases.length} tests
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Test Cases Management */}
          <div className="bg-white dark:bg-[#1E1E22] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
              <div>
                <div className="flex items-center space-x-2 font-semibold text-neutral-900 dark:text-white text-[12.5px]">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>2. Danh sách Test Cases ({currentProblem.testCases.length} tests)</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Tổng điểm các test: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{currentTotalTestPoints}đ</strong> / {currentProblem.points}đ
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTest}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-100 rounded-xl font-medium transition active:scale-95 text-xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-500" />
                <span>Thêm test case</span>
              </button>
            </div>

            {/* Split view: Left Test list, Right Test Content Editor */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Left Column: Test Case list (2/5) */}
              <div className="md:col-span-2 border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden flex flex-col max-h-[300px]">
                <div className="bg-neutral-100/80 dark:bg-[#252529]/80 px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                  <span>Tên Test & Điểm</span>
                  <span>Thao tác</span>
                </div>

                <div className="overflow-y-auto flex-1 p-1 space-y-1">
                  {currentProblem.testCases.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-xs italic">
                      Chưa có test case nào
                    </div>
                  ) : (
                    currentProblem.testCases.map((tc, idx) => {
                      const isSelected = tc.id === selectedTestId;
                      return (
                        <div
                          key={tc.id}
                          onClick={() => setSelectedTestId(tc.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400'
                              : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 pr-1">
                            <span className="text-[10px] text-neutral-400 font-mono w-4">
                              {idx + 1}
                            </span>
                            <span className="font-mono font-semibold text-xs truncate">
                              {tc.name}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              step="0.1"
                              value={tc.score}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setCurrentProblem({
                                  ...currentProblem,
                                  testCases: currentProblem.testCases.map((t) =>
                                    t.id === tc.id ? { ...t, score: val } : t
                                  ),
                                });
                              }}
                              className="w-14 px-1.5 py-0.5 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded font-mono font-semibold text-right text-[11px]"
                            />
                            <span className="text-[10px] text-neutral-400">đ</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTest(tc.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 transition"
                              title="Xóa test này"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Test Input / Output Editor (3/5) */}
              <div className="md:col-span-3 border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 flex flex-col space-y-3 bg-neutral-50/50 dark:bg-[#202024]/50">
                {currentTest ? (
                  <>
                    <div className="flex items-center justify-between pb-1 border-b border-black/[0.06] dark:border-white/[0.06]">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                          Chi tiết:
                        </span>
                        <input
                          type="text"
                          value={currentTest.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentProblem({
                              ...currentProblem,
                              testCases: currentProblem.testCases.map((t) =>
                                t.id === currentTest.id ? { ...t, name: val } : t
                              ),
                            });
                          }}
                          className="px-2 py-0.5 bg-white dark:bg-[#1E1E22] border border-black/10 dark:border-white/10 rounded font-mono font-bold text-xs"
                        />
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        Điểm: <strong>{currentTest.score}đ</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {/* Input Area */}
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10.5px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase font-mono">
                          Dữ liệu vào (Input / .INP):
                        </span>
                        <textarea
                          value={currentTest.input}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentProblem({
                              ...currentProblem,
                              testCases: currentProblem.testCases.map((t) =>
                                t.id === currentTest.id ? { ...t, input: val } : t
                              ),
                            });
                          }}
                          placeholder="Nhập dữ liệu test input..."
                          className="w-full flex-1 min-h-[140px] p-2 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl font-mono text-[11px] text-neutral-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Output Area */}
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10.5px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase font-mono">
                          Đáp án mẫu (Output / .OUT):
                        </span>
                        <textarea
                          value={currentTest.output}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentProblem({
                              ...currentProblem,
                              testCases: currentProblem.testCases.map((t) =>
                                t.id === currentTest.id ? { ...t, output: val } : t
                              ),
                            });
                          }}
                          placeholder="Nhập đáp án chuẩn output..."
                          className="w-full flex-1 min-h-[140px] p-2 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl font-mono text-[11px] text-neutral-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-neutral-400 text-xs italic min-h-[180px]">
                    Chọn một test case bên trái để xem và sửa nội dung Input / Output
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0 bg-white dark:bg-[#1E1E22]">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Tổng cộng: <strong className="text-neutral-900 dark:text-white font-mono">{currentProblem.testCases.length}</strong> tests • <strong className="text-blue-600 dark:text-blue-400 font-mono">{currentProblem.points}</strong> điểm
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-6 py-2 bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-medium rounded-xl text-xs shadow-md shadow-blue-500/20 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu đề bài</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
