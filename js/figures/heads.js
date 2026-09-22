/* =========================================================================
   Two systems and what gets in the way of each — the whole of what the
   Mind & Heart level (the `regulation` block) feeds back. Four numbers, read
   as a chart rather than as a picture: how much each system carries (how
   strongly emotion comes, how firmly a goal holds) and how much interference
   sits on it (how far the mind keeps returning to a thing, how far the
   attention wanders). The level records sixteen dimensions and this shows
   four things made of eleven of them, since a figure that showed all sixteen
   would show nothing. Every channel is a reach along its own scale, not a
   standing — the norms behind these questionnaires are placeholders — and
   the dashed line down the middle of the bars is the midpoint the two
   sentences under them are read off, so the reading and the numbers it came
   from are on one screen.

   **A channel says what it means and never where it came from.** The tooltip
   on a bar is one sentence about the thing itself: which items or which
   scales were averaged into it is the instrument's business and not the
   participant's, and a figure that shows its own workings reads as a receipt
   rather than as a reading. It does not repeat the percentage either — that
   is on the row, an inch away.

   The theme is carried by two small glyphs anchoring the two halves, a bulb
   and a heart, and by nothing else: they are fixed in size and say nothing
   the bars do not, because a glyph that also carried a value was one more
   thing to decode. (It was a head in profile with a bulb above and a heart
   below, joined by cords with a knot in each as big as the interference —
   before that, two heads with a tangle round each organ. Both read as noise:
   four numbers bending one drawing is a picture nobody can take a number
   back out of, which is what the bars are for. The file and its functions
   keep the name.)

   The chart is HTML and only the two glyphs are drawn, which is the sea's
   and the climb's rule rather than an exception to it: a name and a number
   inside an SVG scaled to the width of the card is twice the size on a
   desktop that it is on a phone, and one font size cannot serve both. So
   this figure builds its own holder instead of taking `figureHolder`, and
   `.result--locked .headsview__chart` in the stylesheet is what blurs it.
   ========================================================================= */

