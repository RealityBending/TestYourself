defineBlock("closing", [
    // CLOSING ==============================================================
    // The end of the run, on a level of its own so that it is asked after the
    // final results have been opened rather than instead of them.

    {
        key: "closing",
        name: "Before you go",
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
                key: "Demographics_SurveyAccuracy",
                text: "One last thing. Did you take the test seriously?<br /><small>(This won't impact your results, but will help us improve the test.)</small>",
            },
            // The very last item: a box for anything the person wants to say,
            // in their own words, which nothing scores and nothing reads back.
            // It may be left blank — "Skip" is an answer — and what is written
            // may end up in the published data, which the item says over the
            // box so that nobody puts their name in it without meaning to.
            {
                key: "Closing_Comments",
                text:
                    "Is there anything you would like to share? Any feedback or thoughts about the test, or about what it told you, are very welcome." +
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
])
