# AGENTS.md

The one set of notes on this project. `CLAUDE.md` is a pointer to this file, not
a second copy — write here and nowhere else, or the two will drift.

Single-page survey app. No build, no dependencies, no framework, no tests.
`index.html` loads the content first (`content/schema.js`, then `content/level1.js`
… `level4.js`), then `js/results.js` (reads scores back), then `js/app.js` (the
engine) — and three stylesheets in cascade order: `css/style.css` →
`css/intro.css` → `css/results.css`. Nothing is a module: each file adds to the
globals the next one reads, so **the order of the tags in `index.html` is the
only thing holding it together**. A new file means a new tag in the right place.

Run it: the `testyourself` config in `.claude/launch.json` serves the folder on
port 8123 (`python -m http.server`). Open a file change in the browser by
reloading — there is nothing to compile.

## Where things live

Three folders and the page that loads them: the questions, the code, the look.
A change usually needs one file out of one of them.

| | |
|---|---|
| `content/schema.js` | How a questionnaire is written — the schema, in one comment. **Read it before editing anything in `content/`.** Also holds `formatMint` and the empty `QUESTIONNAIRES` the level files fill. |
| `content/level1.js` … `level4.js` | Every question, scale, colour and norm, **split by the level it is asked on** rather than by what it measures, so the file to open is the stretch of the run being changed. **Content changes go here and nowhere else.** Each is one `Object.assign(QUESTIONNAIRES, { … })`, and holds the *sections* of that level as well as its questions. A questionnaire's own `level:` is what actually decides when it is asked; the file it sits in only has to agree with it. |
| `js/app.js` | The engine, one IIFE, in labelled sections: build the run → branching → scoring → rendering an item → the rail → panels → particles → finishing a level → flow → results → the way in → wiring. |
| `js/results.js` | `makeResults(engine)`, a factory returning the handful of functions `app.js` calls. Spider charts, the interoception body, PHQ-4 severity, the card, the results sections, the staged opening of a finished level, and the example web the landing page hangs behind its case. Reads scores; never records anything. |
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
nothing in it walks the run or writes to `responses`. Adding to the seam means
adding to that object literal, so keep it small.

## How it works

**Run order.** Every item of every questionnaire in `RUN` is flattened into
`questions`. Items are grouped into *levels* (`level:`, default 1), asked lowest
first; within a level the questionnaires are shuffled together, except items
marked `shuffle: false`, which hold their written position. `RUN` order is also
results order, and `demographics1` is first in it so its items open the run.

**What is asked, and where.** Four levels, three of them scored — and a file each
in `content/`, so this table is also the map of that folder:

| | |
|---|---|
| `level1.js` | `demographics1` (age, month of birth, gender and what branches off it), `fipi`, `sins` → Personality, Self-regard |
| `level2.js` | `demographics2` (education, discipline, student, ethnicity, country), `mint` → Interoception. Also `gjs`, which is written there but not asked |
| `level3.js` | `phq4`, `pathological` (CSD-2, PCL-2) → Mood, Strain |
| `level4.js` | `closing` — nothing scored in it, so it opens no results |

The demographics of a level are written `shuffle: false` and come first in it;
everything else on that level is shuffled in behind them. A follow-up to an
answer (`…Other`, `GenderIdentity`) is written directly after the item it
branches from. `sins` is one item and is a questionnaire of its own rather than
a sixth item on the FIPI, so that it does not join a chart it does not belong
on. `gjs` is **commented out** in `content/level2.js` *and* left out of `RUN` —
a questionnaire not named there is inert either way — because it asks everybody
about a job without asking first whether they have one. Waking it takes both.

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
comes from the level file it is written in and nowhere else.

**Sections.** An item carrying `section: true` is not a question but a pause
inside a level: a heading, a few paragraphs of `text` (HTML, into
`.section__body`) saying what the next stretch is about, and a button. It is
written in `content/` in the place it is to be shown — at the end of the
questionnaire it closes, or at the head of the one it introduces — and the
engine forces `shuffle: false` on it, since a section that moved would be
introducing something else. Two are asked: one after the demographics of level
1, warning that the questions get stranger further down, and one at the head of
the MINT, turning from questions about you to questions about your body.

It takes the survey screen over rather than being a screen of its own
(`renderSection`, hiding `#text` and `#scale`), so everything guarding on
`screen === "survey"` — the keyboard, the back button, the timing — goes on
holding while it is up. **Nothing about it is recorded**: no response, no row in
`items[]`, no reaction time in the quality-control figures, and `askedIn` leaves
it out so that it can never be the thing holding a level shut. Test mode never
stands one in for a person either — there is no answer to stand in for, and a
short run is exactly when the copy still wants reading. Leaving one goes through
`advance()`, the same way out an answered item takes, so a section could end a
level and the level would still break the same way.

**Typed answers.** A format with `input:` renders a field and a Continue button
(`renderEntry`) instead of option buttons, taking what is in it on Enter or
click: `"number"` once it is inside `min`/`max`, `"text"` as soon as it is not
blank (`max` is its length). The global key handler ignores events from an
`INPUT`, or digits would answer the item while being typed. A written answer is
somebody's own words, so nothing may put it in a selector — the spray on
answering comes out of the Continue button rather than out of
`[data-value="…"]`.

