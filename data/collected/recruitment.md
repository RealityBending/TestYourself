# Recruitment

What each channel the study is shared on is told, word for word, and the `source` its link carries. A run's `source`
is written into its file and its file name, so this is how a run in the deposit is traced back to where it was found.

SONA and Prolific use the invitation text sent with the ethics application, `ethics/mint_followup/advert.docx`
(version 1, 4 October 2026; ethics reference 2026-2817-3620). It was indicative, and posts elsewhere are written in a
voice of their own.

## Links

Every link carries a `source`. **SONA and Prolific carry `project=mint`**: the core first, then the debrief and the
credit. **Reddit carries none, and walks `all`**: every level, in the order the person chooses, with no core and no
interim. An `all` run is told it can stop after any level and is given the debrief at the foot of the consent
form instead. Those two paragraphs were written after the approval, so they belong in the next amendment.

| Channel                     | `source`                  | Link                                                                                              | Reward                               |
| --------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| SONA                        | `SONA`                    | `https://realitybendinglab.com/TestYourself/?project=mint&source=SONA&pid=%SURVEY_CODE%`          | 2 credits                            |
| Prolific                    | `Prolific`                | `https://realitybendinglab.com/TestYourself/?project=mint&source=Prolific&pid={{%PROLIFIC_PID%}}` | paid, at least the University's rate |
| Reddit, r/personality_tests | `Reddit-personalitytests` | `https://realitybendinglab.com/TestYourself/?source=Reddit-personalitytests`                      | none                                 |
| Reddit, r/astrology         | `Reddit-astrology`        | `https://realitybendinglab.com/TestYourself/?source=Reddit-astrology`                             | none                                 |
| Reddit, r/SampleSize        | `Reddit-SampleSize`       | `https://realitybendinglab.com/TestYourself/?source=Reddit-SampleSize`                            | none                                 |

- **`SONA` must be written exactly that way** (any case): it is what offers the credit link at the end of the core.
  A source starting `SONA` or `Prolific` is filed under that platform on the participant's account.
- **A social media source is `<Platform>-<place>`** (`Reddit-SampleSize`, `Bluesky-lab`), one for each place a link
  is posted, so that each post can be counted on its own. Letters, digits and hyphens are what survive into the
  file name.
- **A link to the root unfurls into the wheel**, the test's own card. One through `p/mint/` unfurls into the MINT's
  picture instead and is otherwise the same run: use it where the body is the hook.

## SONA

As approved, word for word.

- **Study name**: Your body, your mind - validating a questionnaire on bodily sensations
- **Brief abstract**: An online questionnaire study about how people notice and make sense of the signals from
  inside their body.
- **Description**: In this online study you will answer questionnaires about yourself, the sensations you notice in
  your body, your views of artificial intelligence, and your mood and health over the past weeks and months. After
  each part you will see a graphical summary of your answers. The study takes about 30 minutes and you receive 2
  credits for completing it. Afterwards you can carry on with further optional questionnaires for your own interest;
  they earn no further credit. Please take part on a computer or a phone, in a quiet place, when you have time to
  finish in one go.
- **Eligibility**: aged 18 or over.
- **Duration**: 30 minutes. **Credits**: 2.
- **Researchers**: Dr Dominique Makowski (D.Makowski@sussex.ac.uk), Asel Tohlukov (at775@sussex.ac.uk), Ada Erdem
  (ae455@sussex.ac.uk), School of Psychology, University of Sussex.

Set up as an online external study. Its client-side completion URL, cut after `survey_code=`, goes into
`SONA_CREDIT` at the head of `content/block_interim.js`, where a placeholder still stands.

## Prolific

The SONA description with the payment in place of the credit, as the approved advert says.

- **Title**: Your body, your mind - validating a questionnaire on bodily sensations
- **Description**: In this online study you will answer questionnaires about yourself, the sensations you notice in
  your body, your views of artificial intelligence, and your mood and health over the past weeks and months. After
  each part you will see a graphical summary of your answers. The study takes about 30 minutes and you are paid for
  completing it. Afterwards you can carry on with further optional questionnaires for your own interest; they are
  not paid. Please take part on a computer or a phone, in a quiet place, when you have time to finish in one go.
- **Eligibility**: aged 18 or over.
- **Time**: 30 minutes. **Pay**: at least the University's minimum rate for 30 minutes.

**Not ready yet**: the app does not yet give Prolific participants a completion code.

## Social media

The approved post, word for word:

> How well do you know your own body? Take part in a University of Sussex study on how people sense the signals from
> inside their body, and see a summary of your own answers as you go. About 30 minutes, online, anonymous, 18+.
> [link to the study]

