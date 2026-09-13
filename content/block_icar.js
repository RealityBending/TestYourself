// Reasoning — the last scored level, and the one level that asks what a
// person can do rather than what they are like. Sixteen short problems, each
// with one right answer, and nothing about them is a rating.
//
// Stems, options and their order are verbatim from Appendix A of the paper's
// supplementary materials (literature/Condon_Revelle_2014_ICAR_supplement_
// SampleTest.pdf, September 2026), the eight pictures in assets/icar/ are the
// figures out of the same appendix, and the answer key is the one the {psych}
// package documents beside these items (`iq.keys`, in ?iqitems). A key that
// ever turns out wrong is one `correct:` hash to replace — `answerKey` in
// timeline.js says how to make one.
defineBlock("icar", [
    {
        type: "briefing",
        key: "Briefing_Reasoning",
        text:
            "<h2>Finally, a few puzzles.</h2>" +
            "<p>Everything so far has asked what you are like. The last stretch asks how you <b>think</b>: sixteen short problems of four kinds — " +
            "words, letters, patterns and shapes. Each has one right answer.</p>" +
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
    // read back as the four against each other — which kind of reasoning came
    // easiest — and not as a standing against other people. A general score
    // is deliberately not fed back; the total is one sum at analysis time.
    // The four take axes on the whole-run web (`profile: true`, the opt-in
    // for a questionnaire without norms), each as its share of items right.
    //
    // Option values are the option's position in the ICAR's own list, so the
    // saved file's words ("47", "X", "C") and the values behind them both
    // read back onto the published key. The picture items are one image
    // each — the problem and its lettered candidates drawn together, as the
    // ICAR draws them — with a lettered button per candidate.
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
                dimension: "Verbal Reasoning",
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
                dimension: "Verbal Reasoning",
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
                dimension: "Verbal Reasoning",
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
                dimension: "Verbal Reasoning",
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
                dimension: "Letter Series",
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
                dimension: "Letter Series",
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
                dimension: "Letter Series",
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
                dimension: "Letter Series",
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
            // One picture apiece: a 3 × 3 grid with one cell missing, and the
            // six candidates lettered A to F drawn under it, as the ICAR
            // presents them.
            {
                key: "ICAR_MR_45",
                dimension: "Matrix Reasoning",
                text: matrixItem("MR45"),
                correct: "b70e634c",
                format: { options: lettered(6), columns: 6, color: "#e0a63a" },
            },
            {
                key: "ICAR_MR_46",
                dimension: "Matrix Reasoning",
                text: matrixItem("MR46"),
                correct: "57863878",
                format: { options: lettered(6), columns: 6, color: "#e0a63a" },
            },
            {
                key: "ICAR_MR_47",
                dimension: "Matrix Reasoning",
                text: matrixItem("MR47"),
                correct: "e3b62ddf",
                format: { options: lettered(6), columns: 6, color: "#e0a63a" },
            },
            {
                key: "ICAR_MR_55",
                dimension: "Matrix Reasoning",
                text: matrixItem("MR55"),
                correct: "85f6d11a",
                format: { options: lettered(6), columns: 6, color: "#e0a63a" },
            },

            // Three-dimensional rotation ---------------------------------------
            // One picture apiece: the target cube and the eight candidates
            // lettered A to H, as the ICAR presents them.
            {
                key: "ICAR_R3D_03",
                dimension: "Spatial Rotation",
                text: rotationItem("R3D03"),
                correct: "04ce8668",
                format: { options: lettered(8), columns: 8, color: "#d75a86" },
            },
            {
                key: "ICAR_R3D_04",
                dimension: "Spatial Rotation",
                text: rotationItem("R3D04"),
                correct: "0f456f72",
                format: { options: lettered(8), columns: 8, color: "#d75a86" },
            },
            {
                key: "ICAR_R3D_06",
                dimension: "Spatial Rotation",
                text: rotationItem("R3D06"),
                correct: "b10179ec",
                format: { options: lettered(8), columns: 8, color: "#d75a86" },
            },
            {
                key: "ICAR_R3D_08",
                dimension: "Spatial Rotation",
                text: rotationItem("R3D08"),
                correct: "e7a9543d",
                format: { options: lettered(8), columns: 8, color: "#d75a86" },
            },
        ],
    },
])

// The picture items' stems and buttons, written once. A button per lettered
// candidate, the letter being what the file records; the picture itself is
// the item's text, on a white plate (`.text img`, style.css) since the ICAR's
// figures are black line on white. Function declarations, so they are hoisted
// above the `defineBlock` call that uses them.
function lettered(count) {
    return "ABCDEFGH"
        .slice(0, count)
        .split("")
        .map((letter, at) => ({ value: at + 1, text: letter }))
}

function matrixItem(file) {
    return (
        "Please indicate which is the best answer to complete the figure below" +
        '<img src="assets/icar/' + file + '.jpg" alt="A three by three grid of figures with one missing, and six candidate figures lettered A to F" />'
    )
}

function rotationItem(file) {
    return (
        "All the cubes below have a different image on each side. Select the choice that could represent a rotation of the cube labeled X" +
        '<img src="assets/icar/' + file + '.jpg" alt="A cube labelled X, and eight candidate cubes lettered A to H" />'
    )
}
