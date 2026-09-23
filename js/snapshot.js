/* A piece of the page turned into a picture: what a level's results are copied
   as when somebody shares them. There is no library for this and there is not
   going to be one (see Conventions in AGENTS.md), so it is done the way those
   libraries do it underneath: the piece is cloned with every style it is
   actually drawn with written onto the clone, the clone is put in an SVG
   `<foreignObject>`, and the SVG is drawn onto a canvas as an image.

   Three things make that work. **Styles are copied as computed, not as
   written**: the image is its own document with none of the page's
   stylesheets in it, so a class means nothing there and the values have to
   travel. **Only what differs is copied** — a property is written unless it
   equals both what that tag has by default and what its parent has, which is
   what keeps the SVG kilobytes rather than megabytes, and the "and its parent"
   is what keeps an inherited value from being lost when a child happens to
   match the default. **Nothing moves**: `animation` and `transition` are
   written off on every element, having been copied at the values they had
   reached, since an image of an animation is drawn at its first frame and
   half of what is on a results card fades in from nothing.

   What it cannot do: an image loads nothing from outside itself, so an
   `<img>` or a `<canvas>` is turned into a data URL on the way; web fonts
   would not travel either (the app uses none); and hover and focus are
   whatever they were at the moment of the picture. Nothing here reads the
   run or any score — it is handed an element and gives back a canvas — and
   it adds one name to the globals, `snapshot`, which nothing in content/
   may take. */

"use strict"

