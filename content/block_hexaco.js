defineBlock("hexaco", [
    {
        type: "briefing",
        key: "Briefing_Traits",
        text:
            "<h2>Now, who you are — closer up.</h2>" +
            "<p>The first level sketched your personality in five strokes. This one goes over the same ground from " +
            "more angles, in twenty-eight short statements about how you tend to act, and adds the trait the classic " +
            "five leave out — <b>honesty and humility</b>: how far you can be bought, flattered or impressed by " +
            "status. All six come back to you as one chart at the end of the level.</p>" +
            "<p>The statements are quick and plain. Go with the first answer that fits.</p>" +
            "<p><em>Rate how well each one describes you as you generally are, not on your best day or your worst.</em></p>",
    },

    // Mini-IPIP6 ===========================================================
    // The Mini-IPIP6 (Sibley et al., 2011): the 20-item Mini-IPIP (Donnellan
    // et al., 2006) — four items per Big Five domain — with four
    // Honesty-Humility items added, making a Big Six. Rated for accuracy on
    // a 7-point scale; half of the Big Five items and all four
    // Honesty-Humility items are reverse-keyed. The items are published as
    // fragments under an "I…" stem ("Am the life of the party") and are
    // written out as full sentences here, which is how they are normally put
    // on screen.
    //
    // The dimensions carry "(IPIP)" because a dimension is one name across
    // the whole run: an unmarked "Extraversion" here would be averaged in
    // with the FIPI's on level 1, on a scale it does not share.
    //
    // COMMENTED OUT (September 2026): asked once alongside the HEX-ACO-18,
    // then dropped in favour of it. Five of its six scales re-measure the
    // FIPI's Big Five, and its items sit on the maladaptive poles the HiTOP-BR
    // below already asks about, sometimes almost word for word. The HEXACO
    // covers more ground that nothing else on the run does. Kept here whole so
    // it can be put back by uncommenting; it would want its name back in
    // CHARTS in app.js and on the Includes list.

    // {
    //     key: "ipip6",
    //     name: "Big Six",
    //     instructions: "How accurately does this statement describe you?",
    //     // Kept off the whole-run profile web: the Big Five already stand for
    //     // personality there, and twelve more axes would drown the rest. The
    //     // chart on this level is where these are read.
    //     profile: false,
    //     format: {
    //         options: [1, 2, 3, 4, 5, 6, 7],
    //         anchors: ["Very inaccurate", "Very accurate"],
    //         color: "#1d4ed8",
    //     },
    //
    //     // PLACEHOLDER norms, invented. Not from any published sample.
    //     norms: {
    //         "Extraversion (IPIP)": {
    //             mean: 4.0,
    //             sd: 1.3,
    //             interpretations: {
    //                 low: "you keep to the background and let others carry the conversation, and are content that way.",
    //                 mid: "you can hold a room or hold back, depending on the room.",
    //                 high: "you come alive in company: you talk readily, to many people, and are often the centre of it.",
    //             },
    //         },
    //         "Agreeableness (IPIP)": {
    //             mean: 5.3,
    //             sd: 1.0,
    //             interpretations: {
    //                 low: "other people's feelings and troubles are not what your attention goes to first.",
    //                 mid: "you take an interest in how others are doing, without it running your day.",
    //                 high: "you feel what other people feel, almost as they feel it, and their troubles quickly become yours to help with.",
    //             },
    //         },
    //         "Conscientiousness (IPIP)": {
    //             mean: 4.9,
    //             sd: 1.1,
    //             interpretations: {
    //                 low: "order is not a priority: things get done eventually, and left where they land.",
    //                 mid: "you keep enough order to find what you need, and let the rest slide.",
    //                 high: "you like things in their place and get chores out of the way at once.",
    //             },
    //         },
    //         "Neuroticism (IPIP)": {
    //             mean: 3.6,
    //             sd: 1.2,
    //             interpretations: {
    //                 low: "you are relaxed most of the time, and your mood stays level through most of what happens.",
    //                 mid: "your mood moves about as much as most people's, and settles again.",
    //                 high: "your mood swings readily and you are upset more easily than most people are.",
    //             },
    //         },
    //         "Intellect (IPIP)": {
    //             mean: 5.0,
    //             sd: 1.0,
    //             interpretations: {
    //                 low: "abstract ideas leave you cold, and imagination for its own sake holds little appeal.",
    //                 mid: "you enjoy an idea or a flight of fancy now and then, without living in them.",
    //                 high: "you have a vivid imagination and take to abstract ideas with pleasure.",
    //             },
    //         },
    //         "Honesty-Humility (IPIP)": {
    //             mean: 4.9,
    //             sd: 1.2,
    //             interpretations: {
    //                 low: "you feel you deserve more than you get, and would enjoy the luxury and the look of having it.",
    //                 mid: "you would not mind the expensive car, but you do not feel owed one.",
    //                 high: "luxury and entitlement hold little pull for you: you do not feel you deserve more than others.",
    //             },
    //         },
    //     },
    //
    //     items: [
    //         { key: "IPIP6_Extraversion_1", dimension: "Extraversion (IPIP)", text: "I am the life of the party." },
    //         { key: "IPIP6_Extraversion_2", dimension: "Extraversion (IPIP)", text: "I don't talk a lot.", reverse: true },
    //         { key: "IPIP6_Extraversion_3", dimension: "Extraversion (IPIP)", text: "I keep in the background.", reverse: true },
    //         { key: "IPIP6_Extraversion_4", dimension: "Extraversion (IPIP)", text: "I talk to a lot of different people at parties." },
    //
    //         { key: "IPIP6_Agreeableness_1", dimension: "Agreeableness (IPIP)", text: "I sympathize with others' feelings." },
    //         { key: "IPIP6_Agreeableness_2", dimension: "Agreeableness (IPIP)", text: "I am not interested in other people's problems.", reverse: true },
    //         { key: "IPIP6_Agreeableness_3", dimension: "Agreeableness (IPIP)", text: "I feel others' emotions." },
    //         { key: "IPIP6_Agreeableness_4", dimension: "Agreeableness (IPIP)", text: "I am not really interested in others.", reverse: true },
    //
    //         { key: "IPIP6_Conscientiousness_1", dimension: "Conscientiousness (IPIP)", text: "I get chores done right away." },
    //         { key: "IPIP6_Conscientiousness_2", dimension: "Conscientiousness (IPIP)", text: "I like order." },
    //         { key: "IPIP6_Conscientiousness_3", dimension: "Conscientiousness (IPIP)", text: "I make a mess of things.", reverse: true },
    //         {
    //             key: "IPIP6_Conscientiousness_4",
    //             dimension: "Conscientiousness (IPIP)",
    //             text: "I often forget to put things back in their proper place.",
    //             reverse: true,
    //         },
    //
    //         { key: "IPIP6_Neuroticism_1", dimension: "Neuroticism (IPIP)", text: "I have frequent mood swings." },
    //         { key: "IPIP6_Neuroticism_2", dimension: "Neuroticism (IPIP)", text: "I am relaxed most of the time.", reverse: true },
    //         { key: "IPIP6_Neuroticism_3", dimension: "Neuroticism (IPIP)", text: "I get upset easily." },
    //         { key: "IPIP6_Neuroticism_4", dimension: "Neuroticism (IPIP)", text: "I seldom feel blue.", reverse: true },
    //
    //         { key: "IPIP6_Intellect_1", dimension: "Intellect (IPIP)", text: "I have a vivid imagination." },
    //         { key: "IPIP6_Intellect_2", dimension: "Intellect (IPIP)", text: "I have difficulty understanding abstract ideas.", reverse: true },
    //         { key: "IPIP6_Intellect_3", dimension: "Intellect (IPIP)", text: "I do not have a good imagination.", reverse: true },
    //         { key: "IPIP6_Intellect_4", dimension: "Intellect (IPIP)", text: "I am not interested in abstract ideas.", reverse: true },
    //
    //         // All four are keyed towards the low pole: agreeing is the less
    //         // humble answer, so every one counts backwards.
    //         { key: "IPIP6_HonestyHumility_1", dimension: "Honesty-Humility (IPIP)", text: "I feel entitled to more of everything.", reverse: true },
    //         { key: "IPIP6_HonestyHumility_2", dimension: "Honesty-Humility (IPIP)", text: "I deserve more things in life.", reverse: true },
    //         {
    //             key: "IPIP6_HonestyHumility_3",
    //             dimension: "Honesty-Humility (IPIP)",
    //             text: "I would like to be seen driving around in a very expensive car.",
    //             reverse: true,
    //         },
    //         {
    //             key: "IPIP6_HonestyHumility_4",
    //             dimension: "Honesty-Humility (IPIP)",
    //             text: "I would get a lot of pleasure from owning expensive luxury goods.",
    //             reverse: true,
    //         },
    //     ],
    // },

    // HEX-ACO-18 ===========================================================
    // The HEX-ACO-18 (Olaru & Jankowsky, 2022, J. Pers. Assess., Table 1): an
    // 18-item HEXACO short scale — three items per domain, each from a
    // different facet — selected out of the HEXACO-100 by ant colony
    // optimisation for model fit and measurement invariance across age.
    // Agreement on the HEXACO's own 5-point scale; eleven of the eighteen
    // are reverse-keyed. Item keys name the facet, and the comment beside
    // each item gives its HEXACO-100 number.
    //
    // THE DOMAINS CARRY PLAIN NAMES (September 2026), for two reasons at once.
    // A dimension is one name across the whole run, and Extraversion,
    // Agreeableness, Conscientiousness and Openness are already the FIPI's
    // names on level 1, on a scale this does not share — so the four that
    // collide used to carry a "(HEXACO)" tag, which on a chart for the public
    // read as jargon. And the HEXACO's versions are not the Big Five's
    // constructs anyway: its Agreeableness is patience, forgiveness and
    // gentleness, its Openness is curiosity, aesthetics and unconventionality,
    // its Emotionality is fear, worry and dependence rather than the reverse
    // of calm. So the six are named for what the items actually ask:
    //
    //     Honesty-Humility   (as published)
    //     Emotionality       (as published — nothing on the FIPI to collide with)
    //     Sociability        for eXtraversion
    //     Patience           for Agreeableness
    //     Diligence          for Conscientiousness
    //     Curiosity          for Openness to Experience
    //
    // The item keys still name the HEXACO facet, so the mapping back is exact.

    {
        key: "hexaco18",
        name: "Character",
        instructions: "Please indicate how much you agree or disagree with this statement",
        format: {
            options: [
                { value: 1, text: "Strongly disagree" },
                { value: 2, text: "Disagree" },
                { value: 3, text: "Neutral" },
                { value: 4, text: "Agree" },
                { value: 5, text: "Strongly agree" },
            ],
            color: "#c026d3",
        },

        // THE FULL PORTRAIT IS FED BACK HERE (September 2026): all six domains,
        // as a spider chart with a row apiece, and all six take axes on the
        // whole-run web. The FIPI on level 1 is the two-row sketch — Extraversion
        // and Emotional Stability — that this fills in; its other three norms
        // are commented out there rather than here.
        // PLACEHOLDER norms, invented. Not from any published sample.
        norms: {
            "Honesty-Humility": {
                mean: 3.6,
                sd: 0.7,
                interpretations: {
                    low: "you are comfortable using charm, status and the trappings of success to get where you are going.",
                    mid: "you neither chase status nor refuse it, and will flatter a little when it serves.",
                    high: "you deal straight, want no fuss made of your standing, and are hard to impress with money.",
                },
            },
            "Emotionality": {
                mean: 3.2,
                sd: 0.7,
                interpretations: {
                    low: "you keep your head in an emergency, worry little, and would rather cope alone than lean on anybody.",
                    mid: "you worry and want comfort about as much as most people do, and steady yourself when it counts.",
                    high: "you feel fear and worry keenly, and when something hurts you want somebody there.",
                },
            },
            "Sociability": {
                mean: 3.3,
                sd: 0.7,
                interpretations: {
                    low: "you doubt your standing with others, keep your opinions to yourself in a group, and run at a quieter pace than most.",
                    mid: "you speak up when it matters and feel reasonably well liked, without being the liveliest in the room.",
                    high: "you feel liked, say what you think in a meeting, and carry more energy than most of the people around you.",
                },
            },
            "Patience": {
                mean: 3.1,
                sd: 0.6,
                interpretations: {
                    low: "you hold a grudge, notice people's faults, and are quick to anger when insulted.",
                    mid: "you let some things go and not others, much as most people do.",
                    high: "you forgive readily, take people's faults in your stride, and keep your temper when provoked.",
                },
            },
            "Diligence": {
                mean: 3.5,
                sd: 0.7,
                interpretations: {
                    low: "goals get abandoned, decisions get made on the spot, and disorder gets in the way of your work.",
                    mid: "you finish most of what you start, and think before acting more often than not.",
                    high: "you see goals through, think before you act, and keep your work in order.",
                },
            },
            "Curiosity": {
                mean: 3.5,
                sd: 0.7,
                interpretations: {
                    low: "radical ideas, concerts and making art are not where your interest lies.",
                    mid: "you enjoy the arts and the odd unconventional idea, in moderation.",
                    high: "you are drawn to new and radical ideas, to art, and to making something of your own.",
                },
            },
        },

        items: [
            // Honesty-Humility
            {
                key: "HEXACO_Sincerity", // 78
                dimension: "Honesty-Humility",
                text: "I wouldn't pretend to like someone just to get that person to do favors for me.",
            },
            {
                key: "HEXACO_GreedAvoidance", // 66 R
                dimension: "Honesty-Humility",
                text: "I would like to be seen driving around in a very expensive car.",
                reverse: true,
            },
            {
                key: "HEXACO_Modesty", // 96 R
                dimension: "Honesty-Humility",
                text: "I want people to know that I am an important person of high status.",
                reverse: true,
            },

            // Emotionality
            {
                key: "HEXACO_Fearfulness", // 77 R
                dimension: "Emotionality",
                text: "Even in an emergency I wouldn't feel like panicking.",
                reverse: true,
            },
            {
                key: "HEXACO_Dependence", // 17
                dimension: "Emotionality",
                text: "When I suffer from a painful experience, I need someone to make me feel comfortable.",
            },
            {
                key: "HEXACO_Anxiety", // 11
                dimension: "Emotionality",
                text: "I sometimes can't help worrying about little things.",
            },

            // Extraversion — all three keyed towards the low pole
            {
                key: "HEXACO_SocialSelfEsteem", // 52 R
                dimension: "Sociability",
                text: "I feel that I am an unpopular person.",
                reverse: true,
            },
            {
                key: "HEXACO_SocialBoldness", // 10 R
                dimension: "Sociability",
                text: "I rarely express my opinions in group meetings.",
                reverse: true,
            },
            {
                key: "HEXACO_Liveliness", // 94 R
                dimension: "Sociability",
                text: "Most people are more upbeat and dynamic than I generally am.",
                reverse: true,
            },

            // Agreeableness
            {
                key: "HEXACO_Forgiveness", // 3
                dimension: "Patience",
                text: "I rarely hold a grudge, even against people who have badly wronged me.",
            },
            {
                key: "HEXACO_Gentleness", // 33
                dimension: "Patience",
                text: "I generally accept people's faults without complaining about them.",
            },
            {
                key: "HEXACO_Patience", // 93 R
                dimension: "Patience",
                text: "I find it hard to keep my temper when people insult me.",
                reverse: true,
            },

            // Conscientiousness — all three keyed towards the low pole
            {
                key: "HEXACO_Diligence", // 56 R
                dimension: "Diligence",
                text: "Often when I set a goal, I end up quitting without having reached it.",
                reverse: true,
            },
            {
                key: "HEXACO_Prudence", // 44 R
                dimension: "Diligence",
                text: "I make a lot of mistakes because I don't think before I act.",
                reverse: true,
            },
            {
                key: "HEXACO_Organization", // 74 R
                dimension: "Diligence",
                text: "When working, I sometimes have difficulties due to being disorganized.",
                reverse: true,
            },

            // Openness to Experience
            {
                key: "HEXACO_Unconventionality", // 19 R
                dimension: "Curiosity",
                text: "I think that paying attention to radical ideas is a waste of time.",
                reverse: true,
            },
            {
                key: "HEXACO_AestheticAppreciation", // 49
                dimension: "Curiosity",
                text: "If I had the opportunity, I would like to attend a classical music concert.",
            },
            {
                key: "HEXACO_Creativity", // 37
                dimension: "Curiosity",
                text: "I would enjoy creating a work of art, such as a novel, a song, or a painting.",
            },

            // KSE-G ------------------------------------------------------
            // The Social Desirability-Gamma Short Scale (Kemper, Beierlein,
            // Bensch, Kovaleva & Rammstedt, 2014): six items isolating the
            // Gamma factor of socially desirable responding — conscious
            // impression management, after Paulhus — as two facets of three,
            // exaggerating positive qualities (PQ+) and minimising negative
            // ones (NQ−). Dealt in among the HEXACO items on purpose: they
            // are "I…" statements of the same length and register, and a
            // questionnaire is the unit of shuffling, so being items of this
            // one is what puts them in among its items rather than in a
            // block of their own that would announce what it was. The
            // KSE-G's own 5-point scale runs "doesn't apply at all" to
            // "applies completely"; here they take the HEXACO's 5-point
            // agreement scale, which is the price of blending in.
            //
            // Scored as two dimensions so the facets can be read apart at
            // analysis time (the KSE-G total is their mean). The NQ− items
            // are reverse-keyed, so on both a higher score is a more
            // flattering self-presentation. NO NORMS, on purpose: this is
            // measured about the participant, not for them, and is fed back
            // nowhere — a social-desirability score handed back would only
            // teach the next answer.
            {
                key: "KSEG_PQ_1",
                dimension: "Social Desirability (PQ+)",
                text: "In an argument, I always remain objective and stick to the facts.",
            },
            {
                key: "KSEG_PQ_2",
                dimension: "Social Desirability (PQ+)",
                text: "Even if I am feeling stressed, I am always friendly and polite to others.",
            },
            {
                key: "KSEG_PQ_3",
                dimension: "Social Desirability (PQ+)",
                text: "When talking to someone, I always listen carefully to what the other person says.",
            },
            {
                key: "KSEG_NQ_1",
                dimension: "Social Desirability (NQ−)",
                text: "It has happened that I have taken advantage of someone in the past.",
                reverse: true,
            },
            {
                key: "KSEG_NQ_2",
                dimension: "Social Desirability (NQ−)",
                text: "I have occasionally thrown litter away in the countryside or on to the road.",
                reverse: true,
            },
            {
                key: "KSEG_NQ_3",
                dimension: "Social Desirability (NQ−)",
                text: "Sometimes I only help people if I expect to get something in return.",
                reverse: true,
            },

            // BSDS -------------------------------------------------------
            // The Brief Social Desirability Scale (Haghighat, 2007): four
            // yes/no questions written to catch defensiveness and impression
            // management at almost no cost in time, here turned into "I…"
            // statements on the HEXACO's agreement scale so they could be dealt
            // in beside the KSE-G. COMMENTED OUT (September 2026): its fourth
            // item is the KSE-G's first NQ− item almost word for word, and the
            // KSE-G alone covers the ground; consistency indices come from
            // elsewhere (the reversed HEXACO and MINT items). Kept so it can be
            // put back by uncommenting.
            // {
            //     key: "BSDS_1",
            //     dimension: "Social Desirability (BSDS)",
            //     text: "I always practise what I preach.",
            // },
            // {
            //     key: "BSDS_2",
            //     dimension: "Social Desirability (BSDS)",
            //     text: "I am always willing to admit it when I make a mistake.",
            // },
            // {
            //     key: "BSDS_3",
            //     dimension: "Social Desirability (BSDS)",
            //     text: "I sometimes feel a little bit jealous of the good luck of others.",
            //     reverse: true,
            // },
            // {
            //     key: "BSDS_4",
            //     dimension: "Social Desirability (BSDS)",
            //     text: "I have taken advantage of someone at some point.",
            //     reverse: true,
            // },

            // The attention check, dealt in among the rest like the KSE-G. It
            // asks for the bottom of the scale, 1, since somebody agreeing
            // their way down a personality questionnaire would pass one
            // written for the top.
            {
                key: "HEXACO_AttentionCheck",
                check: 1,
                text: "To show that I am reading these statements, I will answer \"Strongly disagree\" to this one.",
            },
        ],
    },
])
