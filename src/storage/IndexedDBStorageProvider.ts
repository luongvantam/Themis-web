import { get, set, del } from 'idb-keyval';
import { IStorageProvider } from './IStorageProvider';
import { Contest, Problem, Submission, AppSettings } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  judge0Url: 'https://ce.judge0.com',
  judge0Key: '',
  autoRedirectFreopen: true,
  floatEpsilon: 0.000001,
  concurrency: 4,
};

export class IndexedDBStorageProvider implements IStorageProvider {
  private isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
  private memoryContests: Map<string, Contest> = new Map();
  private memorySubmissions: Map<string, Submission> = new Map();
  private memorySettings: AppSettings = { ...DEFAULT_SETTINGS };

  // --- Contests ---
  async getContests(): Promise<Contest[]> {
    if (this.isBrowser) {
      const data = await get<Contest[]>('themis_contests');
      return data || [];
    }
    return Array.from(this.memoryContests.values());
  }

  async getContest(id: string): Promise<Contest | null> {
    const contests = await this.getContests();
    return contests.find(c => c.id === id) || null;
  }

  async saveContest(contest: Contest): Promise<void> {
    const contests = await this.getContests();
    const index = contests.findIndex(c => c.id === contest.id);
    if (index >= 0) {
      contests[index] = contest;
    } else {
      contests.push(contest);
    }

    if (this.isBrowser) {
      await set('themis_contests', contests);
    } else {
      this.memoryContests.set(contest.id, contest);
    }
  }

  async deleteContest(id: string): Promise<void> {
    const contests = await this.getContests();
    const filtered = contests.filter(c => c.id !== id);

    if (this.isBrowser) {
      await set('themis_contests', filtered);
    } else {
      this.memoryContests.delete(id);
    }

    await this.clearSubmissions(id);
  }

  // --- Problems ---
  async getProblems(contestId: string): Promise<Problem[]> {
    const contest = await this.getContest(contestId);
    return contest ? contest.problems : [];
  }

  async getProblem(problemId: string): Promise<Problem | null> {
    const contests = await this.getContests();
    for (const contest of contests) {
      const prob = contest.problems.find(p => p.id === problemId);
      if (prob) return prob;
    }
    return null;
  }

  async saveProblem(contestId: string, problem: Problem): Promise<void> {
    const contest = await this.getContest(contestId);
    if (!contest) throw new Error(`Contest ${contestId} not found`);

    const index = contest.problems.findIndex(p => p.id === problem.id);
    if (index >= 0) {
      contest.problems[index] = problem;
    } else {
      contest.problems.push(problem);
    }
    await this.saveContest(contest);
  }

  async deleteProblem(contestId: string, problemId: string): Promise<void> {
    const contest = await this.getContest(contestId);
    if (!contest) return;
    contest.problems = contest.problems.filter(p => p.id !== problemId);
    await this.saveContest(contest);
  }

  // --- Submissions ---
  async getSubmissions(contestId?: string): Promise<Submission[]> {
    let subs: Submission[] = [];
    if (this.isBrowser) {
      subs = (await get<Submission[]>('themis_submissions')) || [];
    } else {
      subs = Array.from(this.memorySubmissions.values());
    }

    if (contestId) {
      return subs.filter(s => s.contestId === contestId);
    }
    return subs;
  }

  async getSubmission(id: string): Promise<Submission | null> {
    const subs = await this.getSubmissions();
    return subs.find(s => s.id === id) || null;
  }

  async saveSubmission(submission: Submission): Promise<void> {
    const subs = await this.getSubmissions();
    const index = subs.findIndex(s => s.id === submission.id);
    if (index >= 0) {
      subs[index] = submission;
    } else {
      subs.push(submission);
    }

    if (this.isBrowser) {
      await set('themis_submissions', subs);
    } else {
      this.memorySubmissions.set(submission.id, submission);
    }
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    const subs = await this.getSubmissions();
    const filtered = subs.filter(s => s.id !== submissionId);

    if (this.isBrowser) {
      await set('themis_submissions', filtered);
    } else {
      this.memorySubmissions.delete(submissionId);
    }
  }

  async deleteStudentSubmissions(contestId: string, contestantName: string): Promise<void> {
    const subs = await this.getSubmissions();
    const filtered = subs.filter(
      s => !(s.contestId === contestId && s.contestantName.toLowerCase() === contestantName.toLowerCase())
    );

    if (this.isBrowser) {
      await set('themis_submissions', filtered);
    } else {
      this.memorySubmissions.clear();
      for (const s of filtered) {
        this.memorySubmissions.set(s.id, s);
      }
    }
  }

  async renameStudent(contestId: string, oldName: string, newName: string): Promise<void> {
    const subs = await this.getSubmissions();
    let changed = false;

    for (const s of subs) {
      if (s.contestId === contestId && s.contestantName.toLowerCase() === oldName.toLowerCase()) {
        s.contestantName = newName.trim();
        changed = true;
      }
    }

    if (changed) {
      if (this.isBrowser) {
        await set('themis_submissions', subs);
      } else {
        this.memorySubmissions.clear();
        for (const s of subs) {
          this.memorySubmissions.set(s.id, s);
        }
      }
    }
  }

  async clearSubmissions(contestId?: string): Promise<void> {
    if (!contestId) {
      if (this.isBrowser) {
        await del('themis_submissions');
      } else {
        this.memorySubmissions.clear();
      }
      return;
    }

    const subs = await this.getSubmissions();
    const filtered = subs.filter(s => s.contestId !== contestId);
    if (this.isBrowser) {
      await set('themis_submissions', filtered);
    } else {
      this.memorySubmissions.clear();
      for (const s of filtered) {
        this.memorySubmissions.set(s.id, s);
      }
    }
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    if (this.isBrowser) {
      const data = await get<AppSettings>('themis_settings');
      return data || { ...DEFAULT_SETTINGS };
    }
    return { ...this.memorySettings };
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (this.isBrowser) {
      await set('themis_settings', settings);
    } else {
      this.memorySettings = { ...settings };
    }
  }
}
