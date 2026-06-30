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

// Static R32 schedule: "kickoffUtc|venue" → FIFA match number.
//
// The R32 schedule is fixed before the tournament begins. ESPN initially uses
// bracket-position placeholder codes (e.g. "1C", "2F") as team abbreviations
// for unplayed knockout matches, but replaces them with real team codes once
// the group stage completes. This static lookup resolves match numbers by
// kickoff time and venue, which never change, covering both phases.
//
// Derived by cross-referencing the pre-tournament ESPN fixture (git history)
// against the official bracket topology (BRACKET_TOPOLOGY). Venue strings must
// match the competition.venue.fullName values ESPN returns exactly.
const ROUND_OF_32_KICKOFF_SCHEDULE: ReadonlyMap<string, number> = new Map([
  ["2026-06-28T19:00Z|SoFi Stadium", 73],
  ["2026-06-29T17:00Z|NRG Stadium", 76],
  ["2026-06-29T20:30Z|Gillette Stadium", 74],
  ["2026-06-30T01:00Z|Estadio BBVA", 75],
  ["2026-06-30T17:00Z|AT&T Stadium", 78],
  ["2026-06-30T21:00Z|MetLife Stadium", 77],
  ["2026-07-01T01:00Z|Estadio Banorte", 79],
  ["2026-07-01T16:00Z|Mercedes-Benz Stadium", 80],
  ["2026-07-01T20:00Z|Lumen Field", 82],
  ["2026-07-02T00:00Z|Levi's Stadium", 81],
  ["2026-07-02T19:00Z|SoFi Stadium", 84],
  ["2026-07-02T23:00Z|BMO Field", 83],
  ["2026-07-03T03:00Z|BC Place", 85],
  ["2026-07-03T18:00Z|AT&T Stadium", 88],
  ["2026-07-03T22:00Z|Hard Rock Stadium", 86],
  ["2026-07-04T01:30Z|GEHA Field at Arrowhead Stadium", 87],
]);

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
//
// After some groups are settled ESPN replaces placeholder home abbreviations
// (e.g. "1E") with the actual winner's FIFA code (e.g. "GER"). The secondary
// third-place-groups index handles that case: every third-place away slot has a
// unique group-letter set in its display name (e.g. "Third Place Group A/B/C/D/F")
// that matches the `groups` string in the bracket topology.
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

// Maps third-place group set (e.g. "A/B/C/D/F") → R32 match number.
// Used when ESPN has already resolved the home team to a real abbreviation.
function buildThirdPlaceGroupsIndex(): ReadonlyMap<string, number> {
  const index = new Map<string, number>();
  for (const match of BRACKET_TOPOLOGY) {
    if (match.round !== "ROUND_OF_32") continue;
    if (match.awaySource.type === "THIRD_PLACE") {
      index.set(match.awaySource.groups, match.matchNumber);
    }
  }
  return index;
}

const R32_MATCH_NUMBER_BY_TEAM_CODES = buildR32MatchIndex();
const R32_MATCH_NUMBER_BY_THIRD_PLACE_GROUPS = buildThirdPlaceGroupsIndex();

// e.g. "Third Place Group A/B/C/D/F" → "A/B/C/D/F"
const THIRD_PLACE_NAME_PATTERN = /^Third Place Group ([A-L/]+)$/i;

// Returns the correct FIFA match number for a Round of 32 competition.
// Tries three strategies in order:
//  1. Bracket-position placeholder codes ("1C|2F") — works pre-group-stage.
//  2. Third-place display name ("Third Place Group A/B/C/D/F") — works when
//     ESPN replaces only the home team code with a real abbreviation.
//  3. Static kickoff+venue schedule — works once ESPN replaces all codes with
//     real team abbreviations after the group stage completes.
function resolveR32MatchNumber(
  competition: EspnCompetition,
  kickoffUtc: string,
): number | undefined {
  const home = competition.competitors.find((c) => c.homeAway === "home");
  const away = competition.competitors.find((c) => c.homeAway === "away");
  const homeCode = home?.team?.abbreviation;
  const awayCode = away?.team?.abbreviation;

  if (homeCode && awayCode) {
    const byCode = R32_MATCH_NUMBER_BY_TEAM_CODES.get(`${homeCode}|${awayCode}`);
    if (byCode !== undefined) return byCode;

    if (awayCode === "3RD") {
      const awayName = away?.team?.displayName ?? "";
      const m = awayName.match(THIRD_PLACE_NAME_PATTERN);
      if (m) return R32_MATCH_NUMBER_BY_THIRD_PLACE_GROUPS.get(m[1]);
    }
  }

  const venueName = competition.venue?.fullName?.trim();
  return venueName
    ? ROUND_OF_32_KICKOFF_SCHEDULE.get(`${kickoffUtc}|${venueName}`)
    : undefined;
}

function buildScheduleIndex(): ReadonlyMap<string, number> {
  const index = new Map<string, number>();

  parseEspnScoreboard(capturedRange).events.forEach((event, eventIndex) => {
    const competition = event.competitions[0];
    if (!competition) return;

    const round = resolveRound(event);
    const key = scheduleKey(round, kickoff(event, competition), competition.venue?.fullName);
    if (!key) return;

    // R32: derive match number from team codes or static schedule rather than
    // array position, because the fixture is in kickoff order but R32 match
    // numbers are not. All other rounds: array position (1-indexed) equals
    // FIFA match number.
    const matchNumber =
      round === "ROUND_OF_32"
        ? resolveR32MatchNumber(competition, kickoff(event, competition))
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
    ...(typeof competitor.shootoutScore === "number" ? { penaltyScore: competitor.shootoutScore } : {}),
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
