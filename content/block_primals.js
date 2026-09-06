// Primal world beliefs — the whole of a level of its own, since the frame the
// briefing sets ("the actual world as it is now, not the one we wish we lived
// in") has to hold over both questionnaires below it and over nothing else.
//
// Two questionnaires rather than one, because they are two instruments asked
// two different ways. The PI-18 was validated in a fixed order and is written
// here in it (`shuffle: false`); the PI-99, which the five tertiary scales are
// lifted from, was validated with its items in a different random order for
// every participant, which is what this app does by default. Clifton's own
// advice on mixing subscales across versions — administer the broader primals
// before the narrower ones — is why the PI-18 is written first.
//
// Item texts are verbatim from the Primals Inventories administration
// instructions (Clifton, updated February 2021), American spelling and all.
// The keys name the primal and count within it — `PI_Safe_1`, `PI_Alive_4` —
// the way every other scale's keys here do, and Clifton's own label for the
// item (`sd1`, `am4`; an `x` on the end is his mark for a reverse-scored item)
// rides beside each in a comment, so a saved file maps onto his published
// scoring code with one renaming step. The keys were his labels themselves,
// under a version prefix (`PI18_ed1`) and then under `PI_`, until September
// 2026.
defineBlock("primals", [
    {
        type: "briefing",
        key: "Briefing_World",
        text:
            "<h2>Last but not least, the world itself.</h2>" +
            "<p>Everything so far has been about you. The next statements are about how you think and experience <b>the world you live in</b>.</p>" +
            "<p><em>These are statements about the actual world as it is now, not the world we wish we lived in. " +
            "When in doubt, go with what first feels true. There is no need to overthink it.</em></p>",
    },

    // PI-18 ================================================================
    // The 18-item Primals Inventory (Clifton & Yaden, 2021, Psychological
    // Assessment, 33(12), 1267-1273), the validated short form of the PI-99
    // (Clifton et al., 2019, Psychological Assessment, 31(1), 82-99). Eighteen
    // statements on the inventory's own 0-5 agreement scale, seven of them
    // reverse-keyed, in the fixed order the short form was validated in.
    //
    // Three dimensions are scored here and not four. The inventory's headline
    // primal, overall Good world belief, is not a fourth set of items but a
    // *composite* of these ones — all six Safe items, all seven Enticing
    // items, and two of the five Alive items (`PI_Alive_1` and `PI_Alive_4`,
    // Clifton's `am1` and `am4`) — and an item
    // in this engine carries one dimension. Rather than ask anything twice or
    // teach the engine a second way to score, Good is left to analysis time:
    // every item it needs is in the saved file, with Clifton's label beside
    // each key here, so his published code computes it after a rename. What is read back on screen is
    // the three dimensions under Good, which is also exactly the three axes a
    // spider chart wants.
    //
    // No attention check is dealt in among these eighteen: the short form's
    // validated order is worth keeping intact, and the check the inventory
    // ships with sits in the questionnaire below instead, where the shuffle
    // can put it anywhere.
    {
        key: "pi18",
        name: "World Beliefs",
        shuffle: false,
        instructions:
            "Not the world we wish we lived in, but <b>the actual world as it is now</b>. When in doubt, go with " +
            "what initially feels true.",
        format: {
            options: [
                { value: 0, text: "Strongly disagree" },
                { value: 1, text: "Disagree" },
                { value: 2, text: "Slightly disagree" },
                { value: 3, text: "Slightly agree" },
                { value: 4, text: "Agree" },
                { value: 5, text: "Strongly agree" },
            ],
            color: "#2e9e6b",
            hovercolors: ["#ef4444", "#22c55e"],
        },

        // PLACEHOLDER norms, invented. Not from any published sample: the
        // PI-99 paper reports the subscales' reliabilities (Safe .96,
        // Enticing .95, Alive .89 across 2,454 people, on the full-length
        // subscales) but no means or standard deviations, and the short form's
        // paper none either. The shape below is only what the literature
        // describes in words — most people rating the world as somewhat
        // enticing, rather less safe, and mechanistic more often than alive —
        // and the numbers are guesses at it. Replace them with a real sample
        // before any of this is presented as a standing.
        norms: {
            Safe: {
                mean: 2.6,
                sd: 0.85,
                interpretations: {
                    low: "you move through a world that has to be watched: things go wrong, people compete, and what is fine now could easily unravel.",
                    mid: "you take the world as neither out to get you nor especially gentle, and stay alert in the places that warrant it.",
                    high: "you find the world broadly harmless: cooperative more than cut-throat, and unlikely to turn on you without warning.",
                },
            },
            Enticing: {
                mean: 3.3,
                sd: 0.85,
                interpretations: {
                    low: "much of the world strikes you as dull and not worth the detour, and beauty as the rare exception rather than the rule.",
                    mid: "some of the world rewards a closer look and much of it does not, and you can usually tell which is which.",
                    high: "you find the world worth exploring almost anywhere you turn: beautiful, funny, abundant, and rarely boring.",
                },
            },
            Alive: {
                mean: 2.4,
                sd: 1.0,
                interpretations: {
                    low: "the world is a mechanism to you: events happen for reasons, but not for purposes, and none of them are about you.",
                    mid: "you sometimes sense a shape behind events and are not sure how much to make of it.",
                    high: "the world feels like it is up to something: events happen on purpose, and some of them seem meant for you.",
                },
            },
        },

        items: [
            { key: "PI_Enticing_1", dimension: "Enticing", text: "In life, there's way more beauty than ugliness." }, // ed1
            {
                key: "PI_Alive_1", // am1
                dimension: "Alive",
                text: "It often feels like events are happening in order to help me in some way.",
            },
            { key: "PI_Safe_1", dimension: "Safe", text: "I tend to see the world as pretty safe." }, // sd1
            { key: "PI_Alive_2", dimension: "Alive", text: "What happens in the world is meant to happen." }, // am2
            {
                key: "PI_Enticing_2", // ed2x
                dimension: "Enticing",
                text: "While some things are worth checking out or exploring further, most things probably aren't worth the effort.",
                reverse: true,
            },
            { key: "PI_Enticing_3", dimension: "Enticing", text: "Most things in life are kind of boring.", reverse: true }, // ed3x
            { key: "PI_Enticing_4", dimension: "Enticing", text: "The world is an abundant place with tons and tons to offer." }, // ed4
            {
                key: "PI_Enticing_5", // ed5
                dimension: "Enticing",
                text: "No matter where we are or what the topic might be, the world is fascinating.",
            },
            {
                key: "PI_Enticing_6", // ed6x
                dimension: "Enticing",
                text: "The world is a somewhat dull place where plenty of things are not that interesting.",
                reverse: true,
            },
            { key: "PI_Safe_2", dimension: "Safe", text: "On the whole, the world is a dangerous place.", reverse: true }, // sd2x
            {
                key: "PI_Safe_3", // sd3x
                dimension: "Safe",
                text: "Instead of being cooperative, the world is a cut-throat and competitive place.",
                reverse: true,
            },
            { key: "PI_Alive_3", dimension: "Alive", text: "Events seem to lack any cosmic or bigger purpose.", reverse: true }, // am3x
            { key: "PI_Safe_4", dimension: "Safe", text: "Most things have a habit of getting worse.", reverse: true }, // sd4x
            { key: "PI_Alive_4", dimension: "Alive", text: "The universe needs me for something important." }, // am4
            { key: "PI_Safe_5", dimension: "Safe", text: "Most things in the world are good." }, // sd5
            { key: "PI_Alive_5", dimension: "Alive", text: "Everything happens for a reason and on purpose." }, // am5
            { key: "PI_Safe_6", dimension: "Safe", text: "Most things and situations are harmless and totally safe." }, // sd6
            { key: "PI_Enticing_7", dimension: "Enticing", text: "No matter where we are, incredible beauty is always around us." }, // ed7
        ],
    },

    // The five unclustered tertiary primals =================================
    // Of the PI-99's twenty-two tertiary primals, seventeen cluster under
    // Safe, Enticing or Alive and are therefore already spoken for by the
    // PI-18 above. These five are the ones that cluster under none of them,
    // and so are missed entirely by every short form of the inventory:
    // Acceptable, Changing, Hierarchical, Interconnected and Understandable.
    // Twenty-two items, taken whole from the PI-99 with nothing rewritten, on
    // the same scale as the PI-18 — which is what makes the two safe to ask
    // back to back, and what asking them on different scales would quietly
    // ruin.
    //
    // Mixing subscales across versions of the inventory this way is what
    // Clifton's administration instructions recommend for exactly this case,
    // with the caveat that few of the hundreds of possible permutations have
    // been validated as such. Reliabilities for these five, from the PI-99's
    // own 2,454 people: Acceptable .81, Changing .79, Hierarchical .78,
    // Interconnected .85, Understandable .80.
    {
        key: "primals_tertiary",
        name: "Other World Beliefs",
        // Asked, scored and saved, and fed back nowhere: the level reads as
        // the one sea and nothing else, and five percentile rows under a
        // picture would be a second, plainer answer to the question the
        // picture has just answered. The norms stay for analysis, the way the
        // HiTOP-BR's do — `results: false` is only what keeps them from
        // opening a section.
        results: false,
        // Kept off the whole-run profile web and card too. These five are the
        // inventory's neutral primals: believing the world hierarchical or
        // changeable is not more or less of anything good, and on a polygon
        // where every other axis runs from less to more of something a person
        // would want, they would read as more of the same kind of thing, which
        // they are not. The chart on this level is where they are read.
        profile: false,
        instructions:
            "Not the world we wish we lived in, but <b>the actual world as it is now</b>. When in doubt, go with " +
            "what initially feels true.",
        format: {
            options: [
                { value: 0, text: "Strongly disagree" },
                { value: 1, text: "Disagree" },
                { value: 2, text: "Slightly disagree" },
                { value: 3, text: "Slightly agree" },
                { value: 4, text: "Agree" },
                { value: 5, text: "Strongly agree" },
            ],
            color: "#6b9e2e",
            hovercolors: ["#ef4444", "#22c55e"],
        },

        // PLACEHOLDER norms, invented, for the same reason as the PI-18's
        // above: the published work gives reliabilities for these scales but
        // no means or standard deviations. Guesses at the shape, not a sample.
        norms: {
            Acceptable: {
                mean: 2.2,
                sd: 0.9,
                interpretations: {
                    low: "almost nothing strikes you as finished: situations are there to be improved, and leaving one alone feels like giving up on it.",
                    mid: "you improve some things and let others be, depending on what they are.",
                    high: "you take situations as they come and see less point in reworking them than most people do.",
                },
            },
            Changing: {
                mean: 3.4,
                sd: 0.8,
                interpretations: {
                    low: "the world holds still for you: most things are much as they were, and much as they will be.",
                    mid: "some of the world shifts under you and some of it stays put.",
                    high: "everything feels in motion: shifting, unsettled, up in the air.",
                },
            },
            Hierarchical: {
                mean: 2.7,
                sd: 0.9,
                interpretations: {
                    low: "you doubt that things can be honestly ranked: differences are real, but better and worse mostly are not.",
                    mid: "you rank some things and not others, and are not much troubled either way.",
                    high: "you see a real order of importance running through the world: people, animals and things genuinely are better or worse than one another.",
                },
            },
            Interconnected: {
                mean: 3.2,
                sd: 1.0,
                interpretations: {
                    low: "things stand apart for you: mostly separate, mostly independent, and connected only where you can see the connection.",
                    mid: "you see plenty of things joined up and plenty standing on their own.",
                    high: "nothing is really separate to you: everything touches everything else, however it may appear.",
                },
            },
            Understandable: {
                mean: 3.0,
                sd: 0.8,
                interpretations: {
                    low: "the world is over your head more often than not, and much of it is too confusing to be worth trying to work out.",
                    mid: "you find most things followable with some effort, and some things beyond you.",
                    high: "you expect to be able to understand things, and rarely meet a subject you take to be out of reach.",
                },
            },
        },

        items: [
            // Acceptable (vs. unacceptable) — all but the last keyed towards
            // the unacceptable pole, as published.
            {
                key: "PI_Acceptable_1", // au1x
                dimension: "Acceptable",
                text: "The world needs to be continually improved rather than accepted.",
                reverse: true,
            },
            {
                key: "PI_Acceptable_2", // au2x
                dimension: "Acceptable",
                text: "Most situations in life need to be improved, not accepted.",
                reverse: true,
            },
            {
                key: "PI_Acceptable_3", // au3x
                dimension: "Acceptable",
                text: "Rather than accepting things as they are, the world needs to be improved as much as possible.",
                reverse: true,
            },
            { key: "PI_Acceptable_4", dimension: "Acceptable", text: "It's usually better to accept a situation than try to change it." }, // au4

            // Changing (vs. static)
            { key: "PI_Changing_1", dimension: "Changing", text: "Everything feels like it's shifting and changing." }, // cs1
            { key: "PI_Changing_2", dimension: "Changing", text: "I feel like everything changes all the time." }, // cs2
            { key: "PI_Changing_3", dimension: "Changing", text: "Everything feels like a whirl of constant change." }, // cs3
            {
                key: "PI_Changing_4", // cs4x
                dimension: "Changing",
                text: "The world is a place where most things stay pretty much the same.",
                reverse: true,
            },
            {
                key: "PI_Changing_5", // cs5
                dimension: "Changing",
                text: "Everything feels like it's constantly moving, changing, and up in the air.",
            },

            // Hierarchical (vs. nonhierarchical)
            { key: "PI_Hierarchical_1", dimension: "Hierarchical", text: "Most things in the world could be ranked in order of importance." }, // hn1
            {
                key: "PI_Hierarchical_2", // hn2
                dimension: "Hierarchical",
                text: "Humans, animals, plants, and pretty much everything else can be organized by how important or good they are.",
            },
            {
                key: "PI_Hierarchical_3", // hn3
                dimension: "Hierarchical",
                text:
                    "Most things can be organized into hierarchies, rankings, or pecking orders that reflect true differences " +
                    "among things.",
            },
            {
                key: "PI_Hierarchical_4", // hn4x
                dimension: "Hierarchical",
                text:
                    "Most things aren't better or worse. It's hard to organize the world into hierarchies, rankings, or pecking " +
                    "orders that reflect true differences.",
                reverse: true,
            },
            {
                key: "PI_Hierarchical_5", // hn5
                dimension: "Hierarchical",
                text: "Things are rarely equal. Most plants and animals, and even people, are better or worse than one another.",
            },

            // Interconnected (vs. atomistic)
            { key: "PI_Interconnected_1", dimension: "Interconnected", text: "Every single thing is connected to everything else." }, // ia1
            { key: "PI_Interconnected_2", dimension: "Interconnected", text: "The world is a place where everything is completely interconnected." }, // ia2
            {
                key: "PI_Interconnected_3", // ia3
                dimension: "Interconnected",
                text: "Though things can appear separate and independent, they really aren't. Instead, all is one.",
            },
            {
                key: "PI_Interconnected_4", // ia4x
                dimension: "Interconnected",
                text: "Most things are basically unconnected and independent from each other.",
                reverse: true,
            },

            // Understandable (vs. too hard to understand)
            { key: "PI_Understandable_1", dimension: "Understandable", text: "Most everything is easy enough to understand." }, // ut1
            { key: "PI_Understandable_2", dimension: "Understandable", text: "The world is easy enough to understand." }, // ut2
            {
                key: "PI_Understandable_3", // ut3x
                dimension: "Understandable",
                text: "Lots of things in the world are too confusing and difficult to understand.",
                reverse: true,
            },
            {
                key: "PI_Understandable_4", // ut4x
                dimension: "Understandable",
                text: "The world is a confusing place where many skills and subjects are too hard to figure out.",
                reverse: true,
            },

            // The level's attention check, and the one the inventory ships
            // with, worded as Clifton words it. It asks for "slightly
            // disagree", which is 2 here — off the two ends of the scale a
            // straightliner sits at, and off the agreeing side these items
            // otherwise pull towards.
            {
                key: "PI_AttentionCheck",
                check: 2,
                text: 'Please mark this statement "slightly disagree."',
            },
        ],
    },
])
