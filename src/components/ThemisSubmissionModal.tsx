import React, { useState, useRef } from 'react';
import { 
  Code2, Clock, Cpu, CheckCircle2, AlertTriangle, 
  XCircle, Scale, FileQuestion, Upload, AlertCircle, Edit2, Play, Trash2 
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
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D5EED5] text-[#008000] border border-[#A3D7A3] flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-[#008000]" />
            <span>ĐÚNG (AC)</span>
          </span>
        );
      case 'WA':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FDE8E8] text-[#CC0000] border border-[#F87171] flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-[#CC0000]" />
            <span>SAI (WA)</span>
          </span>
        );
      case 'TLE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF8E7] text-[#B8860B] border border-[#FCD34D] flex items-center space-x-1">
            <Clock className="w-3 h-3 text-[#B8860B]" />
            <span>QUÁ THỜI GIAN (TLE)</span>
          </span>
        );
      case 'MLE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3E8FF] text-[#7E22CE] border border-[#D8B4FE] flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-[#7E22CE]" />
            <span>QUÁ BỘ NHỚ (MLE)</span>
          </span>
        );
      case 'CE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B] flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-[#D97706]" />
            <span>LỖI BIÊN DỊCH (CE)</span>
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#F87171]">
            LỖI THỰC THI ({v})
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      {/* Windows Dialog Frame */}
      <div className="bg-[#F0F0F0] border-2 border-[#005A9E] rounded-t-sm shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden text-xs font-sans">
        {/* Windows Dialog Title Bar */}
        <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shadow-sm">
          <div className="flex items-center space-x-2 truncate">
            <Scale className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
            <span className="font-bold text-[12px] tracking-wide truncate">
              Themis - Chi tiết kết quả: {contestantName} [{problemCode}]
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-3 space-y-3 flex flex-col flex-1 overflow-hidden">
          {/* Top Info Bar */}
          <div className="bg-white p-2.5 border border-[#808080] win-border-inset flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                {isRenaming ? (
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-slate-600">Thí sinh:</span>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-1.5 py-0.5 bg-white border border-[#0078D7] text-black font-bold text-xs"
                      autoFocus
                    />
                    <button
                      onClick={handleRenameSubmit}
                      className="px-2 py-0.5 bg-[#0078D7] text-white rounded-sm text-[11px]"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setIsRenaming(false)}
                      className="px-1.5 py-0.5 bg-white border border-[#808080] text-slate-700 rounded-sm text-[11px]"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-[#003366]">
                      Thí sinh: {contestantName}
                    </span>
                    {onRenameStudent && (
                      <button
                        onClick={() => {
                          setNameInput(contestantName);
                          setIsRenaming(true);
                        }}
                        title="Đổi tên thí sinh"
                        className="p-1 text-slate-400 hover:text-[#0078D7] transition"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
                <span className="px-2 py-0.5 rounded bg-[#E5F1FB] border border-[#70C0E7] text-[#005A9E] font-mono font-bold">
                  Bài: {problemCode}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5">
                {submission ? (
                  <>
                    Thời gian nộp: {new Date(submission.createdAt).toLocaleString('vi-VN')} &bull; Ngôn ngữ ID: {submission.languageId}
                  </>
                ) : (
                  <span className="text-rose-600 font-semibold">
                    Trạng thái: Chưa có bài nộp (File không tồn tại)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {submission && onDeleteSubmission && (
                <button
                  onClick={async () => {
                    if (confirm(`Bạn có chắc chắn muốn xóa bài nộp này của ${contestantName}?`)) {
                      await onDeleteSubmission(submission.id);
                      onClose();
                    }
                  }}
                  title="Xóa bài nộp này"
                  className="flex items-center space-x-1 px-2 py-1 bg-white hover:bg-[#FDE8E8] text-rose-700 border border-[#F87171] rounded-sm text-[11px] shadow-sm transition"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Xóa bài này</span>
                </button>
              )}

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Điểm số</span>
                <span
                  className={`text-xl font-bold font-mono ${
                    submission && submission.totalScore > 0 ? 'text-[#008000]' : 'text-slate-400'
                  }`}
                >
                  {submission ? submission.totalScore.toFixed(2) : '0.00'} /{' '}
                  {submission?.maxScore?.toFixed(2) || '10.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Case 1: File DOES NOT exist / Missing Submission */}
          {!submission ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white border border-[#808080] win-border-inset space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                <FileQuestion className="w-9 h-9" />
              </div>

              <div className="space-y-1.5 max-w-lg">
                <h3 className="text-sm font-bold text-rose-700">
                  KHÔNG TÌM THẤY FILE BÀI LÀM CỦA THÍ SINH
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Trong thư mục của thí sinh <strong>"{contestantName}"</strong> không tìm thấy bất kỳ file mã nguồn nào tương ứng với mã bài <strong>"{problemCode}"</strong> (ví dụ: <code className="text-[#003366] font-bold">{problemCode}.cpp</code>, <code className="text-[#003366] font-bold">{problemCode}.pas</code>, hoặc <code className="text-[#003366] font-bold">{problemCode}.py</code>).
                </p>
              </div>

              <div className="bg-[#FFF8E7] border border-[#FCD34D] p-3 text-left max-w-md w-full text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-1 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Các nguyên nhân phổ biến:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                  <li>Thí sinh chưa nộp bài toán này trong kỳ thi.</li>
                  <li>Thí sinh đặt sai tên file bài làm (VD: đặt là <code>bai_1.cpp</code> thay vì <code>{problemCode}.cpp</code>).</li>
                  <li>File bài làm bị lưu sai thư mục của thí sinh khác.</li>
                </ul>
              </div>

              {onUploadForStudent && (
                <div className="pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".cpp,.pas,.py,.java,.c"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#0078D7] hover:bg-[#106EBE] text-white font-semibold rounded-sm shadow-sm transition active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Nạp bổ sung file bài làm cho {contestantName}...</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Case 2: File exists - show Code and Tests */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden">
              {/* Left: Code Pane (with Edit & Rejudge Capability) */}
              <div className="flex flex-col bg-white border border-[#808080] win-border-inset overflow-hidden">
                <div className="px-2 py-1 bg-[#ECE9D8] border-b border-[#D0D0D0] flex items-center justify-between font-semibold text-[11px] text-[#003366]">
                  <div className="flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#005A9E]" />
                    <span>Mã nguồn bài làm</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {onSaveAndRejudgeCode && (
                      <button
                        onClick={() => {
                          if (!isEditingCode) {
                            setEditedSourceCode(submission.sourceCode);
                          }
                          setIsEditingCode(!isEditingCode);
                        }}
                        className="px-2.5 py-0.5 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] text-black rounded-none font-semibold text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px"
                      >
                        {isEditingCode ? 'Hủy sửa code' : 'Sửa code'}
                      </button>
                    )}
                    {isEditingCode && (
                      <button
                        onClick={handleSaveAndRejudge}
                        disabled={isSaving}
                        className="flex items-center space-x-1 px-2.5 py-0.5 bg-[#EBF7EB] hover:bg-[#DCF3DC] border-t border-l border-white border-b border-r border-[#808080] text-[#006600] rounded-none font-bold text-[11px] shadow-[1px_1px_0_#404040] transition active:translate-y-px"
                      >
                        {isSaving ? (
                          <span>Đang chấm...</span>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Lưu & Chấm lại (F5)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isEditingCode ? (
                  <textarea
                    value={editedSourceCode}
                    onChange={(e) => setEditedSourceCode(e.target.value)}
                    className="p-2.5 font-mono text-xs text-black w-full flex-1 bg-white focus:outline-none resize-none leading-5"
                    placeholder="Nhập hoặc chỉnh sửa mã nguồn tại đây..."
                  />
                ) : (
                  <pre className="p-2.5 font-mono text-xs text-black overflow-auto flex-1 leading-5 bg-white select-text">
                    {submission.sourceCode}
                  </pre>
                )}
              </div>

              {/* Right: Test Cases Breakdown */}
              <div className="flex flex-col bg-white border border-[#808080] win-border-inset overflow-hidden">
                <div className="px-2 py-1 bg-[#ECE9D8] border-b border-[#D0D0D0] flex items-center justify-between font-semibold text-[11px] text-[#003366]">
                  <span>Chi tiết kết quả từng Test Case</span>
                  <span className="text-slate-500 font-mono font-normal">
                    {submission.testResults.length} tests
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[#E0E0E0] text-xs">
                  {submission.testResults.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic">
                      Bài thi đang ở hàng đợi chờ chấm.
                    </div>
                  ) : (
                    submission.testResults.map((r, i) => (
                      <div key={i} className="p-2 space-y-1 hover:bg-[#F5F8FC]">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-black font-mono">
                            {r.testCaseName || `Test ${i + 1}`}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getVerdictBadge(r.verdict)}
                            <span className="font-bold font-mono text-[#003366]">
                              +{r.score.toFixed(1)}đ
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                          <span>Thời gian: {r.timeUsedMs}ms</span>
                          <span>Bộ nhớ: {r.memoryUsedKb}KB</span>
                        </div>

                        {/* Status Description / Error diagnostics */}
                        {r.verdict !== 'AC' && (
                          <div className="mt-1 p-2 bg-[#FFF5F5] border border-[#F87171] rounded-none text-[11px] font-mono space-y-1">
                            {r.compileOutput ? (
                              <div>
                                <strong className="text-rose-800 block">Lỗi biên dịch (Compiler output):</strong>
                                <pre className="text-rose-700 whitespace-pre-wrap text-[10px] max-h-32 overflow-y-auto mt-0.5">
                                  {r.compileOutput}
                                </pre>
                              </div>
                            ) : r.stderr ? (
                              <div>
                                <strong className="text-rose-800 block">Lỗi thực thi (Standard Error):</strong>
                                <pre className="text-rose-700 whitespace-pre-wrap text-[10px] max-h-32 overflow-y-auto mt-0.5">
                                  {r.stderr}
                                </pre>
                              </div>
                            ) : (
                              <div className="text-slate-700">
                                <strong>Chi tiết: </strong>
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
          <div className="flex justify-between items-center pt-2 border-t border-[#D0D0D0] mt-2">
            <div>
              {submission && (
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] text-black text-xs font-semibold shadow-[1px_1px_0_#404040] rounded-none transition active:translate-y-px"
                >
                  {copied ? '✓ Đã sao chép' : 'Sao chép kết quả (Copy)'}
                </button>
              )}
            </div>
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
