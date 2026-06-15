// 12 groups in the 2026 48-team format
export type GroupId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type TournamentRound =
  | "GROUP_STAGE"
  | "ROUND_OF_32"     // first knockout round; unique to the 48-team format
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"     // 3rd/4th place play-off
  | "FINAL";

export type NormalizedMatchStatus =
  | "SCHEDULED"                  // future match, no action yet
  | "PRE_MATCH"                  // pre-kick-off window (warm-ups, lineups announced)
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "EXTRA_TIME"
  | "EXTRA_TIME_BREAK"           // interval between ET halves
  | "PENALTY_SHOOTOUT"
  | "FINISHED"                   // ended in regular time
  | "FINISHED_AFTER_EXTRA_TIME"  // ended in ET without penalties
  | "FINISHED_AFTER_PENALTIES"   // ended in penalty shootout
  | "POSTPONED"                  // rescheduled; new date may not be set yet
  | "SUSPENDED"                  // halted mid-match; result still pending
  | "CANCELLED"
  | "UNKNOWN";                   // source returned an unrecognized status value

// Matches in progress — live clock and score should be shown
export const LIVE_STATUSES: ReadonlySet<NormalizedMatchStatus> = new Set([
  "FIRST_HALF",
  "HALF_TIME",
  "SECOND_HALF",
  "EXTRA_TIME",
  "EXTRA_TIME_BREAK",
  "PENALTY_SHOOTOUT",
]);

// Matches with a definitive final result
export const FINISHED_STATUSES: ReadonlySet<NormalizedMatchStatus> = new Set([
  "FINISHED",
  "FINISHED_AFTER_EXTRA_TIME",
  "FINISHED_AFTER_PENALTIES",
]);

// Matches halted or rescheduled; result not yet available
export const INTERRUPTED_STATUSES: ReadonlySet<NormalizedMatchStatus> = new Set([
  "POSTPONED",
  "SUSPENDED",
  "CANCELLED",
]);
