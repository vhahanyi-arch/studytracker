// A student's unfinished attempt at an exam paper. Saved on the device as they
// type and mirrored to the server, so a refresh, a closed tab or a switch of
// computer does not lose work. Removed when the paper is submitted.
import { z } from "zod";

const Text = (max: number) => z.string().max(max);
export const ExamAnswerDraftSchema = z.object({
  mode: z.enum(["typed", "handwritten"]),
  text: Text(20000),
  steps: z.record(z.string(), Text(10000)),
  file: z.object({ id: z.string().max(100), name: Text(300) }).nullable(),
  formula: Text(2000).optional(),
  working: Text(10000).optional(),
});
export const ExamDraftSchema = z.object({
  savedAt: z.string().max(40),
  // The paper revision it was written against. A republished paper keeps the
  // answers whose question ids still exist and drops the rest.
  revision: z.number().int().min(0),
  index: z.number().int().min(0).max(250),
  answers: z.record(z.string(), ExamAnswerDraftSchema),
  flags: z.array(z.string().max(40)).max(250).default([]),
  wholePaperFiles: z.array(z.object({ id: z.string().max(100), name: Text(300) })).max(50).default([]),
  practice: z.boolean().optional(),
  // Results of questions checked while practising, so they survive a reload.
  // The server keeps its own list of checked questions; this is only display.
  checks: z.record(z.string(), z.object({
    proposed: z.number().nullable(), status: z.string().max(40), reason: Text(2000),
    expected: Text(5000), marks: z.number().int().min(0).max(100),
  })).default({}),
  startedAt: z.string().max(40).optional(),
  timerMinutes: z.number().int().min(1).max(600).nullable().optional(),
});
export type ExamAnswerDraft = z.infer<typeof ExamAnswerDraftSchema>;
export type ExamDraft = z.infer<typeof ExamDraftSchema>;

// Large enough for a whole paper of typed answers, small enough that a runaway
// client cannot fill the table.
export const MAX_DRAFT_BYTES = 400_000;

/** The newer of a device copy and a server copy; either may be missing. */
export function newerDraft(a: ExamDraft | null, b: ExamDraft | null): ExamDraft | null {
  if (!a || !b) return a ?? b;
  return Date.parse(b.savedAt) > Date.parse(a.savedAt) ? b : a;
}

/** Fits a draft to the paper as it is now: answers to removed questions go. */
export function fitDraft(draft: ExamDraft, questionIds: string[]): ExamDraft {
  const ids = new Set(questionIds);
  return {
    ...draft,
    index: Math.min(draft.index, Math.max(0, questionIds.length - 1)),
    answers: Object.fromEntries(Object.entries(draft.answers).filter(([id]) => ids.has(id))),
    flags: draft.flags.filter((id) => ids.has(id)),
    checks: Object.fromEntries(Object.entries(draft.checks).filter(([id]) => ids.has(id))),
  };
}

export const examDraftKey = (userId: string, paperId: string) => `physics-exam:${userId}:${paperId}`;
