import type { GroupId } from "../domain/common";
import type { Match, CardType } from "../domain/match";
import type { Team } from "../domain/team";
import type { GroupStandings, StandingRow, QualificationStatus } from "../domain/standings";
import { LIVE_STATUSES, FINISHED_STATUSES } from "../domain/common";
import { getFifaRankingEditions, lookupByFifaCode } from "../data/fifa-rankings/loader";

// ─── Card deduction values ────────────────────────────────────────────────────

const CARD_DEDUCTIONS: Record<CardType, number> = {
  YELLOW: -1,
  RED_INDIRECT: -3,
  RED_DIRECT: -4,
  YELLOW_PLUS_DIRECT_RED: -5,
};

// ─── Match countability ───────────────────────────────────────────────────────

function isCountable(match: Match): boolean {
  return FINISHED_STATUSES.has(match.status) || LIVE_STATUSES.has(match.status);
}

function getGroupScore(match: Match): { home: number; away: number } | null {
  if (!isCountable(match)) return null;
  const score = match.normalTime;
  if (score == null || score.home == null || score.away == null) return null;
  return { home: score.home, away: score.away };
}

// ─── Per-team accumulator ─────────────────────────────────────────────────────

interface TeamTotals {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function buildTotals(teamId: string, matches: Match[]): TeamTotals {
  const totals: TeamTotals = {
    teamId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };

  for (const match of matches) {
    const isHome = match.homeTeamId === teamId;
    const isAway = match.awayTeamId === teamId;
    if (!isHome && !isAway) continue;

    const score = getGroupScore(match);
    if (score == null) continue;

    totals.played++;
    const gf = isHome ? score.home : score.away;
    const ga = isHome ? score.away : score.home;
    totals.goalsFor += gf;
    totals.goalsAgainst += ga;

    if (gf > ga) {
      totals.wins++;
      totals.points += 3;
    } else if (gf === ga) {
      totals.draws++;
      totals.points += 1;
    } else {
      totals.losses++;
    }
  }

  return totals;
}

// ─── Conduct scoring ──────────────────────────────────────────────────────────

function computeConductScore(
  teamId: string,
  matches: Match[]
): { score: number; incomplete: boolean } {
  let score = 0;
  let incomplete = false;

  for (const match of matches) {
    const isHome = match.homeTeamId === teamId;
    const isAway = match.awayTeamId === teamId;
    if (!isHome && !isAway) continue;
    if (!isCountable(match)) continue;

    if (match.disciplinaryEvents === undefined) {
      incomplete = true;
      continue;
    }

    for (const event of match.disciplinaryEvents) {
      if (event.teamId === teamId) {
        score += CARD_DEDUCTIONS[event.cardType];
      }
    }
  }

  return { score, incomplete };
}

// ─── H2H mini-table ──────────────────────────────────────────────────────────

interface H2HTotals {
  teamId: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
}

function buildH2HTotals(teamIds: string[], allMatches: Match[]): Map<string, H2HTotals> {
  const teamSet = new Set(teamIds);
  const h2hMatches = allMatches.filter(
    (m) =>
      m.homeTeamId != null &&
      m.awayTeamId != null &&
      teamSet.has(m.homeTeamId) &&
      teamSet.has(m.awayTeamId)
  );

  const map = new Map<string, H2HTotals>(
    teamIds.map((id) => [id, { teamId: id, points: 0, goalDifference: 0, goalsFor: 0 }])
  );

  for (const match of h2hMatches) {
    const score = getGroupScore(match);
    if (score == null) continue;

    const home = map.get(match.homeTeamId!)!;
    const away = map.get(match.awayTeamId!)!;

    home.goalsFor += score.home;
    home.goalDifference += score.home - score.away;
    away.goalsFor += score.away;
    away.goalDifference += score.away - score.home;

    if (score.home > score.away) {
      home.points += 3;
    } else if (score.home === score.away) {
      home.points += 1;
      away.points += 1;
    } else {
      away.points += 3;
    }
  }

  return map;
}

// ─── Sorting helpers ──────────────────────────────────────────────────────────

/**
 * Splits a list of team IDs into groups sharing the same numeric value for the
 * given key function. Returns sub-arrays sorted highest-value-first.
 */
function partitionByValue(
  teamIds: string[],
  valueOf: (id: string) => number
): { value: number; ids: string[] }[] {
  const groups = new Map<number, string[]>();
  for (const id of teamIds) {
    const value = valueOf(id);
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value)!.push(id);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([value, ids]) => ({ value, ids }));
}

