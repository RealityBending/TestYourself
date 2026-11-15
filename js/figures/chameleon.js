/* =========================================================================
   The chameleon — what the Truth & Lies level (the `lies` block) closes on:
   one animal on a branch among leaves, the same leaves for everybody, with
   three of the LPQ's four scales each doing one thing to it.

   WHY A CHAMELEON. It is the one animal whose whole reputation is changing
   to suit the company, and hiding is what a lie is for, so the picture says
   its one thing before a word is read: an animal plain to see, or one that
   has to be looked for.

     Lying Frequency   HOW MUCH of it has turned, as one front from the tail
                       to the head: from an animal wearing its own gold to
                       one of which only the face is left.
     Lying Ability     HOW WELL what has turned matches. A good match is the
                       leaves themselves, carried straight through the body
                       until it is gone; a poor one is THE COLOURS OF
                       SOMEWHERE ELSE — the blossom on the sprigs round the
                       edge of the scene — under a dark outline. Poor is never "no
                       change", which would say what Frequency says.
     Lying Negativity  THE FACE, which never turns: a hooded eye looking
                       ahead over a smirk when lying sits easy, a wide eye
                       glancing back over a tight mouth when it does not.

   SKILL ONLY SHOWS WHERE THE SKIN HAS TURNED, which falls out of the first
   two and is the figure's one real idea: a person who says they hardly ever
   lie draws a chameleon in its own colour, and how good they say they are
   at it changes nothing anybody can see.

   ITS OWN COLOUR IS GOLD, the colour "you" is drawn in on every other
   figure. The first drawing wore leaf green on a green ground, so the
   person who never lies got the animal that looked best hidden.

   THREE CHANNELS AND NO MORE (November 2026). The first drawing had five:
   these three, Contextuality as the number of surroundings the branch ran
   through, and the lies counted in the last day as ghosts behind the
   animal, with a bar a scale and two sentences under the picture to say
   what each was. Rendered, the three small ones could not be told apart
   from scenery (a pupil moved six pixels, bands of blurred colour, outlines
   that read as wire), and the words were doing the picture's work. So
   Contextuality is asked, scored and saved and drawn nowhere, the count
   (read back for a while as a crowd over the picture) is no longer asked
   at all (content/block_lies.js says why), the scene is one place and
   the same for everybody, so that any
   difference between two people's pictures is a difference between them,
   and what each part means is said on hover, focus or a tap and not under
   the picture.

   THE FACE IS A FACE PUT ON IT, which the first drawing avoided (its eye
   only turned, as a chameleon's does). An eye alone read as sleepy or
   awake; an eye and a mouth read as how the animal feels about it, which
   is what the scale asks. It is also the one part that stays when the rest
   has gone, so a practised, untroubled liar is a grin left in the leaves.

   NO NORMS, SO NO STANDINGS. The LPQ carries none (content/block_lies.js),
   so every channel is a reach along its own scale, the sea's rule, and
   nothing here says "more than n% of people". It goes through `dimensionsIn`
   in results.js for the same reason the wheel and the hero card do. Self-
   reported lying sits near the floor of its scale, so on reaches most
   people will draw an animal that has barely turned; a `distribution` out
   of the LPQ's own validation data would spread them, and is not written.
   ========================================================================= */

