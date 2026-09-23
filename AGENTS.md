# AGENTS.md

The one set of notes on this project. `CLAUDE.md` is a pointer to this file, not
a second copy — write here and nowhere else, or the two will drift.

Single-page survey app. No build, no dependencies, no framework, no tests.
`index.html` loads the content first (`content/timeline.js`, then a
`content/block_*.js` per block of questions), then `js/draw.js` (stateless
drawing helpers everything below it uses), then `js/snapshot.js` (a piece of
the page turned into a picture), then `js/figures/*.js` (one file
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
| `content/timeline.js` | **The frame the rest of `content/` is written into, and what is asked when.** Also `BATTERIES`, the named subsets a study may ask instead of the whole, and `HELD_TOGETHER`, the blocks that come and go as one (see **Batteries**). `TIMELINE` is one entry per level, in order, naming that level's blocks — moving a block is moving its name from one line to another, and a block named nowhere here is never asked. Each level also carries a `key` and a `name`: the key is what the saved file is written under (`ratings`, `qualityControl`) and never changes for the sake of the person reading it, the name is what the gauge's hover card, the results panel and the level screen call it (`levelName`, `levelTitle` in `app.js`) and is prose that may — and may carry `fork: true`, shared with the other levels the person puts in order (see **The fork**). A run of levels wrapped in `shuffle()` is asked in an order drawn for them instead (see **The drawn order**), which is why `TIMELINE` ends `.flat()`. Also `shuffle()` itself, which **draws nothing outside a browser** and hands the written order back — `data/synthetic/codebook.js` and `docs/build_slides.py` read this file too, and what they describe is what is asked rather than one draw of it. Also `WATER_SHARE`, the share of the scored levels that are in the water rather than in the rock (see **Beneath the floor**) — where the seabed falls is a share and not a flag on any level. Its colour on the gauge is not content — the stops run through one gradient by position (`levelColour`). Also `defineBlock()` and the `QUESTIONNAIRES` / `BLOCKS` the block files fill, `answerKey()` (the hash an item with a right answer carries in place of it — see **Right answers**, below), and, at the head of the file, an annotated skeleton of every field a block may carry. **Read that before editing anything in `content/`**; it says what the fields are, and this file says why. |
| `content/block_*.js` | Every question, scale, colour and norm, **split by block** — one stretch of the run that moves as a piece — so the file to open is the thing being changed rather than the position it happens to be asked in. **Content changes go here and nowhere else.** Each is one `defineBlock("name", [ … ])` over an ordered list of entries: briefings and questionnaires, each carrying its own `key`. |
| `content/block_UNUSED.js` | Questionnaires written but not asked, commented out, waiting on whatever they want before they can go in. Nothing in it defines a block, so nothing in it can be reached. |
| `js/draw.js` | Three helpers that draw rather than decide — `SVG`, `draw()` (an SVG element with its attributes on it) and `mix()` (a colour between two others, reading either a `#rrggbb` out of `content/` or its own `rgb(…)` back, so a tint can be darkened in a second pass; `channelsOf()` is the reader, and the fourth name it takes) — held in common by the two files below it. It reads nothing and keeps nothing, which is the whole reason it can sit under both of them; **nothing else belongs in it**, and a helper only moves down here because `app.js` and `results.js` both want it. Not an IIFE: it takes those names in the globals every file on the page shares, so nothing in `content/` may take them too. |
| `js/snapshot.js` | **A piece of the page turned into a picture**, which is how a level's results are copied as an image (see **Sharing a level**). One global, `snapshot(element, {skip, ratio})`, resolving to a canvas: the element is cloned with every style it is drawn with written onto the clone as computed, the clone goes in an SVG `<foreignObject>`, and the SVG is drawn onto a canvas. It reads nothing of the run and keeps nothing, like `draw.js`, but is not in it, since only `results.js` wants it. **What it has to get right, each learnt the hard way on 23 September 2026**: defaults are read on a blank iframe of its own, since this page's stylesheet reaches any box on it (`* { box-sizing: border-box }` passed for a default, was never copied, and every padded card came out wider than its column); a property is written unless it equals both the tag's default and the parent's value, which keeps an inherited value from being dropped; anything still arriving is `finish()`ed first, or a section mid-fade is copied blank; the size is the layout box (`offsetWidth`), not the bounding one, which a panel still growing out of its badge has scaled; the height is measured on the clone in that iframe, since a margin that collapsed out of the element on the page stays inside the picture; what is skipped is hidden on the page for the moment of copying so the rest closes up over it; one-line text is held to one line (it is drawn a hair wider in an image); and an **auto margin**, which Chrome reports on a grid item as `0px`, is recovered by asking the page's rules — only those that set a margin to `auto` — whether they match. Pseudo-elements are written as rules against a class made for each; an `<img>` or `<canvas>` becomes a data URL. |
| `js/app.js` | The engine, one IIFE, in labelled sections: build the run → branching → scoring → rendering an item → the rail → panels → particles → finishing a level → flow → results → the way in → wiring. |
| `js/results.js` | `makeResults(engine)`, a factory returning the handful of functions `app.js` calls. What every figure has in common — reading a score against its norm (`dimensionsOf`, `normOf`, `reachOf`, `standFrom`, `teaseValue`), the tooltip, the votes (`pickButtons`, `voteButtons`, `filed`), the holder a figure sits in (`figureHolder`) — then the spider chart, the results sections and their rows (`renderResults`, `renderTeaser`), the staged opening of a finished level, the profile and the card, the
showcase of stand-in figures the landing page cycles (`renderShowcase`), and
`renderBadge(level)`, which crops one figure to a square for the shelf (see
**The shelf**). Reads scores; records nothing but the agree/disagree `feedback` on a prediction and the stars a level's results are given (`starRating`, see **What the level was worth**) — and, at the moment it is built, the full set of keys that feedback can be filed under (`feedbackKeys`). |
| `js/figures/*.js` | **The figures a level closes on, one file each**, every one a factory `makeX(shared)` called from `makeResults` and handed `shared` — the helpers above and nothing else — and returning what `renderResults` needs to place it: the questionnaire it stands in for, its feedback key, and its render function. Two of them also return a `badge()`, being the two whose section is not a drawing there is anything to crop (see **The shelf**). `soma.js` (the MINT's body), `climb.js` (the last year as a hill), `theories.js` (the star sign and the temperament), `archetype.js` (the AI archetype), `wheel.js` (the twelve archetypes), `sea.js` (the world), `reasoning.js` (the four kinds of reasoning as a compass), `heads.js` (Mind & Heart as four bars under a bulb and a heart), `stance.js` (Where You Stand as a plane and four spectra); `faces.js` (Mood & Health as faces) is on disk but has no tag and is not loaded. A figure reads scores only through `shared`; nothing in `content/`, `app.js` or another figure file is reachable from one, and the data a figure is read with (the twelve signs, the three archetypes, the wheel's colours and readings) lives in its own file, since it is how the figure is drawn and not anything asked. |
| `css/style.css` | The shell: tokens on `:root`, the water, the banner, the sidebar the descent runs down (a dive gauge — down the right on a wide screen, along the foot on a phone) and the shelf the badges collect on (down the left, along the top under the banner on a phone), screens, panels, buttons, the survey, particles. Also the animations the other two sheets share (`fade`, `rise`). |
| `css/intro.css` | The landing screen only: hero, the case for doing this and the Jung line under it, consent form, and the Nietzsche quote on the way in. |
| `css/results.css` | The water that breaks on a finished level, the level screen, results sections, charts, the interoception body, bars, the profile, card. |
| `js/vendor/datapipe-client.js` | **The one file on the page that is not ours**: DataPipe's client, pinned and kept here rather than fetched from a CDN, which is how the answers go out — as they are given and again whole at the end. Nothing reads it at load; `app.js` asks for it by name (`window.DataPipe`) when the test begins, and does without it if it is not there. See **Where it goes**, which says what it does, why it is vendored, which version this is and how to update it. Nothing else belongs in `vendor/`, and nothing of ours does. |
| `index.html` | Static skeleton, and the load order above. Screens and panels are markup; everything inside them is filled in by the scripts via `$(id)`. The favicon is an inline SVG data URI in the head — three waves going down, in the descent's three colours. |
| `assets/` | The logos on the hero and the consent form, referenced from `index.html`, and `assets/icar/` — the pictures of the reasoning level's matrix and rotation items, a problem and its candidates apiece, cut out of the eight published figures by `assets/icar/source/cut.py` (which sits beside the figures it cuts, and is run by hand when they change), referenced from `content/block_icar.js` as `<img>` in the items' own `text` and as `image:` on their options, which is the one place a script reaches for a file. No stylesheet does. |
| `data/norms/` | A workbench, not part of the page: `make_norms.R` prints, ready to paste, every set of norms in the app that is *not* invented. Two sections, independent of each other so that a missing package or a dropped connection costs you one and not both — the HiTOP-BR's development-sample means and SDs out of the {hitop} R package, and the MINT's worked out from the raw answers of the studies that have asked it, pulled from their repositories and scored the way `content/block_mint.js` scores them. It prints the two number lines and never the `interpretations` beside them, which are the app's own prose. Nothing on the page reaches for it, and R is not a dependency of anything that runs. |
| `data/synthetic/` | A second workbench, not part of the page: runs of the test answered by Claude in a sampled persona, written in the exact shape `container()` saves so that an analysis reads them with the same code as a real run. `codebook.js` (bun or node) reads every item out of `content/` the way `app.js` flattens it, so the requests cannot drift from what is asked; `synthesize.py` samples the demographics from the items' own options, has the model write a biography and answer the rest under a JSON schema of the items' own values, passes the attention checks, prunes closed branches, and writes `out/synthetic-<code>.json` — participant code prefixed `synthetic-`, a `synthetic` field naming model, batch, seed and biography, null times, null votes, null stars (`ratings`, one key per level screen). `work/` and `out/` are git-ignored. Its `FIGURE_VOTES` mirrors `feedbackKeys()` in `results.js` and has to move with it (the two `heads.js` keys went in under all three of level 9's questionnaires, September 2026). It writes `battery` (null), `source` (`"Synthetic"`), `levels` and `questionnaires` (the whole timeline, written order) the way `container()` does, and splices a `Level_<N>` item into `items[]` after each scored level, answered with the way on that level offers — every fork choice taken as recommended (`screens`, `walked`; `codebook.js` works `beneath` out from `WATER_SHARE` the way `waterLevels` does, for the floor's wording — the one rule this workbench restates rather than reads) — so a synthetic file reads with the same code. Never sent to DataPipe, never pooled with participants; its `README.md` says why. |
| `data/collected/` | **A third workbench, and the way the answers come back**, in two steps: `download.py` fetches, `preprocess.R` makes tables of what it fetched. Both folders it writes, `raw/` and `clean/`, are git-ignored because they hold **real participant data that must never be committed**. **`preprocess.R`** ({jsonlite} and base R, the way `data/norms/make_norms.R` is) reads `raw/` and writes `clean/`: **`data.csv`, one row a participant and everything in it, and nothing else at all** — **a master file**, 719 columns: the run (participant, file, completed, version, testMode, synthetic, battery, source, formatMint, timeStart), the two sequence columns, a `Feedback_<reading>` apiece, a `Rating_<level key>` apiece, four `QC_<level key>_*` apiece (`RT_Mean`, `RT_SD`, `ChecksFailed`, `TimeFinished`), a column per item holding the words that were on screen, and an `<item>_RT` beside each one (a suffix, so an item and its time sort together). **One naming rule across it, and it is `content/`'s own**: what the run says about itself is lowercase (`participant`, `time_start`) and everything that is a *measure* is `Prefix_Subject_Field`, the prefix an acronym in capitals or a word in PascalCase exactly as an item key is written — so `QC_Character_RT_Mean` and `Feedback_BodilyAwareness` sit beside `HEXACO_Sincerity` under one convention and a measure can be told from a run field on sight. Times are milliseconds throughout and no column name says so. Nothing is left out to keep it narrow — an analysis selects from it rather than coming back for a second file, and width costs nothing to anything that is not Excel — and **nothing is worked out that the file does not already say**: no mean reaction time, no share of an instrument completed, no count of failed checks, no item counts, no minutes taken. Each is a line of R over the columns that are there, and which of them an analysis wants is the analysis's business; this reshapes rather than computes, and a file that counts things for you is a file whose counting has to be checked. (It was seven tables until 22 September 2026, and carried its own counts and shares for a few hours after that.) **`NA` is not the empty string in it**: an item never put on screen is NA, an optional item shown and deliberately left blank is `""`, and the saved file has always told those apart — writing NA as empty, which it did at first, made a question nobody was asked look like one somebody declined. **What is not data is said rather than filed**: the complaints go to the terminal where whoever ran the script is looking, since a `checks.csv` that is empty nine times in ten is a file somebody has to open to learn nothing. **Anything counting how much of an instrument somebody gave wants care, which
is the other reason there is no column for it.** A partial holds only the items
that were answered — that is what the staged records are — so a share worked out
from one is 1 for every instrument it touched, however little was reached: a
real abandoned run of 22 September 2026 had answered three of the HEXACO's
twenty-five and a share said 1 where a count said 3. The denominator that would
settle it is the instrument's own length, which lives in `content/` and in no
saved file. **The two sequence columns are how one row
keeps what a row cannot hold**: which levels somebody walked and the order they met the items in are facts about a sequence, so they are joined with `" | "` into one cell each rather than spent as a column per item. `--long` also writes the tidy `responses.csv`, one row an item, which is the shape a mixed model wants. **A new item wants a key that is not already a column of this file** — nothing called `minutes` or `completed`, nothing ending `_RT`, nothing starting `done_`, `Feedback_`, `Rating_` or `QC_`. The `PREFIX_Name` convention every key in `content/` follows keeps that true without anybody thinking about it, and there is deliberately no guard: a check for something the naming makes impossible is one more thing to read. It **reads both shapes out of the deposit**: a finished run is a `container()`, and a `.partial.json` is **a bare JSON array of the staged records** — verified against a real one on 22 September 2026: no envelope, no wrapper, just the `frame` and `item` objects as the app staged them — which it puts back together by the rule they were staged under, the last frame and the last record under each key. That first real partial reassembled into a run of 28 items over five finished levels, **with the two fork choices in it** (`Level_4` answered "Character | Archetypes"), which is the whole point of the exercise: before streaming, a tab closed there left nothing at all. It checks rather than trusts (fields present, keys unique, `order` 1..n for a finished run and merely unique for a partial, one participant code per file, one app version across the set) and **prints** every file that fails instead of stopping on it or filing a report nobody opens. It drops a partial whose run also finished, and keeps test and synthetic runs out of `clean/` unless asked. **It does not score**, and the five things it cannot do are written at the foot of the file — the fifth being that `clean/` is not the public file: it still holds the `?sub=` id, the day of birth and the free-text comments, and the release step that takes them out is not written yet. `download.py` (standard library alone, no packages) fetches what DataPipe has filed in the Zenodo deposit, verifies each file against its checksum and leaves it in `raw/`. It runs again safely — a file already there with the right checksum is left alone — so it is the way to pull an ongoing study down each morning rather than a thing run once. **The deposit is a draft for the whole of a study** — DataPipe makes an unpublished deposition and never publishes it — and a draft is readable only by its owner, so the token is wanted throughout rather than at the end. It is looked for in `ZENODO_TOKEN` first and then in `~/.zenodo_token` (one line, nothing else), the second so that it outlives the shell it was typed into and anything run later finds it without being told. **Neither place is in this repository**: a secret in a folder git watches is committed sooner or later, and this one is inside Dropbox as well. `deposit:write` is the narrowest scope Zenodo offers for reading a draft and it can write to the account's depositions too, so it is worth rotating when a study ends. It unpacks DataPipe's `datapipe-batch-NNNN.zip` archives as they arrive, so `raw/` holds runs rather than archives however large the study grows. Its report is the reason it is a script rather than a download button: it counts complete runs apart from the partials of people who stopped, keeps **test runs out of the count** (`test_`, or `test-` before 23 September 2026; not data), and names any run that has **both** a complete file and a partial — one person and two files, which is a wrong n if both are counted (see **Where it goes**). |
| `docs/` | **The documentation**: a deck about the app, for the people working on it, in the three files the app itself is in — `index.html`, `deck.css`, `deck.js` — plus `items.js` and a stretch of `index.html` that are **generated**, and the script that generates them. No build to open it, no dependency, no server. Two slides: the landing page of the app with **Documentation** under it, and **Content**, the table of everything the test asks — which lived in `README.md` until September 2026, and which is now written by `build_slides.py` rather than kept by hand. A slide is a `<section class="slide">` and adding one is writing another; `deck.js` counts them, moves between them with the arrow keys, keeps the slide showing in the address (`#2`, read on load and on `hashchange`, written back with `replaceState` so the back button stays clear) and never looks at what is inside. **The wheel is the other way on**: scrolling past the end of a slide moves to the next, but only once that slide has nothing left to scroll (so a long table is read to the bottom first), only past a deliberate push rather than the tick that arrives at the end, and not at all for a moment afterwards — a trackpad sends its momentum in a long tail, which would otherwise carry straight through the slide it just landed on. A slide that fits the window is at both ends at once, which is what makes the wheel work there. A slide arrives from the side it came from (`arrive-on` / `arrive-back`, the side written by `deck.js`; the slide a visit opens on has come from nowhere and arrives without one), and `.slide--on` centres with `justify-content: safe center`, so a slide taller than the window falls back to the top instead of overflowing past it where the first rows cannot be reached. **Picking a row of the table says what that instrument asks**, out of `items.js`. It is a **click** and not a hover (`aria-expanded` on the row, `aria-controls="items"`, Enter or Space when it has focus, and the same row again, Escape or leaving the slide to put it away): the list stays up, the text in it can be selected and copied, and forty-odd items can be scrolled without the pointer having to stay on the row it came from. The row and the list are one thing in two places and so are one colour, `--pick`, a blue of the deck's own between the app's cyan and its violet — the row filled with it and edged in it, the list bordered and numbered in it. That list sits beside the chrome rather than inside the slide, because a slide carries the arrival animation and an element with a transform on it is the containing block its `position: fixed` children are placed against. The look is the app's **restated, not imported** — the tokens are those in `css/style.css` and the hero is `.hero` from the root `index.html` — so nothing here can break the app, and a change to the app's look has to be brought across by hand; the three logos are the app's own files in `assets/`. No presenter notes, no transitions, no export: `@media print` and the browser's print-to-PDF are the export. It was a Slidev project for a day, which is why the root `.gitignore` no longer ignores `docs/`. |
| `docs/build_slides.py` | **The Content table and `items.js`, written out of the app's own questions** — a workbench like `data/norms/` and `data/synthetic/`, run by hand when `content/` changes (`--check` says whether the deck is stale and exits 1 if it is). It reads the app **through `data/synthetic/codebook.js`** rather than parsing `content/` itself, so there is one reader of the questions and it is the one that already walks them the way `app.js` does; it needs bun or node for that, and nothing else. It sanitises what cannot go into a table: an item that words itself from an earlier answer becomes one of its wordings marked as such, `text` is HTML so the tags come off and the `<small>` gloss stays, and a reasoning item drawn as a picture is marked `[with a figure]` — four of them share a stem and would otherwise read as the same question four times. **`ROWS` is the one hand-written thing in it**, and has to be: a row's *reference* is nowhere in `content/`, and the table's unit is the instrument where the content's is the questionnaire — `singles` is one questionnaire holding eleven scales, `hexaco18` holds the HEX-ACO-18 and the KSE-G, `control` holds four two-item proxies. That mapping is **checked rather than trusted**: every item the app asks must be claimed by exactly one row and every row must claim at least one item, or the script stops and says which, so a questionnaire added to `content/` without a row is a failure rather than a table that quietly goes stale. |
| `README.md` | The author's own notes: the aim, the batteries, and a long list of questionnaire ideas that are *not* in the test. Its **Includes** section is now a pointer to the deck's Content table, which is where the list of what *is* asked lives. Not documentation. |

**The seam.** `app.js` builds an `engine` object — the run, the scores, and the
two pieces of chrome (`showScreen`, `burst`) a result arrives with — and hands
it to `makeResults()`. That object is the whole of what crosses between them,
in one direction: `results.js` never reaches back for anything else, and
nothing in it walks the run or writes to `responses` (it reads two answers
as given — the birth month and day, for the star sign — through
`engine.answer`, which is read-only). (It does read
`QUESTIONNAIRES` — a `content/` global, for norms and section names — which is
shared ground rather than app.js state, so it crosses no seam to get there.)
Adding to the seam means adding to that object literal, so keep it small.
**The one member that writes is `visit`** (23 September 2026): it tells the
engine that somebody else's results, out of a shared link, are on screen, and
while they are `score`, `total` and `answer` read the link's values rather than
the run's (`visitor` in `app.js`, cleared by "Take the test yourself" before
anything can be answered). See **Sharing a level**.

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
level's results read in. The one thing that can change that order after the
walk is **the fork** (below): a run of levels the participant puts in order,
one choice at a time, which `takeFork` moves in `PLAN`, `questions` and `RUN`
at once and re-stamps.

