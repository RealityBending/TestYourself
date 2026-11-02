/* ==========================================================================
   content/block_dark.js — a level on the dark side of personality, IN
   PROGRESS (October 2026). ASKED BY NO BATTERY: it is on the timeline, as a
   level of its own (`Dark`, "Light & Dark") in `all`'s second fork, so that
   it has a place, a key and a name, but it is in ASIDE in
   content/timeline.js, so neither `mint` nor `all` asks it. A run meets it
   only through a link naming it — `?start=dark`, which asks a block whatever
   the battery says and walks that level first, ahead of General. It is not
   in the ethics application.

   WHAT IS ASKED SO FAR: a briefing; the SD4 (`sd4`, the Super-Short Dark
   Tetrad's sixteen and an attention check, beside the briefing in this
   file); Serota's lie count (`liecount`, one typed number) and the LPQ whole
   (`lpq`, sixteen sliders) — the SD4 and the lying all November 2026 and
   shown nowhere yet — and `deeds`, twenty-four grids — of the plan below the
   SD4, the lying and the deeds, and nothing else of it yet: twelve
   ordinary wrongs and twelve good deeds, shuffled in among one another. They
   are the level's two sides (October 2026), Dark Side (the share of the
   wrongs done) and Light Side (the share of the good deeds done), so the
   level has a results screen, a badge and a `Level_<N>` like any other and
   closes on the balance (RESULTS, below). Their crowds are invented until
   the app has one of its own — see SCORING in content/block_deeds.js.

   THREE BLOCKS, THREE FILES (November 2026): `dark`, this one, the briefing,
   the SD4 and the level's notes; `lies` (content/block_lies.js), the lie
   count and the LPQ; and `deeds` (content/block_deeds.js), the grids and what
   they are scored and weighed by. The SD4 is asked straight after the
   briefing, being in its block; the lies and the deeds come after it in
   an order drawn for each run (`shuffle()` in content/timeline.js), so
   that neither is always met fresh and neither always after the other, and
   the saved file's `levels` says which came first; the three are held
   together (HELD_TOGETHER), since `?start=dark` names the briefing's block
   alone. Each file keeps the notes about what it asks beside it, the way
   block_sex.js keeps its NOTES beside the block they are about rather than
   in a conversation nobody can find again; this header is THE PLAN and the
   rest of the level's thinking, and the other two refer to its sections by
   their names in capitals.

   ==========================================================================
   THE PLAN
   ==========================================================================

   WHAT IT IS FOR. Antagonism, callousness, manipulation, deceit and the
   ordinary wrongdoing that goes with them — the ground of forensic and
   criminal psychology — asked of a general sample, read beside what the run
   already holds (HEXACO Honesty-Humility on Character; Dominance and
   Disinhibition on the HiTOP-BR; the KSE-G's social desirability, which dark
   items need more than any; the CMQ's Suspicion; the SINS single), and
   handed back as something people will share. It is being written for two
   dissertation students in forensic psychology, who want data on exactly
   this, and the level is theirs to extend in a battery of their own (WHERE
   IT GOES).

   THE FRAME: a light side and a dark side — first after the Force in Star
   Wars, a theme dropped with the cards it was for (RESULTS) — and the frame
   is psychometrically honest about BEHAVIOUR, which is why both sides are
   deeds. Doing good and doing harm are not two ends of one axis: in 673
   adult twins, self-reported altruism and antisocial behaviour were largely
   independent and had different roots — antisocial behaviour about half
   heritable and going with negative emotionality and low constraint,
   altruism with no genetic part detected and going with the family
   environment and positive emotionality (Krueger, Hicks & McGue, 2001,
   Psychological Science 12:397). So a person has a light strength and a
   dark strength that vary separately, and the corner the stories are about
   — strong in both — is a real corner. At the extremes the two do meet:
   people who gave a kidney to a stranger have a larger right amygdala and a
   stronger amygdala response to fearful faces, the mirror image of the
   psychopathy findings (Marsh et al., 2014, PNAS 111(42)), which Marsh
   reads as one caring continuum. In the general population they behave as
   two, and the whole level is built round two strengths, never one axis.
   The trait measures of a light side do not give that: the Light Triad
   correlates −.48 with the dark traits and is most of it Agreeableness,
   which is why it was cut (WHAT WAS CUT).

   Trademark follows the Hyborian Age's rule about "Conan": "light side" and
   "dark side" as plain phrases, and nothing named — no "the Force", no
   "Jedi", no "Sith". With the theme gone a pair of scales has nothing of
   anybody's in it. Whether "The Dark Side" alone is a registered mark wants
   a five-minute check before it is the level's name; a question as the
   hook, "Which way do your scales tip?" or "How strong is your dark side?",
   sidesteps it, the volcano's and the kinks' way.

   --------------------------------------------------------------------------
   The ~40-item plan, about five minutes with the briefing
   --------------------------------------------------------------------------

   The budget is ~40 screens, a level of five minutes or less. The thing
   protected at that length is the two-sided reading and the cards, which
   need the dark side in facets; everything else bends to it. In order:

     Briefing_Dark      Why a test of the person asks what it is about to
                        ask: every story has both sides and so does
                        everybody; nothing here is a diagnosis; at the end,
                        which side is stronger in you and what each is made
                        of. Says nowhere where in the run it falls. (For now
                        the briefing introduces the lie count and the deeds,
                        below.)

     Self-ratings       DROPPED (November 2026). The plan had one item,
                        `Dark_SelfPlacement`, "Which side do you think you
                        lean towards?", a slider from light to dark, asked
                        first. It went for putting the two sides on one
                        axis, which THE FRAME says they are not: a slider
                        from light to dark has no answer for the person
                        strong in both, who is the corner the stories are
                        about. THE ONE REPLACEMENT TO CONSIDER, not asked:
                        two ratings, how much good you think there is in you
                        and how much evil, each on a scale whose middle is
                        "As much as most people" ("Much less than most
                        people" to "Much more than most people", seven
                        points or a slider), asked first, before any
                        statement can colour them (the ESS self-placement's
                        rule on Where You Stand). Keys `Dark_SelfGood` and
                        `Dark_SelfEvil`; scored nowhere; read by the balance
                        alone, as a ghost of the fill in each pan — where
                        you thought that side stood against where it
                        measured — the insight question nothing else asks,
                        and one that keeps the two strengths two. The
                        middle anchor is what makes a self-rating a standing,
                        so it reads honestly only once each pan is weighed
                        against a real crowd (OPEN, the base rates). "Evil"
                        against "bad" or "dark" is a wording still open:
                        "evil" is the stronger word and the one people will
                        answer in earnest.

     sd4                17 items + 4. ASKED (November 2026, `sd4`, in this file,
                        after the briefing). Four a facet out of the Short Dark
                        Tetrad (SD4; Paulhus, Buckels, Trapnell & Jones, 2021;
                        5-point agreement), shuffled, with the level's
                        attention check dealt in. Which four: the Super-Short
                        Dark Tetrad's (SSD4; Meng, Li, Liu & Xu, 2022, PAID
                        188, 111459 — the SD4's 28 cut to 16 in Chinese;
                        omegas .66-.79 and scalar gender invariance in a
                        Peruvian replication, Zegarra-López et al., 2024, TPM
                        31(2); never yet checked in English), read from the
                        paper's Table 1: items 2-5, 8, 9, 12, 13, 15-18, 22,
                        24, 25 and 28 — and, since November 2026, 27 brought
                        back beside them ("Just for kicks, I've said mean
                        things on social media": the commonest modern cruelty,
                        the one a fandom audience meets, and the one sadism
                        item where agreeing is plausible for no sadist), so
                        Cruelty is five and the facet is no longer the SSD4's;
                        and four TriPM Meanness items dealt in as Coldness
                        (THE ITEMS; WHAT WAS CUT, Callousness). Score the four
                        4-item facets (Cruelty's five) and their 16-item sum; the SD4's published norms
                        are for 28-item sums and DO NOT TRANSFER as they stand.
                        The balance reads each side as a standing (RESULTS),
                        so if the SD4 ever weighs into the dark pan (OPEN),
                        then until the app has a crowd of its own it is read
                        against a normal curve through the published
                        means and SDs taken to item means, flagged as a
                        placeholder — the rule wherever a mean and an SD are
                        published and a distribution is not.

     bold              4 items. Boldness, out of the Triarchic Psychopathy
                        Measure (TriPM; Patrick, 2010; 4-point true/false
                        agreement). The one dimension here orthogonal to
                        antagonism, and the fork between the successful and
                        the criminal dark profile in the triarchic literature.
                        For the fiction it is the hero's own axis: the hero
                        and the villain share it, the bystander has neither.
                        Published means, no norms: a reach on screen.

     lying              16 items + 1. The Lying Profile Questionnaire whole
                        (LPQ; Makowski, Pham, Lau, Raine & Chen, 2023, Current
                        Psychology, online 2021 — the lab's own; analogue
                        scale): Ability, Frequency, Negativity and
                        Contextuality, four items each; and Serota's lie
                        count, "In the past 24 hours, how many times have you
                        lied?" (Serota, Levine & Docan-Morgan, 2021, after
                        Serota, Levine & Boster, 2010), a typed number — both
                        ASKED (November 2026, `liecount` and `lpq`, in
                        block_lies.js), the count first. The mask's two axes are
                        skill × frequency, the LPQ's Ability against the
                        count, which is frequency as behaviour over a day; the
                        LPQ's own Frequency is frequency as a self-description,
                        and the two set side by side are a check on each other.
                        The plan had Ability alone, for the budget; the other
                        three came in on the author's call (November 2026).

     deeds              ASKED (October 2026), below: twenty-four "Have you
                        ever…" grids, twelve wrongs and twelve good deeds, which
                        are the balance's two pans. See THE DEEDS and THE
                        GOOD DEEDS in block_deeds.js. The good deeds took the
                        Light Triad's place on the light side (WHAT WAS CUT).

     wronged            ASKED (November 2026, content/block_wronged.js, held
                        after the lies-and-deeds draw): a fourth block beside
                        `dark`, `lies` and `deeds`, held together with them,
                        on the receiving end — what was done to you, how
                        wronged you feel and the trait that turns the one
                        into the other: a briefing, the wrongs' mirrors as
                        Wrongs Received (`victim`), perceived victimhood as
                        Grievance (`victimhood`), and four HSNS items of
                        vulnerable narcissism as Thin Skin (`hsns`). Nineteen
                        screens. THE FOURTH BLOCK, below.

     Attention check    1, in `sd4`, asking for a circle off either end —
                        ASKED (November 2026, `SD4_AttentionCheck`, 2 of 5).

   Total about 64 screens with the deeds as grids: 16 + 4 + 17 + 24 + 1 + 1
   + the briefing. Expected reliabilities: SD4 facets .65-.80 at four items
   with Machiavellianism lowest everywhere it has been tried; Boldness about
   .70 at four; LPQ ability above .80. A count of deeds is an index and not
   a scale, and is not judged by an alpha. Items are listed under THE ITEMS,
   below.

   The budget's next cuts, if that is still too many: the wrongs and the
   good deeds to eight each, keeping a rung in every band of each ladder,
   and then narcissism — the least antagonistic facet, half of it the agency
   Boldness already carries, and the SINS is in `singles`.

   --------------------------------------------------------------------------
   THE ITEMS — provenance, and which are checked
   --------------------------------------------------------------------------

   VERBATIM, checked against the source as fetched (October 2026): the SD4's
   28, out of the English/Spanish appendix of Zegarra-López et al. (2024).
   FROM MEMORY OF THE PAPER, TO BE CHECKED against the PDF before any is typed
   into a block: everything else below. The project's rule: the BSA and CMQ
   wordings on Where You Stand were checked against the sources, and these
   want the same.

     SD4 — the 28, numbered as published. ASKED (November 2026): the SSD4's
     sixteen, Meng et al.'s Table 1, marked * below. In CAPS, the four a facet
     proposed on face validity before their list was in hand, kept to show
     where it differed (it differs on half: 3, 4, 9, 16, 17, 22 and 25 are
     theirs and not the proposal's):

       Machiavellianism (Cunning)
         1  It's not wise to let people know your secrets
       * 2  WHATEVER IT TAKES, YOU MUST GET THE IMPORTANT PEOPLE ON YOUR SIDE
       * 3  Avoid direct conflict with others because they may be useful in the future
       * 4  Keep a low profile if you want to get your way
       * 5  MANIPULATING THE SITUATION TAKES PLANNING
         6  FLATTERY IS A GOOD WAY TO GET PEOPLE ON YOUR SIDE
         7  I LOVE IT WHEN A TRICKY PLAN SUCCEEDS
         (1 and 4 are the cautious items that read as prudence and load
         weakly in English — Blötner & Beisemann, 2022 — which is why the
         proposal left them out; Meng et al. kept 4, and 3 with it, and
         dropped 1, 6 and 7, so the facet as asked is the cautious half of
         Machiavellianism more than the scheming half — worth watching)
       Narcissism (Pride)
       * 8  PEOPLE SEE ME AS A NATURAL LEADER
       * 9  I have a unique talent for persuading people
         10 Group activities tend to be dull without me
         11 I KNOW THAT I AM SPECIAL BECAUSE PEOPLE KEEP TELLING ME SO
       * 12 I HAVE SOME EXCEPTIONAL QUALITIES
       * 13 I'M LIKELY TO BECOME A FUTURE STAR IN SOME AREA
         14 I like to show off every now and then
       Psychopathy (Recklessness — which is what these items are: impulsive
       antisociality, not callousness; the callous core rides on the
       16-item general factor)
       * 15 PEOPLE OFTEN SAY I'M OUT OF CONTROL
       * 16 I tend to fight against authorities and their rules
       * 17 I've been in more fights than most people of my age and gender
       * 18 I TEND TO DIVE IN, THEN ASK QUESTIONS LATER
         19 I've been in trouble with the law
            (OUT whatever the SSD4 says: Article 10 inside a trait scale)
         20 I SOMETIMES GET INTO DANGEROUS SITUATIONS
         21 PEOPLE WHO MESS WITH ME ALWAYS REGRET IT
       Sadism (Cruelty)
       * 22 Watching a fist-fight excites me
         23 I really enjoy violent films and video games
       * 24 IT'S FUNNY WHEN IDIOTS FALL FLAT ON THEIR FACE
       * 25 I enjoy watching violent sports
         26 SOME PEOPLE DESERVE TO SUFFER
       * 27 JUST FOR KICKS, I'VE SAID MEAN THINGS ON SOCIAL MEDIA (back,
            November 2026, beside 28 rather than in place of it)
       * 28 I KNOW HOW TO HURT SOMEONE WITH WORDS ALONE
         (22, 23 and 25 are the vicarious facet the CAST separates out, and
         the weaker reading of cruelty; the sixteen keep 22 and 25, so
         Cruelty as asked was half watching violence, half doing it, and
         27 back tips it to three of five doing)

     TriPM Meanness — four of nineteen, ASKED (November 2026, `sd4`, dealt in
     among the SD4's as Coldness), FROM MEMORY, CHECK WORDING AND NUMBERING
     (the TriPM is free, on PhenX; shelve it in literature/):
         I don't mind if someone I dislike gets hurt (8)
         It doesn't bother me to see someone else in pain (20)
         I don't care much if what I do hurts others (29)
         How other people feel is important to me (2, R)
     On the SD4's five agreement points rather than the TriPM's four
     true/false ones, so adapted and never pooled with TriPM data.

     TriPM Boldness — four of nineteen, CHECK WORDING AND SCALE:
         I'm optimistic more often than not
         I can get over things that would traumatize others
         I am well-equipped to deal with stress
         I have a knack for influencing people

     LPQ — VERIFIED (November 2026): all sixteen items and the scale, from
     the instructions and items in github.com/DominiqueMakowski/2020structure
     (Deception_Scale_LIE.docx), written into `lpq` in block_lies.js.

     Serota's count — CHECKED (November 2026) against Serota, Levine &
     Docan-Morgan (2021), whose one-item daily measure and prompt are quoted
     beside `liecount` in block_lies.js, with how the item departs from them.

   Keys: `SD4_Mach_02`, `SD4_Narc_08`, `SD4_Psych_18`, `SD4_Sadism_28` (the
   published item number, padded to two digits, since Pride's run from 8 to
   13), `TriPM_Bold_1`, `TriPM_Mean_1`, `Lie_Ability_1` (and
   `Lie_Frequency_1`, `Lie_Negativity_1`, `Lie_Contextuality_1`),
   `Lie_Count` (and `Lie_Count_ForOthers`, its follow-up),
   `Deed_<Name>` and `GoodDeed_<Name>` (below),
   `SD4_AttentionCheck`; and, in the fourth block, `Victim_<Name>` (pairing
   with the `Deed_<Name>` it mirrors), `Victimhood_<Face>_<Word>` and
   `HSNS_<published number>` (THE FOURTH BLOCK). Dimensions carry the plain
   names (Cunning, Pride, Recklessness, Cruelty; Coldness; Boldness; Lying
   Ability, Lying Frequency, Lying Negativity, Lying Contextuality; Wrongs
   Received, Grievance, Thin Skin),
   documented against the construct here, the two registers' rule. None is a
   name already on the run.

   --------------------------------------------------------------------------
   WHAT WAS CUT, AND WHY — the long list, kept for the student battery
   --------------------------------------------------------------------------

   The guiding fact: most dark scales are the same thing twice. In short
   measures Machiavellianism and psychopathy correlate about .6 (Miller et
   al., 2017, "a distinction without a difference"); sadism and psychopathy
   are "still redundant" (Blötner & Mokros, 2023; replicated 2025); spite,
   entitlement, greed and vengeance all sit on the one antagonistic core that
   D (Moshagen, Hilbig & Zettler, 2018) and low Honesty-Humility already name.
   So what adds information is what the run does not already hold.

   Cut from the ~40-item plan (October 2026):

     Light Triad           LTS (Kaufman, Yaden, Hyde & Tsukayama, 2019,
                           Frontiers in Psychology 10:467; 12 items, three
                           facets of four, 5-point; open), which was to be the
                           light side, whole. Cut because the run already holds
                           nearly all of it. Kantianism is the SD4's
                           Machiavellianism reversed (−.56 with the dark
                           traits, and HEXACO_Sincerity on Character asks
                           nearly the same); Faith in Humanity is a belief
                           about the world (the PI-18's Safe, the CMQ's Trust
                           end, and its forgiveness item is HEXACO_Forgiveness);
                           Humanism is Agreeableness (the whole scale goes .79
                           with it). From the paper: total M 3.8, SD 0.64,
                           α .84; Kantianism α .80, Humanism .76, Faith .67;
                           −.48 with the dark traits as a whole. What is left
                           over is real (Lukić & Živanović, 2021, PAID 178)
                           but predicts bad outcomes weakly: in a Portuguese
                           sample at risk of delinquency the total went −.14
                           with trouble with the law and with neither arrest
                           nor prison, only Kantianism held, and it went only
                           −.27 with moral disengagement, so it is no stand-in
                           for the MD-8 (Pechorro et al., 2026, Int J Offender
                           Ther Comp Criminol). Kantianism is also the facet
                           shown to moderate the path from the dark core to
                           antisociality (Pechorro et al., 2025, Psychiatry,
                           Psychology and Law 33(1)). And the LTS and the SD4
                           are each keyed one way only, so somebody agreeing
                           with everything lands strong in both, the corner
                           the frame is about. The good deeds take its place
                           (THE GOOD DEEDS, block_deeds.js). Its items, for
                           a student battery that wants it for a light-versus-
                           dark paper (CHECK WORDING against the paper; on
                           screen Faith rather than Trust, which is one end of
                           the CMQ's line):
                             Faith in Humanity — I tend to see the best in
                             people / I think people are mostly good / I tend
                             to trust that other people will deal fairly with
                             me / I'm quick to forgive people who have hurt me
                             Humanism — I tend to treat others as valuable /
                             I tend to admire others / I tend to applaud the
                             successes of other people / I enjoy listening to
                             people from all walks of life
                             Kantianism — I prefer honesty over charm / I
                             don't feel comfortable overtly manipulating
                             people to do something I want them to do / I
                             would like to be authentic even if it may damage
                             my reputation / When I talk to people, I am
                             rarely thinking about what I want from them

   Cut from the 74-item plan, in the order they would come back:

     Moral disengagement   MD-8 (Moore, Detert, Treviño, Baker & Mayer, 2012;
                           8 items, one a mechanism of Bandura's, 7-point,
                           unidimensional, α .80 at eight and not much at
                           four, so whole or not at all). The cognitive
                           mechanism by which a person lets themselves do it,
                           and the strongest single predictor of unethical
                           behaviour in the meta-analyses (~.4). THE BIGGEST
                           LOSS and the first add-back. Items (fetched):
                           "It is okay to spread rumors to defend those you
                           care about" / "Taking something without the owner's
                           permission is okay as long as you're just borrowing
                           it" / "Considering the ways people grossly
                           misrepresent themselves, it's hardly a sin to
                           inflate your own credentials a bit" / "People
                           shouldn't be held accountable for doing
                           questionable things when they were just doing what
                           an authority figure told them to do" / "People
                           can't be blamed for doing things that are
                           technically wrong when all their friends are doing
                           it too" / "Taking personal credit for ideas that
                           were not your own is no big deal" / "Some people
                           have to be treated roughly because they lack
                           feelings that can be hurt" / "People who get
                           mistreated have usually done something to bring it
                           on themselves".
     SD4, the other 12     Back to the full 28 restores the published norms
                           and lets the SSD4 and Neumann et al.'s (2022,
                           Assessment) 12-item form both be scored inside it
                           (the 12 fell apart in Peru: ω .44-.60 on three
                           facets). An English validation of the SSD4 does
                           not exist and is a methods paper for a student.
     LPQ, the other 12     BACK (November 2026): Frequency, Negativity and
                           Contextuality are asked beside Ability in `lpq`.
     Vulnerable narcissism BACK (November 2026): four HSNS items as Thin
                           Skin, `hsns` in block_wronged.js — THE FOURTH
                           BLOCK, below. Was the most
                           interesting omission: the only thing on
                           the list the run has nowhere (neuroticism ×
                           antagonism), and the fiction's tragic figure, the
                           one who falls. HSNS (Hendin & Cheek, 1997), e.g.
                           "My feelings are easily hurt by ridicule or the
                           slighting remarks of others" / "I often interpret
                           the remarks of others in a personal way" / "I
                           dislike sharing the credit of an achievement with
                           others" — but four items reach ω ≈ .6 and the
                           scale is ten. The FFNI-SSF (15 items: agentic
                           extraversion, antagonism, neuroticism) is the
                           tidier three-factor alternative if narcissism is
                           ever asked in full.
     Guilt-proneness       NOTED FOR LATER (October 2026): the strongest
                           candidate if the level ever wants a light TRAIT
                           beside the good deeds. The GP-5 (Cohen, Kim &
                           Panter, 2014), five scenarios out of the GASP's
                           guilt scales (Cohen, Wolf, Panter & Insko, 2011) —
                           "You lie to people but they never find out about
                           it. What is the likelihood that you would feel
                           terrible about the lies you told?" — each 1-7,
                           extremely unlikely to extremely likely. The best
                           forensic record of any light trait: in 476 jail
                           inmates followed into the year after release,
                           guilt-proneness directly predicted LESS reoffending,
                           while shame-proneness predicted more, by way of
                           blaming others (Tangney, Stuewig & Martinez, 2014,
                           Psychological Science 25:799); and low GP-5 scores
                           marked law-enforcement candidates judged less
                           suitable (Cohen, Kim, Jordan & Panter, 2016, PAID).
                           THE DEEDS' stance axis carries the remorse felt over
                           acts somebody actually did; the GP-5 is guilt
                           anticipated over invented ones, which is a different
                           thing and not a duplicate. Five screens if it goes
                           in.
     Proactive/reactive aggression  RPQ (Raine et al., 2006; never/sometimes/
                           often): proactive "Had fights with others to show
                           who was on top" / "Hurt others to win a game" /
                           "Used physical force to get others to do what you
                           want" / "Threatened and bullied someone"; reactive
                           "Gotten angry when frustrated" / "Yelled at others
                           when they have annoyed you" / "Reacted angrily when
                           provoked by others". Folded into the deeds as one
                           reactive and one proactive deed; proactive
                           aggression is the criterion sadism and callousness
                           are usually validated against.
     Callousness           BACK (November 2026): those four TriPM Meanness
                           items ("I don't mind if someone I dislike gets
                           hurt" / "It doesn't bother me to see someone else
                           in pain" / "I don't care much if what I do hurts
                           others" / "How other people feel is important to
                           me", R) are dealt in among the SD4's as Coldness.
                           The jingle argument that cut them does not hold
                           against the SSD4's four psychopathy items, which
                           are impulsive antisociality (out of control,
                           fights, rules, diving in) and reach the
                           callous-unemotional core nowhere; before this the
                           only read on it was the deeds' done-and-indifferent
                           cell.
     Spitefulness          Marcus, Zeigler-Hill, Mercer & Norris (2014):
                           "I would rather no one get extra credit in a class
                           if it meant that others would receive more credit
                           than me" / "I would be willing to take a punch if
                           it meant that someone I did not like would receive
                           two punches" / "It might be worth risking my
                           reputation in order to spread gossip about someone
                           I did not like". Loads on D at .6+.
     Entitlement           PES (Campbell et al., 2004): "I honestly feel I'm
                           just more deserving than others" / "Great things
                           should come to me" / "I deserve more things in my
                           life". Narcissistic entitlement is a D theme.
     Greed                 Dispositional Greed Scale (Seuntjens et al., 2015):
                           "I always want more" / "Actually, I'm kind of
                           greedy" / "It doesn't matter how much I have. I'm
                           never completely satisfied".
     Vengefulness          Vengeance Scale (Stuckless & Goranson, 1992): "I
                           don't just get mad, I get even" / "Revenge is
                           sweet", with a Trait Forgivingness item reversed
                           ("I can forgive a friend for almost anything",
                           Berry et al., 2005) for one bipolar line.
     Compassion, empathy   Santa Clara Brief Compassion Scale (Hwang, Plante
                           & Lackey, 2008), SITES ("I am an empathetic
                           person", Konrath et al., 2018): callousness
                           reversed and Agreeableness, both measured already.
     Thrill-seeking        BSSS-4 (Stephenson et al., 2003): "I would like to
                           explore strange places" / "I like to do frightening
                           things" / "I like new and exciting experiences,
                           even if I have to break the rules" / "I prefer
                           friends who are exciting and unpredictable".
                           Disinhibition is on the HiTOP-BR, and Boldness
                           takes the adaptive part.
     Exploitation single   SIDDD (Kajonius et al., 2016, PeerJ 4:e1748): "I
                           tend to exploit others towards my own end",
                           7-point; r .77 with the Dirty Dozen total, .50 with
                           the Mach-IV, .30 with Eysenck's psychopathy. One
                           item for the exploitative core; the SD4 covers it.
     Bullshitting          Bullshitting Frequency Scale (Littrell, Risko &
                           Fugelsang, 2021; 12, persuasive and evasive).
     The D16               Moshagen, Zettler & Hilbig (2020): one dark core in
                           16 items, α .77, 33 languages, free for
                           non-commercial use with the citation
                           (darkfactor.org; no norms on the site). THE
                           ALTERNATIVE AT THE SAME PRICE as the 16 SD4 items:
                           a better-measured core, no facets, no flavour
                           cards. It comes down to whether the cards matter,
                           and here they do.
     Self-sacrifice        The hero's own dimension; no validated short scale
                           worth trusting. Now the rarest rung of the good
                           deeds (`GoodDeed_Danger`), as a deed rather than a
                           statement.

   Already on the run and NOT asked again: Honesty-Humility (Character — the
   "dark triad is just low H" question is a dissertation in itself), the
   SINS narcissism single (`singles`), Dominance and Impulsivity (HiTOP-BR —
   antagonistic and disinhibited externalising), the KSE-G (dealt into the
   HEXACO — the social-desirability control dark items need most; a student
   battery MUST include `hexaco` for it), Suspicion (the CMQ), Other-blame
   and Rumination (the CERQ).

   --------------------------------------------------------------------------
   RESULTS — the balance (js/figures/balance.js), October 2026
   --------------------------------------------------------------------------

   The level closes on a pair of scales: the dark side in the left pan and
   the light side in the right, each drawn as the crowd it is read against,
   stood on end the kinks' way and filled from its foot as far as the
   person's side reaches, so that the filled part is the share of people
   that side outweighs; and the beam tips to the heavier of the two, a pan's
   weight being its standing. The pans carry the levels and the beam only
   the difference, which keeps the frame's two strengths two: strong in both
   is laden pans hanging level, weak in both near-empty ones. Under the pans,
   each side's standing ("Weighs more than 64% of people's"); then which way
   it tips, in a line that says how laden the pans are when they hang level;
   then one vote, `Sides`.

   WHAT IS WEIGHED is the deeds: the good deeds done in the light pan and the
   wrongs done in the dark (SCORING, block_deeds.js), each read against an
   invented crowd — a normal through a guessed mean and SD, binned a deed to
   a bin (`binnedNormal`) — until the app has a crowd of its own. Behaviour on
   both sides, counted the same way, is what keeps the two pans comparable,
   so the SD4 and the rest come in as lines under the pans rather than as
   weights in them; whether the SD4 should weigh into the dark pan as well is
   OPEN. The figure reads the sides by name, so any change is `SIDES` in
   balance.js and what it says on hover.

   Still to come on it, in the order they would go in: the two self-ratings,
   if they are asked, as a ghost of the fill in each pan, where the person
   thought that side stood (THE PLAN, Self-ratings); the SD4's
   facets as positions out of ten under the dark pan (rubies, the
   Hyborian's), never standings — "more sadistic than 90% of people" must
   not appear on a screen read over a shoulder; and Boldness, the mask (the
   LPQ's ability against the lie count) and Conscience (the deeds' remorse, a
   reach) as lines under those. NOTHING ON IT SAYS WHICH DEEDS. Locked: the scales from
   the stand-ins, blurred, the two sides named. Badge: the heavier pan and
   the crowd in it.

   --------------------------------------------------------------------------
   THE CARDS, SET ASIDE (October 2026) — kept for if the level wants them
   --------------------------------------------------------------------------

   The plan until the balance, in the Hyborian Age's artistic direction. Set
   aside because the balance shows the two strengths directly where the
   planet had to be explained, and needs no generated assets, no compositing
   and no trade-dress check; the cost is the "which one are you" card, the
   format that travels. If a theme is ever wanted back, a public-domain
   weighing of souls (St Michael's scales in a Last Judgement, or the
   weighing of the heart in the Book of the Dead) is one the balance itself
   could be drawn in, level 1's way with old pictures. It was written when
   the light side was to be the Light Triad (since cut), whose three facets
   gave the three light characters and the standing on the card's back.

   The generated painted cards of the Hyborian level are the most appealing
   thing in the app, more so than the drawn figures, so this level closes on
   cards too — and, unlike that level's eleven paintings for eleven heroes,
   on cards COMPOSED out of layers, so that a few assets make a card nobody
   else gets: seven characters, four planets and four frames are fifteen
   assets and over a hundred distinct cards.

     Character   WHO YOU ARE: the strongest of the seven facets by REACH.
                 Dark: Cunning → the Chancellor, Pride → the Emperor,
                 Recklessness → the Smuggler, Cruelty → the Bounty Hunter.
                 Light: Principle → the Knight, Warmth → the Healer, Faith →
                 the Pilgrim. Boldness tints the lot rather than picking: a
                 bold Healer is a field medic, a bold Pilgrim a scout — or
                 Boldness is the Farmhand's own card at the start of every
                 story. (The Farmhand, the Smuggler, the Mystic, the Bounty
                 Hunter, the Senator, the Admiral, the Fallen Knight were the
                 first list; jobs and never likenesses, with no signature
                 helmet or mask on any.)
     Planet      WHERE YOU STAND: the quadrant of the two sides against each
                 other — a green world for light over dark, a fire world for
                 dark over light, a swamp for both strong (the exile's
                 training ground), twin suns over sand for neither (where
                 every story begins). Independent of the character on
                 purpose: a cunning Chancellor on a green world is a real
                 reading, not a contradiction — cunning is your loudest trait,
                 and against other people you are on the light side.
     Frame       THE MASK: the LPQ's ability against the lie count at the
                 midpoint, the heads' four-sentence rule — skilled and
                 frequent the Smuggler's mask, skilled and rare the
                 Diplomat's, unskilled and frequent the Gambler's, unskilled
                 and rare the Open Book. A corner emblem on the border, a
                 border being the one layer with no join to hide.
     Companions  DROPPED: a small domed robot or a tall furry co-pilot is
                 trade dress however generically prompted, and a creature at
                 the feet brings the join problem back.

   The join is where compositing fails — horizon, lighting and shadow never
   agree — and three things fix it: every character generated knee-deep in a
   band of ground fog or blown sand (or bust-length), which hides the join on
   any planet; one neutral key light written into every character's STYLE,
   then the cut-out tinted with the planet's dominant colour through an SVG
   filter at a quarter strength, with a soft shadow ellipse under it; and one
   grain-and-vignette texture over the whole card last, which is what makes
   three sources read as one print. Pipeline: assets/hyborian/source/cut.py's
   pattern with a background-removal step, characters as PNGs with alpha,
   planets as JPEGs, the card as stacked SVG <image> layers in the hero card's
   shape — which snapshot() already turns into data URLs for the share image.
   Prompts follow the Hyborian's STYLE + SUBJECT + FRAME scheme, the register
   pulp science-fantasy (a 1970s paperback cover rather than a 1990s trading
   card, so the two levels do not look like one deck), and what to avoid
   written into the SUBJECT as words: no glowing swords, no black-armoured
   helmeted figure, no small green sage.

   The card's back, on the Hyborian's: "In the light and the dark, you would
   be…", the character's name, the two sides — the light side as a STANDING
   against the LTS norms ("Your light side is stronger than 71% of people"),
   the dark side as a REACH until the app has a crowd of its own, and said
   that way round — then the facets as positions out of ten (rubies), never
   standings, the compass's reticence: "more sadistic than 90% of people"
   must not appear on a screen read over a shoulder. The two self-ratings,
   if asked, go beside the measured sides as "where you thought you stood"
   (THE PLAN, Self-ratings). One
   sentence from the quadrant (four, written so none is a verdict; the
   strong-in-both corner gets the best one, since that is where the stories
   live and what people will post). The deeds' remorse (THE DEEDS) can go on
   the back as "Conscience", a reach, since a share of your own deeds met
   with guilt says nothing about which deeds; the deeds themselves go on no
   screen. Votes: `Sides` on the card, `Mask` on the frame. Locked: the card
   face down on its side's stock, blurred, no names. Badge: the character's
   head. A new figure in js/figures/dark.js, `DARK_OF = ["dark", "light",
   "bold", "lying"]`, rendered where the first falls in RUN, the heads'
   pattern.

   --------------------------------------------------------------------------
   WHERE IT GOES
   --------------------------------------------------------------------------

   Two ways in, not exclusive. As a pop-culture hook, the Hyborian's way: on
   `all`'s timeline in ASIDE, reached by `?start=dark` — DONE for the deeds —
   with, still to do, a `start/dark/` entry page and a card of its own in
   assets/preview/, so a result posted in the fandom is the way into the rest
   of the test. For the students, a battery of their own, `TIMELINE_DARK`:
   the demographics, this level, `hexaco` (for H and the KSE-G) and `mood` +
   `hitop` (for the externalising spectra), under their own ethics
   application, which the new items need anyway — `mint` is the committee's
   set and is not touched.

   --------------------------------------------------------------------------
   ETHICS
   --------------------------------------------------------------------------

   Self-reported offending is UK GDPR ARTICLE 10 data (criminal offence data)
   even anonymous, so the deeds want a paragraph in the application the way
   the opinions level's Article 9 has one. Arrests and convictions are kept
   off the list, and the SD4's "I've been in trouble with the law" is out of
   the sixteen whatever the SSD4 says. Which deeds somebody did is shown back
   to nobody. What is shown is the two sides as standings, and the level's
   share (a link, a picture) carries both, which together say how many of
   the wrongs and how many of the good deeds were done — a count, the kinks'
   kind of disclosure, and never which; whether even that should be shareable is
   for the application to settle. Dark items
   are the most faked in the inventory, and a deed with the pleasure admitted
   beside it is a double disclosure, more faked than the act alone; the KSE-G
   on Character is the control, which is why the student battery carries
   `hexaco`.

   --------------------------------------------------------------------------
   THE FOURTH BLOCK: `wronged` — content/block_wronged.js (November 2026)
   --------------------------------------------------------------------------

   WHY A BLOCK OF ITS OWN. The three blocks ask what you are like and what
   you have done. This one asks what was done to you, how wronged you feel
   and the trait that turns the one into the other — the receiving end,
   which the dark literature keeps finding on the other side of the same
   people: the victim-offender overlap (those who are hit, hit; Jennings,
   Piquero & Reingle, 2012, Aggression and Violent Behavior 17, the
   review), the victim's licence (people reminded of a wrong done to them
   take more for themselves afterwards; Zitek, Jordan, Monin & Leach, 2010,
   JPSP 98), and vulnerable narcissism as the disposition sitting between
   being hurt and feeling owed. A block beside the other three, in ASIDE and
   HELD_TOGETHER, with a briefing of its own (`Briefing_Wronged`) turning
   from what you do to what is done to you, held after the lies-and-deeds
   draw so that the deeds have been asked when it turns (whether it should
   join the draw instead is OPEN). Three layers, in this order, so that the
   events are reported before any statement about being wronged can colour
   the recall:

     1. VICTIMISATION, the events — `victim`: mirrors of the wrongs on the
        deeds' own pattern, "Has somebody ever…", but as plain choices
        rather than grids (Never / Once / More than once, with "I'd rather
        not say"), and no stance row, since how you feel about having been
        hit is not a stance. Six, each keyed `Victim_<Name>` after the deed
        it mirrors, so that the overlap is one join:
          Victim_Hitting      …hit you in anger?            (Deed_Hitting)
          Victim_Threat       …threatened or intimidated you to get what
                              they wanted?                  (Deed_Threat)
          Victim_Mocking      …mocked or humiliated you to your face on
                              purpose?                      (Deed_Mocking)
          Victim_Infidelity   …cheated on you while you were together?
                                                            (Deed_Infidelity)
          Victim_StolenClose  …stolen from you, when they were a friend or
                              a member of your family?      (Deed_StolenClose)
          Victim_Blame        …blamed you for something they had done?
                                                            (Deed_Blame)
        The aggressive wrongs first, since that is where the overlap is
        strongest. A seventh on being bullied at school reaches the
        best-known childhood correlate of later cruelty at the price of the
        "ever" window; weigh it. No validated adult lifetime short form
        fits (the Crime Survey for England and Wales asks twelve months and
        legal categories), so these are custom and say so. Scored as a
        count, an index like the deeds, and shown to nobody.

     2. PERCEIVED VICTIMHOOD, the feeling — `victimhood`: agreement items on
        how far the person feels wronged, by people and by the system, and
        owed for it. Three sources to write FROM rather than to copy: the
        Tendency for Interpersonal Victimhood (TIV; Gabay, Hareli, Shahar &
        Nadler, 2020, PAID 165: need for recognition, moral elitism, lack
        of empathy, rumination; 22 items, the trait form of this), personal
        relative deprivation (Callan, Shead & Olson, 2011, JPSP 101: "I
        feel deprived when I think about what I have compared to what other
        people like me have" — the sense of having less than one's due,
        which predicts gambling, materialism and short-term choice), and
        cynical distrust (the Cook-Medley's "most people will use somewhat
        unfair means to gain profit"). Written custom in the app's register,
        the opinions level's way, each item's source and reason beside it.
        Two faces, four items each, one reversed on each:
          by people:   "People tend to take advantage of me"
                       "I have been wronged more than most people have"
                       "Those who have hurt me have never properly paid
                        for it"
                     R "When things go wrong between me and somebody, it is
                        as often my doing as theirs"
          by the system: "Society is set up to keep people like me down"
                       "People like me get a worse deal than most"
                       "I have had less out of life than I deserve"
                     R "On the whole, life has treated me fairly"
        Plain name: Grievance, one dimension; the two faces are an analysis
        split until a crowd says they are two. Keys
        `Victimhood_<Face>_<Word>` (`Victimhood_People_Advantage`,
        `Victimhood_System_Down`), the opinions level's pattern: the word
        for what it asks and never a number, with the face before it so
        that `^Victimhood_People` is one face.
        THREE THINGS TO HOLD TO. It is about ME and MY LOT, never the world
        in general: "the world is unjust" is the primals' ground (Safe,
        Hierarchical and Acceptable on The World) and "they are hiding
        things from us" the CMQ's on Where You Stand, so an item here names
        the person's own deal or the run asks the same thing twice. It
        names no group: being kept down for one's race, sex or class is
        Article 9 ground and another instrument (the Everyday Discrimination
        Scale), and "people like me" leaves the group to the person. And a
        high score is not a bias: some who agree have been wronged exactly
        as they say, and the events in layer 1 are what tells a grievance
        with a cause from one without — the reason the two are asked
        together — so nothing on screen may call it a victim mentality, and
        a reading, if there is ever one, is a feeling and not a verdict.

     3. VULNERABLE NARCISSISM, the trait — `hsns`: four of the Hypersensitive
        Narcissism Scale's ten (Hendin & Cheek, 1997, JRP 31; 5-point
        agreement, the SD4's scale): "My feelings are easily hurt by
        ridicule or the slighting remarks of others"; "I often interpret
        the remarks of others in a personal way"; "I am secretly annoyed
        when other people come to me with their troubles, asking me for my
        time and sympathy" ("secretly 'put out' or annoyed" in the
        original, the quoted phrase having aged out of the language); "I
        dislike sharing the credit of an achievement with others" —
        hypersensitivity (2, 7), egocentricity (10) and entitlement (4).
        FROM MEMORY, TO BE CHECKED, the item numbers with them. ω ≈ .6 at
        four (WHAT WAS CUT), the price of the budget; the FFNI-SSF's
        neuroticism items are the alternative if the four do not hold. Keyed
        `HSNS_<published number>`, padded, since the ten reach ten. Plain
        name: Thin Skin. It goes here and not in `sd4` because the SD4's
        narcissism is the grandiose kind (Pride) and a dimension is one name
        across the run (AGENTS.md), and because its register — hurt,
        slighted — is this block's.

   WHAT IT ADDS: nineteen screens (6 + 8 + 4 and a briefing), the level to
   about 83 and seven minutes (`minutes` on the timeline, a guess). The cut
   if that is too many is the system face of Grievance, the primals being
   nearest it.

   WHAT IT GIVES THE STUDENTS: the overlap (`Victim_` × `Deed_`), the
   licence (Grievance × Dark Side, and whether the events account for it),
   and the chain hurt → grievance → entitlement with Thin Skin as the
   moderator. And a reading the fiction already has — the one who falls
   because of what was done to them — which is the card's strong-in-both
   corner seen from the other side.

   ON SCREEN, nothing decided. The balance could carry Grievance as a line
   under the pans (a reach, the Conscience line's way) with the count of
   wrongs received shown to nobody, the deeds' rule; a figure of its own (a
   wound that heals or festers, a ledger of what is owed) is the kind of
   thing to draw once the items have a crowd. Anything that names a person
   a victim on a screen read over a shoulder is out, the compass's
   reticence.

   --------------------------------------------------------------------------
   OPEN
   --------------------------------------------------------------------------

     - THE FOURTH BLOCK is held after the lies-and-deeds draw. Whether it
       should join the draw instead — the wrongs received before the wrongs
       done, for half the runs, which would say whether recalling being hit
       changes what is admitted — is open, and so is being bullied at school
       as a seventh wrong received.

     - Check every FROM-MEMORY wording above against its PDF; shelve the PDFs
       in literature/.
     - "The Dark Side" as a mark, five minutes.
     - The four mask sentences.
     - Whether the SD4 weighs into the dark pan beside the wrongs, or only
       stands under it as facets (RESULTS).
     - The deeds' base rates, once there is a crowd: the `~` shares beside
       each deed, wrong and good, are guesses to be replaced, and both
       ladders re-spaced; and the two sides' invented crowds with them.
     - The crowds by age: a count of things ever done grows with age on
       both sides, so a crowd wants age bands once there is one.
     - Proud or Glad at the foot of the good deeds' rows (THE GOOD DEEDS):
       whichever the pilots read as less boastful.
     - A replacement good deed in hand, `GoodDeed_Credit`, "…given somebody
       else the credit for something that was mostly your doing?", written
       commented out at its rung in block_deeds.js: for TurnedUp if the first
       crowd finds it near-universal, or any of the twelve that does not hold.
     - CUNNING'S TWO CAUTIOUS ITEMS, CONSIDERED AND LEFT (November 2026).
       The SSD4's Machiavellianism four are 2-5, and 3 (avoid conflict, they
       may be useful) and 4 (keep a low profile) are the wary half of the
       construct, loading weakly in English samples (Blötner & Beisemann,
       2022), so Cunning as asked is wariness more than scheming and will
       likely go with nothing on the lies or the deeds. The swap would be 3
       and 4 for 6 (flattery) and 7 (a tricky plan succeeding), the scheming
       half (THE ITEMS has the wordings, checked). FOR: it buys the
       manipulative core, which is what the LPQ's Ability and the deeds
       want a trait to correlate with; the SSD4 has no English validation,
       so its selection is not sacred, and the SD4's own seven hold both
       halves anyway. AGAINST: the facet stops being the SSD4's (as Cruelty
       already has, with 27 back), so the published omegas and the Peruvian
       invariance no longer speak for it; a student's English validation of
       the SSD4 (WHAT WAS CUT, Machiavellianism) wants the sixteen as
       published; and the cautious items are the ones that tell a
       Machiavellian from a plain narcissist, who is loud. The honest
       alternative is all seven, three more screens. Decide with the first
       crowd: if Cunning goes with Lying Ability and the wrongs no better
       than Pride does, swap or widen.
     - A FOURTH STANCE ROW ON THE DEEDS, CONSIDERED AND LEFT (November
       2026): the case for and against is written in block_deeds.js under
       the stance (A FOURTH ROW). In a line: "It wasn't wrong" would split
       the callous from the self-justifying, which is most of what the MD-8
       measured, at the price of a stance that is no longer a feeling and a
       taller table on a phone.
   ========================================================================== */

