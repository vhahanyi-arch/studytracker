// The per-question crop geometry shared by the teacher setup screen and the
// student answering views. Extracted verbatim from app/page.tsx.

export type PaperQuestion = {
  id?: string;
  position?: number;
  label: string;
  marks: number | null;
  page_number: number;
  crop_x: number;
  crop_y: number;
  crop_width: number;
  crop_height: number;
  response_type?: "typed" | "drawing" | "multiple_choice";
  answer_slots?: number;
  response_layout?: "answer" | "working" | "formula";
  expected_answer?: string | null;
  mark_scheme_notes?: string | null;
  topic?: string | null;
  draft_answer?: string | null;
  draft_accepted_answer?: string | null;
  draft_confidence?: "high" | "medium" | "review" | null;
  extracted_question_text?: string | null;
};

export const QUESTION_CROP_TOP_PADDING = 0.02;
export function displayCrop(question: PaperQuestion) {
  const extraTop = Math.min(QUESTION_CROP_TOP_PADDING, question.crop_y);
  const y = Math.max(0, question.crop_y - extraTop);
  return {
    x: question.crop_x,
    y,
    width: question.crop_width,
    height: Math.min(1 - y, question.crop_height + extraTop),
  };
}

