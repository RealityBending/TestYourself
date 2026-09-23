/* =========================================================================
   Everything that reads a score back. app.js hands `makeResults` the engine —
   the run, the scores, and the two pieces of chrome a result arrives with —
   and gets back the few functions it calls. Nothing here walks the run or
   records anything but the agree/disagree on a prediction and the stars a
   level's results are given.

   The figures a level closes on each live in js/figures/, one factory apiece,
   handed `shared` below and nothing else; this file holds what they have in
   common — reading a score against its norm, the spider chart, the votes, the
   sections, the staged opening, the profile and the card — and the showcase
   of stand-in figures the landing page cycles.
   ========================================================================= */

function makeResults(engine) {
    "use strict"

    const $ = engine.$
    const RUN = engine.RUN
    const CHARTS = engine.CHARTS
    const dimensions = engine.dimensions
    const dimensionOrder = engine.dimensionOrder
    const feedback = engine.feedback
    const ratings = engine.ratings
    const ratingKey = engine.ratingKey
    const score = engine.score
    const total = engine.total
    const percentile = engine.percentile
    const tercile = engine.tercile
    const levelProgress = engine.levelProgress
    const answer = engine.answer
    const showScreen = engine.showScreen
    const burst = engine.burst
    const still = engine.still

    /* --------------------------- reading a score -------------------------- */

    // Every dimension a questionnaire holds, whether or not there is anything
    // to place it against. Only the wheel wants them all.
    function dimensionsIn(name) {
        return dimensionOrder.filter((dimension) => dimensions[dimension][0].questionnaire === name)
    }

    // The dimensions that have something to say: a dimension without norms
    // earns no percentile, no standing and no prediction, and a questionnaire
    // written `results: false` keeps its norms for analysis and reads nothing
    // back on its level.
    function dimensionsOf(name) {
        if (QUESTIONNAIRES[name].results === false) return []
        return dimensionsIn(name).filter(normOf)
    }

    function normOf(dimension) {
        const norms = QUESTIONNAIRES[dimensions[dimension][0].questionnaire].norms
        return norms && norms[dimension]
    }

    // Whether a dimension exists in this run at all, as against merely being
    // unanswered — a block left out of the timeline rather than one in progress.
    function known(dimension) {
        return !!dimensions[dimension]
    }

    function colourOf(dimension) {
        return known(dimension) ? dimensions[dimension][0].color : undefined
    }

    // How far along its own scale a value sits, as a share.
    function reachOf(dimension, value) {
        const question = dimensions[dimension][0]
        return (value - question.lowest) / (question.highest - question.lowest)
    }

    // Where a value stands against a norm. Kept off 0 and 100, which read as
    // absolutes; `centile` is what a bar is filled to, so bar and words agree.
    function standFrom(value, norm) {
        const proportion = percentile(value, norm)
        const centile = Math.min(99, Math.max(1, Math.round(proportion * 100)))
        return {
            proportion: proportion,
            centile: centile,
            direction: centile < 50 ? "lower" : "higher",
            share: centile < 50 ? 100 - centile : centile,
        }
    }

    function comparison(dimension) {
        const norm = normOf(dimension)
        return norm ? standFrom(score(dimension), norm) : null
    }

    // What a point on the whole-run web says on hover: where somebody stands,
    // on every axis including the reasoning's four.
    //
    // Those four are worded differently, and only worded differently. A
    // standing on them is a standing on a *style* rather than on an ability —
    // the level names them Verbal, Logical, Visual and Spatial and never says
    // intelligence or a total — so the sentence says what the style is and
    // then how much somebody leans on it, rather than putting a percentile
    // against a bare name that a reader could take for a score. Being a less
    // verbal thinker than most is not a worse result, and the words are what
    // carry that.
    function summarise(dimension) {
        const standing = comparison(dimension)
        if (!standing) return dimension + ": " + score(dimension).toFixed(1)
        const style = dimensions[dimension][0].questionnaire === reasoning.REASONING_OF && reasoning.shortOf(dimension)
        if (style) return dimension + ": " + style + " — you use it " + (standing.direction === "higher" ? "more" : "less") + " than " + standing.share + "% of people do"
        return dimension + ": " + standing.direction + " than " + standing.share + "% of people"
    }

    // A stand-in figure for a locked level, hashed from a name rather than any
    // answer: there to be blurred and show the shape of what is coming.
    function teaseReach(name, lowest, highest) {
        let hash = 0
        for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 9973
        return lowest + (0.35 + (hash % 55) / 100) * (highest - lowest)
    }

    function teaseValue(dimension) {
        const question = dimensions[dimension][0]
        return teaseReach(dimension, question.lowest, question.highest)
    }

    // An interpretation is written as the continuation of "you …".
    function sentence(reading) {
        return reading.charAt(0).toUpperCase() + reading.slice(1)
    }

    /* ------------------------------- tooltip ------------------------------ */

    const tooltip = document.createElement("div")
    tooltip.className = "tip"
    document.body.appendChild(tooltip)

    function showTip(dot, text) {
        const spot = dot.getBoundingClientRect()
        tooltip.textContent = text
        tooltip.classList.add("tip--shown")
        tooltip.style.left = spot.left + spot.width / 2 + "px"
        tooltip.style.top = spot.top - 10 + "px"
    }

    function hideTip() {
        tooltip.classList.remove("tip--shown")
    }

    /* -------------------------------- votes ------------------------------- */

    // A vote is filed under the reading's name with spaces and punctuation
    // taken out, so every key in the saved file is one word.
    function filed(name) {
        return name.replace(/[^A-Za-z0-9]+(.)?/g, (all, next) => (next ? next.toUpperCase() : ""))
    }

    // What a vote on a dimension is filed under: the `key` written beside its
    // norms in `content/`, which is wanted wherever there are interpretations,
    // and otherwise the name with the spaces and punctuation taken out of it.
    // The written key is there for the reason a level's is — the name is prose
    // shown on the results row, free to be reworded for the person reading it,
    // and a column of a study's data is not. The fallback stays so that a
    // dimension which grows interpretations before it grows a key still files
    // somewhere sensible; `feedbackKeys` is what refuses two of one key.
    // `voteButtons` is handed a dimension by a results row and its own key by a
    // figure that has no dimension to be read against (the wheel, the compass,
    // the archetype), so a name that is not a dimension of this run is already
    // the key and is passed through rather than looked up — `normOf` reads
    // `dimensions[name][0]` and would throw on one.
    function feedbackKey(dimension) {
        const norm = known(dimension) && normOf(dimension)
        return (norm && norm.key) || filed(dimension)
    }

    // One pick out of a few. Pressing the chosen one again puts it back to
    // `null` rather than deleting it, since every key of `feedback` is written.
    // **The key is handed in rather than worked out here**: a figure's vote
    // carries its own (`SEA_KEY` and the rest) and a dimension's comes from
    // `feedbackKey`, so nothing on screen is ever the thing a vote is filed by.
    function pickButtons(key, choices) {
        const votes = document.createElement("div")
        votes.className = "votes"

        const show = () => {
            for (const button of votes.children) {
                const picked = feedback[key] === button.dataset.pick
                button.classList.toggle("vote--picked", picked)
                button.setAttribute("aria-pressed", picked ? "true" : "false")
            }
        }

        for (const choice of choices) {
            const button = document.createElement("button")
            button.type = "button"
            button.className = "vote"
            button.dataset.pick = choice.value
            button.textContent = choice.label
            button.addEventListener("click", () => {
                feedback[key] = feedback[key] === choice.value ? null : choice.value
                show()
            })
            votes.appendChild(button)
        }

        show()
        return votes
    }

    const VOTES = [
        { value: "agree", label: "Agree" },
        { value: "disagree", label: "Disagree" },
    ]

    function voteButtons(dimension) {
        return pickButtons(feedbackKey(dimension), VOTES)
    }

    const STARS = 5
    const STAR = "M12 2.6l2.7 5.9 6.4.7-4.8 4.4 1.3 6.4L12 16.8 6.4 20l1.3-6.4L2.9 9.2l6.4-.7z"

    // Under everything a level opened: what the person made of it, out of five.
    // It is filed under the level screen's own key, since it is a reading of
    // that screen rather than of any one questionnaire on it, and pressing the
    // star already given takes the rating back the way a vote unvotes. Nothing
    // asks for it and nothing is held shut by it.
    function starRating(level) {
        // Filed under whatever the engine files a level's stars under — the
        // level's name, as it happens, but that is app.js's business and not
        // this file's.
        const key = ratingKey(level)
        const box = document.createElement("div")
        box.className = "rating"

        const ask = document.createElement("p")
        ask.className = "rating__ask"
        ask.textContent = "How did you like this part of the test?"
        box.appendChild(ask)

        const row = document.createElement("div")
        row.className = "rating__stars"
        row.setAttribute("role", "group")
        row.setAttribute("aria-label", "Rate this section out of " + STARS)
        box.appendChild(row)

        // `over` is the star under the pointer, which lights its run of them
        // without standing for anything: what is given is what was pressed.
        const paint = (over) => {
            const given = ratings[key] || 0
            for (const button of row.children) {
                const at = Number(button.dataset.stars)
                button.classList.toggle("star--lit", at <= (over || given))
                button.setAttribute("aria-pressed", at === given ? "true" : "false")
            }
        }

        // A rating given: the run of stars swells one after the other, and the
        // one pressed throws the gold a results section opens with.
        const light = (given, pressed) => {
            for (const button of row.children) {
                const at = Number(button.dataset.stars)
                if (at > given) continue
                button.classList.remove("star--pop")
                void button.offsetWidth // a class put straight back never starts its animation again
                button.style.setProperty("--beat", (at - 1) * 55 + "ms")
                button.classList.add("star--pop")
            }
            burst(pressed, "#d9a441", { count: 12, reach: 46 })
        }

        for (let at = 1; at <= STARS; at++) {
            const button = document.createElement("button")
            button.type = "button"
            button.className = "star"
            button.dataset.stars = at
            button.setAttribute("aria-label", at + (at === 1 ? " star" : " stars"))

            const glyph = document.createElementNS(SVG, "svg")
            glyph.setAttribute("viewBox", "0 0 24 24")
            glyph.setAttribute("aria-hidden", "true")
            glyph.appendChild(draw("path", { d: STAR }))
            button.appendChild(glyph)

            button.addEventListener("click", () => {
                const given = ratings[key] === at ? null : at
                ratings[key] = given
                paint()
                if (given) light(given, button)
            })
            button.addEventListener("mouseenter", () => paint(at))
            button.addEventListener("focus", () => paint(at))
            // The pop is taken off again, or its last frame would hold the
            // star still against the lift it gets on hover.
            button.addEventListener("animationend", () => button.classList.remove("star--pop"))
            row.appendChild(button)
        }

        row.addEventListener("mouseleave", () => paint())
        row.addEventListener("focusout", () => paint())

        paint()
        return box
    }

    // The holder every figure sits in: the svg with its label, and the Locked
    // badge over it when the level is.
    function figureHolder(told, className, locked) {
        const holder = document.createElement("div")
        holder.className = "result__chart" + (className ? " " + className : "")

        const figure = document.createElementNS(SVG, "svg")
        figure.setAttribute("role", "img")
        figure.setAttribute("aria-label", told)
        holder.appendChild(figure)

        if (locked) {
            const badge = document.createElement("span")
            badge.className = "result__lock"
            badge.textContent = "Locked"
            holder.appendChild(badge)
        }
        return { holder: holder, figure: figure }
    }

    /* ----------------------------- the figures ---------------------------- */

    // The whole of what a figure file may reach. Adding to it is adding to the
    // seam between this file and js/figures/, so keep it to what several want.
    const shared = {
        dimensions: dimensions,
        score: score,
        total: total,
        percentile: percentile,
        tercile: tercile,
        answer: answer,
        known: known,
        normOf: normOf,
        reachOf: reachOf,
        standFrom: standFrom,
        comparison: comparison,
        summarise: summarise,
        teaseReach: teaseReach,
        teaseValue: teaseValue,
        sentence: sentence,
        pickButtons: pickButtons,
        voteButtons: voteButtons,
        VOTES: VOTES,
        figureHolder: figureHolder,
        showTip: showTip,
        hideTip: hideTip,
    }

    const soma = makeSoma(shared)
    const theories = makeTheories(shared)
    const archetype = makeArchetype(shared)
    const wheel = makeWheel(shared)
    const sea = makeSea(shared)
    const climb = makeClimb(shared)
    const reasoning = makeReasoning(shared)
    const heads = makeHeads(shared)
    const stance = makeStance(shared)

    // The climb is one section for two questionnaires, rendered where the
    // first of them falls in the run and skipped where the other would; the
    // heads are the same for the `regulation` block's three.
    const CLIMB_FIRST = RUN.find((one) => climb.CLIMB_OF.indexOf(one) !== -1)
    const HEADS_FIRST = RUN.find((one) => heads.HEADS_OF.indexOf(one) !== -1)
    const STANCE_FIRST = RUN.find((one) => stance.STANCE_OF.indexOf(one) !== -1)

    /* ---------------------------- spider chart ---------------------------- */

    // Grows to `many` when it carries the whole profile; drawn as a `tease`, it
    // stands in for results not yet unlocked.
    function drawSpider(chart, list, tease) {
        const many = list.length > 8
        const centreX = many ? 280 : 200
        const centreY = many ? 200 : 150
        const radius = many ? 150 : 105
        const single = list.every((d) => dimensions[d][0].color === dimensions[list[0]][0].color)
        const found = []
        const average = []

        const pointAt = (position, distance) => {
            const angle = (Math.PI * 2 * position) / list.length - Math.PI / 2
            return [centreX + Math.cos(angle) * distance, centreY + Math.sin(angle) * distance]
        }

        chart.setAttribute("viewBox", many ? "0 0 560 400" : "0 0 440 290")
        // Added rather than set: the element is found again by a class of its
        // own, and drawing into it a second time must not take that off it.
        chart.classList.add("chart__web")
        chart.classList.toggle("chart__web--many", many)
        chart.innerHTML = ""

        for (let ring = 1; ring <= 3; ring++) {
            const corners = list.map((_, position) => pointAt(position, (radius * ring) / 3).join(","))
            chart.appendChild(draw("polygon", { class: "chart__ring", points: corners.join(" ") }))
        }

        list.forEach((dimension, position) => {
            const [x, y] = pointAt(position, radius)
            // Drawn from the centre outward, which is what lets the finished
            // run's web run its axes out of the middle; `pathLength` makes one
            // the length of every axis, whatever the radius, so the stylesheet
            // can draw them with a dash without knowing the geometry.
            chart.appendChild(
                draw("line", {
                    class: "chart__axis",
                    x1: centreX,
                    y1: centreY,
                    x2: x,
                    y2: y,
                    pathLength: 1,
                    style: "--at: " + (position * 0.045).toFixed(3) + "s",
                }),
            )

            const [labelX, labelY] = pointAt(position, radius + 22)
            const value = tease ? teaseValue(dimension) : score(dimension)
            const label = draw("text", {
                class: "chart__label" + (value === undefined ? " chart__label--awaiting" : ""),
                x: labelX,
                y: labelY,
                "text-anchor": Math.abs(labelX - centreX) < 8 ? "middle" : labelX > centreX ? "start" : "end",
                "dominant-baseline": "middle",
            })
            const words = dimension.split(" ")
            words.forEach((word, line) => {
                const part = draw("tspan", { x: labelX, dy: line === 0 ? (words.length > 1 ? "-0.55em" : "0") : "1.15em" })
                part.textContent = word
                label.appendChild(part)
            })
            chart.appendChild(label)

            const norm = normOf(dimension)
            if (norm) average.push({ position: position, spot: pointAt(position, reachOf(dimension, norm.mean) * radius) })

            if (value === undefined) return
            found.push({ dimension: dimension, position: position, spot: pointAt(position, reachOf(dimension, value) * radius), colour: dimensions[dimension][0].color })
        })

        // The average person, dashed, under everything else: closed when there
        // is a mean on every axis, and otherwise drawn between neighbouring
        // axes that have one, leaving a gap across those that have none (the
        // reasoning's four, which carry no norms) rather than a line through
        // them that would put an average where nobody has measured one.
        const compared = average.length > 2
        if (average.length === list.length && list.length > 2) {
            chart.appendChild(draw("polygon", { class: "chart__average", points: average.map((one) => one.spot.join(",")).join(" ") }))
        } else if (compared) {
            const means = {}
            for (const one of average) means[one.position] = one.spot
            for (let position = 0; position < list.length; position++) {
                const next = (position + 1) % list.length
                if (next === position || !means[position] || !means[next]) continue
                chart.appendChild(
                    draw("line", { class: "chart__average", x1: means[position][0], y1: means[position][1], x2: means[next][0], y2: means[next][1] }),
                )
            }
        }

        // Complete, the shape closes; partial, only neighbours are joined, so a
        // locked dimension leaves a gap rather than a line across the middle.
        const shape = "--chart: " + (single ? found[0] && found[0].colour : "var(--accent)")
        if (found.length === list.length && list.length > 2) {
            chart.appendChild(draw("polygon", { class: "chart__area", points: found.map((one) => one.spot.join(",")).join(" "), style: shape }))
        } else {
            const spots = {}
            for (const one of found) spots[one.position] = one.spot
            for (let position = 0; position < list.length; position++) {
                const next = (position + 1) % list.length
                if (next === position || (next < position && list.length === 2)) continue
                if (!spots[position] || !spots[next]) continue
                chart.appendChild(
                    draw("line", { class: "chart__link", x1: spots[position][0], y1: spots[position][1], x2: spots[next][0], y2: spots[next][1], style: shape }),
                )
            }
        }

        for (const one of found) {
            const dot = draw("circle", {
                class: "chart__point",
                cx: one.spot[0],
                cy: one.spot[1],
                r: many ? 5 : 5.5,
                // `--at` rather than the delay itself, so a card that wants the
                // whole chart to arrive later can push all of them back
                // together without losing the stagger between them.
                style: "--chart: " + one.colour + "; --at: " + (one.position * 0.06).toFixed(3) + "s",
            })
            // A teased point stands for nothing, so it says nothing on hover.
            if (!tease) {
                const text = summarise(one.dimension)
                dot.appendChild(draw("title", {})).textContent = text
                dot.addEventListener("mouseenter", () => showTip(dot, text))
                dot.addEventListener("mouseleave", hideTip)
            }
            chart.appendChild(dot)
        }

        // `at` is where the web was drawn, for anything that wants to frame
        // it rather than the room around it.
        return { found: found.length, compared: compared, colour: single && found[0] ? found[0].colour : null, at: { x: centreX, y: centreY, r: radius } }
    }

    function legend(colour) {
        const key = document.createElement("p")
        key.className = "legend"
        key.innerHTML =
            '<span class="legend__item"><i class="legend__you" style="--chart: ' +
            (colour || "var(--accent)") +
            '"></i>You</span><span class="legend__item"><i class="legend__average"></i>The average person</span>'
        return key
    }

    /* ---------------------------- results screen -------------------------- */

    // A section's name, with a dot in the colour its figure is drawn in. The
    // colour is written onto the section as `--chart`, so anything in it
    // without a colour of its own reads in it.
    function openSection(into, label, colour, locked) {
        const section = document.createElement("section")
        section.className = "result" + (locked ? " result--locked" : "")
        section.style.setProperty("--chart", colour || "var(--gold)")

        const heading = document.createElement("h2")
        heading.className = "result__name"
        heading.innerHTML = '<i class="result__dot" aria-hidden="true"></i><span></span>'
        heading.lastChild.textContent = label
        section.appendChild(heading)

        const body = document.createElement("div")
        body.className = "result__body"
        section.appendChild(body)
        into.appendChild(section)
        return { section: section, body: body }
    }

    function titleOf(name) {
        return QUESTIONNAIRES[name].name || name
    }

    function onLevel(list, level) {
        return list.some((dimension) => dimensions[dimension][0].level === level)
    }

    function rowHead(dimension, standing) {
        const head = document.createElement("div")
        head.className = "row__head"
        head.innerHTML = '<p class="row__name"></p><p class="row__stand"></p>'
        head.firstChild.textContent = dimension
        head.lastChild.innerHTML = standing
        return head
    }

    function percentileBar(share) {
        const bar = document.createElement("div")
        bar.className = "bar"
        bar.innerHTML =
            '<div class="bar__track"><div class="bar__fill" style="width:' + share + '%"></div><i class="bar__mean"></i><i class="bar__you" style="left:' + share +
            '%"></i></div><div class="bar__scale"><span>Lower</span><span>Average</span><span>Higher</span></div>'
        return bar
    }

    // One row per dimension: its standing, the bar, and the prediction with
    // the vote on it. `scored` came through `dimensionsOf`, so a norm is
    // guaranteed. Locked, the same rows with everything earned blurred.
    function rows(list, locked) {
        const holder = document.createElement("div")
        holder.className = "rows"

        for (const dimension of list) {
            const norm = normOf(dimension)
            const standing = locked ? null : comparison(dimension)
            const reading = norm.interpretations && (locked ? norm.interpretations.mid : norm.interpretations[tercile(standing.proportion)])
            const row = document.createElement("div")
            row.className = "row"
            row.style.setProperty("--chart", colourOf(dimension) || "var(--accent)")

            const head = rowHead(dimension, locked ? "Higher than <b>00%</b> of people" : sentence(standing.direction) + " than <b>" + standing.share + "%</b> of people")
            if (locked) head.lastChild.classList.add("blank")
            row.appendChild(head)

            const bar = percentileBar(locked ? 50 : standing.centile)
            if (locked) bar.classList.add("blank")
            row.appendChild(bar)

            if (reading) {
                const prediction = document.createElement("p")
                prediction.className = "row__reading" + (locked ? " blank" : "")
                prediction.textContent = sentence(reading)
                row.appendChild(prediction)
                if (!locked) row.appendChild(voteButtons(dimension))
            }
            holder.appendChild(row)
        }
        return holder
    }

    // A section per questionnaire of this level with something to show — or,
    // locked, a blurred taste of all of them. The figures that stand in for a
    // whole questionnaire take no rows: they say everything it has to say.
    function renderResults(into, level, locked) {
        into.innerHTML = ""

        if (locked) {
            const progress = levelProgress(level)
            const left = progress.size - progress.answered
            const note = document.createElement("div")
            note.className = "taste"
            note.innerHTML =
                "<span><b>" + left + " more answer" + (left === 1 ? "" : "s") + '</b> unlocks this</span><span class="taste__meter" aria-hidden="true"><i style="width:' +
                progress.share + '%"></i></span>'
            into.appendChild(note)
        }

        for (const name of RUN) {
            if (climb.CLIMB_OF.indexOf(name) !== -1) {
                if (name !== CLIMB_FIRST || !climb.CLIMB_OF.some((one) => onLevel(dimensionsOf(one), level))) continue
                if (!locked && !climb.climbed()) continue
                openSection(into, "The Last Year", colourOf("Emotional Intensity") || colourOf("Anxiety"), locked).body.appendChild(climb.renderClimb(locked))
                continue
            }

            // The heads are the same for the `regulation` block's three: drawn
            // once, where the first falls, and skipped where the other two would.
            if (heads.HEADS_OF.indexOf(name) !== -1) {
                if (name !== HEADS_FIRST || !heads.HEADS_OF.some((one) => onLevel(dimensionsOf(one), level))) continue
                if (!locked && !heads.headed()) continue
                openSection(into, "Mind & Heart", colourOf("Emotional Arousal") || colourOf("Self-Control"), locked).body.appendChild(heads.renderHeads(locked))
                continue
            }

            // And the `opinions` block's four are one figure too, the plane
            // and the spectra under it.
            if (stance.STANCE_OF.indexOf(name) !== -1) {
                if (name !== STANCE_FIRST || !stance.STANCE_OF.some((one) => onLevel(dimensionsOf(one), level))) continue
                if (!locked && !stance.ready()) continue
                openSection(into, "Where You Stand", colourOf("Sharing") || colourOf("Suspicion"), locked).body.appendChild(stance.renderStance(locked))
                continue
            }

            if (name === archetype.ARCHETYPE_OF) {
                if (!onLevel(dimensionsOf(name), level)) continue
                const type = archetype.aiArchetype()
                if (!locked && !type) continue
                openSection(into, titleOf(name), colourOf(archetype.ARCHETYPE_ON[0]), locked).body.appendChild(archetype.renderArchetype(type, locked))
                continue
            }

            // The wheel carries no norms, so its test for being on this level
            // goes through `dimensionsIn`.
            if (name === wheel.WHEEL_OF) {
                if (!onLevel(dimensionsIn(name), level) || (!locked && !wheel.leading().length)) continue
                openSection(into, titleOf(name), undefined, locked).body.appendChild(wheel.renderWheel(locked))
                continue
            }

            // So does the reasoning, which is read the same way: the four
            // kinds against each other, and nobody else.
            if (name === reasoning.REASONING_OF) {
                if (!onLevel(dimensionsIn(name), level) || (!locked && !reasoning.ready())) continue
                openSection(into, titleOf(name), undefined, locked).body.appendChild(reasoning.renderReasoning(locked))
                continue
            }

            const owned = dimensionsOf(name)
            const inLevel = owned.filter((dimension) => dimensions[dimension][0].level === level)
            const shown = locked ? inLevel : inLevel.filter((dimension) => score(dimension) !== undefined)
            if (!shown.length) continue

            const label = titleOf(name)
            const opened = openSection(into, label, colourOf(shown[0]), locked)
            const body = opened.body

            if (name === sea.SEA) {
                body.appendChild(sea.renderSea(locked))
            } else if (name === soma.SOMA) {
                const chart = figureHolder(
                    locked ? "Blurred preview of your " + label.toLowerCase() + ", still locked" : "Your interoception: awareness in the head, sensitivity in the chest, clarity between them",
                    "result__chart--wide",
                    locked,
                )
                soma.drawSoma(chart.figure, locked)
                body.appendChild(chart.holder)
            } else if (name === theories.OLD_THEORIES_OF) {
                // Two cards already; a card round the pair would be a box in a box.
                opened.section.classList.add("result--bare")
                body.appendChild(theories.renderOldTheories(locked))
            } else {
                if (CHARTS.indexOf(name) !== -1) {
                    const chart = figureHolder(
                        locked ? "Blurred preview of your " + label.toLowerCase() + ", still locked" : "Spider chart of your " + label.toLowerCase() + " dimensions",
                        "",
                        locked,
                    )
                    body.appendChild(chart.holder)
                    const drawn = drawSpider(chart.figure, owned, locked)
                    if (drawn.compared) body.appendChild(legend(drawn.colour))
                }
                body.appendChild(rows(shown, locked))
            }
        }

        markLone(into)

        // What the level was worth, asked once under the whole of it — never
        // on a level still locked, where there is nothing yet to think of.
        // It is no `.result`, so it neither counts towards the lone rule nor
        // breaks open with the sections.
        if (!locked && into.querySelector(".result")) into.appendChild(starRating(level))
    }

    // The foot of a finished level carries a taste of the next: the same
    // locked rendering with the rows and the note taken out — a blurred figure
    // is the hook, blurred rows only look like a page that failed to load — and
    // the count of answers still to go where the Locked badge was. "Next"
    // stands large over it with the level's title small underneath — or, at a
    // fork, where the level's number is not yet decided, the `word` handed in
    // (the level's name) and no title.
    function renderTeaser(into, level, title, word) {
        renderResults(into, level, true)

        for (const extra of into.querySelectorAll(".rows, .taste, .result__lock")) extra.remove()
        for (const section of into.querySelectorAll(".result")) {
            if (!section.querySelector(".result__body").children.length) section.remove()
        }

        const progress = levelProgress(level)
        const left = progress.size - progress.answered
        for (const body of into.querySelectorAll(".result__body")) {
            const badge = document.createElement("span")
            badge.className = "result__lock"
            badge.textContent = left + " more answer" + (left === 1 ? "" : "s") + " to unlock"
            body.appendChild(badge)
        }

        const head = document.createElement("div")
        head.className = "level__next-head"
        head.innerHTML = '<p class="level__next-word"></p><p class="level__next-title"></p>'
        head.firstChild.textContent = word || "Next"
        head.lastChild.textContent = title
        head.lastChild.hidden = !title
        into.insertBefore(head, into.firstChild)

        markLone(into)
        into.hidden = !into.querySelector(".result")
    }

    // A level with one section does not name it: the level's own name has.
    function markLone(into) {
        const sections = into.querySelectorAll(".result")
        for (const section of sections) section.classList.toggle("result--lone", sections.length === 1)
    }

    /* -------------------------- opening what was won ---------------------- */

    const OPEN_SETTLE = 300 // ms between scrolling to a section and opening it
    const OPEN_GAP = 900 // ms between one section opening and the next

    function sealSections(into, foot) {
        for (const section of into.querySelectorAll(".result")) section.classList.add("result--sealed")
        const rating = into.querySelector(".rating")
        if (rating) rating.classList.add("rating--sealed")
        if (foot) foot.classList.add("level__foot--sealed")
    }

    // Sections break open one at a time, each with a spray out of its middle,
    // and the way on arrives last. A click opens the rest at once.
    function openSections(into, foot) {
        const sections = Array.prototype.slice.call(into.querySelectorAll(".result"))
        let hurried = false

        // The rating arrives with the way on, once there is nothing left to
        // watch appear: it is asked about what has just been read.
        const unfoot = () => {
            const rating = into.querySelector(".rating")
            if (rating) rating.classList.remove("rating--sealed")
            if (foot) foot.classList.remove("level__foot--sealed")
        }
        const hurry = () => {
            hurried = true
            for (const section of sections) section.classList.remove("result--sealed")
            unfoot()
        }

        if (still()) return hurry()

        let at = 0
        const step = () => {
            const section = hurried ? null : sections[at++]
            if (!section) {
                document.removeEventListener("click", hurry)
                unfoot()
                // Out of whichever way on is showing: the one button, or
                // either side of a fork.
                setTimeout(() => {
                    for (const button of foot ? foot.querySelectorAll(".btn") : []) {
                        if (button.getClientRects().length) burst(button, "#d9a441", { count: 20, reach: 70 })
                    }
                }, 320)
                return
            }
            if (section.getBoundingClientRect().bottom > window.innerHeight) section.scrollIntoView({ behavior: "smooth", block: "center" })
            setTimeout(() => {
                section.classList.remove("result--sealed")
                section.classList.add("result--opening")
                burst(section, "#d9a441", { count: 26, reach: 150 })
                setTimeout(step, OPEN_GAP)
            }, OPEN_SETTLE)
        }

        // Registered late on purpose: the click that waved the curtain past is
        // still on its way up the page and would otherwise be caught here.
        setTimeout(() => {
            document.addEventListener("click", hurry, { once: true })
            step()
        }, 420)
    }

    /* ------------------------- the profile and the card ------------------- */

    // The web carries what a level's results name under its own name: a
    // dimension with norms, unless its questionnaire is read back as one
    // figure (the archetype, the wheel, the climb) or is written
    // `profile: false` — or, written `profile: true`, a dimension without
    // norms whose level names it anyway (the reasoning's four, each drawn as
    // its share of items right, with no average person on its axis).
    function onProfile(dimension) {
        const name = dimensions[dimension][0].questionnaire
        if (name === archetype.ARCHETYPE_OF || name === wheel.WHEEL_OF || climb.CLIMB_OF.indexOf(name) !== -1) return false
        if (QUESTIONNAIRES[name].profile === false) return false
        if (QUESTIONNAIRES[name].profile === true) return true
        return !!normOf(dimension)
    }

    const PROFILE = dimensionOrder.filter(onProfile)

    // How much of the web is drawn: what the badge at the head of the shelf
    // fills its ring to. It is the same count the note under the web reads, so
    // the bar and the panel can never disagree about how far along it is.
    function profileShare() {
        const found = PROFILE.filter((dimension) => score(dimension) !== undefined).length
        return { found: found, of: PROFILE.length, share: PROFILE.length ? found / PROFILE.length : 0 }
    }

    const CARD_WIDTH = 1200
    const CARD_HEIGHT = 630
    const CARD_LEAST = 3 // dimensions needed before there is a web to show

    function cardValues() {
        const values = {}
        for (const dimension of PROFILE) {
            const value = score(dimension)
            if (value !== undefined) values[dimension] = value
        }
        return Object.keys(values).length >= CARD_LEAST ? values : null
    }

    // The whole web on one image, on the same geometry the panel draws, with a
    // gap where a dimension is still unanswered.
    function drawCard(values) {
        const canvas = document.createElement("canvas")
        canvas.width = CARD_WIDTH
        canvas.height = CARD_HEIGHT
        canvas.className = "card__canvas"

        const c = canvas.getContext("2d")
        const sans = 'ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif'
        const serif = 'ui-serif, "Iowan Old Style", Georgia, serif'
        const held = PROFILE.filter((dimension) => values[dimension] !== undefined)

        const deep = c.createLinearGradient(0, 0, 0, CARD_HEIGHT)
        deep.addColorStop(0, "#0a0f1c")
        deep.addColorStop(1, "#020308")
        c.fillStyle = deep
        c.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

        const glow = c.createRadialGradient(600, 40, 0, 600, 40, 760)
        glow.addColorStop(0, "rgba(124, 92, 255, 0.26)")
        glow.addColorStop(1, "rgba(124, 92, 255, 0)")
        c.fillStyle = glow
        c.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

        c.strokeStyle = "rgba(255, 255, 255, 0.1)"
        c.lineWidth = 2
        c.strokeRect(1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2)

        c.textBaseline = "alphabetic"
        c.letterSpacing = "0.34em"
        c.font = "700 15px " + sans
        c.fillStyle = "#22d3ee"
        c.fillText("THE ABYSS TEST", 72, 78)

        c.letterSpacing = "0px"
        c.font = "italic 19px " + serif
        c.fillStyle = "#9aa4bd"
        c.fillText("The Science-based Assessment of Deep Personality", 72, 108)

        c.letterSpacing = "0.16em"
        c.font = "600 13px " + sans
        c.fillStyle = "#7d879e"
        c.textAlign = "right"
        c.fillText(held.length + " OF " + PROFILE.length + " DIMENSIONS", CARD_WIDTH - 72, 78)
        c.textAlign = "left"
        c.letterSpacing = "0px"

        const centreX = 600
        const centreY = 362
        const radius = 176
        const spot = (position, distance) => {
            const angle = (Math.PI * 2 * position) / PROFILE.length - Math.PI / 2
            return [centreX + Math.cos(angle) * distance, centreY + Math.sin(angle) * distance]
        }
        const trace = (points, close) => {
            c.beginPath()
            points.forEach(([x, y], at) => (at === 0 ? c.moveTo(x, y) : c.lineTo(x, y)))
            if (close) c.closePath()
        }

        c.strokeStyle = "rgba(255, 255, 255, 0.1)"
        c.lineWidth = 1
        for (let ring = 1; ring <= 3; ring++) {
            trace(PROFILE.map((_, position) => spot(position, (radius * ring) / 3)), true)
            c.stroke()
        }
        PROFILE.forEach((_, position) => {
            trace([[centreX, centreY], spot(position, radius)], false)
            c.stroke()
        })

        // The average person: closed when there is a mean on every axis, and
        // otherwise between neighbouring axes that have one, with a gap across
        // those that have none — the same as the web above the buttons.
        const means = {}
        PROFILE.forEach((dimension, position) => {
            const norm = normOf(dimension)
            if (norm) means[position] = spot(position, reachOf(dimension, norm.mean) * radius)
        })
        c.setLineDash([6, 5])
        c.strokeStyle = "#767c92"
        c.lineWidth = 2
        if (Object.keys(means).length === PROFILE.length) {
            trace(Object.values(means), true)
            c.stroke()
        } else {
            for (let position = 0; position < PROFILE.length; position++) {
                const next = (position + 1) % PROFILE.length
                if (!means[position] || !means[next]) continue
                trace([means[position], means[next]], false)
                c.stroke()
            }
        }
        c.setLineDash([])

        const yours = {}
        PROFILE.forEach((dimension, position) => {
            if (values[dimension] !== undefined) yours[position] = spot(position, reachOf(dimension, values[dimension]) * radius)
        })

        c.strokeStyle = "#7c5cff"
        c.lineWidth = 2.5
        c.lineJoin = "round"
        if (held.length === PROFILE.length) {
            trace(Object.values(yours), true)
            c.fillStyle = "rgba(124, 92, 255, 0.22)"
            c.fill()
            c.stroke()
        } else {
            for (let position = 0; position < PROFILE.length; position++) {
                const next = (position + 1) % PROFILE.length
                if (!yours[position] || !yours[next]) continue
                trace([yours[position], yours[next]], false)
                c.stroke()
            }
        }

        PROFILE.forEach((dimension, position) => {
            if (!yours[position]) return
            c.beginPath()
            c.arc(yours[position][0], yours[position][1], 5.5, 0, Math.PI * 2)
            c.fillStyle = dimensions[dimension][0].color || "#7c5cff"
            c.fill()
            c.strokeStyle = "#05070d"
            c.lineWidth = 2
            c.stroke()
        })

        c.font = "600 12px " + sans
        PROFILE.forEach((dimension, position) => {
            const [x, y] = spot(position, radius + 28)
            c.fillStyle = values[dimension] === undefined ? "#565c70" : "#cfd4e4"
            c.textAlign = Math.abs(x - centreX) < 8 ? "center" : x > centreX ? "left" : "right"
            const words = dimension.split(" ")
            words.forEach((word, line) => c.fillText(word, x, y + (line - (words.length - 1) / 2) * 15 + 4))
        })
        c.textAlign = "left"

        c.font = "600 13px " + sans
        c.strokeStyle = "#7c5cff"
        c.lineWidth = 2.5
        trace([[72, 596], [96, 596]], false)
        c.stroke()
        c.fillStyle = "#868fa6"
        c.fillText("You", 106, 601)

        c.setLineDash([6, 5])
        c.strokeStyle = "#767c92"
        c.lineWidth = 2
        trace([[166, 596], [190, 596]], false)
        c.stroke()
        c.setLineDash([])
        c.fillText("The average person", 200, 601)

        c.letterSpacing = "0.2em"
        c.fillStyle = "#5d6478"
        c.textAlign = "right"
        c.fillText("TAKE IT AT " + location.host.toUpperCase(), CARD_WIDTH - 72, 601)
        c.textAlign = "left"
        c.letterSpacing = "0px"

        return canvas
    }

    function cardLink(values) {
        const pairs = Object.keys(values)
            .map((dimension) => dimension + "~" + values[dimension].toFixed(2))
            .join(",")
        return location.origin + location.pathname + "?card=1&s=" + encodeURIComponent(pairs)
    }

    // A link is somebody else's text: only a dimension this build's profile
    // carries, at a number inside its own scale, gets drawn.
    function readCardLink() {
        const query = new URLSearchParams(location.search)
        if (query.get("card") !== "1" || !query.get("s")) return null

        const values = {}
        for (const pair of query.get("s").split(",")) {
            const [name, raw] = pair.split("~")
            const dimension = PROFILE.find((one) => one === name)
            if (!dimension) continue
            const value = Number(raw)
            const question = dimensions[dimension][0]
            if (!Number.isFinite(value) || value < question.lowest || value > question.highest) continue
            values[dimension] = value
        }
        return Object.keys(values).length >= CARD_LEAST ? values : null
    }

    function downloadCard(values) {
        drawCard(values).toBlob((blob) => {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "abyss-card.png"
            a.click()
            URL.revokeObjectURL(url)
        })
    }

    // The card is the same web as the one above the buttons, so it is only
    // made when one of them is pressed.
    function renderShare(into) {
        const values = cardValues()
        const note = into.querySelector(".share__note")

        into.querySelector(".share").classList.toggle("share--waiting", !values)
        note.classList.remove("share__note--done")
        // A card wants CARD_LEAST axes; a battery with fewer never earns one, and
        // is not told to keep answering for it.
        note.textContent = values || PROFILE.length < CARD_LEAST ? "" : "Finish a few more dimensions to unlock your card."
        if (!values) return

        into.querySelector(".share__download").onclick = () => downloadCard(values)
        into.querySelector(".share__copy").onclick = () => {
            const link = cardLink(values)
            const said = () => {
                note.textContent = "Link copied. Whoever opens it sees this card, and can take the test themselves."
                note.classList.add("share__note--done")
            }
            if (navigator.clipboard) navigator.clipboard.writeText(link).then(said, () => (note.textContent = link))
            else note.textContent = link
        }
    }

    // Somebody else's card, opened from a link: nothing is recorded.
    function showVisit(values) {
        $("visit-note").textContent =
            "Somebody has shared " + Object.keys(values).length + " of their dimensions with you, drawn against the average person. Take the test to see your own."
        $("visit-card").innerHTML = ""
        $("visit-card").appendChild(drawCard(values))
        showScreen("card")
    }

    // Drawn in two places — the panel during the run and the last screen — so
    // it is handed the one to fill and finds its parts by class.
    function renderProfile(into) {
        const drawn = drawSpider(into.querySelector(".profile__web"), PROFILE)
        const key = into.querySelector(".profile__legend")
        key.innerHTML = ""
        if (drawn.compared) key.appendChild(legend(drawn.colour))

        // A battery may hold no normed scale at all, and then there is no web
        // to fill in rather than one with nothing revealed.
        into.querySelector(".profile__note").textContent = !PROFILE.length
            ? "This version of the test draws no profile web."
            : drawn.found === PROFILE.length
              ? "All " + PROFILE.length + " dimensions revealed."
              : drawn.found + " of " + PROFILE.length + " dimensions revealed. Keep answering to fill in the rest."

        renderShare(into)
    }

    // A taste of the far end, for the landing page: the figures the levels
    // close on, each drawn from the same stand-ins a locked level is drawn
    // from, so every one is nobody's result — and unblurred, since a figure
    // with nothing earned in it has nothing to hide. Each is the figure alone,
    // without the standings and readings that only mean something once
    // earned. Returns the figures, uncaptioned — the page says "examples of
    // feedback" once, over all of them; app.js cycles them.
    function renderShowcase() {
        const slides = []
        const slide = (figure) => {
            if (figure) slides.push(figure)
        }
        const fresh = () => document.createElementNS(SVG, "svg")

        const web = fresh()
        drawSpider(web, PROFILE, true)
        slide(web)

        if (known("Bodily Awareness")) {
            const body = fresh()
            soma.drawSoma(body, true)
            slide(body)
        }
        // The climb's bar chart rather than its hill: the hill wants its bars
        // beside it to be read, and the bars stand on their own. The
        // temperament plane rather than the sea, which is too much picture for
        // a frame this size.
        if (known("Emotional Intensity")) slide(climb.renderBars(true))
        if (known("Extraversion")) slide(theories.renderOldTheories(true).querySelector("svg.theory__figure"))
        if (known("Sage")) slide(wheel.renderWheel(true).querySelector("svg"))
        if (known("Verbal")) slide(reasoning.renderReasoning(true).querySelector("svg"))
        return slides
    }

    /* -------------------------- the shelf's badges ------------------------ */

    // A badge shows one square of a figure, in the figure's own coordinates:
    // where to look, and how much of it to keep. The figure is redrawn into
    // that square rather than scaled down into it, so a badge is a detail of
    // the person's own drawing at full sharpness rather than a thumbnail of
    // the whole — which at 58 pixels would be a smudge. The numbers are read
    // against the constants the figure file draws with, and a crop that falls
    // somewhere else is a figure whose geometry has moved.
    function crop(figure, x, y, side) {
        if (!figure) return null

        figure.setAttribute("viewBox", [x - side / 2, y - side / 2, side, side].join(" "))
        // Fill the square and let it clip.
        figure.setAttribute("preserveAspectRatio", "xMidYMid slice")
        // The button around it carries the label; the crop is decoration.
        figure.removeAttribute("role")
        figure.setAttribute("aria-hidden", "true")
        return figure
    }

    const figureIn = (built, selector) => built.querySelector(selector || "svg")

    // A badge that is a mark rather than a drawing: the star sign, the robot.
    function emblem(mark) {
        const token = document.createElement("span")
        token.className = "shelf__badge-emblem"
        token.textContent = mark
        return token
    }

    // The figure a finished level closed on, cropped to a square: the badge
    // the shelf mints for that level. The dispatch is `renderResults`'s, read
    // at the size of a token — a figure stands in for a questionnaire, and
    // the first of this level's questionnaires to name one is what the level
    // looks like. The drawing is pulled back out of the section its figure
    // builds, the way `renderShowcase` does; the two figures that are not
    // drawings hand back an emblem of their own instead. Null for a level
    // with nothing drawn on it, which is a badge of its number alone.
    function renderBadge(level) {
        for (const name of RUN) {
            if (!onLevel(dimensionsIn(name), level)) continue

            // The walker, with the hill they are on and the weather over it.
            if (climb.CLIMB_OF.indexOf(name) !== -1) {
                if (!climb.climbed()) continue
                return crop(figureIn(climb.renderClimb(false)), 115, 295, 150)
            }
            // The chart of the `regulation` block is HTML, and names and bars
            // cannot be read this small: the two organs stand for it instead.
            if (heads.HEADS_OF.indexOf(name) !== -1) {
                if (!heads.headed()) continue
                return heads.badge()
            }
            // The point on the plane and the quadrant round it, kept inside
            // the plane so a point near an edge does not crop into nothing.
            if (stance.STANCE_OF.indexOf(name) !== -1) {
                if (!stance.ready()) continue
                const at = stance.youAt().map((one) => Math.min(250, Math.max(70, one)))
                return crop(figureIn(stance.renderStance(false), "svg.stance__plane"), at[0], at[1], 140)
            }
            if (name === archetype.ARCHETYPE_OF) {
                if (!archetype.aiArchetype()) continue
                return archetype.badge()
            }
            if (name === wheel.WHEEL_OF) {
                if (!wheel.leading().length) continue
                return crop(figureIn(wheel.renderWheel(false)), 220, 176, 220)
            }
            // The four arms out of the centre, which is the whole of what the
            // compass says: its names are room round the shape.
            if (name === reasoning.REASONING_OF) {
                if (!reasoning.ready()) continue
                return crop(figureIn(reasoning.renderReasoning(false)), 260, 160, 252)
            }
            // The pool the torch throws, which is the lit part of the sea and
            // the part the creature is in.
            if (name === sea.SEA) return crop(figureIn(sea.renderSea(false)), 180, 155, 130)
            // The head's ring, found on the drawing rather than worked out:
            // the body is as deep as the readings beside it need, so where
            // its organs fall is not a share of anything fixed.
            if (name === soma.SOMA) {
                const figure = document.createElementNS(SVG, "svg")
                soma.drawSoma(figure, false)
                const ring = figure.querySelector("circle")
                if (!ring) continue
                return crop(figure, Number(ring.getAttribute("cx")), Number(ring.getAttribute("cy")), 2 * (Number(ring.getAttribute("r")) + 16))
            }
            // The star sign, which is the one reading in the app that is
            // already a single mark — and the temperament plane where there
            // is no birthday to read a sign from, which is a battery without
            // the first demographics.
            if (name === theories.OLD_THEORIES_OF) {
                const built = theories.renderOldTheories(false)
                const glyph = built.querySelector(".theory__glyph")
                if (glyph) return emblem(glyph.textContent)
                return crop(figureIn(built, "svg.theory__figure"), 100, 100, 200)
            }

            if (CHARTS.indexOf(name) !== -1) {
                const owned = dimensionsOf(name)
                if (!owned.length) continue
                const figure = document.createElementNS(SVG, "svg")
                const drawn = drawSpider(figure, owned)
                return crop(figure, drawn.at.x, drawn.at.y, 2 * (drawn.at.r + 14))
            }
        }
        return null
    }

    /* ---------------------------- what was voted on ----------------------- */

    // Every key a vote can be filed under, in the order the results read, so
    // the saved file carries the whole set with `null` against the unvoted and
    // a run that stopped early has the same shape as one that finished. It
    // follows the dispatch in `renderResults`: a figure standing in for a
    // questionnaire names its own key; elsewhere a vote follows a prediction.
    function feedbackKeys() {
        const keys = []
        const from = {}
        // Two readings filing under one key would quietly share a vote, and
        // nothing downstream could tell them apart — the same fault `levelKey`
        // refuses in app.js, and the reason a dimension that is fed back wants
        // a `key` written beside its norms rather than one derived from the
        // words on screen.
        const add = (key, name) => {
            if (from[key] !== undefined && from[key] !== name) {
                throw new Error('two readings file under "' + key + '": ' + from[key] + " and " + name)
            }
            if (keys.indexOf(key) === -1) keys.push(key)
            from[key] = name
        }

        for (const name of RUN) {
            if (climb.CLIMB_OF.indexOf(name) !== -1) {
                if (name === CLIMB_FIRST) add(climb.CLIMB_KEY, climb.CLIMB_KEY)
            } else if (heads.HEADS_OF.indexOf(name) !== -1) {
                if (name === HEADS_FIRST) {
                    add(heads.HEART_KEY, heads.HEART_KEY)
                    add(heads.MIND_KEY, heads.MIND_KEY)
                }
            } else if (stance.STANCE_OF.indexOf(name) !== -1) {
                if (name === STANCE_FIRST) {
                    add(stance.STANCE_KEY, stance.STANCE_KEY)
                    add(stance.BELIEFS_KEY, stance.BELIEFS_KEY)
                }
            } else if (name === archetype.ARCHETYPE_OF) add(archetype.ARCHETYPE_KEY, archetype.ARCHETYPE_KEY)
            else if (name === wheel.WHEEL_OF) add(wheel.WHEEL_KEY, wheel.WHEEL_KEY)
            else if (name === reasoning.REASONING_OF) add(reasoning.REASONING_KEY, reasoning.REASONING_KEY)
            else if (name === sea.SEA) add(sea.SEA_KEY, sea.SEA_KEY)
            else if (name === theories.OLD_THEORIES_OF) {
                // The star card is read off the birthday, which a battery
                // without the first demographics never asks.
                if (RUN.indexOf(theories.STARS_FROM) !== -1) add(theories.STARS_KEY, theories.STARS_KEY)
                add(theories.TEMPERAMENT_KEY, theories.TEMPERAMENT_KEY)
            } else {
                for (const dimension of dimensionsOf(name)) if (normOf(dimension).interpretations) add(feedbackKey(dimension), dimension)
            }
        }
        return keys
    }

    // Written in at the start: the object handed over is the one the file is
    // made of, so voting only ever replaces a null.
    for (const key of feedbackKeys()) if (feedback[key] === undefined) feedback[key] = null

    return {
        renderShowcase: renderShowcase,
        renderResults: renderResults,
        renderTeaser: renderTeaser,
        renderBadge: renderBadge,
        sealSections: sealSections,
        openSections: openSections,
        renderProfile: renderProfile,
        profileShare: profileShare,
        readCardLink: readCardLink,
        showVisit: showVisit,
        hideTip: hideTip,
    }
}
