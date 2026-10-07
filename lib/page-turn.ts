import { flushSync } from "react-dom";

// Moving to another binder turns the page: the screen you were on lifts at
// its right edge and swings away over the rail, and the new one is already
// underneath (see "Turning a page" in globals.css). The browser's view
// transition takes a picture of the old page, so the new one renders at
// full speed beneath it. Browsers without view transitions, and anyone who
// asks for reduced motion, get the new screen straight away.
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

export function turnPage(update: () => void) {
  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  const root = document.documentElement;
  root.classList.add("page-turn");
  doc
    .startViewTransition(() => flushSync(update))
    .finished.finally(() => root.classList.remove("page-turn"));
}
