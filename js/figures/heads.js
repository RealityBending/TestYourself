/* =========================================================================
   One head between what it feels and what it aims at: a bulb above, a heart
   below, a head in profile between them, and a cord from the head to each
   with a knot in it — the whole of what the Passion & Restraint level (the
   `regulation` block) feeds back. Four numbers, each doing one legible thing
   to the picture and nothing else: how big the heart is (how strongly emotion
   comes), how big the knot on the cord down to it (how much the thinking
   loops when something hits), how big and bright the bulb is (how firmly a
   goal holds against what pulls at it), and how big the knot on the cord up
   to it (how much the way to a goal wanders). The level records sixteen
   dimensions; this shows four things made of eleven of them and says so,
   since a figure that showed all sixteen would show nothing. Every channel is
   a reach along its own scale, not a standing — the norms behind these
   questionnaires are placeholders — and a knot is a busy head, which the
   words under it say, and not a broken one. (It was two heads facing each
   other with a tangle round each organ for a day, which is why the file and
   its functions are called heads; the tangle read as noise at every setting,
   and a knot on a cord is a thing with a name and a size.)
   ========================================================================= */

function makeHeads(shared) {
    "use strict"

    const dimensions = shared.dimensions
    const score = shared.score
    const known = shared.known
    const reachOf = shared.reachOf
    const teaseValue = shared.teaseValue
    const sentence = shared.sentence
    const pickButtons = shared.pickButtons
    const VOTES = shared.VOTES
    const figureHolder = shared.figureHolder

    const HEADS_OF = ["control", "ers", "cerq"]
    const HEART_KEY = "Heart"
    const MIND_KEY = "Mind"

    // The four channels, each the mean reach of the dimensions it is made of:
    // the mean of reaches rather than the reach of a mean, so scales of
    // different lengths weigh the same. `what` is said under the bar.
    const CHANNELS = [
        {
            key: "feeling",
            head: "heart",
            name: "Feeling",
            colour: "#f2a3b8",
            of: ["Emotional Sensitivity", "Emotional Arousal", "Emotional Persistence"],
            what: "How big the heart is: how easily emotion is set off, how strongly it comes and how long it stays.",
        },
        {
            key: "loops",
            head: "heart",
            name: "Circling",
            colour: "#f2c9a3",
            of: ["Rumination", "Catastrophising", "Self-blame", "Other-blame"],
            what: "How big the knot on the cord to the heart: how often, when something hits, the thinking goes over it, dwells on how bad it is and looks for whose fault it was.",
        },
        {
            key: "grip",
            head: "mind",
            name: "Grip",
            colour: "#f2e0a3",
            of: ["Self-Control"],
            what: "How big and bright the bulb is: how firmly a goal holds you against temptation and habit.",
        },
        {
            key: "drift",
            head: "mind",
            name: "Wandering",
            colour: "#a3d0f2",
            of: ["Mind Wandering", "Absent-mindedness", "Inattention"],
            what: "How big the knot on the cord to the bulb: how often the mind drifts off, drops the thread and leaves the last stretch unfinished.",
        },
    ]

    // Each half reads as one of four sentences, from which side of the middle
    // its two channels fall — the temperament's rule. Written to a person who
    // might land in any of them, and deliberately unnamed: a label over the
    // sentence ("Full and caught") read as a verdict, and went in September
    // 2026.
    const HEART = {
        "big-clean": "you feel things strongly, and when something hits, your thinking moves through it rather than round it.",
        "big-tangled":
            "you feel things strongly, and when something hits, your thinking tends to circle it: going over it, dwelling on how bad it was, looking for whose fault it was.",
        "small-clean": "little stirs you, and what does passes without much turning over.",
        "small-tangled": "little stirs you, but what does tends to stay: your thinking circles it for longer than the feeling itself lasts.",
    }
    const MIND = {
        "big-clean": "you hold a goal firmly and the way to it stays clear: your attention goes where you send it.",
        "big-tangled":
            "you hold a goal firmly, but your attention wanders on the way to it: the mind drifts, threads get dropped, the last stretch goes unfinished.",
        "small-clean": "your attention stays where you put it, but a goal does not grip you hard: temptation and habit get their say.",
        "small-tangled": "a goal does not grip you hard and your attention wanders, so much of a day goes where it likes rather than where you send it.",
    }

    // The two ends drawn under the person's own heads.
    const QUIET = { feeling: 0.06, loops: 0.05, grip: 0.06, drift: 0.05 }
    const FULL = { feeling: 0.95, loops: 0.96, grip: 0.95, drift: 0.96 }

    const W = 300
    const H = 600
    const HEAD_SCALE = 0.7 // the profile path is drawn in a 230 × 286 box; the head is this much of it
    const HEAD_X = 58 // where the head sits, so that its crown is on the axis of the picture
    const HEAD_Y = 205
    const CROWN = [132, 0] // where the cord to the bulb leaves the profile, in the path's own box
    const THROAT = [100, 285] // where the cord to the heart leaves it
    const BULB_AT = [150, 58]
    const HEART_AT = [128, 540]
    const KNOT_MOST = 40 // the radius of a knot at the top of its scale
    const INK = "#0b1220"

    let count = 0

    // Lehmer's generator, seeded from the four values, so the same answers
    // draw the same lines however often the panel is reopened.
    function seeded(seed) {
        let state = Math.floor(seed) % 2147483647
        if (state <= 0) state += 2147483646
        return () => {
            state = (state * 16807) % 2147483647
            return (state - 1) / 2147483646
        }
    }

    /* ------------------------------ the values ---------------------------- */

    // One channel: the mean reach of its dimensions, undefined while any is
    // unanswered, the stand-in when teased.
    function channel(one, tease) {
        const reaches = one.of.map((dimension) => {
            if (!known(dimension)) return undefined
            const value = tease ? teaseValue(dimension) : score(dimension)
            return value === undefined ? undefined : reachOf(dimension, value)
        })
        if (reaches.some((reach) => reach === undefined)) return undefined
        return reaches.reduce((sum, reach) => sum + reach, 0) / reaches.length
    }

    function now(tease) {
        const values = {}
        for (const one of CHANNELS) values[one.key] = channel(one, tease)
        return values
    }

    // Whether there are heads to draw yet: every channel answered.
    function headed() {
        const values = now(false)
        return Object.keys(values).every((key) => values[key] !== undefined)
    }

    function readingOf(table, size, tangle) {
        return table[(size >= 0.5 ? "big" : "small") + "-" + (tangle >= 0.5 ? "tangled" : "clean")]
    }

    /* ------------------------------- the scene ---------------------------- */

    // A profile facing right, in a 230 × 286 box. The outline is "Profile
    // Silhouette 02" by Mcbdixon on Wikimedia Commons, released under CC0
    // (public domain), mirrored to face right and fitted to the box by a
    // throwaway script (the source is 1080 × 1080 and faces left); nothing
    // else of the file is used. Drawn by hand twice before that, and neither
    // time did the skull come out as big as a skull is.
    const PROFILE =
        "M 166.4 7.7 C 198.1 14.7 209.5 29.5 218.4 45.6 C 226.7 60.5 215.6 70.5 215.6 70.5 C 215.6 70.5 221.1 90.4 220.2 96.1 " +
        "C 219.3 101.7 212.7 109.8 218.4 122.8 C 222.5 132.2 221.0 130.5 226.5 141.4 C 230.0 148.5 225.7 160.1 217.3 158.3 " +
        "C 205.7 155.7 216.1 166.9 215.6 170.2 C 214.1 180.7 201.1 176.3 208.6 177.6 C 211.7 178.2 213.7 185.3 210.7 187.4 " +
        "C 204.4 191.8 202.4 190.9 204.4 199.4 C 205.3 203.5 203.4 213.1 199.1 216.9 C 192.1 223.2 184.3 216.5 177.3 216.9 " +
        "C 169.2 217.5 149.4 210.7 144.0 214.5 C 138.5 218.2 131.0 225.4 136.2 240.4 C 141.5 255.5 165.4 278.4 165.4 278.4 " +
        "C 165.4 278.4 93.0 285.9 59.7 273.5 C 26.4 261.0 0.0 224.6 0.0 224.6 C 0.0 224.6 18.5 213.5 27.0 213.4 " +
        "C 38.5 213.4 56.6 186.7 51.6 189.9 C 44.9 194.3 53.4 156.7 46.0 141.8 C 37.4 124.5 21.2 88.7 27.0 60.0 " +
        "C 30.9 41.0 55.0 17.7 76.2 9.1 C 94.7 1.5 131.9 0.0 166.4 7.7 Z"

    function stops(gradient, list) {
        for (const [offset, colour, opacity] of list) {
            const stop = { offset: offset, "stop-color": colour }
            if (opacity !== undefined) stop["stop-opacity"] = opacity
            gradient.appendChild(draw("stop", stop))
        }
    }

    function defs(id) {
        const block = draw("defs", {})

        const glow = draw("radialGradient", { id: id + "-heartglow" })
        stops(glow, [
            [0, "#ff6b8a", 0.55],
            [1, "#ff6b8a", 0],
        ])
        block.appendChild(glow)

        const light = draw("radialGradient", { id: id + "-bulbglow" })
        stops(light, [
            [0, "#ffe08a", 0.7],
            [1, "#ffe08a", 0],
        ])
        block.appendChild(light)

        const skin = draw("linearGradient", { id: id + "-skin", x1: 0, y1: 0, x2: 0, y2: 1 })
        stops(skin, [
            [0, "#16213a"],
            [1, INK],
        ])
        block.appendChild(skin)

        return block
    }

    // Where the profile's crown and throat fall on the page.
    function onHead(spot) {
        return [HEAD_X + spot[0] * HEAD_SCALE, HEAD_Y + spot[1] * HEAD_SCALE]
    }

    // A cord from the head to an organ with a knot in the middle of it: one
    // path, straight to the knot, a seeded scribble balled up inside a circle
    // whose radius, turns and density follow one number, then straight on.
    // At nothing the line runs through with a kink in it; every step towards
    // one makes the ball bigger, denser and more doubled back, so the same
    // cord thickens into a knot rather than switching to one.
    function cord(into, from, to, amount, colour, random, delay) {
        const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
        const radius = 4 + amount * (KNOT_MOST - 4)
        const turns = 1 + amount * 9
        const steps = Math.round(10 + amount * 130)
        const stride = (turns * 2 * Math.PI) / steps
        const down = to[1] > from[1] ? 1 : -1 // which way the cord runs

        const points = [from, [mid[0], mid[1] - radius * down]]
        let angle = -Math.PI / 2
        for (let i = 0; i < steps; i++) {
            angle += stride * (1 + (random() - 0.5) * amount * 1.6)
            const reach = radius * (0.25 + random() * 0.75)
            points.push([mid[0] + Math.cos(angle) * reach, mid[1] + Math.sin(angle) * reach])
        }
        points.push([mid[0], mid[1] + radius * down], to)

        // A smooth curve through the midpoints, so the rope has no corners.
        let d = "M " + points[0][0].toFixed(1) + " " + points[0][1].toFixed(1)
        for (let i = 1; i < points.length - 1; i++) {
            const next = [(points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2]
            d += " Q " + points[i][0].toFixed(1) + " " + points[i][1].toFixed(1) + " " + next[0].toFixed(1) + " " + next[1].toFixed(1)
        }
        const last = points[points.length - 1]
        d += " L " + last[0].toFixed(1) + " " + last[1].toFixed(1)

        into.appendChild(
            draw("path", {
                class: "heads__line",
                d: d,
                fill: "none",
                stroke: colour,
                "stroke-width": 2.2,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-opacity": 0.85,
                pathLength: 1,
                style: "animation-delay: " + delay + "s",
            }),
        )
    }

    // The heart, scaled to how strongly emotion comes.
    function heart(into, id, at, scale) {
        into.appendChild(draw("circle", { cx: at[0], cy: at[1], r: 34 * scale * 1.9, fill: "url(#" + id + "-heartglow)", opacity: 0.3 + (scale - 0.62) * 0.6 }))
        into.appendChild(
            draw("path", {
                class: "heads__heart",
                d: "M 0 20 C -22 4 -32 -6 -32 -17 C -32 -29 -22 -35 -13 -35 C -6 -35 -1 -30 0 -24 C 1 -30 6 -35 13 -35 C 22 -35 32 -29 32 -17 C 32 -6 22 4 0 20 Z",
                fill: "#ef5b7a",
                stroke: "#ffb3c4",
                "stroke-width": 1.2,
                transform: "translate(" + at[0] + " " + at[1] + ") scale(" + scale.toFixed(3) + ")",
            }),
        )
    }

    // The bulb, scaled and lit to how firmly a goal holds. Its glass is a
    // circle about (0, -10) of radius 24 and its cap reaches y = 24, so the
    // cord meets it at `at[1] + 24 * scale`.
    function bulb(into, id, at, scale) {
        const lit = (scale - 0.62) / 0.78
        into.appendChild(draw("circle", { cx: at[0], cy: at[1] - 6, r: 30 * scale * 2.1, fill: "url(#" + id + "-bulbglow)", opacity: 0.25 + lit * 0.6 }))
        const group = draw("g", { class: "heads__bulb", transform: "translate(" + at[0] + " " + at[1] + ") scale(" + scale.toFixed(3) + ")" })
        group.appendChild(draw("circle", { cx: 0, cy: -10, r: 24, fill: "#f6d365", "fill-opacity": 0.35 + lit * 0.6, stroke: "#ffe9a8", "stroke-width": 1.4 }))
        group.appendChild(draw("path", { d: "M -9 12 L -11 24 L 11 24 L 9 12 Z", fill: "#9aa3b8" }))
        group.appendChild(draw("path", { d: "M -10 17 L 10 17 M -10.5 21 L 10.5 21", stroke: "#5b6478", "stroke-width": 1.4 }))
        group.appendChild(
            draw("path", {
                d: "M -6 12 L -6 -2 L -3 -12 L 0 -2 L 3 -12 L 6 -2 L 6 12",
                fill: "none",
                stroke: "#ffb347",
                "stroke-width": 1.6,
                "stroke-opacity": 0.4 + lit * 0.6,
            }),
        )
        into.appendChild(group)
    }

    // Top to bottom: the bulb, the cord down to the crown with the wandering
    // knot in it, the head, the cord from the throat down to the heart with
    // the circling knot in it, the heart.
    function drawHeads(chart, values) {
        const id = "heads" + count++
        const seed = 1 + Math.round(values.feeling * 997 + values.loops * 9973 + values.grip * 99991 + values.drift * 999983)
        const random = seeded(seed)
        const heartScale = 0.62 + values.feeling * 0.78
        const bulbScale = 0.62 + values.grip * 0.78

        chart.setAttribute("viewBox", "0 0 " + W + " " + H)
        chart.classList.add("heads")
        chart.innerHTML = ""
        chart.appendChild(defs(id))

        cord(chart, onHead(CROWN), [BULB_AT[0], BULB_AT[1] + 24 * bulbScale], values.drift, "#bfe0ff", random, 0.3)
        cord(chart, onHead(THROAT), [HEART_AT[0], HEART_AT[1] - 35 * heartScale], values.loops, "#ffb3c4", random, 0.5)

        chart.appendChild(
            draw("path", {
                class: "heads__head",
                d: PROFILE,
                transform: "translate(" + HEAD_X + " " + HEAD_Y + ") scale(" + HEAD_SCALE + ")",
                fill: "url(#" + id + "-skin)",
                stroke: "rgba(255, 255, 255, 0.22)",
                "stroke-width": 1.5 / HEAD_SCALE,
            }),
        )

        bulb(chart, id, BULB_AT, bulbScale)
        heart(chart, id, HEART_AT, heartScale)
    }

    /* ------------------------------ the section --------------------------- */

    function text(tag, className, words) {
        const element = document.createElement(tag)
        element.className = className
        element.textContent = words
        return element
    }

    // What the picture is made of, one key a channel: the name, a bar filled
    // to the reach the scene is drawn from, and what it does to the picture.
    function keys(values, which) {
        const list = document.createElement("ul")
        list.className = "headsview__keys"
        for (const one of CHANNELS) {
            if (one.head !== which) continue
            const share = Math.round(values[one.key] * 100)
            const key = document.createElement("li")
            key.className = "headsview__key"
            key.style.setProperty("--key", one.colour)
            key.innerHTML = '<b></b><span class="headsview__bar" aria-hidden="true"><i></i></span><span></span>'
            key.firstChild.textContent = one.name
            key.querySelector("i").style.width = share + "%"
            key.lastChild.textContent = one.what
            key.setAttribute("aria-label", one.name + ": " + share + "% of the way up its scale. " + one.what)
            list.appendChild(key)
        }
        return list
    }

    // One of the two readings under the picture: which head, the sentence,
    // the two bars it was drawn from, the vote.
    function card(kind, reading, values, which, ask, key) {
        const holder = document.createElement("div")
        holder.className = "headsview__card"
        holder.appendChild(text("p", "headsview__kind", kind))
        holder.appendChild(text("p", "headsview__told", sentence(reading)))
        holder.appendChild(keys(values, which))
        holder.appendChild(text("p", "headsview__ask", ask))
        holder.appendChild(pickButtons(key, VOTES))
        return holder
    }

    function end(values, name, caption, told) {
        const figure = document.createElement("figure")
        figure.className = "headsview__end"
        const svg = document.createElementNS(SVG, "svg")
        svg.setAttribute("role", "img")
        svg.setAttribute("aria-label", told)
        drawHeads(svg, values)
        figure.appendChild(svg)

        const said = document.createElement("figcaption")
        said.innerHTML = "<b></b><span></span>"
        said.firstChild.textContent = name
        said.lastChild.textContent = caption
        figure.appendChild(said)
        return figure
    }

    // A title, the two heads at the width of the card, a reading under each
    // with the bars it was drawn from and its vote, a note on where the
    // picture came from, and the two ends under a line of their own. Locked,
    // the title and the picture alone.
    function renderHeads(locked) {
        const all = document.createDocumentFragment()
        const values = now(locked)

        const headline = document.createElement("header")
        headline.className = "headsview__head"
        headline.appendChild(text("h3", "headsview__title", "Inside your head"))
        all.appendChild(headline)

        const stage = figureHolder(
            locked
                ? "Blurred preview of the picture your answers will draw"
                : "A bulb above, a heart below, a head between them, and a cord from the head to each with a knot in it as big as your answers say",
            "result__chart--wide headsview__stage",
            locked,
        )
        stage.figure.classList.add("heads--stage")
        drawHeads(stage.figure, values)
        all.appendChild(stage.holder)
        if (locked) return all

        const pair = document.createElement("div")
        pair.className = "headsview__pair"
        pair.appendChild(
            card("Your heart", readingOf(HEART, values.feeling, values.loops), values, "heart", "Does this match your emotional life?", HEART_KEY),
        )
        pair.appendChild(card("Your mind", readingOf(MIND, values.grip, values.drift), values, "mind", "Does this match how you focus?", MIND_KEY))
        all.appendChild(pair)

        all.appendChild(
            text(
                "p",
                "headsview__note",
                "The picture is drawn from four things worked out from your answers, each the average of a few of the scales you answered, and each moving one thing in it. " +
                    "The bars are how far along its own scale each one sits, not where you stand among other people. A knot is a busy head, not a broken one, and none of this is a diagnosis.",
            ),
        )

        const others = document.createElement("div")
        others.className = "headsview__others"
        others.appendChild(text("p", "headsview__aside", "Other people carry other knots"))
        others.appendChild(text("p", "headsview__note", "The same picture as it looks from the two far ends of all four bars. Most people are somewhere between them."))
        const ends = document.createElement("div")
        ends.className = "headsview__ends"
        ends.appendChild(end(QUIET, "A quiet heart, a dim bulb, two clear cords", "The foot of all four bars", "The same picture at the foot of all four bars"))
        ends.appendChild(end(FULL, "A full heart, a bright bulb, two big knots", "The top of all four bars", "The same picture at the top of all four bars"))
        others.appendChild(ends)
        all.appendChild(others)

        return all
    }

    return { HEADS_OF: HEADS_OF, HEART_KEY: HEART_KEY, MIND_KEY: MIND_KEY, headed: headed, renderHeads: renderHeads }
}
