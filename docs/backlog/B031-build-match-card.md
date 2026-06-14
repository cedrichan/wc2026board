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

## Product Requirements

- Display FIFA match number, round, selected-timezone kickoff, status, both participants/source slots, flags/fallbacks, and current/final score.
- Display venue or host city when space permits and preserve its availability to assistive technology when visually omitted.
- Render placeholder, projected, confirmed, unresolved, live-ahead, and final advancing states; projected participants require a `Projected` chip and qualification-source tooltip.
- Keep scheduled scores blank, preserve real zero scores, show extra-time state, and display in-progress/final penalties separately from match score.
- Future rounds remain `Winner Mxx` until the preceding match is final; a live leader must not appear as an official future participant.
- Accessible label must include teams/source slots, score availability, status, and kickoff.

## Ambiguities / Decisions Required

- "Venue or host city when space permits" and "subtle currently ahead treatment" are not precisely specified. Ask before choosing omission priority or visual treatment if designs do not settle them.
- Ask how unavailable penalty data should be worded and whether superseded projections receive any transient visual treatment; do not imply an official result.

## Acceptance Criteria

- Scheduled matches show no fabricated zero score; real `0-0` displays.
- Shootouts and extra time display unambiguously.
- Accessible label includes teams, score, status, and kickoff.
