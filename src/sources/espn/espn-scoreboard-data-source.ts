import type {
  PartialTeam,
  Team,
  TournamentDataSource,
  TournamentSnapshot,
} from "../../domain";
import {
  EspnScoreboardClient,
  type EspnScoreboardClientOptions,
} from "./scoreboard-client";
import {
  normalizeEspnScoreboards,
  type EspnScoreboardInput,
} from "./normalize";
import type { EspnScoreboard } from "./schema";

const FIRST_TOURNAMENT_MATCH_NUMBER = 1;
const LAST_TOURNAMENT_MATCH_NUMBER = 104;
const SNAPSHOT_SCHEMA_VERSION = "1";
const TOURNAMENT_ID = "fifa.world.2026";

export type MapEspnScoreboardToNormalizationInput = (
  payload: EspnScoreboard,
) => EspnScoreboardInput;

export interface EspnScoreboardDataSourceOptions
  extends EspnScoreboardClientOptions {
  mapToNormalizationInput: MapEspnScoreboardToNormalizationInput;
  now?: () => Date;
}

export class EspnScoreboardDataSource implements TournamentDataSource {
  readonly #client: EspnScoreboardClient;
  readonly #mapToNormalizationInput: MapEspnScoreboardToNormalizationInput;
  readonly #now: () => Date;

  constructor({
    mapToNormalizationInput,
    now = () => new Date(),
    ...clientOptions
  }: EspnScoreboardDataSourceOptions) {
    this.#client = new EspnScoreboardClient(clientOptions);
    this.#mapToNormalizationInput = mapToNormalizationInput;
    this.#now = now;
  }

  async getSnapshot(signal?: AbortSignal): Promise<TournamentSnapshot> {
    const payloads = await this.#client.getScoreboards(signal);
    const normalized = normalizeEspnScoreboards(
      payloads.map((payload) => this.#mapToNormalizationInput(payload)),
    );

    return addFixtureCoverageDiagnostics({
      generatedAt: this.#now().toISOString(),
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      tournamentId: TOURNAMENT_ID,
      stale: false,
      ...normalized,
      teams: normalized.teams.filter(isCompleteTeam),
    });
  }
}

function isCompleteTeam(team: PartialTeam): team is Team {
  return (
    team.fifaCode !== undefined &&
    team.name !== undefined &&
    team.shortName !== undefined &&
    team.group !== undefined
  );
}

export function addFixtureCoverageDiagnostics(
  snapshot: TournamentSnapshot,
): TournamentSnapshot {
  const presentMatchNumbers = new Set(
    snapshot.matches
      .map(({ matchNumber }) => matchNumber)
      .filter(
        (matchNumber) =>
          matchNumber >= FIRST_TOURNAMENT_MATCH_NUMBER &&
          matchNumber <= LAST_TOURNAMENT_MATCH_NUMBER,
      ),
  );
  const missingMatchNumbers: number[] = [];

  for (
    let matchNumber = FIRST_TOURNAMENT_MATCH_NUMBER;
    matchNumber <= LAST_TOURNAMENT_MATCH_NUMBER;
    matchNumber += 1
  ) {
    if (!presentMatchNumbers.has(matchNumber)) {
      missingMatchNumbers.push(matchNumber);
    }
  }

  if (missingMatchNumbers.length === 0) {
    return snapshot;
  }

  const warning =
    `Incomplete ESPN fixture coverage: received ${presentMatchNumbers.size} of ` +
    `${LAST_TOURNAMENT_MATCH_NUMBER} matches; missing ${formatMatchNumbers(missingMatchNumbers)}.`;

  if (snapshot.diagnostics.warnings.includes(warning)) {
    return snapshot;
  }

  return {
    ...snapshot,
    diagnostics: {
      ...snapshot.diagnostics,
      warnings: [...snapshot.diagnostics.warnings, warning],
    },
  };
}

function formatMatchNumbers(matchNumbers: readonly number[]): string {
  const ranges: string[] = [];
  let rangeStart = matchNumbers[0];
  let previous = rangeStart;

  for (const matchNumber of matchNumbers.slice(1)) {
    if (previous !== undefined && matchNumber === previous + 1) {
      previous = matchNumber;
      continue;
    }

    if (rangeStart !== undefined && previous !== undefined) {
      ranges.push(formatMatchNumberRange(rangeStart, previous));
    }
    rangeStart = matchNumber;
    previous = matchNumber;
  }

  if (rangeStart !== undefined && previous !== undefined) {
    ranges.push(formatMatchNumberRange(rangeStart, previous));
  }

  return ranges.join(", ");
}

function formatMatchNumberRange(start: number, end: number): string {
  return start === end ? `M${start}` : `M${start}-M${end}`;
}
