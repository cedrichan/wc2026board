import type {
  CardType,
  DataDiagnostics,
  DisciplinaryCoverage,
  DisciplinaryEvent,
  GroupId,
  Match,
  MatchEvent,
  MatchEventType,
  MatchScore,
  PartialTeam,
  TournamentRound,
} from "../../domain";
import { deduplicateMatches, deduplicateTeams } from "./deduplicate";
import { normalizeIsoTimestamp, sanitizeEspnImageUrl, sanitizeProviderText } from "./sanitize";
import { normalizeEspnStatus, type EspnStatusInput } from "./status";

export type ConductCoverage = "UNKNOWN" | "PARTIAL" | "COMPLETE";

export interface EspnTeamInput {
  id?: string | null;
  fifaCode?: string | null;
  name?: string | null;
  shortName?: string | null;
  group?: string | null;
  imageUrl?: string | null;
}

export interface EspnCompetitorInput {
  homeAway: "home" | "away";
  team: EspnTeamInput;
  score?: number | string | null;
  normalTimeScore?: number | string | null;
  extraTimeScore?: number | string | null;
  penaltyScore?: number | string | null;
  winner?: boolean | null;
}

export interface EspnDisciplinaryEventInput {
  teamId?: string | null;
  playerId?: string | null;
  playerName?: string | null;
  cardType?: string | null;
  minute?: number | null;
}

export interface EspnMatchEventInput {
  id?: string | null;
  clockSeconds?: number | null;
  clockDisplay?: string | null;
  teamId?: string | null;
  primaryPlayerName?: string | null;
  scoringPlay?: boolean | null;
  yellowCard?: boolean | null;
  redCard?: boolean | null;
  penaltyKick?: boolean | null;
  ownGoal?: boolean | null;
  shootout?: boolean | null;
}

export interface EspnMatchInput {
  id?: string | null;
  matchNumber?: number | null;
  round?: string | null;
  group?: string | null;
  kickoffUtc?: string | null;
  updatedAt?: string | null;
  venue?: string | null;
  city?: string | null;
  status: EspnStatusInput;
  competitors?: EspnCompetitorInput[] | null;
  disciplinaryEvents?: EspnDisciplinaryEventInput[] | null;
  conductCoverage?: ConductCoverage | null;
  matchEvents?: EspnMatchEventInput[] | null;
}

export interface EspnScoreboardInput {
  sourceUpdatedAt?: string | null;
  matches: EspnMatchInput[];
}

export interface EspnNormalizationResult {
  teams: PartialTeam[];
  matches: Match[];
  sourceUpdatedAt?: string;
  diagnostics: DataDiagnostics;
}

const GROUPS = new Set<string>(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);
const ROUNDS = new Set<TournamentRound>([
  "GROUP_STAGE",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
]);
const CARD_TYPES = new Set<CardType>(["YELLOW", "RED_INDIRECT", "RED_DIRECT", "YELLOW_PLUS_DIRECT_RED"]);

function groupId(value: unknown): GroupId | undefined {
  const candidate = sanitizeProviderText(value)?.replace(/^GROUP\s+/i, "").toUpperCase();
  return candidate && GROUPS.has(candidate) ? candidate as GroupId : undefined;
}

function round(value: unknown): TournamentRound | undefined {
  const candidate = sanitizeProviderText(value)?.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return candidate && ROUNDS.has(candidate as TournamentRound) ? candidate as TournamentRound : undefined;
}

function providerId(value: unknown): string | undefined {
  return sanitizeProviderText(value);
}

