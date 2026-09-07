"""Smoke test: verify the parser accepts a minimal .grosjean document."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse  # noqa: E402
from validators import validate  # noqa: E402
from compilers import site_extras  # noqa: E402


MINIMAL = """
resume "test" {
    basics {
        name "Baptiste Grosjean"
        label t{ en: "Computer Scientist", fr: "Informaticien" }
        email "grosjeanbaptiste@outlook.com"
        location {
            city "Kraainem"
            countryCode "BE"
        }
        profile linkedin "https://linkedin.com/in/grosjeanbaptiste"
    }
    work {
        Founder {
            position "Founder"
            at "Acteble"
            period 2022-08..present
            summary t{ en: "Building Acteble.", fr: "Développement d'Acteble." }
            uses [Rust, Flutter, Dart]
            projects [ref Acteble]
        }
    }
    projects {
        Acteble {
            name "Acteble"
            description t{ en: "Mobile app.", fr: "App mobile." }
            keywords [Rust, Flutter]
            startDate 2023-01
        }
    }
    skills {
        hard [SQL, Python, Rust]
        soft [Leadership, Creativity]
    }
    languages {
        French native
        English "B1+/B2"
    }
    meta {
        theme "kendall"
        dailyLife {
            sleep 8 color "#F3890B"
            work  9 color "#001F5A"
        }
    }
}
"""


def test_parses_and_populates_fields():
    r = parse(MINIMAL)
    assert r.key == "test"
    assert r.basics.name == "Baptiste Grosjean"
    assert r.basics.label.get("en") == "Computer Scientist"
    assert r.basics.label.get("fr") == "Informaticien"
    assert r.basics.location.city == "Kraainem"
    assert r.basics.location.country_code == "BE"
    assert r.basics.profiles[0].network == "linkedin"
    assert len(r.work) == 1
    w = r.work[0]
    assert w.key == "Founder"
    assert w.at == "Acteble"
    assert w.period.start.text == "2022-08"
    assert w.period.end.__class__.__name__ == "Present"
    assert w.uses == ("Rust", "Flutter", "Dart")
    assert w.projects[0].target == "Acteble"
    assert len(r.projects) == 1
    assert r.projects[0].key == "Acteble"
    assert r.projects[0].keywords == ("Rust", "Flutter")
    assert r.projects[0].start_date.text == "2023-01"
    assert r.skills.hard == ("SQL", "Python", "Rust")
    assert r.languages[0].key == "French"
    assert r.languages[0].fluency == "native"
    assert r.languages[1].fluency == "B1+/B2"
    assert r.meta.theme == "kendall"
    assert len(r.meta.daily_life) == 2
    assert r.meta.daily_life[0].key == "sleep"
    assert r.meta.daily_life[0].hours == 8


# A competition may cross-reference a project via `projects [ref NAME]`,
# mirroring the work/education entries. The ref resolves at validation time
# and site-extras emits the project's rendered name (data link only — no
# renderer surfaces competitions today).
COMP_BLOCK = """    competitions {
        HackathonTest {
            title "Test Hackathon"
            date 2024-03-17
            projects [ref Acteble]
        }
    }
"""


def test_competition_accepts_projects_ref():
    doc = MINIMAL.replace("    meta {", COMP_BLOCK + "    meta {")
    r = parse(doc)
    assert len(r.competitions) == 1
    c = r.competitions[0]
    assert c.key == "HackathonTest"
    assert c.projects[0].target == "Acteble"
    # the ref resolves — no unresolved-ref error for this competition
    assert not any("unresolved ref" in str(e) for e in validate(r))
    extras = site_extras.emit(r)
    assert extras["competitions"][0]["projects"] == ["Acteble"]


def test_competition_unknown_project_ref_fails_validation():
    bad = MINIMAL.replace(
        "    meta {",
        COMP_BLOCK.replace("ref Acteble", "ref Missing") + "    meta {",
    )
    r = parse(bad)
    errors = validate(r)
    assert any("Missing" in str(e) for e in errors)
