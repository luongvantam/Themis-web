import React, { useState } from 'react';
import { Clock, Cpu, FileText, Copy, Check } from 'lucide-react';
import { Problem } from '../types';

interface ProblemViewProps {
  problem: Problem;
}

export const ProblemView: React.FC<ProblemViewProps> = ({ problem }) => {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const sampleTest = problem.testCases[0];

  const copyToClipboard = (text: string, isInput: boolean) => {
    navigator.clipboard.writeText(text);
    if (isInput) {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 1500);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 1500);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-5 text-slate-200">
      {/* Title & Code */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono font-bold text-sm rounded border border-emerald-500/30">
              {problem.code}
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">{problem.title}</h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            {problem.points} điểm ({problem.testCases.length} tests)
          </span>
        </div>

        {/* Constraints Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-xs">
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Thời gian</p>
              <p className="text-slate-200 font-mono">{(problem.timeLimitMs / 1000).toFixed(1)}s / test</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Bộ nhớ</p>
              <p className="text-slate-200 font-mono">{problem.memoryLimitMb} MB</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
            <FileText className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">I/O chuẩn</p>
              <p className="text-slate-200 font-mono truncate">
                {problem.ioMode === 'FILE'
                  ? `${problem.fileInpName || problem.code + '.INP'} / ${problem.fileOutName || problem.code + '.OUT'}`
                  : 'stdin / stdout'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Đề bài</h3>
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 min-h-[80px]">
          {problem.description ||
            `Cho bài toán ${problem.code}. Hãy viết chương trình giải quyết yêu cầu và xuất kết quả theo định dạng chuẩn.`}
        </div>
      </div>

      {/* Sample Test Case */}
      {sampleTest && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ví dụ minh họa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Sample Input */}
            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
                <span className="font-semibold text-slate-300">Dữ liệu vào (Input)</span>
                <button
                  onClick={() => copyToClipboard(sampleTest.input, true)}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  {copiedInput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="p-3 font-mono text-emerald-300 whitespace-pre overflow-x-auto max-h-36">
                {sampleTest.input || '(Trống)'}
              </pre>
            </div>

            {/* Sample Output */}
            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
                <span className="font-semibold text-slate-300">Kết quả ra (Output)</span>
                <button
                  onClick={() => copyToClipboard(sampleTest.output, false)}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="p-3 font-mono text-cyan-300 whitespace-pre overflow-x-auto max-h-36">
                {sampleTest.output || '(Trống)'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

