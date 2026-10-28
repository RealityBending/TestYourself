# Turns what `download.py` has pulled off Zenodo into tables an analysis can
# read, and says whether the files are what they claim to be.
#
#   Rscript data/collected/preprocess.R                 # raw/ -> clean/
#   Rscript data/collected/preprocess.R --check         # check only, write nothing
#   Rscript data/collected/preprocess.R --include-test  # keep the test runs in
#   Rscript data/collected/preprocess.R --include-pilot # keep the runs before 1.0 in
#   Rscript data/collected/preprocess.R --long          # the long table as well
#   Rscript data/collected/preprocess.R --from data/synthetic/out
#
# {jsonlite} and nothing else: the rest is base R, the way `data/norms/` is.
# Nothing in the app reaches for this file — this folder is a workbench.
#
# TWO SHAPES COME OUT OF THE DEPOSIT, and this reads both.
#
#   1. A run somebody finished is the app's own `container()`: one object, with
#      `items` in it. See **Saved data** in `AGENTS.md`.
#   2. A run somebody stopped partway through is a `.partial.json`, which is
#      what DataPipe assembled out of the records the app staged as the answers
#      were given — `frame` records (the file with its answers taken out) and
#      `item` records (one entry of `items[]` apiece). Those are put back into a
#      container here by the rule the app stages them under: **the last frame,
#      and the last record under each key**, in `order`. See **Where it goes**.
#
# So a finished run and an abandoned one come out of here as the same table,
# with `completed` saying which it was. That column is worked out from the
# *filename*, because nothing inside a partial says it is one — which is the
# first of the notes at the foot of this file.
#
# WHAT IS WRITTEN, into `clean/`: **one file, one row a run.**
# Anything that is not data — what was read, what looked wrong — is **said and
# not filed**: a `checks.csv` that is empty nine times out of ten is a file
# somebody has to open to learn nothing. The complaints go to the terminal, where
# whoever ran the script is already looking.
#
#   data.csv     **the master file**: everything the saved run says, across
#                roughly 720 columns, one row a run. Nothing is left
#                out to keep it narrow and **nothing is worked out that the
#                file does not already say** — no mean reaction time, no share
#                of an instrument completed, no count of failed checks over the
#                run, no item counts, no minutes taken. All of those are a
#                line of R away from what is here, and which of them an
#                analysis wants is the analysis's business. What this does is
#                reshape: many files of records into one table of runs.
#
#                **A row is a run, not a person.** Somebody who took the test
#                twice (a retest, a retake from the hub's dashboard, the same
#                SONA id on a second go) is two rows under one `participant`;
#                `file` tells them apart, and it is what `responses.csv` joins
#                on.
#
#                  the run       participant, file, completed, version,
#                                test_mode, synthetic, battery, source,
#                                format_mint, time_start, time_resumed
#                  sequences     levels_walked, order_walked (see below)
#                  Feedback_*    one a reading: agree, disagree or nothing
#                  Rating_*      one a level: the stars its results were given
#                  QC_*          four a level: RT_Mean, RT_SD, ChecksFailed,
#                                TimeFinished
#                  Level_<N>_*   three a fork choice: Offered (keys in the
#                                order the cards stood), Recommended, Chosen
#                  <item key>    one a question, holding the words that were
#                                on screen
#                  <item key>_RT one a question, holding what that answer took
#
#                **ONE NAMING RULE, and it is `content/`'s own.** What the run
#                says about itself is lowercase (`participant`, `time_start`);
#                everything that is a *measure* is `Prefix_Subject_Field`, the
#                prefix an acronym in capitals or a word in PascalCase, exactly
#                the way an item key is written (`MINT_Card_28`,
#                `Demographics_Age`). So `QC_Character_RT_Mean` and
#                `Feedback_BodilyAwareness` sit beside `HEXACO_Sincerity`
#                under one convention, and a column can be told from a run
#                field on sight. Times are milliseconds throughout and do not
#                say so in every name.
#
#                **The level columns are named for the level's KEY, not its
#                number and not its name** — `Rating_Character`,
#                `QC_MoodHealth_RT_Mean` — and **the app writes them that
#                way**: each level carries a `key` in `content/timeline.js`
#                beside the `name` the participant reads, and `ratings` and
#                `qualityControl` are keyed by it, so nothing here recovers
#                anything by joining. A number would be a different level in
#                every row, the order being drawn and partly chosen; a name
#                would move whenever the prose on screen was reworded, and
#                would carry an ampersand into a column name.
#
# **The two sequence columns are how a wide file keeps what a wide file cannot
# hold** (`levels_walked` holds the level keys, not their names). Which levels
# somebody walked, and the order they met the items in, are
# facts about a sequence, and a row has one cell per item — so they are joined
# with " | " into one cell each and split apart again when wanted. Nothing is
# lost, and the alternative (a column per item saying where it fell) would have
# doubled an already wide file for something most analyses never look at.
#
# One flag adds a second file:
#
#   --long        also writes responses.csv, the same answers one row an item
#                 of a run (`participant` and `file` on each, as in data.csv),
#                 which is the shape a mixed model or a per-item plot wants.
#                 Anything `clean/` holds that a run did not write is removed,
#                 so a `responses.csv` from an earlier `--long` cannot sit
#                 beside a newer `data.csv` looking current
#
# **NA IS NOT THE EMPTY STRING HERE.** An item that was never put on screen —
# a branch that did not open for this person, or a question they stopped before
# — is `NA`. An optional item that *was* shown and deliberately left blank is
# `""`, which is what the app saves for it. The saved file has always told those
# apart; this keeps them apart, so `read.csv` gives NA for the one and "" for
# the other.
#
# **WHO IT WAS IS TAKEN OUT.** `participant` is a number (`S000001`) out of a
# ledger kept beside this script (`ids.csv`, git-ignored), not the id the run
# came in with, and the day of birth is reduced to the star sign it falls
# under (`Demographics_StarSign`), as the ethics application promises. The free
# text is left as typed, to be read before anything is published. See **Who it
# was, taken out**, further down.
#
# WHAT IT REFUSES TO DO. It does not score anything, and it does not turn the
# words back into the numbers they were answered on — see the notes at the
# foot. It also keeps test and synthetic runs out of `clean/` unless asked
# (`--include-test`), since neither is data, and the pilots' runs, written by
# a version before the first release, unless asked (`--include-pilot`).