function makeHeads(shared) {
    "use strict"

    const score = shared.score
    const known = shared.known
    const reachOf = shared.reachOf
    const teaseValue = shared.teaseValue
    const sentence = shared.sentence
    const pickButtons = shared.pickButtons
    const VOTES = shared.VOTES
    const showTip = shared.showTip
    const hideTip = shared.hideTip

    const HEADS_OF = ["control", "ers", "cerq"]
    const HEART_KEY = "Heart"
    const MIND_KEY = "Mind"

    // One hue a half, so the chart groups by system rather than by scale: the
    // mind cool, the heart warm. The channel that carries the system is the
    // solid bar and the one that gets in its way the same hue held back, which
    // is the whole of the ranking the figure makes.
    const MIND = "#8fd3f4"
    const HEART = "#f2a0b5"
    // The glass of the bulb, and the light behind it. Warmer than the gold
    // everything earned is written in, and on no bar, so it cannot be read as
    // a channel picked out.
    const BULB = "#ffd873"

    // The four channels, each the mean reach of the dimensions it is made of:
    // the mean of reaches rather than the reach of a mean, so scales of
    // different lengths weigh the same. `what` is the tooltip on the bar,
    // rather than prose on the page — the chart is four names and four
    // numbers, the climb's rule — and it says what the channel *means* and
    // nothing about which scales went into it (see the note at the top).
    const CHANNELS = [
        {
            key: "restraint",
            head: "mind",
            name: "Restraint",
            carries: true,
            of: ["Self-Control"],
            what: "How firmly a goal holds you against temptation and habit.",
        },
        {
            key: "distractibility",
            head: "mind",
            name: "Distractibility",
            carries: false,
            of: ["Mind Wandering", "Absent-Mindedness", "Inattention"],
            what: "How often the mind drifts off, drops the thread and leaves the last stretch unfinished.",
        },
        {
            key: "sensitivity",
            head: "heart",
            name: "Sensitivity",
            carries: true,
            of: ["Emotional Sensitivity", "Emotional Arousal", "Emotional Persistence"],
            what: "How easily emotion is set off, how strongly it comes and how long it stays.",
        },
        {
            key: "brooding",
            head: "heart",
            name: "Brooding",
            carries: false,
            of: ["Rumination", "Catastrophising", "Self-Blame", "Other-Blame"],
            what: "How often, when something hits, the mind keeps returning to it — going over it, dwelling on how bad it is, looking for whose fault it was.",
        },
    ]

    // The two halves, in the order they are read: the mind first, since the
    // level turns from what you are like to how well you steer it.
    const HALVES = [
        { head: "mind", name: "mind", colour: MIND, glow: BULB, kind: "Your mind", ask: "Does this match how you focus?", key: MIND_KEY },
        { head: "heart", name: "heart", colour: HEART, glow: HEART, kind: "Your heart", ask: "Does this match your emotional life?", key: HEART_KEY },
    ]

    // Each half reads as one of four sentences, from which side of the
    // midpoint its two channels fall — the temperament's rule, and the line
    // the chart draws. Written to a person who might land in any of them, and
    // deliberately unnamed: a label over the sentence ("Full and caught") read
    // as a verdict, and went in September 2026.
    const SAID = {
        mind: {
            "big-clean": "you hold a goal firmly and the way to it stays clear: your attention goes where you send it.",
            "big-tangled":
                "you hold a goal firmly, but your attention wanders on the way to it: the mind drifts, threads get dropped, the last stretch goes unfinished.",
            "small-clean": "your attention stays where you put it, but a goal does not grip you hard: temptation and habit get their say.",
            "small-tangled": "a goal does not grip you hard and your attention wanders, so much of a day goes where it likes rather than where you send it.",
        },
        heart: {
            "big-clean": "you feel things strongly, and when something hits, your thinking moves through it rather than round it.",
            "big-tangled":
                "you feel things strongly, and when something hits, your mind keeps going back to it: turning it over, dwelling on how bad it was, looking for whose fault it was.",
            "small-clean": "little stirs you, and what does passes without much turning over.",
            "small-tangled": "little stirs you, but what does tends to stay: you keep turning it over long after the feeling itself has passed.",
        },
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

    // Whether there is a chart to draw yet: every channel answered.
    function headed() {
        const values = now(false)
        return Object.keys(values).every((key) => values[key] !== undefined)
    }

    // Which of a half's four sentences the two bars above it put it in.
    function readingOf(head, values) {
        const pair = CHANNELS.filter((one) => one.head === head)
        const carried = values[pair.find((one) => one.carries).key]
        const interference = values[pair.find((one) => !one.carries).key]
        return SAID[head][(carried >= 0.5 ? "big" : "small") + "-" + (interference >= 0.5 ? "tangled" : "clean")]
    }

    /* ------------------------------- the glyphs ---------------------------- */

    // Both are line drawings in `currentColor`, which the emblem sets to its
    // half's colour, and both are fixed: they say which half this is and
    // nothing about the answers. The bulb's glass and filament are the one
    // exception, drawn in `BULB` rather than in the mind's blue: a bulb whose
    // glass is the same cool blue as its cap does not read as a bulb, and the
    // cap keeps the half's colour so the emblem still answers to its bars.
    function glyph(which) {
        const figure = document.createElementNS(SVG, "svg")
        figure.setAttribute("class", "headsview__glyph")
        figure.setAttribute("aria-hidden", "true")

        if (which === "mind") {
            // Glass, a base and one filament, and nothing else: every further
            // line read as smudge at the size this is drawn at.
            figure.setAttribute("viewBox", "-26 -32 52 58")
            const group = draw("g", {
                fill: "none",
                stroke: "currentColor",
                "stroke-width": 2.2,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
            })
            group.appendChild(draw("circle", { cx: 0, cy: -9, r: 19, fill: BULB, "fill-opacity": 0.2, stroke: BULB }))
            group.appendChild(draw("path", { d: "M -7 11 L -8 21 L 8 21 L 7 11" }))
            group.appendChild(draw("path", { d: "M -5 10 L -5 -3 L 0 -10 L 5 -3 L 5 10", stroke: BULB }))
            figure.appendChild(group)
        } else {
            figure.setAttribute("viewBox", "-36 -40 72 64")
            figure.appendChild(
                draw("path", {
                    d:
                        "M 0 20 C -22 4 -32 -6 -32 -17 C -32 -29 -22 -35 -13 -35 C -6 -35 -1 -30 0 -24 " +
                        "C 1 -30 6 -35 13 -35 C 22 -35 32 -29 32 -17 C 32 -6 22 4 0 20 Z",
                    fill: "currentColor",
                    "fill-opacity": 0.17,
                    stroke: "currentColor",
                    "stroke-width": 2.4,
                    "stroke-linejoin": "round",
                }),
            )
        }
        return figure
    }

    /* -------------------------------- the chart --------------------------- */

    function text(tag, className, words) {
        const element = document.createElement(tag)
        element.className = className
        element.textContent = words
        return element
    }

    // One row: the name, its share at the far end, and a track the fill draws
    // itself out along. The whole row takes the tooltip, so what a channel
    // means is read by hovering it rather than off the page — one sentence,
    // with no percentage in it, the number being on the row already. The
    // label a screen reader hears carries the number too, since a reader
    // handed an explicit label never reaches the text inside the row.
    function row(one, share) {
        const item = document.createElement("li")
        item.className = "headsview__row" + (one.carries ? " headsview__row--carries" : "")
        item.tabIndex = 0
        item.setAttribute("aria-label", one.name + ": " + Math.round(share * 100) + "%. " + one.what)
        item.appendChild(text("b", "headsview__label", one.name))
        item.appendChild(text("span", "headsview__num", Math.round(share * 100) + "%"))

        const track = document.createElement("span")
        track.className = "headsview__track"
        track.setAttribute("aria-hidden", "true")
        const fill = document.createElement("i")
        fill.style.width = Math.round(share * 100) + "%"
        track.appendChild(fill)
        item.appendChild(track)

        item.addEventListener("mouseenter", () => showTip(track, one.what))
        item.addEventListener("mouseleave", hideTip)
        item.addEventListener("focus", () => showTip(track, one.what))
        item.addEventListener("blur", hideTip)
        return item
    }

    // One half: its glyph and name down the left, its two rows to the right,
    // and the dashed midpoint down the middle of them.
    function half(one, values, first) {
        const holder = document.createElement("div")
        holder.className = "headsview__half"
        holder.style.setProperty("--half", one.colour)
        // The light behind the glyph: the half's own colour, except that the
        // bulb glows in the colour of its glass.
        holder.style.setProperty("--glow", one.glow)

        const emblem = document.createElement("div")
        emblem.className = "headsview__emblem"
        emblem.appendChild(glyph(one.head))
        emblem.appendChild(text("p", "headsview__organ", one.name))
        holder.appendChild(emblem)

        const rows = document.createElement("ul")
        rows.className = "headsview__rows"
        // The line is drawn on the list, so it stands over the middle of the
        // tracks however wide the card is; only the first half is labelled.
        if (first) rows.appendChild(text("span", "headsview__midname", "midpoint"))
        for (const channel of CHANNELS.filter((each) => each.head === one.head)) rows.appendChild(row(channel, values[channel.key]))
        holder.appendChild(rows)

        return holder
    }

    // The whole chart, and its own holder: the stage a figure normally gets
    // from `figureHolder`, built here because what it holds is not an SVG.
    function chart(values, locked) {
        const stage = document.createElement("div")
        stage.className = "result__chart result__chart--wide headsview__stage"

        const inside = document.createElement("div")
        inside.className = "headsview__chart"
        inside.setAttribute("role", "list")
        inside.setAttribute(
            "aria-label",
            locked
                ? "Blurred preview of the chart your answers will draw"
                : "Four bars: how firmly a goal holds and how far the attention wanders, how strongly emotion comes and how far it is gone back over",
        )
        HALVES.forEach((one, index) => inside.appendChild(half(one, values, index === 0)))
        stage.appendChild(inside)

        if (locked) stage.appendChild(text("span", "result__lock", "Locked"))
        return stage
    }

    // The shelf's badge: the two organs and nothing else. This figure's chart
    // is HTML and its bars are names and numbers, neither of which can be
    // read at the size of a token — so what stands for the level there is the
    // pair it is about. It is the one badge in the app that says which level
    // it is rather than what the answers were, and that is the price of a
    // figure that is not a drawing.
    function badge() {
        const pair = document.createElement("span")
        pair.className = "shelf__badge-emblem"

        for (const one of HALVES) {
            const drawn = glyph(one.head)
            drawn.style.setProperty("--half", one.colour)
            drawn.style.setProperty("--glow", one.glow)
            pair.appendChild(drawn)
        }
        return pair
    }

    /* ------------------------------ the section --------------------------- */

    // One of the two readings under the chart: which half, the sentence the
    // two bars above put it in, and the vote. The bars are not restated here —
    // they are directly above, in the colour this card is about.
    function card(one, values) {
        const holder = document.createElement("div")
        holder.className = "headsview__card"
        // `--chart` is what a picked vote washes in, so the two halves vote in
        // their own colour rather than in the section's.
        holder.style.setProperty("--half", one.colour)
        holder.style.setProperty("--chart", one.colour)
        holder.appendChild(text("p", "headsview__kind", one.kind))
        holder.appendChild(text("p", "headsview__told", sentence(readingOf(one.head, values))))
        holder.appendChild(text("p", "headsview__ask", one.ask))
        holder.appendChild(pickButtons(one.key, VOTES))
        return holder
    }

    // A title, the chart at the width of the card, a reading under each half
    // with its vote, and one line on what the four bars are. Locked, the title
    // and the chart alone.
    function renderHeads(locked) {
        const all = document.createDocumentFragment()
        const values = now(locked)

        const headline = document.createElement("header")
        headline.className = "headsview__head"
        headline.appendChild(text("h3", "headsview__title", "Your mind and your heart"))
        all.appendChild(headline)

        all.appendChild(chart(values, locked))
        if (locked) return all

        const pair = document.createElement("div")
        pair.className = "headsview__pair"
        for (const one of HALVES) pair.appendChild(card(one, values))
        all.appendChild(pair)

        // What is left of the note the chart used to carry. The three
        // sentences explaining where a bar came from went with the tooltips
        // that said the same thing; this one stays, because it is the only
        // line on the level that says what the reading is not.
        all.appendChild(text("p", "headsview__note", "A busy head is not a broken one, and none of this is a diagnosis."))

        return all
    }

    return { HEADS_OF: HEADS_OF, HEART_KEY: HEART_KEY, MIND_KEY: MIND_KEY, headed: headed, renderHeads: renderHeads, badge: badge }
}
