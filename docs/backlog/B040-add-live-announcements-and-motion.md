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

## Acceptance Criteria

- Polling without a meaningful change produces no announcement.
- Qualification changes and important score changes are announced politely.
- Reduced-motion mode disables score and row-change animation.
