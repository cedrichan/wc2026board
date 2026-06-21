import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";
import { TeamTooltip, TeamTooltipProvider } from "./TeamTooltip";
import theme from "../theme";
import type { TeamTooltipViewModel } from "../view-models";

function tooltip(overrides: Partial<TeamTooltipViewModel> = {}): TeamTooltipViewModel {
  return {
    id: "team-tooltip-team-e-1",
    teamId: "team-e-1",
    team: {
      id: "team-e-1",
      name: "England",
      shortName: "ENG",
      fifaCode: "ENG",
      flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      flagAlt: "England flag",
    },
    groupLabel: "Group E",
    position: 1,
    positionLabel: "1st",
    played: 3,
    recordLabel: "3-0-0",
    goalsFor: 6,
    goalsAgainst: 1,
    goalDifferenceLabel: "+5",
    points: 9,
    pastMatches: [
      {
        id: "team-team-e-1-match-1",
        matchLabel: "M1",
        roundLabel: "Group E",
        opponent: {
          id: "team-e-2",
          name: "France",
          shortName: "FRA",
          fifaCode: "FRA",
          flagEmoji: "🇫🇷",
          flagAlt: "France flag",
        },
        scoreLabel: "2–1",
        outcome: "W",
        accessibleName: "Group E, match 1, win against France, 2–1",
      },
    ],
    projection: {
      determined: true,
      confirmed: false,
      statusLabel: "Projected",
      matchLabel: "M74",
      opponentLabel: "France",
      accessibleLabel: "Projected Round of 32: M74 versus France",
    },
    accessibleName: "England, 1st in Group E, 9 points",
    ...overrides,
  };
}

function renderTrigger(data: TeamTooltipViewModel, teamId = data.teamId) {
  return render(
    <ThemeProvider theme={theme}>
      <TeamTooltipProvider tooltips={[data]}>
        <TeamTooltip teamId={teamId}>
          <span>{data.team.name}</span>
        </TeamTooltip>
      </TeamTooltipProvider>
    </ThemeProvider>,
  );
}

describe("TeamTooltip", () => {
  it("exposes a focusable trigger and reveals standing on hover", async () => {
    const user = userEvent.setup();
    renderTrigger(tooltip());

    const trigger = screen.getByRole("button", { name: /England, 1st in Group E/ });
    expect(trigger).toHaveAttribute("tabindex", "0");

    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText(/3-0-0/)).toBeInTheDocument();
    });
    expect(screen.getByText(/R32: M74 vs France/)).toBeInTheDocument();
    expect(screen.getByText("Past results")).toBeInTheDocument();
    expect(screen.getByText("2–1")).toBeInTheDocument();
  });

  it("toggles on tap and dismisses on Escape without trapping focus", async () => {
    const user = userEvent.setup();
    renderTrigger(tooltip());

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByText(/R32: M74 vs France/)).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByText(/R32: M74 vs France/)).not.toBeInTheDocument();
    });
    // Focus stays on the trigger — the tooltip never traps it.
    expect(trigger).toHaveFocus();
  });

  it("renders nothing interactive when no tooltip data exists", () => {
    renderTrigger(tooltip(), "unknown-team");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("England")).toBeInTheDocument();
  });

  it("shows a placeholder instead of a slot when projection is undetermined", async () => {
    const user = userEvent.setup();
    renderTrigger(
      tooltip({
        projection: {
          determined: false,
          confirmed: false,
          placeholderLabel: "Not in the Round of 32",
          accessibleLabel: "Round of 32: Not in the Round of 32",
        },
      }),
    );

    await user.hover(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText(/R32: Not in the Round of 32/)).toBeInTheDocument();
    });
  });
});
