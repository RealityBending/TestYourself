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
                key: "Accuracy",
                text: "One last thing. Did you take the test seriously?<br /><small>(This won't impact your results, but will help us improve the test.)</small>",
            },
        ],
    },
])
