"""Save a level's figure, drawn by the app itself at stand-in answers, as a PNG
for the preview card that sets it beside the level's name (kinks.png for
sexuality.html, wheel.png for archetypes.html, soma.png for mint.html).

A card's picture is either restated by hand (the opinions plane, a few dozen
lines) or, where the figure is too much drawing to copy, taken from the app:
the level's results are rendered through makeResults with a stand-in engine,
and the part wanted is turned into a picture by js/snapshot.js — the same
snapshot() that "Copy as image" uses, which writes every computed style onto
a copy, so the picture looks as the page does. The stand-in answers are in
FIGURES below, chosen to make a picture worth looking at; they are nobody's.

Run by hand when a figure changes (python assets/preview/still.py, or name
figures: python assets/preview/still.py kinks), then make.py for the JPEGs.
It wants the page served on port 8123 (the testyourself config in
.claude/launch.json) and Playwright with Edge, as assets/readme/make.py does.
"""

import base64
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
PAGE = "http://localhost:8123/?project=all"

# Per figure: the questionnaires its level's results are drawn from, the
# scores to draw them at (a dimension's mean on its own scale, or its share
# for a scored-by-option one), the answers a figure reads item by item, the
# part of the section to photograph and what to leave out of it.
FIGURES = {
    # Nine of the twenty-two turn somebody on, six of those lived out.
    "kinks": {
        "run": ["kinks"],
        "scores": {"Kinkiness": 9 / 22},
        "answers": "kinks",
        "part": ".kinks__stage",
    },
    # One archetype clearly first, the rest spread, so the wheel has a shape.
    "wheel": {
        "run": ["archetypes"],
        "scores": {
            "Idealist": 4.3, "Sage": 5.7, "Seeker": 6.7, "Revolutionary": 4.0, "Magician": 5.0, "Warrior": 3.7,
            "Realist": 4.7, "Jester": 3.3, "Lover": 5.3, "Creator": 6.0, "Ruler": 3.0, "Caregiver": 4.7,
        },
        "answers": None,
        # The wheel's holder, not the <svg>: snapshot measures offsetWidth, which an svg has not.
        "part": ".wheel__all > .result__chart",
    },
    # The body lit up well past the middle on all three, so it has colour, nerves and glow.
    "soma": {
        "run": ["mint"],
        "scores": {"Bodily Awareness": 5.2, "Bodily Sensitivity": 4.9, "Bodily Clarity": 4.6},
        "answers": None,
        "part": ".soma__stage > .soma__figure",
        # Its halos are SVG filters, which snapshot() bands headless; photographed instead, without the leads to the readings.
        "direct": ".soma__leads",
    },
}

