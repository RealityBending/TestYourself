/* ==========================================================================
   content/block_lies.js — TRUTH & LIES, a level of its own (`Lies` on the
   timeline, November 2026) and this one block: a briefing and the LPQ
   whole, with eight items of our own on other people's lies dealt into it,
   closing on the chameleon
   (js/figures/chameleon.js). ASKED BY NO BATTERY, like the level it came
   out of: it is in ASIDE, so a run meets it only through `?start=lies`,
   which walks it first.

   IT WAS A BLOCK OF LIGHT & DARK until November 2026, drawn against the
   deeds so that neither was always met first. Two things took it out. The
   level had grown to 89 screens against a planned ~40, and a pilot found it
   long; and of those 89 only the 24 deeds were read back at the end, so the
   18 screens of lying were unpaid work on a test whose whole bargain is
   that a level ends in something about you. Split, each level ends in a
   figure of its own and neither is long. What it costs: the two are no
   longer one link. `?start=dark` asks the deeds and `?start=lies` the
   lying, a study that wants both says `?start=dark,lies`, and the student
   battery (WHERE IT GOES) names both levels.

   The level's notes are still at the head of content/block_dark.js, where
   the measure was planned: a name in capitals in brackets — THE PLAN,
   RESULTS, WHAT WAS CUT — is a section of that header. What is written
   there as the mask is drawn here as the chameleon instead.
   ========================================================================== */

// Light & Dark's ochre, kept for a level that came out of it (DEED_COLOUR in
// block_deeds.js, where why it is no longer red is written): the two are
// sister levels and read as a pair, and this is the one constant to change
// if Truth & Lies ever wants a colour of its own — a green would be the
// obvious one and is exactly what the chameleon's own scene is drawn in,
// which is why it is not. Written out again rather than borrowed: a block
// file reads the timeline's globals and nothing of another block's, and two
// files declaring one `const` would stop the page loading.
const LIE_COLOUR = "#b2793a"

