/* ==========================================================================
   content/timeline.js — what is asked, in what order, and the frame every
   block file beside it is written into. Read this before editing anything in
   content/; why it works the way it does is in AGENTS.md, and is not repeated
   here.

   FOUR LISTS, each knowing only the one under it:

     TIMELINE_MINT,      the levels, asked top to bottom — one timeline a
     TIMELINE_ALL        battery, `BATTERIES` naming them
       level             the blocks of that level, in order — and a `key`,
                         what the saved file is written under, beside a `name`,
                         what the gauge, the level screen and the results panel
                         call it; the ones marked `fork: n` are taken in
                         whatever order the person chooses, `n` offered at a
                         time, and a run of them wrapped in `shuffle()` in one
                         drawn for them; `minutes`, how long it is said to take
         block           its entries: briefings and questionnaires, in order
           questionnaire its items

   A block is one stretch of the run that moves as a piece — a file of its own,
   `content/block_<name>.js`. Moving one between levels is moving its name from
   one line of a timeline to another, and a block named nowhere here is never
   asked however completely it is written. The demographics are one
   exception: they are named on no level but in `DEMOGRAPHICS`, below, and open
   the first levels of the run by place, whatever those levels hold.

   An **interlude** is the other: an entry of a timeline written
   `{ interlude: true, blocks: [...] }`, which is no level — no key, no name,
   no results — but blocks asked *between* the level written before it and
   the one written after. It opens the place after it, the way the
   demographics open theirs, whatever the fork puts there, and belongs to that
   place rather than to its level: nothing in it counts towards the level's
   ring, countdown or quality control. A briefing of an interlude written
   `onward: true` is left by choosing what comes next, while a fork is still
   to fill the place the interlude opens: the cards a level screen would have
   offered stand under it instead of its button, so the choice comes after
   the interlude rather than before it. The interim between the core and the
   rest of `mint` is the one there is.

   A questionnaire is the unit of shuffling and the only one: its items may
   come in any order but they come together, and everything around them holds
   the order written here. An item marked `shuffle: false` keeps its own place
   while the rest move around it. Two instruments meant to be asked in among
   each other therefore go in one questionnaire; two meant to stay apart go in
   two.

   A BLOCK, with every field there is:

     defineBlock("example", [
         {
             type: "briefing",           // a screen with nothing to answer on:
             key: "Briefing_Example",    // a heading and a few paragraphs saying
             text: "<h2>…</h2><p>…</p>", // what the next stretch is about. Its
                                         // continue response and timings are recorded.
             celebrate: true,            // optional: a milestone rather than a pause,
           },                              // lit in gold, sprays out of its heading
         {
             key: "example",             // what a score is traced back by
             name: "Interoception",      // what the results screen calls it
             profile: false,             // optional: keep its dimensions off the
                                         // whole-run profile web and card
             results: false,             // optional: keep its norms but open no
                                         // section on its level — fed back nowhere
             enough: 2 / 3,              // optional: the share of a dimension's items
                                         // that must be answered rather than declined
                                         // for it to be scored (below); all of them
                                         // if left out
             instructions: "shown under every item of this one (HTML)",
             format: { … },              // the scale, below
             norms: {                    // no norms, no results: a dimension
                 "A Dimension": {        // with nothing to be placed against is
                                         // asked and saved, and fed back nowhere
                     key: "ADimension",  // what the agree/disagree on it is filed
                                         // under — wanted wherever there are
                                         // `interpretations`, since the name
                                         // beside it is prose and free to change
                     mean: 3.9,
                     sd: 1.1,
                     interpretations: { low: "…", mid: "…", high: "…" },
                 },
             },
             items: [
                 { key: "Example_1", dimension: "A Dimension", text: "the question (HTML)" },
                 { key: "Example_2", dimension: "A Dimension", text: "…", reverse: true },
                 { key: "Example_3", text: "Answer 'Not at all' to this one", check: 0 },
                 { key: "Example_5", dimension: "A Dimension", text: "…", correct: "9f2e4c1a" },
                 { key: "Example_4", text: "…", showIf: { key: "Example_1", is: [3, 4] } },
             ],
         },
     ])

   An item with a right answer — a reasoning item rather than a rating — is
   written `correct:`, and counts 1 or 0 into its dimension instead of the
   value chosen. What is written is not the answer but `answerKey(key, value)`
   of it: the key of the item and the value of the right option, hashed
   together, so that the scoring key is not legible from the file (open the
   page and call `answerKey("Example_5", 4)` in the console to make one). It
   is obfuscation and not secrecy — the page has to be able to score, so
   anybody reading the code can try the handful of options — but it keeps the
   answers out of a search engine and off a casual reading of the source.

   `format`, `instructions`, `shuffle` and `type` are questionnaire-wide
   defaults that an item may override for itself; an item's own `format`
   replaces the questionnaire's outright, so it has to be complete.

   A FORMAT is either a scale to choose from:

     format: {
         options: [0, 1, 2, 3],                       // numbered circles, or
                  [{ value: 0, text: "Not at all" }], // labelled buttons, or
                  [{ value: 1, text: "A", image: "assets/icar/MR45_A.png" }], // pictures
         labels: ["--", "-", "+", "++"],  // optional: written over the values
         anchors: ["Disagree", "Agree"],  // optional: the two ends of the scale
         columns: 2,                      // optional: labelled options only
         vertical: true,                  // optional: stacked instead of set in
                                           // a row or (labelled) left to right —
                                           // strongest/highest written last,
                                           // shown on top
         color: "#e0457b",                // the chosen response
         hovercolors: ["#ef4444", "#22c55e"], // optional: options light up along it
     }

   ...or, for `type: "multi"`, the same options as a list several of which may
   be true at once. They are ticked rather than picked and Continue ends the
   item, so the answer is a *list* of values. An option marked
   `exclusive: true` — "none of these" — puts every other answer down when it
   is taken, and is put down by any of them. A `showIf` against such an item
   opens on any one of its `is:` values being among those given.

   ...or a field to type into:

     format: { input: "number", min: 18, max: 120, placeholder: "Age in years",
               tooLow: "You must be 18+ to take part", tooHigh: "…" }
     format: { input: "text", max: 60, placeholder: "In your own words" }
     format: { input: "text", multiline: true, optional: true, max: 3000, placeholder: "…" }

   A text field marked `multiline` is a box of several lines rather than one
   (Enter starts a new line in it; Ctrl+Enter or the button takes it), and one
   marked `optional` may be left blank — the button then reads "Skip" and the
   answer is saved as an empty string, which is how a blank was chosen rather
   than never reached.

   ...or, for `type: "curve"`, a stretch of a bell curve to place yourself on:

     format: { min: 0, max: 100, color: "#0e7490" }

   The answer is the share of people below where the mark is clicked — the area
   filled under the curve — and it is recorded as the number that was on
   screen. Nothing else is written: the curve has no options and takes no
   anchors.

   ...or, for `type: "slider"`, a point on a line between two ends:

     format: { min: 0, max: 100, step: 1, unit: "%", anchors: ["Certainly false", "Certainly true"], color: "#6aa7f0" }

   Nothing is answered until the line is touched, and Continue takes it. What
   is saved is the number; `unit` is only written after it on screen. A
   slider may carry `options`, and they can only be ways out — each
   `small: true, custom: true`, valued off the line (the engine throws
   otherwise), set under Continue and taken on the press:

     options: [{ value: 999, text: "This doesn't apply to me", small: true, custom: true }]

   An option with `image:` (a path under `assets/`) is a picture on a tile,
   its `text` under it as a caption — and still what is saved and what the
   keyboard answers by; the picture is only how it is shown. An option with
   `small: true` is set below the others, for a way out of a
   question rather than an answer to it. A question of ten or more options
   wants `columns: 2`. `max` on a text field is how long the answer may run.
   An option may carry a `showIf` of its own, written as an item's is, and is
   then offered only while that answer is given — the 31st of the month waits
   on a month that has one.

   An option marked `custom: true` — "Something else", "Other" — is an answer
   outside the scale: a category of its own, not a point on it. It is asked,
   chosen and saved like any other, but the engine keeps it out of the scale's
   bounds and never counts it into a dimension's score, so its `value` is only
   a label for `showIf` to match (the convention is 99, or 0 for "Other" at
   the foot of a ladder of real codes). `small: true` beside it is the look;
   this is the meaning. Choosing one holds the dimension unfinished, so one
   such answer stops it being scored at all.

   An option marked `declined: true` — "I'd rather not say" — is outside the
   scale too, and saved like any other, but is no answer rather than a
   different one: the engine leaves the item out of its dimension, which is
   scored on the items really answered while the questionnaire's `enough` of
   them are, and is otherwise answered and unscored, which a figure can say
   (`declined` in app.js) rather than show nothing. Without `enough`, one
   declined answer leaves the dimension unscored. A `score:` on the other
   options needs none on it.

   Types: `"choice"` and `"input"` are read off the format and need not be
   written. `"multi"`, `"curve"` and `"slider"` are written, on the item or on the
   questionnaire around it. `"briefing"` is written too, and only ever on a
   block entry.
   ========================================================================== */