**Scoring.** Items sharing a `dimension` are averaged by `score()`, which returns
`undefined` until every one of them is answered — that is what gates the reveal
of a chart point or a results row. An item marked `reverse: true` is counted
backwards into its dimension (`counted()`, `lowest + highest - answer`) — what
was answered is still recorded as given, only the scoring turns over, which is
how the MINT's deficit items add up to Clarity. `norms` (mean/sd) turn a score
into a percentile; the tercile it lands in picks the `interpretations` text. The
PHQ-4 is the exception: `phq4Reading()` reads *sums*, not averages, against the
published 0-12 bands and the ≥3 subscale cut-off.

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
when the level is locked, like every other figure, and it is the third and last
place a questionnaire is named in `results.js`.

**Locked levels.** Every level button opens, finished or not. An unfinished one
renders through the same `renderResults(into, level, locked)` path with
`locked` true: all of the level's dimensions are listed rather than only the
scored ones, the chart is drawn from `teaseValue()` — a fixed figure hashed from
the dimension's name, meaning nothing — and everything earned is blurred by
`.blank`. Teased points carry no tooltip and locked sections take no pointer
events, so no fabricated number is ever readable. Keep it that way, and keep the
preview faithful: it should show exactly what finishing the level will show.

**The MINT's two scales.** `formatMint` is drawn in `content/schema.js` when
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

**The card.** `drawCard()` paints a 1200×630 canvas of the whole web — every
dimension the run has, on the same geometry the profile panel draws, with the
ones still unanswered left as gaps. It is never previewed in the panel — the
web above the two buttons is the same drawing — so it is only made when
"Download your card" or "Copy share link" is pressed. There is no separate
subset and no archetype: sharing carries everything finished, mood included,
because pressing the button is a deliberate act. The same values go into
`?card=1&s=Name~value,…`;
`readCardLink()` reads them back, keeping only names it finds in
`dimensionOrder` and numbers inside that dimension's own scale, so a link is
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
carrying `check:` in a level file — the answer it must have — and one left
unanswered has not been failed. Only items actually asked count, so checks
answered for the run by test mode are not among them. Nothing here is shown to
anybody, and no score, norm or interpretation goes near it.

**Test mode.** `?testMode=true` walks the run in miniature, so that every chart,
level and reading can be reached in a minute: a questionnaire longer than
`TEST_LONG` (10) items keeps `TEST_KEPT` (2) of them, chosen at random, and
`thinRun()` answers the rest at random and marks them `auto`. `shown()` returns
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
  behaviour is data-driven; `phq4Reading` and `CHARTS` are the only places that
  name a questionnaire, and new ones should be rare.
- Anything that reads a score goes in `results.js`, anything that walks the run
  in `app.js`. If a change wants both, it probably wants a new member on the
  `engine` object rather than a second copy of the state.
- Keep it dependency-free and buildless.
- One folder each for the questions (`content/`), the code (`js/`) and the look
  (`css/`). Nothing else belongs at the root but `index.html`, `assets/` and the
  notes.
- **Adding, removing or renaming anything in `content/` means updating the
  Includes list in `README.md` in the same breath.** It is the only summary of
  what the test asks that anybody reads without opening the files, so a stale
  one is worse than none: it is what the author, and anybody asking what is in
  the study, will go by. Keep it in the shape it is already in — a bullet per
  level, a line per questionnaire, the abbreviation in brackets — and keep the
  counts at the foot of it right. A questionnaire written but left out of `RUN`
  stays on the list, marked as not asked, so that it is not written twice.

## Gotchas

- **"Section" means two things, and only one of them is an item.** A `section:
  true` item is a pause in the middle of a level (`.section`, `#section-body`,
  `renderSection`, `passSection`). A *results* section is one block of a
  finished level's results (`sealSections`, `openSections`, `.result` in
  `results.css`). They never meet — one is in `app.js` and the survey screen,
  the other in `results.js` and the level screen — but say which you mean.
- **A new file needs a `<script>` or `<link>` tag in `index.html`, in the right
  place.** There are no modules and nothing imports anything: each file adds to
  the globals the next one reads. A level file loaded before `content/schema.js`
  throws on a `QUESTIONNAIRES` that is not there yet, and `js/app.js` has to be
  last of the scripts.
- **All `norms` in `content/` are invented placeholders**, flagged as such in
  comments. Never present them as real, and keep the flags when editing.
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
- **`gjs` is out of `RUN`, not out of `content/level2.js`.** It wants an employment item
  to hang a `showIf` on before it goes back in — and note that an escape option
  would feed a number into its score, so it cannot simply be given one.
- **`Country` is four buttons and a branch.** The commonest few are options,
  everywhere else is `CountryOther`, typed — the engine has no dropdown, and no
  list of every country belongs on a screen of option buttons. What is typed
  arrives spelled however people spell it, and wants tidying at analysis time.
- A question of ten or more options wants `columns: 2` (`Ethnicity`,
  `Discipline`): stacked full width, they run off the bottom of the window. A
  `small` option keeps a row of its own whatever the columns are.
- `drawSpider` needs 3+ dimensions to draw a polygon; with fewer, or with some
  still unanswered, it joins neighbours with lines instead.
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
- **`drawSpider`/`drawSoma` add their classes rather than setting them.** The
  same `<svg>` is found again by a class of its own (`.profile__web`), so
  writing `class` outright makes the second render of a profile throw.
- **`.bar` in `results.css` is the percentile bar** under a results row. The
  strip down the right is `.sidebar__*` — including the level buttons on it,
  which are `.sidebar__level*` rather than a block of their own, since `.level`
  is already the level *screen* in `results.css`. Naming anything in `style.css` `.bar`
  again puts a fixed, full-height panel behind every score in the results.
