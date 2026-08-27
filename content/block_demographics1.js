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
                key: "Age",
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
                key: "MonthBirth",
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
            // Gender =================================================================
            {
                key: "Gender",
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
                key: "GenderBirth",
                text: "I was born...",
                showIf: { key: "Gender", is: 3 },
            },
            {
                key: "GenderIdentity",
                text: "But I identify as...",
                showIf: { key: "Gender", is: 3 },
                format: {
                    input: "text",
                    max: 60,
                    placeholder: "In your own words",
                },
            },
        ],
    },
])
