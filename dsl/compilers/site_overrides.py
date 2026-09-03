"""Compile hide/display overrides declared inline in .grosjean into
the sidecar ``assets/data/site-overrides.json`` consumed by the
existing Node pipeline.
"""

from __future__ import annotations

from typing import Any

from nodes import (
    Present,
    Resume,
)


def _hidden_by(section_entries, target: str) -> list[str]:
    """Return entry keys whose ``hide_on`` flag matches ``target``."""
    matches = []
    for e in section_entries:
        hide = getattr(e, "hide_on", None)
        if hide in {target, "both"}:
            matches.append(e.key)
    return matches


def _display_patches(entries) -> list[dict[str, Any]]:
    patches: list[dict[str, Any]] = []
    for e in entries:
        dp = getattr(e, "display_period", None)
        if dp is None:
            continue
        end = "" if isinstance(dp.end, Present) else dp.end.iso()
        patch: dict[str, Any] = {
            "match": e.key,
            "reason": "DSL display override",
        }
        if end:
            patch["endDate"] = end
        patches.append(patch)
    return patches


def _resolve_display_target(entries, key: str) -> str | None:
    """The pipeline matches by institution/name/company/title, not by
    DSL key. Return the canonical string used for matching.
    """
    for e in entries:
        if e.key == key:
            return getattr(e, "institution", None) or getattr(e, "name", None) or key
    return None


def emit(resume: Resume) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "_note": "Generated from resume.grosjean by dsl/compile.py. Do not hand-edit.",
        "hideOnHtml": {},
        "hideOnPdf": {},
        "displayOverrides": {},
    }

    # Hide by section.
    for section_name, entries in [
        ("work", resume.work),
        ("education", resume.education),
        ("projects", resume.projects),
        ("references", resume.references),
        ("volunteer", resume.volunteer),
        ("awards", resume.awards),
        ("interests", resume.interests),
    ]:
        hidden_html = []
        hidden_pdf = []
        for key in _hidden_by(entries, "html"):
            display_key = _resolve_display_target(entries, key) or key
            hidden_html.append(display_key)
        for key in _hidden_by(entries, "pdf"):
            display_key = _resolve_display_target(entries, key) or key
            hidden_pdf.append(display_key)
        if hidden_html:
            payload["hideOnHtml"][section_name] = hidden_html
        if hidden_pdf:
            payload["hideOnPdf"][section_name] = hidden_pdf

    # Display patches: only education for now (period overrides).
    patches = _display_patches(resume.education)
    # Rewrite `match` to institution string for pipeline compatibility.
    for p in patches:
        p["match"] = _resolve_display_target(resume.education, p["match"]) or p["match"]
    if patches:
        payload["displayOverrides"]["education"] = patches

    # Prune empty sections.
    if not payload["hideOnHtml"]:
        del payload["hideOnHtml"]
    if not payload["hideOnPdf"]:
        del payload["hideOnPdf"]
    if not payload["displayOverrides"]:
        del payload["displayOverrides"]

    return payload
