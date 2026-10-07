"use client";
import { useEffect, useState } from "react";
import type { PaperSitting } from "@/lib/answer-drafts";
import { SITTING_TIMERS } from "@/lib/sitting-timers";
import { dueLabel } from "./FullPaperTeacher";

// Stage 8/9 full past papers, as the student sees them: the papers their
// teacher has set, a start screen (practice or for the teacher, with an
// optional timer), the clock while answering, and each finished attempt.
// The answering itself is the ordinary AnswerWorkspace in app/page.tsx.

export type FullPaperAttempt = {
  id: string;
  attempt: number;
  practice: boolean;
  status: string;
  total_final: number | null;
  submitted_at: string;
};

export type FullPaperSummary = {
  id: string;
  title: string;
  stage: number;
  source_year: string | null;
  due_date: string | null;
  paper_mode: "structured" | "multiple_choice";
  questions: number;
  maximum: number;
  in_progress: boolean;
  sitting: PaperSitting | null;
  attempts: FullPaperAttempt[];
};

type AttemptDetail = {
  id: string;
  title: string;
  attempt: number;
  practice: boolean;
  total: number;
  maximum: number;
  feedback: string | null;
  timer_minutes: number | null;
  questions: Array<{ label: string; marks: number; mark: number | null; automatic: boolean; feedback: string | null; answer: string; accepted?: string | null }>;
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
const percent = (total: number | null, maximum: number) => (maximum ? Math.round(((total ?? 0) / maximum) * 100) : 0);

// Counts down while a timer was chosen. It never submits: running out of time
// is the student's to notice, as it would be in the exam room.
export function SittingClock({ sitting }: { sitting: PaperSitting }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!sitting.timerMinutes) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [sitting.timerMinutes]);
  const mode = sitting.practice ? "Practice" : "For your teacher";
  if (!sitting.timerMinutes) return <span className="sitting-clock">{mode}</span>;
  const remaining = Date.parse(sitting.startedAt) + sitting.timerMinutes * 60_000 - now;
  const seconds = Math.max(0, Math.floor(remaining / 1000));
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <span className={"sitting-clock" + (remaining <= 0 ? " over" : remaining < 5 * 60_000 ? " low" : "")} role="timer" aria-live="off">
      {mode} · {remaining <= 0 ? "Time is up" : `${clock} left`}
    </span>
  );
}

