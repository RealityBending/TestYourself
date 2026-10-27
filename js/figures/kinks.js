/* =========================================================================
   How kinky — what the Sexuality level (the `sex` block) feeds back: one
   dimension, kept that simple on purpose.

   The dimension is Kinkiness, vanilla to kinky: how many of the items in
   content/block_sex.js — a kink, or one side of one — turn somebody on,
   whether or not they have done it. It is drawn as the crowd it is read
   against, stood on end — a band for each number of them from none at the
   foot to all at the top (twenty-four items, so twenty-five bands), each
   as wide as the share of people turned on by that many and drawn both ways
   out of a spine, so the crowd is one shape, a violin, out of the norm's
   `distribution` — shaded from vanilla to kinky as far as the person
   reaches, their own band lit in gold and the rest dim beyond, so the shaded
   part of the crowd is the share the words under it give. The MINT's crowd
   card turned upright, so that kinkier is higher. The norm is a placeholder
   stretched from the Big Kink Survey's (the block file says how), so the
   standing is said against "people" like every other placeholder's, and the
   crowd is named again once the app has one of its own.

   Under the count, how many of those turn-ons have been lived out: the grid
   asks whether each was done beside whether it appeals, and the share acted
   on is the number people will want to share. It says nothing about which.

   NOTHING ON IT SAYS WHICH KINKS, and that is the rule to keep. A sentence
   naming the rarest kink that turned somebody on (the taboo reading, with how
   many people share it) was written and taken out, September 2026: it was
   the most engaging line on the level, and the one thing on it that gave an
   answer away — on a screen read over a shoulder, in a level's picture, and
   in whatever is later shared or compared. Counts and a standing can travel;
   a named kink cannot.
   ========================================================================= */

