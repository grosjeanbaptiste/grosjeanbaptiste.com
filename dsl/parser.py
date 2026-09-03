"""Lark-based parser for the .grosjean resume DSL.

Public API:
    parse(source: str)      -> Resume
    parse_file(path: Path)  -> Resume

Both return a :class:`nodes.Resume` tree. Every AST node carries the
source position of its opening token so downstream compilers can point
at the offending clause on error.
"""
# ruff: noqa: ARG002

from __future__ import annotations

import textwrap
from pathlib import Path

from lark import Lark, Token, Transformer, v_args

from nodes import (
    AwardEntry,
    CompetitionEntry,
    Basics,
    DailyItem,
    Date,
    DateRange,
    EducationEntry,
    InterestEntry,
    LanguageEntry,
    Location,
    Meta,
    Position,
    Present,
    Profile,
    ProjectEntry,
    Ref,
    ReferenceEntry,
    Resume,
    Skills,
    Translated,
    VolunteerEntry,
    WorkEntry,
)

_GRAMMAR_PATH = Path(__file__).parent / "grammar.lark"


def _strip_string(raw: str) -> str:
    # Turn a Lark STRING token into its Python string value. Handles
    # single-quoted "..." and triple-quoted """...""" variants;
    # triple-quoted values are dedented and their leading/trailing
    # blank lines trimmed.
    if raw.startswith('"""') and raw.endswith('"""'):
        inner = raw[3:-3]
        # Preserve intentional newlines but strip the boilerplate of a
        # multi-line block opened right after """ and closed on its own
        # line before """.
        if inner.startswith("\n"):
            inner = inner[1:]
        if inner.endswith("\n"):
            inner = inner[:-1]
        return textwrap.dedent(inner)
    inner = raw[1:-1]
    # Process only backslash escapes; leave every other unicode char
    # untouched (bytes().decode("unicode_escape") double-encodes UTF-8).
    out: list[str] = []
    i = 0
    while i < len(inner):
        ch = inner[i]
        if ch == "\\" and i + 1 < len(inner):
            nxt = inner[i + 1]
            out.append({"n": "\n", "t": "\t", "r": "\r", '"': '"', "\\": "\\"}.get(nxt, nxt))
            i += 2
        else:
            out.append(ch)
            i += 1
    return "".join(out)


def _pos(meta) -> Position | None:
    if meta is None or not hasattr(meta, "line"):
        return None
    return Position(line=meta.line, column=meta.column)


