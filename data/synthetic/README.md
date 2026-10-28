# Synthetic runs

Runs of the test answered by Claude in a sampled persona, written in the exact
shape the app saves, for exercising the analysis pipeline before there are
participants. A workbench like `data/norms/`: nothing on the page reaches for it.

```bash
pip install anthropic                                   # once
python data/synthetic/synthesize.py run --n 20                 # sample personas, walk each through the screens, write out/*.json
python data/synthetic/synthesize.py --grain all run --n 20     # every item in one request apiece, sent as a batch
python data/synthetic/synthesize.py collect --wait             # fetch that batch, write out/*.json
```

Quicker loops:

```bash
python data/synthetic/synthesize.py --grain all run --n 3 --live   # three personas now, one request each
python data/synthetic/synthesize.py run --n 5 --fake               # random answers, no API call, no cost
```

A persona is told as little as will do, in one sentence: "You are a
40-year-old woman, currently working." (or "currently studying"; 18 to 65,
skewed young), since every detail handed to the model is one more thing to
read a stereotype into. Everything else, the study's own demographic questions
included, the model answers in character, and its answers to age, gender and
student status are held up against the sentence: a persona that strays from it
is reported, and the file keeps what it was told (`told`) so an analysis can
make the same check. The levels are drawn for each persona the way the page
draws them: level 1 first, the core three in an order of their own, the
interim, the five after it in an order of their own, the closing last, so the
demographics open places 1 to 3 and the interim place 5 whatever is walked
there, every fork choice is the recommended one, and the file's `levels` says
the order walked, as a real one's does. Each persona's items come in an order
of their own too, shuffled within each questionnaire the way the page deals
them, and the file keeps that order. The instructions say what the task is and
nothing about how to answer: nothing pushing towards the ends of a scale or
away from flattering answers, and no "honestly", which would bend every
persona the same way.

What the model is shown is what the person is, as near as text allows: the
items numbered (`q001`, …) and nothing else about them — not their keys, which
name the instrument, the facet and often the direction, and not the
questionnaires' names, none of which the person is told — with the lead-in over
each and the scale it is answered on, and the briefings where they fall, in the
words the person reads. The number each item was shown under rides on the
request (`shown` in `work/requests.jsonl`) and is undone on the way back
(`unmask`), so the file holds the items' own keys. The model is not shown the
attention checks, which the script answers, nor the level screens and the
results between levels, which have no text to show.

How the model meets the items is the `--grain`. `item`, the default, is the
page's way: a conversation in which each user message is one screen — the
lead-in, the question and its scale, with a briefing at the top of the screen
after it — and the answer is the assistant turn, held to JSON by one schema
for every screen and to the item's scale by the same checks as the other
grain, so that each answer is read off that screen and what the model has
already said, with nothing ahead of it; a follow-up is shown only once the
answer that opens it is given, as on the page. The conversation so far is
cached between turns, and `work/conversations/` keeps each one whole, with
what every turn cost. (A schema a screen, holding each answer to its own
options, would be exact, but the cache is keyed by the schema: every screen
whose schema differed from the last few turns' rewrote the whole conversation,
thirty-one times a run, which cost more than every read together.) It is live
only (`--parallel`, four personas at a time), some three hundred requests a
persona, and dearer: `build` prints a guess before anything is sent, and `run`
what was spent. `all` is every item in one request, which the
model reads whole before answering any of it: cheaper, and a Message Batch
carries it at half the price, but a whole scale in view is where answers get
made consistent with one another, so it is for exercising the pipeline rather
than for a comparison.

## The conditions a batch is generated under

Six things are set for a batch of personas, and every file says which under
its `synthetic` field:

| | | |
|---|---|---|
| **Submission** | `--grain all`: every item in one request, which the model reads whole before answering any of it. `--grain item` (the default): one screen a turn, in a conversation with nothing ahead of it | built |
| **Model** | `--model`: `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`, … The temperature is 1 under thinking and is not a knob | built |
| **Effort** | `--effort`: `low`, `medium`, `high` (the default), `xhigh` or `max` — how much the model thinks before it answers, sent on every request rather than left to each model's own default, so that two models are not also two efforts. At the `item` grain a higher effort buys thinking at every screen, which is then most of what a persona costs | built |
| **Persona facts** | what the sentence tells and nothing more: an age, a gender and working or studying (`told` in the file). Telling more — a country, an education — would be another value of this, and every fact told is one more thing to read a stereotype into | built, the three facts |
| **Persona specificity** | `--condition`, a ladder in which each step adds one thing to the one before: *aspecific*, `typical` (the default) — the sentence alone, the model's picture of such a person; *specific-nudge*, `particular` — and a line saying it is one particular individual, not a typical one, with a life of its own; *specific-bespoke*, `bio` — and a biography of two to four sentences the model writes before answering, which puts the person it imagines in the file | built |
| **Relation to the human sample** | *new*: the facts sampled here (18 to 65 skewed young, man or woman, working or studying). *matched*: one twin a real participant, told that participant's facts, so that the two can be compared one to one | new built; matched waits on the sample |

