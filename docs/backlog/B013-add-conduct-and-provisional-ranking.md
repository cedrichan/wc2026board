# B013: Add conduct and provisional ranking

- **Estimate:** 3-4 hours
- **Dependencies:** B012
- **Parallelization:** Sequential with group-ranking tasks; can run beside B015 data preparation.

## Outcome

Remaining group ties use overall metrics and conduct while explicitly representing incomplete data.

## Scope

- Apply overall GD and GF after head-to-head exhaustion.
- Calculate documented conduct deductions when event data is complete.
- Mark unresolved orderings provisional when conduct data is incomplete.

## Product Requirements

- After head-to-head criteria/subset reapplication, apply overall group goal difference and then overall group goals scored.
- If still tied, calculate conduct deductions: yellow `-1`, indirect red from two yellows `-3`, direct red `-4`, yellow plus direct red `-5`.
- Count only one applicable deduction per person per match and rank the higher conduct score first.
- When disciplinary coverage is incomplete, calculate what is known, mark affected ordering `Provisional`, record the unresolved conduct criterion, and never assume missing conduct is zero.
- Permit only reviewed, versioned static corrections after an official result is confirmed; never contact another provider at runtime.

## Ambiguities / Decisions Required

- The PRD does not define the event identity/deduplication rules needed to enforce one deduction per person per match, or how to prove ESPN coverage is complete. Ask for these rules before treating conduct as authoritative.
- The static-correction schema, approval process, and location are unspecified. Ask before introducing corrections.

## Acceptance Criteria

- Conduct is never assumed to be zero when unavailable.
- A conduct-resolved tie ranks correctly.
- Diagnostics identify the unresolved criterion and affected teams.
