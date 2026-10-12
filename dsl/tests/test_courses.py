"""A course unit is a course, never a project: courses have their own section
of the DSL and of the compiled data, as education has its own beside work. A
degree lists the courses it carried apart from the projects it produced."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse, parse_file  # noqa: E402
from validators import validate  # noqa: E402
from compilers import i18n_overlays, jsonresume, site_extras  # noqa: E402

DOCUMENT = """
resume "test" {
    basics {
        name "Baptiste Grosjean"
    }
    education {
        Master {
            institution "UMons"
            period 2022-10-15..2026-09-04
            projects [%(projects)s]
            courses [%(courses)s]
        }
    }
    projects {
        Thesis {
            name "Mémoire"
        }
    }
    courses {
        Algo {
            name "Algorithmique"
            summary t{ en: "Algorithmics", fr: "Algorithmique" }
            entity "UMONS"
            url "https://example.org/algo"
            keywords [Algorithms, Trees]
        }
    }
}
"""


def document(projects: str = "ref Thesis", courses: str = "ref Algo"):
    return parse(DOCUMENT % {"projects": projects, "courses": courses})


def errors(**refs) -> list[str]:
    return [str(e) for e in validate(document(**refs))]


# JSON Resume v1.0.0 has no section for course units: resume.json stays strict,
# and the courses travel in the repository's own sidecar.
JSON_RESUME_SECTIONS = {
    "$schema", "basics", "work", "volunteer", "education", "awards", "certificates",
    "publications", "skills", "languages", "interests", "references", "projects", "meta",
}


def test_the_json_resume_file_holds_json_resume_sections_only():
    resume = jsonresume.emit(parse_file(DSL_DIR / "resume.grosjean"))
    assert set(resume) <= JSON_RESUME_SECTIONS


def test_a_course_is_compiled_into_the_courses_of_the_sidecar():
    assert site_extras.emit(document())["courses"] == [
        {
            "name": "Algorithmique",
            "keywords": ["Algorithms", "Trees"],
            "url": "https://example.org/algo",
            "entity": "UMONS",
            "summary": "Algorithmics",
        }
    ]


def test_a_course_is_not_among_the_projects_of_the_cv():
    assert [p["name"] for p in jsonresume.emit(document())["projects"]] == ["Mémoire"]


def test_a_degree_names_its_courses_as_json_resume_does():
    # `education[].courses` is JSON Resume's own field: the names of the courses.
    assert jsonresume.emit(document())["education"][0]["courses"] == ["Algorithmique"]


def test_a_degree_names_its_projects_apart_from_its_courses():
    assert site_extras.emit(document())["education"][0]["projects"] == ["Mémoire"]


def test_the_title_of_a_course_is_translated():
    assert i18n_overlays.emit_for_lang(document(), "fr")["courses"] == [{"summary": "Algorithmique"}]


def test_the_cv_as_written_is_valid():
    assert errors() == []


def test_a_course_listed_among_the_projects_of_a_degree_is_refused():
    assert any("Algo" in e and "is a course" in e for e in errors(projects="ref Algo"))


def test_a_project_listed_among_the_courses_of_a_degree_is_refused():
    assert any("Thesis" in e and "is a project" in e for e in errors(courses="ref Thesis"))


def test_an_unknown_course_is_refused():
    assert any("Ghost" in e and "courses" in e for e in errors(courses="ref Ghost"))


def test_no_project_of_the_cv_is_a_course_unit():
    resume = jsonresume.emit(parse_file(DSL_DIR / "resume.grosjean"))
    assert [p["name"] for p in resume["projects"] if p.get("type") == "Course unit"] == []


def test_the_cv_carries_its_fifty_course_units_as_courses():
    extras = site_extras.emit(parse_file(DSL_DIR / "resume.grosjean"))
    assert len(extras["courses"]) == 50
