import { ImageResponse } from "next/og";

// The link preview for studytrack.win, drawn from the site itself: the
// graphite cover, the front page's headline, and the five level tabs
// stepping down the fore edge in their divider colours. Generated at build
// time, so it changes when the design does.
export const alt = "StudyTrack: your Cambridge maths and physics, in one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COVER = "#24292e";
const TABS = [
  { name: "Stage 7", code: "0862", board: "#e3b341", ink: "#16181a" },
  { name: "Stage 8", code: "0862", board: "#d4693e", ink: "#16181a" },
  { name: "Stage 9", code: "0862", board: "#8f4a2b", ink: "#ffffff" },
  { name: "IGCSE", code: "0625", board: "#167a78", ink: "#ffffff" },
  { name: "AS Level", code: "9702", board: "#3446a8", ink: "#ffffff" },
];
const HEADLINE = "Your Cambridge maths and physics, in one place.";
const SUBLINE = "Lower Secondary · IGCSE · AS Level";

// Satori needs TTF or OTF data, not the WOFF2 next/font serves, so each
// face is fetched from Google Fonts with only the characters drawn here.
// The image is built at deploy time; a slow font server must not fail the
// build, so a fetch is tried twice and then the face is left out, and the
// image falls back to next/og's own font.
async function fetchFont(family: string, weight: number, text: string) {
  const query = `family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`Google Fonts returned no TTF for ${family} ${weight}`);
  return (await fetch(url)).arrayBuffer();
}

async function googleFont(family: string, weight: number, text: string) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await fetchFont(family, weight, text);
    } catch (error) {
      console.warn(`[og] ${family} ${weight}, attempt ${attempt}:`, error instanceof Error ? error.message : error);
    }
  }
  return null;
}

export default async function Image() {
  const words = `StudyTrack${HEADLINE}${SUBLINE}${TABS.map((tab) => tab.name).join("")}`;
  const figures = TABS.map((tab) => tab.code).join("");
  const [archivoHeavy, archivoMedium, nunito] = await Promise.all([
    googleFont("Archivo", 800, words),
    googleFont("Archivo", 500, words),
    googleFont("Nunito", 800, figures),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: COVER, position: "relative", fontFamily: "Archivo" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px", width: 900 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox="0 0 32 32">
              <rect x="17" y="3" width="12" height="8" rx="1.5" fill="#e3b341" />
              <rect x="17" y="12" width="12" height="8" rx="1.5" fill="#d4693e" />
              <rect x="17" y="21" width="12" height="8" rx="1.5" fill="#167a78" />
              <rect x="2" y="2" width="22" height="28" rx="2.5" fill="#eef0f1" />
              <circle cx="7" cy="9" r="1.6" fill={COVER} />
              <circle cx="7" cy="23" r="1.6" fill={COVER} />
            </svg>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>StudyTrack</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 0.98, color: "#ffffff", letterSpacing: "-0.035em", maxWidth: 780 }}>
              {HEADLINE}
            </div>
            <div style={{ fontSize: 30, fontWeight: 500, color: "#c9cfd5" }}>{SUBLINE}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "absolute", right: 0, top: 96 }}>
          {TABS.map((tab) => (
            <div
              key={tab.name}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                width: 236,
                height: 78,
                padding: "0 24px",
                background: tab.board,
                color: tab.ink,
                borderRadius: "6px 0 0 6px",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>{tab.name}</div>
              <div style={{ fontFamily: "Nunito", fontSize: 24, fontWeight: 800 }}>{tab.code}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        archivoHeavy && { name: "Archivo", data: archivoHeavy, weight: 800 as const, style: "normal" as const },
        archivoMedium && { name: "Archivo", data: archivoMedium, weight: 500 as const, style: "normal" as const },
        nunito && { name: "Nunito", data: nunito, weight: 800 as const, style: "normal" as const },
      ].filter((font) => font !== null),
    },
  );
}
