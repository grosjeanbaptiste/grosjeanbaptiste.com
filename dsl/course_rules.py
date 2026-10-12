"""What a degree may name: its projects among the CV's projects, its courses
among the CV's courses. A course is never a project, so each list refuses a
key of the other kind and says which section the key belongs to."""

from __future__ import annotations

from nodes import EducationEntry, Ref, Resume


def _misfiled(listed, own: set[str], other: set[str], field: str, other_kind: str) -> list[str]:
    messages = []
    for ref in listed:
        if not isinstance(ref, Ref) or ref.target in own:
            continue
        if ref.target in other:
            messages.append(f"{field}: {ref.target!r} is a {other_kind} (list it under its own field)")
        else:
            messages.append(f"{field}: unresolved ref to {ref.target!r}")
    return messages


def _block_messages(degree: EducationEntry) -> list[str]:
    """A block files courses the degree lists, each under one block only."""
    listed = {ref.target for ref in degree.courses if isinstance(ref, Ref)}
    filed: dict[str, str] = {}
    messages = []
    for block in degree.blocks:
        for ref in block.units:
            if ref.target not in listed:
                messages.append(
                    f"block {block.key}: unit {ref.target!r} is not among the degree's courses"
                )
            elif ref.target in filed:
                messages.append(
                    f"unit {ref.target!r} is filed under two blocks ({filed[ref.target]}, {block.key})"
                )
            filed.setdefault(ref.target, block.key)
    return messages


def degree_messages(resume: Resume, degree: EducationEntry) -> list[str]:
    projects = {p.key for p in resume.projects}
    courses = {c.key for c in resume.courses}
    return [
        *_misfiled(degree.projects, projects, courses, "projects", "course"),
        *_misfiled(degree.courses, courses, projects, "courses", "project"),
        *_block_messages(degree),
    ]
