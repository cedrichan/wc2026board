import { describe, it, expect } from "vitest";
import {
  LIVE_POLL_INTERVAL_MS,
  MATCHDAY_POLL_INTERVAL_MS,
  OUTSIDE_WINDOW_POLL_INTERVAL_MS,
  expectedMatchEndMs,
  anyMatchLive,
  isTournamentComplete,
  isMatchdayWindowActive,
  derivePollIntervalMs,
  retryDelayMs,
  deriveStaleLabel,
} from "./policies";
import type { Match, TournamentSnapshot } from "../domain";

// Group stage match at this kickoff:
//   expected end = 18:00 + 130 min = 20:10 UTC
//   window start = 18:00 - 30 min  = 17:30 UTC
//   window end   = 20:10 + 30 min  = 20:40 UTC
const BASE_KICKOFF = "2026-06-14T18:00:00.000Z";
const BASE_KICKOFF_MS = new Date(BASE_KICKOFF).getTime();

const WINDOW_START = new Date("2026-06-14T17:30:00.000Z");
const BEFORE_WINDOW = new Date("2026-06-14T17:29:59.000Z");
const IN_WINDOW = new Date("2026-06-14T19:00:00.000Z");
const WINDOW_END = new Date("2026-06-14T20:40:00.000Z");
const AFTER_WINDOW = new Date("2026-06-14T20:40:01.000Z");

function makeMatch(
  overrides: Partial<Match> & Pick<Match, "status" | "round">,
): Match {
  return {
    id: "m1",
    matchNumber: 1,
    kickoffUtc: BASE_KICKOFF,
    ...overrides,
  };
}

function makeSnapshot(
  matches: Match[],
  generatedAt: string,
): TournamentSnapshot {
  return {
    generatedAt,
    schemaVersion: "1",
    tournamentId: "fifa.world.2026",
    stale: false,
    teams: [],
    matches,
    diagnostics: {
      provider: "espn",
      warnings: [],
      unresolvedTiebreakers: [],
      missingFields: [],
    },
  };
}

describe("expectedMatchEndMs", () => {
  it("returns kickoff + 130 min for GROUP_STAGE", () => {
    const match = makeMatch({ status: "SCHEDULED", round: "GROUP_STAGE" });
    expect(expectedMatchEndMs(match)).toBe(BASE_KICKOFF_MS + 130 * 60 * 1_000);
  });

  it("returns kickoff + 190 min for FINAL", () => {
    const match = makeMatch({ status: "SCHEDULED", round: "FINAL" });
    expect(expectedMatchEndMs(match)).toBe(BASE_KICKOFF_MS + 190 * 60 * 1_000);
  });

  it("uses knockout duration for all non-group rounds", () => {
    const knockoutRounds = [
      "ROUND_OF_32",
      "ROUND_OF_16",
      "QUARTER_FINAL",
      "SEMI_FINAL",
      "THIRD_PLACE",
    ] as const;
    for (const round of knockoutRounds) {
      const match = makeMatch({ status: "SCHEDULED", round });
      expect(expectedMatchEndMs(match)).toBe(
        BASE_KICKOFF_MS + 190 * 60 * 1_000,
      );
    }
  });
});

describe("anyMatchLive", () => {
  it("returns false for empty array", () => {
    expect(anyMatchLive([])).toBe(false);
  });

  it("returns false when no match is live", () => {
    const matches = [
      makeMatch({ status: "SCHEDULED", round: "GROUP_STAGE" }),
      makeMatch({ status: "FINISHED", round: "GROUP_STAGE" }),
    ];
    expect(anyMatchLive(matches)).toBe(false);
  });

  it("returns true when at least one match is live", () => {
    const matches = [
      makeMatch({ status: "FINISHED", round: "GROUP_STAGE" }),
      makeMatch({ status: "FIRST_HALF", round: "GROUP_STAGE" }),
    ];
    expect(anyMatchLive(matches)).toBe(true);
  });

  it("returns true for each live status", () => {
    const liveStatuses = [
      "FIRST_HALF",
      "HALF_TIME",
      "SECOND_HALF",
      "EXTRA_TIME",
      "EXTRA_TIME_BREAK",
      "PENALTY_SHOOTOUT",
    ] as const;
    for (const status of liveStatuses) {
      expect(anyMatchLive([makeMatch({ status, round: "GROUP_STAGE" })])).toBe(
        true,
      );
    }
  });
});

