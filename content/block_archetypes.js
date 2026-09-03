defineBlock("archetypes", [
    {
        type: "briefing",
        key: "Briefing_Archetypes",
        text:
            "<h2>Last, the story.</h2>" +
            "<p>Long before anybody measured a personality, people described one another by the part they seemed to be " +
            "playing: the sage, the warrior, the fool, the one who looks after everybody else. These are " +
            "<b>archetypes</b> — the handful of shapes a life keeps being told in.</p>" +
            "<p>What follows is twelve of them, three lines each. None is better than another, and most people carry " +
            "several at once.</p>" +
            "<p><em>Answer for the story you are actually in, not the one you would pick.</em></p>",
    },

    // OSAI-PM ==============================================================
    // The Open Source Archetype Indicator – Pearson-Marr (OSAI-PM): twelve
    // three-item scales after the twelve-archetype framework of Carol S.
    // Pearson and Hugh Marr's Pearson–Marr Archetype Indicator (PMAI). It is
    // an open paraphrase of that framework, not a copy of the instrument: the
    // statements are NOT the PMAI's own, and were written from the open,
    // public descriptions of the twelve archetypes — each one's core
    // assumption, gift and pitfall — first for the Neuropsychological Tarot
    // prototype and revised here (September 2026). The revision kept every
    // statement in the first person and about oneself rather than about how
    // the world should be, took out the absolutes ("always", "never", "the
    // most important") and the comparisons that pitted one archetype against
    // another inside a single item, split the double-barrelled ones down to
    // one claim each, and dropped the qualifiers nobody could disagree with
    // ("systems that are harmful"). A third item was then written for each
    // archetype to the same rules, each covering a facet of the archetype
    // the first two leave out (September 2026). The OSAI-PM is to be
    // validated independently of the original instrument, on its own data;
    // until then it is unvalidated, and nothing here is a PMAI score.
    //
    // The twelve are written in the order they are drawn on the wheel in
    // results.js — three to a quarter, round the colour circle — rather than
    // in any order of importance. The wheel is the only place they are drawn:
    // the whole-run profile web leaves them out, since twelve axes on it
    // would only repeat the wheel and crowd out everything else.
    //
    // NO NORMS, deliberately, and this is the one questionnaire in the app
    // that is fed back anyway. There is no population mean for "Warrior" that
    // would mean anything, and inventing twelve more would be twelve more
    // invented numbers; the twelve are read *against each other* instead —
    // which of these stories is loudest in you — which is what the framework
    // claims to be about in the first place. That is why results.js draws
    // them as a wheel rather than as rows: a row wants a percentile, and
    // there is none here to give.

    {
        key: "archetypes",
        name: "Archetypes",
        instructions: "Please indicate the extent to which you agree or disagree with each statement",
        format: {
            options: [1, 2, 3, 4, 5, 6, 7],
            anchors: ["Strongly disagree", "Strongly agree"],
            // No hovercolors: there is no good end of an archetype, only more
            // or less of it.
            color: "#ef6c4d",
        },

        items: [
            // Yearn for paradise ------------------------------------------

            // Idealist (the PMAI's Innocent): trust, optimism, faith, hope,
            // loyalty, simplicity. Wants to stay safe and believes things will
            // work out; fears abandonment and doing wrong; its shadow is
            // denial and naivety.
            {
                key: "Archetype_Idealist_1",
                dimension: "Idealist",
                text: "No matter how bad things look, I trust that everything will turn out well in the end.",
            },
            {
                key: "Archetype_Idealist_2",
                dimension: "Idealist",
                text: "I prefer to focus on the good in people and situations rather than their flaws.",
            },
            {
                key: "Archetype_Idealist_3",
                dimension: "Idealist",
                text: "I find it easy to trust that people mean well.",
            },

            // Sage: wisdom, truth, knowledge, objectivity, scepticism,
            // analysis, non-attachment. Wants to understand; fears deception
            // and illusion; its shadow is cold detachment and judging from
            // the sidelines.
            {
                key: "Archetype_Sage_1",
                dimension: "Sage",
                text: "I am driven to understand the underlying truth of any situation, even if it is uncomfortable.",
            },
            {
                key: "Archetype_Sage_2",
                dimension: "Sage",
                text: "I trust careful analysis and evidence over gut feeling and opinion.",
            },
            {
                key: "Archetype_Sage_3",
                dimension: "Sage",
                text: "I try to look at my own life from a detached, objective distance.",
            },

            // Seeker (the Explorer): autonomy, independence, exploration,
            // ambition, authenticity, freedom, self-discovery. Wants a better
            // life and to find out who they are; fears conformity and being
            // trapped; its shadow is perpetual wandering and never committing.
            {
                key: "Archetype_Seeker_1",
                dimension: "Seeker",
                text: "I keep seeking out new experiences to find out who I really am.",
            },
            {
                key: "Archetype_Seeker_2",
                dimension: "Seeker",
                text: "Having the freedom to chart my own course is more important to me than security or settling down.",
            },
            {
                key: "Archetype_Seeker_3",
                dimension: "Seeker",
                text: "I get restless whenever my life starts to feel settled and predictable.",
            },

            // Leave a mark -------------------------------------------------

            // Revolutionary (the PMAI's Destroyer): letting go, metamorphosis,
            // humility, acceptance, breaking rules, clearing away what no
            // longer serves. Wants growth through release; fears annihilation
            // and loss; its shadow is self-destruction and wrecking for its
            // own sake.
            {
                key: "Archetype_Revolutionary_1",
                dimension: "Revolutionary",
                text: "When something in my life is no longer working, I am willing to destroy it completely so something better can emerge.",
            },
            {
                key: "Archetype_Revolutionary_2",
                dimension: "Revolutionary",
                text: "I am willing to break rules and traditions that stand in the way of something better.",
            },
            {
                key: "Archetype_Revolutionary_3",
                dimension: "Revolutionary",
                text: "I can let go of things — plans, roles, relationships — once their time has passed.",
            },

            // Magician: transformation, healing, catalyst, vision, personal
            // power, win-win solutions, synchronicity, aligning inner and
            // outer change. Wants to turn dreams into reality; fears
            // unintended negative consequences; its shadow is manipulation
            // and the sorcerer.
            {
                key: "Archetype_Magician_1",
                dimension: "Magician",
                text: "When I change my inner attitude and intentions, the situation around me tends to change too.",
            },
            {
                key: "Archetype_Magician_2",
                dimension: "Magician",
                text: "I have a knack for finding solutions that work for everyone when others see only conflict.",
            },
            {
                key: "Archetype_Magician_3",
                dimension: "Magician",
                text: "I see myself as a catalyst: things tend to transform when I get involved.",
            },

            // Warrior (the Hero): courage, discipline, determination,
            // competence, achievement, protecting others, fighting for what
            // matters. Wants to win and make a difference; fears weakness and
            // vulnerability; its shadow is ruthlessness and the villain.
            {
                key: "Archetype_Warrior_1",
                dimension: "Warrior",
                text: "I meet challenges head-on rather than avoiding them.",
            },
            {
                key: "Archetype_Warrior_2",
                dimension: "Warrior",
                text: "I have the discipline to push through adversity until I achieve what I set out to do.",
            },
            {
                key: "Archetype_Warrior_3",
                dimension: "Warrior",
                text: "I stand up and fight for what I believe in, even when the odds are against me.",
            },

            // Connect with others ------------------------------------------

            // Realist (the PMAI's Orphan, the Regular Person): realism,
            // resilience, empathy, interdependence, pragmatism, being
            // down-to-earth, belonging. Wants to regain safety and to belong;
            // fears exploitation and being let down; its shadow is cynicism
            // and victimhood.
            {
                key: "Archetype_Realist_1",
                dimension: "Realist",
                text: "I take life as it comes, hard parts and all, rather than expecting it to be fair.",
            },
            {
                key: "Archetype_Realist_2",
                dimension: "Realist",
                text: "I try to stay unpretentious and down-to-earth.",
            },
            {
                key: "Archetype_Realist_3",
                dimension: "Realist",
                text: "I feel a kinship with ordinary people who are just getting by.",
            },

            // Jester (the Fool): joy, humour, playfulness, freedom, lightness,
            // irreverence, living in the moment. Wants to enjoy life and
            // lighten it for others; fears boredom and deadness; its shadow
            // is irresponsibility and cruelty in the guise of a joke.
            {
                key: "Archetype_Jester_1",
                dimension: "Jester",
                text: "I get through hard times by finding what is funny in them.",
            },
            {
                key: "Archetype_Jester_2",
                dimension: "Jester",
                text: "I love bringing playfulness, laughter, and lightness into any situation I am in.",
            },
            {
                key: "Archetype_Jester_3",
                dimension: "Jester",
                text: "I find it hard to take anything too seriously for long.",
            },

            // Lover: passion, intimacy, commitment, enthusiasm, appreciation,
            // sensuality, connection, beauty. Wants bliss and union with what
            // it loves; fears loss of love and isolation; its shadow is
            // jealousy, obsession and losing oneself in another.
            {
                key: "Archetype_Lover_1",
                dimension: "Lover",
                text: "I feel truly alive when I am deeply connected to someone I love.",
            },
            {
                key: "Archetype_Lover_2",
                dimension: "Lover",
                text: "Closeness, intimacy, and passion are where I find the most meaning in life.",
            },
            {
                key: "Archetype_Lover_3",
                dimension: "Lover",
                text: "I savour beauty and pleasure wherever I find them — in people, places or things.",
            },

            // Provide structure --------------------------------------------

            // Creator: imagination, vision, self-expression, originality,
            // invention, craftsmanship, authenticity. Wants to make something
            // of enduring value; fears mediocrity and inauthenticity; its
            // shadow is perfectionism and creating for its own sake.
            {
                key: "Archetype_Creator_1",
                dimension: "Creator",
                text: "I feel most alive when I am inventing, designing, or bringing a new idea into the world.",
            },
            {
                key: "Archetype_Creator_2",
                dimension: "Creator",
                text: "Beauty, originality, and self-expression matter more to me than practicality or convention.",
            },
            {
                key: "Archetype_Creator_3",
                dimension: "Creator",
                text: "I feel a need to make something that will outlast me.",
            },

            // Ruler: leadership, responsibility, order, control, sovereignty,
            // prosperity, taking charge. Wants a prosperous and orderly
            // realm; fears chaos and being overthrown; its shadow is tyranny
            // and rigidity.
            {
                key: "Archetype_Ruler_1",
                dimension: "Ruler",
                text: "I am at my best when I am in charge.",
            },
            {
                key: "Archetype_Ruler_2",
                dimension: "Ruler",
                text: "I naturally step up to bring order and direction when things are chaotic.",
            },
            {
                key: "Archetype_Ruler_3",
                dimension: "Ruler",
                text: "I like to have clear control over how things are run.",
            },

            // Caregiver: compassion, generosity, nurturing, service,
            // sacrifice, protection, altruism. Wants to help and protect
            // others; fears selfishness and ingratitude; its shadow is
            // martyrdom, enabling and smothering.
            {
                key: "Archetype_Caregiver_1",
                dimension: "Caregiver",
                text: "I feel most fulfilled when I am taking care of someone who needs my support.",
            },
            {
                key: "Archetype_Caregiver_2",
                dimension: "Caregiver",
                text: "I feel responsible for easing other people's suffering.",
            },
            {
                key: "Archetype_Caregiver_3",
                dimension: "Caregiver",
                text: "I readily put other people's needs before my own.",
            },
        ],
    },
])
