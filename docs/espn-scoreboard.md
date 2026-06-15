# ESPN FIFA World Cup scoreboard investigation

## Decision

The production data source will make one scoreboard range request:

```text
GET https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200
```

This request was captured on 2026-06-14 and returned all 104 tournament
fixtures in one response. No summary/event-detail request is currently needed:
the scoreboard response already contains the fields needed for match identity,
teams, kickoff, status, clock, score, winner, venue, and the observed goal/card
details.

ESPN is the sole runtime provider. This investigation does not authorize a
fallback provider, proxy, or reliance on ESPN's standings order.

## Endpoints and parameters

| Endpoint | Parameters | Observed behavior | Production dependency |
| --- | --- | --- | --- |
| `/apis/site/v2/sports/soccer/fifa.world/scoreboard` | `dates=20260611-20260719`, `limit=200` | Returned 104 unique events covering the complete tournament range. | Yes |
| `/apis/site/v2/sports/soccer/fifa.world/scoreboard` | `dates=20260611` | Returned the two opening-day matches, whose UTC kickoffs fall on 2026-06-11 and 2026-06-12. A date value is therefore not a strict UTC calendar-day filter. | No |
| `/apis/site/v2/sports/soccer/fifa.world/summary` | `event=760421` | Returned richer commentary, key events, standings, rosters, media, and `meta.lastUpdatedAt`. It is much larger and has a different schema from scoreboard. | No |

`dates` accepts a compact inclusive range in `YYYYMMDD-YYYYMMDD` form.
`limit=200` prevents the 104-match response from being truncated by a lower
default limit. The exact truncation/default behavior was not tested.

The response-body captures do not preserve HTTP headers. Wildcard CORS
(`Access-Control-Allow-Origin: *`) has been observed during investigation, but
browser CORS from the deployed origin remains a release validation item.

## Range coverage

The captured range contains 104 unique `event.id` values and 104 matching
`competition.id` values. Every event contains exactly one competition.

| `season.slug` | Count |
| --- | ---: |
| `group-stage` | 72 |
| `round-of-32` | 16 |
| `round-of-16` | 8 |
| `quarterfinals` | 4 |
| `semifinals` | 2 |
| `3rd-place-match` | 1 |
| `final` | 1 |

The range covers kickoffs from `2026-06-11T19:00Z` through
`2026-07-19T19:00Z`. ESPN does not expose FIFA match numbers such as `M73` in
the captured fields, so the application must continue to use local bracket
topology rather than infer match numbers from ESPN order or IDs.

IDs were internally consistent between the captured range, date, and summary
responses. That is not evidence that IDs are permanently stable; temporal ID
stability remains a release validation item.

## Observed fields and variability

The scoreboard response exposes these adapter-relevant structures:

- `event.id`, `date`, `season.slug`, `status`, and one `competition`
- `competition.id`, `date`, `startDate`, `timeValid`, `status`,
  `altGameNote`, `venue`, `competitors`, `details`, `wasSuspended`, and
  `playByPlayAvailable`
- competitor `id`, `homeAway`, `winner`, optional `advance`, string `score`,
  and team `id`, abbreviation, display name, and flag/logo URL
- status clock, display clock, optional period, and type fields including
  `id`, `name`, `state`, and `completed`
- venue ID, name, city, and country
- detail type, clock, team, score value, card/goal flags, shootout flag, and
  involved athlete IDs

Observed variability and cautions:

- Scheduled matches have string scores of `"0"` even before kickoff. Status
  must determine whether a score exists; the adapter must not display these as
  real `0-0` scores.
- `status.period` is absent on scheduled events.
- `competition.details` is an empty array on scheduled events and populated
  during/after observed matches.
- `advance` is absent on most competitors and appears on only some completed
  group matches. It must be treated as optional and not as bracket topology.
- All captured events had competition venue data and all captured competitors
  had logo URLs. Missing venue and logo behavior remains unobserved.
- No source timestamp exists in the scoreboard response. The unused summary
  response had `meta.lastUpdatedAt`.
- The top-level `provider` object and odds, broadcasts, links, statistics,
  articles, commentary, rosters, and other display metadata are unnecessary
  for the MVP and were removed from captured fixtures.

Observed scoreboard detail types include goals, headed goals, a volley goal,
own goals, scored penalties during normal play, yellow cards, and direct red
cards. A second-yellow dismissal was not distinguishable in this capture.

## Observed and unobserved states

The 2026-06-14 range capture contained:

| ESPN status | Count | Focused fixture event |
| --- | ---: | --- |
| `STATUS_FULL_TIME` | 10 | `760415` |
| `STATUS_HALFTIME` | 1 | `760423` |
| `STATUS_SCHEDULED` | 93 | `760424` |

The following required states were not observed and must not be treated as
validated: pre-match distinct from scheduled, first half, second half, extra
time, extra-time break, penalty shootout, finished after extra time, finished
after penalties, postponed, suspended, cancelled, and unknown status.

Also unobserved are shootout score representation, final penalty numbers,
second-yellow representation, missing team flags, missing venues, empty event
arrays, malformed/changed schemas, official results for interrupted matches,
and complete disciplinary coverage.

## Captured fixtures

- `src/sources/espn/__fixtures__/scoreboard-range-20260611-20260719.json`
  preserves all 104 events for range, identity, stage, kickoff, team, venue,
  status, and score validation.
- `src/sources/espn/__fixtures__/scoreboard-observed-states-20260614.json`
  preserves one scheduled, halftime, and full-time event, including minimized
  observed goal/card details.

These are field-minimized projections of captured ESPN responses, not invented
payloads and not byte-for-byte archives. They retain the original response
shape needed by future ESPN schema/adapter tests while removing betting data,
broadcast data, links, player profile metadata, statistics, articles, and
other unnecessary raw metadata. They contain no credentials or secrets.

Do not fabricate captured ESPN fixtures for the unobserved states. Synthetic
contract fixtures, if later approved, must be explicitly labeled synthetic and
kept distinct from these captures.

## Risks and release validation

- ESPN's endpoint and schema are undocumented and may change without notice.
- CORS may change and must be tested from the deployed application origin.
- Rate limits and acceptable polling behavior are undocumented. A full raw
  range response was about 804 KB before HTTP compression, so 15-30 second
  polling must be measured in-browser and may require a slower non-live
  interval or conditional requests. Do not add extra date requests.
- ESPN usage terms and public display rights remain unresolved launch risks.
- Team and event ID stability must be checked across later captures.
- All unobserved statuses and optional-field absence must be validated before
  release or handled conservatively as unknown/partial data.
- ESPN ordering, `advance`, and displayed standings are not substitutes for
  local FIFA rules, group calculations, or bracket topology.
