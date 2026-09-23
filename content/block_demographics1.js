// The months and the most days each can have — February's 29, since a
// birthday may fall on the 29th. These names are globals every file on the
// page shares, hence the prefix.
const BIRTH_MONTHS = [
    ["January", 31],
    ["February", 29],
    ["March", 31],
    ["April", 30],
    ["May", 31],
    ["June", 30],
    ["July", 31],
    ["August", 31],
    ["September", 30],
    ["October", 31],
    ["November", 30],
    ["December", 31],
]

// The name of the month just given. The fallback is January and is never
// reached — the item waits on the month — but a question that words itself
// should not be able to throw while being drawn.
function birthMonthOf(answer) {
    return BIRTH_MONTHS[(answer("Demographics_BirthMonth") || 1) - 1][0]
}

// A button a day. A day some month lacks carries a `showIf` naming the months
// that have it, so February stops at the 29th and April at the 30th.
function birthDays() {
    const days = []
    for (let day = 1; day <= 31; day++) {
        const option = { value: day, text: String(day) }
        const months = BIRTH_MONTHS.map((month, at) => (month[1] >= day ? at + 1 : 0)).filter(Boolean)
        if (months.length < BIRTH_MONTHS.length) option.showIf = { key: "Demographics_BirthMonth", is: months }
        days.push(option)
    }
    return days
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
            // The day itself, a button a day laid out like a calendar (until
            // September 2026 it was only which side of that month's zodiac
            // cusp the day fell). The star sign on the level-1 results is read
            // from the month and this together. **The day is an identifier
            // and is never released**: with the month and the age beside it,
            // it is most of a date of birth. It stays in the raw files and
            // before any data are made public it is dropped, or grouped into
            // the star sign or the half of the month it falls in — the same
            // stage at which a recruitment platform's id is removed, and the
            // consent sheet and the ethics application both say so. "I'd
            // rather not say" leaves the sign as "one of two".
            {
                key: "Demographics_BirthDay",
                text: (answer) => "On which day of " + birthMonthOf(answer) + " were you born?",
                // Any month at all, so the item still waits on the answer it
                // words itself from rather than trusting the run's order.
                showIf: { key: "Demographics_BirthMonth", is: BIRTH_MONTHS.map((month, at) => at + 1) },
                format: {
                    options: birthDays().concat([{ value: 99, text: "I'd rather not say", small: true }]),
                    columns: 7,
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
