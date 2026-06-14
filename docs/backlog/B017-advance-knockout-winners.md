# B017: Advance finished knockout winners

- **Estimate:** 3-4 hours
- **Dependencies:** B005
- **Parallelization:** Can run beside the group-ranking workstream.

## Outcome

A pure advancement function populates future bracket slots only from final knockout results.

## Scope

- Resolve winners for normal time, extra time, and penalties.
- Follow configured winner-feed targets.
- Preserve `Winner Mxx` placeholders for live or unresolved matches.

## Acceptance Criteria

- Finished winners populate the correct future side.
- Live leaders never populate future-round slots.
- Tests cover normal time, extra time, shootout, and missing winner data.
