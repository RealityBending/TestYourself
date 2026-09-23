"""
docs/build_slides.py — write the deck's Content table and its items out of the
app's own content files.

    python docs/build_slides.py            # rewrite the generated parts
    python docs/build_slides.py --check    # say whether they are up to date

A workbench, like `data/norms/` and `data/synthetic/`: nothing on the page or in
the deck reaches for it, and it is run by hand when `content/` changes. What it
writes is ordinary static HTML and one JavaScript file of strings, so the deck
stays a folder you can open off the disk with nothing loaded from the app.

**It reads the app through `data/synthetic/codebook.js`** (bun or node) rather
than parsing `content/` itself, so there is one reader of the questions and it
is the one that already walks them the way `app.js` does. The codebook's
grouping is by questionnaire; the table's is by instrument, and the two do not
line up — `singles` is one questionnaire holding eleven scales, `hexaco18` holds
the HEX-ACO-18 and the KSE-G, `control` holds four two-item proxies. ROWS below
is that mapping, and the one hand-written thing here: a row's **reference** is
not in `content/` anywhere, and neither is the fact that eleven scales share a
questionnaire.

That mapping is checked rather than trusted. Every item the app asks must be
claimed by exactly one row, and every row must claim at least one item, or this
script stops and says which. So a questionnaire added to `content/` without a
row here is a build failure rather than a table that quietly goes stale, which
is the whole reason the table is generated at all.
"""

import argparse
import html
import json
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DECK = ROOT / "docs" / "index.html"
ITEMS = ROOT / "docs" / "items.js"
CODEBOOK = ROOT / "data" / "synthetic" / "codebook.js"

# What the generated stretches of index.html are fenced with. Everything
# outside them is written by hand and is left alone.
OPEN = "        <!-- table:start · written by docs/build_slides.py · do not edit by hand -->"
SHUT = "        <!-- table:end -->"

