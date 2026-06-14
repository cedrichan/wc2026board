import { BRACKET_TOPOLOGY } from "../data/bracket-topology";
import { FINISHED_STATUSES } from "../domain/common";
import type {
  BracketMatchDefinition,
  Match,
  ParticipantSlot,
  SlotSource,
} from "../domain";

export interface KnockoutAdvancementSlot {
  matchNumber: number;
  side: "HOME" | "AWAY";
  sourceMatchNumber: number;
  source: "WINNER" | "LOSER";
  participant: ParticipantSlot;
}

function resolvedParticipants(match: Match | undefined): {
  winnerTeamId: string;
  loserTeamId: string;
} | null {
  if (
    match === undefined ||
    !FINISHED_STATUSES.has(match.status) ||
    match.homeTeamId === undefined ||
    match.awayTeamId === undefined ||
    match.homeTeamId === match.awayTeamId ||
    (match.winnerTeamId !== match.homeTeamId &&
      match.winnerTeamId !== match.awayTeamId)
  ) {
    return null;
  }

  return {
    winnerTeamId: match.winnerTeamId,
    loserTeamId:
      match.winnerTeamId === match.homeTeamId
        ? match.awayTeamId
        : match.homeTeamId,
  };
}

function resolveMatchSource(
  source: Extract<SlotSource, { type: "MATCH_WINNER" | "MATCH_LOSER" }>,
  matchesByNumber: ReadonlyMap<number, Match>,
): ParticipantSlot {
  const participants = resolvedParticipants(matchesByNumber.get(source.matchNumber));
  const label =
    source.type === "MATCH_WINNER"
      ? `Winner M${source.matchNumber}`
      : `Loser M${source.matchNumber}`;

  if (participants === null) {
    return { state: "PLACEHOLDER", label };
  }

  return {
    state: "CONFIRMED",
    teamId:
      source.type === "MATCH_WINNER"
        ? participants.winnerTeamId
        : participants.loserTeamId,
  };
}

/**
 * Resolves topology slots fed by earlier knockout matches.
 *
 * Only final matches with an explicit winner that is one of the match
 * participants can populate a later slot. Scores are intentionally ignored.
 */
export function resolveKnockoutAdvancement(
  matches: readonly Match[],
  topology: readonly BracketMatchDefinition[] = BRACKET_TOPOLOGY,
): KnockoutAdvancementSlot[] {
  const matchesByNumber = new Map(matches.map((match) => [match.matchNumber, match]));
  const slots: KnockoutAdvancementSlot[] = [];

  for (const definition of topology) {
    const sources = [
      { side: "HOME", source: definition.homeSource },
      { side: "AWAY", source: definition.awaySource },
    ] as const;

    for (const { side, source } of sources) {
      if (source.type !== "MATCH_WINNER" && source.type !== "MATCH_LOSER") {
        continue;
      }

      slots.push({
        matchNumber: definition.matchNumber,
        side,
        sourceMatchNumber: source.matchNumber,
        source: source.type === "MATCH_WINNER" ? "WINNER" : "LOSER",
        participant: resolveMatchSource(source, matchesByNumber),
      });
    }
  }

  return slots;
}
