import React, { useState, useRef, useEffect } from 'react';
import { Play, Upload, Loader2, CheckCircle2, FileCode, Trash2, Users, X } from 'lucide-react';
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
      const file = files[i];
      if (file.name.endsWith('.zip')) {
        const subsFromZip = await parseThemisSubmissionZip(file);
        subsFromZip.forEach((item) => {
          newItems.push({
            id: `sub-${Date.now()}-${Math.random()}`,
            contestantName: item.contestantName,
            problemCode: item.problemCode,
            languageId: item.languageId,
            fileName: item.fileName,
            sourceCode: item.sourceCode,
            status: 'PENDING',
          });
        });
      } else {
        const code = await file.text();
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        let contestant = 'ThiSinh';
        let probCode = baseName;

        if (baseName.includes('[')) {
          const match = baseName.match(/^(.*?)\[(.*?)\]$/);
          if (match) {
            contestant = match[1];
            probCode = match[2];
          }
        } else if (baseName.includes('_')) {
          const parts = baseName.split('_');
          contestant = parts[0];
          probCode = parts.slice(1).join('_');
        }

        newItems.push({
          id: `sub-${Date.now()}-${Math.random()}`,
          contestantName: contestant,
          problemCode: probCode.toUpperCase(),
          languageId: detectLanguageId(file.name),
          fileName: file.name,
          sourceCode: code,
          status: 'PENDING',
        });
      }
    }

    setQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleSaveToContestPending = async () => {
    for (const item of queue) {
      const targetProblem = contest.problems.find(
        (p) => p.code.toUpperCase() === item.problemCode.toUpperCase()
      );
      if (!targetProblem) continue;

      const sub: Submission = {
        id: item.id,
        contestId: contest.id,
        problemId: targetProblem.id,
        problemCode: targetProblem.code,
        contestantName: item.contestantName,
        languageId: item.languageId,
        sourceCode: item.sourceCode,
        status: 'PENDING',
        testResults: [],
        totalScore: 0,
        maxScore: targetProblem.points,
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden text-xs font-sans text-neutral-800 dark:text-neutral-100 transition-colors">
        {/* Title Bar */}
        <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Nạp bài thí sinh & Chấm bài hàng loạt
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {contest.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isJudging}
            className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-4 space-y-3 flex flex-col flex-1 overflow-hidden">
          {/* Instructions box */}
          <div className="p-3 bg-neutral-50/80 dark:bg-[#252529]/80 rounded-xl border border-black/[0.06] dark:border-white/[0.06] text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Chọn <strong>thư mục bài làm học sinh</strong> (mỗi thư mục con là tên của một học sinh chứa các file code như <code>CHUYENDE.cpp</code>, <code>MAVE.pas</code>) hoặc chọn nhiều file bài nộp lẻ / file <code>.zip</code>.
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={folderInputRef}
                onChange={handleSelectFolder}
                className="hidden"
              />
              <button
                onClick={() => folderInputRef.current?.click()}
                disabled={isJudging}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs shadow-sm transition active:scale-[0.98]"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Nạp thư mục học sinh...</span>
              </button>

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
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 font-medium rounded-xl text-xs transition active:scale-[0.98]"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Nạp file lẻ (.cpp, .pas, .zip)...</span>
              </button>

              {queue.length > 0 && !isJudging && (
                <button
                  onClick={() => setQueue([])}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa danh sách</span>
                </button>
              )}
            </div>

            <span className="text-neutral-500 text-xs">
              Đã nạp: <strong className="text-neutral-900 dark:text-white">{queue.length}</strong> bài nộp
            </span>
          </div>

          {/* Queued Files Table */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1A1A1E]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-neutral-50/90 dark:bg-[#242428]/90 backdrop-blur-md text-neutral-600 dark:text-neutral-400 font-medium text-[11px] border-b border-black/[0.06] dark:border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Thí sinh (Tên folder)</th>
                  <th className="py-2.5 px-2 text-center">Mã bài</th>
                  <th className="py-2.5 px-3">Tên file</th>
                  <th className="py-2.5 px-3 text-right">Trạng thái / Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-[12px]">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-neutral-400 italic">
                      Chưa có bài thi nào. Bấm nút "Nạp thư mục học sinh..." ở trên để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  queue.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={
                        item.status === 'JUDGING'
                          ? 'bg-amber-50/60 dark:bg-amber-950/20'
                          : item.status === 'DONE'
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'hover:bg-neutral-50/80 dark:hover:bg-white/[0.02]'
                      }
                    >
                      <td className="py-2 px-3 text-center text-neutral-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-white">
                        {item.contestantName}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.problemCode}
                      </td>
                      <td className="py-2 px-3 font-mono text-neutral-500 text-[11px]">
                        {item.fileName}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {item.status === 'PENDING' && (
                          <span className="text-neutral-400 text-[11px]">Chờ chấm</span>
                        )}
                        {item.status === 'JUDGING' && (
                          <span className="text-amber-600 font-medium flex items-center justify-end space-x-1 text-[11px]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Đang chấm...</span>
                          </span>
                        )}
                        {item.status === 'DONE' && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.score?.toFixed(1)}đ</span>
                          </span>
                        )}
                        {item.status === 'ERROR' && (
                          <span className="text-rose-600 font-bold text-[11px]">Lỗi</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Dialog Bottom Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              onClick={onClose}
              disabled={isJudging}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-xl font-medium transition text-xs"
            >
              Đóng
            </button>

            <button
              onClick={handleSaveToContestPending}
              disabled={isJudging || queue.length === 0}
              title="Đưa các bài nộp vào danh sách kỳ thi ở trạng thái Chờ chấm (F9 để chấm)"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 font-medium rounded-xl text-xs transition disabled:opacity-40"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Nạp vào kỳ thi (Chờ chấm)</span>
            </button>

            <button
              onClick={handleRunBatchJudge}
              disabled={isJudging || queue.length === 0}
              className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white transition shadow-sm ${
                isJudging || queue.length === 0
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                  : 'bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98]'
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
                  <span>Chấm tất cả ({queue.length} bài)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
