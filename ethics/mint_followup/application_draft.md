# Ethical Review Application — draft

**Study:** follow-up to the MINT validation study (ER/MB2021/2 + amendment
ER/MB2021/3, "Validation of the MINT questionnaire";
<https://github.com/RealityBending/InteroceptionScale>).

**Survey platform:** the Abyss Test app in this repository
(<https://github.com/RealityBending/TestYourself>), run as a static page.

Every field of the Sussex form is below. The free-text ones carry the text to
paste, in a block of their own — plain text, no formatting, nothing to strip
out. Anything in square brackets inside those blocks is a value somebody still
has to supply. Flags are:

- **[DECIDE]** — an open choice, nobody has made it yet
- **[CONFIRM]** — a likely answer that someone has to verify (a date, a name, a number)
- **[CREATE]** — something that does not exist yet and has to be written or built before submission or launch

---

## 1. Framing (read this first)

The study is presented as **a routine questionnaire-validation survey**: a
follow-up to the MINT validation, collecting the MINT alongside further
convergent and discriminant measures in a new sample. Nothing in the
application leans on the app's gamified presentation, the level structure, the
descent metaphor, the figures, or the participant-chosen ordering. Those are
implementation details of the survey software, and where they have to be
described they are described plainly:

- Levels, the descent, the dive gauge → "blocks of questionnaires", and a progress indicator
- The results figures (climb, sea, wheel, compass, archetype, body) → "a graphical summary of their own answers", which is the phrase the previous study already used
- The fork (participant-chosen level order) → randomised, participant-paced ordering of the optional blocks
- Star ratings and agree/disagree votes on the feedback → feedback questions about the survey itself

This is the same register the previous application used: its Instructions page
already promised "a graph summarizing your answers" at the end, so
participant-facing feedback is precedent rather than novelty.

**Decided: describe the whole instrument** — mandatory core plus optional
continuation — and be explicit that the continuation is voluntary and
unrewarded. The alternative was to apply for the core alone and add the rest by
amendment, which would have been a shorter application for the same
participant-facing product, and a reviewer would have seen it and wondered.

---

## 2. What is similar to the MINT validation study

Written into the Project Description as the case for this being a follow-up
rather than a new line of work.

**Identical or near-identical measures**

- **MINT** — the primary instrument in both, same items
- **PHQ-4** (Kroenke et al., 2009), refined five-option version — same version in both
- **Single-item life satisfaction** — same
- **PI-18** (Clifton & Yaden, 2021) — same, plus five PI-99 tertiary scales here
- **CERQ** (Garnefski & Kraaij) — the Saetren et al. version there, the short form here
- **Emotion reactivity** — B-ERS (Veilleux et al., 2024) there, the 6-item ERS (Nock et al., 2008) here
- **Mental health history** — reported psychiatric diagnoses and treatment, same in both
- **Psychosomatic complaints** — a dedicated questionnaire there, the HiTOP-BR somatoform scale here
- **Demographics** — age, gender, education, ethnicity, country of residence in both; birth month, discipline and student status added here
- **Feedback on the survey** — "did you enjoy it" there, the same plus per-block ratings here

**Identical design and procedure**

- Anonymous online survey, completed in one sitting, no IP addresses collected
- Recruitment via SONA (and potentially Prolific), samples kept separable by source
- Consent by explicit click before any item is shown
- Attention checks embedded, with the same stated policy on withholding credit
- De-identified data made publicly available through a scientific data repository
- Same PI and research group

**Constructs tapped in both**: interoception, emotion regulation, emotion
reactivity, affective symptoms, somatic complaints, beliefs about the world,
mental health history.

**Confirmed.** The measure list above is taken from the previous study's ethics
form (MAIA-2, IAS, BPQ-VSF, TAS-20, CERQ, B-ERS, PI-18, PHQ-4, CEFSA-S, mental
health, psychosomatic disorders, plus exercise/wearables items) and is correct.

**Decided: the TAS-20 and the three other interoception scales (MAIA-2, IAS,
BPQ-VSF) are not in this study.** The convergent-validity work against those
instruments was done in the previous sample; this study asks the MINT against
different ground. Nothing in the application should imply they are here.

---

## 3. What is additional

**In the mandatory core** (beyond the overlap above):

- FIPI (Gosling et al., 2003) — brief Big Five
- Ten single-item scales (narcissism, self-rated health, stress, self-esteem,
  self-concept clarity, meaning, self-efficacy, life satisfaction, two
  self-placement items)
- BAIT (Makowski et al.) — beliefs about AI technology
- HiTOP-BR (Simms et al., 2026) — six psychopathology spectra
- Subjective financial comfort; MacArthur subjective social status
- Single-item sleep quality

**Optional continuation only:**

- HEX-ACO-18 (Olaru & Jankowsky, 2022) with the KSE-G social-desirability scale
- OSAI-PM — twelve-archetype indicator (not validated; this study is part of its development)
- PI-99 tertiary primals
- ICAR-16 Sample Test (Condon & Revelle, 2014) — reasoning items with correct answers
- ASRS (2 items), CFQ (2 items), MW-S (2 items), BSCS (2 items), ERS (6 items), CERQ-short

**[DECIDE]** The ICAR-16 is an ability test, not a self-report. It is the one
optional block a reviewer might ask about separately (performance testing,
possible distress at getting items wrong). Mitigation already built in: it is
untimed, and the feedback gives no score, total or percentile — only which of
four kinds of problem came most easily. Say so in one sentence, or drop the
block from this application.

---

## 4. Header fields

- **Project Title** —

```
MINT questionnaire validation: follow-up
```

- **Applicant** — **TODO: a student, name and email to be filled in.** Applicant
  Status: UG or PG, as in ER/MB2021/2 where the student was first applicant.
- **Co-applicant** — **TODO: a second student, name to be filled in.**
  Dr Dominique Makowski (<d.makowski@sussex.ac.uk>) is the supervisor, and the
  contact named on the consent and debriefing documents.
- **Department** — Psychology
- **Project Start Date** — 01-Oct-2026
- **Project End Date** — 01-Oct-2028
- **External Funding in place** — No
- **External Collaborators** — No

---

## 5. Project Description

**[CREATE]** The "Optional continuation" paragraph still describes behaviour
the app does not have yet — the completion screen and its credit link (F3).
**Saving is no longer among them** (F1): answers go out as they are given, so
there is nothing left to describe as saving "at that point". **The ordering it
describes is now built**: level 1,
then the three core levels in an order drawn for the participant, then the rest
offered as choices — see §9, F2.

**Streamlined against the other fields.** Three sections the previous
application's description carried are dropped here, because each is a field of
its own and the form is read as one document:

- *Consent form* → B13, B15, B16, B17, and the attached consent sheet
- *Participants* → B1 and B2
- *Risks* → B5 and A10

The demographics justification is likewise given in full in A10, which is the
field that asks for it, and referred to in one sentence here. Restore any of
them if the committee would rather each section stood alone.

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

Participants report their age, month of birth, gender, educational level, field
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
  narcissism, self-rated health and perceived stress.
- A questionnaire on beliefs about artificial intelligence technology (BAIT).
- Symptom measures: the PHQ-4, a single-item measure of sleep quality, reported
  mental health history, and the HiTOP Brief Report (Simms et al., 2026), which
  measures six dimensions of psychopathology over the past twelve months.

The optional set, offered after the core set, is:

- A fuller personality inventory (HEX-ACO-18; Olaru & Jankowsky, 2022) together
  with a short social desirability scale (KSE-G; Kemper et al., 2014).
- An archetype indicator developed by the research team, which is not a
  validated instrument and for which this study forms part of the development
  work.
- Five further scales of the Primals Inventory (Clifton et al., 2019).
- A short untimed reasoning test (ICAR-16 Sample Test; Condon & Revelle, 2014).
- Brief measures of attention and self-control (two items each from the ASRS,
  the Cognitive Failures Questionnaire, the Mind Wandering Scale and the Brief
  Self-Control Scale), the Emotion Reactivity Scale and the short form of the
  CERQ.

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

## 6. Section A — Checklist

- **A1. Vulnerable participants / unable to consent / dependent position?** — **No**.
  Adults 18+, recruited through platforms. **[DECIDE]** SONA participants are
  our own students; the previous application answered No and the consent states
  that taking part does not affect grades. Keep that wording.
- **A2. Participation without consent or knowledge, or deception?** — **No**. No deception.
- **A3. Could participants be identified through a research output?** — **No**.
  Anonymous; only a randomly generated participant code. **[DECIDE]** The final
  free-text comment box is published with the data — see §9, flag F6.
- **A4. Might the study induce psychological stress or anxiety, or humiliation or harm beyond everyday risk?** — **No**.
  **[CONFIRM]** with the committee's likely reading: the survey asks about
  symptoms and gives participants a summary of their own answers. Our position:
  the items are standard screening items, the summary is non-diagnostic by
  design, and no risk score is shown. If reviewers would rather see Yes with
  mitigation, the A10 text covers it.
- **A5. Risk of disclosures about beliefs, illegal actions, or threats to self/others?** — **No**.
  No item asks about illegal activity, self-harm or suicide.
- **A6. Collecting special category information in identifiable form?** — **Yes**.
  Ethnicity; gender identity; health data (psychiatric diagnoses and treatment,
  symptom reports). Not in identifiable form — see A10.
- **A7. Drugs, placebos, substances, invasive procedures?** — **No**.
- **A8. Hazardous substances or equipment?** — **No**.
- **A9. Human tissue under the HTA?** — **No**.

**[DECIDE]** Whether SONA credit-granting changes the anonymity claim. The SONA
survey code identifies the participant *to SONA*, and the app currently saves
whatever `?sub=` carries into the data file. See §9, flag F5 — this has to be
resolved before A3/A6/B11a can be answered as written.

### A10 — case for the application being considered LOW risk

This is where the ethnicity question gets asked, so the justification is
restated here in short rather than left in the Project Description alone.

Text to paste:

```
Participants are asked to report their age, gender, ethnicity, educational level
and country of current residence, and to answer standard self-report
questionnaires which include items about mental health history and about
psychological and somatic symptoms.

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
participant code. The data cannot be linked back to an individual by the
research team or by anyone else. No item asks about suicidal ideation, self-harm
or illegal activity.

The graphical summary shown to participants at the end of each block is
descriptive and explicitly non-diagnostic: no clinical label, cut-off or risk
score is shown at any point. The debriefing page signposts sources of support.
```

---

## 7. Section B — Data collection and analysis

### B1. Participants: how many, who, and how selected

**[DECIDE]** the number (300 is the previous study's). **[CONFIRM]** it against
the planned analyses; the optional blocks will have a smaller N than the core.

Text to paste:

```
The study will attempt to recruit a minimum of [300] participants for the core
set of questionnaires, based on typical sample sizes of comparable validation
studies. A smaller number is expected to complete the optional questionnaires,
which are offered after the core set and carry no reward.

Participants are adults aged 18 or over, recruited through participant
recruitment platforms. There are no exclusion criteria other than the minimum
age.
```

### B2. Recruitment

**[DECIDE]** SONA only at first, or SONA + Prolific in the same application?
Applying for both now avoids an amendment.

Text to paste:

```
Participants will be recruited via recruitment platforms (e.g., SONA, Prolific)
and potentially by convenience sampling via social media. The samples from
different methods of recruitment will be collected separately in case they
differ (the incentive type, e.g., student credits, and its amount, or the
absence of one, will thus be known and can be accounted for).

Participants recruited through SONA receive course credit for completing the
core set of questionnaires. The optional questionnaires offered afterwards carry
no additional credit, and participants are told this before deciding whether to
continue.
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

**[DECIDE]**. The previous application said "No." Here the core set includes the
HiTOP-BR, which asks about low mood, anxiety, unusual perceptual experiences ("I
heard things that no one else could hear") and one item about thinking about
death, plus the PHQ-4 and mental-health history. *Recommended:* answer with the
mitigation text below. Answering "No" and having a reviewer read the HiTOP items
is the worse outcome; the mitigation is cheap and standard.

Text to paste:

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
- **B7. Identifiable only by unique identifier?** — Yes. Randomly generated
  12-character participant code. See B11a.
- **B8. Lists linking identifiers to names stored separately?** — N/A (no names collected). **[DECIDE]** depends on the SONA code question, F5.
- **B9. Place names / institutions changed?** — Yes.
- **B10. Personal information kept confidential, never disclosed to third parties?** — Yes.
  **[CONFIRM]** wording, given that responses are transmitted through DataPipe
  to a Zenodo deposit; these are data-hosting services, not third parties
  receiving personal information. Best to name them explicitly in B11a rather
  than have it noticed later.
- **B11. Records held per data protection regulations?** — Yes.
- **B12. Data used for any purpose other than consented?** — No.

### B11a. How identifiable personal and research data will be managed and stored

**[CONFIRM]** the Zenodo record and whether it is public or restricted at first.
**[DECIDE]** whether to mention DataPipe by name (recommended: yes — it is the
route the data actually take), and whether the bracketed SONA paragraph goes in
(flag F5).

Text to paste:

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
stop. De-identified data may be made publicly available through that repository,
as stated in the consent form that participants read and agree to before taking
part.

[Only if the SONA survey code is stored with the data: Where participants are
recruited through SONA, the survey URL carries a code generated by SONA for the
purpose of awarding credit. This code is stored with the responses. It contains
no personal information and can be resolved to an individual only within SONA,
by staff with access to that system; it is not resolvable by the research team
from the research data.]
```

### B12a. Further information on confidentiality and data use

Keeps the previous study's line about anonymous data sharing and adds the
commitment to screen free-text responses before publication (flag F6).

Text to paste:

```
The potential for anonymous data sharing is included in the consent form.

The survey ends with an optional free-text box in which participants may write
any comments they wish to share. The item states that what is written there may
be made public. Free-text responses will be checked before the data are
published and any response containing information that could identify an
individual will be removed.
```

### Informed consent and recruitment — the Yes/No items

- **B13. Information sheet, adequate time to read?** — Yes. The consent text is
  shown before any item and the start button is disabled until it has been
  scrolled through.
- **B14. Signed consent form for interviews/focus groups?** — N/A.
- **B15. Consent shown by a specific and identifiable action?** — Yes (see B17).
- **B16. Told they can withdraw at any time?** — Yes, in the sense that they may
  stop at any time; what they have already answered stays. **The point of no
  return is the first answer, not the last** (September 2026): responses are
  transmitted as they are given, so closing the browser no longer discards
  anything. The previous study's wording — "before submission, closing the
  browser discards everything" — is therefore gone, and the consent form says in
  plain words that answers are recorded as they are given and cannot be taken
  back. **[CONFIRM]** that the committee is content with this, since it is the
  one substantive change from the protocol they have approved before: the
  trade is that a participant who gives up at level 5 of 10 is no longer
  thirty minutes of their time thrown away.

### B17. Further information on informed consent

Text to paste:

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
- **B19. Other ethical clearances or permissions?** — No. **[CONFIRM]** whether
  SONA use at Sussex requires anything beyond C-REC approval.
- **B20. Fieldwork?** — No.
- **B21. Lone working?** — No.

### B22. Any other ethical considerations

**[DECIDE]**. Candidates for a Yes, each of which could equally be handled in
the sections above:

- Participants are shown a summary of their own answers, including on symptom
  measures. Our safeguard: it is non-diagnostic by design.
- The final free-text box is published with the data (F6).

If Yes, text to paste in B22a:

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

## 8. Supporting documents

Modelled on the previous application's four attachments, minus the item list.

- **Consent sheet — drafted, in `index.html`.** Rewritten in September 2026
  against the MINT study's own sheet (`ethics/mint_validation/Consent.pdf`):
  same headings in the same order, the six consent statements kept as the
  committee's wording rather than reworded, and the text around them describing
  this study — the aim stated as validating a questionnaire measuring
  interoception, the two-part structure with credit attached to the first part
  only, the 18+ minimum, and a paragraph saying the feedback is not a
  diagnosis. Print the `.gate` to PDF for the attachment, or lift the text.
  - **[CREATE]** Three blanks remain in it: **the second contact** (the
    student), **the C-REC reference**, and **the duration** — it says "about 20
    to 25 minutes", which is the estimate in §10 and wants a timed pilot behind
    it before a participant is shown it or a credit is set against it.
  - **[DECIDE]** Whether to add the DataPipe/Zenodo route to the sheet. The
    standard statement it carries ("De-identified data may be made publicly
    available through secured scientific online data repositories") is the
    committee's own wording and covers it; B11a names the services. Adding them
    to the participant-facing sheet is more transparent and less standard.
- **[CREATE] Instructions.pdf** — the page warning that validity checks are
  performed and that credit may be withheld, that the questionnaires may feel
  long and repetitive, and that a graphical summary follows. The previous study
  had this as a dedicated screen; **the app has no equivalent** (its opening
  briefing warns only that the questions get stranger). See F4.
- **[CREATE] Debrief.pdf** — the debriefing screen. **The app has no debriefing
  at all.** Needs: the aim of the study, what interoception is, the
  confidentiality reminder, contacts, and (new relative to the previous study)
  signposting to support services.
- **Item list — a link, not an attachment.** The Content table in
  `docs/index.html` is generated from the app's own questions by
  `docs/build_slides.py`, so it cannot drift from what is asked; picking a row
  shows every item of that instrument. The Project Description points at it
  rather than the application carrying a PDF that would go stale the moment a
  block changes.
  - The deck is live at <https://realitybendinglab.com/TestYourself/docs/> and
    the app itself at <https://realitybendinglab.com/TestYourself/> (the
    `realitybending.github.io/TestYourself/...` addresses redirect there). Both
    checked, both return 200, and `python docs/build_slides.py --check` reports
    the deck up to date against `content/`.
  - **[DECIDE]** whether the committee will accept a link rather than a
    document. If not, print the deck to PDF (`@media print` is its export path)
    and attach that — still generated from `content/`, so still one source.

**[CONFIRM]** The previous study's consent quotes approval **ER/EB672/2** while
the ethics form is **ER/MB2021/2**. Find which reference this application
should cite as the parent.

---

## 9. What has to be built or changed in the app

These are not ethics questions, but the application describes behaviour that
does not exist yet, so they have to be resolved before submission (the ones
that change what participants are told) or before launch (the rest).

- **F1 [DONE] — Answers are saved as they are given.** This was the blocking
  issue: the app POSTed to DataPipe once, at the end of level 10, so a
  participant who completed the mandatory four levels and stopped — which is
  what most will do — saved nothing at all. It was parked because DataPipe
  refused a filename it had already used, which made per-level checkpointing
  one file per level. **DataPipe's September 2026 release answered it a better
  way than the second save point this asked for**: a session streams each
  answer as it is given, and a participant who stops partway leaves one file of
  what they had answered, written about fifteen minutes after they stop, while
  one who finishes leaves a single ordinary file and no partial. There is
  therefore no "save point" and no core-set filename: every level is saved,
  not just the fourth. See **Where it goes** in `AGENTS.md`.
  - **It moves the point of no return from the last answer to the first**,
    which is the one thing here that changes what participants are told: see
    B16 and B17 above, and the consent form, which now says in plain words that
    answers are recorded as they are given and cannot be taken back.
- **F2 [DONE] — The core is now the first four levels.** The three core levels
  are wrapped in the timeline's own `shuffle()`, which draws their order when
  the file is read; the levels below carry `fork: true`. General is
  level 1 and fixed; Brain-Body Axis (MINT), AI Expertise & Usage (BAIT) and
  Mood & Health (PHQ-4, mental-health history, HiTOP-BR) fill levels 2 to 4 in
  an order drawn for the participant, with nothing offered and nothing chosen;
  the `Self` fork now covers levels 5 to 9, so its first choice is offered from
  the level-4 screen. Checked in a driven test-mode run: all six orders of the
  core appear, the core always fills 2–4, and the two fork cards arrive on the
  level-4 screen.
  - Note: `demographics2` (education, discipline, student status, ethnicity,
    country) travels with the MINT level and `demographics3` (financial
    comfort, social status) with the Mood & Health level, so which of them is
    asked first depends on the draw. That follows the app's existing habit of
    spreading demographics across levels rather than front-loading them; move
    them onto level 1 if the study would rather they were all asked at once.
- **F3 [CREATE] — SONA completion screen.** After the fourth level, the
  participant needs: a "you have completed the study" message, their SONA
  credit link (opening in a new tab), and the choice to continue or stop. The
  app has no such screen; its only ending is the profile after level 10.
- **F4 [CREATE] — Instructions screen.** See §8: the validity-check and
  credit-withholding warning promised in the Project Description does not exist
  in the app.
- **F5 [DECIDE] — The SONA survey code.** SONA passes a per-participant code in
  the URL; the app already reads `?sub=` and saves it verbatim. That code is a
  key to the participant's SONA identity, held by SONA. Either (a) do not pass
  it into the app at all and grant credit by a fixed completion URL, or (b)
  pass it, save it, and describe it honestly in A3/A6/B7/B11a as a
  pseudonymous identifier resolvable only by SONA. (a) keeps the anonymity
  claim simplest; (b) is what lets us match credit to data if a dispute arises.
- **F6 [DECIDE] — The free-text closing box.** `Closing_Comments` (level 10) is
  saved verbatim into a public deposit, and the item warns that what is written
  may be made public. Participants can nonetheless type identifying
  information. Either screen the field before release, or state in the consent
  and in B12a that free-text responses are checked before publication (which is
  what the B12a text above does).
- **F7 [DONE, pending approval] — The consent text in `index.html`** is now
  modelled on the Sussex sheet and describes this study (§8). It still has to
  be replaced with, or confirmed as, the approved version, and its three blanks
  filled in.
- **F8 [CREATE] — Remove the "Test mode" link** from the landing page, and the
  test-mode consent bypass, before launch.
- **F9 [CREATE] — Point DataPipe at production.** `js/app.js` currently posts to
  `datapipe-test.web.app` with experiment ID `Elsjcjycb6ru`. Needs the live
  endpoint and an experiment bound to the real Zenodo deposit.
- **F10 [DECIDE] — Battery name for the SONA link.** The mandatory core is
  `demographics1, fipi, singles, demographics2, mint, bait, demographics3,
  mood, health, hitop` plus `closing`. If the optional continuation is offered,
  the link asks for the whole timeline instead and the core is defined by where
  the completion screen falls, not by a battery. **[DECIDE]** which.
- **F11 [CONFIRM] — Re-run `python docs/build_slides.py` and push** before
  submitting, so the published table the application links to matches
  `content/` at that moment. It is up to date as of this draft; any change to
  `content/` between now and submission makes the link stale, and the link is
  the application's only statement of what the study asks.

---

## 10. Length and burden

Item counts from the Content table in `docs/index.html`. These are maxima: some
items are conditional follow-ups that most participants will not see.

- Level 1 — demographics, FIPI, single-item scales: **21**
- Level 2 — demographics, MINT: **43**
- Level 3 — BAIT: **27**
- Level 4 — demographics, PHQ-4, sleep, mental-health history, HiTOP-BR: **55**
- **Mandatory core: 146**
- Optional continuation (HEXACO + KSE-G, archetypes, primals, ICAR-16,
  attention and emotion measures, closing items): **154**
- **Whole survey: 300**

Three attention checks fall in the core (MINT, BAIT, HiTOP-BR).

**[CONFIRM] Duration.** The previous study quoted ~30 min for 12
questionnaires. A rough estimate here is **20–25 minutes for the mandatory
core** and **45–60 minutes for the whole survey**, but this needs a timed pilot
run before it goes in the consent form and the SONA advert — the figure quoted
determines the credit awarded.

**[DECIDE] SONA credit.** Set against the core only, since the continuation is
unrewarded.

---

## 11. Open questions not covered by a form field

- **[DECIDE]** Does the optional continuation need its own consent step, or
  does the initial consent cover it? Our position: the initial consent covers
  it, provided it describes the continuation and says it is voluntary and
  unrewarded. The completion screen restates the choice.
- **[DECIDE]** Are the agree/disagree votes on the feedback and the per-level
  star ratings analysed as data? If so they belong in the Project Description
  as a measure (they are, in effect, a validity question: does the instrument
  describe the person as they see themselves). If not, say nothing.
- **[DECIDE]** Whether to pre-register, and whether the C-REC reference goes
  into the pre-registration or vice versa.
- **[CONFIRM]** That the OSAI-PM being an unvalidated instrument written for
  this project is stated somewhere. It is the one measure in the survey with no
  published provenance, and the application should not imply otherwise.
