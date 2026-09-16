// physics-extraction-schema.ts
//
// Canonical data shapes for the physics paper upload / extraction / marking
// system, ported from the physics-exam-studio project. This is the single
// source of truth for these types — other files (extraction, marking,
// storage, UI) should import from here rather than declaring their own
// parallel copies, to avoid the two drifting out of sync.

import { z } from "zod";

export const NumericRuleSchema = z.object({
  accepted: z.array(z.string()).min(1),
  unitRequired: z.boolean(),
  relativeTolerance: z.number().min(0).max(1),
  absoluteTolerance: z.number().min(0),
  range: z.array(z.number()).length(2).nullable(),
});

export const PointSchema = z.object({
  id: z.string().min(1),
  description: z.string(),
  marks: z.number().int().positive(),
  kind: z.enum(["numeric", "exact", "manual"]),
  accepted: z.array(z.string()),
  numeric: NumericRuleSchema.nullable(),
  dependsOn: z.array(z.string()),
});

export const SchemeSchema = z.object({
  questionId: z.string(),
  raw: z.string(),
  expected: z.string(),
  marks: z.number().int().positive(),
  kind: z.enum(["numeric", "exact", "stepped", "manual"]),
  numeric: NumericRuleSchema.nullable(),
  accepted: z.array(z.string()),
  points: z.array(PointSchema),
  notes: z.array(z.string()),
  unresolvedRules: z.array(z.string()),
  finalAnswerAwardsAll: z.boolean(),
  sourcePages: z.array(z.number().int().positive()).min(1),
});

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  context: z.string(),
  marks: z.number().int().positive(),
  topic: z.string(),
  sourcePages: z.array(z.number().int().positive()).min(1),
  references: z.array(z.string()),
  issues: z.array(z.string()),
});

export const ExtractionSchema = z.object({
  questions: z.array(QuestionSchema),
  schemes: z.array(SchemeSchema),
  warnings: z.array(z.string()),
  syllabus: z.enum(["0625", "9702", "unknown"]),
});

export type NumericRule = z.infer<typeof NumericRuleSchema>;
export type MarkingPoint = z.infer<typeof PointSchema>;
export type Scheme = z.infer<typeof SchemeSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Extraction = z.infer<typeof ExtractionSchema>;

export type StoredFile = { id: string; name: string; mime: string; size: number };
export type Paper = {
  id: string; title: string; syllabus: string; status: "draft" | "ready";
  questions: Question[]; schemes: Scheme[]; warnings: string[];
  files: { role: "questions" | "scheme" | "combined"; file: StoredFile }[];
  createdAt: string; revision: number; demo?: boolean;
};
export type Answer = { questionId: string; mode: "typed" | "handwritten"; text: string; steps: Record<string, string>; file: StoredFile | null };
export type Grade = {
  questionId: string; proposed: number | null; final: number | null;
  status: "needs_review" | "proposed" | "self_practice" | "confirmed"; reason: string;
  points: { id: string; description: string; marks: number; hit: boolean | null }[];
  expected: string;
  history: { score: number; note: string; at: string }[];
};
export type Submission = {
  id: string; paperId: string; paperRevision: number; name: string; selfPractice: boolean;
  answers: Answer[]; grades: Grade[]; createdAt: string;
};
