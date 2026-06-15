import type { GroupId } from "./common";

export interface Team {
  id: string;
  fifaCode: string;
  name: string;
  shortName: string;
  group: GroupId;
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
