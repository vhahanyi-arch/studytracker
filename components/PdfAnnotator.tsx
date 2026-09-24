"use client";
import { useEffect, useRef, useState } from "react";
import { ModalScrim } from "@/components/ModalScrim";
import { beginStroke } from "./inkStroke";

export function PdfAnnotator({
  assignment,
  pages,
  setPages,
  pageNumber,
  setPageNumber,
  onSubmitted,
}: {
  assignment: { id: string; title: string };
  pages: Record<number, string>;
  setPages: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  onSubmitted: (status: string) => Promise<void>;
}) {
  const paperCanvas = useRef<HTMLCanvasElement>(null);
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<ReturnType<typeof beginStroke> | null>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [tool, setTool] = useState<"pen" | "shade" | "eraser">("pen");
  const [message, setMessage] = useState("Loading paper…");
  const [reviewing, setReviewing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = await fetch(`/api/assignments/${assignment.id}/paper`).then(
        (r) => r.arrayBuffer(),
      );
      const document = await pdfjs.getDocument({ data }).promise;
      setPdf(document);
      setMessage("");
    })().catch(() => setMessage("The paper could not be loaded."));
  }, [assignment.id]);
  useEffect(() => {
    if (!pdf) return;
    (async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.45 });
      const base = paperCanvas.current!;
      const ink = inkCanvas.current!;
      base.width = ink.width = viewport.width;
      base.height = ink.height = viewport.height;
      await page.render({
        canvas: base,
        canvasContext: base.getContext("2d")!,
        viewport,
      }).promise;
      ink.getContext("2d")!.clearRect(0, 0, ink.width, ink.height);
      const saved = pages[pageNumber];
      if (saved) {
        const image = new Image();
        image.onload = () => ink.getContext("2d")!.drawImage(image, 0, 0);
        image.src = saved;
      }
    })();
  }, [pdf, pageNumber, pages]);
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = inkCanvas.current!;
    canvas.setPointerCapture(e.pointerId);
    stroke.current = beginStroke(canvas, e.nativeEvent, (ctx) => {
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = tool === "shade" ? "rgba(255,193,7,.35)" : "#342f4d";
      ctx.lineWidth = tool === "shade" ? 28 : tool === "eraser" ? 24 : 3;
    });
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    stroke.current?.add(e.nativeEvent);
  };
  const stop = () => {
    if (!stroke.current) return;
    stroke.current.end();
    stroke.current = null;
    setPages({
      ...pages,
      [pageNumber]: inkCanvas.current!.toDataURL("image/png"),
    });
  };
  const clearPage = () => {
    const canvas = inkCanvas.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    const next = { ...pages };
    delete next[pageNumber];
    setPages(next);
  };
  async function submitPaper() {
    if (!confirmed || submitting) return;
    setSubmitting(true);
    setMessage("Submitting annotated paper…");
    const form = new FormData();
    form.set(
      "answers",
      JSON.stringify(
        Object.entries(pages).map(([page, drawing]) => ({
          question: `Page ${page}`,
          drawing,
        })),
      ),
    );
    const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    if (response.ok) await onSubmitted(String(result.status || "awaiting_review"));
    setMessage(
      response.ok
        ? "Your annotated paper was submitted to your teacher."
        : result.error || "Submission failed.",
    );
    if (response.ok) setReviewing(false);
    setSubmitting(false);
  }
  return (
    <section className="paper-annotator">
      <div className="annotator-toolbar">
        <div>
          <button
            className={tool === "pen" ? "active" : ""}
            onClick={() => setTool("pen")}
          >
            ✎ Pen
          </button>
          <button
            className={tool === "shade" ? "active" : ""}
            onClick={() => setTool("shade")}
          >
            ▨ Shade
          </button>
          <button
            className={tool === "eraser" ? "active" : ""}
            onClick={() => setTool("eraser")}
          >
            ⌫ Eraser
          </button>
          <button onClick={clearPage}>Clear page</button>
        </div>
        <div>
          <button
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            ←
          </button>
          <b>
            Page {pageNumber} of {pdf?.numPages || "…"}
          </b>
          <button
            disabled={!pdf || pageNumber === pdf.numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            →
          </button>
        </div>
        <button
          className="primary annotator-submit"
          disabled={!Object.keys(pages).length}
          onClick={() => {
            setConfirmed(false);
            setReviewing(true);
          }}
        >
          Review &amp; submit →
        </button>
      </div>
      <div className="annotated-page">
        <canvas ref={paperCanvas} />
        <canvas
          ref={inkCanvas}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
        />
      </div>
      <footer>
        <p>
          {message ||
            `${Object.keys(pages).length} page${Object.keys(pages).length === 1 ? "" : "s"} annotated`}
        </p>
        <button
          className="primary"
          disabled={!Object.keys(pages).length}
          onClick={() => {
            setConfirmed(false);
            setReviewing(true);
          }}
        >
          Review & submit →
        </button>
      </footer>
      {reviewing && (
        <ModalScrim
          className="submission-review-modal"
          onDismiss={() => !submitting && setReviewing(false)}
        >
          <section className="submission-review-shell paper-submission-review">
            <header>
              <div>
                <small>FINAL CHECK</small>
                <h2>Review annotated pages</h2>
                <p>{assignment.title}</p>
              </div>
              <button className="x" onClick={() => setReviewing(false)}>×</button>
            </header>
            <div className="submission-review-summary">
              <article className="complete">
                <small>ANNOTATED PAGES</small>
                <b>{Object.keys(pages).length}</b>
              </article>
              <article>
                <small>TOTAL PAGES</small>
                <b>{pdf?.numPages || "—"}</b>
              </article>
            </div>
            <div className="unanswered-warning">
              <b>Check every required page</b>
              <p>
                Only pages containing pen, shading or eraser changes will be
                submitted to your teacher.
              </p>
            </div>
            <div className="submission-question-checklist paper-pages-checklist">
              {Array.from({ length: pdf?.numPages || 0 }, (_, index) => {
                const page = index + 1;
                const annotated = Boolean(pages[page]);
                return (
                  <button
                    type="button"
                    key={page}
                    className={annotated ? "answered" : "unanswered"}
                    onClick={() => {
                      setPageNumber(page);
                      setReviewing(false);
                    }}
                  >
                    <span>{annotated ? "✓" : "—"}</span>
                    <b>Page {page}</b>
                    <small>{annotated ? "Annotated" : "No changes"}</small>
                  </button>
                );
              })}
            </div>
            <footer>
              <label>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                <span>I have checked the pages I want to submit.</span>
              </label>
              <div>
                <button type="button" onClick={() => setReviewing(false)}>
                  Continue working
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={!confirmed || submitting}
                  onClick={submitPaper}
                >
                  {submitting ? "Submitting…" : "Confirm & submit →"}
                </button>
              </div>
            </footer>
          </section>
        </ModalScrim>
      )}
    </section>
  );
}
