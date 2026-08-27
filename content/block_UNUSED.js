/* ==========================================================================
   content/block_UNUSED.js — questionnaires that are written but not asked.
   Nothing here defines a block, so nothing here can be reached; this is where
   something waits until it is ready rather than being deleted and written
   twice. Moving one out means giving it a block file of its own and a name on
   a level of content/timeline.js.

   GJS — Global Job Satisfaction, the single-item version (Wanous et al.,
   1997). DISABLED because it puts the question to everybody without asking
   first whether there is a job to answer it about. Waking it takes an
   employment item to hang a `showIf` on, this block uncommented in a file of
   its own, and its name written into a level of the timeline — and note that
   an escape option cannot simply be added instead, since whatever is chosen
   would feed a number into the score.
   ========================================================================== */

// defineBlock("gjs", [
//     {
//         key: "gjs",
//         name: "Work",
//         instructions: "",
//         format: {
//             options: [1, 2, 3, 4, 5, 6, 7],
//             anchors: ["Very dissatisfied", "Very satisfied"],
//             color: "#009688",
//             hovercolors: ["#ef4444", "#22c55e"],
//         },
//
//         // PLACEHOLDER NORMS — invented numbers, on the 1-7 scale of the item.
//         norms: {
//             "Job Satisfaction": {
//                 mean: 4.6,
//                 sd: 1.5,
//                 interpretations: {
//                     low: "your work is not currently giving you much back, whatever else it is doing for you.",
//                     mid: "your work suits you well enough, with parts of it you would change given the chance.",
//                     high: "your work agrees with you, and you get a good deal out of the doing of it.",
//                 },
//             },
//         },
//
//         items: [
//             {
//                 key: "GJS_JobSatisfaction",
//                 dimension: "Job Satisfaction",
//                 text: "Overall, how satisfied are you with your job?",
//             },
//         ],
//     },
// ])
