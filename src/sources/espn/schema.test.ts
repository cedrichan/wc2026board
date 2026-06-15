import { describe, expect, it } from "vitest";
import observedScoreboard from "./__fixtures__/scoreboard-observed-states-20260614.json";
import rangeScoreboard from "./__fixtures__/scoreboard-range-20260611-20260719.json";
import { EspnSchemaValidationError } from "./diagnostics";
import {
  parseEspnScoreboard,
  parseEspnScoreboardJson,
} from "./schema";

const minimumPayload = {
  timestamp: "2026-06-14T18:00:00Z",
  events: [{
    id: "401752645",
    date: "2026-06-14T19:00:00Z",
    competitions: [{
      id: "401752645",
      status: {
        clock: 0,
        displayClock: "0'",
        period: 0,
        type: {
          name: "STATUS_SCHEDULED",
          state: "pre",
          completed: false,
          detail: "Sun, June 14th at 12:00 PM PDT",
        },
      },
      competitors: [{
        id: "660",
        homeAway: "home",
        team: {
          id: "660",
          displayName: "United States",
          abbreviation: "USA",
        },
      }, {
        id: "628",
        homeAway: "away",
        team: {
          id: "628",
          displayName: "Australia",
          abbreviation: "AUS",
        },
      }],
    }],
  }],
};

describe("espnScoreboardSchema", () => {
  it("accepts the captured observed-state and tournament-range fixtures", () => {
    expect(parseEspnScoreboard(observedScoreboard).events.length).toBeGreaterThan(0);
    expect(parseEspnScoreboard(rangeScoreboard).events.length).toBeGreaterThan(0);
  });

  it("accepts the minimum useful observed scoreboard shape", () => {
    const parsed = parseEspnScoreboard(minimumPayload);

    expect(parsed.events[0].id).toBe("401752645");
    expect(parsed.events[0].competitions[0].status.type.state).toBe("pre");
    expect(parsed.events[0].competitions[0].competitors).toHaveLength(2);
  });

  it("tolerates missing optional teams, scores, clock, venue, details, and timestamps", () => {
    const parsed = parseEspnScoreboard({
      events: [{
        id: "partial-event",
        date: "2026-06-14T19:00:00Z",
        competitions: [{
          id: "partial-competition",
          status: {
            type: {
              state: "pre",
              completed: false,
            },
          },
          competitors: [{ id: "known-team-id" }],
        }],
      }],
    });

    const competition = parsed.events[0].competitions[0];
    expect(competition.competitors[0].team).toBeUndefined();
    expect(competition.venue).toBeUndefined();
    expect(competition.details).toBeUndefined();
    expect(competition.status.clock).toBeUndefined();
  });

  it("accepts empty event and disciplinary-detail arrays", () => {
    expect(parseEspnScoreboard({ events: [] }).events).toEqual([]);

    const withEmptyDetails = structuredClone(minimumPayload);
    Object.assign(withEmptyDetails.events[0].competitions[0], { details: [] });
    expect(parseEspnScoreboard(withEmptyDetails).events[0].competitions[0].details).toEqual([]);
  });

  it("strips unknown fields at every validated boundary", () => {
    const payload = {
      ...minimumPayload,
      rawSecret: "do-not-retain",
      events: [{
        ...minimumPayload.events[0],
        providerHtml: "<script>unsafe()</script>",
        competitions: [{
          ...minimumPayload.events[0].competitions[0],
          unknownCompetitionMetadata: { private: true },
        }],
      }],
    };

    const parsed = parseEspnScoreboard(payload);

    expect(parsed).not.toHaveProperty("rawSecret");
    expect(parsed.events[0]).not.toHaveProperty("providerHtml");
    expect(parsed.events[0].competitions[0]).not.toHaveProperty("unknownCompetitionMetadata");
  });

  it("rejects incompatible payloads with actionable sanitized diagnostics", () => {
    const rawMarker = "raw-payload-marker-that-must-not-leak";

    expect.assertions(6);
    try {
      parseEspnScoreboard({
        events: [{
          id: "event",
          date: "not-a-timestamp",
          competitions: [{
            id: "competition",
            status: {
              type: {
                state: "pre",
                completed: false,
              },
            },
            competitors: [{
              id: "competitor",
              homeAway: rawMarker,
            }],
          }],
        }],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EspnSchemaValidationError);
      const validationError = error as EspnSchemaValidationError;
      expect(validationError.diagnostic.code).toBe("INVALID_SCOREBOARD_SCHEMA");
      expect(validationError.diagnostic.issues.length).toBeGreaterThan(0);
      expect(validationError.diagnostic.issues.map((issue) => issue.path)).toContain("$.events[0].date");
      expect(JSON.stringify(validationError.diagnostic)).not.toContain(rawMarker);
      expect(validationError.message).not.toContain(rawMarker);
    }
  });

  it("rejects malformed JSON without retaining the response text", () => {
    const malformed = '{"events":[raw-payload-marker]}';

    expect(() => parseEspnScoreboardJson(malformed)).toThrowError(EspnSchemaValidationError);

    try {
      parseEspnScoreboardJson(malformed);
    } catch (error) {
      const validationError = error as EspnSchemaValidationError;
      expect(validationError.diagnostic).toEqual({
        code: "INVALID_JSON",
        message: "ESPN response is not valid JSON.",
        issues: [],
      });
      expect(JSON.stringify(validationError.diagnostic)).not.toContain(malformed);
    }
  });

  it("rejects changed required status and event structures", () => {
    expect(() => parseEspnScoreboard({ events: "not-an-array" })).toThrowError(EspnSchemaValidationError);
    expect(() => parseEspnScoreboard({
      events: [{
        id: "event",
        date: "2026-06-14T19:00:00Z",
        competitions: [{
          id: "competition",
          status: { type: { state: "pre" } },
          competitors: [],
        }],
      }],
    })).toThrowError(EspnSchemaValidationError);
  });
});
