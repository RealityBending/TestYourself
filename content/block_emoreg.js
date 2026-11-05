/* ==========================================================================
   content/block_emoreg.js — a level on emotion regulation, written for a
   student's dissertation (November 2026). ASKED BY NO BATTERY: it is on the
   timeline as a level of its own (`EmoReg`, "Storm & Calm") in `all`'s fork,
   so that it has a place, a key and a name, but it is in ASIDE in
   content/timeline.js, so neither `mint` nor `all` asks it. A run meets it
   only through a link naming it, `?start=emoreg`, which walks it first. It is
   not in the ethics application.

   THREE QUESTIONNAIRES, one stretch: how much trouble feelings give somebody
   (the DERS-16), how lonely they feel (one item, for now) and what they do
   about feelings in the moment (the RESS). Separate questionnaires because
   they are separate instruments with separate stems, asked in that order,
   each shuffled within itself.

   IT OVERLAPS THE `regulation` BLOCK, KNOWINGLY: the ERS there asks how hard
   feelings hit and the CERQ-short what the mind does after a bad event, and
   the CERQ's Rumination and Catastrophising are close to the RESS's
   Rumination and the DERS's Strategies. Kept apart for now because the
   student's project wants these two instruments whole and as published.

   READ BACK as one section and nothing but a spider chart carrying all
   three (one entry of `CHARTS` in js/app.js): the DERS-16 and Loneliness on
   the right in orange, six axes, and the RESS on the left in blue, six
   axes, split down the vertical middle. No rows, no interpretations, no
   votes, on purpose: they were fluff under the chart, whose points still
   give each standing on hover, and the level is rated by its stars alone.
   KEEP THE TWO SIDES EQUAL: a dimension added to one wants one on the
   other, or the split leans. Every norm here is an invented placeholder, so
   every standing on the level is one too.

   THE DIMENSIONS CARRY PLAIN NAMES, the instruments' own written beside them
   below, for the two reasons the rest of the run has: what the person reads
   is prose (nobody outside the field says "Nonacceptance" or means
   expressing a feeling by "Engagement"), and a dimension is one name across
   the run — the RESS's own "Rumination" would be averaged into the CERQ's.
   The item keys keep the instruments' subscale names, so a saved file scores
   with the published keys.
   ========================================================================== */
