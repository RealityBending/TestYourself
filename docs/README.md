# docs

The documentation: one page about the app, for the people working on it,
read by scrolling down it.

Open `index.html`. Nothing to install, nothing to build, no server needed.
A hero and four chapters — the trouble with surveys, what the Abyss is, the
MINT follow-up project, and the Content table — each coming up as it is
scrolled into view, with a nav along the top for jumping between them.
**Click a row of the Content table** to see what that instrument asks — the
same row again, or Escape, puts it away. On the project chapter, a card's
items button opens the same list and goes to it, and a level on the run says
what it asks when pointed at and goes to it in the table when pressed.

**Link to a chapter** with its id on the address (`index.html#project`),
or **to an instrument's items** with its questionnaire key
(`index.html#mint`, which opens that row). The address follows whatever is
on screen — the chapter, or the row that is open — so copying it links
there, and the `#` after a chapter's number copies that link.

| | |
|---|---|
| `index.html` | The page. A chapter is a `<section class="chapter">`; adding one is writing another and naming it in the nav |
| `docs.css` | The look — the app's, restated |
| `docs.js` | What moves on scrolling, and the item list a row opens |
| `items.js` | **Generated.** What each instrument asks |
| `build_slides.py` | **Writes the Content table and `items.js`** out of the app's own questions |
| `figures/` | The pictures, shared with the deck |
| `presentation/` | **The slide deck this page grew out of, kept whole** — see below |

## The slide deck under `presentation/`

The page replaces a deck of nine slides (October 2026). The deck is kept
whole in `presentation/` (`index.html`, `deck.css`, `deck.js`, reading
`../items.js` and `../figures/`), because it still holds the chapters the
page does not yet have: the MINT and the BAIT at length, the HiTOP, and what
is expected of a pilot's feedback. Those are to be brought across one at a
time; until then they live there. Open `presentation/index.html` for them.
Arrow keys, space, Home and End move between slides, and so do a mouse's
back and forward buttons and scrolling on past the end of one; the slide you
are on is in the address, so a link holds its place.

## The Content table is generated

```bash
python docs/build_slides.py
```

Run it whenever `content/` changes. It reads the app through
`data/synthetic/codebook.js` — so there is one reader of the questions, and it
is the one that already walks them the way `app.js` does — and writes the table
into the fenced stretch of **both** `index.html` and `presentation/index.html`,
and the items into `items.js`. It needs `bun` or `node` on the path for that,
and nothing else; the page itself stays a folder you can open off the disk.
`--check` says whether the docs are stale and exits 1 if they are, for a hook
or a CI step.

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

## The project chapter is not

**Project: MINT follow-up** — what a project is, and the MINT and the BAIT
joined to their levels on a timeline of the run — is written by hand, so
nothing tells you when its words are wrong. It restates the levels of the
`mint` battery and their names: read it again when `content/timeline.js`,
`content/block_mint.js` or `content/block_bait.js` changes. What it does not
restate is read out of the table by `docs.js`: how many items a card offers
(each row carries `data-questionnaires`, the keys it draws from, and a card
names one in `data-opens`) and what a level on the run asks (the table's first
column against the level's `data-level`). The lines from the cards to the
levels are one svg stretched across the run, written in elevenths of its
width, so a level added to or taken off the run moves every join.

**`figures/hitop_model.png` is not ours**: it is ColinFreilich's HiTOP model
off Wikimedia Commons (File:HiTOP_Model.png), under CC BY-SA 4.0, which asks
for a credit wherever it is shown — the deck has one under the figure and in
its enlarged view — and for any change to it to be said. It is kept exactly as
published, so there is none to say; a cut or recoloured copy would want
that written into the credit, and would be shared under the same licence.

## The look

The app's, **restated rather than imported** — the tokens at the top of
`docs.css` are the ones in `css/style.css`, and the hero is `.hero` from
the root `index.html`, wheel and all. Nothing here reaches into the app at run
time, so this page can never break it; the price is that a change to the
app's look has to be brought across by hand. The three logos are the app's
own files, one folder up.

Everything written `data-reveal` comes up as it is scrolled into view, once,
its children written with `--i` a beat apart; `prefers-reduced-motion` shows
it all at once. The hero sinks as the page is scrolled, the way the app's does.

## What it does not do

No presenter notes, no click-through reveals, no export — the browser's own
print-to-PDF is the export, and there is a `@media print` rule so it comes
out a chapter a page.

**Figures are described, not drawn.** They could be: `js/figures/*.js` are plain
factories, and a fake engine handed to `makeResults()` renders any of them at
any scores. That would mean loading the app's whole content layer into this
page, which is more machinery than a companion page has earned so far.
