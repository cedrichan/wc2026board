# B027: Integrate refresh and retry behavior

- **Estimate:** 3-4 hours
- **Dependencies:** B025, B026
- **Parallelization:** Can run beside B028 and component work.

## Outcome

TanStack Query manages ESPN fetching, polling, retries, cancellation, visibility behavior, and manual refresh.

## Scope

- Apply dynamic polling and bounded retry policies.
- Pause frequent polling while hidden and refresh immediately on visibility.
- Prevent overlapping and duplicate requests.

## Product Requirements

- Use TanStack Query to fetch only ESPN, deduplicate identical refresh-cycle requests, apply dynamic intervals, and reset retry delay after success.
- Pause frequent polling while hidden, trigger exactly one immediate refresh on visibility restoration, and avoid overlapping requests.
- Cancel obsolete requests when a newer request starts and pass `AbortSignal` through the source.
- Keep the last successful data visible on failure and allow manual refresh at any time, including during delayed retries.
- After tournament completion, fetch only on page load or manual refresh.

## Ambiguities / Decisions Required

- The PRD says to prevent overlap and cancel obsolete requests when a newer request starts; ask which request wins if manual refresh occurs during an active automatic request.
- Ask whether low-frequency outside-window polling should also pause in hidden tabs; only "frequent polling" is explicitly required to pause.

## Acceptance Criteria

- Manual refresh works during retry delay.
- Visibility restoration triggers one immediate refresh.
- Failed requests never trigger a secondary provider request.