defineBlock("emoreg", [
    // Says nowhere where in the run it falls. The last line is the RESS's
    // own instruction, which asks for what is done rather than what ought to
    // be, said once here rather than over each of its items.
    {
        type: "briefing",
        key: "Briefing_EmoReg",
        text:
            "<h2>When feelings run high.</h2>" +
            "<p>Everybody has bad moments: anger, sadness, stress, fear. This part is about what happens next — how well " +
            "you can tell what you are feeling, how much it throws you and what you do to bring it back down.</p>" +
            "<p>People handle hard feelings in very different ways, and most use several. There are no right answers.</p>" +
            "<p><em>Answer for what you actually do, not for what you think you should do or wish you did.</em></p>",
    },

    // DERS-16 ==============================================================
    // The Difficulties in Emotion Regulation Scale, 16-item version
    // (Bjureberg, Ljótsson, Tull, Hedman, Sahlin, Lundh, Bjärehed, DiLillo,
    // Messman-Moore, Gumpert & Gratz, 2016, Journal of Psychopathology and
    // Behavioral Assessment, 38, 284-296; the 36-item DERS is Gratz & Roemer,
    // 2004). Items verbatim from the NovoPsych template of it, its spelling
    // kept ("behaviours"), on its 1 (almost never) to 5 (almost always)
    // scale with all five labels. No reversed items. Each carries its
    // DERS-16 item number in a comment.
    //
    // Five subscales, all running towards more difficulty, under plain
    // names named for the difficulty and never for its absence (the heads'
    // rule, AGENTS.md **Mind and heart**), since the row is filled to how
    // much of it there is:
    //
    //   Emotional Confusion  Lack of emotional clarity                   1, 2
    //   Losing Focus         Difficulty engaging in goal-directed
    //                        behaviour                                   3, 7, 15
    //   Losing Control       Impulse control difficulties                4, 8, 11
    //   Feeling Stuck        Limited access to emotion regulation
    //                        strategies                                  5, 6, 12, 14, 16
    //   Self-Reproach        Nonacceptance of emotional responses        9, 10, 13
    //
    // The DERS-16 total (the sum of all sixteen) is its headline score and is
    // left to analysis time: the engine scores dimensions, and a total row
    // would be a sixth reading of the same answers.
    {
        key: "ders16",
        name: "When You Are Upset",
        instructions: "How often does this apply to you?",
        // Kept off the whole-run profile web, which is at the limit its
        // labels can bear.
        profile: false,
        format: {
            options: [
                { value: 1, text: "Almost never" },
                { value: 2, text: "Sometimes" },
                { value: 3, text: "About half the time" },
                { value: 4, text: "Most of the time" },
                { value: 5, text: "Almost always" },
            ],
            columns: 5,
            color: "#ea580c",
        },

        // PLACEHOLDER norms, invented: guesses at a general population's
        // per-item means, not Bjureberg et al.'s figures (who report the
        // total and subscale sums by sample). Replace with a real sample, as
        // item means, before any of this is presented as a standing.
        norms: {
            "Emotional Confusion": { mean: 2.1, sd: 0.9 },
            "Losing Focus": { mean: 2.9, sd: 1.0 },
            "Losing Control": { mean: 1.8, sd: 0.9 },
            "Feeling Stuck": { mean: 2.1, sd: 0.9 },
            "Self-Reproach": { mean: 2.2, sd: 1.0 },
        },

        items: [
            { key: "DERS_Clarity_1", dimension: "Emotional Confusion", text: "I have difficulty making sense out of my feelings" }, // 1
            { key: "DERS_Clarity_2", dimension: "Emotional Confusion", text: "I am confused about how I feel" }, // 2
            { key: "DERS_Goals_1", dimension: "Losing Focus", text: "When I am upset, I have difficulty getting work done" }, // 3
            { key: "DERS_Impulse_1", dimension: "Losing Control", text: "When I am upset, I become out of control" }, // 4
            {
                key: "DERS_Strategies_1", // 5
                dimension: "Feeling Stuck",
                text: "When I am upset, I believe that I will remain that way for a long time",
            },
            { key: "DERS_Strategies_2", dimension: "Feeling Stuck", text: "When I am upset, I believe that I'll end up feeling very depressed" }, // 6
            { key: "DERS_Goals_2", dimension: "Losing Focus", text: "When I am upset, I have difficulty focusing on other things" }, // 7
            { key: "DERS_Impulse_2", dimension: "Losing Control", text: "When I am upset, I feel out of control" }, // 8
            { key: "DERS_Nonacceptance_1", dimension: "Self-Reproach", text: "When I am upset, I feel ashamed with myself for feeling that way" }, // 9
            { key: "DERS_Nonacceptance_2", dimension: "Self-Reproach", text: "When I am upset, I feel like I am weak" }, // 10
            { key: "DERS_Impulse_3", dimension: "Losing Control", text: "When I am upset, I have difficulty controlling my behaviours" }, // 11
            {
                key: "DERS_Strategies_3", // 12
                dimension: "Feeling Stuck",
                text: "When I am upset, I believe that there is nothing I can do to make myself feel better",
            },
            { key: "DERS_Nonacceptance_3", dimension: "Self-Reproach", text: "When I am upset, I become irritated with myself for feeling that way" }, // 13
            { key: "DERS_Strategies_4", dimension: "Feeling Stuck", text: "When I am upset, I start to feel very bad about myself" }, // 14
            { key: "DERS_Goals_3", dimension: "Losing Focus", text: "When I am upset, I have difficulty thinking about anything else" }, // 15
            { key: "DERS_Strategies_5", dimension: "Feeling Stuck", text: "When I am upset, my emotions feel overwhelming" }, // 16
        ],
    },

    // LONELINESS ===========================================================
    // One custom item, a direct question about how lonely somebody feels,
    // asked between the two instruments (November 2026). A placeholder for a
    // short scale: the UCLA-3 (Hughes, Waite, Hawkley & Cacioppo, 2004) is
    // the obvious one if it ever wants more. A questionnaire of its own
    // rather than an item of the DERS-16, whose stem ("how often does this
    // apply to you?") and keys it does not share. Drawn on the orange side of
    // the level's chart beside the DERS-16's five, so that the two sides are
    // six axes each and the chart splits down its middle.
    {
        key: "loneliness",
        name: "Loneliness",
        profile: false,
        format: {
            options: [
                { value: 1, text: "Not at all" },
                { value: 2, text: "A little" },
                { value: 3, text: "Somewhat" },
                { value: 4, text: "Very" },
                { value: 5, text: "Extremely" },
            ],
            columns: 5,
            color: "#ea580c",
        },

        // PLACEHOLDER norm, invented, on the 1-5 above.
        norms: {
            Loneliness: { mean: 2.2, sd: 1.0 },
        },

        items: [{ key: "Loneliness_Direct", dimension: "Loneliness", text: "How lonely do you feel?" }],
    },

    // RESS =================================================================
    // The Regulation of Emotion Systems Survey (De France & Hollenstein,
    // 2017, Personality and Individual Differences, 119, 204-215), the 24
    // items as published, verbatim, American spelling kept ("Vocalizing"),
    // on its 1 (never) to 5 (always) scale with all five labels. No reversed
    // items. Each carries its RESS item number in a comment.
    //
    // Its instructions are a paragraph, which the run does not set over every
    // item. What it asks is split in two: the lead-in over each item says
    // what is rated (how often, right away, in response to a negative emotion
    // such as anger, sadness or stress — its past tense kept, since the items
    // say "was bothering me"), and the briefing says the rest (what you
    // actually do, not what you should). The published text:
    //
    //   "Please indicate how you respond right away to negative emotions as
    //   they arise. Do not choose your answers based on what you think you
    //   should do or wish you do. Instead, choose your answers thoughtfully,
    //   and make your answers about what you actually do. Please answer every
    //   item. There are no "right" and "wrong" answers, so choose the most
    //   accurate answer for YOU – not what you think "most people" would say
    //   or do. For each statement below, please click on the appropriate
    //   number to indicate how frequently you did the following things in
    //   response to feeling a negative emotion, such as anger, sadness, or
    //   stress."
    //
    // Six strategies, four items each, running one way — how often each is
    // used — and none of them good or bad on screen. Plain names, the
    // instrument's beside them:
    //
    //   Keeping Busy   Distraction    7, 10, 17, 22
    //   Replaying      Rumination     1, 8, 14, 21  (and not "Rumination",
    //                                               which is the CERQ's)
    //   Rethinking     Reappraisal    3, 12, 15, 23
    //   Hiding         Suppression    4, 9, 13, 18
    //   Expressing     Engagement     2, 5, 11, 20  (the RESS's Engagement is
    //                                               letting a feeling show)
    //   Calming Down   Relaxation     6, 16, 19, 24
    {
        key: "ress",
        name: "What You Reach For",
        instructions: "How often did you do this <b>right away</b>, in response to a negative emotion such as anger, sadness or stress?",
        // Kept off the whole-run profile web, as the DERS-16 above.
        profile: false,
        format: {
            options: [
                { value: 1, text: "Never" },
                { value: 2, text: "Sometimes" },
                { value: 3, text: "Half of the time" },
                { value: 4, text: "Most of the time" },
                { value: 5, text: "Always" },
            ],
            columns: 5,
            color: "#2563eb",
        },

        // PLACEHOLDER norms, invented: guesses at a general population's
        // per-item means, not De France & Hollenstein's figures. Replace with
        // a real sample, as item means, before any of this is presented as a
        // standing.
        norms: {
            "Keeping Busy": { mean: 3.0, sd: 0.9 },
            Replaying: { mean: 3.1, sd: 0.9 },
            Rethinking: { mean: 2.9, sd: 0.9 },
            Hiding: { mean: 2.7, sd: 0.9 },
            Expressing: { mean: 2.7, sd: 0.9 },
            "Calming Down": { mean: 2.4, sd: 1.0 },
        },

        items: [
            { key: "RESS_Rumination_1", dimension: "Replaying", text: "Thinking repeatedly about what was bothering me" }, // 1
            { key: "RESS_Engagement_1", dimension: "Expressing", text: "Using facial expressions to show that I was upset" }, // 2
            { key: "RESS_Reappraisal_1", dimension: "Rethinking", text: "Thinking of other ways to interpret the situation" }, // 3
            { key: "RESS_Suppression_1", dimension: "Hiding", text: "Acting like I was not upset" }, // 4
            { key: "RESS_Engagement_2", dimension: "Expressing", text: "Vocalizing how I was feeling" }, // 5
            { key: "RESS_Relaxation_1", dimension: "Calming Down", text: "Focusing on slowing my heart rate and breathing" }, // 6
            { key: "RESS_Distraction_1", dimension: "Keeping Busy", text: "Immediately working on something to keep myself busy" }, // 7
            { key: "RESS_Rumination_2", dimension: "Replaying", text: "Continually thinking about what was bothering me" }, // 8
            { key: "RESS_Suppression_2", dimension: "Hiding", text: "Making sure no one could tell what I was feeling" }, // 9
            { key: "RESS_Distraction_2", dimension: "Keeping Busy", text: "Doing something else to distract myself" }, // 10
            { key: "RESS_Engagement_3", dimension: "Expressing", text: "Letting my emotions show" }, // 11
            { key: "RESS_Reappraisal_2", dimension: "Rethinking", text: "Trying to see the emotional event from a different perspective" }, // 12
            { key: "RESS_Suppression_3", dimension: "Hiding", text: "Pretending I was not upset" }, // 13
            { key: "RESS_Rumination_3", dimension: "Replaying", text: "Going over the emotional event again and again in my mind" }, // 14
            { key: "RESS_Reappraisal_3", dimension: "Rethinking", text: "Looking at the emotional event from a different perspective" }, // 15
            { key: "RESS_Relaxation_2", dimension: "Calming Down", text: "Trying to slow my heart rate and breathing" }, // 16
            { key: "RESS_Distraction_3", dimension: "Keeping Busy", text: "Engaging in something else to keep busy" }, // 17
            { key: "RESS_Suppression_4", dimension: "Hiding", text: "Hiding my feelings" }, // 18
            { key: "RESS_Relaxation_3", dimension: "Calming Down", text: "Taking deep breaths" }, // 19
            { key: "RESS_Engagement_4", dimension: "Expressing", text: "Showing my feelings" }, // 20
            { key: "RESS_Rumination_4", dimension: "Replaying", text: "Continually trying to decide what went wrong" }, // 21
            { key: "RESS_Distraction_4", dimension: "Keeping Busy", text: "Engaging in activities to distract myself" }, // 22
            { key: "RESS_Reappraisal_4", dimension: "Rethinking", text: "Identifying different angles to see the situation" }, // 23
            { key: "RESS_Relaxation_4", dimension: "Calming Down", text: "Decreasing the tension in my body" }, // 24

            // The level's attention check, dealt in among the twenty-four and
            // worded as they are, a thing done. It asks for "Sometimes": off
            // both ends, where a thumb goes without reading, and off the
            // middle.
            {
                key: "RESS_AttentionCheck",
                check: 2,
                text: "Choosing \"Sometimes\" here, to show that I am reading these",
            },
        ],
    },
])
