export type GroupId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type TournamentRound =
  | "GROUP_STAGE"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

export type NormalizedMatchStatus =
  | "SCHEDULED"
  | "PRE_MATCH"
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "EXTRA_TIME"
  | "EXTRA_TIME_BREAK"
  | "PENALTY_SHOOTOUT"
  | "FINISHED"
  | "FINISHED_AFTER_EXTRA_TIME"
  | "FINISHED_AFTER_PENALTIES"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED"
  | "UNKNOWN";

export const LIVE_STATUSES: ReadonlySet<NormalizedMatchStatus> = new Set([
  "FIRST_HALF",
  "HALF_TIME",
  "SECOND_HALF",
  "EXTRA_TIME",
  "EXTRA_TIME_BREAK",
  "PENALTY_SHOOTOUT",
]);

export const FINISHED_STATUSES: ReadonlySet<NormalizedMatchStatus> = new Set([
  "FINISHED",
  "FINISHED_AFTER_EXTRA_TIME",
  "FINISHED_AFTER_PENALTIES",
]);

export const INTERRUPTED_STATUSES: ReadonlySet<NormalizedMatchStatus> = new Set([
  "POSTPONED",
  "SUSPENDED",
  "CANCELLED",
]);
