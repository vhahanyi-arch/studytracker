import { flushSync } from "react-dom";

// Moving to another binder is a quiet fade: the screen you were on fades
// out quickly while the new one fades in and rises a few pixels into place
// (see "Changing binder" in globals.css). The browser's view transition
// takes a picture of the old screen, so the new one renders at full speed
// beneath it. Browsers without view transitions, and anyone who asks for
// reduced motion, get the new screen straight away.
type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

export function changeBinder(update: () => void) {
  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  const root = document.documentElement;
  root.classList.add("binder-change");
  const transition = doc.startViewTransition(() => flushSync(update));
  // A fade cut short (a second click before the first has finished, or the
  // tab going to the background) rejects `ready`. The screen has still
  // changed, so there is nothing to report.
  transition.ready.catch(() => {});
  transition.finished.finally(() => root.classList.remove("binder-change"));
}