**Replicates** are a draw of their own and not a condition, and they mean
something only where a persona is one individual: a specific-bespoke persona,
whose biography is in the file, and a matched one, who is a real participant.
There the same person answered again is a replicate, and how far the answers
move between draws is the model's own sampling spread, to be told apart from
the spread between people. An aspecific, new persona is not an individual —
"a 40-year-old woman, currently working" answered twice is two such women —
so a second draw of one is one more persona of that kind and no replicate.
Not built: a `--replicates` flag, which for `bio` has to hand the biography
back rather than have it written again. The MINT's three formats are a knob
the page has and this has not: the page draws one a run and the study is
partly about the difference, where a synthetic run is always `sequential7`,
which a draw in `codebook.js` would mend.

**Same seed, same personas, and a file an answering.** `--seed` draws the
personas, their birthdays, their levels and their item orders, so one seed
under two conditions is the same people answering twice, which is what a
comparison between conditions wants. A file is named by the persona's code
and then a code for that answering of it (`draw`, drawn afresh for every file
and off no seed), so two answerings of one persona are two files, and
everything an analysis needs to sort files into cells is inside the file,
under `synthetic` (`grain`, `model`, `effort`, `condition`, the instructions'
hash `prompt`, `seed`, `draw`, `told`, `bio`, `usage`): nothing is read off a
name. `preprocess.R` reports a participant code found in more than one file
and keeps one row a code, so a comparison across cells reads the files'
`synthetic` fields itself, or `preprocess.R` wants the draw in its row key.

**The plan** (October 2026): a baseline first, then one thing changed at a
time off it, so that each difference has one cause. The baseline is
`--grain all`, `claude-sonnet-5-5` at `--effort high`, `--condition typical`,
new personas, sent as a batch: the cheapest cell, about $0.06 a persona, so a
few hundred personas for a few dollars, and the cell nearest what the
literature has done. Off it, in this order: the same personas at
`--grain item`, the faithful way (about $1.20 a persona on Sonnet, $0.06 on
Haiku); `claude-haiku-5-5` and `claude-opus-5-5` at the same effort;
`particular` and then `bio`; and `matched`, once there are participants to
match — with replicates, once built, of the `bio` and `matched` cells, to
size the sampling spread. The
measures the cells are compared on are to be written down before the first
batch is sent: means and spreads, the share of answers at the ends of a
scale, each scale's internal consistency, the correlations between scales
and, for `matched`, how near each twin comes to its participant.

`codebook.js` reads every item out of `content/` (run by bun or node, which
`synthesize.py` finds on the PATH), so the requests can never drift from what
the page asks. Everything in between is left in `work/` to be read: the
codebook, the personas, the requests exactly as sent, the batch id. Output
goes to `out/`, a `synthetic-<code>_<draw>.json` an answering of a persona.
Both folders are git-ignored.

Defaults: `claude-sonnet-5-5` at effort `high`. At `--grain all` that is about
14,000 tokens in and 9,000 out a persona, measured, which is roughly $0.12 one
at a time (`--live`, about 50 seconds each) and $0.06 in a batch (a twentieth
of that on `claude-haiku-5-5`, twice it on `claude-opus-5-5`). At `--grain
item` every screen reads the conversation so far from the cache, and that is
most of the bill: about 5.5 million tokens read a persona, measured, which is
roughly $1.20 a persona on Sonnet and $0.06 on Haiku at effort `low`, before
any thinking, which a higher effort buys at every screen. One persona on `claude-haiku-5-5` at effort `low` came to 309 screens and $0.06, with 34,800 tokens written to the cache and 5.5 million read from it. `--model`,
`--effort`, `--condition` and `--grain` are all given before the step:
`synthesize.py --condition bio run --n 3`.
The effort is always sent rather than left to the model, since the defaults
differ between models and a comparison of two models should not also be one of
two efforts. `build` prints an estimate before anything is sent, and `live` and
`collect` print what was actually spent.

An API key is read from `ANTHROPIC_API_KEY`. The lab's API credits are on its
Console organisation, not on anybody's Claude seat. Make the key there scoped to
a workspace rather than to the organisation: an organisation key can reach the
Admin API, and needs an `anthropic-workspace-id` header on every request, which
this script does not send. Set it in the user environment, never in a file in
this folder, which is inside git and Dropbox both.

A synthetic file says so twice: the participant code starts `synthetic-`, and
a `synthetic` field carries the model, the batch, the effort, the condition,
the grain, a hash of the instructions it was answered under (`prompt`, so a
file can be traced back after they are reworded), the tokens it took
(`usage`), the seed, the draw (which answering of the persona this is),
what the persona was told and, in the `bio` condition, its biography. Reaction
times are null, the attention checks are passed, the
`feedback` votes and the `ratings` stars are all null. Never pool these with participants — models
answer in socially desirable ways, avoid the extremes and vary less than
people, however hard the prompt pushes back. Use them to test scoring,
reverse-keying and the figures, not to learn anything about anybody.
