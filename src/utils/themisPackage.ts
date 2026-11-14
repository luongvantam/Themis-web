import JSZip from 'jszip';
import { Contest, Submission } from '../types';

/**
 * Exports a contest to a downloadable JSON .themis package.
 */
export function exportContestToJSON(contest: Contest): Blob {
  const jsonStr = JSON.stringify(contest, null, 2);
  return new Blob([jsonStr], { type: 'application/json' });
}

/**
 * Imports a contest from a JSON string or file.
 */
export function importContestFromJSON(jsonString: string): Contest {
  const parsed = JSON.parse(jsonString);
  if (!parsed.id || !parsed.title || !Array.isArray(parsed.problems)) {
    throw new Error('Invalid .themis contest package format');
  }
  return parsed as Contest;
}

/**
 * Exports a full .contest ZIP archive matching the authentic Themis Windows structure.
 * Contains:
 * - Tasks/ with all problem test cases (.INP & .OUT)
 * - Contestants/ with student source codes
 * - TaskDirectories.txt
 * - ContestantDirectories.txt
 */
export async function exportContestToContestZip(
  contest: Contest,
  submissions: Submission[] = []
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Tasks folder
  const taskDirLines: string[] = [];
  for (const prob of contest.problems) {
    taskDirLines.push(prob.code);
    for (const tc of prob.testCases) {
      taskDirLines.push(`${prob.code}\\${tc.name}`);
      zip.file(`Tasks/${prob.code}/${tc.name}/${prob.code}.INP`, tc.input);
      zip.file(`Tasks/${prob.code}/${tc.name}/${prob.code}.OUT`, tc.output);
    }
  }

  // 2. Contestants folder
  const studentNames = Array.from(new Set(submissions.map((s) => s.contestantName))).sort();
  for (const sub of submissions) {
    const ext =
      sub.languageId === 67
        ? 'pas'
        : sub.languageId === 71
        ? 'py'
        : sub.languageId === 62
        ? 'java'
        : sub.languageId === 50
        ? 'c'
        : 'cpp';
    zip.file(`Contestants/${sub.contestantName}/${sub.problemCode}.${ext}`, sub.sourceCode);
  }

  // 3. Manifest files
  zip.file('TaskDirectories.txt', taskDirLines.join('\r\n'));
  zip.file('ContestantDirectories.txt', studentNames.join('\r\n'));

  // 4. Generate ZIP blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
