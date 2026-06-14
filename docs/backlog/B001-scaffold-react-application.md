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

## Acceptance Criteria

- Development server and production build run successfully.
- `typecheck`, unit-test, and E2E-test scripts exist.
- Material UI is the only general-purpose component library.
