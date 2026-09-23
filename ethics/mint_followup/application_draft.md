# Ethical Review Application — MINT validation follow-up

**Study:** follow-up to the MINT validation study (parent reference
**ER/MB2021/2**, with amendment ER/MB2021/3, "Validation of the MINT
questionnaire"; <https://github.com/RealityBending/InteroceptionScale>).

---

## 0. Remaining to do

**Before submission**

- **Applicant and co-applicant.** Two students, names and emails. Applicant
  status UG or PG, as in ER/MB2021/2 where the student was first applicant.
- **Consent sheet blanks** (in `index.html`): the second contact (the student),
  the C-REC reference, and the duration.
- **Timed pilot**, for the duration quoted in the consent sheet and the SONA
  advert, and hence for the SONA credit and the Prolific rate (see §6).
- **Debrief.pdf** — write it as a brief paragraph as part of the interim compensation page (where we give participants their reward). Aim of the study, what interoception is, the
  confidentiality reminder, contacts, and signposting to support services.
- **Confirm the answer to A5.** The opinions level (Where You Stand,
  `content/block_opinions.js`) went into the Project Description, A5, A6, A10
  and §6 on 23 September 2026, once its items were final (35 items). A5 is
  now answered **Yes**, on the reading that political opinions are
  "beliefs" in the question's sense and that answering No to a question
  about beliefs while asking thirty political statements would be the thing
  a reviewer picked up; the explanation says why no disclosure carries a
  risk. That is a drafting call and wants the applicant's own decision.
- **Item list** - : let's print the deck (`@media print`) and attach that PDF.
- **Re-run `python docs/build_slides.py` and push**, so the published table the
  application links to matches `content/` at the moment of submission.


**Before launch**

- **Completion screen.** After the fourth level: a "you have completed the
  study" message, the way to claim the reward (SONA credit link or Prolific
  completion URL, in a new tab), and the choice to continue or stop. The app has
  no such screen, and **where it falls is the only thing that defines the core**,
  since the recruitment link asks for the whole timeline (no battery). Until it
  exists, no participant is told they have finished and no reward can be granted.
- **Record recruitment-platform identifiers.** The app reads `?sub=` and nothing
  else. It needs a small named set of URL variables — a SONA survey code, a
  Prolific PID, and Prolific's study and session ids — saved beside the
  participant code, sanitised the way `?sub=` already is, and listed in
  `AGENTS.md` under **Who is taking it**.
- **Remove the "Test mode" link** from the landing page, and the test-mode
  consent bypass.

---

## 1. Header fields

- **Project Title** —

```
Placement Project: MINT questionnaire validation follow-up
```

- **Applicant** — [student name and email]
- **Co-applicant** — [second student name]. Dr Dominique Makowski
  (<d.makowski@sussex.ac.uk>) is the supervisor, and the contact named on the
  consent and debriefing documents.
- **Department** — Psychology
- **Project Start Date** — 01-Oct-2026
- **Project End Date** — 01-Oct-2028
- **External Funding in place** — No
- **External Collaborators** — No

---

## 2. Project Description

Consent, participants and risks are not restated here: each is a field of its
own (B13–B17, B1–B2, B5 and A10) and the form is read as one document.

Text to paste:

