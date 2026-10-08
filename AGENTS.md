# AGENTS.md

The one set of notes on this project. `CLAUDE.md` is a pointer to this file, not
a second copy — write here and nowhere else, or the two will drift.

Single-page survey app. No build, no dependencies, no framework, no tests.
`index.html` loads `js/account.js` first (the participant's account on the lab's
hub, a pilot asked for by `?account` alone), then `js/resume.js` (a run kept in this browser, and the
seed every draw of the run comes off), then the content (`content/timeline.js`, then a
`content/block_*.js` per block of questions), then `js/draw.js` (stateless
drawing helpers everything below it uses), then `js/snapshot.js` (a piece of
the page turned into a picture), then `js/figures/*.js` (one file
per figure a level closes on), then `js/results.js` (reads scores back), then
`js/app.js` (the engine) — and
three stylesheets in cascade order: `css/style.css` → `css/intro.css` →
`css/results.css`. Nothing is a module: each file adds to the globals the next
one reads, so **the order of the tags in `index.html` is the only thing holding
it together**. A new file means a new tag in the right place.

Run it: the `testyourself` config in `.claude/launch.json` serves the folder on
port 8123 (`python -m http.server`). Open a file change in the browser by
reloading — there is nothing to compile.

## Where things live

Three folders and the page that loads them: the questions, the code, the look.
A change usually needs one file out of one of them.

