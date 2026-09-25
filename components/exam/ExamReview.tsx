"use client";
import { useMemo, useState } from "react";
import { ExamQuestionShot, type QuestionCrop } from "./ExamQuestionShot";
import { ExamSchemeShot, type SchemeCrop } from "./ExamSchemeShot";
import { parseQuantity, roundingTolerance, reviewReason } from "@/lib/physics-marking-engine";
import { acceptedFromScheme } from "@/lib/accepted-answers";

// The teacher's check of an extracted paper before students see it: each
// question as printed beside what will be used to mark it. Replaces a raw
// JSON editor, which remains available under "Advanced" for rules this screen
// does not edit (numeric tolerances, stepped marking points).

type Point = { id: string; description: string; marks: number; kind: string; accepted: string[] };
type Scheme = {
  questionId: string; raw: string; expected: string; marks: number; kind: string;
  numeric: NumericRule | null; accepted: string[]; points: Point[]; notes: string[]; unresolvedRules: string[];
  finalAnswerAwardsAll?: boolean; sourcePages?: number[];
  [key: string]: unknown;
};
type NumericRule = { accepted: string[]; unitRequired: boolean; relativeTolerance: number; absoluteTolerance: number; range: number[] | null };
type Question = { id: string; text: string; context: string; marks: number; topic: string; sourcePages: number[]; references: string[]; issues: string[] };
export type ReviewPaper = {
  id: string; title: string; syllabus: string; revision: number; kind?: string;
  questions: Question[]; schemes: Scheme[]; warnings: string[];
  files: Array<{ role: string; file: { id: string; name: string } }>;
  crops?: Record<string, QuestionCrop[]>;
  // Read from the PDFs' text without AI (lib/structured-paper.ts): mark-scheme
  // screenshots, and a switch between automatic and teacher marking.
  reader?: string; schemeCrops?: Record<string, SchemeCrop[]>;
};
export type Extraction = { questions: Question[]; schemes: Scheme[]; warnings: string[]; syllabus: string };

