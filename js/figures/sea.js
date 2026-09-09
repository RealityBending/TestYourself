/* =========================================================================
   World beliefs, as the water you are in. The PI-18 is not three lengths on a
   web but a place: the bottom of the descent, black water, a torch in the
   viewer's own hand, and whatever falls inside the disc it throws. Each
   dimension is one channel of the scene, read independently — Safe is what
   the creatures look like, Enticing how much colour is in anything, Alive how
   much is living in the light — and the same scene is drawn at the floor and
   the ceiling of all three scales beside the person's own, since the quickest
   way to say what a channel does is to show it doing it.

   Every scattered thing is placed from one generator seeded off the three
   scores, so the same answers draw the same sea on every render. Every id is
   suffixed from a counter, since several scenes share a page. A channel is a
   reach along its own scale, not a percentile. Nothing that moves changes
   what the picture says: the sway is a few pixels about the place a creature
   was put, on a wrapper, because a CSS transform on the creature itself would
   replace the attribute transform placing it.
   ========================================================================= */

function makeSea(shared) {
    "use strict"

    const dimensions = shared.dimensions
    const score = shared.score
    const reachOf = shared.reachOf
    const teaseValue = shared.teaseValue
    const pickButtons = shared.pickButtons
    const VOTES = shared.VOTES
    const figureHolder = shared.figureHolder

    const SEA = "pi18"
    const SEA_KEY = "World" // the one vote on the level: the picture is the prediction
    const W = 360
    const H = 280

    // The torch is pointed into the distance, so what it lights is a round pool.
    const TORCH_X = 180
    const TORCH_Y = 152
    const TORCH_RX = 118
    const TORCH_RY = 104

    // The two ends of all three scales, kept just off the ends themselves.
    // Alive is held above its floor so the floor panel still shows what Safe
    // does to a creature; "all but lifeless" is what its caption says.
    const FLOOR = { safe: 0.04, enticing: 0.05, alive: 0.19 }
    const CEILING = { safe: 0.96, enticing: 0.95, alive: 0.95 }

    const HUES = ["#f2b23c", "#e2603f", "#48c7d8", "#b06ae0", "#4fd39a", "#f06fa0"]
    const GREY = "#5b6772"
    const STONE = "#161c22"
    const PALE = "#e9f5ff"

    // What the picture is made of, one line a channel, each lit in a colour of
    // the legend's own rather than of anything in the water.
    const LINES = [
        [
            "Safe",
            "#8fd9ea",
            "What is down there with you. Round and wide-eyed when the world is a safe one; jaws, teeth and too many eyes when it is not.",
        ],
        [
            "Enticing",
            "#f28cb8",
            "How much colour there is in any of it: the creatures, the rock, the coral. A dull world is the same abyss in grey.",
        ],
        ["Alive", "#7fdcae", "How much is living in the beam at all, from a bare floor to water thick with it."],
    ]

    let count = 0

    // Lehmer's generator: short enough to read.
    function seeded(seed) {
        let state = Math.floor(seed) % 2147483647
        if (state <= 0) state += 2147483646
        return () => {
            state = (state * 16807) % 2147483647
            return (state - 1) / 2147483646
        }
    }

    // A dimension still unanswered leaves its channel in the middle; on a
    // finished level all three are answered, and a locked one draws the tease.
    function reach(dimension, tease) {
        if (!dimensions[dimension]) return 0.5
        const value = tease ? teaseValue(dimension) : score(dimension)
        return value === undefined ? 0.5 : reachOf(dimension, value)
    }

    function stops(gradient, list) {
        for (const [offset, colour, opacity] of list) {
            const stop = { offset: offset, "stop-color": colour }
            if (opacity !== undefined) stop["stop-opacity"] = opacity
            gradient.appendChild(draw("stop", stop))
        }
        return gradient
    }

    function defs(id) {
        const out = draw("defs", {})
        out.appendChild(
            stops(draw("linearGradient", { id: id + "-water", x1: 0, y1: 0, x2: 0, y2: 1 }), [
                [0, "#050b12"],
                [1, "#010407"],
            ]),
        )
        out.appendChild(
            stops(draw("radialGradient", { id: id + "-pool" }), [
                [0, "#d8efff", 0.4],
                [0.45, "#b5dcf5", 0.24],
                [0.8, "#8cc2e6", 0.09],
                [1, "#7fb8dd", 0],
            ]),
        )
        // The dark everywhere the torch is not, which is what makes it a torch.
        out.appendChild(
            stops(draw("radialGradient", { id: id + "-dark", cx: TORCH_X / W, cy: TORCH_Y / H, r: 0.62 }), [
                [0, "#010407", 0],
                [0.5, "#010407", 0.2],
                [1, "#000103", 0.97],
            ]),
        )
        const clip = draw("clipPath", { id: id + "-clip" })
        clip.appendChild(draw("rect", { x: 0, y: 0, width: W, height: H, rx: 12 }))
        out.appendChild(clip)
        return out
    }

    function floor(into, world, random) {
        const stone = mix(STONE, "#3c5a63", world.enticing * 0.8)
        const bedY = 214

        let bed = "M-6 " + H + " L-6 " + (bedY + 16)
        for (let x = 0; x <= W + 10; x += 30) bed += " L" + x + " " + (bedY + (random() - 0.5) * 20).toFixed(1)
        into.appendChild(draw("path", { d: bed + " L" + (W + 6) + " " + H + " Z", fill: stone }))

        for (let i = 0; i < 5; i++) {
            const x = 30 + random() * (W - 60)
            const wide = 22 + random() * 46
            const top = bedY - (16 + random() * 34) + 8
            const hue = mix(stone, HUES[Math.floor(random() * HUES.length)], world.enticing * 0.5)
            into.appendChild(
                draw("path", {
                    fill: hue,
                    d:
                        "M" +
                        (x - wide / 2) +
                        " " +
                        (bedY + 12) +
                        " L" +
                        (x - wide * 0.34) +
                        " " +
                        top +
                        " L" +
                        (x + wide * 0.1) +
                        " " +
                        (top - random() * 10) +
                        " L" +
                        (x + wide * 0.42) +
                        " " +
                        (top + 6) +
                        " L" +
                        (x + wide / 2) +
                        " " +
                        (bedY + 12) +
                        " Z",
                }),
            )
        }
    }

    // Coral is the other place colour gets in, so a world with nothing living
    // in it can still be an enticing one.
    function coral(into, world, random) {
        const n = Math.round(world.enticing * 10)
        for (let i = 0; i < n; i++) {
            const x = 18 + random() * (W - 36)
            const y = 206 + random() * 26
            const tall = 12 + random() * 26
            const hue = mix(GREY, HUES[Math.floor(random() * HUES.length)], world.enticing)
            const branch = draw("g", {
                class: "sea__coral",
                stroke: hue,
                "stroke-width": 2.4,
                "stroke-linecap": "round",
                fill: "none",
                opacity: 0.85,
            })
            branch.style.animationDelay = (-random() * 6).toFixed(2) + "s"
            branch.appendChild(draw("path", { d: "M" + x + " " + y + " l 0 " + -tall }))
            branch.appendChild(draw("path", { d: "M" + x + " " + (y - tall * 0.55) + " l " + (-4 - random() * 5) + " " + -tall * 0.4 }))
            branch.appendChild(draw("path", { d: "M" + x + " " + (y - tall * 0.7) + " l " + (4 + random() * 5) + " " + -tall * 0.35 }))
            into.appendChild(branch)
        }
    }

    // One creature, bent by one number. At the safe end a round, blunt thing
    // with a big eye and a smile; every step towards danger stretches it lean,
    // cuts the mouth back into a toothed jaw, forks the tail, stands spines up
    // where the fin was, narrows the eye to a pale slit with smaller ones
    // behind it, and trails feelers off the underside. Every part is sized by
    // the same number and starts from nothing, so nothing switches over at a
    // threshold; the `if`s only spare the page a path drawn at no size.
    function creature(into, x, y, size, m, hue, random) {
        const at = (safe, scary) => (safe + (scary - safe) * m).toFixed(1)
        const flip = random() < 0.5
        const tilt = (random() - 0.5) * 30
        const high = 11 - m * 5 // half the depth of the body
        const nose = 26 + m * 22 // how far the head runs forward
        const gape = m * 14 // how far back the mouth is cut
        // Danger takes the light out of the hue Enticing chose, so the pale
        // parts — eyes, teeth — are what the torch finds first.
        const colour = mix(hue, "#14101c", m * 0.45)

        const fish = draw("g", {
            class: "sea__creature",
            transform:
                "translate(" +
                x.toFixed(1) +
                " " +
                y.toFixed(1) +
                ") rotate(" +
                tilt.toFixed(1) +
                ") scale(" +
                ((flip ? -size : size) / 30).toFixed(3) +
                " " +
                (size / 30).toFixed(3) +
                ")",
        })
        fish.style.animationDelay = (0.2 + random() * 0.8).toFixed(2) + "s"

        const drift = draw("g", { class: "sea__drift" })
        drift.style.animationDuration = (4 + random() * 4).toFixed(2) + "s"
        drift.style.animationDelay = (-random() * 8).toFixed(2) + "s"
        drift.appendChild(fish)

        // Tail: round lobes drawn out into a fork, the curves straightened by
        // moving their control points onto the chord.
        const tipX = -11 - m * 8
        const tipY = -8 - m * 5
        const notch = -4 - m * 3
        const c1 = at(-2, (3 + tipX) / 2) + " " + at(-11, tipY / 2)
        const c1m = at(-2, (3 + tipX) / 2) + " " + -at(-11, tipY / 2)
        const c2 = at(-10, (tipX + notch) / 2) + " " + at(-2, tipY / 2)
        const c2m = at(-10, (tipX + notch) / 2) + " " + -at(-2, tipY / 2)
        const tip = tipX.toFixed(1) + " " + tipY.toFixed(1)
        const tipM = tipX.toFixed(1) + " " + -tipY.toFixed(1)
        fish.appendChild(
            draw("path", {
                fill: colour,
                d: "M3 0 Q" + c1 + " " + tip + " Q" + c2 + " " + notch.toFixed(1) + " 0 Q" + c2m + " " + tipM + " Q" + c1m + " 3 0 Z",
            }),
        )

        // A round fin that flattens as spines stand up in its place, both
        // rooted inside the body, which goes on over them.
        const back = -high * 0.8
        fish.appendChild(
            draw("path", {
                fill: colour,
                d:
                    "M7 " +
                    back.toFixed(1) +
                    " Q" +
                    (nose / 2).toFixed(1) +
                    " " +
                    (back - 7 * (1 - m)).toFixed(1) +
                    " " +
                    (nose - 9).toFixed(1) +
                    " " +
                    back.toFixed(1) +
                    " Z",
            }),
        )
        const step = (nose - 16) / 5
        let spines = ""
        for (let i = 0; i < 5; i++) {
            const root = 7 + i * step
            const tall = m * (5 + 5 * Math.sin(((i + 1) / 6) * Math.PI))
            spines +=
                " M" +
                root.toFixed(1) +
                " " +
                back.toFixed(1) +
                " L" +
                (root + step * 0.2 - tall * 0.4).toFixed(1) +
                " " +
                (back - tall).toFixed(1) +
                " L" +
                (root + step * 0.7).toFixed(1) +
                " " +
                back.toFixed(1) +
                " Z"
        }
        fish.appendChild(draw("path", { d: spines.trim(), fill: colour }))

        // The body, with the mouth a notch in the outline so the water shows
        // through it.
        const noseY = at(0, -1.5)
        const cornerX = nose - gape
        const cornerY = at(0.5, 1.5)
        const jawX = nose - 2
        const jawY = at(0.6, 10)
        fish.appendChild(
            draw("path", {
                fill: colour,
                d:
                    "M0 0 C" +
                    at(-4, 8) +
                    " " +
                    at(-14.5, -9) +
                    " " +
                    at(nose + 4, nose - 7) +
                    " " +
                    at(-14.5, -7) +
                    " " +
                    nose.toFixed(1) +
                    " " +
                    noseY +
                    " L" +
                    cornerX.toFixed(1) +
                    " " +
                    cornerY +
                    " L" +
                    jawX.toFixed(1) +
                    " " +
                    jawY +
                    " C" +
                    at(nose + 4, nose - 10) +
                    " " +
                    at(14.5, 8) +
                    " " +
                    at(-4, 10) +
                    " " +
                    at(14.5, 8.5) +
                    " 0 0 Z",
            }),
        )

        if (m > 0.05) {
            const tall = m * 4
            let teeth = ""
            for (const [x1, y1, x2, y2, inward] of [
                [nose - 1, +noseY + 0.4, cornerX + 1, +cornerY, 1],
                [cornerX + 1, +cornerY, jawX - 0.5, +jawY - 0.6, -1],
            ]) {
                teeth += " M" + x1.toFixed(1) + " " + y1.toFixed(1)
                for (let i = 1; i <= 4; i++) {
                    const t = i / 4
                    teeth +=
                        " L" + (x1 + (x2 - x1) * (t - 0.125)).toFixed(1) + " " + (y1 + (y2 - y1) * (t - 0.125) + inward * tall).toFixed(1)
                    teeth += " L" + (x1 + (x2 - x1) * t).toFixed(1) + " " + (y1 + (y2 - y1) * t).toFixed(1)
                }
            }
            fish.appendChild(draw("path", { d: teeth.trim(), fill: PALE, opacity: m.toFixed(2) }))
        }

        if (m < 0.95) {
            fish.appendChild(
                draw("path", {
                    d: "M" + (nose - 11).toFixed(1) + " 3.5 q 4.5 3.2 9 0",
                    stroke: "#04090e",
                    "stroke-width": 1.1,
                    "stroke-linecap": "round",
                    fill: "none",
                    opacity: ((1 - m) * (1 - m)).toFixed(2),
                }),
            )
        }

        const eyeX = nose - 9 - m * 6
        const eyeY = -3 + m * 0.5
        fish.appendChild(
            draw("ellipse", {
                cx: eyeX.toFixed(1),
                cy: eyeY.toFixed(1),
                rx: at(4.2, 3.6),
                ry: at(4.2, 1.3),
                fill: mix("#04090e", PALE, m),
            }),
        )
        fish.appendChild(draw("circle", { cx: eyeX.toFixed(1), cy: eyeY.toFixed(1), r: (m * 0.9).toFixed(2), fill: "#04090e" }))
        fish.appendChild(
            draw("circle", {
                cx: (eyeX + 1.4).toFixed(1),
                cy: (eyeY - 1.5).toFixed(1),
                r: 1.3,
                fill: "#ffffff",
                opacity: (1 - m).toFixed(2),
            }),
        )

        // Points of light rather than eyes drawn in full: only that they are
        // there, and looking.
        const more = Math.max(0, m - 0.35) * 2.2
        if (more > 0.05) {
            const spots = [
                [-6.5, -2.6],
                [-11.5, -1.4],
                [-8.5, 2.2],
                [-15.5, 0.4],
                [-13, -3.6],
            ]
            spots.forEach(([dx, dy], i) => {
                const r = more * (1 - i * 0.15)
                const cx = (eyeX + dx).toFixed(1)
                const cy = (eyeY + dy).toFixed(1)
                fish.appendChild(draw("circle", { cx: cx, cy: cy, r: r.toFixed(2), fill: PALE, opacity: 0.85 }))
                fish.appendChild(draw("circle", { cx: cx, cy: cy, r: (r * 0.3).toFixed(2), fill: "#04090e" }))
            })
        }

        if (m > 0.05) {
            for (let i = 0; i < 3; i++) {
                const long = m * (8 + random() * 10)
                const ox = (nose - 8 - i * 6).toFixed(1)
                const oy = (high * 0.85).toFixed(1)
                fish.appendChild(
                    draw("path", {
                        d:
                            "M" +
                            ox +
                            " " +
                            oy +
                            " c " +
                            (-long * 0.3).toFixed(1) +
                            " " +
                            (long * 0.4).toFixed(1) +
                            ", " +
                            (-long * 0.9).toFixed(1) +
                            " " +
                            (long * 0.25).toFixed(1) +
                            ", " +
                            (-long * 1.1).toFixed(1) +
                            " " +
                            (long * 0.7).toFixed(1),
                        stroke: mix(hue, "#14101c", 0.25),
                        "stroke-width": (0.6 + m * 0.4).toFixed(2),
                        "stroke-linecap": "round",
                        fill: "none",
                        opacity: m.toFixed(2),
                    }),
                )
            }
        }

        into.appendChild(drift)
    }

    // How many is Alive, what colour Enticing, what they look like Safe. They
    // are placed towards the light and kept inside the frame, and loom a
    // little larger the less safe the world is.
    function life(into, world, random) {
        const n = Math.round(world.alive * 11)
        for (let i = 0; i < n; i++) {
            const angle = random() * 2 * Math.PI
            const away = Math.sqrt(random())
            const x = TORCH_X + Math.cos(angle) * away * (TORCH_RX * 0.92)
            const up = Math.sin(angle) * away
            const y = Math.max(36, Math.min(198, TORCH_Y + up * TORCH_RY * (up < 0 ? 1.15 : 0.8)))
            const size = (20 + random() * 18) * (1 + (1 - world.safe) * 0.3)
            const hue = mix(GREY, HUES[Math.floor(random() * HUES.length)], world.enticing)
            creature(into, x, y, size, 1 - world.safe, hue, random)
        }
    }

    function motes(into, world, random) {
        const n = Math.round(10 + world.enticing * 26)
        for (let i = 0; i < n; i++) {
            const angle = random() * 2 * Math.PI
            const away = Math.sqrt(random())
            const mote = draw("circle", {
                class: "sea__mote",
                cx: (TORCH_X + Math.cos(angle) * away * TORCH_RX).toFixed(1),
                cy: (TORCH_Y + Math.sin(angle) * away * TORCH_RY).toFixed(1),
                r: (0.6 + random() * 1.3).toFixed(2),
                fill: "#dff2ff",
                opacity: (0.12 + random() * 0.3).toFixed(3),
            })
            mote.style.animationDuration = (6 + random() * 6).toFixed(2) + "s"
            mote.style.animationDelay = (-random() * 12).toFixed(2) + "s"
            into.appendChild(mote)
        }
    }

    function drawSea(chart, world) {
        const id = "sea" + count++
        const random = seeded(1 + world.safe * 7919 + world.enticing * 104729 + world.alive * 15485863)

        chart.setAttribute("viewBox", "0 0 " + W + " " + H)
        chart.classList.add("sea")
        chart.innerHTML = ""
        chart.appendChild(defs(id))

        const scene = draw("g", { "clip-path": "url(#" + id + "-clip)" })
        scene.appendChild(draw("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#" + id + "-water)" }))
        scene.appendChild(
            draw("ellipse", { class: "sea__torch", cx: TORCH_X, cy: TORCH_Y, rx: TORCH_RX, ry: TORCH_RY, fill: "url(#" + id + "-pool)" }),
        )
        floor(scene, world, random)
        coral(scene, world, random)
        life(scene, world, random)
        motes(scene, world, random)
        // The dark goes on over everything it is meant to be hiding.
        scene.appendChild(draw("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#" + id + "-dark)" }))
        chart.appendChild(scene)

        chart.appendChild(
            draw("rect", { x: 0.5, y: 0.5, width: W - 1, height: H - 1, rx: 12, fill: "none", stroke: "rgba(255, 255, 255, 0.10)" }),
        )
    }

    function text(tag, className, words) {
        const element = document.createElement(tag)
        element.className = className
        element.textContent = words
        return element
    }

    function end(world, name, caption, told) {
        const figure = document.createElement("figure")
        figure.className = "seaview__end"
        const svg = document.createElementNS(SVG, "svg")
        svg.setAttribute("role", "img")
        svg.setAttribute("aria-label", told)
        drawSea(svg, world)
        figure.appendChild(svg)

        const said = document.createElement("figcaption")
        said.innerHTML = "<b></b><span></span>"
        said.firstChild.textContent = name
        said.lastChild.textContent = caption
        figure.appendChild(said)
        return figure
    }

    // A title, the person's own abyss at the width of the card, where it came
    // from, a key per channel with a bar filled to the same reach the scene is
    // drawn from, the two ends to hold it against, and one question. Locked,
    // the title and the scene alone.
    function renderSea(locked) {
        const all = document.createDocumentFragment()

        const head = document.createElement("header")
        head.className = "seaview__head"
        head.appendChild(text("h3", "seaview__title", "How you see the world"))
        all.appendChild(head)

        const world = { safe: reach("Safe", locked), enticing: reach("Enticing", locked), alive: reach("Alive", locked) }
        const stage = figureHolder(
            locked
                ? "Blurred preview of the world your answers will draw"
                : "The bottom of the abyss as your answers draw it: what is down there with you, how much colour is in it and how much of it is alive",
            "result__chart--wide seaview",
            locked,
        )
        stage.figure.classList.add("sea--stage")
        drawSea(stage.figure, world)
        all.appendChild(stage.holder)
        if (locked) return all

        all.appendChild(
            text(
                "p",
                "seaview__note",
                "This picture was drawn from three dimensions worked out from your answers. Each one changes one thing about the scene, and the bars show where you sit on each.",
            ),
        )

        const keys = document.createElement("ul")
        keys.className = "seaview__keys"
        for (const [name, colour, what] of LINES) {
            const share = Math.round(world[name.toLowerCase()] * 100)
            const key = document.createElement("li")
            key.className = "seaview__key"
            key.style.setProperty("--key", colour)
            key.innerHTML = '<b></b><span class="seaview__bar" aria-hidden="true"><i></i></span><span></span>'
            key.firstChild.textContent = name
            key.querySelector("i").style.width = share + "%"
            key.lastChild.textContent = what
            key.setAttribute("aria-label", name + ": " + share + "% of the way up its scale. " + what)
            keys.appendChild(key)
        }
        all.appendChild(keys)

        const others = document.createElement("div")
        others.className = "seaview__others"
        others.appendChild(text("p", "seaview__aside", "Other people see other worlds"))
        others.appendChild(
            text(
                "p",
                "seaview__note",
                "These are two possible extreme views people might get. You might be close to one of them, or in-between.",
            ),
        )
        const ends = document.createElement("div")
        ends.className = "seaview__ends"
        ends.appendChild(
            end(
                FLOOR,
                "A dangerous, dull, all but lifeless world",
                "The bottom of all three scales",
                "The same abyss at the bottom of all three scales",
            ),
        )
        ends.appendChild(
            end(CEILING, "A safe, enticing, living world", "The top of all three scales", "The same abyss at the top of all three scales"),
        )
        others.appendChild(ends)
        all.appendChild(others)

        const vote = document.createElement("div")
        vote.className = "seaview__vote"
        vote.appendChild(text("p", "seaview__ask", "Does this picture match how the world feels to you?"))
        vote.appendChild(pickButtons(SEA_KEY, VOTES))
        all.appendChild(vote)

        return all
    }

    return { SEA: SEA, SEA_KEY: SEA_KEY, renderSea: renderSea }
}
