import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProgressReportPdf, clean, escapePdf } from "../../lib/report-pdf";
import { extractPdfPages } from "../../lib/server-pdf";

const physicsReport = (mode: "structured" | "multiple_choice") =>
  buildProgressReportPdf({
    student: "Zoë Müller",
    title: "Forces (part 1)",
    syllabus: "9702",
    date: "12 October 2026",
    score: 3,
    maximum: 5,
    mode,
    overallFeedback: "Use g = 9.81 m s⁻² and give R in Ω.",
    questions: [
      { label: "1", topic: "Kinematics", studentAnswer: "3.0 × 10⁸ m/s²", correctAnswer: "3.0 × 10⁸ m/s²", correct: true, score: 2, maximum: 2 },
      { label: "2", topic: "Electricity", studentAnswer: "4.7 kΩ", correctAnswer: "½ × 2 μF", correct: false, score: 1, maximum: 3, feedback: "ΔV = −5 V, so θ ≈ 30°" },
    ],
  });

// pdf.js reads the font's micro sign back as Greek mu; both mean the same.
const textOf = async (pdf: Buffer) =>
  (await extractPdfPages(new Uint8Array(pdf)))
    .flatMap((page) => page.words.map((word) => word.text))
    .join(" ")
    .replace(/μ/g, "µ");

test("the report keeps physics symbols that the font can draw", async () => {
  const text = await textOf(physicsReport("structured"));
  for (const expected of ["Zoë Müller", "3.0 × 10^8 m/s²", "½ × 2 µF"])
    assert.ok(text.includes(expected), `missing "${expected}" in: ${text}`);
  assert.ok(text.includes("delta V = -5 V, so theta ~ 30°"), text);
  assert.ok(text.includes("4.7 kohm"), text);
  assert.ok(text.includes("m s^-2 and give R in ohm"), text);
});

test("the multiple-choice table keeps the symbols too", async () => {
  const text = await textOf(physicsReport("multiple_choice"));
  assert.ok(text.includes("3.0 × 10^8 m/s²"), text);
  assert.ok(text.includes("4.7 kohm"), text);
});

test("the file stays 7-bit, with a WinAnsi font and a valid cross-reference table", () => {
  const pdf = physicsReport("structured");
  assert.ok(pdf.every((byte) => byte < 0x80), "non-ASCII byte in the PDF");
  const source = pdf.toString("latin1");
  assert.equal(source.match(/\/Encoding \/WinAnsiEncoding/g)?.length, 2);
  const xref = Number(source.match(/startxref\n(\d+)/)![1]);
  assert.equal(source.slice(xref, xref + 4), "xref");
  const offsets = [...source.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((match) => Number(match[1]));
  offsets.forEach((offset, index) => assert.ok(source.startsWith(`${index + 1} 0 obj`, offset), `object ${index + 1}`));
});

test("clean spells out what the font cannot draw and keeps what it can", () => {
  assert.equal(clean("R = 5 Ω"), "R = 5 ohm");
  assert.equal(clean("R = 5 Ω"), "R = 5 ohm");
  assert.equal(clean("x ≤ −3"), "x <= -3");
  assert.equal(clean("2 μm"), "2 µm");
  assert.equal(clean("v₀ → v₁"), "v0 -> v1");
  assert.equal(clean("“quoted” – ok…"), "“quoted” – ok…");
  assert.equal(clean("a b\tc\n d"), "a b c d");
  assert.equal(clean("a s⁻², 10¹⁰ m, 4 m² and 2³"), "a s^-2, 10^10 m, 4 m² and 2³");
  assert.equal(clean("李"), "?");
});

test("escapePdf escapes PDF syntax and writes other glyphs as octal bytes", () => {
  assert.equal(escapePdf("f(x) \\ y"), "f\\(x\\) \\\\ y");
  assert.equal(escapePdf("3 × 2²"), "3 \\327 2\\262");
  assert.equal(escapePdf("“a”"), "\\223a\\224");
});
