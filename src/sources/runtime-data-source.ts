import type { TournamentDataSource } from "../domain";
import { EspnScoreboardDataSource } from "./espn";
import { mapEspnScoreboardToNormalizationInput } from "./espn/runtime-mapper";

export function createRuntimeDataSource(): TournamentDataSource {
  return new EspnScoreboardDataSource({
    mapToNormalizationInput: mapEspnScoreboardToNormalizationInput,
  });
}
