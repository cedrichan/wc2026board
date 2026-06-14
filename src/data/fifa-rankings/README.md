# FIFA Rankings Data

## Source

`https://api.fifa.com/api/v3/fifarankings/rankings/rankingsbyschedule`

Query parameter: `rankingScheduleId` (identifies the specific ranking edition)

## Editions

### `2026-04`

- `rankingScheduleId`: `FRS_Male_Football_20260401`
- Retrieved: 2026-06-14
- Contains 48 WC2026 participants only; non-qualified nations are excluded

A single edition is bundled. Any group-stage tie that cannot be resolved by the April 2026 ranking is marked `Provisional` per the diagnostic metadata spec.

## teamId vs fifaCode

`teamId` equals `fifaCode` in all entries in this dataset. The FIFA API provides only FIFA codes and ranks — no ESPN team IDs. The ESPN adapter (a later task) must cross-reference ESPN team IDs to FIFA codes via `fifaCode`.

## Coverage

Only WC2026 qualified nations are included (48 teams). Non-participants are excluded.
