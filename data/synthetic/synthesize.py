"""
data/synthetic/synthesize.py — synthetic runs of the test, answered by Claude
as a sampled persona, and written in the shape the app saves.

Nothing here touches the page or the browser. The test is data, so one API
request per persona answers every item at once, and the answers are written
into the same JSON `container()` produces — `items[]` with the words that
would have been on screen, `feedback` and `ratings` all null, null times — so that an
analysis reads a synthetic run and a real one with one code path. Every file
is flagged: the participant code starts `synthetic-` and the file carries a
`synthetic` field saying which model and persona wrote it. Nothing is ever
sent to DataPipe.

    pip install anthropic                      # once; bun (or node) reads the codebook
    python data/synthetic/synthesize.py run --n 20            # sample, build, send as a batch
    python data/synthetic/synthesize.py collect --wait        # fetch the batch, write out/*.json
    python data/synthetic/synthesize.py run --n 3 --live      # three personas now, no batch
    python data/synthetic/synthesize.py run --n 5 --fake      # random answers, no API, no cost

The steps can also be taken one at a time (`codebook`, `personas`, `build`,
`submit`, `collect`), and everything in between is left in `work/` where it
can be read: the codebook, the personas, and the exact requests sent.

How a persona is made: its demographics are *sampled* here, from the options
of the demographic items themselves, so that the set of personas covers the
grid rather than the two or three stereotypes anybody would write by hand.
The model is then handed those facts (and a random life circumstance or two),
asked to write a short biography consistent with them, and to answer every
remaining item as that person. Attention checks are answered correctly by
the script — an attentive person is being simulated — and follow-up items are
pruned the way `pruneBranches()` prunes them, so a closed branch is null.

The answers are constrained by a JSON schema (structured outputs), so every
value is one of the item's own options; whatever the schema cannot express
(a number's range, the 'none of these' rule of a list) is checked here and a
bad value is written as unanswered rather than trusted.

What this is for: exercising the pipeline end to end, smoke-testing scoring
and reverse-keying, seeing what the figures look like across the space. It
is not a source of norms, and synthetic runs must never be pooled with
participants: models answer in socially desirable ways, avoid the extremes,
and vary far less than people do, however hard the prompt pushes back.
"""

import argparse
import datetime as dt
import html
import json
import random
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
WORK = HERE / "work"
OUT = HERE / "out"

MODEL = "claude-sonnet-5"
MAX_TOKENS = 16000

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

# A circumstance or two, so that two personas with the same demographics are
# not the same person. Sampled with the seed, so a persona can be rebuilt.
FLAVOURS = [
    "You are going through a divorce.",
    "You recently became a parent for the first time.",
    "You have been unemployed for six months and are worried about money.",
    "You run your own small business and work most evenings.",
    "You are a keen amateur athlete and train most days.",
    "You care for an elderly parent at home.",
    "You moved to a new city last year and know few people there.",
    "You are devoutly religious.",
    "You are a committed atheist and find most people credulous.",
    "You were treated for depression a few years ago and are well now.",
    "You have chronic back pain that limits what you can do.",
    "You barely sleep because of a new baby or shift work.",
    "You are studying for professional exams on top of a full-time job.",
    "You spend a great deal of time online and follow AI developments closely.",
    "You distrust technology companies and avoid smartphones where you can.",
    "You are recently retired and finding the days long.",
    "You are in the happiest relationship of your life.",
    "You drink more than you would admit to a doctor.",
    "You are ambitious and a little ruthless about your career.",
    "You are shy, bookish and content with a small circle.",
    "You have a large, loud, close family you see every week.",
    "You have just been promoted and feel out of your depth.",
    "You volunteer at a local charity most weekends.",
    "You are recovering from a long illness.",
]

