# The Abyss Test

## Aim

Create a big online survey with flexible setup. Cool looking and rewarding to do, engaging and motivating to continue.
Include "gamified" mechanisms, such as unlocking rewards, e.g., in the form of "assessment" charts (e.g., personality radar charts, interpretations, etc).

## Includes

- **Level 1**
  - Demographics 1: Gender (and, on that answer, sex assigned at birth and gender identity), Age, Birth Month, and — on the month — which side of that month's zodiac cusp the day fell (`DayBirth`, one item that words its two halves from the month just given, plus "I'd rather not say", so the star sign is known without a date of birth being asked)
  - Big-5: Five-Item Personality Inventory (FIPI) — Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness. **Read back as two old theories and nothing else**: the star sign (from the birth month and cusp half) beside the temperament (Galen's four humours on Eysenck's two axes, from Extraversion and Emotional Stability against their norms), each a name and a few keywords with agree/disagree; no rows, since the HEXACO on level 4 draws the same ground in full, and the other three norms commented out; kept off the whole-run web (`profile: false`)
  - Single-item scales, asked in among one another as one shuffled run. None carries norms, so none opens a results row and none is on the whole-run profile web or card; only Life Satisfaction carries a dimension at all (scored and saved, shown nowhere):
    - Narcissism: Single Item Narcissism Scale (SINS)
    - General health: Single-Item Self-Rated Health (SRH)
    - Stress: Single-Item Measure of Stress Symptoms (SIMS)
    - Self-esteem: Single-Item Self-Esteem Scale (SISE)
    - Self-efficacy: General Self-Efficacy Single-Item (GSE-SI)
    - Life satisfaction: Single-Item Life Satisfaction Scale (SILS)
    - Attractiveness
    - Intelligence
