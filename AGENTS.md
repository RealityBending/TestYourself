# AGENTS.md

The one set of notes on this project. `CLAUDE.md` is a pointer to this file, not
a second copy — write here and nowhere else, or the two will drift.

Single-page survey app. No build, no dependencies, no framework, no tests.
`index.html` loads the content first (`content/timeline.js`, then a
`content/block_*.js` per block of questions), then `js/draw.js` (stateless
drawing helpers everything below it uses), then `js/figures/*.js` (one file
per figure a level closes on), then `js/results.js` (reads scores back), then
`js/app.js` (the engine) — and
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
| `content/timeline.js` | **The frame the rest of `content/` is written into, and what is asked when.** `TIMELINE` is one entry per level, in order, naming that level's blocks — moving a block is moving its name from one line to another, and a block named nowhere here is never asked. Each level also carries a `name`: what the gauge's hover card, the results panel and the level screen call it (`levelName`, `levelTitle` in `app.js`). Its colour on the gauge is not content — the stops run through one gradient by position (`levelColour`). Also `defineBlock()` and the `QUESTIONNAIRES` / `BLOCKS` the block files fill, and, at the head of the file, an annotated skeleton of every field a block may carry. **Read that before editing anything in `content/`**; it says what the fields are, and this file says why. |
| `content/block_*.js` | Every question, scale, colour and norm, **split by block** — one stretch of the run that moves as a piece — so the file to open is the thing being changed rather than the position it happens to be asked in. **Content changes go here and nowhere else.** Each is one `defineBlock("name", [ … ])` over an ordered list of entries: briefings and questionnaires, each carrying its own `key`. |
| `content/block_UNUSED.js` | Questionnaires written but not asked, commented out, waiting on whatever they want before they can go in. Nothing in it defines a block, so nothing in it can be reached. |
| `js/draw.js` | Three helpers that draw rather than decide — `SVG`, `draw()` (an SVG element with its attributes on it) and `mix()` (a colour between two others, reading either a `#rrggbb` out of `content/` or its own `rgb(…)` back, so a tint can be darkened in a second pass; `channelsOf()` is the reader, and the fourth name it takes) — held in common by the two files below it. It reads nothing and keeps nothing, which is the whole reason it can sit under both of them; **nothing else belongs in it**, and a helper only moves down here because `app.js` and `results.js` both want it. Not an IIFE: it takes those names in the globals every file on the page shares, so nothing in `content/` may take them too. |
| `js/app.js` | The engine, one IIFE, in labelled sections: build the run → branching → scoring → rendering an item → the rail → panels → particles → finishing a level → flow → results → the way in → wiring. |
| `js/results.js` | `makeResults(engine)`, a factory returning the handful of functions `app.js` calls. What every figure has in common — reading a score against its norm (`dimensionsOf`, `normOf`, `reachOf`, `standFrom`, `teaseValue`), the tooltip, the votes (`pickButtons`, `voteButtons`, `filed`), the holder a figure sits in (`figureHolder`) — then the spider chart, the results sections and their rows (`renderResults`, `renderTeaser`), the staged opening of a finished level, the profile and the card, and the
showcase of stand-in figures the landing page cycles (`renderShowcase`). Reads scores; records nothing but the agree/disagree `feedback` on a prediction — and, at the moment it is built, the full set of keys that feedback can be filed under (`feedbackKeys`). |
| `js/figures/*.js` | **The figures a level closes on, one file each**, every one a factory `makeX(shared)` called from `makeResults` and handed `shared` — the helpers above and nothing else — and returning what `renderResults` needs to place it: the questionnaire it stands in for, its feedback key, and its render function. `soma.js` (the MINT's body), `climb.js` (the last year as a hill), `theories.js` (the star sign and the temperament), `archetype.js` (the AI archetype), `wheel.js` (the twelve archetypes), `sea.js` (the world); `faces.js` (Mood & Health as faces) is on disk but has no tag and is not loaded. A figure reads scores only through `shared`; nothing in `content/`, `app.js` or another figure file is reachable from one, and the data a figure is read with (the twelve signs, the three archetypes, the wheel's colours and readings) lives in its own file, since it is how the figure is drawn and not anything asked. |
| `css/style.css` | The shell: tokens on `:root`, the water, the banner and the sidebar the descent runs down (a dive gauge — down the right on a wide screen, along the foot on a phone), screens, panels, buttons, the survey, particles. Also the animations the other two sheets share (`fade`, `rise`). |
| `css/intro.css` | The landing screen only: hero, the case for doing this and the Jung line under it, consent form, and the Nietzsche quote on the way in. |
| `css/results.css` | The water that breaks on a finished level, the level screen, results sections, charts, the interoception body, bars, the profile, card. |
| `index.html` | Static skeleton, and the load order above. Screens and panels are markup; everything inside them is filled in by the scripts via `$(id)`. The favicon is an inline SVG data URI in the head — three waves going down, in the descent's three colours. |
| `assets/` | The logos on the hero and the consent form. Referenced from `index.html` only — no stylesheet or script reaches for a file. |
| `norms/` | A workbench, not part of the page: `make_norms.R` prints, ready to paste, every set of norms in the app that is *not* invented. Two sections, independent of each other so that a missing package or a dropped connection costs you one and not both — the HiTOP-BR's development-sample means and SDs out of the {hitop} R package, and the MINT's worked out from the raw answers of the studies that have asked it, pulled from their repositories and scored the way `content/block_mint.js` scores them. It prints the two number lines and never the `interpretations` beside them, which are the app's own prose. Nothing on the page reaches for it, and R is not a dependency of anything that runs. |
| `README.md` | The author's own notes: the aim, an **Includes** list of everything the test currently asks, and a long list of questionnaire ideas that are *not* in it. Not documentation, but the Includes list has to be true — see the convention below. |

**The seam.** `app.js` builds an `engine` object — the run, the scores, and the
two pieces of chrome (`showScreen`, `burst`) a result arrives with — and hands
it to `makeResults()`. That object is the whole of what crosses between them,
in one direction: `results.js` never reaches back for anything else, and
nothing in it walks the run or writes to `responses` (it reads two answers
as given — the birth month and the cusp half, for the star sign — through
`engine.answer`, which is read-only). (It does read
`QUESTIONNAIRES` — a `content/` global, for norms and section names — which is
shared ground rather than app.js state, so it crosses no seam to get there.)
Adding to the seam means adding to that object literal, so keep it small.

