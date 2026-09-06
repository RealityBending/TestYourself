// The HiTOP-BR, a block of its own so that it moves as a piece: asked at the
// end of level 3, after the mood and health questionnaires, since its
// briefing widens the frame from the last few weeks to the last year and has
// to follow them. It lived in `block_hexaco.js` — then `block_personality.js`
// — until September 2026.
defineBlock("hitop", [
    {
        type: "briefing",
        key: "Briefing_Spectra",
        text:
            "<h2>Now, the last year.</h2>" +
            "<p>The last few questions were about the past couple of weeks. The next ones widen the frame to the " +
            "<b>last twelve months</b>. They ask about the kinds of experience psychology has spent a century " +
            "sorting into diagnoses. Here they are asked as dimensions instead: not whether you have something, " +
            "but how much of it has been true of you.</p>" +
            "<p>Some statements will describe you well and some not at all. Every one of them describes somebody, " +
            "and most describe more people than would admit to it.</p>" +
            "<p><em>Think of the times in the last twelve months when a statement applied to you, and say how well " +
            "it described you then.</em></p>",
    },

    // HiTOP-BR =============================================================
    // The Brief Report form of the Hierarchical Taxonomy of Psychopathology
    // self-report (Simms et al., 2026, "Assessment of the HiTOP Model:
    // Introducing the HiTOP-SR and HiTOP-BR", under review at Assessment), as
    // shipped in the {hitop} R package (github.com/jmgirard/hitop,
    // data-raw/hitopbr_items.csv): 45 statements about the last twelve months
    // on a 4-point scale, no reversed items, scored as the mean of each of six
    // spectra. Item keys follow the package's own item numbers under the
    // app's prefix, HITOP_01 to HITOP_45 (HBR_01 to HBR_45 until September
    // 2026), so a saved file goes into score_hitopbr() once the columns are
    // renamed HBR_nn, with the items in instrument order; their membership
    // below is the package's
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
        name: "Symptoms & Maladaptive Traits",
        // Asked, scored and saved, and fed back nowhere (September 2026): the
        // six spectra earned a spider chart and a row each on this level, and
        // it was dropped so that the level reads as one section — Mood &
        // Health — rather than as faces above a chart of symptoms. The norms
        // stay, being the one real set in the app and what an analysis will
        // want; `results: false` is what keeps them from opening a section,
        // and `profile: false` keeps the six off the whole-run web and card,
        // where on one polygon with Openness and Bodily Awareness they would
        // read as more of the same kind of thing, which they are not.
        results: false,
        profile: false,
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
        // its floor of 1 (Unusual Experiences' mean is 1.26), so the normal
        // percentile these are read through is coarse at the low end: a run of
        // "Not at all" comes out around the 30th percentile, not the 1st. The
        // interpretations are ours.
        //
        // THE SPECTRA ARE RENAMED FOR THE PUBLIC (September 2026). The HiTOP's
        // own names are clinical jargon, and two of them ("Thought Disorder",
        // "Antagonism") read as verdicts when handed back to the person who
        // answered. The dimensions here carry plainer names, and the mapping
        // is one-to-one so nothing about the scoring changes — the item keys
        // still carry the package's item numbers, and score_hitopbr() knows
        // nothing of the names:
        //
        //     Somatoform        → Bodily Complaints
        //     Internalizing     → Emotional Distress
        //     Thought Disorder  → Unusual Experiences
        //     Detachment        → Social Withdrawal
        //     Disinhibition     → Impulsivity
        //     Antagonism        → Dominance
        //
        // The interpretations are written in the same plain register, and each
        // high reading says in so many words that it is not a diagnosis.
        norms: {
            "Bodily Complaints": {
                mean: 1.82,
                sd: 0.71,
                interpretations: {
                    low: "your body has mostly kept quiet this year: few unexplained aches, and little worry about what a symptom might mean.",
                    mid: "you have had your share of aches, tiredness and the odd worry about your health, about as often as most people report.",
                    high: "you have been bothered by bodily symptoms, and by worry about what they mean, more than most people report. That is tiring to carry, and not on its own a sign of anything in particular.",
                },
            },
            "Emotional Distress": {
                mean: 1.85,
                sd: 0.77,
                interpretations: {
                    low: "worry, low mood and being hard on yourself have troubled you less this year than they do most people.",
                    mid: "worry, low moods and difficult memories have reached you about as often as they reach most people.",
                    high: "you have been weighed down by worry, strong moods or hard feelings about yourself more than most people report. This is common under strain, and not a diagnosis of anything.",
                },
            },
            "Unusual Experiences": {
                mean: 1.26,
                sd: 0.46,
                interpretations: {
                    low: "the line between what is real and what is imagined has held firm for you this year, as it does for most people.",
                    mid: "you have had the occasional moment where a daydream, a sensation or a memory felt more real than it should, about as often as most people report.",
                    high: "you have had more moments than most people report where a daydream, a sensation or your own body felt unreal or out of place. Such experiences are far more common than people admit, and mean nothing on their own.",
                },
            },
            "Social Withdrawal": {
                mean: 2.13,
                sd: 0.88,
                interpretations: {
                    low: "you have wanted company and closeness this year more than most people do, and found little appeal in being left alone.",
                    mid: "you have moved between wanting company and wanting to be left to yourself, much as most people do.",
                    high: "you have preferred your own company, and kept close relationships at arm's length, more than most people report. That suits some people well and wears on others.",
                },
            },
            Impulsivity: {
                mean: 1.65,
                sd: 0.6,
                interpretations: {
                    low: "you have planned, kept to time and thought before acting this year more reliably than most people.",
                    mid: "you have kept things broadly in order, with the odd missed deadline or snap decision, about as often as most people.",
                    high: "deadlines, plans and snap decisions have got away from you this year more often than most people report.",
                },
            },
            Dominance: {
                mean: 1.42,
                sd: 0.45,
                interpretations: {
                    low: "you have had little appetite this year for being in charge, being noticed or getting the better of other people.",
                    mid: "you have wanted your share of attention and influence, and taken the odd shortcut to get it, about as much as most people.",
                    high: "you have wanted to lead, to be noticed or to have an edge over other people more than most people admit to. Whether that is a good thing depends a lot on what it is aimed at.",
                },
            },
        },

        items: [
            { key: "HITOP_01", dimension: "Dominance", text: "I found it easy to deceive others." },
            { key: "HITOP_02", dimension: "Dominance", text: "I deserved special treatment." },
            { key: "HITOP_03", dimension: "Unusual Experiences", text: "I saw things that were not really there." },
            { key: "HITOP_04", dimension: "Unusual Experiences", text: "My fantasies felt very real to me." },
            { key: "HITOP_05", dimension: "Dominance", text: "I liked having power." },
            { key: "HITOP_06", dimension: "Bodily Complaints", text: "I felt something was wrong with my body." },
            { key: "HITOP_07", dimension: "Social Withdrawal", text: "When I had the chance, I chose to be alone rather than with other people." },
            { key: "HITOP_08", dimension: "Emotional Distress", text: "My moods were intense and unpredictable." },
            { key: "HITOP_09", dimension: "Emotional Distress", text: "My mind was flooded with troubling images of a bad experience." },
            { key: "HITOP_10", dimension: "Bodily Complaints", text: "I had pains in several parts of my body." },
            { key: "HITOP_11", dimension: "Unusual Experiences", text: "I felt like I was outside of my body." },
            { key: "HITOP_12", dimension: "Social Withdrawal", text: "I was happiest when I was alone." },
            { key: "HITOP_13", dimension: "Dominance", text: "I found it easy to manipulate others." },
            {
                key: "HITOP_14",
                dimension: "Bodily Complaints",
                text:
                    "I was bothered by several bodily symptoms (e.g., headache, fatigue or stomach problems) for which " +
                    "there was no clear or sufficient medical explanation.",
            },
            { key: "HITOP_15", dimension: "Impulsivity", text: "I had trouble planning and keeping to schedules." },
            { key: "HITOP_16", dimension: "Impulsivity", text: "I lost things that I needed." },
            { key: "HITOP_17", dimension: "Bodily Complaints", text: "I was frustrated with having to convince others I had a real illness." },
            { key: "HITOP_18", dimension: "Emotional Distress", text: "Even when I was very careful, I worried whether I had done something correctly." },
            { key: "HITOP_19", dimension: "Bodily Complaints", text: "Reading articles about disease made me worry about my health." },
            { key: "HITOP_20", dimension: "Impulsivity", text: "I paid my bills late or missed other important deadlines." },
            { key: "HITOP_21", dimension: "Bodily Complaints", text: "I could feel changes in my body." },
            { key: "HITOP_22", dimension: "Emotional Distress", text: "I was disgusted with myself." },
            { key: "HITOP_23", dimension: "Emotional Distress", text: "I felt on guard and on edge." },
            { key: "HITOP_24", dimension: "Impulsivity", text: "I was a messy person." },
            { key: "HITOP_25", dimension: "Dominance", text: "I did things to get others to notice me." },
            { key: "HITOP_26", dimension: "Bodily Complaints", text: "I noticed small changes to how my body feels." },
            { key: "HITOP_27", dimension: "Dominance", text: "Things went best when I told others what to do." },
            { key: "HITOP_28", dimension: "Unusual Experiences", text: "I heard things that no one else could hear." },
            { key: "HITOP_29", dimension: "Impulsivity", text: "I was never on time." },
            { key: "HITOP_30", dimension: "Social Withdrawal", text: "I had no interest in romantic relationships." },
            { key: "HITOP_31", dimension: "Social Withdrawal", text: "Romantic relationships seemed like a hassle to me." },
            { key: "HITOP_32", dimension: "Impulsivity", text: "I said things without thinking." },
            { key: "HITOP_33", dimension: "Dominance", text: "People told me I was coldhearted." },
            { key: "HITOP_34", dimension: "Impulsivity", text: "I made decisions quickly without thinking them through." },
            { key: "HITOP_35", dimension: "Impulsivity", text: "I quit tasks that became too challenging." },
            { key: "HITOP_36", dimension: "Emotional Distress", text: "I had a hard time asserting myself to others." },
            { key: "HITOP_37", dimension: "Social Withdrawal", text: "I felt that I did not want to be in a close relationship." },
            { key: "HITOP_38", dimension: "Unusual Experiences", text: "I had trouble telling whether something really happened or I just imagined it." },
            { key: "HITOP_39", dimension: "Unusual Experiences", text: "I felt that things around me were not real." },
            { key: "HITOP_40", dimension: "Dominance", text: "I liked attracting the attention of others." },
            { key: "HITOP_41", dimension: "Bodily Complaints", text: "I was afraid that I might suffer from a serious illness." },
            { key: "HITOP_42", dimension: "Emotional Distress", text: "I thought a lot about death." },
            { key: "HITOP_43", dimension: "Impulsivity", text: "I bought much more than I needed." },
            { key: "HITOP_44", dimension: "Emotional Distress", text: "I was overwhelmed by anxiety." },
            { key: "HITOP_45", dimension: "Dominance", text: "I expected to get treated better than others." },
            // The attention check. The scale is skewed towards its floor, so a
            // straightliner answering "Not at all" to everything would pass a
            // check written for that end: this one asks for the top of it, 4.
            // Keyed like every other level's check, prefix and `_AttentionCheck`:
            // no two-digit item pattern matches it, so `score_hitopbr()` cannot
            // mistake it for an item once the columns are renamed.
            {
                key: "HITOP_AttentionCheck",
                check: 4,
                text: "I read each of these statements carefully, and will answer \"A lot\" to this one.",
            },
        ],
    },
])
