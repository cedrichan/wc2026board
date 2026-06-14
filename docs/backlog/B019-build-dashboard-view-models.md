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

## Acceptance Criteria

- UI-facing models contain no raw ESPN fields.
- Match cards can distinguish null, zero, normal, extra-time, and penalty scores.
- Unresolved and provisional states remain explicit.
