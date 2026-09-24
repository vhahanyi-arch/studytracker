"use client";
import { useEffect, useRef } from "react";

// The dimmed layer behind every portal dialog, and the behaviour that makes it
// one. Each modal used to be a bare <div onMouseDown={close}>, which meant:
//  - Escape did nothing, and keyboard focus stayed on the page behind, so Tab
//    walked through controls hidden under the scrim;
//  - the page behind still scrolled under a finger;
//  - it closed on the *press*, so a slip onto the scrim threw away a
//    half-filled form, and a text selection dragged out of a field that ended
//    over the scrim closed it too.
// Now a press only closes it if it both starts and ends on the scrim -- tap
// feedback on the way down, commitment on the way up -- and Escape, focus
// and scrolling behave as they do in a native sheet.

const open: HTMLElement[] = [];
// The page's own overflow, saved when the first dialog opens and put back
// when the last one closes, whatever order they close in.
let pageOverflow = "";
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ModalScrim({
  className,
  onDismiss,
  children,
}: {
  className?: string;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const scrim = useRef<HTMLDivElement>(null);
  const pressedScrim = useRef(false);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    const layer = scrim.current!;
    const dialog = layer.firstElementChild as HTMLElement | null;
    const opener = document.activeElement as HTMLElement | null;
    open.push(layer);

    // Name the dialog after its heading if the caller did not.
    if (dialog) {
      if (!dialog.getAttribute("role")) dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      const heading = dialog.querySelector("h2, h3");
      if (heading && !dialog.hasAttribute("aria-label") && !dialog.hasAttribute("aria-labelledby")) {
        heading.id ||= `dialog-${Math.random().toString(36).slice(2)}`;
        dialog.setAttribute("aria-labelledby", heading.id);
      }
      // Focus the dialog itself, not its first field: on a phone that would
      // throw the keyboard up over the form before anyone has read it.
      if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");
      dialog.focus({ preventScroll: true });
    }

    const root = document.documentElement;
    if (open.length === 1) pageOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (open[open.length - 1] !== layer) return; // only the topmost dialog answers
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss.current();
      } else if (event.key === "Tab" && dialog) {
        const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!items.length) return event.preventDefault();
        const first = items[0];
        const last = items[items.length - 1];
        const at = document.activeElement;
        if (event.shiftKey && (at === first || at === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (at === last || !dialog.contains(at))) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      open.splice(open.indexOf(layer), 1);
      if (!open.length) root.style.overflow = pageOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div
      ref={scrim}
      className={className ? `portal-modal ${className}` : "portal-modal"}
      onPointerDown={(event) => {
        pressedScrim.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedScrim.current && event.target === event.currentTarget) dismiss.current();
        pressedScrim.current = false;
      }}
    >
      {children}
    </div>
  );
}
