// The rules shared by generated practice in Lower Secondary maths and in
// physics: which difficulty a student is given next, how a submitted set is
// marked, and when a unit counts as mastered. Each subject brings its own
// answerMatches; the routes keep their own tables and queries.

// A set scoring at least this is "strong"; the SQL counts strong sets with the
// same threshold (score >= 80).
export const STRONG_SCORE = 80;
export const MASTERY_SETS = 2;

export type Difficulty = "foundational" | "application" | "reasoning";

export function nextDifficulty(strongSets: number): Difficulty {
  return strongSets === 0 ? "foundational" : strongSets === 1 ? "application" : "reasoning";
}

export const isMastered = (strongSets: unknown) => Number(strongSets) >= MASTERY_SETS;

type PracticeQuestion = {
  templateId?: string;
  objective?: string;
  difficulty?: string;
  prompt?: string;
  solution?: string;
};

export function markPracticeSet<Q extends PracticeQuestion>(
  questions: Q[],
  rawAnswers: unknown,
  acceptedFor: (question: Q) => string[],
  answerMatches: (answer: string | undefined, accepted: string[]) => boolean,
) {
  const answers = Array.isArray(rawAnswers) ? rawAnswers.map(String) : [];
  const results = questions.map((question, index) => {
    const accepted = acceptedFor(question);
    return {
      templateId: question.templateId,
      objective: question.objective,
      difficulty: question.difficulty,
      prompt: question.prompt, answer: answers[index] || "",
      correct: answerMatches(answers[index], accepted),
      expected: accepted.join(" or "), solution: question.solution,
    };
  });
  const score = Math.round(results.filter((result) => result.correct).length * 100 / questions.length);
  return { answers, results, score };
}

export function hintsUsed(rawHints: unknown) {
  return (Array.isArray(rawHints) ? rawHints.map(Boolean) : []).filter(Boolean).length;
}

// Session ids are UUIDs; anything else cannot name a session, and would make
// Postgres reject the query rather than find nothing.
export const isSessionId = (value: unknown) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value ?? ""));