# One row of the Content table: the instrument as it is cited, and which of the
# app's items it is. The name is the instrument and its reference, and nothing
# else — no "(custom items)", no "(not validated)". `qs` are questionnaire keys and `keys` are item-key
# prefixes within them — None for "all of them". The order here is the order
# the table is written in.
ROWS = [
    ("Demographics", ["demographics1"], None),
    ("Five-Item Personality Inventory (FIPI; Gosling et al., 2003)", ["fipi"], None),
    ("Single Item Narcissism Scale (SINS; Konrath et al., 2014)", ["singles"], ["SINS_"]),
    ("Single-Item Self-Rated Health (SRH; DeSalvo et al., 2006)", ["singles"], ["SRH_"]),
    ("Single-Item Measure of Stress Symptoms (SIMS; Elo et al., 2003)", ["singles"], ["SIMS_"]),
    ("Single-Item Self-Esteem Scale (SISE; Robins et al., 2001)", ["singles"], ["SISE_"]),
    ("Self-Concept Clarity Scale, item 11 (SCCS; Campbell et al., 1996)", ["singles"], ["SCCS_"]),
    ("Meaning in Life Questionnaire, item 8 (MLQ; Steger et al., 2006)", ["singles"], ["MLQ_"]),
    ("General Self-Efficacy Single-Item (GSE-SI; Di et al., 2023)", ["singles"], ["GSESI_"]),
    ("Aesthetic seeking", ["singles"], ["Aesthetics_"]),
    ("Single-Item Life Satisfaction Scale (SILS; Cheung & Lucas, 2014)", ["singles"], ["SILS_"]),
    ("Self-placement items", ["singles"], ["SelfPlacement_"]),
    ("Demographics", ["demographics2"], None),
    ("Multidimensional Interoceptive Traits questionnaire (MINT; Makowski et al.)", ["mint"], None),
    ("Beliefs about Artificial Intelligence Technology (BAIT; Makowski et al.)", ["bait"], None),
    ("Subjective financial well-being (ESS / OECD item)", ["demographics3"], ["Demographics_FinancialComfort"]),
    ("MacArthur Scale of Subjective Social Status (Adler et al., 2000)", ["demographics3"], ["Demographics_SocialStatus"]),
    (
        "Patient Health Questionnaire-4, refined 5-option version (PHQ-4; Kroenke et al., 2009; Makowski et al., 2025)",
        ["phq4"],
        None,
    ),
    ("Single-Item Sleep Quality Scale (SQS; Snyder et al., 2018)", ["sleep"], None),
    ("Psychiatric history", ["psychiatric"], None),
    ("HiTOP Brief Report (HiTOP-BR; Simms et al., 2026)", ["hitopbr"], None),
    ("HEX-ACO-18 (Olaru & Jankowsky, 2022)", ["hexaco18"], ["HEXACO_"]),
    ("Social Desirability-Gamma Short Scale (KSE-G; Kemper et al., 2014)", ["hexaco18"], ["KSEG_"]),
    ("Open Source Archetype Indicator – Pearson-Marr (OSAI-PM)", ["archetypes"], None),
    (
        "Primals Inventory-18 (PI-18; Clifton & Yaden, 2021) + five tertiary scales (PI-99; Clifton et al., 2019)",
        ["pi18", "primals_tertiary"],
        None,
    ),
    ("ICAR-16 Sample Test (ICAR16; Condon & Revelle, 2014; Young & Keith, 2020)", ["icar16"], None),
    ("Adult ADHD Self-Report Scale v1.1, items 1-2 (ASRS; Kessler et al., 2005)", ["control"], ["ASRS_"]),
    ("Cognitive Failures Questionnaire, items 10 and 21 (CFQ; Broadbent et al., 1982)", ["control"], ["CFQ_"]),
    ("Mind Wandering: Spontaneous, items 1 and 4 (MW-S; Carriere et al., 2013)", ["control"], ["MWS_"]),
    ("Brief Self-Control Scale, items 1-2 (BSCS; Tangney et al., 2004)", ["control"], ["BSCS_"]),
    ("Emotion Reactivity Scale, six items (ERS; Nock et al., 2008)", ["ers"], None),
    ("Cognitive Emotion Regulation Questionnaire, short form (CERQ-short; Garnefski & Kraaij, 2006)", ["cerq"], None),
    ("Left-right self-placement (European Social Survey)", ["leftright"], None),
    ("Conspiracy Mentality Questionnaire, items 1, 4 and 5 (CMQ; Bruder et al., 2013)", ["cmq"], None),
    (
        "British Social Attitudes left-right and libertarian-authoritarian scales, adapted (BSA; Evans et al., 1996)",
        ["views"],
        ["Opinion_LeftRight_", "Opinion_LibAuth_"],
    ),
    ("Equality of outcomes between groups", ["views"], ["Opinion_Parity_"]),
    ("Human enhancement and heredity beliefs", ["views"], ["Opinion_Enhancement_", "Opinion_Heredity_"]),
    ("Climate, animals and the environment", ["views"], ["Opinion_Planet_", "Opinion_Animals_"]),
    ("Beauty against purpose", ["views"], ["Opinion_Beauty_"]),
    ("Closing items", ["closing"], None),
]


def codebook():
    """Every item the app asks, read by the reader that already walks them."""
    runner = shutil.which("bun") or shutil.which("node")
    if not runner:
        sys.exit("neither bun nor node is on the path, and one of them reads the content files")
    done = subprocess.run([runner, str(CODEBOOK)], capture_output=True, text=True, encoding="utf-8")
    if done.returncode != 0:
        sys.exit("codebook.js failed:\n" + (done.stderr or "").strip())
    return json.loads(done.stdout)


def wording(item):
    """An item's question as a line of plain text.

    Four things have to be flattened. An item may word itself from an earlier
    answer, in which case the codebook wrote a wording per possible answer
    instead of a string. `text` is HTML, so it may carry a `<small>` gloss or
    the `<img>` that *is* the question on the drawn reasoning items. And it
    may be empty once the tags are gone, which is what a drawn item comes to.
    """
    said = item.get("text")
    if said is None:
        by = item.get("textBy") or {}
        wordings = [w for answers in by.values() for w in answers.values() if w]
        if not wordings:
            return "(no wording)"
        # One of the ways it can be asked, and a word about why there are several.
        return plain(wordings[0]) + " [worded from an earlier answer]"

    # A reasoning item's problem is a picture, and four of them share a stem:
    # say so, or the four read as the same question written out four times.
    drawn = " [with a figure]" if "<img" in said else ""
    return (plain(said) + drawn) or "[a drawn problem — see the app]"


