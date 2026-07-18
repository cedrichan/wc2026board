import { useEffect, useState } from "react";
import { deriveStaleLabel } from "../polling/policies";
import { useTournamentData } from "./useTournamentData";
import type { TournamentDataSource, TournamentSnapshot } from "../domain";

export type DashboardDataStatus =
  | "initial-loading"
  | "fresh"
  | "refreshing"
  | "stale"
  | "partial"
  | "error";

export interface DashboardDataState {
  status: DashboardDataStatus;
  snapshot: TournamentSnapshot | null;
  isLoading: boolean;
  isRefreshing: boolean;
  fetchedAt: Date | null;
  staleLabel: string | undefined;
  warnings: readonly string[];
  error: Error | null;
  /** Manually trigger an ESPN refresh; deduped against in-flight requests. */
  refresh: () => void;
}

function isFullyValid(snapshot: TournamentSnapshot): boolean {
  return (
    snapshot.diagnostics.warnings.length === 0 &&
    snapshot.diagnostics.missingFields.length === 0
  );
}

export function useDashboardData(
  dataSource: TournamentDataSource,
  initialSnapshot?: TournamentSnapshot,
): DashboardDataState {
  const query = useTournamentData(dataSource, initialSnapshot);
  const [lastValidatedSnapshot, setLastValidatedSnapshot] =
    useState<TournamentSnapshot | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (query.data !== undefined) {
      setFetchedAt(new Date());
      if (isFullyValid(query.data)) {
        setLastValidatedSnapshot(query.data);
      }
    }
  }, [query.data]);

  const now = new Date();

  // Keep the bundled startup snapshot available if the first network request
  // fails before TanStack Query has a successful response to cache.
  const snapshot =
    lastValidatedSnapshot ?? query.data ?? initialSnapshot ?? null;

  const staleLabel =
    snapshot !== null ? deriveStaleLabel(snapshot, now) : undefined;

  const currentDataIsPartial =
    query.data !== undefined && !isFullyValid(query.data);

  let status: DashboardDataStatus;
  if (query.isLoading && snapshot === null) {
    status = "initial-loading";
  } else if (query.isError && snapshot === null) {
    status = "error";
  } else if (query.isFetching && snapshot !== null) {
    status = "refreshing";
  } else if (currentDataIsPartial && lastValidatedSnapshot === null) {
    // First response was partial; showing it since there's no better data
    status = "partial";
  } else if (currentDataIsPartial && lastValidatedSnapshot !== null) {
    // Showing last-validated snapshot because fresh response was partial
    status = "stale";
  } else if (staleLabel !== undefined) {
    status = "stale";
  } else {
    status = "fresh";
  }

  return {
    status,
    snapshot,
    isLoading: status === "initial-loading",
    isRefreshing: status === "refreshing",
    fetchedAt,
    staleLabel,
    warnings: snapshot?.diagnostics.warnings ?? [],
    error: query.error,
    refresh: query.refetch,
  };
}