```
The present study is an online survey continuing the validation of the MINT, a
new questionnaire measuring interoceptive traits (ER/MB2021/2). The previous
study established the structure of the MINT and its relationships with other
interoceptive scales. The present study administers the MINT to a new sample
alongside a broader set of trait, symptom and disposition measures, in order to
examine its convergent and discriminant validity against constructs it should
and should not be related to.

The survey contains the following parts:

1. Study information and consent form.
2. Standard demographic questions.
3. A core set of questionnaires completed by all participants.
4. An optional further set of questionnaires, which participants may complete if
   they wish but which is not required in order to receive credit.
5. Feedback and debriefing information.

Relationship to the previous study

This study repeats the design, the procedure and a substantial part of the
measures of ER/MB2021/2, in a new and larger sample. The following measures are
the same or near-identical in the two studies:

- The MINT itself, the instrument being validated, with the same items.
- The PHQ-4 (Kroenke et al., 2009), refined five-option version, measuring
  anxiety and depression symptoms over the past two weeks.
- A single-item measure of life satisfaction.
- The Primals Inventory-18 (Clifton & Yaden, 2021), measuring beliefs about the
  character of the world.
- The Cognitive Emotion Regulation Questionnaire (Garnefski & Kraaij), in its
  short form here.
- A measure of emotion reactivity: the Emotion Reactivity Scale (Nock et al.,
  2008) here, a brief version of the same construct in the previous study.
- Mental health history: reported psychiatric diagnoses and treatment.
- Somatic and psychosomatic complaints, measured here by the somatic scale of
  the HiTOP Brief Report.
- The demographic questions.
- Feedback questions asking participants how they found the survey.

The two studies therefore cover the same constructs: interoception, emotion
regulation, emotion reactivity, affective symptoms, somatic complaints, beliefs
about the world, and mental health history. They also share the same design,
procedure, recruitment strategy, consent arrangements and data handling, and the
same research team. The present study adds the further trait and disposition
measures listed below.

Demographic information

Participants report their age, month and day of birth, gender, educational level, field
of study, student status, ethnicity, country of current residence, subjective
financial comfort and subjective social status. This is the same set our group
collects across its studies, which is what allows the datasets to be pooled and
reused, and it is what allows the composition and the diversity of the
validation sample to be characterised and reported; the reasons are set out in
full under A10.

Questionnaires

Participants are informed that the study aims to validate a questionnaire and
that it includes attention check items, and are advised that failing these
checks may result in withholding their rewards (e.g., credits or payment).

The core set, completed by all participants, is:

- The MINT, the instrument under validation.
- A brief personality inventory (Five-Item Personality Inventory; Gosling et
  al., 2003) and a set of single-item trait scales measuring self-esteem,
  self-concept clarity, self-efficacy, meaning in life, life satisfaction,
  narcissism, self-rated health, perceived stress and the valuing and seeking
  of beauty.
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
  Self-Control Scale), the Emotion Reactivity Scale and the short form of the
  CERQ.
- A set of questions on social and political views: a left-right
  self-placement (the European Social Survey item), three items of the
  Conspiracy Mentality Questionnaire (Bruder et al., 2013), and thirty-one
  agree/disagree statements on economic redistribution and social order
  (adapted from the British Social Attitudes scales; Evans et al., 1996),
  equality of outcomes between groups, human enhancement and heredity, the
  climate and the moral standing of animals, and how much beauty should
  count against cost and use, most of them written or adapted for this
  study. These are political opinions and are treated as special category
  data (see A5, A6 and A10); they are collected anonymously like the health
  items, and no position on them is compared with anybody else's in the
  feedback.

The survey always opens with the demographic questions and the brief trait
scales. The three remaining parts of the core set — the MINT, the AI beliefs
questionnaire, and the symptom measures — are then presented in an order drawn
at random for each participant, so that no one instrument is always answered
first and none always answered last. The items within each questionnaire are
likewise presented in a random order, except where an instrument was validated
in a fixed order, in which case that order is kept.

The complete list of every questionnaire and every item asked, with its source
and reference, is published as part of the study documentation and can be
consulted at https://realitybendinglab.com/TestYourself/docs/ (select the
"Content" slide, and any row of the table to see that instrument's items).

Optional continuation

After completing the core set, participants are told that they have completed
the study and are given the link that awards their credit. They may then either
stop or continue through the optional questionnaires for their own interest. The
continuation is entirely voluntary, carries no additional reward, and may be
abandoned at any point; receiving credit does not depend on it, and participants
are told so.

Feedback and debriefing

After each block of questionnaires, participants are shown a graphical summary
of their own answers, and are asked whether it matches their experience of
themselves and how they found that part of the survey. These responses are
themselves informative about how well the measures describe people. The summary
is descriptive and explicitly non-diagnostic: no clinical label, cut-off or risk
score is shown at any point.

At the end, participants may write any comments they wish to share, and are then
shown a debriefing screen stating the aim of the survey, giving further
information about interoception, reminding them that their data are anonymised,
and signposting sources of support.
```

---

## 3. Section A — Checklist

- **A1. Vulnerable participants / unable to consent / dependent position?** — **No.**
  Adults 18+, recruited through platforms. SONA participants are our own
  students; the consent form states that taking part does not affect grades.
