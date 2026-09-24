"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { criticalSpring, project, releaseVelocity, rubberband, settled } from "@/lib/gesture-physics";

// Below 900px the sidebar used to be display:none with nothing in its place,
// so on a phone or a portrait tablet there was no way to leave the screen the
// portal opened on. The same <aside> now becomes a drawer: opened from a menu
// button in the top bar, closed by choosing a destination, tapping the scrim,
// Escape, or dragging it back to the left.
//
// It moves like a held object rather than a scripted slide: the drag follows
// the finger 1:1 from wherever it was grabbed, a flick is judged by where it
// is heading rather than where it was let go, and the drawer can be caught
// and turned round mid-flight because every animation starts from its current
// position and speed. Critically damped, so it arrives without a bounce, in
// keeping with the rest of the app.

const NARROW = "(max-width: 900px)";
const REDUCED = "(prefers-reduced-motion: reduce)";
// Apple ships 0.3 s for drawers and sheets.
const RESPONSE = 0.3;
// Movement before a press becomes a drag, so a tap on a nav item stays a tap
// and a vertical scroll of a long nav stays a scroll.
const SLOP = 10;

type Phase = "closed" | "moving" | "open";

export function useNavDrawer() {
  const [narrow, setNarrow] = useState(false);
  const [phase, setPhase] = useState<Phase>("closed");
  const aside = useRef<HTMLElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  // The presentation value: where the drawer is on screen right now, in px
  // from fully open (0) to fully closed (-width).
  const x = useRef(0);
  const target = useRef(0);
  const frame = useRef(0);
  const drag = useRef<{
    id: number; startX: number; startY: number; from: number; width: number;
    active: boolean; samples: Array<{ x: number; t: number }>;
  } | null>(null);
  const justDragged = useRef(false);

  const width = () => aside.current?.offsetWidth || 320;

  const paint = useCallback((value: number) => {
    x.current = value;
    const el = aside.current;
    if (el) el.style.transform = `translateX(${value}px)`;
    if (scrim.current) {
      scrim.current.style.opacity = String(Math.min(1, Math.max(0, 1 + value / width())));
    }
  }, []);

  const rest = useCallback((open: boolean) => {
    cancelAnimationFrame(frame.current);
    if (open) {
      paint(0);
      setPhase("open");
    } else {
      x.current = -width();
      if (aside.current) aside.current.style.transform = "";
      if (scrim.current) scrim.current.style.opacity = "";
      setPhase("closed");
    }
  }, [paint]);

  const settle = useCallback((open: boolean, velocity = 0) => {
    cancelAnimationFrame(frame.current);
    if (window.matchMedia(REDUCED).matches) return rest(open);
    const from = x.current;
    const to = open ? 0 : -width();
    target.current = to;
    const started = performance.now();
    setPhase("moving");
    const step = (now: number) => {
      const s = criticalSpring(from, to, velocity, RESPONSE, (now - started) / 1000);
      // A hard flick can carry a critically damped spring past its target;
      // past fully open there is only the drawer's hidden edge to show.
      paint(Math.min(0, s.value));
      if (settled(s.value, s.velocity, to)) return rest(open);
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [paint, rest]);

  const open = useCallback(() => {
    if (phase === "closed") paint(-width());
    settle(true);
  }, [phase, paint, settle]);
  const close = useCallback(() => settle(false), [settle]);

  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const update = () => {
      setNarrow(query.matches);
      if (!query.matches) rest(false);
    };
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      cancelAnimationFrame(frame.current);
    };
  }, [rest]);

  const shown = narrow && phase !== "closed";
  const wasShown = useRef(false);
  useEffect(() => {
    if (shown && !wasShown.current) {
      const target = aside.current?.querySelector<HTMLElement>("nav button.active")
        || aside.current?.querySelector<HTMLElement>("button");
      target?.focus({ preventScroll: true });
    }
    if (!shown && wasShown.current) {
      const focused = document.activeElement;
      if (!focused || focused === document.body || aside.current?.contains(focused)) {
        menuButton.current?.focus({ preventScroll: true });
      }
    }
    wasShown.current = shown;
    if (!shown) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [shown, close]);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!narrow || phase === "closed") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Catching it mid-flight: stop where it is, not where it was going.
    cancelAnimationFrame(frame.current);
    drag.current = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY, from: x.current,
      width: width(), active: false, samples: [{ x: event.clientX, t: event.timeStamp }],
    };
    if (phase === "moving" && Math.abs(x.current - target.current) > 2) {
      // Visibly still travelling, so this press is a grab, not a tap on
      // whatever happens to be under it.
      drag.current.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    } else if (phase === "moving") {
      // Only the invisible tail of the spring was left; don't let it swallow
      // a tap on a nav item.
      rest(target.current === 0);
    }
  };
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (!d.active) {
      if (Math.abs(dy) > SLOP && Math.abs(dy) >= Math.abs(dx)) {
        drag.current = null; // a scroll, not a drag
        return;
      }
      if (Math.abs(dx) <= SLOP) return;
      // Start from here rather than jumping by the slop distance.
      d.active = true;
      d.startX = event.clientX;
      event.currentTarget.setPointerCapture(event.pointerId);
      setPhase("moving");
      return;
    }
    const raw = d.from + (event.clientX - d.startX);
    paint(raw > 0 ? rubberband(raw, d.width) : Math.max(raw, -d.width));
    d.samples.push({ x: event.clientX, t: event.timeStamp });
    if (d.samples.length > 8) d.samples.shift();
  };
  const onPointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    if (!d.active) return;
    justDragged.current = true;
    setTimeout(() => (justDragged.current = false), 0);
    // A finger held still sends no moves, so the release itself is the sample
    // that shows it stopped.
    d.samples.push({ x: event.clientX, t: event.timeStamp });
    const velocity = event.type === "pointercancel" ? 0 : releaseVelocity(d.samples);
    // Judge by where the flick is going, not where the finger stopped.
    settle(x.current + project(velocity) > -d.width / 2, velocity);
  };
  const gesture = {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
  };

  return {
    // Everything outside the drawer is inert while it is out, so Tab stays
    // inside it and a screen reader cannot wander behind the scrim.
    inertBehind: shown,
    menuButtonProps: {
      ref: menuButton,
      type: "button" as const,
      className: "nav-menu-button",
      "aria-label": "Open navigation",
      "aria-expanded": shown,
      "aria-controls": "portal-sidebar",
      onClick: open,
    },
    asideProps: {
      ref: aside,
      id: "portal-sidebar",
      "data-drawer": phase,
      ...(narrow ? { role: "dialog", "aria-modal": true, "aria-label": "Navigation" } : {}),
      ...gesture,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (narrow && !justDragged.current && (event.target as Element).closest("nav button")) close();
      },
    },
    scrimProps: {
      ref: scrim,
      className: "nav-scrim",
      "data-drawer": phase,
      "aria-hidden": true,
      ...gesture,
      onClick: () => {
        if (!justDragged.current) close();
      },
    },
  };
}
