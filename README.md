# The Abyss Test

## Aim

Create a big online survey with flexible setup. Cool looking and rewarding to do, engaging and motivating to continue.
Include "gamified" mechanisms, such as unlocking rewards, e.g., in the form of "assessment" charts (e.g., personality radar charts, interpretations, etc).

## Includes

- **Level 1**
  - Demographics 1: Gender (and, on that answer, sex assigned at birth and gender identity), Age, Birth Month
  - Big-5: Five-Item Personality Inventory (FIPI) — Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness
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
- **Level 3** — demographics first, then the `mood` and `health` blocks, each behind a briefing of its own, in a random order. `phq4`, the Dissociation questionnaire and the SSS-8 are read back together as one "Mood & Health" section — three faces, Mood, Strain and Health, each with a general reading of what it tends to mean — rather than as three sections of their own
  - Demographics 3: Perceived household financial comfort and the national MacArthur Scale of Subjective Social Status
  - Mood: Patient Health Questionnaire-4 (PHQ-4), refined 5-option version — Anxiety and Depression, summed as the PHQ-4's own distress score rather than averaged
  - Strain: Cambridge Depersonalisation Scale, 2-item (CDS-2), and PTSD Checklist, 2-item (PCL-2), on the same 5-option response format as the PHQ-4 and pooled into one Strain dimension
  - Sleep: Single-Item Sleep Quality Scale (SQS) — asked, scored and saved, but not one of the three faces and without norms, so shown nowhere (no row, no axis on the whole-run profile web or card)
  - Somatic symptoms: Somatic Symptom Scale-8 (SSS-8) — Pain, Gastrointestinal, Cardiopulmonary, Fatigue (the published 0-32 sum can be taken from the raw answers), averaged into the Health face
  - Psychiatric history: diagnoses currently lived with, and the treatments received for them — two tick-any-number lists, asked and saved but scored and fed back nowhere
- **Level 4**
  - Attitudes towards AI: Beliefs about Artificial Images Technology (BAIT), the union of the 2.1B (FictionEro study 2) and 2.2 (FakeArt) administrations — 26 statements under harmonised item names, plus the AI knowledge and usage singles asked first and the "answer all the way to the right" attention check. Scored per the pooled validation's BAIT-8 — AI Realism (4 items), AI Enthusiasm and AI Apprehension (2 each) — and read back as an **archetype**: which of three answer profiles from a cluster analysis of the pooled samples the answers are nearest — the Untroubled (worry well below average, enthusiasm high, capability beliefs average), the Uneasy Realist (AI output realistic and hard to spot, and dangerous with it) and the Unconvinced (unimpressed and unenthused) — with the (placeholder) share of people answering the same way
- **Level 5**
  - Archetypes: twelve two-item scales after Carol S. Pearson's twelve-archetype framework (PMAI) — Idealist, Sage, Seeker, Revolutionary, Magician, Warrior, Realist, Jester, Lover, Creator, Ruler, Caregiver. The statements are paraphrased and theoretically inferred rather than the PMAI's own, written for the Neuropsychological Tarot prototype and revised here (first person, no absolutes or in-item comparisons, one claim per item), so the instrument is unvalidated. Deliberately **without norms**, unlike everything else fed back here: the twelve are read against each other rather than against other people, as a coloured wheel of twelve petals with whichever came out loudest named underneath. The wheel is the only place they are drawn: they take no axes on the whole-run profile web or card, which carry only the Big Five, the three MINT dimensions and Strain
- **Level 6**
  - Closing: whether the test was taken seriously — nothing scored, so it opens no results
- **Not asked**
  - Medical history: diagnosed somatic conditions, one tick-any-number list per bodily system — written in `content/block_health.js` but commented out
  - Job satisfaction: Global Job Satisfaction (GJS) — written in `content/block_UNUSED.js`, named on no level, waiting on an employment item to branch from

In all: 6 levels, 13 questionnaires, 136 items (88 of them scored) and 6 briefings.


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