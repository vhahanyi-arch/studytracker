#!/usr/bin/env node
// Is a marker string served by the live site?
//
//   node check-live.mjs "<marker>" [page path ...]
//
// Fetches each page (default "/") from $SITE (default https://studytrack.win),
// then every /_next/static asset those pages reference, following references
// inside chunks up to six levels deep (lazy chunks). Prints the asset URLs
// containing the marker. Exit 0 = found, 1 = not found, 2 = usage error.

const [marker, ...paths] = process.argv.slice(2);
if (!marker) {
  console.error('usage: node check-live.mjs "<marker>" [page path ...]');
  process.exit(2);
}
const site = (process.env.SITE ?? "https://studytrack.win").replace(/\/$/, "");
const pages = paths.length ? paths : ["/"];

// Bypass edge caches: a fresh query string on every request.
const bust = `cb=${Date.now()}`;
async function get(url) {
  const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}${bust}`, { redirect: "follow" });
  return { status: res.status, text: await res.text() };
}

// Pages link "/_next/static/…"; Turbopack chunks name lazy chunks as "static/…".
const assetPattern = /(?:\/_next\/)?\bstatic\/[\w./-]+\.(?:js|css)\b/g;
const assetsIn = (text) =>
  new Set((text.match(assetPattern) ?? []).map((a) => `/_next/${a.replace(/^\/_next\//, "")}`));

const hits = [];
const seen = new Set();
let frontier = new Set();

for (const path of pages) {
  const { status, text } = await get(`${site}${path}`);
  console.log(`page ${path} -> ${status}`);
  if (text.includes(marker)) hits.push(`${site}${path}`);
  for (const a of assetsIn(text)) frontier.add(a);
}

for (let depth = 0; depth < 6 && frontier.size; depth++) {
  const next = new Set();
  await Promise.all(
    [...frontier].filter((a) => !seen.has(a)).map(async (asset) => {
      seen.add(asset);
      const { status, text } = await get(`${site}${asset}`);
      if (status !== 200) return;
      if (text.includes(marker)) hits.push(`${site}${asset}`);
      for (const a of assetsIn(text)) if (!seen.has(a)) next.add(a);
    }),
  );
  frontier = next;
}

console.log(`searched ${seen.size} assets on ${site} for ${JSON.stringify(marker)}`);
if (hits.length) {
  console.log(`FOUND in:\n${hits.map((h) => `  ${h}`).join("\n")}`);
  process.exit(0);
}
console.log("NOT FOUND");
process.exit(1);
