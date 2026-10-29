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
python data/synthetic/synthesize.py --core run --n 25               # the core and the interim only, one screen at a time
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

Seven things are set for a batch of personas, and every file says which under
its `synthetic` field:

| | | |
|---|---|---|
| **Submission** | `--grain all`: every item in one request, which the model reads whole before answering any of it. `--grain item` (the default): one screen a turn, in a conversation with nothing ahead of it | built |
| **Model** | `--model`: `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`, … The temperature is 1 under thinking and is not a knob | built |
| **Effort** | `--effort`: `low`, `medium`, `high` (the default), `xhigh` or `max` — how much the model thinks before it answers, sent on every request rather than left to each model's own default, so that two models are not also two efforts. At the `item` grain it buys nothing measurable on Sonnet 5.5, which does not think over one question a screen at `high` any more than at `low` | built |
| **Persona facts** | what the sentence tells and nothing more: an age, a gender and working or studying (`told` in the file). Telling more — a country, an education — would be another value of this, and every fact told is one more thing to read a stereotype into | built, the three facts |
| **Persona specificity** | `--condition`, a ladder in which each step adds one thing to the one before: *aspecific*, `typical` (the default) — the sentence alone, the model's picture of such a person; *specific-nudge*, `particular` — and a line saying it is one particular individual, not a typical one, with a life of its own; *specific-bespoke*, `bio` — and a biography of two to four sentences the model writes before answering, which puts the person it imagines in the file | built |
| **Reach** | how much of the run a persona answers: all of it (the default), or with `--core` the core and the interim only, stopping where a participant who does only the mandatory part stops (`core` in the file). Past the stop everything is null, as in a run left there: the items, the level screens, the attention checks and the quality control of the levels not reached, the fork choices, and the interim's last screen, which offers the first optional level and on which nothing is chosen. One seed is the same people either way, `core` being set after they are sampled. At `--grain item` it is 144 screens of 316 and a fifth of the cache reads, which is what makes the faithful grain cheap enough for the MINT follow-up | built |
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
hash `prompt`, `seed`, `draw`, `told`, `bio`, `core`, `usage`, `offscale`): nothing is
read off a name. `preprocess.R` reports a participant code found in more than one file
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
roughly $1.20 a persona on Sonnet and $0.06 on Haiku at effort `low`. Thinking
adds next to nothing: on one question a screen Sonnet 5.5 does not think at
effort `high` any more than at `low` (about 8 tokens out a screen, the JSON
answer, and about 1.5 seconds; October 2026). With `--core` it is 137 screens,
about 1.1 million tokens read and $0.27 a persona on Sonnet, and 25 personas
ten at a time took nine minutes. One persona on `claude-haiku-5-5` at effort `low` came to 309 screens and $0.06, with 34,800 tokens written to the cache and 5.5 million read from it. `--model`,
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
what the persona was told, in the `bio` condition its biography, whether it
stopped after the core (`core`), and every answer it gave off its item's scale
(`offscale`, below). Reaction
times are null, the attention checks are passed, the
`feedback` votes and the `ratings` stars are all null. Never pool these with participants — models
answer in socially desirable ways, avoid the extremes and vary less than
people, however hard the prompt pushes back. Use them to test scoring,
reverse-keying and the figures, not to learn anything about anybody.

## Methods

A paragraph for a paper's methods (the InteroceptionProfiles study, say),
describing the cell every batch so far was generated under: `--grain all`,
`claude-sonnet-5-5` at effort `high`, `--condition typical`, new personas, sent
as a Message Batch. The bracketed parts are for the paper to fill or drop. It
is written from the code as it stood in October 2026 (app 1.0.0, prompt hash
`a863d583`), so a change to `synthesize.py` or to `content/` wants it read
again.

