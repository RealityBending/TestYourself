/* =========================================================================
   Two old theories, side by side, as the whole of the FIPI's reading: the star
   sign, read from the birthday and nothing the person said about themselves,
   and Galen's four temperaments on the two axes Eysenck laid them over —
   extraversion across, stability up — which are exactly the two FIPI
   dimensions with norms. Each takes the ordinary agree/disagree, and that pair
   of votes is the point: one reading came from the answers and one from a
   birthday, and agreeing with the second as readily as the first is the Barnum
   effect caught in the act.
   ========================================================================= */

function makeTheories(shared) {
    "use strict"

    const score = shared.score
    const percentile = shared.percentile
    const answer = shared.answer
    const known = shared.known
    const normOf = shared.normOf
    const teaseValue = shared.teaseValue
    const voteButtons = shared.voteButtons

    const OLD_THEORIES_OF = "fipi"
    const TEMPERAMENT_KEY = "Temperament"
    const STARS_KEY = "Star Sign"
    const TEMPERAMENT_ON = ["Extraversion", "Emotional Stability"] // across, then up

    const TEMPERAMENTS = {
        sanguine: { name: "Sanguine", keys: ["warm", "sociable", "easy-going", "quick to recover"] },
        choleric: { name: "Choleric", keys: ["driven", "quick-tempered", "decisive", "restless"] },
        phlegmatic: { name: "Phlegmatic", keys: ["calm", "steady", "unflappable", "private"] },
        melancholic: { name: "Melancholic", keys: ["thoughtful", "sensitive", "inward", "exacting"] },
    }

    // In cusp order from the sign January opens in: month m's first part is
    // SIGNS[m - 1], its second SIGNS[m % 12]. `expects` is the stereotype
    // written on the FIPI's dimensions, for a later level to check the stars
    // against what was measured; nothing reads it yet.
    const SIGNS = [
        {
            name: "Capricorn",
            glyph: "♑",
            keys: ["disciplined", "patient", "ambitious", "reserved"],
            expects: { Conscientiousness: "high", Extraversion: "low" },
        },
        {
            name: "Aquarius",
            glyph: "♒",
            keys: ["original", "independent", "idealistic", "detached"],
            expects: { Openness: "high", Agreeableness: "low" },
        },
        {
            name: "Pisces",
            glyph: "♓",
            keys: ["dreamy", "compassionate", "intuitive", "easily hurt"],
            expects: { Agreeableness: "high", "Emotional Stability": "low", Openness: "high" },
        },
        {
            name: "Aries",
            glyph: "♈",
            keys: ["bold", "impatient", "competitive", "quick to move on"],
            expects: { Extraversion: "high", Agreeableness: "low", Conscientiousness: "low" },
        },
        {
            name: "Taurus",
            glyph: "♉",
            keys: ["steady", "sensual", "stubborn", "reliable"],
            expects: { Conscientiousness: "high", Openness: "low" },
        },
        {
            name: "Gemini",
            glyph: "♊",
            keys: ["curious", "quick-witted", "talkative", "changeable"],
            expects: { Extraversion: "high", Openness: "high", Conscientiousness: "low" },
        },
        {
            name: "Cancer",
            glyph: "♋",
            keys: ["loyal", "protective", "tender", "guarded"],
            expects: { Agreeableness: "high", "Emotional Stability": "low" },
        },
        {
            name: "Leo",
            glyph: "♌",
            keys: ["confident", "generous", "proud", "made for the spotlight"],
            expects: { Extraversion: "high", "Emotional Stability": "high" },
        },
        {
            name: "Virgo",
            glyph: "♍",
            keys: ["precise", "modest", "self-critical", "a worrier"],
            expects: { Conscientiousness: "high", "Emotional Stability": "low", Extraversion: "low" },
        },
        {
            name: "Libra",
            glyph: "♎",
            keys: ["charming", "fair-minded", "peace-seeking", "indecisive"],
            expects: { Agreeableness: "high", Extraversion: "high" },
        },
        {
            name: "Scorpio",
            glyph: "♏",
            keys: ["intense", "private", "unforgiving", "all or nothing"],
            expects: { Extraversion: "low", Agreeableness: "low", "Emotional Stability": "low" },
        },
        {
            name: "Sagittarius",
            glyph: "♐",
            keys: ["restless", "optimistic", "frank", "light-hearted"],
            expects: { Extraversion: "high", Openness: "high", "Emotional Stability": "high" },
        },
    ]

    // The two standings as percentiles — the same a row reads — or nothing
    // while either is unscored. Locked, the same shape from the stand-ins.
    function temperamentAt(tease) {
        const at = TEMPERAMENT_ON.map((dimension) => {
            if (!known(dimension)) return undefined
            const norm = normOf(dimension)
            const value = tease ? teaseValue(dimension) : score(dimension)
            return norm && value !== undefined ? percentile(value, norm) : undefined
        })
        return at.some((one) => one === undefined) ? undefined : at
    }

    function temperamentOf(at) {
        const outgoing = at[0] >= 0.5
        const steady = at[1] >= 0.5
        return TEMPERAMENTS[outgoing ? (steady ? "sanguine" : "choleric") : steady ? "phlegmatic" : "melancholic"]
    }

    // The sign if the half of the month was given, the two it could be if only
    // the month was, nothing without even that.
    function starSign() {
        const month = answer("BirthMonth")
        if (!month) return undefined
        const half = answer("BirthDay")
        const first = SIGNS[month - 1]
        const second = SIGNS[month % 12]
        if (half === 1) return { sign: first }
        if (half === 2) return { sign: second }
        return { between: [first, second] }
    }

    const QUADRANT = 200
    const INSET = 22 // room for the axis words

    function drawQuadrant(figure, at) {
        figure.setAttribute("viewBox", "0 0 " + QUADRANT + " " + QUADRANT)
        figure.classList.add("quadrant")

        const span = QUADRANT - 2 * INSET
        const half = span / 2
        const x = INSET + at[0] * span
        const y = INSET + (1 - at[1]) * span
        const outgoing = at[0] >= 0.5
        const steady = at[1] >= 0.5
        const cells = [
            { name: "Phlegmatic", right: false, top: true },
            { name: "Sanguine", right: true, top: true },
            { name: "Melancholic", right: false, top: false },
            { name: "Choleric", right: true, top: false },
        ]

        for (const cell of cells) {
            const lit = cell.right === outgoing && cell.top === steady
            const cx = INSET + (cell.right ? half : 0)
            const cy = INSET + (cell.top ? 0 : half)
            figure.appendChild(
                draw("rect", {
                    class: "quadrant__cell" + (lit ? " quadrant__cell--lit" : ""),
                    x: cx,
                    y: cy,
                    width: half,
                    height: half,
                    rx: 6,
                }),
            )
            const label = draw("text", {
                class: "quadrant__name" + (lit ? " quadrant__name--lit" : ""),
                x: cx + half / 2,
                y: cy + half / 2 + 3,
                "text-anchor": "middle",
            })
            label.textContent = cell.name
            figure.appendChild(label)
        }

        for (const one of [
            { text: "reserved", x: INSET, anchor: "start" },
            { text: "outgoing", x: QUADRANT - INSET, anchor: "end" },
        ]) {
            const label = draw("text", { class: "quadrant__axis", x: one.x, y: QUADRANT - 7, "text-anchor": one.anchor })
            label.textContent = one.text
            figure.appendChild(label)
        }
        for (const one of [
            { text: "steady", y: INSET, anchor: "end" },
            { text: "reactive", y: QUADRANT - INSET, anchor: "start" },
        ]) {
            const label = draw("text", {
                class: "quadrant__axis",
                "text-anchor": one.anchor,
                transform: "translate(13 " + one.y + ") rotate(-90)",
            })
            label.textContent = one.text
            figure.appendChild(label)
        }

        figure.appendChild(draw("circle", { class: "quadrant__halo", cx: x, cy: y, r: 11 }))
        figure.appendChild(draw("circle", { class: "quadrant__you", cx: x, cy: y, r: 5 }))
    }

    // One card: what is being read, its figure, the name it comes out as, then
    // what that name predicts and the vote on it. The heading says what the
    // card *is* and the line under the name what it *predicts*, so the two are
    // told apart on sight. A card with no words to give — a sign that could be
    // one of two — says why instead, and takes no vote.
    function theoryCard(kind, figure, name, keys, why, key, locked) {
        const card = document.createElement("div")
        card.className = "theory"

        const piece = (className, text, blank) => {
            const line = document.createElement("p")
            line.className = className + (blank && locked ? " blank" : "")
            line.textContent = text
            card.appendChild(line)
        }

        piece("theory__kind", kind)
        card.appendChild(figure)
        piece("theory__name", name, true)

        if (keys) {
            piece("theory__predicts", "It predicts that you are…")
            const list = document.createElement("ul")
            list.className = "theory__keys" + (locked ? " blank" : "")
            for (const word of keys) {
                const item = document.createElement("li")
                item.textContent = word
                list.appendChild(item)
            }
            card.appendChild(list)
            if (!locked) card.appendChild(voteButtons(key))
        } else {
            piece("theory__why", why)
        }

        return card
    }

    function renderOldTheories(locked) {
        const holder = document.createElement("div")
        holder.className = "theories"

        const intro = document.createElement("p")
        intro.className = "theories__intro"
        intro.textContent =
            "Two of the oldest ways of describing a person were the sign you were born under, and the " +
            "four temperaments of the ancient Greeks. Based on your answers so far, here is what an astrologer and a early physician " +
            "would have said about you.<br />Finish the test and see how well either of them holds up!"
        holder.appendChild(intro)

        const pair = document.createElement("div")
        pair.className = "theories__pair"
        holder.appendChild(pair)

        const stars = locked ? { sign: SIGNS[0] } : starSign()
        if (stars) {
            const glyph = document.createElement("p")
            glyph.className = "theory__glyph"
            glyph.setAttribute("aria-hidden", "true")
            // The text-presentation selector keeps the zodiac character a plain
            // glyph rather than the emoji face most systems default to.
            const plain = (sign) => sign.glyph + "︎"
            glyph.textContent = stars.sign ? plain(stars.sign) : plain(stars.between[0]) + " " + plain(stars.between[1])
            pair.appendChild(
                stars.sign
                    ? theoryCard("Your star sign is", glyph, stars.sign.name, stars.sign.keys, "", STARS_KEY, locked)
                    : theoryCard(
                          "Your star sign is",
                          glyph,
                          stars.between[0].name + " or " + stars.between[1].name,
                          undefined,
                          "Without the day, the stars can't say which.",
                          STARS_KEY,
                          locked,
                      ),
            )
        }

        const at = temperamentAt(locked)
        const type = at ? temperamentOf(at) : undefined
        if (type) {
            const figure = document.createElementNS(SVG, "svg")
            figure.setAttribute("role", "img")
            figure.setAttribute(
                "aria-label",
                locked
                    ? "Blurred preview of your temperament, still locked"
                    : "Your temperament: " + type.name + ", on the plane of extraversion and stability",
            )
            figure.classList.add("theory__figure")
            drawQuadrant(figure, at)
            pair.appendChild(theoryCard("Your temperament is", figure, type.name, type.keys, "", TEMPERAMENT_KEY, locked))
        }

        return holder
    }

    return {
        OLD_THEORIES_OF: OLD_THEORIES_OF,
        STARS_KEY: STARS_KEY,
        TEMPERAMENT_KEY: TEMPERAMENT_KEY,
        renderOldTheories: renderOldTheories,
    }
}