// Every questionnaire there is and every block that holds them, filled in by
// the block files loaded after this one. A block is its entries, in the order
// they are written; a questionnaire is filed under its own key so that a score
// can be traced back to what asked for it.
const QUESTIONNAIRES = {}
const BLOCKS = {}

function defineBlock(name, entries) {
    for (const entry of entries) if (entry.type !== "briefing") QUESTIONNAIRES[entry.key] = entry
    BLOCKS[name] = entries
}

// The hash an item with a right answer carries in place of it: FNV-1a over
// "<key>=<value>", as eight hex characters. The engine hashes the answer
// given the same way and compares, so the right option is never written in
// the file as itself. See the note at the head of this file.
function answerKey(key, value) {
    const text = key + "=" + String(value)
    let hash = 0x811c9dc5
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193) >>> 0
    }
    return ("0000000" + hash.toString(16)).slice(-8)
}

// Fisher–Yates, in place: sorting by a coin flip is a biased shuffle, however
// short the list. Used on the blocks of a level asked in a random order, and
// on a run of levels asked in one (see the timelines below).
//
// **Outside a browser it draws nothing and hands the written order back.**
// This file is also read by `data/synthetic/codebook.js`, and through it by
// `docs/build_slides.py`, and what those two describe is *what is asked*
// rather than one draw of it: a level's number in the deck's Content table
// has to be the same every time the table is built, or the published table
// changes under a link that points at it. A shuffle says these may come in
// any order, and the written one is the representative of all of them.
//
// In a browser the draw comes off `chance()` (js/resume.js, loaded before
// this file), which is seeded, so that a run carried on after the tab was
// closed is drawn again exactly as it was.
function shuffle(arr) {
    if (typeof window === "undefined") return arr
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(chance() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

// The run itself. One entry per level, asked in this order; a level with
// nothing scored in it opens no results and takes no share of the descent,
// which is what the closing level is for — the last question is asked after
// the final results have been read rather than instead of them. Keep it last,
// and keep it alone.
//
// A level's `name` is what the gauge's hover card, the results panel and the
// level screen call it. Its colour on the gauge is not written here: the stops
// run through one gradient down the line, by position (app.js, `levelColour`).
//
// **Where the seabed falls is not written on any level.** `WATER_SHARE` below
// is a share of the scored levels: the first two thirds are swum down and the
// rest are cut through the rock underneath (app.js, `BEDROCK`, `waterLevels`),
// the water darkening into rock behind them and the gauge sounding on past the
// Challenger Deep, still in metres from the surface.
// Leaving the last level in the water goes through the crossing line, the way
// the quote closes over the way in. It is a share and not a flag so that the
// break holds its place however many levels a battery asks and wherever the
// fork has put them — which level is the floor is the descent's business and
// not the content's.
//
// Levels written `fork: n` are a fork: their order is the person's, `n` at a
// time. The places they take are the **slots** — the positions on this
// timeline that carry it — and what goes in them is the person's to arrange.
// At the end of the level before each slot, while more than one level is left
// to fill it with, `n` of the levels still to place (or all of them, if fewer
// are left) are drawn afresh and shown side by side, blurred, and the person
// picks which to take next; the ones passed over go back among the rest, and
// of those shown the one written first is marked as recommended. It is the
// one thing about the run's order that is the participant's, there so that
// the descent is not one straight line. Where an interlude opens the slot,
// the choice waits for it and is offered under its `onward` briefing instead.
//
// **A fork is a run of levels written one after another with the same `n`.**
// Two runs side by side with different numbers are two forks, each put in
// order among itself and never across: in `mint` the core is `fork: 2` and the
// rest `fork: 3`, so the core is finished before any of the rest is offered.
// `n` is only how many are offered at once. Three levels at `fork: 2` are a
// choice of two drawn out of the three, then a choice between the two left,
// then the last as it falls; six at `fork: 3` are four choices of three, each
// drawn out of whatever is left, one of two, and the last.
//
// A run of levels wrapped in `shuffle()` is the same rearrangement made *for*
// the person rather than *by* them: their order is drawn once, when the file
// is read, and nothing about it is ever offered or chosen. It is the same
// call that puts two blocks of a level in a random order, at the list above
// theirs, which is why a timeline ends `.flat()` — and why what is drawn or
// chosen is visible in the shape of the list rather than written as a word on
// every line.
//
// **The two go together on both forks**, and on purpose. Which levels a
// choice offers is drawn when it is offered, whatever is written, but which
// of them is recommended is the one written first — so written in a fixed
// order, the level written first would be recommended every time it was
// offered and the last never, and on the core most people take what is
// recommended. So each fork's order is drawn and *then* chosen from, and
// which level is recommended falls differently for every person. On the core
// that is counterbalancing, since it is asked of everybody. On the rest it is
// what lets a level's pull on its card be told from the recommendation's
// (`data/collected/overview.qmd`, **Choices**). Take a `shuffle()` away and
// that fork is still a fork, with the same level always recommended whenever
// it is offered.
//
// Both follow one rule: what is asked moves between places and where it is
// asked does not, so a level's number, its depth, its colour and which side
// of the seabed it falls on stay with the place.
//
// **Neither says anything about a study.** Which levels are drawn and which
// are chosen is a property of this run and not of the app: a battery that
// leaves one level of a fork leaves nothing to choose, and a run of one
// drawn level draws nothing.
//
// The written order is the default — what the recommendation follows, and
// what a battery that leaves one of them falls back on. A choice is saved as
// the answer of the level screen it was made on (`Level_<N>` in `items[]`,
// the level taken and then the ones passed over, in the order written);
// `levels` says the order that was actually walked. Every slot must be a
// scored level and every slot chosen for wants a scored level before it to be
// offered from; app.js throws otherwise, on a fork written on one level, and
// on an `n` that is not a whole number of 2 or more. A fork standing at level
// 1 has nothing to be offered from, so its first place is filled as written
// and the choosing starts at the second.
//
// Where the seabed falls among them all: the first two thirds of the scored
// levels are in the water and the rest are in the rock.
const WATER_SHARE = 2 / 3
//
// Each level carries a `key` as well as a `name`, the way a questionnaire and
// an item do: the key is what the saved file is written under (`ratings`,
// `qualityControl`) and the name is what the person reads. They are two
// things because the name is participant-facing prose and free to change for
// the sake of the test, while a column of a study's data is not — and because
// a name may hold an ampersand, a hyphen or an article, none of which a column
// name can keep. Two levels of one key throw in app.js.
//
// `minutes` is how long a level is said to take, on the card that offers it
// and on the taste of it at the foot of the level before. **It is read off
// the pilot runs and written in by hand**, not worked out from the items: the
// third of the way up the times of the runs that finished the level
// (`data/collected/overview.qmd`), rounded to the minute — a little under the
// median, which is the promise that gets a level started without being one
// that most people find broken. Rewrite them when there is more data. As of
// 27 September 2026 they stand on one to five finished runs a level, and
// How You Think, which nobody had finished, is a guess.
// **There is a timeline per battery**, each written out in full rather than
// one derived from the other, so that what a battery asks and in what order is
// read off its own list at a glance. The cost is that a level on both is
// written twice: a `name` or `minutes` rewritten on one wants rewriting on the
// other. A level's `key` must be the same wherever it is written, since it is
// the same level in the saved file whichever battery asked it.
//
// `mint` is the study the ethics application is being written for, asked
// only by a link that says `?project=mint`: General, then the core (the MINT,
// the BAIT and the HiTOP-BR) as a drawn fork of two, then the interim, then
// the rest as a drawn fork of three.
const TIMELINE_MINT = [
    { key: "General", name: "General", blocks: ["fipi", "singles"], minutes: 3 },
    shuffle([
        { key: "BrainBody", name: "Brain-Body Axis", blocks: ["mint"], fork: 2, minutes: 8 },
        { key: "AIExpertise", name: "AI Attitudes", blocks: ["bait"], fork: 2, minutes: 3 },
        { key: "MoodHealth", name: "Mood & Health", blocks: [shuffle(["mood", "health"]), "hitop"].flat(), fork: 2, minutes: 8 },
    ]),
    // The end of the main part of the study, and the way into the rest: an
    // interlude (see the head of this file), so it is asked after the last
    // core level's results and before whichever level comes next, and its
    // last screen is the choice of that level. Somebody who stops here has
    // answered everything the study needs of them.
    { interlude: true, blocks: ["interim"] },
    shuffle([
        { key: "Character", name: "Character", blocks: ["hexaco"], fork: 3, minutes: 5 },
        { key: "Archetypes", name: "Archetypes", blocks: ["archetypes"], fork: 3, minutes: 4 },
        { key: "World", name: "The World", blocks: ["primals"], fork: 3, minutes: 6 },
        { key: "Reasoning", name: "How You Think", blocks: ["icar"], fork: 3, minutes: 7 },
        { key: "Regulation", name: "Mind & Heart", blocks: ["regulation"], fork: 3, minutes: 7 },
        { key: "Opinions", name: "Where You Stand", blocks: ["opinions"], fork: 3, minutes: 5 },
    ]),
    { key: "Closing", name: "Closing", blocks: ["closing"] },
].flat()

// `all` is everything, and what a link naming no battery walks. It has no
// core: General, then every other level in one drawn fork of three, then the
// closing.
const TIMELINE_ALL = [
    { key: "General", name: "General", blocks: ["fipi", "singles"], minutes: 3 },
    shuffle([
        { key: "BrainBody", name: "Brain-Body Axis", blocks: ["mint"], fork: 3, minutes: 8 },
        { key: "AIExpertise", name: "AI Attitudes", blocks: ["bait"], fork: 3, minutes: 3 },
        { key: "MoodHealth", name: "Mood & Health", blocks: [shuffle(["mood", "health"]), "hitop"].flat(), fork: 3, minutes: 8 },
        { key: "Character", name: "Character", blocks: ["hexaco"], fork: 3, minutes: 5 },
        { key: "Archetypes", name: "Archetypes", blocks: ["archetypes"], fork: 3, minutes: 4 },
        { key: "World", name: "The World", blocks: ["primals"], fork: 3, minutes: 6 },
        { key: "Reasoning", name: "How You Think", blocks: ["icar"], fork: 3, minutes: 7 },
        { key: "Regulation", name: "Mind & Heart", blocks: ["regulation"], fork: 3, minutes: 7 },
        { key: "Opinions", name: "Where You Stand", blocks: ["opinions"], fork: 3, minutes: 5 },
        // Not in `mint`, which the ethics application does not cover it for,
        // and ASIDE below (October 2026): reached only by a link naming it
        // (`?start=sex`, `start/sex/`), which is how it is shared, and so not
        // among the levels the hub's dashboard offers. A fork's slots must be
        // scored levels, which is the whole reason one of its items carries a
        // dimension (see content/block_sex.js). Its minutes are a guess,
        // nobody having taken it.
        { key: "Sexuality", name: "Sexuality", blocks: ["sex"], fork: 3, minutes: 6 },
        // Written here so that it has a place, a key and a name, but ASIDE
        // below: a level on the philosophy of Howard's Hyborian Age, written to
        // be shared in the fandom, reached only by a link naming it
        // (`?start=hyborian`) and then walked first, ahead of General (see
        // content/block_hyborian.js). Its minutes are a guess.
        { key: "Hyborian", name: "Your Hyborian Hero", blocks: ["hyborian"], fork: 3, minutes: 3 },
        // ASIDE too, and in progress: a level on the dark side of personality,
        // reached only by `?start=dark` (see content/block_dark.js). So far it
        // asks twenty deeds, wrongs and good turns, and weighs them on a
        // balance; its minutes are a guess at the finished level.
        { key: "Dark", name: "Light & Dark", blocks: ["dark"], fork: 3, minutes: 5 },
    ]),
    { key: "Closing", name: "Closing", blocks: ["closing"] },
].flat()

// Batteries: the timelines above by name. A link with `?project=<name>` walks
// that one, so a study's battery is written in the repository, under a
// version, rather than in a URL somebody pasted, and **a link naming none, or
// one that is not here, walks `all`** — so a link for the MINT study has to
// say `?project=mint`. `?only=a,b` and `?skip=a,b` ask a part
// of it by hand, for testing, and `?start=a,b` brings the levels holding those
// blocks to the front — from whichever timeline has them, so `?start=sex`
// under `mint` walks the sexuality level first and `mint` after it. `closing`
// is always asked, since the run ends through it, and an interlude cannot be
// started on or brought in, being no level.
//
// **ASIDE is asked by no battery**: blocks on a timeline, so that their level
// has a place, a key and a name, that a run meets only when a link names them
// — `?start=hyborian`, `?start=dark` or `?start=sex` asks a block whatever
// the battery says and walks that level first. The hub's dashboard never
// offers one (app.js, `SUBTESTS`): they are for the people a link was shared
// with.
const BATTERIES = { mint: TIMELINE_MINT, all: TIMELINE_ALL }
const ASIDE = ["hyborian", "dark", "sex"]

// **The demographics are written on no level**: they open the run's first
// levels, one apiece and in this order — the first opens level 1, the second
// level 2, the third level 3 — whatever those levels turn out to hold. Which
// level stands second or third is drawn and then chosen, so a block written on
// one would be asked at a different depth by every person; written here, it
// belongs to the place, the way a level's number and depth do, and a fork
// moving a level into or out of that place leaves it where it is (app.js,
// `swapLevels`). A level a link starts on (`?start=`) is a hook and opens on
// its own questions, so the demographics open the levels after it instead.
// `closing` is never one of those places, the run ending through it; a run
// with fewer levels than this puts what is left at the head of its last. Every
// battery asks them, and `?only=` and `?skip=` name them like any other block.
// An interlude opening the same place goes before them.
const DEMOGRAPHICS = ["demographics1", "demographics2", "demographics3"]

// Blocks that come and go together, because one figure is drawn from both:
// the climb reads the PHQ-4 out of `mood` and the HiTOP-BR out of `hitop`,
// so asking either asks the other and skipping either skips both.
const HELD_TOGETHER = [["mood", "hitop"]]