- **A2. Participation without consent or knowledge, or deception?** — **No.**
- **A3. Could participants be identified through a research output?** — **No.**
  A run carries a randomly generated participant code and, where a platform
  supplies one, that platform's own identifier, resolvable only inside the
  platform. Nothing goes from collection to publication in one step: DataPipe
  deposits into a repository record that is an unpublished private draft for the
  whole of collection; those files are compiled into a single de-identified data
  file, at which stage the platform identifier is dropped, the day of birth is
  removed or grouped (into the star sign it falls under), and the one free-text
  field is read and edited or deleted where it holds anything that could
  identify an individual; only that compiled file is made open-access. See B11a
  and B12a.
- **A4. Might the study induce psychological stress or anxiety, or humiliation or harm beyond everyday risk?** — **No.**
  The items are standard screening items of the kind used in general population
  surveys, and the feedback presents no clinical label, cut-off or risk score,
  never characterises a pattern of answers as a disorder, and on the symptom and
  health measures shows no comparison with anybody else — no percentile, no
  ranking, and no place on the whole-survey summary. See B5 and A10.
- **A5. Risk of disclosures about beliefs, illegal actions, or threats to self/others?** — **Yes**,
  as to beliefs: the optional continuation includes a set of questions on
  social and political views (redistribution, law and order, equality between
  groups, human enhancement, heredity, the climate, animals), answered as
  agreement with statements, and a left-right self-placement. These are
  opinions of the kind asked in general population social surveys (the
  British Social Attitudes and European Social Survey items among them). No
  item asks about illegal activity, self-harm or suicide, and no answer is
  identifiable (A3, A10), so no disclosure can be attributed to a person or
  carry a consequence for them. See A6 and A10.
- **A6. Collecting special category information in identifiable form?** — **Yes**
  (ethnicity; gender identity; health data — psychiatric diagnoses and
  treatment, symptom reports; political opinions, in the optional set of
  questions on social and political views), **not in identifiable form**. See
  A10.
- **A7. Drugs, placebos, substances, invasive procedures?** — **No.**
- **A8. Hazardous substances or equipment?** — **No.**
- **A9. Human tissue under the HTA?** — **No.**

**Recruitment-platform identifiers.** SONA and Prolific each put a
per-participant code in the survey URL, and the app records it. Such a code is a
key to the participant's identity *held by the platform*, never by the research
team, and it is kept so that a completed run can be matched to a credit or a
payment if a query arises. It is stripped at the preprocessing stage, before any
file is published. A3, A6, B7, B8 and B11a are written on that basis.

### A10 — case for the application being considered LOW risk

Text to paste:

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
research team cannot link a set of responses to an individual. No item asks about suicidal ideation,
self-harm or illegal activity. The health items and the questions on social
and political views are special category data under UK GDPR Article 9; they
are collected under the same anonymity as everything else, and the feedback
on the political items shows a participant their own position only, never a
comparison with other people.

The graphical summary shown to participants at the end of each block is
descriptive and explicitly non-diagnostic: no clinical label, cut-off or risk
score is shown at any point. The debriefing page signposts sources of support.
```

---

## 4. Section B — Data collection and analysis

### B1. Participants: how many, who, and how selected

```
The study will attempt to recruit a minimum of 300 participants for the core
set of questionnaires, based on typical sample sizes of comparable validation
studies.

Participants are adults aged 18 or over, recruited through participant
recruitment platforms. There are no exclusion criteria other than the minimum
age.
```

### B2. Recruitment

SONA and Prolific are both applied for here, in one application, so that the
study can run on either without an amendment later.

```
Participants will be recruited via online recruitment platforms - SONA, the
University's own participant pool, and Prolific - and potentially by convenience
sampling via social media. The samples from different methods of recruitment
will be collected separately in case they differ (the incentive type, e.g.,
student credits or payment, and its amount, or the absence of one, will thus be
known and can be accounted for).

Participants recruited through SONA receive course credit, and participants
recruited through Prolific are paid at that platform's recommended hourly rate,
for completing the core set of questionnaires. The optional questionnaires
offered afterwards carry no additional credit or payment, and participants are
told this before deciding whether to continue.
```

### B3. Method

```
Online survey.
```

### B4. Location

```
The survey will be completed online, at a time and place of the participant's
choosing.
```

### B5. Participant wellbeing

**Yes**, with the mitigation below. The core set includes the HiTOP-BR, which
asks about low mood, anxiety, unusual perceptual experiences and one item about
thinking about death, plus the PHQ-4 and mental-health history.

```
The survey includes standard self-report items about psychological and somatic
symptoms over the past two weeks and the past year, and about mental health
history. These are routine screening items of the kind used in general
population surveys, and no item asks about suicidal ideation or self-harm.

