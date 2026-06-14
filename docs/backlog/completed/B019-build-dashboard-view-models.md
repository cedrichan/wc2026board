# B019: Build dashboard view models

- **Estimate:** 3-4 hours
- **Dependencies:** B006, B018
- **Parallelization:** Can run beside ESPN adapter and early component work.

## Outcome

Provider-independent view models for the bracket, group cards, third-place table, stage, and live-state summary.

## Scope

- Compose normalized snapshot and rules-engine output.
- Format stable semantic states without React dependencies.
- Include data required for labels, tooltips, accessibility text, and qualification treatments.

## Product Requirements

- Produce provider-independent models for tournament stage, live summary, header timestamps/state, all bracket matches, all 12 groups, and all 12 third-place rows.
- Include participant state/source explanations, match status/clock, selected-timezone kickoff, venue/city availability, score phases, penalties, live-ahead, and advancing-team state.
- Include qualification labels that do not rely on color, provisional/unresolved explanations, active tiebreakers, missing-data labels, and accessible names.
- Preserve stable identities so live updates do not reset focus/scroll or rerender every card.
- Never inspect or expose raw ESPN fields, provider HTML, or unsafe URLs.

## Ambiguities / Decisions Required

- **Approved decision:** Derive stage in this order: tournament complete when the
  final is finished; otherwise the highest-progress live round; otherwise the
  earliest upcoming scheduled/pre-match round; otherwise the highest-progress
  finished round; otherwise unknown.
- **Approved decision:** User-facing date/time formatting belongs in view models.
  Keep UTC ISO values alongside formatted labels and inject locale, display mode,
  and current time for deterministic tests.

## Acceptance Criteria

- UI-facing models contain no raw ESPN fields.
- Match cards can distinguish null, zero, normal, extra-time, and penalty scores.
- Unresolved and provisional states remain explicit.
