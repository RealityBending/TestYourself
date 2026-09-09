/* =========================================================================
   The AI archetype: which of three answer profiles the BAIT came nearest, by
   nearest-centroid on the z scores of its three dimensions. The three come
   from a cluster analysis of the pooled BAIT samples — believing AI capable
   and being alarmed by it are not two ends of one thing, which is why this is
   not an enthusiasm × apprehension quadrant. The centroids are that reported
   description read into SD units (only the worry figure is exact) and the
   `share` of each is a PLACEHOLDER, invented like every other norm in the app.
   ========================================================================= */

function makeArchetype(shared) {
    "use strict"

    const score = shared.score
    const known = shared.known
    const normOf = shared.normOf
    const sentence = shared.sentence
    const voteButtons = shared.voteButtons

    const ARCHETYPE_OF = "bait"
    const ARCHETYPE_KEY = "AI Archetype"
    const ARCHETYPE_ON = ["AI Realism", "AI Enthusiasm", "AI Apprehension"]

    const ARCHETYPES = [
        {
            name: "The Untroubled",
            share: 30,
            at: { "AI Realism": 0.0, "AI Enthusiasm": 0.9, "AI Apprehension": -1.2 },
            reading:
                "what stands out is how little AI worries you. Your beliefs about what it can actually produce are close to " +
                "average, but your enthusiasm runs high and your alarm runs lower than almost anybody's.",
        },
        {
            name: "The Uneasy Realist",
            share: 40,
            at: { "AI Realism": 0.6, "AI Enthusiasm": -0.2, "AI Apprehension": 0.5 },
            reading:
                "you think AI can already make things that pass for real, and that is exactly what unsettles you. Being " +
                "impressed by it and being wary of it are, for you, the same judgement.",
        },
        {
            name: "The Unconvinced",
            share: 30,
            at: { "AI Realism": -0.8, "AI Enthusiasm": -0.5, "AI Apprehension": 0.3 },
            reading:
                "you are not much taken with AI, and not much impressed by it either. You doubt it can really do what it is " +
                "said to, you expect the seams to show and you are less excited about it than most people.",
        },
    ]

    // The nearest archetype, or null while any dimension is unfinished, absent
    // from the run, or without the norm its z score needs.
    function aiArchetype() {
        const z = {}
        for (const dimension of ARCHETYPE_ON) {
            const norm = known(dimension) && normOf(dimension)
            const value = norm && norm.sd ? score(dimension) : undefined
            if (value === undefined) return null
            z[dimension] = (value - norm.mean) / norm.sd
        }

        let nearest = null
        let closest = Infinity
        for (const type of ARCHETYPES) {
            const apart = ARCHETYPE_ON.reduce((sum, dimension) => sum + Math.pow(z[dimension] - type.at[dimension], 2), 0)
            if (apart < closest) {
                closest = apart
                nearest = type
            }
        }
        return nearest
    }

    // Locked, the figure keeps its shape — a stand-in name and a 00% share,
    // blurred — and carries no live buttons.
    function renderArchetype(type, locked) {
        const holder = document.createElement("div")
        holder.className = "archetype"
        const shown = locked ? ARCHETYPES[0] : type

        const piece = (className, text, blank) => {
            const line = document.createElement("p")
            line.className = className + (blank && locked ? " blank" : "")
            line.textContent = text
            holder.appendChild(line)
        }

        piece("archetype__emoji", "🤖")
        piece("archetype__lead", "Based on your answers, you are")
        piece("archetype__name", shown.name, true)
        piece("archetype__share", (locked ? "00" : "about " + shown.share) + "% of people answer like this", true)
        piece("archetype__told", sentence(shown.reading), true)

        if (!locked) holder.appendChild(voteButtons(ARCHETYPE_KEY))
        return holder
    }

    return {
        ARCHETYPE_OF: ARCHETYPE_OF,
        ARCHETYPE_KEY: ARCHETYPE_KEY,
        ARCHETYPE_ON: ARCHETYPE_ON,
        aiArchetype: aiArchetype,
        renderArchetype: renderArchetype,
    }
}
