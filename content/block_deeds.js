/* ==========================================================================
   content/block_deeds.js — the deeds of the Light & Dark level: twelve
   wrongs and twelve good deeds, each a grid, which are the balance's two
   pans (js/figures/balance.js). One of the level's three blocks, with `dark`
   (the briefing, and the level's notes at the head of content/block_dark.js)
   and `lies` (content/block_lies.js). This one and the lies are asked in an
   order drawn for each run (content/timeline.js), and the three come and go
   together (HELD_TOGETHER). A name in capitals in brackets — THE PLAN,
   RESULTS, WHAT WAS CUT, ETHICS, OPEN — is a section of the head of
   content/block_dark.js; THE DEEDS, SCORING, THE LADDER and THE GOOD DEEDS
   are here.
   ========================================================================== */

// THE DEEDS. Twelve ordinary wrongs, each one screen, each answered as a cell of
// a grid (`type: "grid"`, the kinks' pattern): across, whether you have done
// it — Never, and I wouldn't / Never, but I would if it came to it / Once /
// More than once — and down, how you feel about it — Guilty / Indifferent /
// Pleased. Two scales at one press, and the second is what makes a tick-list
// a measure: a deed alone is a count, a deed with the feeling that goes with
// it is two of the oldest constructs in the field at once. Lack of remorse
// is a core PCL-R item, which the self-report inventories reach for with
// abstract statements; guilt-proneness is what the GASP measures with
// invented scenarios and "how likely would you feel bad". The grid gives
// both anchored on acts the person actually did, which is a better
// measurement than either instrument's hypotheticals, and it costs no
// separate scale (WHAT WAS CUT, Guilt-proneness). The cells mean distinct
// things: done and guilty is the ordinary transgressor, which is most
// people; done and indifferent is callousness proper, the remorseless cell
// psychopathy is defined by; done and pleased is appetitive wrongdoing,
// which for the aggressive deeds is behavioural sadism — the CAST's "I have
// hurt people for my own enjoyment" as a fact rather than a statement; and
// never done and pleased is appetite without the act, the kinks' "turns me
// on, never done" cell, which no self-report scale reaches.
//
// The stance is a STANCE and not a pleasure rating — Guilty / Indifferent /
// Pleased, three words, tense-free, so that one header serves the deed you
// did last year and the deed you never did, and "pleased" reads naturally
// for lying on a CV (pleased with yourself for getting away with it), where
// "enjoyed" does not. The list needs deeds where "pleased" is plausible for
// somebody who is no sadist — an excuse to get out of plans, a film
// downloaded — so that the row is not only a cruelty detector.
//
// A FOURTH ROW, CONSIDERED AND NOT ADDED (November 2026): "It wasn't wrong"
// under the wrongs (and "Only what anyone would do" under the good deeds),
// so that Indifferent stops holding three different people — the callous
// one, the one who has forgotten and the one who thinks the act was no
// wrong — and the self-justifying answer, which is moral disengagement at
// the level of the act and most of what the MD-8 measured (WHAT WAS CUT,
// the biggest loss), has a cell of its own. FOR: it is the cheapest way
// back to neutralisation, the construct the forensic literature ties most
// closely to reoffending; the renderer already draws four rows (the
// kinks'); and on the good deeds the mirror row would part modesty from
// habit, which Indifferent now blends. AGAINST: the stance stops being a
// feeling — Guilty, Indifferent and Pleased are how you feel, "It wasn't
// wrong" is a judgment, and a row that mixes the two reads less cleanly and
// loses the tense-free symmetry the three words have; a fourth row makes
// the table taller on a phone, where the grid is already the tightest
// screen of the run; the good deeds' mirror is weak ("only what anyone
// would do" is also what a modest person says, so it reads as modesty
// either way); and somebody both pleased and sure it was no wrong is
// forced into one cell of the two. The MD-8 as four of its items in the
// student battery gives disengagement as a trait without touching the
// grid. Decide with the first crowd: if Indifferent carries most of the
// done cells, it is holding too much and the row is wanted.
//
// The across axis is one ordered scale of involvement, and its first two
// columns split the hard never from the willing never. That split has a
// precedent with real predictive validity: the susceptibility index in
// smoking research asks never-smokers whether they would try one if a friend
// offered, and that single split predicts who takes it up years later far
// better than any attitude item. "Never, and I wouldn't" and "Never, but I
// would if it came to it" are different people, and the second is the one a
// forensic student most wants to find — willingness is the nearest thing to
// a behaviour that a person who has not yet had the occasion can report.
// "If it came to it" is deliberately wide, covering need and opportunity
// both; splitting those would be a fifth column for a distinction the data
// could not hold. It reads oddly against "hit somebody in anger", since
// anger is not planned for, and there alone the column means "I could see
// myself doing it" rather than "I would choose to"; accepted. Three columns
// of frequency rather than the kinks' four, since deeds are heavy-tailed and
// "several times" against "regularly" tells nothing for rare acts. The kinks'
// own first row, "Never / not yet", blends exactly these two answers and
// could borrow the split.
//
// SCORING (October 2026): each deed feeds one side, off the across axis of its
// grid — a wrong done counts towards Dark Side and a good deed done towards
// Light Side, 1 in the Once and More than once columns and 0 in either never
// column (the column's `score:`), so each side is the share of its ladder
// done. That is a variety score, the count the self-report delinquency
// literature prefers to a sum of frequencies, and the same count on both
// sides, so that the two pans are weighed alike. The balance the level closes
// on weighs them (js/figures/balance.js), each a standing against an invented
// crowd until the app has its own. Until October 2026 the wrongs fed both
// sides, Light Side the share never done and Dark Side the share that
// pleased; the first was restraint rather than goodness, which is what the
// good deeds are for, and the second is still in the words. "I'd rather not
// say" leaves a deed out, and each side is read while two thirds of its deeds
// are answered (`enough`, the kinks' rule). The row stays in the words for
// the analysis ("Once · Pleased"), and so does the willing column; scoring a
// row as a dimension of its own is what `dimension` as a list is for
// (AGENTS.md, **Scoring**). Two more scores fall out at analysis time:
// experienced remorse, the mean stance over deeds done, and anticipated
// remorse over deeds not done — different constructs, not to be pooled, and
// the first has the denominator problem AGENTS.md describes for shares, since
// somebody who did one deed has a remorse score made of one cell. The cell
// never-and-wouldn't against Pleased is close to a contradiction, like
// the kinks' disgusted-but-part-of-my-sex-life cell, and earns its keep the
// same way: a check on whether the table is being read, and otherwise the
// restraint cell — the person who would enjoy it and still never would,
// which is not an empty category.
//
// THE LADDER. Twelve deeds from the near-universal to the rare, a rung or
// two in every band, so that the count tells people apart at both ends and
// not only in the middle (the kinks' rule), and every kind of wrong keeping
// a rung: dishonesty (the excuse, the blame, the CV), taking (piracy at the
// common end, the wallet in the middle, stealing from somebody close at the
// rare end — which tells people apart far better than shoplifting did, and
// is why shoplifting came off), betrayal (infidelity) and five cruelties or
// aggressions (mocking, damage, hitting, threatening, an animal) — more than
// any delinquency scale carries at this length, since that is the forensic
// interest, so the Pleased column will mostly be read off those five. The
// `~` share beside each is a GUESS at the share of adults who have ever done
// it, from the self-report delinquency literature and the B-ABS (Pechorro et
// al., 2021), to be replaced by the app's own data and the ladder re-spaced
// (the two at the foot share a guess, which the first crowd will settle);
// nothing on screen reads them. Hitting in anger and threatening to get
// something are the RPQ's reactive and proactive aggression as deeds.
// Arrests, convictions and the police are not on the list (ETHICS), nor is
// anything sexual, drugs or fare-dodging. A deed wants to be CULTURE-NEUTRAL
// and to ASSUME NOTHING about the person's life — no car, no job, no one
// country's law — which is why drink-driving came off the list (October
// 2026) and cheating on an exam with it, as the most age-bound; a partner is
// the one assumption kept, infidelity being too central to leave out, and a
// deed somebody never had the occasion for is still answerable, the two
// never columns being hypothetical. "I'd rather not say" is the way out
// under every table.
//
// Each is a question in two parts: its stem, "Have you ever…", is the
// questionnaire's instructions over the box, where a stem shared by every
// item belongs (AGENTS.md, **The stem belongs over the box, not in it**),
// and the item is the rest of it, "…cheated on a partner?". The columns are
// in the person's own voice, so the screen reads as a question and its
// answer: Have you ever cheated on a partner? Never, and I wouldn't. Until
// October 2026 the stem was the drinking game's "Never have I ever…", written
// into every item, which was fun for whoever knew the game and a puzzle for
// whoever did not — on a test asked in many countries and by people
// answering in a second language, a reason to drop it whatever it added —
// and then, briefly, "I have…".
//
// Keys `Deed_<Name>`, a word for the deed and never a number, the opinions
// level's rule, so the file reads without the codebook.
//
// THE GOOD DEEDS. Twelve kindnesses on a ladder of their own, asked in the same
// words and the same grid and shuffled in among the wrongs, so that the run is
// not a string of confessions and nothing says which kind of deed is the
// point. They are the light side, and they are deeds rather than a trait
// scale for the reason in THE FRAME: what people do for others and what they
// do against them vary separately (Krueger, Hicks & McGue, 2001), where the
// trait measures of a light side are mostly the dark side reversed (WHAT WAS
// CUT, Light Triad). The anchor is the Self-Report Altruism Scale (Rushton,
// Chrisjohn & Fekken, 1981), which Krueger used, whose answers are already a
// count of how often (never, once, more than once, often, very often). Its
// items are of their time ("I have helped push a stranger's car out of the
// snow"), so none is taken whole: these are written for the level, in its
// rules — culture-neutral, assuming nothing about the person's life, and
// nothing that turns on eligibility or one country's system (giving blood,
// a donor register, which an opt-out country fills in for you). Four of
// them mirror a wrong (turning up and the excuse, owning up and blaming,
// handing back money and keeping a wallet, standing up for somebody and
// mocking them), so a pair can be read against each other at analysis time;
// the rest are kindnesses the wrongs have no opposite of. The rarest rung,
// putting yourself in danger for a stranger, is the self-sacrifice THE PLAN
// had no scale for, and the one deed of the twelve that is a risk to the
// body: "stepped in to stop somebody being hurt" came off as the same act
// most of the time it is done, and looking after a hurt or lost animal came
// off with it (October 2026).
//
// TWELVE, as many as the wrongs (October 2026; eight until then). The
// balance does not need the two counts equal, each pan being read against a
// crowd of its own, but a side's count is how finely it tells people apart —
// at eight the light side had nine possible scores to the dark side's
// thirteen — so equal counts weigh the two sides with the same resolution and
// near enough the same reliability. The four added fill the ladder where it
// was empty rather than its crowded middle: TURNED UP is the common top rung
// it lacked, which tells apart the people with almost no good deeds, and the
// exact mirror of the excuse — if the first crowd says nearly everybody has
// done it, the near-universal rule takes it off again, as it took off helping
// a stranger; ANONYMOUS is the one kindness that buys no reputation by
// construction, so done-and-proud there is pride with nobody watching and the
// cleanest read of helping for the look of it, beside the SINS and the KSE-G's
// Positive half (anonymous helping is one of the six kinds of the Prosocial
// Tendencies Measure, Carlo & Randall, 2002, and nothing else here was);
// STAYED WITH is helping in an emergency without the risk to the body that
// the danger rung carries, worded generally — "in trouble" rather than
// "collapsed or hurt", so that a lost child or a panic attack counts — and
// asking for time given rather than a call made, and since most people never
// meet the occasion it will be answered mostly in the willing-never column;
// and HOSTED is a home opened at a real cost to the person, to friends and
// acquaintances as much as to anybody in need, rather than shelter given to
// somebody with nowhere to go, which was the first wording and too rare to
// tell anybody apart. Weighed and left out: giving somebody else the credit
// for what was mostly your doing (modesty as a deed, the mirror of the blame
// and the CV, and the first to try if one of the four does not hold), and
// telling somebody a hard truth they did not want to hear, which the blunt
// and antagonistic claim as readily as the honest ("I just say it like it
// is"), so that it would load on the dark side as well as the light.
//
// A rung wants to be a kindness that some people have done and some have
// not, and that saying no to does not shame: "gone out of my way to help a
// stranger" came off the top of the ladder for that, being something nearly
// everybody would say yes to and nobody would like to say no to, which
// tells nobody apart. Making up with somebody who hurt you took a place in
// the middle of the ladder: forgiveness as an act, where the HEXACO's
// Forgiveness item asks it as a trait — the opposite of the grudge, and of
// the vengefulness cut from THE PLAN. Without an apology, which keeps it a
// rung people divide on rather than one nearly everybody has climbed. Made
// up with and not "become friends with", which would assume a friendship
// and ask two things at once; and not forgiven alone, which is a feeling
// rather than a deed. Reconciling is not always the good thing to do — with
// somebody abusive it is often not — so some of the hard nevers on this
// rung are a good choice and not a lack of grace, which makes it a noisier
// rung than the rest; accepted, and worth watching in the first crowd.
//
// The across axis is the wrongs' own, willing never and all. The down axis
// is Embarrassed / Indifferent / Proud: the self-conscious feelings that go
// with having done good, as the wrongs' row is the feelings that go with
// having done harm, in the same order — the uncomfortable feeling on top and
// the warm one at the foot — so that the row a press lands on means the same
// thing whichever grid is up. Proud rather than Glad because both ends of
// the row are then feelings about oneself (pride and embarrassment are both
// self-conscious emotions; gladness is about how things turned out), and
// because pride in a kindness is where helping for the look of it shows,
// which narcissism is known for; Glad is the one-word swap if pilots read
// Proud as boastful (OPEN). Read with the columns: done and proud is the
// warm glow; done and embarrassed is the helper who would rather not be seen
// helping; done and indifferent is kindness as habit or duty; never done and
// embarrassed is a kindness the person feels they owe; and never, and I
// wouldn't, but proud is the near-contradiction the wrongs' grid has too.
//
// Good deeds are overclaimed the way wrongs are underclaimed, and the KSE-G
// dealt into the HEXACO has a half for each: Positive (exaggerating good
// qualities) for the good deeds, Negative (minimising bad ones) for the
// wrongs. A count of things ever done also grows with age on both sides, so
// the crowds want age bands once there is a crowd (OPEN). The `~` shares are
// guesses, as the wrongs' are.
//
// Keys `GoodDeed_<Name>`, so that `Deed_` finds every deed of either kind and
// `^Deed_` and `^GoodDeed_` tell them apart.

