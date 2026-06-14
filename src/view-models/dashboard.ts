import { BRACKET_TOPOLOGY } from "../data/bracket-topology";
import {
  FINISHED_STATUSES,
  LIVE_STATUSES,
  type BracketMatchDefinition,
  type BracketProjectionMatch as DomainBracketProjectionMatch,
  type GroupId,
  type GroupStandings,
  type Match,
  type MatchScore,
  type NormalizedMatchStatus,
  type ParticipantSlot,
  type StandingRow,
  type Team,
  type ThirdPlaceRanking,
  type ThirdPlaceRankingRow,
  type TournamentRound,
  type TournamentSnapshot,
} from "../domain";

export type TimeDisplayMode = "LOCAL" | "UTC";

export interface DashboardFormatOptions {
  locale: string;
  timeDisplayMode: TimeDisplayMode;
  now: Date;
  localTimeZone?: string;
}

export type BracketProjectionMatch = DomainBracketProjectionMatch;

export interface DashboardViewModelInput {
  snapshot: TournamentSnapshot;
  groupStandings: readonly GroupStandings[];
  thirdPlaceRanking: ThirdPlaceRanking;
  bracketProjection?: readonly BracketProjectionMatch[];
}

export interface TeamViewModel {
  id: string;
  name: string;
  shortName: string;
  fifaCode: string;
  flagUrl?: string;
  flagAlt: string;
}

export interface HeaderViewModel {
  id: "dashboard-header";
  title: "World Cup 2026 Dashboard";
  stage: TournamentStageViewModel;
  live: LiveSummaryViewModel;
  generatedAtIso: string;
  sourceUpdatedAtIso?: string;
  updatedLabel: string;
  updatedAccessibleLabel: string;
  stale: boolean;
  staleLabel?: string;
  warnings: readonly string[];
}

export interface TournamentStageViewModel {
  id: string;
  round: TournamentRound | "TOURNAMENT_COMPLETE" | "UNKNOWN";
  label: string;
}

export interface LiveSummaryViewModel {
  id: "live-summary";
  isLive: boolean;
  count: number;
  label: string;
  accessibleLabel: string;
  matchIds: readonly string[];
}

export interface ParticipantViewModel {
  id: string;
  side: "HOME" | "AWAY";
  state: ParticipantSlot["state"];
  label: string;
  team?: TeamViewModel;
  sourceExplanation?: string;
  stateLabel: string;
  currentlyAhead: boolean;
  advancing: boolean;
  accessibleName: string;
}

export interface ScoreViewModel {
  normalTime: MatchScore;
  extraTime: MatchScore;
  total: MatchScore;
  penalties: MatchScore;
  totalLabel: string;
  penaltiesLabel?: string;
  accessibleLabel: string;
}

export interface BracketMatchViewModel {
  id: string;
  matchNumber: number;
  matchLabel: string;
  round: Exclude<TournamentRound, "GROUP_STAGE">;
  roundLabel: string;
  status: NormalizedMatchStatus;
  statusLabel: string;
  clockLabel?: string;
  kickoffUtc: string | null;
  kickoffLabel: string;
  venue?: string;
  city?: string;
  locationLabel?: string;
  home: ParticipantViewModel;
  away: ParticipantViewModel;
  score: ScoreViewModel;
  accessibleName: string;
}

export interface BracketRoundViewModel {
  id: string;
  round: Exclude<TournamentRound, "GROUP_STAGE">;
  label: string;
  matches: readonly BracketMatchViewModel[];
}

export interface GroupRowViewModel {
  id: string;
  position: number;
  team: TeamViewModel;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  recordLabel: string;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  goalDifferenceLabel: string;
  points: number;
  qualification: StandingRow["qualification"];
  qualificationLabel: string;
  provisional: boolean;
  explanation?: string;
  accessibleName: string;
}

export interface GroupViewModel {
  id: string;
  groupId: GroupId;
  label: string;
  live: boolean;
  liveLabel?: "Live";
  rows: readonly GroupRowViewModel[];
  accessibleName: string;
}

