# Prints the norms that can be worked out from data, in the shape `content/`
# wants them, so that the app's numbers can always be traced to a source rather
# than to somebody's transcription of a PDF.
#
# Almost every `norms` block in `content/` is an invented placeholder, flagged
# as such where it is written. Two are not, and this script is where they come
# from — one section each, independent of one another, so that a missing package
# or a dropped network connection costs you the other section and not both:
#
#   1. THE HiTOP-BR (`content/block_hitop.js`) — the means and SDs of the
#      instrument's own development sample, printed in Table 1 of Simms et al.
#      (2026) and shipped in the {hitop} package as `hitopbr_devstats`.
#
#   2. THE MINT (`content/block_mint.js`) — worked out from the raw answers of
#      the studies that have asked it, pulled straight from their repositories
#      and scored exactly the way the app scores them.
#
# Run it, and paste the two number lines each section prints over the two
# already in the block file it names. Both sections print the numbers and
# nothing else: the `interpretations` beside them are the app's own prose, and a
# block that carried them would sooner or later paste an old one back over a
# newer one.
#
# Nothing in the app reaches for this file, or for R at all — this folder is a
# workbench, not part of the page.

# The indentation `mean:` and `sd:` sit at inside a `norms` block, so that what
# is printed can be pasted in without being reformatted afterwards.
PASTE_INDENT <- strrep(" ", 16)

# One dimension's two lines, under a heading saying which dimension they are
# and where the number came from.
paste_lines <- function(dimension, mean, sd, from = NULL) {
  cat("  ", dimension, if (is.null(from)) "" else paste0("   (", from, ")"), "\n", sep = "")
  cat(sprintf("%smean: %.2f,\n", PASTE_INDENT, mean))
  cat(sprintf("%ssd: %.2f,\n\n", PASTE_INDENT, sd))
}

rule <- function(title) {
  cat("\n", strrep("=", 74), "\n", title, "\n", strrep("=", 74), "\n\n", sep = "")
}

# ===========================================================================
# 1. THE HiTOP-BR, from the {hitop} package
# ===========================================================================

rule("HiTOP-BR  ->  content/block_hitop.js")

# Installing a package behind somebody's back is worse than telling them, so
# this says the one line that fixes it and leaves the MINT section to run.
if (!requireNamespace("hitop", quietly = TRUE)) {
  cat("SKIPPED: the {hitop} package is not installed. Install it with\n\n")
  cat('    pak::pak("jmgirard/hitop")\n\n')
  cat("(or remotes::install_github(\"jmgirard/hitop\")) and run this again.\n")
} else {
  devstats <- as.data.frame(hitop::hitopbr_devstats)

  for (column in c("Scale", "nItems", "mean", "sd")) {
    if (!column %in% names(devstats)) {
      stop(
        "hitopbr_devstats has no `", column, "` column any more — the package's ",
        "table has been restructured, and this script wants rewriting against it.",
        call. = FALSE
      )
    }
  }

  # The app renames the six spectra for the people answering them: the HiTOP's
  # own names are clinical jargon, and two of them read as verdicts handed back
  # to somebody who has just described themselves. The mapping is one for one,
  # so nothing about the scoring changes — see the comment above the norms in
  # `content/block_hitop.js`, which this has to agree with. In the app's own
  # order, which is the order they are written in that file.
  renamed <- c(
    "Somatoform" = "Bodily Complaints",
    "Internalizing" = "Emotional Distress",
    "Thought Disorder" = "Unusual Experiences",
    "Detachment" = "Social Withdrawal",
    "Disinhibition" = "Impulsivity",
    "Antagonism" = "Dominance"
  )

  cat("Development-sample statistics, from {hitop} ", as.character(utils::packageVersion("hitop")), "\n", sep = "")
  cat("(Simms et al., 2026, Table 1 — N = 780, scores are item means on the 1-4 coding)\n\n")

  # Every scale the package prints, not only the six the app uses: a number that
  # has quietly changed between versions is easier to notice beside the others.
  cat(sprintf("  %-18s %6s %8s %8s\n", "SCALE", "ITEMS", "MEAN", "SD"))
  for (at in order(devstats$Scale)) {
    cat(sprintf(
      "  %-18s %6d %8.2f %8.2f\n",
      devstats$Scale[at], as.integer(devstats$nItems[at]), devstats$mean[at], devstats$sd[at]
    ))
  }
  cat("\n")

  # A scale the package has renamed would otherwise be dropped in silence, and
  # the app would keep whatever numbers it already had under the old name.
  missing <- setdiff(names(renamed), devstats$Scale)
  if (length(missing) > 0) {
    stop(
      "These scales are not in hitopbr_devstats: ", paste(missing, collapse = ", "), ".\n",
      "The package's names are: ", paste(sort(devstats$Scale), collapse = ", "), ".\n",
      "Fix the mapping in this script and in content/block_hitop.js together.",
      call. = FALSE
    )
  }

  cat("Paste into the `norms` of `hitopbr` in content/block_hitop.js\n")
  cat("(the two number lines only — leave each `interpretations` where it is):\n\n")

  for (scale in names(renamed)) {
    at <- match(scale, devstats$Scale)
    paste_lines(renamed[[scale]], devstats$mean[at], devstats$sd[at], paste0("HiTOP: ", scale))
  }

  # Two of the eight cut across the six rather than sitting beside them, and an
  # item in the app carries one dimension, so both are left to analysis time —
  # the way the SSS-8's sum is. They are printed in the table above for
  # provenance and have no norms to paste anywhere.
  spare <- setdiff(devstats$Scale, names(renamed))
  if (length(spare) > 0) {
    cat("Not asked as dimensions in the app (they cut across the six, and are\n")
    cat("left to analysis time): ", paste(sort(spare), collapse = ", "), "\n", sep = "")
  }
}

