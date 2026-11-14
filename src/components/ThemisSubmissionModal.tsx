import React, { useState, useRef } from 'react';
import { 
  Code2, Clock, Cpu, CheckCircle2, AlertTriangle, 
  XCircle, Scale, FileQuestion, Upload, Edit2, Play, Trash2, X, Copy
} from 'lucide-react';
import { Submission, Verdict } from '../types';

interface ThemisSubmissionModalProps {
  submission: Submission | null;
  cellInfo?: { contestantName: string; problemCode: string } | null;
  onClose: () => void;
  onUploadForStudent?: (contestantName: string, problemCode: string, file: File) => void;
  onSaveAndRejudgeCode?: (submission: Submission, newSourceCode: string) => Promise<void>;
  onRenameStudent?: (oldName: string, newName: string) => Promise<void>;
  onDeleteSubmission?: (submissionId: string) => Promise<void>;
}

export const ThemisSubmissionModal: React.FC<ThemisSubmissionModalProps> = ({
  submission,
  cellInfo,
  onClose,
  onUploadForStudent,
  onSaveAndRejudgeCode,
  onRenameStudent,
  onDeleteSubmission,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit code state
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editedSourceCode, setEditedSourceCode] = useState(submission?.sourceCode || '');
  const [isSaving, setIsSaving] = useState(false);

  // Rename student inline state
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(submission?.contestantName || cellInfo?.contestantName || '');
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    if (!submission) return;
    const lines: string[] = [
      `KẾT QUẢ CHẤM THEMIS`,
      `Thí sinh: ${submission.contestantName}`,
      `Bài thi: ${submission.problemCode}`,
      `Tổng điểm: ${submission.totalScore.toFixed(2)} / ${submission.maxScore.toFixed(2)}`,
      `Thời gian: ${new Date(submission.createdAt).toLocaleString('vi-VN')}`,
      `----------------------------------------`,
    ];
    submission.testResults.forEach((t) => {
      lines.push(`${t.testCaseName}: ${t.verdict} (+${t.score.toFixed(1)}đ, ${t.timeUsedMs}ms, ${t.memoryUsedKb}KB)`);
      if (t.compileOutput) lines.push(`  Compiler: ${t.compileOutput}`);
      if (t.statusDescription) lines.push(`  Chi tiết: ${t.statusDescription}`);
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!submission && !cellInfo) return null;

  const contestantName = submission?.contestantName || cellInfo?.contestantName || 'Thí sinh';
  const problemCode = submission?.problemCode || cellInfo?.problemCode || 'BAI';

  const getVerdictBadge = (v: Verdict) => {
    switch (v) {
      case 'AC':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>ĐÚNG (AC)</span>
          </span>
        );
      case 'WA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>SAI (WA)</span>
          </span>
        );
      case 'TLE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>QUÁ THỜI GIAN (TLE)</span>
          </span>
        );
      case 'MLE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>QUÁ BỘ NHỚ (MLE)</span>
          </span>
        );
      case 'CE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/40 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>LỖI BIÊN DỊCH (CE)</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-700/40 flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>LỖI CHẠY (RTE)</span>
          </span>
        );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadForStudent) {
      onUploadForStudent(contestantName, problemCode, file);
    }
    e.target.value = '';
  };

  const handleSaveAndRejudge = async () => {
    if (!submission || !onSaveAndRejudgeCode) return;
    setIsSaving(true);
    await onSaveAndRejudgeCode(submission, editedSourceCode);
    setIsSaving(false);
    setIsEditingCode(false);
  };

  const handleRenameSubmit = async () => {
    if (!nameInput.trim() || nameInput.trim() === contestantName) {
      setIsRenaming(false);
      return;
    }
    if (onRenameStudent) {
      await onRenameStudent(contestantName, nameInput.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden text-xs font-sans text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                Chi tiết kết quả: {contestantName} [{problemCode}]
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {submission ? `Đã chấm lúc ${new Date(submission.createdAt).toLocaleTimeString('vi-VN')}` : 'Chưa có file bài nộp'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-4 space-y-3 flex flex-col flex-1 overflow-hidden">
          {/* Top Info Bar */}
          <div className="bg-neutral-50/80 dark:bg-[#252529]/80 p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                {isRenaming ? (
                  <div className="flex items-center space-x-1.5">
                    <span className="font-medium text-neutral-500">Thí sinh:</span>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-[#2C2C2E] border border-blue-500 rounded-lg text-neutral-900 dark:text-white font-semibold text-xs"
                      autoFocus
                    />
                    <button
                      onClick={handleRenameSubmit}
                      className="px-2.5 py-1 bg-[#0071E3] text-white rounded-lg text-[11px] font-medium"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setIsRenaming(false)}
                      className="px-2 py-1 bg-black/[0.05] dark:bg-white/10 rounded-lg text-[11px]"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{contestantName}</span>
                    {onRenameStudent && (
                      <button
                        onClick={() => {
                          setNameInput(contestantName);
                          setIsRenaming(true);
                        }}
                        title="Đổi tên thí sinh này"
                        className="p-1 text-neutral-400 hover:text-blue-600 rounded-lg transition"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
                <span className="text-neutral-400">&bull;</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Bài: {problemCode}
                </span>
              </div>
            </div>

            {submission && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[11px] text-neutral-500 block">Tổng điểm đạt được</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {submission.totalScore.toFixed(2)} / {submission.maxScore.toFixed(2)}
                  </span>
                </div>

                {onDeleteSubmission && (
                  <button
                    onClick={async () => {
                      if (confirm(`Bạn có chắc chắn muốn xoá bài nộp ${problemCode} của "${contestantName}"?`)) {
                        await onDeleteSubmission(submission.id);
                      }
                    }}
                    title="Xóa bài nộp này"
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {!submission ? (
            /* Missing Submission State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50/50 dark:bg-[#18181B]/50 rounded-xl border border-dashed border-black/[0.1] dark:border-white/[0.1] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Chưa có bài nộp cho "{problemCode}" từ {contestantName}
              </h4>
              <p className="text-neutral-500 max-w-sm text-xs">
                Bạn có thể chọn file mã nguồn (.cpp, .pas, .py, .java, .c) từ máy tính để nạp bổ sung cho học sinh này.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".cpp,.pas,.py,.java,.c,.zip"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl font-medium shadow-sm flex items-center space-x-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Nạp file mã nguồn ngay</span>
              </button>
            </div>
          ) : (
            /* Submission Content: Code on left, Tests on right */
            <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden">
              {/* Left: Source Code */}
              <div className="flex flex-col bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
                <div className="px-3 py-2 bg-neutral-50 dark:bg-[#252529] border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 font-semibold text-neutral-900 dark:text-white">
                    <Code2 className="w-4 h-4 text-blue-500" />
                    <span>Mã nguồn học sinh</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {onSaveAndRejudgeCode && (
                      isEditingCode ? (
                        <>
                          <button
                            onClick={handleSaveAndRejudge}
                            disabled={isSaving}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-[11px] flex items-center space-x-1 shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isSaving ? 'Đang chấm...' : 'Lưu & Chấm lại'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingCode(false);
                              setEditedSourceCode(submission.sourceCode);
                            }}
                            className="px-2 py-1 bg-black/[0.05] dark:bg-white/10 text-neutral-700 dark:text-neutral-300 rounded-lg text-[11px]"
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditedSourceCode(submission.sourceCode);
                            setIsEditingCode(true);
                          }}
                          className="px-2.5 py-1 bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.08] text-neutral-700 dark:text-neutral-300 rounded-lg text-[11px] font-medium flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Chỉnh sửa code</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {isEditingCode ? (
                  <textarea
                    value={editedSourceCode}
                    onChange={(e) => setEditedSourceCode(e.target.value)}
                    className="p-3 font-mono text-xs bg-neutral-50 dark:bg-[#141416] text-neutral-900 dark:text-neutral-100 flex-1 resize-none focus:outline-none"
                    placeholder="Nhập hoặc chỉnh sửa mã nguồn tại đây..."
                  />
                ) : (
                  <pre className="p-3 font-mono text-xs text-neutral-800 dark:text-neutral-200 overflow-auto flex-1 leading-5 bg-white dark:bg-[#18181B] select-text">
                    {submission.sourceCode}
                  </pre>
                )}
              </div>

              {/* Right: Test Cases Breakdown */}
              <div className="flex flex-col bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
                <div className="px-3 py-2 bg-neutral-50 dark:bg-[#252529] border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between font-semibold text-xs text-neutral-900 dark:text-white">
                  <span>Chi tiết kết quả từng Test Case</span>
                  <span className="text-neutral-400 font-mono font-normal">
                    {submission.testResults.length} tests
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs">
                  {submission.testResults.length === 0 ? (
                    <div className="p-6 text-center text-neutral-400 italic">
                      Bài thi đang ở hàng đợi chờ chấm.
                    </div>
                  ) : (
                    submission.testResults.map((r, i) => (
                      <div key={i} className="p-3 space-y-1.5 hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-neutral-900 dark:text-white font-mono">
                            {r.testCaseName || `Test ${i + 1}`}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getVerdictBadge(r.verdict)}
                            <span className="font-bold font-mono text-neutral-900 dark:text-white">
                              +{r.score.toFixed(1)}đ
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px] text-neutral-400 font-mono">
                          <span>Thời gian: {r.timeUsedMs}ms</span>
                          <span>Bộ nhớ: {r.memoryUsedKb}KB</span>
                        </div>

                        {/* Status Description / Error diagnostics */}
                        {r.verdict !== 'AC' && (
                          <div className="mt-1.5 p-2.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 rounded-lg text-[11px] font-mono space-y-1">
                            {r.compileOutput ? (
                              <div>
                                <strong className="text-rose-700 dark:text-rose-400 block">Lỗi biên dịch:</strong>
                                <pre className="text-rose-600 dark:text-rose-300 whitespace-pre-wrap text-[10px] max-h-32 overflow-y-auto mt-0.5">
                                  {r.compileOutput}
                                </pre>
                              </div>
                            ) : r.stderr ? (
                              <div>
                                <strong className="text-rose-700 dark:text-rose-400 block">Lỗi thực thi (stderr):</strong>
                                <pre className="text-rose-600 dark:text-rose-300 whitespace-pre-wrap text-[10px] max-h-32 overflow-y-auto mt-0.5">
                                  {r.stderr}
                                </pre>
                              </div>
                            ) : (
                              <div className="text-neutral-700 dark:text-neutral-300">
                                <strong className="text-rose-700 dark:text-rose-400">Chi tiết: </strong>
                                <span>{r.statusDescription || (r.stdout ? `Đầu ra: ${r.stdout}` : 'Sai kết quả so với đáp án')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dialog Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-black/[0.06] dark:border-white/[0.08] mt-1">
            <div>
              {submission && (
                <button
                  onClick={handleCopyReport}
                  className="px-3.5 py-1.5 bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-xl transition flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{copied ? '✓ Đã sao chép' : 'Sao chép kết quả'}</span>
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 rounded-xl font-medium text-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
