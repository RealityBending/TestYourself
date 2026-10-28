/* ==========================================================================
   data/synthetic/codebook.js — every item the test asks, as JSON, read from
   the same content files the page loads.

   Run with bun (or node) from anywhere:

       bun data/synthetic/codebook.js > codebook.json

   `synthesize.py` calls it for you. It walks the `mint` battery (see
   below). It loads `content/timeline.js` and then every `content/block_*.js`
   that `index.html` names, in that order, inside one function so that the globals they share (`defineBlock`, `QUESTIONNAIRES`,
   `BLOCKS`, `BATTERIES`, `formatMint`) resolve exactly as they do on the page,
   and then walks the four lists the way `app.js` does — levels, blocks,
   entries, items — so that the codebook can never disagree with the run.

   A `text` written as a function (an item wording itself from an earlier
   answer, such as `Demographics_BirthDay`) cannot be written to JSON, so it
   is evaluated once per possible answer to the item it waits on and written
   as `textBy: { <key>: { <value>: "…" } }`. A briefing's is carried as the
   HTML the person reads, so that what framed the items can be read beside
   them; one written as a function (the onward briefing, which reads the
   run) is evaluated for a run that came from nowhere. Nothing here reaches
   the browser; it is a workbench, like `data/norms/`.
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
const content = new Function(source + "\nreturn { QUESTIONNAIRES, BLOCKS, BATTERIES, ASIDE, DEMOGRAPHICS, WATER_SHARE, formatMint }")()

// The `mint` timeline, which is what a link naming no battery walks, and what
// this describes — the deck's Content table, a synthetic run — is the test as
// it is sent to people. Anything ASIDE is taken off it, as app.js takes it
// off, and a level left with no block is dropped, so the numbering stays that
// of a `mint` run.
const written = content.BATTERIES.mint
    .map((entry, at) => Object.assign({}, entry, { blocks: entry.blocks.filter((name) => content.ASIDE.indexOf(name) === -1), written: at }))
    .filter((entry) => entry.blocks.length)
const timeline = written.filter((entry) => !entry.interlude)

// The demographics are written on no level: the first opens level 1, the
// second level 2 and the third level 3, whatever those hold, never the closing
// level, and what is left over when there are fewer levels at the head of the
// last — as app.js places them (`opening`) for a run no link started on. An
// interlude (`interlude: true`) is no level either: it opens the first level
// written after it, the closing excepted, ahead of any demographics there, and
// with only the closing after it is not asked. The rules are worked out in
// both places, so a change to one wants the same here.
const places = timeline.filter((entry) => entry.blocks.indexOf("closing") === -1)
const opening = places.map(() => [])
const interluded = written.filter((entry) => entry.interlude).flatMap((entry) => entry.blocks)
for (const interlude of written.filter((entry) => entry.interlude)) {
    const after = places.findIndex((entry) => entry.written > interlude.written)
    if (after !== -1) opening[after].push(...interlude.blocks)
}
content.DEMOGRAPHICS.forEach((name, at) => opening[Math.min(at, places.length - 1)].push(name))
places.forEach((entry, at) => (entry.blocks = opening[at].concat(entry.blocks)))

// An item out of a demographics block or an interlude belongs to the place and
// not to the level walked there (`placed` in app.js): a synthetic run that
// draws its levels keeps these where they are written and moves the rest.
const placedIn = (name) => interluded.indexOf(name) !== -1 || content.DEMOGRAPHICS.indexOf(name) !== -1

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

// What a briefing puts on screen, as the HTML it is written in. One written as
// a function reads the run (the onward briefing offers the SONA credit to a run
// from SONA) and is evaluated for a run from nowhere, with nothing answered,
// which is what a synthetic run is; it throws if that is not enough for it,
// the way everything else here stops rather than guesses.
function briefingText(text) {
    if (typeof text !== "function") return text === undefined ? null : text
    return text(() => undefined, { participant: "", source: "Synthetic" })
}

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

timeline.forEach((entry, at) => {
    const level = at + 1
    levels.push({ level: level, key: entry.key, name: entry.name, blocks: entry.blocks, fork: entry.fork || null, beneath: false })

    for (const name of entry.blocks) {
        const block = content.BLOCKS[name]
        if (!block) throw new Error("timeline.js asks for a block that is not defined: " + name)

        for (const entry of block) {
            // Nothing to answer on a briefing, but the app records one in
            // `items[]` like any other step, so a synthetic file wants the
            // same row (with nothing in it) to have the same columns — and
            // its words are what the person read between the items, which a
            // synthetic run shows the model in their place.
            // One that ends an interlude (`onward`) is answered, in a run, by
            // the choice of the level that comes next.
            if (entry.type === "briefing") {
                items.push({
                    key: entry.key,
                    level: level,
                    block: name,
                    between: interluded.indexOf(name) !== -1,
                    questionnaire: null,
                    type: "briefing",
                    onward: entry.onward === true,
                    text: briefingText(entry.text),
                    placed: placedIn(name),
                })
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
                            // Off the scale, which a declined answer ("I'd rather not
                            // say") is too, so whatever reads `custom` keeps it off.
                            custom: !!(option.custom || option.declined),
                            declined: !!option.declined,
                            exclusive: !!option.exclusive,
                            small: !!option.small,
                            showIf: option.showIf || null, // the 31st, offered only after a month that has one
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
                        // An interlude's: at the head of this level's place but
                        // part of no level, so no level's count or time holds it.
                        between: interluded.indexOf(name) !== -1,
                        placed: placedIn(name),
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
        // The key a vote on this dimension is filed under, written in
        // `content/` beside the norms, so nothing out here has to work it out
        // from the name a second time.
        norms[dimension] = {
            key: (q.norms[dimension] && q.norms[dimension].key) || null,
            interpretations: !!(q.norms[dimension] && q.norms[dimension].interpretations),
        }
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
