// Reasoning — the last scored level, and the one level that asks what a
// person can do rather than what they are like. Sixteen short problems, each
// with one right answer, and nothing about them is a rating.
//
// Stems, options and their order are verbatim from Appendix A of the paper's
// supplementary materials — with one change of wording: the rotation stem's
// "the cube labeled X" is "the following cube", since the cube is shown on
// its own here, without the letter the published figure labels it with
// (literature/Condon_Revelle_2014_ICAR_supplement_
// SampleTest.pdf, September 2026), the pictures in assets/icar/ are cut out
// of the eight figures of the same appendix (the figures, and the script that
// cuts them, are in assets/icar/source/), and the answer key is the one the {psych}
// package documents beside these items (`iq.keys`, in ?iqitems). A key that
// ever turns out wrong is one `correct:` hash to replace — `answerKey` in
// timeline.js says how to make one.
defineBlock("icar", [
    {
        type: "briefing",
        key: "Briefing_Reasoning",
        text:
            "<h2>A few puzzles.</h2>" +
            "<p>Most of this test asks what you are like. These questions ask how you <b>think</b>, with sixteen short problems of four kinds: " +
            "words, letters, patterns and shapes, each drawing on a different style of thinking. Each has one right answer.</p>" +
            "<p><em>There is no time limit. If you are not sure, pick the answer that seems most likely.</em></p>",
    },

    // ICAR-16 ==============================================================
    // The 16-item ICAR Sample Test (Condon & Revelle, 2014, Intelligence, 43,
    // 52-64; convergent validity against the WAIS-IV in Young & Keith, 2020,
    // Journal of Psychoeducational Assessment, 38(8), 1052-1059): the public
    // subset of the International Cognitive Ability Resource, four items of
    // each of its four types — verbal reasoning (VR 4, 16, 17, 19), letter
    // series (LN 7, 33, 34, 58), matrix reasoning (MR 45, 46, 47, 55) and
    // three-dimensional rotation (R3D 3, 4, 6, 8). The keys carry the ICAR's
    // own item numbers under the app's prefix, so a saved file maps onto the
    // published item names (reason.4, letter.7, matrix.45, rotate.3 in the
    // {psych} package) by renaming alone. Untimed, as validated; the sample
    // test's order was randomised in validation too, so these shuffle.
    //
    // Scored right or wrong: every item carries `correct:` (the hash of its
    // right option, see timeline.js) and counts 1 or 0, so a dimension's
    // score is the share of its four items got right. The four types are four
    // dimensions on purpose, and there are NO NORMS, on purpose: the level is
    // read back as the four against each other — which came easiest — and
    // not as a standing against other people. A general score is deliberately
    // not fed back; the total is one sum at analysis time. The four take axes
    // on the whole-run web (`profile: true`, the opt-in for a questionnaire
    // without norms), each as its share of items right.
    //
    // THE FOUR CARRY PLAIN NAMES, framed to the participant as four cognitive
    // styles rather than as the ICAR's subtests — Verbal for verbal reasoning,
    // Logical for the letter series, Visual for matrix reasoning, Spatial for
    // three-dimensional rotation — one for one, so nothing about the scoring
    // changes; the item keys still name the subtest. "Styles" is the
    // feedback's word, not the instrument's: what is measured is performance
    // on four kinds of problem, and the compass reads it as which kind came
    // easiest, which is the one reading four items a kind can bear.
    //
    // Option values are the option's position in the ICAR's own list, so the
    // saved file's words ("47", "X", "C") and the values behind them both
    // read back onto the published key. The picture items are drawn: the
    // problem is the item's picture and each candidate is a picture on a
    // button of its own, cut out of the published figure, with its letter
    // under it — the letter being what the file records. Two of a rotation
    // item's eight candidates are written rather than drawn ("None of the
    // cubes could be a rotation", "I do not know the solution"): those are
    // plain labelled options, saved as their words where the letters D and
    // H stood until September 2026, on the same values.
    //
    // No attention check: a right-answer test has no straight line to catch,
    // and a check written as a giveaway item would be one more thing to get
    // right.
    {
        key: "icar16",
        name: "Reasoning",
        profile: true,
        instructions: "Choose the one answer you think is right",

        items: [
            // Verbal reasoning ------------------------------------------------
            {
                key: "ICAR_VR_04",
                dimension: "Verbal",
                text: "What number is one fifth of one fourth of one ninth of 900?",
                correct: "b1ff7f29",
                format: {
                    options: [
                        { value: 1, text: "2" },
                        { value: 2, text: "3" },
                        { value: 3, text: "4" },
                        { value: 4, text: "5" },
                        { value: 5, text: "6" },
                        { value: 6, text: "7" },
                    ],
                    columns: 6,
                    color: "#3f7fd6",
                },
            },
            {
                key: "ICAR_VR_16",
                dimension: "Verbal",
                text: "Zach is taller than Matt and Richard is shorter than Zach. Which of the following statements would be most accurate?",
                correct: "0421d2aa",
                format: {
                    options: [
                        { value: 1, text: "Richard is taller than Matt" },
                        { value: 2, text: "Richard is shorter than Matt" },
                        { value: 3, text: "Richard is as tall as Matt" },
                        { value: 4, text: "It's impossible to tell" },
                    ],
                    color: "#3f7fd6",
                },
            },
            {
                key: "ICAR_VR_17",
                dimension: "Verbal",
                text: "Joshua is 12 years old and his sister is three times as old as he. When Joshua is 23 years old, how old will his sister be?",
                correct: "8851bb79",
                format: {
                    options: [
                        { value: 1, text: "35" },
                        { value: 2, text: "39" },
                        { value: 3, text: "44" },
                        { value: 4, text: "47" },
                        { value: 5, text: "53" },
                        { value: 6, text: "57" },
                    ],
                    columns: 6,
                    color: "#3f7fd6",
                },
            },
            {
                key: "ICAR_VR_19",
                dimension: "Verbal",
                text: "If the day after tomorrow is two days before Thursday then what day is it today?",
                correct: "fac87d49",
                format: {
                    options: [
                        { value: 1, text: "Friday" },
                        { value: 2, text: "Monday" },
                        { value: 3, text: "Wednesday" },
                        { value: 4, text: "Saturday" },
                        { value: 5, text: "Tuesday" },
                        { value: 6, text: "Sunday" },
                    ],
                    columns: 3,
                    color: "#3f7fd6",
                },
            },

            // Letter series -----------------------------------------------------
            {
                key: "ICAR_LN_07",
                dimension: "Logical",
                text: "In the following alphanumeric series, what letter comes next?" + '<span class="series">K &nbsp;N &nbsp;P &nbsp;S &nbsp;U</span>',
                correct: "174f59f8",
                format: {
                    options: [
                        { value: 1, text: "S" },
                        { value: 2, text: "T" },
                        { value: 3, text: "U" },
                        { value: 4, text: "V" },
                        { value: 5, text: "W" },
                        { value: 6, text: "X" },
                    ],
                    columns: 6,
                    color: "#2fae8f",
                },
            },
            {
                key: "ICAR_LN_33",
                dimension: "Logical",
                text: "In the following alphanumeric series, what letter comes next?" + '<span class="series">V &nbsp;Q &nbsp;M &nbsp;J &nbsp;H</span>',
                correct: "d96e3ec0",
                format: {
                    options: [
                        { value: 1, text: "E" },
                        { value: 2, text: "F" },
                        { value: 3, text: "G" },
                        { value: 4, text: "H" },
                        { value: 5, text: "I" },
                        { value: 6, text: "J" },
                    ],
                    columns: 6,
                    color: "#2fae8f",
                },
            },
            {
                key: "ICAR_LN_34",
                dimension: "Logical",
                text: "In the following alphanumeric series, what letter comes next?" + '<span class="series">I &nbsp;J &nbsp;L &nbsp;O &nbsp;S</span>',
                correct: "7de61a38",
                format: {
                    options: [
                        { value: 1, text: "T" },
                        { value: 2, text: "U" },
                        { value: 3, text: "V" },
                        { value: 4, text: "X" },
                        { value: 5, text: "Y" },
                        { value: 6, text: "Z" },
                    ],
                    columns: 6,
                    color: "#2fae8f",
                },
            },
            {
                key: "ICAR_LN_58",
                dimension: "Logical",
                text: "In the following alphanumeric series, what letter comes next?" + '<span class="series">Q &nbsp;S &nbsp;N &nbsp;P &nbsp;L</span>',
                correct: "5e61f052",
                format: {
                    options: [
                        { value: 1, text: "J" },
                        { value: 2, text: "H" },
                        { value: 3, text: "I" },
                        { value: 4, text: "N" },
                        { value: 5, text: "M" },
                        { value: 6, text: "L" },
                    ],
                    columns: 6,
                    color: "#2fae8f",
                },
            },

            // Matrix reasoning --------------------------------------------------
            // A 3 × 3 grid with one cell missing, and six candidates lettered
            // A to F, each a picture on its own button.
            {
                key: "ICAR_MR_45",
                dimension: "Visual",
                text: matrixItem("MR45"),
                correct: "b70e634c",
                format: { options: pictured("MR45", "ABCDEF"), columns: 6, color: "#e0a63a" },
            },
            {
                key: "ICAR_MR_46",
                dimension: "Visual",
                text: matrixItem("MR46"),
                correct: "57863878",
                format: { options: pictured("MR46", "ABCDEF"), columns: 6, color: "#e0a63a" },
            },
            {
                key: "ICAR_MR_47",
                dimension: "Visual",
                text: matrixItem("MR47"),
                correct: "e3b62ddf",
                format: { options: pictured("MR47", "ABCDEF"), columns: 6, color: "#e0a63a" },
            },
            {
                key: "ICAR_MR_55",
                dimension: "Visual",
                text: matrixItem("MR55"),
                correct: "85f6d11a",
                format: { options: pictured("MR55", "ABCDEF"), columns: 6, color: "#e0a63a" },
            },

            // Three-dimensional rotation ---------------------------------------
            // The cube to rotate (X in the published figure, shown here
            // without the letter), and eight candidates lettered A to H: six
            // cubes, each a picture on its own button, and two written answers.
            {
                key: "ICAR_R3D_03",
                dimension: "Spatial",
                text: rotationItem("R3D03"),
                correct: "04ce8668",
                format: { options: cubes("R3D03"), columns: 4, color: "#d75a86" },
            },
            {
                key: "ICAR_R3D_04",
                dimension: "Spatial",
                text: rotationItem("R3D04"),
                correct: "0f456f72",
                format: { options: cubes("R3D04"), columns: 4, color: "#d75a86" },
            },
            {
                key: "ICAR_R3D_06",
                dimension: "Spatial",
                text: rotationItem("R3D06"),
                correct: "b10179ec",
                format: { options: cubes("R3D06"), columns: 4, color: "#d75a86" },
            },
            {
                key: "ICAR_R3D_08",
                dimension: "Spatial",
                text: rotationItem("R3D08"),
                correct: "e7a9543d",
                format: { options: cubes("R3D08"), columns: 4, color: "#d75a86" },
            },
        ],
    },
])

