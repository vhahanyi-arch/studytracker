// Turns a student's completed practice sets into the two questions they
// actually ask -- am I scoring better, and am I needing less help -- kept free
// of Next and the database so the arithmetic can be tested directly. The route
// under app/api/progress is a thin adapter that loads rows and calls these.
//
// Hint counts are recorded per set, but a set's length varies by unit and
// difficulty, so a raw count is not comparable between units. Everything here
// works in hints per question instead.

export type PracticeSession = {
  source: "maths" | "physics";
  // "7" | "8" | "9" for Lower Secondary, "igcse" | "as" for Physics.
  track: string;
  chapterId: string;
  score: number;
  hints: number;
  questions: number;
  completedAt: string;
  // A set of approved past-paper questions (lib/past-paper-practice.ts). It
  // counts in every average and trend, but never toward a unit's mastery.
  pastPaper?: boolean;
};

export const STRONG_SET = 80;
export const SETS_FOR_MASTERY = 2;

// Below this there is no trend worth claiming: two sets is a pair of data
// points, and telling a student they are "improving" on that basis would be
// noise dressed as feedback.
export const MIN_SETS_FOR_TREND = 4;

// A set with no questions recorded cannot produce a rate. Returning null keeps
// it out of the averages rather than contributing a fictitious zero.
export function hintRate(session: PracticeSession): number | null {
  return session.questions > 0 ? session.hints / session.questions : null;
}

const mean = (values: number[]): number | null =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;

const round1 = (value: number) => Math.round(value * 10) / 10;

export function inTimeOrder(sessions: PracticeSession[]): PracticeSession[] {
  return [...sessions].sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
}

export type Overall = {
  sets: number;
  averageScore: number | null;
  averageHintRate: number | null;
  strongSets: number;
  lastActive: string | null;
};

export function overall(sessions: PracticeSession[]): Overall {
  const ordered = inTimeOrder(sessions);
  const rates = sessions.map(hintRate).filter((rate): rate is number => rate !== null);
  const scoreAverage = mean(sessions.map((session) => session.score));
  const rateAverage = mean(rates);
  return {
    sets: sessions.length,
    averageScore: scoreAverage === null ? null : Math.round(scoreAverage),
    averageHintRate: rateAverage === null ? null : round1(rateAverage * 100) / 100,
    strongSets: sessions.filter((session) => session.score >= STRONG_SET).length,
    lastActive: ordered.length ? ordered[ordered.length - 1].completedAt : null,
  };
}

export type Trend =
  | { enough: false; sets: number; needed: number }
  | {
      enough: true;
      sets: number;
      window: number;
      scoreFrom: number;
      scoreTo: number;
      hintRateFrom: number | null;
      hintRateTo: number | null;
    };

// Compares the student's earliest sets against their most recent ones. The
// window is capped at three and at half the total, so the two ends can never
// overlap and a single lucky set cannot carry the comparison on its own.
export function trend(sessions: PracticeSession[]): Trend {
  if (sessions.length < MIN_SETS_FOR_TREND)
    return { enough: false, sets: sessions.length, needed: MIN_SETS_FOR_TREND };
  const ordered = inTimeOrder(sessions);
  const window = Math.min(3, Math.floor(ordered.length / 2));
  const first = ordered.slice(0, window);
  const last = ordered.slice(-window);
  const rateOf = (group: PracticeSession[]) => {
    const rates = group.map(hintRate).filter((rate): rate is number => rate !== null);
    const average = mean(rates);
    return average === null ? null : round1(average * 100) / 100;
  };
  return {
    enough: true,
    sets: ordered.length,
    window,
    scoreFrom: Math.round(mean(first.map((session) => session.score)) ?? 0),
    scoreTo: Math.round(mean(last.map((session) => session.score)) ?? 0),
    hintRateFrom: rateOf(first),
    hintRateTo: rateOf(last),
  };
}

export type UnitProgress = {
  chapterId: string;
  source: "maths" | "physics";
  track: string;
  // Past-paper sets are listed as their own row, never mastered.
  pastPaper: boolean;
  sets: number;
  firstScore: number;
  latestScore: number;
  bestScore: number;
  hintRateFirst: number | null;
  hintRateLatest: number | null;
  strongSets: number;
  mastered: boolean;
  lastActive: string;
};

export function perUnit(sessions: PracticeSession[]): UnitProgress[] {
  const groups = new Map<string, PracticeSession[]>();
  for (const session of sessions) {
    const key = `${session.source}:${session.track}:${session.chapterId}:${session.pastPaper ? "past" : "set"}`;
    const group = groups.get(key);
    if (group) group.push(session);
    else groups.set(key, [session]);
  }
  const units = [...groups.values()].map((group) => {
    const ordered = inTimeOrder(group);
    const first = ordered[0];
    const latest = ordered[ordered.length - 1];
    const strongSets = ordered.filter((session) => session.score >= STRONG_SET).length;
    return {
      chapterId: first.chapterId,
      source: first.source,
      track: first.track,
      pastPaper: Boolean(first.pastPaper),
      sets: ordered.length,
      firstScore: first.score,
      latestScore: latest.score,
      bestScore: Math.max(...ordered.map((session) => session.score)),
      hintRateFirst: hintRate(first),
      hintRateLatest: hintRate(latest),
      strongSets,
      mastered: !first.pastPaper && strongSets >= SETS_FOR_MASTERY,
      lastActive: latest.completedAt,
    };
  });
  return units.sort((a, b) => Date.parse(b.lastActive) - Date.parse(a.lastActive));
}

export type SeriesPoint = { index: number; score: number; hintRate: number | null; completedAt: string; chapterId: string };

// The last `limit` sets, oldest first, for plotting. Index is the position on
// the chart rather than the row's real id, so the caller does not have to care
// how many were trimmed.
export function series(sessions: PracticeSession[], limit = 12): SeriesPoint[] {
  return inTimeOrder(sessions)
    .slice(-limit)
    .map((session, index) => ({
      index,
      score: session.score,
      hintRate: hintRate(session),
      completedAt: session.completedAt,
      chapterId: session.chapterId,
    }));
}