> **Synthetic data.** [To compare human responses with those of a language
> model,] we generated synthetic participants with a large language model,
> Claude Sonnet 5.5 (Anthropic; model identifier `claude-sonnet-5-5`), queried
> through the Anthropic Message Batches API in October 2026, with extended
> reasoning enabled (adaptive thinking, effort level "high") and the default
> sampling temperature of 1. Each synthetic participant was a minimal persona
> described in a single sentence stating only their age, gender and
> occupational status (e.g., "You are a 40-year-old woman, currently
> working."). Age was drawn from a triangular distribution between 18 and 65
> years with a mode of 30, approximating the young skew of online samples, and
> gender (woman or man) and occupation (working or studying) were drawn with
> equal probability. No other characteristics were specified, to limit the
> stereotypes the model could draw on. The system prompt told the model that it
> was taking part in an online psychology study as the person described,
> rather than as an assistant, and to answer every item as that person would.
> It gave no guidance on how to answer (e.g., to answer honestly, or to use
> the full range of the scales), stating only that questions about a period
> (e.g., the last two weeks) referred to that period of the person's life,
> that "None of these" and "Prefer not to say" were valid answers, and that
> free-text comment boxes could be filled in or left empty [; the full prompt
> is given in Supplementary Materials]. The model then received the complete
> questionnaire battery that human participants could complete, generated
> from the same source files as the online study, so that item wording,
> instructions and response options were identical. Items were presented in
> the order a human participant would have met them: the sections of the
> study followed the same randomised order as for human participants (where
> participants chose which section came next, the persona took the section
> recommended to them), the items of each questionnaire were shuffled, each
> questionnaire's instructions preceded its items, the response scale was
> stated before the first item answered on it and again whenever it changed,
> and the transition texts shown between sections appeared at the same points
> as online. Items were identified only by a sequential number (q001, q002, …):
> item and questionnaire names, which could reveal the construct measured or
> the direction of keying, were withheld. Each persona answered all 316 items
> in a single request and returned its answers as one JSON object constrained
> to a fixed schema (structured outputs). Each answer was checked against the
> item's response options or range. Where some of a persona's answers to a
> questionnaire exceeded the top of the item's scale and all of them fitted
> one other scale, they were mapped back onto the item's scale: answers given
> from 1 to 7 on a scale of 0 to 6, using both ends, were shifted down by one
> point, and answers given from 0 to 100 (the scale of other items in the
> study), most of them above the item's top, were linearly rescaled and
> rounded to the nearest point [; this concerned the MINT of 4 of the 1,000
> personas, all on 0 to 100]. Any other answer outside an item's response
> options [(6 answers from two personas)], and any
> missing answer, was coded as missing, and follow-up items whose condition
> was not met were discarded, as they would not have been displayed. The seven attention-check items were
> not presented and were recorded as passed, and month and day of birth, used
> only for feedback, were drawn at random rather than generated. The MINT was
> always presented in its seven-point format numbered 0 to 6, whereas human
> participants were randomly assigned one of three response formats. The
> model's answers to the demographic questions on age, gender and student
> status were compared with the persona it had been given [; *k* personas
> departed from it]. In total, [1,000] synthetic participants were generated,
> stored in the same format as the human data (without response times) and
> processed with the same pipeline. The code is openly available at
> https://github.com/RealityBending/TestYourself (`data/synthetic/`).

Three things the paragraph says in passing that a reader of the comparison may
want spelled out. **Every persona answered the whole run**, the optional levels
included, where many people stop after the core, so a comparison on anything
outside the core is between all of the synthetic sample and the part of the
human one that went on. **The MINT's format is fixed** at `sequential7`, so a
comparison of the MINT should use the humans who had that format, or say why
not. And **no persona can fail an attention check**, so the human sample's
exclusions have no synthetic counterpart.

Another cell wants the paragraph changing where it differs: at `--grain item`,
"Each persona answered all 316 items in a single request …" becomes a
conversation in which each screen (an item, its instructions and its scale)
was one message, answered before the next was shown, with the conversation so
far kept in context and follow-ups shown only once the answer opening them was
given, and these are sent one at a time rather than as a batch; under
`particular` the system prompt adds that the person is one particular
individual and not a typical one, with a life, a history and experiences of
their own; under `bio` it also asks for a biography of two to four sentences,
written before answering; with `--core`, the persona answered only the core
of the study and the interim questions that close it (144 items rather than
316), stopping where a participant who does only the mandatory part stops; and
the model, the effort and the API change with the flags. The exact prompt for the supplementary materials is printed by:

```bash
python -c "import sys; sys.path.insert(0, 'data/synthetic'); import synthesize as s; print(s.instructions('typical', 'all'))"
```

followed, for each persona, by its own items (`params.system` in
`work/requests.jsonl`), and the one-sentence persona as the user's message.

**The batches so far**, all under the cell above:

| Batch | Sent | Seed | Personas | Files written |
|---|---|---|---|---|
| `msgbatch_0184ro3x2zymz6AUYpiQsafH` | 28 October 2026 | 20261028 | 50 | 50 |
| `msgbatch_01YGKVGXqzN123gWGNQSGehs` | 28 October 2026 | 2026102802 | 200 | 200 |
| `msgbatch_01Fv3qdubsSqdqVxK9Sew7Ax` | 28 October 2026 | 2026102803 | 250 | 250 |
| `msgbatch_017yL8nyF3zKUWNP3Ufa3Hff` | 28 October 2026 | 2026102804 | 250 | 250 |
| `msgbatch_01TkizmyLargZ7ehiDxeJVDW` | 28 October 2026 | 2026102805 | 250 | 250 |

Of the 1000, none strayed from its persona (the *k* of the paragraph is 0),
none left an item out, and six answered MINT items off the scale: four the
whole MINT on 0 to 100 (`synthetic-XJCSCQHGX3U6`, `synthetic-AW58QJ9YMU7F`,
`synthetic-W9XBPDH5HYVR`, `synthetic-4N5NQ35NQQJF`), read back onto 0 to 6, and
two a few items with a 7 (`synthetic-R5828RUUUXBW` two, `synthetic-SCEFX2V8RZYX`
four, each with its other answers running from 2 to 6), left unanswered. All
six have them in their files' `offscale`. All six are among the 169 whose MINT
came straight after the BAIT's statements (the MINT on place 4, the BAIT on
place 3), where the scale, being the same 0 to 6 from 'Disagree' to 'Agree',
is not written again and was last stated above the BAIT, with the MINT's
briefing between; none of the other 831 put a MINT answer off the scale. That
is left as it is, being rare, and counted instead. A Sonnet persona at this
cell took about 14,500 tokens in and 5,600 out, about $0.04 at batch rates (the
200 came to $8.54, the three 250s to $10.67, $10.64 and $10.67).

