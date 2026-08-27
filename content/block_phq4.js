defineBlock("phq4", [
    // PHQ-4 ================================================================
    // The 4 item patient health questionnaire for anxiety and depression
    // (Kroenke et al., 2009), in the refined version with an additional
    // response option (Makowski et al., 2025).
    // Total score, sum of all items: normal (0-2), mild (3-5), moderate (6-8),
    // severe (9-12). Score >= 3 on the two anxiety items suggests anxiety,
    // >= 3 on the two depression items suggests depression.

    {
        key: "phq4",
        name: "Mood",
        instructions: "",
        format: {
            options: [
                { value: 0, text: "Not at all" },
                { value: 0.5, text: "Once or twice" },
                { value: 1, text: "Several days" },
                { value: 2, text: "More than half the days" },
                { value: 3, text: "Nearly every day" },
            ],
            color: "#7c5cff",
            hovercolors: ["#22c55e", "#ef4444"],
        },

        norms: {
            Anxiety: { mean: 1.0, sd: 0.9 },
            Depression: { mean: 0.9, sd: 0.9 },
            "Life Satisfaction": { mean: 6.5, sd: 2.0 },
        },

        items: [
            {
                key: "PHQ4_Anxiety_1",
                dimension: "Anxiety",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this problem:</small><br /><em>Feeling nervous, anxious or on edge</em>",
            },
            {
                key: "PHQ4_Anxiety_2",
                dimension: "Anxiety",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this problem:</small><br /><em>Not being able to stop or control worrying</em>",
            },
            {
                key: "PHQ4_Depression_3",
                dimension: "Depression",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this problem:</small><br /><em>Feeling down, depressed, or hopeless</em>",
            },
            {
                key: "PHQ4_Depression_4",
                dimension: "Depression",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this problem:</small><br /><em>Little interest or pleasure in doing things</em>",
            },
        ],
    },
])
