// teamId === fifaCode in all current editions; ESPN adapter maps ESPN team IDs to FIFA codes

import type { FifaRankingEntry } from "../../domain/ranking";
import edition202604 from "./2026-04.json";

// Edition registry — most-recent first
const EDITIONS = ["2026-04"] as const;

type EditionId = (typeof EDITIONS)[number];

const editionData: Record<EditionId, readonly FifaRankingEntry[]> = {
  "2026-04": edition202604 as FifaRankingEntry[],
};

// Build per-edition lookup Maps keyed by fifaCode for O(1) lookups
const editionMaps: Record<EditionId, Map<string, FifaRankingEntry>> = {
  "2026-04": new Map(
    (editionData["2026-04"] as FifaRankingEntry[]).map((e) => [e.fifaCode, e])
  ),
};

/**
 * Returns all bundled edition IDs in most-recent-first order.
 */
export function getFifaRankingEditions(): readonly string[] {
  return EDITIONS;
}

/**
 * Returns all entries for the given edition ID, or an empty array if the
 * edition is not found or contains no data.
 */
export function getFifaRankingEdition(editionId: string): readonly FifaRankingEntry[] {
  if (!(editionId in editionData)) {
    return [];
  }
  return editionData[editionId as EditionId];
}

/**
 * Looks up a ranking entry by FIFA code within the specified edition.
 * Returns undefined if the code or edition is not found.
 */
export function lookupByFifaCode(
  fifaCode: string,
  editionId: string
): FifaRankingEntry | undefined {
  if (!(editionId in editionMaps)) {
    return undefined;
  }
  return editionMaps[editionId as EditionId].get(fifaCode);
}

/**
 * Looks up a ranking entry by team ID within the specified edition.
 * Currently identical to lookupByFifaCode since teamId === fifaCode in all
 * current editions. The ESPN adapter will map ESPN team IDs to FIFA codes
 * before calling this function.
 */
export function lookupByTeamId(
  teamId: string,
  editionId: string
): FifaRankingEntry | undefined {
  return lookupByFifaCode(teamId, editionId);
}

/**
 * Returns the IDs of editions that are empty (i.e., have no ranking data).
 * These need to be populated before release.
 */
export function getMissingEditions(): string[] {
  return EDITIONS.filter((id) => editionData[id].length === 0);
}
