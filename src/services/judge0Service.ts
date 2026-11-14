import { Judge0Language, TestResult, Verdict, AppSettings, TestCase, Problem } from '../types';
import { preprocessCode } from '../utils/preprocessor';
import { compareOutput } from '../utils/comparator';

export const SUPPORTED_LANGUAGES: Judge0Language[] = [
  {
    id: 54, // C++ (GCC 9.2.0)
    name: 'C++17 (GCC)',
    monacoLang: 'cpp',
    extension: '.cpp',
    defaultTemplate: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // freopen("TASK.INP", "r", stdin);\n    // freopen("TASK.OUT", "w", stdout);\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Code here\n    \n    return 0;\n}\n`,
  },
  {
    id: 71, // Python (3.8.1)
    name: 'Python 3',
    monacoLang: 'python',
    extension: '.py',
    defaultTemplate: `import sys\n\ndef main():\n    # sys.stdin = open('TASK.INP', 'r')\n    # sys.stdout = open('TASK.OUT', 'w')\n    pass\n\nif __name__ == '__main__':\n    main()\n`,
  },
  {
    id: 67, // Pascal (FPC 3.0.4)
    name: 'Free Pascal',
    monacoLang: 'pascal',
    extension: '.pas',
    defaultTemplate: `program Solution;\nvar\n    // declare variables\nbegin\n    // assign(input, 'TASK.INP'); reset(input);\n    // assign(output, 'TASK.OUT'); rewrite(output);\n    \nend.\n`,
  },
  {
    id: 62, // Java (OpenJDK 13.0.1)
    name: 'Java (OpenJDK)',
    monacoLang: 'java',
    extension: '.java',
    defaultTemplate: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Code here\n    }\n}\n`,
  },
  {
    id: 48, // C (GCC 9.2.0)
    name: 'C (GCC)',
    monacoLang: 'c',
    extension: '.c',
    defaultTemplate: `#include <stdio.h>\n\nint main() {\n    // Code here\n    return 0;\n}\n`,
  },
];

export interface ExecutionOptions {
  sourceCode: string;
  languageId: number;
  problem: Problem;
  testCase: TestCase;
  settings: AppSettings;
}

export function utf8ToBase64(str: string): string {
  if (!str) return '';
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUtf8(b64: string | null | undefined): string {
  if (!b64) return '';
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return b64;
  }
}

export function mapJudge0StatusToVerdict(statusId: number): Verdict {
  switch (statusId) {
    case 3:
      return 'AC'; // Accepted
    case 4:
      return 'WA'; // Wrong Answer
    case 5:
      return 'TLE'; // Time Limit Exceeded
    case 6:
      return 'CE'; // Compilation Error
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 14:
      return 'RTE'; // Runtime Error
    default:
      return 'RTE';
  }
}

export function getStatusDescriptionVi(statusId: number, rawDesc?: string): string {
  switch (statusId) {
    case 3:
      return 'Đúng (Accepted)';
    case 4:
      return 'Sai kết quả (Wrong Answer)';
    case 5:
      return 'Quá thời gian thực thi (Time Limit Exceeded)';
    case 6:
      return 'Lỗi biên dịch (Compilation Error)';
    case 7:
      return 'Lỗi bộ nhớ: Đoạn mã truy cập vùng nhớ cấm (SIGSEGV)';
    case 8:
      return 'Lỗi ghi tập tin quá kích thước (SIGXFSZ)';
    case 9:
      return 'Lỗi phép toán: Chia cho 0 hoặc tràn số thực (SIGFPE)';
    case 10:
      return 'Tiến trình bị hủy bỏ (SIGABRT)';
    case 11:
      return 'Lỗi thực thi: Mã thoát khác 0 (NZEC)';
    case 12:
      return 'Lỗi thực thi (Runtime Error)';
    case 13:
      return 'Lỗi máy chủ chấm (Internal Error)';
    default:
      return rawDesc || 'Lỗi không xác định';
  }
}

/**
 * Executes a single test case through the Cloudflare Pages /api/judge proxy
 * or directly to Judge0.
 */
