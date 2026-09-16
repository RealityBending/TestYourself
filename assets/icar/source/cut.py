# Cuts the ICAR's eight published figures into the pieces the page shows: the
# problem on its own, and one picture per candidate answer, so that a candidate
# can be a button rather than a letter standing in for one. The composites in
# this folder are the figures out of Appendix A of Condon & Revelle (2014)'s
# supplement, as published — the problem and its lettered candidates drawn
# together — and nothing on the page reaches for them; the pieces written into
# the folder above are what content/block_icar.js names.
#
# Nothing is positioned by hand. A matrix figure is a grid over a table whose
# header row carries the letters: the table's three full-width rules and the
# header's dividers are found, and each cell's interior is cut out of the band
# under the header. A rotation figure is the cube X on the left and the
# candidates in two rows of four, the last column being the two written
# answers ("None of the cubes…", "I do not know…"), which are not cut — they
# are text options in the block file. Each cube is the block of ink above its
# letter in its column, cut without the letter: the stem calls X "the
# following cube", and a candidate's button carries its own. Run from the
# repository root:
#
#     python assets/icar/source/cut.py
#
# Needs Pillow and numpy; neither is a dependency of anything that runs.
import os
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
PAD = 5 # white left round a cut, in pixels
INK = 128 # darker than this is ink


def runs(mask, gap=8):
    # Stretches of the mask that are on, read as one across a gap of fewer
    # than `gap` pixels: a cube's outline is faint enough to drop out for a
    # row or two, and the letters sit a good deal further from it than that.
    out, start = [], None
    for at, on in enumerate(mask):
        if on and start is None:
            start = at
        if not on and start is not None:
            out.append((start, at - 1))
            start = None
    if start is not None:
        out.append((start, len(mask) - 1))
    merged = []
    for run in out:
        if merged and run[0] - merged[-1][1] <= gap:
            merged[-1] = (merged[-1][0], run[1])
        else:
            merged.append(run)
    return merged


def ink(image):
    return np.asarray(image.convert("L")) < INK


def cut(image, left, top, right, bottom, name, within=None):
    # Inclusive pixel bounds, padded, kept inside `within` (a table cell, so
    # that a black cell's padding does not reach the rule beside it) or the
    # image.
    l, t, r, b = within or (0, 0, image.width - 1, image.height - 1)
    box = (max(left - PAD, l), max(top - PAD, t), min(right + PAD, r) + 1, min(bottom + PAD, b) + 1)
    image.crop(box).save(os.path.join(OUT, name + ".png"), optimize=True)


def matrix(name):
    image = Image.open(os.path.join(HERE, name + ".jpg"))
    dark = ink(image)
    rows = dark.mean(axis=1)
    # The three rules of the table: over the header, under it, and the foot.
    rules = runs(rows > 0.85, gap=0)
    assert len(rules) == 3, (name, rules)
    (head, _), (_, under), (foot, _) = rules
    # The problem is everything inked above the table.
    above = runs(rows[:head] > 0.002)
    top, bottom = above[0][0], above[-1][1]
    cols = runs(dark[top : bottom + 1].mean(axis=0) > 0.002)
    cut(image, cols[0][0], top, cols[-1][1], bottom, name)
    # The dividers, read off the header band, where only letters sit between them.
    dividers = runs(dark[head + 1 : under].mean(axis=0) > 0.85, gap=0)
    assert len(dividers) == 7, (name, dividers)
    for at, letter in enumerate("ABCDEF"):
        left, right = dividers[at][1] + 1, dividers[at + 1][0] - 1
        # The cell interior, a couple of pixels in from the rules (the JPEG
        # leaves a grey shadow beside each), then closed in on its ink.
        top, bottom, left, right = under + 3, foot - 3, left + 2, right - 2
        cell = dark[top : bottom + 1, left : right + 1]
        r = runs(cell.mean(axis=1) > 0.002)
        c = runs(cell.mean(axis=0) > 0.002)
        cut(image, left + c[0][0], top + r[0][0], left + c[-1][1], top + r[-1][1], name + "_" + letter, within=(left, top, right, bottom))


def rotation(name):
    image = Image.open(os.path.join(HERE, name + ".jpg"))
    dark = ink(image)
    bands = runs(dark.mean(axis=0) > 0.002)
    assert len(bands) == 5, (name, bands)
    # X, without its letter: the first block of ink in the first column.
    left, right = bands[0]
    r = runs(dark[:, left : right + 1].mean(axis=1) > 0.002)
    assert len(r) == 2, (name, r) # cube, letter
    top, bottom = r[0]
    c = runs(dark[top : bottom + 1, left : right + 1].mean(axis=0) > 0.002)
    cut(image, left + c[0][0], top, left + c[-1][1], bottom, name)
    # The three picture columns, two cubes each, letter under cube; the fourth
    # column is the two written answers and is left alone.
    letters = [("A", "E"), ("B", "F"), ("C", "G")]
    for (left, right), pair in zip(bands[1:4], letters):
        column = dark[:, left : right + 1]
        blocks = runs(column.mean(axis=1) > 0.002)
        # cube, letter, cube, letter
        assert len(blocks) == 4, (name, left, blocks)
        for block, letter in zip((blocks[0], blocks[2]), pair):
            top, bottom = block
            c = runs(column[top : bottom + 1].mean(axis=0) > 0.002)
            cut(image, left + c[0][0], top, left + c[-1][1], bottom, name + "_" + letter)


for name in ("MR45", "MR46", "MR47", "MR55"):
    matrix(name)
for name in ("R3D03", "R3D04", "R3D06", "R3D08"):
    rotation(name)
