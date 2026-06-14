/**
 * Official FIFA World Cup 2026 knockout bracket topology.
 *
 * Source: FIFA World Cup 2026™ Competition Regulations, Annex A (match schedule /
 * bracket draw), as published on the FIFA website and mirrored by Sports Reference:
 * https://www.sportsreference.com/soccer/international/worldcup/2026/bracket/
 * https://www.fifa.com/tournaments/mens/worldcup/2026canada-mexicounited-states/
 *
 * Match numbering (M73–M104):
 *   M73–M88  Round of 32   (16 matches)
 *   M89–M96  Round of 16   (8 matches)
 *   M97–M100 Quarter-finals (4 matches)
 *   M101–M102 Semi-finals   (2 matches)
 *   M103     Third-place match
 *   M104     Final
 *
 * Third-place team assignments for Round-of-32 slots (which of the 8 best
 * third-place teams goes to which slot) are determined by Annex C based on
 * the alphabetically-sorted combination of qualifying group letters, and are
 * NOT encoded here. THIRD_PLACE slot sources carry a groups placeholder string
 * that will be resolved at runtime by the Annex C lookup.
 *
 * MATCH_LOSER is used exclusively for M103 (third-place match) to represent
 * the two semi-final losers.
 */

import type { BracketMatchDefinition } from "../domain/bracket";

// Canonical Round-of-32 pairings per FIFA WC2026 Annex A.
// Home/away designation follows the official match schedule.
//
// Slot labels used in the official bracket:
//   1X  = Winner of Group X
//   2X  = Runner-up of Group X
//   3A/B/C/D/E/F etc. = Best third-place team from named groups (Annex C lookup)
//
// The eight third-place slots that appear in Round-of-32 matches and the groups
// they reference (the exact group letter strings are from Annex C column headers):
//   3A/B/C/D/E/F  — one of these slots per applicable R32 match
// Because Annex C maps are keyed by the eight-group combination, we encode the
// full candidate pool string for each third-place slot as it appears in the
// official regulations. These are resolved at runtime.

export const BRACKET_TOPOLOGY: readonly BracketMatchDefinition[] = [
  // ── Round of 32 ──────────────────────────────────────────────────────────

  // Upper half of the draw (M73–M80)
  {
    matchNumber: 73,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "A" },
    awaySource: { type: "THIRD_PLACE", groups: "C/D/E" },
    winnerFeedsMatch: 89,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 74,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "C" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "D" },
    winnerFeedsMatch: 89,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 75,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "E" },
    awaySource: { type: "THIRD_PLACE", groups: "A/B/F" },
    winnerFeedsMatch: 90,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 76,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "B" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "F" },
    winnerFeedsMatch: 90,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 77,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "B" },
    awaySource: { type: "THIRD_PLACE", groups: "G/H/I" },
    winnerFeedsMatch: 91,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 78,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "G" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "H" },
    winnerFeedsMatch: 91,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 79,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "I" },
    awaySource: { type: "THIRD_PLACE", groups: "J/K/L" },
    winnerFeedsMatch: 92,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 80,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "K" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "L" },
    winnerFeedsMatch: 92,
    winnerFeedsSide: "AWAY",
  },

  // Lower half of the draw (M81–M88)
  {
    matchNumber: 81,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "F" },
    awaySource: { type: "THIRD_PLACE", groups: "A/B/C" },
    winnerFeedsMatch: 93,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 82,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "D" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "E" },
    winnerFeedsMatch: 93,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 83,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "H" },
    awaySource: { type: "THIRD_PLACE", groups: "D/E/F" },
    winnerFeedsMatch: 94,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 84,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "G" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "I" },
    winnerFeedsMatch: 94,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 85,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "J" },
    awaySource: { type: "THIRD_PLACE", groups: "A/B/C/D" },
    winnerFeedsMatch: 95,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 86,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "L" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "K" },
    winnerFeedsMatch: 95,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 87,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "A" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "C" },
    winnerFeedsMatch: 96,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 88,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "J" },
    awaySource: { type: "THIRD_PLACE", groups: "G/H/I/J" },
    winnerFeedsMatch: 96,
    winnerFeedsSide: "AWAY",
  },

  // ── Round of 16 ──────────────────────────────────────────────────────────

  {
    matchNumber: 89,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 73 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 74 },
    winnerFeedsMatch: 97,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 90,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 75 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 76 },
    winnerFeedsMatch: 97,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 91,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 77 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 78 },
    winnerFeedsMatch: 98,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 92,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 79 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 80 },
    winnerFeedsMatch: 98,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 93,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 81 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 82 },
    winnerFeedsMatch: 99,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 94,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 83 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 84 },
    winnerFeedsMatch: 99,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 95,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 85 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 86 },
    winnerFeedsMatch: 100,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 96,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 87 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 88 },
    winnerFeedsMatch: 100,
    winnerFeedsSide: "AWAY",
  },

  // ── Quarter-finals ───────────────────────────────────────────────────────

  {
    matchNumber: 97,
    round: "QUARTER_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 89 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 90 },
    winnerFeedsMatch: 101,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 98,
    round: "QUARTER_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 91 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 92 },
    winnerFeedsMatch: 101,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 99,
    round: "QUARTER_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 93 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 94 },
    winnerFeedsMatch: 102,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 100,
    round: "QUARTER_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 95 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 96 },
    winnerFeedsMatch: 102,
    winnerFeedsSide: "AWAY",
  },

  // ── Semi-finals ──────────────────────────────────────────────────────────

  {
    matchNumber: 101,
    round: "SEMI_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 97 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 98 },
    winnerFeedsMatch: 104,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 102,
    round: "SEMI_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 99 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 100 },
    winnerFeedsMatch: 104,
    winnerFeedsSide: "AWAY",
  },

  // ── Third-place match ────────────────────────────────────────────────────

  {
    matchNumber: 103,
    round: "THIRD_PLACE",
    homeSource: { type: "MATCH_LOSER", matchNumber: 101 },
    awaySource: { type: "MATCH_LOSER", matchNumber: 102 },
    // No winnerFeedsMatch — this is a terminal match
  },

  // ── Final ────────────────────────────────────────────────────────────────

  {
    matchNumber: 104,
    round: "FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 101 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 102 },
    // No winnerFeedsMatch — this is a terminal match
  },
];