Participants are told before starting that participation is voluntary, that they
may stop at any point without giving a reason and without any penalty, and that
they may skip the study entirely by closing the browser. The graphical summary
of their answers shown during the survey is descriptive and explicitly
non-diagnostic, and presents no clinical label, cut-off or risk score. The
debriefing page signposts sources of support, including the Samaritans, Mind and
the University's own student wellbeing service, together with the contact
details of the research team.
```

### Confidentiality and anonymity — the Yes/No items

- **B6. Completed anonymously and returned indirectly?** — Yes.
- **B7. Identifiable only by unique identifier?** — Yes. A randomly generated
  12-character participant code and, where the recruitment platform supplies
  one, that platform's own participant identifier, which is removed before
  publication. See B11a.
- **B8. Lists linking identifiers to names stored separately?** — N/A. No names
  are collected, and the research team holds no list linking a platform
  identifier to a person; such a list exists only inside SONA or Prolific, under
  those platforms' own governance.
- **B9. Place names / institutions changed?** — Yes.
- **B10. Personal information kept confidential, never disclosed to third parties?** — Yes.
  Responses are transmitted through DataPipe to a Zenodo deposit; these are
  data-hosting services rather than third parties receiving personal
  information, and no personal information is in what they hold. Both are named
  in B11a.
- **B11. Records held per data protection regulations?** — Yes.
- **B12. Data used for any purpose other than consented?** — No.

### B11a. How identifiable personal and research data will be managed and stored

The deposit's identifier is deliberately not given: it is an unpublished draft
with no public address, and quoting one would imply there is something a
reviewer could go and look at.

```
The survey is anonymous: no name, email address or IP address is collected. Each
set of responses carries only a randomly generated participant code, which is
created by the survey itself and is not linked to any identifying information.

Responses are transmitted through DataPipe, a service run by the Department of
Psychology at Princeton University which forwards data from browser-based
studies to a data repository without the researchers operating a server of their
own. Each response is transmitted as it is given, and the complete set is
transmitted again when the survey is finished, so that a participant who stops
partway through still contributes the answers they had given. The data are
deposited in a repository record held by the research group: one file for a
participant who finishes, and, for one who stops partway, a file of the
responses given up to that point, written about fifteen minutes after they
stop.

That repository record is unpublished and private for the whole of data
collection: it has no public address, it is not indexed, and it is readable only
by the research team. The files in it are downloaded and compiled into a single
de-identified data file, and it is at that stage that anonymisation is carried
out - any identifier supplied by a recruitment platform is removed, the day of
birth is removed or replaced by a coarser grouping (such as the star sign it
falls under), and free-text responses are read and edited or deleted where they contain anything
that could identify an individual. Only the compiled, de-identified file is made
publicly available, as stated in the consent form that participants read and
agree to before taking part.

Where participants are recruited through SONA or Prolific, the survey URL
carries a code generated by that platform for the purpose of awarding credit or
payment, and this code is recorded with the responses so that a completed run
can be matched to its reward if a query arises. It contains no personal
information and can be resolved to an individual only within that platform, by
staff with access to that system; it is not resolvable by the research team from
the research data, and it is removed before any data are published.
```

### B12a. Further information on confidentiality and data use

```
The potential for anonymous data sharing is included in the consent form.

The survey ends with an optional free-text box in which participants may write
any comments they wish to share. The item states that what is written there may
be made public. Every free-text response will be read before the data are
published, and any response containing information that could identify an
individual will be edited to remove it, or the response deleted. This is done at
the same stage as the rest of the anonymisation, on the compiled data file,
before anything is made publicly available.
```

### Informed consent and recruitment — the Yes/No items

- **B13. Information sheet, adequate time to read?** — Yes. The consent text is
  shown before any item and the start button is disabled until it has been
  scrolled through.
- **B14. Signed consent form for interviews/focus groups?** — N/A.
- **B15. Consent shown by a specific and identifiable action?** — Yes (see B17).
- **B16. Told they can withdraw at any time?** — Yes, in the sense that they may
  stop at any time; what they have already answered stays. **The point of no
  return is the first answer, not the last**: responses are transmitted as they
  are given, so closing the browser no longer discards anything, and the consent
  form says so in plain words. This is the one substantive change from the
  protocol the committee approved before, and should be flagged to them.

### B17. Further information on informed consent

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
```

