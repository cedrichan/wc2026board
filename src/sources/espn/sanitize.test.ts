import { describe, expect, it } from "vitest";
import { normalizeIsoTimestamp, sanitizeEspnImageUrl, sanitizeProviderText } from "./sanitize";

describe("ESPN sanitizers", () => {
  it("converts provider strings to plain compact text", () => {
    expect(sanitizeProviderText("  <b>New\n Zealand</b>\u0000  ")).toBe("New Zealand");
    expect(sanitizeProviderText("<script></script>")).toBeUndefined();
  });

  it("allows only exact observed HTTPS ESPN image hosts", () => {
    expect(sanitizeEspnImageUrl("https://a.espncdn.com/i/teamlogos/countries/500/mex.png"))
      .toBe("https://a.espncdn.com/i/teamlogos/countries/500/mex.png");
    expect(sanitizeEspnImageUrl("http://a.espncdn.com/logo.png")).toBeUndefined();
    expect(sanitizeEspnImageUrl("https://sub.a.espncdn.com/logo.png")).toBeUndefined();
    expect(sanitizeEspnImageUrl("https://a.espncdn.com.evil.test/logo.png")).toBeUndefined();
    expect(sanitizeEspnImageUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("normalizes valid timestamps and rejects invalid ones", () => {
    expect(normalizeIsoTimestamp("2026-06-14T12:00:00-07:00")).toBe("2026-06-14T19:00:00.000Z");
    expect(normalizeIsoTimestamp("not-a-date")).toBeUndefined();
  });
});

