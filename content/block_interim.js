// The client-side completion URL of the study on SONA (experiment 2102 on
// sussexpsychology.sona-systems.com, see data/collected/recruitment.md), cut
// after `survey_code=`. The participant's code goes on the end, and it is
// SONA's own survey code only when the study's link on SONA brings it, so
// that link has to say `?pid=%SURVEY_CODE%` beside `&source=SONA&project=mint`
// — without it the code is one the app made, and SONA grants nothing for it.
// Offered only to a run whose link says `?source=SONA` (any case), under the
// debrief and over the choice to go on (`Briefing_Onward`).
//
// **It is written encoded**, reversed and then base64, because its
// `credit_token` is what lets SONA grant the credit and this file is public.
// That is obfuscation, not secrecy (`answerKey`'s reasoning): the page has to
// be able to offer the link, so anybody reading the code can decode it, but
// the token stays out of a search of the repository and off a casual reading
// of the source, and nothing but a SONA survey code signed up to the study
// gets credit from it. To write a new one, call
// `btoa([...url].reverse().join(""))` in the console on the URL SONA gives.
const SONA_CREDIT =
    "PWVkb2NfeWV2cnVzJjRmNTY2NzQ1ZWU2MWU3YTk1YmI0OTJhODg5YjBmOTYzPW5la290X3RpZGVyYyYyMDEyPWRpX3RuZW1pcmVweGU/eHBzYS50aWRlcmNfeWR1dHNiZXcvbW9jLnNtZXRzeXMtYW5vcy55Z29sb2hjeXNweGVzc3VzLy86c3B0dGg="

// The credit link for one participant, decoded only when it is offered.
function sonaCredit(code) {
    return [...atob(SONA_CREDIT)].reverse().join("") + encodeURIComponent(code)
}

