# The Abyss Test

## Aim

Create a big online survey with flexible setup. Cool looking and rewarding to do, engaging and motivating to continue.
Include "gamified" mechanisms, such as unlocking rewards, e.g., in the form of "assessment" charts (e.g., personality radar charts, interpretations, etc).

## Includes

- **Level 1** (General) — `demographics1`, then the `fipi` block (the briefing that opens the whole test, then the five items) and the `singles` block
  - Demographics 1 (every demographic item keyed `Demographics_*`): Gender (and, on that answer, sex assigned at birth and gender identity), Age, Birth Month, and — on the month — which side of that month's zodiac cusp the day fell (`Demographics_BirthDay`, one item that words its two halves from the month just given, plus "I'd rather not say", so the star sign is known without a date of birth being asked)
  - Big-5: Five-Item Personality Inventory (FIPI) — Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness. **Read back as two old theories and nothing else**: the star sign (from the birth month and cusp half) beside the temperament (Galen's four humours on Eysenck's two axes, from Extraversion and Emotional Stability against their norms), each a name and a few keywords with agree/disagree; no rows, since the HEXACO on level 5 draws the same ground in full, and the other three norms commented out; kept off the whole-run web (`profile: false`)
  - Single-item scales, asked in among one another as one shuffled run. None carries norms, so none opens a results row and none is on the whole-run profile web or card; only General Health and Life Satisfaction carry a dimension at all (scored and saved, shown nowhere):
    - Narcissism: Single Item Narcissism Scale (SINS)
    - General health: Single-Item Self-Rated Health (SRH)
    - Stress: Single-Item Measure of Stress Symptoms (SIMS)
    - Self-esteem: Single-Item Self-Esteem Scale (SISE)
    - Self-concept clarity: item 11 of the Self-Concept Clarity Scale (SCCS; Campbell et al., 1996), "In general, I have a clear sense of who I am and what I am", on the scale's own 5 points
    - Search for meaning: item 8 of the Meaning in Life Questionnaire (MLQ; Steger et al., 2006), "I am seeking a purpose or mission for my life", on the MLQ's own 7 points
    - Self-efficacy: General Self-Efficacy Single-Item (GSE-SI)
    - Life satisfaction: Single-Item Life Satisfaction Scale (SILS)
    - Attractiveness (Self-Positioning)
    - Intelligence (Self-Positioning)
- **Level 2**
  - Demographics 2: Education, Discipline, Student status, Ethnicity, Country (each with an "other, please say" behind it)
  - Interoception: Multidimensional Interoceptive Traits (MINT) — Bodily Awareness, Bodily Sensitivity, Bodily Clarity. 34 items, on one of two 7-point scales drawn per participant. Carries an attention check, as does every scored level below this one (level 1 has none). **Norms not invented**: the pooled answers of 1,683 people across the four studies that have asked these items (InteroceptionScale studies 1 and 2, FakeArt, FakeChat), worked out by `norms/make_norms.R` — a convenience sample of online studies rather than a population
- **Level 3**
  - Attitudes towards AI: Beliefs about Artificial Images Technology (BAIT), the union of the 2.1B (FictionEro study 2) and 2.2 (FakeArt) administrations — 23 statements under harmonised item names, plus three singles asked first (AI knowledge, technical understanding of how LLMs and generative AI work, and usage) and the "answer all the way to the right" attention check. The 2.1B Expertise trio is dropped, the opening singles having asked what it asked; the understanding single is a new key (`BAIT_Understanding`), narrower than the old `BAIT_UnderstandingAI` and on a different scale, so it does not stack onto it. Scored per the pooled validation's BAIT-8 — AI Realism (4 items), AI Enthusiasm and AI Apprehension (2 each) — and read back as an **archetype**: which of three answer profiles from a cluster analysis of the pooled samples the answers are nearest — the Untroubled (worry well below average, enthusiasm high, capability beliefs average), the Uneasy Realist (AI output realistic and hard to spot, and dangerous with it) and the Unconvinced (unimpressed and unenthused) — with the (placeholder) share of people answering the same way
