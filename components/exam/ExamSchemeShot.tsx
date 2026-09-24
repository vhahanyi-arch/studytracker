"use client";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { loadPaper, type QuestionCrop } from "./ExamQuestionShot";

// A part's rows of the mark scheme, exactly as printed (fractions, powers and
// all), for the teacher's review of a paper read without AI. Cambridge schemes
// store their landscape table sideways on portrait pages, so a row is cut
// from its page as a vertical strip and turned upright (rotate 90).
// Students never receive these: see lib/exam-paper-access.ts.

export type SchemeCrop = QuestionCrop & { rotate: 0 | 90 };
type SchemePaper = {
  files: Array<{ role: string; file: { id: string } }>;
  schemeCrops?: Record<string, SchemeCrop[]>;
};

export const schemeFileOf = (paper: SchemePaper) =>
  (paper.files.find((f) => f.role === "scheme") ?? paper.files.find((f) => f.role === "combined"))?.file.id ?? null;

// Each scheme page drawn once, however many of its rows are shown.
const drawn = new Map<string, Promise<HTMLCanvasElement>>();
function drawPage(fileId: string, pdf: PDFDocumentProxy, pageNumber: number) {
  const key = `${fileId}:${pageNumber}`;
  let pending = drawn.get(key);
  if (!pending) {
    pending = (async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
      return canvas;
    })();
    pending.catch(() => drawn.delete(key));
    drawn.set(key, pending);
  }
  return pending;
}

function SchemeRow({ fileId, pdf, crop }: { fileId: string; pdf: PDFDocumentProxy; crop: SchemeCrop }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    drawPage(fileId, pdf, crop.page).then((page) => {
      const target = ref.current;
      if (!live || !target) return;
      const sx = crop.x * page.width, sy = crop.y * page.height;
      const sw = Math.max(1, crop.width * page.width), sh = Math.max(1, crop.height * page.height);
      const context = target.getContext("2d")!;
      if (crop.rotate === 90) {
        // The strip's stored bottom becomes the row's left: turn it clockwise.
        target.width = Math.round(sh);
        target.height = Math.round(sw);
        context.translate(target.width, 0);
        context.rotate(Math.PI / 2);
      } else {
        target.width = Math.round(sw);
        target.height = Math.round(sh);
      }
      context.drawImage(page, sx, sy, sw, sh, 0, 0, sw, sh);
    }).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [fileId, pdf, crop]);
  if (failed) return <p className="error-text">This row of the mark scheme could not be drawn.</p>;
  return <canvas ref={ref} aria-label={`Mark scheme, page ${crop.page}`} />;
}

/** The mark scheme's rows for one part, or a link to its page when they were not found. */
export function ExamSchemeShot({ paper, questionId, pages }: { paper: SchemePaper; questionId: string; pages: number[] }) {
  const fileId = schemeFileOf(paper);
  const crops = paper.schemeCrops?.[questionId] ?? [];
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!fileId || !crops.length) return;
    let live = true;
    loadPaper(fileId).then((doc) => live && setPdf(doc)).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [fileId, crops.length]);

  if (!fileId) return null;
  const link = (
    <a href={`/api/physics-exam/files/${fileId}#page=${pages[0] ?? 1}`} target="_blank" rel="noreferrer">
      Open the mark scheme{pages.length ? ` at page ${pages[0]}` : ""} ↗
    </a>
  );
  if (!crops.length || failed)
    return <p className="reference">{failed ? "The mark scheme could not be loaded. " : "This part's row was not found in the mark scheme. "}{link}</p>;
  return (
    <div className="exam-scheme-shots">
      <div className="question-image">
        {pdf ? crops.map((crop, i) => <SchemeRow key={i} fileId={fileId} pdf={pdf} crop={crop} />) : <p>Loading the mark scheme…</p>}
      </div>
      <small>{link}</small>
    </div>
  );
}
