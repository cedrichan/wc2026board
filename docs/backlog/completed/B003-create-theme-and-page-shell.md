# B003: Create theme and page shell

- **Estimate:** 2-4 hours
- **Dependencies:** B001
- **Parallelization:** Can run beside B002 and all static-data tasks.

## Outcome

A Material UI theme and responsive one-page shell containing the required dashboard sections.

## Scope

- Configure theme colors, typography, spacing, breakpoints, and focus styles.
- Add semantic placeholders for header, bracket, third-place table, group strip, disclosure, and footer.
- Add the application-level query and theme providers.

## Product Requirements

- Arrange sections in this exact vertical order: header/data status, knockout bracket, best third-place ranking, group tables, compact rules/data-source disclosure, footer.
- Target WCAG 2.2 AA with visible focus, readable text, and qualification/status treatments that do not depend on color alone.
- Use Material UI theme tokens and components for visible surfaces and controls; do not add another general-purpose UI library.
- Establish responsive behavior for desktop, tablet, and mobile while keeping the dashboard understandable without a second route, modal, hamburger menu, or primary navigation.
- Keep the shell compatible with structured skeletons and non-blocking alerts rather than a full-screen loading spinner.

## Ambiguities / Decisions Required

- The PRD does not specify brand colors, typography choices, exact breakpoints, footer content, or disclosure copy. Ask before making choices that imply official FIFA branding or licensing.
- Light/dark appearance control is optional. Ask whether it is in scope before adding the control or theme persistence.

## Acceptance Criteria

- Required sections render in product-specified order.
- Shell works at desktop and mobile widths.
- No primary navigation, hamburger menu, modal, or second route is introduced.
