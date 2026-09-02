# AGENTS.md

The one set of notes on this project. `CLAUDE.md` is a pointer to this file, not
a second copy — write here and nowhere else, or the two will drift.

Single-page survey app. No build, no dependencies, no framework, no tests.
`index.html` loads the content first (`content/timeline.js`, then a
`content/block_*.js` per block of questions), then `js/results.js` (reads
scores back), then `js/app.js` (the engine) — and
three stylesheets in cascade order: `css/style.css` → `css/intro.css` →
`css/results.css`. Nothing is a module: each file adds to the globals the next
one reads, so **the order of the tags in `index.html` is the only thing holding
it together**. A new file means a new tag in the right place.

Run it: the `testyourself` config in `.claude/launch.json` serves the folder on
port 8123 (`python -m http.server`). Open a file change in the browser by
reloading — there is nothing to compile.

## Where things live

Three folders and the page that loads them: the questions, the code, the look.
A change usually needs one file out of one of them.

| | |
|---|---|
| `content/timeline.js` | **The frame the rest of `content/` is written into, and what is asked when.** `TIMELINE` is one entry per level, in order, naming that level's blocks — moving a block is moving its name from one line to another, and a block named nowhere here is never asked. Also `defineBlock()` and the `QUESTIONNAIRES` / `BLOCKS` the block files fill, and, at the head of the file, an annotated skeleton of every field a block may carry. **Read that before editing anything in `content/`**; it says what the fields are, and this file says why. |
| `content/block_*.js` | Every question, scale, colour and norm, **split by block** — one stretch of the run that moves as a piece — so the file to open is the thing being changed rather than the position it happens to be asked in. **Content changes go here and nowhere else.** Each is one `defineBlock("name", [ … ])` over an ordered list of entries: briefings and questionnaires, each carrying its own `key`. |
| `content/block_UNUSED.js` | Questionnaires written but not asked, commented out, waiting on whatever they want before they can go in. Nothing in it defines a block, so nothing in it can be reached. |
| `js/app.js` | The engine, one IIFE, in labelled sections: build the run → branching → scoring → rendering an item → the rail → panels → particles → finishing a level → flow → results → the way in → wiring. |
| `js/results.js` | `makeResults(engine)`, a factory returning the handful of functions `app.js` calls. Spider charts, the interoception body, the mood faces, the AI archetype, the archetype wheel, PHQ-4 severity, the card, the results sections, the staged opening of a finished level, and the example web the landing page hangs behind its case. Reads scores; records nothing but the agree/disagree `feedback` on a prediction. |
| `css/style.css` | The shell: tokens on `:root`, the water, the banner and the sidebar the descent runs down, screens, panels, buttons, the survey, particles. Also the animations the other two sheets share (`fade`, `rise`). |
| `css/intro.css` | The landing screen only: hero, the case for doing this and the Jung line under it, consent form, and the Nietzsche quote on the way in. |
| `css/results.css` | The water that breaks on a finished level, the level screen, results sections, charts, the interoception body, bars, the profile, card. |
| `index.html` | Static skeleton, and the load order above. Screens and panels are markup; everything inside them is filled in by the scripts via `$(id)`. The favicon is an inline SVG data URI in the head — three waves going down, in the descent's three colours. |
| `assets/` | The logos on the hero and the consent form. Referenced from `index.html` only — no stylesheet or script reaches for a file. |
| `README.md` | The author's own notes: the aim, an **Includes** list of everything the test currently asks, and a long list of questionnaire ideas that are *not* in it. Not documentation, but the Includes list has to be true — see the convention below. |

**The seam.** `app.js` builds an `engine` object — the run, the scores, and the
two pieces of chrome (`showScreen`, `burst`) a result arrives with — and hands
it to `makeResults()`. That object is the whole of what crosses between them,
in one direction: `results.js` never reaches back for anything else, and
nothing in it walks the run or writes to `responses`. (It does read
`QUESTIONNAIRES` — a `content/` global, for norms and section names — which is
shared ground rather than app.js state, so it crosses no seam to get there.)
Adding to the seam means adding to that object literal, so keep it small.

## How it works

**Run order.** Four lists, each knowing only the one under it: `TIMELINE` is a
list of levels, a level is a list of block names, a block is a list of entries
(briefings and questionnaires), and a questionnaire is a list of items. Every
entry of every one of them carries its own `key` and is found by it, so adding,
removing or moving anything is moving one object in one list. `app.js` walks all
four in order to flatten `questions`, stamping each item with the `level` and
`block` it came from — which is why nothing in `content/` carries a `level:` of
its own, and why there is no second place for it to disagree with. That same
walk builds `RUN`, the questionnaires in order, which is also the order a
level's results read in.

**A questionnaire is the unit of shuffling, and the only one.** Its items may
come in any order, but they come together; everything around them — the other
questionnaires, the briefings, the blocks, the levels — holds the order the
timeline gives it, and an item marked `shuffle: false` keeps its own place
while the rest move around it.

The whole of the run's order follows from that one rule, and answers most
questions about it before they are asked. Two instruments meant to be asked in
among each other go in **one** questionnaire, because being one questionnaire
is what makes them one shuffled run — which is why the six single-item scales
of the `fast` block are one `singles` questionnaire rather than six, and why
the FIPI beside them stays a run of five that nothing is ever dealt into. Two
meant to stay apart go in two. And a briefing, being an entry of the block
rather than of any questionnaire, can never be crossed by anything.

**What is asked, and where.** Seven levels, six of them scored, out of eleven
blocks (the `personality` block holds three questionnaires and two briefings) — so this table is the map of `content/timeline.js` and of the folder
around it at once:

