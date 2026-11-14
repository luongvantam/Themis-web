import { Contest, Submission } from '../types';

export interface ScoreboardRow {
  rank: number;
  contestantName: string;
  problemScores: Record<string, number | undefined>; // problemCode -> max earned score, or undefined if not graded
  problemGraded: Record<string, boolean>; // problemCode -> whether this problem was actually graded
  totalScore: number;
  hasAnyGraded: boolean; // whether contestant has at least one graded score
  submissionCount: number;
  lastSubmitTime: number;
}

/**
 * Aggregates all submissions in a contest into a standard Themis scoreboard.
 * Takes the highest score achieved by each contestant for each problem.
 */
export function calculateScoreboard(
  contest: Contest,
  submissions: Submission[]
): ScoreboardRow[] {
  const contestantMap: Map<
    string,
    {
      scores: Record<string, number | undefined>;
      graded: Record<string, boolean>;
      count: number;
      lastTime: number;
    }
  > = new Map();

  for (const sub of submissions) {
    if (sub.contestId !== contest.id) continue;

    if (!contestantMap.has(sub.contestantName)) {
      const initialScores: Record<string, number | undefined> = {};
      const initialGraded: Record<string, boolean> = {};
      contest.problems.forEach((p) => {
        initialScores[p.code] = undefined;
        initialGraded[p.code] = false;
      });
      contestantMap.set(sub.contestantName, {
        scores: initialScores,
        graded: initialGraded,
        count: 0,
        lastTime: 0,
      });
    }

    const entry = contestantMap.get(sub.contestantName)!;
    entry.count += 1;
    if (sub.createdAt > entry.lastTime) {
      entry.lastTime = sub.createdAt;
    }

    // A submission is graded if its status is DONE or it has test results
    const isGraded = sub.status === 'DONE' || (sub.testResults && sub.testResults.length > 0);
    if (isGraded) {
      entry.graded[sub.problemCode] = true;
      const prevScore = entry.scores[sub.problemCode];
      if (prevScore === undefined || sub.totalScore > prevScore) {
        entry.scores[sub.problemCode] = sub.totalScore;
      }
    }
  }

  const rows: ScoreboardRow[] = [];

  for (const [name, data] of contestantMap.entries()) {
    let hasGradedAny = false;
    let totalScore = 0;
    for (const p of contest.problems) {
      const pScore = data.scores[p.code];
      if (data.graded[p.code] && pScore !== undefined) {
        hasGradedAny = true;
        totalScore += pScore;
      }
    }
    rows.push({
      rank: 1,
      contestantName: name,
      problemScores: data.scores,
      problemGraded: data.graded,
      totalScore: Number(totalScore.toFixed(2)),
      hasAnyGraded: hasGradedAny,
      submissionCount: data.count,
      lastSubmitTime: data.lastTime,
    });
  }

  // Sort descending by total score, then by earliest last submit time
  rows.sort((a, b) => {
    if (a.hasAnyGraded !== b.hasAnyGraded) {
      return a.hasAnyGraded ? -1 : 1;
    }
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.lastSubmitTime - b.lastSubmitTime;
  });

  // Assign ranks
  let currentRank = 1;
  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && rows[i].totalScore === rows[i - 1].totalScore) {
      rows[i].rank = rows[i - 1].rank;
    } else {
      rows[i].rank = currentRank;
    }
    currentRank++;
  }

  return rows;
}

/**
 * Generates CSV content formatted identically to Themis KetQua.csv with UTF-8 BOM.
 */