// The wrongs' grid in a red near the dark pan's and the good deeds' in a blue
// near the light pan's (js/figures/balance.js), so that the change of rows
// between one deed and the next is seen before it is read.
const DEED_COLOUR = "#b23a3a"
const GOOD_COLOUR = "#3a86b2"

// One scale of involvement for both kinds of deed, a column worth what it
// adds to the deed's side: a deed done counts and a deed never done does
// not, however willing (SCORING, above).
const DEED_ACROSS = [
    { value: 0, text: "Never, and I wouldn't", score: 0 },
    { value: 1, text: "Never, but I would if it came to it", score: 0 },
    { value: 2, text: "Once", score: 1 },
    { value: 3, text: "More than once", score: 1 },
]
// How you feel about it, a row each kind, the uncomfortable feeling on top
// and the warm one at the foot (THE GOOD DEEDS).
const DEED_DOWN = [
    { value: 0, text: "Guilty" },
    { value: 1, text: "Indifferent" },
    { value: 2, text: "Pleased" },
]
const GOOD_DOWN = [
    { value: 0, text: "Embarrassed" },
    { value: 1, text: "Indifferent" },
    { value: 2, text: "Proud" },
]
const DEED_RATHER_NOT = {
    value: 98,
    text: "I'd rather not say",
    small: true,
    declined: true,
}
// The two questions the table is the product of, written in the margin over
// the headers they ask (renderGrid in app.js). The down one is in the present
// tense on purpose: "How do you feel about it?" covers a deed done (how you
// feel now about having done it) and a deed never done (how you feel about
// the idea) in five words, where "How did you / would you feel about it?"
// puts a slash in a hand-written note and wraps it to four lines on a phone,
// where it already takes three. The stance words under it are tense-free for
// the same reason. On a phone (56px columns) the second column header wraps
// to four lines and the first to three; the table still fits the width.
const DEED_ASK = {
    across: "Have you done it?",
    down: "How do you feel about it?",
}

