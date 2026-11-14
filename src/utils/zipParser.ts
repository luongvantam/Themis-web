import JSZip from 'jszip';
import { Problem, TestCase } from '../types';

export interface ParseZipResult {
  contestTitle?: string;
  problems: Problem[];
  warnings: string[];
}

export interface ParsedSubmission {
  contestantName: string;
  problemCode: string;
  languageId: number;
  fileName: string;
  sourceCode: string;
}

/**
 * Detects Judge0 Language ID from file extension.
 * C++: 54, Pascal: 67, Python: 71, Java: 62, C: 50
 */
export function detectLanguageId(fileName: string): number {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 54; // C++ (GCC 9.2.0)
    case 'pas':
    case 'p':
      return 67; // Pascal (FPC 3.0.4)
    case 'py':
      return 71; // Python (3.8.1)
    case 'java':
      return 62; // Java (OpenJDK 13.0.1)
    case 'c':
      return 50; // C (GCC 9.2.0)
    default:
      return 54;
  }
}

/**
 * Normalizes a potential problem code (e.g. "CHUYENDE", "MAVE")
 */
function cleanProblemCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Normalizes contestant name from folder or file
 */
function cleanContestantName(raw: string): string {
  return raw.trim().replace(/^_+|_+$/g, '');
}

interface GenericFileEntry {
  path: string;
  getContent: () => Promise<string>;
}

/**
 * Core engine to parse Themis Test Cases from relative paths.
 */
async function parseGenericTaskEntries(entries: GenericFileEntry[]): Promise<ParseZipResult> {
  const warnings: string[] = [];
  let suggestedContestTitle: string | undefined = undefined;

  // Map: problemCode -> testName -> { inp?: string, out?: string }
  const problemTests: Map<string, Map<string, { inp?: string; out?: string }>> = new Map();

  for (const entry of entries) {
    const rawPath = entry.path.replace(/\\/g, '/');
    if (
      rawPath.includes('__MACOSX') ||
      rawPath.includes('.DS_Store') ||
      rawPath.includes('Thumbs.db')
    ) {
      continue;
    }

    const parts = rawPath.split('/').filter((p) => p.length > 0);
    if (parts.length < 2) continue;

    const fileName = parts[parts.length - 1];
    const fileExt = fileName.split('.').pop()?.toUpperCase() || '';

    const isInput =
      fileExt === 'INP' || fileExt === 'IN' || fileName.toLowerCase().includes('input');
    const isOutput =
      fileExt === 'OUT' || fileExt === 'ANS' || fileName.toLowerCase().includes('output');

    if (!isInput && !isOutput) continue;

    let problemCode = '';
    let testName = '';

    if (parts.length >= 4) {
      if (!suggestedContestTitle && parts[0].toLowerCase() !== 'tasks') {
        suggestedContestTitle = parts[0];
      }
      problemCode = cleanProblemCode(parts[parts.length - 3]);
      testName = parts[parts.length - 2];
    } else if (parts.length === 3) {
      problemCode = cleanProblemCode(parts[0]);
      testName = parts[1];
    } else if (parts.length === 2) {
      problemCode = cleanProblemCode(parts[0]);
      const match = fileName.match(/(\d+)/);
      testName = match ? `Test${match[1].padStart(2, '0')}` : fileName;
    }

    if (!problemCode || !testName) continue;

    const content = await entry.getContent();

    if (!problemTests.has(problemCode)) {
      problemTests.set(problemCode, new Map());
    }
    const testMap = problemTests.get(problemCode)!;

    if (!testMap.has(testName)) {
      testMap.set(testName, {});
    }
    const testItem = testMap.get(testName)!;

    if (isInput) {
      testItem.inp = content;
    } else if (isOutput) {
      testItem.out = content;
    }
  }

  const problems: Problem[] = [];

  for (const [code, testMap] of problemTests.entries()) {
    const testCases: TestCase[] = [];
    const sortedTestNames = Array.from(testMap.keys()).sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    const pointsPerTest =
      sortedTestNames.length > 0 ? Number((10 / sortedTestNames.length).toFixed(2)) : 1.0;

    for (let i = 0; i < sortedTestNames.length; i++) {
      const tName = sortedTestNames[i];
      const test = testMap.get(tName)!;

      if (test.inp === undefined && test.out === undefined) continue;

      testCases.push({
        id: `tc-${code}-${i + 1}`,
        name: tName,
        input: test.inp || '',
        output: test.out || '',
        score: pointsPerTest,
      });
    }

    if (testCases.length === 0) {
      warnings.push(`Bài ${code} không có test case hợp lệ nào.`);
      continue;
    }

    problems.push({
      id: `prob-${code}`,
      code,
      title: `Bài toán ${code}`,
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      ioMode: 'FILE',
      fileInpName: `${code}.INP`,
      fileOutName: `${code}.OUT`,
      testCases,
      points: 10,
    });
  }

  problems.sort((a, b) => a.code.localeCompare(b.code));

  return {
    contestTitle: suggestedContestTitle,
    problems,
    warnings,
  };
}

export async function parseThemisTaskFolder(
  files: FileList | File[]
): Promise<ParseZipResult> {
  const entries: GenericFileEntry[] = [];
  const fileArray = Array.from(files);

  for (const f of fileArray) {
    const path = f.webkitRelativePath || f.name;
    entries.push({
      path,
      getContent: () => f.text(),
    });
  }

  return parseGenericTaskEntries(entries);
}

