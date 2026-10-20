"""The events of the CV are not only technical: the races run are events too."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse_file  # noqa: E402

RACES = {
    "TwentyKmBrussels2022": "2022-05-29",
    "TwentyKmBrussels2024": "2024-05-26",
    "TwentyKmMaredsousDinant2025": "2025-03-09",
    "TwentyKmBrussels2025": "2025-05-25",
    "TwentyKmMaredsousDinant2026": "2026-03",
}


def events() -> dict:
    resume = parse_file(DSL_DIR / "resume.grosjean")
    return {e.key: e for e in resume.competitions}


def test_the_races_run_are_events_of_the_cv():
    assert RACES.keys() <= events().keys()


def test_each_race_is_dated_on_the_day_it_was_run():
    found = events()
    assert {k: found[k].date.text for k in RACES} == RACES
