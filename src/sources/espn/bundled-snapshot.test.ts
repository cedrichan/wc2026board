import { describe, expect, it } from "vitest";
import { createBundledEspnSnapshot } from "./bundled-snapshot";

describe("bundled ESPN snapshot", () => {
  it("provides a complete, stale startup snapshot", () => {
    const snapshot = createBundledEspnSnapshot();

    expect(snapshot.tournamentId).toBe("fifa.world.2026");
    expect(snapshot.schemaVersion).toBe("1");
    expect(snapshot.generatedAt).toBe("2026-07-18T02:16:25Z");
    expect(snapshot.stale).toBe(true);
    expect(snapshot.matches).toHaveLength(104);
    expect(
      snapshot.diagnostics.warnings.some((warning) =>
        warning.startsWith("Incomplete ESPN fixture coverage"),
      ),
    ).toBe(false);
  });
});
