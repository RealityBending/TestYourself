// The single-item scales of level 1: ten of them, asked as ONE questionnaire
// and not as ten, so that they are dealt in among one another rather than
// arriving in the order they happen to be written. None of them is a sixth
// item on the FIPI, which would put it on a chart it does not belong on.
//
// A block of its own since September 2026, split out of block_fast.js with
// block_fipi.js. Being two blocks rather than one changes nothing about the
// order: a questionnaire is the unit of shuffling, and the two were already
// two questionnaires.
//
// If one of these ever earns norms it wants a questionnaire of its own back,
// so that its results carry its own name.
defineBlock("singles", [
    {
        key: "singles",
        name: "Single-item scales",
        instructions: "",

        items: [
            // Single Item Narcissism Scale (Konrath et al., 2014)
            {
                key: "SINS_Narcissism",
                instructions: "To what extent do you agree with this statement",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Not at all", "Very much"],
                    color: "#673AB7",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
                text: "I am a narcissist<br /><br /><small>Narcissist here means egotistical, self-focused and vain.</small>",
            },

            // Single-Item Self-Rated Health (SRH / GSRH; DeSalvo et al., 2006).
            // Lightly reframed to mention "physical" and "bodily". The one single
            // with a dimension besides Life Satisfaction: the Health face on
            // level 3 reads it (results.js, `healthFace`), against a norm
            // written there, since the SSS-8 that used to feed that face is
            // commented out. No norms here, so it earns no row of its own.
            {
                key: "SRH_GeneralHealth",
                dimension: "General Health",
                instructions: "Please rate your general physical health and bodily well-being.",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Poor", "Excellent"],
                    color: "#7B1FA2",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
                text: "In general, would you say your health is...<br /><br /><small>Health here refers to your physical health.</small>",
            },

            // Single-Item Measure of Stress Symptoms (Elo et al., 2003)
            {
                key: "SIMS_Stress",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Not at all", "Very much"],
                    color: "#7B1FA2",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
                text: "Do you feel this kind of stress these days?<br /><br /><small>Stress here means a situation in which a person feels tense, restless, nervous or anxious or is unable to sleep at night because his/her mind is troubled all the time.</small>",
            },

            // Single-Item Self-Esteem Scale (SISE; Robins, Hendin &
            // Trzesniewski, 2001). High convergent validity with the RSES
            // (r = .75 in some replications); against it, lower test-retest
            // reliability and more acquiescence bias.
            {
                key: "SISE_SelfEsteem",
                instructions: "Please indicate how true this statement is of you.",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Not very true of me", "Very true of me"],
                    color: "#7B1FA2",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
                text: "I have high self-esteem.",
            },

            // Self-Concept Clarity Scale (SCCS; Campbell et al., 1996), item 11
            // of the twelve: the one statement of the construct itself in the
            // positive, on the scale's own 5 points. Added September 2026 for
            // the sense of knowing who one is, beside the meaning-in-life
            // ideas in README.md. No norms, so it earns no row.
            {
                key: "SCCS_SelfConceptClarity",
                instructions: "Please indicate the extent to which you agree or disagree with the statement.",
                format: {
                    options: [1, 2, 3, 4, 5],
                    anchors: ["Strongly disagree", "Strongly agree"],
                    color: "#7B1FA2",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
                text: "In general, I have a clear sense of who I am and what I am.",
            },

            // Search for meaning: item 8 of the Meaning in Life Questionnaire
            // (MLQ; Steger et al., 2006), on the MLQ's own 7 points. One of the
            // two items of its Search subscale that hold up best across the
            // original and later validations (the ranking is in README.md);
            // asked for the feeling of being without a purpose and looking
            // for one. No norms, so it earns no row.
            {
                key: "MLQ_SearchForMeaning",
                instructions: "Please indicate how true this statement is of you.",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Absolutely untrue", "Absolutely true"],
                    color: "#7B1FA2",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
                text: "I am seeking a purpose or mission for my life.",
            },

            // General Self-Efficacy Single-Item (GSE-SI; Di et al., 2023)
            {
                key: "GSESI_TaskEfficacy",
                instructions: "Please indicate the extent to which you agree or disagree with the statement.",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Strongly disagree", "Strongly agree"],
                    color: "#7B1FA2",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
                text: "I am confident that I can perform effectively on many different tasks.",
            },

            // Single-Item Life Satisfaction Scale (SILS; Cheung & Lucas, 2014; Jovanović & Lazić, 2020)
            {
                key: "SILS_LifeSatisfaction",
                dimension: "Life Satisfaction",
                text: "All things considered, how satisfied are you with your life as a whole?",
                format: {
                    options: [1, 2, 3, 4, 5, 6, 7],
                    anchors: ["Totally dissatisfied", "Totally satisfied"],
                    color: "#7c5cff",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
            },

            // Intelligence
            {
                key: "SelfPlacement_Intelligence",
                type: "curve",
                instructions: "In a room of 100 random people...",
                format: { min: 0, max: 100, color: "#7B1FA2" },
                text: "I am typically more intelligent than...<br /><br /><small>Intelligent here refers to reasoning, problem-solving, and how quickly you learn or understand things. It does not refer to emotional intelligence, social skills, wisdom, or creativity.</small>",
            },

            // Attractiveness
            {
                key: "SelfPlacement_Attractiveness",
                type: "curve",
                instructions: "In a room of 100 random people...",
                format: { min: 0, max: 100, color: "#7B1FA2" },
                text: "I am typically more attractive than...<br /><br /><small>Attractive here refers to your overall desirability as a romantic or sexual partner. Not just physical appearance, but also personality, charm, and other qualities that make someone appealing to others.</small>",
            },
        ],
    },
])
