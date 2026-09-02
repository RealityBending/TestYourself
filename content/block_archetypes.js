defineBlock("archetypes", [
    {
        type: "briefing",
        key: "Briefing_Archetypes",
        text:
            "<h2>Last, the story.</h2>" +
            "<p>Long before anybody measured a personality, people described one another by the part they seemed to be " +
            "playing: the sage, the warrior, the fool, the one who looks after everybody else. These are " +
            "<b>archetypes</b> — the handful of shapes a life keeps being told in.</p>" +
            "<p>What follows is twelve of them, two lines each. None is better than another, and most people carry " +
            "several at once.</p>" +
            "<p><em>Answer for the story you are actually in, not the one you would pick.</em></p>",
    },

    // ARCHETYPES ===========================================================
    // Twelve two-item scales after the twelve-archetype framework of Carol S.
    // Pearson's Pearson–Marr Archetype Indicator (PMAI). The statements are
    // NOT the PMAI's own: they are paraphrased and theoretically inferred,
    // written to capture the core assumption, gift and pitfall of each
    // archetype, first for the Neuropsychological Tarot prototype and revised
    // here (September 2026). The revision kept every statement in the first
    // person and about oneself rather than about how the world should be,
    // took out the absolutes ("always", "never", "the most important") and
    // the comparisons that pitted one archetype against another inside a
    // single item, split the double-barrelled ones down to one claim each,
    // and dropped the qualifiers nobody could disagree with ("systems that
    // are harmful"). The instrument is therefore unvalidated, and nothing
    // here is a PMAI score.
    //
    // The twelve are written in the order they are drawn on the wheel in
    // results.js — three to a quarter, round the colour circle — rather than
    // in any order of importance. The wheel is the only place they are drawn:
    // the whole-run profile web leaves them out, since twelve axes on it
    // would only repeat the wheel and crowd out everything else.
    //
    // NO NORMS, deliberately, and this is the one questionnaire in the app
    // that is fed back anyway. There is no population mean for "Warrior" that
    // would mean anything, and inventing twelve more would be twelve more
    // invented numbers; the twelve are read *against each other* instead —
    // which of these stories is loudest in you — which is what the framework
    // claims to be about in the first place. That is why results.js draws
    // them as a wheel rather than as rows: a row wants a percentile, and
    // there is none here to give.

    {
        key: "archetypes",
        name: "Archetypes",
        instructions: "Please indicate the extent to which you agree or disagree with each statement",
        format: {
            options: [1, 2, 3, 4, 5, 6, 7],
            anchors: ["Strongly disagree", "Strongly agree"],
            // No hovercolors: there is no good end of an archetype, only more
            // or less of it.
            color: "#ef6c4d",
        },

        items: [
            // Yearn for paradise ------------------------------------------
            {
                key: "Archetype_Idealist_1",
                dimension: "Idealist",
                text: "No matter how bad things look, I trust that everything will turn out well in the end.",
            },
            {
                key: "Archetype_Idealist_2",
                dimension: "Idealist",
                text: "I prefer to focus on the good in people and situations rather than their flaws.",
            },
            {
                key: "Archetype_Sage_1",
                dimension: "Sage",
                text: "I am driven to understand the underlying truth of any situation, even if it is uncomfortable.",
            },
            {
                key: "Archetype_Sage_2",
                dimension: "Sage",
                text: "I trust careful analysis and evidence over gut feeling and opinion.",
            },
            {
                key: "Archetype_Seeker_1",
                dimension: "Seeker",
                text: "I keep seeking out new experiences to find out who I really am.",
            },
            {
                key: "Archetype_Seeker_2",
                dimension: "Seeker",
                text: "Having the freedom to chart my own course is more important to me than security or settling down.",
            },

            // Leave a mark -------------------------------------------------
            {
                key: "Archetype_Revolutionary_1",
                dimension: "Revolutionary",
                text: "When something in my life is no longer working, I am willing to destroy it completely so something better can emerge.",
            },
            {
                key: "Archetype_Revolutionary_2",
                dimension: "Revolutionary",
                text: "I am willing to break rules and traditions that stand in the way of something better.",
            },
            {
                key: "Archetype_Magician_1",
                dimension: "Magician",
                text: "By changing how I see a situation, I can often change the outcome for everyone involved.",
            },
            {
                key: "Archetype_Magician_2",
                dimension: "Magician",
                text: "I am good at helping people see a situation differently.",
            },
            {
                key: "Archetype_Warrior_1",
                dimension: "Warrior",
                text: "I meet challenges head-on rather than avoiding them.",
            },
            {
                key: "Archetype_Warrior_2",
                dimension: "Warrior",
                text: "When I see an injustice or a problem, I feel a strong duty to step up and fix it.",
            },

            // Connect with others ------------------------------------------
            {
                key: "Archetype_Realist_1",
                dimension: "Realist",
                text: "I would rather be one of the team than the one in charge.",
            },
            {
                key: "Archetype_Realist_2",
                dimension: "Realist",
                text: "I try to stay unpretentious and down-to-earth.",
            },
            {
                key: "Archetype_Jester_1",
                dimension: "Jester",
                text: "I get through hard times by finding what is funny in them.",
            },
            {
                key: "Archetype_Jester_2",
                dimension: "Jester",
                text: "I love bringing playfulness, laughter, and lightness into any situation I am in.",
            },
            {
                key: "Archetype_Lover_1",
                dimension: "Lover",
                text: "I feel truly alive when I am deeply connected to someone I love.",
            },
            {
                key: "Archetype_Lover_2",
                dimension: "Lover",
                text: "Closeness and intimacy are where I find the most meaning in life.",
            },

            // Provide structure --------------------------------------------
            {
                key: "Archetype_Creator_1",
                dimension: "Creator",
                text: "I feel most alive when I am inventing, designing, or bringing a new idea into the world.",
            },
            {
                key: "Archetype_Creator_2",
                dimension: "Creator",
                text: "Beauty, originality, and self-expression matter more to me than practicality or convention.",
            },
            {
                key: "Archetype_Ruler_1",
                dimension: "Ruler",
                text: "I am at my best when I am in charge.",
            },
            {
                key: "Archetype_Ruler_2",
                dimension: "Ruler",
                text: "I like setting clear rules and making sure they are followed.",
            },
            {
                key: "Archetype_Caregiver_1",
                dimension: "Caregiver",
                text: "I feel most fulfilled when I am taking care of someone who needs my support.",
            },
            {
                key: "Archetype_Caregiver_2",
                dimension: "Caregiver",
                text: "I feel responsible for easing other people's suffering.",
            },
        ],
    },
])
