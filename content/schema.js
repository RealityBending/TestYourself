/* ==========================================================================
   content/schema.js — how a questionnaire is written. The questions themselves
   are in the level files beside it, one per level of the run.

   questionnaire = {
     instructions: text shown under each item (HTML ok)
     level:        items of earlier levels are asked first (default: 1)
     format: {
       options: [0, 1, 2]                         -> numbered circles, or
                [{ value: 0, text: "Not at all" }] -> labelled buttons
                  an option with `small: true` is set below the others, for a
                  way out of a question rather than an answer to it
       anchors: ["left text", "right text"]       // optional, sides of the scale
       color:   colour of the selected response
       hovercolors: ["#ef4444", "#22c55e"]        // optional: the options light
                                                  // up along this gradient
       columns: 2                                 // optional, labelled options
                                                  // only: lay them out in this
                                                  // many columns rather than
                                                  // stacked. A `small` option
                                                  // still spans the full width.
     }
     shuffle: false to present the items in the order written (default: true)
     items: [ { key: "<itemKey>", text: "the question", dimension: "..." }, ... ]
                   an item's `text` is HTML, so a question may carry its own
                   stem: "Over the last 2 weeks...<br /><em>the thing asked</em>"
   }

   `format`, `instructions`, `level` and `shuffle` above are defaults: an item
   may carry its own entry of the same name, which then wins for that item. An
   item with `shuffle: false` keeps its position while the others move around
   it, and `instructions: ""` shows none. An item's `format` replaces the
   questionnaire's outright, so it has to be complete.

   Instead of `options`, a format may ask for a typed answer:
     format: { input: "number", min: 18, max: 120, placeholder: "Age in years" }
     format: { input: "text", max: 60, placeholder: "In your own words" }
   A number outside its bounds will not be taken. `tooLow` and `tooHigh` are the
   messages shown when it is, so that the refusal says why:
     format: { input: "number", min: 18, tooLow: "You must be 18+ to take part" }
   A written answer is taken as soon as there is anything in it; `max` is how
   many characters it may run to.

   A format may write its own numbers over the values behind them:
     format: { options: [0, 1, 2, 3], labels: ["--", "-", "+", "++"] }
   The circles then say what `labels` says, one per option, and the answer is
   recorded as it was read. The values are untouched, so scoring, reversals,
   norms and every chart work the same whatever is written on the scale.

   An item may be asked only of some people:
     showIf: { key: "<otherItemKey>", is: 3 }   // or `is: [3, 4]` for any of
   It is skipped until that answer is given, and if the answer later changes,
   the item is skipped again and whatever it held is dropped. Write such items
   directly after the one they branch from, with `shuffle: false`, so they are
   asked in the right place.

   `dimension` is what the item measures. Items sharing one are averaged into a
   score, which appears once every item of that dimension has been answered. An
   item with no `dimension` (an attention check, say) is left out of scoring.

   An item that says what its own answer must be carries it:
     check: 0        // an attention check: any other answer counts as failed
   Nothing is said about it on screen — it is counted in the quality-control
   indices saved with the data, part by part, and nowhere else.

   An item written the wrong way round for the dimension it feeds carries
   `reverse: true`, and is counted backwards into it — the top of its scale
   scores as the bottom. The answer itself is recorded as it was given.

   A questionnaire may also carry:
     name:  what the results screen calls it
     norms: { <dimension>: { mean, sd, interpretations: { low, mid, high } } }
            The mean and SD place a score against the population, giving a
            percentile, and draw the average person on the charts. The tercile
            the score falls in picks the interpretation shown; a dimension with
            no `interpretations` simply shows no prediction.
   ========================================================================== */

// The MINT is asked on one of two scales, drawn when the page loads and saved
// with the answers as `formatMint`: seven points counted straight through, or
// the same seven about a middle of nothing. Only what is written on the circles
// differs — the values behind them are the same either way — so this changes
// what people are shown and nothing about what is made of it.
const formatMint = Math.random() < 0.5 ? "sequential7" : "symmetric7"

// Every questionnaire there is, filled in by the level files loaded after this
// one. They are kept apart by the level they are asked on rather than by what
// they measure, so that the file to open is the part of the run being changed.
const QUESTIONNAIRES = {}