@v_args(meta=True)
class _Builder(Transformer):
    # -----------------------------------------------------------------
    # Root
    # -----------------------------------------------------------------

    def start(self, meta, children):
        return children[0]

    def resume(self, meta, children):
        key = _strip_string(children[0])
        sections = children[1:]
        buckets: dict[str, list] = {}
        singletons: dict = {}
        for sec in sections:
            kind, value = sec
            if kind in {"basics", "skills", "meta"}:
                singletons[kind] = value
            else:
                buckets.setdefault(kind, []).extend(value)
        return Resume(
            src=_pos(meta),
            key=key,
            basics=singletons.get("basics"),
            work=tuple(buckets.get("work", ())),
            education=tuple(buckets.get("education", ())),
            projects=tuple(buckets.get("projects", ())),
            references=tuple(buckets.get("references", ())),
            skills=singletons.get("skills"),
            languages=tuple(buckets.get("languages", ())),
            awards=tuple(buckets.get("awards", ())),
            competitions=tuple(buckets.get("competitions", ())),
            interests=tuple(buckets.get("interests", ())),
            volunteer=tuple(buckets.get("volunteer", ())),
            meta=singletons.get("meta"),
        )

    def section(self, meta, children):
        return children[0]

    # -----------------------------------------------------------------
    # basics
    # -----------------------------------------------------------------

    def basics_section(self, meta, children):
        fields: dict = {}
        profiles: list = []
        location = None
        for key, value in children:
            if key == "__profiles__":
                profiles.extend(value)
            elif key == "__location__":
                location = value
            else:
                fields[key] = value
        return (
            "basics",
            Basics(src=_pos(meta), location=location, profiles=tuple(profiles), **fields),
        )

    def basics_name(self, meta, children):
        return ("name", children[0])

    def basics_label(self, meta, children):
        return ("label", children[0])

    def basics_image(self, meta, children):
        return ("image", children[0])

    def basics_email(self, meta, children):
        return ("email", children[0])

    def basics_phone(self, meta, children):
        return ("phone", children[0])

    def basics_url(self, meta, children):
        return ("url", children[0])

    def basics_summary(self, meta, children):
        return ("summary", children[0])

    def basics_location(self, meta, children):
        loc = Location(src=_pos(meta), **dict(children))
        return ("__location__", loc)

    def basics_profile(self, meta, children):
        network = str(children[0])
        url = children[1]
        username = children[2] if len(children) >= 3 else None
        # profiles is a repeating field; collect them under a sentinel key
        return (
            "__profiles__",
            [Profile(src=_pos(meta), network=network, url=url, username=username)],
        )

    def location_address(self, meta, children):
        return ("address", children[0])

    def location_postal(self, meta, children):
        return ("postal_code", children[0])

    def location_city(self, meta, children):
        return ("city", children[0])

    def location_country_code(self, meta, children):
        return ("country_code", children[0])

    def location_region(self, meta, children):
        return ("region", children[0])

    # -----------------------------------------------------------------
    # work
    # -----------------------------------------------------------------

    def work_section(self, meta, children):
        return ("work", children)

    def work_entry(self, meta, children):
        key = str(children[0])
        hide_on = None
        rest = children[1:]
        if rest and isinstance(rest[0], tuple) and rest[0][0] == "__hide__":
            hide_on = rest[0][1]
            rest = rest[1:]
        fields = dict(rest)
        return WorkEntry(src=_pos(meta), key=key, hide_on=hide_on, **fields)

    def work_position(self, meta, children):
        return ("position", children[0])

    def work_at(self, meta, children):
        return ("at", children[0])

    def work_client(self, meta, children):
        return ("client", children[0])

    def work_url(self, meta, children):
        return ("url", children[0])

    def work_location(self, meta, children):
        return ("location", children[0])

    def work_period(self, meta, children):
        return ("period", children[0])

    def work_summary(self, meta, children):
        return ("summary", children[0])

    def work_highlights(self, meta, children):
        return ("highlights", tuple(children[0]))

    def work_uses(self, meta, children):
        return ("uses", tuple(children[0]))

    def work_projects(self, meta, children):
        return ("projects", tuple(children[0]))

    # -----------------------------------------------------------------
    # education
    # -----------------------------------------------------------------

    def education_section(self, meta, children):
        return ("education", children)

    def education_entry(self, meta, children):
        key = str(children[0])
        hide_on = None
        rest = children[1:]
        if rest and isinstance(rest[0], tuple) and rest[0][0] == "__hide__":
            hide_on = rest[0][1]
            rest = rest[1:]
        fields = dict(rest)
        return EducationEntry(src=_pos(meta), key=key, hide_on=hide_on, **fields)

    def edu_institution(self, meta, children):
        return ("institution", children[0])

    def edu_url(self, meta, children):
        return ("url", children[0])

    def edu_studytype(self, meta, children):
        return ("study_type", children[0])

    def edu_area(self, meta, children):
        return ("area", children[0])

    def edu_period(self, meta, children):
        return ("period", children[0])

    def edu_score(self, meta, children):
        return ("score", children[0])

    def edu_note(self, meta, children):
        return ("note", children[0])

    def edu_courses(self, meta, children):
        return ("courses", tuple(children[0]))

    def edu_uses(self, meta, children):
        return ("uses", tuple(children[0]))

    def edu_projects(self, meta, children):
        return ("projects", tuple(children[0]))

    def edu_display(self, meta, children):
        # children[0] is a dict of override fields
        return ("display_period", children[0])

    def display_period(self, meta, children):
        return children[0]

    # -----------------------------------------------------------------
    # projects
    # -----------------------------------------------------------------

    def projects_section(self, meta, children):
        return ("projects", children)

    def project_entry(self, meta, children):
        key = str(children[0])
        fields = dict(children[1:])
        return ProjectEntry(src=_pos(meta), key=key, **fields)

    def proj_name(self, meta, children):
        return ("name", children[0])

    def proj_description(self, meta, children):
        return ("description", children[0])

    def proj_summary(self, meta, children):
        return ("summary", children[0])

    def proj_highlights(self, meta, children):
        return ("highlights", tuple(children[0]))

    def proj_keywords(self, meta, children):
        return ("keywords", tuple(children[0]))

    def proj_start(self, meta, children):
        return ("start_date", Date(text=str(children[0])))

    def proj_end(self, meta, children):
        return ("end_date", Date(text=str(children[0])))

    def proj_url(self, meta, children):
        return ("url", children[0])

    def proj_type(self, meta, children):
        return ("type", children[0])

    def proj_roles(self, meta, children):
        return ("roles", tuple(children[0]))

    def proj_entity(self, meta, children):
        return ("entity", children[0])

    # -----------------------------------------------------------------
    # references
    # -----------------------------------------------------------------

    def references_section(self, meta, children):
        return ("references", children)

    def reference_entry(self, meta, children):
        key = str(children[0])
        fields = dict(children[1:])
        return ReferenceEntry(src=_pos(meta), key=key, **fields)

    def ref_name(self, meta, children):
        return ("name", children[0])

    def ref_quote(self, meta, children):
        return ("quote", children[0])

    # -----------------------------------------------------------------
    # skills / languages
    # -----------------------------------------------------------------

    def skills_section(self, meta, children):
        fields = dict(children)
        return ("skills", Skills(src=_pos(meta), **fields))

    def skills_hard(self, meta, children):
        return ("hard", tuple(children[0]))

    def skills_soft(self, meta, children):
        return ("soft", tuple(children[0]))

    def skills_learning(self, meta, children):
        return ("learning", tuple(children[0]))

    def languages_section(self, meta, children):
        return ("languages", children)

    def lang_short(self, meta, children):
        key = str(children[0])
        fluency = children[1]
        return LanguageEntry(src=_pos(meta), key=key, fluency=fluency)

    def lang_block(self, meta, children):
        key = str(children[0])
        fields: dict = {}
        for name, val in children[1:]:
            fields[name] = val
        return LanguageEntry(src=_pos(meta), key=key, **fields)

    def lang_display(self, meta, children):
        return ("language", children[0])

    def lang_fluency(self, meta, children):
        return ("fluency", children[0])

    def lang_native_flag(self, meta, children):
        return ("fluency", "native")

    def lang_native(self, meta, children):
        return "native"

    def lang_level_string(self, meta, children):
        return _strip_string(children[0])

    def lang_level_translation(self, meta, children):
        return children[0]

    # -----------------------------------------------------------------
    # awards / interests / volunteer
    # -----------------------------------------------------------------

    def awards_section(self, meta, children):
        return ("awards", children)

    def award_entry(self, meta, children):
        key = str(children[0])
        fields = dict(children[1:])
        return AwardEntry(src=_pos(meta), key=key, **fields)

    def award_title(self, meta, children):
        return ("title", children[0])

    def award_date(self, meta, children):
        return ("date", Date(text=str(children[0])))

    def award_awarder(self, meta, children):
        return ("awarder", children[0])

    def award_summary(self, meta, children):
        return ("summary", children[0])

    def competitions_section(self, meta, children):
        return ("competitions", children)

    def competition_entry(self, meta, children):
        key = str(children[0])
        fields = dict(children[1:])
        return CompetitionEntry(src=_pos(meta), key=key, **fields)

    def comp_title(self, meta, children):
        return ("title", children[0])

    def comp_date(self, meta, children):
        return ("date", Date(text=str(children[0])))

    def comp_organizer(self, meta, children):
        return ("organizer", children[0])

    def comp_summary(self, meta, children):
        return ("summary", children[0])

    def comp_url(self, meta, children):
        return ("url", children[0])

    def interests_section(self, meta, children):
        return ("interests", children)

    def interest_entry(self, meta, children):
        key = str(children[0])
        fields = dict(children[1:])
        return InterestEntry(src=_pos(meta), key=key, **fields)

    def interest_name(self, meta, children):
        return ("name", children[0])

    def interest_keywords(self, meta, children):
        return ("keywords", tuple(children[0]))

    def volunteer_section(self, meta, children):
        return ("volunteer", children)

    def volunteer_entry(self, meta, children):
        key = str(children[0])
        fields = dict(children[1:])
        return VolunteerEntry(src=_pos(meta), key=key, **fields)

    def vol_position(self, meta, children):
        return ("position", children[0])

    def vol_org(self, meta, children):
        return ("organization", children[0])

    def vol_url(self, meta, children):
        return ("url", children[0])

    def vol_period(self, meta, children):
        return ("period", children[0])

    def vol_summary(self, meta, children):
        return ("summary", children[0])

    def vol_highlights(self, meta, children):
        return ("highlights", tuple(children[0]))

    # -----------------------------------------------------------------
    # meta / dailyLife
    # -----------------------------------------------------------------

    def meta_section(self, meta, children):
        fields = dict(children)
        return ("meta", Meta(src=_pos(meta), **fields))

    def meta_theme(self, meta, children):
        return ("theme", children[0])

    def meta_daily(self, meta, children):
        return ("daily_life", tuple(children))

    def meta_brand(self, meta, children):
        return ("brand_tokens", tuple(children))

    def brand_field(self, meta, children):
        return (str(children[0]), _strip_string(children[1]))

    def meta_section_order(self, meta, children):
        return ("section_order", tuple(children))

    def meta_sidebar_order(self, meta, children):
        return ("sidebar_order", tuple(children))

    def section_name(self, meta, children):
        return str(children[0])

    def daily_item(self, meta, children):
        key = str(children[0])
        hours = float(children[1])
        color = _strip_string(children[2])
        return DailyItem(src=_pos(meta), key=key, hours=hours, color=color)

    # -----------------------------------------------------------------
    # Shared: values, arrays, dates, translations, refs, flags
    # -----------------------------------------------------------------

    def value(self, meta, children):
        return children[0]

    def plain_string(self, meta, children):
        return _strip_string(children[0])

    def t_string(self, meta, children):
        return children[0]

    def num_lit(self, meta, children):
        s = str(children[0])
        return float(s) if "." in s else int(s)

    def bool_lit(self, meta, children):
        return str(children[0]) == "true"

    def bare_name(self, meta, children):
        return str(children[0])

    def ref_value(self, meta, children):
        return children[0]

    def translation(self, meta, children):
        variants = tuple(children)
        return Translated(src=_pos(meta), variants=variants)

    def translation_entry(self, meta, children):
        code = str(children[0])
        text = _strip_string(children[1])
        return (code, text)

    def array(self, meta, children):
        return list(children)

    def empty_array(self, meta, children):
        return []

    def arr_string(self, meta, children):
        return _strip_string(children[0])

    def arr_name(self, meta, children):
        return str(children[0])

    def arr_ref(self, meta, children):
        return children[0]

    def arr_num(self, meta, children):
        s = str(children[0])
        return float(s) if "." in s else int(s)

    def ref_expr(self, meta, children):
        return Ref(src=_pos(meta), target=str(children[0]))

    def date_range(self, meta, children):
        return DateRange(src=_pos(meta), start=children[0], end=children[1])

    def ds_date(self, meta, children):
        return Date(text=str(children[0]))

    def de_date(self, meta, children):
        return Date(text=str(children[0]))

    def de_present(self, meta, children):
        return Present(src=_pos(meta))

    def hide_flag(self, meta, children):
        # children[0] is the TARGET token
        return ("__hide__", str(children[0]))


def _load_parser() -> Lark:
    return Lark(_GRAMMAR_PATH.read_text(), parser="lalr", propagate_positions=True)


_PARSER = _load_parser()


def parse(source: str) -> Resume:
    tree = _PARSER.parse(source)
    return _Builder().transform(tree)


def parse_file(path: Path | str) -> Resume:
    return parse(Path(path).read_text())
