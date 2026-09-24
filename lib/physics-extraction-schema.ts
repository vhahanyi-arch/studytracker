import { z } from 'zod';
export const NumericRuleSchema = z.object({
 accepted: z.array(z.string()).min(1), unitRequired: z.boolean(),
 relativeTolerance: z.number().min(0).max(1), absoluteTolerance: z.number().min(0),
 range: z.array(z.number()).length(2).nullable(),
});
export const PointSchema = z.object({
 id: z.string().min(1), description: z.string(), marks: z.number().int().positive(),
 kind: z.enum(['numeric','exact','manual']), accepted: z.array(z.string()),
 numeric: NumericRuleSchema.nullable(), dependsOn: z.array(z.string()),
});
export const SchemeSchema = z.object({
 questionId: z.string(), raw: z.string(), expected: z.string(), marks: z.number().int().positive(),
 kind: z.enum(['numeric','exact','stepped','manual']),
 numeric: NumericRuleSchema.nullable(), accepted: z.array(z.string()),
 points: z.array(PointSchema), notes: z.array(z.string()),
 unresolvedRules: z.array(z.string()), finalAnswerAwardsAll: z.boolean(),
 sourcePages: z.array(z.number().int().positive()).min(1),
});
export const QuestionSchema = z.object({
 id: z.string(), text: z.string().min(1), context: z.string(),
 marks: z.number().int().positive(), topic: z.string(),
 sourcePages: z.array(z.number().int().positive()).min(1),
 references: z.array(z.string()), issues: z.array(z.string()),
});
export const ExtractionSchema = z.object({
 questions: z.array(QuestionSchema), schemes: z.array(SchemeSchema),
 warnings: z.array(z.string()), syllabus: z.enum(['0625','9702','unknown']),
});
export type NumericRule = z.infer<typeof NumericRuleSchema>;
export type MarkingPoint = z.infer<typeof PointSchema>;
export type Scheme = z.infer<typeof SchemeSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Extraction = z.infer<typeof ExtractionSchema>;
export type StoredFile = { id: string; name: string; mime: string; size: number };
// Where a question sits on the question paper, as fractions of the page, so it
// can be shown exactly as printed (diagrams, tables and graphs included).
export type QuestionCrop = { page: number; x: number; y: number; width: number; height: number };
// A mark-scheme row, for the teacher's review only. rotate 90: the page stores
// a landscape table sideways, so the crop is a vertical strip turned upright.
export type SchemeCrop = QuestionCrop & { rotate: 0 | 90 };
export type Paper = { id: string; title: string; syllabus: string; status: 'draft'|'ready';
 questions: Question[]; schemes: Scheme[]; warnings: string[]; files: {role: 'questions'|'scheme'|'combined'; file: StoredFile}[];
 createdAt: string; revision: number; demo?: boolean;
 // Kept outside ExtractionSchema, which is the model's strict output schema.
 // Papers from before these existed have neither: structured, whole pages.
 kind?: 'structured'|'multiple_choice'; crops?: Record<string, QuestionCrop[]>;
 // How the crops were worked out (CROPS_VERSION in lib/exam-paper-layout.ts).
 cropsVersion?: number;
 // How a structured paper was read: from its PDFs' text (lib/structured-paper.ts)
 // or by the AI model. Papers from before this have none: the AI.
 reader?: 'text'|'ai';
 // Where each part's row is in the mark scheme (papers read from text).
 schemeCrops?: Record<string, SchemeCrop[]> };
export type Answer = {
 questionId: string; mode: 'typed'|'handwritten'; text: string; steps: Record<string,string>; file: StoredFile|null;
 // Optional formula/working fields for calculation questions (numeric or stepped kind).
 // These are for the student's exam technique and for teacher review context only --
 // they are never read by compareNumeric or markAnswer, so adding them cannot change
 // any already-verified grading behavior. Only `text` (the final answer) is graded.
 formula?: string;
 working?: string;
};
export type Grade = { questionId: string; proposed: number|null; final: number|null;
 status: 'needs_review'|'proposed'|'self_practice'|'confirmed'; reason: string;
 points: {id:string; description:string; marks:number; hit:boolean|null}[]; expected: string;
 history: {score:number; note:string; at:string}[] };
export type Submission = {
 id:string; paperId:string; paperRevision:number; name:string; selfPractice:boolean;
 answers:Answer[]; grades:Grade[]; createdAt:string;
 // For a student who handwrote the entire paper rather than answering question-by-question:
 // one or more page images/scans covering the whole submission. When this is set, every
 // question in the paper should get a `handwritten`-mode Answer (which always and
 // unconditionally routes to teacher review, unchanged from before) with these pages
 // shown together as the evidence, rather than requiring a separate file per question.
 wholePaperFiles?: StoredFile[];
};
