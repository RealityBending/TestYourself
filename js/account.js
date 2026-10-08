/* =========================================================================
   The Rebel Participant Hub's client: the account a participant has across
   the lab's apps, and everything that talks to the backend it is kept on.
   The one copy that is edited is this one, in RealityBending/me; each app
   keeps a copy of its own, pinned by `VERSION` (see AGENTS.md, **The
   client**), the way it would keep any other dependency.

   An app loads it with a tag naming itself, before anything that reads it:

       <script src="js/account.js" data-app="abyss"></script>

   and gets one global, `ACCOUNT`. It is plain `fetch` against Firebase's REST
   endpoints rather than the Firebase SDK, which would be a dependency of
   every app that loads it.

   The key below is not a secret: a Firebase web key names the project and is
   read off any page that uses it. **What keeps one account out of another's
   data is the database's rules** (`firestore.rules`, beside this folder), and
   nothing in this file.

   Every call can fail — no network, a refused key, rules not published — and
   every caller treats each as best-effort: an app goes on without its
   account, as it would without storage.
   ========================================================================= */

const ACCOUNT = (() => {
    const VERSION = "0.1.0"

    const KEY = "AIzaSyCADzQruhIHAW27TTIjmdrmeQY_KB6-bwk"
    const PROJECT = "reality-bending-lab"
    const SIGN_UP = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + KEY
    const REFRESH = "https://securetoken.googleapis.com/v1/token?key=" + KEY
    const DATABASE = "projects/" + PROJECT + "/databases/(default)/documents"
    const API = "https://firestore.googleapis.com/v1/"

    // Which app this page is: named on the tag that loaded this file, so that
    // the copy an app keeps is the hub's file unchanged.
    const app = (document.currentScript && document.currentScript.dataset.app) || null

    // Where the account is held in this browser: its id and the tokens that
    // prove it, the refresh token being what keeps it signed in past the hour
    // an id token lasts. Every app on the lab's domain shares it, which is
    // what makes one sign-in serve all of them.
    const HELD = "rebel:account"

    // Asked for by the link alone (`?account`), so that no participant meets
    // it before the ethics amendment says they may.
    const on = new URLSearchParams(location.search).has("account")

    function held() {
        try {
            return JSON.parse(localStorage.getItem(HELD))
        } catch (e) {
            return null
        }
    }

    function hold(account) {
        try {
            localStorage.setItem(HELD, JSON.stringify(account))
        } catch (e) {}
    }

    // A refusal says why in its body (`error.message` from sign-in, such as
    // ADMIN_ONLY_OPERATION when anonymous sign-in is off; `error.status` from
    // the database, such as PERMISSION_DENIED), which is the whole of what
    // makes it fixable, so it goes into the error.
    async function reply(response) {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) {
            const why = body.error ? body.error.status || body.error.message || "" : ""
            const error = new Error("account: " + response.status + " " + why)
            error.status = response.status
            throw error
        }
        return body
    }

    // An id token lasts an hour; one about to run out is traded for a new one
    // a minute early rather than sent and refused.
    async function signedIn() {
        const account = held()
        if (!account) throw new Error("account: not signed in")
        if (Date.now() < account.until) return account
        const body = await reply(
            await fetch(REFRESH, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(account.refresh),
            }),
        )
        const fresh = { uid: body.user_id, token: body.id_token, refresh: body.refresh_token, until: Date.now() + (body.expires_in - 60) * 1000 }
        hold(fresh)
        return fresh
    }

    function asked(account, extra) {
        return Object.assign({ Authorization: "Bearer " + account.token }, extra || {})
    }

    /* ----------------------- Firestore's typed values ---------------------- */

    // The database stores every value with its type spelled out. These two
    // turn a plain object into that and back, for the documents a dashboard
    // reads field by field; what only its own app reads goes as one string.
    function typed(value) {
        if (value === null || value === undefined) return { nullValue: null }
        if (value instanceof Date) return { timestampValue: value.toISOString() }
        if (typeof value === "boolean") return { booleanValue: value }
        if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
        if (typeof value === "string") return { stringValue: value }
        if (Array.isArray(value)) return { arrayValue: { values: value.map(typed) } }
        return { mapValue: { fields: fieldsOf(value) } }
    }

    function fieldsOf(object) {
        const fields = {}
        for (const name of Object.keys(object)) fields[name] = typed(object[name])
        return fields
    }

    function plain(value) {
        if ("nullValue" in value) return null
        if ("booleanValue" in value) return value.booleanValue
        if ("integerValue" in value) return Number(value.integerValue)
        if ("doubleValue" in value) return value.doubleValue
        if ("timestampValue" in value) return value.timestampValue
        if ("stringValue" in value) return value.stringValue
        if ("arrayValue" in value) return (value.arrayValue.values || []).map(plain)
        if ("mapValue" in value) return plainOf(value.mapValue.fields || {})
        return null
    }

    function plainOf(fields) {
        const object = {}
        for (const name of Object.keys(fields)) object[name] = plain(fields[name])
        return object
    }

    /* ------------------------------- where -------------------------------- */

    // The layout (AGENTS.md, **The database**): everything an account has is
    // under `accounts/<uid>`, which is what lets one rule guard all of it.
    const accountDoc = (uid) => DATABASE + "/accounts/" + uid
    const summaryDoc = (uid) => accountDoc(uid) + "/apps/" + app
    const stateDoc = (uid) => summaryDoc(uid) + "/private/state"

    /* ------------------------------ signing in ---------------------------- */

    // Anonymous, once a browser: the first app to sign in makes the account,
    // and writes where the participant first came from (`source`, the app's
    // own reading of its link), which is what later decides whether linking
    // an email may be offered — never to anybody from Prolific.
    async function signIn(source) {
        if (held()) return held().uid
        const body = await reply(
            await fetch(SIGN_UP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnSecureToken: true }),
            }),
        )
        const account = { uid: body.localId, token: body.idToken, refresh: body.refreshToken, until: Date.now() + (body.expiresIn - 60) * 1000 }
        hold(account)
        await reply(
            await fetch(API + accountDoc(account.uid), {
                method: "PATCH",
                headers: asked(account, { "Content-Type": "application/json" }),
                body: JSON.stringify({ fields: fieldsOf({ created: new Date(), source: source || null, app: app }) }),
            }),
        )
        return account.uid
    }

    // Signing out forgets the account in this browser. An anonymous account
    // forgotten cannot be signed back into, so what it held is out of reach.
    function signOut() {
        try {
            localStorage.removeItem(HELD)
        } catch (e) {}
    }

    function who() {
        const account = held()
        return account ? account.uid : null
    }

    /* ------------------------------- claims ------------------------------- */

    // **A platform id is a label on an account, never the way into it**: a
    // SONA code can be guessed and a Prolific id is no secret, so arriving
    // with one opens nothing. What it does is claim the id for this account,
    // once, so that the same id arriving on a second account is told apart
    // rather than counted as a second person. The claim is named by a hash of
    // the source and the id, so the database lists no platform ids, and is
    // written once and read only by the account that made it — a claim
    // somebody else holds and no claim at all look the same from outside.
    // Hands back "mine" (made earlier by this account), "claimed" (made now)
    // or "taken" (another account has it).
    async function hashOf(text) {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
    }

    async function claim(source, id) {
        const account = await signedIn()
        const name = await hashOf(source + ":" + id)
        const mine = await fetch(API + DATABASE + "/claims/" + name, { headers: asked(account) })
        if (mine.ok) return "mine"
        try {
            await reply(
                await fetch(API + DATABASE + "/claims?documentId=" + name, {
                    method: "POST",
                    headers: asked(account, { "Content-Type": "application/json" }),
                    body: JSON.stringify({ fields: fieldsOf({ uid: account.uid, at: new Date() }) }),
                }),
            )
            return "claimed"
        } catch (e) {
            if (e.status === 409 || e.status === 403) return "taken"
            throw e
        }
    }

    /* ------------------------------ an app's own -------------------------- */

    // What an app writes, in one request: its **summary**, the small document
    // the dashboard reads (`apps/<app>`, see AGENTS.md, **The summary**), and
    // its **state**, whatever it needs to carry a participant on, which only
    // the app reads and which goes as one string (`private/state`). Either may
    // be left out; a `state` of null deletes it. `keepalive` lets a save sent
    // as the tab is hidden outlive the tab.
    async function save(what) {
        const account = await signedIn()
        const writes = []
        if (what.summary) {
            const summary = Object.assign({}, what.summary, { updatedAt: new Date() })
            writes.push({ update: { name: summaryDoc(account.uid), fields: fieldsOf(summary) } })
        }
        if (what.state) {
            writes.push({ update: { name: stateDoc(account.uid), fields: fieldsOf({ state: JSON.stringify(what.state), savedAt: new Date() }) } })
        } else if (what.state === null) {
            writes.push({ delete: stateDoc(account.uid) })
        }
        if (!writes.length) return
        await reply(
            await fetch(API + DATABASE + ":commit", {
                method: "POST",
                keepalive: true,
                headers: asked(account, { "Content-Type": "application/json" }),
                body: JSON.stringify({ writes: writes }),
            }),
        )
    }

    // The app's state, or null where there is none.
    async function loadState() {
        const account = await signedIn()
        const response = await fetch(API + stateDoc(account.uid), { headers: asked(account) })
        if (response.status === 404) return null
        const body = await reply(response)
        return JSON.parse(body.fields.state.stringValue)
    }

    async function dropState() {
        return save({ state: null })
    }

    // Every app's summary on this account, for the dashboard.
    async function summaries() {
        const account = await signedIn()
        const body = await reply(await fetch(API + accountDoc(account.uid) + "/apps", { headers: asked(account) }))
        return (body.documents || []).map((doc) => Object.assign({ app: doc.name.split("/").pop() }, plainOf(doc.fields || {})))
    }

    return { VERSION, app, on, signIn, signOut, who, claim, save, loadState, dropState, summaries }
})()
