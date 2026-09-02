/* =========================================================================
   Survey engine. Presents the items of each questionnaire from content/,
   one at a time, in random order, and drives the screens they are shown on.

   Everything that reads a score back — the charts, the results sections, the
   card — lives in results.js, which is handed the engine at the bottom of
   this file. What crosses that line is the `engine` object and nothing else.
   ========================================================================= */

;(function () {
    "use strict"

    const CHARTS = ["fipi", "hexaco18", "hitopbr"] // questionnaires that get a spider chart of their own
    const ADVANCE_DELAY = 330 // ms between answering and the next item
    const TURN = 180 // ms of that spent fading the answered item out

    // Saved into every response file, so a data export can always be matched
    // back to the code that produced it. Logged in CHANGELOG.md.
    const APP_VERSION = "0.0.1"

    const $ = (id) => document.getElementById(id)
    const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

    /* --------------------------- who is taking it ------------------------- */

    // What the link is allowed to say about this run: who is taking it, and
    // whether it is a real one at all. A shared card is read out of the URL by
    // results.js; nothing else here comes from it.
    const query = new URLSearchParams(location.search)
    const testMode = query.get("testMode") === "true"

    // Every run is filed under a code of its own, made here unless the link
    // brought one — a prewritten list, or a platform putting its own id on the
    // end of the link (`?sub=`).
    const CODE_LENGTH = 12
    const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789" // no I, L, O, 0 or 1: a code gets read off a screen and typed back

    function madeCode() {
        const drawn = crypto.getRandomValues(new Uint32Array(CODE_LENGTH))
        return Array.from(drawn, (n) => CODE_LETTERS[n % CODE_LETTERS.length]).join("")
    }

    // A code out of the URL is somebody else's text: only the characters a code
    // is made of survive it, and only so many of them. What is left of an empty
    // or impossible one is a code of our own.
    const participant = (query.get("sub") || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) || madeCode()

    // The page is put back to the top underneath something that is covering
    // it. Moving smoothly there would be seen sliding about under the fade,
    // so these jumps are always instant whatever the stylesheet asks for.
    function jump(top) {
        window.scrollTo({ top: top, behavior: "instant" })
    }

    function shuffle(array) {
        const a = array.slice()
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
        }
        return a
    }

    // A colour `proportion` of the way from one #rrggbb to another.
    function mix(from, to, proportion) {
        const channels = [1, 3, 5].map((at) => {
            const start = parseInt(from.substr(at, 2), 16)
            const end = parseInt(to.substr(at, 2), 16)
            return Math.round(start + (end - start) * proportion)
        })
        return "rgb(" + channels.join(", ") + ")"
    }

    /* ---------------------------- build the run -------------------------- */

    // An item's own entry wins over the questionnaire-wide default.
    function setting(item, questionnaire, entry) {
        return item[entry] !== undefined ? item[entry] : questionnaire[entry]
    }

    // What kind of question it is, and so how it is put on screen. Neither
    // choosing nor typing has to be written in the content: a question's type
    // follows from the format it is asked with, so writing it as well would
    // only be a second place for the two to disagree. A briefing is not a
    // question at all and belongs to its block, which is what the throw is
    // about — written among the items it introduces, it would render as a
    // scale with nothing on it.
    function typeOf(item, questionnaire) {
        const written = setting(item, questionnaire, "type")
        if (written === "briefing") {
            throw new Error("a briefing belongs to its block, not to a questionnaire's items: " + item.key)
        }
        if (written) return written
        return (setting(item, questionnaire, "format") || {}).input ? "input" : "choice"
    }

    // The questionnaires of the run, level by level and block by block, in the
    // order the timeline asks for them. This is also the order the results of a
    // level read in. A block the timeline does not name is never reached, which
    // is the whole of how one is kept out of the run.
    const RUN = []
    const levels = TIMELINE.map((entry, at) => at + 1)

    // Every item of every questionnaire, in the order written, each carrying
    // everything needed to show it — and the level and block it came from,
    // which are the timeline's answer rather than the content's.
    const authored = []

    TIMELINE.forEach((entry, at) => {
        const level = at + 1

        for (const name of entry.blocks) {
            const block = BLOCKS[name]
            if (!block) throw new Error("timeline.js asks for a block that is not defined: " + name)

            for (const entry of block) {
                // A briefing is a pause rather than a question: words, and a
                // way on. It belongs to the block rather than to any one
                // questionnaire in it, since it introduces the whole stretch
                // that follows — which may be several — and nothing that
                // shuffles items can reach it there. Its `options` are empty,
                // so everything that reads a scale off an item finds nothing.
                if (entry.type === "briefing") {
                    authored.push({
                        key: entry.key,
                        text: entry.text,
                        type: "briefing",
                        options: [],
                        shuffle: false,
                        block: name,
                        level: level,
                    })
                    continue
                }

                const questionnaire = entry
                RUN.push(questionnaire.key)

                for (const item of questionnaire.items) {
                    const type = typeOf(item, questionnaire)
                    const place = { questionnaire: questionnaire.key, block: name, level: level }
                    const format = setting(item, questionnaire, "format") || {}
                    // A scale may write its own numbers over the values behind
                    // them (`labels`), which is how the same points can be
                    // shown two ways.
                    const options = (format.options || []).map((one, position) =>
                        Object.assign(
                            { text: null, label: format.labels ? format.labels[position] : null },
                            typeof one === "object" ? one : { value: one },
                        ),
                    )

                    // An option marked `custom: true` — "Something else",
                    // "Other" — is an answer outside the scale: a category of
                    // its own, not a point on it. Its value is then only a
                    // label for `showIf` to match, so it takes no part in the
                    // scale's bounds, and `counted()` below never averages it
                    // into a dimension.
                    const scale = options.filter((one) => !one.custom)
                    const values = scale.map((o) => o.value)

                    authored.push(
                        Object.assign(
                            {
                                key: item.key,
                                text: item.text,
                                type: type,
                                dimension: item.dimension,
                                instructions: setting(item, questionnaire, "instructions"),
                                options: options,
                                input: format.input,
                                placeholder: format.placeholder,
                                // A typed answer has no options, so its bounds are the scale.
                                lowest: scale.length ? Math.min.apply(null, values) : format.min,
                                highest: scale.length ? Math.max.apply(null, values) : format.max,
                                custom: options.filter((one) => one.custom).map((one) => one.value),
                                anchors: format.anchors,
                                columns: format.columns,
                                vertical: format.vertical,
                                tooLow: format.tooLow,
                                tooHigh: format.tooHigh,
                                color: format.color,
                                hovercolors: format.hovercolors,
                                showIf: item.showIf,
                                check: item.check,
                                reverse: item.reverse,
                                shuffle: setting(item, questionnaire, "shuffle"),
                            },
                            place,
                        ),
                    )
                }
            }
        }
    })

    // A briefing has no scale to score, but it is still a recorded step through
    // the run, so it uses the same log and item record as every question.
    function isBriefing(question) {
        return question.type === "briefing"
    }

    // Levels are asked in order. Within one, the items of every block are
    // shuffled together, except those marked `shuffle: false`, which hold the
    // position the timeline's order gives them.
    //
    // **A questionnaire is the unit of shuffling, and the only one.** Its items
    // may come in any order but they come together, and everything around them
    // — the other questionnaires, the briefings, the blocks, the levels — holds
    // the order the timeline gives it. An item marked `shuffle: false` keeps
    // its own place while the rest move around it.
    //
    // Everything about the run's order follows from that one rule: two
    // instruments meant to be asked in among each other go in *one*
    // questionnaire, since that is what makes them one shuffled run; two meant
    // to stay apart go in two; and a briefing, being an entry of its own,
    // cannot be crossed by anything.
    const questions = []
    let group = []
    let holding = null

    // The run so far, in place. `authored` is built in order, so a questionnaire
    // is always a single stretch of it and a change of name is its end.
    function settle() {
        const moving = shuffle(group.filter((question) => question.shuffle !== false))
        let next = 0

        const settled = group.map((question) => (question.shuffle === false ? question : moving[next++]))
        for (const question of settled) questions.push(question)
        group = []
    }

    for (const question of authored) {
        if (question.questionnaire !== holding) {
            settle()
            holding = question.questionnaire
        }
        group.push(question)
    }
    settle()

    const responses = {} // key -> value, what the scoring reads
    const log = {} // key -> when it was shown, when it was answered, with what
    const feedback = {} // dimension -> "agree" | "disagree", from the results rows
    const levelTimes = {} // level -> when its last remaining item was answered
    const timeStart = new Date().toISOString()

    let index = 0
    let screen = "intro" // the screen underneath, which a panel never replaces
    let panel = null // the panel over it, if any
    let locked = false // ignore input while advancing

    /* ------------------------------ test mode ----------------------------- */

    // `?testMode=true` walks the run in miniature: one item of each questionnaire
    // is put on screen and the rest are answered for it at random, so that every
    // chart, level and reading can be reached quickly. What comes out of such a
    // run is not data, and the saved file says so at the top of itself.
    const TEST_KEPT = 1 // item each questionnaire still asks

    // An answer given by nobody: a point off the item's own scale, a number
    // inside the bounds of the field, or a word in place of the written one.
    // A custom option is passed over where a real one exists, so a thinned
    // scored item never holds its dimension shut with an answer off the scale.
    function anyAnswer(question) {
        if (question.input === "text") return "test"
        const pool = question.options.filter((one) => !one.custom)
        const options = pool.length ? pool : question.options
        // Several answers may be true at once, and one of them stands in for
        // the rest.
        if (question.type === "multi") return [options[Math.floor(Math.random() * options.length)].value]
        // Anything with a range and no options to pick from — a typed number,
        // a place on a curve — is answered somewhere inside that range.
        if (!options.length) {
            return question.lowest + Math.floor(Math.random() * (question.highest - question.lowest + 1))
        }
        return options[Math.floor(Math.random() * options.length)].value
    }

    // An item marked `auto` is answered here, once, and never shown: `shown()`
    // passes over it, so the run is walked, counted and finished as though it
    // were not in it, while the scoring behind the results has its answer. All
    // items of a questionnaire except the one kept for display are thinned —
    // except those waiting on another answer (`showIf`), which are left out of
    // it so a branch still opens on the answer that opens it, given by a
    // person or by the thinning alike. A briefing is never stood in for: it
    // belongs to the block rather than to any questionnaire and has no answer
    // to give.
    function thinRun() {
        for (const name of RUN) {
            const mine = questions.filter((question) => question.questionnaire === name && !question.showIf)
            for (const question of shuffle(mine).slice(TEST_KEPT)) {
                question.auto = true
                responses[question.key] = anyAnswer(question)
                // Nothing was put on screen, so there is no onset and no
                // reaction time to it — only the answer it stands in for.
                log[question.key] = { response: responses[question.key] }
            }
        }

        // The run may now open on an item that is being answered for us.
        index = nextShown(0)
    }

    if (testMode) thinRun()

    /* ------------------------------ branching ----------------------------- */

    // An item with `showIf` waits for the answer that opens it. Everything that
    // walks the run — advancing, going back, counting a level — goes past the
    // items that are not being asked.
    function shown(question) {
        if (question.auto) return false // a test run answered it; it is never put on screen
        if (!question.showIf) return true
        // An answer may be several things at once — a `multi` item hands back
        // a list — so both sides are read as lists and the branch opens on any
        // one of the wanted answers being among the ones given. A single
        // answer is a list of one, so nothing else changes shape.
        const given = responses[question.showIf.key]
        const chosen = Array.isArray(given) ? given : [given]
        const wanted = question.showIf.is
        return Array.isArray(wanted) ? wanted.some((one) => chosen.indexOf(one) !== -1) : chosen.indexOf(wanted) !== -1
    }

    function nextShown(from) {
        for (let at = from; at < questions.length; at++) if (shown(questions[at])) return at
        return -1
    }

    function previousShown(from) {
        for (let at = from; at >= 0; at--) if (shown(questions[at])) return at
        return -1
    }

    // The items of a level that are actually being asked, in order. A
    // briefing is not among them: it is a pause with nothing to
    // answer, so it is owed none and must never be what holds a level shut.
    function askedIn(level) {
        return questions.filter((question) => question.level === level && !isBriefing(question) && shown(question))
    }

    // An answer can close a branch that was open. What it held was given under
    // a premise that no longer holds, so it goes.
    function pruneBranches() {
        for (const question of questions) {
            // An item a test run answered is never shown, and its answer is not
            // a branch closing behind anybody.
            if (question.auto || shown(question) || responses[question.key] === undefined) continue
            delete responses[question.key]
            delete log[question.key]
        }
    }

    // An answer as it was read on screen: "Male", not 1, and "-3" where that is
    // what the circle had on it. A saved file should be legible without the
    // codebook beside it. An option with nothing written on it — a plain
    // numbered circle — and a typed answer are saved as what was given.
    function said(question, value) {
        if (value === undefined) return null
        // Several answers at once are read back one at a time, so the file
        // holds the words that were on screen rather than a list of codes.
        if (Array.isArray(value)) return value.map((one) => said(question, one))
        const option = question.options.find((one) => one.value === value)
        if (!option) return value
        return option.text !== null ? option.text : option.label || value
    }

    /* --------------------------- quality control -------------------------- */

    // How a level was answered rather than what it says: how long its items took,
    // and whether the ones that say what to answer got it. It is saved beside
    // the answers so that a run can be judged before anything is made of it. No
    // score, norm or interpretation goes near it, and none of it is shown.

    // How long an item took, in milliseconds. An item shown again after it was
    // answered — going back to it, or closing a panel that covered it — is
    // re-stamped and has no reaction time left in it, which is the null.
    function took(question) {
        const entry = log[question.key] || {}
        if (!entry.timeOnset || !entry.timeResponse) return null
        const spent = new Date(entry.timeResponse) - new Date(entry.timeOnset)
        return spent > 0 ? spent : null
    }

    function mean(values) {
        return values.reduce((sum, value) => sum + value, 0) / values.length
    }

    // Spread about that mean, over the sample rather than the population: these
    // are the items that happened to be asked, not every item there could be.
    // One item on its own has no spread, which is what the null is.
    function deviation(values) {
        if (values.length < 2) return null
        const middle = mean(values)
        const squares = values.map((value) => (value - middle) * (value - middle))
        return Math.sqrt(squares.reduce((sum, square) => sum + square, 0) / (values.length - 1))
    }

    // An attention check is an item that says what its own answer must be
    // (`check` in a content file). One that was never answered has not been failed —
    // it is unanswered.
    function failedCheck(question) {
        const given = responses[question.key]
        return given !== undefined && given !== question.check
    }

    // Both times are in milliseconds, over the items of the level that were both
    // shown and answered.
    function qualityControl(level) {
        const asked = askedIn(level)
        const times = asked.map(took).filter((spent) => spent !== null)
        const spread = deviation(times)

        return {
            responseTimeMean: times.length ? Math.round(mean(times)) : null,
            responseTimeSD: spread === null ? null : Math.round(spread),
            attentionChecksFailed: asked.filter((question) => question.check !== undefined).filter(failedCheck).length,
        }
    }

    // Everything recorded so far: who was taking it, when the run began, when
    // each level was left complete, how each was answered, and the items in the
    // order they are presented.
    function container() {
        // A test run answers most of itself, so the file says which it is
        // before it says anything else.
        const file = { version: APP_VERSION, participant: participant, testMode: testMode, timeStart: timeStart }

        for (const level of levels) file["timeLevel" + level] = levelTimes[level] || null

        // Which way the MINT's scale was drawn this time. The answers are
        // recorded as they were read, so the file has to say what was on the
        // circles they were read from.
        file.formatMint = formatMint

        // How each level was answered, beside when it was finished.
        file.qualityControl = {}
        for (const level of levels) file.qualityControl["level" + level] = qualityControl(level)

        file.items = questions.map((question, position) => {
            const entry = log[question.key] || {}
            return {
                key: question.key,
                order: position + 1,
                response: said(question, entry.response),
                timeOnset: entry.timeOnset || null,
                timeResponse: entry.timeResponse || null,
            }
        })
        file.feedback = feedback

        return file
    }

    /* ------------------------------- scoring ----------------------------- */

    // Which questions feed each dimension, and the order they are written in
    // (the run is shuffled, but results should read in the order authored).
    const dimensions = {}
    const dimensionOrder = []

    for (const question of authored) {
        if (!question.dimension) continue // attention checks and the like
        if (!dimensions[question.dimension]) {
            dimensions[question.dimension] = []
            dimensionOrder.push(question.dimension)
        }
        dimensions[question.dimension].push(question)
    }

    // What an answer is worth to the dimension it feeds. An item written the
    // wrong way round for it counts backwards: the top of its scale scores as
    // the bottom. What was answered is untouched — only the scoring turns over.
    function counted(question) {
        const answer = responses[question.key]
        if (answer === undefined) return undefined
        // An answer outside the scale has no worth on it: a custom option
        // holds the dimension unfinished rather than feeding its label — an
        // arbitrary number — into the average.
        if (question.custom.indexOf(answer) !== -1) return undefined
        return question.reverse ? question.lowest + question.highest - answer : answer
    }

    // The average of a dimension, once every one of its items is answered.
    function score(dimension) {
        const answers = dimensions[dimension].map(counted)
        if (answers.some((answer) => answer === undefined)) return undefined
        return answers.reduce((total, answer) => total + answer, 0) / answers.length
    }

    // The total of a dimension, once every one of its items is answered. The
    // PHQ-4 is read from sums rather than averages.
    function total(dimension) {
        const answers = dimensions[dimension].map(counted)
        if (answers.some((answer) => answer === undefined)) return undefined
        return answers.reduce((sum, answer) => sum + answer, 0)
    }

    // Share of the population below a score, from the dimension's norms.
    // Abramowitz & Stegun 26.2.17 for the normal distribution function.
    function percentile(value, norm) {
        const z = (value - norm.mean) / norm.sd
        const t = 1 / (1 + 0.2316419 * Math.abs(z))
        const density = 0.3989422804014327 * Math.exp((-z * z) / 2)
        const tail = density * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
        return z > 0 ? 1 - tail : tail
    }

    function tercile(proportion) {
        return proportion < 1 / 3 ? "low" : proportion < 2 / 3 ? "mid" : "high"
    }

    /* ------------------------------ rendering ---------------------------- */

    function showScreen(name) {
        screen = name
        // The landing screen is laid out differently from the rest — full width,
        // above the water, and with no bar beside it — so the body carries which
        // one is up.
        document.body.dataset.screen = name
        for (const s of document.querySelectorAll(".screen")) s.classList.remove("screen--active", "screen--arriving")
        $("screen-" + name).classList.add("screen--active")
    }

    function markSelection(value) {
        // A `multi` item is answered with several values at once, everything
        // else with one — read here as a list of one, so a single loop lights
        // both. A button with no value of its own (Continue) is in neither.
        const chosen = value === undefined ? [] : Array.isArray(value) ? value : [value]

        // Only the buttons that carry a value: Continue is an `.option` too,
        // but it is not an answer and takes no checked state.
        for (const button of document.querySelectorAll(".option[data-value]")) {
            const selected = chosen.indexOf(Number(button.dataset.value)) !== -1
            button.classList.toggle("option--selected", selected)
            button.setAttribute("aria-checked", selected ? "true" : "false")
        }

        // A typed answer is put back in the field it was typed into.
        const field = $("entry")
        if (field) {
            if (value !== undefined) field.value = value
            field.dispatchEvent(new Event("input"))
        }
    }

    // A question answered by typing rather than by choosing: the field, and the
    // button that takes what is in it. A number has to fall within the scale; an
    // answer put in the person's own words only has to have something in it.
    function renderEntry(question, wrap) {
        const written = question.input === "text"
        wrap.classList.add("options--entry")

        const field = document.createElement("input")
        field.type = written ? "text" : "number"
        field.id = "entry"
        field.className = "entry"
        field.placeholder = question.placeholder || ""
        field.setAttribute("aria-labelledby", "text")

        if (written) {
            field.maxLength = question.highest || 80
        } else {
            field.inputMode = "numeric"
            field.min = question.lowest
            field.max = question.highest
        }

        const go = document.createElement("button")
        go.type = "button"
        go.className = "option option--go"
        go.textContent = "Continue"

        // Says why a number is not being taken, rather than leaving Continue
        // greyed out with no explanation.
        const warning = document.createElement("p")
        warning.className = "warning"
        warning.setAttribute("role", "status")

        const given = () => {
            if (written) return field.value.trim() || null
            const value = Number(field.value)
            const within = value >= question.lowest && value <= question.highest
            return field.value !== "" && Number.isFinite(value) && within ? value : null
        }

        const check = () => {
            const value = Number(field.value)
            const typed = field.value !== "" && Number.isFinite(value)
            const refused =
                written || !typed ? null : value < question.lowest ? question.tooLow : value > question.highest ? question.tooHigh : null

            go.disabled = given() === null
            warning.textContent = refused || ""
            warning.classList.toggle("warning--shown", Boolean(refused))
        }

        const take = () => {
            const value = given()
            if (value === null) return check()
            answer(value)
        }

        field.addEventListener("input", check)
        field.addEventListener("keydown", (e) => {
            if (e.key === "Enter") take()
        })
        go.addEventListener("click", take)

        wrap.appendChild(field)
        wrap.appendChild(go)
        wrap.appendChild(warning)
        go.disabled = true
        field.focus()
    }

    // One option as a button, the same whether it will be picked once or
    // ticked among several: what differs between a choice and a multi is the
    // part the button plays and what a press of it does, which is all the two
    // renderers keep to themselves.
    function optionButton(option, role, press) {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "option" + (option.small ? " option--small" : "")
        button.dataset.value = String(option.value)
        button.textContent = option.text === null ? option.label || String(option.value) : option.text
        button.setAttribute("role", role)
        button.setAttribute("aria-checked", "false")
        button.addEventListener("click", press)
        return button
    }

    // A question answered by choosing: one button per option, on the scale the
    // format gives them. A Likert scale and a list of countries come through
    // here alike — what differs is the writing on the buttons.
    function renderChoice(question, wrap) {
        const labelled = question.options.some((o) => o.text !== null)

        // A row of circles is only as wide as its circles, so the scale draws
        // its anchors in against them rather than against its own edges — five
        // points and eleven then read the same. Labelled options take the
        // width they are given, which is the whole of it.
        $("scale").classList.toggle("scale--circles", !labelled)
        // Stacked into a ladder rather than set in a row: a numbered scale
        // asking where somebody stands, or a labelled scale stacked strongest
        // on top instead of first-written on top, read bottom to top rather
        // than top to bottom. Written on the format rather than a type of its
        // own — it is still an ordinary choice, only the room it stands in
        // differs.
        $("scale").classList.toggle("scale--vertical", !!question.vertical)

        wrap.classList.toggle("options--labelled", labelled)
        wrap.classList.toggle("options--wide", !labelled && question.options.length > 7)
        // Labelled options stack unless the item asks for columns; circles
        // always get one column each.
        wrap.style.setProperty("--columns", labelled ? question.columns || 1 : question.options.length)

        question.options.forEach((option, position) => {
            const button = optionButton(option, "radio", () => answer(option.value))

            // Each option lights up at its own point along the gradient.
            if (question.hovercolors) {
                const spread = question.options.length - 1
                const shade = mix(question.hovercolors[0], question.hovercolors[1], position / spread)
                button.style.setProperty("--hover", shade)
            }

            wrap.appendChild(button)
        })
    }

    // A question several answers may be true of at once: the same labelled
    // buttons a choice is answered on, but latched rather than taken on the
    // first press, with a Continue underneath saying the list is finished.
    // What is recorded is a list in the order the options are *written*, not
    // the order they were pressed, so two people who picked the same things
    // save the same answer.
    function renderMulti(question, wrap) {
        wrap.classList.add("options--labelled", "options--multi")
        wrap.style.setProperty("--columns", question.columns || 1)

        // Held here rather than read back off the buttons: the answer is a set,
        // and going back to an item already answered puts its set back.
        const given = responses[question.key]
        const picked = new Set(Array.isArray(given) ? given : [])

        const go = document.createElement("button")
        go.type = "button"
        go.className = "option option--go"
        go.textContent = "Continue"

        const listed = () => question.options.map((one) => one.value).filter((value) => picked.has(value))

        // The lighting itself is `markSelection`, the same path a revisited
        // answer takes; all that is latched here is the Continue button.
        const refresh = () => {
            markSelection(listed())
            // Nothing chosen is not an answer: "none of these" is one of the
            // things that can be chosen, and saying so is a different act from
            // saying nothing.
            go.disabled = picked.size === 0
        }

        // "None of these" is not one more thing that can be true of somebody:
        // taking it puts down everything else, and anything else puts it down.
        const toggle = (option) => {
            if (picked.has(option.value)) {
                picked.delete(option.value)
            } else {
                if (option.exclusive) picked.clear()
                else for (const other of question.options) if (other.exclusive) picked.delete(other.value)
                picked.add(option.value)
            }
            refresh()
        }

        question.options.forEach((option) => {
            wrap.appendChild(optionButton(option, "checkbox", () => toggle(option)))
        })

        go.addEventListener("click", () => answer(listed()))
        wrap.appendChild(go)

        refresh()
    }

    /* ------------------------------- the curve ---------------------------- */

    // A place in a room of a hundred people rather than a point on a scale.
    // The curve is drawn once and filled from the left as far as the pointer:
    // the area under a normal curve up to a point *is* the share of people
    // below it, so what is filled and the number written over it are the same
    // fact said twice, and neither can drift from the other.
    const CURVE = { width: 640, height: 200, floor: 156, peak: 34, reach: 3, samples: 160 }
    const SVG = "http://www.w3.org/2000/svg"

    function draw(shape, attributes) {
        const element = document.createElementNS(SVG, shape)
        for (const name of Object.keys(attributes)) element.setAttribute(name, attributes[name])
        return element
    }

    function renderCurve(question, wrap) {
        wrap.classList.add("options--curve")

        // Across the figure is three standard deviations either side of the
        // middle, which is as far out as a room of a hundred reaches.
        const zAt = (x) => (x / CURVE.width) * 2 * CURVE.reach - CURVE.reach

        const yAt = (x) => {
            const z = zAt(x)
            return CURVE.floor - (CURVE.floor - CURVE.peak) * Math.exp((-z * z) / 2)
        }

        // How much of the room is below a point: the area under the curve up to
        // it, which is what `percentile` works out — here against the same
        // standard normal the curve itself is drawn from.
        const shareAt = (x) => Math.round(percentile(zAt(x), { mean: 0, sd: 1 }) * 100)

        // The curve as a run of points; the same run closed down to the floor
        // is the area that fills.
        const points = []
        for (let at = 0; at <= CURVE.samples; at++) {
            const x = (at / CURVE.samples) * CURVE.width
            points.push(x.toFixed(1) + "," + yAt(x).toFixed(1))
        }
        const run = points.join(" ")

        const holder = document.createElement("div")
        holder.className = "curve"

        // The figure says nothing to a screen reader: the range below carries
        // the question, the value and the way to move it.
        const figure = draw("svg", {
            class: "curve__figure",
            viewBox: "0 0 " + CURVE.width + " " + CURVE.height,
            "aria-hidden": "true",
        })

        // What is filled is a window onto the whole area, widened to the mark
        // rather than an area redrawn on every move.
        const clip = draw("rect", { x: 0, y: 0, width: 0, height: CURVE.height })
        const window_ = draw("clipPath", { id: "curve-fill" })
        const defs = draw("defs", {})
        window_.appendChild(clip)
        defs.appendChild(window_)
        figure.appendChild(defs)

        const filled = draw("g", { "clip-path": "url(#curve-fill)" })
        filled.appendChild(
            draw("polygon", {
                class: "curve__area",
                points: "0," + CURVE.floor + " " + run + " " + CURVE.width + "," + CURVE.floor,
            }),
        )
        figure.appendChild(filled)
        figure.appendChild(draw("polyline", { class: "curve__line", points: run }))
        figure.appendChild(draw("line", { class: "curve__floor", x1: 0, y1: CURVE.floor, x2: CURVE.width, y2: CURVE.floor }))

        const stem = draw("line", { class: "curve__stem", x1: 0, y1: 0, x2: 0, y2: CURVE.floor })
        const mark = draw("circle", { class: "curve__mark", cx: 0, cy: 0, r: 6 })
        const reading = draw("text", { class: "curve__reading", x: 0, y: 0, "text-anchor": "middle" })
        const hint = draw("text", {
            class: "curve__hint",
            x: CURVE.width / 2,
            y: CURVE.floor + 32,
            "text-anchor": "middle",
        })
        hint.textContent = "Click where you sit"

        figure.appendChild(stem)
        figure.appendChild(mark)
        figure.appendChild(reading)
        figure.appendChild(hint)

        // The answer itself, and the only way into it that is not a pointer.
        // It takes no pointer events of its own — the figure above handles
        // those — so the two can never disagree about where the mark is. The
        // global key handler ignores an INPUT, so the arrows move this rather
        // than sending the run backwards.
        const field = document.createElement("input")
        field.type = "range"
        field.className = "curve__slide"
        field.min = String(question.lowest)
        field.max = String(question.highest)
        field.step = "1"
        field.value = String(Math.round((question.lowest + question.highest) / 2))
        field.setAttribute("aria-labelledby", "text")

        let held = false

        const show = (x) => {
            const place = Math.max(0, Math.min(CURVE.width, x))
            const y = yAt(place)
            const share = shareAt(place)

            clip.setAttribute("width", place)
            stem.setAttribute("x1", place)
            stem.setAttribute("x2", place)
            stem.setAttribute("y1", y)
            mark.setAttribute("cx", place)
            mark.setAttribute("cy", y)

            // The reading rides the curve, and is kept off the ends of the
            // figure so that it is never half outside it.
            reading.setAttribute("x", Math.max(62, Math.min(CURVE.width - 62, place)))
            reading.setAttribute("y", y - 18)
            reading.textContent = share + "% of people"

            field.value = String(share)
            field.setAttribute("aria-valuetext", share + "% of people")

            held = true
            holder.classList.add("curve--held")
            return share
        }

        // Back to an item already answered, or moved by the keyboard: what is
        // kept is the share, so the place has to be found back from it. The
        // curve only ever rises, so halving the interval gets there.
        const placeOf = (share) => {
            let low = 0
            let high = CURVE.width

            for (let step = 0; step < 40; step++) {
                const middle = (low + high) / 2
                if (shareAt(middle) < share) low = middle
                else high = middle
            }
            return high
        }

        const at = (event) => {
            const box = figure.getBoundingClientRect()
            return ((event.clientX - box.left) / box.width) * CURVE.width
        }

        const follow = (event) => {
            if (locked) return
            show(at(event))
        }

        holder.addEventListener("pointermove", follow)
        holder.addEventListener("pointerdown", follow)

        // Where the click lands is the answer. There is nothing to confirm: the
        // number standing over the mark when it is pressed is what is recorded.
        holder.addEventListener("click", (event) => {
            if (locked) return
            answer(show(at(event)))
        })

        // The keyboard's way through, for want of a button to press: the arrows
        // move the mark, and Enter takes where it has been moved to.
        field.addEventListener("input", () => show(placeOf(Number(field.value))))
        field.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && held) answer(Number(field.value))
        })

        holder.appendChild(figure)
        holder.appendChild(field)
        wrap.appendChild(holder)

        // An answer already given is put back where it was left.
        const given = responses[question.key]
        if (given !== undefined) show(placeOf(given))
    }

    // A renderer per type of question, and beside it the thing each type is
    // answered by — which is where the spray comes out of. Only a choice
    // carries its value in a selector: a written answer is somebody's own
    // words, a place on a curve is a place rather than a button, and a list of
    // several answers is finished by pressing Continue rather than by any one
    // of them. A new way of answering is a `type` written in content/ and a
    // line in each of these, and nothing else moves.
    const SCALES = { choice: renderChoice, input: renderEntry, multi: renderMulti, curve: renderCurve }

    const SPRAYS = {
        choice: (value) => document.querySelector('.option[data-value="' + value + '"]'),
        input: () => $("options").querySelector(".option--go"),
        multi: () => $("options").querySelector(".option--go"),
        curve: () => $("options").querySelector(".curve__mark"),
    }

    function renderScale(question) {
        const wrap = $("options")

        wrap.innerHTML = ""
        wrap.className = "options"
        // Whatever the last item was answered on, this one is not shown on it:
        // each renderer puts back only the classes it needs.
        $("scale").className = "scale"

        // What the group is to a screen reader follows the kind of answer:
        // radios pick one, checkboxes tick several, and a typed field or a
        // curve is no group at all — its own control carries the item.
        if (question.type === "choice") wrap.setAttribute("role", "radiogroup")
        else if (question.type === "multi") wrap.setAttribute("role", "group")
        else wrap.removeAttribute("role")

        SCALES[question.type](question, wrap)

        // Only a scale has sides to name; a field typed into has none.
        const anchored = question.anchors && question.type === "choice"
        $("anchor-left").textContent = anchored ? question.anchors[0] : ""
        $("anchor-right").textContent = anchored ? question.anchors[1] : ""
        $("anchor-left").hidden = !anchored
        $("anchor-right").hidden = !anchored
    }

    // A briefing: a pause in the middle of a level, saying what the
    // next stretch of it is about, with nothing to answer. It takes the survey
    // screen over rather than being a screen of its own, so that everything
    // guarding on `screen === "survey"` — the keyboard, the back button, the
    // timing — goes on holding while it is up.
    function renderBriefing(question) {
        // The options of the item before it would otherwise still be sitting in
        // the screen behind it, answerable by anything that finds them.
        $("options").innerHTML = ""
        $("briefing-body").innerHTML = question.text
    }

    function renderQuestion() {
        const question = questions[index]
        const survey = $("screen-survey")
        const pausing = isBriefing(question)

        // Drives the item's background, its selected response and the progress bar.
        document.documentElement.style.setProperty("--selected", question.color || "var(--accent)")

        $("text").hidden = pausing
        $("scale").hidden = pausing
        $("briefing").hidden = !pausing
        $("instructions").hidden = pausing || !question.instructions

        if (pausing) {
            renderBriefing(question)
        } else {
            // The item is HTML: a question may carry its own stem, with the thing
            // actually being asked set apart inside it. It comes from content/.
            $("text").innerHTML = question.text
            $("instructions").innerHTML = question.instructions || ""

            renderScale(question)
            markSelection(responses[question.key])
        }

        $("back").disabled = previousShown(index - 1) === -1

        // The new item is put in place while the old one is still faded out,
        // then let back in: the run reads as one moving thing rather than a
        // series of pages. Reading the width in between settles the faded state
        // as the one the fade starts from — waiting for a frame instead would
        // leave the item invisible in a tab nobody is looking at.
        survey.classList.add("turning")
        void survey.offsetWidth
        survey.classList.remove("turning")

        // Presented now — an item shown again records the later time, so that
        // the gap to the response it produced stays meaningful.
        if (!log[question.key]) log[question.key] = {}
        log[question.key].timeOnset = new Date().toISOString()
    }

    /* ---------------------------- the sidebar ----------------------------- */

    // The levels that hold a dimension, and so have results to open. A level
    // with nothing scored in it is not one of them: the closing item is a level
    // of its own so that it comes after the last of these has been opened.
    const scoredLevels = levels.filter((level) => questions.some((one) => one.level === level && one.dimension))

    // How far through a level, and whether it has been finished. Only the items
    // being asked count: a branch nobody went down is not owed an answer.
    function levelProgress(level) {
        const asked = askedIn(level)
        const answered = asked.filter((question) => responses[question.key] !== undefined).length
        return {
            answered: answered,
            size: asked.length,
            // A level can be asked nothing — every kept item behind a closed
            // branch, in a thinned test run — and owing no answers is complete,
            // not a division by zero.
            share: asked.length ? Math.round((answered / asked.length) * 100) : 100,
            unlocked: answered === asked.length,
        }
    }

    // The whole run read as a descent: answering everything reaches the bottom
    // of the deepest water there is. It is a way of saying "how far through you
    // are" that is worth watching go up.
    const DEEPEST = 11034 // metres, the Challenger Deep

    // The line is divided equally between the levels, so a level sits at the
    // same point on it however many items it holds: what a long level buys is a
    // slower stretch of water rather than a longer piece of line. A level with
    // nothing scored in it takes no share of the descent — the closing item is
    // asked at the bottom, not below it.
    function descentShare() {
        if (!scoredLevels.length) return 0

        let reached = 0
        for (const level of scoredLevels) {
            const progress = levelProgress(level)
            reached += progress.size ? progress.answered / progress.size : 1
        }
        return reached / scoredLevels.length
    }

    function depth() {
        const asked = questions.filter((question) => !isBriefing(question) && shown(question))
        const answered = asked.filter((question) => responses[question.key] !== undefined).length
        const share = descentShare()
        return { answered: answered, size: asked.length, share: share, metres: Math.round(share * DEEPEST) }
    }

    function metres() {
        return depth().metres.toLocaleString("en-GB") + " m"
    }

    // The water darkens as the descent goes on: `--descent` is 0 at the surface
    // and 1 at the bottom, and the backdrop is read off it. Only the run moves
    // it — the landing screen is above the water altogether, and what opens
    // under the quote on the way in is the surface.
    function setDescent(share) {
        document.documentElement.style.setProperty("--descent", share.toFixed(4))
    }

    // Handed the walk `renderSidebar` has already made rather than making its
    // own: `depth()` walks every question, and once an answer is enough.
    function renderDepth(soFar) {
        $("depth").textContent = soFar.metres.toLocaleString("en-GB") + " m"
        $("depth").title = soFar.answered + " of " + soFar.size + " questions answered"
        setDescent(soFar.share)
    }

    // Built once: the buttons *are* the levels, which never change. Everything
    // that moves — each level's share, whether it is open, the fill they sit
    // on — is written onto them by renderSidebar, so re-rendering never throws
    // away the button somebody's keyboard focus is on.
    function buildSidebar() {
        const wrap = $("levels")

        scoredLevels.forEach((level, at) => {
            const button = document.createElement("button")

            button.type = "button"
            // The panel opens out of this button, so it has to be findable
            // again by the level it holds.
            button.dataset.level = level
            button.className = "sidebar__level"
            button.style.top = ((at + 1) / scoredLevels.length) * 100 + "%"
            button.innerHTML =
                '<span class="sidebar__level-word">Level</span><span class="sidebar__level-number">' +
                level +
                '</span><span class="sidebar__level-label"></span>'

            // The button that opened it closes it again: a level is a thing on
            // the line that is either open or shut, not a link that only leads
            // one way.
            button.addEventListener("click", () => (panel === "results" && openLevel === level ? closePanel() : openResults(level)))
            wrap.appendChild(button)
        })
    }

    // The whole run on one line down the edge of the bar, filling as it is
    // answered and never going back. The depth rides the end of the fill, and
    // the levels are spaced evenly down it, each at the point it is finished —
    // every one of them opens, one still locked showing a blurred taste of what
    // finishing gives.
    function renderSidebar() {
        const soFar = depth()
        renderDepth(soFar)

        const share = soFar.share * 100
        $("descent-fill").style.height = share + "%"
        $("depth").style.top = share + "%"

        for (const button of $("levels").children) {
            const level = Number(button.dataset.level)
            const progress = levelProgress(level)
            const showing = panel === "results" && openLevel === level

            button.classList.toggle("sidebar__level--unlocked", progress.unlocked)
            button.classList.toggle("sidebar__level--open", showing)
            button.title = progress.unlocked ? "See the results of level " + level : "See a taste of level " + level + ", still locked"
            button.querySelector(".sidebar__level-label").textContent = "Level " + level + " · " + progress.share + "%"
            button.setAttribute("aria-expanded", showing ? "true" : "false")
        }
    }

    // A level's results belong to the button that opens them: they grow out of
    // that point on the line and are drawn back into it on the way out, so the
    // button reads as where the level is kept. The point is written on as the
    // origin the scaling turns about, in the coordinates of the box `on` is
    // laid out in — the panel's own box is scaled down to nothing while it is
    // shut, and is no use for the sum.
    function markOrigin(on, within, level) {
        const button = document.querySelector('.sidebar__level[data-level="' + level + '"]')
        if (!button) return false

        const spot = button.getBoundingClientRect()
        const box = within.getBoundingClientRect()

        on.style.setProperty("--from-x", spot.left + spot.width / 2 - box.left + "px")
        on.style.setProperty("--from-y", spot.top + spot.height / 2 - box.top + "px")
        return true
    }

    function fromLevel(level) {
        markOrigin($("panel-results"), $("overlay"), level)
    }

    // The level screen leaves the same way the panel does: what was just read
    // is drawn into the button it can be read again from, and the survey is put
    // up once it has gone.
    const SUCK = 460 // ms the level takes to be drawn in

    function suckLevel(level, then) {
        const screen = $("screen-level")
        if (still() || !markOrigin(screen, screen, level)) return then()

        screen.classList.add("screen--sucked")

        setTimeout(() => {
            screen.classList.remove("screen--sucked")
            then()
        }, SUCK)
    }

    // `sealed`, not `locked`: that name already means "ignore input while
    // advancing" everywhere else in this file, and this is a different lock.
    function openResults(level) {
        const sealed = !levelProgress(level).unlocked
        openLevel = level
        fromLevel(level)
        $("results-title").textContent = "Level " + level + (sealed ? " — locked" : "")
        results.renderResults($("results-body"), level, sealed)
        openPanel("results")
    }

    function openProfile() {
        results.renderProfile($("profile-panel"))
        openPanel("profile")
    }

    /* ------------------------------- panels ------------------------------- */

    // A panel slides over the screen underneath, which stays where it was: the
    // page is never left, only covered. Every panel comes out from under the bar
    // the button that opened it sits on, and stops short of it.
    let openLevel = null // which level the results panel is showing

    // Panels opened by a bar link of the same id, lit while theirs is up. The
    // level buttons open the results panel, and are lit by renderSidebar instead.
    const LINKED = ["profile", "raw"]

    function openPanel(name) {
        results.hideTip()
        panel = name

        for (const sheet of document.querySelectorAll(".panel")) {
            sheet.classList.toggle("panel--open", sheet.id === "panel-" + name)
        }
        $("overlay").classList.add("overlay--open")

        markSidebar()
        $("panel-" + name)
            .querySelector(".panel__close")
            .focus()
    }

    function closePanel() {
        if (!panel) return
        results.hideTip()

        // Taken again on the way out: the window may have been resized while
        // the level was open, and it should go back into where its button is
        // now rather than where it was.
        if (panel === "results" && openLevel !== null) fromLevel(openLevel)

        panel = null
        openLevel = null

        for (const sheet of document.querySelectorAll(".panel")) sheet.classList.remove("panel--open")
        $("overlay").classList.remove("overlay--open")
        markSidebar()

        // The item was covered while the panel was up. Timing it from now keeps
        // the gap to the response it produces meaningful.
        if (screen === "survey") log[questions[index].key].timeOnset = new Date().toISOString()
    }

    // Which bar button, if any, is currently holding a panel open.
    function markSidebar() {
        for (const name of LINKED) {
            $(name).classList.toggle("sidebar__link--open", panel === name)
            $(name).setAttribute("aria-expanded", panel === name ? "true" : "false")
        }
        renderSidebar()
    }

    function openRaw() {
        $("raw-json").textContent = JSON.stringify(container(), null, 2)
        openPanel("raw")
    }

    const PARTICLES = 14

    // A short spray of dots out of an element — the chosen response, the
    // headline of a level that has just opened, a results section coming out of its
    // seal. `how` makes it bigger than the one an answer gets.
    function burst(from, given, how) {
        if (!from || still()) return

        const many = (how && how.count) || PARTICLES
        const reach = (how && how.reach) || 40
        const style = getComputedStyle(from)
        const colour = given || style.getPropertyValue("--hover").trim() || style.backgroundColor
        const spot = from.getBoundingClientRect()
        const layer = document.createElement("div")
        layer.className = "burst"
        layer.style.left = spot.left + spot.width / 2 + "px"
        layer.style.top = spot.top + spot.height / 2 + "px"

        for (let i = 0; i < many; i++) {
            const angle = (Math.PI * 2 * i) / many + Math.random() * 0.5
            const distance = 30 + Math.random() * reach
            const particle = document.createElement("i")
            particle.style.setProperty("--x", Math.cos(angle) * distance + "px")
            particle.style.setProperty("--y", Math.sin(angle) * distance + "px")
            particle.style.background = colour
            particle.style.animationDelay = Math.random() * 70 + "ms"
            layer.appendChild(particle)
        }

        document.body.appendChild(layer)
        setTimeout(() => layer.remove(), 1000)
    }

    /* -------------------------- finishing a level ------------------------- */

    // Water breaks across the middle of the window when a level is finished. It
    // covers only a band of the screen, so the level is put up behind it as the
    // water crosses and rises in as it runs off.
    const CURTAIN_COVER = 560 // ms before the screen behind is changed, under the water
    const CURTAIN_HOLD = 1900 // ms the words stay up
    const CURTAIN_LIFT = 900 // ms the water takes to run off the screen

    function curtain(level, place, open) {
        const layer = $("curtain")
        let placed = false
        let lifted = false

        $("curtain-title").textContent = "Level " + level + " complete"
        $("curtain-depth").textContent = metres() + " down"

        layer.classList.remove("curtain--out")
        layer.hidden = false
        layer.classList.add("curtain--in")

        const cover = () => {
            if (placed) return
            placed = true
            place()
        }

        const lift = () => {
            if (lifted) return
            lifted = true
            cover() // impatience should not skip putting the screen up
            layer.classList.add("curtain--out")
            open()

            setTimeout(() => {
                layer.hidden = true
                layer.classList.remove("curtain--in", "curtain--out")
                layer.removeEventListener("click", lift) // it lifted on its own; the next level brings its own
            }, CURTAIN_LIFT)
        }

        // Anyone who has seen it once can wave it past.
        layer.addEventListener("click", lift, { once: true })
        setTimeout(cover, CURTAIN_COVER)
        setTimeout(lift, CURTAIN_HOLD)
    }

    let levelShowing = null // the level the level screen is holding, if any

    function completeLevel(level) {
        levelShowing = level
        $("level-title").textContent = "Level " + level + " unlocked"

        results.renderResults($("level-results"), level, false)
        results.sealSections($("level-results"), $("level-foot"))
        renderSidebar()

        curtain(
            level,
            () => {
                showScreen("level")
                jump(0)
            },
            () => {
                burst($("level-title"), "#d9a441", { count: 24, reach: 90 })
                results.openSections($("level-results"), $("level-foot"))
            },
        )
    }

    /* -------------------------------- flow ------------------------------- */

    // The last answer of the run is worth more than an option's worth of
    // particles: three sprays out of the item that ended it, one after another,
    // and only then the profile.
    const FINALE_STEP = 280 // ms between them
    const FINALE_COLOURS = ["#d9a441", "#22d3ee", "#7c5cff"]

    function finale(then) {
        if (still()) return then()

        FINALE_COLOURS.forEach((colour, at) =>
            setTimeout(() => burst($("text"), colour, { count: 30, reach: 190 + at * 70 }), at * FINALE_STEP),
        )

        setTimeout(then, FINALE_COLOURS.length * FINALE_STEP + 280)
    }

    // Only the item being shown can be answered. The option buttons of the one
    // before it are still in the survey screen while a level screen is up over
    // it, and they still call this.
    function answer(value) {
        if (locked || screen !== "survey") return

        const question = questions[index]
        responses[question.key] = value

        if (!log[question.key]) log[question.key] = {}
        log[question.key].response = value
        log[question.key].timeResponse = new Date().toISOString()

        pruneBranches() // this answer may have opened or closed one
        markSelection(value)
        renderSidebar() // every answer moves the descent on, including the last one

        // When a level was left with nothing outstanding. Stamped here rather
        // than on the level screen, which the last level of the run never shows,
        // and taken again if a branch reopens the level and it is finished twice.
        if (levelProgress(question.level).unlocked) levelTimes[question.level] = new Date().toISOString()

        // The spray comes out of whatever this kind of item is answered by.
        const chosen = SPRAYS[question.type](value)
        if (chosen) burst(chosen)

        // The answer stays lit and the burst clears before the item goes; what
        // is left of the delay is the fade out of it.
        locked = true
        setTimeout(() => $("screen-survey").classList.add("turning"), ADVANCE_DELAY - TURN)

        setTimeout(() => {
            locked = false
            advance()
        }, ADVANCE_DELAY)
    }

    // On from whatever is showing: the next item, the level screen if that was
    // the end of a level, or the profile if it was the end of the run. Both
    // ways forward — answering an item, and reading a briefing and
    // leaving it — come through here, so a level ends the same way whichever
    // ended it.
    function advance() {
        const finished = questions[index].level
        const next = nextShown(index + 1)

        // Nothing left to answer: the run breaks up over the last item, and
        // then the whole web is the last screen — rather than an announcement
        // with the way to it. The answers leave for the repository at the
        // same moment, and the last screen says whether they got there.
        if (next === -1) {
            locked = true // there is nothing after this, and nothing to answer
            saved("sending")
            save().then(
                () => saved("done"),
                () => saved("failed"),
            )
            finale(() => {
                results.renderProfile($("profile-done"))
                showScreen("done")
                jump(0)
                setTimeout(() => burst($("profile-done").querySelector(".chart"), "#d9a441", { count: 26, reach: 130 }), 240)
            })
            return
        }

        index = next

        // A level ends: show what it unlocked before carrying on. The lock
        // stays on until the way out of the level screen is pressed — the water
        // takes a moment to cover the survey, and the item waiting behind it
        // has not been read yet.
        if (questions[index].level !== finished) {
            locked = true
            completeLevel(finished)
        } else renderQuestion()
    }

    // A briefing has one possible response: leaving it by pressing its continue
    // button. Store that response and its completion time like any other item.
    function passBriefing() {
        if (locked || screen !== "survey" || !isBriefing(questions[index])) return
        const question = questions[index]
        const entry = log[question.key] || {}
        entry.response = $("briefing-go").textContent.trim()
        entry.timeResponse = new Date().toISOString()
        log[question.key] = entry
        advance()
    }

    function goBack() {
        const previous = locked ? -1 : previousShown(index - 1)
        if (previous === -1) return
        index = previous
        renderQuestion()
    }

    // The browser's own back button is a thumb going for the item before this
    // one, not for the way off the site — and a run is held in memory alone, so
    // leaving is losing it. Once the survey is up it keeps one spare history
    // entry under itself and puts that entry straight back whenever the button
    // eats it, which is the whole of the mechanism: back is then the previous
    // item, and at the first item it is nothing at all rather than the end of
    // the run. Nothing else on the page touches history, so a press can only
    // ever mean this.
    let trapped = false

    function trapHistory() {
        if (trapped) return
        trapped = true
        history.pushState({ abyss: true }, "")
    }

    window.addEventListener("popstate", () => {
        // Before the test starts, and on somebody else's card, back is still
        // the way out: nothing has been answered that leaving would cost.
        if (!trapped) return

        // The entry the press ate, put back. Browsers throttle `pushState`, and a
        // thumb going at the button faster than that is the very thing this is
        // here for, so a refusal must not take the rest of the handler with it.
        try {
            history.pushState({ abyss: true }, "")
        } catch (e) {
            trapped = false // the spare entry is gone; back is the way out again
        }

        // A panel is what the press was aimed at, the same as Escape or the ×.
        if (panel) {
            closePanel()
            return
        }

        // Anywhere else, `goBack` decides: it holds while a level screen is up
        // or the run has ended, and stops at the first item.
        goBack()
    })

    function download() {
        const url = URL.createObjectURL(new Blob([JSON.stringify(container(), null, 2)], { type: "application/json" }))
        const a = document.createElement("a")
        a.href = url
        // Filed under the same code the data inside it carries.
        a.download = "responses-" + participant + ".json"
        a.click()
        URL.revokeObjectURL(url)
    }

    /* -------------------------------- saving ------------------------------ */

    // Where a finished run goes. DataPipe (pipe.jspsych.org) takes a file over
    // a plain POST and puts it in the repository its experiment ID is bound to
    // — here a Zenodo deposit, under the beta of the service that writes there
    // rather than to OSF. The file sent is `container()` exactly as "Download
    // responses" would save it, so the two can never disagree.
    // It goes once, when the last item is answered: nothing after that changes
    // an answer. The one thing it can miss is an agree/disagree given on a
    // level reopened after the end, which is accepted rather than sent twice —
    // a filename is taken once at the far end, and a second copy would be
    // refused.
    //
    // PARKED (September 2026): saving at every level too, so that a run left
    // halfway still leaves what it had. DataPipe refuses a filename it has
    // already taken (OSF_FILE_EXISTS, on the Zenodo adapter as much as on
    // OSF — tested 2026-09-02), so that would mean one file per checkpoint
    // and six files a run, against a Zenodo record's default limit of a
    // hundred. Its maintainer has said a coming release may allow a file to
    // be overwritten, or updated before it is sent; when it does, a `save()`
    // call at the top of `completeLevel()` is the whole of the change. Until
    // then, once, at the end.
    //
    // Writing to Zenodo is, as of September 2026, only on DataPipe's *test*
    // deployment (`datapipe-test.web.app`, the `test` branch of
    // jspsych/datapipe), which keeps experiments of its own: the production
    // site (`pipe.jspsych.org`) does not know this experiment ID. When Zenodo
    // reaches production, the experiment has to be made again there and both
    // constants changed together.
    const DATAPIPE = "https://datapipe-test.web.app/api/data/"
    const DATAPIPE_EXPERIMENT = "Elsjcjycb6ru"

    // The file's name at the far end has to be one nobody has used: a code
    // brought in on the link (`?sub=`) may come round twice, so the moment the
    // run began goes on the end of it. A test run says what it is up front,
    // so that it can be picked out and thrown away.
    function filename() {
        const began = timeStart.replace(/[-:]/g, "").slice(0, 15) // 20260902T141530
        return (testMode ? "test-" : "responses-") + participant + "_" + began + ".json"
    }

    function save() {
        return fetch(DATAPIPE, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "*/*" },
            body: JSON.stringify({
                experimentID: DATAPIPE_EXPERIMENT,
                filename: filename(),
                data: JSON.stringify(container(), null, 2),
            }),
        }).then((reply) => {
            // DataPipe refuses with a status as well as a message, so the
            // status is enough to go on.
            if (!reply.ok) throw new Error("DataPipe answered " + reply.status)
        })
    }

    // What the last screen says about it. The download button underneath is
    // the way out if it went wrong: the answers are still in the page, and the
    // person can keep them and send them by hand.
    function saved(state) {
        const note = $("save-note")
        note.classList.toggle("save__note--done", state === "done")
        note.classList.toggle("save__note--failed", state === "failed")
        note.textContent =
            state === "done"
                ? "Your answers have been saved. Thank you for taking part."
                : state === "failed"
                  ? "Your answers could not be sent. Please download them below and email the file to D.Makowski@sussex.ac.uk."
                  : "Saving your answers…"
    }

    /* ------------------------------- results ----------------------------- */

    // Everything results.js is allowed to reach. It reads the run and the
    // scores, and borrows the two pieces of chrome — the screens and the
    // particles — that a result arrives with.
    const results = makeResults({
        $: $,
        RUN: RUN,
        CHARTS: CHARTS,
        dimensions: dimensions,
        dimensionOrder: dimensionOrder,
        feedback: feedback,
        score: score,
        total: total,
        percentile: percentile,
        tercile: tercile,
        levelProgress: levelProgress,
        showScreen: showScreen,
        burst: burst,
        still: still,
    })

    /* ------------------------------- wiring ------------------------------ */

    document.addEventListener("keydown", (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return

        // A panel takes the keyboard: the survey behind it is not being read.
        // It says `aria-modal`, so Tab is held inside it too — off the end of
        // the panel is back to its start, not out into the page underneath.
        if (panel) {
            if (e.key === "Escape") closePanel()
            else if (e.key === "Tab") {
                const sheet = $("panel-" + panel)
                const stops = sheet.querySelectorAll("button, a[href], input, [tabindex]:not([tabindex='-1'])")
                if (!stops.length) return

                const first = stops[0]
                const last = stops[stops.length - 1]

                if (!sheet.contains(document.activeElement) || (e.shiftKey && document.activeElement === first)) {
                    e.preventDefault()
                    ;(e.shiftKey ? last : first).focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
            return
        }

        // A field being typed into owns its own keys, digits and arrows alike.
        if (screen !== "survey" || (e.target && e.target.tagName === "INPUT")) return

        const question = questions[index]

        // A briefing has nothing to answer, so the only key that
        // carries it on is the one that means "yes, on we go".
        if (isBriefing(question)) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault() // space would scroll the screen instead
                passBriefing()
            } else if (e.key === "ArrowLeft") {
                goBack()
            }
            return
        }

        // Several answers may be true at once, so a digit latches one instead
        // of taking the item, and Enter is what says the list is finished.
        // Pressing the buttons is how it goes through the same latching the
        // pointer does, rather than a second copy of it here.
        if (question.type === "multi") {
            const buttons = $("options").querySelectorAll(".option[data-value]")
            const pressed = Number(e.key)
            if (pressed >= 1 && pressed <= buttons.length) buttons[pressed - 1].click()
            else if (e.key === "Enter") $("options").querySelector(".option--go").click()
            else if (e.key === "ArrowLeft") goBack()
            return
        }

        const options = question.options
        const n = Number(e.key)
        if (n >= 1 && n <= options.length) {
            answer(options[n - 1].value)
        } else if (e.key === "ArrowLeft") {
            goBack()
        }
    })

    // The form has to have been read to the end before it can be agreed to. A
    // form short enough not to scroll has been read as soon as it is on screen.
    // Reaching the end is what turns the button into the way in.
    function checkConsent() {
        const form = $("consent")
        const read = form.scrollTop + form.clientHeight >= form.scrollHeight - 8
        // A test run has nobody to consent to anything, and reading the form is
        // the one part of the way in that cannot be waved past.
        if (!read && !testMode) return

        $("start").disabled = false
        $("start").textContent = "Start the test"
        $("consent-hint").textContent = testMode ? "Test mode — consent is not being taken." : "You have reached the end of the form."
        $("consent-hint").classList.add("consent__hint--read")
    }

    $("consent").addEventListener("scroll", checkConsent)
    window.addEventListener("resize", checkConsent)
    checkConsent()

    // The title sinks as the page is scrolled off it, so that what is left by
    // the time the form is in view is the form.
    function sinkHero() {
        if (screen !== "intro") return
        const gone = Math.min(1, window.scrollY / ($("hero").offsetHeight * 0.72))
        $("hero").style.setProperty("--gone", gone.toFixed(3))
    }

    window.addEventListener("scroll", sinkHero, { passive: true })

    /* --------------------------- the way in ------------------------------ */

    // The line the test is named after, held on screen once before the first
    // question. Any click or key cuts it short.
    const GAZE_HOLD = 6600 // ms the quote is left up for
    const GAZE_FADE = 1900 // ms it takes to clear, the words going before the dark

    function gaze(then) {
        const layer = $("gaze")
        const survey = $("screen-survey")
        let over = false

        // The first item goes up behind the quote, while it is still opaque, so
        // that what the fade uncovers is the question and never the page the
        // quote was called from. It comes up out of the dark as the quote
        // clears rather than being handed over whole.
        const finish = () => {
            if (over) return
            over = true
            document.removeEventListener("keydown", finish, true)

            then()
            survey.classList.add("screen--arriving")
            document.body.classList.remove("sinking") // the water below the form goes with it
            jump(0) // the descent is over; the item starts at the top
            layer.classList.add("gaze--out")

            // The arrival is left on the screen. Taking it off would put the
            // ordinary screen animation back in its place, and that counts as a
            // new animation: the item would fade in a second time, a second and
            // a half after arriving. `showScreen` clears it the next time it
            // has a screen to put up.
            setTimeout(() => {
                layer.hidden = true
                layer.classList.remove("gaze--out")

                // The item was under the fade until now. Timing it from here
                // keeps the gap to the response it produces a reaction time.
                log[questions[index].key].timeOnset = new Date().toISOString()
            }, GAZE_FADE)
        }

        layer.hidden = false
        layer.addEventListener("click", finish, { once: true })
        document.addEventListener("keydown", finish, true)
        setTimeout(finish, GAZE_HOLD)
    }

    // Agreeing to take part carries on down rather than going back up: pressing
    // the button opens more water under the form and the page keeps sinking
    // into it while the quote closes over the top.
    $("start").addEventListener("click", () => {
        document.body.classList.add("sinking")
        // Reading the height settles the water that class just opened, so the
        // scroll below has the whole of it to run down.
        const bottom = document.documentElement.scrollHeight
        window.scrollTo({ top: bottom, behavior: still() ? "instant" : "smooth" })

        gaze(() => {
            showScreen("survey")
            renderQuestion()
            trapHistory() // from here on the back button means the previous item
        })
    })

    $("back").addEventListener("click", goBack)
    $("briefing-go").addEventListener("click", passBriefing)
    $("download").addEventListener("click", download)
    $("raw-download").addEventListener("click", download)
    // Every way in is also the way out: pressing a lit button shuts what it lit.
    $("profile").addEventListener("click", () => (panel === "profile" ? closePanel() : openProfile()))
    $("raw").addEventListener("click", () => (panel === "raw" ? closePanel() : openRaw()))
    $("level-continue").addEventListener("click", () => {
        suckLevel(levelShowing, () => {
            locked = false // the item behind the level screen is being read again
            showScreen("survey")
            renderQuestion()
            jump(0)
        })
    })

    // The strip of page left showing beside a panel is the way out of it.
    $("scrim").addEventListener("click", closePanel)
    for (const button of document.querySelectorAll("[data-close]")) button.addEventListener("click", closePanel)

    // Leaving somebody else's card puts the page back to the one everybody
    // else lands on, link and all, so that taking the test starts from scratch.
    $("visit-start").addEventListener("click", () => {
        history.replaceState(null, "", location.origin + location.pathname)
        showScreen("intro")
        jump(0)
        sinkHero()
        checkConsent()
    })

    // A test run says so across the top of every screen it is taken on, so that
    // one is never mistaken for the real thing on the way past.
    if (testMode) {
        const mark = document.createElement("span")
        mark.className = "banner__test"
        mark.textContent = "Test mode"
        $("banner").appendChild(mark)
    }

    buildSidebar()
    renderSidebar()
    results.renderExample($("why-web")) // the shape of a finished profile, behind the case for making one

    // A shared card is the whole page when there is one: the test is still
    // underneath it, waiting behind "Take the test yourself".
    const visiting = results.readCardLink()
    if (visiting) results.showVisit(visiting)
})()
