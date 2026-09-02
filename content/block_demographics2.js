defineBlock("demographics2", [
    // DEMOGRAPHICS 2 =======================================================
    // The rest of what is asked about somebody rather than of them. It waits
    // for the second level so that the way in stays short, and is written in
    // the order it is asked: an item that opens on an answer follows it.

    {
        key: "demographics2",
        name: "Background",
        instructions: "",
        shuffle: false,
        // The plain yes or no. Every other item here carries a list of its own.
        format: {
            options: [
                { value: 1, text: "Yes" },
                { value: 0, text: "No" },
            ],
            columns: 2,
            color: "#2f6f9f",
        },

        items: [
            // Counted upwards, so that the codes read as an order rather than
            // as a set of labels. "Other" is 0: it is outside the ladder.
            {
                key: "Education",
                text: "What is your highest completed education level?",
                format: {
                    options: [
                        { value: 5, text: "University (doctorate)" },
                        { value: 4, text: "University (master)" },
                        { value: 3, text: "University (bachelor)" },
                        { value: 2, text: "High school / Secondary school (or 6th form college)" },
                        { value: 1, text: "Elementary school" },
                        { value: 0, text: "Other", small: true, custom: true },
                    ],
                    columns: 1,
                    color: "#2f6f9f",
                },
            },
            {
                key: "EducationOther",
                text: "Your highest completed education level is...",
                showIf: { key: "Education", is: 0 },
                format: { input: "text", max: 60, placeholder: "Please specify", color: "#2f6f9f" },
            },

            // Only somebody who went to university has one to give.
            {
                key: "Discipline",
                text: "What is your discipline?",
                showIf: { key: "Education", is: [3, 4, 5] },
                format: {
                    options: [
                        { value: 1, text: "Arts and Humanities" },
                        { value: 2, text: "Media, Communication" },
                        { value: 3, text: "Literature, Languages" },
                        { value: 4, text: "History, Archaeology" },
                        { value: 5, text: "Sociology, Anthropology" },
                        { value: 6, text: "Political Science, Law" },
                        { value: 7, text: "Business, Economics" },
                        { value: 8, text: "Psychology, Neuroscience" },
                        { value: 9, text: "Medicine" },
                        { value: 10, text: "Biology, Chemistry" },
                        { value: 11, text: "Mathematics, Physics" },
                        { value: 12, text: "Engineering, Computer Science" },
                        { value: 0, text: "Other", small: true, custom: true },
                    ],
                    columns: 2,
                    color: "#2f6f9f",
                },
            },
            {
                key: "DisciplineOther",
                text: "Your discipline is...",
                showIf: { key: "Discipline", is: 0 },
                format: { input: "text", max: 60, placeholder: "Please specify", color: "#2f6f9f" },
            },

            // Asked of the levels somebody may still be working through.
            {
                key: "Student",
                text: "Are you currently a student?",
                showIf: { key: "Education", is: [2, 3, 4] },
            },

            {
                key: "Ethnicity",
                text: "How would you describe your ethnicity?",
                format: {
                    options: [
                        { value: 1, text: "White" },
                        { value: 2, text: "Black" },
                        { value: 3, text: "Hispanic/Latino" },
                        { value: 4, text: "Middle Eastern/North African" },
                        { value: 5, text: "South Asian" },
                        { value: 6, text: "East Asian" },
                        { value: 7, text: "Southeast Asian" },
                        { value: 8, text: "Mixed" },
                        { value: 0, text: "Other", small: true, custom: true },
                        // A way out of the question rather than an answer to it.
                        { value: -1, text: "Prefer not to say", small: true, custom: true },
                    ],
                    // Ten of them stacked would run off the bottom of the
                    // window; the two set below the rest still span it.
                    columns: 2,
                    color: "#2f6f9f",
                },
            },
            {
                key: "EthnicityOther",
                text: "You would describe your ethnicity as...",
                showIf: { key: "Ethnicity", is: 0 },
                format: { input: "text", max: 60, placeholder: "Please specify", color: "#2f6f9f" },
            },

            // A button each for where most people taking this are, and the rest
            // of the world typed in: every country will not go on a screen, and
            // there is no dropdown here to put one in.
            {
                key: "Country",
                text: "In which country are you currently living?",
                format: {
                    options: [
                        { value: 1, text: "United Kingdom" },
                        { value: 2, text: "Ireland" },
                        { value: 3, text: "United States" },
                        { value: 4, text: "Australia" },
                        { value: 0, text: "Somewhere else", small: true, custom: true },
                    ],
                    columns: 2,
                    color: "#2f6f9f",
                },
            },
            {
                key: "CountryOther",
                text: "You are currently living in...",
                showIf: { key: "Country", is: 0 },
                format: { input: "text", max: 60, placeholder: "e.g., France", color: "#2f6f9f" },
            },
        ],
    },
])
