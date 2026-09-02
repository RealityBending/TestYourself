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

    // Every dimension a questionnaire holds, in the order it was authored,
    // whether or not there is anything to place it against. Only the archetype
    // wheel wants them all — it reads its twelve against each other rather
    // than against other people — so everything else goes through
    // `dimensionsOf` below.
    function dimensionsIn(name) {
        return dimensionOrder.filter((dimension) => dimensions[dimension][0].questionnaire === name)
    }

    // The dimensions of a questionnaire that have something to say. A
    // dimension with no `norms` is not one of them: there is nothing to place
    // it against, so it earns no percentile, no standing and no prediction,
    // and a bare number is worse than silence to the person who gave it.
    // Writing the norms is what puts a scale into the results.
    function dimensionsOf(name) {
        return dimensionsIn(name).filter(normOf)
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

    // Where a value stands against a norm: "higher than 73%" above the
    // middle, "lower than 65%" below it. Split from `comparison` so a score
    // that has no dimension of its own — the faces below pool several — can
    // be read against a norm handed to it directly rather than looked up.
    function standFrom(value, norm) {
        const proportion = percentile(value, norm)
        // Kept off 0 and 100, which read as absolutes rather than estimates.
        const centile = Math.min(99, Math.max(1, Math.round(proportion * 100)))

        return {
            proportion: proportion,
            // The clamped percentile itself, before it is folded into a
            // direction: what a bar is filled to, so the bar and the words
            // beside it can never disagree at the extremes.
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

    // A stand-in figure for a level still locked, hashed from a name rather
    // than built from any answer: it is there to be blurred and show the
    // shape of what is coming, and means nothing. Takes its bounds directly
    // rather than reading them off `dimensions`, so it also serves a
    // composite that pools several dimensions and is not one of them itself.
    function teaseReach(name, lowest, highest) {
        let hash = 0
        for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 9973
        const reach = 0.35 + (hash % 55) / 100
        return lowest + reach * (highest - lowest)
    }

    function teaseValue(dimension) {
        const question = dimensions[dimension][0]
        return teaseReach(dimension, question.lowest, question.highest)
    }

    // The chart grows when it has to carry the whole profile at once. The
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
                // Two dimensions have one line between them, not one each way;
                // one has nothing to join at all.
                if (next === position || (next < position && list.length === 2)) continue
                if (!spots[position] || !spots[next]) continue

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
        // figure that could be read: the blur is only paint, so what stands in
        // for the sentence is the same nothing a locked row shows, never the
        // tease value written out. And a dimension the norms were ever taken
        // off would have no standing to say — it gets silence, the same as a
        // normless scale everywhere else, not a bare number.
        if (tease || standing) {
            const said = draw("text", { class: "soma__reading", x: x, y: y })
            said.textContent = tease ? "higher than 00% of people" : standing.direction + " than " + standing.share + "% of people"
            chart.appendChild(said)
        }

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

        // A teased reading is nobody's prediction, so there is nothing to
        // agree with — a locked figure carries no live buttons.
        if (tease) return

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

    /* ------------------------------ faces --------------------------------- */

    // Mood, Strain and Health read better as one glance each than as another
    // row of numbers, so together they close level 3 with a face apiece: sad
    // at one end of the scale, pleased at the other, on a ring that fills the
    // same way a MINT organ's does. Mood and Health are composites rather than
    // dimensions of their own — Mood because the PHQ-4's Anxiety and
    // Depression items have to stay apart for `total()` to read the way they
    // are written, Health because the SSS-8's four domains are real
    // dimensions of their own too — so each is read against a norm, and given
    // a general reading of its own, written here rather than in `content/`:
    // invented exactly as every other norm in this app is, in the same
    // `{ mean, sd, interpretations }` shape `normOf` already returns for one.
    const MOOD_NORM = {
        mean: 1.9,
        sd: 1.6,
        interpretations: {
            low: "your mood over the last couple of weeks has been steady, without much sign of anxiety or low spirits.",
            mid: "you've had a few anxious or low days over the last couple of weeks, about as often as most people do.",
            high: "anxiety or low mood have weighed on you more than most people report over the last couple of weeks — worth a word with someone, though this is not a diagnosis.",
        },
    }
    const HEALTH_NORM = {
        mean: 0.9,
        sd: 0.8,
        interpretations: {
            low: "your body has been quiet this week, with little in the way of pain, stomach trouble, breathlessness or fatigue.",
            mid: "you noticed the odd ache, upset stomach or tired stretch this week, about as often as most people do.",
            high: "your body has been making itself felt this week — pain, stomach trouble, breathlessness or fatigue turning up more than most people report, and worth a doctor's attention if it keeps up.",
        },
    }

    // Whether a dimension exists in this run at all — not merely whether it
    // has been answered yet. The three faces below name their dimensions
    // directly rather than discovering them through `dimensionsOf`, so unlike
    // everywhere else in this file they have to allow for one being missing
    // outright: a block left out of `content/timeline.js`, say, rather than a
    // block still in progress. `renderFaces` already skips a face whose value
    // is `undefined`, which is also what an unanswered dimension looks like —
    // so a questionnaire that never ran and one not yet finished are read the
    // same way, and the row simply narrows to whichever faces have something.
    function known(dimension) {
        return !!dimensions[dimension]
    }

    // Same shape as a real dimension's reading — a name, a value, the scale
    // it sits on, which way "better" runs, and a norm to stand it against —
    // whether the value comes straight from `score()` or is worked out here.
    // Each reading also says whether its dimensions `exist` in this run at
    // all, so a teased row can skip a face a finished level will never show.
    function moodFace() {
        const exists = known("Anxiety") && known("Depression")
        const anxiety = exists ? total("Anxiety") : undefined
        const depression = exists ? total("Depression") : undefined
        const value = anxiety === undefined || depression === undefined ? undefined : anxiety + depression
        return { key: "Mood", exists: exists, value: value, lowest: 0, highest: 12, worse: "high", norm: MOOD_NORM }
    }

    function strainFace() {
        const question = known("Strain") && dimensions["Strain"][0]
        return {
            key: "Strain",
            exists: !!question,
            value: question ? score("Strain") : undefined,
            lowest: question ? question.lowest : 0,
            highest: question ? question.highest : 1,
            worse: "high",
            norm: question ? normOf("Strain") : null,
        }
    }

    function healthFace() {
        const names = ["Pain", "Gastrointestinal", "Cardiopulmonary", "Fatigue"]
        const exists = names.every(known)
        const scores = exists ? names.map(score) : []
        const value = exists && scores.every((one) => one !== undefined)
            ? scores.reduce((sum, one) => sum + one, 0) / scores.length
            : undefined
        return { key: "Health", exists: exists, value: value, lowest: 0, highest: 4, worse: "high", norm: HEALTH_NORM }
    }

    // Mood, Strain and Health close level 3 as one section rather than three:
    // the PHQ-4, the Dissociation questionnaire (Strain, Sleep) and the SSS-8
    // each keep their items, their scoring and their place in the run, but
    // read back as this row of three instead of a chart and rows apiece.
    // `MOOD_HEALTH` is the readings, in the order they are shown; `RUN` still
    // carries all three questionnaire keys, so `renderResults` uses
    // `MOOD_HEALTH_OF` to find whichever of them comes first and render the
    // section there, skipping the other two where they would otherwise fall.
    const MOOD_HEALTH = [moodFace, strainFace, healthFace]
    const MOOD_HEALTH_OF = ["phq4", "Dissociation", "sss8"]

    // Whichever of the three comes first in the run is where the one section
    // renders; the run never changes, so it is found once.
    const MOOD_HEALTH_FIRST = RUN.find((one) => MOOD_HEALTH_OF.indexOf(one) !== -1)

    // The one questionnaire drawn as a body rather than a chart. With CHARTS
    // and MOOD_HEALTH_OF above, and ARCHETYPE_OF and WHEEL_OF below, the only
    // places the code names a questionnaire.
    const SOMA = "mint"

    // The same red-to-green mix `app.js` uses on a scale's own hover colours,
    // kept here rather than borrowed — the seam runs one way, so neither file
    // reaches across it for a helper this small.
    function mix(from, to, proportion) {
        const channels = [1, 3, 5].map((at) => {
            const start = parseInt(from.substr(at, 2), 16)
            const end = parseInt(to.substr(at, 2), 16)
            return Math.round(start + (end - start) * proportion)
        })
        return "rgb(" + channels.join(", ") + ")"
    }

    const FACE_RADIUS = 48
    const FACE_CENTRE = 60

    // The mouth alone carries the expression: a curve whose middle sits below
    // its own ends for a smile and above them for a frown, by how far `happy`
    // — 0 sad, 1 pleased — sits between the two.
    function faceMouth(cx, cy, happy) {
        const bow = 28 * happy - 14
        return "M" + (cx - 13) + " " + (cy + 12) + " Q" + cx + " " + (cy + 12 + bow) + " " + (cx + 13) + " " + (cy + 12)
    }

    // Where the average person's happiness lands on the same ring, ticked the
    // way a soma organ marks its mean.
    function faceMean(svg, meanHappy) {
        const angle = 2 * Math.PI * meanHappy - Math.PI / 2
        const cx = FACE_CENTRE
        const cy = FACE_CENTRE - 5
        svg.appendChild(
            draw("line", {
                class: "face__mean",
                x1: cx + Math.cos(angle) * (FACE_RADIUS - 9),
                y1: cy + Math.sin(angle) * (FACE_RADIUS - 9),
                x2: cx + Math.cos(angle) * (FACE_RADIUS + 9),
                y2: cy + Math.sin(angle) * (FACE_RADIUS + 9),
            })
        ).appendChild(draw("title", {})).textContent = "The average person"
    }

    function drawFace(svg, happy, meanHappy, colour) {
        svg.setAttribute("viewBox", "0 0 120 120")
        svg.style.setProperty("--chart", colour)
        svg.innerHTML = ""

        const cx = FACE_CENTRE
        const cy = FACE_CENTRE - 5
        const round = 2 * Math.PI * FACE_RADIUS

        svg.appendChild(draw("circle", { class: "face__track", cx: cx, cy: cy, r: FACE_RADIUS }))
        svg.appendChild(
            draw("circle", {
                class: "face__ring",
                cx: cx,
                cy: cy,
                r: FACE_RADIUS,
                "stroke-dasharray": round.toFixed(1),
                "stroke-dashoffset": (round * (1 - happy)).toFixed(1),
                transform: "rotate(-90 " + cx + " " + cy + ")",
            })
        )

        if (meanHappy !== null) faceMean(svg, meanHappy)

        const head = draw("g", { class: "face__head" })
        head.appendChild(draw("circle", { class: "face__eye", cx: cx - 13, cy: cy - 10, r: 3.4 }))
        head.appendChild(draw("circle", { class: "face__eye", cx: cx + 13, cy: cy - 10, r: 3.4 }))
        head.appendChild(draw("path", { class: "face__mouth", d: faceMouth(cx, cy, happy) }))
        svg.appendChild(head)
    }

    // A row of faces, one per reading handed to it — built the way `dimensions`
    // are, but drawn instead of listed, and skipped rather than blanked when a
    // reading is not yet in: a face means nothing half-drawn.
    function renderFaces(specs, tease) {
        const wrap = document.createElement("div")
        wrap.className = "faces"

        for (const spec of specs) {
            // A reading whose dimensions are not in this run gets no face,
            // teased or real: the preview shows what finishing will show, and
            // finishing will not show this one.
            if (!spec.exists) continue

            const value = tease ? teaseReach(spec.key, spec.lowest, spec.highest) : spec.value
            if (value === undefined) continue

            // Both the score and the mean are read off the same scale, by the
            // same rule: how far up it they sit, flipped if this is a reading
            // where less of it is the happier place to be.
            const happyOf = (raw) => {
                const reach = (raw - spec.lowest) / (spec.highest - spec.lowest)
                return spec.worse === "high" ? 1 - reach : reach
            }

            const happy = happyOf(value)
            const colour = mix("#ef4444", "#22c55e", happy)
            const meanHappy = spec.norm && !tease ? happyOf(spec.norm.mean) : null

            const figure = document.createElement("figure")
            figure.className = "face"

            const svg = document.createElementNS(SVG, "svg")
            svg.setAttribute("role", "img")
            svg.setAttribute(
                "aria-label",
                tease ? "Blurred preview of your " + spec.key.toLowerCase() : "Your " + spec.key.toLowerCase() + ", as a face",
            )
            drawFace(svg, happy, meanHappy, colour)
            figure.appendChild(svg)

            const caption = document.createElement("figcaption")
            const name = document.createElement("p")
            name.className = "face__name"
            name.textContent = spec.key
            caption.appendChild(name)

            if (!tease) {
                const standing = spec.norm ? standFrom(value, spec.norm) : null
                const said = document.createElement("p")
                said.className = "face__reading"
                said.textContent = standing
                    ? standing.direction + " than " + standing.share + "% of people"
                    : "score: " + value.toFixed(1) + " of " + spec.highest
                caption.appendChild(said)

                // A general read of what that tends to mean, the same way a
                // soma organ or a dimension's own row gets one — and the same
                // pair of buttons every other prediction is voted on with.
                const told =
                    spec.norm && spec.norm.interpretations && standing && spec.norm.interpretations[tercile(standing.proportion)]
                if (told) {
                    const reading = document.createElement("p")
                    reading.className = "face__told"
                    reading.textContent = sentence(told)
                    caption.appendChild(reading)
                    caption.appendChild(voteButtons(spec.key))
                }
            }

            figure.appendChild(caption)
            wrap.appendChild(figure)
        }

        return wrap
    }

    /* --------------------------- the AI archetype -------------------------- */

    // The BAIT closes its level as neither rows nor rings but as one of three
    // archetypes, taken from a cluster analysis of the pooled BAIT samples.
    // The partitions there are not crisp, but they say which *combinations* of
    // answers actually occur: at k = 2 the split is a single evaluative axis
    // (AI output is realistic and hard to spot, and AI is likeable — against
    // the reverse of all three), and at k = 3 a third group is carved out of
    // the attitude end — worry 1.21 SD below the mean, enthusiasm high,
    // beliefs about what AI can produce merely average — leaving a group that
    // holds AI output to be realistic, hard to spot *and* dangerous. Believing
    // AI capable and being alarmed by it are therefore not two ends of one
    // thing — which a split into enthusiasm × apprehension quadrants would
    // quietly treat them as, and which is why this is not one.
    //
    // Somebody is placed in the nearest of the three by ordinary
    // nearest-centroid on the z scores of the three dimensions the app scores,
    // each read against its own norm — so the same `normOf` plumbing that
    // serves the mood faces serves this. The centroids are that reported
    // description read into SD units (only the worry figure is exact), and the
    // `share` of each is a PLACEHOLDER, invented like every other norm in this
    // app, pending the cluster sizes being read off the pooled samples.
    const ARCHETYPE_OF = "bait"
    const ARCHETYPE_KEY = "AI Archetype" // what the agree/disagree on it is filed under

    // The dimensions somebody is placed on, and the order `at` is written in.
    const ARCHETYPE_ON = ["AI Realism", "AI Enthusiasm", "AI Apprehension"]

    const ARCHETYPES = [
        {
            name: "The Untroubled",
            share: 30,
            at: { "AI Realism": 0.0, "AI Enthusiasm": 0.9, "AI Apprehension": -1.2 },
            reading:
                "what stands out is not what you think AI can do but how little it worries you: your beliefs about what it can " +
                "actually produce sit close to average, while your enthusiasm runs high and your alarm runs lower than almost " +
                "anybody's.",
        },
        {
            name: "The Uneasy Realist",
            share: 40,
            at: { "AI Realism": 0.6, "AI Enthusiasm": -0.2, "AI Apprehension": 0.5 },
            reading:
                "you think AI can already make things that pass for real, and that is precisely what unsettles you — for you, " +
                "being impressed by what it can do and being wary of it are one judgement rather than opposite ones.",
        },
        {
            name: "The Unconvinced",
            share: 30,
            at: { "AI Realism": -0.8, "AI Enthusiasm": -0.5, "AI Apprehension": 0.3 },
            reading:
                "you are not much taken with AI, and not much impressed by it either: you doubt it can really produce what it " +
                "is said to, you expect the seams to show, and you are less enthusiastic about it than most people.",
        },
    ]

    // Which archetype these answers are nearest — or null while any of the
    // three dimensions is unfinished, missing from the run, or missing the norm
    // its z score is measured against.
    function aiArchetype() {
        const z = {}
        for (const dimension of ARCHETYPE_ON) {
            const norm = known(dimension) && normOf(dimension)
            if (!norm || !norm.sd) return null

            const value = score(dimension)
            if (value === undefined) return null

            z[dimension] = (value - norm.mean) / norm.sd
        }

        let nearest = null
        let closest = Infinity
        for (const type of ARCHETYPES) {
            let apart = 0
            for (const dimension of ARCHETYPE_ON) {
                const gap = z[dimension] - type.at[dimension]
                apart += gap * gap
            }
            if (apart < closest) {
                closest = apart
                nearest = type
            }
        }

        return nearest
    }

    // The figure itself: the robot, the name, the share of people answering
    // enough like this to land in the same group, the reading, and the same
    // agree/disagree every other prediction gets. Locked, it keeps the shape —
    // a stand-in name and a 00% share, blurred — and carries no live buttons,
    // like every other teased figure.
    function renderArchetype(type, locked) {
        const holder = document.createElement("div")
        holder.className = "archetype"

        const piece = (className, text) => {
            const line = document.createElement("p")
            line.className = className + (locked && className !== "archetype__emoji" && className !== "archetype__lead" ? " blank" : "")
            line.textContent = text
            holder.appendChild(line)
        }

        const shown = locked ? ARCHETYPES[0] : type

        piece("archetype__emoji", "🤖")
        piece("archetype__lead", "Based on your answers, you are")
        piece("archetype__name", shown.name)
        piece("archetype__share", (locked ? "00" : "about " + shown.share) + "% of people answer like this")
        piece("archetype__told", sentence(shown.reading))

        if (!locked) holder.appendChild(voteButtons(ARCHETYPE_KEY))
        return holder
    }

    /* ------------------------- the archetype wheel ------------------------ */

    // The twelve archetypes close their level as a wheel rather than a chart
    // and a row apiece: each takes a slice of the circle, filled out from the
    // middle as far along its own scale as the answers put it, in its own
    // colour. The shape of the whole wheel is the reading, and the longest
    // petal is the story loudest in you.
    //
    // This is the one section in the app drawn without norms behind it. There
    // is no population mean for "Warrior" that would mean anything, so the
    // twelve are placed against each other instead of against other people —
    // which is what the framework claims to be about, and why they are a wheel
    // and not rows: a row wants a percentile, and there is none here to give.
    // (See content/block_archetypes.js.) `dimensionsOf` therefore returns
    // nothing for this questionnaire, and the section below is the one place
    // that goes through `dimensionsIn` instead.
    //
    // The colours are the twelve-hue circle the figure was ported from, three
    // to a quarter, and they live here rather than in content/ for the same
    // reason the MINT's organ colours do: they are how the figure is drawn,
    // not anything that was asked.
    const WHEEL_OF = "archetypes"
    const WHEEL_KEY = "Archetype" // what the agree/disagree on it is filed under
    const WHEEL_MOST = 3 // archetypes that may tie for the lead before it is called even

    const WHEEL = [
        {
            dimension: "Idealist",
            colour: "#79bc43",
            reading: "you meet the world expecting it to come good, and that trust keeps you at a thing long after other people have written it off.",
        },
        {
            dimension: "Sage",
            colour: "#40a75b",
            reading: "you would rather know than be comfortable, and you will go looking for what is actually true even when it is not what anybody wants said.",
        },
        {
            dimension: "Seeker",
            colour: "#009a93",
            reading: "what pulls you is the next horizon rather than the safe harbour, and you have learnt more about yourself from leaving than from staying.",
        },
        {
            dimension: "Revolutionary",
            colour: "#009fe3",
            reading: "you can let a thing end — where others patch and preserve, you clear the ground, on the understanding that nothing new grows in an occupied space.",
        },
        {
            dimension: "Magician",
            colour: "#3b429f",
            reading: "you work on how a situation is seen rather than on the situation itself, having found that shifting the frame tends to shift the outcome with it.",
        },
        {
            dimension: "Warrior",
            colour: "#5d399c",
            reading: "you go straight at whatever is in the way, and a problem you can see is one you feel personally answerable for.",
        },
        {
            dimension: "Realist",
            colour: "#9e299a",
            reading: "you have no wish to stand above anybody, and you are usually the steady, unpretentious one in the room rather than the loud one.",
        },
        {
            dimension: "Jester",
            colour: "#e41b6c",
            reading: "you keep hold of the lightness, on the view that taking a difficulty seriously is not the same as taking it heavily.",
        },
        {
            dimension: "Lover",
            colour: "#ea3f35",
            reading: "you measure a life by its closeness, and intimacy is where the meaning is for you rather than a reward for having found it elsewhere.",
        },
        {
            dimension: "Creator",
            colour: "#f68d1e",
            reading: "you need to be making something, and beauty and originality are not decoration to you but the point of the exercise.",
        },
        {
            dimension: "Ruler",
            colour: "#fab913",
            reading: "you are at your best holding the shape of things, and order is less a constraint you put up with than something you build.",
        },
        {
            dimension: "Caregiver",
            colour: "#e8d21a",
            reading: "you notice who is struggling before they say so and cannot quite leave it there, which is a gift worth asking who returns.",
        },
    ]

    // The petals that have a dimension in this run at all — not merely one
    // answered yet. Named directly rather than discovered through
    // `dimensionsIn`, the same way the faces name theirs, so the block being
    // left out of the timeline narrows the wheel instead of throwing.
    const WHEEL_HELD = WHEEL.filter((one) => known(one.dimension))

    const WHEEL_CX = 220
    const WHEEL_CY = 176
    const WHEEL_R = 118

    function wheelPoint(angle, distance) {
        return [WHEEL_CX + Math.cos(angle) * distance, WHEEL_CY + Math.sin(angle) * distance]
    }

    // One archetype's slice of the circle, from the middle out. It stops a
    // little short of its neighbours either side, or twelve petals read as one
    // ring rather than as twelve.
    function wheelPetal(angle, half, distance) {
        const [x1, y1] = wheelPoint(angle - half, distance)
        const [x2, y2] = wheelPoint(angle + half, distance)
        return (
            "M" + WHEEL_CX + " " + WHEEL_CY + " L" + x1.toFixed(1) + " " + y1.toFixed(1) +
            " A" + distance.toFixed(1) + " " + distance.toFixed(1) + " 0 0 1 " + x2.toFixed(1) + " " + y2.toFixed(1) + " Z"
        )
    }

    // The archetypes tied for the highest score, or nothing at all while any
    // of them is still unanswered. A wheel of two-item scales ties often
    // enough that picking one of them and calling it the answer would be
    // inventing a winner, so a tie is shown as a tie.
    function leading() {
        let best = -Infinity
        let top = []

        for (const one of WHEEL_HELD) {
            const value = score(one.dimension)
            if (value === undefined) return []

            if (value > best) {
                best = value
                top = [one]
            } else if (value === best) top.push(one)
        }

        return top
    }

    function drawWheel(chart, tease) {
        const step = (2 * Math.PI) / WHEEL_HELD.length
        const half = (step / 2) * 0.84
        const top = tease ? [] : leading()

        chart.setAttribute("viewBox", "0 0 440 356")
        // Added rather than set: a figure is found again by a class of its own,
        // and drawing into it a second time must not take that off it.
        chart.classList.add("wheel")
        chart.innerHTML = ""

        for (let ring = 1; ring <= 3; ring++) {
            chart.appendChild(draw("circle", { class: "chart__ring", cx: WHEEL_CX, cy: WHEEL_CY, r: (WHEEL_R * ring) / 3 }))
        }

        // The spokes and the names first, so that the petals lie over them
        // rather than being ruled through.
        WHEEL_HELD.forEach((one, position) => {
            const angle = position * step - Math.PI / 2
            const [ex, ey] = wheelPoint(angle, WHEEL_R)
            chart.appendChild(draw("line", { class: "chart__axis", x1: WHEEL_CX, y1: WHEEL_CY, x2: ex, y2: ey }))

            const [labelX, labelY] = wheelPoint(angle, WHEEL_R + 20)
            const anchor = Math.abs(labelX - WHEEL_CX) < 8 ? "middle" : labelX > WHEEL_CX ? "start" : "end"
            const label = draw("text", {
                class: "chart__label" + (!tease && score(one.dimension) === undefined ? " chart__label--awaiting" : ""),
                x: labelX,
                y: labelY,
                "text-anchor": anchor,
                "dominant-baseline": "middle",
            })
            label.textContent = one.dimension
            chart.appendChild(label)
        })

        WHEEL_HELD.forEach((one, position) => {
            const value = tease ? teaseValue(one.dimension) : score(one.dimension)
            if (value === undefined) return

            const angle = position * step - Math.PI / 2
            const reach = reachOf(one.dimension, value)
            const petal = draw("path", {
                class: "wheel__petal" + (top.indexOf(one) !== -1 ? " wheel__petal--leading" : ""),
                style: "--chart: " + one.colour + "; animation-delay: " + (position * 0.05).toFixed(2) + "s",
                // Kept off nothing at all: an archetype answered at the very
                // bottom of its scale is still an answer, and a petal of no
                // size would read as one never given.
                d: wheelPetal(angle, half, Math.max(9, reach * WHEEL_R)),
            })

            // A teased petal stands for nothing, so it says nothing either.
            if (!tease) {
                const text = one.dimension + " — " + value.toFixed(1) + " of " + dimensions[one.dimension][0].highest
                petal.appendChild(draw("title", {})).textContent = text
                petal.addEventListener("mouseenter", () => showTip(petal, text))
                petal.addEventListener("mouseleave", hideTip)
            }

            chart.appendChild(petal)
        })
    }

    // "The Sage", "The Sage & the Lover", "The Sage, the Jester & the Lover":
    // the first keeps its capital because it opens the line.
    function wheelNames(top) {
        const names = top.map((one, at) => (at === 0 ? "The " : "the ") + one.dimension)
        if (names.length < 2) return names.join("")
        return names.slice(0, -1).join(", ") + " & " + names[names.length - 1]
    }

    // The figure and what it comes to: the wheel, whichever of the twelve came
    // out loudest, what leading with it tends to mean, and the same
    // agree/disagree every other prediction gets. Locked, it keeps the shape —
    // a teased wheel, a stand-in name, all blurred — and carries no live
    // buttons, like every other teased figure.
    function renderWheel(locked) {
        const holder = document.createElement("div")
        holder.className = "wheel__all"

        const chart = document.createElement("div")
        chart.className = "result__chart result__chart--wide"

        const figure = document.createElementNS(SVG, "svg")
        figure.setAttribute("role", "img")
        figure.setAttribute(
            "aria-label",
            locked
                ? "Blurred preview of your archetype wheel, still locked"
                : "Your twelve archetypes, each a petal of a wheel filled to how strongly it describes you"
        )
        chart.appendChild(figure)
        holder.appendChild(chart)
        drawWheel(figure, locked)

        if (locked) {
            const badge = document.createElement("span")
            badge.className = "result__lock"
            badge.textContent = "Locked"
            chart.appendChild(badge)
        }

        const piece = (className, text) => {
            const line = document.createElement("p")
            line.className = className + (locked && className !== "wheel__lead" ? " blank" : "")
            line.textContent = text
            holder.appendChild(line)
            return line
        }

        const top = locked ? WHEEL_HELD.slice(0, 1) : leading()

        // Too many of the twelve tied for the lead to name one: an even wheel
        // is a real result, and saying so is better than crowning whichever of
        // them happens to be written first.
        if (top.length > WHEEL_MOST) {
            piece("wheel__lead", "Your wheel is an even one")
            piece(
                "wheel__told",
                sentence("no one story stands out above the rest: you carry these in much the same measure, which is its own kind of answer.")
            )
        } else {
            piece("wheel__lead", top.length > 1 ? "You lead with these, in equal measure" : "You lead with")
            piece("wheel__name", wheelNames(top))

            // Named again in front of each reading where there is more than
            // one of them, or two sentences would run together under a heading
            // that holds both names and say nothing about which is which.
            for (const one of top) {
                piece("wheel__told", top.length > 1 ? "The " + one.dimension + " — " + one.reading : sentence(one.reading))
            }
        }

        if (!locked) holder.appendChild(voteButtons(WHEEL_KEY))
        return holder
    }

    /* ------------------------- the profile and the card ------------------- */

    // The dimensions the whole-run web and the card carry: not everything the
    // run scores, but what a level's results actually name — a row under the
    // personality chart, an organ of the body, a face. Everything else is
    // scored, saved and drawn nowhere here. The single items and Sleep have no
    // norms, so a level says nothing about them and neither does this. The
    // PHQ-4 and SSS-8 domains are only ever read folded into the Mood and
    // Health faces, which are composites rather than dimensions and so have no
    // axis to take; Strain, the third face, is a real dimension and keeps its.
    // The BAIT's three facets are read back as one archetype and the twelve
    // archetypes as one wheel, each a figure of its own that this web would
    // only repeat — twelve axes at a time, which is what made it unreadable.
    //
    // The rule is worked out rather than written as a list, so a scale that
    // earns its norms, or a face that reads a real dimension, takes its axis
    // here in the same breath and nothing has to be kept in step by hand.
    //
    // A questionnaire can also take itself off the web with `profile: false`,
    // written in `content/` beside its name: the HEXACO does, because the Big
    // Five already stand for personality here and six more axes would crowd
    // everything else.
    function onProfile(dimension) {
        const name = dimensions[dimension][0].questionnaire
        if (name === ARCHETYPE_OF || name === WHEEL_OF) return false
        if (QUESTIONNAIRES[name].profile === false) return false
        if (MOOD_HEALTH_OF.indexOf(name) !== -1) return MOOD_HEALTH.some((build) => build().key === dimension)
        return !!normOf(dimension)
    }

    const PROFILE = dimensionOrder.filter(onProfile)

    // The card is the whole web, on one image: the profile's dimensions, on the
    // same geometry the profile panel draws. Sharing it is a deliberate act
    // and it carries everything the web does — which is why the link is only
    // ever built by pressing the button that says so.
    const CARD_WIDTH = 1200
    const CARD_HEIGHT = 630
    const CARD_LEAST = 3 // dimensions needed before there is a web to show

    // Every dimension of the profile answered so far. The card draws all of
    // them and leaves a gap where one is still unanswered, exactly as the
    // profile web does.
    function cardValues() {
        const values = {}
        for (const dimension of PROFILE) {
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
        const held = PROFILE.filter((dimension) => values[dimension] !== undefined)

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
        c.fillText(held.length + " OF " + PROFILE.length + " DIMENSIONS", CARD_WIDTH - 72, 78)
        c.textAlign = "left"
        c.letterSpacing = "0px"

        // The web itself, on the same maths as drawSpider.
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
            trace(
                PROFILE.map((_, position) => spot(position, (radius * ring) / 3)),
                true
            )
            c.stroke()
        }

        PROFILE.forEach((_, position) => {
            trace([[centreX, centreY], spot(position, radius)], false)
            c.stroke()
        })

        // The average person, dashed, under your own shape — but only when
        // there is one to draw on every axis. A dimension written without
        // norms has no mean to put here, and half a comparison is worse than
        // none, so the whole ring goes rather than a broken one.
        const comparable = PROFILE.every((dimension) => normOf(dimension))

        if (comparable) {
            c.setLineDash([6, 5])
            c.strokeStyle = "#767c92"
            c.lineWidth = 2
            trace(
                PROFILE.map((dimension, position) => spot(position, reachOf(dimension, normOf(dimension).mean) * radius)),
                true
            )
            c.stroke()
            c.setLineDash([])
        }

        // Your own shape. Complete, it closes; partial, only neighbouring
        // dimensions are joined, so a gap stays a gap.
        const yours = {}
        PROFILE.forEach((dimension, position) => {
            if (values[dimension] === undefined) return
            yours[position] = spot(position, reachOf(dimension, values[dimension]) * radius)
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

        // A point in the colour of the questionnaire it came from.
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

        // The names, at the far end of each axis, broken onto their own lines.
        c.font = "600 12px " + sans
        PROFILE.forEach((dimension, position) => {
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
            // Only a dimension this build's profile carries, on its own scale:
            // a link is somebody else's text, and nothing else gets drawn.
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

    // The profile on one web, with the ways of keeping it underneath. It is
    // drawn in two places — the panel during the run, and the last screen once
    // there is nothing left to answer — so it is handed the one to fill in.
    function renderProfile(into) {
        const drawn = drawSpider(into.querySelector(".profile__web"), PROFILE)
        const key = into.querySelector(".profile__legend")

        key.innerHTML = ""
        if (drawn.compared) key.appendChild(legend(drawn.colour))

        into.querySelector(".profile__note").textContent =
            drawn.found === PROFILE.length
                ? "All " + PROFILE.length + " dimensions revealed."
                : drawn.found +
                  " of " +
                  PROFILE.length +
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
            // `scored` only ever holds what came through `dimensionsOf`, so a
            // norm — and with it a standing — is guaranteed here: a dimension
            // without one never earns a row at all.
            const standing = comparison(dimension)
            const norm = normOf(dimension)
            const reading = norm.interpretations && norm.interpretations[tercile(standing.proportion)]
            const row = document.createElement("div")
            row.className = "row"

            row.innerHTML =
                '<p class="row__lead">Your score of <b>' +
                dimension +
                "</b> is " +
                standing.direction +
                " than <b>" +
                standing.share +
                "%</b> of people.</p>"

            row.appendChild(percentileBar(dimension, standing.centile))

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
            // Mood, Strain and Health are three questionnaires' worth of
            // items — the PHQ-4, the Dissociation questionnaire, the SSS-8 —
            // but one section, rendered once in place of whichever of the
            // three is first in the run and skipped where the other two would
            // otherwise fall. Everything else about those three questionnaires
            // (their items, their scoring, their place in `RUN`) is untouched;
            // only what `renderResults` does with their name changes here.
            if (MOOD_HEALTH_OF.indexOf(name) !== -1) {
                if (name !== MOOD_HEALTH_FIRST) continue

                const onThisLevel = MOOD_HEALTH_OF.some((one) => dimensionsOf(one).some((d) => dimensions[d][0].level === level))
                if (!onThisLevel) continue

                const specs = MOOD_HEALTH.map((build) => build())
                if (!locked && specs.every((spec) => spec.value === undefined)) continue

                const section = document.createElement("section")
                section.className = "result" + (locked ? " result--locked" : "")

                const heading = document.createElement("h2")
                heading.className = "result__name"
                heading.textContent = "Mood & Health"
                section.appendChild(heading)

                const body = document.createElement("div")
                body.className = "result__body"
                body.appendChild(renderFaces(specs, locked))
                section.appendChild(body)
                into.appendChild(section)
                continue
            }

            // The BAIT closes its level as one figure — the archetype — in
            // place of a chart and a row per facet. Its dimensions keep their
            // axes on the whole-run profile web like anything else scored.
            if (name === ARCHETYPE_OF) {
                const onThisLevel = dimensionsOf(name).some((one) => dimensions[one][0].level === level)
                if (!onThisLevel) continue

                const type = aiArchetype()
                if (!locked && !type) continue

                const section = document.createElement("section")
                section.className = "result" + (locked ? " result--locked" : "")

                const heading = document.createElement("h2")
                heading.className = "result__name"
                heading.textContent = QUESTIONNAIRES[name].name || name
                section.appendChild(heading)

                const body = document.createElement("div")
                body.className = "result__body"
                body.appendChild(renderArchetype(type, locked))
                section.appendChild(body)
                into.appendChild(section)
                continue
            }

            // The twelve archetypes close their level as one wheel. They carry
            // no norms — they are read against each other — so unlike every
            // other section here the test for whether they belong on this
            // level goes through `dimensionsIn`, which does not throw them out
            // for it.
            if (name === WHEEL_OF) {
                const onThisLevel = dimensionsIn(name).some((one) => dimensions[one][0].level === level)
                if (!onThisLevel) continue
                if (!locked && !leading().length) continue

                const section = document.createElement("section")
                section.className = "result" + (locked ? " result--locked" : "")

                const heading = document.createElement("h2")
                heading.className = "result__name"
                heading.textContent = QUESTIONNAIRES[name].name || name
                section.appendChild(heading)

                const body = document.createElement("div")
                body.className = "result__body"
                body.appendChild(renderWheel(locked))
                section.appendChild(body)
                into.appendChild(section)
                continue
            }

            // `dimensionsOf` leaves out anything with no norms behind it, so a
            // scale written without them opens no rows and no section at all.
            const owned = dimensionsOf(name)
            const inLevel = owned.filter((dimension) => dimensions[dimension][0].level === level)
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

            if (charted || name === SOMA) {
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
                    const drawn = drawSpider(figure, owned, locked)
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
            if (name !== SOMA) body.appendChild(locked ? lockedRows(shown) : resultRows(shown))

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

    // The whole web with nobody on it: the profile's dimensions, each at the
    // figure hashed from its own name, for the landing page to hold behind the
    // case for answering any of them. It is the same `tease` a locked level is
    // drawn from — it stands for no one, and the page keeps it out of focus.
    function renderExample(chart) {
        drawSpider(chart, PROFILE, true)
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
