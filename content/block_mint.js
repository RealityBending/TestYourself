// Note: The MINT has 2 versions, being picked randomly (experimental manipulation.
// It differs on the scale format.
const formatMint = Math.random() < 0.5 ? "sequential7" : "symmetric7"

defineBlock("mint", [
    {
        type: "briefing",
        key: "Briefing_Interoception",
        text:
            "<h2>Now, your body.</h2>" +
            "<p>The questions that follow are about your body and the sensations that come from inside it: your " +
            "breath, your heartbeat, your stomach, your genitals, your skin. What you feel, how clearly you feel it, and how " +
            "much of it matters to you.</p>" +
            "<p>Some of them are blunt, and some will feel strange to be asked. But they might reveal something about you.</p>" +
            "<p><em>Notice what is true of you, rather than what sounds right.</em></p>",
    },

    // MINT =================================================================
    // Multidimensional Interoceptive Traits questionnaire.
    // Results.js draws these three as a body rather than as a chart.

    {
        key: "mint",
        name: "Interoception",
        instructions: "Answer the following question based on how accurately the statement describes you <b>in general</b>",
        format: {
            options: [0, 1, 2, 3, 4, 5, 6],
            labels: formatMint === "symmetric7" ? ["-3", "-2", "-1", "0", "+1", "+2", "+3"] : null,
            anchors: ["Disagree", "Agree"],
            color: "#e0457b",
            hovercolors: ["#ef4444", "#22c55e"],
        },

        // PLACEHOLDER norms, invented. Not from any published sample.
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
])
