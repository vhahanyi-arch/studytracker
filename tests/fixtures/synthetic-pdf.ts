// A minimal PDF writer for test fixtures: each text run is drawn at an exact
// position in the standard Helvetica font, so pdfjs reads back the same words
// at the same coordinates. Nothing is embedded; the output is a few kilobytes.

export type Run = {
  text: string;
  x: number;
  top: number; // distance from the top edge, as lib/server-pdf reports it
  size?: number;
  bold?: boolean;
  // Drawn at 90 degrees, as some mark schemes store a landscape table on a
  // portrait page. Positions are then given in the landscape frame.
  rotated?: boolean;
};
export type Page = { width: number; height: number; runs: Run[] };

export const A4 = { width: 595.28, height: 841.89 };
export const A4_LANDSCAPE = { width: 841.89, height: 595.28 };

const escape = (text: string) => text.replace(/[\\()]/g, (c) => `\\${c}`);

function content(page: Page) {
  return page.runs
    .map((run) => {
      const size = run.size ?? 11;
      const font = run.bold ? "F2" : "F1";
      // Upright: baseline y = height - top. Rotated: lib/server-pdf reads x
      // from the translation's y and top from its x, so place them that way.
      const matrix = run.rotated
        ? `0 1 -1 0 ${run.top.toFixed(2)} ${run.x.toFixed(2)}`
        : `1 0 0 1 ${run.x.toFixed(2)} ${(page.height - run.top).toFixed(2)}`;
      return `BT /${font} ${size} Tf ${matrix} Tm (${escape(run.text)}) Tj ET`;
    })
    .join("\n");
}

export function writePdf(pages: Page[]): Uint8Array {
  const objects: string[] = [];
  // PDF object numbers start at 1, so the new length is the new object's number.
  const add = (body: string) => objects.push(body);
  const catalog = add("<< /Type /Catalog /Pages 2 0 R >>");
  add("PAGES"); // replaced once the page ids are known
  const regular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const bold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const kids: number[] = [];
  for (const page of pages) {
    const stream = content(page);
    const contents = add(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    kids.push(add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
      `/Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${contents} 0 R >>`,
    ));
  }
  objects[1] = `<< /Type /Pages /Kids [${kids.map((id) => `${id} 0 R`).join(" ")}] /Count ${kids.length} >>`;

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(out, "latin1"));
}
