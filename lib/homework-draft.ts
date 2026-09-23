// Draft marking answers for Lower Secondary homework pages. The recognised
// text of a page goes in; a draft answer comes out, with a confidence that
// decides whether the teacher must review it before students can use it.
// Pure: no DOM, network or React, which is why it lives outside app/page.tsx.

export type HomeworkDraft = {
  answer: string;
  acceptedAnswer: string | null;
  confidence: "high" | "medium" | "review";
};

export function calculateExpression(source: string) {
  const normalized = source
    .replace(/[×xX]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\^/g, "^")
    .replace(/\s+/g, "");
  if (!normalized || !/^[\d.+\-*/^()]+$/.test(normalized)) return null;
  const tokens = normalized.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) || [];
  if (tokens.join("") !== normalized) return null;
  let cursor = 0;
  const primary = (): number => {
    const token = tokens[cursor++];
    if (token === "+") return primary();
    if (token === "-") return -primary();
    if (token === "(") {
      const value = expression();
      if (tokens[cursor++] !== ")") throw new Error("parenthesis");
      return value;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error("number");
    return value;
  };
  const power = (): number => {
    let value = primary();
    while (tokens[cursor] === "^") {
      cursor += 1;
      value **= power();
    }
    return value;
  };
  const term = (): number => {
    let value = power();
    while (tokens[cursor] === "*" || tokens[cursor] === "/") {
      const operator = tokens[cursor++];
      const right = power();
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  };
  const expression = (): number => {
    let value = term();
    while (tokens[cursor] === "+" || tokens[cursor] === "-") {
      const operator = tokens[cursor++];
      const right = term();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };
  try {
    const value = expression();
    if (cursor !== tokens.length || !Number.isFinite(value) || Math.abs(value) > 1e12) return null;
    return Math.abs(value - Math.round(value)) < 1e-10
      ? String(Math.round(value))
      : String(Number(value.toFixed(8)));
  } catch {
    return null;
  }
}

function homeworkNumber(value: number) {
  if (!Number.isFinite(value)) return null;
  return Math.abs(value - Math.round(value)) < 1e-10
    ? String(Math.round(value))
    : String(Number(value.toFixed(8)));
}

function homeworkGcd(left: number, right: number) {
  let a = Math.abs(Math.round(left));
  let b = Math.abs(Math.round(right));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function simplifyHomeworkRatio(left: number, right: number) {
  if (!Number.isInteger(left) || !Number.isInteger(right) || !left || !right) return null;
  const divisor = homeworkGcd(left, right);
  return `${left / divisor}:${right / divisor}`;
}

export function simplifyLinearTerms(source: string) {
  const normalized = source.replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(/X/g, "x");
  if (!/x/i.test(normalized) || !/^[+\-\d.x]+$/i.test(normalized)) return null;
  const terms = normalized.match(/[+\-]?(?:\d+(?:\.\d+)?)?x|[+\-]?\d+(?:\.\d+)?/gi) || [];
  if (!terms.length || terms.join("") !== normalized) return null;
  let coefficient = 0;
  let constant = 0;
  for (const term of terms) {
    if (/x/i.test(term)) {
      const raw = term.replace(/x/i, "");
      coefficient += raw === "" || raw === "+" ? 1 : raw === "-" ? -1 : Number(raw);
    } else constant += Number(term);
  }
  if (!Number.isFinite(coefficient) || !Number.isFinite(constant)) return null;
  const parts: string[] = [];
  if (coefficient) parts.push(`${coefficient === 1 ? "" : coefficient === -1 ? "-" : homeworkNumber(coefficient)}x`);
  if (constant) parts.push(`${parts.length && constant > 0 ? "+" : ""}${homeworkNumber(constant)}`);
  return parts.join("") || "0";
}

function homeworkExerciseBlocks(lines: string[]) {
  const starts = lines
    .map((line, index) => {
      const match = line.match(/^\s*[\[(]?\s*(\d{1,2})\s*[\]).]?\s+(?=(?:[a-z][.)]?\s+)?(?:work|write|find|calculate|complete|copy|solve|simplify|round|draw|construct|shade|plot|show|estimate|measure|state|give|which|what|how|use|express|convert|the\b))/i);
      return match ? { index, label: match[1] } : null;
    })
    .filter((entry): entry is { index: number; label: string } => !!entry)
    .filter((entry, index, all) => index === 0 || entry.label !== all[index - 1].label);
  if (starts.length < 2) return [];
  return starts.map((start, index) => ({
    label: start.label,
    text: lines.slice(start.index, starts[index + 1]?.index ?? lines.length).join("\n"),
  }));
}

export function generateHomeworkDraftFromText(rawText: string, splitExercises = true): HomeworkDraft {
  const text = rawText
    .replace(/[|]/g, "I")
    .replace(/[−–—]/g, "-")
    .replace(/[⁰]/g, "0").replace(/[¹]/g, "1").replace(/[²]/g, "^2").replace(/[³]/g, "^3")
    .replace(/\r/g, "")
    .trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (splitExercises) {
    const blocks = homeworkExerciseBlocks(lines);
    if (blocks.length >= 2) {
      const drafts = blocks.map((block) => ({
        label: block.label,
        draft: generateHomeworkDraftFromText(block.text, false),
      }));
      const answer = drafts.map(({ label, draft }) => {
        const review = draft.confidence === "review" ? "Teacher review required" : "Automatic draft";
        return `Question ${label} · ${review}\n${draft.answer}`;
      }).join("\n\n");
      const reviewCount = drafts.filter(({ draft }) => draft.confidence === "review").length;
      return {
        answer: `${answer}\n\nCoverage check: ${drafts.length} numbered exercises were detected and all are listed above.${reviewCount ? ` ${reviewCount} need teacher input before this page is used for automatic practice.` : " Check each result before approval."}`,
        acceptedAnswer: null,
        confidence: reviewCount ? "review" : "medium",
      };
    }
  }
  const firstExercise = lines.findIndex((line) => /^1(?:\s|[.)])/i.test(line));
  const exerciseLines = (firstExercise >= 0 ? lines.slice(firstExercise) : lines).slice(0, 120);
  const working: Array<{ method: string; answer: string }> = [];
  const seen = new Set<string>();
  const add = (method: string, answer: string) => {
    const key = `${method.replace(/\s+/g, "")}=${answer}`;
    if (!seen.has(key)) {
      seen.add(key);
      working.push({ method: method.trim(), answer });
    }
  };
  exerciseLines.forEach((line) => {
    for (const match of line.matchAll(/(-?\d+(?:\.\d+)?(?:\s*[+\-×xX÷/^]\s*-?\d+(?:\.\d+)?)+)/g)) {
      const value = calculateExpression(match[1]);
      if (value !== null) add(match[1], value);
    }
    for (const match of line.matchAll(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/gi)) {
      const value = Number(match[1]) * Number(match[2]) / 100;
      add(match[0], String(Number(value.toFixed(8))));
    }
    const equation = line.match(/(-?\d+(?:\.\d+)?)?\s*[xX]\s*([+\-]\s*\d+(?:\.\d+)?)?\s*=\s*(-?\d+(?:\.\d+)?)/);
    if (equation) {
      const coefficient = equation[1] ? Number(equation[1]) : 1;
      const constant = equation[2] ? Number(equation[2].replace(/\s/g, "")) : 0;
      const right = Number(equation[3]);
      if (coefficient) add(equation[0], String(Number(((right - constant) / coefficient).toFixed(8))));
    }
    for (const match of line.matchAll(/((?:[+\-]?\s*(?:\d+(?:\.\d+)?)?\s*[xX])(?:\s*[+\-]\s*(?:\d+(?:\.\d+)?)?\s*[xX])+(?:\s*[+\-]\s*\d+(?:\.\d+)?)?)/g)) {
      const value = simplifyLinearTerms(match[1]);
      if (value !== null) add(`Simplify ${match[1]}`, value);
    }
    if (/ratio|simplest form|simplify/i.test(line)) {
      for (const match of line.matchAll(/\b(\d+)\s*:\s*(\d+)\b/g)) {
        const value = simplifyHomeworkRatio(Number(match[1]), Number(match[2]));
        if (value && value !== `${match[1]}:${match[2]}`) add(`Simplify ${match[0]}`, value);
      }
    }
  });
  const joinedExercises = exerciseLines.join(" ");
  for (const match of joinedExercises.matchAll(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/gi)) {
    const value = homeworkNumber(Number(match[1]) * Number(match[2]) / 100);
    if (value !== null) add(match[0], value);
  }
  for (const match of joinedExercises.matchAll(/(?:position-to-term rule|term(?:-to-term)? rule)[^.]{0,100}?multiply by\s*(\d+(?:\.\d+)?)[^.]{0,60}?(?:then\s*)?(add|subtract)\s*(\d+(?:\.\d+)?)/gi)) {
    const multiplier = Number(match[1]);
    const adjustment = Number(match[3]) * (match[2].toLowerCase() === "subtract" ? -1 : 1);
    const terms = [1, 2, 3, 4, 5].map((position) => homeworkNumber(position * multiplier + adjustment)).filter(Boolean);
    if (terms.length === 5) add("First five terms", terms.join(", "));
  }
  for (const match of joinedExercises.matchAll(/(?:round|write)\s+(\d+(?:\.\d+)?)\s+(?:to|correct to)\s+the nearest\s+(ten|hundred|thousand)/gi)) {
    const place = match[2].toLowerCase() === "ten" ? 10 : match[2].toLowerCase() === "hundred" ? 100 : 1000;
    add(match[0], String(Math.round(Number(match[1]) / place) * place));
  }
  for (const match of joinedExercises.matchAll(/(?:mean|average)\s+of\s+((?:-?\d+(?:\.\d+)?(?:\s*,\s*|\s+and\s+))+?-?\d+(?:\.\d+)?)/gi)) {
    const values = match[1].match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    const value = values.length ? homeworkNumber(values.reduce((sum, item) => sum + item, 0) / values.length) : null;
    if (value !== null) add(match[0], value);
  }
  const visualQuestion = /draw|construct|shade|plot|graph|diagram|measure|matrix|matrices|vector|translation|reflection|rotation/i.test(joinedExercises);
  if (!working.length) {
    const recognisedSummary = exerciseLines
      .filter((line) => !/^example\b/i.test(line))
      .slice(0, 14)
      .join("\n")
      .slice(0, 1400);
    return {
      answer: visualQuestion
        ? `Visual or construction task detected. Keep this question for teacher marking.\n\nRecognised task:\n${recognisedSummary || "The page image needs teacher review."}`
        : `The question was recognised, but a reliable automatic solution was not produced. This usually means it is a written-reasoning or multi-step task rather than a direct calculation.\n\nRecognised task:\n${recognisedSummary || "Review the page crop and enter the marking answer manually."}`,
      acceptedAnswer: null,
      confidence: "review",
    };
  }
  const answer = working
    .slice(0, 60)
    .map((item, index) => `${index + 1}. ${item.method} = ${item.answer}`)
    .join("\n");
  return {
    answer,
    acceptedAnswer: working.length === 1 && !visualQuestion ? working[0].answer : null,
    confidence: working.length === 1 && !visualQuestion ? "high" : visualQuestion ? "review" : "medium",
  };
}
