// The handful of helpers that draw rather than decide: an SVG element, and a
// colour between two others. They hold no state and read nothing — which is
// why they can sit here, below both `app.js` and `results.js`, rather than in
// either of them. Both files draw figures, the seam between them runs one way,
// and so each used to carry its own copy of these with a note saying to keep
// the two identical. One copy under both of them is the same code with the
// hazard taken out.
//
// Nothing else belongs in here. Anything that reads the run goes in `app.js`
// and anything that reads a score in `results.js`; a helper is only ever moved
// down to this file because *both* of them want it. It takes the names `SVG`,
// `draw` and `mix` in the globals every file on the page shares, so nothing in
// `content/` may take them too.

const SVG = "http://www.w3.org/2000/svg"

// An SVG element with its attributes written on it, which is the whole of what
// building a figure by hand comes down to.
function draw(shape, attributes) {
    const element = document.createElementNS(SVG, shape)
    for (const name of Object.keys(attributes)) element.setAttribute(name, attributes[name])
    return element
}

// A colour `proportion` of the way from one #rrggbb to another.
function mix(from, to, proportion) {
    const channels = [1, 3, 5].map((at) => {
        const start = parseInt(from.substr(at, 2), 16)
        const end = parseInt(to.substr(at, 2), 16)
        return Math.round(start + (end - start) * proportion)
    })
    return "rgb(" + channels.join(", ") + ")"
}