**Answers off the scale** are handled by `read_back`, ahead of the other checks
in `tidy`. The answers to each questionnaire on one numbered scale (a row of
circles, a Likert scale) are taken together, and another scale is looked for
only where some of them went **past the top** of the item's (above 6 on the
MINT's 0 to 6). Two are read, and all of the questionnaire's answers are read
back with them, those that happened to fall inside the item's scale included:

- **One up** (1 to 7 for 0 to 6), only where the answers reach both its ends,
  the lowest exactly 1 and the highest exactly 7: shifted down a point. Answers
  that go past the top but never down to 1 (`synthetic-R5828RUUUXBW`,
  `synthetic-SCEFX2V8RZYX`, 2 to 7) are as likely to come from somebody on 0
  to 6 who never chose the lowest point and slipped, and are not read.
- **0 to 100**, the scale of the test's own curve and slider items: every
  answer inside it and most past the item's top. Rescaled and rounded to the
  nearest point, halves up.

Anything else off the scale (past the top on neither, below the foot, between
two points) is left unanswered and recorded with no scale. A scale is never
read off fewer than three answers (`READ_FROM`). Every answer changed or
dropped is
recorded in the file under `synthetic.offscale`, one entry each with its `key`,
`questionnaire`, what was `given`, what was `saved` (null where dropped) and
the `scale` it was read on (null where none was), and the list is empty where
there were none, so the rate can be compared across models and efforts and a
reading undone at analysis. The two batches above were collected again on 28
October 2026 to write it (`collect` rewrites a batch's files under the same
names), which changed nothing in them but the two 0-to-100 personas' MINT
answers, the new field and the time of writing.

A new seed for each batch, so that no persona code comes up twice:
`preprocess.R` keeps one row a code. The work files of a batch are kept under
`work/<batch id>/` once the next is built over them.

**The faithful grain on the core** (28 October 2026): 200 personas again at
`--grain item` with `--core`, sent live — the first 25 of the first batch
(seed 20261028, ten at a time) and the first 175 of the second (seed
2026102802: 75 fifteen at a time, then 76 to 175 twenty at a time) — so that
each is the same person as an all-at-once file and the two ways of answering
can be compared person by person: the same participant code in two files,
told apart by `grain` and `draw`. Sonnet 5.5, effort `high`, `typical`; $6.79,
$20.36 and $27.14 at standard rates, nine, sixteen and sixteen minutes. None
strayed, left an item out or answered off the scale, the three whose MINT went
off it all at once (`synthetic-XJCSCQHGX3U6`, `synthetic-AW58QJ9YMU7F`,
`synthetic-R5828RUUUXBW`) included. On the MINT the twins gave the same answer
to 57% of the items and differed by 0.46 points on average; screen by screen,
a persona's answers spread a little more (its SD across the 33 items 1.07,
against 0.89) and sat a little higher (a mean of 3.06, against 2.91), and a
persona's mean in one mode went with its mean in the other only weakly
(r = 0.25), so that the told facts and the dealt order, which the twins share,
decide little of where a typical persona lands. The work files are under
`work/live_item_core_seed20261028/`, `work/live_item_core_seed2026102802/` and
`work/live_item_core_seed2026102802_76-175/`, the conversations in
`work/conversations/`. All three were run through a short driver that raised
the client's retries to eight, so that a busy moment would not cost a persona
its conversation; `client()` keeps the SDK's default of two.

**The faithful grain on the whole run** (29 October 2026): 300 personas at
`--grain item` without `--core`, sent live 25 at a time through the same
driver in three runs — the 50 of the first batch (seed 20261028), the first
100 of the second (seed 2026102802), then the second's other 100 with the
first 50 of the third (seed 2026102803) — so that each is the same person as
an all-at-once file again, and the 200 that also have a core run are in three
files. Sonnet 5.5, effort `high`, `typical`; $60.12, $121.38 and $181.17 at
standard rates, $362.67 in all ($1.16 to $1.30 a persona, 5.4 million tokens
read from the cache each), 308 to 310 screens a persona. None strayed, left
an item out or answered off the scale. On the MINT the twins gave the same
answer to 58% of the items and differed by about 0.45 points on average;
screen by screen, a persona's answers spread more (an SD across the 33 items
of about 1.2, against 1.0) and sat higher (a mean of 2.98, against 2.82), and
a persona's mean in one mode went with its mean in the other at r = 0.27 over
the 300 (0.48 over the first 50 alone, 0.15 over the last 150) — the core
run's pattern again. The work files are under
`work/live_item_full_seed20261028/`, `work/live_item_full_seed2026102802/` and
`work/live_item_full_seed2026102802_101-200_seed2026102803_1-50/`, the
conversations in `work/conversations/`.
