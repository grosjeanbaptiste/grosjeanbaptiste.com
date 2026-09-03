"""Compile a validated :class:`nodes.Resume` into the strict JSON
Resume v1.0.0 payload written to ``assets/data/resume.json``.

Only fields defined by JSON Resume v1.0.0 are emitted here. Any
non-schema construct (per-work ``uses``, per-education ``note``,
``meta.dailyLife``, hide/display overrides, translated variants) is
silently dropped from this payload and picked up by the sister
compilers.
"""

from __future__ import annotations

from typing import Any

from nodes import (
    Basics,
    DateRange,
    Present,
    Resume,
    Translated,
    Value,
    WorkEntry,
)

_EN = "en"


def _text(v: Value | None) -> str | None:
    if v is None:
        return None
    if isinstance(v, Translated):
        return v.get(_EN)
    return str(v) if not isinstance(v, str) else v


def _date_iso(d) -> str:
    return d.iso() if d is not None else ""


def _period(rng: DateRange | None) -> tuple[str, str]:
    if rng is None:
        return ("", "")
    start = _date_iso(rng.start)
    end = "" if isinstance(rng.end, Present) else _date_iso(rng.end)
    return (start, end)


def _basics(b: Basics) -> dict[str, Any]:
    out: dict[str, Any] = {"name": b.name}
    if b.label:
        out["label"] = _text(b.label)
    if b.image:
        out["image"] = b.image
    if b.email:
        out["email"] = b.email
    if b.phone:
        out["phone"] = b.phone
    if b.url:
        out["url"] = b.url
    if b.summary:
        out["summary"] = _text(b.summary)
    if b.location:
        loc = {}
        if b.location.address:
            loc["address"] = _text(b.location.address)
        if b.location.postal_code:
            loc["postalCode"] = b.location.postal_code
        if b.location.city:
            loc["city"] = _text(b.location.city)
        if b.location.country_code:
            loc["countryCode"] = b.location.country_code
        if b.location.region:
            loc["region"] = _text(b.location.region)
        if loc:
            out["location"] = loc
    if b.profiles:
        out["profiles"] = []
        for p in b.profiles:
            entry = {"network": p.network, "url": p.url}
            if p.username:
                entry["username"] = p.username
            out["profiles"].append(entry)
    return out


def _work_entry(w: WorkEntry) -> dict[str, Any]:
    start, end = _period(w.period)
    entry: dict[str, Any] = {}
    if w.at:
        entry["company"] = _text(w.at)
    if w.position:
        entry["position"] = _text(w.position)
    if w.url:
        entry["url"] = w.url
    if w.location:
        entry["location"] = _text(w.location)
    if start:
        entry["startDate"] = start
    if end:
        entry["endDate"] = end
    if w.summary:
        entry["summary"] = _text(w.summary)
    if w.highlights:
        entry["highlights"] = [_text(h) for h in w.highlights]
    return entry


def _education_entry(e) -> dict[str, Any]:
    start, end = _period(e.period if e.period else None)
    entry: dict[str, Any] = {}
    if e.institution:
        entry["institution"] = _text(e.institution)
    if e.url:
        entry["url"] = e.url
    if e.study_type:
        entry["studyType"] = _text(e.study_type)
    if e.area:
        entry["area"] = _text(e.area)
    if start:
        entry["startDate"] = start
    if end:
        entry["endDate"] = end
    # `score` and `courses` are emitted by site_extras.py instead so the
    # merged view keeps the non-strict `gpa` name and the ubiquitous
    # empty `courses: []` array the pipeline expects.
    return entry


