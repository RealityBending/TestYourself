/* =========================================================================
   The last year as a climb. A figure in profile stands at the foot of a hill,
   and four things about the year are drawn into the scene rather than told:
   how steep the hill is (Emotional Intensity), who is on it with you (Social
   Withdrawal), the pack on your back (Bodily Complaints), and the weather
   (the PHQ-4's last two weeks, so the fortnight sits on the same picture as
   the year). Three of the four are read as a standing among the HiTOP-BR's
   development sample — those norms are real, and the spectra pile up at their
   floor, so a reach along the scale would draw nearly everyone the same
   gentle hill — and the weather is read against the PHQ-4's own bands. The
   summit is always in frame and the path always reaches it.
   ========================================================================= */

function makeClimb(shared) {
    "use strict"

    const score = shared.score
    const total = shared.total
    const known = shared.known
    const normOf = shared.normOf
    const percentile = shared.percentile
    const teaseReach = shared.teaseReach
    const pickButtons = shared.pickButtons
    const VOTES = shared.VOTES
    const figureHolder = shared.figureHolder
    const showTip = shared.showTip
    const hideTip = shared.hideTip

    const CLIMB_OF = ["phq4", "hitopbr"]
    const CLIMB_KEY = "Year"
    const SAMPLE = 780 // the HiTOP-BR's development sample, which the three standings are read against
    const MOOD_FULL = 9 // the PHQ-4 total at which the sky is fully overcast: the foot of its "severe" band

    const W = 600
    const H = 400
    const GROUND = 330 // the flat ground the figure stands on
    const FOOT_X = 150 // where the hill begins to rise
    const SPAN = 380 // how far the rise runs before the plateau
    const YOU_X = 105
    const INK = "#0b1220" // the silhouettes

    // What the picture is made of, one entry a channel, each lit in a colour
    // of its own rather than of anything in the scene. `what` is said on
    // hovering the channel's bar.
    const CHANNELS = [
        {
            key: "slope",
            name: "Emotional Intensity",
            colour: "#f2a3a3",
            what: "How steep the hill is. Worry, low moods and hard feelings about yourself over the year make the climb a cliff.",
        },
        {
            key: "alone",
            name: "Solitude",
            colour: "#a3c4f2",
            what: "Who is on the hill with you. The more you have kept to yourself this year, the further off the other figures are, until there are none.",
        },
        {
            key: "load",
            name: "Bodily Complaints",
            colour: "#f2d7a3",
            what: "The pack on your back. A body that has complained through the year is weight carried up.",
        },
        {
            key: "cloud",
            name: "Mood",
            colour: "#c8c8d8",
            what: "The weather. This one is the last two weeks, not the year: the more anxious or low they have been, the lower the cloud.",
        },
    ]

    // The two ends drawn under the person's own hill.
    const EASY = { slope: 0.06, alone: 0.05, load: 0.06, cloud: 0.04 }
    const HARD = { slope: 0.96, alone: 0.96, load: 0.95, cloud: 0.95 }

    let count = 0

    // Lehmer's generator, seeded from the four values, so the same answers
    // draw the same hill however often the panel is reopened.
    function seeded(seed) {
        let state = Math.floor(seed) % 2147483647
        if (state <= 0) state += 2147483646
        return () => {
            state = (state * 16807) % 2147483647
            return (state - 1) / 2147483646
        }
    }

    /* ------------------------------ the values ----------------------------- */

    // Where somebody stands among the development sample on a spectrum, or
    // nothing while it is unanswered or not in this run.
    function standing(dimension) {
        if (!known(dimension)) return undefined
        const norm = normOf(dimension)
        const value = score(dimension)
        return norm && value !== undefined ? percentile(value, norm) : undefined
    }

    // The fortnight's weather: the PHQ-4 total as a share of the way to its
    // top band, so a clear sky is a total of nought and the cloud is down on
    // the hill at nine or more.
    function mood() {
        if (!known("Anxiety") || !known("Depression")) return undefined
        const anxiety = total("Anxiety")
        const depression = total("Depression")
        return anxiety === undefined || depression === undefined ? undefined : Math.min(1, (anxiety + depression) / MOOD_FULL)
    }

    function year(tease) {
        if (tease) {
            return {
                slope: teaseReach("Emotional Intensity", 0, 1),
                alone: teaseReach("Solitude", 0, 1),
                load: teaseReach("Bodily Complaints", 0, 1),
                cloud: teaseReach("Mood", 0, 1),
            }
        }
        return { slope: standing("Emotional Intensity"), alone: standing("Solitude"), load: standing("Bodily Complaints"), cloud: mood() }
    }

    // Whether there is a hill to draw yet: every channel answered.
    function climbed() {
        const now = year(false)
        return Object.keys(now).every((key) => now[key] !== undefined)
    }

    /* ------------------------------- the scene ----------------------------- */

    function stops(gradient, list) {
        for (const [offset, colour, opacity] of list) {
            const stop = { offset: offset, "stop-color": colour }
            if (opacity !== undefined) stop["stop-opacity"] = opacity
            gradient.appendChild(draw("stop", stop))
        }
        return gradient
    }

    // A sky that greys over as the cloud comes down, and a hill lit less as it does.
    function defs(id, cloud) {
        const out = draw("defs", {})
        out.appendChild(
            stops(draw("linearGradient", { id: id + "-sky", x1: 0, y1: 0, x2: 0, y2: 1 }), [
                [0, mix("#4f8fc7", "#525b66", cloud)],
                [0.7, mix("#a7c9e2", "#7d858e", cloud)],
                [1, mix("#e8d6b6", "#959ba2", cloud)],
            ]),
        )
        out.appendChild(
            stops(draw("linearGradient", { id: id + "-hill", x1: 0, y1: 0, x2: 0, y2: 1 }), [
                [0, mix("#4d6b4a", "#3d4a44", cloud)],
                [1, mix("#1d2a21", "#171d1c", cloud)],
            ]),
        )
        out.appendChild(draw("clipPath", { id: id + "-clip" })).appendChild(draw("rect", { x: 0, y: 0, width: W, height: H, rx: 12 }))
        return out
    }

    // The height of the ground at x. The rise is a logistic ramp whose
    // steepness grows with the slope channel: gentle, it is close to a
    // straight incline; steep, it is a cliff face with a plateau above. The
    // same function is bent by one number, so a hill never jumps from walk to
    // cliff between one answer and the next.
    function surface(slope) {
        const k = 3 + 11 * slope
        const rise = 90 + 190 * slope
        const lo = 1 / (1 + Math.exp(k * 0.5))
        const hi = 1 / (1 + Math.exp(-k * 0.5))
        const ramp = (t) => (1 / (1 + Math.exp(-k * (t - 0.5))) - lo) / (hi - lo)
        return (x) => (x <= FOOT_X ? GROUND : x >= FOOT_X + SPAN ? GROUND - rise : GROUND - rise * ramp((x - FOOT_X) / SPAN))
    }

    function hill(into, id, height, random) {
        const points = []
        for (let x = 0; x <= W; x += 6) points.push(x.toFixed(0) + "," + height(x).toFixed(1))
        into.appendChild(draw("polygon", { points: points.join(" ") + " " + W + "," + H + " 0," + H, fill: "url(#" + id + "-hill)" }))

        // The path up: always drawn, always reaching the top.
        const trail = []
        for (let x = YOU_X + 12; x <= FOOT_X + SPAN + 30; x += 6) trail.push((x === YOU_X + 12 ? "M" : "L") + x.toFixed(0) + " " + (height(x) - 2.5).toFixed(1))
        into.appendChild(
            draw("path", { d: trail.join(" "), fill: "none", stroke: "rgba(255, 255, 255, 0.38)", "stroke-width": 1.6, "stroke-dasharray": "5 6", "stroke-linecap": "round" }),
        )

        // Tufts of grass, where the seed puts them.
        for (let i = 0; i < 16; i++) {
            const x = 20 + random() * (W - 40)
            const y = height(x)
            const size = 3 + random() * 4
            into.appendChild(
                draw("path", {
                    d: "M" + (x - size).toFixed(1) + " " + y.toFixed(1) + " l" + (size * 0.6).toFixed(1) + " -" + (size * 1.4).toFixed(1) + " l" + (size * 0.5).toFixed(1) + " " + (size * 1.4).toFixed(1),
                    fill: "none",
                    stroke: "rgba(210, 230, 200, 0.35)",
                    "stroke-width": 1.2,
                    "stroke-linecap": "round",
                }),
            )
        }

        // A cairn on the plateau: the top is a place, and it is in the frame.
        const cx = FOOT_X + SPAN + 40
        const top = height(cx)
        for (const [w, h, dy] of [[16, 7, 0], [12, 6, 7], [8, 5, 13]]) {
            into.appendChild(draw("rect", { x: (cx - w / 2).toFixed(1), y: (top - dy - h).toFixed(1), width: w, height: h, rx: 2.5, fill: "#2a3330" }))
        }
    }

    function sky(into, id, cloud, random) {
        into.appendChild(draw("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#" + id + "-sky)" }))
        into.appendChild(draw("circle", { cx: 74, cy: 64, r: 22, fill: "#fff2cf", opacity: (0.9 * (1 - cloud)).toFixed(3) }))

        // More puffs, lower and greyer, as the fortnight has weighed more.
        const puffs = Math.round(1 + 9 * cloud)
        const shade = mix("#ffffff", "#6f7781", cloud)
        for (let i = 0; i < puffs; i++) {
            const cx = random() * W
            const cy = 28 + random() * (40 + 200 * cloud)
            const size = 0.7 + random() * 0.8
            const puff = draw("g", { class: "climb__cloud", transform: "translate(" + cx.toFixed(1) + " " + cy.toFixed(1) + ") scale(" + size.toFixed(2) + ")", opacity: (0.55 + 0.4 * cloud).toFixed(2) })
            puff.appendChild(draw("ellipse", { cx: 0, cy: 0, rx: 44, ry: 13, fill: shade }))
            puff.appendChild(draw("ellipse", { cx: -14, cy: -7, rx: 22, ry: 12, fill: shade }))
            puff.appendChild(draw("ellipse", { cx: 16, cy: -6, rx: 18, ry: 10, fill: shade }))
            puff.style.animationDuration = (18 + random() * 14).toFixed(2) + "s"
            puff.style.animationDelay = (-random() * 30).toFixed(2) + "s"
            into.appendChild(puff)
        }
        // Haze over the whole scene, thickening with the cloud.
        into.appendChild(draw("rect", { x: 0, y: 0, width: W, height: H, fill: "#8b939c", opacity: (0.32 * cloud).toFixed(3) }))
    }

    // A walker in profile, facing the hill, mid-stride, with a pack sized to
    // the load and a lean into it. `at` is where the feet are.
    function walker(into, x, y, scale, load, className) {
        const lean = 3 + 9 * load
        const g = draw("g", { class: className, transform: "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + scale + ")" })
        const line = (d, width) => g.appendChild(draw("path", { d: d, fill: "none", stroke: INK, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round" }))

        const packW = 7 + 13 * load
        const packH = 13 + 19 * load
        g.appendChild(draw("rect", { x: (lean - 5 - packW).toFixed(1), y: (-50 - packH * 0.25).toFixed(1), width: packW.toFixed(1), height: packH.toFixed(1), rx: 4, fill: INK }))

        line("M0 -22 L" + lean.toFixed(1) + " -46", 5) // torso
        line("M0 -22 L-9 0", 3.2) // back leg
        line("M0 -22 L8 -3 L12 0", 3.2) // front leg
        line("M" + lean.toFixed(1) + " -42 L" + (lean + 9).toFixed(1) + " -29", 2.6) // front arm
        line("M" + lean.toFixed(1) + " -42 L" + (lean - 6).toFixed(1) + " -31", 2.6) // back arm
        g.appendChild(draw("circle", { cx: (lean + 2).toFixed(1), cy: -56, r: 6.2, fill: INK }))
        into.appendChild(g)
    }

    // The other figures: three close by at the sociable end, thinning out and
    // drawing off up the hill as the year was spent more alone, then none.
    function company(into, alone, height) {
        const n = alone < 0.22 ? 3 : alone < 0.48 ? 2 : alone < 0.78 ? 1 : 0
        for (let k = 0; k < n; k++) {
            const x = YOU_X + 62 + k * 52 + alone * 150
            walker(into, x, height(x), 0.82, 0.1, "climb__other")
        }
    }

    function drawClimb(chart, now) {
        const id = "climb" + count++
        const random = seeded(1 + now.slope * 7919 + now.alone * 104729 + now.load * 15485863 + now.cloud * 32452843)
        const height = surface(now.slope)

        chart.setAttribute("viewBox", "0 0 " + W + " " + H)
        chart.classList.add("climb")
        chart.innerHTML = ""
        chart.appendChild(defs(id, now.cloud))

        const scene = draw("g", { "clip-path": "url(#" + id + "-clip)" })
        sky(scene, id, now.cloud, random)
        hill(scene, id, height, random)
        company(scene, now.alone, height)
        walker(scene, YOU_X, GROUND, 1, now.load, "climb__you")
        chart.appendChild(scene)

        chart.appendChild(draw("rect", { x: 0.5, y: 0.5, width: W - 1, height: H - 1, rx: 12, fill: "none", stroke: "rgba(255, 255, 255, 0.10)" }))
    }

    /* ------------------------------ the section ---------------------------- */

    function text(tag, className, words) {
        const element = document.createElement(tag)
        element.className = className
        element.textContent = words
        return element
    }

    function end(now, name, caption, told) {
        const figure = document.createElement("figure")
        figure.className = "climbview__end"
        const svg = document.createElementNS(SVG, "svg")
        svg.setAttribute("role", "img")
        svg.setAttribute("aria-label", told)
        drawClimb(svg, now)
        figure.appendChild(svg)

        const said = document.createElement("figcaption")
        said.innerHTML = "<b></b><span></span>"
        said.firstChild.textContent = name
        said.lastChild.textContent = caption
        figure.appendChild(said)
        return figure
    }

    // The four channels as a bar chart under the hill: a column apiece, filled
    // from the foot to the value the scene is drawn from, named underneath,
    // and explained on hover — the explanation is in the tooltip rather than
    // on the page, so the chart stays four bars and four names.
    function bars(now) {
        const chart = document.createElement("div")
        chart.className = "climbview__bars"
        chart.setAttribute("role", "list")

        for (const channel of CHANNELS) {
            const share = Math.round(now[channel.key] * 100)
            const told = channel.name + ": " + share + "%. " + channel.what
            const column = document.createElement("div")
            column.className = "climbview__col"
            column.setAttribute("role", "listitem")
            column.setAttribute("aria-label", told)
            column.tabIndex = 0
            column.style.setProperty("--key", channel.colour)
            column.innerHTML = '<span class="climbview__track" aria-hidden="true"><i class="climbview__fill"></i></span><b class="climbview__name"></b>'
            column.querySelector(".climbview__fill").style.height = share + "%"
            column.lastChild.textContent = channel.name
            column.addEventListener("mouseenter", () => showTip(column.firstChild, told))
            column.addEventListener("mouseleave", hideTip)
            column.addEventListener("focus", () => showTip(column.firstChild, told))
            column.addEventListener("blur", hideTip)
            chart.appendChild(column)
        }
        return chart
    }

    // A title, the person's own hill at the width of the card, the four
    // channels as bars under it, a note on where the picture came from, the
    // two ends under a line of their own, and one question. Locked, the title
    // and the scene alone.
    function renderClimb(locked) {
        const all = document.createDocumentFragment()
        const now = year(locked)

        const head = document.createElement("header")
        head.className = "climbview__head"
        head.appendChild(text("h3", "climbview__title", "Challenges"))
        all.appendChild(head)

        const stage = figureHolder(
            locked
                ? "Blurred preview of the hill your answers will draw"
                : "The last year as a hill: how steep it is, who is on it with you, the pack on your back and the weather over it",
            "result__chart--wide climbview__stage",
            locked,
        )
        stage.figure.classList.add("climb--stage")
        drawClimb(stage.figure, now)
        all.appendChild(stage.holder)
        if (locked) return all

        all.appendChild(bars(now))

        all.appendChild(
            text(
                "p",
                "climbview__note",
                "The hill is drawn from four things worked out from your answers: three from the last twelve months and one from the last two weeks. " +
                    "For the three, the bar is where you stand among the " +
                    SAMPLE +
                    " people the year's scales were developed on; for the weather, it is how far the last two weeks go towards the top of their own scale. None of it is a diagnosis.",
            ),
        )

        const others = document.createElement("div")
        others.className = "climbview__others"
        others.appendChild(text("p", "climbview__aside", "Other people climb other hills"))
        others.appendChild(text("p", "climbview__note", "The same hill as it looks from the two far ends of all four bars. Most people stand somewhere between them."))
        const ends = document.createElement("div")
        ends.className = "climbview__ends"
        ends.appendChild(end(EASY, "A gentle morning, in company", "The foot of all four bars", "The same hill at the foot of all four bars"))
        ends.appendChild(end(HARD, "A cliff in cloud, alone, with a heavy pack", "The top of all four bars", "The same hill at the top of all four bars"))
        others.appendChild(ends)
        all.appendChild(others)

        const vote = document.createElement("div")
        vote.className = "climbview__vote"
        vote.appendChild(text("p", "climbview__ask", "Does this match how the last year felt?"))
        vote.appendChild(pickButtons(CLIMB_KEY, VOTES))
        all.appendChild(vote)

        return all
    }

    // The bar chart on its own, for the landing page's showcase: drawn from
    // the stand-ins when teased, the way the locked scene is.
    function renderBars(tease) {
        return bars(year(tease))
    }

    return { CLIMB_OF: CLIMB_OF, CLIMB_KEY: CLIMB_KEY, climbed: climbed, renderClimb: renderClimb, renderBars: renderBars }
}
