/* =========================================================================
   The four cognitive styles as a compass: four arms out of one centre —
   Verbal north, Logical east, Visual south, Spatial west — each drawn as
   long as that style's problems came easily *relative to the other three*,
   the longest reaching the rim whatever the number behind it, and the
   longest picked out in gold and named underneath as the predominant style. It is the second figure drawn without norms,
   and unlike the wheel it is not even drawn to the scale of its own scores:
   the four are read against each other and against nobody, which is the
   whole of what the level feeds back. What the arms are and what leading
   with one tends to mean live here, since they are how the figure is read
   and not anything that was asked.
   ========================================================================= */

function makeReasoning(shared) {
    "use strict"

    const dimensions = shared.dimensions
    const score = shared.score
    const known = shared.known
    const teaseValue = shared.teaseValue
    const sentence = shared.sentence
    const voteButtons = shared.voteButtons
    const figureHolder = shared.figureHolder
    const showTip = shared.showTip
    const hideTip = shared.hideTip

    const REASONING_OF = "icar16"
    const REASONING_KEY = "Reasoning"

    // In the order they are drawn, clockwise from the top. The names are the
    // dimensions as content/ writes them — four styles, one per ICAR subtest.
    const ARMS = [
        {
            dimension: "Verbal",
            short: "thinking in words",
            reading:
                "you think in words: you hold a few statements in mind at once and work out what has to follow from them, which is the kind of thinking an argument, a contract or a rule is made of.",
        },
        {
            dimension: "Logical",
            short: "thinking in rules",
            reading:
                "you think in rules: you notice the pattern in what has already happened and carry it one step further, which is what a forecast, and most of mathematics, comes down to.",
        },
        {
            dimension: "Visual",
            short: "thinking in pictures",
            reading:
                "you think in pictures: you see what changes from one figure to the next and what therefore belongs in the gap, the kind of thinking furthest from anything you were ever taught.",
        },
        {
            dimension: "Spatial",
            short: "thinking in three dimensions",
            reading:
                "you think in three dimensions: you know what an object would look like from another side without having to see it, which is the kind of thinking a map, a diagram or a flat-pack asks for.",
        },
    ]

    // Named directly rather than found through `dimensionsIn`, so the block
    // being left out of the timeline narrows the compass instead of throwing.
    const HELD = ARMS.filter((one) => known(one.dimension))

    const CX = 260
    const CY = 160
    const R = 118
    const LEAST = 12 // an arm at nothing is still drawn, or it reads as never answered

    function colourOf(one) {
        return dimensions[one.dimension][0].color || "var(--gold)"
    }

    // Every kind answered, which is when there is a shape to read.
    function ready() {
        return HELD.length > 0 && HELD.every((one) => score(one.dimension) !== undefined)
    }

    // Each arm's length as a share of the longest, so the figure shows how
    // the four compare and nothing about how many were right. Nothing right
    // anywhere is an even figure at its shortest.
    function shares(tease) {
        const values = HELD.map((one) => (tease ? teaseValue(one.dimension) : score(one.dimension)))
        const best = Math.max.apply(null, values)
        return values.map((value) => (best > 0 ? value / best : 0))
    }

    // Every style tied for the top, or nothing while any is unanswered. Four
    // items a style tie often, and picking one would be inventing a winner.
    function leading() {
        let best = -Infinity
        let top = []
        for (const one of HELD) {
            const value = score(one.dimension)
            if (value === undefined) return []
            if (value > best) {
                best = value
                top = [one]
            } else if (value === best) top.push(one)
        }
        return top
    }

    // The style furthest behind, when there is exactly one and it is not also
    // at the top — the other half of "stronger in this than in that".
    function trailing() {
        let least = Infinity
        let bottom = []
        for (const one of HELD) {
            const value = score(one.dimension)
            if (value === undefined) return []
            if (value < least) {
                least = value
                bottom = [one]
            } else if (value === least) bottom.push(one)
        }
        return bottom.length === 1 && leading().indexOf(bottom[0]) === -1 ? bottom : []
    }

    function point(angle, distance) {
        return [CX + Math.cos(angle) * distance, CY + Math.sin(angle) * distance]
    }

    // An arm: a slender kite out of the centre, widest a third of the way
    // along and tapering to a point at the tip.
    function arm(angle, length) {
        const wide = Math.max(6, length * 0.19)
        const [tipX, tipY] = point(angle, length)
        const [midX, midY] = point(angle, length * 0.34)
        const across = angle + Math.PI / 2
        const l = [midX + Math.cos(across) * wide, midY + Math.sin(across) * wide]
        const r = [midX - Math.cos(across) * wide, midY - Math.sin(across) * wide]
        return [[CX, CY], l, [tipX, tipY], r].map((xy) => xy.map((n) => n.toFixed(1)).join(",")).join(" ")
    }

    function drawCompass(chart, tease) {
        const step = (2 * Math.PI) / HELD.length
        const lengths = shares(tease)
        const top = tease ? [] : leading()

        chart.setAttribute("viewBox", "0 0 520 320")
        chart.classList.add("compass")
        chart.innerHTML = ""

        for (let ring = 1; ring <= 3; ring++) chart.appendChild(draw("circle", { class: "chart__ring", cx: CX, cy: CY, r: (R * ring) / 3 }))

        HELD.forEach((one, position) => {
            const angle = position * step - Math.PI / 2
            const [ex, ey] = point(angle, R)
            chart.appendChild(draw("line", { class: "chart__axis", x1: CX, y1: CY, x2: ex, y2: ey }))

            const [labelX, labelY] = point(angle, R + 22)
            const label = draw("text", {
                class: "chart__label",
                x: labelX,
                y: labelY,
                "text-anchor": Math.abs(labelX - CX) < 8 ? "middle" : labelX > CX ? "start" : "end",
                "dominant-baseline": "middle",
            })
            label.textContent = one.dimension
            chart.appendChild(label)
        })

        HELD.forEach((one, position) => {
            const angle = position * step - Math.PI / 2
            const shape = draw("polygon", {
                class: "compass__arm" + (top.indexOf(one) !== -1 ? " compass__arm--leading" : ""),
                style: "--chart: " + colourOf(one) + "; animation-delay: " + (position * 0.07).toFixed(2) + "s",
                points: arm(angle, Math.max(LEAST, lengths[position] * R)),
            })

            // What the style is, not how many were right: the figure keeps to
            // the comparison, on hover as on the page.
            if (!tease) {
                const text = one.dimension + ": " + one.short
                shape.appendChild(draw("title", {})).textContent = text
                shape.addEventListener("mouseenter", () => showTip(shape, text))
                shape.addEventListener("mouseleave", hideTip)
            }
            chart.appendChild(shape)
        })
    }

    // "Spatial", "Spatial & Verbal", "Spatial, Verbal & Logical".
    function names(top) {
        const list = top.map((one) => one.dimension)
        return list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + " & " + list[list.length - 1]
    }

    function renderReasoning(locked) {
        const holder = document.createElement("div")
        holder.className = "compass__all"

        const chart = figureHolder(
            locked
                ? "Blurred preview of your cognitive styles, still locked"
                : "Your four cognitive styles as a compass, each arm as long as that style's problems came easily compared with the other three",
            "result__chart--wide",
            locked,
        )
        drawCompass(chart.figure, locked)
        holder.appendChild(chart.holder)

        const piece = (className, text) => {
            const line = document.createElement("p")
            line.className = className + (locked && className !== "compass__lead" ? " blank" : "")
            line.textContent = text
            holder.appendChild(line)
        }

        const top = locked ? HELD.slice(0, 1) : leading()
        const bottom = locked ? [] : trailing()

        // One lead line whatever the shape: every style tied for the top is
        // named under it, and four level with each other are named as four,
        // with a sentence saying so rather than a crown for whichever is
        // written first.
        piece("compass__lead", "Your cognitive style is predominantly:")
        piece("compass__name", names(top))
        if (top.length === HELD.length) {
            piece(
                "compass__told",
                sentence("no one style stands out. Words, rules, pictures and shapes came to you in much the same measure, and that is a result rather than a failure to lean."),
            )
        } else {
            for (const one of top) piece("compass__told", top.length > 1 ? one.dimension + ": " + one.reading : sentence(one.reading))
            if (bottom.length) piece("compass__least", "Your least used style is " + bottom[0].dimension + " — " + bottom[0].short + ".")
        }

        if (!locked) {
            piece("compass__ask", "Do you agree with this?")
            holder.appendChild(voteButtons(REASONING_KEY))
        }
        return holder
    }

    return { REASONING_OF: REASONING_OF, REASONING_KEY: REASONING_KEY, ready: ready, renderReasoning: renderReasoning }
}