export async function executeSingleTest(opts: ExecutionOptions): Promise<TestResult> {
  const { sourceCode, languageId, problem, testCase, settings } = opts;

  // Check if source code is empty
  if (!sourceCode || !sourceCode.trim()) {
    return {
      testCaseId: testCase.id,
      testCaseName: testCase.name,
      verdict: 'CE',
      timeUsedMs: 0,
      memoryUsedKb: 0,
      score: 0,
      maxScore: testCase.score,
      compileOutput: 'Tập tin mã nguồn rỗng. Không có nội dung code để biên dịch!',
      statusDescription: 'Tập tin rỗng (Empty file)',
    };
  }

  // 1. Preprocess code to handle Themis freopen/assign redirection if enabled
  const processedCode = preprocessCode(
    sourceCode,
    SUPPORTED_LANGUAGES.find((l) => l.id === languageId)?.name || 'cpp',
    settings.autoRedirectFreopen
  );

  const sourceCodeB64 = utf8ToBase64(processedCode);
  const stdinB64 = utf8ToBase64(testCase.input || '');

  const payload = {
    source_code: sourceCodeB64,
    language_id: languageId,
    stdin: stdinB64,
    is_base64: true,
    cpu_time_limit: problem.timeLimitMs,
    memory_limit: problem.memoryLimitMb,
    judge0Url: settings.judge0Url,
    judge0Key: settings.judge0Key,
  };

  try {
    // Try Cloudflare Pages Function proxy first
    let res = await fetch('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null);

    // Fallback: If not hosted on Cloudflare Pages (e.g. local dev server without wrangler),
    // fetch directly from configured Judge0 endpoint using base64_encoded=true
    if (!res || res.status === 404) {
      const targetUrl = settings.judge0Url.replace(/\/+$/, '');
      const directHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (settings.judge0Key) {
        if (targetUrl.includes('rapidapi.com')) {
          directHeaders['X-RapidAPI-Key'] = settings.judge0Key;
          directHeaders['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
        } else {
          directHeaders['X-Auth-Token'] = settings.judge0Key;
        }
      }

      res = await fetch(`${targetUrl}/submissions?base64_encoded=true&wait=true`, {
        method: 'POST',
        headers: directHeaders,
        body: JSON.stringify({
          source_code: sourceCodeB64,
          language_id: languageId,
          stdin: stdinB64,
          cpu_time_limit: Math.max(0.5, (problem.timeLimitMs || 1000) / 1000),
          memory_limit: Math.max(16384, (problem.memoryLimitMb || 256) * 1024),
        }),
      });
    }

    if (!res.ok) {
      let errDetail = '';
      try {
        const errJson = await res.json();
        errDetail = errJson.error || errJson.message || JSON.stringify(errJson);
      } catch {
        errDetail = await res.text();
      }

      let friendlyMsg = `Máy chủ chấm trả về mã lỗi HTTP ${res.status}`;
      if (res.status === 429) {
        friendlyMsg = 'Vượt quá giới hạn gọi API Judge0 (Rate Limit - HTTP 429). Vui lòng đợi vài giây hoặc cấu hình API Key riêng.';
      } else if (res.status === 401 || res.status === 403) {
        friendlyMsg = 'Khóa API Judge0 không hợp lệ hoặc hết hạn quyền truy cập (HTTP 401/403).';
      } else if (res.status === 400 || res.status === 422) {
        friendlyMsg = `Yêu cầu chấm không hợp lệ (HTTP ${res.status}): ${errDetail.substring(0, 200)}`;
      }

      return {
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        verdict: 'RTE',
        timeUsedMs: 0,
        memoryUsedKb: 0,
        score: 0,
        maxScore: testCase.score,
        statusDescription: friendlyMsg,
        stderr: errDetail,
      };
    }

    const data = await res.json();
    const statusId = data.status?.id ?? data.status_id ?? 13;
    let verdict = mapJudge0StatusToVerdict(statusId);

    // If strings were not yet decoded by proxy, decode from base64
    const stdout = data.is_decoded ? (data.stdout || '') : base64ToUtf8(data.stdout);
    const stderr = data.is_decoded ? (data.stderr || '') : base64ToUtf8(data.stderr);
    const compileOutput = data.is_decoded ? (data.compile_output || '') : base64ToUtf8(data.compile_output);
    const timeUsedMs = Math.round((parseFloat(data.time) || 0) * 1000);
    const memoryUsedKb = Math.round(parseFloat(data.memory) || 0);

    // If Judge0 ran the program without runtime/compile error, compare output using comparator
    if (statusId === 3 || statusId === 4) {
      const compRes = compareOutput(stdout, testCase.output, { floatEpsilon: settings.floatEpsilon });
      verdict = compRes.matches ? 'AC' : 'WA';
    }

    const score = verdict === 'AC' ? testCase.score : 0;
    const statusDesc = getStatusDescriptionVi(statusId, data.status?.description);

    return {
      testCaseId: testCase.id,
      testCaseName: testCase.name,
      verdict,
      timeUsedMs,
      memoryUsedKb,
      score,
      maxScore: testCase.score,
      stdout,
      stderr,
      compileOutput,
      statusDescription: statusDesc,
    };
  } catch (err: any) {
    return {
      testCaseId: testCase.id,
      testCaseName: testCase.name,
      verdict: 'RTE',
      timeUsedMs: 0,
      memoryUsedKb: 0,
      score: 0,
      maxScore: testCase.score,
      statusDescription: `Không thể kết nối đến máy chủ Sandbox: ${err.message}`,
    };
  }
}

export interface BatchGradingOptions {
  sourceCode: string;
  languageId: number;
  problem: Problem;
  settings: AppSettings;
  concurrency?: number;
  onProgress?: (completed: number, total: number, lastResult: TestResult) => void;
  shouldStop?: () => boolean;
}

/**
 * Batch test executor using Judge0's official Batch Submissions API:
 * 1. Preprocesses code once.
 * 2. Packages all test cases into a single POST /submissions/batch payload.
 * 3. Sends 1 single request to Judge0, dispatching all test runs in parallel on server workers.
 * 4. Polls /submissions/batch every 400ms for status updates and invokes onProgress.
 * Returns null if batch mode is not supported on the target Judge0 endpoint, triggering automatic fallback.
 */
async function executeBatchTests(opts: BatchGradingOptions): Promise<TestResult[] | null> {
  const { sourceCode, languageId, problem, settings, onProgress, shouldStop } = opts;
  const testCases = problem.testCases;

  const processedCode = preprocessCode(
    sourceCode,
    SUPPORTED_LANGUAGES.find((l) => l.id === languageId)?.name || 'cpp',
    settings.autoRedirectFreopen
  );

  const sourceCodeB64 = utf8ToBase64(processedCode);

  const batchPayload = {
    action: 'create_batch',
    judge0Url: settings.judge0Url,
    judge0Key: settings.judge0Key,
    submissions: testCases.map((tc) => ({
      source_code: sourceCodeB64,
      language_id: languageId,
      stdin: utf8ToBase64(tc.input || ''),
      is_base64: true,
      cpu_time_limit: problem.timeLimitMs,
      memory_limit: problem.memoryLimitMb,
    })),
  };

  const targetUrl = settings.judge0Url.replace(/\/+$/, '');
  const directHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (settings.judge0Key) {
    if (targetUrl.includes('rapidapi.com')) {
      directHeaders['X-RapidAPI-Key'] = settings.judge0Key;
      directHeaders['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    } else {
      directHeaders['X-Auth-Token'] = settings.judge0Key;
    }
  }

  let tokenList: string[] = [];
  let useProxy = true;

  try {
    let res = await fetch('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchPayload),
    }).catch(() => null);

    if (!res || res.status === 404) {
      useProxy = false;
      res = await fetch(`${targetUrl}/submissions/batch?base64_encoded=true`, {
        method: 'POST',
        headers: directHeaders,
        body: JSON.stringify({
          submissions: batchPayload.submissions,
        }),
      });
    }

    if (!res.ok) {
      return null; // Endpoint doesn't support batch or returned error -> trigger fallback
    }

    const tokensData = await res.json();
    if (!Array.isArray(tokensData) || tokensData.length !== testCases.length) {
      return null;
    }

    tokenList = tokensData.map((t: any) => t.token);
  } catch {
    return null; // Network failure -> trigger fallback
  }

  // 2. Poll for batch results
  const maxWaitMs = Math.max(15000, (problem.timeLimitMs || 1000) * 3 + 6000);
  const startTime = Date.now();
  const resultMap = new Map<string, TestResult>();
  let lastReportedCount = 0;

  while (Date.now() - startTime < maxWaitMs) {
    if (shouldStop?.()) break;

    await new Promise((resolve) => setTimeout(resolve, 400));

    let pollData: any = null;
    if (useProxy) {
      const pollRes = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'poll_batch',
          judge0Url: settings.judge0Url,
          judge0Key: settings.judge0Key,
          tokens: tokenList,
        }),
      }).catch(() => null);
      if (pollRes && pollRes.ok) {
        pollData = await pollRes.json();
      }
    } else {
      const pollUrl = `${targetUrl}/submissions/batch?tokens=${encodeURIComponent(
        tokenList.join(',')
      )}&base64_encoded=true&fields=token,status,time,memory,stdout,stderr,compile_output,message`;
      const pollRes = await fetch(pollUrl, { headers: directHeaders }).catch(() => null);
      if (pollRes && pollRes.ok) {
        pollData = await pollRes.json();
      }
    }

    if (!pollData || !Array.isArray(pollData.submissions)) {
      continue;
    }

    let allDone = true;
    for (let i = 0; i < pollData.submissions.length; i++) {
      const sub = pollData.submissions[i];
      const tc = testCases[i];
      const statusId = sub.status?.id ?? 1;

      // Status 1 = In Queue, 2 = Processing
      if (statusId <= 2) {
        allDone = false;
        continue;
      }

      if (!resultMap.has(sub.token)) {
        let verdict = mapJudge0StatusToVerdict(statusId);
        const stdout = sub.is_decoded ? sub.stdout || '' : base64ToUtf8(sub.stdout);
        const stderr = sub.is_decoded ? sub.stderr || '' : base64ToUtf8(sub.stderr);
        const compileOutput = sub.is_decoded ? sub.compile_output || '' : base64ToUtf8(sub.compile_output);
        const timeUsedMs = Math.round((parseFloat(sub.time) || 0) * 1000);
        const memoryUsedKb = Math.round(parseFloat(sub.memory) || 0);

        if (statusId === 3 || statusId === 4) {
          const compRes = compareOutput(stdout, tc.output, { floatEpsilon: settings.floatEpsilon });
          verdict = compRes.matches ? 'AC' : 'WA';
        }

        const score = verdict === 'AC' ? tc.score : 0;
        const statusDesc = getStatusDescriptionVi(statusId, sub.status?.description);

        const testRes: TestResult = {
          testCaseId: tc.id,
          testCaseName: tc.name,
          verdict,
          timeUsedMs,
          memoryUsedKb,
          score,
          maxScore: tc.score,
          stdout,
          stderr,
          compileOutput,
          statusDescription: statusDesc,
        };

        resultMap.set(sub.token, testRes);
      }
    }

    if (resultMap.size > lastReportedCount) {
      lastReportedCount = resultMap.size;
      const lastToken = tokenList[lastReportedCount - 1];
      const lastRes = resultMap.get(lastToken) || Array.from(resultMap.values()).pop()!;
      onProgress?.(lastReportedCount, testCases.length, lastRes);
    }

    if (allDone || resultMap.size === testCases.length) {
      break;
    }
  }

  if (resultMap.size === testCases.length) {
    return tokenList.map((token) => resultMap.get(token)!);
  }

  return null;
}

