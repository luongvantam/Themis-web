import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { 
  parseThemisZip, 
  parseThemisTaskFolder, 
  parseThemisSubmissionFolder, 
  parseThemisSubmissionZip 
} from '../src/utils/zipParser';

describe('Themis Zip & Folder Parser', () => {
  it('should parse standard Themis directory structure: TaskName/Test01/Task.INP & Task.OUT', async () => {
    const zip = new JSZip();

    // Create BAI1 testcases
    zip.file('BAI1/Test01/BAI1.INP', '1 2\n');
    zip.file('BAI1/Test01/BAI1.OUT', '3\n');
    zip.file('BAI1/Test02/BAI1.INP', '10 20\n');
    zip.file('BAI1/Test02/BAI1.OUT', '30\n');

    // Create BAI2 testcases under Tasks/ prefix
    zip.file('Tasks/BAI2/01/BAI2.INP', '5\n');
    zip.file('Tasks/BAI2/01/BAI2.OUT', '25\n');

    const zipContent = await zip.generateAsync({ type: 'arraybuffer' });
    const { problems, warnings } = await parseThemisZip(zipContent);

    expect(warnings).toHaveLength(0);
    expect(problems).toHaveLength(2);

    const bai1 = problems.find(p => p.code === 'BAI1');
    expect(bai1).toBeDefined();
    expect(bai1?.testCases).toHaveLength(2);
    expect(bai1?.testCases[0].name).toBe('Test01');
    expect(bai1?.testCases[0].input).toBe('1 2\n');
    expect(bai1?.testCases[0].output).toBe('3\n');

    const bai2 = problems.find(p => p.code === 'BAI2');
    expect(bai2).toBeDefined();
    expect(bai2?.testCases).toHaveLength(1);
    expect(bai2?.testCases[0].name).toBe('01');
    expect(bai2?.testCases[0].output).toBe('25\n');
  });

  it('should parse user-provided folder structure: Root/TaskName/TestXX/Task.INP & .OUT', async () => {
    const mockFiles: any[] = [
      {
        webkitRelativePath: '13.11 - Phuc Lai cham/CHUYENDE/Test01/CHUYENDE.INP',
        text: async () => '5\n',
      },
      {
        webkitRelativePath: '13.11 - Phuc Lai cham/CHUYENDE/Test01/CHUYENDE.OUT',
        text: async () => '10\n',
      },
      {
        webkitRelativePath: '13.11 - Phuc Lai cham/MAVE/Test01/MAVE.INP',
        text: async () => '1 2 3\n',
      },
      {
        webkitRelativePath: '13.11 - Phuc Lai cham/MAVE/Test01/MAVE.OUT',
        text: async () => '6\n',
      },
    ];

    const result = await parseThemisTaskFolder(mockFiles);
    expect(result.contestTitle).toBe('13.11 - Phuc Lai cham');
    expect(result.problems).toHaveLength(2);

    const chuyenDe = result.problems.find(p => p.code === 'CHUYENDE');
    expect(chuyenDe).toBeDefined();
    expect(chuyenDe?.testCases).toHaveLength(1);
    expect(chuyenDe?.testCases[0].input).toBe('5\n');
    expect(chuyenDe?.testCases[0].output).toBe('10\n');

    const mave = result.problems.find(p => p.code === 'MAVE');
    expect(mave).toBeDefined();
    expect(mave?.testCases[0].input).toBe('1 2 3\n');
  });

  it('should parse student submission folder: Root/StudentName/ProblemCode.cpp and ignore files at same level', async () => {
    // Structure:
    // danhsach/
    // - tenhocsinh1/Code.cpp
    // - tenhocsinh2/MAVE.cpp
    // - tenhocsinh3/TRAM.cpp
    // - Code.cpp  <-- SAME LEVEL AS STUDENT FOLDERS, MUST BE IGNORED!
    // - readme.txt <-- SAME LEVEL, MUST BE IGNORED!
    const mockFiles: any[] = [
      {
        webkitRelativePath: 'danhsach/tenhocsinh1/Code.cpp',
        name: 'Code.cpp',
        text: async () => '// student 1',
      },
      {
        webkitRelativePath: 'danhsach/tenhocsinh2/MAVE.cpp',
        name: 'MAVE.cpp',
        text: async () => '// student 2',
      },
      {
        webkitRelativePath: 'danhsach/tenhocsinh3/TRAM.cpp',
        name: 'TRAM.cpp',
        text: async () => '// student 3',
      },
      {
        webkitRelativePath: 'danhsach/Code.cpp', // Same level as student folder!
        name: 'Code.cpp',
        text: async () => '// rogue root file',
      },
      {
        webkitRelativePath: 'danhsach/readme.txt',
        name: 'readme.txt',
        text: async () => 'instructions',
      },
    ];

    const submissions = await parseThemisSubmissionFolder(mockFiles);
    expect(submissions).toHaveLength(3); // The root Code.cpp and readme.txt are ignored!

    const s1 = submissions.find(s => s.contestantName === 'tenhocsinh1');
    expect(s1).toBeDefined();
    expect(s1?.problemCode).toBe('CODE');

    const s2 = submissions.find(s => s.contestantName === 'tenhocsinh2');
    expect(s2).toBeDefined();
    expect(s2?.problemCode).toBe('MAVE');

    const s3 = submissions.find(s => s.contestantName === 'tenhocsinh3');
    expect(s3).toBeDefined();
    expect(s3?.problemCode).toBe('TRAM');

    // Ensure no 'danhsach' contestant was created from the root Code.cpp
    const rogue = submissions.find(s => s.contestantName === 'danhsach');
    expect(rogue).toBeUndefined();
  });

  it('should parse single student folder: StudentName/ProblemCode.cpp', async () => {
    const mockFiles: any[] = [
      {
        webkitRelativePath: '12.11-Huy cham/ARCHIVE.cpp',
        name: 'ARCHIVE.cpp',
        text: async () => '// Huy code',
      },
      {
        webkitRelativePath: '12.11-Huy cham/FLIPRUN.cpp',
        name: 'FLIPRUN.cpp',
        text: async () => '// Huy code 2',
      },
    ];

    const submissions = await parseThemisSubmissionFolder(mockFiles);
    expect(submissions).toHaveLength(2);
    expect(submissions[0].contestantName).toBe('12.11-Huy cham');
    expect(submissions[0].problemCode).toBe('ARCHIVE');
    expect(submissions[1].problemCode).toBe('FLIPRUN');
  });

  it('should parse zip archive of submissions with bracket format', async () => {
    const zip = new JSZip();
    zip.file('Submissions/HS01[BAI1].cpp', 'int main(){}');
    zip.file('Submissions/HS02[BAI1].py', 'print(1)');

    const zipContent = await zip.generateAsync({ type: 'arraybuffer' });
    const submissions = await parseThemisSubmissionZip(zipContent);

    expect(submissions).toHaveLength(2);
    expect(submissions[0].contestantName).toBe('HS01');
    expect(submissions[0].problemCode).toBe('BAI1');
    expect(submissions[0].languageId).toBe(54);

    expect(submissions[1].contestantName).toBe('HS02');
    expect(submissions[1].problemCode).toBe('BAI1');
    expect(submissions[1].languageId).toBe(71); // Python
  });

  it('should parse individual files with delimiter pattern HS01_BAI1.cpp or bracket HS01[BAI1].pas', async () => {
    const mockFiles: any[] = [
      {
        webkitRelativePath: 'HS01_BAI1.cpp',
        name: 'HS01_BAI1.cpp',
        text: async () => '#include <iostream>',
      },
      {
        webkitRelativePath: 'NguyenVanB[BAI2].pas',
        name: 'NguyenVanB[BAI2].pas',
        text: async () => 'begin end.',
      },
    ];

    const submissions = await parseThemisSubmissionFolder(mockFiles);
    expect(submissions).toHaveLength(2);
    expect(submissions[0].contestantName).toBe('HS01');
    expect(submissions[0].problemCode).toBe('BAI1');
    expect(submissions[1].contestantName).toBe('NguyenVanB');
    expect(submissions[1].problemCode).toBe('BAI2');
  });
});