# ===========================================================================
# 2. THE MINT, from the studies that have asked it
# ===========================================================================

rule("MINT  ->  content/block_mint.js")

# STUDY 1 IS THE ODD ONE, and this table is what lets it in. Its columns are
# named for the pilot's own six candidate constructs crossed with seven organs
# (`Accuracy_Gastric_Q1`, `Confusion_Cardiac_Q1`), so nothing in the name says
# which MINT item it became — the pool was cut from 128 items to 33 and
# regrouped into three dimensions afterwards. What does say it is the wording,
# which barely changed: every one of the app's 33 items is in study 1 word for
# word, and the mapping below was made by matching the app's `text` against the
# item bank in the experiment's own source,
#
#   github.com/RealityBending/InteroceptionScale/blob/main/study1/experiment/intero.js
#
# ignoring case, punctuation and the examples in brackets. All 33 matched
# exactly, and no two of the app's items matched the same column. It is written
# out one line at a time rather than worked out here, because a mapping between
# two instruments is a fact about them and wants to be readable and checkable —
# not the output of a fuzzy match run again on every use.
#
# The last line is the attention check. Study 1 asks eight of them, one per
# construct, and they want different answers: this is the one that asks for the
# left of the scale, which is the app's own `MINT_AttentionCheck` almost word
# for word. The other seven are left alone, so that this sample is filtered on
# the same single check as the others rather than on a stricter bar.
MINT_STUDY1 <- c(
  MINT_ExAc_1 = "Accuracy_Gastric_Q1",
  MINT_ExAc_2 = "Accuracy_State_Q2",
  MINT_ExAc_3 = "Accuracy_Gastric_Q2",
  MINT_RelA_4 = "Sensitivity_State_Q2",
  MINT_RelA_5 = "Sensitivity_State_Q1",
  MINT_RelA_6 = "Sensitivity_State_Q3",
  MINT_SexS_7 = "Sexual_Genital_Q2",
  MINT_SexS_8 = "Nociception_Genital_Q1",
  MINT_SexS_9 = "Sexual_Genital_Q1",
  MINT_CaCo_10 = "Confusion_Respiratory_Q1",
  MINT_CaCo_11 = "Nociception_Respiratory_Q2",
  MINT_CaCo_12 = "Confusion_Cardiac_Q1",
  MINT_Urin_13 = "Accuracy_ColonBladder_Q5",
  MINT_Urin_14 = "Accuracy_ColonBladder_Q1",
  MINT_Urin_15 = "Confusion_ColonBladder_Q1",
  MINT_Derm_16 = "Sensitivity_SkinThermo_Q1",
  MINT_Derm_17 = "Sensitivity_SkinThermo_Q7",
  MINT_Derm_18 = "Sensitivity_SkinThermo_Q2",
  MINT_Sati_19 = "Accuracy_Gastric_Q6",
  MINT_Sati_20 = "Confusion_Gastric_Q2",
  MINT_Sati_21 = "Accuracy_Gastric_Q4",
  MINT_Olfa_22 = "Sensitivity_SkinThermo_Q5",
  MINT_Olfa_23 = "Sensitivity_Gastric_Q4",
  MINT_Olfa_24 = "Sensitivity_Gastric_Q5",
  MINT_Resp_25 = "Sensitivity_Respiratory_Q1",
  MINT_Resp_26 = "Sensitivity_Respiratory_Q3",
  MINT_Resp_27 = "Sensitivity_Respiratory_Q4",
  MINT_Card_28 = "Sensitivity_Cardiac_Q1",
  MINT_Card_29 = "Sensitivity_Cardiac_Q2",
  MINT_Card_30 = "Sensitivity_Cardiac_Q3",
  MINT_Gast_31 = "Sensitivity_Gastric_Q2",
  MINT_Gast_32 = "Sensitivity_Gastric_Q1",
  MINT_Gast_33 = "Sensitivity_Gastric_Q3",
  MINT_AttentionCheck = "Accuracy_Respiratory_A"
)

