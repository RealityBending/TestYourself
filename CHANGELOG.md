# Changelog

Every response file carries the `version` it was saved under (`js/app.js`,
`APP_VERSION`), so a data export can always be matched back to the code that
produced it. Versions are recorded here as they are cut; there is no build
step, so cutting one is nothing more than bumping `APP_VERSION` and adding an
entry below.

## Unreleased

What was called a **part** is now a **level**, everywhere: on screen ("Level 2
unlocked", "Level 2 complete", the buttons down the sidebar), and in the code
behind it (`scoredLevels`, `fromLevel`, `suckLevel`, `.sidebar__level*`). The
run always had levels underneath — this is the one word for them.

**Sections**: a new kind of entry in `content/`, carrying `section: true`. It is
a pause inside a level rather than a question — a heading and a few paragraphs
saying what the next stretch is about — and nothing about it is recorded: no
response, no row in `items[]`, and nothing in the quality-control figures. Two
are asked: one after the demographics of level 1, and one at the head of the
MINT. An `items[]` row is still an answer and nothing else, so files written
before and after this are read the same way.

The job-satisfaction item (GJS) is commented out in `content/level2.js` as well
as being out of `RUN`. It was never asked, so no saved file changes.

The browser's back button now goes back an item rather than off the site: the
survey holds one spare history entry under itself and puts it back whenever the
button takes it. Nothing is recorded about it, and the URL a run was started on
is kept.

Files moved, nothing else: the questions are now `content/schema.js` (the
schema) and `content/level1.js` … `level4.js` (a file per level of the run),
the code is in `js/`, the stylesheets in `css/`, and the project notes are in
`AGENTS.md` alone, with `CLAUDE.md` pointing at it. No question, score or saved
field changed, so `APP_VERSION` is untouched and files written before and after
the move are the same data.

## 0.0.1 — 2026-08-26

Initial tracked version. The consent form was brought in line with the
standard wording used across the lab's studies, and the landing page carries
the affiliation logos (University of Sussex, ResearchPlus, Reality Bending
Lab).
