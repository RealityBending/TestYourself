// The FIPI and the briefing that opens the whole test, a block of the two so
// that they move as a piece: the briefing warns that the questions get
// stranger the deeper the run goes, which is the frame for everything after it
// and not for the five items alone. Split out of block_fast.js in September
// 2026, along with block_singles.js; `fast` held all three, and the name said
// how long they take rather than what they are.
defineBlock("fipi", [
    // Instructions ===========================================================
    {
        type: "briefing",
        key: "Briefing_Personality",
        text:
            "<h2>Let's start with general questions.</h2>" +
            "<p>The following questions contains statements about your personality: how you " +
            "are most of the time, and how you perceive yourself.</p>" +
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
])
