export const ESPN_SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200";

export interface EspnScoreboardRequest {
  readonly url: string;
}

// One browser-safe ESPN request covers the tournament dates; limit=200 avoids pagination.
export const ESPN_SCOREBOARD_REQUEST_PLAN: readonly EspnScoreboardRequest[] =
  Object.freeze([{ url: ESPN_SCOREBOARD_URL }]);

/**
 * Keeps the first occurrence of each URL so request execution is stable even
 * if a caller accidentally composes overlapping plans.
 */
export function dedupeRequestPlan(
  requests: readonly EspnScoreboardRequest[],
): EspnScoreboardRequest[] {
  const seen = new Set<string>();

  return requests.filter(({ url }) => {
    if (seen.has(url)) {
      return false;
    }

    seen.add(url);
    return true;
  });
}
