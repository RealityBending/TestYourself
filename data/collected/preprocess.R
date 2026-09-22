# Turns what `download.py` has pulled off Zenodo into tables an analysis can
# read, and says whether the files are what they claim to be.
#
#   Rscript data/collected/preprocess.R                 # raw/ -> clean/
#   Rscript data/collected/preprocess.R --check         # check only, write nothing
#   Rscript data/collected/preprocess.R --include-test  # keep the test runs in
#   Rscript data/collected/preprocess.R --long          # the long table as well
#   Rscript data/collected/preprocess.R --from data/synthetic/out
#
# {jsonlite} and nothing else: the rest is base R, the way `make_norms.R` is.
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
# WHAT IS WRITTEN, into `clean/`: **one file, one row a participant.**
# Anything that is not data — what was read, what looked wrong — is **said and
# not filed**: a `checks.csv` that is empty nine times out of ten is a file
# somebody has to open to learn nothing. The complaints go to the terminal, where
# whoever ran the script is already looking.
#
#   data.csv     **the master file**: everything the saved run says, across
#                roughly 720 columns, one row a participant. Nothing is left
#                out to keep it narrow and **nothing is worked out that the
#                file does not already say** — no mean reaction time, no share
#                of an instrument completed, no count of failed checks over the
#                run, no item counts, no minutes taken. All of those are a
#                line of R away from what is here, and which of them an
#                analysis wants is the analysis's business. What this does is
#                reshape: many files of records into one table of people.
#
#                  the run       participant, file, completed, version,
#                                test_mode, synthetic, battery, format_mint,
#                                time_start
#                  sequences     levels_walked, order_walked (see below)
#                  feedback_*    one a reading: agree, disagree or nothing
#                  rating_*      one a level: the stars its results were given
#                  qc_*          four a level: rt mean and sd, attention checks
#                                failed, and when it was left
#                  <item key>    one a question, holding the words that were
#                                on screen
#                  <item key>_rt one a question, holding what that answer took
#
#                **The level columns are named for the level, not numbered** —
#                `rating_Character`, `qc_Character_rt_mean_ms` — and **the app
#                writes them that way**: `ratings` and `qualityControl` are
#                keyed by name in the saved file, so nothing here recovers a
#                name by joining. A number would be a different level in every
#                row, the order being drawn and partly chosen.
#
# **The two sequence columns are how a wide file keeps what a wide file cannot
# hold.** Which levels somebody walked, and the order they met the items in, are
# facts about a sequence, and a row has one cell per item — so they are joined
# with " | " into one cell each and split apart again when wanted. Nothing is
# lost, and the alternative (a column per item saying where it fell) would have
# doubled an already wide file for something most analyses never look at.
#
# One flag adds a second file:
#
#   --long        also writes responses.csv, the same answers one row an item,
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
# WHAT IT REFUSES TO DO. It does not score anything, and it does not turn the
# words back into the numbers they were answered on — see the notes at the
# foot. It also keeps test and synthetic runs out of `clean/` unless asked
# (`--include-test`), since neither is data.

SEP <- " | "  # what a multi-answer's choices are joined with in a cell

args <- commandArgs(trailingOnly = TRUE)
check_only <- "--check" %in% args
include_test <- "--include-test" %in% args
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
participant_rows <- function(run, file, completed) {
  data.frame(
    participant = as.character(run$participant %||% NA),
    file = file,
    completed = completed,
    version = as.character(run$version %||% NA),
    test_mode = isTRUE(run$testMode),
    synthetic = !is.null(run$synthetic),
    battery = as.character(run$battery %||% NA),
    format_mint = as.character(run$formatMint %||% NA),
    time_start = as.character(run$timeStart %||% NA),
    stringsAsFactors = FALSE
  )
}

