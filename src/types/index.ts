export type Verdict = 'AC' | 'WA' | 'TLE' | 'MLE' | 'CE' | 'RTE' | 'PENDING' | 'JUDGING';

export type IOMode = 'STANDARD' | 'FILE';

export interface TestCase {
  id: string;
  name: string;
  input: string;
  output: string;
  score: number;
}

export interface Problem {
  id: string;
  code: string; // e.g. "BAI1"
  title: string;
  description?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  ioMode: IOMode;
  fileInpName?: string; // e.g. "BAI1.INP"
  fileOutName?: string; // e.g. "BAI1.OUT"
  testCases: TestCase[];
  points: number;
}

export interface Contest {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  problems: Problem[];
}

export interface TestResult {
  testCaseId: string;
  testCaseName: string;
  verdict: Verdict;
  timeUsedMs: number;
  memoryUsedKb: number;
  score: number;
  maxScore: number;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  statusDescription?: string;
}

export interface Submission {
  id: string;
  contestId: string;
  problemId: string;
  problemCode: string;
  contestantName: string;
  languageId: number;
  sourceCode: string;
  status: 'PENDING' | 'JUDGING' | 'DONE';
  totalScore: number;
  maxScore: number;
  testResults: TestResult[];
  createdAt: number;
}

export interface Judge0Language {
  id: number;
  name: string;
  monacoLang: string;
  extension: string;
  defaultTemplate: string;
}

export interface AppSettings {
  judge0Url: string;
  judge0Key?: string;
  autoRedirectFreopen: boolean;
  floatEpsilon: number;
}

export type ColorMode = 'light' | 'dark';


