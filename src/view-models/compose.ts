import { calculateGroupStandings } from "../rules/group-standings";
import { rankThirdPlaceTeams } from "../rules/third-place-ranking";
import { buildBracketProjection } from "../rules/bracket-projection";
import { buildDashboardViewModel } from "./dashboard";
import type { DashboardFormatOptions, DashboardViewModel } from "./dashboard";
import type {
  GroupId,
  GroupStandings,
  Team,
  ThirdPlaceRanking,
  TournamentSnapshot,
} from "../domain";

const GROUP_IDS: readonly GroupId[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

const EMPTY_THIRD_PLACE: ThirdPlaceRanking = {
  rows: [],
  qualificationBoundary: 8,
  boundaryResolved: false,
  diagnostics: [],
};

/**
 * Runs the local rules engine over a normalized snapshot and builds the
 * dashboard view model consumed by the UI.
 *
 * This is the single seam where `normalized snapshot -> rules engine -> view
 * models` is composed. It is a pure function with no React or ESPN
 * dependencies, so it can be memoized on snapshot identity by the data hook.
 *
 * The composition degrades gracefully on incomplete data (e.g. a partial
 * fixture range covering only a few groups): groups without teams are skipped,
 * and third-place ranking only runs once at least one group has a third-place
 * row, leaving the boundary unresolved and bracket slots as placeholders until
 * the full group stage is available.
 */
export function composeDashboardViewModel(
  snapshot: TournamentSnapshot,
  options: DashboardFormatOptions,
): DashboardViewModel {
  const teamsByGroup = groupTeams(snapshot.teams);

  const groupStandings: GroupStandings[] = [];
  for (const groupId of GROUP_IDS) {
    const teams = teamsByGroup.get(groupId);
    if (teams === undefined || teams.length === 0) continue;
    groupStandings.push(calculateGroupStandings(groupId, teams, snapshot.matches));
  }

  // rankThirdPlaceTeams ranks the third-place team from each of the 12 groups
  // and requires all of them to have placed a third team. Until the full group
  // stage is present, leave the ranking empty (boundary unresolved) rather than
  // partially ranking it.
  const groupsWithThirdPlace = groupStandings.filter((group) =>
    group.rows.some((row) => row.position === 3),
  );
  const thirdPlaceRanking =
    groupsWithThirdPlace.length === GROUP_IDS.length
      ? rankThirdPlaceTeams(groupsWithThirdPlace, [...snapshot.teams])
      : EMPTY_THIRD_PLACE;

  const bracketProjection = buildBracketProjection(
    groupStandings,
    thirdPlaceRanking,
    snapshot.matches,
  );

  return buildDashboardViewModel(
    { snapshot, groupStandings, thirdPlaceRanking, bracketProjection },
    options,
  );
}

function groupTeams(teams: readonly Team[]): Map<GroupId, Team[]> {
  const byGroup = new Map<GroupId, Team[]>();
  for (const team of teams) {
    const existing = byGroup.get(team.group);
    if (existing === undefined) {
      byGroup.set(team.group, [team]);
    } else {
      existing.push(team);
    }
  }
  return byGroup;
}
