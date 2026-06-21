import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";
import theme from "../theme";
import type { TeamTooltipViewModel } from "../view-models";
import TeamIdentity from "./TeamIdentity";
import { TeamTooltipProvider } from "./TeamTooltip";

const detail: TeamTooltipViewModel = {
  id: "team-tooltip-usa",
  teamId: "usa",
  team: { id: "usa", name: "United States", shortName: "USA", fifaCode: "USA", flagEmoji: "🇺🇸", flagAlt: "United States flag" },
  groupLabel: "Group D",
  position: 1,
  positionLabel: "1st",
  played: 2,
  recordLabel: "2-0-0",
  goalsFor: 4,
  goalsAgainst: 1,
  goalDifferenceLabel: "+3",
  points: 6,
  pastMatches: [],
  projection: { determined: false, confirmed: false, placeholderLabel: "Round-of-32 slot to be determined", accessibleLabel: "Round of 32: slot to be determined" },
  accessibleName: "United States, 1st in Group D, 6 points",
};

describe("TeamIdentity", () => {
  it("renders the flag and country as one shared detail trigger", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={theme}>
        <TeamTooltipProvider tooltips={[detail]}>
          <TeamIdentity team={detail.team}><span>USA</span></TeamIdentity>
        </TeamTooltipProvider>
      </ThemeProvider>,
    );

    const trigger = screen.getByRole("button", { name: /United States, 1st in Group D/ });
    expect(trigger).toHaveTextContent("🇺🇸USA");
    await user.hover(trigger);
    await waitFor(() => expect(screen.getByText(/2-0-0/)).toBeInTheDocument());
  });
});
