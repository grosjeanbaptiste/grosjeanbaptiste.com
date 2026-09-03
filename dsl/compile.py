#!/usr/bin/env python3
"""End-to-end compiler for the .grosjean resume DSL.

Usage:
    python compile.py [SOURCE=resume.grosjean] [--out=../assets/data]

Reads SOURCE, parses to an AST, runs semantic validation, then writes
four artifacts under the output directory:

    resume.json                  — strict JSON Resume v1.0.0
    i18n/{fr,nl,es,de,zh}.json   — per-language overlays
    site-overrides.json          — hide/display overrides
    site-extras.json             — non-schema data (uses, notes, dailyLife)

Exits non-zero on parse or validation errors so CI can fail fast.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))

from parser import parse_file  # noqa: E402
from validators import validate  # noqa: E402
from compilers import jsonresume, i18n_overlays, site_overrides, site_extras  # noqa: E402


def _write_json(path: Path, data) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    previous = path.read_text() if path.exists() else ""
    if previous == encoded:
        return False
    path.write_text(encoded)
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("source", nargs="?", default=str(_HERE / "resume.grosjean"))
    ap.add_argument("--out", default=str(_HERE.parent / "assets" / "data"))
    args = ap.parse_args()

    source_path = Path(args.source)
    out_dir = Path(args.out)

    if not source_path.exists():
        print(f"error: source not found: {source_path}", file=sys.stderr)
        return 2

    resume = parse_file(source_path)

    errors = validate(resume)
    if errors:
        print(f"validation failed: {len(errors)} error(s)", file=sys.stderr)
        for e in errors:
            print(f"  {e}", file=sys.stderr)
        return 1

    written = 0

    if _write_json(out_dir / "resume.json", jsonresume.emit(resume)):
        written += 1
        print(f"resume.json")

    overlays = i18n_overlays.emit(resume)
    for lang, overlay in overlays.items():
        if not overlay:
            continue
        if _write_json(out_dir / "i18n" / f"{lang}.json", overlay):
            written += 1
            print(f"i18n/{lang}.json")

    if _write_json(out_dir / "site-overrides.json", site_overrides.emit(resume)):
        written += 1
        print(f"site-overrides.json")

    if _write_json(out_dir / "site-extras.json", site_extras.emit(resume)):
        written += 1
        print(f"site-extras.json")

    print(f"compile: {written} file(s) updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
