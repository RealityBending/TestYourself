/* =========================================================================
   NOT LOADED (September 2026). The level these faces closed is read back as
   the climb (climb.js) instead, and this file has no <script> tag in
   index.html. Kept whole so the faces can be put back by giving it its tag,
   a makeFaces(shared) call in makeResults and its branches in renderResults,
   onProfile and feedbackKeys — the shape the climb took over from it.

   Mood and Health (and Stress, while the PCL-2 is asked), as a row of faces: sad at one end of a scale,
   pleased at the other, on a ring that fills the way a soma organ's does. The
   PHQ-4 and the sleep questionnaire keep their items and scoring and
   read back together as this one section (`MOOD_HEALTH_OF`), and the Health
   face reaches back to the self-rated health single on level 1.

   Mood is not a dimension — the PHQ-4's Anxiety and Depression stay apart as
   items so `total()` reads them as written — and General Health carries no
   norms in content/, so both are read against norms written here, in the same
   shape `normOf` returns. MOOD_NORM is a placeholder like every other norm in
   the app; HEALTH_NORM is approximate, read off the shape of published
   five-category self-rated health distributions rather than fitted to a sample.
   ========================================================================= */

function makeFaces(shared) {
    "use strict"

    const dimensions = shared.dimensions
    const score = shared.score
    const total = shared.total
    const tercile = shared.tercile
    const known = shared.known
    const normOf = shared.normOf
    const standFrom = shared.standFrom
    const teaseReach = shared.teaseReach
    const sentence = shared.sentence
    const voteButtons = shared.voteButtons

    const MOOD_HEALTH_OF = ["phq4", "sleep"]

    const MOOD_NORM = {
        mean: 1.9,
        sd: 1.6,
        interpretations: {
            low: "your mood over the last couple of weeks has been steady, without much sign of anxiety or low spirits.",
            mid: "you've had a few anxious or low days over the last couple of weeks, about as often as most people do.",
            high: "anxiety or low mood have weighed on you more over the last couple of weeks than most people report. This is not a diagnosis, but it may be worth talking to someone about.",
        },
    }
    const HEALTH_NORM = {
        mean: 3.6,
        sd: 1.0,
        interpretations: {
            low: "you rate your physical health lower than most people rate theirs. If it has been that way for a while, it may be worth seeing a doctor.",
            mid: "you rate your physical health about where most people put theirs.",
            high: "you rate your physical health better than most people rate theirs.",
        },
    }

    // Each reading is built fresh on every render, the way `score()` is, and
    // says whether its dimensions `exist` in this run at all — the faces name
    // their dimensions directly rather than through `dimensionsOf`, so a block
    // left out of the timeline has to narrow the row instead of throwing.
    function moodFace() {
        const exists = known("Anxiety") && known("Depression")
        const anxiety = exists ? total("Anxiety") : undefined
        const depression = exists ? total("Depression") : undefined
        const value = anxiety === undefined || depression === undefined ? undefined : anxiety + depression
        return { key: "Mood", exists: exists, value: value, lowest: 0, highest: 12, worse: "high", norm: MOOD_NORM }
    }

    function stressFace() {
        const question = known("Stress") && dimensions["Stress"][0]
        return {
            key: "Stress",
            exists: !!question,
            value: question ? score("Stress") : undefined,
            lowest: question ? question.lowest : 0,
            highest: question ? question.highest : 1,
            worse: "high",
            norm: question ? normOf("Stress") : null,
        }
    }

    // Excellent health is the pleased end, so this is the one face not flipped.
    function healthFace() {
        const question = known("General Health") && dimensions["General Health"][0]
        return {
            key: "Health",
            exists: !!question,
            value: question ? score("General Health") : undefined,
            lowest: question ? question.lowest : 1,
            highest: question ? question.highest : 5,
            worse: "low",
            norm: HEALTH_NORM,
        }
    }

    const MOOD_HEALTH = [moodFace, stressFace, healthFace]

    const RADIUS = 48
    const CX = 60
    const CY = 55

    // A curve whose middle sits below its own ends is a smile and above them a
    // frown — the opposite of what "curves up" suggests, so check it on sight.
    function mouth(happy) {
        const bow = 28 * happy - 14
        return "M" + (CX - 13) + " " + (CY + 12) + " Q" + CX + " " + (CY + 12 + bow) + " " + (CX + 13) + " " + (CY + 12)
    }

    function meanTick(svg, meanHappy) {
        const angle = 2 * Math.PI * meanHappy - Math.PI / 2
        const tick = draw("line", {
            class: "face__mean",
            x1: CX + Math.cos(angle) * (RADIUS - 9),
            y1: CY + Math.sin(angle) * (RADIUS - 9),
            x2: CX + Math.cos(angle) * (RADIUS + 9),
            y2: CY + Math.sin(angle) * (RADIUS + 9),
        })
        tick.appendChild(draw("title", {})).textContent = "The average person"
        svg.appendChild(tick)
    }

    function drawFace(svg, happy, meanHappy, colour) {
        svg.setAttribute("viewBox", "0 0 120 120")
        svg.style.setProperty("--chart", colour)
        svg.innerHTML = ""

        const round = 2 * Math.PI * RADIUS
        svg.appendChild(draw("circle", { class: "face__track", cx: CX, cy: CY, r: RADIUS }))
        svg.appendChild(
            draw("circle", {
                class: "face__ring",
                cx: CX,
                cy: CY,
                r: RADIUS,
                "stroke-dasharray": round.toFixed(1),
                "stroke-dashoffset": (round * (1 - happy)).toFixed(1),
                transform: "rotate(-90 " + CX + " " + CY + ")",
            }),
        )
        if (meanHappy !== null) meanTick(svg, meanHappy)

        const head = draw("g", { class: "face__head" })
        head.appendChild(draw("circle", { class: "face__eye", cx: CX - 13, cy: CY - 10, r: 3.4 }))
        head.appendChild(draw("circle", { class: "face__eye", cx: CX + 13, cy: CY - 10, r: 3.4 }))
        head.appendChild(draw("path", { class: "face__mouth", d: mouth(happy) }))
        svg.appendChild(head)
    }

    // A face per reading with something to show; one still unfinished, or
    // whose dimensions are not in this run, is skipped rather than half-drawn.
    function renderFaces(specs, tease) {
        const wrap = document.createElement("div")
        wrap.className = "faces"

        for (const spec of specs) {
            if (!spec.exists) continue
            const value = tease ? teaseReach(spec.key, spec.lowest, spec.highest) : spec.value
            if (value === undefined) continue

            // `happy` is a reach along the reading's own scale, flipped where
            // less is the happier place to be — a different axis from the
            // percentile written beside the face.
            const happyOf = (raw) => {
                const reach = (raw - spec.lowest) / (spec.highest - spec.lowest)
                return spec.worse === "high" ? 1 - reach : reach
            }
            const happy = happyOf(value)
            const meanHappy = spec.norm && !tease ? happyOf(spec.norm.mean) : null

            const figure = document.createElement("figure")
            figure.className = "face"

            const svg = document.createElementNS(SVG, "svg")
            svg.setAttribute("role", "img")
            svg.setAttribute("aria-label", (tease ? "Blurred preview of your " : "Your ") + spec.key.toLowerCase() + ", as a face")
            drawFace(svg, happy, meanHappy, mix("#ef4444", "#22c55e", happy))
            figure.appendChild(svg)

            const caption = document.createElement("figcaption")
            const name = document.createElement("p")
            name.className = "face__name"
            name.textContent = spec.key
            caption.appendChild(name)

            if (!tease) {
                const standing = spec.norm ? standFrom(value, spec.norm) : null
                const said = document.createElement("p")
                said.className = "face__reading"
                said.textContent = standing
                    ? standing.direction + " than " + standing.share + "% of people"
                    : "score: " + value.toFixed(1) + " of " + spec.highest
                caption.appendChild(said)

                const told = standing && spec.norm.interpretations && spec.norm.interpretations[tercile(standing.proportion)]
                if (told) {
                    const reading = document.createElement("p")
                    reading.className = "face__told"
                    reading.textContent = sentence(told)
                    caption.appendChild(reading)
                    caption.appendChild(voteButtons(spec.key))
                }
            }

            figure.appendChild(caption)
            wrap.appendChild(figure)
        }

        return wrap
    }

    return { MOOD_HEALTH: MOOD_HEALTH, MOOD_HEALTH_OF: MOOD_HEALTH_OF, renderFaces: renderFaces }
}
