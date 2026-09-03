import { readFile } from "node:fs/promises";
import {
  analysePaperWithMarkScheme,
  parseMarkScheme,
} from "../lib/cambridge-analysis.ts";

globalThis.DOMMatrix ||= class DOMMatrix {};
globalThis.ImageData ||= class ImageData {};
globalThis.Path2D ||= class Path2D {};
globalThis.pdfjsWorker ||= await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

const downloads = "C:/Users/USER/Downloads";
const cases = [
  {
    name: "0580 March 2026 Paper 12",
    subject: "Mathematics",
    mode: "structured",
    paper: `${downloads}/0580 Mathematics March 2026 Question Paper  12.pdf`,
    scheme: `${downloads}/0580 Mathematics March 2026 Mark Scheme  12.pdf`,
  },
  {
    name: "0580 March 2026 Paper 32",
    subject: "Mathematics",
    mode: "structured",
    paper: `${downloads}/0580 Mathematics March 2026 Question Paper  32.pdf`,
    scheme: `${downloads}/0580 Mathematics March 2026 Mark Scheme  32.pdf`,
  },
  {
    name: "0580 Oct/Nov 2025 Paper 11",
    subject: "Mathematics",
    mode: "structured",
    paper: `${downloads}/0580_w25_qp_11.pdf`,
    scheme: `${downloads}/0580_w25_ms_11.pdf`,
  },
  {
    name: "0580 Oct/Nov 2024 Paper 21",
    subject: "Mathematics",
    mode: "structured",
    paper: `${downloads}/0580_w24_qp_21.pdf`,
    scheme: `${downloads}/0580_w24_ms_21.pdf`,
  },
  {
    name: "0625 March 2026 Paper 12",
    subject: "Physics",
    mode: "multiple_choice",
    paper: `${downloads}/0625 Physics March 2026 Question Paper  12.pdf`,
    scheme: `${downloads}/0625 Physics March 2026 Mark Scheme  12.pdf`,
  },
  {
    name: "0625 March 2026 Paper 32",
    subject: "Physics",
    mode: "structured",
    paper: `${downloads}/0625 Physics March 2026 Question Paper  32.pdf`,
    scheme: `${downloads}/0625 Physics March 2026 Mark Scheme  32.pdf`,
    expectedMarks: { "1(a)": 3 },
  },
  {
    name: "0625 Oct/Nov 2025 Paper 41",
    subject: "Physics",
    mode: "structured",
    paper: `${downloads}/0625_w25_qp_41.pdf`,
    scheme: `${downloads}/0625_w25_ms_41.pdf`,
  },
  {
    name: "0625 Oct/Nov 2025 Paper 61",
    subject: "Physics",
    mode: "structured",
    paper: `${downloads}/0625_w25_qp_61.pdf`,
    scheme: `${downloads}/0625_w25_ms_61.pdf`,
  },
  {
    name: "9702 March 2026 Paper 12",
    subject: "Physics",
    mode: "multiple_choice",
    paper: `${downloads}/9702 Physics March 2026 Question Paper  12.pdf`,
    scheme: `${downloads}/9702 Physics March 2026 Mark Scheme  12.pdf`,
  },
  {
    name: "9702 March 2026 Paper 22",
    subject: "Physics",
    mode: "structured",
    paper: `${downloads}/9702 Physics March 2026 Question Paper  22.pdf`,
    scheme: `${downloads}/9702 Physics March 2026 Mark Scheme  22.pdf`,
    expectedMarks: { "2(b)(i)": 2 },
  },
  {
    name: "9702 March 2025 Paper 12",
    subject: "Physics",
    mode: "multiple_choice",
    paper: `${downloads}/9702_m25_qp_12.pdf`,
    scheme: `${downloads}/9702_m25_ms_12.pdf`,
  },
  {
    name: "9702 May/June 2024 Paper 22",
    subject: "Physics",
    mode: "structured",
    paper: `${downloads}/9702_s24_qp_22.pdf`,
    scheme: `${downloads}/9702_s24_ms_22.pdf`,
    expectedMarks: { "1(b)(i)": 3 },
  },
  {
    name: "9702 Oct/Nov 2023 Paper 22",
    subject: "Physics",
    mode: "structured",
    paper: `${downloads}/9702_w23_qp_22.pdf`,
    scheme: `${downloads}/9702_w23_ms_22.pdf`,
  },
];

