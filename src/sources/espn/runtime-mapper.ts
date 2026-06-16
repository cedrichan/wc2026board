import capturedRange from "./__fixtures__/scoreboard-range-20260611-20260719.json";
import type {
  EspnCompetition,
  EspnCompetitor,
  EspnEvent,
  EspnScoreboard,
} from "./schema";
import { parseEspnScoreboard } from "./schema";
import type {
  ConductCoverage,
  EspnCompetitorInput,
  EspnDisciplinaryEventInput,
  EspnMatchEventInput,
  EspnMatchInput,
  EspnScoreboardInput,
  EspnTeamInput,
} from "./normalize";
import { BRACKET_TOPOLOGY } from "../../data/bracket-topology";
import type { SlotSource } from "../../domain/bracket";

const GROUP_NOTE_PATTERN = /\bGroup\s+([A-L])\b/i;

const ROUND_BY_SEASON_SLUG = {
  "group-stage": "GROUP_STAGE",
  "round-of-32": "ROUND_OF_32",
  "round-of-16": "ROUND_OF_16",
  quarterfinals: "QUARTER_FINAL",
  semifinals: "SEMI_FINAL",
  "3rd-place-match": "THIRD_PLACE",
  final: "FINAL",
} as const;

type RuntimeRound = (typeof ROUND_BY_SEASON_SLUG)[keyof typeof ROUND_BY_SEASON_SLUG];

function extractGroupFromNote(note: string | undefined): string | undefined {
  const match = note?.match(GROUP_NOTE_PATTERN);
  return match?.[1]?.toUpperCase();
}

function resolveRound(event: EspnEvent): RuntimeRound | undefined {
  const slug = event.season?.slug;
  return slug ? ROUND_BY_SEASON_SLUG[slug as keyof typeof ROUND_BY_SEASON_SLUG] : undefined;
}

function kickoff(event: EspnEvent, competition: EspnCompetition): string {
  return competition.startDate ?? competition.date ?? event.date;
}

function scheduleKey(
  round: RuntimeRound | undefined,
  kickoffUtc: string,
  venueName: string | undefined,
): string | undefined {
  if (!round || !venueName) return undefined;
  return `${round}|${kickoffUtc}|${venueName.trim()}`;
}

// Maps "homeCode|awayCode" → FIFA match number for every Round of 32 fixture.
//
// The pre-captured schedule fixture lists events in kickoff-time order, which
// does not always match FIFA match-number order in the knockout stage. For
// example, M76 (Group C winner vs Group F runner-up) kicks off before M74 and
// M75, so it appears at array index 73 in the fixture — which would produce
// the wrong match number (74) if we relied on position alone.
//
// Round of 32 is the only round affected: ESPN's placeholder team abbreviations
// ("1C", "2F", "3RD", etc.) are unique per match and can be cross-referenced
// against the bracket topology to recover the correct FIFA match number. In R16
// and beyond all entries share identical placeholder codes ("RD32 vs RD32",
// "RD16 W1 vs RD16 W2", …) so team codes cannot disambiguate them; however,
// those rounds are verified to be in FIFA match-number order in the fixture, so
// the array-position fallback remains correct there.
function buildR32MatchIndex(): ReadonlyMap<string, number> {
  const index = new Map<string, number>();

  function sourceToCode(source: SlotSource): string | undefined {
    switch (source.type) {
      case "GROUP_WINNER":    return `1${source.group}`;
      case "GROUP_RUNNER_UP": return `2${source.group}`;
      case "THIRD_PLACE":     return "3RD";
      default:                return undefined;
    }
  }

  for (const match of BRACKET_TOPOLOGY) {
    if (match.round !== "ROUND_OF_32") continue;
    const homeCode = sourceToCode(match.homeSource);
    const awayCode = sourceToCode(match.awaySource);
    if (homeCode !== undefined && awayCode !== undefined) {
      index.set(`${homeCode}|${awayCode}`, match.matchNumber);
    }
  }

  return index;
}

const R32_MATCH_NUMBER_BY_TEAM_CODES = buildR32MatchIndex();

// Returns the correct FIFA match number for a Round of 32 competition by
// matching the home and away placeholder abbreviations against the bracket
// topology. Returns undefined if the competitors or their codes are missing.
function resolveR32MatchNumber(competition: EspnCompetition): number | undefined {
  const home = competition.competitors.find((c) => c.homeAway === "home");
  const away = competition.competitors.find((c) => c.homeAway === "away");
  const homeCode = home?.team?.abbreviation;
  const awayCode = away?.team?.abbreviation;
  if (!homeCode || !awayCode) return undefined;
  return R32_MATCH_NUMBER_BY_TEAM_CODES.get(`${homeCode}|${awayCode}`);
}

function buildScheduleIndex(): ReadonlyMap<string, number> {
  const index = new Map<string, number>();

  parseEspnScoreboard(capturedRange).events.forEach((event, eventIndex) => {
    const competition = event.competitions[0];
    if (!competition) return;

    const round = resolveRound(event);
    const key = scheduleKey(round, kickoff(event, competition), competition.venue?.fullName);
    if (!key) return;

    // R32: derive match number from team codes rather than array position,
    // because the fixture is in kickoff order but R32 match numbers are not.
    // All other rounds: array position (1-indexed) equals FIFA match number.
    const matchNumber =
      round === "ROUND_OF_32"
        ? resolveR32MatchNumber(competition)
        : eventIndex + 1;

    if (matchNumber !== undefined) {
      index.set(key, matchNumber);
    }
  });

  return index;
}