**A questionnaire is the unit of shuffling, and the only one.** Its items may
come in any order, but they come together; everything around them — the other
questionnaires, the briefings, the blocks, the levels — holds the order the
timeline gives it, and an item marked `shuffle: false` keeps its own place
while the rest move around it. A whole questionnaire may be written
`shuffle: false` too, and one is: the PI-18 on level 7 was validated in a fixed
order and is asked in it. That is the exception rather than the shape of the
thing — a scale whose own validation says nothing about order should shuffle,
which is the default and what everything else does.

The whole of the run's order follows from that one rule, and answers most
questions about it before they are asked. Two instruments meant to be asked in
among each other go in **one** questionnaire, because being one questionnaire
is what makes them one shuffled run — which is why the eleven single-item
scales of the `singles` block are one questionnaire rather than ten, and why
the FIPI beside them stays a run of five that nothing is ever dealt into. Two
meant to stay apart go in two. And a briefing, being an entry of the block
rather than of any questionnaire, can never be crossed by anything.

**What is asked, and where.** Eleven levels, ten of them scored, out of seventeen
blocks (the `hexaco` block holds the HEXACO with the KSE-G dealt into it,
and the commented-out Mini-IPIP6 and BSDS) — so this table is the map of `content/timeline.js` and of the folder
around it at once:

