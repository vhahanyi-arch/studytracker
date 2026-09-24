"use client";
import { useMemo, useState } from "react";
import { ExamQuestionShot, type QuestionCrop } from "./ExamQuestionShot";

// The teacher's check of an extracted paper before students see it: each
// question as printed beside what will be used to mark it. Replaces a raw
// JSON editor, which remains available under "Advanced" for rules this screen
// does not edit (numeric tolerances, stepped marking points).

type Point = { id: string; description: string; marks: number; kind: string; accepted: string[] };
type Scheme = {
  questionId: string; raw: string; expected: string; marks: number; kind: string;
  numeric: { accepted: string[] } | null; accepted: string[]; points: Point[]; notes: string[]; unresolvedRules: string[];
  [key: string]: unknown;
};
type Question = { id: string; text: string; context: string; marks: number; topic: string; sourcePages: number[]; references: string[]; issues: string[] };
export type ReviewPaper = {
  id: string; title: string; syllabus: string; revision: number; kind?: string;
  questions: Question[]; schemes: Scheme[]; warnings: string[];
  files: Array<{ role: string; file: { id: string; name: string } }>;
  crops?: Record<string, QuestionCrop[]>;
};
export type Extraction = { questions: Question[]; schemes: Scheme[]; warnings: string[]; syllabus: string };

const LETTERS = ["A", "B", "C", "D"];
const isChoice = (s: Scheme | undefined) => !!s && s.kind === "exact" && s.accepted.length <= 1 && (s.accepted.length === 0 || LETTERS.includes(s.accepted[0]));
const list = (value: string) => value.split(/[;\n]/).map((x) => x.trim()).filter(Boolean);

