import { FINISHED_STATUSES, LIVE_STATUSES } from "../domain";
import type { Match, TournamentSnapshot } from "../domain";

export const LIVE_POLL_INTERVAL_MS = 15_000;
export const MATCHDAY_POLL_INTERVAL_MS = 60_000;
export const OUTSIDE_WINDOW_POLL_INTERVAL_MS = 60_000;

// Group stage: 90 min play + 20 min halftime + 20 min stoppage buffer
const GROUP_MATCH_DURATION_MS = 130 * 60 * 1_000;
// Knockout: group duration + 30 min ET + 10 min ET halftime + 20 min PKs
const KNOCKOUT_MATCH_DURATION_MS = 190 * 60 * 1_000;

const MATCHDAY_PREBUFFER_MS = 30 * 60 * 1_000;
const MATCHDAY_POSTBUFFER_MS = 30 * 60 * 1_000;

const LIVE_STALE_THRESHOLD_MS = 45_000;
const MATCHDAY_STALE_THRESHOLD_MS = 5 * 60 * 1_000;
const OUTSIDE_STALE_THRESHOLD_MS = 30 * 60 * 1_000;

const RETRY_DELAYS_MS = [15_000, 30_000, 60_000, 120_000, 300_000];

export function expectedMatchEndMs(match: Match): number {
  const kickoffMs = new Date(match.kickoffUtc).getTime();
  const duration =
    match.round === "GROUP_STAGE"
      ? GROUP_MATCH_DURATION_MS
      : KNOCKOUT_MATCH_DURATION_MS;
  return kickoffMs + duration;
}

export function anyMatchLive(matches: readonly Match[]): boolean {
  return matches.some((match) => LIVE_STATUSES.has(match.status));
}

export function isTournamentComplete(matches: readonly Match[]): boolean {
  return (
    matches.length > 0 &&
    matches.every((match) => FINISHED_STATUSES.has(match.status))
  );
}

export function isMatchdayWindowActive(
  matches: readonly Match[],
  now: Date,
): boolean {
  const nowMs = now.getTime();
  return matches.some((match) => {
    const kickoffMs = new Date(match.kickoffUtc).getTime();
    const windowStart = kickoffMs - MATCHDAY_PREBUFFER_MS;
    const windowEnd = expectedMatchEndMs(match) + MATCHDAY_POSTBUFFER_MS;
    return nowMs >= windowStart && nowMs <= windowEnd;
  });
}

export function derivePollIntervalMs(
  matches: readonly Match[],
  now: Date,
): number | false {
  if (isTournamentComplete(matches)) return false;
  if (anyMatchLive(matches)) return LIVE_POLL_INTERVAL_MS;
  if (isMatchdayWindowActive(matches, now)) return MATCHDAY_POLL_INTERVAL_MS;
  return OUTSIDE_WINDOW_POLL_INTERVAL_MS;
}

export function retryDelayMs(attempt: number): number {
  return RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
}

export function deriveStaleLabel(
  snapshot: TournamentSnapshot,
  now: Date,
): string | undefined {
  const ageMs = now.getTime() - new Date(snapshot.generatedAt).getTime();
  const { matches } = snapshot;

  if (anyMatchLive(matches)) {
    return ageMs > LIVE_STALE_THRESHOLD_MS ? "Updates delayed" : undefined;
  }
  if (isMatchdayWindowActive(matches, now)) {
    return ageMs > MATCHDAY_STALE_THRESHOLD_MS ? "Data may be stale" : undefined;
  }
  return ageMs > OUTSIDE_STALE_THRESHOLD_MS ? "Last known data" : undefined;
}
