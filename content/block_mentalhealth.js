defineBlock("mentalhealth", [
    {
        key: "Dissociation",
        name: "Strain",
        instructions: "",
        format: {
            options: [0, 1, 2, 3],
            anchors: ["Not at all", "Nearly every day"],
            color: "#5c6bc0",
            hovercolors: ["#22c55e", "#ef4444"],
        },

        norms: {
            Depersonalisation: {
                mean: 0.7,
                sd: 0.8,
                interpretations: {
                    low: "the world around you arrives solid and immediate, and you rarely feel set apart from it.",
                    mid: "the odd moment of feeling at one remove from things reaches you, as it does most people.",
                    high: "you feel cut off from your surroundings, or unreal, more often than most people do — a common enough experience under strain, and not a diagnosis of anything.",
                },
            },
            Trauma: {
                mean: 1.2,
                sd: 1.1,
                interpretations: {
                    low: "reminders of difficult times rarely intrude on your week.",
                    mid: "difficult memories surface from time to time, and settle again.",
                    high: "memories of stressful events return often and are hard to put down — which is worth taking seriously, though it is not a diagnosis of anything.",
                },
            },
        },

        items: [
            {
                key: "CSD2_Depersonalisation_1",
                dimension: "Depersonalisation",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>My surroundings feel detached or unreal, as if there was a veil between me and the outside world</em>",
            },
            {
                key: "CSD2_Depersonalisation_2",
                dimension: "Depersonalisation",
                text: "<small>Over the last 2 weeks, how often have you been bothered by this experience:</small><br /><em>Out of the blue, I feel strange, as if I were not real or as if I were cut off from the world</em>",
            },
            {
                key: "PCL2_Trauma_1",
                dimension: "Trauma",
                text: "<small>In the past month, how much were you bothered by:</small><br /><em>Repeated, disturbing memories</em>",
                format: {
                    options: [0, 1, 2, 3, 4],
                    anchors: ["Not at all", "Extremely"],
                    color: "#3949ab",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
            },
            {
                key: "PCL2_Trauma_2",
                dimension: "Trauma",
                text: "<small>In the past month, how much were you bothered by:</small><br /><em>Feeling upset when reminded of past stress</em>",
                format: {
                    options: [0, 1, 2, 3, 4],
                    anchors: ["Not at all", "Extremely"],
                    color: "#3949ab",
                    hovercolors: ["#22c55e", "#ef4444"],
                },
            },

            // Single-Item Sleep Quality Scale (SQS; Snyder et al., 2018)
            {
                key: "SQS_SleepQuality",
                instructions: "Please consider your sleep over the past 7 days.",
                format: {
                    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    anchors: ["Terrible", "Excellent"],
                    color: "#4338ca",
                    hovercolors: ["#ef4444", "#22c55e"],
                },
                text: "During the past 7 days, how would you rate your sleep quality overall?",
            },
        ],
    },
])

// // Psychiatric Disorders ================================================
// const questions_mentalhealth = {
//     type: jsPsychSurvey,
//     survey_json: {
//         title: "Mental health",
//         completeText: "Continue",
//         pageNextText: "Next",
//         pagePrevText: "Previous",
//         goNextPageAutomatic: true,
//         showQuestionNumbers: false,
//         // showProgressBar: "aboveHeader",
//         pages: [
//             {
//                 elements: [
//                     {
//                         title: "Are you currently living with one of the following medically diagnosed difficulty?",
//                         name: "Disorders_Psychiatric",
//                         type: "checkbox",
//                         choices: [
//                             "Addiction (e.g., Alcohol, Drugs, Gambling, ...)",
//                             "Attention Deficit Hyperactivity Disorder (ADHD)",
//                             "Autism",
//                             "Bipolar Disorder",
//                             "Borderline Personality Disorder (BPD)",
//                             "Generalized Anxiety Disorder (GAD)",
//                             "Major Depressive Disorder (MDD)",
//                             "Obsessive-Compulsive Disorder (OCD)",
//                             "Panic Disorder",
//                             "Post-Traumatic Stress Disorder (PTSD)",
//                             "Schizophrenia",
//                             "Social Anxiety Disorder (Social Phobia)",
//                             "Specific Phobias",
//                             "Eating Disorders (e.g., Anorexia, Bulimia, ...)",
//                             // "Dysthymia (Persistent Depressive Disorder)",
//                             // "Seasonal Affective Disorder (SAD)",
//                             // "Premenstrual Dysphoric Disorder (PMDD)",
//                             // "Substance/Medication-Induced Mood Disorder",
//                             // "Mood Disorder Due to a General Medical Condition",
//                             // "Disruptive Mood Dysregulation Disorder",
//                             // "Adjustment Disorder with Depressed Mood",
//                             // "Agoraphobia",
//                             // "Separation Anxiety Disorder",
//                             // "Selective Mutism",
//                             // "Acute Stress Disorder",
//                         ],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                     {
//                         visibleIf: "{Disorders_Psychiatric} notempty and {Disorders_Psychiatric} notcontains 'None'",
//                         title: "Are you currently undergoing any of the following treatments",
//                         name: "Disorders_PsychiatricTreatment",
//                         type: "checkbox",
//                         choices: [
//                             "Antidepressant Medication (e.g., PROZAC, ZOLOFT, EFFEXOR...)",
//                             "Anxiolytic Medication (e.g., XANAX, VALIUM, ...)",
//                             "Psychotherapy/Counselling (e.g., CBT, ACT, ...)",
//                             "Mood Stabilizers (e.g., LITHIUM, LAMICTAL, ...)",
//                             "Antipsychotic Medication (e.g., RISPERDAL, SEROQUEL, ...)",
//                             // "Electroconvulsive Therapy (ECT)",
//                             // "Transcranial Magnetic Stimulation (TMS)",
//                             "Lifestyle Changes (e.g., diet, exercise, ...)",
//                             "Mindfulness and Stress Management Techniques",
//                             "Alternative Therapies (e.g., acupuncture, herbal remedies, ...)",
//                         ],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                 ],
//             },
//         ],
//     },
//     data: {
//         screen: "questions_mentalhealth",
//     },
// }

// // Psychosomatic disorders ===================================================
// const questions_somatichealth = {
//     type: jsPsychSurvey,
//     survey_json: {
//         title: "Medical and somatic difficulties",
//         completeText: "Continue",
//         pageNextText: "Next",
//         pagePrevText: "Previous",
//         goNextPageAutomatic: true,
//         showQuestionNumbers: false,
//         // showProgressBar: "aboveHeader",
//         pages: [
//             {
//                 elements: [
//                     {
//                         name: "Disorders_Somatic_Instructions",
//                         html: "Are you currently living with one of the following medically diagnosed condition?",
//                         type: "html",
//                     },
//                     {
//                         title: "Musculoskeletal and pain",
//                         name: "Disorders_Somatic_Musculoskeletal",
//                         type: "checkbox",
//                         choices: [
//                             "Hypermobility Syndrome (e.g., Ehlers-Danlos Syndrome)",
//                             "Fibromyalgia",
//                             "Chronic Fatigue Syndrome",
//                             "Chronic Pain Syndrome",
//                             "Back Pain",
//                             "Muscle Tension",
//                         ],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                     {
//                         title: "Dermatological and skin",
//                         name: "Disorders_Somatic_Dermatological",
//                         type: "checkbox",
//                         choices: ["Skin Rashes", "Eczema", "Psoriasis", "Sjogren's Syndrome"],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                     {
//                         title: "Cardiovascular",
//                         name: "Disorders_Somatic_Cardiovascular",
//                         type: "checkbox",
//                         choices: [
//                             "Chest Pain",
//                             "Cardiac Arrhythmia (palpitations)",
//                             "Hypertension (High Blood Pressure)",
//                             "Hypotension (Low Blood Pressure)",
//                         ],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                     {
//                         title: "Gastrointestinal",
//                         name: "Disorders_Somatic_Gastrointestinal",
//                         type: "checkbox",
//                         choices: [
//                             "Irritable Bowel Syndrome (IBS)",
//                             "Gastroesophageal Reflux Disease (GERD)",
//                             "Crohn's Disease",
//                             "Ulcerative Colitis",
//                             "Celiac Disease",
//                             "Gluten Intolerance",
//                             "Lactose Intolerance",
//                         ],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                     {
//                         title: "Respiratory",
//                         name: "Disorders_Somatic_Respiratory",
//                         type: "checkbox",
//                         choices: [
//                             "Shortness of Breath",
//                             "Asthma",
//                             "Chronic Obstructive Pulmonary Disease (COPD)",
//                             "Sleep Apnea",
//                             "Chronic Bronchitis",
//                         ],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                     {
//                         title: "Neurological",
//                         name: "Disorders_Somatic_Neurological",
//                         type: "checkbox",
//                         choices: [
//                             "Nausea/Vomiting",
//                             "Dizziness/Lightheadedness",
//                             "Migraine",
//                             "Neuropathy",
//                             "Epilepsy",
//                             "Multiple Sclerosis (MS)",
//                         ],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                     {
//                         title: "Genitourinary",
//                         name: "Disorders_Somatic_Genitourinary",
//                         type: "checkbox",
//                         choices: ["Frequent Urination", "Endometriosis", "Interstitial Cystitis", "Chronic Pelvic Pain Syndrome"],
//                         showOtherItem: true,
//                         otherText: "Other",
//                         otherPlaceholder: "Please specify",
//                         showNoneItem: true,
//                         isRequired: true,
//                         colCount: 1,
//                     },
//                 ],
//             },
//         ],
//     },
//     data: {
//         screen: "questions_somatichealth",
//     },
// }

// // Somatic disorders - PHQ-15 ================================================
// const items_phq15 = {
//     PHQ15_1: "Stomach pain",
//     PHQ15_2: "Back pain",
//     PHQ15_3: "Pain in your arms, legs or joints (knees, hips, etc.)",
//     PHQ15_4: "Menstrual cramps or other problems with your periods (if applicable)",
//     PHQ15_5: "Headaches",
//     PHQ15_6: "Dizziness",
//     PHQ15_7: "Feeling your heart pound or race",
//     PHQ15_8: "Shortness of breath",
//     PHQ15_9: "Pain or problems during sexual intercourse",
//     PHQ15_10: "Constipation, loose bowels or diarrhea",
//     PHQ15_11: "Nausea, gas or indigestion",
//     PHQ15_12: "Feeling tired or having low energy",
//     PHQ15_13: "Trouble sleeping",
//     PHQ15_14: "Chest pain",
//     PHQ15_15: "Fainting spells",
// }

// const instructions_phq15 = {
//     type: "html",
//     name: "instructions_phq15",
//     html: "<p>Over the <b>last week</b>, how often have you been bothered by the following problems?</p>",
// }

// function make_phq15(items, required = true) {
//     items = shuffleObject(items)
//     questions = [instructions_phq15]

//     // Make questions
//     for (const key of Object.keys(items)) {
//         q = {
//             title: items[key],
//             name: key,
//             type: "rating",
//             isRequired: required,
//             rateValues: [
//                 {
//                     value: 0,
//                     text: "Not at all",
//                 },
//                 {
//                     value: 1,
//                     text: "Bothered a little",
//                 },
//                 {
//                     value: 2,
//                     text: "Bothered a lot",
//                 },
//             ],
//         }
//         questions.push(q)
//     }

//     return { elements: questions }
// }

// const questionnaire_phq15 = {
//     type: jsPsychSurvey,
//     survey_json: function () {
//         return {
//             title: "About your health",
//             showQuestionNumbers: false,
//             goNextPageAutomatic: true,
//             pages: make_phq15(items_phq15),
//         }
//     },
//     data: {
//         screen: "questionnaire_phq15",
//     },
// }