| | |
|---|---|
| Level 1 | `demographics1` (age, month of birth and — branching off the month — the day, one `BirthDay` item wording itself from the month and offering only the days that month has; gender and what branches off it), `fipi` (the briefing that opens the whole test, then the five items) and `singles` → General. `fipi` is read back as **two old theories and nothing else**: the star sign and the temperament side by side (see **Two old theories**, below), no rows. Extraversion and Emotional Stability keep their norms because the temperament is read off them; the other three are commented out, since the HEXACO on level 5 draws the same ground in full — so it is out of `CHARTS` (a spider wants three axes) and off the whole-run web (`profile: false`) |
| Level 2–4 | `demographics2` (education, discipline, student, ethnicity, country), `mint` (a briefing, then the items) → Brain-Body Axis. **One of the three levels of the drawn run** (September 2026), so it is met second, third or fourth as the draw falls; it was fixed at level 2 until then, and a fork level before that |
| Level 2–4 | `bait` — a briefing, the AI knowledge, technical-understanding and usage singles (the 2.1B Expertise trio, which asked the same three things among the shuffled statements, is gone; the understanding single carries a key of its own, `BAIT_Understanding`, so it cannot stack onto the old `BAIT_UnderstandingAI` it replaces), then the shuffled BAIT statements (the union of the 2.1B and 2.2 administrations, under the harmonised item names of the pooled validation, plus its attention check). Scored as the BAIT-8 — AI Realism, AI Enthusiasm, AI Apprehension — and read back as one of three archetypes (see below) |
| Level 2–4 | `demographics3` (household financial comfort, MacArthur subjective social status), then `mood` and `health` in a random order, then `hitop`. `mood` is a briefing, then `phq4` and `sleep` (the SQS single, asked and scored but shown nowhere; the CDS-2, and the PCL-2 that was the Stress dimension until September 2026, sit commented out in the same file) and `health` is a briefing, then the list of psychiatric diagnoses and treatments (`psychiatric`, keyed `Psychiatric_Diagnoses` / `Psychiatric_Treatment` and asked and saved but scored and fed back nowhere — the two were `Disorders_…` until September 2026, and the commented-out somatic history beside them moved to `Somatic_…` at the same time, so a prefix names the thing asked about; the SSS-8 and the somatic medical history sit commented out in the same file). Then `hitop`: a briefing (widening from the last few weeks to the last year, and saying what follows is asked as spectra rather than categories) and the HiTOP-BR (`hitopbr`), 45 statements about the last twelve months on a 4-point scale, scored as six spectra. `phq4` and `hitopbr` are read back together as **the climb** (see below), the level's one section — three of the spectra and the PHQ-4's fortnight drawn into one hill; the other three spectra, sleep and self-rated health are fed back nowhere. (It had a spider chart with a row per spectrum once, dropped as reading like verdicts, and the level was then two faces, Mood and Health, until the climb.) **The spectra carry plainer names than the HiTOP's own** — Bodily Complaints, Emotional Intensity, Unusual Experiences, Solitude, Impulsivity, Dominance, for Somatoform, Internalizing, Thought Disorder, Detachment, Disinhibition, Antagonism — one for one, so nothing about the scoring changes; the mapping is written above the norms in the block file. The one questionnaire whose norms are **not** invented — they are the development-sample means and SDs of Simms et al. (2026) — kept for analysis, and written `profile: false` too, so the six stay off the whole-run web. Item keys are the package's item numbers under the app's prefix (`HITOP_01`…`HITOP_45`, since September 2026; `HBR_nn` before), so a saved file scores with `score_hitopbr()` once the columns are renamed `HBR_nn`. It lived in `block_hexaco.js` — then `block_personality.js` — until September 2026 |
| Level 5–10 | `hexaco` → Character: a briefing, then the HEX-ACO-18 (`hexaco18`, 18 items, the HEXACO on its own 5-point scale, named "Character" on screen). **Read back in full**, as a spider chart with a row per domain, and its six domains take axes on the whole-run web. The domains carry **plain names** — Honesty-Humility and Emotionality as published, then Sociability, Patience, Diligence and Curiosity for eXtraversion, Agreeableness, Conscientiousness and Openness — because a dimension is one name across the run and the FIPI has the Big Five words on level 1, and because the HEXACO's constructs are not the Big Five's anyway (its Agreeableness is patience and forgiveness); the mapping is written above the questionnaire in the block file, and the item keys still name the facet. The Mini-IPIP6 (`ipip6`) sits commented out in the same file, dropped for the HEXACO. **Dealt in among the HEXACO's items is the KSE-G** (`KSEG_Positive_1`…`KSEG_Negative_3`), six social-desirability statements — three exaggerating positive qualities, three minimising negative ones — there to blend in, which is why they are items of that questionnaire rather than a questionnaire of their own. They carry **no `dimension`** (September 2026; they were two, which the engine averaged for nobody): nothing reads a score off them, the total is taken at analysis time with the Negative three reversed, and one handed back would only teach the next answer. The BSDS sits commented out beside them, one of its items being the KSE-G's almost word for word |
| Level 5–10 | `archetypes` — a briefing, then the **Open Source Archetype Indicator – Pearson-Marr (OSAI-PM)**: twelve three-item scales after Pearson and Marr's twelve-archetype framework (Idealist, Sage, Seeker, Revolutionary, Magician, Warrior, Realist, Jester, Lover, Creator, Ruler, Caregiver), an open paraphrase written from public descriptions of the framework rather than from the PMAI's items, to be validated independently of it. The only scored questionnaire in the app **written without norms on purpose**, and the only one fed back anyway: read back as a wheel (see below) |
| Level 5–10 | `primals` — a briefing, then two questionnaires asked back to back on one scale: the **PI-18** (`pi18`, Clifton & Yaden, 2021), the validated short form of the 99-item Primals Inventory — eighteen statements about the character of the world on its own 0-5 agreement scale, seven reverse-keyed, **written in the fixed order the short form was validated in** (`shuffle: false`, the only questionnaire in the app that holds its own order), read back as **the sea** (see below) and nothing else — no rows, no standings, one vote on the picture; and the five **tertiary primals that cluster under none of those three** (`primals_tertiary` — Acceptable, Changing, Hierarchical, Interconnected, Understandable), 22 items taken whole from the PI-99, which is what the inventory's own instructions recommend for reaching them. The two are separate questionnaires because they are two instruments asked two ways, and because the broader primals are meant to precede the narrower ones. The inventory's headline primal, overall **Good** world belief, is *not* a fourth set of items but a composite of the PI-18's own (all six Safe, all seven Enticing, `PI_Alive_1` and `PI_Alive_4`) — an item here carries one dimension, so rather than ask anything twice or teach the engine a second way to score, Good is left to analysis time: the keys name the primal and count within it (`PI_Safe_1`) with Clifton's own label beside each in the block file, so his published code computes it from a saved file after one rename (the keys were his labels, `PI18_ed1` then `PI_ed1`, until September 2026). Safe, Enticing and Alive take axes on the whole-run web; the five neutral primals are written **both** `profile: false` and `results: false`, so they are asked, scored and saved and fed back nowhere — five percentile rows under the sea would be a second, plainer answer to the question the picture has just answered. The level is therefore one section, and `markLone` hides its name |
| Level 5–10 | `icar` — a briefing (turning from what you are like to how you think), then the **ICAR-16 Sample Test** (`icar16`; Condon & Revelle, 2014; Young & Keith, 2020): sixteen problems with one right answer each, four of each of four kinds — verbal reasoning, letter series, matrix reasoning and three-dimensional rotation — keyed by the ICAR's own item numbers under the app's prefix (`ICAR_VR_04`, `ICAR_LN_07`, `ICAR_MR_45`, `ICAR_R3D_03`). Untimed and shuffled, as validated. **Scored right or wrong** (`correct:`, see **Right answers**), one dimension per kind, and read back as **the compass** (see below): the four against each other, never a total and never a standing. **The four carry norms, and the level reads none of them** (September 2026): they are invented placeholders, written for one reason only — the whole-run web draws the average person from a mean on every axis, and four axes without one left a gap in that ring where the reasoning's fell. The compass itself is unchanged, since `renderReasoning` takes the section whole and there is no row to grow. The web *does* read them back as a standing, worded as a style rather than as a score ("Verbal: thinking in words — you use it less than 97% of people do"), which is the whole of what makes a percentile on this ground all right: see **The compass**. The real SAPA norms exist and are still deliberately not used. **The four carry plain names, framed as cognitive styles** — Verbal, Logical, Visual and Spatial, for verbal reasoning, the letter series, matrix reasoning and rotation, one for one, so nothing about the scoring changes and the item keys still name the subtest; the mapping is written above the items in the block file. "Styles" is the feedback's word: what is measured is performance on four kinds of problem, and which came easiest is the one reading four items a kind can bear. The eight matrix and rotation items are drawn: the problem (the grid with a cell missing, the cube to rotate) is the item's picture, and each candidate is a picture on a button of its own with its letter under it, cut out of the figures in Appendix A of the paper's supplement (`assets/icar/source/`, see **Right answers**); two of a rotation item's eight candidates are written rather than drawn — "None of the cubes could be a rotation", "I do not know the solution" — and are plain labelled options, saved as those words (they were saved as "D" and "H" until September 2026; the values are unchanged). Stems and options are verbatim from that appendix (shelved as `literature/Condon_Revelle_2014_ICAR_supplement_SampleTest.pdf`) — except that the rotation stem says "the following cube" for "the cube labeled X", the cube being shown alone and without its letter — and the key is the `iq.keys` vector the {psych} package documents beside these items. The four take axes on the whole-run web (`profile: true`, now redundant beside the norms and kept as the statement of intent), each as its share of items right. No attention check: there is no straight line to catch on a right-answer test |
| Level 5–10 | `regulation` → Mind & Heart (**Passion & Restraint** until September 2026; the `key` is `Regulation` and did not move, which is what keys are for): a briefing (turning from what you are like to how well you steer it; written, like every briefing since September 2026, to hold wherever the timeline puts it), then three questionnaires on one theme from three sides. `control` ("Attention & Self-Control") is eight single items off four short scales asked as one questionnaire so the pairs are dealt in among one another — the first two items of the **ASRS-v1.1** screener (Kessler et al., 2005; `ASRS_1`, `ASRS_2`, on its own five labels, for the past six months) as Inattention, items 10 and 21 of the **CFQ** (Broadbent et al., 1982; `CFQ_10`, `CFQ_21`, on its own five labels) as Absent-Mindedness, items 1 and 4 of the **MW-S** (Carriere et al., 2013; `MWS_1`, `MWS_4`, 1 rarely to 7 a lot) as Mind Wandering, and items 1 and 2 of the **BSCS** (Tangney et al., 2004; `BSCS_1`, `BSCS_2` reversed, 1-5 like me) as Self-Control — none of the four pairs a validated short form in its own right, so each is a two-item proxy. `ers` ("Emotional Reactivity") is six items of the **Emotion Reactivity Scale** (Nock et al., 2008), two per facet, verbatim, on its 0-4 scale — Emotional Sensitivity, Emotional Arousal, Emotional Persistence, the word in front because a dimension is one name across the run and the bare facet names sit too close to the MINT's and the HiTOP-BR's. `cerq` ("Coping Strategies") is the **CERQ-short** (Garnefski & Kraaij, 2006): nine strategies, two items each, verbatim, on its 1-5 almost-never-to-almost-always scale, the CERQ-36's item number in a comment beside each, under the CERQ's own strategy names in the app's spelling (Catastrophising); the adaptive/maladaptive split of the literature is a reading and not a score, and is left to analysis time. **All three are read back together as one chart** (see **Mind and heart**, below), the level's one section — no rows, no spider, two votes — and **all three are `profile: false`**: sixteen more axes would double the whole-run web. All norms invented placeholders, flagged; nothing on the level reads them, but they are what puts the three on the level at all (`dimensionsOf`). The level's check is `CERQ_AttentionCheck`, asking for 2. **One of the six levels of the fork** (September 2026), like everything else below the drawn core |
| Level 5–10 | `opinions` → Where You Stand (key `Opinions`, September 2026): a briefing (turning from you to what you think of everybody else), then **three questionnaires, the third nearly everything**. **What the level is for**, written at the head of the block file and what decides whether a question belongs in it: where somebody leans, in terms comparable with the field (the self-placement and the plane), and what they make of the questions their own society argues about that left and right answer badly (the spectra) — a question belongs in the second half if people who share a place on the plane still divide over it. **Every key on the level starts `Opinion_`** (September 2026), so the level can be picked out of a saved file by prefix the way the demographics can; where an item comes out of a published scale the source is the second segment (`Opinion_ESS_LeftRight`, `Opinion_CMQ_1`, `Opinion_BSA_LibAuth_2`) and where it is custom the dimension is (`Opinion_Parity_1`). The rename came before any run was saved under the old `BSA_`, `CMQ_`, `ESS_`, `Frontiers_`, `Outcomes_`, `Nature_` and `Beauty_` keys, so nothing has to be coalesced. `leftright` is the **ESS left-right self-placement** (`Opinion_ESS_LeftRight`, 0-10), asked first so no statement can colour it, with no dimension and no norms — saved for comparison with every other survey that asks it, read back to nobody, and the one place on the level the words left and right appear, since what it measures is political identity rather than position (the ESS's "Don't know" is not offered: the engine cannot set a labelled way out beside numbered circles). `cmq`, second, is **three items of the Conspiracy Mentality Questionnaire** (Bruder et al., 2013) — 1, 4 and 5, the highest corrected item-total correlations in the original validation; 2 (politicians' motives) was the weakest and 3 (agencies monitor citizens) may be simply factual (Swami et al., 2017) — on a **slider** (`type: "slider"`, 0-100%, saved as the percentage), as Suspicion; the fourth is reworded plainly, key unchanged. `views` is **every statement of the level in one questionnaire** (September 2026), so they are shuffled in among one another: as five questionnaires each arrived as a run of its own, and four statements about one thing in a row say what they are measuring. Each scale keeps its own dimension and norms, and the block file keeps each one's provenance together above its items. On the BSA's five labels, under no instruction, except the BSA-derived items, which carry "In the country I live in…" as their own. **Thirty-one statements, 35 items on the level, no scale above four or below three** (23 September 2026; it was 43, with Enhancement at seven): the cuts were for overlap and validity, and each is noted beside its scale in the block file. The scales: **Sharing and Order** (the plane), adapted from the **British Social Attitudes** left-right and libertarian-authoritarian scales (Evans, Heath & Lalljee, 1996), each adapted item quoting its source and why beside it — three items for Sharing (redistribution asks the government to *do more*, "fair share" as the BSA has it, and `Opinion_BSA_LeftRight_Markets`, the markets end written for the scale in place of "one law for the rich and one for the poor", reversed; the big-business item went as a second perceived-unfairness item and the more loaded one) and four for Order (stiffer sentences and the law obeyed though the person thinks it wrong, as the BSA has them; `Opinion_BSA_LibAuth_Surveillance`, police power to monitor people's activities against privacy, in place of "schools should teach children to obey authority", which reads as harmless or sinister by reader; and `Opinion_BSA_LibAuth_Tradition`, the one reversed item on the side — "How people choose to live, marry or raise a family is their own business, even when it goes against my country's tradition and culture" — in place of the BSA's "respect for traditional values", which is close to a claim of fact, and of a normative rewrite with examples that had a ceiling, family and good manners being endorsed by everybody; it names the country itself and so carries no instruction). **The free speech item went** ("People should be allowed to spread, teach and research ideas I find abhorrent, even, for instance, that some people's lives are worth less than others'"): the item least likely to load with the rest of Order, free speech for abhorrent views cutting across left and right where the scale does not, and the longest on the level with an example that would have carried the response. **Parity**: four custom items, equal outcomes against equal chances between groups, two each way, every one a positive statement of its own view — two propositions, each asked from both sides — in place of the SDO7(s) anti-egalitarianism items (Ho et al., 2015), whose abstract "group equality" read as equal rights and whose negated items read as double negatives — beside `Opinion_Diversity`, a 5-point trade-off between a range of views and a range of backgrounds with **no dimension**, kept to find out whether it lines up with Parity (each end now stated plainly; "even if they all think alike" made one end the obvious one). **Enhancement and Heredity**: seven custom items — four for Enhancement, one theme apiece and two each way (oneself made more intelligent; immortality, "It is good that we try to develop technology that would let people live for ever", positive where the lifespan item it replaced was a reversed negation; the principle, reversed; and selection, "Parents should not be allowed to choose their children's traits, even if the technology were safe and available to everyone", reversed, the two clauses taking the safety and inequality objections off the table — the screening-in-pregnancy item went as an abortion item, and the donor and the children's-health-and-abilities items as second and third children items), and three for Heredity (between individuals, deliberately not groups; one reversed; "almost anyone could become almost anything" went as blank-slate absolutism overlapping the intelligence item). **Planet and Animals**: custom — four for Planet (the climate put before growth and comfort, as trade-offs, two each way; "the dangers have been exaggerated" went as a claim of fact saturated with left-right, and "Jobs and cheap energy should come before cutting carbon emissions" stands in its place; its far end is where degrowth sits, noted in the file), three for Animals (one positive, two reversed; the consciousness item went as a claim of fact, and animal research is now "acceptable if it might help people") — beside two items with **no dimension**: nuclear power (`Opinion_Nuclear`) and what somebody eats (`Opinion_Diet`, a behaviour, held last with `shuffle: false`, and the one known-groups check Animals has); the turbines against a beautiful landscape went, a beauty-against-utility trade-off under a Planet key. **Beauty**: three custom items on how much beauty should count against cost and usefulness, one reversed, chosen so that neither end is the decent answer — a value, and not the personal disposition `Aesthetics_Beauty` asks on level 1; the art item (what a work says against how beautiful it is) went as art criticism rather than the same trade-off. **No attention check** (September 2026; `BSA_AttentionCheck` stood among these statements and was the most jarring check in the run). **Read back as one figure** (see **Where you stand**, below), the level's one section, two votes. **All three are `profile: false`**: nine more axes would crowd the whole-run web, and a person's politics has no business on a card made to be shared. All norms invented placeholders, flagged, read only to mark the average person. The BSA and CMQ source wordings **were checked against the sources on 23 September 2026** and are exact; the one thing the check found was that the law-obeyed item is the BSA's libertarian-authoritarian item 5, not 4, so it is keyed `Opinion_BSA_LibAuth_5` (it was `_4` for a day, before any run was saved). **These are political opinions under UK GDPR Article 9**, whatever the screen calls them, and the ethics application's A5 and A6 have to say so. Its axes are not the Political Compass's on purpose: see the head of `content/block_opinions.js` |
| Level 11 | `closing` — **fixed**, and the only level after the fork. Nothing scored in it, so it opens no results: whether the test was taken seriously, then `Closing_Comments`, a free-text box (`multiline`, `optional`) for anything the person wants to say, with a warning over it that what is written may be made public. Saved as given, `""` when skipped; nothing reads it back |
| — | `gjs` sits in `content/block_UNUSED.js`, named on no level, so it is never asked; the `somatic` medical-history questionnaire sits commented out in `content/block_health.js` |

The demographics of a level are written `shuffle: false` and come first in it;
everything else on that level is shuffled in behind them. A follow-up to an
answer (`…Other`, `GenderIdentity`) is written directly after the item it
branches from. The one-item scales of the `singles` block — narcissism, health,
stress, self-esteem, self-concept clarity, search for meaning, self-efficacy,
life satisfaction, aesthetic seeking (`Aesthetics_Beauty`, "I value beautiful things and I go
out of my way to seek out beauty", custom, September 2026 — valuing and seeking
rather than being moved, since nearly everybody says beauty moves them and
effort is where people differ; two clauses in one item on purpose, the effort
being how the valuing shows; the fourteen-item AReA is the validated measure
if it ever wants one) and the two
self-placements — are written as one `singles` questionnaire and not as eleven,
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

**An option may branch too** (September 2026): an option carrying `showIf` is
offered only while that answer is given, which is how the day of birth offers
a 30th and a 31st only after a month that has them. `offered()` is the one
test, and what is put on screen, what the keyboard counts and what test mode
answers with all go through it; `question.options` still holds every option,
so `said()` reads back an answer whose option has since closed. Nothing prunes
such an answer — a month changed after the day is given leaves the day as it
was, which the star sign reads without harm.

**The item itself.** `text` is written into the page as HTML, so a question may
carry more than the bare statement: a gloss on the word being asked about, set
under it and quieter (`<small>`, which the stylesheet drops to 0.6em) — the
FIPI's "That is: sociable, assertive…", the two curve items' definitions of
*intelligent* and *attractive*, the BAIT's note on what counts as an AI tool.
It comes from the block file it is written in and nowhere else.

**The stem belongs over the box, not in it.** The lead-in that frames a whole
questionnaire — "Over the last 2 weeks, how often have you been bothered by the
following problem?" — is that questionnaire's `instructions`, which stands
italic above the item and is re-read with every one of them. It was written
into each PHQ-4 item until September 2026, which put the lead-in and the thing
being asked in one box, on one card, unlike every other scale in the run; the
commented-out CDS-2 and PCL-2 beside it still carry theirs and want the same
move if they ever come back.

**A question may word itself from an earlier answer.** `text`, on the item or
on any one of its options, may be a **function** of the answers rather than a
string: it is handed a read-only `answer(key)` and returns the words. `worded()`
in `app.js` is the one place either kind is read — the question on screen, a
briefing's body, an option button's label, and `said()`, which is what puts the
words in the saved file — so a function and a string are interchangeable
everywhere and nothing else in the engine knows the difference. It exists so
that one item can be asked several ways without being several items with several
keys: `BirthDay` asks "On which day of February were you born?", the month
read out of `BirthMonth`. An
item worded from an answer should carry the `showIf` that waits on it, so it can
never be drawn before the answer it words itself from is there. Wording a
question is not answering one — the accessor only reads.

**Types.** Every item has a `type`, which is the whole of what decides how it
is put on screen: `"choice"` for option buttons, `"input"` for a typed field,
`"multi"` for a list several answers may be true of at once, `"curve"` for a
place on a bell curve, `"slider"` for a point on a line between two ends
(`renderSlider`: a range with no thumb and Continue held until it is touched,
so the middle it starts at is never an answer; `min`, `max`, `step`, `unit`
and `anchors` on the format; the CMQ's likelihood — and, since 23 September
2026, a dashed ghost of the thumb following the pointer with the value a
press there would give, the track filling to the thumb once pressed, a halo
round the thumb that grows while it is held, and the spray coming out of the
point chosen, `.slider__mark`, rather than out of Continue), `"briefing"` for a screen with nothing
to answer on it. The first two need never be written in `content/` —
`typeOf()` reads them off the format, since a question that said its own type
as well would only be a second place for the two to disagree; the other four are
written. `SCALES` in `app.js` is a renderer per type, and `SPRAYS` beside it names what
each type is answered *by* — which is where the spray comes out of when it is.
Those two tables are the only places a type is dispatched on, so **a new way of
answering is a `type` in `content/` and a line in each of them, and nothing
else moves** — `curve` and then `slider` were added that way, and each touched nothing but the tables,
its own renderer and its own stylesheet block (`slider` also its line in the synthetic workbench).
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
it rather than through it. Ten are asked, one at the head of each of the
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
`archetypes` block (turning to the self as a story), and the `regulation` block
(turning from what you are like to how well you steer it). **None of them says
where in the run it falls** — no "finally", "next" or "let's start with", and no
"level 1" — since September 2026, so a block can be moved on the timeline, or
left out of a battery, without its briefing going wrong.

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
way. The count above is ten; the `icar` block's makes eleven, turning from
what you are like to how you think.

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
`INPUT` or a `TEXTAREA`, or digits would answer the item while being typed. A written answer is
somebody's own words, so nothing may put it in a selector — the spray on
answering comes out of the Continue button rather than out of
`[data-value="…"]`.

A text field may be written `multiline: true` (a `<textarea>` of several
lines, `.entry--long`, with the button under it rather than beside it —
Enter starts a new line, so Ctrl+Enter or Cmd+Enter is what takes it) and
`optional: true` (a blank is an answer: the button reads "Skip" while the
field is empty, and what is saved is an empty string rather than the null of
an item never reached). The one item that is both is `Closing_Comments`, the
last of the run — a box for free feedback, which nothing scores and nothing
reads back, and which the item warns may be made public. `anyAnswer` fills
it with "test" in test mode like any other text field.

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

**Right answers.** An item written `correct:` is a problem rather than a
rating: `counted()` gives it 1 for the right option and 0 for any other,
whatever the options are numbered, and the flattening sets its bounds to 0
and 1 so a reach along it is a share of items right. It is a field beside
`check:` rather than a use of it, or sixteen wrong answers would count as
sixteen failed attention checks. What is written is **not the answer but a
hash of it**: `answerKey(key, value)` in `content/timeline.js` (FNV-1a over
`"<key>=<value>"`, eight hex characters), which the engine computes over the
answer given and compares. The block file is public and unminified, so this
is obfuscation, not secrecy — the page has to be able to score, and anybody
reading the code can try the handful of options — but it keeps the sixteen
right answers out of a search engine and off a casual reading of the source,
which is the ICAR's own concern about its items. To write one, open the page
and call `answerKey("ICAR_VR_04", 4)` in the console. The option values of
such an item are its position in the published list, so the saved file's
words and values both read back onto the published key. A picture item is an
ordinary `"choice"` whose `text` carries the problem as an `<img>` and whose
options each carry an `image:` — the candidate, cut out of the published
figure — which `optionButton` puts on a tile (`.option--picture`) with the
option's `text`, its letter, under it as a caption. The letter is still the
button's words, so it is what `said()` saves, what a screen reader hears and
what the keyboard answers by (a one-letter option is answered by its letter
as well as by its position, which serves the letter series too). `.text img`
in `style.css` puts the problem on a white plate (`.cube` shows the small
cube at half again its size), `.options--pictures` lays the tiles out —
six across for a matrix, four for the cubes, wrapping on a phone — and
`.text .series` sets a letter series on a line of its own. The ICAR draws
the problem and its lettered candidates as one figure; the pieces are cut
out of it by `assets/icar/source/cut.py`, which finds the table rules and
the gaps rather than taking pixel positions by hand, so a figure replaced
in `source/` is recut by running it.

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
| **Emotional Intensity** | how steep the hill is: a logistic ramp (`surface`) from a long gentle rise to a cliff face with a plateau above. The summit is always in frame (a dashed path up to it, and tufts of grass along the ridge, were taken out in September 2026 as furniture over the one line the eye follows) |
| **Solitude** | who is on the hill with you (`company`): three other walkers close by at the sociable end, fewer and further up the slope as the year was spent more alone, then none. The count steps at thresholds, since a walker cannot be two-thirds drawn; their distance moves continuously |
| **Bodily Complaints** | the pack on your back (`walker`): from a day bag to a heavy load, with the figure leaning into it |
| **Mood** | the weather (`sky`): the PHQ-4's *last two weeks*, not the year — more cloud, lower and greyer, and the sun going out, as the fortnight has weighed more. It is the one channel on a different clock, which is the point of having it there: the fortnight sits on the same picture as the year |

**Three of the four are standings, not reaches.** The sea drives its scene
from a reach along each scale, which works because the primals are spread
across theirs. The HiTOP-BR spectra pile up at their floor, so a reach would
draw nearly everybody the same gentle hill; the three year channels are
therefore the percentile against the development-sample norms (`standing`),
which are real — though **nothing on screen says so any more**: the note over
the bars used to spell out which channel was a standing and which a share of
its own scale, and was cut in September 2026 as apparatus (with `SAMPLE`, the
780 it named). The weather is neither: it is the PHQ-4 total as a share of
the way to the top of its own bands (`MOOD_FULL`, 9, the foot of "severe"), so
a total of nought is a clear sky and nine or more is cloud on the hill, and no
invented norm is read. The PHQ-4's norms in `content/` are therefore read by
nothing; they stay because norms are what put a questionnaire on its level at
all. Those standings go through `percentile()`, the normal curve, which is
coarse for floor-skewed scales — the note at the foot of `data/norms/make_norms.R`
asks for empirical quantiles instead, and for the engine to learn to read them
(a `quantiles:` form beside `mean`/`sd`, preferred by `percentile()` when
present). **That is parked, not done.**

The section is a title ("Challenges"), the person's own hill at the width of
the card (`.climbview__stage`), then one line saying what it was drawn from
("This is how we think you might feel. This hill is drawn from four dimensions
that emerged through your answers"), then the four channels as a bar chart
under *that* (`bars`, `.climbview__bars`: a column apiece filled from the foot
to the value the scene is drawn from, named underneath, and explained in the
shared tooltip on hover or focus — the explanation lives there rather than on
the page, so the chart is four bars and four names; hovering or focusing a
column also lifts its track, brightens its fill and runs a band of light up it
once, `climb-sheen`, which is on the fill's `::after` and moved by `translate`
rather than `transform`, since the fill is parked on the last frame of
`climb-fill`), then the two ends under a line of their own
("Other people climb other hills": `EASY`, a gentle morning in company, "Low
scores on the four dimensions", and `HARD`, a cliff in cloud climbed alone
with a heavy pack, "High scores on the four dimensions"), and one vote ("Does
this match how the last year felt?") filed under `CLIMB_KEY`, which is `Year`.
(It opened with the bars beside the hill, as a key, for a day, and the note
stood under the bars rather than over them until September 2026.) Locked, the
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
script writes in from the seeded generator, and these are one of the **two places a
results card loops** (the other is the ring beating out of the point on **Where you stand**): `.result--sealed` holds them at their first frame until
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

**The compass.** The ICAR-16 closes its level as neither rows nor a total
but a compass (`renderReasoning`, `drawCompass`, in `js/figures/reasoning.js`):
four arms out of one centre — Verbal north, Logical east, Visual south,
Spatial west — each in the colour its items were asked in, **each as long as
that style's problems came easily relative to the other three**: the arms are shares of
the person's own best (`shares`), so the longest always reaches the rim and
the figure shows a shape and not a size. The longest is picked out in gold and
named underneath ("Your cognitive style is predominantly:", one lead line whatever the shape), every style tied for the
top is named (`leading`, the wheel's rule), the one furthest behind is named
in a quieter line when there is exactly one and it is not also at the top
(`trailing`, "Your least used style is"), and four styles level with each other are named as
four with a sentence saying no one stands out. One vote ("Do you agree with this?") filed under
`REASONING_KEY`, which is **`Reasoning`** — the key, unchanged, though the
level is now called **How You Think** on screen (it was `Reasoning` there too
until September 2026: accurate but dry. **"Logic" was considered and
dropped** — one of the four arms is already called Logical, and three of the
four subtests are not logic in anybody's everyday sense — and "Thinking
Styles" was written for a few minutes before "How You Think", which asks the
question the level answers instead of naming a category). Hovering an arm
says what the kind is, never how many were right. `REASONING_OF` names the
questionnaire; `ARMS` the four, with what leading with each tends to mean and
the `short` phrase `shortOf` hands out; `ready()` is every kind answered. It
goes through `dimensionsIn` like the wheel, and it is deliberately more
reticent than the wheel: no count on hover, no scale of its own, because a
total is what a reasoning test is usually wanted for and this level does not
give one. **It was the second figure drawn without norms until September
2026**, when the four grew invented ones — not for this section, which reads
none of them, but so that the whole-run web could draw an average person
right round its rim (see **The profile**). Nothing in the section changed:
still no row and still no percentile here.

**The web does read them back as a standing, and the wording is what makes
that all right.** `summarise` says "Verbal: thinking in words — you use it
less than 97% of people do" where every other axis says "lower than 97% of
people". The four are named and framed throughout as **styles rather than
abilities** — Verbal, Logical, Visual, Spatial, never intelligence and never
a total — so being a less verbal thinker than most is a description and not
a worse result, which a bare percentile against a bare name could be taken
for. The words carry that, so they are load-bearing: **if the dimensions are
ever renamed towards ability, this sentence has to be looked at again.**
Locked, a stand-in name and the figure from `teaseValue`, blurred, no
buttons.

**Mind and heart.** The Mind & Heart level (`regulation`)
closes on one figure for its three questionnaires (`renderHeads`, in
`js/figures/heads.js`; `HEADS_OF = ["control", "ers", "cerq"]`, rendered where
the first of them falls in `RUN` and skipped where the other two would, on the
climb's pattern — `HEADS_FIRST` in `results.js`, `headed()` the check that
every channel is answered): **two halves, each a system and what gets in the
way of it**, drawn as a small glyph and two bars. Each channel is the *mean of
the reaches* of the dimensions it is made of (`CHANNELS`, `channel()`) — the
mean of reaches rather than the reach of a mean, so scales of different lengths
weigh the same — and `carries` is which of a half's two is the system rather
than the interference on it (the solid bar; the other is the same hue held
back):

| | |
|---|---|
| **Restraint** | the mind carries: Self-Control. Named for the level's own second word, and honest to the two BSCS items, which ask about resisting temptation and impulse |
| **Distractibility** | and this gets in its way: the mean of Mind Wandering, Absent-Mindedness and Inattention. The trait rather than the episode, which is what items asking *how often, over the past six months* measure |
| **Sensitivity** | the heart carries: the mean of the ERS's three, Emotional Sensitivity, Arousal and Persistence |
| **Brooding** | and this gets in its way: the mean of Rumination, Catastrophising, Self-Blame and Other-Blame, the four the CERQ literature calls maladaptive, though nothing on screen says so |

The four were **Grip, Wandering, Feeling and Circling** until September 2026,
when they were renamed in place; nothing is keyed by a channel name, so the
rename was four labels and their tooltips and nothing else.

**An interference channel is named for the interference, never for its
absence** — Distractibility and Brooding rather than Concentration and Coping,
both of which were weighed and dropped. The bar is filled to how much of the
thing there is, so a name meaning the opposite would put a long bar under
"Concentration" for somebody whose mind wanders most; "Coping" is also the
CERQ's own on-screen name for all nine of its strategies, of which this
channel is four. **Sensitivity is a knowing overlap**, and the author's call:
it is also the name of one of the three ERS facets inside it, and sits near
the MINT's Bodily Sensitivity on level 2 — the very collision
`block_regulation.js` prefixes the ERS facets with "Emotional" to avoid. It
costs nothing in the engine, a channel being neither a dimension nor a
feedback key, and Reactivity is the one-word swap if it ever reads wrongly.

The five adaptive CERQ strategies are read by nothing here, on purpose: the
level records sixteen dimensions and shows four things made of eleven, and the
note under the chart says so. **A dashed line stands over the middle of each
half's bars** (`.headsview__rows::after`, labelled once), and it is the
midpoint the reading is read off: each half is one of four sentences from which
side of it the two bars fall (`readingOf`, the temperament's rule at a reach of
0.5), so the words and the numbers they came from are on one screen. `SAID`
holds the four sentences a half, written so a person may land in any of them,
and **unnamed** — a name for the *quadrant* the sentence came out of ("Full and
caught", "Wandering") read as a verdict and went the day it was written. Those
were names for a pair of bars taken together and are not the channel names,
one of which happened to be "Wandering" too until September 2026. The section is a title
("Your mind and your heart", `.headsview__head`, and `openSection`'s own name
for the section is "Mind & Heart", the level's — the two were "Passion &
Restraint" on the gauge and "Feeling and focus" on the page until September
2026, which was one level called two things), the chart at the width of the card,
then **two cards side by side** (`.headsview__pair`, on the old theories'
pattern), each edged and voting in its own half's colour: which half, the
sentence, its own vote — "Does this match how you focus?" filed under
`MIND_KEY`, which is `Mind`, and "Does this match your emotional life?" under
`HEART_KEY`, which is `Heart` — and then one line, which is all that is left
of the note: "A busy head is not a broken one, and none of this is a
diagnosis." **A channel says what it means and never where it came from**
(September 2026). The tooltip on a bar was one sentence about the thing and
then a second naming the scales averaged into it — "the average of mind
wandering, absent-mindedness and inattention" — and the note under the chart
said the same thing a third time. Both went: which items a number came out of
is the instrument's business and not the participant's, and a figure that
shows its own workings reads as a receipt rather than as a reading. The
tooltip does not repeat the percentage either, that being on the row an inch
away; **the `aria-label` still carries both**, since a reader handed an
explicit label never reaches the text inside the row. Locked, the title and
the chart from `teaseValue`, blurred, no cards.

**The chart is HTML and only the two glyphs are drawn**, which is why this
figure builds its own stage instead of taking `figureHolder` from `shared`, and
why `.result--locked .headsview__chart` exists in the stylesheet beside the
rule that blurs every other figure's `svg`. A name and a number inside an SVG
scaled to the width of the card is twice the size on a desktop that it is on a
phone, and no font size serves both — the sea's legend and the climb's bars put
their words in HTML for the same reason. The glyphs are fixed in size and say
nothing the bars do not: a glyph that also carried a value was one more thing
to decode, and they are the whole of the theme's flavouring. Each is drawn in
its own half's colour — **except the bulb's glass and filament, which are
`BULB`**, a warm yellow, since a bulb whose glass is the same cool blue as its
cap does not read as a bulb at all; the cap keeps the blue, so the emblem still
answers to its bars, and `--glow` (the light behind a glyph, `.headsview__glyph`
in the stylesheet) follows the glass rather than the half. The yellow is warmer
than the gold everything earned is written in and sits on no bar, so it cannot
be read as a channel picked out.

It was **a head in profile with a bulb above and a heart below**, joined by
cords with a seeded knot in each as big as the interference — and before that
two heads facing each other with a tangle round each organ, which is why the
file and its functions are called heads. Both went in September 2026: four
numbers bending one drawing is a picture nobody can take a number back out of,
and the bars underneath were saying the same thing a second time. The two ends
of all four bars, drawn as two more pictures under a line of their own
(`QUIET`, `FULL`), went with them — a labelled bar needs no calibration
alongside it. Gone with the drawing: `cord`, `PROFILE` (Mcbdixon's "Profile
Silhouette 02", Wikimedia Commons, CC0), the seeded generator and the gradient
id counter.

**Where you stand.** The Opinions level (`opinions`) closes on one figure for
its two scored questionnaires (`renderStance`, in `js/figures/stance.js`;
`STANCE_OF = ["cmq", "views"]` — the level's statements being one questionnaire
since September 2026 — rendered where the first of them falls in `RUN` and
skipped where the other would, the heads' pattern
— `STANCE_FIRST` in `results.js`, `ready()` the check that every dimension is
answered). Two parts, a vote each. **The plane** is the political compass
redrawn on axes named for what they are about: Sharing to Markets across (the
BSA-derived left-right scale, turned so that sharing is on the left where the
convention puts it) and Freedom to Order up (the BSA-derived
libertarian-authoritarian scale). Four quadrants glowing out of their own
corners in colours of the app's palette and no party's, the quadrant the
person is in lit, a graticule, the average person as a dashed ring with a
thread from it to the person, and the person as a point of gold with a ring
beating out of it (`stance__pulse`, the second loop a card carries). The four
poles are HTML round the drawing (`.stance__map`, a grid that puts the side
poles under the plane on a phone); only the four corner tags are SVG text.
**The corner tags are mottos, not names** (September 2026; they only said the
two poles again before): "protect & provide" (order and sharing), "reward &
rules" (order and markets), "fair & free" (freedom and sharing), "choose &
compete" (freedom and markets) — what that corner puts first, two alliterating
words either side of an ampersand, in about eighteen characters, which is what
fits. The Order pole reads "rules and
respect for them", and the readings "keeping the rules" and "want the rules
firmly kept": "tradition" was taken out of all three as the more loaded word.
**No quadrant carries the name of an ideology** and nothing says left, right,
liberal or authoritarian: a name over a region is a verdict on whoever lands
in it. One sentence reads the point back (`readingOf`, from which side of the
middle each axis falls, a band of `BETWEEN` either side counting as between),
then "Does this match where you stand?" filed under `STANCE_KEY`, `Stance`.
**The spectra**, under "Other views" (and nothing else: the sentence that
introduced them went in September 2026, with "Beyond the map"), are the other
seven dimensions as a line each between two words — Trust to Suspicion (the
CMQ), Equal chances to Equal outcomes, Preserve to Enhance, Nurture to
Nature, Growth to Planet, People first to Animals too and Purpose to Beauty
(the custom scales) — with the person marked in gold, the average ticked and what each end
means under the line; the tooltip says what the line is about and nothing
about the items (the heads' rule). "Do these match what you believe?" is filed
under `BELIEFS_KEY`, `Beliefs`. **Every position is a reach along its own
scale, never a standing** — nothing here says "higher than 70% of people", the
norms being placeholders — and the average person is drawn from those norms
all the same, as every figure's is. The self-placement is read by nothing,
and nothing on screen says so any more: a line at the foot did, and went in
September 2026 as apparatus. The badge is a crop of the plane round the point, kept inside the
plane (`youAt`, clamped in `renderBadge`). Locked: the title, the plane and
the spectra from `teaseValue`, blurred, no votes. **The plane is in the
landing page's showcase** (23 September 2026, the author's call; it was kept
out until then, on the grounds that a political plot before the consent form
says what kind of study this is before the form does): `.stance__map`, the
plane and its four poles, each pole its one word, the gloss under it hidden
by `intro.css`, which also re-lays the grid to fill the frame.

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
that could be one of two — skips the predicts line with them. The **star sign** is read from the birth month and the day, against
that month's cusp (`starSign`, from `BirthMonth` and `BirthDay` through
`engine.answer`; the twelve cusp days are `CUSPS` in `theories.js`, since a
figure reaches nothing in `content/`), so it comes from the birthday and
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
general pick that `voteButtons` is now built on. Without the day ("I'd
rather not say", value 99) the star card names the two signs it could be and predicts
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
whole-run web, the body, the temperament plane standing in for the sea, the
opinions plane with its poles, the wheel and the compass — one at a time in
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

**What the level was worth.** Under everything a level opened, and under a
line of its own, one question that is about the test rather than about the
person: "How did you like this part of the test?", answered on five
stars (`starRating` in `results.js`, `.rating` in `results.css`). It is drawn
at the end of `renderResults` and so arrives in the results panel as well as
on the level screen, but **never on a locked one** — there is nothing yet to
think of — and so never in a teaser or on a fork card either, both of which
render through the locked path. It is **not a `.result`**: a card would count
towards `markLone` and name every section on a one-section level. It is sealed
and opened with the way on rather than with the sections (`sealSections`,
`unfoot` in `openSections`), since it asks about what has just been read.
Hovering lights the run of stars up to the pointer without standing for
anything, and pressing the star already given takes the rating back the way a
vote unvotes. **Giving one is the only thing on the page a spray comes out of
that was not earned**: the run of stars swells a beat apart (`star-pop`, the
delay written on each as `--beat`) and the one pressed throws the same gold
`burst` a results section opens with — taking a rating back throws nothing,
since nothing has been given. The pop class is taken off again on
`animationend`, or its last frame would hold the star against the lift it
gets on hover, which is the general trap noted below. Nothing asks for it, nothing is held shut by it, and no score,
norm or level opening goes near it. It is filed under the level screen's own
key, `Level_<N>` (see **The level screen is an item**), because it is a
reading of that screen rather than of any one questionnaire on it — so the
same key carries the screen's item in `items[]` and its stars in `ratings`.

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

**The level screen is an item.** It is put in front of somebody, it is read,
and it is left by pressing something — which is everything an item is, so it
is saved as one (`levelItems`, made beside `scoredLevels`; `levelItem(n)` is
the lookup). One per scored level, keyed `Level_<N>`, and each stands in
`items[]` **after the last item of the level it showed**, which is where the
person met it — `container()` splices them in on the way out. Its
`timeOnset` is stamped when the results are uncovered (the `open` callback
of `curtain()`, which is also where the item is held from before a fork
moves on) and its `timeResponse` when the way on is pressed, so **the two
are how long that level's results were read**: the one place the file
measures that. Its `response` is the way on that was taken — where the level
ends in a fork, the level chosen and then the one passed over, in the words
the cards carried (`takeFork`; level names, not block lists, since an item's
response is what was read on screen), and otherwise the words on the one
button, `leaveLevel()` writing them the way `passBriefing()` writes a
briefing's, arrow and all ("Continue the test →", "Go beneath the floor →").
All three are null until the level is reached, so the shape never changes,
and an unscored level has no screen and no item. **Reopening a level's
results afterwards goes through its panel and is not counted** — the onset
is stamped once, on the screen, and never re-stamped. Nothing here goes near
`qualityControl`, which counts the items of `questions` alone (`askedIn`),
and a screen carries no `dimension`, so no scoring can see it. Its key is
also what the stars given to that level's results are filed under (`ratings`,
see **What the level was worth**), since they are a reading of the screen and
not of anything on it.

**The taste of the next level.** The way on carries, above its button, a
blurred preview of the level it leads to (`renderTeaser`, into `#level-next`):
"Next" large, "Level 2 · Brain-Body Axis" small under it, and the figures that
level will open — the same locked rendering a stop's panel shows, drawn from
`teaseValue`, with the `.rows`, the `.taste` note and the panel's "Locked"
badge taken out afterwards, and in their place one badge over the middle of
each figure saying how many answers still stand between here and it ("37 more
answers to unlock"). A blurred figure is the hook; ten blurred rows under it
only look like a page that failed to load, so a questionnaire with no figure of
its own would be an empty card and is dropped (none is, now that the FIPI has
the two old theories and the `regulation` block has its chart; the check stays for the next
one written rows-only). It
lives in `.level__foot` and not in `#level-results` on purpose: nothing seals
it, sprays it open or counts it as won — it arrives with the button, as part of
the way on. `completeLevel` finds the next *scored* level, so the last of them
is followed by nothing here and the holder is hidden. Everything that keeps a
locked panel honest keeps this honest too: no tooltip on a teased point, no
pointer events in the body, the count where a number would be.

**The drawn order.** A run of levels wrapped in `shuffle()` in the timeline is
asked in an order drawn once, when `content/timeline.js` is read, and nothing
about it is ever offered or chosen — the fork's rearrangement made *for*
somebody rather than *by* them. Currently that is the three levels after
General: Brain-Body Axis, AI Expertise & Usage and Mood & Health, so the MINT,
the BAIT and the HiTOP-BR are met second, third and fourth in whatever order
the draw falls. They are the mandatory core of the study the app is being run
for (see `ethics/mint_followup/`), and a fixed set wants counterbalancing, or
one instrument is always met fresh and another always met tired.

**It is the same `shuffle()` that puts two blocks of a level in a random
order**, one list up, which is why `TIMELINE` ends `.flat()` and why nothing on
a level says which run it belongs to: what is drawn and what is chosen is
visible in the shape of the list. **`app.js` has no part in it** — by the time
the engine reads `TIMELINE` the levels are already in an order, and a drawn run
is indistinguishable from a written one. That is the whole of why it is done
here rather than there: which levels are counterbalanced is a property of the
study a run is asking, and the engine has no business knowing about it.

**`shuffle()` draws nothing outside a browser.** `data/synthetic/codebook.js`
reads this file too, and `docs/build_slides.py` reads the deck's Content table
through it — both describe *what is asked* rather than one draw of it, and a
level number that changed every time the table was built would change the
published table under the link the ethics application points at. The written
order is the representative of all of them. (It also settles a flap that was
already there: the `mood`/`health` block shuffle used to vary between codebook
runs, harmlessly, since it moved no cell of the table.)

**The fork.** Levels written `fork: true` in the timeline are the one place
the run's order is the participant's. It is **everything under the drawn
core**: levels 5 to 10, six levels for six places. Levels 1 to 4 are not its business — the test has to open somewhere,
and everybody meets the mandatory three before choosing anything — so the
whole of the descent below them is arranged a step at a time. Where the seabed
falls is no longer a property of any of them (see **Beneath the floor**), so
which of the six are met in the rock is partly the person's own doing.

**The places a fork's levels take are its slots.** `FORK` (top of `app.js`,
null when a battery leaves fewer than two of them) holds `slots`, the level
numbers carrying the flag, and `at`, the index of the slot the coming choice
fills; `forkAfter(level)` gives it back when its next slot is the level after
this one and more than one is left to fill it with. **The flag is a boolean,
so there is one fork at most** — it was a name shared between levels until
September 2026, which allowed several independent forks that nobody ever
wanted and meant carrying a name only ever compared against itself. So the five choices fall at the ends of levels 4 to 8, the sixth place
is filled by whatever is left, and levels 9 and 10 are left by the ordinary way
on. A fork is never offered twice for one place: going back into a level and
finishing it again gets the teaser. **The slots need not be next to each
other** — the fork happens to be contiguous, but the machinery does not require
it, and `swapLevels` is written as a swap of two places rather than a shuffling
of one run so that it never has to.

On finishing the level before a slot, the way on is not one teaser and a
button but "What next?", a line asking which part of yourself to test next,
and **two cards side by side, what stands in the next two slots**
(`renderFork`, `.level__paths`, `.level__path`; stacked on a phone) — always
two and never a menu: the one passed over falls to the slot after and is
offered again against what stands beyond it, so a person who keeps refusing
the BAIT meets it at every choice until it is the last one standing, at the
bottom of the rock — each the teaser of one level, `renderTeaser` handed the
level's *name* as its large word, since the level's number is not yet decided,
and no title line, its `.result` stripped of border and background so the card
is the one box — with a "Go this way →" button under it, the two cards
stretched to one height so the buttons line up, and **the one written first on
the timeline marked "Recommended next"** with a thin gold line round it
(`.level__path--recommended`), the default order made visible and nothing
louder; `#level-continue` is hidden while the fork is up, and the spray at the
end of `openSections` comes out of whichever buttons are showing. It is there
so that the descent is not one straight line, and nothing else: the two are
shown in a random order (`shuffle`, drawn when they are offered, so the
recommended one is not always on the left), and the choice teaches the engine
nothing about the person.

**The choice on the floor level is a fork like any other**, so the way on
there is two cards rather than the "Go beneath the floor →" button, and
nothing on them says the water is about to end. The crossing still fires —
`leaveLevel()` reads `levelShowing === floorLevel`, not what was pressed — so
the person chooses what to do next and *then* the water ends over them, which
is the right way round: the choice is about what, the crossing about where.

Pressing a card is `takeFork`, and **a choice is a swap of two places**
(`swapLevels`). **What is asked moves and where it is asked does not**: `name`,
`blocks` and `written` cross over between the two `PLAN` entries, while the
level's own number — and so its depth, its colour on the gauge and whether it
is under the seabed — stays with the place. The move is then made everywhere
the order is held at once: the `PLAN` entries, the two contiguous runs of
`questions` spliced past each other (the later one first, so the earlier index
stays good), `RUN` rebuilt from the new order, and `level` re-stamped on every
item moved (the same objects `authored` and `dimensions` hold, so the scoring,
`onLevel`, the gauge and the results all read the new number off them). Nothing
in either level has been answered when a choice is offered, so no answer moves;
`index` is set to the first shown item of the place now being entered, and the
stops on the gauge take their new names (`labelStop`, which `buildSidebar` also
uses — a stop's number and depth are its place on the line and do not move, its
name is the level behind it and does). Then `leaveLevel()`, the same way out
the one button takes.

**The written order is the default**: what the recommendation follows (each
`PLAN` entry carries `written`, its place on the timeline, for that), what a
battery that leaves one level of a fork falls back on (the fork then dissolves
and that level is asked where it falls), and what a synthetic run walks. The
constraints are checked at the top of `app.js` and throw: a fork is two levels
or more, every slot is a scored level, and every slot that is *chosen for*
wants a scored level before it to be offered from. The last slot is filled by
what is left rather than chosen for, and so is the first when a battery leaves
a fork standing at level 1 — there is nothing before it to be offered from, so
`at` starts at 1 and that place is taken as written. **A choice is saved as the
level screen's own answer** (see **The level screen is an item**, below): it is
one of the two things a way on can be, and is written onto the item of the
level it was made on rather than into a record of its own — `forks`, an object
beside `levels` holding `offered` / `recommended` / `chosen` / `timeChosen` per
choice, went in September 2026, having said what `levels` already said. What is
no longer recorded is which of the two cards was on the left: the shuffle is
drawn afresh each time and nothing reads it back. `levels` and `questionnaires`
say the order that was actually walked (see **Saved data**), which is what a
level number is read against — and the choices replay from it, given the
written timeline, so the responses are a convenience and a check rather than
the only record.

**A lone section goes unnamed.** `markLone()` runs at the end of
`renderResults` and of `renderTeaser`: when a level (or a teaser) holds one
`.result` only, it gets `.result--lone` and its name across the top is hidden,
since the level screen's `#level-name`, the panel's title and the teaser's
"Level N · Name" line have already said what it is. A level of two or more
sections keeps a name on each, because there the names are what tell them
apart. Every level is one section now (the HiTOP-BR's went in September 2026, the
five neutral primals in the same way soon after, the PHQ-4 and HiTOP-BR are one
climb, and the `regulation` block's three are one chart), so the rule is idle until a second
one is written.

**The back button.** The browser's own is a thumb going for the previous item,
and a run is held in memory alone — leaving is losing it. Once the survey is up,
`trapHistory()` pushes one spare history entry and the `popstate` handler puts
that entry straight back every time the button eats it, so back never leaves the
page: it closes a panel if one is open, and otherwise is `goBack()`, which holds
while a level screen is up or the run has ended and stops at the first item. The
entry is pushed on a click, so Chrome does not treat it as one to skip past.
Before the survey (the intro, somebody else's card) nothing is pushed and back
is still the way out, since nothing has been answered that leaving would cost.
`pushState` is called with no URL, which keeps `?sub=` and `?test=true` on
it. That and the `replaceState` on leaving a shared card are the *only* two
places the page touches history — a press can then only ever mean one thing, so
keep it that way.

**Screens vs panels.** `showScreen()` swaps the base screens (intro, survey,
level, done) — one at a time, inside `<main id="app">`. The bar's buttons
instead call `openPanel()`, which slides an overlay panel over whatever is
showing; the base screen never changes. Panels live in `#overlay`, outside
`<main>`, which stops short of **both** bars (`inset: var(--banner)
var(--sidebar) 0 var(--shelf)`) so either stays reachable with one open. The
bar links open `.panel--right`. A level
opens `.panel--left`, which is also `.panel--summoned`: it does not slide but
*grows out of the button that opened it* — a stop on the gauge or a badge on
the shelf, whichever was pressed (`openResults(level, from)` keeps it as
`openFrom`) — and is sucked back into it on the
way out, so that button reads as where the level is kept. `markOrigin` is
handed the element rather than the level for exactly that reason. It writes that
button's centre onto the panel as `--from-x` / `--from-y`, the origin its
scaling turns about, measured against the overlay — the panel's own box is
scaled down to nothing while it is shut and is no use for the sum. The level
screen leaves the same way (`suckLevel`, `.screen--sucked`) — into the badge
the level has just minted, where there is one, so what has been read goes onto
the shelf, and otherwise into its stop. Scrim click, the × and
Escape all close — and so does the button that opened it: every way in is also
the way out.

**Banner, gauge and shelf.** The `.banner` across the top carries the name of
the test and nothing else. Under it the page sits between two bars: the
`.sidebar` down the right, which is where the descent is going, and the
`.shelf` down the left, which is what it has turned up (see **The shelf**).
The gauge is dressed as a **dive gauge** (`renderSidebar`): the readout of the
metres, laid over the top of the gauge to the right of the line rather than
above it, so the line starts at the banner's lower edge with no gap; the
descent running along the sidebar's left edge, the edge the page sits against,
graduated with a mark every kilometre (`.sidebar__line::before`, spaced by `--km`, which
`buildSidebar` writes from `DEEPEST` so the number lives in one place), then
the Data button at the foot, an inline SVG icon and a word — the Profile
button that stood beside it is now at the head of the shelf. The
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
read yet. A stop opens `openResults(level)` finished or not, and is the only
way into a level that is **not** finished — the shelf carries the finished ones
only. **The fill and the stops are placed by custom properties**,
`--reach` and `--at`, not by an edge: the stylesheet decides which axis they
run along. On a wide screen the gauge is down the right and they read as
heights; **below 760px the whole gauge lies along the foot of the screen**
(`--sidebar` is then its height), the same pieces in the same order turned to
run left to right, the cards opening upwards, the icons alone without their
words. `.overlay` stops short of it either way. Banner, gauge and shelf are all
hidden on the intro and card screens; `--banner`, `--sidebar` and `--shelf` are
their sizes and the body is padded clear of all three (with extra width on the
gauge's side for the stops, which sit out over the line).

**The shelf.** The bar down the left is the gauge's other half: the gauge says
how far down the descent has got, the shelf says what it has turned up. It
opens with nothing on it but the way into the profile at its head, and every
level finished **mints a badge** onto it (`renderShelf`, `mintBadge`) — a
square of the level's own colour with a crop of the figure that level closed
on in it and the level's number in the corner. It is there so that the run
accumulates something to look at rather than only filling rings in, and the
badges are a collection: they arrive one at a time, in level order, and stay.

**The profile at its head is a badge too** (September 2026): the same rounded
square, with a ring round it that fills clockwise as the whole-run web is
drawn — `--share` on `.shelf__link`, the same registered property a stop on
the gauge sweeps and in the same units (0 to 100), written by `renderShelf`
from `results.profileShare()`, which counts the `PROFILE` dimensions that
have a score. The ring and the note under the web are therefore the same
count and cannot disagree. Full, it closes in gold (`.shelf__link--whole`),
the way a finished level's stop does. The bar and the badges on it were
widened at the same time (84 → 108px, 54 → 74px square, and the two narrow
and short window sizes with them): a badge is a crop of somebody's own
drawing and was too small to be one.

A badge is a **second way into the same panel its stop opens**, and the two
can never disagree, both being read off `levelProgress`. `renderShelf` is
called at the end of `renderSidebar` rather than beside it — a level finished
lights its stop and mints its badge, which is one fact with two faces, and
nothing then has to remember to call both. It **reconciles rather than
rebuilds**: a badge costs a whole results section to draw and throw away, this
runs on every answer, and a badge nobody has touched should not be replaced
under the pointer. A badge is only there while its level is finished — going
back and changing the answer a branch hangs off can take a level's last answer
away with it — and `place()` puts one back in level order rather than on the
end.

Minting is **the only thing on this bar that moves**: the badge is struck
(`mint`, scaling up through a gold flash) and throws the same gold `burst` a
results section opens with, because it arrives for having finished something.
The class comes off on `animationend`, guarded on the event's target, since
the figure inside has animations of its own and the last frame of `mint` would
otherwise hold the badge against the lift it gets on hover.

**Below 760px the shelf turns the way the gauge does**, but along the *top*,
under the banner, with the profile at its left end and the badges collecting
away from it, scrolling sideways behind a fade at the edge: width is scarcer
than height on a phone, and the foot is already the gauge's. `--shelf` is its
height there rather than its width.

**What a badge shows is a crop, not a thumbnail** (`crop` and `renderBadge` in
`results.js`): a square of the figure's *own coordinates*, redrawn into the
badge at full sharpness, so it is a detail of the person's own drawing — the
ring round the head, the pool the torch throws, the hub of the wheel — rather
than the whole figure shrunk to 54 pixels, which is a smudge. `renderBadge`
follows the same dispatch `renderResults` does, at the size of a token: the
first of the level's questionnaires to name a figure is what the level looks
like, and the drawing is pulled back out of the section that figure builds,
the way `renderShowcase` does it. The crop numbers are written against the
constants the figure file draws with, so **a figure that moves its own
geometry moves its badge off the interesting part** — which is what happened
to the body the first time, and reads as a badge full of the words that sit
beside it. The soma is the one whose crop is *found* rather than written: its
figure is as deep as the readings beside it need, so the head is taken off the
first ring on the drawing.

Two levels have no drawing to crop and hand back an **emblem** instead, a
`.shelf__badge-emblem` built in their own file: the BAIT's robot
(`archetype.badge()`), whose section is a line of words under an emoji, and
the `regulation` block's bulb and heart (`heads.badge()`), whose chart is HTML
and whose bars are names and numbers that cannot be read this small. The
heads' emblem is the one badge in the app that says which level it is rather
than what the answers were, and that is the price of a figure that is not a
drawing. Level 1 hands back an emblem too, but a read one — **the star sign's
glyph**, the one reading in the app that is already a single mark — falling
back to the temperament plane where there is no birthday to read a sign from.

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
MINT dimensions, the PI-18's Safe, Enticing and Alive, and the ICAR-16's four
cognitive styles — sixteen axes (Stress was one more while the PCL-2 was
asked). The rule is derived rather than listed
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
runs from less of something to more of it; and the three questionnaires of the
`regulation` block, sixteen dimensions that would double the web; and the
questionnaires of the `opinions` block, whose six would crowd it and whose
content — a person's politics — has no place on a card made to be shared) keeps its
dimensions off it however many norms they carry; and a questionnaire written `profile: true` (the
ICAR-16) puts its dimensions on it *without* norms, each drawn as a reach
along its own scale — a share of items right — which is the one opt-in, there
because the compass names all four under their own names. **The average
person is drawn where there is a mean and not where there is none**: closed
when every axis has a norm, and otherwise as dashed segments between
neighbouring axes that have one, leaving a gap across the reasoning's four
rather than a line through them that would put an average where nobody has
measured one — on the web (`drawSpider`) and on the card (`drawCard`) alike.
So a
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
test underneath it. The link ends `&source=shared`, so a run begun from it is
filed as one (see **Where it was handed out**).

**Sharing a level** (23 September 2026). Every level whose results are open
carries, under its stars and sealed and opened with them, **Share these
results**: "Copy link" and "Copy as image" (`levelShare` in `results.js`,
`.levelshare` in `results.css`). It is drawn by `renderResults` itself, so it
is on the level screen and in the level's panel at any time afterwards, and
never on anything locked. **The link** is `?card=1&level=<level key>&s=Name~value,…`
with every scored dimension of that level (drawn or not, since a figure may
read one it does not name), plus, for level 1, `m=` the birth month and `d=` a
day on the same side of that month's cusp — the 1st or the 28th, 99 for "rather
not say" (`birthdayStandIn` in `theories.js`) — so the star sign reads back and
**the real birth day never goes into a link**; and `source=shared`. The level
is named by its `key`, which is the same level for everybody, and
`readLevelLink` finds it again in the visitor's own run, keeping only that
level's dimensions and numbers inside their scales. The visitor's page is
`screen-card` again, the level's own `renderResults` drawn through `visit` (see
**The seam**) with the stars and the share taken out and every vote and every
`*__ask` line hidden (`.visit__results`): the same figures, readings included,
worded to "you", which the note above them explains. **The image** is the
level's results as they stand, through `snapshot()` (`js/snapshot.js`), with
the same things left out (`NOT_SHOWN`), on the card's dark with the test's name
and the level's over it and the way to take it under it (`levelPicture`). It
goes on the clipboard as a PNG where the browser allows it and is saved as a
file where it does not. Neither records anything, and neither is in the saved
file. **A new figure wants its picture looked at**: `snapshot` copies computed
styles, which covers nearly everything, and the one thing found that computed
styles do not say (an auto margin on a grid item) needed a special case.

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

**Beneath the floor.** **Where the seabed falls is a share of the levels and
not a flag on any of them**: `WATER_SHARE` in `content/timeline.js` is 2/3, so
the first two thirds of the scored levels are swum down and the rest are cut
through the rock — seven and three in the whole run. It was `beneath: true`,
written on the last two levels, until September 2026; a share holds its place
however many levels a battery asks, and, now that the fork reaches from level
5 to level 10, it is the only way the break can sit still while what is asked
either side of it moves. **Which level is the floor is the descent's business
and what is asked there is nothing to do with it.** The water levels share the
trench between them and reach its floor together, so level 7 finishes at the
bottom of the Challenger Deep whatever it turned out to hold, and the levels
beneath go on into `BEDROCK` metres of rock (7,000, about the thickness of the
oceanic crust), shared the same way. `waterLevels` and `rockLevels` are the two
halves of `scoredLevels`, `beneath(level)` asks which half a number is in, and
`floorLevel` (the last level in the water, whose way on goes through it) is the
join; `levelDepth` and `metresReached` read them, and `sounding()` writes a depth past the floor
as "seabed + 2,400 m" (or "+2,400 m" in its `short` form, which is what the
gauge's readout has room for). Four things follow from the one share and
nothing is written twice: the water column behind the page ends in a line of
silt and rock warming towards the mantle at `--floor`, which `app.js` works out
from where the seabed actually falls in this run and writes onto the root —
every stop in that gradient is placed against it with `calc`, the water's as
shares of the way down to it and the rock's as shares of what is left, so the
picture cannot drift from the arithmetic (`body::before`, `style.css`; the
window shows 100/420 of the column at a time and the silt rises into the bottom
of it halfway through the last water level, which is the sum that used to be
the hand-tuned 79%); the
curtain on finishing the floor level says "· the floor" and on finishing a
level beneath says "into the rock"; the way on from the floor reads "Go
beneath the floor" instead of "Continue the test"; and pressing it goes
through **the crossing** — `gaze()` again, the layer that closes over the way
in, handed `CROSSING` ("The water ends here. / The descent does not.", the
floor's depth for a byline) and dressed `gaze--rock` (no eye, warm dark), so
the first item beneath comes up out of it the way the first item of the run
does. **It carries a sentence under those two lines** (`said`, into
`.gaze__said`; September 2026): "Everything above this was the surface of
you. What lies under it is what the rest of the descent is for." Without it
the crossing is a beautiful animation between two questions that nobody can
read a meaning off — the point of it is that a threshold was passed and that
what is under it is the part worth staying for, and the two big lines say
where but not what. Only a set of words carrying a `said` shows the line:
the way in is a quotation and explains itself, and the core has nothing left
to promise. A layer with one is held `GAZE_READ` (9.2 s) rather than
`GAZE_HOLD` (6.6 s), a sentence wanting reading rather than glancing at; a
click or a key still cuts either short. `gaze()` writes the words it is handed over the Nietzsche line in the
markup and leaves them; the way in comes first and only once, so nothing
reads them back. The descent *share* — the gauge line, `--descent` — still
gives every scored level the same length, water or rock; only the metres
change.

**The water.** `body::before` is a column of water several windows tall —
sunlit at the top, near black at the bottom of the water, and under that the
floor and the rock (see **Beneath the floor**) — and `--descent` (0 at the surface,
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
this is and whether it counts — then `battery` — the preset the link named,
or null (see **Batteries**) — then `source` — where the link was handed out
(see **Who is taking it**), `"Unknown"` where it named none — then `levels`, the levels of this run in the order walked, each its `key`, its `name` and its block list, which is what makes a `timeLevel<N>` or `qualityControl.<key>` below readable on its own — the key being what the file is written under and the name what the person read, so one can always be turned into the other, and `questionnaires`, the questionnaire keys in the order asked (`RUN`; the items' own `order` is theirs) — then `timeStart`, a `timeLevel<N>` per level —
when that level was last left with nothing outstanding, stamped in `answer()`
rather than on the level screen, which the last level never shows — `formatMint`,
`qualityControl`, then `items[]`
(`key`, `questionnaire`, `order`, `response`, `timeOnset`, `timeResponse`) —
every item of the run **and every level screen** (`Level_<N>`, see **The level
screen is an item**). **`questionnaire` is the instrument that asked the item**
(September 2026): without it, asking whether somebody has a complete PI-18 means
knowing which keys belong to it, and the keys do not say — the `singles`
questionnaire alone holds eleven different prefixes and `Demographics_` spans
three, so a prefix is a guess and not a mapping. It is what the flatten walk
already stamped on the item, so nothing is worked out twice. A level screen and
a briefing belong to no questionnaire and carry `null` rather than leaving the
key out, since a field present on some items and absent on others is a shape an
analysis has to guard. Then `feedback` —
**every key of which is always written**, `null` until somebody votes on that
reading and `null` again if they unvote it, so a run that stopped at level 2 and
one that went to the end have the same shape and an analysis never has to guess
which columns to expect. The keys are `feedbackKeys()` in `results.js`, derived
the way `renderResults` decides what to draw, and `makeResults` writes them into
the object app.js hands it — and last `ratings`, the stars each level's results
were given (see **What the level was worth**), written the same way: one per
*scored* level, `null` until somebody rates it and `null` again if they take it
back, so an unrated level and an unreached one read alike. **They are keyed by
the level's `key` — not its number, and not the name on screen**
(`ratings["Character"]`, `ratings["MoodHealth"]`). A number is a place in one
person's run, and the run is drawn and partly chosen, so `Level_5` is Character
for one person and Reasoning for the next — a column of numbered ratings holds a
different level in every row, which is not a column. **And a name is prose.** It
is what the gauge, the level screen and the results panel call the level, it is
written to make the test engaging and is free to be reworded for that, and it
may hold an ampersand, a hyphen or an article — "Mood & Health", "The World" —
none of which a column name can keep. So each level carries a `key` in
`content/timeline.js` beside its `name`, the way a questionnaire and an item do,
and the key is what the file is written under. The set of keys does not move
when a fork swaps two levels, since the key crosses over with the level the way
the name and the blocks do (`swapLevels`). `levelKey` in `app.js` is the one
place that is decided, and it is handed across the seam as `ratingKey` so that
`results.js` asks rather than works it out; a level with no key, or two levels
sharing one, throws at build time, since their ratings would silently merge.
`levels` in the saved file carries both, so a key can always be read back as a
name. The level screen's own item in `items[]` keeps its
`Level_<N>` key, an item key being an item key — `levels` is what joins the two. `response` is
what was read on screen, not the code behind it — `said()` gives back the
option's own text ("Male", not 1), so a saved file is legible without the
codebook. An option with no label of its own (a numbered circle) and a typed
answer are saved as given. Scoring still works off the values in `responses`;
only the file carries the words. Computed scores are deliberately **not** saved
— they are derived at analysis time.
`timeOnset` is re-stamped whenever the item is shown again, including on closing
a panel that covered it, so the gap to `timeResponse` stays a reaction time.

**Where it goes.** To DataPipe (`pipe.jspsych.org`), which files what it is
sent in the repository the experiment ID is bound to — here a Zenodo deposit
(`DATAPIPE`, `DATAPIPE_EXPERIMENT` in `app.js`; experiment `C2mDNSFM3jAJ`,
deposit `zenodo.org/uploads/22882899`). **The same run goes twice over, in two
different ways, and it is the second that counts.** It is one section of
`app.js` and the whole of what talks to the outside world.

**As it is answered**, one record at a time, into a staging database of
DataPipe's own. About fifteen minutes after somebody stops answering, DataPipe
writes what it is holding for them into the deposit as a `.partial.json`.
Nothing here has to notice the leaving — the connection itself is what says
they have gone — so a tab closed halfway down the descent leaves the half that
was answered rather than nothing at all. **That is the whole reason for
streaming**: the run is thirty or forty minutes long, and until September 2026
a run left halfway saved nothing (see the parked note this replaced, below).

**At the end**, the whole of `container()` in one piece, exactly as the
download button would save it, so the two can never disagree — and carrying the
session's id, which is what tells DataPipe that the records it has been holding
belong to a run that finished, and are to be dropped rather than filed as a
partial beside the complete one. `saved()` writes the outcome into `#save-note`
on the last screen — sending, saved, or failed — and goes on `result.ok` alone.

**The download is no longer offered** (September 2026). It was two buttons: one
under the save note on the last screen and one at the foot of the Raw results
panel. The run now saves itself, every answer as it is given and the whole file
at the end, so there is nothing for a participant to keep and an unexplained
"Download responses (.json)" only invites the question of why they would want
to. The panel's went outright — nothing has failed there, and the file is on
screen to be read — and the last screen's is written `hidden` and uncovered by
`saved("failed")` and by nothing else, since a send that did not land is the
one case where the answers are still in the page and need a way out of it.
`download()` itself is unchanged and is what that one button still calls. An agree/disagree or a star given on a
level reopened *after* the end is the one thing the sent file can miss; that is
accepted, since a filename is taken once and a second copy would be refused.

**Two kinds of record go into the staging database**, and each says which it is
in a `record` field the finished file has no equivalent of:

| | |
|---|---|
| `frame` | **the saved file with `items` taken out of it** — who is taking it, the order the levels were walked in, the level times, the quality control, the votes and the stars. It is `container()` with one key deleted rather than a second thing built beside it, so a frame cannot drift from what the file would have said. One goes in when the run begins, one at the end of every level (`completeLevel`, the level's answers all in) and one as it is left (`leaveLevel`, with whatever was voted and starred on its results) |
| `item` | **one entry of that file's `items[]`**, found in the file rather than made again beside it, for the same reason. One goes in every time an item is answered (`answer`), a briefing is passed (`passBriefing`) and a level screen is left (`leaveLevel` — a level screen is an item, and is staged like one) |

**Read back, the last frame and the last record under each key are a container
with as much of a run in it as was answered** — sorted by the `order` each item
carries, which is the same `order` the file gives it. That is the whole of the
reassembly rule, and it is why nothing is ever staged in a shape the file does
not already use. Two things about it are worth knowing. An item answered a
second time — gone back to, or a branch closing behind it and taking its answer
with it (`pruneBranches` hands back what it cleared, so an erasure is staged the
way an answer is) — is staged again, so it is the **last** record under a key
that counts, and a branch closed after the fact reads as the null it ends as.
And a staged item is the entry *as it stood when it was answered*, where the
file's own entry is the entry at the end: an item shown again has had its
`timeOnset` re-stamped past its `timeResponse`, so a partial can carry a
reaction time the finished file no longer has.

**A frame that says nothing the last one did not is not staged.** The way on
from a level screen can be pressed more than once while it is animating away,
and the budget is a thousand records a session — not something to spend saying
the same thing twice. Items are *not* deduplicated: the same key answered again
is a new answer, even where it is the same answer.

**The staging is best-effort and can never hold the run up.** A session that
will not start warns in the console and disables itself, every call into it
swallows its own errors, and the file at the end goes whether any of it worked.
**The file at the end waits for the session to have *started* and for nothing
else**, and the close after it is not waited on at all. The session goes to
`saveData` as the `session` itself rather than as its id, and the client waits
on `session.ready()` — startup alone, not the staged writes, which go over a
database connection of their own and have their timers throttled to a crawl
behind a tab that is not in front. **That is the fix for the thing this app
raised**: the documented flush-then-read-the-id sequence left a run finished in
the background sitting on "Saving your answers…" for the best part of a minute
(tested 22 September 2026, in a hidden preview pane), and what stood here until
the client grew `ready()` was a flush raced against a four-second timeout, which
bought the same behaviour at the cost of sometimes sending the file without the
id (jspsych/datapipe#273; datapipe-client 0.2.0, 22 September 2026). Nothing
about the staging may cost the file, and now nothing can: the only thing between
the last answer and the send is a session handshake that a throttled tab does
not slow down. The flush that the race was for is `close()`'s own, on its way
out.
A session is opened when the **Start** button is pressed rather than when the
page loads — somebody who read the landing page and left is not a participant,
and a session held open for them is one of the five hundred an experiment may
have at once. `FILENAME` is worked out once, at load, and is both the name the
session is opened under and the name the finished file is sent under. It is
**`<when>_<source>_<participant>.json`** (23 September 2026; it was
`responses-[<battery>-]<participant>_<when>.json` before): the run's start time
first, so a deposit lists in the order runs began and a name is never taken
twice (DataPipe refuses one it has, and a `?sub=` code can come round twice),
then the source cut down to `[A-Za-z0-9-]` and 40 characters, accents off, so
that one study's files can be picked out of the list by eye, then the code. A
test run is prefixed `test_` in front of all of it, an underscore like the
other gaps in the name (`test-` until 23 September 2026, which
`data/collected/download.py` still reads as a test), and that prefix is what
it picks test runs out by. The battery is no longer
in the name — the source is what sorts a deposit by study now, and the file
still carries `battery`. The failed-send download is saved under the same
name.

**The client is `js/vendor/datapipe-client.js`, and it is the one file on the
page that is not ours.** Streaming is not a request anybody can hand-roll — a
session is a live Firebase Realtime Database connection, and what says a
participant has gone is an `onDisconnect` armed on it — so the library does it,
and the library brings the Firebase SDK with it (185 KB, most of the page's
weight). It is **kept in the repository rather than fetched from unpkg**, which
is what DataPipe's own instructions suggest: an unpinned CDN tag resolves to
whatever is published at the moment each participant loads the page, which is
third-party code changing under a running study, on a page that asks about
psychiatric diagnoses. Vendored, the code a participant runs is the code that
was reviewed, and the page still works with no internet but DataPipe's own.
**It is the one exception to "dependency-free"**, and it is pinned:
`datapipe-client@0.2.0`, from
`https://unpkg.com/datapipe-client@0.2.0/dist/datapipe-client.browser.global.js`,
sha256 `b2af030b…9774310c` (0.1.0, sha256 `a5ffee8d…d643a84`, until 22
September 2026). Updating it means fetching a new version by hand and writing
the new version and hash here. It is a classic script and defines one
global, `DataPipe`; its tag goes **first** in `index.html`, above `content/`,
since nothing else on the page reads it at load. **Without it the run still
saves**: `send()` falls back to the documented `POST /api/data/`, which is the
whole of the fallback — a file missing from a deploy should cost the staging,
not the data. What is lost with it is gzip and the background retry the client
does on the way out.

**Two things to know about the sending itself.** The API is the one documented
at `pipe.jspsych.org/docs/api`: `POST /api/data/` takes `experimentID`,
`filename`, `data` and an optional `sessionId`, answers 201 (stored) or 202
(queued, and to be read as success — which is why the code goes on the client's
`ok` rather than on the status), and refuses with 400 and an `error` code
(`EXPERIMENT_NOT_FOUND`, `FILE_EXISTS`, `INVALID_DATA`, `EXPERIMENT_FINALIZED`,
…; the three that were `OSF_*` lost the prefix in the September 2026 release).
That code is the whole of what says *which* thing went wrong, and it comes back
on the client's `body`, so a refusal is written into the console beside the
status rather than left as a status nobody can act on. **The name of the
experiment field is `experimentID` here and should stay that way**: the client
takes `experiment_id` too since 0.2.0 (jsPsych's own spelling, and the one its
README now uses) and throws if it is handed both with different values, but the
plain `POST` fallback is hand-built against the REST API, which documents the
camelCase name alone — one name in one file is worth more than agreeing with a
README.
And the limits the staging works inside are DataPipe's: 16 KiB a record, 1,000
records a session, 500 sessions at once, 24 hours a session, and 100 files a
Zenodo record — past 80 of them DataPipe zips the older ones into
`datapipe-batch-NNNN.zip` and keeps the five most recent loose, so a partial or
two a run is not a quota problem.

**"Saved" on screen means DataPipe took it, not that Zenodo has it yet.** A 201
is DataPipe accepting the file; the write into the deposit follows, and the two
are not the same moment. On 22 September 2026 a run said "saved", was looked for
in the deposit, was not there, and **was there later** — every one of the eight
files sent that day arrived in the end, and nothing was lost. The lesson is only
about *when*: a file can take longer to appear than it takes to go and look, so
**the deposit is what a run is counted from and the screen is not**, and a count
taken too soon is not a count. `data/collected/download.py` is what counts it.
Where a delivery does fail for good, DataPipe's dashboard keeps the queue
(`/api/queuestatus`, and the *Failed uploads* page its documentation describes
at `/docs/data/failures`); nothing in the app can see that, which is why the
gap between what was sent and what is in the deposit is worth watching during a
study rather than at the end of one.

**The deposit's three ages, in order: collect, finalise, publish.** While a
study is running the deposit is an **unpublished draft** — DataPipe makes one
and never publishes it — which means it is already private: only the account
that owns it can see it, and there is no DOI. That is the protection a study
wants, and it is the state the thing is in without anybody doing anything.
**Do not publish it while collection is running.** "Restricted" on Zenodo is an
access level of a *published* record, so restricting means publishing, and a
published record's files are fixed — DataPipe is writing into the draft, and
after publication there is no draft to write into. (That last step is
**inference rather than documentation**: neither Zenodo nor DataPipe spells out
what happens to submissions if the researcher publishes mid-study, which is why
it is worth not finding out during one.) So: collect with it private, then
**finalise** in DataPipe when collection has ended — which merges everything
into one archive and stops submissions for good, cannot be undone, and deletes
the loose files once the archive is verified — and only then publish on Zenodo,
choosing open or restricted access, which is what mints the DOI. Downloading
works in all three ages; the token is wanted for the first two.

**Getting the answers back** is `data/collected/download.py` and then
`preprocess.R`; see that row in the table above. **A saved file holds the words
and not the values** — "Male", not 1 — and that is settled rather than pending
(the author's call, September 2026): the words are what is wanted, a file that
reads without a codebook beside it is the point, and turning them back into
numbers is a scoring decision that belongs to the analysis. `preprocess.R`
therefore does not score and should not learn to; an analysis that wants the
values can map them through `data/synthetic/codebook.js`, which already reads
every item and its options the way the app flattens them.

**Levels are the experience, not the data.** A level is how the run is paced and
dressed for the person taking it, and its number is drawn and partly chosen, so
it means nothing across people. What an analysis groups by instead is
`questionnaire`, which every item carries, and `order`, which is where that item
fell for that person; `completion.csv` is that grouping already done. `levels.csv`
stays for reading a level number back where one turns up and for the per-level
quality control, and that is all it is for.

**Ethics, which is not a code question.** A partial file is data from somebody
who did not finish, and closing the tab is one of the ways a person withdraws.
What is kept of them is the author's call and the committee's — the app makes it
possible to keep partial data, not right to. **What the participant is told was
brought into line on 22 September 2026**: the consent form says, in its own
paragraph and again in the third consent statement, that answers are recorded as
they are given, that stopping partway leaves what was already answered, and that
an anonymous answer cannot be taken back once given. **The point of no return is
now the first answer rather than the last**, which is the one thing about this
study that changed for the person taking it. `ethics/mint_followup/application_draft.md`
was moved with it — B11a (how data are transmitted), B16 and B17 (what they are
told about withdrawing), and F1, which was the blocking issue and is now done —
and **the committee has not seen any of it yet**, which is the [CONFIRM] left on
B16. (What is staged is what the file holds: no answer leaves the page that
would not have left it at the end.)

**Done, September 2026: saving at every level.** What is above is what the note
that stood here asked for. It read: a run left halfway saves nothing, DataPipe
refuses a filename it has already taken (tested 2026-09-02), so a checkpoint
would mean one file per stage — six a run against a hundred a Zenodo record —
and *come back to this when the release that allows overwriting is out*. The
release came out and the answer was not overwriting: it was sessions, which
leave one partial file per abandoned run and none per finished one. The
experiment moved with it, from the `datapipe-test.web.app` beta and its
experiment `Elsjcjycb6ru` to production `pipe.jspsych.org` and `C2mDNSFM3jAJ`.

**Who is taking it.** Every run carries a `participant` code, twelve characters
drawn from an alphabet with no I, L, O, 0 or 1 in it — a code is read off a
screen and typed back. A link may bring its own (`?sub=`), for a prewritten list
or a platform putting its own id on the end: it is somebody else's text, so only
`[A-Za-z0-9_-]` survives it and only 32 of those, and what is left of an empty
or impossible one is a code of our own. It is also the last part of the
file's name (see **Where it goes**).

**Where it was handed out.** `?source=` says which project, experimenter or
page the link came from, and is written into the file as `source` and into its
name. It is never put on screen, so it may be words — letters of any alphabet,
digits, spaces and a little punctuation (`_.,:;/@()+#&'-`) survive, 200
characters of them — but it is somebody else's text like the code. **A real
deployment always names one**, so a link without it is saved as `"Unknown"`
rather than null: an Unknown in a deposit is a run nobody sent — a test, a link
passed on, somebody guessing the address — and worth a second look. The
links in `README.md` carry `?source=README`, so that a run begun from the
repository's front page says so, and every link a participant shares (the
card, a level) carries `?source=shared`, so that a run begun from somebody
else's results says so too. The source is read once, when the page loads,
which is why "Take the test yourself" can put the address back to bare
without losing it.

**Batteries.** A study need not ask the whole run. Which blocks a run asks is
resolved once, at the top of `app.js`, from the link and nothing else, and
the participant is shown nothing about it. `?battery=<name>` picks a preset
out of `BATTERIES` in `content/timeline.js` — a block list under a name, so
that a study's battery lives in the repository under a version rather than in
a URL somebody pasted, which is what a recruitment link should carry.
`?only=a,b` asks exactly those blocks and `?skip=a,b` everything but those,
by hand, for testing. Battery first, `only` over it, `skip` off it.
`?start=a,b` then reorders what is left (September 2026): the levels holding
those blocks go first, in the order named, with the named blocks first inside
them. **It moves whole levels and never splits one** — a level carries the key
its ratings and quality control are filed under, so a block pulled out on its
own would be a level with no key — so `?start=icar` opens on How You Think,
and `?start=singles` opens on General with the singles before the rest of it.
It asks nothing that was not already asked: a block the battery left out is
dropped with a warning (write `?only=mint,icar&start=icar` to have both), and
so is `closing`, which the run ends through. A level brought forward is taken
out of the fork (`fork: false` on its `PLAN` entry), having been placed by the
link rather than left to the person; what is left of the fork still forks, and
the drawn run keeps its draw among what is left. It is recorded nowhere but in
`levels`, which says the order walked as it always has. The names
are somebody else's text: only `[A-Za-z0-9_,-]` survives, a name that is no
block on the timeline is dropped with a `console.warn`, and an unknown battery
name asks the whole timeline. **Two things are not the link's to decide.**
`closing` is always asked, because the run ends through it: `advance()` ends
the run when the last item has nothing after it, so the last *scored* level's
results are opened from the item after them, and without `closing` they would
never be shown. And the blocks of `HELD_TOGETHER` (in `content/timeline.js`)
come and go as one — `mood` and `hitop`, since the climb is drawn from the
PHQ-4 in one and the HiTOP-BR in the other and `climbed()` never comes true
with half of them. The result is `PLAN`: the timeline with each level's
blocks filtered and any level left empty dropped, and everything in `app.js`
that read `TIMELINE` reads `PLAN` — the flatten walk, `levels`, `levelName`,
`beneath`, the forks — so a level's number is its place in *this* run, numbering stays
contiguous on the gauge, and the trench and the rock are divided between the
levels actually asked (a battery of water levels alone, or of the rock level
alone, divides by nothing — `metresReached` guards both). A battery that
leaves one level of a fork leaves nothing to choose, and that level is
asked where it falls with the ordinary way on. Nothing else
changes by design: `scoredLevels`, `PROFILE`, `feedbackKeys()`, the showcase
and the card all derive from what the run holds, so a smaller run has a
smaller web and a smaller set of feedback keys, which an analysis must expect;
the star card is skipped (`starSign()` returns nothing without the birthday,
and `feedbackKeys` adds `StarSign` only when `demographics1` is in the run,
`STARS_FROM`); the FIPI's opening briefing, which frames the whole run, goes
with the `fipi` block, which is accepted. The saved file carries `battery`
(the filename carried it too until 23 September 2026, and now carries the
source instead). A shared card link is built from the
origin and path alone, so it never carries a battery and always reads against
the whole run's profile.

**Quality control.** `qualityControl` is one entry per level, **keyed by the
level's `key`** for the reason the ratings are (the level's *name* between
September 2026 and the key; `level<N>` before that, and `preprocess.R` reads
all three),
saying how the level was answered rather than what it says, and three numbers is
the whole of it: `responseTimeMean` and `responseTimeSD` in milliseconds — sample SD, null
where there is only one time to go on — and `attentionChecksFailed`. `took()`
is the one place a reaction time is worked out; an item that was shown again
after being answered has had `timeOnset` re-stamped past its response and is
left out rather than counted as negative. An attention check is any item
carrying `check:` in a block file — the answer it must have — and one left
unanswered has not been failed. Only items actually asked count, so checks
answered for the run by test mode are not among them. Nothing here is shown to
anybody, and no score, norm or interpretation goes near it.

**Every scored level but General, How You Think and Where You Stand carries one check**, shuffled in among the
items of one of its questionnaires — the MINT (level 2), the BAIT (3), the
HiTOP-BR (4), the HEXACO (5), the archetypes (6), the five tertiary primals (7)
and the CERQ (9), as written on the timeline — and each is keyed by the
questionnaire's prefix with `_AttentionCheck` after it — the HiTOP-BR's is
`HITOP_AttentionCheck`, which no two-digit item pattern matches, so
`score_hitopbr()` cannot take it for an item once the columns are renamed. **The answer a check asks for is put away from where
a straightliner lands on that scale**: the HiTOP-BR is skewed to its floor, so
its check asks for "A lot"; the HEXACO's asks for "Strongly disagree", since
somebody agreeing their way down a personality questionnaire would pass one
written for the top; the archetypes' and the CERQ's each name a circle off
either end (2), the CERQ's also off the middle-to-high ground its adaptive
strategies pull towards. The
MINT's asks for the extreme left, which is 0 under either of its two writings
(the labels change, the values do not), and the BAIT's for the extreme right,
as published. The primals' is the one the inventory itself ships with, worded
as Clifton words it — it asks for "slightly disagree", which is off both ends
of the scale and off the agreeing side those items pull towards — and it sits
in the tertiary questionnaire rather than the PI-18, whose validated fixed
order is worth leaving intact. Level 1 has none: the `singles` would be its only host, and
nothing is dealt into the FIPI's run of five. Level 8 has none either: a
right-answer test has no straight line to catch, and a giveaway item would be
one more thing to get right. Level 10 has none since September 2026: its check
asked for "Disagree" among political statements, where an instruction stood
out more than anywhere else and was the likeliest place for somebody to
wonder what was being checked for, and the other measures are enough.

**Test mode.** `?test=true` (or a bare `?test`; it was `?testMode=true` until
23 September 2026, and the saved file's field is still `testMode`, which is
data and did not move) walks the run in miniature, so that every chart,
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
consent. **Nothing on the page leads into it** (23 September 2026): the landing
page carried a "Test mode" link under the Start button until then, taken out so
that no participant meets it, and the way in is now the address alone, which the
README writes out in full.

## Conventions

- No semicolons, 4-space indent, ~130 col, double quotes. Match it.
- Comments say *why*, in prose, above the thing. British spelling. Don't add
  comments that restate the code.
- **An item carries no full stop.** What is written on the card is a statement
  or a question, not a sentence of prose: it ends on its own last word, or on
  the question mark or ellipsis it needs. The same goes for the one-line
  `instructions` over it. Prose *inside* an item — a `<small>` gloss of a word,
  a briefing's paragraphs, an interpretation — is punctuated normally, and so
  is the second sentence of the handful of items that carry one. What was
  swept in September 2026 was the terminal full stop and nothing else.
- **No Oxford comma in the app's own words** — briefings, instructions,
  interpretations, readings, the custom items, the pages of `index.html`: "the
  questions, the code and the look". It is the British house style the notes
  are already written in, and it was made consistent across the on-screen text
  in September 2026. **Items lifted verbatim from a published instrument keep
  the publisher's punctuation**, Oxford commas and all — the HEX-ACO-18's "a
  novel, a song, or a painting" and four of the PI-99's tertiary items are the
  exceptions, and are meant to stay exceptions. Comments and these notes are
  not on screen and are not swept.
- **An item may be adapted, and should be when its wording is not good
  enough** (the author's call, September 2026). Unclear, idealistic, loaded,
  double-negative or stilted wording is rewritten rather than kept for the
  sake of a published scale — validating the adapted instrument is part of the
  project. What must go with it: a comment beside the item quoting the source
  wording and saying in a line why it changed, a key that keeps the source's
  prefix (so the file still says where it came from), a line at the head of the
  questionnaire saying it is adapted, and the understanding that an adapted
  item is never pooled with the source's data as the same item. The opinions
  level is written this way throughout.
- **Two registers, kept apart on purpose.** What the participant reads —
  section titles, dimension names on a figure or the web, the readings, the
  briefings — is written to make the test engaging, relevant and actionable,
  and may frame a construct more freely than the science would (four ICAR
  subtests read back as "cognitive styles"; a star sign beside a temperament;
  a hill, a sea, a wheel). What the code, the comments, these notes, the
  deck's Content table and the saved file say is the instrument's own
  truth: which scale it is, what it measures, what the keys and norms are.
  A user-facing name is chosen for the participant and documented against
  the real construct where it is defined (the mapping above the items in the
  block file, the bracketed scale in the deck's table), so nobody reading the
  repository is misled by the words on screen, and nobody taking the test is
  bored by the words in the repository.
- Prefer adding to `content/` over adding branches to the scripts. Questionnaire
  behaviour is data-driven; `CHARTS`, `SOMA`, `SEA`, `CLIMB_OF`,
  `ARCHETYPE_OF`, `WHEEL_OF`, `REASONING_OF`, `HEADS_OF` and `STANCE_OF` are the only places that name a questionnaire,
  and new ones should be rare.
- Anything that reads a score goes in `results.js` — or, if it is one figure's
  own, in that figure's file under `js/figures/` — and anything that walks the
  run in `app.js`. If a change wants both, it probably wants a new member on
  the `engine` object rather than a second copy of the state — unless it reads
  *neither*, in which case it goes in `js/draw.js`, under all of them. A new
  figure is a new file there, a `<script>` tag before `results.js`, a
  `makeX(shared)` call in `makeResults`, and a branch in `renderResults` and
  `feedbackKeys`.
- Keep it dependency-free and buildless. **One dependency is allowed and there
  is one**: `js/vendor/datapipe-client.js`, because a streamed session is a
  live database connection and not a request anybody should hand-roll (see
  **Where it goes**). It is vendored and pinned rather than fetched from a CDN,
  it is loaded by a plain `<script>` tag like everything else, and the run
  saves without it. A second one wants the same three things to be true of it
  before it goes in, and a very good reason besides.
- One folder each for the questions (`content/`), the code (`js/`) and the look
  (`css/`). Nothing else belongs at the root but `index.html`, `assets/`, the
  notes, `literature/` — a git-ignored shelf of reference PDFs behind the
  ideas list in `README.md` — three workbenches, `data/norms/`, scripts that work
  out numbers to paste *into* `content/`, `data/synthetic/`, scripts that
  write model-answered runs *out of* it, and `data/collected/`, which brings
  the real answers back down off Zenodo, and `docs/`, one file *about* it.
  None is reached for by any part of the app, and the app is reached for by
  none of them: the page loads no R and no PDF, and the deck imports nothing
  from the page.
- **Adding, removing or renaming anything in `content/` means running
  `python docs/build_slides.py` in the same breath** — and, if the change adds
  or renames a questionnaire, adding its row to `ROWS` in that script first,
  since it will stop rather than write a table that is missing it. It is the only
  summary of what the test asks that anybody reads without opening the files,
  so a stale one is worse than none: it is what the author, and anybody asking
  what is in the study, will go by, and it is generated so that it cannot
  drift. (It was the **Includes** table in `README.md`, kept by hand, until
  September 2026; the README now points at the deck rather than holding a
  second copy.) Its shape is one table: the level, the questionnaire with its
  abbreviation and reference (or "not validated", or "custom items"), the
  dimensions, and how many items — and nothing else: no prose, no notes on how
  a scale is fed back, which is what this file is for.

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
- **Eleven feedback keys belong to no dimension.** `StarSign` and
  `Temperament` are the level-1 old-theories votes, `AIArchetype` the
  level-3 one, `Year` the level-4 vote on the climb, `World` the vote
  on the sea, `Archetype` the one on the wheel, `Reasoning` the level-8
  vote on the compass, and `Heart` and `Mind` the level-9 votes on the two
  halves of **Mind and heart**, and `Stance` and `Beliefs` the votes on the plane and on
  the spectra of **Where you stand**. All eleven are load-bearing: the
  feedback collected under them has to keep stacking. Each is now written as
  its own key in the figure file rather than as prose filed into one —
  `ARCHETYPE_KEY` was `"AI Archetype"` and `STARS_KEY` was `"Star Sign"` until
  September 2026, which filed to exactly these, so nothing collected moved. (Files from before the
  climb carry `Mood`, `Health` and, earlier, `Stress` instead of `Year`.)
  (An `"Old Theories"` forced choice between the two was built and taken
  out the same day, September 2026, as redundant with the two votes; a file
  from a test run that day may carry it.)
- **A vote is filed under a written key, not under the name on screen.**
  A dimension that is fed back carries a `key` beside its norms in `content/`
  ("Bodily Awareness" → `BodilyAwareness`) and a figure's vote names its own
  (`SEA_KEY`, `ARCHETYPE_KEY` and the rest, which *are* the key rather than
  prose that files to one). `feedbackKey()` in `results.js` reads the written
  key and falls back to `filed()` — the old derivation, spaces and punctuation
  taken out — for a dimension that grows interpretations before it grows a key;
  `pickButtons` is handed a key and no longer works one out, so nothing on
  screen is ever the thing a vote is filed by. It is written rather than
  derived for the reason a level's key is: the name beside it is prose and free
  to change, and a column of a study's data is not. **`feedbackKeys()` throws
  when two readings file under one key**, the way `levelKey` does — the
  derivation was silent about it, and two dimensions would have shared a vote.
  Note that `voteButtons` is handed a dimension by a results row and its own
  key by a figure with no dimension to read against, so `feedbackKey` passes a
  name that is not a dimension of this run straight through. Files written
  before September 2026 carry the names with the spaces still in them.
- **Every demographic item is keyed `Demographics_…`** (September 2026):
  `Demographics_Age`, `Demographics_BirthMonth`, `Demographics_Gender`,
  `Demographics_Education`, `Demographics_Country`, `Demographics_SocialStatus`
  and the rest, across all three demographics blocks, so a saved file sorts
  them together. The questionnaire keys stay `demographics1`…`3`. Files
  written before then carry the bare names (`Age`, `BirthMonth`, …) and want
  renaming at analysis time; the notes below use the bare names where they
  tell the older story.
- **`BirthDay` is the day of the month, and it must never be released.** A
  button a day, seven to a row, the question worded from the month and the
  29th to 31st offered only in the months that have them (option `showIf`,
  see **Branching**); "I'd rather not say" is 99. With the month and the age
  beside it the day is most of a date of birth, so **it is kept in the raw
  files only**: before any data are made public it is dropped, or grouped
  into the star sign or the half of the month either side of the cusp, at the
  same stage as a platform's `?sub=` id is removed — the consent sheet (a
  paragraph of its own under "What will happen to the results") and the
  ethics application (A3, the anonymity paragraph, B11a) both say so, and the
  foot of `preprocess.R` notes that `clean/` still holds it. **Three shapes of
  it are in files already written**: the day, from September 2026; before
  that, the same key holding which side of that month's cusp the day fell
  ("1st to 19th" / "20th to 31st", in words — the words tell the two shapes
  apart, a bare 1 or 2 would not); and before that twelve keys,
  `DayBirth_1`…`DayBirth_12`, one per month, with the month as `MonthBirth`,
  one of the twelve filled and eleven null. Coalesce and rename at analysis
  time.
- **`Catastrophising` and `CERQ_Catastrophizing_N` are spelled differently on
  purpose.** The dimension takes the app's British spelling, which is what the
  person reads; the item keys keep Garnefski's own, which is what a published
  scoring script matches. The same goes for `Perspective` and `RefocusPlanning`,
  whose keys are his shorthand for dimensions named in full. Written up at the
  head of the CERQ in `content/block_regulation.js`; it is a decision, not a
  slip, and reconciling the two would break one side or the other.
- **An item key's middle segment is not always the scored dimension, and
  nothing marks which it is.** `CERQ_SelfBlame_1`, `PI_Safe_1`,
  `Archetype_Idealist_1` and `PHQ4_Anxiety_1` name the dimension the item
  feeds; `MINT_ExAc_1` and `HEXACO_Sincerity` name a *facet* under one
  (Bodily Awareness, Honesty-Humility), `ERS_Sensitivity_1` names it a word
  short of it (Emotional Sensitivity), and `ASRS_1`, `CFQ_10`, `HITOP_01` and
  the ICAR's four name none at all. **That is deliberate and should stay**: a
  key names the finest scale its own instrument defines, which is the thing a
  published key has to match, and the MINT and the HEXACO genuinely want the
  facet in the key. The cost is that `grep("^CERQ_SelfBlame", names(d))` works
  and looks general when it is not, so **key → dimension is not derivable from
  the key**: it lives in `content/`, and `data/synthetic/codebook.js` is what
  reads it out. An analysis that wants to group by dimension goes there.
  **The opinions level is the one place the *first* segment is not the
  instrument either**: every key there starts `Opinion_` so the level can be
  picked out by prefix, and the instrument, where there is one, is the second
  segment (`Opinion_BSA_LibAuth_2`, `Opinion_CMQ_1`) — see that level's row
  above. `grep("^Opinion_", names(d))` is the whole level; `grep("^BSA_")`
  finds nothing.
- **A number in a key is padded only where a stem can reach ten.** `HITOP_01`
  and `ICAR_VR_04` are padded because their numbers run past nine under one
  stem and would otherwise sort `1, 10, 11, 2`; everything else — the MINT's
  threes, the archetypes' threes, the primals' sevens — never does, so it is
  not. The rule is about sorting and nothing else: a regex splits `_(\d+)$`
  either way. Pad a new instrument's numbers if one of its stems can reach ten,
  and do not go back and pad the ones that cannot.
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
  `data/norms/make_norms.R` — which is where they should be re-read from rather than
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
  wheel does not want them. Don't "fix" it by adding some. **The `icar`
  block is the opposite case and worth reading twice**: it has norms, and
  nothing on its own level reads them. They went in in September 2026 for
  the whole-run web alone — the average person is drawn from a mean on
  every axis, and four axes without one left a gap in that ring — and they
  are invented placeholders like the rest, not the SAPA norms, which exist
  and are still not used. The compass compares the four kinds with each
  other and with nobody, and a percentile on reasoning is the one thing the
  author decided this test would not hand back: no row, no interpretation and
  no `key`. The whole-run web does give a standing on them, worded as a style
  and not as a score — see **The compass** for why that is a different thing.
  Adding an `interpretations` to one of them would grow a results row and a
  vote on a level that gives neither.
- **The consent form in `index.html` is not approved text yet.** Since
  September 2026 it is modelled on the University of Sussex sheet the MINT
  validation study ran with (`ethics/mint_validation/Consent.pdf`) — the same
  headings in the same order, and the consent statements kept as the
  committee's own wording rather than reworded, since that is what a reviewer
  reads for — and what is written around them describes *this* study, so it has
  to keep agreeing with the Project Description in
  `ethics/mint_followup/application_draft.md`. **One of the six is no longer
  the committee's wording**: the third said withdrawal was impossible "once I
  have completed it", which stopped being true when answers began going out as
  they are given, so it now says "once it has been given, whether or not I
  finish the study" (22 September 2026). A reviewer should be told which one
  was amended and why, and the rest are still to be left alone. **Three things
  in it are still blanks**: the second contact, the C-REC reference, and the
  duration, which is an estimate until somebody has timed a pilot run. The banner that said the
  wording was a placeholder was taken off at the author's request, so nothing on
  screen flags any of this. The Start button stays disabled until the form has
  been scrolled to the end (`checkConsent`), which then rewrites the hint under
  it rather than hiding it.
- **A token file written by PowerShell carries a byte order mark.**
  `Set-Content -Encoding utf8` on Windows PowerShell 5.1 writes a BOM, which is
  not whitespace, so `strip()` leaves it on the front of the token; it then goes
  into an `Authorization` header and fails encoding to latin-1, several frames
  deep in `urllib` and a long way from anything that mentions tokens.
  `download.py` reads `~/.zenodo_token` as `utf-8-sig` for that reason, and
  takes the quotes off a pasted value while it is there. Anything else that
  learns to read a secret out of a file on this machine wants the same.
- **A test run opens a real session and leaves real files.** `?test=true`
  talks to the live experiment like any other run: pressing Start opens a
  staging session, and a test run abandoned halfway leaves a
  `test_…partial.json` in the Zenodo deposit about fifteen minutes later, the
  way a finished one leaves a `test_…json`. The `test_` prefix is what picks
  both out for binning; nothing else does. To exercise the wiring without
  sending anything, put a stub on `window.DataPipe` before pressing Start —
  `setBaseURL` doing nothing, `createSession` returning — synchronously, not
  as a promise — `{sessionId, ready, record, flush, close}`, and
  `saveData` returning `{ok: true}` (the first two were missing from this
  note until 23 September 2026, and a stub without them throws on Start and
  leaves the page on the landing screen) — which is how it was tested when it went
  in and again on 22 September 2026. `ready()` is new to the stub: the session
  is handed to `saveData` whole now, and that is what the real client awaits on
  it, so a stub session without one cannot stand in for it (and a stub of
  `createSession` alone, left to the real `saveData`, fails the send outright). Note
  that `delete window.DataPipe` does **not** work: the bundle declares it with
  `var`, so the global is writable but not configurable, and what removes it is
  `window.DataPipe = undefined`.
- **The items a test run answers for itself are never staged.** `thinRun()`
  fills them in before the session is open and nothing was put on screen, so a
  partial from a test run holds only what was actually shown, while the file at
  the end holds all of it. That is the right way round — it is the same reason
  such an item carries null times and is passed over by the quality control —
  but it means a test partial is much thinner than a real one.
- **Test mode opening the consent gate is temporary scaffolding**, and goes
  before the study runs. (The "Test mode" link on the landing page that went
  with it is already gone.)
- The PHQ-4 uses the refined 5-option version, so `0.5` is a valid response and
  sums are not always whole (`tidy()`).
- Items with no `dimension` (attention checks) are skipped by all scoring.
- **A level number means nothing without the run's block list.** `?battery=`,
  `?only=` and `?skip=` drop blocks and then whole levels from `PLAN`, `?start=`
  moves levels to the front of it, and
  levels are numbered by their place in it, so level 3 of one study is not
  level 3 of another — and **the order of levels 2 to 10 is drawn or chosen**:
  the drawn run deals its three levels among places 2 to 4 and the fork puts
  its six in whatever order the person picked, so what is level 5
  for one participant is level 10 for the next in the same study — and levels 8
  to 10 are beneath the seabed while 1 to 7 are in the water, so the same
  questionnaire is met in the water by one person and in the rock by another. `levels` in the saved file is the key —
  every level of the run, in the order walked, with its blocks; read
  `timeLevelN` and `qualityControl.levelN` against it, never against the
  full timeline. (A flat `blocks` list stood beside it until September 2026,
  which was `levels` flattened and nothing more.) The Content table in
  `docs/index.html` writes each instrument's level **as written on the
  timeline**, which is the one thing about it that never moves.
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
  only thing that gets there, and at sixteen axes it still fits — the two-word
  names wrap onto a second line, which is what keeps the neighbours apart. If
  `PROFILE` grows much past that, the labels near the top and bottom of the rim
  start running into each other and want staggering again.
- The keyboard handler (digits answer, ← goes back) must stay disabled while a
  panel is open — the survey behind it is not being read.
- **A turn belongs to the answer that scheduled it** (`turns`, beside `locked`).
  `answer()` does not advance the run itself: it schedules the move for
  `ADVANCE_DELAY` later, and until September 2026 that timeout ran whatever had
  happened in the meantime — it set `locked = false` and called `advance()` on
  whatever `index` had become. Two of them in flight (a press that got through
  while the lock was down, a level screen going up behind the fade) meant the
  second one advancing from a place it knew nothing about: **`advance()` would
  find nothing shown after the current item and end the run while that item was
  still on screen unanswered**, which sent the file without the answer to it —
  reliably losing `Closing_Comments` and the last level screen's own response,
  the fork choice among them. Now each answer takes a numbered turn and a
  timeout that is no longer the current one does nothing at all: it neither
  unlocks nor advances. Anything else that schedules a move wants the same
  guard, and **anything that unlocks on a timer wants asking whether it is
  still the unlock that was meant**.
- **The run is sent once, whatever reaches the end of it.** `save()` keeps the
  promise of the first send and hands it back to any later call (`sending`,
  `sendRun`), so a second arrival at the end gets the first one's outcome
  rather than a second file. DataPipe refuses a filename it has already taken,
  so without this a second send answers `FILE_EXISTS` and writes "could not be
  sent" under a run whose answers had just arrived. The guard is not a
  substitute for the turn one above it — it stops the *report* being wrong, not
  the *file* from being early.
- **`answer()` is reachable when the survey is not on screen.** The option
  buttons of the item before a level screen are still in the (hidden) survey, and
  the water takes `CURTAIN_COVER` to cover them, so it guards on
  `screen !== "survey"` *and* holds `locked` from the moment a level ends until
  "Continue the test" is pressed. Without both, the next item — including the
  closing one — can be answered without ever having been seen. **`passBriefing()`
  holds under the same two conditions**, and so does the Enter/Space path into
  it in the keydown handler (which returns off `screen !== "survey"` before it
  gets there): a level whose first block is not a demographics one opens with
  a briefing, so that is what waits behind the level screen, and a press on
  `#briefing-go` while the curtain was crossing would pass it unread — the
  first real item of the next level would be what waited instead, and the
  briefing would be filed with a response time of almost nothing. A third
  guard, `isBriefing()` on the current item, keeps the button from passing
  anything that is not one.
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
- **`--share` is taken, and not by sharing.** It is the registered property
  (`@property`, a number) that the gauge's stops and the profile badge fill
  their rings with, so a colour written under that name anywhere is quietly
  coerced to `0`. The red every share button wears is `--sharing` for that
  reason (23 September 2026). Any new custom property wants checking against
  the `@property` rules in `style.css` first.
- **A badge's crop is written in its figure's own coordinates**, and nothing
  checks it. Move a figure's centre, its radius or its viewBox and the badge
  goes on rendering — of whatever now happens to be in that square. After
  editing a figure, look at its badge. The quickest way is a finished
  `?test=true` run: clone the `.shelf__badge` elements into a fixed
  overlay at 130px and rewrite a clone's `viewBox` until it frames what it
  should, then write those numbers into `renderBadge`.
- **`.shelf__badge-emblem` is a class three files build**: `results.js` (the
  star sign), `archetype.js` (the robot) and `heads.js` (the two organs). It
  is the badge for a level with no drawing to crop, and the stylesheet sizes
  whatever is put in it — a character, or svgs at 46% of the square.
- **`LINKED` is a map, not a list.** The two panel buttons sit on different
  bars, so each is named with the block it is written in (`profile:
  "shelf__link"`, `raw: "sidebar__link"`) and `markSidebar` lights each in its
  own block's `--open`. A third panel button wants its block naming here too.
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
  the sea's sway, drift and lean (`sea__*` in `results.css`) and the pulse round
  the point on the opinions plane (`stance__pulse`), the two loops a card
  carries: a still sea behind a seal is what is wanted.
- **A locked figure is blurred by a rule that names it.** The one in
  `results.css` catches `.result--locked .result__chart svg`, which is every
  figure but two: `heads.js` draws its chart in HTML, so
  `.result--locked .headsview__chart` sits beside it, and `stance.js` draws its
  spectra in HTML, so `.result--locked .stance__spectra` does too. A figure whose body is
  not an `<svg>` has to add its own line there, or it will sit unblurred and
  perfectly readable inside a locked panel — which is the one thing the locked
  rendering exists to prevent. The same figure builds its own `.result__chart`
  stage and `.result__lock` badge rather than taking `figureHolder`, which
  makes an `<svg>`; the teaser's own badge goes on `.result__body` and needs
  nothing from either.
