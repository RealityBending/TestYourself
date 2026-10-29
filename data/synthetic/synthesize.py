"""
data/synthetic/synthesize.py — synthetic runs of the test, answered by Claude
as a sampled persona, and written in the shape the app saves.

Nothing here touches the page or the browser. The test is data, so one API
request per persona answers every item at once, and the answers are written
into the same JSON `container()` produces — `items[]` with the words that
would have been on screen, `feedback` and `ratings` all null, null times — so that an
analysis reads a synthetic run and a real one with one code path. Every file
is flagged: the participant code starts `synthetic-` and the file carries a
`synthetic` field saying which model and persona wrote it and under what
(`grain`, `effort`, `condition`, the instructions' hash, the seed, the draw),
so that nothing about a file has to be read off its name. The name is the
persona's code and then a code for this answering of it (`draw`), since one
persona may be answered under several conditions, or several times under one
(the same seed is the same personas), and each answering is a file of its
own. Nothing is ever sent to DataPipe.

    pip install anthropic                      # once; bun (or node) reads the codebook
    python data/synthetic/synthesize.py run --n 20            # sample, build, send as a batch
    python data/synthetic/synthesize.py collect --wait        # fetch the batch, write out/*.json
    python data/synthetic/synthesize.py run --n 3 --live      # three personas now, no batch
    python data/synthetic/synthesize.py run --n 5 --fake      # random answers, no API, no cost

The steps can also be taken one at a time (`codebook`, `personas`, `build`,
`submit`, `collect`), and everything in between is left in `work/` where it
can be read: the codebook, the personas, and the exact requests sent.

How a persona is made: as little as will do, told in one sentence — "You are
a 40-year-old woman, currently working." — since every detail given is one
more thing to read a stereotype into. Everything else, the study's own
demographic questions included, the model answers in character, and its
answers to age, gender and student status are then held up against what it
was told (`strayed`). The birthday is drawn too but not told. How much more
the model is asked to make of the person is the `--condition` (`CONDITIONS`):
nothing, a line saying it is one particular person, or that and a short
biography it writes first. The instructions say what the task is and nothing
about how to answer. A persona's items come in an order of their own, shuffled within each questionnaire the
way the page deals them (`dealt`), and are saved in that order. What the model
is shown is what the person is, as near as text allows (`render_items`): each
item numbered and nothing else about it — no key, no instrument's name, no
facet, none of which the person is told — the lead-in over it and the scale
under it, and the briefings where they fall, in the words the person reads;
not the attention checks, which the script answers correctly — an attentive
person is being simulated — and not the level screens or the results between
levels, which have no text to show. Follow-up items are pruned the way
`pruneBranches()` prunes them, so a closed branch is null.

The levels are drawn for each persona the way the page draws them
(`drawn_levels`): level 1 first, each fork's run in an order of its own and
the closing last, so that the demographics open places 1 to 3 and the interim
place 5 whatever is walked there, and every fork choice is the recommended
one. How the model meets the items is the `--grain` (`GRAINS`): `item`, the
default, one screen a turn in a conversation it cannot read ahead in
(`sequential`), each answer held to JSON by one schema for every screen and
to its scale by `tidy`, a follow-up shown only once the answer that opens it
is given, a briefing at the top of the screen after it, and the conversation
so far cached between turns, which only `--live` can carry; or `all`, every item in one request,
which a Message Batch carries at half the price and the model reads whole.

The answers are constrained by a JSON schema (structured outputs), but only
in shape — a list of keys and values, since a schema naming three hundred
items is more than the API will compile. Everything else is checked here: that
every item came back and nothing else did, that a value is one of the item's
own options or inside a number's range, that a list obeys its 'none of these'
rule. A bad value is written as unanswered rather than trusted.

What this is for: exercising the pipeline end to end, smoke-testing scoring
and reverse-keying, seeing what the figures look like across the space. It
is not a source of norms, and synthetic runs must never be pooled with
participants: models answer in socially desirable ways, avoid the extremes,
and vary far less than people do, however hard the prompt pushes back.
"""

import argparse
import datetime as dt
import hashlib
import html
import json
import random
import re
import secrets
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
WORK = HERE / "work"
OUT = HERE / "out"

MODEL = "claude-sonnet-5-5"
MAX_TOKENS = 16000

# How hard the model thinks before answering. Sent on every request rather than
# left to each model's own default, which is not the same across models
# (Sonnet's is high, Opus's and Haiku's medium), so that comparing two models
# is not also comparing two efforts. Written into every file.
EFFORT = "high"

# $ per million tokens at standard rates: input, output, a read from the cache.
# A batch halves all three. Only for the bills printed on the way; a file holds
# the tokens themselves (`usage`), and dollars are worked out from those.
PRICES = {
    "claude-haiku-5-5": (0.10, 0.50, 0.01),
    "claude-sonnet-5-5": (2.0, 10.0, 0.20),
    "claude-sonnet-5": (2.0, 10.0, 0.20),
    "claude-opus-5-5": (4.0, 20.0, 0.20),
    "claude-opus-5": (5.0, 25.0, 0.50),
    "claude-fable-5-1": (10.0, 50.0, 0.25),
}

# The app's alphabet for a participant code: no I, L, O, 0 or 1, since a code
# is read off a screen and typed back.
ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

# The figures that take one vote for a whole questionnaire rather than a vote
# per dimension — mirrors `feedbackKeys()` in js/results.js, so that a
# synthetic file has the same `feedback` columns as a real one. Update both.
FIGURE_VOTES = {
    "fipi": ["StarSign", "Temperament"],
    "bait": ["AIArchetype"],
    "phq4": ["Year"],
    "hitopbr": ["Year"],
    "pi18": ["World"],
    "archetypes": ["Archetype"],
    "icar16": ["Reasoning"],
    "control": ["Heart", "Mind"],
    "ers": ["Heart", "Mind"],
    "cerq": ["Heart", "Mind"],
    "cmq": ["Stance", "Beliefs"],
    "views": ["Stance", "Beliefs"],
}

# Who the model is asked to be, in one sentence of plain words — "You are a
# 40-year-old woman, currently working." — and nothing more, so that whatever
# else the answers carry is the model's own reading of such a person rather
# than circumstances written here: the more a persona is given, the more there
# is to read a stereotype into. The study's own demographic questions are then
# answered by the model like any other item, which makes them a check on
# whether it kept to who it was told it was (`strayed`). Each way of telling a
# fact maps to the answer it should come back as, so an option renamed in
# `content/` shows up as a mismatch rather than passing unnoticed.
GENDERS = {"woman": "Female", "man": "Male"}
OCCUPATIONS = {"working": "No", "studying": "Yes"}  # as "Are you currently a student?" should be answered, where it is asked

# Drawn here and written into the file, but never told: they only feed the star
# card, a model told it was born on 26 March might answer as an Aries, and one
# left to choose a birthday does not choose evenly.
UNTOLD = ["Demographics_BirthMonth", "Demographics_BirthDay"]

# The instructions over the items, the same for every persona of a condition.
# They say what the task is and nothing about how to answer: no pushing towards
# the ends of a scale, nor away from flattering answers, nor an "honestly",
# which asks for a sincere one — any of which would bend every persona the same
# way. The conditions are a ladder, each adding one thing to
# the one before it, so that the difference between neighbours has one cause:
#   typical     the sentence alone — the model's picture of such a person
#   particular  and a line saying it is one person and not a typical one
#   bio         and a short biography the model writes before answering,
#               which makes the person it imagines visible in the file
# (A fourth, matched to the demographics of the real sample, waits on there
# being one.)
CONDITIONS = ("typical", "particular", "bio")

# How the model meets the items. `item` is the page's way: one screen a turn,
# in a conversation it cannot read ahead in, so that what it answers an item
# with is read off that item and what it has already said, as a person's is,
# and a follow-up is shown only once the answer that opens it is given, as on
# the page. `all` is every item in one request, which the model reads whole
# before answering any of it, and which a Message Batch carries at half the
# price: the one to use where a whole scale in view does no harm.
GRAINS = ("item", "all")

