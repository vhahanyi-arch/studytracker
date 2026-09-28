// Which uploaded handwritten file (and which page of it) shows the answer to a
// question, when a student uploads their whole paper rather than one file per
// question. Used when a submission is saved, and again when the marking queue
// reads a submission saved before answers carried their page.

export type WholePaperLink = {
  handwrittenFileIndex: number;
  handwrittenPdfPage: number | undefined;
  handwrittenPageAssigned: true;
  handwrittenUploadMode: "whole_paper";
};

// The paper pages that hold questions, in order.
export function questionPages(questions: Array<{ page_number?: unknown }>) {
  return [...new Set(questions.map((question) => Number(question.page_number || 1)))].sort((a, b) => a - b);
}

// One PDF: the question's own page of it. One file per question page: the
// file in that position. Otherwise: the file numbered like the paper page, or
// the last file if there are fewer.
export function wholePaperLink(pageNumber: unknown, pages: number[], fileCount: number, singlePdf: boolean): WholePaperLink {
  const paperPage = Math.max(1, Number(pageNumber || 1));
  const compactIndex = pages.indexOf(paperPage);
  const fileIndex = singlePdf
    ? 0
    : fileCount === pages.length && compactIndex >= 0
      ? compactIndex
      : Math.min(fileCount - 1, paperPage - 1);
  return {
    handwrittenFileIndex: Math.max(0, fileIndex),
    handwrittenPdfPage: singlePdf ? paperPage : undefined,
    handwrittenPageAssigned: true,
    handwrittenUploadMode: "whole_paper",
  };
}

// submissions.handwritten_url holds a JSON list of uploaded files; very early
// rows hold a single bare URL, which counts as one file of unknown type.
export function storedHandwrittenFiles(stored: unknown): Array<{ type?: string }> {
  const text = String(stored || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [{}];
  } catch {
    return [{}];
  }
}