defineBlock("lies", [
    // The level's own briefing (November 2026, when the lying became a level
    // rather than a stretch of Light & Dark's). It opens on everybody lies,
    // which is a fact (Serota's people average between one and two a day) and
    // is there to do the work normalising does on a sensitive measure: the
    // under-reporting this level has most to fear from is somebody who thinks
    // admitting to a lie is admitting to something. It then names the four
    // things asked — how often, how well, what it costs, when it depends —
    // which are the LPQ's four subscales, and then what you make of other
    // people's lies (the eight detection and prevalence items dealt into it).
    // The chameleon draws the first three (as how often, how well and how it
    // feels) and none of the rest (js/figures/chameleon.js says why of the
    // fourth).
    //
    // THE PRIVACY PARAGRAPH is the one Briefing_Dark and Briefing_Sexuality
    // carry, word for word: a change to one wants making in all three. It is
    // here because a level a link can open on is a level somebody may meet
    // with nothing in front of it, and this one asks them about their own
    // lies. As in the other two it DOES NOT SAY THE COMMITTEE HAS APPROVED
    // THIS, because it has not: the level is not in the ethics application.
    //
    // It says nowhere where in the run it falls, and nothing about the deeds:
    // Light & Dark may not be in this run at all.
    {
        type: "briefing",
        key: "Briefing_Lies",
        text:
            "<h2>Everybody lies.</h2>" +
            "<p>Most people tell one or two lies on an ordinary day and think little of them. A few tell a great many, a few go to real lengths not to, and most of us are better at it than we care to admit. What follows asks how often you lie, how well, what it costs you, when you think it depends and what you make of other people's lies. By a lie we mean any time you intentionally try to mislead someone: big or small, an outright falsehood or a truth with details made up or left out, told for a good reason or a selfish one.</p>" +
            "<p>A reminder on privacy before you go on. Your answers are anonymous: nothing in them identifies you, they are analysed together with everybody else's and never on their own, and anything that could be traced back to you is removed. It is vital for us that you feel comfortable answering truthfully, and the way your answers are kept has been carefully designed for that.</p>" +
            "<p><em>Answer for what you actually do, not for what you would like to be true. At the end you will see the colours you wear.</em></p>",
    },

    // THE LIE COUNT IS GONE (November 2026). The block opened on Serota's
    // one-item daily measure, "In the past 24 hours, how many times have you
    // lied?" (`Lie_Count`, a typed number; Serota, Levine & Docan-Morgan,
    // 2021), with a follow-up on whether that was fewer or more than on most
    // days (`Lie_Count_Usual`), read back as a crowd over the chameleon. Cut
    // as capturing nothing meaningful about a person: one day is a sample of
    // one, some 60% answer nought, what counts as a lie is each reader's own
    // call, and the LPQ's Frequency asks the same thing as a tendency. What
    // the finding is about is the population's long tail, not anybody's
    // place in it. Files from before then carry both keys.

    // THE LPQ, straight after the briefing: the Lying Profile Questionnaire
    // (Makowski, Pham, Lau, Raine & Chen, 2023, Current Psychology 42,
    // 4001-4016; online 2021), all sixteen items in its four subscales of
    // four — Ability, how well a person lies, the skill half of the mask
    // (THE PLAN, RESULTS); Frequency, how often, as a
    // self-description; Negativity, reluctance to
    // lie on moral or emotional grounds; and Contextuality, lying as right or
    // wrong by the situation. Verbatim from the instructions and items the lab
    // keeps beside the paper (Deception_Scale_LIE.docx in
    // github.com/DominiqueMakowski/2020structure, read November 2026),
    // "refrain myself" and all, as is the scale: "a visual analog scale …
    // from 1 (Disagree) to 10 (Agree), with no other options in between", the
    // items in any order, a dimension the mean of its four and none reversed
    // — so a slider over 1 to 10 with no number on it, the MINT's slider
    // (`reading: false`), the sixteen shuffled together. Its instructions
    // there are a definition of a lie (written from Serota's) and a word on
    // anonymity the briefing gives, so the lead-in is only the question the
    // scale answers. THE DEFINITION IS IN THE BRIEFING, its last sentence of
    // the first paragraph, since the lie count, whose gloss carried it, was
    // cut (November 2026): said once at the head of the level, as the
    // published LPQ says it once in its instructions. Ability alone was
    // asked until November 2026 (the plan's budget; WHAT WAS CUT); whole, the
    // published LPQ is scored as published.
    //
    // No norms: the paper's means are of a Singaporean sample on this
    // scale, and the chameleon, which is what reads it back, draws a scale
    // as a reach along itself and places Ability and Frequency against their
    // own midpoints rather than against other people (the heads' rule). No
    // way out either, the published scale having none.
    //
    // Keyed `Lie_` rather than `LPQ_`, so that everything the
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

            // LIE DETECTION, four CUSTOM items (November 2026) dealt in among
            // the LPQ's sixteen, the KSE-G's way among the HEXACO's, written
            // in its style as an extension of it: how well a person thinks
            // they catch other people's lies. NOT LPQ items, and never pooled
            // with LPQ data as such. Each mirrors the Ability item of its
            // number, quoted beside it, so that the two can be set side by
            // side — whether good liars take themselves for good detectors,
            // as measured the two skills go together (Wright, Berry & Bird,
            // 2012) — at the price of the shared wording inflating that
            // correlation somewhat. Self-rated detection is close to
            // unrelated to accuracy (DePaulo et al., 1997; people catch about
            // 54% of lies, Bond & DePaulo, 2006), so this is a belief and not
            // a skill, and it goes with distrust (Fernandes et al., 2023),
            // which Lie Prevalence, below, helps to tell apart from it.
            // Scored as Lie Detection, the mean of four and none reversed,
            // the LPQ's way; no norms, and drawn nowhere, the chameleon
            // reading three of the LPQ's own.
            { key: "Lie_Detection_1", dimension: "Lie Detection", text: "I can tell when someone is lying to me" }, // "I can lie well"
            { key: "Lie_Detection_2", dimension: "Lie Detection", text: "I am good at spotting lies" }, // "I am a good liar"
            { key: "Lie_Detection_3", dimension: "Lie Detection", text: "It is hard for others to fool me with a lie" }, // "It is hard for others to detect my lies"
            { key: "Lie_Detection_4", dimension: "Lie Detection", text: "I can see through even clever lies" }, // "It is easy for me to make up clever lies"

            // LIE PREVALENCE, four more CUSTOM items (November 2026), dealt
            // in the same way: how much a person thinks other people lie.
            // Each mirrors the Frequency item of its number, quoted beside
            // it, as Detection mirrors Ability, so that the eight are the LPQ
            // turned outwards — how well I catch lies against how well I tell
            // them, how much others lie against how much I do — and false
            // consensus can be asked directly: whether people who lie more
            // take everybody else to lie more too (Lying Frequency
            // against this). About how often ordinary people lie, never
            // their motives ("Most people would lie to me if it served them"
            // was weighed and left, being the Cook-Medley cynicism Grievance
            // borrows from on Light & Dark) and never institutions, the CMQ's
            // ground on Where You Stand. "Most people" rather than "I", so
            // they stand out a little among the LPQ's first-person
            // statements. Scored as Lie Prevalence, the mean of four and none
            // reversed, the LPQ's way; no norms, and drawn nowhere.
            { key: "Lie_Prevalence_1", dimension: "Lie Prevalence", text: "Most people have a tendency to lie" }, // "I have a tendency to lie"
            { key: "Lie_Prevalence_2", dimension: "Lie Prevalence", text: "Most people lie more often than they admit" }, // "I lie more often than most people do"
            { key: "Lie_Prevalence_3", dimension: "Lie Prevalence", text: "Most people find it hard not to lie" }, // "I find it difficult to refrain myself from lying"
            { key: "Lie_Prevalence_4", dimension: "Lie Prevalence", text: "Most people lie a lot" }, // "I lie frequently"
        ],
    },
])