# The MINT has no published norms to copy, but it has been asked of a good many
# people already, and those answers are public. These are the studies that
# carry it, oldest first; every one of them is on the same 0-6 response coding
# the app uses, which is checked below rather than assumed. A source with an
# `alias` has its columns renamed to the app's own item keys before anything
# else happens to them, which is all study 1 needs to be scored beside the
# rest.
MINT_SOURCES <- list(
  "InteroceptionScale study 1" = list(
    url = "https://raw.githubusercontent.com/RealityBending/InteroceptionScale/main/study1/data/data_participants.csv",
    alias = MINT_STUDY1
  ),
  "InteroceptionScale study 2" = list(
    url = "https://raw.githubusercontent.com/RealityBending/InteroceptionScale/main/study2/data/data_participants.csv"
  ),
  "FakeArt" = list(
    url = "https://raw.githubusercontent.com/RealityBending/FakeArt/main/data/data_participants.csv"
  ),
  "FakeChat" = list(
    url = "https://raw.githubusercontent.com/RealityBending/FakeChat/main/data/rawdata_participants.csv"
  )
)

# How the app scores the MINT, and the whole of what this section needs to know
# about it: three dimensions, each a set of facets, three items to a facet.
# It has to agree with `content/block_mint.js` — the dimension names are the
# keys of its `norms`, and the facets are the middles of its item keys
# (`MINT_ExAc_1`, `MINT_Derm_18`).
MINT_FACETS <- list(
  "Bodily Awareness" = c("ExAc", "RelA", "SexS"),
  "Bodily Sensitivity" = c("Resp", "Card", "Gast"),
  "Bodily Clarity" = c("CaCo", "Urin", "Derm", "Sati", "Olfa")
)

# Every item of Bodily Clarity is written `reverse: true` in the app: the
# statements ask about sensitivity and confusion, and clarity is their other
# end. The turn is linear, so doing it once to the dimension score is the same
# number as doing it to each item first, which is what lets a dataset that
# publishes only facet means (FakeArt) be scored the same way as one that
# publishes items.
MINT_REVERSED <- "Bodily Clarity"
MINT_RANGE <- c(0, 6)

# The one answer the app's own attention check will accept
# (`MINT_AttentionCheck`, `check: 0` in `content/block_mint.js`): the extreme
# left of the scale. Norms should come from people who were reading, and these
# files are not filtered on it — a third of one of them fails.
MINT_CHECK_IS <- 0