**The second seam** runs from `results.js` down into `js/figures/`: `shared`,
one object literal in `makeResults`, is the whole of what a figure file may
reach — the scores and norms readers, the tease, the votes, the tooltip, the
figure holder — and each figure hands back a small object of what
`renderResults` and `feedbackKeys` need. It is a bag of a dozen or so members,
which is more than the engine seam carries, and that is accepted because the
alternative was one file of three thousand lines: a figure is read and edited
on its own, and the bag is the price of that. Add to `shared` only what
several figures want; a helper one figure alone needs lives in its file.

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
while the rest move around it. A whole questionnaire may be written
`shuffle: false` too, and one is: the PI-18 on level 6 was validated in a fixed
order and is asked in it. That is the exception rather than the shape of the
thing — a scale whose own validation says nothing about order should shuffle,
which is the default and what everything else does.

The whole of the run's order follows from that one rule, and answers most
questions about it before they are asked. Two instruments meant to be asked in
among each other go in **one** questionnaire, because being one questionnaire
is what makes them one shuffled run — which is why the ten single-item
scales of the `singles` block are one questionnaire rather than ten, and why
the FIPI beside them stays a run of five that nothing is ever dealt into. Two
meant to stay apart go in two. And a briefing, being an entry of the block
rather than of any questionnaire, can never be crossed by anything.

**What is asked, and where.** Eight levels, seven of them scored, out of fourteen
blocks (the `hexaco` block holds the HEXACO with the KSE-G dealt into it,
and the commented-out Mini-IPIP6 and BSDS) — so this table is the map of `content/timeline.js` and of the folder
around it at once:

