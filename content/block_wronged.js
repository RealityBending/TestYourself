/* ==========================================================================
   content/block_wronged.js — the receiving end of the Light & Dark level
   (November 2026): what was done to you, how wronged you feel and the trait
   that turns the one into the other. The fourth of the level's blocks, with
   `dark` (the briefing, the SD4 and the level's notes at the head of
   content/block_dark.js), `lies` (content/block_lies.js) and `deeds`
   (content/block_deeds.js); held after the lies-and-deeds draw on the
   timeline, so that the deeds have been asked by the time its briefing turns
   from what you do to what is done to you, and the four come and go together
   (HELD_TOGETHER). The thinking behind it — why a block of its own, the
   three layers and what each is written from, the three things the grievance
   items hold to, what it gives the students — is THE FOURTH BLOCK in the
   head of content/block_dark.js; a name in capitals in brackets is a section
   of that head.

   Three questionnaires in a fixed order, the events before any statement
   about being wronged can colour the recall: `victim`, the wrongs' mirrors
   (what was done to you); `victimhood`, how far you feel wronged, by people
   and by the system, as Grievance; `hsns`, four items of the Hypersensitive
   Narcissism Scale, as Thin Skin. Nothing here carries norms, so nothing on
   the level reads any of it back yet; what is counted is for the analysis
   (the overlap of `Victim_` with `Deed_`, the licence of Grievance on the
   dark side). NOTHING ON SCREEN MAY CALL ANYBODY A VICTIM: a high Grievance
   is a feeling and not a bias, since some who feel wronged have been.
   ========================================================================== */

// A colour of the block's own, a bruise's violet between the wrongs' red and
// the good deeds' blue: what was done to you is neither of them. Written
// here under a name of its own rather than read off another block, since a
// block file reads the timeline's globals and nothing of another block's.
const WRONGED_COLOUR = "#8a5a9e"

// The three answers to a wrong received and the way out. The deeds split the
// never into a willing and an unwilling one; there is no such split in being
// hit, so three steps and nothing hypothetical. Once and more than once are
// each worth 1 to the count (`score`), the deeds' rule (Once or More than
// once is done), so the dimension is the share of the wrongs received and
// its value stays in the words for the analysis. "I'd rather not say" is
// declined, the deeds' and the kinks' way: left out of the count rather than
// counted as a no.
const VICTIM_OPTIONS = [
    { value: 0, text: "Never", score: 0 },
    { value: 1, text: "Once", score: 1 },
    { value: 2, text: "More than once", score: 1 },
    { value: 98, text: "I'd rather not say", small: true, declined: true },
]