SEP <- " | "  # what a multi-answer's choices are joined with in a cell

# The study and its pilots share one deposit, by choice, and the version each
# file carries is what tells them apart: everything before the first release
# asked other things in other ways, and is not the study's data.
FIRST_RELEASE <- "1.0.0"

args <- commandArgs(trailingOnly = TRUE)
check_only <- "--check" %in% args
include_test <- "--include-test" %in% args
include_pilot <- "--include-pilot" %in% args
also_long <- "--long" %in% args
from_at <- match("--from", args)
here <- tryCatch(dirname(normalizePath(sys.frame(1)$ofile)), error = function(e) "data/collected")
if (!dir.exists(here)) here <- "data/collected"

raw_dir <- if (!is.na(from_at) && length(args) > from_at) args[from_at + 1] else file.path(here, "raw")
clean_dir <- file.path(here, "clean")

if (!requireNamespace("jsonlite", quietly = TRUE)) {
  stop("This wants {jsonlite}: install.packages(\"jsonlite\")", call. = FALSE)
}

# Every complaint lands here rather than stopping the run: one bad file out of
# three hundred should be named and stepped over, not the end of the morning.
complaints <- list()
grumble <- function(file, what, detail = "") {
  complaints[[length(complaints) + 1]] <<- data.frame(
    file = file, check = what, detail = as.character(detail), stringsAsFactors = FALSE
  )
}

# ---------------------------------------------------------------------------
# Reading a file, whichever of the two shapes it is in
# ---------------------------------------------------------------------------

# `simplifyVector = FALSE` throughout, on purpose: an item's `response` is a
# string, a number, a list of strings (a multi) or null, and left to simplify
# itself jsonlite would make a data frame of the items and then have to guess
# what to do with the ragged column. Plain lists are predictable.
read_json_file <- function(path) {
  jsonlite::fromJSON(readLines(path, warn = FALSE), simplifyVector = FALSE)
}

is_records <- function(parsed) {
  is.list(parsed) && is.null(names(parsed)) && length(parsed) > 0 &&
    all(vapply(parsed, function(one) is.list(one) && !is.null(one$record), logical(1)))
}

# The staged records put back together, by the rule they were staged under.
reassemble <- function(records, file) {
  kind <- vapply(records, function(one) as.character(one$record), character(1))
  frames <- records[kind == "frame"]
  items <- records[kind == "item"]

  if (length(frames) == 0) {
    grumble(file, "partial has no frame", "cannot tell whose run it is")
    return(NULL)
  }

  run <- frames[[length(frames)]]  # the last frame said everything the ones before it did
  run$record <- NULL

  # The last record under a key is the answer that stands: an item answered
  # again — gone back to, or a branch closing behind it — was staged again.
  keys <- vapply(items, function(one) as.character(one$key), character(1))
  items <- items[!duplicated(keys, fromLast = TRUE)]
  order_of <- vapply(items, function(one) as.numeric(one$order %||% NA_real_), numeric(1))
  items <- items[order(order_of)]
  run$items <- lapply(items, function(one) {
    one$record <- NULL
    one
  })
  run
}

`%||%` <- function(a, b) if (is.null(a)) b else a

# ---------------------------------------------------------------------------
# Checking one run
# ---------------------------------------------------------------------------

REQUIRED <- c("version", "participant", "testMode", "levels", "questionnaires", "timeStart", "items")

inspect <- function(run, file, completed) {
  missing <- REQUIRED[!REQUIRED %in% names(run)]
  if (length(missing) > 0) {
    grumble(file, "missing fields", paste(missing, collapse = ", "))
  }
  if (is.null(run$items) || length(run$items) == 0) {
    grumble(file, "no items", "")
    return(invisible(NULL))
  }

  keys <- vapply(run$items, function(one) as.character(one$key %||% NA_character_), character(1))
  if (anyNA(keys)) grumble(file, "item with no key", sum(is.na(keys)))
  repeated <- unique(keys[duplicated(keys)])
  if (length(repeated) > 0) {
    grumble(file, "repeated item keys", paste(utils::head(repeated, 5), collapse = ", "))
  }

  # `order` is the item's place in the run as it was walked. A run that finished
  # holds every number from one to however many items there are, exactly once.
  # **A partial does not, and should not**: it is the answers somebody had given
  # when they stopped, so its orders are a subset with gaps in it. All that can
  # be asked of one is that no two items claim the same place.
  orders <- vapply(run$items, function(one) as.numeric(one$order %||% NA_real_), numeric(1))
  if (completed) {
    if (!identical(sort(orders), as.numeric(seq_along(orders)))) {
      grumble(file, "order is not 1..n", sprintf("%d items, order %s", length(orders),
        if (all(is.na(orders))) "all missing" else sprintf("%g..%g", min(orders, na.rm = TRUE), max(orders, na.rm = TRUE))))
    }
  } else if (anyNA(orders) || anyDuplicated(orders) > 0) {
    grumble(file, "partial has items sharing a place", sprintf("%d items", length(orders)))
  }

  # A cell in the wide table joins a multi-answer's choices with SEP, so an
  # option whose own words contain it would be unsplittable again.
  words <- unlist(lapply(run$items, function(one) if (is.list(one$response)) unlist(one$response) else one$response))
  words <- words[is.character(words)]
  if (any(grepl(trimws(SEP), words, fixed = TRUE))) {
    grumble(file, "an answer contains the separator", trimws(SEP))
  }

  invisible(NULL)
}

