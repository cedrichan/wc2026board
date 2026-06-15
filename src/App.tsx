import { useRef } from "react";
import Dashboard from "./components/Dashboard";
import { createRuntimeDataSource } from "./sources/runtime-data-source";
import type { TournamentDataSource } from "./domain";

interface AppProps {
  /** Injectable data source; defaults to the runtime source. Tests pass a mock. */
  dataSource?: TournamentDataSource;
}

export default function App({ dataSource }: AppProps = {}): JSX.Element {
  // Construct the default runtime source once per app instance.
  const defaultSource = useRef<TournamentDataSource>();
  if (dataSource === undefined && defaultSource.current === undefined) {
    defaultSource.current = createRuntimeDataSource();
  }

  return <Dashboard dataSource={dataSource ?? defaultSource.current!} />;
}