export interface ThirdPlaceRowViewModel {
  id: string;
  rank: number;
  groupId: GroupId;
  team: TeamViewModel;
  played: number;
  goalDifference: number;
  goalDifferenceLabel: string;
  goalsFor: number;
  conductScore?: number;
  conductLabel: string;
  points: number;
  qualifying: boolean | null;
  statusLabel: "Qualifying" | "Outside" | "Unresolved";
  provisional: boolean;
  tiebreakerLabel?: string;
  explanation?: string;
  qualificationLineAfter: boolean;
  accessibleName: string;
}

export interface ThirdPlaceTableViewModel {
  id: "third-place-table";
  label: "Best third-place teams";
  boundaryResolved: boolean;
  qualificationBoundary: 8;
  rows: readonly ThirdPlaceRowViewModel[];
  accessibleName: string;
}

export interface DashboardViewModel {
  id: "dashboard";
  header: HeaderViewModel;
  bracket: readonly BracketRoundViewModel[];
  groups: readonly GroupViewModel[];
  thirdPlace: ThirdPlaceTableViewModel;
}

const GROUP_IDS: readonly GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const ROUND_ORDER: readonly TournamentRound[] = [
  "GROUP_STAGE",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];
const KNOCKOUT_ROUNDS = ROUND_ORDER.slice(1) as readonly Exclude<TournamentRound, "GROUP_STAGE">[];
const UPCOMING_STATUSES = new Set<NormalizedMatchStatus>(["SCHEDULED", "PRE_MATCH"]);

const ROUND_LABELS: Record<TournamentRound, string> = {
  GROUP_STAGE: "Group stage",
  ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINAL: "Quarter-finals",
  SEMI_FINAL: "Semi-finals",
  THIRD_PLACE: "Third-place match",
  FINAL: "Final",
};

const STATUS_LABELS: Record<NormalizedMatchStatus, string> = {
  SCHEDULED: "Scheduled",
  PRE_MATCH: "Pre-match",
  FIRST_HALF: "First half",
  HALF_TIME: "Half-time",
  SECOND_HALF: "Second half",
  EXTRA_TIME: "Extra time",
  EXTRA_TIME_BREAK: "Extra-time break",
  PENALTY_SHOOTOUT: "Penalty shootout",
  FINISHED: "Finished",
  FINISHED_AFTER_EXTRA_TIME: "Finished after extra time",
  FINISHED_AFTER_PENALTIES: "Finished after penalties",
  POSTPONED: "Postponed",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
  UNKNOWN: "Status unavailable",
};

export function buildDashboardViewModel(
  input: DashboardViewModelInput,
  options: DashboardFormatOptions,
): DashboardViewModel {
  const teamsById = new Map(input.snapshot.teams.map((team) => [team.id, team]));
  const matchesByNumber = new Map(input.snapshot.matches.map((match) => [match.matchNumber, match]));
  const projectionsByNumber = new Map(
    (input.bracketProjection ?? []).map((projection) => [projection.matchNumber, projection]),
  );
  const liveMatches = input.snapshot.matches.filter((match) => LIVE_STATUSES.has(match.status));

  return {
    id: "dashboard",
    header: buildHeader(input.snapshot, liveMatches, options),
    bracket: KNOCKOUT_ROUNDS.map((round) => ({
      id: `bracket-round-${round.toLowerCase()}`,
      round,
      label: ROUND_LABELS[round],
      matches: BRACKET_TOPOLOGY.filter((definition) => definition.round === round).map((definition) =>
        buildBracketMatch(
          definition,
          matchesByNumber.get(definition.matchNumber),
          projectionsByNumber.get(definition.matchNumber),
          teamsById,
          options,
        ),
      ),
    })),
    groups: buildGroups(input.groupStandings, input.snapshot.matches, teamsById),
    thirdPlace: buildThirdPlace(input.thirdPlaceRanking, teamsById),
  };
}

