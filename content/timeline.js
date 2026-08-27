/* ==========================================================================
   content/timeline.js — what is asked, in what order, and the frame every
   block file beside it is written into. Read this before editing anything in
   content/; why it works the way it does is in AGENTS.md, and is not repeated
   here.

   FOUR LISTS, each knowing only the one under it:

     TIMELINE            the levels, asked top to bottom
       level             the blocks of that level, in order
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
                 { key: "Example_4", text: "…", showIf: { key: "Example_1", is: [3, 4] } },
             ],
         },
     ])

   `format`, `instructions`, `shuffle` and `type` are questionnaire-wide
   defaults that an item may override for itself; an item's own `format`
   replaces the questionnaire's outright, so it has to be complete.

   A FORMAT is either a scale to choose from:

     format: {
         options: [0, 1, 2, 3],                       // numbered circles, or
                  [{ value: 0, text: "Not at all" }], // labelled buttons
         labels: ["--", "-", "+", "++"],  // optional: written over the values
         anchors: ["Disagree", "Agree"],  // optional: the two ends of the scale
         columns: 2,                      // optional: labelled options only
         color: "#e0457b",                // the chosen response
         hovercolors: ["#ef4444", "#22c55e"], // optional: options light up along it
     }

   ...or a field to type into:

     format: { input: "number", min: 18, max: 120, placeholder: "Age in years",
               tooLow: "You must be 18+ to take part", tooHigh: "…" }
     format: { input: "text", max: 60, placeholder: "In your own words" }

   ...or, for `type: "curve"`, a stretch of a bell curve to place yourself on:

     format: { min: 0, max: 100, color: "#0e7490" }

   The answer is the share of people below where the mark is clicked — the area
   filled under the curve — and it is recorded as the number that was on
   screen. Nothing else is written: the curve has no options and takes no
   anchors.

   An option with `small: true` is set below the others, for a way out of a
   question rather than an answer to it. A question of ten or more options
   wants `columns: 2`. `max` on a text field is how long the answer may run.

   Types: `"choice"` and `"input"` are read off the format and need not be
   written. `"curve"` is written, on the item or on the questionnaire around
   it. `"briefing"` is written too, and only ever on a block entry.
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

// The run itself. One entry per level, asked in this order; a level with
// nothing scored in it opens no results and takes no share of the descent,
// which is what the closing level is for — the last question is asked after
// the final results have been read rather than instead of them. Keep it last,
// and keep it alone.
const TIMELINE = [
    { blocks: ["demographics1", "fast"] },
    { blocks: ["demographics2", "mint"] },
    { blocks: ["phq4", "mentalhealth"] },
    { blocks: ["closing"] },
]