| | |
|---|---|
| Level 1 | `demographics1` (age, month of birth, gender and what branches off it), `fast` (a briefing, then `fipi`, then `singles`) → Personality |
| Level 2 | `demographics2` (education, discipline, student, ethnicity, country), `mint` (a briefing, then the items) → Interoception |
| Level 3 | `demographics3` (household financial comfort, MacArthur subjective social status), then `mood` and `health` in a random order. `mood` is a briefing, then `phq4` and `Dissociation` (CDS-2, PCL-2, SQS — the first two pooled into one Strain dimension, Sleep asked and scored but shown nowhere) and `health` is a briefing, then `sss8` (Pain, Gastrointestinal, Cardiopulmonary, Fatigue), then the list of psychiatric diagnoses and treatments (`psychiatric`, asked and saved but scored and fed back nowhere; its somatic sibling sits commented out in the same file) — all three of `phq4`, `Dissociation` and `sss8` read back together as one "Mood & Health" section: Mood, Strain, Health |
| Level 4 | `personality` — a briefing, then the HEX-ACO-18 (`hexaco18`, 18 items, the HEXACO on its own 5-point scale), read back as a spider chart with a row per domain but **kept off the whole-run profile web** by `profile: false` (its dimension names carry "(HEXACO)", because a dimension is one name across the run and an unmarked Extraversion would pool with the FIPI's). The Mini-IPIP6 (`ipip6`) sits commented out in the same file, dropped for the HEXACO; then a second briefing and the HiTOP-BR (`hitopbr`): 45 statements about the last twelve months on a 4-point scale, scored as six spectra (Somatoform, Internalizing, Thought Disorder, Detachment, Disinhibition, Antagonism) and read back as a spider chart with a row per spectrum, like the FIPI. The one questionnaire whose norms are **not** invented — they are the development-sample means and SDs of Simms et al. (2026) — and, being norms, they put the six on the whole-run profile web too. Item keys are the {hitop} package's own (`HBR_01`…`HBR_45`) so a saved file scores with `score_hitopbr()` as it is |
| Level 5 | `bait` — a briefing, the AI knowledge and usage singles, then the shuffled BAIT statements (the union of the 2.1B and 2.2 administrations, under the harmonised item names of the pooled validation, plus its attention check). Scored as the BAIT-8 — AI Realism, AI Enthusiasm, AI Apprehension — and read back as one of three archetypes (see below) |
| Level 6 | `archetypes` — a briefing, then twelve two-item scales after Pearson's twelve-archetype framework (Idealist, Sage, Seeker, Revolutionary, Magician, Warrior, Realist, Jester, Lover, Creator, Ruler, Caregiver). The only scored questionnaire in the app **written without norms on purpose**, and the only one fed back anyway: read back as a wheel (see below) |
| Level 7 | `closing` — nothing scored in it, so it opens no results |
| — | `gjs` sits in `content/block_UNUSED.js`, named on no level, so it is never asked; the `somatic` medical-history questionnaire sits commented out in `content/block_health.js` |

The demographics of a level are written `shuffle: false` and come first in it;
everything else on that level is shuffled in behind them. A follow-up to an
answer (`…Other`, `GenderIdentity`) is written directly after the item it
branches from. The one-item scales of the `fast` block — narcissism, health,
stress, self-esteem, self-efficacy, life satisfaction and the two
self-placements — are written as one `singles` questionnaire and not as eight,
so that they are asked in among one another; none of them is a sixth item on
the FIPI, which would put them on a chart they do not belong on. If one of
them ever earns norms it wants a questionnaire of its own back, so that its
results carry its own name. `gjs` is **commented out** in
`content/block_UNUSED.js` *and* named on no level of the timeline — a block the
timeline does not name is inert either way — because it asks everybody about a
job without asking first whether they have one. Waking it takes both.

**Levels that score, and levels that don't.** A level with nothing scored in it
opens no results: `scoredLevels` (the levels that hold a dimension) is what the
sidebar draws buttons for, while the line itself runs over every item there is.
That is what `closing` is for — the last item of the run sits on a level of its
own, so the last scored level is opened and read *before* the test ends rather
than instead of it. **Everything the participant sees calls these levels**;
nothing on screen or in the code says "part" any more. The end of
the run is `finale()`: three sprays out of the item that ended it, then the
profile.

**Branching.** An item with `showIf: { key, is }` is only asked once that answer
is given. `questions` still holds every item; `shown()` decides, and everything
that walks the run goes through `nextShown` / `previousShown` / `askedIn`
instead of `index ± 1`. `pruneBranches()` drops a branch's answers when the
answer that opened it changes, so a closed branch is indistinguishable in the
saved file from one never reached (`response` and `timeOnset` both null).

**The item itself.** `text` is written into the page as HTML, so a question may
carry its own stem — the PHQ-4 items are "Over the last 2 weeks…<br /><em>the
thing being asked</em>" — rather than leaning on `instructions` above them. It
comes from the block file it is written in and nowhere else.

**Types.** Every item has a `type`, which is the whole of what decides how it
is put on screen: `"choice"` for option buttons, `"input"` for a typed field,
`"multi"` for a list several answers may be true of at once, `"curve"` for a
place on a bell curve, `"briefing"` for a screen with nothing
to answer on it. The first two need never be written in `content/` —
`typeOf()` reads them off the format, since a question that said its own type
as well would only be a second place for the two to disagree; the other three are
written. `SCALES` in `app.js` is a renderer per type, and `SPRAYS` beside it names what
each type is answered *by* — which is where the spray comes out of when it is.
Those two tables are the only places a type is dispatched on, so **a new way of
answering is a `type` in `content/` and a line in each of them, and nothing
else moves** — `curve` was added that way, and touched nothing but the tables,
its own renderer and its own stylesheet block.
A Likert scale and a list of countries are both `"choice"`: they differ in what
is written on the buttons and in nothing the engine can see, and giving them
separate types would be a distinction with no behaviour behind it.

**Briefings.** An entry of `type: "briefing"` is not a scored question but a pause
inside a level: a heading, a few paragraphs of `text` (HTML, into
`.briefing__body`) saying what the next stretch is about, and a button. **It
belongs to its block, beside the questionnaires rather than inside one** — it
introduces the whole stretch that follows, which may be more than one
questionnaire, and nothing that shuffles the items of a questionnaire can reach
it there. `typeOf()` throws if one is found among a questionnaire's `items`,
since that used to be where they lived and there it would render as a scale with
nothing on it. The engine forces `shuffle: false`, and the run is shuffled around
it rather than through it. Eight are asked, one at the head of each of the
`fast` block (warning that the questions get stranger further down), the `mint`
block (turning from questions about you to questions about your body), the
`mood` and `health` blocks (each turning from you in general to the last few
weeks), two in the `personality` block (one at its head, turning from the five
strokes of level 1 to a fuller drawing of the same traits, and one before the
HiTOP-BR, widening from the last few weeks to the last year and saying that
what follows is asked as spectra rather than as categories), the `bait` block (turning from you to what you make of AI), and the
`archetypes` block (turning from AI back to the self, as a story).

It takes the survey screen over rather than being a screen of its own
(`renderBriefing`, hiding `#text` and `#scale`), so everything guarding on
`screen === "survey"` — the keyboard, the back button, the timing — goes on
holding while it is up. Its onset, continue response and response time are
recorded in `items[]` like any other item, but `askedIn` leaves it out of
scoring and quality-control counts so it can never be the thing holding a level
shut. `isBriefing()` is the one test for one, and everything that counts what
was answered goes through it. Test mode never stands one in for a person either
— only the items of a questionnaire are thinned, and a briefing is not one of
those. Leaving one goes through `advance()`, the same way out an answered item
takes, so a briefing could end a level and the level would still break the same
way.

**The curve.** A `"curve"` item (`renderCurve`) asks where somebody puts
themselves in a room of a hundred, and is answered on a normal curve rather
than on a scale of points. Moving across it fills it from the left and writes
the share over the mark, and those are the same fact twice: the area under the
curve up to a point *is* the share below it, so the fill is read off
`percentile()` — the one already used for scoring — against the standard normal
the curve is drawn from. The number shown is what is answered and what is
saved.

A click on the figure is the answer, with nothing in between to confirm it:
where it lands is the place, and the number standing over the mark is what is
recorded. **The whole figure is therefore live** — a click anywhere on it ends
the item — so anything added around it wants to sit outside `.curve`.
Underneath it is a real `<input type="range">`, invisible and taking no pointer
events of its own: it holds the value, carries the item to a screen reader, and
is the only way in that is not a pointer — the global key handler already
ignores an `INPUT`, so its arrows move the mark instead of sending the run
backwards, and Enter takes where it has been moved to. The figure alone handles pointers, so the two can
never disagree about where the mark is. Going back to an answered one puts the
mark where it was left, which is why `placeOf()` exists: what is kept is the
share, so the place has to be found back from it.

**Typed answers.** An `"input"` item renders a field and a Continue button
(`renderEntry`) instead of option buttons, taking what is in it on Enter or
click: `"number"` once it is inside `min`/`max`, `"text"` as soon as it is not
blank (`max` is its length). The global key handler ignores events from an
`INPUT`, or digits would answer the item while being typed. A written answer is
somebody's own words, so nothing may put it in a selector — the spray on
answering comes out of the Continue button rather than out of
`[data-value="…"]`.

**Several answers at once.** A `"multi"` item (`renderMulti`) is a list to
tick rather than a scale to pick a point on: the labelled buttons of a choice,
latched instead of taken on the first press, with a Continue underneath that
is what actually ends the item. What is recorded is a **list**, written in the
order the options are authored and not the order they were pressed, so two
people who chose the same things save the same answer. An option marked
`exclusive: true` — "none of these" — is not one more thing that can be true
of somebody: taking it puts every other answer down, and any other answer puts
it down. Nothing chosen is not an answer, since saying "none of these" is a
different act from saying nothing, which is why Continue stays disabled until
something is latched.

A list is one answer and travels as one everywhere: `said()` reads it back
option by option so the file holds the words, `markSelection()` treats a single
answer as a list of one so both light the same way, and `shown()` opens a
branch on **any** of the wanted answers being among the ones given — which is
how the psychiatric treatment item waits on there being a diagnosis at all. The
keyboard latches by pressing the buttons themselves rather than keeping a
second copy of the toggling, and Enter is what says the list is finished.

**Scoring.** Items sharing a `dimension` are averaged by `score()`, which returns
`undefined` until every one of them is answered — that is what gates the reveal
of a chart point or a results row. An item marked `reverse: true` is counted
backwards into its dimension (`counted()`, `lowest + highest - answer`) — what
was answered is still recorded as given, only the scoring turns over, which is
how the MINT's deficit items add up to Clarity. An option marked `custom: true`
("Something else", "Other") is an answer outside the scale: the engine keeps it
out of the scale's bounds and `counted()` treats choosing it as the item being
unanswered, so an escape answer holds its dimension unfinished rather than
feeding an arbitrary code into the average. `norms` (mean/sd) turn a score
into a percentile; the tercile it lands in picks the `interpretations` text.
**Norms are also what put a dimension on a results screen at all**:
`dimensionsOf` leaves out any dimension without them, so it takes no row, no
point on its questionnaire's chart, and — if that is all of that
questionnaire's dimensions — no section either. It is still asked, still
scored and still saved; there is simply nothing to place it against, and a bare
number tells the person who gave it less than silence does. Writing the norms
is how a scale earns its way into the feedback, which is why the `singles`
items are asked and read back to nobody — not in a level's results, and not on
the whole-run profile web either, which carries only what a level names (see
**The profile**, below). The PHQ-4 is a different kind of
exception: Anxiety and Depression carry norms, so `dimensionsOf("phq4")` is
not empty, but neither ever earns a row — `total()` reads them as a *sum*
rather than `score()`'s average, folded straight into the Mood face instead
(see **Faces**, below). The twelve archetypes are the one outright exception,
and the only one there is meant to be: they carry no norms and are fed back
anyway, because they are read against *each other* rather than against other
people (see **The wheel**, below). Everything else follows the rule — a
dimension with nothing to be placed against says nothing.

**Figures.** Most questionnaires get a spider chart (`CHARTS`). The MINT gets a
body instead (`drawSoma`): bodily awareness in the head, bodily sensitivity in
the chest, each a ring filled to where the score sits on its own scale with a
tick where the average person sits, and bodily clarity the cord between them.
The body is the *whole* of that section — it carries the name, the standing
("lower than 63% of people", one sentence at one size) and the interpretation
beside each organ, so `renderResults` gives it no rows underneath — including
the agree/disagree, which sits directly under each interpretation inside the
figure, in a `<foreignObject>` holding the same `voteButtons` every other
prediction gets and writing to the same `feedback`. SVG text
does not wrap, so `lines()` breaks the interpretation itself, and the holder
gets `.result__chart--wide` for the room to read it. It draws from `teaseValue`
when the level is locked, like every other figure.

**Faces.** The PHQ-4, the Dissociation questionnaire and the SSS-8 read as one
section rather than three — "Mood & Health" — a row of three faces (Mood,
Strain, Health) instead of a chart and rows apiece: sad at one end of a scale,
pleased at the other, on a ring that fills exactly the way a MINT organ's
does, coloured along the way from red to green, with one general reading of
what that tends to mean underneath and the same agree/disagree every other
prediction gets. `MOOD_HEALTH_OF` names the three questionnaires this section
stands in for; `renderResults` renders it once, in place of whichever of the
three comes first in `RUN`, and skips the other two where they would
otherwise fall — the only place in `results.js` a handful of questionnaires
share a single section rather than each keeping one of its own. Their items,
scoring and place in the run are entirely untouched; only what `renderResults`
draws from their name changes. `MOOD_HEALTH` is the three readings themselves,
each a small builder function rather than a stored value, so every one is
worked out fresh on every render the way `score()` is.

Most of what a face reads is a real dimension — Strain is — but Mood and
Health are not: the PHQ-4's Anxiety and Depression have to stay apart, as
items, for `total()` to read the way they are written, and the SSS-8's four
domains are real dimensions in their own right (asked, scored and saved, just
no longer given a row of their own here). Mood and Health are instead worked
out directly from `total()`/`score()` of the real dimensions behind them and
read against a norm written in `results.js` itself (`MOOD_NORM`, `HEALTH_NORM`
— each in the same `{ mean, sd, interpretations }` shape a written-in-`content/`
norm takes, so the same `tercile`/`sentence`/`voteButtons` plumbing reads
either kind without knowing the difference) rather than in `content/` —
invented exactly as every other norm in this app is, and flagged as such
beside them. Because neither is a dimension, neither takes an axis on the
whole-run profile web or the shareable card — and nor do Anxiety, Depression
and the four SSS-8 domains behind them, which are only ever read folded into a
face. Of this section only Strain, a real dimension read back under its own
name, is on the web. Sleep is asked, scored and saved the same as ever, but is
not one of the three faces and carries no norms, so it earns no row here and
no axis there either.

The row is only ever as wide as the faces that have something to show. Each of
`moodFace`/`strainFace`/`healthFace` names its dimensions directly rather than
discovering them through `dimensionsOf`, so — unlike everywhere else in this
file, which only ever asks `score()`/`total()` about a dimension it already
knows exists — they have to allow for one being missing outright, not only
unfinished: a block left out of `content/timeline.js`, say, rather than one
still in progress. `known()` is that check, and a face whose dimension does not
exist reads as `undefined`, the same value an unfinished one would carry.
`renderFaces` already skips a face with nothing to show, so a questionnaire
that never ran and one not yet finished narrow the row the same way.

Strain itself is two instruments pooled into one dimension rather than two:
the CDS-2 and the PCL-2 measure different things — detachment from one's
surroundings, and the return of difficult memories — but nothing downstream
ever reads them apart, so their four items all carry `dimension: "Strain"`
in `content/block_mood.js` and are averaged together by the ordinary `score()`
machinery, the same as any dimension with several items. That only holds
together because both instruments, and the PHQ-4 beside them, were put on the
*same* response format (`vertical: true`, strongest on top) — `score()`
averages raw answers with no notion of which item they came from, so pooling
items answered on different scales would quietly mix two different units into
one number.

A face reads its ring, its colour and its mouth off one shared number, `happy`
— 0 sad, 1 pleased — which is a *reach* along the reading's own scale
(`lowest`/`highest`), flipped for the readings where less of it is the happier
place to be (`worse: "high"`, on Mood, Strain and Health alike). That is a
different axis from the percentile written beside the face ("higher than 84%
of people"), which reads the same value against a norm instead: a modest score
on a scale where most people score near zero can be both a mostly-green ring
and a high percentile at once, exactly as a soma organ's ring already can. The
mouth is `faceMouth()`'s one job: a curve bowed *below* its own ends for a
smile and *above* them for a frown — the opposite of what "curves up" suggests
in words, which is the one thing about it worth double-checking on sight
rather than by reasoning about the path string.

**The archetype.** The BAIT closes its level as neither rows nor rings but as
one figure (`renderArchetype`): a robot, "Based on your answers, you are…", and
**which of three archetypes** the answers are nearest. The three come from a
cluster analysis of the pooled BAIT samples rather than from a shape drawn on
the facets: the partitions are not crisp, but they say which *combinations*
occur — at k = 2 one evaluative axis (realistic, hard to spot and likeable,
against the reverse of all three), and at k = 3 a group carved out of the
attitude end (worry 1.21 SD low, enthusiasm high, capability beliefs merely
average), leaving one that holds AI output realistic, hard to spot *and*
dangerous. **Believing AI capable and being alarmed by it are not two ends of
one thing** — which is what the enthusiasm × apprehension quadrants this
replaced implicitly claimed, and the reason the shape changed.

`aiArchetype` places somebody by nearest-centroid on the z scores of all
three dimensions — Realism now counts, where the quadrants read only the two
attitude facets — each read against its own norm, so the same `normOf`
plumbing that serves the mood faces serves this. `ARCHETYPE_OF` names the
questionnaire it stands in for, `ARCHETYPE_ON` the dimensions somebody is
placed on, and `ARCHETYPES` (in `results.js`, beside `MOOD_NORM`) is the three
themselves — name, share, `at` (the centroid, in SD units per dimension), and
reading. The centroids are that reported description read into SD units, only
the worry figure being exact, and the *shares* are invented placeholders
exactly as the norms are, flagged as such. `feedback["AI Archetype"]` is still
where the agree/disagree is filed — the key is unchanged so that answers
collected either way stack. The BAIT's three dimensions earn no rows — the
archetype is the whole of the section — and take no axes on the whole-run
profile web or card either: the archetype is how they are read back, and the
web carries only what a level names. Locked, the figure keeps its
shape: a stand-in name, a 00% share, all blurred, and no live buttons.

**The wheel.** The twelve archetypes close their own level as neither rows nor
rings but a wheel (`renderWheel`, `drawWheel`): each takes a petal of the
circle, filled out from the middle as far along its own scale as the answers
put it, in its own colour, with whichever came out longest picked out in gold
and named underneath — the whole shape is the reading, and the longest petal is
the story loudest in you. `WHEEL_OF` names the questionnaire it stands in for,
`WHEEL` the twelve themselves (dimension, colour, reading) and `WHEEL_HELD`
those of them the run actually holds, the way the faces check `known()`. The
colours are the twelve-hue circle it was ported from and live in `results.js`
for the same reason the MINT's organ colours do: they are how the figure is
drawn, not anything that was asked.

**This is the one section drawn without norms**, and the only place
`dimensionsIn` is used rather than `dimensionsOf` — there is no population mean
for "Warrior" that would mean anything, so the twelve are placed against one
another instead of against other people, which is also why they are a wheel and
not rows: a row wants a percentile, and there is none to give. Two-item scales
tie often, so `leading()` returns *all* of the archetypes tied for the top
rather than picking one, and past `WHEEL_MOST` of them the wheel is called an
even one instead of crowning anybody. The twelve take no axes on the whole-run
profile web or card: the wheel is how they are read back, and twelve more axes
on the web only repeated it and crowded out everything else there.

**Locked levels.** Every level button opens, finished or not. An unfinished one
renders through the same `renderResults(into, level, locked)` path with
`locked` true: all of the level's dimensions are listed rather than only the
scored ones, the chart is drawn from `teaseValue()` — a fixed figure hashed from
the dimension's name, meaning nothing — and everything earned is blurred by
`.blank`. Teased points carry no tooltip and locked sections take no pointer
events, so no fabricated number is ever readable. Keep it that way, and keep the
preview faithful: it should show exactly what finishing the level will show.

**The MINT's two scales.** `formatMint` is drawn in `content/block_mint.js` when
the page loads — `sequential7` or `symmetric7` — and the MINT's `format` reads
it, which is the whole of the mechanism: the symmetric run carries `labels`,
seven strings written on the circles over the values behind them. Only the
writing changes, so scoring, the reversed items, the norms, the charts and a
shared card link are the same either way. `said()` records the label, so the
file holds "-3" where that is what was on screen, and `container()` saves
`formatMint` beside it to say which scale that was.

**The way in.** The intro screen is four things stacked, **a window each**
(`min-height: 100svh`, contents centred), so scrolling moves from one to the
next rather than showing two at once: a full-window `.hero` carrying the title,
the `.creed` (the Jung line, the first thing the scroll uncovers), the `.why`
making the case for answering any of this — with the whole web hanging blurred
behind it (`.why__web`, drawn by `renderExample` from the same `teaseValue` a
locked level uses, so it is nobody's result) — and the `.gate` holding the
consent form. It is the only screen laid out full width —
`showScreen()` writes the current screen to `body[data-screen]`, which drops
`#app`'s max-width and hides the banner and sidebar while the title has the page.
Scrolling sets `--gone` on the hero (`sinkHero`), and everything in it fades,
lifts and blurs by that fraction. Reaching the end of the form turns the button
into "Start the test".

Pressing it carries on *down*: `body.sinking` opens another 72vh of water below
the form and the page smooth-scrolls into it while `gaze()` — the Nietzsche
line, cut short by any click or key — closes over the top. Nothing ever scrolls
back up in view; the jump to the top happens under the opaque quote, which is
why every such jump goes through `jump()` and not `window.scrollTo`, whose
smooth default would be seen. The first item goes up *behind* the quote while it
is still opaque and comes in on `.screen--arriving`, so the quote dissolves into
a question surfacing rather than ending on one already there. `timeOnset` is
re-stamped once the fade is off it.

`.screen--arriving` is then **left on the element**, and only `showScreen()`
takes it off. Removing it where it was added would swap the animation back to
the `rise` of `.screen--active`, and a changed animation-name is a new
animation: the item would fade itself in a second time, a beat after it had
arrived. Anything that takes a class carrying an animation off a live element
wants checking for the same thing.

**Finishing a level.** `completeLevel()` never simply prints the results. It
renders them, seals them (`sealSections`), and calls `curtain()`: water breaks
across the middle of the window carrying "Level N complete" — a band, not the
whole screen, so the level screen is swapped in behind it as it crosses
(`CURTAIN_COVER`) and is already there when it runs off.
`openSections()` then breaks one results section open at a time — scrolling it into
view, unblurring it, throwing a spray of gold out of the middle of it — and the
way on (`.level__foot`, at the *bottom* of everything the level opened) arrives
last. A click anywhere opens the rest at once; that listener is registered a
beat late on purpose, or the click that waved the paint past would be caught on
its way up and skip what it just uncovered. `prefers-reduced-motion` skips the
staging entirely.

**The back button.** The browser's own is a thumb going for the previous item,
and a run is held in memory alone — leaving is losing it. Once the survey is up,
`trapHistory()` pushes one spare history entry and the `popstate` handler puts
that entry straight back every time the button eats it, so back never leaves the
page: it closes a panel if one is open, and otherwise is `goBack()`, which holds
while a level screen is up or the run has ended and stops at the first item. The
entry is pushed on a click, so Chrome does not treat it as one to skip past.
Before the survey (the intro, somebody else's card) nothing is pushed and back
is still the way out, since nothing has been answered that leaving would cost.
`pushState` is called with no URL, which keeps `?sub=` and `?testMode=true` on
it. That and the `replaceState` on leaving a shared card are the *only* two
places the page touches history — a press can then only ever mean one thing, so
keep it that way.

**Screens vs panels.** `showScreen()` swaps the base screens (intro, survey,
level, done) — one at a time, inside `<main id="app">`. The bar's buttons
instead call `openPanel()`, which slides an overlay panel over whatever is
showing; the base screen never changes. Panels live in `#overlay`, outside
`<main>`, which stops short of the bar (`inset: 0 var(--bar) 0 0`) so the bar
stays reachable with one open. The bar's links open `.panel--right`. A level
opens `.panel--left`, which is also `.panel--summoned`: it does not slide but
*grows out of the level button that opened it* and is sucked back into it on the
way out, so the button reads as where the level is kept. `fromLevel()` writes that
button's centre onto the panel as `--from-x` / `--from-y`, the origin its
scaling turns about, measured against the overlay — the panel's own box is
scaled down to nothing while it is shut and is no use for the sum. The level
screen leaves the same way (`suckLevel`, `.screen--sucked`), so finishing a level
and closing its panel put it away in the same place. Scrim click, the × and
Escape all close — and so does the button that opened it: every way in is also
the way out.

**Banner and sidebar.** The `.banner` across the top carries the name of the
test and nothing else, and is stacked *under* the sidebar: the descent begins
at the banner's own lower edge, so the bead and the metres sitting on that
point would otherwise be drawn behind it. Everything else the test carries with it is stood on end
down the right (`renderSidebar`): the Profile / See result links at the foot,
and the descent running along the sidebar's left edge — the edge the page sits
against. The line is divided **equally between the levels**, so a level's button
sits at the same point on it however many items it holds: with two levels they
are at 50% and 100%, and what a long level buys is a slower stretch of
water rather than a longer piece of line. `descentShare()` is that mapping —
each level contributes its own share of the band it was given — and
`.sidebar__fill` is drawn from it, with `.sidebar__depth` (the metres) riding
the end. A level with nothing scored in it takes no share at all, so the
closing item is asked at the bottom of the abyss rather than below it. A level
button is the only way into
`openResults(level)`, finished or not. Both are hidden on the intro and card
screens; `--banner` and `--sidebar` are their sizes and the body is padded
clear of both (with extra width for the level buttons, which sit out over the
line); below 760px everything on the sidebar comes in a size.

**The profile.** `renderProfile(into)` is handed the corner of the page to fill
— the panel during the run, `#profile-done` once there is nothing left to
answer — and finds the web, the legend, the note and the share buttons *by
class* inside it. That is why those hooks are classes (`.profile__web`,
`.profile__note`, `.share__copy`, …) and not ids: the same block is on the page
twice. Finishing the run shows that screen directly; there is no announcement
with a way to the profile on it.

The web does **not** draw every dimension the run scores. It draws `PROFILE`
(in `results.js`, at the head of the card section): the dimensions a level's
results name under their own name — a row under the personality chart, an
organ of the body, a face. Currently that is the Big Five, the three MINT
dimensions, Strain and the six HiTOP-BR spectra, fifteen axes. The rule is derived rather than listed
(`onProfile`): a dimension is on the web if it has norms, unless it belongs to
a questionnaire read back as one figure — the BAIT (the archetype) and the
twelve archetypes (the wheel) are left off, and of the three Mood & Health
questionnaires only a dimension that is itself a face (Strain) stays; and a
questionnaire written `profile: false` in `content/` (the HEXACO) keeps its
dimensions off it however many norms they carry. So a
scale that earns its norms takes an axis in the same breath, and a dimension
folded into a composite (Anxiety, Depression, the SSS-8 domains) or shown
nowhere (Sleep, Life Satisfaction) takes none. It used to carry all
thirty-odd, which was unreadable and only repeated the wheel; the crowding
code in `drawSpider` and `drawCard` went with them. The landing page's
`.why__web` and the card are drawn from the same list.

**The card.** `drawCard()` paints a 1200×630 canvas of the whole web — the
`PROFILE` dimensions, on the same geometry the profile panel draws, with the
ones still unanswered left as gaps. It is never previewed in the panel — the
web above the two buttons is the same drawing — so it is only made when
"Download your card" or "Copy share link" is pressed. It carries exactly what
the web does and no more — no archetype, no wheel — and sharing carries all
of that, because pressing the button is a deliberate act. The same values go
into `?card=1&s=Name~value,…`;
`readCardLink()` reads them back, keeping only names it finds in
`PROFILE` and numbers inside that dimension's own scale, so a link is
never a way to get arbitrary text onto the page. A good link shows
`screen-card` — somebody else's result, nothing recorded, with the way into the
test underneath it.

**Depth.** The run is dressed as a descent: `depth()` turns `descentShare()` —
how far through the scored levels the run is, not how many items have been ticked off —
into metres of the Challenger Deep, shown beside the point the bar's line has
reached and under the water that breaks on finishing a level. Finishing a level
therefore always lands on a round share of the deepest water there is. It is a
reading of progress and nothing else — no answer, score or norm goes near it.

**The water.** `body::before` is a column of water several windows tall —
sunlit at the top, near black at the bottom — and `--descent` (0 at the surface,
1 at the end of the run) is `background-position` down it, so going on with the
test is going under and each level sits in visibly darker water. Only
`renderDepth` writes it, from the same `descentShare()` the line is drawn from.
The landing screen
is not in the water at all: `body[data-screen="intro"]` (and the card screen)
keeps the dark it always had, and the surface opens *underneath the quote* on
the way in — `gaze()` puts the survey screen up while the quote is still
opaque, so what it clears onto is the top of the column. The level screen dims
the water behind it (`filter: brightness(…)`) so a level's results are read
rather than swum through. Because the top of the column is bright, anything
meant to be read sits on a *dark* translucent surface (`--surface`, `.consent`)
rather than a white film.

**Saved data** is `container()`: `version` first — the app version that wrote
the file, logged in `CHANGELOG.md`, so an export can always be matched back to
the code that produced it — then `participant` and `testMode` — which run
this is and whether it counts — then `timeStart`, a `timeLevel<N>` per level —
when that level was last left with nothing outstanding, stamped in `answer()`
rather than on the level screen, which the last level never shows — `formatMint`,
`qualityControl`, then `items[]`
(`key`, `order`, `response`, `timeOnset`, `timeResponse`) and `feedback`. `response` is
what was read on screen, not the code behind it — `said()` gives back the
option's own text ("Male", not 1), so a saved file is legible without the
codebook. An option with no label of its own (a numbered circle) and a typed
answer are saved as given. Scoring still works off the values in `responses`;
only the file carries the words. Computed scores are deliberately **not** saved
— they are derived at analysis time.
`timeOnset` is re-stamped whenever the item is shown again, including on closing
a panel that covered it, so the gap to `timeResponse` stays a reaction time.

**Where it goes.** When the last item is answered, `advance()` calls `save()`,
which POSTs `container()` — the very JSON "Download responses" would save — to
DataPipe (`DATAPIPE`, `DATAPIPE_EXPERIMENT` in `app.js`), which files it in the
repository the experiment is bound to (a Zenodo deposit). It is sent once, at
that moment, and never again: DataPipe takes a filename once, so
`filename()` puts the run's start time after the participant code (a `?sub=`
code can come round twice) and prefixes a test run `test-` rather than
`responses-` so it can be picked out and binned. `saved()` writes the outcome
into `#save-note` on the last screen — sending, saved, or failed with the
download button as the way out. An agree/disagree given on a level reopened
*after* the end is the one thing the sent file can miss; that is accepted.
DataPipe answers 201 with `{"message":"Success"}` on success and 400 with an
`error` code otherwise (`EXPERIMENT_NOT_FOUND`, `OSF_FILE_EXISTS`, …);
`save()` goes on `response.ok` alone.

**Parked, September 2026: saving at every level.** A run left halfway saves
nothing, and the author wants a checkpoint at each level. **DataPipe refuses a
filename it has already taken** (`OSF_FILE_EXISTS`, on the Zenodo adapter too
— tested 2026-09-02 against `datapipe-test.web.app`), so checkpoints would
have to be one file per stage — six a run, against a Zenodo record's default
limit of a hundred files. DataPipe's maintainer has said a coming release may
allow overwriting a file, or updating one before it is sent. **Come back to
this once that release is out** (a few weeks from then): with overwriting, a
`save()` call at the top of `completeLevel()` is the whole change; without it,
the stage has to go in the filename and the file quota raised.

**Who is taking it.** Every run carries a `participant` code, twelve characters
drawn from an alphabet with no I, L, O, 0 or 1 in it — a code is read off a
screen and typed back. A link may bring its own (`?sub=`), for a prewritten list
or a platform putting its own id on the end: it is somebody else's text, so only
`[A-Za-z0-9_-]` survives it and only 32 of those, and what is left of an empty
or impossible one is a code of our own. It is also the name of the downloaded
file (`responses-<code>.json`).

**Quality control.** `qualityControl` is a `level<N>` per level, saying how the
level was answered rather than what it says, and three numbers is the whole of
it: `responseTimeMean` and `responseTimeSD` in milliseconds — sample SD, null
where there is only one time to go on — and `attentionChecksFailed`. `took()`
is the one place a reaction time is worked out; an item that was shown again
after being answered has had `timeOnset` re-stamped past its response and is
left out rather than counted as negative. An attention check is any item
carrying `check:` in a block file — the answer it must have — and one left
unanswered has not been failed. Only items actually asked count, so checks
answered for the run by test mode are not among them. Nothing here is shown to
anybody, and no score, norm or interpretation goes near it.

**Test mode.** `?testMode=true` walks the run in miniature, so that every chart,
level and reading can be reached quickly: every questionnaire keeps
`TEST_KEPT` (1) item, chosen at random, and `thinRun()` answers the rest at
random and marks them `auto`. `shown()` returns
false for an `auto` item, so everything that walks the run — the sidebar, the
descent, `levelProgress`, the level that unlocks — behaves as though it were not
there, while the scoring behind the results has its answer. Such an item is
saved with its `response` and with **null times**: nothing was put on screen, so
there is no reaction time to it, and the quality-control figures pass over it.
An item waiting on another (`showIf`) is left out of the thinning, so a branch
still opens on the answer that opens it, and `pruneBranches()` leaves `auto`
answers alone. A test run is not data: it says so in the file (`testMode`) and
across the top of the screen (`.banner__test`). Test mode also opens the consent
gate without the form being read (`checkConsent`) — there is nobody there to
consent — and the landing page carries **a temporary link into it**
(`.testmode`, in the `.gate`), which is nothing but a link to `?testMode=true`,
since that is the whole of the switch. **Take that link out of `index.html`
before the study runs.**

## Conventions

- No semicolons, 4-space indent, ~130 col, double quotes. Match it.
- Comments say *why*, in prose, above the thing. British spelling. Don't add
  comments that restate the code.
- Prefer adding to `content/` over adding branches to the scripts. Questionnaire
  behaviour is data-driven; `CHARTS`, `SOMA`, `MOOD_HEALTH_OF`,
  `ARCHETYPE_OF` and `WHEEL_OF` are the only places that name a questionnaire,
  and new ones should be rare.
- Anything that reads a score goes in `results.js`, anything that walks the run
  in `app.js`. If a change wants both, it probably wants a new member on the
  `engine` object rather than a second copy of the state.
- Keep it dependency-free and buildless.
- One folder each for the questions (`content/`), the code (`js/`) and the look
  (`css/`). Nothing else belongs at the root but `index.html`, `assets/`, the
  notes, and `literature/` — a git-ignored shelf of reference PDFs behind the
  ideas list in `README.md`, which no part of the app reaches for.
- **Adding, removing or renaming anything in `content/` means updating the
  Includes list in `README.md` in the same breath.** It is the only summary of
  what the test asks that anybody reads without opening the files, so a stale
  one is worse than none: it is what the author, and anybody asking what is in
  the study, will go by. Keep it in the shape it is already in — a bullet per
  level, a line per questionnaire, the abbreviation in brackets — and keep the
  counts at the foot of it right. A block written but named on no level of the
  timeline stays on the list, marked as not asked, so that it is not written
  twice.

## Gotchas

- **"Section" is now only ever a *results* section** — one block of a finished
  level's results (`sealSections`, `openSections`, `.result` in `results.css`).
  The pause in the middle of a level is a **briefing** (`type: "briefing"`,
  `.briefing`, `renderBriefing`, `passBriefing`), and was called a section, then
  a presentation screen, before it settled. If you find either of the old words
  anywhere outside `results.js` and the level screen, it is a leftover — but
  note that `role="presentation"` in `index.html` is an ARIA role and nothing to
  do with any of this.
- **"Archetype" now means two things, in two different files.** The *AI*
  archetype (`ARCHETYPE_OF`, `renderArchetype`, `ARCHETYPES`) is which of three
  answer profiles the BAIT came nearest, on level 5. The twelve *archetypes*
  (`WHEEL_OF`, `renderWheel`, `WHEEL`) are the Pearson framework asked on level
  6, drawn as a wheel. They share nothing but the word — different questionnaire,
  different figure, different feedback key (`"AI Archetype"` against
  `"Archetype"`, and both keys are load-bearing, since the agree/disagree
  collected under them has to keep stacking).
- **"Block" also means two things.** A *block* is one file of questions in
  `content/`, named in the timeline. A *results* block is a `.result` section,
  above. The first is in `content/` and `app.js`, the second in `results.js`.
- **A dimension is one name across the whole run.** `dimensions` in `app.js`
  is keyed by name alone, so two questionnaires writing `dimension:
  "Extraversion"` are averaged into one score, on whatever mix of scales they
  came in, and `normOf` reads the first one's norms for both. That is why the
  HEX-ACO-18 dimensions carry "(HEXACO)" (and the commented-out Mini-IPIP6's
  "(IPIP)"): the FIPI had the plain names first. A new instrument on ground already covered wants
  a tag of its own.
- **A new file needs a `<script>` or `<link>` tag in `index.html`, in the right
  place.** There are no modules and nothing imports anything: each file adds to
  the globals the next one reads. A block file loaded before
  `content/timeline.js` throws on a `defineBlock` that is not there yet, and
  `js/app.js` has to be last of the scripts. A block with no tag does not exist;
  a block with a tag but no name in `TIMELINE` exists and is never asked, which
  is the difference between forgetting one and leaving one out.
- **All `norms` in `content/` are invented placeholders**, flagged as such in
  comments, **with one exception**: the HiTOP-BR's in `content/block_personality.js`
  are the development-sample means and SDs printed in Table 1 of Simms et al.
  (2026), by way of the {hitop} R package — a development sample, not a norming
  one, and skewed towards its floor, which the comment beside them says. Never
  present the rest as real, and keep the flags when editing. The
  `archetypes` block has none at all, and that is deliberate rather than
  unfinished — writing twelve would be twelve more invented numbers, and the
  wheel does not want them. Don't "fix" it by adding some.
- **The consent form in `index.html` is still placeholder wording** — the banner
  that said so has been taken off at the author's request, so nothing on screen
  flags it any more. It must be replaced with the approved text before the study
  runs. The Start button stays disabled until the form has been scrolled to the
  end (`checkConsent`).
- **The "Test mode" link on the landing page is temporary scaffolding**, and so
  is test mode opening the consent gate. Both go before the study runs.
- The PHQ-4 uses the refined 5-option version, so `0.5` is a valid response and
  sums are not always whole (`tidy()`).
- Items with no `dimension` (attention checks) are skipped by all scoring.
- **`gjs` is out of the timeline, not out of `content/`.** It has a block file
  of its own, commented out, and is named on no level. It wants an employment
  item to hang a `showIf` on before it goes back in. (An escape option marked
  `custom: true` no longer feeds its number into the score — it holds the
  dimension unfinished instead — so one is *possible* now, but a dimension that
  can never complete earns no results row, which is why the `showIf` is still
  the better design.)
- **`Country` is four buttons and a branch.** The commonest few are options,
  everywhere else is `CountryOther`, typed — the engine has no dropdown, and no
  list of every country belongs on a screen of option buttons. What is typed
  arrives spelled however people spell it, and wants tidying at analysis time.
- A question of ten or more options wants `columns: 2` (`Ethnicity`,
  `Discipline`): stacked full width, they run off the bottom of the window. A
  `small` option keeps a row of its own whatever the columns are.
- `drawSpider` needs 3+ dimensions to draw a polygon; with fewer, or with some
  still unanswered, it joins neighbours with lines instead. Past eight of them
  it goes `many`: a bigger viewBox and smaller labels. The whole-run web is the
  only thing that gets there, and at fifteen axes it still fits — the two-word
  names wrap onto a second line, which is what keeps the neighbours apart. If
  `PROFILE` grows much past that, the labels near the top and bottom of the rim
  start running into each other and want staggering again.
- The keyboard handler (digits answer, ← goes back) must stay disabled while a
  panel is open — the survey behind it is not being read.
- **`answer()` is reachable when the survey is not on screen.** The option
  buttons of the item before a level screen are still in the (hidden) survey, and
  the water takes `CURTAIN_COVER` to cover them, so it guards on
  `screen !== "survey"` *and* holds `locked` from the moment a level ends until
  "Descend further" is pressed. Without both, the next item — including the
  closing one — can be answered without ever having been seen.
- **An animation filled `both` holds its last frame for as long as the element
  lives.** `sheen` ends with `opacity: 0` for exactly this reason: its last
  frame parks a band of light one full width to the right of the section, which
  is otherwise painted over the middle of the page for ever.
- **Anything reading `normOf(...)` must expect nothing back.** A scale may be
  written without norms — several are — so every `.mean` in `results.js` sits
  behind a check for one. The card is the one that bites: it draws the average
  person across *every* axis in one path, so it draws that ring only when every
  dimension has a norm, rather than skipping the axes that have none.
- **The anchors either side of a scale hang off the circles, not off the page.**
  `renderChoice` puts `.scale--circles` on `#scale` for a scale of numbered
  circles, which sizes the middle grid track to the circles so the anchors come
  in with them — otherwise a five-point scale strands them at the edges of the
  room. Labelled options and typed fields keep the full width they are given,
  and below 560px the stylesheet stacks the anchors underneath either way.
- **A scale may stand on end.** `format: { vertical: true }` stacks the
  options strongest/highest-standing on top instead of last-written-on-the-
  right (circles: the MacArthur ladder in `content/block_demographics3.js`) or
  first-written-on-top (a labelled scale stacked in one column: the PHQ-4, the
  pooled CDS-2/PCL-2/SQS format and the SSS-8, all in the `mood` and `health`
  blocks). The options are still *written* weakest-first — the keyboard,
  `said()` and the saved file all read them in that order regardless — only
  `.scale--vertical`'s CSS turns the row upside down visually
  (`flex-direction: column-reverse`). `.scale--circles.scale--vertical` keeps
  the narrow column the ladder metaphor wants; a labelled vertical scale keeps
  the full width its buttons are otherwise given.
- **`draw()` exists twice, in `app.js` and in `results.js` — and so does
  `mix()`.** Same lines, same meaning — an SVG element with attributes, and a
  colour a share of the way between two others — but the seam runs one way, so
  neither file can borrow the other's. Keep each pair identical or leave them
  alone.
- **`drawSpider`/`drawSoma` add their classes rather than setting them.** The
  same `<svg>` is found again by a class of its own (`.profile__web`), so
  writing `class` outright makes the second render of a profile throw.
- **`.bar` in `results.css` is the percentile bar** under a results row. The
  strip down the right is `.sidebar__*` — including the level buttons on it,
  which are `.sidebar__level*` rather than a block of their own, since `.level`
  is already the level *screen* in `results.css`. Naming anything in `style.css` `.bar`
  again puts a fixed, full-height panel behind every score in the results.