export function deriveTournamentStage(matches: readonly Match[]): TournamentStageViewModel {
  const final = matches.find((match) => match.round === "FINAL");
  if (final !== undefined && FINISHED_STATUSES.has(final.status)) {
    return { id: "stage-tournament-complete", round: "TOURNAMENT_COMPLETE", label: "Tournament complete" };
  }

  const liveRound = selectRound(matches.filter((match) => LIVE_STATUSES.has(match.status)), "highest");
  if (liveRound !== undefined) return stageForRound(liveRound);

  const upcomingRound = selectRound(matches.filter((match) => UPCOMING_STATUSES.has(match.status)), "lowest");
  if (upcomingRound !== undefined) return stageForRound(upcomingRound);

  const finishedRound = selectRound(matches.filter((match) => FINISHED_STATUSES.has(match.status)), "highest");
  if (finishedRound !== undefined) return stageForRound(finishedRound);

  return { id: "stage-unknown", round: "UNKNOWN", label: "Stage unavailable" };
}

function buildHeader(
  snapshot: TournamentSnapshot,
  liveMatches: readonly Match[],
  options: DashboardFormatOptions,
): HeaderViewModel {
  const updatedAtIso = snapshot.sourceUpdatedAt ?? snapshot.generatedAt;
  const updatedLabel = relativeUpdatedLabel(updatedAtIso, options.now);
  const liveCount = liveMatches.length;
  return {
    id: "dashboard-header",
    title: "World Cup 2026 Dashboard",
    stage: deriveTournamentStage(snapshot.matches),
    live: {
      id: "live-summary",
      isLive: liveCount > 0,
      count: liveCount,
      label: liveCount === 0 ? "No live matches" : liveCount === 1 ? "1 match live" : `${liveCount} matches live`,
      accessibleLabel:
        liveCount === 0 ? "There are no matches in progress" : `${liveCount} ${liveCount === 1 ? "match is" : "matches are"} in progress`,
      matchIds: liveMatches.map((match) => `match-${match.matchNumber}`),
    },
    generatedAtIso: snapshot.generatedAt,
    sourceUpdatedAtIso: snapshot.sourceUpdatedAt,
    updatedLabel,
    updatedAccessibleLabel: `${updatedLabel}. ${formatDateTime(updatedAtIso, options)}`,
    stale: snapshot.stale,
    staleLabel: snapshot.stale ? "Last known data" : undefined,
    warnings: snapshot.diagnostics.warnings,
  };
}

function buildBracketMatch(
  definition: BracketMatchDefinition,
  match: Match | undefined,
  projection: BracketProjectionMatch | undefined,
  teamsById: ReadonlyMap<string, Team>,
  options: DashboardFormatOptions,
): BracketMatchViewModel {
  const homeSlot = projection?.homeParticipant ?? slotFromMatchOrSource(match?.homeTeamId, definition.homeSource);
  const awaySlot = projection?.awayParticipant ?? slotFromMatchOrSource(match?.awayTeamId, definition.awaySource);
  const score = buildScore(match);
  const ahead = liveAhead(match, score);
  const home = buildParticipant("HOME", definition.matchNumber, homeSlot, teamsById, ahead, match?.winnerTeamId);
  const away = buildParticipant("AWAY", definition.matchNumber, awaySlot, teamsById, ahead, match?.winnerTeamId);
  const status = match?.status ?? "SCHEDULED";
  const kickoffUtc = match?.kickoffUtc ?? null;
  const kickoffLabel = kickoffUtc === null ? "Kickoff time unavailable" : formatDateTime(kickoffUtc, options);
  const statusLabel = STATUS_LABELS[status];
  const clockLabel = buildClockLabel(status, match?.elapsedMinutes);
  const locationLabel = [match?.venue, match?.city].filter(Boolean).join(", ") || undefined;

  return {
    id: `match-${definition.matchNumber}`,
    matchNumber: definition.matchNumber,
    matchLabel: `M${definition.matchNumber}`,
    round: definition.round,
    roundLabel: ROUND_LABELS[definition.round],
    status,
    statusLabel,
    clockLabel,
    kickoffUtc,
    kickoffLabel,
    venue: match?.venue,
    city: match?.city,
    locationLabel,
    home,
    away,
    score,
    accessibleName: [
      `Match ${definition.matchNumber}`,
      home.label,
      score.accessibleLabel,
      away.label,
      statusLabel,
      clockLabel,
      kickoffLabel,
    ].filter(Boolean).join(", "),
  };
}

