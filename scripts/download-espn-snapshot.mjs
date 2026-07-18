import { writeFile } from "node:fs/promises";

const source =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200";
const snapshotPath =
  new URL("../src/sources/espn/__fixtures__/scoreboard-range-20260611-20260719.json", import.meta.url);
const metadataPath =
  new URL("../src/sources/espn/__fixtures__/scoreboard-range-20260611-20260719.meta.json", import.meta.url);

const response = await fetch(source);
if (!response.ok) {
  throw new Error(`ESPN snapshot download failed with HTTP ${response.status}.`);
}

const payload = await response.json();
if (!Array.isArray(payload.events) || payload.events.length !== 104) {
  throw new Error(
    `Expected 104 ESPN events, received ${String(payload.events?.length)}.`,
  );
}

const capturedAt = new Date().toISOString();
await Promise.all([
  writeFile(snapshotPath, `${JSON.stringify(payload)}\n`),
  writeFile(
    metadataPath,
    `${JSON.stringify({ capturedAt, source }, null, 2)}\n`,
  ),
]);

console.log(`Saved ${payload.events.length} ESPN events captured at ${capturedAt}.`);
