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

## Acceptance Criteria

- A single score change does not rerender every match card.
- No unnecessary date ranges or duplicate ESPN calls are observed.
- Findings and any remaining LCP/mobile risks are documented.
