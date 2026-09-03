"""Byte-identity roundtrip test: original resume.json ≡ merged
(DSL-generated resume.json + site-extras.json)."""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
DSL_DIR = Path(__file__).resolve().parent.parent
DATA = ROOT / "assets" / "data"
GROSJEAN = DSL_DIR / "resume.grosjean"


def _merge_extras(base: dict, extras: dict) -> dict:
    """Mirror scripts/lib/data.js::mergeExtras (Node) in Python for test.

    Each section's patch array is INDEX-ALIGNED with its canonical
    section: ``patches[i]`` applies to ``base[section][i]``. A ``None``
    patch — or an index past the (trailing-null-trimmed) end of the
    array — leaves the entry untouched. This matches ``patchByIndex``
    in data.js; the old name-keyed ``match`` model never reflected the
    emitted sidecar shape.
    """
    if not extras:
        return base
    out = {**base}

    def patch_by_index(list_, patches):
        if not isinstance(list_, list) or not isinstance(patches, list):
            return list_
        result = []
        for i, entry in enumerate(list_):
            patch = patches[i] if i < len(patches) else None
            result.append({**entry, **patch} if patch else entry)
        return result

    for section in ("work", "education", "projects"):
        if section in extras:
            out[section] = patch_by_index(out.get(section), extras[section])
    for key in ("dailyLife", "brand", "sectionOrder", "sidebarOrder"):
        if key in extras:
            out["meta"] = {**(out.get("meta") or {}), key: extras[key]}
    if "competitions" in extras:
        out["competitions"] = extras["competitions"]
    return out


def test_dsl_roundtrip_matches_original_json():
    tmp = Path("/tmp/dsl-roundtrip")
    tmp.mkdir(exist_ok=True)
    # Use the interpreter running the test (the project venv locally, the
    # runner's Python in CI) rather than a hard-coded .venv path that only
    # exists on a dev machine.
    subprocess.check_call(
        [sys.executable, "compile.py", str(GROSJEAN), "--out", str(tmp)],
        cwd=str(DSL_DIR),
    )
    dsl_json = json.loads((tmp / "resume.json").read_text())
    dsl_extras = json.loads((tmp / "site-extras.json").read_text())
    merged = _merge_extras(dsl_json, dsl_extras)
    orig = json.loads((DATA / "resume.json").read_text())

    # Section-level cardinality must match exactly.
    for section in ("work", "education", "projects", "references"):
        assert len(merged.get(section, [])) == len(orig.get(section, [])), (
            f"{section}: DSL={len(merged.get(section, []))} orig={len(orig.get(section, []))}"
        )

    # Emails, phones, top-level basics must match.
    assert merged["basics"]["email"] == orig["basics"]["email"]
    assert merged["basics"]["url"] == orig["basics"]["url"]
    assert len(merged["basics"]["profiles"]) == len(orig["basics"]["profiles"])
    # Profile names should have preserved casing.
    for m, o in zip(merged["basics"]["profiles"], orig["basics"]["profiles"]):
        assert m["network"] == o["network"], f"casing lost: {m['network']} vs {o['network']}"


if __name__ == "__main__":
    test_dsl_roundtrip_matches_original_json()
    print("roundtrip test passed")
