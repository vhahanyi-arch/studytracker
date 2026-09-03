type ReportQuestion = {
  label: string;
  topic: string;
  studentAnswer: string;
  correctAnswer: string;
  correct: boolean;
  score?: number;
  maximum?: number;
  feedback?: string;
};

type ReportData = {
  student: string;
  title: string;
  syllabus: string;
  date: string;
  score: number;
  maximum: number;
  questions: ReportQuestion[];
  mode?: "structured" | "multiple_choice";
  overallFeedback?: string;
};

const clean = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
const escapePdf = (value: string) =>
  clean(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const pdfColour = (value: string) =>
  value.split(" ").map((part) => (Number(part) / 255).toFixed(3)).join(" ");

export function buildProgressReportPdf(data: ReportData) {
  const pages: string[][] = [[]];
  let page = 0;
  let y = 790;
  const command = (value: string) => pages[page].push(value);
  const text = (value: string, x: number, size = 10, bold = false, colour = "20 24 48") =>
    command(`${pdfColour(colour)} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET`);
  const line = (fromX: number, toX: number, atY = y, colour = "224 221 234") =>
    command(`${pdfColour(colour)} RG 0.7 w ${fromX} ${atY} m ${toX} ${atY} l S`);
  const newPage = () => { page += 1; pages.push([]); y = 790; header(); };
  const ensure = (height: number) => { if (y - height < 48) newPage(); };
  const wrapped = (value: string, width: number) => {
    const words = clean(value).split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      if (`${current} ${word}`.trim().length > width) {
        if (current) lines.push(current);
        current = word;
      } else current = `${current} ${word}`.trim();
    }
    if (current) lines.push(current);
    return lines;
  };
  const header = () => {
    command("0.357 0.275 0.686 rg 0 748 595 94 re f");
    y = 812; text("STUDYTRACK", 44, 10, true, "255 255 255");
    y = 788; text(data.mode === "structured" ? "Teacher-marked progress report" : "Multiple-choice progress report", 44, 20, true, "255 255 255");
    y = 764; text(`${data.title} | ${data.syllabus}`, 44, 9, false, "238 235 255");
    y = 728;
  };
  header();
  text(data.student, 44, 17, true); y -= 18;
  text(`Completed ${data.date}`, 44, 9, false, "101 96 118");
  const percentage = data.maximum ? Math.round((data.score / data.maximum) * 100) : 0;
  command("0.957 0.949 1.000 rg 390 676 160 58 re f");
  y = 710; text(`${data.score} / ${data.maximum}`, 410, 20, true, "91 70 175");
  y = 689; text(`${percentage}% final mark`, 410, 9, true, "91 70 175");
  y = 650; text("Performance summary", 44, 14, true); y -= 18;
  const topicMap = new Map<string, { earned: number; maximum: number; review: string[] }>();
  for (const question of data.questions) {
    const topic = question.topic || "General skills";
    const entry = topicMap.get(topic) || { earned: 0, maximum: 0, review: [] };
    const questionMaximum = Number(question.maximum ?? 1);
    const questionScore = Number(question.score ?? (question.correct ? questionMaximum : 0));
    entry.maximum += questionMaximum;
    entry.earned += questionScore;
    if (questionScore < questionMaximum) entry.review.push(question.label);
    topicMap.set(topic, entry);
  }
  for (const [topic, result] of topicMap) {
    ensure(25);
    text(topic, 44, 10, true);
    text(`${result.earned}/${result.maximum}`, 490, 10, true, result.earned === result.maximum ? "16 133 103" : "191 111 25");
    y -= 16; line(44, 550); y -= 10;
  }
  const weak = [...topicMap.entries()].filter(([, result]) => result.earned < result.maximum);
  ensure(90); y -= 4; text("Areas to improve", 44, 14, true); y -= 20;
  if (!weak.length) { text("Excellent work - no weak areas were identified in this paper.", 44, 10); y -= 22; }
  for (const [topic, result] of weak) {
    ensure(48); text(topic, 44, 10, true, "191 111 25"); y -= 14;
    for (const row of wrapped(`Revisit questions ${result.review.join(", ")}. Review the underlying method, correct the response using the marking guidance, and then attempt two similar questions without notes.`, 88)) {
      text(row, 44, 9, false, "72 68 84"); y -= 12;
    }
    y -= 8;
  }
  if (data.overallFeedback) {
    ensure(75); text("Teacher feedback", 44, 14, true); y -= 18;
    for (const row of wrapped(data.overallFeedback, 92)) { text(row, 44, 9, false, "72 68 84"); y -= 12; }
    y -= 8;
  }
  ensure(60); text("Answer review", 44, 14, true); y -= 20;
  if (data.mode === "structured") {
    for (const question of data.questions) {
      const studentLines = wrapped(question.studentAnswer || "No answer submitted", 88);
      const solutionLines = wrapped(question.correctAnswer || "Teacher-marked response", 88);
      const feedbackLines = question.feedback ? wrapped(question.feedback, 88) : [];
      ensure(60 + (studentLines.length + solutionLines.length + feedbackLines.length) * 12);
      text(`Question ${question.label}`, 44, 10, true);
      text(`${Number(question.score || 0)} / ${Number(question.maximum || 0)}`, 500, 10, true, question.correct ? "16 133 103" : "191 111 25");
      y -= 15; text(clean(question.topic), 44, 8, false, "101 96 118"); y -= 14;
      text("Student response", 44, 8, true);
      for (const row of studentLines) { y -= 11; text(row, 52, 8); }
      y -= 14; text("Expected answer / marking guidance", 44, 8, true);
      for (const row of solutionLines) { y -= 11; text(row, 52, 8); }
      if (feedbackLines.length) {
        y -= 14; text("Teacher comment", 44, 8, true, "91 70 175");
        for (const row of feedbackLines) { y -= 11; text(row, 52, 8); }
      }
      y -= 14; line(44, 550); y -= 12;
    }
  } else {
    const answerHeader = () => {
      text("Question", 44, 9, true); text("Topic", 112, 9, true); text("Your answer", 365, 9, true); text("Correct", 460, 9, true); text("Result", 520, 9, true); y -= 10; line(44, 550); y -= 14;
    };
    answerHeader();
    for (const question of data.questions) {
      if (y - 28 < 48) {
        newPage();
        text("Answer review continued", 44, 14, true); y -= 22;
        answerHeader();
      }
      text(question.label, 44, 9, true);
      text(clean(question.topic).slice(0, 39), 112, 8);
      text(question.studentAnswer || "-", 365, 9);
      text(question.correctAnswer || "-", 460, 9);
      text(question.correct ? "Correct" : "Review", 520, 8, true, question.correct ? "16 133 103" : "191 68 68");
      y -= 15; line(44, 550); y -= 8;
    }
  }
  ensure(100); text("Your next steps", 44, 14, true); y -= 20;
  const tips = weak.length
    ? ["Start with the weakest topic above.", "Correct every missed question without looking at the answer key.", "Write one sentence explaining why your new choice is correct.", "Retry the paper after revision and compare your score."]
    : ["Maintain your strong result with short mixed-topic practice.", "Explain difficult answers aloud to check your reasoning.", "Retry the paper under timed conditions."];
  tips.forEach((tip, index) => { text(`${index + 1}. ${tip}`, 52, 9); y -= 16; });

  pages.forEach((commands, index) => {
    commands.push(`${pdfColour("101 96 118")} rg BT /F1 8 Tf 44 28 Td (StudyTrack | Page ${index + 1} of ${pages.length}) Tj ET`);
  });
  const objects: string[] = [];
  const pageRefs = pages.map((_, index) => `${5 + index * 2} 0 R`).join(" ");
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  pages.forEach((commands, index) => {
    const pageObject = 5 + index * 2;
    const contentObject = pageObject + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`);
    const stream = commands.join("\n");
    objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  });
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}
