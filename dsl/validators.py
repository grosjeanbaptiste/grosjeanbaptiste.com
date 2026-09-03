"""Semantic validation of a parsed .grosjean :class:`nodes.Resume`.

Each :func:`validate` returns a list of :class:`ValidationError`. The
list is empty when the tree is semantically consistent.

Checks performed:
    * every ``Ref(target=…)`` inside a work / education entry resolves to
      a project entry with the same key;
    * every ``DateRange.start ≤ DateRange.end`` (Present > any date);
    * ``meta.dailyLife`` items sum to 24 hours;
    * every :class:`Translated` uses one of the accepted language codes
      (en, fr, nl, es, de, zh) and always defines ``en`` as a fallback.
"""

from __future__ import annotations

from dataclasses import dataclass

from nodes import (
    Date,
    DateRange,
    Present,
    Ref,
    Resume,
    Translated,
    Value,
)

_ACCEPTED_LANGS: frozenset[str] = frozenset({"en", "fr", "nl", "es", "de", "zh"})


@dataclass(frozen=True)
class ValidationError:
    section: str
    entry: str | None
    message: str

    def __str__(self) -> str:
        prefix = f"[{self.section}"
        prefix += f"/{self.entry}" if self.entry else ""
        prefix += "]"
        return f"{prefix} {self.message}"


def _iso(d: Date) -> str:
    return d.iso()


def _range_ok(rng: DateRange) -> bool:
    if isinstance(rng.end, Present):
        return True
    return _iso(rng.start) <= _iso(rng.end)


def _check_translation(value: Value, section: str, entry: str | None, field: str) -> list[ValidationError]:
    if not isinstance(value, Translated):
        return []
    errors: list[ValidationError] = []
    langs = {code for code, _ in value.variants}
    for code in langs:
        if code not in _ACCEPTED_LANGS:
            errors.append(
                ValidationError(
                    section=section,
                    entry=entry,
                    message=f"{field}: unknown language code {code!r}",
                )
            )
    if "en" not in langs:
        errors.append(
            ValidationError(
                section=section,
                entry=entry,
                message=f"{field}: missing English fallback (add en:\"…\")",
            )
        )
    return errors


def _walk_values(value: Value | None, section: str, entry: str | None, field: str) -> list[ValidationError]:
    if value is None:
        return []
    return _check_translation(value, section, entry, field)


def validate(resume: Resume) -> list[ValidationError]:
    errors: list[ValidationError] = []
    project_keys = {p.key for p in resume.projects}

    # basics translations
    if resume.basics is not None:
        errors.extend(_walk_values(resume.basics.label, "basics", None, "label"))
        errors.extend(_walk_values(resume.basics.summary, "basics", None, "summary"))

    # work entries
    for w in resume.work:
        errors.extend(_walk_values(w.position, "work", w.key, "position"))
        errors.extend(_walk_values(w.summary, "work", w.key, "summary"))
        for h in w.highlights:
            errors.extend(_walk_values(h, "work", w.key, "highlight"))
        if w.period and not _range_ok(w.period):
            errors.append(
                ValidationError(
                    section="work",
                    entry=w.key,
                    message=f"period start {w.period.start.text} > end {getattr(w.period.end, 'text', 'present')}",
                )
            )
        for ref in w.projects:
            if isinstance(ref, Ref) and ref.target not in project_keys:
                errors.append(
                    ValidationError(
                        section="work",
                        entry=w.key,
                        message=f"projects: unresolved ref to {ref.target!r} (add project entry)",
                    )
                )

    # education
    for e in resume.education:
        errors.extend(_walk_values(e.note, "education", e.key, "note"))
        if e.period and not _range_ok(e.period):
            errors.append(
                ValidationError(
                    section="education",
                    entry=e.key,
                    message=f"period start {e.period.start.text} > end {getattr(e.period.end, 'text', 'present')}",
                )
            )
        if e.display_period and not _range_ok(e.display_period):
            errors.append(
                ValidationError(
                    section="education",
                    entry=e.key,
                    message="display_period start > end",
                )
            )
        for ref in e.projects:
            if isinstance(ref, Ref) and ref.target not in project_keys:
                errors.append(
                    ValidationError(
                        section="education",
                        entry=e.key,
                        message=f"projects: unresolved ref to {ref.target!r}",
                    )
                )

    # projects
    for p in resume.projects:
        errors.extend(_walk_values(p.description, "projects", p.key, "description"))
        errors.extend(_walk_values(p.summary, "projects", p.key, "summary"))
        for h in p.highlights:
            errors.extend(_walk_values(h, "projects", p.key, "highlight"))
        if p.start_date and p.end_date and _iso(p.start_date) > _iso(p.end_date):
            errors.append(
                ValidationError(
                    section="projects",
                    entry=p.key,
                    message=f"startDate {p.start_date.text} > endDate {p.end_date.text}",
                )
            )

    # references
    for r in resume.references:
        errors.extend(_walk_values(r.quote, "references", r.key, "quote"))

    # awards
    for a in resume.awards:
        errors.extend(_walk_values(a.title, "awards", a.key, "title"))
        errors.extend(_walk_values(a.summary, "awards", a.key, "summary"))

    # interests
    for i in resume.interests:
        errors.extend(_walk_values(i.name, "interests", i.key, "name"))

    # volunteer
    for v in resume.volunteer:
        errors.extend(_walk_values(v.position, "volunteer", v.key, "position"))
        errors.extend(_walk_values(v.summary, "volunteer", v.key, "summary"))
        if v.period and not _range_ok(v.period):
            errors.append(
                ValidationError(
                    section="volunteer",
                    entry=v.key,
                    message=f"period start {v.period.start.text} > end {getattr(v.period.end, 'text', 'present')}",
                )
            )

    # meta.dailyLife sum-to-24h
    if resume.meta and resume.meta.daily_life:
        total = sum(item.hours for item in resume.meta.daily_life)
        if abs(total - 24) > 0.001:
            errors.append(
                ValidationError(
                    section="meta.dailyLife",
                    entry=None,
                    message=f"hours sum to {total}, expected 24",
                )
            )

    return errors