const snapshot = (() => {
    const SVG_NS = "http://www.w3.org/2000/svg"

    // Never copied: custom properties have been substituted already, the
    // motion is written off separately, `d` is the path's own attribute over
    // again (and a long one), and the rest mean nothing in a picture.
    const PASSED = /^(--|animation|transition|d$|cursor$|pointer-events$|user-select$|-webkit-user-select$|will-change$|caret-color$)/

    let frame = null
    const defaults = {}

    // A blank page of our own, out of sight, with no stylesheet in it: the
    // state an element is in inside the picture. **It has to be a page and
    // not a box on this one** — this page's stylesheet reaches any box on it
    // (`* { box-sizing: border-box }`, for one), and a value it sets would
    // then pass for a default and never be copied.
    function room() {
        if (!frame) {
            frame = document.createElement("iframe")
            frame.setAttribute("aria-hidden", "true")
            frame.tabIndex = -1
            frame.style.cssText = "position: absolute; left: -99999px; top: 0; width: 4000px; height: 100px; border: 0; visibility: hidden"
            document.body.appendChild(frame)
            frame.contentDocument.open()
            frame.contentDocument.write('<!DOCTYPE html><html><head></head><body style="margin: 0"></body></html>')
            frame.contentDocument.close()
        }
        return frame.contentDocument
    }

    // What a bare element of a tag looks like there.
    function defaultOf(node) {
        const svg = node.namespaceURI === SVG_NS
        const key = (svg ? "svg:" : "") + node.localName
        if (defaults[key]) return defaults[key]

        const blank = room()
        let bare
        if (svg) {
            const holder = blank.createElementNS(SVG_NS, "svg")
            bare = node.localName === "svg" ? holder : holder.appendChild(blank.createElementNS(SVG_NS, node.localName))
            blank.body.appendChild(holder)
        } else {
            bare = blank.body.appendChild(blank.createElement(node.localName))
        }

        const computed = frame.contentWindow.getComputedStyle(bare)
        const held = {}
        for (let i = 0; i < computed.length; i++) held[computed[i]] = computed.getPropertyValue(computed[i])
        defaults[key] = held
        blank.body.innerHTML = ""
        return held
    }

    function styleText(computed, base, parent) {
        let text = ""
        for (let i = 0; i < computed.length; i++) {
            const name = computed[i]
            if (PASSED.test(name)) continue
            const value = computed.getPropertyValue(name)
            if (value === base[name] && (!parent || value === parent.getPropertyValue(name))) continue
            text += name + ":" + value + ";"
        }
        return text + "animation:none;transition:none;"
    }

    // An image or a canvas, as a data URL the picture can hold. One that
    // cannot be read (not loaded, or from elsewhere) is left out rather than
    // failing the whole picture.
    function inlined(node) {
        try {
            if (node.localName === "canvas") return node.toDataURL("image/png")
            if (!node.complete || !node.naturalWidth) return null
            const flat = document.createElement("canvas")
            flat.width = node.naturalWidth
            flat.height = node.naturalHeight
            flat.getContext("2d").drawImage(node, 0, 0)
            return flat.toDataURL("image/png")
        } catch (error) {
            return null
        }
    }

    // **An auto margin is not in the computed style.** On a grid or flex item
    // it reads back as `0px`, and what it was doing — centring a column
    // narrower than its track — is lost in the copy. So the page's own rules
    // are asked, but only the few that set a margin to `auto`: for each, the
    // sides it sets, so that an element one of them matches is written with
    // those sides auto. (Only rules whose media apply count; a later rule
    // setting the same side to a length would be missed, which nothing here
    // does.)
    const SIDES = ["top", "right", "bottom", "left"]

    function autoRules() {
        const found = []
        const walk = (rules) => {
            for (const rule of rules) {
                if (rule.cssRules && rule.media) {
                    if (window.matchMedia(rule.media.mediaText).matches) walk(rule.cssRules)
                } else if (rule.cssRules && !rule.selectorText) walk(rule.cssRules)
                else if (rule.style && rule.selectorText) {
                    const sides = SIDES.filter((side) => rule.style.getPropertyValue("margin-" + side) === "auto")
                    if (sides.length) found.push({ selector: rule.selectorText, sides: sides })
                }
            }
        }
        for (const sheet of document.styleSheets) {
            try {
                walk(sheet.cssRules)
            } catch (error) {
                // A sheet from elsewhere cannot be read, and has none of ours.
            }
        }
        return found
    }

    function autoMargins(node, computed, rules) {
        let text = ""
        const sides = new Set()
        for (const rule of rules) {
            try {
                if (node.matches(rule.selector)) for (const side of rule.sides) sides.add(side)
            } catch (error) {
                // A selector this browser cannot match matches nothing.
            }
        }
        for (const side of SIDES) if (node.style.getPropertyValue("margin-" + side) === "auto") sides.add(side)
        for (const side of sides) if (computed.getPropertyValue("margin-" + side) === "0px") text += "margin-" + side + ":auto;"
        return text
    }

    const svgNode = (node) => node.namespaceURI === SVG_NS

    // Whether an element holds words of its own and they sit on one line.
    function oneLine(node) {
        let words = false
        for (const child of node.childNodes) {
            if (child.nodeType !== Node.TEXT_NODE || !child.nodeValue.trim()) continue
            words = true
            const range = document.createRange()
            range.selectNodeContents(child)
            const tops = new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top)))
            if (tops.size > 1) return false
        }
        return words
    }

    function copy(node, parent, skip, pseudo) {
        if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.nodeValue)
        if (node.nodeType !== Node.ELEMENT_NODE) return null
        if (skip && node.matches(skip)) return null

        const computed = getComputedStyle(node)
        if (computed.display === "none") return null

        let clone
        if (node.localName === "canvas" || node.localName === "img") {
            const source = inlined(node)
            if (!source) return null
            clone = document.createElement("img")
            clone.setAttribute("src", source)
        } else {
            clone = node.cloneNode(false)
            // A script-free picture: nothing in it should try to run.
            for (const name of Array.from(clone.attributes || [])) if (/^on/i.test(name.name)) clone.removeAttribute(name.name)
        }
        let style = styleText(computed, defaultOf(node), parent)
        // Text is drawn a hair wider in an image than on the page, and its box
        // was pinned at the page's width, so a line that exactly fitted would
        // wrap: what is one line on the page is held to one line.
        if (oneLine(node)) style += "white-space:nowrap;"
        if (!svgNode(node)) style += autoMargins(node, computed, pseudo.auto)
        clone.setAttribute("style", style)

        // ::before and ::after are no element of their own to clone, so each
        // one drawn is written as a rule against a class made for it.
        for (const which of ["::before", "::after"]) {
            const drawn = getComputedStyle(node, which)
            if (drawn.content === "none" || drawn.content === "normal" || drawn.display === "none") continue
            const name = "snap-" + pseudo.count++
            clone.classList.add(name)
            pseudo.rules += "." + name + which + "{" + styleText(drawn, defaultOf({ namespaceURI: null, localName: "span" }), null) + "}"
        }

        if (node.localName === "input" || node.localName === "textarea") clone.setAttribute("value", node.value)

        for (const child of node.childNodes) {
            const copied = copy(child, computed, skip, pseudo)
            if (copied) clone.appendChild(copied)
        }
        return clone
    }

    // `skip` is a selector for what to leave out of the picture (buttons that
    // mean nothing in one, say); `ratio` is how many pixels a CSS pixel is
    // drawn at. Resolves to a canvas of the element's size times the ratio.
    return function snapshot(element, how) {
        const skip = (how && how.skip) || null
        const ratio = (how && how.ratio) || 2

        // A picture taken while something is still arriving would catch it
        // part of the way in — a section still fading up is a blank. Anything
        // that ends is sent to its end first, on the page as well, where it
        // was about to get to anyway; what loops (the sea's sway, the beat
        // round a point) is copied wherever it has got to.
        for (const moving of element.getAnimations({ subtree: true })) {
            const timing = moving.effect && moving.effect.getComputedTiming()
            if (!timing || !Number.isFinite(timing.endTime)) continue
            try {
                moving.finish()
            } catch (error) {
                // One that cannot be finished is copied as it stands.
            }
        }

        // What is left out is taken out of the page's own layout for the
        // moment of copying, so that what stays closes up over the gap rather
        // than being copied at the places it had beside it. All of this is
        // one stretch of script, so nothing is painted in between and the
        // page never shows it.
        const out = skip ? Array.from(element.querySelectorAll(skip)) : []
        const had = out.map((one) => one.style.getPropertyValue("display"))
        const held = out.map((one) => one.style.getPropertyPriority("display"))
        for (const one of out) one.style.setProperty("display", "none", "important")

        // The layout box and not the bounding one: a panel still growing out of
        // the badge that opened it is scaled, and the picture is not.
        let box, clone
        // What the whole copy carries along: the rules written for the
        // ::before and ::after it finds, and the page's auto-margin rules.
        const pseudo = { count: 0, rules: "", auto: autoRules() }
        try {
            box = { width: element.offsetWidth, height: element.offsetHeight }
            clone = copy(element, null, skip, pseudo)
        } finally {
            out.forEach((one, at) => {
                if (had[at]) one.style.setProperty("display", had[at], held[at])
                else one.style.removeProperty("display")
            })
        }
        const width = Math.ceil(box.width)
        let height = Math.ceil(box.height)
        // Where it sat on the page is no business of the picture's.
        clone.style.margin = "0"
        clone.style.position = "relative"
        clone.style.left = "0"
        clone.style.top = "0"
        clone.style.transform = "none"

        const wrap = document.createElement("div")
        wrap.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
        if (pseudo.rules) {
            const rules = document.createElement("style")
            rules.textContent = pseudo.rules
            wrap.appendChild(rules)
        }
        wrap.appendChild(clone)

        // The picture is measured, not the original: a margin that collapsed
        // out through the element on the page stays inside the picture, which
        // makes it that much taller. `flow-root` keeps every margin in, and
        // a copy of the clone is laid out once on the blank page — where no
        // stylesheet reaches it, as none will in the picture — to see how
        // tall that comes to.
        wrap.style.cssText = "display: flow-root; width: " + width + "px"
        const blank = room()
        const trial = blank.importNode(wrap, true)
        blank.body.appendChild(trial)
        height = Math.max(height, Math.ceil(trial.getBoundingClientRect().height))
        blank.body.innerHTML = ""

        const markup =
            '<svg xmlns="' + SVG_NS + '" width="' + width + '" height="' + height + '"><foreignObject x="0" y="0" width="100%" height="100%">' +
            new XMLSerializer().serializeToString(wrap) +
            "</foreignObject></svg>"

        return new Promise((resolve, reject) => {
            const picture = new Image()
            picture.onload = () => {
                const canvas = document.createElement("canvas")
                canvas.width = width * ratio
                canvas.height = height * ratio
                canvas.getContext("2d").drawImage(picture, 0, 0, canvas.width, canvas.height)
                resolve(canvas)
            }
            picture.onerror = () => reject(new Error("The picture could not be drawn"))
            picture.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup)
        })
    }
})()
