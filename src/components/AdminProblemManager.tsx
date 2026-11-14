import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash2, FileArchive, CheckCircle2, AlertCircle, 
  FolderOpen, Sliders
} from 'lucide-react';
import { Contest, Problem } from '../types';
import { parseThemisZip, parseThemisTaskFolder } from '../utils/zipParser';

interface AdminProblemManagerProps {
  contest: Contest;
  onUpdateContest: (updated: Contest) => void;
  onEditProblem?: (problem: Problem) => void;
}

export const AdminProblemManager: React.FC<AdminProblemManagerProps> = ({
  contest,
  onUpdateContest,
  onEditProblem,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Manual problem creation state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(1000);
  const [newMemoryLimit, setNewMemoryLimit] = useState(256);
  const [newIoMode, setNewIoMode] = useState<'STANDARD' | 'FILE'>('FILE');

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
      id: `prob-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
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

    setShowAddForm(false);
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

  return (
    <div className="space-y-4 font-sans text-xs text-neutral-800 dark:text-neutral-100">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-[#1E1E22] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
        <div>
          <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">
            Danh sách các đề bài trong kỳ thi
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Kỳ thi: <strong>{contest.title}</strong> &bull; Tổng cộng: <strong>{contest.problems.length}</strong> bài toán
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
            type="button"
            onClick={() => folderInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs shadow-sm transition active:scale-95"
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
            type="button"
            onClick={() => zipInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 font-medium rounded-xl text-xs transition active:scale-95"
          >
            <FileArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Nạp Zip Đề</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/[0.05] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 font-medium rounded-xl text-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>{showAddForm ? 'Đóng tạo bài' : 'Thêm bài thủ công'}</span>
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

      {/* Inline Create Problem Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateManualProblem}
          className="bg-white dark:bg-[#1E1E22] p-4 rounded-2xl border border-blue-500/30 dark:border-blue-500/30 shadow-md space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-2 font-semibold text-neutral-900 dark:text-white">
            <span className="flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-blue-500" />
              <span>Thêm đề bài mới vào kỳ thi</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1 text-[11px]">
                Mã bài (Code):
              </label>
              <input
                type="text"
                placeholder="VD: BAI1"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1 text-[11px]">
                Tên bài toán:
              </label>
              <input
                type="text"
                placeholder="VD: Tính tổng hai số"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1 text-[11px]">
                Thời gian (ms):
              </label>
              <input
                type="number"
                step="100"
                value={newTimeLimit}
                onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl font-mono text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1 text-[11px]">
                Bộ nhớ (MB):
              </label>
              <input
                type="number"
                step="32"
                value={newMemoryLimit}
                onChange={(e) => setNewMemoryLimit(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-xl font-mono text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex items-center space-x-2">
              <label className="text-neutral-600 dark:text-neutral-400 font-medium text-[11px]">
                Chế độ I/O:
              </label>
              <select
                value={newIoMode}
                onChange={(e) => setNewIoMode(e.target.value as any)}
                className="px-2 py-1 bg-neutral-50 dark:bg-[#252529] border border-black/10 dark:border-white/10 rounded-lg text-xs"
              >
                <option value="FILE">File I/O ({newCode || 'BAI'}.INP / .OUT)</option>
                <option value="STANDARD">Standard I/O (stdin / stdout)</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs shadow-sm transition active:scale-95"
            >
              Tạo bài toán
            </button>
          </div>
        </form>
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
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs rounded-lg border border-blue-200/60 dark:border-blue-800/40 shrink-0">
                    {prob.code}
                  </span>
                  <h3 className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                    {prob.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditProblem?.(prob)}
                    title="Mở khung cấu hình chi tiết bài này và sửa test cases"
                    className="flex items-center space-x-1 px-3 py-1 bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#64D2FF] rounded-xl text-[11px] font-medium transition active:scale-95"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Sửa bài & Test</span>
                  </button>

                  <button
                    type="button"
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
                  <span className="text-neutral-900 dark:text-white font-semibold">
                    {(prob.timeLimitMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="bg-neutral-50 dark:bg-[#252529] p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="block text-[10px] text-neutral-400 uppercase">Bộ nhớ</span>
                  <span className="text-neutral-900 dark:text-white font-semibold">
                    {prob.memoryLimitMb}MB
                  </span>
                </div>
                <div className="bg-neutral-50 dark:bg-[#252529] p-2 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <span className="block text-[10px] text-neutral-400 uppercase">Số Tests</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {prob.testCases.length}
                  </span>
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
    </div>
  );
};
