"""Emit the ``site-extras.json`` sidecar that carries every DSL
construct dropped from the strict JSON Resume payload.

Consumers (the Node HTML/XML pipelines) merge these back at render
time so the rendered CV shows per-work skill lists, per-education
notes, the daily-life chart data, etc.
"""

from __future__ import annotations

from typing import Any

from nodes import (
    Resume,
    Translated,
)


def _resolve_project_name(resume: Resume, ref_target: str) -> str:
    """Resolve a DSL project key (`ref X`) to its rendered ``name``."""
    for p in resume.projects:
        if p.key == ref_target and p.name:
            return p.name
    return ref_target


def _work_extras(resume: Resume) -> list[dict[str, Any]]:
    """Index-aligned with resume.work — nulls for entries that carry no
    extras. Index matching (rather than name matching) is essential
    because entries can share a ``company`` (e.g. two Xtrada roles).
    """
    out: list[dict[str, Any] | None] = []
    for w in resume.work:
        extras: dict[str, Any] = {}
        if w.uses:
            extras["skills"] = list(w.uses)
        if w.projects:
            # The Node pipeline stores work[].projects as bare name
            # strings, not objects — cross-refs are resolved by
            # ``name === n`` in the renderer.
            extras["projects"] = [
                _resolve_project_name(resume, ref.target) for ref in w.projects
            ]
        if w.client:
            # Consulting mission client (e.g. Xtrada → VhAuctions). Falls
            # into extras because JSON Resume has no dedicated slot; the
            # PDF/HTML renderers pick it up to distinguish "several roles
            # at same employer" from "several missions via a consulting
            # firm".
            if isinstance(w.client, Translated):
                extras["client"] = w.client.get("en")
            elif isinstance(w.client, str):
                extras["client"] = w.client
            else:
                extras["client"] = str(w.client)
        out.append(extras if extras else None)
    return _trim_trailing_nulls(out)


def _education_extras(resume: Resume) -> list[dict[str, Any] | None]:
    """Index-aligned with resume.education. Carries every field JSON
    Resume v1.0.0 does not define on education (``gpa`` from strict
    ``score``, ``summary``, ``skills``, ``projects``, empty ``courses``
    array) so the merged view stays byte-identical with the current
    hand-edited resume.json.
    """
    from nodes import Translated
    def _en(v):
        if v is None:
            return None
        return v.get("en") if isinstance(v, Translated) else v
    out: list[dict[str, Any] | None] = []
    for e in resume.education:
        extras: dict[str, Any] = {}
        if e.score is not None:
            extras["gpa"] = _en(e.score)
        if e.note is not None:
            extras["summary"] = _en(e.note)
        if e.uses:
            extras["skills"] = list(e.uses)
        if e.projects:
            extras["projects"] = [
                _resolve_project_name(resume, ref.target) for ref in e.projects
            ]
        extras["courses"] = list(e.courses) if e.courses else []
        out.append(extras)
    return _trim_trailing_nulls(out)


def _project_extras(resume: Resume) -> list[dict[str, Any] | None]:
    """Index-aligned with resume.projects."""
    out: list[dict[str, Any] | None] = []
    for p in resume.projects:
        from nodes import Translated
        summary_val = None
        if p.summary is not None:
            summary_val = p.summary.get("en") if isinstance(p.summary, Translated) else p.summary
        entry = {"summary": summary_val} if summary_val else None
        out.append(entry)
    return _trim_trailing_nulls(out)


def _trim_trailing_nulls(items: list) -> list:
    while items and items[-1] is None:
        items.pop()
    return items


def _hours_as_int_if_whole(h: float) -> float | int:
    return int(h) if h == int(h) else h


def _competitions(resume: Resume) -> list[dict[str, Any]]:
    def _text(v):
        if v is None:
            return None
        if isinstance(v, Translated):
            return v.get("en")
        if isinstance(v, str):
            return v
        return str(v)
    out = []
    for c in resume.competitions:
        entry: dict[str, Any] = {"key": c.key}
        if (val := _text(c.title)) is not None:
            entry["title"] = val
        if c.date and c.date.text:
            entry["date"] = c.date.text
        if (val := _text(c.organizer)) is not None:
            entry["organizer"] = val
        if (val := _text(c.summary)) is not None:
            entry["summary"] = val
        if (val := _text(c.url)) is not None:
            entry["url"] = val
        out.append(entry)
    return out


def _daily_life(resume: Resume) -> dict[str, Any] | None:
    if not resume.meta or not resume.meta.daily_life:
        return None
    return {
        "items": [
            {"key": item.key, "hours": _hours_as_int_if_whole(item.hours), "color": item.color}
            for item in resume.meta.daily_life
        ]
    }


def emit(resume: Resume) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "_note": "Generated from resume.grosjean by dsl/compile.py. Do not hand-edit.",
    }
    if (extras := _work_extras(resume)):
        payload["work"] = extras
    if (extras := _education_extras(resume)):
        payload["education"] = extras
    if (extras := _project_extras(resume)):
        payload["projects"] = extras
    if (daily := _daily_life(resume)) is not None:
        payload["dailyLife"] = daily
    if resume.competitions:
        payload["competitions"] = _competitions(resume)
    if resume.meta and resume.meta.brand_tokens:
        payload["brand"] = dict(resume.meta.brand_tokens)
    if resume.meta and resume.meta.section_order:
        payload["sectionOrder"] = list(resume.meta.section_order)
    if resume.meta and resume.meta.sidebar_order:
        payload["sidebarOrder"] = list(resume.meta.sidebar_order)
    return payload
