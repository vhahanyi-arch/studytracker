// Builds Stage 8 and 9 practice sets from pools of question templates.
//
// The previous generators returned the same six template slots on every set,
// so a unit could never assess more than eighteen things, and where a slot's
// numbers were fixed the whole set repeated word for word -- a student could
// pass the two-strong-sets mastery rule from memory. Each tier now has a pool
// of templates tagged with framework codes; a set draws six of them, spread
// across as many different objectives as the pool allows.

export type Tier = "foundational" | "application" | "reasoning";
export const TIERS: Tier[] = ["foundational", "application", "reasoning"];

export type Made = { prompt: string; answers: string[]; hint: string; solution: string; answerFormat?: string };

export type Template = {
  /** Stable id, stored with every generated question: "s8-u1-f7". */
  id: string;
  tier: Tier;
  /** Framework codes this template assesses; the first is its main objective. */
  codes: string[];
  /** Short learner-facing description, shown above the question. */
  objective: string;
  make: () => Made;
};

export type StageQuestion = Made & { templateId: string; objective: string; difficulty: Tier; codes: string[] };

export const SET_SIZE = 6;

/**
 * Six templates from a tier's pool, preferring ones whose main objective is
 * not already in the set, so each set samples as much of the unit as it can.
 */
export function chooseTemplates(pool: Template[], size = SET_SIZE): Template[] {
  if (pool.length < size) throw new Error(`a pool needs at least ${size} templates, has ${pool.length}`);
  const order = [...pool];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const chosen: Template[] = [];
  const used = new Set<string>();
  for (const t of order) if (chosen.length < size && !used.has(t.codes[0])) { chosen.push(t); used.add(t.codes[0]); }
  for (const t of order) if (chosen.length < size && !chosen.includes(t)) chosen.push(t);
  return chosen;
}

export function makeSet(unit: string, templates: Template[], tier: Tier): StageQuestion[] {
  const pool = templates.filter((t) => t.tier === tier);
  const prompts = new Set<string>();
  const out: StageQuestion[] = [];
  for (const t of chooseTemplates(pool)) {
    // Two templates can occasionally produce the same wording; draw again.
    let made = t.make();
    for (let tries = 0; prompts.has(made.prompt) && tries < 20; tries++) made = t.make();
    if (prompts.has(made.prompt)) throw new Error(`${t.id} keeps repeating a prompt already in the set`);
    prompts.add(made.prompt);
    out.push({ ...made, templateId: t.id, objective: t.objective, difficulty: tier, codes: t.codes });
  }
  if (out.length !== SET_SIZE) throw new Error(`${unit} ${tier} must generate exactly ${SET_SIZE} questions`);
  return out;
}

/** Shorthand used by every unit file. */
export const T = (id: string, tier: Tier, codes: string[], objective: string, make: () => Made): Template => ({ id, tier, codes, objective, make });
