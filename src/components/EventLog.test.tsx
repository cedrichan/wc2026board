import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";
import EventLog from "./EventLog";
import theme from "../theme";
import type { EventLogViewModel } from "../view-models/dashboard";

const log: EventLogViewModel = {
  id: "event-log",
  hasLive: true,
  entries: [
    {
      id: "entry-1",
      sortKey: 1,
      clockDisplay: "12'",
      type: "GOAL",
      home: { fifaCode: "USA", flagEmoji: "🇺🇸", shortName: "USA" },
      away: { fifaCode: "MEX", flagEmoji: "🇲🇽", shortName: "MEX" },
      description: "Goal for USA",
      isLive: true,
    },
    {
      id: "entry-2",
      sortKey: 2,
      clockDisplay: "HT",
      type: "HALF_TIME",
      home: { fifaCode: "ARG", flagEmoji: "🇦🇷", shortName: "ARG" },
      away: { fifaCode: "BRA", flagEmoji: "🇧🇷", shortName: "BRA" },
      description: "Half-time",
      isLive: false,
    },
  ],
};

describe("EventLog", () => {
  it("renders event rows with stable shared columns", () => {
    render(
      <ThemeProvider theme={theme}>
        <EventLog log={log} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Recent events" })).toBeInTheDocument();
    expect(screen.getByText("Goal for USA")).toBeInTheDocument();
    expect(screen.getByText("Half-time")).toBeInTheDocument();
    expect(screen.getByText("Goal")).toBeInTheDocument();
    expect(screen.getByText("Half")).toBeInTheDocument();

    const rows = [
      screen.getByText("Goal for USA").parentElement,
      screen.getByText("Half-time").parentElement,
    ];
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      expect(row).not.toBeNull();
      expect(row).toHaveStyle({
        gridTemplateColumns: "minmax(7.5rem, 12rem) 4rem minmax(5.5rem, 7.5rem) minmax(0, 1fr)",
      });
    });
  });
});
