# B043: Audit rendering and bundle performance

- **Estimate:** 3-4 hours
- **Dependencies:** B038
- **Parallelization:** Can run beside accessibility, responsive, security, and test tasks.

## Outcome

Measured improvements keep scrolling smooth and avoid unnecessary rerenders or oversized initial JavaScript.

## Scope

- Profile score updates and memoize stable match/group subtrees where useful.
- Inspect production bundle and lazy-load nonessential rules/help content.
- Check image sizing and duplicate network requests.

## Product Requirements

- Keep horizontal scrolling smooth on mid-range mobile hardware and prevent a single score update from rerendering every match card.
- Target LCP below 2.5 seconds on typical broadband after static assets are cached.
- Keep initial JavaScript appropriate for one dashboard page and lazy-load nonessential rules/help content.
- Use small optimized flag assets; avoid full-resolution artwork.
- Deduplicate ESPN requests through TanStack Query, avoid unnecessary date-range prefetching, and document remaining LCP/mobile risks.

## Ambiguities / Decisions Required

- The PRD does not define a bundle-size budget, test device/browser, uncached LCP target, or quantitative smooth-scrolling threshold. Ask for measurement conditions before treating the audit as pass/fail.

## Acceptance Criteria

- A single score change does not rerender every match card.
- No unnecessary date ranges or duplicate ESPN calls are observed.
- Findings and any remaining LCP/mobile risks are documented.
