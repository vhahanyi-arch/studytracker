"use client";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { readReply } from "@/lib/read-reply";

// Deletes a Papers & assignments paper (DELETE /api/assignments/[id]) after
// the teacher confirms. `submissions` is the count the teacher is warned
// about; the server deletes only if it still matches, and otherwise answers
// with the real count, which this dialog then shows for a second confirm.
// `consequence` adds what else is lost for this kind of paper.
export function DeletePaperDialog({
  paper,
  submissions: warned,
  consequence,
  onDeleted,
  onCancel,
}: {
  paper: { id: string; title: string };
  submissions: number;
  consequence?: string;
  onDeleted: () => void;
  onCancel: () => void;
}) {
  const [submissions, setSubmissions] = useState(warned);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      const response = await fetch(`/api/assignments/${paper.id}?submissions=${submissions}`, { method: "DELETE" });
      const result = await readReply(response);
      if (response.status === 409 && Number.isInteger(result.submissions)) {
        setSubmissions(result.submissions);
        setError("A student has submitted since this opened.");
        return;
      }
      if (!response.ok) throw new Error(result.error || "The paper could not be deleted.");
      onDeleted();
    } catch (problem) {
      setError(problem instanceof Error && !(problem instanceof TypeError) ? problem.message : "The delete did not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog
      title={`Delete “${paper.title}”?`}
      description={[
        error,
        submissions
          ? `${submissions} student submission${submissions === 1 ? "" : "s"}, with their marks and uploaded pages, will be deleted too.`
          : "No student has submitted it.",
        consequence,
        "Its questions, its PDFs and any answers students have started but not sent are deleted. This cannot be undone.",
      ].filter(Boolean).join(" ")}
      confirmLabel="Delete paper"
      busy={busy}
      onConfirm={confirm}
      onCancel={onCancel}
    />
  );
}
