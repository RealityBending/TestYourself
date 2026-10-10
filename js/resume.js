/* =========================================================================
   Carrying on: a run left partway through, kept in this browser, and the
   draws it was made from.

   A run is thirty or forty minutes long, and a tab closed halfway through it
   used to be the end of it. `app.js` now keeps where the run has got to in
   `localStorage` as it goes (`keep()`), and a page loaded later on the same
   device can pick it back up. **A resumed run has to be the same run**, and
   four things about one are drawn afresh on every load: the order of the
   drawn levels and blocks (`shuffle()` in content/timeline.js, at script
   load), the MINT's format (content/block_mint.js), the order of each
   questionnaire's items and, in a test run, which items are thinned
   (app.js). So every one of those draws comes off `chance()` below, one
   generator seeded once, and a run carried on is rebuilt from the seed it was
   first built from. What is kept is then only the seed, the answers, the fork
   choices, where the run had got to and the times.

   The seed has to be known before content/timeline.js runs, which is the
   whole reason this is a file of its own and loaded before content/: it reads
   the kept run, decides whether this load is carrying it on, and seeds the
   generator. Nothing else here touches the run. Globals: `RESUME_KEY`,
   `RESUME_SHAPE`, `KEPT_RUN`, `RESUMED`, `RESUME_CHOSEN`, `RUN_SEED`, `chance()`, `forgetRun()`.
   ========================================================================= */

// Where the run is kept, and the shape it is kept in. A kept run of any other
// shape was written by other code and is let go of rather than half read.
const RESUME_KEY = "abyss:run"
const RESUME_SHAPE = 1
// Set in this tab's session storage while a run is live in it, so that a
// reload in the middle of the test carries straight on rather than asking.
// A new tab or a new visit has none, and is asked (the landing page's offer).
const RESUME_TAB = "abyss:live"
// A run is kept this long after it was last touched, and no longer: what is
// kept is somebody's answers on a device other people may use.
const KEPT_FOR = 7 * 24 * 60 * 60 * 1000
// And this long on the participant's account (the lab's hub, `?account`),
// behind its sign-in rather than in an open browser, since carrying on later
// on another device is what an account is for (app.js, `fetchKept`). A run
// is still let go of whenever the test changes under it (`dealt`).
const KEPT_ON_ACCOUNT = 30 * 24 * 60 * 60 * 1000

// Storage can be refused outright (a private window, blocked site data), and
// then nothing is kept and every run is a new one, as before.
function storage(kind) {
    try {
        return window[kind]
    } catch (e) {
        return null
    }
}

// Let go of the kept run: at the end of the test, on "Start again", and when
// a kept run no longer matches the test it was taken on. The copy on an
// account goes with it (js/account.js, which takes the dashboard's "Carry on"
// away with it), or the landing page would fetch it back and offer it again —
// unless `here` says only this browser's copy is to go: at the end of the
// test, whose last save to the account let go of the state itself, and when
// the browser's week is up, the account keeping its own for a month.
function forgetRun(here) {
    try {
        storage("localStorage").removeItem(RESUME_KEY)
        storage("sessionStorage").removeItem(RESUME_TAB)
    } catch (e) {}
    if (!here && ACCOUNT.on && ACCOUNT.who()) ACCOUNT.dropState().catch((e) => console.warn(e))
}

// The run kept in this browser, if there is one still worth offering.
const KEPT_RUN = (() => {
    let kept = null
    try {
        kept = JSON.parse(storage("localStorage").getItem(RESUME_KEY))
    } catch (e) {}
    if (!kept || kept.shape !== RESUME_SHAPE) return null
    if (!(Date.now() - new Date(kept.keptAt).getTime() < KEPT_FOR)) {
        forgetRun(true)
        return null
    }
    return kept
})()

// How this tab was left: "1" while a run is live in it (so a reload finds
// it), "chosen" when "Carry on" on the landing page marked it and loaded the
// link the run began from — the question of whose run it is already answered,
// so `RESUME_CHOSEN` spares the page asking it again.
const RESUME_MARK = (() => {
    try {
        return storage("sessionStorage").getItem(RESUME_TAB)
    } catch (e) {
        return null
    }
})()
const RESUME_CHOSEN = RESUME_MARK === "chosen"

// Whether this load carries the kept run on: the tab was marked, and the link
// is the one it began from, since the link says which blocks were asked and in
// which order.
const RESUMED = KEPT_RUN && (RESUME_MARK === "1" || RESUME_CHOSEN) && KEPT_RUN.search === location.search ? KEPT_RUN : null

// The draws of the run: mulberry32, which is small, fast and plenty for
// putting things in an order. Seeded from the kept run when it is being
// carried on, and otherwise fresh.
const RUN_SEED = RESUMED ? RESUMED.seed : crypto.getRandomValues(new Uint32Array(1))[0]

const chance = (() => {
    let state = RUN_SEED >>> 0
    return () => {
        state = (state + 0x6d2b79f5) >>> 0
        let t = state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
})()