| | |
|---|---|
| `content/timeline.js` | **The frame the rest of `content/` is written into, and what is asked when.** **There is a timeline per battery**, `TIMELINE_ALL` (everything, General then every other level in one fork of three, and what a link naming none walks) and `TIMELINE_MINT` (the study the ethics application is written for, asked only by `?project=mint`), written out in full each rather than one derived from the other, and `BATTERIES` naming them; also `ASIDE`, blocks no battery asks, `HELD_TOGETHER`, the blocks that come and go as one (see **Batteries**), and `DEMOGRAPHICS`, the three blocks written on no level that open the run's first three places, whatever levels stand in them (see **The demographics open places**). A timeline is one entry per level, in order, naming that level's blocks — moving a block is moving its name from one line to another, and a block named nowhere here is never asked — **except an entry written `interlude: true`**, which is no level but blocks asked between the level before it and the one after (the interim on `mint`, see **The interim**). Each level also carries a `key` and a `name`: the key is what the saved file is written under (`ratings`, `qualityControl`) and never changes for the sake of the person reading it, the name is what the gauge's hover card, the results panel and the level screen call it (`levelName`, `levelTitle` in `app.js`) and is prose that may — and may carry `fork: n`, which puts it in order with the levels written next to it under the same `n`, the person choosing among `n` at a time (see **The fork**). A run of levels wrapped in `shuffle()` is asked in an order drawn for them instead (see **The drawn order**), which is why a timeline ends `.flat()`. Also `shuffle()` itself, which **draws nothing outside a browser** and hands the written order back — `data/synthetic/codebook.js` and `docs/build_slides.py` read this file too, and what they describe is what is asked rather than one draw of it. Also `WATER_SHARE`, the share of the scored levels that are in the water rather than in the rock (see **Beneath the floor**) — where the seabed falls is a share and not a flag on any level. Its colour on the gauge is not content — the stops run through one gradient by position (`levelColour`). Also `defineBlock()` and the `QUESTIONNAIRES` / `BLOCKS` the block files fill, `answerKey()` (the hash an item with a right answer carries in place of it — see **Right answers**, below), and, at the head of the file, an annotated skeleton of every field a block may carry. **Read that before editing anything in `content/`**; it says what the fields are, and this file says why. |
| `content/block_*.js` | Every question, scale, colour and norm, **split by block** — one stretch of the run that moves as a piece — so the file to open is the thing being changed rather than the position it happens to be asked in. **Content changes go here and nowhere else.** Each is one `defineBlock("name", [ … ])` over an ordered list of entries: briefings and questionnaires, each carrying its own `key`. |
| `content/block_UNUSED.js` | Questionnaires written but not asked, commented out, waiting on whatever they want before they can go in. Nothing in it defines a block, so nothing in it can be reached. |
| `js/account.js` | **The participant's account on the lab's hub, a copy of the hub's client** (`RealityBending/me`, edited there and never here; see **The account is the lab's, not this test's**). One global, `ACCOUNT` — `on` (the link carries `?account`, a pilot no participant meets), `signIn`, `claim`, `save` (the state and the dashboard's summary in one request), `loadState`, `dropState` — plain `fetch` against Firebase and no SDK. Its tag names the app (`data-app="abyss"`). `app.js` calls it from `stow()`, `summary()`, `fetchKept()`, the Start button and the end of the run; `js/resume.js`'s `forgetRun` drops the state with the browser's copy, which is why it is loaded before that file. |
| `js/resume.js` | **A run left partway through, kept in this browser, and the draws it was made from** (see **Carrying on**). Loaded before `content/`, since the seed has to be known before the timeline draws anything. It reads the kept run out of `localStorage` (`KEPT_RUN`, dropped once a week old or of another `RESUME_SHAPE`), decides whether this load carries it on (`RESUMED`: the tab was marked live and the link is the one the run began from), seeds `chance()` from it or afresh (`RUN_SEED`), and gives `forgetRun()`. Every draw that shapes a run comes off `chance()` — `shuffle()` in `content/timeline.js`, `formatMint`, and the item order and test-mode thinning in `app.js` — and nothing else in the file touches the run: what is kept and put back is `keep()` and `restore()` in `app.js`. Not an IIFE, for `draw.js`'s reason. |
| `js/draw.js` | Three helpers that draw rather than decide — `SVG`, `draw()` (an SVG element with its attributes on it) and `mix()` (a colour between two others, reading either a `#rrggbb` out of `content/` or its own `rgb(…)` back, so a tint can be darkened in a second pass; `channelsOf()` is the reader, and the fourth name it takes) — held in common by the two files below it. It reads nothing and keeps nothing, which is the whole reason it can sit under both of them; **nothing else belongs in it**, and a helper only moves down here because `app.js` and `results.js` both want it. Not an IIFE: it takes those names in the globals every file on the page shares, so nothing in `content/` may take them too. |
| `js/snapshot.js` | **A piece of the page turned into a picture**, which is how a level's results are copied as an image (see **Sharing a level**). One global, `snapshot(element, {skip, ratio})`, resolving to a canvas: the element is cloned with every style it is drawn with written onto the clone as computed, the clone goes in an SVG `<foreignObject>`, and the SVG is drawn onto a canvas. It reads nothing of the run and keeps nothing, like `draw.js`, but is not in it, since only `results.js` wants it. **What it has to get right**: defaults are read on a blank iframe of its own, since this page's stylesheet reaches any box on it (`* { box-sizing: border-box }` would pass for a default, never be copied, and every padded card come out wider than its column); a property is written unless it equals both the tag's default and the parent's value, which keeps an inherited value from being dropped; anything still arriving is `finish()`ed first, or a section mid-fade is copied blank; the size is the layout box (`offsetWidth`), not the bounding one, which a panel still growing out of its badge has scaled; the height is measured on the clone in that iframe, since a margin that collapsed out of the element on the page stays inside the picture; what is skipped is hidden on the page for the moment of copying so the rest closes up over it; one-line text is held to one line (it is drawn a hair wider in an image); and an **auto margin**, which Chrome reports on a grid item as `0px`, is recovered by asking the page's rules — only those that set a margin to `auto` — whether they match. Pseudo-elements are written as rules against a class made for each; an `<img>` or `<canvas>` becomes a data URL, and so does an SVG `<image>` (the woodcut the temperament's plane is drawn on), which has to be loaded again to be read and is why `snapshot` is `async`: every one in the element is read out before the copy starts, a JPEG as a JPEG. |
| `js/app.js` | The engine, one IIFE, in labelled sections: build the run → branching → scoring → rendering an item → the rail → panels → particles → finishing a level → flow → results → the way in → wiring. |
| `js/results.js` | `makeResults(engine)`, a factory returning the handful of functions `app.js` calls. What every figure has in common — reading a score against its norm (`dimensionsOf`, `normOf`, `reachOf`, `standFrom`, `teaseValue`), the tooltip, the votes (`pickButtons`, `voteButtons`, `filed`), the holder a figure sits in (`figureHolder`) — then the spider chart, the results sections and their rows (`renderResults`, `renderTeaser`), the staged opening of a finished level, the profile and the card, the
showcase of stand-in figures the landing page cycles (`renderShowcase`), and
`renderBadge(level)`, which crops one figure to a square for the shelf (see
**The shelf**). Reads scores; records nothing but the agree/disagree `feedback` on a prediction and the stars a level's results are given (`starRating`, see **What the level was worth**) — and, at the moment it is built, the full set of keys that feedback can be filed under (`feedbackKeys`). |
| `js/figures/*.js` | **The figures a level closes on, one file each**, every one a factory `makeX(shared)` called from `makeResults` and handed `shared` — the helpers above and nothing else — and returning what `renderResults` needs to place it: the questionnaire it stands in for, its feedback key, and its render function. Two of them also return a `badge()`, being the two whose section is not a drawing there is anything to crop (see **The shelf**). `soma.js` (the MINT as a brain, its nerves and the organs they reach), `climb.js` (the last year as a hill), `theories.js` (the star sign and the temperament), `archetype.js` (the AI archetype), `wheel.js` (the twelve archetypes), `sea.js` (the world), `reasoning.js` (the four kinds of reasoning as a compass), `heads.js` (Mind & Heart as four bars under a bulb and a heart), `stance.js` (Where You Stand as a plane and four spectra), `kinks.js` (the sexuality level's Kinkiness as the crowd it is read against, a band for each number of twenty-two kinks, stood on end), `volcano.js` (the same level's SIS/SES-SF as a volcano in cross-section, a prototype), `hyborian.js` (the Hyborian Age as the hero's painted card and a card of the person's stats beside it), `balance.js` (Light & Dark as a pair of scales, a crowd standing in each pan filled to the person's side and the beam tipping to the heavier); `faces.js` (Mood & Health as faces) is on disk but has no tag and is not loaded, and so is `mandala.js`, a prototype of a reward for finishing the whole run — one picture made from the person's own scores, a mandala with a Julia set at its centre, whose header holds the brainstorm it came out of and the mapping tried (see **The mandala**, below). A figure reads scores only through `shared`; nothing in `content/`, `app.js` or another figure file is reachable from one, and the data a figure is read with (the twelve signs, the three archetypes, the wheel's colours and readings) lives in its own file, since it is how the figure is drawn and not anything asked. |
| `css/style.css` | The shell: tokens on `:root`, the water, the banner, the sidebar the descent runs down (a dive gauge — down the right on a wide screen, along the foot on a phone) and the shelf the badges collect on (down the left, along the top under the banner on a phone), screens, panels, buttons, the survey, particles. Also the animations the other two sheets share (`fade`, `rise`). |
| `css/intro.css` | The landing screen only: hero, the case for doing this and the Jung line under it, consent form, and the Nietzsche quote on the way in. |
| `css/results.css` | The water that breaks on a finished level, the level screen, results sections, charts, the interoception body, bars, the profile, card. |
| `js/vendor/datapipe-client.js` | **The one file on the page that is not ours**: DataPipe's client, pinned and kept here rather than fetched from a CDN, which is how the answers go out — as they are given and again whole at the end. Nothing reads it at load; `app.js` asks for it by name (`window.DataPipe`) when the test begins, and does without it if it is not there. See **Where it goes**, which says what it does, why it is vendored, which version this is and how to update it. Nothing else belongs in `vendor/`, and nothing of ours does. |
| `index.html` | Static skeleton, and the load order above. Screens and panels are markup; everything inside them is filled in by the scripts via `$(id)`. **The `<title>` and meta description are written for search**, since they are what a result shows and most of what it is matched on: they name what people look for ("free personality test", the archetype) and not only the name, which the Open Graph tags keep alone. **A script in the head adds `rel=canonical`**, naming the deployed root as the one address every link to the test is filed under whatever its query says, so that `?source=`, `?start=` and shared `?card=` links are not ranked as near-copies of each other. It is a script and not a tag for the `og:url` reason (see `assets/`): Facebook can read a canonical in the markup as the address being shared, and its crawler runs no script, while Google's renders the page. The favicon is an inline SVG data URI in the head — the A of the name over the hero's wheel on the dark blue of the water, the petals stronger than on the page so that they hold at sixteen pixels and the A a drawn path, since a favicon cannot count on a serif to set it in. The preview card in `assets/preview/` carries no mark. |
| `assets/` | The logos on the hero and the consent form, referenced from `index.html`, and `assets/icar/` — the pictures of the reasoning level's matrix and rotation items, a problem and its candidates apiece, cut out of the eight published figures by `assets/icar/source/cut.py` (which sits beside the figures it cuts, and is run by hand when they change), referenced from `content/block_icar.js` as `<img>` in the items' own `text` and as `image:` on their options, which is the one place a script reaches for a file. No stylesheet does. And `assets/theories/`, **the four old pictures level 1's two old theories are drawn with**: `sky.jpg`, Dürer's map of the northern sky with the twelve zodiac figures round the ecliptic (1515, the National Gallery of Art's CC0 scan), cut to a disc round its pole, and `signs/<sign>.jpg`, the twelve out of a hand-coloured sixteenth-century German woodcut of the zodiac, for the star card; `woodcut.jpg`, Thurneysser's woodcut of the four humours (*Quinta Essentia*, 1574), and `faces/<temperament>.jpg`, one head apiece out of Lavater's plate of the four temperaments, toned to an old page, for the temperament. The two drawn as masks (`sky.jpg`, `woodcut.jpg`) are inverted, white ink on black. All four are public domain, off Wikimedia Commons, and cut by `assets/theories/source/cut.py`, which **fetches any original it does not find** into `source/` — the originals are sixteen megabytes and git-ignored, the cuts committed — and finds what it cuts rather than taking positions by hand: the woodcut's frame and cross, Lavater's four ovals, the sky's pole (where its twelve lines of longitude meet) and ecliptic (the ring of heaviest ink round it), the zodiac sheet's gutters. It prints what the page needs back (`CROSS`, `SKY_RING`) for `theories.js`. The one thing read by eye is where each zodiac figure stands on Dürer's ring (`sky` on each of `SIGNS`). Referenced from `js/figures/theories.js`, the second place a script reaches for a file. And `assets/hyborian/`, **the Hyborian Age's hero cards**: one JPEG a hero, named for the hero (`barbarian.jpg`, `free-blade.jpg`, …), 640 wide, cut by `assets/hyborian/source/cut.py` out of the generated paintings beside it, which are four to five megabytes each, git-ignored and fetched by nothing — they live in Dropbox alone, and the script maps each (`conan1.jpg`, `belit1.jpg`, …) to its hero. A hero without a picture is drawn as its emblem; the gods' (`crom*.jpg`) are kept and not cut. Referenced from `js/figures/hyborian.js`. And `assets/mint/`, **the brain the MINT's level is drawn with**: `brain.png`, one frontal slice of the MNI152 template at y = −24 mm, which passes through the back of the insula and down the brainstem, the brain alone with the template's brain mask as its alpha — transparent round it rather than black, so it sits on the dark however it is drawn, blurred when locked or copied into an image, where blending a black ground away could not be relied on. Cut by `assets/mint/source/cut.py`, which reads the NIfTI with numpy alone, **fetches the template and its mask from TemplateFlow if they are missing** (fourteen megabytes, git-ignored; the cut committed), and prints what `soma.js` needs back (`ASPECT`, `INSULA`, `STEM`). The template's licence asks for the McConnell Brain Imaging Centre's copyright notice in all copies: it is written out in the script, and **nothing on screen credits it, on purpose** — the credit belongs wherever the picture is described in print. Referenced from `js/figures/soma.js`, the third place a script reaches for a file. And `assets/preview/`, **the picture a shared link unfurls into**: `card.jpg`, 1200×630, named by the `og:image` in `index.html`'s head (with a `?v=` on the end, raised whenever the picture changes, since WhatsApp, Facebook and the rest cache a preview by its address and would otherwise go on showing the old one) beside the other Open Graph and `twitter:card` tags, and photographed out of `card.html` (the hero redrawn at that size, wheel and all, its look restated rather than imported, so a change to the hero is copied across by hand) by `make.py` (Edge or Chrome headless, then Pillow for the JPEG, since the 400 KB PNG is over what WhatsApp will show) — run by hand when `card.html` changes, and commit both. Crawlers run no script, so **a link to `index.html` unfurls the same**, whatever its `?start=`, `?level=` or `?card=` says. **A level can have a preview of its own through an entry page** (see `start/`, below): `opinions.html` is the card for Where You Stand, `card.html`'s look with the level's plane beside the name in place of the wheel (restated from `stance.js`, not drawn by it, so a change to the figure is copied across by hand), photographed into `opinions.jpg` by the same `make.py`, which photographs every `*.html` in the folder into a JPEG of its name, or only the ones named (`python assets/preview/make.py opinions`). `sexuality.html` (How kinky are you?) and `archetypes.html` (the wheel) are the level cards whose pictures are **not restated**, the figures being too much drawing to copy by hand: `kinks.png` and `wheel.png` beside them are the figures' own renders at stand-in answers, turned into pictures by `snapshot()` (the level share's "Copy as image") and saved by `still.py` (Playwright with Edge, against the page on port 8123; the stand-ins are `FIGURES` in it, and a new figure is an entry there) — run it when a figure changes, then `make.py`. It photographs a figure's HTML holder rather than its `<svg>`, since `snapshot` measures `offsetWidth`, which an svg has not. A card per person, with their own scores on it, would still want a server. **There is no `og:url`, on purpose**: Facebook treats it as the address being shared, which would take `?source=` and `?start=` off every link shared there. The image's address is absolute, so it names the deployed site and shows nothing until that is pushed. And `assets/readme/`, **the pictures in README.md's table of levels**: one JPEG a scored level, named by its `key` in lower case, each the level's results as a shared level link opens them (`?card=1&level=`) at stand-in scores, photographed by `make.py` (Playwright with Edge, then Pillow; it serves the folder on a port of its own), cut off and faded at 1000 pixels tall. Run it by hand when a figure changes and commit the pictures with it; naming levels by their `key` (`python assets/readme/make.py BrainBody AIExpertise`) photographs only those. The stand-ins are hashed from each dimension's name, so a rerun draws the same pictures; `BANDS` gives Mood & Health a lower band, since a reach off the middle of the HiTOP-BR is a standing near its top. The links under the pictures start the run on each level with `?start=` and the level's first block. |
| `data/norms/` | A workbench, not part of the page: **one script a questionnaire**, `norms_<questionnaire>.R`, each printing, ready to paste, a set of norms in the app that is *not* invented, and each runnable on its own — `norms_hitop.R`, the HiTOP-BR's development-sample means and SDs out of the {hitop} R package, and `norms_mint.R`, the MINT's worked out from the raw answers of the studies that have asked it, pulled from their repositories and scored the way `content/block_mint.js` scores them — each with its `distribution` as well, the share of people in each half point of the scale (`distribution_of` in `common.R`, which any script can print a norm's distribution with), and `norms_bait.R`, the BAIT's out of the eight studies of its pooled validation (read from that repository's local data cache, fetched from each study's own repository where a file is missing), pooling the five asked on the app's seven circles and showing the three slider studies beside them — and printing, besides the paste lines, every item's distribution, the dimensions' quantiles and how they go with sex, age, knowledge and usage, and the two blocks the robot in `js/figures/archetype.js` holds (its Menace axis's SD with the share of people in each of its four corners, and the spread of answers every crowd card is set against). **`norms_bks.R` is tentative and feeds nothing**: the structure of the Big Kink Survey's public subsample (Aella's `BKSPublic.csv`, Zenodo, fetched into the git-ignored `bks/`), for deciding whether a level on sexuality is worth writing — no such level exists or is decided on, and the script prints no paste lines, only the dimensions, clusters and kinds of person in the data. Its interests are gated in the survey (rated only inside a category ticked first), so it works on one score per category rather than on items, which would otherwise correlate through the shared gate alone. `make_norms.R` runs every `norms_*.R` in the folder but those it names `TENTATIVE`, each in an environment of its own and an error in one reported and passed over, so that a missing package or a dropped connection costs that questionnaire and not the rest; `common.R` is the printing the scripts share. A new questionnaire's norms are a new `norms_*.R` and nothing else changes. Each prints the number lines and never the `interpretations` beside them, which are the app's own prose. Nothing on the page reaches for it, and R is not a dependency of anything that runs. |
| `data/synthetic/` | A second workbench, not part of the page: runs of the test answered by Claude in a sampled persona, written in the exact shape `container()` saves so that an analysis reads them with the same code as a real run. `codebook.js` (bun or node) reads every item of the `mint` battery out of `content/` the way `app.js` flattens it — the demographics included, placed on levels 1 to 3 by the rule `PLAN` places them by, which it restates — so the requests cannot drift from what is asked; `synthesize.py` samples the demographics from the items' own options, has the model write a biography and answer the rest under a JSON schema of the items' own values, passes the attention checks, prunes closed branches, and writes `out/synthetic-<code>.json` — participant code prefixed `synthetic-`, a `synthetic` field naming model, batch, seed and biography, null times, null votes, null stars (`ratings`, one key per level screen). `work/` and `out/` are git-ignored. The onward briefing that ends an interlude is answered with the fork choice it offers, and the level screen before it with its one button (`onward`). Its `FIGURE_VOTES` mirrors `feedbackKeys()` in `results.js` and has to move with it. It writes `battery` (null), `source` (`"Synthetic"`), `levels` (each `choice` taken as recommended, the cards in written order, `fork_choices`) and `questionnaires` (the whole timeline, written order) the way `container()` does, and splices a `Level_<N>` item into `items[]` after each scored level, answered with the way on that level offers — every fork choice taken as recommended (`screens`, `walked`; `codebook.js` works `beneath` out from `WATER_SHARE` the way `waterLevels` does, for the floor's wording — the one rule this workbench restates rather than reads) — so a synthetic file reads with the same code. Never sent to DataPipe, never pooled with participants; its `README.md` says why. |
| `data/collected/` | **A third workbench, and the way the answers come back**, in two steps: `download.py` fetches, `preprocess.R` makes tables of what it fetched — and then `overview.qmd` (Quarto, base R) reads those tables back as a page that first **sets aside the runs that are not a participant** and leaves them out of everything after (`KEEP_FLAGGED` keeps them in) — *empty* (Start pressed, nothing answered), *glance* (stopped with no level finished after fewer than `GLANCE_ITEMS` answers inside `GLANCE_MINUTES`), *speeding* (a median answer under `FAST_MS`), *scripted* (a headless browser, viewport 0 wide, or answer times too even for a person, `STEADY_CV`), *tryout* (fewer levels walked than `mint` holds) and *said random* (the closing item, or the interim's), a run breaking any of them listed with why — then of how long each level takes, the median and range over the runs that finished it, the same for how long its results screen stayed up, and how many runs closed the tab on that screen (a finished level with no `Level_<N>` in a partial) — both in minutes, in two panels on scales of their own — then **Choices** — every fork choice (new files through `Level_<N>_Offered`, older ones through the words of `Level_<N>`, read back to keys through the codebook's level names, with where the cards stood and the recommendation unknown): how often the recommended card and each position is taken against chance, each level's times offered, taken and its *lift* over chance, a head-to-head table, a conditional logit (`fit_choices`, base R `optim` with a light ridge) separating each level's blind strength from the recommendation's pull once `MIN_CHOICES` choices say which card was recommended, and that strength against the level's mean stars, whose residuals are how far a level's results out- or under-perform its card — then a radar per level answered by at least `MIN_RUNS` runs (`radar()`, one figure a level), a box plot along each ray and nothing joining the rays, each item a share of its own scale and as answered, not reversed — every scale item but the demographics, free text and the ICAR's right answers; it turns the words back into numbers **through `data/synthetic/codebook.js`** (so it wants bun at render time) rather than a copy of any labels, reading the MINT through each run's `format_mint` (the codebook describes only its first format), and says on the page which answers matched no option and which saved keys the codebook no longer has; it works out which level an item was on, for the times, from the `Level_<N>` screens standing between levels in the item order, leaving an interlude's items (the codebook's `between`) out of every level's time and off every radar; it wants `preprocess.R --long`, since only the long table has the times an item was shown, and its `overview.html` is git-ignored with the rest. Rendering it inside Dropbox can end on an error removing `overview_files/` (Dropbox holds the folder); the page has been written by then and the empty folder can be deleted. Both folders the first two write, `raw/` and `clean/`, are git-ignored because they hold **real participant data that must never be committed**. **`preprocess.R`** ({jsonlite} and base R, the way `data/norms/` is) reads `raw/` and writes `clean/`: **`data.csv`, one row a participant and everything in it, and nothing else at all** — **a master file**, 728 columns: the run (participant, file, completed, version, testMode, synthetic, battery, source, device, touchscreen, screenLayout, screenLayouts, the viewport's and the screen's width and height, formatMint, timeStart, timeResumed), the two sequence columns, a `Feedback_<reading>` apiece, a `Rating_<level key>` apiece, three `Level_<N>_*` a fork choice (`Offered`, the keys in the order the cards stood, `Recommended`, `Chosen`), four `QC_<level key>_*` apiece (`RT_Mean`, `RT_SD`, `ChecksFailed`, `TimeFinished`), a column per item holding the words that were on screen, and an `<item>_RT` beside each one (a suffix, so an item and its time sort together). **One naming rule across it, and it is `content/`'s own**: what the run says about itself is lowercase (`participant`, `time_start`) and everything that is a *measure* is `Prefix_Subject_Field`, the prefix an acronym in capitals or a word in PascalCase exactly as an item key is written — so `QC_Character_RT_Mean` and `Feedback_BodilyAwareness` sit beside `HEXACO_Sincerity` under one convention and a measure can be told from a run field on sight. Times are milliseconds throughout and no column name says so. Nothing is left out to keep it narrow — an analysis selects from it rather than coming back for a second file, and width costs nothing to anything that is not Excel — and **nothing is worked out that the file does not already say**: no mean reaction time, no share of an instrument completed, no count of failed checks, no item counts, no minutes taken. Each is a line of R over the columns that are there, and which of them an analysis wants is the analysis's business; this reshapes rather than computes, and a file that counts things for you is a file whose counting has to be checked. **`NA` is not the empty string in it**: an item never put on screen is NA, an optional item shown and deliberately left blank is `""`, and the saved file tells those apart — writing NA as empty would make a question nobody was asked look like one somebody declined. **What is not data is said rather than filed**: the complaints go to the terminal where whoever ran the script is looking, since a `checks.csv` that is empty nine times in ten is a file somebody has to open to learn nothing. **Anything counting how much of an instrument somebody gave wants care, which
is the other reason there is no column for it.** A partial holds only the items
that were answered — that is what the staged records are — so a share worked out
from one is 1 for every instrument it touched, however little was reached: a
run abandoned after three of the HEXACO's items has a share of 1 where a count
says 3. The denominator that would
settle it is the instrument's own length, which lives in `content/` and in no
saved file. **The two sequence columns are how one row
keeps what a row cannot hold**: which levels somebody walked and the order they met the items in are facts about a sequence, so they are joined with `" | "` into one cell each rather than spent as a column per item. `--long` also writes the tidy `responses.csv`, one row an item, which is the shape a mixed model wants. **A new item wants a key that is not already a column of this file** — nothing called `minutes` or `completed`, nothing ending `_RT`, nothing starting `done_`, `Feedback_`, `Rating_` or `QC_`. The `PREFIX_Name` convention every key in `content/` follows keeps that true without anybody thinking about it, and there is deliberately no guard: a check for something the naming makes impossible is one more thing to read. It **reads both shapes out of the deposit**: a finished run is a `container()`, and a `.partial.json` is **a bare JSON array of the staged records** — no envelope, no wrapper, just the `frame` and `item` objects as the app staged them — which it puts back together by the rule they were staged under, the last frame and the last record under each key. It checks rather than trusts (fields present, keys unique, `order` 1..n for a finished run and merely unique for a partial, one participant code per file, one app version across the set) and **prints** every file that fails instead of stopping on it or filing a report nobody opens. It drops a partial whose run also finished, and of the partials a run carried on in the same browser leaves under one name (see **Carrying on**) keeps the fullest, and keeps test and synthetic runs out of `clean/` unless asked (`--include-test`) — a test run by its `test_` name, before the file is even opened, and then any whose `testMode` says so — so a test never reaches `overview.qmd` to be set aside there. **It does not score**, and the five things it cannot do are written at the foot of the file — the fifth being that `clean/` is not the public file: it still holds the `?pid=` id, the day of birth and the free-text comments, and the release step that takes them out is not written yet. `download.py` (standard library alone, no packages) fetches what DataPipe has filed in the Zenodo deposit, verifies each file against its checksum and leaves it in `raw/`. It runs again safely — a file already there with the right checksum is left alone — so it is the way to pull an ongoing study down each morning rather than a thing run once. **The deposit is a draft for the whole of a study** — DataPipe makes an unpublished deposition and never publishes it — and a draft is readable only by its owner, so the token is wanted throughout rather than at the end. It is looked for in `ZENODO_TOKEN` first and then in `~/.zenodo_token` (one line, nothing else), the second so that it outlives the shell it was typed into and anything run later finds it without being told. **Neither place is in this repository**: a secret in a folder git watches is committed sooner or later, and this one is inside Dropbox as well. `deposit:write` is the narrowest scope Zenodo offers for reading a draft and it can write to the account's depositions too, so it is worth rotating when a study ends. It unpacks DataPipe's `datapipe-batch-NNNN.zip` archives as they arrive, so `raw/` holds runs rather than archives however large the study grows. Its report is the reason it is a script rather than a download button: it counts complete runs apart from the partials of people who stopped, keeps **test runs out of the count** (`test_`; not data), and names any run that has **both** a complete file and a partial — one person and two files, which is a wrong n if both are counted (see **Where it goes**). |
| `docs/` | **The documentation**: a deck about the app, for the people working on it, in the three files the app itself is in — `index.html`, `deck.css`, `deck.js` — plus `items.js` and a stretch of `index.html` that are **generated**, and the script that generates them. No build to open it, no dependency, no server. Ten slides: the landing page of the app with **Documentation** under it; **The trouble with surveys**, the problem — survey platforms built for the researcher, boredom and fatigue, careless responding, nothing given back, jingle and jangle, small closed datasets — as six tiles under a line and a picture, three of them citing a paper; **What the Abyss is**, the platform and its aim over eight tiles of its mechanisms (staged progress, feedback, agency, collection, asking back, sharing, carrying on, quiet quality control), each restating a section of these notes and so wanting reading again when that section's mechanism changes — both written by hand and held to one 1080p window (`.tiles` in `deck.css`, rose for the problems and the deck's blue for the mechanisms); **What is being validated**, the MINT and the BAIT as two cards — a line on what each measures, no dimensions — each joined by a line to its own level on a timeline of the `mint` run braced into the core and the optional set (the joins are one svg stretched across the run, its paths written in elevenths of the width, so every level on it takes one column). **A card, its join and its level light together** when any of them is pointed at (`:has` in `deck.css`); **pressing a card goes to that instrument's own slide** (`data-to`, the slide's id; its "More on…" button is the way there for the keyboard) and **its items button opens its items** in the same list a row of the table opens, found through the row's `data-questionnaires` (written by `build_slides.py`, the questionnaire keys a row draws from) against the card's `data-opens`; and **a level on the run says what it asks** on hover or focus and **goes to those rows of the table** when pressed, both read off the table's first column against the level's `data-level` (its place as written on the timeline), so nothing the run says can disagree with the table. The words on it are **written by hand**, so the levels and their names and the norms' samples want reading again when `content/timeline.js`, `block_mint.js` or `block_bait.js` changes; the item counts are not written, being read out of the table. Then **the MINT** and **the BAIT** at length, a slide each and both **written by hand**: the MINT's where it comes from (the first validation, ER/MB2021/2, and the four studies its norms pool), what this study adds (replication of its structure on a new, larger sample with its convergent and discriminant validity, the effect of response format, and its correlates with the HiTOP's spectra, the point that leads to the last slide) and its three formats drawn as working scales under one of its own items, which restate `MINT_FORMATS` in `block_mint.js` and want changing with it; the BAIT's where it started (a trait measure that could partly modulate and mediate the anti-AI bias measured in the lab's tasks, out of expectations about what AI can produce and attitude items carried over from the GAAIS), why it wants work (its psychometric properties, said in a line) and what is next (sharper expectations across modalities, a subjective-discriminability factor out of the four Discrimination items it asks and does not score, and the usage angle taken to AI addiction and "AI psychosis", whose candidate items are under Relationship with AI in `README.md`). A form control on a slide keeps its own keys and a finger on a slider its own drag, so the arrows and a swipe do not move the deck from one. Then **Content**, the table of everything the test asks — which is written by `build_slides.py` rather than kept by hand — and last **HiTOP**, reached from the MINT's slide and kept after the table so the table's number does not move: what the Hierarchical Taxonomy of Psychopathology is, with **the HiTOP model** under it (ColinFreilich's figure off Wikimedia Commons, CC BY-SA 4.0, in `docs/figures/hitop_model.png` exactly as published — not resized or cut, so nothing about it has been modified — and credited under it and in the enlarged view, which is what the licence asks; pressing it opens it over everything, fitted to the window and then, pressed again, at its own size, `data-zoom` in `deck.js`, and while it is up the arrows, the wheel and a swipe are its own), the HiTOP-BR the test asks as its short measure, and its six spectra under the two scales that cut across them, each saying on hover what a participant is shown instead, with one of its items — hand-written out of `content/block_hitop.js`, item counts and all. And last **Feedback expectations**, for the students who pilot the test: what a pilot's notes should hold and how finely, as excerpts of three pilots' notes on an earlier version (all addressed since), a column a pilot headed by the grain their notes were taken at, and a row a kind of feedback — positives, negatives, things to fix and subjective reactions — each labelled with what it is for. The excerpts are the pilots' own words, cut with ellipses and never reworded, and nobody is named. And after it **TODOs**, what is to be done next week, written by hand and meant to be rewritten each week, its lines linking back to the slides they concern (`data-to`). A slide is a `<section class="slide">` and adding one is writing another; `deck.js` counts them, moves between them with the arrow keys, keeps the slide showing in the address (`#2`, read on load and on `hashchange`, written back with `replaceState` so the back button stays clear) and never looks at what is inside to move — Space on a focused button is that button's, not the next slide. **The wheel is the other way on**: scrolling past the end of a slide moves to the next, but only once that slide has nothing left to scroll (so a long table is read to the bottom first), only past a deliberate push rather than the tick that arrives at the end, and not at all for a moment afterwards — a trackpad sends its momentum in a long tail, which would otherwise carry straight through the slide it just landed on. A slide that fits the window is at both ends at once, which is what makes the wheel work there. A slide arrives from the side it came from (`arrive-on` / `arrive-back`, the side written by `deck.js`; the slide a visit opens on has come from nowhere and arrives without one), and `.slide--on` centres with `justify-content: safe center`, so a slide taller than the window falls back to the top instead of overflowing past it where the first rows cannot be reached. **Picking a row of the table says what that instrument asks**, out of `items.js`. It is a **click** and not a hover (`aria-expanded` on the row, `aria-controls="items"`, Enter or Space when it has focus, and the same row again, Escape or leaving the slide to put it away): the list stays up, the text in it can be selected and copied, and forty-odd items can be scrolled without the pointer having to stay on the row it came from. The row and the list are one thing in two places and so are one colour, `--pick`, a blue of the deck's own between the app's cyan and its violet — the row filled with it and edged in it, the list bordered and numbered in it. That list sits beside the chrome rather than inside the slide, because a slide carries the arrival animation and an element with a transform on it is the containing block its `position: fixed` children are placed against. The look is the app's **restated, not imported** — the tokens are those in `css/style.css` and the hero is `.hero` from the root `index.html` — so nothing here can break the app, and a change to the app's look has to be brought across by hand; the three logos are the app's own files in `assets/`. No presenter notes, no transitions, no export: `@media print` and the browser's print-to-PDF are the export. |
| `docs/build_slides.py` | **The Content table and `items.js`, written out of the app's own questions** — a workbench like `data/norms/` and `data/synthetic/`, run by hand when `content/` changes (`--check` says whether the deck is stale and exits 1 if it is). It reads the app **through `data/synthetic/codebook.js`** rather than parsing `content/` itself, so there is one reader of the questions and it is the one that already walks them the way `app.js` does; it needs bun or node for that, and nothing else. It sanitises what cannot go into a table: an item that words itself from an earlier answer becomes one of its wordings marked as such, `text` is HTML so the tags come off and the `<small>` gloss stays, and a reasoning item drawn as a picture is marked `[with a figure]` — four of them share a stem and would otherwise read as the same question four times. **`ROWS` is the one hand-written thing in it**, and has to be: a row's *reference* is nowhere in `content/`, and the table's unit is the instrument where the content's is the questionnaire — `singles` is one questionnaire holding eleven scales, `hexaco18` holds the HEX-ACO-18 and the KSE-G, `control` holds four two-item proxies. That mapping is **checked rather than trusted**: every item the app asks must be claimed by exactly one row and every row must claim at least one item, or the script stops and says which, so a questionnaire added to `content/` without a row is a failure rather than a table that quietly goes stale. |
| `start/` | **Ways into the test that unfurl with a level's own preview**, one folder a level named by the block it opens on: `start/opinions/`, `start/sex/` and `start/archetypes/` are the three there are (`sex` opening on a level `mint` does not hold, which `?start=` brings in off `all`; see **Batteries**). It is not part of the app and loads none of it: a page of Open Graph tags naming its level's card (`assets/preview/opinions.jpg`, with a `?v=` raised whenever the picture changes, and no `og:url`, the root page's reasons) and a line of script sending the person on to `../../?start=<block>` with whatever else the link carried (`?source=`, `?pid=`, `?project=`, `?test=`), since a crawler reads the tags and runs no script and a person runs the script before seeing the page. So `…/TestYourself/start/opinions/?source=X` is the same run as `…/TestYourself/?start=opinions&source=X`, the first with its own picture in a chat. A `?start=` on the entry page's own link is kept behind its level, so `start/opinions/?start=sex` is `?start=opinions,sex`, and unfurls with the card of the level it opens on. A new one is a copy of a folder with the block's name changed (the `start`, the fallback link, the image, the words) and a card of its own in `assets/preview/`. **Done (September 2026)**: Where You Stand (`opinions`), Sexuality (`sex`, the kinks crowd), Archetypes (`archetypes`) and the Hyborian Age (`hyborian`, four of the heroes' own painted cards fanned, the Pirate Queen and the Barbarian in front, under a hook on "Know, oh prince…" — `hyborian.html` uses `assets/hyborian/*.jpg` directly, so a repainted hero is picked up by photographing it again — and the only way into that level, which no battery asks). **Still to do**, one a scored level: General (`fipi`, the two old theories), Brain-Body Axis (`mint`, the body), AI Attitudes (`bait`, the robot), Mood & Health (`hitop`, the climb), Character (`hexaco`, the spider), The World (`primals`, the sea), How You Think (`icar`, the compass) and Mind & Heart (`regulation`, the bars) — each named here by the block its link would start on and the figure its card would show. |
| `README.md` | The author's own notes: the aim, the batteries, and a long list of questionnaire ideas that are *not* in the test. Its **Includes** section is a pointer to the deck's Content table, which is where the list of what *is* asked lives. Not documentation. |

**The seam.** `app.js` builds an `engine` object — the run, the scores, and the
two pieces of chrome (`showScreen`, `burst`) a result arrives with — and hands
it to `makeResults()`. That object is the whole of what crosses between them,
in one direction: `results.js` never reaches back for anything else, and
nothing in it walks the run or writes to `responses` (it reads two answers
as given — the birth month and day, for the star sign — through
`engine.answer`, which is read-only). (It does read
`QUESTIONNAIRES` — a `content/` global, for norms and section names — which is
shared ground rather than app.js state, so it crosses no seam to get there.)
Adding to the seam means adding to that object literal, so keep it small.
**The one member that writes is `visit`**: it tells the
engine that somebody else's results, out of a shared link, are on screen, and
while they are `score`, `total` and `answer` read the link's values rather than
the run's (`visitor` in `app.js`, cleared by "Take the test yourself" before
anything can be answered). See **Sharing a level**. **`noted`** is the other
member that reaches back, and it changes nothing: `results.js` calls it when a
vote or a star is given or taken back, so that the engine stages a frame
without waiting for the level to be left (see **Where it goes**).

**The second seam** runs from `results.js` down into `js/figures/`: `shared`,
one object literal in `makeResults`, is the whole of what a figure file may
reach — the scores and norms readers, the tease, the votes, the tooltip, the
figure holder — and each figure hands back a small object of what
`renderResults` and `feedbackKeys` need. It is a bag of a dozen or so members,
which is more than the engine seam carries, and that is accepted because the
alternative was one file of three thousand lines: a figure is read and edited
on its own, and the bag is the price of that. Add to `shared` only what
several figures want; a helper one figure alone needs lives in its file.

## How it works

**Run order.** Four lists, each knowing only the one under it: the run's timeline (`BATTERIES[battery]`) is a
list of levels, a level is a list of block names, a block is a list of entries
(briefings and questionnaires), and a questionnaire is a list of items. Every
entry of every one of them carries its own `key` and is found by it, so adding,
removing or moving anything is moving one object in one list. `app.js` walks all
four in order to flatten `questions`, stamping each item with the `level` and
`block` it came from — which is why nothing in `content/` carries a `level:` of
its own, and why there is no second place for it to disagree with. That same
walk builds `RUN`, the questionnaires in order, which is also the order a
level's results read in. The one thing that can change that order after the
walk is **the fork** (below): runs of levels the participant puts in order,
one choice at a time, which `takeFork` moves in `PLAN`, `questions` and `RUN`
at once and re-stamps.

**A questionnaire is the unit of shuffling, and the only one.** Its items may
come in any order, but they come together; everything around them — the other
questionnaires, the briefings, the blocks, the levels — holds the order the
timeline gives it, and an item marked `shuffle: false` keeps its own place
while the rest move around it. **A follow-up goes where its item goes**: an
item waiting (`showIf`) on another item of the same questionnaire is not
shuffled loose, where it could be drawn before the answer it waits on and be
passed over for ever, but placed straight after that item, its own
follow-ups after it (`settle`); the kinks' which-side questions are the
case. A whole questionnaire may be written
`shuffle: false` too, and one is: the PI-18 on level 7 was validated in a fixed
order and is asked in it. That is the exception rather than the shape of the
thing — a scale whose own validation says nothing about order should shuffle,
which is the default and what everything else does.

The whole of the run's order follows from that one rule, and answers most
questions about it before they are asked. Two instruments meant to be asked in
among each other go in **one** questionnaire, because being one questionnaire
is what makes them one shuffled run — which is why the eleven single-item
scales of the `singles` block are one questionnaire rather than ten, and why
the FIPI beside them stays a run of five that nothing is ever dealt into. Two
meant to stay apart go in two. And a briefing, being an entry of the block
rather than of any questionnaire, can never be crossed by anything.

**What is asked, and where.** Eleven levels, ten of them scored, out of eighteen
blocks in the `mint` battery, one of them the `interim` between the core and
the rest, which is no level — twelve levels and eighteen blocks on `all`, the
twelfth level being the work-in-progress `sex` block in the second fork, which only
`all` asks, and the interim being `mint`'s alone
(the `hexaco` block holds the HEXACO with the KSE-G dealt into it,
and the commented-out Mini-IPIP6 and BSDS) — so this table is the map of `content/timeline.js` and of the folder
around it at once:

| | |
|---|---|
| Places 1–3 | **The demographics, which belong to places and not to levels** (`DEMOGRAPHICS`, see **The demographics open places**, below): `demographics1` (age, month of birth and — branching off the month — the day, one `BirthDay` item wording itself from the month and offering only the days that month has; gender and what branches off it) at the head of level 1, `demographics2` (education, discipline, student, ethnicity, country) at the head of level 2 and `demographics3` (household financial comfort, MacArthur subjective social status) at the head of level 3, whatever the draw and the fork put there |
| Level 1 | `fipi` (the briefing that opens the whole test, then the five items) and `singles` → General. `fipi` is read back as **two old theories and nothing else**: the star sign and the temperament side by side (see **Two old theories**, below), no rows. Extraversion and Emotional Stability keep their norms because the temperament is read off them; the other three are commented out, since the HEXACO on level 5 draws the same ground in full — so it is out of `CHARTS` (a spider wants three axes) and off the whole-run web (`profile: false`) |
| Level 2–4 | `mint` (a briefing, then the items) → Brain-Body Axis. **One of the three levels of the core fork** (`fork: 2` over a drawn order), so it is met second, third or fourth as the draw and then the person decide |
| Level 2–4 | `bait` — a briefing, the AI knowledge, technical-understanding and usage singles (the understanding single carries a key of its own, `BAIT_Understanding`, so it cannot stack onto the old `BAIT_UnderstandingAI` it replaces), then the shuffled BAIT statements (the union of the 2.1B and 2.2 administrations, under the harmonised item names of the pooled validation, plus its attention check). Scored as the BAIT-8 — AI Realism, AI Enthusiasm, AI Apprehension — and read back as one of three archetypes (see below) |
| Level 2–4 | `mood` and `health` in a random order, then `hitop`. `mood` is a briefing, then `phq4` and `sleep` (the SQS single, asked and scored but shown nowhere; the CDS-2 and the PCL-2 sit commented out in the same file) and `health` is a briefing, then the list of psychiatric diagnoses and treatments (`psychiatric`, keyed `Psychiatric_Diagnoses` / `Psychiatric_Treatment` and asked and saved but scored and fed back nowhere; the SSS-8 and the somatic medical history sit commented out in the same file). Then `hitop`: a briefing (widening from the last few weeks to the last year, and saying what follows is asked as spectra rather than categories) and the HiTOP-BR (`hitopbr`), 45 statements about the last twelve months on a 4-point scale, scored as six spectra. `phq4` and `hitopbr` are read back together as **the climb** (see below), the level's one section — three of the spectra and the PHQ-4's fortnight drawn into one hill; the other three spectra, sleep and self-rated health are fed back nowhere. (A row per spectrum reads like a verdict, so there is none.) **The spectra carry plainer names than the HiTOP's own** — Bodily Complaints, Emotional Intensity, Unusual Experiences, Solitude, Impulsivity, Dominance, for Somatoform, Internalizing, Thought Disorder, Detachment, Disinhibition, Antagonism — one for one, so nothing about the scoring changes; the mapping is written above the norms in the block file. The one questionnaire whose norms are **not** invented — they are the development-sample means and SDs of Simms et al. (2026) — kept for analysis, and written `profile: false` too, so the six stay off the whole-run web. Item keys are the package's item numbers under the app's prefix (`HITOP_01`…`HITOP_45`), so a saved file scores with `score_hitopbr()` once the columns are renamed `HBR_nn` |
| Between 4 and 5 | `interim`, on `mint` alone — **no level**, an interlude between the core and the rest (see **The interim**, below): a briefing celebrating the end of the main part of the study, `Interim_SurveyAccuracy` and `Interim_Comments` (the closing's two questions, under keys of their own), and `Briefing_Onward`: the debrief, the SONA credit link for a run from `?source=SONA`, and the cards on which the first of the optional levels is chosen. Asked at the head of level 5 whatever stands there, and counted in none of its accounting |
| Level 5–10 | `hexaco` → Character: a briefing, then the HEX-ACO-18 (`hexaco18`, 18 items, the HEXACO on its own 5-point scale, named "Character" on screen). **Read back in full**, as a spider chart with a row per domain, and its six domains take axes on the whole-run web. The domains carry **plain names** — Honesty-Humility and Emotionality as published, then Sociability, Patience, Diligence and Curiosity for eXtraversion, Agreeableness, Conscientiousness and Openness — because a dimension is one name across the run and the FIPI has the Big Five words on level 1, and because the HEXACO's constructs are not the Big Five's anyway (its Agreeableness is patience and forgiveness); the mapping is written above the questionnaire in the block file, and the item keys still name the facet. The Mini-IPIP6 (`ipip6`) sits commented out in the same file. **Dealt in among the HEXACO's items is the KSE-G** (`KSEG_Positive_1`…`KSEG_Negative_3`), six social-desirability statements — three exaggerating positive qualities, three minimising negative ones — there to blend in, which is why they are items of that questionnaire rather than a questionnaire of their own. They carry **no `dimension`**: nothing reads a score off them, the total is taken at analysis time with the Negative three reversed, and one handed back would only teach the next answer. The BSDS sits commented out beside them, one of its items being the KSE-G's almost word for word |
| Level 5–10 | `archetypes` — a briefing, then the **Open Source Archetype Indicator – Pearson-Marr (OSAI-PM)**: twelve three-item scales after Pearson and Marr's twelve-archetype framework (Idealist, Sage, Seeker, Revolutionary, Magician, Warrior, Realist, Jester, Lover, Creator, Ruler, Caregiver), an open paraphrase written from public descriptions of the framework rather than from the PMAI's items, to be validated independently of it. The only scored questionnaire in the app **written without norms on purpose**, and the only one fed back anyway: read back as a wheel (see below) |
| Level 5–10 | `primals` — a briefing, then two questionnaires asked back to back on one scale: the **PI-18** (`pi18`, Clifton & Yaden, 2021), the validated short form of the 99-item Primals Inventory — eighteen statements about the character of the world on its own 0-5 agreement scale, seven reverse-keyed, **written in the fixed order the short form was validated in** (`shuffle: false`, the only questionnaire in the app that holds its own order), read back as **the sea** (see below) and nothing else — no rows, no standings, one vote on the picture; and the five **tertiary primals that cluster under none of those three** (`primals_tertiary` — Acceptable, Changing, Hierarchical, Interconnected, Understandable), 22 items taken whole from the PI-99, which is what the inventory's own instructions recommend for reaching them. The two are separate questionnaires because they are two instruments asked two ways, and because the broader primals are meant to precede the narrower ones. The inventory's headline primal, overall **Good** world belief, is *not* a fourth set of items but a composite of the PI-18's own (all six Safe, all seven Enticing, `PI_Alive_1` and `PI_Alive_4`) — an item here carries one dimension, so rather than ask anything twice or teach the engine a second way to score, Good is left to analysis time: the keys name the primal and count within it (`PI_Safe_1`) with Clifton's own label beside each in the block file, so his published code computes it from a saved file after one rename. Safe, Enticing and Alive take axes on the whole-run web; the five neutral primals are written **both** `profile: false` and `results: false`, so they are asked, scored and saved and fed back nowhere — five percentile rows under the sea would be a second, plainer answer to the question the picture has just answered. The level is therefore one section, and `markLone` hides its name |
| Level 5–10 | `icar` — a briefing (turning from what you are like to how you think), then the **ICAR-16 Sample Test** (`icar16`; Condon & Revelle, 2014; Young & Keith, 2020): sixteen problems with one right answer each, four of each of four kinds — verbal reasoning, letter series, matrix reasoning and three-dimensional rotation — keyed by the ICAR's own item numbers under the app's prefix (`ICAR_VR_04`, `ICAR_LN_07`, `ICAR_MR_45`, `ICAR_R3D_03`). Untimed and shuffled, as validated. **Scored right or wrong** (`correct:`, see **Right answers**), one dimension per kind, and read back as **the compass** (see below): the four against each other, never a total and never a standing. **The four carry norms, and the level reads none of them**: they are invented placeholders, written for one reason only — the whole-run web draws the average person on every axis that has a norm, and four axes without one would leave a gap in that ring where the reasoning's fall. Nothing grows a row from them, since `renderReasoning` takes the section whole. The web *does* read them back as a standing, worded as a style rather than as a score ("Verbal: thinking in words — you use it less than 97% of people do"), which is the whole of what makes a percentile on this ground all right: see **The compass**. The real SAPA norms exist and are still deliberately not used. **The four carry plain names, framed as cognitive styles** — Verbal, Logical, Visual and Spatial, for verbal reasoning, the letter series, matrix reasoning and rotation, one for one, so nothing about the scoring changes and the item keys still name the subtest; the mapping is written above the items in the block file. "Styles" is the feedback's word: what is measured is performance on four kinds of problem, and which came easiest is the one reading four items a kind can bear. The eight matrix and rotation items are drawn: the problem (the grid with a cell missing, the cube to rotate) is the item's picture, and each candidate is a picture on a button of its own with its letter under it, cut out of the figures in Appendix A of the paper's supplement (`assets/icar/source/`, see **Right answers**); two of a rotation item's eight candidates are written rather than drawn — "None of the cubes could be a rotation", "I do not know the solution" — and are plain labelled options, saved as those words. Stems and options are verbatim from that appendix (shelved as `literature/Condon_Revelle_2014_ICAR_supplement_SampleTest.pdf`) — except that the rotation stem says "the following cube" for "the cube labeled X", the cube being shown alone and without its letter — and the key is the `iq.keys` vector the {psych} package documents beside these items. The four take axes on the whole-run web (`profile: true`, redundant beside the norms and kept as the statement of intent), each as its standing against those norms (see **The profile**). No attention check: there is no straight line to catch on a right-answer test |
| Level 5–10 | `regulation` → Mind & Heart (the `key` is `Regulation`): a briefing (turning from what you are like to how well you steer it; written, like every briefing, to hold wherever the timeline puts it), then three questionnaires on one theme from three sides. `control` ("Attention & Self-Control") is eight single items off four short scales asked as one questionnaire so the pairs are dealt in among one another — the first two items of the **ASRS-v1.1** screener (Kessler et al., 2005; `ASRS_1`, `ASRS_2`, on its own five labels, for the past six months) as Inattention, items 10 and 21 of the **CFQ** (Broadbent et al., 1982; `CFQ_10`, `CFQ_21`, on its own five labels) as Absent-Mindedness, items 1 and 4 of the **MW-S** (Carriere et al., 2013; `MWS_1`, `MWS_4`, 1 rarely to 7 a lot) as Mind Wandering, and items 1 and 2 of the **BSCS** (Tangney et al., 2004; `BSCS_1`, `BSCS_2` reversed, 1-5 like me) as Self-Control — none of the four pairs a validated short form in its own right, so each is a two-item proxy. `ers` ("Emotional Reactivity") is six items of the **Emotion Reactivity Scale** (Nock et al., 2008), two per facet, verbatim, on its 0-4 scale — Emotional Sensitivity, Emotional Arousal, Emotional Persistence, the word in front because a dimension is one name across the run and the bare facet names sit too close to the MINT's and the HiTOP-BR's. `cerq` ("Coping Strategies") is the **CERQ-short** (Garnefski & Kraaij, 2006): nine strategies, two items each, verbatim, on its 1-5 almost-never-to-almost-always scale, the CERQ-36's item number in a comment beside each, under the CERQ's own strategy names in the app's spelling (Catastrophising); the adaptive/maladaptive split of the literature is a reading and not a score, and is left to analysis time. **All three are read back together as one chart** (see **Mind and heart**, below), the level's one section — no rows, no spider, two votes — and **all three are `profile: false`**: sixteen more axes would double the whole-run web. All norms invented placeholders, flagged; nothing on the level reads them, but they are what puts the three on the level at all (`dimensionsOf`). The level's check is `CERQ_AttentionCheck`, asking for 2. **One of the six levels of the second fork** (`fork: 3`), like everything else below the core |
| Level 5–10 | `opinions` → Where You Stand (key `Opinions`): a briefing (turning from you to what you think of everybody else), then **three questionnaires, the third nearly everything**. **What the level is for**, written at the head of the block file and what decides whether a question belongs in it: where somebody leans, in terms comparable with the field (the self-placement and the plane), and what they make of the questions their own society argues about that left and right answer badly (the spectra) — a question belongs in the second half if people who share a place on the plane still divide over it. **Every key on the level starts `Opinion_`**, so the level can be picked out of a saved file by prefix the way the demographics can; the second segment is the item's scale (`Opinion_LeftRight_`, `Opinion_LibAuth_`, `Opinion_Conspiracy_`, `Opinion_Parity_`, …) and the third a word for what it asks (`Opinion_LibAuth_Surveillance`, `Opinion_Parity_Outcomes`), never a number; the three unscored items sit under the scale they are nearest (`Opinion_Parity_Diversity`, `Opinion_Planet_Nuclear`, `Opinion_Animals_Diet`), where a number would make each look like one more item of that scale — so which items a scale holds is read off `dimension` in the block file, never off the key. **Which published item an item came from is said in the comment beside it and not in its key**: the BSA and CMQ items are adapted, and a key carrying their item numbers would promise more than it keeps. `Opinion_ESS_LeftRight` is the one key that names a source, being the ESS's item verbatim. `leftright` is the **ESS left-right self-placement** (`Opinion_ESS_LeftRight`, 0-10), asked first so no statement can colour it, with no dimension and no norms — saved for comparison with every other survey that asks it, read back to nobody, and the one place on the level the words left and right appear, since what it measures is political identity rather than position (the ESS's "Don't know" is not offered, though a labelled way out under numbered circles is now one option away — see **Gotchas**). `cmq`, second, is **three items of the Conspiracy Mentality Questionnaire** (Bruder et al., 2013) — 1, 4 and 5, the highest corrected item-total correlations in the original validation; 2 (politicians' motives) was the weakest and 3 (agencies monitor citizens) may be simply factual (Swami et al., 2017) — on a **slider** (`type: "slider"`, 0-100%, saved as the percentage), as Suspicion; the fourth is reworded plainly, all three are without their "I think that" and the ends are "Certainly false" and "Certainly true", so none is the published item. `views` is **every statement of the level in one questionnaire**, so they are shuffled in among one another: as separate questionnaires each would arrive as a run of its own, and four statements about one thing in a row say what they are measuring. Each scale keeps its own dimension and norms, and the block file keeps each one's provenance together above its items. On the BSA's five labels, under no instruction; the BSA-derived items open on "In the country I live in", written into the item rather than set over it as an instruction, since whose government and whose law is what they turn on. **Thirty-four statements, 38 items on the level, no scale above four or below three.** The scales: **Sharing and Order** (the plane), adapted from the **British Social Attitudes** left-right and libertarian-authoritarian scales (Evans, Heath & Lalljee, 1996), each adapted item quoting its source and why beside it — three items for Sharing (redistribution asks the government to *do more*, "fair share" as the BSA has it, and `Opinion_LeftRight_Markets`, the markets end written for the scale in place of "one law for the rich and one for the poor", reversed) and four for Order (stiffer sentences and the law obeyed though the person thinks it wrong, as the BSA has them; `Opinion_LibAuth_Surveillance`, police power to monitor people's activities against privacy, in place of "schools should teach children to obey authority", which reads as harmless or sinister by reader; and `Opinion_LibAuth_Tradition`, the one reversed item on the side — "How people choose to live, marry or raise a family is their own business, even when it goes against my country's tradition and culture" — in place of the BSA's "respect for traditional values", which is close to a claim of fact; it names the country itself and so does not open on "In the country I live in"). **Parity**: four custom items, equal outcomes against equal chances between groups, two each way, every one a positive statement of its own view — two propositions, each asked from both sides — rather than the SDO7(s) anti-egalitarianism items (Ho et al., 2015), whose abstract "group equality" reads as equal rights and whose negated items read as double negatives — beside `Opinion_Parity_Diversity`, a 5-point trade-off between a range of views and a range of backgrounds with **no dimension**, kept to find out whether it lines up with Parity (each end stated plainly, since a qualifier such as "even if they all think alike" makes one end the obvious one). **Enhancement and Heredity**: seven custom items — four for Enhancement, one theme apiece and two each way (oneself made more intelligent; immortality, "It is good that we try to develop technology that would let people live forever"; the principle, reversed; and selection, "Parents should not be allowed to choose their children's traits, even if the technology were safe and available to everyone", reversed, the two clauses taking the safety and inequality objections off the table), and three for Heredity (between individuals, deliberately not groups; one reversed). **Planet and Animals**: custom — four for Planet (the climate put before growth and comfort, as trade-offs, two each way, among them "Jobs and cheap energy should come before cutting carbon emissions"; its far end is where degrowth sits, noted in the file), three for Animals (one positive, two reversed) — beside two items with **no dimension**: nuclear power (`Opinion_Planet_Nuclear`) and what somebody eats (`Opinion_Animals_Diet`, a behaviour, held last with `shuffle: false`, and the one known-groups check Animals has). **Beauty**: three custom items on how much beauty should count against cost and usefulness, one reversed, chosen so that neither end is the decent answer — a value, and not the personal disposition `Aesthetics_Beauty` asks on level 1. **Words**: three items adapted from the **Words Can Harm Scale** (WCHS; Bellet et al., 2018; Pratt et al., 2026, on the shelf as `literature/Pratt2026Words.pdf`), the belief that words alone can do lasting harm — the premise under the arguments about speech, which nothing else on the level asks about — two of its items about other people and society (8, the highest-loading, with "triggering" taken out of it, and 6 verbatim) and one reversed item written for the other end, since all ten of the WCHS's are keyed one way; the items about the person's own vulnerability are left out, being what the HiTOP-BR and the PHQ-4 ask, and why is in the file. **No attention check**: among political statements one is the most jarring check there could be. **Read back as one figure** (see **Where you stand**, below), the level's one section, two votes. **All three are `profile: false`**: ten more axes would crowd the whole-run web, and a person's politics has no business on a card made to be shared. All norms invented placeholders, flagged, read only to mark the average person. The BSA and CMQ source wordings **have been checked against the sources** and are exact; the law-obeyed item (`Opinion_LibAuth_Obedience`) is the BSA's libertarian-authoritarian item 5. **These are political opinions under UK GDPR Article 9**, whatever the screen calls them, and the ethics application's 5.7 and 5.7.1 have to say so. Its axes are not the Political Compass's on purpose: see the head of `content/block_opinions.js` |
| Level 11 | `closing` — **fixed**, and the only level after the forks. Nothing scored in it, so it opens no results: whether the test was taken seriously, then `Closing_Comments`, a free-text box (`multiline`, `optional`) for anything the person wants to say, with a warning over it that what is written may be made public. Saved as given, `""` when skipped; nothing reads it back |
| — | `gjs` sits in `content/block_UNUSED.js`, named on no level, so it is never asked; the `somatic` medical-history questionnaire sits commented out in `content/block_health.js`. **`content/block_sex.js` is a level on sexuality being looked into and not decided on**. **Locked in** (September 2026): a briefing (`Briefing_Sexuality`, saying that sexuality is a large part of a life and a small part of the science, and that where it is studied it is too often studied as deviance, dysfunction or addiction rather than as the ordinary thing it is), five items of its own (relationship status, `Sex_Relationship`, first, since nearly everything on the level reads against it and nothing else in the run asks it — status only, and kept here rather than in `demographics3` because the `mint` battery's demographics are the group's shared set in the ethics application; then orientation, with a "Something else" that opens a typed `Sex_OrientationOther`, then the number of women and of men somebody has had sex with, asked by the orientation, then masculine-feminine, on a slider from 0 to 100 with "This doesn't apply to me" under it), **Desire** (a briefing, `Briefing_Desire`, carrying the instrument's own instructions, then `sisses`, active September 2026: the fourteen items of the **SIS/SES-SF**, Carpenter et al., 2010, on the shelf as `literature/Carpenteretal2010SISSES-SF.pdf` — the dual control model's accelerator, Sexual Excitation, and its two brakes, Sexual Inhibition: Performance and Sexual Inhibition: Consequences — verbatim but for two adaptations — the four items ending on a negated outcome ("I am unlikely to stay aroused", items 2, 6, 7 and 13) say it outright instead ("I would lose my arousal"), same direction, since disagreeing with the published wording is a double negative, and the three items printed in a men's and a women's version, erection or arousal, are asked of everybody in the women's, so for men they are a close variant — so it is an adapted SIS/SES-SF, never pooled with the published data as the same items; on its 4-point agreement scale turned to run disagree to agree so nothing reverses, shuffled, with "I'd rather not say" under it, declined like the kinks' (a subscale is read off its items answered while two thirds are, laxer than the chapter's rule, which an analysis can keep to from the words in the file); **its published norms**, pooled over the sexes, with the by-sex figures beside them; read back as **How hot is your volcano?** (`volcano.js`, a prototype, below) — what it is for, drive told from breadth beside the kinks, is under DESIRE in the file's NOTES), a second briefing (`Briefing_Kinks`, what the list is, so that it does not come out of the blue) and `kinks` (below). **Parked** (September 2026): `liking`, **Sexual Liking** — erotophilia-erotophobia as the affect ten ordinary sexual cues meet with, on one scale from "Very disgusting" to "Very appealing" (`SEX_VALENCE`) — asked until then and moved whole into SHELVED for something more shareable, which is `kinks`. **`kinks`, Kinkiness**: fourteen kinks on **a ladder of prevalence**, a rung or two in every band from rough sex (~75%; dirty talk, at 94% of the Big Kink Survey's adults, was the top rung and came off as too near the floor to tell anybody apart) down to objectification (~8%), so the count tells people apart at both ends and not only in the middle — acts and scenarios only, no fetish objects (feet, outfits, crossdressing: attractions, not things done) and nothing fantastical (creatures, transformation, hypnosis, taken out September 2026 as too specific) — **eight of them asked as their two sides** (anal, power, bondage, consensual non-consent, pain, humiliation, orgasm control, objectification; `sided`, keyed `Sex_Kink_<Name>_Giving` and `_Receiving`, giving anal sex glossed to cover a body, a toy or a strap-on), twenty-two items, one screen each, **each answered as one cell of a grid** (`type: "grid"`, see **Types**): across, does it turn you on — It's not for me / I'm fine with it / It turns me on — and down, have you done it — Never / not yet, Once or twice, Many times, Part of my sex life (`KINK_GRID`), with "I'd rather not say" under the table, and **a fourth column in front of the rest, "It disgusts me"**, for the recoil "It's not for me" is too polite to hold: counted over the twenty-two it is a disgust score read at analysis time, 0 towards Kinkiness, and it has a cell in every row, since disgust at something that is "Part of my sex life" should be rare enough to be a check on whether the table is being read. Its value is 3, after the others, so the three columns before it keep the values their cells were saved under. Two scales at one press, so that the cells one line of steps could not reach are answers: fine with it and done regularly, turned on and never done, not for me and done. **Only the column is scored**, through `score:` on each cell (see **Scoring**): 1 in the "It turns me on" column and 0 elsewhere, so the dimension is the share of the twenty-two; the row stays in the words ("It turns me on · Once or twice") for the figure and the analysis, and so does Role, which is the giving items' turn-ons against the receiving items' — two counts, read by nothing on screen yet. "I'd rather not say" is **declined** (see **Scoring**): left out of the count rather than counted as a no, so the share is of the kinks answered while two thirds of them are (`enough`), and the words say "of the 18 kinks you answered" where some were skipped. Until October 2026 it was scored 0, and a pilot who declined all twenty-two was told they were more vanilla than 99% of people. **The norm is a placeholder**, loosely the BKS's: its histogram of how many of nineteen earlier kinks turned its 12,123 adults on, stretched over the twenty-two items as a `distribution` (with `n`, said beside the standing), until the app has a crowd of its own. Why kinks, what else measures them, what was weighed (a plane of Imagination against Activity; the scenarios asked twice; six steps on one line, asked until the grid; two rows of buttons; two tick-lists) and why this — under THE KINKS in the file's NOTES. **Shelved, commented out whole in the file**: **twelve scenarios from vanilla to taboo asked twice over** — `fantasies`, how arousing the idea of each is, on the BKS's 0-5 scale, and `experiences`, how often each of the ten that can be done has been done, Never to Regularly — two questionnaires sharing one list (`SEX_SCENARIOS`), the fantasy and the experience of a scenario pairing up by the last part of their keys (`Sex_Fantasy_Bondage`, `Sex_Experience_Bondage`), unwanted attention asked only as a consensual game, and a **TDDS** (sexual disgust, on a scale opened out into arousal) and an **SOI-R** (Attitude and Desire), all to start simple. On a level of its own (`Sexuality`, `minutes` a guess) **in the second fork**, and **asked by `all`, the default** — `mint` does not hold it and its second fork is the six, since it is not in the ethics application (see **Batteries**). Under `all` the fork is seven levels, 5 to 11. A fork's slots must be scored levels, which its dimensions make it (the block's own four items carry none; `kinks` does). **It closes on two figures. The first is How hot is your volcano?** (`volcano.js`, `VOLCANO_OF = "sisses"`, a prototype): an island volcano at dusk in cross-section, its size and shape the same for everybody, the cleft at its crest included, and one channel doing one thing — Excitation the colour of the magma, Inhibition: Performance the width of the conduit, Inhibition: Consequences how far a tapering tongue of lava spills down each flank, from brimming at the lip to steaming in the sea, with spatter thrown out of the cleft onto it that grows with it (a low fountain, `spray`), never an explosion — each a standing against the pooled norms, and everything else in the scene (a crescent moon, dusk clouds, a far-off boat, the beds of old eruptions in the cut cone, a thin plume of steam every volcano breathes out, so the cool end is dormant and not dead) the same for everybody, then the three against the crowd, a strip each, **named Heat, Focus and Caution on screen** (the accelerator and the two brakes, same way round, none reversed: a reversed brake would make the cautious end the lesser one) — the name, the standing in words written so neither end is the worse one, "Heats up faster than 72% of people", "More cautious than 81% of people", and the bell of the published sample three SDs either side of its mean, shaded as far as the person stands, the accelerator's in the magma's own colours, the average ticked and the person a gold line, `crowds`; "Compared with 2,045 university students who answered the same questions" under them, the N being `n` on the norms; **the picture and the strips are linked** (`link`): hovering or tapping the chamber, the conduit or a flank lights that part — a dashed outline, a rim, the whole course the lava could run, drawn even where nothing spills — lights its strip and says in a line which channel it is, and hovering or focusing a strip lights its part, over invisible bands wide enough to find a conduit at its narrowest (`hits`, drawn last, over the vignette, or it takes the pointer); it borrows the climb's classes for the note, the two ends and the vote), the two ends small under "Other people carry other fires", and one vote (`Desire`). **It is skipped in the taste of the level** (`teaser` in `renderResults`, the way on and the fork cards), a blurred suggestive shape being more suggestive than a sharp one; a locked panel still shows it blurred. The badge is the summit. **The second is How kinky are you?** (`kinks.js`, `KINKS_OF = "kinks"`): the crowd stood on end as a violin — a band for each number of the twenty-two, none at the foot and all at the top, as wide as the norm's share of people turned on by that many and drawn both ways out of a spine, shaded cream to plum as far as the person reaches, their own band gold with "You" led off it and the rest dim above (the MINT's crowd card turned upright, so that kinkier is higher); beside it how many turn them on, **how many of those they have lived out** (`lived`, any row of the grid but the first — the share acted on, which says nothing about which and so is in the picture and the link alike) and "You are kinkier than 63% of people (N = 12,123)" (or "more vanilla than…"; the N is `n` on the norm, and goes with the placeholder); one vote (`Kinky`). **Nothing on it says which kinks**: a sentence naming the rarest kink that turned somebody on, and how many people share it, was written and taken out (September 2026) — the most engaging line on the level and the one that gave an answer away, on a screen read over a shoulder, in a level's picture and in anything later shared or compared. Keep it that way. Its crop of the crowd round the person's band would be the level's badge, but the volcano comes first in the run and so is the badge. The plane it replaced, **Desire and delight** (Desire against Sexual Liking), is gone with its PLACEHOLDER Desire item, and `desire.js` with it. Everything on the level is `profile: false`. The file is laid out as what is asked (a header saying what is locked in and active, with the four blockers, then the block and its helpers), then NOTES and then SHELVED, the commented-out questionnaires; the notes hold everything thought so far — the Big Kink Survey data, the structure `data/norms/norms_bks.R` finds in it, a short form, **the six dimensions being considered** (Libido, Liking and Disgust, Vanilla and Taboo, Fantasy and Behaviour and Role — the last two now the grid's axes and the sided items — and Function; Liking parked), **the order the rest is coming in** (relationship and desire now; frequency, worded as Natsal-3 for real British norms and read against relationship status, and sex motives, Cooper et al.'s six or the BSAS, after; satisfaction, if ever, analysis-only), RELATIONSHIP (structure and length still to ask), DESIRE, FREQUENCY and MOTIVES, what was tried and shelved, voyeurism and exhibitionism as a kink to explore, **THE KINKS** (why, what else there is, what was weighed, why this), and **the figure** (a volcano under the sea, whose resemblance to genitals is meant to come out of the geology, and what to watch in it) — and are where that thinking goes on. The four blockers are in the header: it cannot be made optional yet, Article 9, declining an item (solved October 2026, `declined`), and whether a person's own results may be shared. **A figure whose questions were mostly declined is drawn as its locked self**, blurred from the stand-in values, with "You chose not to answer these questions" under it in place of the Locked badge and no vote (`declinedSection` in `results.js`, `.result__declined`); the stars are still asked, and the level's share is left off when every section on it is declined |
| — | **`content/block_dark.js` is a level in progress, asked by no battery** (October 2026): a level on the dark side of personality — antagonism, deceit and ordinary wrongdoing, framed as a light side and a dark side — written `Dark` ("Light & Dark") in `all`'s second fork and in `ASIDE`, so a run meets it only through `?start=dark`, the Hyborian's way. **What it asks so far**: a briefing and `deeds`, twelve grids, each a question in two parts — its stem, "Have you ever…", is the questionnaire's instructions over the box and the item the rest of it ("…cheated on a partner?"), the columns answering in the person's own voice ("Never, and I wouldn't"); the drinking game's "Never have I ever…" until October 2026, dropped as a reference not everybody gets (`type: "grid"`, the kinks' pattern, its own `deedGrid` rather than `block_sex.js`'s `gridOf`, so the two blocks stay independent): across, whether you have done it — Never, and I wouldn't / Never, but I would if it came to it / Once / More than once, the willing never split from the hard one on the smoking-susceptibility precedent — and down, how you feel about it — Guilty / Indifferent / Pleased, a stance and not a pleasure rating, so that one header serves a deed done and a deed never done; twelve deeds on a ladder of guessed prevalence from an excuse to get out of plans down to hurting an animal, every kind of wrong keeping a rung (dishonesty, taking, betrayal, five cruelties or aggressions, among them the RPQ's reactive and proactive aggression as deeds), each culture-neutral and assuming nothing about the person's life but, for infidelity, a partner — and, shuffled in among them in the same questionnaire, **eight good deeds** on a ladder of their own (`GoodDeed_<Name>`, from owning up to a mistake nobody would have traced to you down to putting yourself in danger for a stranger, with making up with somebody who hurt you and never said sorry in the middle, three of them mirrors of a wrong; every rung one that some people have done and saying no to does not shame, which is why helping a stranger came off), each carrying a grid of its own through the item's own `format`: the same columns over Embarrassed / Indifferent / Proud, the uncomfortable feeling on top and the warm one at the foot as in the wrongs' rows, drawn in a blue where the wrongs' are red so that the change of rows is seen. **The light side is behaviour rather than a trait scale** (October 2026): doing good and doing harm vary separately (Krueger, Hicks & McGue, 2001), where the Light Triad, which the plan had there and which was cut for it, is mostly the dark side reversed and Agreeableness. **Each deed feeds one side, off the across axis of its grid**: Dark Side, the share of the wrongs done (Once or More than once), and Light Side, the share of the good deeds done — the same count on both, so the pans are weighed alike — each read while two thirds of its deeds are (`enough`) against an invented crowd — a normal through a guessed mean and SD, binned a deed to a bin (`binnedNormal` in the block file) — and both `profile: false`; the rows stay in the words for the analysis. Until October 2026 the wrongs fed both sides, the share never done and the share that pleased. **It closes on the balance** (`balance.js`, `BALANCE_OF = "deeds"`): "Which way do your scales tip?", a pair of scales with the dark side in the left pan and the light in the right, each pan holding its side's crowd stood on end (the kinks' violin, drawn as a smooth outline through the norm's bins, or a normal through its mean and SD where it has no distribution) and filled from its foot as far as the person's side reaches, so that the filled part is the side's standing; **the beam tips to the heavier side**, a pan's weight being its standing (`MOST` degrees at one side wholly outweighing the other, level within `LEVEL` of each other). The pans carry the two levels and the beam only the difference, so strong in both is laden pans hanging level and weak in both near-empty ones, and the frame's two strengths stay two. Under the pans each side's standing ("Weighs more than 64% of people's"), then which way it tips in a line, then one vote (`Sides`). As the card opens the crowds fill from their feet and then the beam swings over and settles, the pans moved by as much as their hangers (`--tilt`, `--dx`, `--dy`, eased on one curve). **Nothing on it says which deeds**, but the level's share carries both sides' values, which together say how many of the wrongs and how many of the good deeds were done. The badge is the heavier pan and the crowd in it. Changing what is weighed is the names in `SIDES` in `balance.js` and what it says on hover. **The rest is a plan in the file's head**: the ~40-item set (sixteen of the SD4, four of TriPM Boldness, the LPQ's ability with Serota's lie count, a self-placement), every item with its provenance and whether its wording is verified, what was cut and why (the Light Triad among them, and guilt-proneness, the GP-5, noted for later), what is still to come on the balance (the self-placement as a ghost of the beam, the facets as positions out of ten), the composed painted cards that were set aside for it (a character, a planet and a frame as layers, on the Hyborian Age's pipeline), a student battery of its own, and the Article 10 question the deeds raise. Not in `mint`, so the deck's Content table and the codebook do not describe it. It is a different level from the moral-alignment hook in `README.md`, on purpose |
| — | **`content/block_hyborian.js` is a level asked by no battery, Your Hyborian Hero** (named The Hyborian Age until October 2026) (key `Hyborian`, on the timeline in the second fork so that it has a place, a key and a name, but in `ASIDE`, so `all` does not ask it and `mint` does not hold it: a run meets it only through `?start=hyborian`, which asks a block whatever the battery says and walks that level first), written to be shared in the Conan fandom and to read beside the rest of the run: a briefing, then `hyborian`, twenty-four custom statements on a 7-point agreement scale under eight dimensions, **none with norms, on purpose** (the wheel's exception: nothing is read against other people), `profile: false`, no attention check. **The items are written in Howard's register, in one perspective and against lopsidedness** (third draft, September 2026; the reasons are written out over the items): plain words, one claim an item, no joke, two of them his own lines (the borderer's closing line out of *Beyond the Black River*, Crom's out of *Queen of the Black Coast*); **every item a maxim and none saying "I"**, since a maxim asks whether you endorse a philosophy where "I would rather…" asks for a report on yourself, and the two are answered differently in good faith — the reading is which hero somebody *would have been*, so endorsement is the task; and **every item contested**, forward or reversed, with the cautious or civilised end never the silly answer, since the hero is read off a cut at a half and a dimension tells people apart only where the room splits over its items — the second draft's rule, one reversed item easy to agree with against forward items that cost something, did not centre the scale (agreeing with everything scored 5, a reach of two thirds), a soft reversed item being a floor and not a counterweight. Two forward and one reversed throughout; two and two would put a yea-sayer on the cut and halve the exact ties, at the price of a fourth item a dimension, and is the first change to make if the data say the cut is off. **The Code is honour, never lawfulness**: nothing in it asks about rules, which Howard's barbarian scorns while keeping his word — the first draft's reversed item did, and set the Code against Barbarism. Four say how somebody would live in that world — **Burning** (a short blazing life over a long careful one; nothing else in the run measures vitalism), **The Code** (honour and plain dealing against guile, one bipolar scale whose reversed item is the thief's, honour as a luxury with a price), **Barbarism** (civilisation as soft and passing) and **Splendour** (rank and fine things over a simple life, added for the Princess; its reversed item is the Barbarian's answer to Yasmina, "A gold throne is a cage, not a prize") — and four what they take the world to be: **Indifference** (Crom's: no god or fate is watching, and praying is a way of doing nothing), **Afterlife** (something comes after death and it matters, the Cimmerian grey mist at its foot; nothing else asks about death), **The Gift at Birth** (what you have was given; the rest is what you do with it — overlaps the opinions level's Heredity and is kept for being the most Cimmerian thing there) and **Sacred Pleasure** (the body as holy rather than base). The head of the file says which of the first draft's sixteen were dropped and why (the Veil is the CMQ, Kinship is Animals, Instinct is the MINT, and so on). **It closes on a hand of two cards** (`hyborian.js`, `HYBORIAN_OF`): **the hero**, the nearest of eleven profiles to the first four reaches, each hero a corner of that four-dimensional box (the Barbarian, the Free Blade, the Pirate Queen, the Thief — after Taurus of Nemedia — the King, the Frontiersman, the Sorcerer, the Witch, the Princess — after Yasmina — the Exile — after Yag-Kosha — and the Shaman — after Zogar Sag — archetypes, never a character's name, since "Conan" is a live trademark; eleven heroes on sixteen corners, an answer on an empty corner going to the hero it differs from on the dimension nearest the middle, so that answered at random each comes up 4% to 14% of the time, the Exile and the Shaman least, being the two added to fill the corners that had four heroes round them), as **its painted card** (`picture` on each of `HEROES`, a generated painting cut by `assets/hyborian/source/cut.py`, all eleven painted; a hero without one would be drawn as its emblem on a card of the same shape) and **the card's back beside it**, on the painted card's stock and as large as half the section allows (up to 390px, its words sized in `cqw` so the back scales as one card, and fitted to the painting's own proportions so the two cards are one size for every hero — it would grow taller rather than cut words off, so longer words on a hero or a fifth stat want the two measured again): "In the Hyborian Age, you would be", the name, **the person's four stats** (Burning, Code, Barbarism, Splendour, each its reach along its own scale out of ten, as a row of rubies — the lit ones faceted stones whose glints catch the light one after another, the rest empty bronze settings — and a number — a position, never a standing, the tooltip saying what the stat is), and "It predicts that you are…" over four words — no flavour text, the painting saying who the hero is. **Over the pair, the hero's epigraph**, a line of Howard's own and the story it is from (`epigraph` on each of `HEROES`; checked against the texts, none carrying the trademark), and, locked, the opening of the Nemedian Chronicles instead (`NEMEDIAN`), since a stand-in hero's line would give it away. One vote under the pair, `Hero`. **There are no ties**: where two heroes are as near (a reach of exactly a half, a mean of 4, which is not rare), the first written in `HEROES` is taken, so a reading always names one hero. Locked, the two cards from stand-in values, the painting and everything earned on the back blurred, no vote. The badge is the top of the hero's painting cut to a square, drawn a fifth larger so that the card's border and frame fall outside it. **The god is not shown, for now** (September 2026): the other four (Crom, Mitra, Ishtar, Ymir, Set, read off Indifference, Afterlife, the Gift at Birth and Sacred Pleasure) are still asked and saved, and `GODS` and `god()` still read which would claim somebody, but nothing draws it and `God` is out of `feedbackKeys`. The pictures' originals are git-ignored in `assets/hyborian/source/` and fetched by nothing, so they live in Dropbox alone; the prompts they were made from, and the styles being tried, are at the foot of the block file |

**The demographics open places.** The three demographics blocks are named on
no level of any timeline but in `DEMOGRAPHICS` (`content/timeline.js`), and
`PLAN` puts them at the head of the run's first three levels, one apiece and
in order, as each level's `opening`: `demographics1` opens level 1,
`demographics2` level 2, `demographics3` level 3, **whatever those levels
hold**. Everything after General is drawn and then chosen, so a demographics
block written on a level would be asked at a different depth by every person
and, on `all`, not at all near the start by most; tied to the place, the
second level of every run opens on the second set. **`opening` belongs to the
place, the way the level's number and depth do**, so `swapLevels` leaves it
where it is and splices only the items of what is asked there (`placed`, an
item out of a demographics block or an interlude), and the level a fork brings in lands
behind them; the item waiting behind the level screen is then the place's
first demographic. **A level `?start=` brings forward is a hook and opens on
its own questions**: the demographics open the first three levels after the
hooks instead, which is General and then the two after it
(`?start=opinions` asks the demographics on levels 2, 3 and 4). **When
General is itself the hook** (`?start=fipi`), `demographics1` is asked on
level 2 and General's results are read before there is a birthday: the star
card is skipped there (`starSign()` has nothing to read) and appears once the
panel is reopened after it, and the badge minted is the temperament plane.
The closing level is never a place unless there is nowhere else, and a run
of fewer places than three (`?only=`) puts what is left at the head of its
last. `?only=` and `?skip=` name them like any other block; `?start=` cannot,
and drops one with a word in the console. They are written `shuffle: false`,
and everything else on the level is shuffled in behind them. The saved
file's `levels` lists a level's `opening` at the head of its `blocks`, so
it says what was asked on that level in that run. **The `minutes` in the
timeline were measured when the demographics were on General, Brain-Body
Axis and Mood & Health**, which the next pilot's timings will correct.
`data/synthetic/codebook.js` places them by the same rule, for a run no link
started on, so the deck's Content table writes them at levels 1, 2 and 3.

**The interim.** `mint` is a core the ethics application asks of everybody
and an optional rest, and the interim (`content/block_interim.js`) is the
line between them, three screens: `Briefing_Interim`, "Well done, you've
completed the main part of the study!", **the one briefing written
`celebrate`** — a milestone rather than a pause, so it is centred and edged in
gold, its heading in gold under an emoji that pops in, and the finale's three
sprays go up out of the heading as it arrives (`renderBriefing`,
`.briefing--celebrate`; the sprays are dropped if the run has moved on first);
then `Interim_SurveyAccuracy` and `Interim_Comments` — the closing's
two questions, asked again under keys of their own, so that somebody who stops
after the core has answered both and each stretch of the run has its own
answer — and last `Briefing_Onward`, which is three things on one screen, so
that most people, who stop here, meet one screen and not three. First **the
debrief** the ethics application promises everybody who finishes the study,
in two paragraphs (the aim, what interoception is, the MINT's format drawn at
random, that the results are descriptions and no diagnosis, confidentiality,
the two contacts on the consent sheet, and the Samaritans, Mind and the
University's wellbeing pages as support, its links opening in a new tab),
read before the choice to stop; then the SONA credit, for a run from SONA;
then "What next?", saying that everything from here is optional, **whose way
on is the choice of the first optional level** rather than a button — the
cards under the box. **A run whose link says `?source=SONA`** (any case) is
offered its credit between the debrief and the choice: a box with a button
linking to SONA in a new tab, the participant code on the end, and "earn no
further credit" in the "What next?" line under it, as the consent sheet promises. The text is worded from the run for that (see
**A question may word itself from an earlier answer**); nobody else sees any
of it. **The link is a placeholder** (`SONA_CREDIT`, at the head of
`content/block_interim.js`): the study's client-side completion URL from
SONA goes there, cut after `survey_code=`, and SONA grants credit only for its
own survey code, so the study's link on SONA has to carry
`?pid=%SURVEY_CODE%&source=SONA&project=mint`. Clicking it is not recorded;
SONA records the credit. A SONA participant who goes on without claiming it
is not offered it again at the end of the run. It is written on the timeline between the two forks as an
**interlude** (`{ interlude: true, blocks: ["interim"] }`), which is no level:
`PLAN` takes it off the level list and puts it at the head of the first place
written after it, as that place's `opening` and ahead of any demographics
there, so it is asked after the last core level's results whichever level
the person then chooses to put there. Not a place a link brought forward, and
never the closing: with only the closing after it, it is not asked at all.
Like the demographics it belongs to the place (`placed`), and **unlike them it
belongs to no level** (`between`): `askedIn` leaves its items out, so they
fill no ring, move no descent, are counted down by nothing, stamp no
`timeLevel<N>` and are no part of that level's `qualityControl` — the comments
box alone would otherwise put minutes into the reaction times of whichever
level comes fifth. **The choice waits for it.** A fork whose next slot opens
on an interlude with an `onward` briefing (`onwardIn`) is not offered on the
level screen before it: that screen has the one button, "Continue the test →",
and no taste of what comes next, since that is not yet decided. The cards are
drawn under the onward briefing instead (`renderBriefing` into
`#briefing-paths`, the same `renderFork` the level screen uses, handed where to
draw and what a press does), its Continue hidden and Enter doing nothing while
the choice is pending (`passBriefing`), and a press is `goOnward`: `takeFork`
as on a level screen, the run put back on the briefing (the swap puts it at
the head of the place, which is behind it), and on through `advance()` into
the level chosen. **In the saved file**: the response of the level screen
before it (`Level_4`, on a run no link started on) is "Continue the
test →", `Briefing_Onward`'s is the choice in the words the cards carried (the
level taken, then those passed over in the order written, as a level screen's
would be), and the `choice` — the cards as they stood, the recommended one and
the one taken — is on level 4's entry in `levels` as before, since `takeFork`
files it under the level before the slot, whichever screen offered it; so
`Level_4_Offered` and the rest in `preprocess.R` and the **Choices** of
`overview.qmd` read the same as ever. `levels[4].blocks` lists `interim` first.
Passed again on the way back down, the onward briefing keeps the choice as its
answer. A briefing written `onward` outside an interlude throws. Enter on a
link in a briefing's words, or on a card, is the link's or the card's and does
not pass the briefing. `data/synthetic/codebook.js`
places an interlude by the same rule and marks its items `between` (and the
briefing `onward`), which is how `synthesize.py` answers the onward briefing
with the choice and `Level_4` with the button, and how `overview.qmd` leaves
the interim out of the first optional level's time and off its radar; its
*said random* reads either accuracy item.

A follow-up to an
answer (`…Other`, `GenderIdentity`) is written directly after the item it
branches from. The one-item scales of the `singles` block — narcissism, health,
stress, self-esteem, self-concept clarity, search for meaning, self-efficacy,
life satisfaction, aesthetic seeking (`Aesthetics_Beauty`, "I value beautiful things and I go
out of my way to seek out beauty", custom — valuing and seeking
rather than being moved, since nearly everybody says beauty moves them and
effort is where people differ; two clauses in one item on purpose, the effort
being how the valuing shows; the fourteen-item AReA is the validated measure
if it ever wants one) and the two
self-placements — are written as one `singles` questionnaire and not as eleven,
so that they are asked in among one another; none of them is a sixth item on
the FIPI, which would put them on a chart they do not belong on. If one of
them ever earns norms it wants a questionnaire of its own back, so that its
results carry its own name. `gjs` is **commented out** in
`content/block_UNUSED.js` *and* named on no level of the timeline — a block the
timeline does not name is inert either way — because it asks everybody about a
job without asking first whether they have one. Waking it takes both.

**Levels that score, and levels that don't.** A level with nothing scored in it
opens no results, and has no level screen — `advance()` goes straight on from
it into the next level's first item: `scoredLevels` (the levels that hold a dimension) is what the
sidebar draws buttons for, while the line itself runs over every item there is.
That is what `closing` is for — the last item of the run sits on a level of its
own, so the last scored level is opened and read *before* the test ends rather
than instead of it. **Everything the participant sees calls these levels**;
nothing on screen or in the code says "part". The end of
the run is `finale()`: three sprays out of the item that ended it, then the
profile.

**Branching.** An item with `showIf: { key, is }` is only asked once that answer
is given. `questions` still holds every item; `shown()` decides, and everything
that walks the run goes through `nextShown` / `previousShown` / `askedIn`
instead of `index ± 1`. `pruneBranches()` drops a branch's answers when the
answer that opened it changes, so a closed branch is indistinguishable in the
saved file from one never reached (`response` and `timeOnset` both null).

**An option may branch too**: an option carrying `showIf` is
offered only while that answer is given, which is how the day of birth offers
a 30th and a 31st only after a month that has them. `offered()` is the one
test, and what is put on screen, what the keyboard counts and what test mode
answers with all go through it; `question.options` still holds every option,
so `said()` reads back an answer whose option has since closed. Nothing prunes
such an answer — a month changed after the day is given leaves the day as it
was, which the star sign reads without harm.

**The item itself.** `text` is written into the page as HTML, so a question may
carry more than the bare statement: a gloss on the word being asked about, set
under it and quieter (`<small>`, which the stylesheet drops to 0.6em) — the
FIPI's "That is: sociable, assertive…", the two curve items' definitions of
*intelligent* and *attractive*, the BAIT's note on what counts as an AI tool.
It comes from the block file it is written in and nowhere else.

**The stem belongs over the box, not in it.** The lead-in that frames a whole
questionnaire — "Over the last 2 weeks, how often have you been bothered by the
following problem?" — is that questionnaire's `instructions`, which stands
italic above the item, quiet muted text with no box or tint round it, and is re-read with every one of them. A lead-in
different from the last one shown lights up once in the item's colour (`instructions--new`, `leadShown` in `renderQuestion`), since
a changed lead-in over items that look alike is easily read past. Written into each
item, it would put the lead-in and the thing being asked in one box, on one
card, unlike every other scale in the run; the commented-out CDS-2 and PCL-2
beside the PHQ-4 still carry theirs and want the same move if they ever come
back.

**A question may word itself from an earlier answer.** `text`, on the item or
on any one of its options, may be a **function** of the answers rather than a
string: it is handed a read-only `answer(key)` and returns the words. `worded()`
in `app.js` is the one place either kind is read — the question on screen, a
briefing's body, an option button's label, and `said()`, which is what puts the
words in the saved file — so a function and a string are interchangeable
everywhere and nothing else in the engine knows the difference. It exists so
that one item can be asked several ways without being several items with several
keys: `BirthDay` asks "On which day of February were you born?", the month
read out of `BirthMonth`. An
item worded from an answer should carry the `showIf` that waits on it, so it can
never be drawn before the answer it words itself from is there. Wording a
question is not answering one — the accessor only reads. **It is handed the
run as well**, a second argument (`runFacts` in `app.js`): `run.participant`
and `run.source`, the code and the source already made safe where the link
was read, so they may go into an `href`. The interim's onward briefing is the
one text that reads it, to offer the SONA credit (see **The interim**).

**Types.** Every item has a `type`, which is the whole of what decides how it
is put on screen: `"choice"` for option buttons, `"input"` for a typed field,
`"multi"` for a list several answers may be true of at once, `"curve"` for a
place on a bell curve, `"slider"` for a point on a line between two ends
(`renderSlider`: a range with no thumb and Continue held until it is touched,
so the middle it starts at is never an answer; **the line round the range,
`.slider__line`, takes the pointer and not the range**, the curve's rule, since
iOS moves a range's thumb only when the thumb is dragged and the thumb is
hidden in the middle — a tap on a phone picked it up from there and landed
somewhere else — and a touch counts as a drag only past `SLOP` pixels, or a
finger rolling as it lifts moves the answer; the reading leans inwards at the
ends so "100%" is not cut off by the edge of a phone; `min`, `max`, `step`, `unit`
and `anchors` on the format; the CMQ's likelihood — and a dashed ghost of the thumb following the pointer with the value a
press there would give, the track filling to the thumb once pressed, a halo
round the thumb that grows while it is held, and the spray coming out of the
point chosen, `.slider__mark`, rather than out of Continue), `"grid"` for one
cell of a table, two scales answered at one press (`renderGrid`: `format.grid`
carries the headers, `across` and `down`, and **the cells are written out as
options by the content** — `gridOf` in `content/block_sex.js`, each carrying
the `across` and `down` value it stands at and its column's `score:` — so the
file, the codebook, test mode and `said()` see an ordinary choice whose words
are the two headers, "It turns me on · Once or twice", and only the renderer
reads the table; a cell shows a ring, its words going to the screen reader,
the two headers it stands under light as it is hovered or focused, with a faint wash out of each to the cell (`.grid__beam--trace`, the answer's beams at a fraction of their strength, fading in rather than sweeping), a way out
sits under the table, the spray comes out of the cell, and the digits answer
nothing, there being more cells than digits; `grid.ask`, where the content
writes it, is the two questions the table is the product of — both in the
table's top left corner, "Do you like it?" highest and "Have you ever done
it?" in the corner itself, written as notes in the margin: in a hand (whichever the
device has — `Segoe Print`, `Bradley Hand`, `cursive` — since no web font is
fetched), two notches smaller than the table's words and tilted, each with a
short curled arrow of its own (`ARROWS` in `renderGrid`): off "Do you like
it?", whose words run a little past the corner, one drops down the corner's
right edge and hooks right onto the first column header, the rest of its row
held empty (`.grid__rest`) so that the headers do not come up into it; off
"Have you ever done it?", which stops short of that lane, one falls onto the
first row header. Each is held by the end that points, so that it stops short
of the headers' words, and the two keep to lanes of their own so that neither
crosses the other's words; the columns are held
to 150px each (56px on a phone) and the table centred in the item's full
width (a grid question lifts the 720px a row of circles is held to), so that
it comes out about as wide as the item box over it without a cell so wide
that the eye has far to go from a ring to its headers; its words are the size
a labelled scale set in a row is written at (14px, `.options--row`), the
notes a notch under them. A `zoom` on the whole table was tried and taken
out: it matched the width but made every word larger than the rest of the
run's, and the four column headers are short
sentences of one length that each break onto two lines — and an answer is drawn as
their meeting: a wash sweeps along the cell's row out of its header and
another down its column, both headers pop and stay lit a little larger (by a
transform, so nothing reflows) and the cell pops where the washes
meet, `.grid__beam` placed on the table's own grid lines rather than
measured, standing still when the item is come back to; an absolutely
placed grid item's `auto` end line is the table's edge, which is why both
ends of every beam are written), `"briefing"` for a screen with nothing
to answer on it. The first two need never be written in `content/` —
`typeOf()` reads them off the format, since a question that said its own type
as well would only be a second place for the two to disagree; the other five are
written. `SCALES` in `app.js` is a renderer per type, and `SPRAYS` beside it names what
each type is answered *by* — which is where the spray comes out of when it is.
Those two tables are the only places a type is dispatched on, so **a new way of
answering is a `type` in `content/` and a line in each of them, and nothing
else moves** but its own renderer, its own stylesheet block and its line in the synthetic workbench.
(`HOLDS`, beside them, is how long an answer stays on screen for a type that
wants longer than `ADVANCE_DELAY` — the grid, whose beams have to meet — and a
type not in it needs no line. `answer()` says whether it took the answer, so
that a renderer drawing something of its own on the press draws nothing on
one refused.)
A Likert scale and a list of countries are both `"choice"`: they differ in what
is written on the buttons and in nothing the engine can see, and giving them
separate types would be a distinction with no behaviour behind it.

**One screen, one item, one answer**, and nothing yet puts two on a screen.
The shelved sexuality scenarios are asked twice (a fantasy and an
experience) as two questionnaires for that reason. **The grid is how two
scales are answered on one screen without breaking it**: the kinks' cell is
one answer to one item, the pair in its words, and the file, the codebook and
the scoring see one column an item. Drawing a *pair of items* on one screen
was considered and left unbuilt; the case against it and the one shape it
should take if it is built — grouped items, each keeping its own key, answer
and times — are written above `SEX_SCENARIOS` in `content/block_sex.js`, with
the list of what it would touch.

**Briefings.** An entry of `type: "briefing"` is not a scored question but a pause
inside a level: a heading, a few paragraphs of `text` (HTML, into
`.briefing__body`) saying what the next stretch is about, and a button. **It
belongs to its block, beside the questionnaires rather than inside one** — it
introduces the whole stretch that follows, which may be more than one
questionnaire, and nothing that shuffles the items of a questionnaire can reach
it there. `typeOf()` throws if one is found among a questionnaire's `items`,
since there it would render as a scale with
nothing on it. The engine forces `shuffle: false`, and the run is shuffled around
it rather than through it. Ten are asked, one at the head of each of the
`fipi` block (warning that the questions get stranger further down — the frame
for the whole run rather than for the five items alone, which is why the two
are one block), the `mint`
block (turning from questions about you to questions about your body), the
`bait` block (turning from you to what you make of AI), the
`mood` and `health` blocks (each turning from you in general to the last few
weeks), the `hitop` block (widening from the last
few weeks to the last year, and saying that
what follows is asked as spectra rather than as categories), the `hexaco` block
(turning from the five strokes of level 1 to a
fuller drawing of the same traits), the `primals`
block (turning from the person to the world the person takes themselves to be
living in), and the
`archetypes` block (turning to the self as a story), and the `regulation` block
(turning from what you are like to how well you steer it). **None of them says
where in the run it falls** — no "finally", "next" or "let's start with", and no
"level 1" — so a block can be moved on the timeline, or
left out of a battery, without its briefing going wrong.

It takes the survey screen over rather than being a screen of its own
(`renderBriefing`, hiding `#text` and `#scale`), so everything guarding on
`screen === "survey"` — the keyboard, the back button, the timing — goes on
holding while it is up. Its onset, continue response and response time are
recorded in `items[]` like any other item, but `askedIn` leaves it out of
scoring and quality-control counts so it can never be the thing holding a level
shut. `isBriefing()` is the one test for one, and everything that counts what
was answered goes through it. Test mode never stands one in for a person either
— only the items of a questionnaire are thinned, and a briefing is not one of
those. Leaving one goes through `advance()`, the same way out an answered item
takes, so a briefing could end a level and the level would still break the same
way. The count above is ten; the `icar` block's makes eleven, turning from
what you are like to how you think, and the `sex` block's, asked only by
`all`, a twelfth, saying why a test of the person asks about sex at all, with a second before the desire items (`Briefing_Desire`, the SIS/SES-SF's own instructions: what "aroused" means, and to answer a situation never met as if it had been) and a third before the kinks (`Briefing_Kinks`) saying what the list is and that at the end the person sees where theirs falls. The `hyborian` block's, asked by no battery and reached only by `?start=hyborian`, is one more: what the Hyborian Age is and that the level ends on which of its heroes you would have been. **The `interim`'s two are the exception to saying nowhere where they fall** (`Briefing_Interim`, well done for finishing the main part of the study, and `Briefing_Onward`, the debrief and then everything from here being optional, left by choosing what comes next rather than by a button): where they fall is what they are for, and being an interlude they cannot be moved to anywhere else.

**The curve.** A `"curve"` item (`renderCurve`) asks where somebody puts
themselves in a room of a hundred, and is answered on a normal curve rather
than on a scale of points. Moving across it fills it from the left and writes
the share over the mark, and those are the same fact twice: the area under the
curve up to a point *is* the share below it, so the fill is read off
`percentile()` — the one already used for scoring — against the standard normal
the curve is drawn from. The number shown is what is answered and what is
saved.

A click on the figure is the answer, with nothing in between to confirm it:
where it lands is the place, and the number standing over the mark is what is
recorded. **The whole figure is therefore live** — a click anywhere on it ends
the item — so anything added around it wants to sit outside `.curve`.
Underneath it is a real `<input type="range">`, invisible and taking no pointer
events of its own: it holds the value, carries the item to a screen reader, and
is the only way in that is not a pointer — the global key handler already
ignores an `INPUT`, so its arrows move the mark instead of sending the run
backwards, and Enter takes where it has been moved to. The figure alone handles pointers, so the two can
never disagree about where the mark is. Going back to an answered one puts the
mark where it was left, which is why `placeOf()` exists: what is kept is the
share, so the place has to be found back from it.

**Typed answers.** An `"input"` item renders a field and a Continue button
(`renderEntry`) instead of option buttons, taking what is in it on Enter or
click: `"number"` once it is inside `min`/`max`, `"text"` as soon as it is not
blank (`max` is its length). The global key handler ignores events from an
`INPUT` or a `TEXTAREA`, or digits would answer the item while being typed. A written answer is
somebody's own words, so nothing may put it in a selector — the spray on
answering comes out of the Continue button rather than out of
`[data-value="…"]`.

A text field may be written `multiline: true` (a `<textarea>` of several
lines, `.entry--long`, with the button under it rather than beside it —
Enter starts a new line, so Ctrl+Enter or Cmd+Enter is what takes it) and
`optional: true` (a blank is an answer: the button reads "Skip" while the
field is empty, and what is saved is an empty string rather than the null of
an item never reached). The one item that is both is `Closing_Comments`, the
last of the run — a box for free feedback, which nothing scores and nothing
reads back, and which the item warns may be made public. `anyAnswer` fills
it with "test" in test mode like any other text field.

**Several answers at once.** A `"multi"` item (`renderMulti`) is a list to
tick rather than a scale to pick a point on: the labelled buttons of a choice,
latched instead of taken on the first press, with a Continue underneath that
is what actually ends the item. What is recorded is a **list**, written in the
order the options are authored and not the order they were pressed, so two
people who chose the same things save the same answer. An option marked
`exclusive: true` — "none of these" — is not one more thing that can be true
of somebody: taking it puts every other answer down, and any other answer puts
it down. Nothing chosen is not an answer, since saying "none of these" is a
different act from saying nothing, which is why Continue stays disabled until
something is latched.

A list is one answer and travels as one everywhere: `said()` reads it back
option by option so the file holds the words, `markSelection()` treats a single
answer as a list of one so both light the same way, and `shown()` opens a
branch on **any** of the wanted answers being among the ones given — which is
how the psychiatric treatment item waits on there being a diagnosis at all. The
keyboard latches by pressing the buttons themselves rather than keeping a
second copy of the toggling, and Enter is what says the list is finished.

**Scoring.** Items sharing a `dimension` are averaged by `score()`, which returns
`undefined` until every one of them is answered — that is what gates the reveal
of a chart point or a results row. An item marked `reverse: true` is counted
backwards into its dimension (`counted()`, `lowest + highest - answer`) — what
was answered is still recorded as given, only the scoring turns over, which is
how the MINT's deficit items add up to Clarity. An option may carry a **`score:`** of
its own — what choosing it is worth — where its value cannot say it, since
values have to tell options apart and two options that differ in words can be
worth the same: the kinks' grid cells are worth 1 or 0 (in the "It turns me on"
column or not) whatever they are numbered. Then the scores, not the values, are the scale's
bounds and what `counted()` reads, and every option on the scale but its ways
out wants one, or the flattening throws. It is `correct:`'s shape moved onto
the options. **An item may feed more than one dimension**: `dimension` a list,
and each option's `score:` an object naming what it is worth to each (written for
the deeds' grid cells, `{ "Light Side": 1, "Dark Side": 0 }`, one dimension
off each axis of the grid; nothing uses it since October 2026, when each deed
came to feed one side, and it is there for the day a grid's rows are scored
too). The first dimension named is the item's own; each of
the others is carried as `also` and counted through a view of the item made
with `Object.create`, which reads that dimension's worths and bounds and
inherits the rest, so the level a fork re-stamps on the item is the level the
view reads. Everything that reads a dimension (`score()`, `reachOf`, a level
link) sees one list of items a dimension and nothing else changes.
`data/synthetic/codebook.js` copies `dimension` as written, a list included,
and reads no `score:`; it walks `mint`, which has no such item, and wants
teaching before one is. An option marked `custom: true`
("Something else", "Other") is an answer outside the scale: the engine keeps it
out of the scale's bounds and `counted()` treats choosing it as the item being
unanswered, so an escape answer holds its dimension unfinished rather than
feeding an arbitrary code into the average. **An option marked `declined:
true`** ("I'd rather not say", the sexuality level's) is off the scale too,
but is no answer rather than a different one: `counted()` gives it null and
the item is left out of its dimension, which `score()` reads as the mean of
the items really answered — once every item has an answer and at least
`enough` of them (a share, written on the questionnaire; all of them where it
is not) are real. Below that the dimension is answered and unscored, and
`declined(dimension)`, on the engine and in `shared`, says so, so that a figure
can be drawn blurred with a line saying the questions were not answered rather
than leave its section out without a word. `total()` takes no declined answer
at all, a sum over fewer items than the scale having no meaning on it. The
codebook marks a declined option `custom` as well as `declined`, so whatever
reads the codebook keeps it off the scale. `norms` (mean/sd) turn a score
into a percentile; the tercile it lands in picks the `interpretations` text. A
norm may also carry its **`distribution`** — `{ from, step, shares }`, the
share of the norming sample in each bin of the scale — and `percentile()` then
reads the standing off the people themselves, a bin's people taken as spread
evenly across it, rather than off a normal curve through the mean and SD. The
MINT's three carry one (Bodily Awareness is piled up between 4 and 5.5 with a
long tail below, which a normal curve misplaces), printed by
`data/norms/norms_mint.R`; everything else is read off the curve. Anything
showing a standing goes through `percentile()`, so a figure drawing the
distribution and the words beside it cannot disagree.
**Norms are also what put a dimension on a results screen at all**:
`dimensionsOf` leaves out any dimension without them, so it takes no row, no
point on its questionnaire's chart, and — if that is all of that
questionnaire's dimensions — no section either. A questionnaire written `results: false` in `content/` (the sleep single, the five neutral primals) is left out whole, norms and all: the norms stay for analysis, and nothing on its level reads them back. It is still asked, still
scored and still saved; there is simply nothing to place it against, and a bare
number tells the person who gave it less than silence does. Writing the norms
is how a scale earns its way into the feedback, which is why the `singles`
items are asked and read back to nobody — not in a level's results, and not on
the whole-run profile web either, which carries only what a level names (see
**The profile**, below). The PHQ-4 is a different kind of
exception: Anxiety and Depression carry norms, so `dimensionsOf("phq4")` is
not empty, but neither ever earns a row — `total()` reads them as a *sum*
rather than `score()`'s average, drawn as the weather over the climb instead (see **The climb**, below). The twelve archetypes are the one outright exception,
and the only one there is meant to be: they carry no norms and are fed back
anyway, because they are read against *each other* rather than against other
people (see **The wheel**, below). Everything else follows the rule — a
dimension with nothing to be placed against says nothing.

**Right answers.** An item written `correct:` is a problem rather than a
rating: `counted()` gives it 1 for the right option and 0 for any other,
whatever the options are numbered, and the flattening sets its bounds to 0
and 1 so a reach along it is a share of items right. It is a field beside
`check:` rather than a use of it, or sixteen wrong answers would count as
sixteen failed attention checks. What is written is **not the answer but a
hash of it**: `answerKey(key, value)` in `content/timeline.js` (FNV-1a over
`"<key>=<value>"`, eight hex characters), which the engine computes over the
answer given and compares. The block file is public and unminified, so this
is obfuscation, not secrecy — the page has to be able to score, and anybody
reading the code can try the handful of options — but it keeps the sixteen
right answers out of a search engine and off a casual reading of the source,
which is the ICAR's own concern about its items. To write one, open the page
and call `answerKey("ICAR_VR_04", 4)` in the console. The option values of
such an item are its position in the published list, so the saved file's
words and values both read back onto the published key. A picture item is an
ordinary `"choice"` whose `text` carries the problem as an `<img>` and whose
options each carry an `image:` — the candidate, cut out of the published
figure — which `optionButton` puts on a tile (`.option--picture`) with the
option's `text`, its letter, under it as a caption. The letter is still the
button's words, so it is what `said()` saves, what a screen reader hears and
what the keyboard answers by (a one-letter option is answered by its letter
as well as by its position, which serves the letter series too). `.text img`
in `style.css` puts the problem on a white plate (`.cube` shows the small
cube at half again its size), `.options--pictures` lays the tiles out —
six across for a matrix, four for the cubes, wrapping on a phone — and
`.text .series` sets a letter series on a line of its own. The ICAR draws
the problem and its lettered candidates as one figure; the pieces are cut
out of it by `assets/icar/source/cut.py`, which finds the table rules and
the gaps rather than taking pixel positions by hand, so a figure replaced
in `source/` is recut by running it.

**Figures.** Most questionnaires get a spider chart (`CHARTS`). The MINT gets
the inside of a body instead (`renderSoma`, `drawSoma`, in
`js/figures/soma.js`): one drawing and three readings beside it, and no title
over them. The drawing is a real slice of brain (`assets/mint/brain.png`, see
the `assets/` row) with the insula glowing on it, nerves out of its brainstem
into the lungs, the heart, the stomach and the gut, and those organs drawn as
themselves — no outline of a body round them, the organs being enough to read
as one. Each dimension does one thing to it, a **reach along its own scale**
(the sea's rule, so the drawing and the bar under it cannot disagree):

| | |
|---|---|
| **Bodily Clarity** | the glow over each insula, from a small faint spot to a large bright bloom |
| **Bodily Sensitivity** | the nerves: how many there are (8 to 90, `NERVES`), how far into their organs they reach and how finely they branch at the end, shaded green where they leave the brainstem to red where they reach the body, with signals running up a few of them |
| **Bodily Awareness** | how vivid the organs are, from grey shapes to full colour with a glow round them |

The readings are **HTML, in a column of their own** (`.soma__readings`, the
drawing taking the left half of the card), top to bottom in the order their
parts of the drawing are: the dimension's name, the standing ("Lower than 88%
of people", the number in its part's colours), **the crowd that standing is
read against** (`crowd`, `.soma__crowd`: a column for each half point of the
scale as tall as the share of the norming sample there, out of the norm's
`distribution`, shaded in its part's colours as far as the person reaches —
the column they are in shaded part of the way — and dim beyond, so **the
shaded part of the crowd is the share the words give**, with the person a gold
line and no average drawn, the crowd's own shape saying where most people are;
the BAIT's crowd cards are its model), the
interpretation, and the same `voteButtons` every prediction gets, filing to the
same `BodilyAwareness`, `BodilySensitivity` and `BodilyClarity`. A norm with
no distribution would be drawn as one column the width of the scale, which is
a bar. **What the part of the drawing stands for is on the crowd, on hover or
focus** (the shared tooltip; `READINGS` holds the words), not written out,
since the interpretation is what the reading is for. A dashed lead joins each reading to its part of the drawing
(`.soma__leads`); the readings' heights are the interpretations' and nothing
fixed, so the leads are **measured once both columns are laid out**, from
layout offsets rather than the screen (a panel growing out of its badge is
scaled), and measured again by a `ResizeObserver` whenever the stage changes
size. Below 640px the readings stand under the drawing and the leads go. The
signals are a dash moved along each nerve by the stylesheet (`soma__signal`,
`pathLength` 100) rather than SMIL, so that a sealed card holds them like every
other loop; under reduced motion they are hidden, since a frozen dash would be
stuck at the brainstem. Everything scattered is placed from one seeded
generator and every gradient and filter is addressed off a counter (`drawn`),
the sea's two rules. Locked, the drawing alone, from `teaseValue`, blurred by
the ordinary `.result__chart svg` rule; the showcase takes the drawing alone
too, and the badge the brain (`BADGE`, drawn `still`).

**The climb.** The PHQ-4 and the HiTOP-BR read as one section rather than
two — "The Last Year" — and as a picture rather than rows (`renderClimb`,
`drawClimb`, in `js/figures/climb.js`): a figure in profile at the foot of a
hill, on the sea's pattern, with four things about the year drawn into the
scene. `CLIMB_OF` names the two questionnaires it stands in for;
`renderResults` renders it once, in place of whichever of them comes first in
`RUN`, and skips the other where it would otherwise fall — the one place in
`results.js` two questionnaires share a section. Their items and scoring are
untouched; only what is drawn from their names changes. Each channel does one
legible thing to the scene and nothing else, so the same hill is bent by four
numbers and never jumps:

| | |
|---|---|
| **Emotional Intensity** | how steep the hill is: a logistic ramp (`surface`) from a long gentle rise to a cliff face with a plateau above. The summit is always in frame, with no path up to it and no grass along the ridge, which would be furniture over the one line the eye follows |
| **Solitude** | who is on the hill with you (`company`): three other walkers close by at the sociable end, fewer as the year was spent more alone, then none. The count steps at thresholds, since a walker cannot be two-thirds drawn, and **only the count moves**: the walkers stand in the same places whatever the score, since how far off a figure is reads poorly on a flat picture (until October 2026 they also drew off up the slope) |
| **Bodily Complaints** | the pack on your back (`walker`): from a day bag to a heavy load, with the figure leaning into it |
| **Mood** | the weather (`sky`): the PHQ-4's *last two weeks*, not the year — more cloud, lower and greyer, and the sun going out, as the fortnight has weighed more. It is the one channel on a different clock, which is the point of having it there: the fortnight sits on the same picture as the year |

**Three of the four are standings, not reaches.** The sea drives its scene
from a reach along each scale, which works because the primals are spread
across theirs. The HiTOP-BR spectra pile up at their floor, so a reach would
draw nearly everybody the same gentle hill; the three year channels are
therefore the percentile against the development-sample norms (`standing`),
which are real — though **nothing on screen says so**: a note spelling out
which channel is a standing and which a share of its own scale would be
apparatus. The weather is neither: it is the PHQ-4 total as a share of
the way to the top of its own bands (`MOOD_FULL`, 9, the foot of "severe"), so
a total of nought is a clear sky and nine or more is cloud on the hill, and no
invented norm is read. The PHQ-4's norms in `content/` are therefore read by
nothing; they stay because norms are what put a questionnaire on its level at
all. Those standings go through `percentile()`, the normal curve, which is
coarse for floor-skewed scales — the note at the foot of `data/norms/norms_hitop.R`
asks for empirical quantiles instead. **The engine can now read them**: a norm's
`distribution` (see **Scoring**) is preferred by `percentile()` when present,
and the MINT's carry one. What is **not done** is printing the HiTOP-BR's —
the package's development sample would have to be binned the way
`distribution_of` in `data/norms/common.R` bins the MINT's.

The section is a title ("Challenges"), the person's own hill at the width of
the card (`.climbview__stage`), then one line saying what it was drawn from
("This is how we think your last year might have felt. This hill is drawn from
four dimensions that emerged through your answers" — the year and not the
person, since the HiTOP-BR asks about the last twelve months and an unusual
year is not who somebody is), then the four channels as a bar chart
under *that* (`bars`, `.climbview__bars`: a column apiece filled from the foot
to the value the scene is drawn from, named underneath, and explained in the
shared tooltip on hover or focus — the explanation lives there rather than on
the page, so the chart is four bars and four names. **Neither the tooltip nor
the column's `aria-label` carries the number**: three of the four are percentiles against
other people, and the ethics application's 5.9.1 says the symptom feedback shows
no score, percentile or ranking, so keep it that way. Hovering or focusing a
column also lifts its track, brightens its fill and runs a band of light up it
once, `climb-sheen`, which is on the fill's `::after` and moved by `translate`
rather than `transform`, since the fill is parked on the last frame of
`climb-fill`), then the two ends under a line of their own
("Other people climb other hills": `EASY`, a gentle morning in company, "Low
scores on the four dimensions", and `HARD`, a cliff in cloud climbed alone
with a heavy pack, "High scores on the four dimensions"), and one vote ("Does
this match how the last year felt?") filed under `CLIMB_KEY`, which is `Year`.
Locked, the title and the scene alone,
drawn from `teaseReach`, blurred like every teased figure. Like the sea, every
scattered thing is placed from one seeded generator (`seeded`, fed from the
four values), every gradient is addressed by an id off a counter (`count`),
and the one loop — the clouds drifting (`climb__cloud`) — is held at its first
frame under a seal. The framing does the ethical work: a steep hill is a hard
year, which happens to people, the figure is always upright and walking, and
the two ends make the picture one of a range rather than a judgement. Unusual
Experiences, Impulsivity and Dominance are deliberately not in it; nor are
sleep and self-rated health, though both are still asked and saved.

**The mandala.** `js/figures/mandala.js` is **a prototype on disk with no tag,
not a figure** (October 2026): a reward for finishing the whole run, beside
the whole-run web — one picture a pure function of the person's own scores,
unique to them, meant to be kept and shared. A mandala, since Jung is the
landing page's creed and had his patients paint them as pictures of the Self:
rings out from the centre, each borrowing the motif of a level's figure (the
wheel's petals, the body's nerves, the sea's waves), the symmetry order from
the leading cognitive style, the palette from the temperament, the HEXACO as
texture (Curiosity how many levels deep the self-similar detail goes), and a
Julia set at the centre, its parameter on the main cardioid's boundary so that
every one is connected and branched. Only the shareable set may drive it —
the PROFILE dimensions, the wheel, the styles, the temperament; never
politics, the kinks or the spectra — neither end of any axis may be the ugly
one, and standings rather than reaches, since percentiles spread people
evenly. Drawn from the first level on, a ring arriving as each level is
minted, it would be the reason to keep going. The header of the file holds
the whole brainstorm (what was weighed and set aside, the Mandelbrot region
among them, and why), the mapping as prototyped, what six fake people showed,
what to change next and what wiring it in would take: a `makeMandala(shared)`
factory, a place in `renderProfile`, the `?card=` link and `drawCard`
extended — the first figure drawn from several levels at once, so
`renderResults` is not where it goes. To look at it, give the file a tag
after `draw.js` for the length of the look and call
`drawMandala(document.body, mandalaSample(11))` in the console. Also noted
under **General Profile Improvement** in `README.md`.

`faces.js` — Mood, Stress and Health as a row of faces — is on disk, with no tag in `index.html`, and its header says
what wiring would bring it back.

**The archetype.** The BAIT closes its level as neither rows nor rings but as
one figure (`renderArchetype`): a robot, "Based on your answers, you are…", and
**which of three archetypes** the answers are nearest. The three come from a
cluster analysis of the pooled BAIT samples rather than from a shape drawn on
the facets: the partitions are not crisp, but they say which *combinations*
occur — at k = 2 one evaluative axis (realistic, hard to spot and likeable,
against the reverse of all three), and at k = 3 a group carved out of the
attitude end (worry 1.21 SD low, enthusiasm high, capability beliefs merely
average), leaving one that holds AI output realistic, hard to spot *and*
dangerous. **Believing AI capable and being alarmed by it are not two ends of
one thing**, which is why the figure is not quadrants on enthusiasm and
apprehension.

`aiArchetype` places somebody by nearest-centroid on the z scores of all
three dimensions, each read against its own norm, so the same `normOf`
plumbing that serves the mood faces serves this. `ARCHETYPE_OF` names the
questionnaire it stands in for, `ARCHETYPE_ON` the dimensions somebody is
placed on, and `ARCHETYPES` (in `results.js`, beside `MOOD_NORM`) is the three
themselves — name, share, `at` (the centroid, in SD units per dimension), and
reading. The centroids are that reported description read into SD units, only
the worry figure being exact, and the *shares* are invented placeholders
exactly as the norms are, flagged as such. `feedback.AIArchetype` is
where the agree/disagree is filed. The BAIT's three dimensions earn no rows — the
archetype is the whole of the section — and take no axes on the whole-run
profile web or card either: the archetype is how they are read back, and the
web carries only what a level names. Locked, the figure keeps its
shape: a stand-in name, a 00% share, all blurred, and no live buttons.

**The sea.** The PI-18 is not three lengths on a web: it is a place
(`drawSea`, `SEA = "pi18"`). Primals are beliefs about the world rather than
about the person, and every other figure in `results.js` draws a person — a
body, faces, a robot, a wheel of selves — so what reads as new is a figure that
draws the world. The run is already a descent, so the world it draws is the
bottom of it: black water, a torch in the viewer's own hand pointed into the
distance, and whatever falls inside the round disc it throws (`TORCH_X`,
`TORCH_Y`, `TORCH_RX`, `TORCH_RY`). Everything outside the disc is what you cannot see,
which is most of it. Each dimension takes a channel of the one scene, and the
three are chosen to be read independently rather than to add up:

| | |
|---|---|
| **Safe** | what is down there with you. At the safe end the creatures are round, blunt, wide-eyed and smiling; every step towards danger bends the same creature — stretches it lean, cuts the mouth back into a jaw and puts teeth in it, forks the tail, stands spines up where the round fin was, narrows the eye to a pale slit and opens smaller ones behind it, trails feelers off the underside — until it is less a fish than something out of the deep. Safe does nothing else to the scene: the whole of the channel is the one creature |
| **Enticing** | how much colour is in any of it — the creatures, the rock, the coral. At the dull end the same scene is grey stone and grey fish. It is the one channel that still has something to say when there is nothing alive in the picture, which is why the rock and the coral carry it too |
| **Alive** | how much is living in the beam at all, from an empty floor to water thick with it |

Nothing switches over at a threshold: the same creature is bent by one number
(`creature`), so a scene never jumps from friendly to frightening between one
answer and the next.

**The scene is drawn three times over** (`renderSea`, in `js/figures/sea.js`):
the two on the outside are the floor and the ceiling of all three scales
(`FLOOR`, `CEILING`)
and the one in the middle, larger, is the person's own. It is the comparison
the whole instrument is about — the same abyss, two people seeing different
places — and it does the work a percentile bar cannot, which is why the extremes
are drawn rather than described. `FLOOR` holds Alive a little above its
floor on purpose: at nothing the panel is an empty room, and the whole of what
Safe does to a creature would then be shown to nobody but the people whose own
world is already a frightening one. Locked, only the middle panel is drawn, from
`teaseValue`, blurred like every other teased figure.

**It is the whole of the section**, the way the MINT's body is: a title over
the picture ("This is how you see the world", `.seaview__head`, and nothing
else above the scene), the person's own abyss at the width of the card, a
sentence saying it was drawn from three dimensions worked out from the answers
(`.seaview__note`), and under that what the picture is made of — a key per
channel saying both what the dimension is and what it does to the scene
(`LINES`, each lit in a colour of the legend's own, which is no colour of
anything in the water), with **a bar under the name filled to the reach** the
scene is drawn from (`.seaview__bar`, the same `reach` number, so the bar
and the picture can never disagree) — then the two ends under a line of their
own ("Other people see other worlds"), and one question ("Do you agree with
this metaphor?"). Each piece arrives a beat after the one above it (`rise`,
staggered). There are no percentile rows and no interpretations here at all:
the bars are reaches along each scale, not standings against other people, and
a figure with a plainer restatement of itself underneath would be two answers
to one question, of which the picture is the better. So the three dimensions carry
norms that nothing on this level reads — the norms are still what puts the
section on the level (`dimensionsOf` is what decides that) and still what the
whole-run web draws them from, which is why they stay written in `content/`.

Because there are no rows there is **one vote rather than three**: the picture
is the prediction the section makes, so it takes a single agree/disagree
("Does this picture match how the world feels to you?") filed under `SEA_KEY`, which is `World`.
`feedbackKeys()` names it directly, the way it names the archetype's and the
wheel's, rather than deriving it from the dimensions.

Safe, Enticing and Alive **stay on the whole-run profile web** even so, which
is the one place the derived rule in `onProfile` wants reading twice: a
questionnaire read back as one figure is normally kept off it (the BAIT, the
twelve archetypes), but those two name no dimension anywhere the person can see
it, and the sea names all three under their own names in the lines under the
picture. Three normed axes are not crowding, and the web is where somebody sees
where they stand on them.

Three things worth knowing before editing it. Every scattered thing in it is
placed from one seeded generator (`seeded`, fed from the three scores), so the
same answers draw the same sea however often the panel is reopened — a
`Math.random()` in there would reshuffle the fish on every render. Every
gradient and filter is addressed by an id off a counter (`count`), since
three scenes share a page and a repeated id would have the second one painted
with the first one's water. And a channel is a **reach along its own scale**,
not a percentile: the same distinction the mood faces draw between `happy` and
the standing written beside it, and for the same reason. The water moves, a
little — creatures sway on the spot (`sea__drift`, a wrapper, since a CSS
transform on the creature would replace the attribute transform placing it),
motes drift, the torch breathes, coral leans — each to a beat and phase the
script writes in from the seeded generator, and these are one of the **five places a
results card loops** (the others are the ring beating out of the point on **Where you stand**, the MINT's signals and glow, the volcano's steam, melt and scenery, and the glint running along the Hyborian hero's rubies): `.result--sealed` holds them at their first frame until
the level opens, which is fine, since a still sea is what a sealed card should
show. The sway is a few pixels about the place the answers put a creature and
changes nothing the picture says.

**The wheel.** The twelve archetypes close their own level as neither rows nor
rings but a wheel (`renderWheel`, `drawWheel`): each takes a petal of the
circle, filled out from the middle as far along its own scale as the answers
put it, in its own colour, with whichever came out longest picked out in gold
and named underneath — the whole shape is the reading, and the longest petal is
the story loudest in you. `WHEEL_OF` names the questionnaire it stands in for,
`WHEEL` the twelve themselves (dimension, colour, reading) and `HELD`
those of them the run actually holds, the way the faces check `known()`. The
colours are a twelve-hue circle and live in `results.js`
for the same reason the MINT's organ colours do: they are how the figure is
drawn, not anything that was asked.

**This is the one section drawn without norms**, and the only place
`dimensionsIn` is used rather than `dimensionsOf` — there is no population mean
for "Warrior" that would mean anything, so the twelve are placed against one
another instead of against other people, which is also why they are a wheel and
not rows: a row wants a percentile, and there is none to give. Three-item scales
tie often, so `leading()` returns *all* of the archetypes tied for the top
rather than picking one, and past `WHEEL_MOST` of them the wheel is called an
even one instead of crowning anybody. Hovering a slice or its name says what that archetype is (`short` on each of `WHEEL`, third person, so it
claims nothing about the person), for the eleven the reading under the wheel does not cover; it gives no score.
The slice is an invisible wedge (`.wheel__hit`) over the petal, so the petal is lit by a class and not `:hover`. The twelve take no axes on the whole-run
profile web or card: the wheel is how they are read back, and twelve more axes
on the web would only repeat it and crowd out everything else there.

**The compass.** The ICAR-16 closes its level as neither rows nor a total
but a compass (`renderReasoning`, `drawCompass`, in `js/figures/reasoning.js`):
four arms out of one centre — Verbal north, Logical east, Visual south,
Spatial west — each in the colour its items were asked in, **each as long as
that style's problems came easily relative to the other three**: the arms are shares of
the person's own best (`shares`), so the longest always reaches the rim and
the figure shows a shape and not a size. The longest is picked out in gold and
named underneath ("Your cognitive style is predominantly:", one lead line whatever the shape), every style tied for the
top is named (`leading`, the wheel's rule), the one furthest behind is named
in a quieter line when there is exactly one and it is not also at the top
(`trailing`, "Your least used style is"), and four styles level with each other are named as
four with a sentence saying no one stands out. One vote ("Do you agree with this?") filed under
`REASONING_KEY`, which is **`Reasoning`**, though the level is called **How
You Think** on screen, which asks the question the level answers instead of
naming a category (not "Logic": one of the four arms is already called
Logical, and three of the four subtests are not logic in anybody's everyday
sense). Hovering an arm
says what the kind is, never how many were right. `REASONING_OF` names the
questionnaire; `ARMS` the four, with what leading with each tends to mean and
the `short` phrase `shortOf` hands out; `ready()` is every kind answered. It
goes through `dimensionsIn` like the wheel, and it is deliberately more
reticent than the wheel: no count on hover, no scale of its own, because a
total is what a reasoning test is usually wanted for and this level does not
give one. **The four carry invented norms** — not for this section, which
reads none of them, but so that the whole-run web can draw an average person
right round its rim (see **The profile**). There is no row and no percentile
here.

**The web does read them back as a standing, and the wording is what makes
that all right.** `summarise` says "Verbal: thinking in words — you use it
less than 97% of people do" where every other axis says "lower than 97% of
people". The four are named and framed throughout as **styles rather than
abilities** — Verbal, Logical, Visual, Spatial, never intelligence and never
a total — so being a less verbal thinker than most is a description and not
a worse result, which a bare percentile against a bare name could be taken
for. The words carry that, so they are load-bearing: **if the dimensions are
ever renamed towards ability, this sentence has to be looked at again.**
Locked, a stand-in name and the figure from `teaseValue`, blurred, no
buttons.

**Mind and heart.** The Mind & Heart level (`regulation`)
closes on one figure for its three questionnaires (`renderHeads`, in
`js/figures/heads.js`; `HEADS_OF = ["control", "ers", "cerq"]`, rendered where
the first of them falls in `RUN` and skipped where the other two would, on the
climb's pattern — `HEADS_FIRST` in `results.js`, `headed()` the check that
every channel is answered): **two halves, each a system and what gets in the
way of it**, drawn as a small glyph and two bars. Each channel is the *mean of
the reaches* of the dimensions it is made of (`CHANNELS`, `channel()`) — the
mean of reaches rather than the reach of a mean, so scales of different lengths
weigh the same — and `carries` is which of a half's two is the system rather
than the interference on it (the solid bar; the other is the same hue held
back):

| | |
|---|---|
| **Restraint** | the mind carries: Self-Control. Named for the level's own second word, and honest to the two BSCS items, which ask about resisting temptation and impulse |
| **Distractibility** | and this gets in its way: the mean of Mind Wandering, Absent-Mindedness and Inattention. The trait rather than the episode, which is what items asking *how often, over the past six months* measure |
| **Sensitivity** | the heart carries: the mean of the ERS's three, Emotional Sensitivity, Arousal and Persistence |
| **Brooding** | and this gets in its way: the mean of Rumination, Catastrophising, Self-Blame and Other-Blame, the four the CERQ literature calls maladaptive, though nothing on screen says so |

**An interference channel is named for the interference, never for its
absence** — Distractibility and Brooding rather than Concentration and Coping.
The bar is filled to how much of the
thing there is, so a name meaning the opposite would put a long bar under
"Concentration" for somebody whose mind wanders most; "Coping" is also the
CERQ's own on-screen name for all nine of its strategies, of which this
channel is four. **Sensitivity is a knowing overlap**:
it is also the name of one of the three ERS facets inside it, and sits near
the MINT's Bodily Sensitivity on level 2 — the very collision
`block_regulation.js` prefixes the ERS facets with "Emotional" to avoid. It
costs nothing in the engine, a channel being neither a dimension nor a
feedback key, and Reactivity is the one-word swap if it ever reads wrongly.

The five adaptive CERQ strategies are read by nothing here, on purpose: the
level records sixteen dimensions and shows four things made of eleven, and the
note under the chart says so. **A dashed line stands over the middle of each
half's bars** (`.headsview__rows::after`, labelled once), and it is the
midpoint the reading is read off: each half is one of four sentences from which
side of it the two bars fall (`readingOf`, the temperament's rule at a reach of
0.5), so the words and the numbers they came from are on one screen. `SAID`
holds the four sentences a half, written so a person may land in any of them,
and **unnamed**: a name for the *quadrant* a sentence comes out of reads as a
verdict, so there is none. The section is a title
("Your mind and your heart", `.headsview__head`, and `openSection`'s own name
for the section is "Mind & Heart", the level's), the chart at the width of the card,
then **two cards side by side** (`.headsview__pair`, on the old theories'
pattern), each edged and voting in its own half's colour: which half, the
sentence, its own vote — "Does this match how you focus?" filed under
`MIND_KEY`, which is `Mind`, and "Does this match your emotional life?" under
`HEART_KEY`, which is `Heart` — and then one line: "A busy head is not a
broken one, and none of this is a diagnosis." **A channel says what it means
and never where it came from**: neither the tooltip on a bar nor the note
under the chart names the scales averaged into it, since which items a number
came out of is the instrument's business and not the participant's, and a figure that
shows its own workings reads as a receipt rather than as a reading. The
tooltip does not repeat the percentage either, that being on the row an inch
away; **the `aria-label` still carries both**, since a reader handed an
explicit label never reaches the text inside the row. Locked, the title and
the chart from `teaseValue`, blurred, no cards.

**The chart is HTML and only the two glyphs are drawn**, which is why this
figure builds its own stage instead of taking `figureHolder` from `shared`, and
why `.result--locked .headsview__chart` exists in the stylesheet beside the
rule that blurs every other figure's `svg`. A name and a number inside an SVG
scaled to the width of the card is twice the size on a desktop that it is on a
phone, and no font size serves both — the sea's legend and the climb's bars put
their words in HTML for the same reason. The glyphs are fixed in size and say
nothing the bars do not: a glyph that also carried a value would be one more
thing to decode, and they are the whole of the theme's flavouring. Each is drawn in
its own half's colour — **except the bulb's glass and filament, which are
`BULB`**, a warm yellow, since a bulb whose glass is the same cool blue as its
cap does not read as a bulb at all; the cap keeps the blue, so the emblem still
answers to its bars, and `--glow` (the light behind a glyph, `.headsview__glyph`
in the stylesheet) follows the glass rather than the half. The yellow is warmer
than the gold everything earned is written in and sits on no bar, so it cannot
be read as a channel picked out.

The file and its functions are called heads, though the figure draws none.
It is bars and not a drawing because four numbers bending one
drawing is a picture nobody can take a number back out of, and there are no
pictures of the two ends either, since a labelled bar needs no calibration
alongside it.

**Where you stand.** The Opinions level (`opinions`) closes on one figure for
its two scored questionnaires (`renderStance`, in `js/figures/stance.js`;
`STANCE_OF = ["cmq", "views"]`, rendered where the first of them falls in `RUN` and
skipped where the other would, the heads' pattern
— `STANCE_FIRST` in `results.js`, `ready()` the check that every dimension is
answered). Its title is "What do you stand for?" — a question under the
level's name, as the volcano's is, and about values rather than a place, since
the spectra under the plane are values. Two parts, a vote each. **The plane** is the political compass
redrawn on axes named for what they are about: Sharing to Markets across (the
BSA-derived left-right scale, turned so that sharing is on the left where the
convention puts it) and Freedom to Order up (the BSA-derived
libertarian-authoritarian scale). Four quadrants glowing out of their own
corners in colours of the app's palette and no party's, the quadrant the
person is in lit, a graticule, the average person as a dashed ring with a
thread from it to the person, and the person as a point of gold with a ring
beating out of it (`stance__pulse`, the second loop a card carries). The four
poles are HTML round the drawing (`.stance__map`, a grid that puts the side
poles under the plane on a phone); only the four corner tags are SVG text.
**The corner tags are mottos, not names**: "protect & provide" (order and sharing), "reward &
rules" (order and markets), "fair & free" (freedom and sharing), "choose &
compete" (freedom and markets) — what that corner puts first, two alliterating
words either side of an ampersand, in about eighteen characters, which is what
fits. The Order pole reads "rules and
respect for them", and the readings "keeping the rules" and "want the rules
firmly kept": "tradition" is kept out of all three as the more loaded word.
**No quadrant carries the name of an ideology** and nothing says left, right,
liberal or authoritarian: a name over a region is a verdict on whoever lands
in it. One sentence reads the point back (`readingOf`, from which side of the
middle each axis falls, a band of `BETWEEN` either side counting as between),
then "Does this match where you stand?" filed under `STANCE_KEY`, `Stance`.
**The spectra**, under "Other views" and nothing else, are the other
eight dimensions as a line each between two words — Trust to Suspicion (the
CMQ), Equal chances to Equal outcomes, Preserve to Enhance, Nurture to
Nature, Growth to Planet, People first to Animals too and Purpose to Beauty
(the custom scales), and Just words to Words wound (adapted from the
WCHS) — with the person marked in gold, the average ticked and what each end
means under the line; the tooltip says what the line is about and nothing
about the items (the heads' rule). "Do these match what you believe?" is filed
under `BELIEFS_KEY`, `Beliefs`. **Every position is a reach along its own
scale, never a standing** — nothing here says "higher than 70% of people", the
norms being placeholders — and the average person is drawn from those norms
all the same, as every figure's is. The self-placement is read by nothing,
and nothing on screen says so. The badge is a crop of the plane round the point, kept inside the
plane (`youAt`, clamped in `renderBadge`). Locked: the title, the plane and
the spectra from `teaseValue`, blurred, no votes. **The plane is in the
landing page's showcase**: `.stance__map`, the
plane and its four poles, each pole its one word, the gloss under it hidden
by `intro.css`, which also re-lays the grid to fill the frame.

**Two old theories.** The FIPI's section on level 1 is two readings older
than any questionnaire, side by side, and nothing else (`renderOldTheories`,
`OLD_THEORIES_OF = "fipi"`; like the MINT it takes no rows, and its section is
`.result--bare` — no card round the two cards). Two sentences introduce the
pair (`.theories__intro`): where the test starts, what the two predict, and
that finishing it is how to see whether either holds. Each card is a
heading naming what is being read — "Your star sign is", "Your temperament
is" — a figure, the name it comes out as, then "It predicts that you are…"
(`.theory__predicts`) over a few keywords and the ordinary agree/disagree
(`"Star Sign"`, `"Temperament"`). The heading says what the card *is* and the
line under the name says what it *predicts*, so what was read and what is
claimed off it are told apart on sight; a card with no words to give — a sign
that could be one of two — skips the predicts line with them. The **star sign** is read from the birth month and the day, against
that month's cusp (`starSign`, from `BirthMonth` and `BirthDay` through
`engine.answer`; the twelve cusp days are `CUSPS` in `theories.js`, since a
figure reaches nothing in `content/`), so it comes from the birthday and
from nothing the person said about themselves. `SIGNS` is the twelve in cusp
order from the sign January opens in (month *m*'s first part is `SIGNS[m-1]`,
its second `SIGNS[m % 12]`), each with the words astrology gives it and, in
`expects`, that stereotype written on the FIPI's five dimensions, so a later
level can check the stars against what was measured; **nothing reads `expects`
yet**. The **temperament** is Galen's four humours on the two axes Eysenck laid
them over — extraversion across, stability up — which are exactly the two FIPI
dimensions with norms (`TEMPERAMENT_ON`): each standing is the same percentile
a row reads, the side of the average it falls on names the quadrant
(`temperamentOf`: outgoing and steady is Sanguine, outgoing and reactive
Choleric, reserved and steady Phlegmatic, reserved and reactive Melancholic),
and `drawQuadrant` draws the plane with the person as a point in it.

**The plane is Thurneysser's woodcut of the four humours** (*Quinta Essentia*,
1574), and it can be,
because the woodcut's own cross already puts the four where Eysenck's axes do —
phlegmatic top left, sanguine top right, melancholic bottom left, choleric
bottom right — with its own names for them in its corners and the zodiac round
its edge, which is the star card's theory on the same page.

**Both of level 1's pictures are drawn twice over, the print and the night**.
The print is what shows: the picture as it was printed, dark
ink on a paper that browns towards its edge (`paperIn`, a gradient), which
says the two theories are old before a word is read. The night is the same
picture inverted, its lines in colour on the dark, and **shows only through
the part hovered, focused or tapped**, as a lantern held over the page: one
quarter of the plane (`quadrant__quarter--hovered`, each quarter carrying its
own dark), one sign's stretch of the sky (the night group clipped to that
stretch, `sky__night--on`) — never the whole figure turning over, which would
be the same picture twice rather than a thing to look into.
What marks the person is drawn over both, in **rubric red** (`--rubric`, the
red old printers kept for what mattered most on a page), so it reads on the
paper and the dark alike. Both figures take the whole width of their card.

The picture (`assets/theories/woodcut.jpg`) is white ink on black and is drawn
as a **mask**, twice: on the print, one rect of dark ink, with the person's
quarter washed in the colour of its humour underneath as a print was coloured
by hand (`quadrant__wash`); in the night, a rect per quarter painted in its
humour's colour (blood, yellow bile, black bile, phlegm — `colour` on each of
`TEMPERAMENTS`, red, amber, violet, teal), so one picture takes four colours,
the person's quarter lit with a glow round its lines and the others held back,
and the quarter hovered brought up (`quadrant__quarter--hovered`, set by the
hover itself). `CROSS` is where the woodcut's cross falls, as shares
across and down, and it is **not the middle of the picture** (the upper
quarters are shallower), so `placeOn` maps each half of an axis onto its own
stretch: the average person falls on the cross, either extreme just inside the
frame. `CROSS` is printed by `cut.py`, and a re-cut picture wants it copied
back. The mask is found by id, off a counter (`drawn`), since the showcase, the
results and a badge can each hold a plane. The person is a **red pin** with a
cream collar and a thin dark line round that (`quadrant__you`,
`quadrant__ring`), a red ring beating out of it (`quadrant__pulse`, the
opinions plane's), and **a red line from it to a plain red dot on the cross**
(`quadrant__link`, `quadrant__mean`), where the average person is — how far
the pin is from the middle is the reading. Gold would go into the choleric's
amber, and a dark seal is heavy on the print.

**The two cards share their rows** (`grid-template-rows: subgrid` on each
`.theory`, six rows a card), so the figure row is as tall as the plane and the
two names, the two "It predicts" lines, the two lists and the two votes each
sit on one line across, the sky centred in the row the plane makes tall.
Stacked on a phone, each card is its own grid again.

**The star sign is drawn on Dürer's map of the northern sky** (1515), which sets the twelve
figures of the zodiac round the ecliptic — "cum duodecim imaginibus zodiaci",
as its title has it (`drawSky`). It is a mask like the woodcut — dark ink on
the paper, and in the night the section's colour on the dark, fading out
towards the rim either way — and **turned so the person's sign stands at the
top** (the middle of the two, where the day was not given), with **its stretch
of the zodiac drawn round in red** (`areaOf`, `sky__area`: from halfway to the
figure before it to halfway to the one after, across the band the figures
stand in, so a stretch is as wide as its figure has room for) and the glyph in
a red wax seal at the pole. In the night the figure is lit gold as well, with a
soft spot of light (`SKY_SPOT`). **Where each figure stands is
`sky` on each of `SIGNS`, in degrees clockwise from the top of the cut
picture, read off by eye against a drawn scale and checked against the
figures**: Dürer's twelve straight lines are the thirty-
degree signs of the ecliptic, but he drew the constellations where they stood,
well off those lines, so some of his sectors hold two figures and some none,
and nothing in the picture places a figure but the figure. `SKY_RING` is the
ecliptic's radius as a share of the disc's, printed by `cut.py`. Everything is
clipped to the disc, since a figure on the ring reaches past it. Locked, the
sky turns once in three minutes (`sky--turning`) with nothing marked and no
seal, and is not blurred, for the plane's reason. The level's badge on the shelf is
the sign's woodcut, read off `data-sign` on the sky (written only where one
sign is certain), or its two glyphs off `data-glyph`.

**Hovering, focusing or tapping a sign's stretch of the sky shows its sign**
(the stretch, `areaOf`, is what is hovered, not the figure alone) out of
the German woodcut (`signOf`), with a line on where the signs came from — the
Babylonian astronomers who split the Sun's path into twelve, some 2,500 years
ago — and what they called that one (`babylon` on each of `SIGNS`: the Hired
Man for Aries, the Furrow for Virgo, Pabilsag for Sagittarius). **It says
nothing about whether astrology works, and should not**: the vote under the
card is the Barnum probe, and a line beside it saying the stars were tested
and failed would answer the question it is asking. The faces' note can say
physiognomy was debunked because physiognomy is not what the temperament's
vote is about.

**Hovering or focusing a quarter shows a face** (`faceOf`, in the shared
tooltip, which takes a piece built to go in it as well as words):
the head Lavater engraved for that temperament, his Latin name for it, and a
line saying that physiognomists of the 1700s thought each temperament showed in
the face and that the idea has since been debunked. It is the one thing on the level that was taken for science in its day and is
known to be false. The tooltip stands under what it is about when there is no
room above, which a face often wants, and is kept inside the window. A face
and a sign are one kind of card, `.lore` (a picture, perhaps a name, a
"Did you know?"; `.lore__art--oval` for a head), since `.face` is the Mood &
Health faces' and still in `results.css`. The two
votes side by side are the Barnum probe: one reading was written from the
answers, one from a birthday, and agreeing with the second as readily as the
first is the effect caught in the act. Votes go through `pickButtons`, the
general pick that `voteButtons` is built on. Without the day ("I'd
rather not say", value 99) the star card names the two signs it could be and predicts
nothing. Locked, the names under both figures are stand-ins, blurred like
everything earned — but **the sky is drawn with nothing lit (it turns), and
the plane itself is drawn without a point and
without a lit quarter, and is not blurred**: the light goes round the four
quarters in turn instead (`quadrant--turning`, clockwise from the top left, two
seconds a quarter), so the preview asks which one it will be rather than
answering with a stand-in, and the woodcut is left in focus as the hook, there
being nothing earned on it to give away. The landing page's showcase is the
same locked plane.

**As the taste of the next level** — which level 1 only ever is when a link
has started the run somewhere else (`?start=`) — the section is not the pair
but the plane alone, under one line of its own in the serif: "Find out what the
physicians of ancient Greece would have said about your temperament: are you
phlegmatic, sanguine, choleric or melancholic?" (`renderOldTheories(locked,
teaser)`, `.theories--teaser`; `renderResults` carries `teaser` through for
this and nothing else). That the stars have a reading is no news to anybody,
and four temperaments are; it is the one teaser that is not the locked panel
with its rows taken out. Where there
is no birthday to read a sign from, the level's badge on the shelf is a crop
of the plane round the point (`badgeCrop`, which keeps the square inside the
woodcut).
The keywords live in `results.js` beside `ARCHETYPES`, for the same reason
those do: they are how a figure is read back, not anything that was asked.
None of it is a norm, and none of it goes near the whole-run web.

**Locked levels.** Every level button opens, finished or not. An unfinished one
renders through the same `renderResults(into, level, locked)` path with
`locked` true: all of the level's dimensions are listed rather than only the
scored ones, the chart is drawn from `teaseValue()` — a fixed figure hashed from
the dimension's name, meaning nothing — and everything earned is blurred by
`.blank`. Teased points carry no tooltip and locked sections take no pointer
events, so no fabricated number is ever readable. Keep it that way, and keep the
preview faithful: it should show exactly what finishing the level will show.

**The MINT's three formats.** `formatMint` is drawn in `content/block_mint.js`
when the page loads — `sequential7`, `symmetric7` or `slider`, a third each — and
the MINT's `type` and `format` read it, which is the whole of the mechanism: the
symmetric run carries `labels`, seven strings written on the circles over the
values behind them, and the slider run is `type: "slider"` over the same 0 to 6
(`step` 0.01) written `reading: false`, which puts no number on the line, over
the thumb or under the pointer (`slider--mute`) — the two anchors are the whole
of the scale. The values behind all three are the same 0 to 6, so scoring, the
reversed items, the norms, the charts and a shared card link are the same
whichever it was; only the slider's answers are not whole numbers. `said()`
records the label, so the file holds "-3" where that is what was on screen and
3.47 where the slider was left there, and `container()` saves `formatMint`
beside it to say which scale that was. **Outside a browser it draws nothing and
is `sequential7`**, `shuffle()`'s rule, so the codebook and the deck describe
one fixed scale; `overview.qmd` reads the MINT back through the run's
`format_mint` rather than through the codebook's options for that reason.

**The way in.** The intro screen is four things stacked, **a window each**
(`min-height: 100svh`, contents centred), so scrolling moves from one to the
next rather than showing two at once: a full-window `.hero` carrying the title
(and, inside the iris behind it, a wheel — `.hero__web`,
the archetypes' wheel in twelve shades of violet, with made-up lengths, all but
gone into the dark and falling into a black hole at the middle, its petals dealt out one after another clockwise
from twelve o'clock as the name surfaces, like cards (`deal`, each petal's
place in the order written on it as `--i`), there to say the
test *charts* something; the iris round it is violet all the way out, since a
cyan stop in its gradient drew a teal ring round the wheel; the preview card in `assets/preview/` draws the same
wheel, still),
the `.creed` (the Jung line, the first thing the scroll uncovers), the `.why` making the case for answering any of this — with, beside it, a
taste of the far end (`.why__show`: the figures the levels close on — the
whole-run web, the body, the temperament plane standing in for the sea, the
opinions plane with its poles, the wheel and the compass — one at a time in
one frame, cross-fading every `SHOWCASE_BEAT`, under one static caption,
"Examples of feedback"; `renderShowcase` in
`results.js` draws them from the same `teaseValue` a locked level uses, so
none is anybody's result, and `showcase()` in `app.js` cycles them while the
intro is up; they are shown in focus, without the standings and readings,
since a figure with nothing earned in it has nothing to hide) — and the
`.gate` holding the consent form. It is the only screen laid out full width —
`showScreen()` writes the current screen to `body[data-screen]`, which drops
`#app`'s max-width and hides the banner and sidebar while the title has the page.
Scrolling sets `--gone` on the hero (`sinkHero`), and everything in it fades,
lifts and blurs by that fraction. Reaching the end of the form turns the button
into "Start the test".

Pressing it carries on *down*: `body.sinking` opens another 72vh of water below
the form and the page smooth-scrolls into it while `gaze()` — the Nietzsche
line, cut short by any click or key — closes over the top. Nothing ever scrolls
back up in view; the jump to the top happens under the opaque quote, which is
why every such jump goes through `jump()` and not `window.scrollTo`, whose
smooth default would be seen. The first item goes up *behind* the quote while it
is still opaque and comes in on `.screen--arriving`, so the quote dissolves into
a question surfacing rather than ending on one already there. `timeOnset` is
re-stamped once the fade is off it.

`.screen--arriving` is then **left on the element**, and only `showScreen()`
takes it off. Removing it where it was added would swap the animation back to
the `rise` of `.screen--active`, and a changed animation-name is a new
animation: the item would fade itself in a second time, a beat after it had
arrived. Anything that takes a class carrying an animation off a live element
wants checking for the same thing.

**Results sections.** Each questionnaire's reading is a `.result` card:
`openSection()` writes its name across the top with a dot in the colour its
figure is drawn in (and writes that colour onto the card as `--chart`, so
anything in it without a colour of its own reads in it — the climb takes Emotional Intensity's, the archetype the BAIT's, the wheel falls back to gold), then
the figure, then a `.row` a dimension: `rowHead()` puts the dimension's name and
where it stands ("Higher than **84%** of people", a tag in its colour) on one
line, the percentile bar under it draws itself out from the left, and the
prediction and its Agree / Disagree — two halves of one pill — follow (`rows`,
which draws the locked and the open version of a row from one function). Rows
are parted by hairlines rather than air. A locked level's `.taste` note
carries a meter of how far through the level is.

**What the level was worth.** Under everything a level opened, and under a
line of its own, one question that is about the test rather than about the
person: "How did you like this part of the test?", answered on five
stars (`starRating` in `results.js`, `.rating` in `results.css`). It is drawn
at the end of `renderResults` and so arrives in the results panel as well as
on the level screen, but **never on a locked one** — there is nothing yet to
think of — and so never in a teaser or on a fork card either, both of which
render through the locked path. It is **not a `.result`**: a card would count
towards `markLone` and name every section on a one-section level. It is sealed
and opened with the way on rather than with the sections (`sealSections`,
`unfoot` in `openSections`), since it asks about what has just been read.
Hovering lights the run of stars up to the pointer without standing for
anything, and pressing the star already given takes the rating back the way a
vote unvotes. **Giving one is the only thing on the page a spray comes out of
that was not earned**: the run of stars swells a beat apart (`star-pop`, the
delay written on each as `--beat`) and the one pressed throws the same gold
`burst` a results section opens with — taking a rating back throws nothing,
since nothing has been given. The pop class is taken off again on
`animationend`, or its last frame would hold the star against the lift it
gets on hover, which is the general trap noted below. Nothing asks for it, nothing is held shut by it, and no score,
norm or level opening goes near it. It is filed under the level screen's own
key, `Level_<N>` (see **The level screen is an item**), because it is a
reading of that screen rather than of any one questionnaire on it — so the
same key carries the screen's item in `items[]` and its stars in `ratings`.

**Finishing a level.** `completeLevel()` never simply prints the results. It
renders them, seals them (`sealSections`), and calls `curtain()`: water breaks
across the middle of the window carrying "Level N complete" — a band, not the
whole screen, so the level screen is swapped in behind it as it crosses
(`CURTAIN_COVER`) and is already there when it runs off.
`openSections()` then breaks one results section open at a time — scrolling it into
view, unblurring it, throwing a spray of gold out of the middle of it — and the
way on (`.level__foot`, at the *bottom* of everything the level opened) arrives
last. **Everything animated inside a sealed card is held at its first frame**
(`.result--sealed * { animation-play-state: paused }`), so the bars drawing
themselves, the points popping in and the shape fading up are seen happening
when the seal comes off rather than found already done; in a panel, where
nothing is sealed, they run on render. A click anywhere opens the rest at once; that listener is registered a
beat late on purpose, or the click that waved the paint past would be caught on
its way up and skip what it just uncovered. `prefers-reduced-motion` skips the
staging entirely.

**The level screen is an item.** It is put in front of somebody, it is read,
and it is left by pressing something — which is everything an item is, so it
is saved as one (`levelItems`, made beside `scoredLevels`; `levelItem(n)` is
the lookup). One per scored level, keyed `Level_<N>`, and each stands in
`items[]` **after the last item of the level it showed**, which is where the
person met it — `container()` splices them in on the way out. Its
`timeOnset` is stamped when the results are uncovered (the `open` callback
of `curtain()`, which is also where the item is held from before a fork
moves on) and its `timeResponse` when the way on is pressed, so **the two
are how long that level's results were read**: the one place the file
measures that. Its `response` is the way on that was taken — where the level
ends in a fork, the level chosen and then the ones passed over in the order
the timeline writes them, in the words the cards carried (`takeFork`; level
names, not block lists, since an item's
response is what was read on screen), and otherwise the words on the one
button, `leaveLevel()` writing them the way `passBriefing()` writes a
briefing's, arrow and all ("Continue the test →", "Go beneath the floor →").
A fork an interlude offers after it instead is that interlude's onward
briefing's answer, and the level screen before it has the one button.
All three are null until the level is reached, so the shape never changes,
and an unscored level has no screen and no item. **Reopening a level's
results afterwards goes through its panel and is not counted** — the onset
is stamped once, on the screen, and never re-stamped. Nothing here goes near
`qualityControl`, which counts the items of `questions` alone (`askedIn`),
and a screen carries no `dimension`, so no scoring can see it. Its key is
also what the stars given to that level's results are filed under (`ratings`,
see **What the level was worth**), since they are a reading of the screen and
not of anything on it.

**The taste of the next level.** The way on carries, above its button, a
blurred preview of the level it leads to (`renderTeaser`, into `#level-next`):
"Next" large, "Brain-Body Axis" small under it (the name without its number, "Next" having said where it falls), and the figures that
level will open — the same locked rendering a stop's panel shows, drawn from
`teaseValue`, with the `.rows`, the `.taste` note and the panel's "Locked"
badge taken out afterwards — and with them whatever words a figure sets round
itself (`NOT_TEASED` in `results.js`: the compass's and the wheel's lead line
and blurred reading, the "You / The average person" legends, the opinions
plane's poles, the plane then taking their width, and its blurred spectra),
so a card is its name, its figure and its badge — and in their place one badge over the middle of
each figure saying how long the level takes ("8 minutes to unlock"; see
below), which reads as less of a climb than the count of answers it stands for
("37 more answers to unlock", shown only for a level with no `minutes`). A blurred figure is the hook; ten blurred rows under it
only look like a page that failed to load, so a questionnaire with no figure of
its own would be an empty card and is dropped (none is; the check stays for the next
one written rows-only). It
lives in `.level__foot` and not in `#level-results` on purpose: nothing seals
it, sprays it open or counts it as won — it arrives with the button, as part of
the way on. `completeLevel` finds the next *scored* level, so the last of them
is followed by nothing here and the holder is hidden. Everything that keeps a
locked panel honest keeps this honest too: no tooltip on a teased point, no
pointer events in the body, the count where a number would be.

**How long a level takes, on the way to it.** The badge over a teaser's
figures, under "Next" and on a fork card alike, reads "8 minutes to
unlock" — the number alone, no "about", since nobody reads a duration on a
badge as a promise (`aboutMinutes` in `app.js`, handed to `renderTeaser` as `about`), in
place of the count of answers still to go — a duration is less daunting than
forty questions, and the badge is what is read at the moment of choosing
whether to carry on. The
number is **`minutes` on the level in `content/timeline.js`, written by
hand from the pilot runs** and not worked out from the items: the third of
the way up the finished runs' times in `data/collected/overview.qmd`,
rounded — a little under the median, on purpose, since the figure is there
to get a level started. It is rewritten when there is more data, and a level
with no `minutes` falls back to the count of answers. It belongs to what is asked, not to the
place, so `swapLevels` crosses it over with the name.

**The same number is on a level's link preview** ("5 minutes", in
the row of tags on each card in `assets/preview/` that an entry page under
`start/` unfurls with) and it is true there, since `?start=` walks that level
first and its results open as soon as it is done. The cards read it out of the
timeline as they are photographed (`assets/preview/minutes.js`, a
`data-minutes="<level key>"` on the words), so a card made again after the
timings are rewritten is right; **the entry page's `og:description` says it
too, by hand**, since a crawler runs no script. **So a changed `minutes` on a
level with an entry page is three steps**: `make.py` for that card, the
`?v=` raised on its `og:image`, and the number in its description. The root
card names no duration: the whole run is close to an hour.

**The countdown.** Under the item, across from "← Previous", the last few
answers of a scored level are counted down ("4 more answers to unlock this
level", then "Last answer to unlock this level", in gold; `renderCountdown`,
`#countdown`) — from `COUNTDOWN` (6) answers left, or a third of the level if
that is fewer. Only near the end: counted from the start, a long level would
say how far there is still to go. It names nothing that is in the results,
so it can lean on no answer, and it counts what `levelProgress` counts, so a
branch opening can put it up by one.

**The drawn order.** A run of levels wrapped in `shuffle()` in the timeline is
asked in an order drawn once, when `content/timeline.js` is read, and nothing
about it is ever offered or chosen — the fork's rearrangement made *for*
somebody rather than *by* them. Currently that is both forks — the six after
the core, below, and first the three levels after
General: Brain-Body Axis, AI Attitudes and Mood & Health, so the MINT,
the BAIT and the HiTOP-BR are met second, third and fourth. They are the
mandatory core of the study the app is being run for (see
`ethics/mint_followup/`), and a fixed set wants counterbalancing, or one
instrument is always met fresh and another always met tired.

**The three are a fork as well** (`fork: 2`), and the draw
is still wanted under it. Which levels a choice offers is drawn when it is
offered (see **The fork**), but which of them is marked "Recommended next" is
the one written first, so without the draw the level written first would be
recommended to everybody it was offered to, and most people take what is
recommended. Drawn and then forked, which level is recommended falls
differently for every person, and the person does the rest. Taking the
`shuffle()` away leaves a fork that always recommends the same level.

**The six after the core are drawn too** (Character to Where You Stand, under
their `fork: 3`), for a reason of the analysis rather than of counterbalancing.
Written in a fixed order, the first of them would be recommended every time it
was offered and the last never, so how much a level pulls on its card could
not be told apart from how much the "Recommended next" mark does — which is
what the **Choices** section of `data/collected/overview.qmd` is for. Drawn,
every level is recommended to some people and not to others, and the fork's
`choice` on each level (see **Saved data**) says which it was. What was drawn
is not itself saved; the recommendation and the cards offered, which are what
it and the draw at each choice decide, are.

**It is the same `shuffle()` that puts two blocks of a level in a random
order**, one list up, which is why a timeline ends `.flat()` and why nothing on
a level says which run it belongs to: what is drawn and what is chosen is
visible in the shape of the list. **`app.js` has no part in it** — by the time
the engine reads the timeline the levels are already in an order, and a drawn run
is indistinguishable from a written one. That is the whole of why it is done
here rather than there: which levels are counterbalanced is a property of the
study a run is asking, and the engine has no business knowing about it.

**`shuffle()` draws nothing outside a browser.** `data/synthetic/codebook.js`
reads this file too, and `docs/build_slides.py` reads the deck's Content table
through it — both describe *what is asked* rather than one draw of it, and a
level number that changed every time the table was built would change the
published table under the link the ethics application points at. The written
order is the representative of all of them.

**The fork.** Levels written `fork: n` in the timeline are the one place the
run's order is the participant's, and **`n` is how many are offered at each
choice**. On `mint` there are two forks (on `all` one, of three, over everything after General), and they cover **everything after General**:
the core, levels 2 to 4, is `fork: 2` (over a drawn order, see **The drawn
order**), and the rest, levels 5 to 10, is `fork: 3`, over a drawn order too. Level 1 is not their
business — the test has to open somewhere. Where the seabed falls is not a
property of any level (see **Beneath the floor**), so which of the six are met
in the rock is partly the person's own doing.

**A fork is a run of levels written one after another with the same `n`.**
Two runs side by side with different numbers are two forks, each put in order
among itself and never across the other, which is how the core is finished
before any of the rest is offered — the two are told apart by nothing but the
number changing between them. The runs are read off the timeline as written
rather than off `PLAN`, so a battery that drops the level between two runs of
one width does not merge them. `n` is a whole number of 2 or more, and
anything else throws — `fork: true` included. A run of one level throws too.

**The places a fork's levels take are its slots.** `FORKS` (top of `app.js`,
one entry a fork, and a fork a battery leaves fewer than two levels of is
dropped) holds for each its `width`, the `n`; `slots`, the level numbers
carrying it; `at`, the index of the slot the coming choice fills; and
`offer`, the slots that choice offers once they are drawn. `forkAfter(level)`
gives back the fork whose next slot is the level after this one, while more
than one is left to fill it with, and `offeredBy(fork)` the slots its coming
choice is between. **They are drawn afresh for every choice** (October 2026;
before, a choice offered the next `width` slots in order, so the levels passed
over were offered again at every choice until taken): `width` of them at
random out of every slot still to fill — the one being filled and all after
it — or all of them when fewer are left, off `chance()` through `shuffle()`.
The ones passed over go back among the rest and may or may not come up again.
The draw is made once a choice and kept on the fork (and in the kept run, see
**Carrying on**), so a briefing returned to or a reload on the level screen
offers the same levels, and a reload cannot be used to draw again; `takeFork`
lets it go. So on the core the first choice is between two of the three, the
second between the two left, and the last level is what is left; on the rest,
four choices of three fall at the ends of levels 4 to 7, one of two at the end
of level 8, the tenth place is filled by whatever is left, and levels 3, 9 and
10 are left by the ordinary way on. A fork is never offered twice for one
place: going back into a level and finishing it again gets the teaser. **The
slots need not be next to each other** — the forks happen to be contiguous,
but the machinery does not require it, and `swapLevels` is written as a swap
of two places rather than a shuffling of one run so that it never has to. **A
swap is enough however many are offered**: the level taken and the one
standing in the slot change places, so every level not yet taken is still in a
slot after it, which is what the next choice is drawn from.

On finishing the level before a slot — or, where an interlude opens the slot,
on reaching its `onward` briefing (see **The interim**) — the way on is not one teaser and a
button but "What next?", a line asking which part of yourself to test next,
and **cards side by side, what stands in the slots offered** (`renderFork`,
`.level__paths`, `.level__path`; as many across as there are, written onto
the row as `--paths`; **how many fit across is the row's own width, not the
window's** — a container query on `.level__room`, the wrapper round each row,
since the gauge and the shelf take the sides of a wide window and move to
the foot and the top of a narrow one, so a 740px window gives the row more
room than a 900px one — two stacked under 440px of row and three or more,
`.level__paths--many`, under 640px, so that a card keeps about 200px for
its figure, and never two over one) — never a menu of everything left, but a
fresh draw out of it each time, so a level passed over may come back at the
next choice or not until later, and one never drawn is what fills the last
place — each the
teaser of one level, `renderTeaser` handed the level's *name* as its large
word, since the level's number is not yet decided, and how long it takes as
its title line (see **How long a level takes, on the way to it**), its
`.result` stripped of border and background so the card is the one box, and
the figure's own title hidden, the level's name having said it
(`.level__path .robotview__head` and the rest, in `results.css`) — with
a "Go this way →" button under it, the cards one height whatever they hold —
the level's name on one line, sized by the card (`12cqi`, each card a
container) so that the names of a row come out one size and none breaks onto
a second line and pushes its figure out of line; the longest name a card
carries, Where You Stand, fills 93% of it, so **a level renamed to anything
longer wants measuring** (the BAIT's level was renamed AI Attitudes from AI
Expertise & Usage for this, October 2026, and `overview.qmd` reads the old
name through `FORMER_NAMES`) — each
figure shown through a window of fixed height (`.level__path .result__body`,
300px, and 190px with the figure drawn smaller once the cards are stacked,
so that three of them stay one choice rather than two screens of scrolling),
a short one centred in it and a tall one, the
MINT's body, cropped at its foot so the brain is what the card shows — so
the buttons line up, and **the one of those offered standing first on the timeline marked
"Recommended next"** (first in the drawn order, both forks being drawn) with a thin gold line round it
(`.level__path--recommended`), the default order made visible and nothing
louder; `#level-continue` is hidden while the fork is up, and the spray at the
end of `openSections` comes out of whichever buttons are showing. It is there
so that the descent is not one straight line, and nothing else: the cards are
shown in a random order (`shuffle`, drawn when they are offered, so the
recommended one is not always on the left), and the choice teaches the engine
nothing about the person.

**The choice on the floor level is a fork like any other**, so the way on
there is the cards rather than the "Go beneath the floor →" button, and
nothing on them says the water is about to end. The crossing still fires —
`leaveLevel()` reads `levelShowing === floorLevel`, not what was pressed — so
the person chooses what to do next and *then* the water ends over them, which
is the right way round: the choice is about what, the crossing about where.

Pressing a card is `takeFork`, and **a choice is a swap of two places**
(`swapLevels`). **What is asked moves and where it is asked does not**: `key`, `name`,
`blocks`, `written` and `minutes` cross over between the two `PLAN` entries, while the
level's own number — and so its depth, its colour on the gauge and whether it
is under the seabed — stays with the place, and so do the demographics it opens
on (`opening`, see **The demographics open places**). The move is then made everywhere
the order is held at once: the `PLAN` entries, the two contiguous runs of
`questions` behind those demographics spliced past each other (the later one first, so the earlier index
stays good), `RUN` rebuilt from the new order, and `level` re-stamped on every
item moved (the same objects `authored` and `dimensions` hold, so the scoring,
`onLevel`, the gauge and the results all read the new number off them). Nothing
in either level has been answered when a choice is offered, so no answer moves;
`index` is set to the first shown item of the place now being entered, and the
stops on the gauge take their new names (`labelStop`, which `buildSidebar` also
uses — a stop's number and depth are its place on the line and do not move, its
name is the level behind it and does). Then `leaveLevel()`, the same way out
the one button takes.

**The written order is the default**: what the recommendation follows (each
`PLAN` entry carries `written`, its place on the timeline, for that), what a
battery that leaves one level of a fork falls back on (the fork then dissolves
and that level is asked where it falls), and what a synthetic run walks. The
constraints are checked at the top of `app.js` and throw: a fork is two levels
or more and `n` a whole number of 2 or more, every slot is a scored level, and
every slot that is *chosen for*
wants a scored level before it to be offered from. The last slot is filled by
what is left rather than chosen for, and so is the first when a battery leaves
a fork standing at level 1 — there is nothing before it to be offered from, so
`at` starts at 1 and that place is taken as written. **A choice is saved as the
level screen's own answer** (see **The level screen is an item**, below): it is
one of the two things a way on can be, and is written onto the item of the
level it was made on rather than into a record of its own. **What it was chosen
from is saved beside it, as the `choice` on that level's entry in `levels`** (see
**Saved data**; null on a level whose way on was one button): the levels offered as keys **in the order
their cards stood** (left to right, or top to bottom where they stack — the
shuffle is drawn afresh each time, so this is the only place it survives), the
one marked "Recommended next" and the one taken. It is read once, as the cards
are laid out (`renderFork`), since the swap a choice makes changes what every
place holds, and it is what the pull of the recommendation and of a card's
place is measured from (`overview.qmd`, **Choices**). `levels` and `questionnaires`
say the order that was actually walked (see **Saved data**), which is what a
level number is read against. What was taken replays from that order, but
what each choice offered is drawn and is saved nowhere but in `choice` and
the screen's response.

**A lone section goes unnamed.** `markLone()` runs at the end of
`renderResults` and of `renderTeaser`: when a level (or a teaser) holds one
`.result` only, it gets `.result--lone` and its name across the top is hidden,
since the level screen's `#level-name`, the panel's title and the teaser's
name line have already said what it is. A level of two or more
sections keeps a name on each, because there the names are what tell them
apart. Every level is one section (the PHQ-4 and HiTOP-BR are one
climb, and the `regulation` block's three are one chart), so the rule is idle until a second
one is written.

**The back button.** The browser's own is a thumb going for the previous item,
and leaving the page is at best a reload of it (see **Carrying on**). Once the survey is up,
`trapHistory()` pushes one spare history entry and the `popstate` handler puts
that entry straight back every time the button eats it, so back never leaves the
page: it closes a panel if one is open, and otherwise is `goBack()`, which holds
while a level screen is up or the run has ended and stops at the first item. The
entry is pushed on a click, so Chrome does not treat it as one to skip past —
which is why a run carried on pushes it on the first press or key after the
page comes up (`carryOn`), a reload having no click behind it. Before the survey (the intro, somebody else's card) nothing is pushed and back
is still the way out, since nothing has been answered that leaving would cost.
`pushState` is called with no URL, which keeps `?pid=` and `?test=true` on
it. That and the `replaceState` on leaving a shared card are the *only* two
places the page touches history — a press can then only ever mean one thing, so
keep it that way.

**Screens vs panels.** `showScreen()` swaps the base screens (intro, survey,
level, done) — one at a time, inside `<main id="app">`. The bar's buttons
instead call `openPanel()`, which slides an overlay panel over whatever is
showing; the base screen never changes. Panels live in `#overlay`, outside
`<main>`, which stops short of **both** bars (`inset: var(--banner)
var(--sidebar) 0 var(--shelf)`) so either stays reachable with one open. The
bar links open `.panel--right`. A level
opens `.panel--left`, which is also `.panel--summoned`: it does not slide but
*grows out of the button that opened it* — a stop on the gauge or a badge on
the shelf, whichever was pressed (`openResults(level, from)` keeps it as
`openFrom`) — and is sucked back into it on the
way out, so that button reads as where the level is kept. `markOrigin` is
handed the element rather than the level for exactly that reason. It writes that
button's centre onto the panel as `--from-x` / `--from-y`, the origin its
scaling turns about, measured against the overlay — the panel's own box is
scaled down to nothing while it is shut and is no use for the sum. The level
screen leaves the same way (`suckLevel`, `.screen--sucked`) — into the badge
the level has just minted, where there is one, so what has been read goes onto
the shelf, and otherwise into its stop. Scrim click, the × and
Escape all close — and so does the button that opened it: every way in is also
the way out.

**Banner, gauge and shelf.** The `.banner` across the top carries the name of
the test and nothing else. Under it the page sits between two bars: the
`.sidebar` down the right, which is where the descent is going, and the
`.shelf` down the left, which is what it has turned up (see **The shelf**).
The gauge is dressed as a **dive gauge** (`renderSidebar`): the readout of the
metres, set in the banner's strip over the gauge, which the banner leaves
empty, so the line starts at the banner's lower edge with no gap and nothing
lies over the top of it; the descent running along the sidebar's left edge,
the edge the page sits against, carrying the fill and the stops and nothing
else — the landmarks stand out in the middle of the bar (see **Landmarks**) — then
the Data button at the foot, an inline SVG icon and a word; the Profile
button is at the head of the shelf. The
line is divided **equally between the levels**, so a level's stop sits at the
same point on it however many items it holds: with two levels they are at 50%
and 100%, and what a long level buys is a slower stretch of water rather than
a longer piece of line. `descentShare()` is that mapping — each level
contributes its own share of the band it was given — and `.sidebar__fill` is
drawn from it, with a bead and a sounding ring beating out of it at the end.
A level with nothing scored in it takes no share at all, so the closing item
is asked at the bottom of the abyss rather than below it.

A level's stop (`.sidebar__level`) is a disc of glass lit from within in its
own colour (`--tint`, which `levelColour` reads off one gradient down the
gauge — cyan at the surface through blue and violet to red at the bottom, by
the level's position among the scored levels, `GAUGE_COLOURS`) with the number
on it. **A project with a core marks it** (`?project=mint`): the core is every
level written before the first interlude the run asks (`inCore`, `CORE_BEFORE`
in `app.js`, so a level a `?start=` brought forward is core only if it was
written there, and `all`, with no interlude, has none), its stops run lime to
emerald (`CORE_COLOURS`) and the rest from the gradient's blue on, and each
stop's card says "Required" or "Optional" after its level. The colour is the
whole of it on the gauge — a green glow down the core's stretch of the line was
tried and taken out as more than it needed. The shelf's badges take the same
colours.
The ring round it is the level: `--share` (registered with `@property`, so the
ring *sweeps* rather than jumps) is how much of it is answered, drawn as a
conic band round the stop — in the level's colour while it is the one being
answered (`--current`, the first level not yet finished; a level still ahead
is the same disc dimmed), gold with a tick on the shoulder once it is earned
(`--unlocked`), haloed while its panel is open (`--open`). Hovering or
focusing one opens a **card** into the page (`.sidebar__level-card`, built once
by `buildSidebar`, its note kept by `renderSidebar`): the level's number and
name, the depth it is finished at, a meter of its share, and whether it can be
read yet. A stop opens `openResults(level)` finished or not, and is the only
way into a level that is **not** finished — the shelf carries the finished ones
only. **The fill and the stops are placed by custom properties**,
`--reach` and `--at`, not by an edge: the stylesheet decides which axis they
run along. On a wide screen the gauge is down the right and they read as
heights; **below 760px the whole gauge lies along the foot of the screen**
(`--sidebar` is then its height), the same pieces in the same order turned to
run left to right, the cards opening upwards, the icons alone without their
words. `.overlay` stops short of it either way. Banner, gauge and shelf are all
hidden on the intro and card screens; `--banner`, `--sidebar` and `--shelf` are
their sizes and the body is padded clear of all three (with extra width on the
gauge's side for the stops, which sit out over the line).

**The shelf.** The bar down the left is the gauge's other half: the gauge says
how far down the descent has got, the shelf says what it has turned up. It
opens with nothing on it but the way into the profile at its head, and every
level finished **mints a badge** onto it (`renderShelf`, `mintBadge`) — a
square of the level's own colour with a crop of the figure that level closed
on in it and the level's number in the corner. It is there so that the run
accumulates something to look at rather than only filling rings in, and the
badges are a collection: they arrive one at a time, in level order, and stay.

**The profile at its head is a badge too**: the same rounded
square, with a ring round it that fills clockwise as the whole-run web is
drawn — `--share` on `.shelf__link`, the same registered property a stop on
the gauge sweeps and in the same units (0 to 100), written by `renderShelf`
from `results.profileShare()`, which counts the `PROFILE` dimensions that
have a score. The ring and the note under the web are therefore the same
count and cannot disagree. Full, it closes in gold (`.shelf__link--whole`),
the way a finished level's stop does.

A badge is a **second way into the same panel its stop opens**, and the two
can never disagree, both being read off `levelProgress`. `renderShelf` is
called at the end of `renderSidebar` rather than beside it — a level finished
lights its stop and mints its badge, which is one fact with two faces, and
nothing then has to remember to call both. It **reconciles rather than
rebuilds**: a badge costs a whole results section to draw and throw away, this
runs on every answer, and a badge nobody has touched should not be replaced
under the pointer. A badge is only there while its level is finished — going
back and changing the answer a branch hangs off can take a level's last answer
away with it — and `place()` puts one back in level order rather than on the
end.

Minting is **the only thing on this bar that moves**: the badge is struck
(`mint`, scaling up through a gold flash) and throws the same gold `burst` a
results section opens with, because it arrives for having finished something.
The class comes off on `animationend`, guarded on the event's target, since
the figure inside has animations of its own and the last frame of `mint` would
otherwise hold the badge against the lift it gets on hover.

**Below 760px the shelf turns the way the gauge does**, but along the *top*,
under the banner, with the profile at its left end and the badges collecting
away from it, scrolling sideways behind a fade at the edge: width is scarcer
than height on a phone, and the foot is already the gauge's. `--shelf` is its
height there rather than its width.

**What a badge shows is a crop, not a thumbnail** (`crop` and `renderBadge` in
`results.js`): a square of the figure's *own coordinates*, redrawn into the
badge at full sharpness, so it is a detail of the person's own drawing — the
glow in the brain, the pool the torch throws, the hub of the wheel — rather
than the whole figure shrunk to 74 pixels, which is a smudge. `renderBadge`
follows the same dispatch `renderResults` does, at the size of a token: the
first of the level's questionnaires to name a figure is what the level looks
like, and the drawing is pulled back out of the section that figure builds,
the way `renderShowcase` does it. The crop numbers are written against the
constants the figure file draws with, so **a figure that moves its own
geometry moves its badge off the interesting part** — which reads as a badge full of the words that sit
beside it. The soma's is written too, as `BADGE` in its own file: the brain and
the glow over it, drawn `still`, since signals running up the nerves are
nothing a badge that size can show.

Two levels have no drawing to crop and hand back an **emblem** instead, a
`.shelf__badge-emblem` built in their own file: the BAIT's robot
(`archetype.badge()`), whose section is a line of words under an emoji, and
the `regulation` block's bulb and heart (`heads.badge()`), whose chart is HTML
and whose bars are names and numbers that cannot be read this small. The
heads' emblem is the one badge in the app that says which level it is rather
than what the answers were, and that is the price of a figure that is not a
drawing. Level 1 hands back a picture — **the sign out of the German woodcut**, the
one its stretch of the sky shows on hover (`theories.badge`, `.sky__badge`,
filling the square with the caption along its top cropped off), or the two
glyphs where the sky names two signs it could be — falling back to the
temperament plane where there is no birthday to read a sign from.

**The profile.** `renderProfile(into)` is handed the corner of the page to fill
— the panel during the run, `#profile-done` once there is nothing left to
answer — and finds the web, the legend, the note and the share buttons *by
class* inside it. That is why those hooks are classes (`.profile__web`,
`.profile__note`, `.share__copy`, …) and not ids: the same block is on the page
twice. Finishing the run shows that screen directly; there is no announcement
with a way to the profile on it.

The web does **not** draw every dimension the run scores. It draws `PROFILE`
(in `results.js`, at the head of the card section): the dimensions a level's
results name under their own name — a row under the personality chart, an
organ of the body, a face. Currently that is the six HEXACO domains, the three
MINT dimensions, the PI-18's Safe, Enticing and Alive, and the ICAR-16's four
cognitive styles — sixteen axes. The rule is derived rather than listed
(`onProfile`): a dimension is on the web if it has norms, unless it belongs to a
questionnaire read back as one figure — the BAIT (the archetype), the twelve
archetypes (the wheel), and the PHQ-4 and HiTOP-BR (the climb) are left off;
and a
questionnaire written `profile: false` in `content/` (the FIPI, a two-row
sketch whose ground the HEXACO covers in full; the HiTOP-BR — six symptom
spectra on one polygon with Sociability and Bodily Awareness read as more of
the same kind of thing, which they are not; and the five neutral primals, for
the mirror of that reason — believing the world changeable or hierarchical is
not more or less of anything a person would want, and every other axis there
runs from less of something to more of it; and the three questionnaires of the
`regulation` block, sixteen dimensions that would double the web; and the
questionnaires of the `opinions` block, whose six would crowd it and whose
content — a person's politics — has no place on a card made to be shared) keeps its
dimensions off it however many norms they carry; and a questionnaire written `profile: true` (the
ICAR-16) puts its dimensions on it whether or not they carry norms (they now
carry invented ones, for the reason in **The compass**), which is the one
opt-in, there because the compass names all four under their own names.
**An axis is a standing, not a reach** (`onWeb`, October 2026): a point sits as
far out as the centile its own hover sentence gives (`standFrom`, so the two
agree), and an axis without norms falls back to its reach along its own scale.
Drawn as reaches, every axis being a different scale with a different mean,
the average person came out a lopsided shape that read as part of the
person's; as standings **the average person is a regular polygon** at half the
radius (`AVERAGE_ON_WEB`), and what is irregular is the person's own. A
centile reaches the bottom of its axis far more often than a reach did, so
every share is laid out from a little way off the middle (`outward`,
`WEB_FLOOR`) rather than piling points onto the centre and each other, and
the rings go through the same mapping, so that the two inside the rim are the
terciles an interpretation is picked by. A stand-in (`teaseValue`, the showcase and a locked spider) is
still placed by its reach, the share it was hashed to, since read against a
norm it would sit at one end or the other. This holds for every spider
(`drawSpider`, so the Character level's chart too, which now agrees with the
percentile bars under it) and the card (`drawCard`); the other figures go on
reading reaches. **The average person is drawn where there is a norm and not
where there is none**: closed when every axis has one, and otherwise as dashed
segments between neighbouring axes that have one, leaving a gap rather than a
line that would put an average where nobody has measured one — on the web and
on the card alike.
So a
scale that earns its norms takes an axis in the same breath, and a dimension
folded into a composite (Anxiety, Depression) or shown without norms of its
own (General Health, on a face) or nowhere (Sleep, Life Satisfaction) takes none. The landing page's showcase web and the card are drawn from the same list.

**The card.** `drawCard()` paints a 1200×630 canvas of the whole web — the
`PROFILE` dimensions, on the same geometry the profile panel draws, with the
ones still unanswered left as gaps. It is never previewed in the panel — the
web above the two buttons is the same drawing — so it is only made when
"Download your card" or "Copy share link" is pressed. It carries exactly what
the web does and no more — no archetype, no wheel — and sharing carries all
of that, because pressing the button is a deliberate act. The same values go
into `?card=1&s=Name~value,…`;
`readCardLink()` reads them back, keeping only names it finds in
`PROFILE` and numbers inside that dimension's own scale, so a link is
never a way to get arbitrary text onto the page. A good link shows
`screen-card` — somebody else's result, nothing recorded, with the way into the
test underneath it. The link ends `&source=<the sharer's source>_shared<N>`, so a
run begun from it is filed as one and still says which study started the chain
(see **Where it was handed out**).

**Sharing a level.** Every level whose results are open
carries, under its stars and sealed and opened with them, **Share these
results**: "Copy link" and "Copy as image" (`levelShare` in `results.js`,
`.levelshare` in `results.css`). It is drawn by `renderResults` itself, so it
is on the level screen and in the level's panel at any time afterwards, and
never on anything locked. **The link** is `?card=1&level=<level key>&s=Name~value,…`
with every scored dimension of that level (drawn or not, since a figure may
read one it does not name), plus, for level 1, `m=` the birth month and `d=` a
day on the same side of that month's cusp — the 1st or the 28th, 99 for "rather
not say" (`birthdayStandIn` in `theories.js`) — so the star sign reads back and
**the real birth day never goes into a link**; and `source=<source>_shared<N>`. The level
is named by its `key`, which is the same level for everybody, and
`readLevelLink` finds it again in the visitor's own run, keeping only that
level's dimensions and numbers inside their scales. **The link carries no
battery, so the level it names is brought into the visitor's run** the way a
`?start=` block is (see **Batteries**) — otherwise a level `mint` does not hold
(taken off `all`, see **Batteries**) and out, the sexuality level, would be shared as a link that opens on the landing
page. The visitor's page is
`screen-card` again, the level's own `renderResults` drawn through `visit` (see
**The seam**) with the stars and the share taken out and every vote and every
`*__ask` line hidden (`.visit__results`): the same figures, readings included,
worded to "you", which the note above them explains, and "Take the test
yourself" under them starts the visitor's own run on that level (`?start=`,
see **Where it was handed out**). **The image** is the
level's results as they stand, through `snapshot()` (`js/snapshot.js`), with
the same things left out (`NOT_SHOWN`), on the card's dark with the test's name
and the level's over it and the way to take it under it (`levelPicture`). It
goes on the clipboard as a PNG where the browser allows it and is saved as a
file where it does not. Neither records anything, and neither is in the saved
file. **A new figure wants its picture looked at**: `snapshot` copies computed
styles, which covers nearly everything, and the one thing found that computed
styles do not say (an auto margin on a grid item) needed a special case.

**Comparing with a friend is not built, and waits on the hub.**
It is wanted on every results screen, as a way of recruiting by word of
mouth: somebody's results side by side with a friend's, level by level. Done
with links alone it goes wrong. A link that starts the friend on the level it
was sent from (`?start=`) is a run of its own, so a second link from the same
person for another level is a second run, and one friend answering three
links is three participants in the deposit — which is the wrong n, and
nothing in the files can tell it apart. A link also cannot carry a name
safely (nothing from a link is written on screen), cannot be taken back, and
puts one person's scores in whatever the friend forwards it to. It wants an
account for each of the two, the friend agreeing before anything of theirs is
shown, and one run per person — three things a link cannot do and the hub
(below) is for. Until then the level and card links (above) are the way
results travel, and they stay one-way.

**The account is the lab's, not this test's.** A participant's account lives
on the **Rebel Participant Hub** (`RealityBending/me`, served at
`realitybendinglab.com/me/`, its own notes in its own `AGENTS.md`), of which
this test is the first app. **Everything about accounts that is not this
test's own is written there and not here**: the backend (Firebase,
`reality-bending-lab`, Firestore in London), the database's layout and rules,
claims, the summary the dashboard reads, what has been decided (a platform id
is a label and never a key; email linking for SONA and never Prolific; the
dashboard shows levels and never lets them be picked), the ethics and what is
next. A pilot, asked for by `?account` alone (October 2026).

What this test does with it:

- **`js/account.js` is a copy of the hub's client, edited there and not
  here**: version `0.1.0`, sha256 `4a4a1622…8f1fda70`. Its tag names the app
  (`data-app="abyss"`), which is where the test's documents go on the account.
  Updating it is copying the hub's file over this one and writing the new
  version and hash here.
- **On Start**, with `?account`: signed into anonymously, once a browser
  (`signIn`, handed `source`), and a link that brought a platform's id
  (`?pid=`) claims it (`claim`). A claim come back `"taken"` is warned in the
  console and the run goes on; what to show then is not built.
- **`stow()`** sends the object `keep()` writes as the app's state, with the
  dashboard's summary beside it (`summary()`: the scored levels in the places
  they stand, done or not, core or not, and the run's link), in one request —
  at the end of a level, as a level screen is left and as the tab is hidden,
  never on every `keep()`. **The end of the run** writes the summary
  `finished` and `forgetRun()` drops the state with the browser's copy, so the
  dashboard can still say the run was finished.
- **`fetchKept()`**: a landing page with no run kept in this browser but one
  on the account writes it into the browser and loads again, and it is offered
  like any kept run — `js/resume.js` reads the kept run at load and only then,
  so that is the one way in. Only a run `js/resume.js` will take (of its
  `RESUME_SHAPE` and inside the week), or the page would load again for ever.

Two things this test has to get right. **`keep()` is called on every item
shown and every answer**, two writes an item, several hundred a run, which
would spend the free plan's 20,000 writes a day on a few dozen runs:
`localStorage` goes on taking every one, and the account is written a dozen or
so times a run. And **a run kept on an account outlives deploys** where one
kept for a week in a browser mostly does not, so the `dealt` check that is
harmless now would throw away weeks of somebody's answers: while a study runs
`content/` is frozen, or each run is pinned to the version it began on.

**Carrying on.** A run left partway — the tab closed, the browser quit, the
page reloaded — is kept in the browser's `localStorage` (`abyss:run`) and can
be picked up on the same device, with no server. **A run carried on has to be
the same run**, and four things about one are drawn on every load: the drawn
levels and blocks (`shuffle()` in `content/timeline.js`, at script load, for
every timeline in `BATTERIES`), `formatMint`, the order of each
questionnaire's items and, in a test run, which items are thinned. So every
one of them comes off `chance()` (`js/resume.js`), one mulberry32 generator
seeded once a load, and a run carried on is dealt again from the seed it was
first dealt from. **`Math.random()` must never shape a run** for that reason;
it is left only in the particles. The fork's cards are laid out off `chance()`
too, through `shuffle()`, but after everything the kept run depends on has been
drawn, so a run carried on may lay a fork's cards out another way; the order
they stood in is read as they are laid out and saved with the choice.

What is kept (`keep()` in `app.js`) is small, 30 KB or so: the seed, the link
the page was loaded with, the participant and `timeStart` (so `FILENAME` comes
out the same), the answers as values and the `log` of times, the fork choices
as the swaps they made (`swaps`, replayed by `restore()` onto `PLAN` the way
`swapLevels` made them), each fork's `at` and the choice it has drawn and not
yet had made (`offers`, so a reload offers the same cards), the votes, the stars, the level
screens' items, where the run is (`index`, and a level screen that was up and
not left), and how many levels were finished (`done` of `of`, no longer read: the
landing page's offer says nothing of it). It is written wherever the run is staged (`answer`, `completeLevel`,
`leaveLevel`, `noted`), on every item put on screen and when the tab is hidden;
nothing is kept before Start is pressed, and **the kept copy is let go of when
the run ends** (`advance()`, as the last item is answered) and after a week
untouched (`KEPT_FOR`), since it is somebody's answers on a device other
people may use.

**Two ways back in.** A reload in the same tab carries straight on:
`sessionStorage` marks the tab live (`abyss:live`), and `js/resume.js` resumes
when that mark is set and the address is the one the run began from. A new
tab or a new visit has no mark and is **offered** the run instead, on the
landing page under the name (`#resume`, `offerResume`): "Continue where you
left off" marks the tab and loads the run's own link — a shared card's
included, since the link decided which levels were asked — and "Start
again" lets the kept run go. Pressing Start without choosing begins a new run,
which takes the kept one's place. A page carrying a run on (`carryOn`) skips
the landing page, the consent form (agreed to when the run began) and any
shared card in the link, puts the run back on the item or the level screen it
was left on (the curtain crossing again for a level screen), draws the shelf's
badges already there rather than minting them (`shelved`), and appends the
moment to `timeResumed`. **A reload asks whose run it is**: the screen may be in front of somebody else by
then (a shared computer, a tab left open), so the page is held behind one card
in the middle of a dimmed screen, "Welcome back · You are where you left off", with **Continue where I left off** and **Not
you? Take the test from the start** (`#welcome`, `welcomeBack` in `app.js`,
`.welcome` in `style.css`). Nothing behind it can be answered while it is up
(`welcoming`, which holds the keyboard to its two buttons). Continuing takes it
away and stamps the item's onset afresh, the time spent reading the card being
no reaction to the item. Starting from the start lets the kept run go and loads
the run's link without any shared card in it, so the page comes up as one that
never saw the run; what was answered stays in the deposit as the partial of a
run left, like any closed tab. **It is not asked after "Carry on" on the
landing page**, which is the same question already answered: that button marks
the tab `chosen` rather than `1`, read back as `RESUME_CHOSEN`.

**It is checked before it is trusted.** The same seed deals the same run only
out of the same content, so the kept run carries `dealt` — `formatMint` and
every item key in the order dealt, before any fork moved a level — and a load
that deals anything else (an item added, a block moved, a timeline drawing one
`shuffle()` more, any deploy that changes the draw) drops the kept run, says so
in the console and loads the page again afresh (the `throw` after
`location.reload()` stops the half-built page from doing anything first). A
browser that refuses storage — a private window, blocked site data, a full
quota — takes the test as before, unkept; every read and write is in a `try`.

**In the deposit** a run carried on is one run: `participant` and `timeStart`
come back, so the finished file has the name it always would have had. The
first session was closed with the tab and leaves its partial fifteen minutes
later; the page carrying on opens a second under the same name and **stages
everything already answered into it again** (not the items a test run answered
for itself, which are never staged), so its partial, if the run is left a
second time, is the whole run so far. A finished run supersedes every partial
of its name, and where none finished `preprocess.R` keeps the fullest partial
and drops the rest as earlier copies; `download.py` counts a name once. **What
the committee has been told does not yet say that answers wait in the
browser**: the consent form says answers are recorded as they are given, which
stays true, but not that a copy is kept on the device until the end of the run
or a week.

**Depth.** The run is dressed as a descent: `depth()` turns `descentShare()` —
how far through the scored levels the run is, not how many items have been ticked off —
into metres of the Challenger Deep, shown in the gauge's readout and under the
water that breaks on finishing a level. Finishing a level therefore always
lands on a round share of the deepest water there is — `levelDepth(level)` is
that figure, and `sounding()` writes it the way the gauge does: on the curtain,
in the results panel's subtitle (`#results-sub`, "Reached at…", or "Locked · n of m answered") and on
a stop's hover card. The level screen itself does not carry it — the curtain
has just said it, and the screen is the level's name and what it opened. It is a
reading of progress and nothing else — no answer, score or norm goes near it.

**Landmarks.** What the descent passes on the way down is pinned on the gauge
(`LANDMARKS` in `app.js`, beside `DEEPEST`): the deepest scuba dive, the
midnight zone, sperm whales, the Titanic, the hadal zone, the deepest fish
filmed, Trieste, and under the seabed Hole 504B, the deepest life found in the
crust and the Moho, which is where `BEDROCK` ends the rock anyway. **The pins are
always there; the words are not**: a pin is a small diamond, dim until the bead
has passed it and lit after, and its card (`.sidebar__mark-card`: the depth,
the name, one line) comes out only on hover or focus — and **once on its own,
when it is passed**, for `MARK_SHOWN` (4.8 s, `--news`), popping with the next
item rather than under the water of a level screen (`passing`, read in
`renderQuestion`) and waiting for a crossing's dark to clear (`popMark`). The
deepest of several passed at once is the one that pops, and none pops twice
(`sounded`). They are there to be arrived at between one level's results and
the next, on no schedule anybody can count, and they say nothing about the
person. **A pin is placed by `lineAt(metres)`**, the inverse of `metresReached`
— the water and the rock each laid evenly along the levels they are divided
between — so it sits where the bead will be when the gauge sounds its depth,
and a run with no rock has no rock pins. **Every pin stands in one column in
the middle of the bar, with a dashed lead back to the line** at its depth, so
the line carries only the fill and the stops, a pin is never under a stop,
and nothing moves with the window's height. The element is the lead
(`.sidebar__mark`, from the line to the middle) and only the pin at its end
(`.sidebar__mark-pin`) takes the pointer — which it can only do because the
stops' own layer over the whole gauge, `.sidebar__levels`, lets the pointer
through and only the stops on it take it back. The readout was moved up into the
banner's strip to make room for the top of the column. On a phone the leads
drop from the line to pins under the stops and the cards open upwards.
Nothing about them is saved. The depths and the lines are facts about the
world and want checking if one is added.

**Beneath the floor.** **Where the seabed falls is a share of the levels and
not a flag on any of them**: `WATER_SHARE` in `content/timeline.js` is 2/3, so
the first two thirds of the scored levels are swum down and the rest are cut
through the rock — seven and three in the whole run. A share holds its place
however many levels a battery asks, and, with the forks reaching from level
2 to level 10, it is the only way the break can sit still while what is asked
either side of it moves. **Which level is the floor is the descent's business
and what is asked there is nothing to do with it.** The water levels share the
trench between them and reach its floor together, so level 7 finishes at the
bottom of the Challenger Deep whatever it turned out to hold, and the levels
beneath go on into `BEDROCK` metres of rock (7,000, about the thickness of the
oceanic crust), shared the same way. `waterLevels` and `rockLevels` are the two
halves of `scoredLevels`, `beneath(level)` asks which half a number is in, and
`floorLevel` (the last level in the water, whose way on goes through it) is the
join; `levelDepth` and `metresReached` read them. `sounding()` writes every
depth as metres from the surface, the rock's included ("13,434 m", never
"seabed + 2,400 m"), so the gauge, a stop's card and the curtain count on one
scale and a level further down never carries a smaller number. Four things follow from the one share and
nothing is written twice: the water column behind the page ends in a line of
silt and rock warming towards the mantle at `--floor`, which `app.js` works out
from where the seabed actually falls in this run and writes onto the root —
every stop in that gradient is placed against it with `calc`, the water's as
shares of the way down to it and the rock's as shares of what is left, so the
picture cannot drift from the arithmetic (`body::before`, `style.css`; the
window shows 100/420 of the column at a time and the silt rises into the bottom
of it halfway through the last water level); the
curtain on finishing the floor level says "· the floor" and on finishing a
level beneath says "· in the rock"; the way on from the floor reads "Go
beneath the floor" instead of "Continue the test"; and pressing it goes
through **the crossing** — `gaze()` again, the layer that closes over the way
in, handed `CROSSING` ("The water ends here. / The descent does not.", the
floor's depth for a byline) and dressed `gaze--rock` (no eye, warm dark), so
the first item beneath comes up out of it the way the first item of the run
does. **It carries a sentence under those two lines** (`said`, into
`.gaze__said`): "Everything above this was the surface of
you. What lies under it is what the rest of the descent is for." Without it
the crossing is a beautiful animation between two questions that nobody can
read a meaning off — the point of it is that a threshold was passed and that
what is under it is the part worth staying for, and the two big lines say
where but not what. Only a set of words carrying a `said` shows the line:
the way in is a quotation and explains itself, and the core has nothing left
to promise. A layer with one is held `GAZE_READ` (9.2 s) rather than
`GAZE_HOLD` (6.6 s), a sentence wanting reading rather than glancing at; a
click or a key still cuts either short. `gaze()` writes the words it is handed over the Nietzsche line in the
markup and leaves them; the way in comes first and only once, so nothing
reads them back. The descent *share* — the gauge line, `--descent` — still
gives every scored level the same length, water or rock; only the metres
change.

**The water.** `body::before` is a column of water several windows tall —
sunlit at the top, near black at the bottom of the water, and under that the
floor and the rock (see **Beneath the floor**) — and `--descent` (0 at the surface,
1 at the end of the run) is `background-position` down it, so going on with the
test is going under and each level sits in visibly darker water. Only
`renderDepth` writes it, from the same `descentShare()` the line is drawn from.
The landing screen
is not in the water at all: `body[data-screen="intro"]` (and the card screen)
keeps its dark, and the surface opens *underneath the quote* on
the way in — `gaze()` puts the survey screen up while the quote is still
opaque, so what it clears onto is the top of the column. The level screen dims
the water behind it (`filter: brightness(…)`) so a level's results are read
rather than swum through. Because the top of the column is bright, anything
meant to be read sits on a *dark* translucent surface (`--surface`, `.consent`)
rather than a white film.

**Saved data** is `container()`: `version` first — the app version that wrote
the file, logged in `CHANGELOG.md`, so an export can always be matched back to
the code that produced it — then `participant` and `testMode` — which run
this is and whether it counts — then `battery` — the preset the run asked,
`"default"` where the link named none (see **Batteries**) — then `source` — where the link was handed out
(see **Who is taking it**), `"Unknown"` where it named none — then what the run was answered on,
worked out once at load, a field apiece: `device` — `phone`, `tablet` or
`computer`, read off the user agent, which is itself never saved, being most of
a fingerprint — `touchscreen`, whether the pointer is coarse, `screenLayout`,
`wide` or `narrow` either side of the stylesheet's 760px breakpoint when the
page loaded, `screenLayouts`, every layout the run was seen in, in order, since
a phone turned on its side or a window dragged narrower crosses it mid-run, and
`viewport` and `screen`, each `[width, height]` in CSS pixels (all null in a
synthetic file) — then `levels`, the levels of this run in the order walked, each its `key`, its `name`, its block list (the demographics or an interlude its place opened on first, so that a level's `blocks` differ from run to run) and its `choice` — the fork choice made on its screen, or on the onward briefing of an interlude after it, or null (see **The fork**; absent from files before September 2026) — which is what makes a `timeLevel<N>` or `qualityControl.<key>` below readable on its own — the key being what the file is written under and the name what the person read, so one can always be turned into the other, and `questionnaires`, the questionnaire keys in the order asked (`RUN`; the items' own `order` is theirs) — then `timeStart`, then `timeResumed` — every moment the run was carried on after being left (see **Carrying on**), `[]` for a run taken in one go, absent from files before September 2026 — then a `timeLevel<N>` per level —
when that level was last left with nothing outstanding, stamped in `answer()`
rather than on the level screen, which the last level never shows — `formatMint`,
`qualityControl`, then `items[]`
(`key`, `questionnaire`, `order`, `response`, `timeOnset`, `timeResponse`) —
every item of the run **and every level screen** (`Level_<N>`, see **The level
screen is an item**). **`questionnaire` is the instrument that asked the item**:
without it, asking whether somebody has a complete PI-18 means
knowing which keys belong to it, and the keys do not say — the `singles`
questionnaire alone holds eleven different prefixes and `Demographics_` spans
three, so a prefix is a guess and not a mapping. It is what the flatten walk
already stamped on the item, so nothing is worked out twice. A level screen and
a briefing belong to no questionnaire and carry `null` rather than leaving the
key out, since a field present on some items and absent on others is a shape an
analysis has to guard. Then `feedback` —
**every key of which is always written**, `null` until somebody votes on that
reading and `null` again if they unvote it, so a run that stopped at level 2 and
one that went to the end have the same shape and an analysis never has to guess
which columns to expect. The keys are `feedbackKeys()` in `results.js`, derived
the way `renderResults` decides what to draw, and `makeResults` writes them into
the object app.js hands it — and last `ratings`, the stars each level's results
were given (see **What the level was worth**), written the same way: one per
*scored* level, `null` until somebody rates it and `null` again if they take it
back, so an unrated level and an unreached one read alike. **They are keyed by
the level's `key` — not its number, and not the name on screen**
(`ratings["Character"]`, `ratings["MoodHealth"]`). A number is a place in one
person's run, and the run is drawn and partly chosen, so `Level_5` is Character
for one person and Reasoning for the next — a column of numbered ratings holds a
different level in every row, which is not a column. **And a name is prose.** It
is what the gauge, the level screen and the results panel call the level, it is
written to make the test engaging and is free to be reworded for that, and it
may hold an ampersand, a hyphen or an article — "Mood & Health", "The World" —
none of which a column name can keep. So each level carries a `key` in
`content/timeline.js` beside its `name`, the way a questionnaire and an item do,
and the key is what the file is written under. The set of keys does not move
when a fork swaps two levels, since the key crosses over with the level the way
the name and the blocks do (`swapLevels`). `levelKey` in `app.js` is the one
place that is decided, and it is handed across the seam as `ratingKey` so that
`results.js` asks rather than works it out; a level with no key, or two levels
sharing one, throws at build time, since their ratings would silently merge.
`levels` in the saved file carries both, so a key can always be read back as a
name. The level screen's own item in `items[]` keeps its
`Level_<N>` key, an item key being an item key — `levels` is what joins the two. `response` is
what was read on screen, not the code behind it — `said()` gives back the
option's own text ("Male", not 1), so a saved file is legible without the
codebook. An option with no label of its own (a numbered circle) and a typed
answer are saved as given. Scoring still works off the values in `responses`;
only the file carries the words. Computed scores are deliberately **not** saved
— they are derived at analysis time.
`timeOnset` is re-stamped whenever the item is shown again, including on closing
a panel that covered it, so the gap to `timeResponse` stays a reaction time.

**Where it goes.** To DataPipe (`pipe.jspsych.org`), which files what it is
sent in the repository the experiment ID is bound to — here a Zenodo deposit
(`DATAPIPE`, `DATAPIPE_EXPERIMENT` in `app.js`; experiment `C2mDNSFM3jAJ`,
deposit `zenodo.org/uploads/22882899`). **The same run goes twice over, in two
different ways, and it is the second that counts.** It is one section of
`app.js` and the whole of what talks to the outside world.

**As it is answered**, one record at a time, into a staging database of
DataPipe's own. About fifteen minutes after somebody stops answering, DataPipe
writes what it is holding for them into the deposit as a `.partial.json`.
Nothing here has to notice the leaving — the connection itself is what says
they have gone — so a tab closed halfway down the descent leaves the half that
was answered rather than nothing at all. **That is the whole reason for
streaming**: the run is thirty or forty minutes long.

**At the end**, the whole of `container()` in one piece, exactly as the
download button would save it, so the two can never disagree — and carrying the
session's id, which is what tells DataPipe that the records it has been holding
belong to a run that finished, and are to be dropped rather than filed as a
partial beside the complete one. `saved()` writes the outcome into `#save-note`
on the last screen — sending, saved, or failed — and goes on `result.ok` alone.

**The download is offered only when the send fails.** The run saves itself,
every answer as it is given and the whole file at the end, so there is nothing
for a participant to keep and an unexplained "Download responses (.json)" only
invites the question of why they would want to. The Raw results panel has no
download — nothing has failed there, and the file is on screen to be read — and
the last screen's is written `hidden` and uncovered by `saved("failed")` and by
nothing else, since a send that did not land is the one case where the answers
are still in the page and need a way out of it. `download()` is what that one
button calls. An agree/disagree or a star given on a
level reopened *after* the end is the one thing the sent file can miss; that is
accepted, since a filename is taken once and a second copy would be refused.

**Two kinds of record go into the staging database**, and each says which it is
in a `record` field the finished file has no equivalent of:

| | |
|---|---|
| `frame` | **the saved file with `items` taken out of it** — who is taking it, the order the levels were walked in, the level times, the quality control, the votes and the stars. It is `container()` with one key deleted rather than a second thing built beside it, so a frame cannot drift from what the file would have said. One goes in when the run begins, one at the end of every level (`completeLevel`, the level's answers all in) and one as it is left (`leaveLevel`, with whatever was voted and starred on its results) — and one **a moment after a vote or a star** (`noted`), once the pressing has settled for `NOTED_DELAY` (1.2 s), or at once if the tab is hidden first, since a run can stop *on* a results screen and a vote given there would otherwise go nowhere unless the level was left |
| `item` | **one entry of that file's `items[]`**, found in the file rather than made again beside it, for the same reason. One goes in every time an item is answered (`answer`), a briefing is passed (`passBriefing`) and a level screen is left (`leaveLevel` — a level screen is an item, and is staged like one) |

**Read back, the last frame and the last record under each key are a container
with as much of a run in it as was answered** — sorted by the `order` each item
carries, which is the same `order` the file gives it. That is the whole of the
reassembly rule, and it is why nothing is ever staged in a shape the file does
not already use. Two things about it are worth knowing. An item answered a
second time — gone back to, or a branch closing behind it and taking its answer
with it (`pruneBranches` hands back what it cleared, so an erasure is staged the
way an answer is) — is staged again, so it is the **last** record under a key
that counts, and a branch closed after the fact reads as the null it ends as.
And a staged item is the entry *as it stood when it was answered*, where the
file's own entry is the entry at the end: an item shown again has had its
`timeOnset` re-stamped past its `timeResponse`, so a partial can carry a
reaction time the finished file no longer has.

**A frame that says nothing the last one did not is not staged.** The way on
from a level screen can be pressed more than once while it is animating away,
and the budget is a thousand records a session — not something to spend saying
the same thing twice. Items are *not* deduplicated: the same key answered again
is a new answer, even where it is the same answer.

**The staging is best-effort and can never hold the run up.** A session that
will not start warns in the console and disables itself, every call into it
swallows its own errors, and the file at the end goes whether any of it worked.
**The file at the end waits for the session to have *started* and for nothing
else**, and the close after it is not waited on at all. The session goes to
`saveData` as the `session` itself rather than as its id, and the client waits
on `session.ready()` — startup alone, not the staged writes, which go over a
database connection of their own and have their timers throttled to a crawl
behind a tab that is not in front. **That is why**: the documented
flush-then-read-the-id sequence leaves a run finished in the background sitting
on "Saving your answers…" for the best part of a minute. Nothing about the
staging may cost the file, and nothing can: the only thing between the last
answer and the send is a session handshake that a throttled tab does not slow
down. The flush is `close()`'s own, on its way out.
A session is opened when the **Start** button is pressed rather than when the
page loads — somebody who read the landing page and left is not a participant,
and a session held open for them is one of the five hundred an experiment may
have at once. `FILENAME` is worked out once, at load, and is both the name the
session is opened under and the name the finished file is sent under. It is
**`<when>_<source>_<participant>.json`**: the run's start time
first, so a deposit lists in the order runs began and a name is never taken
twice (DataPipe refuses one it has, and a `?pid=` code can come round twice),
then the source cut down to `[A-Za-z0-9-]` and 40 characters, accents off, so
that one study's files can be picked out of the list by eye, then the code. A
test run is prefixed `test_` in front of all of it, an underscore like the
other gaps in the name, and that prefix is what `data/collected/download.py`
picks test runs out by (it reads `test-` as a test too). The battery is not
in the name — the source is what sorts a deposit by study, and the file
carries `battery`. The failed-send download is saved under the same
name.

**The client is `js/vendor/datapipe-client.js`, and it is the one file on the
page that is not ours.** Streaming is not a request anybody can hand-roll — a
session is a live Firebase Realtime Database connection, and what says a
participant has gone is an `onDisconnect` armed on it — so the library does it,
and the library brings the Firebase SDK with it (185 KB, most of the page's
weight). It is **kept in the repository rather than fetched from unpkg**, which
is what DataPipe's own instructions suggest: an unpinned CDN tag resolves to
whatever is published at the moment each participant loads the page, which is
third-party code changing under a running study, on a page that asks about
psychiatric diagnoses. Vendored, the code a participant runs is the code that
was reviewed, and the page still works with no internet but DataPipe's own.
**It is the one exception to "dependency-free"**, and it is pinned:
`datapipe-client@0.2.0`, from
`https://unpkg.com/datapipe-client@0.2.0/dist/datapipe-client.browser.global.js`,
sha256 `b2af030b…9774310c`. Updating it means fetching a new version by hand and writing
the new version and hash here. It is a classic script and defines one
global, `DataPipe`; its tag goes **first** in `index.html`, above `content/`,
since nothing else on the page reads it at load. **Without it the run still
saves**: `send()` falls back to the documented `POST /api/data/`, which is the
whole of the fallback — a file missing from a deploy should cost the staging,
not the data. What is lost with it is gzip and the background retry the client
does on the way out.

**Two things to know about the sending itself.** The API is the one documented
at `pipe.jspsych.org/docs/api`: `POST /api/data/` takes `experimentID`,
`filename`, `data` and an optional `sessionId`, answers 201 (stored) or 202
(queued, and to be read as success — which is why the code goes on the client's
`ok` rather than on the status), and refuses with 400 and an `error` code
(`EXPERIMENT_NOT_FOUND`, `FILE_EXISTS`, `INVALID_DATA`, `EXPERIMENT_FINALIZED`,
…).
That code is the whole of what says *which* thing went wrong, and it comes back
on the client's `body`, so a refusal is written into the console beside the
status rather than left as a status nobody can act on. **The name of the
experiment field is `experimentID` here and should stay that way**: the client
takes `experiment_id` too (jsPsych's own spelling, and the one its README
uses) and throws if it is handed both with different values, but the
plain `POST` fallback is hand-built against the REST API, which documents the
camelCase name alone — one name in one file is worth more than agreeing with a
README.
And the limits the staging works inside are DataPipe's: 16 KiB a record, 1,000
records a session, 500 sessions at once, 24 hours a session, and 100 files a
Zenodo record — past 80 of them DataPipe zips the older ones into
`datapipe-batch-NNNN.zip` and keeps the five most recent loose, so a partial or
two a run is not a quota problem.

**"Saved" on screen means DataPipe took it, not that Zenodo has it yet.** A 201
is DataPipe accepting the file; the write into the deposit follows, and the two
are not the same moment. A file can take longer to appear than it takes to go
and look, so
**the deposit is what a run is counted from and the screen is not**, and a count
taken too soon is not a count. `data/collected/download.py` is what counts it.
Where a delivery does fail for good, DataPipe's dashboard keeps the queue
(`/api/queuestatus`, and the *Failed uploads* page its documentation describes
at `/docs/data/failures`); nothing in the app can see that, which is why the
gap between what was sent and what is in the deposit is worth watching during a
study rather than at the end of one.

**The deposit's three ages, in order: collect, finalise, publish.** While a
study is running the deposit is an **unpublished draft** — DataPipe makes one
and never publishes it — which means it is already private: only the account
that owns it can see it, and there is no DOI. That is the protection a study
wants, and it is the state the thing is in without anybody doing anything.
**Do not publish it while collection is running.** "Restricted" on Zenodo is an
access level of a *published* record, so restricting means publishing, and a
published record's files are fixed — DataPipe is writing into the draft, and
after publication there is no draft to write into. (That last step is
**inference rather than documentation**: neither Zenodo nor DataPipe spells out
what happens to submissions if the researcher publishes mid-study, which is why
it is worth not finding out during one.) So: collect with it private, then
**finalise** in DataPipe when collection has ended — which merges everything
into one archive and stops submissions for good, cannot be undone, and deletes
the loose files once the archive is verified — and only then publish on Zenodo,
choosing open or restricted access, which is what mints the DOI. Downloading
works in all three ages; the token is wanted for the first two.

**Getting the answers back** is `data/collected/download.py` and then
`preprocess.R`; see that row in the table above. **A saved file holds the words
and not the values** — "Male", not 1 — and that is settled rather than pending:
the words are what is wanted, a file that
reads without a codebook beside it is the point, and turning them back into
numbers is a scoring decision that belongs to the analysis. `preprocess.R`
therefore does not score and should not learn to; an analysis that wants the
values can map them through `data/synthetic/codebook.js`, which already reads
every item and its options the way the app flattens them.

**Levels are the experience, not the data.** A level is how the run is paced and
dressed for the person taking it, and its number is drawn and partly chosen, so
it means nothing across people. What an analysis groups by instead is
`questionnaire`, which every item carries, and `order`, which is where that item
fell for that person. What is filed per level (`QC_<level key>_*`, `Rating_<level
key>`) is filed under the level's key, which is the same level for everybody.

**Ethics, which is not a code question.** A partial file is data from somebody
who did not finish, and closing the tab is one of the ways a person withdraws.
What is kept of them is the author's call and the committee's — the app makes it
possible to keep partial data, not right to. **What the participant is told**:
the consent form says, in its own paragraph and again in the third consent
statement, that answers are recorded as they are given, that stopping partway
leaves what was already answered, and that an anonymous answer cannot be taken
back once given. **The point of no return is the first answer rather than the
last.** `ethics/mint_followup/application_draft.md` says the same — 9.5.3 (how
data are transmitted) and 7.5.2 (what they are told about withdrawing) —
and **the committee has not seen any of it yet**,
which is why 7.5.2 tells them which consent statement changed and why. (What is staged is what the file holds: no answer leaves the page that
would not have left it at the end.)

**Who is taking it.** Every run carries a `participant` code, twelve characters
drawn from an alphabet with no I, L, O, 0 or 1 in it — a code is read off a
screen and typed back. A link may bring its own (`?pid=`), for a prewritten list
or a platform putting its own id on the end: it is somebody else's text, so only
`[A-Za-z0-9_-]` survives it and only 32 of those, and what is left of an empty
or impossible one is a code of our own. It is also the last part of the
file's name (see **Where it goes**).

**Shorthands.** `?s=` is `?source=`, `?st=` is `?start=`, `?p=` is
`?project=` and `?pid=` is `?participant=` (`SHORTHANDS` and `inLink()` at
the top of `app.js`), for links typed by hand or kept short; the long name
wins where a link gives both. **`?battery=` (and its `?b=`) is `?project=` and
`?sub=` is `?participant=`**, which is what the two words were until October
2026, kept so that the pilots' links go on working. **TODO: drop `battery`,
`b` and `sub` at v1.0**, once the ethics application is approved and the real
deployment starts — the three old names in `SHORTHANDS`, and this sentence.
Inside the code and the saved file a project's timeline is still a `battery`
(`BATTERIES`, the file's `battery` field); only the link's word changed.
**`s` is also a shared card's scores** (`?card=1&s=…`), so on a card link it
is never read as the source, which is why the links a card or a level is
shared under write `source=` out in full, and why anything taking a card's
scores off a link goes through `dropCard()`, which leaves an `s` alone off a
card. The entry pages under `start/` read `?st=` too.

**Where it was handed out.** `?source=` says which project, experimenter or
page the link came from, and is written into the file as `source` and into its
name. It is never put on screen, so it may be words — letters of any alphabet,
digits, spaces and a little punctuation (`_.,:;/@()+#&'-`) survive, 200
characters of them — but it is somebody else's text like the code. **One
source changes what is on screen**: `SONA`, which puts the credit link on the
interim's last screen (see **The interim**); nothing else reads it. **A real
deployment always names one**, so a link without it is saved as `"Unknown"`
rather than null: an Unknown in a deposit is a run nobody sent — a test, a link
passed on, somebody guessing the address — and worth a second look. The
links in `README.md` carry `?source=README`, so that a run begun from the
repository's front page says so, and every link a participant shares (the
card, a level) carries `?source=<source>_shared<N>` — the sharer's own source
with `_shared1` after it (`SHARED_SOURCE` in `results.js`, the source reaching it
as `engine.source`), `SONA_shared1`, `README_shared1`, `Unknown_shared1` — so
that a run begun from somebody else's results says so too, and says which
dissemination it came out of. A share of a share counts up rather than adding a
second suffix (`SONA_shared2`), so `N` is how many hands the link passed through,
the name stays short however far it travels, and the original is what is left
of the source with `_shared<N>` taken off. The SONA credit is offered to `SONA` alone,
so a friend of a SONA participant is not offered it; the file's name has the
underscore as a hyphen (`SONA-shared1`), its gaps being underscores. Files
before October 2026 say `shared` alone. The source is read once, when the page loads,
which is why "Take the test yourself" can put the address back to bare
without losing it — off a shared card. Off a shared *level* it reloads the
page instead, keeping `source` and whatever else the link carried but the
scores, with `?start=` naming that level's first block, so that the visitor
meets the level they were sent first: the run's order is settled from the
link at load (`PLAN`) and cannot be rearranged under a page already built.

**Batteries.** A study need not ask the whole run. Which timeline a run walks
is resolved once, at the top of `app.js`, from the link and nothing else, and
the participant is shown nothing about it. `?project=<name>` picks one out of
`BATTERIES` in `content/timeline.js`, **a timeline apiece, each written out in
full** rather than a list of blocks subtracted from one master, so that what
a study asks and in what order is read off its own list at a glance — which
is what a recruitment link should carry, under a version. **A link naming
none, or one that is not there, walks `all`** (`TIMELINE_ALL`): everything,
sexuality included, with no core — General and then every other level in one
drawn fork of three. **`mint`** (`TIMELINE_MINT`) is General, the core as a
drawn fork of two and the six after it as a drawn fork of three — the study
the ethics application is being written for — and is asked only by a link
that says `?project=mint`, **which every recruitment link for that study has
to carry**. The price of two lists is
that a level on both is written twice, so **a `name` or `minutes` rewritten
on one wants rewriting on the other**, and a level's `key` must be the same on
both. **`ASIDE` is asked by no battery at all**: a level kept on a timeline
(`all`'s) for its place, key and name that a run meets only when a link names
it (`?start=hyborian`), which asks a block whatever the battery says.
`data/synthetic/codebook.js` walks `mint` and no other, so the deck's Content
table (which the ethics application points at) and a synthetic run describe
the study's test rather than the default. Files
saved before September 2026 say `"default"`, which was what `mint` is now.
`?only=a,b` asks exactly those of the timeline's blocks and `?skip=a,b`
everything but those, by hand, for testing. Battery first, `only` over it, `skip` off it, and
whatever `start` names back onto it.
`?start=a,b` then reorders what is left: the levels holding
those blocks go first, in the order named, with the named blocks first inside
them. **It moves whole levels and never splits one** — a level carries the key
its ratings and quality control are filed under, so a block pulled out on its
own would be a level with no key — so `?start=icar` opens on How You Think,
and `?start=singles` opens on General with the singles before the rest of it.
**A block it names is asked whatever the battery, `only` or `skip` said** — a
link asking to open on something is asking for it — **and from whichever
timeline holds it**: `?start=sex` under `mint`, which does not hold the level,
takes it off `all` and puts it at the front (`written: -1` on its `PLAN`
entry, being written nowhere on this timeline), and a shared level's link does
the same for the level it names — and
`?only=icar&start=mint` asks both (with the rest of a `HELD_TOGETHER` group,
as ever). The file's `battery` still says `mint` then, and `levels` is what
says the sexuality level was asked. `closing`, which the run ends through, is
the one name it cannot bring and is dropped with a warning, and so is a
demographics block, which is no level's. **A level brought forward is a hook**
and opens on its own questions, the demographics opening the levels after it
(see **The demographics open places**). A level brought forward is taken
out of its fork (`fork: false` on its `PLAN` entry), having been placed by the
link rather than left to the person; what is left of the fork still forks, and
the drawn run keeps its draw among what is left. Everything else then follows
in its usual order, General first: `?start=opinions` walks Where You Stand,
General, the core fork, and the other five three at a time, and `?start=mint` walks Brain-Body Axis, General,
one choice between the other two core levels, and the six. It is recorded nowhere but in
`levels`, which says the order walked. The names
are somebody else's text: only `[A-Za-z0-9_,-]` survives, a name that is no
block on any timeline is dropped with a `console.warn` (and one in `?only=`
that is on another timeline but not this one, too), and an unknown battery
name asks `all`. **Two things are not the link's to decide.**
`closing` is always asked, because the run ends through it: `advance()` ends
the run when the last item has nothing after it, so the last *scored* level's
results are opened from the item after them, and without `closing` they would
never be shown. And the blocks of `HELD_TOGETHER` (in `content/timeline.js`)
come and go as one — `mood` and `hitop`, since the climb is drawn from the
PHQ-4 in one and the HiTOP-BR in the other and `climbed()` never comes true
with half of them. The result is `PLAN`: the timeline with each level's
blocks filtered and any level left empty dropped, and everything in `app.js`
that would read the timeline reads `PLAN` — the flatten walk, `levels`, `levelName`,
`beneath`, the forks — so a level's number is its place in *this* run, numbering stays
contiguous on the gauge, and the trench and the rock are divided between the
levels actually asked (a battery of water levels alone, or of the rock level
alone, divides by nothing — `metresReached` guards both). A battery that
leaves one level of a fork leaves nothing to choose, and that level is
asked where it falls with the ordinary way on. Nothing else
changes by design: `scoredLevels`, `PROFILE`, `feedbackKeys()`, the showcase
and the card all derive from what the run holds, so a smaller run has a
smaller web and a smaller set of feedback keys, which an analysis must expect;
the star card is skipped (`starSign()` returns nothing without the birthday,
and `feedbackKeys` adds `StarSign` only when `demographics1` is in the run,
`STARS_FROM`); the FIPI's opening briefing, which frames the whole run, goes
with the `fipi` block, which is accepted. The saved file carries `battery`.
A shared card link is built from the
origin and path alone, so it never carries a battery and always reads against
the whole run's profile.

**Quality control.** `qualityControl` is one entry per level, **keyed by the
level's `key`** for the reason the ratings are,
saying how the level was answered rather than what it says, and three numbers is
the whole of it: `responseTimeMean` and `responseTimeSD` in milliseconds — sample SD, null
where there is only one time to go on — and `attentionChecksFailed`, counted over
the checks that were answered and **null where none was** — a level not reached, left before its check came up, or carrying no
check at all, since a 0 there reads as a check passed that nobody was set. `took()`
is the one place a reaction time is worked out; an item that was shown again
after being answered has had `timeOnset` re-stamped past its response and is
left out rather than counted as negative. An attention check is any item
carrying `check:` in a block file — the answer it must have — and one left
unanswered has not been failed. Only items actually asked count, so checks
answered for the run by test mode are not among them. Nothing here is shown to
anybody, and no score, norm or interpretation goes near it.

**Every scored level but General, How You Think and Where You Stand carries one check**, shuffled in among the
items of one of its questionnaires — the MINT (level 2), the BAIT (3), the
HiTOP-BR (4), the HEXACO (5), the archetypes (6), the five tertiary primals (7)
and the CERQ (9), as written on the timeline — and each is keyed by the
questionnaire's prefix with `_AttentionCheck` after it — the HiTOP-BR's is
`HITOP_AttentionCheck`, which no two-digit item pattern matches, so
`score_hitopbr()` cannot take it for an item once the columns are renamed. **The answer a check asks for is put away from where
a straightliner lands on that scale**: the HiTOP-BR is skewed to its floor, so
its check asks for "A lot"; the HEXACO's asks for "Strongly disagree", since
somebody agreeing their way down a personality questionnaire would pass one
written for the top; the archetypes' and the CERQ's each name a circle off
either end (2), the CERQ's also off the middle-to-high ground its adaptive
strategies pull towards. The
MINT's asks for the extreme left, which is 0 under either of its two writings
(the labels change, the values do not), and the BAIT's for the extreme right,
as published. The primals' is the one the inventory itself ships with, worded
as Clifton words it — it asks for "slightly disagree", which is off both ends
of the scale and off the agreeing side those items pull towards — and it sits
in the tertiary questionnaire rather than the PI-18, whose validated fixed
order is worth leaving intact. Level 1 has none: the `singles` would be its only host, and
nothing is dealt into the FIPI's run of five. Level 8 has none either: a
right-answer test has no straight line to catch, and a giveaway item would be
one more thing to get right. Level 10 has none: among political statements an
instruction would stand out more than anywhere else and be the likeliest place
for somebody to wonder what was being checked for, and the other measures are
enough.

**Test mode.** `?test=true` (or a bare `?test`; the saved file's field is
`testMode`) walks the run in miniature, so that every chart,
level and reading can be reached quickly: every questionnaire keeps
`TEST_KEPT` (1) item, chosen at random, and `thinRun()` answers the rest at
random and marks them `auto`. `shown()` returns
false for an `auto` item, so everything that walks the run — the sidebar, the
descent, `levelProgress`, the level that unlocks — behaves as though it were not
there, while the scoring behind the results has its answer. Such an item is
saved with its `response` and with **null times**: nothing was put on screen, so
there is no reaction time to it, and the quality-control figures pass over it.
An item waiting on another (`showIf`) is left out of the thinning, so a branch
still opens on the answer that opens it, and `pruneBranches()` leaves `auto`
answers alone. A test run is not data: it says so in the file (`testMode`) and
across the top of the screen (`.banner__test`). Test mode also opens the consent
gate without the form being read (`checkConsent`) — there is nobody there to
consent. **Nothing on the page leads into it**, so that no participant meets
it: the way in is the address alone, which the README writes out in full.

## Conventions

- No semicolons, 4-space indent, ~130 col, double quotes. Match it.
- Comments say *why*, in prose, above the thing. British spelling. Don't add
  comments that restate the code.
- **An item carries no full stop.** What is written on the card is a statement
  or a question, not a sentence of prose: it ends on its own last word, or on
  the question mark or ellipsis it needs. The same goes for the one-line
  `instructions` over it. Prose *inside* an item — a `<small>` gloss of a word,
  a briefing's paragraphs, an interpretation — is punctuated normally, and so
  is the second sentence of the handful of items that carry one.
- **No Oxford comma in the app's own words** — briefings, instructions,
  interpretations, readings, the custom items, the pages of `index.html`: "the
  questions, the code and the look". It is the British house style the notes
  are already written in. **Items lifted verbatim from a published instrument keep
  the publisher's punctuation**, Oxford commas and all — the HEX-ACO-18's "a
  novel, a song, or a painting" and four of the PI-99's tertiary items are the
  exceptions, and are meant to stay exceptions. Comments and these notes are
  not on screen and are not swept.
- **An item may be adapted, and should be when its wording is not good
  enough**. Unclear, idealistic, loaded,
  double-negative or stilted wording is rewritten rather than kept for the
  sake of a published scale — validating the adapted instrument is part of the
  project. What must go with it: a comment beside the item quoting the source
  wording and saying in a line why it changed, a key that keeps the source's
  prefix (so the file still says where it came from), a line at the head of the
  questionnaire saying it is adapted, and the understanding that an adapted
  item is never pooled with the source's data as the same item. The opinions
  level is written this way throughout.
- **Two registers, kept apart on purpose.** What the participant reads —
  section titles, dimension names on a figure or the web, the readings, the
  briefings — is written to make the test engaging, relevant and actionable,
  and may frame a construct more freely than the science would (four ICAR
  subtests read back as "cognitive styles"; a star sign beside a temperament;
  a hill, a sea, a wheel). What the code, the comments, these notes, the
  deck's Content table and the saved file say is the instrument's own
  truth: which scale it is, what it measures, what the keys and norms are.
  A user-facing name is chosen for the participant and documented against
  the real construct where it is defined (the mapping above the items in the
  block file, the bracketed scale in the deck's table), so nobody reading the
  repository is misled by the words on screen, and nobody taking the test is
  bored by the words in the repository.
- Prefer adding to `content/` over adding branches to the scripts. Questionnaire
  behaviour is data-driven; `CHARTS`, `SOMA`, `SEA`, `CLIMB_OF`,
  `ARCHETYPE_OF`, `WHEEL_OF`, `REASONING_OF`, `HEADS_OF`, `STANCE_OF`, `KINKS_OF`, `VOLCANO_OF`, `HYBORIAN_OF` and `BALANCE_OF` are the only places that name a questionnaire,
  and new ones should be rare.
- Anything that reads a score goes in `results.js` — or, if it is one figure's
  own, in that figure's file under `js/figures/` — and anything that walks the
  run in `app.js`. If a change wants both, it probably wants a new member on
  the `engine` object rather than a second copy of the state — unless it reads
  *neither*, in which case it goes in `js/draw.js`, under all of them. A new
  figure is a new file there, a `<script>` tag before `results.js`, a
  `makeX(shared)` call in `makeResults`, and a branch in `renderResults` and
  `feedbackKeys`.
- Keep it dependency-free and buildless. **One dependency is allowed and there
  is one**: `js/vendor/datapipe-client.js`, because a streamed session is a
  live database connection and not a request anybody should hand-roll (see
  **Where it goes**). It is vendored and pinned rather than fetched from a CDN,
  it is loaded by a plain `<script>` tag like everything else, and the run
  saves without it. A second one wants the same three things to be true of it
  before it goes in, and a very good reason besides.
- One folder each for the questions (`content/`), the code (`js/`) and the look
  (`css/`). Nothing else belongs at the root but `index.html`, `assets/`, `start/`
  (entry pages that unfurl with a level's picture, and forward to `index.html`), the
  notes, `literature/` — a git-ignored shelf of reference PDFs behind the
  ideas list in `README.md` — three workbenches, `data/norms/`, scripts that work
  out numbers to paste *into* `content/`, `data/synthetic/`, scripts that
  write model-answered runs *out of* it, and `data/collected/`, which brings
  the real answers back down off Zenodo, and `docs/`, one file *about* it.
  None is reached for by any part of the app, and the app is reached for by
  none of them: the page loads no R and no PDF, and the deck imports nothing
  from the page.
- **Adding, removing or renaming anything in `content/` means running
  `python docs/build_slides.py` in the same breath** — and, if the change adds
  or renames a questionnaire, adding its row to `ROWS` in that script first,
  since it will stop rather than write a table that is missing it. It is the only
  summary of what the test asks that anybody reads without opening the files,
  so a stale one is worse than none: it is what the author, and anybody asking
  what is in the study, will go by, and it is generated so that it cannot
  drift. Its shape is one table: the level, the questionnaire with its
  abbreviation and reference (or "not validated", or "custom items"), the
  dimensions, and how many items — and nothing else: no prose, no notes on how
  a scale is fed back, which is what this file is for.

## Gotchas

- **"Section" is only ever a *results* section** — one block of a finished
  level's results (`sealSections`, `openSections`, `.result` in `results.css`).
  The pause in the middle of a level is a **briefing** (`type: "briefing"`,
  `.briefing`, `renderBriefing`, `passBriefing`), never a section or a
  presentation screen. If you find either word used for one anywhere outside
  `results.js` and the level screen, it is a leftover — but
  note that `role="presentation"` in `index.html` is an ARIA role and nothing to
  do with any of this.
- **"Archetype" means two things, in two different files.** The *AI*
  archetype (`ARCHETYPE_OF`, `renderArchetype`, `ARCHETYPES`) is which of three
  answer profiles the BAIT came nearest, on level 3. The twelve *archetypes*
  (`WHEEL_OF`, `renderWheel`, `WHEEL`) are the Pearson framework asked on level
  6, drawn as a wheel. They share nothing but the word — different questionnaire,
  different figure, different feedback key (`AIArchetype` against
  `Archetype`, and both keys are load-bearing, since the agree/disagree
  collected under them has to keep stacking).
- **Fifteen feedback keys belong to no dimension.** `StarSign` and
  `Temperament` are the level-1 old-theories votes, `AIArchetype` the
  level-3 one, `Year` the level-4 vote on the climb, `World` the vote
  on the sea, `Archetype` the one on the wheel, `Reasoning` the level-8
  vote on the compass, and `Heart` and `Mind` the level-9 votes on the two
  halves of **Mind and heart**, and `Stance` and `Beliefs` the votes on the plane and on
  the spectra of **Where you stand**, and `Kinky` the vote on the
  sexuality level's crowd (**How kinky are you?**, asked only by `all`), and
  `Desire` the vote on its volcano (**How hot is your volcano?**), and `Hero`
  the vote on the Hyborian Age's hero card (reached only by `?start=hyborian`;
  `God`, the vote on its god, is out while the god is not shown), and
  `Sides` the vote on the Light & Dark level's balance (reached only by
  `?start=dark`). All fifteen are load-bearing: the feedback collected under
  them has to keep stacking.
- **A vote is filed under a written key, not under the name on screen.**
  A dimension that is fed back carries a `key` beside its norms in `content/`
  ("Bodily Awareness" → `BodilyAwareness`) and a figure's vote names its own
  (`SEA_KEY`, `ARCHETYPE_KEY` and the rest, which *are* the key rather than
  prose that files to one). `feedbackKey()` in `results.js` reads the written
  key and falls back to `filed()` — the name with spaces and punctuation
  taken out — for a dimension that grows interpretations before it grows a key;
  `pickButtons` is handed a key rather than working one out, so nothing on
  screen is ever the thing a vote is filed by. It is written rather than
  derived for the reason a level's key is: the name beside it is prose and free
  to change, and a column of a study's data is not. **`feedbackKeys()` throws
  when two readings file under one key**, the way `levelKey` does, since two
  dimensions would otherwise share a vote.
  Note that `voteButtons` is handed a dimension by a results row and its own
  key by a figure with no dimension to read against, so `feedbackKey` passes a
  name that is not a dimension of this run straight through.
- **Every demographic item is keyed `Demographics_…`**:
  `Demographics_Age`, `Demographics_BirthMonth`, `Demographics_Gender`,
  `Demographics_Education`, `Demographics_Country`, `Demographics_SocialStatus`
  and the rest, across all three demographics blocks, so a saved file sorts
  them together. The questionnaire keys stay `demographics1`…`3`.
- **`BirthDay` is the day of the month, and it must never be released.** A
  button a day, seven to a row, the question worded from the month and the
  29th to 31st offered only in the months that have them (option `showIf`,
  see **Branching**); "I'd rather not say" is 99. With the month and the age
  beside it the day is most of a date of birth, so **it is kept in the raw
  files only**: before any data are made public it is dropped, or grouped
  into the star sign or the half of the month either side of the cusp, at the
  same stage as a platform's `?pid=` id is removed — the consent sheet (a
  paragraph of its own under "What will happen to the results") and the
  ethics application (5.9.1 and 9.5.3) both say so, and the
  foot of `preprocess.R` notes that `clean/` still holds it.
- **`Catastrophising` and `CERQ_Catastrophizing_N` are spelled differently on
  purpose.** The dimension takes the app's British spelling, which is what the
  person reads; the item keys keep Garnefski's own, which is what a published
  scoring script matches. The same goes for `Perspective` and `RefocusPlanning`,
  whose keys are his shorthand for dimensions named in full. Written up at the
  head of the CERQ in `content/block_regulation.js`; it is a decision, not a
  slip, and reconciling the two would break one side or the other.
- **An item key's middle segment is not always the scored dimension, and
  nothing marks which it is.** `CERQ_SelfBlame_1`, `PI_Safe_1`,
  `Archetype_Idealist_1` and `PHQ4_Anxiety_1` name the dimension the item
  feeds; `MINT_ExAc_1` and `HEXACO_Sincerity` name a *facet* under one
  (Bodily Awareness, Honesty-Humility), `ERS_Sensitivity_1` names it a word
  short of it (Emotional Sensitivity), and `ASRS_1`, `CFQ_10`, `HITOP_01` and
  the ICAR's four name none at all. **That is deliberate and should stay**: a
  key names the finest scale its own instrument defines, which is the thing a
  published key has to match, and the MINT and the HEXACO genuinely want the
  facet in the key. The cost is that `grep("^CERQ_SelfBlame", names(d))` works
  and looks general when it is not, so **key → dimension is not derivable from
  the key**: it lives in `content/`, and `data/synthetic/codebook.js` is what
  reads it out. An analysis that wants to group by dimension goes there.
  **The opinions level is the one place the *first* segment is not the
  instrument either**: every key there starts `Opinion_` so the level can be
  picked out by prefix, and the second segment is the item's *scale*
  (`Opinion_LibAuth_Sentences`, `Opinion_Conspiracy_Hidden`), not the instrument
  it came from, which is said in a comment beside it — see that level's row
  above. `grep("^Opinion_", names(d))` is the whole level; `grep("BSA|CMQ")`
  finds nothing.
- **A number in a key is padded only where a stem can reach ten.** `HITOP_01`
  and `ICAR_VR_04` are padded because their numbers run past nine under one
  stem and would otherwise sort `1, 10, 11, 2`; everything else — the MINT's
  threes, the archetypes' threes, the primals' sevens — never does, so it is
  not. The rule is about sorting and nothing else: a regex splits `_(\d+)$`
  either way. Pad a new instrument's numbers if one of its stems can reach ten,
  and do not go back and pad the ones that cannot.
- **"Block" also means two things.** A *block* is one file of questions in
  `content/`, named in the timeline. A *results* block is a `.result` section,
  above. The first is in `content/` and `app.js`, the second in `results.js`.
- **The wheel's scales are three items each, not two.** `leading()` still
  returns every archetype tied for the top, but three-item means tie less
  often than two-item ones do, so the "even wheel" case is rarer than the
  comment in `results.js` was written for.
- **A dimension is one name across the whole run.** `dimensions` in `app.js`
  is keyed by name alone, so two questionnaires writing `dimension:
  "Extraversion"` are averaged into one score, on whatever mix of scales they
  came in, and `normOf` reads the first one's norms for both. That is why the
  HEX-ACO-18 domains carry plain names of their own (Sociability, Patience,
  Diligence, Curiosity) rather than the FIPI's, and the commented-out
  Mini-IPIP6's carry "(IPIP)": the FIPI had the Big Five words first. A new instrument on ground already covered wants
  a tag of its own.
- **A new file needs a `<script>` or `<link>` tag in `index.html`, in the right
  place.** There are no modules and nothing imports anything: each file adds to
  the globals the next one reads. A block file loaded before
  `content/timeline.js` throws on a `defineBlock` that is not there yet, and
  `js/app.js` has to be last of the scripts. A block with no tag does not exist;
  a block with a tag but no name on any timeline exists and is never asked, which
  is the difference between forgetting one and leaving one out.
- **All `norms` in `content/` are invented placeholders**, flagged as such in
  comments, **with two exceptions**, and both are the output of
  `data/norms/` (`norms_hitop.R`, `norms_mint.R`) — which is where they should be re-read from rather than
  retyped. The HiTOP-BR's in `content/block_hitop.js` are the
  development-sample means and SDs printed in Table 1 of Simms et al. (2026),
  by way of the {hitop} R package — a development sample, not a norming one,
  and skewed towards its floor, which the comment beside them says; the script
  stops rather than guess if the package renames a scale, since the six carry
  plain names in `content/` and the mapping lives in both files at once. The
  MINT's in `content/block_mint.js` are the pooled answers of 1,684 people
  across the four studies that have asked those 33 items, distributions and all —
  a convenience sample of online studies rather than a population, which the
  comment beside them says too. **A third, outside `data/norms/`**: the
  SIS/SES-SF's in `content/block_sex.js` (asked only by `all`) are Carpenter
  et al.'s (2010) published sums by sex, pooled and turned into item means by
  hand — the arithmetic and the by-sex figures are in the comment beside them,
  and the chapter is on the shelf. Never
  present the rest as real, and keep the flags when editing. The
  `archetypes` block has none at all, and that is deliberate rather than
  unfinished — writing twelve would be twelve more invented numbers, and the
  wheel does not want them. Don't "fix" it by adding some. **The `icar`
  block is the opposite case and worth reading twice**: it has norms, and
  nothing on its own level reads them. They are there for the whole-run web
  alone — the average person is drawn from a mean on
  every axis, and four axes without one would leave a gap in that ring — and they
  are invented placeholders like the rest, not the SAPA norms, which exist
  and are still not used. The compass compares the four kinds with each
  other and with nobody, and a percentile on reasoning is the one thing this
  test does not hand back: no row, no interpretation and
  no `key`. The whole-run web does give a standing on them, worded as a style
  and not as a score — see **The compass** for why that is a different thing.
  Adding an `interpretations` to one of them would grow a results row and a
  vote on a level that gives neither.
- **The consent form in `index.html` is not approved text yet.** It is
  modelled on the University of Sussex sheet the MINT
  validation study ran with (`ethics/mint_validation/Consent.pdf`) — the same
  headings in the same order, and the consent statements kept as the
  committee's own wording rather than reworded, since that is what a reviewer
  reads for — and what is written around them describes *this* study, so it has
  to keep agreeing with the Project Description in
  `ethics/mint_followup/application_draft.md`. **Two of the seven are not
  the committee's standard wording**: the committee's third says withdrawal is
  impossible "once I have completed it", which is not true when answers go out
  as they are given, so this one says "once it has been given, whether or not I
  finish the study" instead; and the fourth is added, at the committee's request
  (October 2026), saying up front that some questions are about intimate matters
  (sexuality, bodily functions) or sensitive mental-health topics
  (hallucinations, thoughts about death). It sits fourth so that the third keeps
  its number, which the application and these notes refer to. A reviewer should be told which ones
  were changed and why (7.5.2 does), and the rest are still to be left alone. **One thing
  in it is still a blank**: the reference, which the Faculty Research Ethics
  Committee: Science, Engineering and Technology (F-REC, formerly the C-REC)
  gives on approval. The duration it gives, 30 minutes, is the time rewarded (two SONA
  credits, set on 4 October 2026) rather than the 20 to 25 minutes the core
  takes, which is what the application's 4.0.1 says, and `ethics/mint_followup/consent_form.docx` is the same
  text as a document, so a change to one wants the other. The second contact is Asel
  Tohlukov (at775@sussex.ac.uk), the student submitting the application.
  Nothing on screen flags any of this. The Start button stays disabled until the form has
  been scrolled to the end (`checkConsent`), which then rewrites the hint under
  it rather than hiding it.
- **A token file written by PowerShell carries a byte order mark.**
  `Set-Content -Encoding utf8` on Windows PowerShell 5.1 writes a BOM, which is
  not whitespace, so `strip()` leaves it on the front of the token; it then goes
  into an `Authorization` header and fails encoding to latin-1, several frames
  deep in `urllib` and a long way from anything that mentions tokens.
  `download.py` reads `~/.zenodo_token` as `utf-8-sig` for that reason, and
  takes the quotes off a pasted value while it is there. Anything else that
  learns to read a secret out of a file on this machine wants the same.
- **A test run opens a real session and leaves real files.** `?test=true`
  talks to the live experiment like any other run: pressing Start opens a
  staging session, and a test run abandoned halfway leaves a
  `test_…partial.json` in the Zenodo deposit about fifteen minutes later, the
  way a finished one leaves a `test_…json`. The `test_` prefix is what picks
  both out for binning; nothing else does. To exercise the wiring without
  sending anything, put a stub on `window.DataPipe` before pressing Start
  and **after the page has finished loading** — set during a reload, it is
  overwritten by the vendored client's own `var DataPipe` when that script
  runs, and the run goes to the live deposit —
  `setBaseURL` doing nothing, `createSession` returning — synchronously, not
  as a promise — `{sessionId, ready, record, flush, close}`, and
  `saveData` returning `{ok: true}` (a stub without the first two throws on
  Start and leaves the page on the landing screen). `ready()` matters: the
  session is handed to `saveData` whole, and that is what the real client awaits on
  it, so a stub session without one cannot stand in for it (and a stub of
  `createSession` alone, left to the real `saveData`, fails the send outright). Note
  that `delete window.DataPipe` does **not** work: the bundle declares it with
  `var`, so the global is writable but not configurable, and what removes it is
  `window.DataPipe = undefined`. **A reload in the middle of a run carries it
  on** (see **Carrying on**) and opens a session as the page comes up, before
  any stub can be set from the console, so a stubbed test that reloads goes to
  the live deposit from then on. To test carrying on offline, clear
  `localStorage` first and serve a stub in the vendored file's place for the
  length of the test (keeping the real one aside, and putting it back: its
  sha256 above is how to tell).
- **The items a test run answers for itself are never staged.** `thinRun()`
  fills them in before the session is open and nothing was put on screen, so a
  partial from a test run holds only what was actually shown, while the file at
  the end holds all of it. That is the right way round — it is the same reason
  such an item carries null times and is passed over by the quality control —
  but it means a test partial is much thinner than a real one.
- **Test mode opening the consent gate is temporary scaffolding**, and goes
  before the study runs.
- The PHQ-4 uses the refined 5-option version, so `0.5` is a valid response and
  sums are not always whole (`tidy()`).
- Items with no `dimension` (attention checks) are skipped by all scoring.
- **A level number means nothing without the run's block list.** `?project=`,
  `?only=` and `?skip=` drop blocks and then whole levels from `PLAN`, `?start=`
  moves levels to the front of it, and
  levels are numbered by their place in it, so level 3 of one study is not
  level 3 of another — and **the order of levels 2 to 10 is drawn or chosen**:
  the core fork puts its three among places 2 to 4, over a drawn order, and the
  second fork its six among places 5 to 10, again over a drawn order, so what is level 5
  for one participant is level 10 for the next in the same study — and levels 8
  to 10 are beneath the seabed while 1 to 7 are in the water, so the same
  questionnaire is met in the water by one person and in the rock by another. `levels` in the saved file is the key —
  every level of the run, in the order walked, with its blocks; read
  `timeLevelN` against it, never against the full timeline. The Content table in
  `docs/index.html` writes each instrument's level **as written on the
  timeline**, which is the one thing about it that never moves.
- **`gjs` is out of the timeline, not out of `content/`.** It has a block file
  of its own, commented out, and is named on no level. It wants an employment
  item to hang a `showIf` on before it goes in. (An escape option marked
  `custom: true` holds its dimension unfinished rather than feeding its number
  into the score, so one is *possible*, but a dimension that
  can never complete earns no results row, which is why the `showIf` is still
  the better design.)
- **`Country` is four buttons and a branch.** The commonest few are options,
  everywhere else is `CountryOther`, typed — the engine has no dropdown, and no
  list of every country belongs on a screen of option buttons. What is typed
  arrives spelled however people spell it, and wants tidying at analysis time.
- A question of ten or more options wants `columns: 2` (`Ethnicity`,
  `Discipline`): stacked full width, they run off the bottom of the window. A
  `small` option keeps a row of its own whatever the columns are. **It is a way
  out and not a point on the scale**, so it can sit under a row of numbered
  circles without turning them into labelled buttons (`renderChoice` counts the
  circles without it): written `small: true, custom: true` with words of its
  own. **A slider may carry one too**, as the only kind of option it can
  have: written on its format the same way, set under Continue and taken on
  the press (`Sex_MasculineFeminine`, "This doesn't apply to me"). It must be
  valued off the line — the flatten throws otherwise — since `said()` and
  `counted()` tell it from a point on the line by its value alone, and the
  digit keys answer a choice only, so a digit cannot take it.
- `drawSpider` needs 3+ dimensions to draw a polygon; with fewer, or with some
  still unanswered, it joins neighbours with lines instead. Past eight of them
  it goes `many`: a bigger viewBox and smaller labels. The whole-run web is the
  only thing that gets there, and at sixteen axes it still fits — the two-word
  names wrap onto a second line, which is what keeps the neighbours apart. If
  `PROFILE` grows much past that, the labels near the top and bottom of the rim
  start running into each other and want staggering.
- The keyboard handler (digits answer, ← goes back) must stay disabled while a
  panel is open — the survey behind it is not being read.
- **A turn belongs to the answer that scheduled it** (`turns`, beside `locked`).
  `answer()` does not advance the run itself: it schedules the move for
  `ADVANCE_DELAY` later. A timeout that ran whatever had happened in the
  meantime — setting `locked = false` and calling `advance()` on whatever
  `index` had become — would, with two of them in flight (a press that got
  through while the lock was down, a level screen going up behind the fade),
  have the second one advancing from a place it knew nothing about: **`advance()`
  would find nothing shown after the current item and end the run while that
  item was still on screen unanswered**, which sends the file without the answer
  to it — `Closing_Comments` and the last level screen's own response, the fork
  choice among them. So each answer takes a numbered turn and a
  timeout that is no longer the current one does nothing at all: it neither
  unlocks nor advances. Anything else that schedules a move wants the same
  guard, and **anything that unlocks on a timer wants asking whether it is
  still the unlock that was meant**.
- **The run is sent once, whatever reaches the end of it.** `save()` keeps the
  promise of the first send and hands it back to any later call (`sending`,
  `sendRun`), so a second arrival at the end gets the first one's outcome
  rather than a second file. DataPipe refuses a filename it has already taken,
  so without this a second send answers `FILE_EXISTS` and writes "could not be
  sent" under a run whose answers had just arrived. The guard is not a
  substitute for the turn one above it — it stops the *report* being wrong, not
  the *file* from being early.
- **A level screen is left once** (`levelLeft`, set in `leaveLevel`, cleared
  in `completeLevel`). The way on stays pressable while the screen is being
  sucked away, and each press past the first used to run the whole way out
  again: from the floor, a crossing of its own, whose timer put the survey
  back up nine seconds later over whatever was on screen by then, and
  unlocked — in a thinned test run, over the next level's results, so the
  closing item was answered before they were read and their `Level_<N>` was
  saved without a response. The fork cards have their own guard (the screen's
  `response`), which cannot live in `leaveLevel`, since a card writes the
  response before calling it.
- **`answer()` is reachable when the survey is not on screen.** The option
  buttons of the item before a level screen are still in the (hidden) survey, and
  the water takes `CURTAIN_COVER` to cover them, so it guards on
  `screen !== "survey"` *and* holds `locked` from the moment a level ends until
  "Continue the test" is pressed. Without both, the next item — including the
  closing one — can be answered without ever having been seen. **`passBriefing()`
  holds under the same two conditions**, and so does the Enter/Space path into
  it in the keydown handler (which returns off `screen !== "survey"` before it
  gets there): a level whose first block is not a demographics one opens with
  a briefing, so that is what waits behind the level screen, and a press on
  `#briefing-go` while the curtain was crossing would pass it unread — the
  first real item of the next level would be what waited instead, and the
  briefing would be filed with a response time of almost nothing. A third
  guard, `isBriefing()` on the current item, keeps the button from passing
  anything that is not one.
- **An animation filled `both` holds its last frame for as long as the element
  lives.** `sheen` ends with `opacity: 0` for exactly this reason: its last
  frame parks a band of light one full width to the right of the section, which
  is otherwise painted over the middle of the page for ever.
- **Anything reading `normOf(...)` must expect nothing back.** A scale may be
  written without norms — several are — so every norm read in `results.js`
  sits behind a check for one. The card is the one that bites: it draws the
  average person across *every* axis in one path, so it draws that ring only
  when every dimension has a norm, rather than skipping the axes that have none.
- **Below 560px the anchors go under the row, at its ends**, which the
  circles' own rule (two classes deep, drawing them in against the circles)
  would override and put both in the middle unless undone in the media query.
  More than seven circles take two rows of six there, the second ending under
  the first (`nth-child(7):nth-last-child(n)`), with the low anchor over the
  first row and the high one under the second — the SQS and the ESS
  self-placement, eleven points each.
- **The anchors either side of a scale hang off the circles, not off the page.**
  `renderChoice` puts `.scale--circles` on `#scale` for a scale of numbered
  circles, which sizes the middle grid track to the circles so the anchors come
  in with them — otherwise a five-point scale strands them at the edges of the
  room. Labelled options and typed fields keep the full width they are given,
  and below 560px the stylesheet stacks the anchors underneath either way.
- **A scale may stand on end.** `format: { vertical: true }` stacks the
  options strongest/highest-standing on top instead of last-written-on-the-
  right (circles: the MacArthur ladder in `content/block_demographics3.js`) or
  first-written-on-top (a labelled scale stacked in one column: the `mood`
  block's default format, which only the commented-out CDS-2 and PCL-2 would
  take, and the commented-out SSS-8 in `health`; the PHQ-4 and the HiTOP-BR
  are one row each instead, `columns` equal
  to their option count, which `renderChoice` reads as a Likert row and
  centres — `.options--row`). The options are still *written* weakest-first — the keyboard,
  `said()` and the saved file all read them in that order regardless — only
  `.scale--vertical`'s CSS turns the row upside down visually
  (`flex-direction: column-reverse`). `.scale--circles.scale--vertical` keeps
  the narrow column the ladder metaphor wants, and draws the ladder — a rail
  either side of the column and a stub of rung out of each circle, all
  pseudo-elements, so the markup is the same row of buttons; a labelled
  vertical scale keeps the full width its buttons are otherwise given.
- **`draw()`, `mix()` and `SVG` are `js/draw.js`, not either file that uses
  them.** The seam runs one way, so neither `app.js` nor `results.js` can
  borrow the other's, and the helpers live in a third file *below both*. It works
  only because those helpers read no state; anything that reads the run still
  belongs in `app.js` and anything that reads a score in `results.js` or a
  figure file. (The figure files *are* handed a bag of a dozen shared members,
  `shared` — see **The second seam** — which is the price of not having one three-thousand-line file. `draw.js` is not that
  kind of file and should not grow into one.)
- **`drawSpider`/`drawSoma` add their classes rather than setting them.** The
  same `<svg>` is found again by a class of its own (`.profile__web`), so
  writing `class` outright makes the second render of a profile throw.
- **`--share` is taken, and not by sharing.** It is the registered property
  (`@property`, a number) that the gauge's stops and the profile badge fill
  their rings with, so a colour written under that name anywhere is quietly
  coerced to `0`. The red every share button wears is `--sharing` for that
  reason. Any new custom property wants checking against
  the `@property` rules in `style.css` first.
- **A badge's crop is written in its figure's own coordinates**, and nothing
  checks it. Move a figure's centre, its radius or its viewBox and the badge
  goes on rendering — of whatever now happens to be in that square. After
  editing a figure, look at its badge. The quickest way is a finished
  `?test=true` run: clone the `.shelf__badge` elements into a fixed
  overlay at 130px and rewrite a clone's `viewBox` until it frames what it
  should, then write those numbers into `renderBadge`.
- **`.shelf__badge-emblem` is a class five files build**: `results.js` (the
  star sign's glyphs, where there are two), `theories.js` (the sign's
  woodcut), `archetype.js` (the robot), `heads.js` (the two organs) and
  `hyborian.js` (the top of the hero's card, or its emblem). It is the badge for a level
  with no drawing to crop, and the stylesheet sizes whatever is put in it — a
  character, or svgs at 46% of the square; the hero's painting and the sign's
  woodcut fill it (`.hyborian__badge`, `.sky__badge`).
- **`LINKED` is a map, not a list.** The two panel buttons sit on different
  bars, so each is named with the block it is written in (`profile:
  "shelf__link"`, `raw: "sidebar__link"`) and `markSidebar` lights each in its
  own block's `--open`. A third panel button wants its block naming here too.
- **`.bar` in `results.css` is the percentile bar** under a results row. The
  gauge down the right (or along the foot) is `.sidebar__*` — including the
  level stops on it, which are `.sidebar__level*` rather than a block of their
  own, since `.level` is already the level *screen* in `results.css`. Naming
  anything in `style.css` `.bar` puts a fixed, full-height panel behind
  every score in the results.
- **The gauge is laid out twice, once per axis.** Anything positioned on the
  line — the fill, a stop, its label, the bead — has a rule in the base sheet
  for running downwards and another under `@media (max-width: 760px)` for
  running rightwards, and the script only ever writes `--reach` and `--at`.
  Setting `top`, `height` or `left` on one of them from `app.js` would pin it
  to one axis and break the other.
- **`.result--sealed *` pauses every animation in a sealed card**, on purpose.
  A looping animation put inside a results card is therefore frozen until the
  level opens — which is fine for anything that runs once on arrival, and for
  the sea's sway, drift and lean (`sea__*` in `results.css`), the pulse round
  the point on the opinions plane (`stance__pulse`) and the MINT's signals and
  glow (`soma__signal`, `soma__glow`) and the volcano's steam, spatter, rising melt
  and scenery (`volcano__*`; the spatter is hidden under reduced motion, since
  held still a drop would hang over the cleft) and the glint on the Hyborian stats' rubies (`hyborian-glint`), the loops a card carries: a still sea
  behind a seal is what is wanted.
- **A locked figure is blurred by a rule that names it.** The one in
  `results.css` catches `.result--locked .result__chart svg`, which is every
  figure but two: `heads.js` draws its chart in HTML, so
  `.result--locked .headsview__chart` sits beside it, and `stance.js` draws its
  spectra in HTML, so `.result--locked .stance__spectra` does too. A figure whose body is
  not an `<svg>` has to add its own line there, or it will sit unblurred and
  perfectly readable inside a locked panel — which is the one thing the locked
  rendering exists to prevent. **A fork's cards blur less** (2.5px and 0.8
  opacity, against 5px and 0.5; `.level__path .result--locked` in
  `results.css`), since the figure is the reason to pick a card and the teaser
  has already taken every row and reading out; the heads' chart keeps 4px
  there, being percentages in HTML that 3px nearly lets be read. A new figure
  in HTML wants a card line beside its panel line, and a look at its card. The same figure builds its own `.result__chart`
  stage and `.result__lock` badge rather than taking `figureHolder`, which
  makes an `<svg>`; the teaser's own badge goes on `.result__body` and needs
  nothing from either. **Level 1's two figures are left out of that rule on
  purpose**: locked, the plane draws no point and lights no quarter, and the sky
  lights no sign and has no glyph, so there is nothing on either to hide (see
  **Two old theories**). A
  figure that wants the same has to be drawn with nothing earned on it when
  locked, not merely unblurred.
