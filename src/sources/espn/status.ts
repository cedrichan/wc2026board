import type { MatchClock, NormalizedMatchStatus } from "../../domain";

export interface EspnStatusInput {
  name?: string | null;
  description?: string | null;
  detail?: string | null;
  state?: string | null;
  completed?: boolean | null;
  period?: number | null;
  elapsedMinutes?: number | null;
  clock?: number | null;
  displayClock?: string | null;
  type?: {
    name?: string | null;
    description?: string | null;
    detail?: string | null;
    state?: string | null;
    completed?: boolean | null;
  } | null;
}

export interface NormalizedStatus {
  status: NormalizedMatchStatus;
  elapsedMinutes?: number;
  clock?: MatchClock;
  observedStatus: string;
}

const EXACT_STATUS_MAP: Readonly<Record<string, NormalizedMatchStatus>> = {
  SCHEDULED: "SCHEDULED",
  STATUS_SCHEDULED: "SCHEDULED",
  PRE: "PRE_MATCH",
  PRE_MATCH: "PRE_MATCH",
  PREMATCH: "PRE_MATCH",
  STATUS_PREMATCH: "PRE_MATCH",
  FIRST_HALF: "FIRST_HALF",
  STATUS_FIRST_HALF: "FIRST_HALF",
  HALF_TIME: "HALF_TIME",
  HALFTIME: "HALF_TIME",
  STATUS_HALFTIME: "HALF_TIME",
  SECOND_HALF: "SECOND_HALF",
  STATUS_SECOND_HALF: "SECOND_HALF",
  EXTRA_TIME: "EXTRA_TIME",
  STATUS_EXTRA_TIME: "EXTRA_TIME",
  EXTRA_TIME_BREAK: "EXTRA_TIME_BREAK",
  STATUS_EXTRA_TIME_BREAK: "EXTRA_TIME_BREAK",
  PENALTY_SHOOTOUT: "PENALTY_SHOOTOUT",
  PENALTIES: "PENALTY_SHOOTOUT",
  STATUS_PENALTIES: "PENALTY_SHOOTOUT",
  FINISHED: "FINISHED",
  FULL_TIME: "FINISHED",
  FINAL: "FINISHED",
  STATUS_FINAL: "FINISHED",
  STATUS_FULL_TIME: "FINISHED",
  FINISHED_AFTER_EXTRA_TIME: "FINISHED_AFTER_EXTRA_TIME",
  FINAL_AET: "FINISHED_AFTER_EXTRA_TIME",
  STATUS_FINAL_AET: "FINISHED_AFTER_EXTRA_TIME",
  FINISHED_AFTER_PENALTIES: "FINISHED_AFTER_PENALTIES",
  FINAL_PEN: "FINISHED_AFTER_PENALTIES",
  STATUS_FINAL_PEN: "FINISHED_AFTER_PENALTIES",
  POSTPONED: "POSTPONED",
  STATUS_POSTPONED: "POSTPONED",
  SUSPENDED: "SUSPENDED",
  STATUS_SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
  CANCELED: "CANCELLED",
  STATUS_CANCELLED: "CANCELLED",
  STATUS_CANCELED: "CANCELLED",
};

function token(value: string | null | undefined): string {
  return value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "") ?? "";
}

function statusFromPeriod(period: number | null | undefined): NormalizedMatchStatus | undefined {
  if (period === 1) return "FIRST_HALF";
  if (period === 2) return "SECOND_HALF";
  if (period === 3 || period === 4) return "EXTRA_TIME";
  if (period !== undefined && period !== null && period >= 5) return "PENALTY_SHOOTOUT";
  return undefined;
}

export function normalizeEspnStatus(input: EspnStatusInput): NormalizedStatus {
  const observed = [
    input.name,
    input.description,
    input.detail,
    input.state,
    input.type?.name,
    input.type?.description,
    input.type?.detail,
    input.type?.state,
  ]
    .map(token)
    .filter(Boolean);

  for (const value of observed) {
    const exact = EXACT_STATUS_MAP[value];
    if (exact) return withClock(exact, input, observed.join("|"));
  }

  if (observed.includes("IN") || observed.includes("IN_PROGRESS") || observed.includes("STATUS_IN_PROGRESS")) {
    return withClock(statusFromPeriod(input.period) ?? "UNKNOWN", input, observed.join("|"));
  }

  if (input.completed === true || input.type?.completed === true) {
    return withClock("FINISHED", input, observed.join("|"));
  }

  return withClock("UNKNOWN", input, observed.join("|"));
}

function withClock(
  status: NormalizedMatchStatus,
  input: EspnStatusInput,
  observedStatus: string,
): NormalizedStatus {
  const elapsedMinutes =
    typeof input.elapsedMinutes === "number" &&
    Number.isInteger(input.elapsedMinutes) &&
    input.elapsedMinutes >= 0
      ? input.elapsedMinutes
      : undefined;
  const clock: MatchClock = {
    ...(typeof input.clock === "number" && Number.isFinite(input.clock) && input.clock >= 0
      ? { elapsedSeconds: input.clock }
      : {}),
    ...(input.displayClock?.trim() ? { displayValue: input.displayClock.trim() } : {}),
    ...(typeof input.period === "number" && Number.isInteger(input.period) && input.period >= 0
      ? { period: input.period }
      : {}),
  };

  return {
    status,
    elapsedMinutes,
    ...(Object.keys(clock).length ? { clock } : {}),
    observedStatus,
  };
}
