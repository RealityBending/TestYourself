/* =========================================================================
   Where somebody stands — the whole of what the Opinions level (the
   `opinions` block) feeds back. Two parts, each with its own vote.

   **The plane**, on the pattern of the political compass but on axes named
   for what they are about rather than for a side: sharing against markets
   across (the BSA left-right scale, turned so that sharing is on the left,
   where the convention everybody knows puts it), order against freedom up
   (the BSA libertarian-authoritarian scale, order on top). The person is a
   point of light on it, the average person a dashed ring, the quadrant the
   point falls in is lit, and one sentence says in words what the point says
   in place. Nothing on the plane is called left, right, liberal or
   authoritarian, and no quadrant carries the name of an ideology: a name
   over a region reads as a verdict on whoever lands in it.

   **The spectra**, seven lines under it for the oppositions the plane does
   not carry — trust against suspicion (the CMQ), equal chances against
   equal outcomes, preserving against enhancing human nature, nurture
   against nature, growth against the planet, people first against
   animals too and purpose against beauty (the custom scales) — each a track
   between its two ends with the person marked on it and the average ticked.

   Every position is a reach along its own scale, not a standing, the sea's
   rule and for the sea's reason: the norms behind these are placeholders,
   and nothing here says "higher than 70% of people". The average person is
   drawn from them all the same, as every figure's is.

   The plane is an SVG and its four poles are HTML around it, the climb's and
   the heads' rule: a word inside an SVG scaled to the width of the card is
   twice the size on a desktop that it is on a phone. The four corner tags
   inside the plane are the one exception, being small and there to be seen
   rather than read.
   ========================================================================= */

