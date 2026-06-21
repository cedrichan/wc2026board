# World Cup 2026 Dashboard

A live, read-only single-page application that displays the full state of the FIFA World Cup 2026 tournament on one page.

## What it shows

- **Knockout bracket** — left-to-right from Round of 32 through the Final, with live scores and projected participants during the group stage
- **Group tables** — all 12 groups in a horizontally scrolling row, updated live as matches progress
- **Best third-place ranking** — all 12 third-place teams ranked against each other, with a clear qualification line at position 8
- **Data freshness** — last-refresh timestamp, stale-data warnings, and manual refresh control

Data is fetched directly from ESPN's public FIFA World Cup scoreboard endpoint. No backend, no database, no accounts.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite |
| UI | Material UI v6 |
| Data fetching | TanStack Query |
| Schema validation | Zod |
| Unit tests | Vitest + React Testing Library |
| E2E tests | Playwright |

## Development

```sh
npm install
npm run dev          # start dev server
npm test             # run unit tests
npm run test:e2e     # run Playwright tests
npm run typecheck    # type-check without emitting
npm run lint         # lint src/
npm run build        # production build → dist/
```

## Architecture

```
ESPN public JSON
  → EspnScoreboardDataSource   # ESPN-specific adapter; isolates raw schema
  → Zod runtime validation
  → TournamentSnapshot          # normalized domain model
  → Rules engine                # pure TypeScript; no React/ESPN dependencies
  → Bracket + group view models
  → React UI (Material UI)
```

The qualification and tiebreaker logic lives in a standalone rules engine and follows the official 2026 FIFA tournament regulations. It covers:

- Group-stage head-to-head tiebreakers (including subset re-application)
- Conduct scoring (yellow/red card deductions)
- FIFA ranking as final tiebreaker
- Best third-place team ranking across all 12 groups
- Annex C bracket-slot assignment for the eight qualifying third-place teams

## Data reliability

When an ESPN request fails the app retains the last successful snapshot, marks it stale, and continues retrying with exponential backoff. ESPN is the only runtime data source; no automatic fallback occurs.

## Docs

- [`docs/product.md`](docs/product.md) — product requirements and acceptance criteria
- [`docs/frontend.md`](docs/frontend.md) — frontend architecture and implementation constraints
- [`docs/data-providers.md`](docs/data-providers.md) — ESPN endpoint details