// ─── Core tie-breaking ────────────────────────────────────────────────────────

interface RankedTeam {
  teamId: string;
  position: number;
  tiebreakerUsed?: string;
  provisional: boolean;
}

interface TiebreakerContext {
  groupMatches: Match[];
  teams: Team[];
  totalsMap: Map<string, TeamTotals>;
  editions: readonly string[];
}

/**
 * Applies H2H mini-table criteria (with recursive subset reapplication) to a
 * tied set. Returns a flat list of RankedTeam starting at `startPosition`.
 * When all teams remain tied after all H2H criteria, returns them all at
 * `startPosition` so the caller continues to overall criteria.
 */
function resolveByH2H(
  tiedIds: string[],
  allMatches: Match[],
  startPosition: number,
  depth: number
): RankedTeam[] {
  if (depth > 10 || tiedIds.length <= 1) {
    return tiedIds.map((id, i) => ({
      teamId: id,
      position: startPosition + i,
      provisional: false,
    }));
  }

  const h2h = buildH2HTotals(tiedIds, allMatches);

  const byH2HPoints = partitionByValue(tiedIds, (id) => h2h.get(id)!.points);
  if (byH2HPoints.length > 1) {
    return resolveH2HSubGroups(byH2HPoints, allMatches, startPosition, depth, "head-to-head points");
  }

  const byH2HGD = partitionByValue(tiedIds, (id) => h2h.get(id)!.goalDifference);
  if (byH2HGD.length > 1) {
    return resolveH2HSubGroups(byH2HGD, allMatches, startPosition, depth, "head-to-head goal difference");
  }

  const byH2HGF = partitionByValue(tiedIds, (id) => h2h.get(id)!.goalsFor);
  if (byH2HGF.length > 1) {
    return resolveH2HSubGroups(byH2HGF, allMatches, startPosition, depth, "head-to-head goals scored");
  }

  // All equal in H2H — signal to caller by returning all at same position
  return tiedIds.map((id) => ({
    teamId: id,
    position: startPosition,
    provisional: false,
  }));
}

/**
 * Assigns positions after an H2H criterion separated at least some teams.
 * Singletons get the position directly; groups recurse via B012 subset reapplication.
 */
function resolveH2HSubGroups(
  groups: { value: number; ids: string[] }[],
  allMatches: Match[],
  startPosition: number,
  depth: number,
  tiebreaker: string
): RankedTeam[] {
  const result: RankedTeam[] = [];
  let pos = startPosition;

  for (const group of groups) {
    if (group.ids.length === 1) {
      result.push({
        teamId: group.ids[0],
        position: pos,
        tiebreakerUsed: tiebreaker,
        provisional: false,
      });
      pos++;
    } else {
      // B012 — Subset reapplication: recurse H2H on just this sub-group
      const subResult = resolveByH2H(group.ids, allMatches, pos, depth + 1);
      for (const r of subResult) {
        result.push({
          ...r,
          tiebreakerUsed: r.tiebreakerUsed ?? tiebreaker,
        });
      }
      pos += group.ids.length;
    }
  }

  return result;
}

// ─── Overall criteria (after H2H exhausted) ───────────────────────────────────

/**
 * Resolves a tied subset using overall group metrics (GD → GF), then
 * conduct score, then FIFA ranking. Called only when H2H is fully exhausted.
 */
function resolveByOverallCriteria(
  tiedIds: string[],
  startPosition: number,
  ctx: TiebreakerContext
): RankedTeam[] {
  // Step 5a — Overall goal difference
  const byGD = partitionByValue(tiedIds, (id) => {
    const t = ctx.totalsMap.get(id)!;
    return t.goalsFor - t.goalsAgainst;
  });

  if (byGD.length > 1) {
    return applyOverallCriterion(byGD, startPosition, ctx, "overall goal difference", resolveByGF);
  }

  return resolveByGF(tiedIds, startPosition, ctx);
}

