// The StudyTrack mark and the portal's one icon set, shared by the portal,
// the sign-in screen and the public front page.

// The mark is a ring-binder board with three dividers stepping down its fore
// edge, in the Stage 7, Stage 8 and IGCSE Physics colours: the same tabs the
// sidebar uses to say which class you are in.
export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="17" y="3" width="12" height="8" rx="1.5" fill="#f2c230" />
      <rect x="17" y="12" width="12" height="8" rx="1.5" fill="#e2622a" />
      <rect x="17" y="21" width="12" height="8" rx="1.5" fill="#0d7f7d" />
      <rect className="brand-mark-board" x="2" y="2" width="22" height="28" rx="2.5" />
      <circle className="brand-mark-hole" cx="7" cy="9" r="1.6" />
      <circle className="brand-mark-hole" cx="7" cy="23" r="1.6" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="brand">
      <BrandMark />
      <div>
        <b>StudyTrack</b>
        <small>Cambridge learner planner</small>
      </div>
    </div>
  );
}

// One icon set for the whole portal: a single 24x24 grid, one stroke weight,
// drawn in currentColor. This replaces a run of glyphs pulled from four
// different typefaces -- a house, two bare digits, an atom, a full-colour
// emoji, a geometric block, a tick and a chess pawn -- which sat on different
// baselines and rendered differently on every OS.
const navIcons: Record<string, React.ReactNode> = {
  home: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" />,
  stage7: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><text x="12" y="15.8" textAnchor="middle" fill="currentColor" stroke="none">7</text></>,
  stage8: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><text x="12" y="15.8" textAnchor="middle" fill="currentColor" stroke="none">8</text></>,
  stage9: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><text x="12" y="15.8" textAnchor="middle" fill="currentColor" stroke="none">9</text></>,
  // The same boxed-token mark as the stages above: all five Cambridge levels
  // read as one family, with the group heading and accent carrying the
  // subject. An atom was tried first and collapsed into an unreadable blob at
  // the 18px the sidebar actually renders at.
  igcse: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><text x="12" y="15.6" textAnchor="middle" fill="currentColor" stroke="none" className="pair">IG</text></>,
  as: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><text x="12" y="15.6" textAnchor="middle" fill="currentColor" stroke="none" className="pair">AS</text></>,
  exam: <><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  progress: <><path d="M4 4v16h16" /><path d="m7.5 14.5 3.5-4 3 2.4 4.5-6" /></>,
  papers: <><rect x="3.5" y="6.5" width="12" height="14" rx="2.5" /><path d="M8 6.5v-2a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2.5" /></>,
  marking: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.4 2.4 4.6-5" /></>,
  students: <><circle cx="9.5" cy="8" r="3.2" /><path d="M3.8 19.2a5.7 5.7 0 0 1 11.4 0" /><path d="M16.4 5.6a3.2 3.2 0 0 1 0 4.8" /><path d="M17.6 13.6a5 5 0 0 1 2.9 4.2" /></>,
};

export function NavIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {navIcons[name]}
    </svg>
  );
}
