import type { Match, PartialTeam } from "../../domain";

export interface DeduplicationResult<T> {
  values: T[];
  diagnostics: string[];
}

function present(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function stableValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableValue(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function newestFirst(left: Match, right: Match): number {
  const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : Number.NEGATIVE_INFINITY;
  const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : Number.NEGATIVE_INFINITY;
  if (leftTime !== rightTime) return rightTime - leftTime;
  return stableValue(left).localeCompare(stableValue(right));
}

function enrich<T extends object>(preferred: T, candidates: readonly T[]): T {
  const result = { ...preferred } as unknown as Record<string, unknown>;
  for (const candidate of candidates) {
    for (const [key, value] of Object.entries(candidate)) {
      if (!present(result[key]) && present(value)) result[key] = value;
    }
  }
  return result as T;
}

function conflictDiagnostics<T extends object>(
  kind: string,
  id: string,
  values: readonly T[],
  invariantKeys: readonly (keyof T)[],
): string[] {
  return invariantKeys.flatMap((key) => {
    const observed = [...new Set(values.map((value) => stableValue(value[key])).filter((value) => value !== undefined))];
    return observed.length > 1
      ? [`${kind}[${id}] invariant conflict for ${String(key)}: ${observed.sort().join(" vs ")}`]
      : [];
  });
}

function groupById<T extends { id: string }>(values: readonly T[]): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const value of values) {
    const group = result.get(value.id);
    if (group) group.push(value);
    else result.set(value.id, [value]);
  }
  return result;
}

export function deduplicateTeams(teams: readonly PartialTeam[]): DeduplicationResult<PartialTeam> {
  const byId = groupById(teams);
  const diagnostics: string[] = [];
  const values = [...byId.entries()].map(([id, copies]) => {
    const ordered = [...copies].sort((left, right) => stableValue(left).localeCompare(stableValue(right)));
    diagnostics.push(...conflictDiagnostics("teams", id, ordered, ["fifaCode", "group"]));
    return enrich(ordered[0], ordered.slice(1));
  });
  return {
    values: values.sort((left, right) => left.id.localeCompare(right.id)),
    diagnostics: [...new Set(diagnostics)].sort(),
  };
}

export function deduplicateMatches(matches: readonly Match[]): DeduplicationResult<Match> {
  const byId = groupById(matches);
  const diagnostics: string[] = [];
  const values = [...byId.entries()].map(([id, copies]) => {
    const ordered = [...copies].sort(newestFirst);
    diagnostics.push(
      ...conflictDiagnostics("matches", id, ordered, [
        "matchNumber",
        "round",
        "group",
        "kickoffUtc",
        "homeTeamId",
        "awayTeamId",
      ]),
    );
    return enrich(ordered[0], ordered.slice(1));
  });
  return {
    values: values.sort((left, right) => left.matchNumber - right.matchNumber || left.id.localeCompare(right.id)),
    diagnostics: [...new Set(diagnostics)].sort(),
  };
}
