import { useRef } from "react";
import Dashboard from "./components/Dashboard";
import { createRuntimeDataSource } from "./sources/runtime-data-source";
import { createBundledEspnSnapshot } from "./sources/espn/bundled-snapshot";
import type { TournamentDataSource, TournamentSnapshot } from "./domain";

interface AppProps {
  /** Injectable data source; defaults to the runtime source. Tests pass a mock. */
  dataSource?: TournamentDataSource;
  /** Optional startup data, primarily exposed for integration tests. */
  initialSnapshot?: TournamentSnapshot;
}

export default function App({
  dataSource,
  initialSnapshot,
}: AppProps = {}): JSX.Element {
  // Construct the default runtime source once per app instance.
  const defaultSource = useRef<TournamentDataSource>();
  if (dataSource === undefined && defaultSource.current === undefined) {
    defaultSource.current = createRuntimeDataSource();
  }

  const startupSnapshot =
    initialSnapshot ??
    (dataSource === undefined ? createBundledEspnSnapshot() : undefined);

  return (
    <Dashboard
      dataSource={dataSource ?? defaultSource.current!}
      initialSnapshot={startupSnapshot}
    />
  );
}