async function extractPages(path) {
  const bytes = new Uint8Array(await readFile(path));
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      words: content.items
        .map((item) => {
          const transform = item.transform || [];
          const rotated =
            Math.abs(Number(transform[1] || 0)) >= 0.01 ||
            Math.abs(Number(transform[2] || 0)) >= 0.01;
          return {
            text: String(item.str || "").trim(),
            x: rotated ? Number(transform[5] || 0) : Number(transform[4] || 0),
            top: rotated
              ? Number(transform[4] || 0)
              : viewport.height - Number(transform[5] || 0),
            width: Number(item.width || 0),
            height: Number(item.height || 0),
            horizontal: true,
          };
        })
        .filter((word) => word.text),
    });
  }
  return pages;
}

let failed = false;
const selectedCases = process.env.TEST_FILTER
  ? cases.filter((testCase) => testCase.name.includes(process.env.TEST_FILTER))
  : cases;
for (const testCase of selectedCases) {
  const [paperPages, schemePages] = await Promise.all([
    extractPages(testCase.paper),
    extractPages(testCase.scheme),
  ]);
  const schemeRows = parseMarkScheme(
    schemePages,
    testCase.subject,
    testCase.mode,
  );
  if (!schemeRows.length) {
    const headerCandidates = schemePages.map((page) => ({
      page: page.pageNumber,
      matches: page.words
        .filter((word) => /^(?:question|answer|marks?)$/i.test(word.text.trim()))
        .map((word) => ({ text: word.text, x: word.x, top: word.top })),
    }));
    const diagnosticPage = schemePages.find((page) => {
      const candidate = headerCandidates.find((item) => item.page === page.pageNumber);
      return candidate && ["question", "answer", "marks"].every((label) =>
        candidate.matches.some((match) => match.text.trim().toLowerCase() === label),
      );
    });
    console.log(
      "header diagnostics",
      JSON.stringify(
        diagnosticPage
          ? {
              page: diagnosticPage.pageNumber,
              size: [diagnosticPage.width, diagnosticPage.height],
              headerCandidates,
              words: diagnosticPage.words
                .filter((word) => word.top > 0 && word.top < 180)
                .map((word) => ({ text: word.text, x: word.x, top: word.top })),
            }
          : { pages: schemePages.length, matchingHeaderWord: false, headerCandidates },
        null,
        2,
      ),
    );
  }
  const result = analysePaperWithMarkScheme(
    paperPages,
    schemeRows,
    testCase.subject,
    testCase.mode,
  );
  const coverage = schemeRows.length
    ? result.questions.length / schemeRows.length
    : 0;
  const markMismatches = Object.entries(testCase.expectedMarks || {})
    .map(([label, expected]) => ({
      label,
      expected,
      actual: schemeRows.find((row) => row.label === label)?.marks ?? null,
    }))
    .filter((check) => check.actual !== check.expected);
  const complete = result.questions.filter(
    (question) => question.marks && question.expected_answer,
  ).length;
  const missingAnswers = result.questions
    .filter((question) => !question.expected_answer)
    .map((question) => question.label);
  const missingAnswerDetails = schemeRows
    .filter((row) => missingAnswers.includes(row.label))
    .map((row) => ({ label: row.label, marks: row.marks, guidance: row.guidance }));
  const missingMarkerDiagnostics = result.missingLabels.length
    ? paperPages.flatMap((page) =>
        page.words
          .filter((word) => /^\(?[a-zivx]+\)?$/i.test(word.text.trim()))
          .map((word) => ({ page: page.pageNumber, text: word.text, x: word.x, top: word.top }))
          .filter((word) => /ii/i.test(word.text)),
      )
    : [];
  console.log(`\n${testCase.name}`);
  console.log({
    schemeRows: schemeRows.length,
    detected: result.questions.length,
    coverage: `${Math.round(coverage * 100)}%`,
    complete,
    missingAnswers,
    missingAnswerDetails,
    missing: result.missingLabels,
    markMismatches,
    markMismatchDetails: JSON.stringify(
      markMismatches.map((check) => ({
        label: check.label,
        points: schemeRows.find((row) => row.label === check.label)?.points,
      })),
    ),
    missingMarkerDiagnostics,
    first: schemeRows.slice(0, 3).map((row) => ({
      label: row.label,
      marks: row.marks,
      answer: row.answer,
    })),
    last: schemeRows.slice(-3).map((row) => ({
      label: row.label,
      marks: row.marks,
      answer: row.answer,
    })),
  });
  if (!schemeRows.length || coverage < 1 || markMismatches.length) {
    failed = true;
  }
}

if (failed) process.exitCode = 1;
