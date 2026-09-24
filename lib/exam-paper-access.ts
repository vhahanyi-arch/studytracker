// What a student may see of an exam paper before submitting it. Answers stay
// on the server: the mark scheme's expected answers, accepted alternatives,
// numeric rules and notes are removed, and so is the mark-scheme PDF.
import type { Paper } from "./physics-extraction-schema";

export type StudentScheme = {
  questionId: string;
  kind: Paper["schemes"][number]["kind"];
  marks: number;
  // Step fields need an id, a label and a mark; the accepted answers do not travel.
  points: Array<{ id: string; description: string; marks: number; kind: string }>;
};
export type StudentPaper = Omit<Paper, "schemes" | "warnings" | "schemeCrops"> & { schemes: StudentScheme[] };

export function studentView(paper: Paper): StudentPaper {
  const { schemes, warnings: _warnings, schemeCrops: _schemeCrops, ...rest } = paper;
  return {
    ...rest,
    files: paper.files.filter((f) => f.role !== "scheme"),
    schemes: schemes.map((s) => ({
      questionId: s.questionId, kind: s.kind, marks: s.marks,
      // Only stepped parts need their points, as the labels of the step
      // fields. Elsewhere a point is a line of the mark scheme ("A1 = 0.87 s"
      // on a paper read without AI), so it stays on the server.
      points: s.kind !== "stepped" ? [] : s.points.map((p) => ({ id: p.id, description: p.description, marks: p.marks, kind: p.kind })),
    })),
  };
}

/**
 * Whether a student may open this file of their teacher's paper: only once it
 * is published, and never the mark scheme. A combined PDF holds the scheme
 * too, which is why the upload screen recommends separate files.
 */
export function studentMayOpen(paper: Pick<Paper, "status" | "files">, fileId: string) {
  return paper.status === "ready" && paper.files.some((f) => f.file.id === fileId && f.role !== "scheme");
}
