"use client";
import { useEffect, useRef, useState } from "react";
import { stage8Units, igcsePhysicsUnits } from "@/lib/portal-content";

// A real practice question on the front page, from the same engines students
// practise with, marked by the same answer check. Nothing here is mocked: a
// visitor gets a fresh question each time and a real verdict.
//
// The engines are loaded after the page has painted -- they are most of a
// megabyte of templates, and the headline beside this card should not wait for
// them. A short, fixed list of units keeps the sample to questions that read
// well out of context (no constructions or data-collection tasks).

type Subject = "maths" | "physics";
type Sample = {
  unit: string;
  objective?: string;
  prompt: string;
  answers: string[];
  hint: string;
  solution: string;
  format?: string;
};
type Engines = {
  maths: typeof import("@/lib/lower-secondary-question-engine");
  physics: typeof import("@/lib/physics-question-engine");
};

const MATHS_UNITS = ["s8-u1", "s8-u7", "s8-u10", "s8-u12"];
const PHYSICS_UNITS = ["igcse-u2", "igcse-u3", "igcse-u6", "igcse-u7"];

// "7. Fractions" and "1.2 Motion" read as "Fractions" and "Motion" here.
const unitTitle = (title: string) => title.replace(/^[\d.–-]+\s*/, "");
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function draw(engines: Engines, subject: Subject): Sample {
  if (subject === "maths") {
    const id = pick(MATHS_UNITS);
    const q = pick(engines.maths.makeUnitQuestions(id, "foundational"));
    return {
      unit: `Stage 8 maths · ${unitTitle(stage8Units.find((u) => u.id === id)?.title ?? "")}`,
      objective: q.objective,
      prompt: q.prompt,
      answers: q.answers,
      hint: q.hint,
      solution: q.solution,
      format: engines.maths.answerFormatFor(q) || undefined,
    };
  }
  const id = pick(PHYSICS_UNITS);
  const q = pick(engines.physics.makePhysicsQuestions("igcse", id, "foundational"));
  return {
    unit: `IGCSE physics · ${unitTitle(igcsePhysicsUnits.find((u) => u.id === id)?.title ?? "")}`,
    objective: q.objective,
    prompt: q.prompt,
    answers: q.answers,
    hint: q.hint,
    solution: q.solution,
    format: engines.physics.answerFormatFor(q) || undefined,
  };
}

export function TryQuestion() {
  const engines = useRef<Engines | null>(null);
  const [failed, setFailed] = useState(false);
  const [subject, setSubject] = useState<Subject>("maths");
  const [sample, setSample] = useState<Sample | null>(null);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all([
      import("@/lib/lower-secondary-question-engine"),
      import("@/lib/physics-question-engine"),
    ])
      .then(([maths, physics]) => {
        if (!live) return;
        engines.current = { maths, physics };
        setSample(draw(engines.current, "maths"));
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  function next(nextSubject: Subject = subject) {
    if (!engines.current) return;
    setSubject(nextSubject);
    setSample(draw(engines.current, nextSubject));
    setAnswer("");
    setVerdict(null);
    setHint(false);
  }

  function check(event: React.FormEvent) {
    event.preventDefault();
    if (!sample || !engines.current || !answer.trim()) return;
    const engine = subject === "maths" ? engines.current.maths : engines.current.physics;
    setVerdict(engine.answerMatches(answer, sample.answers) ? "right" : "wrong");
  }

  return (
    <section className={`try-question ${subject}`} aria-labelledby="try-question-title">
      <header>
        <h2 id="try-question-title">Try a practice question</h2>
        <div className="try-subjects" role="group" aria-label="Subject">
          {(["maths", "physics"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={subject === s}
              disabled={!sample}
              onClick={() => s !== subject && next(s)}
            >
              {s === "maths" ? "Maths" : "Physics"}
            </button>
          ))}
        </div>
      </header>

      {failed ? (
        <p className="try-status">The sample question could not be loaded. Sign in to practise.</p>
      ) : !sample ? (
        // Holds the card's shape while the engines load, so nothing jumps.
        <div className="try-skeleton" aria-hidden="true">
          <i /><i /><i /><i />
        </div>
      ) : (
        <form onSubmit={check}>
          <p className="try-unit">{sample.unit}</p>
          <p className="try-prompt">{sample.prompt}</p>
          <label className="try-answer">
            Your answer
            <input
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (verdict) setVerdict(null);
              }}
              autoComplete="off"
              spellCheck={false}
              aria-describedby={sample.format ? "try-format" : undefined}
            />
          </label>
          {sample.format && <small id="try-format" className="try-format">{sample.format}</small>}

          <div className="try-feedback" aria-live="polite">
            {verdict === "right" && (
              <p className="right"><b>Correct.</b> {sample.solution}</p>
            )}
            {verdict === "wrong" && (
              <p className="wrong"><b>Not this time.</b> {sample.solution}</p>
            )}
            {!verdict && hint && <p className="hint"><b>Hint.</b> {sample.hint}</p>}
          </div>

          <footer>
            {verdict ? (
              <button type="button" className="try-primary" onClick={() => next()}>
                Another question
              </button>
            ) : (
              <button type="submit" className="try-primary" disabled={!answer.trim()}>
                Check answer
              </button>
            )}
            {!verdict && (
              <button type="button" className="try-quiet" onClick={() => setHint(true)} disabled={hint}>
                {hint ? "Hint shown" : "Show hint"}
              </button>
            )}
          </footer>
        </form>
      )}
    </section>
  );
}
