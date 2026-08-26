/* ==========================================================================
   content/level4.js — the last item, on a level of its own so that it is
   asked after the final part has been opened rather than instead of it.
   ========================================================================== */

Object.assign(QUESTIONNAIRES, {
    // CLOSING ==============================================================
    // The end of the run, on a level of its own so that it comes after the
    // last part has been opened rather than instead of it. It scores nothing
    // and has no results: a level with no dimensions in it is not a part.

    closing: {
        name: "Before you go",
        instructions: "",
        level: 4,
        shuffle: false,
        format: {
            options: [
                { value: 1, text: "Yes - I answered as accurately as I could" },
                { value: 0, text: "No - I answered quite randomly" },
            ],
            columns: 1,
            color: "#d9a441",
        },

        items: [{ key: "Accuracy", text: "One last thing. Did you take the test seriously?" }],
    },
})
