import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { describe, it, expect, vi } from "vitest";
import App from "./App";
import theme from "./theme";
import { liveGroupSecond } from "./fixtures/live-group";
import type { TournamentDataSource } from "./domain";

function renderApp(dataSource: TournamentDataSource) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <App dataSource={dataSource} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

function fixtureSource(): TournamentDataSource {
  return { getSnapshot: () => Promise.resolve(liveGroupSecond) };
}

describe("App dashboard", () => {
  it("renders the dashboard heading", () => {
    renderApp(fixtureSource());
    expect(
      screen.getByRole("heading", { level: 1, name: /world cup 2026/i }),
    ).toBeInTheDocument();
  });

  it("renders the required page sections in order", async () => {
    renderApp(fixtureSource());

    // Wait for the loaded state (the third-place section only renders once the
    // snapshot resolves, replacing the loading skeletons).
    const thirdPlace = await screen.findByRole("region", {
      name: "Best third-place ranking",
    });
    const bracket = screen.getByRole("region", { name: "Knockout bracket" });
    const groups = screen.getByRole("region", { name: "Group tables" });
    const disclosure = screen.getByRole("region", {
      name: "Rules and data source disclosure",
    });

    // Sections appear in the PRD-mandated vertical order.
    expect(bracket.compareDocumentPosition(thirdPlace)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(thirdPlace.compareDocumentPosition(groups)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(groups.compareDocumentPosition(disclosure)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders the data-source disclosure and footer", async () => {
    renderApp(fixtureSource());

    expect(
      await screen.findByText(/ESPN is the only data source/i),
    ).toBeInTheDocument();

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(/Unofficial World Cup 2026 dashboard/i);
    expect(footer).toHaveTextContent(/Not affiliated with FIFA or ESPN/i);
  });

  it("renders normalized snapshot data through the rules engine", async () => {
    renderApp(fixtureSource());

    // A real knockout match card (M73) from the bracket topology, rendered only
    // once the snapshot is composed through the rules engine (loaded state).
    expect(await screen.findByText("M73")).toBeInTheDocument();
    // The live indicator derived from the two in-progress fixture matches.
    expect(screen.getAllByText(/live/i).length).toBeGreaterThan(0);
  });

  it("triggers another fetch on manual refresh (no reload)", async () => {
    const getSnapshot = vi.fn(() => Promise.resolve(liveGroupSecond));
    renderApp({ getSnapshot });

    // Wait for the loaded state so the initial fetch has settled (an in-flight
    // refetch would otherwise be deduped).
    await screen.findByRole("region", { name: "Best third-place ranking" });
    expect(getSnapshot).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: /refresh data/i }));

    await waitFor(() => expect(getSnapshot).toHaveBeenCalledTimes(2));
  });
});
