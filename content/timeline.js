/* ==========================================================================
   content/timeline.js — what is asked, in what order, and the frame every
   block file beside it is written into. Read this before editing anything in
   content/; why it works the way it does is in AGENTS.md, and is not repeated
   here.

   FOUR LISTS, each knowing only the one under it:

     TIMELINE            the levels, asked top to bottom
       level             the blocks of that level, in order — and a `name`,
                         which is what the gauge, the level screen and the
                         results panel call it; the ones marked `fork` are
                         taken in whatever order the person chooses, and a run
                         of them wrapped in `shuffle()` in one drawn for them
         block           its entries: briefings and questionnaires, in order
           questionnaire its items

   A block is one stretch of the run that moves as a piece — a file of its own,
   `content/block_<name>.js`. Moving one between levels is moving its name from
   one line of TIMELINE to another, and a block named nowhere here is never
   asked however completely it is written.

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
             key: "BriefingExample",     // a heading and a few paragraphs saying
             text: "<h2>…</h2><p>…</p>", // what the next stretch is about. Its
           },                              // continue response and timings are recorded.
         {
             key: "example",             // what a score is traced back by
             name: "Interoception",      // what the results screen calls it
             profile: false,             // optional: keep its dimensions off the
                                         // whole-run profile web and card
             results: false,             // optional: keep its norms but open no
                                         // section on its level — fed back nowhere
             instructions: "shown under every item of this one (HTML)",
             format: { … },              // the scale, below
             norms: {                    // no norms, no results: a dimension
                 "A Dimension": {        // with nothing to be placed against is
                                         // asked and saved, and fed back nowhere
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

   An option with `image:` (a path under `assets/`) is a picture on a tile,
   its `text` under it as a caption — and still what is saved and what the
   keyboard answers by; the picture is only how it is shown. An option with
   `small: true` is set below the others, for a way out of a
   question rather than an answer to it. A question of ten or more options
   wants `columns: 2`. `max` on a text field is how long the answer may run.

   An option marked `custom: true` — "Something else", "Other" — is an answer
   outside the scale: a category of its own, not a point on it. It is asked,
   chosen and saved like any other, but the engine keeps it out of the scale's
   bounds and never counts it into a dimension's score, so its `value` is only
   a label for `showIf` to match (the convention is 99, or 0 for "Other" at
   the foot of a ladder of real codes). `small: true` beside it is the look;
   this is the meaning.

   Types: `"choice"` and `"input"` are read off the format and need not be
   written. `"multi"` and `"curve"` are written, on the item or on the
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
// on a run of levels asked in one (see TIMELINE).
//
// **Outside a browser it draws nothing and hands the written order back.**
// This file is also read by `data/synthetic/codebook.js`, and through it by
// `docs/build_slides.py`, and what those two describe is *what is asked*
// rather than one draw of it: a level's number in the deck's Content table
// has to be the same every time the table is built, or the published table
// changes under a link that points at it. A shuffle says these may come in
// any order, and the written one is the representative of all of them.
function shuffle(arr) {
    if (typeof window === "undefined") return arr
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
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
// the water darkening into rock behind them and the gauge sounding "seabed +".
// Leaving the last level in the water goes through the crossing line, the way
// the quote closes over the way in. It is a share and not a flag so that the
// break holds its place however many levels a battery asks and wherever the
// fork has put them — which level is the floor is the descent's business and
// not the content's.
//
// Levels written `fork: true` are a fork: their order is the person's, two
// at a time. The places they take are the **slots** — the positions on this
// timeline that carry the flag — and what goes in them is
// the person's to arrange. At the end of the level before each slot, while
// more than one level is left to fill it with, the two standing next are
// shown side by side, blurred, and the person picks which to take first; the
// one passed over falls to the slot after, and the one written first is
// marked as recommended. It is the one thing about the run's order that is
// the participant's, there so that the descent is not one straight line.
//
// A run of levels wrapped in `shuffle()` is the same rearrangement made *for*
// the person rather than *by* them: their order is drawn once, when the file
// is read, and nothing about it is ever offered or chosen. It is the same
// call that puts two blocks of a level in a random order, at the list above
// theirs, which is why TIMELINE ends `.flat()` — and why what is drawn or
// chosen is visible in the shape of the list rather than written as a word on
// every line. Use it for a stretch that has to be ordered somehow but has
// nothing worth choosing about: three questionnaires a study asks of
// everybody want counterbalancing, not picking.
//
// Below the drawn run, the levels marked `fork` are put in order by the
// person, two at a time. Both follow one rule: what is asked moves between
// places and where it is asked does not, so a level's number, its depth, its
// colour and which side of the seabed it falls on stay with the place.
//
// **Neither says anything about a study.** Which levels are drawn and which
// are chosen is a property of this run and not of the app: a battery that
// leaves one level of the fork leaves nothing to choose, and a run of one
// drawn level draws nothing.
//
// The written order is the default — what the recommendation follows, and
// what a battery that leaves one of them falls back on. A choice is saved as
// the answer of the level screen it was made on (`Level_<N>` in `items[]`,
// the level taken and then the one passed over); `levels` says the order
// that was actually walked. Every slot must be a scored level and every slot
// chosen for wants a scored level before it to be offered from; app.js
// throws otherwise, and on a fork written on one level. A fork standing at
// level 1 has nothing to be offered from, so its first place is filled as
// written and the choosing starts at the second.
//
// Where the seabed falls among them all: the first two thirds of the scored
// levels are in the water and the rest are in the rock.
const WATER_SHARE = 2 / 3
//
const TIMELINE = [
    { name: "General", blocks: ["demographics1", "fipi", "singles"] },
    shuffle([
        { name: "Brain-Body Axis", blocks: ["demographics2", "mint"] },
        { name: "AI Expertise & Usage", blocks: ["bait"] },
        { name: "Mood & Health", blocks: ["demographics3", shuffle(["mood", "health"]), "hitop"].flat() },
    ]),
    { name: "Character", blocks: ["hexaco"], fork: true },
    { name: "Archetypes", blocks: ["archetypes"], fork: true },
    { name: "The World", blocks: ["primals"], fork: true },
    { name: "Reasoning", blocks: ["icar"], fork: true },
    { name: "Passion & Restraint", blocks: ["regulation"], fork: true },
    { name: "Closing", blocks: ["closing"] },
].flat()

// Batteries: named subsets of the timeline's blocks, for a study that wants
// less than the whole run. A link with `?battery=<name>` asks the blocks
// named here and nothing else, in the timeline's own order — app.js applies
// the list and never reorders — so a study's battery is written in the
// repository, under a version, rather than in a URL somebody pasted.
// `?only=a,b` and `?skip=a,b` do the same by hand, for testing. `closing`
// need not be written: it is always asked, since the run ends through it. A
// link with no battery asks everything. The two below are examples, to be
// edited or replaced when a study is designed.
const BATTERIES = {
    test: ["icar", "regulation"],
}

// Blocks that come and go together, because one figure is drawn from both:
// the climb reads the PHQ-4 out of `mood` and the HiTOP-BR out of `hitop`,
// so asking either asks the other and skipping either skips both.
const HELD_TOGETHER = [["mood", "hitop"]]
