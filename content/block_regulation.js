// Self-regulation — a level of its own: having drawn what somebody is like,
// ask how well they steer it. Where it falls is the timeline's to say, and its
// briefing is written to hold anywhere in the run.
// Three questionnaires, all asking about the same broad thing from three
// sides — where attention goes and what can be resisted (eight single items
// off four short scales), how hard feelings hit and how long they stay (the
// ERS) and what the mind does when something goes wrong (the CERQ-short) —
// which is why they share a level and a briefing. Framed to the participant
// as "Mind & Heart" (timeline.js); what is measured is executive
// lapses, self-control, emotion reactivity and cognitive emotion regulation
// strategies, and the keys, comments and README say so.
//
// Three questionnaires rather than one because they are three instruments
// with three stems: the CERQ is answered for stressful situations, the ERS
// for emotions on an ordinary day, and the eight singles each carry their
// own scale. Two instruments meant to be dealt in among each other go in one
// questionnaire, and the four pairs of singles are — the way the level-1
// singles are — so that the reversed self-control item and its partner are
// not asked back to back.
defineBlock("regulation", [
    {
        type: "briefing",
        key: "Briefing_Regulation",
        text:
            "<h2>How you steer.</h2>" +
            "<p>Much of this test asks what you are like. This part asks how well you <b>run</b> it: where your attention " +
            "goes when you are not watching it, what you can resist, how hard your feelings hit and how long they stay, " +
            "and what your mind does when something goes wrong.</p>" +
            "<p>Everybody loses the thread, gives in and gets carried away sometimes. What differs is how often, and " +
            "what you do next.</p>" +
            "<p><em>Answer for how you generally are, not for your best day or your worst.</em></p>",
    },

    // Attention and self-control ===========================================
    // Eight items off four short scales, two apiece, asked as ONE
    // questionnaire so that they are dealt in among one another, each pair
    // on its own instrument's scale:
    //
    //   ASRS  the first two items of the WHO Adult ADHD Self-Report Scale
    //         v1.1 screener (Kessler et al., 2005), the two inattention items
    //         about finishing and organising — verbatim, on the ASRS's own
    //         five labels, over the past six months
    //   CFQ   two items of the Cognitive Failures Questionnaire (Broadbent
    //         et al., 1982), the CFQ's own item numbers in the keys (10,
    //         "forget what you came to the shops to buy"; 21, "start doing
    //         one thing at home and get distracted") — verbatim, on the
    //         CFQ's own five labels
    //   MW-S  two of the four items of the Mind Wandering: Spontaneous scale
    //         (Carriere, Seli & Smilek, 2013), items 1 and 4 under the
    //         scale's own numbering, on its 1-7 scale
    //   BSCS  two items of the Brief Self-Control Scale (Tangney et al.,
    //         2004), items 1 and 2 — the second reverse-keyed, as published
    //
    // None of the four pairs is a validated short form in its own right (the
    // ASRS's two are the pair its psychometric work isolates as the purest of
    // the six; the rest are high-loading items of their scales), so a pair
    // here is a two-item proxy for its construct and the comments say so.
    // Four dimensions, one a pair, under plain names — Inattention,
    // Absent-Mindedness, Mind Wandering, Self-Control — the first three
    // running towards more of a problem and the fourth towards more of a
    // virtue. Read back, with the two questionnaires below, as the heads
    // (js/figures/heads.js): Self-Control is the bulb, the other three the
    // knot on the cord up to it. No rows and no chart of its own.
    {
        key: "control",
        name: "Attention & Self-Control",
        instructions: "",
        // Kept off the whole-run profile web: at sixteen axes the web is at
        // the limit its labels can bear, and this level's own sections are
        // where these are read.
        profile: false,

        // PLACEHOLDER norms, invented. Not from any published sample: the
        // ASRS and CFQ publish norms for their full scales and not for a
        // pair of items, and the two-item means below are guesses at where a
        // general population would sit on each. Replace with a real sample
        // before any of this is presented as a standing.
        norms: {
            Inattention: {
                mean: 1.6,
                sd: 0.9,
                interpretations: {
                    low: "you finish what you start and keep your tasks in order without much effort.",
                    mid: "loose ends and untidy plans catch up with you now and then, about as often as with most people.",
                    high: "the last stretch of a task, and the ordering of a complicated one, are where things slip for you more than for most people.",
                },
            },
            "Absent-Mindedness": {
                mean: 1.6,
                sd: 0.8,
                interpretations: {
                    low: "you rarely lose the thread of what you set out to do: errands and half-finished jobs stay in view.",
                    mid: "you forget the odd item and drift off the odd task, as most people do.",
                    high: "you often arrive without the thing you came for, or find yourself midway through something other than what you started.",
                },
            },
            "Mind Wandering": {
                mean: 4.0,
                sd: 1.4,
                interpretations: {
                    low: "your thoughts mostly stay where you put them, and rarely slip off on their own.",
                    mid: "your mind drifts off now and then when it should be on the job, about as much as most people's.",
                    high: "your thoughts wander off by themselves, often, and while you are supposed to be doing something else.",
                },
            },
            "Self-Control": {
                mean: 3.1,
                sd: 0.9,
                interpretations: {
                    low: "temptation usually wins, and a habit is hard to shift however much you mean to change it.",
                    mid: "you can hold out against a temptation and drop a habit, with effort, most of the time.",
                    high: "you resist what you have decided to resist, and can break a habit once you have set your mind to it.",
                },
            },
        },

        items: [
            // ASRS-v1.1, items 1 and 2 (Kessler et al., 2005). The screener's
            // six items are answered for the past six months, which the
            // instructions carry since the item itself is the question.
            {
                key: "ASRS_1",
                dimension: "Inattention",
                instructions: "Over the past six months",
                format: {
                    options: [
                        { value: 0, text: "Never" },
                        { value: 1, text: "Rarely" },
                        { value: 2, text: "Sometimes" },
                        { value: 3, text: "Often" },
                        { value: 4, text: "Very often" },
                    ],
                    columns: 5,
                    color: "#0d9488",
                },
                text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
            },
            {
                key: "ASRS_2",
                dimension: "Inattention",
                instructions: "Over the past six months",
                format: {
                    options: [
                        { value: 0, text: "Never" },
                        { value: 1, text: "Rarely" },
                        { value: 2, text: "Sometimes" },
                        { value: 3, text: "Often" },
                        { value: 4, text: "Very often" },
                    ],
                    columns: 5,
                    color: "#0d9488",
                },
                text: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
            },

            // CFQ, items 10 and 21 (Broadbent et al., 1982), on the CFQ's own
            // labels and, like the ASRS, for the past six months.
            {
                key: "CFQ_10",
                dimension: "Absent-Mindedness",
                instructions: "Over the past six months",
                format: {
                    options: [
                        { value: 0, text: "Never" },
                        { value: 1, text: "Very rarely" },
                        { value: 2, text: "Occasionally" },
                        { value: 3, text: "Quite often" },
                        { value: 4, text: "Very often" },
                    ],
                    columns: 5,
                    color: "#0d9488",
                },
                text: "Do you find you forget what you came to the shops to buy?",
            },
            {
                key: "CFQ_21",
                dimension: "Absent-Mindedness",
                instructions: "Over the past six months",
                format: {
                    options: [
                        { value: 0, text: "Never" },
                        { value: 1, text: "Very rarely" },
                        { value: 2, text: "Occasionally" },
                        { value: 3, text: "Quite often" },
                        { value: 4, text: "Very often" },
                    ],
                    columns: 5,
                    color: "#0d9488",
                },
                text: "Do you start doing one thing at home and get distracted into doing something else (unintentionally)?",
            },

            // MW-S, items 1 and 4 (Carriere, Seli & Smilek, 2013), on the
            // scale's own 1 (rarely) to 7 (a lot).
            {
                key: "MWS_1",
                dimension: "Mind Wandering",
                instructions: "How often is this true of you?",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Rarely", "A lot"],
                    color: "#0d9488",
                },
                text: "I find my thoughts wandering spontaneously",
            },
            {
                key: "MWS_4",
                dimension: "Mind Wandering",
                instructions: "How often is this true of you?",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Rarely", "A lot"],
                    color: "#0d9488",
                },
                text: "I mind-wander even when I'm supposed to be doing something else",
            },

            // BSCS, items 1 and 2 (Tangney, Baumeister & Boone, 2004), the
            // second reverse-keyed as published, on the scale's own 1 (not at
            // all like me) to 5 (very much like me).
            {
                key: "BSCS_1",
                dimension: "Self-Control",
                instructions: "How much does this statement reflect how you typically are?",
                format: {
                    options: [1, 2, 3, 4, 5],
                    anchors: ["Not at all like me", "Very much like me"],
                    color: "#0d9488",
                },
                text: "I am good at resisting temptation",
            },
            {
                key: "BSCS_2",
                dimension: "Self-Control",
                reverse: true,
                instructions: "How much does this statement reflect how you typically are?",
                format: {
                    options: [1, 2, 3, 4, 5],
                    anchors: ["Not at all like me", "Very much like me"],
                    color: "#0d9488",
                },
                text: "I have a hard time breaking bad habits",
            },
        ],
    },

    // ERS ==================================================================
    // Six items of the Emotion Reactivity Scale (Nock, Wedig, Holmberg &
    // Hooley, 2008), two of each of its three facets — sensitivity (how
    // easily emotion is set off), arousal/intensity (how strongly it comes)
    // and persistence (how long it stays) — verbatim, on the scale's own 0-4
    // "like me" scale, with the ends the author asked for as anchors. Not a
    // published short form: six items chosen for the three facets, so the
    // three dimensions are two-item proxies for them. The facets carry
    // "Emotional" in front because a dimension is one name across the run,
    // and "Sensitivity" and "Intensity" are close to names other levels use
    // (the MINT's Bodily Sensitivity, the HiTOP-BR's Emotional Intensity).
    // Read back as the heart of the heads figure — the mean reach of the
    // three is how big it is — and as nothing else: no rows, no chart.
    {
        key: "ers",
        name: "Emotional Reactivity",
        instructions:
            "How you experience emotions <b>on a regular basis</b>, for example each day. \"Emotional\" here may mean " +
            "angry, sad, excited or any other emotion",
        // Kept off the whole-run profile web, for the same reason as the
        // questionnaire above.
        profile: false,
        format: {
            options: [0, 1, 2, 3, 4],
            anchors: ["Not like me at all", "Extremely like me"],
            color: "#d97706",
        },

        // PLACEHOLDER norms, invented. Not from any published sample: the
        // ERS publishes a total and facet scores for its full 21 items, and
        // the per-item means below are guesses at where a general population
        // sits. Replace with a real sample before any of this is presented as
        // a standing.
        norms: {
            "Emotional Sensitivity": {
                mean: 1.6,
                sd: 1.0,
                interpretations: {
                    low: "it takes a lot to move you: small things pass without stirring much.",
                    mid: "some things get to you and many do not, about as it is for most people.",
                    high: "the smallest things can set you off, and you get emotional easily and often.",
                },
            },
            "Emotional Arousal": {
                mean: 1.5,
                sd: 1.0,
                interpretations: {
                    low: "your feelings tend to stay at a volume you can think over.",
                    mid: "your moods are strong at times, and mostly leave you room to think.",
                    high: "your feelings come in with force, strong enough at times to make it hard to think straight.",
                },
            },
            "Emotional Persistence": {
                mean: 1.5,
                sd: 1.0,
                interpretations: {
                    low: "when you are upset you come down from it quickly, and can picture feeling otherwise.",
                    mid: "an upset stays with you for a while and then lifts, as it does for most people.",
                    high: "once a feeling has hold of you it stays longer than it does for most people, and it is hard to imagine feeling any other way.",
                },
            },
        },

        items: [
            { key: "ERS_Sensitivity_1", dimension: "Emotional Sensitivity", text: "Even the littlest things make me emotional" },
            { key: "ERS_Sensitivity_2", dimension: "Emotional Sensitivity", text: "I tend to get very emotional very easily" },
            { key: "ERS_Arousal_1", dimension: "Emotional Arousal", text: "I often get so upset it's hard for me to think straight" },
            { key: "ERS_Arousal_2", dimension: "Emotional Arousal", text: "My moods are very strong and powerful" },
            {
                key: "ERS_Persistence_1",
                dimension: "Emotional Persistence",
                text: "When I am angry/upset, it takes me much longer than most people to calm down",
            },
            {
                key: "ERS_Persistence_2",
                dimension: "Emotional Persistence",
                text: "When I feel emotional, it's hard for me to imagine feeling any other way",
            },
        ],
    },

    // CERQ-short ===========================================================
    // The 18-item short form of the Cognitive Emotion Regulation
    // Questionnaire (Garnefski & Kraaij, 2006, Personality and Individual
    // Differences, 41(6), 1045-1053; the full 36-item CERQ is Garnefski,
    // Kraaij & Spinhoven, 2001): nine strategies, two items each, on the
    // inventory's 1 (almost never) to 5 (almost always) scale, answered for
    // what one generally thinks when facing stressful situations. No
    // reversed items. Item texts are verbatim, and each carries the CERQ-36's
    // item number in a comment, so a saved file maps onto either form's
    // published scoring. Five of the nine are the "adaptive" strategies of
    // the literature (acceptance, positive refocusing, refocus on planning,
    // positive reappraisal, putting into perspective) and four the
    // "maladaptive" (self-blame, rumination, catastrophising, other-blame);
    // that split is a reading and not a score, so nothing here says
    // adaptive, and the two composites are left to analysis time.
    //
    // Nine dimensions running one way — how often the strategy is used. Read
    // back only through the heads figure, where the four maladaptive ones are
    // the knot on the cord down to the heart and the five adaptive ones are
    // read by nothing; no rows, no chart. The dimensions carry the CERQ's own
    // strategy names, in the app's spelling (Catastrophising); the keys keep
    // the author's (Catastrophizing, Perspective, RefocusPlanning).
    {
        key: "cerq",
        name: "Coping Strategies",
        instructions: "How often do you think in this way when facing <b>intense, threatening or stressful</b> situations?",
        // Kept off the whole-run profile web: nine more axes would crowd out
        // everything else on it.
        profile: false,
        format: {
            options: [1, 2, 3, 4, 5],
            anchors: ["Almost never", "Almost always"],
            color: "#7c3aed",
        },

        // PLACEHOLDER norms, invented. The shape — planning, reappraisal,
        // acceptance and perspective used most, catastrophising and
        // other-blame least — is what Garnefski & Kraaij (2006) describe in
        // their general-population sample, but the numbers are guesses at it
        // in per-item units and not their figures. Replace with a real sample
        // (their Table, halved, since they report two-item sums) before any
        // of this is presented as a standing.
        norms: {
            "Self-Blame": {
                mean: 2.5,
                sd: 0.9,
                interpretations: {
                    low: "when things go wrong you rarely look for the cause in yourself.",
                    mid: "you take some of the blame for what goes wrong, and leave some elsewhere.",
                    high: "when something goes wrong you tend to hold yourself responsible for it, whatever part others played.",
                },
            },
            Acceptance: {
                mean: 3.1,
                sd: 0.9,
                interpretations: {
                    low: "you do not readily make peace with what has happened: accepting it feels like giving in.",
                    mid: "you come round to accepting what has happened, in time.",
                    high: "you are quick to accept that what has happened has happened, and start from there.",
                },
            },
            Rumination: {
                mean: 2.8,
                sd: 0.9,
                interpretations: {
                    low: "you do not dwell on how a bad experience made you feel.",
                    mid: "you turn a bad experience over for a while before letting it go.",
                    high: "your thoughts keep returning to how you feel about what happened, long after it did.",
                },
            },
            "Positive Refocusing": {
                mean: 2.5,
                sd: 0.9,
                interpretations: {
                    low: "you rarely turn your mind to pleasanter things when something has gone wrong.",
                    mid: "you sometimes take your mind off a bad situation with something nicer.",
                    high: "when something goes wrong you turn your mind to pleasant things that have nothing to do with it.",
                },
            },
            "Refocus on Planning": {
                mean: 3.2,
                sd: 0.9,
                interpretations: {
                    low: "planning a way out is not where your mind goes first when something has gone wrong.",
                    mid: "you think about what to do about a bad situation, alongside everything else it brings up.",
                    high: "your first move under stress is to work out what can be done about it.",
                },
            },
            "Positive Reappraisal": {
                mean: 3.1,
                sd: 0.9,
                interpretations: {
                    low: "you seldom look for what a hard experience might teach you or make of you.",
                    mid: "you can sometimes see something to be gained from a hard experience.",
                    high: "you look for what a hard time can teach you, and expect to come out of it stronger.",
                },
            },
            "Putting into Perspective": {
                mean: 3.0,
                sd: 0.9,
                interpretations: {
                    low: "a bad experience is rarely made smaller for you by comparing it with worse ones.",
                    mid: "you sometimes remind yourself that things could be worse, and it sometimes helps.",
                    high: "you set what has happened against worse things in life, and it shrinks.",
                },
            },
            Catastrophising: {
                mean: 1.8,
                sd: 0.8,
                interpretations: {
                    low: "you seldom think of what has happened to you as terrible.",
                    mid: "a bad experience sometimes looms larger in your mind than it needs to.",
                    high: "your mind keeps returning to how terrible what happened was.",
                },
            },
            "Other-Blame": {
                mean: 1.8,
                sd: 0.8,
                interpretations: {
                    low: "you rarely put what has gone wrong down to other people.",
                    mid: "you sometimes hold others responsible for what has gone wrong.",
                    high: "when something goes wrong you tend to see the cause in other people.",
                },
            },
        },

        items: [
            { key: "CERQ_SelfBlame_1", dimension: "Self-Blame", text: "I feel that I am the one who is responsible for what has happened" }, // 10
            { key: "CERQ_SelfBlame_2", dimension: "Self-Blame", text: "I think that basically the cause must lie within myself" }, // 28
            { key: "CERQ_Acceptance_1", dimension: "Acceptance", text: "I think that I have to accept that this has happened" }, // 2
            { key: "CERQ_Acceptance_2", dimension: "Acceptance", text: "I think that I have to accept the situation" }, // 11
            { key: "CERQ_Rumination_1", dimension: "Rumination", text: "I often think about how I feel about what I have experienced" }, // 3
            {
                key: "CERQ_Rumination_2", // 12
                dimension: "Rumination",
                text: "I am preoccupied with what I think and feel about what I have experienced",
            },
            { key: "CERQ_PositiveRefocusing_1", dimension: "Positive Refocusing", text: "I think of pleasant things that have nothing to do with it" }, // 13
            { key: "CERQ_PositiveRefocusing_2", dimension: "Positive Refocusing", text: "I think of something nice instead of what has happened" }, // 22
            { key: "CERQ_RefocusPlanning_1", dimension: "Refocus on Planning", text: "I think about how to change the situation" }, // 23
            { key: "CERQ_RefocusPlanning_2", dimension: "Refocus on Planning", text: "I think about a plan of what I can do best" }, // 32
            { key: "CERQ_PositiveReappraisal_1", dimension: "Positive Reappraisal", text: "I think I can learn something from the situation" }, // 6
            {
                key: "CERQ_PositiveReappraisal_2", // 15
                dimension: "Positive Reappraisal",
                text: "I think that I can become a stronger person as a result of what has happened",
            },
            { key: "CERQ_Perspective_1", dimension: "Putting into Perspective", text: "I think that it hasn't been too bad compared to other things" }, // 25
            { key: "CERQ_Perspective_2", dimension: "Putting into Perspective", text: "I tell myself that there are worse things in life" }, // 34
            { key: "CERQ_Catastrophizing_1", dimension: "Catastrophising", text: "I keep thinking about how terrible it is what I have experienced" }, // 17
            { key: "CERQ_Catastrophizing_2", dimension: "Catastrophising", text: "I continually think how horrible the situation has been" }, // 35
            { key: "CERQ_OtherBlame_1", dimension: "Other-Blame", text: "I feel that others are responsible for what has happened" }, // 18
            { key: "CERQ_OtherBlame_2", dimension: "Other-Blame", text: "I feel that basically the cause lies with others" }, // 36

            // The level's attention check, dealt in among the eighteen. The
            // circles carry their numbers, so it names one — and one off
            // either end, since the ends are where a thumb goes without
            // reading, and off the middle-to-high ground the adaptive
            // strategies pull towards.
            {
                key: "CERQ_AttentionCheck",
                check: 2,
                text: "To show that I am reading these statements, I will answer 2 on this one",
            },
        ],
    },
])