# ---------------------------------------------------------------------------
# One run -> rows
# ---------------------------------------------------------------------------

as_cell <- function(value) {
  if (is.null(value)) return(NA_character_)
  if (is.list(value)) {
    if (length(value) == 0) return(NA_character_)
    return(paste(vapply(value, function(one) as.character(one %||% ""), character(1)), collapse = SEP))
  }
  as.character(value)
}

when <- function(text) {
  if (is.null(text) || is.na(text)) return(as.POSIXct(NA))
  as.POSIXct(gsub("T", " ", sub("Z$", "", text)), tz = "UTC")
}

# What the run says about itself, and nothing worked out from it. How many items
# it holds, how many were answered and how long it took were all here once, and
# went in September 2026 for the reason the shares did: every one is a line of R
# over the columns further along, and a file that counts things for you is a file
# you have to check the counting of. `completed` is the one thing here that is
# not copied straight out — nothing *inside* a partial says it is one, so it is
# read off the filename, which is why the filename is kept beside it.
run_row <- function(run, file, completed) {
  data.frame(
    # The person, the same number in each of their runs: the hub account a run
    # was kept on is folded into it (see **Who it was, taken out**).
    participant = as.character(run$participant %||% NA),
    file = file,
    completed = completed,
    version = as.character(run$version %||% NA),
    test_mode = isTRUE(run$testMode),
    synthetic = !is.null(run$synthetic),
    battery = as.character(run$battery %||% NA),
    source = as.character(run$source %||% NA),
    # What it was answered on (absent from files before September 2026).
    # `screen_layouts` is every layout the run was seen in, joined the way the
    # sequence columns are, so one that crossed the breakpoint says so.
    device = as.character(run$device %||% NA),
    touchscreen = as.logical(run$touchscreen %||% NA),
    screen_layout = as.character(run$screenLayout %||% NA),
    screen_layouts = if (is.null(run$screenLayouts)) NA_character_ else paste(unlist(run$screenLayouts), collapse = " | "),
    viewport_width = as.numeric(run$viewport[1] %||% NA),
    viewport_height = as.numeric(run$viewport[2] %||% NA),
    screen_width = as.numeric(run$screen[1] %||% NA),
    screen_height = as.numeric(run$screen[2] %||% NA),
    format_mint = as.character(run$formatMint %||% NA),
    time_start = as.character(run$timeStart %||% NA),
    # When a run left partway was carried on in the same browser (js/resume.js),
    # joined the way the sequence columns are; empty for a run taken in one go,
    # NA in files from before it could be.
    time_resumed = if (is.null(run$timeResumed)) NA_character_ else paste(unlist(run$timeResumed), collapse = SEP),
    stringsAsFactors = FALSE
  )
}

level_rows <- function(run, file) {
  levels <- run$levels %||% list()
  if (length(levels) == 0) return(NULL)
  held <- run$qualityControl %||% list()
  do.call(rbind, lapply(seq_along(levels), function(n) {
    # **The key is what the columns are named for**, and it is written in the
    # timeline beside the name: the name is participant-facing prose, free to be
    # reworded for the sake of the test, and a column of a study's data is not.
    # Three generations are read so an old file still opens — by key, then by
    # name (files between September 2026 and the key), then by `level<N>`.
    name <- as.character(levels[[n]]$name %||% NA)
    key <- as.character(levels[[n]]$key %||% name)
    quality <- held[[key]] %||% held[[name]] %||% held[[paste0("level", n)]]
    data.frame(
      participant = as.character(run$participant %||% NA),
      file = file,
      level = n,
      key = key,
      name = name,
      blocks = paste(unlist(levels[[n]]$blocks %||% list()), collapse = SEP),
      time_finished = as.character(run[[paste0("timeLevel", n)]] %||% NA),
      rt_mean_ms = as.numeric(quality$responseTimeMean %||% NA),
      rt_sd_ms = as.numeric(quality$responseTimeSD %||% NA),
      checks_failed = as.numeric(quality$attentionChecksFailed %||% NA),
      stringsAsFactors = FALSE
    )
  }))
}

response_rows <- function(run, file) {
  items <- run$items
  if (length(items) == 0) return(NULL)
  onset <- vapply(items, function(one) as.character(one$timeOnset %||% NA), character(1))
  answered <- vapply(items, function(one) as.character(one$timeResponse %||% NA), character(1))

  # An item shown again after it was answered has had its onset re-stamped past
  # its response, so the gap is not a reaction time; the app's own quality
  # control drops those and so does this.
  gap <- as.numeric(difftime(when_v(answered), when_v(onset), units = "secs")) * 1000
  gap[is.na(gap) | gap <= 0] <- NA_real_

  data.frame(
    participant = as.character(run$participant %||% NA),
    file = file,
    key = vapply(items, function(one) as.character(one$key %||% NA), character(1)),
    questionnaire = vapply(items, function(one) as.character(one$questionnaire %||% NA), character(1)),
    order = vapply(items, function(one) as.numeric(one$order %||% NA), numeric(1)),
    response = vapply(items, function(one) as_cell(one$response), character(1)),
    n_chosen = vapply(items, function(one) if (is.list(one$response)) length(one$response) else NA_integer_, integer(1)),
    time_onset = onset,
    time_response = answered,
    rt_ms = round(gap),
    stringsAsFactors = FALSE
  )
}