export function ExamReview({ paper, busy, error, onBack, onPublish }: {
  paper: ReviewPaper; busy: boolean; error: string;
  onBack: () => void; onPublish: (extraction: Extraction) => void;
}) {
  const [questions, setQuestions] = useState(paper.questions);
  const [schemes, setSchemes] = useState(paper.schemes);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [advanced, setAdvanced] = useState(false);
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const multipleChoice = paper.kind === "multiple_choice";

  const current = (): Extraction => ({
    questions: questions.map((q) => ({ ...q, issues: checked.has(q.id) ? [] : q.issues })),
    schemes, warnings: paper.warnings, syllabus: paper.syllabus,
  });
  const openIssues = useMemo(() => questions.filter((q) => q.issues.length && !checked.has(q.id)).length, [questions, checked]);
  const totalMarks = questions.reduce((n, q) => n + q.marks, 0);

  const setScheme = (id: string, patch: Partial<Scheme>) =>
    setSchemes((all) => all.map((s) => (s.questionId === id ? { ...s, ...patch } : s)));
  const setMarks = (id: string, marks: number) => {
    setQuestions((all) => all.map((q) => (q.id === id ? { ...q, marks } : q)));
    setScheme(id, { marks });
  };
  const toggleChecked = (id: string) => setChecked((all) => {
    const next = new Set(all);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  function publish() {
    if (!advanced) return onPublish(current());
    try { onPublish(JSON.parse(json)); setJsonError(""); }
    catch { setJsonError("The JSON is not valid. Fix it, or close Advanced to publish what is shown above."); }
  }

  return (
    <>
      <div className="portal-heading">
        <div>
          <p>Physics exam papers · {multipleChoice ? "multiple choice" : "structured"}</p>
          <h1>Check the extraction</h1>
          <h2>{paper.title} · {questions.length} questions · {totalMarks} marks. Compare each question with how it will be marked, then publish.</h2>
        </div>
        <button onClick={onBack}>← Paper library</button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {paper.warnings.map((w, i) => <p className="reference" key={i}>{w}</p>)}

      <div className="exam-review">
        {questions.map((q) => {
          const s = schemes.find((x) => x.questionId === q.id);
          return (
            <section className="panel exam-review-item" key={q.id} id={`review-${q.id}`}>
              <header>
                <h3>Question {q.id}</h3>
                <label className="exam-review-marks">Marks
                  <input type="number" min={1} max={40} value={q.marks} onChange={(e) => setMarks(q.id, Math.max(1, Number(e.target.value) || 1))} />
                </label>
              </header>
              <ExamQuestionShot paper={paper} question={q} />
              {!s ? (
                <p className="error-text">No mark scheme was matched to this question.</p>
              ) : multipleChoice || isChoice(s) ? (
                <div className="choice-key" role="radiogroup" aria-label={`Correct answer for question ${q.id}`}>
                  <span>Correct answer</span>
                  {LETTERS.map((letter) => (
                    <button key={letter} type="button" role="radio" aria-checked={s.accepted[0] === letter}
                      className={s.accepted[0] === letter ? "primary" : ""}
                      onClick={() => setScheme(q.id, { accepted: [letter], expected: letter, raw: s.raw || letter })}>
                      {letter}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="exam-review-scheme">
                  <label className="pe-field">Expected answer
                    <input value={s.expected} onChange={(e) => setScheme(q.id, { expected: e.target.value })} />
                  </label>
                  {s.kind === "exact" && (
                    <label className="pe-field">Accepted answers <small>one per line</small>
                      <textarea value={s.accepted.join("\n")} onChange={(e) => setScheme(q.id, { accepted: list(e.target.value) })} />
                    </label>
                  )}
                  {s.kind === "numeric" && s.numeric && (
                    <label className="pe-field">Accepted values, with units <small>one per line</small>
                      <textarea value={s.numeric.accepted.join("\n")} onChange={(e) => setScheme(q.id, { numeric: { ...s.numeric!, accepted: list(e.target.value) } })} />
                    </label>
                  )}
                  {s.kind === "stepped" && (
                    <ol className="exam-review-points">
                      {s.points.map((p) => <li key={p.id}>{p.description} <small>· {p.marks} mark{p.marks === 1 ? "" : "s"}</small></li>)}
                    </ol>
                  )}
                  <p className="reference">
                    {s.kind === "manual" ? "You mark this one: explanations, diagrams and open answers always come to you."
                      : s.kind === "stepped" ? "Marked point by point. Edit the points under Advanced if one is wrong."
                      : "Marked automatically when an answer matches; anything else comes to you."}
                  </p>
                  <details>
                    <summary>Mark scheme as read, and the question text</summary>
                    <pre className="exam-review-raw">{s.raw}</pre>
                    {q.context && <p>{q.context}</p>}
                    <p>{q.text}</p>
                  </details>
                </div>
              )}
              {q.issues.length > 0 && (
                <div className={"exam-review-issues" + (checked.has(q.id) ? " resolved" : "")}>
                  {q.issues.map((issue) => <p key={issue}>{issue}</p>)}
                  <label className="check">
                    <input type="checkbox" checked={checked.has(q.id)} onChange={() => toggleChecked(q.id)} />
                    I have checked this against the paper
                  </label>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="panel exam-review-publish">
        <details open={advanced} onToggle={(e) => {
          const open = (e.currentTarget as HTMLDetailsElement).open;
          setAdvanced(open);
          if (open) setJson(JSON.stringify(current(), null, 2));
        }}>
          <summary>Advanced: edit the full extraction as JSON</summary>
          <p className="reference">For rules this screen does not show, such as numeric tolerances or stepped marking points. While this is open, publishing uses the JSON below.</p>
          <textarea className="json" spellCheck={false} value={json} onChange={(e) => setJson(e.target.value)} />
          {jsonError && <p className="error-text">{jsonError}</p>}
        </details>
        {openIssues > 0 && !advanced && (
          <p className="error-text">{openIssues} question{openIssues === 1 ? " has" : "s have"} an issue to check before publishing.</p>
        )}
        <button disabled={busy || (openIssues > 0 && !advanced)} className="primary" onClick={publish}>
          {busy ? "Publishing…" : "I have checked the paper: publish for practice"}
        </button>
      </section>
    </>
  );
}