function score(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function matchScore(
  home: EspnCompetitorInput | undefined,
  away: EspnCompetitorInput | undefined,
  field: "score" | "normalTimeScore" | "extraTimeScore" | "penaltyScore",
): MatchScore | undefined {
  const result = { home: score(home?.[field]), away: score(away?.[field]) };
  return result.home === null && result.away === null ? undefined : result;
}

function normalizeTeam(input: EspnTeamInput, diagnostics: DataDiagnostics): PartialTeam | undefined {
  const id = providerId(input.id);
  if (!id) {
    diagnostics.warnings.push("Omitted team without an ESPN ID");
    diagnostics.missingFields.push("teams[].id");
    diagnostics.issues?.push({
      code: "MISSING_ESPN_ID",
      message: "Omitted team without an ESPN ID.",
      path: "teams[].id",
      field: "id",
    });
    return undefined;
  }

  const fifaCode = sanitizeProviderText(input.fifaCode)?.toUpperCase();
  const name = sanitizeProviderText(input.name);
  const shortName = sanitizeProviderText(input.shortName);
  const group = groupId(input.group);
  for (const [field, value] of Object.entries({ fifaCode, name, shortName, group })) {
    if (!value) diagnostics.missingFields.push(`teams[${id}].${field}`);
  }

  const flagUrl = sanitizeEspnImageUrl(input.imageUrl);
  if (input.imageUrl && !flagUrl) diagnostics.warnings.push(`Rejected unsafe image URL for team ${id}`);
  if (!flagUrl) diagnostics.missingFields.push(`teams[${id}].flagUrl`);
  return {
    id,
    ...(fifaCode ? { fifaCode } : {}),
    ...(name ? { name } : {}),
    ...(shortName ? { shortName } : {}),
    ...(group ? { group } : {}),
    ...(flagUrl ? { flagUrl } : {}),
  };
}

function normalizeDisciplinaryEvents(
  input: EspnMatchInput,
  matchId: string,
  diagnostics: DataDiagnostics,
): DisciplinaryEvent[] | undefined {
  if (input.conductCoverage !== "COMPLETE") {
    diagnostics.missingFields.push(`matches[${matchId}].disciplinaryEvents`);
    diagnostics.warnings.push(`Match ${matchId} conduct coverage is ${input.conductCoverage ?? "UNKNOWN"}`);
    return undefined;
  }

  const events: DisciplinaryEvent[] = [];
  for (const event of input.disciplinaryEvents ?? []) {
    const teamId = providerId(event.teamId);
    const cardType = sanitizeProviderText(event.cardType)?.toUpperCase() as CardType | undefined;
    if (!teamId || !cardType || !CARD_TYPES.has(cardType)) {
      diagnostics.warnings.push(`Omitted invalid disciplinary event for match ${matchId}`);
      continue;
    }
    events.push({
      teamId,
      ...(providerId(event.playerId) ? { playerId: providerId(event.playerId) } : {}),
      ...(sanitizeProviderText(event.playerName) ? { playerName: sanitizeProviderText(event.playerName) } : {}),
      ...(typeof event.minute === "number" && Number.isInteger(event.minute) && event.minute >= 0
        ? { minute: event.minute }
        : {}),
      cardType,
    });
  }
  return events;
}

function classifyMatchEventType(input: EspnMatchEventInput): MatchEventType | undefined {
  if (input.shootout) return undefined; // too noisy; suppress shootout entries
  if (input.scoringPlay) {
    if (input.ownGoal) return "OWN_GOAL";
    if (input.penaltyKick) return "PENALTY_GOAL";
    return "GOAL";
  }
  if (input.yellowCard && input.redCard) return "YELLOW_RED_CARD";
  if (input.yellowCard) return "YELLOW_CARD";
  if (input.redCard) return "RED_CARD";
  return undefined;
}

function normalizeMatchEvents(input: EspnMatchInput): MatchEvent[] | undefined {
  const raw = input.matchEvents;
  if (!raw || raw.length === 0) return undefined;
  const events: MatchEvent[] = [];
  for (const ev of raw) {
    const type = classifyMatchEventType(ev);
    if (!type) continue;
    events.push({
      ...(ev.id ? { id: ev.id } : {}),
      type,
      ...(typeof ev.clockSeconds === "number" && ev.clockSeconds >= 0 ? { clockSeconds: ev.clockSeconds } : {}),
      ...(ev.clockDisplay ? { clockDisplay: ev.clockDisplay } : {}),
      ...(ev.teamId ? { teamId: ev.teamId } : {}),
      ...(ev.primaryPlayerName ? { primaryPlayerName: ev.primaryPlayerName } : {}),
    });
  }
  return events.length > 0 ? events : undefined;
}

function normalizeMatch(input: EspnMatchInput, diagnostics: DataDiagnostics): Match | undefined {
  const id = providerId(input.id);
  if (!id) {
    diagnostics.warnings.push("Omitted match without an ESPN ID");
    diagnostics.missingFields.push("matches[].id");
    diagnostics.issues?.push({
      code: "MISSING_ESPN_ID",
      message: "Omitted match without an ESPN ID.",
      path: "matches[].id",
      field: "id",
    });
    return undefined;
  }
  const normalizedRound = round(input.round);
  const kickoffUtc = normalizeIsoTimestamp(input.kickoffUtc);
  if (!Number.isInteger(input.matchNumber) || !normalizedRound || !kickoffUtc) {
    diagnostics.warnings.push(`Omitted match ${id} with incomplete required identity`);
    if (!Number.isInteger(input.matchNumber)) diagnostics.missingFields.push(`matches[${id}].matchNumber`);
    if (!normalizedRound) diagnostics.missingFields.push(`matches[${id}].round`);
    if (!kickoffUtc) diagnostics.missingFields.push(`matches[${id}].kickoffUtc`);
    return undefined;
  }

  const home = input.competitors?.find((competitor) => competitor.homeAway === "home");
  const away = input.competitors?.find((competitor) => competitor.homeAway === "away");
  const homeTeamId = providerId(home?.team.id);
  const awayTeamId = providerId(away?.team.id);
  const normalizedStatus = normalizeEspnStatus(input.status);
  if (normalizedStatus.status === "UNKNOWN") {
    diagnostics.warnings.push(`Match ${id} has unknown ESPN status: ${normalizedStatus.observedStatus || "(empty)"}`);
    diagnostics.missingFields.push(`matches[${id}].status`);
    diagnostics.issues?.push({
      code: "UNKNOWN_STATUS",
      message: `Match ${id} has an unknown ESPN status.`,
      matchId: id,
      field: "status",
    });
  }

  const normalTime = matchScore(home, away, home?.normalTimeScore !== undefined || away?.normalTimeScore !== undefined ? "normalTimeScore" : "score");
  const extraTime = matchScore(home, away, "extraTimeScore");
  const penalties = matchScore(home, away, "penaltyScore");
  const completed = normalizedStatus.status.startsWith("FINISHED");
  const winner = completed
    ? [home, away].find((competitor) => competitor?.winner === true)
    : undefined;
  const disciplinaryEvents = normalizeDisciplinaryEvents(input, id, diagnostics);
  const matchEvents = normalizeMatchEvents(input);
  const venue = sanitizeProviderText(input.venue);
  const city = sanitizeProviderText(input.city);
  if (!venue) diagnostics.missingFields.push(`matches[${id}].venue`);
  if (!city) diagnostics.missingFields.push(`matches[${id}].city`);

  return {
    id,
    matchNumber: input.matchNumber as number,
    round: normalizedRound,
    ...(normalizedRound === "GROUP_STAGE" && groupId(input.group) ? { group: groupId(input.group) } : {}),
    kickoffUtc,
    ...(venue ? { venue } : {}),
    ...(city ? { city } : {}),
    status: normalizedStatus.status,
    ...(normalizedStatus.clock ? { clock: normalizedStatus.clock } : {}),
    ...(normalizedStatus.elapsedMinutes !== undefined ? { elapsedMinutes: normalizedStatus.elapsedMinutes } : {}),
    ...(homeTeamId ? { homeTeamId } : {}),
    ...(awayTeamId ? { awayTeamId } : {}),
    ...(normalTime ? { normalTime } : {}),
    ...(extraTime ? { extraTime } : {}),
    ...(penalties ? { penalties } : {}),
    ...(winner?.team.id && providerId(winner.team.id) ? { winnerTeamId: providerId(winner.team.id) } : {}),
    ...(disciplinaryEvents ? { disciplinaryEvents } : {}),
    disciplinaryCoverage: (
      input.conductCoverage === "COMPLETE"
        ? "COMPLETE"
        : input.conductCoverage === "PARTIAL"
          ? "INCOMPLETE"
          : "UNAVAILABLE"
    ) satisfies DisciplinaryCoverage,
    ...(matchEvents ? { events: matchEvents } : {}),
    ...(normalizeIsoTimestamp(input.updatedAt) ? { updatedAt: normalizeIsoTimestamp(input.updatedAt) } : {}),
  };
}

export function normalizeEspnScoreboards(inputs: readonly EspnScoreboardInput[]): EspnNormalizationResult {
  const diagnostics: DataDiagnostics = {
    provider: "espn",
    warnings: [],
    unresolvedTiebreakers: [],
    missingFields: [],
    issues: [],
  };
  const teams: PartialTeam[] = [];
  const matches: Match[] = [];
  const sourceTimestamps: string[] = [];

  for (const scoreboard of inputs) {
    const sourceUpdatedAt = normalizeIsoTimestamp(scoreboard.sourceUpdatedAt);
    if (sourceUpdatedAt) sourceTimestamps.push(sourceUpdatedAt);
    for (const input of scoreboard.matches) {
      for (const competitor of input.competitors ?? []) {
        const team = normalizeTeam(competitor.team, diagnostics);
        if (team) teams.push(team);
      }
      const match = normalizeMatch(input, diagnostics);
      if (match) matches.push(match);
    }
  }

  const uniqueTeams = deduplicateTeams(teams);
  const uniqueMatches = deduplicateMatches(matches);
  diagnostics.warnings.push(...uniqueTeams.diagnostics, ...uniqueMatches.diagnostics);
  diagnostics.issues?.push(
    ...[...uniqueTeams.diagnostics, ...uniqueMatches.diagnostics].map((message) => ({
      code: "INVARIANT_CONFLICT",
      message,
    })),
  );
  diagnostics.warnings = [...new Set(diagnostics.warnings)].sort();
  diagnostics.missingFields = [...new Set(diagnostics.missingFields)].sort();
  diagnostics.issues = diagnostics.issues
    ?.filter((issue, index, issues) =>
      issues.findIndex((candidate) =>
        candidate.code === issue.code &&
        candidate.message === issue.message &&
        candidate.path === issue.path &&
        candidate.matchId === issue.matchId &&
        candidate.field === issue.field
      ) === index
    )
    .sort((left, right) =>
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message)
    );
  sourceTimestamps.sort();

  return {
    teams: uniqueTeams.values,
    matches: uniqueMatches.values,
    ...(sourceTimestamps.length ? { sourceUpdatedAt: sourceTimestamps[sourceTimestamps.length - 1] } : {}),
    diagnostics,
  };
}
