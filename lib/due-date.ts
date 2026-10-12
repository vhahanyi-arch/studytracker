// The due date a new assignment starts with: a week from today, as the
// teacher's own calendar date (an <input type="date"> value, YYYY-MM-DD).
export function defaultDueDate(today = new Date()) {
  const due = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}`;
}