# What holds whatever the grain.
RULES = """- Where a questionnaire asks about a period (the last two weeks, the last year), answer about that period in this person's life.
- "None of these" and "Prefer not to say" are real options.
- The comment boxes invite free comments on the test: write what this person would write, or an empty string if they would skip it."""

INSTRUCTIONS = """You are taking part in an online psychology study as the person described in the user's message. You are not an assistant here: you are that person, answering questions about yourself.{individual}

{task}

{rules}

Return one JSON object with {fields}, where `answers` is a list with one entry for every numbered item below, in the order listed, each giving the item's number as `key` (`q001`, `q002`, …) and your `value`. An item is written as `- number: question`, and the scale it is answered on is given above the items that share it. Text between the items that carries no number is what the study showed on screen at that point, and there is nothing to answer on it.

# The items
"""

# The `item` grain's, over a conversation in which each user message is one screen.
SCREENS = """You are taking part in an online psychology study as the person described in the user's first message. You are not an assistant here: you are that person, answering questions about yourself.{individual}

The study is shown one screen at a time, as it is on its website, and each message is one screen: a question and the scale it is answered on, sometimes under a short text the study showed between questions. {task}

{rules}

Return one JSON object with `value`: the number of your answer on the scale given, the words where the screen asks for them, or a list of every number that applies where it says so."""

BIO = (
    "First, in `bio`, write two to four sentences of biography consistent with the facts given — invent the specifics: "
    "work, relationships, habits, what is going on in your life right now."
)

INDIVIDUAL = (
    " Put yourself in their shoes: they are one particular individual, not a typical one, "
    "with a life, a history and experiences of their own."
)


def instructions(condition, grain="all"):
    individual = INDIVIDUAL if condition in ("particular", "bio") else ""
    if grain == "item":
        task = (
            "Before the first screen you are asked for a short biography of this person; then answer each screen as that person would."
            if condition == "bio"
            else "Answer each screen as that person would."
        )
        return SCREENS.format(individual=individual, task=task, rules=RULES)
    if condition == "bio":
        task = BIO + " Then answer every item below as that person would."
        return INSTRUCTIONS.format(individual=individual, task=task, rules=RULES, fields="`bio` and `answers`")
    return INSTRUCTIONS.format(individual=individual, task="Answer every item below as that person would.", rules=RULES, fields="`answers`")


# ------------------------------------------------------------- the codebook --


def codebook(refresh=True):
    """Every item of the run, read out of the content files by codebook.js."""
    WORK.mkdir(parents=True, exist_ok=True)
    path = WORK / "codebook.json"
    if refresh or not path.exists():
        runtime = shutil.which("bun") or shutil.which("node")
        if not runtime:
            sys.exit("codebook.js needs bun or node on the PATH (bun is at ~/.bun/bin)")
        dump = subprocess.run([runtime, str(HERE / "codebook.js")], capture_output=True, text=True, encoding="utf-8")
        if dump.returncode:
            sys.exit(dump.stderr)
        path.write_text(dump.stdout, encoding="utf-8")
    return json.loads(path.read_text(encoding="utf-8"))


