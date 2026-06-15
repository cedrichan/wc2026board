import { BRACKET_TOPOLOGY } from "../data/bracket-topology";
import { FINISHED_STATUSES } from "../domain/common";
import type {
  BracketMatchDefinition,
  BracketProjectionMatch,
  GroupId,
  GroupStandings,
  Match,
  ParticipantSlot,
  ResolvedThirdPlaceAssignment,
  SlotSource,
  ThirdPlaceRanking,
  ThirdPlaceWinnerSlot,
} from "../domain";
import { resolveKnockoutAdvancement } from "./knockout-advancement";
import { assignThirdPlaceQualifiers } from "./third-place-assignment";

const GROUP_MATCH_COUNT = 6;

function sourceLabel(source: SlotSource): string {
  switch (source.type) {
    case "GROUP_WINNER":
      return `1${source.group}`;
    case "GROUP_RUNNER_UP":
      return `2${source.group}`;
    case "THIRD_PLACE":
      return `3${source.groups}`;
    case "MATCH_WINNER":
      return `Winner M${source.matchNumber}`;
    case "MATCH_LOSER":
      return `Loser M${source.matchNumber}`;
  }
}

function isGroupComplete(groupId: GroupId, matches: readonly Match[]): boolean {
  const groupMatches = matches.filter(
    (match) => match.round === "GROUP_STAGE" && match.group === groupId,
  );
  return (
    groupMatches.length === GROUP_MATCH_COUNT &&
    groupMatches.every((match) => FINISHED_STATUSES.has(match.status))
  );
}

function resolveDirectParticipant(
  source: Extract<SlotSource, { type: "GROUP_WINNER" | "GROUP_RUNNER_UP" }>,
  standingsByGroup: ReadonlyMap<GroupId, GroupStandings>,
  matches: readonly Match[],
): ParticipantSlot {
  const label = sourceLabel(source);
  const position = source.type === "GROUP_WINNER" ? 1 : 2;
  const placement = position === 1 ? "winner" : "runner-up";
  const candidates = standingsByGroup.get(source.group)?.rows.filter(
    (candidate) => candidate.position === position,
  ) ?? [];

  if (candidates.length === 0) {
    return { state: "PLACEHOLDER", label };
  }
  if (candidates.length !== 1) {
    return {
      state: "UNRESOLVED",
      label,
      unresolvedReason: `The ${placement} of Group ${source.group} is unresolved`,
    };
  }

  const row = candidates[0];
  if (row.provisional) {
    return {
      state: "UNRESOLVED",
      teamId: row.teamId,
      provisional: true,
      unresolvedReason: `The ${placement} of Group ${source.group} is provisional`,
    };
  }
  const confirmed = isGroupComplete(source.group, matches);
  return {
    state: confirmed ? "CONFIRMED" : "PROJECTED",
    teamId: row.teamId,
    qualificationSource: `${confirmed ? "Confirmed" : "Projected"} ${placement} of Group ${source.group}`,
  };
}

function thirdPlaceWinnerSlot(
  definition: BracketMatchDefinition,
): ThirdPlaceWinnerSlot | undefined {
  const winnerSource = [definition.homeSource, definition.awaySource].find(
    (source): source is Extract<SlotSource, { type: "GROUP_WINNER" }> =>
      source.type === "GROUP_WINNER",
  );
  return winnerSource == null ? undefined : `1${winnerSource.group}` as ThirdPlaceWinnerSlot;
}

function resolveThirdPlaceParticipant(
  source: Extract<SlotSource, { type: "THIRD_PLACE" }>,
  definition: BracketMatchDefinition,
  assignment: ResolvedThirdPlaceAssignment | undefined,
  assignmentFailure: string | undefined,
  allGroupsComplete: boolean,
): ParticipantSlot {
  const label = sourceLabel(source);
  if (assignment == null) {
    return {
      state: "UNRESOLVED",
      label,
      unresolvedReason: assignmentFailure ?? "Annex C assignment is unresolved",
    };
  }

  const winnerSlot = thirdPlaceWinnerSlot(definition);
  const assigned = winnerSlot == null ? undefined : assignment.slots[winnerSlot];
  const candidateGroups = new Set(source.groups.split("/"));
  if (assigned == null || !candidateGroups.has(assigned.groupId)) {
    return {
      state: "UNRESOLVED",
      label,
      unresolvedReason: "Annex C assignment does not resolve this bracket slot",
    };
  }

  if (assigned.provisional) {
    return {
      state: "UNRESOLVED",
      teamId: assigned.teamId,
      provisional: true,
      unresolvedReason: `The third-place qualifier from Group ${assigned.groupId} is provisional`,
    };
  }

  return {
    state: allGroupsComplete ? "CONFIRMED" : "PROJECTED",
    teamId: assigned.teamId,
    qualificationSource:
      `${allGroupsComplete ? "Confirmed" : "Projected"} third-place qualifier from Group ${assigned.groupId}`,
  };
}

export function buildBracketProjection(
  standings: readonly GroupStandings[],
  thirdPlaceRanking: ThirdPlaceRanking,
  matches: readonly Match[],
  topology: readonly BracketMatchDefinition[] = BRACKET_TOPOLOGY,
): BracketProjectionMatch[] {
  const standingsByGroup = new Map(standings.map((group) => [group.groupId, group]));
  const assignmentResult = assignThirdPlaceQualifiers(thirdPlaceRanking);
  const assignmentFailure = assignmentResult.diagnostics.map(({ message }) => message).join("; ");
  const allGroupsComplete =
    standingsByGroup.size === 12 &&
    [...standingsByGroup.keys()].every((groupId) => isGroupComplete(groupId, matches));
  const advancementBySlot = new Map(
    resolveKnockoutAdvancement(matches, topology).map((slot) => [
      `${slot.matchNumber}:${slot.side}`,
      slot.participant,
    ]),
  );

  const resolveParticipant = (
    source: SlotSource,
    definition: BracketMatchDefinition,
    side: "HOME" | "AWAY",
  ): ParticipantSlot => {
    switch (source.type) {
      case "GROUP_WINNER":
      case "GROUP_RUNNER_UP":
        return resolveDirectParticipant(source, standingsByGroup, matches);
      case "THIRD_PLACE":
        return resolveThirdPlaceParticipant(
          source,
          definition,
          assignmentResult.assignment,
          assignmentFailure || undefined,
          allGroupsComplete,
        );
      case "MATCH_WINNER":
      case "MATCH_LOSER":
        return advancementBySlot.get(`${definition.matchNumber}:${side}`) ?? {
          state: "PLACEHOLDER",
          label: sourceLabel(source),
        };
    }
  };

  return topology.map((definition) => ({
    matchNumber: definition.matchNumber,
    round: definition.round,
    homeParticipant: resolveParticipant(definition.homeSource, definition, "HOME"),
    awayParticipant: resolveParticipant(definition.awaySource, definition, "AWAY"),
  }));
}