// The picture items' stems and buttons, written once. The problem is the
// item's text, on a white plate (`.text img`, style.css) since the ICAR's
// figures are black line on white; a candidate is a picture on its own
// button (`image:`, with the letter as its caption and its saved word). The
// files are the pieces assets/icar/source/cut.py cuts out of the published
// figures. Function declarations, so they are hoisted above the `defineBlock`
// call that uses them.
function picture(name) {
    return "assets/icar/" + name + ".png"
}

function pictured(file, letters) {
    return letters.split("").map((letter, at) => ({ value: at + 1, text: letter, image: picture(file + "_" + letter) }))
}

// A rotation item's D and H are the two written answers, as published, and
// are options like any other labelled ones; the six cubes are pictures.
function cubes(file) {
    return "ABCDEFGH".split("").map((letter, at) => {
        if (letter === "D") return { value: at + 1, text: "None of the cubes could be a rotation" }
        if (letter === "H") return { value: at + 1, text: "I do not know the solution" }
        return { value: at + 1, text: letter, image: picture(file + "_" + letter) }
    })
}

function matrixItem(file) {
    return (
        "Please indicate which is the best answer to complete the figure below" +
        '<img src="' + picture(file) + '" alt="A three by three grid of figures, the last cell a question mark" />'
    )
}

function rotationItem(file) {
    return (
        "All the cubes below have a different image on each side. Select the choice that could represent a rotation of the following cube" +
        '<img src="' + picture(file) + '" alt="A cube with three of its faces showing" class="cube" />'
    )
}
