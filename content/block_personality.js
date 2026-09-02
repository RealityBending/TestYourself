defineBlock("personality", [
    {
        type: "briefing",
        key: "Briefing_Traits",
        text:
            "<h2>Now, who you are — closer up.</h2>" +
            "<p>The first level sketched your personality in five strokes. The next stretch draws it properly: eighteen " +
            "statements going over the same ground from more angles, and adding a sixth trait the classic five " +
            "leave out — <b>honesty and humility</b>: how far you can be bought, flattered or impressed by status.</p>" +
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
    // "(HEXACO)" on every dimension because a dimension is one name across
    // the whole run: Extraversion, Agreeableness, Conscientiousness and
    // Openness are already the FIPI's names on level 1, on a scale this does
    // not share, and the HEXACO's versions are not the same constructs — its
    // Agreeableness holds patience and forgiveness, its Emotionality is not
    // Neuroticism.

    {
        key: "hexaco18",
        name: "HEXACO",
        instructions: "Please indicate how much you agree or disagree with this statement",
        // Kept off the whole-run profile web: the Big Five already stand for
        // personality there, and six more axes would crowd the rest. The chart
        // on this level is where these are read.
        profile: false,
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

        // PLACEHOLDER norms, invented. Not from any published sample.
        norms: {
            "Honesty-Humility (HEXACO)": {
                mean: 3.6,
                sd: 0.7,
                interpretations: {
                    low: "you are comfortable using charm, status and the trappings of success to get where you are going.",
                    mid: "you neither chase status nor refuse it, and will flatter a little when it serves.",
                    high: "you deal straight, want no fuss made of your standing, and are hard to impress with money.",
                },
            },
            "Emotionality (HEXACO)": {
                mean: 3.2,
                sd: 0.7,
                interpretations: {
                    low: "you keep your head in an emergency, worry little, and would rather cope alone than lean on anybody.",
                    mid: "you worry and want comfort about as much as most people do, and steady yourself when it counts.",
                    high: "you feel fear and worry keenly, and when something hurts you want somebody there.",
                },
            },
            "Extraversion (HEXACO)": {
                mean: 3.3,
                sd: 0.7,
                interpretations: {
                    low: "you doubt your standing with others, keep your opinions to yourself in a group, and run at a quieter pace than most.",
                    mid: "you speak up when it matters and feel reasonably well liked, without being the liveliest in the room.",
                    high: "you feel liked, say what you think in a meeting, and carry more energy than most of the people around you.",
                },
            },
            "Agreeableness (HEXACO)": {
                mean: 3.1,
                sd: 0.6,
                interpretations: {
                    low: "you hold a grudge, notice people's faults, and are quick to anger when insulted.",
                    mid: "you let some things go and not others, much as most people do.",
                    high: "you forgive readily, take people's faults in your stride, and keep your temper when provoked.",
                },
            },
            "Conscientiousness (HEXACO)": {
                mean: 3.5,
                sd: 0.7,
                interpretations: {
                    low: "goals get abandoned, decisions get made on the spot, and disorder gets in the way of your work.",
                    mid: "you finish most of what you start, and think before acting more often than not.",
                    high: "you see goals through, think before you act, and keep your work in order.",
                },
            },
            "Openness (HEXACO)": {
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
                dimension: "Honesty-Humility (HEXACO)",
                text: "I wouldn't pretend to like someone just to get that person to do favors for me.",
            },
            {
                key: "HEXACO_GreedAvoidance", // 66 R
                dimension: "Honesty-Humility (HEXACO)",
                text: "I would like to be seen driving around in a very expensive car.",
                reverse: true,
            },
            {
                key: "HEXACO_Modesty", // 96 R
                dimension: "Honesty-Humility (HEXACO)",
                text: "I want people to know that I am an important person of high status.",
                reverse: true,
            },

            // Emotionality
            {
                key: "HEXACO_Fearfulness", // 77 R
                dimension: "Emotionality (HEXACO)",
                text: "Even in an emergency I wouldn't feel like panicking.",
                reverse: true,
            },
            {
                key: "HEXACO_Dependence", // 17
                dimension: "Emotionality (HEXACO)",
                text: "When I suffer from a painful experience, I need someone to make me feel comfortable.",
            },
            {
                key: "HEXACO_Anxiety", // 11
                dimension: "Emotionality (HEXACO)",
                text: "I sometimes can't help worrying about little things.",
            },

            // Extraversion — all three keyed towards the low pole
            {
                key: "HEXACO_SocialSelfEsteem", // 52 R
                dimension: "Extraversion (HEXACO)",
                text: "I feel that I am an unpopular person.",
                reverse: true,
            },
            {
                key: "HEXACO_SocialBoldness", // 10 R
                dimension: "Extraversion (HEXACO)",
                text: "I rarely express my opinions in group meetings.",
                reverse: true,
            },
            {
                key: "HEXACO_Liveliness", // 94 R
                dimension: "Extraversion (HEXACO)",
                text: "Most people are more upbeat and dynamic than I generally am.",
                reverse: true,
            },

            // Agreeableness
            {
                key: "HEXACO_Forgiveness", // 3
                dimension: "Agreeableness (HEXACO)",
                text: "I rarely hold a grudge, even against people who have badly wronged me.",
            },
            {
                key: "HEXACO_Gentleness", // 33
                dimension: "Agreeableness (HEXACO)",
                text: "I generally accept people's faults without complaining about them.",
            },
            {
                key: "HEXACO_Patience", // 93 R
                dimension: "Agreeableness (HEXACO)",
                text: "I find it hard to keep my temper when people insult me.",
                reverse: true,
            },

            // Conscientiousness — all three keyed towards the low pole
            {
                key: "HEXACO_Diligence", // 56 R
                dimension: "Conscientiousness (HEXACO)",
                text: "Often when I set a goal, I end up quitting without having reached it.",
                reverse: true,
            },
            {
                key: "HEXACO_Prudence", // 44 R
                dimension: "Conscientiousness (HEXACO)",
                text: "I make a lot of mistakes because I don't think before I act.",
                reverse: true,
            },
            {
                key: "HEXACO_Organization", // 74 R
                dimension: "Conscientiousness (HEXACO)",
                text: "When working, I sometimes have difficulties due to being disorganized.",
                reverse: true,
            },

            // Openness to Experience
            {
                key: "HEXACO_Unconventionality", // 19 R
                dimension: "Openness (HEXACO)",
                text: "I think that paying attention to radical ideas is a waste of time.",
                reverse: true,
            },
            {
                key: "HEXACO_AestheticAppreciation", // 49
                dimension: "Openness (HEXACO)",
                text: "If I had the opportunity, I would like to attend a classical music concert.",
            },
            {
                key: "HEXACO_Creativity", // 37
                dimension: "Openness (HEXACO)",
                text: "I would enjoy creating a work of art, such as a novel, a song, or a painting.",
            },
        ],
    },

    {
        type: "briefing",
        key: "Briefing_Spectra",
        text:
            "<h2>Now, the last year.</h2>" +
            "<p>Back to the calendar. The last stretch asked how you generally are; the next widens the frame from the " +
            "few weeks of the previous level to the <b>last twelve months</b>, and asks about the kind of experiences " +
            "psychology has spent a century sorting into categories — and lately into spectra, which is how they are " +
            "asked here: not whether you have something, but how much of each of several things has been true of " +
            "you.</p>" +
            "<p>Some statements will describe you well and some not at all. Every one of them describes somebody, " +
            "and most describe more people than admit to it.</p>" +
            "<p><em>Think of the significant times in the last twelve months when a statement applied to you, and say " +
            "how well it described you then.</em></p>",
    },

    // HiTOP-BR =============================================================
    // The Brief Report form of the Hierarchical Taxonomy of Psychopathology
    // self-report (Simms et al., 2026, "Assessment of the HiTOP Model:
    // Introducing the HiTOP-SR and HiTOP-BR", under review at Assessment), as
    // shipped in the {hitop} R package (github.com/jmgirard/hitop,
    // data-raw/hitopbr_items.csv): 45 statements about the last twelve months
    // on a 4-point scale, no reversed items, scored as the mean of each of six
    // spectra. Item keys follow the package's own item numbers, HBR_01 to
    // HBR_45, so a saved file can be handed straight to score_hitopbr() with
    // the items in instrument order; their membership below is the package's
    // (which corrected item 36 to Internalizing after the development
    // workbook). Two more scales cut across the six — the Externalizing
    // superspectrum (items 1, 13, 15, 16, 25, 32, 34, 35, 40, 45) and the
    // p-factor (1, 6, 11, 14, 22, 23, 25, 28, 31, 32, 35, 37) — and an item
    // here carries one dimension, so both are left to analysis time, the way
    // the SSS-8's sum is.
    //
    // The 1-4 coding is kept rather than shifted to 0-3 because the norms
    // below are written in it.

    {
        key: "hitopbr",
        name: "Psychopathology",
        instructions:
            "Consider whether there have been significant times during the <b>last 12 months</b> during which this " +
            "statement applied to you, and choose the option that best describes how well it described you during " +
            "that period.",
        format: {
            options: [
                { value: 1, text: "Not at all" },
                { value: 2, text: "A little" },
                { value: 3, text: "Moderately" },
                { value: 4, text: "A lot" },
            ],
            vertical: true,
            color: "#be123c",
            hovercolors: ["#22c55e", "#ef4444"],
        },

        // NOT placeholders, for once: the means and SDs are the spectrum
        // scores of the HiTOP-BR's Development Sample 2 — N = 780 Prolific
        // participants stratified by sex and age towards the US population —
        // as printed in Table 1 of Simms et al. (2026) and transcribed in the
        // {hitop} package (data-raw/hitopbr_table1.R). It is a development
        // sample and not a norming sample, and every spectrum piles up near
        // its floor of 1 (Thought Disorder's mean is 1.26), so the normal
        // percentile these are read through is coarse at the low end: a run of
        // "Not at all" comes out around the 30th percentile, not the 1st. The
        // interpretations are ours.
        norms: {
            Somatoform: {
                mean: 1.82,
                sd: 0.71,
                interpretations: {
                    low: "your body has mostly kept quiet this year: few unexplained aches, and little worry about what a symptom might mean.",
                    mid: "you have had your share of bodily complaints and the odd worry about your health, about as often as most people report.",
                    high: "you have been bothered by bodily symptoms, and by worry about what they mean, more than most people report — a heavy thing to carry, and not on its own a sign of anything in particular.",
                },
            },
            Internalizing: {
                mean: 1.85,
                sd: 0.77,
                interpretations: {
                    low: "anxiety, low mood and self-reproach have troubled you less this year than they do most people.",
                    mid: "worry, low moods and difficult memories have reached you about as often as they reach most people.",
                    high: "you have been weighed on by anxiety, intense moods or harsh feelings about yourself more than most people report — common under strain, and not a diagnosis of anything.",
                },
            },
            "Thought Disorder": {
                mean: 1.26,
                sd: 0.46,
                interpretations: {
                    low: "the line between what is real and what is imagined has held firm for you this year, as it does for most people.",
                    mid: "you have had the occasional moment where a perception or a fantasy felt more real than it should, about as often as most people report.",
                    high: "you have had more moments than most people report where perceptions, fantasies or your own body felt unreal or out of place — experiences far more widespread than is usually admitted, and saying nothing on their own.",
                },
            },
            Detachment: {
                mean: 2.13,
                sd: 0.88,
                interpretations: {
                    low: "you have wanted company and closeness this year more than most people do, and found little appeal in being left alone.",
                    mid: "you have moved between wanting company and wanting to be left to yourself, much as most people do.",
                    high: "you have preferred your own company, and kept close relationships at arm's length, more than most people report.",
                },
            },
            Disinhibition: {
                mean: 1.65,
                sd: 0.6,
                interpretations: {
                    low: "you have planned, kept to time and thought before acting this year more reliably than most people.",
                    mid: "you have kept things broadly in order, with the odd missed deadline or snap decision, about as often as most people.",
                    high: "deadlines, plans and impulses have got away from you this year more often than most people report.",
                },
            },
            Antagonism: {
                mean: 1.42,
                sd: 0.45,
                interpretations: {
                    low: "you have had little appetite this year for power, attention or getting the better of other people.",
                    mid: "you have wanted your share of attention and influence, and taken the odd shortcut to get it, about as much as most people.",
                    high: "you have wanted power, attention or an edge over other people more than most people admit to — a trait that reads very differently depending on where it is pointed.",
                },
            },
        },

        items: [
            { key: "HBR_01", dimension: "Antagonism", text: "I found it easy to deceive others." },
            { key: "HBR_02", dimension: "Antagonism", text: "I deserved special treatment." },
            { key: "HBR_03", dimension: "Thought Disorder", text: "I saw things that were not really there." },
            { key: "HBR_04", dimension: "Thought Disorder", text: "My fantasies felt very real to me." },
            { key: "HBR_05", dimension: "Antagonism", text: "I liked having power." },
            { key: "HBR_06", dimension: "Somatoform", text: "I felt something was wrong with my body." },
            { key: "HBR_07", dimension: "Detachment", text: "When I had the chance, I chose to be alone rather than with other people." },
            { key: "HBR_08", dimension: "Internalizing", text: "My moods were intense and unpredictable." },
            { key: "HBR_09", dimension: "Internalizing", text: "My mind was flooded with troubling images of a bad experience." },
            { key: "HBR_10", dimension: "Somatoform", text: "I had pains in several parts of my body." },
            { key: "HBR_11", dimension: "Thought Disorder", text: "I felt like I was outside of my body." },
            { key: "HBR_12", dimension: "Detachment", text: "I was happiest when I was alone." },
            { key: "HBR_13", dimension: "Antagonism", text: "I found it easy to manipulate others." },
            {
                key: "HBR_14",
                dimension: "Somatoform",
                text:
                    "I was bothered by several bodily symptoms (e.g., headache, fatigue or stomach problems) for which " +
                    "there was no clear or sufficient medical explanation.",
            },
            { key: "HBR_15", dimension: "Disinhibition", text: "I had trouble planning and keeping to schedules." },
            { key: "HBR_16", dimension: "Disinhibition", text: "I lost things that I needed." },
            { key: "HBR_17", dimension: "Somatoform", text: "I was frustrated with having to convince others I had a real illness." },
            { key: "HBR_18", dimension: "Internalizing", text: "Even when I was very careful, I worried whether I had done something correctly." },
            { key: "HBR_19", dimension: "Somatoform", text: "Reading articles about disease made me worry about my health." },
            { key: "HBR_20", dimension: "Disinhibition", text: "I paid my bills late or missed other important deadlines." },
            { key: "HBR_21", dimension: "Somatoform", text: "I could feel changes in my body." },
            { key: "HBR_22", dimension: "Internalizing", text: "I was disgusted with myself." },
            { key: "HBR_23", dimension: "Internalizing", text: "I felt on guard and on edge." },
            { key: "HBR_24", dimension: "Disinhibition", text: "I was a messy person." },
            { key: "HBR_25", dimension: "Antagonism", text: "I did things to get others to notice me." },
            { key: "HBR_26", dimension: "Somatoform", text: "I noticed small changes to how my body feels." },
            { key: "HBR_27", dimension: "Antagonism", text: "Things went best when I told others what to do." },
            { key: "HBR_28", dimension: "Thought Disorder", text: "I heard things that no one else could hear." },
            { key: "HBR_29", dimension: "Disinhibition", text: "I was never on time." },
            { key: "HBR_30", dimension: "Detachment", text: "I had no interest in romantic relationships." },
            { key: "HBR_31", dimension: "Detachment", text: "Romantic relationships seemed like a hassle to me." },
            { key: "HBR_32", dimension: "Disinhibition", text: "I said things without thinking." },
            { key: "HBR_33", dimension: "Antagonism", text: "People told me I was coldhearted." },
            { key: "HBR_34", dimension: "Disinhibition", text: "I made decisions quickly without thinking them through." },
            { key: "HBR_35", dimension: "Disinhibition", text: "I quit tasks that became too challenging." },
            { key: "HBR_36", dimension: "Internalizing", text: "I had a hard time asserting myself to others." },
            { key: "HBR_37", dimension: "Detachment", text: "I felt that I did not want to be in a close relationship." },
            { key: "HBR_38", dimension: "Thought Disorder", text: "I had trouble telling whether something really happened or I just imagined it." },
            { key: "HBR_39", dimension: "Thought Disorder", text: "I felt that things around me were not real." },
            { key: "HBR_40", dimension: "Antagonism", text: "I liked attracting the attention of others." },
            { key: "HBR_41", dimension: "Somatoform", text: "I was afraid that I might suffer from a serious illness." },
            { key: "HBR_42", dimension: "Internalizing", text: "I thought a lot about death." },
            { key: "HBR_43", dimension: "Disinhibition", text: "I bought much more than I needed." },
            { key: "HBR_44", dimension: "Internalizing", text: "I was overwhelmed by anxiety." },
            { key: "HBR_45", dimension: "Antagonism", text: "I expected to get treated better than others." },
        ],
    },
])