function buildParticipant(
  side: "HOME" | "AWAY",
  matchNumber: number,
  slot: ParticipantSlot,
  teamsById: ReadonlyMap<string, Team>,
  ahead: "HOME" | "AWAY" | null,
  winnerTeamId: string | undefined,
): ParticipantViewModel {
  const team = slot.teamId === undefined ? undefined : teamsById.get(slot.teamId);
  const teamModel = team === undefined ? undefined : buildTeam(team);
  const label = teamModel?.name ?? slot.label ?? "Team unavailable";
  const stateLabel = participantStateLabel(slot.state);
  const sourceExplanation = slot.unresolvedReason
    ?? slot.qualificationSource
    ?? (slot.state === "PLACEHOLDER" ? `Awaiting ${label}` : undefined);
  const currentlyAhead = ahead === side;
  const advancing = team?.id === winnerTeamId;
  return {
    id: `match-${matchNumber}-${side.toLowerCase()}`,
    side,
    state: slot.state,
    label,
    team: teamModel,
    sourceExplanation,
    stateLabel,
    currentlyAhead,
    advancing,
    accessibleName: [
      label,
      stateLabel,
      sourceExplanation,
      currentlyAhead ? "currently ahead" : undefined,
      advancing ? "advancing" : undefined,
    ].filter(Boolean).join(", "),
  };
}

function buildScore(match: Match | undefined): ScoreViewModel {
  const normalTime = normalizeScore(match?.normalTime);
  const extraTime = normalizeScore(match?.extraTime);
  const penalties = normalizeScore(match?.penalties);
  const total = addScores(normalTime, extraTime);
  const totalLabel = scoreLabel(total);
  const penaltiesPresent = penalties.home !== null || penalties.away !== null;
  const penaltiesLabel = penaltiesPresent
    ? `${match?.status === "PENALTY_SHOOTOUT" ? "PEN" : "Pens"} ${scoreLabel(penalties)}`
    : match?.status === "PENALTY_SHOOTOUT" || match?.status === "FINISHED_AFTER_PENALTIES"
      ? "Penalties unavailable"
      : undefined;
  return {
    normalTime,
    extraTime,
    total,
    penalties,
    totalLabel,
    penaltiesLabel,
    accessibleLabel: total.home === null || total.away === null
      ? "score unavailable"
      : `${total.home} to ${total.away}${penaltiesLabel === undefined ? "" : `, ${penaltiesLabel}`}`,
  };
}

function buildGroups(
  standings: readonly GroupStandings[],
  matches: readonly Match[],
  teamsById: ReadonlyMap<string, Team>,
): GroupViewModel[] {
  const standingsByGroup = new Map(standings.map((group) => [group.groupId, group]));
  const liveGroups = new Set(matches.filter((match) => LIVE_STATUSES.has(match.status)).map((match) => match.group));
  return GROUP_IDS.map((groupId) => {
    const rows = (standingsByGroup.get(groupId)?.rows ?? []).map((row) => buildGroupRow(groupId, row, teamsById));
    const live = liveGroups.has(groupId);
    return {
      id: `group-${groupId.toLowerCase()}`,
      groupId,
      label: `Group ${groupId}`,
      live,
      liveLabel: live ? "Live" : undefined,
      rows,
      accessibleName: `Group ${groupId}${live ? ", live matches in progress" : ""}`,
    };
  });
}