function resolveByGF(
  tiedIds: string[],
  startPosition: number,
  ctx: TiebreakerContext
): RankedTeam[] {
  const byGF = partitionByValue(tiedIds, (id) => ctx.totalsMap.get(id)!.goalsFor);

  if (byGF.length > 1) {
    return applyOverallCriterion(byGF, startPosition, ctx, "overall goals scored", resolveByConductAndRanking);
  }

  return resolveByConductAndRanking(tiedIds, startPosition, ctx);
}

/**
 * Applies a single overall criterion (GD or GF). Singletons get placed with
 * the criterion label; remaining tied sub-groups continue to `nextFn`.
 */
function applyOverallCriterion(
  groups: { value: number; ids: string[] }[],
  startPosition: number,
  ctx: TiebreakerContext,
  tiebreaker: string,
  nextFn: (ids: string[], pos: number, ctx: TiebreakerContext) => RankedTeam[]
): RankedTeam[] {
  const result: RankedTeam[] = [];
  let pos = startPosition;

  for (const group of groups) {
    if (group.ids.length === 1) {
      result.push({
        teamId: group.ids[0],
        position: pos,
        tiebreakerUsed: tiebreaker,
        provisional: false,
      });
      pos++;
    } else {
      const subResult = nextFn(group.ids, pos, ctx);
      for (const r of subResult) result.push(r);
      pos += group.ids.length;
    }
  }

  return result;
}

// ─── FIFA ranking tiebreaker ─────────────────────────────────────────────────

function resolveByFifaRanking(
  tiedIds: string[],
  teams: Team[],
  rankingEditions: readonly string[],
  startPosition: number
): RankedTeam[] {
  const fifaCodeOf = (teamId: string): string | undefined =>
    teams.find((t) => t.id === teamId)?.fifaCode;

  for (const edition of rankingEditions) {
    const entries = tiedIds.map((id) => {
      const code = fifaCodeOf(id);
      if (code == null) return undefined;
      return lookupByFifaCode(code, edition);
    });

    // Skip this edition if any team is missing
    if (entries.some((e) => e == null)) continue;

    // Lower rank number = better; negate so partitionByValue puts best first
    const byRank = partitionByValue(tiedIds, (id) => {
      const entry = entries[tiedIds.indexOf(id)]!;
      return -entry.rank;
    });

    if (byRank.length > 1) {
      const result: RankedTeam[] = [];
      let pos = startPosition;
      for (const group of byRank) {
        if (group.ids.length === 1) {
          result.push({
            teamId: group.ids[0],
            position: pos,
            tiebreakerUsed: `FIFA ranking ${edition}`,
            provisional: false,
          });
          pos++;
        } else {
          // Still tied in this edition — recurse into remaining editions for this subset
          const subResult = resolveByFifaRanking(group.ids, teams, rankingEditions, pos);
          for (const r of subResult) result.push(r);
          pos += group.ids.length;
        }
      }
      return result;
    }
    // All same in this edition — try next
  }

  // All editions exhausted — unresolved
  return tiedIds.map((id, i) => ({
    teamId: id,
    position: startPosition + i,
    tiebreakerUsed: undefined,
    provisional: true,
  }));
}

// ─── Conduct + FIFA ranking ───────────────────────────────────────────────────

function resolveByConductAndRanking(
  tiedIds: string[],
  startPosition: number,
  ctx: TiebreakerContext
): RankedTeam[] {
  const conductResults = new Map(
    tiedIds.map((id) => [id, computeConductScore(id, ctx.groupMatches)])
  );

  const anyIncomplete = tiedIds.some((id) => conductResults.get(id)!.incomplete);

  if (anyIncomplete) {
    // Conduct data missing — skip conduct, go to FIFA ranking, mark provisional
    const byRanking = resolveByFifaRanking(tiedIds, ctx.teams, ctx.editions, startPosition);
    return byRanking.map((r) => ({ ...r, provisional: true }));
  }

  const byConductGroups = partitionByValue(tiedIds, (id) => conductResults.get(id)!.score);

  if (byConductGroups.length > 1) {
    const result: RankedTeam[] = [];
    let pos = startPosition;
    for (const group of byConductGroups) {
      if (group.ids.length === 1) {
        result.push({
          teamId: group.ids[0],
          position: pos,
          tiebreakerUsed: "conduct score",
          provisional: false,
        });
        pos++;
      } else {
        const subResult = resolveByFifaRanking(group.ids, ctx.teams, ctx.editions, pos);
        for (const r of subResult) result.push(r);
        pos += group.ids.length;
      }
    }
    return result;
  }

  // Same conduct score — fall through to FIFA ranking
  return resolveByFifaRanking(tiedIds, ctx.teams, ctx.editions, startPosition);
}