| | |
|---|---|
| Level 1 | `demographics1` (age, month of birth and — branching off the month — which side of that month's zodiac cusp the day fell, one `BirthDay` item wording itself from the month; gender and what branches off it), `fipi` (the briefing that opens the whole test, then the five items) and `singles` → General. `fipi` is read back as **two old theories and nothing else**: the star sign and the temperament side by side (see **Two old theories**, below), no rows. Extraversion and Emotional Stability keep their norms because the temperament is read off them; the other three are commented out, since the HEXACO on level 5 draws the same ground in full — so it is out of `CHARTS` (a spider wants three axes) and off the whole-run web (`profile: false`) |
| Level 2 | `demographics2` (education, discipline, student, ethnicity, country), `mint` (a briefing, then the items) → Interoception |
| Level 3 | `bait` — a briefing, the AI knowledge, technical-understanding and usage singles (the 2.1B Expertise trio, which asked the same three things among the shuffled statements, is gone; the understanding single carries a key of its own, `BAIT_Understanding`, so it cannot stack onto the old `BAIT_UnderstandingAI` it replaces), then the shuffled BAIT statements (the union of the 2.1B and 2.2 administrations, under the harmonised item names of the pooled validation, plus its attention check). Scored as the BAIT-8 — AI Realism, AI Enthusiasm, AI Apprehension — and read back as one of three archetypes (see below) |
| Level 4 | `demographics3` (household financial comfort, MacArthur subjective social status), then `mood` and `health` in a random order, then `hitop`. `mood` is a briefing, then `phq4` and `sleep` (the SQS single, asked and scored but shown nowhere; the CDS-2, and the PCL-2 that was the Stress dimension until September 2026, sit commented out in the same file) and `health` is a briefing, then the list of psychiatric diagnoses and treatments (`psychiatric`, asked and saved but scored and fed back nowhere; the SSS-8 and the somatic medical history sit commented out in the same file). Then `hitop`: a briefing (widening from the last few weeks to the last year, and saying what follows is asked as spectra rather than categories) and the HiTOP-BR (`hitopbr`), 45 statements about the last twelve months on a 4-point scale, scored as six spectra. `phq4` and `hitopbr` are read back together as **the climb** (see below), the level's one section — three of the spectra and the PHQ-4's fortnight drawn into one hill; the other three spectra, sleep and self-rated health are fed back nowhere. (It had a spider chart with a row per spectrum once, dropped as reading like verdicts, and the level was then two faces, Mood and Health, until the climb.) **The spectra carry plainer names than the HiTOP's own** — Bodily Complaints, Emotional Intensity, Unusual Experiences, Solitude, Impulsivity, Dominance, for Somatoform, Internalizing, Thought Disorder, Detachment, Disinhibition, Antagonism — one for one, so nothing about the scoring changes; the mapping is written above the norms in the block file. The one questionnaire whose norms are **not** invented — they are the development-sample means and SDs of Simms et al. (2026) — kept for analysis, and written `profile: false` too, so the six stay off the whole-run web. Item keys are the package's item numbers under the app's prefix (`HITOP_01`…`HITOP_45`, since September 2026; `HBR_nn` before), so a saved file scores with `score_hitopbr()` once the columns are renamed `HBR_nn`. It lived in `block_hexaco.js` — then `block_personality.js` — until September 2026 |
| Level 5 | `hexaco` → Character: a briefing, then the HEX-ACO-18 (`hexaco18`, 18 items, the HEXACO on its own 5-point scale, named "Character" on screen). **Read back in full**, as a spider chart with a row per domain, and its six domains take axes on the whole-run web. The domains carry **plain names** — Honesty-Humility and Emotionality as published, then Sociability, Patience, Diligence and Curiosity for eXtraversion, Agreeableness, Conscientiousness and Openness — because a dimension is one name across the run and the FIPI has the Big Five words on level 1, and because the HEXACO's constructs are not the Big Five's anyway (its Agreeableness is patience and forgiveness); the mapping is written above the questionnaire in the block file, and the item keys still name the facet. The Mini-IPIP6 (`ipip6`) sits commented out in the same file, dropped for the HEXACO. **Dealt in among the HEXACO's items is the KSE-G** (`KSEG_Positive1`…`KSEG_Negative3`), six social-desirability statements — three exaggerating positive qualities, three minimising negative ones — there to blend in, which is why they are items of that questionnaire rather than a questionnaire of their own. They carry **no `dimension`** (September 2026; they were two, which the engine averaged for nobody): nothing reads a score off them, the total is taken at analysis time with the Negative three reversed, and one handed back would only teach the next answer. The BSDS sits commented out beside them, one of its items being the KSE-G's almost word for word |
| Level 6 | `primals` — a briefing, then two questionnaires asked back to back on one scale: the **PI-18** (`pi18`, Clifton & Yaden, 2021), the validated short form of the 99-item Primals Inventory — eighteen statements about the character of the world on its own 0-5 agreement scale, seven reverse-keyed, **written in the fixed order the short form was validated in** (`shuffle: false`, the only questionnaire in the app that holds its own order), read back as **the sea** (see below) and nothing else — no rows, no standings, one vote on the picture; and the five **tertiary primals that cluster under none of those three** (`primals_tertiary` — Acceptable, Changing, Hierarchical, Interconnected, Understandable), 22 items taken whole from the PI-99, which is what the inventory's own instructions recommend for reaching them. The two are separate questionnaires because they are two instruments asked two ways, and because the broader primals are meant to precede the narrower ones. The inventory's headline primal, overall **Good** world belief, is *not* a fourth set of items but a composite of the PI-18's own (all six Safe, all seven Enticing, `PI_Alive_1` and `PI_Alive_4`) — an item here carries one dimension, so rather than ask anything twice or teach the engine a second way to score, Good is left to analysis time: the keys name the primal and count within it (`PI_Safe_1`) with Clifton's own label beside each in the block file, so his published code computes it from a saved file after one rename (the keys were his labels, `PI18_ed1` then `PI_ed1`, until September 2026). Safe, Enticing and Alive take axes on the whole-run web; the five neutral primals are written **both** `profile: false` and `results: false`, so they are asked, scored and saved and fed back nowhere — five percentile rows under the sea would be a second, plainer answer to the question the picture has just answered. The level is therefore one section, and `markLone` hides its name |
| Level 7 | `archetypes` — a briefing, then the **Open Source Archetype Indicator – Pearson-Marr (OSAI-PM)**: twelve three-item scales after Pearson and Marr's twelve-archetype framework (Idealist, Sage, Seeker, Revolutionary, Magician, Warrior, Realist, Jester, Lover, Creator, Ruler, Caregiver), an open paraphrase written from public descriptions of the framework rather than from the PMAI's items, to be validated independently of it. The only scored questionnaire in the app **written without norms on purpose**, and the only one fed back anyway: read back as a wheel (see below) |
| Level 8 | `closing` — nothing scored in it, so it opens no results |
| — | `gjs` sits in `content/block_UNUSED.js`, named on no level, so it is never asked; the `somatic` medical-history questionnaire sits commented out in `content/block_health.js` |

The demographics of a level are written `shuffle: false` and come first in it;
everything else on that level is shuffled in behind them. A follow-up to an
answer (`…Other`, `GenderIdentity`) is written directly after the item it
branches from. The one-item scales of the `singles` block — narcissism, health,
stress, self-esteem, self-concept clarity, search for meaning, self-efficacy,
life satisfaction and the two self-placements — are written as one `singles`
questionnaire and not as ten,
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

**A question may word itself from an earlier answer.** `text`, on the item or
on any one of its options, may be a **function** of the answers rather than a
string: it is handed a read-only `answer(key)` and returns the words. `worded()`
in `app.js` is the one place either kind is read — the question on screen, a
briefing's body, an option button's label, and `said()`, which is what puts the
words in the saved file — so a function and a string are interchangeable
everywhere and nothing else in the engine knows the difference. It exists so
that one item can be asked several ways without being several items with several
keys: `BirthDay` asks which part of the month somebody was born in, and the two
halves it offers are that month's own zodiac cusp, read out of `BirthMonth`. An
item worded from an answer should carry the `showIf` that waits on it, so it can
never be drawn before the answer it words itself from is there. Wording a
question is not answering one — the accessor only reads.

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
it rather than through it. Nine are asked, one at the head of each of the
`fipi` block (warning that the questions get stranger further down — the frame
for the whole run rather than for the five items alone, which is why the two
are one block), the `mint`
block (turning from questions about you to questions about your body), the
`bait` block (turning from you to what you make of AI), the
`mood` and `health` blocks (each turning from you in general to the last few
weeks), the `hitop` block (widening from the last
few weeks to the last year, and saying that
what follows is asked as spectra rather than as categories), the `hexaco` block
(turning from the five strokes of level 1 to a
fuller drawing of the same traits), the `primals`
block (turning from the person to the world the person takes themselves to be
living in), and the
`archetypes` block (the last of them, turning to the self as a story).

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
questionnaire's dimensions — no section either. A questionnaire written `results: false` in `content/` (the sleep single, the five neutral primals) is left out whole, norms and all: the norms stay for analysis, and nothing on its level reads them back. It is still asked, still
scored and still saved; there is simply nothing to place it against, and a bare
number tells the person who gave it less than silence does. Writing the norms
is how a scale earns its way into the feedback, which is why the `singles`
items are asked and read back to nobody — not in a level's results, and not on
the whole-run profile web either, which carries only what a level names (see
**The profile**, below). The PHQ-4 is a different kind of
exception: Anxiety and Depression carry norms, so `dimensionsOf("phq4")` is
not empty, but neither ever earns a row — `total()` reads them as a *sum*
rather than `score()`'s average, drawn as the weather over the climb instead (see **The climb**, below). The twelve archetypes are the one outright exception,
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

**The climb.** The PHQ-4 and the HiTOP-BR read as one section rather than
two — "The Last Year" — and as a picture rather than rows (`renderClimb`,
`drawClimb`, in `js/figures/climb.js`): a figure in profile at the foot of a
hill, on the sea's pattern, with four things about the year drawn into the
scene. `CLIMB_OF` names the two questionnaires it stands in for;
`renderResults` renders it once, in place of whichever of them comes first in
`RUN`, and skips the other where it would otherwise fall — the one place in
`results.js` two questionnaires share a section. Their items and scoring are
untouched; only what is drawn from their names changes. Each channel does one
legible thing to the scene and nothing else, so the same hill is bent by four
numbers and never jumps:

| | |
|---|---|
| **Emotional Intensity** | how steep the hill is: a logistic ramp (`surface`) from a long gentle rise to a cliff face with a plateau above. The summit is always in frame and the dashed path always reaches it |
| **Solitude** | who is on the hill with you (`company`): three other walkers close by at the sociable end, fewer and further up the slope as the year was spent more alone, then none. The count steps at thresholds, since a walker cannot be two-thirds drawn; their distance moves continuously |
| **Bodily Complaints** | the pack on your back (`walker`): from a day bag to a heavy load, with the figure leaning into it |
| **Mood** | the weather (`sky`): the PHQ-4's *last two weeks*, not the year — more cloud, lower and greyer, and the sun going out, as the fortnight has weighed more. It is the one channel on a different clock, which is the point of having it there: the fortnight sits on the same picture as the year |

**Three of the four are standings, not reaches.** The sea drives its scene
from a reach along each scale, which works because the primals are spread
across theirs. The HiTOP-BR spectra pile up at their floor, so a reach would
draw nearly everybody the same gentle hill; the three year channels are
therefore the percentile against the development-sample norms (`standing`),
which are real, and the bars beside the hill say so ("where you stand among
the 780 people"). The weather is neither: it is the PHQ-4 total as a share of
the way to the top of its own bands (`MOOD_FULL`, 9, the foot of "severe"), so
a total of nought is a clear sky and nine or more is cloud on the hill, and no
invented norm is read. The PHQ-4's norms in `content/` are therefore read by
nothing; they stay because norms are what put a questionnaire on its level at
all. Those standings go through `percentile()`, the normal curve, which is
coarse for floor-skewed scales — the note at the foot of `norms/make_norms.R`
asks for empirical quantiles instead, and for the engine to learn to read them
(a `quantiles:` form beside `mean`/`sd`, preferred by `percentile()` when
present). **That is parked, not done.**

The section is a title ("Challenges"), the person's own hill at the width of
the card (`.climbview__stage`), then the four channels as a bar chart under it
(`bars`, `.climbview__bars`: a column apiece filled from the foot to the value
the scene is drawn from, named underneath, and explained in the shared tooltip
on hover or focus — the explanation lives there rather than on the page, so
the chart is four bars and four names), then a note saying what the four are
and that none of it is a diagnosis, the two ends under a line of their own
("Other people climb other hills": `EASY`, a gentle morning in company, and
`HARD`, a cliff in cloud climbed alone with a heavy pack), and one vote ("Does
this match how the last year felt?") filed under `CLIMB_KEY`, which is `Year`.
(It opened with the bars beside the hill, as a key, for a day.) Locked, the
title and the scene alone,
drawn from `teaseReach`, blurred like every teased figure. Like the sea, every
scattered thing is placed from one seeded generator (`seeded`, fed from the
four values), every gradient is addressed by an id off a counter (`count`),
and the one loop — the clouds drifting (`climb__cloud`) — is held at its first
frame under a seal. The framing does the ethical work: a steep hill is a hard
year, which happens to people, the figure is always upright and walking, and
the two ends make the picture one of a range rather than a judgement. Unusual
Experiences, Impulsivity and Dominance are deliberately not in it; nor are
sleep and self-rated health, though both are still asked and saved.

`faces.js` — Mood, Stress and Health as a row of faces, the section this
replaced — is still on disk, with no tag in `index.html`, and its header says
what wiring would bring it back.

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
exactly as the norms are, flagged as such. `feedback.AIArchetype` is still
where the agree/disagree is filed — the key is unchanged so that answers
collected either way stack. The BAIT's three dimensions earn no rows — the
archetype is the whole of the section — and take no axes on the whole-run
profile web or card either: the archetype is how they are read back, and the
web carries only what a level names. Locked, the figure keeps its
shape: a stand-in name, a 00% share, all blurred, and no live buttons.

**The sea.** The PI-18 is not three lengths on a web: it is a place
(`drawSea`, `SEA = "pi18"`). Primals are beliefs about the world rather than
about the person, and every other figure in `results.js` draws a person — a
body, faces, a robot, a wheel of selves — so what reads as new is a figure that
draws the world. The run is already a descent, so the world it draws is the
bottom of it: black water, a torch in the viewer's own hand pointed into the
distance, and whatever falls inside the round disc it throws (`TORCH_X`,
`TORCH_Y`, `TORCH_RX`, `TORCH_RY`; it was a cone from the foot of the frame
until September 2026). Everything outside the disc is what you cannot see,
which is most of it. Each dimension takes a channel of the one scene, and the
three are chosen to be read independently rather than to add up:

| | |
|---|---|
| **Safe** | what is down there with you. At the safe end the creatures are round, blunt, wide-eyed and smiling; every step towards danger bends the same creature — stretches it lean, cuts the mouth back into a jaw and puts teeth in it, forks the tail, stands spines up where the round fin was, narrows the eye to a pale slit and opens smaller ones behind it, trails feelers off the underside — until it is less a fish than something out of the deep. Safe does nothing else to the scene: there used to be a second, thresholded figure (a silhouette too big to be lit, holding still in the dark, `seaLurker`), taken out in September 2026 so that the whole of the channel is the one creature |
| **Enticing** | how much colour is in any of it — the creatures, the rock, the coral. At the dull end the same scene is grey stone and grey fish. It is the one channel that still has something to say when there is nothing alive in the picture, which is why the rock and the coral carry it too |
| **Alive** | how much is living in the beam at all, from an empty floor to water thick with it |

Nothing switches over at a threshold: the same creature is bent by one number
(`creature`), so a scene never jumps from friendly to frightening between one
answer and the next.

**The scene is drawn three times over** (`renderSea`, in `js/figures/sea.js`):
the two on the outside are the floor and the ceiling of all three scales
(`FLOOR`, `CEILING`)
and the one in the middle, larger, is the person's own. It is the comparison
the whole instrument is about — the same abyss, two people seeing different
places — and it does the work a percentile bar cannot, which is why the extremes
are drawn rather than described. `FLOOR` holds Alive a little above its
floor on purpose: at nothing the panel is an empty room, and the whole of what
Safe does to a creature would then be shown to nobody but the people whose own
world is already a frightening one. Locked, only the middle panel is drawn, from
`teaseValue`, blurred like every other teased figure. `SEA_FLOOR`, `SEA_LINES`,
`seaCreature`, `seaCount` and the rest lost their `sea`/`SEA_` prefixes when the
figure moved into a file of its own, where the prefix said nothing.

**It is the whole of the section**, the way the MINT's body is: a title over
the picture ("This is how you see the world", `.seaview__head`, and nothing
else above the scene), the person's own abyss at the width of the card, a
sentence saying it was drawn from three dimensions worked out from the answers
(`.seaview__note`), and under that what the picture is made of — a key per
channel saying both what the dimension is and what it does to the scene
(`LINES`, each lit in a colour of the legend's own, which is no colour of
anything in the water), with **a bar under the name filled to the reach** the
scene is drawn from (`.seaview__bar`, the same `reach` number, so the bar
and the picture can never disagree) — then the two ends under a line of their
own ("Other people see other worlds"), and one question ("Do you agree with
this metaphor?"). Each piece arrives a beat after the one above it (`rise`,
staggered). There are no percentile rows and no interpretations here at all:
the bars are reaches along each scale, not standings against other people, and
a figure with a plainer restatement of itself underneath would be two answers
to one question, of which the picture is the better. So the three dimensions carry
norms that nothing on this level reads — the norms are still what puts the
section on the level (`dimensionsOf` is what decides that) and still what the
whole-run web draws them from, which is why they stay written in `content/`.

Because there are no rows there is **one vote rather than three**: the picture
is the prediction the section makes, so it takes a single agree/disagree
("Does this picture match how the world feels to you?") filed under `SEA_KEY`, which is `World`.
`feedbackKeys()` names it directly, the way it names the archetype's and the
wheel's, rather than deriving it from the dimensions.

Safe, Enticing and Alive **stay on the whole-run profile web** even so, which
is the one place the derived rule in `onProfile` wants reading twice: a
questionnaire read back as one figure is normally kept off it (the BAIT, the
twelve archetypes), but those two name no dimension anywhere the person can see
it, and the sea names all three under their own names in the lines under the
picture. Three normed axes are not crowding, and the web is where somebody sees
where they stand on them.

Three things worth knowing before editing it. Every scattered thing in it is
placed from one seeded generator (`seeded`, fed from the three scores), so the
same answers draw the same sea however often the panel is reopened — a
`Math.random()` in there would reshuffle the fish on every render. Every
gradient and filter is addressed by an id off a counter (`count`), since
three scenes share a page and a repeated id would have the second one painted
with the first one's water. And a channel is a **reach along its own scale**,
not a percentile: the same distinction the mood faces draw between `happy` and
the standing written beside it, and for the same reason. The water moves, a
little — creatures sway on the spot (`sea__drift`, a wrapper, since a CSS
transform on the creature would replace the attribute transform placing it),
motes drift, the torch breathes, coral leans — each to a beat and phase the
script writes in from the seeded generator, and these are the **one place a
results card loops**: `.result--sealed` holds them at their first frame until
the level opens, which is fine, since a still sea is what a sealed card should
show. The sway is a few pixels about the place the answers put a creature and
changes nothing the picture says.

**The wheel.** The twelve archetypes close their own level as neither rows nor
rings but a wheel (`renderWheel`, `drawWheel`): each takes a petal of the
circle, filled out from the middle as far along its own scale as the answers
put it, in its own colour, with whichever came out longest picked out in gold
and named underneath — the whole shape is the reading, and the longest petal is
the story loudest in you. `WHEEL_OF` names the questionnaire it stands in for,
`WHEEL` the twelve themselves (dimension, colour, reading) and `HELD`
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

**Two old theories.** The FIPI's section on level 1 is two readings older
than any questionnaire, side by side, and nothing else (`renderOldTheories`,
`OLD_THEORIES_OF = "fipi"`; like the MINT it takes no rows, and its section is
`.result--bare` — no card round the two cards). Two sentences introduce the
pair (`.theories__intro`): where the test starts, what the two predict, and
that finishing it is how to see whether either holds. Each card is a
heading naming what is being read — "Your star sign is", "Your temperament
is" — a figure, the name it comes out as, then "It predicts that you are…"
(`.theory__predicts`) over a few keywords and the ordinary agree/disagree
(`"Star Sign"`, `"Temperament"`). The heading says what the card *is* and the
line under the name says what it *predicts*, so what was read and what is
claimed off it are told apart on sight; a card with no words to give — a sign
that could be one of two — skips the predicts line with them. The **star sign** is read from the birth month and which side
of that month's cusp the day fell (`starSign`, from `BirthMonth` and
`BirthDay` through `engine.answer`), so it comes from the birthday and
from nothing the person said about themselves. `SIGNS` is the twelve in cusp
order from the sign January opens in (month *m*'s first part is `SIGNS[m-1]`,
its second `SIGNS[m % 12]`), each with the words astrology gives it and, in
`expects`, that stereotype written on the FIPI's five dimensions, so a later
level can check the stars against what was measured; **nothing reads `expects`
yet**. The **temperament** is Galen's four humours on the two axes Eysenck laid
them over — extraversion across, stability up — which are exactly the two FIPI
dimensions with norms (`TEMPERAMENT_ON`): each standing is the same percentile
a row reads, the side of the average it falls on names the quadrant
(`temperamentOf`: outgoing and steady is Sanguine, outgoing and reactive
Choleric, reserved and steady Phlegmatic, reserved and reactive Melancholic),
and `drawQuadrant` draws the plane with the person as a point in it. The two
votes side by side are the Barnum probe: one reading was written from the
answers, one from a birthday, and agreeing with the second as readily as the
first is the effect caught in the act. Votes go through `pickButtons`, the
general pick that `voteButtons` is now built on. Without the cusp half ("I'd
rather not say") the star card names the two signs it could be and predicts
nothing. Locked, the temperament is drawn from `teaseValue` and the star card
shows a stand-in sign, both blurred like every locked figure, with no buttons.
The keywords live in `results.js` beside `ARCHETYPES`, for the same reason
those do: they are how a figure is read back, not anything that was asked.
None of it is a norm, and none of it goes near the whole-run web.

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
the `.creed` (the Jung line, the first thing the scroll uncovers), the `.why` making the case for answering any of this — with, beside it, a
taste of the far end (`.why__show`: the figures the levels close on — the
whole-run web, the body, the climb's bar chart standing in for its hill, the
temperament plane standing in for the sea, and the wheel — one at a time in
one frame, cross-fading every `SHOWCASE_BEAT`, under one static caption,
"Examples of feedback"; `renderShowcase` in
`results.js` draws them from the same `teaseValue` a locked level uses, so
none is anybody's result, and `showcase()` in `app.js` cycles them while the
intro is up; they are shown in focus, without the standings and readings,
since a figure with nothing earned in it has nothing to hide) — and the
`.gate` holding the consent form. It is the only screen laid out full width —
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

**Results sections.** Each questionnaire's reading is a `.result` card:
`openSection()` writes its name across the top with a dot in the colour its
figure is drawn in (and writes that colour onto the card as `--chart`, so
anything in it without a colour of its own reads in it — the climb takes Emotional Intensity's, the archetype the BAIT's, the wheel falls back to gold), then
the figure, then a `.row` a dimension: `rowHead()` puts the dimension's name and
where it stands ("Higher than **84%** of people", a tag in its colour) on one
line, the percentile bar under it draws itself out from the left, and the
prediction and its Agree / Disagree — two halves of one pill — follow (`rows`,
which draws the locked and the open version of a row from one function). Rows
are parted by hairlines rather than air. A locked level's `.taste` note
carries a meter of how far through the level is.

**Finishing a level.** `completeLevel()` never simply prints the results. It
renders them, seals them (`sealSections`), and calls `curtain()`: water breaks
across the middle of the window carrying "Level N complete" — a band, not the
whole screen, so the level screen is swapped in behind it as it crosses
(`CURTAIN_COVER`) and is already there when it runs off.
`openSections()` then breaks one results section open at a time — scrolling it into
view, unblurring it, throwing a spray of gold out of the middle of it — and the
way on (`.level__foot`, at the *bottom* of everything the level opened) arrives
last. **Everything animated inside a sealed card is held at its first frame**
(`.result--sealed * { animation-play-state: paused }`), so the bars drawing
themselves, the points popping in and the shape fading up are seen happening
when the seal comes off rather than found already done; in a panel, where
nothing is sealed, they run on render. A click anywhere opens the rest at once; that listener is registered a
beat late on purpose, or the click that waved the paint past would be caught on
its way up and skip what it just uncovered. `prefers-reduced-motion` skips the
staging entirely.

**The taste of the next level.** The way on carries, above its button, a
blurred preview of the level it leads to (`renderTeaser`, into `#level-next`):
"Next" large, "Level 2 · Interoception" small under it, and the figures that
level will open — the same locked rendering a stop's panel shows, drawn from
`teaseValue`, with the `.rows`, the `.taste` note and the panel's "Locked"
badge taken out afterwards, and in their place one badge over the middle of
each figure saying how many answers still stand between here and it ("37 more
answers to unlock"). A blurred figure is the hook; ten blurred rows under it
only look like a page that failed to load, so a questionnaire with no figure of
its own would be an empty card and is dropped (none is, now that the FIPI has
the two old theories; the check stays for the next one written rows-only). It
lives in `.level__foot` and not in `#level-results` on purpose: nothing seals
it, sprays it open or counts it as won — it arrives with the button, as part of
the way on. `completeLevel` finds the next *scored* level, so the last of them
is followed by nothing here and the holder is hidden. Everything that keeps a
locked panel honest keeps this honest too: no tooltip on a teased point, no
pointer events in the body, the count where a number would be.

**A lone section goes unnamed.** `markLone()` runs at the end of
`renderResults` and of `renderTeaser`: when a level (or a teaser) holds one
`.result` only, it gets `.result--lone` and its name across the top is hidden,
since the level screen's `#level-name`, the panel's title and the teaser's
"Level N · Name" line have already said what it is. A level of two or more
sections keeps a name on each, because there the names are what tell them
apart. Every level is one section now (the HiTOP-BR's went in September 2026, the
five neutral primals in the same way soon after, and the PHQ-4 and HiTOP-BR
are one climb), so the rule is idle until a second one is written.

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
test and nothing else. Everything else the test carries with it is the
`.sidebar`, dressed as a **dive gauge** (`renderSidebar`): the readout of the
metres, laid over the top of the gauge to the right of the line rather than
above it, so the line starts at the banner's lower edge with no gap; the
descent running along the sidebar's left edge, the edge the page sits against,
graduated with a mark every kilometre (`.sidebar__line::before`, spaced by `--km`, which
`buildSidebar` writes from `DEEPEST` so the number lives in one place), then
the Profile / Data buttons at the foot, an inline SVG icon and a word each. The
line is divided **equally between the levels**, so a level's stop sits at the
same point on it however many items it holds: with two levels they are at 50%
and 100%, and what a long level buys is a slower stretch of water rather than
a longer piece of line. `descentShare()` is that mapping — each level
contributes its own share of the band it was given — and `.sidebar__fill` is
drawn from it, with a bead and a sounding ring beating out of it at the end.
A level with nothing scored in it takes no share at all, so the closing item
is asked at the bottom of the abyss rather than below it.

A level's stop (`.sidebar__level`) is a disc of glass lit from within in its
own colour (`--tint`, which `levelColour` reads off one gradient down the
gauge — cyan at the surface through blue and violet to red at the bottom, by
the level's position among the scored levels, `GAUGE_COLOURS`) with the number
on it, and
the ring round it is the level: `--share` (registered with `@property`, so the
ring *sweeps* rather than jumps) is how much of it is answered, drawn as a
conic band round the stop — in the level's colour while it is the one being
answered (`--current`, the first level not yet finished; a level still ahead
is the same disc dimmed), gold with a tick on the shoulder once it is earned
(`--unlocked`), haloed while its panel is open (`--open`). Hovering or
focusing one opens a **card** into the page (`.sidebar__level-card`, built once
by `buildSidebar`, its note kept by `renderSidebar`): the level's number and
name, the depth it is finished at, a meter of its share, and whether it can be
read yet. A stop is the only way into `openResults(level)`, finished or not. **The fill and the stops are placed by custom properties**,
`--reach` and `--at`, not by an edge: the stylesheet decides which axis they
run along. On a wide screen the gauge is down the right and they read as
heights; **below 760px the whole gauge lies along the foot of the screen**
(`--sidebar` is then its height), the same pieces in the same order turned to
run left to right, the cards opening upwards, the icons alone without their
words. `.overlay` stops short of it either way. Both banner and gauge are
hidden on the intro and card screens; `--banner` and `--sidebar` are their
sizes and the body is padded clear of both (with extra width for the stops,
which sit out over the line).

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
organ of the body, a face. Currently that is the six HEXACO domains, the three
MINT dimensions, and the PI-18's Safe, Enticing and Alive — twelve axes (Stress
was the thirteenth while the PCL-2 was asked). The rule is derived rather than listed
(`onProfile`): a dimension is on the web if it has norms, unless it belongs to a
questionnaire read back as one figure — the BAIT (the archetype), the twelve
archetypes (the wheel), and the PHQ-4 and HiTOP-BR (the climb) are left off;
and a
questionnaire written `profile: false` in `content/` (the FIPI, a two-row
sketch whose ground the HEXACO covers in full; the HiTOP-BR — six symptom
spectra on one polygon with Sociability and Bodily Awareness read as more of
the same kind of thing, which they are not; and the five neutral primals, for
the mirror of that reason — believing the world changeable or hierarchical is
not more or less of anything a person would want, and every other axis there
runs from less of something to more of it) keeps its dimensions off it however
many norms they carry. So a
scale that earns its norms takes an axis in the same breath, and a dimension
folded into a composite (Anxiety, Depression) or shown without norms of its
own (General Health, on a face) or nowhere (Sleep, Life Satisfaction) takes none. It used to carry all
thirty-odd, which was unreadable and only repeated the wheel; the crowding
code in `drawSpider` and `drawCard` went with them. The landing page's showcase web and the card are drawn from the same list.

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
into metres of the Challenger Deep, shown in the gauge's readout and under the
water that breaks on finishing a level. Finishing a level therefore always
lands on a round share of the deepest water there is — `levelDepth(level)` is
that figure, and `sounding()` writes it the way the gauge does: on the curtain,
in the results panel's subtitle (`#results-sub`, "Reached at…", or "Locked · n of m answered") and on
a stop's hover card. The level screen itself no longer carries it — the curtain
has just said it, and the screen is the level's name and what it opened. (The ocean's zone names — Sunlight, Twilight, Hadal — were
tried beside the metres and taken out as clutter; the depth says it.) It is a
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
(`key`, `order`, `response`, `timeOnset`, `timeResponse`) and `feedback` —
**every key of which is always written**, `null` until somebody votes on that
reading and `null` again if they unvote it, so a run that stopped at level 2 and
one that went to the end have the same shape and an analysis never has to guess
which columns to expect. The keys are `feedbackKeys()` in `results.js`, derived
the way `renderResults` decides what to draw, and `makeResults` writes them into
the object app.js hands it. `response` is
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

**Every scored level but the first carries one check**, shuffled in among the
items of one of its questionnaires — the MINT (level 2), the BAIT (3), the
HiTOP-BR (4), the HEXACO (5), the five tertiary primals (6) and the archetypes
(7) — and each is keyed by the
questionnaire's prefix with `_AttentionCheck` after it — the HiTOP-BR's is
`HITOP_AttentionCheck`, which no two-digit item pattern matches, so
`score_hitopbr()` cannot take it for an item once the columns are renamed. **The answer a check asks for is put away from where
a straightliner lands on that scale**: the HiTOP-BR is skewed to its floor, so
its check asks for "A lot"; the HEXACO's asks for "Strongly disagree", since
somebody agreeing their way down a personality questionnaire would pass one
written for the top; the archetypes' names a circle off either end (2). The
MINT's asks for the extreme left, which is 0 under either of its two writings
(the labels change, the values do not), and the BAIT's for the extreme right,
as published. The primals' is the one the inventory itself ships with, worded
as Clifton words it — it asks for "slightly disagree", which is off both ends
of the scale and off the agreeing side those items pull towards — and it sits
in the tertiary questionnaire rather than the PI-18, whose validated fixed
order is worth leaving intact. Level 1 has none: the `singles` would be its only host, and
nothing is dealt into the FIPI's run of five.

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
  behaviour is data-driven; `CHARTS`, `SOMA`, `SEA`, `CLIMB_OF`,
  `ARCHETYPE_OF` and `WHEEL_OF` are the only places that name a questionnaire,
  and new ones should be rare.
- Anything that reads a score goes in `results.js` — or, if it is one figure's
  own, in that figure's file under `js/figures/` — and anything that walks the
  run in `app.js`. If a change wants both, it probably wants a new member on
  the `engine` object rather than a second copy of the state — unless it reads
  *neither*, in which case it goes in `js/draw.js`, under all of them. A new
  figure is a new file there, a `<script>` tag before `results.js`, a
  `makeX(shared)` call in `makeResults`, and a branch in `renderResults` and
  `feedbackKeys`.
- Keep it dependency-free and buildless.
- One folder each for the questions (`content/`), the code (`js/`) and the look
  (`css/`). Nothing else belongs at the root but `index.html`, `assets/`, the
  notes, `literature/` — a git-ignored shelf of reference PDFs behind the
  ideas list in `README.md` — and `norms/`, a workbench of scripts that work
  out numbers to paste *into* `content/`. Neither is reached for by any part of
  the app: the page loads no R and no PDF, and the buildless rule is about what
  the browser needs, not about what the author may keep beside it.
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
  answer profiles the BAIT came nearest, on level 3. The twelve *archetypes*
  (`WHEEL_OF`, `renderWheel`, `WHEEL`) are the Pearson framework asked on level
  6, drawn as a wheel. They share nothing but the word — different questionnaire,
  different figure, different feedback key (`AIArchetype` against
  `Archetype`, and both keys are load-bearing, since the agree/disagree
  collected under them has to keep stacking).
- **Six feedback keys belong to no dimension.** `StarSign` and
  `Temperament` are the level-1 old-theories votes, `AIArchetype` the
  level-3 one, `Year` the level-4 vote on the climb, `World` the level-6 vote
  on the sea, and `Archetype` the level-7 one. All six are load-bearing: the
  feedback collected under them has to keep stacking. (Files from before the
  climb carry `Mood`, `Health` and, earlier, `Stress` instead of `Year`.)
  (An `"Old Theories"` forced choice between the two was built and taken
  out the same day, September 2026, as redundant with the two votes; a file
  from a test run that day may carry it.)
- **A vote is filed under a one-word key, not under the name on screen.**
  `pickButtons` puts every pick through `filed()`, which takes the spaces and
  punctuation out of the reading's name — "Bodily Awareness" is filed as
  `BodilyAwareness`, "AI Archetype" as `AIArchetype` — so that every key in
  the saved file, items and feedback alike, is one word. Files written before
  September 2026 carry the names with the spaces still in them.
- **Every demographic item is keyed `Demographics_…`** (September 2026):
  `Demographics_Age`, `Demographics_BirthMonth`, `Demographics_Gender`,
  `Demographics_Education`, `Demographics_Country`, `Demographics_MSSS_SocialStatus`
  and the rest, across all three demographics blocks, so a saved file sorts
  them together. The questionnaire keys stay `demographics1`…`3`. Files
  written before then carry the bare names (`Age`, `BirthMonth`, …) and want
  renaming at analysis time; the notes below use the bare names where they
  tell the older story.
- **`BirthDay` words itself from the month.** One item and one key, whose
  question and two option labels are functions rather than strings, so the
  split falls on that month's own zodiac cusp ("1st to 18th" / "19th to 29th"
  in February, "1st to 22nd" / "23rd to 31st" in July). It was twelve keys,
  `DayBirth_1`…`DayBirth_12`, one per month, until September 2026, and the
  month was `MonthBirth` — a file from before then has one of the twelve
  filled and eleven null, under the old names, and wants coalescing and
  renaming at analysis time. The sign is read from month and half together,
  never from a day, which is not asked, on purpose.
- **"Block" also means two things.** A *block* is one file of questions in
  `content/`, named in the timeline. A *results* block is a `.result` section,
  above. The first is in `content/` and `app.js`, the second in `results.js`.
- **The wheel's scales are three items each, not two.** `leading()` still
  returns every archetype tied for the top, but three-item means tie less
  often than two-item ones did, so the "even wheel" case is rarer than the
  comment in `results.js` was written for.
- **A dimension is one name across the whole run.** `dimensions` in `app.js`
  is keyed by name alone, so two questionnaires writing `dimension:
  "Extraversion"` are averaged into one score, on whatever mix of scales they
  came in, and `normOf` reads the first one's norms for both. That is why the
  HEX-ACO-18 domains carry plain names of their own (Sociability, Patience,
  Diligence, Curiosity) rather than the FIPI's, and the commented-out
  Mini-IPIP6's carry "(IPIP)": the FIPI had the Big Five words first. A new instrument on ground already covered wants
  a tag of its own.
- **A new file needs a `<script>` or `<link>` tag in `index.html`, in the right
  place.** There are no modules and nothing imports anything: each file adds to
  the globals the next one reads. A block file loaded before
  `content/timeline.js` throws on a `defineBlock` that is not there yet, and
  `js/app.js` has to be last of the scripts. A block with no tag does not exist;
  a block with a tag but no name in `TIMELINE` exists and is never asked, which
  is the difference between forgetting one and leaving one out.
- **All `norms` in `content/` are invented placeholders**, flagged as such in
  comments, **with two exceptions**, and both are the output of
  `norms/make_norms.R` — which is where they should be re-read from rather than
  retyped. The HiTOP-BR's in `content/block_hitop.js` are the
  development-sample means and SDs printed in Table 1 of Simms et al. (2026),
  by way of the {hitop} R package — a development sample, not a norming one,
  and skewed towards its floor, which the comment beside them says; the script
  stops rather than guess if the package renames a scale, since the six carry
  plain names in `content/` and the mapping lives in both files at once. The
  MINT's in `content/block_mint.js` are the pooled answers of 1,683 people
  across the four studies that have asked those 33 items (September 2026) —
  a convenience sample of online studies rather than a population, which the
  comment beside them says too. Never
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
  "Continue the test" is pressed. Without both, the next item — including the
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
  first-written-on-top (a labelled scale stacked in one column: the `mood`
  block's default format, which only the commented-out CDS-2 and PCL-2 would
  take, and the commented-out SSS-8 in `health`; the PHQ-4 and the HiTOP-BR
  stood on end until September 2026 and are now one row each, `columns` equal
  to their option count, which `renderChoice` reads as a Likert row and
  centres — `.options--row`). The options are still *written* weakest-first — the keyboard,
  `said()` and the saved file all read them in that order regardless — only
  `.scale--vertical`'s CSS turns the row upside down visually
  (`flex-direction: column-reverse`). `.scale--circles.scale--vertical` keeps
  the narrow column the ladder metaphor wants, and draws the ladder — a rail
  either side of the column and a stub of rung out of each circle, all
  pseudo-elements, so the markup is the same row of buttons; a labelled
  vertical scale keeps the full width its buttons are otherwise given.
- **`draw()`, `mix()` and `SVG` are `js/draw.js`, not either file that uses
  them.** They used to exist twice, once in `app.js` and once in
  `results.js`, with a note here saying to keep the two copies identical: the
  seam runs one way, so neither file can borrow the other's. The way out was
  neither — a third file *below both*, which is what `js/draw.js` is. It works
  only because those helpers read no state; anything that reads the run still
  belongs in `app.js` and anything that reads a score in `results.js` or a
  figure file. (The figure files *are* handed a bag of a dozen shared members,
  `shared` — see **The second seam** — which was accepted in September 2026 as
  the price of not having one three-thousand-line file. `draw.js` is not that
  kind of file and should not grow into one.)
- **`drawSpider`/`drawSoma` add their classes rather than setting them.** The
  same `<svg>` is found again by a class of its own (`.profile__web`), so
  writing `class` outright makes the second render of a profile throw.
- **`.bar` in `results.css` is the percentile bar** under a results row. The
  gauge down the right (or along the foot) is `.sidebar__*` — including the
  level stops on it, which are `.sidebar__level*` rather than a block of their
  own, since `.level` is already the level *screen* in `results.css`. Naming
  anything in `style.css` `.bar` again puts a fixed, full-height panel behind
  every score in the results.
- **The gauge is laid out twice, once per axis.** Anything positioned on the
  line — the fill, a stop, its label, the bead — has a rule in the base sheet
  for running downwards and another under `@media (max-width: 760px)` for
  running rightwards, and the script only ever writes `--reach` and `--at`.
  Setting `top`, `height` or `left` on one of them from `app.js` would pin it
  to one axis and break the other.
- **`.result--sealed *` pauses every animation in a sealed card**, on purpose.
  A looping animation put inside a results card is therefore frozen until the
  level opens — which is fine for anything that runs once on arrival, and for
  the sea's sway, drift and lean (`sea__*` in `results.css`), the one loop a
  card carries: a still sea behind a seal is what is wanted.
