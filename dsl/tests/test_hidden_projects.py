"""A project can be hidden like an experience or a degree: it stays in the DSL
and in resume.json, and is left out of the displays its flag names."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse, parse_file  # noqa: E402
from compilers import site_overrides  # noqa: E402

DOCUMENT = """
resume "test" {
    basics {
        name "Baptiste Grosjean"
    }
    projects {
        Side hide on: %s {
            name "Side project"
        }
        Shown {
            name "Shown project"
        }
    }
}
"""


def overrides(target: str) -> dict:
    return site_overrides.emit(parse(DOCUMENT % target))


def test_a_project_hidden_on_both_is_left_out_of_the_pages_and_the_pdfs():
    payload = overrides("both")
    assert payload["hideOnHtml"]["projects"] == ["Side project"]
    assert payload["hideOnPdf"]["projects"] == ["Side project"]


def test_a_project_hidden_on_html_stays_in_the_pdfs():
    payload = overrides("html")
    assert payload["hideOnHtml"]["projects"] == ["Side project"]
    assert "projects" not in payload.get("hideOnPdf", {})


def test_a_project_without_the_flag_is_hidden_nowhere():
    payload = overrides("both")
    assert "Shown project" not in payload["hideOnHtml"]["projects"]


def test_the_side_projects_of_the_cv_are_hidden_everywhere():
    # Baba and KAG belong to no experience and no degree: the author keeps them
    # out of every display.
    payload = site_overrides.emit(parse_file(DSL_DIR / "resume.grosjean"))
    for target in ("hideOnHtml", "hideOnPdf"):
        assert {"Baba", "KAG"} <= set(payload[target]["projects"])
