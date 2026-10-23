/* =========================================================================
   What moves as the page is scrolled, and the few things on it that can be
   pressed: a row of the Content table, a card's items button, a level on the
   run. The page is one scroll; nothing here moves it but a press on a level
   or a card, which goes to the table.

   Scrolling does three things. The hero sinks (`--gone`, the share of it
   scrolled past, which its stylesheet fades, lifts and blurs by), the nav
   comes down once the hero has been left and says which chapter the window
   is on, and anything written `data-reveal` comes up the first time it is
   scrolled into view (`.is-in`, written once and never taken off, so that
   scrolling back up finds the page as it was read).
   ========================================================================= */

;(function () {
    "use strict"

    const hero = document.querySelector(".hero")
    const nav = document.querySelector(".nav")
    const through = document.getElementById("through")
    const links = [...document.querySelectorAll(".nav__list a[data-chapter]")]
    const chapters = [...document.querySelectorAll(".chapter[id]")]
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    let on // the chapter the window was last on, by id

    /* ------------------------------ the address ---------------------------- */

    // The address names what is on screen — the chapter, or the row whose
    // items are open — so that copying it links there: `#project`, `#mint`.
    // Written rather than assigned, so that reading down the page does not
    // stack an entry per chapter on the browser's back button; a nav link
    // assigns, which is one entry for a deliberate move.
    function name(id) {
        const want = id ? "#" + id : location.pathname + location.search
        if (location.hash === (id ? want : "")) return
        history.replaceState(null, "", want)
    }

    // The address a chapter's link copies: this page, as it was opened, with
    // the chapter on the end.
    function addressOf(id) {
        return location.origin + location.pathname + location.search + "#" + id
    }

    // Each chapter's number line carries a link to that chapter. Pressed, it
    // copies the address rather than going there — the chapter is already on
    // screen — and says so for a moment; where the clipboard is refused it is
    // left as the link it is.
    for (const link of document.querySelectorAll(".chapter__link")) {
        link.addEventListener("click", (event) => {
            if (!navigator.clipboard) return
            event.preventDefault()
            const id = link.getAttribute("href").slice(1)
            navigator.clipboard
                .writeText(addressOf(id))
                .then(() => {
                    name(id)
                    link.classList.add("chapter__link--copied")
                    setTimeout(() => link.classList.remove("chapter__link--copied"), 1600)
                })
                .catch(() => (location.hash = id))
        })
    }

    /* ------------------------------ scrolling ------------------------------ */

    let ticking = false

    function scrolled() {
        ticking = false
        const y = window.scrollY
        const tall = hero.offsetHeight || 1
        // The hero is gone by the time half of it has been scrolled past, so
        // the first chapter is read against the dark and not a fading title.
        const gone = Math.min(1, Math.max(0, y / (tall * 0.55)))
        hero.style.setProperty("--gone", gone.toFixed(3))
        nav.classList.toggle("nav--shown", y > tall * 0.6)
        const room = document.documentElement.scrollHeight - window.innerHeight
        through.style.width = (room > 0 ? Math.min(1, y / room) * 100 : 0) + "%"
        // Which chapter the window is on, lit in the nav: the last one whose
        // top has passed the upper half of the window. Read off the scroll
        // position rather than observed, so a jump straight to a chapter
        // lights that chapter and nothing it passed on the way.
        const line = y + window.innerHeight * 0.45
        let here = null
        for (const one of chapters) if (one.offsetTop <= line) here = one.id
        for (const link of links) link.classList.toggle("is-here", link.dataset.chapter === here)
        // The address follows the chapter, written only as it changes, so a
        // row named in it (below) is kept while that chapter is being read.
        // The first pass names nothing: the address is then whatever the
        // page was opened with, which may name a row.
        if (here !== on && on !== undefined) name(here)
        on = here
    }

    window.addEventListener(
        "scroll",
        () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(scrolled)
        },
        { passive: true },
    )
    window.addEventListener("resize", scrolled)

    /* ------------------------------ coming up ------------------------------ */

    // A thing comes up once a tenth of it is in the window and a little clear
    // of its bottom edge, so that it is seen arriving rather than found there.
    // Under reduced motion the stylesheet shows everything at once and this
    // has nothing to do.
    const seen = new IntersectionObserver(
        (entries) => {
            for (const one of entries) {
                if (!one.isIntersecting) continue
                one.target.classList.add("is-in")
                seen.unobserve(one.target)
            }
        },
        { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    )
    if (!still) for (const one of document.querySelectorAll("[data-reveal]")) seen.observe(one)

    /* ----------------------------- what it asks ---------------------------- */

    // A row of the Content table says which instrument; picking it opens what
    // that instrument asks under it, out of `items.js`, which
    // `docs/build_slides.py` writes from the app's own content files. One
    // list row exists and is moved under whichever row is picked, growing
    // open there; picking the same row again, or Escape, puts it away.
    //
    // A card on the project chapter opens the same list, for the row it names
    // by questionnaire key (`data-opens`, against the row's
    // `data-questionnaires`), and goes to it, so what it offers is the
    // table's and not a copy. `picked` is whatever was pressed, the row or the
    // card's button, since that is what is marked open and what pressing again
    // puts away.
    const rows = [...document.querySelectorAll("tr[data-items]")]
    const panel = document.createElement("tr")
    panel.className = "items"
    panel.id = "items"
    panel.innerHTML =
        '<td colspan="4"><div class="items__grow"><div class="items__wrap"><div class="items__in">' +
        '<p class="items__of"></p><ol class="items__list"></ol></div></div></div></td>'
    let picked = null
    let under = null

    function said(row) {
        return (typeof ITEMS === "object" && ITEMS[row.dataset.items]) || []
    }

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
        panel.classList.remove("items--open")
        row.after(panel)
        under = row
        row.setAttribute("aria-expanded", "true")
        // A frame later, so that the row is laid out shut before it grows.
        requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("items--open")))
    }

    // What a row is named by in the address: the first questionnaire key it
    // draws from, which `build_slides.py` writes on it.
    function keyOf(row) {
        return (row.dataset.questionnaires || "").split(" ")[0]
    }

    function shut() {
        if (picked) picked.setAttribute("aria-expanded", "false")
        if (under) under.setAttribute("aria-expanded", "false")
        picked = null
        under = null
        if (!panel.isConnected) return
        name("content")
        panel.classList.remove("items--open")
        // Taken out once it has closed, unless something has opened it again
        // under another row by then.
        const was = panel.parentNode
        const gone = () => {
            if (!panel.classList.contains("items--open") && panel.parentNode === was) panel.remove()
        }
        if (still) gone()
        else panel.querySelector(".items__grow").addEventListener("transitionend", gone, { once: true })
    }

    function pick(row, by = row) {
        if (picked === by) return shut()
        shut()
        picked = by
        by.setAttribute("aria-expanded", "true")
        open(row)
        name(keyOf(row))
    }

    for (const row of rows) {
        row.addEventListener("click", () => pick(row))
        row.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return
            event.preventDefault()
            pick(row)
        })
    }

    document.addEventListener("keydown", (event) => event.key === "Escape" && shut())

    for (const button of document.querySelectorAll("[data-opens]")) {
        const row = rows.find((one) => (one.dataset.questionnaires || "").split(" ").includes(button.dataset.opens))
        if (!row) {
            button.hidden = true
            continue
        }
        button.textContent = "See its " + said(row).length + " items"
        button.addEventListener("click", () => {
            pick(row, button)
            if (picked) row.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" })
        })
    }

    /* -------------------------------- the run ------------------------------ */

    // A level on the run says what it asks, and pressing it goes to those rows
    // of the Content table. Both are read off the table — its first column is
    // each instrument's level as written on the timeline, which is the number
    // a level on the run carries (`data-level`) — so the run can never say
    // something the table does not.
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
        shut()
        mine[0].scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" })
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

    // A link into the page naming a chapter opens on it, and one naming a
    // row's questionnaire (`#mint`) opens that row's items and goes to it.
    // The browser would go to a chapter itself, but not always with the page
    // smooth-scrolling and still laying out, so it is put there outright
    // once the page is up. Edited afterwards, the address is followed again
    // — a chapter the browser has already gone to by then, so only a row is
    // seen to here.
    function follow(loading) {
        const want = decodeURIComponent(location.hash.slice(1))
        if (!want) return
        const chapter = document.getElementById(want)
        if (chapter) {
            if (loading) chapter.scrollIntoView({ behavior: "instant", block: "start" })
            return
        }
        const row = rows.find((one) => (one.dataset.questionnaires || "").split(" ").includes(want))
        if (!row) return
        if (under !== row) pick(row)
        row.scrollIntoView({ behavior: loading || still ? "instant" : "smooth", block: "start" })
    }

    follow(true)
    window.addEventListener("hashchange", () => follow(false))

    scrolled()
})()