when_v <- function(texts) {
  out <- as.POSIXct(rep(NA_real_, length(texts)), origin = "1970-01-01", tz = "UTC")
  good <- !is.na(texts)
  if (any(good)) out[good] <- as.POSIXct(gsub("T", " ", sub("Z$", "", texts[good])), tz = "UTC")
  out
}

# Each fork choice as it was put to the person — the `choice` on the entry in
# `levels` of the level whose screen it was made on, null where the way on was
# one button and absent from files before September 2026: the levels offered as
# keys in the order their cards stood, the one recommended and the one taken.
choice_rows <- function(run, file) {
  levels <- run$levels %||% list()
  made <- which(vapply(levels, function(one) is.list(one$choice), logical(1)))
  if (length(made) == 0) return(NULL)
  held <- lapply(levels[made], function(one) one$choice)
  data.frame(
    file = file,
    screen = paste0("Level_", made),
    offered = vapply(held, function(one) as_cell(one$offered), character(1)),
    recommended = vapply(held, function(one) as.character(one$recommended %||% NA), character(1)),
    chosen = vapply(held, function(one) as.character(one$chosen %||% NA), character(1)),
    stringsAsFactors = FALSE
  )
}

named_rows <- function(run, file, field, name_column, value_column) {
  held <- run[[field]] %||% list()
  if (length(held) == 0) return(NULL)
  out <- data.frame(
    file = file,
    a = names(held),
    b = vapply(held, function(one) as_cell(one), character(1)),
    stringsAsFactors = FALSE
  )
  names(out)[2:3] <- c(name_column, value_column)
  out
}

# ---------------------------------------------------------------------------
# Every file in the folder
# ---------------------------------------------------------------------------

if (!dir.exists(raw_dir)) {
  stop("No such folder: ", raw_dir, "\nRun data/collected/download.py first.", call. = FALSE)
}

paths <- sort(list.files(raw_dir, pattern = "\\.json$", full.names = TRUE))
if (length(paths) == 0) {
  stop("Nothing to read in ", raw_dir, call. = FALSE)
}

# A test run is known to be one before it is opened: the app names it `test_`
# (`download.py` reads `test-` as one too). It is dropped here, unread, so that
# nothing downstream ever has to set it aside — and a test partial with no
# items does not turn up among the complaints either. `testMode` inside the
# file is checked again below, for a test run whose name does not say so.
named_test <- grepl("^test[_-]", basename(paths))
if (!include_test && any(named_test)) {
  cat(sprintf("  %d test run(s) left out by name (--include-test keeps them)\n", sum(named_test)))
  paths <- paths[!named_test]
}
if (length(paths) == 0) {
  stop("Nothing but test runs in ", raw_dir, call. = FALSE)
}

cat(sprintf("Reading %d file(s) from %s\n", length(paths), raw_dir))

runs <- list()
for (path in paths) {
  file <- basename(path)
  parsed <- tryCatch(read_json_file(path), error = function(e) {
    grumble(file, "not readable as JSON", conditionMessage(e))
    NULL
  })
  if (is.null(parsed)) next

  partial <- grepl("\\.partial\\.json$", file)
  if (is_records(parsed)) {
    run <- reassemble(parsed, file)
    if (is.null(run)) next
    if (!partial) grumble(file, "staged records in a file not named .partial.json", "")
  } else if (!is.null(parsed$items)) {
    run <- parsed
    if (partial) grumble(file, "a .partial.json holding a whole container", "read as one")
  } else {
    grumble(file, "neither a container nor staged records", paste(utils::head(names(parsed), 6), collapse = ", "))
    next
  }

  inspect(run, file, !partial)
  runs[[file]] <- list(run = run, completed = !partial, file = file)
}

if (length(runs) == 0) stop("No file could be read.", call. = FALSE)

# A run that finished and a partial of the same run are one person: the app
# closes a finished session so its staged copy is dropped, but a tab shut on the
# instant can leave both behind. The complete file is the run.
base_of <- function(file) sub("-[0-9a-f]+\\.partial\\.json$", ".json", file)
bases <- vapply(runs, function(one) base_of(one$file), character(1))
complete_bases <- vapply(Filter(function(one) one$completed, runs), function(one) one$file, character(1))
superseded <- names(runs)[!vapply(runs, function(one) one$completed, logical(1)) & bases %in% complete_bases]
for (file in superseded) {
  grumble(file, "partial of a run that also finished", "dropped; the complete file is the run")
}
runs <- runs[!names(runs) %in% superseded]

# A run left, then carried on in the same browser (js/resume.js), is staged into
# a second session under the same name, and that session stages everything
# already answered again before going on: left a second time, its partial holds
# all of the first one's and more. Where no complete file stands over them, the
# fullest partial is the run and the others are earlier copies of it.
open_files <- names(runs)[!vapply(runs, function(one) one$completed, logical(1))]
open_bases <- vapply(open_files, base_of, character(1))
earlier <- character(0)
for (base in unique(open_bases[duplicated(open_bases)])) {
  same <- open_files[open_bases == base]
  held <- vapply(same, function(file) length(runs[[file]]$run$items %||% list()), numeric(1))
  for (file in same[-which.max(held)]) {
    grumble(file, "earlier partial of a run carried on", "dropped; the fullest partial is the run")
    earlier <- c(earlier, file)
  }
}
runs <- runs[!names(runs) %in% earlier]