level_rows <- function(run, file) {
  levels <- run$levels %||% list()
  if (length(levels) == 0) return(NULL)
  held <- run$qualityControl %||% list()
  do.call(rbind, lapply(seq_along(levels), function(n) {
    # Keyed by the level's name since September 2026, and by `level<N>` in
    # files written before that; both are read so an old file still opens.
    name <- as.character(levels[[n]]$name %||% NA)
    quality <- held[[name]] %||% held[[paste0("level", n)]]
    data.frame(
      participant = as.character(run$participant %||% NA),
      level = n,
      name = name,
      blocks = paste(unlist(levels[[n]]$blocks %||% list()), collapse = SEP),
      time_left = as.character(run[[paste0("timeLevel", n)]] %||% NA),
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

named_rows <- function(run, field, name_column, value_column) {
  held <- run[[field]] %||% list()
  if (length(held) == 0) return(NULL)
  out <- data.frame(
    participant = as.character(run$participant %||% NA),
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

# Test and synthetic runs are not data and are kept out unless asked for.
is_not_data <- vapply(runs, function(one) isTRUE(one$run$testMode) || !is.null(one$run$synthetic), logical(1))
if (!include_test && any(is_not_data)) {
  cat(sprintf("  %d test/synthetic run(s) left out (--include-test keeps them)\n", sum(is_not_data)))
  runs <- runs[!is_not_data]
}
if (length(runs) == 0) {
  cat("Nothing left once the test runs were dropped.\n")
}

# One participant code twice is either a code that came round on a `?sub=` link
# or two files of one person; either way it wants looking at before counting.
codes <- vapply(runs, function(one) as.character(one$run$participant %||% NA), character(1))
for (code in unique(codes[duplicated(codes)])) {
  grumble(paste(names(runs)[codes == code], collapse = ", "), "participant code in more than one file", code)
}

versions <- unique(vapply(runs, function(one) as.character(one$run$version %||% NA), character(1)))
if (length(versions) > 1) {
  cat(sprintf("  NOTE: %d app versions here (%s) — read the changelog before pooling them\n",
              length(versions), paste(versions, collapse = ", ")))
}

# ---------------------------------------------------------------------------
# One row a participant
# ---------------------------------------------------------------------------

bind <- function(pieces) {
  pieces <- Filter(Negate(is.null), pieces)
  if (length(pieces) == 0) return(NULL)
  do.call(rbind, pieces)
}

participants <- bind(lapply(runs, function(one) participant_rows(one$run, one$file, one$completed)))
levels_table <- bind(lapply(runs, function(one) level_rows(one$run, one$file)))
responses <- bind(lapply(runs, function(one) response_rows(one$run, one$file)))
feedback <- bind(lapply(runs, function(one) named_rows(one$run, "feedback", "reading", "vote")))
ratings <- bind(lapply(runs, function(one) named_rows(one$run, "ratings", "level", "stars")))

if (is.null(participants)) stop("Nothing to write.", call. = FALSE)

who <- participants$participant

# A column of `table`'s `value`, one cell a participant, looked up by `key`.
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
    rows <- table[table[[key_column]] == key, c("participant", value_column)]
    rows <- rows[!duplicated(rows$participant), ]
    out[[paste0(prefix, tidy_name(key))]] <- rows[[value_column]][match(who, rows$participant)]
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

wide <- list(participant = who)

# 1. The run: who, when, which version, how far they got.
for (column in setdiff(names(participants), "participant")) {
  wide[[column]] <- participants[[column]]
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
  walked <- vapply(who, function(code) {
    mine <- levels_table[levels_table$participant == code, ]
    paste(mine$name[order(mine$level)], collapse = SEP)
  }, character(1))
  wide$levels_walked <- walked
}
if (!is.null(responses)) {
  wide$order_walked <- vapply(who, function(code) {
    rows <- responses[responses$participant == code, ]
    paste(rows$key[order(rows$order)], collapse = SEP)
  }, character(1))
}

# 4. The votes on each reading, and the stars each level's results were given.
# **The stars are keyed by the level's name and not its number**, since the
# order is drawn and partly chosen: `rating_Level_5` would be a different level
# for every other person, where `rating_Character` is the same thing for all of
# them.
if (!is.null(feedback)) {
  wide <- c(wide, spread(feedback, "reading", "vote", sort(unique(feedback$reading)), "feedback_"))
}
if (!is.null(ratings)) {
  # **The app files these under the level's name**, so there is nothing to join:
  # the key is already the column. A file written before that keyed them
  # `Level_<N>`, and those are mapped through the run's own level list rather
  # than left as a column that means a different level in every row.
  old_style <- grepl("^Level_[0-9]+$", ratings$level)
  if (any(old_style) && !is.null(levels_table)) {
    number <- suppressWarnings(as.numeric(sub("^Level_", "", ratings$level)))
    known <- unique(levels_table[, c("participant", "level", "name")])
    at <- match(paste(ratings$participant, number), paste(known$participant, known$level))
    ratings$level[old_style & !is.na(at)] <- known$name[at[old_style & !is.na(at)]]
  }
  wide <- c(wide, spread(ratings, "level", "stars", sort(unique(ratings$level)), "rating_"))
}

# The quality control, per level and named for the level, on the same argument:
# three columns a level saying how it was answered.
if (!is.null(levels_table)) {
  for (name in sort(unique(levels_table$name))) {
    rows <- levels_table[levels_table$name == name, ]
    at <- match(who, rows$participant)
    stem <- paste0("qc_", tidy_name(name), "_")
    wide[[paste0(stem, "rt_mean_ms")]] <- rows$rt_mean_ms[at]
    wide[[paste0(stem, "rt_sd_ms")]] <- rows$rt_sd_ms[at]
    wide[[paste0(stem, "checks_failed")]] <- rows$checks_failed[at]
    wide[[paste0(stem, "time_left")]] <- rows$time_left[at]
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
  # its time sort together** and a `_rt` is read as belonging to the column
  # before it. It doubles the width of the file, which is the point of a master
  # file: everything is in it, and what an analysis does not want it drops
  # rather than coming back here for it.
  wide <- c(wide, spread_suffix(responses, "key", "rt_ms", item_keys, "_rt"))
}

wide <- as.data.frame(wide, stringsAsFactors = FALSE, check.names = FALSE)

checks <- if (length(complaints) > 0) do.call(rbind, complaints) else
  data.frame(file = character(0), check = character(0), detail = character(0), stringsAsFactors = FALSE)

# ---------------------------------------------------------------------------
# Say what happened, and write
# ---------------------------------------------------------------------------

cat("\n")
cat(sprintf("  %-22s %d\n", "runs kept", length(runs)))
if (!is.null(participants)) {
  cat(sprintf("  %-22s %d finished, %d stopped partway\n", "of which",
              sum(participants$completed), sum(!participants$completed)))
}
if (!is.null(responses)) {
  # Counted here to be said out loud and nowhere else: this is not a column of
  # the file, it is how the runs looked going past.
  answered <- responses[!is.na(responses$response) & !grepl("^Level_", responses$key), ]
  each <- table(answered$participant)
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
#    these four that is a defect rather than a decision.
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
