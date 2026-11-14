import React, { useState, useRef, useEffect } from 'react';
import { Table2, BookOpen } from 'lucide-react';
import { Contest, Problem, Submission } from '../types';
import { useColorMode } from '../utils/useColorMode';
import { ThemisWindowTitleBar } from '../components/ThemisWindowTitleBar';
import { ThemisMenuBar } from '../components/ThemisMenuBar';
import { ThemisToolbar } from '../components/ThemisToolbar';
import { ThemisScoreboardGrid } from '../components/ThemisScoreboardGrid';
import { ThemisStatusBar } from '../components/ThemisStatusBar';
import { ThemisToastContainer, ToastItem } from '../components/ThemisToastContainer';
import { ThemisJudgingHUD } from '../components/ThemisJudgingHUD';
import { ThemisSubmissionModal } from '../components/ThemisSubmissionModal';
import { ThemisAboutModal } from '../components/ThemisAboutModal';
import { ThemisStudentManagerModal } from '../components/ThemisStudentManagerModal';
import { ThemisSelectiveJudgeModal } from '../components/ThemisSelectiveJudgeModal';
import { SettingsModal } from '../components/SettingsModal';
import { AdminProblemManager } from '../components/AdminProblemManager';
import { ThemisProblemDetailModal } from '../components/ThemisProblemDetailModal';
import { BatchJudgeModal } from '../components/BatchJudgeModal';
import { exportContestToJSON, importContestFromJSON, exportContestToContestZip } from '../utils/themisPackage';
import {
  exportScoreboardToCSV,
  exportScoreboardToExcelHTML,
  exportScoreboardToTXT,
  calculateScoreboard
} from '../utils/csvExporter';
import {
  parseThemisZip,
  parseThemisTaskFolder,
  parseThemisSubmissionFolder,
  parseThemisSubmissionZip,
  detectLanguageId
} from '../utils/zipParser';
import { executeSubmissionTests } from '../services/judge0Service';
import { storage } from '../storage';

interface ThemisMainWindowProps {
  contests: Contest[];
  activeContestId: string;
  onSelectContest: (id: string) => void;
  onUpdateContest: (contest: Contest) => void;
  onDeleteContest: (contestId: string) => void;
  onNewContest: () => void;
}

