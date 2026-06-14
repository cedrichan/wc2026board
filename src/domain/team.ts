import type { GroupId } from "./common";

export interface Team {
  id: string;
  fifaCode: string;
  name: string;
  shortName: string;
  group: GroupId;
  flagUrl?: string;
}