function makeChameleon(shared) {
    "use strict"

    const score = shared.score
    const known = shared.known
    const reachOf = shared.reachOf
    const teaseValue = shared.teaseValue
    const pickButtons = shared.pickButtons
    const showTip = shared.showTip
    const hideTip = shared.hideTip
    const VOTES = shared.VOTES

    const CHAMELEON_OF = "lpq"
    const CHAMELEON_KEY = "Lying" // the vote on the figure

    // The three scales the picture is drawn from. The fourth, Lying
    // Contextuality, is scored and saved and read by nothing here.
    const OFTEN = "Lying Frequency"
    const WELL = "Lying Ability"
    const FEELS = "Lying Negativity"
    const DRAWN = [OFTEN, WELL, FEELS]

    // What a part of the picture says when it is hovered, focused or tapped:
    // what the scale is and what it does to the animal, never which items it
    // came from (the heads' rule). The skin carries two, being one thing
    // with two properties, how far it has turned and how closely.
    const PARTS = {
        skin: {
            label: "The chameleon's skin: how often and how well",
            says: [
                { name: "How often", told: "The more often you say you lie, the more of the skin has turned." },
                { name: "How well", told: "The better a liar you say you are, the closer it matches the leaves. A poor match wears the colours of somewhere else." },
            ],
        },
        face: {
            label: "The chameleon's face: how it feels",
            says: [{ name: "How it feels", told: "How wrong lying feels to you. A sly face is at ease with it, a wary one is not." }],
        },
    }

    // The animal's own colour, which is what shows wherever the skin has not
    // turned: the app's gold, a little brighter than the token so that it
    // carries against dark leaves, and the deeper gold of its crest, casque
    // and far legs.
    const OWN = "#ecb84c"
    const OWN_DEEP = "#b07f27"
    const OUTLINE = "#0d140a"
    const PALE = "#f6e6c4"

    // The leaves, back to front, and the blossom round the edge: the
    // somewhere else a poor match is dressed for.
    const LEAF_TONES = ["#14301f", "#193d27", "#1f4a2e", "#265836"]
    const PLUM = "#4f2749"
    const PLUM_DEEP = "#3a1c38"
    const PETAL = "#e59ac8"
    const HEART = "#fbe3f0"

    // The figure in its own units, and where the animal is put in them: its
    // paths are written about half this size, round (287, 193).
    const WIDE = 640
    const HIGH = 360
    const PLACE = "translate(-38 -60) scale(1.3)"
    const placed = (x, y) => [x * 1.3 - 38, y * 1.3 - 60]
    const EYE = [380, 170] // in the animal's own units
    const HEAD = placed(EYE[0], EYE[1]) // in the figure's, which is what the badge is cropped round

    // The front the skin turns behind, as where it stands across the figure:
    // short of the tail's tip at no lying at all, past the snout at the top
    // of the scale. It is soft-edged and leans forward, the top of the
    // animal turning a little before its feet.
    const FRONT_FROM = 122
    const FRONT_TO = 548
    const SOFT = 22
    const LEAN = 6
    const MIDDLE = 190
    const MOUTH_AT = placed(393, 190)[0]

    // The trace a turned skin leaves round itself, in the animal's own
    // units, and how faint it is.
    const RIM = 1.1
    const TRACE = 0.2

    // How the turning arrives: the animal is seen in its own colour first,
    // and then turns as far as the answers put it.
    const TURN_AFTER = 600
    const TURN_FOR = 1700

    // Gradients, masks and patterns are found by id, and a page can hold
    // several chameleons (the level screen, its panel, a badge).
    let drawn = 0

    /* ------------------------------ the values ---------------------------- */

    function ready() {
        return DRAWN.every((dimension) => known(dimension) && score(dimension) !== undefined)
    }

    // Each channel as a reach along its own scale: there are no norms to
    // stand it against.
    function values(locked) {
        const out = {}
        for (const dimension of DRAWN) {
            const value = locked ? teaseValue(dimension) : score(dimension)
            out[dimension] = Math.min(1, Math.max(0, reachOf(dimension, value)))
        }
        return out
    }

    /* ----------------------------- the scene ------------------------------ */

    // One leaf: a blade along its own axis from where it is set, a midrib
    // and veins off it. The veins are what a matched skin is seen to carry.
    function leaf(into, x, y, long, half, turn, fill) {
        const vein = mix(fill, "#a9d39a", 0.2)
        const blade = into.appendChild(draw("g", { transform: "translate(" + x + " " + y + ") rotate(" + turn + ")" }))
        blade.appendChild(
            draw("path", {
                d:
                    "M 0 0 C " + long * 0.22 + " " + -half + ", " + long * 0.68 + " " + -half * 0.92 + ", " + long + " 0 " +
                    "C " + long * 0.68 + " " + half * 0.92 + ", " + long * 0.22 + " " + half + ", 0 0 Z",
                fill: fill,
            }),
        )
        let veins = "M 0 0 L " + long + " 0 "
        for (const along of [0.16, 0.3, 0.44, 0.58, 0.72]) {
            const out = half * 0.8 * Math.sin(Math.PI * (0.14 + along * 0.82))
            for (const side of [-1, 1]) veins += "M " + along * long + " 0 L " + (along + 0.13) * long + " " + side * out + " "
        }
        blade.appendChild(draw("path", { d: veins, stroke: vein, "stroke-width": 2, fill: "none", "stroke-linecap": "round", opacity: 0.8 }))
    }

    // Where the leaves are set: x, y, length, half-width, turn and tone. A
    // fixed list rather than a scatter, the scene being the same for
    // everybody; dark and large at the back, lighter and smaller in front,
    // and kept to the edges so the middle is calm behind the animal.
    const LEAVES = [
        [-40, 60, 330, 78, 12, 0],
        [680, 30, 340, 80, 168, 0],
        [-30, 330, 320, 74, -24, 0],
        [690, 340, 330, 76, 200, 0],
        [320, -50, 260, 70, 80, 0],
        [300, 420, 240, 66, -82, 0],
        [-30, 180, 280, 62, -8, 1],
        [670, 200, 290, 64, 186, 1],
        [120, -40, 250, 58, 58, 1],
        [500, -50, 240, 56, 112, 1],
        [90, 400, 250, 58, -58, 1],
        [560, 400, 250, 58, -122, 1],
        [-20, 20, 200, 46, 30, 2],
        [-20, 300, 180, 42, -12, 2],
        [660, 270, 190, 44, 192, 3],
        [200, 380, 170, 40, -70, 3],
        [400, -30, 160, 38, 96, 2],
    ]

    // The sprigs of blossom: a plum leaf each (x, y, length, half-width,
    // turn) and two or three flowers on it, kept clear of the animal and of
    // the badge's crop round its head.
    const SPRIGS = [
        { leaf: [14, 22, 104, 28, 24], flowers: [[62, 40], [86, 58], [52, 64]] },
        { leaf: [646, 196, 96, 26, 194], deep: true, flowers: [[598, 184], [618, 204]] },
        { leaf: [236, 368, 92, 26, -64], flowers: [[262, 330], [250, 348], [278, 344]] },
    ]

    // A blossom: five petals round a heart.
    function blossom(into, x, y, size) {
        for (let at = 0; at < 5; at++) {
            const turn = (Math.PI * 2 * at) / 5 - Math.PI / 2
            into.appendChild(draw("circle", { cx: x + Math.cos(turn) * size * 1.15, cy: y + Math.sin(turn) * size * 1.15, r: size, fill: PETAL }))
        }
        into.appendChild(draw("circle", { cx: x, cy: y, r: size * 0.6, fill: HEART }))
    }

    // The scene behind the animal, the branch included, as one group found
    // by id: the turned skin is this same group drawn again inside the
    // animal's outline, which is how a good match comes out as exactly what
    // is behind it, the branch under its feet and all.
    function drawGround(figure, defs, id) {
        const ground = figure.appendChild(draw("g", { id: id + "-ground", class: "chameleon__ground" }))
        ground.appendChild(draw("rect", { x: 0, y: 0, width: WIDE, height: HIGH, fill: "#0c1f14" }))
        for (const one of LEAVES) leaf(ground, one[0], one[1], one[2], one[3], one[4], LEAF_TONES[one[5]])

        // Somewhere else: sprigs of a flowering thing here and there round
        // the edge, so that an animal dressed in blossom is seen to be
        // dressed for another part of the wood. Small and scattered: one
        // patch of it in the corner the animal faces (until November 2026)
        // took the eye off the animal.
        for (const sprig of SPRIGS) {
            leaf(ground, sprig.leaf[0], sprig.leaf[1], sprig.leaf[2], sprig.leaf[3], sprig.leaf[4], sprig.deep ? PLUM_DEEP : PLUM)
            for (const at of sprig.flowers) blossom(ground, at[0], at[1], 4.4)
        }

        ground.appendChild(draw("path", { d: "M -10 304 C 150 294, 430 298, 650 286", stroke: "#2c1f15", "stroke-width": 21, fill: "none", "stroke-linecap": "round" }))
        ground.appendChild(draw("path", { d: "M -10 298 C 150 288, 430 292, 650 280", stroke: "#5b4229", "stroke-width": 6, fill: "none", "stroke-linecap": "round", opacity: 0.75 }))

        // Light on the middle and shade at the edges and the foot, so the
        // animal stands in a clearing rather than against a wall.
        const glow = defs.appendChild(draw("radialGradient", { id: id + "-glow", cx: "0.5", cy: "0.46", r: "0.75" }))
        glow.appendChild(draw("stop", { offset: "0", "stop-color": "#dff2c8", "stop-opacity": "0.1" }))
        glow.appendChild(draw("stop", { offset: "0.45", "stop-color": "#000000", "stop-opacity": "0" }))
        glow.appendChild(draw("stop", { offset: "1", "stop-color": "#000000", "stop-opacity": "0.62" }))
        ground.appendChild(draw("rect", { x: 0, y: 0, width: WIDE, height: HIGH, fill: "url(#" + id + "-glow)" }))
        const shade = defs.appendChild(draw("linearGradient", { id: id + "-shade", x1: "0", y1: "0", x2: "0", y2: "1" }))
        shade.appendChild(draw("stop", { offset: "0.55", "stop-color": "#000000", "stop-opacity": "0" }))
        shade.appendChild(draw("stop", { offset: "1", "stop-color": "#000000", "stop-opacity": "0.45" }))
        ground.appendChild(draw("rect", { x: 0, y: 0, width: WIDE, height: HIGH, fill: "url(#" + id + "-shade)" }))
        return ground
    }

    // What a poor match wears: the sprigs' blossom on their plum, as a
    // pattern, so that it reads as a place and not as a colour.
    function elsewhere(defs, id) {
        const tile = defs.appendChild(draw("pattern", { id: id + "-else", width: 46, height: 46, patternUnits: "userSpaceOnUse" }))
        tile.appendChild(draw("rect", { x: 0, y: 0, width: 46, height: 46, fill: PLUM }))
        blossom(tile, 12, 12, 3.6)
        blossom(tile, 35, 35, 3.6)
        tile.appendChild(draw("circle", { cx: 35, cy: 11, r: 2.2, fill: PETAL, opacity: 0.7 }))
        tile.appendChild(draw("circle", { cx: 11, cy: 35, r: 2.2, fill: PETAL, opacity: 0.7 }))
    }

    /* ---------------------------- the animal ------------------------------ */

    // The body, flatter than it is round: a chameleon is a long animal with a
    // low back, and a tall hump reads as a beetle. The head is a shape of its
    // own over the front of it, so that the casque can stand clear of the
    // back line.
    const BODY = "M 198 206 C 202 170, 228 156, 266 154 C 304 152, 336 162, 348 182 C 356 198, 330 224, 286 226 C 240 228, 200 224, 198 206 Z"
    const FACE = "M 330 172 C 338 150, 366 140, 392 148 C 414 155, 426 172, 418 186 C 408 202, 372 206, 348 198 C 334 193, 328 184, 330 172 Z"
    // The casque, the fin over the back of the head: with the eye, it is what
    // says chameleon before anything else in the picture is read.
    const CASQUE = "M 330 174 C 326 140, 342 112, 364 110 C 380 118, 386 136, 398 150 C 374 150, 346 158, 330 174 Z"
    // The tail, a stroked spiral off the back of the body.
    const TAIL =
        "M 202 210 C 178 212, 158 224, 152 244 C 147 260, 158 276, 176 276 " +
        "C 192 276, 202 264, 198 252 C 194 242, 182 238, 175 244 C 169 249, 170 258, 177 260"
    // The back, which the dorsal saw is built along.
    const BACK = [
        [202, 198],
        [214, 176],
        [236, 161],
        [264, 155],
        [294, 154],
        [320, 158],
        [336, 165],
    ]
    // Four legs, the two far ones drawn behind the body: a chameleon stands
    // tall on a branch rather than lying along it, so the body is clear of it
    // and the legs are what close the gap.
    const LEGS = [
        { d: "M 318 214 C 330 234, 328 252, 316 266", foot: [316, 266], near: true },
        { d: "M 238 218 C 230 238, 234 254, 248 266", foot: [248, 266], near: true },
        { d: "M 296 218 C 304 238, 300 254, 288 264", foot: [288, 264], near: false },
        { d: "M 258 220 C 250 240, 254 254, 266 264", foot: [266, 264], near: false },
    ]
    // The bars down its flank, which make the gold an animal's own markings
    // rather than a flat colour, and which go with the skin when it turns.
    const BARS = ["M 226 158 q 9 36 -3 70", "M 256 150 q 9 40 -2 78", "M 287 150 q 8 40 -3 78", "M 316 154 q 7 34 -4 66"]

    // The saw of spines along the back, which no other lizard's silhouette
    // has: a triangle standing off each stretch of the back line.
    const CREST = (() => {
        let d = ""
        for (let at = 0; at < BACK.length - 1; at++) {
            const from = BACK[at]
            const to = BACK[at + 1]
            const middle = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
            const along = [to[0] - from[0], to[1] - from[1]]
            const length = Math.sqrt(along[0] * along[0] + along[1] * along[1]) || 1
            const out = [along[1] / length, -along[0] / length] // the normal, standing off the back
            const high = 7 + (BACK.length - at) * 0.6
            d += "M " + from[0] + " " + from[1] + " L " + (middle[0] + out[0] * high) + " " + (middle[1] + out[1] * high) + " L " + to[0] + " " + to[1] + " "
        }
        return d
    })()

    // The whole animal but its face, in two colours: its own, when it is
    // drawn; white, when it is the outline the turned skin is cut to; and
    // nothing at all, when it is what the pointer finds. `wider` draws it
    // that much larger all round, which is how its rim is cut (`drawScene`).
    function animal(into, main, deep, wider) {
        const more = wider || 0
        const filled = (d, fill) => into.appendChild(draw("path", Object.assign({ d: d, fill: fill }, more ? { stroke: fill, "stroke-width": more * 2 } : {})))
        const stroked = (d, stroke, width) => into.appendChild(draw("path", { d: d, stroke: stroke, "stroke-width": width + more * 2, fill: "none", "stroke-linecap": "round" }))

        for (const leg of LEGS) if (!leg.near) stroked(leg.d, deep, 10)
        stroked(TAIL, main, 13)
        into.appendChild(draw("path", { d: CREST, fill: deep, stroke: deep, "stroke-width": 1 + more * 2 }))
        filled(CASQUE, deep)
        filled(FACE, main)
        filled(BODY, main)
        for (const leg of LEGS) {
            if (!leg.near) continue
            stroked(leg.d, main, 12)
            // The zygodactyl foot, two toes each way, which is how a
            // chameleon holds a branch and reads as a grip at this size.
            stroked("M " + (leg.foot[0] - 9) + " " + (leg.foot[1] - 2) + " q 9 10, 18 0", deep, 5)
        }
    }

    // The face, which never turns: the eye on its turret and the mouth.
    // Lying that sits easy is a hooded eye looking ahead over a mouth turned
    // up at the corner; lying that weighs is the eye wide, its pupil small
    // and glancing back, over a mouth pulled down. The mouth is drawn twice,
    // dark and then pale, and the pale line is brought up as the skin under
    // it turns (`front`), so that it reads on gold and on leaves alike.
    function drawFace(into, defs, id, feels) {
        const face = into.appendChild(draw("g", { class: "chameleon__face", transform: PLACE }))
        const mouth = "M 421 182 C 405 " + (195 - 9 * feels) + ", 384 " + (199 - 10 * feels) + ", 366 " + (183 + 14 * feels)
        face.appendChild(draw("path", { d: mouth, stroke: "#3a2a10", "stroke-width": 4.5, fill: "none", "stroke-linecap": "round" }))
        const pale = face.appendChild(draw("path", { d: mouth, stroke: PALE, "stroke-width": 1.9, fill: "none", "stroke-linecap": "round", opacity: 0 }))

        const x = EYE[0]
        const y = EYE[1]
        face.appendChild(draw("circle", { cx: x, cy: y, r: 17, fill: OWN_DEEP, stroke: "#6b4a12", "stroke-width": 1.2 }))
        defs.appendChild(draw("clipPath", { id: id + "-eye" })).appendChild(draw("circle", { cx: x, cy: y, r: 12 }))
        const ball = face.appendChild(draw("g", { "clip-path": "url(#" + id + "-eye)" }))
        ball.appendChild(draw("circle", { cx: x, cy: y, r: 12, fill: "#f4e8b6" }))
        ball.appendChild(draw("circle", { cx: x + 3.5 - 8 * feels, cy: y + 1 - 2 * feels, r: 5.6 - 2 * feels, fill: "#15180f" }))
        ball.appendChild(draw("circle", { cx: x + 5 - 8 * feels, cy: y - 2.5 - 2 * feels, r: 1.5, fill: "#ffffff", opacity: 0.7 }))
        // The lids, closing from above and a little from below as it eases.
        const closed = (1 - feels) * 0.5
        ball.appendChild(draw("rect", { x: x - 12, y: y - 12, width: 24, height: 24 * closed, fill: OWN_DEEP }))
        ball.appendChild(draw("rect", { x: x - 12, y: y + 12 - 24 * closed * 0.4, width: 24, height: 12, fill: OWN_DEEP }))
        return pale
    }

    // The scene, and what moves the front across it. Drawn `live`, it also
    // carries what a pointer finds and what lights when it does.
    function drawScene(figure, got, live) {
        drawn++
        const id = "chameleon-" + drawn
        figure.setAttribute("viewBox", "0 0 " + WIDE + " " + HIGH)
        figure.classList.add("chameleon__scene")
        const defs = figure.appendChild(draw("defs", {}))
        const whole = { maskUnits: "userSpaceOnUse", x: 0, y: 0, width: WIDE, height: HIGH }

        drawGround(figure, defs, id)
        elsewhere(defs, id)

        // The front, a soft edge across the figure, as two masks: what is
        // behind it, which has turned, and what is ahead of it, which has
        // not. The animal's own colour is cut to the second, or it would
        // show as a gold fringe round a skin that had otherwise disappeared.
        const sweeps = [
            ["-front", "#ffffff", "#000000"],
            ["-ahead", "#000000", "#ffffff"],
        ].map((one) => {
            const sweep = defs.appendChild(draw("linearGradient", { id: id + one[0] + "-sweep", gradientUnits: "userSpaceOnUse", y1: MIDDLE - LEAN, y2: MIDDLE + LEAN }))
            sweep.appendChild(draw("stop", { offset: "0", "stop-color": one[1] }))
            sweep.appendChild(draw("stop", { offset: "1", "stop-color": one[2] }))
            defs
                .appendChild(draw("mask", Object.assign({ id: id + one[0] }, whole)))
                .appendChild(draw("rect", { x: 0, y: 0, width: WIDE, height: HIGH, fill: "url(#" + id + one[0] + "-sweep)" }))
            return sweep
        })

        // In its own colour, ahead of the front.
        const own = figure.appendChild(draw("g", { mask: "url(#" + id + "-ahead)" })).appendChild(draw("g", { class: "chameleon__own", transform: PLACE }))
        animal(own, OWN, OWN_DEEP)
        defs.appendChild(draw("clipPath", { id: id + "-flank" })).appendChild(draw("path", { d: BODY }))
        const bars = own.appendChild(draw("g", { "clip-path": "url(#" + id + "-flank)", opacity: 0.4 }))
        for (const d of BARS) bars.appendChild(draw("path", { d: d, stroke: OWN_DEEP, "stroke-width": 7, fill: "none", "stroke-linecap": "round" }))

        // The animal's outline, which the turned skin is cut to as well.
        animal(defs.appendChild(draw("mask", Object.assign({ id: id + "-shape" }, whole))).appendChild(draw("g", { transform: PLACE })), "#ffffff", "#ffffff")

        // What has turned: the colours of somewhere else, and over them the
        // ground itself, as nearly whole as the match is good.
        const turned = figure
            .appendChild(draw("g", { class: "chameleon__turned", mask: "url(#" + id + "-front)" }))
            .appendChild(draw("g", { mask: "url(#" + id + "-shape)" }))
        turned.appendChild(draw("rect", { x: 0, y: 0, width: WIDE, height: HIGH, fill: "url(#" + id + "-else)" }))
        turned.appendChild(draw("use", { href: "#" + id + "-ground", opacity: got[WELL] }))

        // The outline: what gives a poor match away, and what a good one
        // loses.
        const behind = figure.appendChild(draw("g", { mask: "url(#" + id + "-front)" }))
        const edge = behind.appendChild(draw("g", { transform: PLACE, fill: "none", stroke: OUTLINE, "stroke-width": 2.4, opacity: 0.05 + (1 - got[WELL]) * 0.75 }))
        for (const d of [BODY, FACE, CASQUE]) edge.appendChild(draw("path", { d: d }))

        // And the trace even the best match leaves: a pale line round the
        // whole of what has turned, faint enough to be missed and there to
        // be found. Without it an animal that had disappeared read as an
        // eye and a mouth with no animal behind them. It is the animal drawn
        // a little large with the animal itself taken back out.
        const rim = defs.appendChild(draw("mask", Object.assign({ id: id + "-rim" }, whole))).appendChild(draw("g", { transform: PLACE }))
        animal(rim, "#ffffff", "#ffffff", RIM)
        animal(rim, "#000000", "#000000")
        behind.appendChild(draw("rect", { x: 0, y: 0, width: WIDE, height: HIGH, fill: PALE, opacity: TRACE, mask: "url(#" + id + "-rim)" }))

        // Lit when the skin is pointed at: the whole animal, faintly, which
        // is also how one that has disappeared is found again.
        if (live) animal(figure.appendChild(draw("g", { class: "chameleon__reveal", transform: PLACE })), "#ffffff", "#ffffff")

        const pale = drawFace(figure, defs, id, got[FEELS])

        if (live) {
            figure.appendChild(draw("circle", { class: "chameleon__ring", cx: HEAD[0] - 2, cy: HEAD[1] + 6, r: 56, fill: "none", stroke: PALE, "stroke-width": 1.5, "stroke-dasharray": "5 6" }))
            const skin = figure.appendChild(draw("g", { class: "chameleon__hit", "data-key": "skin", transform: PLACE, tabindex: "0", role: "img", "aria-label": PARTS.skin.label }))
            animal(skin, "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)")
            figure.appendChild(
                draw("circle", { class: "chameleon__hit", "data-key": "face", cx: HEAD[0] - 2, cy: HEAD[1] + 6, r: 46, fill: "rgba(0, 0, 0, 0)", tabindex: "0", role: "img", "aria-label": PARTS.face.label }),
            )
        }

        const reach = FRONT_FROM + got[OFTEN] * (FRONT_TO - FRONT_FROM)
        const front = (at) => {
            for (const sweep of sweeps) {
                sweep.setAttribute("x1", at - SOFT)
                sweep.setAttribute("x2", at + SOFT)
            }
            pale.setAttribute("opacity", 0.95 * Math.min(1, Math.max(0, (at + SOFT - MOUTH_AT) / (2 * SOFT))))
        }
        front(reach)
        return { reach: reach, front: front }
    }

    // The turning, seen happening: when the stage starts to arrive the
    // animal is put back in its own colour and the front runs from the tail
    // to where the answers put it. It hangs on the stage's own arrival, which
    // a sealed card holds until the level opens, so it starts when the
    // picture is uncovered and not when it is drawn; and the picture is drawn
    // finished first, so that one that never arrives (a badge, a copy made
    // for an image, reduced motion) is the finished one and never the gold.
    function arrive(holder, scene) {
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const start = (event) => {
            if (event.target !== holder) return
            holder.removeEventListener("animationstart", start)
            const began = performance.now()
            scene.front(FRONT_FROM)
            const step = (now) => {
                const share = Math.min(1, Math.max(0, (now - began - TURN_AFTER) / TURN_FOR))
                scene.front(FRONT_FROM + (scene.reach - FRONT_FROM) * (1 - Math.pow(1 - share, 3)))
                if (share < 1) requestAnimationFrame(step)
            }
            requestAnimationFrame(step)
            // A tab in the background is given no frames; it is not left
            // showing an animal that has not turned.
            setTimeout(() => scene.front(scene.reach), TURN_AFTER + TURN_FOR + 400)
        }
        holder.addEventListener("animationstart", start)
    }

    /* ------------------------------- the words ---------------------------- */

    function text(tag, className, words) {
        const element = document.createElement(tag)
        element.className = className
        if (words) element.textContent = words
        return element
    }

    // What a part says, as a piece for the shared tooltip: a name and a line
    // for each scale it carries.
    function tipOf(part) {
        const card = text("div", "chameleon__tip")
        for (const one of part.says) {
            const line = card.appendChild(text("p", "chameleon__told"))
            line.appendChild(text("strong", "chameleon__part", one.name))
            line.appendChild(document.createTextNode(" " + one.told))
        }
        return card
    }

    // Pointing at a part lights it and says what it is; so does focusing it,
    // and so does a tap, a phone having no hover and a tap not always
    // focusing an SVG element (the old theories' rule).
    function link(figure) {
        for (const hit of figure.querySelectorAll(".chameleon__hit")) {
            const key = hit.dataset.key
            const card = tipOf(PARTS[key])
            const show = () => {
                figure.dataset.lit = key
                showTip(hit, card)
            }
            const hide = () => {
                delete figure.dataset.lit
                hideTip()
            }
            hit.addEventListener("mouseenter", show)
            hit.addEventListener("focus", show)
            hit.addEventListener("click", show)
            hit.addEventListener("mouseleave", hide)
            hit.addEventListener("blur", hide)
        }
    }

    // One sentence from how well against how often, at the middle of each
    // scale — the heads' rule: four sentences a person may land in any of,
    // and no name for the quadrant, which would read as a verdict. It says
    // the person and leaves the picture to say itself.
    function readingOf(got) {
        const able = got[WELL] >= 0.5
        const often = got[OFTEN] >= 0.5
        if (able && often) return "You lie readily, and well."
        if (able) return "You seldom lie, though you could."
        if (often) return "You lie often, and it shows."
        return "You wear your own colours."
    }

    /* ------------------------------ the section --------------------------- */

    // A title, the scene, one line and a vote. Locked, the title and the
    // scene from the stand-ins, blurred by the ordinary rule for a figure
    // drawn as an <svg>, with nothing earned under it.
    function renderChameleon(locked) {
        const all = document.createDocumentFragment()
        const got = values(locked)

        const headline = text("header", "chameleon__head")
        headline.appendChild(text("h3", "chameleon__title", "How deceptive can you be?"))
        all.appendChild(headline)

        const holder = text("div", "result__chart result__chart--wide chameleon__stage")
        const figure = holder.appendChild(document.createElementNS(SVG, "svg"))
        figure.setAttribute("role", "img")
        figure.setAttribute("aria-label", locked ? "Blurred preview of a chameleon drawn from how you lie" : "A chameleon on a branch among leaves, drawn from your answers. " + readingOf(got))
        const scene = drawScene(figure, got, !locked)
        if (locked) holder.appendChild(text("span", "result__lock", "Locked"))
        all.appendChild(holder)
        if (locked) return all

        link(figure)
        arrive(holder, scene)
        all.appendChild(text("p", "chameleon__reading", readingOf(got)))

        const vote = text("div", "chameleon__vote")
        vote.appendChild(text("p", "chameleon__ask", "Does this match the way you lie?"))
        vote.appendChild(pickButtons(CHAMELEON_KEY, VOTES))
        all.appendChild(vote)
        return all
    }

    // The person's own scene with nothing in it that answers a pointer, for
    // the shelf's badge to crop.
    function portrait() {
        const figure = document.createElementNS(SVG, "svg")
        drawScene(figure, values(false), false)
        return figure
    }

    return {
        CHAMELEON_OF: CHAMELEON_OF,
        CHAMELEON_KEY: CHAMELEON_KEY,
        DIMENSION: OFTEN,
        HEAD: HEAD,
        ready: ready,
        renderChameleon: renderChameleon,
        portrait: portrait,
    }
}