# A test run its name did not give away, and synthetic runs, are not data either.
is_not_data <- vapply(runs, function(one) isTRUE(one$run$testMode) || !is.null(one$run$synthetic), logical(1))
if (!include_test && any(is_not_data)) {
  cat(sprintf("  %d test/synthetic run(s) left out (--include-test keeps them)\n", sum(is_not_data)))
  runs <- runs[!is_not_data]
}
if (length(runs) == 0) {
  cat("Nothing left once the test runs were dropped.\n")
}

# A pilot's run, by the version that wrote it. A file with no version, or one
# that does not read as one, is older than the field and goes with them. A
# synthetic run is not a pilot, whatever codebook it was written from.
before_release <- function(run) {
  if (!is.null(run$synthetic)) return(FALSE)
  version <- tryCatch(numeric_version(as.character(run$version %||% "")), error = function(e) NULL)
  is.null(version) || version < numeric_version(FIRST_RELEASE)
}
is_pilot <- vapply(runs, function(one) before_release(one$run), logical(1))
if (!include_pilot && any(is_pilot)) {
  cat(sprintf("  %d pilot run(s) from before %s left out (--include-pilot keeps them)\n", sum(is_pilot), FIRST_RELEASE))
  runs <- runs[!is_pilot]
}
if (length(runs) == 0) {
  cat("Nothing left once the pilot runs were dropped.\n")
}

versions <- unique(vapply(runs, function(one) as.character(one$run$version %||% NA), character(1)))
if (length(versions) > 1) {
  cat(sprintf("  NOTE: %d app versions here (%s) — read the changelog before pooling them\n",
              length(versions), paste(versions, collapse = ", ")))
}

# ---------------------------------------------------------------------------
# Who it was, taken out
# ---------------------------------------------------------------------------

# **The file this writes is the compiled, de-identified one the ethics
# application describes** (9.8), so what in a run points at a person is taken
# out here, on the run itself, before any table is made of it — and every table
# after agrees without knowing.
#
#   participant, account   one number in place of both ids, `S000001` on: the
#                          person's, out of the ledger below. A run whose
#                          participant id or hub account is in it already gets
#                          the number given then, so a retest, a retake from
#                          the hub's dashboard or a second go on the same SONA
#                          id is the same person's second row. `account` is
#                          not written: it is folded into this.
#   file                   the name rebuilt with the number in the id's place,
#                          and DataPipe's session suffix (`-<hex>`) dropped.
#   Demographics_BirthDay  with the month and the age, most of a date of
#                          birth: the item becomes `Demographics_StarSign`, the
#                          sign the day falls under (the cusps in
#                          `js/figures/theories.js`), or the words "I'd rather
#                          not say" where no day was given.
#
# **The ledger is `ids.csv` beside this script**: a row an id, with the number
# it was given and the field of the run it came in (`participant`, `account`).
# **A number once given is never moved.** Somebody new gets the next one, in
# the order their runs started, so a file that arrives late (one Zenodo would
# not serve until the next download) or a flag that keeps more runs
# (`--include-pilot`) adds numbers at the end instead of shifting the ones a
# table already holds: "S000012" means the same person next month. A number
# taken by a run that is no longer kept is a gap, and harms nothing. The ledger
# is git-ignored and lives in Dropbox with the raw files, so every machine reads
# the same numbers, and **it goes when the raw files go** (9.8): after that
# nobody can get from a number back to an id, which is the point. Until then,
# which raw file a number came from is a lookup in it. Only `raw/` is ledgered:
# `--from` another folder numbers its runs afresh and keeps nothing, and
# `--check` writes nothing, the ledger included.
#
# The free text (`*_Comments`, the "Other" and "in your own words" fields) is
# left as it was typed. The application promises it is *read*, and edited where
# it could identify anybody, before anything is published; no script can do the
# reading, so whatever publishes a file leaves those columns out or reviews them.

ledger_file <- if (is.na(from_at)) file.path(here, "ids.csv") else NA_character_
ledger <- if (!is.na(ledger_file) && file.exists(ledger_file)) {
  # Text throughout: a SONA id is all digits, and read as a number it would
  # match nothing read out of a run.
  utils::read.csv(ledger_file, colClasses = "character", na.strings = character(0))
} else {
  data.frame(participant = character(0), field = character(0), id = character(0), stringsAsFactors = FALSE)
}
ledgered <- nrow(ledger)
highest <- max(0L, suppressWarnings(as.integer(sub("^S", "", ledger$participant))), na.rm = TRUE)

# The person's number: the earliest the ledger holds for either id, else the
# next one. Both ids go in, so a later run that shares either finds it.
number <- function(run, file) {
  ids <- c(participant = as.character(run$participant %||% NA), account = as.character(run$account %||% NA))
  ids <- ids[!is.na(ids) & nzchar(ids)]
  at <- match(paste(names(ids), ids), paste(ledger$field, ledger$id))
  held <- sort(unique(ledger$participant[at[!is.na(at)]]))
  if (length(held) > 1) {
    grumble(file, "participant id and account under two numbers", sprintf("kept %s, not %s", held[1], paste(held[-1], collapse = ", ")))
  }
  if (length(held) == 0) {
    highest <<- highest + 1L
    held <- sprintf("S%06d", highest)
  }
  if (anyNA(at)) {
    ledger <<- rbind(ledger, data.frame(participant = held[1], field = names(ids)[is.na(at)], id = unname(ids[is.na(at)]),
                                        stringsAsFactors = FALSE))
  }
  held[1]
}

