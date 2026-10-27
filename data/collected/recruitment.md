# Recruitment

What each channel the study is shared on is told, word for word, and the `source` its link carries. A run's `source`
is written into its file and its file name, so this is how a run in the deposit is traced back to where it was found.

The ethics application had some invitation text (`ethics/mint_followup/advert.docx`), but it was mostly indicative, and posts are adapted and adjusted for each platform and context.

## Prolific

## SONA

The University of Sussex psychology pool, `sussexpsychology.sona-systems.com`, for course credit. A SONA run walks
`mint` (the core, then the optional levels) and is offered its credit at the interim. How SONA studies are set up in
general, and what makes a name stand out in its list, is in the lab's `Lab/recruitment/sona.md`.

**The study** is experiment 2102, set up on 26 October 2026, approved by the administrator and made active the same
day.
Online External, one part, credit; 2 credits, for a duration of 25 minutes; ages 18 to 99 (SONA's age restriction); ethics code
2026-2817-3620; participants identified by a random code only; the link still shown after taking part, so that
somebody can come back to the optional levels; sign-up and cancellation deadlines of an hour; no emails on sign-up.
Dominique Makowski is its researcher and PI: Asel Tohlukov and Ada Erdem have no researcher account on SONA, which
the pool's administrator (sona-admin@sussex.ac.uk) can make.

**Before it goes live**:

- [x] The client-side completion URL from the study's page on SONA is in `SONA_CREDIT`
      (`content/block_interim.js`), cut after `survey_code=` and encoded, so that its credit token is not in the
      public repository as plain text (how to encode a new one is in the comment over it).
- [x] That change deployed (pushed; the live page serves it, checked 26 October 2026).
- [ ] One SONA run through to the credit link before the study opens, which a draft study cannot be taken for, so
      by hand: `https://realitybendinglab.com/TestYourself/?pid=TEST123&source=SONA&project=mint&test=true`, and the
      button on the interim's last screen should reach SONA's credit page (which refuses a made-up code).
- [x] A timeslot, the one an online study needs for anybody to sign up: open until **Friday 11 December 2026,
      18:00**, the end of the autumn term, with **1000 places** (added 26 October 2026 to end on 26 March 2027 and
      cut back to the end of term the same day; its Modify link, under View/Administer Time Slots, changes either).
- [x] Send Request on the study's page, for the administrator to approve it (approved 26 October 2026).
- [x] Active Study set to Yes (Change Study Information), 26 October 2026: the study is on the list of available
      studies. The name's `&nbsp;` had gone by then (the approval was an edit too) and was typed back in the same
      save.

**After the autumn term**: a new timeslot for the spring term (Add A Timeslot, under View/Administer Time Slots),
ending at the end of that term, since the first one closes on 11 December 2026.

**`source`**: `SONA`, which is also what puts the credit link on the interim's last screen. The Study URL, as entered:

```
https://realitybendinglab.com/TestYourself/?pid=%SURVEY_CODE%&source=SONA&project=mint
```

**Study Name** (99 of the 100 characters allowed, the tags included). The `&nbsp;` in front puts it at the top of the
list sorted by name, and **is lost whenever the study is edited**: the form shows it as the character itself, which
SONA strips on saving, so it has to be typed again each time (see `sona.md`):

```
&nbsp;<b><font color="purple">Do you know yourself?</font></b> The Abyss Test | 25min online 2 cred
```

**25 minutes on SONA, 30 elsewhere.** Everything on SONA (the name, the Duration field, the description and the
preparation) says 25 minutes, which is what the pilots took for the core. The consent form and the approved advert
say 30, the time the 2 credits reward, and are left as they are.

**Brief Abstract** (the line under the name in the list, after "(2 Credits) (Online Study)"):

```
A <b><font color="crimson">fun</font></b> and science-based personality test that <b><font color="green">shows your results!</font></b>
```

**Detailed Description** (the approved advert, with 25 minutes for its 30 and how to claim the credit added):

```
In this online study you will answer questionnaires about yourself, the sensations you notice in your body, your views of artificial intelligence, and your mood and health over the past weeks and months. After each part you will see a graphical summary of your answers. The study takes about 25 minutes and you receive 2 credits for completing it. Afterwards you can carry on with further optional questionnaires for your own interest; they earn no further credit. Please take part on a computer or a phone, in a quiet place, when you have time to finish in one go.

Your credit is claimed at the end of the main part: on the screen saying you have completed it, press "Claim your SONA credit" (it opens in a new tab). You can then stop, or carry on with the optional levels.

Researchers: Dr Dominique Makowski (D.Makowski@sussex.ac.uk), Asel Tohlukov (at775@sussex.ac.uk), Ada Erdem (ae455@sussex.ac.uk), School of Psychology, University of Sussex. If anything goes wrong with your credit, email us.
```

**Eligibility Requirements**:

```
Aged 18 or over.
```

**Preparation**:

```
Please take part on a computer or a phone, in a quiet place, when you have time to finish in one go (about 25 minutes).
```

## Reddit

Engaging rather than formal. A Reddit link walks `all`, so it should advertise a few minutes a level.

A link's `source` (`?s=`, its short form) is `Reddit-<subreddit>`, one for each place it is posted, so that each
post can be counted on its own; letters, digits and hyphens are what survive into the file name. A short code does
as well (`r1` for the first post), keeping the link short, as long as the Log below says where it went.

### Archetypes: Jungian subreddits

The way in is the archetypes level (`start/archetypes/`): the wheel first, in about five minutes, and the rest of the
test after it for anybody who wants to go on.

**Where.** None of these rules could be read from here: read each sidebar first, and ask the moderators by modmail
wherever surveys or self-promotion are not plainly allowed, since a research link posted unasked is often taken down.

| Subreddit           | `source`                  | Link                                                                                     |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| r/Jung              | `Reddit-Jung`             | `https://realitybendinglab.com/TestYourself/start/archetypes/?s=Reddit-Jung`             |
| r/CarlJung          | `Reddit-CarlJung`         | `https://realitybendinglab.com/TestYourself/start/archetypes/?s=Reddit-CarlJung`         |
| r/JungianTypology   | `Reddit-JungianTypology`  | `https://realitybendinglab.com/TestYourself/start/archetypes/?s=Reddit-JungianTypology`  |
| r/personality_tests | `Reddit-personalitytests` | `https://realitybendinglab.com/TestYourself/start/archetypes/?s=Reddit-personalitytests` |
| r/SampleSize        | `Reddit-SampleSize`       | `https://realitybendinglab.com/TestYourself/start/archetypes/?s=Reddit-SampleSize`       |

r/JungianTypology is mostly about cognitive functions (MBTI-style types) rather than archetypes, so it is the one most
likely to find the post off topic.

**How.**

- **Post it as a video**, `assets/recruitment/archetypes.mp4` (18 seconds, 1080×1920, no sound): the landing page,
  the briefing, two statements answered to show how they are asked, and the wheel opening on the dominant
  archetype. The link goes in the text. Where Reddit
  offers a choice of thumbnail, take the wheel (`assets/recruitment/archetypes.jpg` is that frame as a still, for a
  post that allows one picture only). `archetypes.gif` is the same clip for wherever a video will not play.
- **Where only a link post is allowed**, post the link itself: it unfurls into the archetypes card
  (`assets/preview/archetypes.jpg`, "Which story are you living?").
- **Never call it the PMAI or a validated test.** It is the OSAI-PM, written from public descriptions of Pearson's
  framework and still to be validated, which the draft says in plain words; this audience knows the PMAI.
- **Never say what the Agree or Disagree under the wheel is for.** It is data, and readers told what it measures
  would sway it. Asking for people's dominant archetype in the comments is fine.

**Title**


- What are your archetype scores? Scientists made a cool new free 5-minute test of the 12 archetypes
- Scientists made a cool new free test of archetypes
- Cool new "scientific" test of personality archetypes

For r/SampleSize, whose titles start with a tag and end with who may take part:

- [Academic] What's your dominant archetype? A free 5-minute test of the 12 archetypes, results as a wheel (Everyone 18+)


```
Researchers have developed a new test of the 12 archetypes of Carol Pearson's neo-Jungian framework.

Takes 5 minutes, and it is completely free and anonymous (and non-commercial), and pretty fun IMO!

https://realitybendinglab.com/TestYourself/start/archetypes/?s=r1

My dominant archetype was the Caregiver, followed by the Warrior. An interesting mix!
```


```
Researchers have developed a new short test (5min) of the 12 archetypes of Carol Pearson's neo-Jungian framework.

My dominant archetype was the Caregiver, followed by the Warrior. An interesting mix!

https://realitybendinglab.com/TestYourself/start/archetypes/?s=r1
```


## Log

Where and when each link went out.

| Date | Channel | `source` | By | Notes |
| ---- | ------- | -------- | -- | ----- |
|      |         |          |    |       |
