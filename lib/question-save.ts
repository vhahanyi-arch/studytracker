// Saving a paper's question setup. Kept free of the database so the rules can
// be tested; app/api/assignments/[id]/questions applies the plan.
//
// Marks point at question rows (submission_marks.question_id, deleted with the
// question). Saving used to replace every row with a new id, which deleted
// every mark on the paper, published ones included. Rows are now updated in
// place by position, keeping their ids. Once any student has submitted, the
// questions they answered must stay the same questions: the teacher may change
// marks, accepted answers and guidance, but not add, remove or relabel them.
import { questionKey } from "./paper-questions";

// The request body is unvalidated JSON, so each field is narrowed on the way
// in. oneOf keeps a value only when it is one of the accepted literals.
const oneOf = <T extends string, F>(value: unknown, allowed: readonly T[], fallback: F): T | F =>
  allowed.includes(value as T) ? (value as T) : fallback;

export function cleanQuestion(question: Record<string, unknown>, index: number) {
  return {
    position: index + 1,
    label: String(question.label || index + 1)
      .trim()
      .slice(0, 30),
    marks: Math.max(0, Math.min(100, Number(question.marks) || 0)) || null,
    page: Math.max(1, Math.round(Number(question.page_number) || 1)),
    x: Math.max(0, Math.min(1, Number(question.crop_x) || 0)),
    y: Math.max(0, Math.min(1, Number(question.crop_y) || 0)),
    width: Math.max(0.05, Math.min(1, Number(question.crop_width) || 1)),
    height: Math.max(0.05, Math.min(1, Number(question.crop_height) || 1)),
    responseType: oneOf(question.response_type, ["drawing", "multiple_choice"] as const, "typed"),
    answerSlots: Math.max(1, Math.min(6, Number(question.answer_slots) || 1)),
    responseLayout: oneOf(question.response_layout, ["answer", "working", "formula"] as const, "answer"),
    expectedAnswer:
      String(question.expected_answer || "")
        .trim()
        .slice(0, 500) || null,
    markSchemeNotes:
      String(question.mark_scheme_notes || "")
        .trim()
        .slice(0, 2000) || null,
    topic: String(question.topic || "General skills").trim().slice(0, 80),
    draftAnswer: String(question.draft_answer || "").trim().slice(0, 4000) || null,
    draftAcceptedAnswer: String(question.draft_accepted_answer || "").trim().slice(0, 500) || null,
    draftConfidence: oneOf(question.draft_confidence, ["high", "medium", "review"] as const, null),
    extractedQuestionText: String(question.extracted_question_text || "").trim().slice(0, 6000) || null,
  };
}

export type CleanQuestion = ReturnType<typeof cleanQuestion>;
export type SavedQuestion = { id: string; position: number; label: string };

export const LOCKED_QUESTIONS_ERROR =
  "Students have already submitted this paper, so questions cannot be added, removed or relabelled. You can still change marks, accepted answers and guidance.";

export type QuestionSavePlan =
  | { ok: false; status: number; error: string }
  | { ok: true; rows: Array<CleanQuestion & { id: string }>; removed: string[] };

// existing: the paper's saved rows. submitted: whether any submission exists.
export function planQuestionSave(
  existing: SavedQuestion[],
  incoming: CleanQuestion[],
  submitted: boolean,
  newId: () => string = () => crypto.randomUUID(),
): QuestionSavePlan {
  const saved = [...existing].sort((a, b) => a.position - b.position);
  if (submitted) {
    const same =
      saved.length === incoming.length &&
      saved.every((row, index) => questionKey(row.label) === questionKey(incoming[index].label));
    if (!same) return { ok: false, status: 409, error: LOCKED_QUESTIONS_ERROR };
  }
  return {
    ok: true,
    rows: incoming.map((question, index) => ({ ...question, id: saved[index]?.id ?? newId() })),
    removed: saved.slice(incoming.length).map((row) => row.id),
  };
}