function makeStance(shared) {
    "use strict"

    const score = shared.score
    const known = shared.known
    const normOf = shared.normOf
    const reachOf = shared.reachOf
    const teaseValue = shared.teaseValue
    const pickButtons = shared.pickButtons
    const VOTES = shared.VOTES
    const showTip = shared.showTip
    const hideTip = shared.hideTip

    const STANCE_OF = ["cmq", "views"]
    const STANCE_KEY = "Stance" // the vote on the plane
    const BELIEFS_KEY = "Beliefs" // the vote on the spectra

    const ACROSS = "Sharing" // drawn turned over: sharing on the left
    const UP = "Order"

    // The plane, in its own units. The badge crops against these.
    const SIDE = 320
    const EDGE = 10
    const SPAN = SIDE - 2 * EDGE
    const MIDDLE = SIDE / 2

    // A position this near the middle of an axis is read as between its ends.
    const BETWEEN = 0.08

    // One colour a quadrant, glowing out of its own corner — chosen from the
    // app's palette and not from any party's, so no corner reads as a flag.
    // The tag is what that corner puts first, as a motto rather than a name:
    // it says something the two poles beside it do not (they only said the
    // poles again until September 2026), and still names no ideology. Kept
    // under about eighteen characters, which is what fits the corner.
    const QUADRANTS = [
        { right: false, top: true, colour: "#f0a04b", tag: "protect & provide" },
        { right: true, top: true, colour: "#e45f86", tag: "reward & rules" },
        { right: false, top: false, colour: "#4fd1a1", tag: "fair & free" },
        { right: true, top: false, colour: "#7f86ff", tag: "choose & compete" },
    ]

    // The four poles round the plane: a word, and what it means under it.
    const POLES = {
        top: ["Order", "rules and respect for them"],
        bottom: ["Freedom", "live and let live"],
        left: ["Sharing", "even out what people earn"],
        right: ["Markets", "let earnings fall where they may"],
    }

    // What the point says, in words: one clause an axis, from which side of
    // the middle it falls on. Any first clause reads on into any second.
    const SAID = {
        across: {
            low: "you would even out what people earn",
            mid: "you sit between evening out what people earn and leaving it to the market",
            high: "you would leave what people earn to the market",
        },
        up: {
            low: "and leave people free to live as they choose",
            mid: "and weigh keeping the rules against people's freedom to live as they choose",
            high: "and want the rules firmly kept",
        },
    }

    // The spectra, in the order they are read. `low` and `high` are the two
    // words over the line, `from` and `to` what each end means, `what` the
    // tooltip — what the line is about, and nothing about which items went
    // into it (the heads' rule).
    const SPECTRA = [
        {
            dimension: "Suspicion",
            low: "Trust",
            high: "Suspicion",
            from: "Most of what happens is what it looks like",
            to: "Much of what happens is kept from us",
            hue: "#6aa7f0",
            what: "How far you suspect that what happens in the world is steered out of sight, by people the public never hears about.",
        },
        {
            dimension: "Parity",
            low: "Equal chances",
            high: "Equal outcomes",
            from: "Give every group the same chances, and let results differ",
            to: "Work until every group ends up equally well off",
            hue: "#b58cf0",
            what: "What fairness between groups means: everybody having the same chances, or every group ending up in the same place.",
        },
        {
            dimension: "Enhancement",
            low: "Preserve",
            high: "Enhance",
            from: "Leave human nature as it is",
            to: "Improve on it with technology",
            hue: "#4fc9b0",
            what: "Whether technology, or choosing children by their genes, should take people beyond what humans are now: smarter, healthier, longer-lived.",
        },
        {
            dimension: "Heredity",
            low: "Nurture",
            high: "Nature",
            from: "People are made by how they are raised",
            to: "People are mostly born the way they are",
            hue: "#e8c15a",
            what: "Where the differences between people come from: mostly from upbringing and circumstance, or mostly from their genes.",
        },
        {
            dimension: "Planet",
            low: "Growth",
            high: "Planet",
            from: "Keep the economy and how we live first",
            to: "Put the climate first, even at a cost",
            hue: "#7cc46a",
            what: "How far tackling climate change should come before growth, prices and the way people live now.",
        },
        {
            dimension: "Animals",
            low: "People first",
            high: "Animals too",
            from: "Animals are there for people to use",
            to: "Animals count, much as people do",
            hue: "#e07a5f",
            what: "Whether animals feel as we do, and whether that should limit what people do to them.",
        },
        {
            dimension: "Beauty",
            low: "Purpose",
            high: "Beauty",
            from: "Judge things by what they do and say",
            to: "Beauty is worth having for its own sake",
            hue: "#f28fb0",
            what: "How much beauty should count when it costs money, usefulness or meaning.",
        },
    ]

    let count = 0

    /* ------------------------------ the values ---------------------------- */

    // A dimension still unanswered sits in the middle; a locked level draws
    // the tease.
    function reach(dimension, tease) {
        if (!known(dimension)) return 0.5
        const value = tease ? teaseValue(dimension) : score(dimension)
        return value === undefined ? 0.5 : reachOf(dimension, value)
    }

    // Where the average person sits, or nothing where there is no mean.
    function average(dimension) {
        const norm = known(dimension) && normOf(dimension)
        return norm ? reachOf(dimension, norm.mean) : undefined
    }

    // The plane's two coordinates, each 0 to 1: across from sharing to
    // markets, up from freedom to order.
    function place(tease) {
        return { across: 1 - reach(ACROSS, tease), up: reach(UP, tease) }
    }

    function spotOf(at) {
        return [EDGE + at.across * SPAN, EDGE + (1 - at.up) * SPAN]
    }

    // Whether there is anything to draw yet: every dimension of the figure
    // this run holds, answered.
    function ready() {
        const all = [ACROSS, UP].concat(SPECTRA.map((one) => one.dimension)).filter(known)
        return all.length > 0 && all.every((dimension) => score(dimension) !== undefined)
    }

    // The point on the plane in the plane's own units, for the badge.
    function youAt() {
        return spotOf(place(false))
    }

    function side(value) {
        return value < 0.5 - BETWEEN ? "low" : value > 0.5 + BETWEEN ? "high" : "mid"
    }

    function readingOf(at) {
        const across = side(at.across)
        const up = side(at.up)
        const lean = []
        if (across !== "mid") lean.push("towards " + (across === "low" ? "sharing" : "markets"))
        if (up !== "mid") lean.push("towards " + (up === "low" ? "freedom" : "order"))
        const where = lean.length ? "lean " + lean.join(" and ") : "stand near the middle of both"
        return "You " + where + ": " + SAID.across[across] + " " + SAID.up[up] + "."
    }

    /* ------------------------------- the plane ---------------------------- */

    function stops(gradient, list) {
        for (const [offset, colour, opacity] of list) gradient.appendChild(draw("stop", { offset: offset, "stop-color": colour, "stop-opacity": opacity }))
        return gradient
    }

    function drawPlane(figure, at, tease) {
        const id = "stance" + ++count
        figure.setAttribute("viewBox", "0 0 " + SIDE + " " + SIDE)
        figure.classList.add("stance__plane")

        const [x, y] = spotOf(at)
        const right = at.across >= 0.5
        const top = at.up >= 0.5

        const defs = draw("defs", {})
        QUADRANTS.forEach((one, index) => {
            // Each glows out of its own outer corner and fades towards the
            // middle, so the four meet in a dark centre.
            defs.appendChild(
                stops(draw("radialGradient", { id: id + "-q" + index, cx: one.right ? 1 : 0, cy: one.top ? 0 : 1, r: 1.25 }), [
                    [0, one.colour, 0.66],
                    [0.5, one.colour, 0.22],
                    [1, one.colour, 0.03],
                ]),
            )
        })
        defs.appendChild(
            stops(draw("radialGradient", { id: id + "-glow" }), [
                [0, "#ffe7a8", 0.75],
                [0.35, "#d9a441", 0.28],
                [1, "#d9a441", 0],
            ]),
        )
        const clip = draw("clipPath", { id: id + "-clip" })
        clip.appendChild(draw("rect", { x: EDGE, y: EDGE, width: SPAN, height: SPAN, rx: 14 }))
        defs.appendChild(clip)
        figure.appendChild(defs)

        const inside = draw("g", { "clip-path": "url(#" + id + "-clip)" })
        figure.appendChild(inside)
        inside.appendChild(draw("rect", { x: EDGE, y: EDGE, width: SPAN, height: SPAN, fill: "#070b14" }))

        QUADRANTS.forEach((one, index) => {
            const lit = one.right === right && one.top === top
            inside.appendChild(
                draw("rect", {
                    class: "stance__cell" + (lit ? " stance__cell--lit" : ""),
                    x: one.right ? MIDDLE : EDGE,
                    y: one.top ? EDGE : MIDDLE,
                    width: SPAN / 2,
                    height: SPAN / 2,
                    fill: "url(#" + id + "-q" + index + ")",
                }),
            )
        })

        // The graticule: a line every tenth, and a dot where two cross.
        const grid = draw("g", { class: "stance__grid" })
        for (let step = 1; step < 10; step++) {
            const at10 = EDGE + (step * SPAN) / 10
            if (step === 5) continue
            grid.appendChild(draw("line", { x1: at10, y1: EDGE, x2: at10, y2: SIDE - EDGE }))
            grid.appendChild(draw("line", { x1: EDGE, y1: at10, x2: SIDE - EDGE, y2: at10 }))
        }
        inside.appendChild(grid)

        // The two axes through the middle, with a tick every tenth.
        const axes = draw("g", { class: "stance__axes" })
        axes.appendChild(draw("line", { x1: EDGE, y1: MIDDLE, x2: SIDE - EDGE, y2: MIDDLE }))
        axes.appendChild(draw("line", { x1: MIDDLE, y1: EDGE, x2: MIDDLE, y2: SIDE - EDGE }))
        for (let step = 1; step < 10; step++) {
            const along = EDGE + (step * SPAN) / 10
            axes.appendChild(draw("line", { x1: along, y1: MIDDLE - 3, x2: along, y2: MIDDLE + 3 }))
            axes.appendChild(draw("line", { x1: MIDDLE - 3, y1: along, x2: MIDDLE + 3, y2: along }))
        }
        inside.appendChild(axes)

        // The corner tags: small, and brighter on the quadrant the point is in.
        for (const one of QUADRANTS) {
            const lit = one.right === right && one.top === top
            const tag = draw("text", {
                class: "stance__tag" + (lit ? " stance__tag--lit" : ""),
                x: one.right ? SIDE - EDGE - 12 : EDGE + 12,
                y: one.top ? EDGE + 20 : SIDE - EDGE - 13,
                "text-anchor": one.right ? "end" : "start",
            })
            tag.textContent = one.tag
            inside.appendChild(tag)
        }

        // The average person, and a thread from there to the point.
        const mean = { across: average(ACROSS), up: average(UP) }
        if (mean.across !== undefined && mean.up !== undefined) {
            const [ax, ay] = spotOf({ across: 1 - mean.across, up: mean.up })
            inside.appendChild(draw("line", { class: "stance__thread", x1: ax, y1: ay, x2: x, y2: y }))
            inside.appendChild(draw("circle", { class: "stance__average", cx: ax, cy: ay, r: 7 }))
        }

        // Where the point falls on each axis: a dashed drop to it, and a mark.
        const drop = draw("g", { class: "stance__drop" })
        drop.appendChild(draw("line", { x1: x, y1: y, x2: x, y2: MIDDLE }))
        drop.appendChild(draw("line", { x1: x, y1: y, x2: MIDDLE, y2: y }))
        drop.appendChild(draw("circle", { cx: x, cy: MIDDLE, r: 2.4 }))
        drop.appendChild(draw("circle", { cx: MIDDLE, cy: y, r: 2.4 }))
        inside.appendChild(drop)

        // The point itself: a glow, a ring that beats out of it, and a core.
        // The ring is the second loop a results card carries (the sea's sway
        // is the first); a sealed card holds it at its first frame.
        const you = draw("g", { class: "stance__point" })
        you.appendChild(draw("circle", { cx: x, cy: y, r: 48, fill: "url(#" + id + "-glow)" }))
        if (!tease) you.appendChild(draw("circle", { class: "stance__pulse", cx: x, cy: y, r: 9 }))
        you.appendChild(draw("circle", { class: "stance__you", cx: x, cy: y, r: 6.5 }))
        inside.appendChild(you)

        figure.appendChild(draw("rect", { class: "stance__frame", x: EDGE, y: EDGE, width: SPAN, height: SPAN, rx: 14 }))
    }

    /* -------------------------------- the pieces -------------------------- */

    function text(tag, className, words) {
        const element = document.createElement(tag)
        element.className = className
        element.textContent = words
        return element
    }

    function pole(where) {
        const holder = document.createElement("p")
        holder.className = "stance__pole stance__pole--" + where
        holder.appendChild(text("b", "", POLES[where][0]))
        holder.appendChild(text("span", "", POLES[where][1]))
        return holder
    }

    // The plane with its four poles round it, in the holder a figure
    // normally takes from `figureHolder` — built here because the poles are
    // HTML beside the drawing rather than text inside it.
    function map(at, locked) {
        const stage = document.createElement("div")
        stage.className = "result__chart result__chart--wide stance__stage"

        const grid = document.createElement("div")
        grid.className = "stance__map"
        const figure = document.createElementNS(SVG, "svg")
        figure.setAttribute("role", "img")
        figure.setAttribute(
            "aria-label",
            locked ? "Blurred preview of where your answers will put you" : "Where your answers put you, on a plane of sharing against markets and order against freedom",
        )
        drawPlane(figure, at, locked)

        grid.appendChild(pole("top"))
        grid.appendChild(pole("left"))
        grid.appendChild(figure)
        grid.appendChild(pole("right"))
        grid.appendChild(pole("bottom"))
        stage.appendChild(grid)

        if (locked) stage.appendChild(text("span", "result__lock", "Locked"))
        return stage
    }

    function legend() {
        const holder = document.createElement("p")
        holder.className = "stance__legend"
        holder.innerHTML = '<span><i class="stance__key stance__key--you"></i>You</span><span><i class="stance__key stance__key--average"></i>The average person</span>'
        return holder
    }

    // One spectrum: its two words over the line, the line with the average
    // ticked and the person marked, what each end means under it. The whole
    // row takes the tooltip.
    function spectrum(one, tease) {
        const at = reach(one.dimension, tease)
        const mean = average(one.dimension)

        const item = document.createElement("li")
        item.className = "stance__spectrum"
        item.style.setProperty("--hue", one.hue)
        item.tabIndex = 0
        item.setAttribute("aria-label", one.low + " to " + one.high + ": " + Math.round(at * 100) + "% of the way towards " + one.high.toLowerCase() + ". " + one.what)

        const words = document.createElement("p")
        words.className = "stance__words"
        words.appendChild(text("b", "", one.low))
        words.appendChild(text("b", "", one.high))
        item.appendChild(words)

        const track = document.createElement("span")
        track.className = "stance__track"
        track.setAttribute("aria-hidden", "true")
        if (mean !== undefined) {
            const tick = document.createElement("i")
            tick.className = "stance__mean"
            tick.style.left = mean * 100 + "%"
            track.appendChild(tick)
        }
        const mark = document.createElement("i")
        mark.className = "stance__mark"
        mark.style.left = at * 100 + "%"
        track.appendChild(mark)
        item.appendChild(track)

        const ends = document.createElement("p")
        ends.className = "stance__ends"
        ends.appendChild(text("span", "", one.from))
        ends.appendChild(text("span", "", one.to))
        item.appendChild(ends)

        item.addEventListener("mouseenter", () => showTip(track, one.what))
        item.addEventListener("mouseleave", hideTip)
        item.addEventListener("focus", () => showTip(track, one.what))
        item.addEventListener("blur", hideTip)
        return item
    }

    function vote(ask, key) {
        const holder = document.createElement("div")
        holder.className = "stance__vote"
        holder.appendChild(text("p", "stance__ask", ask))
        holder.appendChild(pickButtons(key, VOTES))
        return holder
    }

    /* ------------------------------ the section --------------------------- */

    // A title, the plane at the width of the card, the sentence it comes to
    // and its vote; then the spectra under a line of their own, and theirs.
    // Locked, the title, the plane and the spectra, all blurred, and no
    // votes — the preview is what finishing will show.
    function renderStance(locked) {
        const all = document.createDocumentFragment()
        const at = place(locked)

        const headline = document.createElement("header")
        headline.className = "stance__head"
        headline.appendChild(text("h3", "stance__title", "Where you stand"))
        all.appendChild(headline)

        all.appendChild(map(at, locked))
        all.appendChild(legend())
        if (!locked) {
            all.appendChild(text("p", "stance__told", readingOf(at)))
            all.appendChild(vote("Does this match where you stand?", STANCE_KEY))
        }

        const shown = SPECTRA.filter((one) => known(one.dimension))
        if (!shown.length) return all

        const beyond = document.createElement("div")
        beyond.className = "stance__beyond"
        beyond.appendChild(text("p", "stance__aside", "Other views"))
        const list = document.createElement("ul")
        list.className = "stance__spectra"
        for (const one of shown) list.appendChild(spectrum(one, locked))
        beyond.appendChild(list)
        all.appendChild(beyond)
        if (locked) return all

        all.appendChild(vote("Do these match what you believe?", BELIEFS_KEY))
        return all
    }

    return {
        STANCE_OF: STANCE_OF,
        STANCE_KEY: STANCE_KEY,
        BELIEFS_KEY: BELIEFS_KEY,
        ready: ready,
        youAt: youAt,
        renderStance: renderStance,
    }
}
