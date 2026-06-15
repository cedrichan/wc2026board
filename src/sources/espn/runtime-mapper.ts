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
  EspnMatchInput,
  EspnScoreboardInput,
  EspnTeamInput,
} from "./normalize";

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

function buildScheduleIndex(): ReadonlyMap<string, number> {
  const index = new Map<string, number>();

  parseEspnScoreboard(capturedRange).events.forEach((event, eventIndex) => {
    const competition = event.competitions[0];
    if (!competition) return;

    const key = scheduleKey(
      resolveRound(event),
      kickoff(event, competition),
      competition.venue?.fullName,
    );

    if (key) {
      index.set(key, eventIndex + 1);
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

function conductCoverageForMatch(): ConductCoverage {
  // The captured scoreboard investigation explicitly did not validate complete
  // conduct coverage, so runtime mapping must remain conservative here.
  return "UNKNOWN";
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
    conductCoverage: conductCoverageForMatch(),
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
