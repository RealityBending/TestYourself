const CUSPS = [
    ["January", 20, 31], // Capricorn → Aquarius
    ["February", 19, 29], // Aquarius → Pisces
    ["March", 21, 31], // Pisces → Aries
    ["April", 20, 30], // Aries → Taurus
    ["May", 21, 31], // Taurus → Gemini
    ["June", 21, 30], // Gemini → Cancer
    ["July", 23, 31], // Cancer → Leo
    ["August", 23, 31], // Leo → Virgo
    ["September", 23, 30], // Virgo → Libra
    ["October", 23, 31], // Libra → Scorpio
    ["November", 22, 30], // Scorpio → Sagittarius
    ["December", 22, 31], // Sagittarius → Capricorn
]

// The row of `CUSPS` the month just given belongs to. The fallback is January
// and is never reached — the item waits on the month — but a question that
// words itself should not be able to throw while being drawn.
function cuspOf(answer) {
    return CUSPS[(answer("Demographics_BirthMonth") || 1) - 1]
}

function ordinal(day) {
    const rest = day % 100
    const end = rest >= 11 && rest <= 13 ? "th" : ["th", "st", "nd", "rd"][day % 10] || "th"
    return day + end
}

// Every demographic item, in this block and the two after it, is keyed
// `Demographics_…` (September 2026; the keys were bare before), so a saved
// file sorts them together and nothing of a questionnaire's own can collide
// with them. The questionnaire keys stay lower-case `demographics1`…`3`.
defineBlock("demographics1", [
    {
        // No dimensions, no scoring, no results.
        key: "demographics1",
        name: "About you",
        instructions: "",
        shuffle: false,
        format: {
            options: [
                { value: 1, text: "Male" },
                { value: 2, text: "Female" },
            ],
            columns: 2,
            color: "#3F51B5",
        },

        items: [
            // Age =================================================================
            {
                key: "Demographics_Age",
                text: "How old are you?",
                format: {
                    input: "number",
                    min: 18,
                    max: 120,
                    placeholder: "Age in years",
                    tooLow: "You must be 18+ years old to participate",
                },
            },
            {
                key: "Demographics_BirthMonth",
                text: "In which month were you born?",
                format: {
                    options: [
                        { value: 1, text: "January" },
                        { value: 2, text: "February" },
                        { value: 3, text: "March" },
                        { value: 4, text: "April" },
                        { value: 5, text: "May" },
                        { value: 6, text: "June" },
                        { value: 7, text: "July" },
                        { value: 8, text: "August" },
                        { value: 9, text: "September" },
                        { value: 10, text: "October" },
                        { value: 11, text: "November" },
                        { value: 12, text: "December" },
                    ],
                    columns: 3,
                },
            },
            // Which side of the month's zodiac cusp the day fell, rather than
            // the day itself: a date of birth is an identifier, a half-month
            // is not, and the half-month is all the star sign on the level-1
            // results needs. The split is that month's cusp — the first day
            // of the sign that begins in it — not the 15th, since every month
            // straddles two signs and the boundary falls between the 19th and
            // the 23rd. So the dates differ month by month, which is what the
            // worded question and options are for: **one item and one key**,
            // reading the month back out of `BirthMonth` to say which two
            // halves it is offering. The results read the sign from
            // `BirthMonth` and this together; "I'd rather not say" leaves it
            // as "one of two".
            {
                key: "Demographics_BirthDay",
                text: (answer) => "Which part of " + cuspOf(answer)[0] + "?",
                // Any month at all, so the item still waits on the answer it
                // words itself from rather than trusting the run's order.
                showIf: { key: "Demographics_BirthMonth", is: CUSPS.map((cusp, at) => at + 1) },
                format: {
                    options: [
                        { value: 1, text: (answer) => "1st to " + ordinal(cuspOf(answer)[1] - 1) },
                        { value: 2, text: (answer) => ordinal(cuspOf(answer)[1]) + " to " + ordinal(cuspOf(answer)[2]) },
                        { value: 3, text: "I'd rather not say", small: true },
                    ],
                    columns: 2,
                },
            },
            // Gender =================================================================
            {
                key: "Demographics_Gender",
                text: "I am...",
                format: {
                    options: [
                        { value: 1, text: "Male" },
                        { value: 2, text: "Female" },
                        { value: 3, text: "It's more complex than that", small: true },
                    ],
                    columns: 2,
                },
            },

            {
                key: "Demographics_GenderBirth",
                text: "I was born...",
                showIf: { key: "Demographics_Gender", is: 3 },
            },
            {
                key: "Demographics_GenderIdentity",
                text: "But I identify as...",
                showIf: { key: "Demographics_Gender", is: 3 },
                format: {
                    input: "text",
                    max: 60,
                    placeholder: "In your own words",
                },
            },
        ],
    },
])
