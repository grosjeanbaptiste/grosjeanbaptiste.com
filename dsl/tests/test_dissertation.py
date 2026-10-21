"""Acteble is an experience that holds several projects; the MSc dissertation
is one of them. The master carried the dissertation — not the whole venture —
and the dissertation ended the day the degree was obtained."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse_file  # noqa: E402

RESUME = parse_file(DSL_DIR / "resume.grosjean")
MASTER = next(e for e in RESUME.education if e.institution == "UMons")
FOUNDER = next(w for w in RESUME.work if str(w.at) == "Acteble")
DISSERTATION = next(p for p in RESUME.projects if p.key == "MemoireMaster")
targets = lambda entry: [ref.target for ref in entry.projects]  # noqa: E731


def test_the_master_carried_the_dissertation_not_the_venture():
    assert "MemoireMaster" in targets(MASTER)
    assert "Acteble" not in targets(MASTER)


def test_the_acteble_experience_holds_the_platform_the_dissertation_and_the_side_projects():
    assert targets(FOUNDER) == [
        "Acteble",
        "MemoireMaster",
        "Actrack",
        "LL",
        "Baba",
        "KAG",
        "Indexer",
        "Polytech",
        "Converge",
    ]


def test_the_platform_is_one_project_not_one_line_per_application():
    # Its backend, app and website are parts of one product, so one line.
    keys = {p.key for p in RESUME.projects}
    assert "Acteble" in keys
    assert not {"ActebleApi", "ActebleApp", "ActebleWebsite"} & keys


def test_the_dissertation_ended_the_day_the_degree_was_obtained():
    assert DISSERTATION.end_date.text == MASTER.period.end.text


def test_the_dissertation_is_a_project_of_its_own_kind_at_umons():
    # Its type is a word, translated: the English one names the kind.
    assert (DISSERTATION.type.get("en"), DISSERTATION.entity) == ("Dissertation", "UMONS")


def test_the_dissertation_began_with_its_repository():
    assert DISSERTATION.start_date.text == "2025-11-13"


def test_the_platform_names_the_technologies_of_each_of_its_parts():
    keywords = set(next(p for p in RESUME.projects if p.key == "Acteble").keywords)
    assert {"Axum", "Tonic", "PostGIS", "HexagonalArchitecture", "CQRS"} <= keywords
    assert {"Flutter", "Melos", "Riverpod", "Drift"} <= keywords
    assert {"React", "Vite"} <= keywords