def plain(text):
    """The words of a question without the HTML they are written in."""
    if not text:
        return ""
    text = re.sub(r"<br\s*/?>", " ", text)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def prose(text):
    """A briefing's words, a line a paragraph, without the HTML they are written in."""
    if not text:
        return ""
    text = re.sub(r"</(?:p|h\d|li|div)>|<br\s*/?>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    lines = [re.sub(r"\s+", " ", html.unescape(line)).strip() for line in text.split("\n")]
    return "\n".join(line for line in lines if line)


def worded(thing, answers):
    """An item's or option's text, which may depend on an earlier answer."""
    if "textBy" in thing:
        ((key, table),) = thing["textBy"].items()
        return table.get(str(answers.get(key)))
    return thing.get("text")


def shown(item, answers):
    """Whether an item waiting on another (`showIf`) is asked, given the answers so far."""
    if not item.get("showIf"):
        return True
    given = answers.get(item["showIf"]["key"])
    if given is None:
        return False
    chosen = given if isinstance(given, list) else [given]
    wanted = item["showIf"]["is"]
    wanted = wanted if isinstance(wanted, list) else [wanted]
    return any(one in chosen for one in wanted)


def asked(book):
    return [item for item in book["items"] if item["type"] != "briefing"]


# ---------------------------------------------------------------- personas --


def draw_code(of=None):
    """A code for one answering of a persona: the persona's code says who, this
    says which time. Written into the file (`synthetic.draw`) and onto its name
    after the persona's, so that one persona answered under two conditions, or
    twice under one, is two files rather than one written over the other.
    Drawn afresh, off no seed, for a live answering; for one out of a batch,
    worked out from the batch's id and the persona's code (`of`), so that a
    batch collected twice rewrites its files rather than writing them again."""
    if of is None:
        return "".join(secrets.choice(ALPHABET) for _ in range(6))
    digest = hashlib.sha256(of.encode("utf-8")).digest()
    return "".join(ALPHABET[byte % len(ALPHABET)] for byte in digest[:6])


def sample_persona(book, rng, seed):
    """Who the persona is told it is (`told`), the birthday it is not told
    (UNTOLD, its only `answers`), the levels in the order drawn for it and the
    order its items are dealt in."""
    age = next(item for item in asked(book) if item["key"] == "Demographics_Age")
    told = {
        # Skewed young the way online samples are, and never past 65, so that
        # "currently working" or "currently studying" holds for everybody.
        "age": int(round(rng.triangular(age["lowest"], min(age["highest"], 65), 30))),
        "gender": rng.choice(sorted(GENDERS)),
        "occupation": rng.choice(sorted(OCCUPATIONS)),
    }
    answers = {}
    for item in asked(book):
        if item["key"] not in UNTOLD or not shown(item, answers):
            continue
        # "I'd rather not say" is a real answer for some people but no birthday
        # to draw. An option may wait on an answer too (the 31st, on a month
        # that has one).
        pool = [o for o in item["options"] if not o["custom"] and not o["small"] and shown(o, answers)]
        answers[item["key"]] = rng.choice(pool)["value"]

    code = "synthetic-" + "".join(rng.choice(ALPHABET) for _ in range(12))
    levels, order = dealt(book, rng)
    return {"code": code, "seed": seed, "told": told, "answers": answers, "levels": levels, "order": [item["key"] for item in order]}


def fork_runs(book):
    """The forks as written: each a run of levels one after another with the
    same `fork`, the number being how many are offered at once — `FORKS` in
    app.js — and its level numbers the places it fills."""
    runs = []
    for level in book["levels"]:
        if not level["fork"]:
            continue
        last = runs[-1] if runs else None
        if last and last[-1]["fork"] == level["fork"] and last[-1]["level"] == level["level"] - 1:
            last.append(level)
        else:
            runs.append([level])
    return runs


def drawn_levels(book, rng):
    """The written level numbers in the order a run walks them: every level
    where it is written but a fork's, which take the fork's places in an order
    drawn for them — the page's `shuffle()` over the timeline, which draws
    nothing outside a browser, drawn here instead, with every choice then
    taken as recommended. Level 1 is in no fork and opens every run, and the
    closing is in none and ends it."""
    order = [level["level"] for level in book["levels"]]
    for run in fork_runs(book):
        places = [level["level"] for level in run]
        drawn = places[:]
        rng.shuffle(drawn)
        for place, level in zip(places, drawn):
            order[place - 1] = level
    return order


def dealt(book, rng):
    """The levels drawn, then the run's items in an order a page could deal
    them — `settle()` in app.js — walked in that order.

    What opens a place stays with the place (`placed`: the demographics on
    places 1 to 3, the interim on 5) and a level's own items go where the
    level is walked. A questionnaire is the unit of shuffling: its items are
    shuffled among themselves and nothing crosses from one to the next. An
    item written `shuffle: false`, or in a questionnaire written so (the
    demographics, the PI-18), keeps its place. A follow-up waiting on an item
    of its own questionnaire goes straight after that item, its own follow-ups
    after it. Briefings belong to no questionnaire and never move.
    """
    levels = drawn_levels(book, rng)
    sequence = []
    for place, written in enumerate(levels, start=1):
        sequence += [item for item in book["items"] if item.get("placed") and item["level"] == place]
        sequence += [item for item in book["items"] if not item.get("placed") and item["level"] == written]
    out = []

    def settle(group):
        here = {item["key"] for item in group}
        follows = lambda item: bool(item.get("showIf")) and item["showIf"]["key"] in here
        heads = [item for item in group if not follows(item)]
        moving = [item for item in heads if item.get("shuffle")]
        rng.shuffle(moving)
        moving = iter(moving)

        def place(item):
            out.append(item)
            for after in group:
                if follows(after) and after["showIf"]["key"] == item["key"]:
                    place(after)

        for item in heads:
            place(next(moving) if item.get("shuffle") else item)

    group, holding = [], object()
    for item in sequence:
        if item["questionnaire"] != holding:
            settle(group)
            group, holding = [], item["questionnaire"]
        group.append(item)
    settle(group)
    return levels, out


def in_order(book, persona):
    """The run's items in the order this persona was dealt them; as written for
    a persona sampled before items were shuffled, which carries no order."""
    if "order" not in persona:
        return list(book["items"])
    by_key = {item["key"]: item for item in book["items"]}
    return [by_key[key] for key in persona["order"]]


def walk(book, persona):
    """The run's places in order, each with the level walked there: the place,
    the level's written number, key, name and fork, whether it is scored,
    whether the place is beneath the seabed (`beneath` is the place's — the
    share of the scored levels under it, however they are drawn), and its
    blocks as the file lists them, what opens the place (`placed`) first and
    then the level's own. A persona drawn before the levels were walks them
    as written."""
    by_number = {level["level"]: level for level in book["levels"]}
    placed = {item["block"] for item in book["items"] if item.get("placed")}
    scored = {item["level"] for item in book["items"] if item.get("dimension")}
    way = []
    for place, written in enumerate(persona.get("levels") or sorted(by_number), start=1):
        level = by_number[written]
        way.append(
            {
                "place": place,
                "written": written,
                "key": level["key"],
                "name": level["name"],
                "fork": level["fork"],
                "scored": written in scored,
                "beneath": by_number[place]["beneath"],
                "blocks": [name for name in by_number[place]["blocks"] if name in placed] + [name for name in level["blocks"] if name not in placed],
            }
        )
    return way


def place_of(item, way):
    """The place an item is met at: its own level's number for one that opens
    a place, and wherever its level was walked for the rest."""
    if item.get("placed"):
        return item["level"]
    return next(level["place"] for level in way if level["written"] == item["level"])


def stop_of(book, persona):
    """The place a persona's run stops at, or None for one that goes to the
    end. A persona made with `--core` stops where a participant who does only
    the mandatory part stops: at the place the first interlude opens (the
    interim, on `mint`), having answered every place before it and the
    interlude itself, and having chosen nothing on its last screen."""
    if not persona.get("core"):
        return None
    between = [item["level"] for item in book["items"] if item.get("between")]
    if not between:
        sys.exit("--core: this battery has no interlude, so no core to stop after")
    return min(between)


def reached(book, persona):
    """Whether an item is reached in this persona's run (`stop_of`)."""
    stop = stop_of(book, persona)
    if stop is None:
        return lambda item: True
    way = walk(book, persona)
    return lambda item: place_of(item, way) < stop or (place_of(item, way) == stop and bool(item.get("between")))


def sentence(persona):
    """Who the persona is, in the one sentence it is told."""
    told = persona["told"]
    return f"You are a {told['age']}-year-old {told['gender']}, currently {told['occupation']}."


def describe_persona(persona, condition):
    return "\n".join([sentence(persona), "", "Write your bio, then answer every item." if condition == "bio" else "Answer every item."])


def strayed(book, persona, answers):
    """Where the model's own answers to the demographic questions part from who
    it was told it was — the check that telling the persona in words makes possible."""
    told = persona.get("told")
    if not told:
        return []
    by_key = {item["key"]: item for item in asked(book)}
    expected = {
        "Demographics_Age": told["age"],
        "Demographics_Gender": GENDERS[told["gender"]],
        "Demographics_Student": OCCUPATIONS[told["occupation"]],
    }
    out = []
    for key, wanted in expected.items():
        # Not asked (no student question after a doctorate) or not answered,
        # which `tidy` reports on its own.
        if answers.get(key) is None:
            continue
        given = said(by_key[key], answers[key], answers)
        if given != wanted:
            out.append(f"{key} answered {given!r}, told {wanted!r}")
    return out


def personas(book, n, seed, core=False):
    rng = random.Random(seed)
    made = [sample_persona(book, rng, seed) for _ in range(n)]
    # Set after sampling and drawing nothing, so that one seed is the same
    # people whether they go to the end or stop after the core (`stop_of`).
    for persona in made:
        persona["core"] = core
    WORK.mkdir(parents=True, exist_ok=True)
    (WORK / "personas.json").write_text(json.dumps(made, indent=2), encoding="utf-8")
    print(f"{n} personas sampled (seed {seed}) -> {WORK / 'personas.json'}")
    return made


# ------------------------------------------------------------- the request --


def for_model(book, persona):
    """The items the model answers, in the order this persona was dealt them:
    everything not sampled, not a check, not behind a branch the persona
    closed and not past where its run stops (`reached`)."""
    items = []
    reach = reached(book, persona)
    for item in in_order(book, persona):
        if item["type"] == "briefing" or item["key"] in persona["answers"] or item["check"] is not None or not reach(item):
            continue
        # A follow-up to a fact the persona was given is settled now (the
        # discipline, after an education); one waiting on the model's own
        # answer (a country typed under "Other", the psychiatric treatments)
        # is asked, and pruned afterwards if that answer closed it.
        if item.get("showIf") and item["showIf"]["key"] in persona["answers"] and not shown(item, persona["answers"]):
            continue
        items.append(item)
    return items


def scale_of(item):
    """The scale an item is answered on, in words the model can act on."""
    kind = item["type"]
    if kind == "curve":
        return f"an integer from {item['lowest']} to {item['highest']}: how many people out of 100 you place yourself above"
    if kind == "slider":
        ends = item.get("anchors") or ["", ""]
        return f"an integer from {item['lowest']} ('{plain(ends[0])}') to {item['highest']} ('{plain(ends[1])}')"
    if kind == "input":
        if item["input"] == "number":
            return f"an integer from {item['lowest']} to {item['highest']}"
        if item["multiline"]:
            return "free text, one to four sentences" + (", or an empty string to skip" if item["optional"] else "")
        return "a short phrase, in your own words"
    parts = []
    for option in item["options"]:
        text = plain(option.get("text") or "")
        if text:
            parts.append(f"{option['value']} = {text}")
        elif option.get("label") is not None:
            # A numbered circle with something else written on it (the MINT's
            # "-3" over 0): the value is what is answered, the label what is seen.
            parts.append(f"{option['value']} (shown as {option['label']})")
        else:
            parts.append(str(option["value"]))
    scale = ", ".join(parts)
    if item.get("anchors"):
        scale += f" (from '{plain(item['anchors'][0])}' to '{plain(item['anchors'][1])}')"
    if kind == "multi":
        exclusive = [o for o in item["options"] if o["exclusive"]]
        scale = "a list of every value that applies: " + scale
        if exclusive:
            scale += f" — {exclusive[0]['value']} stands alone and excludes the rest"
    return scale


def render_items(book, persona):
    """What the model is shown, in the order the person would meet it, and the
    key behind each number: as near to the screen as text allows.

    Each item is numbered (`q001`) and carries nothing else about itself. Its
    key would say which instrument and which facet it belongs to, and often
    which way it is keyed, and a questionnaire's name over a run of items would
    say what they measure — none of which the person is told. Over an item
    stands its lead-in and the scale it is answered on, each written when it
    changes, the way the page lights a lead-in that differs from the last one
    shown. A briefing stands where it falls, in the words the person reads,
    since that and not the questionnaire's name is what frames the items after
    it. A follow-up is said to be one, by the number of the item it waits on:
    the page shows it only once that answer is given, and here everything is
    shown. What is not shown is what has no words: the level screens and the
    results between levels — and the attention checks, which the script answers.
    """
    shown = [item["key"] for item in for_model(book, persona)]
    number = {key: f"q{at + 1:03d}" for at, key in enumerate(shown)}
    by_key = {item["key"]: item for item in book["items"]}
    out = []
    lead, scale = None, None
    for item in in_order(book, persona):
        if item["type"] == "briefing":
            words = prose(item.get("text"))
            if words:
                out.append("\n" + words + "\n")
            continue
        if item["key"] not in number:
            continue
        if item.get("instructions") != lead:
            lead = item.get("instructions")
            if lead:
                out.append(f"\n{plain(lead)}")
        if scale_of(item) != scale:
            scale = scale_of(item)
            out.append(f"\nAnswer with {scale}.")
        line = f"- {number[item['key']]}: {plain(worded(item, {}))}"
        waits = (item.get("showIf") or {}).get("key")
        if waits in number:
            opens = item["showIf"]["is"] if isinstance(item["showIf"]["is"], list) else [item["showIf"]["is"]]
            words = " or ".join(f"'{plain(o.get('text') or str(o['value']))}'" for o in by_key[waits]["options"] if o["value"] in opens)
            line += f" (only if you answered {words} to {number[waits]}; otherwise null)"
        out.append(line)
    return shown, "\n".join(out)


def request_for(book, persona, model, effort, condition, system, shown, grain):
    # The answers come back as a list of key-and-value pairs rather than as an
    # object with a property per item: three hundred required properties
    # compile to a grammar over the API's limit (a 400, October 2026), with or
    # without each item's options as an `enum`. So the schema holds the shape
    # and nothing item by item, and `tidy()` checks every key and value against
    # the codebook, writes a bad one as unanswered, and says so.
    # Null for a follow-up the model's own answers left closed (`render_items`).
    # At the `item` grain the screens are not written here: which follow-ups
    # are shown depends on the answers as they come, so `sequential` renders
    # each screen as it is reached, and the format is each screen's own.
    if grain == "item":
        return {
            "custom_id": persona["code"],
            "condition": condition,
            "grain": grain,
            "shown": shown,
            "params": {
                "model": model,
                "max_tokens": MAX_TOKENS,
                "thinking": {"type": "adaptive"},
                "system": [{"type": "text", "text": system}],
                "output_config": {"effort": effort},
            },
        }
    value = {"anyOf": [{"type": "number"}, {"type": "string"}, {"type": "array", "items": {"type": "number"}}, {"type": "null"}]}
    answers = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {"key": {"type": "string"}, "value": value},
            "required": ["key", "value"],
            "additionalProperties": False,
        },
    }
    fields = {"bio": {"type": "string"}, "answers": answers} if condition == "bio" else {"answers": answers}
    schema = {"type": "object", "properties": fields, "required": list(fields), "additionalProperties": False}
    return {
        "custom_id": persona["code"],
        # Ours, not the API's: kept in requests.jsonl so that every file can say
        # which condition it was answered under and which item each number the
        # model was shown stood for, and taken off before a batch is sent.
        "condition": condition,
        "grain": grain,
        "shown": shown,
        "params": {
            "model": model,
            "max_tokens": MAX_TOKENS,
            "thinking": {"type": "adaptive"},
            # Not cached: every persona's items come in an order of its own, so
            # no two requests share the prefix, and a write would only cost.
            "system": [{"type": "text", "text": system}],
            "messages": [{"role": "user", "content": describe_persona(persona, condition)}],
            "output_config": {"effort": effort, "format": {"type": "json_schema", "schema": schema}},
        },
    }


