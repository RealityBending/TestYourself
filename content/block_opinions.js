// Opinions — a level of its own: having asked what somebody is like and how
// they steer it, ask what they think of everybody else. Framed to the
// participant as "Where You Stand" (timeline.js).
//
// **What the block is for**, which is what decides whether something belongs
// in it. Two things:
//
//   1. **Where somebody leans politically**, in terms that can be set beside
//      the rest of the field: the one self-placement every survey asks, and
//      the two axes of attitude the literature agrees on (sharing against
//      markets, order against freedom). This half wants to stay small and
//      comparable, and is the plane on the results.
//   2. **What they make of the questions their own society is arguing
//      about** — the ones left and right answer badly, or split over: whether
//      fairness between groups means equal chances or equal outcomes, how
//      far to trust those in charge, whether people should be improved on or
//      selected, where differences between people come from, the climate,
//      the animals and how much beauty should count. This half is meant to move with the times, is
//      mostly written for the study rather than taken from a published
//      scale, and is the spectra under the plane. A question belongs here if
//      people who share a place on the plane still divide over it.
//
// Both are asked about **the country the person lives in** wherever the
// answer depends on it, which is why several items carry "In the country I
// live in…" over them and several more say so in their own words: "should government do more" means something different in Sweden and in
// the United States, and the person is the one who knows which they mean.
//
// **These are political opinions, and are data of that kind** — calling them
// views or opinions on screen does not change what they are for the purposes
// of UK GDPR (Article 9) or of the ethics application, which has to list them
// beside the health and ethnicity items it already declares (A5, A6).
//
// Why the axes are these and not the Political Compass's: a factor analysis
// of many policy items finds one strong left-right factor running through
// nearly all of them, and the dimensions that stand apart from it are few
// (Kirkegaard, 2026, on the ANES 2024; the ESS and BSA literature agrees on
// economic against social as the minimum). So the plane is drawn on the two
// best-established axes, each worded as what it is about — sharing against
// markets, order against freedom — rather than as "left", "liberal" or
// "authoritarian", and the newer oppositions are asked as spectra of their
// own rather than squeezed onto the plane. "Strong state" is deliberately
// on neither axis: a socialist and a law-and-order conservative both want
// one, for different things.
//
// **Three questionnaires, and the third is nearly everything.** The
// self-placement is asked first, before any statement can lean on it; the
// CMQ straight after it, being the one answered on a slider; then every
// statement of the level in **one** questionnaire, `views`, so that they are
// shuffled in among one another (September 2026). They were five
// questionnaires until then — the BSA, equal outcomes, human nature, the
// climate and the animals, beauty — and a questionnaire is the unit of
// shuffling, so each arrived as a run of its own: four statements about
// equality of outcomes in a row say what they are measuring, and the ones
// after it are answered knowing. Dealt in among thirty others, an item is
// just an item. Each scale is still its own dimension with its own norms,
// and the comments below keep each one's provenance together, so nothing is
// lost by the merge but the runs.
//
// **Every item here may be adapted, and many are** (September 2026, the
// author's call): wording that is unclear, idealistic, loaded or a double
// negative is rewritten rather than kept for the sake of a published scale,
// and validating the result is part of the project. Each adapted item says,
// in a comment beside it, what it was adapted from and why; its key keeps
// the source's prefix, so the saved file still says which scale it came out
// of, and none of them is to be pooled with the source's data as the same
// item.
//
// **Every key on the level starts `Opinion_`** (September 2026), so that the
// whole level can be picked out of a saved file by its prefix, the way the
// three demographics questionnaires are by `Demographics_`. This bends the
// rule that a key's prefix is the instrument: most of what is asked here is
// custom, and the level is its instrument. Where an item does come out of a
// published scale, the source is the second segment — `Opinion_ESS_LeftRight`,
// `Opinion_CMQ_1`, `Opinion_BSA_LibAuth_2` — so the file still says where it
// came from; a custom scale's second segment is its dimension
// (`Opinion_Parity_1`). Renamed before any run was saved under the old keys
// (`BSA_`, `CMQ_`, `ESS_`, `Frontiers_`, `Outcomes_`, `Nature_`, `Beauty_`), so
// there is nothing to coalesce.
//
// **Trimmed from 43 items to 35** (September 2026): the level was asked with
// no scale under three items and one at seven, and the cuts were made for
// overlap and for validity rather than for length alone — each is noted where
// its scale is written up below. No scale is now above four items or below
// three.
//
// Read back together as one figure (js/figures/stance.js): the two
// BSA-derived scales as a plane, the other seven dimensions as spectra under
// it. All
// are `profile: false` — nine more axes would crowd the whole-run web, and a
// person's politics has no business on a card made to be shared.
//
// **No attention check** (September 2026). The level had one, dealt in among
// the BSA statements, and among statements about politics an instruction to
// press "Disagree" stood out more than anywhere else in the run — the one
// place a participant is most likely to wonder what the study is checking
// for. The other levels' checks, the response times and the closing
// seriousness item are enough.
defineBlock("opinions", [
    {
        type: "briefing",
        key: "Briefing_Opinions",
        text:
            "<h2>Where you stand.</h2>" +
            "<p>This part asks what you think about society, humans, culture and progress.</p>" +
            "<p>None of these has a right answer, and people who agree on one often disagree on the next.</p>" +
            "<p><em>Answer with what you actually think, not with what you think you are supposed to think.</em></p>",
    },

    // Left-right self-placement ============================================
    // The European Social Survey's item (`lrscale`), worded as the ESS words
    // it less "using this card". The one place on the level the words left
    // and right appear, and on purpose: it measures political identity, which
    // is a different thing from the positions the statements below measure,
    // and it is the single most-asked item in political science, so a saved
    // file can be set beside almost any survey there is. Asked first, before
    // any statement can colour it. No dimension and no norms: it is saved and
    // read back to nobody. The ESS offers "Don't know" beside the eleven
    // points; the engine cannot set a labelled way out beside numbered
    // circles, so it is not offered, and somebody with no place on the line
    // is left the middle — a known compromise, worth remembering at analysis.
    {
        key: "leftright",
        name: "Left and Right",
        profile: false,
        items: [
            {
                key: "Opinion_ESS_LeftRight",
                format: {
                    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    anchors: ["Left", "Right"],
                    color: "#94a3b8",
                },
                text: 'In politics people sometimes talk of "left" and "right". Where would you place yourself on this scale, where 0 means the left and 10 means the right?',
            },
        ],
    },

    // CMQ ==================================================================
    // The Conspiracy Mentality Questionnaire (Bruder, Haffke, Neave,
    // Nouripanah & Imhoff, 2013, Frontiers in Psychology, 4, 225), a general
    // disposition to see hidden hands behind events rather than belief in any
    // particular theory — which is what keeps it usable across countries and
    // years. Its scale is a likelihood from 0% (certainly not) to 100%
    // (certain), published as eleven steps of ten; here it is a **slider**
    // from 0 to 100, the scale the instrument describes. What is saved is the
    // percentage; divide by ten to set it beside the eleven-step
    // administrations.
    //
    // **Three of the five items** (September 2026), the three with the
    // highest corrected item-total correlations in the original validation
    // (Table 1; English / German / Turkish): 5 "secret organizations" (.74 /
    // .73 / .57), 4 "events… secret activities" (.70 / .72 / .65) and 1
    // "important things… never informed about" (.62 / .63 / .48). Left out:
    // 2, "politicians usually do not tell us the true motives for their
    // decisions" (.56 / .55 / .46), the weakest, and 3, "government agencies
    // closely monitor all citizens" (.62 / .60 / .37), which Swami et al.
    // (2017, PLOS ONE, 12(2), e0172617) single out as a belief that may be
    // simply factual rather than conspiracist — and whose ground the Order
    // item on surveillance now covers as an opinion. Swami et al. also found
    // the five-item CMQ's one-factor fit poor, with correlated errors
    // between items 1, 2 and 3; dropping two of those three is the cheap
    // half of that remedy. Item 2 was also what made the scale a stand-in
    // for distrust of those in charge, which it now is only loosely.
    //
    // In the English version's wording except the fourth, reworded (key
    // unchanged): verbatim "I think that events which superficially seem
    // to lack a connection are often the result of secret activities",
    // which read as stilted and hard to parse. No examples were added to it: any named
    // event would ask about that event's own conspiracy theory rather than
    // the general disposition the scale is for.
    //
    // **Verified against the English items in Bruder et al. (2013, Table 1)
    // on 23 September 2026**: items 1 and 5 were verbatim, stem included,
    // until adapted below; item 4 is the reworded one, as said above; the
    // endpoints were the paper's ("certainly not", "certain"), and the
    // item-total correlations quoted above are its. The paper's instruction is "please use the respective
    // rating scale to indicate how likely it is in your opinion that the
    // statement is true"; the one-line stem over the slider says the same
    // thing shorter.
    //
    // **Adapted since** (23 September 2026, after a participant's report):
    // the stem and the ends did not agree. "How likely is it that this is
    // true?" asks for a probability, while "I think that…" at the head of
    // each item asked whether the person agrees, and "certainly not" against
    // "certain" are not two ends of one thing. So the "I think that" is
    // gone from all three — what is judged is the claim, and the stem
    // already says it is the person's judgement — and the ends are
    // "Certainly false" and "Certainly true", the two poles of the question
    // asked. The paper's own instruction ("how likely it is in your opinion
    // that the statement is true") shows the likelihood reading is the one
    // meant. Keys unchanged, but none of the three is now the published
    // item, and none is pooled with CMQ data as though it were.
    //
    // One dimension under a plain name, Suspicion. Read back as one of the
    // spectra.
    {
        key: "cmq",
        name: "Suspicion",
        profile: false,
        instructions: "How likely is it that this is true?",
        type: "slider",
        format: {
            min: 0,
            max: 100,
            unit: "%",
            anchors: ["Certainly false", "Certainly true"],
            color: "#6aa7f0",
        },

        // PLACEHOLDER norms, invented: the CMQ tends to sit a little above
        // the middle of its scale, and this is a guess at that in percent.
        norms: {
            Suspicion: { mean: 56, sd: 20 },
        },

        items: [
            {
                key: "Opinion_CMQ_1",
                dimension: "Suspicion",
                // Source: "I think that many very important things happen in the
                // world, which the public is never informed about."
                text: "Many very important things happen in the world which the public is never informed about",
            },
            {
                key: "Opinion_CMQ_4",
                dimension: "Suspicion",
                text: "Many events which seem unrelated or accidental are in fact the result of secret activities",
            },
            {
                key: "Opinion_CMQ_5",
                dimension: "Suspicion",
                // Source: "I think that there are secret organizations that
                // greatly influence political decisions."
                text: "There are secret organizations that greatly influence political decisions",
            },
        ],
    },

    // Views: every statement of the level, in one shuffled run ===========
    // Seven scales and two single items, on the BSA's five labels, dealt in
    // among one another (see the head of the file for why they are one
    // questionnaire). No instruction over them — the labels already say it
    // is a matter of agreeing — except the BSA-derived items, which carry
    // "In the country I live in…" as their own, since whose government,
    // whose law and whose wealth is the question they depend on.
    //
    // The scales, each written up where its items begin below:
    //
    //   Sharing, Order   adapted from the British Social Attitudes scales:
    //                    the plane.
    //   Parity           equal outcomes against equal chances between groups.
    //   Enhancement,     human nature and its future.
    //   Heredity
    //   Planet, Animals  the climate and the animals.
    //   Beauty           beauty against purpose.
    //
    // All norms are PLACEHOLDERS, invented, read only for where the average
    // person is marked on the figure — and they are what put each dimension
    // on the level at all.
    {
        key: "views",
        name: "Views",
        profile: false,
        instructions: "",
        format: {
            options: [
                { value: 1, text: "Disagree strongly" },
                { value: 2, text: "Disagree" },
                { value: 3, text: "Neither agree nor disagree" },
                { value: 4, text: "Agree" },
                { value: 5, text: "Agree strongly" },
            ],
            columns: 5,
            color: "#e8a13a",
        },

        norms: {
            // The BSA publishes its scale means each year (a British sample,
            // and a sum rather than a mean per item); these are guesses in
            // per-item units, a little left of centre and a little
            // authoritarian, which is where the British public has sat.
            Sharing: { mean: 3.6, sd: 0.75 },
            Order: { mean: 3.4, sd: 0.75 },
            // Scales never asked: guesses at or near the middle.
            Parity: { mean: 2.8, sd: 0.9 },
            Enhancement: { mean: 2.8, sd: 0.8 },
            Heredity: { mean: 2.9, sd: 0.7 },
            Planet: { mean: 3.4, sd: 0.8 },
            Animals: { mean: 3.0, sd: 0.8 },
            Beauty: { mean: 3.0, sd: 0.7 },
        },

        items: [
            // Sharing and Order ================================================
            // Adapted from the two attitude scales the British Social Attitudes
            // survey has carried every year since 1986 (Evans, Heath & Lalljee,
            // 1996, British Journal of Sociology, 47(1), 93-112), on the
            // survey's own five labels. The left-right scale has five items
            // and the libertarian-authoritarian six; the ones kept started as
            // those that travel outside Britain (the management item, the
            // death penalty and censorship left out, "British" dropped from
            // "traditional British values"). As published, every item is
            // keyed the same way, which leaves both open to acquiescence; one
            // item a side is reversed.
            //
            // **Adapted, not verbatim** (September 2026): each item quotes its
            // source and says why it changed. The keys keep the BSA prefix and
            // the BSA's item number where the item is still recognisably the
            // BSA's; the ones written for the scale say what they are about in
            // their key instead.
            //
            // **Source wordings verified on 23 September 2026** against the
            // scales as the BSA and the Scottish Social Attitudes survey
            // publish them (gov.scot, SSA 2023, Annex A): every quotation
            // below is exact. The check found one thing wrong — "The law
            // should always be obeyed…" is the libertarian-authoritarian
            // scale's item **5**, item 4 being "Schools should teach
            // children to obey authority", and it was keyed `_4`; renamed
            // `_5` the same day, before any run was saved under it. The
            // BSA's order, for the record — left-right: redistribute, big
            // business, fair share, one law, management; libertarian-
            // authoritarian: traditional values, stiffer sentences, death
            // penalty, obey authority, law obeyed, censorship. Both on
            // "agree strongly" to "disagree strongly", the five labels used
            // here.
            //
            // Sharing (agreeing that wealth should be shared out) and Order
            // (agreeing that rules, the law and settled ways should be upheld)
            // are the plane's two axes. **Three items a side** since September
            // 2026: the BSA's "Big business benefits owners at the expense of
            // workers" went from Sharing as a second perceived-unfairness item
            // beside "fair share", the more loaded of the two; and the free
            // speech item written for Order ("People should be allowed to
            // spread, teach and research ideas I find abhorrent, even, for
            // instance, that some people's lives are worth less than others'")
            // went because it was the item least likely to load with the other
            // four — free speech for abhorrent views cuts across left and right
            // where the rest of the scale does not, and in the present climate
            // leans the other way — and was the longest item on the level,
            // reversed, with an example that would have carried the response.
            // Order has four items and Sharing three, one of each reversed.

            // BSA: "Government should redistribute income from the better off
            // to those who are less well off". As published it can be agreed
            // with as an ideal by somebody who thinks their country already
            // does too much of it; what divides people is whether it should do
            // more than it does now.
            {
                key: "Opinion_BSA_LeftRight_1",
                dimension: "Sharing",
                instructions: "In the country I live in…",
                text: "The government should do more to redistribute income from the better off to those who are less well off",
            },
            // BSA, "the nation's wealth" made "the country's", the frame having
            // said which country. The BSA's item 3, kept under its number.
            {
                key: "Opinion_BSA_LeftRight_3",
                dimension: "Sharing",
                instructions: "In the country I live in…",
                text: "Ordinary working people do not get their fair share of the country's wealth",
            },
            // Not the BSA's: the markets end, written for this scale, in place
            // of "There is one law for the rich and one for the poor" — a
            // slogan more than a position, and the same unfairness the other
            // two already ask about.
            {
                key: "Opinion_BSA_LeftRight_Markets",
                dimension: "Sharing",
                reverse: true,
                instructions: "In the country I live in…",
                text: "Businesses should be free to make as much profit as they can, with as little interference from government as possible",
            },
            // In place of the BSA's "Young people today don't have enough
            // respect for traditional values", and reversed: agreeing is the
            // freedom end. As published it is close to a claim of fact —
            // somebody may agree that respect has declined and be glad of it.
            // A normative rewrite with examples ("Society is better off when
            // people hold on to traditional values, such as family, marriage
            // and good manners") stood here until September 2026, and had a
            // ceiling: nearly everybody endorses family and good manners, so
            // marriage carried the item alone. A version setting tradition
            // against "each living as they please" was tried and dropped for
            // pulling in personal freedom as a second thing to react to. Now
            // the person's own life against their country's tradition, which
            // is the trade-off the scale is about — and the one reversed item
            // Order has, so it carries the acquiescence check for the side.
            // The item names the country itself, so it takes no "In the
            // country I live in…" over it.
            {
                key: "Opinion_BSA_LibAuth_Tradition",
                dimension: "Order",
                reverse: true,
                text: "How people choose to live, marry or raise a family is their own business, even when it goes against my country's tradition and culture",
            },
            { key: "Opinion_BSA_LibAuth_2", dimension: "Order", instructions: "In the country I live in…", text: "People who break the law should be given stiffer sentences" },
            // BSA item 5: "…even if a particular law is wrong". Wrong by whose
            // lights is the whole question, so it is the person's own.
            {
                key: "Opinion_BSA_LibAuth_5",
                dimension: "Order",
                instructions: "In the country I live in…",
                text: "The law should always be obeyed, even if I think a particular law is wrong",
            },
            // Not the BSA's, in place of "Schools should teach children to obey
            // authority", which reads as either unobjectionable (children do
            // what the teacher says) or sinister (blind obedience) depending on
            // the reader. Order against freedom as it is argued now: security
            // against privacy, a trade-off with no decent end.
            {
                key: "Opinion_BSA_LibAuth_Surveillance",
                dimension: "Order",
                instructions: "In the country I live in…",
                text: "The police should have more power to monitor people's activities to prevent crime, even at the cost of privacy",
            },

            // Parity ==========================================================
            // Custom, not validated (September 2026), in place of the four
            // anti-egalitarianism items of the SDO7(s) (Ho et al., 2015). Those
            // asked about "group equality" in the abstract, two of them as
            // negations that read as double negatives, and "group equality"
            // could be taken as equal rights, which nearly everybody endorses.
            // What actually divides people is **equality of outcomes against
            // equality of opportunity** — the opposition the recent scales of
            // "critical social justice" or "woke" attitudes circle round —
            // asked head on, with the cases that make it bite. Two each way,
            // every one a positive statement of its own view: two propositions
            // (outcomes against chances in general, and representation against
            // qualification in particular), each asked from both sides.
            // Deliberately about groups rather than income, which is Sharing.
            {
                key: "Opinion_Parity_1",
                dimension: "Parity",
                text: "A fair society is one where men and women, and people of every background, end up equally well off, not just one where they have the same chances",
            },
            {
                key: "Opinion_Parity_2",
                dimension: "Parity",
                text: "When a group, such as women or minorities, is under-represented in top jobs, in parliament or at university, steps should be taken until it is represented in proportion to its size",
            },
            {
                key: "Opinion_Parity_3",
                dimension: "Parity",
                reverse: true,
                text: "As long as everyone has the same chances, it is fair for some groups to end up doing better than others",
            },
            {
                key: "Opinion_Parity_4",
                dimension: "Parity",
                reverse: true,
                text: "Opportunities such as jobs or university places should go to the best-qualified candidates, whatever their background, even if that leaves some groups under-represented",
            },
            // Diversity of views against diversity of people, as a trade-off.
            // Custom and **not scored** (no dimension, a scale of its own): it
            // is not yet known whether it lines up with Parity, and it is kept
            // to find out. It asked "even if they all come from similar
            // backgrounds" against "even if they all think alike" until
            // September 2026, and the second clause made the views end the
            // obvious one; now each end is stated plainly and the trade-off
            // left to the question.
            {
                key: "Opinion_Diversity",
                text: "When choosing the members of a body such as a parliament, a company board or a panel of experts, which matters more to you: that they bring a range of different views, or that they come from a range of different backgrounds?",
                format: {
                    options: [1, 2, 3, 4, 5],
                    anchors: ["A range of views", "A range of backgrounds"],
                    color: "#b58cf0",
                },
            },

            // Enhancement and Heredity ========================================
            // Custom, not validated: two oppositions that stand apart from the
            // left-right factor more than most, and for which no short scale
            // was found worth taking whole.
            //
            //   Enhancement  transhumanism against bioconservatism: whether
            //                technology should be used to improve on human
            //                nature, and whether children should be chosen by
            //                their genes. Higher is more in favour. (Published
            //                neighbours: the Pew human-enhancement items,
            //                2016.) **Four items, one theme apiece, two each
            //                way** (September 2026; it was seven): oneself
            //                enhanced, immortality, the principle and
            //                selection. Three went — "Parents should be
            //                allowed to use genetic technology to give their
            //                children better health and abilities" (children
            //                are covered by the selection item, and "health"
            //                is the end nearly everybody accepts); "If tests
            //                during pregnancy show that the child would have a
            //                serious genetic condition, it is right to end the
            //                pregnancy" (an abortion item, driven by
            //                religiosity and disability-rights views rather
            //                than by anything transhumanist — the highest
            //                validity risk on the level); and "People choosing
            //                a sperm or egg donor should be free to pick the
            //                one with the best genes for health, intelligence
            //                or looks" (a third children item, triple-barrelled,
            //                and "looks" would have carried it).
            //   Heredity     hereditarian against environmental beliefs about
            //                where differences between individuals come from —
            //                deliberately not between groups. Higher is more
            //                hereditarian. (Published neighbour: Keller's
            //                Belief in Genetic Determinism scale, 2005.) Three
            //                items, one reversed (September 2026; it was four):
            //                "With the right upbringing and education, almost
            //                anyone could become almost anything" went as
            //                blank-slate absolutism that overlapped the
            //                intelligence item and picked up growth mindset.
            {
                key: "Opinion_Enhancement_1",
                dimension: "Enhancement",
                text: "If it were safe, I would take a treatment that made me more intelligent",
            },
            // "Living far beyond a natural lifespan is not something people
            // should aim for" until September 2026: a reversed item built on a
            // negation, which is the classic misread, and a hedge on the
            // timescale. Now the goal itself, asked straight, and positive.
            {
                key: "Opinion_Enhancement_2",
                dimension: "Enhancement",
                text: "It is good that we try to develop technology that would let people live for ever",
            },
            {
                key: "Opinion_Enhancement_3",
                dimension: "Enhancement",
                reverse: true,
                text: "There is something wrong with using technology to improve on human nature",
            },
            // "Choosing which children are born according to their genes is
            // wrong, whatever the reason" until September 2026: "whatever the
            // reason" made it absolute, and most people disagreed with it.
            // The two clauses now take the safety and the inequality
            // objections off the table, so what is left to disagree with is
            // the bioconservative principle itself.
            {
                key: "Opinion_Enhancement_4",
                dimension: "Enhancement",
                reverse: true,
                text: "Parents should not be allowed to choose their children's traits, even if the technology were safe and available to everyone",
            },
            {
                key: "Opinion_Heredity_1",
                dimension: "Heredity",
                text: "Differences in intelligence between people are mostly down to their genes",
            },
            { key: "Opinion_Heredity_2", dimension: "Heredity", text: "A person's character is largely there from birth" },
            {
                key: "Opinion_Heredity_3",
                dimension: "Heredity",
                reverse: true,
                text: "The differences in how people behave are mostly the result of how they were raised",
            },

            // Planet and Animals ==============================================
            // Custom, not validated (September 2026): questions a society is
            // arguing about that left and right answer badly.
            //
            //   Planet   the climate weighed against its costs: higher puts the
            //            climate first. Asked as trade-offs, not as whether the
            //            climate matters, which nearly everybody agrees with —
            //            which is why "The dangers of climate change have been
            //            exaggerated" went in September 2026: a claim of fact
            //            rather than a trade-off (the same reason the animal
            //            consciousness item went), and saturated with
            //            left-right, so it repeated the plane rather than
            //            adding to the spectrum. A reversed trade-off, the
            //            mirror of the first item, stands in its place. Four
            //            items, two reversed. Its far end is where
            //            **degrowth** sits — the movement for deliberately
            //            shrinking rich economies for the planet's sake, a real
            //            position with its own literature — and the first item
            //            (the climate before growth) is its nearest; the scale
            //            overlaps it without being it, and degrowth as such
            //            would want items of its own (whether growth itself is
            //            the problem, not merely less important).
            //   Animals  the moral standing of animals: whether what we owe
            //            them should limit what we do to them. Higher gives
            //            them more. Three items, one positive and two
            //            reversed: "Animals such as pigs and cows are
            //            conscious…" went in September 2026, being a claim of
            //            fact rather than a trade-off, and a fourth, if it is
            //            wanted, should be on the giving-more side.
            //
            // `Opinion_Nuclear` carries **no dimension**: a place where people
            // who care about the environment disagree with one another (the
            // waste against the emissions). A second such probe, the turbines
            // against a beautiful landscape, went in September 2026: read back
            // to nobody, and a beauty-against-utility trade-off that would
            // have cross-loaded on Beauty under a Planet key. `Opinion_Diet` is
            // a behaviour, asked on its own options, written last and held
            // there (`shuffle: false`) so that it comes after the statements
            // rather than in among them; it stays as the one known-groups
            // check the Animals scale has. Both are saved and read back to
            // nobody.
            {
                key: "Opinion_Planet_1",
                dimension: "Planet",
                text: "Tackling climate change should come first, even if it means slower economic growth",
            },
            {
                key: "Opinion_Planet_2",
                dimension: "Planet",
                text: "I would accept paying more for fuel, flights and heating if it helped cut carbon emissions",
            },
            {
                key: "Opinion_Planet_3",
                dimension: "Planet",
                reverse: true,
                text: "Jobs and cheap energy should come before cutting carbon emissions",
            },
            {
                key: "Opinion_Planet_4",
                dimension: "Planet",
                reverse: true,
                text: "New technology will deal with climate change without people having to change how they live",
            },
            {
                key: "Opinion_Animals_1",
                dimension: "Animals",
                text: "It is wrong to kill animals for food when people can live healthily without meat",
            },
            // "…if it could save human lives" until September 2026, which made
            // it a question nobody but the most committed says no to.
            {
                key: "Opinion_Animals_2",
                dimension: "Animals",
                reverse: true,
                text: "Using animals in medical research is acceptable if it might help people",
            },
            {
                key: "Opinion_Animals_3",
                dimension: "Animals",
                reverse: true,
                text: "People matter more than animals, and it is right to put our needs first",
            },
            {
                key: "Opinion_Nuclear",
                text: "The country I live in should build more nuclear power stations",
            },

            // Beauty ==========================================================
            // Custom, not validated (September 2026): how much beauty should
            // count when it competes with the other things a thing is for — its
            // cost and its use. A value, not the disposition of seeking beauty
            // out (that is `Aesthetics_Beauty` on level 1). Published
            // neighbours: the aesthetic value of the Allport-Vernon-Lindzey
            // Study of Values, and "a world of beauty" among Schwartz's values.
            // Chosen so that **neither end is the decent answer**: nothing sets
            // beauty against helping people, which would measure who wants to
            // look kind. Three items, one reversed (September 2026; it was
            // four): "A work of art matters more for what it says than for how
            // beautiful it is" went as a question of art criticism — meaning
            // against beauty — unlikely to move with the cost-and-use
            // trade-offs the other three ask, and "matters" was ambiguous.
            // (The second asked whether the cathedrals and palaces of the past
            // were worth what they cost, until it was judged too culturally
            // particular.)
            {
                key: "Opinion_Beauty_1",
                dimension: "Beauty",
                text: "New public buildings should be beautiful, even if that makes them cost more",
            },
            {
                key: "Opinion_Beauty_2",
                dimension: "Beauty",
                text: "It is right to fund beautiful things with no practical use, such as art or monuments, even at the expense of things that are useful",
            },
            {
                key: "Opinion_Beauty_3",
                dimension: "Beauty",
                reverse: true,
                text: "How well a thing works matters more than how it looks",
            },

            // Last, and held there (see Planet and Animals, above).
            {
                key: "Opinion_Diet",
                shuffle: false,
                text: "Which best describes what you eat?",
                format: {
                    options: [
                        { value: 1, text: "I eat meat most days" },
                        { value: 2, text: "I eat meat, but try to eat less of it" },
                        { value: 3, text: "I eat fish, but not meat" },
                        { value: 4, text: "Vegetarian" },
                        { value: 5, text: "Vegan" },
                        { value: 99, text: "Something else", custom: true, small: true },
                    ],
                    columns: 1,
                    color: "#7cc46a",
                },
            },
        ],
    },
])
