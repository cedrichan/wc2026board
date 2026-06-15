import { describe, expect, it } from "vitest";
import { normalizeEspnStatus } from "./status";

describe("normalizeEspnStatus", () => {
  it("maps observed ESPN status names and preserves structured clock data", () => {
    expect(normalizeEspnStatus({
      clock: 1380,
      displayClock: "23'",
      period: 1,
      type: { name: "STATUS_IN_PROGRESS", state: "in", completed: false },
    })).toMatchObject({
      status: "FIRST_HALF",
      clock: { elapsedSeconds: 1380, displayValue: "23'", period: 1 },
    });
    expect(normalizeEspnStatus({ type: { name: "STATUS_FULL_TIME", completed: true } }).status)
      .toBe("FINISHED");
    expect(normalizeEspnStatus({ type: { state: "pre", completed: false } }).status)
      .toBe("PRE_MATCH");
    expect(normalizeEspnStatus({ name: "STATUS_FINAL_AET" }).status)
      .toBe("FINISHED_AFTER_EXTRA_TIME");
    expect(normalizeEspnStatus({ name: "STATUS_FINAL_PEN" }).status)
      .toBe("FINISHED_AFTER_PENALTIES");
  });

  it("maps interrupted states and falls back to UNKNOWN", () => {
    expect(normalizeEspnStatus({ name: "STATUS_POSTPONED" }).status).toBe("POSTPONED");
    expect(normalizeEspnStatus({ name: "STATUS_SUSPENDED" }).status).toBe("SUSPENDED");
    expect(normalizeEspnStatus({ name: "STATUS_CANCELED" }).status).toBe("CANCELLED");
    expect(normalizeEspnStatus({ name: "STATUS_NEW_PROVIDER_VALUE" }).status).toBe("UNKNOWN");
  });
});
