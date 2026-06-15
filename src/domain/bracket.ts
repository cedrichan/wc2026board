import type { GroupId, TournamentRound } from "./common";

// Describes where a bracket slot's participant comes from
export type SlotSource =
  | { type: "GROUP_WINNER"; group: GroupId }
  | { type: "GROUP_RUNNER_UP"; group: GroupId }
  | { type: "THIRD_PLACE"; groups: string }  // slash-separated eligible group letters per Annex C, e.g. "A/B/C/D/F"
  | { type: "MATCH_WINNER"; matchNumber: number }
  | { type: "MATCH_LOSER"; matchNumber: number };

export type ParticipantSlotState =
  | "PLACEHOLDER"  // no team known and no projection is possible yet
  | "PROJECTED"    // team inferred from current standings but not yet confirmed
  | "CONFIRMED"    // team locked in; the source stage is complete
  | "UNRESOLVED"   // multiple candidates exist and cannot be narrowed further
  | "SUPERSEDED";  // was projected, but subsequent results invalidated the projection

export interface ParticipantSlot {
  state: ParticipantSlotState;
  // Set when a team is identified (PROJECTED, CONFIRMED, or SUPERSEDED)
  teamId?: string;
  // True when the team is known but its placement in standings could still change
  provisional?: boolean;
  // Human-readable source label for PLACEHOLDER or UNRESOLVED slots
  label?: string;
  // Human-readable placement source, e.g. "Projected winner of Group E"
  qualificationSource?: string;
  // Explains why no individual team can be shown in an UNRESOLVED slot
  unresolvedReason?: string;
}

export interface BracketMatchDefinition {
  // Sequential match number across the whole tournament
  matchNumber: number;
  // Excludes GROUP_STAGE; this type is only used for knockout fixtures
  round: Exclude<TournamentRound, "GROUP_STAGE">;
  // Tournament rules determining which team fills each side of the match
  homeSource: SlotSource;
  awaySource: SlotSource;
  // Match number that this match's winner feeds into; absent for the Final
  winnerFeedsMatch?: number;
  // Which side of the next match the winner enters
  winnerFeedsSide?: "HOME" | "AWAY";
}

export interface BracketProjectionMatch {
  matchNumber: number;
  round: Exclude<TournamentRound, "GROUP_STAGE">;
  homeParticipant: ParticipantSlot;
  awayParticipant: ParticipantSlot;
}
