# Annex C — Data Provenance

## Source

**Document:** FIFA World Cup 2026 Competition Regulations, Annex C  
**Publisher:** Fédération Internationale de Football Association (FIFA)  
**Expected URL:** https://digitalhub.fifa.com/m/f99da4f73212220/original/FIFA-World-Cup-2026-Competition-Regulations.pdf

## Status

The `third-place-assignments.json` file **must be populated** from the official
FIFA WC2026 Competition Regulations document before the application can perform
third-place bracket assignments.

The file contains 495 rows imported from Wikipedia's transcription of Annex C
(see source below). All structural invariants pass.

## Import Instructions

1. Obtain the official FIFA WC2026 Competition Regulations PDF from the FIFA
   Digital Hub (link above) or from the official FIFA website.
2. Locate Annex C, which contains a table mapping each of the C(12,8) = 495
   combinations of 8 qualifying groups to 8 Round-of-32 slot assignments.
3. Transcribe all 495 rows into `third-place-assignments.json` using the
   format described below.
4. Record the document version and retrieval date in this provenance file.
5. Run `npm test` to confirm all structural validation tests pass.

## Data Format

Each row in `third-place-assignments.json` must have the shape:

```json
{
  "qualifyingGroups": "ABCDEFGH",
  "slots": {
    "1A": "C",
    "1B": "D",
    "1D": "A",
    "1E": "B",
    "1G": "F",
    "1I": "E",
    "1K": "H",
    "1L": "G"
  }
}
```

- `qualifyingGroups`: Exactly 8 letters from A–L, sorted alphabetically, joined
  without separators.
- `slots`: Exactly the 8 keys `1A`, `1B`, `1D`, `1E`, `1G`, `1I`, `1K`, `1L`.
  Each value is the group letter of the third-place team assigned to that slot.
  The value must appear in `qualifyingGroups`, and all 8 slot values must be
  distinct.

## Invariants

The structural validation tests in `third-place-assignments.test.ts` enforce:

1. Exactly 495 rows total.
2. All `qualifyingGroups` keys are unique.
3. Each key is exactly 8 characters, all valid group letters (A–L), sorted
   alphabetically, with no duplicate letters within the key.
4. Every row has exactly the 8 required slot keys.
5. Every slot value is a valid group letter (A–L).
6. Every slot value appears in the row's `qualifyingGroups`.
7. Slot values within each row are unique (each group assigned exactly once).

## Import Date

Imported: 2026-06-14 from Wikipedia template above. 495 rows, all integrity checks pass.

## Notes

- The 2026 format is new (48 teams, 12 groups). This is the first WC edition
  with this structure. Prior editions (2018, 2022) had 32 teams, 8 groups, and
  a different Annex C format.
- The 8 match slots where third-place teams appear oppose the winners of groups
  A, B, D, E, G, I, K, and L respectively.
- A group winner never faces a third-place team from the same group (this is
  enforced by the Annex C table design).