/**
 * Fallback worker pool:
 * 1. Runs Test 1 first to check compilation.
 * 2. If Test 1 fails with CE, short-circuits remaining tests in 0ms.
 * 3. Runs remaining tests in parallel workers.
 */
async function executeWorkerPoolTests(opts: BatchGradingOptions): Promise<TestResult[]> {
  const { sourceCode, languageId, problem, settings, concurrency = 4, onProgress, shouldStop } = opts;
  const testCases = problem.testCases;

  // 1. Run Test 1 first to check compilation
  const firstRes = await executeSingleTest({
    sourceCode,
    languageId,
    problem,
    testCase: testCases[0],
    settings,
  });

  onProgress?.(1, testCases.length, firstRes);

  if (firstRes.verdict === 'CE') {
    const results: TestResult[] = [firstRes];
    for (let i = 1; i < testCases.length; i++) {
      results.push({
        testCaseId: testCases[i].id,
        testCaseName: testCases[i].name,
        verdict: 'CE',
        timeUsedMs: 0,
        memoryUsedKb: 0,
        score: 0,
        maxScore: testCases[i].score,
        compileOutput: firstRes.compileOutput,
        statusDescription: 'Lỗi biên dịch (Compilation Error)',
      });
      onProgress?.(i + 1, testCases.length, results[results.length - 1]);
    }
    return results;
  }

  if (testCases.length === 1) {
    return [firstRes];
  }

  const results: TestResult[] = new Array(testCases.length);
  results[0] = firstRes;

  const remainingIndices = Array.from({ length: testCases.length - 1 }, (_, i) => i + 1);
  let completedCount = 1;

  const runWorker = async () => {
    while (remainingIndices.length > 0) {
      if (shouldStop?.()) break;

      const idx = remainingIndices.shift();
      if (idx === undefined) break;

      const tc = testCases[idx];
      const res = await executeSingleTest({
        sourceCode,
        languageId,
        problem,
        testCase: tc,
        settings,
      });

      results[idx] = res;
      completedCount++;
      onProgress?.(completedCount, testCases.length, res);
    }
  };

  const poolSize = Math.min(concurrency, remainingIndices.length);
  const workers = Array.from({ length: poolSize }, () => runWorker());
  await Promise.all(workers);

  return results;
}