export const ThemisMainWindow: React.FC<ThemisMainWindowProps> = ({
  contests: _contests,
  activeContestId,
  onSelectContest: _onSelectContest,
  onUpdateContest,
  onDeleteContest: _onDeleteContest,
  onNewContest,
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [_logs, setLogs] = useState<{ id: string; timestamp: string; message: string; type: string }[]>([]);
  const [isJudging, setIsJudging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState('Sẵn sàng');

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = (title: string, description?: string, type: ToastItem['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Judging Progress Alert Card / HUD
  const [showJudgingHUD, setShowJudgingHUD] = useState(false);
  const [judgingHUDData, setJudgingHUDData] = useState<{
    currentContestant: string;
    currentProblemCode: string;
    currentTestCase: string;
    currentIndex: number;
    totalCount: number;
    lastVerdict: any | null;
    isCompleted: boolean;
  }>({
    currentContestant: '',
    currentProblemCode: '',
    currentTestCase: '',
    currentIndex: 0,
    totalCount: 0,
    lastVerdict: null,
    isCompleted: false,
  });

  // Modals
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showStudentManagerModal, setShowStudentManagerModal] = useState(false);
  const [showSelectiveModal, setShowSelectiveModal] = useState(false);
  const [selectedProblemForDetail, setSelectedProblemForDetail] = useState<Problem | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'scoreboard' | 'docs'>('scoreboard');
  const { colorMode, setColorMode } = useColorMode();

  // Selective judging filters: By default all problems and all students are selected (ticked)
  const [selectedStudentNames, setSelectedStudentNames] = useState<Set<string>>(new Set());
  const [selectedProblemCodes, setSelectedProblemCodes] = useState<Set<string>>(new Set());

  // Submission inspector modal state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    contestantName: string;
    problemCode: string;
  } | null>(null);

  // Hidden Inputs for Folder, Files and Zip Picker
  const taskFolderInputRef = useRef<HTMLInputElement>(null);
  const submissionFolderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const individualFileInputRef = useRef<HTMLInputElement>(null);
  const shouldStopRef = useRef(false);

  const activeContest = _contests.find((c) => c.id === activeContestId) || null;

  // Configure HTML5 directory upload attributes
  useEffect(() => {
    if (taskFolderInputRef.current) {
      taskFolderInputRef.current.setAttribute('webkitdirectory', '');
      taskFolderInputRef.current.setAttribute('directory', '');
    }
    if (submissionFolderInputRef.current) {
      submissionFolderInputRef.current.setAttribute('webkitdirectory', '');
      submissionFolderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  // Load submissions for active contest
  useEffect(() => {
    if (activeContestId) {
      storage.getSubmissions(activeContestId).then((subs) => {
        setSubmissions(subs);
      });
    } else {
      setSubmissions([]);
    }
  }, [activeContestId]);

  // Synchronize problems into selective judging set (default: all ticked)
  useEffect(() => {
    if (activeContest && activeContest.problems.length > 0) {
      setSelectedProblemCodes((prev) => {
        const next = new Set(prev);
        activeContest.problems.forEach((p) => next.add(p.code.toUpperCase()));
        return next;
      });
    }
  }, [activeContest]);

  // Synchronize students into selective judging set (default: all ticked)
  useEffect(() => {
    if (submissions.length > 0) {
      setSelectedStudentNames((prev) => {
        const next = new Set(prev);
        submissions.forEach((s) => next.add(s.contestantName));
        return next;
      });
    }
  }, [submissions]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      { id: `log-${Date.now()}-${Math.random()}`, timestamp, message, type },
    ]);
  };

  /**
   * Fast, concurrent grading runner for a list of submissions
   */
  const judgeSubmissionList = async (targetSubs: Submission[]) => {
    if (!activeContest || targetSubs.length === 0) return;

    setIsJudging(true);
    shouldStopRef.current = false;
    setStatusText(`Đang chấm ${targetSubs.length} bài thi...`);
    addLog(`=== BẮT ĐẦU CHẤM ${targetSubs.length} BÀI THI (ĐÃ ĐẶT LẠI ĐIỂM) ===`, 'info');
    setShowJudgingHUD(true);
    setJudgingHUDData({
      currentContestant: targetSubs[0]?.contestantName || '',
      currentProblemCode: targetSubs[0]?.problemCode || '',
      currentTestCase: 'Đang chuẩn bị...',
      currentIndex: 1,
      totalCount: targetSubs.length,
      lastVerdict: null,
      isCompleted: false,
    });
    setProgressPercent(0);

    // 1. Clear old scores and test results for all target submissions first
    const targetIds = new Set(targetSubs.map((s) => s.id));
    setSubmissions((prev) =>
      prev.map((s) => {
        if (targetIds.has(s.id)) {
          return {
            ...s,
            status: 'PENDING' as const,
            totalScore: 0,
            testResults: [],
          };
        }
        return s;
      })
    );

    for (const sub of targetSubs) {
      sub.status = 'PENDING';
      sub.totalScore = 0;
      sub.testResults = [];
      await storage.saveSubmission(sub);
    }

    const settings = await storage.getSettings();

    for (let i = 0; i < targetSubs.length; i++) {
      if (shouldStopRef.current) {
        addLog('Đã dừng chấm bài theo lệnh người dùng.', 'warning');
        break;
      }

      const sub = targetSubs[i];
      const prob = activeContest.problems.find(
        (p) => p.code.toUpperCase() === sub.problemCode.toUpperCase()
      );

      if (!prob) {
        addLog(`Bỏ qua: Không tìm thấy bài toán "${sub.problemCode}" trong đề thi!`, 'warning');
        continue;
      }

      setStatusText(`Đang chấm [${i + 1}/${targetSubs.length}]: ${sub.contestantName} - ${sub.problemCode}`);
      addLog(`Đang chấm [${i + 1}/${targetSubs.length}]: ${sub.contestantName} [${sub.problemCode}]...`, 'info');
      setJudgingHUDData((prev) => ({
        ...prev,
        currentContestant: sub.contestantName,
        currentProblemCode: sub.problemCode,
        currentTestCase: 'Đang khởi chạy...',
        currentIndex: i + 1,
      }));

      // Execute tests concurrently with short-circuiting on compilation error
      const results = await executeSubmissionTests({
        sourceCode: sub.sourceCode,
        languageId: sub.languageId,
        problem: prob,
        settings,
        concurrency: settings.concurrency || 4, // Configurable parallel test workers
        shouldStop: () => shouldStopRef.current,
        onProgress: (_done, _total, lastRes) => {
          const vText = lastRes.verdict === 'AC' ? 'Đúng' : `Sai (${lastRes.verdict})`;
          addLog(
            `  ${lastRes.testCaseName}: ${vText}. +${lastRes.score.toFixed(1)}đ (${lastRes.timeUsedMs}ms, ${lastRes.memoryUsedKb}KB)`,
            lastRes.verdict === 'AC' ? 'success' : 'error'
          );
          setJudgingHUDData((prev) => ({
            ...prev,
            currentTestCase: lastRes.testCaseName,
            lastVerdict: lastRes,
          }));
        },
      });

      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      sub.totalScore = totalScore;
      sub.testResults = results;
      sub.status = 'DONE';
      await storage.saveSubmission(sub);

      addLog(
        `=> Kết quả: ${sub.contestantName} [${sub.problemCode}]: ${totalScore.toFixed(2)} / ${prob.points} điểm.`,
        'success'
      );
      setProgressPercent(((i + 1) / targetSubs.length) * 100);

      // Live update state
      setSubmissions((prev) => {
        const idx = prev.findIndex((s) => s.id === sub.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...sub };
          return next;
        }
        return [...prev, { ...sub }];
      });
    }

    setIsJudging(false);
    setStatusText('Sẵn sàng');
    addLog('=== HOÀN THÀNH QUÁ TRÌNH CHẤM BÀI ===', 'success');
    if (!shouldStopRef.current) {
      setJudgingHUDData((prev) => ({
        ...prev,
        isCompleted: true,
      }));
      showToast('Hoàn thành chấm bài', `Đã chấm xong toàn bộ ${targetSubs.length} bài thi!`, 'success');
    }
  };

  // Unique students and problem codes
  const allUniqueStudentNames = Array.from(new Set(submissions.map((s) => s.contestantName)));
  const allContestProblemCodes = activeContest?.problems.map((p) => p.code.toUpperCase()) || [];

  const isSelectiveJudging =
    (allUniqueStudentNames.length > 0 && selectedStudentNames.size < allUniqueStudentNames.length) ||
    (allContestProblemCodes.length > 0 && selectedProblemCodes.size < allContestProblemCodes.length);

  // Submissions filtered by active selections (ticked problems & ticked students)
  const targetSubmissionsToJudge = submissions.filter(
    (s) =>
      selectedStudentNames.has(s.contestantName) &&
      selectedProblemCodes.has(s.problemCode.toUpperCase())
  );

  const handleToggleStudent = (studentName: string) => {
    setSelectedStudentNames((prev) => {
      const next = new Set(prev);
      if (next.has(studentName)) {
        next.delete(studentName);
      } else {
        next.add(studentName);
      }
      return next;
    });
  };

  const handleToggleAllStudents = (forceSelect?: boolean) => {
    setSelectedStudentNames((prev) => {
      if (forceSelect !== undefined) {
        return forceSelect ? new Set(allUniqueStudentNames) : new Set();
      }
      if (allUniqueStudentNames.length > 0 && allUniqueStudentNames.every((n) => prev.has(n))) {
        return new Set();
      } else {
        return new Set(allUniqueStudentNames);
      }
    });
  };

  const handleToggleProblem = (problemCode: string) => {
    const upper = problemCode.toUpperCase();
    setSelectedProblemCodes((prev) => {
      const next = new Set(prev);
      if (next.has(upper)) {
        next.delete(upper);
      } else {
        next.add(upper);
      }
      return next;
    });
  };

  const handleToggleAllProblems = (forceSelect?: boolean) => {
    if (!activeContest) return;
    const allCodes = activeContest.problems.map((p) => p.code.toUpperCase());
    setSelectedProblemCodes((prev) => {
      if (forceSelect !== undefined) {
        return forceSelect ? new Set(allCodes) : new Set();
      }
      if (allCodes.length > 0 && allCodes.every((c) => prev.has(c))) {
        return new Set();
      } else {
        return new Set(allCodes);
      }
    });
  };

  const handleInvertStudentSelection = () => {
    setSelectedStudentNames((prev) => {
      const next = new Set<string>();
      allUniqueStudentNames.forEach((n) => {
        if (!prev.has(n)) next.add(n);
      });
      return next;
    });
  };

  const handleInvertProblemSelection = () => {
    if (!activeContest) return;
    const allCodes = activeContest.problems.map((p) => p.code.toUpperCase());
    setSelectedProblemCodes((prev) => {
      const next = new Set<string>();
      allCodes.forEach((c) => {
        if (!prev.has(c)) next.add(c);
      });
      return next;
    });
  };

  const handleClearScores = async () => {
    if (!activeContest) return;
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ kết quả điểm của tất cả thí sinh?')) return;
    const cleared = submissions.map((s) => ({
      ...s,
      status: 'PENDING' as const,
      totalScore: 0,
      testResults: [],
    }));
    for (const s of cleared) {
      await storage.saveSubmission(s);
    }
    setSubmissions(cleared);
    addLog('Đã xóa toàn bộ điểm của các thí sinh.', 'info');
    showToast('Đã xóa điểm', 'Đã đặt lại điểm số của toàn bộ thí sinh về 0.00', 'info');
  };

  // Global Keyboard Shortcuts (matching Themis Delphi Windows F1-F11, Ctrl shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setMainTab('docs');
      } else if (e.key === 'F2') {
        e.preventDefault();
        taskFolderInputRef.current?.click();
      } else if (e.key === 'F3') {
        e.preventDefault();
        submissionFolderInputRef.current?.click();
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (!isJudging) handleStartJudging();
      } else if (e.key === 'F6') {
        e.preventDefault();
        setShowTasksModal(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleStopJudging();
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (e.ctrlKey) {
          handleRejudgeAll();
        } else if (e.shiftKey) {
          handleExportExcel();
        } else {
          if (isJudging) {
            setShowJudgingHUD((prev) => !prev);
          } else {
            handleStartJudging();
          }
        }
      } else if (e.key === 'F10' || e.key === 'F11') {
        e.preventDefault();
        setShowSettingsModal(true);
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNewContest();
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        zipInputRef.current?.click();
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveContestZip();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleToggleAllProblems(true);
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleToggleAllProblems(false);
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleInvertProblemSelection();
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleToggleAllStudents(true);
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleToggleAllStudents(false);
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleInvertStudentSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeContest, submissions, isJudging, targetSubmissionsToJudge]);

  const handleResetSelectionToDefault = () => {
    if (activeContest) {
      setSelectedProblemCodes(new Set(activeContest.problems.map((p) => p.code.toUpperCase())));
    }
    setSelectedStudentNames(new Set(allUniqueStudentNames));
    addLog('Đã đặt lại bộ lọc chấm: Chọn toàn bộ thí sinh và toàn bộ bài toán.', 'info');
  };

  const handleStartJudging = async () => {
    if (!activeContest || activeContest.problems.length === 0) {
      addLog('Lỗi: Kỳ thi chưa có bài toán nào để chấm!', 'error');
      alert('Kỳ thi chưa có bài toán nào. Vui lòng bấm "Nạp folder Đề & Test" hoặc "Mở đề (.zip)" trước!');
      return;
    }

    if (submissions.length === 0) {
      setShowBatchModal(true);
      return;
    }

    if (targetSubmissionsToJudge.length === 0) {
      addLog(
        'Cảnh báo: Không có bài nộp nào được chọn để chấm (kiểm tra lại tick chọn bài và thí sinh).',
        'warning'
      );
      alert(
        'Không có bài nộp nào phù hợp với lựa chọn hiện tại! Vui lòng tick chọn ít nhất 1 thí sinh và 1 bài toán để chấm.'
      );
      return;
    }

    if (isSelectiveJudging) {
      addLog(
        `=> Bắt đầu chấm có chọn lọc: ${targetSubmissionsToJudge.length} bài thi (${selectedStudentNames.size} thí sinh, ${selectedProblemCodes.size} bài toán)`,
        'info'
      );
    }

    await judgeSubmissionList(targetSubmissionsToJudge);
  };

  const handleRejudgeAll = async () => {
    if (!activeContest || submissions.length === 0) {
      addLog('Không có bài nộp nào để chấm lại.', 'warning');
      return;
    }
    if (targetSubmissionsToJudge.length === 0) {
      alert('Không có bài nộp nào phù hợp với bộ lọc hiện tại để chấm lại!');
      return;
    }
    await judgeSubmissionList(targetSubmissionsToJudge);
  };

  const handleStopJudging = () => {
    shouldStopRef.current = true;
    setIsJudging(false);
    setStatusText('Đã dừng chấm.');
    addLog('Người dùng đã bấm Dừng chấm (Stop).', 'warning');
    showToast('Đã dừng chấm', 'Quá trình chấm bài đã được tạm dừng', 'warning');
  };

  /**
   * Export to CSV
   */
  const handleExportCSV = () => {
    if (!activeContest) return;
    const rows = calculateScoreboard(activeContest, submissions);
    const csvContent = exportScoreboardToCSV(activeContest, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KetQua_${activeContest.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`Đã xuất kết quả ra file KetQua_${activeContest.title}.csv (chuẩn UTF-8 BOM)`, 'info');
    showToast('Xuất CSV thành công', `Đã tải về tệp KetQua_${activeContest.title}.csv`, 'success');
  };

  /**
   * Export to Excel (.xls HTML table)
   */
  const handleExportExcel = () => {
    if (!activeContest) return;
    const rows = calculateScoreboard(activeContest, submissions);
    const htmlContent = exportScoreboardToExcelHTML(activeContest, rows);
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KetQua_${activeContest.title.replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`Đã xuất bảng điểm ra file Excel KetQua_${activeContest.title}.xls`, 'info');
    showToast('Xuất Excel thành công', `Đã tải về tệp KetQua_${activeContest.title}.xls`, 'success');
  };

  /**
   * Export to Text (.txt)
   */
  const handleExportTXT = () => {
    if (!activeContest) return;
    const rows = calculateScoreboard(activeContest, submissions);
    const txtContent = exportScoreboardToTXT(activeContest, rows);
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KetQua_${activeContest.title.replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`Đã xuất kết quả ra file Text KetQua_${activeContest.title}.txt`, 'info');
    showToast('Xuất Text thành công', `Đã tải về tệp KetQua_${activeContest.title}.txt`, 'success');
  };

  /**
   * Export to JSON (.themis)
   */
  const handleSaveContest = () => {
    if (!activeContest) return;
    const blob = exportContestToJSON(activeContest);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeContest.title.replace(/\s+/g, '_')}.themis`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog(`Đã lưu gói kỳ thi ${activeContest.title}.themis`, 'info');
    showToast('Lưu kỳ thi', `Đã xuất tệp cấu hình ${activeContest.title}.themis`, 'success');
  };

  /**
   * Export to Authentic Themis .contest ZIP Package
   */
  const handleSaveContestZip = async () => {
    if (!activeContest) return;
    try {
      addLog(`Đang đóng gói kỳ thi ${activeContest.title} ra tệp .contest chuẩn Themis...`, 'info');
      const blob = await exportContestToContestZip(activeContest, submissions);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeContest.title.replace(/\s+/g, '_')}.contest`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog(`Đã lưu gói kỳ thi chuẩn Themis ${activeContest.title}.contest thành công!`, 'success');
      showToast('Đã xuất gói kỳ thi', `Đã đóng gói ${activeContest.title}.contest chuẩn Themis`, 'success');
    } catch (err: any) {
      addLog(`Lỗi khi tạo gói .contest: ${err.message}`, 'error');
      showToast('Lỗi xuất gói kỳ thi', err.message, 'error');
    }
  };

  /**
   * 1. Nạp Thư mục Đề thi & Test Cases (Ví dụ: 13.11 - Phuc Lai cham)
   */
  const handleOpenTaskFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      addLog('Đang đọc cấu trúc thư mục Đề thi & Test Cases...', 'info');
      const { contestTitle, problems, warnings } = await parseThemisTaskFolder(files);

      if (problems.length === 0) {
        addLog('Không tìm thấy bài toán hoặc file .INP/.OUT nào trong thư mục!', 'error');
        alert(
          'Không tìm thấy bài toán nào trong thư mục được chọn. Cấu trúc chuẩn: Thư mục chứa các folder bài (VD: CHUYENDE/Test01/CHUYENDE.INP & .OUT)!'
        );
        return;
      }

      const currentTitle = contestTitle || activeContest?.title || 'KỲ THI MỚI';
      const contestId = activeContest?.id || `contest-${Date.now()}`;
      const newContest: Contest = {
        id: contestId,
        title: currentTitle,
        createdAt: activeContest?.createdAt || Date.now(),
        problems,
      };

      onUpdateContest(newContest);
      const totalTests = problems.reduce((s, p) => s + p.testCases.length, 0);
      addLog(
        `Đã nạp thành công kỳ thi "${currentTitle}" gồm ${problems.length} bài toán (${problems
          .map((p) => p.code)
          .join(', ')}) với tổng cộng ${totalTests} test cases!`,
        'success'
      );
      showToast('Đã nạp Đề thi & Test cases', `Nạp thành công ${problems.length} bài toán (${totalTests} tests)`, 'success');

      if (warnings.length > 0) {
        warnings.forEach((w) => addLog(`Cảnh báo: ${w}`, 'warning'));
      }
    } catch (err: any) {
      addLog(`Lỗi nạp thư mục đề thi: ${err.message}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  /**
   * 2. Nạp Thư mục Bài làm Học sinh (Mỗi folder con là tên 1 học sinh)
   */
  const handleOpenSubmissionFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!activeContest || activeContest.problems.length === 0) {
      alert('Vui lòng nạp Đề thi & Test cases trước khi nạp bài làm của học sinh!');
      addLog('Cảnh báo: Hãy nạp Đề thi trước khi nạp bài học sinh.', 'warning');
      e.target.value = '';
      return;
    }

    try {
      addLog('Đang quét thư mục bài làm của học sinh...', 'info');
      const parsedSubmissions = await parseThemisSubmissionFolder(files);

      if (parsedSubmissions.length === 0) {
        addLog('Không tìm thấy file mã nguồn học sinh (.cpp, .pas, .py, .java, .c) nào trong thư mục!', 'error');
        alert('Không tìm thấy file mã nguồn học sinh nào trong thư mục được chọn.');
        return;
      }

      const studentNames = Array.from(new Set(parsedSubmissions.map((s) => s.contestantName)));
      addLog(
        `Đã phát hiện ${parsedSubmissions.length} bài làm của ${studentNames.length} học sinh: ${studentNames.join(
          ', '
        )}`,
        'info'
      );

      const createdSubs: Submission[] = [];
      for (const item of parsedSubmissions) {
        const targetProb = activeContest.problems.find(
          (p) => p.code.toUpperCase() === item.problemCode.toUpperCase()
        );

        const sub: Submission = {
          id: `sub-${Date.now()}-${Math.random()}`,
          contestId: activeContest.id,
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
        createdSubs.push(sub);
      }

      const allSubs = await storage.getSubmissions(activeContest.id);
      setSubmissions(allSubs);
      addLog(
        `Đã nạp thành công ${createdSubs.length} bài nộp vào danh sách kỳ thi (Trạng thái: Chờ chấm). Nhấn F9 hoặc bấm "Chấm bài" để bắt đầu chấm.`,
        'success'
      );
      showToast('Đã nạp bài làm thí sinh', `Đã nạp ${createdSubs.length} bài nộp của ${studentNames.length} học sinh`, 'success');
    } catch (err: any) {
      addLog(`Lỗi nạp thư mục học sinh: ${err.message}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  /**
   * 3. Mở gói zip hoặc file .themis
   */
  const handleOpenThemisZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.themis') || file.name.endsWith('.json')) {
      const text = await file.text();
      try {
        const imported = importContestFromJSON(text);
        onUpdateContest(imported);
        addLog(`Đã nạp thành công kỳ thi "${imported.title}" từ file .themis!`, 'success');
        showToast('Đã nạp kỳ thi', `Đã mở kỳ thi "${imported.title}"`, 'success');
      } catch (err: any) {
        addLog(`Lỗi đọc file .themis: ${err.message}`, 'error');
      }
    } else {
      // ZIP or .contest containing tasks and/or student submissions
      try {
        const { contestTitle, problems, warnings } = await parseThemisZip(file);
        if (problems.length === 0) {
          addLog('Không tìm thấy bài toán hoặc test case nào trong file zip/contest!', 'error');
          return;
        }

        const currentContest = activeContest || {
          id: `contest-${Date.now()}`,
          title: contestTitle || file.name.replace(/\.[^/.]+$/, ''),
          createdAt: Date.now(),
          problems: [],
        };

        const updated = {
          ...currentContest,
          title: contestTitle || currentContest.title,
          problems: [...currentContest.problems, ...problems],
        };

        onUpdateContest(updated);
        addLog(`Đã giải nén và nạp thành công ${problems.length} bài toán từ ${file.name}!`, 'success');
        showToast('Đã nạp file ZIP', `Đã giải nén ${problems.length} bài toán từ ${file.name}`, 'success');
        if (warnings.length > 0) {
          warnings.forEach((w) => addLog(`Cảnh báo: ${w}`, 'warning'));
        }

        // Check if there are also contestant submissions inside this package (e.g. .Contest archive)
        try {
          const subsFromZip = await parseThemisSubmissionZip(file);
          if (subsFromZip.length > 0) {
            const createdSubs: Submission[] = [];
            for (const item of subsFromZip) {
              const matchedProb = updated.problems.find(
                (p) => p.code.toUpperCase() === item.problemCode.toUpperCase()
              );
              const sub: Submission = {
                id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                contestId: updated.id,
                problemId: matchedProb?.id || item.problemCode,
                contestantName: item.contestantName,
                problemCode: item.problemCode,
                languageId: item.languageId,
                sourceCode: item.sourceCode,
                status: 'PENDING',
                totalScore: 0,
                maxScore: matchedProb?.points || 1.0,
                testResults: [],
                createdAt: Date.now(),
              };
              await storage.saveSubmission(sub);
              createdSubs.push(sub);
            }
            const allSubs = await storage.getSubmissions(updated.id);
            setSubmissions(allSubs);
            addLog(`Đã nạp tự động ${createdSubs.length} bài làm của thí sinh từ gói kỳ thi ${file.name}!`, 'success');
          }
        } catch (subErr) {
          // If no submissions in zip, ignore quietly
        }
      } catch (err: any) {
        addLog(`Lỗi giải nén zip: ${err.message}`, 'error');
      }
    }
    e.target.value = '';
  };

  /**
   * 4. Nạp các tệp bài nộp lẻ (.cpp, .pas, .py, .java, .c, .zip)
   * Đưa vào danh sách nộp ở trạng thái PENDING (0.00 điểm, Chờ chấm), KHÔNG chấm lẻ ngay!
   */
  const handleOpenIndividualFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!activeContest || activeContest.problems.length === 0) {
      alert('Vui lòng nạp Đề thi & Test cases trước khi nạp bài làm của học sinh!');
      addLog('Cảnh báo: Hãy nạp Đề thi trước khi nạp bài học sinh.', 'warning');
      e.target.value = '';
      return;
    }

    try {
      addLog(`Đang xử lý ${files.length} tệp bài nộp lẻ...`, 'info');
      const createdSubs: Submission[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.endsWith('.zip')) {
          const zipContent = await file.arrayBuffer();
          const parsed = await parseThemisSubmissionZip(zipContent);
          for (const item of parsed) {
            const targetProb = activeContest.problems.find(
              (p) => p.code.toUpperCase() === item.problemCode.toUpperCase()
            );
            const sub: Submission = {
              id: `sub-${Date.now()}-${Math.random()}`,
              contestId: activeContest.id,
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
            createdSubs.push(sub);
          }
        } else {
          const sourceCode = await file.text();
          const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
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
            } else {
              const matchedProblem = activeContest.problems.find(
                (p) => p.code.toUpperCase() === nameWithoutExt.toUpperCase()
              );
              if (matchedProblem) {
                problem = matchedProblem.code;
              }
            }
          }

          const targetProb = activeContest.problems.find(
            (p) => p.code.toUpperCase() === problem.toUpperCase()
          );

          const sub: Submission = {
            id: `sub-${Date.now()}-${Math.random()}`,
            contestId: activeContest.id,
            problemId: targetProb?.id || `prob-${problem}`,
            problemCode: problem,
            contestantName: contestant,
            languageId: detectLanguageId(file.name),
            sourceCode,
            status: 'PENDING',
            totalScore: 0,
            maxScore: targetProb?.points || 10,
            testResults: [],
            createdAt: Date.now(),
          };

          await storage.saveSubmission(sub);
          createdSubs.push(sub);
        }
      }

      const allSubs = await storage.getSubmissions(activeContest.id);
      setSubmissions(allSubs);
      addLog(
        `Đã nạp thành công ${createdSubs.length} bài nộp lẻ vào danh sách (Chờ chấm). Nhấn F9 hoặc bấm "Chấm bài" để bắt đầu chấm.`,
        'success'
      );
      showToast('Đã nạp tệp bài nộp', `Đã thêm ${createdSubs.length} bài nộp vào danh sách`, 'success');
    } catch (err: any) {
      addLog(`Lỗi khi nạp file lẻ: ${err.message}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  /**
   * Manual upload for a specific student who didn't submit yet
   */
  const handleUploadForStudent = async (contestantName: string, problemCode: string, file: File) => {
    if (!activeContest) return;
    const sourceCode = await file.text();
    const targetProb = activeContest.problems.find(
      (p) => p.code.toUpperCase() === problemCode.toUpperCase()
    );

    const sub: Submission = {
      id: `sub-${Date.now()}-${Math.random()}`,
      contestId: activeContest.id,
      problemId: targetProb?.id || `prob-${problemCode}`,
      problemCode,
      contestantName,
      languageId: detectLanguageId(file.name),
      sourceCode,
      status: 'PENDING',
      totalScore: 0,
      maxScore: targetProb?.points || 10,
      testResults: [],
      createdAt: Date.now(),
    };

    await storage.saveSubmission(sub);
    const allSubs = await storage.getSubmissions(activeContest.id);
    setSubmissions(allSubs);
    setSelectedSubmission(sub);
    addLog(`Đã nạp file bài làm ${file.name} cho thí sinh ${contestantName} (Chờ chấm). Nhấn F9 hoặc bấm "Chấm bài" để chấm.`, 'success');
  };

  /**
   * Đổi tên thí sinh trong toàn bộ cơ sở dữ liệu và cập nhật bảng điểm
   */
  const handleRenameStudent = async (oldName: string, newName: string) => {
    if (!activeContest) return;
    try {
      await storage.renameStudent(activeContest.id, oldName, newName);
      const updated = await storage.getSubmissions(activeContest.id);
      setSubmissions(updated);
      if (selectedSubmission && selectedSubmission.contestantName === oldName) {
        setSelectedSubmission({ ...selectedSubmission, contestantName: newName });
      }
      if (selectedCellInfo && selectedCellInfo.contestantName === oldName) {
        setSelectedCellInfo({ ...selectedCellInfo, contestantName: newName });
      }
      addLog(`Đã đổi tên thí sinh "${oldName}" thành "${newName}".`, 'info');
      showToast('Đổi tên thí sinh', `Đã đổi "${oldName}" thành "${newName}"`, 'success');
    } catch (err: any) {
      addLog(`Lỗi khi đổi tên thí sinh: ${err.message}`, 'error');
      showToast('Lỗi đổi tên', err.message, 'error');
    }
  };

  /**
   * Xoá thí sinh và toàn bộ bài làm của thí sinh đó
   */
  const handleDeleteStudent = async (studentName: string) => {
    if (!activeContest) return;
    try {
      await storage.deleteStudentSubmissions(activeContest.id, studentName);
      const updated = await storage.getSubmissions(activeContest.id);
      setSubmissions(updated);
      if (selectedSubmission && selectedSubmission.contestantName === studentName) {
        setSelectedSubmission(null);
        setSelectedCellInfo(null);
      }
      addLog(`Đã xoá thí sinh "${studentName}" và toàn bộ bài làm liên quan.`, 'warning');
      showToast('Đã xóa thí sinh', `Đã xóa thí sinh "${studentName}"`, 'info');
    } catch (err: any) {
      addLog(`Lỗi khi xoá thí sinh: ${err.message}`, 'error');
      showToast('Lỗi xóa thí sinh', err.message, 'error');
    }
  };

  /**
   * Chấm lại toàn bộ bài thi của 1 thí sinh cụ thể
   */
  const handleRejudgeStudent = async (studentName: string) => {
    if (!activeContest) return;
    const studentSubs = submissions.filter((s) => s.contestantName === studentName);
    if (studentSubs.length === 0) {
      addLog(`Thí sinh "${studentName}" chưa có bài nộp nào để chấm lại.`, 'warning');
      return;
    }
    addLog(`Bắt đầu chấm lại cho thí sinh "${studentName}" (${studentSubs.length} bài)...`, 'info');
    await judgeSubmissionList(studentSubs);
  };

  /**
   * Thêm thí sinh mới vào danh sách kỳ thi
   */
  const handleAddStudent = async (studentName: string) => {
    if (!activeContest) return;
    const cleanName = studentName.trim();
    if (!cleanName) return;

    // Check if student already exists
    const existing = submissions.some(
      (s) => s.contestantName.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      alert(`Thí sinh "${cleanName}" đã có trong danh sách!`);
      return;
    }

    if (activeContest.problems.length > 0) {
      const prob = activeContest.problems[0];
      const placeholder: Submission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        contestId: activeContest.id,
        problemId: prob.id,
        problemCode: prob.code,
        contestantName: cleanName,
        languageId: 54, // cpp
        sourceCode: `// Bài làm của thí sinh: ${cleanName}\n// Chưa nạp file mã nguồn\n`,
        status: 'PENDING',
        totalScore: 0,
        maxScore: prob.points,
        testResults: [],
        createdAt: Date.now(),
      };
      await storage.saveSubmission(placeholder);
      const updated = await storage.getSubmissions(activeContest.id);
      setSubmissions(updated);
    }

    addLog(
      `Đã thêm thí sinh "${cleanName}". Bạn có thể bấm vào ô bài trên bảng điểm để nạp file mã nguồn hoặc chỉnh sửa code trực tiếp.`,
      'success'
    );
    showToast('Thêm thí sinh', `Đã thêm thí sinh "${cleanName}"`, 'success');
  };

  /**
   * Xoá toàn bộ thí sinh và bài làm trong kỳ thi
   */
  const handleClearAllStudents = async () => {
    if (!activeContest) return;
    try {
      await storage.clearSubmissions(activeContest.id);
      setSubmissions([]);
      setSelectedSubmission(null);
      setSelectedCellInfo(null);
      addLog('Đã xoá toàn bộ danh sách thí sinh và bài làm trong kỳ thi!', 'warning');
      showToast('Đã xóa danh sách', 'Đã xóa toàn bộ thí sinh trong kỳ thi', 'info');
    } catch (err: any) {
      addLog(`Lỗi khi xoá toàn bộ thí sinh: ${err.message}`, 'error');
    }
  };

  /**
   * Lưu code mới đã chỉnh sửa và chấm lại bài nộp này ngay lập tức
   */
  const handleSaveAndRejudgeCode = async (sub: Submission, newSourceCode: string) => {
    if (!activeContest) return;
    try {
      const updatedSub: Submission = {
        ...sub,
        sourceCode: newSourceCode,
        status: 'PENDING',
      };
      await storage.saveSubmission(updatedSub);
      addLog(
        `Đã lưu mã nguồn mới cho bài [${sub.problemCode}] của "${sub.contestantName}". Bắt đầu chấm lại ngay...`,
        'info'
      );
      showToast('Lưu mã nguồn', `Đang chấm lại bài của "${sub.contestantName}"`, 'info');
      await judgeSubmissionList([updatedSub]);
      const reloaded = await storage.getSubmission(sub.id);
      if (reloaded) {
        setSelectedSubmission(reloaded);
      }
    } catch (err: any) {
      addLog(`Lỗi lưu & chấm lại code: ${err.message}`, 'error');
      showToast('Lỗi lưu mã nguồn', err.message, 'error');
    }
  };

  /**
   * Xoá 1 bài nộp cụ thể
   */
  const handleDeleteSubmission = async (submissionId: string) => {
    if (!activeContest) return;
    try {
      await storage.deleteSubmission(submissionId);
      const updated = await storage.getSubmissions(activeContest.id);
      setSubmissions(updated);
      setSelectedSubmission(null);
      setSelectedCellInfo(null);
      addLog('Đã xoá bài nộp thành công.', 'warning');
      showToast('Đã xóa bài nộp', 'Bài nộp đã được xóa khỏi hệ thống', 'info');
    } catch (err: any) {
      addLog(`Lỗi khi xoá bài nộp: ${err.message}`, 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen select-none font-sans overflow-hidden transition-colors bg-[#F5F5F7] dark:bg-[#121214] text-neutral-900 dark:text-neutral-100 antialiased">
      {/* 1. Title Bar */}
      <ThemisWindowTitleBar
        title={activeContest?.title || ''}
      />

      {/* 2. Menu Bar */}
      <ThemisMenuBar
        contestTitle={activeContest?.title || ''}
        isJudging={isJudging}
        isHUDOpen={showJudgingHUD}
        onOpenJudgingHUD={() => setShowJudgingHUD(true)}
        onNewContest={onNewContest}
        onOpenTaskFolder={() => taskFolderInputRef.current?.click()}
        onOpenZip={() => zipInputRef.current?.click()}
        onOpenSubmissionFolder={() => submissionFolderInputRef.current?.click()}
        onAddSubmissions={() => individualFileInputRef.current?.click()}
        onSaveContest={handleSaveContest}
        onSaveContestZip={handleSaveContestZip}
        onStartJudging={handleStartJudging}
        onPauseJudging={() => setIsPaused(!isPaused)}
        onStopJudging={handleStopJudging}
        onRejudgeAll={handleRejudgeAll}
        onOpenTasksConfig={() => setShowTasksModal(true)}
        onOpenStudentManager={() => setShowStudentManagerModal(true)}
        onOpenSelectiveJudging={() => setShowSelectiveModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        onExportTXT={handleExportTXT}
        onSelectAllTasks={() => handleToggleAllProblems(true)}
        onDeselectAllTasks={() => handleToggleAllProblems(false)}
        onInvertTasks={handleInvertProblemSelection}
        onSelectAllStudents={() => handleToggleAllStudents(true)}
        onDeselectAllStudents={() => handleToggleAllStudents(false)}
        onInvertStudents={handleInvertStudentSelection}
        onClearScores={handleClearScores}
        onShowDocs={() => setMainTab('docs')}
      />

      {/* 3. Toolbar */}
      <ThemisToolbar
        isJudging={isJudging}
        isHUDOpen={showJudgingHUD}
        onOpenJudgingHUD={() => setShowJudgingHUD(true)}
        isSelectiveJudging={isSelectiveJudging}
        selectedSubmissionsCount={targetSubmissionsToJudge.length}
        onOpenSelectiveModal={() => setShowSelectiveModal(true)}
        onStartJudging={handleStartJudging}
        onPauseJudging={() => setIsPaused(!isPaused)}
        onStopJudging={handleStopJudging}
        onOpenTaskFolder={() => taskFolderInputRef.current?.click()}
        onOpenZip={() => zipInputRef.current?.click()}
        onOpenSubmissionFolder={() => submissionFolderInputRef.current?.click()}
        onAddSubmissions={() => individualFileInputRef.current?.click()}
        onOpenTasksModal={() => setShowTasksModal(true)}
        onOpenStudentManager={() => setShowStudentManagerModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        onExportTXT={handleExportTXT}
        onExportJSON={handleSaveContest}
        onNewContest={onNewContest}
        onSaveContestZip={handleSaveContestZip}
      />

      {/* Hidden File & Folder Inputs */}
      {/* Folder Picker: Đề thi & Test Cases */}
      <input
        type="file"
        ref={taskFolderInputRef}
        onChange={handleOpenTaskFolder}
        className="hidden"
      />

      {/* Folder Picker: Bài làm học sinh */}
      <input
        type="file"
        ref={submissionFolderInputRef}
        onChange={handleOpenSubmissionFolder}
        className="hidden"
      />

      {/* File Picker: Bài nộp lẻ (.cpp, .pas, .py, .java, .c, .zip) */}
      <input
        type="file"
        ref={individualFileInputRef}
        onChange={handleOpenIndividualFiles}
        multiple
        accept=".cpp,.pas,.py,.java,.c,.zip"
        className="hidden"
      />

      {/* File Picker: Zip hoặc Themis */}
      <input
        type="file"
        ref={zipInputRef}
        onChange={handleOpenThemisZip}
        accept=".contest,.zip,.themis,.json"
        className="hidden"
      />

      {/* 4. Tab Bar (Bảng điểm / Hướng dẫn F1) */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/60 dark:bg-[#18181B]/60 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] select-none text-[12px] transition-colors">
        <div className="inline-flex p-0.5 bg-black/[0.05] dark:bg-white/[0.08] rounded-xl">
          <button
            onClick={() => setMainTab('scoreboard')}
            className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-lg text-[12px] font-medium transition-all ${
              mainTab === 'scoreboard'
                ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Bảng điểm (F5)</span>
          </button>
          <button
            onClick={() => setMainTab('docs')}
            className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-lg text-[12px] font-medium transition-all ${
              mainTab === 'docs'
                ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Hướng dẫn sử dụng (F1)</span>
          </button>
        </div>
      </div>

      {mainTab === 'scoreboard' ? (
        /* Work Area: Full Height Scoreboard */
        <div className="flex-1 flex flex-col p-2 overflow-hidden min-h-0 bg-[#F5F5F7] dark:bg-[#121214] transition-colors">
          <ThemisScoreboardGrid
            contest={activeContest}
            submissions={submissions}
            selectedStudentNames={selectedStudentNames}
            selectedProblemCodes={selectedProblemCodes}
            onToggleStudent={handleToggleStudent}
            onToggleAllStudents={handleToggleAllStudents}
            onToggleProblem={handleToggleProblem}
            onOpenSelectiveJudgeModal={() => setShowSelectiveModal(true)}
            onSelectSubmissionDetail={(sub, contestant, code) => {
              setSelectedSubmission(sub);
              setSelectedCellInfo({ contestantName: contestant, problemCode: code });
            }}
            onOpenStudentManager={(name) => {
              setSelectedStudentForEdit(name || null);
              setShowStudentManagerModal(true);
            }}
            onOpenProblemConfig={(code) => {
              const p = activeContest?.problems.find(
                (prob) => prob.code.toUpperCase() === code?.toUpperCase()
              );
              if (p) {
                setSelectedProblemForDetail(p);
              }
            }}
          />
        </div>
      ) : (
        /* Docs Area */
        <div className="flex-1 overflow-hidden p-3 flex flex-col bg-[#F5F5F7] dark:bg-[#121214] transition-colors">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.06] dark:border-white/[0.08] text-xs">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Tài liệu hướng dẫn Themis</span>
          </div>
          <iframe
            src="/docs/themis.html"
            title="Themis Documentation"
            className="w-full flex-1 bg-white rounded-xl border border-black/10 dark:border-white/10 shadow-sm"
          />
        </div>
      )}

      {/* 5. Status Bar (Clean minimalist Apple footer, no progress bar) */}
      <ThemisStatusBar
        statusText={statusText}
        isJudging={isJudging}
        totalSubmissions={submissions.length}
        totalProblems={activeContest?.problems.length || 0}
      />

      {/* Judging Progress Alert Card / HUD */}
      <ThemisJudgingHUD
        isOpen={showJudgingHUD}
        isJudging={isJudging}
        progressPercent={progressPercent}
        currentContestant={judgingHUDData.currentContestant}
        currentProblemCode={judgingHUDData.currentProblemCode}
        currentTestCase={judgingHUDData.currentTestCase}
        currentIndex={judgingHUDData.currentIndex}
        totalCount={judgingHUDData.totalCount}
        lastVerdict={judgingHUDData.lastVerdict}
        isCompleted={judgingHUDData.isCompleted}
        onStopJudging={handleStopJudging}
        onClose={() => setShowJudgingHUD(false)}
      />

      {/* Apple Toast Notifications in bottom-right corner */}
      <ThemisToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />

      {/* Modals & Dialogs */}
      {/* Tasks Management Dialog (Danh sách các đề bài) */}
      {showTasksModal && activeContest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden text-xs font-sans transition-colors">
            <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between select-none shrink-0">
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">Themis - Danh sách các bài thi & Test Cases</span>
              <button
                onClick={() => setShowTasksModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-[#F5F5F7] dark:bg-[#161618]">
              <AdminProblemManager
                contest={activeContest}
                onUpdateContest={(c) => {
                  onUpdateContest(c);
                  addLog(`Đã cập nhật danh sách bài thi cho kỳ thi "${c.title}"`, 'info');
                }}
                onEditProblem={(prob) => {
                  setShowTasksModal(false);
                  setSelectedProblemForDetail(prob);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Single Problem Detail & Test Case Editor Modal (Khung đề bài riêng biệt) */}
      <ThemisProblemDetailModal
        isOpen={selectedProblemForDetail !== null}
        problem={selectedProblemForDetail}
        onClose={() => setSelectedProblemForDetail(null)}
        onSaveProblem={(updatedProb) => {
          if (activeContest) {
            const nextProblems = activeContest.problems.map((p) =>
              p.id === updatedProb.id ? updatedProb : p
            );
            const nextContest = { ...activeContest, problems: nextProblems };
            onUpdateContest(nextContest);
            showToast('Cập nhật đề bài', `Đã lưu cấu hình bài toán "${updatedProb.code}"`, 'success');
          }
        }}
      />

      {/* Batch Judging / Submission Uploader Dialog */}
      {showBatchModal && activeContest && (
        <BatchJudgeModal
          contest={activeContest}
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          onGradingCompleted={async () => {
            const subs = await storage.getSubmissions(activeContest.id);
            setSubmissions(subs);
            addLog(`Đã hoàn tất chấm hàng loạt. Tổng cộng hiện có ${subs.length} bài nộp.`, 'success');
          }}
        />
      )}

      {/* Submission Detail / Missing File Inspector Dialog */}
      <ThemisSubmissionModal
        submission={selectedSubmission}
        cellInfo={selectedCellInfo}
        onClose={() => {
          setSelectedSubmission(null);
          setSelectedCellInfo(null);
        }}
        onUploadForStudent={handleUploadForStudent}
        onSaveAndRejudgeCode={handleSaveAndRejudgeCode}
        onRenameStudent={handleRenameStudent}
        onDeleteSubmission={handleDeleteSubmission}
      />

      {/* Student Management Dialog */}
      <ThemisStudentManagerModal
        isOpen={showStudentManagerModal}
        contest={activeContest}
        submissions={submissions}
        initialStudentName={selectedStudentForEdit}
        onClose={() => {
          setShowStudentManagerModal(false);
          setSelectedStudentForEdit(null);
        }}
        onRenameStudent={handleRenameStudent}
        onDeleteStudent={handleDeleteStudent}
        onRejudgeStudent={handleRejudgeStudent}
        onAddStudent={handleAddStudent}
        onClearAllStudents={handleClearAllStudents}
      />

      {/* Selective Judging Options Dialog */}
      <ThemisSelectiveJudgeModal
        isOpen={showSelectiveModal}
        contest={activeContest}
        submissions={submissions}
        selectedStudentNames={selectedStudentNames}
        selectedProblemCodes={selectedProblemCodes}
        onClose={() => setShowSelectiveModal(false)}
        onToggleStudent={handleToggleStudent}
        onToggleProblem={handleToggleProblem}
        onSelectAllStudents={(sel) => handleToggleAllStudents(sel)}
        onSelectAllProblems={(sel) => handleToggleAllProblems(sel)}
        onInvertStudentSelection={handleInvertStudentSelection}
        onResetToDefault={handleResetSelectionToDefault}
        onStartJudging={handleStartJudging}
      />

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        colorMode={colorMode}
        onSetColorMode={setColorMode}
        onSaveNotification={() =>
          showToast('Cấu hình hệ thống', 'Đã lưu cài đặt máy chủ và tùy chọn chấm bài', 'success')
        }
        onClearData={async () => {
          if (activeContest) {
            await storage.clearSubmissions(activeContest.id);
            setSubmissions([]);
            addLog('Đã xóa toàn bộ lịch sử nộp bài của kỳ thi.', 'warning');
            showToast('Đã xóa dữ liệu', 'Đã xóa toàn bộ lịch sử nộp bài của kỳ thi', 'info');
          }
        }}
      />

      {/* About Dialog */}
      <ThemisAboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
};
