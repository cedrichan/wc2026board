# B048: Prepare release validation

- **Estimate:** 3-4 hours
- **Dependencies:** B042, B043, B044, B045, B046, B047
- **Parallelization:** Final convergence task; checklist subsections can be assigned in parallel before sign-off.

## Outcome

A repeatable release checklist and static-hosting configuration cover the PRD's production validation requirements.

## Scope

- Add static-hosting build/deploy configuration and CSP documentation.
- Convert ESPN CORS, fixture coverage, live-state, ID stability, polling, rights, official-standing comparison, and accessibility checks into a dated checklist.
- Record owners, evidence links, and unresolved launch risks.

## Product Requirements

- Cover every PRD release-checklist item: deployed-origin/CORS, date-range and full fixture coverage, live/full-time/extra-time/penalty behavior, disciplinary coverage, IDs, polling/rate behavior, rights, sole-provider production configuration, official-standing comparison, Annex C validation, simultaneous final matches, malformed/empty/outage states, stale/cache behavior, accessibility, mobile scrolling, and CSP.
- Record each item as pass, fail, or not yet verifiable with date, owner, evidence link, and launch impact.
- Provide reproducible static build/deploy instructions with HTTPS, SPA routing, compression, immutable asset caching, and CSP where supported.
- Treat unresolved ESPN terms/display-rights, browser CORS, incomplete fixture/state validation, incorrect official standings, security, and accessibility risks as explicit launch risks.
- Do not silently mark blockers complete and do not introduce a backend/proxy or alternate provider to bypass a failed validation.

## Ambiguities / Decisions Required

- Hosting platform, custom domain, checklist owners, risk-acceptance authority, launch-blocker policy, and acceptable ESPN usage/display-rights decision are not specified. Ask for these before sign-off.
- Operational monitoring during live matches is required by the delivery phase but not defined. Ask for the owner, tooling, and response procedure.

## Acceptance Criteria

- Production build/deploy instructions are reproducible.
- Every PRD release-checklist item has a pass/fail/not-yet-verifiable result location.
- Launch blockers and ESPN usage/display-rights risks cannot be silently marked complete.
