// Parses the AS Physics revision notes (docs/as-physics-notes/*.md) into a
// small tree the app can render. It covers exactly the markdown those notes
// use -- headings, paragraphs, bullet lists, tables, bold, links, images and
// code spans -- rather than markdown in general.
//
// The notes were written as plain text, so they carry notation a reader would
// not want to see raw: `^238_92 U` for a nuclide, `V_out` for a subscript,
// `anti-ν_e` for an antineutrino, `\|x\|` for an absolute value. Those become
// the notation exam papers use. They also carry provenance aimed at whoever
// maintains them -- links to README.md, to a PDF on one machine's C: drive,
// to verification reports -- which a student has no use for and must never
// be shown a local file path from.

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "bar"; text: string }
  | { kind: "nuclide"; mass: string; atomic: string; symbol: Inline[] }
  | { kind: "strong"; children: Inline[] }
  | { kind: "link"; href: string; children: Inline[] };

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; children: Inline[] }
  | { kind: "paragraph"; children: Inline[] }
  | { kind: "list"; items: Inline[][] }
  | { kind: "table"; head: Inline[][]; rows: Inline[][][] }
  | { kind: "figure"; figure: "circuit-symbols" };

// The syllabus renders its circuit-symbol sheet as two page images. They are
// Cambridge's printed pages and are not published with this public repo, so
// both are replaced by one figure the app draws itself.
const FIGURES: Record<string, "circuit-symbols"> = {
  "assets/syllabus-circuit-symbols-61.png": "circuit-symbols",
  "assets/syllabus-circuit-symbols-62.png": "circuit-symbols",
};

const MINUS = "−";

// ---- inline --------------------------------------------------------------

/** Letters and numbers from any script, so Greek symbols count as symbols. */
const WORD = /[\p{L}\p{N}]/u;

/**
 * Plain text to text, subscript and overbar nodes.
 *
 * `R_total` becomes R with a subscript "total"; `E_transferred_in` becomes E
 * with the subscript "transferred in". `anti-` directly before a single
 * particle letter becomes that letter with an overbar, so `anti-ν_e` reads
 * as ν̄ with subscript e. `anti-down` is an ordinary word and is left alone.
 */
export function symbols(text: string): Inline[] {
  const out: Inline[] = [];
  let plain = "";
  const flush = () => { if (plain) out.push({ kind: "text", text: plain }); plain = ""; };
  let i = 0;
  while (i < text.length) {
    const rest = text.slice(i);
    const anti = rest.match(/^anti-(\p{L})(?![\p{L}])/u);
    if (anti && (i === 0 || !WORD.test(text[i - 1]))) {
      flush();
      out.push({ kind: "bar", text: anti[1] });
      i += anti[0].length;
      continue;
    }
    const sub = rest.match(/^_([\p{L}\p{N}]+(?:_[\p{L}\p{N}]+)*)/u);
    // A subscript belongs to the symbol just before it: a letter or number
    // (R_total, ν_e after an overbar) or a closing bracket.
    const prev = i > 0 ? text[i - 1] : "";
    if (sub && (WORD.test(prev) || prev === ")")) {
      flush();
      out.push({ kind: "sub", text: sub[1].replace(/_/g, " ") });
      i += sub[0].length;
      continue;
    }
    plain += text[i];
    i += 1;
  }
  flush();
  return out;
}

const signed = (value: string) => value.replace(/^\((.*)\)$/, "$1").replace(/^-/, MINUS);

/**
 * A code span in these notes is always nuclide notation: `^A_Z X`, including
 * whole equations such as `^238_92 U → ^234_90 Th + ^4_2 α`. Parentheses in
 * `^(A−4)_(Z−2) Y` only grouped the shorthand and are dropped.
 */
