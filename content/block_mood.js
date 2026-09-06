defineBlock("mood", [
    {
        type: "briefing",
        key: "Briefing_Mood",
        text:
            "<h2>Now, how you have been lately.</h2>" +
            "<p>The next questions are about the last couple of weeks rather than about you in general: your mood, " +
            "your sleep, and whether stressful memories have been bothering you.</p>" +
            "<p>Everybody has some of this. What differs is how often it comes and how heavy it is.</p>" +
            "<p><em>Answer for the last two weeks as they actually were, not for how you usually are.</em></p>",
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

    // What is left of the questionnaire that held the CDS-2 and then the
    // PCL-2: the sleep single item alone. It was keyed `Dissociation` until
    // September 2026; the questionnaire key is saved nowhere, so nothing had
    // to line up. The shared 5-option format stays as its default so that
    // either commented-out scale would come back on it as written — an
    // average across items answered on different scales would not mean
    // anything — while the SQS carries a format of its own.
    {
        key: "sleep",
        name: "Sleep",
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
            color: "#5c6bc0",
            hovercolors: ["#22c55e", "#ef4444"],
        },

        // PLACEHOLDER norms, invented. Not from any published sample. Sleep's
        // are read by nothing: this questionnaire is one of the Mood & Health
        // pair, whose section is the faces, and Sleep is not a face. The
        // Stress norms belong to the PCL-2 and are commented out with it.
        norms: {
            // Stress: {
            //     mean: 1.0,
            //     sd: 1.0,
            //     interpretations: {
            //         low: "difficult memories have mostly left you alone over the last two weeks, and little has come back to trouble you.",
            //         mid: "a stressful memory has come back to you now and then over the last two weeks, about as often as it does for most people.",
            //         high: "memories of something stressful have come back to you, and upset you, more often over the last two weeks than most people report. That is common under strain, and it is not a diagnosis of anything.",
            //     },
            // },
            Sleep: {
                mean: 6.3,
                sd: 2.1,
                interpretations: {
                    low: "your sleep this week rated well below where most people put theirs. Worth a closer look if it keeps up.",
                    mid: "your sleep this week landed about where most people's does.",
                    high: "your sleep this week has been better than most people report.",
                },
            },
        },

        items: [
            // CDS-2 ================================================================
            // COMMENTED OUT (September 2026): two of the HiTOP-BR items asked on
            // this level ("I felt like I was outside of my body", "I felt that
            // things around me were not real") are the same content over twelve
            // months, so the two-week window was all these added. Kept whole so
            // they can be put back by uncommenting; they would rejoin the Stress
            // dimension as written.
            // // The 2-item version of the Cambridge Depersonalisation Scale
            // // (Michal et al., 2011). The two items found to discriminate best
            // // between patients with and without clinically significant
            // // depersonalisation/derealisation.
            // {
            //     key: "CSD2_Depersonalisation_1",
            //     dimension: "Stress",
            //     text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>My surroundings feel detached or unreal, as if there was a veil between me and the outside world</em>",
            // },
            // {
            //     key: "CSD2_Depersonalisation_2",
            //     dimension: "Stress",
            //     text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Out of the blue, I feel strange, as if I were not real or as if I were cut off from the world</em>",
            // },

            // PCL-2 ================================================================
            // A 2-item abbreviation of the PTSD Checklist (Bliese et al., 2008).
            // COMMENTED OUT (September 2026): its first item is HiTOP-BR item 9
            // ("My mind was flooded with troubling images of a bad experience")
            // over two weeks instead of twelve months, the same duplication the
            // CDS-2 was cut for, and "Stress" misnamed what it measures, which
            // is trauma intrusion. It was the Stress dimension, the middle face
            // of Mood & Health and an axis on the whole-run web; all three went
            // with it, and the Stress face in js/figures/faces.js waits for it.
            // Kept whole, with its norms above, so it can be put back by
            // uncommenting both.
            // {
            //     key: "PCL2_Trauma_1",
            //     dimension: "Stress",
            //     text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Repeated, disturbing memories of a stressful experience</em>",
            // },
            // {
            //     key: "PCL2_Trauma_2",
            //     dimension: "Stress",
            //     text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Feeling upset when something reminded you of a stressful experience</em>",
            // },

            // SQS ================================================================
            // Single-Item Sleep Quality Scale (SQS; Snyder et al., 2018), kept
            // on its own 0-10 scale rather than the shared one above — sleep is
            // rated rather than recalled by frequency, so it is asked the way
            // it was published rather than made to match its neighbours. As
            // published it is a discretised visual analogue scale in five
            // bands (0 terrible, 1-3 poor, 4-6 fair, 7-9 good, 10 excellent)
            // with a note on what "quality" covers; the circles carry the
            // numbers and the two end anchors, so the bands and the note go in
            // the instructions under the question.
            {
                key: "SQS_SleepQuality",
                dimension: "Sleep",
                instructions:
                    "Think about the overall quality of your sleep: how many hours you slept, how easily you fell asleep, " +
                    "how often you woke during the night (other than to go to the toilet), how often you woke earlier than " +
                    "you had to, and how refreshing your sleep was. 0 is terrible, 1 to 3 poor, 4 to 6 fair, 7 to 9 good " +
                    "and 10 excellent.",
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