const LETTERS = ["A", "B", "C", "D"];
const isChoice = (s: Scheme | undefined) => !!s && s.kind === "exact" && s.accepted.length <= 1 && (s.accepted.length === 0 || LETTERS.includes(s.accepted[0]));
const list = (value: string) => value.split(/[;\n]/).map((x) => x.trim()).filter(Boolean);
const readable = (value: string) => { try { parseQuantity(value); return true; } catch { return false; } };
// The final answers a teacher types for automatic marking, and what is wrong with them.
function answerProblem(s: Scheme, fromText: boolean) {
  if (fromText && s.kind === "exact" && !s.accepted.length) return "Add at least one accepted answer, or choose \"I mark this\".";
  if (s.kind !== "numeric") return "";
  const values = s.numeric?.accepted ?? [];
  if (!values.length) return "Type the final answer, with its unit, or choose \"I mark this\".";
  const bad = values.filter((v) => !readable(v));
  return bad.length ? `Not a value the marker can read: ${bad.join(", ")}. Write it like 0.87 s or 1.8 × 10^-2 J.` : "";
}
// The numeric rule for typed final answers: anything that rounds to them.
const ruleFor = (values: string[], range: number[] | null = null): NumericRule =>
  ({ accepted: values, unitRequired: false, relativeTolerance: 0, absoluteTolerance: range || !values.length ? 0 : roundingTolerance(values[0]), range });

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
  const fromText = paper.reader === "text";

  const current = (): Extraction => ({
    questions: questions.map((q) => ({ ...q, issues: checked.has(q.id) ? [] : q.issues })),
    schemes, warnings: paper.warnings, syllabus: paper.syllabus,
  });
  const toCheck = useMemo(() => questions.filter((q) => q.issues.length && !checked.has(q.id)), [questions, checked]);
  const openIssues = toCheck.length;
  const automatic = schemes.filter((s) => s.kind === "numeric" || (fromText && s.kind === "exact")).length;
  const unreadable = schemes.filter((s) => answerProblem(s, fromText)).length;
  // On a paper read without AI an "exact" part is a word answer, never an A–D key.
  const choiceKey = (s: Scheme | undefined) => multipleChoice || (!fromText && isChoice(s));
  const totalMarks = questions.reduce((n, q) => n + q.marks, 0);

  const setScheme = (id: string, patch: Partial<Scheme>) =>
    setSchemes((all) => all.map((s) => (s.questionId === id ? { ...s, ...patch } : s)));
  const setMarks = (id: string, marks: number) => {
    setQuestions((all) => all.map((q) => (q.id === id ? { ...q, marks } : q)));
    setScheme(id, { marks });
  };
  // How a part is marked: automatically from a final value, automatically when
  // the answer matches an accepted answer (words), or by the teacher.
  // Switching keeps what was set, so switching back restores it.
  const setMode = (s: Scheme, mode: "numeric" | "exact" | "manual") => setScheme(s.questionId,
    mode === "numeric" ? { kind: "numeric", finalAnswerAwardsAll: true, numeric: s.numeric ?? ruleFor([]) }
      : mode === "exact" ? { kind: "exact", finalAnswerAwardsAll: false, accepted: s.kind === "exact" ? s.accepted : acceptedFromScheme(s.expected) }
      : { kind: "manual", finalAnswerAwardsAll: false, numeric: s.numeric?.accepted.length ? s.numeric : null });
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
          {fromText && <p>Read from the PDFs, without AI · {automatic} marked automatically · {questions.length - automatic} you mark</p>}
        </div>
        <button onClick={onBack}>← Paper library</button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {paper.warnings.map((w, i) => <p className="reference" key={i}>{w}</p>)}
      {toCheck.length > 0 && (
        <nav className="panel exam-review-tocheck" aria-label="Parts to check">
          <b>Check these first:</b>
          {toCheck.map((q) => <a key={q.id} href={`#review-${q.id}`}>{q.id}</a>)}
        </nav>
      )}

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
              {fromText && s && (
                <>
                  <h4 className="exam-review-label">Mark scheme</h4>
                  <ExamSchemeShot paper={paper} questionId={q.id} pages={s.sourcePages ?? []} />
                </>
              )}
              {!s ? (
                <p className="error-text">No mark scheme was matched to this question.</p>
              ) : choiceKey(s) ? (
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
                  {fromText && (s.kind === "numeric" || s.kind === "exact" || s.kind === "manual") && (() => {
                    // Parts the marker always sends to the teacher (explain,
                    // describe; ecf or significant-figure notes) cannot be automatic.
                    const always = reviewReason(q as never, s as never);
                    return (
                      <fieldset className="exam-review-mode">
                        <legend>How this part is marked</legend>
                        {always ? <p className="reference">Always marked by you. {always}</p> : (
                          <>
                            <label className="check">
                              <input type="radio" name={`mode-${q.id}`} checked={s.kind === "numeric"} onChange={() => setMode(s, "numeric")} />
                              Automatically, a value with its unit: a correct final answer earns all {q.marks} mark{q.marks === 1 ? "" : "s"}{q.marks > 1 ? "; any other answer comes to you" : ""}
                            </label>
                            <label className="check">
                              <input type="radio" name={`mode-${q.id}`} checked={s.kind === "exact"} onChange={() => setMode(s, "exact")} />
                              Automatically, words: an answer that matches an accepted answer earns all {q.marks} mark{q.marks === 1 ? "" : "s"}; any other answer comes to you
                            </label>
                          </>
                        )}
                        <label className="check">
                          <input type="radio" name={`mode-${q.id}`} checked={s.kind === "manual"} onChange={() => setMode(s, "manual")} />
                          I mark this
                        </label>
                      </fieldset>
                    );
                  })()}
                  <label className="pe-field">Expected answer
                    <input value={s.expected} onChange={(e) => setScheme(q.id, { expected: e.target.value })} />
                  </label>
                  {s.kind === "exact" && (
                    <label className="pe-field">Accepted answers <small>one per line{fromText ? "; capitals and spacing are ignored, other wording is not" : ""}</small>
                      <textarea value={s.accepted.join("\n")} onChange={(e) => setScheme(q.id, { accepted: list(e.target.value) })} />
                    </label>
                  )}
                  {s.kind === "numeric" && s.numeric && (
                    <label className="pe-field">Accepted values, with units <small>one per line</small>
                      <textarea value={s.numeric.accepted.join("\n")} onChange={(e) => {
                        const values = list(e.target.value);
                        // Typed answers are accepted to their rounding; a range from the scheme stays as it is.
                        setScheme(q.id, { numeric: fromText ? ruleFor(values, s.numeric!.range) : { ...s.numeric!, accepted: values }, accepted: values });
                      }} />
                      {s.numeric.range && <small>Anything from {s.numeric.range[0]} to {s.numeric.range[1]} is accepted.</small>}
                    </label>
                  )}
                  {answerProblem(s, fromText) && <p className="error-text">{answerProblem(s, fromText)}</p>}
                  {fromText && s.points.length > 0 && (
                    <details>
                      <summary>Marking points as read ({s.points.length})</summary>
                      <ol className="exam-review-points">
                        {s.points.map((p) => <li key={p.id}>{p.description} <small>· {p.marks} mark{p.marks === 1 ? "" : "s"}</small></li>)}
                      </ol>
                    </details>
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
        {unreadable > 0 && !advanced && (
          <p className="error-text">{unreadable} automatic part{unreadable === 1 ? " needs" : "s need"} a final answer the marker can read.</p>
        )}
        <button disabled={busy || ((openIssues > 0 || unreadable > 0) && !advanced)} className="primary" onClick={publish}>
          {busy ? "Publishing…" : "I have checked the paper: publish for practice"}
        </button>
      </section>
    </>
  );
}
