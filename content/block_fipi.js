defineBlock("fipi", [
    // Instructions ===========================================================
    {
        type: "briefing",
        key: "Briefing_Personality",
        text:
            "<h2>Let's start with general questions.</h2>" +
            "<p>The following questions contain statements about your personality: how you " +
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
        instructions: "Please indicate the extent to which you agree or disagree with this statement",
        profile: false,
        format: {
            options: [1, 2, 3, 4, 5, 6, 7],
            anchors: ["Strongly disagree", "Strongly agree"],
            color: "#673AB7",
            hovercolors: ["#ef4444", "#22c55e"],
        },

        // PLACEHOLDER norms, invented. Not from any published sample.
        // Note: These two norms exist for the temperament assessment. The
        // level reads the FIPI back as the two old theories (js/figures/
        // theories.js), and the temperament is a quadrant: each of these two
        // dimensions is turned into a percentile against its norm, and which
        // side of the average it falls names the humour (outgoing and steady
        // is Sanguine, and so on).
        norms: {
            Extraversion: { mean: 4.1, sd: 1.5 },
            "Emotional Stability": { mean: 4.4, sd: 1.4 },
        },
        items: [
            {
                key: "FIPI_Extraversion",
                dimension: "Extraversion",
                text:
                    "I see myself as extraverted, enthusiastic<br /><br />" +
                    "<small>That is: sociable, assertive, talkative, active, NOT reserved or shy</small>",
            },
            {
                key: "FIPI_Agreeableness",
                dimension: "Agreeableness",
                text:
                    "I see myself as agreeable, kind<br /><br />" +
                    "<small>That is: trusting, generous, sympathetic, cooperative, NOT aggressive or cold</small>",
            },
            {
                key: "FIPI_Conscientiousness",
                dimension: "Conscientiousness",
                text:
                    "I see myself as dependable, organized<br /><br />" +
                    "<small>That is: hard-working, responsible, self-disciplined, thorough, NOT careless or impulsive</small>",
            },
            {
                key: "FIPI_EmotionalStability",
                dimension: "Emotional Stability",
                text:
                    "I see myself as emotionally stable, calm<br /><br />" +
                    "<small>That is: relaxed, self-confident, NOT anxious, moody, easily upset or easily stressed</small>",
            },
            {
                key: "FIPI_Openness",
                dimension: "Openness",
                text:
                    "I see myself as open to experience, imaginative<br /><br />" +
                    "<small>That is: curious, reflective, creative, deep, open-minded, NOT conventional</small>",
            },
        ],
    },
])
