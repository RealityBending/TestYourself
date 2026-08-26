/* ==========================================================================
   content/level3.js — the deepest part: mood, and the two short screens
   read beside it.
   ========================================================================== */

Object.assign(QUESTIONNAIRES, {
    // PHQ-4 ================================================================
    // The 4 item patient health questionnaire for anxiety and depression
    // (Kroenke et al., 2009), in the refined version with an additional
    // response option (Makowski et al., 2025).
    // Total score, sum of all items: normal (0-2), mild (3-5), moderate (6-8),
    // severe (9-12). Score >= 3 on the two anxiety items suggests anxiety,
    // >= 3 on the two depression items suggests depression.
    // Every item carries its own stem — "over the last 2 weeks..." — so that
    // what is being asked is in the question rather than above it.
    //
    // Also includes the Single-Item Life Satisfaction Scale
    // (Cheung & Lucas, 2014; Jovanović & Lazić, 2020), on an 11-point scale
    // from 0 = totally dissatisfied to 10 = totally satisfied.

    phq4: {
        name: "Mood",
        instructions: "",
        level: 3,
        format: {
            options: [
                { value: 0, text: "Not at all" },
                { value: 0.5, text: "Once or twice" },
                { value: 1, text: "Several days" },
                { value: 2, text: "More than half the days" },
                { value: 3, text: "Nearly every day" },
            ],
            color: "#7c5cff",
            // Reversed: here the low end is the untroubled one.
            hovercolors: ["#22c55e", "#ef4444"],
        },

        // PLACEHOLDER NORMS — invented numbers. Anxiety and Depression are on
        // the 0-3 scale of the items, Life Satisfaction on its own 0-10 one.
        norms: {
            Anxiety: { mean: 1.0, sd: 0.9 },
            Depression: { mean: 0.9, sd: 0.9 },
            "Life Satisfaction": { mean: 6.5, sd: 2.0 },
        },

        items: [
            {
                key: "LifeSatisfaction",
                dimension: "Life Satisfaction",
                text: "All things considered, how satisfied are you with your life as a whole?",
                format: {
                    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    anchors: ["Totally dissatisfied", "Totally satisfied"],
                    color: "#7c5cff",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
            },
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

    // PATHOLOGICAL =========================================================
    // Two short screens read side by side on the same level as the mood ones:
    // the Cambridge Depersonalisation Scale in its 2-item adaptation (Michal
    // et al., 2011), on four points, and the PTSD Checklist in its 2-item
    // version (Lang et al., 2012), on five. The two scales differ, so the
    // trauma items carry a format of their own.

    // "Strain" rather than "Distress": the PHQ-4's own reading already calls
    // its total a distress score, and two of those on one screen read as one.
    pathological: {
        name: "Strain",
        instructions: "",
        level: 3,
        format: {
            options: [0, 1, 2, 3],
            anchors: ["Not at all", "Nearly every day"],
            color: "#5c6bc0",
            // Reversed, as in the mood items: the low end is the untroubled one.
            hovercolors: ["#22c55e", "#ef4444"],
        },

        // PLACEHOLDER NORMS — invented numbers. Depersonalisation is on the
        // 0-3 scale of its items, Trauma on the 0-4 scale of its own.
        norms: {
            Depersonalisation: {
                mean: 0.7,
                sd: 0.8,
                interpretations: {
                    low: "the world around you arrives solid and immediate, and you rarely feel set apart from it.",
                    mid: "the odd moment of feeling at one remove from things reaches you, as it does most people.",
                    high: "you feel cut off from your surroundings, or unreal, more often than most people do — a common enough experience under strain, and not a diagnosis of anything.",
                },
            },
            Trauma: {
                mean: 1.2,
                sd: 1.1,
                interpretations: {
                    low: "reminders of difficult times rarely intrude on your week.",
                    mid: "difficult memories surface from time to time, and settle again.",
                    high: "memories of stressful events return often and are hard to put down — which is worth taking seriously, though it is not a diagnosis of anything.",
                },
            },
        },

        items: [
            {
                key: "CSD2_Deperso_1",
                dimension: "Depersonalisation",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>My surroundings feel detached or unreal, as if there was a veil between me and the outside world</em>",
            },
            {
                key: "CSD2_Deperso_2",
                dimension: "Depersonalisation",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Out of the blue, I feel strange, as if I were not real or as if I were cut off from the world</em>",
            },
            {
                key: "PCL2_Trauma_1",
                dimension: "Trauma",
                text: "<small>In the past month, how much were you bothered by:</small><br /><em>Repeated, disturbing memories</em>",
                format: {
                    options: [0, 1, 2, 3, 4],
                    anchors: ["Not at all", "Extremely"],
                    color: "#3949ab",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
            },
            {
                key: "PCL2_Trauma_2",
                dimension: "Trauma",
                text: "<small>In the past month, how much were you bothered by:</small><br /><em>Feeling upset when reminded of past stress</em>",
                format: {
                    options: [0, 1, 2, 3, 4],
                    anchors: ["Not at all", "Extremely"],
                    color: "#3949ab",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
            },
        ],
    },
})
