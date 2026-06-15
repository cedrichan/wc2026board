import {
  dedupeRequestPlan,
  ESPN_SCOREBOARD_REQUEST_PLAN,
  type EspnScoreboardRequest,
} from "./request-plan";
import { parseEspnScoreboardJson, type EspnScoreboard } from "./schema";

export interface EspnScoreboardClientOptions {
  fetch?: typeof fetch;
  requestPlan?: readonly EspnScoreboardRequest[];
}

export class EspnScoreboardClient {
  readonly #fetch: typeof fetch;
  readonly #requestPlan: readonly EspnScoreboardRequest[];

  constructor({
    fetch: fetchImplementation = globalThis.fetch,
    requestPlan = ESPN_SCOREBOARD_REQUEST_PLAN,
  }: EspnScoreboardClientOptions = {}) {
    this.#fetch =
      fetchImplementation === globalThis.fetch
        ? ((input, init) => globalThis.fetch(input, init))
        : fetchImplementation;
    this.#requestPlan = dedupeRequestPlan(requestPlan);
  }

  async getScoreboards(signal?: AbortSignal): Promise<EspnScoreboard[]> {
    return Promise.all(
      this.#requestPlan.map(async ({ url }) => {
        console.log("[wc2026] Fetching ESPN scoreboard", { url });
        let response: Response;
        try {
          response = await this.#fetch(url, { signal });
        } catch (error) {
          console.error("[wc2026] ESPN scoreboard fetch failed", {
            url,
            error,
          });
          throw error;
        }

        console.log("[wc2026] ESPN scoreboard response received", {
          url,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          type: response.type,
        });

        if (!response.ok) {
          throw new Error(
            `ESPN scoreboard request failed with HTTP ${response.status}.`,
          );
        }

        return parseEspnScoreboardJson(await response.text());
      }),
    );
  }
}