Post from the research group's own account, as the application says (6.3.1), not from a personal one.

### Reddit

Engaging rather than formal. A Reddit link walks `all`, so the drafts promise a few minutes a level rather than a
30-minute main part.

**Where.** Read each subreddit's rules before posting, and ask its moderators by modmail wherever surveys or
self-promotion are not plainly allowed: a research link posted unasked is often taken down. (The rules could not be
read from here, so none below is confirmed.)

| Subreddit           | Draft            | `source`                  |
| ------------------- | ---------------- | ------------------------- |
| r/personality_tests | A                | `Reddit-personalitytests` |
| r/astrology         | B                | `Reddit-astrology`        |
| r/SampleSize        | A, its own title | `Reddit-SampleSize`       |

**How.**

- **Post it as an image**, `assets/readme/general.jpg` (level 1 at stand-in answers), with the link in the text.
  It shows the hook better than any link preview.
- **Say what comes after level 1.** The star sign is the first stop of a test of the body, AI, mood and more, and
  a post promising astrology alone brings people who leave at level 2.
- **Never say the study tests whether astrology works.** The agree or disagree under the star card is data, and
  readers told what it is for would sway it. "See how well either of them holds up", which the page itself says,
  is as far as it goes.
- Runs from an astrology subreddit will lean towards people who believe in it. Their `source` keeps them apart in
  the analysis.

#### Draft A: personality subreddits

**Title**

```
We built a personality test you descend into, level by level, and every level ends with a new picture of you (free, anonymous, a few minutes a level)
```

For r/SampleSize, whose titles start with a tag and end with who may take part:

```
[Academic] A personality test you descend into, level by level, with a new picture of you at every level (Everyone 18+)
```

**Body**

```
We're a psychology lab at the University of Sussex, and we got a bit tired of personality tests that ask a hundred questions and hand you back four letters. So we built **The Abyss**: a test you go down into one level at a time, choosing where to go next, and every level you finish is drawn as a picture of you.

Some of what's down there:

- **Level 1**: your star sign and your temperament (sanguine, choleric, phlegmatic or melancholic), read side by side, the way an astrologer and a physician of ancient Greece would have read you
- **Your body**: how clearly you sense your heartbeat, your breathing and your gut, drawn as a brain wired to your organs
- **You and AI**: is AI a Trusty Gadget, a Companion, a Rogue Machine or an Impostor to you?
- **Your last year**: drawn as the hill you've been climbing
- ...and your character, the twelve archetypes in you, the world as you see it, your mind and heart, and where you stand on the big questions

Each level takes a few minutes and ends with its own results, so you can stop whenever you like. Free, anonymous (no name, email or IP address recorded), 18+ only, and it works on a phone. It's also real research: we're validating a new questionnaire on how people sense their own body, so every answer helps.

Take the test: https://realitybendinglab.com/TestYourself/?source=Reddit-personalitytests

Which level surprised you most? Tell us in the comments!

Questions? Ask below or email D.Makowski@sussex.ac.uk. (Ethics approval: University of Sussex, 2026-2817-3620.)
```

On r/SampleSize, the link's `source` is `Reddit-SampleSize`.

#### Draft B: astrology subreddits

**Title**

```
Your star sign vs. the four temperaments of ancient Greek medicine: which one reads you better? (free test)
```

**Body**

```
Hi everyone! We're a psychology lab at the University of Sussex, and we built a free personality test that opens with two of the oldest ways of reading a person: the sign you were born under, and the four temperaments of ancient Greek medicine (sanguine, choleric, phlegmatic and melancholic).

Give it your birthday and answer a few questions, and you get both side by side: your sign lit up on Albrecht Dürer's 1515 map of the sky, and your temperament pinned on a sixteenth-century woodcut of the four humours. (Sun sign only: we don't ask for your birth time or place.)

From there the test goes deeper, one level at a time and in the order you choose, and each level ends with a new picture of you: how clearly you sense your own body, what you make of AI, how your last year has felt, your character, your archetypes and more. You can stop after any level.

Free, anonymous (no name, email or IP address recorded), 18+ only, a few minutes a level, and it works on a phone. It's real research too: we're validating a questionnaire on how people sense their body.

Find your sign: https://realitybendinglab.com/TestYourself/?source=Reddit-astrology

Tell us your sign and your temperament in the comments!

Questions? Ask below or email D.Makowski@sussex.ac.uk. (Ethics approval: University of Sussex, 2026-2817-3620.)
```

## Log

Where and when each link went out.

| Date | Channel | `source` | By | Notes |
| ---- | ------- | -------- | -- | ----- |
|      |         |          |    |       |