function buildGroupRow(groupId: GroupId, row: StandingRow, teamsById: ReadonlyMap<string, Team>): GroupRowViewModel {
  const team = buildTeamOrMissing(row.teamId, teamsById);
  const qualificationLabel = groupQualificationLabel(row);
  const explanation = row.provisional
    ? `Provisional placement${row.tiebreakerUsed === undefined ? "" : `; active tiebreaker: ${row.tiebreakerUsed}`}`
    : row.tiebreakerUsed === undefined ? undefined : `Placed using ${row.tiebreakerUsed}`;
  return {
    id: `group-${groupId.toLowerCase()}-team-${row.teamId}`,
    position: row.position,
    team,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    recordLabel: `${row.wins}-${row.draws}-${row.losses}`,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    goalDifferenceLabel: signedNumber(row.goalDifference),
    points: row.points,
    qualification: row.qualification,
    qualificationLabel,
    provisional: row.provisional,
    explanation,
    accessibleName: `${row.position}. ${team.name}, ${row.points} points, goal difference ${signedNumber(row.goalDifference)}, ${qualificationLabel}${explanation === undefined ? "" : `, ${explanation}`}`,
  };
}

function buildThirdPlace(ranking: ThirdPlaceRanking, teamsById: ReadonlyMap<string, Team>): ThirdPlaceTableViewModel {
  return {
    id: "third-place-table",
    label: "Best third-place teams",
    boundaryResolved: ranking.boundaryResolved,
    qualificationBoundary: 8,
    rows: ranking.rows.map((row) => buildThirdPlaceRow(row, teamsById)),
    accessibleName: ranking.boundaryResolved
      ? "Best third-place teams; top eight qualify"
      : "Best third-place teams; qualification boundary unresolved",
  };
}

function buildThirdPlaceRow(row: ThirdPlaceRankingRow, teamsById: ReadonlyMap<string, Team>): ThirdPlaceRowViewModel {
  const team = buildTeamOrMissing(row.teamId, teamsById);
  const statusLabel = row.qualifying === null ? "Unresolved" : row.qualifying ? "Qualifying" : "Outside";
  const explanation = row.qualifying === null
    ? `Qualification is unresolved${row.tiebreakerUsed === undefined ? "" : ` at ${row.tiebreakerUsed}`}`
    : row.provisional
      ? `Provisional ranking${row.tiebreakerUsed === undefined ? "" : ` using ${row.tiebreakerUsed}`}`
      : row.tiebreakerUsed === undefined ? undefined : `Ranked using ${row.tiebreakerUsed}`;
  return {
    id: `third-place-team-${row.teamId}`,
    rank: row.rank,
    groupId: row.groupId,
    team,
    played: row.played,
    goalDifference: row.goalDifference,
    goalDifferenceLabel: signedNumber(row.goalDifference),
    goalsFor: row.goalsFor,
    conductScore: row.conductScore,
    conductLabel: row.conductScore === undefined ? "—" : String(row.conductScore),
    points: row.points,
    qualifying: row.qualifying,
    statusLabel,
    provisional: row.provisional,
    tiebreakerLabel: row.tiebreakerUsed,
    explanation,
    qualificationLineAfter: row.rank === 8,
    accessibleName: `${row.rank}. ${team.name}, Group ${row.groupId}, ${row.points} points, ${statusLabel}${explanation === undefined ? "" : `, ${explanation}`}`,
  };
}

function slotFromMatchOrSource(teamId: string | undefined, source: BracketMatchDefinition["homeSource"]): ParticipantSlot {
  if (teamId !== undefined) return { state: "CONFIRMED", teamId };
  switch (source.type) {
    case "GROUP_WINNER": return { state: "PLACEHOLDER", label: `1${source.group}` };
    case "GROUP_RUNNER_UP": return { state: "PLACEHOLDER", label: `2${source.group}` };
    case "THIRD_PLACE": return { state: "PLACEHOLDER", label: `3${source.groups}` };
    case "MATCH_WINNER": return { state: "PLACEHOLDER", label: `Winner M${source.matchNumber}` };
    case "MATCH_LOSER": return { state: "PLACEHOLDER", label: `Loser M${source.matchNumber}` };
  }
}

