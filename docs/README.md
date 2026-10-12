# docs

The documentation: a deck about the app, for the people working on it.

Open `index.html`. Nothing to install, nothing to build, no server needed.
Arrow keys, space, Home and End move between slides, and so do a mouse's back
and forward buttons and scrolling on past the end of one; the slide you are on is in the address, so a link holds
its place. **Click a row of the Content table** to see what that instrument
asks — the same row again, or Escape, puts it away. On **Project: MINT
follow-up**, a card goes to its instrument's own slide and its items button
opens the same list, and a level on the run says what it asks when pointed at
and goes to it in the table when pressed. The three scales on the MINT's slide
can be answered.

| | |
|---|---|
| `index.html` | The slides. A slide is a `<section class="slide">`; adding one is writing another |
| `deck.css` | The look — the app's, restated |
| `deck.js` | Moving between the slides, and the item list a row opens |
| `items.js` | **Generated.** What each instrument asks |
| `build_slides.py` | **Writes the Content table and `items.js`** out of the app's own questions |

## The Content table is generated

```bash
python docs/build_slides.py
```

Run it whenever `content/` changes. It reads the app through
`data/synthetic/codebook.js` — so there is one reader of the questions, and it
is the one that already walks them the way `app.js` does — and writes the table
into the fenced stretch of `index.html` and the items into `items.js`. It needs
`bun` or `node` on the path for that, and nothing else; the deck itself stays a
folder you can open off the disk. `--check` says whether the deck is stale and
exits 1 if it is, for a hook or a CI step.

**`ROWS` in that script is the one hand-written thing**, and has to be: a row's
reference ("Gosling et al., 2003") is nowhere in `content/`, and the table's
unit is the *instrument* where the content's is the *questionnaire* — `singles`
is one questionnaire holding ten scales, `hexaco18` holds the HEX-ACO-18 and the
KSE-G, `control` holds four two-item proxies.

That mapping is **checked rather than trusted**: every item the app asks must be
claimed by exactly one row, and every row must claim at least one item, or the
script stops and says which. So adding a questionnaire to `content/` without
adding its row here is a failure rather than a table that quietly goes stale —
which is the whole reason the table is generated.

It sanitises what cannot go into a table: an item that words itself from an
earlier answer becomes one of its wordings, marked; `text` is HTML, so the tags
come off and the `<small>` gloss stays; and a reasoning item drawn as a picture
is marked `[with a figure]`, since four of them share a stem and would otherwise
read as the same question four times.

## The study slides are not

**Project: MINT follow-up** — what a project is, and the MINT and the BAIT
joined to their levels on a timeline of the run — is written by hand, so nothing tells you when its words
are wrong. It restates the levels of the `mint` battery and their names and the
samples the norms come from: read it again when `content/timeline.js`,
`content/block_mint.js` or `content/block_bait.js` changes. What it does not
restate is read out of the table by `deck.js`: how many items a card offers
(each row carries `data-questionnaires`, the keys it draws from, and a card
names one in `data-opens`) and what a level on the run asks (the table's first
column against the level's `data-level`). The lines from the cards to the
levels are one svg stretched across the run, written in elevenths of its
width, so a level added to or taken off the run moves every join.

The MINT's and the BAIT's own slides after the table, and the HiTOP's after them, are
hand-written throughout: the MINT's three scales restate `MINT_FORMATS` in
`content/block_mint.js`, the HiTOP's spectra and their item counts restate
`content/block_hitop.js`, and the items quoted on all three are their
instruments' own, verbatim.

**`figures/hitop_model.png` is not ours**: it is ColinFreilich's HiTOP model
off Wikimedia Commons (File:HiTOP_Model.png), under CC BY-SA 4.0, which asks
for a credit wherever it is shown — it has one under the figure and in its
enlarged view — and for any change to it to be said. It is kept exactly as
published, so there is none to say; a cut or recoloured copy would want
that written into the credit, and would be shared under the same licence.

## The look

The app's, **restated rather than imported** — the tokens at the top of
`deck.css` are the ones in `css/style.css`, and the first slide is `.hero` from
the root `index.html`. Nothing here reaches into the app at run time, so this
page can never break it; the price is that a change to the app's look has to be
brought across by hand. The three logos are the app's own files, one folder up.

## What it does not do

No presenter notes, no transitions, no click-through reveals, no export — the
browser's own print-to-PDF is the export, and there is a `@media print` rule so
it comes out one slide a page.

**Figures are described, not drawn.** They could be: `js/figures/*.js` are plain
factories, and a fake engine handed to `makeResults()` renders any of them at
any scores. That would mean loading the app's whole content layer into this
page, which is more machinery than a companion deck has earned so far.
