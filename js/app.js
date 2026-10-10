/* =========================================================================
   Survey engine. Presents the items of each questionnaire from content/,
   one at a time, in random order, and drives the screens they are shown on.

   Everything that reads a score back — the charts, the results sections, the
   card — lives in results.js, which is handed the engine at the bottom of
   this file. What crosses that line is the `engine` object and nothing else.
   ========================================================================= */

;(function () {
    "use strict"

    // Questionnaires that get a spider chart of their own. The FIPI is not
    // among them: only two of its five dimensions carry norms, and a spider
    // wants three axes, so it reads back as two rows; nor are the `regulation`
    // block's three, which are read back together as the two heads.
    const CHARTS = ["hexaco18", "hitopbr"]
    const ADVANCE_DELAY = 330 // ms between answering and the next item
    const TURN = 180 // ms of that spent fading the answered item out

    // Saved into every response file, so a data export can always be matched
    // back to the code that produced it. Logged in CHANGELOG.md.
    const APP_VERSION = "0.0.1"

    const $ = (id) => document.getElementById(id)
    const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

    /* --------------------------- who is taking it ------------------------- */

    // What the link is allowed to say about this run: who is taking it, where
    // it was handed out, and whether it is a real one at all. A shared card is read out of the URL by
    // results.js; nothing else here comes from it.
    const query = new URLSearchParams(location.search)
    // The link as the page was loaded with it, which is what a run carried on
    // has to be loaded with again (js/resume.js): leaving a shared card puts
    // the address back to bare, but the run was built from what it said.
    const loadedSearch = location.search
    // `?test` or `?test=true`. The saved file still calls it `testMode`, which
    // is a field of the data and not a word of the link.
    const testMode = ["", "true", "1"].indexOf(query.get("test")) !== -1

    // Other names a link may use for four of its words, tried in order after
    // the word itself: `?s=` for `?source=`, `?st=` for `?start=`, `?p=` for
    // `?project=` and `?pid=` for `?participant=`, so that a link typed by
    // hand or printed on a poster stays short; and the words those two were
    // until October 2026, `?battery=` (and its `?b=`) and `?sub=`. **TODO:
    // drop `battery`, `b` and `sub` at v1.0**, once the ethics application is
    // approved and the real deployment starts — they are kept only so that
    // the pilots' links go on working. The long name wins where a link gives
    // both. A shared card's `s` is its scores (`?card=1&s=…`, read by
    // results.js), so on a card `s` is never the source; the link a card is
    // shared under carries `source=` written out for that reason.
    const SHORTHANDS = { source: ["s"], start: ["st"], project: ["p", "battery", "b"], participant: ["pid", "sub"] }

    function inLink(name) {
        if (query.has(name)) return query.get(name)
        for (const other of SHORTHANDS[name] || []) {
            if (other === "s" && query.get("card") === "1") continue
            if (query.has(other)) return query.get(other)
        }
        return null
    }

    // A link with a shared card's scores taken out of it and everything else
    // left: off a card `s` is the source's shorthand, and goes with nothing.
    function dropCard(query) {
        if (query.get("card") === "1") query.delete("s")
        for (const name of ["card", "level", "m", "d"]) query.delete(name)
    }

    // Every run is filed under a code of its own, made here unless the link
    // brought one — a prewritten list, or a platform putting its own id on the
    // end of the link (`?participant=`, or `?pid=`).
    const CODE_LENGTH = 12
    const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789" // no I, L, O, 0 or 1: a code gets read off a screen and typed back

    function madeCode() {
        const drawn = crypto.getRandomValues(new Uint32Array(CODE_LENGTH))
        return Array.from(drawn, (n) => CODE_LETTERS[n % CODE_LETTERS.length]).join("")
    }

    // A code out of the URL is somebody else's text: only the characters a code
    // is made of survive it, and only so many of them. What is left of an empty
    // or impossible one is a code of our own. A run carried on is the same
    // participant it was, whatever made the code.
    const participant = RESUMED
        ? RESUMED.participant
        : (inLink("participant") || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) || madeCode()

    // Where the link was handed out (`?source=`): a project, an experimenter,
    // a page it was posted on. It is only ever written into the file, never put
    // on screen, so it may be words — letters of any alphabet, digits and the
    // punctuation a note wants — but it is somebody else's text all the same,
    // so nothing else survives and not much of it. **A real deployment always
    // names one**, so a link that says nothing is written "Unknown" rather than
    // left null: in a deposit, a run nobody sent is the one to look at twice.
    const UNKNOWN_SOURCE = "Unknown"
    const source =
        (inLink("source") || "")
            .replace(/[^\p{L}\p{N} _.,:;/@()+#&'-]/gu, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 200) || UNKNOWN_SOURCE

    // The platform the link came from, as the lab's hub names it (its
    // `claim`), which is what an id it brought is claimed under and what
    // decides whether keeping the account with an email is offered: a study's
    // link says `?source=SONA` or `?source=Prolific`, in any case and with
    // anything after it (`Prolific-pilot`), and any other source is its own
    // name in lower case. **Prolific's participants are never offered an
    // email** (the hub's AGENTS.md, **Who is offered what**).
    const PLATFORM = /^prolific/i.test(source) ? "prolific" : /^sona/i.test(source) ? "sona" : source.toLowerCase()

    // Which timeline this run walks — its battery. `?project=<name>` picks
    // one out of BATTERIES (content/timeline.js), which is what a study
    // links with, and a link naming none, or one that is not there, gets
    // `all` — everything. The study the ethics application is written for
    // is `?project=mint`, and its links have to say so. The link's word is
    // `project` and the code's and the saved file's is still `battery`.
    // `?only=a,b` asks exactly those of its blocks and `?skip=a,b` everything
    // but those, for testing. Battery first, `only` over it, `skip` off it,
    // and whatever `?start=` names back onto it — from any timeline.
    // The names are somebody else's text: only the characters a name is made
    // of survive, and a name that is no block is dropped with a word in the
    // console and nothing on screen — the participant never sees any of
    // this. The timeline's order always holds. `closing` is never left out,
    // since the run ends through it (the last level's results are opened
    // from the item after them), and the blocks of HELD_TOGETHER come and go
    // as one, since one figure is drawn from both.
    function namesIn(param) {
        return (inLink(param) || "").replace(/[^A-Za-z0-9_,-]/g, "").slice(0, 400).split(",").filter(Boolean)
    }

    const DEFAULT_BATTERY = "all"
    const wanted = namesIn("project")[0] || DEFAULT_BATTERY
    const battery = BATTERIES[wanted] ? wanted : DEFAULT_BATTERY
    if (wanted !== battery) console.warn("No battery called " + wanted + " in content/timeline.js; asking " + DEFAULT_BATTERY)

    // Everything below reads this run's timeline, and a link bringing a level
    // it does not hold finds that level on another (`elsewhere`).
    // The demographics are on the timeline without being on any level of it
    // (`DEMOGRAPHICS`, placed onto the plan below).
    const TIMELINE = BATTERIES[battery]
    const named = TIMELINE.flatMap((entry) => entry.blocks).concat(DEMOGRAPHICS)
    const everywhere = Object.values(BATTERIES).flat()
    const elsewhere = (name) => everywhere.find((entry) => entry.blocks.indexOf(name) !== -1)
    // The blocks of an interlude, on any timeline: written between two levels
    // rather than on one (`interlude: true`), so no link can start on one or
    // bring one in, and a place keeps one where it is when a fork moves the
    // level after it.
    const INTERLUDED = everywhere.filter((entry) => entry.interlude).flatMap((entry) => entry.blocks)

    // A link may name a level by its `key` where it would name a block, which
    // is how the hub's dashboard asks for one (`?start=Character&skip=General`,
    // see `summary()`): a key stands for the level's blocks, as this timeline
    // has them (a level's blocks may be drawn in another order on another),
    // and for `start` its first, which brings the whole level forward all the
    // same. Keys are capitalised and block names are not, so the two never
    // meet. An interlude has no key.
    function blocksIn(param, first) {
        return namesIn(param).flatMap((name) => {
            const level = TIMELINE.find((entry) => entry.key === name) || everywhere.find((entry) => entry.key === name)
            if (!level) return [name]
            return first ? level.blocks.slice(0, 1) : level.blocks
        })
    }

    const asked = new Set(named.filter((name) => ASIDE.indexOf(name) === -1))
    const only = blocksIn("only")
    if (only.length) {
        asked.clear()
        for (const name of only) asked.add(name)
    }
    for (const group of HELD_TOGETHER) if (group.some((name) => asked.has(name))) for (const name of group) asked.add(name)
    for (const name of blocksIn("skip")) {
        const group = HELD_TOGETHER.find((one) => one.indexOf(name) !== -1) || [name]
        for (const one of group) asked.delete(one)
    }
    // A block named in `?start=` is asked whatever the battery, `only` or
    // `skip` said, since a link asking to open on something is asking for it:
    // `?start=sex` under `mint` opens on a block that timeline does not hold,
    // taking its level off the one that does. `closing` is the one it cannot bring, and is
    // refused below.
    // A shared level's link (`?card=1&level=<key>`, `levelShare` in
    // results.js) brings its level in the same way, or a level the battery
    // leaves out could be shared and never shown: the visitor's run would have
    // no level under that key to draw it on, and the link would fall through to
    // the landing page. "Take the test yourself" then opens on it by `?start=`.
    const sharedLevel =
        query.get("card") === "1" && query.get("s") ? everywhere.find((entry) => entry.key === query.get("level")) : undefined
    const brought = blocksIn("start", true).concat(sharedLevel ? sharedLevel.blocks : [])
    for (const name of brought) {
        if (name === "closing" || !elsewhere(name) || INTERLUDED.indexOf(name) !== -1) continue
        const group = HELD_TOGETHER.find((one) => one.indexOf(name) !== -1) || [name]
        for (const one of group) asked.add(one)
    }
    asked.add("closing")
    for (const name of asked) {
        if (named.indexOf(name) !== -1 || brought.indexOf(name) !== -1) continue
        console.warn(elsewhere(name) ? name + " is not on the " + battery + " timeline; ignored" : "No block called " + name + " on any timeline; ignored")
    }

    // The timeline as this run walks it: each level's blocks that are asked,
    // and no level left with none. Everything below reads this and never
    // TIMELINE, so a level's number is its place in *this* run — which is why
    // the saved file carries `levels`, each with its blocks, beside them.
    // Each carries `written`, its place on the timeline, which is what the
    // fork's recommendation reads once levels have been moved about.
    //
    // `?start=a,b` then brings the levels holding those blocks to the front,
    // in the order named, with the named blocks first inside them — for a
    // study that wants one instrument met fresh, or for testing one without
    // walking to it. It moves whole levels, never a block out of its level
    // (a level is what carries the key its ratings and quality control are
    // filed under). A block it names is asked even where the battery left it
    // out (it was added to `asked` above), and a level this timeline does not
    // hold is taken off the one that does — it has no place here to be asked
    // in otherwise, and is written nowhere on this one (`written: -1`). A
    // shared level's link brings its level to the front the same way when it
    // is not on this timeline, so that the visitor's run has it to draw it on.
    // `closing`, which the run ends
    // through, is dropped with a word in the console, and so is a demographics
    // block, which is no level's. A level brought forward is taken
    // out of the fork, since it has been given its place by the link rather
    // than left for the person to choose; the rest of the fork still forks.
    // The saved file's `levels` says the order that was walked, as always.
    //
    // Then the demographics are put at the head of the places they open
    // (`opening`, on each level of the plan): the first after any level a
    // link started on, which is a hook and opens on its own questions, then
    // the second, then the third, and never the closing level unless there is
    // nowhere else. **`opening` belongs to the place and not to what is asked
    // there**, so `swapLevels` leaves it where it is: the second level of the
    // run opens on `demographics2` whichever level the fork puts there.
    //
    // An interlude (`interlude: true` on the timeline) is no level, and is
    // taken off the plan the same way: it opens the first place written after
    // it — not one a link brought forward, and never the closing — ahead of
    // any demographics there, and with only the closing after it is not asked
    // at all, its way on being into levels there are none of.
    const PLAN = (() => {
        const written = TIMELINE.map((entry, at) =>
            Object.assign({}, entry, { blocks: entry.blocks.filter((name) => asked.has(name)), written: at }),
        ).filter((entry) => entry.blocks.length)
        const plan = written.filter((entry) => !entry.interlude)
        const interludes = written.filter((entry) => entry.interlude)

        const starts = blocksIn("start", true).filter((name) => {
            if (name === "closing") console.warn("closing is where the run ends, so it cannot start it; ignored")
            else if (DEMOGRAPHICS.indexOf(name) !== -1) console.warn(name + " opens a place, not a level, so it cannot start the run; ignored")
            else if (INTERLUDED.indexOf(name) !== -1) console.warn(name + " is asked between levels, not as one, so it cannot start the run; ignored")
            else if (!elsewhere(name)) console.warn("No block called " + name + " on any timeline; ignored")
            else return true
            return false
        })
        if (sharedLevel && TIMELINE.indexOf(sharedLevel) === -1) starts.push(sharedLevel.blocks[0])
        const first = []
        for (const name of starts) {
            let entry = plan.find((one) => one.blocks.indexOf(name) !== -1)
            if (!entry) {
                const level = elsewhere(name)
                entry = first.find((one) => one.key === level.key) ||
                    Object.assign({}, level, { blocks: level.blocks.filter((one) => asked.has(one)), written: -1 })
            }
            if (first.indexOf(entry) === -1) first.push(entry)
        }
        const led = first.map((entry) => {
            const leading = starts.filter((name) => entry.blocks.indexOf(name) !== -1)
            const blocks = leading.concat(entry.blocks.filter((name) => leading.indexOf(name) === -1))
            return Object.assign({}, entry, { blocks: blocks, fork: false })
        })
        const rest = plan.filter((entry) => first.indexOf(entry) === -1)
        const walked = led.concat(rest)

        for (const entry of walked) entry.opening = []
        const places = rest.filter((entry) => entry.blocks.indexOf("closing") === -1)
        for (const interlude of interludes) {
            const after = places.find((entry) => entry.written > interlude.written)
            if (after) after.opening.push(...interlude.blocks)
        }
        if (!places.length) places.push(walked[walked.length - 1])
        DEMOGRAPHICS.forEach((name, at) => {
            if (asked.has(name)) places[Math.min(at, places.length - 1)].opening.push(name)
        })
        return walked
    })()

    // **The core**: what a project asks of everybody, ahead of an interlude
    // saying the main part is over (`mint`'s interim). It is every level
    // written on this timeline before the first interlude this run asks, so a
    // level a link brought forward is in it only if it was written there, and
    // a run with no interlude (`all`) has no core at all. A fork never crosses
    // an interlude, so a swap never takes a level in or out of it.
    const CORE_BEFORE = (() => {
        const opened = PLAN.flatMap((entry) => entry.opening)
        return TIMELINE.findIndex((entry) => entry.interlude && entry.blocks.some((name) => opened.indexOf(name) !== -1))
    })()
    const inCore = (level) => PLAN[level - 1].written >= 0 && PLAN[level - 1].written < CORE_BEFORE

    // Whether an item belongs to its place rather than to the level asked
    // there — the demographics at its head, or an interlude — which a fork
    // leaves where it is while the level after it moves.
    const placed = (question) => DEMOGRAPHICS.indexOf(question.block) !== -1 || INTERLUDED.indexOf(question.block) !== -1
    // Whether an item is an interlude's: asked between two levels and part of
    // neither, so nothing that counts a level's answers counts it.
    const between = (question) => INTERLUDED.indexOf(question.block) !== -1

    /* -------------------------------- forks ------------------------------- */

    // Levels written `fork: n` are taken in the order the person chooses, `n`
    // offered at a time. The places a fork's levels take are its **slots** —
    // the level numbers carrying it — and `at` is the index of the slot the
    // coming choice fills. On finishing the level before that slot, while more
    // than one level is left to fill it with, `width` of the levels still to
    // place (or all of them, when fewer are left) are drawn afresh and offered,
    // and the one picked takes the slot. Those passed over go back among the
    // rest, and may or may not be drawn again for the next choice.
    //
    // **A fork is a run of levels written one after another with the same
    // `n`**, so two runs side by side with different numbers are two forks,
    // each put in order among itself and never across the other: the core and
    // the rest are written `fork: 2` and `fork: 3`. The runs are read off the
    // timeline as written (`written`, on each level of the plan), and not off
    // the plan, so that a battery dropping the level between two runs of one
    // width never merges them.
    //
    // **The slots need not be next to each other.** They happen to be
    // contiguous, but nothing here requires it, which is why a choice is a
    // *swap* of two places rather than a shuffling of one run (`swapLevels`),
    // and why `beneath` stays with the place rather than travelling with what
    // is asked there. A swap is enough however many are offered: the level
    // taken and the one standing in the slot change places, so every level not
    // yet taken is still in a slot after it, which is what the next choice is
    // drawn from.
    //
    // A run of levels drawn instead of chosen needs nothing here at all —
    // `shuffle()` in content/ has already put them in an order by the time this
    // runs. Under a fork that order decides which of those offered is
    // recommended (the one standing first) and nothing else.
    //
    // A battery that leaves one level of a fork leaves nothing to choose, and
    // that level is asked where it falls. A choice is not recorded here but on
    // the level screen it was made on (`levelItems`, below): it is one of the
    // two things that screen's way on can be, and is saved as that screen's
    // answer.
    const FORKS = (() => {
        const runs = []
        TIMELINE.forEach((entry, at) => {
            if (!entry.fork) return
            if (!Number.isInteger(entry.fork) || entry.fork < 2) {
                throw new Error("fork is how many levels are offered at once, a whole number of 2 or more, and " + entry.key + " is written fork: " + entry.fork)
            }
            const last = runs[runs.length - 1]
            if (last && last.width === entry.fork && last.written[last.written.length - 1] === at - 1) last.written.push(at)
            else runs.push({ width: entry.fork, written: [at] })
        })
        for (const run of runs) {
            if (run.written.length < 2) throw new Error("a fork is two levels or more, and " + TIMELINE[run.written[0]].key + " is a fork of one")
        }
        return runs
            .map((run) => {
                const slots = PLAN.map((entry, at) => (entry.fork && run.written.indexOf(entry.written) !== -1 ? at + 1 : 0)).filter(Boolean)
                if (slots.length < 2) return null // a battery left one level of it; it is asked where it falls
                // A choice is offered from the screen of the level before the
                // slot it fills, and level 1 has none: a fork standing there
                // takes its first place as written and the choosing starts at
                // the second. Only a battery gets there, since the run's own
                // first level is fixed.
                // at: the index of the slot the coming choice fills; offer: the slots it offers, once drawn
                return { width: run.width, slots: slots, at: slots[0] === 1 ? 1 : 0, offer: null }
            })
            .filter(Boolean)
    })()

    // Whether a fork has a choice to offer on finishing this level: the level
    // is the one before the slot a fork fills next, and more than one level is
    // left to fill it with. A level finished a second time, after going back
    // into it, has the ordinary way on.
    function forkAfter(level) {
        return FORKS.find((fork) => fork.at < fork.slots.length - 1 && fork.slots[fork.at] === level + 1) || null
    }

    // The places a fork's coming choice is between, as level numbers: as many
    // as the fork offers at once, drawn out of every slot still to fill (the
    // one being filled and all after it), or all of them when fewer are left.
    // Drawn once a choice and kept, so that the cards coming back up (the
    // briefing returned to, a reload on the level screen) offer the same
    // levels rather than a second draw that a reload could be used to get.
    function offeredBy(fork) {
        if (!fork.offer) {
            fork.offer = shuffle(fork.slots.slice(fork.at))
                .slice(0, fork.width)
                .sort((one, other) => one - other)
            keep()
        }
        return fork.offer
    }

    // The page is put back to the top underneath something that is covering
    // it. Moving smoothly there would be seen sliding about under the fade,
    // so these jumps are always instant whatever the stylesheet asks for.
    function jump(top) {
        window.scrollTo({ top: top, behavior: "instant" })
    }

    // Off the run's seeded draws (`chance`, js/resume.js), so that a run carried
    // on after its tab was closed deals its items in the order it first did.
    function shuffle(array) {
        const a = array.slice()
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(chance() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
        }
        return a
    }

    /* ---------------------------- build the run -------------------------- */

    // An item's own entry wins over the questionnaire-wide default.
    function setting(item, questionnaire, entry) {
        return item[entry] !== undefined ? item[entry] : questionnaire[entry]
    }

    // What kind of question it is, and so how it is put on screen. Neither
    // choosing nor typing has to be written in the content: a question's type
    // follows from the format it is asked with, so writing it as well would
    // only be a second place for the two to disagree. A briefing is not a
    // question at all and belongs to its block, which is what the throw is
    // about — written among the items it introduces, it would render as a
    // scale with nothing on it.
    function typeOf(item, questionnaire) {
        const written = setting(item, questionnaire, "type")
        if (written === "briefing") {
            throw new Error("a briefing belongs to its block, not to a questionnaire's items: " + item.key)
        }
        if (written) return written
        return (setting(item, questionnaire, "format") || {}).input ? "input" : "choice"
    }

    // The questionnaires of the run, level by level and block by block, in the
    // order the timeline asks for them. This is also the order the results of a
    // level read in. A block the timeline does not name is never reached, which
    // is the whole of how one is kept out of the run.
    const RUN = []
    const levels = PLAN.map((entry, at) => at + 1)

    // Every item of every questionnaire, in the order written, each carrying
    // everything needed to show it — and the level and block it came from,
    // which are the timeline's answer rather than the content's.
    const authored = []

    PLAN.forEach((entry, at) => {
        const level = at + 1

        for (const name of entry.opening.concat(entry.blocks)) {
            const block = BLOCKS[name]
            if (!block) throw new Error("timeline.js asks for a block that is not defined: " + name)

            for (const entry of block) {
                // A briefing is a pause rather than a question: words, and a
                // way on. It belongs to the block rather than to any one
                // questionnaire in it, since it introduces the whole stretch
                // that follows — which may be several — and nothing that
                // shuffles items can reach it there. Its `options` are empty,
                // so everything that reads a scale off an item finds nothing.
                if (entry.type === "briefing") {
                    // Left by choosing what comes next (`renderBriefing`), which
                    // only means anything at the head of a place a fork fills.
                    if (entry.onward && INTERLUDED.indexOf(name) === -1) {
                        throw new Error("only an interlude's briefing is left by choosing what comes next: " + entry.key)
                    }
                    authored.push({
                        key: entry.key,
                        text: entry.text,
                        type: "briefing",
                        onward: entry.onward === true,
                        celebrate: entry.celebrate === true,
                        options: [],
                        shuffle: false,
                        block: name,
                        level: level,
                    })
                    continue
                }

                const questionnaire = entry
                RUN.push(questionnaire.key)

                for (const item of questionnaire.items) {
                    const type = typeOf(item, questionnaire)
                    const place = { questionnaire: questionnaire.key, block: name, level: level }
                    const format = setting(item, questionnaire, "format") || {}
                    // A scale may write its own numbers over the values behind
                    // them (`labels`), which is how the same points can be
                    // shown two ways.
                    const options = (format.options || []).map((one, position) =>
                        Object.assign(
                            { text: null, label: format.labels ? format.labels[position] : null },
                            typeof one === "object" ? one : { value: one },
                        ),
                    )

                    // An option marked `custom: true` — "Something else",
                    // "Other" — is an answer outside the scale: a category of
                    // its own, not a point on it. Its value is then only a
                    // label for `showIf` to match, so it takes no part in the
                    // scale's bounds, and `counted()` below never averages it
                    // into a dimension. One marked `declined: true` — "I'd
                    // rather not say" — is outside the scale too, but is no
                    // answer at all rather than a different one: `counted()`
                    // leaves it out of the dimension instead of holding the
                    // dimension unfinished (see `score()`).
                    const scale = options.filter((one) => !one.custom && !one.declined)
                    const values = scale.map((o) => o.value)

                    // An option may say what choosing it is worth (`score:`)
                    // where its value cannot: two options saying different
                    // things can be worth the same, and a value has to tell
                    // them apart. Then the scores are the scale's bounds and
                    // what `counted()` reads, and every option on the scale
                    // wants one, or an answer would count as nothing at all.
                    //
                    // An item may feed more than one dimension: `dimension` a
                    // list, and each option's `score` an object naming what it
                    // is worth to each. That is how a grid, two scales at one
                    // press, is scored on both of them (the deeds', in
                    // content/block_dark.js). The first dimension named is the
                    // item's own; the others are carried as `also` and read
                    // through views of the item in the scoring below.
                    const feeds = [].concat(item.dimension || [])
                    const scored = scale.some((one) => one.score !== undefined)
                    const worthTo = (dimension) =>
                        scale.map((one) => (one.score !== null && typeof one.score === "object" ? one.score[dimension] : one.score))
                    if (feeds.length > 1 && !scored)
                        throw new Error(item.key + ": an item feeding several dimensions wants a `score:` on every option, naming what it is worth to each")
                    if (scored && (feeds.length ? feeds : [undefined]).some((dimension) => worthTo(dimension).some((worth) => typeof worth !== "number")))
                        throw new Error(item.key + ": a scale scored by `score:` wants one on every option but its ways out, for every dimension it feeds")

                    // What an answer is worth to a dimension, and so the
                    // bounds of the scale on it. A typed answer has no options,
                    // so its bounds are the scale; an item with a right answer
                    // counts 1 or 0 whatever its options are numbered, so those
                    // are its bounds; and a scale scored by `score:` is bounded
                    // by its scores.
                    const scoring = (dimension) => {
                        const worth = scored ? worthTo(dimension) : null
                        return {
                            lowest:
                                item.correct !== undefined ? 0 : worth ? Math.min.apply(null, worth) : scale.length ? Math.min.apply(null, values) : format.min,
                            highest:
                                item.correct !== undefined ? 1 : worth ? Math.max.apply(null, worth) : scale.length ? Math.max.apply(null, values) : format.max,
                            scores: worth ? Object.fromEntries(scale.map((one, at) => [one.value, worth[at]])) : null,
                        }
                    }
                    const own = scoring(feeds[0])

                    // A slider's way out is found by its value, in `said()` and
                    // in `counted()`, so a value the line itself can give would
                    // save a point on the line as the way out.
                    if (type === "slider")
                        for (const one of options)
                            if (!one.custom || (one.value >= format.min && one.value <= format.max))
                                throw new Error(item.key + ": a slider's options are its ways out, custom and valued off the line")

                    authored.push(
                        Object.assign(
                            {
                                key: item.key,
                                text: item.text,
                                type: type,
                                dimension: feeds[0],
                                also: feeds.slice(1).map((dimension) => Object.assign({ dimension: dimension }, scoring(dimension))),
                                instructions: setting(item, questionnaire, "instructions"),
                                options: options,
                                input: format.input,
                                placeholder: format.placeholder,
                                multiline: format.multiline,
                                optional: format.optional,
                                lowest: own.lowest,
                                highest: own.highest,
                                scores: own.scores,
                                custom: options.filter((one) => one.custom).map((one) => one.value),
                                declined: options.filter((one) => one.declined).map((one) => one.value),
                                // The share of a dimension's items that must be answered
                                // rather than declined for it to be scored; all of them
                                // unless the questionnaire says otherwise.
                                enough: setting(item, questionnaire, "enough"),
                                anchors: format.anchors,
                                unit: format.unit,
                                step: format.step,
                                reading: format.reading,
                                columns: format.columns,
                                grid: format.grid,
                                vertical: format.vertical,
                                tooLow: format.tooLow,
                                tooHigh: format.tooHigh,
                                color: format.color,
                                hovercolors: format.hovercolors,
                                showIf: item.showIf,
                                check: item.check,
                                correct: item.correct,
                                reverse: item.reverse,
                                shuffle: setting(item, questionnaire, "shuffle"),
                            },
                            place,
                        ),
                    )
                }
            }
        }
    })

    // A briefing has no scale to score, but it is still a recorded step through
    // the run, so it uses the same log and item record as every question.
    function isBriefing(question) {
        return question.type === "briefing"
    }

    // Levels are asked in order. Within one, the items of every block are
    // shuffled together, except those marked `shuffle: false`, which hold the
    // position the timeline's order gives them.
    //
    // **A questionnaire is the unit of shuffling, and the only one.** Its items
    // may come in any order but they come together, and everything around them
    // — the other questionnaires, the briefings, the blocks, the levels — holds
    // the order the timeline gives it. An item marked `shuffle: false` keeps
    // its own place while the rest move around it.
    //
    // Everything about the run's order follows from that one rule: two
    // instruments meant to be asked in among each other go in *one*
    // questionnaire, since that is what makes them one shuffled run; two meant
    // to stay apart go in two; and a briefing, being an entry of its own,
    // cannot be crossed by anything.
    const questions = []
    let group = []
    let holding = null

    // The run so far, in place. `authored` is built in order, so a questionnaire
    // is always a single stretch of it and a change of name is its end.
    //
    // A follow-up — an item waiting (`showIf`) on another item of the same
    // questionnaire — is not shuffled on its own but goes where its item goes,
    // straight after it, with its own follow-ups after it in turn: shuffled
    // loose it could be drawn before the answer it waits on, and `shown()`
    // would pass it over for ever. Follow-ups keep the order they are written
    // in, which for every branch written so far is the order they already had.
    function settle() {
        const here = new Set(group.map((question) => question.key))
        const follows = (question) => !!question.showIf && here.has(question.showIf.key)
        const heads = group.filter((question) => !follows(question))
        const moving = shuffle(heads.filter((question) => question.shuffle !== false))
        let next = 0

        const place = (question) => {
            questions.push(question)
            for (const after of group) if (follows(after) && after.showIf.key === question.key) place(after)
        }
        for (const question of heads) place(question.shuffle === false ? question : moving[next++])
        group = []
    }

    for (const question of authored) {
        if (question.questionnaire !== holding) {
            settle()
            holding = question.questionnaire
        }
        group.push(question)
    }
    settle()

    // The run as it was dealt, before any fork has moved a level: what a kept
    // run is checked against before it is carried on. The same seed deals the
    // same run only out of the same content, so a test changed in between —
    // an item added, a block moved, a new deploy — deals another, and answers
    // kept against the old one would land on the wrong items. Such a run is
    // let go of and the page loaded again, afresh.
    //
    // It is kept as its length and a hash of it (FNV-1a, the one `answerKey`
    // in content/timeline.js already does) rather than written out: every
    // item key of the run is several kilobytes, and the kept run goes to the
    // participant's account at the end of every level, in a request a closing
    // tab caps at 64 KiB. A run kept before then, with it written out, is
    // checked against the whole.
    const dealtWhole = formatMint + " " + questions.map((question) => question.key).join(" ")
    const dealt = dealtWhole.length + "-" + answerKey("dealt", dealtWhole)
    if (RESUMED && RESUMED.dealt !== dealt && RESUMED.dealt !== dealtWhole) {
        console.warn("The run kept in this browser was taken on another version of the test; starting afresh")
        forgetRun()
        location.reload()
        throw new Error("a kept run no longer matches the test")
    }

    const responses = {} // key -> value, what the scoring reads
    const log = {} // key -> when it was shown, when it was answered, with what
    // Every reading that can be agreed with -> "agree" | "disagree" | null,
    // from the results rows. `makeResults` fills in the keys — it is the only
    // thing that knows which readings there are — and every one of them is
    // written into the saved file, null until somebody votes on it.
    const feedback = {}
    // `Level_<N>` -> how much that level's results were liked, 1 to 5, or null.
    // Written like `feedback`: a key per scored level, filled in below once the
    // run is known, so an unrated level and an unreached one read the same.
    const ratings = {}
    // Level -> the fork choice made on its screen: the levels offered as keys
    // in the order their cards stood on the page (left to right, or top to
    // bottom where they stack), the one marked "Recommended next" and the one
    // taken. Saved on that level's entry in `levels`, null where there was none.
    const choices = {}
    const levelTimes = {} // level -> when its last remaining item was answered
    const timeStart = RESUMED ? RESUMED.timeStart : new Date().toISOString()
    // When the run was carried on after being left, if it was: a gap in the
    // times, and a second session in the deposit, that the file owns up to.
    const timeResumed = RESUMED ? RESUMED.timeResumed.concat(new Date().toISOString()) : []
    // Every fork choice as the two places it swapped, in order, which is what
    // a run carried on replays to stand its levels where they stood.
    const swaps = []

    // What the run was answered on, since a reaction time on a phone is not one
    // on a computer and a figure read on a narrow screen is laid out differently.
    // Coarse on purpose: a kind of device, whether it is touched, the window and
    // screen in CSS pixels, and never the user agent itself, which is read here
    // to tell a phone from a tablet and goes no further — a full UA string beside
    // the rest is most of a fingerprint. `screenLayout` is the stylesheet's own
    // breakpoint (760px, where the gauge goes to the foot and the shelf to the
    // top), and `screenLayouts` is every one the run was seen in, in order, since a
    // phone turned on its side or a window dragged narrower crosses it mid-run.
    const NARROW = window.matchMedia("(max-width: 760px)")
    const layoutNow = () => (NARROW.matches ? "narrow" : "wide")
    const display = {
        device: deviceKind(),
        touchscreen: window.matchMedia("(pointer: coarse)").matches,
        // A run carried on keeps the layout it began in.
        screenLayout: RESUMED ? RESUMED.screenLayout : layoutNow(),
        screenLayouts: RESUMED ? RESUMED.screenLayouts.slice() : [layoutNow()],
        viewport: [window.innerWidth, window.innerHeight],
        screen: [window.screen.width, window.screen.height],
    }
    // Noted on the breakpoint's own event and again whenever the file is
    // written, which is every answer, so a crossing the event missed is still
    // caught by the next one.
    function noteLayout() {
        const seen = display.screenLayouts
        if (seen[seen.length - 1] !== layoutNow()) seen.push(layoutNow())
    }
    NARROW.addEventListener("change", noteLayout)

    // Written into the file beside `source`, a field apiece, with the list of
    // layouts copied so a staged frame is not changed under it afterwards.
    function displayNow() {
        noteLayout()
        return { ...display, screenLayouts: display.screenLayouts.slice() }
    }

    // A phone, a tablet or a computer. Chromium says whether it is mobile
    // outright; everything else is read off the user agent, where an iPad
    // asking for the desktop site calls itself a Mac and is told apart by its
    // touch points, and an Android tablet is an Android without "Mobile".
    function deviceKind() {
        const agent = navigator.userAgent || ""
        const iPad = /iPad/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)
        if (iPad || /Tablet|Android(?!.*Mobile)/i.test(agent)) return "tablet"
        if ((navigator.userAgentData && navigator.userAgentData.mobile) || /Mobi|iPhone|iPod|Android/i.test(agent)) return "phone"
        return "computer"
    }

    let index = 0
    let screen = "intro" // the screen underneath, which a panel never replaces
    let panel = null // the panel over it, if any
    let locked = false // ignore input while advancing
    let turns = 0 // answers taken, so that a turn scheduled by one of them can tell it is still the current one

    /* ------------------------------ test mode ----------------------------- */

    // `?test=true` walks the run in miniature: one item of each questionnaire
    // is put on screen and the rest are answered for it at random, so that every
    // chart, level and reading can be reached quickly. What comes out of such a
    // run is not data, and the saved file says so at the top of itself.
    const TEST_KEPT = 1 // item each questionnaire still asks

    // An answer given by nobody: a point off the item's own scale, a number
    // inside the bounds of the field, or a word in place of the written one.
    // A custom or declined option is passed over where a real one exists, so a
    // thinned scored item never holds its dimension shut with an answer off the
    // scale.
    function anyAnswer(question) {
        if (question.input === "text") return "test"
        const pool = offered(question).filter((one) => !one.custom && !one.declined)
        // A slider's options are only its ways out, and the line is the answer.
        const options = pool.length || question.type === "slider" ? pool : offered(question)
        // Several answers may be true at once, and one of them stands in for
        // the rest.
        if (question.type === "multi") return [options[Math.floor(chance() * options.length)].value]
        // Anything with a range and no options to pick from — a typed number,
        // a place on a curve — is answered somewhere inside that range.
        if (!options.length) {
            return question.lowest + Math.floor(chance() * (question.highest - question.lowest + 1))
        }
        return options[Math.floor(chance() * options.length)].value
    }

    // An item marked `auto` is answered here, once, and never shown: `shown()`
    // passes over it, so the run is walked, counted and finished as though it
    // were not in it, while the scoring behind the results has its answer. All
    // items of a questionnaire except the one kept for display are thinned —
    // except those waiting on another answer (`showIf`), which are left out of
    // it so a branch still opens on the answer that opens it, given by a
    // person or by the thinning alike. A briefing is never stood in for: it
    // belongs to the block rather than to any questionnaire and has no answer
    // to give.
    function thinRun() {
        for (const name of RUN) {
            const mine = questions.filter((question) => question.questionnaire === name && !question.showIf)
            for (const question of shuffle(mine).slice(TEST_KEPT)) {
                question.auto = true
                responses[question.key] = anyAnswer(question)
                // Nothing was put on screen, so there is no onset and no
                // reaction time to it — only the answer it stands in for.
                log[question.key] = { response: responses[question.key] }
            }
        }

        // The run may now open on an item that is being answered for us.
        index = nextShown(0)
    }

    if (testMode) thinRun()

    /* ------------------------------ branching ----------------------------- */

    // An item with `showIf` waits for the answer that opens it. Everything that
    // walks the run — advancing, going back, counting a level — goes past the
    // items that are not being asked.
    function shown(question) {
        if (question.auto) return false // a test run answered it; it is never put on screen
        if (!question.showIf) return true
        // An answer may be several things at once — a `multi` item hands back
        // a list — so both sides are read as lists and the branch opens on any
        // one of the wanted answers being among the ones given. A single
        // answer is a list of one, so nothing else changes shape.
        const given = responses[question.showIf.key]
        const chosen = Array.isArray(given) ? given : [given]
        const wanted = question.showIf.is
        return Array.isArray(wanted) ? wanted.some((one) => chosen.indexOf(one) !== -1) : chosen.indexOf(wanted) !== -1
    }

    // An option may wait on an answer the way an item does — the 31st of the
    // month waits on a month that has one — and what is put on screen, what the
    // keyboard counts and what test mode answers with is the options whose
    // branch is open. An answer already given is not taken back when its
    // option closes: it is still one of the item's options, and `said()` still
    // reads it back.
    function offered(question) {
        return question.options.filter((option) => !option.showIf || shown(option))
    }

    function nextShown(from) {
        for (let at = from; at < questions.length; at++) if (shown(questions[at])) return at
        return -1
    }

    function previousShown(from) {
        for (let at = from; at >= 0; at--) if (shown(questions[at])) return at
        return -1
    }

    // The items of a level that are actually being asked, in order. A
    // briefing is not among them: it is a pause with nothing to
    // answer, so it is owed none and must never be what holds a level shut.
    // Nor is an interlude's item: it stands at the head of the place but
    // belongs to no level, so it fills no ring, is counted down by nothing and
    // is no part of how the level was answered.
    function askedIn(level) {
        return questions.filter((question) => question.level === level && !isBriefing(question) && !between(question) && shown(question))
    }

    // An answer can close a branch that was open. What it held was given under
    // a premise that no longer holds, so it goes. What went is handed back, so
    // that the staged copy of the run can be told an answer has been taken away
    // as well as when one is given.
    function pruneBranches() {
        const pruned = []
        for (const question of questions) {
            // An item a test run answered is never shown, and its answer is not
            // a branch closing behind anybody.
            if (question.auto || shown(question) || responses[question.key] === undefined) continue
            delete responses[question.key]
            delete log[question.key]
            pruned.push(question.key)
        }
        return pruned
    }

    // An item may word itself from an answer already given: `text`, on the item
    // or on one of its options, may be a function of the answers rather than a
    // string. It is read through here wherever the words are put on screen or
    // into the file, so one item can be asked several ways — the part of the
    // month, worded from the month — without being several items with several
    // keys. The accessor it is handed is read-only: wording a question is not
    // answering one.
    //
    // It is handed the run as well: who is taking it and where the link was
    // handed out, both already made safe above — the participant code to
    // `[A-Za-z0-9_-]`, the source to words — which is how the interim's last
    // screen offers a SONA participant the link that grants their credit,
    // their code on the end of it, and nobody else anything.
    const runFacts = Object.freeze({ participant: participant, source: source })

    function worded(text) {
        return typeof text === "function" ? text((key) => responses[key], runFacts) : text
    }

    // An answer as it was read on screen: "Male", not 1, and "-3" where that is
    // what the circle had on it. A saved file should be legible without the
    // codebook beside it. An option with nothing written on it — a plain
    // numbered circle — and a typed answer are saved as what was given.
    function said(question, value) {
        if (value === undefined) return null
        // Several answers at once are read back one at a time, so the file
        // holds the words that were on screen rather than a list of codes.
        if (Array.isArray(value)) return value.map((one) => said(question, one))
        const option = question.options.find((one) => one.value === value)
        if (!option) return value
        const label = worded(option.text)
        return label !== null ? label : option.label || value
    }

    /* --------------------------- quality control -------------------------- */

    // How a level was answered rather than what it says: how long its items took,
    // and whether the ones that say what to answer got it. It is saved beside
    // the answers so that a run can be judged before anything is made of it. No
    // score, norm or interpretation goes near it, and none of it is shown.

    // How long an item took, in milliseconds. An item shown again after it was
    // answered — going back to it, or closing a panel that covered it — is
    // re-stamped and has no reaction time left in it, which is the null.
    function took(question) {
        const entry = log[question.key] || {}
        if (!entry.timeOnset || !entry.timeResponse) return null
        const spent = new Date(entry.timeResponse) - new Date(entry.timeOnset)
        return spent > 0 ? spent : null
    }

    function mean(values) {
        return values.reduce((sum, value) => sum + value, 0) / values.length
    }

    // Spread about that mean, over the sample rather than the population: these
    // are the items that happened to be asked, not every item there could be.
    // One item on its own has no spread, which is what the null is.
    function deviation(values) {
        if (values.length < 2) return null
        const middle = mean(values)
        const squares = values.map((value) => (value - middle) * (value - middle))
        return Math.sqrt(squares.reduce((sum, square) => sum + square, 0) / (values.length - 1))
    }

    // An attention check is an item that says what its own answer must be
    // (`check` in a content file). One that was never answered has not been failed —
    // it is unanswered.
    function failedCheck(question) {
        const given = responses[question.key]
        return given !== undefined && given !== question.check
    }

    // Both times are in milliseconds, over the items of the level that were both
    // shown and answered. The checks failed are counted over the checks that
    // were answered, and are null where none was — a level not reached, left
    // before its check came up, or carrying none — since a 0 there would read
    // as a check passed that nobody was ever set.
    function qualityControl(level) {
        const asked = askedIn(level)
        const times = asked.map(took).filter((spent) => spent !== null)
        const spread = deviation(times)
        const checks = asked.filter((question) => question.check !== undefined && responses[question.key] !== undefined)

        return {
            responseTimeMean: times.length ? Math.round(mean(times)) : null,
            responseTimeSD: spread === null ? null : Math.round(spread),
            attentionChecksFailed: checks.length ? checks.filter(failedCheck).length : null,
        }
    }

    // Everything recorded so far: who was taking it, when the run began, when
    // each level was left complete, how each was answered, and the items in the
    // order they are presented.
    function container() {
        // A test run answers most of itself, so the file says which it is
        // before it says anything else. Then the order it was walked in,
        // which is partly the person's: the levels, in that order, each its
        // name and the blocks it asked — a level number anywhere below is a
        // place in this run and cannot be read without them — and the
        // questionnaires in the order asked (the items' own `order` is
        // theirs). Every level screen is an item like any other, down in
        // `items[]`, and where the run forked its answer is the choice that
        // put the next level where it stands. The level's own `choice` is how
        // that choice was put to the person — what it was taken from, and
        // with which card recommended — or null where the way on was one
        // button, so every level has the same shape.
        const file = {
            version: APP_VERSION,
            participant: participant,
            // Who is taking it across runs, where `participant` is this run:
            // the code of the account it is kept on (the hub's `code`, never
            // the account's own id), the same in every run of that account —
            // a level picked from the dashboard, a retake months later, a run
            // on another device — so that one person's runs can be put
            // together, and a test told from its retest. Null in a run kept on
            // no account, and until the account is signed into at Start.
            account: ACCOUNT.on ? ACCOUNT.code() : null,
            testMode: testMode,
            battery: battery,
            source: source,
            ...displayNow(),
            levels: PLAN.map((entry, at) => {
                const choice = choices[at + 1]
                return {
                    key: entry.key,
                    name: entry.name,
                    blocks: entry.opening.concat(entry.blocks),
                    choice: choice ? Object.assign({}, choice, { offered: choice.offered.slice() }) : null,
                }
            }),
            questionnaires: RUN.slice(),
            timeStart: timeStart,
            timeResumed: timeResumed.slice(),
        }

        for (const level of levels) file["timeLevel" + level] = levelTimes[level] || null

        // Which way the MINT's scale was drawn this time. The answers are
        // recorded as they were read, so the file has to say what was on the
        // circles they were read from.
        file.formatMint = formatMint

        // How each level was answered, beside when it was finished — **under
        // the level's key, for the reason the ratings are** (see `levelKey`):
        // a number is a place in one person's run and a key is the same thing
        // for everybody, so `qualityControl["Character"]` can be read down a
        // column where `qualityControl.level5` cannot.
        file.qualityControl = {}
        for (const level of levels) file.qualityControl[levelKey(level)] = qualityControl(level)

        // The run's items in order, each level screen standing after the last
        // item of the level it showed, which is where the person met it. A
        // level screen already carries the shape a saved item has, so the
        // only thing it wants here is its place in the count.
        const walked = []
        let standing = null
        const leave = () => {
            const screen = standing === null ? null : levelItem(standing)
            if (screen) walked.push(screen)
        }
        for (const question of questions) {
            if (question.level !== standing) {
                leave()
                standing = question.level
            }
            walked.push(question)
        }
        leave()

        const screens = new Set(levelItems)

        // Each item says which questionnaire asked it. Without that, working out
        // whether somebody has a complete PI-18 means knowing which keys belong
        // to it — and the keys do not say: the `singles` questionnaire alone
        // holds ten different prefixes and `Demographics_` spans three
        // questionnaires, so a prefix is a guess rather than a mapping. It is
        // what the run already stamped on the item during the flatten walk, so
        // nothing is worked out twice and nothing can disagree. A level screen
        // belongs to no questionnaire and says so.
        file.items = walked.map((entry, position) => {
            if (screens.has(entry)) {
                return {
                    key: entry.key,
                    questionnaire: null,
                    order: position + 1,
                    response: entry.response,
                    timeOnset: entry.timeOnset,
                    timeResponse: entry.timeResponse,
                }
            }
            const logged = log[entry.key] || {}
            return {
                key: entry.key,
                // A briefing belongs to its block rather than to any
                // questionnaire, so it has none to name — written as null
                // rather than left out, since a key absent from some items and
                // present in others is a shape an analysis has to guard.
                questionnaire: entry.questionnaire || null,
                order: position + 1,
                response: said(entry, logged.response),
                timeOnset: logged.timeOnset || null,
                timeResponse: logged.timeResponse || null,
            }
        })
        file.feedback = feedback
        file.ratings = ratings

        return file
    }

    /* ------------------------------- scoring ----------------------------- */

    // Which questions feed each dimension, and the order they are written in
    // (the run is shuffled, but results should read in the order authored).
    const dimensions = {}
    const dimensionOrder = []

    // An item feeding a second dimension (`also`) is counted into it through
    // a view of itself: the same item, read with that dimension's worths and
    // bounds. The view inherits everything else rather than copying it, so the
    // level a fork re-stamps on the item (`swapLevels`) is the level it reads.
    for (const question of authored) {
        if (!question.dimension) continue // attention checks and the like
        const fed = [question].concat(question.also.map((feed) => Object.assign(Object.create(question), feed)))
        for (const one of fed) {
            if (!dimensions[one.dimension]) {
                dimensions[one.dimension] = []
                dimensionOrder.push(one.dimension)
            }
            dimensions[one.dimension].push(one)
        }
    }

    // What an answer is worth to the dimension it feeds. An item written the
    // wrong way round for it counts backwards: the top of its scale scores as
    // the bottom. What was answered is untouched — only the scoring turns over.
    function counted(question) {
        const answer = responses[question.key]
        if (answer === undefined) return undefined
        // An answer declined is worth nothing either way: null, for `score()`
        // to leave out.
        if (question.declined.indexOf(answer) !== -1) return null
        // An answer outside the scale has no worth on it: a custom option
        // holds the dimension unfinished rather than feeding its label — an
        // arbitrary number — into the average.
        if (question.custom.indexOf(answer) !== -1) return undefined
        // An item with a right answer is worth 1 for it and 0 for anything
        // else: the value chosen is only which option it was. The right one
        // is written in content/ as a hash, and the answer is hashed the same
        // way to compare (`answerKey`, timeline.js), so the key is not legible
        // from the file.
        if (question.correct !== undefined) return answerKey(question.key, answer) === question.correct ? 1 : 0
        // An option that says what it is worth is worth that.
        if (question.scores) return question.scores[answer]
        return question.reverse ? question.lowest + question.highest - answer : answer
    }

    // Somebody else's results, opened from a shared link: while they are on
    // screen the scores are the link's and nothing of this run's. It is set
    // by results.js (`visit`, on the engine) and cleared when the visitor
    // presses "Take the test yourself", before anything of their own is
    // answered, so no score of the run is ever read from it.
    let visitor = null

    // What a dimension's items are worth, once every one of them is answered:
    // the answers really given, an answer declined ("I'd rather not say")
    // being left out rather than counted as anything.
    function given(dimension) {
        const answers = dimensions[dimension].map(counted)
        if (answers.some((answer) => answer === undefined)) return undefined
        return answers.filter((answer) => answer !== null)
    }

    // How many of a dimension's items must be really answered for it to be
    // scored: all of them, unless its questionnaire is written `enough`, a
    // share of them.
    function needed(dimension) {
        const items = dimensions[dimension]
        const share = Math.max.apply(null, items.map((question) => (question.enough === undefined ? 1 : question.enough)))
        return Math.ceil(share * items.length - 1e-9)
    }

    // The average of a dimension, once every one of its items is answered and
    // enough of them really were: the mean of those, the declined left out.
    function score(dimension) {
        if (visitor) return visitor.values[dimension]
        const answers = given(dimension)
        if (!answers || !answers.length || answers.length < needed(dimension)) return undefined
        return answers.reduce((total, answer) => total + answer, 0) / answers.length
    }

    // Whether a dimension is answered and still cannot be scored: too many of
    // its items declined. Its figure says so rather than say nothing. Never
    // true of somebody else's results, which a link carries as scores alone.
    function declined(dimension) {
        if (visitor) return false
        const answers = given(dimension)
        return !!answers && (!answers.length || answers.length < needed(dimension))
    }

    // The total of a dimension, once every one of its items is answered. The
    // PHQ-4 is read from sums rather than averages. A sum over fewer items
    // than the scale has is no sum on it, so one declined holds it unfinished.
    function total(dimension) {
        // A link carries the average; the sum is that over the items again.
        if (visitor) return visitor.values[dimension] === undefined ? undefined : visitor.values[dimension] * dimensions[dimension].length
        const answers = given(dimension)
        if (!answers || answers.length < dimensions[dimension].length) return undefined
        return answers.reduce((sum, answer) => sum + answer, 0)
    }

    // Share of the population below a score, from the dimension's norms: off
    // the people themselves where the norm carries their `distribution` (the
    // share in each bin of `step` from `from` up), taking a bin's people as
    // spread evenly across it, and otherwise off a normal curve through the
    // mean and SD — Abramowitz & Stegun 26.2.17 for the distribution function.
    // The two are kept in one place so that anything showing a standing shows
    // the same one.
    function percentile(value, norm) {
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
        const density = 0.3989422804014327 * Math.exp((-z * z) / 2)
        const tail = density * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
        return z > 0 ? 1 - tail : tail
    }

    function tercile(proportion) {
        return proportion < 1 / 3 ? "low" : proportion < 2 / 3 ? "mid" : "high"
    }

    /* ------------------------------ rendering ---------------------------- */

    function showScreen(name) {
        screen = name
        // The landing screen is laid out differently from the rest — full width,
        // above the water, and with no bar beside it — so the body carries which
        // one is up.
        document.body.dataset.screen = name
        for (const s of document.querySelectorAll(".screen")) s.classList.remove("screen--active", "screen--arriving")
        $("screen-" + name).classList.add("screen--active")
    }

    function markSelection(value) {
        // A `multi` item is answered with several values at once, everything
        // else with one — read here as a list of one, so a single loop lights
        // both. A button with no value of its own (Continue) is in neither.
        const chosen = value === undefined ? [] : Array.isArray(value) ? value : [value]

        // Only the buttons that carry a value: Continue is an `.option` too,
        // but it is not an answer and takes no checked state.
        for (const button of document.querySelectorAll(".option[data-value]")) {
            const selected = chosen.indexOf(Number(button.dataset.value)) !== -1
            button.classList.toggle("option--selected", selected)
            button.setAttribute("aria-checked", selected ? "true" : "false")
        }

        // A typed answer is put back in the field it was typed into.
        const field = $("entry")
        if (field) {
            if (value !== undefined) field.value = value
            field.dispatchEvent(new Event("input"))
        }
    }

    // A question answered by typing rather than by choosing: the field, and the
    // button that takes what is in it. A number has to fall within the scale; an
    // answer put in the person's own words only has to have something in it —
    // unless the item is `optional`, when a blank is an answer too (saved as an
    // empty string) and the button says "Skip" while there is nothing in the
    // field. A `multiline` field is a textarea rather than a line: Enter starts
    // a new line in it, so Ctrl+Enter (Cmd on a Mac) is what takes it.
    function renderEntry(question, wrap) {
        const written = question.input === "text"
        const long = written && question.multiline
        wrap.classList.add("options--entry")
        if (long) wrap.classList.add("options--entry-long")

        const field = document.createElement(long ? "textarea" : "input")
        if (!long) field.type = written ? "text" : "number"
        field.id = "entry"
        field.className = long ? "entry entry--long" : "entry"
        field.placeholder = question.placeholder || ""
        field.setAttribute("aria-labelledby", "text")

        if (written) {
            field.maxLength = question.highest || 80
            if (long) field.rows = 6
        } else {
            field.inputMode = "numeric"
            field.min = question.lowest
            field.max = question.highest
        }

        const go = document.createElement("button")
        go.type = "button"
        go.className = "option option--go"
        go.textContent = "Continue"

        // Says why a number is not being taken, rather than leaving Continue
        // greyed out with no explanation.
        const warning = document.createElement("p")
        warning.className = "warning"
        warning.setAttribute("role", "status")

        const given = () => {
            if (written) return field.value.trim() || (question.optional ? "" : null)
            const value = Number(field.value)
            const within = value >= question.lowest && value <= question.highest
            return field.value !== "" && Number.isFinite(value) && within ? value : null
        }

        const check = () => {
            const value = Number(field.value)
            const typed = field.value !== "" && Number.isFinite(value)
            const refused =
                written || !typed ? null : value < question.lowest ? question.tooLow : value > question.highest ? question.tooHigh : null

            go.disabled = given() === null
            if (question.optional) go.textContent = field.value.trim() ? "Continue" : "Skip"
            warning.textContent = refused || ""
            warning.classList.toggle("warning--shown", Boolean(refused))
        }

        const take = () => {
            const value = given()
            if (value === null) return check()
            answer(value)
        }

        field.addEventListener("input", check)
        field.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return
            if (long && !(e.ctrlKey || e.metaKey)) return // a new line, not the answer
            e.preventDefault()
            take()
        })
        go.addEventListener("click", take)
        check()

        wrap.appendChild(field)
        wrap.appendChild(go)
        wrap.appendChild(warning)
        go.disabled = true
        field.focus()
    }

    // One option as a button, the same whether it will be picked once or
    // ticked among several: what differs between a choice and a multi is the
    // part the button plays and what a press of it does, which is all the two
    // renderers keep to themselves.
    function optionButton(option, role, press) {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "option" + (option.small ? " option--small" : "") + (option.image ? " option--picture" : "")
        button.dataset.value = String(option.value)
        const label = worded(option.text)
        const words = label === null ? option.label || String(option.value) : label
        // An option drawn rather than written — a candidate cut out of a
        // reasoning figure — is its picture with its words under it as a
        // caption. The words are still the button's text: they are what a
        // screen reader hears, what the keyboard answers by and what `said()`
        // saves, so the picture changes nothing about the answer.
        if (option.image) {
            const picture = document.createElement("img")
            picture.src = option.image
            picture.alt = ""
            picture.draggable = false
            const caption = document.createElement("span")
            caption.className = "option__caption"
            caption.textContent = words
            button.append(picture, caption)
        } else {
            button.textContent = words
        }
        button.setAttribute("role", role)
        button.setAttribute("aria-checked", "false")
        button.addEventListener("click", press)
        return button
    }

    // A question answered by choosing: one button per option, on the scale the
    // format gives them. A Likert scale and a list of countries come through
    // here alike — what differs is the writing on the buttons.
    function renderChoice(question, wrap) {
        const options = offered(question)
        // A way out of the question (`small: true`, "That doesn't apply to
        // me") is written in words even under a row of circles, and is set
        // beneath the scale rather than on it — so it is not what decides
        // whether the scale is labelled, nor how many circles it has.
        const points = options.filter((o) => !o.small)
        const labelled = points.some((o) => worded(o.text) !== null)
        const pictured = options.some((o) => o.image)

        // A row of circles is only as wide as its circles, so the scale draws
        // its anchors in against them rather than against its own edges — five
        // points and eleven then read the same. Labelled options take the
        // width they are given, which is the whole of it.
        $("scale").classList.toggle("scale--circles", !labelled)
        // Stacked into a ladder rather than set in a row: a numbered scale
        // asking where somebody stands, or a labelled scale stacked strongest
        // on top instead of first-written on top, read bottom to top rather
        // than top to bottom. Written on the format rather than a type of its
        // own — it is still an ordinary choice, only the room it stands in
        // differs.
        $("scale").classList.toggle("scale--vertical", !!question.vertical)

        wrap.classList.toggle("options--labelled", labelled)
        // Candidates drawn rather than written are tiles in a grid, the two
        // written ones among them (a rotation item's "none of the cubes")
        // tiles of the same size.
        wrap.classList.toggle("options--pictures", pictured)
        // Labelled options given a column each are a Likert scale set in a row
        // rather than a list, and read centred like the circles do.
        wrap.classList.toggle("options--row", labelled && !pictured && question.columns === options.length)
        wrap.classList.toggle("options--wide", !labelled && points.length > 7)
        // Labelled options stack unless the item asks for columns; circles
        // always get one column each.
        wrap.style.setProperty("--columns", labelled ? question.columns || 1 : points.length)

        options.forEach((option) => {
            const button = optionButton(option, "radio", () => answer(option.value))

            // Each point lights up at its own place along the gradient; a way
            // out is on none of it.
            if (question.hovercolors && !option.small) {
                const spread = points.length - 1
                const shade = mix(question.hovercolors[0], question.hovercolors[1], points.indexOf(option) / spread)
                button.style.setProperty("--hover", shade)
            }

            wrap.appendChild(button)
        })
    }

    // A question answered on two scales at once, as one cell of a grid: the
    // columns are one scale and the rows the other (`format.grid`, `across`
    // and `down`), and every option is a cell, carrying the `across` and
    // `down` values it stands at — the content writes the options out, so
    // everything that reads a scale off an item (the file, the codebook, test
    // mode) finds an ordinary choice, and only the room it is answered in is
    // a table. A cell shows a ring and nothing else, its words being the two
    // headers it stands under; they are still on the button for a screen
    // reader, and are what `said()` saves. A way out (`small`) is set under
    // the table the way it is set under a row.
    //
    // Where the format carries the two questions (`grid.ask`), both are set
    // in the table's top left corner with an arrow each to the headers they
    // ask — the across one highest, its arrow dropping from under the words
    // and hooking onto the first column header; the down one in the corner
    // itself, its arrow pointing down onto the first row header. And an answer is drawn as the product of the two: a beam
    // runs along its row out of the row header and another down its column
    // out of the column header, the two headers are lit, and the cell pops
    // where the beams meet. Every beam and ask is placed by the rows and
    // columns of the table itself, so nothing is measured.
    function renderGrid(question, wrap) {
        const options = offered(question)
        const grid = question.grid
        wrap.classList.add("options--grid")
        wrap.style.setProperty("--across", grid.across.length)

        const head = (words, which) => {
            const cell = document.createElement("div")
            cell.className = "grid__head grid__head--" + which
            cell.textContent = words
            return cell
        }
        // Written as a note in the margin of the table rather than set in
        // it: a hand, a tilt, and a stroke of the pen to what it asks. The
        // across arrow drops from under its words and hooks right, onto the
        // first of the column headers; the down one falls from the end of its
        // words onto the first of the row headers. Each is held by the end
        // that points (in the stylesheet), so that it stops short of the
        // headers' words however they wrap and however wide the hand writes.
        const ARROWS = {
            across: { box: "0 0 32 46", d: "M7 2 C2 20 5 36 26 37 M19.8 32 L26 37 L19.6 41.8" },
            down: { box: "0 0 20 28", d: "M6 2 C13 9 13 18 9 26 M4.6 21 L9 26 L13.6 21.6" },
        }
        const ask = (words, which) => {
            const cell = document.createElement("div")
            cell.className = "grid__ask grid__ask--" + which
            const said = document.createElement("span")
            said.className = "grid__said"
            said.textContent = words
            const arrow = draw("svg", { class: "grid__arrow", viewBox: ARROWS[which].box, "aria-hidden": "true" })
            arrow.appendChild(draw("path", { d: ARROWS[which].d }))
            cell.append(said, arrow)
            return cell
        }
        const heads = { across: [], down: [] }
        // The first row of the table, where the header row stands: one lower
        // when the questions take a row over it.
        const top = grid.ask ? 2 : 1

        // With the questions, the across one takes the corner of a row over
        // the table, the rest of the row held empty so that the headers do not
        // come up into it, and the down one the corner under it, where the
        // header row meets the row headers.
        if (grid.ask) {
            const rest = document.createElement("div")
            rest.className = "grid__rest"
            rest.setAttribute("aria-hidden", "true")
            wrap.append(ask(grid.ask.across, "across"), rest)
        }
        wrap.appendChild(grid.ask ? ask(grid.ask.down, "down") : head("", "corner"))
        grid.across.forEach((one) => heads.across.push(wrap.appendChild(head(one.text, "across"))))

        // Out of the flow of the table (absolutely placed on the grid lines of
        // the cells they join), so they take no place from anything.
        const beam = (which, kind) => {
            const one = document.createElement("div")
            one.className = "grid__beam grid__beam--" + which + (kind ? " grid__beam--" + kind : "")
            one.setAttribute("aria-hidden", "true")
            return wrap.appendChild(one)
        }
        // The pointer's pair first, so that the answer's, drawn after, lies
        // over it where the two share a row or a column.
        const traces = { across: beam("across", "trace"), down: beam("down", "trace") }
        const beams = { across: beam("across"), down: beam("down") }
        // Both ends of every line are written: an absolutely placed item's
        // `auto` end is the edge of the table, not the next line.
        const lay = (pair, column, row) => {
            pair.across.style.gridRow = top + 1 + row + " / " + (top + 2 + row)
            pair.across.style.gridColumn = "1 / " + (column + 3)
            pair.down.style.gridColumn = column + 2 + " / " + (column + 3)
            pair.down.style.gridRow = top + " / " + (top + 2 + row)
        }
        let met = null

        // Light the answer as where its row and its column meet, sweeping the
        // beams in when it has just been given and standing them there when it
        // is an answer come back to.
        const cross = (option, sweep) => {
            if (met) met.classList.remove("option--met")
            wrap.classList.remove("options--crossed", "options--sweeping")
            heads.across.concat(heads.down).forEach((one) => one.classList.remove("grid__head--chosen"))
            met = null
            if (!option || option.small) return

            const column = grid.across.findIndex((one) => one.value === option.across)
            const row = grid.down.findIndex((one) => one.value === option.down)
            lay(beams, column, row)
            heads.across[column].classList.add("grid__head--chosen")
            heads.down[row].classList.add("grid__head--chosen")
            met = wrap.querySelector('.option--cell[data-value="' + option.value + '"]')

            // Taken off and put back with a reflow between, or a second answer
            // on the same screen would find the animations already run.
            void wrap.offsetWidth
            wrap.classList.add("options--crossed")
            if (sweep) {
                wrap.classList.add("options--sweeping")
                met.classList.add("option--met")
            }
        }
        const take = (option) => () => {
            if (answer(option.value)) cross(option, true)
        }

        grid.down.forEach((down, row) => {
            heads.down.push(wrap.appendChild(head(down.text, "down")))
            grid.across.forEach((across, column) => {
                const option = options.find((one) => one.down === down.value && one.across === across.value)
                if (!option) throw new Error(question.key + ": the grid has no cell at " + down.text + " / " + across.text)
                const button = optionButton(option, "radio", take(option))
                button.classList.add("option--cell")
                // The words go to the reader and off the face of the cell.
                button.setAttribute("aria-label", button.textContent)
                button.textContent = ""
                // Hovering or focusing a cell lights the two headers it is
                // read against, and traces the way from each to the cell — the
                // answer's beams, fainter — so the eye need not travel to find
                // them.
                const lit = (on) => {
                    heads.across[column].classList.toggle("grid__head--lit", on)
                    heads.down[row].classList.toggle("grid__head--lit", on)
                    if (on) lay(traces, column, row)
                    wrap.classList.toggle("options--tracing", on)
                }
                button.addEventListener("mouseenter", () => lit(true))
                button.addEventListener("mouseleave", () => lit(false))
                button.addEventListener("focus", () => lit(true))
                button.addEventListener("blur", () => lit(false))
                wrap.appendChild(button)
            })
        })

        options.filter((one) => one.small).forEach((option) => wrap.appendChild(optionButton(option, "radio", take(option))))

        cross(options.find((one) => one.value === responses[question.key]), false)
    }

    // A question several answers may be true of at once: the same labelled
    // buttons a choice is answered on, but latched rather than taken on the
    // first press, with a Continue underneath saying the list is finished.
    // What is recorded is a list in the order the options are *written*, not
    // the order they were pressed, so two people who picked the same things
    // save the same answer.
    function renderMulti(question, wrap) {
        wrap.classList.add("options--labelled", "options--multi")
        wrap.style.setProperty("--columns", question.columns || 1)

        // Held here rather than read back off the buttons: the answer is a set,
        // and going back to an item already answered puts its set back.
        const given = responses[question.key]
        const picked = new Set(Array.isArray(given) ? given : [])

        const go = document.createElement("button")
        go.type = "button"
        go.className = "option option--go"
        go.textContent = "Continue"

        const listed = () => question.options.map((one) => one.value).filter((value) => picked.has(value))

        // The lighting itself is `markSelection`, the same path a revisited
        // answer takes; all that is latched here is the Continue button.
        const refresh = () => {
            markSelection(listed())
            // Nothing chosen is not an answer: "none of these" is one of the
            // things that can be chosen, and saying so is a different act from
            // saying nothing.
            go.disabled = picked.size === 0
        }

        // "None of these" is not one more thing that can be true of somebody:
        // taking it puts down everything else, and anything else puts it down.
        const toggle = (option) => {
            if (picked.has(option.value)) {
                picked.delete(option.value)
            } else {
                if (option.exclusive) picked.clear()
                else for (const other of question.options) if (other.exclusive) picked.delete(other.value)
                picked.add(option.value)
            }
            refresh()
        }

        offered(question).forEach((option) => {
            wrap.appendChild(optionButton(option, "checkbox", () => toggle(option)))
        })

        go.addEventListener("click", () => answer(listed()))
        wrap.appendChild(go)

        refresh()
    }

    /* ------------------------------- the curve ---------------------------- */

    // A place in a room of a hundred people rather than a point on a scale.
    // The curve is drawn once and filled from the left as far as the pointer:
    // the area under a normal curve up to a point *is* the share of people
    // below it, so what is filled and the number written over it are the same
    // fact said twice, and neither can drift from the other.
    const CURVE = { width: 640, height: 200, floor: 156, peak: 34, reach: 3, samples: 160 }

    function renderCurve(question, wrap) {
        wrap.classList.add("options--curve")

        // Across the figure is three standard deviations either side of the
        // middle, which is as far out as a room of a hundred reaches.
        const zAt = (x) => (x / CURVE.width) * 2 * CURVE.reach - CURVE.reach

        const yAt = (x) => {
            const z = zAt(x)
            return CURVE.floor - (CURVE.floor - CURVE.peak) * Math.exp((-z * z) / 2)
        }

        // How much of the room is below a point: the area under the curve up to
        // it, which is what `percentile` works out — here against the same
        // standard normal the curve itself is drawn from.
        const shareAt = (x) => Math.round(percentile(zAt(x), { mean: 0, sd: 1 }) * 100)

        // The curve as a run of points; the same run closed down to the floor
        // is the area that fills.
        const points = []
        for (let at = 0; at <= CURVE.samples; at++) {
            const x = (at / CURVE.samples) * CURVE.width
            points.push(x.toFixed(1) + "," + yAt(x).toFixed(1))
        }
        const run = points.join(" ")

        const holder = document.createElement("div")
        holder.className = "curve"

        // The figure says nothing to a screen reader: the range below carries
        // the question, the value and the way to move it.
        const figure = draw("svg", {
            class: "curve__figure",
            viewBox: "0 0 " + CURVE.width + " " + CURVE.height,
            "aria-hidden": "true",
        })

        // What is filled is a window onto the whole area, widened to the mark
        // rather than an area redrawn on every move.
        const clip = draw("rect", { x: 0, y: 0, width: 0, height: CURVE.height })
        const window_ = draw("clipPath", { id: "curve-fill" })
        const defs = draw("defs", {})
        window_.appendChild(clip)
        defs.appendChild(window_)
        figure.appendChild(defs)

        const filled = draw("g", { "clip-path": "url(#curve-fill)" })
        filled.appendChild(
            draw("polygon", {
                class: "curve__area",
                points: "0," + CURVE.floor + " " + run + " " + CURVE.width + "," + CURVE.floor,
            }),
        )
        figure.appendChild(filled)
        figure.appendChild(draw("polyline", { class: "curve__line", points: run }))
        figure.appendChild(draw("line", { class: "curve__floor", x1: 0, y1: CURVE.floor, x2: CURVE.width, y2: CURVE.floor }))

        const stem = draw("line", { class: "curve__stem", x1: 0, y1: 0, x2: 0, y2: CURVE.floor })
        const mark = draw("circle", { class: "curve__mark", cx: 0, cy: 0, r: 6 })
        const reading = draw("text", { class: "curve__reading", x: 0, y: 0, "text-anchor": "middle" })
        const hint = draw("text", {
            class: "curve__hint",
            x: CURVE.width / 2,
            y: CURVE.floor + 32,
            "text-anchor": "middle",
        })
        hint.textContent = "Click where you sit"

        figure.appendChild(stem)
        figure.appendChild(mark)
        figure.appendChild(reading)
        figure.appendChild(hint)

        // The answer itself, and the only way into it that is not a pointer.
        // It takes no pointer events of its own — the figure above handles
        // those — so the two can never disagree about where the mark is. The
        // global key handler ignores an INPUT, so the arrows move this rather
        // than sending the run backwards.
        const field = document.createElement("input")
        field.type = "range"
        field.className = "curve__slide"
        field.min = String(question.lowest)
        field.max = String(question.highest)
        field.step = "1"
        field.value = String(Math.round((question.lowest + question.highest) / 2))
        field.setAttribute("aria-labelledby", "text")

        let held = false

        const show = (x) => {
            const place = Math.max(0, Math.min(CURVE.width, x))
            const y = yAt(place)
            const share = shareAt(place)

            clip.setAttribute("width", place)
            stem.setAttribute("x1", place)
            stem.setAttribute("x2", place)
            stem.setAttribute("y1", y)
            mark.setAttribute("cx", place)
            mark.setAttribute("cy", y)

            // The reading rides the curve, and is kept off the ends of the
            // figure so that it is never half outside it.
            reading.setAttribute("x", Math.max(62, Math.min(CURVE.width - 62, place)))
            reading.setAttribute("y", y - 18)
            reading.textContent = share + "% of people"

            field.value = String(share)
            field.setAttribute("aria-valuetext", share + "% of people")

            held = true
            holder.classList.add("curve--held")
            return share
        }

        // Back to an item already answered, or moved by the keyboard: what is
        // kept is the share, so the place has to be found back from it. The
        // curve only ever rises, so halving the interval gets there.
        const placeOf = (share) => {
            let low = 0
            let high = CURVE.width

            for (let step = 0; step < 40; step++) {
                const middle = (low + high) / 2
                if (shareAt(middle) < share) low = middle
                else high = middle
            }
            return high
        }

        const at = (event) => {
            const box = figure.getBoundingClientRect()
            return ((event.clientX - box.left) / box.width) * CURVE.width
        }

        const follow = (event) => {
            if (locked) return
            show(at(event))
        }

        holder.addEventListener("pointermove", follow)
        holder.addEventListener("pointerdown", follow)

        // Where the click lands is the answer. There is nothing to confirm: the
        // number standing over the mark when it is pressed is what is recorded.
        holder.addEventListener("click", (event) => {
            if (locked) return
            answer(show(at(event)))
        })

        // The keyboard's way through, for want of a button to press: the arrows
        // move the mark, and Enter takes where it has been moved to.
        field.addEventListener("input", () => show(placeOf(Number(field.value))))
        field.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && held) answer(Number(field.value))
        })

        holder.appendChild(figure)
        holder.appendChild(field)
        wrap.appendChild(holder)

        // An answer already given is put back where it was left.
        const given = responses[question.key]
        if (given !== undefined) show(placeOf(given))
    }

    /* ------------------------------ the slider ---------------------------- */

    // A point along a line between two ends — how likely something is, from
    // certainly not to certain — where a row of circles would be too many
    // stops to read. It is a real `<input type="range">`, drawn over, with the
    // value riding above the thumb. **Nothing is claimed until it is touched**:
    // the thumb is hidden and Continue held until the line is pressed or an
    // arrow moves it, so that the middle, where a range has to start, is never
    // an answer nobody gave. Continue (or Enter) takes it, since a drag has no
    // moment at which it is obviously finished.
    //
    // Before it is pressed, a ghost of the thumb follows the pointer along the
    // line with the value it would give, so the line says it is live and what
    // a press there would mean; once pressed, the line fills up to the thumb.
    // The spray on answering comes out of the point chosen (`.slider__mark`,
    // an empty mark riding under the thumb), not out of the button that
    // confirmed it, since the point is the answer.
    //
    // A slider written `reading: false` (the MINT's third format) says no
    // number at all, neither over the thumb nor under the pointer: the ghost
    // still follows it, empty, and the two ends are the whole of the scale.
    //
    // A way out ("This doesn't apply to me") is an option on the format, as
    // under a row of circles — `small` and `custom`, valued off the line —
    // and is set under Continue, taken on the press like a choice. It is the
    // one thing on a slider that carries `data-value`, so the lighting and
    // the spray find it the way they find an option.
    function renderSlider(question, wrap) {
        wrap.classList.add("options--slider")

        const holder = document.createElement("div")
        holder.className = "slider"
        const mute = question.reading === false
        if (mute) holder.classList.add("slider--mute")

        const field = document.createElement("input")
        field.type = "range"
        field.className = "slider__range"
        field.min = question.lowest
        field.max = question.highest
        field.step = question.step || 1
        field.value = (question.lowest + question.highest) / 2
        field.setAttribute("aria-labelledby", "text")

        const reading = document.createElement("output")
        reading.className = "slider__reading"
        reading.setAttribute("aria-hidden", "true")

        // Where the reading will be, until there is one: a line with no thumb
        // on it does not say by itself that it is waiting to be pressed.
        const hint = document.createElement("p")
        hint.className = "slider__hint"
        hint.textContent = "Click on the line"

        const ends = document.createElement("div")
        ends.className = "slider__ends"
        for (const end of question.anchors || []) {
            const word = document.createElement("span")
            word.textContent = end
            ends.appendChild(word)
        }

        // Where a press would land, and what it would give, while the pointer
        // is over the line. It is decoration: the range underneath is what is
        // pressed and what a screen reader hears.
        const ghost = document.createElement("span")
        ghost.className = "slider__ghost"
        ghost.setAttribute("aria-hidden", "true")
        const ghostReading = document.createElement("span")
        ghostReading.className = "slider__ghost-reading"
        ghost.appendChild(ghostReading)

        const mark = document.createElement("span")
        mark.className = "slider__mark"
        mark.setAttribute("aria-hidden", "true")

        const go = document.createElement("button")
        go.type = "button"
        go.className = "option option--go"
        go.textContent = "Continue"
        go.disabled = true

        const span = question.highest - question.lowest
        const step = Number(field.step)
        const shareOf = (value) => (value - question.lowest) / span
        const said = (value) => value + (question.unit || "")

        let touched = false
        const show = () => {
            const value = Number(field.value)
            holder.style.setProperty("--at", shareOf(value))
            if (mute) return
            reading.textContent = said(value)
            field.setAttribute("aria-valuetext", reading.textContent)
        }
        const touch = () => {
            touched = true
            holder.classList.add("slider--touched")
            go.disabled = false
            // A way out taken before, and gone back to, is no longer the answer
            // once the line is.
            for (const button of wrap.querySelectorAll(".option[data-value]")) {
                button.classList.remove("option--selected")
                button.setAttribute("aria-checked", "false")
            }
            show()
        }

        // The value under the pointer, found the way the range finds it: the
        // thumb's centre travels the width less one thumb, and the answer
        // snaps to the step.
        const hovered = (event) => {
            const box = field.getBoundingClientRect()
            const thumb = parseFloat(getComputedStyle(holder).getPropertyValue("--thumb")) || 26
            const along = Math.min(1, Math.max(0, (event.clientX - box.left - thumb / 2) / (box.width - thumb)))
            return Math.round((question.lowest + along * span) / step) * step
        }

        // **The line, not the range, takes the pointer**, as the curve's
        // figure does: left to itself a range is pressed differently by every
        // browser — iOS moves the thumb only when the thumb itself is dragged,
        // and the thumb here is hidden in the middle until the line is
        // touched, so a tap near it picked it up from there and landed
        // somewhere else. A press puts the value where it lands, and a drag
        // carries it. The range under it still holds the value, is what the
        // keyboard and a screen reader move, and is focused on the press so
        // that Enter takes it.
        const line = document.createElement("div")
        line.className = "slider__line"
        line.appendChild(field)

        // A finger rolls as it lifts: a touch counts as a drag only once it
        // has moved this far, or a tap on 40 would be saved as 47.
        const SLOP = 10
        let held = null
        const place = (event) => {
            field.value = hovered(event)
            touch()
        }
        line.addEventListener("pointerdown", (event) => {
            if (event.button > 0) return
            event.preventDefault()
            line.setPointerCapture(event.pointerId)
            held = { id: event.pointerId, x: event.clientX, dragging: event.pointerType !== "touch" }
            // Held down is dragging: the thumb grows and the reading lifts.
            holder.classList.add("slider--held")
            field.focus({ preventScroll: true })
            place(event)
        })
        line.addEventListener("pointermove", (event) => {
            if (held && event.pointerId === held.id) {
                if (!held.dragging && Math.abs(event.clientX - held.x) < SLOP) return
                held.dragging = true
                place(event)
            }
            if (event.pointerType === "touch") return
            const value = hovered(event)
            holder.style.setProperty("--over", shareOf(value))
            if (!mute) ghostReading.textContent = said(value)
            holder.classList.add("slider--hovered")
        })
        line.addEventListener("pointerleave", () => holder.classList.remove("slider--hovered"))
        // The line keeps the pointer while it is held, so the release arrives
        // here wherever it happens.
        for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
            line.addEventListener(type, () => {
                held = null
                holder.classList.remove("slider--held")
            })

        const take = () => {
            holder.classList.add("slider--taken")
            answer(Number(field.value))
        }

        field.addEventListener("input", touch)
        field.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && touched) take()
        })
        go.addEventListener("click", () => {
            if (touched) take()
        })

        holder.appendChild(hint)
        holder.appendChild(reading)
        holder.appendChild(ghost)
        holder.appendChild(mark)
        holder.appendChild(line)
        holder.appendChild(ends)
        wrap.appendChild(holder)
        wrap.appendChild(go)
        for (const option of offered(question)) wrap.appendChild(optionButton(option, "radio", () => answer(option.value)))

        // An answer already given is put back where it was left — on the line,
        // or, for a way out, nowhere on it, `markSelection` lighting the button.
        const given = responses[question.key]
        if (given !== undefined && question.custom.indexOf(given) === -1) {
            field.value = given
            touch()
        } else show()
    }

    // A renderer per type of question, and beside it the thing each type is
    // answered by — which is where the spray comes out of. Only a choice
    // carries its value in a selector: a written answer is somebody's own
    // words, a place on a curve is a place rather than a button, and a list of
    // several answers is finished by pressing Continue rather than by any one
    // of them. A new way of answering is a `type` written in content/ and a
    // line in each of these, and nothing else moves.
    const SCALES = { choice: renderChoice, input: renderEntry, multi: renderMulti, curve: renderCurve, slider: renderSlider, grid: renderGrid }

    const SPRAYS = {
        choice: (value) => document.querySelector('.option[data-value="' + value + '"]'),
        grid: (value) => document.querySelector('.option[data-value="' + value + '"]'),
        input: () => $("options").querySelector(".option--go"),
        multi: () => $("options").querySelector(".option--go"),
        curve: () => $("options").querySelector(".curve__mark"),
        slider: (value) => $("options").querySelector('.option[data-value="' + value + '"]') || $("options").querySelector(".slider__mark"),
    }

    // How long an answer stays on screen before the next item, where a type
    // wants longer than ADVANCE_DELAY: a grid's beams have to meet at the cell
    // (`grid-beam` and `grid-meet` in style.css) before the item fades.
    const HOLDS = { grid: 700 }

    function renderScale(question) {
        const wrap = $("options")

        wrap.innerHTML = ""
        wrap.className = "options"
        // Whatever the last item was answered on, this one is not shown on it:
        // each renderer puts back only the classes it needs.
        $("scale").className = "scale"

        // What the group is to a screen reader follows the kind of answer:
        // radios pick one, checkboxes tick several, and a typed field or a
        // curve is no group at all — its own control carries the item.
        if (question.type === "choice" || question.type === "grid") wrap.setAttribute("role", "radiogroup")
        else if (question.type === "multi") wrap.setAttribute("role", "group")
        else wrap.removeAttribute("role")

        SCALES[question.type](question, wrap)

        // Only a scale has sides to name; a field typed into has none.
        const anchored = question.anchors && question.type === "choice"
        $("anchor-left").textContent = anchored ? question.anchors[0] : ""
        $("anchor-right").textContent = anchored ? question.anchors[1] : ""
        $("anchor-left").hidden = !anchored
        $("anchor-right").hidden = !anchored
    }

    // A briefing: a pause in the middle of a level, saying what the
    // next stretch of it is about, with nothing to answer. It takes the survey
    // screen over rather than being a screen of its own, so that everything
    // guarding on `screen === "survey"` — the keyboard, the back button, the
    // timing — goes on holding while it is up.
    const CHEER_DELAY = 420 // ms for a celebrated briefing to rise in before the sprays go up out of it

    function renderBriefing(question) {
        // The options of the item before it would otherwise still be sitting in
        // the screen behind it, answerable by anything that finds them.
        $("options").innerHTML = ""
        $("briefing-body").innerHTML = worded(question.text)

        // A briefing that marks a milestone (`celebrate`) is a reward rather
        // than a pause: lit, and the finale's three sprays out of its heading
        // once it has risen in — unless the run has moved on by then, when the
        // heading is no longer on screen to spray out of.
        $("briefing").classList.toggle("briefing--celebrate", question.celebrate)
        if (question.celebrate) {
            const heading = $("briefing-body").querySelector("h2")
            FINALE_COLOURS.forEach((colour, at) =>
                setTimeout(() => {
                    if (questions[index] !== question || screen !== "survey") return
                    burst(heading, colour, { count: 26, reach: 150 + at * 60 })
                }, CHEER_DELAY + at * FINALE_STEP),
            )
        }

        // The briefing that ends an interlude is left by choosing what comes
        // next, while a fork is still to fill the place it opens: the cards a
        // level screen would have offered stand under it in place of its one
        // button. Laid out once for each choice, so coming back to it does
        // not deal the cards again under the person reading them.
        const fork = question.onward ? forkAfter(question.level - 1) : null
        const paths = $("briefing-paths")
        $("briefing-go").hidden = !!fork
        $("briefing").classList.toggle("briefing--onward", !!fork)
        paths.hidden = !fork
        if (!fork) return
        const dealing = question.key + " " + fork.at
        if (paths.dataset.dealt === dealing && paths.children.length) return
        paths.dataset.dealt = dealing
        renderFork(fork, paths, (side, shown) => goOnward(fork, side, shown))
    }

    let leadShown = "" // the last questionnaire lead-in put on screen

    function renderQuestion() {
        const question = questions[index]
        const survey = $("screen-survey")
        const pausing = isBriefing(question)

        // Drives the item's background, its selected response and the progress bar.
        document.documentElement.style.setProperty("--selected", question.color || "var(--accent)")

        $("text").hidden = pausing
        $("scale").hidden = pausing
        $("briefing").hidden = !pausing
        $("briefing-paths").hidden = true // until a briefing that offers them says otherwise
        $("instructions").hidden = pausing || !question.instructions

        if (pausing) {
            renderBriefing(question)
        } else {
            // The item is HTML: a question may carry its own stem, with the thing
            // actually being asked set apart inside it. It comes from content/.
            $("text").innerHTML = worded(question.text)

            // A lead-in that differs from the last one shown is lit up once, or
            // it is read past as the one before. The class comes off first and
            // the width is read, so that two new ones in a row both play.
            const lead = $("instructions")
            const fresh = Boolean(question.instructions) && question.instructions !== leadShown
            lead.innerHTML = question.instructions || ""
            lead.classList.remove("instructions--new")
            if (fresh) {
                void lead.offsetWidth
                lead.classList.add("instructions--new")
            }
            if (question.instructions) leadShown = question.instructions

            renderScale(question)
            markSelection(responses[question.key])
        }

        $("back").disabled = previousShown(index - 1) === -1
        renderCountdown(question)
        if (passing) popMark(passing)
        passing = null

        // The new item is put in place while the old one is still faded out,
        // then let back in: the run reads as one moving thing rather than a
        // series of pages. Reading the width in between settles the faded state
        // as the one the fade starts from — waiting for a frame instead would
        // leave the item invisible in a tab nobody is looking at.
        survey.classList.add("turning")
        void survey.offsetWidth
        survey.classList.remove("turning")

        // Presented now — an item shown again records the later time, so that
        // the gap to the response it produced stays meaningful.
        if (!log[question.key]) log[question.key] = {}
        log[question.key].timeOnset = new Date().toISOString()
        keep()
    }

    // The last few answers before a level opens are counted down under the
    // item, since people go faster the nearer a reward is and a level of
    // forty items is a long way to go on a ring at the edge of the page. Only
    // near the end: counted from the start, a long level would say how far
    // there is still to go, which is the opposite of the point. It says what
    // the answers open and never what is in it, so nothing it says can lean
    // on an answer.
    const COUNTDOWN = 6 // answers left at most, however long the level
    const COUNTDOWN_SHARE = 1 / 3 // and no more than this share of it

    function renderCountdown(question) {
        const note = $("countdown")
        const progress = levelProgress(question.level)
        const left = progress.size - progress.answered
        const counting =
            scoredLevels.indexOf(question.level) !== -1 &&
            !between(question) &&
            left > 0 &&
            left <= Math.min(COUNTDOWN, Math.ceil(progress.size * COUNTDOWN_SHARE))
        note.hidden = !counting
        if (!counting) return
        note.textContent = left === 1 ? "Last answer to unlock this level" : left + " more answers to unlock this level"
        note.classList.toggle("survey__countdown--last", left === 1)
    }

    /* ---------------------------- the sidebar ----------------------------- */

    // The levels that hold a dimension, and so have results to open. A level
    // with nothing scored in it is not one of them: the closing item is a level
    // of its own so that it comes after the last of these has been opened.
    const scoredLevels = levels.filter((level) => questions.some((one) => one.level === level && one.dimension))

    // **A level screen is an item of the run.** It is put in front of
    // somebody, it is read, and it is left by pressing something — which is
    // everything an item is, so it is saved as one rather than as a shape of
    // its own. `timeOnset` is stamped when the results are uncovered and
    // `timeResponse` when the way on is pressed, so **the two are how long
    // that level's results were read** — the one place the file measures
    // that. The `response` is the way on that was taken: where the level
    // ends in a fork, the level chosen and then the ones passed over, in the
    // words the cards carried; otherwise the words on the one button, the
    // way a briefing saves its continue. One per scored level, made here and
    // null until the level is reached, so the shape of the file never
    // changes — and written into `items[]` after the last item of the level
    // it showed, which is where the person met it. Reopening a level's
    // results later goes through its panel and is not counted.
    const levelItems = scoredLevels.map((level) => ({ level: level, key: "Level_" + level, response: null, timeOnset: null, timeResponse: null }))
    const levelItem = (level) => levelItems.find((item) => item.level === level)

    // A star rating belongs to the same screen, but it is **filed under the
    // level's key rather than its number** — `ratings["Character"]`, not
    // `ratings["Level_5"]`. A level number is a place in one person's run, and
    // the run is drawn and partly chosen, so level 5 is Character for one
    // person and Reasoning for the next: a column of numbered ratings holds a
    // different level in every row, which is not a column. The key is the same
    // thing for everybody. It is written in the timeline beside the name and is
    // not the name: the name is participant-facing prose, free to change for
    // the sake of the test and free to hold an ampersand or an article, and a
    // column of a study's data is neither. `levelKey` is the one place that is
    // decided, and the seam hands it to `results.js` so nothing there has to
    // know how a rating is keyed. The set of keys does not move when a fork
    // swaps two levels — they cross over with the levels, so the same keys are
    // always all present — which is why they can be written in up front.
    const levelKey = (level) => PLAN[level - 1].key

    // Two levels of one key would quietly share a rating and a quality-control
    // entry, and nothing downstream could tell them apart. Every level is
    // checked and not only the scored ones, since the quality control covers
    // the closing level too. A level with no key at all is the same fault found
    // one step earlier.
    const levelKeys = levels.map(levelKey)
    if (levelKeys.some((key) => !key)) {
        throw new Error("a level of the timeline has no key: " + levels.map(levelName).join(", "))
    }
    if (new Set(levelKeys).size !== levelKeys.length) {
        throw new Error("two levels share a key, so their ratings would collide: " + levelKeys.join(", "))
    }

    for (const item of levelItems) ratings[levelKey(item.level)] = null

    // A fork is offered from the level screen of the level before the slot it
    // fills, which an unscored level never shows, and moves levels about among
    // numbers that have to stay scored in every order. The last slot is filled
    // by what is left rather than chosen for, and so is the first when the fork
    // starts at level 1, so neither wants a level before it.
    for (const fork of FORKS) {
        fork.slots.forEach((slot, at) => {
            const chosen = at >= fork.at && at < fork.slots.length - 1
            for (const level of chosen ? [slot - 1, slot] : [slot]) {
                if (scoredLevels.indexOf(level) === -1) throw new Error("a fork's slots and the levels before them are scored, and level " + level + " is not")
            }
        })
    }

    // How far through a level, and whether it has been finished. Only the items
    // being asked count: a branch nobody went down is not owed an answer.
    function levelProgress(level) {
        const asked = askedIn(level)
        const answered = asked.filter((question) => responses[question.key] !== undefined).length
        return {
            answered: answered,
            size: asked.length,
            // A level can be asked nothing — every kept item behind a closed
            // branch, in a thinned test run — and owing no answers is complete,
            // not a division by zero.
            share: asked.length ? Math.round((answered / asked.length) * 100) : 100,
            unlocked: answered === asked.length,
        }
    }

    // The whole run read as a descent: answering everything reaches the bottom
    // of the deepest water there is. It is a way of saying "how far through you
    // are" that is worth watching go up.
    const DEEPEST = 11034 // metres, the Challenger Deep

    // **The seabed falls at a share of the levels, not at a level.**
    // `WATER_SHARE` (content/timeline.js) puts the first two thirds of the
    // scored levels in the water and the rest in the rock under it — `BEDROCK`
    // metres of it, about the thickness of the oceanic crust. Being a share and
    // not a flag on a level, the break holds its place however many levels a
    // battery asks and wherever the fork has put them: which level is the
    // floor is the descent's business, and what is asked there is nothing to
    // do with it.
    const BEDROCK = 7000 // metres of rock the levels beneath go down through
    const waterLevels = scoredLevels.slice(0, Math.round(scoredLevels.length * WATER_SHARE))
    const rockLevels = scoredLevels.slice(waterLevels.length)
    const beneath = (level) => rockLevels.indexOf(level) !== -1
    // The last level in the water when there is rock under it: the one whose
    // way on goes through the floor.
    const floorLevel = rockLevels.length && waterLevels.length ? waterLevels[waterLevels.length - 1] : null

    // Where the silt line sits in the column behind the page (`body::before`,
    // style.css). The window shows `COLUMN` of the column at a time and slides
    // down it as `--descent` runs to 1, and the floor should rise into the
    // bottom of the window halfway through the last level in the water — so
    // the stylesheet is handed the one number and everything in the gradient
    // is placed against it. With no rock under it the silt is never reached,
    // and with no water above it everything is rock.
    const COLUMN = 100 / 420 // the share of the column the window shows at once
    let floorAt = 100
    if (!waterLevels.length) floorAt = 0
    else if (rockLevels.length) floorAt = (((waterLevels.length - 0.5) / scoredLevels.length) * (1 - COLUMN) + COLUMN) * 100
    document.documentElement.style.setProperty("--floor", floorAt.toFixed(1) + "%")

    // The depth a level is finished at. The water is divided equally between
    // the water levels, so a level's floor is its share of the deepest water
    // there is; the rock is divided the same way between the levels beneath.
    function levelDepth(level) {
        if (beneath(level)) return DEEPEST + Math.round(((rockLevels.indexOf(level) + 1) / rockLevels.length) * BEDROCK)
        return Math.round(((waterLevels.indexOf(level) + 1) / waterLevels.length) * DEEPEST)
    }

    // A depth written the way the gauge writes it: metres from the surface,
    // in the water and in the rock alike. Counting the rock from the seabed
    // instead would put two scales on one line, and a smaller number on a
    // level that is further down.
    function sounding(depth) {
        return depth.toLocaleString("en-GB") + " m"
    }

    // What the timeline calls a level.
    function levelName(level) {
        return PLAN[level - 1].name || ""
    }

    // The stops run through one gradient down the gauge — cyan at the surface,
    // through blue and violet, to red at the bottom — so a level's colour is
    // where it falls in the descent and nothing about what it asks. The first
    // scored level takes the first colour and the last the last, whatever the
    // count between them.
    // A run with a core (`inCore`) runs its core through a green of its own
    // instead, lime to emerald, and the rest through the gradient after it
    // from its blue, the cyan being too near the emerald to mark the break,
    // so the levels everybody is asked are told from the optional ones at a
    // glance — on the gauge and on the shelf alike — while the hue still
    // turns one way all the way down.
    const GAUGE_COLOURS = ["#0891b2", "#1d4ed8", "#6d28d9", "#be185d"]
    const CORE_COLOURS = ["#65a30d", "#059669"]

    function levelColour(level) {
        const core = inCore(level)
        const run = scoredLevels.filter((one) => inCore(one) === core)
        const colours = core ? CORE_COLOURS : CORE_BEFORE === -1 ? GAUGE_COLOURS : GAUGE_COLOURS.slice(1)
        const at = run.indexOf(level)
        const share = run.length > 1 ? at / (run.length - 1) : 0
        const step = share * (colours.length - 1)
        const from = Math.min(Math.floor(step), colours.length - 2)
        return mix(colours[from], colours[from + 1], step - from)
    }

    // "Level 4 · Traits & Symptoms" — how a level is written wherever it is named.
    function levelTitle(level) {
        const name = levelName(level)
        return "Level " + level + (name ? " · " + name : "")
    }

    // How long a level is said to take, as the badge over its teaser writes it:
    // the `minutes` written in the timeline from the pilot runs, or nothing
    // where a level carries none. The number alone, with no "about" in front:
    // nobody reads a duration on a badge as a promise. It travels with what is
    // asked, not with the place, so a fork swaps it with the name (`swapLevels`).
    function aboutMinutes(level) {
        const minutes = PLAN[level - 1].minutes
        return minutes ? minutes + " minute" + (minutes === 1 ? "" : "s") : ""
    }

    // The line is divided equally between the levels, so a level sits at the
    // same point on it however many items it holds: what a long level buys is a
    // slower stretch of water rather than a longer piece of line. A level with
    // nothing scored in it takes no share of the descent — the closing item is
    // asked at the bottom, not below it.
    function descentShare() {
        if (!scoredLevels.length) return 0

        let reached = 0
        for (const level of scoredLevels) {
            const progress = levelProgress(level)
            reached += progress.size ? progress.answered / progress.size : 1
        }
        return reached / scoredLevels.length
    }

    // Metres reached: each water level is an equal stretch of the trench and
    // each level beneath an equal stretch of the rock under it, filled as far
    // as the level is answered. The share of the line above is not this — the
    // line gives every scored level the same length, water or rock.
    function metresReached() {
        // A run with no water levels starts on the seabed, so its metres are
        // rock from the first answer and sound as such.
        let reached = waterLevels.length ? 0 : DEEPEST
        for (const level of scoredLevels) {
            const progress = levelProgress(level)
            const filled = progress.size ? progress.answered / progress.size : 1
            // A battery may hold levels of one kind only, so neither count divides on its own.
            reached += filled * (beneath(level) ? BEDROCK / rockLevels.length : waterLevels.length ? DEEPEST / waterLevels.length : 0)
        }
        return Math.round(reached)
    }

    function depth() {
        const asked = questions.filter((question) => !isBriefing(question) && shown(question))
        const answered = asked.filter((question) => responses[question.key] !== undefined).length
        return { answered: answered, size: asked.length, share: descentShare(), metres: metresReached() }
    }

    function metres() {
        return sounding(depth().metres)
    }

    // The water darkens as the descent goes on: `--descent` is 0 at the surface
    // and 1 at the bottom, and the backdrop is read off it. Only the run moves
    // it — the landing screen is above the water altogether, and what opens
    // under the quote on the way in is the surface.
    function setDescent(share) {
        document.documentElement.style.setProperty("--descent", share.toFixed(4))
    }

    // **What the descent passes on the way down**, pinned on the gauge at the
    // depth each is at: something to arrive at between one level's results
    // and the next, and on no schedule anybody can count, since how many
    // answers lie between two of them depends on the levels they fall in. They
    // say nothing about the person and so can lean on no answer. Each pops out
    // beside its pin as it is passed (`popMark`) and is there on hover or
    // focus after that; the pins are always there. A depth past the floor is
    // the floor plus that much rock, as the gauge sounds it. The Moho is where
    // `BEDROCK` already ends the rock: the bottom of the crust.
    const LANDMARKS = [
        { at: 332, name: "The deepest scuba dive", line: "Ahmed Gabr, in the Red Sea, in 2014." },
        { at: 1000, name: "The midnight zone", line: "No sunlight reaches below here." },
        { at: 2250, name: "Sperm whales", line: "As deep as they dive to hunt for squid." },
        { at: 3800, name: "The Titanic", line: "Where the wreck has lain since 1912." },
        { at: 6000, name: "The hadal zone", line: "Below here, only the trenches go on down." },
        { at: 8336, name: "The deepest fish ever filmed", line: "A snailfish, off Japan, in 2022." },
        { at: 10916, name: "Trieste", line: "The first people to reach the bottom, in 1960." },
        { at: DEEPEST + 2111, name: "Hole 504B", line: "The deepest anyone has drilled into the ocean's crust." },
        { at: DEEPEST + 2466, name: "The deepest life under the seabed", line: "Microbes, found in coal beds off Japan in 2015." },
        { at: DEEPEST + BEDROCK, name: "The Moho", line: "Where the crust ends and the mantle begins." },
    ]

    // Where a depth falls on the line, as a share of it: the water and the
    // rock are each laid evenly along the levels they are divided between,
    // the way `metresReached` fills them, so a pin sits where the bead will
    // be when the gauge sounds that depth. Nothing where the run has none of
    // the water or the rock it would be in.
    function lineAt(metres) {
        if (!scoredLevels.length) return null
        if (metres <= DEEPEST) return waterLevels.length ? ((metres / DEEPEST) * waterLevels.length) / scoredLevels.length : null
        if (!rockLevels.length) return null
        return (waterLevels.length + ((metres - DEEPEST) / BEDROCK) * rockLevels.length) / scoredLevels.length
    }

    const marks = LANDMARKS.filter((mark) => lineAt(mark.at) !== null)
    const MARK_SHOWN = 4800 // ms a landmark stays out beside its pin on being passed
    let sounded = 0 // the deepest the gauge has sounded, so a landmark pops out once
    let passing = null // a landmark just passed, waiting for the next item to be put up

    // Out beside its pin, for long enough to read, and back. Not over the dark
    // of a crossing, which would swallow it: it waits for that to clear.
    function popMark(mark) {
        const pin = $("marks").children[marks.indexOf(mark)]
        if (!pin) return
        if (!$("gaze").hidden) return setTimeout(() => popMark(mark), 1000)
        pin.classList.add("sidebar__mark--news")
        clearTimeout(pin.shown)
        pin.shown = setTimeout(() => pin.classList.remove("sidebar__mark--news"), MARK_SHOWN)
    }

    // Handed the walk `renderSidebar` has already made rather than making its
    // own: `depth()` walks every question, and once an answer is enough.
    function renderDepth(soFar) {
        $("depth").textContent = sounding(soFar.metres)
        $("depth").title = soFar.answered + " of " + soFar.size + " questions answered"
        setDescent(soFar.share)
    }

    // Built once: the buttons *are* the levels, which never change. Everything
    // that moves — each level's share, whether it is open, the fill they sit
    // on — is written onto them by renderSidebar, so re-rendering never throws
    // away the button somebody's keyboard focus is on.
    function buildSidebar() {
        const wrap = $("levels")

        scoredLevels.forEach((level, at) => {
            const button = document.createElement("button")

            button.type = "button"
            // The panel opens out of this button, so it has to be findable
            // again by the level it holds.
            button.dataset.level = level
            button.className = "sidebar__level"
            // Where on the line it sits, as a share of it: the stylesheet decides
            // which way the line runs, down the side or along the foot.
            button.style.setProperty("--at", ((at + 1) / scoredLevels.length) * 100 + "%")
            // The number is all that is written on it; the ring round it and
            // the card that opens beside it are filled in by renderSidebar.
            // The stop is lit in its level's colour.
            button.style.setProperty("--tint", levelColour(level))
            button.setAttribute("aria-label", levelTitle(level))
            button.innerHTML =
                '<span class="sidebar__level-ring" aria-hidden="true"></span>' +
                '<span class="sidebar__level-number">' +
                level +
                "</span>" +
                '<span class="sidebar__level-badge" aria-hidden="true">' +
                '<svg viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5" /></svg></span>' +
                '<span class="sidebar__level-card" aria-hidden="true">' +
                '<span class="sidebar__level-card-eyebrow">Level ' +
                level +
                "</span>" +
                '<b class="sidebar__level-card-title"></b>' +
                '<span class="sidebar__level-card-depth"></span>' +
                '<span class="sidebar__level-card-meter"><i></i></span>' +
                '<span class="sidebar__level-card-note"></span>' +
                "</span>"
            labelStop(button)
            button.querySelector(".sidebar__level-card-depth").textContent = sounding(levelDepth(level))
            // Where the run has a core, a stop says which side of it it is on.
            if (CORE_BEFORE !== -1) {
                button.classList.toggle("sidebar__level--core", inCore(level))
                button.querySelector(".sidebar__level-card-eyebrow").textContent += inCore(level) ? " · Required" : " · Optional"
            }

            // The button that opened it closes it again: a level is a thing on
            // the line that is either open or shut, not a link that only leads
            // one way.
            button.addEventListener("click", () => (panel === "results" && openLevel === level ? closePanel() : openResults(level)))
            wrap.appendChild(button)
        })

        // The landmarks: a lead out from the line to a pin, and the card that
        // opens from it.
        for (const mark of marks) {
            const at = lineAt(mark.at)
            const pin = document.createElement("span")
            pin.className = "sidebar__mark" + (at < 0.2 ? " sidebar__mark--start" : at > 0.8 ? " sidebar__mark--end" : "")
            pin.style.setProperty("--at", at * 100 + "%")
            pin.tabIndex = 0
            pin.setAttribute("aria-label", sounding(mark.at) + ": " + mark.name + ". " + mark.line)
            pin.innerHTML =
                '<span class="sidebar__mark-pin" aria-hidden="true"></span>' +
                '<span class="sidebar__mark-card" aria-hidden="true">' +
                '<span class="sidebar__mark-depth"></span><b class="sidebar__mark-name"></b><span class="sidebar__mark-line"></span></span>'
            pin.querySelector(".sidebar__mark-depth").textContent = sounding(mark.at)
            pin.querySelector(".sidebar__mark-name").textContent = mark.name
            pin.querySelector(".sidebar__mark-line").textContent = mark.line
            $("marks").appendChild(pin)
        }
    }

    // What a stop says about its level: the name on its card, and its label
    // to a screen reader. Written when the gauge is built and again when a
    // fork swaps two levels — the number on a stop stays, and the level
    // behind it changes. The depth on the card is the stop's place on the
    // line and does not move.
    function labelStop(button) {
        const level = Number(button.dataset.level)
        button.setAttribute("aria-label", levelTitle(level))
        button.querySelector(".sidebar__level-card-title").textContent = levelName(level) || "Level " + level
    }

    // The whole run on one line down the edge of the bar, filling as it is
    // answered and never going back. The depth rides the end of the fill, and
    // the levels are spaced evenly down it, each at the point it is finished —
    // every one of them opens, one still locked showing a blurred taste of what
    // finishing gives.
    function renderSidebar() {
        const soFar = depth()
        renderDepth(soFar)

        // How far along the line the fill reaches, whichever way it runs.
        $("descent-fill").style.setProperty("--reach", soFar.share * 100 + "%")

        // The landmarks passed are lit, and the deepest of any passed with
        // this answer waits to pop out with the next item (`renderQuestion`).
        // A branch closing can take the gauge back up a little; what has once
        // popped out does not do it again.
        marks.forEach((mark, at) => $("marks").children[at].classList.toggle("sidebar__mark--passed", mark.at <= soFar.metres))
        if (soFar.metres > sounded) {
            const fresh = marks.filter((mark) => mark.at > sounded && mark.at <= soFar.metres)
            if (fresh.length) passing = fresh[fresh.length - 1]
            sounded = soFar.metres
        }

        // The first level not yet finished is the one being answered.
        let current = null

        for (const button of $("levels").children) {
            const level = Number(button.dataset.level)
            const progress = levelProgress(level)
            const showing = panel === "results" && openLevel === level
            const now = current === null && !progress.unlocked
            if (now) current = level

            // The ring round the stop sweeps to the level's share.
            button.style.setProperty("--share", progress.share)
            button.classList.toggle("sidebar__level--unlocked", progress.unlocked)
            button.classList.toggle("sidebar__level--current", now)
            button.classList.toggle("sidebar__level--open", showing)
            // The card says where the level stands: finished and readable,
            // under way, or still ahead. The meter on it reads `--share` off
            // the button.
            button.querySelector(".sidebar__level-card-note").textContent = progress.unlocked
                ? "Unlocked · press to read"
                : now
                  ? progress.answered + " of " + progress.size + " answered"
                  : "Locked · " + progress.size + " question" + (progress.size === 1 ? "" : "s") + " ahead"
            button.setAttribute("aria-expanded", showing ? "true" : "false")
        }

        // The shelf is the other face of the same fact — a level finished
        // lights its stop and mints its badge — so the two bars are drawn
        // together and nothing has to remember to call both.
        renderShelf()
    }

    /* ------------------------------ the shelf ----------------------------- */

    // The bar down the left, and what accumulates on it. The gauge says how
    // far down the descent has got; the shelf says what it has turned up:
    // it opens with nothing on it but the way into the profile, and every
    // level finished mints a badge — a crop of the figure that level closed
    // on, drawn from the person's own answers. A badge is a second way into
    // the panel its stop on the gauge opens, and the two never disagree,
    // both being read off `levelProgress`.
    //
    // It is reconciled rather than rebuilt: a badge costs a whole section to
    // draw and throw away, this runs on every answer, and a badge nobody
    // touched should not be replaced under the pointer.
    // The first time the shelf is drawn, whatever is already finished is put
    // on it without a strike: that is a run carried on, whose badges were
    // earned before, and they are found there rather than won again.
    let shelved = false

    function renderShelf() {
        const wrap = $("badges")

        for (const level of scoredLevels) {
            const had = badgeFor(level)
            // Going back and changing the answer a branch hangs off can take
            // a level's last answer away with it, so a badge is only ever
            // there while the level behind it is finished.
            if (!levelProgress(level).unlocked) {
                if (had) had.remove()
                continue
            }
            if (had) {
                had.classList.toggle("shelf__badge--open", panel === "results" && openLevel === level)
                continue
            }
            place(wrap, mintBadge(level, !shelved))
        }
        shelved = true

        // The way into the profile is at the head of this bar, and it is a
        // badge like the rest: a ring round it filled to how much of the
        // whole-run web is drawn. `--share` is the same custom property a
        // stop on the gauge sweeps, so the two read alike, and the button is
        // told what it holds rather than working it out.
        const drawn = results.profileShare()
        const link = $("profile")
        link.style.setProperty("--share", drawn.share * 100)
        link.classList.toggle("shelf__link--whole", drawn.of > 0 && drawn.found === drawn.of)
        link.title = drawn.of ? drawn.found + " of " + drawn.of + " dimensions drawn" : "Your profile"
    }

    // In level order rather than in the order they were earned: the two are
    // the same walking down, and a badge taken off and put back by a changed
    // branch should go back where it was rather than on the end.
    function place(wrap, badge) {
        const level = Number(badge.dataset.level)
        let after = null
        for (const one of wrap.children) {
            if (Number(one.dataset.level) > level) {
                after = one
                break
            }
        }
        wrap.insertBefore(badge, after)
    }

    function badgeFor(level) {
        return document.querySelector('.shelf__badge[data-level="' + level + '"]')
    }

    function stopFor(level) {
        return document.querySelector('.sidebar__level[data-level="' + level + '"]')
    }

    function mintBadge(level, quiet) {
        const badge = document.createElement("button")

        badge.type = "button"
        badge.dataset.level = level
        badge.className = "shelf__badge"
        badge.style.setProperty("--tint", levelColour(level))
        // The figure inside says nothing a screen reader can use, and the
        // title is for the pointer: both point at the level itself.
        badge.title = levelTitle(level)
        badge.setAttribute("aria-label", levelTitle(level) + ", unlocked")

        const art = document.createElement("span")
        art.className = "shelf__badge-art"
        const figure = results.renderBadge(level)
        // A level may hold nothing drawn — then the badge is its number on
        // its own colour, which still says it was finished.
        if (figure) art.appendChild(figure)
        badge.appendChild(art)

        const number = document.createElement("span")
        number.className = "shelf__badge-number"
        number.textContent = level
        badge.appendChild(number)

        // Every way in is also the way out, the way a stop on the gauge is.
        badge.addEventListener("click", () => (panel === "results" && openLevel === level ? closePanel() : openResults(level, badge)))

        // Struck rather than found already there: it arrives because
        // something was finished, which is the whole of what this bar is for.
        // The class comes off again on `animationend` — its last frame would
        // otherwise hold the badge against the lift it gets on hover — and
        // only its own animation ends it, the figure inside having its own.
        if (!still() && !quiet) {
            badge.classList.add("shelf__badge--minted")
            badge.addEventListener("animationend", (event) => {
                if (event.target === badge) badge.classList.remove("shelf__badge--minted")
            })
            setTimeout(() => burst(badge, "#d9a441", { count: 10, reach: 26 }), MINT_FLASH)
        }
        return badge
    }

    const MINT_FLASH = 300 // ms into the strike that the gold comes off it

    // A level's results belong to the button that opens them: they grow out of
    // that point on the line and are drawn back into it on the way out, so the
    // button reads as where the level is kept. The point is written on as the
    // origin the scaling turns about, in the coordinates of the box `on` is
    // laid out in — the panel's own box is scaled down to nothing while it is
    // shut, and is no use for the sum.
    function markOrigin(on, within, from) {
        if (!from) return false

        const spot = from.getBoundingClientRect()
        const box = within.getBoundingClientRect()

        on.style.setProperty("--from-x", spot.left + spot.width / 2 - box.left + "px")
        on.style.setProperty("--from-y", spot.top + spot.height / 2 - box.top + "px")
        return true
    }

    function fromLevel(from) {
        markOrigin($("panel-results"), $("overlay"), from)
    }

    // The level screen leaves the same way the panel does: what was just read
    // is drawn into the button it can be read again from, and the survey is put
    // up once it has gone.
    const SUCK = 460 // ms the level takes to be drawn in

    function suckLevel(level, then) {
        const screen = $("screen-level")
        // Into the badge it has just minted, where there is one: what was
        // read goes onto the shelf. Failing that, into its stop on the gauge.
        if (still() || !markOrigin(screen, screen, badgeFor(level) || stopFor(level))) return then()

        screen.classList.add("screen--sucked")

        setTimeout(() => {
            screen.classList.remove("screen--sucked")
            then()
        }, SUCK)
    }

    // `sealed`, not `locked`: that name already means "ignore input while
    // advancing" everywhere else in this file, and this is a different lock.
    function openResults(level, from) {
        const progress = levelProgress(level)
        const sealed = !progress.unlocked
        openLevel = level
        // Whichever of the two it was opened from: a panel is drawn back into
        // the thing that let it out.
        openFrom = from || stopFor(level)
        fromLevel(openFrom)
        $("results-title").textContent = levelTitle(level)
        $("results-sub").textContent = sealed
            ? "Locked · " + progress.answered + " of " + progress.size + " answered"
            : "Reached at " + sounding(levelDepth(level))
        results.renderResults($("results-body"), level, sealed)
        openPanel("results")
    }

    function openProfile() {
        results.renderProfile($("profile-panel"))
        openPanel("profile")
    }

    /* ------------------------------- panels ------------------------------- */

    // A panel slides over the screen underneath, which stays where it was: the
    // page is never left, only covered. Every panel comes out from under the bar
    // the button that opened it sits on, and stops short of it.
    let openLevel = null // which level the results panel is showing
    let openFrom = null // and which button it grew out of: a stop, or a badge

    // Panels opened by a bar link of the same id, lit while theirs is up: the
    // profile, at the head of the shelf, named with the block it is written
    // in. The level buttons open the results panel, and are lit by
    // renderSidebar and renderShelf instead.
    const LINKED = { profile: "shelf__link" }

    function openPanel(name) {
        results.hideTip()
        panel = name

        for (const sheet of document.querySelectorAll(".panel")) {
            sheet.classList.toggle("panel--open", sheet.id === "panel-" + name)
        }
        $("overlay").classList.add("overlay--open")

        markSidebar()
        $("panel-" + name)
            .querySelector(".panel__close")
            .focus()
    }

    function closePanel() {
        if (!panel) return
        results.hideTip()

        // Taken again on the way out: the window may have been resized while
        // the level was open, and it should go back into where its button is
        // now rather than where it was.
        if (panel === "results" && openFrom) fromLevel(openFrom)

        panel = null
        openLevel = null
        openFrom = null

        for (const sheet of document.querySelectorAll(".panel")) sheet.classList.remove("panel--open")
        $("overlay").classList.remove("overlay--open")
        markSidebar()

        // The item was covered while the panel was up. Timing it from now keeps
        // the gap to the response it produces meaningful.
        if (screen === "survey") log[questions[index].key].timeOnset = new Date().toISOString()
    }

    // Which bar button, if any, is currently holding a panel open.
    function markSidebar() {
        for (const name in LINKED) {
            $(name).classList.toggle(LINKED[name] + "--open", panel === name)
            $(name).setAttribute("aria-expanded", panel === name ? "true" : "false")
        }
        renderSidebar()
    }

    // The account, top right, as the hub's dashboard draws it (its `drawMe`):
    // whose it is at a glance — nobody yet, an anonymous account (a ghost,
    // and a dot, being kept in this browser only) or an email — and the way to
    // the dashboard. Only where the link asks for the account. Drawn at load
    // and again once Start has signed in.
    const PERSON = "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0"
    const GHOST = "M6 20V11a6 6 0 0112 0v9l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5zM10 11h.01M14 11h.01"

    function drawAccount() {
        const pill = $("account")
        pill.hidden = !ACCOUNT.on
        if (!ACCOUNT.on) return
        const uid = ACCOUNT.who()
        const email = ACCOUNT.email()
        const avatar = document.createElement("span")
        avatar.className = email ? "avatar" : uid ? "avatar avatar--ghost" : "avatar avatar--none"
        if (email) avatar.textContent = email[0].toUpperCase()
        else {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
            svg.setAttribute("viewBox", "0 0 24 24")
            svg.setAttribute("aria-hidden", "true")
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
            path.setAttribute("d", uid ? GHOST : PERSON)
            svg.appendChild(path)
            avatar.appendChild(svg)
        }
        const label = document.createElement("span")
        label.className = "me__label"
        label.textContent = email || (uid ? "Anonymous" : "Sign in")
        pill.replaceChildren(avatar, label)
        // The dot says there is something to do, which there is not for an
        // account that is offered no email (one from Prolific).
        const unkept = !!uid && offersEmail()
        pill.classList.toggle("me--unkept", unkept)
        pill.title = unkept ? "Kept in this browser only: add an email to keep it" : ""
        pill.setAttribute(
            "aria-label",
            email ? "Your account, " + email : uid ? "Your anonymous account, kept in this browser only" : "Sign in",
        )
        pill.href = toHub(false)
    }

    // Whether keeping the account with an email is offered here: an
    // anonymous account (the hub's `offersEmail`, which says no to one that
    // has ever arrived from Prolific), on a link that is not Prolific's.
    function offersEmail() {
        return ACCOUNT.on && ACCOUNT.offersEmail() && PLATFORM !== "prolific"
    }

    // The way to the hub's dashboard, with the way back to here (`?back=`):
    // the run's own link while a run is kept, which the page coming back by
    // it carries on (asking first whose run it is, as any reload does), and
    // this page otherwise. `keep` opens the dashboard on adding an email.
    function toHub(toKeep) {
        const back = location.pathname + (keeping ? loadedSearch : location.search)
        return "../me/?account" + (toKeep ? "&keep" : "") + "&back=" + encodeURIComponent(back)
    }

    // **Keep your results**: the offer to add an email to the anonymous
    // account a run is kept on, at the moment it is worth most — a level's
    // results just opened, and the end of the run. Through the dashboard
    // (`toHub`), which is where an account is made and kept: the hub owns who
    // somebody is, and the way back brings the run back up. Offered by where
    // the link came from (the hub's AGENTS.md, **Who is offered what**): never
    // on Prolific's; on SONA's once the core is done, the part the credit is
    // for; on anybody else's from the first level. Put away for the rest of
    // the tab's visit by "Not now".
    const KEEP_LATER = "abyss:keep-later"

    function keepable() {
        if (!offersEmail() || !ACCOUNT.who()) return false
        try {
            if (sessionStorage.getItem(KEEP_LATER)) return false
        } catch (e) {}
        if (PLATFORM === "sona") return scoredLevels.filter(inCore).every((level) => levelProgress(level).unlocked)
        return true
    }

    function drawKeep() {
        const shown = keepable()
        for (const card of document.querySelectorAll(".keep")) {
            card.hidden = !shown
            card.querySelector(".keep__go").href = toHub(true)
        }
    }

    for (const later of document.querySelectorAll(".keep__later")) {
        later.addEventListener("click", () => {
            try {
                sessionStorage.setItem(KEEP_LATER, "1")
            } catch (e) {}
            for (const card of document.querySelectorAll(".keep")) card.hidden = true
        })
    }

    const PARTICLES = 14

    // A short spray of dots out of an element — the chosen response, the
    // headline of a level that has just opened, a results section coming out of its
    // seal. `how` makes it bigger than the one an answer gets.
    function burst(from, given, how) {
        if (!from || still()) return

        const many = (how && how.count) || PARTICLES
        const reach = (how && how.reach) || 40
        const style = getComputedStyle(from)
        const colour = given || style.getPropertyValue("--hover").trim() || style.backgroundColor
        const spot = from.getBoundingClientRect()
        const layer = document.createElement("div")
        layer.className = "burst"
        layer.style.left = spot.left + spot.width / 2 + "px"
        layer.style.top = spot.top + spot.height / 2 + "px"

        for (let i = 0; i < many; i++) {
            const angle = (Math.PI * 2 * i) / many + Math.random() * 0.5
            const distance = 30 + Math.random() * reach
            const particle = document.createElement("i")
            particle.style.setProperty("--x", Math.cos(angle) * distance + "px")
            particle.style.setProperty("--y", Math.sin(angle) * distance + "px")
            particle.style.background = colour
            particle.style.animationDelay = Math.random() * 70 + "ms"
            layer.appendChild(particle)
        }

        document.body.appendChild(layer)
        setTimeout(() => layer.remove(), 1000)
    }

    /* -------------------------- finishing a level ------------------------- */

    // Water breaks across the middle of the window when a level is finished. It
    // covers only a band of the screen, so the level is put up behind it as the
    // water crosses and rises in as it runs off.
    const CURTAIN_COVER = 560 // ms before the screen behind is changed, under the water
    const CURTAIN_HOLD = 1900 // ms the words stay up
    const CURTAIN_LIFT = 900 // ms the water takes to run off the screen

    function curtain(level, place, open) {
        const layer = $("curtain")
        let placed = false
        let lifted = false

        $("curtain-title").textContent = "Level " + level + " complete"
        // The floor is named when it is reached, since the way on from it is
        // through it; under it the water is not what is being sounded.
        $("curtain-depth").textContent =
            sounding(levelDepth(level)) + " down" + (beneath(level) ? " · in the rock" : level === floorLevel ? " · the floor" : "")

        layer.classList.remove("curtain--out")
        layer.hidden = false
        layer.classList.add("curtain--in")

        const cover = () => {
            if (placed) return
            placed = true
            place()
        }

        const lift = () => {
            if (lifted) return
            lifted = true
            cover() // impatience should not skip putting the screen up
            layer.classList.add("curtain--out")
            open()

            setTimeout(() => {
                layer.hidden = true
                layer.classList.remove("curtain--in", "curtain--out")
                layer.removeEventListener("click", lift) // it lifted on its own; the next level brings its own
            }, CURTAIN_LIFT)
        }

        // Anyone who has seen it once can wave it past.
        layer.addEventListener("click", lift, { once: true })
        setTimeout(cover, CURTAIN_COVER)
        setTimeout(lift, CURTAIN_HOLD)
    }

    let levelShowing = null // the level the level screen is holding, if any
    let levelLeft = false // whether the way on from it has been taken

    function completeLevel(level) {
        levelShowing = level
        levelLeft = false

        // A level's answers are all in, which is the moment worth staging: a
        // run left on the results screen it opens has still left a whole level
        // behind it. The frame goes again when the screen is left, with
        // whatever was voted and starred on it.
        stageFrame()
        keep()
        stow()

        $("level-title").textContent = "Level " + level + " Unlocked"
        $("level-name").textContent = levelName(level)

        results.renderResults($("level-results"), level, false)

        // The way on carries a blurred taste of the level it leads to, when
        // there is one with something to open: the closing level scores
        // nothing, so the last scored level is followed by nothing here. Where
        // the run forks, it carries a taste of each of the levels offered with
        // a way into any of them instead, and the one button is put away —
        // unless the next place opens on an interlude that offers the choice
        // itself, after it (`onwardIn`): then the way on is the one button,
        // and no taste, since what stands next is not yet decided.
        const offering = forkAfter(level)
        const waits = !!offering && !!onwardIn(level + 1)
        const fork = waits ? null : offering
        const screen = levelItem(level) // this screen's own item: what was read, and the way on that was taken
        const next = scoredLevels[scoredLevels.indexOf(level) + 1]
        $("level-next").hidden = true
        $("level-fork").hidden = !fork
        $("level-continue").hidden = !!fork
        if (fork) {
            renderFork(fork, $("level-paths"), (side, shown) => {
                if (screen.response !== null) return // a second press while the screen is leaving
                screen.response = takeFork(fork, side, shown)
                screen.timeResponse = new Date().toISOString()
                leaveLevel()
            })
        }
        // Named without its number: "Next" has already said where it falls.
        else if (next && !waits) results.renderTeaser($("level-next"), next, levelName(next), "", aboutMinutes(next))
        // From the floor, the way on is down through it rather than on.
        $("level-continue").textContent = level === floorLevel ? "Go beneath the floor →" : "Continue the test →"
        drawKeep()

        results.sealSections($("level-results"), $("level-foot"))
        renderSidebar()

        curtain(
            level,
            () => {
                showScreen("level")
                jump(0)
            },
            () => {
                // The screen's clock starts when its results are uncovered —
                // unless it has somehow been left already, which would stamp
                // an onset past its own response.
                if (screen && screen.timeResponse === null) screen.timeOnset = new Date().toISOString()
                burst($("level-title"), "#d9a441", { count: 24, reach: 90 })
                results.openSections($("level-results"), $("level-foot"))
            },
        )
    }

    // The briefing at the head of a place that offers the choice of what
    // stands there, after the interlude it ends, rather than the level screen
    // before it (`onward`, content/block_interim.js).
    const onwardIn = (level) => questions.find((question) => question.level === level && question.onward) || null

    // The levels offered, side by side, each as the taste the way on would
    // carry of it alone — its name over its blurred figures — with a way into
    // it underneath, and the one the timeline writes first marked as the
    // recommended one. Pressing one is the choice (`take`), and is what the
    // screen it is on is answered with: the level screen's item, or the
    // briefing that ends an interlude.
    function renderFork(fork, paths, take) {
        paths.innerHTML = ""

        // The places drawn for this choice, as level numbers: what is in them
        // is what the cards show, and taking one is swapping it into the slot
        // being filled. They are laid out in a random order, so the
        // recommended one is not always on the left, and as many across as
        // there are of them.
        const offered = offeredBy(fork)
        const first = offered.reduce((best, one) => (PLAN[one - 1].written < PLAN[best - 1].written ? one : best))
        const sides = shuffle(offered.slice())
        // What the person was shown, read now: the cards in the order they
        // stand on the page and the one marked, by key, since the swap that
        // taking one makes changes what every place holds.
        const shown = { offered: sides.map((side) => PLAN[side - 1].key), recommended: PLAN[first - 1].key }
        paths.style.setProperty("--paths", sides.length)
        paths.classList.toggle("level__paths--many", sides.length > 2)

        for (const side of sides) {
            const recommended = side === first
            const path = document.createElement("div")
            path.className = "level__path" + (recommended ? " level__path--recommended" : "")

            const tag = document.createElement("p")
            tag.className = "level__path-tag"
            tag.textContent = recommended ? "Recommended next" : ""
            path.appendChild(tag)

            const taste = document.createElement("div")
            taste.className = "level__next"
            results.renderTeaser(taste, side, "", PLAN[side - 1].name, aboutMinutes(side))
            taste.hidden = false // a level with no figure still has its name to show
            path.appendChild(taste)

            const go = document.createElement("button")
            go.type = "button"
            go.className = "btn"
            go.textContent = "Go this way →"
            go.addEventListener("click", () => take(side, shown))
            path.appendChild(go)
            paths.appendChild(path)
        }
    }

    // Two places change what they hold. **What is asked moves and where it is
    // asked does not**: `name`, `blocks` and `written` cross over, while
    // `beneath` and the level's own number stay with the place, so a swap
    // across the seabed sends one level down into the rock and brings the
    // other up into the water. The move is then made everywhere the order is
    // held at once — the plan, the run, the order the questionnaires read,
    // and the `level` stamped on every item moved, which is what the scoring,
    // the gauge and the results read a level off. Nothing in either level has
    // been answered when a choice is offered, so no answer moves. The
    // demographics a place opens on, and an interlude, are the place's
    // (`opening`), and stay: the level coming in lands behind them.
    function swapLevels(one, other) {
        const low = Math.min(one, other)
        const high = Math.max(one, other)

        // The key travels with what is asked, the way the name and the blocks
        // do: it is the level's identity in the saved file, not the place's.
        for (const field of ["key", "name", "blocks", "written", "minutes"]) {
            const held = PLAN[low - 1][field]
            PLAN[low - 1][field] = PLAN[high - 1][field]
            PLAN[high - 1][field] = held
        }

        const up = questions.filter((question) => question.level === low && !placed(question))
        const down = questions.filter((question) => question.level === high && !placed(question))
        const top = questions.indexOf(up[0])
        // The later run goes back first: splicing there leaves every index
        // before it where it was, so `top` still points at the earlier one.
        questions.splice(questions.indexOf(down[0]), down.length, ...up)
        questions.splice(top, up.length, ...down)
        for (const question of up) question.level = high
        for (const question of down) question.level = low

        RUN.splice(0, RUN.length, ...questions.map((question) => question.questionnaire).filter((name, at, all) => name && all.indexOf(name) === at))
        // The first item of the place now being entered, its demographics first.
        index = nextShown(questions.findIndex((question) => question.level === low))
        for (const button of $("levels").children) labelStop(button)
    }

    // The choice made: recorded, and the chosen level put in the slot being
    // filled — which is it and the level standing there changing places. A
    // level already standing there stays. The item waiting behind the level
    // screen is then the first of the chosen level, and the stops on the
    // gauge take the names they now hold. What is recorded is the level taken
    // and then the ones passed over, in the order the timeline writes them,
    // since which slot each was standing in says nothing to anybody; those
    // words are handed back, to be the answer of the screen the choice was
    // made on. How the cards were laid out and which was recommended go onto
    // the entry in `levels` of the level before the slot (`choices`), which is
    // what the pull of the recommendation and of a card's place is read from —
    // the level whose screen offers the choice, or, where an interlude offers
    // it instead, the level whose screen came before the interlude. That level
    // has been finished, so no swap can move it from its place.
    function takeFork(fork, side, shown) {
        const target = fork.slots[fork.at]
        const passed = offeredBy(fork)
            .filter((one) => one !== side)
            .sort((one, other) => PLAN[one - 1].written - PLAN[other - 1].written)
        // Read before the swap, or two cards would name the same level.
        const words = [PLAN[side - 1].name].concat(passed.map((one) => PLAN[one - 1].name))
        choices[target - 1] = { offered: shown.offered, recommended: shown.recommended, chosen: PLAN[side - 1].key }

        if (side !== target) {
            swapLevels(target, side)
            swaps.push([target, side])
        }

        fork.at += 1
        fork.offer = null // the next choice is drawn afresh
        renderSidebar()
        return words
    }

    // The choice made on the briefing that ends an interlude: taken as a level
    // screen's is, and saved as this briefing's answer, the way a level
    // screen saves its own — then on, the way passing any briefing goes on,
    // into the level chosen, which now stands next.
    function goOnward(fork, side, shown) {
        if (locked || screen !== "survey") return
        const question = questions[index]
        if (!question.onward || forkAfter(question.level - 1) !== fork) return // a second press, the choice already made
        const at = index
        const words = takeFork(fork, side, shown)
        // The swap puts the run at the head of the place, and the head of the
        // place is behind this briefing: it stays where it was, before the
        // stretch that moved.
        index = at
        const entry = log[question.key] || {}
        entry.response = words
        entry.timeResponse = new Date().toISOString()
        log[question.key] = entry
        stageItems([question.key])
        stageFrame()
        advance()
    }

    /* -------------------------------- flow ------------------------------- */

    // The last answer of the run is worth more than an option's worth of
    // particles: three sprays out of the item that ended it, one after another,
    // and only then the profile.
    const FINALE_STEP = 280 // ms between them
    const FINALE_COLOURS = ["#d9a441", "#22d3ee", "#7c5cff"]
    const CORE_SPRAY = 1500 // ms before the gold goes up out of the web, once the dark is off it

    function finale(then) {
        if (still()) return then()

        FINALE_COLOURS.forEach((colour, at) =>
            setTimeout(() => burst($("text"), colour, { count: 30, reach: 190 + at * 70 }), at * FINALE_STEP),
        )

        // Then the last of the three thresholds: the dark closes over the page,
        // the profile goes up behind it, and the web comes out of the middle as
        // it clears — the arrival at the bottom, not an announcement of one.
        setTimeout(() => gaze(then, CORE), FINALE_COLOURS.length * FINALE_STEP + 280)
    }

    // Only the item being shown can be answered. The option buttons of the one
    // before it are still in the survey screen while a level screen is up over
    // it, and they still call this.
    // Says whether the answer was taken, for a renderer that draws something
    // of its own on the press (the grid's beams) and must not on one refused.
    function answer(value) {
        if (locked || screen !== "survey") return false

        const question = questions[index]
        responses[question.key] = value

        if (!log[question.key]) log[question.key] = {}
        log[question.key].response = value
        log[question.key].timeResponse = new Date().toISOString()

        const pruned = pruneBranches() // this answer may have opened or closed one

        // Into the staged copy: this answer, and any a closing branch has just
        // taken away with it.
        stageItems([question.key].concat(pruned))
        keep()

        markSelection(value)
        renderSidebar() // every answer moves the descent on, including the last one

        // When a level was left with nothing outstanding. Stamped here rather
        // than on the level screen, which the last level of the run never shows,
        // and taken again if a branch reopens the level and it is finished twice.
        if (levelProgress(question.level).unlocked) levelTimes[question.level] = new Date().toISOString()

        // The spray comes out of whatever this kind of item is answered by.
        const chosen = SPRAYS[question.type](value)
        if (chosen) burst(chosen)

        // The answer stays lit and the burst clears before the item goes; what
        // is left of the delay is the fade out of it.
        locked = true
        const hold = HOLDS[question.type] || ADVANCE_DELAY
        setTimeout(() => $("screen-survey").classList.add("turning"), hold - TURN)

        // **The turn this answer takes belongs to it.** If anything has moved
        // the run on in the meantime — a level screen going up behind the fade,
        // a second press that got through while the lock was down — this
        // timeout is stale and does nothing at all: it neither unlocks nor
        // advances. Unlocking on a stale turn is what let the item behind a
        // level screen be answered, and advancing on one ended the run while
        // the last item was still on screen unanswered, which sent the file
        // without the answer to it.
        const turn = ++turns
        setTimeout(() => {
            if (turn !== turns) return
            locked = false
            advance()
        }, hold)
        return true
    }

    // On from whatever is showing: the next item, the level screen if that was
    // the end of a level, or the profile if it was the end of the run. Both
    // ways forward — answering an item, and reading a briefing and
    // leaving it — come through here, so a level ends the same way whichever
    // ended it.
    function advance() {
        const finished = questions[index].level
        const next = nextShown(index + 1)

        // Nothing left to answer: the run breaks up over the last item, and
        // then the whole web is the last screen — rather than an announcement
        // with the way to it. The answers leave for the repository at the
        // same moment, and the last screen says whether they got there.
        if (next === -1) {
            locked = true // there is nothing after this, and nothing to answer
            // Nothing is left to carry on, and what was kept is somebody's
            // answers on a device others may use. The account keeps the
            // summary, finished, so the dashboard can say so, and lets go of
            // the state in the same request; the browser's copy goes here
            // (`forgetRun`, told the account has been seen to).
            if (ACCOUNT.on && ACCOUNT.who()) {
                ACCOUNT.save({ summary: summary(true), done: finishedLevels(), state: null }).catch((e) => console.warn(e))
            }
            keeping = false
            forgetRun(true)
            saved("sending")
            save().then(
                () => saved("done"),
                () => saved("failed"),
            )
            finale(() => {
                results.renderProfile($("profile-done"))
                drawKeep()
                showScreen("done")
                jump(0)
                // The web is behind the dark while it clears, so the spray that
                // opens it waits for the dark to go rather than going up under it.
                setTimeout(
                    () => burst($("profile-done").querySelector(".chart"), "#d9a441", { count: 26, reach: 130 }),
                    still() ? 240 : CORE_SPRAY,
                )
            })
            return
        }

        index = next

        // A level ends: show what it unlocked before carrying on. The lock
        // stays on until the way out of the level screen is pressed — the water
        // takes a moment to cover the survey, and the item waiting behind it
        // has not been read yet. A level with nothing scored in it unlocked
        // nothing and has no screen, so the run goes straight on from it.
        if (questions[index].level !== finished && scoredLevels.indexOf(finished) !== -1) {
            locked = true
            completeLevel(finished)
        } else renderQuestion()
    }

    // A briefing has one possible response: leaving it by pressing its continue
    // button. Store that response and its completion time like any other item.
    //
    // The briefing that ends an interlude is left by the choice under it while
    // there is one to make, and not by this; passed again afterwards, on the
    // way back down to the level chosen, it keeps that choice as its answer.
    function passBriefing() {
        if (locked || screen !== "survey" || !isBriefing(questions[index])) return
        const question = questions[index]
        if (question.onward && forkAfter(question.level - 1)) return
        const entry = log[question.key] || {}
        if (!(question.onward && Array.isArray(entry.response))) {
            entry.response = $("briefing-go").textContent.trim()
            entry.timeResponse = new Date().toISOString()
            log[question.key] = entry
            stageItems([question.key])
        }
        advance()
    }

    function goBack() {
        const previous = locked ? -1 : previousShown(index - 1)
        if (previous === -1) return
        index = previous
        renderQuestion()
    }

    // The browser's own back button is a thumb going for the item before this
    // one, not for the way off the site — and leaving is at best a reload of
    // the page to carry on from (`keep`). Once the survey is up it keeps one spare history
    // entry under itself and puts that entry straight back whenever the button
    // eats it, which is the whole of the mechanism: back is then the previous
    // item, and at the first item it is nothing at all rather than the end of
    // the run. Nothing else on the page touches history, so a press can only
    // ever mean this.
    let trapped = false

    function trapHistory() {
        if (trapped) return
        trapped = true
        history.pushState({ abyss: true }, "")
    }

    window.addEventListener("popstate", () => {
        // Before the test starts, and on somebody else's card, back is still
        // the way out: nothing has been answered that leaving would cost.
        if (!trapped) return

        // The entry the press ate, put back. Browsers throttle `pushState`, and a
        // thumb going at the button faster than that is the very thing this is
        // here for, so a refusal must not take the rest of the handler with it.
        try {
            history.pushState({ abyss: true }, "")
        } catch (e) {
            trapped = false // the spare entry is gone; back is the way out again
        }

        // A panel is what the press was aimed at, the same as Escape or the ×.
        if (panel) {
            closePanel()
            return
        }

        // Anywhere else, `goBack` decides: it holds while a level screen is up
        // or the run has ended, and stops at the first item.
        goBack()
    })

    function download() {
        const url = URL.createObjectURL(new Blob([JSON.stringify(container(), null, 2)], { type: "application/json" }))
        const a = document.createElement("a")
        a.href = url
        // Filed under the same code the data inside it carries.
        a.download = FILENAME // the name the deposit would have given it, so a rescued file sorts with the rest
        a.click()
        URL.revokeObjectURL(url)
    }

    /* -------------------------------- saving ------------------------------ */

    // Where a run goes. DataPipe (pipe.jspsych.org) files what it is sent in
    // the repository its experiment ID is bound to — here a Zenodo deposit.
    // The same run is sent twice over, in two different ways, and it is the
    // second that counts.
    //
    // **As it is answered**, one record at a time: every item the moment it is
    // given, and the rest of the file — who is taking it, in what order, how
    // each level was answered — at the end of every level. DataPipe holds those
    // in a staging database of its own, and about fifteen minutes after
    // somebody stops answering it writes what it is holding for them into the
    // deposit as a `.partial.json`. Nothing here has to notice the leaving: the
    // connection itself is what says they have gone, so a tab closed halfway
    // down the descent leaves the half that was answered rather than nothing at
    // all. That is the whole reason for it — the run is long — and it is what
    // was parked here in September 2026, when a checkpoint meant a second file
    // under a second name and DataPipe refused a name it had already taken.
    //
    // **At the end**, the whole of `container()` in one piece, exactly as
    // "Download responses" would save it, so the two can never disagree — and
    // under the session's own id, which is what tells DataPipe that the records
    // it has been holding belong to a run that finished, and are to be dropped
    // rather than filed as a partial beside the complete one.
    //
    // The staging is best-effort and can never hold the run up: a session that
    // will not start says so in the console and disables itself, every call into
    // it swallows its own errors, and the file at the end goes whether any of it
    // worked or not.
    const DATAPIPE = "https://pipe.jspsych.org" // the service; the client puts its own `/api/…` on the end
    const DATAPIPE_EXPERIMENT = "C2mDNSFM3jAJ" // TestYourself, bound to a Zenodo deposit

    // The file's name at the far end is `<when>_<source>_<participant>.json`:
    // when first, so that a deposit lists in the order runs began, then where
    // the link was handed out, so that one study's files can be picked out of
    // the list by eye. The moment also keeps the name one nobody has used —
    // DataPipe refuses a name it has already taken, and a code brought in on
    // the link (`?participant=`) may come round twice. The source is cut down to what a
    // filename holds safely, with `_` kept for the gaps between the three. A
    // test run says what it is before any of it (`test_`), so that it can be
    // picked out and binned, which is what `data/collected/download.py` goes
    // on. It is worked out once rather than twice: the session is opened under
    // this name and the finished file is sent under it, and a partial left
    // behind is this name with the session's id after it.
    const FILENAME =
        (testMode ? "test_" : "") +
        timeStart.replace(/[-:]/g, "").slice(0, 15) + // 20260902T141530
        "_" +
        (source
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "") // the accents off, so "Zoë" is "Zoe" rather than "Zo-"
            .replace(/[^A-Za-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 40) || UNKNOWN_SOURCE) +
        "_" +
        participant +
        ".json"

    // The session the run is staged into, or null where the client is not on
    // the page. It is opened when the test begins rather than when the page
    // loads: somebody who read the landing page and left is not a participant,
    // and a session held open for them is one of the five hundred an experiment
    // may have at once.
    let session = null

    function openSession() {
        if (!window.DataPipe) return
        DataPipe.setBaseURL(DATAPIPE)
        session = DataPipe.createSession({ experimentID: DATAPIPE_EXPERIMENT, filename: FILENAME })
        stageFrame()
    }

    // One record into the staging database. Two kinds go in and each says which
    // it is: a `frame`, the saved file with the answers taken out of it, and an
    // `item`, one entry of that file's `items[]`. Read back, the last frame and
    // the last record under each key are a container with as much of a run in it
    // as was answered.
    function stage(kind, body) {
        if (!session) return
        session.record({ record: kind, ...body })
    }

    // The frame is the file itself with the items dropped rather than a second
    // thing built beside it, so a staged frame cannot drift from what the file
    // would have said. It carries the run's order, the level times, the quality
    // control, the votes and the stars — everything that is not an answer.
    function frame() {
        const file = container()
        delete file.items
        return file
    }

    // A frame that says nothing the last one did not is not staged: the way on
    // from a level screen can be pressed more than once while it is animating
    // away, and a record budget of a thousand is not something to spend on
    // saying the same thing twice. Items are not deduplicated — the same key
    // answered again is a new answer, even where it is the same answer.
    let lastFrame = null

    function stageFrame() {
        if (!session) return
        const body = frame()
        const written = JSON.stringify(body)
        if (written === lastFrame) return
        lastFrame = written
        stage("frame", body)
    }

    // A vote or a star given on a results screen goes out on its own, rather
    // than waiting for the level to be left: a results screen is where people
    // put the test down, and a tab closed there took everything voted on it
    // with it (three pilot runs of 23 September 2026 all stopped on one). It
    // waits for the pressing to settle, since stars are tried out and votes
    // taken back, and the frame deduplication above only catches a frame that
    // is the same as the last. What is still waiting when the tab is hidden is
    // staged then (see the wiring).
    const NOTED_DELAY = 1200
    let noting = null

    function noted() {
        clearTimeout(noting)
        noting = setTimeout(stageNoted, NOTED_DELAY)
        keep()
    }

    function stageNoted() {
        if (noting === null) return
        clearTimeout(noting)
        noting = null
        stageFrame()
    }

    // An item is staged as the file's own entry for it, found in the file rather
    // than made again here, for the same reason. One answered a second time —
    // gone back to, or a branch closing behind it and taking its answer with it
    // — is staged again, so what is read is the last record under that key, and
    // a branch closed after the fact reads as the null it ends as.
    function stageItems(keys) {
        if (!session) return
        const items = container().items
        for (const key of keys) {
            const entry = items.find((one) => one.key === key)
            if (entry) stage("item", entry)
        }
    }

    /* ----------------------------- carrying on ---------------------------- */

    // Where the run has got to, kept in this browser as it goes, so that a tab
    // closed halfway down — or reloaded — can be picked back up on the same
    // device (js/resume.js reads it back at load). It is written at the same
    // moments the run is staged, and on every item put on screen, and it is
    // small: the seed the run was dealt from, the answers as values, the fork
    // choices as swaps, where the run is and the times. Nothing is kept before
    // the test begins or after it ends, when the copy is let go of.
    //
    // It is not a second record of the run. What counts is what reaches the
    // deposit; this is only what the person needs to carry on, and a browser
    // that will not store it (a private window, full storage) takes the test
    // exactly as before, unkept.
    let keeping = false

    function keep() {
        if (!keeping) return
        const kept = {
            shape: RESUME_SHAPE,
            keptAt: new Date().toISOString(),
            seed: RUN_SEED,
            search: loadedSearch,
            dealt: dealt,
            participant: participant,
            timeStart: timeStart,
            timeResumed: timeResumed,
            screenLayout: display.screenLayout,
            screenLayouts: display.screenLayouts,
            // What the landing page says when it offers the run back.
            done: scoredLevels.filter((level) => levelProgress(level).unlocked).length,
            of: scoredLevels.length,
            index: index,
            levelShowing: levelShowing,
            levelLeft: levelLeft,
            swaps: swaps,
            forks: FORKS.map((fork) => fork.at),
            offers: FORKS.map((fork) => fork.offer),
            auto: questions.filter((question) => question.auto).map((question) => question.key),
            responses: responses,
            log: log,
            feedback: feedback,
            ratings: ratings,
            choices: choices,
            levelTimes: levelTimes,
            screens: levelItems.map((item) => ({
                level: item.level,
                response: item.response,
                timeOnset: item.timeOnset,
                timeResponse: item.timeResponse,
            })),
            sounded: sounded,
        }
        lastKept = kept
        try {
            localStorage.setItem(RESUME_KEY, JSON.stringify(kept))
            sessionStorage.setItem(RESUME_TAB, "1")
        } catch (e) {} // refused or full: the run goes on, unkept
    }

    // The same, sent to the participant's account on the lab's hub
    // (js/account.js, a pilot asked for by `?account`) as the app's state,
    // with the summary the hub's dashboard reads beside it — but only at the
    // end of a level and as the tab is hidden, not every time `keep()` is:
    // that is twice an item, several hundred writes a run, and a free plan
    // allows 20,000 a day. The one as the tab is hidden is `leaving`, sent so
    // that it outlives the tab, which caps it at 64 KiB: a long run's state
    // has outgrown that by its last levels, and stays as the end of the last
    // level saved it, the summary going on its own (js/account.js, `save`).
    let lastKept = null

    function stow(leaving) {
        if (!keeping || !lastKept || !ACCOUNT.on || !ACCOUNT.who()) return
        ACCOUNT.save({ summary: summary(false), done: finishedLevels(), state: lastKept, leaving: !!leaving }).catch((e) => console.warn(e))
    }

    // How long after a level is done the dashboard offers to take it again
    // (`retakeAfter`, in days): the gap between a test and its retest, which
    // is a decision of the research and not of the page — a month at least
    // (October 2026). Each retake is a run of its own in the deposit, under
    // the same `account`.
    const RETAKE_AFTER = 30

    // What the dashboard shows of this run (the hub's AGENTS.md, **The
    // summary**): the levels in the places they stand now, which are done,
    // which are the core, and the link to carry the run on. Nothing anybody
    // answered. A place a fork has yet to fill shows whatever stands in it,
    // which is not a promise of what will be chosen there.
    //
    // Beside the run, every level there is (`subtests`), and the link that
    // starts a run on any one of them (`pick`): the dashboard puts the level's
    // key for `{key}` and the keys of the levels done for `{done}`, so the run
    // opens on the level chosen and asks none of those again (`blocksIn`). It
    // walks `all`, whatever the run that wrote it walked, and says it came from
    // the hub (`source=hub`), since a run begun there was not counterbalanced
    // by the forks the way one walked from the start is.
    //
    // **The link that carries the run on is not the run's own link**, which
    // may carry a platform's id (`?pid=`), and the summary is what the
    // dashboard reads, so it names no id: it is the landing page asking for
    // the account, which finds the run kept in this browser or on the account
    // (`fetchKept`) and offers it, and its "Carry on" loads the run's own
    // link from what was kept. "Start" there instead is a run from the hub.
    function summary(finished) {
        return {
            title: "The Abyss Test",
            url: location.origin + location.pathname + "?account&source=hub" + (testMode ? "&test=true" : ""),
            finished: finished,
            levels: scoredLevels.map((level) => ({
                key: levelKey(level),
                name: levelName(level),
                done: levelProgress(level).unlocked,
                core: inCore(level),
            })),
            subtests: SUBTESTS,
            pick: location.origin + location.pathname + "?account&source=hub" + (testMode ? "&test=true" : "") + "&start={key}&skip={done}",
            retakeAfter: RETAKE_AFTER,
        }
    }

    // Every level there is to take, for the dashboard's tiles: `all`'s, which
    // is everything but the levels a link alone reaches (ASIDE: the Hyborian
    // hero, Light & Dark and Sexuality, met only by a link that names them,
    // `?start=`) and the closing. The levels outside its fork first
    // (General), then the rest by name, the same on every load, the
    // timeline's own order being drawn. Each with its picture (`preview`):
    // the README's, the level's results at stand-in scores (assets/readme/,
    // named by key), so the tile shows what the level gives back. A level
    // without one is drawn without.
    const README_PICTURES = location.origin + location.pathname.replace(/[^/]*$/, "") + "assets/readme/"
    const SUBTESTS = (() => {
        const levels = BATTERIES.all.filter(
            (entry) => entry.key && !entry.interlude && entry.blocks.indexOf("closing") === -1 && !entry.blocks.every((name) => ASIDE.indexOf(name) !== -1),
        )
        const first = levels.filter((entry) => !entry.fork)
        const rest = levels.filter((entry) => entry.fork).sort((a, b) => a.name.localeCompare(b.name))
        return first.concat(rest).map((entry) => ({
            key: entry.key,
            name: entry.name,
            minutes: entry.minutes || null,
            preview: README_PICTURES + entry.key.toLowerCase() + ".jpg",
        }))
    })()

    // The levels finished in this run, which the account keeps beside those
    // of every run before it (the summary's `done`, merged and never written
    // over): when each was finished, and the link that draws its results again
    // from its scores alone, as the participant's own (`levelLink`, results.js).
    // The scores go to the account, the answers never do.
    function finishedLevels() {
        const done = {}
        for (const level of scoredLevels) {
            if (!levelProgress(level).unlocked || !levelTimes[level]) continue
            done[levelKey(level)] = { at: new Date(levelTimes[level]), results: results.levelLink(level, true) }
        }
        return done
    }

    // A kept run put back: the forks replayed onto the plan, so every level
    // stands where it stood, then the answers, the times, the votes and the
    // stars, and where the run had got to. The run was dealt from the same
    // seed out of the same content (`dealt`, checked above), so every key
    // kept is an item of this run.
    function restore(kept) {
        for (const [target, side] of kept.swaps) {
            swapLevels(target, side)
            swaps.push([target, side])
        }
        kept.forks.forEach((at, n) => {
            if (FORKS[n]) FORKS[n].at = at
        })
        // A choice already drawn and not yet made; a run kept before choices
        // were drawn has none, and draws its next one when it comes.
        ;(kept.offers || []).forEach((offer, n) => {
            if (FORKS[n] && offer) FORKS[n].offer = offer
        })
        const auto = new Set(kept.auto)
        for (const question of questions) if (question.auto || auto.has(question.key)) question.auto = auto.has(question.key)

        Object.assign(responses, kept.responses)
        Object.assign(log, kept.log)
        Object.assign(choices, kept.choices)
        Object.assign(levelTimes, kept.levelTimes)
        // Only the readings and levels this run has, which is all of them.
        for (const key in feedback) if (key in kept.feedback) feedback[key] = kept.feedback[key]
        for (const key in ratings) if (key in kept.ratings) ratings[key] = kept.ratings[key]
        for (const one of kept.screens) {
            const screen = levelItem(one.level)
            if (screen) Object.assign(screen, { response: one.response, timeOnset: one.timeOnset, timeResponse: one.timeResponse })
        }

        index = kept.index
        levelShowing = kept.levelShowing
        levelLeft = kept.levelLeft
        sounded = kept.sounded || 0
    }

    // The run carried on, on a page loaded to do it. A new session is opened
    // for it — the first one was closed with the tab — and everything already
    // answered is staged into it again, so that its partial, should this one be
    // left too, is the whole run so far rather than the part answered since.
    // Consent was given when the run began and is not asked again. Then the
    // run is put back where it was: the level screen it was left on, or the
    // item.
    function carryOn() {
        keeping = true
        openSession()
        // Not what a test run answered for itself, which is never staged.
        const standIns = new Set(questions.filter((question) => question.auto).map((question) => question.key))
        stageItems(
            container()
                .items.filter((entry) => entry.response !== null && !standIns.has(entry.key))
                .map((entry) => entry.key),
        )

        if (levelShowing !== null && !levelLeft) {
            locked = true
            completeLevel(levelShowing)
            showScreen("level") // under the water from the start, not the landing page
        } else {
            showScreen("survey")
            renderQuestion()
        }
        jump(0)
        renderSidebar()
        keep()

        // The back button is held once somebody has done something on the
        // page: Chrome skips over an entry pushed without a gesture behind it.
        for (const kind of ["pointerdown", "keydown"]) document.addEventListener(kind, trapHistory, { once: true })
        if (!RESUME_CHOSEN) welcomeBack()
    }

    // Asked as a reload brings the run back up: whose run this is. A reload
    // carries on without a word, and the screen may be in front of somebody
    // else by then — a shared computer, a tab left open — so the page is held
    // behind one card until the question is answered. Carrying on takes the
    // card away and starts the clock on what it covered again, since the time
    // spent reading it is no reaction to the item. Starting from the start
    // lets the kept run go and loads the link the run began from without any
    // shared card in it, as a page that never saw the run; what was already
    // answered stays in the deposit as the partial of a run left, like any
    // closed tab. Not asked after "Carry on" on the landing page, which is
    // this question answered already (`RESUME_CHOSEN`).
    let welcoming = false

    function welcomeBack() {
        $("welcome").hidden = false
        welcoming = true
        $("welcome-go").focus()

        $("welcome-go").addEventListener("click", () => {
            $("welcome").hidden = true
            welcoming = false
            const now = new Date().toISOString()
            if (screen === "survey" && log[questions[index].key]) log[questions[index].key].timeOnset = now
            const reading = levelShowing !== null && !levelLeft ? levelItem(levelShowing) : null
            if (reading && reading.timeOnset && reading.timeResponse === null) reading.timeOnset = now
        })
        $("welcome-again").addEventListener("click", () => {
            keeping = false // or hiding the page would keep the run again on the way out
            forgetRun()
            const query = new URLSearchParams(loadedSearch)
            dropCard(query)
            const rest = query.toString()
            location.replace(location.origin + location.pathname + (rest ? "?" + rest : ""))
        })
    }

    // A run kept in this browser, offered back on the landing page: carrying
    // it on loads the link it began from with this tab marked, and the page
    // that comes up picks it up (js/resume.js); starting again lets it go.
    function offerResume() {
        if (!KEPT_RUN) return fetchKept()
        $("resume").hidden = false

        $("resume-go").addEventListener("click", () => {
            try {
                sessionStorage.setItem(RESUME_TAB, "chosen") // carried on by choice: no need to ask again
            } catch (e) {}
            location.replace(location.origin + location.pathname + KEPT_RUN.search)
        })
        $("resume-drop").addEventListener("click", () => {
            forgetRun()
            $("resume").hidden = true
        })
    }

    // No run kept in this browser, but one on the account: it is written into
    // this browser as if it had been kept here, and the page loaded again,
    // which then offers it like any other (js/resume.js reads it at load, and
    // can only read it at load). **An account keeps a run longer than a
    // browser does** (`KEPT_ON_ACCOUNT`, a month, against the browser's week),
    // since carrying on later on another device is what it is for: one
    // fetched is dated now, as a run touched now, so that js/resume.js takes
    // it — or the page would load again for ever. One past the month, or of
    // another shape, is let go of on the account too, so that the dashboard
    // stops offering to carry it on.
    function fetchKept() {
        if (!ACCOUNT.on || !ACCOUNT.who()) return
        ACCOUNT.loadState()
            .then((kept) => {
                if (!kept) return
                if (kept.shape !== RESUME_SHAPE || !(Date.now() - new Date(kept.keptAt).getTime() < KEPT_ON_ACCOUNT)) {
                    return ACCOUNT.dropState()
                }
                localStorage.setItem(RESUME_KEY, JSON.stringify(Object.assign(kept, { keptAt: new Date().toISOString() })))
                location.reload()
            })
            .catch((e) => console.warn(e))
    }

    // The end of the run. The whole file goes under the session — which is what
    // tells DataPipe that the records it has been holding belong to a run that
    // finished — and the session is closed behind it: closed as submitted,
    // which is what drops the staged copy rather than leaving it to be filed as
    // a partial fifteen minutes later.
    //
    // **Handing the session to `saveData` is the whole of the waiting.** The
    // client waits on `session.ready()`, which is the session having *started*
    // and nothing else — not the staged writes, which go over a database
    // connection of their own and have their timers throttled to a crawl behind
    // a tab that is not in front. A run finished in the background used to sit
    // on "Saving your answers…" for the best part of a minute for that reason
    // (tested 22 September 2026), and a flush raced against a four-second
    // timeout stood here until the client learned to do it properly
    // (datapipe-client 0.2.0, which added `ready()` and this `session`
    // parameter for exactly this). Nothing about the staging may hold the file
    // up, and now nothing can.
    //
    // It goes once, when the last item is answered: nothing after that changes
    // an answer. The one thing it can miss is an agree/disagree or a rating
    // given on a level reopened after the end, which is accepted rather than
    // sent twice — a filename is taken once at the far end, and a second copy
    // would be refused.
    // **The run is sent once, however many times the end of it is reached.**
    // `advance()` can arrive at the last item more than once — the survey
    // screen is still up while the finale runs, and the way out of that item
    // can be pressed again before the dark closes over it — and a second file
    // under the same name would be refused (`FILE_EXISTS`), which would put
    // "could not be sent" on the screen of somebody whose answers had just
    // arrived. A second call gets the first one's promise, and so the first
    // one's outcome.
    let sending = null

    function save() {
        if (!sending) sending = sendRun()
        return sending
    }

    async function sendRun() {
        stageFrame()

        const sent = await send(JSON.stringify(container(), null, 2))

        // Closing as submitted is what drops the staged copy rather than
        // leaving it to be filed as a partial a quarter of an hour later; it
        // flushes what is still staged on its way out. It is not waited on: the
        // file has gone, and holding "Saving your answers…" on screen for the
        // sake of tidying up behind it would be the staging costing the person
        // something again. It takes about a tenth of a second, so a tab shut on
        // the instant is the only way it does not finish — and what that costs
        // is a partial filed beside a complete run, under the same name, which
        // is noise rather than a lost answer.
        if (session) session.close({ submitted: sent.ok }).catch(() => {})
        // What the last screen says goes by whether it arrived and nothing
        // else. A refusal carries a reason with it (`FILE_EXISTS`,
        // `EXPERIMENT_FINALIZED`, …), which is worth having in the console of
        // whoever is looking: a status alone says a file did not land and not
        // which of the several quite different things went wrong.
        if (!sent.ok) {
            console.warn("DataPipe refused the file: " + sent.status, sent.body)
            throw new Error("DataPipe answered " + sent.status)
        }
    }

    // The client does the sending: it gzips what it is handed, tries again in
    // the background if the first attempt does not land, and answers with the
    // outcome rather than throwing. Without it on the page the same thing is a
    // plain POST, which is the whole of the fallback — a missing file should
    // cost the staging, not the data.
    function send(data) {
        const body = { experimentID: DATAPIPE_EXPERIMENT, filename: FILENAME, data: data }
        // The session goes with it rather than its id: the client waits for the
        // session to have started and puts the id on the request itself, which
        // is what a hand-built one would have to do with `ready()` and
        // `sessionId`. The plain POST below is hand-built, and has no id to put
        // on — the fallback is for a client missing from the deploy, and a
        // session cannot have been opened without one either.
        if (window.DataPipe) {
            return DataPipe.saveData(session ? { ...body, session } : body)
        }
        return fetch(DATAPIPE + "/api/data/", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "*/*" },
            body: JSON.stringify(body),
        }).then(
            (reply) => ({ ok: reply.ok, status: reply.status }),
            () => ({ ok: false, status: 0 }),
        )
    }

    // What the last screen says about it. The run saves itself — every answer
    // as it is given and the whole file at the end — so there is nothing here
    // for a participant to keep, and the download is not offered. It is the
    // way out of a failed send and nothing else: the answers are still in the
    // page, and this is how they get to somebody. Uncovered here and nowhere.
    function saved(state) {
        const note = $("save-note")
        note.classList.toggle("save__note--done", state === "done")
        note.classList.toggle("save__note--failed", state === "failed")
        note.textContent =
            state === "done"
                ? "Your answers have been saved. Thank you for taking part."
                : state === "failed"
                  ? "Your answers could not be sent. Please download them below and email the file to D.Makowski@sussex.ac.uk."
                  : "Saving your answers…"
        $("download").hidden = state !== "failed"
    }

    /* ------------------------------- results ----------------------------- */

    // Everything results.js is allowed to reach. It reads the run and the
    // scores, and borrows the two pieces of chrome — the screens and the
    // particles — that a result arrives with.
    const results = makeResults({
        $: $,
        RUN: RUN,
        CHARTS: CHARTS,
        dimensions: dimensions,
        dimensionOrder: dimensionOrder,
        feedback: feedback,
        ratings: ratings,
        // What a level's stars are filed under. `results.js` asks rather than
        // works it out, so how a rating is keyed is decided in one place.
        ratingKey: levelKey,
        score: score,
        total: total,
        // Answered and not scored, too many of its items declined.
        declined: declined,
        percentile: percentile,
        tercile: tercile,
        levelProgress: levelProgress,
        // One answer as given, read-only: what the star sign on level 1 is
        // read from. Scores stay the way results.js reads the rest.
        answer: (key) => (visitor ? visitor.answers[key] : responses[key]),
        // Somebody else's results from a link: what score, total and answer
        // read while they are on screen (see `visitor`).
        visit: (shown) => {
            visitor = shown
        },
        // A vote or a star has been given or taken back: stage it (`noted`).
        noted: noted,
        // Where this run's link was handed out, which a link it shares carries
        // on with `_shared` after it (`SHARED_SOURCE` in results.js).
        source: source,
        showScreen: showScreen,
        burst: burst,
        still: still,
    })

    /* ------------------------------- wiring ------------------------------ */

    // A tab hidden is the last moment a page can be sure of being able to do
    // anything, so a vote still waiting to be staged goes now.
    // So is keeping where the run has got to. A tab coming back may find the
    // account changed in another (an email added on the dashboard), and
    // draws it again.
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState !== "hidden") {
            drawAccount()
            drawKeep()
            return
        }
        stageNoted()
        keep()
        stow(true)
    })

    document.addEventListener("keydown", (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return

        // Nothing behind the welcome card is answered while it is up. Tab goes
        // between its two buttons and nowhere else, and Enter or Space press
        // the one that has focus, as a button does.
        if (welcoming) {
            if (e.key === "Tab") {
                e.preventDefault()
                ;(document.activeElement === $("welcome-go") ? $("welcome-again") : $("welcome-go")).focus()
            } else if (e.key !== "Enter" && e.key !== " ") e.preventDefault()
            return
        }

        // A panel takes the keyboard: the survey behind it is not being read.
        // It says `aria-modal`, so Tab is held inside it too — off the end of
        // the panel is back to its start, not out into the page underneath.
        if (panel) {
            if (e.key === "Escape") closePanel()
            else if (e.key === "Tab") {
                const sheet = $("panel-" + panel)
                const stops = sheet.querySelectorAll("button, a[href], input, [tabindex]:not([tabindex='-1'])")
                if (!stops.length) return

                const first = stops[0]
                const last = stops[stops.length - 1]

                if (!sheet.contains(document.activeElement) || (e.shiftKey && document.activeElement === first)) {
                    e.preventDefault()
                    ;(e.shiftKey ? last : first).focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
            return
        }

        // A field being typed into owns its own keys, digits and arrows alike.
        if (screen !== "survey" || (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName))) return

        const question = questions[index]

        // A briefing has nothing to answer, so the only key that
        // carries it on is the one that means "yes, on we go" — except on a
        // card of the choice that ends an interlude, or a link in the words
        // (the debrief's, the credit), which own their keys, as any button or
        // link does.
        if (isBriefing(question)) {
            if (e.target && e.target.closest && e.target.closest("#briefing-paths, #briefing-body a")) return
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault() // space would scroll the screen instead
                passBriefing()
            } else if (e.key === "ArrowLeft") {
                goBack()
            }
            return
        }

        // Several answers may be true at once, so a digit latches one instead
        // of taking the item, and Enter is what says the list is finished.
        // Pressing the buttons is how it goes through the same latching the
        // pointer does, rather than a second copy of it here.
        if (question.type === "multi") {
            const buttons = $("options").querySelectorAll(".option[data-value]")
            const pressed = Number(e.key)
            if (pressed >= 1 && pressed <= buttons.length) buttons[pressed - 1].click()
            else if (e.key === "Enter") $("options").querySelector(".option--go").click()
            else if (e.key === "ArrowLeft") goBack()
            return
        }

        // Only a choice is answered by position. A slider's options are its
        // ways out, and a digit meant for the line must not take one; a grid
        // has more cells than there are digits, and is answered by Tab.
        const options = question.type === "choice" ? offered(question) : []
        const n = Number(e.key)
        // An option that is one letter — a lettered candidate, the next letter
        // of a series — is answered by its letter as well as by its position.
        const letter = /^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey ? e.key.toUpperCase() : null
        const lettered = letter === null ? -1 : options.findIndex((one) => worded(one.text) === letter)
        if (n >= 1 && n <= options.length) {
            answer(options[n - 1].value)
        } else if (lettered !== -1) {
            answer(options[lettered].value)
        } else if (e.key === "ArrowLeft") {
            goBack()
        }
    })

    // The form has to have been read to the end before it can be agreed to. A
    // form short enough not to scroll has been read as soon as it is on screen.
    // Reaching the end is what turns the button into the way in.
    function checkConsent() {
        const form = $("consent")
        const read = form.scrollTop + form.clientHeight >= form.scrollHeight - 8
        // A test run has nobody to consent to anything, and reading the form is
        // the one part of the way in that cannot be waved past.
        if (!read && !testMode) return

        $("start").disabled = false
        $("start").textContent = "Start the test"
        $("consent-hint").textContent = testMode ? "Test mode: consent is not being taken." : "You have reached the end of the form."
        $("consent-hint").classList.add("consent__hint--read")
    }

    $("consent").addEventListener("scroll", checkConsent)
    window.addEventListener("resize", checkConsent)
    checkConsent()

    // The title sinks as the page is scrolled off it, so that what is left by
    // the time the form is in view is the form.
    function sinkHero() {
        if (screen !== "intro") return
        const gone = Math.min(1, window.scrollY / ($("hero").offsetHeight * 0.72))
        $("hero").style.setProperty("--gone", gone.toFixed(3))
    }

    window.addEventListener("scroll", sinkHero, { passive: true })

    const SHOWCASE_BEAT = 2600 // ms a landing-page figure holds before the next fades in

    // The landing page's taste of the far end: the figures the levels close
    // on, one at a time in one frame, each drawn from stand-ins, cycling only
    // while the intro is up and the tab is looked at. Under
    // prefers-reduced-motion the first one stays.
    function showcase() {
        const frame = $("why-frame")
        const slides = results.renderShowcase()
        if (!slides.length) return

        slides.forEach((figure, at) => {
            const holder = document.createElement("div")
            holder.className = "why__slide" + (at === 0 ? " why__slide--on" : "")
            holder.appendChild(figure)
            frame.appendChild(holder)
        })
        if (still() || slides.length < 2) return

        let at = 0
        setInterval(() => {
            if (screen !== "intro" || document.hidden) return
            frame.children[at].classList.remove("why__slide--on")
            at = (at + 1) % slides.length
            frame.children[at].classList.add("why__slide--on")
        }, SHOWCASE_BEAT)
    }

    /* --------------------------- the way in ------------------------------ */

    // The line the test is named after, held on screen once before the first
    // question. Any click or key cuts it short.
    const GAZE_HOLD = 6600 // ms the quote is left up for
    // A crossing carries a sentence under its two lines, and a sentence wants
    // reading rather than glancing at: the layer is held longer where there is
    // one. A click or a key still cuts either short.
    const GAZE_READ = 9200
    const GAZE_FADE = 1900 // ms it takes to clear, the words going before the dark

    // The words the same layer closes over the page with on the way through
    // the floor, leaving the last level in the water for the first beneath it —
    // and again at the bottom of the rock, where the run ends and the whole-run
    // web comes up out of the dark the way the first question did. Three
    // thresholds, one device: the surface, the seabed and the core.
    // `said` is the one line either of these carries under the two big ones,
    // and it is what makes the crossing mean something rather than being an
    // animation between two questions: everything above the floor asked what
    // somebody is like, and what is under it is what the rest is for.
    const CROSSING = {
        lines: ["The water ends here.", "The descent does not."],
        said: "Everything above this was the surface of you. What lies under it is what the rest of the descent is for.",
        by: "The floor · " + sounding(DEEPEST),
        dress: "gaze--rock",
    }
    // The core carries no depth: the run is over, and how far down it went is
    // the last thing the profile behind this wants said over it.
    const CORE = {
        lines: ["The descent ends here.", "What is at the centre is you."],
        by: "The core",
        dress: "gaze--core",
    }

    // The quote written in the page (the Nietzsche line, on the way in) unless
    // the caller brings `words` of its own — the crossing, or the core — which
    // are written over it and stay: the way in comes first and only once.
    function gaze(then, words) {
        const layer = $("gaze")
        const survey = $("screen-survey")
        let over = false

        if (words) {
            const lines = layer.querySelectorAll(".gaze__line")
            words.lines.forEach((line, at) => (lines[at].textContent = line))
            layer.querySelector(".gaze__by").textContent = words.by
        }
        // The way in is a quotation and explains itself; a crossing is a place
        // and does not, so only the ones that bring a line show one.
        const said = $("gaze-said")
        said.textContent = (words && words.said) || ""
        said.hidden = !said.textContent
        layer.classList.remove("gaze--rock", "gaze--core")
        if (words) layer.classList.add(words.dress)

        // The first item goes up behind the quote, while it is still opaque, so
        // that what the fade uncovers is the question and never the page the
        // quote was called from. It comes up out of the dark as the quote
        // clears rather than being handed over whole.
        const finish = () => {
            if (over) return
            over = true
            document.removeEventListener("keydown", finish, true)

            then()
            // Whatever `then` put up is what the dark clears onto — the survey
            // twice, and the finished run's profile at the bottom.
            const arriving = document.querySelector(".screen--active") || survey
            arriving.classList.add("screen--arriving")
            document.body.classList.remove("sinking") // the water below the form goes with it
            jump(0) // the descent is over; the item starts at the top
            layer.classList.add("gaze--out")

            // The arrival is left on the screen. Taking it off would put the
            // ordinary screen animation back in its place, and that counts as a
            // new animation: the item would fade in a second time, a second and
            // a half after arriving. `showScreen` clears it the next time it
            // has a screen to put up.
            setTimeout(() => {
                layer.hidden = true
                layer.classList.remove("gaze--out")

                // The item was under the fade until now. Timing it from here
                // keeps the gap to the response it produces a reaction time.
                // At the core there is no item left, which is the whole point
                // of that one, so there is nothing to stamp.
                const waiting = questions[index] && log[questions[index].key]
                if (waiting) waiting.timeOnset = new Date().toISOString()
            }, GAZE_FADE)
        }

        layer.hidden = false
        layer.addEventListener("click", finish, { once: true })
        document.addEventListener("keydown", finish, true)
        setTimeout(finish, words && words.said ? GAZE_READ : GAZE_HOLD)
    }

    // Agreeing to take part carries on down rather than going back up: pressing
    // the button opens more water under the form and the page keeps sinking
    // into it while the quote closes over the top.
    $("start").addEventListener("click", () => {
        // Consent has been given and the run is about to begin, which is where
        // the answers start going out as they are given rather than at the end,
        // and where it is kept as it goes. A run kept from before is let go of:
        // this one takes its place.
        openSession()
        $("resume").hidden = true
        keeping = true
        keep()
        // An account to keep the run on, where the link asks for one: signed
        // into anonymously, and only the first time in this browser. A link
        // that brought a platform's id claims it for the account, so that the
        // same id arriving on a second one is told apart (what to show it then
        // is not built yet, and the run goes on). It is claimed under the
        // platform's name (`PLATFORM`), so `SONA` and `sona` are one claim.
        // Once signed in, the frame goes again with the account's code in it
        // (`container`), so that a run left in its first level still says
        // whose it was.
        if (ACCOUNT.on) {
            ACCOUNT.signIn(source)
                .then(() => {
                    drawAccount()
                    stageFrame()
                    return inLink("participant") ? ACCOUNT.claim(PLATFORM, participant) : null
                })
                .then((claim) => {
                    if (claim === "taken") console.warn("account: this participant id is already claimed by another account")
                })
                .catch((e) => console.warn(e))
        }

        document.body.classList.add("sinking")
        // Reading the height settles the water that class just opened, so the
        // scroll below has the whole of it to run down.
        const bottom = document.documentElement.scrollHeight
        window.scrollTo({ top: bottom, behavior: still() ? "instant" : "smooth" })

        gaze(() => {
            showScreen("survey")
            renderQuestion()
            trapHistory() // from here on the back button means the previous item
        })
    })

    $("back").addEventListener("click", goBack)
    $("briefing-go").addEventListener("click", passBriefing)
    $("download").addEventListener("click", download)
    // Every way in is also the way out: pressing a lit button shuts what it lit.
    $("profile").addEventListener("click", () => (panel === "profile" ? closePanel() : openProfile()))
    drawAccount()
    // The way out of the level screen — the one button, or either side of a
    // fork: the screen is drawn into its stop on the gauge and the item waiting
    // behind it is put up.
    function leaveLevel() {
        // A level screen is left once. The way on stays pressable while the
        // screen is being sucked away, and every press past the first would
        // put the survey up again when its own animation ended — from the
        // floor, when its own crossing did, nine seconds later, over whatever
        // was on screen by then, and unlocked.
        if (levelLeft) return
        levelLeft = true
        const crossing = levelShowing === floorLevel

        // The way on, as this screen's answer. A fork has written the choice
        // already when a card was pressed; the one button writes its own
        // words, the way a briefing does.
        const screen = levelItem(levelShowing)
        if (screen && screen.response === null) {
            screen.response = $("level-continue").textContent.trim()
            screen.timeResponse = new Date().toISOString()
        }

        // The level screen is an item and is staged like one, and the frame
        // goes with it: the level is over, so what it was worth — its time, how
        // it was answered, the votes and the stars its results were given — is
        // settled, and a run abandoned further down still carries it.
        if (screen) stageItems([screen.key])
        stageFrame()
        keep()
        stow()

        suckLevel(levelShowing, () => {
            const resume = () => {
                locked = false // the item behind the level screen is being read again
                showScreen("survey")
                renderQuestion()
                jump(0)
            }
            // Leaving the floor goes down through it: the line closes over the
            // page the way the quote did on the way in, and the first item of
            // the level beneath comes up out of it.
            if (crossing) gaze(resume, CROSSING)
            else resume()
        })
    }

    $("level-continue").addEventListener("click", leaveLevel)

    // The strip of page left showing beside a panel is the way out of it.
    $("scrim").addEventListener("click", closePanel)
    for (const button of document.querySelectorAll("[data-close]")) button.addEventListener("click", closePanel)

    // Leaving somebody else's card puts the page back to the one everybody
    // else lands on, link and all, so that taking the test starts from scratch.
    // The scores on screen were the link's, and are let go of before anything
    // of the visitor's own can be answered. (The run's `source` was read when
    // the page loaded, from the link, which says `shared`.)
    //
    // Somebody sent one level's results is shown that level first: the page is
    // loaded again with `?start=` naming its first block, since the run's order
    // is settled from the link when the page loads (`PLAN`) and cannot be
    // rearranged under it. The link's own scores go and the rest of it — the
    // source, above all — stays.
    //
    // Somebody looking at their own results, opened from the hub's dashboard,
    // goes back there.
    $("visit-start").addEventListener("click", () => {
        if (visitingLevel && visitingLevel.own) {
            location.assign("../me/?account")
            return
        }
        if (visitingLevel) {
            const query = new URLSearchParams(location.search)
            dropCard(query)
            query.delete("st") // `start`, written out below, would win over it anyway
            query.set("start", PLAN[visitingLevel.level - 1].blocks[0])
            location.assign(location.origin + location.pathname + "?" + query.toString())
            return
        }
        visitor = null
        history.replaceState(null, "", location.origin + location.pathname)
        renderSidebar()
        showScreen("intro")
        jump(0)
        sinkHero()
        checkConsent()
    })

    // A test run says so across the top of every screen it is taken on, so that
    // one is never mistaken for the real thing on the way past.
    if (testMode) {
        const mark = document.createElement("span")
        mark.className = "banner__test"
        mark.textContent = "Test mode"
        $("banner").appendChild(mark)
    }

    // A run being carried on is put back before the bars are drawn, so that
    // they are drawn with it.
    if (RESUMED) restore(RESUMED)

    buildSidebar()
    renderSidebar()
    showcase() // a taste of the far end, beside the case for making one

    // A shared card is the whole page when there is one: the test is still
    // underneath it, waiting behind "Take the test yourself". Either the whole
    // profile web, or one level's results.
    //
    // A run being carried on comes before either: it was begun from this very
    // link, a shared one included, and is picked up where it was left.
    const visitingLevel = !RESUMED && results.readLevelLink()
    const visiting = !RESUMED && !visitingLevel && results.readCardLink()
    if (RESUMED) carryOn()
    else {
        offerResume()
        if (visitingLevel) results.showLevelVisit(visitingLevel)
        else if (visiting) results.showVisit(visiting)
    }
})()