function makeKinks(shared) {
    "use strict"

    const score = shared.score
    const known = shared.known
    const answer = shared.answer
    const normOf = shared.normOf
    const standFrom = shared.standFrom
    const teaseValue = shared.teaseValue
    const pickButtons = shared.pickButtons
    const showTip = shared.showTip
    const hideTip = shared.hideTip
    const VOTES = shared.VOTES

    const KINKS_OF = "kinks"
    const KINKS_KEY = "Kinky" // the vote on the figure
    const DIMENSION = "Kinkiness"

    // Whose crowd it is, said under the figure: "people", the norm being a
    // placeholder (content/block_sex.js), until the app has a crowd of its
    // own to name.
    const CROWD = "people"

    // The crowd's colours, vanilla to kinky: cream to the level's pink to a
    // deep plum.
    const VANILLA = "#f3e2bf"
    const MIDDLE = "#e05a8f"
    const KINKY = "#7e2a8c"

    // The figure in its own units. The badge crops against these. The crowd
    // stands on end, a band a count from vanilla at the foot to kinky at the
    // top, each as wide as its share and drawn both ways out of a spine, so
    // the whole reads as one shape — a violin — rather than as a bar chart.
    const WIDE = 320
    const HIGH = 320
    const SPINE = WIDE / 2 // the middle, the bands growing out both ways
    const HALF = 105 // half the width of the widest band
    const TOP = 30 // the top of the topmost band
    const BASE = 290 // the foot of the lowest band
    const GAP = 1.6

    /* ------------------------------ the values ---------------------------- */

    function items() {
        return known(DIMENSION) ? shared.dimensions[DIMENSION] : []
    }

    function ready() {
        return known(DIMENSION) && score(DIMENSION) !== undefined
    }

    // Whether the kinks were answered and too many of them declined to count.
    function declined() {
        return known(DIMENSION) && shared.declined(DIMENSION)
    }

    // How many of the kinks were answered rather than declined, or undefined
    // when the answers cannot be read (a visitor's link carries scores alone).
    function answered() {
        let count = 0
        for (const question of items()) {
            const given = answer(question.key)
            if (given === undefined) return undefined
            if (question.declined.indexOf(given) === -1) count++
        }
        return count
    }

    // The score is the share of the kinks; the figure reads it as a count, of
    // all of them, which is what the crowd is counted on. Where some were
    // declined the share is of those answered, and the count on the crowd is
    // what that share would come to over them all.
    function countOf(value) {
        return Math.round(value * items().length)
    }

    function valueOf(locked) {
        return locked ? teaseValue(DIMENSION) : score(DIMENSION)
    }

    function colourAt(share) {
        return share < 0.5 ? mix(VANILLA, MIDDLE, share * 2) : mix(MIDDLE, KINKY, (share - 0.5) * 2)
    }

    // The items that turn somebody on, as the options chosen — the cells,
    // each carrying the row (`down`) it stands in: undefined when the answers
    // cannot be read (a visitor's link carries scores alone).
    function turnOns() {
        const found = []
        for (const question of items()) {
            const given = answer(question.key)
            if (given === undefined) return undefined
            const counts = question.scores ? question.scores[given] : 0
            if (counts !== 1) continue
            const cell = question.options.find((one) => one.value === given)
            found.push({ key: question.key, down: cell ? cell.down : 0 })
        }
        return found
    }

    // How many of them have been done at all: any row but the first.
    function lived() {
        const on = turnOns()
        if (on === undefined) return undefined
        return on.filter((one) => one.down > 0).length
    }

    // The foot of the band for a count: 0 at the foot, the most at the top.
    function bandY(at, bands) {
        const height = (BASE - TOP) / bands
        return BASE - at * height
    }

    // The middle of the person's band, for the badge.
    function youAt() {
        const bands = items().length + 1
        const height = (BASE - TOP) / bands
        return [SPINE, bandY(countOf(score(DIMENSION)), bands) - height / 2]
    }

    /* ------------------------------- the crowd ---------------------------- */

    function drawCrowd(figure, count, locked) {
        const norm = normOf(DIMENSION)
        const shares = norm && norm.distribution ? norm.distribution.shares : items().map(() => 1).concat([1])
        const bands = shares.length
        const widest = Math.max.apply(null, shares)
        const height = (BASE - TOP) / bands

        figure.setAttribute("viewBox", "0 0 " + WIDE + " " + HIGH)
        figure.classList.add("kinks__crowd")

        // The spine the bands grow out of, and the two ends of the scale.
        figure.appendChild(draw("line", { class: "kinks__spine", x1: SPINE, y1: TOP - 6, x2: SPINE, y2: BASE + 6 }))
        figure.appendChild(draw("text", { class: "kinks__end kinks__end--kinky", x: SPINE, y: TOP - 14, "text-anchor": "middle" })).textContent = "Kinky"
        figure.appendChild(draw("text", { class: "kinks__end kinks__end--vanilla", x: SPINE, y: BASE + 22, "text-anchor": "middle" })).textContent = "Vanilla"

        shares.forEach((share, at) => {
            const half = Math.max(1.5, (share / widest) * HALF)
            const place = at < count ? "below" : at === count ? "you" : "above"
            figure.appendChild(
                draw("rect", {
                    class: "kinks__band kinks__band--" + place,
                    x: SPINE - half,
                    y: bandY(at, bands) - height + GAP / 2,
                    width: half * 2,
                    height: height - GAP,
                    rx: Math.min(3, (height - GAP) / 2),
                    fill: place === "you" ? "var(--gold)" : colourAt(at / (bands - 1)),
                    style: "--beat: " + at * 30 + "ms",
                }),
            )
        })

        // The person's band, named beside it with a short lead. Nothing is
        // named on a locked one: the tease stands for a shape, not a count.
        if (!locked) {
            const half = Math.max(1.5, (shares[count] / widest) * HALF)
            const y = bandY(count, bands) - height / 2
            figure.appendChild(draw("line", { class: "kinks__lead", x1: SPINE + half + 3, y1: y, x2: SPINE + HALF + 14, y2: y }))
            figure.appendChild(draw("text", { class: "kinks__you", x: SPINE + HALF + 18, y: y + 4 })).textContent = "You"
        }

        // The ends of the count, beside the foot and the top.
        figure.appendChild(draw("text", { class: "kinks__tick", x: SPINE - HALF - 12, y: BASE - height / 2 + 3.5, "text-anchor": "end" })).textContent = "0"
        figure.appendChild(draw("text", { class: "kinks__tick", x: SPINE - HALF - 12, y: TOP + height / 2 + 3.5, "text-anchor": "end" })).textContent = String(bands - 1)
        return figure
    }

    function text(tag, className, words) {
        const element = document.createElement(tag)
        element.className = className
        if (words) element.textContent = words
        return element
    }

    // The violin on the left and, beside it, what it says: the count, how
    // many of it have been lived out and where it stands. The words stand
    // beside the figure rather than under it so that the figure can be
    // narrow, which a violin wants to be. Locked, the figure alone.
    function stage(count, locked, value) {
        const holder = document.createElement("div")
        holder.className = "result__chart result__chart--wide kinks__stage"

        const figure = document.createElementNS(SVG, "svg")
        figure.setAttribute("role", "img")
        figure.setAttribute(
            "aria-label",
            locked
                ? "Blurred preview of where your answers will put you among other people"
                : "How many of the " + items().length + " kinks turn people on, from none to all of them, with your own count among them: " + count,
        )
        drawCrowd(figure, count, locked)
        holder.appendChild(figure)

        if (locked) holder.appendChild(text("span", "result__lock", "Locked"))
        else {
            const tip = () => showTip(figure, "Each band is how many " + CROWD + " are turned on by that many of the " + items().length + " kinks. The gold one is you.")
            figure.addEventListener("mouseenter", tip)
            figure.addEventListener("mouseleave", hideTip)

            // The words say what was answered, where the crowd places it: the
            // turn-ons themselves, out of the kinks that were not declined.
            const on = turnOns()
            const of = answered()
            const side = holder.appendChild(text("div", "kinks__side"))
            side.appendChild(counted(on ? on.length : count, of === undefined ? items().length : of))
            const done = livedLine(on ? on.length : count)
            if (done) side.appendChild(done)
            const where = standing(value)
            if (where) side.appendChild(where)
        }
        return holder
    }

    /* ------------------------------- the words ---------------------------- */

    // "Turn you on" is held together by non-breaking spaces, so that a count
    // wrapping onto two lines breaks before it rather than leaving "on" alone
    // on the second. `of` is how many were answered, which is all of them
    // unless some were declined, and then the words say so.
    function counted(count, of) {
        const said = text("p", "kinks__count")
        const all = of === items().length
        const kinds = all ? " kinks" : " kinks you answered"
        const on = (verb) => " " + verb + " you on"
        if (count === 0) {
            said.append((all ? "None of these " : "None of the ") + of + kinds + on("turns"))
            return said
        }
        if (count === of) {
            said.append("All ")
            said.appendChild(text("strong", "", String(count)))
            said.append((all ? " of these" : " of the") + kinds + on("turn"))
            return said
        }
        said.appendChild(text("strong", "", String(count)))
        said.append((all ? " of these " : " of the ") + of + kinds + on(count === 1 ? "turns" : "turn"))
        return said
    }

    // Where the count stands, and how many people that is read against
    // (`n` on the norm, when it carries one).
    function standing(value) {
        const norm = normOf(DIMENSION)
        if (!norm) return null
        const stand = standFrom(value, norm)
        const said = text("p", "kinks__standing")
        said.append(stand.direction === "higher" ? "You are kinkier than " : "You are more vanilla than ")
        said.appendChild(text("strong", "", stand.share + "%"))
        said.append(" of " + CROWD)
        if (norm.n) said.appendChild(text("span", "kinks__n", " (N = " + norm.n.toLocaleString("en-GB") + ")"))
        return said
    }

    // Of the turn-ons, how many have been lived out. Nothing to say when
    // nothing turns somebody on, or when the answers cannot be read.
    function livedLine(count) {
        const done = lived()
        if (done === undefined || count === 0) return null
        const said = text("p", "kinks__lived")
        if (done === 0) {
            said.append("None of them lived out yet")
            return said
        }
        if (done === count) {
            said.append("And you have lived out " + (count === 1 ? "it" : "all of them"))
            return said
        }
        said.append("Of those, you have lived out ")
        said.appendChild(text("strong", "", String(done)))
        return said
    }

    function vote(ask) {
        const holder = text("div", "kinks__vote")
        holder.appendChild(text("p", "kinks__ask", ask))
        holder.appendChild(pickButtons(KINKS_KEY, VOTES))
        return holder
    }

    /* ------------------------------ the section --------------------------- */

    // A title, the crowd with the count, how many of it have been lived out
    // and where it stands beside it, and a vote. Locked, the title and the
    // crowd from the tease, blurred, and nothing else — the preview is what
    // finishing will show.
    function renderKinks(locked) {
        const all = document.createDocumentFragment()
        const value = valueOf(locked)
        const count = countOf(value)

        const headline = text("header", "kinks__head")
        headline.appendChild(text("h3", "kinks__title", "How kinky are you?"))
        all.appendChild(headline)

        all.appendChild(stage(count, locked, value))
        if (locked) return all

        all.appendChild(vote("Does this match how kinky you are?"))
        return all
    }

    return {
        KINKS_OF: KINKS_OF,
        KINKS_KEY: KINKS_KEY,
        DIMENSION: DIMENSION,
        ready: ready,
        declined: declined,
        youAt: youAt,
        renderKinks: renderKinks,
    }
}
