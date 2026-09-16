/* ==========================================================================
   content/timeline.js — what is asked, in what order, and the frame every
   block file beside it is written into. Read this before editing anything in
   content/; why it works the way it does is in AGENTS.md, and is not repeated
   here.

   FOUR LISTS, each knowing only the one under it:

     TIMELINE            the levels, asked top to bottom
       level             the blocks of that level, in order — and a `name`,
                         which is what the gauge, the level screen and the
                         results panel call it; a run of them sharing a `fork`
                         are taken in whatever order the person chooses
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
// short the list. Used on the blocks of a level asked in a random order.
function shuffle(arr) {
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
// A level written `beneath: true` lies under the seabed rather than in the
// water: the levels above it share the trench between them and reach its
// floor together, and it goes on into the rock underneath (app.js, `BEDROCK`),
// the water darkening into rock behind it and the gauge sounding "seabed +".
// Leaving the last level in the water for it goes through the crossing line,
// the way the quote closes over the way in. Write it on the last levels only.
//
// A run of consecutive levels written with the same `fork:` name is a fork:
// their order is the person's, two at a time. At the end of the level before
// them, and again at the end of each of them while more than one is left,
// the next two are shown side by side, blurred, and the person picks which
// to take first; the one passed over is offered again against the one after
// it, and the one written first is marked as recommended. It is the
// one thing about the run's order that is the participant's, there so that
// the descent is not one straight line. The written order is the default —
// what the recommendation follows, and what a battery that leaves one of
// them falls back on — and the name is what the choices are keyed by in the
// saved file, where each is an item of its own (`Fork_<name>_<n>`, standing
// at the head of the level it decided; `levels` says the order that was
// actually walked). They must all be scored levels, must all
// lie in the water or all in the rock, and want a scored level before them
// to be offered from; app.js throws on a fork written on one level, or on
// levels that are not next to each other. The World is left out of the water
// levels' fork on purpose: it is the floor, and the way beneath goes through it.
//
const TIMELINE = [
    { name: "General", blocks: ["demographics1", "fipi", "singles"] },
    { name: "Interoception", blocks: ["demographics2", "mint"], fork: "Water" },
    { name: "Attitudes to AI", blocks: ["bait"], fork: "Water" },
    { name: "Mood & Health", blocks: ["demographics3", shuffle(["mood", "health"]), "hitop"].flat(), fork: "Water" },
    { name: "Character", blocks: ["hexaco"], fork: "Water" },
    { name: "Archetypes", blocks: ["archetypes"], fork: "Water" },
    { name: "The World", blocks: ["primals"] },
    { name: "Reasoning", blocks: ["icar"], beneath: true },
    { name: "Passion & Restraint", blocks: ["regulation"], beneath: true },
    { name: "Closing", blocks: ["closing"] },
]

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
