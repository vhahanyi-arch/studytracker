import type { AssignmentSummary } from "@/lib/portal-content";

// The Papers library search: a paper matches when every word typed appears
// somewhere in its title, subject, syllabus or class, in any case and order.
export function matchesPaperSearch(
  paper: Pick<AssignmentSummary, "title" | "subject" | "syllabus" | "class_name">,
  query: string,
) {
  const haystack = [paper.title, paper.subject, paper.syllabus, paper.class_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}
