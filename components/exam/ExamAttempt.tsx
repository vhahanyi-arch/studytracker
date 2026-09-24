"use client";
import { useEffect, useMemo, useState } from "react";
import { ExamQuestionShot, type QuestionCrop } from "./ExamQuestionShot";
import { useExamDraft, type SaveState } from "./useExamDraft";
import type { ExamAnswerDraft, ExamDraft } from "@/lib/exam-drafts";

// A student working through a published exam paper. Everything they enter is
// kept as a draft (see useExamDraft), so nothing is lost to a refresh.

type Question = { id: string; text: string; context: string; marks: number; topic: string; sourcePages: number[]; references: string[] };
type Scheme = { questionId: string; kind: string; points: Array<{ id: string; description: string; marks: number; kind: string }> };
export type AttemptPaper = {
  id: string; title: string; syllabus: string; revision?: number; kind?: string;
  files: Array<{ role: string; file: { id: string; name: string } }>;
  crops?: Record<string, QuestionCrop[]>;
  questions: Question[]; schemes: Scheme[];
};
type Check = ExamDraft["checks"][string];

const LETTERS = ["A", "B", "C", "D"];
const TIMERS = [45, 60, 75, 90, 120];
const blank = (): ExamAnswerDraft => ({ mode: "typed", text: "", steps: {}, file: null, working: "" });

function answered(a: ExamAnswerDraft | undefined, wholePaper: boolean) {
  if (!a) return wholePaper;
  if (a.mode === "handwritten") return !!a.file || wholePaper;
  return !!a.text.trim() || Object.values(a.steps).some((s) => s.trim());
}

function clock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return (h ? `${h}:${String(m).padStart(2, "0")}` : String(m)) + ":" + String(s).padStart(2, "0");
}

const SAVE_LABEL: Record<SaveState, string> = {
  loading: "Loading your answers…", saving: "Saving…", saved: "All answers saved",
  offline: "Saved on this device; will sync when back online",
};

async function readReply(response: Response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`The server sent an unexpected reply (HTTP ${response.status}). Your answers are saved; try again in a moment.`); }
}

