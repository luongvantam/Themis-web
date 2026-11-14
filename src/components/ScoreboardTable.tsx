import React, { useState } from 'react';
import { Download, Search, Trophy, Medal } from 'lucide-react';
import { Contest, Submission } from '../types';
import { calculateScoreboard, exportScoreboardToCSV, ScoreboardRow } from '../utils/csvExporter';

interface ScoreboardTableProps {
  contest: Contest;
  submissions: Submission[];
}

export const ScoreboardTable: React.FC<ScoreboardTableProps> = ({ contest, submissions }) => {
  const [search, setSearch] = useState('');

  const rows: ScoreboardRow[] = calculateScoreboard(contest, submissions);

  const filteredRows = rows.filter((r) =>
    r.contestantName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadCSV = () => {
    const csvContent = exportScoreboardToCSV(contest, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KetQua_${contest.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center space-x-1 text-amber-400 font-bold">
          <Trophy className="w-4 h-4 fill-amber-400" />
          <span>1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center space-x-1 text-slate-300 font-bold">
          <Medal className="w-4 h-4 text-slate-300" />
          <span>2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center space-x-1 text-amber-600 font-bold">
          <Medal className="w-4 h-4 text-amber-600" />
          <span>3</span>
        </span>
      );
    }
    return <span className="font-mono text-slate-400">{rank}</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Bảng xếp hạng Themis (Scoreboard)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng {rows.length} thí sinh &bull; {submissions.length} lượt nộp bài
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm thí sinh..."
              className="bg-transparent text-slate-200 focus:outline-none w-32"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất KetQua.csv</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-16">Hạng</th>
              <th className="py-3 px-4">Thí sinh</th>
              {contest.problems.map((p) => (
                <th key={p.id} className="py-3 px-4 text-center">
                  <div>{p.code}</div>
                  <div className="text-[10px] text-slate-500 font-normal lowercase">({p.points}đ)</div>
                </th>
              ))}
              <th className="py-3 px-4 text-right">Tổng điểm</th>
              <th className="py-3 px-4 text-center w-24">Lần nộp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={contest.problems.length + 4}
                  className="py-8 text-center text-slate-500 font-sans text-xs"
                >
                  Chưa có dữ liệu nộp bài nào.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.contestantName} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold">{getRankBadge(row.rank)}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    {row.contestantName}
                  </td>
                  {contest.problems.map((p) => {
                    const score = row.problemScores[p.code];
                    const isGraded = row.problemGraded?.[p.code] ?? (score !== undefined);
                    const isFull = score !== undefined && score === p.points && p.points > 0;
                    return (
                      <td key={p.id} className="py-3 px-4 text-center">
                        {isGraded && score !== undefined ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                              isFull
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : score > 0
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'text-slate-600'
                            }`}
                          >
                            {score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold text-sm">
                    {row.hasAnyGraded ? row.totalScore.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">
                    {row.submissionCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