defineBlock("interim", [
    // THE INTERIM ==========================================================
    // The end of the main part of the study — the core, which the ethics
    // application asks of everybody — and the way into the rest, which it does
    // not. It is written on the timeline between the two forks as an
    // interlude (see content/timeline.js): it opens the place after the core,
    // whichever level the person then puts there, and it is none of that
    // level's, so nothing in it counts towards the level's ring, its
    // countdown or its quality control.
    //
    // Somebody who stops once the core is done has, by then, said how
    // seriously they took it and anything they wanted to say. These are the
    // two questions the closing asks at the very end, asked again here under
    // keys of their own, so that each stretch of the run has its own answer:
    // somebody tired by the last level may say so, and that should cast no
    // doubt on their core.
    //
    // Then one screen for the rest: the debrief, the SONA credit for a run
    // that came from SONA, and the choice to go on or stop.
    //
    // Every other briefing is written to hold wherever the timeline puts it.
    // These say where in the run they fall, since that is what they are for.
    //
    // The thank-you is the one briefing that is a reward rather than a pause
    // (`celebrate`): the end of the part of the study that is asked of
    // everybody, and for most people the end of the study.
    {
        type: "briefing",
        key: "Briefing_Interim",
        celebrate: true,
        text:
            '<p class="briefing__cheer" aria-hidden="true">🥳</p>' +
            "<h2>Well done, you've completed the main part of the study!</h2>" +
            "<p>Before you go on, two quick questions about how it went.</p>",
    },
    {
        key: "interim",
        name: "The main part",
        instructions: "",
        shuffle: false,
        format: {
            options: [
                { value: 1, text: "Yes - I answered as accurately as I could" },
                { value: 0, text: "No - I answered quite randomly" },
            ],
            columns: 1,
            color: "#d9a441",
        },

        items: [
            {
                key: "Interim_SurveyAccuracy",
                text: "Did you take the test seriously so far?<br /><small>(This won't impact your results, but will help us improve the test.)</small>",
            },
            // As the closing's box: optional, scored by nothing, read back to
            // nobody, and warned over, since what is written may be published.
            {
                key: "Interim_Comments",
                text:
                    "Is there anything you would like to share so far? Any feedback or thoughts about the test, or about what it has told you, are very welcome." +
                    "<br /><small>Please note that whatever you write here may be made publicly available (for instance as part of the published data), " +
                    "so do not include anything that could identify you or anybody else unless you are happy for it to be public.</small>",
                format: {
                    input: "text",
                    multiline: true,
                    optional: true,
                    max: 3000,
                    placeholder: "What you liked, what confused you, what you would change, what you made of your results...",
                    color: "#d9a441",
                },
            },
        ],
    },
    // The debrief, which the ethics application promises everybody who
    // finishes the study — its aim, what interoception is, the one thing done
    // differently to different people (the MINT's response format), that the
    // results were descriptions and not diagnoses, confidentiality, the two
    // contacts on the consent sheet and where to find support — in two
    // paragraphs, on the screen where most people stop, so that it is read
    // before the choice to stop or go on. Its links open in a new tab, so
    // following one leaves the run where it is.
    //
    // A run whose link says `?source=SONA` is offered its credit under it,
    // since this is where most people stop: a link to SONA in a new tab, their
    // code on the end of it (`sonaCredit`, above), and the line the consent
    // sheet and the ethics application promise, that going on earns no more
    // of it. The text is worded from the run (`run.source`,
    // `run.participant`) for that, as an item is worded from an answer.
    //
    // The way on is not a button but the choice of what comes next
    // (`onward`): while a fork is still to fill the place this opens, its
    // cards stand under this briefing in place of Continue, the same cards a
    // level screen offers, and taking one is this briefing's answer. Where
    // there is nothing left to choose between, it is a briefing like any
    // other.
    {
        type: "briefing",
        key: "Briefing_Onward",
        onward: true,
        text: (answer, run) => {
            const sona = /^sona$/i.test(run.source)
            return (
                "<h2>About this study</h2>" +
                "<p>This study is validating a new questionnaire of <b>interoception</b>: how you sense and make " +
                "sense of the signals from inside your body, such as your heartbeat, your breathing or your stomach, " +
                "which have been linked to emotion, self-awareness and well-being. The other questionnaires show how it " +
                "relates to mood, health and views of AI, and the questions about your body were answered on circles " +
                "or on a slider, drawn at random, to find out whether the way a question is answered changes the " +
                "answer. The results you were shown describe your answers: none of them is a diagnosis.</p>" +
                "<p>Your answers are kept confidential and stored de-identified. For any question or concern, contact " +
                "Dr Dominique Makowski (<i>D.Makowski@sussex.ac.uk</i>) or Asel Tohlukov (<i>at775@sussex.ac.uk</i>). " +
                "If anything here brought up something difficult, the " +
                '<a href="https://www.samaritans.org/" target="_blank" rel="noopener">Samaritans</a> ' +
                "(116 123, free, day or night) and " +
                '<a href="https://www.mind.org.uk/" target="_blank" rel="noopener">Mind</a> (0300 123 3393) are there ' +
                "to listen, and so are the University of Sussex's " +
                '<a href="https://student.sussex.ac.uk/wellbeing/" target="_blank" rel="noopener">health and ' +
                "wellbeing services</a> for its students.</p>" +
                (sona
                    ? '<div class="briefing__credit">' +
                      "<p>Your SONA credit is for the main part, which you have finished, so it is yours whatever you " +
                      "do next. Claim it now, in a new tab, before you go on or close this page.</p>" +
                      '<a class="btn" href="' +
                      sonaCredit(run.participant) +
                      '" target="_blank" rel="noopener">Claim your SONA credit ↗</a>' +
                      "</div>"
                    : "") +
                '<div class="briefing__next">' +
                "<h3>What next?</h3>" +
                "<p>The test goes on, and every level will reveal something new about you. They are optional" +
                (sona ? " and earn no further credit" : "") +
                ", so you can stop at any point you feel like. Choose which part of yourself to explore next.</p>" +
                "</div>"
            )
        },
    },
])
