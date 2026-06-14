import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { describe, it, expect } from "vitest";
import App from "./App";
import theme from "./theme";

function renderApp() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("App", () => {
  it("renders the dashboard heading", () => {
    renderApp();
    expect(
      screen.getByRole("heading", { name: /world cup 2026/i }),
    ).toBeInTheDocument();
  });

  it("renders all required page sections in order", () => {
    renderApp();
    const sections = screen.getAllByRole("region");
    const sectionLabels = sections.map((s) => s.getAttribute("aria-label"));
    expect(sectionLabels).toContain("Knockout bracket");
    expect(sectionLabels).toContain("Best third-place ranking");
    expect(sectionLabels).toContain("Group tables");
  });

  it("renders footer", () => {
    renderApp();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