defineBlock("dark", [
    // For now the briefing introduces the SD4, the lies and the deeds; when
    // the rest of the level is written it becomes the level's (THE PLAN,
    // Briefing_Dark). It says that statements about yourself come first (the
    // SD4, below, in this block) and that then the screens ask about lying and
    // name deeds, in no order, since those two come in an order drawn for each
    // run (`lies` and `deeds`, content/timeline.js); what the deed screens
    // hold, that the list runs from the common to the rare,
    // what the two steps ask, that there is always a way out, and that the
    // answers are weighed at the end — which way the person's scales tip
    // (js/figures/balance.js), and nothing about which deeds. Like every
    // briefing it says nothing about where in the run it falls.
    //
    // THE PRIVACY PARAGRAPH (October 2026) says again, on the level that most
    // needs it, what the consent form said once: that the answers identify
    // nobody, are analysed in the pool and never alone, and that anything
    // traceable is taken out before the data are shared — the point being
    // that honest answers want a person who feels safe giving them. The same
    // paragraph opens the sexuality level (Briefing_Sexuality in
    // block_sex.js); a change to one wants making in the other. IT DOES NOT
    // SAY THE COMMITTEE HAS APPROVED THIS, because it has not: this level is
    // not in the ethics application (see the header). Once it is, the
    // sentence to add is "…and the way your answers are kept has been
    // approved by the University's research ethics committee." Every claim in
    // it has to stay true of what the code does: see AGENTS.md, **Where it
    // goes** and **BirthDay**, for what is removed and when.
    {
        type: "briefing",
        key: "Briefing_Dark",
        text:
            "<h2>Good turns and bad.</h2>" +
            "<p>Some statements about yourself come first. Then screens that ask how you lie, and screens that name things people do: a dozen ordinary wrongs and as many good turns, from the ones nearly everybody has done to the ones few have. At the end you will see which way your own scales tip, and you can pass on any of the deeds.</p>" +
            "<p>A reminder on privacy before you go on. Your answers are anonymous: nothing in them identifies you, they are analysed together with everybody else's and never on their own, and anything that could be traced back to you is removed. It is vital for us that you feel comfortable answering truthfully, and the way your answers are kept has been carefully designed for that.</p>" +
            "<p><em>For each deed, say with one press whether you have done it — or would — and how you feel about it.</em></p>",
    },

    // THE SD4, straight after the briefing and before the lies and the deeds
    // whichever of those comes first (November 2026; whether it joins their
    // draw is for later). The sixteen of the Super-Short Dark Tetrad (SSD4;
    // Meng, Li, Liu & Xu, 2022, Personality and Individual Differences 188,
    // 111459, Table 1, read November 2026): four of the Short Dark Tetrad's
    // seven a facet (SD4; Paulhus, Buckels, Trapnell & Jones, 2021, European
    // Journal of Psychological Assessment 37, 208-222), chosen on their
    // loadings and on content, a pair of near-twins settled in each case
    // (12 over 11, 25 over 23, 24 over 26, 28 over 27 — and 27 brought back
    // beside 28 in November 2026, below). Their form was in
    // Chinese and has not been checked in English; the English wordings are
    // the SD4's own, verbatim from the English/Spanish appendix of
    // Zegarra-López et al. (2024), checked October 2026 (THE ITEMS). Item 19,
    // "I've been in trouble with the law", is not among the sixteen, which
    // spares the level an offence admitted inside a trait scale (ETHICS).
    //
    // On the SD4's five points, of which both sources confirm only the ends,
    // "strongly disagree" and "strongly agree", so the circles are numbered
    // and only the ends are labelled, the archetypes' way. None of the SD4's
    // reversed: it has no reversed item, which is a known weakness against
    // agreeing with everything, and the attention check is the guard against
    // the worst of it — with one TriPM Meanness item, reversed, dealt in
    // beside them (below).
    //
    // Keyed by facet and the SD4's own item number, padded to two digits
    // since Pride's run from 8 to 13. Dimensions carry the plain names of THE
    // ITEMS — Cunning, Pride, Recklessness, Cruelty for Machiavellianism,
    // narcissism, psychopathy and sadism, and Coldness for the TriPM's
    // Meanness, below — and no norms: the SD4's published
    // norms are for its 28 and do not transfer, and nothing on the level reads
    // the facets yet (RESULTS: positions out of ten, never standings).
    {
        key: "sd4",
        name: "Dark Traits",
        profile: false,
        instructions: "How much do you agree with this statement?",
        format: {
            options: [1, 2, 3, 4, 5],
            anchors: ["Strongly disagree", "Strongly agree"],
            color: "#b23a3a", // the level's red, the wrongs' grid's
        },
        items: [
            { key: "SD4_Mach_02", dimension: "Cunning", text: "Whatever it takes, you must get the important people on your side" },
            { key: "SD4_Mach_03", dimension: "Cunning", text: "Avoid direct conflict with others because they may be useful in the future" },
            { key: "SD4_Mach_04", dimension: "Cunning", text: "Keep a low profile if you want to get your way" },
            { key: "SD4_Mach_05", dimension: "Cunning", text: "Manipulating the situation takes planning" },
            { key: "SD4_Narc_08", dimension: "Pride", text: "People see me as a natural leader" },
            { key: "SD4_Narc_09", dimension: "Pride", text: "I have a unique talent for persuading people" },
            { key: "SD4_Narc_12", dimension: "Pride", text: "I have some exceptional qualities" },
            { key: "SD4_Narc_13", dimension: "Pride", text: "I'm likely to become a future star in some area" },
            { key: "SD4_Psych_15", dimension: "Recklessness", text: "People often say I'm out of control" },
            { key: "SD4_Psych_16", dimension: "Recklessness", text: "I tend to fight against authorities and their rules" },
            { key: "SD4_Psych_17", dimension: "Recklessness", text: "I've been in more fights than most people of my age and gender" },
            { key: "SD4_Psych_18", dimension: "Recklessness", text: "I tend to dive in, then ask questions later" },
            { key: "SD4_Sadism_22", dimension: "Cruelty", text: "Watching a fist-fight excites me" },
            { key: "SD4_Sadism_24", dimension: "Cruelty", text: "It's funny when idiots fall flat on their face" },
            { key: "SD4_Sadism_25", dimension: "Cruelty", text: "I enjoy watching violent sports" },
            // 27 is not among the SSD4's sixteen (28 was taken over it) and
            // is brought back beside 28 (November 2026): the commonest modern
            // cruelty, the one a fandom audience meets, and the one sadism
            // item where agreeing is plausible for somebody who is no sadist,
            // which the row of fights and sports wants. Cruelty is five.
            { key: "SD4_Sadism_27", dimension: "Cruelty", text: "Just for kicks, I've said mean things on social media" },
            { key: "SD4_Sadism_28", dimension: "Cruelty", text: "I know how to hurt someone with words alone" },

            // TRIPM MEANNESS, four of nineteen, dealt in among the SD4's
            // (November 2026): callousness proper, which the SSD4's four
            // psychopathy items do not reach — they are impulsive
            // antisociality (out of control, fights, rules, diving in), so
            // four Meanness items are not a second measure of the same thing
            // (WHAT WAS CUT, Callousness, now back). Out of the Triarchic
            // Psychopathy Measure (TriPM; Patrick, 2010), whose Meanness
            // scale is the callous-unemotional core: the four plainest, none
            // a fight, a sport or a joke (the sadism items' ground), and one
            // reversed, the only reversed item among the dark traits and a
            // small guard against agreeing with everything. FROM MEMORY,
            // CHECK WORDING AND NUMBERING against the published list (THE
            // ITEMS). Asked on the SD4's five agreement points rather than
            // the TriPM's four true/false ones, so adapted and never pooled
            // with TriPM data as the same items. Keyed counting within, the
            // published number beside each, the LPQ's way; scored as
            // Coldness, the plain name, with no norms and shown nowhere yet
            // (RESULTS).
            { key: "TriPM_Mean_1", dimension: "Coldness", text: "I don't mind if someone I dislike gets hurt" }, // TriPM 8
            { key: "TriPM_Mean_2", dimension: "Coldness", text: "It doesn't bother me to see someone else in pain" }, // TriPM 20
            { key: "TriPM_Mean_3", dimension: "Coldness", text: "I don't care much if what I do hurts others" }, // TriPM 29
            { key: "TriPM_Mean_4", dimension: "Coldness", reverse: true, text: "How other people feel is important to me" }, // TriPM 2

            // The attention check, dealt in among them, the archetypes' own:
            // the circles carry their numbers, so it can name one, and one
            // off either end, since the ends are where a thumb goes without
            // reading.
            {
                key: "SD4_AttentionCheck",
                check: 2,
                text: "To show that I am reading these statements, I will answer 2 on this one",
            },
        ],
    },
])