def _project_entry(p) -> dict[str, Any]:
    entry: dict[str, Any] = {}
    if p.name:
        entry["name"] = p.name
    if p.description:
        entry["description"] = _text(p.description)
    if p.highlights:
        entry["highlights"] = [_text(h) for h in p.highlights]
    if p.keywords:
        entry["keywords"] = list(p.keywords)
    if p.start_date:
        entry["startDate"] = _date_iso(p.start_date)
    if p.end_date:
        entry["endDate"] = _date_iso(p.end_date)
    if p.url:
        entry["url"] = p.url
    if p.type:
        entry["type"] = p.type
    if p.roles:
        entry["roles"] = list(p.roles)
    if p.entity:
        entry["entity"] = p.entity
    return entry


def _reference_entry(r) -> dict[str, Any]:
    entry: dict[str, Any] = {}
    if r.name:
        entry["name"] = _text(r.name)
    if r.quote:
        entry["reference"] = _text(r.quote)
    return entry


def _award_entry(a) -> dict[str, Any]:
    entry: dict[str, Any] = {}
    if a.title:
        entry["title"] = _text(a.title)
    if a.date:
        entry["date"] = _date_iso(a.date)
    if a.awarder:
        entry["awarder"] = _text(a.awarder)
    if a.summary:
        entry["summary"] = _text(a.summary)
    return entry


def _interest_entry(i) -> dict[str, Any]:
    entry: dict[str, Any] = {}
    if i.name:
        entry["name"] = _text(i.name)
    if i.keywords:
        entry["keywords"] = list(i.keywords)
    return entry


def _volunteer_entry(v) -> dict[str, Any]:
    start, end = _period(v.period)
    entry: dict[str, Any] = {}
    if v.organization:
        entry["organization"] = _text(v.organization)
    if v.position:
        entry["position"] = _text(v.position)
    if v.url:
        entry["url"] = v.url
    if start:
        entry["startDate"] = start
    if end:
        entry["endDate"] = end
    if v.summary:
        entry["summary"] = _text(v.summary)
    if v.highlights:
        entry["highlights"] = [_text(h) for h in v.highlights]
    return entry


def _skills(skills) -> list[dict[str, Any]]:
    if skills is None:
        return []
    out: list[dict[str, Any]] = []
    if skills.hard:
        out.append({"name": "HardSkills", "keywords": list(skills.hard)})
    if skills.soft:
        out.append({"name": "SoftSkills", "keywords": list(skills.soft)})
    if skills.learning:
        out.append({"name": "Learning", "keywords": list(skills.learning)})
    return out


def _languages(langs) -> list[dict[str, Any]]:
    out = []
    for lang in langs:
        display = _text(lang.language) if lang.language is not None else lang.key
        if isinstance(lang.fluency, str) and lang.fluency == "native":
            fluency = "Native Speaker"
        else:
            fluency = _text(lang.fluency) if lang.fluency is not None else ""
        out.append({"language": display, "fluency": fluency})
    return out


def emit(resume: Resume) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "meta": {
            "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
            "version": "v1.0.0",
            "canonical": "https://github.com/jsonresume/resume-schema/blob/v1.0.0/schema.json",
        },
    }
    if resume.meta and resume.meta.theme:
        payload["meta"]["theme"] = resume.meta.theme

    if resume.basics:
        payload["basics"] = _basics(resume.basics)

    if resume.work:
        payload["work"] = [_work_entry(w) for w in resume.work]

    if resume.education:
        payload["education"] = [_education_entry(e) for e in resume.education]

    if resume.projects:
        payload["projects"] = [_project_entry(p) for p in resume.projects]

    if resume.references:
        payload["references"] = [_reference_entry(r) for r in resume.references]

    if resume.skills:
        payload["skills"] = _skills(resume.skills)

    if resume.languages:
        payload["languages"] = _languages(resume.languages)

    if resume.awards:
        payload["awards"] = [_award_entry(a) for a in resume.awards]

    if resume.interests:
        payload["interests"] = [_interest_entry(i) for i in resume.interests]

    if resume.volunteer:
        payload["volunteer"] = [_volunteer_entry(v) for v in resume.volunteer]

    return payload