# `<when>_<source>_<id>[-<session>][.partial].json`: the id is the last place it
# stands in the name once the session suffix is off. A name it cannot be found
# in is made again out of the run's start and source, the way the app names a
# file, since `file` is what tells one person's runs apart.
renamed <- function(file, run, code) {
  bare <- sub("-[0-9a-f]+(\\.partial\\.json)$", "\\1", file)
  id <- as.character(run$participant %||% "")
  at <- if (nzchar(id)) gregexpr(id, bare, fixed = TRUE)[[1]] else -1
  if (at[1] < 0) {
    grumble(file, "participant id not in the file's name", "named again out of its start and source")
    return(paste0(format(when(run$timeStart), "%Y%m%dT%H%M%S"), "_", run$source %||% "Unknown", "_", code,
                  if (grepl("\\.partial\\.json$", file)) ".partial", ".json"))
  }
  last <- at[length(at)]
  paste0(substr(bare, 1, last - 1), code, substr(bare, last + nchar(id), nchar(bare)))
}

SIGNS <- c("Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini",
           "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius")
CUSPS <- c(20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22)  # the day a month's second sign begins

# Month m's first sign is SIGNS[m], its second SIGNS[m %% 12 + 1]. The month is
# saved as its name, the day as its number or as the words of declining it.
star_sign <- function(month, day) {
  if (is.null(day)) return(NULL)
  m <- match(as.character(month %||% NA), month.name)
  d <- suppressWarnings(as.integer(day))
  if (!is.na(m) && !is.na(d) && d >= 1 && d <= 31) {
    return(if (d < CUSPS[m]) SIGNS[m] else SIGNS[m %% 12 + 1])
  }
  if (is.na(d) && grepl("[A-Za-z]", day)) "I'd rather not say" else NA_character_
}

deidentify <- function(one, code) {
  run <- one$run
  one$file <- renamed(one$file, run, code)
  run$participant <- code
  run$account <- NULL
  keys <- vapply(run$items, function(item) as.character(item$key %||% NA), character(1))
  month <- run$items[keys %in% "Demographics_BirthMonth"]
  for (at in which(keys == "Demographics_BirthDay")) {
    run$items[[at]]$key <- "Demographics_StarSign"
    run$items[[at]]$response <- star_sign(if (length(month)) month[[1]]$response, run$items[[at]]$response)
  }
  one$run <- run
  one
}

# In the order the runs started, which is the order the people new to the
# ledger are numbered in, and the order of the rows; a run with no start last.
started <- vapply(runs, function(one) as.character(one$run$timeStart %||% NA), character(1))
runs <- runs[order(started, names(runs), na.last = TRUE)]
numbers <- vapply(runs, function(one) number(one$run, one$file), character(1))
runs <- Map(deidentify, runs, numbers)

# `file` is the row's key, so no two runs may share one: it would take two runs
# of one person named in the same second from the same source.
files <- vapply(runs, function(one) one$file, character(1))
for (file in unique(files[duplicated(files)])) grumble(file, "two runs under one name", "told apart by a suffix")
files <- make.unique(files, sep = "~")
for (n in seq_along(runs)) runs[[n]]$file <- files[n]

# ---------------------------------------------------------------------------
# One row a run
# ---------------------------------------------------------------------------

bind <- function(pieces) {
  pieces <- Filter(Negate(is.null), pieces)
  if (length(pieces) == 0) return(NULL)
  do.call(rbind, pieces)
}

run_fields <- bind(lapply(runs, function(one) run_row(one$run, one$file, one$completed)))
levels_table <- bind(lapply(runs, function(one) level_rows(one$run, one$file)))
responses <- bind(lapply(runs, function(one) response_rows(one$run, one$file)))
feedback <- bind(lapply(runs, function(one) named_rows(one$run, one$file, "feedback", "reading", "vote")))
ratings <- bind(lapply(runs, function(one) named_rows(one$run, one$file, "ratings", "level", "stars")))
choices <- bind(lapply(runs, function(one) choice_rows(one$run, one$file)))

if (is.null(run_fields)) stop("Nothing to write.", call. = FALSE)

rows_of <- run_fields$file

# A column of `table`'s `value`, one cell a run, looked up by `key`.
# Everything below is built out of this: a long table, a column of it, and the
# key that says which column it becomes.
spread_suffix <- function(table, key_column, value_column, keys, suffix) {
  out <- spread(table, key_column, value_column, keys, "")
  names(out) <- paste0(names(out), suffix)
  out
}

spread <- function(table, key_column, value_column, keys, prefix) {
  if (is.null(table)) return(list())
  out <- list()
  for (key in keys) {
    rows <- table[table[[key_column]] == key, c("file", value_column)]
    rows <- rows[!duplicated(rows$file), ]
    out[[paste0(prefix, tidy_name(key))]] <- rows[[value_column]][match(rows_of, rows$file)]
  }
  out
}

# A column name out of a key. The keys are already one word — `feedbackKeys()`
# sees to that — but a level is named for a person to read ("Mood & Health"),
# and a name with a space or an ampersand in it is a column an analysis has to
# quote every time it is mentioned.
tidy_name <- function(text) {
  text <- gsub("[^A-Za-z0-9]+", "_", text)
  gsub("(^_|_$)", "", text)
}

wide <- list()

# 1. The run: who, when, which version, how far they got.
for (column in names(run_fields)) {
  wide[[column]] <- run_fields[[column]]
}

# 2. **Nothing is worked out here that the file does not already say.** A mean
# reaction time, a share of an instrument answered, a count of failed attention
# checks over the whole run — all of them are one line of R away from the
# columns below, and which of them an analysis wants is the analysis's business.
# What this writes is what was recorded, reshaped: the app's own per-level
# quality control is here because the app measured it, and the per-item times
# are here because they are the two timestamps the file holds, subtracted.