def provenance_of(request):
    """What a file says it was answered by, read off the request that was sent:
    the model, the effort, the condition, and which wording of the instructions
    (a hash of everything above the items, so a file can be traced to its
    prompt after INSTRUCTIONS are rewritten)."""
    params = request["params"]
    head = params["system"][0]["text"].partition("# The items")[0]
    return {
        "model": params["model"],
        "effort": params["output_config"].get("effort"),
        "condition": request.get("condition"),
        "grain": request.get("grain", "all"),
        "prompt": hashlib.sha256(head.encode("utf-8")).hexdigest()[:8],
    }


USAGE = ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens")


def usage_of(message):
    """The tokens a response took, to be written into the file."""
    return {field: getattr(message.usage, field) or 0 for field in USAGE}


def dollars(model, usage, batch):
    """Roughly what a response cost, from its tokens; None for a model PRICES does not know."""
    if model not in PRICES:
        return None
    price_in, price_out, price_cached = PRICES[model]
    cost = (
        usage["input_tokens"] * price_in
        + usage["cache_creation_input_tokens"] * price_in * 1.25
        + usage["cache_read_input_tokens"] * price_cached
        + usage["output_tokens"] * price_out
    ) / 1e6
    return cost / 2 if batch else cost


def build(book, made, model, effort, condition, grain):
    # Rendered per persona: the items come in the order each was dealt, and
    # the facts it was given decide which follow-ups it is asked.
    requests = []
    for persona in made:
        shown, items = render_items(book, persona)
        system = instructions(condition, grain) + (items if grain == "all" else "")
        requests.append(request_for(book, persona, model, effort, condition, system, shown, grain))
    path = WORK / "requests.jsonl"
    path.write_text("\n".join(json.dumps(r) for r in requests) + "\n", encoding="utf-8")

    if grain == "item":
        # Rougher still: every screen reads the conversation so far from the
        # cache, on average half of it, the whole of it is written to the cache
        # once, and an answer is a dozen tokens a screen — before any thinking,
        # which --effort decides and which `live` prints as spent. A screen
        # carries its lead-in and its scale, so the conversation runs to about
        # twice the one request's items (36,000 tokens against 16,000, measured
        # October 2026).
        shown = for_model(book, made[0])
        screens_ = len(shown)
        reach = reached(book, made[0])
        briefings = sum(len(prose(item.get("text"))) for item in book["items"] if item["type"] == "briefing" and reach(item))
        whole = (sum(len(screen_of(item, {})) for item in shown) + briefings) / 2.6 + 400
        guess = {"input_tokens": 0, "cache_creation_input_tokens": whole, "cache_read_input_tokens": screens_ * whole / 2, "output_tokens": screens_ * 12}
        print(f"{len(requests)} conversations of about {screens_} screens each -> {path}")
        each = dollars(model, guess, batch=False)
        if each is None:
            print(f"no price known for {model}")
        else:
            print(f"about ${each:.2f} each at standard rates before any thinking; no batch can carry a conversation, so these go live")
        return requests

    # A rough bill, so the size of a run is known before it is sent. Both
    # numbers were measured on Sonnet 5.5 at effort high (October 2026): the
    # items and the schema come to a token every 2.6 characters of them, and
    # the output (the thinking, then a key and a value for every item) to about
    # 9,000 tokens. A lower effort or another model wants checking against what
    # `live` prints.
    system_tokens = len(requests[0]["params"]["system"][0]["text"]) / 2.6
    guess = {"input_tokens": system_tokens + 400, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0, "output_tokens": 9000}
    print(f"{len(requests)} requests -> {path}")
    each = dollars(model, guess, batch=False)
    if each is None:
        print(f"~{system_tokens:,.0f} tokens of items per request; no price known for {model}")
    else:
        print(f"~{system_tokens:,.0f} tokens of items per request; about ${each:.3f} each at standard rates, ${each / 2:.3f} in a batch")
    return requests


# ------------------------------------------------------------- the answers --


def fake_value(item, rng):
    """A random answer inside the item's own scale."""
    kind = item["type"]
    if kind in ("choice", "grid"):
        return rng.choice(item["options"])["value"]
    if kind == "multi":
        exclusive = [o["value"] for o in item["options"] if o["exclusive"]]
        rest = [o["value"] for o in item["options"] if not o["exclusive"]]
        return exclusive if exclusive and rng.random() < 0.5 else rng.sample(rest, rng.randint(1, min(3, len(rest))))
    if kind in ("curve", "slider") or item["input"] == "number":
        return rng.randint(item["lowest"], item["highest"])
    return "" if item["optional"] and rng.random() < 0.5 else "fake"


def fake_answers(book, persona, rng):
    """Random answers inside each item's own scale — the app's test mode, without the browser."""
    return {item["key"]: fake_value(item, rng) for item in for_model(book, persona)}


