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
    const VERSION = "0.5.0"

    const KEY = "AIzaSyCADzQruhIHAW27TTIjmdrmeQY_KB6-bwk"
    const PROJECT = "reality-bending-lab"
    const SIGN_UP = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + KEY
    const SIGN_IN_WITH_PASSWORD = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + KEY
    const SEND_CODE = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=" + KEY
    const DELETE = "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=" + KEY
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

    // Whether this browser keeps anything at all (a private window, blocked
    // site data): an account it cannot hold would be made again on every
    // page, each one left behind as an empty sign-in record and a document.
    function keeps() {
        try {
            localStorage.setItem(HELD + ":probe", "1")
            localStorage.removeItem(HELD + ":probe")
            return true
        } catch (e) {
            return false
        }
    }

    // An account held with its code worked out (see `code`), which is what an
    // app reads as it writes its research record, so it is ready before then.
    async function settle(account) {
        if (!account.code) account.code = await codeOf(account.uid)
        hold(account)
        return account
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
            error.reason = why
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
        // Only the tokens are new: the code, the email and the platforms held
        // beside them stay.
        const fresh = Object.assign({}, account, {
            uid: body.user_id,
            token: body.id_token,
            refresh: body.refresh_token,
            until: Date.now() + (body.expires_in - 60) * 1000,
        })
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
    //
    // The account is held only once its document is written, so an account
    // in this browser always has one: a write that fails drops the account,
    // leaving an empty sign-in record behind, and the next sign-in makes
    // another. The document is written once (`exists=false`), which is what
    // rules holding it to that would ask for. A browser that keeps nothing is
    // given no account, rather than a new one on every page.
    //
    // An account held from before codes (`0.4.0`) has its code worked out now.
    async function signIn(source) {
        const had = held()
        if (had) return (had.code ? had : await settle(had)).uid
        if (!keeps()) throw new Error("account: this browser keeps nothing, so no account is made")
        const body = await reply(
            await fetch(SIGN_UP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnSecureToken: true }),
            }),
        )
        const account = fromSignIn(body)
        await register(account, source)
        await settle(account)
        return account.uid
    }

    function register(account, source) {
        return fetch(API + accountDoc(account.uid) + "?currentDocument.exists=false", {
            method: "PATCH",
            headers: asked(account, { "Content-Type": "application/json" }),
            body: JSON.stringify({ fields: fieldsOf({ created: new Date(), source: source || null, app: app }) }),
        }).then(reply)
    }

    // Signing out forgets the account in this browser. An anonymous account
    // forgotten cannot be signed back into, so what it held is out of reach;
    // one with an email is signed back into with it.
    function signOut() {
        try {
            localStorage.removeItem(HELD)
        } catch (e) {}
    }

    function who() {
        const account = held()
        return account ? account.uid : null
    }

    // The account's code in an app's research record: what tells the runs of
    // one person from the runs of many, across apps, devices and months, in a
    // deposit that never holds the account's id (the key to its sign-in
    // records, and so to its email where it has one). Worked out from the id
    // rather than kept, so that it is the same on every device with nothing
    // to look up; null until an account is held and its code worked out.
    async function codeOf(uid) {
        return (await hashOf("rebel:" + uid)).slice(0, 16)
    }

    function code() {
        const account = held()
        return account ? account.code || null : null
    }

    // Whether adding an email may be offered to the account held: an
    // anonymous one, that has never arrived with a Prolific id, since Prolific
    // does not allow collecting its participants' contact details (AGENTS.md,
    // **Who is offered what**). Not whether it may be done: anybody may make
    // an account of their own on the dashboard.
    function offersEmail() {
        const account = held()
        return !!account && !email() && !(account.platforms && account.platforms.prolific)
    }

    // The email of the account held, or null for an anonymous one. Read off
    // the id token, which carries it, before what was kept beside it at
    // sign-in: a copy of this file from before emails, refreshing the token in
    // another app, keeps the token and drops the rest.
    function email() {
        const account = held()
        if (!account) return null
        try {
            return said(account.token).email || account.email || null
        } catch (e) {
            return account.email || null
        }
    }

    // What a token says of itself: the middle of the three parts of a JWT.
    // Read, not checked; the backend checks what is sent to it.
    function said(token) {
        return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    }

    function fromSignIn(body, address) {
        return {
            uid: body.localId,
            token: body.idToken,
            refresh: body.refreshToken,
            until: Date.now() + (body.expiresIn - 60) * 1000,
            email: body.email || address || null,
        }
    }

    function post(url, request) {
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        }).then(reply)
    }

    /* ------------------------ signing in with an email -------------------- */

    // An address and a password, kept by Firebase with its sign-in records
    // (the password hashed; see AGENTS.md, **Signing in with an email**).
    // Firebase's reason for a refusal — EMAIL_EXISTS, INVALID_LOGIN_CREDENTIALS,
    // WEAK_PASSWORD and the rest — is on the error as `reason`, for the page to
    // put in its own words.
    //
    // Making one **links** the account already held in this browser, the
    // anonymous one an app made, so that what it has goes with it; with none
    // held, a new account is made and its document written as `signIn`'s is.
    // Hands back "linked" or "made". An address already on an account of its
    // own is refused (EMAIL_EXISTS), and signing into that one instead is the
    // page's to offer.
    async function signUpWithEmail(address, password) {
        if (email()) throw new Error("account: this account has an email already")
        if (!keeps()) throw new Error("account: this browser keeps nothing, so no account is made")
        const linking = held() ? await signedIn() : null
        const request = { email: address, password: password, returnSecureToken: true }
        if (linking) request.idToken = linking.token
        const account = fromSignIn(await post(SIGN_UP, request), address)
        // Linking keeps the account's id, so its code, its platforms and its
        // claims go with it.
        if (linking) Object.assign(account, { platforms: linking.platforms, claims: linking.claims })
        else await register(account, null)
        await settle(account)
        return linking ? "linked" : "made"
    }

    // Signing back in. An account held in this browser that is not this one is
    // let go of — an anonymous one for good, which is the page's to warn of.
    // A sign-up whose document was never written gets it now.
    async function signInWithEmail(address, password) {
        const request = { email: address, password: password, returnSecureToken: true }
        const account = fromSignIn(await post(SIGN_IN_WITH_PASSWORD, request), address)
        const has = await fetch(API + accountDoc(account.uid), { headers: asked(account) })
        if (has.status === 404) await register(account, null)
        else {
            const kept = plainOf((await reply(has)).fields || {})
            Object.assign(account, { platforms: kept.platforms || null, claims: kept.claims || null })
        }
        await settle(account)
    }

    // Firebase emails a link to a page of its own for choosing a new password.
    async function resetPassword(address) {
        await post(SEND_CODE, { requestType: "PASSWORD_RESET", email: address })
    }

    /* ------------------------------- claims ------------------------------- */

    // **A platform id is a label on an account, never the way into it**: a
    // SONA code can be guessed and a Prolific id is no secret, so arriving
    // with one opens nothing. What it does is claim the id for this account,
    // once, so that the same id arriving on a second account is told apart
    // rather than counted as a second person. The claim is named by a hash of
    // the platform and the id, so the list of claims names no platform ids
    // (an app's own state may hold one, with the answers), and is
    // written once and read only by the account that made it — a claim
    // somebody else holds and no claim at all look the same from outside.
    // Hands back "mine" (made earlier by this account), "claimed" (made now)
    // or "taken" (another account has it).
    //
    // `platform` is the platform's name and not a link's spelling of where it
    // was handed out ("sona", never "SONA" on one link and "sona" on
    // another), and is taken in lower case whatever it is given in, or one
    // person's id would be two claims. Whatever the claim comes to, the
    // platform is noted on the account (`platforms`), which is what keeps
    // email from being offered to anybody who arrived from Prolific
    // (`offersEmail`): it is read off the account rather than off one link.
    // A claim that is the account's is noted there too (`claims`, by its
    // name), since claims are never listed and deleting the account has to
    // find its own (`deleteAccount`).
    async function hashOf(text) {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
        return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
    }

    async function claim(platform, id) {
        const account = await signedIn()
        const on = String(platform).trim().toLowerCase()
        const name = await hashOf(on + ":" + id)
        const outcome = await (async () => {
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
        })()
        await noted(account, on, outcome === "taken" ? null : name)
        return outcome
    }

    // The platform, and the claim where it is the account's, written into the
    // account's document once each and held beside the account in this
    // browser.
    async function noted(account, platform, name) {
        const fields = {}
        const paths = []
        if (!(account.platforms && account.platforms[platform])) {
            fields.platforms = typed({ [platform]: true })
            paths.push(fieldPath("platforms", platform))
        }
        if (name && !(account.claims && account.claims[name])) {
            fields.claims = typed({ [name]: true })
            paths.push(fieldPath("claims", name))
        }
        if (!paths.length) return
        await commit(account, [
            { update: { name: accountDoc(account.uid), fields: fields }, updateMask: { fieldPaths: paths }, currentDocument: { exists: true } },
        ])
        const now = held()
        if (now && now.uid === account.uid) {
            hold(
                Object.assign(now, {
                    platforms: Object.assign({}, now.platforms, { [platform]: true }),
                    claims: name ? Object.assign({}, now.claims, { [name]: true }) : now.claims,
                }),
            )
        }
    }

    /* ------------------------- deleting the account ----------------------- */

    // Everything the hub keeps for the account — each app's summary and state,
    // its claims, its document — and then its sign-in record, so that there is
    // nothing left to sign into, and nothing joins the account's code in the
    // apps' research records to an email any longer. **Not the research
    // records**: what was answered went to each app's own record (DataPipe) as
    // it was given, and stays there, which the page offering this has to say.
    //
    // An account with an email is asked its password again: Firebase deletes a
    // sign-in record only for a sign-in made minutes before, and it is the last
    // word before something that cannot be undone. An anonymous account cannot
    // sign in again, and one made longer ago may have its sign-in record
    // refused (CREDENTIAL_TOO_OLD_LOGIN_AGAIN): what is left of it then is an
    // id with nothing under it, as a sign-up whose document was never written
    // leaves. Safe to run again after a failure: deleting what is already gone
    // is no error.
    async function deleteAccount(password) {
        const address = email()
        let account = await signedIn()
        if (address) account = fromSignIn(await post(SIGN_IN_WITH_PASSWORD, { email: address, password: password, returnSecureToken: true }), address)
        const doc = await fetch(API + accountDoc(account.uid), { headers: asked(account) })
        const kept = doc.status === 404 ? {} : plainOf((await reply(doc)).fields || {})
        const apps = await reply(await fetch(API + accountDoc(account.uid) + "/apps", { headers: asked(account) }))
        // A claim is deleted on its own, since one not there would refuse the
        // whole of a request it was in.
        for (const name of Object.keys(kept.claims || {})) {
            await fetch(API + DATABASE + "/claims/" + name, { method: "DELETE", headers: asked(account) }).catch(() => {})
        }
        const writes = []
        for (const one of apps.documents || []) writes.push({ delete: one.name + "/private/state" }, { delete: one.name })
        writes.push({ delete: accountDoc(account.uid) })
        await commit(account, writes)
        try {
            await post(DELETE, { idToken: account.token })
        } catch (e) {
            if (address || !/^CREDENTIAL_TOO_OLD/.test(e.reason || "")) throw e
        }
        signOut()
    }

    /* ------------------------------ an app's own -------------------------- */

    // A field's path as Firestore reads one: a name that is not a plain
    // identifier goes in backticks.
    function fieldPath(...names) {
        return names.map((name) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : "`" + name.replace(/[\\`]/g, "\\$&") + "`")).join(".")
    }

    // Several writes in one request (Firestore's `commit`), all or none.
    // `leaving` sends it `keepalive`, which is what lets a save sent as the
    // tab is hidden outlive the tab — and what caps it at 64 KiB, so it is
    // asked for there and nowhere else.
    async function commit(account, writes, leaving) {
        await reply(
            await fetch(API + DATABASE + ":commit", {
                method: "POST",
                keepalive: !!leaving,
                headers: asked(account, { "Content-Type": "application/json" }),
                body: typeof writes === "string" ? writes : JSON.stringify({ writes: writes }),
            }),
        )
    }

    // What a keepalive request may carry, with room left under the browser's
    // 64 KiB for anything else going out as the tab closes.
    const LEAVING_LIMIT = 60 * 1024

    // What an app writes, in one request: its **summary**, the small document
    // the dashboard reads (`apps/<app>`, see AGENTS.md, **The summary**), and
    // its **state**, whatever it needs to carry a participant on, which only
    // the app reads and which goes as one string (`private/state`). Either may
    // be left out; a `state` of null deletes it.
    //
    // **`leaving`** is for the save sent as the tab is hidden, sent
    // `keepalive` so that it outlives the tab. A state too big for that (a
    // long run's grows past 60 KB) is left as it was last saved, and the
    // summary goes without it: the end of every level saves it whole, by a
    // request with no such cap.
    //
    // **`done`** is the subtests finished, by key (`{ key: { at, results } }`),
    // and is merged into the summary's rather than written over it, so what
    // was done in one run is still there once another has begun, on this
    // device or another, with nothing read first. The summary's own fields are
    // written by name for the same reason, leaving `done` as it was. A subtest
    // done again is the latest in `done`, and every time it was done is kept
    // in **`history`**, by key and then by when, the same way: a retake
    // (AGENTS.md, **Test and retest**) puts nothing out of reach.
    async function save(what) {
        const account = await signedIn()
        const writes = []
        if (what.summary || what.done) {
            const summary = what.summary ? Object.assign({}, what.summary, { updatedAt: new Date() }) : {}
            delete summary.done
            delete summary.history
            const paths = Object.keys(summary).map((name) => fieldPath(name))
            const fields = fieldsOf(summary)
            const done = what.done || {}
            const keys = Object.keys(done)
            if (keys.length) {
                fields.done = typed(done)
                fields.history = { mapValue: { fields: {} } }
                for (const key of keys) {
                    const when = String(new Date(done[key].at).getTime() || 0)
                    paths.push(fieldPath("done", key), fieldPath("history", key, when))
                    fields.history.mapValue.fields[key] = { mapValue: { fields: { [when]: typed(done[key]) } } }
                }
            }
            writes.push({ update: { name: summaryDoc(account.uid), fields: fields }, updateMask: { fieldPaths: paths } })
        }
        let state = null
        if (what.state) {
            state = { update: { name: stateDoc(account.uid), fields: fieldsOf({ state: JSON.stringify(what.state), savedAt: new Date() }) } }
        } else if (what.state === null) {
            state = { delete: stateDoc(account.uid) }
        }
        if (state) {
            const whole = JSON.stringify({ writes: writes.concat(state) })
            if (!what.leaving || new Blob([whole]).size <= LEAVING_LIMIT) return commit(account, whole, what.leaving)
        }
        if (writes.length) await commit(account, writes, what.leaving)
    }

    // The app's state, or null where there is none.
    async function loadState() {
        const account = await signedIn()
        const response = await fetch(API + stateDoc(account.uid), { headers: asked(account) })
        if (response.status === 404) return null
        const body = await reply(response)
        return JSON.parse(body.fields.state.stringValue)
    }

    // The state deleted, and with it the summary's `url`, since there is
    // nothing left to carry on: a summary still holding the link would have
    // the dashboard offer "Carry on" into a page with nothing to carry on,
    // and that page then start a new run under the old link. Two requests,
    // the second only where there is a summary (a write naming a field of one
    // that is not there would make one, with nothing in it but that).
    async function dropState() {
        const account = await signedIn()
        await commit(account, [{ delete: stateDoc(account.uid) }])
        await commit(account, [
            {
                update: { name: summaryDoc(account.uid), fields: { url: typed(null) } },
                updateMask: { fieldPaths: ["url"] },
                currentDocument: { exists: true },
            },
        ]).catch(() => {})
    }

    // Every app's summary on this account, for the dashboard.
    async function summaries() {
        const account = await signedIn()
        const body = await reply(await fetch(API + accountDoc(account.uid) + "/apps", { headers: asked(account) }))
        return (body.documents || []).map((doc) => Object.assign({ app: doc.name.split("/").pop() }, plainOf(doc.fields || {})))
    }

    return {
        VERSION,
        app,
        on,
        signIn,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        deleteAccount,
        signOut,
        who,
        code,
        email,
        offersEmail,
        claim,
        save,
        loadState,
        dropState,
        summaries,
    }
})()