function buildTeam(team: Team): TeamViewModel {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    fifaCode: team.fifaCode,
    flagUrl: safeHttpsUrl(team.flagUrl),
    flagAlt: `${team.name} flag`,
  };
}

function buildTeamOrMissing(teamId: string, teamsById: ReadonlyMap<string, Team>): TeamViewModel {
  const team = teamsById.get(teamId);
  return team === undefined
    ? { id: teamId, name: "Team unavailable", shortName: "—", fifaCode: "—", flagAlt: "" }
    : buildTeam(team);
}

function safeHttpsUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function normalizeScore(score: MatchScore | undefined): MatchScore {
  return { home: score?.home ?? null, away: score?.away ?? null };
}

function addScores(normal: MatchScore, extra: MatchScore): MatchScore {
  return {
    home: normal.home === null ? null : normal.home + (extra.home ?? 0),
    away: normal.away === null ? null : normal.away + (extra.away ?? 0),
  };
}

function scoreLabel(score: MatchScore): string {
  return score.home === null || score.away === null ? "—" : `${score.home}–${score.away}`;
}

function liveAhead(match: Match | undefined, score: ScoreViewModel): "HOME" | "AWAY" | null {
  if (match === undefined || !LIVE_STATUSES.has(match.status)) return null;
  const relevant = match.status === "PENALTY_SHOOTOUT" ? score.penalties : score.total;
  if (relevant.home === null || relevant.away === null || relevant.home === relevant.away) return null;
  return relevant.home > relevant.away ? "HOME" : "AWAY";
}

function buildClockLabel(status: NormalizedMatchStatus, elapsedMinutes: number | undefined): string | undefined {
  if (status === "HALF_TIME") return "HT";
  if (status === "EXTRA_TIME_BREAK") return "ET break";
  if (status === "PENALTY_SHOOTOUT") return "PEN";
  if (elapsedMinutes === undefined || !LIVE_STATUSES.has(status)) return undefined;
  return `${status === "EXTRA_TIME" ? "ET " : ""}${elapsedMinutes}′`;
}

function participantStateLabel(state: ParticipantSlot["state"]): string {
  switch (state) {
    case "PLACEHOLDER": return "Awaiting participant";
    case "PROJECTED": return "Projected";
    case "CONFIRMED": return "Confirmed";
    case "UNRESOLVED": return "Unresolved";
    case "SUPERSEDED": return "Superseded";
  }
}

function groupQualificationLabel(row: StandingRow): string {
  const prefix = row.provisional ? "Provisional: " : "";
  switch (row.qualification) {
    case "DIRECT": return `${prefix}Direct qualifier`;
    case "THIRD_PLACE_QUALIFIER": return `${prefix}Qualifying third-place team`;
    case "OUTSIDE": return `${prefix}Outside qualification`;
    case "UNRESOLVED": return "Qualification unresolved";
  }
}

function signedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function stageForRound(round: TournamentRound): TournamentStageViewModel {
  return { id: `stage-${round.toLowerCase()}`, round, label: ROUND_LABELS[round] };
}

function selectRound(matches: readonly Match[], direction: "lowest" | "highest"): TournamentRound | undefined {
  const rounds = matches.map((match) => match.round);
  return rounds.sort((left, right) => {
    const difference = ROUND_ORDER.indexOf(left) - ROUND_ORDER.indexOf(right);
    return direction === "lowest" ? difference : -difference;
  })[0];
}

function formatDateTime(iso: string, options: DashboardFormatOptions): string {
  const timeZone = options.timeDisplayMode === "UTC" ? "UTC" : options.localTimeZone;
  return new Intl.DateTimeFormat(options.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone === undefined ? {} : { timeZone }),
    timeZoneName: "short",
  }).format(new Date(iso));
}

function relativeUpdatedLabel(iso: string, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `Updated ${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  return `Updated ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
}
