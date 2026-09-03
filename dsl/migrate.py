#!/usr/bin/env python3
"""One-shot migration: assets/data/resume.json (+ overlays + overrides)
→ dsl/resume.grosjean skeleton.

The output is intentionally not idempotent-diff-clean; the goal is a
fast bootstrap that you then hand-review for idiomatic ordering and
naming. Cross-refs (work → projects) are guessed by name match.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

_HERE = Path(__file__).resolve().parent
DATA = _HERE.parent / "assets" / "data"
DEFAULT_OUT = _HERE / "resume.grosjean"
LANGS = ("fr", "nl", "es", "de", "zh")


def _slug(text: str) -> str:
    """Emit a CamelCase identifier stripped of diacritics and punctuation.

    ``"Université Saint-Louis - Bruxelles"`` → ``"UniversiteSaintLouisBruxelles"``.
    """
    if not text:
        return "Entry"
    # Strip accents (é → e), drop all non-alphanumerics as word separators,
    # then join the resulting words in CamelCase form.
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    words = re.split(r"[^A-Za-z0-9]+", ascii_text)
    camel = "".join(w[:1].upper() + w[1:] for w in words if w)
    if not camel:
        return "Entry"
    if camel[0].isdigit():
        camel = "_" + camel
    return camel


def _q(value: str) -> str:
    """Emit a DSL string literal — single-line if possible, else triple."""
    if value is None:
        return '""'
    if "\n" in value:
        # Triple-quoted, indented under the key.
        return '"""\n' + value.rstrip() + '\n"""'
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def _tr(canonical: str | None, overlays: dict[str, str | None]) -> str:
    """Emit t{ en: "..." fr: "..." } for a translated field."""
    variants = {"en": canonical}
    for lang, val in overlays.items():
        if val is not None:
            variants[lang] = val
    parts = []
    for lang, text in variants.items():
        parts.append(f"{lang}: {_q(text)}")
    return "t{ " + ", ".join(parts) + " }"


def _translated_or_plain(canonical: str | None, overlays: dict[str, str | None]) -> str:
    has_translation = any(v is not None for v in overlays.values())
    if canonical is None and not has_translation:
        return ""
    if not has_translation:
        return _q(canonical or "")
    return _tr(canonical, overlays)


def _load(path: Path) -> dict:
    return json.loads(path.read_text()) if path.exists() else {}


def _dedupe_key(base: str, taken: set[str]) -> str:
    if base not in taken:
        taken.add(base)
        return base
    for i in range(2, 100):
        candidate = f"{base}{i}"
        if candidate not in taken:
            taken.add(candidate)
            return candidate
    return base + "X"


def _period(entry: dict) -> str | None:
    start = entry.get("startDate")
    end = entry.get("endDate")
    if not start:
        return None
    if not end or end == "Present":
        return f"{start}..present"
    return f"{start}..{end}"


def _emit_basics(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    b = canonical.get("basics", {})
    if not b:
        return
    out.append("    basics {")
    out.append(f"        name {_q(b.get('name', ''))}")
    label_overlays = {lang: overlays.get(lang, {}).get("basics", {}).get("label") for lang in LANGS}
    out.append(f"        label {_translated_or_plain(b.get('label'), label_overlays)}")
    if b.get("image"):
        out.append(f"        image {_q(b['image'])}")
    if b.get("email"):
        out.append(f"        email {_q(b['email'])}")
    if b.get("phone"):
        out.append(f"        phone {_q(b['phone'])}")
    if b.get("url"):
        out.append(f"        url {_q(b['url'])}")

    loc = b.get("location") or {}
    if loc:
        out.append("        location {")
        loc_overlays = {lang: overlays.get(lang, {}).get("basics", {}).get("location") or {} for lang in LANGS}
        def _loc_field(key: str) -> dict:
            return {lang: loc_overlays[lang].get(key) for lang in LANGS}
        if loc.get("address"):
            out.append(f"            address {_translated_or_plain(loc.get('address'), _loc_field('address'))}")
        if loc.get("postalCode"):
            out.append(f"            postalCode {_q(loc['postalCode'])}")
        if loc.get("city"):
            out.append(f"            city {_translated_or_plain(loc.get('city'), _loc_field('city'))}")
        if loc.get("countryCode"):
            out.append(f"            countryCode {_q(loc['countryCode'])}")
        if loc.get("region"):
            out.append(f"            region {_translated_or_plain(loc.get('region'), _loc_field('region'))}")
        out.append("        }")

    for prof in b.get("profiles", []):
        # Preserve original casing but use a DSL-safe key (letters/digits/underscore).
        net = re.sub(r"[^A-Za-z0-9]+", "_", prof.get("network", "")).strip("_") or "link"
        line = f"        profile {net} {_q(prof.get('url', ''))}"
        if prof.get("username"):
            line += f" username {_q(prof['username'])}"
        out.append(line)

    summary_overlays = {lang: overlays.get(lang, {}).get("basics", {}).get("summary") for lang in LANGS}
    summary = b.get("summary")
    if summary or any(summary_overlays.values()):
        out.append(f"        summary {_translated_or_plain(summary, summary_overlays)}")
    out.append("    }\n")


def _overlay_field(overlays: dict[str, dict], section: str, idx: int, field: str) -> dict[str, str | None]:
    result = {}
    for lang in LANGS:
        section_list = overlays.get(lang, {}).get(section) or []
        entry = section_list[idx] if idx < len(section_list) else {}
        result[lang] = (entry or {}).get(field)
    return result


def _emit_work(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    entries = canonical.get("work", [])
    if not entries:
        return
    out.append("    work {")
    taken: set[str] = set()
    for idx, w in enumerate(entries):
        key = _dedupe_key(_slug(w.get("position") or w.get("company") or "Job"), taken)
        out.append(f"        {key} {{")
        out.append(f"            position {_translated_or_plain(w.get('position'), _overlay_field(overlays, 'work', idx, 'position'))}")
        if w.get("company"):
            out.append(f"            at {_translated_or_plain(w.get('company'), _overlay_field(overlays, 'work', idx, 'company'))}")
        if w.get("url"):
            out.append(f"            url {_q(w['url'])}")
        if w.get("location"):
            out.append(f"            location {_translated_or_plain(w.get('location'), _overlay_field(overlays, 'work', idx, 'location'))}")
        if (p := _period(w)):
            out.append(f"            period {p}")
        summary = w.get("summary")
        s_overlays = _overlay_field(overlays, "work", idx, "summary")
        if summary or any(s_overlays.values()):
            out.append(f"            summary {_translated_or_plain(summary, s_overlays)}")
        if w.get("highlights"):
            hl_items = ", ".join(_q(h) for h in w["highlights"])
            out.append(f"            highlights [{hl_items}]")
        if w.get("skills"):
            uses = ", ".join(_bare_or_string(s) for s in w["skills"])
            out.append(f"            uses [{uses}]")
        if w.get("projects"):
            names = []
            for proj in w["projects"]:
                if isinstance(proj, dict) and proj.get("name"):
                    names.append(_slug(proj["name"]))
                elif isinstance(proj, str):
                    names.append(_slug(proj))
            if names:
                items = ", ".join(f"ref {n}" for n in names)
                out.append(f"            projects [{items}]")
        out.append("        }")
    out.append("    }\n")


def _bare_or_string(s: str) -> str:
    if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", s):
        return s
    return _q(s)


def _emit_education(canonical: dict, overlays: dict[str, dict], overrides: dict, out: list[str]) -> None:
    entries = canonical.get("education", [])
    if not entries:
        return
    hidden_html = set((overrides.get("hideOnHtml") or {}).get("education") or [])
    hidden_pdf = set((overrides.get("hideOnPdf") or {}).get("education") or [])
    display_overrides = {
        p["match"]: p
        for p in (overrides.get("displayOverrides") or {}).get("education") or []
    }
    out.append("    education {")
    taken: set[str] = set()
    for idx, e in enumerate(entries):
        key = _dedupe_key(_slug(e.get("institution") or "Edu"), taken)
        inst = e.get("institution", "")
        flag_parts = []
        if inst in hidden_html and inst in hidden_pdf:
            flag_parts.append("hide on: both")
        elif inst in hidden_html:
            flag_parts.append("hide on: html")
        elif inst in hidden_pdf:
            flag_parts.append("hide on: pdf")
        flag = " ".join(flag_parts)
        out.append(f"        {key}{' ' + flag if flag else ''} {{")
        if e.get("institution"):
            out.append(f"            institution {_translated_or_plain(e.get('institution'), _overlay_field(overlays, 'education', idx, 'institution'))}")
        if e.get("url"):
            out.append(f"            url {_q(e['url'])}")
        if e.get("studyType"):
            out.append(f"            studyType {_translated_or_plain(e.get('studyType'), _overlay_field(overlays, 'education', idx, 'studyType'))}")
        if e.get("area"):
            out.append(f"            area {_translated_or_plain(e.get('area'), _overlay_field(overlays, 'education', idx, 'area'))}")
        if (p := _period(e)):
            out.append(f"            period {p}")
        # Emit inline display override from site-overrides.
        display = display_overrides.get(inst)
        if display and display.get("endDate"):
            start = e.get("startDate")
            override_end = display["endDate"]
            if start:
                out.append(f"            display period: {start}..{override_end}")
        if e.get("gpa"):
            out.append(f"            score {_translated_or_plain(e.get('gpa'), _overlay_field(overlays, 'education', idx, 'gpa'))}")
        note = e.get("summary")
        n_overlays = _overlay_field(overlays, "education", idx, "summary")
        if note or any(n_overlays.values()):
            out.append(f"            note {_translated_or_plain(note, n_overlays)}")
        if e.get("skills"):
            uses = ", ".join(_bare_or_string(s) for s in e["skills"])
            out.append(f"            uses [{uses}]")
        if e.get("projects"):
            refs = []
            for proj in e["projects"]:
                if isinstance(proj, dict) and proj.get("name"):
                    refs.append(_slug(proj["name"]))
                elif isinstance(proj, str):
                    refs.append(_slug(proj))
            if refs:
                out.append(f"            projects [{', '.join(f'ref {n}' for n in refs)}]")
        out.append("        }")
    out.append("    }\n")


def _emit_projects(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    entries = canonical.get("projects", [])
    if not entries:
        return
    out.append("    projects {")
    taken: set[str] = set()
    for idx, p in enumerate(entries):
        key = _dedupe_key(_slug(p.get("name") or "Project"), taken)
        out.append(f"        {key} {{")
        if p.get("name"):
            out.append(f"            name {_q(p['name'])}")
        desc = p.get("description")
        d_overlays = {lang: (overlays.get(lang, {}).get("projects") or [{}] * (idx + 1))[idx].get("description") if idx < len(overlays.get(lang, {}).get("projects") or []) else None for lang in LANGS}
        if desc or any(d_overlays.values()):
            out.append(f"            description {_translated_or_plain(desc, d_overlays)}")
        summary = p.get("summary")
        s_overlays = {lang: (overlays.get(lang, {}).get("projects") or [{}] * (idx + 1))[idx].get("summary") if idx < len(overlays.get(lang, {}).get("projects") or []) else None for lang in LANGS}
        if summary or any(s_overlays.values()):
            out.append(f"            summary {_translated_or_plain(summary, s_overlays)}")
        if p.get("keywords"):
            kws = ", ".join(_bare_or_string(k) for k in p["keywords"])
            out.append(f"            keywords [{kws}]")
        if p.get("startDate"):
            out.append(f"            startDate {p['startDate']}")
        if p.get("endDate"):
            out.append(f"            endDate {p['endDate']}")
        if p.get("url"):
            out.append(f"            url {_q(p['url'])}")
        if p.get("type"):
            out.append(f"            type {_q(p['type'])}")
        if p.get("roles"):
            roles = ", ".join(_bare_or_string(r) for r in p["roles"])
            out.append(f"            roles [{roles}]")
        if p.get("entity"):
            out.append(f"            entity {_q(p['entity'])}")
        out.append("        }")
    out.append("    }\n")


def _emit_references(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    entries = canonical.get("references", [])
    if not entries:
        return
    out.append("    references {")
    taken: set[str] = set()
    for idx, r in enumerate(entries):
        key = _dedupe_key(_slug(r.get("name", "").split(",")[0] or "Ref"), taken)
        out.append(f"        {key} {{")
        if r.get("name"):
            out.append(f"            name {_translated_or_plain(r.get('name'), _overlay_field(overlays, 'references', idx, 'name'))}")
        quote = r.get("reference")
        q_overlays = _overlay_field(overlays, "references", idx, "reference")
        if quote or any(q_overlays.values()):
            out.append(f"            quote {_translated_or_plain(quote, q_overlays)}")
        out.append("        }")
    out.append("    }\n")


def _emit_skills(canonical: dict, out: list[str]) -> None:
    skills = canonical.get("skills", [])
    if not skills:
        return
    out.append("    skills {")
    for s in skills:
        name = s.get("name", "")
        keywords = s.get("keywords", [])
        if not keywords:
            continue
        key = {"HardSkills": "hard", "SoftSkills": "soft", "Learning": "learning"}.get(name, name.lower())
        items = ", ".join(_bare_or_string(k) for k in keywords)
        out.append(f"        {key} [{items}]")
    out.append("    }\n")


def _emit_languages(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    entries = canonical.get("languages", [])
    if not entries:
        return
    out.append("    languages {")
    for idx, lang in enumerate(entries):
        name = lang.get("language", "Unknown")
        fluency = lang.get("fluency", "")
        key = _slug(name)
        name_overlays = _overlay_field(overlays, "languages", idx, "language")
        fluency_overlays = _overlay_field(overlays, "languages", idx, "fluency")
        has_name_tr = any(v is not None for v in name_overlays.values())
        has_fluency_tr = any(v is not None for v in fluency_overlays.values())
        if not (has_name_tr or has_fluency_tr):
            # Shorthand form when nothing needs translation.
            if fluency.lower() in {"native speaker", "native"}:
                out.append(f"        {key} native")
            else:
                out.append(f"        {key} {_q(fluency)}")
        else:
            out.append(f"        {key} {{")
            out.append(f"            language {_translated_or_plain(name, name_overlays)}")
            if fluency.lower() in {"native speaker", "native"} and not has_fluency_tr:
                out.append("            native")
            else:
                out.append(f"            fluency {_translated_or_plain(fluency, fluency_overlays)}")
            out.append("        }")
    out.append("    }\n")


def _emit_awards(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    entries = canonical.get("awards", [])
    if not entries:
        return
    out.append("    awards {")
    taken: set[str] = set()
    for idx, a in enumerate(entries):
        key = _dedupe_key(_slug(a.get("title", "Award")), taken)
        out.append(f"        {key} {{")
        if a.get("title"):
            out.append(f"            title {_translated_or_plain(a.get('title'), _overlay_field(overlays, 'awards', idx, 'title'))}")
        if a.get("date"):
            out.append(f"            date {a['date']}")
        if a.get("awarder"):
            out.append(f"            awarder {_translated_or_plain(a.get('awarder'), _overlay_field(overlays, 'awards', idx, 'awarder'))}")
        if a.get("summary"):
            out.append(f"            summary {_translated_or_plain(a.get('summary'), _overlay_field(overlays, 'awards', idx, 'summary'))}")
        out.append("        }")
    out.append("    }\n")


def _emit_interests(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    entries = canonical.get("interests", [])
    if not entries:
        return
    out.append("    interests {")
    taken: set[str] = set()
    for idx, i in enumerate(entries):
        key = _dedupe_key(_slug(i.get("name", "Interest")), taken)
        out.append(f"        {key} {{")
        if i.get("name"):
            out.append(f"            name {_translated_or_plain(i.get('name'), _overlay_field(overlays, 'interests', idx, 'name'))}")
        if i.get("keywords"):
            kws = ", ".join(_q(k) for k in i["keywords"])
            out.append(f"            keywords [{kws}]")
        out.append("        }")
    out.append("    }\n")


def _emit_volunteer(canonical: dict, overlays: dict[str, dict], out: list[str]) -> None:
    entries = canonical.get("volunteer", [])
    if not entries:
        return
    out.append("    volunteer {")
    taken: set[str] = set()
    for idx, v in enumerate(entries):
        key = _dedupe_key(_slug(v.get("position", "Vol")), taken)
        out.append(f"        {key} {{")
        if v.get("position"):
            out.append(f"            position {_translated_or_plain(v.get('position'), _overlay_field(overlays, 'volunteer', idx, 'position'))}")
        if v.get("organization"):
            out.append(f"            organization {_translated_or_plain(v.get('organization'), _overlay_field(overlays, 'volunteer', idx, 'organization'))}")
        if v.get("url"):
            out.append(f"            url {_q(v['url'])}")
        if (p := _period(v)):
            out.append(f"            period {p}")
        if v.get("summary"):
            out.append(f"            summary {_translated_or_plain(v.get('summary'), _overlay_field(overlays, 'volunteer', idx, 'summary'))}")
        if v.get("highlights"):
            hl = ", ".join(_q(h) for h in v["highlights"])
            out.append(f"            highlights [{hl}]")
        out.append("        }")
    out.append("    }\n")


def _emit_meta(canonical: dict, out: list[str]) -> None:
    meta = canonical.get("meta", {})
    theme = meta.get("theme")
    daily = meta.get("dailyLife", {}).get("items", [])
    if not (theme or daily):
        return
    out.append("    meta {")
    if theme:
        out.append(f"        theme {_q(theme)}")
    if daily:
        out.append("        dailyLife {")
        for item in daily:
            # dailyLife keys are lowercase identifiers matched by the
            # Node HTML template's t.dailyLifeLabels[key] lookup — leave
            # them alone (no CamelCase slugging).
            key = item.get("key", "x")
            out.append(f"            {key} {item.get('hours', 0)} color {_q(item.get('color', '#000000'))}")
        out.append("        }")
    out.append("    }\n")


_SECTION_BANNER = "    // ---------- {name} ----------"


def _banner(name: str, out: list[str]) -> None:
    out.append(_SECTION_BANNER.format(name=name))


def main() -> int:
    canonical = _load(DATA / "resume.json")
    overlays = {lang: _load(DATA / "i18n" / f"{lang}.json") for lang in LANGS}
    overrides = _load(DATA / "site-overrides.json")
    out: list[str] = []
    out.append('resume "grosjeanbaptiste" {\n')
    _banner("basics", out)
    _emit_basics(canonical, overlays, out)
    _banner("work", out)
    _emit_work(canonical, overlays, out)
    _banner("education", out)
    _emit_education(canonical, overlays, overrides, out)
    _banner("projects", out)
    _emit_projects(canonical, overlays, out)
    _banner("references", out)
    _emit_references(canonical, overlays, out)
    _banner("skills", out)
    _emit_skills(canonical, out)
    _banner("languages", out)
    _emit_languages(canonical, overlays, out)
    _banner("awards", out)
    _emit_awards(canonical, overlays, out)
    _banner("interests", out)
    _emit_interests(canonical, overlays, out)
    _banner("volunteer", out)
    _emit_volunteer(canonical, overlays, out)
    _banner("meta", out)
    _emit_meta(canonical, out)
    out.append("}\n")
    DEFAULT_OUT.write_text("\n".join(out))
    print(f"wrote {DEFAULT_OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
