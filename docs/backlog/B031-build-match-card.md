# B031: Build match-card states

- **Estimate:** 3-4 hours
- **Dependencies:** B003, B019
- **Parallelization:** Can run beside B030 and B034-B037.

## Outcome

A Material UI match card renders every participant, score, status, and advancement variant.

## Scope

- Render match number, round, kickoff, venue/city, status, teams/placeholders, flags, and scores.
- Support projected, confirmed, placeholder, live-ahead, and advancing treatments.
- Separate penalties and provide flag fallback.

## Acceptance Criteria

- Scheduled matches show no fabricated zero score; real `0-0` displays.
- Shootouts and extra time display unambiguously.
- Accessible label includes teams, score, status, and kickoff.
