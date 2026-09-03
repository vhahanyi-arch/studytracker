from __future__ import annotations

import sys
from pathlib import Path

import pdfplumber


def audit(path: Path) -> None:
    print(f"\n=== {path.name} ===")
    with pdfplumber.open(path) as pdf:
        print(f"pages={len(pdf.pages)}")
        for page_number, page in enumerate(pdf.pages, 1):
            words = page.extract_words()
            header_words = [
                word
                for word in words
                if word["text"].lower()
                in {"question", "answer", "answers", "marks", "mark", "guidance", "partial"}
            ]
            rows: dict[int, list[dict]] = {}
            for word in words:
                key = round(float(word["top"]) / 3)
                rows.setdefault(key, []).append(word)
            headers = []
            for row in rows.values():
                text = " ".join(word["text"] for word in sorted(row, key=lambda item: item["x0"]))
                lower = text.lower()
                if lower.startswith("question") and ("answer" in lower or "marks" in lower):
                    headers.append((min(word["top"] for word in row), text))
            if not headers:
                continue
            print(f"page={page_number} size={page.width:.1f}x{page.height:.1f}")
            print(" headers:", headers[:2])
            print(
                " positions:",
                [(word["text"], round(word["x0"], 1), round(word["top"], 1)) for word in header_words],
            )
            header_top = headers[0][0]
            sample = []
            for row in sorted(rows.values(), key=lambda group: min(word["top"] for word in group)):
                top = min(word["top"] for word in row)
                if header_top < top < header_top + 115:
                    sample.append(
                        (
                            round(top, 1),
                            [(round(word["x0"], 1), word["text"]) for word in sorted(row, key=lambda item: item["x0"])],
                        )
                    )
            print(" sample:", sample[:8])


for value in sys.argv[1:]:
    audit(Path(value))
