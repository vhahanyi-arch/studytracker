import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
let schemaPromise: Promise<void> | null = null;

async function initializeSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS assignments (
      id UUID PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT 'Mathematics',
      syllabus TEXT NOT NULL DEFAULT '0580',
      paper_mode TEXT NOT NULL DEFAULT 'structured',
      class_name TEXT NOT NULL,
      due_date DATE,
      question_paper_url TEXT NOT NULL,
      mark_scheme_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'assigned',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'Mathematics'
  `;
  await sql`
    ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS paper_mode TEXT NOT NULL DEFAULT 'structured'
  `;
  await sql`
    ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS lower_secondary_stage INTEGER,
    ADD COLUMN IF NOT EXISTS is_practice_library BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS source_year TEXT,
    ADD COLUMN IF NOT EXISTS resource_kind TEXT NOT NULL DEFAULT 'exam',
    ADD COLUMN IF NOT EXISTS content_start_page INTEGER,
    ADD COLUMN IF NOT EXISTS content_end_page INTEGER
  `;
  await sql`ALTER TABLE assignments ALTER COLUMN mark_scheme_url DROP NOT NULL`;
  await sql`
    CREATE TABLE IF NOT EXISTS assignment_students (
      assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (assignment_id, student_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY,
      assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL,
      answer_text TEXT,
      handwritten_url TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (assignment_id, student_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS assignment_questions (
      id UUID PRIMARY KEY,
      assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      label TEXT NOT NULL,
      marks INTEGER,
      page_number INTEGER NOT NULL,
      crop_x DOUBLE PRECISION NOT NULL DEFAULT 0,
      crop_y DOUBLE PRECISION NOT NULL DEFAULT 0,
      crop_width DOUBLE PRECISION NOT NULL DEFAULT 1,
      crop_height DOUBLE PRECISION NOT NULL DEFAULT 1,
      response_type TEXT NOT NULL DEFAULT 'typed',
      answer_slots INTEGER NOT NULL DEFAULT 1,
      response_layout TEXT NOT NULL DEFAULT 'answer',
      expected_answer TEXT,
      mark_scheme_notes TEXT,
      topic TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (assignment_id, position)
    )
  `;
  await sql`
    ALTER TABLE assignment_questions
    ADD COLUMN IF NOT EXISTS response_type TEXT NOT NULL DEFAULT 'typed'
  `;
  await sql`
    ALTER TABLE assignment_questions
    ADD COLUMN IF NOT EXISTS answer_slots INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS response_layout TEXT NOT NULL DEFAULT 'answer'
  `;
  await sql`
    ALTER TABLE assignment_questions
    ADD COLUMN IF NOT EXISTS expected_answer TEXT
  `;
  await sql`
    ALTER TABLE assignment_questions
    ADD COLUMN IF NOT EXISTS mark_scheme_notes TEXT
  `;
  await sql`
    ALTER TABLE assignment_questions
    ADD COLUMN IF NOT EXISTS topic TEXT
  `;
  await sql`
    ALTER TABLE assignment_questions
    ADD COLUMN IF NOT EXISTS draft_answer TEXT,
    ADD COLUMN IF NOT EXISTS draft_accepted_answer TEXT,
    ADD COLUMN IF NOT EXISTS draft_confidence TEXT,
    ADD COLUMN IF NOT EXISTS extracted_question_text TEXT
  `;
  await sql`
    ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS total_proposed INTEGER,
    ADD COLUMN IF NOT EXISTS total_final INTEGER,
    ADD COLUMN IF NOT EXISTS teacher_feedback TEXT,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS submission_marks (
      submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES assignment_questions(id) ON DELETE CASCADE,
      proposed_mark INTEGER,
      final_mark INTEGER,
      confidence TEXT NOT NULL DEFAULT 'review',
      rationale TEXT,
      teacher_feedback TEXT,
      PRIMARY KEY (submission_id, question_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS student_answer_drafts (
      assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL,
      draft_data TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (assignment_id, student_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lower_secondary_weekly_focus (
      teacher_id TEXT NOT NULL,
      stage INTEGER NOT NULL,
      chapter_id TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (teacher_id, stage, chapter_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lower_secondary_practice_sessions (
      id UUID PRIMARY KEY,
      teacher_id TEXT,
      student_id TEXT NOT NULL,
      stage INTEGER NOT NULL,
      chapter_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      answers_json TEXT,
      hints_used INTEGER NOT NULL DEFAULT 0,
      score INTEGER,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;
  await sql`
    ALTER TABLE lower_secondary_practice_sessions
    ADD COLUMN IF NOT EXISTS home_stage INTEGER
  `;
  await sql`
    UPDATE lower_secondary_practice_sessions
    SET home_stage = stage
    WHERE home_stage IS NULL
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lower_secondary_enrollments (
      teacher_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      stage INTEGER NOT NULL,
      enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (teacher_id, student_id, stage)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS physics_practice_sessions (
      id UUID PRIMARY KEY,
      student_id TEXT NOT NULL,
      teacher_id TEXT,
      level TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      answers_json TEXT,
      hints_used INTEGER NOT NULL DEFAULT 0,
      score INTEGER,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;
  await sql`
    ALTER TABLE physics_practice_sessions
    ADD COLUMN IF NOT EXISTS teacher_id TEXT
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS physics_syllabus_checklist (
      user_id TEXT NOT NULL,
      objective_id TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'igcse',
      checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, objective_id, level)
    )
  `;
}

export async function ensureSchema() {
  if (!schemaPromise)
    schemaPromise = initializeSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  return schemaPromise;
}