export function nuclides(code: string): Inline[] {
  const out: Inline[] = [];
  const re = /\^(\([^)]*\)|[^_\s]+)_(\([^)]*\)|\S+?)\s+(\S+)/gu;
  let last = 0;
  for (const m of code.matchAll(re)) {
    if (m.index! > last) out.push(...symbols(code.slice(last, m.index)));
    out.push({ kind: "nuclide", mass: signed(m[1]), atomic: signed(m[2]), symbol: symbols(m[3]) });
    last = m.index! + m[0].length;
  }
  if (last < code.length) out.push(...symbols(code.slice(last)));
  return out;
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Inline markdown: code spans, bold, links, then the symbol rules on text. */
export function inline(source: string): Inline[] {
  const out: Inline[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of source.matchAll(re)) {
    if (m.index! > last) out.push(...symbols(source.slice(last, m.index)));
    if (m[1] !== undefined) out.push(...nuclides(m[1]));
    else if (m[2] !== undefined) out.push({ kind: "strong", children: inline(m[2]) });
    else if (isExternal(m[4])) out.push({ kind: "link", href: m[4], children: inline(m[3]) });
    // A relative or local link has nowhere to go inside the app; keep its words.
    else out.push(...inline(m[3]));
    last = m.index! + m[0].length;
  }
  if (last < source.length) out.push(...symbols(source.slice(last)));
  return out;
}

// ---- blocks ----------------------------------------------------------------

/** Table cells split on unescaped pipes; `\|` is a literal bar (|x|). */
export function cells(row: string): string[] {
  const inner = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, "|").trim());
}

const isTableRow = (line: string) => /^\s*\|.*\|\s*$/.test(line);
const isSeparator = (line: string) => /^\s*\|(\s*:?-{3,}:?\s*\|)+\s*$/.test(line);

/**
 * Whole paragraphs and sentences that are provenance for maintainers.
 * Topics 10 and 11 close with a paragraph that is nothing but source links;
 * topics 1 to 9 open with a useful syllabus reference followed by a pointer
 * to README.md, which is dropped while the reference is kept.
 */
export function forStudents(paragraph: string): string | null {
  if (/^Source:\s*\[/.test(paragraph)) return null;
  const kept = paragraph.replace(/\s*See \[source and scope\]\(README\.md\)\./g, "").trim();
  return kept || null;
}

export function parseNotes(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  let previous = -1;
  while (i < lines.length) {
    // Every pass must consume at least one line. A synchronous loop that does
    // not cannot be interrupted -- not by a test timeout, not by the browser --
    // so a future rule that forgets to advance throws here instead of hanging.
    if (i === previous) throw new Error(`notes parser made no progress at line ${i + 1}`);
    previous = i;
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length as 1 | 2 | 3, children: inline(heading[2]) });
      i++;
      continue;
    }

    const image = line.match(/^!\[[^\]]*\]\(([^)]+)\)\s*$/);
    if (image) {
      const figure = FIGURES[image[1]];
      // Two page images map to one drawn figure; emit it once.
      if (figure && !blocks.some((b) => b.kind === "figure" && b.figure === figure)) blocks.push({ kind: "figure", figure });
      i++;
      continue;
    }

    if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const head = cells(line).map(inline);
      const rows: Inline[][][] = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) rows.push(cells(lines[i++]).map(inline));
      blocks.push({ kind: "table", head, rows });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(inline(lines[i++].replace(/^\s*[-*]\s+/, "")));
      blocks.push({ kind: "list", items });
      continue;
    }

    // A paragraph runs until a blank line or the start of another block. Its
    // first line is taken unconditionally: every other kind of block has
    // already declined it, and a line nothing claims -- a table row with no
    // separator under it, say -- must still move the parser forward. Without
    // that, one malformed line froze the page in an endless loop.
    const text: string[] = [line.trim()];
    i++;
    while (
      i < lines.length && lines[i].trim() &&
      !/^#{1,3}\s/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^!\[/.test(lines[i]) && !isTableRow(lines[i])
    ) text.push(lines[i++].trim());
    const kept = forStudents(text.join(" "));
    if (kept) blocks.push({ kind: "paragraph", children: inline(kept) });
  }
  return blocks;
}

/** Everything a block tree would show as text, for tests and search. */
export function plainText(nodes: Inline[] | Block[]): string {
  return (nodes as Array<Inline | Block>).map((n): string => {
    switch (n.kind) {
      case "text": case "sub": case "bar": return n.text;
      case "nuclide": return `${n.mass}/${n.atomic} ${plainText(n.symbol)}`;
      case "strong": case "link": return plainText(n.children);
      // Blocks end in a line break so the text of one never runs into the next.
      case "heading": case "paragraph": return plainText(n.children) + "\n";
      case "list": return n.items.map((item) => plainText(item)).join("\n") + "\n";
      case "table": return [...n.head, ...n.rows.flat()].map((cell) => plainText(cell)).join(" | ") + "\n";
      case "figure": return `[${n.figure}]\n`;
    }
  }).join("");
}
