/* ==========================================================================
   content/block_lies.js — the lying of the Light & Dark level: Serota's lie
   count and the LPQ (November 2026). One of the level's three blocks, with
   `dark` (the briefing, and the level's notes at the head of
   content/block_dark.js) and `deeds` (content/block_deeds.js). This one and
   the deeds are asked in an order drawn for each run (content/timeline.js),
   so nothing here may assume the deeds have or have not been asked, and the
   three come and go together (HELD_TOGETHER). A name in capitals in
   brackets — THE PLAN, RESULTS, WHAT WAS CUT — is a section of the head of
   content/block_dark.js.
   ========================================================================== */

// The level's red, the wrongs' grid's (DEED_COLOUR in block_deeds.js),
// written again under a name of its own: a block file reads the timeline's
// globals and nothing of another block's, and two files declaring one
// `const` would stop the page loading.
const LIE_COLOUR = "#b23a3a"

defineBlock("lies", [
    // SEROTA'S LIE COUNT, the first thing this block asks: one typed
    // number, the lies told in the past day — how often a person lies as a
    // behaviour, where the LPQ's items after it (`lpq`) ask how well, as a
    // self-description. It is the one-item daily measure of Serota,
    // Levine & Docan-Morgan (2021, Communication Monographs; the follow-up to
    // Serota, Levine & Boster, 2010), checked against the paper (November
    // 2026). Their participants read a paragraph first — "Most people think a
    // lie occurs any time you intentionally try to mislead someone. Some lies
    // are big while others are small; some are completely false statements
    // and others are truths with a few essential details made up or left
    // out…", lies told for a good reason, selfish lies and lies that protect
    // others, then "Think about where you were and what you were doing during
    // the past 24 h, from this time yesterday until right now" and who they
    // might have lied to and how — and then answered "In the past 24 h, how
    // many times have you lied? Write in one number for your total lies. If
    // you told no lies, write in "0"." Here the recall cue is the lead-in, the
    // question is theirs with the hours written out, and the definition and
    // the who-and-how are cut to the gloss under it, a paragraph read before a
    // single number being a briefing's length on an item's screen; so it is
    // adapted, and never pooled with their data as the same item.
    //
    // First in its block, so that the LPQ's sixteen statements about lying do
    // not colour a recall of the last day. The deeds are another matter:
    // twenty-four grids about things ever done, three of them lies, could
    // prompt a count of more or of fewer, and this block and the deeds come in
    // an order drawn for each run (content/timeline.js), so half the runs
    // count before the deeds and half after, and the saved file's `levels`
    // says which — whether it moves the count is a question the data can
    // answer, where a fixed order would have hidden it. What to expect, from
    // 1,000 American adults (Serota et al., 2010): a mean of 1.65 lies a day,
    // 59.9% telling none and half of all the lies told by 5.3% of people — a
    // long tail, which is why it is a count and not a scale. No dimension yet:
    // it is the frequency half of the mask (THE PLAN, RESULTS) and is read by
    // nothing until the mask is drawn. The cap is a guard against a slip of
    // the keyboard and no more.
    {
        key: "liecount",
        name: "Lies Told",
        instructions: "Think about where you were and what you were doing in the past 24 hours, from this time yesterday until now",
        items: [
            {
                key: "Lie_Count",
                text:
                    "In the past 24 hours, how many times have you lied?<br /><br />" +
                    "<small>A lie is any time you intentionally try to mislead someone: big or small, a false statement or a truth with details made up or left out, told for a good reason or a selfish one. Count every one, whoever it was told to and however, face to face, in writing, by phone or online. If you told none, write 0.</small>",
                format: {
                    input: "number",
                    min: 0,
                    max: 200,
                    placeholder: "Number of lies",
                    tooHigh: "Please write a number from 0 to 200",
                    color: LIE_COLOUR,
                },
            },

            // THE WHITE LIES (November 2026): of the lies just counted, how
            // many were told for the other person — to spare their feelings,
            // to be polite, to avoid a fuss — rather than for one's own
            // benefit. DePaulo, Kashy, Kirkendol, Wyer and Epstein (1996,
            // JPSP 70, 979-995) found about a quarter of everyday lies
            // other-oriented, and that is the split the count alone cannot
            // make: a kind person who tells white lies all day and a
            // manipulator give the same number. Asked only after a count
            // above nought (`showIf` on every number the field can take),
            // worded from the count so that it reads as one question in two
            // parts, the one-lie case asked as 1 or 0. Capped at 200 like
            // the count, since the field's bound cannot follow an answer; an
            // answer above the count is impossible and is read back at
            // analysis time (capped to it, or the pair dropped). Scored
            // nowhere; the mask reads the count (THE PLAN). Keyed under
            // `Lie_`, the block's rule, and after `Lie_Count`, whose
            // follow-up it is.
            {
                key: "Lie_Count_ForOthers",
                showIf: { key: "Lie_Count", is: Array.from({ length: 200 }, (_, i) => i + 1) },
                text: (answer) => {
                    const count = answer("Lie_Count")
                    return count === 1
                        ? "Was that one lie told for the other person's sake, to spare their feelings, to be polite or to avoid a fuss, rather than for your own benefit?<br /><br /><small>Write 1 if it was and 0 if it was not.</small>"
                        : "Of those " + count + " lies, how many were told for the other person's sake, to spare their feelings, to be polite or to avoid a fuss, rather than for your own benefit?"
                },
                format: {
                    input: "number",
                    min: 0,
                    max: 200,
                    placeholder: "Number of lies",
                    tooHigh: "Please write a number from 0 to 200",
                    color: LIE_COLOUR,
                },
            },
        ],
    },

    // THE LPQ, straight after the count: the Lying Profile Questionnaire
    // (Makowski, Pham, Lau, Raine & Chen, 2023, Current Psychology 42,
    // 4001-4016; online 2021), all sixteen items in its four subscales of
    // four — Ability, how well a person lies, the skill half of the mask
    // (THE PLAN, RESULTS); Frequency, how often, as a self-description, to
    // set beside the count's behaviour over a day; Negativity, reluctance to
    // lie on moral or emotional grounds; and Contextuality, lying as right or
    // wrong by the situation. Verbatim from the instructions and items the lab
    // keeps beside the paper (Deception_Scale_LIE.docx in
    // github.com/DominiqueMakowski/2020structure, read November 2026),
    // "refrain myself" and all, as is the scale: "a visual analog scale …
    // from 1 (Disagree) to 10 (Agree), with no other options in between", the
    // items in any order, a dimension the mean of its four and none reversed
    // — so a slider over 1 to 10 with no number on it, the MINT's slider
    // (`reading: false`), the sixteen shuffled together. Its instructions
    // there are the definition of a lie the count's gloss has just given
    // (Serota's, which the LPQ's were written from) and a word on anonymity
    // the briefing gives, so the lead-in is only the question the scale
    // answers. Ability alone was asked until November 2026 (the plan's
    // budget; WHAT WAS CUT); whole, the published LPQ is scored as published
    // and its Frequency can be checked against the count.
    //
    // No norms, so nothing on screen reads it yet: the paper's means are of
    // a Singaporean sample on this scale, and the mask, which is what will
    // read Ability, places the two halves against their own midpoints rather
    // than against other people (the heads' rule). No way out either, the
    // published scale having none.
    //
    // Keyed `Lie_` with the count rather than `LPQ_`, so that everything the
    // level asks about lying sorts together in a saved file and `^Lie_` finds
    // it; the subscale is the second segment and the last counts within it,
    // the published item number in a comment beside each (Ability's are the
    // same), the primals' way, which keeps every number under ten. Which
    // instrument an item came from is said here, the opinions level's rule.
    {
        key: "lpq",
        name: "Lying",
        profile: false,
        instructions: "How much do you agree with this statement?",
        type: "slider",
        format: {
            min: 1,
            max: 10,
            step: 0.01,
            reading: false,
            anchors: ["Disagree", "Agree"],
            color: LIE_COLOUR,
        },
        items: [
            { key: "Lie_Ability_1", dimension: "Lying Ability", text: "I can lie well" }, // LPQ 1
            { key: "Lie_Ability_2", dimension: "Lying Ability", text: "I am a good liar" }, // LPQ 2
            { key: "Lie_Ability_3", dimension: "Lying Ability", text: "It is hard for others to detect my lies" }, // LPQ 3
            { key: "Lie_Ability_4", dimension: "Lying Ability", text: "It is easy for me to make up clever lies" }, // LPQ 4
            { key: "Lie_Frequency_1", dimension: "Lying Frequency", text: "I have a tendency to lie" }, // LPQ 5
            { key: "Lie_Frequency_2", dimension: "Lying Frequency", text: "I lie more often than most people do" }, // LPQ 6
            { key: "Lie_Frequency_3", dimension: "Lying Frequency", text: "I find it difficult to refrain myself from lying" }, // LPQ 7
            { key: "Lie_Frequency_4", dimension: "Lying Frequency", text: "I lie frequently" }, // LPQ 8
            { key: "Lie_Negativity_1", dimension: "Lying Negativity", text: "Lying is against my principles" }, // LPQ 9
            { key: "Lie_Negativity_2", dimension: "Lying Negativity", text: "I feel guilty after lying" }, // LPQ 10
            { key: "Lie_Negativity_3", dimension: "Lying Negativity", text: "It is bad to lie" }, // LPQ 11
            { key: "Lie_Negativity_4", dimension: "Lying Negativity", text: "I always avoid lying if I can" }, // LPQ 12
            { key: "Lie_Contextuality_1", dimension: "Lying Contextuality", text: "It is okay to lie sometimes" }, // LPQ 13
            { key: "Lie_Contextuality_2", dimension: "Lying Contextuality", text: "I lie when necessary" }, // LPQ 14
            { key: "Lie_Contextuality_3", dimension: "Lying Contextuality", text: "It is acceptable to lie depending on the context" }, // LPQ 15
            { key: "Lie_Contextuality_4", dimension: "Lying Contextuality", text: "I would lie if something important was at stake" }, // LPQ 16
        ],
    },
])