// ─── Main ranking pipeline ────────────────────────────────────────────────────

export function calculateGroupStandings(
  groupId: GroupId,
  teams: Team[],
  matches: Match[],
  rankingEditions?: readonly string[]
): GroupStandings {
  const editions = rankingEditions ?? getFifaRankingEditions();

  const groupMatches = matches.filter(
    (m) => m.round === "GROUP_STAGE" && m.group === groupId
  );

  // B010 — Build basic totals for all teams
  const totalsMap = new Map<string, TeamTotals>(
    teams.map((t) => [t.id, buildTotals(t.id, groupMatches)])
  );

  const ctx: TiebreakerContext = { groupMatches, teams, totalsMap, editions };

  // Sort teams by points descending (stable within ties)
  const sortedIds = [...teams]
    .sort((a, b) => totalsMap.get(b.id)!.points - totalsMap.get(a.id)!.points)
    .map((t) => t.id);

  const pointGroups = partitionByValue(sortedIds, (id) => totalsMap.get(id)!.points);

  const ranked: RankedTeam[] = [];
  let currentPos = 1;

  for (const group of pointGroups) {
    if (group.ids.length === 1) {
      ranked.push({ teamId: group.ids[0], position: currentPos, provisional: false });
      currentPos++;
      continue;
    }

    // B011/B012 — H2H with subset reapplication
    const h2hResult = resolveByH2H(group.ids, groupMatches, currentPos, 0);

    // Group by assigned position to detect still-tied subsets
    const byPosition = groupByPosition(h2hResult);
    const positions = [...byPosition.keys()].sort((a, b) => a - b);

    for (const pos of positions) {
      const subset = byPosition.get(pos)!;

      if (subset.length === 1) {
        ranked.push(subset[0]);
      } else {
        // H2H criteria exhausted for this subset — apply overall metrics
        const subIds = subset.map((r) => r.teamId);
        const overallResult = resolveByOverallCriteria(subIds, pos, ctx);
        for (const r of overallResult) ranked.push(r);
      }
    }

    currentPos += group.ids.length;
  }

  ranked.sort((a, b) => a.position - b.position);

  // Compute conduct scores for all teams (for display in StandingRow)
  const conductMap = new Map<string, { score: number; incomplete: boolean }>(
    teams.map((t) => [t.id, computeConductScore(t.id, groupMatches)])
  );

  const rows: StandingRow[] = ranked.map((r) => {
    const totals = totalsMap.get(r.teamId)!;
    const conduct = conductMap.get(r.teamId)!;
    return {
      teamId: r.teamId,
      position: r.position,
      played: totals.played,
      wins: totals.wins,
      draws: totals.draws,
      losses: totals.losses,
      goalsFor: totals.goalsFor,
      goalsAgainst: totals.goalsAgainst,
      goalDifference: totals.goalsFor - totals.goalsAgainst,
      points: totals.points,
      conductScore: conduct.incomplete ? undefined : conduct.score,
      qualification: deriveQualification(r.position, r.provisional),
      tiebreakerUsed: r.tiebreakerUsed,
      provisional: r.provisional,
    };
  });

  return { groupId, rows };
}

// ─── Qualification assignment ─────────────────────────────────────────────────

function deriveQualification(position: number, provisional: boolean): QualificationStatus {
  if (provisional) return "UNRESOLVED";
  if (position === 1 || position === 2) return "DIRECT";
  if (position === 3) return "THIRD_PLACE_QUALIFIER";
  return "OUTSIDE";
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function groupByPosition(items: RankedTeam[]): Map<number, RankedTeam[]> {
  const map = new Map<number, RankedTeam[]>();
  for (const item of items) {
    if (!map.has(item.position)) map.set(item.position, []);
    map.get(item.position)!.push(item);
  }
  return map;
}
