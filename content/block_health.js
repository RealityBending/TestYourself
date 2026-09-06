defineBlock("health", [
    {
        type: "briefing",
        key: "Briefing_Health",
        text:
            "<h2>Now, your health.</h2>" +
            "<p>A couple of questions about conditions you have been diagnosed with, and any treatment you are " +
            "currently receiving for them. If none of it applies to you, say so and move on.</p>",
    },

    // SSS-8 ================================================================
    // Somatic Symptom Scale-8 (Gierk et al., 2014), the short form of the
    // PHQ-15. The published reading is the 0-32 sum over all eight items — no
    // or minimal (0-3), low (4-7), medium (8-11), high (12-15), very high
    // (16-32) — and that sum can be taken from the raw answers at analysis
    // time. Here the eight are read as the four bodily domains they were
    // written in, so that the feedback says *where* the week has been felt
    // rather than only how much; each is averaged like every other dimension.

    // COMMENTED OUT (September 2026): the HiTOP-BR, now asked on this same
    // level, covers bodily complaints over the last twelve months, and the
    // Health face reads the self-rated health single item from level 1
    // instead. What is lost is the one-week, system-by-system picture (gut,
    // chest, fatigue, sleep), which the SSS-8 only gives as the whole eight
    // with its norms — a subset would keep the items and lose the meaning.
    // Kept whole so it can be put back by uncommenting; it would want
    // "sss8" back in MOOD_HEALTH_OF in results.js, a Health face reading its
    // four domains again, and its line back on the Includes list.
    // {
    //     key: "sss8",
    //     name: "Somatic Symptoms",
    //     instructions: "",
    //     format: {
    //         options: [
    //             { value: 0, text: "Not at all" },
    //             { value: 1, text: "A little bit" },
    //             { value: 2, text: "Somewhat" },
    //             { value: 3, text: "Quite a bit" },
    //             { value: 4, text: "Very much" },
    //         ],
    //         vertical: true,
    //         color: "#2a9d8f",
    //         hovercolors: ["#22c55e", "#ef4444"],
    //     },
    //
    //     // PLACEHOLDER norms, invented. Not from any published sample.
    //     norms: {
    //         Pain: {
    //             mean: 1.0,
    //             sd: 0.9,
    //             interpretations: {
    //                 low: "your back, limbs and head have been quiet this week, and pain has not been something you had to work around.",
    //                 mid: "some aches came and went over the week, at about the rate most people report.",
    //                 high: "pain has been a regular part of your week rather than an occasional visitor — worth mentioning to a doctor, if nobody has heard about it yet.",
    //             },
    //         },
    //         Gastrointestinal: {
    //             mean: 0.7,
    //             sd: 0.9,
    //             interpretations: {
    //                 low: "your stomach and gut went about their business this week without asking for your attention.",
    //                 mid: "your gut made itself felt now and then, as most people's does.",
    //                 high: "your stomach or bowels bothered you through a good deal of the week — common enough, and worth raising with a doctor if it keeps up.",
    //             },
    //         },
    //         Cardiopulmonary: {
    //             mean: 0.5,
    //             sd: 0.7,
    //             interpretations: {
    //                 low: "your chest and your breathing stayed in the background this week, which is where most people notice them least.",
    //                 mid: "you noticed your chest or your breathing once or twice this week.",
    //                 high: "chest sensations, breathlessness or dizziness ran through much of your week; that is worth a doctor's ear rather than a website's.",
    //             },
    //         },
    //         Fatigue: {
    //             mean: 1.3,
    //             sd: 1.0,
    //             interpretations: {
    //                 low: "energy and sleep held up this week, and tiredness was not in the way.",
    //                 mid: "you had tired days and slept less well on some nights, at about the rate most people do.",
    //                 high: "low energy and broken sleep ran through most of the week, which tends to make everything else — this test included — harder than it needs to be.",
    //             },
    //         },
    //     },
    //
    //     items: [
    //         {
    //             key: "SSS8_Gastrointestinal_1",
    //             dimension: "Gastrointestinal",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Stomach or bowel problems</em>",
    //         },
    //         {
    //             key: "SSS8_Pain_2",
    //             dimension: "Pain",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Back pain</em>",
    //         },
    //         {
    //             key: "SSS8_Pain_3",
    //             dimension: "Pain",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Pain in your arms, legs or joints</em>",
    //         },
    //         {
    //             key: "SSS8_Pain_4",
    //             dimension: "Pain",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Headaches</em>",
    //         },
    //         {
    //             key: "SSS8_Cardiopulmonary_5",
    //             dimension: "Cardiopulmonary",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Chest pain or shortness of breath</em>",
    //         },
    //         {
    //             key: "SSS8_Cardiopulmonary_6",
    //             dimension: "Cardiopulmonary",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Dizziness</em>",
    //         },
    //         {
    //             key: "SSS8_Fatigue_7",
    //             dimension: "Fatigue",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Feeling tired or having low energy</em>",
    //         },
    //         {
    //             key: "SSS8_Fatigue_8",
    //             dimension: "Fatigue",
    //             text: "<small>During the past 7 days, how much have you been bothered by:</small><br /><em>Trouble sleeping</em>",
    //         },
    //     ],
    // },

    // Psychiatric history ==================================================
    {
        key: "psychiatric",
        name: "Psychiatric history",
        type: "multi",
        shuffle: false,
        instructions: "Select every answer that applies, then continue.",
        format: {
            options: [
                { value: 1, text: "Addiction (e.g., alcohol, drugs, gambling)" },
                { value: 2, text: "Attention Deficit Hyperactivity Disorder (ADHD)" },
                { value: 3, text: "Autism" },
                { value: 4, text: "Bipolar Disorder" },
                { value: 5, text: "Borderline Personality Disorder (BPD)" },
                { value: 6, text: "Eating Disorder (e.g., anorexia, bulimia)" },
                { value: 7, text: "Generalized Anxiety Disorder (GAD)" },
                { value: 8, text: "Major Depressive Disorder (MDD)" },
                { value: 9, text: "Obsessive-Compulsive Disorder (OCD)" },
                { value: 10, text: "Panic Disorder" },
                { value: 11, text: "Post-Traumatic Stress Disorder (PTSD)" },
                { value: 12, text: "Schizophrenia" },
                { value: 13, text: "Social Anxiety Disorder (social phobia)" },
                { value: 14, text: "Specific Phobia" },
                { value: 99, text: "Something else", custom: true },
                { value: 0, text: "None of these", small: true, exclusive: true },
            ],
            columns: 2,
            color: "#3d7f96",
        },

        items: [
            {
                key: "Disorders_Psychiatric",
                text: "Are you currently living with any of the following, as diagnosed by a professional?",
            },
            {
                key: "Disorders_PsychiatricTreatment",
                text: "Are you currently receiving any of the following?",
                showIf: { key: "Disorders_Psychiatric", is: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 99] },
                format: {
                    options: [
                        { value: 1, text: "Antidepressant medication (e.g., PROZAC, ZOLOFT, EFFEXOR)" },
                        { value: 2, text: "Anxiolytic medication (e.g., XANAX, VALIUM)" },
                        { value: 3, text: "Mood stabilisers (e.g., LITHIUM, LAMICTAL)" },
                        { value: 4, text: "Antipsychotic medication (e.g., RISPERDAL, SEROQUEL)" },
                        { value: 5, text: "Psychotherapy or counselling (e.g., CBT, ACT)" },
                        { value: 6, text: "Mindfulness or stress management practice" },
                        { value: 7, text: "Lifestyle changes (e.g., diet, exercise)" },
                        { value: 8, text: "Alternative therapies (e.g., acupuncture, herbal remedies)" },
                        { value: 99, text: "Something else", custom: true },
                        { value: 0, text: "None of these", small: true, exclusive: true },
                    ],
                    columns: 2,
                    color: "#3d7f96",
                },
            },
        ],
    },

    // // Medical history ======================================================
    // {
    //     key: "somatic",
    //     name: "Medical history",
    //     type: "multi",
    //     shuffle: false,
    //     instructions:
    //         "Select every answer that applies, then continue. These are conditions a doctor has diagnosed, " +
    //         "rather than symptoms you have noticed in yourself.",
    //     format: {
    //         options: [{ value: 0, text: "None of these", small: true, exclusive: true }],
    //         columns: 1,
    //         color: "#2f8f8a",
    //     },

    //     items: [
    //         {
    //             key: "Disorders_Somatic_Musculoskeletal",
    //             text: "Are you currently living with a diagnosed condition related to your <em>muscles, joints and pain</em>",
    //             format: {
    //                 options: [
    //                     { value: 1, text: "Hypermobility Syndrome (e.g., Ehlers-Danlos Syndrome)" },
    //                     { value: 2, text: "Fibromyalgia" },
    //                     { value: 3, text: "Chronic Fatigue Syndrome (ME/CFS)" },
    //                     { value: 4, text: "Chronic Pain Syndrome" },
    //                     { value: 5, text: "Chronic back pain" },
    //                     { value: 6, text: "Arthritis" },
    //                     { value: 99, text: "Something else", custom: true },
    //                     { value: 0, text: "None of these", small: true, exclusive: true },
    //                 ],
    //                 columns: 2,
    //                 color: "#2f8f8a",
    //             },
    //         },
    //         {
    //             key: "Disorders_Somatic_Dermatological",
    //             text: "Are you currently living with a diagnosed condition related to your <em>skin</em>",
    //             format: {
    //                 options: [
    //                     { value: 1, text: "Eczema" },
    //                     { value: 2, text: "Psoriasis" },
    //                     { value: 3, text: "Chronic skin rashes" },
    //                     { value: 4, text: "Sjögren's Syndrome" },
    //                     { value: 99, text: "Something else", custom: true },
    //                     { value: 0, text: "None of these", small: true, exclusive: true },
    //                 ],
    //                 columns: 1,
    //                 color: "#2f8f8a",
    //             },
    //         },
    //         {
    //             key: "Disorders_Somatic_Cardiovascular",
    //             text: "Are you currently living with a diagnosed condition related to your <em>heart and circulation</em>",
    //             format: {
    //                 options: [
    //                     { value: 1, text: "Hypertension (high blood pressure)" },
    //                     { value: 2, text: "Hypotension (low blood pressure)" },
    //                     { value: 3, text: "Cardiac arrhythmia (palpitations)" },
    //                     { value: 4, text: "Angina or chronic chest pain" },
    //                     { value: 99, text: "Something else", custom: true },
    //                     { value: 0, text: "None of these", small: true, exclusive: true },
    //                 ],
    //                 columns: 1,
    //                 color: "#2f8f8a",
    //             },
    //         },
    //         {
    //             key: "Disorders_Somatic_Gastrointestinal",
    //             text: "Are you currently living with a diagnosed condition related to your <em>stomach and gut</em>",
    //             format: {
    //                 options: [
    //                     { value: 1, text: "Irritable Bowel Syndrome (IBS)" },
    //                     { value: 2, text: "Gastroesophageal Reflux Disease (GERD)" },
    //                     { value: 3, text: "Crohn's Disease" },
    //                     { value: 4, text: "Ulcerative Colitis" },
    //                     { value: 5, text: "Coeliac Disease" },
    //                     { value: 6, text: "Gluten intolerance" },
    //                     { value: 7, text: "Lactose intolerance" },
    //                     { value: 99, text: "Something else", custom: true },
    //                     { value: 0, text: "None of these", small: true, exclusive: true },
    //                 ],
    //                 columns: 2,
    //                 color: "#2f8f8a",
    //             },
    //         },
    //         {
    //             key: "Disorders_Somatic_Respiratory",
    //             text: "Are you currently living with a diagnosed condition related to your <em>lungs or breathing</em>",
    //             format: {
    //                 options: [
    //                     { value: 1, text: "Asthma" },
    //                     { value: 2, text: "Chronic Obstructive Pulmonary Disease (COPD)" },
    //                     { value: 3, text: "Sleep apnoea" },
    //                     { value: 4, text: "Chronic bronchitis" },
    //                     { value: 99, text: "Something else", custom: true },
    //                     { value: 0, text: "None of these", small: true, exclusive: true },
    //                 ],
    //                 columns: 1,
    //                 color: "#2f8f8a",
    //             },
    //         },
    //         {
    //             key: "Disorders_Somatic_Neurological",
    //             text: "Are you currently living with a diagnosed condition related to your <em>brain and nerves</em>",
    //             format: {
    //                 options: [
    //                     { value: 1, text: "Migraine" },
    //                     { value: 2, text: "Epilepsy" },
    //                     { value: 3, text: "Neuropathy" },
    //                     { value: 4, text: "Multiple Sclerosis (MS)" },
    //                     { value: 5, text: "Chronic dizziness or vertigo" },
    //                     { value: 99, text: "Something else", custom: true },
    //                     { value: 0, text: "None of these", small: true, exclusive: true },
    //                 ],
    //                 columns: 1,
    //                 color: "#2f8f8a",
    //             },
    //         },
    //         {
    //             key: "Disorders_Somatic_Genitourinary",
    //             text: "Are you currently living with a diagnosed condition related to your <em>bladder or reproductive organs</em>",
    //             format: {
    //                 options: [
    //                     { value: 1, text: "Endometriosis" },
    //                     { value: 2, text: "Polycystic Ovary Syndrome (PCOS)" },
    //                     { value: 3, text: "Interstitial cystitis" },
    //                     { value: 4, text: "Chronic pelvic pain syndrome" },
    //                     { value: 99, text: "Something else", custom: true },
    //                     { value: 0, text: "None of these", small: true, exclusive: true },
    //                 ],
    //                 columns: 1,
    //                 color: "#2f8f8a",
    //             },
    //         },
    //     ],
    // },
])
