/**
 * Official FIFA World Cup 2026 knockout bracket topology.
 *
 * Source: Regulations for the FIFA World Cup 26, May 2026, article 12.6-12.11:
 * https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf
 *
 * Third-place sources preserve the five candidate groups listed in article
 * 12.6. Annex C determines the qualifying third-place team assigned to each
 * source after the group stage.
 */

import type { BracketMatchDefinition } from "../domain/bracket";

export const BRACKET_TOPOLOGY_SOURCE = {
  document: "Regulations for the FIFA World Cup 26",
  edition: "May 2026",
  articles: ["12.6", "12.7", "12.8", "12.9", "12.10", "12.11"],
  url: "https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf",
} as const;

export const BRACKET_TOPOLOGY: readonly BracketMatchDefinition[] = [
  // Article 12.6: round of 32
  {
    matchNumber: 73,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "A" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "B" },
    winnerFeedsMatch: 90,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 74,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "E" },
    awaySource: { type: "THIRD_PLACE", groups: "A/B/C/D/F" },
    winnerFeedsMatch: 89,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 75,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "F" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "C" },
    winnerFeedsMatch: 90,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 76,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "C" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "F" },
    winnerFeedsMatch: 91,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 77,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "I" },
    awaySource: { type: "THIRD_PLACE", groups: "C/D/F/G/H" },
    winnerFeedsMatch: 89,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 78,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "E" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "I" },
    winnerFeedsMatch: 91,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 79,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "A" },
    awaySource: { type: "THIRD_PLACE", groups: "C/E/F/H/I" },
    winnerFeedsMatch: 92,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 80,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "L" },
    awaySource: { type: "THIRD_PLACE", groups: "E/H/I/J/K" },
    winnerFeedsMatch: 92,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 81,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "D" },
    awaySource: { type: "THIRD_PLACE", groups: "B/E/F/I/J" },
    winnerFeedsMatch: 94,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 82,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "G" },
    awaySource: { type: "THIRD_PLACE", groups: "A/E/H/I/J" },
    winnerFeedsMatch: 94,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 83,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "K" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "L" },
    winnerFeedsMatch: 93,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 84,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "H" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "J" },
    winnerFeedsMatch: 93,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 85,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "B" },
    awaySource: { type: "THIRD_PLACE", groups: "E/F/G/I/J" },
    winnerFeedsMatch: 96,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 86,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "J" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "H" },
    winnerFeedsMatch: 95,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 87,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_WINNER", group: "K" },
    awaySource: { type: "THIRD_PLACE", groups: "D/E/I/J/L" },
    winnerFeedsMatch: 96,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 88,
    round: "ROUND_OF_32",
    homeSource: { type: "GROUP_RUNNER_UP", group: "D" },
    awaySource: { type: "GROUP_RUNNER_UP", group: "G" },
    winnerFeedsMatch: 95,
    winnerFeedsSide: "AWAY",
  },

  // Article 12.7: round of 16
  {
    matchNumber: 89,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 74 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 77 },
    winnerFeedsMatch: 97,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 90,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 73 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 75 },
    winnerFeedsMatch: 97,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 91,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 76 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 78 },
    winnerFeedsMatch: 99,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 92,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 79 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 80 },
    winnerFeedsMatch: 99,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 93,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 83 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 84 },
    winnerFeedsMatch: 98,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 94,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 81 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 82 },
    winnerFeedsMatch: 98,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 95,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 86 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 88 },
    winnerFeedsMatch: 100,
    winnerFeedsSide: "HOME",
  },
  {
    matchNumber: 96,
    round: "ROUND_OF_16",
    homeSource: { type: "MATCH_WINNER", matchNumber: 85 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 87 },
    winnerFeedsMatch: 100,
    winnerFeedsSide: "AWAY",
  },

  // Article 12.8: quarter-finals
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
    homeSource: { type: "MATCH_WINNER", matchNumber: 93 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 94 },
    winnerFeedsMatch: 101,
    winnerFeedsSide: "AWAY",
  },
  {
    matchNumber: 99,
    round: "QUARTER_FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 91 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 92 },
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

  // Article 12.9: semi-finals
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

  // Article 12.10: play-off for third place
  {
    matchNumber: 103,
    round: "THIRD_PLACE",
    homeSource: { type: "MATCH_LOSER", matchNumber: 101 },
    awaySource: { type: "MATCH_LOSER", matchNumber: 102 },
  },

  // Article 12.11: final
  {
    matchNumber: 104,
    round: "FINAL",
    homeSource: { type: "MATCH_WINNER", matchNumber: 101 },
    awaySource: { type: "MATCH_WINNER", matchNumber: 102 },
  },
];
