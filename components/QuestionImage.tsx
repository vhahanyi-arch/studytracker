"use client";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { type PaperQuestion, displayCrop } from "@/lib/paper-questions";

// Rendered crops are expensive to produce, so they are cached across mounts
// for the lifetime of the page.
const renderedQuestionCache = new Map<string, string>();

export function QuestionImage({
  assignmentId,
  pdf,
  question,
  onRendered,
}: {
  assignmentId: string;
  pdf: PDFDocumentProxy | null;
  question: PaperQuestion;
  onRendered?: (image: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState("Loading question…");
  useEffect(() => {
    if (!pdf) return;
    setMessage("Loading question…");
    const visibleCanvas = canvasRef.current;
    if (visibleCanvas) {
      visibleCanvas
        .getContext("2d")
        ?.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
    }
    let cancelled = false;
    (async () => {
      const cacheKey = `top-pad-v1:${assignmentId}:${question.id || question.position}:${question.page_number}:${question.crop_x}:${question.crop_y}:${question.crop_width}:${question.crop_height}`;
      const cached = renderedQuestionCache.get(cacheKey);
      if (cached) {
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject();
          image.src = cached;
        });
        if (cancelled) return;
        const target = canvasRef.current!;
        target.width = image.width;
        target.height = image.height;
        target.getContext("2d")!.drawImage(image, 0, 0);
        onRendered?.(cached);
        setMessage("");
        return;
      }
      const page = await pdf.getPage(question.page_number);
      const viewport = page.getViewport({ scale: 1.7 });
      const source = document.createElement("canvas");
      source.width = viewport.width;
      source.height = viewport.height;
      await page.render({
        canvas: source,
        canvasContext: source.getContext("2d")!,
        viewport,
      }).promise;
      if (cancelled) return;
      const visibleCrop = displayCrop(question);
      const sx = Math.round(visibleCrop.x * source.width);
      const sy = Math.round(visibleCrop.y * source.height);
      const sw = Math.max(1, Math.round(visibleCrop.width * source.width));
      const sh = Math.max(1, Math.round(visibleCrop.height * source.height));
      const target = canvasRef.current!;
      target.width = sw;
      target.height = sh;
      target.getContext("2d")!.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
      const rendered = target.toDataURL("image/webp", 0.92);
      renderedQuestionCache.set(cacheKey, rendered);
      onRendered?.(rendered);
      setMessage("");
    })().catch(() => setMessage("This question could not be displayed."));
    return () => {
      cancelled = true;
    };
  }, [assignmentId, pdf, question]);
  // The question is a cropped bitmap of the original paper, so without a name
  // a screen reader reports nothing at all. extracted_question_text is already
  // stored per question and already sent to the client, so use it when it is
  // there and say plainly when it is not, rather than leaving silence.
  const marks = question.marks ? `, ${question.marks} mark${question.marks === 1 ? "" : "s"}` : "";
  const description = question.extracted_question_text?.trim()
    ? `Question ${question.label}${marks}. ${question.extracted_question_text.trim()}`
    : `Question ${question.label}${marks}. Shown as an image from the question paper; no text version is available.`;
  return (
    <div className="question-image">
      {message && <p>{message}</p>}
      <canvas ref={canvasRef} role="img" aria-label={description} />
    </div>
  );
}
