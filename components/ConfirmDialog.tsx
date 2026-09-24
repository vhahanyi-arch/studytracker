"use client";
import { ModalScrim } from "./ModalScrim";

// Replaces window.confirm for actions students see immediately and that the
// teacher cannot take back. A browser prompt cannot show which students are
// affected, so it asks the teacher to approve a number with no way to check it.
export function ConfirmDialog({
  eyebrow,
  title,
  description,
  items,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items?: string[];
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ModalScrim onDismiss={() => !busy && onCancel()}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button type="button" className="x" onClick={onCancel} aria-label="Close">
          ×
        </button>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        <p>{description}</p>
        {items && items.length > 0 && (
          <ul className="confirm-dialog-items">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <div className="confirm-dialog-actions">
          <button type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </ModalScrim>
  );
}
