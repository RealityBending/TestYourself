defineBlock("mood", [
    {
        type: "briefing",
        key: "Briefing_Mood",
        text:
            "<h2>Now, how you have been.</h2>" +
            "<p>What follows is about the last few weeks rather than about you in general: your mood, how you " +
            "have been sleeping, and some experiences related to difficult memories and unusual feelings.</p>" +
            "<p>These are ordinary parts of human experience. What differs between people is how often they come " +
            "and how much they weigh.</p>" +
            "<p><em>Answer for the last few weeks as they actually were, not for how you usually are.</em></p>",
    },

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
            vertical: true,
            color: "#7c5cff",
            hovercolors: ["#22c55e", "#ef4444"],
        },

        // PLACEHOLDER norms, invented. Not from any published sample.
        // No `interpretations` on purpose: Anxiety and Depression never earn a
        // row of their own — the Mood face reads their sum against MOOD_NORM in
        // results.js — so there is no tercile text for anything here to say.
        norms: {
            Anxiety: { mean: 1.0, sd: 0.9 },
            Depression: { mean: 0.9, sd: 0.9 },
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

    {
        key: "Dissociation",
        name: "Strain",
        instructions: "",
        // Put on the same 5-option response format as the PHQ-4 — "in among
        // one another" in spirit if not literally the same questionnaire —
        // rather than the numbered circles the CDS-2 and PCL-2 arrive with.
        // The shared scale is also what lets both feed one dimension below:
        // an average across items answered on different scales would not
        // mean anything, but an average across four answered on the same one
        // does.
        format: {
            options: [
                { value: 0, text: "Not at all" },
                { value: 0.5, text: "Once or twice" },
                { value: 1, text: "Several days" },
                { value: 2, text: "More than half the days" },
                { value: 3, text: "Nearly every day" },
            ],
            vertical: true,
            color: "#5c6bc0",
            hovercolors: ["#22c55e", "#ef4444"],
        },

        // The CDS-2 and PCL-2 measure two different things — detachment from
        // one's surroundings, and the return of difficult memories — but nothing
        // downstream reads them apart from each other, so they are pooled into
        // one dimension rather than reported as two. "Strain" is the name this
        // section has always carried; the score behind it just used to be split
        // in half.
        // PLACEHOLDER norms, invented. Not from any published sample.
        norms: {
            Strain: {
                mean: 1.0,
                sd: 1.0,
                interpretations: {
                    low: "the world around you arrives solid and immediate, and difficult memories rarely intrude on your week.",
                    mid: "the odd moment of feeling at one remove from things, or a memory that resurfaces, reaches you about as often as it does most people.",
                    high: "you feel cut off from your surroundings, or unreal, and memories of stressful events return and are hard to put down, more often than most people report — a common enough experience under strain, and not a diagnosis of anything.",
                },
            },
            Sleep: {
                mean: 6.3,
                sd: 2.1,
                interpretations: {
                    low: "your sleep this week rated well below where most people put theirs — worth a closer look if it keeps up.",
                    mid: "your sleep this week landed about where most people's does.",
                    high: "your sleep this week has been better than most people report.",
                },
            },
        },

        items: [
            // CDS-2 ================================================================
            // The 2-item version of the Cambridge Depersonalisation Scale
            // (Michal et al., 2011). The two items found to discriminate best
            // between patients with and without clinically significant
            // depersonalisation/derealisation.
            {
                key: "CSD2_Depersonalisation_1",
                dimension: "Strain",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>My surroundings feel detached or unreal, as if there was a veil between me and the outside world</em>",
            },
            {
                key: "CSD2_Depersonalisation_2",
                dimension: "Strain",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Out of the blue, I feel strange, as if I were not real or as if I were cut off from the world</em>",
            },

            // PCL-2 ================================================================
            // A 2-item abbreviation of the PTSD Checklist (Bliese et al., 2008).
            {
                key: "PCL2_Trauma_1",
                dimension: "Strain",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Repeated, disturbing memories of a stressful experience</em>",
            },
            {
                key: "PCL2_Trauma_2",
                dimension: "Strain",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Feeling upset when something reminded you of a stressful experience</em>",
            },

            // SQS ================================================================
            // Single-Item Sleep Quality Scale (SQS; Snyder et al., 2018), kept
            // on its own 0-10 scale rather than the shared one above — sleep is
            // rated rather than recalled by frequency, so it is asked the way
            // it was published rather than made to match its neighbours.
            {
                key: "SQS_SleepQuality",
                dimension: "Sleep",
                instructions: "Please consider your sleep over the past 7 days.",
                format: {
                    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    anchors: ["Terrible", "Excellent"],
                    color: "#4338ca",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
                text: "During the past 7 days, how would you rate your sleep quality overall?",
            },
        ],
    },
])
