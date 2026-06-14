/**
 * FixtureFileDataSource — a TournamentDataSource that returns a named fixture
 * snapshot, keyed by string. Intended for development scenario switching and
 * Storybook / test harnesses.
 *
 * Production guard: this class throws at construction time when running in
 * production mode. Fixture snapshots are fabricated data and must never be
 * served to real users of the live dashboard.
 */
import type { TournamentDataSource, TournamentSnapshot } from "../domain";

export class FixtureFileDataSource implements TournamentDataSource {
  readonly #snapshot: TournamentSnapshot;

  /**
   * @param fixtures  A map of named fixture snapshots (e.g. imported from src/fixtures/).
   * @param key       The fixture to return from getSnapshot().
   * @throws          If `key` is not present in `fixtures`.
   * @throws          If instantiated outside development mode.
   */
  constructor(fixtures: Record<string, TournamentSnapshot>, key: string) {
    // Refuse to run in production — fixture data must never reach real users.
    if (!import.meta.env.DEV) {
      throw new Error(
        "FixtureFileDataSource is a development-only utility and cannot be instantiated in production.",
      );
    }

    if (!(key in fixtures)) {
      throw new Error(
        `FixtureFileDataSource: no fixture found for key "${key}". ` +
          `Available keys: ${Object.keys(fixtures).join(", ")}`,
      );
    }

    this.#snapshot = fixtures[key];
  }

  getSnapshot(_signal?: AbortSignal): Promise<TournamentSnapshot> {
    return Promise.resolve(this.#snapshot);
  }
}