SYSTEM_HEAD = """You are taking part in an online psychology study as one specific, ordinary person, described in the user's message. You are not an assistant here: you are that person, answering questions about yourself.

First, in `bio`, write two to four sentences of biography consistent with the facts given — invent the specifics: work, relationships, habits, what is going on in your life right now. Then answer every item below as that person would, honestly.

Answer the way real people answer questionnaires, not the way a careful assistant would:
- Use the whole scale. When something is true of this person they say so at the extreme; do not hover around the middle or agree mildly with everything.
- Stay consistent with who you are, but not perfectly: people contradict themselves a little, have moods, and read items in their own way.
- Do not give socially desirable answers by default. Some people are vain, unwell, cynical, lonely or reckless, and their answers show it.
- Where a questionnaire asks about a period (the last two weeks, the last year), answer about that period in this person's life.
- "None of these" and "Prefer not to say" are real options that some people take.
- The last item invites free comments on the test: write what this person would write, in their own voice, or return an empty string if they would skip it.

Return one JSON object with `bio` and `answers`, where `answers` holds every item key listed below with its value. Each item is written as `key: question`, and the scale it is answered on is given above the items that share it.

# The items
"""


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


def is_demographic(item):
    return (item.get("questionnaire") or "").startswith("demographics")


# ---------------------------------------------------------------- personas --


def sample_persona(book, rng, seed):
    """Demographics drawn from the items' own options; the rest is left to the model."""
    answers = {}
    for item in asked(book):
        if not is_demographic(item) or not shown(item, answers):
            continue
        if item["type"] == "choice":
            # An option may wait on an answer too (the 31st on a month that has one).
            pool = [o for o in item["options"] if not o["custom"] and shown(o, answers)]
            answers[item["key"]] = rng.choice(pool)["value"]
        elif item["type"] == "input" and item["input"] == "number":
            # Ages, skewed young the way online samples are, and never past 85.
            low, high = item["lowest"], min(item["highest"], 85)
            answers[item["key"]] = int(round(rng.triangular(low, high, 30)))
        # A typed demographic (a follow-up on "Other") is left for the model to fill.

    flavours = rng.sample(FLAVOURS, rng.choice([0, 1, 1, 2]))
    code = "synthetic-" + "".join(rng.choice(ALPHABET) for _ in range(12))
    return {"code": code, "seed": seed, "answers": answers, "flavours": flavours}


def describe_persona(book, persona):
    lines = ["You are this person. Facts about you, as you gave them at the start of the study:"]
    for item in asked(book):
        if item["key"] in persona["answers"]:
            lines.append("- " + plain(worded(item, persona["answers"])) + " " + str(said(item, persona["answers"][item["key"]], persona["answers"])))
    if persona["flavours"]:
        lines.append("")
        lines.append("Also true of you: " + " ".join(persona["flavours"]))
    lines.append("")
    lines.append("Write your bio, then answer every item.")
    return "\n".join(lines)


def personas(book, n, seed):
    rng = random.Random(seed)
    made = [sample_persona(book, rng, seed) for _ in range(n)]
    WORK.mkdir(parents=True, exist_ok=True)
    (WORK / "personas.json").write_text(json.dumps(made, indent=2), encoding="utf-8")
    print(f"{n} personas sampled (seed {seed}) -> {WORK / 'personas.json'}")
    return made


# ------------------------------------------------------------- the request --


def for_model(book, persona):
    """The items the model answers: everything not sampled, not a check, and not behind a branch the persona closed."""
    by_key = {item["key"]: item for item in asked(book)}
    items = []
    for item in asked(book):
        if item["key"] in persona["answers"] or item["check"] is not None:
            continue
        # A follow-up to a demographic waits on an answer already given here,
        # so whether it is asked is settled now; one waiting on the model's own
        # answer (the psychiatric treatments) is asked and pruned afterwards.
        waits = item.get("showIf") and by_key.get(item["showIf"]["key"])
        if waits and is_demographic(waits) and not shown(item, persona["answers"]):
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


def render_items(book, items):
    """The items grouped by questionnaire, each scale written once above the items that share it."""
    out = []
    for name in book["run"]:
        mine = [item for item in items if item["questionnaire"] == name]
        if not mine:
            continue
        meta = book["questionnaires"][name]
        out.append(f"\n## {meta['name'] or name}")
        if meta["instructions"]:
            out.append(plain(meta["instructions"]))
        current = None
        for item in mine:
            scale = scale_of(item)
            if scale != current:
                out.append(f"\nAnswer with {scale}.")
                current = scale
            if item.get("instructions") and item["instructions"] != meta["instructions"]:
                out.append(f"({plain(item['instructions'])})")
            out.append(f"- {item['key']}: {plain(worded(item, {}))}")
    return "\n".join(out)