defineBlock("wronged", [
    // The turn: everything before this asked what you are like and what you
    // have done, and this asks what was done to you, how you feel you have
    // been treated, and how you take a slight. It promises a way out on every
    // question about what happened, says that the questions about how you
    // have been treated have no right answer, and says nothing about victims,
    // grievance or narcissism, which are the readings and not the task. Like
    // every briefing it says nothing about where in the run it falls.
    {
        type: "briefing",
        key: "Briefing_Wronged",
        text:
            "<h2>The other side of the ledger.</h2>" +
            "<p>So far the questions have been about what you are like and what you have done. The next few turn it round: " +
            "what has been done to <em>you</em>, how you feel you have been treated by people and by the world, and how you take a slight.</p>" +
            "<p>Some of the first questions name things that may have happened to you. Each has a way out, and nothing here is read as a verdict on anybody. " +
            "Answer for your life as a whole, as you remember it.</p>",
    },

    // THE WRONGS RECEIVED: six of the deeds' twelve wrongs asked from the
    // other side, "Has somebody ever…", so that the overlap of what a person
    // has done with what has been done to them (the victim-offender overlap;
    // Jennings, Piquero & Reingle, 2012) is one join on the last part of the
    // key, `Victim_Hitting` against `Deed_Hitting`. The aggressive wrongs,
    // where the overlap is strongest, then betrayal and a plain dishonesty.
    // Plain choices rather than the deeds' grid: how you feel about having
    // been hit is not a stance, and a row of feelings under it would read as
    // asking the person to rate their own hurt. CUSTOM ITEMS: no validated
    // adult lifetime short form fits — the Crime Survey for England and
    // Wales asks twelve months and legal categories — and the wordings
    // follow the deeds' rather than any instrument's, so these are never
    // pooled with anybody's data. The infidelity item assumes a partner at
    // some point, as its deed does, and the theft item names the thief as
    // somebody close, which is what makes it the mirror of
    // `Deed_StolenClose` rather than of being robbed. Being bullied at
    // school was weighed and left out (THE FOURTH BLOCK): it reaches the
    // best-known childhood correlate of later cruelty, but not inside an
    // "ever" question about adult life.
    //
    // Scored as a count, the share of the six received (an index, like the
    // deeds, and not a scale), read while two thirds are answered rather
    // than declined (`enough`), under a plain name with no norms, so that it
    // is asked, scored and saved and fed back nowhere — the deeds' rule that
    // nothing on screen says which, and on this side nothing says how many
    // either, for now.
    {
        key: "victim",
        name: "Wrongs Received",
        profile: false,
        enough: 2 / 3, // of the six answered rather than declined, for the count to be read
        instructions: "Has somebody ever…",
        format: { options: VICTIM_OPTIONS, color: WRONGED_COLOUR },
        items: [
            { key: "Victim_Hitting", dimension: "Wrongs Received", text: "…hit you in anger?" }, // Deed_Hitting
            { key: "Victim_Threat", dimension: "Wrongs Received", text: "…threatened or intimidated you to get what they wanted?" }, // Deed_Threat
            { key: "Victim_Mocking", dimension: "Wrongs Received", text: "…mocked or humiliated you to your face on purpose?" }, // Deed_Mocking
            { key: "Victim_Infidelity", dimension: "Wrongs Received", text: "…cheated on you while you were together?" }, // Deed_Infidelity
            { key: "Victim_StolenClose", dimension: "Wrongs Received", text: "…stolen from you, when they were a friend or a member of your family?" }, // Deed_StolenClose
            { key: "Victim_Blame", dimension: "Wrongs Received", text: "…blamed you for something they had done?" }, // Deed_Blame
        ],
    },

    // GRIEVANCE: how far the person feels wronged, by people and by the
    // system, and owed for it. Eight CUSTOM items written in the app's
    // register, the opinions level's way, FROM three sources rather than
    // copied from any: the Tendency for Interpersonal Victimhood (TIV;
    // Gabay, Hareli, Shahar & Nadler, 2020, Personality and Individual
    // Differences 165, 110134 — need for recognition, moral elitism, lack of
    // empathy and rumination, the trait form of feeling wronged), personal
    // relative deprivation (Callan, Shead & Olson, 2011, Journal of
    // Personality and Social Psychology 101, 955-973 — the sense of having
    // less than one's due) and cynical distrust (the Cook-Medley hostility
    // scale's "most people will use somewhat unfair means to gain profit").
    // None of the three is asked as published, so nothing here is pooled
    // with their data. Two faces, four items each, one reversed on each, all
    // shuffled together so that four statements about the system do not
    // arrive in a row and say what they measure; one dimension until a crowd
    // says the faces are two, which an analysis can split off the keys'
    // second word.
    //
    // THREE THINGS EVERY ITEM HOLDS TO (THE FOURTH BLOCK). It is about ME and
    // MY LOT, never the world in general — "the world is unjust" is the
    // primals' ground and "they are hiding things from us" the CMQ's, both
    // asked elsewhere in the run — so every statement names the person's own
    // deal. It names no group: being kept down for one's race, sex or class
    // is Article 9 ground and another instrument (the Everyday
    // Discrimination Scale), and "people like me" leaves the group to the
    // person. And agreeing is not a bias: some who agree have been wronged
    // exactly as they say, and the wrongs received (above) are what tells a
    // grievance with a cause from one without, which is why the two are
    // asked together.
    //
    // On the SD4's five points under its two anchors, the level's scale, so
    // that the three agreement questionnaires of the level read alike. Keyed
    // `Victimhood_<Word>`, the opinions level's pattern: the word for what
    // it asks and never a number; the second word is the face (People,
    // System) so that `^Victimhood_People` is one face. No norms, so nothing
    // on the level reads it yet; what would is a line under the balance's
    // pans, as a reach (RESULTS), never a standing.
    {
        key: "victimhood",
        name: "How You Have Been Treated",
        profile: false,
        instructions: "How much do you agree with this statement?",
        format: {
            options: [1, 2, 3, 4, 5],
            anchors: ["Strongly disagree", "Strongly agree"],
            color: WRONGED_COLOUR,
        },
        items: [
            // By people. The TIV's core is the sense of having been wronged
            // more than others and of the wrong going unacknowledged (its
            // need-for-recognition items); the Cook-Medley's cynicism is the
            // expectation of being used. The reversed item takes the
            // person's own part in a falling-out, which the TIV's rumination
            // and moral-elitism items rule out.
            { key: "Victimhood_People_Advantage", dimension: "Grievance", text: "People tend to take advantage of me" },
            { key: "Victimhood_People_Wronged", dimension: "Grievance", text: "I have been wronged more than most people have" },
            { key: "Victimhood_People_Unpaid", dimension: "Grievance", text: "Those who have hurt me have never properly paid for it" },
            { key: "Victimhood_People_Share", dimension: "Grievance", reverse: true, text: "When things go wrong between me and somebody, it is as often my doing as theirs" },
            // By the system. The first two are the structural face — the
            // system set against one's own kind, which "people like me"
            // leaves to the person to fill in — and the third is personal
            // relative deprivation in a sentence, Callan et al.'s construct
            // turned from comparison with others to one's due. The reversed
            // item is the whole face from the other side, the plainest
            // statement a person can disagree with.
            { key: "Victimhood_System_Down", dimension: "Grievance", text: "Society is set up to keep people like me down" },
            { key: "Victimhood_System_Deal", dimension: "Grievance", text: "People like me get a worse deal than most" },
            { key: "Victimhood_System_Deserve", dimension: "Grievance", text: "I have had less out of life than I deserve" },
            { key: "Victimhood_System_Fair", dimension: "Grievance", reverse: true, text: "On the whole, life has treated me fairly" },
        ],
    },

    // THIN SKIN: four of the ten items of the Hypersensitive Narcissism Scale
    // (HSNS; Hendin & Cheek, 1997, Journal of Research in Personality 31,
    // 588-599), the vulnerable kind of narcissism — hurt by slights, taking
    // remarks personally, and quietly entitled — which the SD4's narcissism
    // (Pride, in `sd4`) does not reach, being the grandiose kind; the only
    // thing on the level's list the run had nowhere (WHAT WAS CUT, Vulnerable
    // narcissism). Hypersensitivity (2, 7), egocentricity (10) and
    // entitlement (4), by the authors' own reading of the scale. FROM MEMORY,
    // TO BE CHECKED against the paper before the level is run (THE ITEMS):
    // the wordings and the numbers both. Item 10 is adapted — the published
    // item reads "I am secretly 'put out' or annoyed when…", and the quoted
    // phrase has aged out of the language, so it keeps "annoyed" alone.
    // Four items reach an omega of about .6, which is the price of the
    // budget; the alternative if they do not hold is the FFNI-SSF's
    // neuroticism items.
    //
    // The published scale is five points from "very uncharacteristic" to
    // "very characteristic"; asked here on the level's agreement anchors
    // instead, so that the three agreement questionnaires of the level read
    // alike, which makes it an adapted HSNS and never pooled with its data as
    // the same items. Keyed `HSNS_<published number>`, padded, since the
    // scale's ten reach ten. Plain name Thin Skin, documented here against
    // the construct, the two registers' rule; no norms, so fed back nowhere
    // yet — and if it ever is, never as "more narcissistic than…".
    {
        key: "hsns",
        name: "Taking Things Personally",
        profile: false,
        instructions: "How much do you agree with this statement?",
        format: {
            options: [1, 2, 3, 4, 5],
            anchors: ["Strongly disagree", "Strongly agree"],
            color: WRONGED_COLOUR,
        },
        items: [
            { key: "HSNS_02", dimension: "Thin Skin", text: "My feelings are easily hurt by ridicule or the slighting remarks of others" },
            { key: "HSNS_07", dimension: "Thin Skin", text: "I often interpret the remarks of others in a personal way" },
            { key: "HSNS_10", dimension: "Thin Skin", text: "I am secretly annoyed when other people come to me with their troubles, asking me for my time and sympathy" },
            { key: "HSNS_04", dimension: "Thin Skin", text: "I dislike sharing the credit of an achievement with others" },
        ],
    },
])
