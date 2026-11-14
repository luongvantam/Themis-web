import React, { useState, useRef, useEffect } from 'react';
import { Play, Upload, Loader2, CheckCircle2, FileCode, Trash2, Users } from 'lucide-react';
import { Contest, Submission, TestResult } from '../types';
import { executeSingleTest } from '../services/judge0Service';
import { parseThemisSubmissionFolder, parseThemisSubmissionZip, detectLanguageId } from '../utils/zipParser';
import { storage } from '../storage';

interface BatchJudgeModalProps {
  contest: Contest;
  isOpen: boolean;
  onClose: () => void;
  onGradingCompleted: () => void;
}

interface QueuedSubmission {
  id: string;
  contestantName: string;
  problemCode: string;
  languageId: number;
  fileName: string;
  sourceCode: string;
  status: 'PENDING' | 'JUDGING' | 'DONE' | 'ERROR';
  score?: number;
}

export const BatchJudgeModal: React.FC<BatchJudgeModalProps> = ({
  contest,
  isOpen,
  onClose,
  onGradingCompleted,
}) => {
  const [queue, setQueue] = useState<QueuedSubmission[]>([]);
  const [isJudging, setIsJudging] = useState(false);
  const [_currentFileIdx, setCurrentFileIdx] = useState(0);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const parsed = await parseThemisSubmissionFolder(files);
    const newItems: QueuedSubmission[] = parsed.map((item) => ({
      id: `sub-${Date.now()}-${Math.random()}`,
      contestantName: item.contestantName,
      problemCode: item.problemCode,
      languageId: item.languageId,
      fileName: item.fileName,
      sourceCode: item.sourceCode,
      status: 'PENDING',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: QueuedSubmission[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.name.endsWith('.zip')) {
        const zipContent = await f.arrayBuffer();
        const fromZip = await parseThemisSubmissionZip(zipContent);
        fromZip.forEach((z) => {
          newItems.push({
            id: `sub-${Date.now()}-${Math.random()}`,
            contestantName: z.contestantName,
            problemCode: z.problemCode,
            languageId: z.languageId,
            fileName: z.fileName,
            sourceCode: z.sourceCode,
            status: 'PENDING',
          });
        });
      } else {
        // Individual code file
        const sourceCode = await f.text();
        const nameWithoutExt = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
        let contestant = 'ThiSinh';
        let problem = nameWithoutExt.toUpperCase();

        const bracketMatch = nameWithoutExt.match(/^([^\[\]]+)\[([^\[\]]+)\]$/);
        if (bracketMatch) {
          contestant = bracketMatch[1].trim();
          problem = bracketMatch[2].trim().toUpperCase();
        } else {
          const delimMatch = nameWithoutExt.match(/^([^_–-]+)[_–-]([^_–-]+)$/);
          if (delimMatch) {
            contestant = delimMatch[1].trim();
            problem = delimMatch[2].trim().toUpperCase();
          }
        }

        newItems.push({
          id: `sub-${Date.now()}-${Math.random()}`,
          contestantName: contestant,
          problemCode: problem,
          languageId: detectLanguageId(f.name),
          fileName: f.name,
          sourceCode,
          status: 'PENDING',
        });
      }
    }

    setQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleSaveToContestPending = async () => {
    if (queue.length === 0) return;
    for (const item of queue) {
      const targetProb = contest.problems.find(
        (p) => p.code.toUpperCase() === item.problemCode.toUpperCase()
      );
      const sub: Submission = {
        id: item.id,
        contestId: contest.id,
        problemId: targetProb?.id || `prob-${item.problemCode}`,
        problemCode: item.problemCode,
        contestantName: item.contestantName,
        languageId: item.languageId,
        sourceCode: item.sourceCode,
        status: 'PENDING',
        totalScore: 0,
        maxScore: targetProb?.points || 10,
        testResults: [],
        createdAt: Date.now(),
      };
      await storage.saveSubmission(sub);
    }
    onGradingCompleted();
    onClose();
  };

  const handleRunBatchJudge = async () => {
    if (queue.length === 0) return;
    setIsJudging(true);

    const settings = await storage.getSettings();

    for (let i = 0; i < queue.length; i++) {
      setCurrentFileIdx(i);
      const item = queue[i];

      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'JUDGING' } : q))
      );

      const targetProblem = contest.problems.find(
        (p) => p.code.toUpperCase() === item.problemCode.toUpperCase()
      );

      if (!targetProblem) {
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'ERROR', score: 0 } : q))
        );
        continue;
      }

      try {
        const results: TestResult[] = [];

        for (const tc of targetProblem.testCases) {
          const res = await executeSingleTest({
            sourceCode: item.sourceCode,
            languageId: item.languageId,
            problem: targetProblem,
            testCase: tc,
            settings,
          });
          results.push(res);
          if (res.verdict === 'CE') break;
        }

        const totalScore = results.reduce((acc, cur) => acc + cur.score, 0);

        const sub: Submission = {
          id: item.id,
          contestId: contest.id,
          problemId: targetProblem.id,
          problemCode: targetProblem.code,
          contestantName: item.contestantName,
          languageId: item.languageId,
          sourceCode: item.sourceCode,
          status: 'DONE',
          testResults: results,
          totalScore,
          maxScore: targetProblem.points,
          createdAt: Date.now(),
        };

        await storage.saveSubmission(sub);

        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'DONE', score: totalScore } : q))
        );
      } catch (_err) {
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'ERROR', score: 0 } : q))
        );
      }
    }

    setIsJudging(false);
    onGradingCompleted();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      {/* Windows Dialog Frame */}
      <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden text-xs font-sans">
        {/* Windows Dialog Title Bar */}
        <div className="bg-gradient-to-r from-[#0A246A] via-[#0055EA] to-[#A6CAF0] text-white h-7 px-2 flex items-center justify-between select-none shadow-sm">
          <div className="flex items-center space-x-2">
            <FileCode className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span className="font-bold text-[12px] tracking-wide">
              Themis - Nạp bài thí sinh & Chấm bài hàng loạt
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isJudging}
            className="w-5 h-5 bg-[#ECE9D8] hover:bg-[#E81123] hover:text-white border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] text-black font-bold flex items-center justify-center text-[10px] shadow-[1px_1px_0_#000] transition"
          >
            ✕
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-3 space-y-3 flex flex-col flex-1 overflow-hidden">
          {/* Instructions box */}
          <div className="p-2.5 bg-white border border-[#808080] win-border-inset text-[11px] text-slate-700 leading-relaxed">
            <p>
              Chọn <strong>thư mục bài làm học sinh</strong> (mỗi thư mục con là tên của một học sinh chứa các file code như <code>CHUYENDE.cpp</code>, <code>MAVE.pas</code>) hoặc chọn nhiều file bài nộp lẻ / file <code>.zip</code>.
            </p>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              {/* Folder Input */}
              <input
                type="file"
                ref={folderInputRef}
                onChange={handleSelectFolder}
                className="hidden"
              />
              <button
                onClick={() => folderInputRef.current?.click()}
                disabled={isJudging}
                className="flex items-center space-x-1.5 px-3 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-[#003366] font-bold rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px"
              >
                <Users className="w-3.5 h-3.5 text-[#0078D7]" />
                <span>Nạp thư mục học sinh...</span>
              </button>

              {/* File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSelectFiles}
                multiple
                accept=".cpp,.pas,.py,.java,.c,.zip"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isJudging}
                className="flex items-center space-x-1.5 px-3 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 font-bold rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-700" />
                <span>Nạp file lẻ (.cpp, .pas, .zip)...</span>
              </button>

              {queue.length > 0 && !isJudging && (
                <button
                  onClick={() => setQueue([])}
                  className="flex items-center space-x-1 px-2 py-1 bg-[#ECE9D8] hover:bg-[#FFF5F5] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-rose-700 rounded-none text-[11px] font-semibold shadow-[1px_1px_0_#404040] transition active:translate-y-px"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Xóa danh sách</span>
                </button>
              )}
            </div>

            <span className="text-slate-600 text-[11px]">
              Đã nạp: <strong className="text-black">{queue.length}</strong> bài nộp
            </span>
          </div>

          {/* Queued Files Table */}
          <div className="flex-1 overflow-y-auto bg-white border border-[#808080] win-border-inset">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#ECE9D8] text-[#1E1E1E] font-semibold text-[11px] border-b border-[#B0B0B0]">
                <tr>
                  <th className="py-1 px-2 w-10 text-center border-r border-[#D0D0D0]">STT</th>
                  <th className="py-1 px-3 border-r border-[#D0D0D0]">Thí sinh (Tên folder)</th>
                  <th className="py-1 px-2 text-center border-r border-[#D0D0D0]">Mã bài</th>
                  <th className="py-1 px-3 border-r border-[#D0D0D0]">Tên file</th>
                  <th className="py-1 px-2 text-right">Trạng thái / Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[12px]">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      Chưa có bài thi nào. Bấm nút "Nạp thư mục học sinh..." ở trên để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  queue.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={
                        item.status === 'JUDGING'
                          ? 'bg-[#FFF8E7]'
                          : item.status === 'DONE'
                          ? 'bg-[#F2FBF2]'
                          : 'hover:bg-[#F8F9FA]'
                      }
                    >
                      <td className="py-1 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-[#EAEAEA]">
                        {idx + 1}
                      </td>
                      <td className="py-1 px-3 font-semibold text-black border-r border-[#EAEAEA]">
                        {item.contestantName}
                      </td>
                      <td className="py-1 px-2 text-center font-mono font-bold text-[#003366] border-r border-[#EAEAEA]">
                        {item.problemCode}
                      </td>
                      <td className="py-1 px-3 font-mono text-slate-600 text-[11px] border-r border-[#EAEAEA]">
                        {item.fileName}
                      </td>
                      <td className="py-1 px-2 text-right font-mono">
                        {item.status === 'PENDING' && (
                          <span className="text-slate-400 text-[11px]">Chờ chấm</span>
                        )}
                        {item.status === 'JUDGING' && (
                          <span className="text-amber-600 font-bold flex items-center justify-end space-x-1 text-[11px]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Đang chấm...</span>
                          </span>
                        )}
                        {item.status === 'DONE' && (
                          <span className="text-[#008000] font-bold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.score?.toFixed(1)}đ</span>
                          </span>
                        )}
                        {item.status === 'ERROR' && (
                          <span className="text-[#CC0000] font-bold text-[11px]">Lỗi</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Dialog Bottom Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#D0D0D0]">
            <button
              onClick={onClose}
              disabled={isJudging}
              className="px-4 py-1 bg-[#ECE9D8] hover:bg-[#F2F0E4] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-slate-900 rounded-none font-semibold shadow-[1px_1px_0_#404040] transition active:translate-y-px"
            >
              Đóng
            </button>

            <button
              onClick={handleSaveToContestPending}
              disabled={isJudging || queue.length === 0}
              title="Đưa các bài nộp vào danh sách kỳ thi ở trạng thái Chờ chấm (F9 để chấm)"
              className="flex items-center space-x-1.5 px-3 py-1 bg-[#ECE9D8] hover:bg-[#F5F4EB] active:bg-[#ECE9D8] border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-[#004080] font-bold rounded-none shadow-[1px_1px_0_#404040] transition active:translate-y-px disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Nạp vào kỳ thi (Chờ chấm - F9)</span>
            </button>

            <button
              onClick={handleRunBatchJudge}
              disabled={isJudging || queue.length === 0}
              className={`flex items-center space-x-1 px-4 py-1 rounded-none font-bold shadow-[1px_1px_0_#404040] transition border-t border-l border-white border-b border-r border-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white active:translate-y-px ${
                isJudging || queue.length === 0
                  ? 'bg-[#ECE9D8] text-slate-400 opacity-50 cursor-not-allowed'
                  : 'bg-[#EBF7EB] hover:bg-[#DCF3DC] text-[#006600]'
              }`}
            >
              {isJudging ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang chấm ({_currentFileIdx + 1}/{queue.length})...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Bắt đầu chấm tất cả ({queue.length} bài)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
