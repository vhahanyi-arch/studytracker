// The timer lengths a student can choose before sitting a full past paper, in
// minutes. Shared by the start screen and the routes that store the choice, so
// kept free of the database.
export const SITTING_TIMERS = [45, 60, 75, 90, 120] as const;

export function sittingTimer(value: unknown): number | null {
  const minutes = Number(value);
  return (SITTING_TIMERS as readonly number[]).includes(minutes) ? minutes : null;
}
