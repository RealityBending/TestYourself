/* ==========================================================================
   content/level2.js — the rest of who is taking it, and interoception.
   ========================================================================== */

Object.assign(QUESTIONNAIRES, {
    // DEMOGRAPHICS 2 =======================================================
    // The rest of what is asked about somebody rather than of them. It waits
    // for the second level so that the way in stays short, and is written in
    // the order it is asked: an item that opens on an answer follows it.

    demographics2: {
        name: "Background",
        instructions: "",
        level: 2,
        shuffle: false,
        // The plain yes or no. Every other item here carries a list of its own.
        format: {
            options: [
                { value: 1, text: "Yes" },
                { value: 0, text: "No" },
            ],
            columns: 2,
            color: "#2f6f9f",
        },

        items: [
            // Counted upwards, so that the codes read as an order rather than
            // as a set of labels. "Other" is 0: it is outside the ladder.
            {
                key: "Education",
                text: "What is your highest completed education level?",
                format: {
                    options: [
                        { value: 5, text: "University (doctorate)" },
                        { value: 4, text: "University (master)" },
                        { value: 3, text: "University (bachelor)" },
                        { value: 2, text: "High school / Secondary school (or 6th form college)" },
                        { value: 1, text: "Elementary school" },
                        { value: 0, text: "Other", small: true },
                    ],
                    columns: 1,
                    color: "#2f6f9f",
                },
            },
            {
                key: "EducationOther",
                text: "Your highest completed education level is...",
                showIf: { key: "Education", is: 0 },
                format: { input: "text", max: 60, placeholder: "Please specify", color: "#2f6f9f" },
            },

            // Only somebody who went to university has one to give.
            {
                key: "Discipline",
                text: "What is your discipline?",
                showIf: { key: "Education", is: [3, 4, 5] },
                format: {
                    options: [
                        { value: 1, text: "Arts and Humanities" },
                        { value: 2, text: "Media, Communication" },
                        { value: 3, text: "Literature, Languages" },
                        { value: 4, text: "History, Archaeology" },
                        { value: 5, text: "Sociology, Anthropology" },
                        { value: 6, text: "Political Science, Law" },
                        { value: 7, text: "Business, Economics" },
                        { value: 8, text: "Psychology, Neuroscience" },
                        { value: 9, text: "Medicine" },
                        { value: 10, text: "Biology, Chemistry" },
                        { value: 11, text: "Mathematics, Physics" },
                        { value: 12, text: "Engineering, Computer Science" },
                        { value: 0, text: "Other", small: true },
                    ],
                    columns: 2,
                    color: "#2f6f9f",
                },
            },
            {
                key: "DisciplineOther",
                text: "Your discipline is...",
                showIf: { key: "Discipline", is: 0 },
                format: { input: "text", max: 60, placeholder: "Please specify", color: "#2f6f9f" },
            },

            // Asked of the levels somebody may still be working through.
            {
                key: "Student",
                text: "Are you currently a student?",
                showIf: { key: "Education", is: [2, 3, 4] },
            },

            {
                key: "Ethnicity",
                text: "How would you describe your ethnicity?",
                format: {
                    options: [
                        { value: 1, text: "White" },
                        { value: 2, text: "Black" },
                        { value: 3, text: "Hispanic/Latino" },
                        { value: 4, text: "Middle Eastern/North African" },
                        { value: 5, text: "South Asian" },
                        { value: 6, text: "East Asian" },
                        { value: 7, text: "Southeast Asian" },
                        { value: 8, text: "Mixed" },
                        { value: 0, text: "Other", small: true },
                        // A way out of the question rather than an answer to it.
                        { value: -1, text: "Prefer not to say", small: true },
                    ],
                    // Ten of them stacked would run off the bottom of the
                    // window; the two set below the rest still span it.
                    columns: 2,
                    color: "#2f6f9f",
                },
            },
            {
                key: "EthnicityOther",
                text: "You would describe your ethnicity as...",
                showIf: { key: "Ethnicity", is: 0 },
                format: { input: "text", max: 60, placeholder: "Please specify", color: "#2f6f9f" },
            },

            // A button each for where most people taking this are, and the rest
            // of the world typed in: every country will not go on a screen, and
            // there is no dropdown here to put one in.
            {
                key: "Country",
                text: "In which country are you currently living?",
                format: {
                    options: [
                        { value: 1, text: "United Kingdom" },
                        { value: 2, text: "Ireland" },
                        { value: 3, text: "United States" },
                        { value: 4, text: "Australia" },
                        { value: 0, text: "Somewhere else", small: true },
                    ],
                    columns: 2,
                    color: "#2f6f9f",
                },
            },
            {
                key: "CountryOther",
                text: "You are currently living in...",
                showIf: { key: "Country", is: 0 },
                format: { input: "text", max: 60, placeholder: "e.g., France", color: "#2f6f9f" },
            },
        ],
    },

    // GJS ==================================================================
    // Global Job Satisfaction, the single-item version (Wanous et al., 1997).
    //
    // DISABLED. It is commented out rather than deleted, and is also out of
    // `RUN` in app.js: as it stands it puts the question to everybody, without
    // asking first whether there is a job to answer it about. Waking it takes
    // both — an employment item to hang a `showIf` on, this block uncommented,
    // and its name back in `RUN` — and note that an escape option cannot simply
    // be added instead, since whatever is chosen feeds a number into the score.

    // gjs: {
    //     name: "Work",
    //     instructions: "",
    //     level: 2,
    //     format: {
    //         options: [1, 2, 3, 4, 5, 6, 7],
    //         anchors: ["Very dissatisfied", "Very satisfied"],
    //         color: "#009688",
    //         hovercolors: ["#ef4444", "#22c55e"],
    //     },
    //
    //     // PLACEHOLDER NORMS — invented numbers, on the 1-7 scale of the item.
    //     norms: {
    //         "Job Satisfaction": {
    //             mean: 4.6,
    //             sd: 1.5,
    //             interpretations: {
    //                 low: "your work is not currently giving you much back, whatever else it is doing for you.",
    //                 mid: "your work suits you well enough, with parts of it you would change given the chance.",
    //                 high: "your work agrees with you, and you get a good deal out of the doing of it.",
    //             },
    //         },
    //     },
    //
    //     items: [
    //         {
    //             key: "GJS_JobSatisfaction",
    //             dimension: "Job Satisfaction",
    //             text: "Overall, how satisfied are you with your job?",
    //         },
    //     ],
    // },

    // MINT =================================================================
    // Multidimensional Interoceptive Traits questionnaire, read on three
    // dimensions: Awareness (what the body says about itself — excretion,
    // relaxation, arousal), Visceroception (the organs: breath, heart, gut)
    // and Clarity, which its items are written the wrong way round for and are
    // counted backwards into. Results.js draws these three as a body rather
    // than as a chart.

    mint: {
        name: "Interoception",
        instructions: "Answer the following question based on how accurately the statement describes you <b>in general</b>",
        level: 2,
        format: {
            options: [0, 1, 2, 3, 4, 5, 6],
            labels: formatMint === "symmetric7" ? ["-3", "-2", "-1", "0", "+1", "+2", "+3"] : null,
            anchors: ["Disagree", "Agree"],
            color: "#e0457b",
            hovercolors: ["#ef4444", "#22c55e"],
        },

        // PLACEHOLDER NORMS — invented numbers, on the 0-6 scale of the items,
        // and placeholder interpretations to go with them.
        norms: {
            "Bodily Awareness": {
                mean: 3.9,
                sd: 1.1,
                interpretations: {
                    low: "you tend to notice what your body is doing only after it's already happened, and its signals often catch you by surprise.",
                    mid: "you notice the clearer signals your body sends, but subtler ones tend to slip by, or you catch them only afterwards.",
                    high: "you tend to sense what your body is about to do before it happens, and rarely feel caught off guard by its state.",
                },
            },
            "Bodily Sensitivity": {
                mean: 3.3,
                sd: 1.2,
                interpretations: {
                    low: "your heart, breathing and stomach mostly go about their business without much of it reaching your attention, especially at rest.",
                    mid: "you notice your body's stronger signals, but subtler shifts in your heart, breathing or stomach tend to pass you by.",
                    high: "you notice even subtle shifts in your heart, breathing and stomach, including when your body is calm.",
                },
            },
            "Bodily Clarity": {
                mean: 3.4,
                sd: 1.1,
                interpretations: {
                    low: "your body's sensations often arrive without a clear cause: you can feel something happening without knowing what it means.",
                    mid: "you can usually make sense of what your body is telling you, though some sensations stay hard to place.",
                    high: "your body's signals tend to come through clearly, and you rarely feel unsure about what they mean.",
                },
            },
        },

        items: [
            // Written at the head of the MINT, and so read before the first of
            // its items whatever order the rest of them come in. The turn from
            // being asked about yourself to being asked about your body is a
            // sharp one, and some of what follows is blunt enough to want a
            // word of warning in front of it.
            {
                key: "SectionInteroception",
                section: true,
                text:
                    "<h2>Now, your body.</h2>" +
                    "<p>The questions that follow are about your body and the sensations that come from inside it — your " +
                    "breath, your heartbeat, your stomach, your skin. What you feel, how clearly you feel it, and how " +
                    "much of it reaches you at all.</p>" +
                    "<p>Some of them are blunt, and some will feel strange to be asked. People differ far more here than " +
                    "they imagine, and almost nobody has been asked before.</p>" +
                    "<p><em>Notice what is true of you, rather than what sounds right.</em></p>",
            },
            { key: "MINT_ExAc_1", dimension: "Bodily Awareness", text: "I can always accurately feel when I am about to fart" },
            { key: "MINT_ExAc_2", dimension: "Bodily Awareness", text: "I can always accurately feel when I am about to sneeze" },
            { key: "MINT_ExAc_3", dimension: "Bodily Awareness", text: "I can always accurately feel when I am about to burp" },
            { key: "MINT_RelA_4", dimension: "Bodily Awareness", text: "I always feel in my body if I am relaxed" },
            { key: "MINT_RelA_5", dimension: "Bodily Awareness", text: "I always know when I am relaxed" },
            {
                key: "MINT_RelA_6",
                dimension: "Bodily Awareness",
                text: "My body is always in the same specific state when I am relaxed",
            },
            {
                key: "MINT_SexS_7",
                dimension: "Bodily Awareness",
                text: "During sex or masturbation, I often feel very strong sensations coming from my genital areas",
            },
            { key: "MINT_SexS_8", dimension: "Bodily Awareness", text: "My genital organs are very sensitive to pleasant stimulations" },
            {
                key: "MINT_SexS_9",
                dimension: "Bodily Awareness",
                text: "When I am sexually aroused, I often notice specific sensations in my genital area (e.g., tingling, warmth, wetness, stiffness, pulsations)",
            },
            // Everything below is written as a *deficit* — noticing a signal
            // without knowing what it means, or not noticing until it is loud.
            // The dimension they feed reads the other way round, so every one
            // of them is counted backwards.
            {
                key: "MINT_CaCo_10",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "Sometimes my breathing becomes erratic or shallow and I often don't know why",
            },
            {
                key: "MINT_CaCo_11",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "I often feel like I can't get enough oxygen by breathing normally",
            },
            {
                key: "MINT_CaCo_12",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "Sometimes my heart starts racing and I often don't know why",
            },
            {
                key: "MINT_Urin_13",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "I sometimes feel like I need to urinate or defecate but when I go to the bathroom I produce less than I expected",
            },
            {
                key: "MINT_Urin_14",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "I often feel the need to urinate even when my bladder is not full",
            },
            {
                key: "MINT_Urin_15",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "Sometimes I am not sure whether I need to go to the toilet or not (to urinate or defecate)",
            },
            { key: "MINT_Derm_16", dimension: "Bodily Clarity", reverse: true, text: "In general, my skin is very sensitive" },
            {
                key: "MINT_Derm_17",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "My skin is susceptible to itchy fabrics and materials",
            },
            {
                key: "MINT_Derm_18",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "I can notice even very subtle stimulations to my skin (e.g., very light touches)",
            },
            {
                key: "MINT_Sati_19",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "I don't always feel the need to eat until I am really hungry",
            },
            {
                key: "MINT_Sati_20",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "Sometimes I don't realise I was hungry until I ate something",
            },
            {
                key: "MINT_Sati_21",
                dimension: "Bodily Clarity",
                reverse: true,
                text: "I don't always feel the need to drink until I am really thirsty",
            },
            { key: "MINT_Olfa_22", dimension: "Bodily Clarity", reverse: true, text: "I often check the smell of my armpits" },
            { key: "MINT_Olfa_23", dimension: "Bodily Clarity", reverse: true, text: "I often check the smell of my own breath" },
            { key: "MINT_Olfa_24", dimension: "Bodily Clarity", reverse: true, text: "I often check the smell of my farts" },
            {
                key: "MINT_Resp_25",
                dimension: "Bodily Sensitivity",
                text: "In general, I am very sensitive to changes in my breathing",
            },
            { key: "MINT_Resp_26", dimension: "Bodily Sensitivity", text: "I can notice even very subtle changes in my breathing" },
            {
                key: "MINT_Resp_27",
                dimension: "Bodily Sensitivity",
                text: "I am always very aware of how I am breathing, even when I am calm",
            },
            {
                key: "MINT_Card_28",
                dimension: "Bodily Sensitivity",
                text: "In general, I am very sensitive to changes in my heart rate",
            },
            { key: "MINT_Card_29", dimension: "Bodily Sensitivity", text: "I often notice changes in my heart rate" },
            {
                key: "MINT_Card_30",
                dimension: "Bodily Sensitivity",
                text: "I can notice even very subtle changes in the way my heart beats",
            },
            {
                key: "MINT_Gast_31",
                dimension: "Bodily Sensitivity",
                text: "I can notice even very subtle changes in what my stomach is doing",
            },
            {
                key: "MINT_Gast_32",
                dimension: "Bodily Sensitivity",
                text: "In general, I am very sensitive to what my stomach is doing",
            },
            {
                key: "MINT_Gast_33",
                dimension: "Bodily Sensitivity",
                text: "I am always very aware of what my stomach is doing, even when I am calm",
            },
            // The extreme left of this scale is 0, which is what passing it is.
            {
                key: "MINT_AttentionCheck",
                check: 0,
                text: "I can always accurately answer to the extreme left on this question to show that I am reading it",
            },
        ],
    },
})
