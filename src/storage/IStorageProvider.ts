import { Contest, Problem, Submission, AppSettings } from '../types';

export interface IStorageProvider {
  // Contests
  getContests(): Promise<Contest[]>;
  getContest(id: string): Promise<Contest | null>;
  saveContest(contest: Contest): Promise<void>;
  deleteContest(id: string): Promise<void>;

  // Problems
  getProblems(contestId: string): Promise<Problem[]>;
  getProblem(problemId: string): Promise<Problem | null>;
  saveProblem(contestId: string, problem: Problem): Promise<void>;
  deleteProblem(contestId: string, problemId: string): Promise<void>;

  // Submissions
  getSubmissions(contestId?: string): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | null>;
  saveSubmission(submission: Submission): Promise<void>;
  deleteSubmission(submissionId: string): Promise<void>;
  deleteStudentSubmissions(contestId: string, contestantName: string): Promise<void>;
  renameStudent(contestId: string, oldName: string, newName: string): Promise<void>;
  clearSubmissions(contestId?: string): Promise<void>;

  // Settings
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
}
