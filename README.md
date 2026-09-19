# The Abyss Test

The big dispositional characteristics survey.

## Includes

What the test currently asks — every questionnaire, its reference and its
dimensions — is the **Content** slide of [the documentation deck](docs/index.html),
which is where that table now lives. Open `docs/index.html`; it needs nothing
installed. **Adding, removing or renaming anything in `content/` means updating
it in the same breath.**

## Batteries

A study may ask a subset of the blocks above: `?battery=<name>` in the link picks one of the presets in `content/timeline.js` (`?only=` and `?skip=` list blocks by hand, for testing). The closing items are always asked.

| Battery       | Blocks                                                          |
| ------------- | --------------------------------------------------------------- |
| *(none)*      | Everything in the Includes table, in order                      |
| `personality` | demographics1, fipi, singles, demographics2, hexaco, archetypes |
| `ai`          | demographics1, demographics2, bait                              |

## Questionnaire Ideas



// Coping

// Being funny, dark humor

// Wordsum: g-factor loaded https://x.com/cremieuxrecueil/status/2098586478443901419?s=20

// Hormones
- For females, add questions about menstrual cycle phase and contraceptive use. Also add question about last sexual activity. These questions need to be accompanied by a mention of why we are asking them (and the possibility to skip them). Explaining that our conscious experiences are shaped by our hormonal state which influences cognition and emotion.

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

// political ideology

// https://taketest.xyz/
// Words Can Harm Scale (WCHS)
// Nietzscheanism

Synthetic data
- https://openrouter.ai/
- https://github.com/browser-use/browser-use
- https://pypi.org/project/surveyshield-py/0.2.0/
- https://survey-shield.com/