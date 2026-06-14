import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material";
import { describe, it, expect } from "vitest";
import App from "./App";

function renderApp() {
  const queryClient = new QueryClient();
  const theme = createTheme();
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
      screen.getByRole("heading", { name: /world cup 2026 dashboard/i }),
    ).toBeInTheDocument();
  });
});
