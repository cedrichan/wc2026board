# B001: Scaffold the React application

- **Estimate:** 2-4 hours
- **Dependencies:** None
- **Parallelization:** Start first. B003 may begin once the scaffold runs; B002 can proceed as soon as TypeScript paths are settled.

## Outcome

A strict TypeScript, React, and Vite application with the agreed test toolchain and no second UI library.

## Scope

- Add React, Vite, strict TypeScript, Material UI, Material UI Icons, TanStack Query, date-fns, and Zod.
- Configure Vitest, React Testing Library, Playwright, and lint/typecheck scripts.
- Add a minimal application entry point and test.

## Product Requirements

- Produce a pure static, client-side SPA: no backend, database, SSR, accounts, private API keys, scheduled jobs, or runtime provider selector.
- Use Material UI as the only general-purpose UI library; reserve custom CSS for bracket geometry/grid, horizontal scrolling/snapping, accessibility utilities, and a possible future print layout.
- Include Mock Service Worker or an equivalent fixture mechanism so automated tests never require live ESPN.
- Keep the production architecture compatible with direct browser requests to ESPN and static hosting with HTTPS, compression, immutable assets, SPA routing, and CSP headers.

## Ambiguities / Decisions Required

- Hosting provider and deployment target are explicitly outside the core product requirements. Ask before adding provider-specific deployment configuration.
- The PRD permits a lightweight date library "such as date-fns" and Zod "or equivalent"; ask before substituting different libraries from the named stack.

## Acceptance Criteria

- Development server and production build run successfully.
- `typecheck`, unit-test, and E2E-test scripts exist.
- Material UI is the only general-purpose component library.
