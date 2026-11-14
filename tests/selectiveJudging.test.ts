import { describe, it, expect } from 'vitest';
import { Submission, Contest } from '../src/types';

describe('Selective Judging Logic', () => {
  const dummyContest: Contest = {
    id: 'contest-1',
    title: 'Kỳ thi thử',
    createdAt: Date.now(),
    problems: [
      {
        id: 'p1',
        code: 'BAI1',
        title: 'Bài 1',
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        ioMode: 'STANDARD',
        points: 10,
        testCases: [],
      },
      {
        id: 'p2',
        code: 'BAI2',
        title: 'Bài 2',
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        ioMode: 'STANDARD',
        points: 10,
        testCases: [],
      },
      {
        id: 'p3',
        code: 'BAI3',
        title: 'Bài 3',
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        ioMode: 'STANDARD',
        points: 10,
        testCases: [],
      },
    ],
  };

  const dummySubmissions: Submission[] = [
    {
      id: 's1',
      contestId: 'contest-1',
      problemId: 'p1',
      problemCode: 'BAI1',
      contestantName: 'Nguyen Van A',
      languageId: 54,
      sourceCode: 'code1',
      status: 'PENDING',
      totalScore: 0,
      maxScore: 10,
      testResults: [],
      createdAt: 100,
    },
    {
      id: 's2',
      contestId: 'contest-1',
      problemId: 'p2',
      problemCode: 'BAI2',
      contestantName: 'Nguyen Van A',
      languageId: 54,
      sourceCode: 'code2',
      status: 'PENDING',
      totalScore: 0,
      maxScore: 10,
      testResults: [],
      createdAt: 200,
    },
    {
      id: 's3',
      contestId: 'contest-1',
      problemId: 'p1',
      problemCode: 'BAI1',
      contestantName: 'Tran Van B',
      languageId: 54,
      sourceCode: 'code3',
      status: 'PENDING',
      totalScore: 0,
      maxScore: 10,
      testResults: [],
      createdAt: 300,
    },
    {
      id: 's4',
      contestId: 'contest-1',
      problemId: 'p3',
      problemCode: 'BAI3',
      contestantName: 'Le Thi C',
      languageId: 54,
      sourceCode: 'code4',
      status: 'PENDING',
      totalScore: 0,
      maxScore: 10,
      testResults: [],
      createdAt: 400,
    },
  ];

  it('should judge all submissions by default when all problems and all students are ticked', () => {
    const selectedProblems = new Set(dummyContest.problems.map((p) => p.code.toUpperCase()));
    const selectedStudents = new Set(dummySubmissions.map((s) => s.contestantName));

    const toJudge = dummySubmissions.filter(
      (s) =>
        selectedStudents.has(s.contestantName) &&
        selectedProblems.has(s.problemCode.toUpperCase())
    );

    expect(toJudge.length).toBe(4);
  });

  it('should filter only submissions for a specific problem when others are unticked', () => {
    // Only BAI1 is ticked
    const selectedProblems = new Set(['BAI1']);
    const selectedStudents = new Set(dummySubmissions.map((s) => s.contestantName));

    const toJudge = dummySubmissions.filter(
      (s) =>
        selectedStudents.has(s.contestantName) &&
        selectedProblems.has(s.problemCode.toUpperCase())
    );

    expect(toJudge.length).toBe(2);
    expect(toJudge.every((s) => s.problemCode === 'BAI1')).toBe(true);
    expect(toJudge.map((s) => s.contestantName)).toEqual(['Nguyen Van A', 'Tran Van B']);
  });

  it('should filter only submissions for a specific student when others are unticked', () => {
    // Only Nguyen Van A is ticked
    const selectedProblems = new Set(dummyContest.problems.map((p) => p.code.toUpperCase()));
    const selectedStudents = new Set(['Nguyen Van A']);

    const toJudge = dummySubmissions.filter(
      (s) =>
        selectedStudents.has(s.contestantName) &&
        selectedProblems.has(s.problemCode.toUpperCase())
    );

    expect(toJudge.length).toBe(2);
    expect(toJudge.every((s) => s.contestantName === 'Nguyen Van A')).toBe(true);
    expect(toJudge.map((s) => s.problemCode)).toEqual(['BAI1', 'BAI2']);
  });

  it('should intersect student and problem selections properly', () => {
    // Nguyen Van A + BAI2 only
    const selectedProblems = new Set(['BAI2']);
    const selectedStudents = new Set(['Nguyen Van A']);

    const toJudge = dummySubmissions.filter(
      (s) =>
        selectedStudents.has(s.contestantName) &&
        selectedProblems.has(s.problemCode.toUpperCase())
    );

    expect(toJudge.length).toBe(1);
    expect(toJudge[0].id).toBe('s2');
  });

  it('should return empty array if no student or no problem is ticked', () => {
    const selectedProblems = new Set<string>(); // uncheck all problems
    const selectedStudents = new Set(['Nguyen Van A']);

    const toJudge = dummySubmissions.filter(
      (s) =>
        selectedStudents.has(s.contestantName) &&
        selectedProblems.has(s.problemCode.toUpperCase())
    );

    expect(toJudge.length).toBe(0);
  });
});

