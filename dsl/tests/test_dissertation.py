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
    assert not {"ActebleApp", "ActebleApi"} & set(targets(MASTER))


def test_the_acteble_experience_holds_the_app_the_api_and_the_dissertation():
    assert targets(FOUNDER) == ["ActebleApp", "ActebleApi", "MemoireMaster"]


def test_the_api_is_rust_and_the_app_is_flutter():
    by_key = {p.key: p for p in RESUME.projects}
    assert "Rust" in by_key["ActebleApi"].keywords and "Flutter" not in by_key["ActebleApi"].keywords
    assert "Flutter" in by_key["ActebleApp"].keywords and "Rust" not in by_key["ActebleApp"].keywords


def test_the_dissertation_ended_the_day_the_degree_was_obtained():
    assert DISSERTATION.end_date.text == MASTER.period.end.text


def test_the_dissertation_is_a_project_of_its_own_kind_at_umons():
    assert (DISSERTATION.type, DISSERTATION.entity) == ("Dissertation", "UMONS")