// The grid format out of its two scales — the table for the renderer and the
// cells as options for everything else, a cell's value its row and column
// (10 × down + across) and its score its column's worth to the deed's side.
// The same shape as `gridOf` in content/block_sex.js, written again here
// rather than borrowed so that this block does not stop loading the day that
// one is commented out: a block file reads the timeline's globals and nothing
// of another block's.
function deedGrid(across, down, ways, ask, colour) {
    const options = []
    for (const row of down)
        for (const column of across)
            options.push({
                value: 10 * row.value + column.value,
                text: column.text + " · " + row.text,
                score: column.score,
                across: column.value,
                down: row.value,
            })
    return {
        grid: { across: across, down: down, ask: ask },
        options: options.concat(ways),
        color: colour,
    }
}
const DEED_GRID = deedGrid(DEED_ACROSS, DEED_DOWN, [DEED_RATHER_NOT], DEED_ASK, DEED_COLOUR)
const GOOD_GRID = deedGrid(DEED_ACROSS, GOOD_DOWN, [DEED_RATHER_NOT], DEED_ASK, GOOD_COLOUR)

// The crowd a side is read against until the app has one of its own: a normal
// curve through a GUESSED mean and SD, binned a deed to a bin — each bin
// centred on its count, the kinks' shape of norm — with what falls past
// either end of the scale piled into the end bin, since a count cannot go
// below none or above all and people pile up there. Written as a
// `distribution` rather than left as a mean and an SD so that the crowd the
// balance draws and the standing read off it (`percentile()` in app.js) are
// one: a bare normal would put people off the ends of the scale, where
// nothing is drawn. Worked out again from the same two numbers whenever a
// deed comes or goes.
function binnedNormal(mean, sd, count) {
    // The normal distribution function, Abramowitz & Stegun 7.1.26.
    const below = (x) => {
        const z = (x - mean) / sd / Math.SQRT2
        const t = 1 / (1 + 0.3275911 * Math.abs(z))
        const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z)
        return 0.5 * (1 + (z < 0 ? -erf : erf))
    }
    const step = 1 / count
    const shares = []
    for (let at = 0; at <= count; at++) {
        const lower = at === 0 ? 0 : below((at - 0.5) * step)
        const upper = at === count ? 1 : below((at + 0.5) * step)
        shares.push(Math.round((upper - lower) * 1000) / 10)
    }
    return { from: -step / 2, step: step, shares: shares }
}