const MATCH_NUMBER_BY_SCHEDULE = buildScheduleIndex();

function mapTeam(
  competitor: EspnCompetitor,
  group: string | undefined,
): EspnTeamInput {
  return {
    id: competitor.team?.id ?? competitor.id,
    fifaCode: competitor.team?.abbreviation,
    name: competitor.team?.displayName ?? competitor.team?.name,
    shortName: competitor.team?.abbreviation ?? competitor.team?.shortDisplayName,
    group,
    imageUrl: competitor.team?.logo,
  };
}

function mapCompetitor(
  competitor: EspnCompetitor,
  group: string | undefined,
): EspnCompetitorInput {
  const rawScore = competitor.score;
  const score =
    typeof rawScore === "string" || typeof rawScore === "number"
      ? rawScore
      : rawScore?.value ?? null;

  return {
    homeAway: competitor.homeAway === "away" ? "away" : "home",
    team: mapTeam(competitor, group),
    score,
    winner: competitor.winner,
  };
}

function mapDisciplinaryEvents(
  competition: EspnCompetition,
): { events: EspnDisciplinaryEventInput[]; coverage: ConductCoverage } {
  if (competition.status.type.completed !== true) {
    return { events: [], coverage: "UNKNOWN" };
  }

  const events: EspnDisciplinaryEventInput[] = [];
  for (const detail of competition.details ?? []) {
    const yellow = detail.yellowCard === true;
    const red = detail.redCard === true;
    if (!yellow && !red) continue;

    // ESPN doesn't distinguish direct from indirect reds; treat all as RED_DIRECT.
    // Yellow + red flags both true indicates a yellow-plus-direct-red incident.
    const cardType = yellow && red ? "YELLOW_PLUS_DIRECT_RED" : yellow ? "YELLOW" : "RED_DIRECT";
    const athlete = detail.athletesInvolved?.[0];
    events.push({
      teamId: detail.team?.id,
      playerId: athlete?.id,
      playerName: athlete?.displayName ?? athlete?.shortName,
      cardType,
      minute: typeof detail.clock?.value === "number"
        ? Math.floor(detail.clock.value / 60)
        : undefined,
    });
  }

  return { events, coverage: "COMPLETE" };
}

function mapMatchEvents(competition: EspnCompetition): EspnMatchEventInput[] {
  return (competition.details ?? []).map((detail): EspnMatchEventInput => ({
    id: detail.id,
    clockSeconds: detail.clock?.value,
    clockDisplay: detail.clock?.displayValue,
    teamId: detail.team?.id,
    primaryPlayerName: detail.athletesInvolved?.[0]?.displayName ?? detail.athletesInvolved?.[0]?.shortName,
    scoreValue: detail.scoreValue,
    scoringPlay: detail.scoringPlay,
    yellowCard: detail.yellowCard,
    redCard: detail.redCard,
    penaltyKick: detail.penaltyKick,
    ownGoal: detail.ownGoal,
    shootout: detail.shootout,
  }));
}

function mapEvent(event: EspnEvent): EspnMatchInput {
  const competition = event.competitions[0];
  const round = resolveRound(event);
  const group = round === "GROUP_STAGE"
    ? extractGroupFromNote(competition?.altGameNote)
    : undefined;
  const venueName = competition?.venue?.fullName;
  const kickoffUtc = competition ? kickoff(event, competition) : event.date;
  const matchNumber = MATCH_NUMBER_BY_SCHEDULE.get(
    scheduleKey(round, kickoffUtc, venueName) ?? "",
  );
  const conduct = competition ? mapDisciplinaryEvents(competition) : { events: [], coverage: "UNKNOWN" as ConductCoverage };

  return {
    id: event.id,
    matchNumber,
    round,
    group,
    kickoffUtc,
    venue: venueName,
    city: competition?.venue?.address?.city,
    status: {
      clock: competition?.status.clock,
      displayClock: competition?.status.displayClock,
      period: competition?.status.period,
      type: competition?.status.type,
      name: competition?.status.type.name ?? event.status?.type.name,
      description:
        competition?.status.type.description ?? event.status?.type.description,
      detail: competition?.status.type.detail ?? event.status?.type.detail,
      state: competition?.status.type.state ?? event.status?.type.state,
      completed:
        competition?.status.type.completed ?? event.status?.type.completed,
    },
    competitors: competition?.competitors.map((competitor) =>
      mapCompetitor(competitor, group),
    ),
    disciplinaryEvents: conduct.events,
    conductCoverage: conduct.coverage,
    matchEvents: competition ? mapMatchEvents(competition) : [],
  };
}

export function mapEspnScoreboardToNormalizationInput(
  payload: EspnScoreboard,
): EspnScoreboardInput {
  return {
    sourceUpdatedAt: payload.timestamp,
    matches: payload.events.map((event) => mapEvent(event)),
  };
}