def unmask(given, shown):
    """The answers under the keys of the items they answer: a number the model
    was shown (`q017`) back to the item it stood for, and anything else left as
    it came, for `tidy` to report as an answer to no item."""
    out = {}
    for key, value in given.items():
        match = re.fullmatch(r"q(\d+)", key)
        at = int(match.group(1)) - 1 if match else -1
        out[shown[at] if 0 <= at < len(shown) else key] = value
    return out


# The fewest answers a scale can be read off. One or two answers off an item's
# scale say nothing about which scale they were given on.
READ_FROM = 3


def numbered(item):
    """The bounds of an item answered on consecutive whole numbers (a row of
    circles, a Likert scale), its ways out aside; None for any other."""
    if item["type"] != "choice":
        return None
    values = [o["value"] for o in item["options"] if not o["custom"] and not o["small"]]
    if not values or not all(isinstance(v, int) and not isinstance(v, bool) for v in values):
        return None
    low, high = min(values), max(values)
    return (low, high) if sorted(values) == list(range(low, high + 1)) else None


def reading_of(values, low, high):
    """The scale a questionnaire's answers were all given on, where some went
    past the top of the item's own and one other scale accounts for every one
    of them, as its name and the reading back onto the item's own; None where
    none does. Two are read, and nothing else:

    - One up from the item's own (1 to 7 for 0 to 6), where the answers reach
      both its ends: the lowest is one above the item's foot and the highest
      one above its top. Shifted down a point. Answers that only go one past
      the top now and then, never touching the foot, are as like a person who
      never chose the lowest point and slipped, and are not read.
    - 0 to 100, the scale of the test's own curve and slider items: every
      answer inside it and most of them past the item's top. Rescaled and
      rounded to the nearest point, halves up.

    The first is tried first, since answers on it are inside 0 to 100 too."""
    whole = all(v == int(v) for v in values)
    if whole and min(values) == low + 1 and max(values) == high + 1:
        return f"{low + 1}-{high + 1}", lambda v: int(v) - 1
    if all(0 <= v <= 100 for v in values) and sum(v > high for v in values) > len(values) / 2:
        return "0-100", lambda v: low + int(v * (high - low) / 100 + 0.5)
    return None


def read_back(code, book, given):
    """Answers off their item's scale, read back where the questionnaire was
    answered consistently on another one, and recorded either way.

    A model now and then answers a whole questionnaire on a scale it was not
    given (the MINT on 0 to 100, in 2 runs out of 500): every answer then says
    where the person stands on the item's scale as plainly as the right number
    would, so it is read back onto it (`reading_of`), the questionnaire's
    answers that were inside the item's scale included, since they were given
    on the other one too. Another scale is only looked for where an answer
    went past the top of the item's; any other answer off the scale (below its
    foot, between two points), and any the two readings do not account for, is
    left unanswered. Every answer changed or dropped is recorded
    (`offscale` in the file's `synthetic`), with what was given, what was saved
    and the scale it was read on, so that how often this happens can be
    compared across models and efforts."""
    groups = {}
    for item in asked(book):
        bounds = numbered(item)
        value = given.get(item["key"])
        if bounds is None or not isinstance(value, (int, float)) or isinstance(value, bool):
            continue
        # A way out ("I'd rather not say", valued off the scale) is an answer
        # on any scale and says nothing about which.
        if value in [o["value"] for o in item["options"] if o["custom"] or o["small"]]:
            continue
        groups.setdefault((item["questionnaire"], bounds), []).append(item)

    out, records = dict(given), []
    for (questionnaire, (low, high)), items in groups.items():
        values = {item["key"]: given[item["key"]] for item in items}
        off = [key for key, v in values.items() if not (v == int(v) and low <= v <= high)]
        if not off:
            continue
        past = any(v > high for v in values.values())
        reading = reading_of(list(values.values()), low, high) if past and len(values) >= READ_FROM else None
        if reading:
            scale, back = reading
            print(f"  ! {code} {questionnaire}: answered on {scale} rather than {low}-{high}, read back ({len(values)} answers)")
            for key, v in values.items():
                if back(v) != v:
                    out[key] = back(v)
                    records.append({"key": key, "questionnaire": questionnaire, "given": v, "saved": out[key], "scale": scale})
        else:
            print(f"  ! {code} {questionnaire}: {len(off)} answers off {low}-{high} on no one other scale, left unanswered: {', '.join(off[:8])}")
            for key in off:
                out[key] = None
                records.append({"key": key, "questionnaire": questionnaire, "given": values[key], "saved": None, "scale": None})
    return out, records


def tidy(book, persona, given):
    """Every answer checked against its item, follow-ups pruned, checks passed,
    and the model's demographics held up against who it was told it was.
    Returns the answers and the record of those read back or dropped for being
    off their scale (`read_back`)."""
    known = {item["key"] for item in asked(book)}
    unknown = sorted(set(given) - known)
    if unknown:
        print(f"  ! {persona['code']}: {len(unknown)} answers to no item, dropped: {', '.join(unknown[:8])}{' …' if len(unknown) > 8 else ''}")
    given = {key: value for key, value in given.items() if key in known}
    given, offscale = read_back(persona["code"], book, given)

    answers = dict(persona["answers"])
    reach = reached(book, persona)
    for item in asked(book):
        if item["check"] is not None and reach(item):
            answers[item["key"]] = item["check"]
    for key, value in given.items():
        answers[key] = value

    for item in asked(book):
        key = item["key"]
        value = answers.get(key)
        if value is None:
            continue
        if not shown(item, answers):
            answers[key] = None  # a branch the answers closed, as pruneBranches() would
            continue
        kind = item["type"]
        values = [o["value"] for o in item["options"]]
        if kind in ("choice", "grid") and value not in values:
            print(f"  ! {persona['code']} {key}: {value!r} is not an option, left unanswered")
            answers[key] = None
        elif kind == "multi":
            chosen = [v for v in (value if isinstance(value, list) else [value]) if v in values]
            exclusive = [v for v in chosen if any(o["value"] == v and o["exclusive"] for o in item["options"])]
            chosen = exclusive[:1] if exclusive else chosen
            # Authored order, not the order given: two people who chose the same things save the same answer.
            answers[key] = [v for v in values if v in chosen] or None
        elif kind in ("curve", "slider") or (kind == "input" and item["input"] == "number"):
            if not isinstance(value, (int, float)) or not item["lowest"] <= value <= item["highest"]:
                print(f"  ! {persona['code']} {key}: {value!r} is outside {item['lowest']}-{item['highest']}, left unanswered")
                answers[key] = None
        elif kind == "input":
            text = str(value).strip()
            answers[key] = text if text or item["optional"] else None

    # Missing is counted once the branches are settled: a follow-up the model's
    # own answers closed (no "Other", so no country to type) was rightly left out.
    # An answer dropped for being off its scale was given, and is reported there.
    dropped = {record["key"] for record in offscale}
    missing = [item["key"] for item in for_model(book, persona) if shown(item, answers) and given.get(item["key"]) is None and item["key"] not in dropped]
    if missing:
        print(f"  ! {persona['code']}: {len(missing)} items not answered, left unanswered: {', '.join(missing[:8])}{' …' if len(missing) > 8 else ''}")
    for problem in strayed(book, persona, answers):
        print(f"  ! {persona['code']}: strayed from the persona: {problem}")
    return answers, offscale


def said(item, value, answers):
    """An answer as it was read on screen — the option's words, not its code — as `said()` writes it."""
    if value is None:
        return None
    if isinstance(value, list):
        return [said(item, one, answers) for one in value]
    option = next((o for o in item["options"] if o["value"] == value), None)
    if not option:
        return value
    label = worded(option, answers)
    return label if label is not None else (option["label"] if option.get("label") is not None else value)


def filed(name):
    """A vote's key: the reading's name with the spaces and punctuation taken out (`filed()` in results.js)."""
    return re.sub(r"[^A-Za-z0-9]+(.)?", lambda m: m.group(1).upper() if m.group(1) else "", name)


