/* =========================================================================
   Survey engine. Presents the items of each questionnaire from content/,
   one at a time, in random order, and drives the screens they are shown on.

   Everything that reads a score back — the charts, the results sections, the
   card — lives in results.js, which is handed the engine at the bottom of
   this file. What crosses that line is the `engine` object and nothing else.
   ========================================================================= */

;(function () {
    "use strict"

    // Questionnaires to include. The order matters twice over: items are written
    // in it, so the ones held in place by `shuffle: false` sit where it puts
    // them, and the results of a level read in it.
    // `gjs` is commented out in content/level2.js and left out here besides: it
    // asks everybody about a job, and there is nothing yet to say who has one.
    // Waking it takes both.
    const RUN = ["demographics1", "fipi", "sins", "demographics2", "mint", "phq4", "pathological", "closing"]
    const CHARTS = ["fipi", "phq4"] // questionnaires that get a spider chart of their own
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

    // Every item of every questionnaire, in the order written, each carrying
    // everything needed to show it.
    const written = []

    for (const name of RUN) {
        const questionnaire = QUESTIONNAIRES[name]
        for (const item of questionnaire.items) {
            // A section is a pause rather than a question: words, and a way
            // on. It introduces whatever is written after it, so it can only
            // ever hold its own place — `shuffle` is decided here rather than
            // left to be remembered in the content. Its `options` are empty, so
            // everything that reads a scale off an item finds nothing to read.
            if (item.section) {
                written.push({
                    key: item.key,
                    text: item.text,
                    questionnaire: name,
                    section: true,
                    options: [],
                    shuffle: false,
                    level: setting(item, questionnaire, "level") || 1,
                })
                continue
            }

            const format = setting(item, questionnaire, "format")
            // A scale may write its own numbers over the values behind them
            // (`labels`), which is how the same points can be shown two ways.
            const options = (format.options || []).map((one, at) =>
                Object.assign(
                    { text: null, label: format.labels ? format.labels[at] : null },
                    typeof one === "object" ? one : { value: one }
                )
            )
            const values = options.map((o) => o.value)

            written.push({
                key: item.key,
                text: item.text,
                questionnaire: name,
                dimension: item.dimension,
                instructions: setting(item, questionnaire, "instructions"),
                options: options,
                input: format.input,
                placeholder: format.placeholder,
                // A typed answer has no options, so its bounds are the scale.
                lowest: options.length ? Math.min.apply(null, values) : format.min,
                highest: options.length ? Math.max.apply(null, values) : format.max,
                anchors: format.anchors,
                columns: format.columns,
                tooLow: format.tooLow,
                tooHigh: format.tooHigh,
                color: format.color,
                hovercolors: format.hovercolors,
                showIf: item.showIf,
                check: item.check,
                reverse: item.reverse,
                shuffle: setting(item, questionnaire, "shuffle"),
                level: setting(item, questionnaire, "level") || 1,
            })
        }
    }

    // Levels are asked in order. Within one, the items of every questionnaire
    // are shuffled together, except those marked `shuffle: false`, which hold
    // the position they were written in.
    const levels = [...new Set(written.map((question) => question.level))].sort((a, b) => a - b)
    const questions = []

    for (const level of levels) {
        const inLevel = written.filter((question) => question.level === level)
        const moving = shuffle(inLevel.filter((question) => question.shuffle !== false))
        let next = 0

        inLevel
            .map((question) => (question.shuffle === false ? question : moving[next++]))
            .forEach((question) => questions.push(question))
    }

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

    // `?testMode=true` walks the run in miniature: a long questionnaire puts
    // only a couple of its items on screen and the rest are answered for it at
    // random, so that every chart, level and reading can be reached in a minute
    // rather than in twelve. What comes out of such a run is not data, and the
    // saved file says so at the top of itself.
    const TEST_LONG = 10 // items above which a questionnaire is thinned
    const TEST_KEPT = 2 // items it still asks

    // An answer given by nobody: a point off the item's own scale, a number
    // inside the bounds of the field, or a word in place of the written one.
    function anyAnswer(question) {
        if (question.input === "text") return "test"
        if (question.input) return question.lowest + Math.floor(Math.random() * (question.highest - question.lowest + 1))
        return question.options[Math.floor(Math.random() * question.options.length)].value
    }

    // An item marked `auto` is answered here, once, and never shown: `shown()`
    // passes over it, so the run is walked, counted and finished as though it
    // were not in it, while the scoring behind the results has its answer. An
    // item waiting on another (`showIf`) is left out of the thinning — it is
    // asked, or not, on the answer that opens it, exactly as it would be — and
    // so is a section, which has no answer to stand in for and is the one thing
    // a short run should still show in full.
    function thinRun() {
        for (const name of RUN) {
            const mine = questions.filter((question) => question.questionnaire === name)
            if (mine.length <= TEST_LONG) continue

            for (const question of shuffle(mine.filter((one) => !one.showIf && !one.section)).slice(TEST_KEPT)) {
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
        const given = responses[question.showIf.key]
        const wanted = question.showIf.is
        return Array.isArray(wanted) ? wanted.indexOf(given) !== -1 : given === wanted
    }

    function nextShown(from) {
        for (let at = from; at < questions.length; at++) if (shown(questions[at])) return at
        return -1
    }

    function previousShown(from) {
        for (let at = from; at >= 0; at--) if (shown(questions[at])) return at
        return -1
    }

    // The items of a level that are actually being asked, in order. A section
    // is not among them: it is a pause with nothing to answer, so it is owed no
    // answer and must never be what holds a level shut.
    function askedIn(level) {
        return questions.filter((question) => question.level === level && !question.section && shown(question))
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

        // A section was read rather than answered, so it is not in here: the
        // file is the record of what somebody said, and `order` counts the
        // items they were actually asked.
        file.items = questions.filter((question) => !question.section).map((question, position) => {
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

    for (const question of written) {
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
        const tail =
            density * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
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
        for (const button of document.querySelectorAll(".option")) {
            const selected = value !== undefined && Number(button.dataset.value) === value
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

    function renderScale(question) {
        const labelled = question.options.some((o) => o.text !== null)
        const wrap = $("options")

        wrap.innerHTML = ""
        wrap.className = "options"

        if (question.input) {
            renderEntry(question, wrap)
        } else {
            wrap.classList.toggle("options--labelled", labelled)
            wrap.classList.toggle("options--wide", !labelled && question.options.length > 7)
            // Labelled options stack unless the item asks for columns; circles
            // always get one column each.
            wrap.style.setProperty("--columns", labelled ? question.columns || 1 : question.options.length)

            question.options.forEach((option, position) => {
                const button = document.createElement("button")
                button.type = "button"
                button.className = "option" + (option.small ? " option--small" : "")
                button.dataset.value = String(option.value)
                button.textContent = option.text === null ? option.label || String(option.value) : option.text
                button.setAttribute("role", "radio")
                button.setAttribute("aria-checked", "false")
                button.addEventListener("click", () => answer(option.value))

                // Each option lights up at its own point along the gradient.
                if (question.hovercolors) {
                    const spread = question.options.length - 1
                    const shade = mix(question.hovercolors[0], question.hovercolors[1], position / spread)
                    button.style.setProperty("--hover", shade)
                }

                wrap.appendChild(button)
            })
        }

        const anchored = question.anchors && !question.input
        $("anchor-left").textContent = anchored ? question.anchors[0] : ""
        $("anchor-right").textContent = anchored ? question.anchors[1] : ""
        $("anchor-left").hidden = !anchored
        $("anchor-right").hidden = !anchored
    }

    // A pause in the middle of a level: what the next stretch of it is about,
    // and a way on. It takes the survey screen over rather than being a screen
    // of its own, so that everything guarding on `screen === "survey"` — the
    // keyboard, the back button, the timing — goes on holding while it is up.
    function renderSection(question) {
        // The options of the item before it would otherwise still be sitting in
        // the screen behind the section, answerable by anything that finds them.
        $("options").innerHTML = ""
        $("section-body").innerHTML = question.text
    }

    function renderQuestion() {
        const question = questions[index]
        const survey = $("screen-survey")
        const pausing = !!question.section

        // Drives the item's background, its selected response and the progress bar.
        document.documentElement.style.setProperty("--selected", question.color || "var(--accent)")

        $("text").hidden = pausing
        $("scale").hidden = pausing
        $("section").hidden = !pausing
        $("instructions").hidden = pausing || !question.instructions

        if (pausing) {
            renderSection(question)
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
            share: Math.round((answered / asked.length) * 100),
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
        const asked = questions.filter((question) => !question.section && shown(question))
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

    function renderDepth() {
        const so_far = depth()
        $("depth").textContent = metres()
        $("depth").title = so_far.answered + " of " + so_far.size + " questions answered"
        setDescent(so_far.share)
    }

    // The whole run on one line down the edge of the bar, filling as it is
    // answered and never going back. The depth rides the end of the fill, and
    // the levels are spaced evenly down it, each at the point it is finished —
    // every one of them opens, one still locked showing a blurred taste of what
    // finishing gives.
    function renderSidebar() {
        renderDepth()

        const wrap = $("levels")
        const share = depth().share * 100

        $("descent-fill").style.height = share + "%"
        $("depth").style.top = share + "%"
        wrap.innerHTML = ""

        scoredLevels.forEach((level, at) => {
            const progress = levelProgress(level)
            const showing = panel === "results" && openLevel === level
            const button = document.createElement("button")

            button.type = "button"
            // The panel opens out of this button, so it has to be findable
            // again by the level it holds.
            button.dataset.level = level
            button.className =
                "sidebar__level" +
                (progress.unlocked ? " sidebar__level--unlocked" : "") +
                (showing ? " sidebar__level--open" : "")
            button.style.top = ((at + 1) / scoredLevels.length) * 100 + "%"
            button.title = progress.unlocked
                ? "See the results of level " + level
                : "See a taste of level " + level + ", still locked"
            button.innerHTML =
                '<span class="sidebar__level-word">Level</span><span class="sidebar__level-number">' +
                level +
                '</span><span class="sidebar__level-label">Level ' +
                level +
                " · " +
                progress.share +
                "%</span>"

            button.setAttribute("aria-expanded", showing ? "true" : "false")
            // The button that opened it closes it again: a level is a thing on
            // the line that is either open or shut, not a link that only leads
            // one way.
            button.addEventListener("click", () => (showing ? closePanel() : openResults(level)))
            wrap.appendChild(button)
        })
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

    function openResults(level) {
        const locked = !levelProgress(level).unlocked
        openLevel = level
        fromLevel(level)
        $("results-title").textContent = "Level " + level + (locked ? " — locked" : "")
        results.renderResults($("results-body"), level, locked)
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

        for (const section of document.querySelectorAll(".panel")) {
            section.classList.toggle("panel--open", section.id === "panel-" + name)
        }
        $("overlay").classList.add("overlay--open")

        markSidebar()
        $("panel-" + name).querySelector(".panel__close").focus()
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

        for (const section of document.querySelectorAll(".panel")) section.classList.remove("panel--open")
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
            }
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
            setTimeout(() => burst($("text"), colour, { count: 30, reach: 190 + at * 70 }), at * FINALE_STEP)
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

        // The spray comes out of what was pressed: the option itself, or the
        // Continue button of a typed answer, whose value is not a selector.
        const chosen = question.input
            ? $("options").querySelector(".option--go")
            : document.querySelector('.option[data-value="' + value + '"]')
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
    // ways forward — answering an item, and reading a section and leaving it —
    // come through here, so a level ends the same way whichever ended it.
    function advance() {
        const finished = questions[index].level
        const next = nextShown(index + 1)

        // Nothing left to answer: the run breaks up over the last item, and
        // then the whole web is the last screen — rather than an announcement
        // with the way to it.
        if (next === -1) {
            locked = true // there is nothing after this, and nothing to answer
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

    // A section is read and left. Nothing is recorded: no response, nothing in
    // the file, and nothing in the quality-control figures — leaving one is a
    // step through the run and not an answer to anything.
    function passSection() {
        if (locked || screen !== "survey" || !questions[index].section) return
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
        if (panel) {
            if (e.key === "Escape") closePanel()
            return
        }

        // A field being typed into owns its own keys, digits and arrows alike.
        if (screen !== "survey" || (e.target && e.target.tagName === "INPUT")) return

        const question = questions[index]

        // A section has nothing to answer, so the only key that carries it on
        // is the one that means "yes, on we go".
        if (question.section) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault() // space would scroll the section instead
                passSection()
            } else if (e.key === "ArrowLeft") {
                goBack()
            }
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
    $("section-go").addEventListener("click", passSection)
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

    renderSidebar()
    results.renderExample($("why-web")) // the shape of a finished profile, behind the case for making one

    // A shared card is the whole page when there is one: the test is still
    // underneath it, waiting behind "Take the test yourself".
    const visiting = results.readCardLink()
    if (visiting) results.showVisit(visiting)
})()
