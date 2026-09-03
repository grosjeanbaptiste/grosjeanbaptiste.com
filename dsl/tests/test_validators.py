from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from parser import parse  # noqa: E402
from validators import validate  # noqa: E402


GOOD = """
resume "ok" {
    basics {
        name "X"
        label t{ en: "Dev" }
    }
    projects {
        Alpha { name "Alpha" }
    }
    work {
        Founder {
            position "Founder"
            at "Acteble"
            period 2022-08..present
            projects [ref Alpha]
        }
    }
    meta {
        dailyLife {
            sleep 8 color "#000"
            work  9 color "#111"
            other 7 color "#222"
        }
    }
}
"""


BAD_REF = """
resume "bad" {
    basics { name "X" label t{ en: "Dev" } }
    work {
        Founder {
            position "Founder"
            at "Acteble"
            projects [ref Ghost]
        }
    }
}
"""


BAD_DAILY = """
resume "bad" {
    basics { name "X" label t{ en: "Dev" } }
    meta {
        dailyLife {
            sleep 8 color "#000"
            work  9 color "#111"
        }
    }
}
"""


BAD_LANG = """
resume "bad" {
    basics {
        name "X"
        label t{ fr: "Dev" }
    }
}
"""


def test_good_passes():
    r = parse(GOOD)
    assert validate(r) == []


def test_bad_ref_flagged():
    r = parse(BAD_REF)
    msgs = [str(e) for e in validate(r)]
    assert any("Ghost" in m for m in msgs)


def test_daily_life_sum_flagged():
    r = parse(BAD_DAILY)
    msgs = [str(e) for e in validate(r)]
    assert any("17" in m and "24" in m for m in msgs)


def test_missing_en_fallback_flagged():
    r = parse(BAD_LANG)
    msgs = [str(e) for e in validate(r)]
    assert any("English fallback" in m for m in msgs)
