/* ==========================================================================
   content/timeline.js — what is asked, in what order, and the frame every
   block file beside it is written into. Read this before editing anything in
   content/: it says what the fields are, and AGENTS.md says why.

   FOUR LISTS, each knowing only the one under it:

     TIMELINE_MINT,      the levels, asked top to bottom — one timeline a
     TIMELINE_ALL        battery, `BATTERIES` naming them
       level             a `key` (what the saved file is written under), a
                         `name` (what the person reads), `minutes`, and its
                         blocks in order; `fork: n` and `shuffle()` reorder
                         levels (below)
         block           its entries: briefings and questionnaires, in order
           questionnaire its items

   A block is one stretch of the run that moves as a piece, a file of its own
   (`content/block_<name>.js`), and one named on no timeline is never asked.
   Two kinds are named on no level. The demographics (`DEMOGRAPHICS`, below)
   open the first three places. An **interlude**, written
   `{ interlude: true, blocks: [...] }` between two levels, opens the place
   after it and counts towards no level; a briefing in it written
   `onward: true` is left by the fork's choice instead of a button. Both
   belong to the place, whatever the fork puts there. The interim in `mint`
   is the one interlude.

   A questionnaire is the unit of shuffling and the only one: its items come
   in any order but together, and everything else holds the order written
   here. `shuffle: false` on an item keeps it in place. Instruments meant to
   be asked in among each other go in one questionnaire.

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

   `correct:` marks an item with a right answer, counted 1 or 0 into its
   dimension. It holds `answerKey(key, value)` rather than the answer, which
   keeps the key off a casual reading of the source (obfuscation, not
   secrecy). Make one in the page's console: `answerKey("Example_5", 4)`.

   `format`, `instructions`, `shuffle` and `type` are questionnaire-wide
   defaults an item may override; an item's own `format` replaces the
   questionnaire's outright, so it has to be complete.

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

   ...or, for `type: "multi"`, the same options, several of which may be
   ticked; Continue ends the item and the answer is a list. An option written
   `exclusive: true` ("none of these") clears the others and is cleared by
   them, and a `showIf` on such an item opens on any of its `is:` values.

   ...or a field to type into:

     format: { input: "number", min: 18, max: 120, placeholder: "Age in years",
               tooLow: "You must be 18+ to take part", tooHigh: "…" }
     format: { input: "text", max: 60, placeholder: "In your own words" }
     format: { input: "text", multiline: true, optional: true, max: 3000, placeholder: "…" }

   `max` on a text field is its length, `multiline` makes it a box of several
   lines (Ctrl+Enter takes it), and `optional` lets it be left blank, saved as
   an empty string.

   ...or, for `type: "curve"`, a place on a bell curve, saved as the share of
   people below it:

     format: { min: 0, max: 100, color: "#0e7490" }

   ...or, for `type: "slider"`, a point on a line between two ends, saved as
   the number (`unit` is only shown):

     format: { min: 0, max: 100, step: 1, unit: "%", anchors: ["Certainly false", "Certainly true"], color: "#6aa7f0" }

   A slider's only `options` are ways out, valued off the line (app.js throws
   otherwise) and taken on the press:

     options: [{ value: 999, text: "This doesn't apply to me", small: true, custom: true }]

   An OPTION may also carry:

     image:     a picture on a tile, its `text` the caption under it (and still
                what is saved and what the keyboard answers by)
     small:     set below the others, for a way out rather than an answer
     showIf:    offered only while that answer is given — the 31st waits on a
                month that has one
     custom:    an answer outside the scale ("Other"), kept out of its bounds
                and never scored, so choosing one leaves the dimension
                unscored; its value is only for `showIf` to match (99 by
                convention)
     declined:  "I'd rather not say": no answer, so the item is left out and
                the dimension scored on the rest while `enough` of them are
     score:     what choosing it is worth, where its value cannot say it

   A question of ten or more options wants `columns: 2`.

   Types: `"choice"` and `"input"` are read off the format. `"multi"`,
   `"curve"`, `"slider"` and `"grid"` (see `gridOf` in block_sex.js) are
   written, on the item or its questionnaire, and `"briefing"` only on a block
   entry.
   ========================================================================== */