def feedback_keys(book):
    keys = []
    for name in book["run"]:
        if name in FIGURE_VOTES:
            names = FIGURE_VOTES[name]
        elif not book["questionnaires"][name]["results"]:
            names = []
        else:
            norms = book["questionnaires"][name]["norms"]
            names = [dim for dim, norm in norms.items() if norm["interpretations"]]
        for one in names:
            # A figure's vote names its own key; a dimension's is written beside
            # its norms in `content/` and comes through the codebook, with
            # `filed()` left as the fallback `feedbackKey()` has in results.js.
            written = None
            if name not in FIGURE_VOTES:
                written = (book["questionnaires"][name]["norms"].get(one) or {}).get("key")
            key = written or filed(one)
            if key not in keys:
                keys.append(key)
    return keys


def fork_offers(way):
    """Every fork choice of a walk, as (the place it decides, the entries
    offered for it, in walked order).

    A fork's levels fill a run of places one after another with the same
    `fork`, the number being how many are offered at once. A choice is made on
    the screen of the place *before* the one it decides, and the last place of
    a run is what is left rather than a choice. The page draws what each
    choice offers out of every level still to place and recommends the one
    standing first in its drawn order; a run that takes the recommendation
    walks its drawn order, and the next `fork` of its levels in that order is
    the one set the draw can have given it.
    """
    runs = []
    for entry in way:
        if not entry["fork"]:
            continue
        last = runs[-1] if runs else None
        if last and last[-1]["fork"] == entry["fork"] and last[-1]["place"] == entry["place"] - 1:
            last.append(entry)
        else:
            runs.append([entry])
    return [(run[at]["place"], run[at : at + run[at]["fork"]]) for run in runs for at in range(len(run) - 1)]


def fork_choices(way, stop=None):
    """Place -> the `choice` on that place's entry in `levels`, as
    `container()` writes it, for each place whose screen offers one. Laid out
    on no page, the cards stand in the order the levels are walked, and the
    first of them is both the one recommended and the one taken. A run that
    stops (`stop_of`) makes no choice of what stands where it stops or after."""
    return {
        place - 1: {
            "offered": [one["key"] for one in offered],
            "recommended": offered[0]["key"],
            "chosen": offered[0]["key"],
        }
        for place, offered in fork_offers(way)
        if stop is None or place < stop
    }


def onward(book, way, stop=None):
    """The briefing that ends an interlude, keyed by the place it opens, and
    the words it is answered with: the fork choice of what stands there, which
    it offers in place of the level screen before it (`onward` in app.js) —
    taken as recommended, the levels offered in the order walked. A run that
    stops at the interlude reads it and chooses nothing."""
    heads = {item["level"]: item["key"] for item in book["items"] if item.get("onward")}
    return {
        heads[place]: [one["name"] for one in offered]
        for place, offered in fork_offers(way)
        if place in heads and (stop is None or place < stop)
    }


def screens(book, way, stop=None):
    """One item per level screen, keyed by the place it showed.

    Its `response` is the way on that was taken. A synthetic run walks its
    drawn order, which is every fork choice taken as recommended: where a
    place ends in a fork, those offered are the next `fork` levels in that
    order (or all that are left, when fewer), the first of them is the one
    taken and the rest follow it as the ones passed over; otherwise it is the
    words on the one button, which say so when the way on goes through the
    seabed. A choice an interlude offers after it instead is not the level
    screen's but the interlude's briefing's (`onward`). A run that stops
    (`stop_of`) reaches no level screen where it stops or after, and those
    are null, as in a run left there.
    """
    # The floor is the last scored place in the water, and only where there is
    # rock under it to go down into — `floorLevel` in app.js.
    water = [entry["place"] for entry in way if entry["scored"] and not entry["beneath"]]
    rock = [entry["place"] for entry in way if entry["scored"] and entry["beneath"]]
    floor = water[-1] if water and rock else None

    opened = {item["level"] for item in book["items"] if item.get("onward")}
    taken = {place - 1: [one["name"] for one in offered] for place, offered in fork_offers(way) if place not in opened}
    way_on = lambda place: taken.get(place, "Go beneath the floor →" if place == floor else "Continue the test →")

    return {
        entry["place"]: {
            "key": "Level_" + str(entry["place"]),
            "questionnaire": None,
            "response": way_on(entry["place"]) if stop is None or entry["place"] < stop else None,
            "timeOnset": None,
            "timeResponse": None,
        }
        for entry in way
        if entry["scored"]
    }


def walked(book, persona, answers):
    """The run's items in the order this persona was dealt them, each in the
    shape a saved item has but for its `order`, with each level screen standing
    after the last item of the place it showed — which is where `container()`
    splices them in. Shuffling never crosses a questionnaire, so a level's
    items stay together however they were dealt."""
    way = walk(book, persona)
    stop = stop_of(book, persona)
    shown = screens(book, way, stop)
    chosen = onward(book, way, stop)
    out = []
    standing = None
    for item in in_order(book, persona):
        place = place_of(item, way)
        if place != standing:
            if standing in shown:
                out.append(shown[standing])
            standing = place
        out.append(
            {
                "key": item["key"],
                "questionnaire": item["questionnaire"],
                "response": chosen.get(item["key"]) if item["type"] == "briefing" else said(item, answers.get(item["key"]), answers),
                "timeOnset": None,
                "timeResponse": None,
            }
        )
    if standing in shown:
        out.append(shown[standing])
    return out


