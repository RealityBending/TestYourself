/* =========================================================================
   The twelve archetypes as a wheel: each a petal filled out from the middle as
   far along its own scale as the answers put it, in its own colour, with the
   longest picked out in gold and named underneath. This is the one section
   drawn without norms — there is no population mean for "Warrior" that would
   mean anything — so the twelve are placed against each other, which is why
   they are a wheel and not rows. The colours are the twelve-hue circle the
   figure was ported from; they are how it is drawn, not anything asked.
   ========================================================================= */

function makeWheel(shared) {
    "use strict"

    const dimensions = shared.dimensions
    const score = shared.score
    const known = shared.known
    const reachOf = shared.reachOf
    const teaseValue = shared.teaseValue
    const sentence = shared.sentence
    const voteButtons = shared.voteButtons
    const figureHolder = shared.figureHolder
    const showTip = shared.showTip
    const hideTip = shared.hideTip

    const WHEEL_OF = "archetypes"
    const WHEEL_KEY = "Archetype"
    const WHEEL_MOST = 3 // archetypes that may tie for the lead before the wheel is called even

    const WHEEL = [
        {
            dimension: "Idealist",
            colour: "#79bc43",
            reading: "you tend to expect things to turn out well, and that trust keeps you loyal to people and projects long after others have given up on them.",
        },
        {
            dimension: "Sage",
            colour: "#40a75b",
            reading: "you would rather know the truth than be comfortable, and you go looking for it even when nobody wants to hear it.",
        },
        {
            dimension: "Seeker",
            colour: "#009a93",
            reading: "what pulls you is the next horizon rather than the safe harbour, and you have learnt more about yourself by leaving than by staying.",
        },
        {
            dimension: "Revolutionary",
            colour: "#009fe3",
            reading:
                "you can let things end. Where others patch and preserve, you clear the ground, because nothing new grows in a space that is already taken.",
        },
        {
            dimension: "Magician",
            colour: "#3b429f",
            reading:
                "you work on how a situation is seen rather than on the situation itself, and you have found that changing the frame tends to change the outcome.",
        },
        {
            dimension: "Warrior",
            colour: "#5d399c",
            reading: "you go straight at whatever is in the way, and once you can see a problem you feel personally responsible for it.",
        },
        {
            dimension: "Realist",
            colour: "#9e299a",
            reading: "you have no need to stand above anyone. You are usually the steady, down-to-earth one in the room rather than the loud one.",
        },
        {
            dimension: "Jester",
            colour: "#e41b6c",
            reading: "you hold on to lightness, because taking something seriously is not the same as taking it heavily.",
        },
        {
            dimension: "Lover",
            colour: "#ea3f35",
            reading: "you measure a life by its closeness. For you, meaning is found in intimacy, not earned somewhere else and brought home.",
        },
        {
            dimension: "Creator",
            colour: "#f68d1e",
            reading: "you need to be making something, and to you beauty and originality are the point, not the decoration.",
        },
        {
            dimension: "Ruler",
            colour: "#fab913",
            reading: "you are at your best when you are holding things together, and order is something you build rather than something you put up with.",
        },
        {
            dimension: "Caregiver",
            colour: "#e8d21a",
            reading: "you notice who is struggling before they say anything, and you can't quite leave it there. That is a gift, and it is worth asking who looks after you.",
        },
    ]

    // Named directly rather than found through `dimensionsIn`, so the block
    // being left out of the timeline narrows the wheel instead of throwing.
    const HELD = WHEEL.filter((one) => known(one.dimension))

    const CX = 220
    const CY = 176
    const R = 118

    function point(angle, distance) {
        return [CX + Math.cos(angle) * distance, CY + Math.sin(angle) * distance]
    }

    // A petal stops a little short of its neighbours, or twelve read as a ring.
    function petal(angle, half, distance) {
        const [x1, y1] = point(angle - half, distance)
        const [x2, y2] = point(angle + half, distance)
        const r = distance.toFixed(1)
        return "M" + CX + " " + CY + " L" + x1.toFixed(1) + " " + y1.toFixed(1) + " A" + r + " " + r + " 0 0 1 " + x2.toFixed(1) + " " + y2.toFixed(1) + " Z"
    }

    // Every archetype tied for the top, or nothing while any is unanswered:
    // short scales tie often, and picking one would be inventing a winner.
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

    function drawWheel(chart, tease) {
        const step = (2 * Math.PI) / HELD.length
        const half = (step / 2) * 0.84
        const top = tease ? [] : leading()

        chart.setAttribute("viewBox", "0 0 440 356")
        chart.classList.add("wheel")
        chart.innerHTML = ""

        for (let ring = 1; ring <= 3; ring++) chart.appendChild(draw("circle", { class: "chart__ring", cx: CX, cy: CY, r: (R * ring) / 3 }))

        // Spokes and names first, so the petals lie over them.
        HELD.forEach((one, position) => {
            const angle = position * step - Math.PI / 2
            const [ex, ey] = point(angle, R)
            chart.appendChild(draw("line", { class: "chart__axis", x1: CX, y1: CY, x2: ex, y2: ey }))

            const [labelX, labelY] = point(angle, R + 20)
            const label = draw("text", {
                class: "chart__label" + (!tease && score(one.dimension) === undefined ? " chart__label--awaiting" : ""),
                x: labelX,
                y: labelY,
                "text-anchor": Math.abs(labelX - CX) < 8 ? "middle" : labelX > CX ? "start" : "end",
                "dominant-baseline": "middle",
            })
            label.textContent = one.dimension
            chart.appendChild(label)
        })

        HELD.forEach((one, position) => {
            const value = tease ? teaseValue(one.dimension) : score(one.dimension)
            if (value === undefined) return

            const angle = position * step - Math.PI / 2
            const shape = draw("path", {
                class: "wheel__petal" + (top.indexOf(one) !== -1 ? " wheel__petal--leading" : ""),
                style: "--chart: " + one.colour + "; animation-delay: " + (position * 0.05).toFixed(2) + "s",
                // Kept off nothing: an answer at the bottom of the scale is
                // still an answer, and a petal of no size reads as one never given.
                d: petal(angle, half, Math.max(9, reachOf(one.dimension, value) * R)),
            })

            if (!tease) {
                const text = one.dimension + ": " + value.toFixed(1) + " of " + dimensions[one.dimension][0].highest
                shape.appendChild(draw("title", {})).textContent = text
                shape.addEventListener("mouseenter", () => showTip(shape, text))
                shape.addEventListener("mouseleave", hideTip)
            }
            chart.appendChild(shape)
        })
    }

    // "The Sage", "The Sage & the Lover", "The Sage, the Jester & the Lover".
    function names(top) {
        const list = top.map((one, at) => (at === 0 ? "The " : "the ") + one.dimension)
        return list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + " & " + list[list.length - 1]
    }

    function renderWheel(locked) {
        const holder = document.createElement("div")
        holder.className = "wheel__all"

        const chart = figureHolder(
            locked ? "Blurred preview of your archetype wheel, still locked" : "Your twelve archetypes, each a petal of a wheel filled to how strongly it describes you",
            "result__chart--wide",
            locked,
        )
        drawWheel(chart.figure, locked)
        holder.appendChild(chart.holder)

        const piece = (className, text) => {
            const line = document.createElement("p")
            line.className = className + (locked && className !== "wheel__lead" ? " blank" : "")
            line.textContent = text
            holder.appendChild(line)
        }

        const top = locked ? HELD.slice(0, 1) : leading()

        // An even wheel is a real result, and better said than resolved by
        // crowning whichever archetype is written first.
        if (top.length > WHEEL_MOST) {
            piece("wheel__lead", "Your wheel is an even one")
            piece("wheel__told", sentence("no single story stands out. You carry these in much the same measure, and that is a real result rather than a failure to pick one."))
        } else {
            piece("wheel__lead", top.length > 1 ? "You lead with these, in equal measure" : "You lead with")
            piece("wheel__name", names(top))
            for (const one of top) piece("wheel__told", top.length > 1 ? "The " + one.dimension + ": " + one.reading : sentence(one.reading))
        }

        if (!locked) holder.appendChild(voteButtons(WHEEL_KEY))
        return holder
    }

    return { WHEEL_OF: WHEEL_OF, WHEEL_KEY: WHEEL_KEY, leading: leading, renderWheel: renderWheel }
}