# 3. The two orders, each as one cell rather than as a column apiece. **This is
# the one place the wide shape would otherwise lose something**: which levels
# somebody walked, and in which order they met the items, are facts about a
# sequence, and a row has one cell per item. Joined with the separator they can
# be split apart again, so nothing is lost and the file stays a table.
if (!is.null(levels_table)) {
  wide$levels_walked <- vapply(rows_of, function(file) {
    mine <- levels_table[levels_table$file == file, ]
    paste(mine$key[order(mine$level)], collapse = SEP)
  }, character(1), USE.NAMES = FALSE)
}
if (!is.null(responses)) {
  wide$order_walked <- vapply(rows_of, function(file) {
    rows <- responses[responses$file == file, ]
    paste(rows$key[order(rows$order)], collapse = SEP)
  }, character(1), USE.NAMES = FALSE)
}

# 4. The votes on each reading, and the stars each level's results were given.
# **The stars are keyed by the level's name and not its number**, since the
# order is drawn and partly chosen: `Rating_Level_5` would be a different level
# for every other person, where `Rating_Character` is the same thing for all of
# them.
if (!is.null(feedback)) {
  wide <- c(wide, spread(feedback, "reading", "vote", sort(unique(feedback$reading)), "Feedback_"))
}
if (!is.null(ratings)) {
  # **The app files these under the level's name**, so there is nothing to join:
  # the key is already the column. A file written before that keyed them
  # `Level_<N>`, and those are mapped through the run's own level list rather
  # than left as a column that means a different level in every row.
  old_style <- grepl("^Level_[0-9]+$", ratings$level)
  if (any(old_style) && !is.null(levels_table)) {
    nth <- suppressWarnings(as.numeric(sub("^Level_", "", ratings$level)))
    known <- unique(levels_table[, c("file", "level", "key")])
    at <- match(paste(ratings$file, nth), paste(known$file, known$level))
    ratings$level[old_style & !is.na(at)] <- known$key[at[old_style & !is.na(at)]]
  }
  wide <- c(wide, spread(ratings, "level", "stars", sort(unique(ratings$level)), "Rating_"))
}

# The quality control, per level and named for the level, on the same argument:
# three columns a level saying how it was answered.
if (!is.null(levels_table)) {
  for (key in sort(unique(levels_table$key))) {
    rows <- levels_table[levels_table$key == key, ]
    at <- match(rows_of, rows$file)
    stem <- paste0("QC_", tidy_name(key), "_")
    wide[[paste0(stem, "RT_Mean")]] <- rows$rt_mean_ms[at]
    wide[[paste0(stem, "RT_SD")]] <- rows$rt_sd_ms[at]
    wide[[paste0(stem, "ChecksFailed")]] <- rows$checks_failed[at]
    # Not out of `qualityControl` but out of the run's own `timeLevel<N>`: when
    # the level was last left with nothing outstanding. It sits in this family
    # because it is the fourth thing worth knowing about how a level went, and
    # it is named for what it is rather than `time_left`, which read as time
    # remaining.
    wide[[paste0(stem, "TimeFinished")]] <- rows$time_finished[at]
  }
}

# The fork choices, three columns a level screen that offered one, named for
# the screen the way its own column is: `Level_4_Offered` (keys, " | ", in the
# order the cards stood), `Level_4_Recommended` and `Level_4_Chosen`. The
# screen's own `Level_4` already holds what was taken, in the words on the
# card; these hold it as a key, beside what it was taken from. A number here
# is a place in one person's run, as it is in `Level_4` — which level was on
# offer is in the cells, not the name.
if (!is.null(choices)) {
  numbered <- unique(choices$screen)
  numbered <- numbered[order(suppressWarnings(as.numeric(sub("^Level_", "", numbered))))]
  for (screen in numbered) {
    for (field in c("offered", "recommended", "chosen")) {
      wide <- c(wide, spread_suffix(choices, "screen", field, screen, paste0("_", tools::toTitleCase(field))))
    }
  }
}

# 5. The answers themselves, a column an item, in the order they are *usually*
# met — the median of each item's `order`, since no one person's order is
# everybody's. The canonical order lives in `content/`.
item_keys <- character(0)
if (!is.null(responses)) {
  spot <- stats::aggregate(order ~ key, data = responses, FUN = stats::median, na.rm = TRUE)
  spot <- spot[order(spot$order), ]
  item_keys <- spot$key
  wide <- c(wide, spread(responses, "key", "response", item_keys, ""))

  # And the time each answer took, beside it — **a suffix, so that an item and
  # its time sort together** and a `_RT` is read as belonging to the column
  # before it. It doubles the width of the file, which is the point of a master
  # file: everything is in it, and what an analysis does not want it drops
  # rather than coming back here for it.
  wide <- c(wide, spread_suffix(responses, "key", "rt_ms", item_keys, "_RT"))
}

wide <- as.data.frame(wide, stringsAsFactors = FALSE, check.names = FALSE)

checks <- if (length(complaints) > 0) do.call(rbind, complaints) else
  data.frame(file = character(0), check = character(0), detail = character(0), stringsAsFactors = FALSE)

# ---------------------------------------------------------------------------
# Say what happened, and write
# ---------------------------------------------------------------------------

cat("\n")
cat(sprintf("  %-22s %d\n", "runs kept", length(runs)))
cat(sprintf("  %-22s %d finished, %d stopped partway\n", "of which",
            sum(run_fields$completed), sum(!run_fields$completed)))
