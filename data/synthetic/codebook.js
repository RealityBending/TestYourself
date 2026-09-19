/* ==========================================================================
   data/synthetic/codebook.js — every item the test asks, as JSON, read from
   the same content files the page loads.

   Run with bun (or node) from anywhere:

       bun data/synthetic/codebook.js > codebook.json

   `synthesize.py` calls it for you. It loads `content/timeline.js` and then
   every `content/block_*.js` that `index.html` names, in that order, inside
   one function so that the globals they share (`defineBlock`, `QUESTIONNAIRES`,
   `BLOCKS`, `TIMELINE`, `formatMint`) resolve exactly as they do on the page,
   and then walks the four lists the way `app.js` does — levels, blocks,
   entries, items — so that the codebook can never disagree with the run.

   A `text` written as a function (an item wording itself from an earlier
   answer, such as `Demographics_BirthDay`) cannot be written to JSON, so it
   is evaluated once per possible answer to the item it waits on and written
   as `textBy: { <key>: { <value>: "…" } }`. Nothing here reaches the browser;
   it is a workbench, like `norms/`.
   ========================================================================== */

const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..", "..")

// The content files, in the order index.html loads them — the page is the
// authority on which files exist and which come first.
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
const files = [...html.matchAll(/<script src="(content\/[^"]+)"><\/script>/g)].map((m) => m[1])
if (!files.length) throw new Error("no content scripts found in index.html")

const source = files.map((file) => fs.readFileSync(path.join(ROOT, file), "utf8")).join("\n;\n")
const content = new Function(source + "\nreturn { QUESTIONNAIRES, BLOCKS, TIMELINE, WATER_SHARE, formatMint }")()

// The app version, so a synthetic file says which code its codebook came from.
const app = fs.readFileSync(path.join(ROOT, "js", "app.js"), "utf8")
const version = (app.match(/const APP_VERSION = "([^"]+)"/) || [])[1] || null

function setting(item, questionnaire, entry) {
    return item[entry] !== undefined ? item[entry] : questionnaire[entry]
}

function typeOf(item, questionnaire) {
    const written = setting(item, questionnaire, "type")
    if (written === "briefing") throw new Error("a briefing among a questionnaire's items: " + item.key)
    if (written) return written
    return (setting(item, questionnaire, "format") || {}).input ? "input" : "choice"
}

const items = []
const run = []
const levels = []
const byKey = {}

// A string is written as it is; a function is evaluated for each answer the
// item it waits on could take, since that is the only answer it may read.
function wordings(text, item) {
    if (typeof text !== "function") return { text: text === undefined ? null : text }
    const waits = item.showIf && item.showIf.key
    const source = waits && byKey[waits]
    if (!source) throw new Error(item.key + " words itself but waits on nothing that was asked before it")
    const textBy = {}
    for (const option of source.options) {
        const answer = (key) => (key === waits ? option.value : undefined)
        textBy[option.value] = text(answer)
    }
    return { textBy: { [waits]: textBy } }
}

content.TIMELINE.forEach((entry, at) => {
    const level = at + 1
    levels.push({ level: level, name: entry.name, blocks: entry.blocks, fork: entry.fork || null, beneath: false })

    for (const name of entry.blocks) {
        const block = content.BLOCKS[name]
        if (!block) throw new Error("timeline.js asks for a block that is not defined: " + name)

        for (const entry of block) {
            // Nothing to answer on a briefing, but the app records one in
            // `items[]` like any other step, so a synthetic file wants the
            // same row (with nothing in it) to have the same columns.
            if (entry.type === "briefing") {
                items.push({ key: entry.key, level: level, block: name, questionnaire: null, type: "briefing" })
                continue
            }

            const questionnaire = entry
            run.push(questionnaire.key)

            for (const item of questionnaire.items) {
                const format = setting(item, questionnaire, "format") || {}
                const options = (format.options || []).map((one, position) => {
                    const option = typeof one === "object" ? one : { value: one }
                    return Object.assign(
                        {
                            value: option.value,
                            label: format.labels ? format.labels[position] : null,
                            custom: !!option.custom,
                            exclusive: !!option.exclusive,
                            small: !!option.small,
                        },
                        wordings(option.text, item),
                    )
                })
                const scale = options.filter((one) => !one.custom).map((one) => one.value)

                const flat = Object.assign(
                    {
                        key: item.key,
                        level: level,
                        block: name,
                        questionnaire: questionnaire.key,
                        type: typeOf(item, questionnaire),
                        instructions: setting(item, questionnaire, "instructions") || null,
                        dimension: item.dimension || null,
                        reverse: !!item.reverse,
                        check: item.check === undefined ? null : item.check,
                        showIf: item.showIf || null,
                        shuffle: setting(item, questionnaire, "shuffle") !== false,
                        options: options,
                        custom: options.filter((one) => one.custom).map((one) => one.value),
                        input: format.input || null,
                        multiline: !!format.multiline,
                        optional: !!format.optional,
                        anchors: format.anchors || null,
                        lowest: scale.length ? Math.min.apply(null, scale) : format.min === undefined ? null : format.min,
                        highest: scale.length ? Math.max.apply(null, scale) : format.max === undefined ? null : format.max,
                    },
                    wordings(item.text, item),
                )
                items.push(flat)
                byKey[flat.key] = flat
            }
        }
    }
})

// Which levels are under the seabed. It is not written on a level any more
// (`WATER_SHARE` in content/timeline.js): the first two thirds of the scored
// levels are in the water and the rest are in the rock, which is the sum
// `waterLevels` does in app.js. The rule is worked out in both places, so a
// change to one wants the same change here.
const scored = [...new Set(items.filter((item) => item.dimension).map((item) => item.level))].sort((one, two) => one - two)
const water = scored.slice(0, Math.round(scored.length * content.WATER_SHARE))
for (const level of levels) level.beneath = scored.indexOf(level.level) !== -1 && water.indexOf(level.level) === -1

const questionnaires = {}
for (const key of run) {
    const q = content.QUESTIONNAIRES[key]
    const norms = {}
    for (const dimension of Object.keys(q.norms || {})) {
        norms[dimension] = { interpretations: !!(q.norms[dimension] && q.norms[dimension].interpretations) }
    }
    questionnaires[key] = {
        name: q.name || null,
        results: q.results !== false,
        profile: q.profile !== false,
        instructions: q.instructions || null,
        norms: norms,
    }
}

process.stdout.write(
    JSON.stringify(
        { version: version, formatMint: content.formatMint, levels: levels, run: run, questionnaires: questionnaires, items: items },
        null,
        2,
    ),
)
