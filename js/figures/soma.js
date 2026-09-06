/* =========================================================================
   Interoception, as a body. The MINT is not a shape on a web: awareness sits
   in the head, sensitivity in the chest, and clarity is the cord between them.
   Each is a ring filled to where the score sits on its own scale, with the
   whole reading — name, standing, interpretation, vote — beside the organ, so
   the figure is the entire section and takes no rows underneath.
   ========================================================================= */

function makeSoma(shared) {
    "use strict"

    const score = shared.score
    const tercile = shared.tercile
    const normOf = shared.normOf
    const reachOf = shared.reachOf
    const comparison = shared.comparison
    const summarise = shared.summarise
    const teaseValue = shared.teaseValue
    const sentence = shared.sentence
    const voteButtons = shared.voteButtons
    const showTip = shared.showTip
    const hideTip = shared.hideTip

    const SOMA = "mint"

    const BRAIN = {
        body: "M-30 2 C-30 -18, -16 -30, 0 -30 C16 -30, 30 -18, 30 2 C30 15, 21 25, 8 26 L8 37 L-8 37 L-8 26 C-21 25, -30 15, -30 2 Z",
        folds: ["M0 -30 L0 26", "M-17 -17 C-6 -11, -6 -1, -17 5", "M17 -17 C6 -11, 6 -1, 17 5"],
    }
    const HEART = {
        body: "M0 31 C-27 11, -35 -8, -21 -21 C-11 -29, -1 -23, 0 -14 C1 -23, 11 -29, 21 -21 C35 -8, 27 11, 0 31 Z",
    }

    const RING = 58 // radius of the ring round an organ
    const LABEL_X = 150 + 88 // where the words beside it start
    const WRAP = 46 // characters a line of the reading runs to
    const LINE = 15.6 // what a line of it takes, at 12.5px and 1.25em
    const VOTES_H = 34 // the row of buttons under it, and the air above them
    const HEAD_Y = 120
    const NAME_UP = 26 // how far above its anchor a reading's name sits
    const GAP = 18 // air between one reading's last line and the next one's name
    const CORD_LEAST = 160 // the cord is never shorter than this, whatever is written beside it
    const AWAITING = "#565c70" // an organ with nothing in it yet

    // SVG text does not wrap, so the reading is broken into lines by hand.
    function lines(text, most) {
        const out = [""]
        for (const word of text.split(" ")) {
            const line = out.length - 1
            if (out[line] && (out[line] + " " + word).length > most) out.push(word)
            else out[line] = out[line] ? out[line] + " " + word : word
        }
        return out
    }

    // The interpretation a reading carries, broken into lines, or nothing: no
    // value yet, or no norm to read one off. A teased reading takes the middle
    // text, since its stand-in figure means nothing.
    function toldLines(dimension, value, tease) {
        if (value === undefined) return null
        const norm = normOf(dimension)
        const standing = tease ? null : comparison(dimension)
        const reading = norm && norm.interpretations && norm.interpretations[tercile(standing ? standing.proportion : 0.5)]
        return reading ? lines(sentence(reading), WRAP) : null
    }

    // How far below its anchor a reading's words run: the lines of the
    // interpretation and, when live, the buttons under it. The three readings
    // are laid out from this, since the MINT's interpretations run to several
    // lines and a fixed spacing had them written over one another.
    function extent(dimension, value, tease) {
        const broken = toldLines(dimension, value, tease)
        if (!broken) return 0
        return 24 + (broken.length - 1) * LINE + (tease ? LINE : 2 + VOTES_H)
    }

    // Everything said about one reading, beside its organ. A teased one gets
    // the shape of a standing and no figure that could be read, and no buttons:
    // the blur is only paint, and nobody's prediction is there to agree with.
    function label(chart, dimension, y, value, tease) {
        const standing = value === undefined || tease ? null : comparison(dimension)

        const name = draw("text", { class: "soma__name", x: LABEL_X, y: y - NAME_UP })
        name.textContent = dimension.toUpperCase()
        chart.appendChild(name)

        if (value === undefined) {
            const waiting = draw("text", { class: "soma__unit", x: LABEL_X, y: y })
            waiting.textContent = "not yet answered"
            return chart.appendChild(waiting)
        }

        if (tease || standing) {
            const said = draw("text", { class: "soma__reading", x: LABEL_X, y: y })
            said.textContent = tease ? "higher than 00% of people" : standing.direction + " than " + standing.share + "% of people"
            chart.appendChild(said)
        }

        const broken = toldLines(dimension, value, tease)
        if (!broken) return

        const told = draw("text", { class: "soma__told", x: LABEL_X, y: y + 24 })
        broken.forEach((line, at) => {
            const part = draw("tspan", { x: LABEL_X, dy: at === 0 ? 0 : "1.25em" })
            part.textContent = line
            told.appendChild(part)
        })
        chart.appendChild(told)

        if (tease) return

        // The vote sits in the figure, in a foreignObject, so it is the same
        // pair of buttons every other prediction gets.
        const holder = draw("foreignObject", {
            class: "soma__votes",
            x: LABEL_X,
            y: y + 26 + (broken.length - 1) * LINE,
            width: 300,
            height: VOTES_H,
        })
        holder.appendChild(voteButtons(dimension))
        chart.appendChild(holder)
    }

    // Where the three readings sit, worked out from what is written beside
    // them: the head at the top, the cord's reading clear of the head's last
    // line, the chest clear of the cord's, and the figure as deep as the chest
    // needs. With short readings this is the fixed layout it replaced (head
    // 120, cord 190 to 350, chest 420, 540 deep).
    function layout(tease) {
        const value = (dimension) => (tease ? teaseValue(dimension) : score(dimension))
        const headBottom = HEAD_Y + Math.max(RING, extent("Bodily Awareness", value("Bodily Awareness"), tease))
        const cordTop = HEAD_Y + RING + 12
        const cordMid = Math.max(cordTop + CORD_LEAST / 2, headBottom + GAP + NAME_UP)
        const chestY = Math.max(
            cordMid + CORD_LEAST / 2 + 12 + RING,
            cordMid + extent("Bodily Clarity", value("Bodily Clarity"), tease) + GAP + NAME_UP,
        )
        const deep = chestY + Math.max(RING, extent("Bodily Sensitivity", value("Bodily Sensitivity"), tease)) + 20
        return { cordTop: cordTop, cordMid: cordMid, cordEnd: chestY - RING - 12, chestY: chestY, deep: deep }
    }

    function meanTick(chart, dimension, y) {
        const norm = normOf(dimension)
        if (!norm) return

        const angle = 2 * Math.PI * reachOf(dimension, norm.mean) - Math.PI / 2
        const tick = draw("line", {
            class: "soma__mean",
            x1: 150 + Math.cos(angle) * (RING - 9),
            y1: y + Math.sin(angle) * (RING - 9),
            x2: 150 + Math.cos(angle) * (RING + 9),
            y2: y + Math.sin(angle) * (RING + 9),
        })
        tick.appendChild(draw("title", {})).textContent = "The average person"
        chart.appendChild(tick)
    }

    function organ(chart, dimension, y, shape, colour, tease) {
        const value = tease ? teaseValue(dimension) : score(dimension)
        const held = value !== undefined
        const round = 2 * Math.PI * RING
        const shade = "--chart: " + (held ? colour : AWAITING)

        chart.appendChild(draw("circle", { class: "soma__track", cx: 150, cy: y, r: RING }))
        if (held) {
            chart.appendChild(
                draw("circle", {
                    class: "soma__ring",
                    cx: 150,
                    cy: y,
                    r: RING,
                    style: shade,
                    "stroke-dasharray": round.toFixed(1),
                    "stroke-dashoffset": (round * (1 - reachOf(dimension, value))).toFixed(1),
                    transform: "rotate(-90 150 " + y + ")",
                }),
            )
        }
        meanTick(chart, dimension, y)

        const icon = draw("g", { class: "soma__organ", style: shade, transform: "translate(150 " + y + ")" })
        icon.appendChild(draw("path", { class: "soma__icon", d: shape.body }))
        for (const fold of shape.folds || []) icon.appendChild(draw("path", { class: "soma__fold", d: fold }))

        // A teased organ stands for nothing, so it says nothing on hover.
        if (held && !tease) {
            const text = summarise(dimension)
            icon.appendChild(draw("title", {})).textContent = text
            icon.addEventListener("mouseenter", () => showTip(icon, text))
            icon.addEventListener("mouseleave", hideTip)
        }
        chart.appendChild(icon)

        label(chart, dimension, y, held ? value : undefined, tease)
    }

    // The cord between them, filled from the head down as far as clarity goes.
    function cord(chart, dimension, colour, at, tease) {
        const value = tease ? teaseValue(dimension) : score(dimension)
        const norm = normOf(dimension)
        const held = value !== undefined
        const run = at.cordEnd - at.cordTop

        chart.appendChild(draw("line", { class: "soma__cord", x1: 150, y1: at.cordTop, x2: 150, y2: at.cordEnd }))
        for (let rung = 1; rung <= 4; rung++) {
            const y = at.cordTop + (run * rung) / 5
            chart.appendChild(draw("line", { class: "soma__rung", x1: 141, y1: y, x2: 159, y2: y }))
        }
        if (held) {
            chart.appendChild(
                draw("line", {
                    class: "soma__signal",
                    style: "--chart: " + colour,
                    x1: 150,
                    y1: at.cordTop,
                    x2: 150,
                    y2: at.cordTop + run * reachOf(dimension, value),
                }),
            )
        }
        if (norm) {
            const y = at.cordTop + run * reachOf(dimension, norm.mean)
            const tick = draw("line", { class: "soma__mean", x1: 137, y1: y, x2: 163, y2: y })
            tick.appendChild(draw("title", {})).textContent = "The average person"
            chart.appendChild(tick)
        }

        label(chart, dimension, at.cordMid, held ? value : undefined, tease)
    }

    function drawSoma(chart, tease) {
        const at = layout(tease)
        chart.setAttribute("viewBox", "0 0 560 " + Math.round(at.deep))
        chart.classList.add("soma")
        chart.innerHTML = ""

        cord(chart, "Bodily Clarity", "#a78bfa", at, tease)
        organ(chart, "Bodily Awareness", HEAD_Y, BRAIN, "#22d3ee", tease)
        organ(chart, "Bodily Sensitivity", at.chestY, HEART, "#e0457b", tease)
    }

    return { SOMA: SOMA, drawSoma: drawSoma }
}
