# B037: Build loading and error states

- **Estimate:** 3-4 hours
- **Dependencies:** B003, B029
- **Parallelization:** Can run beside all content component work.

## Outcome

The dashboard has structured skeleton, partial-data, cached, stale, and no-cache outage presentations.

## Scope

- Add dimensionally stable bracket and group skeletons.
- Add non-blocking stale/outage alerts with data age and retry.
- Retain static bracket/group placeholders when no snapshot exists.

## Product Requirements

- On initial load, render dimensionally stable bracket/group skeletons and immediately show a valid cached snapshot when available; never use a full-screen spinner.
- For partial data, render every safely normalized field, label missing information unavailable, use FIFA-code avatar fallback for flags, and expose diagnostics.
- During complete ESPN failure with cache, keep cached data and scroll positions visible, show a non-blocking alert with age/manual retry, and continue retrying ESPN only.
- During failure without cache, explain live data is temporarily unavailable while retaining static bracket structure and Group A-L placeholders.
- Treat no-live-match state as normal and show scheduled/completed matches.

## Ambiguities / Decisions Required

- The PRD does not prescribe alert copy, placement, dismissal behavior, or which diagnostics appear publicly. Ask before making those product decisions.

## Acceptance Criteria

- Initial load does not use a full-screen spinner.
- Cached data remains visible during an ESPN outage.
- Missing fields are shown as unavailable and do not crash the page.
