import React, { useState, useRef } from 'react';
import { FileArchive, Trophy, PlayCircle, Download, Upload, Trash2, Plus, Terminal } from 'lucide-react';
import { Contest, Submission } from '../types';
import { AdminProblemManager } from '../components/AdminProblemManager';
import { ScoreboardTable } from '../components/ScoreboardTable';
import { BatchJudgeModal } from '../components/BatchJudgeModal';
import { ContestantView } from './ContestantView';
import { exportContestToJSON, importContestFromJSON } from '../utils/themisPackage';

interface AdminViewProps {
  contest: Contest | null;
  submissions: Submission[];
  onUpdateContest: (contest: Contest) => void;
  onDeleteContest: (contestId: string) => void;
  onRefreshSubmissions: () => void;
  onNewContest: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  contest,
  submissions,
  onUpdateContest,
  onDeleteContest,
  onRefreshSubmissions,
  onNewContest,
}) => {
  const [activeTab, setActiveTab] = useState<'problems' | 'scoreboard' | 'singleTest'>('problems');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportPackage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importContestFromJSON(content);
        onUpdateContest(imported);
        alert(`Đã nạp thành công kỳ thi "${imported.title}"!`);
      } catch (err: any) {
        alert(`Lỗi đọc file .themis: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!contest) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-300 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <FileArchive className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Chưa có kỳ thi nào</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Hệ thống đang ở trạng thái sạch (không có dữ liệu mẫu). Bạn có thể tạo kỳ thi mới hoặc nạp kỳ thi có sẵn từ file gói .themis.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={onNewContest}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo kỳ thi mới</span>
          </button>

          <input
            type="file"
            ref={importInputRef}
            onChange={handleImportPackage}
            accept=".themis,.json"
            className="hidden"
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập gói .themis</span>
          </button>
        </div>
      </div>
    );
  }

  const handleExportPackage = () => {
    const blob = exportContestToJSON(contest);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${contest.title.replace(/\s+/g, '_')}.themis`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Contest Top Banner & Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Kỳ thi đang chọn
          </span>
          <h1 className="text-xl font-bold text-white mt-1">{contest.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {contest.problems.length} bài thi &bull; Khởi tạo:{' '}
            {new Date(contest.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Judge Button */}
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Chấm bài hàng loạt</span>
          </button>

          {/* Export .themis */}
          <button
            onClick={handleExportPackage}
            title="Xuất file gói kỳ thi .themis để lưu trữ hoặc chia sẻ"
            className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất .themis</span>
          </button>

          {/* Import .themis */}
          <input
            type="file"
            ref={importInputRef}
            onChange={handleImportPackage}
            accept=".themis,.json"
            className="hidden"
          />
          <button
            onClick={() => importInputRef.current?.click()}
            title="Nạp kỳ thi từ file .themis"
            className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập .themis</span>
          </button>

          {/* Delete Contest */}
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa kỳ thi "${contest.title}"?`)) {
                onDeleteContest(contest.id);
              }
            }}
            title="Xóa kỳ thi này"
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('problems')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'problems'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileArchive className="w-4 h-4" />
          <span>Quản lý Đề & Test Cases ({contest.problems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scoreboard')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'scoreboard'
              ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Bảng xếp hạng Themis ({submissions.length} nộp)</span>
        </button>

        <button
          onClick={() => setActiveTab('singleTest')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'singleTest'
              ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Chấm thử một bài</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'problems' && (
        <AdminProblemManager contest={contest} onUpdateContest={onUpdateContest} />
      )}
      {activeTab === 'scoreboard' && (
        <ScoreboardTable contest={contest} submissions={submissions} />
      )}
      {activeTab === 'singleTest' && (
        <ContestantView contest={contest} />
      )}

      {/* Batch Judging Modal */}
      <BatchJudgeModal
        contest={contest}
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onGradingCompleted={() => {
          onRefreshSubmissions();
          setActiveTab('scoreboard');
        }}
      />
    </div>
  );
};

