export {
  ESPN_SCOREBOARD_REQUEST_PLAN,
  ESPN_SCOREBOARD_URL,
  dedupeRequestPlan,
  type EspnScoreboardRequest,
} from "./request-plan";

export {
  EspnScoreboardClient,
  type EspnScoreboardClientOptions,
} from "./scoreboard-client";

export {
  EspnScoreboardDataSource,
  addFixtureCoverageDiagnostics,
  type EspnScoreboardDataSourceOptions,
  type MapEspnScoreboardToNormalizationInput,
} from "./espn-scoreboard-data-source";

export {
  parseEspnScoreboard,
  parseEspnScoreboardJson,
  type EspnCompetition,
  type EspnCompetitor,
  type EspnEvent,
  type EspnScoreboard,
} from "./schema";

export {
  normalizeEspnScoreboards,
  type EspnNormalizationResult,
  type EspnScoreboardInput,
} from "./normalize";