- **Level 2**
  - Demographics 2: Education, Discipline, Student status, Ethnicity, Country (each with an "other, please say" behind it)
  - Interoception: Multidimensional Interoceptive Traits (MINT) — Bodily Awareness, Bodily Sensitivity, Bodily Clarity. 34 items, on one of two 7-point scales drawn per participant. Carries an attention check (the BAIT below carries the run's other one)
- **Level 3** — demographics first, then the `mood` and `health` blocks, each behind a briefing of its own, in a random order, then the `hitop` block behind a briefing of its own. `phq4` and the Dissociation questionnaire are read back together as one "Mood & Health" section — three faces, Mood, Stress and Health (the last reading the self-rated health single item from level 1), each with a general reading of what it tends to mean — the level's one section; the HiTOP-BR is asked and scored but fed back nowhere
  - Demographics 3: Perceived household financial comfort and the national MacArthur Scale of Subjective Social Status
  - Mood: Patient Health Questionnaire-4 (PHQ-4), refined 5-option version — Anxiety and Depression, summed as the PHQ-4's own distress score rather than averaged
  - Stress (called Strain until September 2026): PTSD Checklist, 2-item (PCL-2), on the same 5-option response format as the PHQ-4. The Cambridge Depersonalisation Scale, 2-item (CDS-2), used to be pooled into the same dimension and is commented out
  - Sleep: Single-Item Sleep Quality Scale (SQS) — asked, scored and saved, but not one of the three faces and without norms, so shown nowhere (no row, no axis on the whole-run profile web or card)
  - Psychiatric history: diagnoses currently lived with, and the treatments received for them — two tick-any-number lists, asked and saved but scored and fed back nowhere
  - Symptoms & maladaptive traits: Hierarchical Taxonomy of Psychopathology Brief Report (HiTOP-BR; Simms et al., 2026, as shipped in the {hitop} R package) — 45 statements about significant times in the last 12 months, on a 4-point scale, no reversed items, scored as the mean of each of six spectra, **renamed for the public** — Bodily Complaints (Somatoform), Emotional Distress (Internalizing), Unusual Experiences (Thought Disorder), Social Withdrawal (Detachment), Impulsivity (Disinhibition), Dominance (Antagonism) — with the mapping one-to-one, so the scoring is untouched (the Externalizing superspectrum and the p-factor can be taken from the raw answers). Item keys are the package's own (`HBR_01`–`HBR_45`), so a saved file scores with `score_hitopbr()` as it is. The only questionnaire whose norms are not invented: the development-sample means and SDs of Simms et al. (N = 780). **Fed back nowhere** (`results: false`, September 2026 — it had a spider chart with a row per spectrum, dropped so that the level reads as the one Mood & Health section) and **kept off the whole-run profile web and card** (`profile: false`): symptom spectra on one polygon with Openness read as more of the same kind of thing
- **Level 4** — one block, `personality`: a briefing, then the HEXACO with the KSE-G dealt in among its items. Read back as a spider chart with a row per domain
  - HEXACO: HEX-ACO-18 (Olaru & Jankowsky, 2022) — 18 items, three per domain, each from a different HEXACO-100 facet, on the HEXACO's 5-point agreement scale: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness (eleven items reverse-keyed). **Read back in full**, as a spider chart with a row per domain, and on the whole-run web and card. The domains carry plain names — Honesty-Humility, Emotionality, and Sociability, Patience, Diligence, Curiosity for eXtraversion, Agreeableness, Conscientiousness and Openness — both because the HEXACO's constructs are not the Big Five's and because a dimension is one name across the run, so the FIPI's names could not be reused. **Dealt in among its items: the Social Desirability-Gamma Short Scale (KSE-G; Kemper et al., 2014)** — six "I…" statements, three exaggerating positive qualities (PQ+) and three minimising negative ones (NQ−, reverse-keyed), on the HEXACO's agreement scale so that they blend in; scored as two dimensions, no norms, fed back nowhere
- **Level 5**
  - Attitudes towards AI: Beliefs about Artificial Images Technology (BAIT), the union of the 2.1B (FictionEro study 2) and 2.2 (FakeArt) administrations — 26 statements under harmonised item names, plus the AI knowledge and usage singles asked first and the "answer all the way to the right" attention check. Scored per the pooled validation's BAIT-8 — AI Realism (4 items), AI Enthusiasm and AI Apprehension (2 each) — and read back as an **archetype**: which of three answer profiles from a cluster analysis of the pooled samples the answers are nearest — the Untroubled (worry well below average, enthusiasm high, capability beliefs average), the Uneasy Realist (AI output realistic and hard to spot, and dangerous with it) and the Unconvinced (unimpressed and unenthused) — with the (placeholder) share of people answering the same way
- **Level 6**
  - Archetypes: the Open Source Archetype Indicator – Pearson-Marr (OSAI-PM) — twelve three-item scales after Carol S. Pearson and Hugh Marr's twelve-archetype framework (PMAI): Idealist, Sage, Seeker, Revolutionary, Magician, Warrior, Realist, Jester, Lover, Creator, Ruler, Caregiver. An open paraphrase written from public descriptions of the framework rather than from the PMAI's own items (first person, no absolutes or in-item comparisons, one claim per item; the third item of each scale covers a facet the first two leave out), to be validated independently of the original instrument — so unvalidated as yet. Deliberately **without norms**, unlike everything else fed back here: the twelve are read against each other rather than against other people, as a coloured wheel of twelve petals with whichever came out loudest named underneath. The wheel is the only place they are drawn: they take no axes on the whole-run profile web or card, which carry the six HEXACO domains, the three MINT dimensions and Stress
- **Level 7**
  - Closing: whether the test was taken seriously — nothing scored, so it opens no results
- **Not asked**
  - Somatic symptoms: Somatic Symptom Scale-8 (SSS-8), **commented out** in `content/block_health.js` — the HiTOP-BR on the same level covers bodily complaints over the year, and the Health face reads the self-rated health single item instead — Pain, Gastrointestinal, Cardiopulmonary, Fatigue (the published 0-32 sum can be taken from the raw answers), averaged into the Health face
  - Social desirability: Brief Social Desirability Scale (BSDS; Haghighat, 2007), its four yes/no questions rewritten as "I…" statements on the HEXACO's scale — **commented out** in `content/block_personality.js`, one of its items being the KSE-G's almost word for word
  - Depersonalisation: Cambridge Depersonalisation Scale, 2-item (CDS-2) — **commented out** in `content/block_mood.js`, two HiTOP-BR items on the same level being the same content over twelve months
  - Big Six: Mini-IPIP6 (Sibley et al., 2011) — 24 items, four per domain, on a 7-point accuracy scale — written in `content/block_personality.js` but commented out, dropped in favour of the HEX-ACO-18 (it re-measures the FIPI's Big Five and overlaps the HiTOP-BR's maladaptive poles)
  - Medical history: diagnosed somatic conditions, one tick-any-number list per bodily system — written in `content/block_health.js` but commented out
  - Job satisfaction: Global Job Satisfaction (GJS) — written in `content/block_UNUSED.js`, named on no level, waiting on an employment item to branch from

In all: 7 levels, 14 questionnaires, 208 items (160 of them scored) and 8 briefings.


## Questionnaire Ideas

// Hormones
- For females, add questions about menstrual cycle phase and contraceptive use. Also add question about last sexual activity. These questions need to be accompanied by a mention of why we are asking them (and the possibility to skip them). Explaining that our conscious experiencs are shaped by our hormonal state which influences cognition and emotion.

// Sleep

// Single-Item Sleep Quality Scale
// Parasomnias/boundary failures (IOWA/MPS)
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
// Self-esteem
// Self-concept clarity (I have a clear sense of who I am and what I am)
// Social connection

// Wellbeing/emotions

// Self-Rated Health
// Single-Item Measure of Stress Symptoms
// Meaning in life (including search for meaning)
// Dimorphous emotions
// Mattering
// Wisdom
// Aesthetic experiences

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