/**
 * Main submission test executor:
 * - Empty code short-circuit.
 * - Single test optimization.
 * - Batch submission mode (gộp toàn bộ test cases gửi 1 lượt qua POST /submissions/batch).
 * - Automatic worker pool fallback if batch mode is unavailable.
 */
export async function executeSubmissionTests(opts: BatchGradingOptions): Promise<TestResult[]> {
  const { sourceCode, languageId, problem, settings, onProgress } = opts;
  const testCases = problem.testCases;

  if (testCases.length === 0) return [];

  // Short-circuit: Check if code is empty
  if (!sourceCode || !sourceCode.trim()) {
    return testCases.map((tc) => ({
      testCaseId: tc.id,
      testCaseName: tc.name,
      verdict: 'CE',
      timeUsedMs: 0,
      memoryUsedKb: 0,
      score: 0,
      maxScore: tc.score,
      compileOutput: 'Tập tin bài làm không có nội dung (file rỗng hoặc chưa nộp).',
      statusDescription: 'File rỗng (Empty file)',
    }));
  }

  if (testCases.length === 1) {
    const singleRes = await executeSingleTest({
      sourceCode,
      languageId,
      problem,
      testCase: testCases[0],
      settings,
    });
    onProgress?.(1, 1, singleRes);
    return [singleRes];
  }

  // Multi-test: Try Judge0 Batch Submissions first (gộp 20 test gửi 1 lượt)
  try {
    const batchResults = await executeBatchTests(opts);
    if (batchResults && batchResults.length === testCases.length) {
      return batchResults;
    }
  } catch (err) {
    console.warn('Batch submission attempt encountered error, falling back to concurrent pool:', err);
  }

  // Graceful fallback to concurrent worker pool
  return executeWorkerPoolTests(opts);
}
