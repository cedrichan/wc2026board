import { describe, expect, it } from "vitest";
import {
  dedupeRequestPlan,
  ESPN_SCOREBOARD_REQUEST_PLAN,
  ESPN_SCOREBOARD_URL,
} from "./request-plan";

describe("ESPN scoreboard request plan", () => {
  it("uses the approved single full-tournament URL", () => {
    expect(ESPN_SCOREBOARD_REQUEST_PLAN).toEqual([
      {
        url: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200",
      },
    ]);
    expect(ESPN_SCOREBOARD_REQUEST_PLAN[0]?.url).toBe(ESPN_SCOREBOARD_URL);
  });

  it("deduplicates requests deterministically by keeping the first URL", () => {
    const duplicate = { url: ESPN_SCOREBOARD_URL };
    const second = { url: `${ESPN_SCOREBOARD_URL}&test=second` };

    expect(dedupeRequestPlan([duplicate, second, duplicate])).toEqual([
      duplicate,
      second,
    ]);
  });
});
