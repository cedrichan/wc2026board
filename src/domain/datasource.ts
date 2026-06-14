import type { TournamentSnapshot } from "./snapshot";

export interface TournamentDataSource {
  getSnapshot(signal?: AbortSignal): Promise<TournamentSnapshot>;
}
