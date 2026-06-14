# B040: Add live announcements and reduced motion

- **Estimate:** 3-4 hours
- **Dependencies:** B034, B038
- **Parallelization:** Can run beside B039, B041-B043, and test completion.

## Outcome

Important live changes are announced politely and visual updates respect reduced-motion preferences.

## Scope

- Add an ARIA live region for meaningful score/qualification changes.
- Deduplicate announcements across polling cycles.
- Add subtle numeric updates and disable motion under reduced-motion preference.

## Product Requirements

- Announce important score and qualification changes politely without announcing every polling cycle or interrupting continuously.
- Deduplicate unchanged information and avoid announcements caused only by timestamp/diagnostic refreshes.
- Support subtle numeric-change animation and avoid aggressive row movement that makes live tables difficult to follow.
- Disable score-change and row-movement animation under `prefers-reduced-motion`.
- Replace superseded bracket projections without animation that could imply an official result.

## Ambiguities / Decisions Required

- "Important" changes, announcement wording, batching interval, and whether live clock changes are announced are unspecified. Ask for these decisions before finalizing announcement logic.
- Ask whether qualification row movement should animate at all; the PRD both permits subtle changes and warns against disruptive movement.

## Acceptance Criteria

- Polling without a meaningful change produces no announcement.
- Qualification changes and important score changes are announced politely.
- Reduced-motion mode disables score and row-change animation.