export function ExamAttempt({ paper, userId, onBack, onSubmitted }: {
  paper: AttemptPaper; userId: string | null | undefined;
  onBack: () => void; onSubmitted: (submission: unknown) => void;
}) {
  const store = useExamDraft(userId, paper);
  const [draft, setDraft] = useState<ExamDraft | null>(null);
  const [choice, setChoice] = useState<{ practice: boolean; timer: number | null }>({ practice: true, timer: null });
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const questions = paper.questions;
  const multipleChoice = paper.kind === "multiple_choice";
  const totalMarks = questions.reduce((n, q) => n + q.marks, 0);

  useEffect(() => { if (store.ready && store.initial) setDraft(store.initial); }, [store.ready, store.initial]);

  const commit = (next: ExamDraft) => {
    const stamped = { ...next, savedAt: new Date().toISOString() };
    setDraft(stamped);
    store.save(stamped);
  };

  const onReview = !!draft && draft.index >= questions.length;
  const question = draft && !onReview ? questions[draft.index] : undefined;
  const scheme = question ? paper.schemes.find((s) => s.questionId === question.id) : undefined;
  const answer = (question && draft?.answers[question.id]) || blank();
  const check = question ? draft?.checks[question.id] : undefined;
  const wholePaper = !!draft?.wholePaperFiles.length;

  const update = (patch: Partial<ExamAnswerDraft>) => {
    if (!draft || !question || check) return;
    commit({ ...draft, answers: { ...draft.answers, [question.id]: { ...answer, ...patch } } });
  };
  const go = (index: number) => { if (draft) { setZoom(false); setError(""); commit({ ...draft, index }); } };
  const toggleFlag = () => {
    if (!draft || !question) return;
    const flags = draft.flags.includes(question.id) ? draft.flags.filter((f) => f !== question.id) : [...draft.flags, question.id];
    commit({ ...draft, flags });
  };

  // The exam timer, if one was chosen, ticks once a second.
  const deadline = draft?.timerMinutes && draft.startedAt ? Date.parse(draft.startedAt) + draft.timerMinutes * 60_000 : null;
  useEffect(() => {
    if (!deadline) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  // Keys: A-D choose an option, the arrows move between questions. Never
  // while the student is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!draft || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (zoom && e.key === "Escape") return setZoom(false);
      if (e.key === "ArrowRight" && draft.index < questions.length) go(draft.index + 1);
      else if (e.key === "ArrowLeft" && draft.index > 0) go(draft.index - 1);
      else if (multipleChoice && question && !check && /^[a-d]$/i.test(e.key)) update({ mode: "typed", text: e.key.toUpperCase() });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function attach(file: File) {
    setBusy(true);
    try {
      const form = new FormData();
      form.set("action", "attachment");
      form.set("file", file);
      const response = await fetch("/api/physics-exam", { method: "POST", body: form });
      const data = await readReply(response);
      if (!response.ok) throw new Error(data.error || "Could not upload this file.");
      return data.file as { id: string; name: string };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload this file.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  // Practice only: mark this one answer now. Once checked it is locked, and the
  // server records the check, so the paper can only be submitted as practice.
  async function checkThis() {
    if (!draft || !question) return;
    setChecking(true);
    setError("");
    try {
      const response = await fetch("/api/physics-exam", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "check", paperId: paper.id, questionId: question.id, text: answer.text, steps: answer.steps }),
      });
      const data = await readReply(response);
      if (!response.ok) throw new Error(data.error || "This answer could not be checked.");
      const g = data.grade;
      commit({ ...draft, checks: { ...draft.checks, [question.id]: { proposed: g.proposed, status: g.status, reason: g.reason, expected: g.expected, marks: g.marks } } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "This answer could not be checked.");
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/physics-exam", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // The server records the student's own account name.
          action: "submit", paperId: paper.id, name: "Student", selfPractice: !!draft.practice,
          wholePaperFiles: draft.wholePaperFiles.map((f) => f.id),
          answers: questions.map((q) => {
            const a = draft.answers[q.id] || blank();
            const mode = wholePaper ? "handwritten" : a.mode;
            return { questionId: q.id, mode, text: a.text, steps: a.steps, fileId: a.file?.id ?? null, working: a.working || undefined };
          }),
        }),
      });
      const data = await readReply(response);
      if (!response.ok) throw new Error(data.error || "Could not submit this paper.");
      store.clear();
      onSubmitted(data.submission);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit this paper.");
    } finally {
      setBusy(false);
    }
  }

  const unanswered = useMemo(() => questions.filter((q) => !answered(draft?.answers[q.id], wholePaper)), [questions, draft, wholePaper]);

  const heading = (
    <div className="portal-heading">
      <div>
        <p>Physics exam papers · {paper.syllabus}{multipleChoice ? " · multiple choice" : ""}</p>
        <h1>{paper.title}</h1>
        <h2>{questions.length} questions · {totalMarks} marks</h2>
      </div>
      <button onClick={onBack}>← Paper library</button>
    </div>
  );

  if (!store.ready) return <>{heading}<p className="reference">{SAVE_LABEL.loading}</p></>;

  // First visit: how to take the paper.
  if (!draft) {
    return (
      <>
        {heading}
        <section className="panel attempt-start">
          <h3>How do you want to take this paper?</h3>
          <div className="mode-cards" role="radiogroup">
            <button type="button" role="radio" aria-checked={choice.practice} className={"mode-card" + (choice.practice ? " selected" : "")} onClick={() => setChoice({ ...choice, practice: true })}>
              <b>Practice</b>
              <span>Check any answer as you go and see how it is marked. Your marks count straight away.</span>
            </button>
            <button type="button" role="radio" aria-checked={!choice.practice} className={"mode-card" + (!choice.practice ? " selected" : "")} onClick={() => setChoice({ ...choice, practice: false })}>
              <b>For my teacher</b>
              <span>Answer everything first. Your teacher confirms the marks.</span>
            </button>
          </div>
          <label className="pe-field attempt-timer">Timer
            <select value={choice.timer ?? ""} onChange={(e) => setChoice({ ...choice, timer: e.target.value ? Number(e.target.value) : null })}>
              <option value="">No timer</option>
              {TIMERS.map((m) => <option key={m} value={m}>{m} minutes, like the exam</option>)}
            </select>
          </label>
          <p className="reference">Your answers are saved as you type, so you can stop and come back on any device.</p>
          <button className="primary" onClick={() => commit({
            savedAt: "", revision: paper.revision ?? 0, index: 0, answers: {}, flags: [], wholePaperFiles: [], checks: {},
            practice: choice.practice, startedAt: new Date().toISOString(), timerMinutes: choice.timer,
          })}>Start the paper →</button>
        </section>
      </>
    );
  }

  const remaining = deadline ? deadline - now : null;
  const strip = (
    <nav className="q-strip" aria-label="Questions">
      {questions.map((q, i) => {
        const c = draft.checks[q.id];
        const state = [
          i === draft.index ? "current" : "",
          answered(draft.answers[q.id], wholePaper) ? "answered" : "",
          draft.flags.includes(q.id) ? "flagged" : "",
          c ? (c.proposed === null ? "review" : c.proposed === q.marks ? "right" : "wrong") : "",
        ].filter(Boolean).join(" ");
        return (
          <button key={q.id} className={"q-chip " + state} aria-current={i === draft.index ? "step" : undefined}
            aria-label={`Question ${q.id}${draft.flags.includes(q.id) ? ", flagged" : ""}${answered(draft.answers[q.id], wholePaper) ? ", answered" : ""}`}
            onClick={() => go(i)}>
            {q.id}
          </button>
        );
      })}
      <button className={"q-chip finish" + (onReview ? " current" : "")} onClick={() => go(questions.length)}>Finish</button>
    </nav>
  );

  const status = (
    <div className="attempt-status">
      <span className={"save-state " + store.state}>{SAVE_LABEL[store.state]}</span>
      <span>{draft.practice ? "Practice" : "For my teacher"}</span>
      {remaining !== null && (
        <span className={"attempt-clock" + (remaining <= 0 ? " over" : remaining < 5 * 60_000 ? " low" : "")} role="timer">
          {remaining > 0 ? `${clock(remaining)} left` : "Time is up"}
        </span>
      )}
    </div>
  );

  if (onReview) {
    const flagged = questions.filter((q) => draft.flags.includes(q.id));
    return (
      <>
        {heading}
        {status}
        {strip}
        {error && <p className="error-text">{error}</p>}
        <section className="panel attempt-card">
          <h3>Check before you submit</h3>
          <p>{questions.length - unanswered.length} of {questions.length} questions answered.</p>
          {unanswered.length > 0 && (
            <div className="review-list">
              <b>Not answered</b>
              <div>{unanswered.map((q) => <button key={q.id} onClick={() => go(questions.indexOf(q))}>{q.id}</button>)}</div>
            </div>
          )}
          {flagged.length > 0 && (
            <div className="review-list">
              <b>Flagged to come back to</b>
              <div>{flagged.map((q) => <button key={q.id} onClick={() => go(questions.indexOf(q))}>{q.id}</button>)}</div>
            </div>
          )}
          {!multipleChoice && (
            <details className="whole-paper">
              <summary>Answered on paper instead? Upload photos of your pages</summary>
              <p className="reference">Every question then goes to your teacher to mark from the photos.</p>
              <label className="file-drop">↑ Add a page
                <input type="file" disabled={busy} accept="application/pdf,image/png,image/jpeg" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  const uploaded = await attach(f);
                  if (uploaded) commit({ ...draft, wholePaperFiles: [...draft.wholePaperFiles, uploaded] });
                }} />
              </label>
              {wholePaper && <ul>{draft.wholePaperFiles.map((f, i) => <li key={f.id}>Page {i + 1}: {f.name}</li>)}</ul>}
            </details>
          )}
          <p className="reference">
            {draft.practice || Object.keys(draft.checks).length
              ? "Practice: your marks count as soon as you submit. Anything that needs a teacher's judgement still goes to your teacher."
              : "Your teacher confirms the marks after you submit."}
          </p>
          <div className="attempt-nav">
            <button onClick={() => go(questions.length - 1)}>← Back to the questions</button>
            <button disabled={busy} className="primary" onClick={submit}>{busy ? "Submitting…" : "Submit paper"}</button>
          </div>
        </section>
      </>
    );
  }

  if (!question) return null;
  const numeric = scheme?.kind === "numeric";
  const stepped = scheme?.kind === "stepped" && (scheme.points.length > 0);
  const flaggedNow = draft.flags.includes(question.id);
  const canCheck = !!draft.practice && !check && answer.mode === "typed" && answered(answer, false);

  return (
    <>
      {heading}
      {status}
      {strip}
      {error && <p className="error-text">{error}</p>}
      {remaining !== null && remaining <= 0 && <p className="error-text">Time is up. Finish the answer you are on, then submit.</p>}
      <section className="panel attempt-card">
        <div className="attempt-card-head">
          <b>Question {question.id}</b>
          <span className="badge">{question.marks} mark{question.marks === 1 ? "" : "s"}</span>
          <button className={"flag" + (flaggedNow ? " on" : "")} aria-pressed={flaggedNow} onClick={toggleFlag}>
            {flaggedNow ? "⚑ Flagged" : "⚐ Flag for later"}
          </button>
        </div>

        <button type="button" className="shot-button" aria-label={`Enlarge question ${question.id}`} onClick={() => setZoom(true)}>
          <ExamQuestionShot paper={paper} question={question} />
          <span className="shot-hint">Tap to enlarge</span>
        </button>

        {multipleChoice ? (
          <div className="choice-answer" role="radiogroup" aria-label={`Your answer to question ${question.id}`}>
            {LETTERS.map((letter) => (
              <button key={letter} type="button" role="radio" aria-checked={answer.text === letter} disabled={!!check}
                className={answer.text === letter ? "primary" : ""}
                onClick={() => update({ mode: "typed", text: answer.text === letter ? "" : letter })}>
                {letter}
              </button>
            ))}
          </div>
        ) : answer.mode === "handwritten" ? (
          <div className="attempt-answer">
            <label className="file-drop">↑ Photo or scan of your answer
              <input type="file" disabled={busy || !!check} accept="application/pdf,image/png,image/jpeg" onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const uploaded = await attach(f);
                if (uploaded) update({ file: uploaded });
              }} />
            </label>
            {answer.file && <a href={"/api/physics-exam/files/" + answer.file.id} target="_blank" rel="noreferrer">{answer.file.name} ↗</a>}
            <p className="reference">Your teacher marks answers written on paper.</p>
            <button className="linkish" onClick={() => update({ mode: "typed" })}>Type the answer instead</button>
          </div>
        ) : (
          <div className="attempt-answer">
            {stepped ? (
              scheme!.points.map((p, i) => (
                <label key={p.id} className="pe-field">Step {i + 1}: {p.description} <small>· {p.marks} mark{p.marks === 1 ? "" : "s"}</small>
                  {p.kind === "numeric"
                    ? <input disabled={!!check} value={answer.steps[p.id] || ""} onChange={(e) => update({ steps: { ...answer.steps, [p.id]: e.target.value } })} placeholder="Value with its unit" />
                    : <textarea disabled={!!check} value={answer.steps[p.id] || ""} onChange={(e) => update({ steps: { ...answer.steps, [p.id]: e.target.value } })} />}
                </label>
              ))
            ) : numeric ? (
              <>
                <label className="pe-field final-answer">Final answer, with its unit
                  <input disabled={!!check} value={answer.text} onChange={(e) => update({ text: e.target.value })} placeholder="e.g. 1.5 m/s²" />
                </label>
                <details open={!!answer.working}>
                  <summary>Show your working (optional)</summary>
                  <textarea disabled={!!check} value={answer.working || ""} onChange={(e) => update({ working: e.target.value })}
                    placeholder="Formula, substitution and steps. Your teacher can see this; only the final answer is marked automatically." />
                </details>
              </>
            ) : (
              <label className="pe-field">Your answer
                <textarea disabled={!!check} value={answer.text} onChange={(e) => update({ text: e.target.value })} />
              </label>
            )}
            {!check && <button className="linkish" onClick={() => update({ mode: "handwritten" })}>Answer on paper and upload a photo instead</button>}
          </div>
        )}

        {canCheck && (
          <button className="check-button" disabled={checking} onClick={checkThis}>
            {checking ? "Checking…" : "Check this answer"}
          </button>
        )}
        {check && <CheckResult check={check} />}

        <div className="attempt-nav">
          <button disabled={draft.index === 0} onClick={() => go(draft.index - 1)}>← Previous</button>
          <span>{draft.index + 1} of {questions.length}</span>
          {draft.index === questions.length - 1
            ? <button className="primary" onClick={() => go(questions.length)}>Finish →</button>
            : <button className="primary" onClick={() => go(draft.index + 1)}>Next →</button>}
        </div>
      </section>

      {zoom && (
        <div className="shot-zoom" role="dialog" aria-modal="true" aria-label={`Question ${question.id}, enlarged`} onClick={() => setZoom(false)}>
          <button className="shot-zoom-close" onClick={() => setZoom(false)}>Close ✕</button>
          <div onClick={(e) => e.stopPropagation()}>
            <ExamQuestionShot paper={paper} question={question} />
          </div>
        </div>
      )}
    </>
  );
}

function CheckResult({ check }: { check: Check }) {
  const verdict = check.proposed === null ? "review" : check.proposed === check.marks ? "right" : check.proposed > 0 ? "part" : "wrong";
  const title = { right: "Correct", part: "Partly correct", wrong: "Not quite", review: "Your teacher will mark this one" }[verdict];
  return (
    <div className={"check-result " + verdict} role="status">
      <b>{title}{check.proposed !== null ? ` · ${check.proposed} / ${check.marks}` : ""}</b>
      {verdict !== "right" && check.expected && <p>Expected answer: {check.expected}</p>}
      {verdict === "review" && <p>{check.reason}</p>}
    </div>
  );
}