// Every questionnaire and block, filled in by the block files loaded after
// this one. A questionnaire is filed under its own key, so that a score can be
// traced back to what asked for it.
const QUESTIONNAIRES = {}
const BLOCKS = {}

function defineBlock(name, entries) {
    for (const entry of entries) if (entry.type !== "briefing") QUESTIONNAIRES[entry.key] = entry
    BLOCKS[name] = entries
}

// The hash an item with a right answer carries in place of it: FNV-1a over
// "<key>=<value>", as eight hex characters. The engine hashes the answer
// given the same way and compares.
function answerKey(key, value) {
    const text = key + "=" + String(value)
    let hash = 0x811c9dc5
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193) >>> 0
    }
    return ("0000000" + hash.toString(16)).slice(-8)
}

// Fisher–Yates, in place, off the seeded `chance()` (js/resume.js), so that a
// run carried on is drawn again as it was. Outside a browser it draws nothing
// and hands the written order back: `data/synthetic/codebook.js` and the
// docs' Content table read this file too, and describe what is asked rather
// than one draw of it.
function shuffle(arr) {
    if (typeof window === "undefined") return arr
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(chance() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

// THE TIMELINES. One entry per level, asked in this order. The closing is
// last and alone: a level with nothing scored opens no results, so the last
// results are read before the run ends rather than instead of its last
// question. A level's colour on the gauge is not written here (app.js,
// `levelColour`).
//
// `key` never changes, being a column of the saved file; `name` is prose and
// may. `minutes` is how long a level is said to take on the way to it,
// written by hand: the third of the way up the finished runs' times in
// `data/collected/overview.qmd`, rounded. As of 27 September 2026 they stand
// on one to five runs a level; rewrite them when there is more data.
//
// FORKS. Levels written `fork: n` one after another are a fork: at the end of
// the level before each of its places, `n` of the levels still to place are
// drawn and offered as cards, and the person picks the next. A change of `n`
// starts another fork, which is how the core (`fork: 2`) is finished before
// the rest (`fork: 3`) is offered. The card written first is recommended, so
// each fork is also wrapped in `shuffle()`, which draws its written order once
// a run: on the core that counterbalances, on the rest it lets a level's pull
// be told from the recommendation's. What is asked moves between places; a
// level's number, depth and colour stay with the place. Every slot must be a
// scored level with one before it to be offered from, and `n` a whole number
// of 2 or more, or app.js throws (AGENTS.md, **The fork**).
//
// Each battery's timeline is written out in full, so a level on both is
// written twice: change its `name` or `minutes` on both, and keep its `key`
// the same.

// The first two thirds of the scored levels are in the water and the rest in
// the rock, wherever the forks put them (app.js, `waterLevels`).
const WATER_SHARE = 2 / 3

// `mint`, the study the ethics application covers (`?project=mint`): General,
// the core as a drawn fork of two, the interim, the rest as a drawn fork of
// three.
const TIMELINE_MINT = [
    { key: "General", name: "General", blocks: ["fipi", "singles"], minutes: 3 },
    shuffle([
        { key: "BrainBody", name: "Brain-Body Axis", blocks: ["mint"], fork: 2, minutes: 8 },
        { key: "AIExpertise", name: "AI Attitudes", blocks: ["bait"], fork: 2, minutes: 3 },
        { key: "MoodHealth", name: "Mood & Health", blocks: [shuffle(["mood", "health"]), "hitop"].flat(), fork: 2, minutes: 8 },
    ]),
    // The end of the main part of the study: asked after the last core level's
    // results, its last screen the choice of what comes next. Somebody who
    // stops here has given the study all it needs.
    { interlude: true, blocks: ["interim"] },
    shuffle([
        { key: "Character", name: "Character", blocks: ["hexaco"], fork: 3, minutes: 5 },
        { key: "Archetypes", name: "Archetypes", blocks: ["archetypes"], fork: 3, minutes: 4 },
        { key: "World", name: "The World", blocks: ["primals"], fork: 3, minutes: 6 },
        { key: "Regulation", name: "Mind & Heart", blocks: ["regulation"], fork: 3, minutes: 7 },
        { key: "Opinions", name: "Where You Stand", blocks: ["opinions"], fork: 3, minutes: 5 },
    ]),
    { key: "Closing", name: "Closing", blocks: ["closing"] },
].flat()

// `all`, everything, and what a link naming no battery walks: General, then
// every other level in one drawn fork of three.
const TIMELINE_ALL = [
    { key: "General", name: "General", blocks: ["fipi", "singles"], minutes: 3 },
    shuffle([
        { key: "BrainBody", name: "Brain-Body Axis", blocks: ["mint"], fork: 3, minutes: 8 },
        { key: "AIExpertise", name: "AI Attitudes", blocks: ["bait"], fork: 3, minutes: 3 },
        { key: "MoodHealth", name: "Mood & Health", blocks: [shuffle(["mood", "health"]), "hitop"].flat(), fork: 3, minutes: 8 },
        { key: "Character", name: "Character", blocks: ["hexaco"], fork: 3, minutes: 5 },
        { key: "Archetypes", name: "Archetypes", blocks: ["archetypes"], fork: 3, minutes: 4 },
        { key: "World", name: "The World", blocks: ["primals"], fork: 3, minutes: 6 },
        // Out of 1.0, on both timelines: too long where it sat, and to be
        // thought again. Its block, figure and pictures are all still there.
        // { key: "Reasoning", name: "How You Think", blocks: ["icar"], fork: 3, minutes: 7 },
        { key: "Regulation", name: "Mind & Heart", blocks: ["regulation"], fork: 3, minutes: 7 },
        { key: "Opinions", name: "Where You Stand", blocks: ["opinions"], fork: 3, minutes: 5 },
        // The next three are in ASIDE (below), so asked only through a link
        // naming them, and their minutes are guesses. Light & Dark is still
        // being written.
        { key: "Sexuality", name: "Sexuality", blocks: ["sex"], fork: 3, minutes: 6 },
        { key: "Hyborian", name: "Your Hyborian Hero", blocks: ["hyborian"], fork: 3, minutes: 3 },
        { key: "Dark", name: "Light & Dark", blocks: ["dark"], fork: 3, minutes: 5 },
    ]),
    { key: "Closing", name: "Closing", blocks: ["closing"] },
].flat()

// `?project=<name>` picks a timeline, and a link naming none, or one that is
// not here, walks `all`, so a link for the MINT study has to say
// `?project=mint`. ASIDE is asked by no battery: `?start=<block>` brings one
// in, walked first, whatever the battery says, and the hub's dashboard never
// offers one (app.js, `SUBTESTS`). `?only=`, `?skip=` and `?start=` are under
// **Batteries** in AGENTS.md.
const BATTERIES = { mint: TIMELINE_MINT, all: TIMELINE_ALL }
const ASIDE = ["hyborian", "dark", "sex"]

// The demographics open the run's first three levels, one apiece and in this
// order, whatever those levels hold, so that every run asks them at the same
// depth: they belong to the place, and a fork leaves them where they are
// (app.js, `swapLevels`). A level a link starts on opens on its own questions
// and they follow it; they are never asked on the closing; an interlude in
// the same place goes before them.
const DEMOGRAPHICS = ["demographics1", "demographics2", "demographics3"]

// Blocks that come and go together, because one figure is drawn from both:
// the climb reads the PHQ-4 out of `mood` and the HiTOP-BR out of `hitop`.
const HELD_TOGETHER = [["mood", "hitop"]]