def write_file(book, persona, given, bio, provenance):
    answers, offscale = tidy(book, persona, given)
    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")

    # Kept on no account, as a run whose link did not ask for one (`account`
    # null, the app's own shape for that).
    file = {"version": book["version"], "participant": persona["code"], "account": None, "testMode": False}
    # `told` is who the persona was told it was, so that its own demographic
    # answers can be held up against it at analysis time as `strayed` does here.
    # `offscale` is every answer read back or dropped for being off its scale
    # (`read_back`), empty where there were none, so that how often it happens
    # can be counted across models and efforts.
    # `core` is whether the persona stopped after the core (`stop_of`).
    file["synthetic"] = dict(provenance, seed=persona["seed"], told=persona.get("told"), bio=bio, core=bool(persona.get("core")), offscale=offscale, generated=now)
    # The mint battery (codebook.js reads no other), its levels drawn for this
    # persona and walked as drawn (`walk`).
    file["battery"] = "mint"
    file["source"] = "Synthetic"  # the app writes a string here always, "Unknown" where the link named none
    # Answered on no screen at all.
    for field in ("device", "touchscreen", "screenLayout", "screenLayouts", "viewport", "screen"):
        file[field] = None
    way = walk(book, persona)
    chosen = fork_choices(way, stop_of(book, persona))
    file["levels"] = [{"key": entry["key"], "name": entry["name"], "blocks": entry["blocks"], "choice": chosen.get(entry["place"])} for entry in way]
    # The questionnaires in the order asked (`RUN`), which the drawn levels decide.
    file["questionnaires"] = []
    for item in in_order(book, persona):
        if item["questionnaire"] and item["questionnaire"] not in file["questionnaires"]:
            file["questionnaires"].append(item["questionnaire"])
    file["timeStart"] = now
    for entry in way:
        file["timeLevel" + str(entry["place"])] = None
    file["formatMint"] = book["formatMint"]
    # Keyed by the level's key, the way `container()` keys it: a number is a
    # place in one person's run, a key is the same level for everybody, and the
    # name beside it is prose that may be reworded without moving a column.
    # Every check is passed, so a level carrying one failed none, and a level
    # carrying none, or not reached by a run that stopped, has null there,
    # the way `qualityControl` writes it.
    by_number = {level["level"]: level for level in book["levels"]}
    reach = reached(book, persona)
    checked = {by_number[item["level"]]["key"] for item in asked(book) if item["check"] is not None and reach(item)}
    file["qualityControl"] = {
        entry["key"]: {
            "responseTimeMean": None,
            "responseTimeSD": None,
            "attentionChecksFailed": 0 if entry["key"] in checked else None,
        }
        for entry in way
    }
    file["items"] = [
        {
            "key": entry["key"],
            "questionnaire": entry["questionnaire"],
            "order": position + 1,
            "response": entry["response"],
            "timeOnset": entry["timeOnset"],
            "timeResponse": entry["timeResponse"],
        }
        for position, entry in enumerate(walked(book, persona, answers))
    ]
    file["feedback"] = {key: None for key in feedback_keys(book)}
    # A model is not asked what it made of the level it has just read, so the
    # stars are null throughout — one key per level screen, as in a real run.
    file["ratings"] = {entry["key"]: None for entry in way if entry["scored"]}

    # Named by who and by which answering of them (`draw_code`), everything
    # else being inside the file.
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / (persona["code"] + "_" + provenance["draw"] + ".json")
    path.write_text(json.dumps(file, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def parse(message, code):
    """The JSON out of a response, or None with a word about why."""
    if message.stop_reason == "refusal":
        print(f"  ! {code}: the model declined ({getattr(message, 'stop_details', None)})")
        return None
    if message.stop_reason == "max_tokens":
        # The answers come last, after the thinking, so a response cut short is
        # a JSON object cut short — said plainly here rather than as a parse error.
        print(f"  ! {code}: ran out of tokens after {message.usage.output_tokens:,}; raise MAX_TOKENS or lower --effort")
        return None
    text = next((block.text for block in message.content if block.type == "text"), None)
    if text is None:
        print(f"  ! {code}: no text in the response")
        return None
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        print(f"  ! {code}: response is not JSON ({e})")
        return None
    # The answers arrive as a list of pairs (see `request_for`); everything after
    # this reads them by key. A key given twice keeps its last value.
    data["answers"] = {pair["key"]: pair["value"] for pair in data["answers"]}
    return data


# ------------------------------------------------------------ the screens --


def screen_of(item, answers):
    """One item as its screen: the lead-in over it, the question, the scale under it."""
    lines = []
    if item.get("instructions"):
        lines.append(plain(item["instructions"]))
    lines.append(plain(worded(item, answers)))
    lines.append(f"Answer with {scale_of(item)}.")
    return "\n\n".join(lines)


# What a screen's answer may be: a number, the words asked for, or a list of
# numbers — one schema for every screen, and not one holding each to its own
# options, which would be exact. The cache is keyed by the schema (measured,
# October 2026: a screen whose schema differed from the last few turns' was a
# full rewrite of the conversation, thirty-one of them a run, more than every
# read put together), so one shape holds the JSON and `tidy` holds the value
# to the item's scale, as it does for the `all` grain.
VALUE_SCHEMA = {
    "type": "object",
    "properties": {"value": {"anyOf": [{"type": "number"}, {"type": "string"}, {"type": "array", "items": {"type": "number"}}]}},
    "required": ["value"],
    "additionalProperties": False,
}

BIO_SCHEMA = {"type": "object", "properties": {"bio": {"type": "string"}}, "required": ["bio"], "additionalProperties": False}


def sequential(book, persona, request, ask, draw):
    """The run walked one screen at a time, as a conversation: each screen a
    user turn, the model's answer the assistant turn after it, and the next
    screen read with all of that behind it and nothing ahead. `ask(params,
    messages, schema, item)` answers a turn — the API, or a draw for a fake
    run — and gives back the answer parsed, the text it came as and the tokens
    it took; the schema is `VALUE_SCHEMA` on every screen but the biography's. A follow-up is shown only once the answer that opens it is given,
    as the page shows it; a briefing's words go at the top of the screen after
    it, a screen with nothing to answer on being a turn with nothing to say;
    the persona's sentence opens the first screen or, in the `bio` condition,
    the turn before it. What was shown and said is kept whole in
    `work/conversations/`, under the persona's code and the `draw`. Returns
    the answers under the items' own keys, the biography and the tokens
    summed."""
    params = request["params"]
    shown_keys = set(request["shown"])
    answers = dict(persona["answers"])  # the birthday, which is never shown
    given = {}
    messages = []
    usage = {field: 0 for field in USAGE}
    turns = []  # what each screen cost, kept beside the conversation
    bio = None

    def turn(text, schema, item):
        # One cache breakpoint, on the latest screen: the conversation up to it
        # is read from the cache next turn and only the new screen and its
        # answer are written to it. A request may carry four at most.
        for message in messages:
            for block in message["content"]:
                block.pop("cache_control", None)
        messages.append({"role": "user", "content": [{"type": "text", "text": text, "cache_control": {"type": "ephemeral"}}]})
        data, said, spent = ask(params, messages, schema, item)
        for field in usage:
            usage[field] += spent.get(field, 0)
        turns.append({"key": item["key"] if item else "bio", "usage": spent})
        if data is None:
            messages.pop()  # a turn that failed is no screen the person saw
            return None
        messages.append({"role": "assistant", "content": [{"type": "text", "text": said}]})
        return data

    opening = sentence(persona)
    if request["condition"] == "bio":
        data = turn(opening + "\n\n" + BIO, BIO_SCHEMA, None)
        bio = data.get("bio") if data else None
        opening = None
    above = []
    for item in in_order(book, persona):
        if item["type"] == "briefing":
            words = prose(item.get("text"))
            if words:
                above.append(words)
            continue
        if item["key"] not in shown_keys or not shown(item, answers):
            continue
        text = "\n\n".join(([opening] if opening else []) + above + [screen_of(item, answers)])
        opening, above = None, []
        data = turn(text, VALUE_SCHEMA, item)
        given[item["key"]] = data.get("value") if data else None
        answers[item["key"]] = given[item["key"]]

    folder = WORK / "conversations"
    folder.mkdir(parents=True, exist_ok=True)
    kept = {"system": params["system"], "messages": messages, "turns": turns}
    (folder / (persona["code"] + "_" + draw + ".json")).write_text(json.dumps(kept, indent=2, ensure_ascii=False), encoding="utf-8")
    return given, bio, usage


def parse_turn(message, code, name):
    """One screen's answer out of a response — the object and the text it came as — or None twice, with a word about why."""
    if message.stop_reason == "refusal":
        print(f"  ! {code} {name}: the model declined ({getattr(message, 'stop_details', None)})")
        return None, None
    if message.stop_reason == "max_tokens":
        print(f"  ! {code} {name}: ran out of tokens after {message.usage.output_tokens:,}; lower --effort")
        return None, None
    text = next((block.text for block in message.content if block.type == "text"), None)
    if text is None:
        print(f"  ! {code} {name}: no text in the response")
        return None, None
    try:
        return json.loads(text), text
    except json.JSONDecodeError as e:
        print(f"  ! {code} {name}: response is not JSON ({e})")
        return None, None


def asking(api, code):
    """The API as `sequential` asks it: one turn, with the screen's own schema on the request."""

    def ask(params, messages, schema, item):
        sent = dict(params, messages=messages, output_config=dict(params["output_config"], format={"type": "json_schema", "schema": schema}))
        message = api.messages.create(**sent)
        data, said = parse_turn(message, code, item["key"] if item else "bio")
        return data, said, usage_of(message)

    return ask


def drawing(rng):
    """A fake model for `sequential`: a random answer inside each screen's own scale, and no tokens."""

    def ask(params, messages, schema, item):
        data = {"bio": "(fake run: random answers)"} if item is None else {"value": fake_value(item, rng)}
        return data, json.dumps(data), {}

    return ask


# ------------------------------------------------------------------ the API --


def client():
    try:
        import anthropic
    except ImportError:
        sys.exit("pip install anthropic")
    return anthropic.Anthropic()


def submit(requests):
    if requests[0].get("grain") == "item":
        sys.exit("a batch cannot carry a conversation: `run` walks the screens live at --grain item, or build with --grain all")
    batch = client().messages.batches.create(requests=[{"custom_id": r["custom_id"], "params": r["params"]} for r in requests])
    # A batch's results do not repeat what was asked for, so what every file
    # will say it was answered by is kept beside the batch's id.
    record = dict({"id": batch.id}, **provenance_of(requests[0]), created=batch.created_at.isoformat(), requests=len(requests))
    (WORK / "batch.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(f"batch {batch.id} submitted ({len(requests)} requests). Collect it with:  synthesize.py collect --wait")
    return batch


def collect(book, wait):
    import time

    record = json.loads((WORK / "batch.json").read_text(encoding="utf-8"))
    made = {p["code"]: p for p in json.loads((WORK / "personas.json").read_text(encoding="utf-8"))}
    # The requests as sent say which item each number the model was shown stood
    # for; a request from before the items were numbered carries no `shown`, and
    # its answers come under the items' own keys, which `unmask` leaves alone.
    sent = {r["custom_id"]: r for r in (json.loads(line) for line in (WORK / "requests.jsonl").read_text(encoding="utf-8").splitlines() if line)}
    api = client()
    while True:
        batch = api.messages.batches.retrieve(record["id"])
        if batch.processing_status == "ended":
            break
        counts = batch.request_counts
        print(f"{batch.processing_status}: {counts.processing} processing, {counts.succeeded} succeeded, {counts.errored} errored")
        if not wait:
            return
        time.sleep(60)

    written, spent = 0, 0.0
    for result in api.messages.batches.results(record["id"]):
        code = result.custom_id
        if result.result.type != "succeeded":
            print(f"  ! {code}: {result.result.type}")
            continue
        message = result.result.message
        usage = usage_of(message)
        spent += dollars(record["model"], usage, batch=True) or 0
        data = parse(message, code)
        if data is None:
            continue
        # A batch.json written before these were recorded has none of them.
        provenance = {
            "model": record["model"],
            "batch": record["id"],
            "effort": record.get("effort"),
            "condition": record.get("condition"),
            "grain": record.get("grain", "all"),
            "prompt": record.get("prompt"),
            "draw": draw_code(record["id"] + ":" + code),
            "usage": usage,
        }
        write_file(book, made[code], unmask(data["answers"], sent.get(code, {}).get("shown") or []), data.get("bio"), provenance)
        written += 1
    print(f"{written} files written to {OUT}; about ${spent:.2f} at batch rates")


def live(book, made, requests, parallel):
    api = client()
    if requests[0].get("grain") == "item":
        return live_screens(book, made, requests, api, parallel)
    spent = 0.0
    for persona, request in zip(made, requests):
        # Streamed, though nothing reads it as it comes: a plain request sends
        # nothing back for the minutes the answers take, and a connection that
        # quiet is dropped on the way (October 2026), after the tokens are spent.
        with api.messages.stream(**request["params"]) as stream:
            response = stream.get_final_message()
        provenance = dict(provenance_of(request), batch=None, draw=draw_code(), usage=usage_of(response))
        cost = dollars(provenance["model"], provenance["usage"], batch=False)
        spent += cost or 0
        usage = provenance["usage"]
        print(
            f"{persona['code']}: {usage['input_tokens']:,} in, {usage['cache_creation_input_tokens']:,} written to the cache, "
            f"{usage['cache_read_input_tokens']:,} read from it, {usage['output_tokens']:,} out"
            + (f", ~${cost:.3f}" if cost is not None else "")
        )
        data = parse(response, persona["code"])
        if data is None:
            continue
        print("  " + write_file(book, persona, unmask(data["answers"], request["shown"]), data.get("bio"), provenance).name)
    print(f"about ${spent:.2f} in all, at standard rates")


def live_screens(book, made, requests, api, parallel):
    """Each persona's conversation, `parallel` of them at a time, a persona's
    file written as its conversation ends and one persona's trouble costing
    the rest nothing."""
    from concurrent.futures import ThreadPoolExecutor

    def one(pair):
        persona, request = pair
        draw = draw_code()
        try:
            given, bio, usage = sequential(book, persona, request, asking(api, persona["code"]), draw)
        except Exception as e:
            print(f"  ! {persona['code']}: {e}")
            return 0.0
        provenance = dict(provenance_of(request), batch=None, draw=draw, usage=usage)
        cost = dollars(provenance["model"], usage, batch=False)
        path = write_file(book, persona, given, bio, provenance)
        print(
            f"{persona['code']}: {len(given):,} screens, {usage['input_tokens']:,} in, {usage['cache_creation_input_tokens']:,} written to the cache, "
            f"{usage['cache_read_input_tokens']:,} read from it, {usage['output_tokens']:,} out"
            + (f", ~${cost:.3f}" if cost is not None else "")
            + f" -> {path.name}"
        )
        return cost or 0.0

    with ThreadPoolExecutor(max_workers=parallel) as pool:
        spent = sum(pool.map(one, zip(made, requests)))
    print(f"about ${spent:.2f} in all, at standard rates")


def fake(book, made, seed, grain):
    rng = random.Random(seed)
    # The same fields as a real run's, empty, so every synthetic file has one shape.
    for persona in made:
        provenance = {"model": "fake", "batch": None, "effort": None, "condition": None, "grain": grain, "prompt": None, "draw": draw_code(), "usage": None}
        if grain == "item":
            shown = [item["key"] for item in for_model(book, persona)]
            request = {"condition": "typical", "shown": shown, "params": {"system": [{"type": "text", "text": instructions("typical", grain)}]}}
            given, bio, _ = sequential(book, persona, request, drawing(rng), provenance["draw"])
        else:
            given, bio = fake_answers(book, persona, rng), "(fake run: random answers)"
        path = write_file(book, persona, given, bio, provenance)
        print("  " + path.name)


# --------------------------------------------------------------------- CLI --


def main():
    cli = argparse.ArgumentParser(description=__doc__.split("\n\n")[1], formatter_class=argparse.RawDescriptionHelpFormatter)
    cli.add_argument("--model", default=MODEL)
    cli.add_argument("--effort", default=EFFORT, choices=["low", "medium", "high", "xhigh", "max"])
    cli.add_argument("--condition", default="typical", choices=CONDITIONS, help="how much the persona is made a person of its own (see CONDITIONS)")
    cli.add_argument("--grain", default="item", choices=GRAINS, help="how the model meets the items: one screen a turn, or all in one request (see GRAINS)")
    cli.add_argument("--seed", type=int, default=None, help="for the personas; random if not given")
    cli.add_argument("--core", action="store_true", help="personas stop after the core and the interim, as a participant who does only the mandatory part (see stop_of)")
    steps = cli.add_subparsers(dest="step", required=True)
    steps.add_parser("codebook", help="read the items out of content/ into work/codebook.json")
    steps.add_parser("personas", help="sample personas into work/personas.json").add_argument("--n", type=int, default=10)
    steps.add_parser("build", help="write the requests for the personas into work/requests.jsonl")
    steps.add_parser("submit", help="send work/requests.jsonl as a Message Batch")
    steps.add_parser("collect", help="fetch a finished batch and write out/*.json").add_argument("--wait", action="store_true")
    run = steps.add_parser("run", help="personas + build, then send: screen by screen (live) at --grain item, a batch at --grain all")
    run.add_argument("--n", type=int, default=10)
    run.add_argument("--parallel", type=int, default=4, help="conversations at a time, at --grain item")
    how = run.add_mutually_exclusive_group()
    how.add_argument("--live", action="store_true", help="one request at a time, files written as they return")
    how.add_argument("--fake", action="store_true", help="random answers, no API call")
    args = cli.parse_args()

    seed = args.seed if args.seed is not None else random.randrange(1 << 30)
    book = codebook()

    if args.step == "codebook":
        print(f"{len(asked(book))} items in {len(book['run'])} questionnaires -> {WORK / 'codebook.json'}")
    elif args.step == "personas":
        personas(book, args.n, seed, args.core)
    elif args.step == "build":
        made = json.loads((WORK / "personas.json").read_text(encoding="utf-8"))
        build(book, made, args.model, args.effort, args.condition, args.grain)
    elif args.step == "submit":
        # What was built is what is sent, whatever --model and --effort say now.
        requests = [json.loads(line) for line in (WORK / "requests.jsonl").read_text(encoding="utf-8").splitlines() if line]
        submit(requests)
    elif args.step == "collect":
        collect(book, args.wait)
    elif args.step == "run":
        made = personas(book, args.n, seed, args.core)
        if args.fake:
            fake(book, made, seed, args.grain)
            return
        requests = build(book, made, args.model, args.effort, args.condition, args.grain)
        if args.live or args.grain == "item":
            live(book, made, requests, args.parallel)
        else:
            submit(requests)


if __name__ == "__main__":
    main()
