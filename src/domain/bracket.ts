import type { GroupId, TournamentRound } from "./common";

export type SlotSource =
  | { type: "GROUP_WINNER"; group: GroupId }
  | { type: "GROUP_RUNNER_UP"; group: GroupId }
  | { type: "THIRD_PLACE"; groups: string }  // e.g. "A/B/C/D/F"
  | { type: "MATCH_WINNER"; matchNumber: number }
  | { type: "MATCH_LOSER"; matchNumber: number };

// Participant slot state for a bracket entry
export type ParticipantSlotState =
  | "PLACEHOLDER"
  | "PROJECTED"
  | "CONFIRMED"
  | "UNRESOLVED"
  | "SUPERSEDED";

export interface ParticipantSlot {
  state: ParticipantSlotState;
  // Set when a team is identified (PROJECTED, CONFIRMED, or SUPERSEDED)
  teamId?: string;
  // Human-readable source label for PLACEHOLDER or UNRESOLVED slots
  label?: string;
  // Human-readable placement source, e.g. "Projected winner of Group E"
  qualificationSource?: string;
  // Explains why no individual team can be shown in an UNRESOLVED slot
  unresolvedReason?: string;
}

export interface BracketMatchDefinition {
  matchNumber: number;
  round: Exclude<TournamentRound, "GROUP_STAGE">;
  homeSource: SlotSource;
  awaySource: SlotSource;
  // Match number that the winner feeds into
  winnerFeedsMatch?: number;
  winnerFeedsSide?: "HOME" | "AWAY";
}

export interface BracketProjectionMatch {
  matchNumber: number;
  round: Exclude<TournamentRound, "GROUP_STAGE">;
  homeParticipant: ParticipantSlot;
  awayParticipant: ParticipantSlot;
}