export function exportScoreboardToCSV(contest: Contest, rows: ScoreboardRow[]): string {
  const problemCodes = contest.problems.map((p) => p.code);
  const header = ['STT', 'Thí sinh', ...problemCodes, 'Tổng điểm'];

  const lines: string[] = [header.join(',')];

  rows.forEach((r, idx) => {
    const pScores = problemCodes.map((code) => (r.problemScores[code] ?? 0).toFixed(2));
    const safeName = `"${r.contestantName.replace(/"/g, '""')}"`;
    lines.push([idx + 1, safeName, ...pScores, r.totalScore.toFixed(2)].join(','));
  });

  // Include UTF-8 BOM so Excel opens Vietnamese characters properly
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Generates plain text formatted scoreboard (.txt)
 */
export function exportScoreboardToTXT(contest: Contest, rows: ScoreboardRow[]): string {
  const problemCodes = contest.problems.map((p) => p.code);
  const now = new Date().toLocaleString('vi-VN');

  const lines: string[] = [];
  lines.push('========================================================================================');
  lines.push(`BẢNG KẾT QUẢ CHẤM THI THEMIS: ${contest.title.toUpperCase()}`);
  lines.push(`Thời gian xuất: ${now}`);
  lines.push('========================================================================================');

  // Headers width
  const sttWidth = 6;
  const nameWidth = 24;
  const scoreWidth = 12;
  const totalWidth = 14;

  const headerStr =
    'STT'.padEnd(sttWidth) +
    ' | ' +
    'Thí sinh'.padEnd(nameWidth) +
    ' | ' +
    problemCodes.map((c) => c.padEnd(scoreWidth)).join(' | ') +
    ' | ' +
    'Tổng điểm'.padStart(totalWidth);

  lines.push(headerStr);
  lines.push('-'.repeat(headerStr.length));

  rows.forEach((r, idx) => {
    const stt = (idx + 1).toString().padEnd(sttWidth);
    const name = r.contestantName.substring(0, nameWidth).padEnd(nameWidth);
    const pScores = problemCodes
      .map((c) => (r.problemScores[c] ?? 0).toFixed(2).padEnd(scoreWidth))
      .join(' | ');
    const total = r.totalScore.toFixed(2).padStart(totalWidth);

    lines.push(`${stt} | ${name} | ${pScores} | ${total}`);
  });

  lines.push('========================================================================================');
  lines.push(`Tổng cộng: ${rows.length} thí sinh &bull; ${contest.problems.length} bài toán.`);
  return lines.join('\r\n');
}

/**
 * Generates HTML spreadsheet (.xls) that Excel opens natively with table formatting.
 */
export function exportScoreboardToExcelHTML(contest: Contest, rows: ScoreboardRow[]): string {
  const problemCodes = contest.problems.map((p) => p.code);

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
        table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
        th { background-color: #0078D7; color: #FFFFFF; font-weight: bold; border: 1px solid #005A9E; padding: 6px 12px; }
        td { border: 1px solid #D0D0D0; padding: 6px 12px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .bg-alt { background-color: #F8F9FA; }
        .title { font-size: 16pt; font-weight: bold; color: #003366; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="${problemCodes.length + 3}" class="title">BẢNG KẾT QUẢ KỲ THI: ${contest.title}</td>
        </tr>
        <tr>
          <td colspan="${problemCodes.length + 3}" style="color: #666666;">Xuất lúc: ${new Date().toLocaleString('vi-VN')}</td>
        </tr>
        <tr></tr>
        <tr>
          <th>STT</th>
          <th>Thí sinh</th>
          ${problemCodes.map((c) => `<th>${c}</th>`).join('')}
          <th>Tổng điểm</th>
        </tr>
        ${rows
          .map(
            (r, idx) => `
          <tr class="${idx % 2 === 1 ? 'bg-alt' : ''}">
            <td class="text-center">${idx + 1}</td>
            <td class="font-bold">${r.contestantName}</td>
            ${problemCodes
              .map((c) => `<td class="text-center font-bold">${(r.problemScores[c] ?? 0).toFixed(2)}</td>`)
              .join('')}
            <td class="text-right font-bold" style="color: #008000;">${r.totalScore.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </body>
    </html>
  `.trim();
}
