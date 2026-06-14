import { getFifaRankingEditions, lookupByFifaCode } from "../data/fifa-rankings/loader";
import type { GroupId } from "../domain/common";
import type {
  GroupStandings,
  StandingRow,
  ThirdPlaceRanking,
  ThirdPlaceRankingDiagnostic,
  ThirdPlaceRankingRow,
} from "../domain/standings";
import type { Team } from "../domain/team";

interface Candidate {
  groupId: GroupId;
  row: StandingRow;
  team?: Team;
}

interface RankedSegment {
  candidates: Candidate[];
  resolved: boolean;
  tiebreakerUsed?: string;
  unresolvedCriterion?: string;
}

interface NumericCriterion {
  label: string;
  valueOf: (candidate: Candidate) => number | undefined;
}

const PRIMARY_CRITERIA: NumericCriterion[] = [
  { label: "points", valueOf: (candidate) => candidate.row.points },
  { label: "overall goal difference", valueOf: (candidate) => candidate.row.goalDifference },
  { label: "overall goals scored", valueOf: (candidate) => candidate.row.goalsFor },
  { label: "conduct score", valueOf: (candidate) => candidate.row.conductScore },
];
const GROUP_IDS = new Set<GroupId>(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);

export function rankThirdPlaceTeams(
  standings: GroupStandings[],
  teams: Team[],
  rankingEditions: readonly string[] = getFifaRankingEditions(),
): ThirdPlaceRanking {
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const candidates = standings.map((group) => {
    const row = group.rows.find((standing) => standing.position === 3);
    if (row == null) {
      throw new Error(`Group ${group.groupId} does not have a third-place row`);
    }
    return { groupId: group.groupId, row, team: teamsById.get(row.teamId) };
  });

  if (
    candidates.length !== 12 ||
    new Set(candidates.map(({ groupId }) => groupId)).size !== 12 ||
    candidates.some(({ groupId }) => !GROUP_IDS.has(groupId))
  ) {
    throw new Error("Third-place ranking requires exactly one row from each of 12 unique groups");
  }

  const segments = resolveCriteria(candidates, PRIMARY_CRITERIA, rankingEditions);
  const diagnostics: ThirdPlaceRankingDiagnostic[] = [];
  const rows: ThirdPlaceRankingRow[] = [];
  let rank = 1;

  for (const segment of segments) {
    const startRank = rank;
    const endRank = rank + segment.candidates.length - 1;
    const affectsQualification = !segment.resolved && startRank <= 8 && endRank >= 9;

    if (!segment.resolved) {
      diagnostics.push({
        teamIds: segment.candidates.map(({ row }) => row.teamId),
        criterion: segment.unresolvedCriterion ?? "FIFA ranking",
        affectsQualification,
      });
    }

    for (const candidate of segment.candidates) {
      rows.push(toRankingRow(candidate, rank, segment, affectsQualification));
      rank++;
    }
  }

  return {
    rows,
    qualificationBoundary: 8,
    boundaryResolved: diagnostics.every((diagnostic) => !diagnostic.affectsQualification),
    diagnostics,
  };
}

function resolveCriteria(
  candidates: Candidate[],
  criteria: NumericCriterion[],
  rankingEditions: readonly string[],
  tiebreakerUsed?: string,
): RankedSegment[] {
  if (candidates.length === 1) {
    return [{ candidates, resolved: true, tiebreakerUsed }];
  }

  const [criterion, ...remaining] = criteria;
  if (criterion != null) {
    const values = candidates.map(criterion.valueOf);
    if (values.some((value) => value == null)) {
      return [unresolvedSegment(candidates, criterion.label)];
    }

    const groups = partitionDescending(candidates, (candidate) => criterion.valueOf(candidate)!);
    if (groups.length === 1) {
      return resolveCriteria(candidates, remaining, rankingEditions, tiebreakerUsed);
    }

    return groups.flatMap((group) =>
      resolveCriteria(group, remaining, rankingEditions, criterion.label),
    );
  }

  return resolveFifaRankings(candidates, rankingEditions, tiebreakerUsed);
}

function resolveFifaRankings(
  candidates: Candidate[],
  rankingEditions: readonly string[],
  tiebreakerUsed?: string,
): RankedSegment[] {
  if (candidates.length === 1) {
    return [{ candidates, resolved: true, tiebreakerUsed }];
  }

  const [edition, ...remaining] = rankingEditions;
  if (edition == null) {
    return [unresolvedSegment(candidates, "FIFA ranking")];
  }

  const ranks = new Map(
    candidates.map((candidate) => [
      candidate.row.teamId,
      candidate.team == null ? undefined : lookupByFifaCode(candidate.team.fifaCode, edition)?.rank,
    ]),
  );
  if ([...ranks.values()].some((rank) => rank == null)) {
    return [unresolvedSegment(candidates, `FIFA ranking ${edition}`)];
  }

  const groups = partitionDescending(candidates, (candidate) => -ranks.get(candidate.row.teamId)!);
  if (groups.length === 1) {
    return resolveFifaRankings(candidates, remaining, tiebreakerUsed);
  }

  return groups.flatMap((group) =>
    resolveFifaRankings(group, remaining, `FIFA ranking ${edition}`),
  );
}

function unresolvedSegment(candidates: Candidate[], criterion: string): RankedSegment {
  return {
    candidates: [...candidates].sort((a, b) => a.groupId.localeCompare(b.groupId)),
    resolved: false,
    tiebreakerUsed: criterion,
    unresolvedCriterion: criterion,
  };
}

function partitionDescending(
  candidates: Candidate[],
  valueOf: (candidate: Candidate) => number,
): Candidate[][] {
  const groups = new Map<number, Candidate[]>();
  for (const candidate of candidates) {
    const value = valueOf(candidate);
    groups.set(value, [...(groups.get(value) ?? []), candidate]);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => right - left)
    .map(([, group]) => group);
}

function toRankingRow(
  candidate: Candidate,
  rank: number,
  segment: RankedSegment,
  affectsQualification: boolean,
): ThirdPlaceRankingRow {
  return {
    rank,
    groupId: candidate.groupId,
    teamId: candidate.row.teamId,
    played: candidate.row.played,
    goalDifference: candidate.row.goalDifference,
    goalsFor: candidate.row.goalsFor,
    conductScore: candidate.row.conductScore,
    points: candidate.row.points,
    qualifying: affectsQualification ? null : rank <= 8,
    provisional: candidate.row.provisional || !segment.resolved,
    tiebreakerUsed: segment.tiebreakerUsed,
  };
}
