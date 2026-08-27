/* =========================================================================
   Everything that reads a score back: the spider charts, the reading of each
   dimension, the PHQ-4 severity, the card, and the way a finished level opens
   one section at a time.

   Nothing here walks the run or records anything. It is handed the engine —
   the questions, the scores and the two pieces of chrome a result arrives
   with — by app.js, and hands back the few functions app.js calls.
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
    const showScreen = engine.showScreen
    const burst = engine.burst
    const still = engine.still

    /* ---------------------------- spider chart --------------------------- */

    // The dimensions of one questionnaire, in the order written. A chart shows
    // all of them, so the ones still locked keep their place on the web.
    // The dimensions of a questionnaire that have something to say. A
    // dimension with no `norms` is not one of them: there is nothing to place
    // it against, so it earns no percentile, no standing and no prediction,
    // and a bare number is worse than silence to the person who gave it.
    // Writing the norms is what puts a scale into the results.
    function dimensionsOf(name) {
        return dimensionOrder.filter((dimension) => dimensions[dimension][0].questionnaire === name && normOf(dimension))
    }

    const SVG = "http://www.w3.org/2000/svg"

    function draw(shape, attributes) {
        const element = document.createElementNS(SVG, shape)
        for (const name of Object.keys(attributes)) element.setAttribute(name, attributes[name])
        return element
    }

    function normOf(dimension) {
        const norms = QUESTIONNAIRES[dimensions[dimension][0].questionnaire].norms
        return norms && norms[dimension]
    }

    // How far along its axis a value sits, as a share of the axis. Dimensions
    // are on different scales, so each is measured against its own.
    function reachOf(dimension, value) {
        const question = dimensions[dimension][0]
        return (value - question.lowest) / (question.highest - question.lowest)
    }

    // Where someone stands against the norms: "higher than 73%" above the
    // middle, "lower than 65%" below it.
    function comparison(dimension) {
        const norm = normOf(dimension)
        if (!norm) return null

        const proportion = percentile(score(dimension), norm)
        // Kept off 0 and 100, which read as absolutes rather than estimates.
        const share = Math.min(99, Math.max(1, Math.round(proportion * 100)))

        return {
            proportion: proportion,
            direction: share < 50 ? "lower" : "higher",
            share: share < 50 ? 100 - share : share,
        }
    }

    function summarise(dimension) {
        const standing = comparison(dimension)
        return standing
            ? dimension + " — " + standing.direction + " than " + standing.share + "% of people"
            : dimension + ": " + score(dimension).toFixed(1)
    }

    // A tooltip for the points, shared by every chart.
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

    // A stand-in figure for a level still locked. Fixed for a given dimension
    // and built from its name rather than from any answer: it is there to be
    // blurred and show the shape of what is coming, and means nothing.
    function teaseValue(dimension) {
        const question = dimensions[dimension][0]
        let hash = 0
        for (let i = 0; i < dimension.length; i++) hash = (hash * 31 + dimension.charCodeAt(i)) % 9973
        const reach = 0.35 + (hash % 55) / 100
        return question.lowest + reach * (question.highest - question.lowest)
    }

    // The chart grows when it has to carry every dimension at once. The
    // viewBox is wider than the web itself, to leave the labels room. Drawn as
    // a `tease`, it stands in for results not yet unlocked.
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

        // Rings, as a reference for how far out a point sits.
        for (let ring = 1; ring <= 3; ring++) {
            const corners = list.map((_, position) => pointAt(position, (radius * ring) / 3).join(","))
            chart.appendChild(draw("polygon", { class: "chart__ring", points: corners.join(" ") }))
        }

        list.forEach((dimension, position) => {
            const [x, y] = pointAt(position, radius)
            chart.appendChild(draw("line", { class: "chart__axis", x1: centreX, y1: centreY, x2: x, y2: y }))

            // The dimension's name, at the far end of its axis.
            const [labelX, labelY] = pointAt(position, radius + 22)
            const anchor = Math.abs(labelX - centreX) < 8 ? "middle" : labelX > centreX ? "start" : "end"
            const value = tease ? teaseValue(dimension) : score(dimension)
            const label = draw("text", {
                class: "chart__label" + (value === undefined ? " chart__label--awaiting" : ""),
                x: labelX,
                y: labelY,
                "text-anchor": anchor,
                "dominant-baseline": "middle",
            })

            const words = dimension.split(" ")
            words.forEach((word, line) => {
                const part = draw("tspan", { x: labelX, dy: line === 0 ? (words.length > 1 ? "-0.55em" : "0") : "1.15em" })
                part.textContent = word
                label.appendChild(part)
            })
            chart.appendChild(label)

            // Where the average person sits on this axis.
            const norm = normOf(dimension)
            if (norm) average.push(pointAt(position, reachOf(dimension, norm.mean) * radius))

            // A point appears as soon as the dimension is complete.
            if (value === undefined) return
            found.push({
                dimension: dimension,
                position: position,
                spot: pointAt(position, reachOf(dimension, value) * radius),
                colour: dimensions[dimension][0].color,
            })
        })

        // The average person, dashed, underneath everything else. Drawn across
        // every axis, including the ones still locked.
        const compared = average.length === list.length && list.length > 2

        if (compared) {
            chart.appendChild(
                draw("polygon", {
                    class: "chart__average",
                    points: average.map((spot) => spot.join(",")).join(" "),
                })
            )
        }

        // Your own shape. Complete, it closes into a filled polygon; partial,
        // only neighbouring dimensions are joined, so a locked dimension
        // leaves a gap rather than a line across the middle of the chart.
        const shape = "--chart: " + (single ? found[0] && found[0].colour : "var(--accent)")

        if (found.length === list.length && list.length > 2) {
            chart.appendChild(
                draw("polygon", {
                    class: "chart__area",
                    points: found.map((one) => one.spot.join(",")).join(" "),
                    style: shape,
                })
            )
        } else {
            const spots = {}
            for (const one of found) spots[one.position] = one.spot

            for (let position = 0; position < list.length; position++) {
                const next = (position + 1) % list.length
                if (next === position || !spots[position] || !spots[next]) continue

                chart.appendChild(
                    draw("line", {
                        class: "chart__link",
                        x1: spots[position][0],
                        y1: spots[position][1],
                        x2: spots[next][0],
                        y2: spots[next][1],
                        style: shape,
                    })
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

            // A teased point stands for nothing, so it says nothing either.
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

    // Says which line is which, wherever the average person has been drawn.
    function legend(colour) {
        const key = document.createElement("p")
        key.className = "legend"
        key.innerHTML =
            '<span class="legend__item"><i class="legend__you" style="--chart: ' +
            (colour || "var(--accent)") +
            '"></i>You</span><span class="legend__item"><i class="legend__average"></i>The average person</span>'
        return key
    }

    /* --------------------- interoception, as a body ----------------------- */

    // The MINT is not a shape on a web: it is a body. Awareness sits in the
    // head, visceroception in the chest, and clarity is the cord between them —
    // how much of what the body says arrives anywhere it can be read. Each is a
    // ring filled to where the score sits on its own scale, and a locked level
    // draws the same body from `teaseValue`, blurred like everything else.
    const BRAIN = {
        body:
            "M-30 2 C-30 -18, -16 -30, 0 -30 C16 -30, 30 -18, 30 2 C30 15, 21 25, 8 26" +
            " L8 37 L-8 37 L-8 26 C-21 25, -30 15, -30 2 Z",
        folds: ["M0 -30 L0 26", "M-17 -17 C-6 -11, -6 -1, -17 5", "M17 -17 C6 -11, 6 -1, 17 5"],
    }

    const HEART = {
        body: "M0 31 C-27 11, -35 -8, -21 -21 C-11 -29, -1 -23, 0 -14 C1 -23, 11 -29, 21 -21 C35 -8, 27 11, 0 31 Z",
    }

    const SOMA_RING = 58 // radius of the ring round an organ
    const SOMA_LABEL = 88 // how far right of it the words sit
    const SOMA_WRAP = 46 // characters a line of the reading runs to
    const SOMA_LINE = 15.6 // what a line of it takes, at 12.5px and 1.25em
    const SOMA_VOTES = 34 // the row of buttons under it, and the air above them
    // The three readings are stacked down the figure, each with room for its own
    // name, its standing, three lines of reading and the votes on it.
    const HEAD_Y = 120
    const CHEST_Y = 420
    const CORD_TOP = 190
    const CORD_END = 350
    const SOMA_DEEP = 540 // the whole of it, top to bottom
    const AWAITING = "#565c70" // an organ with nothing in it yet

    // SVG text does not wrap, so the reading is broken into lines here.
    function lines(text, most) {
        const out = [""]
        for (const word of text.split(" ")) {
            const line = out.length - 1
            if (out[line] && (out[line] + " " + word).length > most) out.push(word)
            else out[line] = out[line] ? out[line] + " " + word : word
        }
        return out
    }

    // Everything said about one reading, beside the organ it belongs to: what
    // it is, where it stands against everybody else in one plain sentence, and
    // what tends to follow from standing there. The figure carries all of it —
    // there are no rows underneath the MINT.
    function somaLabel(chart, dimension, y, value, tease) {
        const x = 150 + SOMA_LABEL
        const standing = value === undefined || tease ? null : comparison(dimension)
        const norm = normOf(dimension)

        const name = draw("text", { class: "soma__name", x: x, y: y - 26 })
        name.textContent = dimension.toUpperCase()
        chart.appendChild(name)

        if (value === undefined) {
            const waiting = draw("text", { class: "soma__unit", x: x, y: y })
            waiting.textContent = "not yet answered"
            return chart.appendChild(waiting)
        }

        // One sentence, one size. A teased organ gets the shape of it and no
        // figure that could be read.
        const said = draw("text", { class: "soma__reading", x: x, y: y })
        said.textContent = standing
            ? standing.direction + " than " + standing.share + "% of people"
            : "your score is " + value.toFixed(1) + " out of " + dimensions[dimension][0].highest
        chart.appendChild(said)

        // And what that tends to mean, where the norms carry a reading of it.
        const reading = norm && norm.interpretations && norm.interpretations[tercile(standing ? standing.proportion : 0.5)]
        if (!reading) return

        const broken = lines(sentence(reading), SOMA_WRAP)
        const told = draw("text", { class: "soma__told", x: x, y: y + 24 })

        broken.forEach((line, at) => {
            const part = draw("tspan", { x: x, dy: at === 0 ? 0 : "1.25em" })
            part.textContent = line
            told.appendChild(part)
        })
        chart.appendChild(told)

        // Whether it lands, directly under the reading it is about. The figure
        // says everything this questionnaire has to say, so it takes the answer
        // to it too — as the same pair of buttons every other prediction gets,
        // held in the figure rather than drawn in it.
        const holder = draw("foreignObject", {
            class: "soma__votes",
            x: x,
            y: y + 26 + (broken.length - 1) * SOMA_LINE,
            width: 300,
            height: SOMA_VOTES,
        })

        holder.appendChild(voteButtons(dimension))
        chart.appendChild(holder)
    }

    // Where the average person sits on the same ring, so the comparison is on
    // the figure and not only in the words beside it.
    function somaMean(chart, dimension, y) {
        const norm = normOf(dimension)
        if (!norm) return

        // The ring is drawn from the top, and so is this.
        const angle = 2 * Math.PI * reachOf(dimension, norm.mean) - Math.PI / 2
        const tick = draw("line", {
            class: "soma__mean",
            x1: 150 + Math.cos(angle) * (SOMA_RING - 9),
            y1: y + Math.sin(angle) * (SOMA_RING - 9),
            x2: 150 + Math.cos(angle) * (SOMA_RING + 9),
            y2: y + Math.sin(angle) * (SOMA_RING + 9),
        })

        tick.appendChild(draw("title", {})).textContent = "The average person"
        chart.appendChild(tick)
    }

    function somaOrgan(chart, dimension, y, shape, colour, tease) {
        const value = tease ? teaseValue(dimension) : score(dimension)
        const held = value !== undefined
        const round = 2 * Math.PI * SOMA_RING
        const shade = "--chart: " + (held ? colour : AWAITING)

        chart.appendChild(draw("circle", { class: "soma__track", cx: 150, cy: y, r: SOMA_RING }))

        if (held) {
            chart.appendChild(
                draw("circle", {
                    class: "soma__ring",
                    cx: 150,
                    cy: y,
                    r: SOMA_RING,
                    style: shade,
                    "stroke-dasharray": round.toFixed(1),
                    "stroke-dashoffset": (round * (1 - reachOf(dimension, value))).toFixed(1),
                    transform: "rotate(-90 150 " + y + ")",
                })
            )
        }

        somaMean(chart, dimension, y)

        const organ = draw("g", { class: "soma__organ", style: shade, transform: "translate(150 " + y + ")" })
        organ.appendChild(draw("path", { class: "soma__icon", d: shape.body }))
        for (const fold of shape.folds || []) organ.appendChild(draw("path", { class: "soma__fold", d: fold }))

        // A teased organ stands for nothing, so it says nothing either.
        if (held && !tease) {
            const text = summarise(dimension)
            organ.appendChild(draw("title", {})).textContent = text
            organ.addEventListener("mouseenter", () => showTip(organ, text))
            organ.addEventListener("mouseleave", hideTip)
        }

        chart.appendChild(organ)
        somaLabel(chart, dimension, y, held ? value : undefined, tease)
    }

    // What passes between them, filled from the head down as far as clarity
    // goes: the rest of the cord stays dark.
    function somaCord(chart, dimension, colour, tease) {
        const value = tease ? teaseValue(dimension) : score(dimension)
        const norm = normOf(dimension)
        const held = value !== undefined
        const run = CORD_END - CORD_TOP

        chart.appendChild(draw("line", { class: "soma__cord", x1: 150, y1: CORD_TOP, x2: 150, y2: CORD_END }))

        // The rungs make it a nerve rather than a wire.
        for (let at = 1; at <= 4; at++) {
            const y = CORD_TOP + (run * at) / 5
            chart.appendChild(draw("line", { class: "soma__rung", x1: 141, y1: y, x2: 159, y2: y }))
        }

        if (held) {
            chart.appendChild(
                draw("line", {
                    class: "soma__signal",
                    style: "--chart: " + colour,
                    x1: 150,
                    y1: CORD_TOP,
                    x2: 150,
                    y2: CORD_TOP + run * reachOf(dimension, value),
                })
            )
        }

        // How far the average person's signal gets.
        if (norm) {
            const y = CORD_TOP + run * reachOf(dimension, norm.mean)
            const tick = draw("line", { class: "soma__mean", x1: 137, y1: y, x2: 163, y2: y })
            tick.appendChild(draw("title", {})).textContent = "The average person"
            chart.appendChild(tick)
        }

        somaLabel(chart, dimension, CORD_TOP + run / 2, held ? value : undefined, tease)
    }

    function drawSoma(chart, tease) {
        chart.setAttribute("viewBox", "0 0 560 " + SOMA_DEEP)
        chart.classList.add("soma")
        chart.innerHTML = ""

        somaCord(chart, "Bodily Clarity", "#a78bfa", tease)
        somaOrgan(chart, "Bodily Awareness", HEAD_Y, BRAIN, "#22d3ee", tease)
        somaOrgan(chart, "Bodily Sensitivity", CHEST_Y, HEART, "#e0457b", tease)
    }

    /* ---------------------------- PHQ-4 severity -------------------------- */

    // The PHQ-4 is read from sums rather than averages: the four anxiety and
    // depression items together give a distress score out of 12, and either
    // pair reaching 3 screens positive for what it measures.
    const PHQ4_CUTOFF = 3
    const PHQ4_BANDS = [
        { upto: 2, name: "normal" },
        { upto: 5, name: "mild" },
        { upto: 8, name: "moderate" },
        { upto: 12, name: "severe" },
    ]

    // The extra response option of the refined PHQ-4 is worth half a point,
    // so a sum is not always whole.
    function tidy(value) {
        return value % 1 === 0 ? String(value) : value.toFixed(1)
    }

    // What the distress score comes to, and which pair of items — if either —
    // reaches the cut-off. Null until all four are answered.
    function phq4Reading() {
        const anxiety = total("Anxiety")
        const depression = total("Depression")
        if (anxiety === undefined || depression === undefined) return null

        const distress = anxiety + depression
        const severity = PHQ4_BANDS.find((band) => distress <= band.upto).name
        const reached = []

        if (anxiety >= PHQ4_CUTOFF) reached.push("anxiety")
        if (depression >= PHQ4_CUTOFF) reached.push("depression")

        // A pair can only reach the cut-off if the total is at least 3, so
        // "normal" never pairs up with a positive screen.
        return (
            "Your total distress score is <b>" +
            tidy(distress) +
            " out of 12</b>, which falls in the <b>" +
            severity +
            "</b> range. " +
            (reached.length
                ? "Your " +
                  reached.join(" and ") +
                  " items reach the cut-off of " +
                  PHQ4_CUTOFF +
                  ", so you might be suffering from " +
                  severity +
                  " " +
                  reached.join(" and ") +
                  "."
                : "Neither the anxiety nor the depression items reach the cut-off of " + PHQ4_CUTOFF + ".") +
            " This is a screening questionnaire, not a diagnosis."
        )
    }

    // Stands in for the PHQ-4 reading while the level is locked, blurred.
    const PHQ4_TASTE =
        "Your total distress score is <b>0 out of 12</b>, which falls in the <b>normal</b> range. Neither the anxiety" +
        " nor the depression items reach the cut-off of 3. This is a screening questionnaire, not a diagnosis."

    /* ------------------------------ the card ----------------------------- */

    // The card is the whole web, on one image: every dimension the run has, on
    // the same geometry the profile panel draws. Sharing it is a deliberate act
    // and it carries everything — which is why the link is only ever built by
    // pressing the button that says so.
    const CARD_WIDTH = 1200
    const CARD_HEIGHT = 630
    const CARD_LEAST = 3 // dimensions needed before there is a web to show

    // Every dimension answered so far. The card draws all of them and leaves a
    // gap where one is still unanswered, exactly as the profile web does.
    function cardValues() {
        const values = {}
        for (const dimension of dimensionOrder) {
            const value = score(dimension)
            if (value !== undefined) values[dimension] = value
        }
        return Object.keys(values).length >= CARD_LEAST ? values : null
    }

    // The whole card, drawn rather than laid out: it has to leave as one image.
    function drawCard(values) {
        const canvas = document.createElement("canvas")
        canvas.width = CARD_WIDTH
        canvas.height = CARD_HEIGHT
        canvas.className = "card__canvas"

        const c = canvas.getContext("2d")
        const sans = 'ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif'
        const serif = 'ui-serif, "Iowan Old Style", Georgia, serif'
        const held = dimensionOrder.filter((dimension) => values[dimension] !== undefined)

        // The water, and the light left in it.
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
        c.fillText(held.length + " OF " + dimensionOrder.length + " DIMENSIONS", CARD_WIDTH - 72, 78)
        c.textAlign = "left"
        c.letterSpacing = "0px"

        // The web itself, on the same maths as drawSpider.
        const centreX = 600
        const centreY = 362
        const radius = 176
        const spot = (position, distance) => {
            const angle = (Math.PI * 2 * position) / dimensionOrder.length - Math.PI / 2
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
            trace(
                dimensionOrder.map((_, position) => spot(position, (radius * ring) / 3)),
                true
            )
            c.stroke()
        }

        dimensionOrder.forEach((_, position) => {
            trace([[centreX, centreY], spot(position, radius)], false)
            c.stroke()
        })

        // The average person, dashed, under your own shape — but only when
        // there is one to draw on every axis. A dimension written without
        // norms has no mean to put here, and half a comparison is worse than
        // none, so the whole ring goes rather than a broken one.
        const comparable = dimensionOrder.every((dimension) => normOf(dimension))

        if (comparable) {
            c.setLineDash([6, 5])
            c.strokeStyle = "#767c92"
            c.lineWidth = 2
            trace(
                dimensionOrder.map((dimension, position) => spot(position, reachOf(dimension, normOf(dimension).mean) * radius)),
                true
            )
            c.stroke()
            c.setLineDash([])
        }

        // Your own shape. Complete, it closes; partial, only neighbouring
        // dimensions are joined, so a gap stays a gap.
        const yours = {}
        dimensionOrder.forEach((dimension, position) => {
            if (values[dimension] === undefined) return
            yours[position] = spot(position, reachOf(dimension, values[dimension]) * radius)
        })

        c.strokeStyle = "#7c5cff"
        c.lineWidth = 2.5
        c.lineJoin = "round"

        if (held.length === dimensionOrder.length) {
            trace(Object.values(yours), true)
            c.fillStyle = "rgba(124, 92, 255, 0.22)"
            c.fill()
            c.stroke()
        } else {
            for (let position = 0; position < dimensionOrder.length; position++) {
                const next = (position + 1) % dimensionOrder.length
                if (!yours[position] || !yours[next]) continue
                trace([yours[position], yours[next]], false)
                c.stroke()
            }
        }

        // A point in the colour of the questionnaire it came from.
        dimensionOrder.forEach((dimension, position) => {
            if (!yours[position]) return
            c.beginPath()
            c.arc(yours[position][0], yours[position][1], 5.5, 0, Math.PI * 2)
            c.fillStyle = dimensions[dimension][0].color || "#7c5cff"
            c.fill()
            c.strokeStyle = "#05070d"
            c.lineWidth = 2
            c.stroke()
        })

        // The names, at the far end of each axis, broken onto their own lines.
        c.font = "600 12px " + sans
        dimensionOrder.forEach((dimension, position) => {
            const [x, y] = spot(position, radius + 28)
            c.fillStyle = values[dimension] === undefined ? "#565c70" : "#cfd4e4"
            c.textAlign = Math.abs(x - centreX) < 8 ? "center" : x > centreX ? "left" : "right"
            const words = dimension.split(" ")
            words.forEach((word, line) => c.fillText(word, x, y + (line - (words.length - 1) / 2) * 15 + 4))
        })
        c.textAlign = "left"

        // Which line is which, and where the thing came from.
        c.font = "600 13px " + sans
        c.strokeStyle = "#7c5cff"
        c.lineWidth = 2.5
        trace(
            [
                [72, 596],
                [96, 596],
            ],
            false
        )
        c.stroke()
        c.fillStyle = "#868fa6"
        c.fillText("You", 106, 601)

        c.setLineDash([6, 5])
        c.strokeStyle = "#767c92"
        c.lineWidth = 2
        trace(
            [
                [166, 596],
                [190, 596],
            ],
            false
        )
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

    // The card as a link, carrying every dimension that is on it. Each is
    // checked against its own scale on the way back out.
    function cardLink(values) {
        const pairs = Object.keys(values)
            .map((dimension) => dimension + "~" + values[dimension].toFixed(2))
            .join(",")
        return location.origin + location.pathname + "?card=1&s=" + encodeURIComponent(pairs)
    }

    function readCardLink() {
        const query = new URLSearchParams(location.search)
        if (query.get("card") !== "1" || !query.get("s")) return null

        const values = {}
        for (const pair of query.get("s").split(",")) {
            const [name, raw] = pair.split("~")
            // Only a dimension this build knows about, on its own scale: a link
            // is somebody else's text, and nothing else gets drawn.
            const dimension = dimensionOrder.find((known) => known === name)
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

    // The two ways of taking the card with you, under the web it is drawn from.
    // The card is the same web, so it is not shown again here — it is only made
    // when one of these is pressed.
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

    // Somebody else's card, opened from a link. Their scores are all this page
    // has: nothing is recorded, and the test underneath is untouched.
    function showVisit(values) {
        $("visit-note").textContent =
            "Somebody has sent you " +
            Object.keys(values).length +
            " of their own dimensions, drawn against the average person. Take the test and see your own web come in."
        $("visit-card").innerHTML = ""
        $("visit-card").appendChild(drawCard(values))
        showScreen("card")
    }

    // Everything on one web, with the ways of keeping it underneath. It is drawn
    // in two places — the panel during the run, and the last screen once there
    // is nothing left to answer — so it is handed the one to fill in.
    function renderProfile(into) {
        const drawn = drawSpider(into.querySelector(".profile__web"), dimensionOrder)
        const key = into.querySelector(".profile__legend")

        key.innerHTML = ""
        if (drawn.compared) key.appendChild(legend(drawn.colour))

        into.querySelector(".profile__note").textContent =
            drawn.found === dimensionOrder.length
                ? "All " + dimensionOrder.length + " dimensions revealed."
                : drawn.found +
                  " of " +
                  dimensionOrder.length +
                  " dimensions revealed — keep answering to fill in the rest."

        renderShare(into)
    }

    /* ---------------------------- results screen -------------------------- */

    // An interpretation is written as the continuation of "you ...", so it is
    // shown as a sentence spoken to the person reading it.
    function sentence(reading) {
        return reading.charAt(0).toUpperCase() + reading.slice(1)
    }

    // Agree / disagree on a prediction. Pressing the chosen one again clears it.
    function voteButtons(dimension) {
        const votes = document.createElement("div")
        votes.className = "votes"

        for (const vote of ["agree", "disagree"]) {
            const button = document.createElement("button")
            button.type = "button"
            button.className = "vote" + (feedback[dimension] === vote ? " vote--picked" : "")
            button.textContent = vote === "agree" ? "Agree" : "Disagree"
            button.setAttribute("aria-pressed", feedback[dimension] === vote ? "true" : "false")

            button.addEventListener("click", () => {
                if (feedback[dimension] === vote) delete feedback[dimension]
                else feedback[dimension] = vote

                for (const other of votes.children) {
                    const picked = feedback[dimension] === (other.textContent === "Agree" ? "agree" : "disagree")
                    other.classList.toggle("vote--picked", picked)
                    other.setAttribute("aria-pressed", picked ? "true" : "false")
                }
            })

            votes.appendChild(button)
        }

        return votes
    }

    // Where a score sits in the population, drawn: the bar runs from the bottom
    // of the distribution to the top, filled to the percentile, with the middle
    // marked so that "higher than 70%" has something to be higher than.
    function percentileBar(dimension, share) {
        const bar = document.createElement("div")
        bar.className = "bar"
        bar.style.setProperty("--chart", dimensions[dimension][0].color || "var(--accent)")
        bar.innerHTML =
            '<div class="bar__track"><div class="bar__fill" style="width:' +
            share +
            '%"></div><i class="bar__mean"></i><i class="bar__you" style="left:' +
            share +
            '%"></i></div><div class="bar__scale"><span>Lower</span><span>Average</span><span>Higher</span></div>'
        return bar
    }

    // One row per dimension: where the score stands against the population,
    // then the prediction that follows from it, where there is one.
    function resultRows(scored) {
        const rows = document.createElement("div")
        rows.className = "rows"

        for (const dimension of scored) {
            const standing = comparison(dimension)
            const norm = normOf(dimension)
            const reading = norm && norm.interpretations && norm.interpretations[tercile(standing.proportion)]
            const row = document.createElement("div")
            row.className = "row"

            row.innerHTML = standing
                ? '<p class="row__lead">Your score of <b>' +
                  dimension +
                  "</b> is " +
                  standing.direction +
                  " than <b>" +
                  standing.share +
                  "%</b> of people.</p>"
                : '<p class="row__lead"><b>' + dimension + "</b> — your score is " + score(dimension).toFixed(1) + ".</p>"

            if (standing) row.appendChild(percentileBar(dimension, Math.round(standing.proportion * 100)))

            if (reading) {
                const prediction = document.createElement("p")
                prediction.className = "row__reading"
                prediction.textContent = sentence(reading)
                row.appendChild(prediction)
                row.appendChild(voteButtons(dimension))
            }

            rows.appendChild(row)
        }

        return rows
    }

    // The same rows a level will hold once it opens, with everything that has
    // to be earned blurred out: the dimension is named, its standing and the
    // prediction that comes with it are not.
    function lockedRows(list) {
        const rows = document.createElement("div")
        rows.className = "rows"

        for (const dimension of list) {
            const norm = normOf(dimension)
            const row = document.createElement("div")
            row.className = "row"

            row.innerHTML =
                '<p class="row__lead">Your score of <b>' +
                dimension +
                '</b> is <span class="blank">higher than 00% of people</span>.</p>'

            // The bar a finished level would show, standing at nothing.
            if (norm) {
                const bar = percentileBar(dimension, 50)
                bar.classList.add("blank")
                row.appendChild(bar)
            }

            // Only the dimensions that will carry a prediction show one here.
            if (norm && norm.interpretations) {
                const prediction = document.createElement("p")
                prediction.className = "row__reading blank"
                prediction.textContent = sentence(norm.interpretations.mid)
                row.appendChild(prediction)
            }

            rows.appendChild(row)
        }

        return rows
    }

    // A section per questionnaire of this level that has something to show —
    // or, for a level not yet finished, a blurred taste of all of them.
    function renderResults(into, level, locked) {
        into.innerHTML = ""

        if (locked) {
            const progress = levelProgress(level)
            const left = progress.size - progress.answered
            const note = document.createElement("p")
            note.className = "taste"
            note.innerHTML = "<b>" + left + " more answer" + (left === 1 ? "" : "s") + "</b> unlocks this"
            into.appendChild(note)
        }

        for (const name of RUN) {
            // `dimensionsOf` leaves out anything with no norms behind it, so a
            // scale written without them opens no rows and no section at all.
            const inLevel = dimensionsOf(name).filter((dimension) => dimensions[dimension][0].level === level)
            const scored = inLevel.filter((dimension) => score(dimension) !== undefined)
            const shown = locked ? inLevel : scored
            if (!shown.length) continue

            const label = QUESTIONNAIRES[name].name || name
            const section = document.createElement("section")
            section.className = "result" + (locked ? " result--locked" : "")

            const heading = document.createElement("h2")
            heading.className = "result__name"
            heading.textContent = label
            section.appendChild(heading)

            const body = document.createElement("div")
            body.className = "result__body"

            // A questionnaire with a figure of its own opens with it, above the
            // reading of each dimension underneath: a spider chart for most,
            // and for the MINT a body.
            const charted = CHARTS.indexOf(name) !== -1

            if (charted || name === "mint") {
                const chart = document.createElement("div")
                // The body carries its own readings beside it, so it is given
                // the room to hold a sentence at a readable size.
                chart.className = "result__chart" + (charted ? "" : " result__chart--wide")
                const figure = document.createElementNS(SVG, "svg")
                figure.setAttribute("role", "img")
                figure.setAttribute(
                    "aria-label",
                    locked
                        ? "Blurred preview of your " + label.toLowerCase() + ", still locked"
                        : charted
                          ? "Spider chart of your " + label.toLowerCase() + " dimensions"
                          : "Your interoception: awareness in the head, visceroception in the chest, clarity between them"
                )
                chart.appendChild(figure)
                body.appendChild(chart)

                if (charted) {
                    const drawn = drawSpider(figure, dimensionsOf(name), locked)
                    if (drawn.compared) body.appendChild(legend(drawn.colour))
                } else {
                    drawSoma(figure, locked)
                }

                if (locked) {
                    const badge = document.createElement("span")
                    badge.className = "result__lock"
                    badge.textContent = "Locked"
                    chart.appendChild(badge)
                }
            }

            // The body says everything the MINT has to say on its own, votes
            // and all; every other questionnaire reads a row at a time under
            // its chart.
            if (name !== "mint") body.appendChild(locked ? lockedRows(shown) : resultRows(shown))

            // The PHQ-4 has a reading of its own, from the sum of its items.
            if (name === "phq4") {
                const reading = locked ? PHQ4_TASTE : phq4Reading()
                if (reading) {
                    const note = document.createElement("p")
                    note.className = "result__reading" + (locked ? " blank" : "")
                    note.innerHTML = reading
                    body.appendChild(note)
                }
            }

            section.appendChild(body)
            into.appendChild(section)
        }
    }

    /* -------------------------- opening what was won ---------------------- */

    // A level that has just been finished is not simply printed. Its sections
    // are held shut, then broken open one at a time, each with a spray of gold
    // out of the middle of it, and the way on arrives last of all.
    const OPEN_SETTLE = 300 // ms between scrolling to a section and opening it
    const OPEN_GAP = 900 // ms between one section opening and the next

    function sealSections(into, foot) {
        for (const section of into.querySelectorAll(".result")) section.classList.add("result--sealed")
        if (foot) foot.classList.add("level__foot--sealed")
    }

    function openSections(into, foot) {
        const sections = Array.prototype.slice.call(into.querySelectorAll(".result"))
        let hurried = false

        const unfoot = () => {
            if (!foot) return
            foot.classList.remove("level__foot--sealed")
        }

        // Everything at once, for anyone who would rather read than watch.
        const hurry = () => {
            hurried = true
            for (const section of sections) section.classList.remove("result--sealed")
            unfoot()
        }

        // Nothing is staged for anyone who has asked for less movement: the
        // level simply opens, all of it, at once.
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

            // A section opens where it can be watched: anything below the fold
            // is brought up first, and only then broken open.
            if (section.getBoundingClientRect().bottom > window.innerHeight) {
                section.scrollIntoView({ behavior: "smooth", block: "center" })
            }

            setTimeout(() => {
                section.classList.remove("result--sealed")
                section.classList.add("result--opening")
                burst(section, "#d9a441", { count: 26, reach: 150 })
                setTimeout(step, OPEN_GAP)
            }, OPEN_SETTLE)
        }

        // The way out is registered late on purpose: the click that waved the
        // paint past is still on its way up the page, and would otherwise be
        // caught here and skip the reveal it has just uncovered.
        setTimeout(() => {
            document.addEventListener("click", hurry, { once: true })
            step()
        }, 420)
    }

    /* ------------------------- what app.js may call ----------------------- */

    // The whole web with nobody on it: every dimension the run has, each at the
    // figure hashed from its own name, for the landing page to hold behind the
    // case for answering any of them. It is the same `tease` a locked level is
    // drawn from — it stands for no one, and the page keeps it out of focus.
    function renderExample(chart) {
        drawSpider(chart, dimensionOrder, true)
    }

    return {
        renderExample: renderExample,
        renderResults: renderResults,
        sealSections: sealSections,
        openSections: openSections,
        renderProfile: renderProfile,
        readCardLink: readCardLink,
        showVisit: showVisit,
        hideTip: hideTip,
    }
}
