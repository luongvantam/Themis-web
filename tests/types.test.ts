import { describe, it, expect } from 'vitest';
import { Contest, Problem, TestCase, Submission, TestResult } from '../src/types';

describe('Core Data Types', () => {
  it('should construct a valid Contest object', () => {
    const testCase: TestCase = {
      id: 'tc-1',
      name: 'TEST01',
      input: '3 5\n',
      output: '8\n',
      score: 1.0,
    };

    const problem: Problem = {
      id: 'prob-1',
      code: 'BAI1',
      title: 'Tong hai so',
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      ioMode: 'FILE',
      fileInpName: 'BAI1.INP',
      fileOutName: 'BAI1.OUT',
      testCases: [testCase],
      points: 10.0,
    };

    const contest: Contest = {
      id: 'contest-1',
      title: 'Ky Thi Chon Hoc Sinh Gioi',
      createdAt: Date.now(),
      problems: [problem],
    };

    expect(contest.id).toBe('contest-1');
    expect(contest.problems).toHaveLength(1);
    expect(contest.problems[0].code).toBe('BAI1');
    expect(contest.problems[0].testCases[0].score).toBe(1.0);
  });

  it('should construct a valid Submission with TestResults', () => {
    const result: TestResult = {
      testCaseId: 'tc-1',
      testCaseName: 'TEST01',
      verdict: 'AC',
      timeUsedMs: 45,
      memoryUsedKb: 2048,
      score: 1.0,
      maxScore: 1.0,
      stdout: '8\n',
    };

    const sub: Submission = {
      id: 'sub-1',
      contestId: 'contest-1',
      problemId: 'prob-1',
      problemCode: 'BAI1',
      contestantName: 'NguyenVanA',
      languageId: 54, // C++17
      sourceCode: '#include <iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;}',
      status: 'DONE',
      totalScore: 1.0,
      maxScore: 1.0,
      testResults: [result],
      createdAt: Date.now(),
    };

    expect(sub.contestantName).toBe('NguyenVanA');
    expect(sub.testResults[0].verdict).toBe('AC');
  });
});

