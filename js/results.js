/* =========================================================================
   Everything that reads a score back. app.js hands `makeResults` the engine —
   the run, the scores, and the two pieces of chrome a result arrives with —
   and gets back the few functions it calls. Nothing here walks the run or
   records anything but the agree/disagree on a prediction.

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

    function summarise(dimension) {
        const standing = comparison(dimension)
        return standing ? dimension + ": " + standing.direction + " than " + standing.share + "% of people" : dimension + ": " + score(dimension).toFixed(1)
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

    // One pick out of a few. Pressing the chosen one again puts it back to
    // `null` rather than deleting it, since every key of `feedback` is written.
    function pickButtons(name, choices) {
        const key = filed(name)
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
        return pickButtons(dimension, VOTES)
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

    // The climb is one section for two questionnaires, rendered where the
    // first of them falls in the run and skipped where the other would.
    const CLIMB_FIRST = RUN.find((one) => climb.CLIMB_OF.indexOf(one) !== -1)

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
            chart.appendChild(draw("line", { class: "chart__axis", x1: centreX, y1: centreY, x2: x, y2: y }))

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
            if (norm) average.push(pointAt(position, reachOf(dimension, norm.mean) * radius))

            if (value === undefined) return
            found.push({ dimension: dimension, position: position, spot: pointAt(position, reachOf(dimension, value) * radius), colour: dimensions[dimension][0].color })
        })

        // The average person, dashed, under everything else — only when there
        // is a mean on every axis.
        const compared = average.length === list.length && list.length > 2
        if (compared) chart.appendChild(draw("polygon", { class: "chart__average", points: average.map((spot) => spot.join(",")).join(" ") }))

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
                style: "--chart: " + one.colour + "; animation-delay: " + one.position * 0.06 + "s",
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

        return { found: found.length, compared: compared, colour: single && found[0] ? found[0].colour : null }
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
    }

    // The foot of a finished level carries a taste of the next: the same
    // locked rendering with the rows and the note taken out — a blurred figure
    // is the hook, blurred rows only look like a page that failed to load — and
    // the count of answers still to go where the Locked badge was.
    function renderTeaser(into, level, title) {
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
        head.innerHTML = '<p class="level__next-word">Next</p><p class="level__next-title"></p>'
        head.lastChild.textContent = title
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
        if (foot) foot.classList.add("level__foot--sealed")
    }

    // Sections break open one at a time, each with a spray out of its middle,
    // and the way on arrives last. A click opens the rest at once.
    function openSections(into, foot) {
        const sections = Array.prototype.slice.call(into.querySelectorAll(".result"))
        let hurried = false

        const unfoot = () => foot && foot.classList.remove("level__foot--sealed")
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
                setTimeout(() => burst($("level-continue"), "#d9a441", { count: 20, reach: 70 }), 320)
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
    // `profile: false`.
    function onProfile(dimension) {
        const name = dimensions[dimension][0].questionnaire
        if (name === archetype.ARCHETYPE_OF || name === wheel.WHEEL_OF || climb.CLIMB_OF.indexOf(name) !== -1) return false
        if (QUESTIONNAIRES[name].profile === false) return false
        return !!normOf(dimension)
    }

    const PROFILE = dimensionOrder.filter(onProfile)

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

        // The average person only when there is a mean on every axis: half a
        // comparison is worse than none.
        if (PROFILE.every((dimension) => normOf(dimension))) {
            c.setLineDash([6, 5])
            c.strokeStyle = "#767c92"
            c.lineWidth = 2
            trace(PROFILE.map((dimension, position) => spot(position, reachOf(dimension, normOf(dimension).mean) * radius)), true)
            c.stroke()
            c.setLineDash([])
        }

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
        note.textContent = values ? "" : "Finish a few more dimensions to unlock your card."
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

        into.querySelector(".profile__note").textContent =
            drawn.found === PROFILE.length
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
        return slides
    }

    /* ---------------------------- what was voted on ----------------------- */

    // Every key a vote can be filed under, in the order the results read, so
    // the saved file carries the whole set with `null` against the unvoted and
    // a run that stopped early has the same shape as one that finished. It
    // follows the dispatch in `renderResults`: a figure standing in for a
    // questionnaire names its own key; elsewhere a vote follows a prediction.
    function feedbackKeys() {
        const keys = []
        const add = (name) => {
            const key = filed(name)
            if (keys.indexOf(key) === -1) keys.push(key)
        }

        for (const name of RUN) {
            if (climb.CLIMB_OF.indexOf(name) !== -1) {
                if (name === CLIMB_FIRST) add(climb.CLIMB_KEY)
            } else if (name === archetype.ARCHETYPE_OF) add(archetype.ARCHETYPE_KEY)
            else if (name === wheel.WHEEL_OF) add(wheel.WHEEL_KEY)
            else if (name === sea.SEA) add(sea.SEA_KEY)
            else if (name === theories.OLD_THEORIES_OF) {
                add(theories.STARS_KEY)
                add(theories.TEMPERAMENT_KEY)
            } else {
                for (const dimension of dimensionsOf(name)) if (normOf(dimension).interpretations) add(dimension)
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
        sealSections: sealSections,
        openSections: openSections,
        renderProfile: renderProfile,
        readCardLink: readCardLink,
        showVisit: showVisit,
        hideTip: hideTip,
    }
}
