"""A degree is followed by day or on an evening schedule ("horaire décalé").
The CV says which, so that a timeline can tell the two apart."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse, parse_file  # noqa: E402
from validators import validate  # noqa: E402
from compilers import site_extras  # noqa: E402

DOCUMENT = """
resume "test" {
    basics {
        name "Baptiste Grosjean"
    }
    education {
        Evening {
            institution "EPHEC"
            period 2018-09-30..2022-10-15
            schedule "%s"
        }
        Day {
            institution "Saint-Louis"
            period 2016-09-30..2017-06-30
        }
    }
}
"""


def education(schedule: str = "evening"):
    return site_extras.emit(parse(DOCUMENT % schedule))["education"]


def test_a_degree_followed_in_the_evening_says_so():
    assert education()[0]["schedule"] == "evening"


def test_a_degree_that_says_nothing_is_followed_by_day():
    assert education()[1]["schedule"] == "day"


def test_a_schedule_the_cv_does_not_know_is_refused():
    errors = [str(e) for e in validate(parse(DOCUMENT % "nightly"))]
    assert any("schedule" in e and "nightly" in e for e in errors)


def test_the_cv_marks_its_evening_degrees():
    # The UMONS master (Charleroi, "horaire décalé" on the transcripts) and the
    # EPHEC bachelor (a school of "promotion sociale": evening classes).
    by_school = {e.institution: e.schedule for e in parse_file(DSL_DIR / "resume.grosjean").education}
    assert by_school["UMons"] == "evening"
    assert by_school["Ecole Pratique Hautes Etudes Commerciales (EPHEC-EPS)"] == "evening"
    assert by_school["Université Saint-Louis - Bruxelles"] is None
