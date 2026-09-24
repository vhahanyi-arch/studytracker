// Student answer drafts. Kept in IndexedDB so a closed tab or lost connection
// does not lose work, and mirrored to the server so a different device can
// resume. Extracted verbatim from app/page.tsx.

export type AnswerRow = {
  question: string;
  formula?: string;
  working?: string;
  answer: string;
  answers?: string[];
  workMode?: "answer" | "working" | "formula";
  drawing?: string;
  showDrawing?: boolean;
};

export type AnswerDraft = {
  rows: AnswerRow[];
  activeIndex: number;
  mode: "typed" | "handwritten" | "both" | "paper";
  paperPages?: Record<number, string>;
  paperPageNumber?: number;
  savedAt: string;
};

export const openDraftStore = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("studytrack-student-drafts", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("drafts"))
        request.result.createObjectStore("drafts");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// The store holds any draft shape; the key says whose and for what. Papers &
// assignments and Exam papers both keep their drafts here.
export async function readStoredDraft<T>(key: string) {
  const database = await openDraftStore();
  return new Promise<T | null>((resolve, reject) => {
    const request = database.transaction("drafts").objectStore("drafts").get(key);
    request.onsuccess = () => resolve((request.result as T) || null);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

export async function writeStoredDraft<T>(key: string, draft: T) {
  const database = await openDraftStore();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite");
    transaction.objectStore("drafts").put(draft, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => database.close());
}

export const readAnswerDraft = (key: string) => readStoredDraft<AnswerDraft>(key);
export const writeAnswerDraft = (key: string, draft: AnswerDraft) => writeStoredDraft(key, draft);

export async function removeAnswerDraft(key: string) {
  const database = await openDraftStore();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite");
    transaction.objectStore("drafts").delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => database.close());
}

export async function readCloudAnswerDraft(assignmentId: string) {
  const response = await fetch(`/api/assignments/${assignmentId}/draft`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Cloud draft unavailable");
  const result = await response.json();
  return (result.draft as AnswerDraft | null) || null;
}

export async function writeCloudAnswerDraft(
  assignmentId: string,
  draft: AnswerDraft,
) {
  const response = await fetch(`/api/assignments/${assignmentId}/draft`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ draft }),
  });
  if (!response.ok) throw new Error("Cloud draft unavailable");
}

export async function removeCloudAnswerDraft(assignmentId: string) {
  const response = await fetch(`/api/assignments/${assignmentId}/draft`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Cloud draft could not be removed");
}