describe("isTournamentComplete", () => {
  it("returns false for empty array", () => {
    expect(isTournamentComplete([])).toBe(false);
  });

  it("returns true when all matches are finished", () => {
    const matches = [
      makeMatch({ status: "FINISHED", round: "GROUP_STAGE" }),
      makeMatch({ status: "FINISHED_AFTER_EXTRA_TIME", round: "SEMI_FINAL" }),
      makeMatch({ status: "FINISHED_AFTER_PENALTIES", round: "FINAL" }),
    ];
    expect(isTournamentComplete(matches)).toBe(true);
  });

  it("returns false when any match is not finished", () => {
    const matches = [
      makeMatch({ status: "FINISHED", round: "GROUP_STAGE" }),
      makeMatch({ status: "SCHEDULED", round: "FINAL" }),
    ];
    expect(isTournamentComplete(matches)).toBe(false);
  });

  it("returns false when matches include live statuses", () => {
    const matches = [
      makeMatch({ status: "FINISHED", round: "GROUP_STAGE" }),
      makeMatch({ status: "FIRST_HALF", round: "ROUND_OF_16" }),
    ];
    expect(isTournamentComplete(matches)).toBe(false);
  });
});

describe("isMatchdayWindowActive", () => {
  const groupMatch = makeMatch({ status: "SCHEDULED", round: "GROUP_STAGE" });

  it("returns false for empty array", () => {
    expect(isMatchdayWindowActive([], IN_WINDOW)).toBe(false);
  });

  it("returns true exactly at window start", () => {
    expect(isMatchdayWindowActive([groupMatch], WINDOW_START)).toBe(true);
  });

  it("returns false one second before window start", () => {
    expect(isMatchdayWindowActive([groupMatch], BEFORE_WINDOW)).toBe(false);
  });

  it("returns true inside the window", () => {
    expect(isMatchdayWindowActive([groupMatch], IN_WINDOW)).toBe(true);
  });

  it("returns true exactly at window end", () => {
    expect(isMatchdayWindowActive([groupMatch], WINDOW_END)).toBe(true);
  });

  it("returns false one second after window end", () => {
    expect(isMatchdayWindowActive([groupMatch], AFTER_WINDOW)).toBe(false);
  });

  it("uses knockout duration for knockout rounds", () => {
    const knockoutMatch = makeMatch({ status: "SCHEDULED", round: "FINAL" });
    // Knockout expected end = BASE_KICKOFF + 190 min = 21:10 UTC
    // Knockout window end = 21:10 + 30 min = 21:40 UTC
    const knockoutWindowEnd = new Date("2026-06-14T21:40:00.000Z");
    const afterKnockoutWindow = new Date("2026-06-14T21:40:01.000Z");
    expect(isMatchdayWindowActive([knockoutMatch], knockoutWindowEnd)).toBe(
      true,
    );
    expect(isMatchdayWindowActive([knockoutMatch], afterKnockoutWindow)).toBe(
      false,
    );
  });

  it("returns true if any match has an active window", () => {
    const pastMatch = makeMatch({
      status: "FINISHED",
      round: "GROUP_STAGE",
      kickoffUtc: "2026-06-13T12:00:00.000Z",
    });
    expect(isMatchdayWindowActive([pastMatch, groupMatch], IN_WINDOW)).toBe(
      true,
    );
  });
});

describe("derivePollIntervalMs", () => {
  it("returns false when tournament is complete", () => {
    const matches = [makeMatch({ status: "FINISHED", round: "FINAL" })];
    expect(derivePollIntervalMs(matches, IN_WINDOW)).toBe(false);
  });

  it("returns LIVE_POLL_INTERVAL_MS when any match is live", () => {
    const matches = [makeMatch({ status: "FIRST_HALF", round: "GROUP_STAGE" })];
    expect(derivePollIntervalMs(matches, IN_WINDOW)).toBe(LIVE_POLL_INTERVAL_MS);
  });

  it("prioritises live over matchday window", () => {
    const matches = [makeMatch({ status: "SECOND_HALF", round: "GROUP_STAGE" })];
    expect(derivePollIntervalMs(matches, IN_WINDOW)).toBe(LIVE_POLL_INTERVAL_MS);
  });

  it("returns MATCHDAY_POLL_INTERVAL_MS within window with no live match", () => {
    const matches = [makeMatch({ status: "SCHEDULED", round: "GROUP_STAGE" })];
    expect(derivePollIntervalMs(matches, IN_WINDOW)).toBe(
      MATCHDAY_POLL_INTERVAL_MS,
    );
  });

  it("returns OUTSIDE_WINDOW_POLL_INTERVAL_MS outside all match windows", () => {
    const matches = [makeMatch({ status: "SCHEDULED", round: "GROUP_STAGE" })];
    expect(derivePollIntervalMs(matches, AFTER_WINDOW)).toBe(
      OUTSIDE_WINDOW_POLL_INTERVAL_MS,
    );
  });

  it("returns OUTSIDE_WINDOW_POLL_INTERVAL_MS for empty matches", () => {
    expect(derivePollIntervalMs([], IN_WINDOW)).toBe(
      OUTSIDE_WINDOW_POLL_INTERVAL_MS,
    );
  });
});

