import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const clerk = await clerkClient();
  const viewer = await clerk.users.getUser(userId);
  if (viewer.publicMetadata.role !== "teacher")
    return NextResponse.json({ error: "Teacher access is required." }, { status: 403 });

  await ensureSchema();
  const [studentRows, reviewRows, paperRows, averageRows, recentRows, assignmentRows, topicRows] =
    await Promise.all([
      sql`
        SELECT COUNT(DISTINCT ast.student_id)::int AS count
        FROM assignment_students ast
        JOIN assignments a ON a.id = ast.assignment_id
        WHERE a.teacher_id = ${userId}
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM submissions s
        JOIN assignments a ON a.id = s.assignment_id
        WHERE a.teacher_id = ${userId} AND s.status = 'awaiting_review'
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM assignments
        WHERE teacher_id = ${userId} AND status = 'assigned' AND is_practice_library = FALSE
      `,
      sql`
        WITH published_totals AS (
          SELECT s.id, s.total_final, COALESCE(SUM(q.marks), 0) AS maximum
          FROM submissions s
          JOIN assignments a ON a.id = s.assignment_id
          LEFT JOIN assignment_questions q ON q.assignment_id = a.id
          WHERE a.teacher_id = ${userId} AND s.status = 'published'
          GROUP BY s.id
        )
        SELECT COALESCE(
          ROUND(AVG(CASE WHEN maximum > 0 THEN total_final * 100.0 / maximum END)),
          0
        )::int AS average
        FROM published_totals
      `,
      sql`
        SELECT s.id, s.student_id, s.status, s.submitted_at,
          s.total_proposed, s.total_final, a.title, a.subject, a.syllabus,
          COALESCE((SELECT SUM(q.marks) FROM assignment_questions q WHERE q.assignment_id = a.id), 0)::int AS maximum
        FROM submissions s
        JOIN assignments a ON a.id = s.assignment_id
        WHERE a.teacher_id = ${userId} AND a.is_practice_library = FALSE
        ORDER BY s.submitted_at DESC
        LIMIT 5
      `,
      sql`
        SELECT a.id, a.title, a.subject, a.syllabus, a.due_date, a.status,
          (SELECT COUNT(*) FROM assignment_students ast WHERE ast.assignment_id = a.id)::int AS assigned_count,
          (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id)::int AS submitted_count
        FROM assignments a
        WHERE a.teacher_id = ${userId} AND a.is_practice_library = FALSE
        ORDER BY CASE WHEN a.status = 'assigned' THEN 0 ELSE 1 END, a.created_at DESC
        LIMIT 5
      `,
      sql`
        SELECT COALESCE(NULLIF(TRIM(q.topic), ''), 'General skills') AS topic,
          ROUND(SUM(m.final_mark) * 100.0 / NULLIF(SUM(q.marks), 0))::int AS percentage,
          COUNT(*)::int AS responses
        FROM submission_marks m
        JOIN submissions s ON s.id = m.submission_id
        JOIN assignment_questions q ON q.id = m.question_id
        JOIN assignments a ON a.id = s.assignment_id
        WHERE a.teacher_id = ${userId} AND s.status = 'published'
          AND m.final_mark IS NOT NULL AND q.marks > 0
        GROUP BY COALESCE(NULLIF(TRIM(q.topic), ''), 'General skills')
        ORDER BY responses DESC, topic
        LIMIT 6
      `,
    ]);

  const recentSubmissions = await Promise.all(
    recentRows.map(async (row) => {
      let studentName = "Student";
      try {
        const student = await clerk.users.getUser(String(row.student_id));
        studentName =
          [student.firstName, student.lastName].filter(Boolean).join(" ") ||
          student.username ||
          "Student";
      } catch {
        // Keep historical work visible if a Clerk account was removed.
      }
      return { ...row, student_name: studentName };
    }),
  );

  return NextResponse.json({
    active_students: Number(studentRows[0]?.count || 0),
    needs_review: Number(reviewRows[0]?.count || 0),
    active_papers: Number(paperRows[0]?.count || 0),
    class_average: Number(averageRows[0]?.average || 0),
    recent_submissions: recentSubmissions,
    assignments: assignmentRows,
    topic_performance: topicRows,
  });
}