- **Level 4** — demographics first, then the `mood` and `health` blocks, each behind a briefing of its own, in a random order, then the `hitop` block behind a briefing of its own. `phq4` and the HiTOP-BR are read back together as **the climb**, the level's one section: a figure in profile at the foot of a hill, with four things about the year drawn into the scene — how steep the hill is (Emotional Intensity), who is on it with you (Solitude), the pack on your back (Bodily Complaints) and the weather over it (the PHQ-4's last two weeks) — with a bar chart of the four channels under it (each explained on hover), the same hill at the two ends of all four bars, and one vote on the picture. The three year channels are standings among the HiTOP-BR's development sample, the weather a share of the way to the PHQ-4's top band. Sleep, self-rated health and the other three spectra are fed back nowhere
  - Demographics 3: Perceived household financial comfort and the national MacArthur Scale of Subjective Social Status
  - Mood: Patient Health Questionnaire-4 (PHQ-4), refined 5-option version, the options in one row — Anxiety and Depression, summed as the PHQ-4's own distress score rather than averaged
  - Sleep: Single-Item Sleep Quality Scale (SQS), on its published 0-10 scale with its five bands in the instructions — asked, scored and saved, but not a channel of the climb, so shown nowhere (`results: false`, `profile: false`). The one item left in the questionnaire that held the CDS-2 and the PCL-2
  - Psychiatric history: diagnoses currently lived with, and the treatments received for them — two tick-any-number lists, asked and saved but scored and fed back nowhere
  - Symptoms & maladaptive traits: Hierarchical Taxonomy of Psychopathology Brief Report (HiTOP-BR; Simms et al., 2026, as shipped in the {hitop} R package) — 45 statements about significant times in the last 12 months, on a 4-point scale, no reversed items, plus an attention check (`HITOP_AttentionCheck`, which no two-digit item pattern matches, so `score_hitopbr()` cannot take it for an item), scored as the mean of each of six spectra, **renamed for the public** — Bodily Complaints (Somatoform), Emotional Intensity (Internalizing), Unusual Experiences (Thought Disorder), Solitude (Detachment), Impulsivity (Disinhibition), Dominance (Antagonism) — with the mapping one-to-one, so the scoring is untouched (the Externalizing superspectrum and the p-factor can be taken from the raw answers). Item keys are the package's item numbers under the app's prefix (`HITOP_01`–`HITOP_45`; `HBR_nn` until September 2026), so a saved file scores with `score_hitopbr()` once the columns are renamed `HBR_nn`. **Norms not invented** (with the MINT's, the only two that are not): the development-sample means and SDs of Simms et al. (N = 780), read out of the package by `norms/make_norms.R`. **Read back as three channels of the climb** (Emotional Intensity, Solitude, Bodily Complaints; the other three spectra are fed back nowhere) — it had a spider chart with a row per spectrum once, dropped as reading like verdicts — and **kept off the whole-run profile web and card** (`profile: false`): symptom spectra on one polygon with Openness read as more of the same kind of thing. The standings are read through a normal curve for now; the spectra are floor-skewed, so the note at the foot of `norms/make_norms.R` asks for empirical quantiles instead
- **Level 5** — one block, `hexaco`: a briefing, then the HEXACO with the KSE-G dealt in among its items. Read back as a spider chart with a row per domain
  - HEXACO: HEX-ACO-18 (Olaru & Jankowsky, 2022) — 18 items, three per domain, each from a different HEXACO-100 facet, on the HEXACO's 5-point agreement scale: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness (eleven items reverse-keyed). **Read back in full**, as a spider chart with a row per domain, and on the whole-run web and card. The domains carry plain names — Honesty-Humility, Emotionality, and Sociability, Patience, Diligence, Curiosity for eXtraversion, Agreeableness, Conscientiousness and Openness — both because the HEXACO's constructs are not the Big Five's and because a dimension is one name across the run, so the FIPI's names could not be reused. **Dealt in among its items: the Social Desirability-Gamma Short Scale (KSE-G; Kemper et al., 2014)** — six "I…" statements, three exaggerating positive qualities and three minimising negative ones, on the HEXACO's agreement scale so that they blend in; unscored — no `dimension`, the keys (`KSEG_Positive1`…`KSEG_Negative3`) say the facet and the total is taken at analysis time with the Negative three reversed — and fed back nowhere. An attention check is dealt in with them
- **Level 6** — one block, `primals`: a briefing, then the PI-18 and, behind it, the five tertiary primals no short form of the inventory reaches. One section, which is the sea and nothing else
  - World beliefs: the 18-item Primals Inventory (PI-18; Clifton & Yaden, 2021), the validated short form of the PI-99 (Clifton et al., 2019) — 18 statements on the inventory's own 0-5 agreement scale, seven reverse-keyed, in the **fixed order the short form was validated in** (`shuffle: false`, the one questionnaire in the app that holds its own order). Scored as Safe, Enticing and Alive, each with an axis on the whole-run web and card, and read back as **the sea**, which is the whole of the section — no rows, no percentiles, one vote on the picture: the bottom of the abyss by torchlight at the width of the card, and under it a line per channel saying what it does to the scene, with the same abyss at the floor and at the ceiling of all three scales beside them. In it, Safe is what is down there with you (round and blunt at one end; spines, jaws and teeth at the other, and something too big to be lit holding still beyond the beam), Enticing is how much colour is in the creatures, the rock and the coral, and Alive is how much is living in the beam at all. The inventory's headline primal, overall **Good** world belief, is not a fourth set of items but a composite of these ones (all six Safe, all seven Enticing, and two of the five Alive items), and an item here carries one dimension — so Good is left to analysis time rather than asked twice: the keys name the primal and count within it (`PI_Safe_1`…`PI_Alive_5`; they were Clifton's labels under `PI18_` until September 2026), with Clifton's label beside each item in the block file, so his published scoring code computes it from a saved file after one rename
  - Other world beliefs: the five **tertiary primals that cluster under none of** Safe, Enticing or Alive, and so are missed by every short form — Acceptable, Changing, Hierarchical, Interconnected, Understandable — taken whole from the PI-99 (22 items, `PI_Acceptable_1`…`PI_Understandable_4`; Clifton's labels under `PI99_` until September 2026) on the same scale as the PI-18, which is what makes the two safe to ask back to back. Mixing subscales across versions this way is what the inventory's administration instructions recommend for this case. The level's attention check is the one the inventory ships with ("Please mark this statement 'slightly disagree'"), shuffled in among these. **Asked, scored, saved and fed back nowhere** (`results: false`, and `profile: false` too): the level reads as the one sea, and five percentile rows under it would be a second, plainer answer to the question the picture has just answered — and these five are the inventory's neutral primals anyway, where believing the world hierarchical or changeable is not more or less of anything a person would want
- **Level 7**
  - Archetypes: the Open Source Archetype Indicator – Pearson-Marr (OSAI-PM) — twelve three-item scales after Carol S. Pearson and Hugh Marr's twelve-archetype framework (PMAI): Idealist, Sage, Seeker, Revolutionary, Magician, Warrior, Realist, Jester, Lover, Creator, Ruler, Caregiver. An open paraphrase written from public descriptions of the framework rather than from the PMAI's own items (first person, one claim per item, no absolutes and no comparison between archetypes inside one item; each scale's three items cover three facets, one of them behavioural and one polarizing, with no shadow items — the rules are written above the items in the block file, so that a review can be checked against them), to be validated independently of the original instrument — so unvalidated as yet. Deliberately **without norms**, unlike everything else fed back here: the twelve are read against each other rather than against other people, as a coloured wheel of twelve petals with whichever came out loudest named underneath. An attention check is shuffled in among the 36 statements. The wheel is the only place they are drawn: they take no axes on the whole-run profile web or card, which carry the six HEXACO domains, the three MINT dimensions and the PI-18's Safe, Enticing and Alive
- **Level 8**
  - Closing: whether the test was taken seriously (`Demographics_SurveyAccuracy`) — nothing scored, so it opens no results
- **Not asked**
  - Somatic symptoms: Somatic Symptom Scale-8 (SSS-8), **commented out** in `content/block_health.js` — the HiTOP-BR on the same level covers bodily complaints over the year, and the Health face reads the self-rated health single item instead — Pain, Gastrointestinal, Cardiopulmonary, Fatigue (the published 0-32 sum can be taken from the raw answers), averaged into the Health face
  - Social desirability: Brief Social Desirability Scale (BSDS; Haghighat, 2007), its four yes/no questions rewritten as "I…" statements on the HEXACO's scale — **commented out** in `content/block_hexaco.js`, one of its items being the KSE-G's almost word for word
  - Depersonalisation: Cambridge Depersonalisation Scale, 2-item (CDS-2) — **commented out** in `content/block_mood.js`, two HiTOP-BR items on the same level being the same content over twelve months
  - Trauma intrusion: PTSD Checklist, 2-item (PCL-2) — **commented out** in `content/block_mood.js` (September 2026): its first item is HiTOP-BR item 9 over two weeks instead of twelve months, and "Stress", the name it was read back under, misdescribed it. It was the Stress dimension, the middle face of Mood & Health and an axis on the whole-run web
  - Big Six: Mini-IPIP6 (Sibley et al., 2011) — 24 items, four per domain, on a 7-point accuracy scale — written in `content/block_hexaco.js` but commented out, dropped in favour of the HEX-ACO-18 (it re-measures the FIPI's Big Five and overlaps the HiTOP-BR's maladaptive poles)
  - Medical history: diagnosed somatic conditions, one tick-any-number list per bodily system — written in `content/block_health.js` but commented out
  - Job satisfaction: Global Job Satisfaction (GJS) — written in `content/block_UNUSED.js`, named on no level, waiting on an employment item to branch from

In all: 8 levels, 16 questionnaires, 250 items (192 of them scored, 6 of them attention checks) and 9 briefings.


## Questionnaire Ideas

// Being funny, dark humor, political ideology...
// Hormones
- For females, add questions about menstrual cycle phase and contraceptive use. Also add question about last sexual activity. These questions need to be accompanied by a mention of why we are asking them (and the possibility to skip them). Explaining that our conscious experiencs are shaped by our hormonal state which influences cognition and emotion.

// Sleep

// Parasomnias/boundary failures (IOWA/MPS): TODO ASK GIULIA ABOUT VALIDATION OF HER SCALE
// Sleep health (SATED)
// Dreams (DIQ)
// Daytime sleepiness (ESS)

// Family/Work

// Relationship status/satisfaction
// Dependents
// Occupation (and current job satisfaction)
// Sexual orientation (Kinsey scale?)
// WHO scales have stuff that taps into lots of life domains including sex life satisfaction – quite short I think

// Self vs. others

// Attachment style
// Empathy
// Peri-personal space (we created an avatar thingy for this a while back)
// Public/private self-consciousness
// Shame/disgust
// Social connection

// Wellbeing/emotions

// Self-Rated Health
// Meaning in life (including search for meaning). Search: item 8 of the MLQ is asked among the level-1 singles since September 2026. The MLQ Search subscale (Steger et al., 2006) is the only validated measure of it and has no short form. Ranked by item-scale correlation in the original and by factor loading in two later validations (Peru 2022, China 2022), its items run 7 ("I am always searching for something that makes my life feel significant"; best everywhere), 8 ("I am seeking a purpose or mission for my life"), then 10 ("I am searching for meaning in my life"; best in the original, weaker since) and 3 ("I am always looking to find my life's purpose"; the reverse pattern) close together, and 2 ("I am looking for something that makes my life feel meaningful"; weakest everywhere). For the crisis rather than the quest, the MAPS Crisis of Meaning scale (3 items: "I am missing meaning in my life", "I suffer because I can't see any meaning in my life", "My life seems empty to me"). Presence, if wanted: the MLQ-SF (3 items) or the PROMIS Meaning and Purpose 4a
// Self-concept clarity: the one SCCS item is asked among the level-1 singles since September 2026. The full 12-item scale (Campbell et al., 1996) has no validated short form, so more of it would be a selection of our own; the next candidates are "My beliefs about myself often conflict with one another" and "I spend a lot of time wondering about what kind of person I really am", both reverse-keyed
// Dimorphous emotions
// Mattering
// Wisdom
// Aesthetic experiences

// Relationship with AI (for the `bait` block; the "AI psychosis" reports describe a spiral that starts with a bond and ends in revelation, so measure the stages rather than the outcome)

// Two facets on the BAIT's own 0-6 scale, gated behind BAIT_Usage above "Never", under a key prefix of their own, scored without norms and fed back nowhere
// Relationship: I have felt closer to an AI than to most people I know / I would rather talk something through with an AI than with a person / I feel a sense of loss when a conversation with an AI ends or its memory is reset / I talk about things with AI that I don't talk about with people close to me / I have kept how much I talk to AI from the people close to me
// Revelation: I have developed ideas with an AI that I have not been able to share with anyone in my life / AI makes real breakthroughs about the nature of the world accessible to anyone / Through AI, I have come to understand things about myself and the world that most people never will
// The roles people give their chatbot (companion, friend, therapist, romantic partner, sexual partner) as one tick-any-number item, after Buck & Maheux (2026, JMIR), whose GAATES items ("AI helps me make sense of secret messages intended only for me", "I've discovered hidden truths about the world through AI") are the clinical end of the same ground

// Sensory and cognitive

// Imagery (across sensory modalities – short version of PSIQ)
// Sensory sensitivity (esp. visual – this predicts everything!)
// Obsessive compulsive beliefs (perfectionism, intolerance of uncertainty, control of thoughts)
// Cross-modal correspondences
// Paranormal beliefs
// Unusual sensory experiences
// Fantasy proneness
// Psychotic experiences
// Rumination/worry
// Abstract vs. concrete construal