def plain(said):
    """HTML down to one line of text, keeping what a gloss says."""
    said = re.sub(r"<br\s*/?>", " ", said)
    said = re.sub(r"<[^>]+>", "", said)
    said = html.unescape(said)
    return re.sub(r"\s+", " ", said).strip()


def claimed(item, qs, keys):
    if item["questionnaire"] not in qs:
        return False
    return keys is None or any(item["key"].startswith(prefix) for prefix in keys)


def build(book):
    """The table's rows, and the items behind each of them."""
    asked = [item for item in book["items"] if item["questionnaire"]]  # a briefing is not asked of anybody
    rows, items, taken = [], {}, {}

    for at, (name, qs, keys) in enumerate(ROWS):
        mine = [item for item in asked if claimed(item, qs, keys)]
        if not mine:
            sys.exit("no item in %s matches the row %r — has a questionnaire been renamed?" % (", ".join(qs), name))
        for item in mine:
            if item["key"] in taken:
                sys.exit("%s is claimed by two rows, %r and %r" % (item["key"], taken[item["key"]], name))
            taken[item["key"]] = name

        level = mine[0]["level"]
        rows.append(
            {
                "id": "r%d" % at,
                # Its place on the timeline as written. The fork lets a person
                # take the middle levels in an order of their own, but the
                # canonical level is the one thing about it that does not move.
                "level": str(level),
                "name": name,
                # In the order they are authored, which is the order they read.
                "dimensions": list(dict.fromkeys(one["dimension"] for one in mine if one["dimension"])),
                "count": len(mine),
            }
        )
        items["r%d" % at] = [
            wording(one) + (" [attention check]" if one.get("check") is not None else "") for one in mine
        ]

    loose = [item["key"] for item in asked if item["key"] not in taken]
    if loose:
        sys.exit(
            "these items are asked but no row in ROWS claims them, so the table would be missing them:\n  "
            + "\n  ".join(loose)
        )

    return rows, items


def table(rows):
    out = [OPEN]
    for row in rows:
        # Focusable and a disclosure: picking a row opens the item list below.
        out.append(
            '                    <tr data-items="%s" tabindex="0" aria-controls="items" aria-expanded="false">' % row["id"]
        )
        out.append("                        <td>%s</td>" % html.escape(row["level"]))
        out.append("                        <td>%s</td>" % html.escape(row["name"]))
        out.append("                        <td>%s</td>" % html.escape(", ".join(row["dimensions"]) or "—"))
        out.append("                        <td>%d</td>" % row["count"])
        out.append("                    </tr>")
    out.append(SHUT)
    return "\n".join(out)


def written(rows, items, version):
    deck = DECK.read_text(encoding="utf-8")
    if OPEN not in deck or SHUT not in deck:
        sys.exit("the markers around the table are not in docs/index.html any more")
    before, rest = deck.split(OPEN, 1)
    after = rest.split(SHUT, 1)[1]

    said = json.dumps(items, indent=4, ensure_ascii=False)
    js = (
        "/* Written by docs/build_slides.py out of the app's own content files.\n"
        "   Do not edit by hand: run the script again instead.\n\n"
        "   One entry per row of the Content table, holding that instrument's\n"
        "   items as they are asked, flattened to plain text. Read by deck.js,\n"
        "   which shows them beside the row. */\n\n"
        "const ITEMS = " + said + "\n"
    )
    return before + table(rows) + after, js


def main():
    ask = argparse.ArgumentParser(description=__doc__)
    ask.add_argument("--check", action="store_true", help="say whether the generated parts are up to date, and change nothing")
    said = ask.parse_args()

    book = codebook()
    rows, items = build(book)
    deck, js = written(rows, items, book.get("version"))

    stale = deck != DECK.read_text(encoding="utf-8") or not ITEMS.exists() or js != ITEMS.read_text(encoding="utf-8")
    if said.check:
        print("the deck is out of date — run docs/build_slides.py" if stale else "the deck is up to date")
        sys.exit(1 if stale else 0)

    DECK.write_text(deck, encoding="utf-8", newline="\n")
    ITEMS.write_text(js, encoding="utf-8", newline="\n")
    print("wrote %d rows and %d items into docs/" % (len(rows), sum(len(one) for one in items.values())))


if __name__ == "__main__":
    main()
