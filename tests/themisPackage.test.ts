import { describe, it, expect } from 'vitest';
import { exportContestToContestZip, exportContestToJSON, importContestFromJSON } from '../src/utils/themisPackage';
import { Contest, Submission } from '../src/types';
import JSZip from 'jszip';

describe('Themis Contest Package (.contest & .themis)', () => {
  const sampleContest: Contest = {
    id: 'contest-test-1',
    title: 'Ky Thi Thu 2026',
    createdAt: Date.now(),
    problems: [
      {
        id: 'p1',
        title: 'Tìm Ước Chung Lớn Nhất',
        code: 'GCD',
        points: 10,
        timeLimitMs: 1000,
        memoryLimitMb: 1024,
        ioMode: 'STANDARD',
        testCases: [
          { id: 'tc1', name: 'Test01', input: '12 18\n', output: '6\n', score: 5 },
          { id: 'tc2', name: 'Test02', input: '7 13\n', output: '1\n', score: 5 },
        ],
      },
    ],
  };

  const sampleSubmissions: Submission[] = [
    {
      id: 'sub1',
      contestId: 'contest-test-1',
      problemId: 'p1',
      contestantName: 'NguyenVanA',
      problemCode: 'GCD',
      languageId: 54, // C++
      sourceCode: '#include <iostream>\nint main() { return 0; }',
      status: 'DONE',
      totalScore: 10,
      maxScore: 10,
      testResults: [],
      createdAt: Date.now(),
    },
  ];

  it('should export and import .themis JSON correctly', () => {
    const blob = exportContestToJSON(sampleContest);
    expect(blob.type).toBe('application/json');

    const jsonStr = JSON.stringify(sampleContest);
    const imported = importContestFromJSON(jsonStr);
    expect(imported.title).toBe('Ky Thi Thu 2026');
    expect(imported.problems.length).toBe(1);
    expect(imported.problems[0].code).toBe('GCD');
  });

  it('should export valid .contest ZIP archive matching Themis Windows layout', async () => {
    const zipBlob = await exportContestToContestZip(sampleContest, sampleSubmissions);
    expect(zipBlob.size).toBeGreaterThan(0);

    const zip = new JSZip();
    const loaded = await zip.loadAsync(zipBlob);

    // Verify Tasks structure
    expect(loaded.file('Tasks/GCD/Test01/GCD.INP')).not.toBeNull();
    expect(loaded.file('Tasks/GCD/Test01/GCD.OUT')).not.toBeNull();
    expect(loaded.file('Tasks/GCD/Test02/GCD.INP')).not.toBeNull();

    // Verify Contestants structure
    expect(loaded.file('Contestants/NguyenVanA/GCD.cpp')).not.toBeNull();

    // Verify Manifests
    const taskDirContent = await loaded.file('TaskDirectories.txt')?.async('string');
    expect(taskDirContent).toContain('GCD');
    expect(taskDirContent).toContain('GCD\\Test01');

    const contestantContent = await loaded.file('ContestantDirectories.txt')?.async('string');
    expect(contestantContent).toContain('NguyenVanA');
  });
});