export function FullPaperList({
  stage,
  open,
  showAttempt,
}: {
  stage: 8 | 9;
  open: (paper: FullPaperSummary, sitting: PaperSitting | undefined) => void;
  showAttempt: (attemptId: string) => void;
}) {
  const [papers, setPapers] = useState<FullPaperSummary[] | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState<string | null>(null);
  const [practice, setPractice] = useState(true);
  const [timer, setTimer] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    setPapers(null);
    fetch(`/api/lower-secondary/full-papers?stage=${stage}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((result) => !cancelled && setPapers(Array.isArray(result?.papers) ? result.papers : []))
      .catch(() => !cancelled && setError("Your past papers could not be loaded. Check your connection and refresh."));
    return () => {
      cancelled = true;
    };
  }, [stage]);

  if (error) return <section className="panel full-papers"><p className="queue-message">{error}</p></section>;
  if (!papers?.length) return null;
  return (
    <section className="panel full-papers" aria-labelledby="full-papers-title">
      <header>
        <div>
          <h3 id="full-papers-title">Sit a whole Stage {stage} past paper</h3>
          <p>Practise on your own and see the answers straight away, or sit it for your teacher to mark. You can sit a paper again.</p>
        </div>
      </header>
      <div className="full-paper-list">
        {papers.map((paper) => {
          const last = paper.attempts[paper.attempts.length - 1];
          const waiting = last && last.status !== "published";
          const finished = paper.attempts.filter((attempt) => attempt.status === "published");
          const best = finished.length ? Math.max(...finished.map((attempt) => percent(attempt.total_final, paper.maximum))) : null;
          const resuming = paper.in_progress && paper.sitting;
          return (
            <article key={paper.id}>
              <div className="full-paper-head">
                <b>{paper.title}</b>
                <small>
                  {[paper.source_year, plural(paper.questions, "question", "questions"), plural(paper.maximum, "mark", "marks"), paper.due_date ? `Due ${dueLabel(paper.due_date)}` : ""].filter(Boolean).join(" · ")}
                </small>
                <span className="full-paper-standing">
                  {waiting
                    ? `Attempt ${last.attempt} is with your teacher`
                    : finished.length
                      ? `${plural(finished.length, "attempt", "attempts")} · best ${best}%`
                      : "Not sat yet"}
                </span>
              </div>
              <div className="full-paper-go">
                {resuming ? (
                  <button className="primary" onClick={() => open(paper, paper.sitting ?? undefined)}>Continue</button>
                ) : waiting ? null : (
                  <button className={starting === paper.id ? "" : "primary"} onClick={() => setStarting(starting === paper.id ? null : paper.id)}>
                    {starting === paper.id ? "Cancel" : finished.length ? "Sit again" : "Sit this paper"}
                  </button>
                )}
              </div>
              {starting === paper.id && !resuming && (
                <div className="full-paper-start">
                  <fieldset>
                    <legend>How are you sitting it?</legend>
                    <label className={practice ? "chosen" : ""}>
                      <input type="radio" name={`sitting-${paper.id}`} checked={practice} onChange={() => setPractice(true)} />
                      <span><b>Practice</b><small>Marked straight away, with the answers. Your teacher can see you sat it.</small></span>
                    </label>
                    <label className={!practice ? "chosen" : ""}>
                      <input type="radio" name={`sitting-${paper.id}`} checked={!practice} onChange={() => setPractice(false)} />
                      <span><b>For my teacher</b><small>Your teacher marks it and publishes your result.</small></span>
                    </label>
                  </fieldset>
                  <label className="full-paper-timer">
                    Timer
                    <select value={timer ?? ""} onChange={(event) => setTimer(event.target.value ? Number(event.target.value) : null)}>
                      <option value="">No timer</option>
                      {SITTING_TIMERS.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                    </select>
                  </label>
                  <button className="primary" onClick={() => open(paper, { practice, timerMinutes: timer, startedAt: new Date().toISOString() })}>Start</button>
                </div>
              )}
              {!!paper.attempts.length && (
                <ul className="full-paper-attempts-list">
                  {paper.attempts.map((attempt) => (
                    <li key={attempt.id}>
                      <span>Attempt {attempt.attempt} · {attempt.practice ? "Practice" : "For your teacher"}</span>
                      {attempt.status === "published" ? (
                        <button onClick={() => showAttempt(attempt.id)}>
                          {attempt.total_final ?? 0} / {paper.maximum} · See answers
                        </button>
                      ) : (
                        <em>Waiting for your teacher</em>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function FullPaperResult({ attemptId, back }: { attemptId: string; back: () => void }) {
  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/lower-secondary/full-papers?attempt=${encodeURIComponent(attemptId)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setDetail)
      .catch(() => setError("This attempt could not be loaded."));
  }, [attemptId]);
  const unmarked = detail?.questions.filter((question) => detail.practice && !question.automatic).length ?? 0;
  return (
    <section className="panel full-paper-result">
      <header>
        <button onClick={back}>Past papers</button>
        <div>
          <small>{detail ? `ATTEMPT ${detail.attempt} · ${detail.practice ? "PRACTICE" : "MARKED BY YOUR TEACHER"}` : "PAST PAPER"}</small>
          <h2>{detail?.title ?? "Loading…"}</h2>
        </div>
        {detail && <span className="full-paper-score">{detail.total} / {detail.maximum}<small>{percent(detail.total, detail.maximum)}%</small></span>}
      </header>
      {error && <p className="queue-message">{error}</p>}
      {detail?.feedback && <p className="full-paper-feedback"><b>Your teacher:</b> {detail.feedback}</p>}
      {unmarked > 0 && (
        <p className="sitting-note">
          {plural(unmarked, "question was", "questions were")} not marked automatically (a drawing, handwritten work, or no single answer to check) and scored nothing. Compare your work with the answer.
        </p>
      )}
      {detail && (
        <table className="full-paper-marks">
          <thead>
            <tr><th>Question</th><th>Your answer</th>{detail.practice && <th>Answer</th>}<th>Mark</th></tr>
          </thead>
          <tbody>
            {detail.questions.map((question) => (
              <tr key={question.label} className={question.mark === question.marks && question.marks > 0 ? "right" : detail.practice && !question.automatic ? "unmarked" : "wrong"}>
                <td>{question.label}</td>
                <td>{question.answer || <span className="muted">No typed answer</span>}{question.feedback && <small>{question.feedback}</small>}</td>
                {detail.practice && <td>{question.accepted ? question.accepted.split("|").map((answer) => answer.trim()).filter(Boolean).join(" or ") : <span className="muted">Ask your teacher</span>}</td>}
                <td>{detail.practice && !question.automatic ? "Not marked" : `${question.mark ?? 0} / ${question.marks}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
