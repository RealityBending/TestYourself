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
    // public descriptions of the twelve archetypes, first for the
    // Neuropsychological Tarot prototype and revised here over three rounds of
    // review (September 2026). The OSAI-PM is to be validated independently of
    // the original instrument, on its own data; until then it is unvalidated,
    // and nothing here is a PMAI score.
    //
    // HOW THE ITEMS ARE WRITTEN — the rules every statement below follows, so
    // that a review can be checked against them rather than against taste:
    //
    //   - First person, about oneself, one claim per item. No absolutes
    //     ("always", "never", "the most important"), and no comparison that
    //     pits one archetype against another inside a single item; a
    //     comparison inside one archetype's own story ("tear down rather than
    //     patch") is allowed.
    //   - Each scale's three items cover THREE DIFFERENT FACETS of the
    //     archetype, named in the comment above it. Two items saying the same
    //     thing in different words inflate alpha and narrow the construct,
    //     and that is what every round of review has caught most often.
    //   - Each scale carries ONE BEHAVIOURAL item (what the person does) and
    //     ONE POLARIZING item — a statement a person of the opposite archetype
    //     can comfortably disagree with. The wheel reads the twelve against
    //     each other, so an item everyone agrees with flattens it rather than
    //     making it fairer. A polarizing item is not softened to make it more
    //     agreeable; that is the edit reviewers most often propose and the
    //     one most often declined.
    //   - No shadow items. Each archetype has a pitfall (the Caregiver's
    //     martyrdom, the Sage's cold detachment), but at three items a scale
    //     cannot carry gift and shadow at once; a statement whose social
    //     desirability IS its shadow (putting others' needs before one's own)
    //     is left out.
    //   - Three items, not more, on purpose: the run is long, and the
    //     reliability lost is accepted rather than bought with twelve more
    //     statements. Expect alphas short of the six-item PMAI's.
    //
    // The twelve are written in the order they are drawn on the wheel in
    // results.js — three to a quarter, round the colour circle — rather than
    // in any order of importance. The wheel is the only place they are drawn:
    // the whole-run profile web leaves them out, since twelve axes on it
    // would only repeat the wheel and crowd out everything else.

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

            // Idealist (the PMAI's Innocent): trust, optimism, faith, fidelity,
            // simplicity. Wants to stay safe and believes things will work out;
            // fears abandonment and doing wrong; its shadow is denial and
            // naivety. Facets: faith that things work out (1), loyalty (2),
            // trust in people (3). The loyalty item is there because three
            // optimism items were one item thrice; it is fidelity rather than
            // safety, since wanting to be safe is the Realist's ground.
            {
                key: "Archetype_Idealist_1",
                dimension: "Idealist",
                text: "Even when things look bad, I trust that they will ultimately work out for the best.",
            },
            {
                key: "Archetype_Idealist_2",
                dimension: "Idealist",
                text: "I stay loyal to the people and places I have always belonged to.",
            },
            {
                key: "Archetype_Idealist_3",
                dimension: "Idealist",
                text: "I tend to assume that people mean well.",
            },

            // Sage: wisdom, truth, knowledge, objectivity, scepticism,
            // analysis, non-attachment. Wants to understand; fears deception
            // and illusion; its shadow is cold detachment and judging from
            // the sidelines. Facets: the drive to the truth (1), scepticism
            // (2, the behavioural one — it is what the Sage does with a claim,
            // and it is written as scepticism rather than as "analysis over
            // gut feeling" so that the scale does not turn into a measure of
            // rationality), detachment (3, the polarizing one).
            {
                key: "Archetype_Sage_1",
                dimension: "Sage",
                text: "I am driven to understand the underlying truth of any situation, even if it is uncomfortable.",
            },
            {
                key: "Archetype_Sage_2",
                dimension: "Sage",
                text: "I question claims until I have seen the evidence for them.",
            },
            {
                key: "Archetype_Sage_3",
                dimension: "Sage",
                text: "I look at my own life from a detached, objective distance.",
            },

            // Seeker (the Explorer): autonomy, independence, exploration,
            // ambition, authenticity, freedom, self-discovery. Wants a better
            // life and to find out who they are; fears conformity and being
            // trapped; its shadow is perpetual wandering and never committing.
            // Facets: exploration as self-discovery (1, behavioural), the need
            // for freedom (2), restlessness when settled (3, the polarizing
            // one, and the only item about a feeling — it stays, since fear
            // of the trap is the facet the other two do not cover).
            {
                key: "Archetype_Seeker_1",
                dimension: "Seeker",
                text: "I keep seeking out new experiences to find out who I really am.",
            },
            {
                key: "Archetype_Seeker_2",
                dimension: "Seeker",
                text: "I need the freedom to chart my own course in life.",
            },
            {
                key: "Archetype_Seeker_3",
                dimension: "Seeker",
                text: "I get restless whenever my life starts to feel settled and predictable.",
            },

            // Leave a mark -------------------------------------------------

            // Revolutionary (the PMAI's Destroyer): letting go, metamorphosis,
            // humility, acceptance, clearing away what no longer serves. Wants
            // growth through release; fears annihilation and loss; its shadow
            // is self-destruction and wrecking for its own sake. THE STORY IS
            // THE DESTROYER'S, NOT THE REBEL'S: the name on screen says
            // "Revolutionary" because "Destroyer" reads as an insult, but the
            // items are about endings, not about rules — a rule-breaking item
            // used to sit here and pulled the scale towards a different
            // archetype (Pearson's Outlaw), so it went. Facets: dismantling
            // (1, behavioural), tearing down over patching (2, polarizing),
            // accepting endings (3).
            {
                key: "Archetype_Revolutionary_1",
                dimension: "Revolutionary",
                text: "I am willing to dismantle what no longer serves me so that something new can emerge.",
            },
            {
                key: "Archetype_Revolutionary_2",
                dimension: "Revolutionary",
                text: "I would rather tear something down and start again than keep patching it.",
            },
            {
                key: "Archetype_Revolutionary_3",
                dimension: "Revolutionary",
                text: "I can accept the end of things — plans, roles, relationships — once their time has passed.",
            },

            // Magician: transformation, healing, catalyst, vision, personal
            // power, synchronicity, aligning inner and outer change. Wants to
            // turn dreams into reality; fears unintended negative consequences;
            // its shadow is manipulation and the sorcerer. Facets: the belief
            // that inner change moves the outer world (1, polarizing — THE
            // IMPLAUSIBILITY IS THE CONSTRUCT: softened to "changes how I
            // experience a situation" it becomes something every reader
            // agrees with and stops telling a Magician from anyone else),
            // inner work as method (2, behavioural — a win-win mediator item
            // used to sit here and belonged to the Caregiver or the Idealist
            // as much as to anyone), the self-image as catalyst (3).
            {
                key: "Archetype_Magician_1",
                dimension: "Magician",
                text: "When I change my own attitude, things around me tend to shift as well.",
            },
            {
                key: "Archetype_Magician_2",
                dimension: "Magician",
                text: "When I want something around me to change, I start by working on myself.",
            },
            {
                key: "Archetype_Magician_3",
                dimension: "Magician",
                text: "I see myself as a catalyst: things tend to transform when I get involved.",
            },

            // Warrior (the Hero): courage, discipline, determination,
            // competence, achievement, winning, fighting for what matters.
            // Wants to win and make a difference; fears weakness and
            // vulnerability; its shadow is ruthlessness and the villain.
            // Facets: courage (1, behavioural), grit (2), the will to prevail
            // (3, polarizing). Prevailing rather than protecting, since
            // protecting shades into the Caregiver and winning is what the
            // Warrior most fears failing at; and not "standing up for what is
            // right when it is difficult", which nobody disagrees with.
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
                text: "When I compete, I am in it to win.",
            },

            // Connect with others ------------------------------------------

            // Realist (the PMAI's Orphan, the Regular Person): realism,
            // resilience, empathy, interdependence, pragmatism, belonging.
            // Wants to regain safety and to belong; fears exploitation and
            // being let down; its shadow is cynicism and victimhood. Facets:
            // taking life as it comes (1, polarizing — it is the Idealist's
            // opposite), interdependence (2, the Orphan's core: knowing one
            // cannot go it alone — an "unpretentious and down-to-earth" item
            // used to sit here and measured modesty, which is nobody's
            // archetype in particular), kinship with those who have struggled
            // (3). Written without class language.
            {
                key: "Archetype_Realist_1",
                dimension: "Realist",
                text: "I take life as it comes, hard parts and all, rather than expecting it to be fair.",
            },
            {
                key: "Archetype_Realist_2",
                dimension: "Realist",
                text: "I know I cannot get through life without relying on other people.",
            },
            {
                key: "Archetype_Realist_3",
                dimension: "Realist",
                text: "I feel a kinship with people who have known hard times.",
            },

            // Jester (the Fool): joy, humour, playfulness, freedom, lightness,
            // irreverence, living in the moment. Wants to enjoy life and
            // lighten it for others; fears boredom and deadness; its shadow
            // is irresponsibility and cruelty in the guise of a joke. Facets:
            // humour as coping (1, behavioural), bringing play to others (2),
            // irreverence (3, polarizing — nothing is sacred). Irreverence
            // rather than living in the moment, which leaks into the Seeker
            // and the Lover; and not "finding humour" or "lightening things
            // up" a second time, which is what items 1 and 2 already say.
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
                text: "Nothing is too sacred to joke about.",
            },

            // Lover: passion, intimacy, commitment, enthusiasm, appreciation,
            // sensuality, connection, beauty. Wants bliss and union with what
            // it loves; fears loss of love and isolation; its shadow is
            // jealousy, obsession and losing oneself in another. One noun per
            // item: connection (1), passion (2, behavioural — giving oneself
            // wholly), beauty (3). Item 1 says "someone or something" because
            // the Lover is union with whatever is loved, not romance alone;
            // items 1 and 2 used to both say that connection is where meaning
            // lies, so item 2 is now devotion and nothing else.
            {
                key: "Archetype_Lover_1",
                dimension: "Lover",
                text: "I feel truly alive when I am deeply connected to someone or something I love.",
            },
            {
                key: "Archetype_Lover_2",
                dimension: "Lover",
                text: "When I care about something, I give myself to it completely.",
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
            // shadow is perfectionism and creating for its own sake. Facets:
            // aliveness in inventing (1), the compulsion to make (2,
            // behavioural — MAKING, not taste: "drawn to original creations"
            // sat here and described an audience, not a creator), the wish to
            // leave something that lasts (3, polarizing).
            {
                key: "Archetype_Creator_1",
                dimension: "Creator",
                text: "I feel most alive when I am inventing, designing, or bringing a new idea into the world.",
            },
            {
                key: "Archetype_Creator_2",
                dimension: "Creator",
                text: "I am always making something, whether anyone asked for it or not.",
            },
            {
                key: "Archetype_Creator_3",
                dimension: "Creator",
                text: "I feel a need to make something that will outlast me.",
            },

            // Ruler: leadership, responsibility, order, control, sovereignty,
            // prosperity, taking charge. Wants a prosperous and orderly
            // realm; fears chaos and being overthrown; its shadow is tyranny
            // and rigidity. Facets: being in charge (1, polarizing — kept
            // blunt on purpose), bringing order to chaos (2, behavioural),
            // accountability for one's realm (3 — a "making sure things are
            // run properly" item sat here and was item 2 again).
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
                text: "I take responsibility for how things turn out for the people I lead.",
            },

            // Caregiver: compassion, generosity, nurturing, service,
            // protection, altruism. Wants to help and protect others; fears
            // selfishness and ingratitude; its shadow is martyrdom, enabling
            // and smothering. Facets: fulfilment in caring (1), felt
            // responsibility for others' suffering (2, polarizing),
            // responding to need before it is voiced (3, behavioural). Item 3
            // replaced "I readily put other people's needs before my own",
            // which is the most socially desirable sentence in the inventory
            // and measures the shadow (self-sacrifice) as much as the gift.
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
                text: "When I see someone struggling, I step in to help before they have to ask.",
            },

            // The attention check. The circles carry their numbers, so it can
            // name one — and one off either end, since the ends are where a
            // thumb goes without reading.
            {
                key: "Archetype_AttentionCheck",
                check: 2,
                text: "To show that I am reading these statements, I will answer 2 on this one.",
            },
        ],
    },
])
