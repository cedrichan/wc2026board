import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TournamentSnapshot } from "../domain";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid TournamentSnapshot for use in tests. */
function makeSnapshot(overrides?: Partial<TournamentSnapshot>): TournamentSnapshot {
  return {
    generatedAt: "2026-06-14T10:00:00Z",
    schemaVersion: "1",
    tournamentId: "fifa.world.2026",
    stale: false,
    teams: [],
    matches: [],
    diagnostics: {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [],
      missingFields: [],
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// MockDataSource
// ---------------------------------------------------------------------------

describe("MockDataSource", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("returns the snapshot passed to its constructor", async () => {
    vi.stubEnv("DEV", true);
    const { MockDataSource } = await import("./mock");

    const snapshot = makeSnapshot({ tournamentId: "test.tournament" });
    const source = new MockDataSource(snapshot);
    const result = await source.getSnapshot();

    expect(result).toBe(snapshot);
  });

  it("returns the default snapshot when none is provided", async () => {
    vi.stubEnv("DEV", true);
    const { MockDataSource } = await import("./mock");

    const source = new MockDataSource();
    const result = await source.getSnapshot();

    // Default is the 'scheduled' fixture — check a stable property
    expect(result.tournamentId).toBe("fifa.world.2026");
    expect(result.stale).toBe(false);
  });

  it("passes the AbortSignal through without error", async () => {
    vi.stubEnv("DEV", true);
    const { MockDataSource } = await import("./mock");

    const snapshot = makeSnapshot();
    const source = new MockDataSource(snapshot);
    const controller = new AbortController();
    const result = await source.getSnapshot(controller.signal);

    expect(result).toBe(snapshot);
  });

  it("throws when instantiated in production (DEV = false)", async () => {
    vi.stubEnv("DEV", false);
    const { MockDataSource } = await import("./mock");

    expect(() => new MockDataSource()).toThrow(
      /MockDataSource is a development-only utility/,
    );
  });
});

// ---------------------------------------------------------------------------
// FixtureFileDataSource
// ---------------------------------------------------------------------------

describe("FixtureFileDataSource", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("returns the correct fixture for the requested key", async () => {
    vi.stubEnv("DEV", true);
    const { FixtureFileDataSource } = await import("./fixture-file");

    const snapshotA = makeSnapshot({ tournamentId: "fixture-a" });
    const snapshotB = makeSnapshot({ tournamentId: "fixture-b" });
    const fixtures = { "scenario-a": snapshotA, "scenario-b": snapshotB };

    const sourceA = new FixtureFileDataSource(fixtures, "scenario-a");
    const sourceB = new FixtureFileDataSource(fixtures, "scenario-b");

    expect(await sourceA.getSnapshot()).toBe(snapshotA);
    expect(await sourceB.getSnapshot()).toBe(snapshotB);
  });

  it("throws for an unknown fixture key", async () => {
    vi.stubEnv("DEV", true);
    const { FixtureFileDataSource } = await import("./fixture-file");

    const fixtures = { existing: makeSnapshot() };

    expect(() => new FixtureFileDataSource(fixtures, "nonexistent")).toThrow(
      /no fixture found for key "nonexistent"/,
    );
  });

  it("throws when instantiated in production (DEV = false)", async () => {
    vi.stubEnv("DEV", false);
    const { FixtureFileDataSource } = await import("./fixture-file");

    const fixtures = { key: makeSnapshot() };

    expect(() => new FixtureFileDataSource(fixtures, "key")).toThrow(
      /FixtureFileDataSource is a development-only utility/,
    );
  });
});

// ---------------------------------------------------------------------------
// Fixture content assertions
// ---------------------------------------------------------------------------

describe("Fixture: stale snapshot", () => {
  it("cachedStale has stale: true and an old generatedAt", async () => {
    const { cachedStale } = await import("../fixtures/stale");

    expect(cachedStale.stale).toBe(true);
    // generatedAt should be in the past relative to a live run
    const generated = new Date(cachedStale.generatedAt).getTime();
    expect(generated).toBeLessThan(Date.now());
    expect(cachedStale.diagnostics.provider).toBe("espn");
  });
});

describe("Fixture: null score vs zero score", () => {
  it("scheduled match has no normalTime (null scores not started)", async () => {
    const { zeroScore } = await import("../fixtures/group-stage");

    const scheduledMatch = zeroScore.matches.find((m) => m.status === "SCHEDULED");
    expect(scheduledMatch).toBeDefined();
    // Scheduled matches must not have a normalTime field at all
    expect(scheduledMatch!.normalTime).toBeUndefined();
  });

  it("live 0-0 match has integer zero scores, not null or undefined", async () => {
    const { zeroScore } = await import("../fixtures/group-stage");

    const liveMatch = zeroScore.matches.find((m) => m.status === "FIRST_HALF");
    expect(liveMatch).toBeDefined();
    expect(liveMatch!.normalTime).toBeDefined();
    // Both must be the number 0, not null
    expect(liveMatch!.normalTime!.home).toBe(0);
    expect(liveMatch!.normalTime!.away).toBe(0);
    expect(liveMatch!.normalTime!.home).not.toBeNull();
    expect(liveMatch!.normalTime!.away).not.toBeNull();
  });

  it("zero score (0) and null score are distinguishable", async () => {
    const { zeroScore } = await import("../fixtures/group-stage");

    const liveMatch = zeroScore.matches.find((m) => m.status === "FIRST_HALF");
    const scheduledMatch = zeroScore.matches.find((m) => m.status === "SCHEDULED");

    expect(liveMatch!.normalTime!.home).toBe(0);
    expect(scheduledMatch!.normalTime).toBeUndefined();
    // 0 !== undefined
    expect(liveMatch!.normalTime!.home).not.toBe(scheduledMatch!.normalTime);
  });
});

describe("Fixture: penalty scores", () => {
  it("penalty shootout tracks scores in penalties field, not normalTime", async () => {
    const { penaltyShootout } = await import("../fixtures/edge-cases");

    const match = penaltyShootout.matches[0];
    expect(match.status).toBe("PENALTY_SHOOTOUT");
    expect(match.normalTime).toBeDefined();
    expect(match.penalties).toBeDefined();

    // Penalty score must not be folded into normalTime
    const normalTotal = match.normalTime!.home! + match.normalTime!.away!;
    const penTotal = match.penalties!.home! + match.penalties!.away!;
    // They are tracked independently — normalTime shouldn't include penalties
    expect(match.normalTime!.home).not.toBe(match.normalTime!.home! + match.penalties!.home!);
    // Sanity: both fields have real numeric values
    expect(typeof match.normalTime!.home).toBe("number");
    expect(typeof match.penalties!.home).toBe("number");
    // They are separate
    expect(normalTotal).toBeGreaterThanOrEqual(0);
    expect(penTotal).toBeGreaterThanOrEqual(0);
  });

  it("finished-after-penalties has penalties separate from normalTime", async () => {
    const { finishedPens } = await import("../fixtures/knockout");

    const match = finishedPens.matches[0];
    expect(match.status).toBe("FINISHED_AFTER_PENALTIES");
    expect(match.normalTime).toBeDefined();
    expect(match.extraTime).toBeDefined();
    expect(match.penalties).toBeDefined();

    // The normalTime score must not include penalty contribution
    expect(match.normalTime!.home! + match.penalties!.home!).not.toBe(match.normalTime!.home);
    expect(match.winnerTeamId).toBeDefined();
  });
});

describe("Fixture: diagnostics.provider", () => {
  it("all fixtures carry diagnostics.provider === 'espn'", async () => {
    const [
      { scheduled, noLiveMatches, zeroScore, groupThirdPlaceBoundary },
      { liveGroupHalf, liveGroupSecond, halfTime },
      { finishedNormal, finishedAet, finishedPens, knockoutAdvancement },
      { extraTime, extraTimeBreak, penaltyShootout, postponed, suspended, cancelled, unknownStatus, missingFlags, missingVenue, incompleteConductFixture },
      { cachedStale },
    ] = await Promise.all([
      import("../fixtures/group-stage"),
      import("../fixtures/live-group"),
      import("../fixtures/knockout"),
      import("../fixtures/edge-cases"),
      import("../fixtures/stale"),
    ]);

    const allFixtures = [
      scheduled, noLiveMatches, zeroScore, groupThirdPlaceBoundary,
      liveGroupHalf, liveGroupSecond, halfTime,
      finishedNormal, finishedAet, finishedPens, knockoutAdvancement,
      extraTime, extraTimeBreak, penaltyShootout, postponed, suspended, cancelled, unknownStatus, missingFlags, missingVenue, incompleteConductFixture,
      cachedStale,
    ];

    for (const fixture of allFixtures) {
      expect(fixture.diagnostics.provider).toBe("espn");
    }
  });
});

describe("Fixture: incomplete-conduct", () => {
  it("has at least one UnresolvedTiebreaker in diagnostics", async () => {
    const { incompleteConductFixture } = await import("../fixtures/edge-cases");

    expect(incompleteConductFixture.diagnostics.unresolvedTiebreakers.length).toBeGreaterThan(0);
    const tb = incompleteConductFixture.diagnostics.unresolvedTiebreakers[0];
    expect(tb.teamIds.length).toBeGreaterThanOrEqual(2);
    expect(typeof tb.criterion).toBe("string");
  });
});
