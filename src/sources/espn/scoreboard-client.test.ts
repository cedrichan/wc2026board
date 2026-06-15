import { describe, expect, it, vi } from "vitest";
import { ESPN_SCOREBOARD_URL } from "./request-plan";
import { EspnScoreboardClient } from "./scoreboard-client";

describe("EspnScoreboardClient", () => {
  it("passes AbortSignal and validates every fetched payload", async () => {
    const signal = new AbortController().signal;
    const rawPayload = { events: [], unknownField: "stripped" };
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify(rawPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new EspnScoreboardClient({ fetch });

    await expect(client.getScoreboards(signal)).resolves.toEqual([
      { events: [] },
    ]);
    expect(fetch).toHaveBeenCalledWith(ESPN_SCOREBOARD_URL, { signal });
  });

  it("does not issue duplicate URL requests", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ events: [] }), { status: 200 }),
    );
    const client = new EspnScoreboardClient({
      fetch,
      requestPlan: [
        { url: ESPN_SCOREBOARD_URL },
        { url: ESPN_SCOREBOARD_URL },
      ],
    });

    await client.getScoreboards();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects HTTP failures before validation", async () => {
    const client = new EspnScoreboardClient({
      fetch: vi
        .fn<typeof globalThis.fetch>()
        .mockResolvedValue(new Response(null, { status: 503 })),
    });

    await expect(client.getScoreboards()).rejects.toThrow(
      "ESPN scoreboard request failed with HTTP 503.",
    );
  });

  it("propagates validation failures", async () => {
    const client = new EspnScoreboardClient({
      fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(
        new Response(JSON.stringify({ incompatible: true }), { status: 200 }),
      ),
    });

    await expect(client.getScoreboards()).rejects.toThrow(
      "ESPN scoreboard response failed validation",
    );
  });

  it("propagates cancellation without issuing a replacement request", async () => {
    const abortError = new DOMException("The operation was aborted.", "AbortError");
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(abortError);
    const client = new EspnScoreboardClient({ fetch });

    await expect(
      client.getScoreboards(new AbortController().signal),
    ).rejects.toBe(abortError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