### Context — the Yes/No items

- **B18. DBS clearance needed?** — No.
- **B19. Other ethical clearances or permissions?** — No. SONA use at Sussex is
  embedded in the School's research participation scheme and needs nothing
  beyond C-REC approval.
- **B20. Fieldwork?** — No.
- **B21. Lone working?** — No.

### B22. Any other ethical considerations

**No.** The graphical summary is covered in A4, A10 and B5, and the free-text
box in A3 and B12a.

The block below is kept **unused**, in case a reviewer would rather see the
summary flagged in its own field. Do not paste it unless that happens.

```
Participants are shown a graphical summary of their own answers, including on
measures of psychological symptoms. This is done because it makes participation
more informative for the participant, and because their judgement of whether the
summary describes them is itself relevant to the validity of the measures. The
summary is descriptive and explicitly non-diagnostic by design: it presents no
clinical label, no cut-off and no risk score, and the accompanying text does not
characterise any pattern of answers as a disorder or a problem. The debriefing
page signposts sources of support.
```

---

## 5. Supporting documents

- **Consent sheet — drafted, in `index.html`.** Modelled on the MINT study's own
  sheet (`ethics/mint_validation/Consent.pdf`): the same headings in the same
  order, the six consent statements kept as the committee's wording, and the
  text around them describing this study. The third statement is the one
  exception — it said withdrawal was impossible "once I have completed it",
  which stopped being true when answers began going out as they are given, and
  it now reads "once it has been given, whether or not I finish the study".
  Tell the reviewer which one was amended and why. Print the `.gate` to PDF for
  the attachment, or lift the text.
  - Three blanks remain: the second contact, the C-REC reference, and the
    duration.
  - The DataPipe/Zenodo route is not named on the sheet: the standard statement
    it carries ("De-identified data may be made publicly available through
    secured scientific online data repositories") is the committee's own wording
    and covers it, and B11a names both services to the reviewers.
- **Debrief.pdf** — to be written; see §0. The app has no debriefing screen at
  all.
- **Item list — a link, not an attachment.** The Content table in
  `docs/index.html` is generated from the app's own questions by
  `docs/build_slides.py`, so it cannot drift from what is asked; picking a row
  shows every item of that instrument. The Project Description points at it
  rather than carrying a PDF that would go stale the moment a block changes.
  The deck is live at <https://realitybendinglab.com/TestYourself/docs/> and the
  app at <https://realitybendinglab.com/TestYourself/>.

---

## 6. Length and burden

Item counts from the Content table in `docs/index.html`. These are maxima: some
items are conditional follow-ups that most participants will not see.

- Level 1 — demographics, FIPI, single-item scales: **22**
- Level 2 — demographics, MINT: **43**
- Level 3 — BAIT: **27**
- Level 4 — demographics, PHQ-4, sleep, mental-health history, HiTOP-BR: **55**
- **Mandatory core: 147**
- Optional continuation (HEXACO + KSE-G, archetypes, primals, ICAR-16,
  attention and emotion measures, opinions, closing items): **189**, of which
  the opinions level is 35
- **Whole survey: 336**

Three attention checks fall in the core (MINT, BAIT, HiTOP-BR).

**Duration — pending the pilot.** The previous study quoted ~30 min for 12
questionnaires. A rough estimate here is **20–25 minutes for the mandatory
core** and **45–60 minutes for the whole survey**, but this needs a timed run
before it goes in the consent form and the SONA advert, since the figure quoted
determines the credit awarded.

**Credit and payment.** Both are set against the **core only**, the continuation
being unrewarded, and both are standard rates rather than anything chosen for
this study: **Prolific** at the University's minimum rate for study compensation
as set out in the Sussex guidelines, and **SONA** credit following the scheme's
own conversion from the median completion time. Neither number can be written
down until the timed pilot has given a duration.
