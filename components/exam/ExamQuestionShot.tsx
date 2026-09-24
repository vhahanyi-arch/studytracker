"use client";
import { useEffect, useMemo, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { QuestionImage } from "@/components/QuestionImage";
import type { PaperQuestion } from "@/lib/paper-questions";

export type QuestionCrop = { page: number; x: number; y: number; width: number; height: number };
type ShotPaper = {
  files: Array<{ role: string; file: { id: string } }>;
  crops?: Record<string, QuestionCrop[]>;
};

// One download per paper however many questions show it, for the life of the page.
const papers = new Map<string, Promise<PDFDocumentProxy>>();
export function loadPaper(fileId: string) {
  let pending = papers.get(fileId);
  if (!pending) {
    pending = import("pdfjs-dist").then(async (pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const response = await fetch(`/api/physics-exam/files/${fileId}`);
      if (!response.ok) throw new Error("paper");
      return pdfjs.getDocument({ data: await response.arrayBuffer() }).promise;
    });
    // A failed download is retried next time rather than remembered.
    pending.catch(() => papers.delete(fileId));
    papers.set(fileId, pending);
  }
  return pending;
}

export const questionFileOf = (paper: ShotPaper) => paper.files.find((f) => f.role !== "scheme")?.file.id ?? null;

// Where the question is printed. Papers extracted before screenshots existed
// have no crops, so they show the question's whole source pages.
export function cropsOf(paper: ShotPaper, question: { id: string; sourcePages: number[] }): QuestionCrop[] {
  return paper.crops?.[question.id] ?? question.sourcePages.map((page) => ({ page, x: 0, y: 0, width: 1, height: 1 }));
}

/** A question shown exactly as printed, diagrams and tables included. */
export function ExamQuestionShot({ paper, question }: {
  paper: ShotPaper;
  question: { id: string; marks: number; text: string; sourcePages: number[] };
}) {
  const fileId = questionFileOf(paper);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!fileId) return;
    let live = true;
    setFailed(false);
    loadPaper(fileId).then((doc) => live && setPdf(doc)).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [fileId]);
  const crops = cropsOf(paper, question);
  // QuestionImage redraws whenever its question object changes, so these must
  // keep their identity across renders or every keystroke would redraw them.
  const shots = useMemo<PaperQuestion[]>(() => crops.map((crop, i) => ({
    id: `${question.id}#${i}`, label: question.id, marks: question.marks,
    page_number: crop.page, crop_x: crop.x, crop_y: crop.y, crop_width: crop.width, crop_height: crop.height,
    extracted_question_text: question.text,
  })), [JSON.stringify(crops), question.id, question.marks, question.text]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!fileId) return null;
  if (failed)
    return (
      <p className="error-text">
        The question paper could not be loaded.{" "}
        <a href={`/api/physics-exam/files/${fileId}`} target="_blank" rel="noreferrer">Open it in a new tab ↗</a>
      </p>
    );
  return (
    <div className="exam-question-shots">
      {shots.map((shot) => <QuestionImage key={shot.id} assignmentId={fileId} pdf={pdf} question={shot} />)}
    </div>
  );
}
