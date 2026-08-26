/* ==========================================================================
   content/level1.js — the way in: who is taking it, personality, self-regard.
   Opens the run, so `demographics1` is written first and asked first.
   ========================================================================== */

Object.assign(QUESTIONNAIRES, {
    // DEMOGRAPHICS =========================================================
    // Asked first and in the order written. No dimensions, so nothing here is
    // scored, charted or fed back — it is only recorded.

    demographics1: {
        name: "About you",
        instructions: "",
        level: 1,
        shuffle: false,
        format: {
            options: [
                { value: 1, text: "Male" },
                { value: 2, text: "Female" },
            ],
            columns: 2,
            color: "#2f6f9f",
        },

        items: [
            {
                key: "Age",
                text: "How old are you?",
                format: {
                    input: "number",
                    min: 18,
                    max: 120,
                    placeholder: "Age in years",
                    tooLow: "You must be 18+ years old to participate",
                    color: "#2f6f9f",
                },
            },
            {
                key: "MonthBirth",
                text: "In which month were you born?",
                format: {
                    options: [
                        { value: 1, text: "January" },
                        { value: 2, text: "February" },
                        { value: 3, text: "March" },
                        { value: 4, text: "April" },
                        { value: 5, text: "May" },
                        { value: 6, text: "June" },
                        { value: 7, text: "July" },
                        { value: 8, text: "August" },
                        { value: 9, text: "September" },
                        { value: 10, text: "October" },
                        { value: 11, text: "November" },
                        { value: 12, text: "December" },
                    ],
                    columns: 3,
                    color: "#2f6f9f",
                },
            },
            {
                key: "Gender",
                text: "I am...",
                format: {
                    options: [
                        { value: 1, text: "Male" },
                        { value: 2, text: "Female" },
                        { value: 3, text: "It's more complex than that", small: true },
                    ],
                    columns: 2,
                    color: "#2f6f9f",
                },
            },

            // Opened by the third answer above, and asked straight after it.
            {
                key: "GenderBirth",
                text: "I was born...",
                showIf: { key: "Gender", is: 3 },
            },
            // Put in their own words: no list of identities is going to be the
            // right one for everybody it is being asked of.
            {
                key: "GenderIdentity",
                text: "But I identify as...",
                showIf: { key: "Gender", is: 3 },
                format: {
                    input: "text",
                    max: 60,
                    placeholder: "In your own words",
                    color: "#2f6f9f",
                },
            },

            // The end of the preliminaries and the start of the test proper.
            // It says what is coming next and warns that it gets stranger, so
            // that an odd question later reads as the descent working rather
            // than as a mistake worth backing out of.
            {
                key: "SectionPersonality",
                section: true,
                text:
                    "<h2>Down we go.</h2>" +
                    "<p>That was who you are on paper. What follows is about who you are: the ordinary shape of how you " +
                    "think, feel and behave when nobody is asking.</p>" +
                    "<p>Be warned. The deeper you go, the stranger the questions become — about your body, your moods, " +
                    "the things you notice that others do not. That is deliberate. The questions nobody thinks to ask " +
                    "are the ones that separate people most sharply, and the patterns underneath them run further down " +
                    "than you would expect.</p>" +
                    "<p><em>There are no right answers. Answer as you are, not as you would like to be.</em></p>",
            },
        ],
    },

    // FIPI =================================================================
    // Five-Item Personality Inventory (Gosling et al., 2003): one item per
    // domain of the Five Factor Model, rated on a 7-point Likert scale.

    fipi: {
        name: "Personality",
        instructions: "Please indicate the extent to which you agree or disagree with that statement",
        level: 1,
        format: {
            options: [1, 2, 3, 4, 5, 6, 7],
            anchors: ["Strongly disagree", "Strongly agree"],
            color: "#12a594",
            hovercolors: ["#ef4444", "#22c55e"],
        },

        // PLACEHOLDER NORMS — invented numbers, not from any sample. Replace
        // the means and SDs with real ones before showing these to anybody.
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
            Agreeableness: {
                mean: 5.2,
                sd: 1.1,
                interpretations: {
                    low: "you are direct and sceptical, and are comfortable holding a position others disagree with.",
                    mid: "you cooperate readily, while keeping an eye on your own interests.",
                    high: "you give people the benefit of the doubt, and put a good deal of weight on keeping the peace.",
                },
            },
            Conscientiousness: {
                mean: 5.0,
                sd: 1.3,
                interpretations: {
                    low: "you work in bursts, and stay open to changing a plan rather than following it to the letter.",
                    mid: "you keep on top of what matters without being especially rigid about how.",
                    high: "you plan ahead, follow through, and are unusually reliable with commitments.",
                },
            },
            "Emotional Stability": {
                mean: 4.4,
                sd: 1.4,
                interpretations: {
                    low: "you feel stress keenly, and register worries earlier than most people do.",
                    mid: "you handle ordinary pressure well, though difficult stretches still take a toll.",
                    high: "you stay steady under pressure, and recover quickly when things go wrong.",
                },
            },
            Openness: {
                mean: 5.3,
                sd: 1.2,
                interpretations: {
                    low: "you prefer the familiar and the practical to the abstract or the experimental.",
                    mid: "you enjoy new ideas in moderation, while keeping a foot in the tried and tested.",
                    high: "you are drawn to new ideas, and enjoy the abstract, the creative and the unfamiliar.",
                },
            },
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

    // SINS =================================================================
    // Single Item Narcissism Scale (Konrath et al., 2014): one question, asked
    // straight out, with the word it turns on explained inside it.

    sins: {
        name: "Self-regard",
        instructions: "",
        level: 1,
        format: {
            options: [1, 2, 3, 4, 5, 6, 7],
            anchors: ["Not at all", "Very much"],
            color: "#f0b429",
            hovercolors: ["#22c55e", "#ef4444"],
        },

        // PLACEHOLDER NORMS — invented numbers, on the 1-7 scale of the item.
        norms: {
            Narcissism: {
                mean: 2.9,
                sd: 1.5,
                interpretations: {
                    low: "you do not see yourself as the point of the room, and would rather the attention went elsewhere.",
                    mid: "you think about how you come across about as much as most people do.",
                    high: "you own to putting yourself first, and are readier than most to say so plainly.",
                },
            },
        },

        items: [
            {
                key: "SINS_Narcissism",
                dimension: "Narcissism",
                text: "<small>To what extent do you agree with this statement:</small><br /><em>I am a narcissist</em><br /><small>(the word means egotistical, self-focused and vain)</small>",
            },
        ],
    },
})
