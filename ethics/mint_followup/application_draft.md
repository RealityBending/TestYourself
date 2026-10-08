# Ethical Review Application — MINT validation follow-up

**Study:** follow-up to the MINT validation study (parent reference
**ER/MB2021/2**, with amendment ER/MB2021/3, "Validation of the MINT
questionnaire"; <https://github.com/RealityBending/InteroceptionScale>).

This draft follows the University's new **Main Ethics Application Form**
(numbered 1.0 to 9.16), which replaced the old A1–A10 / B1–B22 form on
Sussex Direct. What the applicants have entered so far is
`draft_041026.pdf` beside this file (exported 4 October 2026), and §1 below
goes through it question by question. **The form takes plain text only.**

---

## 0. TODO

**The application is complete** (4 October 2026: every field filled in and
every document uploaded; to be submitted on 5 October). What is left is the
app and the data, before the study launches.

**The aim is an approval with as little friction as possible** (the author's
call, 24 September 2026): this list holds errors and things the study cannot
run without, not disclosures for their own sake. Implementation details (the
share links, DataPipe's infrastructure) stay out of the application, and
anonymity is argued at the level of the compiled data file, which a script
makes from the raw files and which is where the researchers work.

### Before launch (the app and the data)

- [ ] **The reference**: once approved, put it in place of `XX/XXXX/XX` in
  `index.html` (and in `consent_form.docx`, highlighted, if it is kept).
- [ ] **Recruitment links** carry `?project=mint` (without it a participant
  gets the whole test, including the sexuality level, which is not in this
  application); SONA's also `&source=SONA&pid=%SURVEY_CODE%`.
- [ ] **SONA credit URL**: replace the placeholder `SONA_CREDIT` in
  `content/block_interim.js` once the study is set up on SONA (2 credits).
- [ ] **Prolific completion**: the app has no Prolific completion URL. Build
  one on the debrief screen, or drop Prolific from 6.1, 6.3.1, 7.6.1 and the
  description.
- [ ] **Check the core's length on the first runs**: if the median time to
  the end of the core is well over 30 minutes, the credit and the consent
  form's duration want raising, by amendment.
- [ ] **Do not publish the DataPipe deposit as it is**: it holds the raw files
  (platform codes, days of birth, unscreened comments). Publish the compiled
  file as a record of its own, then delete the raw files as 9.8 says.
- [ ] **Raw data storage**: `data/collected/raw/` is in Dropbox; 9.4.1, 9.5 and
  9.8 say University-approved storage.
- [ ] **Real norms** after the pilot (all but the MINT's and the HiTOP-BR's are
  placeholders, read to participants as comparisons with other people).
- [ ] **Remove the test-mode consent bypass** (`checkConsent` in `js/app.js`).
- [ ] Optional: **"Prefer not to say"** on the diagnoses and treatment
  questions. Not on gender, which stays mandatory (Male, Female, Other;
  decided 5 October 2026).

**Decided on 4 October 2026**: 1.0's "personal data" unticked, with 6.9 No to
match, and 5.7 kept Yes because the demographics ask for ethnic origin; 6.7 No,
the question being about third-party material and the figures being the
study's own; 7.6.1 names no funder for Prolific, which leaves the research
budget understood; 9.1 No, the question being about transfers between
institutions in a collaboration; the core takes 20 to 25 minutes (4.0.1) and is rewarded as 30, 2 SONA
credits, to allow for slower participants (consent form, advert, 7.6.1);
the committee is the Faculty Research Ethics Committee: Science, Engineering
and Technology (F-REC), formerly the Sciences & Technology Cross-Schools
Research Ethics Committee (C-REC), at frecsemset@sussex.ac.uk.

**Note**: `ethics/mint_validation/Consent.pdf` carries ER/EB672/2 and names Ana
Neves, while the parent application is ER/MB2021/2 (Maisie Bennett), and the
comment in `index.html` calls it "the MINT study's own sheet". Nothing in the
form depends on it any more.

---

## 1. The form, question by question

"As filled" is what `draft_041026.pdf` holds. **OK** means leave it; anything
else has text to paste or a change to make. Text blocks are plain text, ready
to paste.

### Screening and project details

- **1.0** — Human participants ticked; personal data unticked (decided, see §0). OK.
  Everything else unticked, OK.
- **2.0** — New application. OK.
- **2.1** — "Placement Project: MINT questionnaire validation follow-up". OK.
- **Applicant** — Miss Asel Tohlukov, at775@sussex.ac.uk, Undergraduate,
  Faculty of Social Sciences, Psychology. OK.
- **Supervisor** — Dr Dominique Makowski, D.Makowski@sussex.ac.uk. OK.
- **2.2** — Yes, ER/MB2021/2. OK.
- **2.5** — Yes: Miss Ada Erdem, ae455@sussex.ac.uk, Undergraduate. OK. Add
  her under Roles if she needs access. The consent sheet and the debrief name
  only Dr Makowski and Asel Tohlukov as contacts, which is fine.
- **2.7** — No. OK.
- **2.13** — No. Done.
- **3.0** — 06/10/2026. Done (move it again if submission slips).
- **3.1** — 01/10/2028. OK.
- **3.2** — Research. OK.
- **3.5** — No. OK.
- **3.6** — No (primary data collection). OK.

### 4.0.1 Background summary and context — done

Shortened to the core: the measures in detail are in 4.1.1, and the reasons
for the demographics in 5.7.1.

```
This study is an online survey continuing the validation of the MINT, a new
questionnaire measuring interoception: how people sense and make sense of the
signals from inside their body, such as their heartbeat, breathing or stomach.
The previous study (ER/MB2021/2) established the structure of the MINT and its
relationships with other interoceptive scales. The present study repeats its
design, procedure, recruitment, consent arrangements and data handling, with the
same research team, in a new and larger sample, to replicate that structure and
to examine the MINT's convergent and discriminant validity.

The core of the study, completed by all participants and the only part for
which credit or payment is given, takes about 20 to 25 minutes. After the
information sheet and consent form, participants answer:

- standard demographic questions, the same set our group collects across its
  studies (see 5.7.1);
- a brief personality inventory and single-item trait scales;
- the MINT, the questionnaire being validated;
- a questionnaire on beliefs about artificial intelligence (BAIT);
- symptom measures: anxiety and depression (PHQ-4), sleep quality, mental
  health history and the HiTOP Brief Report.

The MINT, the PHQ-4, the measure of life satisfaction, the mental health
history, the measure of somatic complaints and the demographic questions were
also asked in the previous study.

After each part, participants see a descriptive, non-diagnostic graphical
summary of their answers. When the core is complete they are debriefed and
given their credit, and may then stop, or continue through an optional set of
further questionnaires for their own interest, which carries no reward. The
measures, their order and the optional set are described under 4.1.1.
```

### 4.0.2 Research question and/or hypothesis — done

No directional hypothesis per MINT dimension is written; add any the team
holds.

```
The study asks three questions about the MINT:

1. Does the structure found in its first validation replicate in a new and
   larger sample? We expect its three dimensions (Bodily Awareness, Bodily
   Sensitivity and Bodily Clarity) to be recovered.
2. Does it show convergent and discriminant validity? We expect it to relate
   to measures of emotion regulation, emotion reactivity and affective and
   somatic symptoms, and to be distinct from general personality traits and
   from beliefs unrelated to the body.
3. Does the response format change the answers? Each participant is randomly
   assigned one of three formats (two seven-point scales labelled differently,
   or a slider), all scored the same way, to test whether the way a scale is
   presented affects responses to it.

Exploratory: how the MINT's dimensions relate to the six dimensions of
psychopathology of the HiTOP Brief Report, which describes mental ill health as
dimensions rather than diagnoses.
```

### 4.0.3 Rationale and expected benefits — done

```
Interoception, the sensing and interpretation of signals from inside the body,
is linked to emotion, self-awareness and mental health, but the questionnaires
that measure it differ in what they capture. The MINT was developed to measure
interoceptive traits more precisely. A new questionnaire is only useful once
its structure has been replicated and its relationships with other constructs
established in independent samples, which is what this study does. Testing
whether the response format changes the answers is relevant to questionnaire
research in general, and relating the MINT to the HiTOP framework places it
within a current dimensional model of mental health.

Expected benefits: for the research community, a validated, freely available
measure of interoception and an openly shared, de-identified dataset. For
participants, an engaging survey that gives them immediate, descriptive feedback
on each part, a debrief explaining the study, and, for students, first-hand
experience of taking part in research. Participants' own judgements of whether
the feedback describes them are themselves informative about how well the
measures work.
```

### 4.1 Methods — Questionnaires. OK.

### 4.1.1 Details on methods — done

The attention-check sentence that opened it is gone (see §0).

```
The core set, completed by all participants, is:

- The MINT, the instrument under validation.
- A brief personality inventory (Five-Item Personality Inventory; Gosling et
  al., 2003) and a set of single-item trait scales measuring self-esteem,
  self-concept clarity, self-efficacy, meaning in life, life satisfaction,
  narcissism, self-rated health, perceived stress and the valuing and seeking
  of beauty, and two self-placements (how intelligent and how attractive the
  participant thinks they are, compared with other people).
- A questionnaire on beliefs about artificial intelligence technology (BAIT).
- Symptom measures: the PHQ-4, a single-item measure of sleep quality, reported
  mental health history, and the HiTOP Brief Report (Simms et al., 2026), which
  measures six dimensions of psychopathology over the past twelve months.

The optional set, offered after the core set, is:

- A fuller personality inventory (HEX-ACO-18; Olaru & Jankowsky, 2022) together
  with a short social desirability scale (KSE-G; Kemper et al., 2014).
- Questions inspired by the Pearson-Marr archetype indicator (PMAI).
- Five further scales of the Primals Inventory (Clifton et al., 2019).
- A short untimed reasoning test (ICAR-16 Sample Test; Condon & Revelle, 2014).
- Brief measures of attention and self-control (two items each from the ASRS,
  the Cognitive Failures Questionnaire, the Mind Wandering Scale and the Brief
  Self-Control Scale), six items of the Emotion Reactivity Scale and the short
  form of the CERQ.
- A set of questions on social and political views: a left-right
  self-placement (the European Social Survey item), three items adapted from
  the Conspiracy Mentality Questionnaire (Bruder et al., 2013), thirty-two
  agree/disagree statements on economic redistribution and social order
  (adapted from the British Social Attitudes scales; Evans et al., 1996),
  equality of outcomes between groups, human enhancement and heredity, the
  climate, nuclear power and the moral standing of animals, how much
  beauty should count against cost and use, and whether words alone can do
  lasting harm (adapted from the Words Can Harm Scale; Pratt et al., 2026),
  a question on whether a range of views or a range of backgrounds matters
  more, and a question on diet, most of them written or adapted for this
  study. These are political opinions and are treated as special category
  data (see 5.7.1 and 5.9.1); they are collected anonymously like the health
  items, and the feedback on them shows no percentile or ranking.

The survey always opens with age, month and day of birth and gender, and the
brief trait scales. The participant then chooses the order of the three
remaining parts of the core set (the MINT, the AI beliefs questionnaire, and
the symptom measures): two of them, drawn at random for each participant, are
offered first, and the participant picks which to answer, then picks between
the one left and the third. The random draw means that no one instrument is
always answered first and none always answered last. The other demographic
questions open the second part, whichever it is (education, field of study,
student status, ethnicity and country), and the third (financial comfort and
social status). The items within each questionnaire are presented in a random
order, except where an instrument was validated in a fixed order, in which case
that order is kept. The optional questionnaires are offered three at a time,
the participant choosing which to answer next. In both sets the choice changes
only the order, never what is asked.

The complete list of every questionnaire and every item asked, with its source
and reference, is published as part of the study documentation and can be
consulted at https://realitybendinglab.com/TestYourself/docs/ (select the
"Content" slide, and any row of the table to see that instrument's items). A
PDF copy is attached under 6.6.1.

Optional continuation

After completing the core set, participants are told that they have completed
the main part of the study and are given the link that awards their credit.
They may then either stop or continue through the optional questionnaires for
their own interest. The continuation is entirely voluntary, carries no
additional reward, and may be abandoned at any point; receiving credit does not
depend on it, and participants are told so.

Feedback and debriefing

After each part, participants are shown a graphical summary of their own
answers, and are asked whether it matches their experience of themselves and
how they found that part of the survey. These responses are themselves
informative about how well the measures describe people. The summary is
descriptive and explicitly non-diagnostic: no clinical label, cut-off or risk
score is shown at any point.

When the core set is complete, participants are asked whether they took the
survey seriously, may write any comments they wish to share, and are shown a
debriefing screen stating the aim of the study, explaining interoception and
the random assignment of the response format, reminding them that their
answers are confidential and stored de-identified, giving the research team's
contact details and signposting sources of support. Those who continue through
the optional set are asked the same two questions again at the end.
```

- **4.2** — No. OK. **4.3** — No. OK.

### Risk

- **5.0** — No. OK.
- **5.1** — No. OK.
- **5.2** — No. Done.
- **5.3** — No. OK. **5.4** — No. OK. **5.5** — No. OK. **5.6** — No. OK.
- **5.7** — Yes. OK.

### 5.7.1 Why special category data are necessary — done

The two paragraphs pasted are fine; add the third, since the field asks about
the health and political items too, not only the demographics.

```
Participants are asked to report their age, gender, ethnicity, educational level
and country of current residence, and to answer standard self-report
questionnaires which include items about mental health history and about
psychological and somatic symptoms. Participants who choose to go on past the
core set may also answer a set of questions on their social and political
views, of the kind asked in general population social surveys.

These demographic variables are collected for two reasons. First, for continuity
with our group's existing studies: we have collected the same demographic
information throughout, and keeping the set identical is what allows datasets
from different studies to be pooled, compared and reused. Second, because
characterising the composition of a sample is a central part of questionnaire
validation. The psychometric properties of an instrument are established in a
particular sample, and the diversity of that sample, or its lack of diversity,
is what determines how far the findings can be generalised. Reporting these
variables is what allows us and other researchers to be critical about
representation, to avoid overgeneralising, and to identify where validation in
other cultural and linguistic contexts is needed.

The health measures are needed because establishing how interoception relates
to symptoms of mental and physical ill health is one of the aims of the study:
a questionnaire of interoception cannot be validated against these constructs
without measuring them. The questions on social and political views are in the
optional set only; they provide constructs the MINT should not be strongly
related to (discriminant validity), and allow the relationship between bodily
awareness and social attitudes to be explored.
```

### 5.8 Other ethical issues, including conflicts of interest — done

```
None beyond those covered above. There are no conflicts of interest.
```

- **5.9** — Yes. OK.

### 5.9.1 Case for low risk — done

One change from what is pasted: "never a comparison with other people" is now
"with no percentile or ranking" (see §0).

```
Participants are asked to report their age, gender, ethnicity, educational level
and country of current residence, and to answer standard self-report
questionnaires which include items about mental health history and about
psychological and somatic symptoms. Participants who choose to go on past the
core set may also answer a set of questions on their social and political
views, of the kind asked in general population social surveys.

These demographic variables are collected for two reasons. First, for continuity
with our group's existing studies: we have collected the same demographic
information throughout, and keeping the set identical is what allows datasets
from different studies to be pooled, compared and reused. Second, because
characterising the composition of a sample is a central part of questionnaire
validation. The psychometric properties of an instrument are established in a
particular sample, and the diversity of that sample, or its lack of diversity,
is what determines how far the findings can be generalised. Reporting these
variables is what allows us and other researchers to be critical about
representation, to avoid overgeneralising, and to identify where validation in
other cultural and linguistic contexts is needed.

All data are anonymised at the point of collection. No name, email address or IP
address is recorded, and each set of responses carries only a randomly generated
participant code. Where a participant comes from a recruitment platform, the
code that platform uses in order to award credit or payment is also recorded, so
that a completed run can be matched to its reward if a query arises; it holds no
personal information, it can be resolved to a person only within that platform,
and it is removed before any data are published. The day of birth is asked only
to derive the star sign shown in the feedback; since, together with the month and
the age, it approaches a date of birth, it is likewise removed, or replaced by a
coarser grouping such as the star sign, before any data are published. The
research team cannot link a set of responses to an individual. No item asks
about suicidal ideation, self-harm or illegal activity. The health items and the
questions on social and political views are special category data under UK GDPR
Article 9; they are collected under the same anonymity as everything else, and
the feedback on the political items shows a participant their own position,
with no percentile or ranking.

The graphical summary shown to participants at the end of each part is
descriptive and explicitly non-diagnostic: no clinical label, cut-off or risk
score is shown at any point. The debriefing screen signposts sources of support.

Questionnaires of this kind, with immediate personal feedback, are widely and
freely available online, including on mental health and political attitudes:
NHS services offer anonymous online low-mood and anxiety questionnaires that
return a score, Project Implicit has long given the public feedback on their
implicit attitudes about race, gender and sexuality, and sites such as
taketest.xyz score several of the instruments used here against normed
samples. Taking part therefore exposes participants to nothing beyond what
they encounter in everyday life, and the feedback here is more cautious than
most, presenting no score, percentile or ranking on the symptom measures.
```

### Recruitment

- **6.0** — 300. OK.

### 6.0.1 Sample size justification — done

Power figures computed for n = 300, two-tailed α = .05, power .80.

```
The study aims to recruit a minimum of 300 participants for the core set of
questionnaires. This is in line with the sample sizes of comparable validation
studies and is considered adequate for the confirmatory factor analysis of a
questionnaire's structure. With 300 participants, the study has 80% power to
detect correlations of r = .16 or larger (two-tailed, alpha = .05), which covers
the small-to-moderate relationships expected between the MINT and the other
measures, and to detect a small-to-moderate difference (f = .18) between the
three randomly assigned response formats.
```

### 6.1 Selection, inclusion and exclusion — done

```
Participants are adults aged 18 or over, recruited through participant
recruitment platforms (SONA and Prolific) and through posts on social media.
There are no exclusion criteria other than the minimum age.
```

- **6.2** — No. OK. **6.3** — Yes. OK.

### 6.3.1 Initial contact — done

```
Participants will be recruited via online recruitment platforms - SONA, the
University's own participant pool, and Prolific - and potentially by convenience
sampling via social media, through posts on the research group's own accounts
linking to the study. The samples from different methods of recruitment will be
collected separately in case they differ (the incentive type, e.g., student
credits or payment, and its amount, or the absence of one, will thus be known
and can be accounted for). No personal data are obtained in recruiting: people
follow a link and take part anonymously.

Participants recruited through SONA receive course credit, and participants
recruited through Prolific are paid at no less than the University's minimum
rate for study compensation, for completing the core set of questionnaires. The
optional questionnaires offered afterwards carry no additional credit or
payment, and participants are told this before deciding whether to continue.
```

- **6.4** — Yes. OK.

### 6.5 Invitation text — **upload** `advert.docx`

Make a PDF of the two texts below once the duration and the credit are known.

```
SONA advert

Study name: Your body, your mind - validating a questionnaire on bodily sensations

Brief abstract: An online questionnaire study about how people notice and make
sense of the signals from inside their body.

Description: In this online study you will answer questionnaires about
yourself, the sensations you notice in your body, your views of artificial
intelligence, and your mood and health over the past weeks and months. After
each part you will see a graphical summary of your answers. The study takes
about 30 minutes and you receive 2 credits for completing it. Afterwards
you can carry on with further optional questionnaires for your own interest;
they earn no further credit. Please take part on a computer or a phone, in a
quiet place, when you have time to finish in one go.

Eligibility: aged 18 or over.

Researchers: Dr Dominique Makowski (D.Makowski@sussex.ac.uk), Asel Tohlukov
(at775@sussex.ac.uk), Ada Erdem (ae455@sussex.ac.uk), School of Psychology,
University of Sussex.

Social media post

How well do you know your own body? Take part in a University of Sussex study
on how people sense the signals from inside their body, and see a summary of
your own answers as you go. About 30 minutes, online, anonymous, 18+.
[link]
```

- **6.6** — Yes. OK.

### 6.6.1 Participant-facing documents — **upload**

- **The item list**: `items.docx` (uploaded), the core's three questionnaires (MINT,
  BAIT, HiTOP-BR), one a page, written out of `data/synthetic/codebook.js`;
  the rest is in the deck, which 4.1.1 links to.
- **The debrief**: `debrief.docx`, the text below. It is the debrief screen of the
  app (`Briefing_Onward` in `content/block_interim.js`), shown after the core
  set; keep the two in step.

```
About this study

This study is validating a new questionnaire of interoception: how you sense and
make sense of the signals from inside your body, such as your heartbeat, your
breathing or your stomach, which have been linked to emotion, self-awareness
and well-being. The other questionnaires show how it relates to mood, health
and views of AI, and the questions about your body were answered on circles or
on a slider, drawn at random, to find out whether the way a question is
answered changes the answer. The results you were shown describe your answers:
none of them is a diagnosis.

Your answers are kept confidential and stored de-identified. For any question
or concern, contact Dr Dominique Makowski (D.Makowski@sussex.ac.uk) or Asel
Tohlukov (at775@sussex.ac.uk). If anything here brought up something
difficult, the Samaritans (116 123, free, day or night) and Mind (0300 123 3393)
are there to listen, and so are the University of Sussex's health and wellbeing
services for its students.

[For participants recruited through SONA:] Your SONA credit is for the main
part, which you have finished, so it is yours whatever you do next. Claim it
now, in a new tab, before you go on or close this page.

What next? The test goes on, and every level will reveal something new about
you. They are optional [and earn no further credit], so you can stop at any
point you feel like. Choose which part of yourself to explore next.
```

### 6.7 Pictures — No (decided, see §0)

Kept in case a reviewer asks, or for the box under it about materials that may develop:

```
Participants see the figures of the reasoning test's matrix and rotation
problems (the published ICAR sample items) and a graphical summary of their own
answers after each part. None of these is distressing. The full set of
materials can be consulted at https://realitybendinglab.com/TestYourself/docs/
and is attached under 6.6.1.
```

- **6.8** — Yes. OK.
- **6.8.1** — **Upload** `consent_form.docx` version 3 (beside this file):
  this study's information sheet and consent form, which are one document.
- **6.9** — No, to match 1.0. Done.
- **6.10** — No. OK. **6.11** — No. OK. **6.12** — No. OK.

### Informed consent and withdrawal

- **7.0** — Yes. OK. **7.0.2** — In writing/online form. OK.
- **7.0.4** — `consent_form.docx`: **replace** version 1 with version 3.
- **7.1** — Yes. OK.

### 7.2 Suitable format — done

```
Participants are adults, most of them university students, recruited online.
The information sheet is written in plain English, is shown on screen before
any question, and the survey cannot be started until it has been scrolled to
the end. No translation, child-specific documents or oral consent are needed.
The survey shows one question at a time and works on phones, tablets and
computers. Participants are given the research team's contact details to ask
any question before, during or after taking part.
```

### 7.3 Time to consider taking part — done

```
As long as they wish. The study advert describes the study before anybody
follows the link, the information sheet can be read at the participant's own
pace before starting, and the study stays open for the whole of data
collection, so nobody has to decide on first reading. Participants can close
the page at any time without having started.
```

- **7.4** — Yes. OK. **7.5** — No. OK.

### 7.5.2 Why data cannot be withdrawn — done

**The point of no return is the first answer, not the last**: answers go out
as they are given, so closing the browser no longer discards anything. This is
the one substantive change from the protocol approved for ER/MB2021/2, and the
consent sheet's third statement was reworded for it, so the committee is told
here which statement changed and why.

```
Participants are shown the information sheet and consent statements before any
question is presented, and the survey cannot be started until the text has been
read through to the end. Participants then click a button indicating that they
have read and understood the information and consent to take part.

Participants are told that they may stop at any time, simply by closing the
browser, and that they do not have to give a reason. They are also told that
their answers are recorded as they give them rather than only at the end, so
that the answers given before they stop are kept and may be used in the
research, and that because the data are anonymous, responses cannot be
identified and therefore cannot be withdrawn once they have been given.

This differs from the previous study (ER/MB2021/2), where answers were saved
only at the end. The consent statements are the University's standard wording
except the third, which said that withdrawing data would be impossible "once I
have completed it" and now says "once it has been given, whether or not I
finish the study". A fourth statement has been added, telling participants
before they start that some of the questions ask about intimate matters (such
as sexuality and bodily functions) or sensitive topics related to mental
health (such as hallucinations and thoughts about death), and that they can
stop at any point if they would rather not answer them.
```
- **7.6** — Yes.

### 7.6.1 Payment and who funds it — done

```
SONA participants receive 2 course credits, the scheme's conversion for a
study of about 30 minutes, and Prolific participants are paid at no less than
the University's minimum rate for study compensation for 30 minutes, for
completing the core set only; the optional continuation is unrewarded. Course
credit has no cost.
```

### 7.7 Direct quotes — No, done

Nothing needs typing: the free-text comments are covered by 9.5.3's
"free-text responses are read and edited or deleted".

### Safety and wellbeing

- **8.0** — No. OK. **8.1** — No. OK. **8.2** — No. OK.
- **8.3** — OK as pasted.
- **8.4** — No. OK. **8.5** — No. OK.
- **8.6** — Yes, done. If it opens a box:

```
The survey includes standard self-report items about psychological and somatic
symptoms over the past two weeks and the past year, about mental health
history and about ethnicity, and an optional set of questions on social and
political views. These are routine items of the kind used in general
population surveys, answered anonymously and not discussed with anybody, and
no item asks about suicidal ideation or self-harm. Participants may stop at
any point without giving a reason. The graphical summary of their answers is
descriptive and explicitly non-diagnostic, and the debriefing screen signposts
sources of support, including the Samaritans, Mind and the University's
wellbeing services, together with the contact details of the research team.
```

- **8.7** — No. OK.

### 8.8 Feeding back the findings — done

```
Participants receive immediate, individual feedback throughout the survey: a
descriptive, non-diagnostic graphical summary of their own answers after each
part, and a debrief explaining the aims of the study when they finish the main
part. The group findings will be published open access, with a freely available
preprint, and the de-identified data will be shared on an open repository;
both will be linked from the research group's website.
```

### Data storage and management

- **9.1** — No (decided: the question is about transfers between institutions
  in a collaboration).
- **9.2** — No. OK, on the anonymity argument (and Zenodo is in Switzerland,
  which has UK adequacy).
- **9.3** — Yes. OK.
- **9.4** — Other. OK.

### 9.4.1 Where the data are stored — done

```
During data collection, responses are deposited in a private, unpublished
Zenodo record (Zenodo being the research data repository operated by CERN)
held by the research group and readable only by the research team: one file
for a participant who finishes, and, for one who stops partway, a file of the
responses given up to that point. For analysis, the files are downloaded to
University-approved storage, where they are compiled into a single
de-identified data file. Only that file is published, on an open repository.
```

### 9.5 Access and analysis — done

```
Only the research team (Dr Dominique Makowski, Asel Tohlukov and Ada Erdem) has
access to the raw data, which are held in a private, unpublished repository
record and on University-approved storage. No names, email addresses or IP
addresses are collected; the only identifier a recruitment platform may supply
(the code it uses to award credit or payment) can be resolved to a person only
within that platform. Only the compiled, de-identified data file is made
public.

The data will be analysed in R. The structure of the MINT will be tested by
confirmatory factor analysis; its convergent and discriminant validity by its
correlations with the other measures; the effect of the response format by
comparing the three randomly assigned formats (measurement invariance and
score distributions); and its relationship with the HiTOP Brief Report's six
dimensions by correlation and regression. Results are reported at group level
only.
```

- **9.5.1** — Survey/questionnaire responses (online). OK.
- **9.5.3** — OK as pasted.
- **9.6** — No. OK.
- **9.7** — Yes. OK, on the anonymity argument.

### 9.8 Retention and deletion — done

The retention period is the supervisor's decision; check it against the
University's research data management policy.

```
No audio, video or media files are recorded. The raw response files are kept,
private, until data collection has ended and any credit or payment queries are
resolved, and no later than the project end date. They are then compiled into a
single de-identified data file: the identifier supplied by a recruitment
platform is removed, the day of birth is removed or reduced to the star sign it
falls under, and free-text responses are read and edited or deleted where they
could identify anybody. The raw files are then deleted from the repository
record and from University storage. The de-identified data file is kept
indefinitely on an open research data repository, as stated in the consent
form.
```

- **9.9** — No.
- **9.9.1** — done:

```
No names are collected, and the research team holds no list linking a platform
identifier to a person; such a list exists only inside SONA or Prolific, under
those platforms' own governance.
```

- **9.10** — No. OK. **9.11** — No. OK.
- **9.12** — Yes, done.
- **9.13** — "Used in future research projects", "Published on an open access
  repository" and "Transferred to supervisor for future use". Done.

### 9.14 Consent to publish and reuse — done

```
Consent is obtained before participation, through the consent statements
participants agree to before starting: that their data will be stored in a
de-identified way and may be made publicly available through secured scientific
online data repositories, and that their data will be used for the purposes of
this research and handled according to data protection legislation and the
University's Privacy Notice. Only de-identified data are shared, so they can be
reused in future research, including being pooled with the research group's
other datasets on the same measures.
```

- **9.15** — Leave empty (it is for replying to changes the F-REC requests).
- **9.16** — Nothing needed. The parent approval (ER/MB2021/2) can go here if
  the team wants the "continuation" framing to have evidence beside it.

---

## 2. Length and burden

Item counts from the Content table in `docs/index.html`. These are maxima: some
items are conditional follow-ups that most participants will not see.

- Level 1 — demographics, FIPI, single-item scales: **22**
- Level 2 — demographics, MINT: **43**
- Level 3 — demographics, BAIT: **29**
- Level 4 — PHQ-4, sleep, mental-health history, HiTOP-BR: **53**
- **Mandatory core: 147**, plus the two questions after it (seriousness,
  comments)
- Optional continuation (HEXACO + KSE-G, archetypes, primals, ICAR-16,
  attention and emotion measures, opinions, closing items): **192**, of which
  the opinions level is 38
- **Whole survey: 339**

Three attention checks fall in the core (MINT, BAIT, HiTOP-BR).

**Duration — 20 to 25 minutes for the core, rewarded as 30** (2 SONA credits,
set on 4 October 2026, to allow for slower participants; the previous study
quoted ~30 minutes for 12 questionnaires), and roughly 45–60 minutes for the
whole survey. The first runs will say whether the core holds to it (see §0).

**Credit and payment.** Both are set against the **core only**, the continuation
being unrewarded, and both are standard rates rather than anything chosen for
this study: **Prolific** at no less than the University's minimum rate for
study compensation, and **SONA** credit following the scheme's own conversion
for a 30-minute study, which is 2 credits.