describe("retryDelayMs", () => {
  it("returns 15s for attempt 0", () => {
    expect(retryDelayMs(0)).toBe(15_000);
  });

  it("returns 30s for attempt 1", () => {
    expect(retryDelayMs(1)).toBe(30_000);
  });

  it("returns 60s for attempt 2", () => {
    expect(retryDelayMs(2)).toBe(60_000);
  });

  it("returns 120s for attempt 3", () => {
    expect(retryDelayMs(3)).toBe(120_000);
  });

  it("caps at 300s for attempt 4", () => {
    expect(retryDelayMs(4)).toBe(300_000);
  });

  it("caps at 300s for attempts beyond 4", () => {
    expect(retryDelayMs(10)).toBe(300_000);
    expect(retryDelayMs(100)).toBe(300_000);
  });
});

describe("deriveStaleLabel", () => {
  describe("live context", () => {
    const liveMatch = makeMatch({ status: "FIRST_HALF", round: "GROUP_STAGE" });
    const now = IN_WINDOW;

    it("returns undefined when age is under 45 seconds", () => {
      const generatedAt = new Date(now.getTime() - 44_999).toISOString();
      expect(deriveStaleLabel(makeSnapshot([liveMatch], generatedAt), now)).toBeUndefined();
    });

    it("returns 'Updates delayed' when age exceeds 45 seconds", () => {
      const generatedAt = new Date(now.getTime() - 45_001).toISOString();
      expect(deriveStaleLabel(makeSnapshot([liveMatch], generatedAt), now)).toBe(
        "Updates delayed",
      );
    });
  });

  describe("matchday context (no live match)", () => {
    const scheduledMatch = makeMatch({
      status: "SCHEDULED",
      round: "GROUP_STAGE",
    });
    const now = IN_WINDOW;

    it("returns undefined when age is under 5 minutes", () => {
      const generatedAt = new Date(now.getTime() - (5 * 60_000 - 1)).toISOString();
      expect(
        deriveStaleLabel(makeSnapshot([scheduledMatch], generatedAt), now),
      ).toBeUndefined();
    });

    it("returns 'Data may be stale' when age exceeds 5 minutes", () => {
      const generatedAt = new Date(now.getTime() - (5 * 60_000 + 1)).toISOString();
      expect(
        deriveStaleLabel(makeSnapshot([scheduledMatch], generatedAt), now),
      ).toBe("Data may be stale");
    });
  });

  describe("outside window context", () => {
    const finishedMatch = makeMatch({
      status: "FINISHED",
      round: "GROUP_STAGE",
    });
    const now = AFTER_WINDOW;

    it("returns undefined when age is under 30 minutes", () => {
      const generatedAt = new Date(now.getTime() - (30 * 60_000 - 1)).toISOString();
      expect(
        deriveStaleLabel(makeSnapshot([finishedMatch], generatedAt), now),
      ).toBeUndefined();
    });

    it("returns 'Last known data' when age exceeds 30 minutes", () => {
      const generatedAt = new Date(now.getTime() - (30 * 60_000 + 1)).toISOString();
      expect(
        deriveStaleLabel(makeSnapshot([finishedMatch], generatedAt), now),
      ).toBe("Last known data");
    });

    it("returns 'Last known data' for empty matches after 30 minutes", () => {
      const generatedAt = new Date(now.getTime() - (30 * 60_000 + 1)).toISOString();
      expect(deriveStaleLabel(makeSnapshot([], generatedAt), now)).toBe(
        "Last known data",
      );
    });
  });
});
