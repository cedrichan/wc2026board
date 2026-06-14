export interface FifaRankingEntry {
  teamId: string;
  fifaCode: string;
  rank: number;
}

export interface FifaRankingEdition {
  // Edition identifier, e.g. "2026-04"
  editionId: string;
  publishedDate: string;
  entries: FifaRankingEntry[];
}

export interface ThirdPlaceAssignment {
  // Alphabetically sorted group letters of the eight qualifying third-place teams
  // joined without separator, e.g. "ABCDEFGH"
  qualifyingGroups: string;
  // Maps each group-winner slot to the third-place team's group letter
  slots: {
    "1A": string;
    "1B": string;
    "1D": string;
    "1E": string;
    "1G": string;
    "1I": string;
    "1K": string;
    "1L": string;
  };
}
