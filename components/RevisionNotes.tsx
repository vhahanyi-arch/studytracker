"use client";

import { useEffect, useState } from "react";
import { parseNotes, plainText, type Block, type Inline } from "@/lib/notes-markdown";
import { CircuitSymbols } from "@/components/CircuitSymbols";

// Renders one AS Physics topic's revision notes. The notes themselves live in
// docs/as-physics-notes/ and are about 87 KB together, so they are fetched as
// a separate chunk the first time a student opens any topic's notes, rather
// than shipping with every page load.

function Inlines({ nodes }: { nodes: Inline[] }) {
  return <>{nodes.map((node, index) => {
    switch (node.kind) {
      case "text": return <span key={index}>{node.text}</span>;
      case "sub": return <sub key={index}>{node.text}</sub>;
      // The overline is visual; screen readers get the word.
      case "bar": return <span key={index}><span className="visually-hidden">anti-</span><span className="overbar">{node.text}</span></span>;
      case "nuclide": {
        const symbol = plainText(node.symbol);
        return <span key={index} className="nuclide" role="img" aria-label={`${symbol}, nucleon number ${node.mass}, proton number ${node.atomic}`}>
          <span className="nuclide-numbers" aria-hidden="true"><span>{node.mass}</span><span>{node.atomic}</span></span>
          <span aria-hidden="true"><Inlines nodes={node.symbol} /></span>
        </span>;
      }
      case "strong": return <strong key={index}><Inlines nodes={node.children} /></strong>;
      case "link": return <a key={index} href={node.href} target="_blank" rel="noopener noreferrer"><Inlines nodes={node.children} /></a>;
    }
  })}</>;
}

/** The notes as rendered markup, given their markdown. Pure: no loading. */
export function NotesBody({ markdown, showTitle = false }: { markdown: string; showTitle?: boolean }) {
  // A parser error must not take the whole screen down with it.
  let blocks: Block[];
  try { blocks = parseNotes(markdown); }
  catch { return <p className="notes-status">These revision notes could not be displayed.</p>; }
  // The topic title normally sits in the panel header already.
  const body = !showTitle && blocks[0]?.kind === "heading" && blocks[0].level === 1 ? blocks.slice(1) : blocks;
  let section = "";
  return <article className="revision-notes">{body.map((block: Block, index) => {
    switch (block.kind) {
      case "heading": {
        section = plainText(block.children).trim();
        // One h1 per page belongs to the screen, so the notes start at h2.
        const Tag = (["h2", "h3", "h4"] as const)[block.level - 1];
        return <Tag key={index}><Inlines nodes={block.children} /></Tag>;
      }
      case "paragraph": return <p key={index}><Inlines nodes={block.children} /></p>;
      case "list": return <ul key={index}>{block.items.map((item, i) => <li key={i}><Inlines nodes={item} /></li>)}</ul>;
      case "table":
        // Formula tables are wider than a phone; the wrapper scrolls on its
        // own and can be reached by keyboard, instead of widening the page.
        return <div key={index} className="notes-table" role="region" aria-label={section || "Formula table"} tabIndex={0}>
          <table>
            <thead><tr>{block.head.map((cell, i) => <th key={i} scope="col"><Inlines nodes={cell} /></th>)}</tr></thead>
            <tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}><Inlines nodes={cell} /></td>)}</tr>)}</tbody>
          </table>
        </div>;
      case "figure": return <CircuitSymbols key={index} />;
    }
  })}</article>;
}

type Loaded = { state: "loading" } | { state: "ready"; markdown: string } | { state: "missing" } | { state: "failed" };

export function RevisionNotes({ unitId, showTitle = false }: { unitId: string; showTitle?: boolean }) {
  const [notes, setNotes] = useState<Loaded>({ state: "loading" });
  useEffect(() => {
    let live = true;
    setNotes({ state: "loading" });
    import("@/lib/as-physics-notes.generated")
      .then(({ asPhysicsNotes }) => {
        if (!live) return;
        const markdown = asPhysicsNotes[unitId];
        setNotes(markdown ? { state: "ready", markdown } : { state: "missing" });
      })
      .catch(() => { if (live) setNotes({ state: "failed" }); });
    return () => { live = false; };
  }, [unitId]);

  if (notes.state === "loading") return <p className="notes-status">Loading revision notes…</p>;
  if (notes.state === "missing") return <p className="notes-status">Revision notes for this topic are not available yet.</p>;
  if (notes.state === "failed") return <p className="notes-status">The revision notes could not be loaded. Check your connection and try again.</p>;
  return <NotesBody markdown={notes.markdown} showTitle={showTitle} />;
}
