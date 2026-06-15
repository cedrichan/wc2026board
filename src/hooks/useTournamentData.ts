import { useQuery } from "@tanstack/react-query";
import { derivePollIntervalMs, retryDelayMs } from "../polling/policies";
import type { TournamentDataSource, TournamentSnapshot } from "../domain";

export interface TournamentQueryState {
  data: TournamentSnapshot | undefined;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTournamentData(
  dataSource: TournamentDataSource,
): TournamentQueryState {
  const query = useQuery({
    queryKey: ["tournament-snapshot"],
    queryFn: ({ signal }) => dataSource.getSnapshot(signal),
    staleTime: Infinity,
    refetchInterval: (query) => {
      const matches = query.state.data?.matches ?? [];
      return derivePollIntervalMs(matches, new Date());
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (failureCount) => failureCount < 10,
    retryDelay: (failureCount) => retryDelayMs(failureCount),
  });

  return {
    data: query.data,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    // TanStack Query dedupes an in-flight refetch, so manual refresh while an
    // automatic retry is pending cannot create an overlapping request.
    refetch: () => {
      void query.refetch();
    },
  };
}
