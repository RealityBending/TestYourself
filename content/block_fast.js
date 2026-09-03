defineBlock("fast", [
    // Instructions ===========================================================
    {
        type: "briefing",
        key: "Briefing_Personality",
        text:
            "<h2>Let's start.</h2>" +
            "<p>The following questions contains general statements about your personality: how you " +
            "generally are and how you perceive yourself.</p>" +
            "<p>Be warned however, that the deeper you progress in this test, the stranger the questions become, " +
            "asking about specific corners of your internal life, and probing for experiences that you might not even be aware of.</p>" +
            "<p><em>There are no right answers. Answer as you are, not as you would like to be.</em></p>",
    },

    // FIPI =================================================================
    // Five-Item Personality Inventory (Gosling et al., 2003): one item per
    // domain of the Five Factor Model, rated on a 7-point Likert scale.

    {
        key: "fipi",
        name: "Personality",
        instructions: "Please indicate the extent to which you agree or disagree with that statement",
        // A first sketch, not the portrait: the HEXACO on level 4 draws the same
        // ground in full and takes the axes on the whole-run web, so this stays
        // off it.
        profile: false,
        format: {
            options: [1, 2, 3, 4, 5, 6, 7],
            anchors: ["Strongly disagree", "Strongly agree"],
            color: "#673AB7",
            hovercolors: ["#ef4444", "#22c55e"],
        },

        // ONLY TWO OF THE FIVE ARE FED BACK (September 2026): Extraversion, the
        // trait everybody recognises, and Emotional Stability, the one the
        // HEXACO has no counterpart for (its Emotionality is fear, worry and
        // dependence, not calm). The other three have their norms commented
        // out, which is the whole of the mechanism — asked, scored and saved,
        // but no row — because the HEXACO on level 4 reads Agreeableness,
        // Conscientiousness and Openness back in full, as Patience, Diligence
        // and Curiosity. Two rows and no chart: `drawSpider` wants three axes,
        // and "fipi" is out of CHARTS in app.js. Uncomment the three and put
        // it back there for the five-axis chart.
        // PLACEHOLDER norms, invented. Not from any published sample.
        norms: {
            Extraversion: {
                mean: 4.1,
                sd: 1.5,
                interpretations: {
                    low: "you draw your energy from quieter settings, and prefer a few close ties to a wide circle.",
                    mid: "you move between sociable and solitary modes depending on the day and the company.",
                    high: "you seek out company and conversation, and gain energy from being around other people.",
                },
            },
            // Agreeableness: {
            //     mean: 5.2,
            //     sd: 1.1,
            //     interpretations: {
            //         low: "you are direct and sceptical, and are comfortable holding a position others disagree with.",
            //         mid: "you cooperate readily, while keeping an eye on your own interests.",
            //         high: "you give people the benefit of the doubt, and put a good deal of weight on keeping the peace.",
            //     },
            // },
            // Conscientiousness: {
            //     mean: 5.0,
            //     sd: 1.3,
            //     interpretations: {
            //         low: "you work in bursts, and stay open to changing a plan rather than following it to the letter.",
            //         mid: "you keep on top of what matters without being especially rigid about how.",
            //         high: "you plan ahead, follow through, and are unusually reliable with commitments.",
            //     },
            // },
            "Emotional Stability": {
                mean: 4.4,
                sd: 1.4,
                interpretations: {
                    low: "you feel stress keenly, and register worries earlier than most people do.",
                    mid: "you handle ordinary pressure well, though difficult stretches still take a toll.",
                    high: "you stay steady under pressure, and recover quickly when things go wrong.",
                },
            },
            // Openness: {
            //     mean: 5.3,
            //     sd: 1.2,
            //     interpretations: {
            //         low: "you prefer the familiar and the practical to the abstract or the experimental.",
            //         mid: "you enjoy new ideas in moderation, while keeping a foot in the tried and tested.",
            //         high: "you are drawn to new ideas, and enjoy the abstract, the creative and the unfamiliar.",
            //     },
            // },
        },
        items: [
            {
                key: "FIPI_Extraversion",
                dimension: "Extraversion",
                text: "I see myself as extraverted, enthusiastic (that is, sociable, assertive, talkative, active, NOT reserved or shy).",
            },
            {
                key: "FIPI_Agreeableness",
                dimension: "Agreeableness",
                text: "I see myself as agreeable, kind (that is, trusting, generous, sympathetic, cooperative, NOT aggressive or cold).",
            },
            {
                key: "FIPI_Conscientiousness",
                dimension: "Conscientiousness",
                text: "I see myself as dependable, organized (that is, hard-working, responsible, self-disciplined, thorough, NOT careless or impulsive).",
            },
            {
                key: "FIPI_EmotionalStability",
                dimension: "Emotional Stability",
                text: "I see myself as emotionally stable, calm (that is, relaxed, self-confident, NOT anxious, moody, easily upset, or easily stressed).",
            },
            {
                key: "FIPI_Openness",
                dimension: "Openness",
                text: "I see myself as open to experience, imaginative (that is, curious, reflective, creative, deep, open-minded, NOT conventional).",
            },
        ],
    },

    // SINGLE-ITEM SCALES ===================================================
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
                text: "I am a narcissist<br /><small>(the word means egotistical, self-focused and vain)</small>",
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
                    options: [1, 2, 3, 4, 5],
                    anchors: ["Poor", "Excellent"],
                    color: "#7B1FA2",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
                text: "In general, would you say your health is:",
            },

            // Single-Item Measure of Stress Symptoms (Elo et al., 2003)
            {
                key: "SIMS_Stress",
                format: {
                    options: [1, 2, 3, 4, 5],
                    anchors: ["Not at all", "Very much"],
                    color: "#7B1FA2",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
                text: "<small>Stress means a situation in which a person feels tense, restless, nervous or anxious or is unable to sleep at night because his/her mind is troubled all the time.</small><br /><br /><em>Do you feel this kind of stress these days?</em>",
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

            // General Self-Efficacy Single-Item (GSE-SI; Di et al., 2023)
            {
                key: "GSESI_TaskEfficacy",
                instructions: "Please indicate the extent to which you agree or disagree with the statement.",
                format: {
                    options: [1, 2, 3, 4, 5],
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
                    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
