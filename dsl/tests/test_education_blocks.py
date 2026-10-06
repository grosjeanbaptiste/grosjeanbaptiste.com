"""A degree is followed year by year: each academic year is a block, with the
programme's own name for it when it has one, and the course units taken that
year. Compiled into the sidecars the site reads."""

from pathlib import Path
import sys

DSL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(DSL_DIR))

from parser import parse  # noqa: E402
from validators import validate  # noqa: E402
from compilers import i18n_overlays, site_extras  # noqa: E402

DOCUMENT = """
resume "test" {
    basics {
        name "Baptiste Grosjean"
    }
    education {
        Master {
            institution "UMons"
            period 2022-10-15..2026-09-04
            projects [ref Algo, ref Reseaux]
            blocks {
                First {
                    year "2022-2023"
                    label t{ en: "Bridging block", fr: "Bloc complémentaire" }
                    period 2022-10-15..2023-09-13
                    units [ref Algo]
                }
                Second {
                    year "2023-2024"
                    period 2023-09-14..2024-09-13
                    units [%s]
                }
            }
        }
    }
    projects {
        Algo {
            name "Algorithmique"
            type "Course unit"
        }
        Reseaux {
            name "Réseaux"
            type "Course unit"
        }
    }
}
"""


def document(units: str = "ref Reseaux"):
    return parse(DOCUMENT % units)


def blocks():
    return site_extras.emit(document())["education"][0]["blocks"]


def test_a_degree_carries_its_blocks_in_order():
    assert [b["year"] for b in blocks()] == ["2022-2023", "2023-2024"]


def test_a_block_says_when_it_ran():
    assert (blocks()[0]["startDate"], blocks()[0]["endDate"]) == ("2022-10-15", "2023-09-13")


def test_a_block_names_the_units_taken_that_year_by_their_name():
    assert blocks()[0]["units"] == ["Algorithmique"]


def test_a_block_carries_the_programmes_name_for_it_in_english():
    assert blocks()[0]["label"] == "Bridging block"


def test_a_block_the_programme_does_not_name_has_no_label():
    assert "label" not in blocks()[1]


def test_the_name_of_a_block_is_translated():
    overlay = i18n_overlays.emit_for_lang(document(), "fr")
    assert overlay["education"][0]["blocks"][0]["label"] == "Bloc complémentaire"


def test_a_unit_the_degree_does_not_list_is_refused_in_its_blocks():
    errors = [str(e) for e in validate(document("ref Ghost"))]
    assert any("Ghost" in e and "Second" in e for e in errors)


def test_a_unit_filed_under_two_blocks_is_refused():
    errors = [str(e) for e in validate(document("ref Algo"))]
    assert any("Algo" in e and "two blocks" in e for e in errors)