# A facet's columns, whatever the file calls them. The three shapes in the wild
# are the app's own item keys (`MINT_ExAc_1`), the development pool's longer
# ones, which carry the dimension the item was written for and its number in
# that pool (`MINT_Awareness_ExAc_35`), and a facet mean already worked out
# (`MINT_ExAc`). One pattern covers all three, and the facet tag in the middle
# is what is actually being matched on.
facet_columns <- function(names, facet) {
  grep(paste0("^MINT_(Awareness_|Deficit_|Sensitivity_)?", facet, "(_[0-9]+)?$"), names, value = TRUE)
}

# One row per person, one column per dimension, scored the app's way: the mean
# of a facet's items, then the mean of the dimension's facets, then the turn if
# the dimension is a reversed one. Averaging the facets rather than the items
# keeps each facet's weight the same wherever the item counts differ, and where
# they do not — they are three apiece throughout — it is the same number.
score_mint <- function(data, label) {
  found <- lapply(MINT_FACETS, function(facets) {
    stats::setNames(lapply(facets, function(facet) facet_columns(names(data), facet)), facets)
  })

  scores <- list()
  for (dimension in names(MINT_FACETS)) {
    columns <- found[[dimension]]
    empty <- names(columns)[lengths(columns) == 0]

    # A facet that is not in the file would otherwise be dropped in silence,
    # and the dimension would come out as the mean of whatever was left.
    if (length(empty) > 0) {
      cat(sprintf(
        "  %-28s %-20s no columns for %s — this dimension is left out\n",
        label, dimension, paste(empty, collapse = ", ")
      ))
      next
    }

    facet_means <- vapply(columns, function(cols) {
      block <- data[, cols, drop = FALSE]
      block[] <- lapply(block, function(x) suppressWarnings(as.numeric(as.character(x))))
      rowMeans(block, na.rm = FALSE)
    }, numeric(nrow(data)))

    value <- rowMeans(facet_means, na.rm = FALSE)
    if (dimension == MINT_REVERSED) value <- sum(MINT_RANGE) - value
    scores[[dimension]] <- value
  }

  as.data.frame(scores, check.names = FALSE)
}

pooled <- list()

for (label in names(MINT_SOURCES)) {
  source <- MINT_SOURCES[[label]]

  data <- tryCatch(
    utils::read.csv(source$url, check.names = FALSE, stringsAsFactors = FALSE),
    error = function(e) {
      cat(sprintf("  %-28s could not be read: %s\n", label, conditionMessage(e)))
      NULL
    }
  )
  if (is.null(data)) next

  # A file whose columns are named for another instrument's structure comes in
  # through its alias table and leaves under the app's own item keys, which is
  # the first of the shapes `facet_columns()` matches. Everything downstream is
  # then the same for every source.
  if (!is.null(source$alias)) {
    gone <- source$alias[!source$alias %in% names(data)]
    if (length(gone) > 0) {
      stop(
        label, " no longer has these columns: ", paste(gone, collapse = ", "), ".\n",
        "The alias table in this script is out of date, and scoring a dimension ",
        "off the items that happen to be left would be a wrong number rather ",
        "than a missing one.",
        call. = FALSE
      )
    }
    data <- data[, source$alias, drop = FALSE]
    names(data) <- names(source$alias)
  }

  everyone <- nrow(data)

  # The check where the file carries one; where it does not, the file as given,
  # which the count printed below says plainly enough.
  check <- grep("^MINT_AttentionCheck$", names(data), value = TRUE)
  if (length(check) == 1) {
    passed <- suppressWarnings(as.numeric(as.character(data[[check]]))) == MINT_CHECK_IS
    data <- data[!is.na(passed) & passed, , drop = FALSE]
  }

  scores <- score_mint(data, label)
  if (ncol(scores) == 0) next

  # A file on a different response coding would pass through everything above
  # and come out as a plausible-looking wrong number, so it is stopped here.
  outside <- vapply(scores, function(x) any(x < MINT_RANGE[1] | x > MINT_RANGE[2], na.rm = TRUE), logical(1))
  if (any(outside)) {
    stop(
      label, " has MINT scores outside ", MINT_RANGE[1], "-", MINT_RANGE[2],
      " (", paste(names(scores)[outside], collapse = ", "), ").\n",
      "It is not on the response coding the app uses, and pooling it would ",
      "quietly mix two scales into one number.",
      call. = FALSE
    )
  }

  scores$Source <- label
  scores$Checked <- length(check) == 1
  pooled[[label]] <- scores

  cat(sprintf(
    "  %-28s n = %-5d of %-5d %s\n", label, nrow(data), everyone,
    if (length(check) == 1) "(the rest failed the attention check)" else "(no attention check in the file)"
  ))
}