taken <- table(run_fields$participant)
again <- names(taken)[taken > 1]
cat(sprintf("  %-22s %d%s\n", "participants", length(taken),
            if (length(again)) sprintf(", %d with more than one run (%s)", length(again), paste(again, collapse = ", ")) else ""))
if (!is.na(ledger_file)) {
  cat(sprintf("  %-22s %d id(s), %d new%s\n", basename(ledger_file), nrow(ledger), nrow(ledger) - ledgered,
              if (check_only && nrow(ledger) > ledgered) " (not kept: --check)" else ""))
}
if (!is.null(responses)) {
  # Counted here to be said out loud and nowhere else: this is not a column of
  # the file, it is how the runs looked going past.
  answered <- responses[!is.na(responses$response) & !grepl("^Level_", responses$key), ]
  each <- table(answered$file)
  if (length(each) > 0) {
    cat(sprintf("  %-22s %s\n", "items answered", paste(range(each), collapse = " to ")))
  }
}
cat(sprintf("  %-22s %d rows x %d columns\n", "data.csv", nrow(wide), ncol(wide)))

if (nrow(checks) > 0) {
  cat(sprintf("\n  %d thing(s) to look at:\n", nrow(checks)))
  for (n in seq_len(nrow(checks))) {
    cat(sprintf("    %-44s %s%s\n", checks$file[n], checks$check[n],
                if (nzchar(checks$detail[n])) paste0(" (", checks$detail[n], ")") else ""))
  }
} else {
  cat("\n  Every file was what it claimed to be.\n")
}

if (check_only) {
  cat("\n--check: nothing written.\n")
} else {
  dir.create(clean_dir, showWarnings = FALSE, recursive = TRUE)
  written <- c()
  # **`NA` and `""` are written differently, on purpose.** An item that was never
  # put on screen — a branch that did not open for this person — is NA; an
  # optional item that *was* shown and deliberately left blank is the empty
  # string, which is what the app saves for it. Writing NA as "" would make a
  # question nobody was asked look like one somebody declined to answer.
  put <- function(table, name) {
    if (is.null(table)) return(invisible(NULL))
    path <- file.path(clean_dir, name)
    utils::write.csv(table, path, row.names = FALSE)
    written <<- c(written, sprintf("%s (%d rows)", name, nrow(table)))
  }
  put(wide, "data.csv")
  # The long form is the same answers one row an item, which is what a mixed
  # model or a per-item plot wants and what `data.csv` folds into cells.
  if (also_long) put(responses, "responses.csv")

  # Anything this run did not write is from an older one and no longer agrees
  # with what is beside it — a `responses.csv` left over from a `--long` run is
  # a table of a different set of participants sitting next to `data.csv`
  # looking current. It goes.
  ours <- vapply(strsplit(written, " ", fixed = TRUE), function(bits) bits[1], character(1))
  there <- list.files(clean_dir)
  stale <- setdiff(there[endsWith(there, ".csv")], ours)
  for (name in stale) {
    unlink(file.path(clean_dir, name))
    cat(sprintf("  removed %s, left over from an earlier run
", name))
  }
  cat("\nWritten to ", clean_dir, ":\n", sep = "")
  for (line in written) cat("  ", line, "\n", sep = "")

  # Written last, and only with something new in it: a number given to a run
  # whose tables were never written would be a gap, and harmless, but there is
  # no reason to make one.
  if (!is.na(ledger_file) && nrow(ledger) > ledgered) {
    utils::write.csv(ledger, ledger_file, row.names = FALSE)
    cat(sprintf("\n%s: %d new id(s), kept with the raw files and never to be committed.\n",
                ledger_file, nrow(ledger) - ledgered))
  }
  cat("\nParticipant data: not to be committed.\n")
}

# ---------------------------------------------------------------------------
# What this script cannot do, and what would fix it
# ---------------------------------------------------------------------------
#
# 1. THE ANSWERS ARE WORDS, AND THAT IS THE POINT. A saved file holds what was
#    on screen ("Male", "Strongly agree", "-3") rather than the number behind
#    it, so that it reads without a codebook beside it — see **Saved data** in
#    `AGENTS.md`. Nothing here turns them back into numbers, and nothing should:
#    that is a scoring decision and it belongs to the analysis, which can map
#    them through `data/synthetic/codebook.js` if it ever wants the values.
#
# 2. NOTHING INSIDE A PARTIAL SAYS IT IS ONE. `completed` here is read off the
#    filename, so a file renamed on the way past loses it. A `finished: false`
#    in the container would carry it in the data itself. This is the one of
#    these five that is a defect rather than a decision.
#
# 3. LEVELS ARE THE EXPERIENCE, NOT THE DATA. A level is how the run is paced
#    and dressed for the person taking it; its number is drawn and partly
#    chosen, so it means nothing across people. `levels.csv` is there for
#    reading a level number back where one turns up, and for the per-level
#    quality control. **What to group by instead**: `questionnaire`, which every
#    item now carries, and `order`, which is where that item fell for that
#    person. `completion.csv` is that grouping already done.
#
# 4. THE ITEM ORDER IS PER RUN, and that is what `order` is for: the run is
#    shuffled and forked, so two people met the same item in different places.
#    The wide table's column order is the median of it — a convenience, not a
#    canonical order, which lives in `content/`.
#
# 5. `clean/` IS DE-IDENTIFIED BUT FOR THE FREE TEXT. The platform's id and the
#    day of birth are taken out here (see **Who it was, taken out**); the free
#    text is not, since the ethics application promises it is read before it
#    is published and a script cannot read. Whatever publishes a file made out
#    of this one leaves the free-text columns out, or publishes them reviewed.
