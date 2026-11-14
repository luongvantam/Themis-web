import React, { useState, useEffect } from 'react';
import { Play, Loader2, User, AlertCircle } from 'lucide-react';
import { Contest, Problem, TestResult, Submission } from '../types';
import { ProblemView } from '../components/ProblemView';
import { CodeEditor } from '../components/CodeEditor';
import { TestVerdictList } from '../components/TestVerdictList';
import { SUPPORTED_LANGUAGES, executeSingleTest } from '../services/judge0Service';
import { storage } from '../storage';

interface ContestantViewProps {
  contest: Contest | null;
}

export const ContestantView: React.FC<ContestantViewProps> = ({ contest }) => {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [contestantName, setContestantName] = useState(() => {
    return localStorage.getItem('themis_contestant_name') || 'ThiSinh_01';
  });
  const [languageId, setLanguageId] = useState(54); // C++17 default
  const [code, setCode] = useState('');
  const [isJudging, setIsJudging] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeProblem: Problem | undefined = contest?.problems[selectedProblemIndex];

  // Update default code template when problem changes
  useEffect(() => {
    if (activeProblem) {
      const lang = SUPPORTED_LANGUAGES.find((l) => l.id === languageId) || SUPPORTED_LANGUAGES[0];
      const tpl = lang.defaultTemplate.replace(/TASK/g, activeProblem.code);
      setCode(tpl);
      setTestResults([]);
      setErrorMsg(null);
    }
  }, [activeProblem?.id, languageId]);

  const handleNameChange = (name: string) => {
    setContestantName(name);
    localStorage.setItem('themis_contestant_name', name);
  };

  const handleRunSubmit = async () => {
    if (!contest || !activeProblem) {
      setErrorMsg('Vui lòng chọn bài thi trước khi nộp.');
      return;
    }
    if (!code.trim()) {
      setErrorMsg('Mã nguồn không được để trống.');
      return;
    }
    if (!contestantName.trim()) {
      setErrorMsg('Vui lòng nhập họ tên hoặc mã số thí sinh.');
      return;
    }

    setErrorMsg(null);
    setIsJudging(true);
    setTestResults([]);
    setCurrentTestIndex(0);

    const settings = await storage.getSettings();
    const results: TestResult[] = [];
    const testCases = activeProblem.testCases;

    try {
      for (let i = 0; i < testCases.length; i++) {
        setCurrentTestIndex(i + 1);
        const tc = testCases[i];

        const res = await executeSingleTest({
          sourceCode: code,
          languageId,
          problem: activeProblem,
          testCase: tc,
          settings,
        });

        results.push(res);
        setTestResults([...results]);

        // If Compilation Error, stop running remaining tests
        if (res.verdict === 'CE') {
          break;
        }
      }

      // Calculate total score
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      const maxScore = activeProblem.points;

      // Save submission to storage
      const submission: Submission = {
        id: `sub-${Date.now()}`,
        contestId: contest.id,
        problemId: activeProblem.id,
        problemCode: activeProblem.code,
        contestantName: contestantName.trim(),
        languageId,
        sourceCode: code,
        status: 'DONE',
        totalScore,
        maxScore,
        testResults: results,
        createdAt: Date.now(),
      };

      await storage.saveSubmission(submission);
    } catch (err: any) {
      setErrorMsg(`Lỗi trong quá trình chấm: ${err.message}`);
    } finally {
      setIsJudging(false);
    }
  };

  if (!contest || contest.problems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-300 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2">Chưa có bài thi nào trong kỳ thi này</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Chuyển sang chế độ &ldquo;Giám khảo&rdquo; để tạo bài tập hoặc nạp bộ test case (.zip) cho kỳ thi.
        </p>
      </div>
    );
  }

  const currentTotalScore = testResults.reduce((sum, r) => sum + r.score, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Problem Navigation Tabs & Contestant Name */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-800 shadow-sm">
        {/* Problem Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {contest.problems.map((p, idx) => {
            const isSelected = idx === selectedProblemIndex;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProblemIndex(idx)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{p.code}</span>
                <span className="text-[10px] font-normal opacity-75 truncate max-w-[80px]">
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contestant Name Input */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Thí sinh:</span>
            <input
              type="text"
              value={contestantName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: HS01_NguyenVanA"
              className="bg-transparent text-slate-200 font-semibold focus:outline-none w-36 truncate"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Workspace: Left = Problem Statement, Right = Code & Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem description */}
        <div className="lg:col-span-5 space-y-6">
          {activeProblem && <ProblemView problem={activeProblem} />}
        </div>

        {/* Right Column: Code Editor & Test Results */}
        <div className="lg:col-span-7 space-y-5">
          <CodeEditor
            code={code}
            onChangeCode={setCode}
            languageId={languageId}
            onChangeLanguageId={setLanguageId}
            taskCode={activeProblem?.code}
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {activeProblem ? (
                <span>
                  Bài <strong className="text-slate-200">{activeProblem.code}</strong> có{' '}
                  <strong className="text-emerald-400">{activeProblem.testCases.length}</strong> test cases
                </span>
              ) : null}
            </div>

            <button
              onClick={handleRunSubmit}
              disabled={isJudging}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition ${
                isJudging
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
              }`}
            >
              {isJudging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Đang chấm bài...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Nộp bài & Chấm điểm</span>
                </>
              )}
            </button>
          </div>

          {/* Test Verdict Results */}
          <TestVerdictList
            results={testResults}
            totalScore={currentTotalScore}
            maxScore={activeProblem?.points || 10}
            isJudging={isJudging}
            currentTestIndex={currentTestIndex}
            totalTests={activeProblem?.testCases.length || 0}
          />
        </div>
      </div>
    </div>
  );
};

