import type { TournamentDataSource } from "../domain";
import { FixtureFileDataSource } from "./fixture-file";
import { liveGroupSecond } from "../fixtures/live-group";
import { scheduled } from "../fixtures/group-stage";

/**
 * Selects the runtime TournamentDataSource for the application.
 *
 * In development the dashboard is driven by a bundled fixture so the full
 * `snapshot -> rules engine -> view models -> UI` pipeline can be exercised
 * without a live network dependency.
 *
 * In production the sole runtime provider is ESPN. Mapping a validated ESPN
 * scoreboard payload into the normalization input (FIFA match numbers, group
 * letters, disciplinary events) is implemented in the dedicated ESPN adapter
 * task (B045); until that lands, this factory returns a source that reports the
 * live feed as unavailable rather than serving fabricated data. The dashboard
 * then renders its structured "live data temporarily unavailable" state and
 * never falls back to another provider.
 */
export function createRuntimeDataSource(): TournamentDataSource {
  if (import.meta.env.DEV) {
    return new FixtureFileDataSource(
      { "live-group-second": liveGroupSecond, scheduled },
      "live-group-second",
    );
  }

  return {
    getSnapshot: () =>
      Promise.reject(
        new Error("ESPN runtime data source is not yet configured."),
      ),
  };
}
