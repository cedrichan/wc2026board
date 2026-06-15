import type { TournamentDataSource } from "../domain";
import { FixtureFileDataSource } from "./fixture-file";
import { liveGroupSecond } from "../fixtures/live-group";
import { scheduled } from "../fixtures/group-stage";
import { EspnScoreboardDataSource } from "./espn";
import { mapEspnScoreboardToNormalizationInput } from "./espn/runtime-mapper";

/**
 * Selects the runtime TournamentDataSource for the application.
 *
 * In development the dashboard is driven by a bundled fixture so the full
 * `snapshot -> rules engine -> view models -> UI` pipeline can be exercised
 * without a live network dependency.
 *
 * In production the sole runtime provider is ESPN. Match-number resolution is
 * driven by a local schedule index derived from the captured 104-fixture range,
 * so the runtime feed still maps onto the local bracket topology without
 * consulting another provider.
 */
export function createRuntimeDataSource(): TournamentDataSource {
  if (import.meta.env.DEV) {
    return new FixtureFileDataSource(
      { "live-group-second": liveGroupSecond, scheduled },
      "live-group-second",
    );
  }

  return new EspnScoreboardDataSource({
    mapToNormalizationInput: mapEspnScoreboardToNormalizationInput,
  });
}
