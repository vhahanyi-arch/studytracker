"use client";
import { useEffect, useState } from "react";

// A Stage 8/9 library paper set for the class to sit whole: the teacher's
// controls on its library card, and who has sat it. The rules live in
// app/api/lower-secondary/full-papers and lib/paper-access.ts.

export type FullPaperAttempt = {
  id: string;
  attempt: number;
  practice: boolean;
  status: string;
  total_final: number | null;
  submitted_at: string;
  student_id: string;
  student_name: string;
};

export type FullPaperInfo = {
  id: string;
  full_paper_set_at: string | null;
  due_date: string | null;
  maximum: number;
  attempts: FullPaperAttempt[];
};

// A DATE column arrives as "2026-10-10", or as a timestamp when serialised
// from a Date; either way the day is the first ten characters.
export const dayOf = (value: string | null | undefined) => (value ? String(value).slice(0, 10) : "");
export const dueLabel = (value: string | null | undefined) =>
  value ? new Date(`${dayOf(value)}T00:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function FullPaperControls({
  stage,
  approved,
  info,
  changed,
}: {
  stage: 8 | 9;
  approved: boolean;
  info: FullPaperInfo | undefined;
  changed: (next: { full_paper_set_at: string | null; due_date: string | null }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState(dayOf(info?.due_date));
  const [showAttempts, setShowAttempts] = useState(false);
  // The list loads after the card, and a save may change the date.
  useEffect(() => setDueDate(dayOf(info?.due_date)), [info?.due_date]);
  const isSet = Boolean(info?.full_paper_set_at);
  const attempts = info?.attempts ?? [];
  const toMark = attempts.filter((attempt) => attempt.status !== "published").length;
  const sitters = new Set(attempts.map((attempt) => attempt.student_id)).size;

  async function save(set: boolean, due: string) {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/lower-secondary/full-papers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: info?.id, set, dueDate: due || null }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setBusy(false);
    if (!response?.ok) {
      setMessage(result?.error || "The paper could not be updated. Check your connection and try again.");
      return;
    }
    setDueDate(dayOf(result.due_date));
    changed({ full_paper_set_at: result.full_paper_set_at, due_date: result.due_date });
    setMessage(set ? `The Stage ${stage} class can now sit this paper.` : "Students no longer see this paper. Their attempts are kept.");
  }

  if (!approved)
    return <div className="full-paper-row"><p>Approve its questions to set it as a full paper.</p></div>;
  return (
    <div className={"full-paper-row" + (isSet ? " is-set" : "")}>
      <div className="full-paper-state">
        <b>{isSet ? `Set for the Stage ${stage} class` : "Full paper"}</b>
        <span>
          {isSet
            ? [info?.due_date ? `Due ${dueLabel(info.due_date)}` : "No due date", plural(attempts.length, "attempt", "attempts") + (attempts.length ? ` by ${plural(sitters, "student", "students")}` : ""), toMark ? `${toMark} to mark` : ""].filter(Boolean).join(" · ")
            : "Let students sit the whole paper, in practice or for you to mark."}
        </span>
      </div>
      <div className="full-paper-tools">
        <label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        {!!attempts.length && <button onClick={() => setShowAttempts((value) => !value)}>{showAttempts ? "Hide attempts" : "Attempts"}</button>}
        {isSet ? (
          <>
            {dueDate !== dayOf(info?.due_date) && <button disabled={busy} onClick={() => save(true, dueDate)}>Save date</button>}
            <button disabled={busy} onClick={() => save(false, "")}>Stop setting</button>
          </>
        ) : (
          <button className="primary" disabled={busy || !info} onClick={() => save(true, dueDate)}>{busy ? "Setting…" : "Set as full paper"}</button>
        )}
      </div>
      {message && <p className="full-paper-message" role="status">{message}</p>}
      {showAttempts && (
        <table className="full-paper-attempts">
          <thead><tr><th>Student</th><th>Attempt</th><th>Sat as</th><th>Result</th></tr></thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt.id}>
                <td>{attempt.student_name}</td>
                <td>{attempt.attempt}</td>
                <td>{attempt.practice ? "Practice" : "For you"}</td>
                <td>
                  {attempt.status === "published"
                    ? `${attempt.total_final ?? 0} / ${info?.maximum ?? 0}`
                    : "In your marking queue"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