JS = r"""
async (figure) => {
    // A dimension's scale as the engine flattens it: the options of the item or
    // its questionnaire, less the ways out, by their scores where they carry one.
    const dimensions = {}
    for (const key of figure.run) {
        const q = QUESTIONNAIRES[key]
        for (const it of q.items) {
            if (!it.dimension) continue
            const format = it.format || q.format
            const options = (format.options || []).map((one) => (typeof one === "number" ? { value: one } : one))
            const scale = options.filter((one) => !one.custom)
            const worth = scale.some((one) => one.score !== undefined)
            const values = scale.map((one) => (worth ? one.score : one.value))
            const item = Object.assign({}, it, {
                questionnaire: key, level: 1, options: options, color: format.color || q.format.color,
                lowest: Math.min(...values), highest: Math.max(...values),
                custom: options.filter((one) => one.custom).map((one) => one.value),
                scores: worth ? Object.fromEntries(scale.map((one) => [one.value, one.score])) : null,
            })
            ;(dimensions[it.dimension] = dimensions[it.dimension] || []).push(item)
        }
    }

    // The kinks read their answers cell by cell: the first `on` items turned on,
    // the first `lived` of those done, the rest fine but never done.
    const answers = {}
    if (figure.answers === "kinks") {
        const items = dimensions.Kinkiness
        const cells = items[0].options.filter((one) => !one.custom)
        const cell = (score, done) => cells.find((one) => one.score === score && (done ? one.down > 0 : one.down === 0))
        const on = Math.round(figure.scores.Kinkiness * items.length)
        items.forEach((it, at) => (answers[it.key] = (at < on ? cell(1, at < 6) : cell(0, false)).value))
    }

    // The engine's own percentile: off the norm's distribution where it has one.
    const percentile = (value, norm) => {
        const spread = norm.distribution
        if (spread) {
            const total = spread.shares.reduce((sum, share) => sum + share, 0)
            let below = 0
            spread.shares.forEach((share, at) => {
                const lower = spread.from + at * spread.step
                below += share * Math.min(1, Math.max(0, (value - lower) / spread.step))
            })
            return below / total
        }
        const z = (value - norm.mean) / norm.sd
        const t = 1 / (1 + 0.2316419 * Math.abs(z))
        const tail = 0.3989423 * Math.exp((-z * z) / 2) * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
        return z > 0 ? 1 - tail : tail
    }

    const engine = {
        RUN: figure.run, CHARTS: [], dimensions: dimensions, dimensionOrder: Object.keys(dimensions),
        score: (d) => figure.scores[d], total: (d) => figure.scores[d], known: (d) => d in dimensions,
        percentile: percentile, tercile: () => 1, levelProgress: () => ({ answered: 1, total: 1 }),
        answer: (key) => answers[key], showScreen() {}, burst() {}, still: () => true,
        feedback: {}, ratings: {}, $: (id) => document.getElementById(id), ratingKey: () => "Preview", visit() {}, noted() {}, source: "Preview",
    }
    const results = makeResults(engine)
    const box = document.createElement("div")
    box.style.cssText = "position:fixed;inset:0;z-index:99999;overflow:auto;background:#05070d;padding:20px;width:900px"
    document.body.appendChild(box)
    results.renderResults(box, 1, false)
    await new Promise((done) => setTimeout(done, 4000))

    const part = box.querySelector(figure.part)
    if (!part || !part.offsetWidth) return null
    // A figure drawn through SVG filters, which snapshot() bands in this headless
    // browser (not on screen), is left on the page to be photographed instead, on nothing so that it sits on
    // the card's own dark.
    if (figure.direct) {
        for (const one of box.querySelectorAll(figure.direct)) one.style.display = "none"
        for (const one of document.body.children) if (one !== box) one.style.visibility = "hidden"
        const bare = document.head.appendChild(document.createElement("style"))
        bare.textContent = "html, body, body::before, body::after { background: transparent !important } body::before, body::after { display: none !important }"
        box.style.background = "transparent"
        box.style.visibility = "visible"
        for (let one = part; one && one !== box; one = one.parentElement) one.style.cssText += ";background:transparent !important;box-shadow:none !important;border-color:transparent !important"
        part.id = "still-part"
        return "direct"
    }
    const canvas = await snapshot(part, { skip: ".votes, [class*='__ask'], [class*='__vote'], .result__lock", ratio: 2 })
    return canvas.toDataURL("image/png").split(",")[1]
}
"""


def main():
    names = sys.argv[1:] or list(FIGURES)
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")
        for name in names:
            if name not in FIGURES:
                sys.exit(f"No figure called {name}; there are {', '.join(FIGURES)}.")
            page = browser.new_page(viewport={"width": 1000, "height": 1600}, device_scale_factor=2)
            page.goto(PAGE, wait_until="networkidle")
            data = page.evaluate(JS, FIGURES[name])
            out = HERE / f"{name}.png"
            if data == "direct":
                page.locator("#still-part").screenshot(path=out, omit_background=True)
            page.close()
            if not data:
                sys.exit(f"Nothing matched {FIGURES[name]['part']} in the {name} figure.")
            if data != "direct":
                out.write_bytes(base64.b64decode(data))
            print(f"Wrote {out.relative_to(HERE.parent.parent)}")
        browser.close()


if __name__ == "__main__":
    main()
