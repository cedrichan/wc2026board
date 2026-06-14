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

## Acceptance Criteria

- Manual refresh works during retry delay.
- Visibility restoration triggers one immediate refresh.
- Failed requests never trigger a secondary provider request.
