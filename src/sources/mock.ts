/**
 * MockDataSource — an in-memory TournamentDataSource for development and testing.
 *
 * Production guard: this class throws at construction time when running in
 * production mode. It must never appear in production provider selections
 * because it returns fabricated data that could mislead users about real
 * tournament state.
 */
import type { TournamentDataSource, TournamentSnapshot } from "../domain";
import { scheduled } from "../fixtures/group-stage";

// A minimal sensible default snapshot used when no snapshot is provided.
const DEFAULT_SNAPSHOT: TournamentSnapshot = scheduled;

export class MockDataSource implements TournamentDataSource {
  readonly #snapshot: TournamentSnapshot;

  constructor(snapshot: TournamentSnapshot = DEFAULT_SNAPSHOT) {
    // Refuse to run in production — mock data must never reach real users.
    if (!import.meta.env.DEV) {
      throw new Error(
        "MockDataSource is a development-only utility and cannot be instantiated in production.",
      );
    }
    this.#snapshot = snapshot;
  }

  getSnapshot(_signal?: AbortSignal): Promise<TournamentSnapshot> {
    return Promise.resolve(this.#snapshot);
  }
}