if (length(pooled) == 0) {
  cat("\nSKIPPED: none of the sources could be read. Check the network, or the\n")
  cat("URLs above if a repository has moved.\n\n")
} else {
  all_scores <- do.call(rbind, lapply(pooled, function(one) {
    for (dimension in names(MINT_FACETS)) if (!dimension %in% names(one)) one[[dimension]] <- NA_real_
    one[, c(names(MINT_FACETS), "Source", "Checked")]
  }))

  cat(sprintf("\n  %-28s n = %d pooled\n\n", "TOTAL", nrow(all_scores)))

  # Per source as well as pooled: three samples averaged into one number can
  # hide one of them sitting well away from the others, and a dimension that
  # does is worth knowing about before its norms go into the app.
  for (dimension in names(MINT_FACETS)) {
    cat("  ", dimension, "\n", sep = "")
    cat(sprintf("      %-28s %8s %8s %8s\n", "SOURCE", "MEAN", "SD", "N"))
    for (label in c(names(pooled), "POOLED")) {
      value <- if (label == "POOLED") all_scores[[dimension]] else all_scores[[dimension]][all_scores$Source == label]
      value <- value[!is.na(value)]
      if (length(value) < 2) next
      cat(sprintf("      %-28s %8.2f %8.2f %8d\n", label, mean(value), stats::sd(value), length(value)))
    }
    cat("\n")
  }

  cat("Paste into the `norms` of `mint` in content/block_mint.js\n")
  cat("(the two number lines only — leave each `interpretations` where it is),\n")
  cat("and take the PLACEHOLDER warning off them while you are there:\n\n")

  for (dimension in names(MINT_FACETS)) {
    value <- all_scores[[dimension]][!is.na(all_scores[[dimension]])]
    if (length(value) < 2) {
      cat("  ", dimension, "   (no source carried it)\n\n", sep = "")
      next
    }
    paste_lines(dimension, mean(value), stats::sd(value), sprintf("n = %d", length(value)))
  }

  cat("These are a pooled convenience sample of online studies, not a norming\n")
  cat("sample of anybody in particular — better than the invented numbers they\n")
  cat("replace, and still worth saying so beside them in the block file.\n")
}

# ---------------------------------------------------------------------------
# Norms of our own, once this study has run.
#
# The HiTOP-BR's numbers above are a *development* sample, not a norming one,
# and every spectrum piles up near its floor of 1 — which is why the app's
# comment says the percentiles it reads them through are coarse at the low end.
# Once the study has run, the same figures can be worked out from its own
# answers: the saved files carry the items under the package's own numbers
# with the app's prefix (`HITOP_01`..`HITOP_45`; `HBR_nn` in files written
# before September 2026), in instrument order, so they go into
# `score_hitopbr()` once the columns are renamed `HBR_nn`.
#
#   answers <- ...                     # one row per participant, renamed to HBR_01..HBR_45
#   scores <- hitop::score_hitopbr(answers, items = 1:45, append = FALSE)
#   round(sapply(scores, mean, na.rm = TRUE), 2)
#   round(sapply(scores, stats::sd, na.rm = TRUE), 2)
#
# Those columns come out named `hbr_` plus the scale's camelCase name, not the
# app's dimension names, so `renamed` above is still what maps one to the other.
#
# The MINT wants nothing new at all: the saved files carry `MINT_ExAc_1` and the
# rest under the app's own keys, which is the first of the three shapes
# `facet_columns()` already matches, so this study's own file can go into
# `MINT_SOURCES` beside the others as it is.