def schema_for(item):
    kind = item["type"]
    if kind in ("choice", "multi"):
        values = [o["value"] for o in item["options"]]
        one = {"type": "integer" if all(isinstance(v, int) for v in values) else "number", "enum": values}
        return {"type": "array", "items": one} if kind == "multi" else one
    if kind in ("curve", "slider") or item["input"] == "number":
        return {"type": "integer"}
    return {"type": "string"}


def request_for(book, persona, model, system):
    items = for_model(book, persona)
    schema = {
        "type": "object",
        "properties": {
            "bio": {"type": "string"},
            "answers": {
                "type": "object",
                "properties": {item["key"]: schema_for(item) for item in items},
                "required": [item["key"] for item in items],
                "additionalProperties": False,
            },
        },
        "required": ["bio", "answers"],
        "additionalProperties": False,
    }
    return {
        "custom_id": persona["code"],
        "params": {
            "model": model,
            "max_tokens": MAX_TOKENS,
            "thinking": {"type": "adaptive"},
            # The item list is the same for every persona and comes first, so
            # it is read from the cache after the first request of a batch.
            "system": [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            "messages": [{"role": "user", "content": describe_persona(book, persona)}],
            "output_config": {"format": {"type": "json_schema", "schema": schema}},
        },
    }


def build(book, made, model):
    # One rendering for everybody: the demographics differ per persona, but
    # they are answered here, not asked, and the branches they open are
    # typed follow-ups that are rare enough to render per persona below.
    requests = []
    for persona in made:
        system = SYSTEM_HEAD + render_items(book, for_model(book, persona))
        requests.append(request_for(book, persona, model, system))
    path = WORK / "requests.jsonl"
    path.write_text("\n".join(json.dumps(r) for r in requests) + "\n", encoding="utf-8")

    # A rough bill, at Sonnet 5 batch rates, so the size of a run is known
    # before it is sent. Tokens are guessed at four characters each.
    system_tokens = len(requests[0]["params"]["system"][0]["text"]) / 4
    per_persona_in = system_tokens + 400
    per_persona_out = 4000
    price_in, price_out = 2.0, 10.0  # $/M tokens, Sonnet 5, before the batch discount
    if model.startswith("claude-haiku"):
        price_in, price_out = 1.0, 5.0
    elif model.startswith("claude-opus"):
        price_in, price_out = 5.0, 25.0
    each = (per_persona_in * price_in + per_persona_out * price_out) / 1e6
    print(f"{len(requests)} requests -> {path}")
    print(f"~{system_tokens:,.0f} tokens of items per request; about ${each:.3f} each at standard rates, ${each / 2:.3f} in a batch")
    return requests


# ------------------------------------------------------------- the answers --


def fake_answers(book, persona, rng):
    """Random answers inside each item's own scale — the app's test mode, without the browser."""
    answers = {}
    for item in for_model(book, persona):
        kind = item["type"]
        if kind == "choice":
            answers[item["key"]] = rng.choice(item["options"])["value"]
        elif kind == "multi":
            exclusive = [o["value"] for o in item["options"] if o["exclusive"]]
            rest = [o["value"] for o in item["options"] if not o["exclusive"]]
            answers[item["key"]] = exclusive if exclusive and rng.random() < 0.5 else rng.sample(rest, rng.randint(1, min(3, len(rest))))
        elif kind in ("curve", "slider") or item["input"] == "number":
            answers[item["key"]] = rng.randint(item["lowest"], item["highest"])
        else:
            answers[item["key"]] = "" if item["optional"] and rng.random() < 0.5 else "fake"
    return answers


def tidy(book, persona, given):
    """Every answer checked against its item, follow-ups pruned, checks passed."""
    answers = dict(persona["answers"])
    for item in asked(book):
        if item["check"] is not None:
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
        if kind == "choice" and value not in values:
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
    return answers


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


def screens(book):
    """One item per level screen, keyed by the level it showed.

    Its `response` is the way on that was taken. A synthetic run walks the
    written order, which is every fork choice taken as recommended: where a
    level ends in a fork, the two offered are the next two levels of that
    fork as written and the first of them is the one taken; otherwise it is
    the words on the one button, which say so when the way on goes through
    the seabed.
    """
    # A briefing row carries no `dimension` at all — codebook.js writes one
    # only onto an item there is something to answer on — so it is asked for
    # rather than read, the way everything else here tells a briefing by its
    # `type`.
    scored = {item["level"] for item in book["items"] if item.get("dimension")}

    # The floor is the last scored level in the water, and only where there is
    # rock under it to go down into — `floorLevel` in app.js.
    water = [level["level"] for level in book["levels"] if level["level"] in scored and not level["beneath"]]
    rock = [level["level"] for level in book["levels"] if level["level"] in scored and level["beneath"]]
    floor = water[-1] if water and rock else None

    # A choice is made on the screen of the level *before* the one it decides.
    taken = {}
    for name in {level["fork"] for level in book["levels"] if level["fork"]}:
        group = [level for level in book["levels"] if level["fork"] == name]
        for at in range(len(group) - 1):
            taken[group[at]["level"] - 1] = [group[at]["name"], group[at + 1]["name"]]

    return {
        level["level"]: {
            "key": "Level_" + str(level["level"]),
            "questionnaire": None,
            "response": taken.get(level["level"], "Go beneath the floor →" if level["level"] == floor else "Continue the test →"),
            "timeOnset": None,
            "timeResponse": None,
        }
        for level in book["levels"]
        if level["level"] in scored
    }


def walked(book, answers):
    """The run's items in order, each in the shape a saved item has but for
    its `order`, with each level screen standing after the last item of the
    level it showed — which is where `container()` splices them in."""
    shown = screens(book)
    out = []
    standing = None
    for item in book["items"]:
        if item["level"] != standing:
            if standing in shown:
                out.append(shown[standing])
            standing = item["level"]
        out.append(
            {
                "key": item["key"],
                "questionnaire": item["questionnaire"],
                "response": None if item["type"] == "briefing" else said(item, answers.get(item["key"]), answers),
                "timeOnset": None,
                "timeResponse": None,
            }
        )
    if standing in shown:
        out.append(shown[standing])
    return out


def write_file(book, persona, given, bio, provenance):
    answers = tidy(book, persona, given)
    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")

    file = {"version": book["version"], "participant": persona["code"], "testMode": False}
    file["synthetic"] = dict(provenance, seed=persona["seed"], flavours=persona["flavours"], bio=bio, generated=now)
    # The whole timeline, in its written order, which is what a synthetic run
    # walks: no battery, every level and questionnaire as written.
    file["battery"] = None
    file["source"] = "Synthetic"  # the app writes a string here always, "Unknown" where the link named none
    file["levels"] = [{"key": level["key"], "name": level["name"], "blocks": level["blocks"]} for level in book["levels"]]
    file["questionnaires"] = list(book["run"])
    file["timeStart"] = now
    for level in book["levels"]:
        file["timeLevel" + str(level["level"])] = None
    file["formatMint"] = book["formatMint"]
    # Keyed by the level's key, the way `container()` keys it: a number is a
    # place in one person's run, a key is the same level for everybody, and the
    # name beside it is prose that may be reworded without moving a column.
    # Every check is passed, so a level carrying one failed none, and a level
    # carrying none has null there, the way `qualityControl` writes it.
    checked = {item["level"] for item in book["items"] if item["check"] is not None}
    file["qualityControl"] = {
        level["key"]: {
            "responseTimeMean": None,
            "responseTimeSD": None,
            "attentionChecksFailed": 0 if level["level"] in checked else None,
        }
        for level in book["levels"]
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
        for position, entry in enumerate(walked(book, answers))
    ]
    file["feedback"] = {key: None for key in feedback_keys(book)}
    # A model is not asked what it made of the level it has just read, so the
    # stars are null throughout — one key per level screen, as in a real run.
    by_number = {level["level"]: level["key"] for level in book["levels"]}
    file["ratings"] = {by_number[number]: None for number in screens(book)}

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / (persona["code"] + ".json")
    path.write_text(json.dumps(file, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


def parse(message, code):
    """The JSON out of a response, or None with a word about why."""
    if message.stop_reason == "refusal":
        print(f"  ! {code}: the model declined ({getattr(message, 'stop_details', None)})")
        return None
    text = next((block.text for block in message.content if block.type == "text"), None)
    if text is None:
        print(f"  ! {code}: no text in the response")
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"  ! {code}: response is not JSON ({e})")
        return None


# ------------------------------------------------------------------ the API --


def client():
    try:
        import anthropic
    except ImportError:
        sys.exit("pip install anthropic")
    return anthropic.Anthropic()


def submit(requests, model):
    batch = client().messages.batches.create(requests=requests)
    record = {"id": batch.id, "model": model, "created": batch.created_at.isoformat(), "requests": len(requests)}
    (WORK / "batch.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(f"batch {batch.id} submitted ({len(requests)} requests). Collect it with:  synthesize.py collect --wait")
    return batch


def collect(book, wait):
    import time

    record = json.loads((WORK / "batch.json").read_text(encoding="utf-8"))
    made = {p["code"]: p for p in json.loads((WORK / "personas.json").read_text(encoding="utf-8"))}
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

    written = 0
    for result in api.messages.batches.results(record["id"]):
        code = result.custom_id
        if result.result.type != "succeeded":
            print(f"  ! {code}: {result.result.type}")
            continue
        data = parse(result.result.message, code)
        if data is None:
            continue
        provenance = {"model": record["model"], "batch": record["id"]}
        write_file(book, made[code], data["answers"], data["bio"], provenance)
        written += 1
    print(f"{written} files written to {OUT}")


def live(book, made, requests, model):
    api = client()
    for persona, request in zip(made, requests):
        response = api.messages.create(**request["params"])
        data = parse(response, persona["code"])
        if data is None:
            continue
        usage = response.usage
        print(f"{persona['code']}: {usage.input_tokens} in ({usage.cache_read_input_tokens} cached), {usage.output_tokens} out")
        print("  " + write_file(book, persona, data["answers"], data["bio"], {"model": model, "batch": None}).name)


def fake(book, made, seed):
    rng = random.Random(seed)
    for persona in made:
        path = write_file(book, persona, fake_answers(book, persona, rng), "(fake run: random answers)", {"model": "fake", "batch": None})
        print("  " + path.name)


# --------------------------------------------------------------------- CLI --


def main():
    cli = argparse.ArgumentParser(description=__doc__.split("\n\n")[1], formatter_class=argparse.RawDescriptionHelpFormatter)
    cli.add_argument("--model", default=MODEL)
    cli.add_argument("--seed", type=int, default=None, help="for the personas; random if not given")
    steps = cli.add_subparsers(dest="step", required=True)
    steps.add_parser("codebook", help="read the items out of content/ into work/codebook.json")
    steps.add_parser("personas", help="sample personas into work/personas.json").add_argument("--n", type=int, default=10)
    steps.add_parser("build", help="write the requests for the personas into work/requests.jsonl")
    steps.add_parser("submit", help="send work/requests.jsonl as a Message Batch")
    steps.add_parser("collect", help="fetch a finished batch and write out/*.json").add_argument("--wait", action="store_true")
    run = steps.add_parser("run", help="personas + build, then send: a batch by default")
    run.add_argument("--n", type=int, default=10)
    how = run.add_mutually_exclusive_group()
    how.add_argument("--live", action="store_true", help="one request at a time, files written as they return")
    how.add_argument("--fake", action="store_true", help="random answers, no API call")
    args = cli.parse_args()

    seed = args.seed if args.seed is not None else random.randrange(1 << 30)
    book = codebook()

    if args.step == "codebook":
        print(f"{len(asked(book))} items in {len(book['run'])} questionnaires -> {WORK / 'codebook.json'}")
    elif args.step == "personas":
        personas(book, args.n, seed)
    elif args.step == "build":
        made = json.loads((WORK / "personas.json").read_text(encoding="utf-8"))
        build(book, made, args.model)
    elif args.step == "submit":
        requests = [json.loads(line) for line in (WORK / "requests.jsonl").read_text(encoding="utf-8").splitlines() if line]
        submit(requests, args.model)
    elif args.step == "collect":
        collect(book, args.wait)
    elif args.step == "run":
        made = personas(book, args.n, seed)
        if args.fake:
            fake(book, made, seed)
            return
        requests = build(book, made, args.model)
        if args.live:
            live(book, made, requests, args.model)
        else:
            submit(requests, args.model)


if __name__ == "__main__":
    main()
