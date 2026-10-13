"""What a project is and the part taken in it are words a reader meets on the
timeline: its type and its roles are translated like its description, and
resume.json keeps their English wording."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse, parse_file  # noqa: E402
from compilers import i18n_overlays, jsonresume  # noqa: E402

DOCUMENT = """
resume "test" {
    basics {
        name "Baptiste Grosjean"
    }
    projects {
        App {
            name "Acteble App"
            type t{ en: "Mobile Application", fr: "Application mobile" }
            roles [t{ en: "Founder", fr: "Fondateur" }, Maintainer]
        }
        Tool {
            name "Baba"
            type "CLI"
            roles [Author]
        }
    }
}
"""


def projects() -> list[dict]:
    return jsonresume.emit(parse(DOCUMENT))["projects"]


def overlay(lang: str) -> list:
    return i18n_overlays.emit_for_lang(parse(DOCUMENT), lang)["projects"]


def test_the_type_of_a_project_is_written_in_english_in_the_json_resume_file():
    assert [p["type"] for p in projects()] == ["Mobile Application", "CLI"]


def test_the_roles_of_a_project_are_written_in_english_in_the_json_resume_file():
    assert [p["roles"] for p in projects()] == [["Founder", "Maintainer"], ["Author"]]


def test_the_type_of_a_project_is_translated():
    assert overlay("fr")[0]["type"] == "Application mobile"


def test_a_role_is_translated_at_its_place_among_the_roles():
    assert overlay("fr")[0]["roles"] == ["Fondateur", None]


def test_a_project_worded_in_one_language_only_has_no_overlay():
    assert overlay("fr")[1:] == []


def test_every_type_of_the_cv_is_translated_into_french():
    projects = i18n_overlays.emit_for_lang(parse_file(DSL_DIR / "resume.grosjean"), "fr")["projects"]
    english = jsonresume.emit(parse_file(DSL_DIR / "resume.grosjean"))["projects"]
    # A type that reads the same in French (API, CLI, Framework) needs no entry.
    same = {"API", "CLI", "Framework"}
    untranslated = [
        e["name"]
        for e, o in zip(english, projects + [None] * len(english))
        if e.get("type") and e["type"] not in same and not (o or {}).get("type")
    ]
    assert untranslated == []


def test_every_role_of_the_cv_is_translated_into_french():
    projects = i18n_overlays.emit_for_lang(parse_file(DSL_DIR / "resume.grosjean"), "fr")["projects"]
    english = jsonresume.emit(parse_file(DSL_DIR / "resume.grosjean"))["projects"]
    untranslated = [
        e["name"]
        for e, o in zip(english, projects + [None] * len(english))
        if e.get("roles") and not all((o or {}).get("roles") or [None])
    ]
    assert untranslated == []