defineBlock("deeds", [
    // The norms are PLACEHOLDERS, both invented: guessed means and SDs turned
    // into a crowd (`binnedNormal`, above). Each mean is the share of its
    // ladder that the `~` guesses beside the deeds add up to — 3.45 of the 12
    // wrongs, 4.7 of the 12 good deeds — and each SD is wider than independent
    // deeds would give, since somebody who has done one wrong has usually done
    // others, and the same goes for kindness.
    //
    // The wrongs and the good deeds are one questionnaire, so that they are
    // shuffled in among one another; each kind is written once with its side
    // (and the good deeds with their grid) rather than on every line.
    {
        key: "deeds",
        name: "Deeds",
        profile: false,
        enough: 2 / 3, // of a side's deeds answered rather than declined, for it to be read
        type: "grid",
        instructions: "Have you ever…",
        format: DEED_GRID,
        norms: {
            "Light Side": { key: "LightSide", mean: 0.39, sd: 0.2, distribution: binnedNormal(0.39, 0.2, 12) },
            "Dark Side": { key: "DarkSide", mean: 0.29, sd: 0.19, distribution: binnedNormal(0.29, 0.19, 12) },
        },
        items: [].concat(
            [
                // The common rungs. Blaming somebody else is the one most
                // people have done that is also a mechanism of moral
                // disengagement.
                { key: "Deed_Excuse", text: "…made up an excuse to get out of seeing somebody?" }, // ~75%
                { key: "Deed_Piracy", text: "…downloaded or streamed a film, music or software without paying for it?" }, // ~65%
                { key: "Deed_Blame", text: "…blamed somebody else for something you did?" }, // ~50%
                // The middle: dishonesty for gain, taking what was found,
                // betrayal and the first of the cruelties. Infidelity is the one
                // deed that assumes a role (a partner), kept for being too
                // central to leave out.
                { key: "Deed_CV", text: "…lied on a CV, an application or in an interview?" }, // ~35%
                { key: "Deed_Wallet", text: "…kept money or a wallet you found without trying to return it?" }, // ~30%
                { key: "Deed_Infidelity", text: "…cheated on a partner?" }, // ~20%
                { key: "Deed_Mocking", text: "…mocked or humiliated somebody to their face on purpose?" }, // ~20%, verbal cruelty (the CAST's facet)
                // The rare rungs: damage, the RPQ's two kinds of aggression as
                // deeds, taking from somebody close (which tells people apart
                // where shoplifting did not), and the forensic literature's one
                // classic marker of cruelty.
                { key: "Deed_Damage", text: "…broken or damaged something of somebody else's on purpose?" }, // ~15%
                { key: "Deed_Hitting", text: "…hit somebody in anger?" }, // ~15%, reactive
                { key: "Deed_StolenClose", text: "…stolen from a friend or a member of your family?" }, // ~10%
                { key: "Deed_Threat", text: "…threatened or intimidated somebody to get what you wanted?" }, // ~5%, proactive
                { key: "Deed_Animal", text: "…hurt an animal on purpose?" }, // ~5%
            ].map((deed) => Object.assign({ dimension: "Dark Side" }, deed)),
            [
                // The common rungs: turning up when you would rather not (the
                // mirror of the excuse), and honesty when nobody would have
                // known (the mirrors of blaming and of keeping a wallet).
                { key: "GoodDeed_TurnedUp", text: "…turned up for somebody when you would much rather have stayed at home?" }, // ~75%, mirrors Deed_Excuse
                { key: "GoodDeed_OwnedUp", text: "…owned up to a mistake that nobody would have traced back to you?" }, // ~60%, mirrors Deed_Blame
                { key: "GoodDeed_Returned", text: "…handed back money you had been given by mistake?" }, // ~50%, mirrors Deed_Wallet
                // The middle: making up without an apology, standing up for
                // somebody (the mirror of mocking), care that goes on for days,
                // a home opened at a cost, a stranger not left alone, help that
                // nobody would know was yours, and time given regularly.
                { key: "GoodDeed_Reconciled", text: "…made up with somebody who hurt you, though they never said sorry?" }, // ~45%
                { key: "GoodDeed_StoodUp", text: "…stood up for somebody who was being mocked or bullied?" }, // ~45%, mirrors Deed_Mocking
                { key: "GoodDeed_Care", text: "…looked after somebody who was ill or struggling, for days at a time?" }, // ~45%
                { key: "GoodDeed_Hosted", text: "…offered somebody a place to stay in your home when it was a real inconvenience to you?" }, // ~40%
                { key: "GoodDeed_StayedWith", text: "…stayed with a stranger in trouble until help arrived?" }, // ~35%
                { key: "GoodDeed_Anonymous", text: "…given money or help anonymously, so that nobody would know it was you?" }, // ~35%
                { key: "GoodDeed_Volunteer", text: "…given your time to people in need or to a cause, unpaid and regularly?" }, // ~25%
                // A REPLACEMENT IN HAND, not asked: modesty as a deed, the
                // mirror of Deed_Blame and Deed_CV, the first to try if one of
                // the twelve does not hold up in the first crowd (TurnedUp the
                // likeliest, for being near-universal), and it would fill the
                // empty band between volunteering and giving a lot away. See
                // THE GOOD DEEDS, above, and OPEN.
                // { key: "GoodDeed_Credit", text: "…given somebody else the credit for something that was mostly your doing?" }, // ~20%
                // The rare rungs: giving away what costs, and the risk taken
                // for a stranger.
                { key: "GoodDeed_GaveAway", text: "…given away a large part of what you had to somebody who needed it more?" }, // ~10%
                { key: "GoodDeed_Danger", text: "…put yourself in danger to help a stranger?" }, // ~5%
            ].map((deed) => Object.assign({ dimension: "Light Side", format: GOOD_GRID }, deed)),
        ),
    },
])
