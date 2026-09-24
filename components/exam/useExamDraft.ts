"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { readStoredDraft, removeAnswerDraft, writeStoredDraft } from "@/lib/answer-drafts";
import { ExamDraftSchema, examDraftKey, fitDraft, newerDraft, type ExamDraft } from "@/lib/exam-drafts";

export type SaveState = "loading" | "saving" | "saved" | "offline";

// How long typing may pause before the server copy is refreshed. The device
// copy is written on every change regardless.
const CLOUD_DELAY_MS = 1500;

const valid = (value: unknown): ExamDraft | null => {
  const parsed = ExamDraftSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

async function cloud(action: "draft-load" | "draft-save", paperId: string, draft?: ExamDraft, keepalive = false) {
  const response = await fetch("/api/physics-exam", {
    method: "POST", headers: { "content-type": "application/json" }, keepalive,
    body: JSON.stringify({ action, paperId, draft }),
  });
  if (!response.ok) throw new Error("draft");
  return response.json();
}

/**
 * The student's saved attempt at a paper: the newer of the copy on this
 * device and the copy on the server, fitted to the paper as it is now.
 * Drafts are keyed by student, so a shared school computer never shows one
 * student another's answers.
 */
export function useExamDraft(userId: string | null | undefined, paper: { id: string; questions: Array<{ id: string }> }) {
  const [initial, setInitial] = useState<ExamDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<SaveState>("loading");
  const pending = useRef<ExamDraft | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const key = userId ? examDraftKey(userId, paper.id) : null;
  const questionIds = paper.questions.map((q) => q.id).join("|");

  useEffect(() => {
    if (!key) return;
    let live = true;
    setReady(false);
    Promise.all([
      readStoredDraft<unknown>(key).then(valid).catch(() => null),
      cloud("draft-load", paper.id).then((r) => valid(r.draft)).catch(() => null),
    ]).then(([device, server]) => {
      if (!live) return;
      const best = newerDraft(device, server);
      setInitial(best ? fitDraft(best, questionIds.split("|")) : null);
      setReady(true);
      setState("saved");
    });
    return () => { live = false; };
  }, [key, paper.id, questionIds]);

  const pushNow = useCallback(async (keepalive = false) => {
    window.clearTimeout(timer.current);
    const draft = pending.current;
    if (!draft) return;
    pending.current = null;
    try {
      await cloud("draft-save", paper.id, draft, keepalive);
      setState((s) => (pending.current ? s : "saved"));
    } catch {
      // Still safe on this device; the next change or switch-away retries.
      pending.current ??= draft;
      setState("offline");
    }
  }, [paper.id]);

  const save = useCallback((draft: ExamDraft) => {
    if (!key) return;
    pending.current = draft;
    setState("saving");
    writeStoredDraft(key, draft).catch(() => undefined);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void pushNow(), CLOUD_DELAY_MS);
  }, [key, pushNow]);

  // Leaving the tab or closing it: send what is waiting straight away.
  useEffect(() => {
    const flush = () => { if (pending.current) void pushNow(true); };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pushNow]);

  /** After submitting: the server drops its copy itself; drop this device's. */
  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    pending.current = null;
    if (key) removeAnswerDraft(key).catch(() => undefined);
  }, [key]);

  return { ready: ready || !key, initial, state, save, clear };
}