export async function parseThemisZip(
  file: Blob | ArrayBuffer
): Promise<ParseZipResult> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);
  const entries: GenericFileEntry[] = [];

  for (const [relativePath, zipEntry] of Object.entries(loaded.files)) {
    if (zipEntry.dir) continue;
    entries.push({
      path: relativePath,
      getContent: () => zipEntry.async('string'),
    });
  }

  return parseGenericTaskEntries(entries);
}

/**
 * Core engine to parse Student Submissions.
 * Strict Rule:
 * When uploading a directory (e.g. `danhsach/`):
 * - `danhsach/tenhocsinh1/Code.cpp` -> accepted, contestant = `tenhocsinh1`
 * - `danhsach/tenhocsinh2/Code.cpp` -> accepted, contestant = `tenhocsinh2`
 * - `danhsach/Code.cpp` (file cùng cấp với folder tên học sinh) -> REJECTED / IGNORED!
 */
async function parseGenericSubmissionEntries(
  entries: GenericFileEntry[]
): Promise<ParsedSubmission[]> {
  const results: ParsedSubmission[] = [];
  const validExtensions = ['cpp', 'cc', 'cxx', 'pas', 'p', 'py', 'java', 'c'];

  // Check if this batch is a multi-student folder (contains entries with path depth >= 3)
  const hasMultiStudentFolder = entries.some((entry) => {
    const rawPath = entry.path.replace(/\\/g, '/');
    const parts = rawPath.split('/').filter((p) => p.length > 0);
    return parts.length >= 3;
  });

  for (const entry of entries) {
    const rawPath = entry.path.replace(/\\/g, '/');
    if (
      rawPath.includes('__MACOSX') ||
      rawPath.includes('.DS_Store') ||
      rawPath.includes('Thumbs.db')
    ) {
      continue;
    }

    const parts = rawPath.split('/').filter((p) => p.length > 0);
    if (parts.length === 0) continue;

    const fileName = parts[parts.length - 1];
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) continue;

    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

    // Check bracket pattern e.g. HS01[BAI1].cpp (always valid)
    const bracketMatch = nameWithoutExt.match(/^([^\[\]]+)\[([^\[\]]+)\]$/);
    if (bracketMatch) {
      results.push({
        contestantName: cleanContestantName(bracketMatch[1]),
        problemCode: cleanProblemCode(bracketMatch[2]),
        languageId: detectLanguageId(fileName),
        fileName,
        sourceCode: await entry.getContent(),
      });
      continue;
    }

    // STRICT FOLDER RULE:
    // If uploading `danhsach/`, any file with parts.length < 3 is at root `danhsach/Code.cpp`
    // (cùng cấp với folder tên học sinh) and MUST BE IGNORED!
    if (hasMultiStudentFolder && parts.length < 3) {
      // Ignored: file is at same level as student folders
      continue;
    }

    let contestantName = '';
    let problemCode = '';

    if (parts.length >= 3) {
      // e.g. "danhsach/tenhocsinh1/Code.cpp" -> parts[1] is student name
      // or "BaiLam/NguyenVanA/CHUYENDE.cpp" -> parts[parts.length - 2] is student name
      const parentFolder = parts[parts.length - 2];
      const isGenericWrapper = ['src', 'code', 'submissions'].includes(parentFolder.toLowerCase());

      if (isGenericWrapper && parts.length >= 4) {
        contestantName = parts[parts.length - 3];
      } else {
        contestantName = parentFolder;
      }
      problemCode = nameWithoutExt.toUpperCase();
    } else if (parts.length === 2) {
      // Single student folder selected directly: e.g. "NguyenVanA/Code.cpp"
      contestantName = parts[0];
      problemCode = nameWithoutExt.toUpperCase();
    } else {
      // Flat delimiter match e.g. HS01_BAI1.cpp
      const delimMatch = nameWithoutExt.match(/^([^_–-]+)[_–-]([^_–-]+)$/);
      if (delimMatch) {
        contestantName = delimMatch[1].trim();
        problemCode = delimMatch[2].trim().toUpperCase();
      }
    }

    contestantName = cleanContestantName(contestantName);
    problemCode = cleanProblemCode(problemCode);

    if (!contestantName || !problemCode) continue;

    const sourceCode = await entry.getContent();

    results.push({
      contestantName,
      problemCode,
      languageId: detectLanguageId(fileName),
      fileName,
      sourceCode,
    });
  }

  // Sort by contestant name, then problem code
  results.sort((a, b) => {
    const comp = a.contestantName.localeCompare(b.contestantName);
    if (comp !== 0) return comp;
    return a.problemCode.localeCompare(b.problemCode);
  });

  return results;
}

export async function parseThemisSubmissionFolder(
  files: FileList | File[]
): Promise<ParsedSubmission[]> {
  const entries: GenericFileEntry[] = [];
  const fileArray = Array.from(files);

  for (const f of fileArray) {
    const path = f.webkitRelativePath || f.name;
    entries.push({
      path,
      getContent: () => f.text(),
    });
  }

  return parseGenericSubmissionEntries(entries);
}

export async function parseThemisSubmissionZip(
  file: Blob | ArrayBuffer
): Promise<ParsedSubmission[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);
  const entries: GenericFileEntry[] = [];

  for (const [relativePath, zipEntry] of Object.entries(loaded.files)) {
    if (zipEntry.dir) continue;
    entries.push({
      path: relativePath,
      getContent: () => zipEntry.async('string'),
    });
  }

  return parseGenericSubmissionEntries(entries);
}
