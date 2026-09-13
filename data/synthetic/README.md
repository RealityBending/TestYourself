# Synthetic runs

Runs of the test answered by Claude in a sampled persona, written in the exact
shape the app saves, for exercising the analysis pipeline before there are
participants. A workbench like `norms/`: nothing on the page reaches for it.

```bash
pip install anthropic                                   # once
python data/synthetic/synthesize.py run --n 20          # sample personas, build, send as a batch
python data/synthetic/synthesize.py collect --wait      # fetch the batch, write out/*.json
```

Quicker loops:

```bash
python data/synthetic/synthesize.py run --n 3 --live    # three personas now, one request each
python data/synthetic/synthesize.py run --n 5 --fake    # random answers, no API call, no cost
```

`codebook.js` reads every item out of `content/` (run by bun or node, which
`synthesize.py` finds on the PATH), so the requests can never drift from what
the page asks. Everything in between is left in `work/` to be read: the
codebook, the personas, the requests exactly as sent, the batch id. Output
goes to `out/`, one `synthetic-<code>.json` per persona. Both folders are
git-ignored.

Defaults: `claude-sonnet-5`, about 6,700 tokens of items per request, roughly
$0.03 a persona in a batch (halve or double for Haiku 4.5 or Opus 5, `--model`).
`build` prints the estimate before anything is sent. An API key is read from
`ANTHROPIC_API_KEY`; a Claude Team or Pro seat does not cover API calls.

A synthetic file says so twice: the participant code starts `synthetic-`, and
a `synthetic` field carries the model, the batch, the seed and the persona's
biography. Reaction times are null, the attention checks are passed, the
`feedback` votes are all null. Never pool these with participants — models
answer in socially desirable ways, avoid the extremes and vary less than
people, however hard the prompt pushes back. Use them to test scoring,
reverse-keying and the figures, not to learn anything about anybody.
