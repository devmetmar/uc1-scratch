"""
Extract figure pages from UC1 Draft Report into public/figures/.
Renders pages that contain Figure captions (vector diagrams included).
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import pymupdf

PDF = Path(
    r"C:\Users\yothu\Downloads\tyo\2026\ft-big-data-ai\preparation\UC1 - Report.pdf"
)
OUT = Path(
    r"C:\Users\yothu\Downloads\tyo\2026\ft-big-data-ai\learn-uc1-web\public\figures"
)
# Skip front-matter TOC pages that only list figures (keep real content pages)
SKIP_PAGES = set(range(1, 10))  # 1-indexed
# Appendix auto-corr pages still useful
ZOOM = 1.7  # ~122 dpi * 1.7 ≈ decent web sharpness
JPEG_QUALITY = 82

# Heuristic module tags from caption keywords / figure numbers
MODULE_RULES: list[tuple[re.Pattern[str], list[str]]] = [
    (re.compile(r"Figure\s+(1|2|3|4|5|6)\b", re.I), ["u05", "u02"]),
    (re.compile(r"Figure\s+(7|8|9|10|11|12|13)\b", re.I), ["u04", "u05"]),
    (re.compile(r"Figure\s+(14|15|16)\b", re.I), ["u03"]),
    (re.compile(r"Figure\s+(1[7-9]|2[0-9]|3[0-3])\b", re.I), ["u06"]),
    (re.compile(r"Figure\s+(3[4-9]|4[0-9]|5[0-5])\b", re.I), ["u07"]),
    (re.compile(r"Figure\s+(5[6-9])\b", re.I), ["u11"]),
    (re.compile(r"Figure\s+(6[0-5])\b", re.I), ["u08"]),
    (re.compile(r"Figure\s+(6[6-9]|7[01])\b", re.I), ["u09", "f08", "f09"]),
    (re.compile(r"Figure\s+(7[2-5])\b", re.I), ["u10", "f10"]),
    (re.compile(r"Figure\s+(7[6-9])\b", re.I), ["u06"]),
]

cap_re = re.compile(r"^(Figure|Fig\.)\s+\d+", re.I)
any_fig_re = re.compile(r"Figure\s+(\d+)", re.I)


def modules_for_captions(caps: list[str]) -> list[str]:
    found: set[str] = set()
    blob = " ".join(caps)
    for pat, mods in MODULE_RULES:
        if pat.search(blob):
            found.update(mods)
    # fallback by first figure number on page
    m = any_fig_re.search(blob)
    if not found and m:
        n = int(m.group(1))
        if n <= 6:
            found.update(["u05", "u02"])
        elif n <= 13:
            found.update(["u04"])
        elif n <= 16:
            found.update(["u03"])
        elif n <= 33:
            found.update(["u06"])
        elif n <= 55:
            found.update(["u07"])
        elif n <= 59:
            found.update(["u11"])
        elif n <= 65:
            found.update(["u08"])
        elif n <= 71:
            found.update(["u09", "f09"])
        elif n <= 75:
            found.update(["u10"])
        else:
            found.update(["u06"])
    return sorted(found)


def clean_caption(line: str) -> str:
    line = line.replace("\u0000", "").strip()
    # drop trailing page-number dots from TOC-style lines
    line = re.sub(r"\s*\.{2,}\s*\d+\s*$", "", line)
    return re.sub(r"\s+", " ", line).strip()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # clear previous extracted pages
    for old in OUT.glob("p*.jpg"):
        old.unlink()
    for old in OUT.glob("manifest.json"):
        old.unlink()

    doc = pymupdf.open(PDF)
    entries: list[dict] = []
    mat = pymupdf.Matrix(ZOOM, ZOOM)

    for i, page in enumerate(doc):
        page_no = i + 1
        if page_no in SKIP_PAGES:
            continue
        text = page.get_text()
        caps: list[str] = []
        for line in text.splitlines():
            s = line.strip()
            if cap_re.search(s) and "....." not in s:
                caps.append(clean_caption(s))
        # also accept "Figure N -" mid-paragraph starts rarely; prefer lines starting Figure
        if not caps:
            continue

        # dedupe captions
        seen = set()
        uniq = []
        for c in caps:
            key = c[:80].lower()
            if key not in seen:
                seen.add(key)
                uniq.append(c)
        caps = uniq

        fname = f"p{page_no:02d}.jpg"
        out_path = OUT / fname
        pix = page.get_pixmap(matrix=mat, alpha=False)
        pix.save(str(out_path), jpg_quality=JPEG_QUALITY)

        mods = modules_for_captions(caps)
        entries.append(
            {
                "id": f"p{page_no:02d}",
                "file": f"figures/{fname}",
                "page": page_no,
                "captions": caps,
                "modules": mods,
                "source": "UC1 Draft Report Issue 3.0 (CLS-M2P3-0379-B1-TN)",
            }
        )
        print(f"wrote {fname} modules={mods} caps={len(caps)}")

    manifest = {
        "source": "UC1 – Draft Report, CLS-M2P3-0379-B1-TN, Issue 3.0 – 12/06/2026",
        "note": "Internal CLS figures for learning use. Rendered from report pages containing figure captions.",
        "figures": entries,
    }
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    total_kb = sum((OUT / Path(e["file"]).name).stat().st_size for e in entries) / 1024
    print(f"done figures={len(entries)} total≈{total_kb:.0f} KB")


if __name__ == "__main__":
    main()
