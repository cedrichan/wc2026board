import type { GroupId } from "./common";

export interface Team {
  // Stable internal identifier; survives display-name changes in the source
  id: string;
  // 3-letter FIFA country code, e.g. "USA", "BRA"
  fifaCode: string;
  // Full official team name, e.g. "United States of America"
  name: string;
  // Abbreviated name for space-constrained displays, e.g. "USA"
  shortName: string;
  // Group the team was drawn into for the group stage
  group: GroupId;
  // URL to a flag image; absent if the source did not provide one
  flagUrl?: string;
}

// Adapter-level normalization may discover a stable team identity before all
// display and tournament-placement fields are available.
export interface PartialTeam {
  id: string;
  fifaCode?: string;
  name?: string;
  shortName?: string;
  group?: GroupId;
  flagUrl?: string;
}
