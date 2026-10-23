/* =========================================================================
   Moving between the slides, and the few things on them that can be
   pressed: a row of the Content table, a card on the study slide, a level on
   its run, anything naming a slide to go to (`data-to`, the slide's id). A slide is a `<section class="slide">` in index.html; moving
   counts them and never looks at what is inside one, so adding a slide is
   writing another section and nothing here.

   The slide showing is in the address (`#2`), so a link holds its place and a
   reload comes back to it — which is the one thing a deck wants from a server
   and this way does not need one.
   ========================================================================= */

;(function () {
    "use strict"

    const slides = [...document.querySelectorAll(".slide")]
    const count = document.getElementById("count")
    const through = document.getElementById("through")
    // What a figure is enlarged into (see "a figure, larger", below). Made
    // here, before anything that asks whether it is up.
    const zoom = document.createElement("div")
    let at = 0
    let arrived = false // nothing has been shown yet, so nothing has a side to come from

    function show(want) {
        const was = at
        at = Math.max(0, Math.min(slides.length - 1, want))
        // Which side the arriving slide comes in from. The slide a visit opens
        // on has come from nowhere — including when a link opens it deep in
        // the deck — and arrives without one.
        const from = !arrived || was === at ? null : at > was ? "on" : "back"
        arrived = true
        slides.forEach((slide, n) => {
            slide.classList.toggle("slide--on", n === at)
            if (n === at && from) slide.dataset.from = from
            else if (n === at) delete slide.dataset.from
        })
        slides[at].scrollTop = 0
        shut()
        shrink()
        count.textContent = at + 1 + " / " + slides.length
        through.style.width = ((at + 1) / slides.length) * 100 + "%"
        // Written rather than assigned, so that moving does not stack an entry
        // per slide on the browser's back button.
        history.replaceState(null, "", "#" + (at + 1))
    }

    // Whatever is in the address, on arrival and whenever it is edited —
    // `replaceState` above never fires this, so the two cannot chase each other.
    function asked() {
        const want = parseInt(location.hash.slice(1), 10)
        show(Number.isFinite(want) ? want - 1 : 0)
    }

    document.getElementById("on").addEventListener("click", () => show(at + 1))
    document.getElementById("back").addEventListener("click", () => show(at - 1))

    document.addEventListener("keydown", (event) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return
        const key = event.key
        // An enlarged figure has the keys to itself: the arrows scroll it.
        if (!zoom.hidden) return
        // A control on a slide keeps its own keys — the arrows move the MINT's
        // scales on its slide, not the deck — and Space on a button that has
        // focus presses it rather than moving on.
        if (event.target.closest("input, textarea, select")) return
        if (key === " " && event.target.closest("button")) return
        if (key === "ArrowRight" || key === "PageDown" || key === " ") show(at + 1)
        else if (key === "ArrowLeft" || key === "PageUp") show(at - 1)
        else if (key === "Home") show(0)
        else if (key === "End") show(slides.length - 1)
        else return
        event.preventDefault()
    })

    // A mouse's side buttons move the deck as they would move a browser,
    // back and forward. The browser's own going back is stopped on both the
    // press and the release, since browsers differ on which one they act on,
    // and since `replaceState` keeps no entry per slide it would otherwise
    // leave the deck altogether.
    const SIDE = { 3: -1, 4: 1 } // event.button: back, forward
    for (const kind of ["mousedown", "mouseup", "auxclick"]) {
        document.addEventListener(kind, (event) => {
            if (!(event.button in SIDE)) return
            event.preventDefault()
            if (kind === "mouseup") show(at + SIDE[event.button])
        })
    }

    // Scrolling on past the end of a slide is the other way on, for anyone
    // whose hand is already on the wheel. It only counts once the slide has
    // nothing left to scroll — so a long table is read to the bottom first —
    // and it takes a deliberate push rather than the one tick that arrives at
    // the end, since a trackpad sends its momentum in a long tail. After a
    // move nothing is heard for a moment, or that tail would carry straight
    // through the slide it just landed on. A slide that fits the window has
    // nothing to scroll and is at both ends at once, which is what makes the
    // wheel work there at all.
    const PUSH = 240 // how much wheel past the end is a deliberate one
    const REST = 700 // ms of quiet after a move before another can be pushed for
    let pushed = 0
    let moved = 0

    document.addEventListener(
        "wheel",
        (event) => {
            // The wheel is scrolling an enlarged figure, not the deck.
            if (!zoom.hidden) return
            const slide = slides[at]
            const room = slide.scrollHeight - slide.clientHeight
            const down = event.deltaY > 0
            const ended = down ? slide.scrollTop >= room - 1 : slide.scrollTop <= 0

            if (!ended || Date.now() - moved < REST) {
                pushed = 0
                return
            }
            // Turning round starts the push again, so the tail of a scroll up
            // is not added to a push down.
            if (pushed !== 0 && Math.sign(pushed) !== Math.sign(event.deltaY)) pushed = 0
            pushed += event.deltaY
            if (Math.abs(pushed) < PUSH) return

            moved = Date.now()
            pushed = 0
            show(at + (down ? 1 : -1))
        },
        { passive: true },
    )

    /* ----------------------------- what it asks ---------------------------- */

    // A row of the Content table says which instrument; picking it says what
    // that instrument asks, out of `items.js`, which `docs/build_slides.py`
    // writes from the app's own content files. **A row is picked rather than
    // hovered**: the list stays up, the text in it can be selected and copied,
    // and a list of forty-odd can be scrolled without the pointer having to
    // stay on the row it came from. Picking the same row again puts it away,
    // and so do Escape and leaving the slide.
    //
    // A card on the study slide opens the same list, for the row it names by
    // questionnaire key (`data-opens`, against the row's
    // `data-questionnaires`), so what it offers is the table's and not a copy.
    // `picked` is whatever was pressed, the row or the card's button, since
    // that is what is marked open and what pressing again puts away.
    const panel = document.getElementById("items")
    const rows = [...document.querySelectorAll("tr[data-items]")]
    let picked = null

    function open(row) {
        const those = said(row)
        const many = those.length === 1 ? "1 item" : those.length + " items"
        panel.querySelector(".items__of").innerHTML = "<b></b> · " + many
        panel.querySelector(".items__of b").textContent = row.children[1].textContent
        const list = panel.querySelector(".items__list")
        list.innerHTML = ""
        for (const one of those) {
            const li = document.createElement("li")
            li.textContent = one
            list.appendChild(li)
        }
        list.scrollTop = 0
        panel.scrollTop = 0
        panel.hidden = false
    }

    function shut() {
        if (picked) picked.setAttribute("aria-expanded", "false")
        picked = null
        panel.hidden = true
    }

    function pick(row, by = row) {
        if (picked === by) return shut()
        shut()
        picked = by
        by.setAttribute("aria-expanded", "true")
        open(row)
    }

    function said(row) {
        return (typeof ITEMS === "object" && ITEMS[row.dataset.items]) || []
    }

    for (const row of rows) {
        row.addEventListener("click", () => pick(row))
        // A row takes focus, so Enter and Space are the same press. The deck's
        // own handler below sees Space first and would move a slide with it,
        // which is why it lets a row that has focus have it.
        row.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return
            event.preventDefault()
            event.stopPropagation()
            pick(row)
        })
    }

    // Escape puts the list away, from anywhere.
    document.addEventListener("keydown", (event) => event.key === "Escape" && shut())

    for (const button of document.querySelectorAll("[data-opens]")) {
        const row = rows.find((one) => (one.dataset.questionnaires || "").split(" ").includes(button.dataset.opens))
        if (!row) {
            button.hidden = true
            continue
        }
        button.textContent = "See its " + said(row).length + " items"
        button.addEventListener("click", () => pick(row, button))
    }

    // Anything naming a slide goes to it when pressed: a card on the study
    // slide goes to that instrument's own. A press on its items button is
    // that button's, and text being selected is not a press at all. A button
    // inside it with nothing of its own to do (the card's "More on…") is how
    // the keyboard gets there, its press bubbling up to here.
    function go(id) {
        const to = slides.indexOf(document.getElementById(id))
        if (to >= 0) show(to)
    }

    for (const one of document.querySelectorAll("[data-to]")) {
        one.addEventListener("click", (event) => {
            if (event.target.closest("[data-opens]") || String(getSelection())) return
            go(one.dataset.to)
        })
    }

    /* -------------------------------- the run ------------------------------ */

    // A level on the study slide's run says what it asks, and pressing it goes
    // to those rows of the Content table. Both are read off the table — its
    // first column is each instrument's level as written on the timeline,
    // which is the number a level on the run carries (`data-level`) — so the
    // run can never say something the table does not.
    //
    // Instruments are named short in the card: the abbreviation a row's name
    // cites, or the name without its parentheses where it cites none.
    function short(name) {
        const cited = [...name.matchAll(/\(([^;()]+);/g)].map((one) => one[1])
        if (cited.length) return cited.join(" + ")
        const bare = name.match(/\(([A-Z][A-Z0-9-]+)\)/)
        return bare ? bare[1] : name.replace(/\s*\([^)]*\)/g, "").trim()
    }

    function seek(mine) {
        const to = slides.indexOf(mine[0].closest(".slide"))
        if (to < 0) return
        show(to)
        mine[0].scrollIntoView({ block: "center" })
        // Picked out for a moment, as having been gone to, and then left as
        // they were. The class comes off first so a second visit plays again.
        for (const row of mine) {
            row.classList.remove("row--sought")
            void row.offsetWidth
            row.classList.add("row--sought")
        }
    }

    for (const button of document.querySelectorAll("[data-level]")) {
        const mine = rows.filter((row) => row.children[0].textContent.trim() === button.dataset.level)
        if (!mine.length) continue
        const many = mine.reduce((sum, row) => sum + (parseInt(row.lastElementChild.textContent, 10) || 0), 0)

        const card = document.createElement("div")
        card.className = "run__card"
        card.id = "level-" + button.dataset.level
        card.setAttribute("role", "tooltip")
        card.innerHTML = '<p class="run__card-of">What it asks · <b></b></p><ul></ul><p class="run__card-go">Press to find it in the table</p>'
        card.querySelector("b").textContent = many === 1 ? "1 item" : many + " items"
        const list = card.querySelector("ul")
        for (const name of new Set(mine.map((row) => short(row.children[1].textContent)))) {
            const li = document.createElement("li")
            li.textContent = name
            list.appendChild(li)
        }
        button.after(card)
        button.setAttribute("aria-describedby", card.id)
        button.addEventListener("click", () => seek(mine))
    }

    /* ---------------------------- a figure, larger ------------------------- */

    // A figure too fine to read at the size a slide gives it opens over
    // everything when pressed (`data-zoom`, on a button holding the picture):
    // first fitted to the window, then, pressed again, at its own size to be
    // scrolled round. Its credit comes with it, being what its licence asks
    // wherever it is shown. Pressing round it, Escape or leaving the slide
    // puts it away. It sits outside the slides, for the item list's reason.
    zoom.className = "zoom"
    zoom.hidden = true
    zoom.innerHTML = '<img alt="" /><p class="zoom__credit"></p>'
    document.body.appendChild(zoom)
    const zoomed = zoom.querySelector("img")

    function enlarge(button) {
        const img = button.querySelector("img")
        const credit = button.closest("figure")?.querySelector(".model__credit")
        zoomed.src = img.src
        zoomed.alt = img.alt
        zoom.querySelector(".zoom__credit").innerHTML = credit ? credit.innerHTML : ""
        zoom.classList.remove("zoom--full")
        zoom.hidden = false
        zoom.scrollTop = 0
    }

    function shrink() {
        zoom.hidden = true
    }

    for (const button of document.querySelectorAll("[data-zoom]")) button.addEventListener("click", () => enlarge(button))
    zoomed.addEventListener("click", () => zoom.classList.toggle("zoom--full"))
    zoom.addEventListener("click", (event) => event.target === zoom && shrink())
    document.addEventListener("keydown", (event) => event.key === "Escape" && shrink())

    /* ------------------------------ the pointer ---------------------------- */

    // A slide taller than the window scrolls, so a swipe is only a move when
    // it is mostly sideways.
    // A finger on a slider is dragging it, not the deck.
    let from = null
    document.addEventListener(
        "touchstart",
        (event) => (from = event.target.closest("input") ? null : event.changedTouches[0]),
        { passive: true },
    )
    document.addEventListener(
        "touchend",
        (event) => {
            if (!from || !zoom.hidden) return
            const to = event.changedTouches[0]
            const across = to.clientX - from.clientX
            const down = to.clientY - from.clientY
            if (Math.abs(across) > 60 && Math.abs(across) > Math.abs(down) * 1.5) show(at + (across < 0 ? 1 : -1))
            from = null
        },
        { passive: true },
    )

    // Last, because the first move shuts the item list and moves the bar,
    // neither of which exists until the lines above have run.
    asked()
    window.addEventListener("hashchange", asked)
})()
