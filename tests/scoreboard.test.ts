import { describe, it, expect } from 'vitest';
import { Contest, Submission } from '../src/types';
import { 
  calculateScoreboard, 
  exportScoreboardToCSV, 
  exportScoreboardToTXT, 
  exportScoreboardToExcelHTML 
} from '../src/utils/csvExporter';

describe('Scoreboard Calculation & Multi-Format Export', () => {
  const mockContest: Contest = {
    id: 'c-test',
    title: 'Kỳ Thi Test 2026',
    createdAt: Date.now(),
    problems: [
      {
        id: 'p1',
        code: 'BAI1',
        title: 'Bài 1',
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        ioMode: 'STANDARD',
        testCases: [],
        points: 10,
      },
      {
        id: 'p2',
        code: 'BAI2',
        title: 'Bài 2',
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        ioMode: 'STANDARD',
        testCases: [],
        points: 10,
      },
    ],
  };

  const mockSubmissions: Submission[] = [
    {
      id: 's1',
      contestId: 'c-test',
      problemId: 'p1',
      problemCode: 'BAI1',
      contestantName: 'An',
      languageId: 54,
      sourceCode: '',
      status: 'DONE',
      totalScore: 8.0,
      maxScore: 10,
      testResults: [],
      createdAt: 1000,
    },
    {
      id: 's2',
      contestId: 'c-test',
      problemId: 'p1',
      problemCode: 'BAI1',
      contestantName: 'Binh',
      languageId: 54,
      sourceCode: '',
      status: 'DONE',
      totalScore: 10.0,
      maxScore: 10,
      testResults: [],
      createdAt: 2000,
    },
    {
      id: 's3',
      contestId: 'c-test',
      problemId: 'p2',
      problemCode: 'BAI2',
      contestantName: 'An',
      languageId: 54,
      sourceCode: '',
      status: 'DONE',
      totalScore: 10.0,
      maxScore: 10,
      testResults: [],
      createdAt: 3000,
    },
  ];

  it('should rank contestants by total score descending', () => {
    const rows = calculateScoreboard(mockContest, mockSubmissions);
    expect(rows).toHaveLength(2);

    expect(rows[0].contestantName).toBe('An');
    expect(rows[0].totalScore).toBe(18.0);
    expect(rows[0].rank).toBe(1);

    expect(rows[1].contestantName).toBe('Binh');
    expect(rows[1].totalScore).toBe(10.0);
    expect(rows[1].rank).toBe(2);
  });

  it('should generate valid CSV matching Themis format with BOM', () => {
    const rows = calculateScoreboard(mockContest, mockSubmissions);
    const csv = exportScoreboardToCSV(mockContest, rows);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('STT,Thí sinh,BAI1,BAI2,Tổng điểm');
    expect(csv).toContain('1,"An",8.00,10.00,18.00');
    expect(csv).toContain('2,"Binh",10.00,0.00,10.00');
  });

  it('should generate formatted TXT table', () => {
    const rows = calculateScoreboard(mockContest, mockSubmissions);
    const txt = exportScoreboardToTXT(mockContest, rows);

    expect(txt).toContain('BẢNG KẾT QUẢ CHẤM THI THEMIS: KỲ THI TEST 2026');
    expect(txt).toContain('STT');
    expect(txt).toContain('Thí sinh');
    expect(txt).toContain('BAI1');
    expect(txt).toContain('BAI2');
    expect(txt).toContain('An');
    expect(txt).toContain('Binh');
  });

  it('should generate Excel HTML spreadsheet table', () => {
    const rows = calculateScoreboard(mockContest, mockSubmissions);
    const html = exportScoreboardToExcelHTML(mockContest, rows);

    expect(html).toContain('<table');
    expect(html).toContain('BẢNG KẾT QUẢ KỲ THI: Kỳ Thi Test 2026');
    expect(html).toContain('<th>STT</th>');
    expect(html).toContain('<th>Thí sinh</th>');
    expect(html).toContain('>An</td>');
  });
});
