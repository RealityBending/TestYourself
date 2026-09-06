// Note: The MINT has 2 versions, being picked randomly (experimental manipulation.
// It differs on the scale format.
const formatMint = Math.random() < 0.5 ? "sequential7" : "symmetric7"

defineBlock("mint", [
    {
        type: "briefing",
        key: "Briefing_Interoception",
        text:
            "<h2>Now, let's talk about your body.</h2>" +
            "<p>The next questions are about your body and what you feel going on inside it: your breathing, your " +
            "heartbeat, your stomach, your genitals, your skin. What you notice, how clearly you notice it, and how " +
            "easily you can tell what it means.</p>" +
            "<p>Some of these are blunt, and a few may feel odd to be asked, but they are all important: how people sense " +
            "their own body can say a lot about them.</p>" +
            "<p><em>Think of what is actually true of you, not with what sounds right.</em></p>",
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

        // NOT placeholders: the means and SDs of 1,683 people who have already
        // answered these 33 items, pooled from the four studies that have asked
        // them — InteroceptionScale studies 1 and 2, FakeArt and FakeChat — and
        // scored exactly the way the app scores them, each dimension the mean of
        // its facets with Clarity turned over. `norms/make_norms.R` is what works
        // them out and prints them in this shape; re-run it rather than retyping
        // these, and read the mapping table in it before touching study 1, whose
        // columns are named for a pilot's constructs rather than for these items.
        //
        // They are a pooled convenience sample of online studies and not a norming
        // sample of anybody in particular: the four samples agree closely on
        // Awareness and Sensitivity and less so on Clarity (3.07, 3.10, 3.51,
        // 3.13), and the SDs carry the spread between studies as well as within
        // them. Real numbers from real people, and still not a population.
        norms: {
            "Bodily Awareness": {
                mean: 4.23,
                sd: 0.87,
                interpretations: {
                    low: "You may not pay much attention to what your body is doing in the moment. Physical changes can sometimes go unnoticed until they become obvious or have already passed. For example, you might only realise that you were tense, relaxed, hungry, or needed the toilet once the feeling becomes hard to ignore.",
                    mid: "You tend to notice the clearer signals your body sends, while subtler sensations can sometimes pass you by. For example, you may easily notice that you are very hungry or relaxed, but be less aware of the small changes that happen before you get to that point.",
                    high: "You tend to be very aware of what is happening in your body, and often notice physical sensations as they arise. For example, you may pick up quickly on small changes in your level of relaxation, hunger, bodily sensations, or sexual arousal.",
                },
            },
            "Bodily Sensitivity": {
                mean: 3.12,
                sd: 1.28,
                interpretations: {
                    low: "Your body's small fluctuations often stay in the background unless they become stronger. You might not notice a small change in your breathing or heartbeat, for example, until it becomes quite pronounced.",
                    mid: "You notice many of the changes happening in your body, especially when they are noticeable, but the smallest shifts can sometimes escape your attention. You might notice that your heart is beating faster after climbing stairs, for instance, without necessarily noticing smaller changes while sitting quietly.",
                    high: "You tend to be highly tuned in to subtle changes in your body. Small shifts in your breathing, heartbeat, or stomach can stand out to you, even when you are sitting quietly or otherwise feel calm.",
                },
            },
            "Bodily Clarity": {
                mean: 3.17,
                sd: 0.91,
                interpretations: {
                    low: 'Your body\'s signals can sometimes be difficult to read or make sense of. You might notice that something feels different without being sure whether you are hungry, thirsty, tense, tired, need the toilet, or simply feeling "off".',
                    mid: "You can usually make sense of what your body is telling you, although some sensations can still be difficult to interpret. Most of the time you can tell what you need physically, but occasionally your body's signals may leave you unsure.",
                    high: "Your body's signals tend to feel clear and easy to interpret. You usually have a good sense of what you are feeling physically and what your body needs. For example, recognising when you are hungry, thirsty, tense, tired, or need to use the toilet.",
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
