import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";
import MatchTicker from "./MatchTicker";
import theme from "../theme";
import type { MatchTickerItemViewModel, MatchTickerViewModel } from "../view-models";

function buildItem(overrides: Partial<MatchTickerItemViewModel> = {}): MatchTickerItemViewModel {
  return {
    id: "match-1",
    matchNumber: 1,
    contextLabel: "Group A",
    kickoffUtc: "2026-06-14T18:00:00Z",
    kickoffLabel: "Jun 14, 18:00 UTC",
    status: "SCHEDULED",
    isLive: false,
    isFinished: false,
    home: {
      id: "team-a",
      shortName: "A1",
      flagEmoji: "🇦",
      flagAlt: "A1 flag",
    },
    away: {
      id: "team-b",
      shortName: "A2",
      flagEmoji: "🇧",
      flagAlt: "A2 flag",
    },
    homeScore: null,
    awayScore: null,
    accessibleName: "Group A, A1 vs A2, Scheduled",
    ...overrides,
  };
}

function renderTicker(items: MatchTickerItemViewModel[]) {
  const ticker: MatchTickerViewModel = {
    id: "match-ticker",
    items,
    anchorId: null,
  };

  return render(
    <ThemeProvider theme={theme}>
      <MatchTicker ticker={ticker} />
    </ThemeProvider>,
  );
}

describe("MatchTicker", () => {
  it("fades finished matches slightly", () => {
    renderTicker([
      buildItem({
        id: "match-2",
        status: "FINISHED",
        isFinished: true,
        homeScore: 2,
        awayScore: 1,
        accessibleName: "Group A, A1 2-1 A2, Finished",
      }),
    ]);

    expect(screen.getByLabelText("Group A, A1 2-1 A2, Finished")).toHaveStyle({
      opacity: "0.6",
    });
  });

  it("keeps live matches fully opaque", () => {
    renderTicker([
      buildItem({
        id: "match-3",
        status: "FIRST_HALF",
        isLive: true,
        clockLabel: "12'",
        homeScore: 1,
        awayScore: 0,
        accessibleName: "Group A, A1 1-0 A2, First half 12'",
      }),
    ]);

    expect(screen.getByLabelText("Group A, A1 1-0 A2, First half 12'")).toHaveStyle({
      opacity: "1",
    });
  });
});
