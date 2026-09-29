import { sql } from "./db";

// Which papers a student may open, answer and submit. A paper reaches a student
// in one of two ways:
//  - it is assigned to them (assignment_students), and is sat once; or
//  - it is a Stage 8/9 library paper the teacher has set as a full paper, and
//    they are in that stage's class with that teacher. Such a paper can be sat
//    again and again, each sitting a numbered attempt (schema 5).
// Both need the paper's questions approved (status 'assigned').
export async function studentPaper(assignmentId: string, studentId: string) {
  const [row] = await sql`
    SELECT (a.is_practice_library AND a.full_paper_set_at IS NOT NULL) AS full_paper
    FROM assignments a
    WHERE a.id = ${assignmentId} AND a.status = 'assigned' AND (
      EXISTS (SELECT 1 FROM assignment_students s WHERE s.assignment_id = a.id AND s.student_id = ${studentId})
      OR (a.is_practice_library AND a.full_paper_set_at IS NOT NULL AND EXISTS (
        SELECT 1 FROM lower_secondary_enrollments e
        WHERE e.student_id = ${studentId} AND e.teacher_id = a.teacher_id AND e.stage = a.lower_secondary_stage
      ))
    )
    LIMIT 1
  `;
  return row ? { fullPaper: Boolean(row.full_paper) } : null;
}

export { sittingTimer } from "./sitting-timers";
