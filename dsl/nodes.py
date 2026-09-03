"""AST for the .grosjean resume DSL.

Every node is a frozen dataclass. Immutability keeps compilers simple
(no mutation-based rewrites) and hashable, so intermediate results can
be memoised in tests. Nodes inherit from :class:`Node` which carries
an optional :class:`Position` for error reporting.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Union


# ---------------------------------------------------------------------------
# Base + shared scalars
# ---------------------------------------------------------------------------


@dataclass(frozen=True, kw_only=True)
class Position:
    """One-indexed source location."""

    line: int
    column: int


@dataclass(frozen=True, kw_only=True)
class Node:
    """Common ancestor for every AST node."""

    src: Position | None = field(default=None, kw_only=True, compare=False)


@dataclass(frozen=True, kw_only=True)
class Translated(Node):
    """`t{ lang: "text", ... }` — locale-tagged string."""

    variants: tuple[tuple[str, str], ...]

    def get(self, lang: str, fallback: str = "en") -> str:
        variants = dict(self.variants)
        return variants.get(lang, variants.get(fallback, ""))


# A string in the DSL can be either monolingual or translated. Scalars are
# strings, numbers, booleans, ref-expressions, or bare identifiers.
Value = Union[str, "Translated", "Ref", int, float, bool]


@dataclass(frozen=True, kw_only=True)
class Ref(Node):
    """`ref NAME` — cross-reference to a named entry."""

    target: str


@dataclass(frozen=True, kw_only=True)
class Date(Node):
    """ISO-8601 partial date: YYYY-MM or YYYY-MM-DD."""

    text: str  # keep raw form for round-tripping

    def iso(self) -> str:
        # Normalise YYYY-MM to YYYY-MM-01 for JSON Resume compliance.
        return self.text if len(self.text) == 10 else f"{self.text}-01"


@dataclass(frozen=True, kw_only=True)
class Present(Node):
    """The `present` keyword — an open-ended endDate."""


DateEnd = Union[Date, Present]


@dataclass(frozen=True, kw_only=True)
class DateRange(Node):
    start: Date
    end: DateEnd


# ---------------------------------------------------------------------------
# basics
# ---------------------------------------------------------------------------


@dataclass(frozen=True, kw_only=True)
class Profile(Node):
    network: str  # LinkedIn / GitHub / Npm / ... (raw casing preserved)
    url: str
    username: str | None = None


@dataclass(frozen=True, kw_only=True)
class Location(Node):
    address: Value | None = None
    postal_code: str | None = None  # neutral code, no translation
    city: Value | None = None
    country_code: str | None = None  # ISO code, no translation
    region: Value | None = None


@dataclass(frozen=True, kw_only=True)
class Basics(Node):
    name: str
    label: Value | None = None
    image: str | None = None
    email: str | None = None
    phone: str | None = None
    url: str | None = None
    summary: Value | None = None
    location: Location | None = None
    profiles: tuple[Profile, ...] = ()


# ---------------------------------------------------------------------------
# work / education / etc. — every collection entry is named to permit
# cross-refs and stable diffs.
# ---------------------------------------------------------------------------


HideTarget = str  # "html" | "pdf" | "both"


@dataclass(frozen=True, kw_only=True)
class WorkEntry(Node):
    key: str  # DSL identifier (e.g. Founder, AIResearchScientist)
    position: Value | None = None
    at: Value | None = None  # company name (may be translated)
    client: Value | None = None  # consulting client (Xtrada → VhAuctions, aXinco)
    url: str | None = None
    location: Value | None = None
    period: DateRange | None = None
    summary: Value | None = None
    highlights: tuple[Value, ...] = ()
    uses: tuple[str, ...] = ()
    projects: tuple[Ref, ...] = ()
    hide_on: HideTarget | None = None


@dataclass(frozen=True, kw_only=True)
class EducationEntry(Node):
    key: str
    institution: Value | None = None
    url: str | None = None
    study_type: Value | None = None
    area: Value | None = None
    period: DateRange | None = None
    score: Value | None = None  # aliased to `gpa` in the extras sidecar
    note: Value | None = None
    courses: tuple[str, ...] = ()
    uses: tuple[str, ...] = ()
    projects: tuple[Ref, ...] = ()
    hide_on: HideTarget | None = None
    # Display-only override — patched on HTML/XSLT, canonical data preserved.
    display_period: DateRange | None = None


@dataclass(frozen=True, kw_only=True)
class ProjectEntry(Node):
    key: str
    name: str | None = None
    description: Value | None = None
    summary: Value | None = None
    highlights: tuple[Value, ...] = ()
    keywords: tuple[str, ...] = ()
    start_date: Date | None = None
    end_date: Date | None = None
    url: str | None = None
    type: str | None = None  # noqa: A003 — schema name
    roles: tuple[str, ...] = ()
    entity: str | None = None


@dataclass(frozen=True, kw_only=True)
class ReferenceEntry(Node):
    key: str
    name: Value | None = None
    quote: Value | None = None


@dataclass(frozen=True, kw_only=True)
class Skills(Node):
    hard: tuple[str, ...] = ()
    soft: tuple[str, ...] = ()
    learning: tuple[str, ...] = ()


@dataclass(frozen=True, kw_only=True)
class LanguageEntry(Node):
    key: str
    language: Value | None = None  # display name (optional; defaults to key)
    fluency: Value | None = None  # "native" or free-form level string


@dataclass(frozen=True, kw_only=True)
class AwardEntry(Node):
    key: str
    title: Value | None = None
    date: Date | None = None
    awarder: Value | None = None
    summary: Value | None = None


@dataclass(frozen=True, kw_only=True)
class CompetitionEntry(Node):
    key: str
    title: Value | None = None
    date: Date | None = None
    organizer: Value | None = None
    summary: Value | None = None
    url: Value | None = None


@dataclass(frozen=True, kw_only=True)
class InterestEntry(Node):
    key: str
    name: Value | None = None
    keywords: tuple[str, ...] = ()


@dataclass(frozen=True, kw_only=True)
class VolunteerEntry(Node):
    key: str
    position: Value | None = None
    organization: Value | None = None
    url: str | None = None
    period: DateRange | None = None
    summary: Value | None = None
    highlights: tuple[Value, ...] = ()


# ---------------------------------------------------------------------------
# meta
# ---------------------------------------------------------------------------


@dataclass(frozen=True, kw_only=True)
class DailyItem(Node):
    key: str
    hours: float
    color: str


@dataclass(frozen=True, kw_only=True)
class Meta(Node):
    theme: str | None = None
    daily_life: tuple[DailyItem, ...] = ()
    brand_tokens: tuple[tuple[str, str], ...] = ()
    section_order: tuple[str, ...] = ()
    sidebar_order: tuple[str, ...] = ()


# ---------------------------------------------------------------------------
# Top-level document
# ---------------------------------------------------------------------------


@dataclass(frozen=True, kw_only=True)
class Resume(Node):
    key: str  # identifier of the resume (e.g. "grosjeanbaptiste")
    basics: Basics | None = None
    work: tuple[WorkEntry, ...] = ()
    education: tuple[EducationEntry, ...] = ()
    projects: tuple[ProjectEntry, ...] = ()
    references: tuple[ReferenceEntry, ...] = ()
    skills: Skills | None = None
    languages: tuple[LanguageEntry, ...] = ()
    awards: tuple[AwardEntry, ...] = ()
    competitions: tuple[CompetitionEntry, ...] = ()
    interests: tuple[InterestEntry, ...] = ()
    volunteer: tuple[VolunteerEntry, ...] = ()
    meta: Meta | None = None
