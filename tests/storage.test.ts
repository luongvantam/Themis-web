import { describe, it, expect, beforeEach } from 'vitest';
import { IndexedDBStorageProvider } from '../src/storage/IndexedDBStorageProvider';
import { Contest, Problem } from '../src/types';

describe('IndexedDBStorageProvider (In-Memory Fallback)', () => {
  let storage: IndexedDBStorageProvider;

  beforeEach(() => {
    storage = new IndexedDBStorageProvider();
  });

  it('should save, retrieve and delete contests', async () => {
    const contest: Contest = {
      id: 'test-contest-1',
      title: 'Kỳ thi thử 2026',
      createdAt: Date.now(),
      problems: [],
    };

    await storage.saveContest(contest);
    const retrieved = await storage.getContest('test-contest-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Kỳ thi thử 2026');

    const all = await storage.getContests();
    expect(all).toHaveLength(1);

    await storage.deleteContest('test-contest-1');
    const afterDelete = await storage.getContest('test-contest-1');
    expect(afterDelete).toBeNull();
  });

  it('should save and update problems within a contest', async () => {
    const contest: Contest = {
      id: 'contest-p',
      title: 'Contest with problems',
      createdAt: Date.now(),
      problems: [],
    };
    await storage.saveContest(contest);

    const problem: Problem = {
      id: 'p-1',
      code: 'SUM',
      title: 'Tính tổng',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      ioMode: 'STANDARD',
      testCases: [],
      points: 10,
    };

    await storage.saveProblem('contest-p', problem);
    const problems = await storage.getProblems('contest-p');
    expect(problems).toHaveLength(1);
    expect(problems[0].code).toBe('SUM');

    const singleProblem = await storage.getProblem('p-1');
    expect(singleProblem?.title).toBe('Tính tổng');
  });

  it('should handle AppSettings properly', async () => {
    const initial = await storage.getSettings();
    expect(initial.judge0Url).toBe('https://ce.judge0.com');

    await storage.saveSettings({
      ...initial,
      judge0Url: 'http://localhost:2358',
    });

    const updated = await storage.getSettings();
    expect(updated.judge0Url).toBe('http://localhost:2358');
  });
});

