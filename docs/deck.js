/* =========================================================================
   Moving between the slides, and nothing else. A slide is a `<section
   class="slide">` in index.html; this counts them and never looks at what is
   inside one, so adding a slide is writing another section and nothing here.

   The slide showing is in the address (`#2`), so a link holds its place and a
   reload comes back to it — which is the one thing a deck wants from a server
   and this way does not need one.
   ========================================================================= */

;(function () {
    "use strict"

    const slides = [...document.querySelectorAll(".slide")]
    const count = document.getElementById("count")
    const through = document.getElementById("through")
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
        if (key === "ArrowRight" || key === "PageDown" || key === " ") show(at + 1)
        else if (key === "ArrowLeft" || key === "PageUp") show(at - 1)
        else if (key === "Home") show(0)
        else if (key === "End") show(slides.length - 1)
        else return
        event.preventDefault()
    })

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
    const panel = document.getElementById("items")
    const rows = [...document.querySelectorAll("tr[data-items]")]
    let picked = null

    function open(row) {
        const said = (typeof ITEMS === "object" && ITEMS[row.dataset.items]) || []
        const many = said.length === 1 ? "1 item" : said.length + " items"
        panel.querySelector(".items__of").innerHTML = "<b></b> · " + many
        panel.querySelector(".items__of b").textContent = row.children[1].textContent
        const list = panel.querySelector(".items__list")
        list.innerHTML = ""
        for (const one of said) {
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

    function pick(row) {
        if (picked === row) return shut()
        shut()
        picked = row
        row.setAttribute("aria-expanded", "true")
        open(row)
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

    /* ------------------------------ the pointer ---------------------------- */

    // A slide taller than the window scrolls, so a swipe is only a move when
    // it is mostly sideways.
    let from = null
    document.addEventListener("touchstart", (event) => (from = event.changedTouches[0]), { passive: true })
    document.addEventListener(
        "touchend",
        (event) => {
            if (!from) return
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
